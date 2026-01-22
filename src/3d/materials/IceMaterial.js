/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Ice Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Standalone ice material with melt-driven behavior
 * @author Emotive Engine Team
 * @module materials/IceMaterial
 *
 * ## Master Parameter: melt (0-1)
 *
 * | Melt | Visual                       | Physics           | Example      |
 * |------|------------------------------|-------------------|--------------|
 * | 0.0  | Sharp refraction, frost      | Brittle, heavy    | Solid ice    |
 * | 0.5  | Softer edges, dripping       | Slippery, cracking| Melting      |
 * | 1.0  | Transitions to water         | Water physics     | Slush        |
 *
 * At melt > 0.8, the material transitions to water behavior.
 *
 * ## Usage
 *
 * Standalone:
 *   const iceMesh = new THREE.Mesh(geometry, createIceMaterial({ melt: 0.0 }));
 *
 * Shatter system:
 *   shatterSystem.shatter(mesh, dir, { elemental: 'ice', elementalParam: 0.1 });
 */

import * as THREE from 'three';
import { createWaterMaterial, getWaterPhysics } from './WaterMaterial.js';

/**
 * Interpolate between values based on parameter
 */
function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Get ice color based on melt level
 */
function getIceColor(melt) {
    const color = new THREE.Color();

    if (melt < 0.3) {
        // Solid ice - clear blue-white
        color.setRGB(0.85, 0.95, 1.0);
    } else if (melt < 0.7) {
        // Melting - more blue, less white
        const t = (melt - 0.3) / 0.4;
        color.setRGB(
            lerp(0.85, 0.6, t),
            lerp(0.95, 0.85, t),
            1.0
        );
    } else {
        // Nearly water - blue
        color.setRGB(0.5, 0.75, 1.0);
    }

    return color;
}

/**
 * Create an ice material with melt-driven appearance
 *
 * At high melt (>0.8), returns a water material instead (phase transition)
 *
 * @param {Object} options
 * @param {number} [options.melt=0.0] - Master parameter (0=frozen, 0.5=melting, 1=slush)
 * @param {THREE.Color} [options.color] - Override color (otherwise derived from melt)
 * @param {number} [options.opacity=0.9] - Base opacity
 * @returns {THREE.ShaderMaterial}
 */
