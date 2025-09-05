/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝                                                                             
 *                       ◐ ◑ ◒ ◓  GAZE TRACKER  ◓ ◒ ◑ ◐                       
 *                                                                                    
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Gaze Tracker - Interactive Eye Following & Cursor Awareness
 * @author Emotive Engine Team
 * @version 2.1.0
 * @module GazeTracker
 * @changelog 2.1.0 - Cached canvas rect to eliminate reflows on mouse/touch moves
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Brings the orb to LIFE by making it aware of your cursor. Creates natural         
 * ║ eye-following behavior with smooth interpolation. When you move close,            
 * ║ the orb "looks" at you. Move away, and it relaxes back to center.                 
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 👁️ GAZE BEHAVIORS                                                                
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Smooth following with linear interpolation (lerp)                               
 * │ • Proximity-based engagement (closer = more response)                             
 * │ • Center lock when cursor is very close                                           
 * │ • Boundary constraints to keep pupils inside orb                                  
 * │ • Touch and mouse support                                                         
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎮 CONFIGURATION                                                                   
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • smoothing       : 0.1 (lerp factor, 0.05-0.15 recommended)                      
 * │ • maxOffset       : 0.3 (max gaze offset as % of core radius)                     
 * │ • lockDistance    : 30px (distance to trigger center lock)                        
 * │ • boundaryPadding : 0.8 (keep gaze within 80% of core)                            
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

class GazeTracker {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        
        // Configuration
        this.config = {
            smoothing: options.smoothing || 0.1,  // Lerp factor (0.05-0.15 recommended)
            maxOffset: options.maxOffset || 0.3,  // Max gaze offset (30% of core radius)
            lockDistance: options.lockDistance || 30,  // Pixels from center to trigger lock
            enabled: options.enabled !== false,
            boundaryPadding: options.boundaryPadding || 0.8  // Keep gaze within 80% of core
        };
        
        // State
        this.mousePos = { x: 0, y: 0 };
        this.targetGaze = { x: 0, y: 0 };
        this.currentGaze = { x: 0, y: 0 };
        this.canvasCenter = { x: 0, y: 0 };
        this.isLocked = false;
        this.proximity = 0;  // 0-1 value for how close cursor is
        
        // Cache canvas rect to avoid reflows
        this.cachedRect = null;
        
        // Touch state
        this.touches = new Map();
        this.primaryTouch = null;
        
        // Bind event handlers
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        
        // Interaction callback
        this.onInteraction = null;
        
        // Initialize
        this.updateCanvasCenter();
        this.attachEventListeners();
        
