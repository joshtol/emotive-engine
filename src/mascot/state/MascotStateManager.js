/**
 * MascotStateManager
 *
 * Centralized state management for EmotiveMascot.
 * Consolidates all mutable state properties that were previously scattered
 * across the EmotiveMascot god object.
 *
 * State categories:
 * - Operational: isRunning, debugMode
 * - Speech/Audio: speaking, recording, audioLevel
 * - Behavioral: sleeping, rhythmEnabled
 * - Gesture: currentModularGesture
 * - Breathing: breathePhase, breatheStartTime, orbScale
 * - Utility: warningTimestamps, warningThrottle
 *
 * @module MascotStateManager
 */
export class MascotStateManager {
    /**
     * Create MascotStateManager
     *
     * @param {Object} deps - Dependencies
     * @param {Object} [deps.initialState] - Initial state values
     * @param {Function} [deps.emit] - Event emission function
     */
    constructor(deps = {}) {
        const initial = deps.initialState || {};

        // Operational state
        this._isRunning = initial.isRunning ?? false;
        this._debugMode = initial.debugMode ?? false;

        // Speech/Audio state
        this._speaking = initial.speaking ?? false;
        this._recording = initial.recording ?? false;
        this._audioLevel = initial.audioLevel ?? 0;

        // Behavioral state
        this._sleeping = initial.sleeping ?? false;
        this._rhythmEnabled = initial.rhythmEnabled ?? false;

        // Gesture state
        this._currentModularGesture = initial.currentModularGesture ?? null;

        // Breathing state
        this._breathePhase = initial.breathePhase ?? 'idle';
        this._breatheStartTime = initial.breatheStartTime ?? 0;
        this._orbScale = initial.orbScale ?? 1.0;

        // Utility state
        this._warningTimestamps = initial.warningTimestamps ?? {};
        this._warningThrottle = initial.warningThrottle ?? 5000;

        // Event emission
        this._emit = deps.emit || (() => {});
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // OPERATIONAL STATE
    // ═══════════════════════════════════════════════════════════════════════════

    get isRunning() {
        return this._isRunning;
    }

    set isRunning(value) {
        const changed = this._isRunning !== value;
        this._isRunning = value;
        if (changed) {
            this._emit('stateChange', { property: 'isRunning', value });
        }
    }

    get debugMode() {
        return this._debugMode;
    }

    set debugMode(value) {
        const changed = this._debugMode !== value;
        this._debugMode = value;
        if (changed) {
            this._emit('stateChange', { property: 'debugMode', value });
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SPEECH/AUDIO STATE
    // ═══════════════════════════════════════════════════════════════════════════

    get speaking() {
        return this._speaking;
    }

    set speaking(value) {
        const changed = this._speaking !== value;
        this._speaking = value;
        if (changed) {
            this._emit('stateChange', { property: 'speaking', value });
        }
    }

    get recording() {
        return this._recording;
    }

    set recording(value) {
        const changed = this._recording !== value;
        this._recording = value;
        if (changed) {
            this._emit('stateChange', { property: 'recording', value });
        }
    }

    get audioLevel() {
        return this._audioLevel;
    }

    set audioLevel(value) {
        this._audioLevel = value;
        // Don't emit for audioLevel - too frequent
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // BEHAVIORAL STATE
    // ═══════════════════════════════════════════════════════════════════════════

    get sleeping() {
        return this._sleeping;
    }

    set sleeping(value) {
        const changed = this._sleeping !== value;
        this._sleeping = value;
        if (changed) {
            this._emit('stateChange', { property: 'sleeping', value });
        }
    }

    get rhythmEnabled() {
        return this._rhythmEnabled;
    }

    set rhythmEnabled(value) {
        this._rhythmEnabled = value;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // GESTURE STATE
    // ═══════════════════════════════════════════════════════════════════════════

    get currentModularGesture() {
        return this._currentModularGesture;
    }

    set currentModularGesture(value) {
        this._currentModularGesture = value;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // BREATHING STATE
    // ═══════════════════════════════════════════════════════════════════════════

    get breathePhase() {
        return this._breathePhase;
    }

    set breathePhase(value) {
        this._breathePhase = value;
    }

    get breatheStartTime() {
        return this._breatheStartTime;
    }

    set breatheStartTime(value) {
        this._breatheStartTime = value;
    }

    get orbScale() {
        return this._orbScale;
    }

    set orbScale(value) {
        this._orbScale = value;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // UTILITY STATE
    // ═══════════════════════════════════════════════════════════════════════════

    get warningTimestamps() {
        return this._warningTimestamps;
    }

    set warningTimestamps(value) {
        this._warningTimestamps = value;
    }

    get warningThrottle() {
        return this._warningThrottle;
    }

    set warningThrottle(value) {
        this._warningThrottle = value;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SNAPSHOT/RESTORE
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Get snapshot of all state for debugging
     * @returns {Object} Current state snapshot
     */
    getSnapshot() {
        return {
            isRunning: this._isRunning,
            debugMode: this._debugMode,
            speaking: this._speaking,
            recording: this._recording,
            audioLevel: this._audioLevel,
            sleeping: this._sleeping,
            rhythmEnabled: this._rhythmEnabled,
            currentModularGesture: this._currentModularGesture,
            breathePhase: this._breathePhase,
            breatheStartTime: this._breatheStartTime,
            orbScale: this._orbScale
        };
    }

    /**
     * Reset state to initial values
     */
    reset() {
        this._isRunning = false;
        this._debugMode = false;
        this._speaking = false;
        this._recording = false;
        this._audioLevel = 0;
        this._sleeping = false;
        this._rhythmEnabled = false;
        this._currentModularGesture = null;
        this._breathePhase = 'idle';
        this._breatheStartTime = 0;
        this._orbScale = 1.0;
        this._warningTimestamps = {};
    }
}
