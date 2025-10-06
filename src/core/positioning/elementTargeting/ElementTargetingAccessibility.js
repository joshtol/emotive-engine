/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Element Targeting Accessibility
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Element targeting with accessibility features for mascot movement
 * @author Emotive Engine Team
 * @module positioning/elementTargeting/ElementTargetingAccessibility
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Provides element targeting with accessibility features including screen reader      
 * ║ support, keyboard navigation, high contrast mode, and reduced motion support.      
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

import ElementTargeting from './ElementTargeting.js';

class ElementTargetingAccessibility extends ElementTargeting {
    constructor(positionController) {
        super(positionController);
        this.accessibilityOptions = {
            screenReader: true,
            keyboardNavigation: true,
            highContrast: false,
            reducedMotion: false,
            announcements: true
        };
        this.announcements = [];
        this.keyboardListeners = new Map();
        this.focusableElements = new Set();
        this.currentFocusIndex = 0;
        this.focusOrder = [];
    }

    /**
     * Move mascot to element with screen reader support
     * @param {string} targetSelector - CSS selector for target element
     * @param {Object} screenReaderOptions - Screen reader options
     * @param {string} position - Position relative to element
     * @param {Object} offset - Pixel offset
     */
    moveToElementWithScreenReader(targetSelector, screenReaderOptions = {}, position = 'right', offset = { x: 20, y: 0 }) {
        const element = document.querySelector(targetSelector);
        if (!element) {
            console.warn(`Element not found: ${targetSelector}`);
            return;
        }

        const {
            announce = true,
            announcement = 'Mascot moved to element',
            role = 'button',
            label = element.textContent || element.alt || 'Interactive element'
        } = screenReaderOptions;

        // Move mascot to element
        this.moveToElement(targetSelector, position, offset);

        // Announce to screen reader
        if (announce && this.accessibilityOptions.screenReader) {
            this.announceToScreenReader(announcement);
        }

        // Set ARIA attributes
        if (element) {
            element.setAttribute('role', role);
            element.setAttribute('aria-label', label);
            element.setAttribute('aria-live', 'polite');
        }
    }

    /**
     * Move mascot to element with keyboard navigation
     * @param {string} targetSelector - CSS selector for target element
     * @param {Object} keyboardOptions - Keyboard navigation options
     * @param {string} position - Position relative to element
     * @param {Object} offset - Pixel offset
     */
    moveToElementWithKeyboard(targetSelector, keyboardOptions = {}, position = 'right', offset = { x: 20, y: 0 }) {
        const element = document.querySelector(targetSelector);
        if (!element) {
            console.warn(`Element not found: ${targetSelector}`);
            return;
        }

        const {
            onKeyDown = null,
            onKeyUp = null,
            onEnter = null,
            onEscape = null,
            onArrowKeys = null
        } = keyboardOptions;

        const keyboardId = `keyboard-${Date.now()}-${Math.random()}`;

        const handleKeyDown = event => {
            if (onKeyDown) onKeyDown(event);

            switch (event.key) {
            case 'Enter':
            case ' ':
                if (onEnter) onEnter(event);
                break;
            case 'Escape':
                if (onEscape) onEscape(event);
                break;
            case 'ArrowUp':
            case 'ArrowDown':
            case 'ArrowLeft':
            case 'ArrowRight':
                if (onArrowKeys) onArrowKeys(event);
                break;
            }
        };

        const handleKeyUp = event => {
            if (onKeyUp) onKeyUp(event);
        };

        // Make element focusable
        if (!element.hasAttribute('tabindex')) {
            element.setAttribute('tabindex', '0');
        }

        // Add keyboard listeners
        element.addEventListener('keydown', handleKeyDown);
        element.addEventListener('keyup', handleKeyUp);

        this.keyboardListeners.set(keyboardId, {
            element,
            events: [
                { event: 'keydown', handler: handleKeyDown },
                { event: 'keyup', handler: handleKeyUp }
            ]
        });

        // Move mascot to element
        this.moveToElement(targetSelector, position, offset);

        return () => {
            const listener = this.keyboardListeners.get(keyboardId);
            if (listener) {
                listener.events.forEach(({ event, handler }) => {
                    listener.element.removeEventListener(event, handler);
                });
                this.keyboardListeners.delete(keyboardId);
            }
        };
    }

    /**
     * Move mascot to element with high contrast mode
     * @param {string} targetSelector - CSS selector for target element
     * @param {Object} contrastOptions - High contrast options
     * @param {string} position - Position relative to element
     * @param {Object} offset - Pixel offset
     */
    moveToElementWithHighContrast(targetSelector, contrastOptions = {}, position = 'right', offset = { x: 20, y: 0 }) {
        const element = document.querySelector(targetSelector);
        if (!element) {
            console.warn(`Element not found: ${targetSelector}`);
            return;
        }

        const {
            contrastRatio = 4.5,
            backgroundColor = '#000000',
            textColor = '#ffffff',
            borderColor = '#ffffff',
            borderWidth = 2
        } = contrastOptions;

        // Apply high contrast styles
        if (this.accessibilityOptions.highContrast) {
            element.style.backgroundColor = backgroundColor;
            element.style.color = textColor;
            element.style.border = `${borderWidth}px solid ${borderColor}`;
            element.style.outline = `${borderWidth}px solid ${borderColor}`;
        }

        // Move mascot to element
        this.moveToElement(targetSelector, position, offset);
    }

