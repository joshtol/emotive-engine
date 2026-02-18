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
// Note: Behavior classes (RotationBehavior, RightingBehavior, FacingBehavior)
// are now managed by BehaviorController
import { updateSunMaterial, SUN_ROTATION_CONFIG } from './geometries/Sun.js';
import { getEmotion } from '../core/emotions/index.js';
// getGesture - available but currently unused (gestures handled by GestureBlender)
import { getUndertoneModifier } from '../config/undertoneModifiers.js';
import { hexToRGB, applyUndertoneSaturation } from './utils/ColorUtilities.js';
import { getGlowIntensityForColor, normalizeRGBLuminance } from '../utils/glowIntensityFilter.js';
import ParticleSystem from '../core/ParticleSystem.js';
import { Particle3DTranslator } from './particles/Particle3DTranslator.js';
import { CrystalSoul } from './effects/CrystalSoul.js';
import { Particle3DRenderer } from './particles/Particle3DRenderer.js';
import { Particle3DOrchestrator } from './particles/Particle3DOrchestrator.js';
import { updateMoonGlow, MOON_CALIBRATION_ROTATION, MOON_FACING_CONFIG } from './geometries/Moon.js';
import { createCustomMaterial, disposeCustomMaterial } from './utils/MaterialFactory.js';
import { resetGeometryState } from './GeometryStateManager.js';
import * as GeometryCache from './utils/GeometryCache.js';
import { AnimationManager } from './managers/AnimationManager.js';
import { EffectManager } from './managers/EffectManager.js';
import { BehaviorController } from './managers/BehaviorController.js';
import { BreathingPhaseManager } from './managers/BreathingPhaseManager.js';
import { ShatterSystem } from './effects/shatter/ShatterSystem.js';
import { ObjectSpaceCrackManager } from './effects/ObjectSpaceCrackManager.js';
import { createElectricMaterial, updateElectricMaterial } from './materials/ElectricMaterial.js';
import { createWaterMaterial, updateWaterMaterial } from './materials/WaterMaterial.js';
import { createFireMaterial, updateFireMaterial } from './materials/FireMaterial.js';
import { createSmokeMaterial, updateSmokeMaterial } from './materials/SmokeMaterial.js';
import { createVoidMaterial, updateVoidMaterial } from './materials/VoidMaterial.js';
import { createIceMaterial, updateIceMaterial } from './materials/IceMaterial.js';
import { createLightMaterial, updateLightMaterial } from './materials/LightMaterial.js';
import { createPoisonMaterial, updatePoisonMaterial } from './materials/PoisonMaterial.js';
import { createEarthMaterial, updateEarthMaterial } from './materials/EarthMaterial.js';
import { createNatureMaterial, updateNatureMaterial } from './materials/NatureMaterial.js';
import { SmokeParticleSystem } from './effects/SmokeParticleSystem.js';
import { ElementInstancedSpawner } from './effects/ElementInstancedSpawner.js';
import { profiler } from './debug/PerformanceProfiler.js';

// Crystal calibration rotation to show flat facet facing camera
// Hexagonal crystal has vertices at 0°, 60°, 120°, etc.
// Rotating 30° around Y puts a flat face toward the camera (default -Z view direction)
const CRYSTAL_CALIBRATION_ROTATION = {
    x: 0,    // No X rotation
    y: 30,   // 30° Y rotation to show flat facet
    z: 0     // No Z rotation
};

// All available element types for preloading
const ALL_ELEMENT_TYPES = ['fire', 'ice', 'water', 'earth', 'nature', 'electricity', 'void', 'light'];

