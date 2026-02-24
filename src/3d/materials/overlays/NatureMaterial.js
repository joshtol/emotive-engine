/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Nature Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Consuming nature/growth overlay for mascot mesh
 * @author Emotive Engine Team
 * @module materials/NatureMaterial
 *
 * ## Master Parameters
 *
 * growth (0-1): Controls maximum consumption coverage and appearance
 *   0.0 = Sparse sprouts, thin creep | 0.5 = Active vines | 1.0 = Dense flourishing
 *
 * progress (0-1): Gesture progress drives the SPREAD of growth over time
 *   0.0 = Growth just beginning to creep from below
 *   1.0 = Full growth-dependent consumption achieved
 *
 * Consuming growth: organic matter creeps upward from below using multi-scale FBM noise
 * on object-space position. Fine vine tendrils reach ahead of the main growth front.
 * A warm green-gold emission rim marks the growing boundary. Consumed areas show
 * darkened, moss-covered surface with subtle dew-like specular highlights.
 */

import * as THREE from 'three';

function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Create a nature material with consuming growth effect
 *
 * @param {Object} options
 * @param {number} [options.growth=0.5] - Max consumption coverage (0=sparse, 1=flourishing)
 * @param {number} [options.opacity=0.7] - Base opacity
 * @returns {THREE.ShaderMaterial}
 */
export function createNatureMaterial(options = {}) {
    const {
        growth = 0.5,
        opacity = 0.7
    } = options;

    const pulseSpeed = lerp(1.2, 0.5, growth);

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uGrowth: { value: growth },
            uProgress: { value: 0 },
            uPulseSpeed: { value: pulseSpeed },
            uOpacity: { value: opacity },
            uTime: { value: 0 }
        },

        vertexShader: /* glsl */`
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

        fragmentShader: /* glsl */`
            uniform float uGrowth;
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

            // 3-octave FBM for moss/lichen patches
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

                float growSpeed = mix(0.08, 0.04, uGrowth);
                float n1 = noise(pos * 1.5 + uTime * growSpeed);
                float n2 = noise(pos * 4.0 - uTime * growSpeed * 1.3);
                float n3 = noise(pos * 9.0 + uTime * growSpeed * 2.0);
                float consumeField = n1 * 0.50 + n2 * 0.30 + n3 * 0.20;

                consumeField += edgeness * 0.15;

                // Upward bias: growth creeps up from below
                float vertBias = smoothstep(0.5, -0.5, vVerticalPos) * 0.25;
                consumeField += vertBias;

                // ═══ DISSOLVE IN ═══
                float rawDissolve = smoothstep(0.0, 0.35, uProgress);
                float dissolveIn = rawDissolve * rawDissolve;

                // ═══ PROGRESS-DRIVEN THRESHOLD ═══
                float rawRamp = smoothstep(0.05, 0.90, uProgress);
                float progressRamp = rawRamp * rawRamp;

                float targetThreshold = mix(0.85, 0.15, uGrowth);
                float threshold = mix(0.95, targetThreshold, progressRamp);

                float consumed = smoothstep(threshold, threshold - 0.05, consumeField);

                // ═══ VINE TENDRILS ═══
                // Vertically stretched — creeping upward like vines
                vec2 vinePos = vec2(vPosition.x * 2.0, vPosition.y * 5.0);
                float vineField = noise(vinePos * 3.0 - vec2(0.0, uTime * growSpeed * 3.0)) * 0.6
                               + noise(vinePos * 7.0 + vec2(0.0, uTime * growSpeed * 2.0)) * 0.4;
                float tendrilThreshold = threshold + 0.10;
                float tendrils = smoothstep(tendrilThreshold, tendrilThreshold - 0.03,
                                            vineField + edgeness * 0.12);
                tendrils *= 0.4 * smoothstep(0.0, 0.4, uGrowth * progressRamp + 0.3);

                float natureMask = max(consumed, tendrils);

                // ═══ ORGANIC DARKENING BASE ═══
                // Near-black with green tint — darkens surface organically
                vec3 baseColor = vec3(0.01, 0.03, 0.01);

                // ═══ MOSS/LICHEN PATCHES ═══
                // FBM-driven green-brown patches on consumed surface
                float mossNoise = fbm(pos * 5.0 + uTime * 0.015);
                float moss = smoothstep(0.30, 0.55, mossNoise);
                // Break mask — not all consumed area gets moss
                float mossBreak = noise(pos * 2.0 + 0.5);
                moss *= smoothstep(0.30, 0.55, mossBreak);
                moss *= uGrowth;  // More moss when fully grown
                vec3 mossColor = vec3(0.15, 0.25, 0.08) * moss * 0.6;

                // ═══ SPECULAR HIGHLIGHTS ═══
                // Dew-like organic sheen — softer than water's sharp gloss
                vec3 light1 = normalize(vec3(0.3, 1.0, 0.5));
                vec3 half1 = normalize(light1 + viewDir);
                float spec1 = pow(max(dot(normal, half1), 0.0), 80.0);

                vec3 light2 = normalize(vec3(-0.6, 0.7, -0.4));
                vec3 half2 = normalize(light2 + viewDir);
                float spec2 = pow(max(dot(normal, half2), 0.0), 64.0);

                // Green-white dew highlights — less intense than water
                vec3 specColor = vec3(1.4, 1.8, 1.2) * spec1
                               + vec3(0.8, 1.1, 0.7) * spec2;

                // ═══ FRESNEL REFLECTION ═══
                // Faint green sheen at glancing angles
                float fresnel = pow(edgeness, 2.0) * progressRamp;
                vec3 fresnelColor = vec3(0.4, 0.7, 0.3) * fresnel * 0.6;

                // ═══ EDGE EMISSION ═══
                // Green-gold glow at growth boundary
                float edgeBand = smoothstep(threshold - 0.05, threshold - 0.01, consumeField)
                               * smoothstep(threshold + 0.03, threshold, consumeField);
                float pulse = 0.85 + 0.15 * sin(uTime * uPulseSpeed);
                edgeBand *= pulse;

                // ═══ COMPOSITE ═══
                vec3 color = baseColor;
                color += mossColor * consumed;
                color += specColor * consumed;
                color += fresnelColor;
                color += vec3(0.4, 0.7, 0.2) * edgeBand * 0.6 * dissolveIn;

                // ═══ ALPHA ═══
                float alpha = natureMask * uOpacity * dissolveIn * 0.65;
                // Moss patches boost alpha slightly
                alpha += moss * consumed * uOpacity * dissolveIn * 0.15;
                float edgeAlpha = edgeBand * 0.45 * dissolveIn * uOpacity;
                alpha = max(alpha, edgeAlpha);
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

    material.userData.growth = growth;
    material.userData.elementalType = 'nature';

    return material;
}

