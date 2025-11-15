/**
 * Moon Geometry with NASA Texture Maps
 *
 * Uses authentic NASA Lunar Reconnaissance Orbiter data:
 * - Color map: LROC Wide Angle Camera imagery
 * - Normal map: Generated from LOLA laser altimeter elevation data
 *
 * @module geometries/Moon
 */

import * as THREE from 'three';
import { getShadowShaders } from '../shaders/index.js';
import { getMoonWithBlendLayersShaders } from '../shaders/shadows/moonWithBlendLayers.js';

/**
 * Moon Calibration Rotation
 * Calibrated to show the classic "Man in the Moon" Earth-facing view
 * These values rotate the moon texture to match how we see it from Earth
 */
export const MOON_CALIBRATION_ROTATION = {
    x: 55.5,   // degrees
    y: -85.0,  // degrees
    z: -60.5   // degrees
};

/**
 * Moon Phase Definitions
 * Maps phase names to light direction vectors in view space
 *
 * Light direction controls which side of the moon is illuminated:
 * - Positive X: Light from right (waxing phases)
 * - Negative X: Light from left (waning phases)
 * - Larger magnitude: More moon visible
 */
export const MOON_PHASES = {
    // Calibrated with exponential Z formula (2025-01-08)
    // Formula: Z = 1.0 - offsetMagnitude^1.5
    // Manually calibrated to match astronomical reference images

    // New moon - Light from directly behind (extreme offset)
    'new': { x: 200.0, y: 0.0, coverage: 0.0 },

    // Waxing phases (light from right side, progressively more frontal)
    'waxing-crescent': { x: 1.5, y: 0.0, coverage: 0.25 },    // Thin crescent on right (CALIBRATED)
    'first-quarter': { x: 1.0, y: 0.0, coverage: 0.5 },       // Half moon, light from right
    'waxing-gibbous': { x: 0.7, y: 0.0, coverage: 0.75 },     // More than half (CALIBRATED)

    // Full moon - Light from directly in front
    'full': { x: 0.0, y: 0.0, coverage: 1.0 },

    // Waning phases (mirror of waxing, light from left side)
    'waning-gibbous': { x: -0.7, y: 0.0, coverage: 0.75 },    // More than half (CALIBRATED)
    'last-quarter': { x: -1.0, y: 0.0, coverage: 0.5 },       // Half moon, light from left
    'waning-crescent': { x: -1.5, y: 0.0, coverage: 0.25 }    // Thin crescent on left (CALIBRATED)
};

/**
 * Get all available moon phase names
 * @returns {string[]} Array of phase names
 */
export function getMoonPhaseNames() {
    return Object.keys(MOON_PHASES);
}

/**
 * Map phase progress (0-1) to light direction
 *
 * The shader uses normalize(shadowOffset.x, shadowOffset.y, 1.0) as light direction.
 * - shadowOffset.x = 0: light from camera (0,0,1) → FULL MOON (completely lit)
 * - shadowOffset.x = large: light from side → NEW MOON (dark/thin crescent)
 *
 * Truth table:
 * 0% -> x: 10 (new moon - dark)
 * 12.5% -> x: 3 (waxing crescent)
 * 25% -> x: 1 (first quarter - half lit)
 * 37.5% -> x: 0.3 (waxing gibbous)
 * 50% -> x: 0 (full moon - fully lit)
 * 62.5% -> x: -0.3 (waning gibbous)
 * 75% -> x: -1 (last quarter - half lit)
 * 87.5% -> x: -3 (waning crescent)
 * 100% -> x: 10 (new moon - cycle complete)
 *
 * @param {number} progress - Phase progress from 0 to 1
 * @returns {Object} Light direction {x, y} and coverage
 */
