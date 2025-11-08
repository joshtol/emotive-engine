/**
 * Core3DManager - Main orchestrator for Three.js 3D rendering
 *
 * Manages:
 * - Three.js renderer
 * - 3D geometry selection
 * - Animation playback
 * - Emotion-based lighting and materials
 */

import * as THREE from 'three';
import { ThreeRenderer } from './ThreeRenderer.js';
import { THREE_GEOMETRIES } from './geometries/ThreeGeometries.js';
import { ProceduralAnimator } from './animation/ProceduralAnimator.js';
import { BreathingAnimator } from './animation/BreathingAnimator.js';
import { GestureBlender } from './animation/GestureBlender.js';
import { BlinkAnimator } from './animation/BlinkAnimator.js';
import { GeometryMorpher } from './utils/GeometryMorpher.js';
import RotationBehavior from './behaviors/RotationBehavior.js';
import RightingBehavior from './behaviors/RightingBehavior.js';
import { getEmotion } from '../core/emotions/index.js';
import { getGesture } from '../core/gestures/index.js';
import { getUndertoneModifier } from '../config/undertoneModifiers.js';
import { hexToRGB, rgbToHsl, hslToRgb, applyUndertoneSaturation } from './utils/ColorUtilities.js';
import { getGlowIntensityForColor } from '../utils/glowIntensityFilter.js';
import ParticleSystem from '../core/ParticleSystem.js';
import { Particle3DTranslator } from './particles/Particle3DTranslator.js';
import { Particle3DRenderer } from './particles/Particle3DRenderer.js';
import { Particle3DOrchestrator } from './particles/Particle3DOrchestrator.js';
import { createMoonMaterial, createMoonShadowMaterial, createMoonFallbackMaterial, updateMoonGlow } from './geometries/Moon.js';

export class Core3DManager {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.options = options;

        // Initialize Three.js renderer
        this.renderer = new ThreeRenderer(canvas, {
            enablePostProcessing: options.enablePostProcessing !== false,
            enableShadows: options.enableShadows || false,
            enableControls: options.enableControls !== false, // Camera controls (mouse/touch)
            autoRotate: options.autoRotate !== false // Auto-rotate enabled by default
        });

        // Load geometry
        this.geometryType = options.geometry || 'sphere';
        const geometryConfig = THREE_GEOMETRIES[this.geometryType];

        if (!geometryConfig) {
            console.warn(`Unknown geometry: ${this.geometryType}, falling back to sphere`);
            this.geometryConfig = THREE_GEOMETRIES.sphere;
        } else {
            this.geometryConfig = geometryConfig;
        }

        this.geometry = this.geometryConfig.geometry;

        // Check if this geometry requires custom material (e.g., moon with textures)
        let customMaterial = null;
        if (this.geometryConfig.material === 'custom') {
            // Handle custom materials based on geometry type
            if (this.geometryType === 'moon') {
                // Create texture loader
                const textureLoader = new THREE.TextureLoader();

                // Detect device for resolution selection (4K desktop, 2K mobile)
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                const resolution = isMobile ? '2k' : '4k';

                console.log(`🌙 Loading moon textures with ORIGINAL shader (${resolution})...`);

                // Use crescent shader with ORIGINAL working logic
                customMaterial = createMoonShadowMaterial(textureLoader, {
                    resolution,
                    glowColor: new THREE.Color(0xffffff),
                    glowIntensity: 1.0,
                    shadowOffsetX: 0.7,  // Offset to the right
                    shadowOffsetY: 0.0,
                    shadowCoverage: 1.0  // Not used for now - hardcoded in shader
                });

                // Store material reference for glow updates
                this.customMaterial = customMaterial;
                this.customMaterialType = 'moon';
            }
        }

        // Create core mesh with geometry (and optional custom material)
        this.coreMesh = this.renderer.createCoreMesh(this.geometry, customMaterial);

        // Calibration rotation offset (applied on top of all animations)
        // Used for moon orientation calibration
        this.calibrationRotation = [0, 0, 0]; // [X, Y, Z] in radians

        // Camera-space roll: rotates the tidally-locked face around camera's viewing axis
        // Applied AFTER all world-space rotations, spins the face like a wheel
        this.cameraRoll = 0; // in radians