// Delay before background pre-warm starts (ms)
const BACKGROUND_PREWARM_DELAY = 2000;

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
     * @param {boolean} [options.enableShatter=true] - Enable shatter/shard system
     * @param {string[]} [options.preloadElements] - Element types to preload immediately (e.g., ['fire', 'ice'])
     * @param {boolean} [options.backgroundPrewarm=true] - Auto-preload remaining elements after 2s idle
     */
    constructor(canvas, options = {}) {
        // Validate required dependencies
        if (!canvas) {
            throw new Error('Core3DManager: canvas element is required');
        }
        // eslint-disable-next-line no-undef
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error('Core3DManager: canvas must be an HTMLCanvasElement');
        }
        if (typeof THREE === 'undefined') {
            throw new Error('Core3DManager: Three.js library is not loaded. Import three.js before using Core3DManager');
        }

        this._instanceId = Math.random().toString(36).substr(2, 6);

        this.canvas = canvas;
        this.options = options;
        this._destroyed = false;
        this._ready = false;  // Flag indicating all async loading is complete
        this._readyPromise = null;  // Promise that resolves when ready

        // Debug logging flags (set externally to enable motion debug logging)
        this.debugMotionLogging = false;  // Set to true to enable motion debug logs

        // Asset base path for textures and models (configurable for GitHub Pages, etc.)
        // Empty string triggers auto-detection in ThreeRenderer
        this.assetBasePath = options.assetBasePath !== undefined ? options.assetBasePath : '';

        // Shatter system toggle (can be disabled for isolated testing)
        this.enableShatter = options.enableShatter !== false;

        // Element preloading options
        // preloadElements: specific elements to preload immediately (e.g., ['fire', 'ice'])
        // backgroundPrewarm: auto-preload remaining elements after 2s idle (default: true)
        this._preloadElements = options.preloadElements || [];
        this._backgroundPrewarm = options.backgroundPrewarm !== false;
        this._prewarmTimeoutId = null;

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

        // Pass WebGL context and renderer to profiler for diagnostics
        profiler.setGL(this.renderer.renderer.getContext());
        profiler.setRenderer(this.renderer);

        // Register for WebGL context restoration to recreate custom materials
        this.renderer.onContextRestored = () => this._handleContextRestored();

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

        // Create callback for when textures finish loading (for moon async textures)
        // This re-runs shard precomputation so shards get the actual texture
        // Capture geometryType NOW to ensure correct type even if morph happens before texture loads
        const geometryTypeForCallback = this.geometryType;
        const onTextureReady = material => {
            if (this.shatterSystem && this.renderer?.coreMesh) {
                this.shatterSystem.precomputeShards(
                    this.renderer.coreMesh,
                    geometryTypeForCallback
                );
            }
        };

        const materialResult = createCustomMaterial(this.geometryType, this.geometryConfig, {
            glowColor: this.glowColor || [1.0, 1.0, 0.95],
            glowIntensity: this.glowIntensity || 1.0,
            materialVariant: this.materialVariant,
            emotionData, // Pass emotion data for auto-deriving geometry params
            assetBasePath: this.assetBasePath,
            onTextureReady
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

        // Gesture blender
        this.gestureBlender = new GestureBlender();

        // Animation manager (orchestrates gesture playback and blending)
        this.animationManager = new AnimationManager(this.animator, this.gestureBlender);

        // Effect manager (manages SolarEclipse, LunarEclipse, CrystalSoul effects)
        this.effectManager = new EffectManager(this.renderer, this.assetBasePath);

        // Behavior controller (manages rotation, righting, and facing behaviors)
        // Note: rhythmEngine is passed later via setRhythmEngine() if needed
        this.behaviorController = new BehaviorController({
            rotationDisabled: options.autoRotate === false,
            wobbleEnabled: true,
            rhythmEngine: options.rhythmEngine || null,
            camera: this.renderer.camera
        });

        // Breathing phase manager (imperative meditation-style breathing control)
        this.breathingPhaseManager = new BreathingPhaseManager();

        // Breathing animator
        this.breathingAnimator = new BreathingAnimator();
        this.breathingEnabled = options.enableBreathing !== false; // Enabled by default

        // Note: Imperative breathing phase animation state is now managed by BreathingPhaseManager
        // See: breathePhase(), stopBreathingPhase(), _updateBreathingPhase()

        // Geometry morpher for smooth shape transitions
        this.geometryMorpher = new GeometryMorpher();
        this._skipRenderFrames = 0; // Frame counter for post-morph render skipping

        // Blink animator (emotion-aware)
        this.blinkAnimator = new BlinkAnimator(this.geometryConfig);
        this.blinkAnimator.setEmotion(this.emotion);
        this.blinkingManuallyDisabled = false; // Track if user disabled blinking

        // Disable blinking if requested
        if (options.enableBlinking === false) {
            this.blinkAnimator.pause();
            this.blinkingManuallyDisabled = true;
        }

        // Rotation state flags (BehaviorController manages the actual behaviors)
        this.rotationDisabled = options.autoRotate === false; // Disable rotation if autoRotate is false
        this.wobbleEnabled = true; // Wobble/shake effects enabled by default

        // Initialize behavior controller for moon geometry if needed
        if (isMoon && MOON_FACING_CONFIG.enabled) {
            const degToRad = Math.PI / 180;
            this.behaviorController.configureForEmotion({
                geometryType: 'moon',
                emotionData: null, // Will be set in setEmotion
                facingConfig: {
                    enabled: true,
                    strength: MOON_FACING_CONFIG.strength,
                    lockedFace: MOON_FACING_CONFIG.lockedFace,
                    lerpSpeed: MOON_FACING_CONFIG.lerpSpeed,
                    calibrationRotation: [
                        MOON_CALIBRATION_ROTATION.x * degToRad,
                        MOON_CALIBRATION_ROTATION.y * degToRad,
                        MOON_CALIBRATION_ROTATION.z * degToRad
                    ]
                }
            });
        }

        // Current state
        this.emotion = options.emotion || 'neutral';
        this.undertone = options.undertone || null;
        this.glowColor = [1.0, 1.0, 1.0]; // RGB
        this.glowColorHex = '#FFFFFF'; // Hex color for luminance normalization
        this.glowIntensity = 1.0;
        // OPTIMIZATION: Cache normalized color to avoid recalculating every frame
        this._normalizedGlowColor = null;
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
            // Wire up breathing animator to rhythm adapter for coordination
            this.breathingAnimator.setRhythmAdapter(this.rhythm3DAdapter);
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

        // Initialize geometry-specific effects via EffectManager
        const sunRadius = this.geometry?.parameters?.radius || 0.5;
        this.effectManager.initializeForGeometry(this.geometryType, {
            coreMesh: this.coreMesh,
            customMaterial: this.customMaterial,
            sunRadius
        });

        // ═══════════════════════════════════════════════════════════════════════════
        // SHATTER SYSTEM INITIALIZATION
        // ═══════════════════════════════════════════════════════════════════════════
        // Runtime geometry fracturing for dramatic storytelling effects
        // Can be disabled via enableShatter: false for isolated testing
        this.shatterSystem = null;
        this._pendingShatter = null;

        if (this.enableShatter) {
            this.shatterSystem = new ShatterSystem({
                scene: this.renderer.scene,
                maxShards: 50,
                shardLifetime: 2000,
                enableReassembly: true,
                autoRestore: true
            });

            // Wire up shatter callbacks for visual effects
            this.shatterSystem.onShatterStart = () => {
                // The shard materials already have emissive glow that creates a "particle-like" effect
                // Phase 3 could add dedicated particle burst via orchestrator.triggerBurst()
            };

            // Restore soul visibility after shatter completes (when shards finish animating)
            this.shatterSystem.onShatterComplete = () => {
                // Restore crystal soul to its normal visibility state based on coreGlowEnabled
                if (this.crystalSoul) {
                    this.crystalSoul.setVisible(this.coreGlowEnabled);
                }
            };

            // Restore soul visibility after reassembly completes
            this.shatterSystem.onReassemblyComplete = () => {
                // Restore crystal soul to its normal visibility state based on coreGlowEnabled
                if (this.crystalSoul) {
                    this.crystalSoul.setVisible(this.coreGlowEnabled);
                }
            };

            // ═══════════════════════════════════════════════════════════════════════════
            // PRECOMPUTE SHARDS FOR INITIAL GEOMETRY
            // Generate shard geometries and extract material at startup to eliminate
            // first-shatter lag. This is repeated on morphTo() for new geometries.
            // ═══════════════════════════════════════════════════════════════════════════
            if (this.renderer?.coreMesh) {
                this.shatterSystem.precomputeShards(
                    this.renderer.coreMesh,
                    this.geometryType
                );
            }
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // OBJECT-SPACE CRACK MANAGER
        // ═══════════════════════════════════════════════════════════════════════════
        // Manages persistent crack damage that rotates with the mesh.
        // Unlike screen-space CrackLayer, impacts are stored in mesh-local coordinates.
        this.objectSpaceCrackManager = new ObjectSpaceCrackManager();

        // ═══════════════════════════════════════════════════════════════════════════
        // ELEMENT SPAWNER (GPU-Instanced)
        // ═══════════════════════════════════════════════════════════════════════════
        // Uses instanced rendering to fix GPU memory leaks from material cloning
        this.elementSpawner = new ElementInstancedSpawner({
            scene: this.renderer.scene,
            assetsBasePath: this.assetBasePath,
            renderer: this.renderer
        });

        // Wire distortion manager from ThreeRenderer to spawner
        if (this.renderer?.distortionManager) {
            this.elementSpawner.setDistortionManager(this.renderer.distortionManager);
        }

        // Wire particle atmospherics manager from ThreeRenderer to spawner
        if (this.renderer?.particleAtmospherics) {
            this.elementSpawner.setParticleAtmospherics(this.renderer.particleAtmospherics);
        }

        // Initialize with core mesh and camera if available
        // NOTE: Models are NOT preloaded here - they load lazily on first spawn
        // This prevents GPU overhead for demos that don't use elemental gestures
        if (this.renderer?.coreMesh) {
            this.elementSpawner.initialize(this.renderer.coreMesh, this.renderer.camera);
        }

        // Note: Virtual particle pool is now managed by AnimationManager

        // Apply default glass mode for initial geometry (if specified)
        // Crystal and diamond geometries have defaultGlassMode: true
        // BUT skip this if we have a custom material (e.g., blend-layers shader)
        if (this.geometryConfig.defaultGlassMode && !this.customMaterial) {
            this.setGlassMaterialEnabled(true);
        }

        // Initialize emotion
        this.setEmotion(this.emotion);
    }

    // Note: createVirtualParticlePool and getVirtualParticleFromPool
    // have been moved to AnimationManager

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

                // Compute TARGET normalized color for smooth transition
                const normalized = normalizeRGBLuminance(rgb, 0.30);
                this._targetGlowColor = [normalized.r, normalized.g, normalized.b];

                // Initialize current color if not set (first emotion)
                if (!this._normalizedGlowColor) {
                    this._normalizedGlowColor = [...this._targetGlowColor];
                }

                // Start color transition
                this._colorTransitionProgress = 0;
                this._colorTransitionStart = [...this._normalizedGlowColor];

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

        // Configure behavior controller for this emotion and geometry
        // Get geometry-specific rotation config if available
        const geometryRotation = this.geometryType === 'sun' ? SUN_ROTATION_CONFIG : null;

        // Build facing config for moon if needed
        let facingConfig = null;
        if (this.geometryType === 'moon' && MOON_FACING_CONFIG.enabled) {
            const degToRad = Math.PI / 180;
            facingConfig = {
                enabled: true,
                strength: MOON_FACING_CONFIG.strength,
                lockedFace: MOON_FACING_CONFIG.lockedFace,
                lerpSpeed: MOON_FACING_CONFIG.lerpSpeed,
                calibrationRotation: [
                    MOON_CALIBRATION_ROTATION.x * degToRad,
                    MOON_CALIBRATION_ROTATION.y * degToRad,
                    MOON_CALIBRATION_ROTATION.z * degToRad
                ]
            };
        }

        // Configure behaviors via controller
        this.behaviorController.configureForEmotion({
            geometryType: this.geometryType,
            emotionData,
            facingConfig,
            geometryRotation
        });

        // Reset Euler angles to upright [pitch=0, yaw=current, roll=0]
        // Preserve yaw to maintain current spin direction, but reset pitch/roll
        this.baseEuler[0] = 0; // Reset pitch
        this.baseEuler[2] = 0; // Reset roll
        // Keep baseEuler[1] (yaw) to preserve rotation continuity

        // Apply undertone multipliers if present
        const undertoneModifier = getUndertoneModifier(undertone);

        if (undertoneModifier && undertoneModifier['3d']) {
            this.behaviorController.applyUndertone(undertoneModifier['3d']);
        }

        // Stop previous emotion animations to prevent stacking
        // Use stopEmotions() to preserve active gestures (additive blending)
        this.animator.stopEmotions();

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
            this.baseGlowIntensity *= undertoneModifier['3d'].glow.intensityMultiplier;
        }

        // Update breathing animator with emotion and undertone
        this.breathingAnimator.setEmotion(emotion, undertoneModifier);

        // Update blink animator with new emotion
        this.blinkAnimator.setEmotion(emotion);

        // Update groove preset based on emotion (if rhythm is playing)
        // Energetic emotions → bounce groove, calm emotions → subtle groove, flowing → zen groove
        if (this.rhythmEnabled && this.rhythm3DAdapter?.isPlaying?.()) {
            const emotionGroove = this._getEmotionGroove(emotion);
            // Use quantize + bars for smooth, musical transition
            this.rhythm3DAdapter.setGroove(emotionGroove, { quantize: true, bars: 2 });
        }

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
     * Delegates to AnimationManager for gesture orchestration
     */
    playGesture(gestureName) {
        this.animationManager.playGesture(gestureName, {
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
                // Reset to base state
                this.position = [0, 0, 0];
                // NOTE: Don't reset rotation - it's computed from quaternions in render()
                // gestureQuaternion will be reset to identity in render() when no gestures active
                this.scale = this.baseScale;
            }
        });
    }

    /**
     * Trigger reassembly of frozen shards (for shatterFreeze gesture)
     * Only works when shatter is in FROZEN state (after shatterFreeze completes).
     * @param {number} [duration=1500] - Animation duration in ms
     * @returns {boolean} True if reassembly started
     */
    triggerReassembly(duration = 1500) {
        if (!this.shatterSystem) {
            console.warn('triggerReassembly: ShatterSystem not initialized');
            return false;
        }
        return this.shatterSystem.triggerReassembly(duration);
    }

    /**
     * Check if shatter is currently in frozen state (awaiting manual reassembly)
     * @returns {boolean}
     */
    isShatterFrozen() {
        return this.shatterSystem?.isFrozen() || false;
    }

    /**
     * Set solar eclipse type (only works for sun geometry)
     * @param {string} eclipseType - Eclipse type: 'off', 'annular', or 'total'
     */
    setSunShadow(eclipseType = 'off') {
        if (this.geometryType !== 'sun' || !this.effectManager.hasSolarEclipse()) {
            console.warn('⚠️ Eclipse only available for sun geometry');
            return;
        }

        // Set eclipse type via EffectManager
        this.effectManager.setSolarEclipse(eclipseType);
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
        if (this.geometryType === 'sun' && this.effectManager.hasSolarEclipse()) {
            this.effectManager.setSolarEclipse(eclipseType);
            return;
        }

        // Morph to sun, then trigger eclipse after morph completes
        this.morphToShape('sun');

        // Wait for morph to complete (shrink + grow phases)
        // Default morph duration is 500ms, so wait a bit longer
        setTimeout(() => {
            if (this.effectManager.hasSolarEclipse()) {
                this.effectManager.setSolarEclipse(eclipseType);
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
        if (this.geometryType === 'moon' && this.effectManager.hasLunarEclipse()) {
            this.effectManager.setLunarEclipse(eclipseType);
            return;
        }

        // Morph to moon, then trigger eclipse after morph completes
        this.morphToShape('moon');

        // Wait for morph to complete (shrink + grow phases)
        setTimeout(() => {
            if (this.effectManager.hasLunarEclipse()) {
                this.effectManager.setLunarEclipse(eclipseType);
            }
        }, 600);
    }

    /**
     * Stop any active eclipse animation
     */
    stopEclipse() {
        this.effectManager.stopAllEclipses();
    }

    /**
     * Set lunar eclipse (Blood Moon) effect
     * @param {string} eclipseType - 'off', 'penumbral', 'partial', 'total'
     */
    setMoonEclipse(eclipseType = 'off') {
        if (this.geometryType !== 'moon' || !this.effectManager.hasLunarEclipse()) {
            console.warn('⚠️ Lunar eclipse only available for moon geometry');
            return;
        }

        // Set eclipse type via EffectManager
        this.effectManager.setLunarEclipse(eclipseType);
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
        this.crystalSoul = new CrystalSoul({ radius: 0.35, detail: 1, geometryType: effectiveGeometryType, renderer: this.renderer, assetBasePath: this.assetBasePath });
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
        this.behaviorController.setWobbleEnabled(enabled);

        // When disabling wobble, reset pitch/roll to upright, preserve yaw for rotation continuity
        if (!enabled) {
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
     * Set the active groove preset
     * Groove presets define the character of the ambient groove animation:
     * - 'groove1': Subtle, elegant - gentle bounce and sway (default)
     * - 'groove2': Energetic, bouncy - pronounced vertical motion
     * - 'groove3': Smooth, flowing - emphasis on rotation and sway
     *
     * @param {string} grooveName - Groove preset name ('groove1', 'groove2', 'groove3')
     * @param {Object} [options] - Transition options
     * @param {number} [options.bars] - Transition duration in bars (e.g., 2 = morph over 2 bars)
     * @param {number} [options.duration] - Transition duration in seconds (alternative to bars)
     */
    setGroove(grooveName, options = {}) {
        if (this.rhythm3DAdapter) {
            this.rhythm3DAdapter.setGroove(grooveName, options);
        }
    }

    /**
     * Get available groove preset names
     * @returns {string[]} Array of groove preset names
     */
    getGroovePresets() {
        if (this.rhythm3DAdapter) {
            return this.rhythm3DAdapter.getGroovePresets();
        }
        return ['groove1', 'groove2', 'groove3'];
    }

    /**
     * Get current groove preset name
     * @returns {string} Current groove preset name
     */
    getCurrentGroove() {
        if (this.rhythm3DAdapter) {
            return this.rhythm3DAdapter.getCurrentGroove();
        }
        return 'groove1';
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // IMPERATIVE BREATHING PHASE API (for meditation)
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Animate mascot scale for a breathing phase over a specified duration.
     * Used by meditation controller for precise breathing exercise timing.
     *
     * Scale targets:
     * - 'inhale': 1.0 → 1.3 (grow larger as lungs fill)
     * - 'exhale': current → 0.85 (shrink as lungs empty)
     * - 'hold': maintain current scale (no animation)
     *
     * @param {string} phase - 'inhale' | 'exhale' | 'hold'
     * @param {number} durationSec - Duration in seconds for the animation
     */
    breathePhase(phase, durationSec) {
        // Delegate to BreathingPhaseManager
        this.breathingPhaseManager.startPhase(phase, durationSec);
    }

    /**
     * Stop any active breathing phase animation and reset to neutral scale
     */
    stopBreathingPhase() {
        this.breathingPhaseManager.stop();
    }

    /**
     * Update imperative breathing phase animation
     * Called from render loop
     * @private
     * @param {number} deltaTime - Time since last frame in ms
     * @returns {number} Current breathing phase scale multiplier (1.0 if inactive)
     */
    _updateBreathingPhase(deltaTime) {
        // Delegate to BreathingPhaseManager
        return this.breathingPhaseManager.update(deltaTime);
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

        // ═══════════════════════════════════════════════════════════════════
        // CLEAR SHATTER STATE - If shards are out (frozen/shattering), clear them
        // Morph should transition cleanly to new geometry without lingering shards
        // ═══════════════════════════════════════════════════════════════════
        if (this.shatterSystem && !this.shatterSystem.isIdle()) {
            this.shatterSystem.forceStop();
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
        profiler.startFrame();

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

        // Store deltaTime in seconds for particle systems
        this._lastDeltaTime = deltaTime / 1000;

        // Update animations
        profiler.start('animator');
        this.animator.update(deltaTime);
        profiler.end('animator');

        // Update geometry morph animation
        profiler.start('geometryMorpher');
        const morphState = this.geometryMorpher.update(deltaTime);
        profiler.end('geometryMorpher');

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
        // Skip render for multiple frames after swap to let Three.js scene fully stabilize
        // Single-frame skip isn't enough - null refs can persist for 1-2 additional frames
        if (morphState.shouldSwapGeometry && this._targetGeometry) {
            // Skip render for 3 frames after swap to ensure scene is fully stable
            this._skipRenderFrames = 3;
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

            // Create callback for when textures finish loading (for moon async textures)
            // This re-runs shard precomputation so shards get the actual texture
            // IMPORTANT: Capture geometryType NOW because _targetGeometryType gets cleared after morph
            const geometryTypeForCallback = this._targetGeometryType;
            const onTextureReady = material => {
                if (this.shatterSystem && this.renderer?.coreMesh) {
                    this.shatterSystem.precomputeShards(
                        this.renderer.coreMesh,
                        geometryTypeForCallback
                    );
                }
            };

            const materialResult = createCustomMaterial(this._targetGeometryType, this._targetGeometryConfig, {
                glowColor: this.glowColor || [1.0, 1.0, 0.95],
                glowIntensity: this.glowIntensity || 1.0,
                materialVariant: this.materialVariant,
                emotionData, // Pass emotion data for auto-deriving geometry params
                assetBasePath: this.assetBasePath,
                onTextureReady
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

            // Reset Euler angles to upright [pitch=0, yaw=0, roll=0]
            this.rotation = [0, 0, 0];

            // Initialize effects for target geometry via EffectManager
            // This automatically disposes effects not needed for the target geometry
            const sunRadius = this.geometry.parameters?.radius || 0.5;
            this.effectManager.initializeForGeometry(this._targetGeometryType, {
                coreMesh: this.renderer.coreMesh,
                customMaterial: this.customMaterial,
                sunRadius
            });

            // ═══════════════════════════════════════════════════════════════════
            // PRECOMPUTE SHARDS - Generate shard geometries and extract material
            // This eliminates first-shatter lag by caching everything upfront
            // ═══════════════════════════════════════════════════════════════════
            if (this.shatterSystem && this.renderer?.coreMesh) {
                this.shatterSystem.precomputeShards(
                    this.renderer.coreMesh,
                    this._targetGeometryType
                );
            }

            // Create or dispose crystal inner core (still uses createCrystalInnerCore for now)
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

            // Update behavior controller for target geometry
            // Build facing config for moon if needed
            let facingConfig = null;
            if (this._targetGeometryType === 'moon' && MOON_FACING_CONFIG.enabled) {
                const degToRad = Math.PI / 180;
                facingConfig = {
                    enabled: true,
                    strength: MOON_FACING_CONFIG.strength,
                    lockedFace: MOON_FACING_CONFIG.lockedFace,
                    lerpSpeed: MOON_FACING_CONFIG.lerpSpeed,
                    calibrationRotation: [
                        MOON_CALIBRATION_ROTATION.x * degToRad,
                        MOON_CALIBRATION_ROTATION.y * degToRad,
                        MOON_CALIBRATION_ROTATION.z * degToRad
                    ]
                };
            }

            // Configure behaviors for target geometry via controller
            // Note: emotionData is already declared above in this scope
            this.behaviorController.configureForMorph({
                targetGeometryType: this._targetGeometryType,
                emotionData,
                facingConfig,
                geometryRotation: null // No geometry-specific rotation during morph
            });

            // Handle moon-specific camera and controls
            if (this._targetGeometryType === 'moon') {
                // Disable OrbitControls camera rotation for moon (tidally locked)
                if (this.renderer?.controls) {
                    this.renderer.controls.autoRotate = false;
                }

                // Reset camera to front view INSTANTLY (immune to auto-rotate position)
                // This ensures moon always faces camera directly with calibrated orientation
                // Use instant reset (0ms) to avoid camera still moving during morph
                // preserveTarget=true keeps the Y offset set by the host app (emotive-holo)
                if (this.renderer?.setCameraPreset) {
                    this.renderer.setCameraPreset('front', 0, true);
                }

                // Apply calibrated rotation to show "Man in the Moon" Earth-facing view
                const degToRad = Math.PI / 180;
                this.calibrationRotation[0] = MOON_CALIBRATION_ROTATION.x * degToRad;
                this.calibrationRotation[1] = MOON_CALIBRATION_ROTATION.y * degToRad;
                this.calibrationRotation[2] = MOON_CALIBRATION_ROTATION.z * degToRad;
            } else {
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
        profiler.start('breathing');
        this.breathingAnimator.update(deltaTime, this.emotion, getUndertoneModifier(this.undertone));
        profiler.end('breathing');

        // Update imperative breathing phase (for meditation)
        const imperativeBreathScale = this._updateBreathingPhase(deltaTime);

        // Get breathing scale multiplier
        // If imperative breathing is active (scale != 1.0), use it exclusively
        // Otherwise fall back to ambient breathing if enabled
        const breathScale = (imperativeBreathScale !== 1.0)
            ? imperativeBreathScale
            : (this.breathingEnabled ? this.breathingAnimator.getBreathingScale() : 1.0);

        // Get morph scale multiplier (for shrink/grow effect)
        const morphScale = morphState.scaleMultiplier;

        // Update blink animation
        const blinkState = this.blinkAnimator.update(deltaTime);

        // Update all behaviors (rotation, righting, facing) via controller
        // This handles: ambient spin, self-stabilization, and tidal lock for moon
        // Apply freeze from previous frame's hold gesture (reduces rotation speed)
        profiler.start('behaviorController');
        const freezeRotation = this._pendingFreezeRotation || 0;
        const freezeWobble = this._pendingFreezeWobble || 0;

        // Temporarily reduce rotation speed if frozen
        if (freezeRotation > 0) {
            // Scale delta time by freeze amount (0 = normal, 1 = frozen)
            const frozenDeltaTime = deltaTime * (1.0 - freezeRotation);
            this.behaviorController.update(frozenDeltaTime, this.baseEuler);
        } else {
            this.behaviorController.update(deltaTime, this.baseEuler);
        }
        profiler.end('behaviorController');

        // Set wobble enabled based on freeze (temporarily disable during hold)
        if (freezeWobble > 0.5 && this.wobbleEnabled) {
            this.behaviorController.setWobbleEnabled(false);
            this._wobbleWasFrozen = true;
        } else if (this._wobbleWasFrozen && freezeWobble < 0.5) {
            this.behaviorController.setWobbleEnabled(this.wobbleEnabled);
            this._wobbleWasFrozen = false;
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
        profiler.start('rhythmAdapter');
        if (this.rhythm3DAdapter) {
            this.rhythm3DAdapter.update(deltaTime);
        }
        profiler.end('rhythmAdapter');

        // ═══════════════════════════════════════════════════════════════════════════
        // GESTURE BLENDING SYSTEM - Blend multiple simultaneous gestures
        // ═══════════════════════════════════════════════════════════════════════════
        profiler.start('gestureBlend');
        const blended = this.animationManager.blend(
            this.baseEuler,  // Pass raw Euler angles to avoid gimbal lock
            this.baseScale,
            this.baseGlowIntensity
        );
        profiler.end('gestureBlend');

        // Get rhythm modulation (applies to gesture output)
        // Auto-detects if rhythm is playing (started by any system - audio manager, etc.)
        const rhythmMod = this.rhythm3DAdapter?.isPlaying()
            ? this.rhythm3DAdapter.getModulation()
            : null;

        // ═══════════════════════════════════════════════════════════════════════════
        // GROOVE + GESTURE BLENDING SYSTEM
        // ═══════════════════════════════════════════════════════════════════════════
        // Two types of gestures:
        // 1. ABSOLUTE gestures (bounce, spin): Create their own motion, reduce groove to avoid conflict
        // 2. ACCENT gestures (pop, punch): Boost groove as punctuation, keep groove at full strength
        //
        // Key insight: Accent gestures work WITH the groove, not against it.

        // Determine groove blend factor based on gesture type
        // - Accent-only: Keep groove at 100% (accents enhance groove)
        // - Absolute gestures: Reduce groove to 30% (avoid competing animations)
        // - No gestures: Full groove
        const hasAbsolute = blended.hasAbsoluteGestures;

        // Smooth the groove blend transition to avoid discontinuity
        // Initialize if not set
        if (this._grooveBlendCurrent === undefined) {
            this._grooveBlendCurrent = 1.0;
        }

        // Initialize smoothed boost values (match groove smoothing for consistent feel)
        if (this._smoothedBoost === undefined) {
            this._smoothedBoost = {
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: 1.0
            };
        }

        // Target: 30% for absolute gestures, 100% for accent-only or no gestures
        // Apply freeze modifier: freezeGroove reduces groove animation
        const freezeGroove = blended.freezeGroove || 0;
        const freezeMultiplier = 1.0 - freezeGroove; // 1 = normal, 0 = frozen
        const grooveBlendTarget = (hasAbsolute ? 0.3 : 1.0) * freezeMultiplier;

        // Smooth transition (lerp toward target)
        // Use same smoothing speed as groove for consistent feel
        const blendSpeed = 12.0; // Match grooveSmoothingSpeed in Rhythm3DAdapter
        const dt = deltaTime / 1000;
        const t = 1 - Math.exp(-blendSpeed * dt);

        this._grooveBlendCurrent += (grooveBlendTarget - this._grooveBlendCurrent) * t;
        const grooveBlend = this._grooveBlendCurrent;

        // Smooth boost values toward their targets (same speed as groove)
        const targetPosBoost = blended.positionBoost || [0, 0, 0];
        const targetRotBoost = blended.rotationBoost || [0, 0, 0];
        const targetScaleBoost = blended.scaleBoost || 1.0;

        for (let i = 0; i < 3; i++) {
            this._smoothedBoost.position[i] += (targetPosBoost[i] - this._smoothedBoost.position[i]) * t;
            this._smoothedBoost.rotation[i] += (targetRotBoost[i] - this._smoothedBoost.rotation[i]) * t;
        }
        this._smoothedBoost.scale += (targetScaleBoost - this._smoothedBoost.scale) * t;

        // Use smoothed boost values (computed above) for all channels
        const posBoost = this._smoothedBoost.position;
        const rotBoost = this._smoothedBoost.rotation;
        const scaleBoost = this._smoothedBoost.scale;

        // ═══════════════════════════════════════════════════════════════════════════
        // CAMERA-RELATIVE TRANSFORMS: View-space position & rotation to world-space
        // ═══════════════════════════════════════════════════════════════════════════
        // This enables "tidally locked" gestures that move toward/away from camera
        // regardless of camera angle. View-space: Z = toward camera, Y = up, X = right
        let camRelWorldX = 0, camRelWorldY = 0, camRelWorldZ = 0;
        this._cameraRoll = 0;  // Reset camera roll each frame

        if (blended.hasCameraRelativeGestures && this.renderer.camera) {
            const cam = this.renderer.camera;
            const camRelPos = blended.cameraRelativePosition;

            // Get camera's basis vectors in world space
            // Forward = direction camera is looking (negative Z in camera space)
            // We want "toward camera" so we negate it
            if (!this._camTempVec3) {
                this._camTempVec3 = new THREE.Vector3();
                this._camRight = new THREE.Vector3();
                this._camUp = new THREE.Vector3();
                this._camForward = new THREE.Vector3();
            }

            // Ensure camera matrix is up to date
            cam.updateMatrixWorld();

            // Get camera direction (where it's looking)
            cam.getWorldDirection(this._camForward);

            // Right vector = camera's X axis in world space
            this._camRight.setFromMatrixColumn(cam.matrixWorld, 0);

            // Up vector = camera's Y axis in world space
            this._camUp.setFromMatrixColumn(cam.matrixWorld, 1);

            // Transform view-space position to world-space:
            // X (right in view) -> camera right
            // Y (up in view) -> camera up
            // Z (toward camera in view) -> negative camera forward
            camRelWorldX = this._camRight.x * camRelPos[0] + this._camUp.x * camRelPos[1] - this._camForward.x * camRelPos[2];
            camRelWorldY = this._camRight.y * camRelPos[0] + this._camUp.y * camRelPos[1] - this._camForward.y * camRelPos[2];
            camRelWorldZ = this._camRight.z * camRelPos[0] + this._camUp.z * camRelPos[1] - this._camForward.z * camRelPos[2];

            // Camera-relative rotation: use the cameraRoll parameter in renderer
            // This rotates around the camera's forward vector, giving true "lean left/right as seen"
            const camRelRot = blended.cameraRelativeRotation;
            if (camRelRot && camRelRot[2] !== 0) {
                // Z roll in view space = rotation around camera forward = cameraRoll
                this._cameraRoll = camRelRot[2];
            } else {
                this._cameraRoll = 0;
            }
        }

        if (rhythmMod) {
            // ═══════════════════════════════════════════════════════════════════════
            // POSITION: Groove + Absolute gestures + Camera-relative + Accent boosts
            // ═══════════════════════════════════════════════════════════════════════
            // 1. Groove offset (scaled by grooveBlend)
            const grooveOffsetX = rhythmMod.grooveOffset[0] * grooveBlend;
            const grooveOffsetY = rhythmMod.grooveOffset[1] * grooveBlend;
            const grooveOffsetZ = rhythmMod.grooveOffset[2] * grooveBlend;

            // 2. Absolute gesture position (with rhythm multiplier)
            const posMult = hasAbsolute ? rhythmMod.positionMultiplier : 1.0;

            // 3. Combine: gesture + camera-relative + groove + smoothed boost
            this.position = [
                blended.position[0] * posMult + camRelWorldX + grooveOffsetX + posBoost[0],
                blended.position[1] * posMult + camRelWorldY + grooveOffsetY + posBoost[1],
                blended.position[2] * posMult + camRelWorldZ + grooveOffsetZ + posBoost[2]
            ];

            // ═══════════════════════════════════════════════════════════════════════
            // ROTATION: Groove sway + Absolute gestures + Accent boosts
            // (Camera-relative rotation is applied via cameraRoll in renderer)
            // ═══════════════════════════════════════════════════════════════════════
            this.rotation = [
                blended.rotation[0] + rhythmMod.grooveRotation[0] * grooveBlend + rotBoost[0],
                blended.rotation[1] + rhythmMod.grooveRotation[1] * grooveBlend + rotBoost[1],
                blended.rotation[2] + rhythmMod.grooveRotation[2] * grooveBlend + rotBoost[2]
            ];

            // ═══════════════════════════════════════════════════════════════════════
            // SCALE: Groove pulse × Absolute gestures × Accent boost (smoothed)
            // ═══════════════════════════════════════════════════════════════════════
            // grooveScale oscillates around 1.0, so we lerp toward 1.0 when reduced
            const grooveScaleEffect = 1.0 + (rhythmMod.grooveScale - 1.0) * grooveBlend;
            const scaleMult = hasAbsolute ? rhythmMod.scaleMultiplier : 1.0;

            this.scale = blended.scale * grooveScaleEffect * scaleMult * scaleBoost;
            // Non-uniform scale (squash/stretch) - apply rhythm multipliers
            if (blended.nonUniformScale) {
                const totalMult = grooveScaleEffect * scaleMult * scaleBoost;
                this.nonUniformScale = [
                    blended.nonUniformScale[0] * totalMult,
                    blended.nonUniformScale[1] * totalMult,
                    blended.nonUniformScale[2] * totalMult
                ];
            } else {
                this.nonUniformScale = null;
            }
        } else {
            // No rhythm - apply gestures + camera-relative with smoothed boosts
            // (Camera-relative rotation is applied via cameraRoll in renderer)
            this.position = [
                blended.position[0] + camRelWorldX + posBoost[0],
                blended.position[1] + camRelWorldY + posBoost[1],
                blended.position[2] + camRelWorldZ + posBoost[2]
            ];
            this.rotation = [
                blended.rotation[0] + rotBoost[0],
                blended.rotation[1] + rotBoost[1],
                blended.rotation[2] + rotBoost[2]
            ];
            this.scale = blended.scale * scaleBoost;
            // Non-uniform scale (squash/stretch) - apply scale boost
            if (blended.nonUniformScale) {
                this.nonUniformScale = [
                    blended.nonUniformScale[0] * scaleBoost,
                    blended.nonUniformScale[1] * scaleBoost,
                    blended.nonUniformScale[2] * scaleBoost
                ];
            } else {
                this.nonUniformScale = null;
            }
        }

        // Only apply blended glow if no manual override is active
        if (this.glowIntensityOverride === null) {
            if (rhythmMod) {
                // Blend groove glow with gesture glow multiplier
                const grooveGlowEffect = 1.0 + (rhythmMod.grooveGlow - 1.0) * grooveBlend;
                const glowMult = hasAbsolute ? rhythmMod.glowMultiplier : 1.0;
                this.glowIntensity = blended.glowIntensity * grooveGlowEffect * glowMult;
            } else {
                this.glowIntensity = blended.glowIntensity;
            }
        }
        this.gestureQuaternion = blended.gestureQuaternion;
        this.glowBoost = blended.glowBoost || 0; // For isolated glow layer

        // ═══════════════════════════════════════════════════════════════════════════
        // GLOW COLOR OVERRIDE - Temporary glow color from electric/elemental effects
        // ═══════════════════════════════════════════════════════════════════════════
        // When a gesture provides glowColorOverride, temporarily use that color
        // instead of the emotion glow color. This creates electric cyan, fire orange, etc.
        if (blended.glowColorOverride) {
            // Store original color if not already stored
            if (!this._originalGlowColor) {
                this._originalGlowColor = [...this.glowColor];
            }
            // Apply override
            this.glowColor = [...blended.glowColorOverride];
        } else if (this._originalGlowColor) {
            // Smooth lerp back to original color — prevents instant snap when
            // gesture ends and glowColorOverride drops to null in one frame.
            // Exponential lerp: ~8 frames to converge at 60fps.
            const lerpRate = 0.2;
            this.glowColor[0] += (this._originalGlowColor[0] - this.glowColor[0]) * lerpRate;
            this.glowColor[1] += (this._originalGlowColor[1] - this.glowColor[1]) * lerpRate;
            this.glowColor[2] += (this._originalGlowColor[2] - this.glowColor[2]) * lerpRate;
            // Check if close enough to snap to final value
            const diff = Math.abs(this.glowColor[0] - this._originalGlowColor[0]) +
                         Math.abs(this.glowColor[1] - this._originalGlowColor[1]) +
                         Math.abs(this.glowColor[2] - this._originalGlowColor[2]);
            if (diff < 0.01) {
                this.glowColor = [...this._originalGlowColor];
                this._originalGlowColor = null;
            }
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // ELECTRIC OVERLAY - Additive lightning effect rendered ON TOP of mesh
        // ═══════════════════════════════════════════════════════════════════════════
        // Creates a duplicate mesh with electric shader that renders additively,
        // so lightning appears on top of the original mesh appearance.
        if (blended.electricOverlay && blended.electricOverlay.enabled) {
            const mesh = this.renderer?.coreMesh;
            const scene = this.renderer?.scene;
            if (mesh && scene) {
                // Create overlay mesh if not already created
                if (!this._electricOverlayMesh) {
                    // Create electric material with additive blending
                    this._electricMaterial = createElectricMaterial({
                        charge: Math.min(1.0, blended.electricOverlay.charge),
                        opacity: 0.7  // Semi-transparent for overlay
                    });

                    // Clone the mesh geometry for the overlay
                    this._electricOverlayMesh = new THREE.Mesh(
                        mesh.geometry,
                        this._electricMaterial
                    );

                    // Slightly larger to avoid z-fighting
                    this._electricOverlayMesh.scale.setScalar(1.02);

                    // Add as child of original mesh so it follows transforms
                    mesh.add(this._electricOverlayMesh);

                    // Render after original mesh
                    this._electricOverlayMesh.renderOrder = mesh.renderOrder + 1;
                }

                // Spawn 3D electricity elements - runs every frame but signature prevents respawn
                const {spawnMode, animation, models, count, scale, embedDepth, duration} = blended.electricOverlay;
                if (spawnMode && spawnMode !== 'none' && this.elementSpawner) {
                    // Create spawn signature from key config properties to detect gesture changes
                    const modeSignature = Array.isArray(spawnMode)
                        ? `layers:${spawnMode.length}:${spawnMode.map(l => l.type).join(',')}`
                        : (typeof spawnMode === 'object' ? spawnMode.type : String(spawnMode));
                    const spawnSignature = `electricity:${modeSignature}:${duration}:${animation?.type || 'default'}`;

                    // Track spawned signatures to prevent re-spawning for gestures we've already handled
                    this._electricSpawnedSignatures = this._electricSpawnedSignatures || new Set();

                    // Only spawn if this signature hasn't been spawned yet in this session
                    if (!this._electricSpawnedSignatures.has(spawnSignature)) {
                        this.elementSpawner.triggerExit('electricity'); // Exit electricity elements (crossfade)
                        this.elementSpawner.spawn('electricity', {
                            intensity: blended.electricOverlay.strength || 0.8,
                            mode: spawnMode,
                            animation,
                            models,
                            count,
                            scale,
                            embedDepth,
                            gestureDuration: duration || 2000
                        });
                        this._electricSpawnedSignatures.add(spawnSignature);
                        this._electricSpawnSignature = spawnSignature;
                    }
                }

                // Update electric material each frame
                if (this._electricMaterial?.uniforms?.uTime) {
                    this._electricMaterial.uniforms.uTime.value = blended.electricOverlay.time;
                }
                // Update charge dynamically
                if (this._electricMaterial?.uniforms?.uCharge) {
                    this._electricMaterial.uniforms.uCharge.value = Math.min(1.0, blended.electricOverlay.charge);
                }

                // Store gesture progress for element spawner animation
                this._currentElectricProgress = blended.electricOverlay.progress ?? null;
            }
        } else if (this._electricOverlayMesh) {
            // Remove overlay mesh when electric effect ends
            const mesh = this.renderer?.coreMesh;
            if (mesh && this._electricOverlayMesh.parent) {
                mesh.remove(this._electricOverlayMesh);
            }
            // Dispose resources
            if (this._electricMaterial) {
                this._electricMaterial.dispose();
                this._electricMaterial = null;
            }
            this._electricOverlayMesh = null;

            // Gracefully exit electricity elements (fade out)
            if (this.elementSpawner) {
                this.elementSpawner.triggerExit('electricity');
            }

            // Clear spawn tracking so next gesture session starts fresh
            this._electricSpawnSignature = null;
            this._electricSpawnedSignatures = null;

            // Clear electric progress tracking
            this._currentElectricProgress = null;
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // WATER OVERLAY - Fluid/wet effect shader overlay
        // ═══════════════════════════════════════════════════════════════════════════
        // Creates a duplicate mesh with water shader that renders on top,
        // showing caustics, fresnel, and wet appearance.
        if (blended.waterOverlay && blended.waterOverlay.enabled) {
            const mesh = this.renderer?.coreMesh;
            const scene = this.renderer?.scene;
            if (mesh && scene) {
                // Create overlay mesh if not already created
                if (!this._waterOverlayMesh) {
                    // Create water material in overlay mode (additive blending)
                    this._waterMaterial = createWaterMaterial({
                        viscosity: 0.3,  // Watery (not thick)
                        opacity: 0.5,   // Semi-transparent for overlay
                        overlay: true    // Use additive blending like electric
                    });

                    // Clone the mesh geometry for the overlay
                    this._waterOverlayMesh = new THREE.Mesh(
                        mesh.geometry,
                        this._waterMaterial
                    );

                    // Slightly larger to avoid z-fighting
                    this._waterOverlayMesh.scale.setScalar(1.01);

                    // Add as child of original mesh so it follows transforms
                    mesh.add(this._waterOverlayMesh);

                    // Render after original mesh
                    this._waterOverlayMesh.renderOrder = mesh.renderOrder + 1;
                }

                // Spawn 3D water elements - runs every frame but signature prevents respawn
                const {spawnMode, animation, models, count, scale, embedDepth, duration} = blended.waterOverlay;
                if (spawnMode && spawnMode !== 'none' && this.elementSpawner) {
                    // Create spawn signature from key config properties to detect gesture changes
                    const spawnSignature = `water:${spawnMode}:${duration}:${animation?.type || 'default'}`;

                    // Track spawned signatures to prevent re-spawning for gestures we've already handled
                    this._spawnedSignatures = this._spawnedSignatures || new Set();

                    // Only spawn if this signature hasn't been spawned yet in this session
                    if (!this._spawnedSignatures.has(spawnSignature)) {
                        this.elementSpawner.triggerExit(); // Exit ALL elements (crossfade)
                        this.elementSpawner.spawn('water', {
                            intensity: blended.waterOverlay.strength || 0.8,
                            mode: spawnMode,
                            animation,      // Phase 11: Pass animation config with modelOverrides
                            models,
                            count,
                            scale,
                            embedDepth,
                            gestureDuration: duration || 1500
                        });
                        this._spawnedSignatures.add(spawnSignature);
                        this._elementSpawnSignature = spawnSignature;
                    }
                }

                // Update water material each frame
                if (this._waterMaterial?.uniforms?.uTime) {
                    this._waterMaterial.uniforms.uTime.value = blended.waterOverlay.time;
                }
                // Update opacity based on wetness
                if (this._waterMaterial?.uniforms?.uOpacity) {
                    this._waterMaterial.uniforms.uOpacity.value = Math.min(0.8, blended.waterOverlay.wetness);
                }

                // Store gesture progress for element spawner animation
                this._currentWaterProgress = blended.waterOverlay.progress ?? null;
            }
        } else if (this._waterOverlayMesh) {
            // Remove overlay mesh when water effect ends
            const mesh = this.renderer?.coreMesh;
            if (mesh && this._waterOverlayMesh.parent) {
                mesh.remove(this._waterOverlayMesh);
            }
            // Dispose resources
            if (this._waterMaterial) {
                this._waterMaterial.dispose();
                this._waterMaterial = null;
            }
            this._waterOverlayMesh = null;

            // Gracefully exit water elements (fade out)
            if (this.elementSpawner) {
                this.elementSpawner.triggerExit('water');
            }

            // Clear spawn tracking so next gesture session starts fresh
            this._elementSpawnSignature = null;
            this._spawnedSignatures = null;

            // Clear water progress tracking
            this._currentWaterProgress = null;
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // FIRE OVERLAY - Flame effect applied as additive shader overlay
        // ═══════════════════════════════════════════════════════════════════════════
        // Creates a duplicate mesh with fire shader that renders on top,
        // showing flames, heat glow, and embers.
        if (blended.fireOverlay && blended.fireOverlay.enabled) {
            const mesh = this.renderer?.coreMesh;
            const scene = this.renderer?.scene;
            if (mesh && scene) {
                // Create overlay mesh if not already created
                if (!this._fireOverlayMesh) {
                    // Create fire material in overlay mode
                    this._fireMaterial = createFireMaterial({
                        temperature: blended.fireOverlay.temperature || 0.5,
                        opacity: 0.6,
                        overlay: true  // Use overlay mode for sparse flame visibility
                    });

                    // Clone the mesh geometry for the overlay
                    this._fireOverlayMesh = new THREE.Mesh(
                        mesh.geometry,
                        this._fireMaterial
                    );

                    // Slightly larger to avoid z-fighting
                    this._fireOverlayMesh.scale.setScalar(1.02);

                    // Add as child of original mesh so it follows transforms
                    mesh.add(this._fireOverlayMesh);

                    // Render after original mesh
                    this._fireOverlayMesh.renderOrder = mesh.renderOrder + 2;
                }

                // Spawn 3D fire elements - runs every frame but signature prevents respawn
                const {spawnMode, animation, models, count, scale, embedDepth} = blended.fireOverlay;
                if (spawnMode && spawnMode !== 'none' && this.elementSpawner) {
                    // Create spawn signature from key config properties to detect gesture changes
                    // Handle array spawnMode (spawn layers) by stringifying for reliable signature
                    const modeSignature = Array.isArray(spawnMode)
                        ? `layers:${spawnMode.length}:${spawnMode.map(l => l.type).join(',')}`
                        : String(spawnMode);
                    const spawnSignature = `fire:${modeSignature}:${blended.fireOverlay.duration}:${animation?.type || 'default'}`;

                    // Track spawned signatures to prevent re-spawning for gestures we've already handled
                    // This prevents: A runs, B interrupts, B ends, A's config returns → would respawn A
                    this._spawnedSignatures = this._spawnedSignatures || new Set();

                    // Only spawn if this signature hasn't been spawned yet in this session
                    if (!this._spawnedSignatures.has(spawnSignature)) {
                        this.elementSpawner.triggerExit(); // Exit ALL elements (crossfade)
                        this.elementSpawner.spawn('fire', {
                            intensity: blended.fireOverlay.strength || 0.8,
                            mode: spawnMode,
                            animation,      // Phase 11: Pass animation config with modelOverrides
                            models,
                            count,
                            scale,
                            embedDepth,
                            gestureDuration: blended.fireOverlay.duration || 2000
                        });
                        this._spawnedSignatures.add(spawnSignature);
                        this._elementSpawnSignature = spawnSignature;
                    }
                }

                // Update fire material each frame
                if (this._fireMaterial?.uniforms?.uTime) {
                    this._fireMaterial.uniforms.uTime.value = blended.fireOverlay.time;
                }
                // Update intensity based on heat
                if (this._fireMaterial?.uniforms?.uIntensity) {
                    const baseIntensity = this._fireMaterial.uniforms.uIntensity.value;
                    this._fireMaterial.uniforms.uIntensity.value = baseIntensity * (0.5 + blended.fireOverlay.heat * 0.5);
                }

                // Store gesture progress for element spawner animation (temperature evolution)
                this._currentFireProgress = blended.fireOverlay.progress ?? null;
            }
        } else if (this._fireOverlayMesh) {
            // Remove overlay mesh when fire effect ends
            const mesh = this.renderer?.coreMesh;
            if (mesh && this._fireOverlayMesh.parent) {
                mesh.remove(this._fireOverlayMesh);
            }
            // Dispose resources
            if (this._fireMaterial) {
                this._fireMaterial.dispose();
                this._fireMaterial = null;
            }
            this._fireOverlayMesh = null;

            // Gracefully exit fire elements (fade out)
            if (this.elementSpawner) {
                this.elementSpawner.triggerExit('fire');
            }

            // Clear spawn tracking so next gesture session starts fresh
            this._elementSpawnSignature = null;
            this._spawnedSignatures = null;

            // Clear fire progress tracking
            this._currentFireProgress = null;
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // SMOKE OVERLAY - Billboard sprite particles for soft organic smoke
        // ═══════════════════════════════════════════════════════════════════════════
        // Uses billboard sprites instead of mesh overlay to avoid angular look.
        // Sprites always face camera, overlap and blend for volumetric appearance.
        // Emanating: Rising particles, additive blend
        // Afflicted: Swirling particles, normal blend, surrounding effect
        if (blended.smokeOverlay && blended.smokeOverlay.enabled) {
            const mesh = this.renderer?.coreMesh;
            if (mesh) {
                const smokeCategory = blended.smokeOverlay.category || 'emanating';

                // Create particle system if not exists or category changed
                if (!this._smokeParticleSystem || this._smokeMaterialCategory !== smokeCategory) {
                    // Clean up old system
                    if (this._smokeParticleSystem) {
                        this._smokeParticleSystem.dispose();
                    }

                    // Create new particle system with current settings
                    this._smokeParticleSystem = new SmokeParticleSystem({
                        maxParticles: 80,
                        category: smokeCategory,
                        tint: blended.smokeOverlay.tint || [1.0, 1.0, 1.0],
                        density: blended.smokeOverlay.density || 0.5,
                        swirl: blended.smokeOverlay.swirl || 0.0
                    });

                    this._smokeMaterialCategory = smokeCategory;

                    // Attach to mesh so it follows transforms
                    this._smokeParticleSystem.attachTo(mesh);
                }

                // Update particle system each frame
                const deltaTime = this._lastDeltaTime || 0.016;
                this._smokeParticleSystem.update(deltaTime, {
                    thickness: blended.smokeOverlay.thickness,
                    category: smokeCategory,
                    tint: blended.smokeOverlay.tint,
                    density: blended.smokeOverlay.density,
                    swirl: blended.smokeOverlay.swirl
                });
            }
        } else if (this._smokeParticleSystem) {
            // Remove particle system when smoke effect ends
            this._smokeParticleSystem.dispose();
            this._smokeParticleSystem = null;
            this._smokeMaterialCategory = null;
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // VOID OVERLAY - Darkness absorption effect
        // ═══════════════════════════════════════════════════════════════════════════
        // Creates a duplicate mesh with void shader that renders on top,
        // showing darkness absorption, corruption tendrils, and light-draining effects.
        if (blended.voidOverlay && blended.voidOverlay.enabled) {
            // Cancel any in-progress fade-out (new gesture started while old was fading)
            this._voidOverlayFadingOut = false;
            const mesh = this.renderer?.coreMesh;
            const scene = this.renderer?.scene;
            if (mesh && scene) {
                // Create overlay mesh if not already created
                if (!this._voidOverlayMesh) {
                    this._voidMaterial = createVoidMaterial({
                        depth: blended.voidOverlay.depth || 0.7,
                        opacity: 0.95
                    });

                    this._voidOverlayMesh = new THREE.Mesh(
                        mesh.geometry,
                        this._voidMaterial
                    );

                    this._voidOverlayMesh.scale.setScalar(1.06);
                    mesh.add(this._voidOverlayMesh);
                    this._voidOverlayMesh.renderOrder = mesh.renderOrder + 3;
                }

                // Spawn 3D void elements — matching fire/ice/electric signature-based dedup
                const {spawnMode, animation, models, count, scale, embedDepth, duration, distortionStrength} = blended.voidOverlay;
                if (spawnMode && spawnMode !== 'none' && this.elementSpawner) {
                    // Create spawn signature from key config properties to detect gesture changes
                    const modeSignature = Array.isArray(spawnMode)
                        ? `layers:${spawnMode.length}:${spawnMode.map(l => l.type).join(',')}`
                        : (typeof spawnMode === 'object' ? spawnMode.type : String(spawnMode));
                    const spawnSignature = `void:${modeSignature}:${duration}:${animation?.type || 'default'}`;

                    this._voidSpawnedSignatures = this._voidSpawnedSignatures || new Set();

                    if (!this._voidSpawnedSignatures.has(spawnSignature)) {
                        // Per-gesture distortion strength override (only on gesture change)
                        if (this.elementSpawner._distortionManager) {
                            this.elementSpawner._distortionManager.setDistortionStrength(
                                'void',
                                distortionStrength !== undefined ? distortionStrength : null
                            );
                        }
                        this.elementSpawner.triggerExit('void'); // Exit void elements (crossfade)
                        this.elementSpawner.spawn('void', {
                            intensity: blended.voidOverlay.strength || 0.8,
                            mode: spawnMode,
                            animation,
                            models,
                            count,
                            scale,
                            embedDepth,
                            gestureDuration: duration || 2000
                        });
                        this._voidSpawnedSignatures.add(spawnSignature);
                        this._voidSpawnSignature = spawnSignature;
                    }
                }

                // Update void material each frame
                if (this._voidMaterial?.uniforms?.uTime) {
                    this._voidMaterial.uniforms.uTime.value = blended.voidOverlay.time;
                }
                if (this._voidMaterial?.uniforms?.uDepth) {
                    const boostedDepth = Math.min(1.0, (blended.voidOverlay.depth || 0.5) + 0.2);
                    this._voidMaterial.uniforms.uDepth.value = boostedDepth;
                }
                if (this._voidMaterial?.uniforms?.uOpacity) {
                    this._voidMaterial.uniforms.uOpacity.value = Math.min(0.95, blended.voidOverlay.strength);
                }
                if (this._voidMaterial?.uniforms?.uProgress) {
                    this._voidMaterial.uniforms.uProgress.value = blended.voidOverlay.progress ?? 0;
                }

                // Store gesture progress for element spawner animation
                this._currentVoidProgress = blended.voidOverlay.progress ?? null;
            }
        } else if (this._voidOverlayMesh) {
            // Fade out overlay smoothly before removing — prevents snap when gesture
            // is removed from the animation array at progress=1.0 before the factory's
            // decay has fully zeroed out the overlay opacity.
            if (!this._voidOverlayFadingOut) {
                this._voidOverlayFadingOut = true;
                // Trigger element exit once at fade start
                if (this.elementSpawner) {
                    this.elementSpawner.triggerExit('void');
                }
                // Clear progress tracking and spawn signatures
                this._currentVoidProgress = null;
                this._voidSpawnedSignatures = null;
            }

            // Exponential decay of overlay opacity (~5 frames to invisible at 60fps)
            if (this._voidMaterial?.uniforms?.uOpacity) {
                this._voidMaterial.uniforms.uOpacity.value *= 0.65;

                // Also decay distortion strength toward 0 during fade-out
                // Prevents spatial warping snap when overlay ends
                if (this.elementSpawner?._distortionManager) {
                    const dm = this.elementSpawner._distortionManager;
                    const mesh = dm.elementMeshes?.get('void');
                    if (mesh?.material?.uniforms?.uStrength) {
                        mesh.material.uniforms.uStrength.value *= 0.65;
                    }
                }

                if (this._voidMaterial.uniforms.uOpacity.value < 0.005) {
                    // Fully faded — safe to remove
                    const mesh = this.renderer?.coreMesh;
                    if (mesh && this._voidOverlayMesh.parent) {
                        mesh.remove(this._voidOverlayMesh);
                    }
                    this._voidMaterial.dispose();
                    this._voidMaterial = null;
                    this._voidOverlayMesh = null;
                    this._voidOverlayFadingOut = false;
                }
            } else {
                // No material — remove immediately
                const mesh = this.renderer?.coreMesh;
                if (mesh && this._voidOverlayMesh.parent) {
                    mesh.remove(this._voidOverlayMesh);
                }
                if (this._voidMaterial) {
                    this._voidMaterial.dispose();
                    this._voidMaterial = null;
                }
                this._voidOverlayMesh = null;
                this._voidOverlayFadingOut = false;
            }
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // ICE OVERLAY - Frost/freezing effect + 3D ice crystal spawning
        // ═══════════════════════════════════════════════════════════════════════════
        if (blended.iceOverlay && blended.iceOverlay.enabled) {
            const mesh = this.renderer?.coreMesh;
            const scene = this.renderer?.scene;
            if (mesh && scene) {
                if (!this._iceOverlayMesh) {
                    this._iceMaterial = createIceMaterial({
                        opacity: 0.5,
                        overlay: true    // Use additive blending like water overlay
                    });
                    this._iceOverlayMesh = new THREE.Mesh(mesh.geometry, this._iceMaterial);
                    this._iceOverlayMesh.scale.setScalar(1.01);
                    mesh.add(this._iceOverlayMesh);
                    this._iceOverlayMesh.renderOrder = mesh.renderOrder + 1;
                }

                // Spawn 3D ice crystals - matching fire spawn pattern with signature tracking
                const {spawnMode, animation, models, count, scale, embedDepth, duration} = blended.iceOverlay;
                if (spawnMode && spawnMode !== 'none' && this.elementSpawner) {
                    // Create spawn signature from key config properties to detect gesture changes
                    // Handle array spawnMode (spawn layers) by stringifying for reliable signature
                    const modeSignature = Array.isArray(spawnMode)
                        ? `layers:${spawnMode.length}:${spawnMode.map(l => l.type).join(',')}`
                        : (typeof spawnMode === 'object' ? spawnMode.type : String(spawnMode));
                    const spawnSignature = `ice:${modeSignature}:${duration}:${animation?.type || 'default'}`;

                    // Track spawned signatures to prevent re-spawning for gestures we've already handled
                    this._iceSpawnedSignatures = this._iceSpawnedSignatures || new Set();

                    // Only spawn if this signature hasn't been spawned yet in this session
                    if (!this._iceSpawnedSignatures.has(spawnSignature)) {
                        this.elementSpawner.triggerExit('ice'); // Exit ice elements (crossfade)
                        this.elementSpawner.spawn('ice', {
                            intensity: blended.iceOverlay.strength || 0.8,
                            mode: spawnMode,
                            animation,      // Pass animation config with modelOverrides
                            models,
                            count,
                            scale,
                            embedDepth,
                            gestureDuration: duration || 2000
                        });
                        this._iceSpawnedSignatures.add(spawnSignature);
                        this._iceSpawnSignature = spawnSignature;
                    }
                }

                // Update ice overlay material each frame
                if (this._iceMaterial?.uniforms?.uTime) {
                    this._iceMaterial.uniforms.uTime.value = blended.iceOverlay.time;
                }
                if (this._iceMaterial?.uniforms?.uFrost) {
                    this._iceMaterial.uniforms.uFrost.value = blended.iceOverlay.frost || 0.7;
                }
                if (this._iceMaterial?.uniforms?.uOpacity) {
                    this._iceMaterial.uniforms.uOpacity.value = Math.min(0.8, blended.iceOverlay.strength);
                }

                // ═══════════════════════════════════════════════════════════════════
                // ICE TINT: Modify the mascot's OWN material to look frozen
                // Different mascot shaders need different tinting approaches
                // This ensures ice looks the same regardless of mascot shader type
                // ═══════════════════════════════════════════════════════════════════
                const iceStrength = blended.iceOverlay.strength || 0.8;
                const mascotMat = mesh.material;
                if (mascotMat) {
                    // Save original values on first ice frame for restoration
                    if (!this._iceOriginalMaterial) {
                        this._iceOriginalMaterial = {};
                        if (mascotMat.uniforms) {
                            if (mascotMat.uniforms.glowColor) {
                                this._iceOriginalMaterial.glowColor = mascotMat.uniforms.glowColor.value.clone();
                            }
                            if (mascotMat.uniforms.coreColor) {
                                this._iceOriginalMaterial.coreColor = mascotMat.uniforms.coreColor.value.clone();
                            }
                            if (mascotMat.uniforms.glowIntensity) {
                                this._iceOriginalMaterial.glowIntensity = mascotMat.uniforms.glowIntensity.value;
                            }
                        }
                        if (mascotMat.emissive) {
                            this._iceOriginalMaterial.emissive = mascotMat.emissive.clone();
                            this._iceOriginalMaterial.emissiveIntensity = mascotMat.emissiveIntensity;
                        }
                        if (mascotMat.color) {
                            this._iceOriginalMaterial.color = mascotMat.color.clone();
                        }
                    }

                    // Apply ice blue tint to mascot's own material
                    // Lerp from SAVED ORIGINALS (not current value) to avoid cumulative drift
                    const iceBlue = this._iceTintColor || (this._iceTintColor = new THREE.Color(0.3, 0.5, 0.8));
                    const orig = this._iceOriginalMaterial;

                    if (mascotMat.uniforms) {
                        // ShaderMaterial (glow, crystal, moon)
                        if (mascotMat.uniforms.glowColor && orig.glowColor) {
                            mascotMat.uniforms.glowColor.value.copy(orig.glowColor).lerp(iceBlue, 0.3 * iceStrength);
                        }
                        if (mascotMat.uniforms.coreColor && orig.coreColor) {
                            mascotMat.uniforms.coreColor.value.copy(orig.coreColor).lerp(iceBlue, 0.4 * iceStrength);
                        }
                    }
                    if (mascotMat.emissive && orig.emissive) {
                        // MeshPhysicalMaterial (glass/crystal)
                        mascotMat.emissive.copy(orig.emissive).lerp(iceBlue, 0.3 * iceStrength);
                        mascotMat.emissiveIntensity = Math.max(orig.emissiveIntensity, 0.3 * iceStrength);
                    }
                    if (mascotMat.color && !mascotMat.uniforms && orig.color) {
                        // Standard materials - tint the base color
                        mascotMat.color.copy(orig.color).lerp(iceBlue, 0.2 * iceStrength);
                    }
                }

                // Store gesture progress for element spawner animation
                this._currentIceProgress = blended.iceOverlay.progress ?? null;
            }
        } else if (this._iceOverlayMesh) {
            const mesh = this.renderer?.coreMesh;
            if (mesh && this._iceOverlayMesh.parent) {
                mesh.remove(this._iceOverlayMesh);
            }
            if (this._iceMaterial) {
                this._iceMaterial.dispose();
                this._iceMaterial = null;
            }
            this._iceOverlayMesh = null;

            // Restore mascot's original material values
            if (this._iceOriginalMaterial && mesh?.material) {
                const mascotMat = mesh.material;
                const orig = this._iceOriginalMaterial;
                if (mascotMat.uniforms) {
                    if (orig.glowColor && mascotMat.uniforms.glowColor) {
                        mascotMat.uniforms.glowColor.value.copy(orig.glowColor);
                    }
                    if (orig.coreColor && mascotMat.uniforms.coreColor) {
                        mascotMat.uniforms.coreColor.value.copy(orig.coreColor);
                    }
                    if (orig.glowIntensity !== undefined && mascotMat.uniforms.glowIntensity) {
                        mascotMat.uniforms.glowIntensity.value = orig.glowIntensity;
                    }
                }
                if (orig.emissive && mascotMat.emissive) {
                    mascotMat.emissive.copy(orig.emissive);
                    mascotMat.emissiveIntensity = orig.emissiveIntensity;
                }
                if (orig.color && mascotMat.color && !mascotMat.uniforms) {
                    mascotMat.color.copy(orig.color);
                }
            }
            this._iceOriginalMaterial = null;

            // Gracefully exit ice crystals (fade out)
            if (this.elementSpawner) {
                this.elementSpawner.triggerExit('ice');
            }

            // Clear spawn tracking so next gesture session starts fresh
            this._iceSpawnSignature = null;
            this._iceSpawnedSignatures = null;

            // Clear ice progress tracking
            this._currentIceProgress = null;
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // LIGHT OVERLAY - Radiance/holy effect
        // ═══════════════════════════════════════════════════════════════════════════
        if (blended.lightOverlay && blended.lightOverlay.enabled) {
            // Cancel any in-progress fade-out (new gesture started while old was fading)
            this._lightOverlayFadingOut = false;
            const mesh = this.renderer?.coreMesh;
            const scene = this.renderer?.scene;
            if (mesh && scene) {
                if (!this._lightOverlayMesh) {
                    this._lightMaterial = createLightMaterial({
                        radiance: blended.lightOverlay.radiance || 0.7,
                        opacity: 0.35
                    });
                    this._lightOverlayMesh = new THREE.Mesh(mesh.geometry, this._lightMaterial);
                    this._lightOverlayMesh.scale.setScalar(1.04);
                    mesh.add(this._lightOverlayMesh);
                    this._lightOverlayMesh.renderOrder = mesh.renderOrder + 3;
                }

                // Spawn 3D light elements if gesture requests it via spawnMode
                const {spawnMode, animation, models, count, scale, embedDepth, duration} = blended.lightOverlay;
                if (spawnMode && spawnMode !== 'none' && this.elementSpawner) {
                    // Create spawn signature from key config properties to detect gesture changes
                    // Handle array spawnMode (spawn layers) by stringifying for reliable signature
                    const modeSignature = Array.isArray(spawnMode)
                        ? `layers:${spawnMode.length}:${spawnMode.map(l => l.type).join(',')}`
                        : (typeof spawnMode === 'object' ? spawnMode.type : String(spawnMode));
                    const spawnSignature = `light:${modeSignature}:${duration}:${animation?.type || 'default'}`;

                    // Track spawned signatures to prevent re-spawning for gestures we've already handled
                    this._lightSpawnedSignatures = this._lightSpawnedSignatures || new Set();

                    // Only spawn if this signature hasn't been spawned yet in this session
                    if (!this._lightSpawnedSignatures.has(spawnSignature)) {
                        this.elementSpawner.triggerExit('light'); // Exit light elements (crossfade)
                        this.elementSpawner.spawn('light', {
                            intensity: blended.lightOverlay.strength || 0.8,
                            mode: spawnMode,
                            animation,      // Pass animation config with modelOverrides
                            models,
                            count,
                            scale,
                            embedDepth,
                            gestureDuration: duration || 2000
                        });
                        this._lightSpawnedSignatures.add(spawnSignature);
                        this._lightSpawnSignature = spawnSignature;
                    }
                }

                // Update light overlay material each frame
                if (this._lightMaterial?.uniforms?.uTime) {
                    this._lightMaterial.uniforms.uTime.value = blended.lightOverlay.time;
                }
                if (this._lightMaterial?.uniforms?.uRadiance) {
                    this._lightMaterial.uniforms.uRadiance.value = blended.lightOverlay.radiance || 0.7;
                }
                if (this._lightMaterial?.uniforms?.uOpacity) {
                    this._lightMaterial.uniforms.uOpacity.value = Math.min(0.35, blended.lightOverlay.strength);
                }
                if (this._lightMaterial?.uniforms?.uProgress) {
                    this._lightMaterial.uniforms.uProgress.value = blended.lightOverlay.progress ?? 0;
                }

                // Track progress for exit detection
                this._currentLightProgress = blended.lightOverlay.progress ?? null;
            }
        } else if (this._lightOverlayMesh) {
            // Fade out overlay smoothly — reverse the consuming light so it retreats
            // instead of snapping off. Mirrors the void overlay fade-out pattern.
            if (!this._lightOverlayFadingOut) {
                this._lightOverlayFadingOut = true;
                // Trigger element exit once at fade start
                if (this.elementSpawner) {
                    this.elementSpawner.triggerExit('light');
                }
                // Clear spawn tracking so next gesture session starts fresh
                this._lightSpawnSignature = null;
                this._lightSpawnedSignatures = null;
            }

            // Decay progress back toward 0 — consuming light retreats the way it crept in
            if (this._lightMaterial?.uniforms?.uProgress) {
                this._lightMaterial.uniforms.uProgress.value *= 0.88;
            }
            // Also decay opacity
            if (this._lightMaterial?.uniforms?.uOpacity) {
                this._lightMaterial.uniforms.uOpacity.value *= 0.88;

                if (this._lightMaterial.uniforms.uOpacity.value < 0.005) {
                    // Fully faded — safe to remove
                    const mesh = this.renderer?.coreMesh;
                    if (mesh && this._lightOverlayMesh.parent) {
                        mesh.remove(this._lightOverlayMesh);
                    }
                    this._lightMaterial.dispose();
                    this._lightMaterial = null;
                    this._lightOverlayMesh = null;
                    this._lightOverlayFadingOut = false;
                    this._currentLightProgress = null;
                }
            } else {
                // No material — remove immediately
                const mesh = this.renderer?.coreMesh;
                if (mesh && this._lightOverlayMesh.parent) {
                    mesh.remove(this._lightOverlayMesh);
                }
                if (this._lightMaterial) {
                    this._lightMaterial.dispose();
                    this._lightMaterial = null;
                }
                this._lightOverlayMesh = null;
                this._lightOverlayFadingOut = false;
                this._currentLightProgress = null;
            }
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // POISON OVERLAY - Toxic/acid effect
        // ═══════════════════════════════════════════════════════════════════════════
        if (blended.poisonOverlay && blended.poisonOverlay.enabled) {
            const mesh = this.renderer?.coreMesh;
            const scene = this.renderer?.scene;
            if (mesh && scene) {
                if (!this._poisonOverlayMesh) {
                    this._poisonMaterial = createPoisonMaterial({
                        toxicity: blended.poisonOverlay.toxicity || 0.7,
                        opacity: 0.40
                    });
                    this._poisonOverlayMesh = new THREE.Mesh(mesh.geometry, this._poisonMaterial);
                    this._poisonOverlayMesh.scale.setScalar(1.03);
                    mesh.add(this._poisonOverlayMesh);
                    this._poisonOverlayMesh.renderOrder = mesh.renderOrder + 3;
                }
                if (this._poisonMaterial?.uniforms?.uTime) {
                    this._poisonMaterial.uniforms.uTime.value = blended.poisonOverlay.time;
                }
                if (this._poisonMaterial?.uniforms?.uToxicity) {
                    this._poisonMaterial.uniforms.uToxicity.value = blended.poisonOverlay.toxicity || 0.7;
                }
                if (this._poisonMaterial?.uniforms?.uOpacity) {
                    this._poisonMaterial.uniforms.uOpacity.value = Math.min(0.40, blended.poisonOverlay.strength);
                }
            }
        } else if (this._poisonOverlayMesh) {
            const mesh = this.renderer?.coreMesh;
            if (mesh && this._poisonOverlayMesh.parent) {
                mesh.remove(this._poisonOverlayMesh);
            }
            if (this._poisonMaterial) {
                this._poisonMaterial.dispose();
                this._poisonMaterial = null;
            }
            this._poisonOverlayMesh = null;
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // EARTH OVERLAY - Consuming petrification effect + 3D rock chunk spawning
        // ═══════════════════════════════════════════════════════════════════════════
        if (blended.earthOverlay && blended.earthOverlay.enabled) {
            // Cancel any in-progress fade-out (new gesture started while old was fading)
            this._earthOverlayFadingOut = false;
            const mesh = this.renderer?.coreMesh;
            const scene = this.renderer?.scene;
            if (mesh && scene) {
                if (!this._earthOverlayMesh) {
                    this._earthMaterial = createEarthMaterial({
                        petrification: blended.earthOverlay.petrification || 0.7,
                        opacity: 0.9
                    });
                    this._earthOverlayMesh = new THREE.Mesh(mesh.geometry, this._earthMaterial);
                    this._earthOverlayMesh.scale.setScalar(1.03);
                    mesh.add(this._earthOverlayMesh);
                    this._earthOverlayMesh.renderOrder = mesh.renderOrder + 3;

                    // Enable ambient occlusion — contact shadows between rock chunks
                    if (this.renderer) {
                        this.renderer.setAmbientOcclusion(true);
                    }
                }

                // Spawn 3D earth elements if gesture requests it via spawnMode
                const {spawnMode, animation, models, count, scale, embedDepth, duration} = blended.earthOverlay;
                if (spawnMode && spawnMode !== 'none' && this.elementSpawner) {
                    // Create spawn signature from key config properties to detect gesture changes
                    const modeSignature = Array.isArray(spawnMode)
                        ? `layers:${spawnMode.length}:${spawnMode.map(l => l.type).join(',')}`
                        : (typeof spawnMode === 'object' ? spawnMode.type : String(spawnMode));
                    const spawnSignature = `earth:${modeSignature}:${duration}:${animation?.type || 'default'}`;

                    // Track spawned signatures to prevent re-spawning
                    this._earthSpawnedSignatures = this._earthSpawnedSignatures || new Set();

                    if (!this._earthSpawnedSignatures.has(spawnSignature)) {
                        this.elementSpawner.triggerExit('earth');
                        this.elementSpawner.spawn('earth', {
                            intensity: blended.earthOverlay.strength || 0.8,
                            mode: spawnMode,
                            animation,
                            models,
                            count,
                            scale,
                            embedDepth,
                            gestureDuration: duration || 2000
                        }).catch(err => {
                            console.error('[Core3DManager] Earth spawn error:', err);
                        });
                        this._earthSpawnedSignatures.add(spawnSignature);
                        this._earthSpawnSignature = spawnSignature;
                    }
                }

                // Update earth overlay material each frame
                if (this._earthMaterial?.uniforms?.uTime) {
                    this._earthMaterial.uniforms.uTime.value = blended.earthOverlay.time;
                }
                if (this._earthMaterial?.uniforms?.uPetrification) {
                    this._earthMaterial.uniforms.uPetrification.value = blended.earthOverlay.petrification || 0.7;
                }
                if (this._earthMaterial?.uniforms?.uOpacity) {
                    this._earthMaterial.uniforms.uOpacity.value = Math.min(0.9, blended.earthOverlay.strength);
                }
                if (this._earthMaterial?.uniforms?.uProgress) {
                    this._earthMaterial.uniforms.uProgress.value = blended.earthOverlay.progress ?? 0;
                }

                // Track progress for exit detection
                this._currentEarthProgress = blended.earthOverlay.progress ?? null;
            }
        } else if (this._earthOverlayMesh) {
            // Fade out overlay smoothly — reverse the consuming stone so it retreats
            if (!this._earthOverlayFadingOut) {
                this._earthOverlayFadingOut = true;
                // Trigger element exit once at fade start
                if (this.elementSpawner) {
                    this.elementSpawner.triggerExit('earth');
                }
                // Clear spawn tracking so next gesture session starts fresh
                this._earthSpawnSignature = null;
                this._earthSpawnedSignatures = null;
            }

            // Decay progress back toward 0 — consuming stone retreats
            if (this._earthMaterial?.uniforms?.uProgress) {
                this._earthMaterial.uniforms.uProgress.value *= 0.88;
            }
            // Also decay opacity
            if (this._earthMaterial?.uniforms?.uOpacity) {
                this._earthMaterial.uniforms.uOpacity.value *= 0.88;

                if (this._earthMaterial.uniforms.uOpacity.value < 0.005) {
                    // Fully faded — safe to remove
                    const mesh = this.renderer?.coreMesh;
                    if (mesh && this._earthOverlayMesh.parent) {
                        mesh.remove(this._earthOverlayMesh);
                    }
                    this._earthMaterial.dispose();
                    this._earthMaterial = null;
                    this._earthOverlayMesh = null;
                    this._earthOverlayFadingOut = false;
                    this._currentEarthProgress = null;

                    // Disable AO unless ice is still active
                    if (this.renderer && !this._iceOverlayMesh) {
                        this.renderer.setAmbientOcclusion(false);
                    }
                }
            } else {
                // No material — remove immediately
                const mesh = this.renderer?.coreMesh;
                if (mesh && this._earthOverlayMesh.parent) {
                    mesh.remove(this._earthOverlayMesh);
                }
                if (this._earthMaterial) {
                    this._earthMaterial.dispose();
                    this._earthMaterial = null;
                }
                this._earthOverlayMesh = null;
                this._earthOverlayFadingOut = false;
                this._currentEarthProgress = null;

                // Disable AO unless ice is still active
                if (this.renderer && !this._iceOverlayMesh) {
                    this.renderer.setAmbientOcclusion(false);
                }
            }
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // NATURE OVERLAY - Plant/growth effect
        // ═══════════════════════════════════════════════════════════════════════════
        if (blended.natureOverlay && blended.natureOverlay.enabled) {
            const mesh = this.renderer?.coreMesh;
            const scene = this.renderer?.scene;
            if (mesh && scene) {
                // Track if we've already spawned elements this gesture (use a simple flag)
                if (!this._natureSpawnedThisGesture) {
                    this._natureSpawnedThisGesture = true;

                    // Spawn 3D nature elements only if gesture explicitly requests it via spawnMode
                    // Extract all spawn options like fire does
                    const {spawnMode, animation, models, count, scale, embedDepth} = blended.natureOverlay;
                    if (spawnMode && spawnMode !== 'none' && this.elementSpawner && !this.elementSpawner.hasElements('nature')) {
                        this.elementSpawner.spawn('nature', {
                            intensity: blended.natureOverlay.strength || 0.8,
                            mode: spawnMode,
                            animation,
                            models,
                            count,
                            scale,
                            embedDepth,
                            gestureDuration: blended.natureOverlay.duration || 3000
                        }).catch(err => {
                            console.error('[Core3DManager] Nature spawn error:', err);
                        });
                    }
                }
            }
        } else if (this._natureSpawnedThisGesture) {
            // Reset spawn flag when gesture ends
            this._natureSpawnedThisGesture = false;

            // Despawn nature elements
            if (this.elementSpawner) {
                this.elementSpawner.despawn('nature');
            }
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // MESH OPACITY - Fade mascot in/out (for smokebomb/vanish/materialize)
        // ═══════════════════════════════════════════════════════════════════════════
        // Controls the main mesh's opacity independent of glow/overlay effects.
        // Used for ninja smokebomb (fade while hidden by smoke) and magician vanish.
        // Works with both ShaderMaterial (uOpacity/opacity uniform) and standard materials.
        if (blended.meshOpacity !== undefined && blended.meshOpacity < 1.0) {
            const mesh = this.renderer?.coreMesh;
            if (mesh?.material) {
                // ShaderMaterial - check for uOpacity or opacity uniform
                if (mesh.material.uniforms?.uOpacity) {
                    mesh.material.uniforms.uOpacity.value = blended.meshOpacity;
                } else if (mesh.material.uniforms?.opacity) {
                    // MaterialFactory creates materials with 'opacity' uniform
                    mesh.material.uniforms.opacity.value = blended.meshOpacity;
                }
                // Standard materials use opacity property
                else if (mesh.material.opacity !== undefined) {
                    if (this._originalMeshOpacity === undefined) {
                        this._originalMeshOpacity = mesh.material.opacity ?? 1.0;
                        this._originalMeshTransparent = mesh.material.transparent ?? false;
                    }
                    mesh.material.transparent = true;
                    mesh.material.opacity = blended.meshOpacity;
                    mesh.material.needsUpdate = true;
                }
            }
        } else if (blended.meshOpacity === undefined || blended.meshOpacity >= 1.0) {
            // Restore full opacity when effect ends
            const mesh = this.renderer?.coreMesh;
            if (mesh?.material) {
                // ShaderMaterial - check for uOpacity or opacity uniform
                if (mesh.material.uniforms?.uOpacity) {
                    mesh.material.uniforms.uOpacity.value = 1.0;
                } else if (mesh.material.uniforms?.opacity) {
                    mesh.material.uniforms.opacity.value = 1.0;
                }
                // Standard materials - restore original
                else if (this._originalMeshOpacity !== undefined) {
                    mesh.material.opacity = this._originalMeshOpacity;
                    mesh.material.transparent = this._originalMeshTransparent;
                    mesh.material.needsUpdate = true;
                    this._originalMeshOpacity = undefined;
                    this._originalMeshTransparent = undefined;
                }
            }
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // OBJECT-SPACE CRACKS - Persistent damage that rotates with mesh
        // ═══════════════════════════════════════════════════════════════════════════
        // Cracks accumulate from multiple impacts and persist until healed.
        // Unlike screen-space CrackLayer, impacts are stored in MESH-LOCAL coordinates
        // so cracks rotate with the model.
        //
        // Transform: Camera-relative (from gesture) → World → Mesh-local

        // Handle new crack impacts
        if (blended.crackTriggers && blended.crackTriggers.length > 0 && this.objectSpaceCrackManager) {
            const cam = this.renderer?.camera;
            const mesh = this.renderer?.coreMesh;

            if (cam && mesh) {
                // Ensure matrices are up to date
                cam.updateMatrixWorld();
                mesh.updateMatrixWorld();

                // Get camera basis vectors
                if (!this._crackCamRight) {
                    this._crackCamRight = new THREE.Vector3();
                    this._crackCamUp = new THREE.Vector3();
                    this._crackCamForward = new THREE.Vector3();
                    this._crackWorldPos = new THREE.Vector3();
                    this._crackWorldDir = new THREE.Vector3();
                    this._crackInvQuat = new THREE.Quaternion();
                }

                cam.getWorldDirection(this._crackCamForward);
                this._crackCamRight.crossVectors(this._crackCamForward, cam.up).normalize();
                this._crackCamUp.crossVectors(this._crackCamRight, this._crackCamForward).normalize();

                // Get inverse mesh rotation for world→local transform
                mesh.getWorldQuaternion(this._crackInvQuat);
                this._crackInvQuat.invert();

                for (const trigger of blended.crackTriggers) {
                    const screenOffset = trigger.screenOffset || [0, 0];
                    const screenDir = trigger.screenDirection || [0, 0];

                    // Impact point should be ON the camera-facing surface of the mesh.
                    // We calculate a point on a sphere of radius ~0.35 (mesh surface)
                    // offset from center by the screen offset values.
                    //
                    // screenOffset: [0,0] = center of mesh facing camera
                    //               [0.1, 0] = slightly right
                    //               [0, 0.1] = slightly up

                    // Start with direction toward camera (this is the front surface)
                    const meshRadius = 0.35;  // Approximate mesh surface radius

                    // Offset from center: tilt the surface point based on screenOffset
                    // Small offsets (0.1) = ~5-10 degree tilt from center
                    const tiltScale = 1.0;  // How much screenOffset affects position
                    this._crackWorldPos.set(0, 0, 0)
                        .addScaledVector(this._crackCamRight, screenOffset[0] * tiltScale)
                        .addScaledVector(this._crackCamUp, screenOffset[1] * tiltScale)
                        .addScaledVector(this._crackCamForward, -1.0);  // Toward camera

                    // Normalize to get direction, then scale to mesh surface
                    this._crackWorldPos.normalize().multiplyScalar(meshRadius);

                    // Transform to mesh-local space (rotation only - mesh is at origin)
                    this._crackWorldPos.applyQuaternion(this._crackInvQuat);

                    // Convert screen direction to world, then to mesh-local
                    // Direction tells us which way cracks spread from the impact
                    this._crackWorldDir.set(0, 0, 0);
                    if (Math.abs(screenDir[0]) > 0.01 || Math.abs(screenDir[1]) > 0.01) {
                        this._crackWorldDir
                            .addScaledVector(this._crackCamRight, screenDir[0])
                            .addScaledVector(this._crackCamUp, screenDir[1])
                            .normalize()
                            .applyQuaternion(this._crackInvQuat);
                    }
                    // Note: zero direction = radial cracks spreading in all directions

                    // Add to manager in mesh-local space
                    this.objectSpaceCrackManager.addImpact({
                        position: this._crackWorldPos.clone(),
                        direction: this._crackWorldDir.clone(),
                        propagation: trigger.propagation || 0.8,
                        amount: trigger.amount || 1.0
                    });
                }
            }
        }

        // Handle heal trigger
        if (blended.crackHealTrigger && this.objectSpaceCrackManager) {
            this.objectSpaceCrackManager.startHealing(blended.crackHealDuration || 1500);
        }

        // Pass through glow settings
        if (blended.crack && blended.crack.glowStrength !== undefined && this.objectSpaceCrackManager) {
            this.objectSpaceCrackManager.glowStrength = blended.crack.glowStrength;
        }

        // Store freeze values for next frame's behavior controller update
        // (Behavior controller runs before blending, so we use previous frame's freeze)
        this._pendingFreezeRotation = blended.freezeRotation || 0;
        this._pendingFreezeWobble = blended.freezeWobble || 0;

        // ═══════════════════════════════════════════════════════════════════════════
        // DEFORMATION - Localized vertex displacement for impact effects
        // ═══════════════════════════════════════════════════════════════════════════
        //
        // Transforms impactPoint from CAMERA-RELATIVE to MESH-LOCAL space.
        // This enables "tidal locking" - the dent always appears on the camera-facing
        // side regardless of mesh rotation.
        //
        // Coordinate transformation:
        // 1. Gesture provides impactPoint in camera-relative coords (X=right, Y=up, Z=toward camera)
        // 2. We convert to WORLD space using camera basis vectors (same as cameraRelativePosition)
        // 3. We convert WORLD to MESH-LOCAL using inverse mesh quaternion (rotation only, not translation)
        //
        // Why quaternion instead of worldToLocal()?
        // - worldToLocal() transforms POINTS (includes translation offset)
        // - We need to transform a DIRECTION (rotation only)
        // - Using inverse quaternion gives us pure rotational transformation
        //
        // See: deformation.js for shader code, oofFactory.js for gesture definitions
        if (blended.deformation && blended.deformation.enabled && this.renderer?.camera && this.renderer?.coreMesh) {
            const d = blended.deformation;
            const ip = d.impactPoint;
            const cam = this.renderer.camera;
            const mesh = this.renderer.coreMesh;

            // Ensure matrices are up to date
            cam.updateMatrixWorld();
            mesh.updateMatrixWorld();

            // Get camera basis vectors (same as used for cameraRelativePosition)
            if (!this._deformCamRight) {
                this._deformCamRight = new THREE.Vector3();
                this._deformCamUp = new THREE.Vector3();
                this._deformCamForward = new THREE.Vector3();
                this._deformWorldDir = new THREE.Vector3();
                this._deformLocalDir = new THREE.Vector3();
                this._deformInverseQuat = new THREE.Quaternion();
            }

            cam.getWorldDirection(this._deformCamForward);
            this._deformCamRight.setFromMatrixColumn(cam.matrixWorld, 0);
            this._deformCamUp.setFromMatrixColumn(cam.matrixWorld, 1);

            // Transform impact DIRECTION from camera-relative to WORLD space
            // Same math as cameraRelativePosition:
            // X (right) -> camera right
            // Y (up) -> camera up
            // Z (toward camera) -> negative camera forward
            this._deformWorldDir.set(
                this._deformCamRight.x * ip[0] + this._deformCamUp.x * ip[1] - this._deformCamForward.x * ip[2],
                this._deformCamRight.y * ip[0] + this._deformCamUp.y * ip[1] - this._deformCamForward.y * ip[2],
                this._deformCamRight.z * ip[0] + this._deformCamUp.z * ip[1] - this._deformCamForward.z * ip[2]
            );

            // Transform DIRECTION from world space to mesh-local space
            // We only want to apply the ROTATION, not translation
            // Get the mesh's world quaternion and invert it
            mesh.getWorldQuaternion(this._deformInverseQuat);
            this._deformInverseQuat.invert();

            // Apply inverse rotation to the world-space direction
            this._deformLocalDir.copy(this._deformWorldDir);
            this._deformLocalDir.applyQuaternion(this._deformInverseQuat);

            this._deformation = {
                ...d,
                impactPoint: [this._deformLocalDir.x, this._deformLocalDir.y, this._deformLocalDir.z]
            };
        } else if (blended.deformation && blended.deformation.enabled) {
            // Fallback if no camera/mesh available - use raw values
            this._deformation = { ...blended.deformation };
        } else {
            this._deformation = blended.deformation || null;
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // SHATTER CHANNEL HANDLING - Geometry fragmentation
        // ═══════════════════════════════════════════════════════════════════════════
        // Transform impact point from camera-relative to mesh-local space (same as deformation)
        // Then trigger the shatter system (if enabled)

        // Skip all shatter handling if shatter system is disabled
        if (this.enableShatter && this.shatterSystem) {
            // Reset the flag when shards are no longer frozen
            if (!this.shatterSystem.isFrozen()) {
                this._frozenShardsMovedThisGesture = false;
            }

            if (blended.shatter && blended.shatter.enabled) {
                const s = blended.shatter;

                // ═══════════════════════════════════════════════════════════════
                // DUAL-MODE HANDLING - Apply behavior to existing frozen shards
                // If shards are frozen and this is a dual-mode gesture, apply behavior directly
                // ═══════════════════════════════════════════════════════════════
                if (s.isDualMode && this.shatterSystem.isFrozen()) {
                // Apply dual-mode behavior to existing frozen shards
                    this.shatterSystem.triggerDualMode(s.dualModeType, s.dualModeConfig || {});
                }
                // ═══════════════════════════════════════════════════════════════
                // SHATTER REFORM ON FROZEN SHARDS - Trigger reassembly
                // ═══════════════════════════════════════════════════════════════
                else if (s.variant === 'reform' && this.shatterSystem.isFrozen()) {
                // Reform on frozen shards = reassemble them
                    this.shatterSystem.triggerReassembly(s.reassembleDuration || 1500);
                }
                // ═══════════════════════════════════════════════════════════════
                // ALL OTHER SHATTER GESTURES WHEN FROZEN - Move shards in impact direction
                // Shatter/punch/crumble/etc on frozen shards = scatter them
                // ═══════════════════════════════════════════════════════════════
                else if (!s.isDualMode && this.shatterSystem.isFrozen() && !this._frozenShardsMovedThisGesture) {
                // Move frozen shards in the gesture's impact direction
                    const moveDir = s.impactDirection || [0, 0, -1];
                    // Use different force based on gesture type
                    const force = s.variant?.startsWith('punch') ? 3.5 :
                        s.variant === 'explosive' ? 4.0 :
                            s.variant === 'crumble' ? 1.5 : 2.5;
                    this.shatterSystem.moveFrozenShards(moveDir, force);
                    this._frozenShardsMovedThisGesture = true;
                }
                // ═══════════════════════════════════════════════════════════════
                // NORMAL SHATTER - From IDLE state
                // ═══════════════════════════════════════════════════════════════
                else if (this.shatterSystem.isIdle()) {
                // ═══════════════════════════════════════════════════════════════
                // DEBUG LOGGING - Core3DManager shatter config
                // ═══════════════════════════════════════════════════════════════
                    console.log('[CORE_3D] 🎭 Shatter triggered with config:', {
                        variant: s.variant,
                        elemental: s.elemental,
                        elementalParam: s.elementalParam,
                        overlay: s.overlay,
                        overlayParam: s.overlayParam,
                        intensity: s.intensity,
                        isDualMode: s.isDualMode,
                        dualModeType: s.dualModeType,
                        fullShatterConfig: s
                    });

                    const ip = s.impactPoint || [0, 0, 0.4];

                    // Transform impact point from camera-relative to world space
                    let impactPoint = new THREE.Vector3(ip[0], ip[1], ip[2]);

                    if (this.renderer?.camera && this.renderer?.coreMesh) {
                        const cam = this.renderer.camera;
                        const mesh = this.renderer.coreMesh;

                        // Get camera basis vectors
                        const camRight = new THREE.Vector3();
                        const camUp = new THREE.Vector3();
                        const camForward = new THREE.Vector3();
                        cam.getWorldDirection(camForward);
                        camRight.crossVectors(cam.up, camForward).normalize();
                        camUp.crossVectors(camForward, camRight).normalize();

                        // Transform to world space
                        impactPoint = new THREE.Vector3()
                            .addScaledVector(camRight, ip[0])
                            .addScaledVector(camUp, ip[1])
                            .addScaledVector(camForward, -ip[2]); // Z toward camera = -forward

                        // Add mesh position
                        impactPoint.add(mesh.position);

                        // Set targets for the shatter system
                        // CrystalSoul exposes inner mesh via .mesh property
                        const soulMesh = this.crystalSoul?.mesh || null;
                        this.shatterSystem.setTargets(mesh, soulMesh);
                    }

                    // Transform impact direction the same way as impact point
                    const id = s.impactDirection || [0, 0, -1];
                    let impactDirection = new THREE.Vector3(id[0], id[1], id[2]);

                    if (this.renderer?.camera) {
                        const cam = this.renderer.camera;

                        // Get camera basis vectors
                        const camRight = new THREE.Vector3();
                        const camUp = new THREE.Vector3();
                        const camForward = new THREE.Vector3();
                        cam.getWorldDirection(camForward);
                        camRight.crossVectors(cam.up, camForward).normalize();
                        camUp.crossVectors(camForward, camRight).normalize();

                        // Transform direction to world space
                        impactDirection = new THREE.Vector3()
                            .addScaledVector(camRight, id[0])
                            .addScaledVector(camUp, id[1])
                            .addScaledVector(camForward, -id[2])
                            .normalize();
                    }

                    // Trigger shatter
                    this.shatterSystem.shatter(this.renderer.coreMesh, {
                        impactPoint,
                        impactDirection,
                        intensity: s.intensity || 1.0,
                        revealInner: s.revealSoul !== false, // Controlled per-variant
                        // Suspend mode: explode, freeze mid-air, then reassemble
                        isSuspendMode: s.isSuspendMode || false,
                        suspendAt: s.suspendAt || 0.25,
                        suspendDuration: s.suspendDuration || 0.35,
                        // Freeze mode: explode, freeze indefinitely (manual reassembly via API)
                        isFreezeMode: s.isFreezeMode || false,
                        // Dual-mode: behavior to apply after shatter completes initial phase
                        isDualMode: s.isDualMode || false,
                        dualModeType: s.dualModeType,
                        dualModeConfig: s.dualModeConfig || {},
                        // Physics overrides (for crumble, etc.)
                        gravity: s.gravity,           // undefined = use default
                        explosionForce: s.explosionForce,
                        rotationForce: s.rotationForce,
                        // Gesture duration for suspend timing calculation
                        gestureDuration: s.gestureDuration,
                        // ═══════════════════════════════════════════════════════════════
                        // ELEMENTAL MATERIAL SYSTEM
                        // Replaces shard material with elemental material (fire, water, etc.)
                        // ═══════════════════════════════════════════════════════════════
                        elemental: s.elemental || null,
                        elementalParam: s.elementalParam ?? 0.5,
                        overlay: s.overlay || null,
                        overlayParam: s.overlayParam ?? 0.5
                    });

                    // Clear all cracks when shattering (geometry is destroyed)
                    if (this.objectSpaceCrackManager) {
                        this.objectSpaceCrackManager.clearAll();
                    }
                    if (this.renderer.crackLayer) {
                        this.renderer.crackLayer.clearAll();
                    }
                }
            }

            // Handle reassembly trigger from gesture
            if (blended.shatter && blended.shatter.reassemble && this.shatterSystem.isShattering()) {
                this.shatterSystem.reassemble({
                    duration: blended.shatter.reassembleDuration || 1000
                });
            }

            // Update shatter system only when actively shattering or reassembling
            if (this.shatterSystem.isShattering() || this.shatterSystem.isReassembling()) {
                this.shatterSystem.update(deltaTime);
            }
        } // end if (this.enableShatter && this.shatterSystem)

        // Update element spawner (ice crystals, rocks, etc.)
        profiler.start('elementSpawner');
        if (this.elementSpawner) {
            // Pass gesture progress for element animations (fire temperature, water flow, etc.)
            // Use first available progress from any active elemental effect
            const gestureProgress = this._currentFireProgress
                ?? this._currentWaterProgress
                ?? this._currentIceProgress
                ?? this._currentElectricProgress
                ?? this._currentVoidProgress
                ?? this._currentLightProgress
                ?? this._currentEarthProgress
                ?? this._currentNatureProgress
                ?? null;
            this.elementSpawner.update(deltaTime / 1000, gestureProgress);  // Convert ms to seconds
        }
        profiler.end('elementSpawner');

        // ═══════════════════════════════════════════════════════════════════════════
        // MOTION DEBUG LOGGING - Track all sources of movement
        // Only logs when debugMotionLogging is enabled (e.g., when LLM interpreter is active)
        // ═══════════════════════════════════════════════════════════════════════════
        if (this.debugMotionLogging) {
            if (!this._motionLogInterval) this._motionLogInterval = 0;
            this._motionLogInterval += deltaTime;
            if (this._motionLogInterval >= 200) { // Log every 200ms
                this._motionLogInterval = 0;

                const hasGestures = blended.hasAbsoluteGestures || blended.hasAccentGestures;
                const gesturePos = blended.position;
                const gestureRot = blended.rotation;
                const gestureScale = blended.scale;

                // Only log when something interesting is happening
                const significantMotion =
                    Math.abs(gesturePos[0]) > 0.001 || Math.abs(gesturePos[1]) > 0.001 || Math.abs(gesturePos[2]) > 0.001 ||
                    Math.abs(gestureRot[0]) > 0.001 || Math.abs(gestureRot[1]) > 0.001 || Math.abs(gestureRot[2]) > 0.001 ||
                    Math.abs(gestureScale - 1.0) > 0.001 ||
                    (rhythmMod && (Math.abs(rhythmMod.grooveOffset[1]) > 0.001 || Math.abs(rhythmMod.grooveScale - 1.0) > 0.001));

                if (significantMotion || hasGestures) {
                    console.log('[Motion] ═══════════════════════════════════════');
                    console.log(`[Motion] GESTURE: pos=[${gesturePos.map(p => p.toFixed(3)).join(', ')}] rot=[${gestureRot.map(r => (r * 180 / Math.PI).toFixed(1)).join(', ')}°] scale=${gestureScale.toFixed(3)} hasAbs=${hasAbsolute}`);

                    if (rhythmMod) {
                        console.log(`[Motion] GROOVE: offset=[${rhythmMod.grooveOffset.map(o => o.toFixed(3)).join(', ')}] rot=[${rhythmMod.grooveRotation.map(r => (r * 180 / Math.PI).toFixed(1)).join(', ')}°] scale=${rhythmMod.grooveScale.toFixed(3)} blend=${grooveBlend.toFixed(2)}`);
                    }

                    console.log(`[Motion] BOOST: pos=[${posBoost.map(p => p.toFixed(3)).join(', ')}] rot=[${rotBoost.map(r => (r * 180 / Math.PI).toFixed(1)).join(', ')}°] scale=${scaleBoost.toFixed(3)}`);
                    console.log(`[Motion] FINAL: pos=[${this.position.map(p => p.toFixed(3)).join(', ')}] rot=[${this.rotation.map(r => (r * 180 / Math.PI).toFixed(1)).join(', ')}°] scale=${this.scale.toFixed(3)}`);
                }
            }
        }

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
        const scaleMultipliers = morphScale * breathScale * blinkScale * crystalShellScale;
        const finalScale = this.scale * scaleMultipliers;

        // Calculate final non-uniform scale (for squash/stretch effects)
        // Applies same multipliers to each axis of the non-uniform scale
        const finalNonUniformScale = this.nonUniformScale ? [
            this.nonUniformScale[0] * scaleMultipliers,
            this.nonUniformScale[1] * scaleMultipliers,
            this.nonUniformScale[2] * scaleMultipliers
        ] : null;

        // ═══════════════════════════════════════════════════════════════════════════
        // PARTICLE SYSTEM UPDATE & RENDERING (Orchestrated)
        // ═══════════════════════════════════════════════════════════════════════════
        // Only check particleVisibility (runtime toggle), not particlesEnabled (initial config)
        profiler.start('particleOrchestrator');
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
                this.animationManager.getActiveAnimations(), // Active gestures
                this.animationManager.getTime(),             // Current animation time
                { x: this.position[0], y: this.position[1], z: this.position[2] }, // Core position
                { width: this.canvas.width, height: this.canvas.height }, // Canvas size
                // Rotation state for orbital physics
                {
                    euler: this.baseEuler,
                    quaternion: this.baseQuaternion,
                    angularVelocity: this.behaviorController.getAngularVelocity()
                },
                this.baseScale, // Pass base scale only (shader handles perspective)
                coreRadius3D    // Pass actual 3D core radius for particle orbit distance
            );
        }
        profiler.end('particleOrchestrator');

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

        // Update element material bloom thresholds to match mascot's bloom settings
        // This prevents water/fire etc from blowing out on low-threshold geometries (crystal/heart)
        if (this.elementSpawner) {
            let elementBloomThreshold = 0.85;  // Default for moon/star/sphere
            if (this.geometryType === 'sun') {
                elementBloomThreshold = 0.3;
            } else if (this.geometryType === 'crystal' || this.geometryType === 'rough' || this.geometryType === 'heart') {
                elementBloomThreshold = 0.35;
            }
            this.elementSpawner.setElementBloomThreshold('water', elementBloomThreshold);
            this.elementSpawner.setElementBloomThreshold('ice', elementBloomThreshold);
            this.elementSpawner.setElementBloomThreshold('electricity', elementBloomThreshold);
            this.elementSpawner.setElementBloomThreshold('earth', elementBloomThreshold);
        }

        // Update isolated glow layer for gesture effects (glow/flash)
        // This is a separate screen-space effect that doesn't affect baseline appearance
        if (this.glowBoost > 0 || (this.renderer.glowLayer && this.renderer.glowLayer.isActive())) {
            // Get world position of core mesh for glow center
            const worldPosition = this.coreMesh?.position;
            this.renderer.updateGlowLayer(this.glowBoost, this.glowColor, worldPosition, deltaTime);
        }

        // Update object-space crack manager (persistent damage in material)
        // This is rendered IN the material shader and rotates with the mesh
        if (this.objectSpaceCrackManager) {
            this.objectSpaceCrackManager.update(deltaTime);
            // Apply crack uniforms to material if it's a crystal-type shader
            if (this.customMaterial?.uniforms) {
                this.objectSpaceCrackManager.applyToMaterial(this.customMaterial);
            }
        }

        // Legacy: Update screen-space crack layer (kept for backward compatibility)
        // This is a universal post-process effect but cracks don't rotate with mesh
        if (this.renderer.crackLayer && this.renderer.crackLayer.isActive()) {
            this.renderer.updateCrackLayer(null, deltaTime);
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

                // Smooth color transition between emotions
                // Lerp from start color to target over ~500ms (configurable via colorTransitionDuration)
                if (this._targetGlowColor && this._colorTransitionProgress < 1) {
                    const transitionDuration = this.colorTransitionDuration || 500; // ms
                    this._colorTransitionProgress += deltaTime / transitionDuration;
                    this._colorTransitionProgress = Math.min(this._colorTransitionProgress, 1);

                    // Ease-out curve for smooth deceleration
                    const t = 1 - Math.pow(1 - this._colorTransitionProgress, 2);

                    // Lerp each channel
                    const start = this._colorTransitionStart || this._normalizedGlowColor || [1, 1, 1];
                    const target = this._targetGlowColor;
                    this._normalizedGlowColor = [
                        start[0] + (target[0] - start[0]) * t,
                        start[1] + (target[1] - start[1]) * t,
                        start[2] + (target[2] - start[2]) * t
                    ];
                }

                // Smooth SSS preset transition
                // Lerp SSS uniforms from current to target over configurable duration
                if (this._targetSSSValues && this._sssTransitionProgress < 1) {
                    const sssTransitionDuration = this.sssTransitionDuration || 500; // ms
                    this._sssTransitionProgress += deltaTime / sssTransitionDuration;
                    this._sssTransitionProgress = Math.min(this._sssTransitionProgress, 1);

                    // Ease-out curve for smooth deceleration
                    const sssT = 1 - Math.pow(1 - this._sssTransitionProgress, 2);

                    const u = this.customMaterial.uniforms;
                    const start = this._sssTransitionStart;
                    const target = this._targetSSSValues;

                    // Lerp scalar values
                    if (u.sssStrength && start.sssStrength !== undefined) {
                        u.sssStrength.value = start.sssStrength + (target.sssStrength - start.sssStrength) * sssT;
                    }
                    if (u.sssThicknessBias && start.sssThicknessBias !== undefined) {
                        u.sssThicknessBias.value = start.sssThicknessBias + (target.sssThicknessBias - start.sssThicknessBias) * sssT;
                    }
                    if (u.sssThicknessScale && start.sssThicknessScale !== undefined) {
                        u.sssThicknessScale.value = start.sssThicknessScale + (target.sssThicknessScale - start.sssThicknessScale) * sssT;
                    }
                    if (u.sssCurvatureScale && start.sssCurvatureScale !== undefined) {
                        u.sssCurvatureScale.value = start.sssCurvatureScale + (target.sssCurvatureScale - start.sssCurvatureScale) * sssT;
                    }
                    if (u.sssAmbient && start.sssAmbient !== undefined) {
                        u.sssAmbient.value = start.sssAmbient + (target.sssAmbient - start.sssAmbient) * sssT;
                    }
                    if (u.frostiness && start.frostiness !== undefined) {
                        u.frostiness.value = start.frostiness + (target.frostiness - start.frostiness) * sssT;
                    }
                    if (u.innerGlowStrength && start.innerGlowStrength !== undefined) {
                        u.innerGlowStrength.value = start.innerGlowStrength + (target.innerGlowStrength - start.innerGlowStrength) * sssT;
                    }
                    if (u.fresnelIntensity && start.fresnelIntensity !== undefined) {
                        u.fresnelIntensity.value = start.fresnelIntensity + (target.fresnelIntensity - start.fresnelIntensity) * sssT;
                    }
                    if (u.causticIntensity && start.causticIntensity !== undefined) {
                        u.causticIntensity.value = start.causticIntensity + (target.causticIntensity - start.causticIntensity) * sssT;
                    }
                    if (u.emotionColorBleed && start.emotionColorBleed !== undefined) {
                        u.emotionColorBleed.value = start.emotionColorBleed + (target.emotionColorBleed - start.emotionColorBleed) * sssT;
                    }

                    // Lerp vector values (absorption, scatter distance)
                    if (u.sssAbsorption && start.sssAbsorption) {
                        u.sssAbsorption.value.set(
                            start.sssAbsorption[0] + (target.sssAbsorption[0] - start.sssAbsorption[0]) * sssT,
                            start.sssAbsorption[1] + (target.sssAbsorption[1] - start.sssAbsorption[1]) * sssT,
                            start.sssAbsorption[2] + (target.sssAbsorption[2] - start.sssAbsorption[2]) * sssT
                        );
                    }
                    if (u.sssScatterDistance && start.sssScatterDistance) {
                        u.sssScatterDistance.value.set(
                            start.sssScatterDistance[0] + (target.sssScatterDistance[0] - start.sssScatterDistance[0]) * sssT,
                            start.sssScatterDistance[1] + (target.sssScatterDistance[1] - start.sssScatterDistance[1]) * sssT,
                            start.sssScatterDistance[2] + (target.sssScatterDistance[2] - start.sssScatterDistance[2]) * sssT
                        );
                    }
                }

                // Use current (lerped) normalized color
                // This ensures yellow (joy) doesn't wash out the soul while blue (sadness) stays visible
                const normalizedColor = this._normalizedGlowColor || [1, 1, 1];

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
            // Update inner core color and animation (also use cached normalized color)
            // Only update if core glow is enabled AND shatter system isn't managing the soul
            // During shatter/frozen/reassembly, ShatterSystem controls the soul's scale and uniforms
            const shatterManagingSoul = this.shatterSystem && !this.shatterSystem.isIdle();
            if (this.coreGlowEnabled && !shatterManagingSoul) {
                const normalizedCoreColor = this._normalizedGlowColor || [1, 1, 1];
                this.updateCrystalInnerCore(normalizedCoreColor, deltaTime);
            }
        }

        // Skip render for multiple frames after morph swap
        // This prevents Three.js from iterating the scene while it's stabilizing
        // The mascot is at scale ~0 during swap anyway, so skipping a few frames is invisible
        if (this._skipRenderFrames > 0) {
            this._skipRenderFrames--;
            return;
        }

        // Render with Three.js
        profiler.start('threeRenderer');
        this.renderer.render({
            position: this.position,
            rotation: this.rotation,
            scale: finalScale,
            nonUniformScale: finalNonUniformScale,  // [x, y, z] for squash/stretch, null for uniform
            glowColor: this.glowColor,
            glowColorHex: this.glowColorHex,  // For bloom luminance normalization
            glowIntensity: effectiveGlowIntensity,
            hasActiveGesture: this.animationManager.hasActiveAnimations(),  // Faster lerp during gestures
            calibrationRotation: this.calibrationRotation,  // Applied on top of animated rotation
            cameraRoll: this._cameraRoll || 0,  // Camera-relative roll for tidal-locked lean gestures
            solarEclipse: this.effectManager.getSolarEclipse(),  // Pass eclipse manager for synchronized updates
            deltaTime,  // Pass deltaTime for eclipse animation
            morphProgress: morphState.isTransitioning ? morphState.visualProgress : null,  // For corona fade-in
            // OPTIMIZATION FLAGS: Skip render passes when not needed
            hasSoul: this.customMaterialType === 'crystal' && this.crystalSoul !== null,
            // PERFORMANCE: Only run particle bloom if there are actual visible particles
            // This skips 13+ render passes when particles are enabled but idle
            hasParticles: this.particleVisibility && this.particleOrchestrator !== null &&
                this.particleOrchestrator.getParticleCount() > 0,
            // Shader-based localized vertex deformation for impacts
            deformation: this._deformation
        });
        profiler.end('threeRenderer');

        // Update lunar eclipse animation (Blood Moon)
        this.effectManager.updateLunarEclipse(deltaTime);

        profiler.endFrame();
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

            // Initialize ElementSpawner now that coreMesh exists
            // NOTE: Models are NOT preloaded here - they load lazily on first spawn
            // This prevents GPU overhead for demos that don't use elemental gestures
            if (this.elementSpawner && this.renderer?.coreMesh && !this.elementSpawner.coreMesh) {
                this.elementSpawner.initialize(this.renderer.coreMesh, this.renderer.camera);
            }

            // NOW we're fully ready for rendering
            this._logSceneHierarchy();
            this._ready = true;

            // Start element preloading (after ready, so it doesn't block initialization)
            this._startElementPreloading();
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
            console.warn(`  [${i}] ${child?.name || child?.type || 'UNKNOWN'} status=${status} uuid=${child?.uuid?.slice(0,8) || 'N/A'}`);
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
        await CrystalSoul._loadInclusionGeometry(this.assetBasePath);

        // Check if destroyed during async load
        if (this._destroyed || !this.coreMesh) {
            return;
        }

        // Create new soul - geometry is already cached so it will be used immediately
        this.crystalSoul = new CrystalSoul({
            radius: 0.35,
            detail: 1,
            geometryType: this.geometryType,
            renderer: this.renderer,
            assetBasePath: this.assetBasePath
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
     * Handle WebGL context restoration by recreating custom materials and textures
     * Called by ThreeRenderer when the browser restores the WebGL context
     * @private
     */
    async _handleContextRestored() {

        if (this._destroyed || !this.coreMesh) {
            return;
        }

        // Recreate custom material with textures (crystal, moon, sun)
        if (this.customMaterialType) {
            const emotionData = getEmotion(this.emotion);
            const materialResult = createCustomMaterial(this.geometryType, this.geometryConfig, {
                glowColor: this.glowColor || [1.0, 1.0, 0.95],
                glowIntensity: this.glowIntensity || 1.0,
                materialVariant: this.materialVariant,
                emotionData,
                assetBasePath: this.assetBasePath
            });

            if (materialResult) {
                // Dispose old material
                if (this.customMaterial) {
                    disposeCustomMaterial(this.customMaterial);
                }

                // Apply new material
                this.customMaterial = materialResult.material;
                this.coreMesh.material = this.customMaterial;

                // Recreate crystal soul if needed
                if (this.customMaterialType === 'crystal' && this.crystalSoul) {
                    await this._createCrystalInnerCoreAsync();
                }

                // Notify external listeners (e.g., demos applying SSS presets)
                if (this.onMaterialSwap) {
                    this.onMaterialSwap();
                }
            }
        }
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

    // ═══════════════════════════════════════════════════════════════════════════
    // ELEMENT PRELOADING - Opt-in and background pre-warm
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Start element preloading based on configuration
     * @private
     */
    _startElementPreloading() {
        if (this._destroyed || !this.elementSpawner) return;

        // Option 2: Immediate preload of specified elements
        if (this._preloadElements.length > 0) {
            console.log(`[Core3D] Preloading specified elements: ${this._preloadElements.join(', ')}`);
            this._preloadElements.forEach(type => {
                if (ALL_ELEMENT_TYPES.includes(type)) {
                    this.elementSpawner.preloadModels(type);
                }
            });
        }

        // Option 3: Background pre-warm after delay
        if (this._backgroundPrewarm) {
            this._prewarmTimeoutId = setTimeout(() => {
                this._backgroundPrewarmElements();
            }, BACKGROUND_PREWARM_DELAY);
        }
    }

    /**
     * Background pre-warm: load remaining element types that weren't explicitly preloaded
     * @private
     */
    async _backgroundPrewarmElements() {
        if (this._destroyed || !this.elementSpawner) return;

        // Find elements that haven't been preloaded yet
        const alreadyLoaded = new Set(this._preloadElements);
        const toPrewarm = ALL_ELEMENT_TYPES.filter(type => !alreadyLoaded.has(type));

        if (toPrewarm.length === 0) return;

        console.log(`[Core3D] Background pre-warming elements: ${toPrewarm.join(', ')}`);

        // Load one at a time with small delays to avoid blocking the main thread
        for (const type of toPrewarm) {
            if (this._destroyed) break;

            // Small delay between loads to keep UI responsive
            await new Promise(resolve => setTimeout(resolve, 100));

            if (this._destroyed) break;
            this.elementSpawner.preloadModels(type);
        }
    }

    /**
     * Cancel any pending background pre-warm
     * @private
     */
    _cancelPrewarm() {
        if (this._prewarmTimeoutId) {
            clearTimeout(this._prewarmTimeoutId);
            this._prewarmTimeoutId = null;
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        // Set destroyed flag first to prevent any pending render calls
        this._destroyed = true;

        // Cancel any pending background pre-warm
        this._cancelPrewarm();

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

        // Clean up shatter system
        if (this.shatterSystem) {
            this.shatterSystem.dispose();
            this.shatterSystem = null;
        }

        // Clean up smoke particle system
        if (this._smokeParticleSystem) {
            this._smokeParticleSystem.dispose();
            this._smokeParticleSystem = null;
        }

        // Clean up object-space crack manager
        if (this.objectSpaceCrackManager) {
            this.objectSpaceCrackManager.dispose();
            this.objectSpaceCrackManager = null;
        }

        // Clean up element spawner
        if (this.elementSpawner) {
            this.elementSpawner.dispose();
            this.elementSpawner = null;
        }

        // Clean up effect manager (handles eclipse and crystal soul disposal)
        // Note: EffectManager.dispose() removes eclipse meshes from scene internally
        if (this.effectManager) {
            this.effectManager.dispose();
            this.effectManager = null;
        }

        // Clean up behavior controller
        if (this.behaviorController) {
            this.behaviorController.dispose();
            this.behaviorController = null;
        }

        // Clean up breathing phase manager
        if (this.breathingPhaseManager) {
            this.breathingPhaseManager.dispose();
            this.breathingPhaseManager = null;
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
        this.animationManager.stopAll();

        // Destroy renderer LAST (after all scene children are cleaned up)
        this.renderer.destroy();

        // Clean up animation manager (includes virtual particle pool)
        this.animationManager.dispose();
        this.animationManager = null;

        // Clean up animator sub-components
        this.animator.destroy?.();
        this.breathingAnimator.destroy?.();
        this.gestureBlender.destroy?.();
        this.geometryMorpher.destroy?.();
        this.blinkAnimator.destroy?.();

        // Clean up behavior controller (disposes all behavior objects)
        this.behaviorController.dispose();
        this.behaviorController = null;

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
     * Map emotion to appropriate groove preset
     * Energetic emotions use bounce groove, calm emotions use subtle groove,
     * flowing/zen emotions use the flowing zen groove
     * @private
     * @param {string} emotion - Emotion name
     * @returns {string} Groove preset name
     */
    _getEmotionGroove(emotion) {
        const emotionGrooveMap = {
            // Energetic emotions → groove2 (bouncy, energetic)
            happy: 'groove2',
            excited: 'groove2',
            amused: 'groove2',
            silly: 'groove2',
            surprised: 'groove2',

            // Calm/subtle emotions → groove1 (subtle, elegant)
            calm: 'groove1',
            neutral: 'groove1',
            sad: 'groove1',
            content: 'groove1',
            focused: 'groove1',
            bored: 'groove1',
            tired: 'groove1',
            sleepy: 'groove1',

            // Flowing/zen emotions → groove3 (flowing, zen)
            zen: 'groove3',
            love: 'groove3',
            grateful: 'groove3',
            inspired: 'groove3',
            hopeful: 'groove3',
            proud: 'groove3',

            // Intense emotions → groove2 with strong beats
            angry: 'groove2',
            anxious: 'groove2',
            determined: 'groove2'
        };

        return emotionGrooveMap[emotion] || 'groove1';
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
