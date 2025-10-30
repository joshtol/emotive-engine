/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *             ◐ ◑ ◒ ◓  DEBUG PROFILING MANAGER  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview DebugProfilingManager - Debug Reporting and Performance Profiling
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module DebugProfilingManager
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Manages debug reporting, performance profiling, and memory snapshots. Provides
 * ║ unified access to debugging tools including emotiveDebugger, runtimeCapabilities,
 * ║ and diagnosticsManager.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🔍 RESPONSIBILITIES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Generate comprehensive debug reports
 * │ • Export debug data for external analysis
 * │ • Profile named operations with timing
 * │ • Take memory snapshots for leak detection
 * │ • Clear accumulated debug data
 * │ • Report runtime capabilities
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

import { emotiveDebugger, runtimeCapabilities } from '../../utils/debugger.js';

export class DebugProfilingManager {
    /**
     * Create DebugProfilingManager
     * @param {EmotiveMascot} mascot - Parent mascot instance
     */
    constructor(mascot) {
        this.mascot = mascot;
    }

    /**
     * Get comprehensive debug report
     * @returns {Object} Debug report including all system states
     *
     * @example
     * const report = mascot.getDebugReport();
     * console.log('Current emotion:', report.emotion);
     * console.log('Performance:', report.performance);
     */
    getDebugReport() {
        return this.mascot.diagnosticsManager.getDebugReport();
    }

    /**
     * Export debug data for external analysis
     * @returns {Object} Exportable debug data
     *
     * @example
     * const data = mascot.exportDebugData();
     * downloadJSON(data, 'emotive-debug-export.json');
     */
    exportDebugData() {
        return this.mascot.diagnosticsManager.exportDebugData();
    }

    /**
     * Start profiling a named operation
     * @param {string} name - Profile name
     * @param {Object} metadata - Additional metadata
     *
     * @example
     * mascot.startProfiling('render-loop', { frame: 123 });
     * // ... perform operation ...
     * const results = mascot.endProfiling('render-loop');
     */
    startProfiling(name, metadata = {}) {
        if (this.mascot.debugMode) {
            emotiveDebugger.startProfile(name, metadata);
        }
    }

    /**
     * End profiling and get results
     * @param {string} name - Profile name
     * @returns {Object|null} Profile results
     *
     * @example
     * mascot.startProfiling('emotion-transition');
     * mascot.setEmotion('excited');
     * const results = mascot.endProfiling('emotion-transition');
     * console.log(`Transition took ${results.duration}ms`);
     */
    endProfiling(name) {
        if (this.mascot.debugMode) {
            return emotiveDebugger.endProfile(name);
        }
        return null;
    }

    /**
     * Take a memory snapshot
     * @param {string} label - Snapshot label
     *
     * @example
     * mascot.takeMemorySnapshot('before-animation');
     * mascot.setEmotion('excited');
     * mascot.takeMemorySnapshot('after-animation');
     * // Compare snapshots to detect leaks
     */
    takeMemorySnapshot(label) {
        if (this.mascot.debugMode) {
            emotiveDebugger.takeMemorySnapshot(label);
        }
    }

    /**
     * Clear all debug data
     *
     * @example
     * mascot.clearDebugData(); // Reset all profiling and debug logs
     */
    clearDebugData() {
        emotiveDebugger.clear();

        if (this.mascot.debugMode) {
            emotiveDebugger.log('INFO', 'Debug data cleared');
        }
    }

    /**
     * Get runtime performance capabilities
     * @returns {Object} Runtime capabilities report
     *
     * @example
     * const capabilities = mascot.getRuntimeCapabilities();
     * console.log('WebGL supported:', capabilities.webgl);
     * console.log('Worker threads:', capabilities.workers);
     */
    getRuntimeCapabilities() {
        return runtimeCapabilities.generateReport();
    }
}