/**
 * Update nature material animation
 */
export function updateNatureMaterial(material, deltaTime) {
    if (material?.uniforms?.uTime) {
        material.uniforms.uTime.value += deltaTime;
    }
}

/**
 * Get physics configuration for nature element
 */
export function getNaturePhysics(growth = 0.5) {
    return {
        gravity: lerp(0.8, 0.5, growth),
        drag: lerp(0.2, 0.4, growth),
        bounce: 0.1,
        rootsTarget: growth > 0.3,
        entangles: growth > 0.5,
        spreadRate: lerp(0.0, 0.2, growth),
        lifetime: lerp(2.0, 5.0, growth),
        healsOverTime: growth > 0.6
    };
}

export function getNatureCrackStyle(growth = 0.5) {
    const r = Math.round(lerp(0.2, 0.3, growth) * 255);
    const g = Math.round(lerp(0.5, 0.7, growth) * 255);
    const b = Math.round(lerp(0.15, 0.2, growth) * 255);
    const hex = (r << 16) | (g << 8) | b;

    return {
        color: hex,
        emissive: lerp(0.3, 1.2, growth),
        animated: true,
        pattern: 'vine',
        flickerSpeed: lerp(0.3, 0.8, growth)
    };
}

export default {
    createNatureMaterial,
    updateNatureMaterial,
    getNaturePhysics,
    getNatureCrackStyle
};
