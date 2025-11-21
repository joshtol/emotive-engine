/**
 * Black Hole Geometry with NASA M87* Event Horizon Telescope Accuracy
 *
 * Based on NASA/ESA Event Horizon Telescope (EHT) M87* observations (2019):
 *
 * BLACK HOLE CHARACTERISTICS (M87*):
 * - Mass: 6.5 billion solar masses (supermassive)
 * - Schwarzschild radius: ~20 billion km (~19 light-hours)
 * - Shadow size: ~2.6x Schwarzschild radius (observed)
 * - Photon sphere: 1.5x Schwarzschild radius (where light orbits)
 * - Accretion disk: ISCO at ~3x Schwarzschild (innermost stable circular orbit)
 *
 * VISUAL PROPERTIES:
 * - Event horizon shadow: Pure black sphere (nothing escapes)
 * - Accretion disk: Hot plasma spiraling inward with differential rotation
 * - Photon ring: Bright ring at photon sphere (1.5x radius)
 * - Doppler beaming: Approaching side brighter (relativistic effect)
 * - Temperature gradient: Inner (hot white/blue) → Outer (cool red/orange)
 *
 * THREE.JS IMPLEMENTATION:
 * - Architecture: THREE.Group with 3 meshes (shadow, disk, photon ring)
 * - Rotation: Disk rotates in shader (differential Keplerian rotation)
 * - Materials: Custom shaders with blend layers
 * - Render order: Shadow(1) → Disk(2) → Photon Ring(3)
 *
 * References:
 * - NASA EHT M87* Image: https://www.nasa.gov/mission_pages/chandra/news/black-hole-image-makes-history
 * - Event Horizon Telescope: https://eventhorizontelescope.org/
 * - Schwarzschild Metric: https://en.wikipedia.org/wiki/Schwarzschild_radius
 *
 * @module geometries/BlackHole
 */

import * as THREE from 'three';
import { getBlackHoleWithBlendLayersShaders } from '../shaders/blackHoleWithBlendLayers.js';

/**
 * Schwarzschild radius (base unit for all measurements)
 * In our scale, 1.0 = Schwarzschild radius
 * Event horizon is at 2.0x this radius
 */
export const SCHWARZSCHILD_RADIUS = 0.25; // Base scale unit

/**
 * Black hole rotation configuration
 * Disk rotates in shader (not mesh), so base rotation is zero
 */
export const BLACK_HOLE_ROTATION_CONFIG = {
    baseSpeed: 0,           // No mesh rotation (disk rotates in shader)
    axes: [0, 0, 0],        // No axis rotation
    type: 'still'           // Stationary mesh
};

/**
 * Create black hole GROUP with shadow, accretion disk, and photon ring
 *
 * Returns a THREE.Group containing:
 * 1. Event horizon shadow (black sphere at 2x Schwarzschild radius)
 * 2. Accretion disk (ring from 2.5x to 8x Schwarzschild radius)
 * 3. Photon ring (thin torus at 1.5x Schwarzschild radius)
 *
 * @returns {THREE.Group} Black hole group with all meshes
 */
