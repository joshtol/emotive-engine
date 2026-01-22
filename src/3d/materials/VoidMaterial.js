/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Void Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Standalone void/shadow material with depth-driven behavior
 * @author Emotive Engine Team
 * @module materials/VoidMaterial
 *
 * ## Master Parameter: depth (0-1)
 *
 * | Depth | Visual                     | Physics                | Example      |
 * |-------|----------------------------|------------------------|--------------|
 * | 0.0   | Wispy shadows              | Floats, disperses      | Shadow wisp  |
 * | 0.5   | Dark mass with halo        | Hovers, slight pull    | Dark entity  |
 * | 1.0   | Pure black, light absorbing| Strong gravity well    | Black hole   |
 *
 * Void is unique - it ABSORBS light rather than emitting it.
 * The opposite of fire/bloom.
 *
 * ## Usage
 *
 * Standalone:
 *   const voidMesh = new THREE.Mesh(geometry, createVoidMaterial({ depth: 0.7 }));
 *
 * Shatter system:
 *   shatterSystem.shatter(mesh, dir, { elemental: 'void', elementalParam: 0.6 });
 */

import * as THREE from 'three';

/**
 * Interpolate between values based on parameter
 */
function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Create a void material with depth-driven appearance
 *
 * @param {Object} options
 * @param {number} [options.depth=0.5] - Master parameter (0=wispy, 0.5=dark mass, 1=black hole)
 * @param {string} [options.innerPattern='swirl'] - 'solid', 'swirl', or 'cosmic'
 * @param {number} [options.opacity=0.9] - Base opacity
 * @returns {THREE.ShaderMaterial}
 */
