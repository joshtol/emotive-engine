/**
 * PositionController manages mascot offsets, pseudo-3D scaling, easing, and access to advanced positioning.
 * @module utils/PositionController
 */

import PositioningSystem from '../core/positioning/index.js';
import { ElementTargetingAll } from '../core/positioning/elementTargeting/index.js';

class PositionController {
    constructor(config = {}) {
        // Current offset values
        this.offsetX = config.offsetX || 0;
        this.offsetY = config.offsetY || 0;
        this.offsetZ = config.offsetZ || 0;
        
        // Animation state
        this.isAnimating = false;
        this.animationId = null;
        this.animationStartTime = 0;
        this.animationDuration = 0;
        this.animationEasing = 'easeOutCubic';
        this.startOffset = { x: 0, y: 0, z: 0 };
        this.targetOffset = { x: 0, y: 0, z: 0 };
        
        // Callbacks
        this.onUpdate = config.onUpdate || (() => {});
        this.onAnimationComplete = config.onAnimationComplete || (() => {});
        
        // Z-depth scaling factors
        this.minScale = config.minScale || 0.5;
        this.maxScale = config.maxScale || 2.0;
        this.zScaleRange = config.zScaleRange || 1000; // Z units for full scale range
        
        // Global scale multiplier (independent of Z-depth)
        this.globalScale = 1.0;
        
        // Initialize modular positioning system
        this.positioning = new PositioningSystem(this);
        
        // Initialize element targeting system
        this.elementTargeting = new ElementTargetingAll(this);
    }
    
    /**
     * Set offset values immediately
     * @param {number} x - X offset
     * @param {number} y - Y offset  
     * @param {number} z - Z offset (for pseudo-3D scaling)
     */
    setOffset(x, y, z = 0) {
        this.stopAnimation();
        this.offsetX = x;
        this.offsetY = y;
        this.offsetZ = z;
        this.onUpdate(this.getEffectiveCenter());
    }
    
    /**
     * Get current offset values
     * @returns {Object} Current offset {x, y, z}
     */
    getOffset() {
        return {
            x: this.offsetX,
            y: this.offsetY,
            z: this.offsetZ
        };
    }
    
    /**
     * Get current position (offset + effective center)
     * @param {number} centerX - Base center X (default: viewport center)
     * @param {number} centerY - Base center Y (default: viewport center)
     * @returns {Object} Current position {x, y, z, scale}
     */
    getPosition(centerX = window.innerWidth / 2, centerY = window.innerHeight / 2) {
        return {
            x: centerX + this.offsetX,
            y: centerY + this.offsetY,
            z: this.offsetZ,
            scale: this.getZScale()
        };
    }
    
    /**
     * Animate to new offset values
     * @param {number} x - Target X offset
     * @param {number} y - Target Y offset
     * @param {number} z - Target Z offset
     * @param {number} duration - Animation duration in ms
     * @param {string} easing - Easing function name
     */
    animateOffset(x, y, z = 0, duration = 1000, easing = 'easeOutCubic') {
        this.stopAnimation();
        
        this.startOffset = { x: this.offsetX, y: this.offsetY, z: this.offsetZ };
        this.targetOffset = { x, y, z };
        this.animationDuration = duration;
        this.animationEasing = easing;
        this.animationStartTime = performance.now();
        this.isAnimating = true;
        
        this.startAnimation();
    }
    
