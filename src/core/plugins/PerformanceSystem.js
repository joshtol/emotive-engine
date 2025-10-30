/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview PerformanceSystem - Semantic Performance Orchestrator
 * @author Emotive Engine Team
 * @version 3.0.0
 * @module PerformanceSystem
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Translates semantic AI intents (celebrate, empathize, guide) into choreographed
 * ║ animation sequences. Enables developers to write `perform('celebrate')` instead
 * ║ of manually orchestrating emotion, gesture, timing, and effects.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

import { PERFORMANCES } from '../performances/index.js';

export class PerformanceSystem {
    constructor(options = {}) {
        this.performances = new Map();
        this.contextManager = null;
        this.sequenceExecutor = null;
        this.eventManager = options.eventManager || null;

        // Performance options
        this.defaultIntensity = options.defaultIntensity || 0.7;
        this.enableContextAdjustment = options.enableContextAdjustment !== false;
        this.enableAnalytics = options.enableAnalytics || false;

        // Analytics
        this.performanceHistory = [];
        this.maxHistorySize = options.maxHistorySize || 100;

        // Load built-in performances
        this.loadBuiltInPerformances();
    }

    /**
     * Load built-in performance definitions
     */
    loadBuiltInPerformances() {
        Object.entries(PERFORMANCES).forEach(([name, definition]) => {
            this.definePerformance(name, definition);
        });
    }

    /**
     * Define a custom performance
     * @param {string} name - Performance name
     * @param {Object} definition - Performance definition
     */
    definePerformance(name, definition) {
        this.performances.set(name, {
            ...definition,
            name
        });

        if (this.eventManager) {
            this.eventManager.emit('performanceDefined', { name, definition });
        }
    }

    /**
     * Get a performance definition
     * @param {string} name - Performance name
     * @returns {Object|null} Performance definition
     */
    getPerformance(name) {
        return this.performances.get(name) || null;
    }

    /**
     * Check if a performance is defined
     * @param {string} name - Performance name
     * @returns {boolean}
     */
    hasPerformance(name) {
        return this.performances.has(name);
    }

    /**
     * Execute a semantic performance
     * @param {string} semanticAction - Semantic action name (e.g., 'celebrate', 'empathize')
     * @param {Object} options - Performance options
     * @param {Object} options.context - Context (frustration, urgency, magnitude)
     * @param {number} options.intensity - Manual intensity override
     * @param {Object} options.timing - Timing overrides
     * @returns {Promise<void>}
     */
    async perform(semanticAction, options = {}) {
        const performance = this.getPerformance(semanticAction);

        if (!performance) {
            console.warn(`[PerformanceSystem] Unknown performance: ${semanticAction}`);
            return;
        }

        // Calculate context-aware intensity
        const intensity = this.calculateIntensity(performance, options);

        // Build execution context
        const executionContext = {
            performance,
            semanticAction,
            intensity,
            options,
            timestamp: Date.now()
        };

        // Record analytics
        if (this.enableAnalytics) {
            this.recordPerformance(executionContext);
        }

        // Emit start event
        if (this.eventManager) {
            this.eventManager.emit('performanceStart', executionContext);
        }

        try {
            // Execute the performance
            if (this.sequenceExecutor && performance.sequence) {
                // Complex sequence
                await this.sequenceExecutor.execute(performance.sequence, {
                    intensity,
                    ...options
                });
            } else {
                // Simple performance (emotion + gesture)
                await this.executeSimplePerformance(performance, intensity, options);
            }

            // Emit complete event
            if (this.eventManager) {
                this.eventManager.emit('performanceComplete', executionContext);
            }
        } catch (error) {
            console.error(`[PerformanceSystem] Error executing ${semanticAction}:`, error);

            if (this.eventManager) {
                this.eventManager.emit('performanceError', {
                    ...executionContext,
                    error
                });
            }
        }
    }

    /**
     * Execute a simple performance (emotion + gesture)
     * @param {Object} performance - Performance definition
     * @param {number} intensity - Intensity value
     * @param {Object} options - Additional options
     * @private
     */
    async executeSimplePerformance(performance, intensity, options) {
        const { emotion, gesture, delay = 0 } = performance;

        // Get mascot instance from options
        const mascot = options.mascot || this.mascot;

        if (!mascot) {
            console.warn('[PerformanceSystem] No mascot instance available');
            return;
        }

        // Set emotion
        if (emotion && typeof mascot.setEmotion === 'function') {
            const duration = options.emotionDuration !== undefined
                ? options.emotionDuration
                : performance.emotionDuration || 500;

            mascot.setEmotion(emotion, duration);
        }

        // Trigger gesture after delay
        if (gesture && typeof mascot.express === 'function') {
            if (delay > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }

            mascot.express(gesture);
        }
    }

