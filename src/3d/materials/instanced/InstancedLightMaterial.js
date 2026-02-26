/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Instanced Light Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview GPU-instanced holy radiance material with additive light stacking
 * @module materials/InstancedLightMaterial
 *
 * Uses per-instance attributes for:
 * - Time-offset animation (each instance has unique phase)
 * - Model selection (merged geometry with multiple light model variants)
 * - Trail rendering (main + 3 trail copies per logical element)
 * - Spawn/exit fade transitions
 * - Velocity for motion blur
 *
 * ## Master Parameter: radiance (0-1)
 *
 * | Radiance | Visual                    | Effect              | Example       |
 * |----------|---------------------------|---------------------|---------------|
 * | 0.0      | Soft warm glow            | Gentle warmth       | Candlelight   |
 * | 0.5      | Golden rays emanating     | Purifying presence  | Divine light  |
 * | 1.0      | Blinding brilliance       | Overwhelming purity | Ascension     |
 *
 * ## Visual Model: Holy Radiance
 *
 * Three layers compose the light aesthetic:
 * 1. Core Glow — warm golden base color, NdotV-driven brightness
 * 2. Light Rays — procedural radial rays emanating from object, fresnel-driven
 * 3. Sparkles — sparse white-hot flickers exceeding 1.0 for bloom catchment
 *
 * AdditiveBlending so light ADDS to the scene and stacks naturally
 * (multiple light elements build from golden → white-hot, like fire).
 * Alpha driven by brightness — dark areas invisible, bright areas opaque.
 * No bloom compression — light IS brightness. Let it bloom freely.
 */

import * as THREE from 'three';
import {
    INSTANCED_ATTRIBUTES_VERTEX,
    INSTANCED_ATTRIBUTES_FRAGMENT,
} from '../cores/InstancedShaderUtils.js';
import {
    ANIMATION_TYPES,
    CUTOUT_PATTERNS,
    CUTOUT_BLEND,
    CUTOUT_TRAVEL,
    GRAIN_TYPES,
    GRAIN_BLEND,
    ANIMATION_UNIFORMS_FRAGMENT,
    CUTOUT_PATTERN_FUNC_GLSL,
    CUTOUT_GLSL,
    GRAIN_GLSL,
    createAnimationUniforms,
    setShaderAnimation,
    updateAnimationProgress,
    setGestureGlow,
    setGlowScale,
    setCutout,
    resetCutout,
    setGrain,
    resetGrain,
    resetAnimation,
} from '../cores/InstancedAnimationCore.js';

// ═══════════════════════════════════════════════════════════════════════════════════════
// LIGHT DEFAULTS
// ═══════════════════════════════════════════════════════════════════════════════════════

const LIGHT_DEFAULTS = {
    radiance: 0.5,
    intensity: 1.5,
    opacity: 0.45, // Low for additive stacking — gradual gold→white buildup
    pulseSpeed: 1.0,
    rayIntensity: 0.5,
    sparkleRate: 4.0,
    fadeInDuration: 0.15,
    fadeOutDuration: 0.3,
};

function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Derive visual parameters from radiance level.
 * Higher radiance = brighter core, stronger rays, more sparkles.
 *
 * @param {number} radiance - Master parameter 0-1
 * @param {Object} [overrides] - Optional overrides for individual parameters
 * @returns {Object} Derived parameters
 */
