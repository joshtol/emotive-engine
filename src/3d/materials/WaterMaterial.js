/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Water Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Standalone water material with viscosity-driven behavior
 * @author Emotive Engine Team
 * @module materials/WaterMaterial
 *
 * ## Master Parameter: viscosity (0-1)
 *
 * | Viscosity | Visual                    | Physics           | Example |
 * |-----------|---------------------------|-------------------|---------|
 * | 0.0       | High refraction, beads    | Fast, high tension| Mercury |
 * | 0.3       | Clear, fast wobble        | Free flowing      | Water   |
 * | 0.7       | Slow wobble, stretchy     | Sluggish, cohesive| Honey   |
 * | 1.0       | Damped wobble, holds shape| Nearly solid      | Jello   |
 *
 * ## Usage
 *
 * Standalone:
 *   const waterMesh = new THREE.Mesh(geometry, createWaterMaterial({ viscosity: 0.3 }));
 *
 * Shatter system:
 *   shatterSystem.shatter(mesh, dir, { elemental: 'water', elementalParam: 0.3 });
 */

import * as THREE from 'three';

/**
 * Interpolate between values based on parameter
 */
function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Interpolate between three values
 */
function lerp3(low, mid, high, t) {
    if (t < 0.5) {
        return low + (mid - low) * (t * 2);
    }
    return mid + (high - mid) * ((t - 0.5) * 2);
}

/**
 * Get water color based on viscosity
 * Mercury = silvery, Water = blue, Honey = amber, Jello = tinted
 */
function getWaterColor(viscosity, baseColor) {
    if (baseColor) return baseColor.clone();

    const color = new THREE.Color();

    if (viscosity < 0.15) {
        // Mercury - silvery metallic
        color.setRGB(0.85, 0.85, 0.9);
    } else if (viscosity < 0.5) {
        // Water - blue tint
        const t = (viscosity - 0.15) / 0.35;
        color.setRGB(
            lerp(0.85, 0.3, t),
            lerp(0.85, 0.5, t),
            lerp(0.9, 1.0, t)
        );
    } else if (viscosity < 0.8) {
        // Honey - amber
        const t = (viscosity - 0.5) / 0.3;
        color.setRGB(
            lerp(0.3, 0.9, t),
            lerp(0.5, 0.7, t),
            lerp(1.0, 0.2, t)
        );
    } else {
        // Jello - can be any color, default to blue-green
        color.setRGB(0.4, 0.8, 0.6);
    }

    return color;
}

/**
 * Create a water material with viscosity-driven appearance
 *
 * @param {Object} options
 * @param {number} [options.viscosity=0.3] - Master parameter (0=mercury, 0.3=water, 0.7=honey, 1=jello)
 * @param {THREE.Color} [options.color] - Override color (otherwise derived from viscosity)
 * @param {number} [options.clarity=0.9] - Clarity 0=murky, 1=crystal clear
 * @param {number} [options.opacity=0.85] - Base opacity
 * @returns {THREE.ShaderMaterial}
 */
