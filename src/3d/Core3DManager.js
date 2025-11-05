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
import RotationBehavior from './behaviors/RotationBehavior.js';
import RightingBehavior from './behaviors/RightingBehavior.js';
import { getEmotion } from '../core/emotions/index.js';
import { getGesture } from '../core/gestures/index.js';
import { getUndertoneModifier } from '../config/undertoneModifiers.js';
import { hexToRGB, rgbToHsl, hslToRgb, applyUndertoneSaturation } from './utils/ColorUtilities.js';

export class Core3DManager {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.options = options;

        // Initialize Three.js renderer
        this.renderer = new ThreeRenderer(canvas, {
            enablePostProcessing: options.enablePostProcessing !== false,
            enableShadows: options.enableShadows || false
        });

        // Load geometry
        this.geometryType = options.geometry || 'sphere';
        this.geometry = THREE_GEOMETRIES[this.geometryType];

        if (!this.geometry) {
            console.warn(`Unknown geometry: ${this.geometryType}, falling back to sphere`);
            this.geometry = THREE_GEOMETRIES.sphere;
        }

        // Create core mesh with geometry
        this.coreMesh = this.renderer.createCoreMesh(this.geometry);

        // Animation controller
        this.animator = new ProceduralAnimator();

        // Rotation behavior system
        this.rotationBehavior = null; // Will be initialized in setEmotion

        // Righting behavior (self-stabilization like inflatable punching clowns)
        // Very strong righting keeps models always upright regardless of shake
        this.rightingBehavior = new RightingBehavior({
            strength: 50.0,             // Extremely strong righting - dominates all wobble
            damping: 0.99,              // Higher damping for faster correction
            centerOfMass: [0, -0.3, 0], // Bottom-heavy
            axes: { pitch: true, roll: true, yaw: false }
        });

        // Current state
        this.emotion = options.emotion || 'neutral';
        this.undertone = options.undertone || null;
        this.glowColor = [1.0, 1.0, 1.0]; // RGB
        this.glowIntensity = 1.0;

        // Quaternion-based rotation system for smooth 3D orientation
        this.baseEuler = [0, 0, 0]; // Persistent base Euler angles (updated by RotationBehavior)
        this.baseQuaternion = new THREE.Quaternion(); // Ambient rotation (from emotion state)
        this.gestureQuaternion = new THREE.Quaternion(); // Gesture delta rotation
        this.finalQuaternion = new THREE.Quaternion(); // Combined result
        this.tempEuler = new THREE.Euler(); // Temp for conversions
        this.rotation = [0, 0, 0]; // Final Euler angles for renderer

        // Match 2D sizing: core is 1/12th of canvas size (coreSizeDivisor: 12)
        this.baseScale = 0.16; // Properly sized core relative to particles
        this.scale = 0.16; // Current scale (base + animation)
        this.morphScaleMultiplier = 1.0; // Separate multiplier for morph animations
        this.position = [0, 0, 0];

        // Breathing animation (like 2D BreathingAnimator)
        this.breathingPhase = 0;        // Current phase in breathing cycle [0, 2π]
        this.breathingSpeed = 1.0;      // Base breathing speed
        this.breathingDepth = 0.03;     // Base breathing depth (3% scale oscillation)
        this.breathRate = 1.0;          // Emotion-specific rate multiplier
        this.breathDepth = 0.03;        // Emotion-specific depth
        this.breathRateMult = 1.0;      // Undertone rate multiplier
        this.breathDepthMult = 1.0;     // Undertone depth multiplier

        // Rhythm engine reference (for BPM sync)
        this.rhythmEngine = options.rhythmEngine || null;

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

        // Apply undertone breathing multipliers
        if (undertoneModifier && undertoneModifier['3d'] && undertoneModifier['3d'].scale) {
            this.breathRateMult = undertoneModifier['3d'].scale.breathRateMultiplier || 1.0;
            this.breathDepthMult = undertoneModifier['3d'].scale.breathDepthMultiplier || 1.0;
        } else {
            this.breathRateMult = 1.0;
            this.breathDepthMult = 1.0;
        }

        // Calculate final breathing parameters (like 2D BreathingAnimator)
        this.breathRate = 1.0 * this.breathRateMult; // TODO: Add emotion-specific patterns
        this.breathDepth = this.breathingDepth * this.breathDepthMult;

        // Immediately reset bloom to prevent accumulation (fast transition on emotion change)
        this.renderer.updateBloom(this.baseGlowIntensity, 1.0);

