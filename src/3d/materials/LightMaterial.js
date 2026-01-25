/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Light Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Standalone light/holy material with radiance effects
 * @author Emotive Engine Team
 * @module materials/LightMaterial
 *
 * ## Master Parameter: radiance (0-1)
 *
 * | Radiance | Visual                    | Effect              | Example       |
 * |----------|---------------------------|---------------------|---------------|
 * | 0.0      | Soft warm glow            | Gentle warmth       | Candlelight   |
 * | 0.5      | Golden rays emanating     | Purifying presence  | Divine light  |
 * | 1.0      | Blinding brilliance       | Overwhelming purity | Ascension     |
 *
 * Light is the opposite of void - it ADDS brightness rather than absorbing it.
 */

import * as THREE from 'three';

function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Create a light material with radiance-driven appearance
 *
 * @param {Object} options
 * @param {number} [options.radiance=0.5] - Master parameter (0=glow, 0.5=divine, 1=blinding)
 * @param {string} [options.hue='golden'] - 'golden', 'white', or 'prismatic'
 * @param {number} [options.opacity=0.8] - Base opacity
 * @returns {THREE.ShaderMaterial}
 */
export function createLightMaterial(options = {}) {
    const {
        radiance = 0.5,
        hue = 'golden',
        opacity = 0.8
    } = options;

    // Derive properties from radiance
    const brightness = lerp(0.4, 1.5, radiance);
    const rayCount = Math.floor(lerp(4, 12, radiance));
    const rayLength = lerp(0.2, 0.8, radiance);
    const pulseSpeed = lerp(1.0, 3.0, radiance);
    const coreIntensity = lerp(0.5, 1.0, radiance);
    const bloomStrength = lerp(0.2, 0.8, radiance);

    // Map hue to uniform value
    const hueType = { golden: 0, white: 1, prismatic: 2 }[hue] || 0;

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uRadiance: { value: radiance },
            uBrightness: { value: brightness },
            uRayCount: { value: rayCount },
            uRayLength: { value: rayLength },
            uPulseSpeed: { value: pulseSpeed },
            uCoreIntensity: { value: coreIntensity },
            uBloomStrength: { value: bloomStrength },
            uHueType: { value: hueType },
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
            uniform float uRadiance;
            uniform float uBrightness;
            uniform float uRayCount;
            uniform float uRayLength;
            uniform float uPulseSpeed;
            uniform float uCoreIntensity;
            uniform float uBloomStrength;
            uniform int uHueType;
            uniform float uOpacity;
            uniform float uTime;

            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            varying vec2 vUv;

            // Hash function
            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
            }

            // Soft noise
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

            // Light rays pattern
            float rays(vec2 uv, float count, float time) {
                vec2 centered = uv - 0.5;
                float angle = atan(centered.y, centered.x);
                float dist = length(centered);

                // Rotating rays
                float rayAngle = angle + time * 0.2;
                float ray = sin(rayAngle * count) * 0.5 + 0.5;
                ray = pow(ray, 3.0);

                // Fade rays with distance
                float rayFade = smoothstep(0.5, 0.1, dist);

                return ray * rayFade;
            }

            // Sparkle effect
            float sparkle(vec2 uv, float time) {
                float n = noise(uv * 20.0 + time);
                return pow(n, 8.0) * 2.0;
            }

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewPosition);

                vec2 centeredUv = vUv * 2.0 - 1.0;
                float distFromCenter = length(centeredUv);

                // === BASE LIGHT COLOR ===
                vec3 lightColor;
                if (uHueType == 0) {
                    // Golden - warm divine light
                    lightColor = vec3(1.0, 0.85, 0.4);
                } else if (uHueType == 1) {
                    // White - pure holy light
                    lightColor = vec3(1.0, 0.98, 0.95);
                } else {
                    // Prismatic - rainbow shifting
                    float hueShift = uTime * 0.5 + distFromCenter * 2.0;
                    lightColor = vec3(
                        sin(hueShift) * 0.3 + 0.7,
                        sin(hueShift + 2.094) * 0.3 + 0.7,
                        sin(hueShift + 4.189) * 0.3 + 0.7
                    );
                }

                // === CORE GLOW ===
                float coreGlow = 1.0 - smoothstep(0.0, 0.5, distFromCenter);
                coreGlow = pow(coreGlow, 1.5) * uCoreIntensity;

                // === LIGHT RAYS ===
                float rayPattern = rays(vUv, uRayCount, uTime);
                float rayMask = smoothstep(0.0, uRayLength, distFromCenter) *
                               (1.0 - smoothstep(uRayLength, uRayLength + 0.3, distFromCenter));
                float lightRays = rayPattern * rayMask * uRadiance;

                // === PULSE EFFECT ===
                float pulse = sin(uTime * uPulseSpeed) * 0.15 + 1.0;

                // === BLOOM/HALO ===
                float bloom = 1.0 - smoothstep(0.3, 0.9, distFromCenter);
                bloom = pow(bloom, 2.0) * uBloomStrength;

                // === SPARKLES ===
                float sparkles = sparkle(vUv, uTime) * uRadiance * 0.5;

                // === FRESNEL RIM ===
                float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.0);

                // === COMBINE ===
                float intensity = (coreGlow + lightRays + bloom + sparkles) * pulse * uBrightness;
                intensity += fresnel * 0.3 * uRadiance;

                vec3 finalColor = lightColor * intensity;

                // Additive bloom effect - brighten beyond 1.0
                finalColor = min(finalColor * 1.5, vec3(2.0));

                // Alpha - light is semi-transparent but additive
                float alpha = uOpacity * min(1.0, intensity);
                alpha = max(alpha, coreGlow * 0.5);

                // Edge softness
                float edgeFade = 1.0 - smoothstep(0.8, 1.0, distFromCenter);
                alpha *= edgeFade;

                if (alpha < 0.01) discard;

                gl_FragColor = vec4(finalColor, alpha);
            }
        `,

        transparent: true,
        blending: THREE.NormalBlending,
        depthWrite: false,
        side: THREE.DoubleSide
    });

    material.userData.radiance = radiance;
    material.userData.hue = hue;
    material.userData.elementalType = 'light';

    return material;
}

/**
 * Update light material animation
 */
export function updateLightMaterial(material, deltaTime) {
    if (material?.uniforms?.uTime) {
        material.uniforms.uTime.value += deltaTime;
    }
}

/**
 * Get physics configuration for light element
 */
export function getLightPhysics(radiance = 0.5) {
    return {
        gravity: lerp(0.5, -0.2, radiance),    // Light floats upward at high radiance
        drag: lerp(0.1, 0.3, radiance),
        bounce: 0.0,
        disperseOverTime: true,
        lifetime: lerp(1.5, 3.0, radiance),
        emitLight: true,
        lightIntensity: radiance,
        purifyNearby: radiance > 0.6          // High radiance cleanses void
    };
}

export default {
    createLightMaterial,
    updateLightMaterial,
    getLightPhysics
};
