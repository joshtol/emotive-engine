/*!
 * Emotive Engine™ - Proprietary and Confidential
 * Copyright (c) 2025 Emotive Engine. All Rights Reserved.
 *
 * NOTICE: This code is proprietary and confidential. Unauthorized copying,
 * modification, or distribution is strictly prohibited and may result in
 * legal action. This software is licensed, not sold.
 *
 * Website: https://emotiveengine.com
 * License: https://emotive-engine.web.app/LICENSE.md
 */
/**
 * OrientationController - Manages device orientation changes and responsive layout
 * Handles orientation detection, transitions, and canvas resizing
 */
class OrientationController {
    constructor(options = {}) {
        // Configuration
        this.config = {
            // Blur effects
            transitionBlur: options.transitionBlur || 30,
            revealBlur: options.revealBlur || 25,

            // Timing
            layoutChangeDelay: options.layoutChangeDelay || 150,
            blurRevealDelay: options.blurRevealDelay || 50,
            resizeDebounce: options.resizeDebounce || 100,
            orientationDelay: options.orientationDelay || 100,

            // Canvas defaults
            defaultCanvasSize: options.defaultCanvasSize || 400,

            // Classes
            portraitClass: options.portraitClass || 'portrait',
            landscapeClass: options.landscapeClass || 'landscape',
            transitioningClass: options.transitioningClass || 'transitioning',

            // Features
            enableBlurTransition: options.enableBlurTransition !== false,
            autoResizeCanvas: options.autoResizeCanvas !== false,

            ...options
        };

        // State
        this.state = {
            currentOrientation: null,
            previousOrientation: null,
            isTransitioning: false,
            blurApplied: false,
            resizeTimeout: null
        };

        // References
        this.mascot = null;
        this.app = null;

        // Callbacks
        this.onOrientationChange = options.onOrientationChange || null;
        this.onResize = options.onResize || null;
    }

