/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Instanced Water Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview GPU-instanced version of ProceduralWaterMaterial
 * @module materials/InstancedWaterMaterial
 *
 * Uses per-instance attributes for:
 * - Time-offset animation (each instance has its own local time)
 * - Model selection (merged geometry with multiple water model variants)
 * - Trail rendering (main + 3 trail copies per logical element)
 * - Spawn/exit fade transitions
 * - Velocity for motion blur
 *
 * This material is designed to work with ElementInstancePool for
 * GPU-efficient rendering of many water elements with a single draw call.
 */

import * as THREE from 'three';
import {
    INSTANCED_ATTRIBUTES_VERTEX,
    INSTANCED_ATTRIBUTES_FRAGMENT,
    createInstancedUniforms
} from './InstancedShaderUtils.js';
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
    resetAnimation
} from './cores/InstancedAnimationCore.js';
import {
    NOISE_GLSL,
    WATER_COLOR_GLSL,
    WATER_FRAGMENT_CORE,
    WATER_ARC_FOAM_GLSL,
    WATER_CUTOUT_FOAM_GLSL,
    WATER_DRIP_ANTICIPATION_GLSL,
    WATER_FLOOR_AND_DISCARD_GLSL,
    lerp3,
    WATER_DEFAULTS
} from './cores/WaterShaderCore.js';

// GLSL code is imported from WaterShaderCore.js

// ═══════════════════════════════════════════════════════════════════════════════════════
// INSTANCED VERTEX SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════

