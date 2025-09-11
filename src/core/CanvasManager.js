/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝                                                                             
 *                      ◐ ◑ ◒ ◓  CANVAS MANAGER  ◓ ◒ ◑ ◐                      
 *                                                                                    
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Canvas Manager - High-DPI Rendering & Canvas Lifecycle
 * @author Emotive Engine Team
 * @version 2.1.0
 * @module CanvasManager
 * @changelog 2.1.0 - Added resize callback system for visual resampling
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ The FOUNDATION of visual rendering. Handles canvas setup, high-DPI scaling,       
 * ║ resize events, and provides optimized 2D context for smooth animations.           
 * ║ Ensures crisp rendering on Retina displays and manages canvas lifecycle.          
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎨 CANVAS FEATURES                                                                
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Device Pixel Ratio (DPR) scaling for Retina displays                            
 * │ • Automatic resize handling with debouncing                                       
 * │ • Resize callback system for component notification                               
 * │ • Optimized 2D context settings for animations                                    
 * │ • Center point calculation for orb positioning                                    
 * │ • Clean canvas clearing with proper scaling                                       
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ ⚡ CONTEXT OPTIMIZATIONS                                                           
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • alpha: true               - Enables transparency                                
 * │ • desynchronized: true      - Better animation performance                        
 * │ • willReadFrequently: false - We don't read pixels                                
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */
class CanvasManager {
    constructor(canvas) {
        this.canvas = canvas;
        // Get context with optimal settings for particle rendering
        this.ctx = canvas.getContext('2d', {
            alpha: true,
            desynchronized: true,  // Better performance for animations
            willReadFrequently: false  // We're not reading pixels
        });
        this.dpr = window.devicePixelRatio || 1;
        this.width = 0;
        this.height = 0;
        this.centerX = 0;
        this.centerY = 0;
        
        // Resize callbacks
        this.resizeCallbacks = [];
        
        // Bind resize handler
        this.handleResize = this.handleResize.bind(this);
        window.addEventListener('resize', this.handleResize);
        
        // Initial resize
        this.resize();
    }

    /**
     * Handles canvas resizing with proper high-DPI support
     */
    resize() {
        // Check if canvas has explicit width/height attributes
        const hasExplicitSize = this.canvas.hasAttribute('width') && this.canvas.hasAttribute('height');
        
        if (hasExplicitSize) {
            // Use the explicit canvas dimensions from attributes
            // This prevents the canvas from changing size when DevTools opens
            const attrWidth = parseInt(this.canvas.getAttribute('width'), 10);
            const attrHeight = parseInt(this.canvas.getAttribute('height'), 10);
            
            // Use attribute dimensions as base size
            this.width = attrWidth;
            this.height = attrHeight;
            
            // Set actual canvas buffer size (no DPR scaling for fixed-size canvases)
            this.canvas.width = attrWidth;
            this.canvas.height = attrHeight;
            
            // No DPR scaling needed for fixed-size canvases
            // The browser will handle the scaling automatically
        } else {
            // For responsive canvases, use the bounding rect
            const rect = this.canvas.getBoundingClientRect();
            
            // Set display size (CSS pixels)
            this.width = rect.width;
            this.height = rect.height;
            
            // Set actual size in memory (scaled for high-DPI)
            this.canvas.width = this.width * this.dpr;
            this.canvas.height = this.height * this.dpr;
            
            // Scale the drawing context for high-DPI
            this.ctx.scale(this.dpr, this.dpr);
        }
        
        // Update center coordinates
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        
        //     dpr: this.dpr,
        //     center: { x: this.centerX, y: this.centerY }
        // });
        
        // Trigger resize callbacks
        this.resizeCallbacks.forEach(callback => {
            try {
                callback(this.width, this.height, this.dpr);
            } catch (error) {
            }
        });
    }
    
    /**
     * Register a callback to be called on canvas resize
     * @param {Function} callback - Function to call with (width, height, dpr) parameters
     */
    onResize(callback) {
        if (typeof callback === 'function') {
            this.resizeCallbacks.push(callback);
        }
    }

    /**
     * Debounced resize handler to prevent excessive resize calls
     */
    handleResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.resize();
        }, 100);
    }

    /**
     * Clears the entire canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    /**
     * Gets the center coordinates of the canvas
     * @returns {Object} Object with x and y center coordinates
     */
    getCenter() {
        return {
            x: this.centerX,
            y: this.centerY
        };
    }

    /**
     * Sets transform for drawing operations
     * @param {number} x - X translation
     * @param {number} y - Y translation  
     * @param {number} scale - Scale factor
     * @param {number} rotation - Rotation in radians
     */
    setTransform(x = 0, y = 0, scale = 1, rotation = 0) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);
        this.ctx.scale(scale, scale);
    }

    /**
     * Restores the previous transform state
     */
    restoreTransform() {
        this.ctx.restore();
    }

    /**
     * Gets the 2D rendering context
     * @returns {CanvasRenderingContext2D} The canvas 2D context
     */
    getContext() {
        return this.ctx;
    }

    /**
     * Gets canvas dimensions
     * @returns {Object} Object with width and height
     */
    getDimensions() {
        return {
            width: this.width,
            height: this.height
        };
    }

    /**
     * Cleanup method to remove event listeners
     */
    destroy() {
        window.removeEventListener('resize', this.handleResize);
        clearTimeout(this.resizeTimeout);
    }
}

export default CanvasManager;