export function getPhaseFromProgress(progress) {
    // Normalize to 0-1 range
    const normalized = ((progress % 1) + 1) % 1;

    let x;
    if (normalized <= 0.5) {
        // Waxing phases: 0 to 0.5 maps to 10 → 0 (dark to full)
        // Use exponential decay to match shader's normalize() compression
        // At 0: x=10, at 0.25: x=1, at 0.5: x=0

        // Map 0-0.5 to 10-0 with proper curve
        // Formula: x = 10 * (1 - t)^2.5 where t goes 0->1
        const t = normalized * 2.0; // 0 to 1
        x = 10.0 * Math.pow(1.0 - t, 2.5);
    } else {
        // Waning phases: 0.5 to 1.0 maps to 0 → 10 (via negative side)
        // 0.5 -> 0, 0.625 -> -0.3, 0.75 -> -1, 0.875 -> -3, 1.0 -> 10

        const t = (normalized - 0.5) * 2.0; // 0 to 1

        if (t <= 0.25) {
            // 0.5 to 0.625: smooth transition to waning gibbous (0 to -0.3)
            x = -0.3 * (t / 0.25);
        } else if (t <= 0.5) {
            // 0.625 to 0.75: waning gibbous to last quarter (-0.3 to -1)
            const subT = (t - 0.25) / 0.25;
            x = -0.3 - (0.7 * subT);
        } else if (t <= 0.75) {
            // 0.75 to 0.875: last quarter to waning crescent (-1 to -3)
            const subT = (t - 0.5) / 0.25;
            x = -1.0 - (2.0 * subT);
        } else {
            // 0.875 to 1.0: waning crescent to new moon (-3 to 10)
            const subT = (t - 0.75) / 0.25;
            x = -3.0 + (13.0 * Math.pow(subT, 0.4));
        }
    }

    const coverage = 1.0 - Math.abs(normalized - 0.5) * 2.0;

    return { x, y: 0.0, coverage };
}

/**
 * Create moon sphere geometry
 * Uses high segment count for smooth normals and proper texture mapping
 *
 * @param {number} widthSegments - Horizontal segments (default: 64 for smooth look)
 * @param {number} heightSegments - Vertical segments (default: 64)
 * @returns {THREE.SphereGeometry}
 */
export function createMoon(widthSegments = 64, heightSegments = 64) {
    const geometry = new THREE.SphereGeometry(
        0.9,           // radius 0.9 = 1.8 diameter (matches crystal height)
        widthSegments, // 64 segments for smooth normal mapping
        heightSegments
    );

    // Track for disposal
    geometry.userData.tracked = true;

    return geometry;
}

/**
 * Dispose of moon geometry and material resources
 * Call this when removing a moon from the scene
 *
 * @param {THREE.Mesh} moonMesh - Moon mesh to dispose
 */
export function disposeMoon(moonMesh) {
    if (!moonMesh) return;

    // Dispose geometry
    if (moonMesh.geometry) {
        moonMesh.geometry.dispose();
    }

    // Dispose material and its textures
    if (moonMesh.material) {
        const {material} = moonMesh;

        // Clean up pending texture loads
        if (material.userData && material.userData.pendingTextures) {
            material.userData.pendingTextures.forEach(({texture}) => {
                if (texture) {
                    texture.dispose();
                }
            });
            material.userData.pendingTextures.clear();
        }

        // Dispose textures
        if (material.map) material.map.dispose();
        if (material.normalMap) material.normalMap.dispose();

        // Dispose shader material uniforms
        if (material.uniforms) {
            if (material.uniforms.colorMap && material.uniforms.colorMap.value) {
                material.uniforms.colorMap.value.dispose();
            }
            if (material.uniforms.normalMap && material.uniforms.normalMap.value) {
                material.uniforms.normalMap.value.dispose();
            }
        }

        // Dispose material
        material.dispose();
    }
}

/**
 * Create moon material with NASA texture maps
 * Loads color and normal maps asynchronously
 *
 * @param {THREE.TextureLoader} textureLoader - Three.js texture loader
 * @param {Object} options - Material configuration options
 * @param {string} options.resolution - Texture resolution: '2k' or '4k' (default: '4k')
 * @param {THREE.Color} options.glowColor - Emissive glow color (default: white)
 * @param {number} options.glowIntensity - Emissive intensity (default: 0)
 * @returns {THREE.MeshStandardMaterial}
 */
