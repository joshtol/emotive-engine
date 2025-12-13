/**
 * Core3DManager - Main orchestrator for Three.js 3D rendering
 *
 * Manages:
 * - Three.js renderer
 * - 3D geometry selection
 * - Animation playback
 * - Emotion-based lighting and materials
 *
 * @class Core3DManager
 */

import * as THREE from 'three';
import { ThreeRenderer } from './ThreeRenderer.js';
import { THREE_GEOMETRIES } from './geometries/ThreeGeometries.js';
import { ProceduralAnimator } from './animation/ProceduralAnimator.js';
import { BreathingAnimator } from './animation/BreathingAnimator.js';
import { GestureBlender } from './animation/GestureBlender.js';
import { BlinkAnimator } from './animation/BlinkAnimator.js';
import { rhythm3DAdapter } from './animation/Rhythm3DAdapter.js';
import { GeometryMorpher } from './utils/GeometryMorpher.js';
import RotationBehavior from './behaviors/RotationBehavior.js';
import RightingBehavior from './behaviors/RightingBehavior.js';
import FacingBehavior from './behaviors/FacingBehavior.js';
import { updateSunMaterial, SUN_ROTATION_CONFIG } from './geometries/Sun.js';
import { getEmotion } from '../core/emotions/index.js';
import { getGesture } from '../core/gestures/index.js';
import { getUndertoneModifier } from '../config/undertoneModifiers.js';
import { hexToRGB, rgbToHsl, hslToRgb, applyUndertoneSaturation } from './utils/ColorUtilities.js';
import { getGlowIntensityForColor, normalizeColorLuminance, normalizeRGBLuminance } from '../utils/glowIntensityFilter.js';
import ParticleSystem from '../core/ParticleSystem.js';
import { Particle3DTranslator } from './particles/Particle3DTranslator.js';
import { CrystalSoul } from './effects/CrystalSoul.js';
import { Particle3DRenderer } from './particles/Particle3DRenderer.js';
import { Particle3DOrchestrator } from './particles/Particle3DOrchestrator.js';
import { SolarEclipse } from './effects/SolarEclipse.js';
import { LunarEclipse } from './effects/LunarEclipse.js';
import { updateMoonGlow, MOON_CALIBRATION_ROTATION, MOON_FACING_CONFIG } from './geometries/Moon.js';
import { createCustomMaterial, disposeCustomMaterial } from './utils/MaterialFactory.js';
import { resetGeometryState } from './GeometryStateManager.js';
import * as GeometryCache from './utils/GeometryCache.js';

// Crystal calibration rotation to show flat facet facing camera
// Hexagonal crystal has vertices at 0°, 60°, 120°, etc.
// Rotating 30° around Y puts a flat face toward the camera (default -Z view direction)
const CRYSTAL_CALIBRATION_ROTATION = {
    x: 0,    // No X rotation
    y: 30,   // 30° Y rotation to show flat facet
    z: 0     // No Z rotation
};

