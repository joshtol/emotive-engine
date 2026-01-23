/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Fire Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Standalone fire material with temperature-driven behavior
 * @author Emotive Engine Team
 * @module materials/FireMaterial
 *
 * ## Master Parameter: temperature (0-1)
 *
 * | Temperature | Visual                  | Example        |
 * |-------------|-------------------------|----------------|
 * | 0.0         | Deep red, smoldering    | Dying embers   |
 * | 0.5         | Orange, flickering      | Standard fire  |
 * | 1.0         | White-blue, intense     | Plasma/welding |
 *
 * ## Usage
 *
 * Standalone:
 *   const fireMesh = new THREE.Mesh(geometry, createFireMaterial({ temperature: 0.7 }));
 *
 * Shatter system:
 *   shatterSystem.shatter(mesh, dir, { elemental: 'fire', elementalParam: 0.7 });
 */

import * as THREE from 'three';

/**
 * Interpolate between values based on parameter
 * @param {number} low - Value at param=0
 * @param {number} mid - Value at param=0.5
 * @param {number} high - Value at param=1
 * @param {number} t - Parameter 0-1
 */
function lerp3(low, mid, high, t) {
    if (t < 0.5) {
        return low + (mid - low) * (t * 2);
    }
    return mid + (high - mid) * ((t - 0.5) * 2);
}

/**
 * Interpolate colors through temperature spectrum
 * @param {number} t - Temperature 0-1
 * @returns {THREE.Color}
 */
function getFireColor(t) {
    const color = new THREE.Color();

    if (t < 0.3) {
        // Deep red to orange (embers to flame)
        color.setRGB(
            0.8 + t * 0.67,           // R: 0.8 → 1.0
            0.1 + t * 1.0,            // G: 0.1 → 0.4
            0.0                        // B: 0
        );
    } else if (t < 0.7) {
        // Orange to yellow-white (flame to hot)
        const localT = (t - 0.3) / 0.4;
        color.setRGB(
            1.0,                       // R: 1.0
            0.4 + localT * 0.5,       // G: 0.4 → 0.9
            localT * 0.3              // B: 0 → 0.3
        );
    } else {
        // Yellow-white to blue-white (hot to plasma)
        const localT = (t - 0.7) / 0.3;
        color.setRGB(
            1.0 - localT * 0.2,       // R: 1.0 → 0.8
            0.9 + localT * 0.1,       // G: 0.9 → 1.0
            0.3 + localT * 0.7        // B: 0.3 → 1.0
        );
    }

    return color;
}

/**
 * Create a fire material with temperature-driven appearance
 *
 * @param {Object} options
 * @param {number} [options.temperature=0.5] - Master parameter (0=embers, 0.5=fire, 1=plasma)
 * @param {THREE.Color} [options.color] - Override color (otherwise derived from temperature)
 * @param {number} [options.intensity] - Override intensity (otherwise derived from temperature)
 * @param {number} [options.opacity=0.7] - Base opacity
 * @returns {THREE.ShaderMaterial}
 */
