/**
 * Crystal Shader with Blend Layers
 *
 * Custom shader for crystalline geometries with distinct visual components:
 * - Core Glow: Inner luminescence driven by emotion color
 * - Fresnel Rim: Edge brightness that increases at glancing angles
 * - Transmission: Light passing through the crystal body
 * - Facet Highlights: Sparkle on crystal facets
 *
 * Each component can be adjusted via blend mode layers.
 * Uses universal blend mode utilities from src/3d/shaders/utils/blendModes.js
 */

import { blendModesGLSL } from './utils/blendModes.js';

export const crystalWithBlendLayersVertexShader = `
/**
 * Crystal Vertex Shader
 * Passes all necessary data for crystal visual effects
 */

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying vec3 vViewPosition;
varying vec3 vViewDir;

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vPosition = position;
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;

    // Calculate view-space position
    vec4 viewPos = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = viewPos.xyz;

    // View direction (camera to vertex)
    vViewDir = normalize(-viewPos.xyz);

    gl_Position = projectionMatrix * viewPos;
}
`;

export const crystalWithBlendLayersFragmentShader = `
/**
 * Crystal Fragment Shader with Blend Layers
 *
 * Renders crystalline materials with:
 * - Core glow (inner light)
 * - Fresnel rim (edge glow)
 * - Transmission effect (glass-like)
 * - Facet sparkle (geometric highlights)
 * - 4 sequential blend layers for appearance customization
 */

precision highp float;

uniform float time;
uniform vec3 baseColor;
uniform vec3 emotionColor;
uniform float emissiveIntensity;
uniform float opacity;

// Crystal-specific uniforms
uniform float coreGlowStrength;      // Inner glow intensity (0-2)
uniform float coreGlowFalloff;       // How quickly glow falls off from center (0.5-3)
uniform float fresnelStrength;       // Edge rim brightness (0-2)
uniform float fresnelPower;          // Fresnel falloff power (1-5)
uniform float transmissionStrength;  // Glass-like transmission (0-1)
uniform float facetStrength;         // Facet highlight intensity (0-1)
uniform float iridescenceStrength;   // Color shift by angle (0-1)
uniform float chromaticAberration;   // RGB edge splitting (0-1)

// Animation controls
uniform float sparkleEnabled;        // Toggle sparkle animation
uniform float sparkleSpeed;          // Sparkle animation speed
uniform float causticEnabled;        // Toggle caustic animation
uniform float causticStrength;       // Internal caustic intensity
uniform float causticSpeed;          // Caustic animation speed
uniform float causticScale;          // Caustic pattern granularity
uniform float causticCoverage;       // How much of the crystal caustics cover (0-1)
uniform float energyPulseEnabled;    // Toggle energy pulse
uniform float energyPulseSpeed;      // Energy animation speed
uniform float blinkIntensity;        // Blink state from emotion (0-1)

// Blend Layer Uniforms - Core Glow
uniform float coreBlend1Mode;
uniform float coreBlend1Strength;
uniform float coreBlend1Enabled;
uniform float coreBlend2Mode;
uniform float coreBlend2Strength;
uniform float coreBlend2Enabled;

// Blend Layer Uniforms - Fresnel
uniform float fresnelBlend1Mode;
uniform float fresnelBlend1Strength;
uniform float fresnelBlend1Enabled;
uniform float fresnelBlend2Mode;
uniform float fresnelBlend2Strength;
uniform float fresnelBlend2Enabled;

// Blend Layer Uniforms - Transmission
uniform float transBlend1Mode;
uniform float transBlend1Strength;
uniform float transBlend1Enabled;
uniform float transBlend2Mode;
uniform float transBlend2Strength;
uniform float transBlend2Enabled;

// Blend Layer Uniforms - Facets
uniform float facetBlend1Mode;
uniform float facetBlend1Strength;
uniform float facetBlend1Enabled;
uniform float facetBlend2Mode;
uniform float facetBlend2Strength;
uniform float facetBlend2Enabled;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying vec3 vViewPosition;
varying vec3 vViewDir;

// ═══════════════════════════════════════════════════════════════════════════
// UNIVERSAL BLEND MODES (injected from utils/blendModes.js)
// ═══════════════════════════════════════════════════════════════════════════
${blendModesGLSL}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

// Simple hash for pseudo-random facet variation
float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

// 3D Simplex-like noise for caustics and energy
float noise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f); // Smoothstep

    float n = i.x + i.y * 157.0 + i.z * 113.0;
    vec4 v1 = fract(sin(vec4(n, n+1.0, n+157.0, n+158.0)) * 43758.5453);
    vec4 v2 = fract(sin(vec4(n+113.0, n+114.0, n+270.0, n+271.0)) * 43758.5453);

    vec4 a = mix(v1, v2, f.z);
    vec2 b = mix(a.xy, a.zw, f.y);
    return mix(b.x, b.y, f.x);
}

// Fractal Brownian Motion for organic caustic patterns
float fbm(vec3 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for (int i = 0; i < 4; i++) {
        if (i >= octaves) break;
        value += amplitude * noise3D(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    return value;
}

// Caustic pattern generator
float causticPattern(vec3 p, float t) {
    // Two overlapping noise layers moving in different directions
    float c1 = fbm(p * 3.0 + vec3(t * 0.3, t * 0.2, t * 0.1), 3);
    float c2 = fbm(p * 2.5 - vec3(t * 0.2, t * 0.3, t * 0.15), 3);

    // Create caustic-like bright spots where waves intersect
    float caustic = pow(c1 * c2 * 4.0, 2.0);
    return clamp(caustic, 0.0, 1.0);
}

// Apply two blend modes to a component
vec3 applyComponentBlends(vec3 base, vec3 componentColor,
    float mode1, float strength1, float enabled1,
    float mode2, float strength2, float enabled2) {

    vec3 result = componentColor;

    if (enabled1 > 0.5) {
        vec3 blendColor = vec3(strength1);
        int m1 = int(mode1 + 0.5);
        result = applyBlendMode(result, blendColor, m1);
    }

    if (enabled2 > 0.5) {
        vec3 blendColor = vec3(strength2);
        int m2 = int(mode2 + 0.5);
        result = applyBlendMode(result, blendColor, m2);
    }

    return result;
}

void main() {
    // ═══════════════════════════════════════════════════════════════════════════
    // 0. BACKFACE HANDLING - Flip normal for back faces
    // Crystal is DoubleSide, so we need to flip normal when viewing from behind
    // ═══════════════════════════════════════════════════════════════════════════
    vec3 worldNormal = gl_FrontFacing ? vWorldNormal : -vWorldNormal;

    // ═══════════════════════════════════════════════════════════════════════════
    // 1. CORE GLOW - Inner luminescence
    // Simulates light emanating from crystal center
    // Brightest when looking straight at surface (seeing "through" to center)
    // ═══════════════════════════════════════════════════════════════════════════

    // Core glow for self-luminous crystal - POSITION-BASED, not view-based
    // The soul glows uniformly from the center outward, same from all viewing angles
    // This creates the "crystal with soul inside" effect that looks consistent from any direction

    // Distance-based glow: brighter near center, fading toward edges
    float distFromCenter = length(vPosition);
    float maxDist = 0.7; // Approximate max distance in crystal geometry
    float normalizedDist = clamp(distFromCenter / maxDist, 0.0, 1.0);

    // Core glow falloff from center outward (coreGlowFalloff controls the curve)
    // Low falloff = glow spreads further, high falloff = concentrated in center
    float coreGlow = pow(1.0 - normalizedDist, max(0.1, coreGlowFalloff * 2.0));

    // Also calculate NdotV for fresnel (still needed for rim effects)
    float NdotV = abs(dot(worldNormal, vViewDir));
    NdotV = max(NdotV, 0.001);

    // Core color from emotion - emanates uniformly from inside
    vec3 coreColor = emotionColor * coreGlow * coreGlowStrength * emissiveIntensity;

    // Apply core blend modes
    coreColor = applyComponentBlends(baseColor, coreColor,
        coreBlend1Mode, coreBlend1Strength, coreBlend1Enabled,
        coreBlend2Mode, coreBlend2Strength, coreBlend2Enabled);

    // ═══════════════════════════════════════════════════════════════════════════
    // 2. FRESNEL RIM - Edge brightness with chromatic aberration
    // Increases at glancing angles (classic glass/crystal effect)
    // ═══════════════════════════════════════════════════════════════════════════

    // NdotV already calculated above for core glow
    // Clamp fresnel base to avoid pow(0, x) and use max power to avoid pow(x, 0)
    float fresnelBase = max(1.0 - NdotV, 0.001);
    float fresnel = pow(fresnelBase, max(0.5, fresnelPower));

    // Chromatic aberration - split RGB at edges like a prism
    // Each color channel has slightly different fresnel power
    float fresnelR = pow(fresnelBase, max(0.5, fresnelPower * (1.0 - chromaticAberration * 0.3)));
    float fresnelG = pow(fresnelBase, max(0.5, fresnelPower));
    float fresnelB = pow(fresnelBase, max(0.5, fresnelPower * (1.0 + chromaticAberration * 0.3)));

    // Base fresnel color with emotion tint
    vec3 baseFresnelColor = mix(vec3(1.0), emotionColor, 0.3);

    // Apply chromatic aberration to create rainbow edge effect
    vec3 fresnelColor = vec3(
        baseFresnelColor.r * fresnelR,
        baseFresnelColor.g * fresnelG,
        baseFresnelColor.b * fresnelB
    ) * fresnelStrength;

    // Add extra rainbow shimmer at strong chromatic aberration
    if (chromaticAberration > 0.1) {
        vec3 rainbow = vec3(
            sin(fresnel * 6.28 + 0.0) * 0.5 + 0.5,
            sin(fresnel * 6.28 + 2.09) * 0.5 + 0.5,
            sin(fresnel * 6.28 + 4.18) * 0.5 + 0.5
        );
        fresnelColor = mix(fresnelColor, rainbow * fresnelStrength, chromaticAberration * fresnel * 0.5);
    }

    // Apply fresnel blend modes
    fresnelColor = applyComponentBlends(baseColor, fresnelColor,
        fresnelBlend1Mode, fresnelBlend1Strength, fresnelBlend1Enabled,
        fresnelBlend2Mode, fresnelBlend2Strength, fresnelBlend2Enabled);

    // ═══════════════════════════════════════════════════════════════════════════
    // 3. TRANSMISSION - Light passing through crystal
    // Simulates subsurface scattering / glass transmission
    // ═══════════════════════════════════════════════════════════════════════════

    // Transmission based on thickness (thicker = more color absorption)
    float thickness = 1.0 - abs(dot(vNormal, vViewDir));
    thickness = pow(thickness, 0.5);

    // Iridescence - color shift based on viewing angle
    vec3 iridescence = vec3(
        sin(NdotV * 6.28 + 0.0) * 0.5 + 0.5,
        sin(NdotV * 6.28 + 2.09) * 0.5 + 0.5,
        sin(NdotV * 6.28 + 4.18) * 0.5 + 0.5
    );

    vec3 transColor = mix(baseColor, iridescence, iridescenceStrength);
    transColor *= thickness * transmissionStrength;

    // Apply transmission blend modes
    transColor = applyComponentBlends(baseColor, transColor,
        transBlend1Mode, transBlend1Strength, transBlend1Enabled,
        transBlend2Mode, transBlend2Strength, transBlend2Enabled);

    // ═══════════════════════════════════════════════════════════════════════════
    // 4. FACET HIGHLIGHTS - Geometric sparkle
    // Sharp highlights on crystal facets based on normal discontinuities
    // ═══════════════════════════════════════════════════════════════════════════

    // Use normal direction to create facet-based variation
    // Use worldNormal (flipped for back faces) so both sides look the same
    vec3 quantizedNormal = floor(worldNormal * 10.0) / 10.0;
    float facetHash = hash(quantizedNormal * 100.0);

    // View-based highlight for self-luminous crystal (no external light source)
    // Facets facing camera get highlight, creating sparkle without dark sides
    float viewFacing = max(dot(worldNormal, vViewDir), 0.0);
    float facetHighlight = pow(viewFacing, 2.0) * (0.5 + facetHash * 0.5);

    // Animate subtle sparkle (toggleable)
    // Sparkle animation - sparkleSpeed of 1.0 = gentle sparkle
    float sparkle = 0.5;
    if (sparkleEnabled > 0.5) {
        sparkle = sin(time * sparkleSpeed + facetHash * 6.28) * 0.5 + 0.5;
    }
    facetHighlight *= (0.8 + sparkle * 0.4);

    vec3 facetColor = vec3(1.0) * facetHighlight * facetStrength;

    // Apply facet blend modes
    facetColor = applyComponentBlends(baseColor, facetColor,
        facetBlend1Mode, facetBlend1Strength, facetBlend1Enabled,
        facetBlend2Mode, facetBlend2Strength, facetBlend2Enabled);

    // ═══════════════════════════════════════════════════════════════════════════
    // 5. INTERNAL CAUSTICS - Light patterns inside the crystal
    // Animated noise-based caustic patterns that simulate light refraction
    // ═══════════════════════════════════════════════════════════════════════════

    // Internal caustics (toggleable)
    // Caustic animation - causticSpeed of 1.0 = gentle movement
    float caustic = 0.0;
    if (causticEnabled > 0.5) {
        caustic = causticPattern(vPosition * causticScale, time * causticSpeed) * causticStrength;

        // Apply coverage - controls how far from center caustics reach
        // At coverage=1.0, caustics appear everywhere
        // At coverage=0.5, caustics fade out in the outer half
        float distFromCenter = length(vPosition);
        float maxDist = 0.7; // approximate max distance in crystal geometry
        float normalizedDist = distFromCenter / maxDist;
        float coverageMask = 1.0 - smoothstep(causticCoverage * 0.8, causticCoverage, normalizedDist);
        caustic *= coverageMask;
    }

    // Caustics are colored by emotion - uniform from all viewing angles
    // Position-based visibility (inner caustics brighter) for consistent look
    vec3 causticColor = emotionColor * caustic * 2.0;

    // ═══════════════════════════════════════════════════════════════════════════
    // 6. ENERGY PULSE - Animated internal energy
    // Creates a living, breathing effect inside the crystal
    // ═══════════════════════════════════════════════════════════════════════════

    // Energy pulse tied to blink state (emotion-driven)
    // When crystal blinks, energy pulses through the shell
    float energy = 0.0;
    if (energyPulseEnabled > 0.5 && blinkIntensity > 0.01) {
        // Use blink intensity directly - creates a pulse when crystal "blinks"
        float pulse = blinkIntensity;
        float energyNoise = noise3D(vPosition * 2.0 + time);
        float verticalFlow = sin(vPosition.y * 2.0 + time * 2.0) * 0.5 + 0.5;
        energy = pulse * energyNoise * verticalFlow * coreGlowStrength;
    }
    vec3 energyColor = emotionColor * energy * 0.5;

    // ═══════════════════════════════════════════════════════════════════════════
    // 7. COMBINE ALL COMPONENTS
    // Crystal shell should be mostly transparent to show inner core
    // ═══════════════════════════════════════════════════════════════════════════

    // ═══════════════════════════════════════════════════════════════════════════
    // FROSTED LUMINOUS CRYSTAL - Like backlit selenite/quartz
    // The material is translucent and GLOWS throughout, not transparent
    // Light fills and diffuses through the entire crystal body
    // ═══════════════════════════════════════════════════════════════════════════

    // Subsurface scattering approximation - light diffuses through the material
    // Brighter toward center (where core is), softer toward edges
    float distanceFromCenter = length(vPosition) / 0.5; // Normalize by approximate radius
    float coreBrightness = 1.0 - clamp(distanceFromCenter * 0.6, 0.0, 0.7);

    // Base frosted glow - modulated by subsurface scattering
    float frostedMult = 0.4 + coreBrightness * 0.5;

    // Add slight white/milky tint for frosted look (constant, not tied to core intensity)
    vec3 milkyTint = vec3(1.0, 1.0, 1.0) * 0.1;

    // Combine all components - use the blend-layer-processed colors
    vec3 finalColor = coreColor * frostedMult;   // Core glow with subsurface scattering
    finalColor += fresnelColor * 0.8;            // Fresnel rim (blend layers applied)
    finalColor += transColor * 0.4;              // Transmission effect (blend layers applied)
    finalColor += facetColor * 0.3;              // Facet sparkle (blend layers applied)
    finalColor += causticColor * 0.2;            // Internal light patterns
    finalColor += energyColor;                   // Pulse effect
    finalColor += milkyTint;                     // Frosted white tint

    // Higher alpha - frosted material is visible, not transparent
    // But still allow some transparency for particles to peek through
    // Both front and back faces render identically for self-luminous frosted crystal
    float shellAlpha = 0.5 + fresnel * 0.25;
    shellAlpha = clamp(shellAlpha, 0.4, 0.75);

    gl_FragColor = vec4(finalColor, shellAlpha * opacity);
}
`;

