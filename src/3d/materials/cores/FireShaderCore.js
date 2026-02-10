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

// Configurable octave FBM (3-5 octaves for quality control)
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
// Creates more organic, billowing flame movement
// BOOSTED: 5x faster speeds for visible movement
float layeredTurbulence(vec3 p, float time) {
    // Large-scale billowing (base movement) - visible slow roll
    float large = turbulence(p * 0.5 + vec3(0.0, -time * 0.0025, 0.0), 3) * 0.4;

    // Medium detail at medium speed (main flame movement)
    float medium = turbulence(p + vec3(time * 0.0015, -time * 0.005, 0.0), 3) * 0.35;

    // Fine detail fast movement (flickering wisps) - clearly visible
    float fine = snoise(p * 2.5 + vec3(time * 0.003, -time * 0.01, time * 0.002)) * 0.25;

    // Extra fast micro-detail for shimmer
    float micro = snoise(p * 4.0 + vec3(0.0, -time * 0.02, 0.0)) * 0.1;

    return large + medium + fine + micro;
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// FIRE COLOR UTILITIES (GLSL)
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * GLSL blackbody-inspired color ramp for realistic fire with ethereal wisps
 * Maps local intensity + global temperature + edge factor to fire color
 *
 * @param t - Local intensity (0-1)
 * @param temperature - Global hotness (0-1)
 * @param edgeFactor - How close to flame edge (0=core, 1=edge) for ethereal blue/violet tint
 */
export const FIRE_COLOR_GLSL = /* glsl */`
// Blackbody-inspired color ramp with ethereal outer wisps
// t is local intensity (0-1), temperature is global hotness, edgeFactor for cool edge tint
vec3 fireColor(float t, float temperature, float edgeFactor) {
    float heat = t * (0.5 + temperature * 0.5);
    vec3 color;

    // Refined 5-band blackbody curve with smoother transitions
    if (heat < 0.2) {
        // Dark red to deep orange (embers)
        float f = heat / 0.2;
        color = vec3(0.3 + f * 0.4, f * 0.15, 0.0);
    } else if (heat < 0.4) {
        // Deep orange to bright orange
        float f = (heat - 0.2) / 0.2;
        color = vec3(0.7 + f * 0.3, 0.15 + f * 0.45, f * 0.05);
    } else if (heat < 0.6) {
        // Orange-yellow to yellow
        float f = (heat - 0.4) / 0.2;
        color = vec3(1.0, 0.6 + f * 0.25, 0.05 + f * 0.15);
    } else if (heat < 0.8) {
        // Yellow to yellow-white
        float f = (heat - 0.6) / 0.2;
        color = vec3(1.0, 0.85 + f * 0.15, 0.2 + f * 0.5);
    } else {
        // White to blue-white (plasma)
        float f = (heat - 0.8) / 0.2;
        color = vec3(1.0 - f * 0.15, 1.0, 0.7 + f * 0.3);
    }

    // ETHEREAL: Cool blue-violet tint at outer edges
    // Creates magical/ethereal look visible at flame boundaries
    // BOOSTED: Now visible even at high temperatures
    vec3 etherealTint = vec3(0.5, 0.6, 1.0);  // Deeper blue
    // Use sqrt to preserve more tint at high heat, boost multiplier to 0.5
    float heatPreserve = max(0.3, 1.0 - heat * 0.7);  // Never fully suppress
    float etherealAmount = edgeFactor * heatPreserve * 0.5;
    color = mix(color, etherealTint * 0.6, etherealAmount);

    return color;
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// FIRE FRAGMENT CORE (GLSL)
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Core fire fragment processing: flame pattern, vertical fade, flicker,
 * fresnel glow, embers, color calculation, and alpha handling.
 *
 * Expected uniforms: uTemperature, uIntensity, uOpacity, uNoiseScale,
 *                    uFlickerSpeed, uFlickerAmount, uEdgeFade,
 *                    uEdgeSoftness, uEmberDensity, uEmberBrightness
 * Expected varyings: vPosition, vNormal, vViewDir, vDisplacement, vVerticalGradient
 * Required: localTime variable must be defined before including this
 *
 * Outputs: color (vec3), alpha (float) - ready for final output
 */
export const FIRE_FRAGMENT_CORE = /* glsl */`
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewDir);

    // ═══════════════════════════════════════════════════════════════════════════════
    // FLAME PATTERN GENERATION (Layered multi-scale noise)
    // ═══════════════════════════════════════════════════════════════════════════════

    // Animated noise position - flames rise upward
    vec3 noisePos = vPosition * uNoiseScale + vec3(0.0, -localTime * 0.00085, 0.0);

    // Use layered turbulence for more organic, billowing flames
    float flameRaw = layeredTurbulence(noisePos, localTime);

    // Position-based variation for non-uniform flames
    float posVariation = snoise(vPosition * 7.0) * 0.15 + 0.92;
    flameRaw *= posVariation;

    // FIX: Remap flame to never go below 0.35 - prevents dark interiors
    // Maps raw noise [0,1] to [0.35, 1.0] so fire is always bright
    float flame = 0.35 + flameRaw * 0.65;

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

    // Gentle micro-flicker
    float microFlicker = 0.95 + 0.05 * snoise(vec3(localTime * 0.004, vPosition.yz * 6.0));
    flicker *= microFlicker;

    // ═══════════════════════════════════════════════════════════════════════════════
    // CORE GLOW + FRESNEL EDGE (Fire is bright at center AND edges)
    // ═══════════════════════════════════════════════════════════════════════════════

    float fresnel = 1.0 - abs(dot(normal, viewDir));
    float softFresnel = pow(fresnel, 2.5);  // Softer power for ethereal edges

    // CORE GLOW: Center of flame is brightest (inverse fresnel)
    // This prevents dark interiors - fire should glow from within
    float coreGlow = (1.0 - fresnel) * 0.4;  // Bright at center where fresnel is low

    // Edge flames - bright rim effect (but secondary to core)
    float edgeGlow = softFresnel * (0.3 + flame * 0.3);

    // Edge factor for ethereal color tinting (higher at edges)
    float edgeFactor = softFresnel * (1.0 - flame * 0.3);

    // ═══════════════════════════════════════════════════════════════════════════════
    // COLOR CALCULATION
    // ═══════════════════════════════════════════════════════════════════════════════

    // Local intensity combines all factors - INCLUDES CORE GLOW for bright centers
    float localIntensity = flame * verticalFade * flicker + tipBrightness + edgeGlow * 0.3 + coreGlow;

    // FIX: Enforce minimum intensity to prevent dark spots
    localIntensity = max(localIntensity, 0.4);
    localIntensity = clamp(localIntensity, 0.0, 1.0);

    // Get fire color with ethereal edge tinting
    vec3 color = fireColor(localIntensity, uTemperature, edgeFactor);

    // Apply intensity multiplier for bloom
    color *= uIntensity * (0.7 + localIntensity * 0.3);

    // ═══════════════════════════════════════════════════════════════════════════════
    // EMBER/SPARK GENERATION
    // ═══════════════════════════════════════════════════════════════════════════════

    // High-frequency noise for sparse bright spots (when density > 0)
    if (uEmberDensity > 0.01) {
        // FASTER animation for visible movement
        vec3 emberPos = vPosition * 12.0 + vec3(localTime * 0.004, -localTime * 0.015, localTime * 0.003);
        float emberNoise = snoise(emberPos);

        // Lower threshold = more embers visible
        float emberThreshold = 0.65 - uEmberDensity * 0.4;
        float embers = smoothstep(emberThreshold, emberThreshold + 0.15, emberNoise);

        // Embers throughout flame, concentrated near top
        embers *= smoothstep(0.1, 0.6, vVerticalGradient);

        // Faster, more dramatic flicker
        float emberFlicker = 0.5 + 0.5 * snoise(vec3(localTime * 0.04, emberPos.xy * 1.5));
        embers *= emberFlicker;

        // CONTRASTING EMBERS: Orange-red core with bright white tip
        // This creates visual contrast even against yellow-white hot fire
        vec3 emberCore = vec3(1.0, 0.4, 0.1);   // Deep orange
        vec3 emberTip = vec3(1.2, 1.1, 1.0);    // Bright white (over 1 for bloom)
        float emberIntensity = embers * uEmberBrightness;
        vec3 emberColor = mix(emberCore, emberTip, emberIntensity * 0.5);

        // Add with higher multiplier for visibility
        color += emberColor * emberIntensity * uIntensity * 1.5;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // ALPHA CALCULATION (Simplified - no center dimming)
    // ═══════════════════════════════════════════════════════════════════════════════

    // Base alpha from flame intensity
    float alpha = localIntensity * uOpacity;

    // Soft edge fade based on distance from surface (keep - affects outer boundary only)
    float surfaceFade = smoothstep(0.0, uEdgeFade, vDisplacement);
    alpha *= mix(1.0, surfaceFade, 0.3);  // Reduced from 0.5

    // Vertical fade - tips become slightly more transparent (reduced effect)
    alpha *= mix(1.0, 1.0 - vVerticalGradient * 0.3, 0.2);  // Reduced

    // Fresnel adds brightness at edges (keep)
    alpha += softFresnel * 0.15 * flame;

    // REMOVED: Distance-based center dimming (caused dark interiors)
    // REMOVED: Fresnel-based center dimming (caused dark interiors)

    // FIX: Enforce minimum alpha to prevent semi-transparent dark fragments
    // Fire should be opaque enough to show its color, not the background
    alpha = max(alpha, 0.6);

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
    // Temperature-dependent floor color: orange (cold) → bright yellow-white (hot)
    // BOOSTED: Higher base colors and 0.95 multiplier to eliminate dark interiors
    vec3 floorColor = mix(vec3(0.8, 0.4, 0.1), vec3(1.0, 0.7, 0.3), uTemperature);
    color = max(color, floorColor * uIntensity * 0.95);

    // ETHEREAL EDGE TINT: Apply AFTER floor color so it's not overwritten
    // Uses softFresnel (defined earlier) to add blue-violet to outer edges
    vec3 etherealEdge = vec3(0.4, 0.5, 1.0);  // Blue-violet
    float etherealStrength = softFresnel * 0.35;  // Visible at edges
    color = mix(color, color + etherealEdge * 0.5, etherealStrength);

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
        intensity: overrides.intensity ?? lerp3(3.0, 5.0, 7.0, temperature),
        flickerSpeed: overrides.flickerSpeed ?? lerp3(0.001, 0.002, 0.003, temperature),
        flickerAmount: overrides.flickerAmount ?? lerp3(0.15, 0.12, 0.08, temperature),
        // NEW: Temperature affects ember density and brightness
        emberDensity: overrides.emberDensity ?? lerp3(0.1, 0.3, 0.5, temperature),
        emberBrightness: overrides.emberBrightness ?? lerp3(0.8, 1.2, 2.0, temperature),
        // NEW: Hotter fires have harder edges (more defined)
        edgeSoftness: overrides.edgeSoftness ?? lerp3(0.6, 0.5, 0.3, temperature),
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
    // NEW: Enhanced visual parameters
    edgeSoftness: 0.5,       // Alpha softness at edges (0=hard, 1=soft)
    emberDensity: 0.3,       // Density of spark hot spots (0-1)
    emberBrightness: 0.8,    // Brightness of embers (0-2)
    velocityStretch: 0.5,    // Flame stretch along velocity (0-2)
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
