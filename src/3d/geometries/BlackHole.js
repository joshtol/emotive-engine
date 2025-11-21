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
    // FAR-SIDE DISK (Mesh 4) - GRAVITATIONALLY LENSED
    // ═══════════════════════════════════════════════════════════════════════════
    // Simulates light from far side of disk bending around black hole
    // This creates the characteristic "disk underside" image visible in M87*
    // Uses same radii as main disk but positioned above, with UV distortion shader

    const farSideDiskGeometry = new THREE.RingGeometry(
        diskInnerRadius,
        diskOuterRadius,
        diskSegments,
        16
    );
    farSideDiskGeometry.rotateX(-Math.PI / 2);

    // Create a simplified shader that mimics the main disk but with lensing distortion
    const farSideDiskMaterial = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vPosition;

            void main() {
                vUv = uv;
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 baseColor;
            uniform float opacity;
            uniform float distortionStrength;

            varying vec2 vUv;
            varying vec3 vPosition;

            void main() {
                // Calculate distance from center (normalized 0-1)
                float dist = length(vPosition.xy) / ${diskOuterRadius.toFixed(2)};

                // Gravitational lensing distortion: stronger near inner edge
                // This simulates light bending around the black hole
                float lensing = (1.0 - dist) * distortionStrength;

                // Create dimmer version of main disk (far side receives less direct light)
                // Use radial gradient similar to main disk
                float brightness = smoothstep(0.3, 1.0, dist) * (1.0 - lensing * 0.5);

                // Color gradient: cooler on outside, warmer inside (like main disk)
                vec3 innerColor = vec3(1.0, 0.6, 0.3);  // Orange-yellow
                vec3 outerColor = vec3(0.8, 0.4, 0.2);  // Reddish
                vec3 color = mix(innerColor, outerColor, dist);

                // Apply dimming (far side is less bright)
                color *= brightness * 0.6;  // 60% of main disk brightness

                gl_FragColor = vec4(color * baseColor, opacity * brightness);
            }
        `,
        uniforms: {
            baseColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
            opacity: { value: 0.7 },  // Semi-transparent to blend with main disk
            distortionStrength: { value: 0.3 }  // Lensing distortion amount
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    const farSideDiskMesh = new THREE.Mesh(farSideDiskGeometry, farSideDiskMaterial);
    farSideDiskMesh.name = 'FarSideDisk';
    farSideDiskMesh.renderOrder = 4; // Render after photon ring but before jets

    // Position above main disk to create lensed appearance
    farSideDiskMesh.position.y = SCHWARZSCHILD_RADIUS * 0.3;  // Offset vertically

    // Match main disk tilt
    farSideDiskMesh.rotation.x = THREE.MathUtils.degToRad(17);

    // ═══════════════════════════════════════════════════════════════════════════
    // RELATIVISTIC JETS (Mesh 5 & 6)
    // Blue/white particle streams from black hole poles (synchrotron radiation)
    // ═══════════════════════════════════════════════════════════════════════════

    const jetLength = SCHWARZSCHILD_RADIUS * 10.0;  // 10× Schwarzschild radius
    const jetBaseRadius = SCHWARZSCHILD_RADIUS * 0.3;  // Narrow at base
    const jetTopRadius = SCHWARZSCHILD_RADIUS * 0.8;   // Widens at tip

    // Top jet (positive Y direction)
    const topJetGeometry = new THREE.ConeGeometry(jetTopRadius, jetLength, 16, 8, true);
    const topJetMaterial = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec2 vUv;
            varying float vDistance;

            void main() {
                vUv = uv;
                vDistance = position.y / ${jetLength.toFixed(4)};  // 0.0 at base, 1.0 at tip
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform float jetIntensity;
            uniform vec3 jetColor;

            varying vec2 vUv;
            varying float vDistance;

            void main() {
                // Opacity gradient: bright at base, fade at tip
                float baseOpacity = 1.0 - vDistance;

                // Animated flow effect (particles streaming upward)
                float flow = fract(vDistance * 3.0 - time * 0.5);
                float flowBrightness = smoothstep(0.0, 0.1, flow) * smoothstep(0.3, 0.2, flow);

                // Flickering turbulence
                float flicker = 0.8 + 0.2 * sin(time * 8.0 + vDistance * 20.0);

                // Radial fade from center
                float radialDist = length(vUv - vec2(0.5, 0.5)) * 2.0;
                float radialFade = 1.0 - smoothstep(0.3, 1.0, radialDist);

                // Combine effects
                float alpha = baseOpacity * flowBrightness * flicker * radialFade * jetIntensity;

                gl_FragColor = vec4(jetColor, alpha);
            }
        `,
        uniforms: {
            time: { value: 0.0 },
            jetIntensity: { value: 0.0 },  // Start hidden, controlled by emotion
            jetColor: { value: new THREE.Color(0.7, 0.85, 1.0) }  // Blue-white synchrotron
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
        toneMapped: false
    });

    const topJetMesh = new THREE.Mesh(topJetGeometry, topJetMaterial);
    topJetMesh.name = 'TopJet';
    topJetMesh.position.y = jetLength / 2;  // Position so base is at origin
    topJetMesh.renderOrder = 4;

    // Bottom jet (negative Y direction) - same geometry, flipped
    const bottomJetGeometry = topJetGeometry.clone();
    const bottomJetMaterial = topJetMaterial.clone();
    bottomJetMaterial.uniforms = {
        time: { value: 0.0 },
        jetIntensity: { value: 0.0 },
        jetColor: { value: new THREE.Color(0.7, 0.85, 1.0) }
    };

    const bottomJetMesh = new THREE.Mesh(bottomJetGeometry, bottomJetMaterial);
    bottomJetMesh.name = 'BottomJet';
    bottomJetMesh.position.y = -jetLength / 2;
    bottomJetMesh.rotation.x = Math.PI;  // Flip upside down
    bottomJetMesh.renderOrder = 4;

    // ═══════════════════════════════════════════════════════════════════════════
    // HAWKING RADIATION PARTICLE SYSTEM (Mesh 6)
    // ═══════════════════════════════════════════════════════════════════════════
    // Quantum tunneling particles escaping from just outside event horizon
    // Very sparse, faint glow representing information paradox
    // Only visible when enabled via UI (hidden by default)

    const maxHawkingParticles = 50;
    const hawkingGeometry = new THREE.BufferGeometry();
    const hawkingPositions = new Float32Array(maxHawkingParticles * 3);
    const hawkingVelocities = new Float32Array(maxHawkingParticles * 3);
    const hawkingLifetimes = new Float32Array(maxHawkingParticles); // Remaining life (0 = dead)
    const hawkingMaxLifetime = 3.0; // Fade out after 3 seconds

    // Initialize all particles as "dead" (lifetime = 0)
    for (let i = 0; i < maxHawkingParticles; i++) {
        hawkingLifetimes[i] = 0.0;
    }

    hawkingGeometry.setAttribute('position', new THREE.BufferAttribute(hawkingPositions, 3));
    hawkingGeometry.setAttribute('velocity', new THREE.BufferAttribute(hawkingVelocities, 3));
    hawkingGeometry.setAttribute('lifetime', new THREE.BufferAttribute(hawkingLifetimes, 1));

    const hawkingMaterial = new THREE.PointsMaterial({
        color: 0xCCEEFF,           // Soft blue-white
        size: 0.03,                // Tiny particles
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
    });

    const hawkingParticles = new THREE.Points(hawkingGeometry, hawkingMaterial);
    hawkingParticles.name = 'HawkingRadiation';
    hawkingParticles.renderOrder = 5;

    // Store particle system metadata
    hawkingParticles.userData = {
        spawnRate: 0.0,            // Particles per second (0 = disabled by default)
        timeSinceLastSpawn: 0.0,
        maxLifetime: hawkingMaxLifetime,
        eventHorizonRadius: SCHWARZSCHILD_RADIUS * 1.05 // Spawn just outside event horizon
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // GRAVITATIONAL LENSING RING (Mesh 7)
    // ═══════════════════════════════════════════════════════════════════════════
    // Visual simulation of gravitational lensing - Einstein ring effect
    // Glowing, shimmering ring just outside event horizon shadow
    // Creates illusion of light bending around black hole

    const lensingRingRadius = shadowRadius * 1.02; // Just outside shadow
    const lensingRingThickness = SCHWARZSCHILD_RADIUS * 0.15;

    const lensingRingGeometry = new THREE.TorusGeometry(
        lensingRingRadius,
        lensingRingThickness,
        32,  // Tubular segments
        128  // Radial segments (high detail for smooth animation)
    );

    // Rotate to face camera
    lensingRingGeometry.rotateX(Math.PI / 2);

    const lensingRingMaterial = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vViewPosition;

            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform float lensingStrength;
            uniform vec3 lensingColor;

            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vViewPosition;

            void main() {
                // Fresnel effect for edge brightness
                vec3 viewDir = normalize(vViewPosition);
                float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 2.0);

                // Shimmering wave effect (rotating distortion)
                float wave1 = sin(vUv.x * 20.0 + time * 2.0) * 0.5 + 0.5;
                float wave2 = sin(vUv.y * 15.0 - time * 3.0) * 0.5 + 0.5;
                float shimmer = wave1 * wave2;

                // Radial brightness gradient (brighter in center of ring cross-section)
                float radialGradient = 1.0 - abs(vUv.x - 0.5) * 2.0;

                // Combine effects
                float brightness = fresnel * shimmer * radialGradient * lensingStrength;

                // Einstein ring glow (soft white-blue)
                vec3 finalColor = lensingColor * brightness;
                float alpha = brightness;

                gl_FragColor = vec4(finalColor, alpha);
            }
        `,
        uniforms: {
            time: { value: 0.0 },
            lensingStrength: { value: 0.0 },  // Hidden by default
            lensingColor: { value: new THREE.Color(0.9, 0.95, 1.0) }  // Soft white-blue
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
    });

    const lensingRingMesh = new THREE.Mesh(lensingRingGeometry, lensingRingMaterial);
    lensingRingMesh.name = 'GravitationalLensingRing';
    lensingRingMesh.renderOrder = 6;

    // ═══════════════════════════════════════════════════════════════════════════
    // GROUP ASSEMBLY
    // ═══════════════════════════════════════════════════════════════════════════

    group.add(shadowMesh);
    group.add(diskMesh);
    group.add(photonRingMesh);
    group.add(farSideDiskMesh);
    group.add(topJetMesh);
    group.add(bottomJetMesh);
    group.add(hawkingParticles);
    group.add(lensingRingMesh);

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
    group.userData.farSideDiskMesh = farSideDiskMesh;
    group.userData.topJetMesh = topJetMesh;
    group.userData.bottomJetMesh = bottomJetMesh;
    group.userData.hawkingParticles = hawkingParticles;
    group.userData.lensingRingMesh = lensingRingMesh;

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
 * Update Hawking radiation particle system
 *
 * Simulates quantum tunneling particles escaping from event horizon.
 * Very sparse emission (controlled by spawnRate), slow outward drift,
 * fade out after ~3 seconds.
 *
 * @param {THREE.Points} hawkingParticles - Hawking radiation particle system
 * @param {number} deltaTime - Time since last frame (seconds)
 */
function updateHawkingRadiation(hawkingParticles, deltaTime) {
    const {geometry} = hawkingParticles;
    const positions = geometry.attributes.position.array;
    const velocities = geometry.attributes.velocity.array;
    const lifetimes = geometry.attributes.lifetime.array;

    const {spawnRate, maxLifetime, eventHorizonRadius} = hawkingParticles.userData;

    // Update existing particles
    for (let i = 0; i < lifetimes.length; i++) {
        if (lifetimes[i] > 0) {
            // Update position based on velocity
            positions[i * 3] += velocities[i * 3] * deltaTime;
            positions[i * 3 + 1] += velocities[i * 3 + 1] * deltaTime;
            positions[i * 3 + 2] += velocities[i * 3 + 2] * deltaTime;

            // Decrease lifetime
            lifetimes[i] -= deltaTime;

            // Fade out particles based on remaining lifetime
            const lifeFraction = lifetimes[i] / maxLifetime;
            // Particles get dimmer as they age (opacity based on lifetime)
            // This is handled via material opacity, but we kill particles at lifetime <= 0
            if (lifetimes[i] <= 0) {
                lifetimes[i] = 0;
            }
        }
    }

    // Spawn new particles (if enabled)
    if (spawnRate > 0) {
        hawkingParticles.userData.timeSinceLastSpawn += deltaTime;
        const spawnInterval = 1.0 / spawnRate; // Time between spawns

        while (hawkingParticles.userData.timeSinceLastSpawn >= spawnInterval) {
            hawkingParticles.userData.timeSinceLastSpawn -= spawnInterval;

            // Find a dead particle to reuse
            for (let i = 0; i < lifetimes.length; i++) {
                if (lifetimes[i] <= 0) {
                    // Spawn on random point on event horizon surface
                    const theta = Math.random() * Math.PI * 2; // Azimuthal angle
                    const phi = Math.acos(2 * Math.random() - 1); // Polar angle (uniform distribution)

                    const x = eventHorizonRadius * Math.sin(phi) * Math.cos(theta);
                    const y = eventHorizonRadius * Math.sin(phi) * Math.sin(theta);
                    const z = eventHorizonRadius * Math.cos(phi);

                    positions[i * 3] = x;
                    positions[i * 3 + 1] = y;
                    positions[i * 3 + 2] = z;

                    // Slow outward velocity (escape velocity from event horizon)
                    const escapeSpeed = 0.05; // Very slow drift
                    const nx = x / eventHorizonRadius;
                    const ny = y / eventHorizonRadius;
                    const nz = z / eventHorizonRadius;

                    velocities[i * 3] = nx * escapeSpeed;
                    velocities[i * 3 + 1] = ny * escapeSpeed;
                    velocities[i * 3 + 2] = nz * escapeSpeed;

                    // Reset lifetime
                    lifetimes[i] = maxLifetime;

                    break; // Only spawn one particle per interval
                }
            }
        }
    }

    // Mark attributes as needing update
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.lifetime.needsUpdate = true;

    // Update material opacity based on average lifetime (fade out entire system)
    const activeParticles = lifetimes.filter(life => life > 0).length;
    if (activeParticles > 0) {
        const avgLifeFraction = lifetimes.reduce((sum, life) => sum + (life > 0 ? life / maxLifetime : 0), 0) / activeParticles;
        hawkingParticles.material.opacity = Math.min(0.6, avgLifeFraction * 0.6);
    } else {
        hawkingParticles.material.opacity = 0.0;
    }
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

    const {diskMesh, topJetMesh, bottomJetMesh, hawkingParticles, lensingRingMesh} = blackHoleGroup.userData;
    const diskMaterial = diskMesh.material;

    // Update time for shader animation (convert ms to seconds)
    const timeInSeconds = deltaTime * 0.001;
    if (diskMaterial.uniforms && diskMaterial.uniforms.time) {
        diskMaterial.uniforms.time.value += timeInSeconds;
    }

    // Update jet animations
    if (topJetMesh && topJetMesh.material.uniforms) {
        topJetMesh.material.uniforms.time.value += timeInSeconds;
    }
    if (bottomJetMesh && bottomJetMesh.material.uniforms) {
        bottomJetMesh.material.uniforms.time.value += timeInSeconds;
    }

    // Update Hawking radiation particle system
    if (hawkingParticles) {
        updateHawkingRadiation(hawkingParticles, timeInSeconds);
    }

    // Update gravitational lensing ring animation
    if (lensingRingMesh && lensingRingMesh.material.uniforms) {
        lensingRingMesh.material.uniforms.time.value += timeInSeconds;
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
