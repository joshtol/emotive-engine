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
 * IconsConfig - Centralized icons and symbols configuration
 * Manages all emoji icons, symbols, and visual indicators
 */
class IconsConfig {
    constructor(options = {}) {
        // Configuration with defaults
        this.config = {
            // Emotion icons (emojis)
            emotions: {
                neutral: '😐',
                calm: '😌',
                joy: '😊',
                excited: '🤩',
                love: '🥰',
                euphoria: '✨',
                surprise: '😲',
                fear: '😨',
                disgust: '🤢',
                sadness: '😢',
                anger: '😠',
                glitch: '👾',
                ...options.emotions
            },

            // Shape icons
            shapes: {
                heart: '♥',
                triangle: '△',
                square: '□',
                circle: '○',
                star: '★',
                sun: '☀',
                solar: '☉',
                moon: '☾',
                lunar: '●',
                ...options.shapes
            },

            // Dice/randomizer icons
            dice: {
                default: '../assets/dice.svg',
                isImage: true,
                ...options.dice
            },

            // System control icons
            system: {
                fps: '📊',
                blinking: '👁',
                gaze: '👀',
                record: '⏺',
                play: '▶',
                pause: '⏸',
                stop: '⏹',
                settings: '⚙',
                ...options.system
            },

            // BPM modifier icons
            bpmModifiers: {
                half: '0.5×',
                normal: '1×',
                double: '2×',
                ...options.bpmModifiers
            },

            // Status indicators
            status: {
                loading: '⏳',
                success: '✅',
                error: '❌',
                warning: '⚠️',
                info: 'ℹ️',
                ...options.status
            },

            // Theme icons (SVG paths or Unicode)
            themes: {
                light: '☀️',
                dark: '🌙',
                night: '🌃',
                cyber: '💻',
                ...options.themes
            },

            // Enable automatic application to DOM
            autoApply: options.autoApply !== false,

            ...options
        };
    }

    /**
     * Initialize and apply icons to DOM
     */
    init() {
        if (this.config.autoApply) {
            this.applyIcons();
        }
        return this;
    }

    /**
     * Apply all icons to their respective elements
     */
    applyIcons() {
        this.applyEmotionIcons();
        this.applyShapeIcons();
        this.applyDiceIcons();
        this.applySystemIcons();
    }

    /**
     * Apply emotion icons to buttons
     */
    applyEmotionIcons() {
        document.querySelectorAll('.emotion-btn').forEach(btn => {
            const emotion = btn.dataset.emotion;
            if (emotion && this.config.emotions[emotion]) {
                this.setButtonIcon(btn, this.config.emotions[emotion]);
            }
        });
    }

    /**
     * Apply shape icons to buttons
     */
    applyShapeIcons() {
        // Shape buttons already have icons in HTML, skip adding them again
        // document.querySelectorAll('.shape-btn').forEach(btn => {
        //     const shape = btn.dataset.shape;
        //     if (shape && this.config.shapes[shape]) {
        //         this.setButtonIcon(btn, this.config.shapes[shape]);
        //     }
        // });
    }

    /**
     * Apply dice icons
     */
    applyDiceIcons() {
        document.querySelectorAll('.dice-btn').forEach(btn => {
            // Always apply dice icon (replacing any existing content)
            this.setDiceIcon(btn, this.config.dice.default);
        });
    }

    /**
     * Apply system control icons
     */
    applySystemIcons() {
        const mappings = [
            { id: 'fps-toggle', key: 'fps' },
            { id: 'blinking-toggle', key: 'blinking' },
            { id: 'gaze-toggle', key: 'gaze' },
            { id: 'record-toggle', key: 'record' }
        ];

        mappings.forEach(mapping => {
            const btn = document.getElementById(mapping.id);
            if (btn && this.config.system[mapping.key]) {
                this.setButtonIcon(btn, this.config.system[mapping.key]);
            }
        });
    }

    /**
     * Set dice icon (SVG image)
     */
    setDiceIcon(button, iconPath) {
        // Clear existing content
        button.innerHTML = '';

        // Create img element for SVG
        const img = document.createElement('img');
        img.src = iconPath;
        img.className = 'dice-icon';
        img.alt = 'Dice';
        img.style.width = '24px';
        img.style.height = '24px';
        img.style.filter = 'var(--icon-filter, none)';

        button.appendChild(img);
    }

    /**
     * Set button icon content
     */
    setButtonIcon(button, icon) {
        // Check if button has a specific icon element
        let iconElement = button.querySelector('.icon-element');

        if (!iconElement) {
            // Check if button already contains only text/emoji
            const currentContent = button.textContent.trim();

            // If button has text content that's not an emoji/icon, preserve it
            if (currentContent && !this.isIcon(currentContent)) {
                // Create icon element to separate icon from text
                iconElement = document.createElement('span');
                iconElement.className = 'icon-element';
                button.insertBefore(iconElement, button.firstChild);
            } else {
                // Replace entire content if it's already an icon or empty
                button.textContent = icon;
                return;
            }
        }

        if (iconElement) {
            iconElement.textContent = icon;
        }
    }

    /**
     * Check if text is likely an icon/emoji
     */
    isIcon(text) {
        // Check if text is emoji or special character
        return text.length <= 3 && /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[☀-⛿]|[✀-➿]/u.test(text);
    }

    /**
     * Get icon for a specific category and key
     */
    getIcon(category, key) {
        return this.config[category]?.[key] || '';
    }

    /**
     * Set icon for a specific category and key
     */
    setIcon(category, key, icon) {
        if (!this.config[category]) {
            this.config[category] = {};
        }
        this.config[category][key] = icon;
    }

    /**
     * Update multiple icons
     */
    updateIcons(updates) {
        for (const [category, icons] of Object.entries(updates)) {
            for (const [key, icon] of Object.entries(icons)) {
                this.setIcon(category, key, icon);
            }
        }
        if (this.config.autoApply) {
            this.applyIcons();
        }
    }

    /**
     * Create icon element
     */
    createIconElement(icon, className = 'icon') {
        const span = document.createElement('span');
        span.className = className;
        span.textContent = icon;
        return span;
    }

    /**
     * Get all icons for a category
     */
    getCategory(category) {
        return this.config[category] ? { ...this.config[category] } : {};
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
            if (this.config.autoApply) {
                this.applyIcons();
            }
        } catch (error) {
            console.error('Failed to load icons config:', error);
        }
    }

    /**
     * Reset to default icons
     */
    reset() {
        this.config = new IconsConfig().config;
        if (this.config.autoApply) {
            this.applyIcons();
        }
    }
}

// ES6 Module Export
export { IconsConfig };
export default IconsConfig;

// LEGAL WARNING: This code is protected by copyright law and international treaties.
// Unauthorized reproduction or distribution of this code, or any portion of it,
// may result in severe civil and criminal penalties, and will be prosecuted
// to the maximum extent possible under the law.