export function createVoidMaterial(options = {}) {
    const {
        depth = 0.5,
        innerPattern = 'swirl',
        opacity = 0.9
    } = options;

    // Derive properties from depth
    const coreOpacity = lerp(0.3, 1.0, depth);
    const edgeWispiness = lerp(0.9, 0.0, depth);          // Wispy → solid edge
    const lightAbsorption = lerp(0.2, 1.0, depth);        // How much it darkens
    const innerSwirlSpeed = innerPattern === 'swirl' ? lerp(0.3, 1.5, depth) : 0;
    const cosmicStars = innerPattern === 'cosmic' ? Math.floor(lerp(10, 200, depth)) : 0;
    const pulseSpeed = lerp(0.5, 2.0, depth);
    const distortionStrength = lerp(0.0, 0.15, depth);    // Edge distortion

    // Map pattern to uniform value
    const patternType = { solid: 0, swirl: 1, cosmic: 2 }[innerPattern] || 0;

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uDepth: { value: depth },
            uCoreOpacity: { value: coreOpacity },
            uEdgeWispiness: { value: edgeWispiness },
            uLightAbsorption: { value: lightAbsorption },
            uInnerSwirlSpeed: { value: innerSwirlSpeed },
            uCosmicStars: { value: cosmicStars },
            uPatternType: { value: patternType },
            uPulseSpeed: { value: pulseSpeed },
            uDistortionStrength: { value: distortionStrength },
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
            uniform float uDepth;
            uniform float uCoreOpacity;
            uniform float uEdgeWispiness;
            uniform float uLightAbsorption;
            uniform float uInnerSwirlSpeed;
            uniform float uCosmicStars;
            uniform int uPatternType;
            uniform float uPulseSpeed;
            uniform float uDistortionStrength;
            uniform float uOpacity;
            uniform float uTime;

            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            varying vec2 vUv;

            // Hash functions
            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
            }

            float hash3(vec3 p) {
                p = fract(p * 0.3183099 + 0.1);
                p *= 17.0;
                return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
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

            // FBM for wispy tendrils
            float fbm(vec2 p) {
                float value = 0.0;
                float amplitude = 0.5;
                for (int i = 0; i < 5; i++) {
                    value += amplitude * noise(p);
                    p *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }

            // Swirl pattern for void interior
            float swirl(vec2 uv, float time) {
                vec2 centered = uv - 0.5;
                float dist = length(centered);
                float angle = atan(centered.y, centered.x);

                // Swirling motion
                angle += dist * 5.0 - time * uInnerSwirlSpeed;

                // Create spiral arms
                float spiral = sin(angle * 3.0 + dist * 10.0) * 0.5 + 0.5;
                spiral = pow(spiral, 2.0);

                // Fade toward center
                float centerFade = smoothstep(0.0, 0.3, dist);

                return spiral * centerFade * 0.5;
            }

            // Cosmic star field
            float stars(vec2 uv, float count) {
                float stars = 0.0;
                for (float i = 0.0; i < 50.0; i++) {
                    if (i >= count) break;

                    vec2 starPos = vec2(
                        hash(vec2(i * 13.0, 0.0)),
                        hash(vec2(0.0, i * 17.0))
                    );

                    float dist = length(uv - starPos);
                    float brightness = hash(vec2(i, i * 2.0));

                    // Twinkle
                    brightness *= 0.5 + 0.5 * sin(uTime * 2.0 + i * 1.7);

                    // Star glow
                    stars += smoothstep(0.02, 0.0, dist) * brightness;
                }
                return stars;
            }

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewPosition);

                // Center-based calculations
                vec2 centeredUv = vUv * 2.0 - 1.0;
                float distFromCenter = length(centeredUv);

                // === CORE DARKNESS ===
                // The core is pure black, getting darker with depth
                vec3 coreColor = vec3(0.0);

                // === INNER PATTERN ===
                float innerPattern = 0.0;
                vec3 innerColor = vec3(0.0);

                if (uPatternType == 1) {
                    // Swirl pattern
                    innerPattern = swirl(vUv, uTime);
                    // Deep purple hints in the swirl
                    innerColor = vec3(0.1, 0.0, 0.15) * innerPattern;
                } else if (uPatternType == 2) {
                    // Cosmic pattern - stars in the void
                    innerPattern = stars(vUv, uCosmicStars);
                    // Distant stars are white/blue
                    innerColor = vec3(0.8, 0.9, 1.0) * innerPattern * 0.3;
                }
                // Type 0 (solid) has no inner pattern

                // === EDGE TREATMENT ===
                // Wispy edges using noise
                float edgeNoise = fbm(vUv * 5.0 + uTime * 0.2);
                float wispyEdge = smoothstep(0.3 - uEdgeWispiness * 0.2, 0.8, distFromCenter + edgeNoise * uEdgeWispiness * 0.5);

                // Tendrils extending from edges
                float tendrilAngle = atan(centeredUv.y, centeredUv.x);
                float tendrils = sin(tendrilAngle * 8.0 + uTime * 0.5) * 0.5 + 0.5;
                tendrils = pow(tendrils, 4.0) * uEdgeWispiness;
                float tendrilDist = distFromCenter + tendrils * 0.2;

                // === PULSE/BREATHE EFFECT ===
                float pulse = sin(uTime * uPulseSpeed) * 0.05 + 1.0;

                // === COMBINE DARKNESS ===
                // Core darkness (black absorbing)
                float darkness = uCoreOpacity * (1.0 - wispyEdge * 0.5) * pulse;

                // Add inner pattern
                vec3 finalColor = mix(coreColor, innerColor, innerPattern);

                // === LIGHT ABSORPTION EFFECT ===
                // This is what makes void special - it REMOVES light
                // We use the alpha channel to indicate absorption
                // The renderer should treat high alpha as "subtract from background"

                // Dark halo around the void
                float halo = smoothstep(1.0, 0.5, distFromCenter) - smoothstep(0.5, 0.0, distFromCenter);
                halo *= uLightAbsorption * 0.3;

                // Final alpha represents "how much to darken"
                float alpha = darkness * uOpacity;

                // Edge fade for soft integration
                float edgeFade = 1.0 - smoothstep(0.7, 1.0, tendrilDist);
                alpha *= edgeFade;

                // Deep void is more opaque
                alpha = mix(alpha, min(1.0, alpha + 0.2), uDepth);

                if (alpha < 0.01) discard;

                // For subtractive effect: output dark color with high alpha
                // The blending mode will handle the actual subtraction
                gl_FragColor = vec4(finalColor, alpha);
            }
        `,

        transparent: true,
        // Custom blending for light absorption effect
        // This multiplies the destination by (1 - alpha), effectively darkening
        blending: THREE.CustomBlending,
        blendEquation: THREE.AddEquation,
        blendSrc: THREE.SrcAlphaFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
        blendSrcAlpha: THREE.OneFactor,
        blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
        depthWrite: false,
        side: THREE.DoubleSide
    });

    // Store parameters for external access
    material.userData.depth = depth;
    material.userData.innerPattern = innerPattern;
    material.userData.elementalType = 'void';

    return material;
}

/**
 * Update void material animation
 * Call this each frame for animated void
 *
 * @param {THREE.ShaderMaterial} material - Void material to update
 * @param {number} deltaTime - Time since last frame in seconds
 */
export function updateVoidMaterial(material, deltaTime) {
    if (material?.uniforms?.uTime) {
        material.uniforms.uTime.value += deltaTime;
    }
}

/**
 * Get physics configuration for void element
 * Used by shatter system for shard behavior
 *
 * @param {number} depth - Depth parameter 0-1
 * @returns {Object} Physics configuration
 */
export function getVoidPhysics(depth = 0.5) {
    return {
        gravity: lerp(0.0, 0.3, depth),                 // Deep void pulls things in
        drag: lerp(0.2, 0.0, depth),                    // Deep void has no resistance
        bounce: 0.0,
        gravityWell: depth > 0.7,                        // Pulls other objects toward it
        gravityWellStrength: depth > 0.7 ? lerp(0, 2.0, (depth - 0.7) / 0.3) : 0,
        disperseOverTime: depth < 0.3,                   // Wisps fade
        lifetime: lerp(2.0, 999.0, depth),              // Deep void persists
        absorbLight: true,
        corruptNearby: depth > 0.6                       // High depth corrupts nearby materials
    };
}

/**
 * Get crack style for void element
 * Used by crack system for elemental crack appearance
 *
 * @param {number} depth - Depth parameter 0-1
 * @returns {Object} Crack style configuration
 */
export function getVoidCrackStyle(depth = 0.5) {
    return {
        color: 0x000000,                                // Pure black
        emissive: lerp(-0.5, -2.0, depth),              // NEGATIVE emissive = absorbs light
        animated: true,
        pattern: 'veins',                                // Spreading tendril pattern
        spreadOverTime: depth > 0.5,                     // Deep void cracks grow
        corruptNearby: depth > 0.7                       // Adjacent cracks darken
    };
}

export default {
    createVoidMaterial,
    updateVoidMaterial,
    getVoidPhysics,
    getVoidCrackStyle
};
