/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Physically-Based Subsurface Scattering
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview BSSRDF-based subsurface scattering for translucent materials
 * @author Emotive Engine Team
 * @module 3d/shaders/utils/subsurfaceScattering
 *
 * Implements Disney/Pixar's Burley normalized diffusion model for realistic SSS.
 * Supports materials like jade, wax, skin, marble, etc.
 *
 * Key features:
 * - Thickness estimation from local geometry
 * - Beer's Law color absorption (wavelength-dependent)
 * - Burley normalized diffusion profile
 * - Curvature-based scattering intensity
 * - Material presets for common translucent materials
 */

/**
 * GLSL code for physically-based subsurface scattering
 * Include this in your fragment shader
 */
export const sssGLSL = `
// ═══════════════════════════════════════════════════════════════════════════
// PHYSICALLY-BASED SUBSURFACE SCATTERING
// Based on Disney's Burley Normalized Diffusion (2015)
// ═══════════════════════════════════════════════════════════════════════════

// SSS Uniforms - declare these in your shader
// uniform float sssStrength;           // Overall SSS intensity (0-1)
// uniform vec3 sssAbsorption;          // Absorption coefficients per RGB channel
// uniform vec3 sssScatterDistance;     // Mean free path / scatter radius per RGB
// uniform float sssThicknessBias;      // Thickness offset (0-1)
// uniform float sssThicknessScale;     // Thickness multiplier
// uniform float sssCurvatureScale;     // How much curvature affects SSS
// uniform float sssAmbient;            // Ambient SSS contribution
// uniform vec3 sssLightDir;            // Primary light direction for SSS
// uniform vec3 sssLightColor;          // Light color for SSS

/**
 * Estimate local thickness from geometry
 * Uses the relationship between view angle and surface normal
 * Combined with a simple depth approximation
 *
 * @param normal - Surface normal in view space
 * @param viewDir - View direction
 * @param position - Vertex position (for depth-based estimation)
 * @param thicknessBias - Base thickness value
 * @param thicknessScale - Thickness multiplier
 * @return Estimated thickness (0-1)
 */
float estimateThickness(vec3 normal, vec3 viewDir, vec3 position, float thicknessBias, float thicknessScale) {
    // Method 1: View-dependent thickness
    // Surfaces facing away from viewer are "thicker" (light travels further)
    float viewThickness = 1.0 - abs(dot(normal, viewDir));

    // Method 2: Position-based depth (simple spherical assumption)
    // Objects are thinner at edges, thicker in center
    float posDepth = 1.0 - length(position) * 0.5;
    posDepth = clamp(posDepth, 0.0, 1.0);

    // Method 3: Curvature hint from normal variation
    // High-frequency normal changes indicate thin areas (edges, details)
    // This is approximated by the gradient of the normal
    float curvatureHint = length(fwidth(normal)) * 10.0;
    curvatureHint = 1.0 - clamp(curvatureHint, 0.0, 1.0);

    // Combine methods with weighting
    float thickness = viewThickness * 0.4 + posDepth * 0.4 + curvatureHint * 0.2;

    // Apply bias and scale
    thickness = thicknessBias + thickness * thicknessScale;

    return clamp(thickness, 0.01, 1.0);
}

/**
 * Beer's Law absorption - light attenuates exponentially through material
 * Different wavelengths absorb at different rates, creating color shifts
 *
 * @param thickness - Distance light travels through material
 * @param absorption - Absorption coefficients per RGB (higher = more absorbed)
 * @return Transmittance per RGB channel (0-1)
 */
vec3 beersLawAbsorption(float thickness, vec3 absorption) {
    // Beer-Lambert Law: T = e^(-σ * d)
    // Where σ is absorption coefficient, d is distance
    return exp(-absorption * thickness * 4.0);
}

/**
 * Burley Normalized Diffusion Profile
 * Disney's approximation of the full BSSRDF, energy-conserving
 *
 * R(r) = A * s * (e^(-s*r) + e^(-s*r/3)) / (8πr)
 *
 * @param radius - Distance from entry point (normalized)
 * @param scatterDist - Mean free path / diffusion length
 * @return Diffusion weight at this radius
 */
float burleyDiffusionProfile(float radius, float scatterDist) {
    // Prevent division by zero
    float r = max(radius, 0.001);
    float s = 1.0 / max(scatterDist, 0.001);

    // Burley's two-term approximation
    float term1 = exp(-s * r);
    float term2 = exp(-s * r / 3.0);

    // Normalized profile (simplified, without 8πr for real-time)
    float profile = (term1 + term2) * s * 0.25;

    return profile;
}

/**
 * Christensen-Burley Normalized Diffusion
 * Improved version with better energy conservation
 *
 * @param radius - Distance from entry point
 * @param A - Surface albedo
 * @param d - Diffusion length (mean free path)
 * @return RGB diffusion weights
 */
vec3 christensenBurleyDiffusion(float radius, vec3 A, vec3 d) {
    vec3 result = vec3(0.0);

    // Per-channel diffusion (different scatter distances for RGB)
    for (int i = 0; i < 3; i++) {
        float s = 1.9 - A[i] + 3.5 * (A[i] - 0.8) * (A[i] - 0.8);
        s = 1.0 / (s * max(d[i], 0.001));

        float r = max(radius, 0.001);

        // Two-exponential fit
        float profile = s * (exp(-s * r) + exp(-s * r / 3.0)) / (8.0 * 3.14159 * r);

        result[i] = profile;
    }

    return result;
}

/**
 * Calculate curvature factor for SSS intensity
 * SSS is more visible on curved surfaces (fingers, ears, edges)
 *
 * @param normal - Surface normal
 * @return Curvature factor (higher = more curved)
 */
float calculateCurvature(vec3 normal) {
    // Use screen-space derivatives to estimate curvature
    vec3 dx = dFdx(normal);
    vec3 dy = dFdy(normal);

    // Curvature magnitude
    float curvature = length(dx) + length(dy);

    // Normalize to useful range
    return clamp(curvature * 5.0, 0.0, 1.0);
}

/**
 * Full physically-based SSS calculation
 * Combines all components for realistic translucent materials
 *
 * @param normal - Surface normal (view space)
 * @param viewDir - View direction
 * @param position - Vertex position
 * @param lightDir - Light direction
 * @param lightColor - Light color
 * @param baseColor - Material base/albedo color
 * @param sssStrength - Overall SSS strength
 * @param absorption - Absorption coefficients RGB (inverted: higher = MORE of that color)
 * @param scatterDist - Scatter distance RGB (higher = more scatter)
 * @param thicknessBias - Base thickness
 * @param thicknessScale - Thickness multiplier
 * @param curvatureScale - Curvature influence
 * @param ambient - Ambient SSS contribution
 * @return Final SSS color contribution
 */
vec3 calculatePhysicalSSS(
    vec3 normal,
    vec3 viewDir,
    vec3 position,
    vec3 lightDir,
    vec3 lightColor,
    vec3 baseColor,
    float sssStrength,
    vec3 absorption,
    vec3 scatterDist,
    float thicknessBias,
    float thicknessScale,
    float curvatureScale,
    float ambient
) {
    if (sssStrength < 0.001) {
        return vec3(0.0);
    }

    // ─────────────────────────────────────────────────────────────────────
    // THICKNESS ESTIMATION
    // ─────────────────────────────────────────────────────────────────────
    float thickness = estimateThickness(normal, viewDir, position, thicknessBias, thicknessScale);

    // ─────────────────────────────────────────────────────────────────────
    // ABSORPTION COLOR (Beer's Law with artist-friendly values)
    // Creates the characteristic color of translucent materials
    // absorption values: high value = MORE of that color passes through (transmitted)
    // This is inverted from physics but intuitive: jade has high green absorption
    // ─────────────────────────────────────────────────────────────────────
    // Use absorption directly as transmittance - higher = more of that color shows
    // Normalize to prevent any channel from dominating
    float maxAbsorption = max(absorption.r, max(absorption.g, absorption.b));
    vec3 normalizedTransmit = absorption / max(maxAbsorption, 0.001);

    // Apply thickness-based falloff - thin areas show more color
    float thicknessFactor = 1.0 - thickness * 0.3;
    vec3 colorShift = normalizedTransmit * thicknessFactor;

    // Ensure minimum color presence
    colorShift = max(colorShift, vec3(0.15));

    // ─────────────────────────────────────────────────────────────────────
    // SCATTER INTENSITY
    // How much light scatters based on material properties
    // ─────────────────────────────────────────────────────────────────────
    // Higher scatter distance = more light gets through, but keep it subtle
    vec3 scatterIntensity = scatterDist * 0.8;
    scatterIntensity = clamp(scatterIntensity, vec3(0.1), vec3(1.0));

    // ─────────────────────────────────────────────────────────────────────
    // LIGHTING TERMS - Boosted for visibility
    // ─────────────────────────────────────────────────────────────────────

    // Back-lighting: light passing through from behind (strongest SSS cue)
    float NdotL = dot(normal, lightDir);
    float backLight = max(0.0, -NdotL);
    backLight = pow(backLight, 1.2) * 1.5;  // Boosted

    // Wrap lighting: soft diffuse that wraps around
    float wrapLight = (NdotL + 1.0) * 0.5;  // Full wrap, 0-1 range
    wrapLight = wrapLight * wrapLight;

    // View-dependent translucency (looking through thin parts)
    float VdotL = dot(viewDir, -lightDir);
    float translucency = pow(max(0.0, VdotL), 1.5) * 1.2;  // Boosted

    // Edge glow (fresnel-like SSS at silhouettes)
    float edgeGlow = pow(1.0 - abs(dot(normal, viewDir)), 2.0);

    // ─────────────────────────────────────────────────────────────────────
    // THICKNESS-BASED TRANSMISSION
    // Thin areas let more light through
    // ─────────────────────────────────────────────────────────────────────
    float thinTransmission = 1.0 - thickness * 0.5;
    thinTransmission = max(thinTransmission, 0.3);

    // ─────────────────────────────────────────────────────────────────────
    // CURVATURE ENHANCEMENT
    // ─────────────────────────────────────────────────────────────────────
    float curvature = calculateCurvature(normal);
    float curvatureFactor = 1.0 + curvature * curvatureScale;

    // ─────────────────────────────────────────────────────────────────────
    // COMBINE ALL TERMS
    // ─────────────────────────────────────────────────────────────────────

    // Total light contribution (more additive for visibility)
    float totalLight = backLight + translucency * 0.8 + wrapLight * 0.4 + edgeGlow * 0.5;
    totalLight *= curvatureFactor * thinTransmission;

    // Base SSS color - colorShift IS the tint (e.g., green for jade)
    // Don't multiply by baseColor to avoid washing out with emotionColor
    vec3 sssColor = colorShift * scatterIntensity;

    // Ambient SSS (always visible, gives material its translucent look)
    vec3 ambientSSS = sssColor * ambient;

    // Direct SSS from lighting - subtle contribution
    vec3 directSSS = sssColor * lightColor * totalLight * 0.5;

    // Final combination
    vec3 finalSSS = directSSS + ambientSSS;

    // Apply overall strength (linear, no boost to prevent blowout)
    return finalSSS * sssStrength;
}

/**
 * Simplified SSS for performance-critical scenarios
 * Uses pre-computed approximations
 *
 * @param normal - Surface normal
 * @param viewDir - View direction
 * @param lightDir - Light direction
 * @param thickness - Pre-computed or approximated thickness
 * @param baseColor - Material color
 * @param scatterColor - Scatter tint color
 * @param strength - SSS strength
 * @return SSS color contribution
 */
vec3 calculateSimpleSSS(
    vec3 normal,
    vec3 viewDir,
    vec3 lightDir,
    float thickness,
    vec3 baseColor,
    vec3 scatterColor,
    float strength
) {
    if (strength < 0.001) {
        return vec3(0.0);
    }

    // Back-lighting
    float backLight = pow(max(0.0, dot(viewDir, -lightDir)), 2.0);

    // Transmittance (simplified Beer's law)
    float transmit = exp(-thickness * 2.0);

    // Edge enhancement
    float edge = pow(1.0 - abs(dot(normal, viewDir)), 2.0);

    // Combine
    float sssIntensity = (backLight * transmit + edge * 0.3) * strength;

    return mix(baseColor, scatterColor, 0.5) * sssIntensity;
}
`;

