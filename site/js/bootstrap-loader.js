/**
 * Bootstrap Loader - Minimal loader for assets configuration
 * This loads first and manages all other assets
 */
(function() {
    'use strict';

    // Configuration
    const config = {
        // Assets configuration
        assetsConfig: 'js/config/assets-config.js',

        // All scripts to load in order
        scripts: [
            // UI modules
            'js/ui/theme-manager.js',
            'js/ui/display-manager.js',
            'js/ui/dice-roller.js',
            'js/ui/dj-scratcher.js',
            'js/ui/audio-visualizer.js',

            // Control modules
            'js/controls/randomizer-controller.js',
            'js/controls/gesture-chain-controller.js',
            'js/controls/undertone-controller.js',
            'js/controls/system-controls-controller.js',
            'js/controls/emotion-controller.js',
            'js/controls/shape-morph-controller.js',
            'js/controls/audio-controller.js',
            'js/controls/rhythm-controller.js',
            'js/controls/bpm-modifier-controller.js',
            'js/controls/dice-controller.js',
            'js/controls/gesture-controller.js',
            'js/controls/orientation-controller.js',

            // Configuration
            'js/config/ui-strings.js',

            // Core modules
            'js/core/global-state.js',
            'js/core/module-loader.js',
            'js/core/legacy-compatibility.js',
            'js/core/app.js',
            'js/core/app-bootstrap.js'
        ],

        // External resources
        fonts: {
            preconnect: [
                'https://fonts.googleapis.com',
                'https://fonts.gstatic.com'
            ],
            url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Montserrat:wght@300;400;500;600;700;800&display=swap'
        },

        // Assets
        favicon: '../assets/emotive-engine-icon.svg',
        headerLogo: '../assets/emotive-engine-full-BW.svg',
        mainStylesheet: 'emotive-scifi-modular.css',

        // Cache busting
        version: '1.0.0'
    };

    /**
     * Load a script
     */
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src + '?v=' + config.version;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }

    /**
     * Set up external fonts
     */
    function setupFonts() {
        // Add preconnect links
        config.fonts.preconnect.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = url;
            if (url.includes('gstatic')) {
                link.crossOrigin = 'anonymous';
            }
            document.head.appendChild(link);
        });

        // Add font stylesheet
        const fontLink = document.createElement('link');
        fontLink.rel = 'stylesheet';
        fontLink.href = config.fonts.url;
        document.head.appendChild(fontLink);
    }

    /**
     * Set up favicon
     */
    function setupFavicon() {
        let favicon = document.querySelector('link[rel="icon"]');
        if (!favicon) {
            favicon = document.createElement('link');
            favicon.rel = 'icon';
            favicon.type = 'image/svg+xml';
            document.head.appendChild(favicon);
        }
        favicon.href = config.favicon + '?v=' + config.version;
    }

    /**
     * Set up stylesheet
     */
    function setupStylesheet() {
        let stylesheet = document.querySelector('link[href*="emotive-scifi"]');
        if (!stylesheet) {
            stylesheet = document.createElement('link');
            stylesheet.rel = 'stylesheet';
            document.head.appendChild(stylesheet);
        }
        stylesheet.href = config.mainStylesheet + '?v=' + config.version;
    }

    /**
     * Initialize the loader
     */
    async function init() {
        try {
            // Set up external resources
            setupFonts();
            setupFavicon();
            setupStylesheet();

            // Load assets configuration first
            await loadScript(config.assetsConfig);

            // Initialize assets config if available
            if (window.AssetsConfig) {
                window.assetsConfig = new window.AssetsConfig({
                    cacheVersion: config.version,
                    images: {
                        favicon: config.favicon,
                        headerLogo: config.headerLogo
                    }
                });
                window.assetsConfig.init();
            }

            // Load all scripts in order
            for (const script of config.scripts) {
                await loadScript(script);
            }

            console.log('Bootstrap loader completed');

        } catch (error) {
            console.error('Bootstrap loader failed:', error);
        }
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();