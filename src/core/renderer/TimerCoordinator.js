/**
 * TimerCoordinator
 *
 * Coordinates frame-based timer updates for animations.
 * Handles:
 * - Breathing animation updates with emotion-specific modifiers
 * - Blinking animation updates with state-based enabling
 * - Special breathing patterns (zen, sleeping)
 * - Irregular breathing for nervous/tired states
 */
export class TimerCoordinator {
    constructor(renderer) {
        this.renderer = renderer;
    }

    /**
     * Update all animation timers
     * @param {number} deltaTime - Time elapsed since last frame
     */
    updateTimers(deltaTime) {
        this.updateBreathing(deltaTime);
        this.updateBlinking(deltaTime);
        // Note: Idle detection is handled by IdleBehavior.js, not here
    }

    /**
     * Update breathing animation with emotion-specific modifiers
     * @param {number} deltaTime - Time elapsed since last frame
     */
    updateBreathing(deltaTime) {
        // Update breathing animation via BreathingAnimator
        this.renderer.breathingAnimator.update(
            deltaTime,
            this.renderer.state.emotion,
            this.renderer.currentUndertone
        );

        // Apply special breathing modifiers based on emotion
        if (this.renderer.state.emotion === 'zen') {
            this.applyZenBreathing();
        } else if (this.renderer.state.sleeping) {
            this.applySleepBreathing();
        } else {
            this.applyNormalBreathing();
        }

        // Apply irregular breathing for nervous/tired
        this.renderer.breathingAnimator.setIrregularBreathing(this.renderer.state.breathIrregular);
    }

    /**
     * Apply zen meditation breathing pattern
     */
    applyZenBreathing() {
        this.renderer.breathingAnimator.setBreathRateMultiplier(0.15);
        this.renderer.breathingAnimator.setBreathDepthMultiplier(2.5);
    }

    /**
     * Apply sleep breathing pattern
     */
    applySleepBreathing() {
        this.renderer.breathingAnimator.setBreathRateMultiplier(0.5);
        this.renderer.breathingAnimator.setBreathDepthMultiplier(1.2);
    }

    /**
     * Apply normal breathing pattern
     */
    applyNormalBreathing() {
        this.renderer.breathingAnimator.setBreathRateMultiplier(1.0);
        this.renderer.breathingAnimator.setBreathDepthMultiplier(1.0);
    }

    /**
     * Update blinking animation
     * @param {number} deltaTime - Time elapsed since last frame
     */
    updateBlinking(deltaTime) {
        // Update blinking via EyeRenderer
        const blinkingEnabled =
            this.renderer.state.blinkingEnabled &&
            !this.renderer.state.sleeping &&
            this.renderer.state.emotion !== 'zen';

        this.renderer.eyeRenderer.setBlinkingEnabled(blinkingEnabled);
        this.renderer.eyeRenderer.update(deltaTime);

        // Sync blinking state back to our state for compatibility
        this.renderer.state.blinking = this.renderer.eyeRenderer.blinking;
    }
}
