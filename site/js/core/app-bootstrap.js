/**
 * AppBootstrap - Application initialization and bootstrap
 * Handles app startup and legacy compatibility setup
 */
class AppBootstrap {
    constructor(options = {}) {
        // Configuration
        this.config = {
            // Auto-start on DOM ready
            autoStart: options.autoStart !== false,

            // Legacy compatibility
            createLegacyGlobals: options.createLegacyGlobals !== false,

            // Error handling
            handleErrors: options.handleErrors !== false,
            errorHandler: options.errorHandler || console.error,

            // Callbacks
            onBeforeInit: options.onBeforeInit || null,
            onAfterInit: options.onAfterInit || null,
            onError: options.onError || null,

            ...options
        };

        // App reference
        this.app = null;

        // Legacy references
        this.legacyRefs = {
            mascot: null,
            diceRoller: null,
            djScratcher: null,
            audioVisualizer: null,
            gestureScheduler: null,
            fpsCounter: null
        };

        // Initialize on DOM ready if autoStart is enabled
        if (this.config.autoStart) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.init());
            } else {
                // DOM already loaded
                this.init();
            }
        }
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('Starting application bootstrap...');

            // Call before init callback
            if (this.config.onBeforeInit) {
                await this.config.onBeforeInit();
            }

            // Create and initialize the main app
            this.app = new EmotiveApp();
            await this.app.init();

            // Set up legacy global references if enabled
            if (this.config.createLegacyGlobals) {
                this.setupLegacyGlobals();
            }

            // Initialize theme icon
            this.initializeTheme();

            // Make app globally available
            if (typeof window !== 'undefined') {
                window.app = this.app;
            }

            // Call after init callback
            if (this.config.onAfterInit) {
                await this.config.onAfterInit(this.app);
            }

            console.log('Application bootstrap completed successfully');
            return this.app;

        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    /**
     * Set up legacy global variables for backward compatibility
     */
    setupLegacyGlobals() {
        if (typeof window === 'undefined' || !this.app) return;

        // Module references for backward compatibility
        this.legacyRefs.mascot = this.app.mascot;
        this.legacyRefs.diceRoller = this.app.diceRoller;
        this.legacyRefs.djScratcher = this.app.djScratcher;
        this.legacyRefs.audioVisualizer = this.app.audioVisualizer;

        // Gesture module references
        this.legacyRefs.gestureScheduler = this.app.gestureScheduler;
        this.legacyRefs.fpsCounter = this.app.fpsCounter;

        // Create global variables
        window.mascot = this.legacyRefs.mascot;
        window.diceRoller = this.legacyRefs.diceRoller;
        window.djScratcher = this.legacyRefs.djScratcher;
        window.audioVisualizer = this.legacyRefs.audioVisualizer;
        window.gestureScheduler = this.legacyRefs.gestureScheduler;
        window.fpsCounter = this.legacyRefs.fpsCounter;

        console.log('Legacy global references created');
    }

    /**
     * Initialize theme icon
     */
    initializeTheme() {
        if (this.app?.themeManager) {
            const theme = this.app.themeManager.getCurrentTheme();
            this.app.themeManager.updateIcon(theme);
        }
    }

    /**
     * Handle initialization errors
     */
    handleError(error) {
        console.error('Application bootstrap failed:', error);

        if (this.config.handleErrors) {
            // Display user-friendly error message
            this.showErrorMessage(error);
        }

        if (this.config.onError) {
            this.config.onError(error);
        }

        if (this.config.errorHandler) {
            this.config.errorHandler(error);
        }
    }

    /**
     * Show error message in UI
     */
    showErrorMessage(error) {
        // Check if there's a display container
        const displayContainer = document.getElementById('display-container');
        if (displayContainer) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.style.cssText = `
                color: #ff4444;
                background: rgba(255, 68, 68, 0.1);
                border: 1px solid #ff4444;
                padding: 20px;
                margin: 20px;
                border-radius: 8px;
                font-family: monospace;
            `;
            errorDiv.innerHTML = `
                <h3>Initialization Error</h3>
                <p>Failed to start the application. Please refresh the page.</p>
                <details>
                    <summary>Technical Details</summary>
                    <pre>${error.stack || error.message || error}</pre>
                </details>
            `;
            displayContainer.appendChild(errorDiv);
        }
    }

    /**
     * Get the app instance
     */
    getApp() {
        return this.app;
    }

    /**
     * Get legacy references
     */
    getLegacyRefs() {
        return { ...this.legacyRefs };
    }

    /**
     * Reload the application
     */
    async reload() {
        if (this.app) {
            // Clean up existing app
            if (this.app.destroy) {
                this.app.destroy();
            }
            this.app = null;
        }

        // Clear legacy globals
        if (typeof window !== 'undefined') {
            delete window.app;
            delete window.mascot;
            delete window.diceRoller;
            delete window.djScratcher;
            delete window.audioVisualizer;
            delete window.gestureScheduler;
            delete window.fpsCounter;
        }

        // Reinitialize
        return this.init();
    }

    /**
     * Check if app is ready
     */
    isReady() {
        return this.app !== null && this.app.mascot !== null;
    }

    /**
     * Wait for app to be ready
     */
    async waitForReady(timeout = 5000) {
        const startTime = Date.now();

        while (!this.isReady()) {
            if (Date.now() - startTime > timeout) {
                throw new Error('Timeout waiting for app to be ready');
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return this.app;
    }

    /**
     * Static factory method for quick initialization
     */
    static async start(options = {}) {
        const bootstrap = new AppBootstrap({
            ...options,
            autoStart: false // We'll start manually
        });
        return bootstrap.init();
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.AppBootstrap = AppBootstrap;

    // Create default instance if not in test environment
    if (!window.__TEST_MODE__) {
        window.appBootstrap = new AppBootstrap({
            autoStart: true,
            createLegacyGlobals: true,
            handleErrors: true
        });
    }
}