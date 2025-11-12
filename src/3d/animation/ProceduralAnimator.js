/**
 * ProceduralAnimator - Code-driven animation system for 3D mascot
 *
 * Maps emotive-engine gestures to 3D transforms without asset files.
 * Handles emotion animations, gesture playback, and smooth transitions.
 */

export class ProceduralAnimator {
    constructor() {
        this.currentAnimation = null;
        this.animations = [];
        this.time = 0;
    }

    /**
     * Play emotion animation (affects scale, glow)
     */
    playEmotion(emotion, callbacks = {}) {
        const animation = this.createEmotionAnimation(emotion);
        this.startAnimation(animation, callbacks);
    }

    /**
     * Play gesture animation (affects position, rotation)
     */
    playGesture(gestureName, callbacks = {}) {
        const animation = this.createGestureAnimation(gestureName);
        this.startAnimation(animation, callbacks);
    }

    /**
     * Play morph animation (affects geometry transition)
     */
    playMorph(fromShape, toShape, callbacks = {}) {
        const animation = this.createMorphAnimation(fromShape, toShape);
        this.startAnimation(animation, callbacks);
    }

    /**
     * Update animations (called each frame)
     *
     * NOTE: Gesture blending is now handled externally in Core3DManager.render()
     * This method only updates time and removes completed animations.
     * The blending system calls evaluate() directly and accumulates outputs.
     */
    update(deltaTime) {
        this.time += deltaTime;

        // Remove completed animations
        for (let i = this.animations.length - 1; i >= 0; i--) {
            const anim = this.animations[i];
            const durationMs = anim.duration; // Duration in milliseconds
            const progress = Math.min((this.time - anim.startTime) / durationMs, 1.0);

            // Check if animation is complete
            if (progress >= 1.0) {
                if (anim.callbacks && anim.callbacks.onComplete) {
                    anim.callbacks.onComplete();
                }
                this.animations.splice(i, 1);
            }
        }
    }

    /**
     * Create emotion animation definition
     */
    createEmotionAnimation(emotion) {
        const animations = {
            joy: {
                duration: 0.6,
                evaluate: t => ({
                    scale: 1.0 + Math.sin(t * Math.PI) * 0.15,
                    glowIntensity: 1.0 + Math.sin(t * Math.PI) * 0.15  // Gentle pulse ±15%
                })
            },
            love: {
                duration: 1.2,
                evaluate: t => ({
                    scale: 1.0 + Math.sin(t * Math.PI * 2) * 0.08,
                    glowIntensity: 1.0 + Math.sin(t * Math.PI * 2) * 0.1  // Gentle pulse ±10%
                })
            },
            curiosity: {
                duration: 0.8,
                evaluate: t => {
                    const wiggle = Math.sin(t * Math.PI * 4) * 0.1;
                    return {
                        rotation: [0, wiggle, 0],
                        scale: 1.0 + Math.sin(t * Math.PI) * 0.05,
                        glowIntensity: 1.0  // Steady glow
                    };
                }
            },
            sadness: {
                duration: 1.5,
                evaluate: t => ({
                    scale: 1.0 - t * 0.1,
                    glowIntensity: 1.0 - Math.sin(t * Math.PI) * 0.15  // Gentle fade ±15%
                })
            },
            anger: {
                duration: 0.4,
                evaluate: t => {
                    const shake = Math.sin(t * Math.PI * 8) * 0.15;
                    return {
                        rotation: [shake, shake, 0],
                        scale: 1.1 + Math.sin(t * Math.PI) * 0.1,
                        glowIntensity: 1.0 + Math.sin(t * Math.PI * 8) * 0.15  // Rapid flicker ±15%
                    };
                }
            },
            fear: {
                duration: 0.5,
                evaluate: t => {
                    const tremble = Math.sin(t * Math.PI * 10) * 0.08;
                    return {
                        scale: 0.9 + tremble,
                        rotation: [tremble, 0, tremble],
                        glowIntensity: 1.0 + Math.sin(t * Math.PI * 10) * 0.1  // Nervous flicker ±10%
                    };
                }
            },
            surprise: {
                duration: 0.4,
                evaluate: t => ({
                    scale: 1.0 + (1.0 - Math.cos(t * Math.PI)) * 0.25,
                    glowIntensity: 1.0 + (1.0 - Math.cos(t * Math.PI)) * 0.2  // Quick burst +20%
                })
            },
            neutral: {
                duration: 0.5,
                evaluate: _t => ({
                    scale: 1.0,
                    glowIntensity: 1.0  // Steady baseline
                })
            }
        };

        return animations[emotion] || animations.neutral;
    }

