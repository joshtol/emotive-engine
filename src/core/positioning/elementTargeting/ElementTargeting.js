/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Element Targeting System
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Element-based positioning methods for mascot targeting
 * @author Emotive Engine Team
 * @module positioning/ElementTargeting
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Provides methods to position the mascot relative to DOM elements dynamically.     
 * ║ Handles common UI elements like buttons, forms, modals, and navigation.           
 * ║ Automatically updates position when elements move or resize.                      
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

class ElementTargeting {
    constructor(positionController) {
        this.positionController = positionController;
        this.watchedElements = new Map();
        this.updateCallbacks = new Map();
    }

    /**
     * Move mascot to any element with flexible positioning
     * @param {string} targetSelector - CSS selector for target element
     * @param {string} position - 'right', 'left', 'above', 'below', 'center'
     * @param {Object} offset - {x, y} pixel offset
     * @param {Object} options - Additional options
     */
    moveToElement(targetSelector, position = 'right', offset = { x: 20, y: 0 }, options = {}) {
        const element = document.querySelector(targetSelector);
        if (!element) {
            console.warn(`Element not found: ${targetSelector}`);
            return;
        }

        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let targetX, targetY;
        switch (position) {
        case 'right':
            targetX = rect.right + offset.x;
            targetY = centerY + offset.y;
            break;
        case 'left':
            targetX = rect.left - offset.x;
            targetY = centerY + offset.y;
            break;
        case 'above':
            targetX = centerX + offset.x;
            targetY = rect.top - offset.y;
            break;
        case 'below':
            targetX = centerX + offset.x;
            targetY = rect.bottom + offset.y;
            break;
        case 'center':
            targetX = centerX + offset.x;
            targetY = centerY + offset.y;
            break;
        default:
            targetX = rect.right + offset.x;
            targetY = centerY + offset.y;
        }

        // Convert to mascot coordinate system
        const mascotX = targetX - window.innerWidth / 2;
        const mascotY = targetY - window.innerHeight / 2;

        if (options.animate !== false) {
            this.positionController.animateOffset(mascotX, mascotY, 0, options.duration || 1000, options.easing || 'easeOutCubic');
        } else {
            this.positionController.setOffset(mascotX, mascotY, 0);
        }
    }

    /**
     * Move mascot to any button element
     * @param {string} selector - CSS selector for button (optional)
     * @param {string} position - Position relative to button
     * @param {Object} offset - Pixel offset
     */
    moveToButton(selector = 'button', position = 'right', offset = { x: 20, y: 0 }) {
        this.moveToElement(selector, position, offset);
    }

    /**
     * Move mascot to form elements
     * @param {string} selector - CSS selector for form
     * @param {string} position - Position relative to form
     * @param {Object} offset - Pixel offset
     */
    moveToForm(selector = 'form', position = 'right', offset = { x: 20, y: 0 }) {
        this.moveToElement(selector, position, offset);
    }

    /**
     * Move mascot to modal/dialog elements
     * @param {string} selector - CSS selector for modal
     * @param {string} position - Position relative to modal
     * @param {Object} offset - Pixel offset
     */
    moveToModal(selector = '[role="dialog"], .modal', position = 'center', offset = { x: 0, y: 0 }) {
        this.moveToElement(selector, position, offset);
    }

    /**
     * Move mascot to navigation elements
     * @param {string} selector - CSS selector for navigation
     * @param {string} position - Position relative to navigation
     * @param {Object} offset - Pixel offset
     */
    moveToNavigation(selector = 'nav, .navigation', position = 'below', offset = { x: 0, y: 20 }) {
        this.moveToElement(selector, position, offset);
    }

    /**
     * Move mascot to main content areas
     * @param {string} selector - CSS selector for content
     * @param {string} position - Position relative to content
     * @param {Object} offset - Pixel offset
     */
    moveToContent(selector = 'main, .content', position = 'center', offset = { x: 0, y: 0 }) {
        this.moveToElement(selector, position, offset);
    }

    /**
     * Move mascot to sidebar elements
     * @param {string} selector - CSS selector for sidebar
     * @param {string} position - Position relative to sidebar
     * @param {Object} offset - Pixel offset
     */
    moveToSidebar(selector = '.sidebar, aside', position = 'right', offset = { x: 20, y: 0 }) {
        this.moveToElement(selector, position, offset);
    }

    /**
     * Move mascot to header elements
     * @param {string} selector - CSS selector for header
     * @param {string} position - Position relative to header
     * @param {Object} offset - Pixel offset
     */
    moveToHeader(selector = 'header, .header', position = 'below', offset = { x: 0, y: 20 }) {
        this.moveToElement(selector, position, offset);
    }

    /**
     * Move mascot to footer elements
     * @param {string} selector - CSS selector for footer
     * @param {string} position - Position relative to footer
     * @param {Object} offset - Pixel offset
     */
    moveToFooter(selector = 'footer, .footer', position = 'above', offset = { x: 0, y: 20 }) {
        this.moveToElement(selector, position, offset);
    }

    /**
     * Watch an element and update mascot position when it moves
     * @param {string} targetSelector - CSS selector for target element
     * @param {string} position - Position relative to element
     * @param {Object} offset - Pixel offset
     * @returns {Function} Cleanup function to stop watching
     */
    watchElement(targetSelector, position = 'right', offset = { x: 20, y: 0 }) {
        const updatePosition = () => {
            this.moveToElement(targetSelector, position, offset, { animate: false });
        };

        // Store the callback for cleanup
        const callbackId = `${targetSelector}-${position}-${JSON.stringify(offset)}`;
        this.updateCallbacks.set(callbackId, updatePosition);

        // Add event listeners
        window.addEventListener('scroll', updatePosition);
        window.addEventListener('resize', updatePosition);
        
        // Initial positioning
        updatePosition();

        // Return cleanup function
        return () => {
            window.removeEventListener('scroll', updatePosition);
            window.removeEventListener('resize', updatePosition);
            this.updateCallbacks.delete(callbackId);
        };
    }

    /**
     * Stop watching all elements
     */
    stopWatchingAll() {
        this.updateCallbacks.forEach(callback => {
            window.removeEventListener('scroll', callback);
            window.removeEventListener('resize', callback);
        });
        this.updateCallbacks.clear();
    }

    /**
     * Destroy the targeting system
     */
    destroy() {
        this.stopWatchingAll();
        this.positionController = null;
    }
}

export default ElementTargeting;
