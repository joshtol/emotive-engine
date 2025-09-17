/**
 * LegacyCompatibilityBridge - Provides backward compatibility for legacy code
 * Maps old function names and patterns to new modular controllers
 */
class LegacyCompatibilityBridge {
    constructor(options = {}) {
        // Configuration
        this.config = {
            // Enable specific compatibility features
            enableGlobalFunctions: options.enableGlobalFunctions !== false,
            enableElementReferences: options.enableElementReferences !== false,
            enableEventProxies: options.enableEventProxies !== false,

            // Log deprecation warnings
            logDeprecations: options.logDeprecations || false,

            // Function mappings
            functionMappings: {
                randomizeEmotion: 'randomizer.randomizeEmotion',
                randomizeUndertone: 'randomizer.randomizeUndertone',
                getUndertoneFromValue: 'undertoneController.getUndertoneMapping',
                updateDisplay: 'app.updateDisplay',
                startAudioViz: 'audioVisualizer.start',
                stopAudioViz: 'audioVisualizer.stop',
                ...options.functionMappings
            },

            // Default return values for missing controllers
            defaultReturns: {
                getUndertoneFromValue: { undertone: '', displayText: 'CLEAR' },
                ...options.defaultReturns
            },

            ...options
        };

        // References to modern controllers
        this.controllers = new Map();

        // Track deprecated usage
        this.deprecationCounts = new Map();
    }

    /**
     * Initialize the compatibility bridge
     */
    init(app = null) {
        this.app = app || window.app;

        // Store controller references
        this.mapControllers();

        // Set up global functions
        if (this.config.enableGlobalFunctions) {
            this.setupGlobalFunctions();
        }

        // Set up element references
        if (this.config.enableElementReferences) {
            this.setupElementReferences();
        }

        // Set up event proxies
        if (this.config.enableEventProxies) {
            this.setupEventProxies();
        }

        return this;
    }

    /**
     * Map controllers for easy access
     */
    mapControllers() {
        const controllerNames = [
            'randomizer',
            'undertoneController',
            'emotionController',
            'systemControls',
            'shapeMorphController',
            'audioController',
            'rhythmController',
            'bpmModifierController',
            'diceController',
            'gestureController',
            'chainController',
            'audioVisualizer',
            'displayManager',
            'themeManager'
        ];

        for (const name of controllerNames) {
            const controller = window[name] || this.app?.[name];
            if (controller) {
                this.controllers.set(name, controller);
            }
        }
    }

    /**
     * Set up global compatibility functions
     */
    setupGlobalFunctions() {
        if (typeof window === 'undefined') return;

        // randomizeEmotion
        window.randomizeEmotion = () => {
            this.logDeprecation('randomizeEmotion', 'randomizer.randomizeEmotion');
            const controller = this.controllers.get('randomizer');
            if (controller) {
                return controller.randomizeEmotion();
            }
        };

        // randomizeUndertone
        window.randomizeUndertone = () => {
            this.logDeprecation('randomizeUndertone', 'randomizer.randomizeUndertone');
            const controller = this.controllers.get('randomizer');
            if (controller) {
                return controller.randomizeUndertone();
            }
        };

        // getUndertoneFromValue
        window.getUndertoneFromValue = (value) => {
            this.logDeprecation('getUndertoneFromValue', 'undertoneController.getUndertoneMapping');
            const controller = this.controllers.get('undertoneController');
            if (controller) {
                return controller.getUndertoneMapping(value);
            }
            return this.config.defaultReturns.getUndertoneFromValue;
        };

        // updateDisplay
        window.updateDisplay = () => {
            this.logDeprecation('updateDisplay', 'app.updateDisplay');
            if (this.app?.updateDisplay) {
                return this.app.updateDisplay();
            }
        };

        // Audio visualizer functions
        window.startAudioViz = () => {
            this.logDeprecation('startAudioViz', 'audioVisualizer.start');
            const controller = this.controllers.get('audioVisualizer');
            if (controller) {
                return controller.start();
            }
        };

        window.stopAudioViz = () => {
            this.logDeprecation('stopAudioViz', 'audioVisualizer.stop');
            const controller = this.controllers.get('audioVisualizer');
            if (controller) {
                return controller.stop();
            }
        };

        // Add custom function mappings
        for (const [oldName, newPath] of Object.entries(this.config.functionMappings)) {
            if (!window[oldName]) {
                this.createCompatibilityFunction(oldName, newPath);
            }
        }
    }

