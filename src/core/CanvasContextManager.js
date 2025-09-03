/**
 * CanvasContextManager - Handles canvas context recovery and fallbacks
 * Provides automatic context loss detection, recovery, and performance optimization
 */

import { ErrorResponse, ErrorTypes } from './ErrorResponse.js';
import { getErrorLogger } from './ErrorLogger.js';

export class CanvasContextManager {
    constructor(canvas, config = {}) {
        this.canvas = canvas;
        this.config = {
            enableContextRecovery: config.enableContextRecovery !== false,
            enableHighDPISupport: config.enableHighDPISupport !== false,
            enablePerformanceOptimization: config.enablePerformanceOptimization !== false,
            maxRecoveryAttempts: config.maxRecoveryAttempts || 3,
            recoveryDelay: config.recoveryDelay || 1000,
            fallbackMode: config.fallbackMode || 'basic',
            ...config
        };

        this.errorLogger = getErrorLogger();
        
        // Context state
        this.context = null;
        this.contextType = '2d';
        this.isContextLost = false;
        this.recoveryAttempts = 0;
        this.lastRecoveryTime = 0;
        
        // Device pixel ratio handling
        this.devicePixelRatio = this.getDevicePixelRatio();
        this.scaleFactor = 1;
        
        // Performance monitoring
        this.performanceMetrics = {
            drawCalls: 0,
            lastFrameTime: 0,
            averageFrameTime: 0,
            frameTimeHistory: []
        };
        
        // Fallback rendering state
        this.fallbackRenderer = null;
        this.renderingMode = 'normal';
        
        // Event listeners
        this.contextLostHandler = this.handleContextLost.bind(this);
        this.contextRestoredHandler = this.handleContextRestored.bind(this);
        
        this.initialize();
    }

    /**
     * Initialize canvas context with error handling
     * @returns {Object} Initialization result
     */
    initialize() {
        try {
            // Set up canvas size and scaling
            this.setupCanvasSize();
            
            // Get 2D context
            this.context = this.canvas.getContext('2d', {
                alpha: true,
                desynchronized: true, // For better performance
                willReadFrequently: false
            });
            
            if (!this.context) {
                return this.handleContextFailure('Failed to get 2D context');
            }
            
            // Set up context event listeners
            this.setupContextEventListeners();
            
            // Apply initial optimizations
            this.applyContextOptimizations();
            
            console.log('CanvasContextManager initialized successfully', {
                canvasSize: { width: this.canvas.width, height: this.canvas.height },
                devicePixelRatio: this.devicePixelRatio,
                scaleFactor: this.scaleFactor
            });
            
            return ErrorResponse.success({
                context: this.context,
                canvasSize: { width: this.canvas.width, height: this.canvas.height },
                devicePixelRatio: this.devicePixelRatio
            });
            
        } catch (error) {
            return this.handleContextFailure(`Context initialization failed: ${error.message}`);
        }
    }

    /**
     * Set up canvas size with high-DPI support
     */
    setupCanvasSize() {
        if (!this.config.enableHighDPISupport) {
            return;
        }
        
        const rect = this.canvas.getBoundingClientRect();
        const displayWidth = rect.width;
        const displayHeight = rect.height;
        
        // Calculate scale factor
        this.scaleFactor = Math.min(this.devicePixelRatio, 2); // Cap at 2x for performance
        
        // Set actual canvas size
        this.canvas.width = displayWidth * this.scaleFactor;
        this.canvas.height = displayHeight * this.scaleFactor;
        
        // Set CSS size
        this.canvas.style.width = displayWidth + 'px';
        this.canvas.style.height = displayHeight + 'px';
    }

    /**
     * Get device pixel ratio with fallback
     * @returns {number} Device pixel ratio
     */
    getDevicePixelRatio() {
        try {
            return window.devicePixelRatio || 1;
        } catch (error) {
            return 1;
        }
    }

    /**
     * Set up context event listeners for recovery
     */
    setupContextEventListeners() {
        if (!this.config.enableContextRecovery) {
            return;
        }
        
        this.canvas.addEventListener('webglcontextlost', this.contextLostHandler);
        this.canvas.addEventListener('webglcontextrestored', this.contextRestoredHandler);
        
        // Also listen for general context events
        this.canvas.addEventListener('contextlost', this.contextLostHandler);
        this.canvas.addEventListener('contextrestored', this.contextRestoredHandler);
    }