        // Trigger emotion animation - now handled by blending system in render()
        this.animator.playEmotion(emotion);
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
            duration,
            startTime,
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
        const targetGeometry = THREE_GEOMETRIES[shapeName];
        if (!targetGeometry) {
            console.warn(`Unknown shape: ${shapeName}`);
            return;
        }

        // If already this shape, skip
        if (this.geometryType === shapeName) {
            return;
        }

        // Cancel any existing morph animations to prevent stacking
        this.animator.animations = this.animator.animations.filter(anim =>
            !anim.isMorphAnimation
        );

        // Ensure morph multiplier is at normal scale
        this.morphScaleMultiplier = 1.0;

        // Swap geometry instantly (no animation)
        this.geometry = targetGeometry;
        this.geometryType = shapeName;
        this.renderer.swapGeometry(this.geometry);
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

        // Update breathing animation (sine wave oscillation on scale)
        const phaseIncrement = this.breathingSpeed * this.breathRate * (deltaTime / 1000);
        this.breathingPhase += phaseIncrement;

        // Calculate breathing scale multiplier (1.0 ± breathDepth)
        const breathScale = 1.0 + Math.sin(this.breathingPhase) * this.breathDepth;

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

        // Convert base Euler to quaternion
        this.tempEuler.set(this.baseEuler[0], this.baseEuler[1], this.baseEuler[2], 'XYZ');
        this.baseQuaternion.setFromEuler(this.tempEuler);

        // ═══════════════════════════════════════════════════════════════════════════
        // GESTURE BLENDING SYSTEM - Accumulate multiple simultaneous gestures
        // ═══════════════════════════════════════════════════════════════════════════

        // Initialize accumulator with base values
        const accumulated = {
            position: [0, 0, 0],                               // Additive channel
            rotationQuat: new THREE.Quaternion().identity(),   // Multiplicative channel
            scale: 1.0,                                        // Multiplicative channel
            glowIntensity: 1.0                                 // Multiplicative channel
        };

        // Blend all active animations
        for (const animation of this.animator.animations) {
            if (animation.evaluate) {
                const elapsed = this.animator.time - animation.startTime;
                const progress = Math.min(elapsed / animation.duration, 1);
                const output = animation.evaluate(progress);

                if (output) {
                    // POSITION: Additive blending (bounce + sway)
                    if (output.position) {
                        accumulated.position[0] += output.position[0];
                        accumulated.position[1] += output.position[1];
                        accumulated.position[2] += output.position[2];
                    }

                    // ROTATION: Quaternion multiplication (orbital * twist)
                    if (output.rotation) {
                        this.tempEuler.set(
                            output.rotation[0],
                            output.rotation[1],
                            output.rotation[2],
                            'XYZ'
                        );
                        const gestureQuat = new THREE.Quaternion().setFromEuler(this.tempEuler);
                        accumulated.rotationQuat.multiply(gestureQuat);
                    }

                    // SCALE: Multiplicative blending (expand × shrink)
                    if (output.scale !== undefined) {
                        accumulated.scale *= output.scale;
                    }

                    // GLOW: Multiplicative blending (glow × pulse)
                    if (output.glowIntensity !== undefined) {
                        accumulated.glowIntensity *= output.glowIntensity;
                    }
                }
            }
        }

        // Apply accumulated gesture results
        this.position = accumulated.position;
        this.gestureQuaternion.copy(accumulated.rotationQuat);
        this.scale = this.baseScale * accumulated.scale;
        this.glowIntensity = this.baseGlowIntensity * accumulated.glowIntensity;

        // Combine quaternions: finalQuaternion = baseQuaternion * gestureQuaternion
        // This applies accumulated gesture rotation in the local space of the base rotation
        this.finalQuaternion.copy(this.baseQuaternion);
        this.finalQuaternion.multiply(this.gestureQuaternion);

        // Convert final quaternion back to Euler angles for renderer
        this.tempEuler.setFromQuaternion(this.finalQuaternion, 'XYZ');
        this.rotation[0] = this.tempEuler.x;
        this.rotation[1] = this.tempEuler.y;
        this.rotation[2] = this.tempEuler.z;

        // Calculate final scale: base scale * morph multiplier * breathing
        const finalScale = this.scale * this.morphScaleMultiplier * breathScale;

        // Update bloom pass with current glow intensity (smooth transitions)
        this.renderer.updateBloom(this.glowIntensity);

        // Render with Three.js
        this.renderer.render({
            position: this.position,
            rotation: this.rotation,
            scale: finalScale,
            glowColor: this.glowColor,
            glowIntensity: this.glowIntensity
        });
    }

    /**
     * Cleanup
     */
    destroy() {
        this.renderer.destroy();
        this.animator.stopAll();
    }
}
