/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Water Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Consuming water overlay for mascot mesh
 * @author Emotive Engine Team
 * @module materials/WaterMaterial
 *
 * ## Master Parameters
 *
 * viscosity (0-1): Controls maximum consumption coverage and appearance
 *   0.0 = Thin, fast-flowing water | 0.5 = Standard water | 1.0 = Thick, sluggish fluid
 *
 * progress (0-1): Gesture progress drives the SPREAD of water over time
 *   0.0 = Water just beginning to seep from above
 *   1.0 = Full viscosity-dependent consumption achieved
 *
 * Additive water overlay: fluid creeps downward from above using multi-scale FBM
 * noise on object-space position. Fine tendrils drip ahead of the consumption front.
 * A bright caustic rim marks the wet boundary. Consumed areas show specular
 * highlights, caustic shimmer, and fresnel reflections — purely additive, never
 * darkening the underlying mascot. Works on all geometry types (moon, sun, crystal).
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
 * Create a water material with consuming fluid effect
 *
 * @param {Object} options
 * @param {number} [options.viscosity=0.3] - Max consumption coverage and appearance (0=thin, 1=thick)
 * @param {number} [options.opacity=0.7] - Base opacity
 * @returns {THREE.ShaderMaterial}
 */
export function createWaterMaterial(options = {}) {
    const { viscosity = 0.3, opacity = 0.7 } = options;

    const pulseSpeed = lerp(1.5, 0.6, viscosity);

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uViscosity: { value: viscosity },
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
            uniform float uViscosity;
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

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewPosition);
                float NdotV = abs(dot(normal, viewDir));
                float edgeness = 1.0 - NdotV;

                // ═══ CONSUMPTION FIELD ═══
                vec2 pos = vPosition.xz * 2.5 + vec2(vPosition.y * 0.8, -vPosition.y * 0.6);

                float flowSpeed = mix(0.15, 0.06, uViscosity);
                float n1 = noise(pos * 1.5 + uTime * flowSpeed);
                float n2 = noise(pos * 4.0 - uTime * flowSpeed * 1.3);
                float n3 = noise(pos * 9.0 + uTime * flowSpeed * 2.0);
                float consumeField = n1 * 0.50 + n2 * 0.30 + n3 * 0.20;

                consumeField += edgeness * 0.15;

                // Downward bias: water runs down from top
                float vertBias = smoothstep(-0.5, 0.5, vVerticalPos) * 0.25;
                consumeField += vertBias;

                // ═══ DISSOLVE IN ═══
                float rawDissolve = smoothstep(0.0, 0.35, uProgress);
                float dissolveIn = rawDissolve * rawDissolve;

                // ═══ PROGRESS-DRIVEN THRESHOLD ═══
                float rawRamp = smoothstep(0.05, 0.90, uProgress);
                float progressRamp = rawRamp * rawRamp;

                float targetThreshold = mix(0.85, 0.15, uViscosity);
                float threshold = mix(0.95, targetThreshold, progressRamp);

                float consumed = smoothstep(threshold, threshold - 0.05, consumeField);

                // ═══ DRIP TENDRILS ═══
                vec2 dripPos = vec2(vPosition.x * 2.0, vPosition.y * 6.0);
                float dripField = noise(dripPos * 3.0 + vec2(0.0, uTime * flowSpeed * 3.0)) * 0.6
                                + noise(dripPos * 7.0 - vec2(0.0, uTime * flowSpeed * 2.0)) * 0.4;
                float tendrilThreshold = threshold + 0.10;
                float tendrils = smoothstep(tendrilThreshold, tendrilThreshold - 0.03,
                                            dripField + edgeness * 0.12);
                tendrils *= 0.4 * smoothstep(0.0, 0.4, uViscosity * progressRamp + 0.3);

                float waterMask = max(consumed, tendrils);

                // ═══ SPECULAR HIGHLIGHTS ═══
                // Glossy wet reflections — the primary visual cue for water
                vec3 light1 = normalize(vec3(0.3, 1.0, 0.5));
                vec3 half1 = normalize(light1 + viewDir);
                float spec1 = pow(max(dot(normal, half1), 0.0), 128.0);

                vec3 light2 = normalize(vec3(-0.6, 0.7, -0.4));
                vec3 half2 = normalize(light2 + viewDir);
                float spec2 = pow(max(dot(normal, half2), 0.0), 96.0);

                vec3 specColor = vec3(0.7, 0.85, 1.0) * spec1 * 1.8
                               + vec3(0.5, 0.7, 1.0) * spec2;

                // ═══ CAUSTIC SHIMMER ═══
                float c1 = noise(pos * 6.0 + vec2(uTime * 0.18, -uTime * 0.12));
                float c2 = noise(pos * 11.0 - vec2(uTime * 0.10, uTime * 0.14));
                float c3 = noise(pos * 2.5 + uTime * 0.05);
                float caustic = c1 * c2;
                caustic *= smoothstep(0.35, 0.65, c3);
                caustic = smoothstep(0.32, 0.48, caustic);
                vec3 causticColor = vec3(0.4, 0.6, 1.0) * caustic * 0.6;

                // ═══ FRESNEL RIM ═══
                float fresnel = pow(edgeness, 2.0) * progressRamp;
                vec3 fresnelColor = vec3(0.3, 0.5, 0.8) * fresnel * 0.7;

                // ═══ EDGE EMISSION ═══
                float edgeBand = smoothstep(threshold - 0.05, threshold - 0.01, consumeField)
                               * smoothstep(threshold + 0.03, threshold, consumeField);
                float pulse = 0.85 + 0.15 * sin(uTime * uPulseSpeed);
                edgeBand *= pulse;

                // ═══ COMPOSITE — ADDITIVE ONLY ═══
                // All effects ADD light. No dark base. Impossible to blackout any mascot.
                vec3 color = vec3(0.0);
                color += specColor * consumed;
                color += causticColor * consumed;
                color += fresnelColor;
                color += vec3(0.3, 0.5, 0.8) * edgeBand * 0.6 * dissolveIn;

                // Subtle blue tint wash in consumed areas (very faint additive glow)
                color += vec3(0.02, 0.05, 0.10) * consumed * dissolveIn;

                // ═══ ALPHA ═══
                // With AdditiveBlending: result = src * alpha + dst
                // Alpha controls brightness of added light, NOT background darkening
                float alpha = waterMask * uOpacity * dissolveIn;
                float edgeAlpha = edgeBand * 0.5 * dissolveIn * uOpacity;
                alpha = max(alpha, edgeAlpha);
                alpha = max(alpha, fresnel * dissolveIn * uOpacity * 0.5);

                if (alpha < 0.05) discard;

                gl_FragColor = vec4(color, alpha);
            }
        `,

        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
    });

    material.userData.viscosity = viscosity;
    material.userData.elementalType = 'water';

    return material;
}

/**
 * Update water material animation
 */
export function updateWaterMaterial(material, deltaTime) {
    if (material?.uniforms?.uTime) {
        material.uniforms.uTime.value += deltaTime;
    }
}

/**
 * Get physics configuration for water element
 */
export function getWaterPhysics(viscosity = 0.3) {
    return {
        gravity: lerp(1.0, 0.5, viscosity),
        bounce: lerp(0.7, 0.2, viscosity),
        drag: lerp(0.01, 0.2, viscosity),
        cohesion: lerp3(0.8, 0.2, 0.7, viscosity),
        spreadOnImpact: lerp(0.3, 0.1, viscosity),
        surfaceTension: lerp3(0.9, 0.3, 0.6, viscosity),
        wobbleOnMove: true,
        mergeOnContact: viscosity < 0.6,
    };
}

/**
 * Get crack style for water element
 */
export function getWaterCrackStyle(viscosity = 0.3) {
    let color;
    if (viscosity < 0.15) {
        color = 0xaaddff;
    } else if (viscosity < 0.6) {
        color = 0x4488ff;
    } else {
        color = 0x88ffaa;
    }

    return {
        color,
        emissive: lerp(0.3, 0.05, viscosity),
        animated: viscosity < 0.5,
        pattern: viscosity > 0.7 ? 'crystalline' : 'organic',
    };
}

export default {
    createWaterMaterial,
    updateWaterMaterial,
    getWaterPhysics,
    getWaterCrackStyle,
};
