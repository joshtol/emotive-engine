/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Instanced Fire Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview GPU-instanced fire material for element models
 * @module materials/InstancedFireMaterial
 *
 * Uses per-instance attributes for:
 * - Time-offset animation (each instance has its own local time)
 * - Model selection (merged geometry with multiple fire model variants)
 * - Trail rendering (main + 3 trail copies per logical element)
 * - Spawn/exit fade transitions
 * - Velocity for motion blur
 *
 * This material is designed to work with ElementInstancePool for
 * GPU-efficient rendering of many fire elements with a single draw call.
 */

import * as THREE from 'three';
import {
    INSTANCED_ATTRIBUTES_VERTEX,
    INSTANCED_ATTRIBUTES_FRAGMENT,
} from '../cores/InstancedShaderUtils.js';
// ═══════════════════════════════════════════════════════════════════════════════════════
// FIRE UTILITIES (inlined from FireShaderCore.js — single consumer)
// ═══════════════════════════════════════════════════════════════════════════════════════

function lerp3(low, mid, high, t) {
    if (t < 0.5) {
        return low + (mid - low) * (t * 2);
    }
    return mid + (high - mid) * ((t - 0.5) * 2);
}

function deriveFireParameters(temperature, overrides = {}) {
    return {
        intensity: overrides.intensity ?? lerp3(1.5, 2.5, 4.0, temperature),
        flickerSpeed: overrides.flickerSpeed ?? lerp3(0.001, 0.002, 0.003, temperature),
        flickerAmount: overrides.flickerAmount ?? lerp3(0.15, 0.12, 0.08, temperature),
        emberDensity: overrides.emberDensity ?? lerp3(0.1, 0.3, 0.5, temperature),
        emberBrightness: overrides.emberBrightness ?? lerp3(0.5, 0.8, 1.2, temperature),
        edgeSoftness: overrides.edgeSoftness ?? lerp3(0.6, 0.5, 0.3, temperature),
    };
}

