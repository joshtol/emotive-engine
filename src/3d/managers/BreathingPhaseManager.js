/**
 * BreathingPhaseManager - Imperative breathing phase animation
 *
 * Provides explicit control over breathing animations for meditation:
 * - breathePhase('inhale', 4) animates scale up over 4 seconds
 * - breathePhase('exhale', 4) animates scale down over 4 seconds
 * - breathePhase('hold', 4) maintains current scale
 *
 * Extracted from Core3DManager to improve separation of concerns.
 *
 * @module 3d/managers/BreathingPhaseManager
 */

/**
 * Scale targets for different phases
 */
const PHASE_SCALES = {
    inhale: 1.3,    // Max inhale size
    exhale: 0.85,   // Min exhale size
    neutral: 1.0    // Default/reset scale
};

/**
 * Duration limits in seconds
 */
const MIN_DURATION = 0.5;
const MAX_DURATION = 30;

export class BreathingPhaseManager {
    constructor() {
        // Current phase state
        this._phase = null;           // 'inhale' | 'hold' | 'exhale' | null
        this._startTime = 0;
        this._duration = 0;           // Duration in ms
        this._startScale = 1.0;
        this._targetScale = 1.0;
        this._currentScale = 1.0;     // Current animated scale
    }

    /**
     * Start a breathing phase animation
     * @param {string} phase - 'inhale' | 'exhale' | 'hold'
     * @param {number} durationSec - Duration in seconds for the animation
     */
    startPhase(phase, durationSec) {
        // Clamp duration to reasonable values
        const duration = Math.max(MIN_DURATION, Math.min(MAX_DURATION, durationSec));

        // Store current scale as starting point
        this._startScale = this._currentScale;
        this._startTime = performance.now();
        this._duration = duration * 1000; // Convert to ms
        this._phase = phase;

        // Set target scale based on phase
        switch (phase) {
        case 'inhale':
            this._targetScale = PHASE_SCALES.inhale;
            break;
        case 'exhale':
            this._targetScale = PHASE_SCALES.exhale;
            break;
        case 'hold':
        default:
            // Hold at current scale - no animation needed
            this._targetScale = this._startScale;
            break;
        }
    }

    /**
     * Stop any active breathing phase animation and reset to neutral scale
     */
    stop() {
        this._phase = null;
        this._currentScale = PHASE_SCALES.neutral;
        this._startScale = PHASE_SCALES.neutral;
        this._targetScale = PHASE_SCALES.neutral;
    }

    /**
     * Check if a breathing phase is currently active
     * @returns {boolean}
     */
    isActive() {
        return this._phase !== null;
    }

    /**
     * Get current phase name
     * @returns {string|null}
     */
    getPhase() {
        return this._phase;
    }

    /**
     * Update breathing phase animation
     * @param {number} _deltaTime - Time since last frame in ms (unused, we use elapsed time)
     * @returns {number} Current breathing phase scale multiplier (1.0 if inactive)
     */
    update(_deltaTime) {
        // If no active phase, return current scale
        if (!this._phase) {
            return this._currentScale;
        }

        const now = performance.now();
        const elapsed = now - this._startTime;

        // Calculate progress (0 to 1)
        const progress = Math.min(1.0, elapsed / this._duration);

        // Use sine easing for natural breathing rhythm
        // sin(0 to π/2) maps 0→1 smoothly, reaches target exactly at end
        // This feels more like natural breathing than cubic easing
        const eased = Math.sin(progress * Math.PI / 2);

        // Interpolate between start and target scale
        this._currentScale = this._startScale +
            (this._targetScale - this._startScale) * eased;

        // Clear phase when complete
        if (progress >= 1.0) {
            this._currentScale = this._targetScale;
            this._phase = null;
        }

        return this._currentScale;
    }

    /**
     * Get current scale multiplier
     * @returns {number}
     */
    getScaleMultiplier() {
        return this._currentScale;
    }

    /**
     * Get current animation state for debugging
     * @returns {Object}
     */
    getState() {
        return {
            phase: this._phase,
            startScale: this._startScale,
            targetScale: this._targetScale,
            currentScale: this._currentScale,
            duration: this._duration,
            isActive: this._phase !== null
        };
    }

    /**
     * Dispose manager (nothing to clean up, but follows pattern)
     */
    dispose() {
        this._phase = null;
    }
}

export default BreathingPhaseManager;