export function createIceMaterial(options = {}) {
    const {
        melt = 0.0,
        color = null,
        opacity = 0.9
    } = options;

    // Phase transition: high melt = water
    if (melt > 0.8) {
        const waterViscosity = lerp(0.6, 0.3, (melt - 0.8) / 0.2);
        return createWaterMaterial({
            viscosity: waterViscosity,
            color: color || new THREE.Color(0.5, 0.75, 1.0),
            opacity
        });
    }

    // Derive properties from melt
    const iceColor = color || getIceColor(melt);
    const transmission = lerp(0.7, 0.9, melt);           // More transparent as melts
    const roughness = lerp(0.02, 0.3, melt);             // Gets rougher as melts
    const frostAmount = lerp(1.0, 0.0, melt);            // Frost fades
    const internalCracks = lerp(0.8, 0.2, melt);         // Internal cracks fade
    const ior = lerp(1.31, 1.33, melt);                  // Ice → water IOR
    const subsurfaceScatter = lerp(0.3, 0.1, melt);      // Less scatter when wet

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: iceColor },
            uTransmission: { value: transmission },
            uRoughness: { value: roughness },
            uFrostAmount: { value: frostAmount },
            uInternalCracks: { value: internalCracks },
            uIOR: { value: ior },
            uSubsurfaceScatter: { value: subsurfaceScatter },
            uOpacity: { value: opacity },
            uTime: { value: 0 },
            uMelt: { value: melt }
        },

        vertexShader: /* glsl */`
            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            varying vec2 vUv;

            void main() {
                vUv = uv;
                vPosition = position;
                vNormal = normalMatrix * normal;

                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;

                gl_Position = projectionMatrix * mvPosition;
            }
        `,

        fragmentShader: /* glsl */`
            uniform vec3 uColor;
            uniform float uTransmission;
            uniform float uRoughness;
            uniform float uFrostAmount;
            uniform float uInternalCracks;
            uniform float uSubsurfaceScatter;
            uniform float uOpacity;
            uniform float uTime;
            uniform float uMelt;

            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            varying vec2 vUv;

            // Noise functions for frost and cracks
            float hash(vec3 p) {
                p = fract(p * 0.3183099 + 0.1);
                p *= 17.0;
                return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
            }

            float noise(vec3 p) {
                vec3 i = floor(p);
                vec3 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);

                return mix(
                    mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
                        mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                    mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                        mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
                    f.z
                );
            }

            // Voronoi for crystalline frost pattern
            float voronoi(vec3 p) {
                vec3 i = floor(p);
                vec3 f = fract(p);
                float minDist = 1.0;

                for (int x = -1; x <= 1; x++) {
                    for (int y = -1; y <= 1; y++) {
                        for (int z = -1; z <= 1; z++) {
                            vec3 neighbor = vec3(float(x), float(y), float(z));
                            vec3 point = neighbor + hash(i + neighbor) * 0.8;
                            float dist = length(f - point);
                            minDist = min(minDist, dist);
                        }
                    }
                }
                return minDist;
            }

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewPosition);

                // Base ice color
                vec3 baseColor = uColor;

                // Fresnel effect - rim highlighting
                float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 3.0);

                // Frost crystals on surface (frozen ice only)
                if (uFrostAmount > 0.01) {
                    float frost = voronoi(vPosition * 15.0);
                    frost = smoothstep(0.1, 0.3, frost);
                    // Frost adds white crystalline patterns
                    baseColor = mix(baseColor, vec3(1.0), (1.0 - frost) * uFrostAmount * 0.4);
                }

                // Internal crack patterns
                if (uInternalCracks > 0.01) {
                    vec3 crackPos = vPosition * 8.0;
                    float cracks = voronoi(crackPos);
                    cracks = smoothstep(0.02, 0.08, cracks);
                    // Cracks are darker inside
                    float crackIntensity = (1.0 - cracks) * uInternalCracks;
                    baseColor = mix(baseColor, baseColor * 0.7, crackIntensity * 0.3);
                    // But have bright edges (light refraction)
                    float crackEdge = smoothstep(0.08, 0.12, cracks) - smoothstep(0.12, 0.2, cracks);
                    baseColor += crackEdge * uInternalCracks * 0.2;
                }

                // Subsurface scattering approximation
                vec3 scatterColor = uColor * 1.2;
                float scatter = uSubsurfaceScatter * (1.0 - abs(dot(normal, viewDir)));
                baseColor = mix(baseColor, scatterColor, scatter * 0.3);

                // Specular highlights (sharper when frozen)
                float specPower = mix(64.0, 16.0, uMelt);
                float spec = pow(max(dot(reflect(-viewDir, normal), vec3(0.5, 1.0, 0.5)), 0.0), specPower);
                baseColor += spec * (1.0 - uRoughness) * 0.5;

                // Rim glow from fresnel
                vec3 rimColor = mix(uColor * 1.3, vec3(0.9, 0.95, 1.0), 0.5);
                baseColor = mix(baseColor, rimColor, fresnel * 0.4);

                // Alpha based on transmission
                float alpha = uOpacity * (1.0 - uTransmission * 0.2);
                alpha = mix(alpha, min(1.0, alpha + 0.2), fresnel);

                gl_FragColor = vec4(baseColor, alpha);
            }
        `,

        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: true
    });

    // Store parameters for external access
    material.userData.melt = melt;
    material.userData.elementalType = 'ice';

    return material;
}

/**
 * Update ice material animation
 * Call this each frame for animated ice (subtle shimmer)
 *
 * @param {THREE.ShaderMaterial} material - Ice material to update
 * @param {number} deltaTime - Time since last frame in seconds
 */
export function updateIceMaterial(material, deltaTime) {
    if (material?.uniforms?.uTime) {
        material.uniforms.uTime.value += deltaTime;
    }
}

/**
 * Get physics configuration for ice element
 * Used by shatter system for shard behavior
 *
 * @param {number} melt - Melt parameter 0-1
 * @returns {Object} Physics configuration
 */
export function getIcePhysics(melt = 0.0) {
    // At high melt, transition to water physics
    if (melt > 0.8) {
        const waterViscosity = lerp(0.6, 0.3, (melt - 0.8) / 0.2);
        return getWaterPhysics(waterViscosity);
    }

    return {
        gravity: lerp(1.3, 1.0, melt),              // Heavy when solid
        bounce: lerp(0.1, 0.4, melt),               // Brittle → bouncy
        drag: lerp(0.01, 0.03, melt),
        shatterThreshold: lerp(0.3, 0.6, melt),     // Easier to shatter when frozen
        slideOnSurface: lerp(0.9, 0.5, melt),       // Slippery
        brittleness: lerp(1.0, 0.3, melt),          // More brittle when frozen
        crackOnImpact: melt < 0.5                    // Frozen ice shows cracks before shatter
    };
}

/**
 * Get crack style for ice element
 * Used by crack system for elemental crack appearance
 *
 * @param {number} melt - Melt parameter 0-1
 * @returns {Object} Crack style configuration
 */
export function getIceCrackStyle(melt = 0.0) {
    // Ice cracks are crystalline, geometric
    return {
        color: lerp(0xaaeeff, 0x88ddff, melt),
        emissive: lerp(0.4, 0.1, melt),
        animated: false,  // Static crystalline cracks
        pattern: 'crystalline',
        frostEdges: melt < 0.5  // Frost crystals on crack edges when frozen
    };
}

export default {
    createIceMaterial,
    updateIceMaterial,
    getIcePhysics,
    getIceCrackStyle
};