const FIRE_DEFAULTS = {
    temperature: 0.5,
    opacity: 0.45,
    flameHeight: 0.08,
    turbulence: 0.03,
    displacementStrength: 0.04,
    noiseScale: 4.0,
    edgeFade: 0.25,
    fadeInDuration: 0.3,
    fadeOutDuration: 0.5,
    edgeSoftness: 0.5,
    emberDensity: 0.3,
    emberBrightness: 0.8,
    velocityStretch: 0.5,
};
import {
    ANIMATION_TYPES,
    CUTOUT_PATTERNS,
    CUTOUT_BLEND,
    CUTOUT_TRAVEL,
    GRAIN_TYPES,
    GRAIN_BLEND,
    CUTOUT_PATTERN_FUNC_GLSL,
    CUTOUT_GLSL,
    GRAIN_GLSL,
    ANIMATION_UNIFORMS_FRAGMENT,
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
// FIRE GLSL (inlined from FireShaderCore.js — single consumer)
// ═══════════════════════════════════════════════════════════════════════════════════════

const NOISE_GLSL = /* glsl */ `
// Permutation polynomial hash
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

// 3D Simplex noise
float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// Cheap hash-based noise for modulation/variation (much faster than snoise)
float cheapHash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float cheapNoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(mix(cheapHash(i), cheapHash(i + vec3(1,0,0)), f.x),
            mix(cheapHash(i + vec3(0,1,0)), cheapHash(i + vec3(1,1,0)), f.x), f.y),
        mix(mix(cheapHash(i + vec3(0,0,1)), cheapHash(i + vec3(1,0,1)), f.x),
            mix(cheapHash(i + vec3(0,1,1)), cheapHash(i + vec3(1,1,1)), f.x), f.y),
        f.z
    );
}

// Fractal Brownian Motion - 2 octaves (was 3 — 3rd at 4x adds minimal visible detail)
float fbm3(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for (int i = 0; i < 2; i++) {
        value += amplitude * snoise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

// Turbulence - absolute value FBM
float turbulence(vec3 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for (int i = 0; i < 3; i++) {
        if (i >= octaves) break;
        value += amplitude * abs(snoise(p * frequency));
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

// Configurable octave FBM (3-5 octaves)
float fbmConfigurable(vec3 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for (int i = 0; i < 5; i++) {
        if (i >= octaves) break;
        value += amplitude * snoise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

// Layered turbulence - multiple scales at different animation speeds
float layeredTurbulence(vec3 p, float time) {
    float large = turbulence(p * 0.5 + vec3(0.0, -time * 0.0025, 0.0), 3) * 0.4;
    float medium = turbulence(p + vec3(time * 0.0015, -time * 0.005, 0.0), 3) * 0.35;
    float fine = snoise(p * 2.5 + vec3(time * 0.003, -time * 0.01, time * 0.002)) * 0.25;
    float micro = snoise(p * 4.0 + vec3(0.0, -time * 0.02, 0.0)) * 0.1;

    return large + medium + fine + micro;
}
`;

const FIRE_COLOR_GLSL = /* glsl */ `
// Blackbody-inspired color ramp with ethereal outer wisps
vec3 fireColor(float t, float temperature, float edgeFactor) {
    float heat = t * (0.5 + temperature * 0.5);
    vec3 color;

    if (heat < 0.2) {
        float f = heat / 0.2;
        color = vec3(0.3 + f * 0.4, f * 0.15, 0.0);
    } else if (heat < 0.4) {
        float f = (heat - 0.2) / 0.2;
        color = vec3(0.7 + f * 0.3, 0.15 + f * 0.45, f * 0.05);
    } else if (heat < 0.6) {
        float f = (heat - 0.4) / 0.2;
        color = vec3(1.0, 0.6 + f * 0.25, 0.05 + f * 0.15);
    } else if (heat < 0.8) {
        float f = (heat - 0.6) / 0.2;
        color = vec3(1.0, 0.85 + f * 0.15, 0.2 + f * 0.5);
    } else {
        float f = (heat - 0.8) / 0.2;
        color = vec3(1.0 - f * 0.15, 1.0, 0.7 + f * 0.3);
    }

    vec3 etherealTint = vec3(0.5, 0.6, 1.0);
    float heatPreserve = max(0.3, 1.0 - heat * 0.7);
    float etherealAmount = edgeFactor * heatPreserve * 0.5;
    color = mix(color, etherealTint * 0.6, etherealAmount);

    return color;
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
uniform float uFlameHeight;
uniform float uTurbulence;
uniform float uDisplacementStrength;

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
// Note: Arc phase is now a per-instance attribute (aArcPhase) from InstancedShaderUtils

// Per-instance attributes
${INSTANCED_ATTRIBUTES_VERTEX}

// Velocity stretch uniform
uniform float uVelocityStretch;

// Varyings to fragment
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vInstancePosition;  // Instance origin in world space (for trail dissolve)
varying vec3 vNormal;
varying vec3 vViewDir;
varying float vDisplacement;
varying float vVerticalGradient;
varying float vArcVisibility;  // 0-1 visibility based on arc position
varying float vRandomSeed;     // Pass random seed to fragment for per-instance variation

${NOISE_GLSL}

void main() {
    // ═══════════════════════════════════════════════════════════════════════════════
    // INSTANCING: Calculate local time and fade
    // ═══════════════════════════════════════════════════════════════════════════════

    vLocalTime = uGlobalTime - aSpawnTime;

    // Trail instances have delayed local time
    float trailDelay = max(0.0, aTrailIndex) * 0.05;
    float effectiveLocalTime = max(0.0, vLocalTime - trailDelay);

    // Fade in/out - now controlled entirely by aInstanceOpacity from AnimationState
    // The shader's built-in fadeIn/fadeOut (based on spawn/exit time) is disabled
    // so that AnimationState has full control over fade timing
    float fadeIn = 1.0;  // Disabled - AnimationState controls via aInstanceOpacity
    float fadeOut = 1.0;
    if (aExitTime > 0.0) {
        float exitElapsed = uGlobalTime - aExitTime;
        fadeOut = 1.0 - clamp(exitElapsed / uFadeOutDuration, 0.0, 1.0);
    }

    // Trail fade
    vTrailFade = aTrailIndex < 0.0 ? 1.0 : (1.0 - (aTrailIndex + 1.0) * 0.25);
    // aInstanceOpacity now controls ALL fade timing (enter/hold/exit)
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
    // FIRE ANIMATION (using local time, not global)
    // ═══════════════════════════════════════════════════════════════════════════════

    vPosition = selectedPosition;
    // Note: Normal transform will be done after instanceMatrix is applied

    float modelHeight = 1.0;
    vVerticalGradient = (selectedPosition.y + 0.5) / modelHeight;
    vVerticalGradient = clamp(vVerticalGradient, 0.0, 1.0);

    // Use instance fade for displacement
    // aInstanceOpacity provides smooth, configurable fade timing from AnimationState
    // fadeIn is now always 1.0 (disabled), so fadeFactor = fadeOut * aInstanceOpacity
    float fadeFactor = fadeOut * aInstanceOpacity;

    // Add random seed variation for per-instance uniqueness
    float instanceVariation = aRandomSeed * 0.3;

    // Noise-based displacement (using local time for time-offset animation)
    vec3 noisePos = selectedPosition * 3.0 + vec3(instanceVariation, -effectiveLocalTime * 0.001, instanceVariation);
    float noiseValue = fbm3(noisePos);

    float posVariation = cheapNoise(selectedPosition * 5.0 + vec3(aRandomSeed * 10.0)) * 0.6 - 0.3 + 0.85;

    float heightFactor = pow(vVerticalGradient, 0.5);
    float displacement = noiseValue * uDisplacementStrength * (0.3 + heightFactor * 0.7) * posVariation * fadeFactor;

    vec3 displaced = selectedPosition + selectedNormal * displacement;
    displaced.y += heightFactor * uFlameHeight * (0.5 + noiseValue * 0.5) * fadeFactor;

    float turbX = (cheapNoise(noisePos + vec3(100.0, 0.0, 0.0)) * 2.0 - 1.0) * uTurbulence * heightFactor * posVariation * fadeFactor;
    float turbZ = (cheapNoise(noisePos + vec3(0.0, 0.0, 100.0)) * 2.0 - 1.0) * uTurbulence * heightFactor * posVariation * fadeFactor;
    displaced.x += turbX * 0.3;
    displaced.z += turbZ * 0.3;

    // Apply trail offset
    displaced += trailOffset;

    // ═══════════════════════════════════════════════════════════════════════════════
    // VELOCITY-BASED STRETCHING
    // ═══════════════════════════════════════════════════════════════════════════════
    if (uVelocityStretch > 0.01 && length(aVelocity.xyz) > 0.01) {
        vec3 velocityDir = normalize(aVelocity.xyz);
        float speed = aVelocity.w;

        // Project vertex onto velocity direction
        float alongVelocity = dot(displaced, velocityDir);

        // Stretch factor increases with speed
        float stretchFactor = 1.0 + speed * uVelocityStretch * 0.5;

        // Apply stretch along velocity direction (more at top of flame)
        vec3 stretchOffset = velocityDir * alongVelocity * (stretchFactor - 1.0);
        displaced += stretchOffset * heightFactor;
    }

    vDisplacement = displacement;

    // Pass random seed to fragment for per-instance flicker variation
    vRandomSeed = aRandomSeed;

    // ═══════════════════════════════════════════════════════════════════════════════
    // CRITICAL: Apply instance matrix for per-instance transforms!
    // instanceMatrix contains position/rotation/scale set in ElementInstancePool
    // ═══════════════════════════════════════════════════════════════════════════════
    vec4 instancePosition = instanceMatrix * vec4(displaced, 1.0);

    // Transform normal with instance matrix
    vNormal = normalMatrix * mat3(instanceMatrix) * selectedNormal;

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
        // For vortex effects, aRandomSeed stores the arc phase (rotationOffset) instead of random value
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

    gl_Position = projectionMatrix * modelViewMatrix * instancePosition;
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// INSTANCED FRAGMENT SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════

const FRAGMENT_SHADER = /* glsl */ `
uniform float uGlobalTime;
uniform float uTemperature;
uniform float uIntensity;
uniform float uOpacity;
uniform float uFlickerSpeed;
uniform float uFlickerAmount;
uniform float uNoiseScale;
uniform float uEdgeFade;
// Enhanced visual uniforms
uniform float uEdgeSoftness;
uniform float uEmberDensity;
uniform float uEmberBrightness;

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
varying float vVerticalGradient;
varying float vArcVisibility;
varying float vRandomSeed;

${NOISE_GLSL}

// Lighter layeredTurbulence for instanced elements — drops fine+micro
// (2 fewer snoise). Large+medium carry the visual weight on small geometry.
float layeredTurbulenceLite(vec3 p, float time) {
    float large = turbulence(p * 0.5 + vec3(0.0, -time * 0.0025, 0.0), 3) * 0.4;
    float medium = turbulence(p + vec3(time * 0.0015, -time * 0.005, 0.0), 3) * 0.35;
    return large + medium;
}

${FIRE_COLOR_GLSL}
${CUTOUT_PATTERN_FUNC_GLSL}

void main() {
    // Early discard for fully faded instances
    if (vInstanceAlpha < 0.01) discard;

    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewDir);

    // Use local time for animation
    float localTime = vLocalTime;

    // ═══════════════════════════════════════════════════════════════════════════════
    // FLAME PATTERN (Layered multi-scale noise)
    // ═══════════════════════════════════════════════════════════════════════════════

    vec3 noisePos = vPosition * uNoiseScale + vec3(0.0, -localTime * 0.00085, 0.0);

    // Layered turbulence (lite — large+medium only, drops fine+micro snoise)
    float flame = layeredTurbulenceLite(noisePos, localTime);

    // Position-based variation for non-uniform flames (cheapNoise sufficient for modulation)
    float posVariation = cheapNoise(vPosition * 7.0) * 0.30 - 0.15 + 0.92;
    flame *= posVariation;

    // ═══════════════════════════════════════════════════════════════════════════════
    // VERTICAL FALLOFF
    // ═══════════════════════════════════════════════════════════════════════════════

    float verticalFade = 1.0 - pow(vVerticalGradient, 1.5);
    float tipBrightness = smoothstep(0.7, 0.9, vVerticalGradient) * flame * 0.5;

    // ═══════════════════════════════════════════════════════════════════════════════
    // ENHANCED PER-INSTANCE FLICKER
    // ═══════════════════════════════════════════════════════════════════════════════

    // Per-instance random phase and frequency for organic chaos
    float instancePhase = vRandomSeed * 6.28318;
    float instanceFreq = 0.8 + vRandomSeed * 0.4;

    // Multi-frequency flicker (sin-based for smooth oscillation)
    float f1 = sin(localTime * uFlickerSpeed * instanceFreq + instancePhase);
    float f2 = sin(localTime * uFlickerSpeed * 2.3 * instanceFreq + instancePhase * 1.7) * 0.3;
    float f3 = sin(localTime * uFlickerSpeed * 0.7 * instanceFreq + instancePhase * 0.5) * 0.2;

    float flickerCombined = (f1 + f2 + f3) * 0.5 + 0.5;
    float flicker = 1.0 - uFlickerAmount + uFlickerAmount * flickerCombined;

    // Micro-flicker for fine detail (cheapNoise — 5% variance doesn't need simplex)
    float microFlicker = 0.95 + 0.05 * (cheapNoise(vec3(localTime * 0.004, vPosition.yz * 6.0)) * 2.0 - 1.0);
    flicker *= microFlicker;

    // ═══════════════════════════════════════════════════════════════════════════════
    // FRESNEL EDGE GLOW (Softer for ethereal look)
    // ═══════════════════════════════════════════════════════════════════════════════

    float fresnel = 1.0 - abs(dot(normal, viewDir));
    float softFresnel = pow(fresnel, 2.5);  // Softer power
    float edgeGlow = softFresnel * (0.5 + flame * 0.5);

    // Edge factor for ethereal color tinting
    float edgeFactor = softFresnel * (1.0 - flame * 0.3);

    // ═══════════════════════════════════════════════════════════════════════════════
    // COLOR CALCULATION
    // ═══════════════════════════════════════════════════════════════════════════════

    float localIntensity = flame * verticalFade * flicker + tipBrightness + edgeGlow * 0.3;
    localIntensity = clamp(localIntensity, 0.0, 1.0);

    // DECOUPLED: Color ramp always in warm-to-hot range (0.5–1.0).
    // Noise shifts hue (orange→yellow-white) but color is NEVER dark/brown.
    // Visibility is controlled by alpha alone, not color darkness.
    float colorIntensity = 0.5 + localIntensity * 0.5;
    vec3 color = fireColor(colorIntensity, uTemperature, edgeFactor);
    color *= uIntensity;

    // ═══════════════════════════════════════════════════════════════════════════════
    // EMBER/SPARK GENERATION (scaled by uGlowScale)
    // ═══════════════════════════════════════════════════════════════════════════════

    if (uEmberDensity > 0.01) {
        vec3 emberPos = vPosition * 15.0 + vec3(localTime * 0.002, -localTime * 0.008, localTime * 0.001);
        float emberNoise = cheapNoise(emberPos) * 2.0 - 1.0;

        // Sparse bright spots via threshold
        float emberThreshold = 0.75 - uEmberDensity * 0.3;
        float embers = smoothstep(emberThreshold, emberThreshold + 0.1, emberNoise);

        // Embers concentrate near top (rising sparks)
        embers *= smoothstep(0.2, 0.8, vVerticalGradient);

        // Flicker embers (cheapNoise — modulation only)
        float emberFlicker = 0.7 + 0.3 * (cheapNoise(vec3(localTime * 0.02, emberPos.xy)) * 2.0 - 1.0);
        embers *= emberFlicker;

        // Add white-hot ember color (scaled by uGlowScale for gesture glow ramping)
        color += vec3(1.0, 0.9, 0.7) * embers * uEmberBrightness * uIntensity * uGlowScale;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // EDGE GLOW (scaled by uGlowScale)
    // ═══════════════════════════════════════════════════════════════════════════════

    // Fresnel edge glow for ethereal effect
    color += softFresnel * vec3(0.8, 0.6, 0.3) * uIntensity * 0.2 * uGlowScale;

    // Instance fade is applied through alpha only (not color).
    // With AdditiveBlending (src.rgb * src.a + dst.rgb), applying vInstanceAlpha
    // to both color AND alpha would cause squared attenuation (vInstanceAlpha²).

    // ═══════════════════════════════════════════════════════════════════════════════
    // ALPHA CALCULATION — noise is the sole visibility driver
    // ═══════════════════════════════════════════════════════════════════════════════

    // Wide smoothstep range: only the hottest spots reach full alpha.
    // Most of the surface is partially transparent, so additive stacking
    // builds up gradually (orange → yellow → white-hot) instead of instant white.
    float alpha = smoothstep(0.1, 0.85, localIntensity) * uOpacity;

    // Vertical fade — tips become slightly more transparent
    alpha *= mix(1.0, 1.0 - vVerticalGradient * 0.4, 0.3);

    // Fresnel adds brightness at edges
    alpha += softFresnel * 0.15 * flame;

    alpha = clamp(alpha, 0.0, 1.0);

    // Apply instance alpha (spawn/exit fade + trail fade)
    alpha *= vInstanceAlpha;

    // Apply arc visibility (for vortex/relay effects)
    if (vArcVisibility < 0.999) {
        alpha *= vArcVisibility;
        color *= mix(0.3, 1.0, vArcVisibility);
        if (vArcVisibility < 0.05) discard;
    }

    // No floor color needed — color is always warm (colorIntensity >= 0.5).
    // Low-noise areas are invisible via alpha, not dark via color.
    if (alpha < 0.08) discard;

    // Shared cutout system from InstancedAnimationCore
    ${CUTOUT_GLSL}

    // Grain effect (noise texture overlay for gritty realism)
    ${GRAIN_GLSL}

    gl_FragColor = vec4(color, alpha);
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// MATERIAL FACTORY
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Create an instanced procedural fire material
 *
 * @param {Object} options - Configuration options
 * @param {number} [options.temperature=0.5] - Fire temperature (0=embers, 0.5=fire, 1=plasma)
 * @param {number} [options.intensity=2.5] - Brightness multiplier
 * @param {number} [options.opacity=0.85] - Base opacity
 * @param {number} [options.flameHeight=0.08] - Vertical flame extension
 * @param {number} [options.turbulence=0.03] - Lateral wobble
 * @param {number} [options.displacementStrength=0.04] - Vertex displacement
 * @param {number} [options.noiseScale=4.0] - Noise detail level
 * @param {number} [options.flickerSpeed=3.0] - Flicker speed
 * @param {number} [options.flickerAmount=0.2] - Flicker variance
 * @param {number} [options.edgeFade=0.25] - Edge fade distance
 * @param {number} [options.edgeSoftness=0.5] - Alpha softness at edges (0=hard, 1=soft)
 * @param {number} [options.emberDensity=0.3] - Density of spark hot spots
 * @param {number} [options.emberBrightness=0.8] - Brightness of embers
 * @param {number} [options.velocityStretch=0.5] - Flame stretch along velocity
 * @param {number} [options.fadeInDuration=0.3] - Spawn fade duration
 * @param {number} [options.fadeOutDuration=0.5] - Exit fade duration
 * @returns {THREE.ShaderMaterial}
 */
export function createInstancedFireMaterial(options = {}) {
    const {
        temperature = FIRE_DEFAULTS.temperature,
        intensity = null,
        opacity = FIRE_DEFAULTS.opacity,
        flameHeight = FIRE_DEFAULTS.flameHeight,
        turbulence = FIRE_DEFAULTS.turbulence,
        displacementStrength = FIRE_DEFAULTS.displacementStrength,
        noiseScale = FIRE_DEFAULTS.noiseScale,
        flickerSpeed = null,
        flickerAmount = null,
        edgeFade = FIRE_DEFAULTS.edgeFade,
        edgeSoftness = null,
        emberDensity = null,
        emberBrightness = null,
        velocityStretch = FIRE_DEFAULTS.velocityStretch,
        fadeInDuration = FIRE_DEFAULTS.fadeInDuration,
        fadeOutDuration = FIRE_DEFAULTS.fadeOutDuration,
    } = options;

    // Derive temperature-dependent parameters from shared core
    const derived = deriveFireParameters(temperature, {
        intensity,
        flickerSpeed,
        flickerAmount,
        edgeSoftness,
        emberDensity,
        emberBrightness,
    });
    const finalIntensity = derived.intensity;
    const finalFlickerSpeed = derived.flickerSpeed;
    const finalFlickerAmount = derived.flickerAmount;
    const finalEdgeSoftness = derived.edgeSoftness;
    const finalEmberDensity = derived.emberDensity;
    const finalEmberBrightness = derived.emberBrightness;

    const material = new THREE.ShaderMaterial({
        uniforms: {
            // Instancing uniforms
            uGlobalTime: { value: 0 },
            uFadeInDuration: { value: fadeInDuration },
            uFadeOutDuration: { value: fadeOutDuration },
            // Animation uniforms (shared across all elements)
            ...createAnimationUniforms(),
            // Relay arc uniforms
            uRelayCount: { value: 3 },
            uRelayArcWidth: { value: 3.14159 },
            uRelayFloor: { value: 0.0 },
            // Fire uniforms
            uTemperature: { value: temperature },
            uIntensity: { value: finalIntensity },
            uOpacity: { value: opacity },
            uFlameHeight: { value: flameHeight },
            uTurbulence: { value: turbulence },
            uDisplacementStrength: { value: displacementStrength },
            uNoiseScale: { value: noiseScale },
            uFlickerSpeed: { value: finalFlickerSpeed },
            uFlickerAmount: { value: finalFlickerAmount },
            uEdgeFade: { value: edgeFade },
            // Enhanced visual uniforms
            uEdgeSoftness: { value: finalEdgeSoftness },
            uEmberDensity: { value: finalEmberDensity },
            uEmberBrightness: { value: finalEmberBrightness },
            uVelocityStretch: { value: velocityStretch },
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.FrontSide,
    });

    material.userData.temperature = temperature;
    material.userData.elementalType = 'fire';
    material.userData.isProcedural = true;
    material.userData.isInstanced = true;

    return material;
}

/**
 * Update the global time uniform for instanced fire material
 * Also handles gesture progress and glow ramping via shared animation system
 * @param {THREE.ShaderMaterial} material - Instanced fire material
 * @param {number} time - Current global time in seconds
 * @param {number} [gestureProgress=0] - Gesture progress 0-1 (for arc animation)
 */
export function updateInstancedFireMaterial(material, time, gestureProgress = 0) {
    if (material?.uniforms?.uGlobalTime) {
        material.uniforms.uGlobalTime.value = time;
    }
    // Use shared animation system for gesture progress and glow ramping
    updateAnimationProgress(material, gestureProgress);
}

/**
 * Configure shader animation for fire elements.
 * Uses the shared animation system from InstancedAnimationCore.
 *
 * @param {THREE.ShaderMaterial} material - Instanced fire material
 * @param {Object} config - Animation config (see InstancedAnimationCore.setShaderAnimation)
 */
export const setInstancedFireArcAnimation = setShaderAnimation;

/**
 * Set temperature on existing instanced fire material
 * @param {THREE.ShaderMaterial} material - Instanced fire material
 * @param {number} temperature - New temperature (0-1)
 */
export function setInstancedFireTemperature(material, temperature) {
    if (!material?.uniforms) return;

    const derived = deriveFireParameters(temperature);
    material.uniforms.uTemperature.value = temperature;
    material.uniforms.uIntensity.value = derived.intensity;
    material.uniforms.uFlickerSpeed.value = derived.flickerSpeed;
    material.uniforms.uFlickerAmount.value = derived.flickerAmount;
    material.uniforms.uEdgeSoftness.value = derived.edgeSoftness;
    material.uniforms.uEmberDensity.value = derived.emberDensity;
    material.uniforms.uEmberBrightness.value = derived.emberBrightness;
    material.userData.temperature = temperature;
}

/**
 * Set glow scale for additive glow effects (embers, edge glow)
 * Convenience wrapper around shared setGlowScale from InstancedAnimationCore
 * @param {THREE.ShaderMaterial} material - Instanced fire material
 * @param {number} scale - Glow scale (0=off, 1=normal, >1=bloom)
 */
export function setInstancedFireGlowScale(material, scale) {
    setGlowScale(material, scale);
}

/**
 * Configure gesture-driven glow ramping for fire effects.
 * Convenience wrapper around shared setGestureGlow from InstancedAnimationCore
 *
 * @example
 * // Flash on gesture onset (extrovert fire)
 * setInstancedFireGestureGlow(material, { baseGlow: 0.3, peakGlow: 1.5, curve: 'easeOut' });
 *
 * @example
 * // Extinguish effect (fire dies down)
 * setInstancedFireGestureGlow(material, { baseGlow: 1.2, peakGlow: 0.0, curve: 'easeIn' });
 *
 * @param {THREE.ShaderMaterial} material - Instanced fire material
 * @param {Object} config - Glow configuration (see InstancedAnimationCore.setGestureGlow)
 */
export function setInstancedFireGestureGlow(material, config) {
    setGestureGlow(material, config);
}

/**
 * Configure cutout effect for fire elements.
 * Convenience wrapper around shared setCutout from InstancedAnimationCore.
 *
 * @example
 * // Embers cutout pattern (recommended for fire)
 * setInstancedFireCutout(material, { strength: 0.8, pattern: CUTOUT_PATTERNS.EMBERS });
 *
 * @example
 * // Simple strength only
 * setInstancedFireCutout(material, 0.6);
 *
 * @param {THREE.ShaderMaterial} material - Instanced fire material
 * @param {number|Object} config - Cutout strength (0-1) or config object
 */
export function setInstancedFireCutout(material, config) {
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
    createInstancedFireMaterial,
    updateInstancedFireMaterial,
    setInstancedFireTemperature,
    setInstancedFireGlowScale,
    setInstancedFireGestureGlow,
    setInstancedFireCutout,
    setInstancedFireArcAnimation,
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
