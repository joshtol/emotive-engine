/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Instanced Electric Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview GPU-instanced electric/lightning material with Voronoi edge-distance bolts
 * @module materials/InstancedElectricMaterial
 *
 * Uses per-instance attributes for:
 * - Time-offset animation (each instance has unique lightning patterns)
 * - Model selection (merged geometry with multiple electric model variants)
 * - Trail rendering (main + 3 trail copies per logical element)
 * - Spawn/exit fade transitions
 * - Velocity for motion blur
 *
 * ## Master Parameter: charge (0-1)
 *
 * | Charge | Visual              | Example        |
 * |--------|---------------------|----------------|
 * | 0.0    | Faint static sparks | Subtle static  |
 * | 0.5    | Visible arcs        | Standard       |
 * | 1.0    | Intense bolts       | Lightning      |
 *
 * Lightning is generated via 2D Voronoi edge-distance: cell boundaries become
 * thin branching lines. Multi-scale (primary bolts + secondary crackling) with
 * per-instance time offset for unique patterns on each element.
 *
 * AdditiveBlending — electricity is emissive light, not opaque surface.
 */

import * as THREE from 'three';
import {
    INSTANCED_ATTRIBUTES_VERTEX,
    INSTANCED_ATTRIBUTES_FRAGMENT
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
    resetAnimation
} from '../cores/InstancedAnimationCore.js';

// ═══════════════════════════════════════════════════════════════════════════════════════
// ELECTRIC DEFAULTS
// ═══════════════════════════════════════════════════════════════════════════════════════

const ELECTRIC_DEFAULTS = {
    charge: 0.5,
    intensity: 2.5,
    opacity: 0.85,
    flickerSpeed: 8.0,
    flickerAmount: 0.3,
    sparkDensity: 0.5,
    fadeInDuration: 0.15,
    fadeOutDuration: 0.3
};

function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Derive visual parameters from charge level.
 * Higher charge = brighter, faster flicker, more sparks.
 *
 * @param {number} charge - Master parameter 0-1
 * @param {Object} [overrides] - Optional overrides for individual parameters
 * @returns {Object} Derived parameters
 */
