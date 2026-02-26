/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Light Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Standalone light/holy material — consuming radiance overlay for mascot mesh
 * @author Emotive Engine Team
 * @module materials/LightMaterial
 *
 * ## Master Parameters
 *
 * radiance (0-1): Controls maximum consumption coverage
 *   0.0 = Faint edge glow | 0.5 = Partial consumption | 1.0 = Near-total engulfment
 *
 * progress (0-1): Gesture progress drives the SPREAD of light over time
 *   0.0 = Light just beginning to creep from edges
 *   1.0 = Full radiance-dependent consumption achieved
 *
 * Consuming light: divine radiance creeps from the silhouette edges inward using
 * multi-scale FBM noise on object-space position. Fine tendrils of light reach ahead
 * of the main consumption front. A thin white-hot emission rim marks the boundary
 * where light meets normal surface. Consumed areas are brilliant golden-white.
 *
 * This is the LIGHT counterpart to VoidMaterial's consuming darkness.
 */

import * as THREE from 'three';

function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Create a light material with consuming radiance effect
 *
 * @param {Object} options
 * @param {number} [options.radiance=0.5] - Max consumption coverage (0=faint, 1=near-total)
 * @param {number} [options.opacity=0.8] - Base opacity
 * @returns {THREE.ShaderMaterial}
 */