export function createWaterMaterial(options = {}) {
    const {
        viscosity = 0.3,
        color = null,
        clarity = 0.9,
        opacity = 0.85,
        overlay = false  // When true, use additive blending for overlay effect
    } = options;

    // Derive properties from viscosity
    const waterColor = getWaterColor(viscosity, color);
    const wobbleSpeed = lerp(4.0, 0.3, viscosity);          // Mercury fast, jello slow
    const wobbleAmount = lerp(0.08, 0.15, viscosity);       // Jello wobbles more visibly
    const wobbleDamping = lerp(0.1, 0.9, viscosity);        // Jello damps fast
    const refractionStrength = lerp(0.3, 0.08, viscosity);  // Mercury high refraction
    const fresnelPower = lerp(2.0, 4.0, viscosity);         // Jello has softer fresnel
    const transmission = lerp(0.98, 0.75, viscosity) * clarity;
    const ior = lerp3(1.5, 1.33, 1.35, viscosity);          // Mercury, water, jello

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: waterColor },
            uTransmission: { value: transmission },
            uIOR: { value: ior },
            uWobbleSpeed: { value: wobbleSpeed },
            uWobbleAmount: { value: wobbleAmount },
            uWobbleDamping: { value: wobbleDamping },
            uRefractionStrength: { value: refractionStrength },
            uFresnelPower: { value: fresnelPower },
            uOpacity: { value: opacity },
            uTime: { value: 0 },
            uViscosity: { value: viscosity },
            uOverlay: { value: overlay ? 1.0 : 0.0 }
        },

        vertexShader: /* glsl */`
            uniform float uWobbleSpeed;
            uniform float uWobbleAmount;
            uniform float uTime;
            uniform float uViscosity;

            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            varying vec2 vUv;

            // Simple 3D noise for wobble
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

            void main() {
                vUv = uv;
                vNormal = normalMatrix * normal;

                // Wobble displacement - more for jello, faster for mercury/water
                vec3 pos = position;

                // Time-based wobble
                float wobbleTime = uTime * uWobbleSpeed;

                // Multiple octaves for organic feel
                float n1 = noise(pos * 3.0 + wobbleTime * 0.7);
                float n2 = noise(pos * 5.0 - wobbleTime * 1.1) * 0.5;
                float wobble = (n1 + n2) * uWobbleAmount;

                // Displace along normal
                pos += normal * wobble;

                // For jello: add a secondary slower "jiggle"
                if (uViscosity > 0.7) {
                    float jiggle = sin(wobbleTime * 0.5 + pos.y * 2.0) * 0.02;
                    pos += normal * jiggle;
                }

                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                vViewPosition = -mvPosition.xyz;
                vPosition = pos;

                gl_Position = projectionMatrix * mvPosition;
            }
        `,

        fragmentShader: /* glsl */`
            uniform vec3 uColor;
            uniform float uTransmission;
            uniform float uRefractionStrength;
            uniform float uFresnelPower;
            uniform float uOpacity;
            uniform float uViscosity;
            uniform float uTime;
            uniform float uOverlay;

            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            varying vec2 vUv;

            // Simple 3D noise for internal patterns
            float hash3(vec3 p) {
                return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
            }

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

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewPosition);

                // Fresnel effect - stronger rim highlighting for wet look
                float fresnel = pow(1.0 - abs(dot(normal, viewDir)), uFresnelPower);

                // Base color - ensure it's clearly blue for water
                vec3 baseColor = uColor;

                // Internal caustic patterns using 3D position (works on any geometry)
                float caustic1 = noise3D(vPosition * 8.0 + uTime * 0.5);
                float caustic2 = noise3D(vPosition * 12.0 - uTime * 0.3);
                float caustic3 = noise3D(vPosition * 4.0 + vec3(uTime * 0.2));
                float caustics = caustic1 * caustic2 + caustic3 * 0.3;

                // Moving light patterns inside the water
                float internalLight = caustics * (0.3 + (1.0 - uViscosity) * 0.4);

                // For water (low viscosity), add more caustic brightness
                if (uViscosity < 0.5) {
                    baseColor += vec3(0.1, 0.2, 0.3) * internalLight;
                }

                // Mercury gets bright specular highlights
                if (uViscosity < 0.15) {
                    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
                    float spec = pow(max(dot(reflect(-viewDir, normal), lightDir), 0.0), 64.0);
                    baseColor += vec3(1.0) * spec * 0.8;
                }

                // Strong rim glow for wet/liquid appearance
                vec3 rimColor = mix(baseColor * 1.8, vec3(0.6, 0.8, 1.0), 0.5);
                vec3 finalColor = mix(baseColor, rimColor, fresnel * 0.7);

                // Add subtle iridescence
                float iridescence = sin(dot(normal, viewDir) * 10.0 + uTime) * 0.1;
                finalColor += vec3(iridescence * 0.3, iridescence * 0.5, iridescence);

                // Ensure water is clearly visible - boost the blue
                finalColor = max(finalColor, baseColor * 0.5);

                float alpha;

                if (uOverlay > 0.5) {
                    // OVERLAY MODE: Only show rim highlights and caustic sparkles
                    // No uniform wash - sparse visibility like wet gleams

                    // Fresnel gives strong rim/edge highlights
                    float rimAlpha = pow(fresnel, 2.0) * 0.8;

                    // Caustics give internal sparkle points
                    float sparkle = max(0.0, caustics - 0.5) * 2.0;  // Only bright caustic peaks
                    float sparkleAlpha = sparkle * 0.4;

                    // Combine - primarily edges and sparkles
                    alpha = rimAlpha + sparkleAlpha;

                    // Brighten the color for additive blending
                    finalColor = mix(baseColor, vec3(0.6, 0.85, 1.0), fresnel * 0.6);
                    finalColor += vec3(0.2, 0.4, 0.6) * sparkle;

                    // Discard near-invisible pixels to avoid uniform wash
                    if (alpha < 0.05) discard;

                    alpha = clamp(alpha, 0.0, 0.7);
                } else {
                    // STANDALONE MODE: Full opaque water material
                    float baseAlpha = uOpacity * 0.85;
                    float fresnelAlpha = fresnel * 0.4;
                    alpha = baseAlpha + fresnelAlpha;
                    alpha = clamp(alpha, 0.5, 0.95);
                }

                gl_FragColor = vec4(finalColor, alpha);
            }
        `,

        transparent: true,
        side: THREE.DoubleSide,
        // Overlay mode: additive blending, no depth write (like electric overlay)
        blending: overlay ? THREE.AdditiveBlending : THREE.NormalBlending,
        depthWrite: overlay ? false : true
    });

    // Store parameters for external access
    material.userData.viscosity = viscosity;
    material.userData.elementalType = 'water';

    return material;
}