function deriveLightParameters(radiance, overrides = {}) {
    return {
        intensity: overrides.intensity ?? lerp(1.0, 2.5, radiance),
        pulseSpeed: overrides.pulseSpeed ?? lerp(0.5, 2.5, radiance),
        rayIntensity: overrides.rayIntensity ?? lerp(0.2, 0.8, radiance),
        sparkleRate: overrides.sparkleRate ?? lerp(2.0, 8.0, radiance),
    };
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// NOISE GLSL (required by cutout system — snoise must exist)
// ═══════════════════════════════════════════════════════════════════════════════════════

const NOISE_GLSL = /* glsl */ `
float noiseHash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(mix(noiseHash(i), noiseHash(i + vec3(1,0,0)), f.x),
            mix(noiseHash(i + vec3(0,1,0)), noiseHash(i + vec3(1,1,0)), f.x), f.y),
        mix(mix(noiseHash(i + vec3(0,0,1)), noiseHash(i + vec3(1,0,1)), f.x),
            mix(noiseHash(i + vec3(0,1,1)), noiseHash(i + vec3(1,1,1)), f.x), f.y),
        f.z
    );
}

float snoise(vec3 p) {
    return noise(p) * 2.0 - 1.0;
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// INSTANCED VERTEX SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════

const VERTEX_SHADER = /* glsl */ `
// Standard uniforms
uniform float uGlobalTime;
uniform float uFadeInDuration;
uniform float uFadeOutDuration;
uniform float uRadiance;
uniform float uPulseSpeed;

// Arc visibility uniforms (for vortex effects)
uniform int uAnimationType;
uniform float uArcWidth;
uniform float uArcSpeed;
uniform int uArcCount;
uniform float uArcPhase;
uniform float uGestureProgress;
uniform int uRelayCount;
uniform float uRelayArcWidth;
uniform float uRelayFloor;

// Per-instance attributes
${INSTANCED_ATTRIBUTES_VERTEX}

// Varyings to fragment
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vInstancePosition;
varying vec3 vNormal;
varying vec3 vViewDir;
varying float vRandomSeed;
varying float vArcVisibility;
varying float vVerticalGradient;

${NOISE_GLSL}

void main() {
    // ═══════════════════════════════════════════════════════════════════════════════
    // INSTANCING: Calculate local time and fade
    // ═══════════════════════════════════════════════════════════════════════════════

    vLocalTime = uGlobalTime - aSpawnTime;

    // Trail instances have delayed local time
    float trailDelay = max(0.0, aTrailIndex) * 0.05;
    float effectiveLocalTime = max(0.0, vLocalTime - trailDelay);

    // Fade controlled by aInstanceOpacity from AnimationState
    float fadeOut = 1.0;
    if (aExitTime > 0.0) {
        float exitElapsed = uGlobalTime - aExitTime;
        fadeOut = 1.0 - clamp(exitElapsed / uFadeOutDuration, 0.0, 1.0);
    }

    // Trail fade
    vTrailFade = aTrailIndex < 0.0 ? 1.0 : (1.0 - (aTrailIndex + 1.0) * 0.25);
    vInstanceAlpha = fadeOut * aInstanceOpacity * vTrailFade;

    // Pass velocity
    vVelocity = aVelocity;

    // ═══════════════════════════════════════════════════════════════════════════════
    // MODEL SELECTION: Scale non-selected models to zero
    // ═══════════════════════════════════════════════════════════════════════════════

    float modelMatch = step(abs(aModelIndex - aSelectedModel), 0.5);
    vec3 selectedPosition = position * modelMatch;
    vec3 selectedNormal = normal * modelMatch;

    // ═══════════════════════════════════════════════════════════════════════════════
    // TRAIL OFFSET: Position trails behind main along velocity
    // ═══════════════════════════════════════════════════════════════════════════════

    vec3 trailOffset = vec3(0.0);
    if (aTrailIndex >= 0.0 && length(aVelocity.xyz) > 0.001) {
        float trailDistance = (aTrailIndex + 1.0) * 0.05;
        trailOffset = -normalize(aVelocity.xyz) * trailDistance * aVelocity.w;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // LIGHT: Radiant pulse — gentle outward breathing along normal
    // Each instance breathes independently via aRandomSeed phase offset.
    // Subtle displacement (0.02) — enough to feel alive, not enough to deform.
    // ═══════════════════════════════════════════════════════════════════════════════

    float instanceTime = vLocalTime + aRandomSeed * 10.0;
    float breathe = sin(instanceTime * uPulseSpeed + aRandomSeed * 6.28) * 0.02 * uRadiance;

    vPosition = selectedPosition;
    vRandomSeed = aRandomSeed;
    vVerticalGradient = clamp((selectedPosition.y + 0.5) / 1.0, 0.0, 1.0);

    vec3 displaced = selectedPosition + selectedNormal * breathe + trailOffset;

    // Normal transform through instance matrix
    vNormal = normalMatrix * mat3(instanceMatrix) * selectedNormal;

    // ═══════════════════════════════════════════════════════════════════════════════
    // Apply instance matrix for per-instance transforms
    // ═══════════════════════════════════════════════════════════════════════════════
    vec4 instancePosition = instanceMatrix * vec4(displaced, 1.0);

    vec4 worldPos = modelMatrix * instancePosition;
    vWorldPosition = worldPos.xyz;
    vViewDir = normalize(cameraPosition - worldPos.xyz);

    // Instance origin in world space (for trail dissolve)
    vec4 instanceOrigin = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    vInstancePosition = instanceOrigin.xyz;

    // ═══════════════════════════════════════════════════════════════════════════════
    // ARC VISIBILITY (for vortex ring effects)
    // ═══════════════════════════════════════════════════════════════════════════════
    vArcVisibility = 1.0;
    if (aRandomSeed >= 100.0) {
        // Generalized relay: supports arbitrary relay count via uRelayCount
        float encoded = aRandomSeed - 100.0;
        float ringId = floor(encoded / 10.0);
        float instanceArcPhase = encoded - ringId * 10.0;

        float vertexAngle = atan(selectedPosition.y, selectedPosition.x);
        float hw = uRelayArcWidth * 0.5;
        float angleDiff = vertexAngle - instanceArcPhase;
        angleDiff = mod(angleDiff + 3.14159, 6.28318) - 3.14159;
        float arcMask = 1.0 - smoothstep(hw * 0.7, hw, abs(angleDiff));

        float cp = uGestureProgress * float(uRelayCount) * 1.5;
        float d = cp - ringId;
        float relayAlpha = smoothstep(-0.30, 0.05, d) * (1.0 - smoothstep(0.70, 1.05, d));
        vArcVisibility = arcMask * mix(uRelayFloor, 1.0, relayAlpha);
    } else if (uAnimationType == 1) {
        float vertexAngle = atan(selectedPosition.z, selectedPosition.x);
        float arcAngle = uGestureProgress * uArcSpeed * 6.28318 + uArcPhase;
        float halfWidth = uArcWidth * 3.14159;
        float arcSpacing = 6.28318 / float(max(1, uArcCount));

        float maxVis = 0.0;
        for (int i = 0; i < 4; i++) {
            if (i >= uArcCount) break;
            float thisArcAngle = arcAngle + float(i) * arcSpacing;
            float angleDiff = mod(vertexAngle - thisArcAngle + 3.14159, 6.28318) - 3.14159;
            float vis = 1.0 - smoothstep(halfWidth * 0.7, halfWidth, abs(angleDiff));
            maxVis = max(maxVis, vis);
        }
        vArcVisibility = maxVis;
    }

    gl_Position = projectionMatrix * modelViewMatrix * instancePosition;
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// INSTANCED FRAGMENT SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════

const FRAGMENT_SHADER = /* glsl */ `
uniform float uGlobalTime;
uniform float uRadiance;
uniform float uIntensity;
uniform float uOpacity;
uniform float uPulseSpeed;
uniform float uRayIntensity;
uniform float uSparkleRate;
uniform float uBloomThreshold;

// Animation system uniforms (glow, cutout, travel, etc.) from shared core
${ANIMATION_UNIFORMS_FRAGMENT}

// Instancing varyings
${INSTANCED_ATTRIBUTES_FRAGMENT}

varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vInstancePosition;
varying vec3 vNormal;
varying vec3 vViewDir;
varying float vRandomSeed;
varying float vArcVisibility;
varying float vVerticalGradient;

${NOISE_GLSL}
${CUTOUT_PATTERN_FUNC_GLSL}

void main() {
    // Early discard for fully faded instances
    if (vInstanceAlpha < 0.01) discard;

    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewDir);

    // Local time (required by CUTOUT_GLSL and GRAIN_GLSL)
    float localTime = vLocalTime;
    float instanceTime = localTime + vRandomSeed * 10.0;

    // NdotV for fresnel and core intensity
    float NdotV = max(0.0, dot(normal, viewDir));
    float fresnel = pow(1.0 - NdotV, 2.5);

    // ═══════════════════════════════════════════════════════════════════════════════
    // LAYER 1: CORE GLOW — warm golden base, brighter face-on
    //
    // Golden at low radiance, white-gold at high radiance.
    // NdotV drives brightness: face-on = bright core, edges = softer.
    // The decoupled approach from fire: color is always warm (never dark),
    // visibility is controlled by alpha alone.
    // ═══════════════════════════════════════════════════════════════════════════════

    // Radiance-driven color: golden → white-gold
    vec3 warmGold = vec3(1.0, 0.85, 0.4);
    vec3 whiteGold = vec3(1.0, 0.97, 0.88);
    vec3 lightColor = mix(warmGold, whiteGold, uRadiance);

    // Core brightness: face-on bright, edges fade to transparent.
    // Lower floor (0.3 not 0.5) so silhouette edges are dim → soft alpha falloff.
    // Noise breaks up the uniform blob — prevents bloom mip-level banding.
    float brightNoise = noise(vPosition * 4.0 + vec3(instanceTime * 0.5));
    float coreBrightness = (0.3 + NdotV * 0.7) * (0.5 + brightNoise);

    // Gentle breathing pulse
    float pulse = 1.0 + sin(instanceTime * uPulseSpeed) * 0.12;

    vec3 coreGlow = lightColor * coreBrightness * pulse;

    // ═══════════════════════════════════════════════════════════════════════════════
    // LAYER 2: LIGHT RAYS — organic "god rays" emanating from object
    //
    // 5 primary rays with noise-varying width per-ray for organic feel.
    // Per-ray shimmer makes each beam flicker independently.
    // 9 thin secondary filament rays for complexity.
    // Majestic slow rotation. Visible at edges + transition zone.
    // ═══════════════════════════════════════════════════════════════════════════════

    float angle = atan(vPosition.z, vPosition.x);

    // Primary god rays: 5 beams with noise-modulated width
    float rayAngle = angle + instanceTime * 0.2;
    float rayBase = sin(rayAngle * 5.0) * 0.5 + 0.5;

    // Noise varies the sharpening power per-ray — some sharp, some wide
    float edgeNoise = noise(vec3(angle * 2.5, instanceTime * 0.3, vRandomSeed * 5.0));
    float ray = pow(rayBase, 2.0 + edgeNoise * 3.0);

    // Per-ray shimmer: each ray flickers at its own rate
    float shimmerPos = floor(angle * 5.0 / 6.28318) * 7.13;
    float shimmer = 0.7 + 0.3 * sin(instanceTime * 1.5 + shimmerPos);
    ray *= shimmer;

    // Thin secondary filament rays (more numerous, fainter)
    float ray2 = sin(rayAngle * 9.0 + 1.8) * 0.5 + 0.5;
    ray2 = pow(ray2, 5.0) * 0.25;

    float rayPattern = (ray + ray2) * uRayIntensity;

    // Rays visible at edges (fresnel) and core-to-edge transition zone
    float rayMask = fresnel * 0.6 + 0.4;
    vec3 rays = lightColor * 1.3 * rayPattern * rayMask;

    // ═══════════════════════════════════════════════════════════════════════════════
    // LAYER 3: SPARKLES — sparse white-hot flickers for bloom catchment
    //
    // Hash-based: top 3% of surface gets a sparkle.
    // Pure white vec3(1.5) exceeds 1.0 for bloom.
    // Time-quantized so sparkles flicker discretely (not smooth).
    // Multiplied by radiance so low radiance = no sparkles.
    // ═══════════════════════════════════════════════════════════════════════════════

    // Discrete time steps for flickering sparkle (not smooth)
    float sparkleTime = floor(instanceTime * uSparkleRate);
    vec3 sparklePos = vPosition * 30.0 + vec3(sparkleTime * 1.7, sparkleTime * 2.3, sparkleTime * 0.9);
    float sparkleNoise = noiseHash(sparklePos);

    // Top 3% → sparkle
    float sparkleMask = step(0.97, sparkleNoise) * uRadiance;
    vec3 sparkles = vec3(1.5) * sparkleMask;

    // ═══════════════════════════════════════════════════════════════════════════════
    // COMBINE — all layers contribute to brightness
    // ═══════════════════════════════════════════════════════════════════════════════

    vec3 color = (coreGlow + rays + sparkles) * uIntensity * uGlowScale;

    // ═══════════════════════════════════════════════════════════════════════════════
    // ALPHA — brightness-driven (like electricity's bolt-brightness approach)
    //
    // No base glow → dark areas invisible, prevents model silhouette reveal.
    // Wide smoothstep for gradual buildup via additive stacking.
    // ═══════════════════════════════════════════════════════════════════════════════

    float brightness = (coreBrightness * pulse + rayPattern * rayMask + sparkleMask * 2.0);
    // Wide smoothstep range: noise variation maps to a smooth gradient (not binary on/off).
    // Old (0.15, 0.9) collapsed most brightness to alpha≈1.0 → hard edges → bloom banding.
    float alpha = smoothstep(0.2, 1.4, brightness) * uOpacity;

    // Subtle fresnel (0.05 not 0.15) — too much hardens silhouette edges, worsening bloom
    alpha += fresnel * 0.05 * uRadiance;
    alpha = clamp(alpha, 0.0, 1.0);

    // Apply instance alpha (spawn/exit fade + trail fade)
    alpha *= vInstanceAlpha;

    // Apply arc visibility (for vortex/relay effects)
    if (vArcVisibility < 0.999) {
        alpha *= vArcVisibility;
        color *= mix(0.3, 1.0, vArcVisibility);
        if (vArcVisibility < 0.05) discard;
    }

    // Discard invisible pixels
    if (alpha < 0.05) discard;

    // Shared cutout system from InstancedAnimationCore
    ${CUTOUT_GLSL}

    // Grain effect
    ${GRAIN_GLSL}

    gl_FragColor = vec4(color, alpha);
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// MATERIAL FACTORY
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Create an instanced procedural light material (holy radiance)
 *
 * @param {Object} options - Configuration options
 * @param {number} [options.radiance=0.5] - Master parameter (0=candlelight, 0.5=divine, 1=blinding)
 * @param {number} [options.intensity] - Brightness multiplier (derived from radiance if not set)
 * @param {number} [options.opacity=0.45] - Base opacity (low for additive stacking)
 * @param {number} [options.pulseSpeed] - Breathing pulse speed (derived from radiance if not set)
 * @param {number} [options.rayIntensity] - Light ray strength (derived from radiance if not set)
 * @param {number} [options.sparkleRate] - Sparkle flicker rate (derived from radiance if not set)
 * @param {number} [options.fadeInDuration=0.15] - Spawn fade duration (seconds)
 * @param {number} [options.fadeOutDuration=0.3] - Exit fade duration (seconds)
 * @returns {THREE.ShaderMaterial}
 */
export function createInstancedLightMaterial(options = {}) {
    const {
        radiance = LIGHT_DEFAULTS.radiance,
        intensity = null,
        opacity = LIGHT_DEFAULTS.opacity,
        pulseSpeed = null,
        rayIntensity = null,
        sparkleRate = null,
        fadeInDuration = LIGHT_DEFAULTS.fadeInDuration,
        fadeOutDuration = LIGHT_DEFAULTS.fadeOutDuration,
    } = options;

    // Derive radiance-dependent parameters
    const derived = deriveLightParameters(radiance, {
        intensity,
        pulseSpeed,
        rayIntensity,
        sparkleRate,
    });

    const material = new THREE.ShaderMaterial({
        uniforms: {
            // Instancing uniforms
            uGlobalTime: { value: 0 },
            uFadeInDuration: { value: fadeInDuration },
            uFadeOutDuration: { value: fadeOutDuration },
            // Animation uniforms (cutout, glow, etc. from shared core)
            ...createAnimationUniforms(),
            // Light uniforms
            uRadiance: { value: radiance },
            uIntensity: { value: derived.intensity },
            uOpacity: { value: opacity },
            uPulseSpeed: { value: derived.pulseSpeed },
            uRayIntensity: { value: derived.rayIntensity },
            uSparkleRate: { value: derived.sparkleRate },
            uBloomThreshold: { value: 0.85 },
            uRelayCount: { value: 3 },
            uRelayArcWidth: { value: 3.14159 },
            uRelayFloor: { value: 0.0 },
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.FrontSide,
    });

    material.userData.radiance = radiance;
    material.userData.elementalType = 'light';
    material.userData.isProcedural = true;
    material.userData.isInstanced = true;

    return material;
}

/**
 * Update the global time uniform for instanced light material.
 * Also handles gesture progress and glow ramping via shared animation system.
 * @param {THREE.ShaderMaterial} material - Instanced light material
 * @param {number} time - Current global time in seconds
 * @param {number} [gestureProgress=0] - Gesture progress 0-1 (for arc animation)
 */
export function updateInstancedLightMaterial(material, time, gestureProgress = 0) {
    if (material?.uniforms?.uGlobalTime) {
        material.uniforms.uGlobalTime.value = time;
    }
    // Use shared animation system for gesture progress and glow ramping
    updateAnimationProgress(material, gestureProgress);
}

/**
 * Set radiance on existing instanced light material.
 * Updates all radiance-dependent parameters (intensity, pulse, rays, sparkles).
 * @param {THREE.ShaderMaterial} material - Instanced light material
 * @param {number} radiance - New radiance level (0-1)
 */
export function setInstancedLightRadiance(material, radiance) {
    if (!material?.uniforms) return;

    const derived = deriveLightParameters(radiance);
    material.uniforms.uRadiance.value = radiance;
    material.uniforms.uIntensity.value = derived.intensity;
    material.uniforms.uPulseSpeed.value = derived.pulseSpeed;
    material.uniforms.uRayIntensity.value = derived.rayIntensity;
    material.uniforms.uSparkleRate.value = derived.sparkleRate;
    material.userData.radiance = radiance;
}

/**
 * Set per-mascot bloom threshold for light elements.
 * @param {THREE.ShaderMaterial} material - Instanced light material
 * @param {number} threshold - Bloom threshold (0.35 for crystal/heart/rough, 0.85 for moon/star)
 */
export function setInstancedLightBloomThreshold(material, threshold) {
    if (material?.uniforms?.uBloomThreshold) {
        material.uniforms.uBloomThreshold.value = threshold;
    }
}

/**
 * Configure shader animation for light elements.
 * Uses the shared animation system from InstancedAnimationCore.
 * @param {THREE.ShaderMaterial} material - Instanced light material
 * @param {Object} config - Animation config (see InstancedAnimationCore.setShaderAnimation)
 */
export const setInstancedLightArcAnimation = setShaderAnimation;

/**
 * Configure gesture-driven glow ramping for light effects.
 * @param {THREE.ShaderMaterial} material - Instanced light material
 * @param {Object} config - Glow configuration (see InstancedAnimationCore.setGestureGlow)
 */
export function setInstancedLightGestureGlow(material, config) {
    setGestureGlow(material, config);
}

/**
 * Configure cutout effect for light elements.
 * @param {THREE.ShaderMaterial} material - Instanced light material
 * @param {number|Object} config - Cutout strength (0-1) or config object
 */
export function setInstancedLightCutout(material, config) {
    setCutout(material, config);
}

export function setRelay(material, config) {
    if (!material) return;
    if (config.count !== undefined && material.uniforms?.uRelayCount) {
        material.uniforms.uRelayCount.value = config.count;
    }
    if (config.arcWidth !== undefined && material.uniforms?.uRelayArcWidth) {
        material.uniforms.uRelayArcWidth.value = config.arcWidth;
    }
    if (config.floor !== undefined && material.uniforms?.uRelayFloor) {
        material.uniforms.uRelayFloor.value = config.floor;
    }
}

export function resetRelay(material) {
    if (!material) return;
    if (material.uniforms?.uRelayCount) material.uniforms.uRelayCount.value = 3;
    if (material.uniforms?.uRelayArcWidth) material.uniforms.uRelayArcWidth.value = Math.PI;
    if (material.uniforms?.uRelayFloor) material.uniforms.uRelayFloor.value = 0.0;
}

// Re-export animation types and shared functions for convenience
export {
    ANIMATION_TYPES,
    CUTOUT_PATTERNS,
    CUTOUT_BLEND,
    CUTOUT_TRAVEL,
    GRAIN_TYPES,
    GRAIN_BLEND,
    setShaderAnimation,
    setGestureGlow,
    setGlowScale,
    setCutout,
    resetCutout,
    setGrain,
    resetGrain,
    resetAnimation,
};

export default {
    createInstancedLightMaterial,
    updateInstancedLightMaterial,
    setInstancedLightRadiance,
    setInstancedLightBloomThreshold,
    setInstancedLightGestureGlow,
    setInstancedLightCutout,
    setInstancedLightArcAnimation,
    setShaderAnimation,
    setGestureGlow,
    setGlowScale,
    setCutout,
    setGrain,
    ANIMATION_TYPES,
    CUTOUT_PATTERNS,
    CUTOUT_BLEND,
    CUTOUT_TRAVEL,
    GRAIN_TYPES,
    GRAIN_BLEND,
};