export function createMoonMaterial(textureLoader, options = {}) {
    const resolution = options.resolution || '4k';

    // Determine texture paths based on resolution
    const colorPath = `/assets/textures/Moon/moon-color-${resolution}.jpg`;
    const normalPath = `/assets/textures/Moon/moon-normal-${resolution}.jpg`;

    // Initialize pending texture tracking for cleanup
    const pendingTextures = new Map();

    // Load textures asynchronously with tracking
    pendingTextures.set(colorPath, { texture: null });

    const colorMap = textureLoader.load(
        colorPath,
        // onLoad callback
        texture => {
            const pending = pendingTextures.get(colorPath);
            if (pending) {
                pending.texture = texture;
            }
            pendingTextures.delete(colorPath);
        },
        // onProgress callback
        undefined,
        // onError callback
        error => {
            console.error(`❌ Failed to load moon color texture (${resolution}):`, error);
            pendingTextures.delete(colorPath);
        }
    );

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
            console.error(`❌ Failed to load moon normal map (${resolution}):`, error);
            pendingTextures.delete(normalPath);
        }
    );

    // Configure texture wrapping for seamless sphere mapping
    colorMap.wrapS = colorMap.wrapT = THREE.RepeatWrapping;
    normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;

    // Enable anisotropic filtering for better quality at oblique angles
    colorMap.anisotropy = 16;
    normalMap.anisotropy = 16;

    // Create physically-based material with NASA textures
    const material = new THREE.MeshStandardMaterial({
        // Base color from NASA LROC imagery
        map: colorMap,

        // Surface detail from LOLA elevation data
        normalMap,
        normalScale: new THREE.Vector2(1.5, 1.5), // Adjust bump intensity (1.0 = subtle, 2.0 = pronounced)

        // Material properties for realistic lunar surface
        roughness: 0.7,    // Slightly less rough for more brightness
        metalness: 0.0,    // Non-metallic (moon rock is not metal)

        // Emissive glow (controlled by emotion system) - brightened for visibility
        emissive: new THREE.Color(0.3, 0.3, 0.3), // Base gray glow for brightness
        emissiveIntensity: 0.5,  // Boost base brightness

        // Enable transparency for future shader-based crescent clipping
        transparent: false, // Will be true in Phase 3 with shader material
        side: THREE.FrontSide
    });

    // Store pending textures for disposal
    material.userData.pendingTextures = pendingTextures;

    return material;
}

/**
 * Create fallback gray material for moon
 * Used as placeholder while textures load or if loading fails
 *
 * @param {THREE.Color} glowColor - Emissive glow color
 * @param {number} glowIntensity - Emissive intensity
 * @returns {THREE.MeshStandardMaterial}
 */
export function createMoonFallbackMaterial(glowColor = new THREE.Color(0xffffff), glowIntensity = 0) {
    return new THREE.MeshStandardMaterial({
        color: 0xe8e8e8,      // Light gray moon surface (matches 2D version)
        roughness: 0.9,
        metalness: 0.0,
        emissive: glowColor,
        emissiveIntensity: glowIntensity
    });
}

/**
 * Create moon material with shader-based shadow effects
 * Supports multiple shadow types and moon phases
 *
 * @param {THREE.TextureLoader} textureLoader - Three.js texture loader
 * @param {Object} options - Material configuration options
 * @param {string} options.resolution - Texture resolution: '2k' or '4k' (default: '4k')
 * @param {THREE.Color} options.glowColor - Emissive glow color (default: white)
 * @param {number} options.glowIntensity - Emissive intensity (default: 1.0)
 * @param {string} options.shadowType - Shadow effect type: 'crescent', 'lunar-eclipse', 'solar-eclipse', 'black-hole' (default: 'crescent')
 * @param {string|number} options.moonPhase - Moon phase name or progress 0-1 (default: 'waxing-crescent')
 * @param {number} options.shadowOffsetX - Manual shadow X offset (overrides moonPhase)
 * @param {number} options.shadowOffsetY - Manual shadow Y offset (overrides moonPhase)
 * @param {number} options.shadowCoverage - Shadow coverage 0-1 (default: 0.85)
 * @returns {THREE.ShaderMaterial}
 */
