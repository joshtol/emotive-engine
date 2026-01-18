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

// ═══════════════════════════════════════════════════════════════════════════
// DEFORMATION UNIFORMS - Localized vertex displacement for impacts
// ═══════════════════════════════════════════════════════════════════════════
uniform float deformationType;      // 0=none, 1=shockwave, 2=ripple, 3=directional, 4=elastic
uniform float deformationStrength;  // 0-1
uniform float deformationPhase;     // 0-1 animation progress
uniform vec3 deformationDirection;  // Impact direction (normalized)
uniform vec3 impactPoint;           // Where impact occurred (local space)
uniform float deformationFalloff;   // Radius of influence

// ═══════════════════════════════════════════════════════════════════════════
// DEFORMATION FUNCTIONS - Localized vertex displacement
// ═══════════════════════════════════════════════════════════════════════════

// Smooth falloff from impact point
float calculateFalloff(vec3 pos, vec3 impact, float radius) {
    float dist = length(pos - impact);
    float normalizedDist = dist / max(radius, 0.001);
    // Smooth cubic falloff: 1 at center, 0 at radius
    return clamp(1.0 - normalizedDist * normalizedDist * (3.0 - 2.0 * normalizedDist), 0.0, 1.0);
}

// Type 1: SHOCKWAVE - Wave radiates outward from impact
vec3 deformShockwave(vec3 pos, vec3 impact, vec3 dir, float strength, float phase, float radius) {
    float falloff = calculateFalloff(pos, impact, radius);

    // Wave travels outward over time
    float dist = length(pos - impact);
    float wavePosition = phase * radius * 2.0;  // Wave expands
    float waveWidth = radius * 0.3;

    // Gaussian wave shape
    float waveFactor = exp(-pow(dist - wavePosition, 2.0) / (2.0 * waveWidth * waveWidth));

    // Displacement perpendicular to surface (approximate with position direction)
    vec3 outward = normalize(pos - impact + vec3(0.001));

    // Wave pushes out then in
    float waveDisplacement = sin(phase * 6.28318) * waveFactor * strength * 0.15;

    return outward * waveDisplacement * falloff;
}

// Type 2: RIPPLE - Concentric rings oscillating
vec3 deformRipple(vec3 pos, vec3 impact, float strength, float phase, float radius) {
    float falloff = calculateFalloff(pos, impact, radius);
    float dist = length(pos - impact);

    // Multiple ripple rings
    float rippleFreq = 4.0;
    float ripple = sin((dist / radius) * rippleFreq * 3.14159 - phase * 6.28318 * 2.0);

    // Damping over time
    float damping = exp(-phase * 3.0);

    // Perpendicular displacement
    vec3 outward = normalize(pos - impact + vec3(0.001));

    return outward * ripple * strength * 0.1 * damping * falloff;
}

// Type 3: DIRECTIONAL - Squeeze along impact axis, bulge perpendicular
vec3 deformDirectional(vec3 pos, vec3 impact, vec3 dir, float strength, float phase, float radius) {
    float falloff = calculateFalloff(pos, impact, radius);

    // Distance along impact direction
    vec3 toPos = pos - impact;
    float alongDir = dot(toPos, dir);

    // Perpendicular component
    vec3 perpendicular = toPos - dir * alongDir;
    float perpDist = length(perpendicular);
    vec3 perpDir = perpDist > 0.001 ? perpendicular / perpDist : vec3(0.0);

    // Compression along direction, bulge perpendicular
    // Phase controls animation: fast compress, slow recover
    float compressPhase = phase < 0.15 ? phase / 0.15 : 1.0 - (phase - 0.15) / 0.85;
    compressPhase = compressPhase * compressPhase * (3.0 - 2.0 * compressPhase); // smoothstep

    // Overshoot and bounce
    float bouncePhase = phase > 0.15 && phase < 0.65
        ? sin((phase - 0.15) / 0.5 * 3.14159 * 3.5) * exp(-(phase - 0.15) * 3.0) * 0.3
        : 0.0;

    float effectiveStrength = (compressPhase + bouncePhase) * strength;

    // Compress inward along direction
    vec3 compression = -dir * alongDir * effectiveStrength * 0.25;

    // Bulge outward perpendicular (volume preservation)
    vec3 bulge = perpDir * effectiveStrength * 0.12;

    return (compression + bulge) * falloff;
}

