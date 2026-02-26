/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Fire Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Consuming fire overlay for mascot mesh
 * @author Emotive Engine Team
 * @module materials/FireMaterial
 *
 * ## Master Parameters
 *
 * temperature (0-1): Controls maximum consumption coverage and color
 *   0.0 = Deep red smoldering embers | 0.5 = Orange flickering fire | 1.0 = White-blue plasma
 *
 * progress (0-1): Gesture progress drives the SPREAD of fire over time
 *   0.0 = Flames just beginning to lick from below
 *   1.0 = Full temperature-dependent consumption achieved
 *
 * Consuming fire: flames creep upward from below using multi-scale FBM noise on
 * object-space position. Fine tendrils of flame reach ahead of the main consumption
 * front. A thin white-hot emission rim marks the burning boundary. Consumed areas
 * glow with temperature-dependent color (red → orange → yellow-white → blue-white).
 */

import * as THREE from 'three';

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function lerp3(low, mid, high, t) {
    if (t < 0.5) {
        return low + (mid - low) * (t * 2);
    }
    return mid + (high - mid) * ((t - 0.5) * 2);
}

/**
 * Create a fire material with consuming flame effect
 *
 * @param {Object} options
 * @param {number} [options.temperature=0.5] - Max consumption coverage and color (0=embers, 1=plasma)
 * @param {number} [options.opacity=0.6] - Base opacity
 * @returns {THREE.ShaderMaterial}
 */
export function createFireMaterial(options = {}) {
    const { temperature = 0.5, opacity = 0.6 } = options;

    const pulseSpeed = lerp(1.0, 3.0, temperature);

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTemperature: { value: temperature },
            uProgress: { value: 0 },
            uPulseSpeed: { value: pulseSpeed },
            uOpacity: { value: opacity },
            uTime: { value: 0 },
        },

        vertexShader: /* glsl */ `
            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            varying float vVerticalPos;

            void main() {
                vPosition = position;
                vNormal = normalMatrix * normal;
                vVerticalPos = position.y;

                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;

                gl_Position = projectionMatrix * mvPosition;
            }
        `,

        fragmentShader: /* glsl */ `
            uniform float uTemperature;
            uniform float uProgress;
            uniform float uPulseSpeed;
            uniform float uOpacity;
            uniform float uTime;

            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            varying float vVerticalPos;

            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
            }

            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                return mix(
                    mix(hash(i), hash(i + vec2(1, 0)), f.x),
                    mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x),
                    f.y
                );
            }

            // Temperature-driven fire color (computed in shader, no uColor uniform)
            vec3 fireColor(float t) {
                if (t < 0.3) {
                    // Deep red to orange (embers to flame)
                    return vec3(
                        0.8 + t * 0.67,
                        0.1 + t * 1.0,
                        0.0
                    );
                } else if (t < 0.7) {
                    // Orange to yellow-white
                    float lt = (t - 0.3) / 0.4;
                    return vec3(1.0, 0.4 + lt * 0.5, lt * 0.3);
                } else {
                    // Yellow-white to blue-white (plasma)
                    float lt = (t - 0.7) / 0.3;
                    return vec3(1.0 - lt * 0.2, 0.9 + lt * 0.1, 0.3 + lt * 0.7);
                }
            }

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewPosition);
                float NdotV = abs(dot(normal, viewDir));
                float edgeness = 1.0 - NdotV;

                // ═══ CONSUMPTION FIELD ═══
                // Object-space position projected to 2D for consistent pattern
                vec2 pos = vPosition.xz * 2.5 + vec2(vPosition.y * 0.8, -vPosition.y * 0.6);

                // 3-octave FBM — organic creeping consumption boundary
                float n1 = noise(pos * 1.5 + uTime * 0.12);
                float n2 = noise(pos * 4.0 - uTime * 0.18);
                float n3 = noise(pos * 9.0 + uTime * 0.28);
                float consumeField = n1 * 0.50 + n2 * 0.30 + n3 * 0.20;

                // Fresnel bias: flames creep from silhouette edges
                consumeField += edgeness * 0.15;

                // Upward bias: flames lick from below — bottom consumes first
                float vertBias = smoothstep(0.5, -0.5, vVerticalPos) * 0.25;
                consumeField += vertBias;

                // ═══ DISSOLVE IN ═══
                float rawDissolve = smoothstep(0.0, 0.30, uProgress);
                float dissolveIn = rawDissolve * rawDissolve;

                // ═══ PROGRESS-DRIVEN THRESHOLD ═══
                float rawRamp = smoothstep(0.05, 0.85, uProgress);
                float progressRamp = rawRamp * rawRamp;

                float targetThreshold = mix(0.85, 0.15, uTemperature);
                float threshold = mix(0.95, targetThreshold, progressRamp);

                float consumed = smoothstep(threshold, threshold - 0.05, consumeField);

                // ═══ TENDRILS ═══
                // Fine flame tendrils reaching AHEAD of the main consumption front
                float tendrilField = noise(pos * 8.0 + uTime * 0.30) * 0.6
                                   + noise(pos * 14.0 - uTime * 0.20) * 0.4;
                float tendrilThreshold = threshold + 0.10;
                float tendrils = smoothstep(tendrilThreshold, tendrilThreshold - 0.03,
                                            tendrilField + edgeness * 0.12);
                tendrils *= 0.4 * smoothstep(0.0, 0.4, uTemperature * progressRamp);

                float fireMask = max(consumed, tendrils);

                // ═══ FIRE COLOR ═══
                vec3 baseColor = fireColor(uTemperature);

                // Internal noise variation — flowing flame texture, not flat
                float colorNoise = noise(pos * 3.0 + vec2(0.0, -uTime * 0.3));
                vec3 consumedColor = mix(baseColor, vec3(1.0, 0.95, 0.80), consumed * 0.3);
                consumedColor *= 0.70 + colorNoise * 0.15;

                // Scale brightness with temperature — kept low for additive stacking
                consumedColor *= mix(0.15, 0.35, uTemperature);

                // ═══ EDGE EMISSION ═══
                // Warm rim where fire meets normal surface
                float edgeBand = smoothstep(threshold - 0.05, threshold - 0.01, consumeField)
                               * smoothstep(threshold + 0.03, threshold, consumeField);

                float pulse = 0.85 + 0.15 * sin(uTime * uPulseSpeed);
                edgeBand *= pulse;

                vec3 color = consumedColor * fireMask;
                color += vec3(1.0, 0.85, 0.50) * edgeBand * uTemperature * 0.5 * dissolveIn * uOpacity;

                // ═══ FRESNEL RIM ═══
                float fresnelGlow = pow(edgeness, 3.0) * uTemperature * progressRamp * 0.15;
                color += baseColor * fresnelGlow * 0.3;

                // ═══ ALPHA ═══
                float alpha = fireMask * uOpacity * dissolveIn;
                float edgeAlpha = edgeBand * uTemperature * 0.3 * dissolveIn * dissolveIn * uOpacity;
                alpha = max(alpha, edgeAlpha);
                alpha = max(alpha, fresnelGlow * dissolveIn * uOpacity * 0.5);

                if (alpha < 0.01) discard;

                gl_FragColor = vec4(color, alpha);
            }
        `,

        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
    });

    material.userData.temperature = temperature;
    material.userData.elementalType = 'fire';

    return material;
}

