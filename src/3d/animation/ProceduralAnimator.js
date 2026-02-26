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
                    glowIntensity: 1.0 + Math.sin(t * Math.PI) * 0.15, // Gentle pulse ±15%
                }),
            },
            love: {
                duration: 1.2,
                evaluate: t => ({
                    scale: 1.0 + Math.sin(t * Math.PI * 2) * 0.08,
                    glowIntensity: 1.0 + Math.sin(t * Math.PI * 2) * 0.1, // Gentle pulse ±10%
                }),
            },
            curiosity: {
                duration: 0.8,
                evaluate: t => {
                    const wiggle = Math.sin(t * Math.PI * 4) * 0.1;
                    return {
                        rotation: [0, wiggle, 0],
                        scale: 1.0 + Math.sin(t * Math.PI) * 0.05,
                        glowIntensity: 1.0, // Steady glow
                    };
                },
            },
            sadness: {
                duration: 1.5,
                evaluate: t => ({
                    scale: 1.0 - t * 0.1,
                    glowIntensity: 1.0 - Math.sin(t * Math.PI) * 0.15, // Gentle fade ±15%
                }),
            },
            anger: {
                duration: 0.4,
                evaluate: t => {
                    const shake = Math.sin(t * Math.PI * 8) * 0.15;
                    return {
                        rotation: [shake, shake, 0],
                        scale: 1.1 + Math.sin(t * Math.PI) * 0.1,
                        glowIntensity: 1.0 + Math.sin(t * Math.PI * 8) * 0.15, // Rapid flicker ±15%
                    };
                },
            },
            fear: {
                duration: 0.5,
                evaluate: t => {
                    const tremble = Math.sin(t * Math.PI * 10) * 0.08;
                    return {
                        scale: 0.9 + tremble,
                        rotation: [tremble, 0, tremble],
                        glowIntensity: 1.0 + Math.sin(t * Math.PI * 10) * 0.1, // Nervous flicker ±10%
                    };
                },
            },
            surprise: {
                duration: 0.4,
                evaluate: t => ({
                    scale: 1.0 + (1.0 - Math.cos(t * Math.PI)) * 0.25,
                    glowIntensity: 1.0 + (1.0 - Math.cos(t * Math.PI)) * 0.2, // Quick burst +20%
                }),
            },
            neutral: {
                duration: 0.5,
                evaluate: _t => ({
                    scale: 1.0,
                    glowIntensity: 1.0, // Steady baseline
                }),
            },
        };

        return animations[emotion] || animations.neutral;
    }

    /**
     * Create gesture animation definition
     *
     * GESTURE CATEGORIES:
     * - "Absolute" gestures (bounce, spin, float): Create their own motion, compete with groove
     * - "Accent" gestures (pop, punch, swell): Multiply/boost existing groove, work as punctuation
     *
     * For dancing, prefer accent gestures - they complement the groove instead of fighting it.
     */
    createGestureAnimation(gestureName) {
        const gestures = {
            // ═══════════════════════════════════════════════════════════════════════════
            // ACCENT GESTURES (Dance-friendly - boost groove, don't compete)
            // These use 'isAccent: true' to signal multiplicative blending
            // ═══════════════════════════════════════════════════════════════════════════

            // ───────────────────────────────────────────────────────────────
            // POP: Pure scale pulse - the classic beat hit
            // Character: Quick size bump, no rotation/position
            // ───────────────────────────────────────────────────────────────
            pop: {
                duration: 0.2,
                isAccent: true,
                evaluate: t => {
                    const envelope = Math.sin(t * Math.PI);
                    return {
                        scaleBoost: 1.0 + envelope * 0.025, // 2.5% scale only
                    };
                },
            },

            // ───────────────────────────────────────────────────────────────
            // BOB: Forward tilt accent - head nod feel
            // Character: Rotation only, like nodding to the beat
            // ───────────────────────────────────────────────────────────────
            bob: {
                duration: 0.25,
                isAccent: true,
                evaluate: t => {
                    const envelope = Math.sin(t * Math.PI);
                    return {
                        rotationBoost: [envelope * 0.025, 0, 0], // Forward tilt only
                    };
                },
            },

            // ───────────────────────────────────────────────────────────────
            // SWELL: Glow build with scale - for transitions and builds
            // Character: Glowing expansion, like breathing in deeply
            // ───────────────────────────────────────────────────────────────
            swell: {
                duration: 0.6,
                isAccent: true,
                evaluate: t => {
                    // Smooth bell curve envelope
                    const envelope = Math.sin(t * Math.PI);
                    // Slight ease-out for organic feel
                    const eased = 1 - Math.pow(1 - envelope, 2);
                    return {
                        scaleBoost: 1.0 + eased * 0.04, // 4% scale growth (visible)
                        glowBoost: eased * 0.3, // 30% glow boost (noticeable)
                    };
                },
            },

            // ───────────────────────────────────────────────────────────────
            // SWAGGER: Side lean - attitude/groove feel
            // Character: Z-rotation lean, slight X drift
            // ───────────────────────────────────────────────────────────────
            swagger: {
                duration: 0.4,
                isAccent: true,
                evaluate: t => {
                    const envelope = Math.sin(t * Math.PI);
                    return {
                        rotationBoost: [0, 0, envelope * 0.04], // Side lean
                        positionBoost: [envelope * 0.01, 0, 0], // Slight drift
                    };
                },
            },

            // ───────────────────────────────────────────────────────────────
            // DIP: Downward bob - groove dip feel
            // Character: Y-position dip with tiny squish
            // ───────────────────────────────────────────────────────────────
            dip: {
                duration: 0.25,
                isAccent: true,
                evaluate: t => {
                    const envelope = Math.sin(t * Math.PI);
                    return {
                        positionBoost: [0, -envelope * 0.015, 0], // Down dip
                        scaleBoost: 1.0 - envelope * 0.015, // Tiny squish
                    };
                },
            },

            // ───────────────────────────────────────────────────────────────
            // FLARE: Combined accent - scale + glow burst
            // Character: The "big" accent for drops/hits
            // ───────────────────────────────────────────────────────────────
            flare: {
                duration: 0.3,
                isAccent: true,
                evaluate: t => {
                    const envelope = Math.sin(t * Math.PI);
                    return {
                        scaleBoost: 1.0 + envelope * 0.03,
                        glowBoost: envelope * 0.25,
                    };
                },
            },

            // ═══════════════════════════════════════════════════════════════════════════
            // ABSOLUTE GESTURES (Original - create their own motion)
            // These compete with groove, use sparingly during dance
            // ═══════════════════════════════════════════════════════════════════════════

            bounce: {
                duration: 1.0,
                evaluate: t => {
                    // Smooth elastic bounce with ease-out
                    // Two bounces: main bounce + smaller secondary
                    const phase = t * Math.PI * 2;
                    const decay = 1 - t * 0.6; // Gradual decay
                    const mainBounce = Math.sin(phase) * decay;
                    const secondaryBounce = Math.sin(phase * 2) * decay * 0.3;
                    const bounce = Math.max(0, mainBounce + secondaryBounce);

                    // Squash and stretch for expressiveness
                    const squash = 1.0 - bounce * 0.08; // Squash when landing
                    const stretch = 1.0 + bounce * 0.05; // Stretch when rising

                    return {
                        position: [0, bounce * 0.35, 0],
                        scale: bounce > 0.5 ? stretch : squash,
                    };
                },
            },
            pulse: {
                duration: 0.6,
                evaluate: t => {
                    const pulse = Math.sin(t * Math.PI);
                    return {
                        scale: 1.0 + pulse * 0.2,
                        glowIntensity: 1.0 + pulse * 0.5,
                    };
                },
            },
            spin: {
                duration: 1.0,
                evaluate: t => ({
                    rotation: [0, t * Math.PI * 2, 0],
                }),
            },
            wobble: {
                duration: 1.0,
                evaluate: t => {
                    const wobble = Math.sin(t * Math.PI * 3);
                    return {
                        rotation: [wobble * 0.3, 0, wobble * 0.2],
                    };
                },
            },
            float: {
                duration: 2.0,
                evaluate: t => {
                    const float = Math.sin(t * Math.PI);
                    return {
                        position: [0, float * 0.3, 0],
                    };
                },
            },
            shake: {
                duration: 0.5,
                evaluate: t => {
                    const shake = Math.sin(t * Math.PI * 6) * (1.0 - t);
                    return {
                        position: [shake * 0.2, 0, 0],
                        rotation: [0, 0, shake * 0.1],
                    };
                },
            },
            // Nod: Tidally locked double-nod toward camera
            // Uses cameraRelativePosition so Z moves toward camera regardless of angle
            nod: {
                duration: 0.5,
                evaluate: t => {
                    // Two quick forward dips (like nodding "yes yes")
                    // First nod: 0-0.4, second nod: 0.4-0.8, settle: 0.8-1.0
                    let forward = 0;
                    if (t < 0.4) {
                        // First nod - full strength
                        const nodT = t / 0.4;
                        forward = Math.sin(nodT * Math.PI) * 0.12;
                    } else if (t < 0.8) {
                        // Second nod - smaller
                        const nodT = (t - 0.4) / 0.4;
                        forward = Math.sin(nodT * Math.PI) * 0.07;
                    }
                    // else: settle back to 0

                    return {
                        // Z in camera-relative = toward camera (tidally locked!)
                        cameraRelativePosition: [0, 0, forward],
                        // Subtle scale accompaniment
                        scale: 1.0 - Math.abs(forward) * 0.3,
                        glowIntensity: 1.0 + Math.abs(forward) * 0.5,
                    };
                },
            },

            // Wiggle: Rapid horizontal shimmy in camera-relative space
            // Like excited shaking side to side (relative to camera view)
            wiggle: {
                duration: 0.4,
                evaluate: t => {
                    // Fast decay
                    const decay = Math.pow(1 - t, 0.6);
                    // Rapid oscillation - left/right shimmy
                    const osc = Math.sin(t * Math.PI * 12) * decay;

                    return {
                        // X in camera-relative = horizontal shimmy (always side-to-side in view)
                        cameraRelativePosition: [osc * 0.04, 0, 0],
                        // Slight scale pulse
                        scale: 1.0 + Math.abs(osc) * 0.03,
                        glowIntensity: 1.0 + Math.abs(osc) * 0.1,
                    };
                },
            },

            // HeadBob: Tidally locked forward bob toward camera
            // Quick dip toward the camera - like a rhythmic head bob
            headBob: {
                duration: 0.3,
                evaluate: t => {
                    // Sharp attack, smooth decay (like head bob on beat)
                    const envelope =
                        t < 0.15
                            ? t / 0.15 // Quick attack
                            : Math.pow(1 - (t - 0.15) / 0.85, 2); // Smooth return

                    const forward = envelope * 0.08; // Move toward camera

                    return {
                        // Z in camera-relative = toward camera (tidally locked!)
                        cameraRelativePosition: [0, 0, forward],
                        // Slight Y dip for weight feel
                        position: [0, -envelope * 0.015, 0],
                        // Scale accompaniment
                        scale: 1.0 - envelope * 0.05,
                        glowIntensity: 1.0 + envelope * 0.15,
                    };
                },
            },

            // Sway: Gentle side-to-side lean with smooth onset
            sway: {
                duration: 1.2,
                evaluate: t => {
                    // Ease-in-out envelope for smooth entry and exit
                    const envelope =
                        t < 0.15
                            ? ((t / 0.15) * t) / 0.15 // Quadratic ease-in at start
                            : t > 0.85
                              ? Math.pow((1 - t) / 0.15, 2) // Quadratic ease-out at end
                              : 1.0;

                    // Smooth sine sway motion
                    const sway = Math.sin(t * Math.PI * 2) * envelope;

                    return {
                        rotation: [0, 0, sway * 0.12],
                        position: [sway * 0.06, 0, 0],
                    };
                },
            },

            // Jump: Quick up movement
            jump: {
                duration: 0.6,
                evaluate: t => {
                    // Parabolic jump (up fast, down slow)
                    const jumpHeight = Math.sin(t * Math.PI);
                    const squash = t < 0.1 ? 1.0 - t * 3 : t > 0.9 ? 1.0 - (1 - t) * 3 : 1.0;
                    return {
                        position: [0, jumpHeight * 0.4, 0],
                        scale: squash,
                    };
                },
            },

            // Twist: Quick Y rotation
            twist: {
                duration: 0.5,
                evaluate: t => {
                    const twist = Math.sin(t * Math.PI * 2) * (1 - t * 0.5);
                    return {
                        rotation: [0, twist * 0.3, 0],
                    };
                },
            },

            // Hula: Circular hip motion
            hula: {
                duration: 1.0,
                evaluate: t => {
                    const phase = t * Math.PI * 2;
                    return {
                        position: [Math.sin(phase) * 0.05, 0, Math.cos(phase) * 0.03],
                        rotation: [0, 0, Math.sin(phase) * 0.05],
                    };
                },
            },

            // Lean: Side-to-side tilt (Z-rotation = always perpendicular to camera view)
            // Enhanced with X-position drift for more natural lean feel
            lean: {
                duration: 0.6,
                evaluate: t => {
                    // Smooth envelope
                    const envelope = Math.sin(t * Math.PI);
                    const lean = envelope;

                    return {
                        // Z-rotation is perpendicular to camera (side tilt)
                        rotation: [0, 0, lean * 0.15],
                        // Drift in direction of lean for weight shift feel
                        position: [lean * 0.04, -Math.abs(lean) * 0.01, 0],
                    };
                },
            },

            // Tilt: Forward nod toward camera (X-rotation + Z-position)
            // Redesigned to feel like "looking up/down" not "bowing"
            tilt: {
                duration: 0.5,
                evaluate: t => {
                    const envelope = Math.sin(t * Math.PI);
                    const tilt = envelope;

                    return {
                        // Primary: Z-position toward camera (forward motion)
                        position: [0, 0, tilt * 0.05],
                        // Secondary: Subtle X-rotation for tilt feel
                        rotation: [tilt * 0.08, 0, 0],
                    };
                },
            },

            // Twitch: Quick small jerk
            twitch: {
                duration: 0.2,
                evaluate: t => {
                    const twitch = (1 - t) * Math.sin(t * Math.PI * 6);
                    return {
                        rotation: [twitch * 0.03, twitch * 0.03, 0],
                    };
                },
            },

            // ═══════════════════════════════════════════════════════════════════════════
            // GLOW-BASED GESTURES (Rate-limited for epilepsy safety)
            // ═══════════════════════════════════════════════════════════════════════════

            // Flash: Quick bright pulse - like a camera flash
            // Safety: Single pulse, no rapid flickering
            flash: {
                duration: 0.3,
                evaluate: t => {
                    // Quick attack, slower decay (like real flash)
                    const flash =
                        t < 0.2
                            ? t / 0.2 // Fast attack
                            : 1 - (t - 0.2) / 0.8; // Slow decay

                    return {
                        glowIntensity: 1.0 + flash * 0.4, // +40% brightness
                        scale: 1.0 + flash * 0.03, // Tiny scale pop
                    };
                },
            },

            // Glow: Gentle sustained brightness increase
            // Warm, soft feel - like embers glowing
            glow: {
                duration: 0.8,
                evaluate: t => {
                    // Smooth bell curve
                    const glow = Math.sin(t * Math.PI);

                    return {
                        glowIntensity: 1.0 + glow * 0.25, // +25% brightness
                        scale: 1.0 + glow * 0.02, // Very subtle scale
                    };
                },
            },

            // Burst: Explosive "toward camera" burst with scale and glow
            // Like an energy release - dramatically moves toward viewer then recoils
            burst: {
                duration: 0.6,
                evaluate: t => {
                    // Phase 1: Explosive forward burst (0-0.15)
                    // Phase 2: Overshoot recoil back (0.15-0.35)
                    // Phase 3: Settle with damped oscillation (0.35-1.0)
                    let forward = 0,
                        scale = 1.0,
                        glow = 1.0;

                    if (t < 0.15) {
                        // Explosive forward burst toward camera
                        const attack = t / 0.15;
                        const eased = 1 - Math.pow(1 - attack, 3); // Ease-out
                        forward = eased * 0.15; // Surge toward camera
                        scale = 1.0 + eased * 0.2;
                        glow = 1.0 + eased * 0.5;
                    } else if (t < 0.35) {
                        // Recoil back past origin
                        const recoilT = (t - 0.15) / 0.2;
                        const bounce = Math.sin(recoilT * Math.PI);
                        forward = 0.15 * (1 - recoilT * 1.5); // Go past zero
                        scale = 1.0 + 0.2 * (1 - recoilT) - bounce * 0.1;
                        glow = 1.0 + (1 - recoilT) * 0.4;
                    } else {
                        // Damped settle
                        const settleT = (t - 0.35) / 0.65;
                        const decay = Math.pow(1 - settleT, 2);
                        const ring = Math.sin(settleT * Math.PI * 2) * decay;
                        forward = ring * 0.03;
                        scale = 1.0 + ring * 0.05;
                        glow = 1.0 + Math.abs(ring) * 0.15;
                    }

                    return {
                        // Dramatic forward/back motion in camera-relative space
                        cameraRelativePosition: [0, 0, forward],
                        scale,
                        glowIntensity: glow,
                    };
                },
            },

            // Flicker: Subtle rapid shimmer - like candlelight
            // Safe rate: 2 flickers over duration (not strobing)
            flicker: {
                duration: 0.6,
                evaluate: t => {
                    // Envelope to prevent hard start/stop
                    const envelope = Math.sin(t * Math.PI);
                    // Two gentle flickers (safe rate)
                    const flicker = Math.sin(t * Math.PI * 4) * envelope;

                    return {
                        glowIntensity: 1.0 + flicker * 0.15, // ±15% flicker
                        scale: 1.0 + flicker * 0.01, // Barely perceptible scale
                    };
                },
            },
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
                rotation: [0, t * Math.PI * 0.5, 0],
            }),
        };
    }

    /**
     * Start animation
     */
    startAnimation(animation, callbacks) {
        this.animations.push({
            ...animation,
            startTime: this.time,
            callbacks: callbacks || {},
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
     * Stop only emotion animations, preserving gestures
     * Emotion animations don't have a gestureName property
     */
    stopEmotions() {
        // Keep gestures (have gestureName), remove emotions (no gestureName)
        this.animations = this.animations.filter(anim => anim.gestureName);
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
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
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
                    glowIntensity: 1.0 + breathe * 0.1,
                };
            },
        };
    }

    /**
     * Check if any animation is playing
     */
    isPlaying() {
        return this.animations.length > 0;
    }
}