    /**
     * Apply context optimizations for better performance
     */
    applyContextOptimizations() {
        if (!this.config.enablePerformanceOptimization || !this.context) {
            return;
        }
        
        // Scale context for high-DPI displays
        if (this.scaleFactor !== 1) {
            this.context.scale(this.scaleFactor, this.scaleFactor);
        }
        
        // Set image smoothing for better performance
        this.context.imageSmoothingEnabled = true;
        this.context.imageSmoothingQuality = 'medium';
        
        // Optimize text rendering
        this.context.textBaseline = 'top';
        this.context.textAlign = 'left';
    }

    /**
     * Handle context lost event
     * @param {Event} event - Context lost event
     */
    handleContextLost(event) {
        event.preventDefault();
        this.isContextLost = true;
        
        this.errorLogger.logError(
            ErrorResponse.failure(
                ErrorTypes.CANVAS_CONTEXT_LOST,
                'Canvas context lost',
                { 
                    recoveryAttempts: this.recoveryAttempts,
                    canvasSize: { width: this.canvas.width, height: this.canvas.height }
                }
            )
        );
        
        // Switch to fallback rendering if available
        this.enableFallbackRendering();
        
        // Emit context lost event
        this.emit('contextLost', {
            recoveryAttempts: this.recoveryAttempts,
            fallbackMode: this.renderingMode
        });
    }

    /**
     * Handle context restored event
     * @param {Event} event - Context restored event
     */
    handleContextRestored(event) {
        this.isContextLost = false;
        
        // Reinitialize context
        const result = this.initialize();
        
        if (result.success) {
            this.disableFallbackRendering();
            
            console.log('Canvas context successfully restored');
            
            this.emit('contextRestored', {
                recoveryAttempts: this.recoveryAttempts,
                context: this.context
            });
        } else {
            this.scheduleRecoveryAttempt();
        }
    }

    /**
     * Manually attempt context recovery
     * @returns {Object} Recovery result
     */
    attemptRecovery() {
        if (!this.config.enableContextRecovery) {
            return ErrorResponse.failure(
                ErrorTypes.CANVAS_CONTEXT_LOST,
                'Context recovery is disabled'
            );
        }
        
        if (this.recoveryAttempts >= this.config.maxRecoveryAttempts) {
            return ErrorResponse.failure(
                ErrorTypes.CANVAS_CONTEXT_LOST,
                'Maximum recovery attempts exceeded',
                { maxAttempts: this.config.maxRecoveryAttempts }
            );
        }
        
        const now = Date.now();
        if (now - this.lastRecoveryTime < this.config.recoveryDelay) {
            return ErrorResponse.failure(
                ErrorTypes.CANVAS_CONTEXT_LOST,
                'Recovery attempt too soon',
                { 
                    lastAttempt: this.lastRecoveryTime,
                    delay: this.config.recoveryDelay
                }
            );
        }
        
        this.recoveryAttempts++;
        this.lastRecoveryTime = now;
        
        try {
            // Force context recreation
            const newContext = this.canvas.getContext('2d', { alpha: true });
            
            if (newContext) {
                this.context = newContext;
                this.isContextLost = false;
                this.applyContextOptimizations();
                
                console.log(`Context recovery successful (attempt ${this.recoveryAttempts})`);
                
                return ErrorResponse.success({
                    context: this.context,
                    recoveryAttempts: this.recoveryAttempts
                });
            } else {
                throw new Error('Failed to recreate context');
            }
            
        } catch (error) {
            this.errorLogger.logError(
                ErrorResponse.failure(
                    ErrorTypes.CANVAS_CONTEXT_LOST,
                    `Context recovery failed: ${error.message}`,
                    { 
                        attempt: this.recoveryAttempts,
                        error: error.message
                    }
                )
            );
            
            return ErrorResponse.failure(
                ErrorTypes.CANVAS_CONTEXT_LOST,
                `Context recovery failed: ${error.message}`,
                { attempt: this.recoveryAttempts }
            );
        }
    }

    /**
     * Schedule automatic recovery attempt
     */
    scheduleRecoveryAttempt() {
        if (this.recoveryAttempts >= this.config.maxRecoveryAttempts) {
            this.enableFallbackRendering();
            return;
        }
        
        setTimeout(() => {
            this.attemptRecovery();
        }, this.config.recoveryDelay);
    }

    /**
     * Handle context initialization failure
     * @param {string} message - Error message
     * @returns {Object} Error response
     */
    handleContextFailure(message) {
        this.errorLogger.logError(
            ErrorResponse.failure(
                ErrorTypes.CANVAS_CONTEXT_LOST,
                message,
                { 
                    canvas: !!this.canvas,
                    canvasSize: this.canvas ? { width: this.canvas.width, height: this.canvas.height } : null
                }
            )
        );
        
        this.enableFallbackRendering();
        
        return ErrorResponse.failure(
            ErrorTypes.CANVAS_CONTEXT_LOST,
            message,
            { fallbackMode: this.renderingMode }
        );
    }