const VERTEX_SHADER = /* glsl */`
// Standard uniforms
uniform float uGlobalTime;
uniform float uFadeInDuration;
uniform float uFadeOutDuration;
uniform float uTurbulence;
uniform float uDisplacementStrength;
uniform float uFlowSpeed;

// Arc visibility uniforms (for vortex effects)
uniform int uAnimationType;      // 0=none, 1=rotating arc
uniform float uArcWidth;         // Arc width in radians
uniform float uArcSpeed;         // Rotations per gesture
uniform int uArcCount;           // Number of visible arcs
uniform float uArcPhase;         // Arc starting angle in radians
uniform float uGestureProgress;  // 0-1 gesture progress
uniform int uRelayCount;         // Number of relay rings
uniform float uRelayArcWidth;   // Relay arc width in radians
uniform float uRelayFloor;

// Per-instance attributes
${INSTANCED_ATTRIBUTES_VERTEX}

// Varyings to fragment
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vInstancePosition;  // Instance origin in world space (for trail dissolve)
varying vec3 vNormal;
varying vec3 vViewDir;
varying float vDisplacement;
varying float vNoiseValue;
varying float vRandomSeed;
varying float vArcVisibility;  // 0-1 visibility based on arc position
varying float vVerticalGradient;  // Normalized vertical position (0=bottom, 1=top) for tip effects
varying vec3 vWorldNormal;   // World-space normal for refraction
varying vec3 vViewPosition;  // View-space position for refraction

${NOISE_GLSL}

void main() {
    // ═══════════════════════════════════════════════════════════════════════════════
    // INSTANCING: Calculate local time and fade
    // ═══════════════════════════════════════════════════════════════════════════════

    vLocalTime = uGlobalTime - aSpawnTime;

    // Trail instances have delayed local time
    float trailDelay = max(0.0, aTrailIndex) * 0.05;
    float effectiveLocalTime = max(0.0, vLocalTime - trailDelay);

    // Fade in/out controlled by aInstanceOpacity from AnimationState
    float fadeIn = 1.0;
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
    // WATER DISPLACEMENT (using local time)
    // ═══════════════════════════════════════════════════════════════════════════════

    vPosition = selectedPosition;
    vRandomSeed = aRandomSeed;

    // Calculate vertical gradient for tip-based effects
    // Normalize Y position to 0-1 range (assuming model centered at y=0)
    float modelHeight = 1.0;  // Water models are typically unit-sized
    vVerticalGradient = clamp((selectedPosition.y + 0.5) / modelHeight, 0.0, 1.0);

    // Animated noise for fluid wobble
    float instanceVariation = aRandomSeed * 0.3;
    vec3 noisePos = selectedPosition * 2.5 + vec3(
        effectiveLocalTime * uFlowSpeed * 0.002 + instanceVariation,
        effectiveLocalTime * uFlowSpeed * 0.001,
        effectiveLocalTime * uFlowSpeed * 0.0015 + instanceVariation
    );
    float noiseValue = fbm4(noisePos);
    vNoiseValue = noiseValue * 0.5 + 0.5;

    // Position-based variation for asymmetric wobble
    float posVariation = snoise(selectedPosition * 3.0 + vec3(aRandomSeed * 10.0)) * 0.4 + 0.8;

    // Primary displacement along normal (fluid bulging)
    float fadeFactor = fadeOut * aInstanceOpacity;
    float baseDisplacement = noiseValue * uDisplacementStrength * (0.4 + uTurbulence * 0.6) * posVariation;

    vec3 displaced = selectedPosition + selectedNormal * baseDisplacement * fadeFactor;

    // Secondary wobble - perpendicular fluid motion
    vec3 perpNoise = selectedPosition * 2.0 + vec3(
        effectiveLocalTime * uFlowSpeed * 0.001,
        effectiveLocalTime * uFlowSpeed * 0.0008,
        0.0
    );
    float wobbleX = snoise(perpNoise + vec3(50.0, 0.0, 0.0)) * uDisplacementStrength * uTurbulence * 0.5 * fadeFactor;
    float wobbleY = snoise(perpNoise + vec3(0.0, 50.0, 0.0)) * uDisplacementStrength * uTurbulence * 0.3 * fadeFactor;
    float wobbleZ = snoise(perpNoise + vec3(0.0, 0.0, 50.0)) * uDisplacementStrength * uTurbulence * 0.5 * fadeFactor;
    displaced.x += wobbleX;
    displaced.y += wobbleY;
    displaced.z += wobbleZ;

    // ═══════════════════════════════════════════════════════════════════════════
    // ANIMATED SURFACE WAVES — visible undulation of the water surface
    // Two frequency layers: broad swells + fine ripples.
    // The analytical gradient perturbs the normal so specular and refraction
    // react to the wave shapes, not just the flat polygon normal.
    // ═══════════════════════════════════════════════════════════════════════════
    float wt = uGlobalTime * 0.001;

    // Broad swells (5 cycles across model, slow drift)
    float wave1 = sin(selectedPosition.x * 5.0 + wt * 3.0)
                * cos(selectedPosition.z * 4.0 + wt * 2.0);
    // Fine ripples (12 cycles, faster counter-drift)
    float wave2 = sin(selectedPosition.x * 12.0 - wt * 4.0)
                * cos(selectedPosition.z * 9.0 + wt * 3.5);

    float waveDispl = (wave1 * 0.07 + wave2 * 0.03) * fadeFactor;
    displaced += selectedNormal * waveDispl;

    // Analytical gradient: dh/dx and dh/dz for normal perturbation
    // Normal perturbation amplified 3x beyond displacement — strong refraction waviness
    // without moving geometry enough to create spikes on low-poly mesh
    float normalBoost = 1.5;
    float dwdx = (5.0  * cos(selectedPosition.x * 5.0  + wt * 3.0) * cos(selectedPosition.z * 4.0 + wt * 2.0) * 0.07
               +  12.0 * cos(selectedPosition.x * 12.0 - wt * 4.0) * cos(selectedPosition.z * 9.0 + wt * 3.5) * 0.03) * normalBoost;
    float dwdz = (-4.0 * sin(selectedPosition.x * 5.0  + wt * 3.0) * sin(selectedPosition.z * 4.0 + wt * 2.0) * 0.07
               +  -9.0 * sin(selectedPosition.x * 12.0 - wt * 4.0) * sin(selectedPosition.z * 9.0 + wt * 3.5) * 0.03) * normalBoost;

    // Perturbed normal: standard height-field approximation N' = normalize(N - gradient)
    vec3 waveNormal = normalize(selectedNormal - vec3(dwdx, 0.0, dwdz) * fadeFactor);

    // Apply trail offset
    displaced += trailOffset;

    vDisplacement = baseDisplacement;

    // Transform wave-perturbed normal with instance matrix
    vNormal = normalMatrix * mat3(instanceMatrix) * waveNormal;

    // ═══════════════════════════════════════════════════════════════════════════════
    // Apply instance matrix for per-instance transforms
    // ═══════════════════════════════════════════════════════════════════════════════
    vec4 instancePosition = instanceMatrix * vec4(displaced, 1.0);

    vec4 worldPos = modelMatrix * instancePosition;
    vWorldPosition = worldPos.xyz;
    vViewDir = normalize(cameraPosition - worldPos.xyz);

    // Instance origin in world space (for trail dissolve - uses cutout at instance floor)
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
        // Calculate angle of this vertex in local XZ plane
        float vertexAngle = atan(selectedPosition.z, selectedPosition.x);

        // Arc center rotates based on gesture progress + per-instance phase offset
        // aRandomSeed stores the arc phase (rotationOffset) for vortex effects
        float arcAngle = uGestureProgress * uArcSpeed * 6.28318 + uArcPhase;

        // Calculate arc visibility
        float halfWidth = uArcWidth * 3.14159;  // Convert to radians
        float arcSpacing = 6.28318 / float(max(1, uArcCount));

        float maxVis = 0.0;
        for (int i = 0; i < 4; i++) {
            if (i >= uArcCount) break;
            float thisArcAngle = arcAngle + float(i) * arcSpacing;

            // Distance from vertex angle to arc center (wrapping around 2PI)
            float angleDiff = vertexAngle - thisArcAngle;
            angleDiff = mod(angleDiff + 3.14159, 6.28318) - 3.14159;  // Wrap to -PI to PI

            // Smooth visibility falloff at arc edges
            float vis = 1.0 - smoothstep(halfWidth * 0.7, halfWidth, abs(angleDiff));
            maxVis = max(maxVis, vis);
        }
        vArcVisibility = maxVis;
    }

    // World-space normal for refraction (wave-perturbed)
    vec3 transformedNormal = (instanceMatrix * vec4(waveNormal, 0.0)).xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * transformedNormal);

    // View-space position for refraction
    vec4 mvPosition = modelViewMatrix * instancePosition;
    vViewPosition = mvPosition.xyz;

    gl_Position = projectionMatrix * mvPosition;
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// INSTANCED FRAGMENT SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════

const FRAGMENT_SHADER = /* glsl */`
uniform float uGlobalTime;
uniform float uTurbulence;
uniform float uIntensity;
uniform float uOpacity;
uniform float uFlowSpeed;
uniform float uNoiseScale;
uniform float uEdgeFade;
uniform float uBloomThreshold;  // Mascot-specific bloom threshold for compression
uniform vec3 uTint;

