/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Fire Shard Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Custom shader material for fire shards
 * @author Emotive Engine Team
 * @module effects/shatter/FireShardMaterial
 *
 * ## Purpose
 *
 * Simple emissive shader for fire shard effects. Fire glows uniformly and relies
 * on bloom post-processing to naturally soften polygon edges.
 *
 * Features:
 * - Additive blending for fire accumulation (overlapping shards brighten)
 * - Emissive-only rendering (fire emits light, doesn't reflect)
 * - Per-shard color/intensity variation via uniforms
 */

import * as THREE from 'three';

/**
 * Create a fire shard material - simple emissive for bloom-based edge softening
 * Fire shards should glow uniformly; bloom post-processing naturally softens edges
 *
 * @param {Object} options
 * @param {THREE.Color} options.color - Fire color (emissive)
 * @param {number} options.intensity - Emissive intensity (high = more bloom = softer edges)
 * @param {number} options.opacity - Base opacity
 * @returns {THREE.ShaderMaterial}
 */
export function createFireShardMaterial(options = {}) {
    const {
        color = new THREE.Color(0xffaa00),
        intensity = 3.0,
        opacity = 0.6
    } = options;

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: color.clone() },
            uIntensity: { value: intensity },
            uOpacity: { value: opacity }
        },

        vertexShader: /* glsl */`
            void main() {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,

        fragmentShader: /* glsl */`
            uniform vec3 uColor;
            uniform float uIntensity;
            uniform float uOpacity;

            void main() {
                // Simple emissive fire - uniform glow, let bloom soften edges
                vec3 fireColor = uColor * uIntensity;
                gl_FragColor = vec4(fireColor, uOpacity);
            }
        `,

        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
    });

    return material;
}

export default { createFireShardMaterial };
