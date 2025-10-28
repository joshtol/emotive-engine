/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Context-Aware Element Targeting
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Context-aware element targeting with scroll, physics, group, responsive, and accessibility features
 * @author Emotive Engine Team
 * @module positioning/elementTargeting/ElementTargetingContext
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Provides context-aware element targeting that adapts to scroll position, physics  
 * ║ simulation, multiple elements, responsive breakpoints, and accessibility needs.   
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

import ElementTargeting from './ElementTargeting.js';

class ElementTargetingContext extends ElementTargeting {
    constructor(positionController) {
        super(positionController);
        this.scrollCallbacks = new Map();
        this.physicsSimulations = new Map();
        this.responsiveBreakpoints = {
            mobile: 768,
            tablet: 1024,
            desktop: 1200
        };
        this.currentBreakpoint = this.getCurrentBreakpoint();
        this.accessibilityEnabled = false;
    }

    /**
     * Move mascot to element with scroll-based movement
     * @param {string} targetSelector - CSS selector for target element
     * @param {Object} scrollOptions - Scroll-based movement options
     * @param {string} position - Position relative to element
     * @param {Object} offset - Pixel offset
     */
    moveToElementWithScroll(targetSelector, scrollOptions = {}, position = 'right', offset = { x: 20, y: 0 }) {
        const element = document.querySelector(targetSelector);
        if (!element) {
            console.warn(`Element not found: ${targetSelector}`);
            return;
        }

        const scrollId = `scroll-${Date.now()}-${Math.random()}`;
        const {
            startScroll = 50,
            endScroll = 300,
            onProgress = null,
            onStart = null,
            onComplete = null
        } = scrollOptions;

        let hasStarted = false;
        let hasCompleted = false;

        const handleScroll = () => {
            const {scrollY} = window;
            const progress = Math.min(Math.max((scrollY - startScroll) / (endScroll - startScroll), 0), 1);

            if (progress > 0 && !hasStarted) {
                hasStarted = true;
                if (onStart) onStart();
            }

            if (progress >= 1 && !hasCompleted) {
                hasCompleted = true;
                if (onComplete) onComplete();
            }

            // Update position based on scroll progress
            const rect = element.getBoundingClientRect();
            const targetX = rect.left + rect.width / 2 + offset.x - window.innerWidth / 2;
            const targetY = rect.top + rect.height / 2 + offset.y - window.innerHeight / 2;

            // Get original position (when scroll is 0)
            const isDesktop = window.innerWidth > 1024;
            const mascotRadius = 50;
            const originalX = isDesktop ? (window.innerWidth * 0.25) : (window.innerWidth * 0.33) - mascotRadius;
            const originalY = isDesktop ? -(window.innerHeight * 0.25) - mascotRadius + (window.innerHeight * 0.15) : -(window.innerHeight * 0.35) - mascotRadius + (window.innerHeight * 0.08);

            // Interpolate between original and target positions
            const currentX = originalX + (targetX - originalX) * progress;
            const currentY = originalY + (targetY - originalY) * progress;

            this.positionController.setOffset(currentX, currentY, 0);

            if (onProgress) {
                onProgress(progress, { scrollY, currentX, currentY });
            }
        };

        this.scrollCallbacks.set(scrollId, handleScroll);
        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial call

        return () => {
            this.scrollCallbacks.delete(scrollId);
            window.removeEventListener('scroll', handleScroll);
        };
    }

