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
 * ScrollbarCompensator - Dynamic scrollbar width compensation
 * Automatically adjusts padding to maintain visual balance when scrollbars appear
 */
class ScrollbarCompensator {
    constructor(options = {}) {
        // Configuration
        this.config = {
            leftSelector: options.leftSelector || '.controls-left',
            rightSelector: options.rightSelector || '.controls-right',
            checkInterval: options.checkInterval || 100, // ms
            paddingProperty: options.paddingProperty || 'paddingRight',
            compensateProperty: options.compensateProperty || 'paddingLeft',
            autoStart: options.autoStart !== false,
            ...options
        };

        // State
        this.state = {
            isActive: false,
            scrollbarWidth: 0,
            hasScrollbar: false,
            observer: null,
            resizeObserver: null,
            checkIntervalId: null
        };

        // Elements
        this.elements = {
            left: null,
            right: null
        };
    }

    /**
     * Initialize the scrollbar compensator
     */
    init() {
        // Get elements
        this.elements.left = document.querySelector(this.config.leftSelector);
        this.elements.right = document.querySelector(this.config.rightSelector);

        if (!this.elements.left || !this.elements.right) {
            console.warn('ScrollbarCompensator: Required elements not found');
            return this;
        }

        // Calculate scrollbar width once
        this.state.scrollbarWidth = this.getScrollbarWidth();

        // Set up observers
        this.setupObservers();

        // Initial check
        this.checkAndCompensate();

        // Start if configured
        if (this.config.autoStart) {
            this.start();
        }

        return this;
    }

    /**
     * Get the browser's scrollbar width
     */
    getScrollbarWidth() {
        // Create temporary element to measure scrollbar
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll';
        outer.style.width = '100px';
        outer.style.position = 'absolute';
        outer.style.top = '-9999px';
        document.body.appendChild(outer);

        const inner = document.createElement('div');
        inner.style.width = '100%';
        outer.appendChild(inner);

        const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
        outer.remove();

        return scrollbarWidth;
    }

    /**
     * Check if element has scrollbar
     */
    hasVerticalScrollbar(element) {
        return element.scrollHeight > element.clientHeight;
    }

    /**
     * Check and apply compensation
     */
    checkAndCompensate() {
        if (!this.elements.left || !this.elements.right) return;

        const hasScrollbar = this.hasVerticalScrollbar(this.elements.left);

        // Only update if state changed
        if (hasScrollbar !== this.state.hasScrollbar) {
            this.state.hasScrollbar = hasScrollbar;
            this.applyCompensation(hasScrollbar);
        }
    }

    /**
     * Apply or remove compensation padding
     */
    applyCompensation(hasScrollbar) {
        if (!this.elements.right) return;

        const compensation = hasScrollbar ? this.state.scrollbarWidth : 0;

        // Apply compensation to the right panel
        this.elements.right.style[this.config.compensateProperty] = compensation + 'px';

        // Dispatch custom event
        this.dispatchEvent('compensationChanged', {
            hasScrollbar,
            compensation,
            scrollbarWidth: this.state.scrollbarWidth
        });
    }

    /**
     * Set up mutation and resize observers
     */
    setupObservers() {
        // Mutation observer for content changes
        if (window.MutationObserver) {
            this.state.observer = new MutationObserver(() => {
                this.checkAndCompensate();
            });

            if (this.elements.left) {
                this.state.observer.observe(this.elements.left, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['style', 'class']
                });
            }
        }

        // Resize observer for size changes
        if (window.ResizeObserver) {
            this.state.resizeObserver = new ResizeObserver(() => {
                this.checkAndCompensate();
            });

            if (this.elements.left) {
                this.state.resizeObserver.observe(this.elements.left);
            }
            if (this.elements.right) {
                this.state.resizeObserver.observe(this.elements.right);
            }
        }
    }

    /**
     * Start periodic checking (fallback for older browsers)
     */
    start() {
        if (this.state.isActive) return;

        this.state.isActive = true;

        // Use periodic checking as fallback
        if (!window.MutationObserver || !window.ResizeObserver) {
            this.state.checkIntervalId = setInterval(() => {
                this.checkAndCompensate();
            }, this.config.checkInterval);
        }

        this.checkAndCompensate();
    }

    /**
     * Stop checking
     */
    stop() {
        this.state.isActive = false;

        if (this.state.checkIntervalId) {
            clearInterval(this.state.checkIntervalId);
            this.state.checkIntervalId = null;
        }

        // Remove compensation
        this.applyCompensation(false);
    }

    /**
     * Clean up observers and intervals
     */
    destroy() {
        this.stop();

        if (this.state.observer) {
            this.state.observer.disconnect();
            this.state.observer = null;
        }

        if (this.state.resizeObserver) {
            this.state.resizeObserver.disconnect();
            this.state.resizeObserver = null;
        }

        // Remove compensation
        if (this.elements.right) {
            this.elements.right.style[this.config.compensateProperty] = '';
        }
    }

    /**
     * Dispatch custom event
     */
    dispatchEvent(eventName, detail) {
        if (!this.elements.right) return;

        const event = new CustomEvent(`scrollbar-${eventName}`, {
            detail,
            bubbles: true
        });
        this.elements.right.dispatchEvent(event);
    }

    /**
     * Manually trigger a check
     */
    check() {
        this.checkAndCompensate();
    }

    /**
     * Update configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };

        // Reinitialize if selectors changed
        if (config.leftSelector || config.rightSelector) {
            this.destroy();
            this.init();
        }
    }

    /**
     * Get current state
     */
    getState() {
        return {
            ...this.state,
            leftElement: this.elements.left,
            rightElement: this.elements.right
        };
    }
}

// ES6 Module Export
export { ScrollbarCompensator };

// LEGAL WARNING: This code is protected by copyright law and international treaties.
// Unauthorized reproduction or distribution of this code, or any portion of it,
// may result in severe civil and criminal penalties, and will be prosecuted
// to the maximum extent possible under the law.