        // Handle canvas resize
        this.resizeObserver = new ResizeObserver(() => {
            this.updateCanvasCenter();
        });
        this.resizeObserver.observe(this.canvas);
    }
    
    /**
     * Update canvas center point
     */
    updateCanvasCenter() {
        // Cache the rect to avoid repeated reflows
        this.cachedRect = this.canvas.getBoundingClientRect();
        this.canvasCenter = {
            x: this.cachedRect.width / 2,
            y: this.cachedRect.height / 2
        };
    }
    
    /**
     * Attach event listeners
     */
    attachEventListeners() {
        if (!this.config.enabled) return;
        
        // Mouse events
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseleave', this.handleMouseLeave);
        
        // Touch events
        this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: true });
        this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: true });
        this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: true });
        this.canvas.addEventListener('touchcancel', this.handleTouchEnd, { passive: true });
    }
    
    /**
     * Handle mouse movement
     */
    handleMouseMove(event) {
        // Use cached rect to avoid reflow on every mouse move
        const rect = this.cachedRect || this.canvas.getBoundingClientRect();
        this.mousePos = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
        this.updateTargetGaze();
        
        // Notify of interaction
        if (this.onInteraction) {
            this.onInteraction('mouse');
        }
    }
    
    /**
     * Handle mouse leave
     */
    handleMouseLeave() {
        // Return gaze to center when mouse leaves
        this.targetGaze = { x: 0, y: 0 };
        this.isLocked = false;
        this.proximity = 0;
    }
    
    /**
     * Handle touch start
     */
    handleTouchStart(event) {
        for (const touch of event.changedTouches) {
            this.touches.set(touch.identifier, {
                x: touch.clientX,
                y: touch.clientY
            });
            
            // Set first touch as primary
            if (!this.primaryTouch && this.touches.size === 1) {
                this.primaryTouch = touch.identifier;
            }
        }
        
        if (this.primaryTouch !== null) {
            this.updateTouchPosition(event.touches);
        }
    }
    
    /**
     * Handle touch move
     */
    handleTouchMove(event) {
        for (const touch of event.changedTouches) {
            if (this.touches.has(touch.identifier)) {
                this.touches.set(touch.identifier, {
                    x: touch.clientX,
                    y: touch.clientY
                });
            }
        }
        
        if (this.primaryTouch !== null) {
            this.updateTouchPosition(event.touches);
            
            // Notify of interaction
            if (this.onInteraction) {
                this.onInteraction('touch');
            }
        }
    }
    
    /**
     * Handle touch end
     */
    handleTouchEnd(event) {
        for (const touch of event.changedTouches) {
            this.touches.delete(touch.identifier);
            
            // Reset primary touch if it ended
            if (touch.identifier === this.primaryTouch) {
                this.primaryTouch = null;
                
                // Select new primary touch if available
                if (this.touches.size > 0) {
                    this.primaryTouch = this.touches.keys().next().value;
                } else {
                    // No touches left, return to center
                    this.handleMouseLeave();
                }
            }
        }
    }
    
    /**
     * Update position from touch
     */
    updateTouchPosition(touches) {
        for (const touch of touches) {
            if (touch.identifier === this.primaryTouch) {
                // Use cached rect to avoid reflow on every touch move
                const rect = this.cachedRect || this.canvas.getBoundingClientRect();
                this.mousePos = {
                    x: touch.clientX - rect.left,
                    y: touch.clientY - rect.top
                };
                this.updateTargetGaze();
                break;
            }
        }
    }
    
    /**
     * Calculate target gaze position based on mouse/touch position
     */
    updateTargetGaze() {
        // Calculate vector from center to mouse
        const dx = this.mousePos.x - this.canvasCenter.x;
        const dy = this.mousePos.y - this.canvasCenter.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate proximity (0-1, closer = higher)
        const maxDistance = Math.min(this.canvasCenter.x, this.canvasCenter.y);
        this.proximity = Math.max(0, 1 - (distance / maxDistance));
        
        // Check for gaze lock (very close to center)
        this.isLocked = distance < this.config.lockDistance;
        
        if (this.isLocked) {
            // When locked, gaze moves more dramatically
            this.targetGaze = {
                x: dx * this.config.maxOffset * 2,
                y: dy * this.config.maxOffset * 2
            };
        } else {
            // Normal gaze following with boundary constraints
            const maxOffset = Math.min(this.canvasCenter.x, this.canvasCenter.y) * this.config.maxOffset;
            
            if (distance > 0) {
                // Normalize and apply max offset
                const factor = Math.min(1, distance / maxDistance);
                this.targetGaze = {
                    x: (dx / distance) * maxOffset * factor * this.config.boundaryPadding,
                    y: (dy / distance) * maxOffset * factor * this.config.boundaryPadding
                };
            } else {
                this.targetGaze = { x: 0, y: 0 };
            }
        }
    }
    
    /**
     * Update gaze position with smooth interpolation
     * @param {number} deltaTime - Time since last update in ms
     */
    update(deltaTime) {
        if (!this.config.enabled) return;
        
        // Smooth interpolation towards target
        const smoothing = 1 - Math.pow(1 - this.config.smoothing, deltaTime / 16.67); // Normalize to 60fps
        
        this.currentGaze.x += (this.targetGaze.x - this.currentGaze.x) * smoothing;
        this.currentGaze.y += (this.targetGaze.y - this.currentGaze.y) * smoothing;
        
        // Add micro jitter when locked for liveliness
        if (this.isLocked) {
            const jitter = 0.5;
            this.currentGaze.x += (Math.random() - 0.5) * jitter;
            this.currentGaze.y += (Math.random() - 0.5) * jitter;
        }
    }
    
    /**
     * Get current gaze offset for rendering
     * @param {number} coreRadius - The radius of the core
     * @returns {Object} Gaze offset {x, y}
     */
    getGazeOffset(coreRadius) {
        return {
            x: this.currentGaze.x,
            y: this.currentGaze.y
        };
    }
    
    /**
     * Get current state
     * @returns {Object} Current gaze state
     */
    getState() {
        return {
            gaze: { ...this.currentGaze },
            target: { ...this.targetGaze },
            proximity: this.proximity,
            isLocked: this.isLocked,
            isActive: this.config.enabled
        };
    }
    
    /**
     * Enable gaze tracking
     */
    enable() {
        if (!this.config.enabled) {
            this.config.enabled = true;
            this.attachEventListeners();
        }
    }
    
    /**
     * Disable gaze tracking
     */
    disable() {
        if (this.config.enabled) {
            this.config.enabled = false;
            this.detachEventListeners();
            this.targetGaze = { x: 0, y: 0 };
        }
    }
    
    /**
     * Detach event listeners
     */
    detachEventListeners() {
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
        this.canvas.removeEventListener('touchstart', this.handleTouchStart);
        this.canvas.removeEventListener('touchmove', this.handleTouchMove);
        this.canvas.removeEventListener('touchend', this.handleTouchEnd);
        this.canvas.removeEventListener('touchcancel', this.handleTouchEnd);
    }
    
    /**
     * Set interaction callback
     * @param {Function} callback - Function to call on interaction
     */
    setInteractionCallback(callback) {
        this.onInteraction = callback;
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        this.detachEventListeners();
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        this.touches.clear();
    }
}

export default GazeTracker;