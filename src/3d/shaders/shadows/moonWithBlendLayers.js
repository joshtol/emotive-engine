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
    // BLOOD MOON GRADIENT (always calculated for blend layers)
    // ═══════════════════════════════════════════════════════════════════════════
    float gradientFactor = rimFactor;
    vec3 deepRed = vec3(0.6, 0.2, 0.12);
    vec3 brightOrange = vec3(0.95, 0.45, 0.22);
    vec3 bloodGradient = mix(deepRed, brightOrange, pow(gradientFactor, 1.8));

    // ═══════════════════════════════════════════════════════════════════════════
    // SEQUENTIAL BLEND MODE LAYERS (work independently of eclipse)
    // Apply each enabled layer in order (Layer 1 → Layer 2 → Layer 3 → Layer 4)
    // ═══════════════════════════════════════════════════════════════════════════
    vec3 result = finalColor;

    // Layer 1
    if (layer1Enabled > 0.5) {
        vec3 blendColor1 = bloodGradient * layer1Strength;
        int mode1 = int(layer1Mode + 0.5);
        result = applyBlendMode(result, blendColor1, mode1);
    }

    // Layer 2
    if (layer2Enabled > 0.5) {
        vec3 blendColor2 = bloodGradient * layer2Strength;
        int mode2 = int(layer2Mode + 0.5);
        result = applyBlendMode(result, blendColor2, mode2);
    }

    // Layer 3
    if (layer3Enabled > 0.5) {
        vec3 blendColor3 = bloodGradient * layer3Strength;
        int mode3 = int(layer3Mode + 0.5);
        result = applyBlendMode(result, blendColor3, mode3);
    }

    // Layer 4
    if (layer4Enabled > 0.5) {
        vec3 blendColor4 = bloodGradient * layer4Strength;
        int mode4 = int(layer4Mode + 0.5);
        result = applyBlendMode(result, blendColor4, mode4);
    }

    finalColor = result;

    // ═══════════════════════════════════════════════════════════════════════════
    // LUNAR ECLIPSE (BLOOD MOON) EFFECT
    // ═══════════════════════════════════════════════════════════════════════════
    if (eclipseProgress > 0.001) {
        // Darken the moon (Earth's shadow)
        float darkeningFactor = 1.0 - eclipseIntensity;
        finalColor *= darkeningFactor;

        // Add emissive glow for visibility
        finalColor += bloodGradient * emissiveStrength * eclipseProgress;

        // Add bright rim glow during totality
        if (eclipseProgress > 0.7) {
            float rimIntensity = pow(gradientFactor, 2.5);
            vec3 rimGlow = brightOrange * rimIntensity * (eclipseProgress - 0.7) * 2.5;
            finalColor += rimGlow;
        }
    }

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
