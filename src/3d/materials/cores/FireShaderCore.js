/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Fire Shader Core
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Shared GLSL code and utilities for fire materials
 * @module materials/cores/FireShaderCore
 *
 * This module provides the core shader code used by both:
 * - ProceduralFireMaterial (single-mesh fire effects)
 * - InstancedFireMaterial (GPU-instanced fire elements)
 *
 * By centralizing the fire logic here, we ensure:
 * - Single source of truth for fire visuals
 * - Consistent behavior across all fire effects
 * - One fix applies to all fire materials
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// NOISE UTILITIES (GLSL)
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * GLSL noise functions: simplex noise, FBM, and turbulence
 * Used for procedural flame generation
 */
export const NOISE_GLSL = /* glsl */`
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

// Fractal Brownian Motion - 3 octaves (reduced from 6 for GPU performance)
float fbm3(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for (int i = 0; i < 3; i++) {
        value += amplitude * snoise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

// Turbulence - absolute value FBM for sharper, more chaotic patterns
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
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// FIRE COLOR UTILITIES (GLSL)
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * GLSL blackbody-inspired color ramp for realistic fire
 * Maps local intensity + global temperature to fire color
 */
export const FIRE_COLOR_GLSL = /* glsl */`
// Blackbody-inspired color ramp for realistic fire
// t is local intensity (0-1), temperature is global hotness
vec3 fireColor(float t, float temperature) {
    float heat = t * (0.5 + temperature * 0.5);
    vec3 color;

    if (heat < 0.25) {
        // Dark red to orange (embers)
        float f = heat / 0.25;
        color = vec3(0.5 + f * 0.5, f * 0.2, 0.0);
    } else if (heat < 0.5) {
        // Orange to yellow
        float f = (heat - 0.25) / 0.25;
        color = vec3(1.0, 0.2 + f * 0.6, f * 0.1);
    } else if (heat < 0.75) {
        // Yellow to white
        float f = (heat - 0.5) / 0.25;
        color = vec3(1.0, 0.8 + f * 0.2, 0.1 + f * 0.6);
    } else {
        // White to blue-white (plasma)
        float f = (heat - 0.75) / 0.25;
        color = vec3(1.0 - f * 0.2, 1.0, 0.7 + f * 0.3);
    }

    return color;
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// FIRE FRAGMENT CORE (GLSL)
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Core fire fragment processing: flame pattern, vertical fade, flicker,
 * fresnel glow, color calculation, and alpha handling.
 *
 * Expected uniforms: uTemperature, uIntensity, uOpacity, uNoiseScale,
 *                    uFlickerSpeed, uFlickerAmount, uEdgeFade
 * Expected varyings: vPosition, vNormal, vViewDir, vDisplacement, vVerticalGradient
 * Required: localTime variable must be defined before including this
 *
 * Outputs: color (vec3), alpha (float) - ready for final output
 */
export const FIRE_FRAGMENT_CORE = /* glsl */`
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewDir);

    // ═══════════════════════════════════════════════════════════════════════════════
    // FLAME PATTERN GENERATION
    // ═══════════════════════════════════════════════════════════════════════════════

    // Animated noise position - flames rise upward (very slow for realism)
    vec3 noisePos = vPosition * uNoiseScale + vec3(0.0, -localTime * 0.00085, 0.0);

    // Primary flame pattern using turbulence (3 octaves for GPU performance)
    float flame = turbulence(noisePos, 3);

    // Secondary detail layer (very slow)
    vec3 detailPos = noisePos * 2.0 + vec3(localTime * 0.00015, 0.0, localTime * 0.0001);
    float detail = snoise(detailPos) * 0.5 + 0.5;

    // Position-based variation for non-uniform flames
    float posVariation = snoise(vPosition * 7.0) * 0.15 + 0.92;

    // Combine layers with position variation
    flame = (flame * 0.7 + detail * 0.3) * posVariation;

    // ═══════════════════════════════════════════════════════════════════════════════
    // VERTICAL FLAME FALLOFF
    // ═══════════════════════════════════════════════════════════════════════════════

    // Flames are strongest at bottom, fade toward top
    float verticalFade = 1.0 - pow(vVerticalGradient, 1.5);

    // But tips can have wispy bright spots
    float tipBrightness = smoothstep(0.7, 0.9, vVerticalGradient) * flame * 0.5;

    // ═══════════════════════════════════════════════════════════════════════════════
    // FLICKER ANIMATION
    // ═══════════════════════════════════════════════════════════════════════════════

    // Position-based flicker offset for per-flame variation
    float flickerOffset = snoise(vPosition * 3.0) * 2.0;

    float flicker = 1.0 - uFlickerAmount + uFlickerAmount *
        (snoise(vec3(localTime * uFlickerSpeed + flickerOffset, vPosition.y * 5.0, vPosition.x * 3.0)) * 0.5 + 0.5);

    // Gentle micro-flicker (very slow)
    float microFlicker = 0.95 + 0.05 * snoise(vec3(localTime * 0.004, vPosition.yz * 6.0));
    flicker *= microFlicker;

    // ═══════════════════════════════════════════════════════════════════════════════
    // FRESNEL EDGE GLOW
    // ═══════════════════════════════════════════════════════════════════════════════

    float fresnel = 1.0 - abs(dot(normal, viewDir));
    fresnel = pow(fresnel, 2.0);

    // Edge flames - bright rim effect
    float edgeGlow = fresnel * (0.5 + flame * 0.5);

    // ═══════════════════════════════════════════════════════════════════════════════
    // COLOR CALCULATION
    // ═══════════════════════════════════════════════════════════════════════════════

    // Local intensity combines all factors
    float localIntensity = flame * verticalFade * flicker + tipBrightness + edgeGlow * 0.3;
    localIntensity = clamp(localIntensity, 0.0, 1.0);

    // Get fire color based on intensity and global temperature
    vec3 color = fireColor(localIntensity, uTemperature);

    // Apply intensity multiplier for bloom
    color *= uIntensity * (0.7 + localIntensity * 0.3);

    // ═══════════════════════════════════════════════════════════════════════════════
    // ALPHA CALCULATION
    // ═══════════════════════════════════════════════════════════════════════════════

    // Base alpha from flame intensity
    float alpha = localIntensity * uOpacity;

    // Soft edge fade based on distance from surface
    float surfaceFade = smoothstep(0.0, uEdgeFade, vDisplacement);
    alpha *= mix(1.0, surfaceFade, 0.5);

    // Vertical fade - tips become more transparent
    alpha *= mix(1.0, 1.0 - vVerticalGradient * 0.5, 0.3);

    // Fresnel adds brightness at edges
    alpha += fresnel * 0.2 * flame;

    // Final alpha clamp
    alpha = clamp(alpha, 0.0, 1.0);
`;

/**
 * Floor color and discard logic - applied after alpha modifications
 * Temperature-dependent floor prevents dark spots on geometry
 *
 * NOTE: Threshold 0.08 balances GPU performance (vs 0.05) with visual quality (vs 0.12)
 * Lower thresholds render more semi-transparent pixels = higher GPU load
 */
export const FIRE_FLOOR_AND_DISCARD_GLSL = /* glsl */`
    // Temperature-dependent floor color: dark red (cold) → bright orange (hot)
    // Applied BEFORE discard so floor color contributes to visibility
    vec3 floorColor = mix(vec3(0.5, 0.15, 0.0), vec3(1.0, 0.5, 0.05), uTemperature);
    color = max(color, floorColor * uIntensity * 0.6);

    // Threshold 0.08: balances GPU perf (many overlapping elements) with no dark lines
    if (alpha < 0.08) discard;
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// JAVASCRIPT UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Interpolate between three values based on parameter (0-1)
 * Used for temperature-dependent parameter derivation
 *
 * @param {number} low - Value at t=0
 * @param {number} mid - Value at t=0.5
 * @param {number} high - Value at t=1
 * @param {number} t - Interpolation parameter (0-1)
 * @returns {number} Interpolated value
 */
export function lerp3(low, mid, high, t) {
    if (t < 0.5) {
        return low + (mid - low) * (t * 2);
    }
    return mid + (high - mid) * ((t - 0.5) * 2);
}

/**
 * Derive fire material parameters from temperature
 * Provides consistent defaults across all fire materials
 *
 * @param {number} temperature - Fire temperature (0-1)
 * @param {Object} [overrides] - Optional explicit overrides
 * @returns {Object} Derived parameters
 */
export function deriveFireParameters(temperature, overrides = {}) {
    return {
        intensity: overrides.intensity ?? lerp3(1.5, 2.5, 4.0, temperature),
        flickerSpeed: overrides.flickerSpeed ?? lerp3(0.001, 0.002, 0.003, temperature),
        flickerAmount: overrides.flickerAmount ?? lerp3(0.15, 0.12, 0.08, temperature),
    };
}

/**
 * Default fire material options
 * Single source of truth for all fire material defaults
 */
export const FIRE_DEFAULTS = {
    temperature: 0.5,
    opacity: 0.85,
    flameHeight: 0.08,
    turbulence: 0.03,
    displacementStrength: 0.04,
    noiseScale: 4.0,
    edgeFade: 0.25,
    fadeInDuration: 0.3,
    fadeOutDuration: 0.5,
};

export default {
    NOISE_GLSL,
    FIRE_COLOR_GLSL,
    FIRE_FRAGMENT_CORE,
    FIRE_FLOOR_AND_DISCARD_GLSL,
    lerp3,
    deriveFireParameters,
    FIRE_DEFAULTS,
};