    /**
     * Calculate context-aware intensity
     * @param {Object} performance - Performance definition
     * @param {Object} options - Options including context
     * @returns {number} Calculated intensity (0-1)
     */
    calculateIntensity(performance, options) {
        // Manual override
        if (options.intensity !== undefined) {
            return Math.max(0, Math.min(1, options.intensity));
        }

        // Use performance base intensity
        let intensity = performance.baseIntensity || this.defaultIntensity;

        // Apply context adjustments
        if (this.enableContextAdjustment && options.context) {
            const {context} = options;

            // Frustration increases intensity
            if (context.frustration !== undefined) {
                const frustrationBoost = (context.frustration / 100) * 0.3;
                intensity += frustrationBoost;
            }

            // Urgency increases intensity
            if (context.urgency === 'high') {
                intensity += 0.2;
            } else if (context.urgency === 'medium') {
                intensity += 0.1;
            }

            // Magnitude affects intensity for feedback performances
            if (context.magnitude === 'epic') {
                intensity = 1.0;
            } else if (context.magnitude === 'major') {
                intensity = Math.max(intensity, 0.9);
            }
        }

        // Clamp to valid range
        return Math.max(0, Math.min(1, intensity));
    }

    /**
     * Record performance for analytics
     * @param {Object} executionContext - Execution context
     * @private
     */
    recordPerformance(executionContext) {
        this.performanceHistory.push({
            action: executionContext.semanticAction,
            intensity: executionContext.intensity,
            context: executionContext.options.context || {},
            timestamp: executionContext.timestamp
        });

        // Limit history size
        if (this.performanceHistory.length > this.maxHistorySize) {
            this.performanceHistory.shift();
        }
    }

    /**
     * Get performance analytics
     * @returns {Object} Analytics data
     */
    getAnalytics() {
        if (!this.enableAnalytics) {
            return { enabled: false };
        }

        const total = this.performanceHistory.length;
        const byAction = {};
        const avgIntensity = {};

        this.performanceHistory.forEach(record => {
            if (!byAction[record.action]) {
                byAction[record.action] = 0;
                avgIntensity[record.action] = [];
            }
            byAction[record.action]++;
            avgIntensity[record.action].push(record.intensity);
        });

        // Calculate averages
        Object.keys(avgIntensity).forEach(action => {
            const values = avgIntensity[action];
            avgIntensity[action] = values.reduce((a, b) => a + b, 0) / values.length;
        });

        return {
            enabled: true,
            total,
            byAction,
            avgIntensity,
            history: this.performanceHistory.slice(-20) // Last 20
        };
    }

    /**
     * Clear analytics history
     */
    clearAnalytics() {
        this.performanceHistory = [];
    }

    /**
     * Set the mascot instance
     * @param {Object} mascot - Mascot instance
     */
    setMascot(mascot) {
        this.mascot = mascot;
    }

    /**
     * Set the context manager
     * @param {Object} contextManager - Context manager instance
     */
    setContextManager(contextManager) {
        this.contextManager = contextManager;
    }

    /**
     * Set the sequence executor
     * @param {Object} sequenceExecutor - Sequence executor instance
     */
    setSequenceExecutor(sequenceExecutor) {
        this.sequenceExecutor = sequenceExecutor;
    }

    /**
     * List all available performances
     * @returns {Array<string>} Performance names
     */
    listPerformances() {
        return Array.from(this.performances.keys());
    }

    /**
     * Get performance metadata
     * @param {string} name - Performance name
     * @returns {Object|null} Performance metadata
     */
    getPerformanceMetadata(name) {
        const performance = this.getPerformance(name);
        if (!performance) return null;

        return {
            name: performance.name,
            category: performance.category || 'custom',
            emotion: performance.emotion,
            gesture: performance.gesture,
            hasSequence: !!performance.sequence,
            baseIntensity: performance.baseIntensity || this.defaultIntensity,
            description: performance.description || ''
        };
    }
}

export default PerformanceSystem;