export function createFireMaterial(options = {}) {
    const {
        temperature = 0.5,
        color = null,
        intensity = null,
        opacity = 0.7,
        overlay = false  // When true, sparse flame visibility for overlay effect
    } = options;

    // Derive from temperature if not overridden
    const fireColor = color || getFireColor(temperature);
    const fireIntensity = intensity ?? lerp3(1.5, 3.0, 6.0, temperature);
    const flickerSpeed = lerp3(1.0, 2.0, 4.0, temperature);
    const flickerAmount = lerp3(0.15, 0.25, 0.1, temperature);  // Plasma flickers less

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: fireColor.clone() },
            uIntensity: { value: fireIntensity },
            uOpacity: { value: opacity },
            uFlickerSpeed: { value: flickerSpeed },
            uFlickerAmount: { value: flickerAmount },
            uTime: { value: 0 },
            uTemperature: { value: temperature },
            uOverlay: { value: overlay ? 1.0 : 0.0 }
        },

        vertexShader: /* glsl */`
            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec3 vViewDir;

            void main() {
                vPosition = position;
                vNormal = normalMatrix * normal;

                // View direction for fresnel
                vec4 worldPos = modelMatrix * vec4(position, 1.0);
                vViewDir = normalize(cameraPosition - worldPos.xyz);

                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,

        fragmentShader: /* glsl */`
            uniform vec3 uColor;
            uniform float uIntensity;
            uniform float uOpacity;
            uniform float uFlickerSpeed;
            uniform float uFlickerAmount;
            uniform float uTime;
            uniform float uTemperature;
            uniform float uOverlay;

            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec3 vViewDir;

            // Simple noise for flicker
            float hash(float n) {
                return fract(sin(n) * 43758.5453);
            }

            float noise(float x) {
                float i = floor(x);
                float f = fract(x);
                f = f * f * (3.0 - 2.0 * f);
                return mix(hash(i), hash(i + 1.0), f);
            }

            // 3D noise for flame patterns
            float hash3(vec3 p) {
                return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
            }

            float noise3D(vec3 p) {
                vec3 i = floor(p);
                vec3 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);

                return mix(
                    mix(mix(hash3(i), hash3(i + vec3(1,0,0)), f.x),
                        mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), f.x), f.y),
                    mix(mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), f.x),
                        mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), f.x), f.y),
                    f.z
                );
            }

            // FBM - Fractal Brownian Motion for richer flame patterns
            float fbm(vec3 p) {
                float value = 0.0;
                float amplitude = 0.5;
                float frequency = 1.0;
                // 4 octaves of noise
                for (int i = 0; i < 4; i++) {
                    value += amplitude * noise3D(p * frequency);
                    frequency *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewDir);

                // Base fire color with intensity
                vec3 fireColor = uColor * uIntensity;

                // Flicker effect - varies intensity over time
                float flicker = 1.0 - uFlickerAmount + uFlickerAmount * noise(uTime * uFlickerSpeed + vPosition.y * 3.0);

                // Hot spots toward center of geometry
                float centerGlow = 1.0 - length(vPosition) * 0.3;
                centerGlow = max(0.5, centerGlow);

                // Fresnel for rim flames
                float fresnel = 1.0 - abs(dot(normal, viewDir));
                fresnel = pow(fresnel, 2.0);

                // Combine effects
                vec3 finalColor = fireColor * flicker * centerGlow;

                // Higher temperature = more uniform glow (plasma)
                float uniformity = mix(0.7, 1.0, uTemperature);
                finalColor = mix(finalColor * 0.8, finalColor, uniformity);

                float alpha;

                if (uOverlay > 0.5) {
                    // ═══════════════════════════════════════════════════════════════
                    // OVERLAY MODE: Visible flames at edges + sparse interior sparks
                    // Simple approach: rim glow + occasional bright peaks
                    // ═══════════════════════════════════════════════════════════════

                    // Height for vertical bias (flames stronger at bottom)
                    float height = (vPosition.y + 0.5);  // 0=bottom, 1=top
                    float bottomBias = 1.0 - height * 0.6;  // 1.0 at bottom, 0.4 at top

                    // ═══════════════════════════════════════════════════════════════
                    // EDGE FLAMES - Always visible at rim (fresnel)
                    // ═══════════════════════════════════════════════════════════════
                    float edgeFlame = pow(fresnel, 2.5) * 0.7 * bottomBias;

                    // ═══════════════════════════════════════════════════════════════
                    // SPARSE FLAME SPARKS - Only at bright noise peaks
                    // ═══════════════════════════════════════════════════════════════
                    vec3 sparkPos = vPosition * 8.0 + vec3(0.0, -uTime * 2.5, 0.0);
                    float spark = noise3D(sparkPos);

                    // Only show the brightest peaks (>0.7) as flame spots
                    float flameSpark = smoothstep(0.65, 0.85, spark) * bottomBias;

                    // Add flicker variation
                    flameSpark *= (0.7 + flicker * 0.3);

                    // ═══════════════════════════════════════════════════════════════
                    // COLOR: Orange-red base, yellow at bright spots
                    // ═══════════════════════════════════════════════════════════════
                    vec3 orangeRed = vec3(1.0, 0.4, 0.05);
                    vec3 yellowBright = vec3(1.0, 0.75, 0.2);

                    float totalIntensity = edgeFlame + flameSpark * 0.8;
                    vec3 flameColor = mix(orangeRed, yellowBright, clamp(totalIntensity, 0.0, 1.0));

                    // ═══════════════════════════════════════════════════════════════
                    // ALPHA: Edge flames + sparse sparks
                    // ═══════════════════════════════════════════════════════════════
                    alpha = edgeFlame * 0.6 + flameSpark * 0.4;

                    // Moderate discard
                    if (alpha < 0.06) discard;

                    alpha = clamp(alpha, 0.0, 0.45);
                    finalColor = flameColor;
                } else {
                    // STANDALONE MODE: Full fire material
                    alpha = uOpacity;
                }

                gl_FragColor = vec4(finalColor, alpha);
            }
        `,

        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
    });

    // Store temperature for external access
    material.userData.temperature = temperature;
    material.userData.elementalType = 'fire';

    return material;
}

/**
 * Update fire material animation
 * Call this each frame for animated fire
 *
 * @param {THREE.ShaderMaterial} material - Fire material to update
 * @param {number} deltaTime - Time since last frame in seconds
 */
export function updateFireMaterial(material, deltaTime) {
    if (material?.uniforms?.uTime) {
        material.uniforms.uTime.value += deltaTime;
    }
}

/**
 * Get physics configuration for fire element
 * Used by shatter system for shard behavior
 *
 * @param {number} temperature - Temperature parameter 0-1
 * @returns {Object} Physics configuration
 */
export function getFirePhysics(temperature = 0.5) {
    return {
        gravity: lerp3(-0.05, -0.15, -0.3, temperature),  // Rises faster when hot
        drag: lerp3(0.08, 0.05, 0.02, temperature),       // Less drag when hot
        bounce: 0.0,                                       // Fire doesn't bounce
        lifetime: lerp3(2.0, 1.5, 0.8, temperature),      // Burns faster when hot
        fadeOut: true,                                     // Fades as it rises
        riseSpeed: lerp3(0.5, 1.0, 2.0, temperature),
        flicker: true
    };
}

/**
 * Get crack style for fire element
 * Used by crack system for elemental crack appearance
 *
 * @param {number} temperature - Temperature parameter 0-1
 * @returns {Object} Crack style configuration
 */
export function getFireCrackStyle(temperature = 0.5) {
    const color = getFireColor(temperature);

    return {
        color: color.getHex(),
        emissive: lerp3(1.0, 2.0, 4.0, temperature),
        animated: true,
        pattern: 'organic',
        flickerSpeed: lerp3(1.0, 2.0, 4.0, temperature)
    };
}

export default {
    createFireMaterial,
    updateFireMaterial,
    getFirePhysics,
    getFireCrackStyle
};
