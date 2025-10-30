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
     * @param {EmotiveMascot} mascot - Parent mascot instance
     */
    constructor(mascot) {
        this.mascot = mascot;
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
            optimizations: browserCompatibility.browserOptimizations.getOptimizations()
        };
    }

    /**
     * Gets degradation manager status and settings
     * @returns {Object|null} Degradation manager information or null if disabled
     */
    getDegradationStatus() {
        if (!this.mascot.degradationManager) {
            return null;
        }

        return {
            currentLevel: this.mascot.degradationManager.getCurrentLevel(),
            availableFeatures: this.mascot.degradationManager.getAvailableFeatures(),
            recommendedSettings: this.mascot.degradationManager.getRecommendedSettings(),
            performanceStats: this.mascot.degradationManager.getPerformanceStats(),
            allLevels: this.mascot.degradationManager.getAllLevels()
        };
    }

    /**
     * Manually set degradation level
     * @param {number|string} level - Degradation level index or name
     * @returns {boolean} True if level was set successfully
     */
    setDegradationLevel(level) {
        if (!this.mascot.degradationManager) {
            // Degradation manager is not enabled
            return false;
        }

        return this.mascot.degradationManager.setLevel(level);
    }

    /**
     * Get comprehensive debug report
     * @returns {Object} Debug report including all system states
     */
    getDebugReport() {
        const report = {
            timestamp: Date.now(),
            mascot: {
                isRunning: this.mascot.isRunning,
                speaking: this.mascot.speaking,
                debugMode: this.mascot.debugMode,
                config: this.mascot.config
            },

            // System states
            currentState: this.mascot.getCurrentState(),
            performanceMetrics: this.getPerformanceMetrics(),
            audioStats: this.mascot.getAudioStats(),
            eventStats: this.mascot.getEventStats(),

            // Browser compatibility
            browserCompatibility: this.getBrowserCompatibility(),
            degradationStatus: this.getDegradationStatus(),

            // Runtime capabilities
            runtimeCapabilities: runtimeCapabilities.generateReport(),

            // Debugger data
            debuggerReport: emotiveDebugger.getDebugReport()
        };

        if (this.mascot.debugMode) {
            emotiveDebugger.log('DEBUG', 'Generated debug report', {
                reportSize: JSON.stringify(report).length,
                sections: Object.keys(report)
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
                url: window.location?.href
            },

            mascotState: {
                config: this.mascot.config,
                currentState: this.mascot.getCurrentState(),
                isRunning: this.mascot.isRunning,
                speaking: this.mascot.speaking
            },

            performance: {
                metrics: this.getPerformanceMetrics(),
                degradationStatus: this.getDegradationStatus(),
                frameTimings: emotiveDebugger.frameTimings
            },

            compatibility: {
                browser: this.getBrowserCompatibility(),
                runtimeCapabilities: runtimeCapabilities.generateReport()
            },

            debuggerData: emotiveDebugger.exportDebugData()
        };

        if (this.mascot.debugMode) {
            emotiveDebugger.log('INFO', 'Exported debug data', {
                dataSize: JSON.stringify(data).length
            });
        }

        return data;
    }

    /**
     * Get performance metrics from all subsystems
     * @returns {Object} Aggregated performance metrics
     */
    getPerformanceMetrics() {
        const animationMetrics = this.mascot.animationController.getPerformanceMetrics();
        const state = this.mascot.stateMachine.getCurrentState();

        return {
            ...animationMetrics,
            currentEmotion: state.emotion,
            currentUndertone: state.undertone,
            isTransitioning: state.isTransitioning,
            errorStats: this.mascot.errorBoundary.getErrorStats()
        };
    }

    /**
     * Get performance analytics (if enabled)
     * @returns {Object|null} Performance analytics data
     */
    getPerformanceAnalytics() {
        return this.mascot.errorBoundary.wrap(() => {
            if (!this.mascot.performanceSystem) {
                return null;
            }
            return this.mascot.performanceSystem.getAnalytics();
        }, 'performance-analytics', this.mascot)();
    }
}
