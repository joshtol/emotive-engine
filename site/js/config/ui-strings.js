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
 * UIStringsConfig - Centralized UI text and labels configuration
 * Provides all user-facing strings for the interface
 */
class UIStringsConfig {
    constructor(options = {}) {
        // Configuration with defaults
        this.config = {
            // Page metadata
            pageTitle: options.pageTitle || 'EMOTIVE A.I. Core - Neural Interface',
            favicon: options.favicon || '../assets/emotive-engine-icon.svg',

            // Header
            headerTitle: options.headerTitle || 'NEURAL INTERFACE',
            headerLogo: {
                src: options.headerLogoSrc || '../assets/emotive-engine-full-BW.svg',
                alt: options.headerLogoAlt || 'Emotive Engine'
            },

            // Skip navigation
            skipNavText: options.skipNavText || 'Skip to main content',
            skipNavTarget: options.skipNavTarget || '#display-container',

            // Section titles
            sectionTitles: {
                audioVisualizer: 'AUDIO VISUALIZER',
                chainCombos: 'CHAIN COMBOS',
                glowEffects: 'GLOW EFFECTS',
                undertoneModifier: 'UNDERTONE MODIFIER',
                rhythmSync: 'RHYTHM SYNC',
                dance: 'DANCE',
                overlayable: 'OVERLAYABLE',
                ...options.sectionTitles
            },

            // Button labels
            buttonLabels: {
                randomizeShape: 'RANDOMIZE SHAPE',
                randomizeChain: 'RANDOMIZE CHAIN',
                randomizeGlow: 'RANDOMIZE GLOW',
                randomizeDance: 'RANDOMIZE DANCE',
                randomizeOverlayable: 'RANDOMIZE OVERLAYABLE',
                toggleRhythm: 'TOGGLE RHYTHM',
                clearUndertone: 'CLEAR',
                ...options.buttonLabels
            },

            // Emotion labels
            emotionLabels: {
                neutral: 'NEUTRAL',
                joy: 'JOY',
                sadness: 'SADNESS',
                anger: 'ANGER',
                fear: 'FEAR',
                love: 'LOVE',
                surprise: 'SURPRISE',
                ...options.emotionLabels
            },

            // Gesture labels
            gestureLabels: {
                wave: 'WAVE',
                point: 'POINT',
                nod: 'NOD',
                shake: 'SHAKE',
                lean: 'LEAN',
                tilt: 'TILT',
                reach: 'REACH',
                breathe: 'BREATHE',
                float: 'FLOAT',
                rain: 'RAIN',
                runningman: 'RUNNING MAN',
                charleston: 'CHARLESTON',
                twist: 'TWIST',
                robot: 'ROBOT',
                disco: 'DISCO',
                moonwalk: 'MOONWALK',
                ...options.gestureLabels
            },

            // System control labels
            systemLabels: {
                toggleFPS: 'FPS',
                toggleBlinking: 'BLINK',
                toggleGaze: 'GAZE',
                recordToggle: 'REC',
                ...options.systemLabels
            },

            // Display labels
            displayLabels: {
                emotionPrefix: 'EMOTION:',
                undertonePrefix: 'UNDERTONE:',
                bpmLabel: 'BPM',
                fpsLabel: 'FPS:',
                ...options.displayLabels
            },

            // Tooltips
            tooltips: {
                randomizeShape: 'Morph the core into a random shape',
                toggleRhythm: 'Sync animations to BPM',
                toggleFPS: 'Show/hide FPS counter',
                ...options.tooltips
            },

            // ARIA labels
            ariaLabels: {
                emotionControls: 'Emotion controls',
                gestureControls: 'Gesture controls',
                systemControls: 'System controls',
                audioControls: 'Audio controls',
                ...options.ariaLabels
            },

            // Language/locale support
            locale: options.locale || 'en-US',

            ...options
        };
    }

    /**
     * Initialize and apply strings to DOM
     */
    init() {
        this.applyPageMetadata();
        this.applyHeaderStrings();
        this.applySectionTitles();
        this.applyButtonLabels();
        this.applyAriaLabels();

        return this;
    }

    /**
     * Apply page metadata
     */
    applyPageMetadata() {
        // Set page title
        const titleElement = document.querySelector('title');
        if (titleElement) {
            titleElement.textContent = this.config.pageTitle;
        }

        // Set favicon
        const faviconElement = document.querySelector('link[rel="icon"]');
        if (faviconElement) {
            faviconElement.href = this.config.favicon;
        }
    }

    /**
     * Apply header strings
     */
    applyHeaderStrings() {
        // Header title
        const headerTitle = document.querySelector('.header-title');
        if (headerTitle) {
            headerTitle.textContent = this.config.headerTitle;
        }

        // Header logo
        const headerLogo = document.querySelector('#logo-image');
        if (headerLogo) {
            headerLogo.src = this.config.headerLogo.src;
            headerLogo.alt = this.config.headerLogo.alt;
        }

        // Skip nav
        const skipNav = document.querySelector('.skip-nav');
        if (skipNav) {
            skipNav.textContent = this.config.skipNavText;
            skipNav.href = this.config.skipNavTarget;
        }
    }