/**
 * Material presets for gemstones
 * All presets designed for NEAR-BLACK shadows in thick areas
 *
 * Absorption: Higher value = MORE of that color passes through (inverted from physics)
 * ScatterDistance: Higher = more scatter/glow
 */
export const SSS_PRESETS = {
    // Quartz - clear/white crystal, near-black depth
    // Reference: Clear quartz with deep black shadows and brilliant facet highlights
    quartz: {
        sssStrength: 0.8,
        sssAbsorption: [2.8, 2.9, 3.0], // Slight cool tint, mostly neutral
        sssScatterDistance: [0.2, 0.2, 0.25], // Tight scatter for sharp internal look
        sssThicknessBias: 0.6, // Dark core
        sssThicknessScale: 1.8, // Strong thick/thin contrast
        sssCurvatureScale: 3.0, // Sharp edge definition
        sssAmbient: 0.12, // Very low ambient for deep shadows
        // Crystal appearance - maximum clarity
        frostiness: 0.15, // Very clear, almost no frost
        innerGlowStrength: 0.2, // Minimal soul
        fresnelIntensity: 1.5, // Bright edge sparkle
        causticIntensity: 1.2, // Boosted caustics for internal structure
    },

    // Emerald - deep vivid green with near-black core
    // Reference: Cut emerald with dark center and bright green edges
    emerald: {
        sssStrength: 2.0,
        sssAbsorption: [0.05, 4.0, 0.1], // Pure vivid green, near-zero red/blue
        sssScatterDistance: [0.1, 0.5, 0.1], // Tight scatter, green dominant
        sssThicknessBias: 0.65, // Dark core
        sssThicknessScale: 1.8, // Strong thick/thin contrast
        sssCurvatureScale: 3.0, // Sharp edge definition
        sssAmbient: 0.1, // Very low ambient for deep shadows
        // Crystal appearance - sharp gemstone look
        frostiness: 0.2, // Very clear
        innerGlowStrength: 0.15, // Minimal soul for gem clarity
        fresnelIntensity: 1.2, // Bright edges
        emotionColorBleed: 0.35, // Allow soul emotion color to tint the gem
    },

    // Ruby - deep red gemstone with wine/burgundy depth
    // Reference: Pigeon blood ruby - deep wine core, cherry red thin areas
    ruby: {
        sssStrength: 1.8, // Boosted for richer saturation
        sssAbsorption: [4.0, 0.03, 0.08], // Higher red, near-zero green/blue for purer red
        sssScatterDistance: [0.4, 0.04, 0.08], // More red scatter, minimal other colors
        sssThicknessBias: 0.65, // Darker core like other gemstones
        sssThicknessScale: 1.9, // More contrast thick/thin
        sssCurvatureScale: 2.5, // Sharper edge definition
        sssAmbient: 0.08, // Lower ambient for deeper shadows
        // Crystal appearance - rich gem brilliance
        frostiness: 0.12, // Very clear for glossy look
        innerGlowStrength: 0.12, // Subtle internal glow
        fresnelIntensity: 1.2, // Brighter edges like other gems
        causticIntensity: 1.15, // Enhanced caustics for ruby
        emotionColorBleed: 0.35, // Allow soul emotion color to tint the gem
    },

    // Sapphire - deep vivid blue gemstone with near-black shadows
    // Reference: Ceylon blue sapphire with dark center and bright blue edges
    sapphire: {
        sssStrength: 2.2,
        sssAbsorption: [0.15, 0.4, 4.0], // Deep blue: very high blue, low red/green
        sssScatterDistance: [0.1, 0.15, 0.5], // Blue scatter dominant
        sssThicknessBias: 0.65, // Dark core
        sssThicknessScale: 1.8, // Strong thick/thin contrast
        sssCurvatureScale: 3.0, // Sharp edge definition
        sssAmbient: 0.1, // Very low ambient for deep shadows
        // Crystal appearance - sharp gemstone look
        frostiness: 0.18, // Very clear
        innerGlowStrength: 0.15, // Minimal soul
        fresnelIntensity: 1.3, // Bright edges
        emotionColorBleed: 0.35, // Allow soul emotion color to tint the gem
    },

    // Amethyst - deep violet gemstone with near-black shadows
    // Reference: Rich purple with deep black shadows and bright pink/white facet highlights
    amethyst: {
        sssStrength: 2.5,
        sssAbsorption: [3.0, 0.05, 4.5], // Deep violet: high red+blue, very low green
        sssScatterDistance: [0.4, 0.05, 0.5], // Red and blue scatter, no green
        sssThicknessBias: 0.7, // Very dark core
        sssThicknessScale: 2.0, // Maximum thick/thin contrast
        sssCurvatureScale: 3.0, // Sharp edge definition
        sssAmbient: 0.08, // Very low ambient for deep shadows
        // Crystal appearance - dark gemstone with bright highlights
        frostiness: 0.18, // Very clear, minimal frost
        innerGlowStrength: 0.12, // Minimal soul
        fresnelIntensity: 1.4, // Bright edges for facet sparkle
        emotionColorBleed: 0.35, // Allow soul emotion color to tint the gem
    },
};

