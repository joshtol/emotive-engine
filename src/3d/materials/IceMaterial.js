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
        // Solid ice - saturated blue (visible frosted tint over mascot)
        color.setRGB(0.3, 0.5, 0.75);
    } else if (melt < 0.7) {
        // Melting - shifts toward cyan
        const t = (melt - 0.3) / 0.4;
        color.setRGB(
            lerp(0.3, 0.35, t),
            lerp(0.5, 0.55, t),
            lerp(0.75, 0.78, t)
        );
    } else {
        // Nearly water - lighter cyan
        color.setRGB(0.35, 0.55, 0.78);
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
        opacity = 0.85,
        overlay = false  // When true, use additive blending for overlay effect
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
            uMelt: { value: melt },
            uOverlay: { value: overlay ? 1.0 : 0.0 }
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
            uniform float uOverlay;

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

            // FBM for frost: layered noise gives organic frost patches
            float fbm3(vec3 p) {
                float f = 0.0;
                f += 0.5000 * noise(p); p *= 2.01;
                f += 0.2500 * noise(p); p *= 2.02;
                f += 0.1250 * noise(p);
                return f / 0.875;
            }

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewPosition);

                // Fresnel effect
                float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 3.0);

                // Frost pattern: noise-based patches spreading from edges inward.
                // NOT Voronoi cells — frost forms as organic crystalline coating.
                // Fresnel drives where frost appears: thick at edges, thin at face-on.
                float frostMask = 0.0;
                if (uFrostAmount > 0.01) {
                    // Fresnel-driven spread: frost creeps inward from silhouette edges
                    float edgeness = pow(1.0 - abs(dot(normal, viewDir)), 1.5);

                    // Multi-scale noise for organic frost texture
                    float frostNoise = fbm3(vec3(vUv * 6.0, 0.0));
                    float fineNoise = noise(vec3(vUv * 18.0, 0.5));

                    // Frost threshold: edges always frosted, interior only where noise peaks
                    // edgeness=1 → frost everywhere, edgeness=0 → only noise peaks > 0.65
                    float frostThreshold = mix(0.65, 0.0, edgeness);
                    float frost = smoothstep(frostThreshold, frostThreshold + 0.15, frostNoise);

                    // Fine detail within frost patches
                    frost += fineNoise * 0.2 * frost;

                    frostMask = frost * uFrostAmount;
                }

                // Crack pattern: thin bright lines using noise gradient magnitude
                float crackIntensity = 0.0;
                if (uInternalCracks > 0.01) {
                    float crackNoise = fbm3(vec3(vUv * 4.0 + 0.5, 0.3));
                    // High-frequency detail for crack sharpness
                    float crackDetail = noise(vec3(vUv * 12.0, 0.7));
                    // Isolines: thin bright bands where noise crosses thresholds
                    float crack1 = 1.0 - smoothstep(0.0, 0.02, abs(crackNoise - 0.4));
                    float crack2 = 1.0 - smoothstep(0.0, 0.015, abs(crackNoise - 0.6));
                    crackIntensity = max(crack1, crack2 * 0.7) * uInternalCracks;
                    crackIntensity *= crackDetail * 0.5 + 0.5; // Detail variation
                }

                float alpha;
                vec3 finalColor;

                if (uOverlay > 0.5) {
                    // OVERLAY MODE: Sparse highlights via additive blending
                    // Only show frost patches, crack edges, and fresnel rim
                    // No uniform wash - geometry-independent appearance

                    // Fresnel gives strong rim/edge highlights
                    float rimAlpha = pow(fresnel, 2.0) * 0.7;

                    // Frost patches give bright frost sparkle
                    float frostAlpha = frostMask * 0.5;

                    // Crack edges give subtle structure
                    float crackAlpha = crackIntensity * 0.3;

                    // Combine
                    alpha = rimAlpha + frostAlpha + crackAlpha;

                    // Color: cold blue for ice lines, not white
                    finalColor = mix(uColor, vec3(0.4, 0.6, 0.85), fresnel * 0.6);
                    finalColor += vec3(0.1, 0.18, 0.35) * frostMask;
                    finalColor += vec3(0.05, 0.08, 0.15) * crackIntensity;

                    // Discard near-invisible pixels to avoid uniform wash
                    if (alpha < 0.05) discard;

                    // Clamp below bloom threshold
                    finalColor = min(finalColor, vec3(0.78));
                    alpha = clamp(alpha, 0.0, 0.7);
                } else {
                    // STANDALONE MODE: Full opaque ice material
                    finalColor = uColor;

                    // Frost patches whiten the surface
                    vec3 frostWhite = vec3(0.6, 0.72, 0.82);
                    finalColor = mix(finalColor, frostWhite, frostMask * 0.5);

                    // Cracks brighten along fracture lines
                    vec3 crackColor = uColor * 0.3;
                    finalColor = mix(finalColor, crackColor, crackIntensity * 0.55);

                    // Subsurface scattering
                    vec3 scatterColor = vec3(0.4, 0.6, 0.8);
                    float scatter = uSubsurfaceScatter * (1.0 - abs(dot(normal, viewDir)));
                    finalColor = mix(finalColor, scatterColor, scatter * 0.25);

                    // Specular highlights
                    float specPower = mix(64.0, 16.0, uMelt);
                    float spec = pow(max(dot(reflect(-viewDir, normal), vec3(0.5, 1.0, 0.5)), 0.0), specPower);
                    vec3 specColor = vec3(0.6, 0.72, 0.85);
                    finalColor = mix(finalColor, specColor, spec * (1.0 - uRoughness) * 0.35);

                    // Fresnel rim
                    vec3 rimColor = vec3(0.5, 0.65, 0.82);
                    finalColor = mix(finalColor, rimColor, fresnel * 0.3);

                    // Clamp below bloom threshold
                    finalColor = min(finalColor, vec3(0.78));

                    float baseAlpha = uOpacity * 0.85;
                    float fresnelAlpha = fresnel * 0.3;
                    alpha = clamp(baseAlpha + fresnelAlpha, 0.5, 0.95);
                }

                gl_FragColor = vec4(finalColor, alpha);
            }
        `,

        transparent: true,
        side: THREE.DoubleSide,
        blending: overlay ? THREE.AdditiveBlending : THREE.NormalBlending,
        depthWrite: overlay ? false : true
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
