/**
 * DebugProfilingManager - Debug Reporting and Performance Profiling
 *
 * Manages debug reporting, performance profiling, and memory snapshots.
 *
 * @module DebugProfilingManager
 */

import { emotiveDebugger, runtimeCapabilities } from '../../utils/debugger.js';

export class DebugProfilingManager {
    /**
     * Create DebugProfilingManager
     *
     * @param {Object} deps - Dependencies
     * @param {Object} deps.diagnosticsManager - Diagnostics manager instance
     * @param {Object} deps.state - Shared state with debugMode
     */
    constructor(deps) {
        this.diagnosticsManager = deps.diagnosticsManager;
        this._state = deps.state || { debugMode: false };
    }

    /**
     * Get comprehensive debug report
     * @returns {Object} Debug report including all system states
     */
    getDebugReport() {
        return this.diagnosticsManager.getDebugReport();
    }

    /**
     * Export debug data for external analysis
     * @returns {Object} Exportable debug data
     */
    exportDebugData() {
        return this.diagnosticsManager.exportDebugData();
    }

    /**
     * Start profiling a named operation
     * @param {string} name - Profile name
     * @param {Object} metadata - Additional metadata
     */
    startProfiling(name, metadata = {}) {
        if (this._state.debugMode) {
            emotiveDebugger.startProfile(name, metadata);
        }
    }

    /**
     * End profiling and get results
     * @param {string} name - Profile name
     * @returns {Object|null} Profile results
     */
    endProfiling(name) {
        if (this._state.debugMode) {
            return emotiveDebugger.endProfile(name);
        }
        return null;
    }

    /**
     * Take a memory snapshot
     * @param {string} label - Snapshot label
     */
    takeMemorySnapshot(label) {
        if (this._state.debugMode) {
            emotiveDebugger.takeMemorySnapshot(label);
        }
    }

    /**
     * Clear all debug data
     */
    clearDebugData() {
        emotiveDebugger.clear();
        if (this._state.debugMode) {
            emotiveDebugger.log('INFO', 'Debug data cleared');
        }
    }

    /**
     * Get runtime performance capabilities
     * @returns {Object} Runtime capabilities report
     */
    getRuntimeCapabilities() {
        return runtimeCapabilities.generateReport();
    }
}
