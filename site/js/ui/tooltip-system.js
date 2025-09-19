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
 * TooltipSystem - HUD tooltip management for UI controls
 * Provides contextual tooltips with activation animations
 */
class TooltipSystem {
    constructor(options = {}) {
        // Configuration
        this.config = {
            tooltipElementId: options.tooltipElementId || 'hud-tooltip',
            fadeInDelay: options.fadeInDelay || 0,
            fadeOutDelay: options.fadeOutDelay || 100,
            activatedDuration: options.activatedDuration || 1500,
            activationAnimDuration: options.activationAnimDuration || 300,
            ...options
        };

        // Tooltip text mappings
        this.tooltips = {
            'load-audio-btn': 'Play Demo Song',
            'load-song-btn': 'Load Audio File',
            'blinking-toggle': 'Toggle Blinking',
            'gaze-toggle': 'Toggle Gaze Tracking',
            'fps-toggle': 'Show FPS Counter',
            'record-btn': 'Record Audio',
            'randomize-all-btn': 'Randomize Everything',
            ...options.customTooltips
        };

        // State-based tooltip messages
        this.stateMessages = {
            'blinking-toggle': {
                active: 'Blinking Enabled',
                inactive: 'Blinking Disabled'
            },
            'gaze-toggle': {
                active: 'Gaze Tracking On',
                inactive: 'Gaze Tracking Off'
            },
            'fps-toggle': {
                active: 'FPS Display On',
                inactive: 'FPS Display Off'
            },
            'record-btn': {
                active: 'Recording Started',
                inactive: 'Recording Stopped'
            },
            ...options.customStateMessages
        };

        // State
        this.element = null;
        this.timeout = null;
        this.attachedElements = new WeakMap();
    }

    /**
     * Initialize the tooltip system
     */
    init() {
        this.element = document.getElementById(this.config.tooltipElementId);

        if (!this.element) {
            console.warn('TooltipSystem: Tooltip element not found');
            return this;
        }

        // Auto-attach to system controls if they exist
        this.attachToSystemControls();

        return this;
    }

    /**
     * Show a tooltip
     */
    show(text, activated = false) {
        if (!this.element) return;

        clearTimeout(this.timeout);
        this.element.textContent = text;
        this.element.classList.add('visible');

        if (activated) {
            this.element.classList.add('activated');

            // Remove activation animation after duration
            setTimeout(() => {
                this.element.classList.remove('activated');
            }, this.config.activationAnimDuration);

            // Start fading out after activated duration
            this.timeout = setTimeout(() => {
                this.element.classList.remove('visible');
            }, this.config.activatedDuration);
        }
    }

    /**
     * Hide the tooltip
     */
    hide() {
        if (!this.element) return;

        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.element.classList.remove('visible');
            this.element.classList.remove('activated');
        }, this.config.fadeOutDelay);
    }

    /**
     * Attach tooltip to an element
     */
    attachToElement(element, text, options = {}) {
        const tooltipText = text || this.tooltips[element.id] || element.getAttribute('aria-label') || '';

        if (!tooltipText) return;

        // Store handlers so we can remove them later
        const handlers = {
            mouseenter: () => this.show(tooltipText),
            mouseleave: () => this.hide(),
            click: () => this.handleClick(element, tooltipText, options)
        };

        this.attachedElements.set(element, handlers);

        element.addEventListener('mouseenter', handlers.mouseenter);
        element.addEventListener('mouseleave', handlers.mouseleave);

        if (options.showOnClick !== false) {
            element.addEventListener('click', handlers.click);
        }
    }

    /**
     * Handle click event for state-based tooltips
     */
    handleClick(element, defaultText, options = {}) {
        const isActive = element.classList.contains('active');
        const stateMessage = this.stateMessages[element.id];

        let text = defaultText;

        if (stateMessage) {
            text = isActive ? stateMessage.active : stateMessage.inactive;
        }

        this.show(text, true);
    }

    /**
     * Attach tooltips to system control buttons
     */
    attachToSystemControls() {
        const buttons = document.querySelectorAll('.system-controls .sci-fi-btn');

        buttons.forEach(btn => {
            this.attachToElement(btn);
        });
    }

    /**
     * Attach to multiple elements by selector
     */
    attachToElements(selector, options = {}) {
        const elements = document.querySelectorAll(selector);

        elements.forEach(element => {
            this.attachToElement(element, null, options);
        });
    }

    /**
     * Update tooltip text for an element
     */
    updateTooltip(elementId, text) {
        this.tooltips[elementId] = text;
    }

    /**
     * Update state messages for an element
     */
    updateStateMessages(elementId, activeMsg, inactiveMsg) {
        this.stateMessages[elementId] = {
            active: activeMsg,
            inactive: inactiveMsg
        };
    }

    /**
     * Remove tooltip from element
     */
    detachFromElement(element) {
        const handlers = this.attachedElements.get(element);

        if (handlers) {
            element.removeEventListener('mouseenter', handlers.mouseenter);
            element.removeEventListener('mouseleave', handlers.mouseleave);
            element.removeEventListener('click', handlers.click);
            this.attachedElements.delete(element);
        }
    }

    /**
     * Clean up
     */
    destroy() {
        clearTimeout(this.timeout);

        // Remove all attached event listeners
        this.attachedElements = new WeakMap();

        if (this.element) {
            this.element.classList.remove('visible', 'activated');
        }
    }
}

// ES6 Module Export
export { TooltipSystem };

// LEGAL WARNING: This code is protected by copyright law and international treaties.
// Unauthorized reproduction or distribution of this code, or any portion of it,
// may result in severe civil and criminal penalties, and will be prosecuted
// to the maximum extent possible under the law.