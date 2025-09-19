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
 * UndertoneController - Manages undertone slider and mappings
 * Handles value-to-undertone mappings, display text, and debounced updates
 */
class UndertoneController {
    constructor(options = {}) {
        // Configuration
        this.config = {
            // Slider settings
            sliderId: options.sliderId || 'undertone-slider',
            valueDisplayId: options.valueDisplayId || 'undertone-value',

            // Debounce settings
            debounceDelay: options.debounceDelay || 50,

            // Default display when no undertone
            defaultDisplayText: options.defaultDisplayText || 'CLEAR',

            ...options
        };

        // Undertone mappings - configurable
        this.undertoneMap = options.undertoneMap || {
            '-3': {
                undertone: 'subdued',
                displayText: 'SUBDUED'
            },
            '-2': {
                undertone: 'tired',
                displayText: 'TIRED'
            },
            '-1': {
                undertone: 'nervous',
                displayText: 'NERVOUS'
            },
            '0': {
                undertone: '',
                displayText: 'CLEAR'
            },
            '1': {
                undertone: 'energetic',
                displayText: 'ENERGETIC'
            },
            '2': {
                undertone: 'confident',
                displayText: 'CONFIDENT'
            },
            '3': {
                undertone: 'intense',
                displayText: 'INTENSE'
            }
        };

        // References
        this.mascot = null;
        this.app = null;
        this.slider = null;
        this.valueDisplay = null;

        // State
        this.state = {
            currentValue: 0,
            currentUndertone: '',
            lastUndertone: '',
            debounceTimer: null
        };

        // Callbacks
        this.onUndertoneChange = options.onUndertoneChange || null;
        this.onDisplayUpdate = options.onDisplayUpdate || null;
    }

    /**
     * Initialize the controller
     */
    init(app = null, mascot = null) {
        this.app = app || window.app;
        this.mascot = mascot || window.mascot;

        // Get DOM elements
        this.slider = document.getElementById(this.config.sliderId);
        this.valueDisplay = document.getElementById(this.config.valueDisplayId);

        if (!this.slider) {
            console.warn('UndertoneController: Slider element not found');
            return this;
        }

        // Set up event listeners
        this.setupEventListeners();

        // Initialize slider visual
        this.updateSliderBackground();

        return this;
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        if (!this.slider) return;

        this.slider.addEventListener('input', (e) => {
            this.handleSliderInput(parseInt(e.target.value));
        });
    }

    /**
     * Handle slider input
     */
    handleSliderInput(value) {
        this.state.currentValue = value;

        // Get undertone mapping
        const mapping = this.getUndertoneMapping(value);

        // Update slider visual
        this.updateSliderBackground();

        // Update display text immediately for responsiveness
        if (this.valueDisplay) {
            this.valueDisplay.textContent = mapping.displayText;
        }

        // Only update mascot when undertone actually changes
        if (mapping.undertone !== this.state.lastUndertone) {
            this.state.lastUndertone = mapping.undertone;
            this.state.currentUndertone = mapping.undertone;

            // Debounce the mascot update for smoothness
            this.debouncedMascotUpdate();
        }
    }

    /**
     * Get undertone mapping from value
     */
    getUndertoneMapping(value) {
        const mapping = this.undertoneMap[value.toString()];

        if (mapping) {
            return mapping;
        }

        // Default fallback
        return {
            undertone: '',
            displayText: this.config.defaultDisplayText
        };
    }

    /**
     * Debounced mascot update
     */
    debouncedMascotUpdate() {
        // Clear any pending update
        if (this.state.debounceTimer) {
            clearTimeout(this.state.debounceTimer);
        }

        // Debounce the update
        this.state.debounceTimer = setTimeout(() => {
            this.updateMascot();
        }, this.config.debounceDelay);
    }

    /**
     * Update mascot with current undertone
     */
    updateMascot() {
        if (!this.mascot) return;

        const undertone = this.state.currentUndertone;

        // Use updateUndertone to prevent glow multiplication
        if (this.mascot.updateUndertone) {
            this.mascot.updateUndertone(undertone || null);
        } else {
            // Fallback to setEmotion if direct method not available
            const currentEmotion = window.currentEmotion || 'neutral';
            this.mascot.setEmotion(currentEmotion, undertone || undefined);
        }

        // Trigger callbacks
        if (this.onUndertoneChange) {
            this.onUndertoneChange(undertone);
        }

        // Update display if callback provided
        if (this.onDisplayUpdate) {
            this.onDisplayUpdate();
        }

        // Update global for backward compatibility
        window.currentUndertone = undertone;
    }

    /**
     * Update slider background visual
     */
    updateSliderBackground() {
        if (!this.slider) return;

        // Call global function if it exists (for visual styling)
        if (typeof window.updateSliderBackground === 'function') {
            window.updateSliderBackground(this.slider);
        }
    }

    /**
     * Set undertone programmatically
     */
    setUndertone(undertone) {
        // Find the value for this undertone
        for (const [value, mapping] of Object.entries(this.undertoneMap)) {
            if (mapping.undertone === undertone) {
                this.setValue(parseInt(value));
                return;
            }
        }
    }

    /**
     * Set slider value programmatically
     */
    setValue(value) {
        if (!this.slider) return;

        this.slider.value = value;
        this.handleSliderInput(value);
    }

    /**
     * Get current undertone
     */
    getUndertone() {
        return this.state.currentUndertone;
    }

    /**
     * Get current value
     */
    getValue() {
        return this.state.currentValue;
    }

    /**
     * Add or update undertone mapping
     */
    addMapping(value, undertone, displayText) {
        this.undertoneMap[value.toString()] = {
            undertone,
            displayText
        };
    }

    /**
     * Update configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }

    /**
     * Set mascot reference
     */
    setMascot(mascot) {
        this.mascot = mascot;
    }

    /**
     * Reset to default
     */
    reset() {
        this.setValue(0);
    }

    /**
     * Clean up
     */
    destroy() {
        if (this.state.debounceTimer) {
            clearTimeout(this.state.debounceTimer);
        }
    }
}

// Export for use as ES6 module
export { UndertoneController };

// LEGAL WARNING: This code is protected by copyright law and international treaties.
// Unauthorized reproduction or distribution of this code, or any portion of it,
// may result in severe civil and criminal penalties, and will be prosecuted
// to the maximum extent possible under the law.