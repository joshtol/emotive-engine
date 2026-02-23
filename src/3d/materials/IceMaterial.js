/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Ice Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Consuming ice/frost overlay for mascot mesh
 * @author Emotive Engine Team
 * @module materials/IceMaterial
 *
 * ## Master Parameters
 *
 * melt (0-1): Controls maximum consumption coverage and frost appearance
 *   0.0 = Deep frozen, heavy frost | 0.5 = Standard ice | 1.0 = Barely frozen, thin ice
 *
 * progress (0-1): Gesture progress drives the SPREAD of ice over time
 *   0.0 = Frost just beginning to creep from edges
 *   1.0 = Full melt-dependent consumption achieved
 *
 * Consuming ice: frost creeps inward from silhouette edges using multi-scale FBM noise
 * on object-space position. Fine frost tendrils reach ahead of the main consumption
 * front. A thin cold emission rim marks the freezing boundary. Consumed areas show
 * darkened surface with frost patches and sharp crystalline specular highlights.
 */

import * as THREE from 'three';
import { getWaterPhysics } from './WaterMaterial.js';

function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Create an ice material with consuming frost effect
 *
 * @param {Object} options
 * @param {number} [options.melt=0.0] - Max consumption coverage (0=deep frost, 1=thin ice)
 * @param {number} [options.opacity=0.7] - Base opacity
 * @returns {THREE.ShaderMaterial}
 */
