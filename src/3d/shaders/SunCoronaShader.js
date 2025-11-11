/**
 * Sun Corona Shader - Volumetric Corona Rays
 *
 * Creates realistic solar corona with:
 * - Volumetric light rays emanating from sun surface
 * - Layered corona (inner/outer corona)
 * - Emotion-responsive intensity and color
 * - Animated plasma flow
 *
 * Based on techniques from:
 * - GPU Gems 3: Volumetric Light Scattering as Post-Process
 * - Sebastian Hillaire: Physically Based Sky/Atmosphere Rendering
 *
 * References:
 * - NASA SDO Corona observations
 * - Solar corona temperature: 1-2 million K (vs 5,772K photosphere)
 * - Corona extends millions of kilometers from sun surface
 */

import * as THREE from 'three';

/**
 * Sun Corona Vertex Shader
 * Handles vertex transformation and passes UV coordinates
 */
const coronaVertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

/**
 * Sun Corona Fragment Shader
 * Creates volumetric corona glow with rays
 */
const coronaFragmentShader = `
    uniform vec3 glowColor;
    uniform float glowIntensity;
    uniform float time;
    uniform float coronaSize;
    uniform float rayIntensity;
    uniform int numRays;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    // Simple noise function for plasma animation
    float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    // Fractal noise for corona detail
    float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;

        for(int i = 0; i < 4; i++) {
            value += amplitude * noise(p * frequency);
            frequency *= 2.0;
            amplitude *= 0.5;
        }

        return value;
    }

    void main() {
        // Distance from center (0 at center, 1 at edge)
        vec2 center = vec2(0.5, 0.5);
        float dist = length(vUv - center) * 2.0;

        // Create corona glow falloff
        float coronaGlow = 1.0 - smoothstep(0.0, coronaSize, dist);
        coronaGlow = pow(coronaGlow, 2.0); // Sharper falloff

        // Create radial rays
        vec2 toCenter = normalize(vUv - center);
        float angle = atan(toCenter.y, toCenter.x);

        // Ray pattern
        float rayPattern = 0.0;
        for(int i = 0; i < 12; i++) {
            float rayAngle = float(i) * 3.14159265 * 2.0 / float(numRays);
            float angleDiff = abs(angle - rayAngle);
            angleDiff = min(angleDiff, 6.28318530 - angleDiff); // Wrap around

            // Ray intensity falls off with angle and distance
            float ray = exp(-angleDiff * 20.0) * (1.0 - dist);
            rayPattern += ray;
        }

        // Animate rays with time
        float animatedRays = rayPattern * (0.8 + 0.2 * sin(time * 0.5 + dist * 5.0));

        // Add plasma noise for dynamic corona
        vec2 noiseCoord = vUv * 3.0 + vec2(time * 0.1, time * 0.05);
        float plasmaNoise = fbm(noiseCoord) * 0.3;

        // Combine effects
        float finalGlow = coronaGlow + (animatedRays * rayIntensity) + plasmaNoise;
        finalGlow *= glowIntensity;

        // Apply color with HDR brightness
        vec3 finalColor = glowColor * finalGlow;

        // Output with alpha based on glow intensity
        gl_FragColor = vec4(finalColor, finalGlow * 0.5);
    }
`;

/**
 * Create Sun Corona Material
 *
 * @param {Object} options - Corona configuration
 * @param {THREE.Color} options.glowColor - Corona color (emotion-based)
 * @param {number} options.glowIntensity - Overall glow intensity
 * @param {number} options.coronaSize - Corona spread (default: 1.5)
 * @param {number} options.rayIntensity - Ray brightness (default: 0.5)
 * @param {number} options.numRays - Number of rays (default: 12)
 * @returns {THREE.ShaderMaterial}
 */
export function createSunCoronaMaterial(options = {}) {
    const {
        glowColor = new THREE.Color(1.0, 0.98, 0.95),
        glowIntensity = 1.0,
        coronaSize = 1.5,
        rayIntensity = 0.5,
        numRays = 12
    } = options;

    return new THREE.ShaderMaterial({
        uniforms: {
            glowColor: { value: glowColor },
            glowIntensity: { value: glowIntensity },
            time: { value: 0.0 },
            coronaSize: { value: coronaSize },
            rayIntensity: { value: rayIntensity },
            numRays: { value: numRays }
        },
        vertexShader: coronaVertexShader,
        fragmentShader: coronaFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending, // Additive for glow effect
        side: THREE.FrontSide,
        depthWrite: false,
        toneMapped: false // Preserve HDR values
    });
}

/**
 * Update Corona Material with new values
 *
 * @param {THREE.ShaderMaterial} material - Corona material to update
 * @param {number} deltaTime - Time delta for animation
 * @param {Object} updates - Properties to update
 */
export function updateCoronaMaterial(material, deltaTime, updates = {}) {
    if (!material || !material.uniforms) return;

    // Update time for animation
    material.uniforms.time.value += deltaTime * 0.001;

    // Update color if provided
    if (updates.glowColor) {
        material.uniforms.glowColor.value.copy(updates.glowColor);
    }

    // Update intensity
    if (updates.glowIntensity !== undefined) {
        material.uniforms.glowIntensity.value = updates.glowIntensity;
    }

    // Update corona size
    if (updates.coronaSize !== undefined) {
        material.uniforms.coronaSize.value = updates.coronaSize;
    }

    // Update ray intensity
    if (updates.rayIntensity !== undefined) {
        material.uniforms.rayIntensity.value = updates.rayIntensity;
    }
}

/**
 * Create Sun Corona Mesh
 *
 * Creates a larger sphere around the sun for corona effect
 *
 * @param {number} sunRadius - Base sun radius
 * @param {Object} options - Corona material options
 * @returns {THREE.Mesh}
 */
export function createSunCorona(sunRadius = 0.5, options = {}) {
    // Corona is 2-3x larger than sun surface
    const coronaRadius = sunRadius * 2.5;

    const geometry = new THREE.SphereGeometry(
        coronaRadius,
        64, // High detail for smooth rays
        64
    );

    const material = createSunCoronaMaterial(options);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'sunCorona';

    // Corona doesn't cast or receive shadows
    mesh.castShadow = false;
    mesh.receiveShadow = false;

    return mesh;
}
