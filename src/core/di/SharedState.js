/**
 * SharedState - Observable state container for cross-manager state
 *
 * Instead of managers reaching into mascot for state like `this.mascot.speaking`,
 * they read from a shared state object. This makes state flow explicit and
 * enables reactive updates.
 *
 * @example
 * // Before (hidden state access):
 * if (this.mascot.speaking) { ... }
 * this.mascot.speaking = true;
 *
 * // After (explicit state):
 * if (this.state.speaking) { ... }
 * this.state.setSpeaking(true);
 */

/**
 * @typedef {Object} SharedState
 * @property {boolean} speaking - Whether TTS/audio is active
 * @property {boolean} isRunning - Whether animation loop is running
 * @property {boolean} debugMode - Whether debug overlay is shown
 * @property {boolean} sleeping - Whether mascot is in sleep state
 * @property {boolean} recording - Whether recording mode is active
 * @property {number} audioLevel - Current audio level (0-1)
 * @property {Object|null} currentModularGesture - Active gesture data
 */

/**
 * Creates a SharedState instance with getters/setters
 *
 * @param {Object} initial - Initial state values
 * @returns {SharedState}
 */
export function createSharedState(initial = {}) {
    const state = {
        speaking: false,
        isRunning: false,
        debugMode: false,
        sleeping: false,
        recording: false,
        audioLevel: 0,
        currentModularGesture: null,
        ...initial,
    };

    const listeners = new Map();

    return {
        // Getters
        get speaking() {
            return state.speaking;
        },
        get isRunning() {
            return state.isRunning;
        },
        get debugMode() {
            return state.debugMode;
        },
        get sleeping() {
            return state.sleeping;
        },
        get recording() {
            return state.recording;
        },
        get audioLevel() {
            return state.audioLevel;
        },
        get currentModularGesture() {
            return state.currentModularGesture;
        },

        // Setters with optional change notification
        setSpeaking(value) {
            const old = state.speaking;
            state.speaking = value;
            if (old !== value) this._notify('speaking', value, old);
        },
        setIsRunning(value) {
            const old = state.isRunning;
            state.isRunning = value;
            if (old !== value) this._notify('isRunning', value, old);
        },
        setDebugMode(value) {
            const old = state.debugMode;
            state.debugMode = value;
            if (old !== value) this._notify('debugMode', value, old);
        },
        setSleeping(value) {
            const old = state.sleeping;
            state.sleeping = value;
            if (old !== value) this._notify('sleeping', value, old);
        },
        setRecording(value) {
            const old = state.recording;
            state.recording = value;
            if (old !== value) this._notify('recording', value, old);
        },
        setAudioLevel(value) {
            const old = state.audioLevel;
            state.audioLevel = value;
            if (old !== value) this._notify('audioLevel', value, old);
        },
        setCurrentModularGesture(value) {
            const old = state.currentModularGesture;
            state.currentModularGesture = value;
            if (old !== value) this._notify('currentModularGesture', value, old);
        },

        // Subscribe to state changes
        onChange(key, callback) {
            if (!listeners.has(key)) {
                listeners.set(key, new Set());
            }
            listeners.get(key).add(callback);
            return () => listeners.get(key).delete(callback);
        },

        // Internal notification
        _notify(key, newValue, oldValue) {
            const keyListeners = listeners.get(key);
            if (keyListeners) {
                keyListeners.forEach(cb => cb(newValue, oldValue));
            }
        },

        // Get raw state object (for debugging)
        toJSON() {
            return { ...state };
        },
    };
}

/**
 * Creates a SharedState from a mascot instance
 * Syncs reads from mascot properties
 *
 * @param {Object} mascot - The EmotiveMascot instance
 * @returns {SharedState}
 */
export function createSharedStateFromMascot(mascot) {
    // Create state that reads from mascot but allows writes
    const state = createSharedState({
        speaking: mascot.speaking || false,
        isRunning: mascot.isRunning || false,
        debugMode: mascot.debugMode || false,
        sleeping: mascot.sleeping || false,
        recording: mascot.recording || false,
        audioLevel: mascot.audioLevel || 0,
        currentModularGesture: mascot.currentModularGesture || null,
    });

    // Sync writes back to mascot (during migration)
    const originalSetSpeaking = state.setSpeaking.bind(state);
    state.setSpeaking = value => {
        mascot.speaking = value;
        originalSetSpeaking(value);
    };

    const originalSetIsRunning = state.setIsRunning.bind(state);
    state.setIsRunning = value => {
        mascot.isRunning = value;
        originalSetIsRunning(value);
    };

    const originalSetDebugMode = state.setDebugMode.bind(state);
    state.setDebugMode = value => {
        mascot.debugMode = value;
        originalSetDebugMode(value);
    };

    const originalSetSleeping = state.setSleeping.bind(state);
    state.setSleeping = value => {
        mascot.sleeping = value;
        originalSetSleeping(value);
    };

    const originalSetRecording = state.setRecording.bind(state);
    state.setRecording = value => {
        mascot.recording = value;
        originalSetRecording(value);
    };

    const originalSetCurrentModularGesture = state.setCurrentModularGesture.bind(state);
    state.setCurrentModularGesture = value => {
        mascot.currentModularGesture = value;
        originalSetCurrentModularGesture(value);
    };

    return state;
}

/**
 * Creates a mock SharedState for testing
 *
 * @param {Object} overrides - State values to override
 * @returns {SharedState}
 */
export function createMockSharedState(overrides = {}) {
    return createSharedState(overrides);
}

export default { createSharedState, createSharedStateFromMascot, createMockSharedState };
