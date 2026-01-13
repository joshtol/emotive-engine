/**
 * SleepWakeManager
 *
 * Manages sleep and wake sequences with animations.
 * Handles:
 * - Sleep entry sequence (yawn → sway → sleep)
 * - Wake sequence (stretch → blink → shake)
 * - Renderer sleep/wake state updates
 * - Idle behavior synchronization
 * - Sleep state tracking
 * - Event emission
 *
 * @module SleepWakeManager
 */
export class SleepWakeManager {
    /**
     * Create SleepWakeManager
     *
     * @param {Object} deps - Dependencies
     * @param {Object} deps.errorBoundary - Error handling wrapper
     * @param {Function} deps.express - Express emotion/gesture function
     * @param {Object} [deps.idleBehavior] - Idle behavior controller
     * @param {Object} [deps.renderer] - Renderer instance
     * @param {Object} deps.state - Shared state with sleeping property
     * @param {Function} deps.emit - Event emission function
     * @param {Object} [deps.chainTarget] - Return value for method chaining
     *
     * @example
     * // New DI style:
     * new SleepWakeManager({ errorBoundary, express, idleBehavior, renderer, state, emit })
     *
     * // Legacy style:
     * new SleepWakeManager(mascot)
     */
    constructor(deps) {
        if (deps && deps.errorBoundary && deps.express && deps.state !== undefined && deps.emit) {
            // New DI style
            this.errorBoundary = deps.errorBoundary;
            this._express = deps.express;
            this.idleBehavior = deps.idleBehavior || null;
            this.renderer = deps.renderer || null;
            this._state = deps.state;
            this._emit = deps.emit;
            this._chainTarget = deps.chainTarget || this;
        } else {
            // Legacy: deps is mascot
            const mascot = deps;
            this.errorBoundary = mascot.errorBoundary;
            this._express = gesture => mascot.express(gesture);
            this.idleBehavior = mascot.idleBehavior;
            this.renderer = mascot.renderer;
            this._state = {
                get sleeping() { return mascot.sleeping; },
                set sleeping(v) { mascot.sleeping = v; }
            };
            this._emit = (event, data) => mascot.emit(event, data);
            this._chainTarget = mascot;
            this._legacyMode = true;
        }
    }

    /**
     * Enter sleep state with animation sequence
     * @returns {Promise<Object>} Chain target for method chaining
     */
    sleep() {
        return this.errorBoundary.wrap(async () => {
            if (this._state.sleeping) {
                // Already sleeping
                return this._chainTarget;
            }

            await this.performSleepSequence();
            this.enterSleepState();

            return this._chainTarget;
        }, 'sleep', this._chainTarget)();
    }

    /**
     * Perform sleep animation sequence
     * @returns {Promise<void>}
     */
    async performSleepSequence() {
        // First: Yawn
        this._express('yawn');
        await this.delay(1000);

        // Second: Drowsy sway
        this._express('sway');
        await this.delay(1000);
    }

    /**
     * Enter sleep state
     */
    enterSleepState() {
        // Set sleep flag
        this._state.sleeping = true;

        // Update renderer
        if (this.renderer && this.renderer.enterSleepMode) {
            this.renderer.enterSleepMode();
        }

        // Update idle behavior
        if (this.idleBehavior && this.idleBehavior.enterSleep) {
            this.idleBehavior.enterSleep();
        }

        // Emit sleep event
        this._emit('sleep');
    }

    /**
     * Wake up from sleep state with animation sequence
     * @returns {Promise<Object>} Chain target for method chaining
     */
    wake() {
        return this.errorBoundary.wrap(async () => {
            if (!this._state.sleeping) {
                // Not currently sleeping
                return this._chainTarget;
            }

            this.exitSleepState();
            await this.performWakeSequence();

            return this._chainTarget;
        }, 'wake', this._chainTarget)();
    }

    /**
     * Exit sleep state
     */
    exitSleepState() {
        // Clear sleep flag first
        this._state.sleeping = false;

        // Update renderer
        if (this.renderer && this.renderer.wakeUp) {
            this.renderer.wakeUp();
        }

        // Update idle behavior
        if (this.idleBehavior && this.idleBehavior.wakeUp) {
            this.idleBehavior.wakeUp();
        }
    }

    /**
     * Perform wake animation sequence
     * @returns {Promise<void>}
     */
    async performWakeSequence() {
        // First: Stretch
        this._express('stretch');
        await this.delay(1000);

        // Second: Slow blink
        this._express('slowBlink');
        await this.delay(1000);

        // Third: Small shake to fully wake
        this._express('shake');
        await this.delay(500);

        // Emit wake event
        this._emit('wake');
    }

    /**
     * Delay helper
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise<void>}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