export function createMoonShadowMaterial(textureLoader, options = {}) {
    const resolution = options.resolution || '4k';
    const glowColor = options.glowColor || new THREE.Color(1, 1, 1);
    const glowIntensity = options.glowIntensity || 1.0;
    const shadowType = options.shadowType || 'crescent';

    // Determine shadow offset from moonPhase or manual override
    let shadowOffsetX, shadowOffsetY;

    if (options.shadowOffsetX !== undefined) {
        // Manual override
        ({ shadowOffsetX } = options);
        shadowOffsetY = options.shadowOffsetY !== undefined ? options.shadowOffsetY : 0.0;
    } else if (options.moonPhase !== undefined) {
        // Use moon phase
        let phaseData;
        if (typeof options.moonPhase === 'string') {
            [phaseData] = [MOON_PHASES[options.moonPhase]];
            if (!phaseData) {
                console.warn(`Unknown moon phase: ${options.moonPhase}, using waxing-crescent`);
                phaseData = MOON_PHASES['waxing-crescent'];
            }
        } else if (typeof options.moonPhase === 'number') {
            phaseData = getPhaseFromProgress(options.moonPhase);
        } else {
            phaseData = MOON_PHASES['waxing-crescent'];
        }
        shadowOffsetX = phaseData.x;
        shadowOffsetY = phaseData.y;
    } else {
        // Default to waxing-crescent
        const defaultPhase = MOON_PHASES['waxing-crescent'];
        shadowOffsetX = defaultPhase.x;
        shadowOffsetY = defaultPhase.y;
    }

    const shadowCoverage = options.shadowCoverage !== undefined ? options.shadowCoverage : 0.85;

    // Determine texture paths
    const colorPath = `/assets/textures/Moon/moon-color-${resolution}.jpg`;
    const normalPath = `/assets/textures/Moon/moon-normal-${resolution}.jpg`;

    // Get shaders based on shadow type
    const { vertexShader, fragmentShader } = getShadowShaders(shadowType);

    // Create shader material with placeholder textures
    const material = new THREE.ShaderMaterial({
        uniforms: {
            colorMap: { value: null },
            normalMap: { value: null },
            shadowOffset: { value: new THREE.Vector2(shadowOffsetX, shadowOffsetY) },
            shadowCoverage: { value: shadowCoverage },
            shadowSoftness: { value: 0.05 }, // Edge blur amount
            glowColor: { value: glowColor },
            glowIntensity: { value: glowIntensity },
            opacity: { value: 0.0 }, // Start invisible, fade in when texture loads
            // Lunar Eclipse (Blood Moon) uniforms
            eclipseProgress: { value: 0.0 },  // 0 = no eclipse, 1 = totality
            eclipseIntensity: { value: 0.0 }, // Darkening strength
            bloodMoonColor: { value: [0.85, 0.18, 0.08] }, // Deep reddish-orange
            blendMode: { value: 0.0 }, // 0=Multiply, 1=LinearBurn, 2=ColorBurn, 3=ColorDodge, 4=Screen, 5=Overlay
            blendStrength: { value: 2.0 }, // Blend strength multiplier (0-5)
            emissiveStrength: { value: 0.3 }, // Emissive glow strength
            eclipseShadowPos: { value: [-2.0, 0.0] },
            eclipseShadowRadius: { value: 1.2 },
            // Eclipse color grading
            eclipseShadowColor: { value: [0.85, 0.08, 0.02] },
            eclipseMidtoneColor: { value: [1.0, 0.12, 0.03] },
            eclipseHighlightColor: { value: [1.0, 0.35, 0.08] },
            eclipseGlowColor: { value: [1.0, 0.40, 0.10] }
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        side: THREE.FrontSide
    });

    // Initialize pending texture tracking for cleanup
    const pendingTextures = new Map();

    // Load textures and update material when ready
    pendingTextures.set(colorPath, { texture: null });

    const colorMap = textureLoader.load(
        colorPath,
        texture => {
            material.uniforms.colorMap.value = texture;

            // Fade in moon when texture loads (avoid gray flash)
            const startTime = performance.now();
            const fadeIn = () => {
                const elapsed = performance.now() - startTime;
                const progress = Math.min(elapsed / 300, 1.0); // 300ms fade
                material.uniforms.opacity.value = progress;
                material.needsUpdate = true;

                if (progress < 1.0) {
                    requestAnimationFrame(fadeIn);
                }
            };
            fadeIn();

            const pending = pendingTextures.get(colorPath);
            if (pending) {
                pending.texture = texture;
            }
            pendingTextures.delete(colorPath);
        },
        undefined,
        error => {
            console.error('❌ Failed to load moon crescent color texture:', error);
            pendingTextures.delete(colorPath);
        }
    );

    pendingTextures.set(normalPath, { texture: null });

    const normalMap = textureLoader.load(
        normalPath,
        texture => {
            material.uniforms.normalMap.value = texture;
            material.needsUpdate = true;
            const pending = pendingTextures.get(normalPath);
            if (pending) {
                pending.texture = texture;
            }
            pendingTextures.delete(normalPath);
        },
        undefined,
        error => {
            console.error('❌ Failed to load moon crescent normal map:', error);
            pendingTextures.delete(normalPath);
        }
    );

    // Configure textures
    colorMap.wrapS = colorMap.wrapT = THREE.RepeatWrapping;
    normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
    colorMap.anisotropy = 16;
    normalMap.anisotropy = 16;

    // Store pending textures for disposal
    material.userData.pendingTextures = pendingTextures;

    return material;
}

/**
 * Legacy alias for backward compatibility
 * @deprecated Use createMoonShadowMaterial() instead
 */
export function createMoonCrescentMaterial(textureLoader, options = {}) {
    return createMoonShadowMaterial(textureLoader, { ...options, shadowType: 'crescent' });
}

/**
 * Set moon phase instantly
 * Changes the shadow position to show a specific lunar phase
 *
 * @param {THREE.ShaderMaterial} material - Moon shadow material
 * @param {string|number} phase - Phase name (e.g., 'waxing-crescent') or progress (0-1)
 * @returns {boolean} True if phase was set successfully
 */
export function setMoonPhase(material, phase) {
    if (!material.uniforms || !material.uniforms.shadowOffset) {
        console.warn('Material does not have shadowOffset uniform');
        return false;
    }

    let phaseData;

    // Handle named phase
    if (typeof phase === 'string') {
        phaseData = MOON_PHASES[phase];
        if (!phaseData) {
            console.warn(`Unknown moon phase: ${phase}`);
            return false;
        }
    }
    // Handle numeric progress (0-1)
    else if (typeof phase === 'number') {
        phaseData = getPhaseFromProgress(phase);
    } else {
        console.warn('Phase must be a string or number');
        return false;
    }

    // Update shadow offset uniform
    material.uniforms.shadowOffset.value.set(phaseData.x, phaseData.y);

    return true;
}

/**
 * Animate moon phase transition
 * Smoothly transitions from current phase to target phase
 *
 * @param {THREE.ShaderMaterial} material - Moon shadow material
 * @param {string|number} targetPhase - Target phase name or progress (0-1)
 * @param {number} duration - Animation duration in milliseconds (default: 2000)
 * @returns {Object} Object with { promise, cancel } - promise resolves when animation completes, cancel() stops the animation
 */
export function animateMoonPhase(material, targetPhase, duration = 2000) {
    let animationId = null;
    let cancelled = false;

    const promise = new Promise((resolve, reject) => {
        if (!material.uniforms || !material.uniforms.shadowOffset) {
            reject(new Error('Material does not have shadowOffset uniform'));
            return;
        }

        // Get target phase data
        let targetData;
        if (typeof targetPhase === 'string') {
            targetData = MOON_PHASES[targetPhase];
            if (!targetData) {
                reject(new Error(`Unknown moon phase: ${targetPhase}`));
                return;
            }
        } else if (typeof targetPhase === 'number') {
            targetData = getPhaseFromProgress(targetPhase);
        } else {
            reject(new Error('Phase must be a string or number'));
            return;
        }

        // Get current and target positions
        const startX = material.uniforms.shadowOffset.value.x;
        const startY = material.uniforms.shadowOffset.value.y;
        const targetX = targetData.x;
        const targetY = targetData.y;

        const startTime = Date.now();

        // Animation loop
        const animate = () => {
            // Check if animation was cancelled
            if (cancelled) {
                resolve({ cancelled: true });
                return;
            }

            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1.0);

            // Ease in-out cubic
            const eased = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            // Interpolate
            const currentX = startX + (targetX - startX) * eased;
            const currentY = startY + (targetY - startY) * eased;

            material.uniforms.shadowOffset.value.set(currentX, currentY);

            if (progress < 1.0) {
                animationId = requestAnimationFrame(animate);
            } else {
                resolve({ cancelled: false });
            }
        };

        animate();
    });

    // Return promise with cancel function
    return {
        promise,
        cancel: () => {
            cancelled = true;
            if (animationId !== null) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        }
    };
}

