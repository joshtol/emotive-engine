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
    // ACCRETION DISK - REMOVED
    // Disk with gravitational lensing CANNOT be done with flat geometry
    // Must use fullscreen raymarching shader (see threejs-blackhole reference)
    // ═══════════════════════════════════════════════════════════════════════════
    // TODO: Implement fullscreen quad with raymarching shader

    // ═══════════════════════════════════════════════════════════════════════════
    // PHOTON RING (Mesh 3)
    // Thin, bright ring at photon sphere where light orbits
    // ═══════════════════════════════════════════════════════════════════════════

    const photonRingRadius = SCHWARZSCHILD_RADIUS * 1.5;  // Photon sphere
    const photonRingThickness = SCHWARZSCHILD_RADIUS * 0.08;  // Thin but visible

    const photonRingGeometry = new THREE.TorusGeometry(
        photonRingRadius,
        photonRingThickness,
        64,   // Tubular segments
        128   // Radial segments
    );

    // Rotate to match disk orientation
    photonRingGeometry.rotateX(Math.PI / 2);

    const photonRingMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,  // DISABLED - no light from black hole
        transparent: true,
        opacity: 0.0,  // Completely invisible
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        toneMapped: false
    });

    const photonRingMesh = new THREE.Mesh(photonRingGeometry, photonRingMaterial);
    photonRingMesh.name = 'PhotonRing';
    photonRingMesh.renderOrder = 3; // Render last (brightest on top)

    // Match disk tilt
    photonRingMesh.rotation.x = THREE.MathUtils.degToRad(17);

    // ═══════════════════════════════════════════════════════════════════════════
    // GRAVITATIONAL LENSING
    // Implemented entirely in shader via raymarching (see blackHoleWithBlendLayers.js)
    // NO separate geometry needed - lensing is camera-dependent light bending
    // ═══════════════════════════════════════════════════════════════════════════
    // Lensing creates the characteristic "photon ring" and far-side disk visibility
    // This is handled by the fragment shader detecting multiple disk plane intersections

    // ═══════════════════════════════════════════════════════════════════════════
    // RELATIVISTIC JETS (Mesh 5 & 6)
    // Volumetric cone meshes with shader-based glow (synchrotron radiation)
    // ═══════════════════════════════════════════════════════════════════════════

    // Jets are scaled 8x larger to compensate for 0.25x group scaling that happens later
    const jetLength = SCHWARZSCHILD_RADIUS * 16.0;    // 4x final size after 0.25x group scale
    const jetBaseRadius = SCHWARZSCHILD_RADIUS * 1.2;  // 0.3x final size after 0.25x group scale
    const jetTopRadius = SCHWARZSCHILD_RADIUS * 3.2;   // 0.8x final size after 0.25x group scale

    // Use ConeGeometry - it's a solid volumetric shape
    // THREE.ConeGeometry(radiusTop, height, ...) - so we swap base/top to get correct direction
    const topJetGeometry = new THREE.ConeGeometry(jetTopRadius, jetLength, 32, 32, true);

    // Custom shader for volumetric glow with emotion-controlled color gradient
    const topJetMaterial = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec2 vUv;

            void main() {
                vPosition = position;
                vNormal = normalize(normalMatrix * normal);
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float jetIntensity;
            uniform vec3 jetBaseColor;      // Color at base (near black hole)
            uniform vec3 jetTipColor;       // Color at tip (far from black hole)
            uniform vec3 emotionColorTint;  // Emotion-based color tint
            uniform float time;

            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec2 vUv;

            void main() {
                // Height along jet (0 at base, 1 at tip)
                float heightNorm = (vPosition.y + ${(jetLength / 2).toFixed(4)}) / ${jetLength.toFixed(4)};

                // Radial distance from center axis
                float radialDist = length(vPosition.xz) / ${jetTopRadius.toFixed(4)};

                // Bright core that fades outward radially
                float coreBrightness = 1.0 - smoothstep(0.0, 0.7, radialDist);
                coreBrightness = pow(coreBrightness, 0.3);

                // Full ray visibility - fade to transparent at far ends
                // heightNorm = 1.0 is AT THE BLACK HOLE (narrow end)
                // heightNorm = 0.0 is FAR AWAY (wide end, should fade to TRANSPARENT)
                float rayVisibility = smoothstep(0.0, 0.2, heightNorm);  // Fade out at far end faster
                rayVisibility = pow(rayVisibility, 3.0);  // Even sharper fade to nothing

                // Smooth brightness gradient from black hole to tip
                // Create smooth exponential falloff from bright at black hole to dim at tip
                float brightnessGradient = pow(heightNorm, 1.5);  // Smooth gradient along length

                // BRIGHT glowing section near black hole (extra brightness boost)
                float brightGlow = smoothstep(0.85, 1.0, heightNorm);  // Bright in last 15% near black hole
                brightGlow = pow(brightGlow, 2.0);  // Concentrated glow

                // Animated streaming effect (MUCH slower for space-like motion)
                float stream = fract(heightNorm * 2.0 - time * 0.05);  // Dramatically slower (was 0.3)
                stream = smoothstep(0.0, 0.15, stream) * smoothstep(0.4, 0.25, stream);

                // STRONG color gradient from base to tip
                vec3 gradientColor = mix(jetBaseColor, jetTipColor, pow(heightNorm, 0.7));

                // Apply emotion tint
                vec3 finalColorBase = gradientColor * emotionColorTint;

                // Calculate brightness: smooth gradient + bright glow near black hole + subtle streaming
                float baseBrightness = (coreBrightness * brightnessGradient * 0.5 + stream * 0.1) * rayVisibility;
                float glowBrightness = coreBrightness * brightGlow * 2.5;  // Extra bright near black hole (reduced from 4.0)
                float brightness = (baseBrightness + glowBrightness) * jetIntensity;
                vec3 finalColor = finalColorBase * brightness;

                // For additive blending, RGB values ARE the brightness
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `,
        uniforms: {
            time: { value: 0.0 },
            jetIntensity: { value: 0.8 },
            jetBaseColor: { value: new THREE.Color(1.0, 0.4, 0.9) },      // Bright magenta/purple at base
            jetTipColor: { value: new THREE.Color(0.3, 0.5, 1.0) },       // Blue at tip
            emotionColorTint: { value: new THREE.Color(1.0, 1.0, 1.0) }   // Default white (no tint)
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
        toneMapped: false
    });

    const topJetMesh = new THREE.Mesh(topJetGeometry, topJetMaterial);
    topJetMesh.name = 'TopJet';
    // Rotate 180° so narrow end points at black hole
    topJetMesh.rotation.z = Math.PI;
    topJetMesh.position.y = shadowRadius + (jetLength / 2);
    topJetMesh.renderOrder = 4;

    // Bottom jet
    const bottomJetGeometry = topJetGeometry.clone();
    const bottomJetMaterial = topJetMaterial.clone();
    bottomJetMaterial.uniforms = {
        time: { value: 0.0 },
        jetIntensity: { value: 0.8 },
        jetBaseColor: { value: new THREE.Color(1.0, 0.4, 0.9) },      // Bright magenta/purple at base
        jetTipColor: { value: new THREE.Color(0.3, 0.5, 1.0) },       // Blue at tip
        emotionColorTint: { value: new THREE.Color(1.0, 1.0, 1.0) }   // Default white (no tint)
    };

    const bottomJetMesh = new THREE.Mesh(bottomJetGeometry, bottomJetMaterial);
    bottomJetMesh.name = 'BottomJet';
    // No rotation needed - default cone orientation is correct for downward jet
    bottomJetMesh.position.y = -(shadowRadius + (jetLength / 2));
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

    // Use custom shader to render circular particles (not squares)
    const hawkingMaterial = new THREE.ShaderMaterial({
        vertexShader: `
            attribute float lifetime;
            uniform float maxLifetime;
            varying float vAlpha;

            void main() {
                // Fade out as lifetime approaches 0
                vAlpha = lifetime / maxLifetime;

                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = 0.08 * (300.0 / -mvPosition.z); // Size attenuation
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying float vAlpha;

            void main() {
                // Create circular particle using gl_PointCoord
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center);

                // Discard fragments outside circle
                if (dist > 0.5) discard;

                // Soft edge falloff
                float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;

                // Bright white HDR glow
                vec3 color = vec3(1.0, 1.0, 1.0) * 2.0; // HDR brightness

                gl_FragColor = vec4(color, alpha);
            }
        `,
        uniforms: {
            maxLifetime: { value: hawkingMaxLifetime }
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false
    });

    const hawkingParticles = new THREE.Points(hawkingGeometry, hawkingMaterial);
    hawkingParticles.name = 'HawkingRadiation';
    hawkingParticles.renderOrder = 5;

    // Store particle system metadata
    hawkingParticles.userData = {
        spawnRate: 0.0,            // Disabled by default (enable via UI slider)
        timeSinceLastSpawn: 0.0,
        maxLifetime: hawkingMaxLifetime,
        eventHorizonRadius: SCHWARZSCHILD_RADIUS * 2.05 // Spawn just outside shadow
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // GRAVITATIONAL LENSING RING (Mesh 7)
    // ═══════════════════════════════════════════════════════════════════════════
    // Visual simulation of gravitational lensing - Einstein ring effect
    // Glowing, shimmering ring just outside event horizon shadow
    // Creates illusion of light bending around black hole

    const lensingRingRadius = shadowRadius * 1.05; // Just outside shadow
    const lensingRingThickness = SCHWARZSCHILD_RADIUS * 0.25; // Thicker for visibility

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
                float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 1.5);

                // Shimmering wave effect (rotating distortion)
                float wave1 = sin(vUv.x * 20.0 + time * 2.0) * 0.5 + 0.5;
                float wave2 = sin(vUv.y * 15.0 - time * 3.0) * 0.5 + 0.5;
                float shimmer = wave1 * wave2 * 0.5 + 0.5; // Less extreme variation

                // Radial brightness gradient (brighter in center of ring cross-section)
                float radialGradient = 1.0 - abs(vUv.x - 0.5) * 2.0;
                radialGradient = smoothstep(0.0, 1.0, radialGradient);

                // Base brightness (always visible)
                float baseBrightness = 0.7;

                // Combine effects
                float brightness = (baseBrightness + fresnel * shimmer * radialGradient * 0.3) * lensingStrength;

                // Einstein ring glow (warm lensed starlight)
                vec3 finalColor = lensingColor * brightness;
                float alpha = brightness;

                gl_FragColor = vec4(finalColor, alpha);
            }
        `,
        uniforms: {
            time: { value: 0.0 },
            lensingStrength: { value: 0.0 },  // DISABLED - no light from black hole
            lensingColor: { value: new THREE.Color(0.0, 0.0, 0.0) }  // Black
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
    // diskMesh REMOVED - lensing requires fullscreen raymarching
    group.add(photonRingMesh);
    group.add(topJetMesh);
    group.add(bottomJetMesh);
    group.add(hawkingParticles);
    group.add(lensingRingMesh);

    // Scale entire group to match other geometries (radius ~0.5 default scale)
    // This makes the black hole similar size to sphere, moon, sun, etc.
    const targetRadius = 0.5;
    const currentRadius = SCHWARZSCHILD_RADIUS * 8.0; // Use disk outer radius constant
    const scaleFactor = targetRadius / currentRadius;
    group.scale.set(scaleFactor, scaleFactor, scaleFactor);

    // Store references for material updates
    group.userData.shadowMesh = shadowMesh;
    // group.userData.diskMesh = diskMesh; // REMOVED
    group.userData.photonRingMesh = photonRingMesh;
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


    // Load noise texture for turbulence
    const noisePath = '/assets/textures/perlin-noise-512.png';
    const noiseTexture = textureLoader.load(
        noisePath,
        texture => {
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

            // Gravitational lensing (far-side disk visibility)
            lensingEnabled: { value: 1.0 },              // 1.0 = enabled by default
            schwarzschildRadius: { value: SCHWARZSCHILD_RADIUS },
            diskNormal: { value: new THREE.Vector3(Math.sin(THREE.MathUtils.degToRad(17)), Math.cos(THREE.MathUtils.degToRad(17)), 0) }, // Tilted disk normal

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
 * Only spawns particles on the back hemisphere (away from camera) to prevent
 * particles appearing in front of the black hole.
 *
 * @param {THREE.Points} hawkingParticles - Hawking radiation particle system
 * @param {number} deltaTime - Time since last frame (seconds)
 * @param {THREE.Vector3} cameraPosition - Camera position in world space (optional)
 */
function updateHawkingRadiation(hawkingParticles, deltaTime, cameraPosition = null) {
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
                    // ONLY on back hemisphere (away from camera) to prevent particles in front of black hole
                    let x, y, z, attempts = 0;
                    const maxAttempts = 100; // Prevent infinite loop

                    do {
                        const theta = Math.random() * Math.PI * 2; // Azimuthal angle
                        const phi = Math.acos(2 * Math.random() - 1); // Polar angle (uniform distribution)

                        x = eventHorizonRadius * Math.sin(phi) * Math.cos(theta);
                        y = eventHorizonRadius * Math.sin(phi) * Math.sin(theta);
                        z = eventHorizonRadius * Math.cos(phi);

                        attempts++;

                        // If no camera position, spawn anywhere (backwards compatibility)
                        if (!cameraPosition) break;

                        // Check if point is on back hemisphere (dot product with camera direction < 0)
                        // Camera direction from black hole center (0,0,0) to camera
                        const toCameraDotProduct = x * cameraPosition.x + y * cameraPosition.y + z * cameraPosition.z;

                        // If dot product is negative, point faces away from camera (back hemisphere)
                        if (toCameraDotProduct < 0) break;

                    } while (attempts < maxAttempts);

                    // If we failed to find a back-hemisphere point, skip this spawn
                    if (cameraPosition && attempts >= maxAttempts) {
                        break;
                    }

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
 * @param {THREE.Vector3} options.cameraPosition - Camera position for Hawking radiation back-hemisphere spawning
 */
export function updateBlackHoleMaterial(blackHoleGroup, deltaTime, options = {}) {
    if (!blackHoleGroup) return;

    const {diskMesh, topJetMesh, bottomJetMesh, hawkingParticles, lensingRingMesh} = blackHoleGroup.userData;

    // Update time for shader animation (convert ms to seconds)
    const timeInSeconds = deltaTime * 0.001;

    // Update disk material if it exists
    if (diskMesh && diskMesh.material.uniforms && diskMesh.material.uniforms.time) {
        diskMesh.material.uniforms.time.value += timeInSeconds;

        // Update emotion color tint if provided
        if (options.emotionColorTint && diskMesh.material.uniforms.emotionColorTint) {
            diskMesh.material.uniforms.emotionColorTint.value.set(
                options.emotionColorTint[0],
                options.emotionColorTint[1],
                options.emotionColorTint[2]
            );
        }

        if (options.emotionColorStrength !== undefined && diskMesh.material.uniforms.emotionColorStrength) {
            diskMesh.material.uniforms.emotionColorStrength.value = options.emotionColorStrength;
        }
    }

    // Update jet shader animations and emotion color tint
    if (topJetMesh && topJetMesh.material.uniforms) {
        topJetMesh.material.uniforms.time.value += timeInSeconds;

        // Apply emotion color tint to jets
        if (options.emotionColorTint && topJetMesh.material.uniforms.emotionColorTint) {
            topJetMesh.material.uniforms.emotionColorTint.value.set(
                options.emotionColorTint[0],
                options.emotionColorTint[1],
                options.emotionColorTint[2]
            );
        }
    }
    if (bottomJetMesh && bottomJetMesh.material.uniforms) {
        bottomJetMesh.material.uniforms.time.value += timeInSeconds;

        // Apply emotion color tint to jets
        if (options.emotionColorTint && bottomJetMesh.material.uniforms.emotionColorTint) {
            bottomJetMesh.material.uniforms.emotionColorTint.value.set(
                options.emotionColorTint[0],
                options.emotionColorTint[1],
                options.emotionColorTint[2]
            );
        }
    }

    // Update Hawking radiation particle system
    if (hawkingParticles) {
        updateHawkingRadiation(hawkingParticles, timeInSeconds, options.cameraPosition);
    }

    // Update gravitational lensing ring animation
    if (lensingRingMesh && lensingRingMesh.material.uniforms) {
        lensingRingMesh.material.uniforms.time.value += timeInSeconds;
    }
}
