/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Water Shader Core
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Shared GLSL code and utilities for water materials
 * @module materials/cores/WaterShaderCore
 *
 * This module provides the core shader code used by both:
 * - ProceduralWaterMaterial (single-mesh water effects)
 * - InstancedWaterMaterial (GPU-instanced water elements)
 *
 * By centralizing the water logic here, we ensure:
 * - Single source of truth for water visuals
 * - Consistent behavior across all water effects
 * - One fix applies to all water materials
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// NOISE UTILITIES (GLSL)
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * GLSL noise functions for water effects
 * Uses 4-octave FBM for fluid motion
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

// Fractal Brownian Motion - 4 octaves for fluid motion
float fbm4(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for (int i = 0; i < 4; i++) {
        value += amplitude * snoise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// WATER COLOR UTILITIES (GLSL)
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * GLSL water color ramp
 * Maps intensity and turbulence to realistic water colors
 *
 * @param intensity - Local intensity (0-1)
 * @param turbulence - How turbulent the water is (0=calm, 1=storm)
 */
export const WATER_COLOR_GLSL = /* glsl */`
// Water color palette constants (accessible for effects)
const vec3 WATER_DEEP = vec3(0.05, 0.15, 0.35);       // Deep blue
const vec3 WATER_MID = vec3(0.15, 0.4, 0.6);          // Ocean blue
const vec3 WATER_BRIGHT = vec3(0.3, 0.6, 0.8);        // Bright cyan
const vec3 WATER_FOAM = vec3(0.85, 0.92, 1.0);        // White foam/highlights
const vec3 WATER_SUBSURFACE = vec3(0.2, 0.5, 0.7);    // Subsurface scatter color

// Water color based on local intensity and turbulence
vec3 waterColor(float intensity, float turbulence) {
    // Mix based on intensity
    vec3 color;
    if (intensity < 0.33) {
        color = mix(WATER_DEEP, WATER_MID, intensity * 3.0);
    } else if (intensity < 0.66) {
        color = mix(WATER_MID, WATER_BRIGHT, (intensity - 0.33) * 3.0);
    } else {
        color = mix(WATER_BRIGHT, WATER_FOAM, (intensity - 0.66) * 3.0);
    }

    return color;
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// WATER FRAGMENT CORE (GLSL)
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Core water fragment processing: flow patterns, fresnel, shimmer,
 * color calculation, and alpha handling.
 *
 * Expected uniforms: uTurbulence, uIntensity, uOpacity, uNoiseScale,
 *                    uFlowSpeed, uEdgeFade, uTint, uGlowScale
 * Expected varyings: vPosition, vNormal, vViewDir, vDisplacement, vNoiseValue
 * Required: localTime variable must be defined before including this
 *
 * Outputs: color (vec3), alpha (float) - ready for final output
 */
export const WATER_FRAGMENT_CORE = /* glsl */`
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewDir);

    // ═══════════════════════════════════════════════════════════════════════════════
    // WATER PATTERN GENERATION
    // ═══════════════════════════════════════════════════════════════════════════════

    // Animated noise for surface patterns
    vec3 noisePos = vPosition * uNoiseScale + vec3(
        localTime * 0.001,
        localTime * 0.0008,
        localTime * 0.0009
    );

    // Primary flow pattern
    float flow = fbm4(noisePos);

    // Secondary ripple detail
    vec3 ripplePos = noisePos * 2.0 + vec3(localTime * 0.0004, 0.0, localTime * 0.0005);
    float ripple = snoise(ripplePos) * 0.5 + 0.5;

    // Per-instance variation
    float posVariation = snoise(vPosition * 4.0 + vec3(vRandomSeed * 10.0)) * 0.15 + 0.92;

    // Combine patterns
    float pattern = (flow * 0.5 + ripple * 0.5) * posVariation;
    pattern = pattern * 0.5 + 0.5;
    pattern = pow(pattern, 0.8);

    // ═══════════════════════════════════════════════════════════════════════════════
    // CAUSTIC LIGHT PATTERNS (enhanced refraction simulation)
    // ═══════════════════════════════════════════════════════════════════════════════

    // Primary caustics - overlapping sine waves create light focusing effect
    float caustic1 = sin(flow * 6.28318 + localTime * 0.002);
    float caustic2 = sin(ripple * 6.28318 - localTime * 0.0015);
    float causticBase = abs(caustic1 * caustic2);

    // Secondary caustic layer - finer detail at different speed
    float caustic3 = sin((flow + ripple) * 12.56636 + localTime * 0.003);
    float caustic4 = sin(pattern * 9.42478 - localTime * 0.0025);
    float causticDetail = abs(caustic3 * caustic4) * 0.5;

    // Combine with sharpening
    float caustic = pow(causticBase, 1.5) * 0.45 + pow(causticDetail, 2.0) * 0.25;

    // ═══════════════════════════════════════════════════════════════════════════════
    // ENHANCED RIM GLOW (Stronger Fresnel for meditation aesthetic)
    // ═══════════════════════════════════════════════════════════════════════════════

    float fresnel = 1.0 - abs(dot(normal, viewDir));
    // Lower power = softer, wider glow; higher intensity for dramatic effect
    float rimSoft = pow(fresnel, 2.0);   // Soft wide glow
    float rimSharp = pow(fresnel, 4.0);  // Sharp edge accent

    // Combined rim for layered glow effect
    float rimGlow = rimSoft * 1.2 + rimSharp * 0.8;

    // Edge shimmer (enhanced)
    float edgeShimmer = rimSoft * (0.5 + pattern * 0.5);

    // ═══════════════════════════════════════════════════════════════════════════════
    // IRIDESCENT RIM HIGHLIGHTS (rainbow shimmer at edges)
    // ═══════════════════════════════════════════════════════════════════════════════

    // View-dependent iridescence - shifts color based on angle like soap bubbles
    float iridescentAngle = dot(normal, viewDir) * 3.14159 + localTime * 0.001;
    vec3 iridescent = vec3(
        0.5 + 0.5 * sin(iridescentAngle),
        0.5 + 0.5 * sin(iridescentAngle + 2.094),  // +120 degrees
        0.5 + 0.5 * sin(iridescentAngle + 4.189)   // +240 degrees
    );
    // Apply only to sharp rim edges, subtle effect
    float iridescentStrength = rimSharp * 0.15;

    // ═══════════════════════════════════════════════════════════════════════════════
    // SUBSURFACE SCATTERING
    // ═══════════════════════════════════════════════════════════════════════════════

    // Light passing through water creates characteristic glow
    float subsurface = pow(max(0.0, dot(viewDir, -normal)), 2.0) * 0.3;

    // ═══════════════════════════════════════════════════════════════════════════════
    // ANIMATED SPECULAR HIGHLIGHTS
    // ═══════════════════════════════════════════════════════════════════════════════

    // Moving glints across surface
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
    vec3 halfVec = normalize(lightDir + viewDir);
    float specular = pow(max(0.0, dot(normal, halfVec)), 32.0);
    // Animate specular position
    float specShift = sin(localTime * 0.003 + vPosition.x * 8.0) * 0.5 + 0.5;
    specular *= specShift * 0.5;

    // ═══════════════════════════════════════════════════════════════════════════════
    // FLOW ANIMATION (subtle pulsing)
    // ═══════════════════════════════════════════════════════════════════════════════

    // Per-instance flow offset
    float flowOffset = snoise(vPosition * 2.0 + vec3(vRandomSeed * 5.0)) * 1.5;
    float flowPulse = sin(localTime * uFlowSpeed * 0.002 + flowOffset) * 0.1 + 0.9;

    // Micro-shimmer
    float microShimmer = 0.95 + 0.05 * snoise(vec3(localTime * 0.003, vPosition.yz * 4.0));
    flowPulse *= microShimmer;

    // ═══════════════════════════════════════════════════════════════════════════════
    // ENHANCED INTERNAL SPIRAL FLOW
    // ═══════════════════════════════════════════════════════════════════════════════

    // Create visible internal currents with spiral pattern
    float spiralAngle = atan(vPosition.y, vPosition.x) + localTime * 0.001;
    float spiralRadius = length(vPosition.xy);
    float spiralFlow = sin(spiralAngle * 3.0 - spiralRadius * 4.0 + localTime * 0.002);
    spiralFlow = spiralFlow * 0.5 + 0.5;  // Normalize to 0-1

    // Secondary counter-rotating spiral for depth
    float spiral2 = sin(-spiralAngle * 2.0 + spiralRadius * 3.0 + localTime * 0.0015);
    spiral2 = spiral2 * 0.5 + 0.5;

    // Combined internal flow visibility
    float internalFlow = mix(spiralFlow, spiral2, 0.4) * 0.15;

    // ═══════════════════════════════════════════════════════════════════════════════
    // COLOR CALCULATION
    // ═══════════════════════════════════════════════════════════════════════════════

    float localIntensity = pattern * flowPulse + edgeShimmer * 0.25;
    localIntensity = clamp(localIntensity, 0.0, 1.0);

    // Get water color
    vec3 color = waterColor(localIntensity, uTurbulence);

    // Add caustic highlights
    color += caustic * WATER_BRIGHT;

    // Add subsurface scattering
    color += subsurface * WATER_SUBSURFACE;

    // Add specular highlights
    color += specular * vec3(1.0, 1.0, 1.0);

    // Apply iridescent rim shimmer
    color += iridescent * iridescentStrength * uGlowScale;

    // Apply internal spiral flow - brightens along flow lines
    color += internalFlow * WATER_BRIGHT * uIntensity;

    // ═══════════════════════════════════════════════════════════════════════════════
    // INNER GLOW / SELF-ILLUMINATION (scaled by uGlowScale)
    // ═══════════════════════════════════════════════════════════════════════════════

    // Water appears to glow from within - tied to noise pattern
    // Low base values so glowScale=1.0 is "normal", higher values push into bloom
    float innerGlow = pattern * 0.12 + flowPulse * 0.05;
    vec3 glowColor = vec3(0.3, 0.55, 0.8);  // Softer blue (less saturated)
    color += innerGlow * glowColor * uIntensity * uGlowScale;

    // Rim glow - significantly reduced so it doesn't blow out
    color += rimGlow * WATER_BRIGHT * uIntensity * 0.15 * uGlowScale;

    // Apply tint
    color *= uTint;

    // Apply intensity multiplier
    color *= uIntensity * (0.7 + localIntensity * 0.3);

    // ═══════════════════════════════════════════════════════════════════════════════
    // BLOOM HINT (values > 1.0 for post-processing bloom to catch)
    // ═══════════════════════════════════════════════════════════════════════════════

    // Sharp edge highlight - very subtle at base, gestureGlow ramps it up
    color += rimSharp * vec3(0.1, 0.18, 0.25) * uIntensity * uGlowScale;

    // ═══════════════════════════════════════════════════════════════════════════════
    // DEPTH VARIATION (thicker interior, transparent edges)
    // ═══════════════════════════════════════════════════════════════════════════════

    // Use normal-view alignment as proxy for depth
    float depthFactor = abs(dot(normal, viewDir));
    float depthAlpha = mix(0.5, 1.0, depthFactor);

    // ═══════════════════════════════════════════════════════════════════════════════
    // ALPHA CALCULATION
    // ═══════════════════════════════════════════════════════════════════════════════

    float alpha = (0.25 + localIntensity * 0.6) * uOpacity;

    // Apply depth variation
    alpha *= depthAlpha;

    // Edge fade based on displacement
    float surfaceFade = smoothstep(0.0, uEdgeFade, abs(vDisplacement) + 0.05);
    alpha *= mix(0.85, 1.0, surfaceFade);

    // Enhanced fresnel rim effect
    alpha += rimSoft * 0.2;

    alpha = clamp(alpha, 0.0, 1.0);
`;

/**
 * Arc edge foam effect for vortex animations
 * Adds bright foam accumulation at leading/trailing edges of rotating arcs
 *
 * Expected: vArcVisibility varying from vertex shader
 * Should be called AFTER base color calculation, BEFORE final output
 */
export const WATER_ARC_FOAM_GLSL = /* glsl */`
    // Foam accumulates at arc edges (where visibility transitions)
    float arcEdgeFoam = smoothstep(0.5, 0.85, vArcVisibility) * (1.0 - smoothstep(0.85, 1.0, vArcVisibility));
    // Secondary foam at leading edge
    float leadingFoam = smoothstep(0.0, 0.3, vArcVisibility) * (1.0 - smoothstep(0.3, 0.5, vArcVisibility));
    float totalFoam = max(arcEdgeFoam, leadingFoam * 0.7);

    // Add foam color with animated shimmer - reduced mix amount
    float foamShimmer = 0.8 + 0.2 * sin(localTime * 0.005 + vPosition.x * 10.0);
    color = mix(color, WATER_FOAM * foamShimmer, totalFoam * 0.35);

    // ═══════════════════════════════════════════════════════════════════════════════
    // DRAMATIC ARC EDGE GRADIENT (scaled by uGlowScale)
    // ═══════════════════════════════════════════════════════════════════════════════

    // Color shifts toward bright cyan at arc edges for dramatic effect
    // Reduced base values - gestureGlow ramps this up for impact
    float arcEdgeIntensity = 1.0 - vArcVisibility;  // Inverse: brighter at fading edges
    vec3 edgeGlow = WATER_FOAM * (0.8 + 0.15 * uGlowScale);  // Subtle overexposure
    color = mix(color, edgeGlow, arcEdgeIntensity * 0.2 * uGlowScale);

    // Extra bloom hint at arc edges (scaled) - reduced for subtlety
    color += arcEdgeIntensity * vec3(0.1, 0.2, 0.25) * 0.3 * uGlowScale;

    // Foam is more opaque
    alpha = mix(alpha, min(1.0, alpha + 0.3), totalFoam);

    // Arc edges slightly more visible
    alpha = mix(alpha, min(1.0, alpha + 0.15), arcEdgeIntensity * 0.4);
`;

/**
 * Cutout effect - creates transparent holes to break up water shapes
 * Combines cellular/bubble holes with flow-aligned streaks
 *
 * Expected uniforms: uCutoutStrength (0=solid, 1=maximum holes)
 * Expected variables: pattern, flow, vPosition, localTime
 * Should be called BEFORE final alpha calculation
 */
export const WATER_CUTOUT_GLSL = /* glsl */`
    // ═══════════════════════════════════════════════════════════════════════════════
    // CUTOUT EFFECT (cellular holes + flow streaks)
    // ═══════════════════════════════════════════════════════════════════════════════

    if (uCutoutStrength > 0.01) {
        // --- CELLULAR/BUBBLE HOLES ---
        // Create voronoi-like cell pattern using layered noise
        vec3 cellPos = vPosition * 6.0 + vec3(localTime * 0.0005);
        float cell1 = snoise(cellPos);
        float cell2 = snoise(cellPos * 1.7 + vec3(50.0));

        // Combine cells - areas where both are low become holes
        float cellPattern = min(cell1, cell2);

        // Threshold creates discrete holes (sharper = more defined holes)
        float cellHoles = smoothstep(-0.3, 0.1, cellPattern);

        // --- FLOW-ALIGNED STREAKS ---
        // Streaks that follow the internal flow direction
        float streakAngle = atan(vPosition.y, vPosition.x);
        float streakPhase = streakAngle * 4.0 + flow * 3.0 + localTime * 0.001;
        float streak = sin(streakPhase);

        // Secondary perpendicular streaks for cross-hatch effect
        float streak2 = sin(streakPhase * 0.7 + 2.094);

        // Combine streaks - both high = visible, either low = transparent
        float streakPattern = max(streak, streak2);
        float streakHoles = smoothstep(-0.2, 0.3, streakPattern);

        // --- ANIMATED DISSOLUTION ---
        // Some holes grow and shrink over time
        float dissolvePhase = localTime * 0.002 + snoise(vPosition * 3.0) * 6.28318;
        float dissolve = sin(dissolvePhase) * 0.3 + 0.7;

        // --- COMBINE ALL CUTOUT PATTERNS ---
        // Multiply patterns: hole where ANY pattern has a hole
        float cutoutMask = cellHoles * streakHoles * dissolve;

        // Apply cutout strength (0 = no cutout, 1 = full cutout)
        // Interpolate between 1.0 (solid) and cutoutMask
        float finalCutout = mix(1.0, cutoutMask, uCutoutStrength);

        // BINARY CUTOUT: discard below threshold, keep full brightness above
        // This prevents dark semi-transparent artifacts
        float cutoutThreshold = 0.5;
        if (finalCutout < cutoutThreshold) {
            discard;
        }

        // Brighten edges of holes (foam rim effect)
        float holeEdge = smoothstep(cutoutThreshold, cutoutThreshold + 0.15, finalCutout)
                       * (1.0 - smoothstep(cutoutThreshold + 0.15, cutoutThreshold + 0.3, finalCutout));
        color += holeEdge * WATER_FOAM * 0.5 * uCutoutStrength;
    }
`;

/**
 * Drip anticipation effect - bright spots that pulse suggesting droplets about to fall
 * Creates the illusion of surface tension holding water that wants to drip
 *
 * Expected: vPosition varying, localTime variable, pattern variable
 * Should be called AFTER base color calculation
 */
export const WATER_DRIP_ANTICIPATION_GLSL = /* glsl */`
    // ═══════════════════════════════════════════════════════════════════════════════
    // DRIP ANTICIPATION (bright spots suggesting surface tension)
    // ═══════════════════════════════════════════════════════════════════════════════

    // Create multiple potential drip points using spatial hash
    float dripHash1 = snoise(vPosition * 8.0 + vec3(12.34, 56.78, 90.12));
    float dripHash2 = snoise(vPosition * 8.0 + vec3(98.76, 54.32, 10.98));

    // Only some areas become drip points (threshold creates sparse points)
    float dripPoint1 = smoothstep(0.7, 0.85, dripHash1);
    float dripPoint2 = smoothstep(0.7, 0.85, dripHash2);

    // Each drip point has its own pulse timing (offset by position hash)
    float dripPhase1 = localTime * 0.003 + dripHash1 * 6.28318;
    float dripPhase2 = localTime * 0.0025 + dripHash2 * 6.28318;

    // Pulse pattern: slow build, quick release (like water gathering then almost falling)
    // Uses sawtooth-like wave that builds slowly then drops
    float dripPulse1 = pow(fract(dripPhase1 * 0.15), 3.0);  // Slow cubic build
    float dripPulse2 = pow(fract(dripPhase2 * 0.12), 3.0);

    // Occasional bright flash at peak (surface tension breaking point)
    float dripFlash1 = smoothstep(0.85, 0.95, dripPulse1) * (1.0 - smoothstep(0.95, 1.0, dripPulse1));
    float dripFlash2 = smoothstep(0.85, 0.95, dripPulse2) * (1.0 - smoothstep(0.95, 1.0, dripPulse2));

    // Combine drip effects
    float dripIntensity = dripPoint1 * (dripPulse1 * 0.3 + dripFlash1 * 0.7)
                        + dripPoint2 * (dripPulse2 * 0.3 + dripFlash2 * 0.7);

    // Apply drip highlights - bright white-cyan flash
    vec3 dripColor = mix(WATER_BRIGHT, WATER_FOAM, dripFlash1 + dripFlash2);
    color += dripIntensity * dripColor * 0.4 * uGlowScale;

    // Drips are slightly more opaque at gathering points
    alpha = mix(alpha, min(1.0, alpha + 0.1), dripIntensity);
`;

/**
 * Floor color and discard logic for water
 * Prevents water from becoming too transparent
 */
export const WATER_FLOOR_AND_DISCARD_GLSL = /* glsl */`
    // Minimum brightness floor - subtle blue
    color = max(color, vec3(0.1, 0.2, 0.4) * uIntensity * 0.4);

    // Soft brightness compression - preserves color variation while controlling bloom
    // Uses exponential rolloff above threshold instead of hard clamp
    // uBloomThreshold is set per-mascot: 0.35 for crystal/heart/rough, 0.85 for moon/star
    float knee = 0.15 + uGlowScale * 0.1;  // Compression softness scales with glow
    float maxChannel = max(color.r, max(color.g, color.b));

    if (maxChannel > uBloomThreshold) {
        // Exponential compression: high values compressed more than low
        float excess = maxChannel - uBloomThreshold;
        float compressed = uBloomThreshold + knee * (1.0 - exp(-excess / knee));
        // Scale color proportionally to preserve hue
        color *= compressed / maxChannel;
    }

    // Discard faint fragments
    if (alpha < 0.1) discard;
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// JAVASCRIPT UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Interpolate between three values based on parameter (0-1)
 * Used for turbulence-dependent parameter derivation
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
 * Derive water material parameters from turbulence
 * Provides consistent defaults across all water materials
 *
 * @param {number} turbulence - Water turbulence (0-1)
 * @param {Object} [overrides] - Optional explicit overrides
 * @returns {Object} Derived parameters
 */
export function deriveWaterParameters(turbulence, overrides = {}) {
    return {
        intensity: overrides.intensity ?? lerp3(0.8, 1.0, 1.2, turbulence),
        displacementStrength: overrides.displacementStrength ?? lerp3(0.06, 0.1, 0.15, turbulence),
        flowSpeed: overrides.flowSpeed ?? lerp3(0.8, 1.5, 3.0, turbulence),
    };
}

/**
 * Default water material options
 * Single source of truth for all water material defaults
 */
export const WATER_DEFAULTS = {
    turbulence: 0.5,
    intensity: 1.0,
    opacity: 0.85,
    displacementStrength: 0.08,
    flowSpeed: 1.0,
    noiseScale: 3.0,
    edgeFade: 0.15,
    glowScale: 1.0,  // Scale for additive glow effects (0=off, 1=full, >1=bloom-heavy)
    fadeInDuration: 0.3,
    fadeOutDuration: 0.5,
};

export default {
    NOISE_GLSL,
    WATER_COLOR_GLSL,
    WATER_FRAGMENT_CORE,
    WATER_ARC_FOAM_GLSL,
    WATER_CUTOUT_GLSL,
    WATER_DRIP_ANTICIPATION_GLSL,
    WATER_FLOOR_AND_DISCARD_GLSL,
    lerp3,
    deriveWaterParameters,
    WATER_DEFAULTS,
};
