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
import ParticleSystem from '../core/ParticleSystem.js';
import { Particle3DTranslator } from './particles/Particle3DTranslator.js';
import { Particle3DRenderer } from './particles/Particle3DRenderer.js';
import { Particle3DOrchestrator } from './particles/Particle3DOrchestrator.js';

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

        // Create core mesh with geometry
        this.coreMesh = this.renderer.createCoreMesh(this.geometry);

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
        this.glowIntensity = 1.0;
        this.coreGlowEnabled = true; // Toggle to enable/disable core glow
        this.glowIntensityOverride = null; // Manual override for testing

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
            }
            // Set intensity from emotion data
            if (emotionData.visual.glowIntensity !== undefined) {
                this.glowIntensity = emotionData.visual.glowIntensity;
            }

            // Update Three.js lighting based on emotion
            this.renderer.updateLighting(emotion, emotionData);

            // Note: Bloom is updated every frame in render() for smooth transitions
        }

        // Initialize or update rotation behavior from 3d config
        if (emotionData && emotionData['3d'] && emotionData['3d'].rotation) {
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
        this.baseGlowIntensity = emotionData?.visual?.glowIntensity || 1.0;

        // Apply undertone glow multiplier to base intensity
        if (undertoneModifier && undertoneModifier['3d'] && undertoneModifier['3d'].glow) {
            this.baseGlowIntensity *= undertoneModifier['3d'].glow.intensityMultiplier;
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
        console.log(`Core glow ${enabled ? 'enabled' : 'disabled'}`);
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
     * @param {number} intensity - Glow intensity value (typically 0.0 to 2.0), or null to clear override
     */
    setGlowIntensity(intensity) {
        this.glowIntensityOverride = intensity;
        if (intensity !== null) {
            this.glowIntensity = intensity;
            this.baseGlowIntensity = intensity;
        }
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

                return gesture2D['3d'].evaluate(t, motion);
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
                    if (props.glowIntensity !== undefined) this.glowIntensity = props.glowIntensity;
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
            this.renderer.swapGeometry(this.geometry);

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
        } else {
            // Fallback: simple Y rotation if no behavior defined
            this.baseEuler[1] += deltaTime * 0.0003;
        }

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
        const blinkBoost = blinkState.isBlinking && blinkState.glowBoost ? blinkState.glowBoost : 0;
        const effectiveGlowIntensity = this.coreGlowEnabled ? this.glowIntensity + blinkBoost : 0.0;

        // Update bloom pass with effective glow intensity (smooth transitions)
        this.renderer.updateBloom(effectiveGlowIntensity);

        // Render with Three.js
        this.renderer.render({
            position: this.position,
            rotation: this.rotation,
            scale: finalScale,
            glowColor: this.glowColor,
            glowIntensity: effectiveGlowIntensity
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
