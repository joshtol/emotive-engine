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
 */
export class SleepWakeManager {
    constructor(mascot) {
        this.mascot = mascot;
    }

    /**
     * Enter sleep state with animation sequence
     * @returns {Promise<EmotiveMascot>} Mascot instance for chaining
     */
    sleep() {
        return this.mascot.errorBoundary.wrap(async () => {
            if (this.mascot.sleeping) {
                // Already sleeping
                return this.mascot;
            }

            await this.performSleepSequence();
            this.enterSleepState();

            return this.mascot;
        }, 'sleep', this.mascot)();
    }

    /**
     * Perform sleep animation sequence
     * @returns {Promise<void>}
     */
    async performSleepSequence() {
        // First: Yawn
        this.mascot.express('yawn');
        await this.delay(1000);

        // Second: Drowsy sway
        this.mascot.express('sway');
        await this.delay(1000);
    }

    /**
     * Enter sleep state
     */
    enterSleepState() {
        // Set sleep flag
        this.mascot.sleeping = true;

        // Update renderer
        if (this.mascot.renderer && this.mascot.renderer.enterSleepMode) {
            this.mascot.renderer.enterSleepMode();
        }

        // Update idle behavior
        if (this.mascot.idleBehavior && this.mascot.idleBehavior.enterSleep) {
            this.mascot.idleBehavior.enterSleep();
        }

        // Emit sleep event
        this.mascot.emit('sleep');
    }

    /**
     * Wake up from sleep state with animation sequence
     * @returns {Promise<EmotiveMascot>} Mascot instance for chaining
     */
    wake() {
        return this.mascot.errorBoundary.wrap(async () => {
            if (!this.mascot.sleeping) {
                // Not currently sleeping
                return this.mascot;
            }

            this.exitSleepState();
            await this.performWakeSequence();

            return this.mascot;
        }, 'wake', this.mascot)();
    }

    /**
     * Exit sleep state
     */
    exitSleepState() {
        // Clear sleep flag first
        this.mascot.sleeping = false;

        // Update renderer
        if (this.mascot.renderer && this.mascot.renderer.wakeUp) {
            this.mascot.renderer.wakeUp();
        }

        // Update idle behavior
        if (this.mascot.idleBehavior && this.mascot.idleBehavior.wakeUp) {
            this.mascot.idleBehavior.wakeUp();
        }
    }

    /**
     * Perform wake animation sequence
     * @returns {Promise<void>}
     */
    async performWakeSequence() {
        // First: Stretch
        this.mascot.express('stretch');
        await this.delay(1000);

        // Second: Slow blink
        this.mascot.express('slowBlink');
        await this.delay(1000);

        // Third: Small shake to fully wake
        this.mascot.express('shake');
        await this.delay(500);

        // Emit wake event
        this.mascot.emit('wake');
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
