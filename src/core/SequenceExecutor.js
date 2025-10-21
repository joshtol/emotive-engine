/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview SequenceExecutor - Timeline-based Sequence Execution
 * @author Emotive Engine Team
 * @version 3.0.0
 * @module SequenceExecutor
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Executes multi-step performance sequences with precise timing. Handles emotion,
 * ║ gesture, morph, chain, and sound actions along a timeline.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

export class SequenceExecutor {
    constructor(options = {}) {
        this.mascot = options.mascot || null;
        this.eventManager = options.eventManager || null;

        // Active sequences
        this.activeSequences = new Map();
        this.nextSequenceId = 1;

        // Performance options
        this.defaultDelay = options.defaultDelay || 0;
        this.allowConcurrent = options.allowConcurrent !== false;
    }

    /**
     * Execute a performance sequence
     * @param {Array<Object>} steps - Sequence steps
     * @param {Object} options - Execution options
     * @returns {Promise<void>}
     */
    async execute(steps, options = {}) {
        if (!Array.isArray(steps) || steps.length === 0) {
            return;
        }

        const mascot = options.mascot || this.mascot;
        if (!mascot) {
            console.warn('[SequenceExecutor] No mascot instance available');
            return;
        }

        // Cancel existing sequences if not allowing concurrent
        if (!this.allowConcurrent && this.activeSequences.size > 0) {
            this.cancelAll();
        }

        // Create sequence ID
        const sequenceId = this.nextSequenceId++;

        // Sort steps by timestamp
        const sortedSteps = [...steps].sort((a, b) => a.at - b.at);

        // Create cancellation token
        const cancellationToken = {
            cancelled: false
        };

        this.activeSequences.set(sequenceId, cancellationToken);

        try {
            // Emit start event
            if (this.eventManager) {
                this.eventManager.emit('sequenceStart', {
                    sequenceId,
                    steps: sortedSteps,
                    timestamp: Date.now()
                });
            }

            // Execute sequence
            await this.executeSteps(sortedSteps, mascot, cancellationToken, options);

            // Emit complete event
            if (this.eventManager) {
                this.eventManager.emit('sequenceComplete', {
                    sequenceId,
                    timestamp: Date.now()
                });
            }
        } catch (error) {
            console.error('[SequenceExecutor] Sequence execution error:', error);

            if (this.eventManager) {
                this.eventManager.emit('sequenceError', {
                    sequenceId,
                    error,
                    timestamp: Date.now()
                });
            }
        } finally {
            this.activeSequences.delete(sequenceId);
        }
    }

    /**
     * Execute sequence steps
     * @param {Array<Object>} steps - Sorted steps
     * @param {Object} mascot - Mascot instance
     * @param {Object} cancellationToken - Cancellation token
     * @param {Object} options - Options including intensity
     * @private
     */
    async executeSteps(steps, mascot, cancellationToken, options) {
        let lastTimestamp = 0;

        for (const step of steps) {
            // Check cancellation
            if (cancellationToken.cancelled) {
                break;
            }

            // Calculate delay from last step
            const delay = step.at - lastTimestamp;

            // Wait if needed
            if (delay > 0) {
                await this.sleep(delay, cancellationToken);
            }

            // Check cancellation again after delay
            if (cancellationToken.cancelled) {
                break;
            }

            // Execute step
            await this.executeStep(step, mascot, options);

            lastTimestamp = step.at;
        }
    }

    /**
     * Execute a single step
     * @param {Object} step - Step definition
     * @param {Object} mascot - Mascot instance
     * @param {Object} options - Options including intensity
     * @private
     */
    executeStep(step, mascot, options) {
        const { action, value, intensity, options: stepOptions } = step;

        try {
            switch (action) {
            case 'emotion':
                if (typeof mascot.setEmotion === 'function') {
                    const emotionIntensity = intensity !== undefined ? intensity : options.intensity;
                    const duration = stepOptions?.duration || options.emotionDuration || 500;
                    mascot.setEmotion(value, emotionIntensity !== undefined ? emotionIntensity : duration);
                }
                break;

            case 'gesture':
                if (typeof mascot.express === 'function') {
                    mascot.express(value, stepOptions);
                }
                break;

            case 'morph':
                if (typeof mascot.morphTo === 'function') {
                    mascot.morphTo(value, stepOptions);
                }
                break;

            case 'chain':
                if (typeof mascot.chain === 'function') {
                    mascot.chain(value, stepOptions);
                }
                break;

            case 'sound':
                if (typeof mascot.playSound === 'function') {
                    mascot.playSound(value, stepOptions);
                }
                break;

            default:
                console.warn(`[SequenceExecutor] Unknown action: ${action}`);
            }

            // Emit step executed event
            if (this.eventManager) {
                this.eventManager.emit('stepExecuted', {
                    action,
                    value,
                    timestamp: Date.now()
                });
            }
        } catch (error) {
            console.error('[SequenceExecutor] Error executing step:', step, error);
        }
    }

    /**
     * Sleep with cancellation support
     * @param {number} ms - Milliseconds to sleep
     * @param {Object} cancellationToken - Cancellation token
     * @returns {Promise<void>}
     * @private
     */
    sleep(ms, cancellationToken) {
        return new Promise(resolve => {
            const timeout = setTimeout(() => {
                resolve();
            }, ms);

            // Allow cancellation to resolve early
            if (cancellationToken) {
                const checkInterval = setInterval(() => {
                    if (cancellationToken.cancelled) {
                        clearTimeout(timeout);
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 50);

                // Clean up interval when timeout completes
                setTimeout(() => {
                    clearInterval(checkInterval);
                }, ms);
            }
        });
    }

    /**
     * Cancel a specific sequence
     * @param {number} sequenceId - Sequence ID
     */
    cancel(sequenceId) {
        const token = this.activeSequences.get(sequenceId);
        if (token) {
            token.cancelled = true;
            this.activeSequences.delete(sequenceId);

            if (this.eventManager) {
                this.eventManager.emit('sequenceCancelled', {
                    sequenceId,
                    timestamp: Date.now()
                });
            }
        }
    }

    /**
     * Cancel all active sequences
     */
    cancelAll() {
        this.activeSequences.forEach((token, sequenceId) => {
            token.cancelled = true;

            if (this.eventManager) {
                this.eventManager.emit('sequenceCancelled', {
                    sequenceId,
                    timestamp: Date.now()
                });
            }
        });

        this.activeSequences.clear();
    }

    /**
     * Get active sequence count
     * @returns {number} Number of active sequences
     */
    getActiveCount() {
        return this.activeSequences.size;
    }

    /**
     * Check if any sequences are active
     * @returns {boolean} True if sequences are active
     */
    isActive() {
        return this.activeSequences.size > 0;
    }

    /**
     * Set the mascot instance
     * @param {Object} mascot - Mascot instance
     */
    setMascot(mascot) {
        this.mascot = mascot;
    }
}

export default SequenceExecutor;
