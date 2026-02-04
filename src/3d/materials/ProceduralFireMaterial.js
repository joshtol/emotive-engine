/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Procedural Fire Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Advanced procedural fire shader that transforms anchor meshes into
 * realistic, volumetric-looking flames. The mesh geometry acts as an anchor/seed point,
 * while the shader generates dynamic fire that extends beyond the original bounds.
 *
 * @author Emotive Engine Team
 * @module materials/ProceduralFireMaterial
 *
 * ## Key Features
 * - Procedural noise-based flame generation (6-octave FBM)
 * - Vertex displacement for volumetric flame extension
 * - Temperature-based blackbody color ramp
 * - Soft edges via fresnel and alpha falloff
 * - Time-based animation with flicker and turbulence
 *
 * ## Master Parameter: temperature (0-1)
 *
 * | Temperature | Visual                     | Flame Style      |
 * |-------------|----------------------------|------------------|
 * | 0.0         | Deep red, smoldering       | Dying embers     |
 * | 0.3         | Orange, flickering         | Campfire         |
 * | 0.5         | Bright orange-yellow       | Standard fire    |
 * | 0.7         | Yellow-white, intense      | Hot blaze        |
 * | 1.0         | White-blue, plasma         | Welding/plasma   |
 *
 * ## Usage
 *
 * ```javascript
 * const fireMaterial = createProceduralFireMaterial({
 *     temperature: 0.6,
 *     flameHeight: 1.5,
 *     turbulence: 0.8
 * });
 * mesh.material = fireMaterial;
 *
 * // In render loop:
 * updateProceduralFireMaterial(fireMaterial, deltaTime);
 * ```
 *
 * Core fire shader logic is imported from FireShaderCore.js for consistency
 * with InstancedFireMaterial.
 */

import * as THREE from 'three';
import {
    NOISE_GLSL,
    FIRE_COLOR_GLSL,
    FIRE_FRAGMENT_CORE,
    FIRE_FLOOR_AND_DISCARD_GLSL,
    lerp3,
    deriveFireParameters,
    FIRE_DEFAULTS
} from './cores/FireShaderCore.js';

// ═══════════════════════════════════════════════════════════════════════════════════════
// VERTEX SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════

const VERTEX_SHADER = /* glsl */`
uniform float uTime;
uniform float uFlameHeight;
uniform float uTurbulence;
uniform float uDisplacementStrength;
uniform float uFadeProgress;  // Smooth 0-1 fade (no flicker) for stable geometry

varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vViewDir;
varying float vDisplacement;
varying float vVerticalGradient;

${NOISE_GLSL}

void main() {
    vPosition = position;
    vNormal = normalMatrix * normal;

    // Calculate vertical gradient (0 at bottom, 1 at top)
    // Assumes model is roughly centered, adjust based on geometry
    float modelHeight = 1.0; // Will be normalized
    vVerticalGradient = (position.y + 0.5) / modelHeight;
    vVerticalGradient = clamp(vVerticalGradient, 0.0, 1.0);

    // ═══════════════════════════════════════════════════════════════════════════════
    // VERTEX DISPLACEMENT - Expand geometry to create flame volume
    // ═══════════════════════════════════════════════════════════════════════════════

    // Use smooth fade progress for displacement (NOT flickering intensity)
    // This keeps geometry stable while brightness can flicker
    float fadeFactor = uFadeProgress;

    // Noise-based displacement along normal (very slow for realistic fire)
    vec3 noisePos = position * 3.0 + vec3(0.0, -uTime * 0.001, 0.0);
    float noiseValue = fbm3(noisePos);

    // Position-based variation for asymmetric flames
    float posVariation = snoise(position * 5.0) * 0.3 + 0.85;

    // Displacement increases toward the top (flames rise and spread)
    float heightFactor = pow(vVerticalGradient, 0.5);
    float displacement = noiseValue * uDisplacementStrength * (0.3 + heightFactor * 0.7) * posVariation * fadeFactor;

    // Add upward stretch for rising flames (scaled by fade)
    vec3 displaced = position + normal * displacement;
    displaced.y += heightFactor * uFlameHeight * (0.5 + noiseValue * 0.5) * fadeFactor;

    // Add lateral turbulence with position variation (scaled by fade)
    float turbX = snoise(noisePos + vec3(100.0, 0.0, 0.0)) * uTurbulence * heightFactor * posVariation * fadeFactor;
    float turbZ = snoise(noisePos + vec3(0.0, 0.0, 100.0)) * uTurbulence * heightFactor * posVariation * fadeFactor;
    displaced.x += turbX * 0.3;
    displaced.z += turbZ * 0.3;

    vDisplacement = displacement;

    // World position for lighting/view calculations
    vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
    vWorldPosition = worldPos.xyz;
    vViewDir = normalize(cameraPosition - worldPos.xyz);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// FRAGMENT SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════

const FRAGMENT_SHADER = /* glsl */`
uniform float uTime;
uniform float uTemperature;
uniform float uIntensity;
uniform float uOpacity;
uniform float uFlickerSpeed;
uniform float uFlickerAmount;
uniform float uNoiseScale;
uniform float uEdgeFade;
// Enhanced visual uniforms
uniform float uEdgeSoftness;
uniform float uEmberDensity;
uniform float uEmberBrightness;

varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vViewDir;
varying float vDisplacement;
varying float vVerticalGradient;

${NOISE_GLSL}
${FIRE_COLOR_GLSL}

void main() {
    // Define localTime for shared core (ProceduralFireMaterial uses uTime directly)
    float localTime = uTime;

    // Core fire fragment processing from FireShaderCore
    ${FIRE_FRAGMENT_CORE}

    // Shared floor color and discard logic from FireShaderCore
    ${FIRE_FLOOR_AND_DISCARD_GLSL}

    gl_FragColor = vec4(color, alpha);
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// MATERIAL FACTORY
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Create a procedural fire material
 *
 * @param {Object} options - Configuration options
 * @param {number} [options.temperature=0.5] - Fire temperature (0=embers, 0.5=fire, 1=plasma)
 * @param {number} [options.intensity=2.5] - Brightness multiplier (for bloom)
 * @param {number} [options.opacity=0.85] - Base opacity
 * @param {number} [options.flameHeight=0.08] - How much flames extend upward
 * @param {number} [options.turbulence=0.03] - Lateral flame wobble
 * @param {number} [options.displacementStrength=0.04] - Vertex displacement amount
 * @param {number} [options.noiseScale=4.0] - Noise detail level
 * @param {number} [options.flickerSpeed=3.0] - Flicker animation speed
 * @param {number} [options.flickerAmount=0.2] - Flicker intensity variance
 * @param {number} [options.edgeFade=0.1] - Soft edge fade distance
 * @param {number} [options.edgeSoftness=0.5] - Alpha softness at edges (0=hard, 1=soft)
 * @param {number} [options.emberDensity=0.3] - Density of spark hot spots
 * @param {number} [options.emberBrightness=0.8] - Brightness of embers
 * @returns {THREE.ShaderMaterial}
 */
export function createProceduralFireMaterial(options = {}) {
    const {
        temperature = FIRE_DEFAULTS.temperature,
        intensity = null,
        opacity = FIRE_DEFAULTS.opacity,
        flameHeight = FIRE_DEFAULTS.flameHeight,
        turbulence = FIRE_DEFAULTS.turbulence,
        displacementStrength = FIRE_DEFAULTS.displacementStrength,
        noiseScale = FIRE_DEFAULTS.noiseScale,
        flickerSpeed = null,
        flickerAmount = null,
        edgeFade = FIRE_DEFAULTS.edgeFade,
        edgeSoftness = null,
        emberDensity = null,
        emberBrightness = null
    } = options;

    // Derive temperature-dependent parameters from shared core
    const derived = deriveFireParameters(temperature, {
        intensity, flickerSpeed, flickerAmount, edgeSoftness, emberDensity, emberBrightness
    });
    const finalIntensity = derived.intensity;
    const finalFlickerSpeed = derived.flickerSpeed;
    const finalFlickerAmount = derived.flickerAmount;
    const finalEdgeSoftness = derived.edgeSoftness;
    const finalEmberDensity = derived.emberDensity;
    const finalEmberBrightness = derived.emberBrightness;

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uTemperature: { value: temperature },
            uIntensity: { value: finalIntensity },
            uFadeProgress: { value: 1.0 },  // Smooth fade for vertex displacement (no flicker)
            uOpacity: { value: opacity },
            uFlameHeight: { value: flameHeight },
            uTurbulence: { value: turbulence },
            uDisplacementStrength: { value: displacementStrength },
            uNoiseScale: { value: noiseScale },
            uFlickerSpeed: { value: finalFlickerSpeed },
            uFlickerAmount: { value: finalFlickerAmount },
            uEdgeFade: { value: edgeFade },
            // Enhanced visual uniforms
            uEdgeSoftness: { value: finalEdgeSoftness },
            uEmberDensity: { value: finalEmberDensity },
            uEmberBrightness: { value: finalEmberBrightness }
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
    });

    // Store config for external access
    material.userData.temperature = temperature;
    material.userData.elementalType = 'fire';
    material.userData.isProcedural = true;

    return material;
}

