/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Element Targeting Animations
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Element targeting with animation capabilities for mascot movement
 * @author Emotive Engine Team
 * @module positioning/elementTargeting/ElementTargetingAnimations
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Provides element targeting with animation capabilities including bounce, shake,    
 * ║ pulse, wiggle, and custom animation effects for mascot movement.                  
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

import ElementTargeting from './ElementTargeting.js';

class ElementTargetingAnimations extends ElementTargeting {
    constructor(positionController) {
        super(positionController);
        this.activeAnimations = new Map();
        this.animationQueue = [];
        this.isAnimating = false;
    }

    /**
     * Move mascot to element with bounce animation
     * @param {string} targetSelector - CSS selector for target element
     * @param {Object} bounceOptions - Bounce animation options
     * @param {string} position - Position relative to element
     * @param {Object} offset - Pixel offset
     */
    moveToElementWithBounce(targetSelector, bounceOptions = {}, position = 'right', offset = { x: 20, y: 0 }) {
        const element = document.querySelector(targetSelector);
        if (!element) {
            console.warn(`Element not found: ${targetSelector}`);
            return;
        }

        const animationId = `bounce-${Date.now()}-${Math.random()}`;
        const {
            duration = 1000,
            intensity = 50,
            bounces = 3,
            onComplete = null
        } = bounceOptions;

        const rect = element.getBoundingClientRect();
        const targetX = rect.left + rect.width / 2 + offset.x - window.innerWidth / 2;
        const targetY = rect.top + rect.height / 2 + offset.y - window.innerHeight / 2;

        const startOffset = this.positionController.getOffset();
        const startTime = performance.now();

        const animate = currentTime => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Bounce easing function
            const bounceProgress = 1 - Math.pow(1 - progress, 3);
            const bounceOffset = Math.sin(bounceProgress * Math.PI * bounces) * intensity * (1 - progress);

            const currentX = startOffset.x + (targetX - startOffset.x) * progress;
            const currentY = startOffset.y + (targetY - startOffset.y) * progress + bounceOffset;

            this.positionController.setOffset(currentX, currentY, 0);

            if (progress < 1) {
                this.activeAnimations.set(animationId, animate);
                requestAnimationFrame(animate);
            } else {
                this.activeAnimations.delete(animationId);
                if (onComplete) onComplete();
            }
        };

        this.activeAnimations.set(animationId, animate);
        requestAnimationFrame(animate);