    /**
     * Move mascot to element with physics-based movement
     * @param {string} targetSelector - CSS selector for target element
     * @param {Object} physicsOptions - Physics simulation options
     * @param {string} position - Position relative to element
     * @param {Object} offset - Pixel offset
     */
    moveToElementWithPhysics(targetSelector, physicsOptions = {}, position = 'right', offset = { x: 20, y: 0 }) {
        const element = document.querySelector(targetSelector);
        if (!element) {
            console.warn(`Element not found: ${targetSelector}`);
            return;
        }

        const physicsId = `physics-${Date.now()}-${Math.random()}`;
        const {
            mass = 1,
            damping = 0.98,
            springConstant = 0.1,
            maxVelocity = 10,
            onUpdate = null
        } = physicsOptions;

        const rect = element.getBoundingClientRect();
        const targetX = rect.left + rect.width / 2 + offset.x - window.innerWidth / 2;
        const targetY = rect.top + rect.height / 2 + offset.y - window.innerHeight / 2;

        const currentOffset = this.positionController.getOffset();
        let positionX = currentOffset.x;
        let positionY = currentOffset.y;
        let velocityX = 0;
        let velocityY = 0;

        const simulate = () => {
            // Calculate spring force
            const forceX = (targetX - positionX) * springConstant;
            const forceY = (targetY - positionY) * springConstant;

            // Apply force to velocity
            velocityX += forceX / mass;
            velocityY += forceY / mass;

            // Apply damping
            velocityX *= damping;
            velocityY *= damping;

            // Limit velocity
            const velocityMagnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
            if (velocityMagnitude > maxVelocity) {
                velocityX = (velocityX / velocityMagnitude) * maxVelocity;
                velocityY = (velocityY / velocityMagnitude) * maxVelocity;
            }

            // Update position
            positionX += velocityX;
            positionY += velocityY;

            this.positionController.setOffset(positionX, positionY, 0);

            if (onUpdate) {
                onUpdate({ positionX, positionY, velocityX, velocityY });
            }

            // Continue simulation
            if (this.physicsSimulations.has(physicsId)) {
                requestAnimationFrame(simulate);
            }
        };

        this.physicsSimulations.set(physicsId, simulate);
        simulate();

        return () => {
            this.physicsSimulations.delete(physicsId);
        };
    }