/**
 * Update procedural fire material animation
 * Call this each frame for animated fire
 *
 * @param {THREE.ShaderMaterial} material - Procedural fire material
 * @param {number} deltaTime - Time since last frame in seconds
 */
export function updateProceduralFireMaterial(material, deltaTime) {
    if (material?.uniforms?.uTime) {
        material.uniforms.uTime.value += deltaTime;
    }
}

/**
 * Set temperature on existing material
 *
 * @param {THREE.ShaderMaterial} material - Procedural fire material
 * @param {number} temperature - New temperature (0-1)
 */
export function setProceduralFireTemperature(material, temperature) {
    if (!material?.uniforms) return;

    const derived = deriveFireParameters(temperature);
    material.uniforms.uTemperature.value = temperature;
    material.uniforms.uIntensity.value = derived.intensity;
    material.uniforms.uFlickerSpeed.value = derived.flickerSpeed;
    material.uniforms.uFlickerAmount.value = derived.flickerAmount;
    material.uniforms.uEdgeSoftness.value = derived.edgeSoftness;
    material.uniforms.uEmberDensity.value = derived.emberDensity;
    material.uniforms.uEmberBrightness.value = derived.emberBrightness;
    material.userData.temperature = temperature;
}

/**
 * Set intensity multiplier (for gesture animation integration)
 *
 * @param {THREE.ShaderMaterial} material - Procedural fire material
 * @param {number} intensity - Intensity multiplier (0-1, includes flicker, for brightness)
 * @param {number} [fadeProgress=null] - Smooth fade 0-1 (no flicker, for stable geometry)
 */
export function setProceduralFireIntensity(material, intensity, fadeProgress = null) {
    if (!material?.uniforms) return;

    // Clamp intensity to small minimum to prevent rendering artifacts at zero
    const clampedIntensity = Math.max(0.01, intensity);

    const temp = material.userData.temperature || FIRE_DEFAULTS.temperature;
    const derived = deriveFireParameters(temp);
    material.uniforms.uIntensity.value = derived.intensity * clampedIntensity;

    // Set smooth fade progress for vertex displacement (no flicker jitter)
    if (fadeProgress !== null && material.uniforms.uFadeProgress) {
        material.uniforms.uFadeProgress.value = Math.max(0.01, fadeProgress);
    }
}

/**
 * Get physics configuration for procedural fire
 *
 * @param {number} temperature - Temperature parameter 0-1
 * @returns {Object} Physics configuration
 */
export function getProceduralFirePhysics(temperature = FIRE_DEFAULTS.temperature) {
    return {
        gravity: lerp3(-0.05, -0.15, -0.3, temperature),
        drag: lerp3(0.08, 0.05, 0.02, temperature),
        bounce: 0.0,
        lifetime: lerp3(2.0, 1.5, 0.8, temperature),
        fadeOut: true,
        riseSpeed: lerp3(0.5, 1.0, 2.0, temperature),
        flicker: true
    };
}

export default {
    createProceduralFireMaterial,
    updateProceduralFireMaterial,
    setProceduralFireTemperature,
    setProceduralFireIntensity,
    getProceduralFirePhysics
};
