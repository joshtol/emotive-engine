/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Moon Shader with Blend Layers
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Moon shader extended with universal blend mode layer system
 * @author Emotive Engine Team
 * @module 3d/shaders/shadows/moonWithBlendLayers
 *
 * Extends the standard moon shader with support for multiple sequential blend mode layers.
 * Uses universal blend mode utilities from src/3d/shaders/utils/blendModes.js
 * Allows drag-and-drop layer stacking for complex color grading effects.
 */

import { blendModesGLSL } from '../utils/blendModes.js';

export const moonWithBlendLayersVertexShader = `
/**
 * Moon Vertex Shader
 * Passes world-space normal to fragment shader for realistic lighting
 */

varying vec3 vPosition; // LOCAL position
varying vec3 vWorldPosition;
varying vec3 vWorldNormal; // WORLD SPACE normal (rotates with moon)
varying vec3 vViewPosition;
varying vec2 vUv;

void main() {
    vUv = uv;
    vPosition = position;

    // Transform normal to WORLD space (not view space)
    // This makes the shadow rotate with the moon geometry
    vWorldNormal = normalize(mat3(modelMatrix) * normal);

    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vec4 viewPosition = viewMatrix * worldPosition;
    vViewPosition = viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
}
`;

export const moonWithBlendLayersFragmentShader = `
/**
 * Moon Fragment Shader with Blend Layers
 *
 * Supports up to 4 sequential blend mode layers for complex color grading
 * using universal Photoshop-style blend modes
 */

uniform sampler2D colorMap;
uniform sampler2D normalMap;
uniform vec2 shadowOffset;
uniform float shadowCoverage;
uniform float shadowSoftness;
uniform vec3 glowColor;
uniform float glowIntensity;
uniform float opacity;

// Lunar Eclipse (Blood Moon) uniforms
uniform float eclipseProgress;
uniform float eclipseIntensity;
uniform vec3 bloodMoonColor;
uniform float emissiveStrength;
uniform vec2 eclipseShadowPos;      // Shadow center position (-2 to 1)
uniform float eclipseShadowRadius;  // Shadow radius

// Eclipse Color Grading (from color pickers)
uniform vec3 eclipseShadowColor;
uniform vec3 eclipseMidtoneColor;
uniform vec3 eclipseHighlightColor;
uniform vec3 eclipseGlowColor;

// Blend Layer Uniforms (up to 4 layers)
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
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying vec3 vViewPosition;
varying vec2 vUv;

// ═══════════════════════════════════════════════════════════════════════════
// UNIVERSAL BLEND MODES (injected from utils/blendModes.js)
// ═══════════════════════════════════════════════════════════════════════════
${blendModesGLSL}

void main() {
    // DIRECTIONAL SHADOW in WORLD SPACE - realistic moon phase lighting
    vec3 worldNormal = normalize(vWorldNormal);

    float lightX = shadowOffset.x;
    float lightY = shadowOffset.y;
    float offsetMagnitude = length(vec2(lightX, lightY));
    float lightZ = 1.0 - pow(offsetMagnitude, 1.5);
    vec3 lightDir = normalize(vec3(lightX, lightY, lightZ));

    float facing = dot(worldNormal, lightDir);
    float edgeWidth = max(fwidth(facing) * 4.0, shadowSoftness * 3.0);
    float shadowFactor = smoothstep(-edgeWidth, edgeWidth, facing);

    // Sample moon surface texture
    vec4 texColor = texture2D(colorMap, vUv);
    float brightness = texColor.r + texColor.g + texColor.b;
    if (brightness < 0.03) {
        texColor = vec4(0.5, 0.5, 0.5, 1.0);
    }

    // LIMB DARKENING
    vec3 viewDir = normalize(-vViewPosition);
    float rimFactor = dot(worldNormal, viewDir);
    float limbDarkening = smoothstep(0.0, 0.6, rimFactor);

    // DIFFUSE LIGHTING
    float diffuse = max(facing, 0.0);
    float diffuseLighting = mix(0.7, 1.0, diffuse);

    // EARTHSHINE
    vec3 earthshine = texColor.rgb * 0.01 * vec3(0.35, 0.4, 0.6);

    // Apply shadow transition
    float litFactor = pow(shadowFactor, 2.0);
    vec3 detailEnhanced = texColor.rgb * 1.08;
    float textureLuminance = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
    detailEnhanced = mix(texColor.rgb * 0.95, texColor.rgb * 1.12, smoothstep(0.3, 0.7, textureLuminance));

    vec3 litColor = detailEnhanced * diffuseLighting;
    vec3 shadowedColor = mix(earthshine, litColor, litFactor);
    shadowedColor *= mix(0.6, 1.0, limbDarkening);

    vec3 emissive = vec3(0.02, 0.02, 0.02) * shadowFactor;
    vec3 emotionGlow = glowColor * glowIntensity * 0.02 * shadowFactor;
    vec3 finalColor = shadowedColor + emissive + emotionGlow;

    // ═══════════════════════════════════════════════════════════════════════════
    // LUNAR ECLIPSE EFFECT (Earth's Shadow Sweep)
    // Shadow position drives everything - automatically transitions from dark sharp shadow to red glow
    // ═══════════════════════════════════════════════════════════════════════════
    // Only apply eclipse if shadow is actually near the moon (shadowX > -1.5)
    if (eclipseProgress > 0.001 && eclipseShadowPos.x > -1.5) {
        // Calculate distance from shadow center in UV space
        vec2 shadowCenter = vec2(eclipseShadowPos.x, eclipseShadowPos.y);
        vec2 moonCenter = vUv - vec2(0.5, 0.5); // Center UV coordinates
        float distFromShadow = length(moonCenter - shadowCenter);

        // Earth's umbra (full shadow) - Softer edge for smoother transitions
        float umbraRadius = eclipseShadowRadius * 0.7;
        float umbraEdge = 0.08; // Softer for smoother shadow transitions
        float umbra = 1.0 - smoothstep(umbraRadius - umbraEdge, umbraRadius + umbraEdge, distFromShadow);

        // Earth's penumbra (partial shadow) - softer outer edge
        float penumbraRadius = eclipseShadowRadius * 1.1;
        float penumbraEdge = 0.15;
        float penumbra = 1.0 - smoothstep(penumbraRadius - penumbraEdge, penumbraRadius + penumbraEdge, distFromShadow);

        // TOTALITY FACTOR: Based on how centered the shadow is on the moon
        // When shadowX near 0.0 (centered), we're at totality - brightens and reddens
        // When shadowX far from 0.0 (off to side), we're partial - stays dark and sharp
        float shadowCenteredness = 1.0 - smoothstep(0.0, 0.6, abs(eclipseShadowPos.x));
        float totalityFactor = shadowCenteredness;

        // UMBRA DARKENING: Nearly black during partials, MUCH LIGHTER during totality
        // Partials (shadow off-center): 95% darkening (nearly black)
        // Totality (shadow centered): 30% darkening (visible, bright blood moon)
        float umbraDarkeningAmount = mix(0.95, 0.30, totalityFactor);
        float umbraDarkening = umbra * eclipseProgress;
        finalColor *= (1.0 - umbraDarkening * umbraDarkeningAmount);

        // PENUMBRA: Lighter darkening (Earth partially blocks sunlight)
        float penumbraDarkening = (penumbra - umbra) * eclipseProgress;
        finalColor *= (1.0 - penumbraDarkening * 0.20);

        // BLOOD MOON COLOR: Only appears when shadow is centered (totality)
        // Partials (off-center) stay gray/black, totality (centered) becomes red
        vec3 bloodMoonTint = mix(vec3(1.0), eclipseMidtoneColor, umbra * totalityFactor);
        finalColor *= bloodMoonTint;

        // EMISSIVE GLOW: Atmospheric scattering only during totality - BOOSTED for brightness
        vec3 atmosphereGlow = eclipseMidtoneColor * emissiveStrength * 0.8 * umbra * totalityFactor;
        finalColor += atmosphereGlow;

        // RIM GLOW: Brightest during totality - BOOSTED for visible edge glow
        float limbGlow = pow(1.0 - rimFactor, 3.0) * umbra * totalityFactor;
        finalColor += eclipseGlowColor * limbGlow * emissiveStrength * 1.2;

        // ═══════════════════════════════════════════════════════════════════════════
        // ECLIPSE BLEND LAYERS (Applied AFTER blood moon color)
        // Blend layers fade in/out based on totality factor (shadow centeredness)
        // Only fully visible at totality (shadow centered), fade away during partials
        // ═══════════════════════════════════════════════════════════════════════════

        // Layer 1: Linear Burn @ 0.9 - strength is blend color, faded by totality
        if (layer1Enabled > 0.5 && eclipseProgress > 0.1) {
            vec3 blendColor1 = vec3(layer1Strength); // Strength IS the blend color (0.0-1.0)
            int mode1 = int(layer1Mode + 0.5);
            vec3 blended1 = applyBlendMode(finalColor, blendColor1, mode1);
            // Mix based on totality factor - full blend at totality, none during partials
            finalColor = mix(finalColor, blended1, totalityFactor);
        }

        // Layer 2: User calibration layer - strength is blend color, faded by totality
        if (layer2Enabled > 0.5 && eclipseProgress > 0.1) {
            vec3 blendColor2 = vec3(layer2Strength); // Strength IS the blend color
            int mode2 = int(layer2Mode + 0.5);
            vec3 blended2 = applyBlendMode(finalColor, blendColor2, mode2);
            finalColor = mix(finalColor, blended2, totalityFactor);
        }

        // Layer 3: User calibration layer - strength is blend color, faded by totality
        if (layer3Enabled > 0.5 && eclipseProgress > 0.1) {
            vec3 blendColor3 = vec3(layer3Strength); // Strength IS the blend color
            int mode3 = int(layer3Mode + 0.5);
            vec3 blended3 = applyBlendMode(finalColor, blendColor3, mode3);
            finalColor = mix(finalColor, blended3, totalityFactor);
        }

        // Layer 4: Manual UI layer - strength is blend color, faded by totality
        if (layer4Enabled > 0.5 && eclipseProgress > 0.1) {
            vec3 blendColor4 = vec3(layer4Strength); // Strength IS the blend color
            int mode4 = int(layer4Mode + 0.5);
            vec3 blended4 = applyBlendMode(finalColor, blendColor4, mode4);
            finalColor = mix(finalColor, blended4, totalityFactor);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // UNIVERSAL BLEND MODE LAYERS (Only applied when eclipse is OFF)
    // These are manual UI-driven color grading tools
    // NOTE: These are DISABLED by default - they're NEVER used since the multiplexer
    // demo doesn't enable them. This section exists for potential future manual control.
    // ═══════════════════════════════════════════════════════════════════════════
    // INTENTIONALLY COMMENTED OUT - these would interfere with eclipse blend layers
    // if (eclipseProgress < 0.001) {
    //     // Layer 1 - manual UI control only
    //     if (layer1Enabled > 0.5) {
    //         vec3 blendColor1 = vec3(layer1Strength);
    //         int mode1 = int(layer1Mode + 0.5);
    //         finalColor = applyBlendMode(finalColor, blendColor1, mode1);
    //     }
    // }

    gl_FragColor = vec4(finalColor, opacity);
}
`;

/**
 * Get moon shader with blend layers
 * @returns {Object} Object with vertexShader and fragmentShader strings
 */
export function getMoonWithBlendLayersShaders() {
    return {
        vertexShader: moonWithBlendLayersVertexShader,
        fragmentShader: moonWithBlendLayersFragmentShader
    };
}
