/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Black Hole Shader with Blend Layers
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Black hole accretion disk shader with NASA M87* physics
 * @author Emotive Engine Team
 * @module 3d/shaders/blackHoleWithBlendLayers
 *
 * Implements scientifically-accurate black hole visualization:
 * - Differential rotation (Kepler's 3rd law - inner disk rotates faster)
 * - Doppler beaming (relativistic brightness asymmetry)
 * - Radial temperature gradient (inner hot, outer cool)
 * - Turbulent flow striations (noise-based)
 * - Multiple sequential blend mode layers for appearance control
 *
 * Uses universal blend mode utilities from src/3d/shaders/utils/blendModes.js
 */

import { blendModesGLSL } from './utils/blendModes.js';

export const blackHoleWithBlendLayersVertexShader = `
/**
 * Black Hole Accretion Disk Vertex Shader
 * Passes positions for Doppler calculations and shader-based rotation
 */

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vViewPosition;  // View-space position (camera-relative)

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;

    // Calculate view-space position for Doppler beaming
    vec4 viewPos = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = viewPos.xyz;

    gl_Position = projectionMatrix * viewPos;
}
`;

export const blackHoleWithBlendLayersFragmentShader = `
/**
 * Black Hole Accretion Disk Fragment Shader
 *
 * Implements M87* Event Horizon Telescope observation features:
 * - Differential rotation (inner fast, outer slow)
 * - Doppler beaming (approaching side brighter)
 * - Temperature gradient (inner hot white/blue, outer cool red/orange)
 * - Turbulent striations (noise texture sampling)
 * - 4 blend layers for visual control
 */

uniform float time;
uniform float diskRotationSpeed;
uniform sampler2D noiseTexture;

// Visual effects
uniform float dopplerIntensity;
uniform float turbulenceStrength;

// Blend layer uniforms (4 layers)
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

// Emotion-based color shifting
uniform vec3 emotionColorTint;
uniform float emotionColorStrength;

// Base properties
uniform vec3 baseColor;
uniform float opacity;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vViewPosition;

// ═══════════════════════════════════════════════════════════════════════════
// UNIVERSAL BLEND MODES (injected from utils/blendModes.js)
// ═══════════════════════════════════════════════════════════════════════════
${blendModesGLSL}

void main() {
    // ═══════════════════════════════════════════════════════════════════════════
    // DIFFERENTIAL ROTATION (Kepler's 3rd law)
    // Inner disk rotates faster than outer - angularVelocity ∝ 1/r^1.5
    // ═══════════════════════════════════════════════════════════════════════════

    // Calculate radial distance from center (UV space: 0.5, 0.5 is center)
    vec2 centered = vUv - vec2(0.5);
    float radius = length(centered);

    // Prevent division by zero at center
    if (radius < 0.01) radius = 0.01;

    // Keplerian rotation: angular velocity ∝ 1/r^1.5
    // Normalize to disk range (inner edge = 0.0, outer edge = 1.0)
    float normalizedRadius = radius / 0.5;  // 0.5 is max radius in UV space
    float angularVelocity = diskRotationSpeed / pow(normalizedRadius, 1.5);

    // Rotate UV coordinates based on radial distance
    float angle = angularVelocity * time * 0.5;
    float cosAngle = cos(angle);
    float sinAngle = sin(angle);
    mat2 rotation = mat2(cosAngle, -sinAngle, sinAngle, cosAngle);
    vec2 rotatedUV = rotation * centered + vec2(0.5);

    // ═══════════════════════════════════════════════════════════════════════════
    // RADIAL TEMPERATURE GRADIENT
    // Inner edge: Hot white/blue (high energy accretion)
    // Outer edge: Cool red/orange (lower energy)
    // ═══════════════════════════════════════════════════════════════════════════

    // Temperature-based color (black-body radiation approximation)
    vec3 hotColor = vec3(1.0, 0.95, 0.9);     // White-blue (inner)
    vec3 warmColor = vec3(1.0, 0.7, 0.3);     // Orange (middle)
    vec3 coolColor = vec3(0.9, 0.3, 0.1);     // Red (outer)

    // Smooth temperature gradient from inner to outer
    float tempGradient = smoothstep(0.0, 1.0, normalizedRadius);
    vec3 diskColor;
    if (tempGradient < 0.5) {
        diskColor = mix(hotColor, warmColor, tempGradient * 2.0);
    } else {
        diskColor = mix(warmColor, coolColor, (tempGradient - 0.5) * 2.0);
    }

    // Apply base color tint
    diskColor *= baseColor;

    // ═══════════════════════════════════════════════════════════════════════════
    // TURBULENCE (Magnetorotational Instability simulation)
    // Flowing striations using multi-octave noise
    // ═══════════════════════════════════════════════════════════════════════════

    // Sample noise texture with animated offset for flow
    vec2 noiseUV1 = rotatedUV + vec2(time * 0.02, 0.0);
    vec2 noiseUV2 = rotatedUV * 2.0 + vec2(time * 0.03, time * 0.01);
    vec2 noiseUV3 = rotatedUV * 4.0 - vec2(time * 0.04, time * 0.02);

    // Multi-octave noise for detail
    float noise1 = texture2D(noiseTexture, noiseUV1).r;
    float noise2 = texture2D(noiseTexture, noiseUV2).r * 0.5;
    float noise3 = texture2D(noiseTexture, noiseUV3).r * 0.25;
    float turbulence = (noise1 + noise2 + noise3) / 1.75;

    // Apply turbulence to disk color (creates flowing striations)
    float turbulenceFactor = mix(1.0, turbulence, turbulenceStrength);
    diskColor *= turbulenceFactor;

    // ═══════════════════════════════════════════════════════════════════════════
    // DOPPLER BEAMING (Relativistic brightness asymmetry)
    // Approaching side (left in M87*) is brighter than receding side
    // ═══════════════════════════════════════════════════════════════════════════

    // Calculate disk rotation direction (counter-clockwise in UV space)
    vec2 rotationDirection = normalize(vec2(-centered.y, centered.x));

    // Camera direction in view space (always looking down -Z)
    vec3 cameraDir = normalize(vec3(0.0, 0.0, -1.0));

    // Project rotation direction to 3D (disk is in XY plane)
    vec3 velocity3D = normalize(vec3(rotationDirection.x, rotationDirection.y, 0.0));

    // Doppler factor: positive = approaching (brighter), negative = receding (dimmer)
    float dopplerFactor = dot(velocity3D, cameraDir);

    // Apply brightness boost to approaching side
    float dopplerBrightness = 1.0 + (dopplerFactor * dopplerIntensity);
    diskColor *= dopplerBrightness;

    // ═══════════════════════════════════════════════════════════════════════════
    // EMOTION-BASED COLOR TINTING
    // Shifts color spectrum based on emotional state
    // ═══════════════════════════════════════════════════════════════════════════

    diskColor = mix(diskColor, diskColor * emotionColorTint, emotionColorStrength);

    // Set final color before blend layers
    vec3 finalColor = clamp(diskColor, 0.0, 1.0);

    // ═══════════════════════════════════════════════════════════════════════════
    // BLEND LAYERS (Applied sequentially)
    // Photoshop-style blend modes for visual control
    // ═══════════════════════════════════════════════════════════════════════════

    // Layer 1: Base disk appearance adjustment
    if (layer1Enabled > 0.5) {
        vec3 blendColor1 = vec3(min(layer1Strength, 1.0));
        int mode1 = int(layer1Mode + 0.5);
        vec3 blended1 = clamp(applyBlendMode(finalColor, blendColor1, mode1), 0.0, 1.0);
        finalColor = clamp(blended1, 0.0, 1.0);
    }

    // Layer 2: Turbulence/detail enhancement
    if (layer2Enabled > 0.5) {
        vec3 blendColor2 = vec3(min(layer2Strength, 1.0));
        int mode2 = int(layer2Mode + 0.5);
        vec3 blended2 = clamp(applyBlendMode(finalColor, blendColor2, mode2), 0.0, 1.0);
        finalColor = clamp(blended2, 0.0, 1.0);
    }

    // Layer 3: Accretion stream highlights
    if (layer3Enabled > 0.5) {
        vec3 blendColor3 = vec3(min(layer3Strength, 1.0));
        int mode3 = int(layer3Mode + 0.5);
        vec3 blended3 = clamp(applyBlendMode(finalColor, blendColor3, mode3), 0.0, 1.0);
        finalColor = clamp(blended3, 0.0, 1.0);
    }

    // Layer 4: Atmospheric/edge effects
    if (layer4Enabled > 0.5) {
        vec3 blendColor4 = vec3(min(layer4Strength, 1.0));
        int mode4 = int(layer4Mode + 0.5);
        vec3 blended4 = clamp(applyBlendMode(finalColor, blendColor4, mode4), 0.0, 1.0);
        finalColor = clamp(blended4, 0.0, 1.0);
    }

    // Output final color with opacity
    gl_FragColor = vec4(finalColor, opacity);
}
`;

/**
 * Get black hole shader with blend layers
 * @returns {Object} Object with vertexShader and fragmentShader strings
 */
export function getBlackHoleWithBlendLayersShaders() {
    return {
        vertexShader: blackHoleWithBlendLayersVertexShader,
        fragmentShader: blackHoleWithBlendLayersFragmentShader
    };
}
