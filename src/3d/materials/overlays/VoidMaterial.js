/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Void Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Standalone void material — event horizon overlay for mascot mesh
 * @author Emotive Engine Team
 * @module materials/VoidMaterial
 *
 * ## Master Parameters
 *
 * depth (0-1): Controls maximum consumption coverage
 *   0.0 = Faint edge darkening | 0.5 = Partial consumption | 1.0 = Near-total absorption
 *
 * progress (0-1): Gesture progress drives the SPREAD of darkness over time
 *   0.0 = Darkness just beginning to creep from edges
 *   1.0 = Full depth-dependent consumption achieved
 *
 * Consuming darkness: void creeps from the silhouette edges inward using
 * multi-scale FBM noise on object-space position. Fine tendrils reach ahead
 * of the main consumption front. A thin warm emission rim marks the boundary
 * where void meets normal surface. Consumed areas are absolute black.
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
 * Create a void material with consuming darkness effect
 *
 * @param {Object} options
 * @param {number} [options.depth=0.5] - Max consumption coverage (0=faint, 1=near-total)
 * @param {number} [options.opacity=0.9] - Base opacity
 * @returns {THREE.ShaderMaterial}
 */
export function createVoidMaterial(options = {}) {
    const { depth = 0.5, opacity = 0.9 } = options;

    const pulseSpeed = lerp(0.5, 1.5, depth);

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uDepth: { value: depth },
            uProgress: { value: 0 },
            uPulseSpeed: { value: pulseSpeed },
            uOpacity: { value: opacity },
            uTime: { value: 0 },
        },

        vertexShader: /* glsl */ `
            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec3 vViewPosition;

            void main() {
                vPosition = position;
                vNormal = normalMatrix * normal;

                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;

                gl_Position = projectionMatrix * mvPosition;
            }
        `,

        fragmentShader: /* glsl */ `
            uniform float uDepth;
            uniform float uProgress;
            uniform float uPulseSpeed;
            uniform float uOpacity;
            uniform float uTime;

            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec3 vViewPosition;

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
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewPosition);
                float NdotV = abs(dot(normal, viewDir));
                float edgeness = 1.0 - NdotV;

                // ═══ CONSUMPTION FIELD ═══
                // Object-space position projected to 2D for consistent pattern
                vec2 pos = vPosition.xz * 2.5 + vec2(vPosition.y * 0.8, -vPosition.y * 0.6);

                // 3-octave FBM — organic creeping consumption boundary
                float n1 = noise(pos * 1.5 + uTime * 0.08);          // Large-scale (slow drift)
                float n2 = noise(pos * 4.0 - uTime * 0.12);          // Medium (counter-drift)
                float n3 = noise(pos * 9.0 + uTime * 0.18);          // Fine detail (faster)
                float consumeField = n1 * 0.50 + n2 * 0.30 + n3 * 0.20;

                // Fresnel bias: darkness creeps from silhouette edges inward
                consumeField += edgeness * 0.20;

                // ═══ DISSOLVE IN ═══
                // Smooth opacity ramp over first 20% — darkness materializes gradually
                float dissolveIn = smoothstep(0.0, 0.20, uProgress);

                // ═══ PROGRESS-DRIVEN THRESHOLD ═══
                // Progress ramps the consumption from nothing → full depth-dependent coverage
                float progressRamp = smoothstep(0.05, 0.8, uProgress);

                // At progress=0: threshold=0.95 (nearly nothing consumed)
                // At progress=1: threshold based on depth (0.85 at low, 0.15 at high)
                float targetThreshold = mix(0.85, 0.15, uDepth);
                float threshold = mix(0.95, targetThreshold, progressRamp);

                // Sharp consumption boundary (0.05 transition — defined edge, not gaussian)
                float consumed = smoothstep(threshold, threshold - 0.05, consumeField);

                // ═══ TENDRILS ═══
                // Fine dark tendrils reaching AHEAD of the main consumption front
                float tendrilField = noise(pos * 8.0 + uTime * 0.22) * 0.6
                                   + noise(pos * 14.0 - uTime * 0.14) * 0.4;
                // Tendrils extend slightly past the main threshold
                float tendrilThreshold = threshold + 0.10;
                float tendrils = smoothstep(tendrilThreshold, tendrilThreshold - 0.03,
                                            tendrilField + edgeness * 0.12);
                // Thinner than full consumption, only visible at moderate+ depth
                tendrils *= 0.5 * smoothstep(0.0, 0.4, uDepth * progressRamp);

                float darkness = max(consumed, tendrils);

                // ═══ VOID CURRENTS ═══
                // Inside consumed regions: subtle flowing noise prevents flat-black monotony.
                // Very dim near-black variations with faint violet tone — trapped light.
                float currentN1 = noise(pos * 3.0 + uTime * 0.25);
                float currentN2 = noise(pos * 6.0 - uTime * 0.18 + vec2(5.0, 3.0));
                float currentField = currentN1 * 0.6 + currentN2 * 0.4;
                // Flowing inward-like motion (modulated by edgeness)
                float currentIntensity = currentField * consumed * uDepth;
                // Deep violet-black — hint of trapped light, not flat black
                vec3 voidCurrentColor = vec3(0.012, 0.006, 0.022) * currentIntensity;

                // ═══ EDGE EMISSION ═══
                // Thin warm rim where void meets normal surface
                float edgeBand = smoothstep(threshold - 0.05, threshold - 0.01, consumeField)
                               * smoothstep(threshold + 0.03, threshold, consumeField);

                // Breathing pulse
                float pulse = 0.85 + 0.15 * sin(uTime * uPulseSpeed);
                edgeBand *= pulse;

                // Warm amber edge (redshifted photons at event horizon boundary)
                vec3 color = voidCurrentColor;
                color += vec3(0.85, 0.50, 0.18) * edgeBand * uDepth * 2.0;

                // ═══ ALPHA ═══
                float alpha = darkness * uOpacity * dissolveIn;

                // Edge emission always visible
                float edgeAlpha = edgeBand * uDepth * 0.5 * dissolveIn;
                alpha = max(alpha, edgeAlpha);

                // Very faint global darkening at high depth
                alpha = max(alpha, uDepth * progressRamp * 0.03 * dissolveIn);

                if (alpha < 0.01) discard;

                gl_FragColor = vec4(color, alpha);
            }
        `,

        transparent: true,
        blending: THREE.CustomBlending,
        blendEquation: THREE.AddEquation,
        blendSrc: THREE.SrcAlphaFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
        blendSrcAlpha: THREE.OneFactor,
        blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
        depthWrite: false,
        side: THREE.DoubleSide,
    });

    // Store parameters for external access
    material.userData.depth = depth;
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
        gravity: lerp(0.0, 0.3, depth),
        drag: lerp(0.2, 0.0, depth),
        bounce: 0.0,
        gravityWell: depth > 0.7,
        gravityWellStrength: depth > 0.7 ? lerp(0, 2.0, (depth - 0.7) / 0.3) : 0,
        disperseOverTime: depth < 0.3,
        lifetime: lerp(2.0, 999.0, depth),
        absorbLight: true,
        corruptNearby: depth > 0.6,
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
        color: 0x000000,
        emissive: lerp(-0.5, -2.0, depth),
        animated: true,
        pattern: 'veins',
        spreadOverTime: depth > 0.5,
        corruptNearby: depth > 0.7,
    };
}

export default {
    createVoidMaterial,
    updateVoidMaterial,
    getVoidPhysics,
    getVoidCrackStyle,
};
