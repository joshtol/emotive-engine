/**
 * BreathingAnimationController
 *
 * Controls breathing exercise animations with 4-phase breathing pattern.
 * Handles:
 * - 4-phase breathing cycle (inhale, hold1, exhale, hold2)
 * - Scale animation interpolation
 * - Phase timing and transitions
 * - Animation event emission
 * - Renderer scale application
 *
 * @module BreathingAnimationController
 */
export class BreathingAnimationController {
    /**
     * Create BreathingAnimationController
     *
     * @param {Object} deps - Dependencies
     * @param {Object} [deps.renderer] - Renderer instance
     * @param {Object} deps.state - Shared state with breathePattern, breathingAnimationId, isRunning
     * @param {Function} deps.emit - Event emission function
     *
     * @example
     * // New DI style:
     * new BreathingAnimationController({ renderer, state, emit })
     *
     * // Legacy style:
     * new BreathingAnimationController(mascot)
     */
    constructor(deps) {
        if (deps && deps.emit && deps.state !== undefined && !deps.errorBoundary) {
            // New DI style
            this.renderer = deps.renderer || null;
            this._state = deps.state;
            this._emit = deps.emit;
        } else {
            // Legacy: deps is mascot
            const mascot = deps;
            this.renderer = mascot.renderer;
            this._state = {
                get breathePattern() { return mascot.breathePattern; },
                get breathingAnimationId() { return mascot.breathingAnimationId; },
                set breathingAnimationId(v) { mascot.breathingAnimationId = v; },
                get isRunning() { return mascot.isRunning; }
            };
            this._emit = (event, data) => mascot.emit(event, data);
            this._legacyMode = true;
        }
    }

    /**
     * Start breathing animation with current pattern
     */
    startBreathingAnimation() {
        // Cancel any existing breathing animation
        if (this._state.breathingAnimationId) {
            cancelAnimationFrame(this._state.breathingAnimationId);
        }

        const animate = () => {
            if (!this._state.breathePattern || !this._state.isRunning) return;

            const pattern = this._state.breathePattern;
            const now = Date.now();
            const phaseElapsed = (now - pattern.phaseStartTime) / 1000; // Convert to seconds

            const { scale, nextPhase } = this.calculatePhaseState(pattern, phaseElapsed, now);

            // Update phase
            if (nextPhase !== pattern.currentPhase) {
                pattern.currentPhase = nextPhase;
            }

            // Apply scale to renderer
            this.applyScale(scale);

            // Continue animation
            this._state.breathingAnimationId = requestAnimationFrame(animate);
        };

        // Start with inhale
        this._state.breathePattern.currentPhase = 'inhale';
        this._state.breathePattern.phaseStartTime = Date.now();
        this._emit('inhale-start');
        animate();
    }

    /**
     * Calculate current phase state and scale
     * @param {Object} pattern - Breathing pattern configuration
     * @param {number} phaseElapsed - Time elapsed in current phase (seconds)
     * @param {number} now - Current timestamp
     * @returns {Object} Scale and next phase
     */
    calculatePhaseState(pattern, phaseElapsed, now) {
        let scale = 1.0;
        let nextPhase = pattern.currentPhase;

        switch (pattern.currentPhase) {
        case 'inhale':
            ({ scale, nextPhase } = this.processInhalePhase(pattern, phaseElapsed, now));
            break;

        case 'hold1':
            ({ scale, nextPhase } = this.processHold1Phase(pattern, phaseElapsed, now));
            break;

        case 'exhale':
            ({ scale, nextPhase } = this.processExhalePhase(pattern, phaseElapsed, now));
            break;

        case 'hold2':
            ({ scale, nextPhase } = this.processHold2Phase(pattern, phaseElapsed, now));
            break;
        }

        return { scale, nextPhase };
    }

    /**
     * Process inhale phase
     * @param {Object} pattern - Breathing pattern
     * @param {number} phaseElapsed - Phase elapsed time
     * @param {number} now - Current timestamp
     * @returns {Object} Scale and next phase
     */
    processInhalePhase(pattern, phaseElapsed, now) {
        let scale = 1.0;
        let nextPhase = pattern.currentPhase;

        if (phaseElapsed >= pattern.inhale) {
            nextPhase = 'hold1';
            pattern.phaseStartTime = now;
            this._emit('hold-start', { type: 'post-inhale' });
        } else {
            // Scale up during inhale
            const progress = phaseElapsed / pattern.inhale;
            scale = 1.0 + (0.3 * progress); // Expand to 1.3x
        }

        return { scale, nextPhase };
    }

    /**
     * Process hold1 phase (post-inhale)
     * @param {Object} pattern - Breathing pattern
     * @param {number} phaseElapsed - Phase elapsed time
     * @param {number} now - Current timestamp
     * @returns {Object} Scale and next phase
     */
    processHold1Phase(pattern, phaseElapsed, now) {
        let nextPhase = pattern.currentPhase;
        const scale = 1.3; // Stay expanded

        if (phaseElapsed >= pattern.hold1) {
            nextPhase = 'exhale';
            pattern.phaseStartTime = now;
            this._emit('exhale-start');
        }

        return { scale, nextPhase };
    }

    /**
     * Process exhale phase
     * @param {Object} pattern - Breathing pattern
     * @param {number} phaseElapsed - Phase elapsed time
     * @param {number} now - Current timestamp
     * @returns {Object} Scale and next phase
     */
    processExhalePhase(pattern, phaseElapsed, now) {
        let scale = 1.3;
        let nextPhase = pattern.currentPhase;

        if (phaseElapsed >= pattern.exhale) {
            nextPhase = 'hold2';
            pattern.phaseStartTime = now;
            this._emit('hold-start', { type: 'post-exhale' });
        } else {
            // Scale down during exhale
            const progress = phaseElapsed / pattern.exhale;
            scale = 1.3 - (0.4 * progress); // Contract to 0.9x
        }

        return { scale, nextPhase };
    }

    /**
     * Process hold2 phase (post-exhale)
     * @param {Object} pattern - Breathing pattern
     * @param {number} phaseElapsed - Phase elapsed time
     * @param {number} now - Current timestamp
     * @returns {Object} Scale and next phase
     */
    processHold2Phase(pattern, phaseElapsed, now) {
        let nextPhase = pattern.currentPhase;
        const scale = 0.9; // Stay contracted

        if (phaseElapsed >= pattern.hold2) {
            nextPhase = 'inhale';
            pattern.phaseStartTime = now;
            this._emit('inhale-start');
        }

        return { scale, nextPhase };
    }

    /**
     * Apply scale to renderer
     * @param {number} scale - Scale factor to apply
     */
    applyScale(scale) {
        if (this.renderer && this.renderer.setCustomScale) {
            this.renderer.setCustomScale(scale);
        }
    }
}
