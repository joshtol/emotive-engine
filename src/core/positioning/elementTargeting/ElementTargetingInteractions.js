/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Element Targeting Interactions
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Element targeting with mouse and touch interaction capabilities
 * @author Emotive Engine Team
 * @module positioning/elementTargeting/ElementTargetingInteractions
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Provides element targeting with interactive capabilities including mouse hover,    
 * ║ click tracking, touch gestures, and element interaction detection.                
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

import ElementTargeting from './ElementTargeting.js';

class ElementTargetingInteractions extends ElementTargeting {
    constructor(positionController) {
        super(positionController);
        this.activeInteractions = new Map();
        this.hoverStates = new Map();
        this.clickStates = new Map();
        this.touchStates = new Map();
    }

    /**
     * Move mascot to element and follow mouse hover
     * @param {string} targetSelector - CSS selector for target element
     * @param {Object} hoverOptions - Hover interaction options
     * @param {string} position - Position relative to element
     * @param {Object} offset - Pixel offset
     */
    moveToElementWithHover(targetSelector, hoverOptions = {}, position = 'right', offset = { x: 20, y: 0 }) {
        const element = document.querySelector(targetSelector);
        if (!element) {
            console.warn(`Element not found: ${targetSelector}`);
            return;
        }

        const interactionId = `hover-${Date.now()}-${Math.random()}`;
        const {
            onMouseEnter = null,
            onMouseLeave = null,
            onHover = null,
            followMouse = false,
            hoverDistance = 50
        } = hoverOptions;

        let isHovering = false;
        let mouseX = 0;
        let mouseY = 0;

        const handleMouseEnter = event => {
            isHovering = true;
            if (onMouseEnter) onMouseEnter(event);
        };

        const handleMouseLeave = event => {
            isHovering = false;
            if (onMouseLeave) onMouseLeave(event);
        };

        const handleMouseMove = event => {
            mouseX = event.clientX;
            mouseY = event.clientY;

            if (isHovering && onHover) {
                onHover(event);
            }

            if (followMouse && isHovering) {
                const rect = element.getBoundingClientRect();
                const elementCenterX = rect.left + rect.width / 2;
                const elementCenterY = rect.top + rect.height / 2;

                const distance = Math.sqrt(
                    Math.pow(mouseX - elementCenterX, 2) + 
                    Math.pow(mouseY - elementCenterY, 2)
                );

                if (distance <= hoverDistance) {
                    const targetX = mouseX + offset.x - window.innerWidth / 2;
                    const targetY = mouseY + offset.y - window.innerHeight / 2;
                    this.positionController.setOffset(targetX, targetY, 0);
                }
            }
        };

        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);
        element.addEventListener('mousemove', handleMouseMove);

        this.activeInteractions.set(interactionId, {
            element,
            events: [
                { event: 'mouseenter', handler: handleMouseEnter },
                { event: 'mouseleave', handler: handleMouseLeave },
                { event: 'mousemove', handler: handleMouseMove }
            ]
        });

