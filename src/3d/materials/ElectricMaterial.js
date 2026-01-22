/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Electric Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Standalone electric/lightning material with charge-driven behavior
 * @author Emotive Engine Team
 * @module materials/ElectricMaterial
 *
 * ## Master Parameter: charge (0-1)
 *
 * | Charge | Visual              | Physics            | Example   |
 * |--------|---------------------|--------------------|-----------|
 * | 0.0    | Faint static        | Subtle attraction  | Static    |
 * | 0.5    | Visible arcs        | Medium chain       | Standard  |
 * | 1.0    | Intense bolts       | Strong chain       | Lightning |
 *
 * Electric is often used as an OVERLAY on other shatters.
 *
 * ## Usage
 *
 * Standalone:
 *   const electricMesh = new THREE.Mesh(geometry, createElectricMaterial({ charge: 0.7 }));
 *
 * As overlay on shatter:
 *   shatterSystem.shatter(mesh, dir, { overlay: 'electric', overlayParam: 0.8 });
 */

import * as THREE from 'three';

/**
 * Interpolate between values based on parameter
 */
function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Get electric color based on charge
 */
function getElectricColor(charge, tint) {
    if (tint) return tint.clone();

    const color = new THREE.Color();

    if (charge < 0.3) {
        // Low charge - pale blue static
        color.setRGB(0.6, 0.8, 1.0);
    } else if (charge < 0.7) {
        // Medium - bright cyan
        const t = (charge - 0.3) / 0.4;
        color.setRGB(
            lerp(0.6, 0.3, t),
            lerp(0.8, 1.0, t),
            1.0
        );
    } else {
        // High charge - white-blue intense
        const t = (charge - 0.7) / 0.3;
        color.setRGB(
            lerp(0.3, 0.9, t),
            1.0,
            1.0
        );
    }

    return color;
}

/**
 * Create an electric material with charge-driven appearance
 *
 * @param {Object} options
 * @param {number} [options.charge=0.5] - Master parameter (0=static, 0.5=arcs, 1=lightning)
 * @param {THREE.Color} [options.color] - Override color (otherwise cyan-blue gradient)
 * @param {number} [options.opacity=0.9] - Base opacity
 * @returns {THREE.ShaderMaterial}
 */