export function createBlackHoleGroup() {
    const group = new THREE.Group();
    group.name = 'BlackHole';

    // ═══════════════════════════════════════════════════════════════════════════
    // EVENT HORIZON SHADOW (Mesh 1)
    // Pure black sphere representing where light cannot escape
    // ═══════════════════════════════════════════════════════════════════════════

    const shadowRadius = SCHWARZSCHILD_RADIUS * 2.0;
    const shadowGeometry = new THREE.SphereGeometry(shadowRadius, 64, 64);

    // Simple black material with edge glow (created separately - see createBlackHoleMaterial)
    const shadowMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: false
    });

    const shadowMesh = new THREE.Mesh(shadowGeometry, shadowMaterial);
    shadowMesh.name = 'EventHorizonShadow';
    shadowMesh.renderOrder = 1; // Render first (behind everything)

    // ═══════════════════════════════════════════════════════════════════════════
    // ACCRETION DISK (Mesh 2)
    // Hot plasma disk with differential rotation (inner fast, outer slow)
    // ═══════════════════════════════════════════════════════════════════════════

    const diskInnerRadius = SCHWARZSCHILD_RADIUS * 2.5;  // ISCO (innermost stable orbit)
    const diskOuterRadius = SCHWARZSCHILD_RADIUS * 8.0;  // Outer edge
    const diskSegments = 128;  // High detail for smooth rotation

    const diskGeometry = new THREE.RingGeometry(
        diskInnerRadius,
        diskOuterRadius,
        diskSegments,
        16  // Radial segments
    );

    // Rotate disk to be horizontal (RingGeometry defaults to vertical)
    diskGeometry.rotateX(-Math.PI / 2);

    // Default material (will be replaced by shader material in createBlackHoleMaterial)
    const diskMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide, // Visible from both sides
        transparent: true
    });

    const diskMesh = new THREE.Mesh(diskGeometry, diskMaterial);
    diskMesh.name = 'AccretionDisk';
    diskMesh.renderOrder = 2; // Render after shadow

    // Tilt disk to match M87* observation (~17° from face-on)
    diskMesh.rotation.x = THREE.MathUtils.degToRad(17);

    // ═══════════════════════════════════════════════════════════════════════════
    // PHOTON RING (Mesh 3)
    // Thin, bright ring at photon sphere where light orbits
    // ═══════════════════════════════════════════════════════════════════════════

    const photonRingRadius = SCHWARZSCHILD_RADIUS * 1.5;  // Photon sphere
    const photonRingThickness = SCHWARZSCHILD_RADIUS * 0.05;  // Very thin

    const photonRingGeometry = new THREE.TorusGeometry(
        photonRingRadius,
        photonRingThickness,
        64,   // Tubular segments
        128   // Radial segments
    );

    // Rotate to match disk orientation
    photonRingGeometry.rotateX(Math.PI / 2);

    const photonRingMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,  // Brightest on top
        side: THREE.DoubleSide,
        toneMapped: false  // HDR glow - MeshBasicMaterial is already unlit and bright
    });

    const photonRingMesh = new THREE.Mesh(photonRingGeometry, photonRingMaterial);
    photonRingMesh.name = 'PhotonRing';
    photonRingMesh.renderOrder = 3; // Render last (brightest on top)

    // Match disk tilt
    photonRingMesh.rotation.x = THREE.MathUtils.degToRad(17);

    // ═══════════════════════════════════════════════════════════════════════════
    // GROUP ASSEMBLY
    // ═══════════════════════════════════════════════════════════════════════════

    group.add(shadowMesh);
    group.add(diskMesh);
    group.add(photonRingMesh);

    // Scale entire group to match other geometries (radius ~0.5 default scale)
    // This makes the black hole similar size to sphere, moon, sun, etc.
    const targetRadius = 0.5;
    const currentRadius = diskOuterRadius;
    const scaleFactor = targetRadius / currentRadius;
    group.scale.set(scaleFactor, scaleFactor, scaleFactor);

    // Store references for material updates
    group.userData.shadowMesh = shadowMesh;
    group.userData.diskMesh = diskMesh;
    group.userData.photonRingMesh = photonRingMesh;

    return group;
}

/**
 * Derive black hole parameters from emotion modifiers
 *
 * Automatically calculates black hole behavior from emotion data, eliminating
 * need for emotion-specific config duplication. Uses emotion modifiers:
 * - speed: Affects disk rotation speed, precession
 * - intensity: Affects turbulence, doppler beaming
 * - smoothness: Affects turbulence (inverse)
 *
 * @param {Object} emotionData - Emotion configuration object
 * @returns {Object} Black hole parameters derived from emotion
 */
function deriveBlackHoleParams(emotionData) {
    // Extract emotion modifiers (with neutral defaults)
    const speed = emotionData?.modifiers?.speed || 1.0;
    const intensity = emotionData?.modifiers?.intensity || 1.0;
    const smoothness = emotionData?.modifiers?.smoothness || 1.0;

    return {
        diskRotationSpeed: speed,                    // Faster emotion = faster disk
        turbulence: intensity * (2.0 - smoothness), // High intensity + low smoothness = chaotic
        dopplerIntensity: 0.4 + (intensity * 0.3),  // More intense emotion = stronger doppler
        shadowGlow: Math.max(0.2, intensity * 0.4)  // Brighter emotions = more edge glow
    };
}

/**
 * Create black hole materials (disk shader + shadow shader)
 *
 * Creates custom shader materials for the accretion disk with:
 * - Differential rotation (Kepler's 3rd law)
 * - Doppler beaming (relativistic brightness)
 * - Temperature gradient (hot inner → cool outer)
 * - Turbulence (noise-based striations)
 * - 4 blend layers (Photoshop-style)
 *
 * @param {THREE.TextureLoader} textureLoader - Three.js texture loader
 * @param {Object} options - Material options
 * @param {Array<number>} options.glowColor - RGB color array [r, g, b]
 * @param {number} options.glowIntensity - Glow intensity multiplier
 * @param {string} options.materialVariant - 'multiplexer' for blend layers
 * @param {Object} options.emotionData - Optional emotion data for auto-deriving params
 * @returns {Object} Object with diskMaterial and shadowMaterial
 */
