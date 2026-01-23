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
 * ## Overlay Categories
 *
 * | Category  | Visual Effect                | Blend Mode |
 * |-----------|------------------------------|------------|
 * | emanating | Rising wisps, edge glow      | Additive   |
 * | afflicted | Surrounding swirl, darkening | Multiply   |
 *
 * ## Usage
 *
 * Standalone:
 *   const smokeMesh = new THREE.Mesh(geometry, createSmokeMaterial({ density: 0.5 }));
 *
 * Overlay (emanating - source of smoke):
 *   createSmokeMaterial({ overlay: true, category: 'emanating', tint: [0.8, 0.8, 0.8] });
 *
 * Overlay (afflicted - victim of smoke):
 *   createSmokeMaterial({ overlay: true, category: 'afflicted', swirl: 0.5 });
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
 * @param {boolean} [options.overlay=false] - Use sparse overlay mode for effect gestures
 * @param {string} [options.category='emanating'] - 'emanating' (source) or 'afflicted' (victim)
 * @param {Array} [options.tint] - RGB tint multiplier [r, g, b] for colored smoke
 * @param {Array} [options.windDir] - Wind direction [x, z] for drift
 * @param {number} [options.swirl=0] - Swirl/vortex intensity (0-1)
 * @returns {THREE.ShaderMaterial}
 */