/**
 * Update moon material glow (called by emotion system)
 * Works with both MeshStandardMaterial and ShaderMaterial
 *
 * @param {THREE.Material} material - Moon material to update
 * @param {THREE.Color} glowColor - New glow color
 * @param {number} glowIntensity - New glow intensity
 */
export function updateMoonGlow(material, glowColor, glowIntensity) {
    // Standard material (Phase 2)
    if (material.emissive) {
        material.emissive.copy(glowColor);
        material.emissiveIntensity = glowIntensity;
    }

    // Shader material (Phase 3)
    if (material.uniforms && material.uniforms.glowColor) {
        material.uniforms.glowColor.value.copy(glowColor);
        material.uniforms.glowIntensity.value = glowIntensity;
    }
}

/**
 * Update crescent shadow parameters
 *
 * @param {THREE.ShaderMaterial} material - Moon crescent shader material
 * @param {number} offsetX - Shadow X offset
 * @param {number} offsetY - Shadow Y offset
 * @param {number} coverage - Shadow coverage (0=full moon, 1=new moon)
 */
export function updateCrescentShadow(material, offsetX, offsetY, coverage) {
    if (material.uniforms && material.uniforms.shadowOffset) {
        material.uniforms.shadowOffset.value.set(offsetX, offsetY);
        material.uniforms.shadowCoverage.value = coverage;
    }
}