// Type 4: ELASTIC - Jello-like underdamped oscillation
vec3 deformElastic(vec3 pos, vec3 impact, vec3 dir, float strength, float phase, float radius) {
    // Combine directional with additional wobble
    vec3 baseDeform = deformDirectional(pos, impact, dir, strength, phase, radius);

    // Add jello wobble during recovery
    if (phase > 0.3) {
        float wobblePhase = (phase - 0.3) / 0.7;
        float wobbleFreq = 5.0;
        float wobbleDamp = exp(-wobblePhase * 4.0);

        float wobbleX = sin(wobblePhase * 3.14159 * wobbleFreq) * wobbleDamp;
        float wobbleY = sin(wobblePhase * 3.14159 * wobbleFreq * 1.3 + 1.0) * wobbleDamp;

        float falloff = calculateFalloff(pos, impact, radius);
        baseDeform += vec3(wobbleX, wobbleY, 0.0) * 0.02 * strength * falloff;
    }

    return baseDeform;
}

// Main deformation dispatcher
vec3 calculateDeformation(vec3 pos) {
    if (deformationType < 0.5 || deformationStrength < 0.001) {
        return vec3(0.0);
    }

    vec3 displacement = vec3(0.0);

    if (deformationType < 1.5) {
        // Type 1: Shockwave
        displacement = deformShockwave(pos, impactPoint, deformationDirection,
                                        deformationStrength, deformationPhase, deformationFalloff);
    } else if (deformationType < 2.5) {
        // Type 2: Ripple
        displacement = deformRipple(pos, impactPoint,
                                    deformationStrength, deformationPhase, deformationFalloff);
    } else if (deformationType < 3.5) {
        // Type 3: Directional
        displacement = deformDirectional(pos, impactPoint, deformationDirection,
                                         deformationStrength, deformationPhase, deformationFalloff);
    } else {
        // Type 4: Elastic
        displacement = deformElastic(pos, impactPoint, deformationDirection,
                                     deformationStrength, deformationPhase, deformationFalloff);
    }

    return displacement;
}

