/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Crystal Shader with Soul Inside
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Frosted crystal shader with inner glowing soul effect
 * @author Emotive Engine Team
 * @module 3d/shaders/crystalWithSoul
 *
 * Creates a semi-transparent frosted crystal shell that allows an inner "soul"
 * (glowing core) to show through with diffusion. The soul color is driven by
 * emotional state.
 *
 * Visual characteristics based on reference image:
 * - Frosted/milky translucency (not clear glass)
 * - Strong fresnel effect at edges
 * - Inner glow diffuses through the crystal body
 * - Subtle surface texture variation
 */

import { blendModesGLSL } from './utils/blendModes.js';
import { sssGLSL } from './utils/subsurfaceScattering.js';

/**
 * Vertex shader for frosted crystal
 */
export const crystalVertexShader = `
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;

void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;

    gl_Position = projectionMatrix * mvPosition;
}
`;

/**
 * Fragment shader for frosted crystal with soul glow
 * Creates a milky/frosted appearance with inner glow diffusion
 */
export const crystalFragmentShader = `
uniform float time;
uniform vec3 emotionColor;
uniform float glowIntensity;
uniform float opacity;

// Crystal appearance controls
uniform float frostiness;        // 0 = clear glass, 1 = fully frosted (default: 0.7)
uniform float fresnelPower;      // Edge brightness falloff (default: 3.0)
uniform float fresnelIntensity;  // Edge brightness strength (default: 1.2)
uniform float innerGlowStrength; // How much inner soul shows through (default: 0.8)
uniform float surfaceRoughness;  // Surface texture variation (default: 0.3)

// Enhanced lighting controls
uniform float shadowDarkness;     // How dark shadows can get (0-1, default: 0.4)
uniform float specularIntensity;  // Edge highlight brightness (default: 0.8)
uniform float specularPower;      // Specular falloff sharpness (default: 32.0)
uniform float transmissionContrast; // Thin/thick brightness ratio (default: 1.5)
uniform float minBrightness;      // Minimum brightness floor (default: 0.05)

// Noise scale controls
uniform float surfaceNoiseScale;  // Scale of surface frost pattern (default: 1.5)
uniform float innerWispScale;     // Scale of internal energy wisps (default: 0.5)
uniform float noiseFrequency;     // Frequency of hash noise pattern (default: 1.0)

// Texture
uniform sampler2D crystalTexture;
uniform float textureStrength;    // How much texture affects appearance (default: 0.5)

// Physically-based subsurface scattering
uniform float sssStrength;            // Overall SSS intensity (0-1)
uniform vec3 sssAbsorption;           // Absorption coefficients per RGB channel
uniform vec3 sssScatterDistance;      // Mean free path / scatter radius per RGB
uniform float sssThicknessBias;       // Thickness offset (0-1)
uniform float sssThicknessScale;      // Thickness multiplier
uniform float sssCurvatureScale;      // How much curvature affects SSS
uniform float sssAmbient;             // Ambient SSS contribution
uniform vec3 sssLightDir;             // Primary light direction for SSS
uniform vec3 sssLightColor;           // Light color for SSS

// Component-specific blend layers
// Shell layers - affect the frosted crystal shell
uniform float shellLayer1Mode;
uniform float shellLayer1Strength;
uniform float shellLayer1Enabled;
uniform float shellLayer2Mode;
uniform float shellLayer2Strength;
uniform float shellLayer2Enabled;

// Soul layers - affect the inner glowing soul color
uniform float soulLayer1Mode;
uniform float soulLayer1Strength;
uniform float soulLayer1Enabled;
uniform float soulLayer2Mode;
uniform float soulLayer2Strength;
uniform float soulLayer2Enabled;

// Rim layers - affect the fresnel rim glow
uniform float rimLayer1Mode;
uniform float rimLayer1Strength;
uniform float rimLayer1Enabled;
uniform float rimLayer2Mode;
uniform float rimLayer2Strength;
uniform float rimLayer2Enabled;

// SSS layers - affect subsurface scattering contribution
uniform float sssLayer1Mode;
uniform float sssLayer1Strength;
uniform float sssLayer1Enabled;
uniform float sssLayer2Mode;
uniform float sssLayer2Strength;
uniform float sssLayer2Enabled;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;

// ═══════════════════════════════════════════════════════════════════════════
// NOISE FUNCTIONS for surface variation and frosted effect
// ═══════════════════════════════════════════════════════════════════════════

// Simple 3D noise for frosted surface
float hash(vec3 p) {
    p = p * noiseFrequency;  // Apply frequency control
    p = fract(p * vec3(443.8975, 397.2973, 491.1871));
    p += dot(p.zxy, p.yxz + 19.19);
    return fract(p.x * p.y * p.z);
}

float noise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f); // Smoothstep

    float n = mix(
        mix(
            mix(hash(i), hash(i + vec3(1, 0, 0)), f.x),
            mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x),
            f.y
        ),
        mix(
            mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x),
            mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x),
            f.y
        ),
        f.z
    );
    return n;
}

// Fractal Brownian Motion for natural-looking frosted texture
float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for (int i = 0; i < 3; i++) {
        value += amplitude * noise3D(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

// ═══════════════════════════════════════════════════════════════════════════
// BLEND MODES (from universal library)
// ═══════════════════════════════════════════════════════════════════════════
${blendModesGLSL}

// ═══════════════════════════════════════════════════════════════════════════
// ENHANCED LIGHTING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

// Calculate ambient occlusion from geometry
float calculateAO(vec3 normal, vec3 viewDir, vec3 position) {
    // Faces pointing away from view are in shadow
    float viewAO = max(0.0, dot(normal, viewDir));

    // Use light direction for directional shadow instead of gravity
    // This creates shadows on the side away from light
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.8)); // Match sssLightDir default
    float lightAO = dot(normal, lightDir) * 0.5 + 0.5;

    // Combine AO factors - no gravity term
    return viewAO * 0.5 + lightAO * 0.5;
}

// Calculate specular highlights on facet edges
float calculateFacetSpecular(vec3 normal, vec3 viewDir, vec3 lightDir, float power) {
    // Detect facet edges from normal discontinuities
    float edgeDetect = length(fwidth(normal)) * 15.0;
    edgeDetect = smoothstep(0.1, 0.5, edgeDetect);

    // Standard Blinn-Phong specular
    vec3 halfVec = normalize(lightDir + viewDir);
    float specular = pow(max(0.0, dot(normal, halfVec)), power);

    // Boost specular on edges
    specular += edgeDetect * 0.5;

    return specular;
}

// Calculate light transmission based on thickness
float calculateTransmission(vec3 position, vec3 normal, vec3 viewDir, float contrast) {
    // Thickness estimation - edges are thin, center is thick
    float distFromCenter = length(position);
    float thickness = smoothstep(0.0, 0.6, distFromCenter);

    // View angle affects perceived thickness
    float viewThickness = 1.0 - abs(dot(normal, viewDir));
    thickness = mix(thickness, viewThickness, 0.5);

    // Thin areas transmit more light (brighter), thick areas are darker
    float transmission = 1.0 - thickness * contrast * 0.5;

    return clamp(transmission, 0.3, 1.5);
}

// ═══════════════════════════════════════════════════════════════════════════
// PHYSICALLY-BASED SUBSURFACE SCATTERING
// ═══════════════════════════════════════════════════════════════════════════
${sssGLSL}

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);

    // ═══════════════════════════════════════════════════════════════════════
    // FRESNEL EFFECT - Colored rim at edges (cyan-tinted)
    // ═══════════════════════════════════════════════════════════════════════
    float fresnel = pow(1.0 - abs(dot(normal, viewDir)), fresnelPower);
    fresnel *= fresnelIntensity;

    // ═══════════════════════════════════════════════════════════════════════
    // AMBIENT OCCLUSION - Dark shadows for depth
    // ═══════════════════════════════════════════════════════════════════════
    float ao = calculateAO(normal, viewDir, vPosition);
    float shadowFactor = mix(1.0, ao, shadowDarkness);

    // ═══════════════════════════════════════════════════════════════════════
    // SPECULAR HIGHLIGHTS - Bright catches on facet edges
    // ═══════════════════════════════════════════════════════════════════════
    vec3 lightDir = normalize(sssLightDir);
    float specular = calculateFacetSpecular(normal, viewDir, lightDir, specularPower);
    specular *= specularIntensity;

    // ═══════════════════════════════════════════════════════════════════════
    // LIGHT TRANSMISSION - Thin areas glow, thick areas darken
    // ═══════════════════════════════════════════════════════════════════════
    float transmission = calculateTransmission(vPosition, normal, viewDir, transmissionContrast);

    // ═══════════════════════════════════════════════════════════════════════
    // TEXTURE SAMPLING - Crystal surface detail from UV-mapped texture
    // ═══════════════════════════════════════════════════════════════════════
    vec4 texColor = texture2D(crystalTexture, vUv);
    float texValue = (texColor.r + texColor.g + texColor.b) / 3.0;  // Grayscale

    // ═══════════════════════════════════════════════════════════════════════
    // FROSTED SURFACE - Subtle cloudy variation (not opaque white!)
    // ═══════════════════════════════════════════════════════════════════════
    float surfaceNoise = fbm(vPosition * surfaceNoiseScale + time * 0.02);
    surfaceNoise = surfaceNoise * surfaceRoughness;

    // ═══════════════════════════════════════════════════════════════════════
    // INNER SOUL GLOW - The glowing core visible through the crystal
    // ═══════════════════════════════════════════════════════════════════════

    // Animated internal glow - subtle pulsing
    float glowPulse = sin(time * 0.5) * 0.15 + 0.85;

    // Internal energy wisps - drifting patterns inside
    float internalWisp = fbm(vPosition * innerWispScale + vec3(time * 0.1, time * 0.07, time * 0.13));
    internalWisp = smoothstep(0.2, 0.8, internalWisp);

    // Core glow - strongest in center, fades toward edges with sharper falloff
    float distFromCenter = length(vPosition);
    float coreGlow = exp(-distFromCenter * 2.5) * glowPulse;

    // Caustic-like hot spots - light concentrates in certain areas
    float caustic = noise3D(vPosition * 4.0 + vec3(time * 0.15));
    caustic = pow(caustic, 3.0) * 2.0; // Sharp bright spots

    // Animation pattern (0-1 range) - this creates the visible wisp/glow variation
    // Keep this SEPARATE from overall brightness so patterns stay visible
    float animationPattern = coreGlow * 0.6 + internalWisp * 0.25 + caustic * 0.15;

    // Soul intensity controls overall brightness with more dramatic falloff
    // Brighter near core, darker at edges
    float baseLevel = 0.1;  // Lower base for more contrast
    float patternContrast = 0.9;  // Higher contrast for more variation
    float soulIntensity = (baseLevel + animationPattern * patternContrast) * innerGlowStrength;

    // Apply transmission to soul - thin areas glow brighter
    soulIntensity *= transmission;

    // Soul color from emotion
    // NOTE: emotionColor is pre-normalized by normalizeColorLuminance() in Core3DManager
    // This ensures consistent perceived brightness across all emotions (yellow won't wash out, blue stays visible)
    // Reduced intensity to prevent blowout - soul should be visible but not white
    float glowCurve = sqrt(innerGlowStrength * glowIntensity) * 0.5;
    vec3 soulColor = emotionColor * soulIntensity * glowCurve;
    // Clamp soul color to prevent blowout
    soulColor = min(soulColor, vec3(0.8));

    // ═══════════════════════════════════════════════════════════════════════
    // SOUL BLEND LAYERS - Apply before combining with shell
    // ═══════════════════════════════════════════════════════════════════════
    if (soulLayer1Enabled > 0.5) {
        int mode = int(soulLayer1Mode + 0.5);
        vec3 blendResult = applyBlendMode(soulColor, emotionColor * soulLayer1Strength, mode);
        soulColor = mix(soulColor, blendResult, soulLayer1Strength);
    }
    if (soulLayer2Enabled > 0.5) {
        int mode = int(soulLayer2Mode + 0.5);
        vec3 blendResult = applyBlendMode(soulColor, emotionColor * soulLayer2Strength, mode);
        soulColor = mix(soulColor, blendResult, soulLayer2Strength);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FROSTED SHELL - Milky white layer with INTERNAL lighting model
    // Lit from inside: thin edges bright, thick center dark
    // ═══════════════════════════════════════════════════════════════════════

    // Frosted glass base - will be modulated by thickness
    // Lower base values allow for darker thick areas while maintaining bright edges
    vec3 frostBase = vec3(0.45, 0.48, 0.55) * frostiness;

    // THICKNESS-BASED DARKNESS (internal lighting model)
    // Face-on facets are THICK (light travels far through) = DARK
    // Edge-on facets are THIN (light escapes easily) = BRIGHT
    float edgeThinness = 1.0 - abs(dot(normal, viewDir));  // 1 at edges, 0 facing camera

    // Apply curve to make face-on areas darker more aggressively
    float thinness = pow(edgeThinness, 0.7);  // Push more area toward dark

    // Thickness multiplier: thin edges=bright (1.0), thick face-on=dark (0.08)
    float thicknessMultiplier = 0.08 + thinness * 0.92;
    frostBase *= thicknessMultiplier;

    // Surface variation adds subtle texture
    frostBase += vec3(surfaceNoise * 0.03);

    // Specular highlights on facet edges (external light catch)
    float facetHighlight = pow(max(0.0, dot(normal, normalize(vec3(0.5, 1.0, 0.8)))), 16.0);
    frostBase += vec3(facetHighlight * 0.2);

    // SOUL BLEED - Inner glow illuminates the shell from inside
    // Use gentler falloff so color reaches the shell surface
    float soulBleed = exp(-distFromCenter * 1.2) * innerGlowStrength;
    // Stronger color contribution - tint the frost with emotion color
    frostBase = mix(frostBase, frostBase + emotionColor * 0.4, soulBleed);

    // ═══════════════════════════════════════════════════════════════════════
    // SHELL BLEND LAYERS - Apply to frosted shell
    // ═══════════════════════════════════════════════════════════════════════
    if (shellLayer1Enabled > 0.5) {
        int mode = int(shellLayer1Mode + 0.5);
        vec3 blendResult = applyBlendMode(frostBase, emotionColor * shellLayer1Strength, mode);
        frostBase = mix(frostBase, blendResult, shellLayer1Strength);
    }
    if (shellLayer2Enabled > 0.5) {
        int mode = int(shellLayer2Mode + 0.5);
        vec3 blendResult = applyBlendMode(frostBase, emotionColor * shellLayer2Strength, mode);
        frostBase = mix(frostBase, blendResult, shellLayer2Strength);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FRESNEL RIM - Bright emotion-colored edge glow
    // ═══════════════════════════════════════════════════════════════════════
    vec3 rimColor = mix(vec3(0.5, 0.9, 1.0), emotionColor, 0.6);
    vec3 rimGlow = rimColor * fresnel * 1.2;

    // ═══════════════════════════════════════════════════════════════════════
    // RIM BLEND LAYERS - Apply to fresnel rim glow
    // ═══════════════════════════════════════════════════════════════════════
    if (rimLayer1Enabled > 0.5) {
        int mode = int(rimLayer1Mode + 0.5);
        vec3 blendResult = applyBlendMode(rimGlow, emotionColor * rimLayer1Strength, mode);
        rimGlow = mix(rimGlow, blendResult, rimLayer1Strength);
    }
    if (rimLayer2Enabled > 0.5) {
        int mode = int(rimLayer2Mode + 0.5);
        vec3 blendResult = applyBlendMode(rimGlow, emotionColor * rimLayer2Strength, mode);
        rimGlow = mix(rimGlow, blendResult, rimLayer2Strength);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PHYSICALLY-BASED SUBSURFACE SCATTERING
    // Uses BSSRDF with Beer's Law absorption and Burley diffusion profile
    // ═══════════════════════════════════════════════════════════════════════
    vec3 sss = calculatePhysicalSSS(
        normal,
        viewDir,
        vPosition,
        normalize(sssLightDir),
        sssLightColor,
        emotionColor,
        sssStrength,
        sssAbsorption,
        sssScatterDistance,
        sssThicknessBias,
        sssThicknessScale,
        sssCurvatureScale,
        sssAmbient
    );

    // ═══════════════════════════════════════════════════════════════════════
    // SSS BLEND LAYERS - Apply to subsurface scattering contribution
    // ═══════════════════════════════════════════════════════════════════════
    if (sssLayer1Enabled > 0.5) {
        int mode = int(sssLayer1Mode + 0.5);
        vec3 blendResult = applyBlendMode(sss, emotionColor * sssLayer1Strength, mode);
        sss = mix(sss, blendResult, sssLayer1Strength);
    }
    if (sssLayer2Enabled > 0.5) {
        int mode = int(sssLayer2Mode + 0.5);
        vec3 blendResult = applyBlendMode(sss, emotionColor * sssLayer2Strength, mode);
        sss = mix(sss, blendResult, sssLayer2Strength);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // COMBINE - Frosted shell base + soul glow (soul adds to shell, doesn't replace)
    // ═══════════════════════════════════════════════════════════════════════

    // Start with shell as base - preserves dark shadows
    vec3 finalColor = frostBase;

    // Add soul glow on top (additive, not replacement) - concentrated in center
    // Soul should illuminate dark areas but not wash out entirely
    float soulBlendFactor = soulIntensity * 0.6;
    finalColor += soulColor * soulBlendFactor;

    // Apply texture - blend based on texture brightness and strength
    vec3 texContribution = texColor.rgb * textureStrength;
    finalColor = mix(finalColor, finalColor + texContribution, textureStrength);

    // Apply SSS material color - jade should BE green, not white with green tint
    // The sssAbsorption values directly define the material color:
    // Jade: [0.4, 2.8, 0.6] means high green transmittance
    if (sssStrength > 0.01) {
        // Normalize absorption to get hue direction (0-1 range)
        vec3 absorption = sssAbsorption;
        float maxAbs = max(max(absorption.r, absorption.g), absorption.b);
        vec3 hue = absorption / max(maxAbs, 0.001);

        // Create a medium-brightness saturated material color
        // Target luminance around 0.35 for good visibility without blowout
        float targetLum = 0.35;
        vec3 materialColor = hue * targetLum / max(dot(hue, vec3(0.299, 0.587, 0.114)), 0.001);
        materialColor = clamp(materialColor, vec3(0.0), vec3(0.7));

        // Add subtle variation from SSS lighting calculation
        float sssLum = dot(sss, vec3(0.299, 0.587, 0.114));
        materialColor *= (0.8 + sssLum * 0.4);

        // Replace crystal color with material color
        float replaceAmount = sssStrength * 0.75;
        finalColor = mix(finalColor, materialColor, replaceAmount);
    }

    // Add rim glow, tinted toward material color
    if (sssStrength > 0.01) {
        vec3 absorption = sssAbsorption;
        float maxAbs = max(max(absorption.r, absorption.g), absorption.b);
        vec3 hue = absorption / max(maxAbs, 0.001);
        // Tint rim toward material color, reduced intensity
        vec3 tintedRim = rimGlow * mix(vec3(1.0), hue, sssStrength * 0.5);
        finalColor += tintedRim * 0.3;
    } else {
        finalColor += rimGlow;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SPECULAR HIGHLIGHTS - Add bright hot spots
    // ═══════════════════════════════════════════════════════════════════════
    vec3 specularColor = vec3(1.0, 0.98, 0.95); // Warm white highlights
    finalColor += specularColor * specular * transmission;

    // ═══════════════════════════════════════════════════════════════════════
    // FINAL THICKNESS APPLICATION - Apply AFTER all additive terms
    // This ensures thick areas stay dark even with glow added
    // ═══════════════════════════════════════════════════════════════════════
    // thicknessMultiplier: 0.15 in thick center, 1.0 at thin edges
    finalColor *= thicknessMultiplier;

    // Ensure minimum brightness (very low floor for dramatic shadows)
    // Only apply to prevent pure black - allow near-black shadows
    finalColor = max(finalColor, vec3(minBrightness * 0.5));

    // ═══════════════════════════════════════════════════════════════════════
    // ALPHA - More opaque for visibility
    // ═══════════════════════════════════════════════════════════════════════

    // Higher base opacity
    float baseAlpha = 0.6 + frostiness * 0.25;

    // Fresnel makes edges solid
    float rimAlpha = fresnel * 0.3;

    // Soul glow adds opacity
    float glowAlpha = soulIntensity * 0.15;

    float finalAlpha = min(baseAlpha + rimAlpha + glowAlpha, 0.95) * opacity;

    gl_FragColor = vec4(finalColor, finalAlpha);
}
`;