        return () => {
            this.activeAnimations.delete(animationId);
        };
    }

    /**
     * Move mascot to element with shake animation
     * @param {string} targetSelector - CSS selector for target element
     * @param {Object} shakeOptions - Shake animation options
     * @param {string} position - Position relative to element
     * @param {Object} offset - Pixel offset
     */
    moveToElementWithShake(targetSelector, shakeOptions = {}, position = 'right', offset = { x: 20, y: 0 }) {
        const element = document.querySelector(targetSelector);
        if (!element) {
            console.warn(`Element not found: ${targetSelector}`);
            return;
        }

        const animationId = `shake-${Date.now()}-${Math.random()}`;
        const {
            duration = 500,
            intensity = 10,
            frequency = 20,
            onComplete = null
        } = shakeOptions;

        const rect = element.getBoundingClientRect();
        const targetX = rect.left + rect.width / 2 + offset.x - window.innerWidth / 2;
        const targetY = rect.top + rect.height / 2 + offset.y - window.innerHeight / 2;

        const startTime = performance.now();

        const animate = currentTime => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Shake effect
            const shakeX = (Math.random() - 0.5) * intensity * (1 - progress);
            const shakeY = (Math.random() - 0.5) * intensity * (1 - progress);

            const currentX = targetX + shakeX;
            const currentY = targetY + shakeY;

            this.positionController.setOffset(currentX, currentY, 0);

            if (progress < 1) {
                this.activeAnimations.set(animationId, animate);
                setTimeout(() => requestAnimationFrame(animate), 1000 / frequency);
            } else {
                this.activeAnimations.delete(animationId);
                if (onComplete) onComplete();
            }
        };

        this.activeAnimations.set(animationId, animate);
        requestAnimationFrame(animate);

        return () => {
            this.activeAnimations.delete(animationId);
        };
    }

    /**
     * Move mascot to element with pulse animation
     * @param {string} targetSelector - CSS selector for target element
     * @param {Object} pulseOptions - Pulse animation options
     * @param {string} position - Position relative to element
     * @param {Object} offset - Pixel offset
     */
    moveToElementWithPulse(targetSelector, pulseOptions = {}, position = 'right', offset = { x: 20, y: 0 }) {
        const element = document.querySelector(targetSelector);
        if (!element) {
            console.warn(`Element not found: ${targetSelector}`);
            return;
        }

        const animationId = `pulse-${Date.now()}-${Math.random()}`;
        const {
            duration = 2000,
            intensity = 20,
            frequency = 2,
            onComplete = null
        } = pulseOptions;

        const rect = element.getBoundingClientRect();
        const targetX = rect.left + rect.width / 2 + offset.x - window.innerWidth / 2;
        const targetY = rect.top + rect.height / 2 + offset.y - window.innerHeight / 2;

        const startTime = performance.now();

        const animate = currentTime => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Pulse effect
            const pulseScale = Math.sin(elapsed * frequency * 0.01) * intensity * (1 - progress);
            const currentX = targetX + pulseScale;
            const currentY = targetY + pulseScale;

            this.positionController.setOffset(currentX, currentY, 0);

            if (progress < 1) {
                this.activeAnimations.set(animationId, animate);
                requestAnimationFrame(animate);
            } else {
                this.activeAnimations.delete(animationId);
                if (onComplete) onComplete();
            }
        };

        this.activeAnimations.set(animationId, animate);
        requestAnimationFrame(animate);

        return () => {
            this.activeAnimations.delete(animationId);
        };
    }

    /**
     * Move mascot to element with wiggle animation
     * @param {string} targetSelector - CSS selector for target element
     * @param {Object} wiggleOptions - Wiggle animation options
     * @param {string} position - Position relative to element
     * @param {Object} offset - Pixel offset
     */
    moveToElementWithWiggle(targetSelector, wiggleOptions = {}, position = 'right', offset = { x: 20, y: 0 }) {
        const element = document.querySelector(targetSelector);
        if (!element) {
            console.warn(`Element not found: ${targetSelector}`);
            return;
        }

        const animationId = `wiggle-${Date.now()}-${Math.random()}`;
        const {
            duration = 1000,
            intensity = 15,
            frequency = 8,
            onComplete = null
        } = wiggleOptions;

        const rect = element.getBoundingClientRect();
        const targetX = rect.left + rect.width / 2 + offset.x - window.innerWidth / 2;
        const targetY = rect.top + rect.height / 2 + offset.y - window.innerHeight / 2;

        const startTime = performance.now();

        const animate = currentTime => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Wiggle effect
            const wiggleX = Math.sin(elapsed * frequency * 0.01) * intensity * (1 - progress);
            const wiggleY = Math.cos(elapsed * frequency * 0.01) * intensity * (1 - progress);

            const currentX = targetX + wiggleX;
            const currentY = targetY + wiggleY;

            this.positionController.setOffset(currentX, currentY, 0);

            if (progress < 1) {
                this.activeAnimations.set(animationId, animate);
                requestAnimationFrame(animate);
            } else {
                this.activeAnimations.delete(animationId);
                if (onComplete) onComplete();
            }
        };

        this.activeAnimations.set(animationId, animate);
        requestAnimationFrame(animate);

        return () => {
            this.activeAnimations.delete(animationId);
        };
    }

    /**
     * Move mascot to element with custom animation
     * @param {string} targetSelector - CSS selector for target element
     * @param {Function} animationFunction - Custom animation function
     * @param {Object} animationOptions - Animation options
     * @param {string} position - Position relative to element
     * @param {Object} offset - Pixel offset
     */
    moveToElementWithCustom(targetSelector, animationFunction, animationOptions = {}, position = 'right', offset = { x: 20, y: 0 }) {
        const element = document.querySelector(targetSelector);
        if (!element) {
            console.warn(`Element not found: ${targetSelector}`);
            return;
        }

        const animationId = `custom-${Date.now()}-${Math.random()}`;
        const {
            duration = 1000,
            onComplete = null
        } = animationOptions;

        const rect = element.getBoundingClientRect();
        const targetX = rect.left + rect.width / 2 + offset.x - window.innerWidth / 2;
        const targetY = rect.top + rect.height / 2 + offset.y - window.innerHeight / 2;

        const startOffset = this.positionController.getOffset();
        const startTime = performance.now();

        const animate = currentTime => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Execute custom animation function
            const animationResult = animationFunction(progress, {
                elapsed,
                startOffset,
                targetX,
                targetY,
                currentTime
            });

            if (animationResult && typeof animationResult === 'object') {
                const currentX = animationResult.x !== undefined ? animationResult.x : targetX;
                const currentY = animationResult.y !== undefined ? animationResult.y : targetY;
                this.positionController.setOffset(currentX, currentY, 0);
            }

            if (progress < 1) {
                this.activeAnimations.set(animationId, animate);
                requestAnimationFrame(animate);
            } else {
                this.activeAnimations.delete(animationId);
                if (onComplete) onComplete();
            }
        };

        this.activeAnimations.set(animationId, animate);
        requestAnimationFrame(animate);

        return () => {
            this.activeAnimations.delete(animationId);
        };
    }

    /**
     * Queue multiple animations to play in sequence
     * @param {Array} animationQueue - Array of animation objects
     */
    queueAnimations(animationQueue = []) {
        this.animationQueue = [...this.animationQueue, ...animationQueue];
        this.processAnimationQueue();
    }

    /**
     * Process the animation queue
     */
    processAnimationQueue() {
        if (this.isAnimating || this.animationQueue.length === 0) return;

        this.isAnimating = true;
        const animation = this.animationQueue.shift();

        if (animation) {
            const cleanup = this.executeAnimation(animation);
            if (cleanup) {
                setTimeout(() => {
                    cleanup();
                    this.isAnimating = false;
                    this.processAnimationQueue();
                }, animation.duration || 1000);
            }
        }
    }

    /**
     * Execute a single animation from the queue
     * @param {Object} animation - Animation object
     * @returns {Function} Cleanup function
     */
    executeAnimation(animation) {
        const { type, targetSelector, options = {}, position = 'right', offset = { x: 20, y: 0 } } = animation;

        switch (type) {
        case 'bounce':
            return this.moveToElementWithBounce(targetSelector, options, position, offset);
        case 'shake':
            return this.moveToElementWithShake(targetSelector, options, position, offset);
        case 'pulse':
            return this.moveToElementWithPulse(targetSelector, options, position, offset);
        case 'wiggle':
            return this.moveToElementWithWiggle(targetSelector, options, position, offset);
        case 'custom':
            return this.moveToElementWithCustom(targetSelector, options.animationFunction, options, position, offset);
        default:
            return this.moveToElement(targetSelector, position, offset);
        }
    }

    /**
     * Stop all active animations
     */
    stopAllAnimations() {
        this.activeAnimations.forEach((animation, id) => {
            this.activeAnimations.delete(id);
        });
        this.animationQueue = [];
        this.isAnimating = false;
    }

    /**
     * Destroy the animation system
     */
    destroy() {
        this.stopAllAnimations();
        super.destroy();
    }
}

export default ElementTargetingAnimations;