        // Set initial calibration rotation for moon to show classic Earth-facing side
        // This shows the "Man in the Moon" view with Mare Imbrium upper-right
        // Calibrated manually: X=55.5°, Y=-85.0°, Z=-60.5° (quaternion-based rotation)
        if (this.geometryType === 'moon') {
            this.calibrationRotation = [
                55.5 * Math.PI / 180,    // X: world-space rotation
                -85.0 * Math.PI / 180,   // Y: world-space rotation
                -60.5 * Math.PI / 180    // Z: camera-space roll (spins face CW/CCW)
            ];
            this.cameraRoll = 0; // Camera-space roll (spin the face)
            console.log('🌙 Moon calibration rotation set: X=55.5°, Y=-85.0°, Z=-60.5°');
        }

        // Animation controller
        this.animator = new ProceduralAnimator();

        // Breathing animator
        this.breathingAnimator = new BreathingAnimator();

        // Gesture blender
        this.gestureBlender = new GestureBlender();

        // Geometry morpher for smooth shape transitions
        this.geometryMorpher = new GeometryMorpher();

        // Blink animator (emotion-aware)
        this.blinkAnimator = new BlinkAnimator(this.geometryConfig);
        this.blinkAnimator.setEmotion(this.emotion);

        // Rotation behavior system
        this.rotationBehavior = null; // Will be initialized in setEmotion

        // Righting behavior (self-stabilization like inflatable punching clowns)
        // Tuned for smooth return to upright without oscillation
        this.rightingBehavior = new RightingBehavior({
            strength: 5.0,              // Strong righting without overdoing it (was 50.0)
            damping: 0.85,              // Critically damped for smooth return (was 0.99)
            centerOfMass: [0, -0.3, 0], // Bottom-heavy
            axes: { pitch: true, roll: true, yaw: false }
        });

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

        // ═══════════════════════════════════════════════════════════════════════════
        // PARTICLE SYSTEM INTEGRATION
        // ═══════════════════════════════════════════════════════════════════════════

        // Enable/disable particles
        this.particlesEnabled = options.enableParticles !== false;

        if (this.particlesEnabled) {
            // Create 2D particle system (reuse existing logic)
            const particleSystem = new ParticleSystem(50); // 50 particles max

            // Set canvas size for particle spawning
            particleSystem.canvasWidth = canvas.width;
            particleSystem.canvasHeight = canvas.height;

            // Create 3D translator (converts 2D → 3D)
            const particleTranslator = new Particle3DTranslator({
                worldScale: 2.0,
                baseRadius: 1.5,
                depthScale: 0.75,
                verticalScale: 1.0
            });

            // Create 3D renderer (Three.js points system)
            const particleRenderer = new Particle3DRenderer(50);

            // Add particle points to scene
            this.renderer.scene.add(particleRenderer.getPoints());

            // Create orchestrator (coordinates everything)
            this.particleOrchestrator = new Particle3DOrchestrator(
                particleSystem,
                particleTranslator,
                particleRenderer
            );
        }

        // Initialize emotion
        this.setEmotion(this.emotion);
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

            // Update custom material (moon) with emotion glow color
            if (this.customMaterial && this.customMaterialType === 'moon') {
                const glowColorThree = new THREE.Color(this.glowColor[0], this.glowColor[1], this.glowColor[2]);
                updateMoonGlow(this.customMaterial, glowColorThree, this.glowIntensity);
            }