/**
 * Get crystal shader with blend layers
 * @returns {Object} Object with vertexShader and fragmentShader strings
 */
export function getCrystalWithBlendLayersShaders() {
    return {
        vertexShader: crystalWithBlendLayersVertexShader,
        fragmentShader: crystalWithBlendLayersFragmentShader
    };
}

/**
 * Default uniform values for crystal shader
 * @returns {Object} Default uniforms object for THREE.ShaderMaterial
 */
export function getCrystalDefaultUniforms() {
    return {
        time: { value: 0 },
        baseColor: { value: null }, // Set to THREE.Color
        emotionColor: { value: null }, // Set to THREE.Color
        emissiveIntensity: { value: 2.0 },
        opacity: { value: 0.9 },

        // Crystal-specific - tuned for crystalline appearance
        coreGlowStrength: { value: 0.1 },    // Inner core intensity
        coreGlowFalloff: { value: 0.4 },     // Inner core size
        fresnelStrength: { value: 0.4 },     // Edge glow strength
        fresnelPower: { value: 2.0 },        // Fresnel falloff curve
        transmissionStrength: { value: 0.1 },
        facetStrength: { value: 0.6 },       // Facet sparkle
        iridescenceStrength: { value: 0.2 },
        chromaticAberration: { value: 0.4 },

        // Animation controls
        sparkleEnabled: { value: 1.0 },      // Toggle sparkle animation
        sparkleSpeed: { value: 1.0 },        // Sparkle animation speed
        causticEnabled: { value: 1.0 },      // Toggle caustic animation
        causticStrength: { value: 0.6 },     // Internal caustic intensity
        causticSpeed: { value: 1.0 },        // Caustic animation speed
        causticScale: { value: 2.0 },        // Caustic pattern granularity
        causticCoverage: { value: 1.0 },     // Coverage area (0-1, 1=full)
        energyPulseEnabled: { value: 1.0 },  // Toggle energy pulse
        energyPulseSpeed: { value: 0.3 },    // Energy pulse speed
        blinkIntensity: { value: 0.0 },      // Blink state from emotion (0-1)

        // Core Glow blend layers - disabled by default
        coreBlend1Mode: { value: 4.0 },     // Screen
        coreBlend1Strength: { value: 0.5 },
        coreBlend1Enabled: { value: 0.0 },
        coreBlend2Mode: { value: 0.0 },
        coreBlend2Strength: { value: 0.0 },
        coreBlend2Enabled: { value: 0.0 },

        // Fresnel blend layers - disabled by default
        fresnelBlend1Mode: { value: 4.0 },  // Screen
        fresnelBlend1Strength: { value: 0.5 },
        fresnelBlend1Enabled: { value: 0.0 },
        fresnelBlend2Mode: { value: 0.0 },
        fresnelBlend2Strength: { value: 0.0 },
        fresnelBlend2Enabled: { value: 0.0 },

        // Transmission blend layers - disabled by default
        transBlend1Mode: { value: 5.0 },    // Overlay
        transBlend1Strength: { value: 0.5 },
        transBlend1Enabled: { value: 0.0 },
        transBlend2Mode: { value: 0.0 },
        transBlend2Strength: { value: 0.0 },
        transBlend2Enabled: { value: 0.0 },

        // Facet blend layers - disabled by default
        facetBlend1Mode: { value: 6.0 },    // Add
        facetBlend1Strength: { value: 0.5 },
        facetBlend1Enabled: { value: 0.0 },
        facetBlend2Mode: { value: 0.0 },
        facetBlend2Strength: { value: 0.0 },
        facetBlend2Enabled: { value: 0.0 }
    };
}