    /**
     * Create a compatibility function
     */
    createCompatibilityFunction(oldName, newPath) {
        if (typeof window === 'undefined') return;

        const parts = newPath.split('.');

        window[oldName] = (...args) => {
            this.logDeprecation(oldName, newPath);

            // Navigate to the target function
            let target = this.controllers.get(parts[0]) || window[parts[0]];

            for (let i = 1; i < parts.length && target; i++) {
                if (i === parts.length - 1) {
                    // Last part is the method name
                    if (typeof target[parts[i]] === 'function') {
                        return target[parts[i]](...args);
                    }
                } else {
                    target = target[parts[i]];
                }
            }

            // Return default if configured
            if (this.config.defaultReturns[oldName]) {
                return this.config.defaultReturns[oldName];
            }
        };
    }

    /**
     * Set up element references for backward compatibility
     */
    setupElementReferences() {
        if (typeof window === 'undefined') return;

        // Common element references
        const elementIds = [
            'undertone-slider',
            'undertone-value',
            'audio-file',
            'audio-player',
            'bpm-value',
            'bpm-slider',
            'rhythm-toggle',
            'emotion-display',
            'undertone-display'
        ];

        for (const id of elementIds) {
            const element = document.getElementById(id);
            if (element) {
                // Create a camelCase global name
                const globalName = this.toCamelCase(id);
                if (!window[globalName]) {
                    window[globalName] = element;
                }
            }
        }
    }

    /**
     * Set up event proxies for legacy event handlers
     */
    setupEventProxies() {
        // This could proxy old event patterns to new controllers
        // For example, mapping onclick attributes to proper event listeners
    }

    /**
     * Log deprecation warning
     */
    logDeprecation(oldName, newName) {
        if (!this.config.logDeprecations) return;

        // Track usage count
        const count = (this.deprecationCounts.get(oldName) || 0) + 1;
        this.deprecationCounts.set(oldName, count);

        // Log warning on first use and every 10th use
        if (count === 1 || count % 10 === 0) {
            console.warn(
                `⚠️ Deprecated: "${oldName}" is deprecated. ` +
                `Use "${newName}" instead. ` +
                `(Called ${count} time${count > 1 ? 's' : ''})`
            );
        }
    }

    /**
     * Convert kebab-case to camelCase
     */
    toCamelCase(str) {
        return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    }

    /**
     * Add a new compatibility mapping
     */
    addMapping(oldName, newPath, defaultReturn = undefined) {
        this.config.functionMappings[oldName] = newPath;
        if (defaultReturn !== undefined) {
            this.config.defaultReturns[oldName] = defaultReturn;
        }

        if (this.config.enableGlobalFunctions) {
            this.createCompatibilityFunction(oldName, newPath);
        }
    }

    /**
     * Remove a compatibility mapping
     */
    removeMapping(oldName) {
        delete this.config.functionMappings[oldName];
        delete this.config.defaultReturns[oldName];

        if (typeof window !== 'undefined') {
            delete window[oldName];
        }
    }

    /**
     * Get deprecation statistics
     */
    getDeprecationStats() {
        const stats = [];
        for (const [name, count] of this.deprecationCounts.entries()) {
            stats.push({ function: name, calls: count });
        }
        return stats.sort((a, b) => b.calls - a.calls);
    }

    /**
     * Reset deprecation counts
     */
    resetDeprecationCounts() {
        this.deprecationCounts.clear();
    }

    /**
     * Update controller reference
     */
    updateController(name, controller) {
        this.controllers.set(name, controller);
    }

    /**
     * Check if a function is being proxied
     */
    isProxied(functionName) {
        return functionName in this.config.functionMappings;
    }

    /**
     * Get all proxied functions
     */
    getProxiedFunctions() {
        return Object.keys(this.config.functionMappings);
    }

    /**
     * Clean up
     */
    destroy() {
        // Remove global functions if needed
        if (this.config.enableGlobalFunctions && typeof window !== 'undefined') {
            for (const oldName of Object.keys(this.config.functionMappings)) {
                delete window[oldName];
            }
        }

        this.controllers.clear();
        this.deprecationCounts.clear();
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.LegacyCompatibilityBridge = LegacyCompatibilityBridge;
}