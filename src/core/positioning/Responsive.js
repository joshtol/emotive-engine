/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Responsive Positioning
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Responsive positioning methods for mascot across different screen sizes
 * @author Emotive Engine Team
 * @module positioning/Responsive
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Provides responsive positioning methods that adapt to different screen sizes and   
 * ║ accessibility requirements. Ensures mascot positioning works across all devices.   
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

class Responsive {
    constructor(positionController) {
        this.positionController = positionController;
        this.breakpoints = {
            mobile: 768,
            tablet: 1024,
            desktop: 1200
        };
        this.currentBreakpoint = this.getCurrentBreakpoint();
        this.responsiveCallbacks = new Map();
    }

    /**
     * Get current breakpoint based on window width
     * @returns {string} Current breakpoint name
     */
    getCurrentBreakpoint() {
        const width = window.innerWidth;
        if (width < this.breakpoints.mobile) return 'mobile';
        if (width < this.breakpoints.tablet) return 'tablet';
        if (width < this.breakpoints.desktop) return 'desktop';
        return 'large';
    }

    /**
     * Move mascot to responsive position based on breakpoints
     * @param {Object} breakpoints - Object with breakpoint-specific positions
     * @param {Object} options - Responsive options
     */
    moveToResponsive(breakpoints = {}, options = {}) {
        const callbackId = 'responsive';
        
        const updateResponsivePosition = () => {
            if (!this.isRunning) return;
            
            const currentBreakpoint = this.getCurrentBreakpoint();
            const position = breakpoints[currentBreakpoint] || breakpoints.default || { x: 0, y: 0 };
            
            // Convert to mascot coordinate system
            const mascotX = position.x - window.innerWidth / 2;
            const mascotY = position.y - window.innerHeight / 2;
            
            if (options.animate !== false) {
                this.positionController.animateOffset(mascotX, mascotY, 0, options.duration || 500, options.easing || 'easeOutCubic');
            } else {
                this.positionController.setOffset(mascotX, mascotY, 0);
            }
        };
        
        this.responsiveCallbacks.set(callbackId, updateResponsivePosition);
        this.isRunning = true;
        updateResponsivePosition();
        
        // Listen for resize events
        const handleResize = () => {
            const newBreakpoint = this.getCurrentBreakpoint();
            if (newBreakpoint !== this.currentBreakpoint) {
                this.currentBreakpoint = newBreakpoint;
                updateResponsivePosition();
            }
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
            this.isRunning = false;
            this.responsiveCallbacks.delete(callbackId);
            window.removeEventListener('resize', handleResize);
        };
    }

    /**
     * Move mascot to group of elements
     * @param {Array} elements - Array of element selectors or positions
     * @param {string} position - Position relative to group
     * @param {Object} offset - Pixel offset
     */
    moveToGroup(elements = [], position = 'center', offset = { x: 0, y: 0 }) {
        if (elements.length === 0) return;
        
        let groupX = 0, groupY = 0, groupWidth = 0, groupHeight = 0;
        let validElements = 0;
        
        elements.forEach(element => {
            let elementX, elementY, elementWidth, elementHeight;
            
            if (typeof element === 'string') {
                // CSS selector
                const el = document.querySelector(element);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    elementX = rect.left;
                    elementY = rect.top;
                    elementWidth = rect.width;
                    elementHeight = rect.height;
                } else {
                    return;
                }
            } else if (element.x !== undefined && element.y !== undefined) {
                // Position object
                elementX = element.x;
                elementY = element.y;
                elementWidth = element.width || 0;
                elementHeight = element.height || 0;
            } else {
                return;
            }
            
            groupX += elementX;
            groupY += elementY;
            groupWidth = Math.max(groupWidth, elementX + elementWidth);
            groupHeight = Math.max(groupHeight, elementY + elementHeight);
            validElements++;
        });
        
        if (validElements === 0) return;
        
        // Calculate group center
        const centerX = groupX / validElements;
        const centerY = groupY / validElements;
        
        let targetX, targetY;
        