/**
 * Get crystal shaders
 * @returns {Object} { vertexShader, fragmentShader }
 */
export function getCrystalShaders() {
    return {
        vertexShader: crystalVertexShader,
        fragmentShader: crystalFragmentShader
    };
}

/**
 * Default crystal uniform values
 * These create the frosted appearance matching the reference image
 */
export const CRYSTAL_DEFAULT_UNIFORMS = {
    time: 0,
    emotionColor: [0.0, 0.8, 1.0], // Default cyan
    glowIntensity: 1.0,
    opacity: 1.0,

    // Crystal appearance (tuned for crystal.obj)
    frostiness: 0.55,           // Frosted translucency (slightly less opaque)
    fresnelPower: 2.8,          // Edge brightness falloff (slightly sharper)
    fresnelIntensity: 0.35,     // Edge brightness strength (more visible rim)
    innerGlowStrength: 0.55,    // How much soul shows through (boosted)
    surfaceRoughness: 0.12,     // Surface texture variation (subtler)

    // Enhanced lighting
    shadowDarkness: 0.60,       // How dark shadows can get (0-1) - strong shadows
    specularIntensity: 0.9,     // Edge highlight brightness
    specularPower: 28.0,        // Specular falloff sharpness
    transmissionContrast: 1.0,  // Thin/thick brightness ratio
    minBrightness: 0.02,        // Minimum brightness floor (near-black allowed)

    // Noise scales
    surfaceNoiseScale: 1.50,    // Scale of surface frost pattern
    innerWispScale: 0.60,       // Scale of internal energy wisps
    noiseFrequency: 1.33,       // Frequency of hash noise pattern

    // Texture
    textureStrength: 0.55,      // How much texture affects appearance

    // Physically-based subsurface scattering (crystal preset as default)
    sssStrength: 0.65,                      // Overall SSS intensity (boosted)
    sssAbsorption: [2.4, 2.5, 2.8],         // Absorption coefficients RGB (crystal - cool blue tint)
    sssScatterDistance: [0.35, 0.4, 0.45],  // Mean free path / scatter radius RGB (increased)
    sssThicknessBias: 0.18,                 // Base thickness value
    sssThicknessScale: 0.60,                // Thickness multiplier
    sssCurvatureScale: 1.80,                // Curvature influence on SSS
    sssAmbient: 0.30,                       // Ambient SSS contribution (boosted for visibility)
    sssLightDir: [0.5, 1.0, 0.8],           // Primary light direction
    sssLightColor: [1.0, 0.98, 0.95],       // Light color (warm white)

    // Component-specific blend layers (all disabled by default)
    // Shell layers - affect frosted crystal shell
    shellLayer1Mode: 0,
    shellLayer1Strength: 0.0,
    shellLayer1Enabled: 0,
    shellLayer2Mode: 0,
    shellLayer2Strength: 0.0,
    shellLayer2Enabled: 0,

    // Soul layers - affect inner glowing soul
    soulLayer1Mode: 0,
    soulLayer1Strength: 0.0,
    soulLayer1Enabled: 0,
    soulLayer2Mode: 0,
    soulLayer2Strength: 0.0,
    soulLayer2Enabled: 0,

    // Rim layers - affect fresnel rim glow
    rimLayer1Mode: 0,
    rimLayer1Strength: 0.0,
    rimLayer1Enabled: 0,
    rimLayer2Mode: 0,
    rimLayer2Strength: 0.0,
    rimLayer2Enabled: 0,

    // SSS layers - affect subsurface scattering
    sssLayer1Mode: 0,
    sssLayer1Strength: 0.0,
    sssLayer1Enabled: 0,
    sssLayer2Mode: 0,
    sssLayer2Strength: 0.0,
    sssLayer2Enabled: 0
};
