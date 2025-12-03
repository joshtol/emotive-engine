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
    // ABSORPTION COLOR (Simplified Beer's Law)
    // Creates the characteristic color of translucent materials
    // absorption values are inverted: high value = MORE of that color passes through
    // ─────────────────────────────────────────────────────────────────────
    // Invert absorption so higher values = more color (more intuitive for artists)
    vec3 invertedAbsorption = vec3(3.0) - absorption;
    // Gentle exponential falloff - not as aggressive as true Beer's Law
    vec3 colorShift = exp(-invertedAbsorption * thickness * 0.5);
    // Ensure we always have some color
    colorShift = max(colorShift, vec3(0.1));

    // ─────────────────────────────────────────────────────────────────────
    // SCATTER INTENSITY
    // How much light scatters based on material properties
    // ─────────────────────────────────────────────────────────────────────
    // Higher scatter distance = more light gets through
    vec3 scatterIntensity = scatterDist * 2.0;
    scatterIntensity = clamp(scatterIntensity, vec3(0.2), vec3(2.0));

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

    // Base SSS color with absorption-based tint
    vec3 sssColor = baseColor * colorShift * scatterIntensity;

    // Ambient SSS (always visible, gives material its translucent look)
    vec3 ambientSSS = baseColor * colorShift * ambient * 1.5;

    // Direct SSS from lighting
    vec3 directSSS = sssColor * lightColor * totalLight;

    // Final combination
    vec3 finalSSS = directSSS + ambientSSS;

    // Apply overall strength with quadratic boost for low values
    float boostedStrength = sssStrength * (1.0 + sssStrength);

    return finalSSS * boostedStrength;
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
 * Material presets for common translucent materials
 * These values are tuned for visual impact
 *
 * Absorption: Higher value = MORE of that color passes through (inverted from physics)
 * ScatterDistance: Higher = more scatter/glow
 */
export const SSS_PRESETS = {
    // Jade - green translucent stone
    jade: {
        sssStrength: 1.0,
        // High green, low red/blue = green jade color
        sssAbsorption: [0.4, 2.8, 0.6],
        sssScatterDistance: [0.3, 0.8, 0.4],
        sssThicknessBias: 0.2,
        sssThicknessScale: 0.8,
        sssCurvatureScale: 1.5,
        sssAmbient: 0.4
    },

    // Imperial jade - more vivid emerald green
    imperialJade: {
        sssStrength: 1.0,
        sssAbsorption: [0.2, 3.0, 0.3],
        sssScatterDistance: [0.2, 1.0, 0.3],
        sssThicknessBias: 0.15,
        sssThicknessScale: 0.9,
        sssCurvatureScale: 2.0,
        sssAmbient: 0.5
    },

    // White jade / mutton fat jade
    whiteJade: {
        sssStrength: 0.9,
        sssAbsorption: [2.5, 2.6, 2.4],
        sssScatterDistance: [0.7, 0.7, 0.65],
        sssThicknessBias: 0.3,
        sssThicknessScale: 0.6,
        sssCurvatureScale: 1.2,
        sssAmbient: 0.5
    },

    // Wax / candle - warm orange glow
    wax: {
        sssStrength: 1.0,
        // High red/orange, less blue
        sssAbsorption: [2.8, 2.0, 0.8],
        sssScatterDistance: [1.0, 0.7, 0.4],
        sssThicknessBias: 0.35,
        sssThicknessScale: 0.7,
        sssCurvatureScale: 1.0,
        sssAmbient: 0.5
    },

    // Human skin - warm red undertones
    skin: {
        sssStrength: 0.9,
        // Red from blood, less green/blue
        sssAbsorption: [2.8, 1.5, 1.0],
        sssScatterDistance: [0.8, 0.5, 0.35],
        sssThicknessBias: 0.25,
        sssThicknessScale: 0.6,
        sssCurvatureScale: 2.0,
        sssAmbient: 0.3
    },

    // Marble (white with warm tint)
    marble: {
        sssStrength: 0.7,
        sssAbsorption: [2.4, 2.3, 2.2],
        sssScatterDistance: [0.4, 0.38, 0.35],
        sssThicknessBias: 0.4,
        sssThicknessScale: 0.5,
        sssCurvatureScale: 0.8,
        sssAmbient: 0.35
    },

    // Milk / cream - very white, slight warm
    milk: {
        sssStrength: 1.0,
        sssAbsorption: [2.9, 2.85, 2.7],
        sssScatterDistance: [1.2, 1.1, 0.9],
        sssThicknessBias: 0.4,
        sssThicknessScale: 0.5,
        sssCurvatureScale: 0.5,
        sssAmbient: 0.6
    },

    // Honey / amber - golden orange
    honey: {
        sssStrength: 1.0,
        // Strong red/yellow, absorbs blue
        sssAbsorption: [2.9, 2.2, 0.4],
        sssScatterDistance: [0.8, 0.6, 0.2],
        sssThicknessBias: 0.3,
        sssThicknessScale: 0.8,
        sssCurvatureScale: 1.2,
        sssAmbient: 0.45
    },

    // Crystal / ice - cool blue tint
    crystal: {
        sssStrength: 0.6,
        // Slightly more blue
        sssAbsorption: [2.4, 2.5, 2.8],
        sssScatterDistance: [0.3, 0.35, 0.4],
        sssThicknessBias: 0.15,
        sssThicknessScale: 0.9,
        sssCurvatureScale: 1.5,
        sssAmbient: 0.25
    },

    // Rose quartz - pink/magenta tint
    roseQuartz: {
        sssStrength: 0.9,
        // High red, medium blue, less green = pink
        sssAbsorption: [2.7, 1.2, 2.3],
        sssScatterDistance: [0.6, 0.4, 0.55],
        sssThicknessBias: 0.25,
        sssThicknessScale: 0.75,
        sssCurvatureScale: 1.3,
        sssAmbient: 0.4
    },

    // Soap - slight blue/white
    soap: {
        sssStrength: 0.8,
        sssAbsorption: [2.5, 2.6, 2.7],
        sssScatterDistance: [0.7, 0.7, 0.75],
        sssThicknessBias: 0.35,
        sssThicknessScale: 0.55,
        sssCurvatureScale: 0.9,
        sssAmbient: 0.45
    }
};

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
