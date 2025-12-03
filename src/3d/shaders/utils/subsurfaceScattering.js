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
 * @param absorption - Absorption coefficients RGB
 * @param scatterDist - Scatter distance RGB
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
    // ABSORPTION (Beer's Law)
    // Light changes color as it passes through material
    // ─────────────────────────────────────────────────────────────────────
    vec3 transmittance = beersLawAbsorption(thickness, absorption);

    // ─────────────────────────────────────────────────────────────────────
    // DIFFUSION PROFILE
    // How light spreads after entering the material
    // ─────────────────────────────────────────────────────────────────────
    // Use thickness as proxy for scatter radius
    vec3 diffusion = christensenBurleyDiffusion(thickness * 0.5, baseColor, scatterDist);
    // Normalize to prevent blow-out
    diffusion = diffusion / (diffusion + vec3(1.0));

    // ─────────────────────────────────────────────────────────────────────
    // LIGHTING TERMS
    // ─────────────────────────────────────────────────────────────────────

    // Back-lighting: light passing through from behind
    float NdotL = dot(normal, lightDir);
    float backLight = max(0.0, -NdotL);
    backLight = pow(backLight, 1.5);

    // Wrap lighting: soft diffuse that wraps around to dark side
    float wrapLight = max(0.0, (NdotL + 0.5) / 1.5);
    wrapLight = wrapLight * wrapLight;

    // View-dependent translucency
    float VdotL = dot(viewDir, -lightDir);
    float translucency = pow(max(0.0, VdotL), 2.0);

    // Forward scattering (light scatters toward viewer)
    vec3 H = normalize(lightDir + normal * 0.5);
    float forwardScatter = pow(max(0.0, dot(viewDir, -H)), 4.0);

    // ─────────────────────────────────────────────────────────────────────
    // CURVATURE ENHANCEMENT
    // SSS more visible on curved surfaces
    // ─────────────────────────────────────────────────────────────────────
    float curvature = calculateCurvature(normal);
    float curvatureFactor = 1.0 + curvature * curvatureScale;

    // ─────────────────────────────────────────────────────────────────────
    // COMBINE ALL TERMS
    // ─────────────────────────────────────────────────────────────────────

    // Direct SSS from light
    float directSSS = backLight * 0.4 + translucency * 0.3 + forwardScatter * 0.3;

    // Wrap contribution (softer, fills shadows)
    float wrapSSS = wrapLight * 0.5;

    // Total light intensity
    float totalLight = (directSSS + wrapSSS) * curvatureFactor;

    // Apply absorption and diffusion
    vec3 sssColor = baseColor * transmittance * diffusion;

    // Add ambient SSS (always-present glow)
    vec3 ambientSSS = baseColor * transmittance * ambient * 0.5;

    // Final SSS contribution
    vec3 finalSSS = sssColor * lightColor * totalLight + ambientSSS;

    // Apply overall strength
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
 * Material presets for common translucent materials
 * These values are based on measured data and artistic tuning
 */
export const SSS_PRESETS = {
    // Jade - green translucent stone
    jade: {
        sssStrength: 1.0,
        // Jade absorbs red and blue, lets green through
        sssAbsorption: [2.5, 0.3, 1.8],
        // Tight scatter distance for the "deep glow" look
        sssScatterDistance: [0.15, 0.4, 0.2],
        sssThicknessBias: 0.3,
        sssThicknessScale: 0.7,
        sssCurvatureScale: 1.5,
        sssAmbient: 0.15
    },

    // Imperial jade - more vivid green
    imperialJade: {
        sssStrength: 1.0,
        sssAbsorption: [3.0, 0.2, 2.5],
        sssScatterDistance: [0.1, 0.5, 0.15],
        sssThicknessBias: 0.25,
        sssThicknessScale: 0.8,
        sssCurvatureScale: 1.8,
        sssAmbient: 0.2
    },

    // White jade / mutton fat jade
    whiteJade: {
        sssStrength: 0.9,
        sssAbsorption: [0.3, 0.3, 0.4],
        sssScatterDistance: [0.5, 0.5, 0.45],
        sssThicknessBias: 0.35,
        sssThicknessScale: 0.6,
        sssCurvatureScale: 1.2,
        sssAmbient: 0.25
    },

    // Wax / candle
    wax: {
        sssStrength: 1.0,
        // Wax has warm absorption (lets orange/red through)
        sssAbsorption: [0.2, 0.8, 1.5],
        // Broad scatter for waxy look
        sssScatterDistance: [0.8, 0.5, 0.3],
        sssThicknessBias: 0.4,
        sssThicknessScale: 0.6,
        sssCurvatureScale: 1.0,
        sssAmbient: 0.2
    },

    // Human skin (Caucasian reference)
    skin: {
        sssStrength: 0.8,
        // Skin: blood absorbs blue/green, lets red through
        sssAbsorption: [0.4, 1.2, 1.8],
        sssScatterDistance: [0.6, 0.35, 0.25],
        sssThicknessBias: 0.3,
        sssThicknessScale: 0.5,
        sssCurvatureScale: 2.0,
        sssAmbient: 0.1
    },

    // Marble (white)
    marble: {
        sssStrength: 0.6,
        sssAbsorption: [0.4, 0.45, 0.5],
        sssScatterDistance: [0.3, 0.28, 0.25],
        sssThicknessBias: 0.5,
        sssThicknessScale: 0.4,
        sssCurvatureScale: 0.8,
        sssAmbient: 0.15
    },

    // Milk / cream
    milk: {
        sssStrength: 1.0,
        sssAbsorption: [0.1, 0.15, 0.3],
        sssScatterDistance: [1.0, 0.9, 0.7],
        sssThicknessBias: 0.5,
        sssThicknessScale: 0.5,
        sssCurvatureScale: 0.5,
        sssAmbient: 0.3
    },

    // Honey / amber
    honey: {
        sssStrength: 0.9,
        sssAbsorption: [0.1, 0.5, 2.0],
        sssScatterDistance: [0.6, 0.4, 0.1],
        sssThicknessBias: 0.35,
        sssThicknessScale: 0.7,
        sssCurvatureScale: 1.2,
        sssAmbient: 0.2
    },

    // Crystal / ice (very clear, minimal absorption)
    crystal: {
        sssStrength: 0.4,
        sssAbsorption: [0.1, 0.1, 0.08],
        sssScatterDistance: [0.2, 0.22, 0.25],
        sssThicknessBias: 0.2,
        sssThicknessScale: 0.8,
        sssCurvatureScale: 1.5,
        sssAmbient: 0.1
    },

    // Rose quartz
    roseQuartz: {
        sssStrength: 0.8,
        sssAbsorption: [0.3, 0.8, 0.7],
        sssScatterDistance: [0.45, 0.3, 0.32],
        sssThicknessBias: 0.3,
        sssThicknessScale: 0.7,
        sssCurvatureScale: 1.3,
        sssAmbient: 0.15
    },

    // Soap
    soap: {
        sssStrength: 0.7,
        sssAbsorption: [0.2, 0.25, 0.3],
        sssScatterDistance: [0.6, 0.55, 0.5],
        sssThicknessBias: 0.4,
        sssThicknessScale: 0.5,
        sssCurvatureScale: 0.8,
        sssAmbient: 0.2
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