/**
 * Blend mode reference for iridescence effects:
 *
 * BEST FOR IRIDESCENCE (rainbow fire):
 *  3 = Color Dodge  - Intense sparkle, best for diamond fire
 *  9 = Vivid Light  - Saturated color shifts, good for colored gems
 *  4 = Screen       - Soft rainbow glow overlay
 *  5 = Overlay      - Balanced color enhancement, respects shadows
 *  7 = Soft Light   - Gentle shifts, preserves dark areas
 *  8 = Hard Light   - Strong color pop
 *  6 = Add          - Bright additive glow
 * 10 = Linear Light - Linear saturation, facet sparkle
 *
 * AVOID FOR IRIDESCENCE:
 *  0 = Multiply     - Darkens (kills fire)
 *  1 = Linear Burn  - Too dark
 *  2 = Color Burn   - Too dark
 * 15 = Subtract     - Removes light
 * 11 = Difference   - Unnatural inversion
 */

/**
 * Get SSS uniform values for a preset
 * @param {string} presetName - Name of preset (jade, wax, skin, etc.)
 * @returns {Object} Uniform values for the preset
 */
export function getSSSPreset(presetName) {
    return SSS_PRESETS[presetName] || SSS_PRESETS.jade;
}

/**
 * List of available preset names
 */
export const SSS_PRESET_NAMES = Object.keys(SSS_PRESETS);