    /**
     * Create gesture animation definition
     */
    createGestureAnimation(gestureName) {
        const gestures = {
            bounce: {
                duration: 0.8,
                evaluate: t => {
                    const bounce = Math.abs(Math.sin(t * Math.PI));
                    return {
                        position: [0, bounce * 0.5, 0],
                        scale: 1.0 + bounce * 0.1
                    };
                }
            },
            pulse: {
                duration: 0.6,
                evaluate: t => {
                    const pulse = Math.sin(t * Math.PI);
                    return {
                        scale: 1.0 + pulse * 0.2,
                        glowIntensity: 1.0 + pulse * 0.5
                    };
                }
            },
            spin: {
                duration: 1.0,
                evaluate: t => ({
                    rotation: [0, t * Math.PI * 2, 0]
                })
            },
            wobble: {
                duration: 1.0,
                evaluate: t => {
                    const wobble = Math.sin(t * Math.PI * 3);
                    return {
                        rotation: [wobble * 0.3, 0, wobble * 0.2]
                    };
                }
            },
            float: {
                duration: 2.0,
                evaluate: t => {
                    const float = Math.sin(t * Math.PI);
                    return {
                        position: [0, float * 0.3, 0]
                    };
                }
            },
            shake: {
                duration: 0.5,
                evaluate: t => {
                    const shake = Math.sin(t * Math.PI * 6) * (1.0 - t);
                    return {
                        position: [shake * 0.2, 0, 0],
                        rotation: [0, 0, shake * 0.1]
                    };
                }
            },
            nod: {
                duration: 0.8,
                evaluate: t => {
                    const nod = Math.sin(t * Math.PI * 2);
                    return {
                        rotation: [nod * 0.3, 0, 0]
                    };
                }
            }
        };

        return gestures[gestureName] || gestures.pulse;
    }

    /**
     * Create morph animation (cross-fade between geometries)
     */
    createMorphAnimation(fromShape, toShape) {
        return {
            duration: 1.0,
            fromShape,
            toShape,
            evaluate: t => ({
                morphProgress: t,
                scale: 1.0 + Math.sin(t * Math.PI) * 0.1,
                rotation: [0, t * Math.PI * 0.5, 0]
            })
        };
    }

    /**
     * Start animation
     */
    startAnimation(animation, callbacks) {
        this.animations.push({
            ...animation,
            startTime: this.time,
            callbacks: callbacks || {}
        });

        this.currentAnimation = animation;
    }

    /**
     * Stop all animations
     */
    stopAll() {
        this.animations = [];
        this.currentAnimation = null;
    }

    /**
     * Cleanup all resources
     */
    destroy() {
        this.stopAll();
        this.animations = null;
        this.currentAnimation = null;
        this.time = 0;
    }

    /**
     * Easing function (smooth in-out)
     */
    easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /**
     * Get idle animation (continuous subtle movement)
     */
    getIdleAnimation() {
        return {
            duration: 3.0,
            loop: true,
            evaluate: t => {
                const breathe = Math.sin(t * Math.PI * 2);
                const drift = Math.sin(t * Math.PI);
                return {
                    scale: 1.0 + breathe * 0.02,
                    position: [drift * 0.05, breathe * 0.03, 0],
                    rotation: [0, drift * 0.05, 0],
                    glowIntensity: 1.0 + breathe * 0.1
                };
            }
        };
    }

    /**
     * Check if any animation is playing
     */
    isPlaying() {
        return this.animations.length > 0;
    }
}
