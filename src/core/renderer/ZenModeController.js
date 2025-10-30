import { animationLoopManager, AnimationPriority } from '../AnimationLoopManager.js';

/**
 * ZenModeController - Manages zen meditation mode transitions and animations
 *
 * Handles the complex multi-phase state machine for entering and exiting zen mode:
 * - Entering: Lotus blooming animation
 * - In: Zen meditation state with gentle vortex
 * - Exiting: 4-phase awakening animation (lotus closing → awakening gestures → expansion → settle)
 *
 * @class ZenModeController
 */
export class ZenModeController {
    /**
     * Create a ZenModeController
     * @param {Object} renderer - Reference to the EmotiveRenderer
     */
    constructor(renderer) {
        this.renderer = renderer;

        // Initialize zen transition state
        this.zenTransition = {
            active: false,
            phase: null, // 'entering', 'in', 'exiting'
            startTime: 0,
            previousEmotion: null,
            targetEmotion: null,
            scaleX: 1.0,
            scaleY: 1.0,
            arcHeight: 0,
            lotusMorph: 0, // 0 = circle, 1 = full lotus
            petalSpread: 0, // 0 = closed, 1 = fully open
            smileCurve: 0  // 0 = straight, 1 = full smile
        };

        // Animation loop callback IDs
        this.loopCallbackIds = {
            zenEnter: null,
            zenExit: null
        };
    }

    /**
     * Get the current zen transition state
     * @returns {Object} Zen transition state
     */
    getZenTransition() {
        return this.zenTransition;
    }

    /**
     * Check if zen mode is active
     * @returns {boolean} True if zen mode is active
     */
    isActive() {
        return this.zenTransition.active;
    }

    /**
     * Check if in zen meditation phase
     * @returns {boolean} True if in meditation phase
     */
    isInZenPhase() {
        return this.zenTransition.active && this.zenTransition.phase === 'in';
    }

    /**
     * Enter zen meditation mode with lotus blooming animation
     * @param {string} targetColor - Target glow color for zen mode
     * @param {number} targetIntensity - Target glow intensity
     */
    enterZenMode(targetColor, targetIntensity) {
        // Cancel any existing zen animations
        this._cancelAnimations();

        // Set to zen color with target intensity
        this.renderer.state.glowColor = targetColor;
        this.renderer.state.glowIntensity = targetIntensity;

        // Cancel any active color transition
        this.renderer.colorTransition.active = false;

        this.zenTransition = {
            active: true,
            phase: 'entering',
            startTime: performance.now(),
            previousEmotion: this.renderer.state.emotion,
            targetEmotion: null,
            scaleX: 1.0,
            scaleY: 1.0,
            arcHeight: 0,
            lotusMorph: 0,     // 0 = no lotus, 1 = full lotus
            petalSpread: 0,    // 0 = closed petals, 1 = full spread
            smileCurve: 0      // 0 = no smile, 1 = full smile
        };

        const animate = () => {
            if (!this.zenTransition.active || this.zenTransition.phase !== 'entering') {
                // Clean up loop callback ID
                this.loopCallbackIds.zenEnter = null;
                return;
            }

            const elapsed = performance.now() - this.zenTransition.startTime;
            const lotusMorphDuration = 400; // 0.4s for lotus to bloom

            if (elapsed < lotusMorphDuration) {
                // Direct lotus blooming
                const lotusProgress = elapsed / lotusMorphDuration;
                const lotusEased = 1 - Math.pow(1 - lotusProgress, 2); // Ease out quad

                // Direct lotus bloom without arc or narrowing
                this.zenTransition.scaleX = 1.0;
                this.zenTransition.scaleY = 1.0;
                this.zenTransition.arcHeight = 0;

                // Morph the lotus shape directly
                this.zenTransition.lotusMorph = lotusEased; // 0 to 100%
                this.zenTransition.petalSpread = lotusEased;

                // Smile appears gradually
                this.zenTransition.smileCurve = Math.sin(lotusProgress * Math.PI / 2);

                // Register with AnimationLoopManager
                this.loopCallbackIds.zenEnter = animationLoopManager.register(
                    animate,
                    AnimationPriority.MEDIUM,
                    this
                );
            } else {
                // Final state - in meditation with full lotus
                this.zenTransition.phase = 'in';
                this.zenTransition.scaleX = 1.0;
                this.zenTransition.scaleY = 1.0;
                this.zenTransition.arcHeight = 0;
                this.zenTransition.lotusMorph = 1.0;
                this.zenTransition.petalSpread = 1.0;
                this.zenTransition.smileCurve = 1.0;

                // Set gentle vortex for zen state
                this.renderer.state.zenVortexIntensity = 1.0;
                this.loopCallbackIds.zenEnter = null;
            }
        };

        // Start animation
        this.loopCallbackIds.zenEnter = animationLoopManager.register(
            animate,
            AnimationPriority.MEDIUM,
            this
        );
    }

