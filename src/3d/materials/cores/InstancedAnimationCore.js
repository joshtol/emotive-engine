/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Instanced Animation Core
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Shared animation system for all instanced elemental materials
 * @module materials/cores/InstancedAnimationCore
 *
 * Animation types work across fire, water, earth, lightning, etc.
 * Each material composes: element coloring + animation core + instancing utils
 *
 * ## Animation Types
 *
 * | Type | Name            | Description                              |
 * |------|-----------------|------------------------------------------|
 * | 0    | NONE            | Default element behavior                 |
 * | 1    | ROTATING_ARC    | Sweeping arc visibility (vortex rings)   |
 * | 2    | RIPPLE_PULSE    | Concentric expanding rings               |
 * | 3    | DRIP_FALL       | Vertical stretch for falling             |
 * | 4    | FLOW_STREAM     | Directional wave flow                    |
 * | 5    | SURFACE_SHIMMER | Caustic/shimmer patterns                 |
 * | 6    | SPIRAL_TWIST    | Helical spiral distortion                |
 * | 7    | PULSE_BEAT      | Rhythmic expand/contract                 |
 * | 8    | FRAGMENT_BURST  | Shatter outward                          |
 *
 * ## Usage in Materials
 *
 * ```javascript
 * import {
 *     ANIMATION_UNIFORMS_VERTEX,
 *     ANIMATION_VARYINGS,
 *     ANIMATION_VERTEX_MAIN,
 *     ANIMATION_FRAGMENT_APPLY,
 *     createAnimationUniforms,
 *     setShaderAnimation
 * } from './cores/InstancedAnimationCore.js';
 *
 * const VERTEX_SHADER = `
 *     ${ANIMATION_UNIFORMS_VERTEX}
 *     ${ANIMATION_VARYINGS}
 *     // ... element-specific uniforms ...
 *
 *     void main() {
 *         // ... setup code ...
 *         ${ANIMATION_VERTEX_MAIN}
 *         // ... rest of shader ...
 *     }
 * `;
 * ```
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// ANIMATION TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Animation type constants
 * @enum {number}
 */