export class Core3DManager {
    /**
     * Create a new Core3DManager instance
     * @param {HTMLCanvasElement} canvas - WebGL canvas element
     * @param {Object} [options={}] - Configuration options
     * @param {string} [options.geometry='sphere'] - Geometry type (sphere, crystal, diamond, moon, sun, etc.)
     * @param {string} [options.emotion='neutral'] - Initial emotion state
     * @param {boolean} [options.enableParticles=true] - Enable particle effects
     * @param {boolean} [options.enablePostProcessing=true] - Enable post-processing (bloom, etc.)
     * @param {boolean} [options.enableShadows=false] - Enable shadow rendering
     * @param {boolean} [options.enableControls=true] - Enable camera orbit controls
     * @param {boolean} [options.autoRotate=true] - Enable auto-rotation
     * @param {number} [options.autoRotateSpeed=0.5] - Auto-rotate speed
     * @param {boolean} [options.enableBlinking=true] - Enable blinking animation
     * @param {boolean} [options.enableBreathing=true] - Enable breathing animation
     * @param {number} [options.cameraDistance=3] - Camera Z distance from origin
     * @param {number} [options.fov=45] - Camera field of view in degrees
     * @param {number} [options.minZoom] - Minimum zoom distance
     * @param {number} [options.maxZoom] - Maximum zoom distance
     * @param {string} [options.materialVariant] - Material variant override
     * @param {string} [options.assetBasePath='/assets'] - Base path for loading assets (textures, models)
     */
    constructor(canvas, options = {}) {
        this._instanceId = Math.random().toString(36).substr(2, 6);

        this.canvas = canvas;
        this.options = options;
        this._destroyed = false;
        this._ready = false;  // Flag indicating all async loading is complete
        this._readyPromise = null;  // Promise that resolves when ready

        // Asset base path for textures and models (configurable for GitHub Pages, etc.)
        this.assetBasePath = options.assetBasePath || '/assets';

        // Load geometry type first (needed to determine if moon = tidally locked)
        this.geometryType = options.geometry || 'sphere';

        // Initialize Three.js renderer
        // Moon is tidally locked - disable auto-rotate for moon regardless of options
        const isMoon = this.geometryType === 'moon';
        this.renderer = new ThreeRenderer(canvas, {
            enablePostProcessing: options.enablePostProcessing !== false,
            enableShadows: options.enableShadows || false,
            enableControls: options.enableControls !== false, // Camera controls (mouse/touch)
            autoRotate: isMoon ? false : (options.autoRotate !== false), // Moon is tidally locked
            autoRotateSpeed: options.autoRotateSpeed, // Auto-rotate speed (undefined = default 0.5)
            cameraDistance: options.cameraDistance, // Camera Z distance (undefined = default 3)
            fov: options.fov, // Field of view (undefined = default 45)
            minZoom: options.minZoom, // Minimum zoom distance
            maxZoom: options.maxZoom, // Maximum zoom distance
            assetBasePath: this.assetBasePath // Base path for HDRI and other assets
        });
        const geometryConfig = THREE_GEOMETRIES[this.geometryType];

        if (!geometryConfig) {
            console.warn(`Unknown geometry: ${this.geometryType}, falling back to sphere`);
            this.geometryConfig = THREE_GEOMETRIES.sphere;
        } else {
            this.geometryConfig = geometryConfig;
        }

        this.geometry = this.geometryConfig.geometry;

        // Store geometry type name for material/rendering logic
        if (this.geometry && !this.geometry.isGroup) {
            this.geometry.userData.geometryType = this.geometryType;
        }

        // Store materialVariant for use when morphing geometries
        this.materialVariant = options.materialVariant || null;

        // Callback for when material is swapped during morph (allows immediate preset application)
        this.onMaterialSwap = null;

        // Check if this geometry requires custom material (e.g., moon with textures, sun with emissive)
        // Use MaterialFactory for centralized material creation
        // IMPORTANT: Must create material BEFORE calling _loadAsyncGeometry so it's available when OBJ loads
        let customMaterial = null;
        const emotionData = getEmotion(this.emotion);
        const materialResult = createCustomMaterial(this.geometryType, this.geometryConfig, {
            glowColor: this.glowColor || [1.0, 1.0, 0.95],
            glowIntensity: this.glowIntensity || 1.0,
            materialVariant: this.materialVariant,
            emotionData, // Pass emotion data for auto-deriving geometry params
            assetBasePath: this.assetBasePath
        });

        if (materialResult) {
            customMaterial = materialResult.material;
            this.customMaterial = customMaterial;
            this.customMaterialType = materialResult.type;
        }

        // Check for async geometry loader (e.g., OBJ models)
        // Must be called AFTER material is created so this.customMaterial is available
        if (this.geometryConfig.geometryLoader) {
            // Store promise so callers can await full initialization
            this._readyPromise = this._loadAsyncGeometry();
        } else {
            // No async loading needed - immediately ready
            this._ready = true;
            this._readyPromise = Promise.resolve();
        }

        // Create core mesh with geometry (and optional custom material)
        // If geometry is null (e.g., crystal waiting for OBJ), defer mesh creation
        if (this.geometry === null && this.geometryConfig.geometryLoader) {
            this._deferredMeshCreation = true;
            // Mesh will be created in _loadAsyncGeometry when OBJ loads
        } else {
            this.coreMesh = this.renderer.createCoreMesh(this.geometry, customMaterial);

            // For crystal/rough with blend-layers shader, create inner glowing core
            if (this.customMaterialType === 'crystal') {
                this.createCrystalInnerCore();
            }
        }

        // Calibration rotation offset (applied on top of all animations)
        // Used for moon orientation calibration
        this.calibrationRotation = [0, 0, 0]; // [X, Y, Z] in radians

        // Camera-space roll: rotates the tidally-locked face around camera's viewing axis
        // Applied AFTER all world-space rotations, spins the face like a wheel
        this.cameraRoll = 0; // in radians

        // Set initial calibration rotation for moon to show classic Earth-facing side
        // This shows the "Man in the Moon" view with Mare Imbrium upper-right
        if (this.geometryType === 'moon') {
            const degToRad = Math.PI / 180;
            this.calibrationRotation = [
                MOON_CALIBRATION_ROTATION.x * degToRad,  // X: world-space rotation
                MOON_CALIBRATION_ROTATION.y * degToRad,  // Y: world-space rotation
                MOON_CALIBRATION_ROTATION.z * degToRad   // Z: camera-space roll (spins face CW/CCW)
            ];
            this.cameraRoll = 0; // Camera-space roll (spin the face)
        }

        // Set initial calibration rotation for crystal/rough/heart/star to show flat facet facing camera
        if (this.geometryType === 'crystal' || this.geometryType === 'rough' || this.geometryType === 'heart' || this.geometryType === 'star') {
            const degToRad = Math.PI / 180;
            this.calibrationRotation = [
                CRYSTAL_CALIBRATION_ROTATION.x * degToRad,
                CRYSTAL_CALIBRATION_ROTATION.y * degToRad,
                CRYSTAL_CALIBRATION_ROTATION.z * degToRad
            ];
        }

        // Animation controller
        this.animator = new ProceduralAnimator();

        // Breathing animator
        this.breathingAnimator = new BreathingAnimator();
        this.breathingEnabled = options.enableBreathing !== false; // Enabled by default

        // Gesture blender
        this.gestureBlender = new GestureBlender();

        // Geometry morpher for smooth shape transitions
        this.geometryMorpher = new GeometryMorpher();

        // Blink animator (emotion-aware)
        this.blinkAnimator = new BlinkAnimator(this.geometryConfig);
        this.blinkAnimator.setEmotion(this.emotion);
        this.blinkingManuallyDisabled = false; // Track if user disabled blinking

        // Disable blinking if requested
        if (options.enableBlinking === false) {
            this.blinkAnimator.pause();
            this.blinkingManuallyDisabled = true;
        }

        // Rotation behavior system
        this.rotationBehavior = null; // Will be initialized in setEmotion
        this.rotationDisabled = options.autoRotate === false; // Disable rotation if autoRotate is false
        this.wobbleEnabled = true; // Wobble/shake effects enabled by default

        // Righting behavior (self-stabilization like inflatable punching clowns)
        // Tuned for smooth return to upright without oscillation
        this.rightingBehavior = new RightingBehavior({
            strength: 5.0,              // Strong righting without overdoing it (was 50.0)
            damping: 0.85,              // Critically damped for smooth return (was 0.99)
            centerOfMass: [0, -0.3, 0], // Bottom-heavy
            axes: { pitch: true, roll: true, yaw: false }
        });

        // Facing behavior (tidal lock - keeps one face toward camera)
        // Initialized for moon geometry, null for others
        this.facingBehavior = null;
        if (isMoon && MOON_FACING_CONFIG.enabled) {
            const degToRad = Math.PI / 180;
            this.facingBehavior = new FacingBehavior({
                strength: MOON_FACING_CONFIG.strength,
                lockedFace: MOON_FACING_CONFIG.lockedFace,
                lerpSpeed: MOON_FACING_CONFIG.lerpSpeed,
                calibrationRotation: [
                    MOON_CALIBRATION_ROTATION.x * degToRad,
                    MOON_CALIBRATION_ROTATION.y * degToRad,
                    MOON_CALIBRATION_ROTATION.z * degToRad
                ]
            }, this.renderer.camera);
        }

        // Current state
        this.emotion = options.emotion || 'neutral';
        this.undertone = options.undertone || null;
        this.glowColor = [1.0, 1.0, 1.0]; // RGB
        this.glowColorHex = '#FFFFFF'; // Hex color for luminance normalization
        this.glowIntensity = 1.0;
        this.coreGlowEnabled = true; // Toggle to enable/disable core glow
        this.glowIntensityOverride = null; // Manual override for testing
        this.intensityCalibrationOffset = 0; // Universal filter calibration offset

        // Quaternion-based rotation system for smooth 3D orientation
        this.baseEuler = [0, 0, 0]; // Persistent base Euler angles (updated by RotationBehavior)
        this.baseQuaternion = new THREE.Quaternion(); // Ambient rotation (from emotion state)
        this.gestureQuaternion = new THREE.Quaternion(); // Gesture delta rotation (for debugging)
        this.tempEuler = new THREE.Euler(); // Temp for conversions
        this.rotation = [0, 0, 0]; // Final Euler angles for renderer

        // Match 2D sizing: core is 1/12th of canvas size (coreSizeDivisor: 12)
        this.baseScale = 0.16; // Properly sized core relative to particles
        this.scale = 0.16; // Current scale (base + animation)
        this.position = [0, 0, 0];

        // Rhythm engine reference (for BPM sync)
        this.rhythmEngine = options.rhythmEngine || null;

        // Initialize 3D rhythm adapter for beat-synced animations
        this.rhythm3DAdapter = rhythm3DAdapter;
        this.rhythmEnabled = options.enableRhythm !== false; // Enabled by default
        if (this.rhythmEnabled) {
            this.rhythm3DAdapter.initialize();
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // PARTICLE SYSTEM INTEGRATION
        // ═══════════════════════════════════════════════════════════════════════════

        // Enable/disable particles
        this.particlesEnabled = options.enableParticles !== false;
        this.particleVisibility = this.particlesEnabled; // Runtime toggle matches initial state

        // ALWAYS create particle system (even if disabled) so it can be toggled later
        // Create 2D particle system (reuse existing logic)
        const particleSystem = new ParticleSystem(50); // 50 particles max

        // Set canvas size for particle spawning
        particleSystem.canvasWidth = canvas.width;
        particleSystem.canvasHeight = canvas.height;

        // Create 3D translator (converts 2D → 3D)
        // Note: coreRadius3D is now updated each frame from Core3DManager
        // to ensure particles orbit at correct distance regardless of screen size
        const particleTranslator = new Particle3DTranslator({
            worldScale: 2.0,
            baseRadius: 1.5,      // Legacy fallback (coreRadius3D takes precedence)
            depthScale: 0.75,
            verticalScale: 1.0,
            coreRadius3D: 2.0     // Initial value, updated each frame
        });

        // Create 3D renderer (Three.js points system)
        // Increased particle count for richer particle effects
        const particleRenderer = new Particle3DRenderer(150, { renderer: this.renderer.renderer });

        // Add particle points to scene
        const particlePoints = particleRenderer.getPoints();
        // Put particles on layer 1 for separate particle bloom pipeline
        // Layer 1 uses white clear color to prevent dark halos from blur sampling
        particlePoints.layers.set(1);
        this.renderer.scene.add(particlePoints);

        // Create orchestrator (coordinates everything)
        this.particleOrchestrator = new Particle3DOrchestrator(
            particleSystem,
            particleTranslator,
            particleRenderer
        );

        // Set geometry type for special rendering rules (e.g., black hole particle culling)
        this.particleOrchestrator.setGeometryType(this.geometryType);

        // If particles disabled, hide them immediately
        if (!this.particlesEnabled) {
            particleRenderer.geometry.setDrawRange(0, 0);
        }

        // Initialize solar eclipse system for sun geometry
        if (this.geometryType === 'sun') {
            const sunRadius = this.geometry.parameters?.radius || 0.5; // Sun geometry radius is 0.5
            this.solarEclipse = new SolarEclipse(this.renderer.scene, sunRadius, this.coreMesh);
        }

        // Initialize lunar eclipse system for moon geometry
        if (this.geometryType === 'moon' && this.customMaterial) {
            this.lunarEclipse = new LunarEclipse(this.customMaterial);
        }

        // Virtual particle object pool for gesture animations (prevent closure memory leaks)
        this.virtualParticlePool = this.createVirtualParticlePool(5); // Pool of 5 reusable particles
        this.nextPoolIndex = 0;

        // Apply default glass mode for initial geometry (if specified)
        // Crystal and diamond geometries have defaultGlassMode: true
        // BUT skip this if we have a custom material (e.g., blend-layers shader)
        if (this.geometryConfig.defaultGlassMode && !this.customMaterial) {
            this.setGlassMaterialEnabled(true);
        }

        // Initialize emotion
        this.setEmotion(this.emotion);
    }

    /**
     * Create reusable virtual particle object pool
     * @param {number} size - Pool size
     * @returns {Array} Array of reusable particle objects
     */
    createVirtualParticlePool(size) {
        const pool = [];
        for (let i = 0; i < size; i++) {
            pool.push({
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                size: 1,
                baseSize: 1,
                opacity: 1,
                scaleFactor: 1,
                gestureData: null
            });
        }
        return pool;
    }

    /**
     * Get next virtual particle from pool (round-robin)
     * @returns {Object} Reusable virtual particle object
     */
    getVirtualParticleFromPool() {
        const particle = this.virtualParticlePool[this.nextPoolIndex];
        this.nextPoolIndex = (this.nextPoolIndex + 1) % this.virtualParticlePool.length;

        // Reset particle to default state
        particle.x = 0;
        particle.y = 0;
        particle.vx = 0;
        particle.vy = 0;
        particle.size = 1;
        particle.baseSize = 1;
        particle.opacity = 1;
        particle.scaleFactor = 1;
        particle.gestureData = null;

        return particle;
    }

    /**
     * Set emotional state
     * Updates glow color, lighting, rotation behavior, and triggers emotion animation
     * @param {string} emotion - Emotion name
     * @param {string|null} undertone - Optional undertone modifier
     */
    setEmotion(emotion, undertone = null) {
        this.emotion = emotion;
        this.undertone = undertone;

        // Get emotion color and intensity from existing emotion system
        const emotionData = getEmotion(emotion);
        if (emotionData && emotionData.visual) {
            // Convert hex to RGB
            if (emotionData.visual.glowColor) {
                let rgb = hexToRGB(emotionData.visual.glowColor);

                // Apply undertone saturation modifier to glow color
                rgb = applyUndertoneSaturation(rgb, undertone);

                this.glowColor = rgb;
                // Store hex color for bloom luminance normalization
                this.glowColorHex = emotionData.visual.glowColor;

                // Calculate intensity using universal filter based on color luminance
                // This ensures consistent visibility across all emotions regardless of color brightness
                const materialMode = this.renderer.materialMode || 'glass';
                this.glowIntensity = getGlowIntensityForColor(
                    emotionData.visual.glowColor,
                    this.intensityCalibrationOffset,
                    materialMode
                );
            }

            // Update Three.js lighting based on emotion
            this.renderer.updateLighting(emotion, emotionData);

            // Update custom material with emotion glow color
            if (this.customMaterial && this.customMaterialType === 'moon') {
                const glowColorThree = new THREE.Color(this.glowColor[0], this.glowColor[1], this.glowColor[2]);
                updateMoonGlow(this.customMaterial, glowColorThree, this.glowIntensity);
            } else if (this.customMaterial && this.customMaterialType === 'sun') {
                // Update sun material colors (no time delta needed here - just color update)
                updateSunMaterial(this.coreMesh, this.glowColor, this.glowIntensity, 0);
            }

            // Note: Bloom is updated every frame in render() for smooth transitions
        }

        // Initialize or update rotation behavior from 3d config
        // EXCEPTION: Moon is tidally locked - no rotation behavior
        // EXCEPTION: Black hole disk rotates in shader - no mesh rotation
        // EXCEPTION: If rotation was manually disabled, respect that
        // Get geometry-specific rotation config if available
        const geometryRotation = this.geometryType === 'sun' ? SUN_ROTATION_CONFIG : null;

        if (this.rotationDisabled) {
            this.rotationBehavior = null; // Keep rotation disabled
        } else if (this.geometryType === 'moon') {
            this.rotationBehavior = null; // Disable rotation for moon (tidally locked)
        } else if (emotionData && emotionData['3d'] && emotionData['3d'].rotation) {
            if (this.rotationBehavior) {
                // Update existing behavior
                this.rotationBehavior.updateConfig(emotionData['3d'].rotation);
            } else {
                // Create new rotation behavior with geometry-specific base rotation
                this.rotationBehavior = new RotationBehavior(
                    emotionData['3d'].rotation,
                    this.rhythmEngine,
                    geometryRotation
                );
                // Apply wobble enabled state
                this.rotationBehavior.setWobbleEnabled(this.wobbleEnabled);
            }
        } else {
            // Fall back to default gentle rotation if no 3d config
            // BUT: Don't create if rotation is disabled
            if (!this.rotationBehavior && !this.rotationDisabled) {
                this.rotationBehavior = new RotationBehavior(
                    { type: 'gentle', speed: 1.0, axes: [0, 0.01, 0] },
                    this.rhythmEngine,
                    geometryRotation
                );
                // Apply wobble enabled state
                this.rotationBehavior.setWobbleEnabled(this.wobbleEnabled);
            }
        }

        // Reset orientation when changing emotions to prevent stuck angles
        // (e.g., anger's shake can push to max tilt, needs reset when switching to calm emotion)
        if (this.rightingBehavior) {
            this.rightingBehavior.reset();
        }
        // Reset Euler angles to upright [pitch=0, yaw=current, roll=0]
        // Preserve yaw to maintain current spin direction, but reset pitch/roll
        this.baseEuler[0] = 0; // Reset pitch
        this.baseEuler[2] = 0; // Reset roll
        // Keep baseEuler[1] (yaw) to preserve rotation continuity

        // Apply undertone multipliers if present
        const undertoneModifier = getUndertoneModifier(undertone);

        if (undertoneModifier && undertoneModifier['3d']) {
            const ut3d = undertoneModifier['3d'];

            // Apply rotation multipliers to RotationBehavior
            if (ut3d.rotation && this.rotationBehavior) {
                this.rotationBehavior.applyUndertoneMultipliers(ut3d.rotation);
            }

            // Apply righting multipliers to RightingBehavior
            if (ut3d.righting && this.rightingBehavior) {
                this.rightingBehavior.applyUndertoneMultipliers(ut3d.righting);
            }
        }

        // Stop all previous emotion animations to prevent stacking
        this.animator.stopAll();

        // Store base glow intensity for this emotion (before animation modulation)
        // Use universal filter to calculate intensity from color luminance
        // Pass material mode so formula adjusts correctly (glass vs glow mode)
        const glowColor = emotionData?.visual?.glowColor || '#00BCD4';
        const materialMode = this.renderer.materialMode || 'glass';
        this.baseGlowIntensity = getGlowIntensityForColor(
            glowColor,
            this.intensityCalibrationOffset,
            materialMode
        );


        // Apply undertone glow multiplier to base intensity
        if (undertoneModifier && undertoneModifier['3d'] && undertoneModifier['3d'].glow) {
            const beforeUndertone = this.baseGlowIntensity;
            this.baseGlowIntensity *= undertoneModifier['3d'].glow.intensityMultiplier;
        }

        // Update breathing animator with emotion and undertone
        this.breathingAnimator.setEmotion(emotion, undertoneModifier);

        // Update blink animator with new emotion
        this.blinkAnimator.setEmotion(emotion);

        // Immediately reset bloom to prevent accumulation (fast transition on emotion change)
        this.renderer.updateBloom(this.baseGlowIntensity, 1.0, this.geometryType);

        // Trigger emotion animation - now handled by blending system in render()
        this.animator.playEmotion(emotion);

        // ═══════════════════════════════════════════════════════════════════════════
        // UPDATE PARTICLE SYSTEM FOR NEW EMOTION
        // ═══════════════════════════════════════════════════════════════════════════
        if (this.particlesEnabled && this.particleOrchestrator) {
            // Notify orchestrator of emotion change (will recalculate config)
            this.particleOrchestrator.setEmotion(emotion, undertone);
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // UPDATE CRYSTAL SOUL ANIMATION FROM EMOTION CONFIG
        // ═══════════════════════════════════════════════════════════════════════════
        // Soul animation parameters are geometry-agnostic and can be used by:
        // - Crystal (inner core drift/shimmer)
        // - Sun (plasma flow) - future
        // - Moon (subtle glow pulse) - future
        if (emotionData && emotionData.soulAnimation) {
            const soul = emotionData.soulAnimation;
            this.setCrystalSoulEffects({
                driftEnabled: true,
                driftSpeed: soul.driftSpeed || 0.5,
                shimmerEnabled: true,
                shimmerSpeed: soul.shimmerSpeed || 0.5
                // Note: turbulence will be used for future geometries (Sun plasma chaos)
            });
        }
    }

    /**
     * Enable or disable core glow
     * @param {boolean} enabled - True to enable glow, false to disable
     */
    setCoreGlowEnabled(enabled) {
        this.coreGlowEnabled = enabled;

        // Also toggle crystal soul visibility for crystal-type geometries
        if (this.crystalSoul) {
            this.crystalSoul.setVisible(enabled);
        }
    }

    /**
     * Set glass material mode
     * @param {boolean} enabled - True for glass material, false for glow material
     */
    setGlassMaterialEnabled(enabled) {
        const mode = enabled ? 'glass' : 'glow';
        this.renderer.setMaterialMode(mode);
    }

    /**
     * Set glow intensity override
     * @param {number} intensity - Glow intensity value (0.3-10.0 range for auto system, 0.8-1.2 for normalized), or null to clear override
     */
    setGlowIntensity(intensity) {
        this.glowIntensityOverride = intensity;
        if (intensity !== null) {
            this.glowIntensity = intensity;
            this.baseGlowIntensity = intensity;
        }
    }

    /**
     * Convert linear slider value (0-100) to logarithmic glow intensity (0.3-10.0)
     * Use this for UI sliders to make intensity changes feel linear to the user
     *
     * @param {number} sliderValue - Linear slider value (0-100)
     * @returns {number} Logarithmic intensity value (0.3-10.0)
     *
     * @example
     * const sliderVal = 50; // Middle of slider
     * const intensity = core3d.sliderToIntensity(sliderVal);
     * core3d.setGlowIntensity(intensity);
     */
    sliderToIntensity(sliderValue) {
        // Map 0-100 to 0.3-10.0 using exponential curve
        // This makes the slider feel linear while outputting the wide range the system expects
        const normalized = sliderValue / 100; // 0-1
        const min = 0.3;
        const max = 10.0;
        // Exponential mapping: intensity = min * (max/min)^normalized
        return min * Math.pow(max / min, normalized);
    }

    /**
     * Set universal filter intensity calibration offset
     * Adjusts global brightness for all emotions in real-time
     * @param {number} offset - Calibration offset (-0.5 to +0.5 recommended)
     */
    setIntensityCalibration(offset) {
        this.intensityCalibrationOffset = offset;

        // Recalculate current emotion's glow intensity with new offset
        this.setEmotion(this.emotion, this.undertone);
    }

    /**
     * Get current glow intensity
     * @returns {number} Current glow intensity
     */
    getGlowIntensity() {
        return this.glowIntensity;
    }

    /**
     * Play gesture animation using 2D gesture data translated to 3D
     */
    playGesture(gestureName) {
        // Get the 2D gesture definition
        const gesture2D = getGesture(gestureName);

        if (!gesture2D) {
            console.warn(`Unknown gesture: ${gestureName}`);
            return;
        }

        // Get reusable virtual particle from pool (prevent closure memory leaks)
        const virtualParticle = this.getVirtualParticleFromPool();

        // Get gesture config for duration
        const config = gesture2D.config || {};
        const duration = config.musicalDuration?.musical
            ? (config.musicalDuration.beats || 2) * 500  // Assume 120 BPM (500ms per beat)
            : (config.duration || 800);

        // Start time-based animation
        const startTime = this.animator.time;

        const gestureState = {
            virtualParticle,
            gesture: gesture2D,
            duration,
            startTime,
            startPosition: [...this.position],
            startRotation: [...this.rotation],
            startScale: this.scale
        };

        // Enforce animation array size limit (prevent unbounded growth memory leak)
        const MAX_ACTIVE_ANIMATIONS = 10;
        if (this.animator.animations.length >= MAX_ACTIVE_ANIMATIONS) {
            // Remove oldest animation (FIFO cleanup)
            const removed = this.animator.animations.shift();
            console.warn(`⚠️ Animation limit reached (${MAX_ACTIVE_ANIMATIONS}), removed oldest: ${removed.gestureName || 'unknown'}`);
        }

        // Add to animator's active animations
        // Create persistent gesture data object for this gesture instance
        const gestureData = { initialized: false };

        this.animator.animations.push({
            gestureName, // Store gesture name for particle system
            duration,
            startTime,
            config, // Store config for particle system
            evaluate: t => {
                // Reset virtual particle to center each frame
                virtualParticle.x = 0;
                virtualParticle.y = 0;
                virtualParticle.vx = 0;
                virtualParticle.vy = 0;
                virtualParticle.size = 1;
                virtualParticle.opacity = 1;

                // All gestures now have native 3D implementations
                // Apply gesture to virtual particle if needed
                if (gesture2D.apply) {
                    gesture2D.apply(virtualParticle, gestureData, config, t, 1.0, 0, 0);
                }

                // Call gesture's 3D evaluate function with particle data
                const motion = {
                    ...config,
                    particle: virtualParticle,
                    config,
                    strength: config.strength || 1.0
                };

                // Safety check: if gesture doesn't have 3D implementation, return neutral transform
                if (!gesture2D['3d'] || !gesture2D['3d'].evaluate) {
                    return {
                        position: [0, 0, 0],
                        rotation: [0, 0, 0],
                        scale: 1.0
                    };
                }

                // Call with gesture2D as context so 'this.config' works
                return gesture2D['3d'].evaluate.call(gesture2D, t, motion);
            },
            callbacks: {
                onUpdate: (props, _progress) => {
                    if (props.position) this.position = props.position;
                    if (props.rotation) {
                        // Convert gesture Euler rotation to quaternion
                        this.tempEuler.set(props.rotation[0], props.rotation[1], props.rotation[2], 'XYZ');
                        this.gestureQuaternion.setFromEuler(this.tempEuler);
                    }
                    if (props.scale !== undefined) this.scale = this.baseScale * props.scale;
                    // Apply glow intensity as multiplier on base intensity (not absolute override)
                    if (props.glowIntensity !== undefined) {
                        this.glowIntensity = this.baseGlowIntensity * props.glowIntensity;
                    }
                },
                onComplete: () => {
                    // Clean up gesture
                    if (gesture2D.cleanup) {
                        gesture2D.cleanup(virtualParticle);
                    }
                    // Reset to base state
                    this.position = [0, 0, 0];
                    // NOTE: Don't reset rotation - it's computed from quaternions in render()
                    // gestureQuaternion will be reset to identity in render() when no gestures active
                    this.scale = this.baseScale;
                }
            }
        });
    }

    /**
     * Set solar eclipse type (only works for sun geometry)
     * @param {string} eclipseType - Eclipse type: 'off', 'annular', or 'total'
     */
    setSunShadow(eclipseType = 'off') {
        if (this.geometryType !== 'sun' || !this.solarEclipse) {
            console.warn('⚠️ Eclipse only available for sun geometry');
            return;
        }

        // Set eclipse type on the solar eclipse manager
        this.solarEclipse.setEclipseType(eclipseType);
    }

    /**
     * Start a solar eclipse animation
     * Morphs to sun geometry if needed, then triggers eclipse
     * @param {Object} options - Eclipse options
     * @param {string} options.type - Eclipse type: 'annular' or 'total' (default: 'total')
     */
    startSolarEclipse(options = {}) {
        const eclipseType = options.type || 'total';

        // If already on sun, just trigger eclipse
        if (this.geometryType === 'sun' && this.solarEclipse) {
            this.solarEclipse.setEclipseType(eclipseType);
            return;
        }

        // Morph to sun, then trigger eclipse after morph completes
        this.morphToShape('sun');

        // Wait for morph to complete (shrink + grow phases)
        // Default morph duration is 500ms, so wait a bit longer
        setTimeout(() => {
            if (this.solarEclipse) {
                this.solarEclipse.setEclipseType(eclipseType);
            }
        }, 600);
    }

    /**
     * Start a lunar eclipse animation (blood moon)
     * Morphs to moon geometry if needed, then triggers eclipse
     * @param {Object} options - Eclipse options
     * @param {string} options.type - Eclipse type: 'total' (blood moon), 'partial', 'penumbral'
     */
    startLunarEclipse(options = {}) {
        const eclipseType = options.type || 'total';

        // If already on moon, just trigger eclipse
        if (this.geometryType === 'moon' && this.lunarEclipse) {
            this.lunarEclipse.setEclipseType(eclipseType);
            return;
        }

        // Morph to moon, then trigger eclipse after morph completes
        this.morphToShape('moon');

        // Wait for morph to complete (shrink + grow phases)
        setTimeout(() => {
            if (this.lunarEclipse) {
                this.lunarEclipse.setEclipseType(eclipseType);
            }
        }, 600);
    }

    /**
     * Stop any active eclipse animation
     */
    stopEclipse() {
        if (this.solarEclipse) {
            this.solarEclipse.setEclipseType('off');
        }
        if (this.lunarEclipse) {
            this.lunarEclipse.setEclipseType('off');
        }
    }

    /**
     * Set lunar eclipse (Blood Moon) effect
     * @param {string} eclipseType - 'off', 'penumbral', 'partial', 'total'
     */
    setMoonEclipse(eclipseType = 'off') {
        if (this.geometryType !== 'moon' || !this.lunarEclipse) {
            console.warn('⚠️ Lunar eclipse only available for moon geometry');
            return;
        }

        // Set eclipse type on the lunar eclipse manager
        this.lunarEclipse.setEclipseType(eclipseType);
    }

    /**
     * Set blood moon blend parameters
     * @param {Object} params - { blendMode, blendStrength, emissiveStrength, eclipseIntensity }
     */
    setBloodMoonBlend(params = {}) {
        if (this.geometryType !== 'moon' || !this.customMaterial) {
            console.warn('⚠️ Blood moon blend only available for moon geometry');
            return;
        }

        if (params.blendMode !== undefined) {
            this.customMaterial.uniforms.blendMode.value = params.blendMode;
        }
        if (params.blendStrength !== undefined) {
            this.customMaterial.uniforms.blendStrength.value = params.blendStrength;
        }
        if (params.emissiveStrength !== undefined) {
            this.customMaterial.uniforms.emissiveStrength.value = params.emissiveStrength;
        }
        if (params.eclipseIntensity !== undefined) {
            this.customMaterial.uniforms.eclipseIntensity.value = params.eclipseIntensity;
        }
    }

    /**
     * Update a specific blend multiplexer layer
     * @param {number} layerIndex - Layer index (1-4)
     * @param {Object} params - { mode, strength, enabled }
     */
    setBlendLayer(layerIndex, params = {}) {
        if ((this.geometryType !== 'moon' && this.geometryType !== 'sun') || !this.customMaterial) {
            console.warn('⚠️ Blend layers only available for moon and sun geometry');
            return;
        }

        const layerPrefix = `layer${layerIndex}`;

        if (params.mode !== undefined && this.customMaterial.uniforms[`${layerPrefix}Mode`]) {
            this.customMaterial.uniforms[`${layerPrefix}Mode`].value = params.mode;
        }
        if (params.strength !== undefined && this.customMaterial.uniforms[`${layerPrefix}Strength`]) {
            this.customMaterial.uniforms[`${layerPrefix}Strength`].value = params.strength;
        }
        if (params.enabled !== undefined && this.customMaterial.uniforms[`${layerPrefix}Enabled`]) {
            this.customMaterial.uniforms[`${layerPrefix}Enabled`].value = params.enabled ? 1.0 : 0.0;
        }
    }

    /**
     * Update all blend multiplexer layers at once
     * @param {Array} layers - Array of layer configs [{mode, strength, enabled}, ...]
     */
    setAllBlendLayers(layers) {
        if ((this.geometryType !== 'moon' && this.geometryType !== 'sun') || !this.customMaterial) {
            console.warn('⚠️ Blend layers only available for moon and sun geometry');
            return;
        }

        layers.forEach((layer, index) => {
            this.setBlendLayer(index + 1, layer);
        });
    }

    /**
     * Set crystal blend layer for a specific visual component
     * @param {string} component - Component name: 'core', 'fresnel', 'trans', 'facet'
     * @param {number} blendIndex - Blend index (1 or 2)
     * @param {Object} params - { mode, strength, enabled }
     */
    setCrystalBlendLayer(component, blendIndex, params = {}) {
        if ((this.geometryType !== 'crystal' && this.geometryType !== 'rough') ||
            !this.customMaterial || this.customMaterialType !== 'crystal') {
            return;
        }

        const prefix = `${component}Blend${blendIndex}`;

        if (params.mode !== undefined && this.customMaterial.uniforms[`${prefix}Mode`]) {
            this.customMaterial.uniforms[`${prefix}Mode`].value = params.mode;
        }
        if (params.strength !== undefined && this.customMaterial.uniforms[`${prefix}Strength`]) {
            this.customMaterial.uniforms[`${prefix}Strength`].value = params.strength;
        }
        if (params.enabled !== undefined && this.customMaterial.uniforms[`${prefix}Enabled`]) {
            this.customMaterial.uniforms[`${prefix}Enabled`].value = params.enabled ? 1.0 : 0.0;
        }
    }

    /**
     * Set crystal shader uniforms
     * @param {Object} params - Crystal uniform values
     */
    setCrystalUniforms(params = {}) {
        if ((this.geometryType !== 'crystal' && this.geometryType !== 'rough') ||
            !this.customMaterial || this.customMaterialType !== 'crystal') {
            console.warn('⚠️ Crystal uniforms only available with crystal blend-layers material');
            return;
        }

        const {uniforms} = this.customMaterial;

        // Helper to safely set uniform value (protect against NaN)
        const safeSet = (uniform, value, min = 0, max = 10) => {
            if (uniform && typeof value === 'number' && !isNaN(value) && isFinite(value)) {
                uniform.value = Math.max(min, Math.min(max, value));
            }
        };

        // Crystal-specific parameters with validation
        safeSet(uniforms.coreGlowStrength, params.coreGlowStrength, 0, 2);
        if (params.coreGlowFalloff !== undefined && !isNaN(params.coreGlowFalloff)) {
            safeSet(uniforms.coreGlowFalloff, params.coreGlowFalloff, 0.1, 3);
            // Also update inner core size
            this.setCrystalCoreSize(params.coreGlowFalloff);
        }
        safeSet(uniforms.fresnelStrength, params.fresnelStrength, 0, 2);
        safeSet(uniforms.fresnelPower, params.fresnelPower, 0.5, 10); // Min 0.5 to avoid pow issues
        safeSet(uniforms.transmissionStrength, params.transmissionStrength, 0, 1);
        safeSet(uniforms.facetStrength, params.facetStrength, 0, 2);
        safeSet(uniforms.iridescenceStrength, params.iridescenceStrength, 0, 1);
        safeSet(uniforms.chromaticAberration, params.chromaticAberration, 0, 1);
        safeSet(uniforms.causticStrength, params.causticStrength, 0, 1);
        safeSet(uniforms.emissiveIntensity, params.emissiveIntensity, 0, 5);

        // Animation controls
        safeSet(uniforms.sparkleEnabled, params.sparkleEnabled, 0, 1);
        safeSet(uniforms.sparkleSpeed, params.sparkleSpeed, 0.1, 5);
        safeSet(uniforms.causticEnabled, params.causticEnabled, 0, 1);
        safeSet(uniforms.causticSpeed, params.causticSpeed, 0.1, 10);
        safeSet(uniforms.causticScale, params.causticScale, 0.5, 10);
        safeSet(uniforms.causticCoverage, params.causticCoverage, 0, 1);
        safeSet(uniforms.energyPulseEnabled, params.energyPulseEnabled, 0, 1);
        safeSet(uniforms.energyPulseSpeed, params.energyPulseSpeed, 0.1, 5);
    }

    /**
     * Create inner glowing core for crystal-type geometries
     * Uses CrystalSoul class for reusable soul effect
     */
    createCrystalInnerCore() {
        // Dispose existing soul if present
        if (this.crystalSoul) {
            this.crystalSoul.dispose();
            this.crystalSoul = null;
        }

        if (!this.coreMesh) {
            return;
        }

        // Create new soul and attach to coreMesh
        // Pass renderer for scene locking during async geometry swaps
        // Use _targetGeometryType during morph, fall back to geometryType for initial load
        const effectiveGeometryType = this._targetGeometryType || this.geometryType;
        this.crystalSoul = new CrystalSoul({ radius: 0.35, detail: 1, geometryType: effectiveGeometryType, renderer: this.renderer });
        this.crystalSoul.attachTo(this.coreMesh, this.renderer?.scene);

        // Geometry-specific shell and soul sizes (permanent values)
        // Use effectiveGeometryType to get correct scale during morph transitions
        let soulScale = 1.0;  // Default: full size (HUGE)
        if (effectiveGeometryType === 'heart') {
            this.crystalShellBaseScale = 2.4;
            soulScale = 1.0;  // Full size for heart
        } else if (effectiveGeometryType === 'rough') {
            this.crystalShellBaseScale = 1.6;
            soulScale = 1.0;  // Full size for rough
        } else if (effectiveGeometryType === 'star') {
            this.crystalShellBaseScale = 2.0;
            soulScale = 1.4;  // Larger soul for star to fill the shape
        } else if (effectiveGeometryType === 'crystal') {
            this.crystalShellBaseScale = 2.0;  // Default crystal shell size
            soulScale = 1.0;  // Full size for crystal
        }

        this.crystalSoul.baseScale = soulScale;
        this.crystalSoul.mesh.scale.setScalar(soulScale);

        // Respect coreGlowEnabled toggle state
        this.crystalSoul.setVisible(this.coreGlowEnabled);

        // Legacy references for backwards compatibility
        this.crystalInnerCore = this.crystalSoul.mesh;
        this.crystalInnerCoreMaterial = this.crystalSoul.material;
        this.crystalInnerCoreBaseScale = this.crystalSoul.baseScale;
    }

    /**
     * Update crystal inner core color, intensity, and animation based on emotion
     * @param {Array} glowColor - RGB color array [r, g, b] (0-1 range)
     * @param {number} deltaTime - Time since last frame in ms (for animation)
     */
    updateCrystalInnerCore(glowColor, deltaTime = 0) {
        if (!this.crystalSoul) {
            return;
        }

        // Get breathing scale if enabled
        const breathScale = (this.breathingAnimator && this.breathingEnabled)
            ? this.breathingAnimator.getBreathingScale()
            : 1.0;

        // Update the soul
        this.crystalSoul.update(deltaTime, glowColor, breathScale);

        // Keep legacy reference in sync
        this.crystalInnerCoreBaseScale = this.crystalSoul.baseScale;
    }

    /**
     * Set crystal soul effect parameters
     * @param {Object} params - Soul effect parameters
     * @param {boolean} params.driftEnabled - Enable/disable drifting energy
     * @param {number} params.driftSpeed - Drift animation speed (0.1-3.0)
     * @param {boolean} params.shimmerEnabled - Enable/disable vertical shimmer
     * @param {number} params.shimmerSpeed - Shimmer animation speed (0.1-3.0)
     */
    setCrystalSoulEffects(params = {}) {
        if (!this.crystalSoul) return;
        this.crystalSoul.setEffects(params);
    }

    /**
     * Set crystal inner core (soul) size
     * @param {number} size - Size value 0-1, where 0.5 is default
     */
    setCrystalCoreSize(size) {
        if (!this.crystalSoul) return;
        this.crystalSoul.setSize(size);
        this.crystalInnerCoreBaseScale = this.crystalSoul.baseScale;
    }

    /**
     * Set crystal shell size (outer crystal)
     * @param {number} size - Size value 0.5-2.0, where 1.0 is default
     */
    setCrystalShellSize(size) {
        if (!this.coreMesh || (this.geometryType !== 'crystal' && this.geometryType !== 'rough' && this.geometryType !== 'heart')) return;

        // Store base shell scale for use during rendering
        this.crystalShellBaseScale = size;
        // Don't apply directly - it will be applied in render() along with other transforms
    }

    /**
     * Enable or disable wobble/shake effects on rotation
     * @param {boolean} enabled - Whether wobble is enabled
     */
    setWobbleEnabled(enabled) {
        this.wobbleEnabled = enabled;
        if (this.rotationBehavior) {
            this.rotationBehavior.setWobbleEnabled(enabled);
        }

        // When disabling wobble, reset to upright position
        // (same logic as emotion change - prevents model from being stuck at an angle)
        if (!enabled) {
            if (this.rightingBehavior) {
                this.rightingBehavior.reset();
            }
            // Reset pitch/roll to upright, preserve yaw for rotation continuity
            this.baseEuler[0] = 0; // Reset pitch
            this.baseEuler[2] = 0; // Reset roll
        }
    }

    /**
     * Set material variant for use in morphing
     * Call this before morphToShape() to change material during transition
     * @param {string|null} variant - Material variant (e.g., 'multiplexer' for moon blood moon support)
     */
    setMaterialVariant(variant) {
        this.materialVariant = variant;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // RHYTHM SYNC API
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Enable or disable rhythm sync for 3D animations
     * @param {boolean} enabled - Whether rhythm sync is enabled
     */
    setRhythmEnabled(enabled) {
        this.rhythmEnabled = enabled;
        if (enabled && this.rhythm3DAdapter && !this.rhythm3DAdapter.enabled) {
            this.rhythm3DAdapter.initialize();
        }
    }

    /**
     * Enable or disable ambient groove (subtle idle animation synced to beat)
     * @param {boolean} enabled - Whether groove is enabled
     */
    setGrooveEnabled(enabled) {
        if (this.rhythm3DAdapter) {
            this.rhythm3DAdapter.setGrooveEnabled(enabled);
        }
    }

    /**
     * Set beat sync strength for gesture animations
     * @param {number} strength - Sync strength (0-1), higher = more pronounced beat sync
     */
    setBeatSyncStrength(strength) {
        if (this.rhythm3DAdapter) {
            this.rhythm3DAdapter.setBeatSyncStrength(strength);
        }
    }

    /**
     * Set groove configuration for idle animations
     * @param {Object} config - Groove settings
     * @param {number} config.grooveBounceAmount - Vertical bounce amplitude (default: 0.02)
     * @param {number} config.grooveSwayAmount - Horizontal sway amplitude (default: 0.015)
     * @param {number} config.groovePulseAmount - Scale pulse amplitude (default: 0.03)
     * @param {number} config.grooveRotationAmount - Rotation sway amplitude (default: 0.02)
     */
    setGrooveConfig(config) {
        if (this.rhythm3DAdapter) {
            this.rhythm3DAdapter.setGrooveConfig(config);
        }
    }

    /**
     * Check if rhythm is currently playing
     * @returns {boolean}
     */
    isRhythmPlaying() {
        return this.rhythm3DAdapter?.isPlaying() || false;
    }

    /**
     * Get current BPM from rhythm system
     * @returns {number}
     */
    getRhythmBPM() {
        return this.rhythm3DAdapter?.getBPM() || 120;
    }

    /**
     * Start rhythm playback for 3D animations
     * @param {number} bpm - Beats per minute (default: 120)
     * @param {string} pattern - Rhythm pattern (default: 'straight')
     */
    startRhythm(bpm = 120, pattern = 'straight') {
        if (this.rhythm3DAdapter) {
            this.rhythm3DAdapter.start(bpm, pattern);
        }
    }

    /**
     * Stop rhythm playback
     */
    stopRhythm() {
        if (this.rhythm3DAdapter) {
            this.rhythm3DAdapter.stop();
        }
    }

    /**
     * Set rhythm BPM
     * @param {number} bpm - Beats per minute (20-360)
     */
    setRhythmBPM(bpm) {
        if (this.rhythm3DAdapter) {
            this.rhythm3DAdapter.setBPM(bpm);
        }
    }

    /**
     * Set rhythm pattern
     * @param {string} pattern - Pattern name: 'straight', 'swing', 'waltz', 'dubstep', etc.
     */
    setRhythmPattern(pattern) {
        if (this.rhythm3DAdapter) {
            this.rhythm3DAdapter.setPattern(pattern);
        }
    }

    /**
     * Morph to different shape with smooth transition
     * Supports interruption - calling this while a morph is in progress will
     * smoothly transition to the new target without visual glitches.
     *
     * @param {string} shapeName - Target geometry name
     * @param {number} duration - Transition duration in ms (default: 800ms)
     */
    morphToShape(shapeName, duration = 800) {
        const targetGeometryConfig = THREE_GEOMETRIES[shapeName];
        if (!targetGeometryConfig) {
            console.warn(`Unknown shape: ${shapeName}`);
            return;
        }

        // Start smooth morph transition (handles interruptions internally)
        const started = this.geometryMorpher.startMorph(
            this.geometryType,
            shapeName,
            duration
        );

        // If morph didn't start (already at target), skip
        if (!started) {
            return;
        }

        // Check if this was an interruption that changed the target
        // (getInterruptedTarget clears the flag after reading)
        this.geometryMorpher.getInterruptedTarget();

        // Pause blinks during morph (cleaner visual experience)
        this.blinkAnimator.pause();

        // Store target geometry for when morph completes
        this._targetGeometryConfig = targetGeometryConfig;
        this._targetGeometryType = shapeName;

        // Handle async geometry loaders (e.g., crystal OBJ)
        if (targetGeometryConfig.geometryLoader && !targetGeometryConfig.geometry) {
            // Start loading during shrink phase so it's ready for swap
            this._targetGeometry = null; // Will be set when loaded
            this._pendingGeometryLoad = targetGeometryConfig.geometryLoader(this.assetBasePath).then(geometry => {
                this._targetGeometry = geometry;
                // Also update the registry so subsequent morphs don't need to reload
                targetGeometryConfig.geometry = geometry;
                this._pendingGeometryLoad = null;
            });
        } else {
            this._targetGeometry = targetGeometryConfig.geometry;
            this._pendingGeometryLoad = null;
        }
    }

    /**
     * Check if a morph is currently in progress
     * @returns {boolean} True if morphing
     */
    isMorphing() {
        return this.geometryMorpher.isTransitioning;
    }

    /**
     * Get current morph state for debugging/UI
     * @returns {Object} Morph state including progress, target, etc.
     */
    getMorphState() {
        return this.geometryMorpher.getState();
    }

    /**
     * Start a grow-in animation from scale 0 to 1
     * Used for initial appearance of mascots (pop-in effect)
     * @param {number} duration - Duration in milliseconds (default: 500ms)
     */
    growIn(duration = 500) {
        this.geometryMorpher.growIn(this.geometryType, duration);
    }

    /**
     * Easing function for smooth transitions
     * @param {number} t - Progress (0.0 to 1.0)
     * @returns {number} - Eased progress
     */
    easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /**
     * Render frame
     */
    render(deltaTime) {
        // Guard against calls after destroy
        if (this._destroyed) {
            return;
        }

        // Guard against rendering before geometry is ready (async loading)
        // This prevents Three.js errors during crystal/rough OBJ loading
        // Callers should use waitUntilReady() before starting render loop
        if (!this._ready) {
            return;
        }

        // Update animations
        this.animator.update(deltaTime);

        // Update geometry morph animation
        const morphState = this.geometryMorpher.update(deltaTime);

        // If waiting for async geometry to load, pause morph at midpoint
        if (morphState.shouldSwapGeometry && this._pendingGeometryLoad) {
            // Geometry still loading - pause at minimum scale until ready
            this.geometryMorpher.pauseAtSwap();
        }

        // Check if async geometry finished loading while paused
        if (morphState.waitingForGeometry && this._targetGeometry && !this._pendingGeometryLoad) {
            this.geometryMorpher.resumeFromSwap();
            // Re-trigger swap by setting hasSwappedGeometry back to false
            this.geometryMorpher.hasSwappedGeometry = false;
        }

        // Swap geometry at midpoint (when scale is at minimum) for smooth transition
        if (morphState.shouldSwapGeometry && this._targetGeometry) {
            // ═══════════════════════════════════════════════════════════════════
            // RESET OLD GEOMETRY STATE
            // Clear shader uniforms to defaults before swapping to prevent
            // visual remnants (e.g., blood moon effects bleeding to crystal)
            // ═══════════════════════════════════════════════════════════════════
            const oldGeometryType = this.geometryType;
            if (this.customMaterial) {
                resetGeometryState(oldGeometryType, this.customMaterial);
            }

            this.geometry = this._targetGeometry;
            this.geometryType = this._targetGeometryType;
            this.geometryConfig = this._targetGeometryConfig;

            // Dispose old custom material textures before creating new ones (prevent GPU memory leak)
            if (this.customMaterial) {
                // Use MaterialFactory for proper disposal of textures
                disposeCustomMaterial(this.customMaterial);
                // Then dispose the material itself
                this.renderer.disposeMaterial(this.customMaterial);
                this.customMaterial = null;
                this.customMaterialType = null;
            }

            // Check if target geometry needs custom material (e.g., moon, sun, future black hole)
            // Use MaterialFactory for centralized material creation
            let customMaterial = null;
            const emotionData = getEmotion(this.emotion);
            const materialResult = createCustomMaterial(this._targetGeometryType, this._targetGeometryConfig, {
                glowColor: this.glowColor || [1.0, 1.0, 0.95],
                glowIntensity: this.glowIntensity || 1.0,
                materialVariant: this.materialVariant,
                emotionData, // Pass emotion data for auto-deriving geometry params
                assetBasePath: this.assetBasePath
            });

            if (materialResult) {
                customMaterial = materialResult.material;
                this.customMaterial = customMaterial;
                this.customMaterialType = materialResult.type;
            }
            // Note: If not using custom material, references were already cleared above

            // Swap geometry (and material if custom)
            if (customMaterial) {
                this.renderer.swapGeometry(this.geometry, customMaterial);
            } else {
                this.renderer.swapGeometry(this.geometry);

                // Apply default glass mode for this geometry (only for non-custom materials)
                // Crystal and diamond have defaultGlassMode: true, others default to false
                const shouldEnableGlass = this._targetGeometryConfig.defaultGlassMode === true;
                this.setGlassMaterialEnabled(shouldEnableGlass);
            }

            // Invoke material swap callback immediately (before geometry becomes visible)
            // This allows presets to be applied while scale is still 0
            if (this.onMaterialSwap) {
                this.onMaterialSwap({
                    geometryType: this._targetGeometryType,
                    material: this.customMaterial,
                    materialType: this.customMaterialType
                });
            }

            // Update blink animator with new geometry's blink config
            this.blinkAnimator.setGeometry(this._targetGeometryConfig);

            // Reset righting behavior and orientation during morph transition
            // This fixes issue where anger/unstable rotations get stuck at bad angles
            // Reset angular velocity
            if (this.rightingBehavior) {
                this.rightingBehavior.reset();
            }
            // Reset Euler angles to upright [pitch=0, yaw=0, roll=0]
            this.rotation = [0, 0, 0];

            // Dispose or create solar eclipse for sun geometry
            if (this._targetGeometryType === 'sun') {
                // Create solar eclipse if morphing to sun
                if (!this.solarEclipse) {
                    const sunRadius = this.geometry.parameters?.radius || 0.5; // Sun geometry radius is 0.5
                    this.solarEclipse = new SolarEclipse(this.renderer.scene, sunRadius, this.renderer.coreMesh);
                }
            } else {
                // Dispose solar eclipse if morphing away from sun
                if (this.solarEclipse) {
                    this.solarEclipse.dispose();
                    this.solarEclipse = null;
                }
            }

            // Dispose or create lunar eclipse for moon geometry
            if (this._targetGeometryType === 'moon') {
                // Create lunar eclipse if morphing to moon and custom material exists
                if (!this.lunarEclipse && this.customMaterial) {
                    this.lunarEclipse = new LunarEclipse(this.customMaterial);
                }
            } else {
                // Dispose lunar eclipse if morphing away from moon
                if (this.lunarEclipse) {
                    this.lunarEclipse.dispose();
                    this.lunarEclipse = null;
                }
            }

            // Create or dispose crystal inner core
            if (this._targetGeometryType === 'crystal' || this._targetGeometryType === 'rough' || this._targetGeometryType === 'heart' || this._targetGeometryType === 'star') {
                // Create inner core if morphing to crystal/rough/heart/star
                if (this.customMaterialType === 'crystal') {
                    this.createCrystalInnerCore();
                }
            } else {
                // Dispose inner core if morphing away from crystal/rough/heart/star
                if (this.crystalSoul) {
                    this.crystalSoul.dispose();
                    this.crystalSoul = null;
                    this.crystalInnerCore = null;
                    this.crystalInnerCoreMaterial = null;
                }
            }

            // Update rotation behavior for special geometries (moon is tidally locked)
            if (this._targetGeometryType === 'moon') {
                this.rotationBehavior = null; // Disable rotation for moon (tidally locked)
                // Also disable OrbitControls camera rotation for moon (tidally locked)
                if (this.renderer?.controls) {
                    this.renderer.controls.autoRotate = false;
                }

                // Reset camera to front view INSTANTLY (immune to auto-rotate position)
                // This ensures moon always faces camera directly with calibrated orientation
                // Use instant reset (0ms) to avoid camera still moving during morph
                if (this.renderer?.setCameraPreset) {
                    this.renderer.setCameraPreset('front', 0);
                }

                // Apply calibrated rotation to show "Man in the Moon" Earth-facing view
                const degToRad = Math.PI / 180;
                this.calibrationRotation[0] = MOON_CALIBRATION_ROTATION.x * degToRad;
                this.calibrationRotation[1] = MOON_CALIBRATION_ROTATION.y * degToRad;
                this.calibrationRotation[2] = MOON_CALIBRATION_ROTATION.z * degToRad;

                // Create facing behavior for tidal lock
                if (!this.facingBehavior && MOON_FACING_CONFIG.enabled) {
                    this.facingBehavior = new FacingBehavior({
                        strength: MOON_FACING_CONFIG.strength,
                        lockedFace: MOON_FACING_CONFIG.lockedFace,
                        lerpSpeed: MOON_FACING_CONFIG.lerpSpeed,
                        calibrationRotation: [
                            MOON_CALIBRATION_ROTATION.x * degToRad,
                            MOON_CALIBRATION_ROTATION.y * degToRad,
                            MOON_CALIBRATION_ROTATION.z * degToRad
                        ]
                    }, this.renderer.camera);
                }
            } else {
                // Dispose facing behavior when morphing away from moon
                if (this.facingBehavior) {
                    this.facingBehavior.dispose();
                    this.facingBehavior = null;
                }

                // Re-enable auto-rotate when morphing away from moon (if it was originally enabled)
                if (this.renderer?.controls && this.options.autoRotate !== false) {
                    this.renderer.controls.autoRotate = true;
                }

                // Set calibration rotation for crystal/rough/heart, clear for others
                if (this._targetGeometryType === 'crystal' || this._targetGeometryType === 'rough' || this._targetGeometryType === 'heart') {
                    const degToRad = Math.PI / 180;
                    this.calibrationRotation[0] = CRYSTAL_CALIBRATION_ROTATION.x * degToRad;
                    this.calibrationRotation[1] = CRYSTAL_CALIBRATION_ROTATION.y * degToRad;
                    this.calibrationRotation[2] = CRYSTAL_CALIBRATION_ROTATION.z * degToRad;
                } else {
                    // Clear calibration rotation for other geometries
                    this.calibrationRotation[0] = 0;
                    this.calibrationRotation[1] = 0;
                    this.calibrationRotation[2] = 0;
                }

                if (this.rotationDisabled) {
                    this.rotationBehavior = null; // Keep rotation disabled if user disabled it
                } else {
                    // Re-apply emotion rotation behavior for new geometry
                    const emotionData = getEmotion(this.emotion);
                    if (emotionData && emotionData['3d'] && emotionData['3d'].rotation) {
                        if (this.rotationBehavior) {
                            this.rotationBehavior.updateConfig(emotionData['3d'].rotation);
                        } else {
                            // Create new rotation behavior
                            this.rotationBehavior = new RotationBehavior(
                                emotionData['3d'].rotation,
                                this.rhythmEngine
                            );
                            // Apply wobble enabled state
                            this.rotationBehavior.setWobbleEnabled(this.wobbleEnabled);
                        }
                    }
                }
            }
        }

        // Clean up on completion and resume blinks
        if (morphState.completed) {
            this._targetGeometry = null;
            this._targetGeometryType = null;
            this._targetGeometryConfig = null;

            // Resume blinks after morph completes (unless manually disabled)
            if (!this.blinkingManuallyDisabled) {
                this.blinkAnimator.resume();
            }
        }

        // Update breathing animation
        this.breathingAnimator.update(deltaTime, this.emotion, getUndertoneModifier(this.undertone));

        // Get breathing scale multiplier (return 1.0 if disabled)
        const breathScale = this.breathingEnabled ? this.breathingAnimator.getBreathingScale() : 1.0;

        // Get morph scale multiplier (for shrink/grow effect)
        const morphScale = morphState.scaleMultiplier;

        // Update blink animation
        const blinkState = this.blinkAnimator.update(deltaTime);

        // Always update persistent base rotation (ambient spin continues during gestures)
        if (this.rotationBehavior) {
            this.rotationBehavior.update(deltaTime, this.baseEuler);
        } else if (this.geometryType !== 'moon' && !this.rotationDisabled) {
            // Fallback: simple Y rotation if no behavior defined
            // EXCEPT for moon (tidally locked - no rotation)
            // EXCEPT when user has manually disabled rotation
            this.baseEuler[1] += deltaTime * 0.0003;
        }
        // Moon gets no rotation update - stays tidally locked

        // DEBUG: Log rotation state for moon
        // if (this.geometryType === 'moon') {
        //         geometryType: this.geometryType,
        //         rotationBehavior: !!this.rotationBehavior,
        //         rotationDisabled: this.rotationDisabled,
        //         baseEuler: this.baseEuler
        //     });
        // }

        // Apply righting behavior (self-stabilization) after rotation
        // This pulls tilted models back to upright while preserving yaw spin
        if (this.rightingBehavior) {
            this.rightingBehavior.update(deltaTime, this.baseEuler);
        }

        // Apply facing behavior (tidal lock) after righting
        // This overrides rotation to keep object stationary (no rotation)
        // Tidal lock is achieved by keeping baseEuler at [0,0,0] and using calibrationRotation
        if (this.facingBehavior) {
            // Simply reset baseEuler to zero - moon doesn't rotate at all
            this.baseEuler[0] = 0; // No pitch
            this.baseEuler[1] = 0; // No yaw
            this.baseEuler[2] = 0; // No roll
            // calibrationRotation is already applied in renderer to show correct face
        }

        // HARD LIMIT: Clamp pitch and roll to prevent lateral/dolphin tipping
        // No emotion should ever tip more than ~20 degrees from upright
        const MAX_TILT_ANGLE = 0.35; // ~20 degrees in radians
        this.baseEuler[0] = Math.max(-MAX_TILT_ANGLE, Math.min(MAX_TILT_ANGLE, this.baseEuler[0])); // Pitch (X)
        this.baseEuler[2] = Math.max(-MAX_TILT_ANGLE, Math.min(MAX_TILT_ANGLE, this.baseEuler[2])); // Roll (Z)
        // Yaw (Y) is left unclamped for free rotation

        // Convert base Euler to quaternion
        this.tempEuler.set(this.baseEuler[0], this.baseEuler[1], this.baseEuler[2], 'XYZ');
        this.baseQuaternion.setFromEuler(this.tempEuler);

        // ═══════════════════════════════════════════════════════════════════════════
        // UPDATE RHYTHM ADAPTER - Must happen before gesture blending
        // Always update - the adapter handles its own enabled/playing state
        // ═══════════════════════════════════════════════════════════════════════════
        if (this.rhythm3DAdapter) {
            this.rhythm3DAdapter.update(deltaTime);
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // GESTURE BLENDING SYSTEM - Blend multiple simultaneous gestures
        // ═══════════════════════════════════════════════════════════════════════════
        const blended = this.gestureBlender.blend(
            this.animator.animations,
            this.animator.time,
            this.baseQuaternion,
            this.baseScale,
            this.baseGlowIntensity
        );

        // Get rhythm modulation (applies to gesture output)
        // Auto-detects if rhythm is playing (started by any system - audio manager, etc.)
        const rhythmMod = this.rhythm3DAdapter?.isPlaying()
            ? this.rhythm3DAdapter.getModulation()
            : null;

        // Apply blended results with rhythm modulation
        // Position: add groove offset when no active gestures
        const hasActiveGestures = this.animator.animations.length > 0;
        if (rhythmMod && !hasActiveGestures) {
            // Apply ambient groove when idle
            this.position = [
                blended.position[0] + rhythmMod.grooveOffset[0],
                blended.position[1] + rhythmMod.grooveOffset[1],
                blended.position[2] + rhythmMod.grooveOffset[2]
            ];
        } else if (rhythmMod && hasActiveGestures) {
            // Scale gesture position by rhythm multiplier
            this.position = [
                blended.position[0] * rhythmMod.positionMultiplier,
                blended.position[1] * rhythmMod.positionMultiplier,
                blended.position[2] * rhythmMod.positionMultiplier
            ];
        } else {
            this.position = blended.position;
        }

        // Rotation: add groove sway when idle
        if (rhythmMod && !hasActiveGestures) {
            this.rotation = [
                blended.rotation[0] + rhythmMod.grooveRotation[0],
                blended.rotation[1] + rhythmMod.grooveRotation[1],
                blended.rotation[2] + rhythmMod.grooveRotation[2]
            ];
        } else {
            this.rotation = blended.rotation;
        }

        // Scale: apply groove pulse when idle, or rhythm multiplier during gestures
        if (rhythmMod && !hasActiveGestures) {
            this.scale = blended.scale * rhythmMod.grooveScale;
        } else if (rhythmMod && hasActiveGestures) {
            this.scale = blended.scale * rhythmMod.scaleMultiplier;
        } else {
            this.scale = blended.scale;
        }

        // Only apply blended glow if no manual override is active
        if (this.glowIntensityOverride === null) {
            // Apply rhythm glow multiplier during gestures
            if (rhythmMod && hasActiveGestures) {
                this.glowIntensity = blended.glowIntensity * rhythmMod.glowMultiplier;
            } else {
                this.glowIntensity = blended.glowIntensity;
            }
        }
        this.gestureQuaternion = blended.gestureQuaternion;
        this.glowBoost = blended.glowBoost || 0; // For isolated glow layer

        // Apply blink effects (AFTER gestures, blending with other animations)
        if (blinkState.isBlinking) {
            // Apply blink rotation (additive to gesture rotation)
            if (blinkState.rotation) {
                this.rotation[0] += blinkState.rotation[0];
                this.rotation[1] += blinkState.rotation[1];
                this.rotation[2] += blinkState.rotation[2];
            }
        }

        // Calculate final scale: gesture * morph * breathing * BLINK * crystal shell scale
        // Crystal/diamond don't squish on blink - they use energy pulse instead
        // Use Y-axis blink scale (primary squish axis) for uniform application
        const shouldApplyBlinkScale = this.geometryType !== 'crystal' && this.geometryType !== 'rough';
        const blinkScale = (blinkState.isBlinking && shouldApplyBlinkScale) ? blinkState.scale[1] : 1.0;
        const crystalShellScale = this.crystalShellBaseScale || 2.0;  // Default shell size
        const finalScale = this.scale * morphScale * breathScale * blinkScale * crystalShellScale;

        // ═══════════════════════════════════════════════════════════════════════════
        // PARTICLE SYSTEM UPDATE & RENDERING (Orchestrated)
        // ═══════════════════════════════════════════════════════════════════════════
        // Only check particleVisibility (runtime toggle), not particlesEnabled (initial config)
        if (this.particleVisibility && this.particleOrchestrator) {
            // Calculate actual 3D core radius in world units
            // This ensures particles orbit at consistent distance regardless of screen size
            // Crystal shell scale is the main factor (default 2.0)
            // particleRadiusMultiplier adjusts for different geometry shapes/sizes
            const particleRadiusMultiplier = this.geometryConfig?.particleRadiusMultiplier || 1.0;
            const coreRadius3D = (this.crystalShellBaseScale || 2.0) * this.scale * breathScale * particleRadiusMultiplier;

            // Delegate all particle logic to orchestrator
            this.particleOrchestrator.update(
                deltaTime,
                this.emotion,
                this.undertone,
                this.animator.animations, // Active gestures
                this.animator.time,       // Current animation time
                { x: this.position[0], y: this.position[1], z: this.position[2] }, // Core position
                { width: this.canvas.width, height: this.canvas.height }, // Canvas size
                // Rotation state for orbital physics
                {
                    euler: this.baseEuler,
                    quaternion: this.baseQuaternion,
                    angularVelocity: this.rotationBehavior ? this.rotationBehavior.axes : [0, 0, 0]
                },
                this.baseScale, // Pass base scale only (shader handles perspective)
                coreRadius3D    // Pass actual 3D core radius for particle orbit distance
            );
        }

        // Calculate effective glow intensity (blink boost applied at render time, non-mutating)
        // Use multiplicative blending (1.0 + boost) so fade can still reach 0
        const blinkBoostMultiplier = blinkState.isBlinking && blinkState.glowBoost ? (1.0 + blinkState.glowBoost) : 1.0;

        // Respect coreGlowEnabled toggle for both glass and glow modes
        // When disabled, set intensity to 0 which hides inner core and emissive glow
        // Also multiply by virtual particle opacity for fade/ghost effects
        const baseIntensity = this.coreGlowEnabled
            ? this.glowIntensity * blinkBoostMultiplier
            : 0.0;

        const virtualParticle = this.emotiveEngine?.getVirtualParticle();
        const opacity = virtualParticle?.opacity ?? 1.0;
        const effectiveGlowIntensity = baseIntensity * opacity;

        // Update bloom pass with effective glow intensity (smooth transitions)
        // Use faster transition during geometry morphs for quicker bloom adaptation
        const bloomTransitionSpeed = morphState.isTransitioning ? 0.3 : 0.1;
        this.renderer.updateBloom(effectiveGlowIntensity, bloomTransitionSpeed, this.geometryType);

        // Update isolated glow layer for gesture effects (glow/flash)
        // This is a separate screen-space effect that doesn't affect baseline appearance
        if (this.glowBoost > 0 || (this.renderer.glowLayer && this.renderer.glowLayer.isActive())) {
            // Get world position of core mesh for glow center
            const worldPosition = this.coreMesh?.position;
            this.renderer.updateGlowLayer(this.glowBoost, this.glowColor, worldPosition, deltaTime);
        }

        // Update sun material animation if using sun geometry
        if (this.customMaterialType === 'sun') {
            updateSunMaterial(this.coreMesh, this.glowColor, effectiveGlowIntensity, deltaTime);
        }

        // Moon: glowIntensity affects subtle emotion-colored glow (very subtle effect, * 0.02 in shader)
        // Unlike crystals, moon doesn't have a "core" that glows - it's a textured lit sphere
        if ((this.customMaterialType === 'moon' || this.customMaterialType === 'moon-multiplexer') && this.customMaterial) {
            if (this.customMaterial.uniforms && this.customMaterial.uniforms.glowIntensity) {
                this.customMaterial.uniforms.glowIntensity.value = effectiveGlowIntensity;
            }
        }

        // Update crystal material if using crystal blend-layers geometry
        if (this.customMaterialType === 'crystal' && this.customMaterial) {
            // Only update uniforms if material is a ShaderMaterial with uniforms
            if (this.customMaterial.uniforms) {
                // Update time for animation (convert ms to seconds for sane speed values)
                this.customMaterial.uniforms.time.value += deltaTime / 1000;

                // Update glow intensity - respects coreGlowEnabled toggle
                if (this.customMaterial.uniforms.glowIntensity) {
                    this.customMaterial.uniforms.glowIntensity.value = effectiveGlowIntensity;
                }

                // Normalize emotion color for consistent perceived brightness across all emotions
                // This ensures yellow (joy) doesn't wash out the soul while blue (sadness) stays visible
                // IMPORTANT: Use glowColor (RGB), not glowColorHex - glowColor has undertone saturation applied
                const normalized = normalizeRGBLuminance(this.glowColor, 0.30);
                const normalizedColor = [normalized.r, normalized.g, normalized.b];

                // Update emotion color on outer shell (luminance-normalized)
                this.customMaterial.uniforms.emotionColor.value.setRGB(
                    normalizedColor[0], normalizedColor[1], normalizedColor[2]
                );
                // Update blink intensity for energy pulse (smooth sine curve during blink)
                if (this.customMaterial.uniforms.blinkIntensity) {
                    const blinkPulse = blinkState.isBlinking ? Math.sin(blinkState.progress * Math.PI) : 0;
                    this.customMaterial.uniforms.blinkIntensity.value = blinkPulse;
                }
            }
            // Update inner core color and animation (also use normalized color)
            // Only update if core glow is enabled
            // IMPORTANT: Use glowColor (RGB), not glowColorHex - glowColor has undertone saturation applied
            if (this.coreGlowEnabled) {
                const normalizedCore = normalizeRGBLuminance(this.glowColor, 0.30);
                const normalizedCoreColor = [normalizedCore.r, normalizedCore.g, normalizedCore.b];
                this.updateCrystalInnerCore(normalizedCoreColor, deltaTime);
            }
        }

        // Render with Three.js
        this.renderer.render({
            position: this.position,
            rotation: this.rotation,
            scale: finalScale,
            glowColor: this.glowColor,
            glowColorHex: this.glowColorHex,  // For bloom luminance normalization
            glowIntensity: effectiveGlowIntensity,
            hasActiveGesture: this.animator.animations.length > 0,  // Faster lerp during gestures
            calibrationRotation: this.calibrationRotation,  // Applied on top of animated rotation
            solarEclipse: this.solarEclipse,  // Pass eclipse manager for synchronized updates
            deltaTime,  // Pass deltaTime for eclipse animation
            morphProgress: morphState.isTransitioning ? morphState.visualProgress : null  // For corona fade-in
        });

        // Update lunar eclipse animation (Blood Moon)
        if (this.lunarEclipse) {
            this.lunarEclipse.update(deltaTime);
        }
    }

    /**
     * Load async geometry (e.g., OBJ models) and set up mesh when ready
     * Uses GeometryCache for caching to prevent race conditions and duplicate loads
     *
     * IMPORTANT: This is fully async and completes BEFORE render() should be called.
     * Use isReady() or await waitUntilReady() before starting render loop.
     * @private
     * @returns {Promise<void>}
     */
    async _loadAsyncGeometry() {
        try {
            // Use GeometryCache for proper caching - this ensures:
            // 1. Multiple calls during React Strict Mode don't cause duplicate loads
            // 2. Preloaded geometry is reused instantly
            // 3. Race conditions are avoided
            const cached = await GeometryCache.preload(this.geometryType, {
                glowColor: this.glowColor || [1.0, 1.0, 0.95],
                glowIntensity: this.glowIntensity || 1.0,
                materialVariant: this.materialVariant,
                emotionData: getEmotion(this.emotion),
                assetBasePath: this.assetBasePath
            });


            // CRITICAL: Check if destroyed during async load (React Strict Mode can unmount during load)
            if (this._destroyed) {
                return;
            }

            if (!cached || !cached.geometry) {
                console.warn(`[Core3D:${this._instanceId}] Async geometry load returned null!`);
                this._ready = true;
                return;
            }

            // Clone the cached geometry so each instance has its own copy
            const loadedGeometry = cached.geometry.clone();

            // Store geometry type
            loadedGeometry.userData.geometryType = this.geometryType;
            this.geometry = loadedGeometry;

            if (this._deferredMeshCreation) {
                // First time: create mesh with loaded geometry (no fallback was shown)
                this.coreMesh = this.renderer.createCoreMesh(loadedGeometry, this.customMaterial);

                // Check again - createCoreMesh could take time
                if (this._destroyed) {
                    return;
                }

                // Create inner core for crystal - do this SYNCHRONOUSLY before marking ready
                // CrystalSoul will load its inclusion geometry asynchronously, but we wait for it
                if (this.customMaterialType === 'crystal') {
                    await this._createCrystalInnerCoreAsync();
                    // Check AGAIN after async operation
                    if (this._destroyed) {
                        return;
                    }
                }

                this._deferredMeshCreation = false;
            } else if (this.coreMesh) {
                // Existing mesh: swap geometry
                const oldGeometry = this.coreMesh.geometry;
                this.coreMesh.geometry = loadedGeometry;

                // Dispose old procedural geometry
                if (oldGeometry && oldGeometry !== loadedGeometry) {
                    oldGeometry.dispose();
                }

                // Check again
                if (this._destroyed) {
                    return;
                }

                // Recreate inner core if crystal
                if (this.customMaterialType === 'crystal') {
                    await this._createCrystalInnerCoreAsync();
                    // Check AGAIN after async operation
                    if (this._destroyed) {
                        return;
                    }
                }
            }

            // Final check before marking ready - don't set ready on destroyed instance
            if (this._destroyed) {
                return;
            }

            // NOW we're fully ready for rendering
            this._logSceneHierarchy();
            this._ready = true;
        } catch (error) {
            console.warn(`[Core3D:${this._instanceId}] Async geometry load FAILED:`, error);
            // Mark ready even on failure so render doesn't hang (unless destroyed)
            if (!this._destroyed) {
                this._ready = true;
            }
        }
    }

    /**
     * Debug: Log scene hierarchy
     * @private
     */
    _logSceneHierarchy() {
        const scene = this.renderer?.scene;
        if (!scene) {
            return;
        }
        scene.children.forEach((child, i) => {
            const status = child === null ? 'NULL!' :
                child === undefined ? 'UNDEFINED!' :
                    child.visible === null ? 'visible=NULL!' :
                        child.visible === undefined ? 'visible=UNDEF!' : 'OK';
            console.log(`  [${i}] ${child?.name || child?.type || 'UNKNOWN'} status=${status} uuid=${child?.uuid?.slice(0,8) || 'N/A'}`);
        });
    }

    /**
     * Create crystal inner core and wait for its async geometry to load
     * @private
     * @returns {Promise<void>}
     */
    async _createCrystalInnerCoreAsync() {

        // Dispose existing soul if present
        if (this.crystalSoul) {
            this.crystalSoul.dispose();
            this.crystalSoul = null;
        }

        if (!this.coreMesh) {
            return;
        }

        // Preload the inclusion geometry BEFORE creating CrystalSoul
        // This ensures the soul mesh has its final geometry before being added to scene
        await CrystalSoul._loadInclusionGeometry();

        // Check if destroyed during async load
        if (this._destroyed || !this.coreMesh) {
            return;
        }

        // Create new soul - geometry is already cached so it will be used immediately
        this.crystalSoul = new CrystalSoul({
            radius: 0.35,
            detail: 1,
            geometryType: this.geometryType,
            renderer: this.renderer
        });

        // Attach to coreMesh - this adds soul to the scene
        this.crystalSoul.attachTo(this.coreMesh, this.renderer?.scene);

        // Geometry-specific shell and soul sizes (permanent values)
        let soulScale = 1.0;  // Default: full size (HUGE)
        if (this.geometryType === 'heart') {
            this.crystalShellBaseScale = 2.4;
            soulScale = 1.0;  // Full size for heart
        } else if (this.geometryType === 'rough') {
            this.crystalShellBaseScale = 1.6;
            soulScale = 1.0;  // Full size for rough
        } else if (this.geometryType === 'crystal') {
            soulScale = 1.0;  // Full size for crystal
        }

        this.crystalSoul.baseScale = soulScale;
        this.crystalSoul.mesh.scale.setScalar(soulScale);

        // Respect coreGlowEnabled toggle state
        this.crystalSoul.setVisible(this.coreGlowEnabled);

        // Legacy references for backwards compatibility
        this.crystalInnerCore = this.crystalSoul.mesh;
        this.crystalInnerCoreMaterial = this.crystalSoul.material;
        this.crystalInnerCoreBaseScale = this.crystalSoul.baseScale;
    }

    /**
     * Check if the manager is fully initialized and ready for rendering
     * @returns {boolean}
     */
    isReady() {
        return this._ready;
    }

    /**
     * Wait until the manager is fully initialized
     * Use this before starting your render loop for geometries with async loading (crystal, rough, heart)
     * @returns {Promise<void>}
     */
    async waitUntilReady() {
        if (this._ready) return;
        if (this._readyPromise) {
            await this._readyPromise;
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        // Log SYNCHRONOUSLY with all state at time of call
        const state = {
            id: this._instanceId,
            ready: this._ready,
            destroyed: this._destroyed,
            hasCrystalSoul: !!this.crystalSoul,
            hasRenderer: !!this.renderer
        };

        // Set destroyed flag first to prevent any pending render calls
        this._destroyed = true;

        // Clean up crystal soul FIRST - before renderer.destroy() clears the scene
        // This ensures we properly remove the mesh from scene before scene is cleared
        if (this.crystalSoul) {
            this.crystalSoul.dispose();
            this.crystalSoul = null;
            this.crystalInnerCore = null;
            this.crystalInnerCoreMaterial = null;
        }

        // Clean up particle system (remove from scene before destroying)
        if (this.particleOrchestrator) {
            // Get particle points reference before destroying
            const particleRenderer = this.particleOrchestrator.renderer;
            if (particleRenderer) {
                const points = particleRenderer.getPoints();
                if (points && this.renderer?.scene) {
                    this.renderer.scene.remove(points);
                }
            }
            this.particleOrchestrator.destroy();
            this.particleOrchestrator = null;
        }

        // Clean up solar eclipse system (remove from scene before disposing)
        if (this.solarEclipse) {
            // Eclipse cleanup will remove all meshes from scene internally
            this.solarEclipse.dispose();
            this.solarEclipse = null;
        }

        // Clean up lunar eclipse system
        if (this.lunarEclipse) {
            this.lunarEclipse.dispose();
            this.lunarEclipse = null;
        }

        // Dispose custom material textures if they exist
        if (this.customMaterial) {
            this.renderer.disposeMaterial(this.customMaterial);
            this.customMaterial = null;
            this.customMaterialType = null;
        }

        // Dispose facing behavior
        if (this.facingBehavior) {
            this.facingBehavior.dispose();
            this.facingBehavior = null;
        }

        // Stop animations before destroying renderer
        this.animator.stopAll();

        // Destroy renderer LAST (after all scene children are cleaned up)
        this.renderer.destroy();

        // Clean up virtual particle pool
        if (this.virtualParticlePool) {
            this.virtualParticlePool.length = 0;
            this.virtualParticlePool = null;
        }

        // Clean up animator sub-components
        this.animator.destroy?.();
        this.breathingAnimator.destroy?.();
        this.gestureBlender.destroy?.();
        this.geometryMorpher.destroy?.();
        this.blinkAnimator.destroy?.();

        // Clean up behavior objects
        if (this.rotationBehavior) {
            this.rotationBehavior.destroy?.();
            this.rotationBehavior = null;
        }
        if (this.rightingBehavior) {
            this.rightingBehavior.destroy?.();
            this.rightingBehavior = null;
        }

        // Clean up temp THREE.js objects
        this.tempEuler = null;
        this.baseQuaternion = null;
        this.gestureQuaternion = null;

        // Clean up geometry references
        this.geometry = null;
        this.geometryConfig = null;
        this._targetGeometry = null;
        this._targetGeometryConfig = null;
        this._targetGeometryType = null;

        // Clean up canvas and options references
        this.canvas = null;
        this.options = null;

        // Clean up core mesh reference
        this.coreMesh = null;

        // Clean up rhythm engine reference
        this.rhythmEngine = null;

        // Clean up rhythm 3D adapter (don't destroy singleton, just clear reference)
        this.rhythm3DAdapter = null;

        // Clean up emotive engine reference
        this.emotiveEngine = null;

        // Dispose geometry cache
        GeometryCache.dispose();
    }

    /**
     * Preload all geometry assets for instant morphing
     * Call this during app initialization for best UX
     * @returns {Promise<void>}
     */
    async preloadGeometries() {
        const options = {
            glowColor: this.glowColor || [1.0, 1.0, 0.95],
            glowIntensity: this.glowIntensity || 1.0,
            materialVariant: this.materialVariant,
            emotionData: getEmotion(this.emotion)
        };

        await GeometryCache.preloadAll(options);
    }
}