            // Note: Bloom is updated every frame in render() for smooth transitions
        }

        // Initialize or update rotation behavior from 3d config
        // EXCEPTION: Moon is tidally locked - no rotation behavior
        if (this.geometryType === 'moon') {
            this.rotationBehavior = null; // Disable rotation for moon (tidally locked)
        } else if (emotionData && emotionData['3d'] && emotionData['3d'].rotation) {
            if (this.rotationBehavior) {
                // Update existing behavior
                this.rotationBehavior.updateConfig(emotionData['3d'].rotation);
            } else {
                // Create new rotation behavior
                this.rotationBehavior = new RotationBehavior(
                    emotionData['3d'].rotation,
                    this.rhythmEngine
                );
            }
        } else {
            // Fall back to default gentle rotation if no 3d config
            if (!this.rotationBehavior) {
                this.rotationBehavior = new RotationBehavior(
                    { type: 'gentle', speed: 1.0, axes: [0, 0.01, 0] },
                    this.rhythmEngine
                );
            }
        }

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

        console.log(`🎨 ${emotion.toUpperCase()} base intensity: ${this.baseGlowIntensity.toFixed(3)} (color: ${glowColor}, mode: ${materialMode})`);

        // Apply undertone glow multiplier to base intensity
        if (undertoneModifier && undertoneModifier['3d'] && undertoneModifier['3d'].glow) {
            const beforeUndertone = this.baseGlowIntensity;
            this.baseGlowIntensity *= undertoneModifier['3d'].glow.intensityMultiplier;
            console.log(`   🎭 Undertone ${undertone} multiplier: ${undertoneModifier['3d'].glow.intensityMultiplier.toFixed(3)}, final: ${this.baseGlowIntensity.toFixed(3)}`);
        }

        // Update breathing animator with emotion and undertone
        this.breathingAnimator.setEmotion(emotion, undertoneModifier);

        // Update blink animator with new emotion
        this.blinkAnimator.setEmotion(emotion);

        // Immediately reset bloom to prevent accumulation (fast transition on emotion change)
        this.renderer.updateBloom(this.baseGlowIntensity, 1.0);

        // Trigger emotion animation - now handled by blending system in render()
        this.animator.playEmotion(emotion);

        // ═══════════════════════════════════════════════════════════════════════════
        // UPDATE PARTICLE SYSTEM FOR NEW EMOTION
        // ═══════════════════════════════════════════════════════════════════════════
        if (this.particlesEnabled && this.particleOrchestrator) {
            // Notify orchestrator of emotion change (will recalculate config)
            this.particleOrchestrator.setEmotion(emotion, undertone);
        }
    }

    /**
     * Enable or disable core glow
     * @param {boolean} enabled - True to enable glow, false to disable
     */
    setCoreGlowEnabled(enabled) {
        this.coreGlowEnabled = enabled;
        console.log(`🔦 Core glow toggle: ${enabled ? 'enabled' : 'disabled'}, coreGlowEnabled=${this.coreGlowEnabled}`);
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

        // Create a virtual particle to extract gesture behavior
        const virtualParticle = {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            size: 1,
            baseSize: 1,
            opacity: 1,
            scaleFactor: 1,
            gestureData: null
        };

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
                const result = gesture2D['3d'].evaluate.call(gesture2D, t, motion);
                return result;
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
     * Morph to different shape with smooth transition
     * @param {string} shapeName - Target geometry name
     * @param {number} duration - Transition duration in ms (default: 800ms)
     */
    morphToShape(shapeName, duration = 800) {
        const targetGeometryConfig = THREE_GEOMETRIES[shapeName];
        if (!targetGeometryConfig) {
            console.warn(`Unknown shape: ${shapeName}`);
            return;
        }

        // Start smooth morph transition (like 2D ShapeMorpher)
        const started = this.geometryMorpher.startMorph(
            this.geometryType,
            shapeName,
            duration
        );

        // If morph didn't start (already at target), skip
        if (!started) {
            return;
        }

        // Pause blinks during morph (cleaner visual experience)
        this.blinkAnimator.pause();

        // Store target geometry for when morph completes
        this._targetGeometryConfig = targetGeometryConfig;
        this._targetGeometry = targetGeometryConfig.geometry;
        this._targetGeometryType = shapeName;
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
        // Update animations
        this.animator.update(deltaTime);

        // Update geometry morph animation
        const morphState = this.geometryMorpher.update(deltaTime);

        // Swap geometry at midpoint (when scale is at minimum) for smooth transition
        if (morphState.shouldSwapGeometry && this._targetGeometry) {
            this.geometry = this._targetGeometry;
            this.geometryType = this._targetGeometryType;
            this.geometryConfig = this._targetGeometryConfig;

            // Check if target geometry needs custom material (e.g., moon)
            let customMaterial = null;
            if (this._targetGeometryConfig.material === 'custom') {
                if (this._targetGeometryType === 'moon') {
                    // Create texture loader
                    const textureLoader = new THREE.TextureLoader();

                    // Detect device for resolution selection
                    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                    const resolution = isMobile ? '2k' : '4k';

                    console.log(`🌙 Loading moon textures with ORIGINAL shader on morph (${resolution})...`);

                    // Use crescent shader with ORIGINAL working logic
                    customMaterial = createMoonShadowMaterial(textureLoader, {
                        resolution,
                        glowColor: new THREE.Color(this.glowColor[0], this.glowColor[1], this.glowColor[2]),
                        glowIntensity: this.glowIntensity,
                        shadowOffsetX: 0.7,  // Offset to the right
                        shadowOffsetY: 0.0,
                        shadowCoverage: 1.0  // Not used for now - hardcoded in shader
                    });

                    // Store material reference for glow updates
                    this.customMaterial = customMaterial;
                    this.customMaterialType = 'moon';
                }
            } else {
                // Morphing away from custom material - clear reference
                this.customMaterial = null;
                this.customMaterialType = null;
            }

            // Swap geometry (and material if custom)
            if (customMaterial) {
                this.renderer.swapGeometry(this.geometry, customMaterial);
            } else {
                this.renderer.swapGeometry(this.geometry);
            }

            // Update blink animator with new geometry's blink config
            this.blinkAnimator.setGeometry(this._targetGeometryConfig);
        }

        // Clean up on completion and resume blinks
        if (morphState.completed) {
            this._targetGeometry = null;
            this._targetGeometryType = null;
            this._targetGeometryConfig = null;

            // Resume blinks after morph completes
            this.blinkAnimator.resume();
        }

        // Update breathing animation
        this.breathingAnimator.update(deltaTime, this.emotion, getUndertoneModifier(this.undertone));

        // Get breathing scale multiplier
        const breathScale = this.breathingAnimator.getBreathingScale();

        // Get morph scale multiplier (for shrink/grow effect)
        const morphScale = morphState.scaleMultiplier;

        // Update blink animation
        const blinkState = this.blinkAnimator.update(deltaTime);

        // Always update persistent base rotation (ambient spin continues during gestures)
        if (this.rotationBehavior) {
            this.rotationBehavior.update(deltaTime, this.baseEuler);
        } else if (this.geometryType !== 'moon') {
            // Fallback: simple Y rotation if no behavior defined
            // EXCEPT for moon (tidally locked - no rotation)
            this.baseEuler[1] += deltaTime * 0.0003;
        }
        // Moon gets no rotation update - stays tidally locked

        // Apply righting behavior (self-stabilization) after rotation
        // This pulls tilted models back to upright while preserving yaw spin
        if (this.rightingBehavior) {
            this.rightingBehavior.update(deltaTime, this.baseEuler);
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
        // GESTURE BLENDING SYSTEM - Blend multiple simultaneous gestures
        // ═══════════════════════════════════════════════════════════════════════════
        const blended = this.gestureBlender.blend(
            this.animator.animations,
            this.animator.time,
            this.baseQuaternion,
            this.baseScale,
            this.baseGlowIntensity
        );

        // Apply blended results
        this.position = blended.position;
        this.rotation = blended.rotation;
        this.scale = blended.scale;
        // Only apply blended glow if no manual override is active
        if (this.glowIntensityOverride === null) {
            this.glowIntensity = blended.glowIntensity;
        }
        this.gestureQuaternion = blended.gestureQuaternion;

        // Apply blink effects (AFTER gestures, blending with other animations)
        if (blinkState.isBlinking) {
            // Apply blink rotation (additive to gesture rotation)
            if (blinkState.rotation) {
                this.rotation[0] += blinkState.rotation[0];
                this.rotation[1] += blinkState.rotation[1];
                this.rotation[2] += blinkState.rotation[2];
            }
        }

        // Calculate final scale: gesture * morph * breathing * BLINK
        // Use Y-axis blink scale (primary squish axis) for uniform application
        const blinkScale = blinkState.isBlinking ? blinkState.scale[1] : 1.0;
        const finalScale = this.scale * morphScale * breathScale * blinkScale;

        // ═══════════════════════════════════════════════════════════════════════════
        // PARTICLE SYSTEM UPDATE & RENDERING (Orchestrated)
        // ═══════════════════════════════════════════════════════════════════════════
        if (this.particlesEnabled && this.particleOrchestrator) {
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
                }
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
        this.renderer.updateBloom(effectiveGlowIntensity);

        // Render with Three.js
        this.renderer.render({
            position: this.position,
            rotation: this.rotation,
            scale: finalScale,
            glowColor: this.glowColor,
            glowColorHex: this.glowColorHex,  // For bloom luminance normalization
            glowIntensity: effectiveGlowIntensity,
            hasActiveGesture: this.animator.animations.length > 0,  // Faster lerp during gestures
            calibrationRotation: this.calibrationRotation  // Applied on top of animated rotation
        });
    }

    /**
     * Cleanup
     */
    destroy() {
        this.renderer.destroy();
        this.animator.stopAll();

        // Clean up particle system
        if (this.particleOrchestrator) {
            this.particleOrchestrator.destroy();
        }
    }
}
