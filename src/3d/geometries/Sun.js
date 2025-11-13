/**
 * Sun Geometry with NASA-Accurate Photosphere Characteristics
 *
 * Based on NASA Solar Dynamics Observatory (SDO) data and solar physics:
 *
 * PHOTOSPHERE CHARACTERISTICS (NASA):
 * - Temperature: 5,772 K (5,500°C / 10,000°F) - Official NASA effective temperature
 * - Color: Brilliant white (black-body spectrum at 5,772K)
 * - Thickness: 100-400 km
 * - Composition: 74.9% Hydrogen, 23.8% Helium
 * - Surface features: Granules (convection cells ~1,000 km diameter)
 *
 * VISUAL PROPERTIES:
 * - Self-luminous (MeshBasicMaterial - unlit, always at full brightness)
 * - No shadows cast or received (sun is light source)
 * - Radial bloom effect from HDR color values + UnrealBloomPass
 * - Emotion-responsive color tinting over base brilliant white
 * - toneMapped: false to preserve HDR brightness values for bloom
 *
 * THREE.JS IMPLEMENTATION:
 * - Material: MeshStandardMaterial with emissive properties
 * - Emissive: Self-luminous glow (doesn't need external lights)
 * - Normal Map: Shows photosphere granulation detail (convection cells)
 * - toneMapped: false allows HDR values > 1.0 for dramatic bloom
 * - UnrealBloomPass creates the radiant glow effect
 *
 * References:
 * - NASA Sun Fact Sheet: https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html
 * - NASA Solar Dynamics Observatory: https://sdo.gsfc.nasa.gov/
 * - NASA Sun Facts: https://science.nasa.gov/sun/facts/
 *
 * @module geometries/Sun
 */

import * as THREE from 'three';

/**
 * NASA-accurate photosphere effective temperature in Kelvin
 * Source: NASA Sun Fact Sheet (official)
 */
export const SUN_PHOTOSPHERE_TEMP_K = 5772;

/**
 * Create sun material with NASA photosphere texture and surface fire animation
 *
 * Loads NASA-based photosphere texture and creates self-luminous material with
 * animated fire flowing across the surface using custom shaders.
 *
 * @param {THREE.TextureLoader} textureLoader - Three.js texture loader instance
 * @param {Object} options - Configuration options
 * @param {string} options.resolution - Texture resolution ('2k' or '4k', default: '4k')
 * @param {Array<number>} options.glowColor - RGB color array [r, g, b] for emotion tinting
 * @param {number} options.glowIntensity - Glow intensity multiplier (scales HDR brightness)
 * @returns {THREE.ShaderMaterial}
 */