    /**
     * Exit zen meditation mode with 4-phase awakening animation:
     * Phase 1: Lotus closing and arc straightening (150ms)
     * Phase 2: Awakening gestures - blink, shake, drift (200ms)
     * Phase 3: Horizontal expansion (200ms)
     * Phase 4: Final settle pulse (100ms)
     *
     * @param {string} targetEmotion - Target emotion to transition to
     * @param {string} targetColor - Target glow color
     * @param {number} targetIntensity - Target glow intensity
     */
    exitZenMode(targetEmotion, targetColor, targetIntensity) {
        if (!this.zenTransition.active || this.zenTransition.phase !== 'in') return;

        // Cancel any existing zen animations
        this._cancelAnimations();

        this.zenTransition.phase = 'exiting';
        this.zenTransition.startTime = performance.now();
        this.zenTransition.targetEmotion = targetEmotion;

        const animate = () => {
            if (!this.zenTransition.active || this.zenTransition.phase !== 'exiting') {
                this.loopCallbackIds.zenExit = null;
                return;
            }

            const elapsed = performance.now() - this.zenTransition.startTime;
            const straightenDuration = 150; // 0.15s
            const awakeDuration = 200; // 0.2s
            const expandDuration = 200; // 0.2s
            const settleDuration = 100; // 0.1s

            if (elapsed < straightenDuration) {
                // Phase 1: Lotus closing and arc straightening
                const progress = elapsed / straightenDuration;
                const eased = 1 - Math.pow(1 - progress, 2);

                // Start color transition at beginning of exit
                if (progress === 0 || !this.renderer.colorTransition.active) {
                    this.renderer.startColorTransition(targetColor, targetIntensity, straightenDuration);
                }

                this.zenTransition.arcHeight = 1.5 * (1 - eased);

                // Close lotus petals quickly
                this.zenTransition.smileCurve = 1.0 * (1 - eased);
                if (progress > 0.3) {
                    const petalProgress = (progress - 0.3) / 0.7;
                    this.zenTransition.petalSpread = 1.0 * (1 - petalProgress);
                }
                if (progress > 0.5) {
                    const morphProgress = (progress - 0.5) / 0.5;
                    this.zenTransition.lotusMorph = 1.0 * (1 - morphProgress);
                }

                this.loopCallbackIds.zenExit = animationLoopManager.register(
                    animate,
                    AnimationPriority.MEDIUM,
                    this
                );
            } else if (elapsed < straightenDuration + awakeDuration) {
                // Phase 2: Awakening gestures
                const awakeProgress = (elapsed - straightenDuration) / awakeDuration;

                // Lotus is fully closed
                this.zenTransition.lotusMorph = 0;
                this.zenTransition.petalSpread = 0;
                this.zenTransition.smileCurve = 0;

                // Slow blink (0-0.2)
                if (awakeProgress < 0.2) {
                    const blinkProg = awakeProgress / 0.2;
                    this.zenTransition.scaleY = 1.0 - (Math.sin(blinkProg * Math.PI) * 0.8);
                }
                // Gentle shake (0.2-0.6)
                else if (awakeProgress < 0.6) {
                    const shakeProg = (awakeProgress - 0.2) / 0.4;
                    this.zenTransition.scaleY = 1.0;
                    this.renderer.state.shakeOffset = Math.sin(shakeProg * Math.PI * 4) * 3;
                }
                // Upward drift with brighten (0.6-1.0)
                else {
                    const driftProg = (awakeProgress - 0.6) / 0.4;
                    this.renderer.state.driftY = -10 * driftProg;
                    this.renderer.state.glowIntensity = 1.0 + (0.5 * driftProg);
                }

                this.loopCallbackIds.zenExit = animationLoopManager.register(
                    animate,
                    AnimationPriority.MEDIUM,
                    this
                );
            } else if (elapsed < straightenDuration + awakeDuration + expandDuration) {
                // Phase 3: Horizontal expansion (sunrise)
                const expandProgress = (elapsed - straightenDuration - awakeDuration) / expandDuration;
                const expandEased = Math.sin(expandProgress * Math.PI / 2);

                this.zenTransition.scaleX = 1.0;
                this.zenTransition.scaleY = 0.2 + (expandEased * 0.8);
                this.renderer.state.driftY = -10 * (1 - expandProgress);
                this.renderer.state.glowIntensity = 1.5 - (0.5 * expandProgress);

                this.loopCallbackIds.zenExit = animationLoopManager.register(
                    animate,
                    AnimationPriority.MEDIUM,
                    this
                );
            } else if (elapsed < straightenDuration + awakeDuration + expandDuration + settleDuration) {
                // Phase 4: Final settle pulse
                const settleProgress = (elapsed - straightenDuration - awakeDuration - expandDuration) / settleDuration;
                const pulse = Math.sin(settleProgress * Math.PI);

                this.zenTransition.scaleX = 1.0 + (pulse * 0.05);
                this.zenTransition.scaleY = 1.0 + (pulse * 0.05);

                this.loopCallbackIds.zenExit = animationLoopManager.register(
                    animate,
                    AnimationPriority.MEDIUM,
                    this
                );
            } else {
                // Complete - reset to normal
                this._resetZenState();
            }
        };

        // Start exit animation
        this.loopCallbackIds.zenExit = animationLoopManager.register(
            animate,
            AnimationPriority.MEDIUM,
            this
        );
    }

    /**
     * Cancel all zen animations
     * @private
     */
    _cancelAnimations() {
        if (this.loopCallbackIds.zenEnter) {
            animationLoopManager.unregister(this.loopCallbackIds.zenEnter);
            this.loopCallbackIds.zenEnter = null;
        }
        if (this.loopCallbackIds.zenExit) {
            animationLoopManager.unregister(this.loopCallbackIds.zenExit);
            this.loopCallbackIds.zenExit = null;
        }
    }

    /**
     * Reset zen state to defaults
     * @private
     */
    _resetZenState() {
        this.zenTransition.active = false;
        this.zenTransition.phase = null;
        this.zenTransition.scaleX = 1.0;
        this.zenTransition.scaleY = 1.0;
        this.zenTransition.arcHeight = 0;
        this.zenTransition.lotusMorph = 0;
        this.zenTransition.petalSpread = 0;
        this.zenTransition.smileCurve = 0;
        this.renderer.state.shakeOffset = 0;
        this.renderer.state.driftY = 0;
        this.loopCallbackIds.zenExit = null;
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this._cancelAnimations();
        this._resetZenState();
    }
}