    /**
     * Initialize the controller
     */
    init(app = null, mascot = null) {
        this.app = app || window.app;
        this.mascot = mascot || window.mascot;

        // Determine initial orientation
        this.updateOrientation();

        // Apply initial orientation class
        this.applyOrientationClass(this.state.currentOrientation);

        // Set up event listeners
        this.setupEventListeners();

        return this;
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Resize event (handles both resize and orientation change)
        window.addEventListener('resize', () => this.handleResize());

        // Specific orientation change event if available
        if ('orientation' in window) {
            window.addEventListener('orientationchange', () => this.handleOrientationEvent());
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const newOrientation = this.getOrientation();

        // Only apply blur once when orientation actually changes
        if (newOrientation !== this.state.previousOrientation &&
            !this.state.isTransitioning &&
            !this.state.blurApplied &&
            this.config.enableBlurTransition) {
            this.applyBlur(this.config.transitionBlur);
            this.state.blurApplied = true;
        }

        // Debounce resize handling
        clearTimeout(this.state.resizeTimeout);
        this.state.resizeTimeout = setTimeout(() => {
            this.handleOrientationChange();
            this.state.blurApplied = false;
        }, this.config.resizeDebounce);
    }

    /**
     * Handle orientation event
     */
    handleOrientationEvent() {
        if (!this.state.isTransitioning && this.config.enableBlurTransition) {
            // Apply heavy blur immediately
            this.applyBlur(this.config.transitionBlur);
            setTimeout(() => this.handleOrientationChange(), this.config.orientationDelay);
        }
    }

    /**
     * Handle orientation change
     */
    handleOrientationChange() {
        if (this.state.isTransitioning) return;

        const newOrientation = this.getOrientation();

        if (newOrientation !== this.state.previousOrientation) {
            this.state.isTransitioning = true;
            this.state.previousOrientation = this.state.currentOrientation;
            this.state.currentOrientation = newOrientation;

            console.log(`📱 Orientation changed to: ${newOrientation}`);

            // Apply orientation class to body
            this.applyOrientationClass(newOrientation);

            // Clear particles while transitioning to prevent visual artifacts
            if (this.mascot?.particleSystem) {
                this.mascot.particleSystem.particles = [];
            }

            // Wait for layout to stabilize
            setTimeout(() => {
                // Update canvas if needed
                if (this.config.autoResizeCanvas) {
                    this.updateCanvas();
                }

                // Transition effect
                if (this.config.enableBlurTransition) {
                    // Keep blur for incoming view
                    this.applyBlur(this.config.revealBlur);

                    // Then quickly unblur to reveal new layout
                    setTimeout(() => {
                        this.removeBlur();
                        this.state.isTransitioning = false;

                        // Double-check canvas dimensions after transition
                        if (this.config.autoResizeCanvas) {
                            this.finalizeCanvasResize();
                        }

                        // Trigger callback
                        if (this.onOrientationChange) {
                            this.onOrientationChange(newOrientation, this.state.previousOrientation);
                        }
                    }, this.config.blurRevealDelay);
                } else {
                    this.state.isTransitioning = false;

                    // Trigger callback
                    if (this.onOrientationChange) {
                        this.onOrientationChange(newOrientation, this.state.previousOrientation);
                    }
                }
            }, this.config.layoutChangeDelay);
        }
    }

    /**
     * Get current orientation
     */
    getOrientation() {
        return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    }

    /**
     * Update orientation state
     */
    updateOrientation() {
        this.state.currentOrientation = this.getOrientation();
        this.state.previousOrientation = this.state.currentOrientation;
    }

    /**
     * Apply orientation class to body
     */
    applyOrientationClass(orientation) {
        document.body.classList.remove(this.config.portraitClass, this.config.landscapeClass);
        document.body.classList.add(orientation === 'portrait' ?
            this.config.portraitClass :
            this.config.landscapeClass);
    }

    /**
     * Apply blur effect
     */
    applyBlur(amount) {
        document.body.style.filter = `blur(${amount}px)`;
    }

    /**
     * Remove blur effect
     */
    removeBlur() {
        document.body.style.filter = '';
    }

    /**
     * Update canvas dimensions
     */
    updateCanvas() {
        if (!this.mascot?.canvasManager) return;

        const canvas = this.mascot.canvasManager.canvas;
        const rect = canvas.getBoundingClientRect();

        // Update canvas manager dimensions
        this.mascot.canvasManager.dpr = window.devicePixelRatio || 1;
        this.mascot.canvasManager.width = rect.width;
        this.mascot.canvasManager.height = rect.height;
        this.mascot.canvasManager.canvas.width = rect.width * this.mascot.canvasManager.dpr;
        this.mascot.canvasManager.canvas.height = rect.height * this.mascot.canvasManager.dpr;
        this.mascot.canvasManager.centerX = rect.width / 2;
        this.mascot.canvasManager.centerY = rect.height / 2;

        // Reset transform
        this.mascot.canvasManager.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.mascot.canvasManager.ctx.scale(
            this.mascot.canvasManager.dpr,
            this.mascot.canvasManager.dpr
        );

        // Update renderer if available
        this.updateRenderer(rect);
    }

    /**
     * Update renderer dimensions
     */
    updateRenderer(rect) {
        if (!this.mascot?.renderer) return;

        const canvasSize = Math.min(
            rect.width || this.config.defaultCanvasSize,
            rect.height || this.config.defaultCanvasSize
        );

        this.mascot.renderer.scaleFactor = (canvasSize / this.config.defaultCanvasSize) *
            (this.mascot.renderer.config.baseScale || 1.0);

        // Update offscreen canvas
        if (this.mascot.renderer.offscreenCanvas) {
            this.mascot.renderer.offscreenCanvas.width = rect.width;
            this.mascot.renderer.offscreenCanvas.height = rect.height;
        }

        // Clear glow cache
        if (this.mascot.renderer.glowCache) {
            this.mascot.renderer.glowCache.clear();
        }
    }

    /**
     * Finalize canvas resize after transition
     */
    finalizeCanvasResize() {
        if (!this.mascot?.canvasManager) return;

        // Wait two frames to ensure complete layout settlement
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const canvas = this.mascot.canvasManager.canvas;

                // Clear any inline styles
                canvas.style.width = '';
                canvas.style.height = '';

                // Final resize
                this.updateCanvas();
            });
        });
    }

    /**
     * Force orientation update
     */
    forceUpdate() {
        this.handleOrientationChange();
    }

    /**
     * Get current state
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Check if currently transitioning
     */
    isTransitioning() {
        return this.state.isTransitioning;
    }

    /**
     * Set mascot reference
     */
    setMascot(mascot) {
        this.mascot = mascot;
    }

    /**
     * Update configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }

    /**
     * Clean up
     */
    destroy() {
        if (this.state.resizeTimeout) {
            clearTimeout(this.state.resizeTimeout);
        }
        this.removeBlur();
    }
}

// Export for use as ES6 module
export { OrientationController };

// LEGAL WARNING: This code is protected by copyright law and international treaties.
// Unauthorized reproduction or distribution of this code, or any portion of it,
// may result in severe civil and criminal penalties, and will be prosecuted
// to the maximum extent possible under the law.