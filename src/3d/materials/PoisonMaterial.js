/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Poison Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Standalone poison/acid material with toxic drip effects
 * @author Emotive Engine Team
 * @module materials/PoisonMaterial
 *
 * ## Master Parameter: toxicity (0-1)
 *
 * | Toxicity | Visual                    | Effect              | Example       |
 * |----------|---------------------------|---------------------|---------------|
 * | 0.0      | Light green tint          | Mild irritation     | Mild venom    |
 * | 0.5      | Bubbling acid, drips      | Active corrosion    | Acid splash   |
 * | 1.0      | Violent bubbling, melting | Rapid dissolution   | Pure acid     |
 *
 * Poison features sickly green colors, bubbling effects, and dripping animation.
 */

import * as THREE from 'three';

function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Create a poison material with toxicity-driven appearance
 *
 * @param {Object} options
 * @param {number} [options.toxicity=0.5] - Master parameter (0=mild, 0.5=corrosive, 1=deadly)
 * @param {number} [options.opacity=0.85] - Base opacity
 * @returns {THREE.ShaderMaterial}
 */
export function createPoisonMaterial(options = {}) {
    const {
        toxicity = 0.5,
        opacity = 0.85
    } = options;

    // Derive properties from toxicity
    const bubbleCount = Math.floor(lerp(5, 30, toxicity));
    const bubbleSpeed = lerp(0.5, 2.0, toxicity);
    const dripSpeed = lerp(0.3, 1.5, toxicity);
    const corrosionStrength = lerp(0.1, 0.6, toxicity);
    const glowIntensity = lerp(0.2, 0.8, toxicity);

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uToxicity: { value: toxicity },
            uBubbleCount: { value: bubbleCount },
            uBubbleSpeed: { value: bubbleSpeed },
            uDripSpeed: { value: dripSpeed },
            uCorrosionStrength: { value: corrosionStrength },
            uGlowIntensity: { value: glowIntensity },
            uOpacity: { value: opacity },
            uTime: { value: 0 }
        },

        vertexShader: /* glsl */`
            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            varying vec2 vUv;

            void main() {
                vPosition = position;
                vNormal = normalMatrix * normal;
                vUv = uv;

                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;

                gl_Position = projectionMatrix * mvPosition;
            }
        `,

        fragmentShader: /* glsl */`
            uniform float uToxicity;
            uniform float uBubbleCount;
            uniform float uBubbleSpeed;
            uniform float uDripSpeed;
            uniform float uCorrosionStrength;
            uniform float uGlowIntensity;
            uniform float uOpacity;
            uniform float uTime;

            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            varying vec2 vUv;

            // Hash
            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
            }

            // Noise
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

            // FBM for organic patterns
            float fbm(vec2 p) {
                float value = 0.0;
                float amp = 0.5;
                for (int i = 0; i < 4; i++) {
                    value += amp * noise(p);
                    p *= 2.0;
                    amp *= 0.5;
                }
                return value;
            }

            // Bubbles
            float bubbles(vec2 uv, float count, float time) {
                float bubblePattern = 0.0;
                for (float i = 0.0; i < 30.0; i++) {
                    if (i >= count) break;

                    vec2 bubblePos = vec2(
                        hash(vec2(i * 17.3, 0.0)),
                        fract(hash(vec2(0.0, i * 23.7)) + time * uBubbleSpeed * (0.5 + hash(vec2(i, i)) * 0.5))
                    );

                    float bubbleSize = 0.02 + hash(vec2(i * 7.1, i * 3.3)) * 0.03;
                    float dist = length(uv - bubblePos);
                    float bubble = smoothstep(bubbleSize, bubbleSize * 0.3, dist);

                    bubblePattern += bubble * (0.5 + hash(vec2(i, 0.0)) * 0.5);
                }
                return min(bubblePattern, 1.0);
            }

            // Drip pattern
            float drips(vec2 uv, float time) {
                float dripPattern = 0.0;

                for (float i = 0.0; i < 8.0; i++) {
                    float xPos = hash(vec2(i * 13.7, 0.0));
                    float speed = 0.3 + hash(vec2(i, i * 2.0)) * 0.4;
                    float yPos = fract(time * speed * uDripSpeed + hash(vec2(0.0, i * 19.3)));

                    // Drip shape - elongated teardrop
                    vec2 dripCenter = vec2(xPos, 1.0 - yPos);
                    vec2 diff = uv - dripCenter;
                    diff.y *= 0.3; // Elongate vertically

                    float dist = length(diff);
                    float drip = smoothstep(0.04, 0.01, dist);

                    // Trail behind drip
                    if (uv.y > dripCenter.y && abs(uv.x - xPos) < 0.01) {
                        float trail = smoothstep(0.2, 0.0, uv.y - dripCenter.y);
                        drip = max(drip, trail * 0.5);
                    }

                    dripPattern += drip;
                }
                return min(dripPattern, 1.0);
            }

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewPosition);

                vec2 centeredUv = vUv * 2.0 - 1.0;
                float distFromCenter = length(centeredUv);

                // === POISON COLORS ===
                vec3 lightPoison = vec3(0.4, 0.9, 0.2);   // Bright sickly green
                vec3 darkPoison = vec3(0.1, 0.4, 0.0);    // Deep toxic green
                vec3 acidYellow = vec3(0.7, 0.8, 0.0);    // Acid highlight

                // === ORGANIC NOISE BASE ===
                float organicNoise = fbm(vUv * 5.0 + uTime * 0.1);

                // === BUBBLES ===
                float bubblePattern = bubbles(vUv, uBubbleCount, uTime);

                // === DRIPS ===
                float dripPattern = drips(vUv, uTime) * uToxicity;

                // === CORROSION PATTERN ===
                float corrosion = fbm(vUv * 10.0 + uTime * 0.05);
                corrosion = smoothstep(0.4, 0.6, corrosion) * uCorrosionStrength;

                // === COLOR MIXING ===
                vec3 poisonColor = mix(darkPoison, lightPoison, organicNoise);

                // Add acid highlights on bubbles
                poisonColor = mix(poisonColor, acidYellow, bubblePattern * 0.6);

                // Drips are brighter
                poisonColor = mix(poisonColor, lightPoison * 1.3, dripPattern * 0.5);

                // Corrosion darkens
                poisonColor *= (1.0 - corrosion * 0.4);

                // === GLOW ===
                float glow = (bubblePattern + dripPattern * 0.5) * uGlowIntensity;
                poisonColor += vec3(0.2, 0.5, 0.0) * glow;

                // === FRESNEL ===
                float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.0);
                poisonColor += lightPoison * fresnel * 0.3;

                // === ALPHA ===
                float alpha = uOpacity;
                alpha *= (0.7 + organicNoise * 0.3);
                alpha = max(alpha, bubblePattern * 0.8);
                alpha = max(alpha, dripPattern * 0.9);

                // Edge fade
                float edgeFade = 1.0 - smoothstep(0.85, 1.0, distFromCenter);
                alpha *= edgeFade;

                if (alpha < 0.01) discard;

                gl_FragColor = vec4(poisonColor, alpha);
            }
        `,

        transparent: true,
        blending: THREE.NormalBlending,
        depthWrite: false,
        side: THREE.DoubleSide
    });

    material.userData.toxicity = toxicity;
    material.userData.elementalType = 'poison';

    return material;
}

/**
 * Update poison material animation
 */
export function updatePoisonMaterial(material, deltaTime) {
    if (material?.uniforms?.uTime) {
        material.uniforms.uTime.value += deltaTime;
    }
}

/**
 * Get physics configuration for poison element
 */
export function getPoisonPhysics(toxicity = 0.5) {
    return {
        gravity: 1.0,
        drag: lerp(0.1, 0.05, toxicity),      // More fluid at high toxicity
        bounce: lerp(0.2, 0.0, toxicity),      // Splashes, doesn't bounce
        sticksToSurfaces: true,
        corrodesOnContact: toxicity > 0.3,
        spreadRate: lerp(0.0, 0.3, toxicity),
        lifetime: lerp(2.0, 4.0, toxicity),
        damageOverTime: toxicity > 0.2
    };
}

export default {
    createPoisonMaterial,
    updatePoisonMaterial,
    getPoisonPhysics
};