    /**
     * Move mascot to center of multiple elements
     * @param {Array} elementSelectors - Array of CSS selectors
     * @param {string} position - Position relative to group center
     * @param {Object} offset - Pixel offset
     */
    moveToElementWithGroup(elementSelectors = [], position = 'center', offset = { x: 0, y: 0 }) {
        if (elementSelectors.length === 0) {
            console.warn('No element selectors provided');
            return;
        }

        let groupX = 0, groupY = 0, groupWidth = 0, groupHeight = 0;
        let validElements = 0;

        elementSelectors.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                const rect = element.getBoundingClientRect();
                groupX += rect.left;
                groupY += rect.top;
                groupWidth = Math.max(groupWidth, rect.left + rect.width);
                groupHeight = Math.max(groupHeight, rect.top + rect.height);
                validElements++;
            }
        });

        if (validElements === 0) return;

        // Calculate group center
        const centerX = groupX / validElements;
        const centerY = groupY / validElements;

        let targetX, targetY;

        switch (position) {
        case 'center':
            targetX = centerX + offset.x - window.innerWidth / 2;
            targetY = centerY + offset.y - window.innerHeight / 2;
            break;
        case 'left':
            targetX = groupX + offset.x - window.innerWidth / 2;
            targetY = centerY + offset.y - window.innerHeight / 2;
            break;
        case 'right':
            targetX = groupWidth + offset.x - window.innerWidth / 2;
            targetY = centerY + offset.y - window.innerHeight / 2;
            break;
        case 'top':
            targetX = centerX + offset.x - window.innerWidth / 2;
            targetY = groupY + offset.y - window.innerHeight / 2;
            break;
        case 'bottom':
            targetX = centerX + offset.x - window.innerWidth / 2;
            targetY = groupHeight + offset.y - window.innerHeight / 2;
            break;
        default:
            targetX = centerX + offset.x - window.innerWidth / 2;
            targetY = centerY + offset.y - window.innerHeight / 2;
        }

        this.positionController.setOffset(targetX, targetY, 0);
    }

    /**
     * Move mascot to element with responsive behavior
     * @param {string} targetSelector - CSS selector for target element
     * @param {Object} responsiveOptions - Responsive behavior options
     * @param {string} position - Position relative to element
     * @param {Object} offset - Pixel offset
     */
    moveToElementWithResponsive(targetSelector, responsiveOptions = {}, position = 'right', offset = { x: 20, y: 0 }) {
        const element = document.querySelector(targetSelector);
        if (!element) {
            console.warn(`Element not found: ${targetSelector}`);
            return;
        }

        const updateResponsivePosition = () => {
            const currentBreakpoint = this.getCurrentBreakpoint();
            const breakpointOptions = responsiveOptions[currentBreakpoint] || responsiveOptions.default || {};
            
            const rect = element.getBoundingClientRect();
            const targetX = rect.left + rect.width / 2 + (breakpointOptions.offsetX || offset.x) - window.innerWidth / 2;
            const targetY = rect.top + rect.height / 2 + (breakpointOptions.offsetY || offset.y) - window.innerHeight / 2;

            this.positionController.setOffset(targetX, targetY, 0);
        };

        // Listen for resize events
        const handleResize = () => {
            const newBreakpoint = this.getCurrentBreakpoint();
            if (newBreakpoint !== this.currentBreakpoint) {
                this.currentBreakpoint = newBreakpoint;
                updateResponsivePosition();
            }
        };

        window.addEventListener('resize', handleResize);
        updateResponsivePosition();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }

    /**
     * Move mascot to element with accessibility features
     * @param {string} targetSelector - CSS selector for target element
     * @param {Object} accessibilityOptions - Accessibility options
     * @param {string} position - Position relative to element
     * @param {Object} offset - Pixel offset
     */
    moveToElementWithAccessibility(targetSelector, accessibilityOptions = {}, position = 'right', offset = { x: 20, y: 0 }) {
        const element = document.querySelector(targetSelector);
        if (!element) {
            console.warn(`Element not found: ${targetSelector}`);
            return;
        }

        const {
            announce = true,
            announcements = [],
            screenReaderPosition = 'bottom-right'
        } = accessibilityOptions;

        // Position mascot in accessibility-friendly location
        let targetX, targetY;

        switch (screenReaderPosition) {
        case 'bottom-right':
            targetX = window.innerWidth - 100 - window.innerWidth / 2;
            targetY = window.innerHeight - 100 - window.innerHeight / 2;
            break;
        case 'bottom-left':
            targetX = 100 - window.innerWidth / 2;
            targetY = window.innerHeight - 100 - window.innerHeight / 2;
            break;
        case 'top-right':
            targetX = window.innerWidth - 100 - window.innerWidth / 2;
            targetY = 100 - window.innerHeight / 2;
            break;
        case 'top-left':
            targetX = 100 - window.innerWidth / 2;
            targetY = 100 - window.innerHeight / 2;
            break;
        default:
            targetX = window.innerWidth - 100 - window.innerWidth / 2;
            targetY = window.innerHeight - 100 - window.innerHeight / 2;
        }

        this.positionController.setOffset(targetX, targetY, 0);

        // Announce to screen reader
        if (announce && window.speechSynthesis) {
            announcements.forEach(announcement => {
                if (announcement.condition && announcement.condition()) {
                    const utterance = new SpeechSynthesisUtterance(announcement.text);
                    utterance.volume = 0.5;
                    utterance.rate = 0.8;
                    window.speechSynthesis.speak(utterance);
                }
            });
        }
    }

    /**
     * Get current breakpoint based on window width
     * @returns {string} Current breakpoint name
     */
    getCurrentBreakpoint() {
        const width = window.innerWidth;
        if (width < this.responsiveBreakpoints.mobile) return 'mobile';
        if (width < this.responsiveBreakpoints.tablet) return 'tablet';
        if (width < this.responsiveBreakpoints.desktop) return 'desktop';
        return 'large';
    }

    /**
     * Set custom breakpoints
     * @param {Object} breakpoints - Custom breakpoint values
     */
    setBreakpoints(breakpoints) {
        this.responsiveBreakpoints = { ...this.responsiveBreakpoints, ...breakpoints };
        this.currentBreakpoint = this.getCurrentBreakpoint();
    }

    /**
     * Enable accessibility features
     */
    enableAccessibility() {
        this.accessibilityEnabled = true;
    }

    /**
     * Disable accessibility features
     */
    disableAccessibility() {
        this.accessibilityEnabled = false;
    }

    /**
     * Destroy the context-aware targeting system
     */
    destroy() {
        this.scrollCallbacks.forEach((callback, _id) => {
            window.removeEventListener('scroll', callback);
        });
        this.scrollCallbacks.clear();
        
        this.physicsSimulations.clear();
        
        super.destroy();
    }
}

export default ElementTargetingContext;