export function createElectricMaterial(options = {}) {
    const {
        charge = 0.5,
        color = null,
        opacity = 0.9
    } = options;

    // Derive properties from charge
    const electricColor = getElectricColor(charge, color);
    const intensity = lerp(0.5, 5.0, charge);
    const arcFrequency = lerp(0.5, 8.0, charge);
    const branchCount = Math.floor(lerp(2, 12, charge));
    const arcThickness = lerp(0.01, 0.04, charge);
    const flickerRate = lerp(4.0, 20.0, charge);

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: electricColor },
            uIntensity: { value: intensity },
            uArcFrequency: { value: arcFrequency },
            uBranchCount: { value: branchCount },
            uArcThickness: { value: arcThickness },
            uFlickerRate: { value: flickerRate },
            uOpacity: { value: opacity },
            uTime: { value: 0 },
            uCharge: { value: charge }
        },

        vertexShader: /* glsl */`
            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec2 vUv;

            void main() {
                vPosition = position;
                vNormal = normalMatrix * normal;
                vUv = uv;

                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,

        fragmentShader: /* glsl */`
            uniform vec3 uColor;
            uniform float uIntensity;
            uniform float uArcFrequency;
            uniform float uBranchCount;
            uniform float uArcThickness;
            uniform float uFlickerRate;
            uniform float uOpacity;
            uniform float uTime;
            uniform float uCharge;

            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec2 vUv;

            // Hash functions for procedural lightning
            float hash(float n) {
                return fract(sin(n) * 43758.5453);
            }

            float hash2(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
            }

            // 1D noise for arc wobble
            float noise1D(float x) {
                float i = floor(x);
                float f = fract(x);
                f = f * f * (3.0 - 2.0 * f);
                return mix(hash(i), hash(i + 1.0), f);
            }

            // Generate a single lightning bolt
            float lightningBolt(vec2 uv, float seed, float time) {
                // Bolt starts at top, goes to bottom (or center to edge)
                float boltY = uv.y;

                // Add wobble to X position
                float wobbleFreq = 8.0 + seed * 4.0;
                float wobbleAmp = 0.1 + seed * 0.05;
                float wobble = noise1D(boltY * wobbleFreq + time * 3.0 + seed * 100.0) - 0.5;
                wobble *= wobbleAmp * (0.5 + boltY * 0.5);  // More wobble toward end

                // Bolt center line
                float boltX = 0.5 + wobble + (hash(seed * 47.3) - 0.5) * 0.3;

                // Distance to bolt
                float dist = abs(uv.x - boltX);

                // Bolt thickness varies along length
                float thickness = uArcThickness * (1.0 + sin(boltY * 20.0 + time * 5.0) * 0.3);

                // Core and glow
                float core = smoothstep(thickness, thickness * 0.3, dist);
                float glow = smoothstep(thickness * 4.0, thickness * 0.5, dist) * 0.5;

                // Flicker/pulse
                float flicker = 0.7 + 0.3 * sin(time * uFlickerRate + seed * 6.28);
                flicker *= 0.8 + 0.2 * noise1D(time * 10.0 + seed);

                return (core + glow) * flicker;
            }

            // Surface electric crackling
            float surfaceCrackle(vec3 pos, float time) {
                // Create electric noise pattern on surface
                float n1 = noise1D(pos.x * 10.0 + time * 2.0);
                float n2 = noise1D(pos.y * 10.0 + time * 2.3);
                float n3 = noise1D(pos.z * 10.0 + time * 1.7);

                float crackle = n1 * n2 * n3;
                crackle = pow(crackle, 3.0);  // Sharpen to create sparks

                return crackle * 3.0;
            }

            void main() {
                vec3 normal = normalize(vNormal);

                // Base surface glow
                float baseGlow = 0.2 * uCharge;

                // Surface electric crackling
                float crackle = surfaceCrackle(vPosition, uTime) * uCharge;

                // Lightning bolts (for higher charge)
                float bolts = 0.0;
                if (uCharge > 0.3) {
                    // Generate multiple bolts
                    for (int i = 0; i < 4; i++) {
                        if (float(i) >= uBranchCount) break;

                        float seed = float(i) * 0.25;
                        // Rotate UV space for each bolt
                        float angle = seed * 6.28;
                        vec2 rotUv = vec2(
                            vUv.x * cos(angle) - vUv.y * sin(angle),
                            vUv.x * sin(angle) + vUv.y * cos(angle)
                        );
                        rotUv = rotUv * 0.5 + 0.5;

                        // Only show bolts intermittently (flash effect)
                        float flashTime = uTime * uArcFrequency + seed * 10.0;
                        float flash = step(0.7, fract(flashTime));

                        bolts += lightningBolt(rotUv, seed, uTime) * flash * (uCharge - 0.3) * 2.0;
                    }
                }

                // Combine effects
                float electric = baseGlow + crackle + bolts;

                // Color with intensity
                vec3 finalColor = uColor * electric * uIntensity;

                // Add white core for intense areas
                finalColor = mix(finalColor, vec3(1.0), smoothstep(0.8, 1.5, electric) * 0.5);

                // Alpha based on electric intensity
                float alpha = min(1.0, electric * uOpacity);

                if (alpha < 0.01) discard;

                gl_FragColor = vec4(finalColor, alpha);
            }
        `,

        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
    });

    // Store parameters for external access
    material.userData.charge = charge;
    material.userData.elementalType = 'electric';

    return material;
}

/**
 * Update electric material animation
 * Call this each frame for animated electricity
 *
 * @param {THREE.ShaderMaterial} material - Electric material to update
 * @param {number} deltaTime - Time since last frame in seconds
 */
export function updateElectricMaterial(material, deltaTime) {
    if (material?.uniforms?.uTime) {
        material.uniforms.uTime.value += deltaTime;
    }
}

/**
 * Get physics configuration for electric element
 * Used by shatter system for shard behavior
 *
 * @param {number} charge - Charge parameter 0-1
 * @returns {Object} Physics configuration
 */
export function getElectricPhysics(charge = 0.5) {
    return {
        gravity: 0.0,                                // Electric floats/hovers
        drag: lerp(0.3, 0.02, charge),              // High charge = less drag
        bounce: 0.0,
        chainToNearby: charge > 0.3,                 // Arcs jump between shards
        chainRadius: lerp(0.5, 2.0, charge),
        lifetime: lerp(0.3, 0.8, charge),           // Quick flashes
        flickerOnMove: true,
        attractToMetal: charge > 0.5                 // High charge attracted to metallic objects
    };
}

/**
 * Get crack style for electric element
 * Used by crack system for elemental crack appearance
 *
 * @param {number} charge - Charge parameter 0-1
 * @returns {Object} Crack style configuration
 */
export function getElectricCrackStyle(charge = 0.5) {
    const color = getElectricColor(charge);

    return {
        color: color.getHex(),
        emissive: lerp(1.0, 6.0, charge),
        animated: true,
        pattern: 'branching',
        arcBetweenCracks: charge > 0.5   // Lightning jumps between crack lines
    };
}

export default {
    createElectricMaterial,
    updateElectricMaterial,
    getElectricPhysics,
    getElectricCrackStyle
};
