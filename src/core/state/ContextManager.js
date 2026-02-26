/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview ContextManager - Context-Aware Performance Adjustment
 * @author Emotive Engine Team
 * @version 3.0.0
 * @module ContextManager
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Manages conversation context (frustration, urgency, magnitude) to enable
 * ║ context-aware intensity adjustments for semantic performances.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

export class ContextManager {
    constructor(options = {}) {
        // Current context state
        this.context = {
            frustration: 0, // 0-100 scale
            urgency: 'medium', // low | medium | high
            magnitude: 'moderate', // small | moderate | major | epic
            customValues: {}, // User-defined context values
        };

        // History tracking
        this.enableHistory = options.enableHistory !== false;
        this.historyLimit = options.historyLimit || 50;
        this.history = [];

        // Context decay settings
        this.enableDecay = options.enableDecay !== false;
        this.frustrationDecayRate = options.frustrationDecayRate || 5; // Points per interval
        this.decayInterval = options.decayInterval || 10000; // 10 seconds
        this.decayTimer = null;

        // Start decay timer if enabled
        if (this.enableDecay) {
            this.startDecayTimer();
        }
    }

    /**
     * Update context values
     * @param {Object} updates - Context updates
     * @param {number} [updates.frustration] - Frustration level (0-100)
     * @param {string} [updates.urgency] - Urgency level (low/medium/high)
     * @param {string} [updates.magnitude] - Magnitude (small/moderate/major/epic)
     * @param {Object} [updates.custom] - Custom context values
     */
    update(updates = {}) {
        const previousContext = { ...this.context };

        // Update frustration (0-100 range)
        if (updates.frustration !== undefined) {
            this.context.frustration = Math.max(0, Math.min(100, updates.frustration));
        }

        // Update urgency
        if (updates.urgency !== undefined) {
            const validUrgency = ['low', 'medium', 'high'];
            if (validUrgency.includes(updates.urgency)) {
                this.context.urgency = updates.urgency;
            } else {
                console.warn(`[ContextManager] Invalid urgency: ${updates.urgency}`);
            }
        }

        // Update magnitude
        if (updates.magnitude !== undefined) {
            const validMagnitude = ['small', 'moderate', 'major', 'epic'];
            if (validMagnitude.includes(updates.magnitude)) {
                this.context.magnitude = updates.magnitude;
            } else {
                console.warn(`[ContextManager] Invalid magnitude: ${updates.magnitude}`);
            }
        }

        // Update custom values
        if (updates.custom !== undefined) {
            this.context.customValues = {
                ...this.context.customValues,
                ...updates.custom,
            };
        }

        // Track in history if enabled
        if (this.enableHistory) {
            this.addToHistory(previousContext, this.context, updates);
        }

        // Restart decay timer
        if (this.enableDecay) {
            this.restartDecayTimer();
        }
    }

    /**
     * Increment frustration level
     * @param {number} amount - Amount to increment (default: 10)
     */
    incrementFrustration(amount = 10) {
        this.update({ frustration: this.context.frustration + amount });
    }

    /**
     * Decrement frustration level
     * @param {number} amount - Amount to decrement (default: 10)
     */
    decrementFrustration(amount = 10) {
        this.update({ frustration: this.context.frustration - amount });
    }

    /**
     * Reset frustration to zero
     */
    resetFrustration() {
        this.update({ frustration: 0 });
    }

    /**
     * Set urgency level
     * @param {string} level - Urgency level (low/medium/high)
     */
    setUrgency(level) {
        this.update({ urgency: level });
    }

    /**
     * Set magnitude level
     * @param {string} level - Magnitude (small/moderate/major/epic)
     */
    setMagnitude(level) {
        this.update({ magnitude: level });
    }

    /**
     * Set custom context value
     * @param {string} key - Custom key
     * @param {*} value - Custom value
     */
    setCustom(key, value) {
        this.update({
            custom: {
                [key]: value,
            },
        });
    }

    /**
     * Get current context
     * @returns {Object} Current context
     */
    getContext() {
        return { ...this.context };
    }

    /**
     * Get specific context value
     * @param {string} key - Context key
     * @returns {*} Context value
     */
    get(key) {
        if (key in this.context) {
            return this.context[key];
        }
        return this.context.customValues[key];
    }