/**
 * Update water material animation
 * Call this each frame for animated water
 *
 * @param {THREE.ShaderMaterial} material - Water material to update
 * @param {number} deltaTime - Time since last frame in seconds
 */
export function updateWaterMaterial(material, deltaTime) {
    if (material?.uniforms?.uTime) {
        material.uniforms.uTime.value += deltaTime;
    }
}

/**
 * Get physics configuration for water element
 * Used by shatter system for shard behavior
 *
 * @param {number} viscosity - Viscosity parameter 0-1
 * @returns {Object} Physics configuration
 */
export function getWaterPhysics(viscosity = 0.3) {
    return {
        gravity: lerp(1.0, 0.5, viscosity),              // Jello falls slower
        bounce: lerp(0.7, 0.2, viscosity),               // Jello less bouncy
        drag: lerp(0.01, 0.2, viscosity),                // Jello high drag
        cohesion: lerp3(0.8, 0.2, 0.7, viscosity),       // Mercury/jello high, water low
        spreadOnImpact: lerp(0.3, 0.1, viscosity),       // Jello splats less
        surfaceTension: lerp3(0.9, 0.3, 0.6, viscosity), // Mercury high, water low, jello medium
        wobbleOnMove: true,
        mergeOnContact: viscosity < 0.6                   // Water/mercury merge, honey/jello don't
    };
}

/**
 * Get crack style for water element
 * Used by crack system for elemental crack appearance
 *
 * @param {number} viscosity - Viscosity parameter 0-1
 * @returns {Object} Crack style configuration
 */
export function getWaterCrackStyle(viscosity = 0.3) {
    // Water cracks are subtle - more like wet seeping lines
    // High viscosity (jello) = more visible cracks

    let color;
    if (viscosity < 0.15) {
        color = 0xaaddff;  // Mercury - silvery
    } else if (viscosity < 0.6) {
        color = 0x4488ff;  // Water - blue
    } else {
        color = 0x88ffaa;  // Jello - tinted
    }

    return {
        color,
        emissive: lerp(0.3, 0.05, viscosity),
        animated: viscosity < 0.5,  // Only low viscosity ripples
        pattern: viscosity > 0.7 ? 'crystalline' : 'organic'
    };
}

export default {
    createWaterMaterial,
    updateWaterMaterial,
    getWaterPhysics,
    getWaterCrackStyle
};