    /**
     * Apply section titles
     */
    applySectionTitles() {
        // Map section titles by their current text content
        const sectionMappings = [
            { text: 'AUDIO VISUALIZER', key: 'audioVisualizer' },
            { text: 'CHAIN COMBOS', key: 'chainCombos' },
            { text: 'GLOW EFFECTS', key: 'glowEffects' },
            { text: 'UNDERTONE MODIFIER', key: 'undertoneModifier' },
            { text: 'RHYTHM SYNC', key: 'rhythmSync' },
            { text: 'DANCE', key: 'dance' },
            { text: 'OVERLAYABLE', key: 'overlayable' }
        ];

        // Find all section titles and update based on current text
        document.querySelectorAll('.section-title').forEach(element => {
            const currentText = element.textContent.trim();
            const mapping = sectionMappings.find(m => m.text === currentText);
            if (mapping && this.config.sectionTitles[mapping.key]) {
                element.textContent = this.config.sectionTitles[mapping.key];
            }
        });
    }

    /**
     * Apply button labels
     */
    applyButtonLabels() {
        // Emotion buttons - only update if there's a .button-text element
        // Don't overwrite emoji icons
        document.querySelectorAll('.emotion-btn').forEach(btn => {
            const emotion = btn.dataset.emotion;
            const textNode = btn.querySelector('.button-text');
            if (emotion && textNode && this.config.emotionLabels[emotion]) {
                textNode.textContent = this.config.emotionLabels[emotion];
            }
        });

        // Gesture buttons - only update if there's a .button-text element
        document.querySelectorAll('.gesture-btn').forEach(btn => {
            const gesture = btn.dataset.gesture;
            const textNode = btn.querySelector('.button-text');
            if (gesture && textNode && this.config.gestureLabels[gesture]) {
                textNode.textContent = this.config.gestureLabels[gesture];
            }
        });

        // System control buttons
        const systemMappings = [
            { id: 'fps-toggle', key: 'toggleFPS' },
            { id: 'blinking-toggle', key: 'toggleBlinking' },
            { id: 'gaze-toggle', key: 'toggleGaze' },
            { id: 'record-toggle', key: 'recordToggle' }
        ];

        systemMappings.forEach(mapping => {
            const btn = document.getElementById(mapping.id);
            const textNode = btn ? btn.querySelector('.button-text') : null;
            if (btn && textNode && this.config.systemLabels[mapping.key]) {
                textNode.textContent = this.config.systemLabels[mapping.key];
            }
        });
    }

    /**
     * Apply ARIA labels
     */
    applyAriaLabels() {
        const ariaMappings = [
            { selector: '.controls-left', label: 'emotionControls' },
            { selector: '.controls-right', label: 'gestureControls' },
            { selector: '.system-controls', label: 'systemControls' },
            { selector: '#audio-viz-section', label: 'audioControls' }
        ];

        ariaMappings.forEach(mapping => {
            const element = document.querySelector(mapping.selector);
            if (element && this.config.ariaLabels[mapping.label]) {
                element.setAttribute('aria-label', this.config.ariaLabels[mapping.label]);
            }
        });
    }

    /**
     * Get a specific string
     */
    getString(path) {
        const keys = path.split('.');
        let value = this.config;

        for (const key of keys) {
            value = value[key];
            if (value === undefined) return null;
        }

        return value;
    }

    /**
     * Update a specific string
     */
    setString(path, newValue) {
        const keys = path.split('.');
        let obj = this.config;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!obj[keys[i]]) obj[keys[i]] = {};
            obj = obj[keys[i]];
        }

        obj[keys[keys.length - 1]] = newValue;
    }

    /**
     * Get all strings for a category
     */
    getCategory(category) {
        return this.config[category] || {};
    }

    /**
     * Update multiple strings
     */
    updateStrings(updates) {
        for (const [path, value] of Object.entries(updates)) {
            this.setString(path, value);
        }
        // Reapply to DOM
        this.init();
    }

    /**
     * Load strings from JSON
     */
    async loadFromJSON(url) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            this.config = { ...this.config, ...data };
            this.init();
        } catch (error) {
            console.error('Failed to load UI strings:', error);
        }
    }

    /**
     * Export strings as JSON
     */
    exportJSON() {
        return JSON.stringify(this.config, null, 2);
    }

    /**
     * Get localized string (future enhancement)
     */
    getLocalized(key, locale = null) {
        // This could be expanded to support multiple languages
        const targetLocale = locale || this.config.locale;
        return this.getString(key);
    }
}

// ES6 Module Export
export { UIStringsConfig };
export default UIStringsConfig;

// LEGAL WARNING: This code is protected by copyright law and international treaties.
// Unauthorized reproduction or distribution of this code, or any portion of it,
// may result in severe civil and criminal penalties, and will be prosecuted
// to the maximum extent possible under the law.