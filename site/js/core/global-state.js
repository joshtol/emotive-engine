/**
 * GlobalStateManager - Manages legacy global state variables
 * Provides centralized state management for backward compatibility
 */
class GlobalStateManager {
    constructor(options = {}) {
        // Configuration with defaults
        this.config = {
            // Default state values
            defaults: {
                currentEmotion: options.defaultEmotion || 'neutral',
                currentUndertone: options.defaultUndertone || '',
                showingFPS: options.defaultShowingFPS || false,
                isRecording: options.defaultIsRecording || false,
                currentTheme: options.defaultTheme || 'night',
                soundEnabled: options.defaultSoundEnabled || false,
                rhythmActive: options.defaultRhythmActive || false,
                currentBPMModifier: options.defaultBPMModifier || 1.0
            },

            // Enable automatic window global sync
            syncToWindow: options.syncToWindow !== false,

            // State change callbacks
            onChange: options.onChange || {},

            ...options
        };

        // Internal state storage
        this.state = { ...this.config.defaults };

        // State change subscribers
        this.subscribers = new Map();

        // Initialize window globals if enabled
        if (this.config.syncToWindow) {
            this.syncToWindow();
        }
    }

    /**
     * Initialize the state manager
     */
    init() {
        // Set up property descriptors for automatic sync
        if (this.config.syncToWindow) {
            this.setupWindowSync();
        }

        return this;
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

        if (oldValue === value) {
            return;
        }

        this.state[key] = value;

        // Update window global if sync is enabled
        if (this.config.syncToWindow && typeof window !== 'undefined') {
            window[key] = value;
        }

        // Call specific change callback if exists
        if (this.config.onChange[key]) {
            this.config.onChange[key](value, oldValue);
        }

        // Notify subscribers
        this.notifySubscribers(key, value, oldValue);
    }

    /**
     * Update multiple state values at once
     */
    update(updates) {
        for (const [key, value] of Object.entries(updates)) {
            this.set(key, value);
        }
    }

    /**
     * Get all state
     */
    getAll() {
        return { ...this.state };
    }

    /**
     * Reset state to defaults
     */
    reset() {
        this.update(this.config.defaults);
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
                callback(value, oldValue);
            });
        }
    }

    /**
     * Sync current state to window globals
     */
    syncToWindow() {
        if (typeof window === 'undefined') return;

        for (const [key, value] of Object.entries(this.state)) {
            window[key] = value;
        }
    }

    /**
     * Set up automatic window sync with property descriptors
     */
    setupWindowSync() {
        if (typeof window === 'undefined') return;

        // Create property descriptors for each state key
        for (const key of Object.keys(this.state)) {
            const descriptor = {
                get: () => this.state[key],
                set: (value) => this.set(key, value),
                configurable: true
            };

            // Define property on window
            Object.defineProperty(window, key, descriptor);
        }
    }

    /**
     * Load state from window globals
     */
    loadFromWindow() {
        if (typeof window === 'undefined') return;

        const updates = {};
        for (const key of Object.keys(this.state)) {
            if (key in window && window[key] !== undefined) {
                updates[key] = window[key];
            }
        }

        this.update(updates);
    }

    /**
     * Register a module that uses global state
     */
    registerModule(moduleName, stateKeys) {
        // Track which modules use which state keys
        // This can be useful for debugging and dependency management
        if (!this.moduleRegistry) {
            this.moduleRegistry = new Map();
        }

        this.moduleRegistry.set(moduleName, stateKeys);
    }

    /**
     * Get modules that depend on a state key
     */
    getDependentModules(stateKey) {
        if (!this.moduleRegistry) return [];

        const modules = [];
        for (const [moduleName, keys] of this.moduleRegistry.entries()) {
            if (keys.includes(stateKey)) {
                modules.push(moduleName);
            }
        }

        return modules;
    }

    /**
     * Create a proxy object for a specific module
     * This provides a scoped view of only the state that module needs
     */
    createModuleProxy(moduleKeys) {
        const proxy = {};

        for (const key of moduleKeys) {
            Object.defineProperty(proxy, key, {
                get: () => this.state[key],
                set: (value) => this.set(key, value)
            });
        }

        return proxy;
    }

    /**
     * Export state as JSON
     */
    toJSON() {
        return JSON.stringify(this.state);
    }

    /**
     * Import state from JSON
     */
    fromJSON(json) {
        try {
            const parsed = typeof json === 'string' ? JSON.parse(json) : json;
            this.update(parsed);
        } catch (error) {
            console.error('Failed to parse state JSON:', error);
        }
    }

    /**
     * Clean up
     */
    destroy() {
        this.subscribers.clear();
        if (this.moduleRegistry) {
            this.moduleRegistry.clear();
        }
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.GlobalStateManager = GlobalStateManager;
}