/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Nature Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Standalone nature/plant material with vine and growth effects
 * @author Emotive Engine Team
 * @module materials/NatureMaterial
 *
 * ## Master Parameter: growth (0-1)
 *
 * | Growth | Visual                    | Effect              | Example       |
 * |--------|---------------------------|---------------------|---------------|
 * | 0.0    | Sparse sprouts            | Gentle emergence    | Seeds         |
 * | 0.5    | Spreading vines, leaves   | Active growth       | Overgrowth    |
 * | 1.0    | Dense foliage, blooming   | Full flourish       | Forest spirit |
 *
 * Nature features organic vine patterns, leaf textures, and blooming effects.
 */

import * as THREE from 'three';

function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Create a nature material with growth-driven appearance
 *
 * @param {Object} options
 * @param {number} [options.growth=0.5] - Master parameter (0=sprouts, 0.5=vines, 1=flourish)
 * @param {string} [options.season='summer'] - 'spring', 'summer', 'autumn', 'winter'
 * @param {number} [options.opacity=0.85] - Base opacity
 * @returns {THREE.ShaderMaterial}
 */
export function createNatureMaterial(options = {}) {
    const {
        growth = 0.5,
        season = 'summer',
        opacity = 0.85
    } = options;

    // Derive properties from growth
    const vineCount = Math.floor(lerp(2, 8, growth));
    const vineLengthleaf = lerp(0.2, 0.8, growth);
    const leafDensity = lerp(0.1, 0.7, growth);
    const bloomAmount = growth > 0.7 ? lerp(0.0, 1.0, (growth - 0.7) / 0.3) : 0.0;
    const swayAmount = lerp(0.02, 0.08, growth);

    // Season affects colors
    const seasonType = { spring: 0, summer: 1, autumn: 2, winter: 3 }[season] || 1;

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uGrowth: { value: growth },
            uVineCount: { value: vineCount },
            uVineLength: { value: vineLengthleaf },
            uLeafDensity: { value: leafDensity },
            uBloomAmount: { value: bloomAmount },
            uSwayAmount: { value: swayAmount },
            uSeasonType: { value: seasonType },
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
            uniform float uGrowth;
            uniform float uVineCount;
            uniform float uVineLength;
            uniform float uLeafDensity;
            uniform float uBloomAmount;
            uniform float uSwayAmount;
            uniform int uSeasonType;
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

            // FBM
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

            // Vine pattern - curving tendrils
            float vine(vec2 uv, float seed, float time) {
                // Starting point
                float startY = hash(vec2(seed, 0.0)) * 0.3;
                float startX = hash(vec2(0.0, seed)) * 0.8 + 0.1;

                // Sway animation
                float sway = sin(time * 2.0 + seed * 5.0) * uSwayAmount;

                // Curve the vine
                float targetX = startX + (uv.y - startY) * (hash(vec2(seed * 2.0, 0.0)) - 0.5) * 2.0;
                targetX += sway * (uv.y - startY);

                // Vine thickness varies
                float thickness = 0.015 * (1.0 - (uv.y - startY) * 0.5);

                // Distance to vine curve
                float dist = abs(uv.x - targetX);

                // Only draw where vine has grown
                float vineLength = uVineLength;
                float vineMask = smoothstep(startY, startY + vineLength, uv.y) *
                                (1.0 - smoothstep(startY + vineLength - 0.1, startY + vineLength, uv.y));

                return smoothstep(thickness, thickness * 0.3, dist) * vineMask;
            }

            // Leaf shape
            float leaf(vec2 uv, vec2 pos, float size, float angle) {
                vec2 centered = uv - pos;

                // Rotate
                float c = cos(angle);
                float s = sin(angle);
                centered = vec2(centered.x * c - centered.y * s, centered.x * s + centered.y * c);

                // Leaf shape - pointed oval
                centered.x *= 2.0;
                float dist = length(centered);
                float leafShape = smoothstep(size, size * 0.3, dist);

                // Leaf vein
                float vein = smoothstep(0.01, 0.0, abs(centered.x)) * leafShape * 0.3;

                return leafShape - vein;
            }

            // Flower/bloom
            float flower(vec2 uv, vec2 pos, float size, float time) {
                vec2 centered = uv - pos;
                float dist = length(centered);
                float angle = atan(centered.y, centered.x);

                // Petals
                float petals = sin(angle * 5.0 + time * 0.5) * 0.3 + 0.7;
                float flowerShape = smoothstep(size * petals, size * petals * 0.5, dist);

                // Center
                float center = smoothstep(size * 0.3, size * 0.1, dist);

                return max(flowerShape, center);
            }

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewPosition);

                vec2 centeredUv = vUv * 2.0 - 1.0;
                float distFromCenter = length(centeredUv);

                // === SEASON COLORS ===
                vec3 leafColorLight, leafColorDark, flowerColor;

                if (uSeasonType == 0) { // Spring
                    leafColorLight = vec3(0.35, 0.55, 0.25);
                    leafColorDark = vec3(0.15, 0.35, 0.1);
                    flowerColor = vec3(0.95, 0.75, 0.85); // Soft pink blossoms
                } else if (uSeasonType == 1) { // Summer
                    leafColorLight = vec3(0.2, 0.5, 0.15);
                    leafColorDark = vec3(0.08, 0.3, 0.06);
                    flowerColor = vec3(0.9, 0.85, 0.9); // White/cream wildflowers
                } else if (uSeasonType == 2) { // Autumn
                    leafColorLight = vec3(0.7, 0.4, 0.1);
                    leafColorDark = vec3(0.5, 0.2, 0.05);
                    flowerColor = vec3(0.7, 0.25, 0.1); // Muted orange/red
                } else { // Winter
                    leafColorLight = vec3(0.25, 0.32, 0.25);
                    leafColorDark = vec3(0.12, 0.18, 0.12);
                    flowerColor = vec3(0.85, 0.9, 0.95); // Frost white
                }

                vec3 vineColor = vec3(0.15, 0.25, 0.08);

                // === VINES ===
                float vinePattern = 0.0;
                for (float i = 0.0; i < 8.0; i++) {
                    if (i >= uVineCount) break;
                    vinePattern += vine(vUv, i * 7.3, uTime);
                }
                vinePattern = min(vinePattern, 1.0);

                // === LEAVES ===
                float leafPattern = 0.0;
                float leafNoise = fbm(vUv * 10.0);

                for (float i = 0.0; i < 20.0; i++) {
                    if (i / 20.0 > uLeafDensity) break;

                    vec2 leafPos = vec2(
                        hash(vec2(i * 13.7, 0.0)),
                        hash(vec2(0.0, i * 17.3))
                    );
                    float leafSize = 0.03 + hash(vec2(i, i * 2.0)) * 0.04;
                    float leafAngle = hash(vec2(i * 3.0, i)) * 6.28 + uTime * 0.2;

                    // Sway
                    leafPos.x += sin(uTime * 1.5 + i) * uSwayAmount;

                    leafPattern += leaf(vUv, leafPos, leafSize, leafAngle);
                }
                leafPattern = min(leafPattern, 1.0);

                // === FLOWERS/BLOOMS ===
                float bloomPattern = 0.0;
                if (uBloomAmount > 0.0) {
                    for (float i = 0.0; i < 5.0; i++) {
                        vec2 flowerPos = vec2(
                            hash(vec2(i * 23.7, 100.0)),
                            hash(vec2(100.0, i * 31.3))
                        );
                        float flowerSize = 0.04 + hash(vec2(i * 5.0, i * 3.0)) * 0.03;

                        bloomPattern += flower(vUv, flowerPos, flowerSize, uTime) * uBloomAmount;
                    }
                    bloomPattern = min(bloomPattern, 1.0);
                }

                // === COMBINE ===
                vec3 natureColor = vec3(0.0);
                float totalPattern = 0.0;

                // Layer: vines first
                if (vinePattern > 0.0) {
                    natureColor = mix(natureColor, vineColor, vinePattern);
                    totalPattern = max(totalPattern, vinePattern);
                }

                // Layer: leaves
                if (leafPattern > 0.0) {
                    vec3 leafColor = mix(leafColorDark, leafColorLight, leafNoise);
                    natureColor = mix(natureColor, leafColor, leafPattern);
                    totalPattern = max(totalPattern, leafPattern);
                }

                // Layer: flowers on top
                if (bloomPattern > 0.0) {
                    natureColor = mix(natureColor, flowerColor, bloomPattern);
                    totalPattern = max(totalPattern, bloomPattern);
                }

                // === LIGHTING ===
                float diffuse = max(dot(normal, vec3(0.3, 1.0, 0.3)), 0.0);
                natureColor *= (0.7 + diffuse * 0.3);

                // Subtle fresnel
                float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.0);
                natureColor += leafColorLight * fresnel * 0.08;

                // === ALPHA ===
                float alpha = totalPattern * uOpacity;

                // Growth spreads from center
                float growthMask = 1.0 - smoothstep(uGrowth * 1.2, uGrowth * 1.2 + 0.2, distFromCenter);
                alpha *= growthMask;

                // Edge fade
                float edgeFade = 1.0 - smoothstep(0.9, 1.0, distFromCenter);
                alpha *= edgeFade;

                if (alpha < 0.01) discard;

                gl_FragColor = vec4(natureColor, alpha);
            }
        `,

        transparent: true,
        blending: THREE.NormalBlending,
        depthWrite: false,
        side: THREE.DoubleSide
    });

    material.userData.growth = growth;
    material.userData.season = season;
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
        gravity: lerp(0.8, 0.5, growth),       // More floaty when grown
        drag: lerp(0.2, 0.4, growth),          // More air resistance with foliage
        bounce: 0.1,
        rootsTarget: growth > 0.3,
        entangles: growth > 0.5,
        spreadRate: lerp(0.0, 0.2, growth),
        lifetime: lerp(2.0, 5.0, growth),
        healsOverTime: growth > 0.6
    };
}

export default {
    createNatureMaterial,
    updateNatureMaterial,
    getNaturePhysics
};
