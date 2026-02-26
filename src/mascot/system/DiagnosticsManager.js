/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *                    ◐ ◑ ◒ ◓  DIAGNOSTICS MANAGER  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview DiagnosticsManager - Debug, Performance, and Compatibility Manager
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module DiagnosticsManager
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Centralizes diagnostics, debugging, performance monitoring, and browser
 * ║ compatibility reporting. Provides unified API for accessing system health
 * ║ and troubleshooting information.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🔍 RESPONSIBILITIES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Browser compatibility detection and reporting
 * │ • Performance metrics aggregation
 * │ • Degradation level management
 * │ • Debug report generation
 * │ • Debug data export for external analysis
 * │ • Performance analytics access
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

import { browserCompatibility } from '../../utils/browserCompatibility.js';
import { emotiveDebugger, runtimeCapabilities } from '../../utils/debugger.js';

export class DiagnosticsManager {
    /**
     * Create DiagnosticsManager
     *
     * @param {Object} deps - Dependencies
     * @param {Object} deps.errorBoundary - Error handling wrapper
     * @param {Object} [deps.degradationManager] - Degradation manager instance
     * @param {Object} deps.animationController - Animation controller instance
     * @param {Object} deps.stateMachine - State machine instance
     * @param {Object} [deps.performanceSystem] - Performance system instance
     * @param {Object} deps.config - Configuration object
     * @param {Object} deps.state - Shared state with isRunning, speaking, debugMode properties
     * @param {Function} deps.getCurrentState - Function to get current state
     * @param {Function} deps.getAudioStats - Function to get audio stats
     * @param {Function} deps.getEventStats - Function to get event stats
     * @param {Object} [deps.chainTarget] - Return value for method chaining
     */
    constructor(deps) {
        // Required dependency validation
        if (!deps.errorBoundary) throw new Error('DiagnosticsManager: errorBoundary required');
        if (!deps.animationController)
            throw new Error('DiagnosticsManager: animationController required');
        if (!deps.stateMachine) throw new Error('DiagnosticsManager: stateMachine required');
        if (!deps.config) throw new Error('DiagnosticsManager: config required');
        if (!deps.state) throw new Error('DiagnosticsManager: state required');
        if (!deps.getCurrentState) throw new Error('DiagnosticsManager: getCurrentState required');
        if (!deps.getAudioStats) throw new Error('DiagnosticsManager: getAudioStats required');
        if (!deps.getEventStats) throw new Error('DiagnosticsManager: getEventStats required');

        this.errorBoundary = deps.errorBoundary;
        this.degradationManager = deps.degradationManager || null;
        this.animationController = deps.animationController;
        this.stateMachine = deps.stateMachine;
        this.performanceSystem = deps.performanceSystem || null;
        this.config = deps.config;
        this._state = deps.state;
        this._getCurrentState = deps.getCurrentState;
        this._getAudioStats = deps.getAudioStats;
        this._getEventStats = deps.getEventStats;
        this._chainTarget = deps.chainTarget || this;
    }

    /**
     * Gets browser compatibility information
     * @returns {Object} Browser compatibility details
     */
    getBrowserCompatibility() {
        return {
            browser: browserCompatibility.browser,
            features: browserCompatibility.featureDetection.getFeatures(),
            capabilities: browserCompatibility.capabilities,
            appliedPolyfills: browserCompatibility.appliedPolyfills,
            optimizations: browserCompatibility.browserOptimizations.getOptimizations(),
        };
    }

    /**
     * Gets degradation manager status and settings
     * @returns {Object|null} Degradation manager information or null if disabled
     */
    getDegradationStatus() {
        if (!this.degradationManager) {
            return null;
        }

        return {
            currentLevel: this.degradationManager.getCurrentLevel(),
            availableFeatures: this.degradationManager.getAvailableFeatures(),
            recommendedSettings: this.degradationManager.getRecommendedSettings(),
            performanceStats: this.degradationManager.getPerformanceStats(),
            allLevels: this.degradationManager.getAllLevels(),
        };
    }

    /**
     * Manually set degradation level
     * @param {number|string} level - Degradation level index or name
     * @returns {boolean} True if level was set successfully
     */
    setDegradationLevel(level) {
        if (!this.degradationManager) {
            // Degradation manager is not enabled
            return false;
        }

        return this.degradationManager.setLevel(level);
    }

    /**
     * Get comprehensive debug report
     * @returns {Object} Debug report including all system states
     */
    getDebugReport() {
        const report = {
            timestamp: Date.now(),
            mascot: {
                isRunning: this._state.isRunning,
                speaking: this._state.speaking,
                debugMode: this._state.debugMode,
                config: this.config,
            },

            // System states
            currentState: this._getCurrentState(),
            performanceMetrics: this.getPerformanceMetrics(),
            audioStats: this._getAudioStats(),
            eventStats: this._getEventStats(),

            // Browser compatibility
            browserCompatibility: this.getBrowserCompatibility(),
            degradationStatus: this.getDegradationStatus(),

            // Runtime capabilities
            runtimeCapabilities: runtimeCapabilities.generateReport(),

            // Debugger data
            debuggerReport: emotiveDebugger.getDebugReport(),
        };

        if (this._state.debugMode) {
            emotiveDebugger.log('DEBUG', 'Generated debug report', {
                reportSize: JSON.stringify(report).length,
                sections: Object.keys(report),
            });
        }

        return report;
    }

    /**
     * Export debug data for external analysis
     * @returns {Object} Exportable debug data
     */
    exportDebugData() {
        const data = {
            metadata: {
                exportTime: Date.now(),
                version: '1.0.0', // Should be dynamically set
                userAgent: navigator.userAgent,
                url: window.location?.href,
            },

            mascotState: {
                config: this.config,
                currentState: this._getCurrentState(),
                isRunning: this._state.isRunning,
                speaking: this._state.speaking,
            },

            performance: {
                metrics: this.getPerformanceMetrics(),
                degradationStatus: this.getDegradationStatus(),
                frameTimings: emotiveDebugger.frameTimings,
            },

            compatibility: {
                browser: this.getBrowserCompatibility(),
                runtimeCapabilities: runtimeCapabilities.generateReport(),
            },

            debuggerData: emotiveDebugger.exportDebugData(),
        };

        if (this._state.debugMode) {
            emotiveDebugger.log('INFO', 'Exported debug data', {
                dataSize: JSON.stringify(data).length,
            });
        }

        return data;
    }

    /**
     * Get performance metrics from all subsystems
     * @returns {Object} Aggregated performance metrics
     */
    getPerformanceMetrics() {
        const animationMetrics = this.animationController.getPerformanceMetrics();
        const state = this.stateMachine.getCurrentState();

        return {
            ...animationMetrics,
            currentEmotion: state.emotion,
            currentUndertone: state.undertone,
            isTransitioning: state.isTransitioning,
            errorStats: this.errorBoundary.getErrorStats(),
        };
    }

    /**
     * Get performance analytics (if enabled)
     * @returns {Object|null} Performance analytics data
     */
    getPerformanceAnalytics() {
        return this.errorBoundary.wrap(
            () => {
                if (!this.performanceSystem) {
                    return null;
                }
                return this.performanceSystem.getAnalytics();
            },
            'performance-analytics',
            this._chainTarget
        )();
    }
}
