/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Smoke Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Standalone smoke material with density-driven behavior
 * @author Emotive Engine Team
 * @module materials/SmokeMaterial
 *
 * ## Master Parameter: density (0-1)
 *
 * | Density | Visual                  | Physics            | Example      |
 * |---------|-------------------------|--------------------|--------------|
 * | 0.0     | Nearly invisible, wispy | Fast rise, disperse| Steam        |
 * | 0.5     | Visible, soft edges     | Medium rise        | Standard     |
 * | 1.0     | Thick, opaque           | Slow rise, lingers | Heavy smoke  |
 *
 * ## Usage
 *
 * Standalone:
 *   const smokeMesh = new THREE.Mesh(geometry, createSmokeMaterial({ density: 0.5 }));
 *
 * Shatter system:
 *   shatterSystem.shatter(mesh, dir, { elemental: 'smoke', elementalParam: 0.5 });
 *
 * As overlay:
 *   shatterSystem.shatter(mesh, dir, { overlay: 'smoke', overlayParam: 0.3 });
 */

import * as THREE from 'three';

/**
 * Interpolate between values based on parameter
 */
function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Get smoke color based on density and optional tint
 */
function getSmokeColor(density, tint) {
    if (tint) return tint.clone();

    // Default: light gray (steam) to dark gray (heavy smoke)
    const gray = lerp(0.9, 0.3, density);
    return new THREE.Color(gray, gray, gray);
}

/**
 * Create a smoke material with density-driven appearance
 *
 * @param {Object} options
 * @param {number} [options.density=0.5] - Master parameter (0=steam, 0.5=smoke, 1=heavy)
 * @param {THREE.Color} [options.color] - Override color (otherwise gray gradient)
 * @param {number} [options.opacity] - Override opacity (otherwise derived from density)
 * @param {boolean} [options.additive=false] - Use additive blending (for lighter smoke)
 * @returns {THREE.ShaderMaterial}
 */
export function createSmokeMaterial(options = {}) {
    const {
        density = 0.5,
        color = null,
        opacity = null,
        additive = false
    } = options;

    // Derive properties from density
    const smokeColor = getSmokeColor(density, color);
    const smokeOpacity = opacity ?? lerp(0.15, 0.7, density);
    const softness = lerp(0.9, 0.3, density);           // Edge fade amount
    const noiseScale = lerp(3.0, 1.0, density);         // Finer noise when dense
    const riseSpeed = lerp(1.5, 0.3, density);          // Dense smoke rises slower
    const disperseRate = lerp(0.4, 0.05, density);      // Light smoke disperses faster
    const turbulence = lerp(0.8, 0.3, density);         // Light smoke more chaotic
    const billboardSpin = lerp(2.0, 0.3, density);      // Light smoke spins faster

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: smokeColor },
            uOpacity: { value: smokeOpacity },
            uSoftness: { value: softness },
            uNoiseScale: { value: noiseScale },
            uRiseSpeed: { value: riseSpeed },
            uDisperseRate: { value: disperseRate },
            uTurbulence: { value: turbulence },
            uBillboardSpin: { value: billboardSpin },
            uTime: { value: 0 },
            uDensity: { value: density },
            uLifetime: { value: 1.0 }  // For fade-out animation (0-1)
        },

        vertexShader: /* glsl */`
            uniform float uRiseSpeed;
            uniform float uTurbulence;
            uniform float uTime;
            uniform float uLifetime;

            varying vec3 vPosition;
            varying vec2 vUv;
            varying float vDepth;

            // Noise for turbulent motion
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
                vUv = uv;
                vPosition = position;

                vec3 pos = position;

                // Rising motion
                float rise = uTime * uRiseSpeed * uLifetime;
                pos.y += rise;

                // Turbulent sideways motion
                float turbX = noise(vec2(pos.y * 2.0 + uTime * 0.3, 0.0)) - 0.5;
                float turbZ = noise(vec2(0.0, pos.y * 2.0 + uTime * 0.3)) - 0.5;
                pos.x += turbX * uTurbulence * (1.0 + rise * 0.5);
                pos.z += turbZ * uTurbulence * (1.0 + rise * 0.5);

                // Expansion as it rises
                float expansion = 1.0 + rise * 0.3;
                pos.xz *= expansion;

                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                vDepth = -mvPosition.z;

                gl_Position = projectionMatrix * mvPosition;
            }
        `,

        fragmentShader: /* glsl */`
            uniform vec3 uColor;
            uniform float uOpacity;
            uniform float uSoftness;
            uniform float uNoiseScale;
            uniform float uDisperseRate;
            uniform float uTime;
            uniform float uDensity;
            uniform float uLifetime;

            varying vec3 vPosition;
            varying vec2 vUv;
            varying float vDepth;

            // 2D noise for wispy patterns
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

            float fbm(vec2 p) {
                float value = 0.0;
                float amplitude = 0.5;
                for (int i = 0; i < 4; i++) {
                    value += amplitude * noise(p);
                    p *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }

            void main() {
                // Circular distance from center for soft edges
                vec2 centeredUv = vUv * 2.0 - 1.0;
                float distFromCenter = length(centeredUv);

                // Soft edge falloff
                float edgeFade = 1.0 - smoothstep(1.0 - uSoftness, 1.0, distFromCenter);

                // Wispy noise pattern
                vec2 noiseCoord = vUv * uNoiseScale + uTime * 0.1;
                float wisps = fbm(noiseCoord);

                // More wisps at edges (smoke dissipating)
                wisps = mix(wisps, wisps * 0.5 + 0.5, distFromCenter);

                // Dispersion over lifetime
                float disperseFade = 1.0 - uDisperseRate * (1.0 - uLifetime);

                // Combine all alpha factors
                float alpha = uOpacity * edgeFade * wisps * disperseFade * uLifetime;

                // Dense smoke is more uniform, light smoke is more wispy
                alpha = mix(alpha, uOpacity * edgeFade * disperseFade * uLifetime, uDensity * 0.5);

                // Discard nearly transparent pixels
                if (alpha < 0.01) discard;

                gl_FragColor = vec4(uColor, alpha);
            }
        `,

        transparent: true,
        blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
        depthWrite: false,
        side: THREE.DoubleSide
    });

    // Store parameters for external access
    material.userData.density = density;
    material.userData.elementalType = 'smoke';

    return material;
}