export function createSunMaterial(textureLoader, options = {}) {
    const resolution = options.resolution || '4k';
    const glowColor = options.glowColor || [1, 1, 1];
    const glowIntensity = options.glowIntensity || 1.0;

    // Determine texture paths based on resolution
    const colorPath = `/assets/textures/Sun/sun-photosphere-${resolution}.jpg`;
    const normalPath = `/assets/textures/Sun/sun-photosphere-normal-${resolution}.jpg`;

    // NASA-accurate base color: Brilliant white (5,772K black-body radiation)
    // Use HDR values for dramatic bloom
    const brightness = 1.0 + (glowIntensity * 2.0);
    const baseColor = new THREE.Color(
        brightness * glowColor[0],
        brightness * glowColor[1],
        brightness * glowColor[2] * 0.95  // Slight warm tint
    );

    // Initialize pending texture tracking for cleanup
    const pendingTextures = new Map();

    // Load color texture asynchronously with tracking
    pendingTextures.set(colorPath, { texture: null });

    const colorMap = textureLoader.load(
        colorPath,
        texture => {
            const pending = pendingTextures.get(colorPath);
            if (pending) {
                pending.texture = texture;
            }
            pendingTextures.delete(colorPath);
        },
        undefined,
        error => {
            console.warn(`⚠️ Failed to load sun texture (${resolution}), using color fallback:`, error);
            pendingTextures.delete(colorPath);
        }
    );

    // Load normal map for granulation detail (optional)
    pendingTextures.set(normalPath, { texture: null });

    const normalMap = textureLoader.load(
        normalPath,
        texture => {
            const pending = pendingTextures.get(normalPath);
            if (pending) {
                pending.texture = texture;
            }
            pendingTextures.delete(normalPath);
        },
        undefined,
        error => {
            console.warn(`⚠️ Sun normal map not found (${resolution}), continuing without surface detail:`, error);
            pendingTextures.delete(normalPath);
        }
    );

    // Configure texture wrapping for seamless sphere mapping
    colorMap.wrapS = colorMap.wrapT = THREE.RepeatWrapping;
    normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;

    // Enable anisotropic filtering for better quality at oblique angles
    colorMap.anisotropy = 16;
    normalMap.anisotropy = 16;

    // Custom ShaderMaterial with surface-mapped fire animation
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            colorMap: { value: colorMap },
            normalMap: { value: normalMap },
            baseColor: { value: baseColor },
            emissiveIntensity: { value: 2.0 },  // Reduced from 6.0 to prevent core blowout
            glowColor: { value: new THREE.Color(1, 1, 1) },  // For ThreeRenderer compatibility
            glowIntensity: { value: 1.0 },  // For ThreeRenderer compatibility
            // Shadow uniforms (same as moon crescent shader)
            shadowOffset: { value: new THREE.Vector2(200.0, 0.0) },  // Start far away (no shadow)
            shadowCoverage: { value: 0.5 },  // Shadow coverage (0.5 = half the sun radius)
            shadowSoftness: { value: 0.1 }   // Edge softness for anti-aliasing
        },
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vPosition;
            varying vec3 vWorldPosition;

            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                vPosition = position;
                vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform sampler2D colorMap;
            uniform sampler2D normalMap;
            uniform vec3 baseColor;
            uniform float emissiveIntensity;
            uniform vec2 shadowOffset;
            uniform float shadowCoverage;
            uniform float shadowSoftness;

            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vPosition;
            varying vec3 vWorldPosition;

            // Simplex noise for fire animation (Ashima Arts)
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
            vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

            float snoise(vec3 v) {
                const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

                vec3 i  = floor(v + dot(v, C.yyy));
                vec3 x0 = v - i + dot(i, C.xxx);

                vec3 g = step(x0.yzx, x0.xyz);
                vec3 l = 1.0 - g;
                vec3 i1 = min(g.xyz, l.zxy);
                vec3 i2 = max(g.xyz, l.zxy);

                vec3 x1 = x0 - i1 + C.xxx;
                vec3 x2 = x0 - i2 + C.yyy;
                vec3 x3 = x0 - D.yyy;

                i = mod289(i);
                vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

                float n_ = 0.142857142857;
                vec3 ns = n_ * D.wyz - D.xzx;

                vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

                vec4 x_ = floor(j * ns.z);
                vec4 y_ = floor(j - 7.0 * x_);

                vec4 x = x_ *ns.x + ns.yyyy;
                vec4 y = y_ *ns.x + ns.yyyy;
                vec4 h = 1.0 - abs(x) - abs(y);

                vec4 b0 = vec4(x.xy, y.xy);
                vec4 b1 = vec4(x.zw, y.zw);

                vec4 s0 = floor(b0)*2.0 + 1.0;
                vec4 s1 = floor(b1)*2.0 + 1.0;
                vec4 sh = -step(h, vec4(0.0));

                vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
                vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

                vec3 p0 = vec3(a0.xy, h.x);
                vec3 p1 = vec3(a0.zw, h.y);
                vec3 p2 = vec3(a1.xy, h.z);
                vec3 p3 = vec3(a1.zw, h.w);

                vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
                p0 *= norm.x;
                p1 *= norm.y;
                p2 *= norm.z;
                p3 *= norm.w;

                vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                m = m * m;
                return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
            }

            void main() {
                // Sample base photosphere texture
                vec4 texColor = texture2D(colorMap, vUv);

                // Optimized single-octave noise for subtle fire (was 2 FBM calls with 3 octaves each)
                // Using position-based noise with time offset for animation
                vec3 noiseCoord = vPosition * 30.0 + vec3(0.0, time * 0.025, 0.0);
                float fireNoise = snoise(noiseCoord);

                // Simple threshold - fire appears only in specific noise ranges
                // Using step functions instead of smoothstep for performance
                float fireMask = fireNoise * 0.5 + 0.5; // Remap -1..1 to 0..1
                fireMask = step(0.45, fireMask) * (1.0 - step(0.55, fireMask)); // Only 0.45-0.55 range

                // Almost imperceptible warmth shift (same visual as before)
                vec3 fireColor = vec3(1.01, 1.0, 0.99);

                // Microscopic blending - nearly invisible (same blend factor)
                vec3 finalColor = mix(texColor.rgb, fireColor, fireMask * 0.008);

                // Apply base color tinting
                finalColor *= baseColor;

                // Apply emissive intensity for HDR bloom
                finalColor *= emissiveIntensity;

                // ═══════════════════════════════════════════════════════════════════════════
                // SHADOW DARKENING (applied AFTER bloom intensity so it doesn't affect bloom)
                // ═══════════════════════════════════════════════════════════════════════════

                // Sun sphere center (world space origin)
                float sunRadius = 0.5; // Matches geometry radius

                // Shadow sphere center (offset from sun center)
                vec3 shadowCenter = vec3(shadowOffset.x, shadowOffset.y, 0.0);

                // Calculate distance from fragment to shadow sphere center
                float distToShadow = distance(vWorldPosition, shadowCenter);

                // Shadow threshold (shadow sphere radius adjusted by coverage)
                float shadowRadius = sunRadius * shadowCoverage;

                // Calculate shadow factor (0 = full shadow, 1 = no shadow)
                float shadowFactor = smoothstep(shadowRadius - shadowSoftness, shadowRadius + shadowSoftness, distToShadow);

                // Darken ONLY the final color output (not the bloom calculation)
                float shadowDarkness = 0.05; // How dark the shadow gets (5% brightness)
                finalColor *= mix(shadowDarkness, 1.0, shadowFactor);

                // ═══════════════════════════════════════════════════════════════════════════
                // RADIAL CORONA WAVES (applied AFTER shadow, visible around eclipse edge)
                // ═══════════════════════════════════════════════════════════════════════════

                // Calculate angle from sun center in world space XY plane
                float angle = atan(vWorldPosition.y, vWorldPosition.x);

                // Create radial wave pattern (16 petals for finer detail, rotating slowly)
                float wave = sin(angle * 16.0 + time * 0.3) * 0.5 + 0.5;

                // Apply waves to visible (non-shadowed) edges
                float distFromCenter = length(vWorldPosition.xy);

                // Edge factor: strong at sun's edge where bloom will amplify it
                float edgeFactor = smoothstep(0.35, 0.5, distFromCenter);

                // Only apply waves to non-shadowed areas (visible during eclipse)
                // Combine with shadow factor so waves appear around shadow edge
                float waveStrength = edgeFactor * shadowFactor;

                // Very strong modulation (2x variation) for dramatic eclipse corona
                float coronaModulation = 1.0 + (wave * 2.0 - 1.0) * waveStrength;
                finalColor *= coronaModulation;

                gl_FragColor = vec4(finalColor, 1.0);
            }
        `,
        toneMapped: false
    });

    // Store uniforms reference for updates
    material.userData.uniforms = material.uniforms;

    // Store pending textures for disposal
    material.userData.pendingTextures = pendingTextures;

    return material;
}

/**
 * Create sun geometry with NASA-accurate characteristics
 *
 * The sun is rendered as a self-luminous sphere using MeshBasicMaterial.
 * The base color is brilliant white (5,772K black-body spectrum), with emotion-based
 * tinting applied over time. Uses HDR color values (>1.0) for dramatic bloom effect.
 *
 * @param {THREE.TextureLoader} textureLoader - Three.js texture loader instance (optional)
 * @param {Object} options - Configuration options
 * @param {Array<number>} options.glowColor - RGB color array [r, g, b] for emotion tinting
 * @param {number} options.glowIntensity - Glow intensity multiplier (scales HDR brightness)
 * @param {string} options.resolution - Texture resolution ('2k' or '4k', default: '4k')
 * @returns {THREE.Mesh} Sun mesh with self-luminous material
 */
export function createSunGeometry(textureLoader = null, options = {}) {
    const glowColor = options.glowColor || [1, 1, 1];
    const glowIntensity = options.glowIntensity || 1.0;
    const resolution = options.resolution || '4k';

    // Create optimized sphere geometry (reduced from 64x64 for performance)
    // 32x32 = 1,024 quads = 2,048 triangles (4x fewer than 64x64)
    const geometry = new THREE.SphereGeometry(
        0.5,  // radius (normalized)
        32,   // width segments (still smooth, but performant)
        32    // height segments
    );

    // Track for disposal
    geometry.userData.tracked = true;

    let material;

    // Use textured material if loader provided, otherwise fallback to color-only
    if (textureLoader) {
        material = createSunMaterial(textureLoader, { glowColor, glowIntensity, resolution });
    } else {
        // Fallback: color-only material (no texture)
        const brightness = 1.0 + (glowIntensity * 2.0);
        const baseColor = new THREE.Color(
            brightness * glowColor[0],
            brightness * glowColor[1],
            brightness * glowColor[2] * 0.95  // Slight warm tint
        );

        material = new THREE.MeshBasicMaterial({
            color: baseColor,
            toneMapped: false // Bypass tone mapping to preserve HDR brightness for bloom
        });
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = false;  // Sun doesn't cast shadows (it IS the light source)
    mesh.receiveShadow = false; // Sun doesn't receive shadows

    return mesh;
}

/**
 * Update sun material based on emotion state and time
 *
 * Applies emotion-based color tinting and HDR brightness over the NASA-accurate white base.
 * Updates animation time for surface fire effect.
 * Uses HDR color values (>1.0) for dramatic bloom effect.
 *
 * @param {THREE.Mesh} sunMesh - The sun mesh to update
 * @param {Array<number>} glowColor - RGB color array [r, g, b] for emotion tinting
 * @param {number} glowIntensity - Glow intensity multiplier (scales HDR brightness)
 * @param {number} deltaTime - Time delta for animation (optional)
 */
export function updateSunMaterial(sunMesh, glowColor, glowIntensity = 1.0, deltaTime = 0) {
    if (!sunMesh || !sunMesh.material) return;

    const {material} = sunMesh;

    // Check if using custom shader material with uniforms
    if (material.uniforms && material.uniforms.baseColor) {
        // Direct access to ShaderMaterial uniforms
        const {uniforms} = material;

        // Update animation time with modulo to prevent unbounded growth
        // Reset every ~6.28 seconds (2π) to keep noise patterns seamless
        if (deltaTime > 0) {
            uniforms.time.value = (uniforms.time.value + deltaTime) % (Math.PI * 2.0);
        }

        // Sun is ALWAYS NASA-accurate brilliant white (5,772K photosphere)
        // Ignores emotion colors - calibrated for "joy" emotion
        const brightness = 1.0 + (glowIntensity * 2.0);
        const baseColor = new THREE.Color(
            brightness,
            brightness,
            brightness * 0.95  // Slight warm tint
        );

        // DO NOT apply emotion tinting - sun stays white regardless of emotion
        // This preserves the NASA-accurate 5,772K color temperature

        uniforms.baseColor.value.copy(baseColor);
        uniforms.emissiveIntensity.value = 2.0;  // Reduced from 6.0 to prevent core blowout
    } else if (material.color) {
        // Fallback for basic material (no shader uniforms)
        // Sun is ALWAYS NASA white - ignores emotion colors
        const brightness = 1.0 + (glowIntensity * 2.0);
        const baseColor = new THREE.Color(
            brightness,
            brightness,
            brightness * 0.95
        );

        // DO NOT apply emotion tinting - sun stays white regardless of emotion

        material.color.copy(baseColor);
    }
}

/**
 * Dispose of sun geometry and material resources
 * Call this when removing a sun from the scene
 *
 * @param {THREE.Mesh} sunMesh - Sun mesh to dispose
 */
export function disposeSun(sunMesh) {
    if (!sunMesh) return;

    // Dispose geometry
    if (sunMesh.geometry) {
        sunMesh.geometry.dispose();
    }

    // Dispose material and its textures
    if (sunMesh.material) {
        const {material} = sunMesh;

        // Clean up pending texture loads
        if (material.userData && material.userData.pendingTextures) {
            material.userData.pendingTextures.forEach(({texture}) => {
                if (texture) {
                    texture.dispose();
                }
            });
            material.userData.pendingTextures.clear();
        }

        // Dispose textures (for shader material)
        if (material.uniforms) {
            if (material.uniforms.colorMap && material.uniforms.colorMap.value) {
                material.uniforms.colorMap.value.dispose();
            }
            if (material.uniforms.normalMap && material.uniforms.normalMap.value) {
                material.uniforms.normalMap.value.dispose();
            }
        }

        // Dispose textures (for standard material)
        if (material.map) material.map.dispose();
        if (material.normalMap) material.normalMap.dispose();

        // Dispose material
        material.dispose();
    }
}
