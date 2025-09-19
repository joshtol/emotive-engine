/**
 * Global State Manager - ES6 Module
 * Centralized state management for the Emotive Engine
 */

class GlobalStateManager {
    constructor() {
        // Core state
        this.state = {
            // Emotion & display
            currentEmotion: 'neutral',
            currentUndertone: '',
            currentShape: 'circle',
            currentTheme: 'night',

            // Audio & rhythm
            soundEnabled: false,
            rhythmActive: false,
            currentBPM: 120,
            currentBPMModifier: 1.0,
            audioContext: null,

            // UI state
            showingFPS: false,
            isRecording: false,
            isBlinking: true,
            gazeEnabled: false,

            // Performance
            lastFrameTime: 0,
            deltaTime: 0,

            // Mascot reference
            mascotInstance: null
        };

        // State change subscribers
        this.subscribers = new Map();
    }

    /**
     * Get a state value
     */
    get(key) {
        return this.state[key];
    }

    /**
     * Set a state value
     */
    set(key, value) {
        const oldValue = this.state[key];

        if (oldValue === value) return;

        this.state[key] = value;
        this.notifySubscribers(key, value, oldValue);
    }

    /**
     * Update multiple state values
     */
    update(updates) {
        Object.entries(updates).forEach(([key, value]) => {
            this.set(key, value);
        });
    }

    /**
     * Subscribe to state changes
     */
    subscribe(key, callback) {
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, new Set());
        }
        this.subscribers.get(key).add(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.subscribers.get(key);
            if (callbacks) {
                callbacks.delete(callback);
            }
        };
    }

    /**
     * Notify subscribers of state change
     */
    notifySubscribers(key, value, oldValue) {
        const callbacks = this.subscribers.get(key);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(value, oldValue, key);
                } catch (error) {
                    console.error(`Subscriber error for ${key}:`, error);
                }
            });
        }
    }

    /**
     * Get all state
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Reset state to defaults
     */
    reset() {
        this.state = {
            currentEmotion: 'neutral',
            currentUndertone: '',
            currentShape: 'circle',
            currentTheme: 'night',
            soundEnabled: false,
            rhythmActive: false,
            currentBPM: 120,
            currentBPMModifier: 1.0,
            audioContext: null,
            showingFPS: false,
            isRecording: false,
            isBlinking: true,
            gazeEnabled: false,
            lastFrameTime: 0,
            deltaTime: 0,
            mascotInstance: null
        };

        // Notify all subscribers
        Object.keys(this.state).forEach(key => {
            this.notifySubscribers(key, this.state[key], undefined);
        });
    }
}

// Create singleton instance
export const emotiveState = new GlobalStateManager();

// Named exports for convenience
export const getState = (key) => emotiveState.get(key);
export const setState = (key, value) => emotiveState.set(key, value);
export const updateState = (updates) => emotiveState.update(updates);
export const subscribeToState = (key, callback) => emotiveState.subscribe(key, callback);