// Enhanced water system uniforms
uniform float uDepthGradient;      // Depth-based color variation strength (0=off, 1=full)
uniform float uInternalFlowSpeed;  // Internal spiral/flow animation speed multiplier
uniform float uSparkleIntensity;   // Specular sparkle highlight intensity

// Screen-space refraction uniforms
uniform sampler2D uBackgroundTexture;
uniform vec2 uResolution;
uniform int uHasBackground;

// Animation system uniforms (glow, cutout, travel, etc.) from shared core
${ANIMATION_UNIFORMS_FRAGMENT}

// Instancing varyings
${INSTANCED_ATTRIBUTES_FRAGMENT}

varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vInstancePosition;  // Instance origin in world space (for trail dissolve)
varying vec3 vNormal;
varying vec3 vViewDir;
varying float vDisplacement;
varying float vNoiseValue;
varying float vRandomSeed;
varying float vArcVisibility;
varying float vVerticalGradient;
varying vec3 vWorldNormal;
varying vec3 vViewPosition;

${NOISE_GLSL}
${WATER_COLOR_GLSL}
${CUTOUT_PATTERN_FUNC_GLSL}

void main() {
    // Early discard for fully faded instances
    if (vInstanceAlpha < 0.01) discard;

    // Use local time for animation
    float localTime = vLocalTime;

    // ═══════════════════════════════════════════════════════════════════════════════
    // CORE WATER EFFECTS (from WaterShaderCore)
    // Includes: patterns, caustics, fresnel, subsurface, specular, depth variation
    // ═══════════════════════════════════════════════════════════════════════════════
    ${WATER_FRAGMENT_CORE}

    // Apply instance alpha (NormalBlending uses alpha for fade, no color pre-multiply)
    alpha *= vInstanceAlpha;

    // ═══════════════════════════════════════════════════════════════════════════════
    // ARC VISIBILITY (for vortex effects)
    // ═══════════════════════════════════════════════════════════════════════════════
    if (uAnimationType == 1) {
        // Apply arc foam effect at edges (uniform-based arc only)
        ${WATER_ARC_FOAM_GLSL}
    }
    // Apply arc visibility (for vortex/relay effects)
    if (vArcVisibility < 0.999) {
        alpha *= vArcVisibility;
        color *= mix(0.3, 1.0, vArcVisibility);
        if (vArcVisibility < 0.05) discard;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // CUTOUT EFFECT (shared pattern system from InstancedAnimationCore)
    // ═══════════════════════════════════════════════════════════════════════════════
    ${CUTOUT_GLSL}

    // Apply trail dissolve alpha (smooth fade at instance bottom - no hard edge)
    // With AdditiveBlending: only fade ALPHA, keep color bright
    // result = color * alpha + background
    // If color is bright and alpha is low, we get a dim ADDITIVE contribution
    // If color is dark and alpha is low, we get nearly nothing (but no darkening either)
    alpha *= trailAlpha;

    // ═══════════════════════════════════════════════════════════════════════════════
    // WATER CUTOUT FOAM (brightens edges to prevent dark artifacts)
    // ═══════════════════════════════════════════════════════════════════════════════
    ${WATER_CUTOUT_FOAM_GLSL}

    // ═══════════════════════════════════════════════════════════════════════════════
    // GRAIN EFFECT (noise texture overlay for gritty realism)
    // ═══════════════════════════════════════════════════════════════════════════════
    ${GRAIN_GLSL}

    // ═══════════════════════════════════════════════════════════════════════════════
    // DRIP ANTICIPATION (surface tension bright spots)
    // ═══════════════════════════════════════════════════════════════════════════════
    ${WATER_DRIP_ANTICIPATION_GLSL}

    // ═══════════════════════════════════════════════════════════════════════════════
    // FINAL OUTPUT
    // ═══════════════════════════════════════════════════════════════════════════════
    ${WATER_FLOOR_AND_DISCARD_GLSL}

    gl_FragColor = vec4(color, alpha);
}
`;

// Helper functions and defaults are imported from WaterShaderCore.js

// ═══════════════════════════════════════════════════════════════════════════════════════
// MATERIAL FACTORY
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Create an instanced procedural water material
 *
 * @param {Object} options - Configuration options
 * @param {number} [options.turbulence=0.5] - Water turbulence (0=calm, 0.5=flow, 1=storm)
 * @param {number} [options.intensity=1.0] - Brightness multiplier
 * @param {number} [options.opacity=0.85] - Base opacity
 * @param {number} [options.displacementStrength=0.08] - Vertex displacement amount
 * @param {number} [options.flowSpeed=1.0] - Flow animation speed
 * @param {number} [options.noiseScale=3.0] - Noise detail level
 * @param {number} [options.edgeFade=0.15] - Soft edge fade distance
 * @param {number} [options.glowScale=1.0] - Scale for additive glow effects (0=off, 1=full)
 * @param {THREE.Color|number} [options.tint=0xffffff] - Color tint
 * @param {number} [options.fadeInDuration=0.3] - Spawn fade duration
 * @param {number} [options.fadeOutDuration=0.5] - Exit fade duration
 * @returns {THREE.ShaderMaterial}
 */
export function createInstancedWaterMaterial(options = {}) {
    const {
        turbulence = WATER_DEFAULTS.turbulence,
        intensity = null,
        opacity = WATER_DEFAULTS.opacity,
        displacementStrength = null,
        flowSpeed = null,
        noiseScale = WATER_DEFAULTS.noiseScale,
        edgeFade = WATER_DEFAULTS.edgeFade,
        glowScale = WATER_DEFAULTS.glowScale,
        tint = 0xffffff,
        fadeInDuration = WATER_DEFAULTS.fadeInDuration,
        fadeOutDuration = WATER_DEFAULTS.fadeOutDuration
    } = options;

    // Derive values from turbulence if not explicitly set
    const finalIntensity = intensity ?? lerp3(0.8, 1.0, 1.2, turbulence);
    const finalDisplacement = displacementStrength ?? lerp3(0.06, 0.1, 0.15, turbulence);
    const finalFlowSpeed = flowSpeed ?? lerp3(0.8, 1.5, 3.0, turbulence);

    // Convert tint to THREE.Color
    const tintColor = tint instanceof THREE.Color ? tint : new THREE.Color(tint);

    const material = new THREE.ShaderMaterial({
        uniforms: {
            // Instancing uniforms
            uGlobalTime: { value: 0 },
            uFadeInDuration: { value: fadeInDuration },
            uFadeOutDuration: { value: fadeOutDuration },
            // Animation uniforms (cutout, glow, etc. from shared core)
            ...createAnimationUniforms(),
            // Relay arc uniforms
            uRelayCount: { value: 3 },
            uRelayArcWidth: { value: 3.14159 },
            uRelayFloor: { value: 0.0 },
            // Override glowScale if provided in options
            uGlowScale: { value: glowScale },
            // Water uniforms
            uTurbulence: { value: turbulence },
            uIntensity: { value: finalIntensity },
            uOpacity: { value: opacity },
            uDisplacementStrength: { value: finalDisplacement },
            uFlowSpeed: { value: finalFlowSpeed },
            uNoiseScale: { value: noiseScale },
            uEdgeFade: { value: edgeFade },
            uBloomThreshold: { value: 0.5 },  // Mascot bloom threshold (0.35 crystal, 0.85 moon)
            uTint: { value: tintColor },
            // Enhanced water system uniforms
            uDepthGradient: { value: 0.3 },      // Depth color variation
            uInternalFlowSpeed: { value: 1.0 },  // Internal flow speed multiplier
            uSparkleIntensity: { value: 0.4 },   // Specular sparkle intensity
            // Screen-space refraction
            uBackgroundTexture: { value: null },
            uResolution: { value: new THREE.Vector2(1, 1) },
            uHasBackground: { value: 0 }
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
    });

    material.userData.turbulence = turbulence;
    material.userData.elementalType = 'water';
    material.userData.isProcedural = true;
    material.userData.isInstanced = true;
    material.userData.needsRefraction = true;

    return material;
}

/**
 * Update the global time uniform for instanced water material
 * Also handles gesture progress and glow ramping via shared animation system
 * @param {THREE.ShaderMaterial} material - Instanced water material
 * @param {number} time - Current global time in seconds
 * @param {number} [gestureProgress=0] - Gesture progress 0-1 (for arc animation)
 */
export function updateInstancedWaterMaterial(material, time, gestureProgress = 0) {
    if (material?.uniforms?.uGlobalTime) {
        material.uniforms.uGlobalTime.value = time;
    }
    // Use shared animation system for gesture progress and glow ramping
    updateAnimationProgress(material, gestureProgress);
}

/**
 * Set turbulence on existing instanced water material
 * @param {THREE.ShaderMaterial} material - Instanced water material
 * @param {number} turbulence - New turbulence (0-1)
 */
export function setInstancedWaterTurbulence(material, turbulence) {
    if (!material?.uniforms) return;

    material.uniforms.uTurbulence.value = turbulence;
    material.uniforms.uIntensity.value = lerp3(0.8, 1.0, 1.2, turbulence);
    material.uniforms.uDisplacementStrength.value = lerp3(0.06, 0.1, 0.15, turbulence);
    material.uniforms.uFlowSpeed.value = lerp3(0.8, 1.5, 3.0, turbulence);
    material.userData.turbulence = turbulence;
}

/**
 * Set tint color on existing instanced water material
 * @param {THREE.ShaderMaterial} material - Instanced water material
 * @param {THREE.Color|number} color - New tint color
 */
export function setInstancedWaterTint(material, color) {
    if (!material?.uniforms?.uTint) return;

    const tintColor = color instanceof THREE.Color ? color : new THREE.Color(color);
    material.uniforms.uTint.value.copy(tintColor);
}

/**
 * Set glow scale for additive glow effects (rim, inner glow, bloom hints)
 * Use lower values (0.3-0.5) for crystal mascot, higher (1.0+) for moon/meditation
 * Convenience wrapper around shared setGlowScale from InstancedAnimationCore
 * @param {THREE.ShaderMaterial} material - Instanced water material
 * @param {number} scale - Glow scale (0=off, 1=full, >1=bloom-heavy)
 */
export function setInstancedWaterGlowScale(material, scale) {
    setGlowScale(material, scale);
}

/**
 * Configure gesture-driven glow ramping for water effects.
 * Convenience wrapper around shared setGestureGlow from InstancedAnimationCore
 * @param {THREE.ShaderMaterial} material - Instanced water material
 * @param {Object} config - Glow configuration (see InstancedAnimationCore.setGestureGlow)
 */
export function setInstancedWaterGestureGlow(material, config) {
    setGestureGlow(material, config);
}

/**
 * Set the bloom threshold for brightness compression.
 * Should match the mascot's bloom threshold to prevent blowout.
 * @param {THREE.ShaderMaterial} material - Instanced water material
 * @param {number} threshold - Bloom threshold (0.35 for crystal/heart/rough, 0.85 for moon/star)
 */
export function setInstancedWaterBloomThreshold(material, threshold) {
    if (material?.uniforms?.uBloomThreshold) {
        material.uniforms.uBloomThreshold.value = threshold;
    }
}

/**
 * Configure cutout effect for water elements.
 * Uses the shared cutout system from InstancedAnimationCore.
 *
 * @example
 * // Simple: just set strength (uses default CELLULAR_STREAKS pattern)
 * setInstancedWaterCutout(material, 0.8);
 *
 * @example
 * // Waves pattern for interference effects
 * setInstancedWaterCutout(material, { strength: 0.7, pattern: CUTOUT_PATTERNS.WAVES });
 *
 * @param {THREE.ShaderMaterial} material - Instanced water material
 * @param {number|Object} config - Cutout strength (0-1) or config object
 */
export function setInstancedWaterCutout(material, config) {
    setCutout(material, config);
}

/**
 * Configure arc visibility animation for vortex effects
 * Now uses the shared animation system from InstancedAnimationCore.
 * @param {THREE.ShaderMaterial} material - Instanced water material
 * @param {Object} config - Animation config (see setShaderAnimation)
 */
export const setInstancedWaterArcAnimation = setShaderAnimation;

/**
 * Set depth gradient intensity for water depth color variation.
 * Higher values make the center-to-edge color transition more pronounced.
 * @param {THREE.ShaderMaterial} material - Instanced water material
 * @param {number} intensity - Depth gradient intensity (0=off, 0.3=subtle, 1=full)
 */
export function setInstancedWaterDepthGradient(material, intensity) {
    if (material?.uniforms?.uDepthGradient) {
        material.uniforms.uDepthGradient.value = intensity;
    }
}

/**
 * Set internal flow animation speed for spiral/current effects.
 * @param {THREE.ShaderMaterial} material - Instanced water material
 * @param {number} speed - Flow speed multiplier (0.5=slow, 1.0=normal, 2.0=fast)
 */
export function setInstancedWaterFlowSpeed(material, speed) {
    if (material?.uniforms?.uInternalFlowSpeed) {
        material.uniforms.uInternalFlowSpeed.value = speed;
    }
}

/**
 * Set sparkle intensity for specular highlights and caustic sparkles.
 * @param {THREE.ShaderMaterial} material - Instanced water material
 * @param {number} intensity - Sparkle intensity (0=off, 0.4=normal, 1.0=high)
 */
export function setInstancedWaterSparkle(material, intensity) {
    if (material?.uniforms?.uSparkleIntensity) {
        material.uniforms.uSparkleIntensity.value = intensity;
    }
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
export { ANIMATION_TYPES, CUTOUT_PATTERNS, CUTOUT_BLEND, CUTOUT_TRAVEL, GRAIN_TYPES, GRAIN_BLEND, setShaderAnimation, setGestureGlow, setGlowScale, setCutout, resetCutout, setGrain, resetGrain, resetAnimation };

export default {
    createInstancedWaterMaterial,
    updateInstancedWaterMaterial,
    setInstancedWaterTurbulence,
    setInstancedWaterTint,
    setInstancedWaterGlowScale,
    setInstancedWaterGestureGlow,
    setInstancedWaterBloomThreshold,
    setInstancedWaterCutout,
    setInstancedWaterArcAnimation,
    setInstancedWaterDepthGradient,
    setInstancedWaterFlowSpeed,
    setInstancedWaterSparkle,
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
    GRAIN_BLEND
};

// Note: Water element is registered in ElementRegistrations.js to avoid
// circular dependency issues with the bundler.