export function createBlackHoleMaterial(textureLoader, options = {}) {
    const glowColor = options.glowColor || [1.0, 1.0, 1.0];
    const glowIntensity = options.glowIntensity || 1.0;
    const materialVariant = options.materialVariant || null;

    // Auto-derive black hole params from emotion modifiers
    const emotionParams = options.emotionData ? deriveBlackHoleParams(options.emotionData) : {
        diskRotationSpeed: 1.0,
        turbulence: 0.4,
        dopplerIntensity: 0.6,
        shadowGlow: 0.3
    };

    console.log('🕳️ BlackHole.js: Creating black hole material...', materialVariant ? `[${materialVariant}]` : '[standard]');

    // Load noise texture for turbulence
    const noisePath = '/assets/textures/perlin-noise-512.png';
    const noiseTexture = textureLoader.load(
        noisePath,
        texture => {
            console.log('🕳️ BlackHole.js: Noise texture loaded successfully');
        },
        undefined,
        error => {
            console.warn('⚠️ Failed to load black hole noise texture, using fallback:', error);
        }
    );

    noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping;
    noiseTexture.anisotropy = 16;

    // Calculate base color with glow intensity
    const brightness = 1.0 + (glowIntensity * 0.5);  // Less intense than sun
    const baseColor = new THREE.Color(
        brightness * glowColor[0],
        brightness * glowColor[1],
        brightness * glowColor[2]
    );

    // Get shaders for disk
    const { vertexShader, fragmentShader } = getBlackHoleWithBlendLayersShaders();

    // Create disk material with full shader uniforms (using derived emotion params)
    const diskMaterial = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            // Animation
            time: { value: 0.0 },
            diskRotationSpeed: { value: emotionParams.diskRotationSpeed },

            // Textures
            noiseTexture: { value: noiseTexture },

            // Visual effects (auto-derived from emotion)
            dopplerIntensity: { value: emotionParams.dopplerIntensity },
            turbulenceStrength: { value: emotionParams.turbulence },

            // Blend layers (4 layers × 3 properties = 12 uniforms)
            layer1Mode: { value: 0.0 },      // 0 = Normal
            layer1Strength: { value: 1.0 },
            layer1Enabled: { value: 1.0 },

            layer2Mode: { value: 3.0 },      // 3 = Overlay
            layer2Strength: { value: 0.4 },
            layer2Enabled: { value: 1.0 },

            layer3Mode: { value: 1.0 },      // 1 = Add
            layer3Strength: { value: 0.6 },
            layer3Enabled: { value: 1.0 },

            layer4Mode: { value: 4.0 },      // 4 = Screen
            layer4Strength: { value: 0.3 },
            layer4Enabled: { value: 1.0 },

            // Emotion-based color shifting
            emotionColorTint: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
            emotionColorStrength: { value: 0.0 },

            // Base properties
            baseColor: { value: baseColor },
            opacity: { value: 1.0 }
        },
        transparent: true,
        side: THREE.DoubleSide,
        toneMapped: false,  // Preserve HDR values for bloom
        depthWrite: true
    });

    // Create simple shader for shadow mesh (edge glow only)
    const shadowMaterial = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vViewPosition;

            void main() {
                vNormal = normalize(normalMatrix * normal);
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = mvPosition.xyz;
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform float shadowGlowIntensity;
            uniform vec3 shadowGlowColor;

            varying vec3 vNormal;
            varying vec3 vViewPosition;

            void main() {
                // Fresnel effect for edge glow
                vec3 viewDir = normalize(-vViewPosition);
                float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 3.0);

                // Pure black with subtle orange glow at edge
                vec3 black = vec3(0.0);
                vec3 edgeGlow = shadowGlowColor * fresnel * shadowGlowIntensity;

                vec3 finalColor = black + edgeGlow;
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `,
        uniforms: {
            shadowGlowIntensity: { value: emotionParams.shadowGlow },
            shadowGlowColor: { value: new THREE.Color(1.0, 0.5, 0.1) }  // Orange glow
        },
        transparent: false,
        side: THREE.FrontSide
    });

    console.log('🕳️ BlackHole.js: Materials created successfully');

    return {
        diskMaterial,
        shadowMaterial
    };
}

/**
 * Update black hole material uniforms (called from render loop)
 *
 * Updates time-based animation and emotion-based color tinting
 *
 * @param {THREE.Group} blackHoleGroup - Black hole group
 * @param {number} deltaTime - Time since last frame (ms)
 * @param {Object} options - Update options
 * @param {Array<number>} options.emotionColorTint - RGB color tint [r, g, b]
 * @param {number} options.emotionColorStrength - Tint strength (0-1)
 */
export function updateBlackHoleMaterial(blackHoleGroup, deltaTime, options = {}) {
    if (!blackHoleGroup || !blackHoleGroup.userData.diskMesh) return;

    const {diskMesh} = blackHoleGroup.userData;
    const diskMaterial = diskMesh.material;

    // Update time for shader animation (convert ms to seconds)
    if (diskMaterial.uniforms && diskMaterial.uniforms.time) {
        diskMaterial.uniforms.time.value += deltaTime * 0.001;
    }

    // Update emotion color tint if provided
    if (options.emotionColorTint && diskMaterial.uniforms.emotionColorTint) {
        diskMaterial.uniforms.emotionColorTint.value.set(
            options.emotionColorTint[0],
            options.emotionColorTint[1],
            options.emotionColorTint[2]
        );
    }

    if (options.emotionColorStrength !== undefined && diskMaterial.uniforms.emotionColorStrength) {
        diskMaterial.uniforms.emotionColorStrength.value = options.emotionColorStrength;
    }
}