/**
 * Create Moon Crescent Material with Blend Multiplexer
 * Supports up to 4 sequential blend mode layers for complex color grading
 *
 * @param {THREE.TextureLoader} textureLoader - Three.js texture loader
 * @param {Object} options - Material configuration options
 * @param {THREE.Color} options.glowColor - Glow color (default: white)
 * @param {number} options.glowIntensity - Glow intensity (default: 1.0)
 * @returns {THREE.ShaderMaterial} Shader material with multiplexer blend modes
 */
export function createMoonMultiplexerMaterial(textureLoader, options = {}) {
    const {
        resolution = '4k',
        glowColor = new THREE.Color(0xffffff),
        glowIntensity = 1.0
    } = options;

    const { vertexShader, fragmentShader } = getMoonWithBlendLayersShaders();

    // DIAGNOSTIC: Check if blend modes are in the fragment shader
    console.log('🔍 Shader Diagnostics:');
    console.log('  Fragment shader length:', fragmentShader.length);
    console.log('  Contains "applyBlendMode":', fragmentShader.includes('applyBlendMode'));
    console.log('  Contains "vec3 applyBlendMode":', fragmentShader.includes('vec3 applyBlendMode'));
    console.log('  Fragment shader preview (first 500 chars):', fragmentShader.substring(0, 500));

    // Find where applyBlendMode is defined
    const blendModeDefIndex = fragmentShader.indexOf('vec3 applyBlendMode');
    if (blendModeDefIndex !== -1) {
        console.log('  ✅ applyBlendMode function found at position:', blendModeDefIndex);
        console.log('  Function definition:', fragmentShader.substring(blendModeDefIndex, blendModeDefIndex + 100));
    } else {
        console.error('  ❌ applyBlendMode function NOT FOUND in shader!');
    }

    const material = new THREE.ShaderMaterial({
        uniforms: {
            colorMap: { value: null },
            normalMap: { value: null },
            shadowOffset: { value: new THREE.Vector2(0, 0) },
            shadowCoverage: { value: 0.5 },
            shadowSoftness: { value: 0.05 },
            glowColor: { value: glowColor },
            glowIntensity: { value: glowIntensity },
            opacity: { value: 0.0 },

            // Lunar Eclipse (Blood Moon) uniforms
            eclipseProgress: { value: 0.0 },
            eclipseIntensity: { value: 0.0 },
            bloodMoonColor: { value: [0.85, 0.18, 0.08] },
            emissiveStrength: { value: 0.48 },
            eclipseShadowPos: { value: [-2.0, 0.0] },
            eclipseShadowRadius: { value: 1.2 },
            // Eclipse color grading
            eclipseShadowColor: { value: [0.85, 0.08, 0.02] },
            eclipseMidtoneColor: { value: [1.0, 0.12, 0.03] },
            eclipseHighlightColor: { value: [1.0, 0.35, 0.08] },
            eclipseGlowColor: { value: [1.0, 0.40, 0.10] },

            // Blend Multiplexer Layer 1 - Color Dodge @ 0.7 (calibrated for blood moon)
            layer1Mode: { value: 3.0 },  // 3 = Color Dodge
            layer1Strength: { value: 0.7 },  // Calibrated strength
            layer1Enabled: { value: 1.0 },  // ENABLED

            // Blend Multiplexer Layer 2 - Linear Burn @ 0.8 (calibrated for blood moon)
            layer2Mode: { value: 1.0 },  // 1 = Linear Burn
            layer2Strength: { value: 0.8 },  // Calibrated strength
            layer2Enabled: { value: 1.0 },  // ENABLED

            // Blend Multiplexer Layer 3 - Overlay @ 0.8 (calibrated for blood moon)
            layer3Mode: { value: 5.0 },  // 5 = Overlay
            layer3Strength: { value: 0.8 },  // Calibrated strength
            layer3Enabled: { value: 1.0 },  // ENABLED

            // Blend Multiplexer Layer 4 - User customizable (4th layer support)
            layer4Mode: { value: 0.0 },  // 0 = Multiply (default)
            layer4Strength: { value: 2.0 },
            layer4Enabled: { value: 0.0 }  // Disabled by default
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: true,
        side: THREE.FrontSide
    });

    // DIAGNOSTIC: Log blend layer uniform values
    console.log('🎨 Blend Layer Uniforms Initialized:');
    console.log(`  Layer 1: Mode=${material.uniforms.layer1Mode.value 
    } Strength=${material.uniforms.layer1Strength.value 
    } Enabled=${material.uniforms.layer1Enabled.value}`);
    console.log(`  Layer 2: Mode=${material.uniforms.layer2Mode.value 
    } Strength=${material.uniforms.layer2Strength.value 
    } Enabled=${material.uniforms.layer2Enabled.value}`);
    console.log(`  Layer 3: Mode=${material.uniforms.layer3Mode.value 
    } Strength=${material.uniforms.layer3Strength.value 
    } Enabled=${material.uniforms.layer3Enabled.value}`);

    // Load textures with fade-in (same as standard material)
    const colorPath = `/assets/textures/Moon/moon-color-${resolution}.jpg`;
    const normalPath = `/assets/textures/Moon/moon-normal-${resolution}.jpg`;

    const colorMap = textureLoader.load(
        colorPath,
        texture => {
            material.uniforms.colorMap.value = texture;

            // Fade in moon when texture loads
            const startTime = performance.now();
            const fadeIn = () => {
                const elapsed = performance.now() - startTime;
                const progress = Math.min(elapsed / 300, 1.0); // 300ms fade
                material.uniforms.opacity.value = progress;
                material.needsUpdate = true;

                if (progress < 1.0) {
                    requestAnimationFrame(fadeIn);
                }
            };
            fadeIn();
        }
    );

    const normalMap = textureLoader.load(normalPath, texture => {
        material.uniforms.normalMap.value = texture;
    });

    return material;
}
