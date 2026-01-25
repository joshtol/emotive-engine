/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Earth Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Standalone earth/stone material with rocky texture and cracks
 * @author Emotive Engine Team
 * @module materials/EarthMaterial
 *
 * ## Master Parameter: petrification (0-1)
 *
 * | Petrification | Visual                  | Effect              | Example       |
 * |---------------|-------------------------|---------------------|---------------|
 * | 0.0           | Soft earth, dirt        | Loose, crumbly      | Soil          |
 * | 0.5           | Rocky patches           | Hardening           | Stone forming |
 * | 1.0           | Solid stone encasement  | Completely petrified| Statue        |
 *
 * Earth features rocky textures, crack patterns, and crumbling effects.
 */

import * as THREE from 'three';

function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Create an earth material with petrification-driven appearance
 *
 * @param {Object} options
 * @param {number} [options.petrification=0.5] - Master parameter (0=earth, 0.5=rocky, 1=stone)
 * @param {number} [options.opacity=0.9] - Base opacity
 * @returns {THREE.ShaderMaterial}
 */
export function createEarthMaterial(options = {}) {
    const {
        petrification = 0.5,
        opacity = 0.9
    } = options;

    // Derive properties from petrification
    const rockiness = lerp(0.2, 1.0, petrification);
    const crackDepth = lerp(0.1, 0.5, petrification);
    const crumbleAmount = lerp(0.4, 0.0, petrification);  // Less crumble when solid
    const mossAmount = lerp(0.3, 0.0, petrification);     // Moss fades on stone
    const roughness = lerp(0.6, 0.9, petrification);

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uPetrification: { value: petrification },
            uRockiness: { value: rockiness },
            uCrackDepth: { value: crackDepth },
            uCrumbleAmount: { value: crumbleAmount },
            uMossAmount: { value: mossAmount },
            uRoughness: { value: roughness },
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
            uniform float uPetrification;
            uniform float uRockiness;
            uniform float uCrackDepth;
            uniform float uCrumbleAmount;
            uniform float uMossAmount;
            uniform float uRoughness;
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

            float hash3(vec3 p) {
                p = fract(p * 0.3183099 + 0.1);
                p *= 17.0;
                return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
            }

            // 3D noise for rocky texture
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

            // 2D noise
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

            // FBM for rocky detail
            float fbm(vec2 p) {
                float value = 0.0;
                float amp = 0.5;
                for (int i = 0; i < 5; i++) {
                    value += amp * noise(p);
                    p *= 2.0;
                    amp *= 0.5;
                }
                return value;
            }

            // Voronoi for cracks
            vec2 voronoi(vec2 p) {
                vec2 n = floor(p);
                vec2 f = fract(p);

                float minDist = 1.0;
                float secondDist = 1.0;

                for (int j = -1; j <= 1; j++) {
                    for (int i = -1; i <= 1; i++) {
                        vec2 neighbor = vec2(float(i), float(j));
                        vec2 point = hash(n + neighbor) * vec2(0.8) + 0.1 + neighbor;
                        float d = length(f - point);

                        if (d < minDist) {
                            secondDist = minDist;
                            minDist = d;
                        } else if (d < secondDist) {
                            secondDist = d;
                        }
                    }
                }

                return vec2(minDist, secondDist - minDist);
            }

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewPosition);

                vec2 centeredUv = vUv * 2.0 - 1.0;
                float distFromCenter = length(centeredUv);

                // === EARTH COLORS ===
                vec3 dirtColor = vec3(0.4, 0.3, 0.2);
                vec3 stoneColor = vec3(0.5, 0.5, 0.45);
                vec3 darkStone = vec3(0.3, 0.3, 0.28);
                vec3 mossColor = vec3(0.2, 0.35, 0.15);

                // === ROCKY TEXTURE ===
                float rockTexture = fbm(vUv * 8.0);
                float rockDetail = noise3D(vPosition * 10.0);

                // === CRACK PATTERN ===
                vec2 vor = voronoi(vUv * (6.0 + uPetrification * 4.0));
                float cracks = smoothstep(0.0, 0.05 * (1.0 - uPetrification * 0.5), vor.y);

                // === CRUMBLE EDGES ===
                float crumbleNoise = fbm(vUv * 15.0 + uTime * 0.02);
                float crumble = smoothstep(0.4, 0.6, crumbleNoise) * uCrumbleAmount;

                // === MOSS PATCHES ===
                float mossNoise = fbm(vUv * 4.0);
                float moss = smoothstep(0.5, 0.7, mossNoise) * uMossAmount;

                // === COLOR MIXING ===
                // Base: mix dirt and stone based on petrification
                vec3 earthColor = mix(dirtColor, stoneColor, uPetrification);

                // Add rocky variation
                earthColor = mix(earthColor, darkStone, rockTexture * 0.4 * uRockiness);
                earthColor = mix(earthColor, stoneColor * 1.1, rockDetail * 0.3 * uRockiness);

                // Darken cracks
                earthColor *= mix(1.0, 0.6, (1.0 - cracks) * uCrackDepth);

                // Add moss
                earthColor = mix(earthColor, mossColor, moss);

                // Crumbling areas are lighter (exposed)
                earthColor = mix(earthColor, dirtColor * 1.2, crumble * 0.5);

                // === LIGHTING ===
                float diffuse = max(dot(normal, vec3(0.5, 1.0, 0.3)), 0.0);
                earthColor *= (0.6 + diffuse * 0.4);

                // Fresnel rim
                float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
                earthColor += stoneColor * fresnel * 0.2 * uPetrification;

                // === ALPHA ===
                float alpha = uOpacity;

                // Petrification spreads from edges
                float spreadPattern = smoothstep(0.2, 0.8, distFromCenter + rockTexture * 0.3);
                alpha *= mix(spreadPattern, 1.0, uPetrification);

                // Crumble reduces alpha
                alpha *= (1.0 - crumble * 0.5);

                // Edge fade
                float edgeFade = 1.0 - smoothstep(0.9, 1.0, distFromCenter);
                alpha *= edgeFade;

                if (alpha < 0.01) discard;

                gl_FragColor = vec4(earthColor, alpha);
            }
        `,

        transparent: true,
        blending: THREE.NormalBlending,
        depthWrite: false,
        side: THREE.DoubleSide
    });

    material.userData.petrification = petrification;
    material.userData.elementalType = 'earth';

    return material;
}

/**
 * Update earth material animation
 */
export function updateEarthMaterial(material, deltaTime) {
    if (material?.uniforms?.uTime) {
        material.uniforms.uTime.value += deltaTime;
    }
}

/**
 * Get physics configuration for earth element
 */
export function getEarthPhysics(petrification = 0.5) {
    return {
        gravity: lerp(1.0, 1.5, petrification),    // Heavier when stone
        drag: lerp(0.2, 0.05, petrification),
        bounce: lerp(0.1, 0.3, petrification),     // Stone bounces more
        friction: lerp(0.8, 0.6, petrification),
        canShatter: petrification > 0.7,
        crumblesOnImpact: petrification < 0.4,
        weight: lerp(1.0, 2.0, petrification),
        rootsTarget: petrification < 0.3          // Soft earth can root things
    };
}

export default {
    createEarthMaterial,
    updateEarthMaterial,
    getEarthPhysics
};
