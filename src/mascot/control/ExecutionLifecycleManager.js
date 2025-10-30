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
     * @param {Object} mascot - Reference to parent EmotiveMascot instance
     */
    constructor(mascot) {
        this.mascot = mascot;
    }

    /**
     * Starts the animation loop
     * @returns {EmotiveMascot} Mascot instance for chaining
     */
    start() {
        return this.mascot.errorBoundary.wrap(() => {
            return this.mascot.visualizationRunner.start();
        }, 'start', this.mascot)();
    }

    /**
     * Stops the animation loop and cleans up resources
     * @returns {EmotiveMascot} Mascot instance for chaining
     */
    stop() {
        return this.mascot.errorBoundary.wrap(() => {
            return this.mascot.visualizationRunner.stop();
        }, 'stop', this.mascot)();
    }

    /**
     * Pauses the animation loop without full cleanup
     * @returns {EmotiveMascot} Mascot instance for chaining
     */
    pause() {
        return this.mascot.errorBoundary.wrap(() => {
            if (!this.mascot.animationController.isAnimating()) {
                // EmotiveMascot is not running
                return this.mascot;
            }

            // Stop animation controller
            this.mascot.animationController.stop();
            this.mascot.isRunning = false;

            // Pause ambient audio
            if (this.mascot.soundSystem.isAvailable()) {
                this.mascot.soundSystem.stopAmbientTone(200); // Quick fade out
            }

            this.mascot.emit('paused');
            // EmotiveMascot paused
            return this.mascot;
        }, 'pause', this.mascot)();
    }

    /**
     * Resumes the animation loop from paused state
     * @returns {EmotiveMascot} Mascot instance for chaining
     */
    resume() {
        return this.mascot.errorBoundary.wrap(() => {
            if (this.mascot.animationController.isAnimating()) {
                // EmotiveMascot is already running
                return this.mascot;
            }

            // Start animation controller
            this.mascot.animationController.start();
            this.mascot.isRunning = true;

            // Resume ambient audio
            // Update ambient tone based on emotional state - DISABLED (annoying)
            // if (this.mascot.soundSystem.isAvailable()) {
            //     const currentEmotion = this.mascot.stateMachine.getCurrentState().emotion;
            //     this.mascot.soundSystem.setAmbientTone(currentEmotion, 200);
            // }

            this.mascot.emit('resumed');
            // EmotiveMascot resumed
            return this.mascot;
        }, 'resume', this.mascot)();
    }

    /**
     * Checks if the mascot is currently running
     * @returns {boolean} True if animation loop is active
     */
    isActive() {
        return this.mascot.animationController.isAnimating();
    }
}
