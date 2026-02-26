/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *                      ◐ ◑ ◒ ◓  SLEEP MANAGER  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview SleepManager - Sleep/Wake State Management
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module SleepManager
 * @complexity ⭐⭐ Moderate (State management with animations)
 * @audience Modify this when changing sleep/wake transitions or animations
 * @see docs/architecture/emotive-renderer-refactoring.md for extraction details
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Manages sleep/wake state transitions for the Emotive mascot. Handles smooth
 * ║ animations for entering sleep mode (eye closing + dimming) and waking up
 * ║ (brightening + eye opening). Also manages wake jitter effect and sleep Z's.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 😴 RESPONSIBILITIES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Enter sleep mode with animated transition
 * │ • Wake up from sleep with animated transition
 * │ • Animate eye closing during sleep entry
 * │ • Animate eye opening during wake up
 * │ • Manage sleep dimming and scaling effects
 * │ • Handle wake jitter effect
 * │ • Delegate sleep Z's rendering to SpecialEffects
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎬 ANIMATION PHASES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ Sleep Entry (3 seconds total):
 * │   1. Eye closing (2s) - eyeOpenness: 1.0 → 0.1
 * │   2. Dimming (1s)     - sleepDimness: 1.0 → 0.6, sleepScale: 1.0 → 0.9
 * │
 * │ Wake Up (1.7 seconds total):
 * │   1. Brightening (0.5s) - sleepDimness: 0.6 → 1.0, sleepScale: 0.9 → 1.0
 * │   2. Eye opening (1s)   - eyeOpenness: 0.1 → 1.0
 * │   3. Wake jitter (0.2s) - Quick shake effect
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

import { animationLoopManager, AnimationPriority } from '../AnimationLoopManager.js';

/**
 * SleepManager - Manages sleep/wake state transitions and animations
 */
export class SleepManager {
    /**
     * @param {Object} renderer - Reference to parent EmotiveRenderer
     */
    constructor(renderer) {
        this.renderer = renderer;

        // Animation loop callback IDs
        this.loopCallbackIds = {
            eyeClose: null,
            eyeOpen: null,
        };

        // Wake jitter timeout
        this.wakeJitterTimeout = null;
    }

    /**
     * Enter sleep mode with animation
     * - Sets sleeping state to true
     * - Resets sleep Z's array
     * - Initializes eye openness and dimming values
     * - Starts eye closing animation
     */
    enterSleepMode() {
        this.renderer.state.sleeping = true;
        this.renderer.sleepZ = []; // Reset Z's
        this.renderer.state.eyeOpenness = 1.0; // Start with eyes open

        // Initialize dimming values (start at full brightness)
        this.renderer.state.sleepDimness = 1.0;
        this.renderer.state.sleepScale = 1.0;

        // Force end any active blink
        this.renderer.state.blinking = false;

        // Animate eye closing, then dimming
        this.animateEyeClose();
    }

    /**
     * Animate eye closing for sleep, then dim
     * Two-phase animation:
     * 1. Close eyes (2 seconds) - eyeOpenness: 1.0 → 0.1
     * 2. Dim orb (1 second) - sleepDimness: 1.0 → 0.6, sleepScale: 1.0 → 0.9
     * @private
     */
    animateEyeClose() {
        // Cancel any existing eye animations
        if (this.loopCallbackIds.eyeClose) {
            animationLoopManager.unregister(this.loopCallbackIds.eyeClose);
            this.loopCallbackIds.eyeClose = null;
        }
        if (this.loopCallbackIds.eyeOpen) {
            animationLoopManager.unregister(this.loopCallbackIds.eyeOpen);
            this.loopCallbackIds.eyeOpen = null;
        }

        const startTime = performance.now();
        const eyeCloseDuration = 2000; // 2 seconds to close eyes
        const dimDuration = 1000; // 1 second to dim after eyes close

        const animate = () => {
            if (!this.renderer.state.sleeping) {
                // Clean up loop callback ID
                this.loopCallbackIds.eyeClose = null;
                return; // Stop if woken up
            }

            const elapsed = performance.now() - startTime;

            if (elapsed < eyeCloseDuration) {
                // Phase 1: Close eyes
                const progress = elapsed / eyeCloseDuration;
                const eased = 1 - Math.pow(progress, 2);
                this.renderer.state.eyeOpenness = 0.1 + eased * 0.9; // Close to 0.1 (nearly closed)

                // Keep full brightness during eye closing
                this.renderer.state.sleepDimness = 1.0;
                this.renderer.state.sleepScale = 1.0;

                // Continue animation on next frame
            } else if (elapsed < eyeCloseDuration + dimDuration) {
                // Phase 2: Dim the orb
                const dimProgress = (elapsed - eyeCloseDuration) / dimDuration;
                const dimEased = 1 - Math.pow(1 - dimProgress, 3); // Ease out cubic

                // Keep eyes closed
                this.renderer.state.eyeOpenness = 0.1;

                // Animate dimming and scaling
                this.renderer.state.sleepDimness = 1.0 - dimEased * 0.4; // Dim to 0.6
                this.renderer.state.sleepScale = 1.0 - dimEased * 0.1; // Scale to 0.9

                // Continue animation on next frame
            } else {
                // Final state
                this.renderer.state.eyeOpenness = 0.1;
                this.renderer.state.sleepDimness = 0.6;
                this.renderer.state.sleepScale = 0.9;
                // Clean up loop callback ID
                this.loopCallbackIds.eyeClose = null;
            }
        };

        // Register with AnimationLoopManager
        this.loopCallbackIds.eyeClose = animationLoopManager.register(
            animate,
            AnimationPriority.HIGH, // Eye animations are high priority
            this.renderer
        );
    }

