/**
 * BreathingPatternManager
 *
 * Manages breathing patterns and presets for the mascot.
 * Handles:
 * - Custom breathing pattern configuration
 * - Preset breathing patterns (calm, anxious, meditative, deep, sleep)
 * - Breathing animation lifecycle
 * - Pattern validation and state management
 */
export class BreathingPatternManager {
    constructor(mascot) {
        this.mascot = mascot;
    }

    /**
     * Get preset breathing patterns
     * @returns {Object} Preset patterns
     */
    static getPresets() {
        return {
            calm: { inhale: 4, hold1: 0, exhale: 4, hold2: 0 },        // 4-4 breathing
            anxious: { inhale: 2, hold1: 0, exhale: 2, hold2: 0 },    // Quick shallow
            meditative: { inhale: 4, hold1: 7, exhale: 8, hold2: 0 }, // 4-7-8 breathing
            deep: { inhale: 5, hold1: 5, exhale: 5, hold2: 5 },       // Box breathing
            sleep: { inhale: 6, hold1: 0, exhale: 8, hold2: 2 }       // Sleep breathing
        };
    }

    /**
     * Sets a breathing pattern for the orb
     * @param {number} inhale - Inhale duration in seconds
     * @param {number} hold1 - Hold after inhale in seconds
     * @param {number} exhale - Exhale duration in seconds
     * @param {number} hold2 - Hold after exhale in seconds
     * @returns {EmotiveMascot} Mascot instance for chaining
     */
    setBreathePattern(inhale, hold1, exhale, hold2) {
        return this.mascot.errorBoundary.wrap(() => {
            // Calculate total cycle time
            const totalCycle = inhale + hold1 + exhale + hold2;

            // Store pattern for custom animation
            this.mascot.breathePattern = {
                inhale,
                hold1,
                exhale,
                hold2,
                totalCycle,
                currentPhase: 'inhale',
                phaseStartTime: Date.now(),
                phaseProgress: 0
            };

            // Start custom breathing animation
            this.mascot.startBreathingAnimation();

            return this.mascot;
        }, 'setBreathePattern', this.mascot)();
    }

    /**
     * Applies a preset breathing pattern
     * @param {string} type - Preset type: 'calm', 'anxious', 'meditative', 'deep', 'sleep'
     * @returns {EmotiveMascot} Mascot instance for chaining
     */
    breathe(type = 'calm') {
        return this.mascot.errorBoundary.wrap(() => {
            const presets = BreathingPatternManager.getPresets();
            const pattern = presets[type] || presets.calm;
            return this.setBreathePattern(pattern.inhale, pattern.hold1, pattern.exhale, pattern.hold2);
        }, 'breathe', this.mascot)();
    }

    /**
     * Stops any active breathing animation
     * @returns {EmotiveMascot} Mascot instance for chaining
     */
    stopBreathing() {
        return this.mascot.errorBoundary.wrap(() => {
            if (this.mascot.breathingAnimationId) {
                cancelAnimationFrame(this.mascot.breathingAnimationId);
                this.mascot.breathingAnimationId = null;
            }

            this.mascot.breathePattern = null;

            // Reset scale
            if (this.mascot.renderer && this.mascot.renderer.setCustomScale) {
                this.mascot.renderer.setCustomScale(1.0);
            }

            return this.mascot;
        }, 'stopBreathing', this.mascot)();
    }
}
