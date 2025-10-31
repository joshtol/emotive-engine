/**
 * Core3DManager - Main orchestrator for 3D rendering
 *
 * Manages:
 * - WebGL context
 * - 3D geometry selection
 * - Animation playback
 * - Material/shader updates
 */

import { WebGLRenderer } from './renderer/WebGLRenderer.js';
import { CORE_GEOMETRIES } from './geometries/index.js';
import { ProceduralAnimator } from './animation/ProceduralAnimator.js';
import { getEmotion } from '../core/emotions/index.js';
import { getGesture } from '../core/gestures/index.js';

export class Core3DManager {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.options = options;

        // Initialize WebGL renderer
        this.renderer = new WebGLRenderer(canvas);

        // Load geometry
        this.geometryType = options.geometry || 'sphere';
        this.geometry = CORE_GEOMETRIES[this.geometryType];

        if (!this.geometry) {
            console.warn(`Unknown geometry: ${this.geometryType}, falling back to sphere`);
            this.geometry = CORE_GEOMETRIES.sphere;
        }

        // Animation controller
        this.animator = new ProceduralAnimator();

        // Current state
        this.emotion = options.emotion || 'neutral';
        this.glowColor = [1.0, 1.0, 1.0]; // RGB
        this.glowIntensity = 1.0;
        this.rotation = [0, 0, 0]; // Euler angles (x, y, z)
        // Match 2D sizing: core is 1/12th of canvas size (coreSizeDivisor: 12)
        // In WebGL NDC space (-1 to 1), this translates to a smaller scale value
        this.baseScale = 0.16; // Properly sized core relative to particles
        this.scale = 0.16; // Current scale (base + animation)
        this.position = [0, 0, 0];

        // Initialize emotion
        this.setEmotion(this.emotion);
    }

    /**
     * Set emotional state
     * Updates glow color and triggers emotion animation
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
        }

        // Trigger emotion animation
        this.animator.playEmotion(emotion, {
            onUpdate: props => {
                // Update properties from animation (multiplicative for scale)
                if (props.scale !== undefined) this.scale = this.baseScale * props.scale;
                if (props.glowIntensity !== undefined) this.glowIntensity = props.glowIntensity;
                if (props.position) this.position = props.position;
                if (props.rotation) this.rotation = props.rotation;
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
                        const motion = { ...config };
                        gesture2D.apply(virtualParticle, t, motion, 1, 0, 0);
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
                        const motion = { ...config };
                        gesture2D.apply(virtualParticle, t, motion, 1, 0, 0);
                    }
                    return this.translate2DTo3D(virtualParticle, t, gesture2D, gestureState);
                }
            },
            callbacks: {
                onUpdate: props => {
                    if (props.position) this.position = props.position;
                    if (props.rotation) this.rotation = props.rotation;
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
                    this.rotation = [0, 0, 0];
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
        // const gestureType = gesture.type;
        const gestureName = gesture.name;

        if (gestureName === 'bounce') {
            // Vertical bounce → 3D Y position
            props.position[1] = particle.vy * 0.02; // Scale velocity to position
            props.scale = 1.0 + Math.abs(particle.vy) * 0.005; // Slight scale on bounce

        } else if (gestureName === 'pulse') {
            // Radial expansion → 3D scale
            const distanceFromCenter = Math.sqrt(particle.x * particle.x + particle.y * particle.y);
            props.scale = 1.0 + distanceFromCenter * 0.01;

        } else if (gestureName === 'spin') {
            // Orbital rotation → 3D Y rotation
            const angle = Math.atan2(particle.y, particle.x);
            props.rotation[1] = angle;

        } else if (gestureName === 'float') {
            // Upward float → 3D Y position + Z depth via size
            props.position[1] = -particle.vy * 0.02; // Negative because 2D vy is upward
            props.position[2] = (particle.size - 1) * 0.3; // Size change → depth
            props.scale = 1.0 + (particle.size - 1) * 0.2;

        } else if (gestureName === 'shake') {
            // Jittery shake → 3D X/Z position + rotation
            props.position[0] = particle.vx * 0.015;
            props.position[2] = particle.vy * 0.01;
            props.rotation[2] = particle.vx * 0.008; // Roll on Z axis

        } else if (gestureName === 'wobble') {
            // Wobble → 3D rotation on X and Z
            props.rotation[0] = particle.vy * 0.01;
            props.rotation[2] = particle.vx * 0.01;

        } else if (gestureName === 'nod') {
            // Nod → 3D X rotation (pitch)
            props.rotation[0] = particle.vy * 0.015;

        } else {
            // Generic translation for unknown gestures
            // X/Y velocity → position
            props.position[0] = particle.vx * 0.01;
            props.position[1] = -particle.vy * 0.01;

            // Size change → scale or Z depth
            if (particle.size !== 1) {
                const sizeChange = particle.size - 1;
                props.position[2] = sizeChange * 0.2;
                props.scale = 1.0 + sizeChange * 0.1;
            }
        }

        return props;
    }

    /**
     * Morph to different shape
     */
    morphToShape(shapeName) {
        const targetGeometry = CORE_GEOMETRIES[shapeName];
        if (!targetGeometry) {
            console.warn(`Unknown shape: ${shapeName}`);
            return;
        }

        // Start morph animation
        this.animator.playMorph(this.geometry, targetGeometry, {
            duration: 1000,
            onUpdate: blendedGeometry => {
                this.geometry = blendedGeometry;
            },
            onComplete: () => {
                this.geometry = targetGeometry;
                this.geometryType = shapeName;
            }
        });
    }

    /**
     * Render frame
     */
    render(deltaTime) {
        // Update animations
        this.animator.update(deltaTime);

        // Auto-rotate based on emotion
        this.rotation[1] += deltaTime * 0.0003; // Slow Y rotation

        // Render with WebGL
        this.renderer.render({
            geometry: this.geometry,
            position: this.position,
            rotation: this.rotation,
            scale: this.scale,
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