export function createIceMaterial(options = {}) {
    const {
        melt = 0.0,
        opacity = 0.7
    } = options;

    const pulseSpeed = lerp(0.6, 1.2, melt);

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uMelt: { value: melt },
            uProgress: { value: 0 },
            uPulseSpeed: { value: pulseSpeed },
            uOpacity: { value: opacity },
            uTime: { value: 0 }
        },

        vertexShader: /* glsl */`
            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec3 vViewPosition;

            void main() {
                vPosition = position;
                vNormal = normalMatrix * normal;

                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;

                gl_Position = projectionMatrix * mvPosition;
            }
        `,

        fragmentShader: /* glsl */`
            uniform float uMelt;
            uniform float uProgress;
            uniform float uPulseSpeed;
            uniform float uOpacity;
            uniform float uTime;

            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec3 vViewPosition;

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

            // 3-octave FBM for frost patches
            float fbm(vec2 p) {
                float f = 0.0;
                f += 0.50 * noise(p); p *= 2.01;
                f += 0.25 * noise(p); p *= 2.02;
                f += 0.125 * noise(p);
                return f / 0.875;
            }

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewPosition);
                float NdotV = abs(dot(normal, viewDir));
                float edgeness = 1.0 - NdotV;

                // ═══ CONSUMPTION FIELD ═══
                vec2 pos = vPosition.xz * 2.5 + vec2(vPosition.y * 0.8, -vPosition.y * 0.6);

                // Slow creeping — ice spreads deliberately
                float n1 = noise(pos * 1.5 + uTime * 0.06);
                float n2 = noise(pos * 4.0 - uTime * 0.08);
                float n3 = noise(pos * 9.0 + uTime * 0.12);
                float consumeField = n1 * 0.50 + n2 * 0.30 + n3 * 0.20;

                // Fresnel-dominant bias: ice encases from edges inward (no gravity)
                consumeField += edgeness * 0.25;

                // ═══ DISSOLVE IN ═══
                float rawDissolve = smoothstep(0.0, 0.40, uProgress);
                float dissolveIn = rawDissolve * rawDissolve;

                // ═══ PROGRESS-DRIVEN THRESHOLD ═══
                float rawRamp = smoothstep(0.05, 0.95, uProgress);
                float progressRamp = rawRamp * rawRamp;

                // Inverted from fire/water: low melt = MORE coverage
                float targetThreshold = mix(0.15, 0.85, uMelt);
                float threshold = mix(0.95, targetThreshold, progressRamp);

                float consumed = smoothstep(threshold, threshold - 0.05, consumeField);

                // ═══ FROST TENDRILS ═══
                // Crystalline feathered frost reaching ahead
                float tendrilField = noise(pos * 10.0 + uTime * 0.10) * 0.6
                                   + noise(pos * 16.0 - uTime * 0.07) * 0.4;
                float tendrilThreshold = threshold + 0.10;
                float tendrils = smoothstep(tendrilThreshold, tendrilThreshold - 0.03,
                                            tendrilField + edgeness * 0.15);
                // More tendrils when deeply frozen
                tendrils *= 0.5 * smoothstep(0.0, 0.3, (1.0 - uMelt) * progressRamp + 0.2);

                float iceMask = max(consumed, tendrils);

                // ═══ FROST PATCHES ═══
                // FBM-driven frost crystals on frozen surface — white/blue patches
                float frostNoise = fbm(pos * 4.0 + uTime * 0.02);
                float frost = smoothstep(0.35, 0.60, frostNoise);
                frost *= (1.0 - uMelt);  // Frost fades as ice melts

                // ═══ ICE DARKENING BASE ═══
                // Cold blue-black base — darkens surface with icy tint
                vec3 baseColor = vec3(0.02, 0.04, 0.10);

                // Frost brightens consumed areas with white-blue crystalline patches
                vec3 frostColor = vec3(0.4, 0.55, 0.75) * frost * 0.6;

                // ═══ SPECULAR HIGHLIGHTS ═══
                // Sharp crystalline specular — colder, bluer than water
                vec3 light1 = normalize(vec3(0.3, 1.0, 0.5));
                vec3 half1 = normalize(light1 + viewDir);
                float spec1 = pow(max(dot(normal, half1), 0.0), 160.0);

                vec3 light2 = normalize(vec3(-0.5, 0.8, -0.3));
                vec3 half2 = normalize(light2 + viewDir);
                float spec2 = pow(max(dot(normal, half2), 0.0), 128.0);

                // Cold blue-white specular
                vec3 specColor = vec3(1.6, 1.9, 2.4) * spec1
                               + vec3(1.0, 1.2, 1.6) * spec2;

                // ═══ FRESNEL REFLECTION ═══
                // Ice is very reflective at glancing angles
                float fresnel = pow(edgeness, 2.0) * progressRamp;
                vec3 fresnelColor = vec3(0.6, 0.8, 1.2) * fresnel * 0.7;

                // ═══ EDGE EMISSION ═══
                // Cold blue glow at freezing boundary
                float edgeBand = smoothstep(threshold - 0.05, threshold - 0.01, consumeField)
                               * smoothstep(threshold + 0.03, threshold, consumeField);
                float pulse = 0.90 + 0.10 * sin(uTime * uPulseSpeed);
                edgeBand *= pulse;

                // ═══ COMPOSITE ═══
                vec3 color = baseColor;
                color += frostColor * consumed;
                color += specColor * consumed;
                color += fresnelColor;
                color += vec3(0.4, 0.6, 1.0) * edgeBand * 0.5 * dissolveIn;

                // ═══ ALPHA ═══
                float alpha = iceMask * uOpacity * dissolveIn * 0.65;
                // Frost patches boost alpha slightly
                alpha += frost * consumed * uOpacity * dissolveIn * 0.15;
                // Edge band
                float edgeAlpha = edgeBand * 0.4 * dissolveIn * uOpacity;
                alpha = max(alpha, edgeAlpha);
                // Fresnel
                alpha = max(alpha, fresnel * dissolveIn * uOpacity * 0.35);

                if (alpha < 0.01) discard;

                gl_FragColor = vec4(color, alpha);
            }
        `,

        transparent: true,
        blending: THREE.NormalBlending,
        depthWrite: false,
        side: THREE.DoubleSide
    });

    material.userData.melt = melt;
    material.userData.elementalType = 'ice';

    return material;
}

/**
 * Update ice material animation
 */
export function updateIceMaterial(material, deltaTime) {
    if (material?.uniforms?.uTime) {
        material.uniforms.uTime.value += deltaTime;
    }
}

/**
 * Get physics configuration for ice element
 */
export function getIcePhysics(melt = 0.0) {
    if (melt > 0.8) {
        const waterViscosity = lerp(0.6, 0.3, (melt - 0.8) / 0.2);
        return getWaterPhysics(waterViscosity);
    }

    return {
        gravity: lerp(1.3, 1.0, melt),
        bounce: lerp(0.1, 0.4, melt),
        drag: lerp(0.01, 0.03, melt),
        shatterThreshold: lerp(0.3, 0.6, melt),
        slideOnSurface: lerp(0.9, 0.5, melt),
        brittleness: lerp(1.0, 0.3, melt),
        crackOnImpact: melt < 0.5
    };
}

/**
 * Get crack style for ice element
 */
export function getIceCrackStyle(melt = 0.0) {
    return {
        color: lerp(0xaaeeff, 0x88ddff, melt),
        emissive: lerp(0.4, 0.1, melt),
        animated: false,
        pattern: 'crystalline',
        frostEdges: melt < 0.5
    };
}

export default {
    createIceMaterial,
    updateIceMaterial,
    getIcePhysics,
    getIceCrackStyle
};