    /**
     * Enable fallback rendering mode
     */
    enableFallbackRendering() {
        this.renderingMode = this.config.fallbackMode;
        
        switch (this.config.fallbackMode) {
            case 'basic':
                this.fallbackRenderer = new BasicFallbackRenderer(this.canvas);
                break;
            case 'dom':
                this.fallbackRenderer = new DOMFallbackRenderer(this.canvas);
                break;
            case 'none':
                this.fallbackRenderer = null;
                break;
            default:
                this.fallbackRenderer = new BasicFallbackRenderer(this.canvas);
        }
        
        console.log(`Fallback rendering enabled: ${this.renderingMode}`);
        
        this.emit('fallbackEnabled', {
            mode: this.renderingMode,
            renderer: !!this.fallbackRenderer
        });
    }

    /**
     * Disable fallback rendering mode
     */
    disableFallbackRendering() {
        if (this.fallbackRenderer) {
            this.fallbackRenderer.cleanup();
            this.fallbackRenderer = null;
        }
        
        this.renderingMode = 'normal';
        
        this.emit('fallbackDisabled', {
            mode: 'normal'
        });
    }

    /**
     * Get current rendering context (normal or fallback)
     * @returns {Object} Context information
     */
    getContext() {
        if (this.isContextLost || !this.context) {
            return {
                context: this.fallbackRenderer,
                type: 'fallback',
                mode: this.renderingMode,
                isLost: this.isContextLost
            };
        }
        
        return {
            context: this.context,
            type: '2d',
            mode: 'normal',
            isLost: false
        };
    }

    /**
     * Check if context is available and working
     * @returns {boolean} True if context is available
     */
    isContextAvailable() {
        if (this.isContextLost || !this.context) {
            return false;
        }
        
        try {
            // Test context by attempting a simple operation
            this.context.save();
            this.context.restore();
            return true;
        } catch (error) {
            this.handleContextLost({ preventDefault: () => {} });
            return false;
        }
    }

    /**
     * Optimize canvas size for performance
     * @param {number} targetFPS - Target frame rate
     * @returns {Object} Optimization result
     */
    optimizeCanvasSize(targetFPS = 60) {
        if (!this.config.enablePerformanceOptimization) {
            return ErrorResponse.success({ message: 'Performance optimization disabled' });
        }
        
        const currentFPS = this.calculateAverageFPS();
        
        if (currentFPS < targetFPS * 0.8) { // If FPS is below 80% of target
            // Reduce canvas size
            const reductionFactor = 0.9;
            const newWidth = Math.floor(this.canvas.width * reductionFactor);
            const newHeight = Math.floor(this.canvas.height * reductionFactor);
            
            this.canvas.width = Math.max(newWidth, 200); // Minimum size
            this.canvas.height = Math.max(newHeight, 200);
            
            // Reapply scaling
            if (this.context && this.scaleFactor !== 1) {
                this.context.scale(this.scaleFactor, this.scaleFactor);
            }
            
            console.log('Canvas size optimized for performance', {
                oldSize: { width: newWidth / reductionFactor, height: newHeight / reductionFactor },
                newSize: { width: this.canvas.width, height: this.canvas.height },
                currentFPS,
                targetFPS
            });
            
            return ErrorResponse.success({
                optimized: true,
                newSize: { width: this.canvas.width, height: this.canvas.height },
                currentFPS,
                targetFPS
            });
        }
        
        return ErrorResponse.success({
            optimized: false,
            currentFPS,
            targetFPS,
            message: 'No optimization needed'
        });
    }

    /**
     * Calculate average FPS from frame time history
     * @returns {number} Average FPS
     */
    calculateAverageFPS() {
        if (this.performanceMetrics.frameTimeHistory.length === 0) {
            return 60; // Default assumption
        }
        
        const avgFrameTime = this.performanceMetrics.frameTimeHistory.reduce((sum, time) => sum + time, 0) / 
                           this.performanceMetrics.frameTimeHistory.length;
        
        return Math.round(1000 / avgFrameTime);
    }

