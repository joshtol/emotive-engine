/**
 * Main Entry Point - ES6 Module System
 * This is the single entry point for the entire application
 */

// Core imports
import { EmotiveApp } from './core/app.js';
import { emotiveState } from './core/global-state.js';
import AssetsConfig from './config/assets-config.js';
import FooterConfig from './config/footer-config.js';
import authUI from './firebase/auth-ui.js';

// Development mode flag
const isDevelopment = !window.location.hostname.includes('emotive-engine');

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

/**
 * Initialize the application
 */
async function init() {
    try {
        // Initialize assets configuration
        const assetsConfig = new AssetsConfig({
            cacheVersion: '2.5.0'
        });
        assetsConfig.init();

        // Initialize footer
        const footerConfig = new FooterConfig({
            copyrightYear: 2025,
            copyrightAuthor: 'Joshua Tollette'
        });
        footerConfig.init();

        // Initialize authentication UI
        try {
            await authUI.init('auth-container');
            // Authentication UI initialized
        } catch (error) {
            console.error('Failed to initialize auth UI:', error);
            // Continue without auth - not critical for demo
        }

        // Initialize main app
        const app = new EmotiveApp({
            debug: isDevelopment,
            emotiveState
        });

        await app.initialize();

        // Store for debugging (development only)
        if (isDevelopment) {
            window.DEBUG_APP = {
                app,
                emotiveState,
                reload: () => window.location.reload()
            };
            // Emotive Engine initialized in development mode
        }

        // Make app globally available and add audio visualizer function
        window.app = app;
        window.startAudioViz = () => {
            if (app.audioVisualizer) {
                app.audioVisualizer.start();
            }
        };

    } catch (error) {
        console.error('Failed to initialize Emotive Engine:', error);

        // Show error in UI
        const display = document.getElementById('display-container');
        if (display) {
            display.innerHTML = `
                <div style="color: #ff4444; padding: 20px; text-align: center;">
                    <h2>Initialization Error</h2>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
}

// Export for dynamic imports if needed
export { emotiveState };