    /**
     * Calculate intensity adjustment based on context
     * @param {number} baseIntensity - Base intensity (0-1)
     * @param {Object} options - Calculation options
     * @returns {number} Adjusted intensity (0-1)
     */
    calculateIntensity(baseIntensity = 0.5, options = {}) {
        let intensity = baseIntensity;

        // Frustration adjustment (up to +0.3)
        if (options.useFrustration !== false) {
            const frustrationBoost = (this.context.frustration / 100) * 0.3;
            intensity += frustrationBoost;
        }

        // Urgency adjustment
        if (options.useUrgency !== false) {
            const urgencyBoost = {
                low: -0.1,
                medium: 0,
                high: 0.2,
            };
            intensity += urgencyBoost[this.context.urgency] || 0;
        }

        // Magnitude adjustment
        if (options.useMagnitude !== false) {
            const magnitudeBoost = {
                small: -0.1,
                moderate: 0,
                major: 0.15,
                epic: 0.3,
            };
            intensity += magnitudeBoost[this.context.magnitude] || 0;
        }

        // Apply custom intensity multiplier if provided
        if (options.intensityMultiplier !== undefined) {
            intensity *= options.intensityMultiplier;
        }

        // Clamp to valid range
        return Math.max(0, Math.min(1, intensity));
    }

    /**
     * Add entry to context history
     * @param {Object} previousContext - Previous context state
     * @param {Object} newContext - New context state
     * @param {Object} updates - Updates applied
     * @private
     */
    addToHistory(previousContext, newContext, updates) {
        const entry = {
            timestamp: Date.now(),
            previous: previousContext,
            current: { ...newContext },
            updates,
            delta: {
                frustration: newContext.frustration - previousContext.frustration,
                urgency: newContext.urgency !== previousContext.urgency ? newContext.urgency : null,
                magnitude:
                    newContext.magnitude !== previousContext.magnitude
                        ? newContext.magnitude
                        : null,
            },
        };

        this.history.push(entry);

        // Trim history if exceeds limit
        if (this.history.length > this.historyLimit) {
            this.history.shift();
        }
    }

    /**
     * Get context history
     * @param {number} limit - Number of entries to return (default: all)
     * @returns {Array<Object>} History entries
     */
    getHistory(limit) {
        if (limit) {
            return this.history.slice(-limit);
        }
        return [...this.history];
    }

    /**
     * Clear context history
     */
    clearHistory() {
        this.history = [];
    }

    /**
     * Start frustration decay timer
     * @private
     */
    startDecayTimer() {
        this.decayTimer = setInterval(() => {
            if (this.context.frustration > 0) {
                const newFrustration = Math.max(
                    0,
                    this.context.frustration - this.frustrationDecayRate
                );
                this.update({ frustration: newFrustration });
            }
        }, this.decayInterval);
    }

    /**
     * Restart decay timer
     * @private
     */
    restartDecayTimer() {
        if (this.decayTimer) {
            clearInterval(this.decayTimer);
            this.startDecayTimer();
        }
    }

    /**
     * Stop decay timer
     */
    stopDecay() {
        if (this.decayTimer) {
            clearInterval(this.decayTimer);
            this.decayTimer = null;
        }
    }

    /**
     * Reset all context to defaults
     */
    reset() {
        this.context = {
            frustration: 0,
            urgency: 'medium',
            magnitude: 'moderate',
            customValues: {},
        };

        if (this.enableHistory) {
            this.addToHistory({}, this.context, { action: 'reset' });
        }
    }

    /**
     * Get context analytics
     * @returns {Object} Analytics data
     */
    getAnalytics() {
        if (!this.enableHistory || this.history.length === 0) {
            return null;
        }

        const frustrationLevels = this.history.map(h => h.current.frustration);
        const avgFrustration =
            frustrationLevels.reduce((sum, val) => sum + val, 0) / frustrationLevels.length;
        const maxFrustration = Math.max(...frustrationLevels);
        const minFrustration = Math.min(...frustrationLevels);

        const urgencyCounts = this.history.reduce((acc, h) => {
            acc[h.current.urgency] = (acc[h.current.urgency] || 0) + 1;
            return acc;
        }, {});

        const magnitudeCounts = this.history.reduce((acc, h) => {
            acc[h.current.magnitude] = (acc[h.current.magnitude] || 0) + 1;
            return acc;
        }, {});

        return {
            current: { ...this.context },
            frustration: {
                current: this.context.frustration,
                average: avgFrustration,
                max: maxFrustration,
                min: minFrustration,
            },
            urgency: {
                current: this.context.urgency,
                distribution: urgencyCounts,
            },
            magnitude: {
                current: this.context.magnitude,
                distribution: magnitudeCounts,
            },
            historyLength: this.history.length,
            firstUpdate: this.history[0]?.timestamp,
            lastUpdate: this.history[this.history.length - 1]?.timestamp,
        };
    }

    /**
     * Destroy the context manager
     */
    destroy() {
        this.stopDecay();
        this.history = [];
        this.context = null;
    }
}

export default ContextManager;
