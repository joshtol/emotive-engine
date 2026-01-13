/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *                ◐ ◑ ◒ ◓  EXECUTION LIFECYCLE MANAGER  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview ExecutionLifecycleManager - Manages playback lifecycle (start/stop/pause/resume)
 * @author Emotive Engine Team
 * @module mascot/control/ExecutionLifecycleManager
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Manages the execution lifecycle of the mascot animation system. Controls
 * ║ starting, stopping, pausing, and resuming the animation loop, along with
 * ║ coordinating audio and emitting lifecycle events.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

export class ExecutionLifecycleManager {
    /**
     * Create ExecutionLifecycleManager
     *
     * @param {Object} deps - Dependencies
     * @param {Object} deps.errorBoundary - Error handling wrapper
     * @param {Object} deps.animationController - Animation controller instance
     * @param {Object} deps.visualizationRunner - Visualization runner instance
     * @param {Object} [deps.soundSystem] - Sound system instance
     * @param {Object} deps.state - Shared state with isRunning property
     * @param {Function} deps.emit - Event emission function
     * @param {Object} [deps.chainTarget] - Return value for method chaining
     *
     * @example
     * // New DI style:
     * new ExecutionLifecycleManager({ errorBoundary, animationController, visualizationRunner, soundSystem, state, emit })
     *
     * // Legacy style:
     * new ExecutionLifecycleManager(mascot)
     */
    constructor(deps) {
        // Check for explicit DI style (has _diStyle marker property)
        if (deps && deps._diStyle === true) {
            // New DI style
            this.errorBoundary = deps.errorBoundary;
            this.animationController = deps.animationController;
            this.visualizationRunner = deps.visualizationRunner;
            this.soundSystem = deps.soundSystem || null;
            this._state = deps.state;
            this._emit = deps.emit;
            this._chainTarget = deps.chainTarget || this;
        } else {
            // Legacy: deps is mascot
            const mascot = deps;
            this.errorBoundary = mascot.errorBoundary;
            this.animationController = mascot.animationController;
            this.visualizationRunner = mascot.visualizationRunner;
            this.soundSystem = mascot.soundSystem;
            this._state = {
                get isRunning() { return mascot.isRunning; },
                set isRunning(v) { mascot.isRunning = v; }
            };
            this._emit = (event, data) => mascot.emit(event, data);
            this._chainTarget = mascot;
            this._legacyMode = true;
        }
    }

    /**
     * Starts the animation loop
     * @returns {EmotiveMascot} Mascot instance for chaining
     */
    start() {
        return this.errorBoundary.wrap(() => {
            return this.visualizationRunner.start();
        }, 'start', this._chainTarget)();
    }

    /**
     * Stops the animation loop and cleans up resources
     * @returns {EmotiveMascot} Mascot instance for chaining
     */
    stop() {
        return this.errorBoundary.wrap(() => {
            return this.visualizationRunner.stop();
        }, 'stop', this._chainTarget)();
    }

    /**
     * Pauses the animation loop without full cleanup
     * @returns {EmotiveMascot} Mascot instance for chaining
     */
    pause() {
        return this.errorBoundary.wrap(() => {
            if (!this.animationController.isAnimating()) {
                // EmotiveMascot is not running
                return this._chainTarget;
            }

            // Stop animation controller
            this.animationController.stop();
            this._state.isRunning = false;

            // Pause ambient audio
            if (this.soundSystem && this.soundSystem.isAvailable()) {
                this.soundSystem.stopAmbientTone(200); // Quick fade out
            }

            this._emit('paused');
            // EmotiveMascot paused
            return this._chainTarget;
        }, 'pause', this._chainTarget)();
    }

    /**
     * Resumes the animation loop from paused state
     * @returns {EmotiveMascot} Mascot instance for chaining
     */
    resume() {
        return this.errorBoundary.wrap(() => {
            if (this.animationController.isAnimating()) {
                // EmotiveMascot is already running
                return this._chainTarget;
            }

            // Start animation controller
            this.animationController.start();
            this._state.isRunning = true;

            // Resume ambient audio
            // Update ambient tone based on emotional state - DISABLED (annoying)
            // if (this.soundSystem && this.soundSystem.isAvailable()) {
            //     const currentEmotion = this.stateMachine.getCurrentState().emotion;
            //     this.soundSystem.setAmbientTone(currentEmotion, 200);
            // }

            this._emit('resumed');
            // EmotiveMascot resumed
            return this._chainTarget;
        }, 'resume', this._chainTarget)();
    }

    /**
     * Checks if the mascot is currently running
     * @returns {boolean} True if animation loop is active
     */
    isActive() {
        return this.animationController.isAnimating();
    }
}