    /**
     * Move mascot to element with reduced motion support
     * @param {string} targetSelector - CSS selector for target element
     * @param {Object} motionOptions - Reduced motion options
     * @param {string} position - Position relative to element
     * @param {Object} offset - Pixel offset
     */
    moveToElementWithReducedMotion(targetSelector, motionOptions = {}, position = 'right', offset = { x: 20, y: 0 }) {
        const element = document.querySelector(targetSelector);
        if (!element) {
            console.warn(`Element not found: ${targetSelector}`);
            return;
        }

        const {
            instant = false,
            duration = 0,
            easing = 'linear'
        } = motionOptions;

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion || this.accessibilityOptions.reducedMotion) {
            // Instant movement without animation
            this.moveToElement(targetSelector, position, offset);
        } else {
            // Normal movement with animation
            this.moveToElement(targetSelector, position, offset, { duration, easing });
        }
    }

    /**
     * Move mascot to element with focus management
     * @param {string} targetSelector - CSS selector for target element
     * @param {Object} focusOptions - Focus management options
     * @param {string} position - Position relative to element
     * @param {Object} offset - Pixel offset
     */
    moveToElementWithFocus(targetSelector, focusOptions = {}, position = 'right', offset = { x: 20, y: 0 }) {
        const element = document.querySelector(targetSelector);
        if (!element) {
            console.warn(`Element not found: ${targetSelector}`);
            return;
        }

        const {
            autoFocus = false,
            focusRing = true,
            focusOrder = []
        } = focusOptions;

        // Add to focus order
        if (focusOrder.length > 0) {
            this.focusOrder = focusOrder;
        } else if (!this.focusOrder.includes(targetSelector)) {
            this.focusOrder.push(targetSelector);
        }

        // Make element focusable
        if (!element.hasAttribute('tabindex')) {
            element.setAttribute('tabindex', '0');
        }

        // Apply focus ring styles
        if (focusRing) {
            element.style.outline = '2px solid #0066cc';
            element.style.outlineOffset = '2px';
        }

        // Auto focus if requested
        if (autoFocus) {
            element.focus();
        }

        // Move mascot to element
        this.moveToElement(targetSelector, position, offset);
    }

    /**
     * Navigate focus order
     * @param {string} direction - 'next' or 'previous'
     */
    navigateFocus(direction = 'next') {
        if (this.focusOrder.length === 0) return;

        if (direction === 'next') {
            this.currentFocusIndex = (this.currentFocusIndex + 1) % this.focusOrder.length;
        } else {
            this.currentFocusIndex = (this.currentFocusIndex - 1 + this.focusOrder.length) % this.focusOrder.length;
        }

        const targetSelector = this.focusOrder[this.currentFocusIndex];
        const element = document.querySelector(targetSelector);
        
        if (element) {
            element.focus();
            this.moveToElement(targetSelector, 'right', { x: 20, y: 0 });
        }
    }

    /**
     * Announce message to screen reader
     * @param {string} message - Message to announce
     */
    announceToScreenReader(message) {
        if (!this.accessibilityOptions.announcements) return;

        // Create or update live region
        let liveRegion = document.getElementById('mascot-live-region');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'mascot-live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.style.position = 'absolute';
            liveRegion.style.left = '-10000px';
            liveRegion.style.width = '1px';
            liveRegion.style.height = '1px';
            liveRegion.style.overflow = 'hidden';
            document.body.appendChild(liveRegion);
        }

        // Announce message
        liveRegion.textContent = message;
        
        // Clear after announcement
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    }

    /**
     * Enable accessibility features
     * @param {Object} options - Accessibility options to enable
     */
    enableAccessibility(options = {}) {
        this.accessibilityOptions = { ...this.accessibilityOptions, ...options };
    }

    /**
     * Disable accessibility features
     * @param {Object} options - Accessibility options to disable
     */
    disableAccessibility(options = {}) {
        Object.keys(options).forEach(key => {
            if (Object.prototype.hasOwnProperty.call(this.accessibilityOptions, key)) {
                this.accessibilityOptions[key] = false;
            }
        });
    }

    /**
     * Check if accessibility feature is enabled
     * @param {string} feature - Feature name
     * @returns {boolean} True if feature is enabled
     */
    isAccessibilityEnabled(feature) {
        return this.accessibilityOptions[feature] || false;
    }

    /**
     * Get current accessibility options
     * @returns {Object} Current accessibility options
     */
    getAccessibilityOptions() {
        return { ...this.accessibilityOptions };
    }

    /**
     * Destroy the accessibility system
     */
    destroy() {
        // Remove keyboard listeners
        this.keyboardListeners.forEach((listener, id) => {
            listener.events.forEach(({ event, handler }) => {
                listener.element.removeEventListener(event, handler);
            });
        });
        this.keyboardListeners.clear();

        // Remove live region
        const liveRegion = document.getElementById('mascot-live-region');
        if (liveRegion) {
            document.body.removeChild(liveRegion);
        }

        // Clear focus order
        this.focusOrder = [];
        this.currentFocusIndex = 0;

        super.destroy();
    }
}

export default ElementTargetingAccessibility;