function deriveElectricParameters(charge, overrides = {}) {
    return {
        intensity: overrides.intensity ?? lerp(1.0, 4.0, charge),
        flickerSpeed: overrides.flickerSpeed ?? lerp(4.0, 16.0, charge),
        flickerAmount: overrides.flickerAmount ?? lerp(0.1, 0.4, charge),
        sparkDensity: overrides.sparkDensity ?? lerp(0.2, 0.8, charge)
    };
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// NOISE GLSL
// ═══════════════════════════════════════════════════════════════════════════════════════

const NOISE_GLSL = /* glsl */`
// 2D hash for Voronoi cell positions — sin-free
vec2 hash2(vec2 p) {
    p = fract(p * vec2(0.1031, 0.1030));
    p += dot(p, p.yx + 33.33);
    return fract((p.xx + p.yx) * p.yx);
}

// 3D vector hash for Voronoi cell positions — sin-free (fract/dot only)
vec3 hash3(vec3 p) {
    p = fract(p * vec3(0.1031, 0.1030, 0.0973));
    p += dot(p, p.yzx + 33.33);
    return fract((p.xxy + p.yzz) * p.zyx);
}

// 3D hash for value noise (required by cutout system's snoise)
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
// ELECTRIC SHADER GLSL
// ═══════════════════════════════════════════════════════════════════════════════════════

const ELECTRIC_GLSL = /* glsl */`
// Electric color from charge level: pale blue → cyan → white-blue
vec3 getElectricColor(float charge) {
    vec3 low = vec3(0.5, 0.7, 1.0);      // pale blue
    vec3 mid = vec3(0.3, 0.95, 1.0);     // bright cyan
    vec3 high = vec3(0.85, 0.97, 1.0);   // white-blue

    float t1 = smoothstep(0.0, 0.4, charge);
    float t2 = smoothstep(0.4, 0.8, charge);

    vec3 color = mix(low, mid, t1);
    return mix(color, high, t2);
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 2D Voronoi edge distance — thin branching lines for lightning
// Cell boundaries form the bolt network. Animated cell positions drift over time.
// Returns: distance to nearest Voronoi cell edge (small value = on a bolt line)
// ═══════════════════════════════════════════════════════════════════════════════════════
float voronoiEdge2D(vec2 p, float time, float jitter) {
    vec2 n = floor(p);
    vec2 f = fract(p);

    // Single pass: squared-distance comparison (saves 7 sqrt per call)
    float d1sq = 10.0;
    float d2sq = 10.0;
    vec2 closestPoint = vec2(0.0);
    vec2 secondPoint = vec2(0.0);

    for (int j = -1; j <= 1; j++) {
        for (int i = -1; i <= 1; i++) {
            vec2 neighbor = vec2(float(i), float(j));
            vec2 cellId = n + neighbor;
            vec2 cellHash = hash2(cellId);
            vec2 cellOffset = cellHash * jitter;
            cellOffset += (fract(time * 0.48 + cellHash) * 2.0 - 1.0) * 0.15;

            vec2 diff = neighbor + cellOffset - f;
            float dsq = dot(diff, diff);

            if (dsq < d1sq) {
                d2sq = d1sq;
                secondPoint = closestPoint;
                d1sq = dsq;
                closestPoint = neighbor + cellOffset;
            } else if (dsq < d2sq) {
                d2sq = dsq;
                secondPoint = neighbor + cellOffset;
            }
        }
    }

    // Edge distance: perpendicular bisector between two closest cells
    vec2 toCenter = (closestPoint + secondPoint) * 0.5;
    vec2 cellDiff = normalize(secondPoint - closestPoint);
    return abs(dot(toCenter - f, cellDiff));
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 3D Voronoi edge distance — single-pass, squared-distance comparison
// Uses dot(d,d) instead of length(d) in the loop (saves 25 sqrt per call).
// sqrt is monotonic so nearest-neighbor selection is identical.
// ═══════════════════════════════════════════════════════════════════════════════════════
float voronoiEdge3D(vec3 p, float time, float jitter) {
    vec3 n = floor(p);
    vec3 f = fract(p);

    // Single pass: track two closest cell centers (squared distances for comparison)
    float d1sq = 10.0;
    float d2sq = 10.0;
    vec3 closestPoint = vec3(0.0);
    vec3 secondPoint = vec3(0.0);

    for (int k = -1; k <= 1; k++) {
        for (int j = -1; j <= 1; j++) {
            for (int i = -1; i <= 1; i++) {
                vec3 neighbor = vec3(float(i), float(j), float(k));
                vec3 cellId = n + neighbor;
                vec3 cellHash = hash3(cellId);
                vec3 cellOffset = cellHash * jitter;
                cellOffset += (fract(time * 0.48 + cellHash) * 2.0 - 1.0) * 0.15;

                vec3 diff = neighbor + cellOffset - f;
                float dsq = dot(diff, diff);  // squared distance — no sqrt needed

                if (dsq < d1sq) {
                    d2sq = d1sq;
                    secondPoint = closestPoint;
                    d1sq = dsq;
                    closestPoint = neighbor + cellOffset;
                } else if (dsq < d2sq) {
                    d2sq = dsq;
                    secondPoint = neighbor + cellOffset;
                }
            }
        }
    }

    // Edge distance: perpendicular bisector between two closest cells
    vec3 toCenter = (closestPoint + secondPoint) * 0.5;
    vec3 cellDiff = normalize(secondPoint - closestPoint);  // only sqrt needed here
    return abs(dot(toCenter - f, cellDiff));
}

`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// INSTANCED VERTEX SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════

const VERTEX_SHADER = /* glsl */`
// Standard uniforms
uniform float uGlobalTime;
uniform float uFadeInDuration;
uniform float uFadeOutDuration;

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
    // ELECTRIC: No vertex displacement — lightning is purely fragment-based
    // ═══════════════════════════════════════════════════════════════════════════════

    vPosition = selectedPosition;
    vRandomSeed = aRandomSeed;
    vVerticalGradient = clamp((selectedPosition.y + 0.5) / 1.0, 0.0, 1.0);

    vec3 displaced = selectedPosition + trailOffset;

    // Transform normal with instance matrix
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

const FRAGMENT_SHADER = /* glsl */`
uniform float uGlobalTime;
uniform float uCharge;
uniform float uIntensity;
uniform float uOpacity;
uniform float uFlickerSpeed;
uniform float uFlickerAmount;
uniform float uSparkDensity;
uniform float uBloomThreshold;
uniform float uFlashIntensity;

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
${ELECTRIC_GLSL}
${CUTOUT_PATTERN_FUNC_GLSL}

void main() {
    // Early discard for fully faded instances
    if (vInstanceAlpha < 0.01) discard;

    float localTime = vLocalTime;
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewDir);

    // Per-instance time offset — each instance gets unique lightning patterns
    float instanceTimeOffset = vRandomSeed * 10.0;
    float effectiveTime = localTime + instanceTimeOffset;

    // ═══════════════════════════════════════════════════════════════════════════════
    // FRESNEL — subtle edge highlight (matches overlay shader)
    // ═══════════════════════════════════════════════════════════════════════════════
    float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 3.0);
    float rimGlow = fresnel * 0.15 * uCharge;

    // ═══════════════════════════════════════════════════════════════════════════════
    // PRIMARY BOLT NETWORK (large bolts, scale 3)
    // Matches overlay: thin lines + pow() sharpening → bright cores that bloom
    // ═══════════════════════════════════════════════════════════════════════════════
    float lineWidth = 0.015;

    float edge1 = voronoiEdge3D(vWorldPosition * 3.0, effectiveTime * 0.8, 0.85);
    float bolt1 = 1.0 - smoothstep(0.0, lineWidth * 1.2, edge1);
    bolt1 = pow(bolt1, 2.0);

    // ═══════════════════════════════════════════════════════════════════════════════
    // SECONDARY CRACKLING (fine detail, scale 6)
    // ═══════════════════════════════════════════════════════════════════════════════
    float edge2 = voronoiEdge3D(vWorldPosition * 6.0, effectiveTime * 1.2, 0.8);
    float bolt2 = 1.0 - smoothstep(0.0, lineWidth * 0.8, edge2);
    bolt2 = pow(bolt2, 2.5) * 0.6;

    // Combine — two overlapping scales create bolt network
    float lightning = min(bolt1 + bolt2, 1.0);

    // ═══════════════════════════════════════════════════════════════════════════════
    // FLICKER — electrical pulsing (per-instance variation)
    // Step-based for sharp on/off characteristic of real electricity
    // ═══════════════════════════════════════════════════════════════════════════════
    float flickerPhase = vRandomSeed * 100.0;
    float flickerTime = effectiveTime * uFlickerSpeed * 0.5;

    // Multi-frequency flicker for irregular pulsing
    float f1 = step(0.5, fract(sin(flickerTime * 11.3 + flickerPhase) * 43758.5453));
    float f2 = step(0.65, fract(sin(flickerTime * 7.7 + flickerPhase * 1.3) * 43758.5453)) * 0.5;
    float flicker = (1.0 - uFlickerAmount) + uFlickerAmount * max(f1, f2);

    lightning *= flicker;

    // ═══════════════════════════════════════════════════════════════════════════════
    // COLOR — bolt network drives both color and visibility
    // Dark areas between bolts are TRANSPARENT — model geometry hidden
    // ═══════════════════════════════════════════════════════════════════════════════
    float brightness = lightning + rimGlow;

    vec3 baseColor = getElectricColor(uCharge);

    // Bolt peaks shift slightly white — keeps cyan identity
    float whiteMix = smoothstep(0.7, 1.0, brightness) * 0.3;
    vec3 brightColor = baseColor * 1.5 + vec3(0.2, 0.3, 0.4);
    vec3 color = mix(baseColor, brightColor, whiteMix);

    // Apply brightness and intensity (no bloom compression — matches overlay)
    color *= min(brightness * uIntensity, 2.5);

    // Fresnel edge glow (scaled by uGlowScale for gesture ramping)
    color += fresnel * baseColor * 0.2 * uGlowScale;

    // ═══════════════════════════════════════════════════════════════════════════════
    // ALPHA — bolt brightness drives visibility
    // Dark areas between cells are transparent — model geometry hidden
    // ═══════════════════════════════════════════════════════════════════════════════
    float alpha = brightness * uOpacity;
    alpha = clamp(alpha, 0.0, 0.95);

    // Apply instance fade (spawn/exit + trail)
    alpha *= vInstanceAlpha;

    // Arc visibility (for vortex/relay effects)
    if (vArcVisibility < 0.999) {
        alpha *= vArcVisibility;
        color *= mix(0.3, 1.0, vArcVisibility);
        if (vArcVisibility < 0.05) discard;
    }

    if (alpha < 0.03) discard;

    // ═══════════════════════════════════════════════════════════════════════════════
    // CUTOUT + GRAIN (shared systems from InstancedAnimationCore)
    // ═══════════════════════════════════════════════════════════════════════════════
    ${CUTOUT_GLSL}

    // Apply trail dissolve
    alpha *= trailAlpha;

    ${GRAIN_GLSL}

    // ═══════════════════════════════════════════════════════════════════════════════
    // LIGHTNING FLASH — opt-in per-gesture dramatic strike effect
    // When uFlashIntensity > 0: boost brightness, shift toward white, force alpha high
    // ═══════════════════════════════════════════════════════════════════════════════
    if (uFlashIntensity > 0.01) {
        float flashBoost = 1.0 + uFlashIntensity * 3.0;
        color *= flashBoost;
        color = mix(color, vec3(flashBoost), uFlashIntensity * 0.4);
        alpha = min(alpha * flashBoost, 0.95);
    }

    gl_FragColor = vec4(color, alpha);
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// MATERIAL FACTORY
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Create an instanced procedural electric material
 *
 * @param {Object} options - Configuration options
 * @param {number} [options.charge=0.5] - Master parameter (0=static, 0.5=arcs, 1=lightning)
 * @param {number} [options.intensity] - Brightness multiplier (derived from charge if not set)
 * @param {number} [options.opacity=0.7] - Base opacity
 * @param {number} [options.flickerSpeed] - Flicker rate (derived from charge if not set)
 * @param {number} [options.flickerAmount] - Flicker variance (derived from charge if not set)
 * @param {number} [options.sparkDensity] - Spark point density (derived from charge if not set)
 * @param {number} [options.fadeInDuration=0.15] - Spawn fade duration (seconds)
 * @param {number} [options.fadeOutDuration=0.3] - Exit fade duration (seconds)
 * @returns {THREE.ShaderMaterial}
 */
export function createInstancedElectricMaterial(options = {}) {
    const {
        charge = ELECTRIC_DEFAULTS.charge,
        intensity = null,
        opacity = ELECTRIC_DEFAULTS.opacity,
        flickerSpeed = null,
        flickerAmount = null,
        sparkDensity = null,
        fadeInDuration = ELECTRIC_DEFAULTS.fadeInDuration,
        fadeOutDuration = ELECTRIC_DEFAULTS.fadeOutDuration
    } = options;

    // Derive charge-dependent parameters
    const derived = deriveElectricParameters(charge, {
        intensity, flickerSpeed, flickerAmount, sparkDensity
    });

    const material = new THREE.ShaderMaterial({
        uniforms: {
            // Instancing uniforms
            uGlobalTime: { value: 0 },
            uFadeInDuration: { value: fadeInDuration },
            uFadeOutDuration: { value: fadeOutDuration },
            // Animation uniforms (cutout, glow, etc. from shared core)
            ...createAnimationUniforms(),
            // Electric uniforms
            uCharge: { value: charge },
            uIntensity: { value: derived.intensity },
            uOpacity: { value: opacity },
            uFlickerSpeed: { value: derived.flickerSpeed },
            uFlickerAmount: { value: derived.flickerAmount },
            uSparkDensity: { value: derived.sparkDensity },
            uBloomThreshold: { value: 0.85 },
            uFlashIntensity: { value: 0 },
            uRelayCount: { value: 3 },
            uRelayArcWidth: { value: 3.14159 },
            uRelayFloor: { value: 0.0 }
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.FrontSide
    });

    material.userData.charge = charge;
    material.userData.elementalType = 'electric';
    material.userData.isProcedural = true;
    material.userData.isInstanced = true;

    return material;
}

/**
 * Update the global time uniform for instanced electric material.
 * Also handles gesture progress and glow ramping via shared animation system.
 * @param {THREE.ShaderMaterial} material - Instanced electric material
 * @param {number} time - Current global time in seconds
 * @param {number} [gestureProgress=0] - Gesture progress 0-1 (for arc animation)
 */
export function updateInstancedElectricMaterial(material, time, gestureProgress = 0) {
    if (material?.uniforms?.uGlobalTime) {
        material.uniforms.uGlobalTime.value = time;
    }
    // Use shared animation system for gesture progress and glow ramping
    updateAnimationProgress(material, gestureProgress);

    // Flash computation — opt-in per-gesture lightning strike effect
    const flashConfig = material?.userData?.flashConfig;
    if (flashConfig && material.uniforms?.uFlashIntensity) {
        let maxFlash = 0;
        const {events} = flashConfig;
        const decay = flashConfig.decay || 0.03;
        for (let i = 0; i < events.length; i++) {
            if (gestureProgress >= events[i].at) {
                const elapsed = gestureProgress - events[i].at;
                const flash = events[i].intensity * Math.exp(-elapsed / decay);
                if (flash > maxFlash) maxFlash = flash;
            }
        }
        material.uniforms.uFlashIntensity.value = maxFlash;
    }
}

/**
 * Set charge on existing instanced electric material.
 * Updates all charge-dependent parameters (intensity, flicker, sparks).
 * @param {THREE.ShaderMaterial} material - Instanced electric material
 * @param {number} charge - New charge level (0-1)
 */
export function setInstancedElectricCharge(material, charge) {
    if (!material?.uniforms) return;

    const derived = deriveElectricParameters(charge);
    material.uniforms.uCharge.value = charge;
    material.uniforms.uIntensity.value = derived.intensity;
    material.uniforms.uFlickerSpeed.value = derived.flickerSpeed;
    material.uniforms.uFlickerAmount.value = derived.flickerAmount;
    material.uniforms.uSparkDensity.value = derived.sparkDensity;
    material.userData.charge = charge;
}

/**
 * Set per-mascot bloom threshold for electric elements.
 * Prevents bloom blowout on low-threshold geometries (crystal/heart).
 * @param {THREE.ShaderMaterial} material - Instanced electric material
 * @param {number} threshold - Bloom threshold (0.35 for crystal/heart/rough, 0.85 for moon/star)
 */
export function setInstancedElectricBloomThreshold(material, threshold) {
    if (material?.uniforms?.uBloomThreshold) {
        material.uniforms.uBloomThreshold.value = threshold;
    }
}

/**
 * Configure shader animation for electric elements.
 * Uses the shared animation system from InstancedAnimationCore.
 * @param {THREE.ShaderMaterial} material - Instanced electric material
 * @param {Object} config - Animation config (see InstancedAnimationCore.setShaderAnimation)
 */
export const setInstancedElectricArcAnimation = setShaderAnimation;

/**
 * Configure gesture-driven glow ramping for electric effects.
 * @param {THREE.ShaderMaterial} material - Instanced electric material
 * @param {Object} config - Glow configuration (see InstancedAnimationCore.setGestureGlow)
 */
export function setInstancedElectricGestureGlow(material, config) {
    setGestureGlow(material, config);
}

/**
 * Configure cutout effect for electric elements.
 * @param {THREE.ShaderMaterial} material - Instanced electric material
 * @param {number|Object} config - Cutout strength (0-1) or config object
 */
export function setInstancedElectricCutout(material, config) {
    setCutout(material, config);
}

/**
 * Configure lightning flash effect for electric elements.
 * Flash events trigger at specific gesture progress points with exponential decay.
 *
 * @param {THREE.ShaderMaterial} material - Instanced electric material
 * @param {Object} config - Flash configuration
 * @param {Array<{at: number, intensity: number}>} config.events - Flash events
 *   - at: gesture progress (0-1) when flash triggers
 *   - intensity: flash brightness multiplier (1-5 typical)
 * @param {number} [config.decay=0.03] - Exponential decay in progress-space
 *   (0.03 = decays over ~3% of gesture, e.g. 60ms for a 2s gesture)
 */
export function setFlash(material, config) {
    if (!material) return;
    material.userData.flashConfig = config;
    if (material.uniforms?.uFlashIntensity) {
        material.uniforms.uFlashIntensity.value = 0;
    }
}

/**
 * Reset flash effect — clears stored config and sets intensity to 0.
 * @param {THREE.ShaderMaterial} material - Instanced electric material
 */
export function resetFlash(material) {
    if (!material) return;
    material.userData.flashConfig = null;
    if (material.uniforms?.uFlashIntensity) {
        material.uniforms.uFlashIntensity.value = 0;
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
    createInstancedElectricMaterial,
    updateInstancedElectricMaterial,
    setInstancedElectricCharge,
    setInstancedElectricBloomThreshold,
    setInstancedElectricGestureGlow,
    setInstancedElectricCutout,
    setInstancedElectricArcAnimation,
    setFlash,
    resetFlash,
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