/**
 * Update smoke material animation
 * Call this each frame for animated smoke
 *
 * @param {THREE.ShaderMaterial} material - Smoke material to update
 * @param {number} deltaTime - Time since last frame in seconds
 */
export function updateSmokeMaterial(material, deltaTime) {
    if (material?.uniforms?.uTime) {
        material.uniforms.uTime.value += deltaTime;
    }
}

/**
 * Set smoke lifetime for fade-out animation
 *
 * @param {THREE.ShaderMaterial} material - Smoke material
 * @param {number} lifetime - Remaining lifetime 0-1 (0=dead, 1=full)
 */
export function setSmokeMaterialLifetime(material, lifetime) {
    if (material?.uniforms?.uLifetime) {
        material.uniforms.uLifetime.value = Math.max(0, Math.min(1, lifetime));
    }
}

/**
 * Get physics configuration for smoke element
 * Used by shatter system for shard behavior
 *
 * @param {number} density - Density parameter 0-1
 * @returns {Object} Physics configuration
 */
export function getSmokePhysics(density = 0.5) {
    return {
        gravity: lerp(-0.4, -0.05, density),          // All rise, dense rises slower
        drag: lerp(0.05, 0.3, density),               // Dense smoke has more drag
        bounce: 0.0,                                   // Smoke doesn't bounce
        disperseOverTime: true,
        disperseRate: lerp(0.4, 0.05, density),
        billboardRotation: lerp(2.0, 0.3, density),   // Spin speed
        fadeOut: true,
        lifetime: lerp(1.5, 4.0, density)             // Dense smoke lingers
    };
}

/**
 * Get crack style for smoke element
 * Used by crack system for elemental crack appearance
 *
 * @param {number} density - Density parameter 0-1
 * @returns {Object} Crack style configuration
 */
export function getSmokeCrackStyle(density = 0.5) {
    // Smoke cracks = wisps escaping from crack lines
    return {
        color: 0x444444,
        emissive: 0.0,              // No glow
        animated: true,
        pattern: 'wispy',
        emitParticles: density > 0.3  // Dense smoke spawns particles from cracks
    };
}

export default {
    createSmokeMaterial,
    updateSmokeMaterial,
    setSmokeMaterialLifetime,
    getSmokePhysics,
    getSmokeCrackStyle
};
