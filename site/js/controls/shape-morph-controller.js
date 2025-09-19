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
 * ShapeMorphController - Manages shape morphing and transitions
 * Handles shape buttons, morph timing, and special transition rules
 */
class ShapeMorphController {
    constructor(options = {}) {
        // Configuration
        this.config = {
            // Selectors
            shapeButtonSelector: options.shapeButtonSelector || '.shape-btn',

            // Classes
            activeClass: options.activeClass || 'active',

            // Morph settings
            defaultMode: options.defaultMode || 'hybrid',
            defaultDuration: options.defaultDuration || 1000,
            rhythmDuration: options.rhythmDuration || 'bar',

            // Special transition durations
            specialTransitions: {
                'lunar-solar': 500,
                'solar-lunar': 500,
                ...options.specialTransitions
            },

            // Available shapes for random morph
            availableShapes: options.availableShapes || [
                'heart', 'star', 'sun', 'moon',
                'lunar', 'solar', 'square', 'triangle'
            ],

            ...options
        };

        // State
        this.state = {
            currentShape: null,
            previousShape: null,
            isTransitioning: false
        };

        // References
        this.mascot = null;
        this.app = null;

        // Callbacks
        this.onShapeChange = options.onShapeChange || null;

        // Element cache
        this.shapeButtons = [];
        this.activeButton = null;
    }

    /**
     * Initialize the controller
     */
    init(app = null, mascot = null) {
        this.app = app || window.app;
        this.mascot = mascot || window.mascot;

        // Get shape buttons
        this.shapeButtons = Array.from(
            document.querySelectorAll(this.config.shapeButtonSelector)
        );

        // Set up event listeners
        this.setupEventListeners();

        // Get initial shape from mascot
        this.syncWithMascot();

        return this;
    }

    /**
     * Set up event listeners for shape buttons
     */
    setupEventListeners() {
        this.shapeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const shape = btn.dataset.shape;
                if (shape) {
                    this.morphToShape(shape, btn);
                }
            });
        });
    }

    /**
     * Sync current shape with mascot
     */
    syncWithMascot() {
        if (this.mascot?.shapeMorpher) {
            this.state.currentShape = this.mascot.shapeMorpher.currentShape;

            // Update button state if shape is known
            if (this.state.currentShape) {
                const button = this.findButtonByShape(this.state.currentShape);
                if (button) {
                    this.updateButtonStates(button);
                }
            }
        }
    }

    /**
     * Morph to a specific shape
     */
    morphToShape(shape, buttonElement = null) {
        if (!this.mascot) return;

        // Update state
        this.state.previousShape = this.state.currentShape;
        this.state.currentShape = shape;

        // Update button states
        this.updateButtonStates(buttonElement || this.findButtonByShape(shape));

        // Calculate duration
        const duration = this.calculateDuration(this.state.previousShape, shape);

        // Perform morph
        this.mascot.morphTo(shape, {
            duration: duration,
            mode: this.config.defaultMode,
            onBeat: window.rhythmActive || false
        });

        // Trigger callback
        if (this.onShapeChange) {
            this.onShapeChange(shape, this.state.previousShape);
        }
    }

    /**
     * Calculate morph duration based on transition type
     */
    calculateDuration(fromShape, toShape) {
        // Check if rhythm is active
        if (window.rhythmActive) {
            return this.config.rhythmDuration;
        }

        // Check for special transitions
        const transitionKey = `${fromShape}-${toShape}`;
        if (this.config.specialTransitions[transitionKey]) {
            return this.config.specialTransitions[transitionKey];
        }

        // Default duration
        return this.config.defaultDuration;
    }

    /**
     * Update button visual states
     */
    updateButtonStates(activeButton) {
        // Remove active state from all buttons
        this.shapeButtons.forEach(btn => {
            btn.classList.remove(this.config.activeClass);
        });

        // Add active state to selected button
        if (activeButton) {
            activeButton.classList.add(this.config.activeClass);
            this.activeButton = activeButton;
        }
    }

    /**
     * Morph to random shape
     */
    morphToRandomShape(excludeCurrent = true) {
        let shapes = [...this.config.availableShapes];

        // Exclude current shape if requested
        if (excludeCurrent && this.state.currentShape) {
            shapes = shapes.filter(s => s !== this.state.currentShape);
        }

        if (shapes.length === 0) return null;

        const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
        this.morphToShape(randomShape);

        return randomShape;
    }

    /**
     * Special morph for core-only mode (used by morph gesture)
     */
    morphCoreToRandomShape() {
        if (!this.mascot) return null;

        const shapes = [...this.config.availableShapes];
        const randomShape = shapes[Math.floor(Math.random() * shapes.length)];

        // Perform core-only morph
        this.mascot.morphTo(randomShape, {
            duration: window.rhythmActive ? 'bar' : this.config.defaultDuration,
            mode: 'core-only',
            onBeat: window.rhythmActive || false
        });

        // Update visual feedback
        this.updateButtonStates(this.findButtonByShape(randomShape));
        this.state.currentShape = randomShape;

        return randomShape;
    }

    /**
     * Find button element by shape
     */
    findButtonByShape(shape) {
        return this.shapeButtons.find(btn =>
            btn.dataset.shape === shape
        );
    }

    /**
     * Get current shape
     */
    getCurrentShape() {
        return this.state.currentShape;
    }

    /**
     * Get available shapes
     */
    getAvailableShapes() {
        return [...this.config.availableShapes];
    }

    /**
     * Add special transition rule
     */
    addSpecialTransition(fromShape, toShape, duration) {
        this.config.specialTransitions[`${fromShape}-${toShape}`] = duration;
    }

    /**
     * Set default mode
     */
    setDefaultMode(mode) {
        this.config.defaultMode = mode;
    }

    /**
     * Set mascot reference
     */
    setMascot(mascot) {
        this.mascot = mascot;
        this.syncWithMascot();
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
        this.shapeButtons = [];
        this.activeButton = null;
    }
}

// Export for use as ES6 module
export { ShapeMorphController };

// LEGAL WARNING: This code is protected by copyright law and international treaties.
// Unauthorized reproduction or distribution of this code, or any portion of it,
// may result in severe civil and criminal penalties, and will be prosecuted
// to the maximum extent possible under the law.