/*!
 * Emotive Engine™ - Proprietary and Confidential
 * Copyright (c) 2025 Emotive Engine. All Rights Reserved.
 *
 * NOTICE: This code is proprietary and confidential. Unauthorized copying,
 * modification, or distribution is strictly prohibited and may result in
 * legal action. This software is licensed, not sold.
 *
 * Website: https://emotiveengine.com
 * License: https://emotive-engine.web.app/LICENSE.md
 */
/**
 * AssetsConfig - Centralized assets and external resources configuration
 * Manages all asset paths, external dependencies, and resource loading
 */
class AssetsConfig {
    constructor(options = {}) {
        // Configuration with defaults
        this.config = {
            // Base paths
            basePath: options.basePath || '..',
            assetsPath: options.assetsPath || '../assets',
            scriptsPath: options.scriptsPath || 'js',
            stylesPath: options.stylesPath || '',

            // Images and icons
            images: {
                favicon: options.favicon || '../assets/emotive-engine-icon.svg',
                headerLogo: options.headerLogo || '../assets/emotive-engine-full-BW.svg',
                ...options.images
            },

            // External CDNs and resources
            external: {
                fonts: {
                    googleFonts: {
                        preconnect: [
                            'https://fonts.googleapis.com',
                            'https://fonts.gstatic.com'
                        ],
                        url: 'https://fonts.googleapis.com/css2',
                        families: [
                            'Poppins:wght@300;400;500;600;700;800',
                            'Montserrat:wght@300;400;500;600;700;800'
                        ]
                    }
                },
                ...options.external
            },

            // Stylesheets
            styles: {
                main: 'emotive-scifi-modular.css',
                ...options.styles
            },

            // Script modules (in load order)
            scripts: {
                ui: [
                    'js/ui/theme-manager.js',
                    'js/ui/display-manager.js',
                    'js/ui/dice-roller.js',
                    'js/ui/dj-scratcher.js',
                    'js/ui/audio-visualizer.js'
                ],
                controls: [
                    'js/controls/randomizer-controller.js',
                    'js/controls/gesture-chain-controller.js',
                    'js/controls/undertone-controller.js',
                    'js/controls/system-controls-controller.js',
                    'js/controls/emotion-controller.js',
                    'js/controls/shape-morph-controller.js',
                    'js/controls/audio-controller.js',
                    // rhythm and bpm controllers removed - functionality merged
                    'js/controls/dice-controller.js',
                    'js/controls/gesture-controller.js',
                    'js/controls/orientation-controller.js'
                ],
                config: [
                    'js/config/ui-strings.js'
                ],
                core: [
                    'js/core/global-state.js',
                    'js/core/module-loader.js',
                    'js/core/legacy-compatibility.js',
                    'js/core/app.js',
                    'js/core/app-bootstrap.js'
                ],
                ...options.scripts
            },

            // Audio assets
            audio: {
                demoTrack: '../assets/Electric Glow (Remix).wav',
                ...options.audio
            },

            // Document links
            links: {
                license: '../LICENSE.md',
                readme: '../README.md',
                ...options.links
            },

            // Dynamic loading options
            loadOptions: {
                async: options.async || false,
                defer: options.defer || false,
                module: options.module || false,
                ...options.loadOptions
            },

            // Caching options
            cache: {
                version: options.cacheVersion || '1.0.0',
                bustCache: options.bustCache !== false,
                ...options.cache
            },

            ...options
        };
    }

    /**
     * Initialize and apply assets configuration to DOM
     */
    init() {
        this.applyDataAttributes();
        this.applyFavicon();
        this.applyExternalFonts();
        this.applyStylesheets();
        // Scripts are already loaded by the time this runs
        return this;
    }

    /**
     * Apply data attributes to the HTML element
     */
    applyDataAttributes() {
        const htmlElement = document.documentElement;

        // Set assets base path
        if (this.config.assetsPath) {
            htmlElement.setAttribute('data-assets-base', this.config.assetsPath);
        }

        // Set cache version
        if (this.config.cache.version) {
            htmlElement.setAttribute('data-cache-version', this.config.cache.version);
        }
    }

    /**
     * Apply favicon
     */
    applyFavicon() {
        const favicon = document.querySelector('link[rel="icon"]');
        if (favicon) {
            favicon.href = this.getAssetUrl(this.config.images.favicon);
        } else {
            this.createFavicon();
        }
    }

