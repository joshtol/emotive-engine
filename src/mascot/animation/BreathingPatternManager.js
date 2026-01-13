/**
 * BreathingPatternManager
 *
 * Manages breathing patterns and presets for the mascot.
 * Handles:
 * - Custom breathing pattern configuration
 * - Preset breathing patterns (calm, anxious, meditative, deep, sleep)
 * - Breathing animation lifecycle
 * - Pattern validation and state management
 *
 * @module BreathingPatternManager
 */
export class BreathingPatternManager {
    /**
     * Create BreathingPatternManager
     *
     * @param {Object} deps - Dependencies
     * @param {Object} deps.errorBoundary - Error handling wrapper
     * @param {Object} [deps.renderer] - Renderer instance
     * @param {Object} deps.state - Shared state with breathePattern, breathingAnimationId
     * @param {Function} deps.startBreathingAnimation - Function to start breathing animation
     * @param {Object} [deps.chainTarget] - Return value for method chaining
     *
     * @example
     * // New DI style:
     * new BreathingPatternManager({ errorBoundary, renderer, state, startBreathingAnimation })
     *
     * // Legacy style:
     * new BreathingPatternManager(mascot)
     */
    constructor(deps) {
        if (deps && deps.errorBoundary && deps.state !== undefined && deps.startBreathingAnimation) {
            // New DI style
            this.errorBoundary = deps.errorBoundary;
            this.renderer = deps.renderer || null;
            this._state = deps.state;
            this._startBreathingAnimation = deps.startBreathingAnimation;
            this._chainTarget = deps.chainTarget || this;
        } else {
            // Legacy: deps is mascot
            const mascot = deps;
            this.errorBoundary = mascot.errorBoundary;
            this.renderer = mascot.renderer;
            this._state = {
                get breathePattern() { return mascot.breathePattern; },
                set breathePattern(v) { mascot.breathePattern = v; },
                get breathingAnimationId() { return mascot.breathingAnimationId; },
                set breathingAnimationId(v) { mascot.breathingAnimationId = v; }
            };
            this._startBreathingAnimation = () => mascot.startBreathingAnimation();
            this._chainTarget = mascot;
            this._legacyMode = true;
        }
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
        return this.errorBoundary.wrap(() => {
            // Calculate total cycle time
            const totalCycle = inhale + hold1 + exhale + hold2;

            // Store pattern for custom animation
            this._state.breathePattern = {
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
            this._startBreathingAnimation();

            return this._chainTarget;
        }, 'setBreathePattern', this._chainTarget)();
    }

    /**
     * Applies a preset breathing pattern
     * @param {string} type - Preset type: 'calm', 'anxious', 'meditative', 'deep', 'sleep'
     * @returns {EmotiveMascot} Mascot instance for chaining
     */
    breathe(type = 'calm') {
        return this.errorBoundary.wrap(() => {
            const presets = BreathingPatternManager.getPresets();
            const pattern = presets[type] || presets.calm;
            return this.setBreathePattern(pattern.inhale, pattern.hold1, pattern.exhale, pattern.hold2);
        }, 'breathe', this._chainTarget)();
    }

    /**
     * Stops any active breathing animation
     * @returns {EmotiveMascot} Mascot instance for chaining
     */
    stopBreathing() {
        return this.errorBoundary.wrap(() => {
            if (this._state.breathingAnimationId) {
                cancelAnimationFrame(this._state.breathingAnimationId);
                this._state.breathingAnimationId = null;
            }

            this._state.breathePattern = null;

            // Reset scale
            if (this.renderer && this.renderer.setCustomScale) {
                this.renderer.setCustomScale(1.0);
            }

            return this._chainTarget;
        }, 'stopBreathing', this._chainTarget)();
    }
}