    /**
     * Stop current animation
     */
    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.isAnimating = false;
    }
    
    /**
     * Start animation loop
     */
    startAnimation() {
        const animate = currentTime => {
            if (!this.isAnimating) return;
            
            const elapsed = currentTime - this.animationStartTime;
            const progress = Math.min(elapsed / this.animationDuration, 1);
            
            // Apply easing
            const easedProgress = this.applyEasing(progress, this.animationEasing);
            
            // Interpolate values
            this.offsetX = this.lerp(this.startOffset.x, this.targetOffset.x, easedProgress);
            this.offsetY = this.lerp(this.startOffset.y, this.targetOffset.y, easedProgress);
            this.offsetZ = this.lerp(this.startOffset.z, this.targetOffset.z, easedProgress);
            
            // Update callback
            this.onUpdate(this.getEffectiveCenter());
            
            if (progress >= 1) {
                this.isAnimating = false;
                this.onAnimationComplete();
            } else {
                this.animationId = requestAnimationFrame(animate);
            }
        };
        
        this.animationId = requestAnimationFrame(animate);
    }
    
    /**
     * Calculate effective center coordinates
     * @param {number} centerX - Base center X
     * @param {number} centerY - Base center Y
     * @returns {Object} Effective center {x, y, scale}
     */
    getEffectiveCenter(centerX = 0, centerY = 0) {
        return {
            x: centerX + this.offsetX,
            y: centerY + this.offsetY,
            scale: this.getZScale()
        };
    }
    
    /**
     * Calculate scale based on Z offset for pseudo-3D effect
     * @returns {number} Scale factor
     */
    getZScale() {
        // Convert Z offset to scale (negative Z = closer/larger, positive Z = farther/smaller)
        const normalizedZ = -this.offsetZ / this.zScaleRange; // Negative for intuitive behavior
        const clampedZ = Math.max(-1, Math.min(1, normalizedZ));
        const baseZScale = this.lerp(this.minScale, this.maxScale, (clampedZ + 1) / 2);
        
        // Apply global scale multiplier
        return baseZScale * this.globalScale;
    }
    
    /**
     * Set global scale multiplier for the entire mascot
     * @param {number} scale - Global scale factor (1.0 = normal size)
     */
    setGlobalScale(scale) {
        this.globalScale = Math.max(0.1, scale); // Prevent zero/negative scale
        this.onUpdate(this.getEffectiveCenter());
    }
    
    /**
     * Linear interpolation
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} t - Interpolation factor (0-1)
     * @returns {number} Interpolated value
     */
    lerp(start, end, t) {
        return start + (end - start) * t;
    }
    
    /**
     * Apply easing function
     * @param {number} t - Input value (0-1)
     * @param {string} easing - Easing function name
     * @returns {number} Eased value
     */
    applyEasing(t, easing) {
        switch (easing) {
        case 'linear':
            return t;
        case 'easeInQuad':
            return t * t;
        case 'easeOutQuad':
            return 1 - (1 - t) * (1 - t);
        case 'easeInOutQuad':
            return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        case 'easeInCubic':
            return t * t * t;
        case 'easeOutCubic':
            return 1 - Math.pow(1 - t, 3);
        case 'easeInOutCubic':
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        case 'easeInBack': {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return c3 * t * t * t - c1 * t * t;
        }
        case 'easeOutBack': {
            const c1_back = 1.70158;
            const c3_back = c1_back + 1;
            return 1 + c3_back * Math.pow(t - 1, 3) + c1_back * Math.pow(t - 1, 2);
        }
        default:
            return t;
        }
    }
    
    /**
     * Get the positioning system for advanced targeting
     * @returns {PositioningSystem} The positioning system instance
     */
    getPositioning() {
        return this.positioning;
    }

    /**
     * Get the element targeting system for DOM element targeting
     * @returns {ElementTargetingAll} The element targeting system instance
     */
    getElementTargeting() {
        return this.elementTargeting;
    }

    /**
     * Call a positioning method by name
     * @param {string} methodName - Name of the method to call
     * @param {...any} args - Arguments to pass to the method
     * @returns {any} Result of the method call
     */
    callPositioning(methodName, ...args) {
        return this.positioning.call(methodName, ...args);
    }

    /**
     * Destroy the controller and clean up
     */
    destroy() {
        this.stopAnimation();
        if (this.positioning) {
            this.positioning.destroy();
            this.positioning = null;
        }
        if (this.elementTargeting) {
            this.elementTargeting.destroy();
            this.elementTargeting = null;
        }
        this.onUpdate = null;
        this.onAnimationComplete = null;
    }
}

export default PositionController;