    /**
     * Create favicon element
     */
    createFavicon() {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/svg+xml';
        link.href = this.getAssetUrl(this.config.images.favicon);
        document.head.appendChild(link);
    }

    /**
     * Apply external font links
     */
    applyExternalFonts() {
        const fonts = this.config.external.fonts.googleFonts;
        if (!fonts) return;

        // Add preconnect links if not present
        fonts.preconnect.forEach(url => {
            if (!document.querySelector(`link[href="${url}"]`)) {
                const link = document.createElement('link');
                link.rel = 'preconnect';
                link.href = url;
                if (url.includes('gstatic')) {
                    link.crossOrigin = 'anonymous';
                }
                document.head.appendChild(link);
            }
        });

        // Build font URL
        const fontUrl = `${fonts.url}?family=${fonts.families.join('&family=')}&display=swap`;

        // Add or update font stylesheet
        let fontLink = document.querySelector('link[href*="fonts.googleapis.com/css"]');
        if (fontLink) {
            fontLink.href = fontUrl;
        } else {
            fontLink = document.createElement('link');
            fontLink.rel = 'stylesheet';
            fontLink.href = fontUrl;
            document.head.appendChild(fontLink);
        }
    }

    /**
     * Apply stylesheets
     */
    applyStylesheets() {
        const mainStyle = document.querySelector('link[href*="emotive-scifi"]');
        if (mainStyle) {
            mainStyle.href = this.getAssetUrl(this.config.styles.main);
        }
    }

    /**
     * Get full asset URL with cache busting
     */
    getAssetUrl(path) {
        if (!path) return '';

        // Don't modify external URLs
        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }

        // Add cache busting if enabled
        if (this.config.cache.bustCache) {
            const separator = path.includes('?') ? '&' : '?';
            return `${path}${separator}v=${this.config.cache.version}`;
        }

        return path;
    }

    /**
     * Load a script dynamically
     */
    loadScript(src, options = {}) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = this.getAssetUrl(src);

            if (options.async) script.async = true;
            if (options.defer) script.defer = true;
            if (options.module) script.type = 'module';

            script.onload = resolve;
            script.onerror = reject;

            document.body.appendChild(script);
        });
    }

    /**
     * Load multiple scripts in order
     */
    async loadScripts(scripts, options = {}) {
        for (const src of scripts) {
            await this.loadScript(src, options);
        }
    }

    /**
     * Load all configured scripts
     */
    loadAllScripts() {
        const allScripts = [
            ...this.config.scripts.ui,
            ...this.config.scripts.controls,
            ...this.config.scripts.config,
            ...this.config.scripts.core
        ];

        return this.loadScripts(allScripts, this.config.loadOptions);
    }

    /**
     * Preload an asset
     */
    preloadAsset(url, type = 'image') {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = type;
        link.href = this.getAssetUrl(url);
        document.head.appendChild(link);
    }

    /**
     * Preload critical assets
     */
    preloadCriticalAssets() {
        // Preload logo
        this.preloadAsset(this.config.images.headerLogo, 'image');

        // Preload main stylesheet
        this.preloadAsset(this.config.styles.main, 'style');
    }

    /**
     * Get asset path
     */
    getAssetPath(category, name) {
        if (this.config[category] && this.config[category][name]) {
            return this.config[category][name];
        }
        return null;
    }

    /**
     * Update asset path
     */
    setAssetPath(category, name, path) {
        if (!this.config[category]) {
            this.config[category] = {};
        }
        this.config[category][name] = path;
    }

    /**
     * Get all scripts for a category
     */
    getScriptsByCategory(category) {
        return this.config.scripts[category] || [];
    }

    /**
     * Update cache version
     */
    updateCacheVersion(version) {
        this.config.cache.version = version;
    }

    /**
     * Export configuration as JSON
     */
    exportJSON() {
        return JSON.stringify(this.config, null, 2);
    }

    /**
     * Load configuration from JSON
     */
    async loadFromJSON(url) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            this.config = { ...this.config, ...data };
            this.init();
        } catch (error) {
            console.error('Failed to load assets config:', error);
        }
    }
}

// ES6 Module Export
export default AssetsConfig;

// LEGAL WARNING: This code is protected by copyright law and international treaties.
// Unauthorized reproduction or distribution of this code, or any portion of it,
// may result in severe civil and criminal penalties, and will be prosecuted
// to the maximum extent possible under the law.