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

// Blend layer uniforms for advanced effects
uniform float layer1Mode;
uniform float layer1Strength;
uniform float layer1Enabled;

uniform float layer2Mode;
uniform float layer2Strength;
uniform float layer2Enabled;

uniform float layer3Mode;
uniform float layer3Strength;
uniform float layer3Enabled;

uniform float layer4Mode;
uniform float layer4Strength;
uniform float layer4Enabled;

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

    // Core glow - strongest in center, fades toward edges
    float distFromCenter = length(vPosition);
    float coreGlow = exp(-distFromCenter * 1.8) * glowPulse;

    // Animation pattern (0-1 range) - this creates the visible wisp/glow variation
    // Keep this SEPARATE from overall brightness so patterns stay visible
    float animationPattern = coreGlow * 0.7 + internalWisp * 0.3;

    // Soul intensity controls overall brightness, but we preserve pattern contrast
    // by mixing between a dimmed base and the full pattern
    float baseLevel = 0.3;  // Minimum brightness to see the color
    float patternContrast = 0.7;  // How much the pattern modulates brightness
    float soulIntensity = (baseLevel + animationPattern * patternContrast) * innerGlowStrength;

    // Soul color from emotion
    // NOTE: emotionColor is pre-normalized by normalizeColorLuminance() in Core3DManager
    // This ensures consistent perceived brightness across all emotions (yellow won't wash out, blue stays visible)
    vec3 soulColor = emotionColor * soulIntensity * glowIntensity * 2.0;

    // ═══════════════════════════════════════════════════════════════════════
    // FROSTED SHELL - Milky white layer over the soul
    // ═══════════════════════════════════════════════════════════════════════

    // Frosted glass base - lighter than before
    vec3 frostBase = vec3(0.6, 0.65, 0.7) * frostiness;

    // Surface variation adds subtle texture
    frostBase += vec3(surfaceNoise * 0.1);

    // ═══════════════════════════════════════════════════════════════════════
    // FRESNEL RIM - Bright emotion-colored edge glow
    // ═══════════════════════════════════════════════════════════════════════
    vec3 rimColor = mix(vec3(0.5, 0.9, 1.0), emotionColor, 0.6);
    vec3 rimGlow = rimColor * fresnel * 1.2;

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
    // COMBINE - Bright soul + frosted shell + glowing rim + SSS
    // ═══════════════════════════════════════════════════════════════════════

    // Blend soul through frost - soul is primary, frost softens it
    vec3 finalColor = mix(frostBase, soulColor, 0.6 + soulIntensity * 0.4);

    // Apply texture - blend based on texture brightness and strength
    vec3 texContribution = texColor.rgb * textureStrength;
    finalColor = mix(finalColor, finalColor + texContribution, textureStrength);

    // Add bright rim glow at edges
    finalColor += rimGlow;

    // Add subsurface scattering
    finalColor += sss;

    // Ensure minimum brightness so crystal is always visible
    finalColor = max(finalColor, vec3(0.15, 0.2, 0.25));

    // ═══════════════════════════════════════════════════════════════════════
    // BLEND LAYERS (for advanced visual tuning)
    // ═══════════════════════════════════════════════════════════════════════

    if (layer1Enabled > 0.5) {
        int mode1 = int(layer1Mode + 0.5);
        vec3 blendResult = applyBlendMode(finalColor, emotionColor * layer1Strength, mode1);
        finalColor = mix(finalColor, blendResult, layer1Strength);
    }

    if (layer2Enabled > 0.5) {
        int mode2 = int(layer2Mode + 0.5);
        vec3 blendResult = applyBlendMode(finalColor, emotionColor * layer2Strength, mode2);
        finalColor = mix(finalColor, blendResult, layer2Strength);
    }

    if (layer3Enabled > 0.5) {
        int mode3 = int(layer3Mode + 0.5);
        vec3 blendResult = applyBlendMode(finalColor, emotionColor * layer3Strength, mode3);
        finalColor = mix(finalColor, blendResult, layer3Strength);
    }

    if (layer4Enabled > 0.5) {
        int mode4 = int(layer4Mode + 0.5);
        vec3 blendResult = applyBlendMode(finalColor, emotionColor * layer4Strength, mode4);
        finalColor = mix(finalColor, blendResult, layer4Strength);
    }

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
    frostiness: 0.10,           // Low frost - more transparent
    fresnelPower: 2.5,          // Edge brightness falloff
    fresnelIntensity: 0.30,     // Edge brightness strength
    innerGlowStrength: 0.20,    // How much soul shows through
    surfaceRoughness: 0.15,     // Surface texture variation

    // Noise scales
    surfaceNoiseScale: 1.50,    // Scale of surface frost pattern
    innerWispScale: 0.60,       // Scale of internal energy wisps
    noiseFrequency: 1.33,       // Frequency of hash noise pattern

    // Texture
    textureStrength: 0.55,      // How much texture affects appearance

    // Physically-based subsurface scattering (jade preset as default)
    sssStrength: 0.0,                       // Overall SSS intensity (0-1)
    sssAbsorption: [2.5, 0.3, 1.8],         // Absorption coefficients RGB (jade-like)
    sssScatterDistance: [0.15, 0.4, 0.2],   // Mean free path / scatter radius RGB
    sssThicknessBias: 0.3,                  // Base thickness value
    sssThicknessScale: 0.7,                 // Thickness multiplier
    sssCurvatureScale: 1.5,                 // Curvature influence on SSS
    sssAmbient: 0.15,                       // Ambient SSS contribution
    sssLightDir: [0.5, 1.0, 0.8],           // Primary light direction
    sssLightColor: [1.0, 0.98, 0.95],       // Light color (warm white)

    // Blend layers (disabled by default)
    layer1Mode: 6,              // Add mode for glow boost
    layer1Strength: 0.0,
    layer1Enabled: 0,

    layer2Mode: 0,
    layer2Strength: 0.0,
    layer2Enabled: 0,

    layer3Mode: 0,
    layer3Strength: 0.0,
    layer3Enabled: 0,

    layer4Mode: 0,
    layer4Strength: 0.0,
    layer4Enabled: 0
};