        return () => {
            const interaction = this.activeInteractions.get(interactionId);
            if (interaction) {
                interaction.events.forEach(({ event, handler }) => {
                    interaction.element.removeEventListener(event, handler);
                });
                this.activeInteractions.delete(interactionId);
            }
        };
    }

    /**
     * Move mascot to element and track clicks
     * @param {string} targetSelector - CSS selector for target element
     * @param {Object} clickOptions - Click interaction options
     * @param {string} position - Position relative to element
     * @param {Object} offset - Pixel offset
     */
    moveToElementWithClick(targetSelector, clickOptions = {}, position = 'right', offset = { x: 20, y: 0 }) {
        const element = document.querySelector(targetSelector);
        if (!element) {
            console.warn(`Element not found: ${targetSelector}`);
            return;
        }

        const interactionId = `click-${Date.now()}-${Math.random()}`;
        const {
            onClick = null,
            onDoubleClick = null,
            clickCount = 0,
            maxClicks = 3
        } = clickOptions;

        let clickCount_current = 0;

        const handleClick = event => {
            clickCount_current++;
            if (onClick) onClick(event, clickCount_current);

            if (clickCount_current >= maxClicks) {
                // Move mascot to clicked element
                const rect = element.getBoundingClientRect();
                const targetX = rect.left + rect.width / 2 + offset.x - window.innerWidth / 2;
                const targetY = rect.top + rect.height / 2 + offset.y - window.innerHeight / 2;
                this.positionController.setOffset(targetX, targetY, 0);
            }
        };

        const handleDoubleClick = event => {
            if (onDoubleClick) onDoubleClick(event);
        };

        element.addEventListener('click', handleClick);
        element.addEventListener('dblclick', handleDoubleClick);

        this.activeInteractions.set(interactionId, {
            element,
            events: [
                { event: 'click', handler: handleClick },
                { event: 'dblclick', handler: handleDoubleClick }
            ]
        });

        return () => {
            const interaction = this.activeInteractions.get(interactionId);
            if (interaction) {
                interaction.events.forEach(({ event, handler }) => {
                    interaction.element.removeEventListener(event, handler);
                });
                this.activeInteractions.delete(interactionId);
            }
        };
    }

    /**
     * Move mascot to element and track touch gestures
     * @param {string} targetSelector - CSS selector for target element
     * @param {Object} touchOptions - Touch interaction options
     * @param {string} position - Position relative to element
     * @param {Object} offset - Pixel offset
     */
    moveToElementWithTouch(targetSelector, touchOptions = {}, position = 'right', offset = { x: 20, y: 0 }) {
        const element = document.querySelector(targetSelector);
        if (!element) {
            console.warn(`Element not found: ${targetSelector}`);
            return;
        }

        const interactionId = `touch-${Date.now()}-${Math.random()}`;
        const {
            onTouchStart = null,
            onTouchMove = null,
            onTouchEnd = null,
            onSwipe = null,
            swipeThreshold = 50
        } = touchOptions;

        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        const handleTouchStart = event => {
            if (event.touches.length > 0) {
                touchStartX = event.touches[0].clientX;
                touchStartY = event.touches[0].clientY;
                if (onTouchStart) onTouchStart(event);
            }
        };

        const handleTouchMove = event => {
            if (event.touches.length > 0) {
                const touchX = event.touches[0].clientX;
                const touchY = event.touches[0].clientY;
                if (onTouchMove) onTouchMove(event);

                // Move mascot to follow touch
                const targetX = touchX + offset.x - window.innerWidth / 2;
                const targetY = touchY + offset.y - window.innerHeight / 2;
                this.positionController.setOffset(targetX, targetY, 0);
            }
        };

        const handleTouchEnd = event => {
            if (event.changedTouches.length > 0) {
                touchEndX = event.changedTouches[0].clientX;
                touchEndY = event.changedTouches[0].clientY;
                if (onTouchEnd) onTouchEnd(event);

                // Detect swipe
                const deltaX = touchEndX - touchStartX;
                const deltaY = touchEndY - touchStartY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

                if (distance > swipeThreshold && onSwipe) {
                    const direction = Math.abs(deltaX) > Math.abs(deltaY) 
                        ? (deltaX > 0 ? 'right' : 'left')
                        : (deltaY > 0 ? 'down' : 'up');
                    onSwipe(direction, distance);
                }
            }
        };

        element.addEventListener('touchstart', handleTouchStart);
        element.addEventListener('touchmove', handleTouchMove);
        element.addEventListener('touchend', handleTouchEnd);

        this.activeInteractions.set(interactionId, {
            element,
            events: [
                { event: 'touchstart', handler: handleTouchStart },
                { event: 'touchmove', handler: handleTouchMove },
                { event: 'touchend', handler: handleTouchEnd }
            ]
        });

        return () => {
            const interaction = this.activeInteractions.get(interactionId);
            if (interaction) {
                interaction.events.forEach(({ event, handler }) => {
                    interaction.element.removeEventListener(event, handler);
                });
                this.activeInteractions.delete(interactionId);
            }
        };
    }

    /**
     * Move mascot to element and track focus events
     * @param {string} targetSelector - CSS selector for target element
     * @param {Object} focusOptions - Focus interaction options
     * @param {string} position - Position relative to element
     * @param {Object} offset - Pixel offset
     */
    moveToElementWithFocus(targetSelector, focusOptions = {}, position = 'right', offset = { x: 20, y: 0 }) {
        const element = document.querySelector(targetSelector);
        if (!element) {
            console.warn(`Element not found: ${targetSelector}`);
            return;
        }

        const interactionId = `focus-${Date.now()}-${Math.random()}`;
        const {
            onFocus = null,
            onBlur = null,
            onFocusIn = null,
            onFocusOut = null
        } = focusOptions;

        const handleFocus = event => {
            if (onFocus) onFocus(event);
            
            // Move mascot to focused element
            const rect = element.getBoundingClientRect();
            const targetX = rect.left + rect.width / 2 + offset.x - window.innerWidth / 2;
            const targetY = rect.top + rect.height / 2 + offset.y - window.innerHeight / 2;
            this.positionController.setOffset(targetX, targetY, 0);
        };

        const handleBlur = event => {
            if (onBlur) onBlur(event);
        };

        const handleFocusIn = event => {
            if (onFocusIn) onFocusIn(event);
        };

        const handleFocusOut = event => {
            if (onFocusOut) onFocusOut(event);
        };

        element.addEventListener('focus', handleFocus);
        element.addEventListener('blur', handleBlur);
        element.addEventListener('focusin', handleFocusIn);
        element.addEventListener('focusout', handleFocusOut);

        this.activeInteractions.set(interactionId, {
            element,
            events: [
                { event: 'focus', handler: handleFocus },
                { event: 'blur', handler: handleBlur },
                { event: 'focusin', handler: handleFocusIn },
                { event: 'focusout', handler: handleFocusOut }
            ]
        });

        return () => {
            const interaction = this.activeInteractions.get(interactionId);
            if (interaction) {
                interaction.events.forEach(({ event, handler }) => {
                    interaction.element.removeEventListener(event, handler);
                });
                this.activeInteractions.delete(interactionId);
            }
        };
    }

    /**
     * Move mascot to element and track keyboard events
     * @param {string} targetSelector - CSS selector for target element
     * @param {Object} keyboardOptions - Keyboard interaction options
     * @param {string} position - Position relative to element
     * @param {Object} offset - Pixel offset
     */
    moveToElementWithKeyboard(targetSelector, keyboardOptions = {}, position = 'right', offset = { x: 20, y: 0 }) {
        const element = document.querySelector(targetSelector);
        if (!element) {
            console.warn(`Element not found: ${targetSelector}`);
            return;
        }

        const interactionId = `keyboard-${Date.now()}-${Math.random()}`;
        const {
            onKeyDown = null,
            onKeyUp = null,
            onKeyPress = null,
            targetKeys = ['Enter', 'Space']
        } = keyboardOptions;

        const handleKeyDown = event => {
            if (onKeyDown) onKeyDown(event);

            if (targetKeys.includes(event.key)) {
                // Move mascot to element when target key is pressed
                const rect = element.getBoundingClientRect();
                const targetX = rect.left + rect.width / 2 + offset.x - window.innerWidth / 2;
                const targetY = rect.top + rect.height / 2 + offset.y - window.innerHeight / 2;
                this.positionController.setOffset(targetX, targetY, 0);
            }
        };

        const handleKeyUp = event => {
            if (onKeyUp) onKeyUp(event);
        };

        const handleKeyPress = event => {
            if (onKeyPress) onKeyPress(event);
        };

        element.addEventListener('keydown', handleKeyDown);
        element.addEventListener('keyup', handleKeyUp);
        element.addEventListener('keypress', handleKeyPress);

        this.activeInteractions.set(interactionId, {
            element,
            events: [
                { event: 'keydown', handler: handleKeyDown },
                { event: 'keyup', handler: handleKeyUp },
                { event: 'keypress', handler: handleKeyPress }
            ]
        });

        return () => {
            const interaction = this.activeInteractions.get(interactionId);
            if (interaction) {
                interaction.events.forEach(({ event, handler }) => {
                    interaction.element.removeEventListener(event, handler);
                });
                this.activeInteractions.delete(interactionId);
            }
        };
    }

    /**
     * Stop all active interactions
     */
    stopAllInteractions() {
        this.activeInteractions.forEach((interaction, id) => {
            interaction.events.forEach(({ event, handler }) => {
                interaction.element.removeEventListener(event, handler);
            });
            this.activeInteractions.delete(id);
        });
        this.hoverStates.clear();
        this.clickStates.clear();
        this.touchStates.clear();
    }

    /**
     * Destroy the interaction system
     */
    destroy() {
        this.stopAllInteractions();
        super.destroy();
    }
}

export default ElementTargetingInteractions;