export function createLightMaterial(options = {}) {
    const { radiance = 0.5, opacity = 0.8 } = options;

    const pulseSpeed = lerp(0.8, 2.0, radiance);

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uRadiance: { value: radiance },
            uProgress: { value: 0 },
            uPulseSpeed: { value: pulseSpeed },
            uOpacity: { value: opacity },
            uTime: { value: 0 },
        },

        vertexShader: /* glsl */ `
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

        fragmentShader: /* glsl */ `
            uniform float uRadiance;
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

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewPosition);
                float NdotV = abs(dot(normal, viewDir));
                float edgeness = 1.0 - NdotV;

                // ═══ CONSUMPTION FIELD ═══
                // Object-space position projected to 2D for consistent pattern
                vec2 pos = vPosition.xz * 2.5 + vec2(vPosition.y * 0.8, -vPosition.y * 0.6);

                // 3-octave FBM — organic creeping consumption boundary
                float n1 = noise(pos * 1.5 + uTime * 0.10);         // Large-scale (slow drift)
                float n2 = noise(pos * 4.0 - uTime * 0.15);         // Medium (counter-drift)
                float n3 = noise(pos * 9.0 + uTime * 0.22);         // Fine detail (faster)
                float consumeField = n1 * 0.50 + n2 * 0.30 + n3 * 0.20;

                // Fresnel bias: light creeps from silhouette edges inward
                consumeField += edgeness * 0.20;

                // ═══ DISSOLVE IN ═══
                // Slow ease-in over first 40% — light fades in gently, not a sudden flash.
                // Squared smoothstep gives a soft-start curve (slow at first, then accelerates).
                float rawDissolve = smoothstep(0.0, 0.40, uProgress);
                float dissolveIn = rawDissolve * rawDissolve;

                // ═══ PROGRESS-DRIVEN THRESHOLD ═══
                // Progress ramps the consumption from nothing → full radiance-dependent coverage.
                // Wider ramp (0.05 to 1.0) with squared easing so coverage builds gradually —
                // tendrils appear first, full consumption comes later.
                float rawRamp = smoothstep(0.05, 1.0, uProgress);
                float progressRamp = rawRamp * rawRamp;

                // At progress=0: threshold=0.95 (nearly nothing consumed)
                // At progress=1: threshold based on radiance (0.85 at low, 0.15 at high)
                float targetThreshold = mix(0.85, 0.15, uRadiance);
                float threshold = mix(0.95, targetThreshold, progressRamp);

                // Sharp consumption boundary
                float consumed = smoothstep(threshold, threshold - 0.05, consumeField);

                // ═══ TENDRILS ═══
                // Fine light tendrils reaching AHEAD of the main consumption front
                float tendrilField = noise(pos * 8.0 + uTime * 0.25) * 0.6
                                   + noise(pos * 14.0 - uTime * 0.16) * 0.4;
                float tendrilThreshold = threshold + 0.10;
                float tendrils = smoothstep(tendrilThreshold, tendrilThreshold - 0.03,
                                            tendrilField + edgeness * 0.12);
                tendrils *= 0.4 * smoothstep(0.0, 0.4, uRadiance * progressRamp);

                float lightMask = max(consumed, tendrils);

                // ═══ LIGHT COLOR ═══
                // Golden-white divine light — warm, not clinical white
                vec3 baseLight = vec3(1.0, 0.90, 0.55);

                // Consumed areas: rich golden light with subtle noise variation
                float colorNoise = noise(pos * 3.0 + uTime * 0.2);
                // Shift toward pure white in the brightest consumed areas
                vec3 consumedColor = mix(baseLight, vec3(1.0, 0.97, 0.88), consumed * 0.6);
                // Subtle internal variation — flowing divine energy, not flat
                consumedColor *= 0.85 + colorNoise * 0.15;

                // Scale brightness with radiance
                consumedColor *= mix(0.6, 1.2, uRadiance);

                // ═══ EDGE EMISSION ═══
                // Hot white rim where light meets normal surface
                float edgeBand = smoothstep(threshold - 0.05, threshold - 0.01, consumeField)
                               * smoothstep(threshold + 0.03, threshold, consumeField);

                // Breathing pulse
                float pulse = 0.85 + 0.15 * sin(uTime * uPulseSpeed);
                edgeBand *= pulse;

                // White-hot edge (brightest point of the consuming front)
                // Tied to dissolveIn AND uOpacity so edge dims during fade-out
                vec3 color = consumedColor * lightMask;
                color += vec3(1.0, 0.95, 0.80) * edgeBand * uRadiance * 2.5 * dissolveIn * uOpacity;

                // ═══ FRESNEL RIM ═══
                // Subtle edge glow even before consumption — light begins at the edges
                float fresnelGlow = pow(edgeness, 3.0) * uRadiance * progressRamp * 0.3;
                color += baseLight * fresnelGlow;

                // ═══ ALPHA ═══
                float alpha = lightMask * uOpacity * dissolveIn;

                // Edge emission — scaled by dissolveIn AND uOpacity for smooth retreat
                float edgeAlpha = edgeBand * uRadiance * 0.6 * dissolveIn * dissolveIn * uOpacity;
                alpha = max(alpha, edgeAlpha);

                // Fresnel rim alpha — also respects uOpacity
                alpha = max(alpha, fresnelGlow * dissolveIn * uOpacity);

                if (alpha < 0.01) discard;

                gl_FragColor = vec4(color, alpha);
            }
        `,

        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
    });

    material.userData.radiance = radiance;
    material.userData.elementalType = 'light';

    return material;
}

/**
 * Update light material animation
 */
export function updateLightMaterial(material, deltaTime) {
    if (material?.uniforms?.uTime) {
        material.uniforms.uTime.value += deltaTime;
    }
}

/**
 * Get physics configuration for light element
 */
export function getLightPhysics(radiance = 0.5) {
    return {
        gravity: lerp(0.5, -0.2, radiance),
        drag: lerp(0.1, 0.3, radiance),
        bounce: 0.0,
        disperseOverTime: true,
        lifetime: lerp(1.5, 3.0, radiance),
        emitLight: true,
        lightIntensity: radiance,
        purifyNearby: radiance > 0.6,
    };
}

export function getLightCrackStyle(radiance = 0.5) {
    const warmth = lerp(0.9, 1.0, radiance);
    const r = Math.round(warmth * 255);
    const g = Math.round(lerp(0.85, 0.95, radiance) * 255);
    const b = Math.round(lerp(0.6, 0.8, radiance) * 255);
    const hex = (r << 16) | (g << 8) | b;

    return {
        color: hex,
        emissive: lerp(1.5, 4.0, radiance),
        animated: true,
        pattern: 'radiant',
        flickerSpeed: lerp(0.5, 1.5, radiance),
    };
}

export default {
    createLightMaterial,
    updateLightMaterial,
    getLightPhysics,
    getLightCrackStyle,
};