void main() {
    vUv = uv;

    // Apply deformation to position
    vec3 deformedPosition = position + calculateDeformation(position);

    vPosition = deformedPosition;
    vNormal = normalize(normalMatrix * normal);

    vec4 mvPosition = modelViewMatrix * vec4(deformedPosition, 1.0);
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
uniform float noiseFrequency;     // Frequency of hash noise pattern (default: 1.0)

// Internal caustics - light pooling inside the gem
uniform float causticIntensity;   // Brightness of internal caustics (default: 0.4)
uniform float causticScale;       // Scale of caustic pattern (default: 3.0)
uniform float causticSpeed;       // Animation speed of caustics (default: 0.15)

// Texture
uniform sampler2D crystalTexture;
uniform float textureStrength;    // How much texture affects appearance (default: 0.5)

// Soul refraction - samples soul rendered to texture with optical distortion
uniform sampler2D soulTexture;    // Soul mesh rendered to texture
uniform vec2 resolution;          // Screen resolution for UV calculation
uniform vec2 soulTextureSize;     // Soul render target size (may differ from screen)
uniform vec2 soulScreenCenter;    // Soul center projected to screen UV (0-1 range)
uniform float refractionIndex;    // Index of refraction (1.5 glass, 2.4 diamond)
uniform float refractionStrength; // Distortion magnitude (0.1-0.5)

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

// Emotion color bleed - how much soul color tints the gem material
uniform float emotionColorBleed;      // 0 = gem color only, 1 = full emotion tint (default: 0.0)

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

// Calculate "fire" - intense sparkle points that real gems exhibit
// These are concentrated, view-dependent highlights from light dispersion
float calculateFire(vec3 normal, vec3 viewDir, vec3 lightDir) {
    // Primary fire highlight - VERY sharp falloff for pinpoint sparkles
    vec3 reflectDir = reflect(-lightDir, normal);
    float fire1 = pow(max(0.0, dot(reflectDir, viewDir)), 512.0);

    // Secondary fire from different light angle (simulates environment)
    vec3 lightDir2 = normalize(vec3(-0.3, 0.8, 0.5));
    vec3 reflectDir2 = reflect(-lightDir2, normal);
    float fire2 = pow(max(0.0, dot(reflectDir2, viewDir)), 384.0);

    // Third fire point for more sparkle
    vec3 lightDir3 = normalize(vec3(0.7, 0.4, -0.6));
    vec3 reflectDir3 = reflect(-lightDir3, normal);
    float fire3 = pow(max(0.0, dot(reflectDir3, viewDir)), 256.0);

    // Combine fire points - only keep the brightest peaks
    float fire = fire1 + fire2 * 0.7 + fire3 * 0.5;

    // Facet edges catch more fire
    float edgeFactor = length(fwidth(normal)) * 20.0;
    fire *= (1.0 + edgeFactor * 2.0);

    return fire;
}

// Calculate bright lines along facet edges where bevels catch light
float calculateFacetEdgeLines(vec3 normal, vec3 viewDir, vec3 lightDir) {
    // Detect edges from normal discontinuities
    float edgeMag = length(fwidth(normal));

    // Sharp threshold to create distinct lines
    float edgeLine = smoothstep(0.02, 0.08, edgeMag);

    // Modulate by light angle - edges facing light are brighter
    float lightFacing = max(0.0, dot(normal, lightDir));
    edgeLine *= (0.3 + lightFacing * 0.7);

    // View-dependent - edges perpendicular to view are more visible
    float viewPerp = 1.0 - abs(dot(normal, viewDir));
    edgeLine *= (0.5 + viewPerp * 0.5);

    return edgeLine;
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

    // Core glow - strongest in center, fades toward edges with sharper falloff
    float distFromCenter = length(vPosition);
    float coreGlow = exp(-distFromCenter * 2.5) * glowPulse;

    // ═══════════════════════════════════════════════════════════════════════
    // INTERNAL CAUSTICS - Light refraction pools inside the gem
    // Creates bright concentrated spots that shift with viewing angle
    // Real caustics form where refracted light rays converge inside the gem
    // Now with CHROMATIC ABERRATION - different wavelengths refract differently
    // ═══════════════════════════════════════════════════════════════════════

    // Refract view direction through gem surface with different IOR per wavelength
    // Red refracts less (higher IOR ratio), blue refracts more (lower IOR ratio)
    // Chromatic separation is REDUCED for colored gems to avoid color contamination
    // Quartz (low sssStrength) gets full rainbow, colored gems get subtle dispersion
    float chromaticStrength = 1.0 - clamp((sssStrength - 0.5) * 0.8, 0.0, 0.8);
    float iorR = mix(0.57, 0.70, chromaticStrength); // Red - approaches green for colored gems
    float iorB = mix(0.57, 0.44, chromaticStrength); // Blue - approaches green for colored gems
    vec3 refractDirR = refract(-viewDir, normal, iorR);
    vec3 refractDirG = refract(-viewDir, normal, 0.57); // Green - always medium
    vec3 refractDirB = refract(-viewDir, normal, iorB);

    // Animated drift
    float causticTime = time * causticSpeed;
    vec3 drift = vec3(causticTime * 0.3, causticTime * 0.2, causticTime * 0.1);

    // Sample positions for each color channel
    // Offset is also reduced for colored gems to minimize chromatic contamination
    float spatialOffset = mix(1.0, 3.0, chromaticStrength);
    vec3 causticPosR = vPosition * causticScale + refractDirR * spatialOffset + drift;
    vec3 causticPosG = vPosition * causticScale + refractDirG * spatialOffset + drift;
    vec3 causticPosB = vPosition * causticScale + refractDirB * spatialOffset + drift;

    // Create caustic pattern for each channel
    // Red channel
    float waveR1 = sin(causticPosR.x * 2.0 + causticPosR.y * 1.5 + causticPosR.z);
    float waveR2 = sin(causticPosR.y * 2.3 - causticPosR.x * 1.2 + causticPosR.z * 1.8);
    float waveR3 = sin(causticPosR.z * 1.9 + causticPosR.x * 0.8 - causticPosR.y * 1.4);
    float interferenceR = (waveR1 + waveR2 + waveR3) / 3.0;
    float causticR = smoothstep(0.3, 0.8, interferenceR);

    // Green channel
    float waveG1 = sin(causticPosG.x * 2.0 + causticPosG.y * 1.5 + causticPosG.z);
    float waveG2 = sin(causticPosG.y * 2.3 - causticPosG.x * 1.2 + causticPosG.z * 1.8);
    float waveG3 = sin(causticPosG.z * 1.9 + causticPosG.x * 0.8 - causticPosG.y * 1.4);
    float interferenceG = (waveG1 + waveG2 + waveG3) / 3.0;
    float causticG = smoothstep(0.3, 0.8, interferenceG);

    // Blue channel
    float waveB1 = sin(causticPosB.x * 2.0 + causticPosB.y * 1.5 + causticPosB.z);
    float waveB2 = sin(causticPosB.y * 2.3 - causticPosB.x * 1.2 + causticPosB.z * 1.8);
    float waveB3 = sin(causticPosB.z * 1.9 + causticPosB.x * 0.8 - causticPosB.y * 1.4);
    float interferenceB = (waveB1 + waveB2 + waveB3) / 3.0;
    float causticB = smoothstep(0.3, 0.8, interferenceB);

    // Combine into RGB caustic with chromatic separation
    vec3 causticRGB = vec3(causticR, causticG, causticB);

    // Add noise variation to break up uniformity
    float noiseVar = noise3D(causticPosG * 0.5);
    causticRGB *= (0.7 + noiseVar * 0.6);

    // Clamp caustic peaks to prevent hot spot blobs
    // This keeps caustics subtle and distributed rather than concentrated
    causticRGB = min(causticRGB, vec3(0.6));

    // Caustics are MORE visible in thick areas (center) where light has more
    // material to refract through and pool
    float thickness = abs(dot(normal, viewDir)); // 1 at center, 0 at edges
    causticRGB *= (0.3 + thickness * 0.7);

    // Apply intensity control
    causticRGB *= causticIntensity;

    // Boost caustic visibility for colored gems to compensate for reduced chromatic spread
    // Colored gems (high sssStrength) have suppressed chromatic aberration, so boost their
    // monochromatic caustics to maintain internal "life" and sparkle
    float causticBoost = 1.0 + clamp((sssStrength - 0.5) * 0.8, 0.0, 0.6);
    causticRGB *= causticBoost;

    // Also keep a scalar caustic for compatibility
    float caustic = (causticRGB.r + causticRGB.g + causticRGB.b) / 3.0;

    // Animation pattern (0-1 range) - core glow + caustic hot spots
    float animationPattern = coreGlow * 0.7 + caustic * 0.3;

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
    // REFRACTED SOUL SAMPLING - True optical lensing through crystal
    // The soul is rendered to a texture, then sampled with refraction distortion
    // This creates the effect of looking at the soul through a crystal lens
    // ═══════════════════════════════════════════════════════════════════════

    // ═══════════════════════════════════════════════════════════════════
    // REFRACTED SOUL SAMPLING
    // Sample the soul texture with physical refraction distortion
    // Creates the "looking through glass" lensing effect
    // ═══════════════════════════════════════════════════════════════════
    vec3 refractedSoulColor = vec3(0.0);
    float refractedSoulAlpha = 0.0;

    if (soulTextureSize.x > 0.0 && soulScreenCenter.x >= 0.0) {
        // Fragment's screen UV position
        vec2 fragUV = gl_FragCoord.xy / soulTextureSize;

        // Calculate refraction offset using Snell's law
        float ior = refractionIndex;
        vec3 refractedDir = refract(-viewDir, normal, 1.0 / ior);

        // Apply refraction distortion toward the soul center
        // This creates the magnifying glass effect - bending light toward center
        vec2 refractionOffset = refractedDir.xy * refractionStrength * 0.1;

        // Sample at fragment position with refraction offset
        // The soul texture contains the soul rendered at its actual screen position
        vec2 soulUV = fragUV + refractionOffset;

        // Clamp to valid UV range
        soulUV = clamp(soulUV, 0.0, 1.0);

        // Sample the soul texture
        vec4 soulSample = texture2D(soulTexture, soulUV);

        // Store for later use in final composition
        refractedSoulColor = soulSample.rgb;
        refractedSoulAlpha = soulSample.a;

        // Also blend into soulColor for existing pipeline
        soulColor = mix(soulColor, soulSample.rgb, soulSample.a * 0.5);
    }

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

    // Thickness multiplier: thin edges=bright (1.0), thick face-on=dark (0.01 for near-black)
    float thicknessMultiplier = 0.01 + thinness * 0.99;
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

    // Apply SSS material color - PRESERVE BRIGHTNESS, only change HUE
    // The sssAbsorption values define the material color hue
    // But thickness-based darkness must be preserved for gemstone look
    if (sssStrength > 0.01) {
        // Get current brightness (this includes thickness darkening)
        float currentLum = dot(finalColor, vec3(0.299, 0.587, 0.114));

        // Normalize absorption to get hue direction (0-1 range)
        vec3 absorption = sssAbsorption;
        float maxAbs = max(max(absorption.r, absorption.g), absorption.b);
        vec3 hue = absorption / max(maxAbs, 0.001);

        // Create material color that PRESERVES current brightness
        // This keeps dark areas dark while tinting them with the gem color
        float hueLum = dot(hue, vec3(0.299, 0.587, 0.114));
        vec3 materialColor = hue * currentLum / max(hueLum, 0.001);

        // Clamp to prevent blowout on bright areas
        materialColor = min(materialColor, vec3(1.0));

        // Add subtle variation from SSS lighting calculation
        float sssLum = dot(sss, vec3(0.299, 0.587, 0.114));
        materialColor *= (0.9 + sssLum * 0.2);

        // Replace crystal color with material color
        float replaceAmount = sssStrength * 0.7;
        finalColor = mix(finalColor, materialColor, replaceAmount);
    }

    // Add rim glow, tinted toward material color
    if (sssStrength > 0.01) {
        vec3 absorption = sssAbsorption;
        float maxAbs = max(max(absorption.r, absorption.g), absorption.b);
        vec3 hue = absorption / max(maxAbs, 0.001);
        // Stronger tint for colored gems - use gem hue directly
        float rimTintStrength = clamp(sssStrength * 0.6, 0.0, 0.95);
        vec3 tintedRim = rimGlow * mix(vec3(1.0), hue * 1.2, rimTintStrength);
        // Cap rim to prevent bloom
        tintedRim = min(tintedRim, vec3(0.5));
        finalColor += tintedRim;
    } else {
        finalColor += rimGlow;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SPECULAR HIGHLIGHTS - Add bright hot spots
    // Tinted by gem color for colored gems to prevent white bloom
    // ═══════════════════════════════════════════════════════════════════════
    vec3 specularColor = vec3(1.0, 0.98, 0.95); // Warm white highlights for clear gems
    float specularIntensityMod = 1.0;

    if (sssStrength > 0.5) {
        // Tint specular by gem color to prevent white bloom
        vec3 absorption = sssAbsorption;
        float maxAbs = max(max(absorption.r, absorption.g), absorption.b);
        vec3 gemHue = absorption / max(maxAbs, 0.001);
        float colorStrength = clamp((sssStrength - 0.5) * 0.5, 0.0, 1.0);
        // Use gem hue for specular color
        specularColor = mix(specularColor, gemHue * 1.3, colorStrength);
        // Also reduce specular intensity for colored gems
        specularIntensityMod = mix(1.0, 0.4, colorStrength);
    }

    vec3 specularContrib = specularColor * specular * transmission * specularIntensityMod;
    specularContrib = min(specularContrib, vec3(0.5)); // Cap specular to prevent bloom
    finalColor += specularContrib;

    // ═══════════════════════════════════════════════════════════════════════
    // FACET EDGE LINES - Bright catches along beveled edges
    // ═══════════════════════════════════════════════════════════════════════
    float edgeLines = calculateFacetEdgeLines(normal, viewDir, lightDir);
    finalColor += vec3(edgeLines * 0.15) * transmission;

    // ═══════════════════════════════════════════════════════════════════════
    // SATURATION BOOST AT THIN EDGES
    // Real gems have MORE saturated color at thin edges where light escapes
    // ═══════════════════════════════════════════════════════════════════════
    if (sssStrength > 0.01) {
        // thinness: 1 at edges, 0 facing camera
        float satBoost = thinness * 0.4; // Up to 40% saturation boost at edges

        // Get current color's saturation
        float maxC = max(max(finalColor.r, finalColor.g), finalColor.b);
        float minC = min(min(finalColor.r, finalColor.g), finalColor.b);
        float currentSat = maxC > 0.001 ? (maxC - minC) / maxC : 0.0;

        // Boost saturation at thin areas
        if (maxC > 0.001 && currentSat > 0.01) {
            // Calculate luminance
            float lum = dot(finalColor, vec3(0.299, 0.587, 0.114));
            // Increase saturation by moving away from gray toward the color
            vec3 gray = vec3(lum);
            float newSat = min(currentSat + satBoost, 1.0);
            float satRatio = currentSat > 0.001 ? newSat / currentSat : 1.0;
            finalColor = gray + (finalColor - gray) * satRatio;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FINAL THICKNESS APPLICATION - Apply AFTER all additive terms
    // This ensures thick areas stay dark even with glow added
    // ═══════════════════════════════════════════════════════════════════════
    // thicknessMultiplier: 0.15 in thick center, 1.0 at thin edges
    finalColor *= thicknessMultiplier;

    // ═══════════════════════════════════════════════════════════════════════
    // INTERNAL CAUSTICS - Bright spots from light concentration inside gem
    // Now with chromatic aberration for rainbow dispersion effect
    // Applied AFTER thickness darkening so they punch through dark areas
    // ═══════════════════════════════════════════════════════════════════════
    if (causticIntensity > 0.01) {
        // Get material hue for tinting caustics
        vec3 causticTint = vec3(1.0); // Default white
        float causticTintStrength = 0.4; // Default for clear gems
        if (sssStrength > 0.5) {
            vec3 absorption = sssAbsorption;
            float maxAbs = max(max(absorption.r, absorption.g), absorption.b);
            vec3 hue = absorption / max(maxAbs, 0.001);
            // Stronger tint for colored gems to prevent white bloom
            causticTintStrength = clamp((sssStrength - 0.5) * 0.8 + 0.4, 0.4, 0.9);
            causticTint = mix(vec3(1.0), hue * 1.2, causticTintStrength);
        }
        // Add RGB caustic with chromatic aberration
        // Reduce raw RGB blend for colored gems
        float rawBlend = mix(0.3, 0.1, clamp((sssStrength - 0.5) * 0.5, 0.0, 1.0));
        vec3 causticFinal = causticRGB * causticTint + causticRGB * rawBlend;
        causticFinal = min(causticFinal, vec3(0.4)); // Cap to prevent bloom
        finalColor += causticFinal;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FIRE - Intense sparkle points from light dispersion in facets
    // The "fire" effect that makes gems sparkle brilliantly
    // ═══════════════════════════════════════════════════════════════════════
    float fire = calculateFire(normal, viewDir, lightDir);

    // Tint fire by gem color - colored gems should have tinted highlights
    // Pure white fire only for quartz/clear gems (low sssStrength)
    vec3 fireColor = vec3(1.0, 0.99, 0.97); // Base warm white
    float fireIntensity = 0.3; // Base intensity for clear gems
    float fireClamp = 1.5; // Max fire value for clear gems

    if (sssStrength > 0.5) {
        // Get gem hue from absorption - this IS the gem's color
        vec3 absorption = sssAbsorption;
        float maxAbs = max(max(absorption.r, absorption.g), absorption.b);
        vec3 gemHue = absorption / max(maxAbs, 0.001);

        // For colored gems, fire should BE the gem color, not white
        // The more colored the gem (higher sssStrength), the more the fire matches the gem
        float colorStrength = clamp((sssStrength - 0.5) * 0.5, 0.0, 1.0);

        // Use gem hue directly as fire color - NOT mixed with white
        // This ensures fire can never bloom to white
        fireColor = gemHue * 1.2; // Slight brightness boost but stay saturated

        // Reduce fire intensity AND clamp for colored gems to prevent bloom washout
        // Colored gems should have subtle, saturated fire, not bright white spots
        fireIntensity = mix(0.3, 0.08, colorStrength); // Much lower for colored gems
        fireClamp = mix(1.5, 0.5, colorStrength); // Much lower clamp for colored gems
    }

    // Apply fire clamp BEFORE multiplying by color
    fire = min(fire, fireClamp);

    // Calculate fire contribution and clamp to prevent any channel from blooming
    vec3 fireContribution = fireColor * fire * fireIntensity;
    fireContribution = min(fireContribution, vec3(0.4)); // Hard cap on fire brightness
    finalColor += fireContribution;

    // Ensure minimum brightness - allow near-black for gemstones
    // minBrightness of 0.01 allows true darks while preventing total black
    finalColor = max(finalColor, vec3(minBrightness));

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

    // ═══════════════════════════════════════════════════════════════════════
    // REFRACTED SOUL - Add the soul visible through the crystal
    // This is the actual soul mesh rendered to texture and sampled with refraction
    // ═══════════════════════════════════════════════════════════════════════
    if (refractedSoulAlpha > 0.01) {
        // The soul should glow through the crystal, tinted by the crystal's color
        // Use additive blending so the soul illuminates the crystal from within
        vec3 soulGlow = refractedSoulColor * refractedSoulAlpha;

        // Tint the soul by the crystal's SSS color for colored gems
        // emotionColorBleed controls how much pure emotion color comes through
        // 0 = fully tinted by gem color, 1 = pure emotion color
        if (sssStrength > 0.01) {
            vec3 absorption = sssAbsorption;
            float maxAbs = max(max(absorption.r, absorption.g), absorption.b);
            vec3 gemHue = absorption / max(maxAbs, 0.001);
            float tintAmount = sssStrength * 0.5 * (1.0 - emotionColorBleed);
            soulGlow *= mix(vec3(1.0), gemHue, tintAmount);
        }

        // Add soul glow to final color
        finalColor += soulGlow * 0.8;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // EMOTION COLOR BLEED - Additional inner glow from soul emotion
    // Adds pure emotion color as light shining through the gem from the soul
    // ═══════════════════════════════════════════════════════════════════════
    if (emotionColorBleed > 0.001 && sssStrength > 0.01) {
        // Inner glow based on thickness - thinner areas show more soul light
        float innerGlow = 1.0 - abs(dot(normal, viewDir)); // Edges are thin
        innerGlow = pow(innerGlow, 1.5) * emotionColorBleed;

        // Also add glow near the core
        float coreProximity = exp(-distFromCenter * 2.0);
        innerGlow += coreProximity * emotionColorBleed * 0.5;

        // Add pure emotion color as inner light
        finalColor += emotionColor * innerGlow * 0.4;
    }

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
    minBrightness: 0.005,       // Minimum brightness floor (near-black for gemstones)

    // Noise scales
    surfaceNoiseScale: 1.50,    // Scale of surface frost pattern
    noiseFrequency: 1.33,       // Frequency of hash noise pattern

    // Internal caustics
    causticIntensity: 0.8,      // Brightness of internal caustic hot spots
    causticScale: 2.0,          // Scale of caustic pattern
    causticSpeed: 0.12,         // Animation speed of caustics

    // Texture
    textureStrength: 0.55,      // How much texture affects appearance

    // Soul refraction - optical lensing of inner soul through crystal
    refractionIndex: 1.5,       // Index of refraction (1.5 glass, 2.4 diamond)
    refractionStrength: 0.5,    // Distortion magnitude - higher for more pronounced lensing
    resolution: [1920, 1080],   // Screen resolution (updated at runtime)
    soulTextureSize: [1920, 1080], // Soul render target size (updated at runtime)
    soulScreenCenter: [0.5, 0.5],  // Soul center in screen UV (updated at runtime)

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

    // Emotion color bleed - how much soul color tints gem material
    emotionColorBleed: 0.0,                 // 0 = gem color only, 1 = full emotion tint

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