    /**
     * Wake up from sleep with animation
     * - Resets sleeping state and breathing parameters
     * - Clears sleep Z's array
     * - Resets blinking state
     * - Starts eye opening animation
     * - Triggers wake jitter effect
     */
    wakeUp() {
        if (!this.renderer.state.sleeping) return;

        this.renderer.state.sleeping = false;
        this.renderer.state.breathRate = 1.0;
        this.renderer.state.breathDepth = this.renderer.config.breathingDepth;
        this.renderer.sleepZ = []; // Clear Z's

        // Reset blinking state
        this.renderer.state.blinking = false;
        // Blinking now handled by EyeRenderer
        this.renderer.eyeRenderer.blinking = false;
        this.renderer.eyeRenderer.blinkTimer = 0;

        // Animate eye opening
        this.animateEyeOpen();

        // Clear any existing jitter timeout
        if (this.wakeJitterTimeout) {
            clearTimeout(this.wakeJitterTimeout);
        }

        // Quick shake animation
        this.renderer.state.coreJitter = true;
        this.wakeJitterTimeout = setTimeout(() => {
            this.renderer.state.coreJitter = false;
            this.wakeJitterTimeout = null;
        }, 200);
    }

    /**
     * Animate eye opening after wake - brighten first, then open eyes
     * Two-phase animation:
     * 1. Brighten orb (0.5s) - sleepDimness: 0.6 → 1.0, sleepScale: 0.9 → 1.0
     * 2. Open eyes (1s) - eyeOpenness: 0.1 → 1.0
     * @private
     */
    animateEyeOpen() {
        // Cancel any existing eye animations
        if (this.loopCallbackIds.eyeOpen) {
            animationLoopManager.unregister(this.loopCallbackIds.eyeOpen);
            this.loopCallbackIds.eyeOpen = null;
        }
        if (this.loopCallbackIds.eyeClose) {
            animationLoopManager.unregister(this.loopCallbackIds.eyeClose);
            this.loopCallbackIds.eyeClose = null;
        }

        const startTime = performance.now();
        const brightenDuration = 500; // 0.5 seconds to brighten
        const eyeOpenDuration = 1000; // 1 second to open eyes

        const animate = () => {
            const elapsed = performance.now() - startTime;

            if (elapsed < brightenDuration) {
                // Phase 1: Brighten the orb
                const progress = elapsed / brightenDuration;
                const eased = Math.sin((progress * Math.PI) / 2); // Smooth acceleration

                // Animate brightening and scaling back
                this.renderer.state.sleepDimness = 0.6 + eased * 0.4; // Brighten from 0.6 to 1.0
                this.renderer.state.sleepScale = 0.9 + eased * 0.1; // Scale from 0.9 to 1.0

                // Keep eyes closed during brightening
                this.renderer.state.eyeOpenness = 0.1;

                // Continue animation on next frame
            } else if (elapsed < brightenDuration + eyeOpenDuration) {
                // Phase 2: Open eyes
                const eyeProgress = (elapsed - brightenDuration) / eyeOpenDuration;
                const eyeEased = Math.sin((eyeProgress * Math.PI) / 2); // Smooth acceleration

                // Keep full brightness
                this.renderer.state.sleepDimness = 1.0;
                this.renderer.state.sleepScale = 1.0;

                // Animate eye opening
                this.renderer.state.eyeOpenness = 0.1 + eyeEased * 0.9; // Open from 0.1 to 1.0

                // Continue animation on next frame
            } else {
                // Final state
                this.renderer.state.eyeOpenness = 1.0;
                this.renderer.state.sleepDimness = 1.0;
                this.renderer.state.sleepScale = 1.0;
                // Clean up loop callback ID
                this.loopCallbackIds.eyeOpen = null;
            }
        };

        // Register with AnimationLoopManager
        this.loopCallbackIds.eyeOpen = animationLoopManager.register(
            animate,
            AnimationPriority.HIGH, // Eye animations are high priority
            this.renderer
        );
    }

    /**
     * Render sleep indicator (Z's) with cell-shaded style and gradient fade
     * Delegates to SpecialEffects for actual rendering
     * @param {number} x - X position for sleep indicator
     * @param {number} y - Y position for sleep indicator
     * @param {number} deltaTime - Time elapsed since last frame
     * @returns {*} Result from SpecialEffects.renderSleepIndicator
     */
    renderSleepIndicator(x, y, deltaTime) {
        return this.renderer.specialEffects.renderSleepIndicator(x, y, deltaTime);
    }

    /**
     * Clean up resources
     * Called when the renderer is being destroyed
     */
    cleanup() {
        // Unregister animation loop callbacks
        if (this.loopCallbackIds.eyeClose) {
            animationLoopManager.unregister(this.loopCallbackIds.eyeClose);
            this.loopCallbackIds.eyeClose = null;
        }
        if (this.loopCallbackIds.eyeOpen) {
            animationLoopManager.unregister(this.loopCallbackIds.eyeOpen);
            this.loopCallbackIds.eyeOpen = null;
        }

        // Clear wake jitter timeout
        if (this.wakeJitterTimeout) {
            clearTimeout(this.wakeJitterTimeout);
            this.wakeJitterTimeout = null;
        }
    }
}
