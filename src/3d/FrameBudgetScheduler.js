/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Frame Budget Scheduler
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Spreads expensive work across frames by monitoring frame time
 * and backing off after budget overruns.
 *
 * Supports both synchronous and asynchronous work items:
 *   - Sync items execute immediately when budget allows, then enter cooldown
 *   - Async items (returning a Promise) block the scheduler until resolved,
 *     then enter cooldown — prevents overlapping heavy async completions
 *
 * Work items are atomic and cannot be interrupted mid-execution.
 * A single work item (e.g. 8-15ms factory call) WILL overshoot the 16.67ms budget.
 * The scheduler prevents cascading dropped frames by spacing work items apart:
 *   - Only attempts work when the frame had budget to spare
 *   - Enters cooldown after each item to let the browser recover
 *   - Result: isolated single-frame micro-stutters instead of sustained chug
 *
 * @module 3d/FrameBudgetScheduler
 */

export class FrameBudgetScheduler {
    /**
     * @param {Object} [options]
     * @param {number} [options.budgetMs=12] - Max frame time to allow work.
     *   If the last frame exceeded this, skip. Default 12ms leaves ~4.67ms
     *   margin for browser compositing within a 16.67ms frame budget.
     * @param {number} [options.cooldownFrames=3] - Frames to skip after executing
     *   a work item. Gives the browser time to recover from the overshoot.
     */
    constructor({ budgetMs = 12, cooldownFrames = 3 } = {}) {
        /** @type {Function[]} */
        this._queue = [];
        this._budgetMs = budgetMs;
        this._cooldownFrames = cooldownFrames;
        this._cooldownRemaining = 0;
        this._drained = false;
        this._awaitingAsync = false;

        /** Called once when the queue empties (and no async in-flight) */
        this.onDrain = null;
    }

    /**
     * Add a work item to the queue.
     * @param {Function} fn - Function to execute when budget allows.
     *   May return a Promise for async work (e.g. model loading).
     */
    enqueue(fn) {
        this._queue.push(fn);
        this._drained = false;
    }

    /**
     * Add multiple work items at once.
     * @param {Function[]} fns
     */
    enqueueAll(fns) {
        for (let i = 0; i < fns.length; i++) {
            this._queue.push(fns[i]);
        }
        this._drained = false;
    }

    /**
     * Called once per frame after rendering. Executes the next work item
     * only if the frame had budget to spare and cooldown has elapsed.
     *
     * For async work items (returning a Promise), the scheduler blocks
     * until the promise resolves before processing the next item.
     * This prevents overlapping synchronous post-completion work
     * (e.g. GLB parse + shader compile from concurrent model fetches).
     *
     * @param {number} frameTimeMs - Time spent on this frame's render work
     */
    tick(frameTimeMs) {
        // Waiting for async work to complete — don't process anything
        if (this._awaitingAsync) return;

        if (!this._queue.length) {
            if (!this._drained) {
                this._drained = true;
                if (this.onDrain) this.onDrain();
            }
            return;
        }

        // Cooldown in effect — count down and skip
        if (this._cooldownRemaining > 0) {
            this._cooldownRemaining--;
            return;
        }

        // Frame was already too expensive — don't add more work
        if (frameTimeMs > this._budgetMs) return;

        // Budget available — execute one work item
        const fn = this._queue.shift();
        try {
            const result = fn();

            // Async work item — wait for completion before next item
            if (result && typeof result.then === 'function') {
                this._awaitingAsync = true;
                result.then(
                    () => {
                        this._awaitingAsync = false;
                        this._cooldownRemaining = this._cooldownFrames;
                    },
                    e => {
                        console.warn('[FrameBudgetScheduler] Async work item rejected:', e);
                        this._awaitingAsync = false;
                        this._cooldownRemaining = this._cooldownFrames;
                    }
                );
            } else {
                // Sync work item — enter cooldown immediately
                this._cooldownRemaining = this._cooldownFrames;
            }
        } catch (e) {
            console.warn('[FrameBudgetScheduler] Work item threw:', e);
            this._cooldownRemaining = this._cooldownFrames;
        }
    }

    /** Number of items remaining in the queue */
    get pending() {
        return this._queue.length;
    }

    /** Whether the queue has been fully drained */
    get isDrained() {
        return this._drained && !this._awaitingAsync;
    }

    /** Clear all pending work without executing it */
    clear() {
        this._queue.length = 0;
        this._cooldownRemaining = 0;
        // Note: cannot cancel in-flight async work, but new items won't start
    }

    /** Reset scheduler state completely */
    destroy() {
        this.clear();
        this.onDrain = null;
        this._drained = false;
        this._awaitingAsync = false;
    }
}