    /**
     * Record frame performance metrics
     * @param {number} frameTime - Frame time in milliseconds
     */
    recordFrameMetrics(frameTime) {
        this.performanceMetrics.drawCalls++;
        this.performanceMetrics.lastFrameTime = frameTime;
        
        // Maintain frame time history (last 60 frames)
        this.performanceMetrics.frameTimeHistory.push(frameTime);
        if (this.performanceMetrics.frameTimeHistory.length > 60) {
            this.performanceMetrics.frameTimeHistory.shift();
        }
        
        // Calculate average
        this.performanceMetrics.averageFrameTime = 
            this.performanceMetrics.frameTimeHistory.reduce((sum, time) => sum + time, 0) / 
            this.performanceMetrics.frameTimeHistory.length;
    }

    /**
     * Get performance metrics
     * @returns {Object} Performance metrics
     */
    getPerformanceMetrics() {
        return {
            ...this.performanceMetrics,
            averageFPS: this.calculateAverageFPS(),
            canvasSize: { width: this.canvas.width, height: this.canvas.height },
            devicePixelRatio: this.devicePixelRatio,
            scaleFactor: this.scaleFactor,
            renderingMode: this.renderingMode,
            isContextLost: this.isContextLost
        };
    }

    /**
     * Reset performance metrics
     */
    resetPerformanceMetrics() {
        this.performanceMetrics = {
            drawCalls: 0,
            lastFrameTime: 0,
            averageFrameTime: 0,
            frameTimeHistory: []
        };
    }

    /**
     * Event emitter functionality
     */
    emit(event, data) {
        if (this.onEvent) {
            this.onEvent(event, data);
        }
    }

    /**
     * Set event callback
     * @param {Function} callback - Event callback function
     */
    setEventCallback(callback) {
        this.onEvent = callback;
    }

    /**
     * Cleanup resources
     */
    destroy() {
        // Remove event listeners
        if (this.canvas) {
            this.canvas.removeEventListener('webglcontextlost', this.contextLostHandler);
            this.canvas.removeEventListener('webglcontextrestored', this.contextRestoredHandler);
            this.canvas.removeEventListener('contextlost', this.contextLostHandler);
            this.canvas.removeEventListener('contextrestored', this.contextRestoredHandler);
        }
        
        // Cleanup fallback renderer
        this.disableFallbackRendering();
        
        // Clear references
        this.context = null;
        this.canvas = null;
        this.onEvent = null;
        
        console.log('CanvasContextManager destroyed');
    }
}

/**
 * Basic fallback renderer for when canvas context is lost
 */
class BasicFallbackRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.element = this.createFallbackElement();
    }

    createFallbackElement() {
        const element = document.createElement('div');
        element.style.position = 'absolute';
        element.style.top = '0';
        element.style.left = '0';
        element.style.width = this.canvas.style.width || '400px';
        element.style.height = this.canvas.style.height || '400px';
        element.style.backgroundColor = '#f0f0f0';
        element.style.border = '1px solid #ccc';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.fontSize = '14px';
        element.style.color = '#666';
        element.textContent = 'Canvas context unavailable - using fallback mode';
        
        // Insert after canvas
        this.canvas.parentNode.insertBefore(element, this.canvas.nextSibling);
        
        return element;
    }

    // Stub methods for compatibility
    save() {}
    restore() {}
    clearRect() {}
    fillRect() {}
    strokeRect() {}
    beginPath() {}
    moveTo() {}
    lineTo() {}
    arc() {}
    fill() {}
    stroke() {}

    cleanup() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

/**
 * DOM-based fallback renderer
 */
class DOMFallbackRenderer extends BasicFallbackRenderer {
    constructor(canvas) {
        super(canvas);
        this.shapes = [];
    }

    createFallbackElement() {
        const element = document.createElement('div');
        element.style.position = 'relative';
        element.style.width = this.canvas.style.width || '400px';
        element.style.height = this.canvas.style.height || '400px';
        element.style.overflow = 'hidden';
        element.style.backgroundColor = '#f9f9f9';
        
        // Insert after canvas
        this.canvas.parentNode.insertBefore(element, this.canvas.nextSibling);
        
        return element;
    }

    // Basic shape rendering using DOM elements
    fillRect(x, y, width, height) {
        const rect = document.createElement('div');
        rect.style.position = 'absolute';
        rect.style.left = x + 'px';
        rect.style.top = y + 'px';
        rect.style.width = width + 'px';
        rect.style.height = height + 'px';
        rect.style.backgroundColor = this.fillStyle || '#000';
        
        this.element.appendChild(rect);
        this.shapes.push(rect);
    }

    clearRect() {
        // Remove all shapes
        this.shapes.forEach(shape => {
            if (shape.parentNode) {
                shape.parentNode.removeChild(shape);
            }
        });
        this.shapes = [];
    }

    cleanup() {
        this.clearRect();
        super.cleanup();
    }
}

export default CanvasContextManager;