/**
 * Update fire material animation
 */
export function updateFireMaterial(material, deltaTime) {
    if (material?.uniforms?.uTime) {
        material.uniforms.uTime.value += deltaTime;
    }
}

/**
 * Get physics configuration for fire element
 */
export function getFirePhysics(temperature = 0.5) {
    return {
        gravity: lerp3(-0.05, -0.15, -0.3, temperature),
        drag: lerp3(0.08, 0.05, 0.02, temperature),
        bounce: 0.0,
        lifetime: lerp3(2.0, 1.5, 0.8, temperature),
        fadeOut: true,
        riseSpeed: lerp3(0.5, 1.0, 2.0, temperature),
        flicker: true,
    };
}

/**
 * Get crack style for fire element
 */
export function getFireCrackStyle(temperature = 0.5) {
    // Temperature-driven color (same logic as shader fireColor)
    let r, g, b;
    if (temperature < 0.3) {
        r = 0.8 + temperature * 0.67;
        g = 0.1 + temperature * 1.0;
        b = 0.0;
    } else if (temperature < 0.7) {
        const lt = (temperature - 0.3) / 0.4;
        r = 1.0;
        g = 0.4 + lt * 0.5;
        b = lt * 0.3;
    } else {
        const lt = (temperature - 0.7) / 0.3;
        r = 1.0 - lt * 0.2;
        g = 0.9 + lt * 0.1;
        b = 0.3 + lt * 0.7;
    }
    const hex = (Math.round(r * 255) << 16) | (Math.round(g * 255) << 8) | Math.round(b * 255);

    return {
        color: hex,
        emissive: lerp3(1.0, 2.0, 4.0, temperature),
        animated: true,
        pattern: 'organic',
        flickerSpeed: lerp3(1.0, 2.0, 4.0, temperature),
    };
}

export default {
    createFireMaterial,
    updateFireMaterial,
    getFirePhysics,
    getFireCrackStyle,
};