export const ANIMATION_TYPES = {
    NONE: 0,              // Default element behavior
    ROTATING_ARC: 1,      // Sweeping arc visibility (vortex rings)
    RIPPLE_PULSE: 2,      // Concentric expanding rings
    DRIP_FALL: 3,         // Vertical stretch for falling
    FLOW_STREAM: 4,       // Directional wave flow
    SURFACE_SHIMMER: 5,   // Caustic/shimmer patterns
    SPIRAL_TWIST: 6,      // Helical spiral distortion
    PULSE_BEAT: 7,        // Rhythmic expand/contract
    FRAGMENT_BURST: 8,    // Shatter outward
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// CUTOUT PATTERN TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Cutout pattern constants - different ways to create holes/breaks in element geometry.
 * Use two patterns together via primary/secondary layers for composable effects.
 * @enum {number}
 */
export const CUTOUT_PATTERNS = {
    NONE: -1,             // No pattern (use for secondary when only one pattern needed)
    CELLULAR: 0,          // Organic cell-like holes (water, organic)
    STREAKS: 1,           // Flow-aligned streak holes (water, wind)
    RADIAL: 2,            // Radial burst pattern (explosions)
    VORONOI: 3,           // Cracked/shattered pattern (earth, ice)
    WAVES: 4,             // Wave interference pattern (water, energy)
    EMBERS: 5,            // Burning ember holes (fire, heat)
};

/**
 * Blend modes for combining two cutout patterns
 * @enum {number}
 */
export const CUTOUT_BLEND = {
    MULTIPLY: 0,          // Hole where EITHER pattern has hole (more holes)
    MIN: 1,               // Hole only where BOTH patterns have holes (fewer holes)
    MAX: 2,               // Keep highest mask value (fewer holes)
    ADD: 3,               // Add masks together then clamp (smooth blend)
};

/**
 * Cutout travel modes - how the cutout pattern moves across the geometry
 * @enum {number}
 */
export const CUTOUT_TRAVEL = {
    NONE: 0,              // Static cutout (default)
    ANGULAR: 1,           // Sweep around ring geometry (atan2-based)
    RADIAL: 2,            // Expand/contract from center
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// GLSL UNIFORMS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Animation uniform declarations for vertex shader
 */
export const ANIMATION_UNIFORMS_VERTEX = /* glsl */`
// ═══════════════════════════════════════════════════════════════════════════════════════
// ANIMATION SYSTEM UNIFORMS
// ═══════════════════════════════════════════════════════════════════════════════════════
uniform int uAnimationType;           // Animation type (see ANIMATION_TYPES)
uniform float uGestureProgress;       // 0-1 gesture lifetime

// Arc animation (type 1: ROTATING_ARC)
uniform float uArcWidth;              // Arc width (0.5 = ~29% visible)
uniform float uArcSpeed;              // Rotations per gesture
uniform int uArcCount;                // Number of visible arcs

// Ripple animation (type 2: RIPPLE_PULSE)
uniform float uRippleSpeed;           // Ripple expansion speed
uniform float uRippleCount;           // Number of ripple rings

// Flow animation (type 4: FLOW_STREAM)
uniform float uFlowDirection;         // Flow direction angle in radians

// Spiral animation (type 6: SPIRAL_TWIST)
uniform float uSpiralTightness;       // How tight the spiral coils
uniform float uSpiralSpeed;           // Rotation speed

// Pulse animation (type 7: PULSE_BEAT)
uniform float uPulseFrequency;        // Pulses per gesture
uniform float uPulseAmplitude;        // Scale amount (0.3 = 30% expansion)
`;

/**
 * Animation uniform declarations for fragment shader
 */
export const ANIMATION_UNIFORMS_FRAGMENT = /* glsl */`
uniform int uAnimationType;
uniform float uGestureProgress;
uniform float uGlowScale;            // Glow intensity multiplier (0=off, 1=normal, >1=bloom)

// Two-layer composable cutout system (shared across all element types)
uniform float uCutoutStrength;       // 0-1 overall cutout intensity
uniform float uCutoutPhase;          // Animation phase offset
// Primary pattern layer
uniform int uCutoutPattern1;         // Primary pattern type (-1=none, 0-5)
uniform float uCutoutScale1;         // Primary pattern scale
uniform float uCutoutWeight1;        // Primary pattern weight (0-1)
// Secondary pattern layer
uniform int uCutoutPattern2;         // Secondary pattern type (-1=none, 0-5)
uniform float uCutoutScale2;         // Secondary pattern scale
uniform float uCutoutWeight2;        // Secondary pattern weight (0-1)
// Blend mode
uniform int uCutoutBlend;            // 0=multiply, 1=min, 2=max, 3=add
// Travel animation (sweeps cutout around geometry)
uniform int uCutoutTravel;           // 0=none, 1=angular, 2=radial
uniform float uCutoutTravelSpeed;    // Rotations/expansions per gesture (default 1.0)
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// GLSL VARYINGS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Animation varyings passed from vertex to fragment shader
 */
export const ANIMATION_VARYINGS = /* glsl */`
varying float vAnimationMask;         // 0-1 visibility/intensity from animation
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// VERTEX SHADER ANIMATION CODE
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Main animation calculation code for vertex shader.
 *
 * REQUIRED VARIABLES (must be defined before this code):
 * - vec3 localPosition: The local vertex position (before instance transform)
 * - vec3 animatedPosition: Will be modified by animations
 * - float aRandomSeed: Per-instance random seed (from instancing attributes)
 *
 * OUTPUT:
 * - vAnimationMask: Set based on animation type
 * - animatedPosition: Modified for position-based animations
 */
export const ANIMATION_VERTEX_MAIN = /* glsl */`
// ═══════════════════════════════════════════════════════════════════════════════════════
// ANIMATION CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

vAnimationMask = 1.0;

if (uAnimationType == 1) {
    // ═══════════════════════════════════════════════════════════════════════════════
    // ROTATING_ARC: Arc visibility for vortex/ring effects
    // Shows only a portion of the ring that sweeps around
    // ═══════════════════════════════════════════════════════════════════════════════
    float vertexAngle = atan(localPosition.z, localPosition.x);
    float arcAngle = uGestureProgress * uArcSpeed * 6.28318 + aRandomSeed;
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
    vAnimationMask = maxVis;

} else if (uAnimationType == 2) {
    // ═══════════════════════════════════════════════════════════════════════════════
    // RIPPLE_PULSE: Concentric expanding rings from center
    // Creates wave-like patterns expanding outward
    // ═══════════════════════════════════════════════════════════════════════════════
    float distFromCenter = length(localPosition.xz);
    float rippleMask = 0.0;
    for (int i = 0; i < 5; i++) {
        if (float(i) >= uRippleCount) break;
        float ringRadius = mod(uGestureProgress * uRippleSpeed * 3.0 + float(i) * 0.5, 3.0);
        float ringWidth = 0.15;
        float ring = smoothstep(ringRadius - ringWidth, ringRadius, distFromCenter) *
                    smoothstep(ringRadius + ringWidth, ringRadius, distFromCenter);
        rippleMask = max(rippleMask, ring);
    }
    vAnimationMask = 0.3 + rippleMask * 0.7;  // Base visibility + ring boost
    // Vertical pulse at ring locations
    animatedPosition.y += rippleMask * 0.08;

} else if (uAnimationType == 3) {
    // ═══════════════════════════════════════════════════════════════════════════════
    // DRIP_FALL: Vertical stretching for falling droplets
    // Elongates vertically while compressing horizontally
    // ═══════════════════════════════════════════════════════════════════════════════
    float fallProgress = uGestureProgress;
    float stretchFactor = 1.0 + fallProgress * 1.5;
    animatedPosition.y = localPosition.y * stretchFactor;
    // Compress horizontally to maintain volume
    float squash = 1.0 / sqrt(stretchFactor);
    animatedPosition.x = localPosition.x * squash;
    animatedPosition.z = localPosition.z * squash;
    // Downward drift
    animatedPosition.y -= fallProgress * 0.5;
    // Wobble increases as droplet falls
    float fallWobble = sin(uGestureProgress * 50.0 + localPosition.y * 5.0) * 0.02 * fallProgress;
    animatedPosition.x += fallWobble;
    animatedPosition.z += fallWobble * 0.7;
    vAnimationMask = 0.8 + 0.2 * sin(localPosition.y * 10.0 + uGestureProgress * 6.28);

} else if (uAnimationType == 4) {
    // ═══════════════════════════════════════════════════════════════════════════════
    // FLOW_STREAM: Directional wave flow
    // Creates waves moving in a specific direction
    // ═══════════════════════════════════════════════════════════════════════════════
    vec2 flowDir = vec2(cos(uFlowDirection), sin(uFlowDirection));
    float alongFlow = dot(localPosition.xz, flowDir);
    float wave = sin(alongFlow * 4.0 - uGestureProgress * 6.28 * 2.0);
    float wave2 = sin(alongFlow * 7.0 - uGestureProgress * 6.28 * 3.0) * 0.5;
    animatedPosition.y += (wave + wave2) * 0.05;
    // Push in flow direction
    animatedPosition.x += flowDir.x * wave * 0.02;
    animatedPosition.z += flowDir.y * wave * 0.02;
    vAnimationMask = 0.7 + 0.3 * (wave * 0.5 + 0.5);

} else if (uAnimationType == 5) {
    // ═══════════════════════════════════════════════════════════════════════════════
    // SURFACE_SHIMMER: Caustic light patterns
    // Fragment shader handles the visual effect
    // ═══════════════════════════════════════════════════════════════════════════════
    vAnimationMask = 1.0;  // Fragment shader does the work

} else if (uAnimationType == 6) {
    // ═══════════════════════════════════════════════════════════════════════════════
    // SPIRAL_TWIST: Helical spiral distortion
    // Twists geometry around Y axis based on height
    // ═══════════════════════════════════════════════════════════════════════════════
    float height = localPosition.y;
    float twistAngle = height * uSpiralTightness + uGestureProgress * uSpiralSpeed * 6.28;
    float cosT = cos(twistAngle);
    float sinT = sin(twistAngle);
    animatedPosition.x = localPosition.x * cosT - localPosition.z * sinT;
    animatedPosition.z = localPosition.x * sinT + localPosition.z * cosT;
    animatedPosition.y = localPosition.y;
    vAnimationMask = 1.0;

} else if (uAnimationType == 7) {
    // ═══════════════════════════════════════════════════════════════════════════════
    // PULSE_BEAT: Rhythmic expansion/contraction
    // Breathing/heartbeat effect
    // ═══════════════════════════════════════════════════════════════════════════════
    float pulse = sin(uGestureProgress * uPulseFrequency * 6.28) * 0.5 + 0.5;
    float scale = 1.0 + pulse * uPulseAmplitude;
    animatedPosition = localPosition * scale;
    vAnimationMask = 0.5 + pulse * 0.5;

} else if (uAnimationType == 8) {
    // ═══════════════════════════════════════════════════════════════════════════════
    // FRAGMENT_BURST: Shatter and explode outward
    // Elements fly away from center with tumble rotation
    // ═══════════════════════════════════════════════════════════════════════════════
    vec3 burstDir = normalize(localPosition + vec3(0.001));  // Avoid zero vector
    float burstDist = uGestureProgress * uGestureProgress * 2.0;  // Accelerating
    animatedPosition = localPosition + burstDir * burstDist;
    // Tumble rotation
    float tumble = uGestureProgress * 3.0 + dot(localPosition, vec3(1.0));
    float c = cos(tumble);
    float s = sin(tumble);
    vec3 tumbled = animatedPosition;
    tumbled.x = animatedPosition.x * c - animatedPosition.z * s;
    tumbled.z = animatedPosition.x * s + animatedPosition.z * c;
    animatedPosition = tumbled;
    vAnimationMask = 1.0 - uGestureProgress * 0.5;  // Fade as bursting
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// FRAGMENT SHADER ANIMATION CODE
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Fragment shader code to apply animation mask.
 *
 * REQUIRED VARIABLES (must be defined before this code):
 * - vec3 color: The fragment color
 * - float alpha: The fragment alpha
 * - vAnimationMask: From vertex shader
 *
 * OUTPUT:
 * - color: Modified based on animation
 * - alpha: Modified based on animation
 * - May discard fragment for arc animations
 */
export const ANIMATION_FRAGMENT_APPLY = /* glsl */`
// ═══════════════════════════════════════════════════════════════════════════════════════
// APPLY ANIMATION MASK
// ═══════════════════════════════════════════════════════════════════════════════════════

if (uAnimationType == 1) {
    // ROTATING_ARC: Hard discard outside arc
    if (vAnimationMask < 0.05) discard;
    alpha *= smoothstep(0.05, 0.4, vAnimationMask);
    color *= mix(0.3, 1.0, vAnimationMask);

} else if (uAnimationType == 2) {
    // RIPPLE_PULSE: Boost intensity at ring peaks
    color *= mix(0.7, 1.3, vAnimationMask);
    alpha *= mix(0.6, 1.0, vAnimationMask);

} else if (uAnimationType == 3) {
    // DRIP_FALL: Subtle intensity variation
    alpha *= vAnimationMask;

} else if (uAnimationType == 4) {
    // FLOW_STREAM: Wave intensity variation
    color *= mix(0.8, 1.2, vAnimationMask);

} else if (uAnimationType == 7) {
    // PULSE_BEAT: Brightness follows pulse
    color *= mix(0.7, 1.4, vAnimationMask);
    alpha *= mix(0.7, 1.0, vAnimationMask);

} else if (uAnimationType == 8) {
    // FRAGMENT_BURST: Fade out as bursting
    alpha *= vAnimationMask;
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// CUTOUT SYSTEM GLSL
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Helper function GLSL for calculating individual cutout pattern masks.
 * Must be included before CUTOUT_GLSL in fragment shader.
 */
export const CUTOUT_PATTERN_FUNC_GLSL = /* glsl */`
// Calculate cutout mask for a single pattern
float calcCutoutPattern(int pattern, vec3 pos, float scale, float time) {
    if (pattern < 0) return 1.0;  // NONE pattern = fully visible

    vec3 scaledPos = pos * scale;

    if (pattern == 0) {
        // CELLULAR: Organic cell-like holes
        vec3 cellPos = scaledPos * 6.0 + vec3(time * 0.5, 0.0, 0.0);
        float cell1 = snoise(cellPos);
        float cell2 = snoise(cellPos * 1.7 + vec3(50.0));
        float cellPattern = min(cell1, cell2);
        return smoothstep(-0.3, 0.1, cellPattern);

    } else if (pattern == 1) {
        // STREAKS: Flow-aligned streak holes
        float streakAngle = atan(pos.y, pos.x);
        float streakPhase = streakAngle * 4.0 + time * 3.0;
        float streak = sin(streakPhase);
        float streak2 = sin(streakPhase * 0.7 + 2.094);
        float streakPattern = max(streak, streak2);
        return smoothstep(-0.2, 0.3, streakPattern);

    } else if (pattern == 2) {
        // RADIAL: Burst pattern from center
        float dist = length(pos.xz);
        float angle = atan(pos.z, pos.x);
        float radialWave = sin(dist * 8.0 - time * 4.0 + angle * 3.0);
        float radialNoise = snoise(scaledPos * 4.0 + vec3(time)) * 0.3;
        return smoothstep(-0.2, 0.4, radialWave + radialNoise);

    } else if (pattern == 3) {
        // VORONOI: Cracked/shattered pattern
        vec3 voronoiPos = scaledPos * 5.0;
        float n1 = snoise(voronoiPos);
        float n2 = snoise(voronoiPos * 2.0 + vec3(100.0));
        float n3 = snoise(voronoiPos * 0.5 + vec3(-50.0));
        float cracks = abs(n1) + abs(n2) * 0.5 + abs(n3) * 0.3;
        return smoothstep(0.3, 0.7, cracks);

    } else if (pattern == 4) {
        // WAVES: Interference pattern
        float wave1 = sin(pos.x * 10.0 + time * 2.0);
        float wave2 = sin(pos.z * 10.0 + time * 2.5);
        float wave3 = sin((pos.x + pos.z) * 7.0 - time * 1.5);
        float wavePattern = wave1 + wave2 + wave3;
        return smoothstep(-0.5, 1.5, wavePattern);

    } else if (pattern == 5) {
        // EMBERS: Burning ember holes (great for fire)
        vec3 emberPos = scaledPos * 8.0 + vec3(0.0, -time * 2.0, 0.0);
        float ember1 = snoise(emberPos);
        float ember2 = snoise(emberPos * 1.5 + vec3(30.0, time, 0.0));
        float heat = snoise(vec3(pos.xy * 3.0, time * 0.5)) * 0.3;
        float emberPattern = ember1 * ember2 + heat;
        float heightBias = smoothstep(0.0, 1.0, pos.y + 0.5) * 0.3;
        return smoothstep(-0.2 - heightBias, 0.3 - heightBias, emberPattern);
    }

    return 1.0;  // Default: fully visible
}
`;

/**
 * Two-layer composable cutout pattern GLSL code for fragment shader.
 * Creates holes/breaks in element geometry for organic, ethereal effects.
 *
 * REQUIRED: Include CUTOUT_PATTERN_FUNC_GLSL before this in fragment shader.
 *
 * REQUIRED VARIABLES:
 * - vec3 vPosition: Local vertex position
 * - float localTime: Local time for animation
 * - snoise(vec3): Simplex noise function
 *
 * REQUIRED UNIFORMS:
 * - uCutoutStrength, uCutoutPhase
 * - uCutoutPattern1, uCutoutScale1, uCutoutWeight1
 * - uCutoutPattern2, uCutoutScale2, uCutoutWeight2
 * - uCutoutBlend
 *
 * OUTPUT:
 * - May discard fragment if below cutout threshold
 */
export const CUTOUT_GLSL = /* glsl */`
// ═══════════════════════════════════════════════════════════════════════════════════════
// TWO-LAYER COMPOSABLE CUTOUT SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════════════

if (uCutoutStrength > 0.01 && uCutoutPattern1 >= 0) {
    float cutoutTime = localTime * 0.001 + uCutoutPhase;

    // Apply travel offset to position for pattern sampling
    vec3 travelPos = vPosition;
    if (uCutoutTravel == 1) {
        // ANGULAR: Rotate position around Y axis based on gesture progress
        // This makes the cutout pattern sweep around ring geometries
        float travelAngle = uGestureProgress * uCutoutTravelSpeed * 6.28318;
        float cosA = cos(travelAngle);
        float sinA = sin(travelAngle);
        travelPos.x = vPosition.x * cosA - vPosition.z * sinA;
        travelPos.z = vPosition.x * sinA + vPosition.z * cosA;
    } else if (uCutoutTravel == 2) {
        // RADIAL: Scale position from center based on gesture progress
        // This makes the cutout pattern expand/contract
        float radialScale = 1.0 + (uGestureProgress * uCutoutTravelSpeed - 0.5) * 2.0;
        travelPos.xz *= radialScale;
    }

    // Calculate primary pattern mask using travel-offset position
    float mask1 = calcCutoutPattern(uCutoutPattern1, travelPos, uCutoutScale1, cutoutTime);
    mask1 = mix(1.0, mask1, uCutoutWeight1);

    // Calculate secondary pattern mask (if enabled)
    float mask2 = 1.0;
    if (uCutoutPattern2 >= 0) {
        mask2 = calcCutoutPattern(uCutoutPattern2, travelPos, uCutoutScale2, cutoutTime);
        mask2 = mix(1.0, mask2, uCutoutWeight2);
    }

    // Blend the two masks
    float cutoutMask = 1.0;
    if (uCutoutBlend == 0) {
        // MULTIPLY: Hole where EITHER has hole (more holes)
        cutoutMask = mask1 * mask2;
    } else if (uCutoutBlend == 1) {
        // MIN: Hole only where BOTH have holes (fewer holes)
        cutoutMask = min(mask1, mask2);
    } else if (uCutoutBlend == 2) {
        // MAX: Keep highest value (fewer holes)
        cutoutMask = max(mask1, mask2);
    } else if (uCutoutBlend == 3) {
        // ADD: Smooth blend, clamped
        cutoutMask = clamp(mask1 + mask2 - 1.0, 0.0, 1.0);
    }

    // Apply overall cutout strength
    float finalCutout = mix(1.0, cutoutMask, uCutoutStrength);

    // Binary discard - no semi-transparency to avoid black outlines
    if (finalCutout < 0.5) {
        discard;
    }
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// JAVASCRIPT UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Default values for animation uniforms
 */
export const ANIMATION_DEFAULTS = {
    animationType: 0,
    gestureProgress: 0.0,
    glowScale: 1.0,        // Default glow multiplier
    // Arc
    arcWidth: 0.5,
    arcSpeed: 1.0,
    arcCount: 1,
    // Ripple
    rippleSpeed: 0.5,
    rippleCount: 3,
    // Flow
    flowDirection: 0,
    // Spiral
    spiralTightness: 2.0,
    spiralSpeed: 1.0,
    // Pulse
    pulseFrequency: 2.0,
    pulseAmplitude: 0.3,
    // Cutout - two-layer composable system
    cutoutStrength: 0.0,   // Off by default
    cutoutPhase: 0.0,      // Animation phase offset
    cutoutPattern1: -1,    // Primary pattern (-1=none/disabled)
    cutoutScale1: 1.0,     // Primary scale
    cutoutWeight1: 1.0,    // Primary weight
    cutoutPattern2: -1,    // Secondary pattern (-1=none)
    cutoutScale2: 1.0,     // Secondary scale
    cutoutWeight2: 1.0,    // Secondary weight
    cutoutBlend: 0,        // MULTIPLY blend mode
    cutoutTravel: 0,       // NONE travel mode
    cutoutTravelSpeed: 1.0,// One full rotation/expansion per gesture
};

/**
 * Create animation uniform objects for THREE.ShaderMaterial
 * @returns {Object} Uniforms object to spread into material uniforms
 */
export function createAnimationUniforms() {
    return {
        uAnimationType: { value: ANIMATION_DEFAULTS.animationType },
        uGestureProgress: { value: ANIMATION_DEFAULTS.gestureProgress },
        uGlowScale: { value: ANIMATION_DEFAULTS.glowScale },
        // Arc
        uArcWidth: { value: ANIMATION_DEFAULTS.arcWidth },
        uArcSpeed: { value: ANIMATION_DEFAULTS.arcSpeed },
        uArcCount: { value: ANIMATION_DEFAULTS.arcCount },
        // Ripple
        uRippleSpeed: { value: ANIMATION_DEFAULTS.rippleSpeed },
        uRippleCount: { value: ANIMATION_DEFAULTS.rippleCount },
        // Flow
        uFlowDirection: { value: ANIMATION_DEFAULTS.flowDirection },
        // Spiral
        uSpiralTightness: { value: ANIMATION_DEFAULTS.spiralTightness },
        uSpiralSpeed: { value: ANIMATION_DEFAULTS.spiralSpeed },
        // Pulse
        uPulseFrequency: { value: ANIMATION_DEFAULTS.pulseFrequency },
        uPulseAmplitude: { value: ANIMATION_DEFAULTS.pulseAmplitude },
        // Cutout - two-layer composable system
        uCutoutStrength: { value: ANIMATION_DEFAULTS.cutoutStrength },
        uCutoutPhase: { value: ANIMATION_DEFAULTS.cutoutPhase },
        uCutoutPattern1: { value: ANIMATION_DEFAULTS.cutoutPattern1 },
        uCutoutScale1: { value: ANIMATION_DEFAULTS.cutoutScale1 },
        uCutoutWeight1: { value: ANIMATION_DEFAULTS.cutoutWeight1 },
        uCutoutPattern2: { value: ANIMATION_DEFAULTS.cutoutPattern2 },
        uCutoutScale2: { value: ANIMATION_DEFAULTS.cutoutScale2 },
        uCutoutWeight2: { value: ANIMATION_DEFAULTS.cutoutWeight2 },
        uCutoutBlend: { value: ANIMATION_DEFAULTS.cutoutBlend },
        uCutoutTravel: { value: ANIMATION_DEFAULTS.cutoutTravel },
        uCutoutTravelSpeed: { value: ANIMATION_DEFAULTS.cutoutTravelSpeed },
    };
}

/**
 * Configure two-layer composable cutout effect on a material.
 * Creates holes/breaks in element geometry for organic, ethereal effects.
 *
 * @param {THREE.ShaderMaterial} material - The material to configure
 * @param {number|Object} config - Cutout strength (0-1) or config object
 *
 * Config object format:
 * {
 *   strength: 0.8,           // Overall cutout intensity (0-1)
 *   phase: 0,                // Animation phase offset
 *   primary: { pattern: 0, scale: 1.0, weight: 1.0 },   // Primary layer
 *   secondary: { pattern: 1, scale: 1.0, weight: 0.7 }, // Secondary layer (optional)
 *   blend: 'multiply',       // 'multiply'|'min'|'max'|'add'
 *   travel: 'angular',       // 'none'|'angular'|'radial' - how cutout sweeps
 *   travelSpeed: 1.0         // Rotations per gesture (default 1.0)
 * }
 *
 * Legacy single-pattern format (still supported):
 * { strength: 0.8, pattern: 0, scale: 1.0 }
 *
 * @example
 * // Simple: just set strength (uses defaults)
 * setCutout(material, 0.8);
 *
 * @example
 * // Single pattern (fire embers)
 * setCutout(material, { strength: 0.8, pattern: CUTOUT_PATTERNS.EMBERS, scale: 1.2 });
 *
 * @example
 * // Two-layer composable (cellular + streaks for water)
 * setCutout(material, {
 *     strength: 0.8,
 *     primary: { pattern: CUTOUT_PATTERNS.CELLULAR, scale: 1.0, weight: 1.0 },
 *     secondary: { pattern: CUTOUT_PATTERNS.STREAKS, scale: 1.0, weight: 0.7 },
 *     blend: 'multiply'
 * });
 *
 * @example
 * // Angular travel for crown rings (cutout sweeps around)
 * setCutout(material, {
 *     strength: 0.8,
 *     pattern: CUTOUT_PATTERNS.EMBERS,
 *     travel: 'angular',
 *     travelSpeed: 2.0  // Two full rotations per gesture
 * });
 */
export function setCutout(material, config) {
    if (!material?.uniforms) return;

    // Handle simple number (just strength with pattern1 = CELLULAR as default)
    if (typeof config === 'number') {
        material.uniforms.uCutoutStrength.value = Math.max(0, Math.min(1, config));
        material.uniforms.uCutoutPattern1.value = CUTOUT_PATTERNS.CELLULAR;
        return;
    }

    // Parse config object
    const {
        strength = ANIMATION_DEFAULTS.cutoutStrength,
        phase = ANIMATION_DEFAULTS.cutoutPhase,
        primary,
        secondary,
        blend = 'multiply',
        travel = 'none',
        travelSpeed = ANIMATION_DEFAULTS.cutoutTravelSpeed,
        // Legacy single-pattern support
        pattern,
        scale
    } = config || {};

    // Resolve blend mode
    const blendModes = { multiply: 0, min: 1, max: 2, add: 3 };
    const blendValue = typeof blend === 'number' ? blend : (blendModes[blend] ?? 0);

    // Resolve travel mode
    const travelModes = { none: 0, angular: 1, radial: 2 };
    const travelValue = typeof travel === 'number' ? travel : (travelModes[travel] ?? 0);

    material.uniforms.uCutoutStrength.value = Math.max(0, Math.min(1, strength));
    material.uniforms.uCutoutPhase.value = phase;
    material.uniforms.uCutoutBlend.value = blendValue;
    material.uniforms.uCutoutTravel.value = travelValue;
    material.uniforms.uCutoutTravelSpeed.value = travelSpeed;

    // Handle two-layer format
    if (primary !== undefined) {
        material.uniforms.uCutoutPattern1.value = primary.pattern ?? CUTOUT_PATTERNS.CELLULAR;
        material.uniforms.uCutoutScale1.value = primary.scale ?? 1.0;
        material.uniforms.uCutoutWeight1.value = primary.weight ?? 1.0;

        if (secondary !== undefined) {
            material.uniforms.uCutoutPattern2.value = secondary.pattern ?? CUTOUT_PATTERNS.NONE;
            material.uniforms.uCutoutScale2.value = secondary.scale ?? 1.0;
            material.uniforms.uCutoutWeight2.value = secondary.weight ?? 1.0;
        } else {
            material.uniforms.uCutoutPattern2.value = CUTOUT_PATTERNS.NONE;
        }
    }
    // Handle legacy single-pattern format
    else if (pattern !== undefined) {
        material.uniforms.uCutoutPattern1.value = pattern;
        material.uniforms.uCutoutScale1.value = scale ?? 1.0;
        material.uniforms.uCutoutWeight1.value = 1.0;
        material.uniforms.uCutoutPattern2.value = CUTOUT_PATTERNS.NONE;
    }
}

/**
 * Reset cutout to default (off) state
 * @param {THREE.ShaderMaterial} material - The material to reset
 */
export function resetCutout(material) {
    if (!material?.uniforms) return;
    material.uniforms.uCutoutStrength.value = 0;
    material.uniforms.uCutoutPhase.value = ANIMATION_DEFAULTS.cutoutPhase;
    material.uniforms.uCutoutPattern1.value = ANIMATION_DEFAULTS.cutoutPattern1;
    material.uniforms.uCutoutScale1.value = ANIMATION_DEFAULTS.cutoutScale1;
    material.uniforms.uCutoutWeight1.value = ANIMATION_DEFAULTS.cutoutWeight1;
    material.uniforms.uCutoutPattern2.value = ANIMATION_DEFAULTS.cutoutPattern2;
    material.uniforms.uCutoutScale2.value = ANIMATION_DEFAULTS.cutoutScale2;
    material.uniforms.uCutoutWeight2.value = ANIMATION_DEFAULTS.cutoutWeight2;
    material.uniforms.uCutoutBlend.value = ANIMATION_DEFAULTS.cutoutBlend;
    material.uniforms.uCutoutTravel.value = ANIMATION_DEFAULTS.cutoutTravel;
    material.uniforms.uCutoutTravelSpeed.value = ANIMATION_DEFAULTS.cutoutTravelSpeed;
}

/**
 * Configure animation on a material.
 * This is the shared function used by all element types.
 *
 * @param {THREE.ShaderMaterial} material - The material to configure
 * @param {Object} config - Animation configuration from gesture
 * @param {number} [config.type=0] - Animation type (see ANIMATION_TYPES)
 * @param {number} [config.arcWidth] - Arc width for ROTATING_ARC
 * @param {number} [config.arcSpeed] - Arc rotation speed
 * @param {number} [config.arcCount] - Number of arcs
 * @param {number} [config.rippleSpeed] - Ripple expansion speed
 * @param {number} [config.rippleCount] - Number of ripple rings
 * @param {number} [config.flowDirection] - Flow direction in radians
 * @param {number} [config.spiralTightness] - Spiral coil tightness
 * @param {number} [config.spiralSpeed] - Spiral rotation speed
 * @param {number} [config.pulseFrequency] - Pulse frequency
 * @param {number} [config.pulseAmplitude] - Pulse scale amount
 */
export function setShaderAnimation(material, config = {}) {
    if (!material?.uniforms) return;

    const { type = 0, ...params } = config;
    material.uniforms.uAnimationType.value = type;

    // Set type-specific params if provided
    if (params.arcWidth !== undefined) material.uniforms.uArcWidth.value = params.arcWidth;
    if (params.arcSpeed !== undefined) material.uniforms.uArcSpeed.value = params.arcSpeed;
    if (params.arcCount !== undefined) material.uniforms.uArcCount.value = params.arcCount;
    if (params.rippleSpeed !== undefined) material.uniforms.uRippleSpeed.value = params.rippleSpeed;
    if (params.rippleCount !== undefined) material.uniforms.uRippleCount.value = params.rippleCount;
    if (params.flowDirection !== undefined) material.uniforms.uFlowDirection.value = params.flowDirection;
    if (params.spiralTightness !== undefined) material.uniforms.uSpiralTightness.value = params.spiralTightness;
    if (params.spiralSpeed !== undefined) material.uniforms.uSpiralSpeed.value = params.spiralSpeed;
    if (params.pulseFrequency !== undefined) material.uniforms.uPulseFrequency.value = params.pulseFrequency;
    if (params.pulseAmplitude !== undefined) material.uniforms.uPulseAmplitude.value = params.pulseAmplitude;
}

/**
 * Update gesture progress uniform (call each frame during gesture)
 * Also handles gesture-driven glow ramping if configured via setGestureGlow()
 * @param {THREE.ShaderMaterial} material - The material to update
 * @param {number} progress - Gesture progress 0-1
 */
export function updateAnimationProgress(material, progress) {
    if (material?.uniforms?.uGestureProgress) {
        material.uniforms.uGestureProgress.value = progress;
    }

    // Handle gesture-driven glow ramping
    if (material?.userData?.gestureGlow && material?.uniforms?.uGlowScale) {
        const { baseGlow, peakGlow, curve } = material.userData.gestureGlow;
        let t = progress;

        // Apply easing curve
        if (curve === 'easeIn') {
            t = t * t;  // Quadratic ease-in (dramatic buildup)
        } else if (curve === 'easeOut') {
            t = 1 - (1 - t) * (1 - t);  // Quadratic ease-out (fast start)
        } else if (curve === 'easeInOut') {
            t = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        }
        // 'linear' or undefined uses t as-is

        material.uniforms.uGlowScale.value = baseGlow + (peakGlow - baseGlow) * t;
    }
}

/**
 * Configure gesture-driven glow ramping on a material.
 * The glow will interpolate from baseGlow to peakGlow as gestureProgress goes 0->1.
 * This is shared across all element types (fire, water, void, etc.)
 *
 * @param {THREE.ShaderMaterial} material - The material to configure
 * @param {Object} config - Glow configuration
 * @param {number} [config.baseGlow=1.0] - Glow scale at gesture start (0-1 typical)
 * @param {number} [config.peakGlow=1.0] - Glow scale at gesture end (can exceed 1 for bloom)
 * @param {string} [config.curve='linear'] - Easing curve: 'linear', 'easeIn', 'easeOut', 'easeInOut'
 *
 * @example
 * // Fire flash on gesture onset
 * setGestureGlow(fireMaterial, { baseGlow: 0.3, peakGlow: 1.5, curve: 'easeOut' });
 *
 * @example
 * // Water buildup during meditation
 * setGestureGlow(waterMaterial, { baseGlow: 0.5, peakGlow: 1.2, curve: 'easeIn' });
 *
 * @example
 * // Extinguishing fire (high to low)
 * setGestureGlow(fireMaterial, { baseGlow: 1.2, peakGlow: 0.0, curve: 'easeIn' });
 */
export function setGestureGlow(material, config = {}) {
    if (!material) return;

    const {
        baseGlow = ANIMATION_DEFAULTS.glowScale,
        peakGlow = ANIMATION_DEFAULTS.glowScale,
        curve = 'linear'
    } = config;

    material.userData.gestureGlow = { baseGlow, peakGlow, curve };

    // Set initial glow value
    if (material?.uniforms?.uGlowScale) {
        material.uniforms.uGlowScale.value = baseGlow;
    }
}

/**
 * Clear gesture glow configuration and reset to default
 * @param {THREE.ShaderMaterial} material - The material to reset
 */
export function clearGestureGlow(material) {
    if (!material) return;
    delete material.userData.gestureGlow;
    if (material?.uniforms?.uGlowScale) {
        material.uniforms.uGlowScale.value = ANIMATION_DEFAULTS.glowScale;
    }
}

/**
 * Set glow scale directly (bypasses gesture animation)
 * Values > 1.0 bypass brightness clamp for bloom-heavy effects
 * @param {THREE.ShaderMaterial} material - The material to update
 * @param {number} scale - Glow scale (0=off, 1=normal, >1=bloom)
 */
export function setGlowScale(material, scale) {
    if (material?.uniforms?.uGlowScale) {
        material.uniforms.uGlowScale.value = scale;
    }
}

/**
 * Reset animation to default state
 * @param {THREE.ShaderMaterial} material - The material to reset
 */
export function resetAnimation(material) {
    if (!material?.uniforms) return;
    material.uniforms.uAnimationType.value = 0;
    material.uniforms.uGestureProgress.value = 0;
    // Reset glow but preserve gestureGlow config if set
    if (material.uniforms.uGlowScale) {
        const gestureGlow = material.userData?.gestureGlow;
        material.uniforms.uGlowScale.value = gestureGlow?.baseGlow ?? ANIMATION_DEFAULTS.glowScale;
    }
}

export default {
    ANIMATION_TYPES,
    CUTOUT_PATTERNS,
    CUTOUT_BLEND,
    CUTOUT_TRAVEL,
    ANIMATION_UNIFORMS_VERTEX,
    ANIMATION_UNIFORMS_FRAGMENT,
    ANIMATION_VARYINGS,
    ANIMATION_VERTEX_MAIN,
    ANIMATION_FRAGMENT_APPLY,
    CUTOUT_PATTERN_FUNC_GLSL,
    CUTOUT_GLSL,
    ANIMATION_DEFAULTS,
    createAnimationUniforms,
    setShaderAnimation,
    updateAnimationProgress,
    resetAnimation,
    setGestureGlow,
    clearGestureGlow,
    setGlowScale,
    setCutout,
    resetCutout
};