        switch (position) {
        case 'center':
            targetX = centerX + offset.x;
            targetY = centerY + offset.y;
            break;
        case 'left':
            targetX = groupX + offset.x;
            targetY = centerY + offset.y;
            break;
        case 'right':
            targetX = groupWidth + offset.x;
            targetY = centerY + offset.y;
            break;
        case 'top':
            targetX = centerX + offset.x;
            targetY = groupY + offset.y;
            break;
        case 'bottom':
            targetX = centerX + offset.x;
            targetY = groupHeight + offset.y;
            break;
        default:
            targetX = centerX + offset.x;
            targetY = centerY + offset.y;
        }
        
        // Convert to mascot coordinate system
        const mascotX = targetX - window.innerWidth / 2;
        const mascotY = targetY - window.innerHeight / 2;
        
        this.positionController.setOffset(mascotX, mascotY, 0);
    }

    /**
     * Move mascot to accessibility-friendly position
     * @param {Array} announcements - Array of screen reader announcements
     * @param {string} position - Position relative to content
     * @param {Object} options - Accessibility options
     */
    moveToAccessibility(announcements = [], position = 'bottom-right', options = {}) {
        const callbackId = 'accessibility';
        
        const updateAccessibilityPosition = () => {
            if (!this.isRunning) return;
            
            // Check for screen reader
            const hasScreenReader = window.speechSynthesis || window.webkitSpeechSynthesis;
            
            if (hasScreenReader && options.announce) {
                // Announce current position
                announcements.forEach(announcement => {
                    if (announcement.condition && announcement.condition()) {
                        this.announceToScreenReader(announcement.text);
                    }
                });
            }
            
            // Position mascot in accessibility-friendly location
            let targetX, targetY;
            
            switch (position) {
            case 'bottom-right':
                targetX = window.innerWidth - 100;
                targetY = window.innerHeight - 100;
                break;
            case 'bottom-left':
                targetX = 100;
                targetY = window.innerHeight - 100;
                break;
            case 'top-right':
                targetX = window.innerWidth - 100;
                targetY = 100;
                break;
            case 'top-left':
                targetX = 100;
                targetY = 100;
                break;
            case 'center':
                targetX = window.innerWidth / 2;
                targetY = window.innerHeight / 2;
                break;
            default:
                targetX = window.innerWidth - 100;
                targetY = window.innerHeight - 100;
            }
            
            // Convert to mascot coordinate system
            const mascotX = targetX - window.innerWidth / 2;
            const mascotY = targetY - window.innerHeight / 2;
            
            this.positionController.setOffset(mascotX, mascotY, 0);
        };
        
        this.responsiveCallbacks.set(callbackId, updateAccessibilityPosition);
        this.isRunning = true;
        updateAccessibilityPosition();
        
        return () => {
            this.isRunning = false;
            this.responsiveCallbacks.delete(callbackId);
        };
    }

    /**
     * Announce text to screen reader
     * @param {string} text - Text to announce
     */
    announceToScreenReader(text) {
        if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.volume = 0.5;
            utterance.rate = 0.8;
            window.speechSynthesis.speak(utterance);
        }
    }

    /**
     * Set custom breakpoints
     * @param {Object} breakpoints - Custom breakpoint values
     */
    setBreakpoints(breakpoints) {
        this.breakpoints = { ...this.breakpoints, ...breakpoints };
        this.currentBreakpoint = this.getCurrentBreakpoint();
    }

    /**
     * Get current breakpoint name
     * @returns {string} Current breakpoint
     */
    getCurrentBreakpointName() {
        return this.currentBreakpoint;
    }

    /**
     * Check if current breakpoint matches
     * @param {string} breakpoint - Breakpoint to check
     * @returns {boolean} True if current breakpoint matches
     */
    isBreakpoint(breakpoint) {
        return this.currentBreakpoint === breakpoint;
    }

    /**
     * Stop all responsive positioning
     */
    stopAllResponsive() {
        this.isRunning = false;
        this.responsiveCallbacks.clear();
    }

    /**
     * Destroy the responsive system
     */
    destroy() {
        this.stopAllResponsive();
        this.positionController = null;
    }
}

export default Responsive;