export function createSmokeMaterial(options = {}) {
    const {
        density = 0.5,
        color = null,
        opacity = null,
        additive = false,
        overlay = false,
        category = 'emanating',  // 'emanating' or 'afflicted'
        tint = [1.0, 1.0, 1.0],  // RGB tint multiplier
        windDir = [0.0, 0.0],    // Wind direction [x, z]
        swirl = 0.0              // Swirl intensity (0-1)
    } = options;

    // Derive properties from density
    const smokeColor = getSmokeColor(density, color);
    const smokeOpacity = opacity ?? lerp(0.4, 0.85, density);
    const softness = lerp(0.9, 0.3, density);
    const noiseScale = lerp(3.0, 1.0, density);
    const riseSpeed = lerp(1.5, 0.3, density);
    const disperseRate = lerp(0.4, 0.05, density);
    const turbulence = lerp(0.8, 0.3, density);
    const billboardSpin = lerp(2.0, 0.3, density);

    // Category flag: 0 = emanating (source), 1 = afflicted (victim)
    const categoryValue = category === 'afflicted' ? 1.0 : 0.0;

    // Afflicted mode uses normal blending to darken, emanating uses additive
    const isAfflicted = category === 'afflicted';
    const blendMode = overlay
        ? (isAfflicted ? THREE.NormalBlending : THREE.AdditiveBlending)
        : (additive ? THREE.AdditiveBlending : THREE.NormalBlending);

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
            uLifetime: { value: 1.0 },
            uOverlay: { value: overlay ? 1.0 : 0.0 },
            // New uniforms
            uCategory: { value: categoryValue },  // 0=emanating, 1=afflicted
            uTint: { value: new THREE.Vector3(tint[0], tint[1], tint[2]) },
            uWindDir: { value: new THREE.Vector2(windDir[0], windDir[1]) },
            uSwirl: { value: swirl }
        },

        vertexShader: /* glsl */`
            uniform float uRiseSpeed;
            uniform float uTurbulence;
            uniform float uTime;
            uniform float uLifetime;

            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec3 vViewDir;
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

                // World space for view direction calculation
                vec4 worldPos = modelMatrix * vec4(position, 1.0);
                vViewDir = normalize(cameraPosition - worldPos.xyz);

                // Normal in world space
                vNormal = normalize(mat3(modelMatrix) * normal);

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
            uniform float uOverlay;
            uniform float uCategory;
            uniform vec3 uTint;
            uniform vec2 uWindDir;
            uniform float uSwirl;

            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec3 vViewDir;
            varying vec2 vUv;
            varying float vDepth;

            // ═══════════════════════════════════════════════════════════════
            // NOISE FUNCTIONS
            // ═══════════════════════════════════════════════════════════════
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

            float fbm3D(vec3 p) {
                float value = 0.0;
                float amplitude = 0.5;
                // 5 octaves for smoother, more organic noise
                for (int i = 0; i < 5; i++) {
                    value += amplitude * noise3D(p);
                    p *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }

            // ═══════════════════════════════════════════════════════════════
            // SWIRL DISTORTION
            // ═══════════════════════════════════════════════════════════════
            vec3 applySwirl(vec3 pos, float intensity, float time) {
                if (intensity < 0.01) return pos;

                // Distance from vertical axis
                float dist = length(pos.xz);
                // Angle based on height and time
                float angle = intensity * (pos.y * 3.0 + time * 0.5) * 2.0;

                // Rotate around Y axis
                float c = cos(angle);
                float s = sin(angle);
                return vec3(
                    pos.x * c - pos.z * s,
                    pos.y,
                    pos.x * s + pos.z * c
                );
            }

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewDir);

                // ═══════════════════════════════════════════════════════════════
                // FRESNEL - Proper rim detection
                // ═══════════════════════════════════════════════════════════════
                float fresnel = 1.0 - abs(dot(normal, viewDir));
                fresnel = pow(fresnel, 2.0);

                // ═══════════════════════════════════════════════════════════════
                // BASE SMOKE PATTERN (standalone mode)
                // ═══════════════════════════════════════════════════════════════
                vec3 noisePos = vPosition * uNoiseScale + vec3(0.0, uTime * 0.2, 0.0);
                float smoke = fbm3D(noisePos);

                vec3 swirl = vPosition * uNoiseScale * 1.5 + vec3(uTime * 0.1, 0.0, uTime * 0.15);
                float swirls = fbm3D(swirl) * 0.5;
                smoke = smoke + swirls;

                smoke = mix(smoke, 0.7, uDensity * 0.6);

                float distFromCenter = length(vPosition);
                float edgeFade = 1.0 - smoothstep(0.3, 0.8, distFromCenter * (1.0 - uSoftness));
                float disperseFade = mix(1.0, 0.3, (1.0 - uLifetime) * uDisperseRate);

                // Apply tint to base color
                vec3 smokeColor = uColor * uTint;
                float alpha;

                if (uOverlay > 0.5) {
                    bool isAfflicted = uCategory > 0.5;

                    // ═══════════════════════════════════════════════════════════════
                    // WIND DIRECTION
                    // ═══════════════════════════════════════════════════════════════
                    vec3 windOffset = vec3(
                        uWindDir.x * uTime * 0.8,
                        isAfflicted ? 0.0 : -uTime * 1.5,  // Afflicted: no rise, Emanating: rise
                        uWindDir.y * uTime * 0.8
                    );

                    // ═══════════════════════════════════════════════════════════════
                    // SWIRL DISTORTION
                    // ═══════════════════════════════════════════════════════════════
                    vec3 swirlPos = applySwirl(vPosition, uSwirl, uTime);

                    if (isAfflicted) {
                        // ═══════════════════════════════════════════════════════════════
                        // AFFLICTED MODE: Surrounding, obscuring, darkening
                        // Uses FBM for smooth organic smoke (no angular N64 look)
                        // ═══════════════════════════════════════════════════════════════

                        // Layer 1: Large swirling clouds (low frequency, smooth)
                        vec3 cloudPos = swirlPos * 2.5 + windOffset * 0.5;
                        float clouds = fbm3D(cloudPos);
                        float cloudAlpha = smoothstep(0.25, 0.65, clouds);

                        // Layer 2: Medium wisps (flowing motion)
                        vec3 wispPos = swirlPos * 4.0 + windOffset + vec3(uTime * 0.15, 0.0, uTime * 0.12);
                        float wisps = fbm3D(wispPos);
                        float wispAlpha = smoothstep(0.3, 0.7, wisps) * 0.7;

                        // Layer 3: Fine detail tendrils (high frequency, subtle)
                        vec3 detailPos = swirlPos * 7.0 + windOffset * 1.5 + vec3(uTime * 0.25, uTime * 0.1, uTime * 0.2);
                        float detail = fbm3D(detailPos);
                        float detailAlpha = smoothstep(0.35, 0.75, detail) * 0.4;

                        // Layer 4: Micro turbulence (adds organic texture)
                        vec3 microPos = swirlPos * 12.0 + windOffset * 2.0 + vec3(uTime * 0.4, 0.0, uTime * 0.35);
                        float micro = fbm3D(microPos);
                        float microAlpha = smoothstep(0.4, 0.8, micro) * 0.25;

                        // Edge wisps using fresnel - smoke at silhouette (softened)
                        float edgeWisp = pow(fresnel, 1.5) * 0.45 * (0.5 + uDensity * 0.5);

                        // Soft inner glow (distance from center)
                        float distFromCenter = length(vPosition.xz);
                        float innerGlow = smoothstep(0.6, 0.1, distFromCenter) * 0.2;

                        // Combine all layers with soft blending
                        alpha = cloudAlpha * 0.5 + wispAlpha + detailAlpha + microAlpha + edgeWisp + innerGlow;

                        // Apply density - denser = more visible
                        alpha *= (0.35 + uDensity * 0.65);

                        // Darken color for obscuring effect (smoother gradient)
                        float darkness = 0.4 + (1.0 - alpha * 0.7) * 0.6;
                        smokeColor = smokeColor * darkness * 0.75;

                        // Very soft discard threshold
                        if (alpha < 0.02) discard;

                        // Clamp - afflicted can be more opaque to obscure
                        alpha = clamp(alpha, 0.0, 0.7);

                    } else {
                        // ═══════════════════════════════════════════════════════════════
                        // EMANATING MODE: Rising wisps, edge glow
                        // Uses FBM for smooth organic smoke
                        // ═══════════════════════════════════════════════════════════════

                        // Height bias - smoke rises, stronger at top
                        float height = (vPosition.y + 0.5);
                        float topBias = 0.5 + height * 0.5;

                        // Layer 1: Large billowing clouds (low frequency)
                        vec3 cloudPos = swirlPos * 2.0 + windOffset * 0.6;
                        float clouds = fbm3D(cloudPos);
                        float cloudAlpha = smoothstep(0.3, 0.65, clouds) * topBias * 0.5;

                        // Layer 2: Rising wisp pattern (medium frequency)
                        vec3 wispPos = swirlPos * 4.0 + windOffset;
                        float wisp = fbm3D(wispPos);
                        float wispAlpha = smoothstep(0.35, 0.7, wisp) * topBias;

                        // Layer 3: Detail wisps (higher frequency)
                        vec3 detailPos = swirlPos * 7.0 + windOffset * 1.3 + vec3(uTime * 0.2, 0.0, uTime * 0.15);
                        float detail = fbm3D(detailPos);
                        float detailAlpha = smoothstep(0.4, 0.75, detail) * 0.45 * topBias;

                        // Layer 4: Fine tendrils (high frequency, subtle)
                        vec3 tendrilPos = swirlPos * 10.0 + windOffset * 1.8 + vec3(uTime * 0.35, uTime * 0.1, uTime * 0.25);
                        float tendril = fbm3D(tendrilPos);
                        float tendrilAlpha = smoothstep(0.45, 0.8, tendril) * 0.25 * topBias;

                        // Edge wisps using proper fresnel - smoke curls at rim (softened)
                        float edgeWisp = pow(fresnel, 1.5) * 0.35 * topBias * (0.5 + uDensity * 0.5);

                        // Combine all layers
                        alpha = cloudAlpha + wispAlpha + detailAlpha + tendrilAlpha + edgeWisp;

                        // Apply density
                        alpha *= (0.45 + uDensity * 0.55);

                        // Brighten at wisp peaks (smooth)
                        float brightness = 0.85 + wisp * 0.3;
                        smokeColor = smokeColor * brightness;

                        // Soft discard
                        if (alpha < 0.03) discard;

                        // Clamp
                        alpha = clamp(alpha, 0.0, 0.55);
                    }

                } else {
                    // ═══════════════════════════════════════════════════════════════
                    // STANDALONE MODE: Full volumetric smoke
                    // ═══════════════════════════════════════════════════════════════

                    float baseAlpha = uOpacity * smoke * edgeFade * disperseFade * uLifetime;
                    alpha = max(baseAlpha, uOpacity * 0.3 * uLifetime);
                    alpha = clamp(alpha, 0.0, uOpacity);

                    if (alpha < 0.02) discard;

                    smokeColor = mix(smokeColor, smokeColor * 1.2, smoke * 0.3);
                }

                gl_FragColor = vec4(smokeColor, alpha);
            }
        `,

        transparent: true,
        blending: blendMode,
        depthWrite: false,
        side: THREE.DoubleSide
    });

    // Store parameters for external access
    material.userData.density = density;
    material.userData.elementalType = 'smoke';
    material.userData.category = category;

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
        gravity: lerp(-0.4, -0.05, density),
        drag: lerp(0.05, 0.3, density),
        bounce: 0.0,
        disperseOverTime: true,
        disperseRate: lerp(0.4, 0.05, density),
        billboardRotation: lerp(2.0, 0.3, density),
        fadeOut: true,
        lifetime: lerp(1.5, 4.0, density)
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
    return {
        color: 0x444444,
        emissive: 0.0,
        animated: true,
        pattern: 'wispy',
        emitParticles: density > 0.3
    };
}

export default {
    createSmokeMaterial,
    updateSmokeMaterial,
    setSmokeMaterialLifetime,
    getSmokePhysics,
    getSmokeCrackStyle
};
