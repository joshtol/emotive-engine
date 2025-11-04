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
            strength: 20.0,             // Maximum righting force - rigidly locked upright
            damping: 0.98,              // Near-perfect damping for immediate correction
            centerOfMass: [0, -0.3, 0], // Bottom-heavy
            axes: { pitch: true, roll: true, yaw: false }
        });

        // Current state
        this.emotion = options.emotion || 'neutral';
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

        // Rhythm engine reference (for BPM sync)
        this.rhythmEngine = options.rhythmEngine || null;

        // Initialize emotion
        this.setEmotion(this.emotion);
    }

    /**
     * Set emotional state
     * Updates glow color, lighting, rotation behavior, and triggers emotion animation
     */
    setEmotion(emotion) {
        this.emotion = emotion;

        // Get emotion color and intensity from existing emotion system
        const emotionData = getEmotion(emotion);
        if (emotionData && emotionData.visual) {
            // Convert hex to RGB
            if (emotionData.visual.glowColor) {
                this.glowColor = this.hexToRGB(emotionData.visual.glowColor);
            }
            // Set intensity from emotion data
            if (emotionData.visual.glowIntensity !== undefined) {
                this.glowIntensity = emotionData.visual.glowIntensity;
            }

            // Update Three.js lighting based on emotion
            this.renderer.updateLighting(emotion, emotionData);

            // Update bloom pass intensity
            this.renderer.updateBloom(this.glowIntensity);
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

        // Stop all previous emotion animations to prevent stacking
        this.animator.stopAll();

        // Store base glow intensity for this emotion (before animation modulation)
        this.baseGlowIntensity = emotionData?.visual?.glowIntensity || 1.0;

        // Trigger emotion animation
        this.animator.playEmotion(emotion, {
            onUpdate: (props, _progress) => {
                // Update properties from animation
                // Scale and glowIntensity are multiplicative (base * modifier)
                if (props.scale !== undefined) this.scale = this.baseScale * props.scale;
                if (props.glowIntensity !== undefined) {
                    this.glowIntensity = this.baseGlowIntensity * props.glowIntensity;
                } else {
                    // Reset to base when animation doesn't specify (prevents stacking)
                    this.glowIntensity = this.baseGlowIntensity;
                }
                if (props.position) this.position = props.position;
                // NOTE: Ignore props.rotation - rotation is now managed by quaternion system
                // Emotion animations (anger shake, fear tremble) should use baseEuler or RotationBehavior
            }
        });
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

                // Check if gesture has 3D translation section
                if (gesture2D['3d'] && gesture2D['3d'].evaluate) {
                    // Use gesture's built-in 3D translation
                    // First apply gesture to virtual particle if needed
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
                } else {
                    // Fallback: apply gesture to virtual particle and use legacy translation
                    if (gesture2D.apply) {
                        gesture2D.apply(virtualParticle, gestureData, config, t, 1.0, 0, 0);
                    }
                    return this.translate2DTo3D(virtualParticle, t, gesture2D, gestureState);
                }
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
     * Translate 2D particle behavior to 3D transforms
     * Maps particle x/y/vx/vy/size changes to 3D position/rotation/scale
     */
    translate2DTo3D(particle, progress, gesture, gestureState) {
        const props = {
            position: [...gestureState.startPosition],
            rotation: [...gestureState.startRotation],
            scale: 1.0
        };

        // Map 2D movements to 3D based on gesture type
        const gestureName = gesture.name;

        // Clamp helper to prevent off-screen movement
        const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

        if (gestureName === 'bounce') {
            // Vertical bounce → 3D Y position (clamped)
            props.position[1] = clamp(particle.vy * 0.005, -0.3, 0.3);
            props.scale = 1.0 + Math.abs(particle.vy) * 0.002;

        } else if (gestureName === 'pulse') {
            // Radial expansion → 3D scale
            const distanceFromCenter = Math.sqrt(particle.x * particle.x + particle.y * particle.y);
            props.scale = 1.0 + distanceFromCenter * 0.003;

        } else if (gestureName === 'spin') {
            // Orbital rotation → 3D Y rotation (use progress for smooth spin)
            props.rotation[1] = progress * Math.PI * 2;

        } else if (gestureName === 'float') {
            // Upward float → 3D Y position (clamped, smooth)
            props.position[1] = clamp(progress * 0.4, 0, 0.5);
            props.scale = 1.0 + progress * 0.1;

        } else if (gestureName === 'sway') {
            // Gentle side-to-side → 3D X position + Z rotation
            const swayAmount = Math.sin(progress * Math.PI * 2) * 0.15;
            props.position[0] = swayAmount;
            props.rotation[2] = swayAmount * 0.3;

        } else if (gestureName === 'tilt') {
            // Tilt → 3D Z rotation (roll)
            const tiltAmount = Math.sin(progress * Math.PI) * 0.4;
            props.rotation[2] = tiltAmount;

        } else if (gestureName === 'shake') {
            // Jittery shake → 3D X/Z position + rotation (reduced)
            props.position[0] = clamp(particle.vx * 0.003, -0.15, 0.15);
            props.position[2] = clamp(particle.vy * 0.002, -0.1, 0.1);
            props.rotation[2] = clamp(particle.vx * 0.002, -0.2, 0.2);

        } else if (gestureName === 'wobble') {
            // Wobble → 3D rotation on X and Z (figure-8)
            props.rotation[0] = Math.sin(progress * Math.PI * 4) * 0.2;
            props.rotation[2] = Math.cos(progress * Math.PI * 4) * 0.2;

        } else if (gestureName === 'nod') {
            // Nod → 3D X rotation (pitch) - down and up
            props.rotation[0] = Math.sin(progress * Math.PI) * 0.3;

        } else if (gestureName === 'lean') {
            // Lean → 3D X and Z position + rotation
            const leanDir = Math.PI * 0.25; // 45 degrees
            props.position[0] = Math.cos(leanDir) * progress * 0.2;
            props.position[1] = -Math.sin(leanDir) * progress * 0.1;
            props.rotation[2] = progress * 0.3;

        } else if (gestureName === 'groove') {
            // Groove → rhythmic rotation on multiple axes
            props.rotation[0] = Math.sin(progress * Math.PI * 2) * 0.15;
            props.rotation[1] = progress * Math.PI * 0.5;
            props.rotation[2] = Math.cos(progress * Math.PI * 2) * 0.15;

        } else if (gestureName === 'point') {
            // Point → extend on X axis with slight rotation
            props.position[0] = progress * 0.3;
            props.rotation[2] = -progress * 0.2;

        } else if (gestureName === 'reach') {
            // Reach → extend upward on Y axis
            props.position[1] = progress * 0.4;
            props.scale = 1.0 + progress * 0.15;

        } else if (gestureName === 'headBob' || gestureName === 'headbob') {
            // Head bob → quick nod motion
            const bobProgress = Math.sin(progress * Math.PI * 3) * (1 - progress);
            props.rotation[0] = bobProgress * 0.25;

        } else if (gestureName === 'wiggle') {
            // Wiggle → fast alternating rotation
            props.rotation[1] = Math.sin(progress * Math.PI * 6) * 0.25;
            props.position[0] = Math.sin(progress * Math.PI * 6) * 0.1;

        } else {
            // Generic translation for unknown gestures (clamped)
            // X/Y velocity → position (heavily reduced)
            props.position[0] = clamp(particle.vx * 0.002, -0.2, 0.2);
            props.position[1] = clamp(-particle.vy * 0.002, -0.2, 0.2);

            // Size change → scale (reduced)
            if (particle.size !== 1) {
                const sizeChange = particle.size - 1;
                props.scale = 1.0 + clamp(sizeChange * 0.05, -0.3, 0.3);
            }
        }

        return props;
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
        const hadMorphAnimation = this.animator.animations.some(anim => anim.isMorphAnimation);
        this.animator.animations = this.animator.animations.filter(anim =>
            !anim.isMorphAnimation
        );

        // If we cancelled a morph mid-transition, reset morph multiplier
        if (hadMorphAnimation) {
            this.morphScaleMultiplier = 1.0;
        }

        // Smooth morph animation: scale down → swap geometry → scale up
        const startTime = Date.now();
        const halfDuration = duration / 2;

        // Shrink animation (first half)
        const shrinkAnimation = {
            startTime,
            duration: halfDuration,
            isMorphAnimation: true, // Flag for cancellation
            evaluate: t => {
                const progress = Math.min(1.0, (Date.now() - startTime) / halfDuration);
                const easeProgress = this.easeInOutCubic(progress);

                // Morph scale multiplier: 1.0 → 0.3
                this.morphScaleMultiplier = 1.0 - easeProgress * 0.7;

                // When shrink is complete, swap geometry and start grow
                if (progress >= 1.0) {
                    // Swap geometry at smallest point (optimized - don't recreate mesh)
                    this.geometry = targetGeometry;
                    this.geometryType = shapeName;
                    this.renderer.swapGeometry(this.geometry);

                    // Start grow animation (second half)
                    const growStartTime = Date.now();
                    const growAnimation = {
                        startTime: growStartTime,
                        duration: halfDuration,
                        isMorphAnimation: true, // Flag for cancellation
                        evaluate: t => {
                            const growProgress = Math.min(1.0, (Date.now() - growStartTime) / halfDuration);
                            const easeGrowProgress = this.easeInOutCubic(growProgress);

                            // Morph scale multiplier: 0.3 → 1.0
                            this.morphScaleMultiplier = 0.3 + easeGrowProgress * 0.7;

                            return growProgress >= 1.0;
                        }
                    };

                    // Add grow animation
                    this.animator.animations.push(growAnimation);

                    // Remove shrink animation
                    return true;
                }

                return false;
            }
        };

        // Add shrink animation
        this.animator.animations.push(shrinkAnimation);
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

        // If no gesture is active, reset gesture quaternion to identity
        if (this.animator.animations.length === 0) {
            this.gestureQuaternion.identity();
        }

        // Combine quaternions: finalQuaternion = baseQuaternion * gestureQuaternion
        // This applies gesture rotation in the local space of the base rotation
        this.finalQuaternion.copy(this.baseQuaternion);
        this.finalQuaternion.multiply(this.gestureQuaternion);

        // Convert final quaternion back to Euler angles for renderer
        this.tempEuler.setFromQuaternion(this.finalQuaternion, 'XYZ');
        this.rotation[0] = this.tempEuler.x;
        this.rotation[1] = this.tempEuler.y;
        this.rotation[2] = this.tempEuler.z;

        // Calculate final scale: base scale * morph multiplier
        const finalScale = this.scale * this.morphScaleMultiplier;

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
     * Convert hex color to RGB array
     */
    hexToRGB(hex) {
        // Remove # if present
        hex = hex.replace('#', '');

        // Parse
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;

        return [r, g, b];
    }

    /**
     * Cleanup
     */
    destroy() {
        this.renderer.destroy();
        this.animator.stopAll();
    }
}
