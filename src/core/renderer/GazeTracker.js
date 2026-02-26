/**
 * GazeTracker - Manages gaze tracking for the emotive renderer
 *
 * Handles:
 * - Mouse and touch event listeners
 * - Coordinate normalization to -1 to 1 range
 * - Gaze target state management
 * - Event listener lifecycle (init/cleanup)
 *
 * @class GazeTracker
 */
export class GazeTracker {
    /**
     * Create a GazeTracker
     * @param {Object} renderer - Reference to the EmotiveRenderer
     */
    constructor(renderer) {
        this.renderer = renderer;
        this.canvas = renderer.canvas;
        this.initialized = false;

        // Event handler references (for cleanup)
        this.handleMouseMove = null;
        this.handleTouchMove = null;
    }

    /**
     * Enable or disable gaze tracking
     * @param {boolean} enabled - Whether to enable gaze tracking
     */
    setEnabled(enabled) {
        this.renderer.state.gazeTrackingEnabled = enabled;
        if (enabled) {
            // Start tracking mouse/touch position
            if (!this.initialized) {
                this.initialize();
            }
        } else {
            // Reset gaze to center when disabled
            this.renderer.state.gazeTarget = { x: 0, y: 0 };
        }
    }

    /**
     * Initialize gaze tracking event listeners
     */
    initialize() {
        // Always set up listeners once
        if (this.initialized) return;

        this.handleMouseMove = e => {
            if (!this.renderer.state.gazeTrackingEnabled) return;

            const rect = this.canvas.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const x = e.clientX - rect.left - centerX;
            const y = e.clientY - rect.top - centerY;

            // Normalize to -1 to 1 range
            this.renderer.state.gazeTarget = {
                x: x / centerX,
                y: y / centerY,
            };
        };

        this.handleTouchMove = e => {
            if (!this.renderer.state.gazeTrackingEnabled) return;

            if (e.touches.length > 0) {
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const x = touch.clientX - rect.left - centerX;
                const y = touch.clientY - rect.top - centerY;

                // Normalize to -1 to 1 range
                this.renderer.state.gazeTarget = {
                    x: x / centerX,
                    y: y / centerY,
                };
            }
        };

        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('touchmove', this.handleTouchMove);
        this.initialized = true;
    }

    /**
     * Clean up gaze tracking event listeners
     */
    cleanup() {
        if (!this.initialized) return;

        if (this.handleMouseMove) {
            document.removeEventListener('mousemove', this.handleMouseMove);
            this.handleMouseMove = null;
        }
        if (this.handleTouchMove) {
            document.removeEventListener('touchmove', this.handleTouchMove);
            this.handleTouchMove = null;
        }
        this.initialized = false;
    }

    /**
     * Check if gaze tracking is initialized
     * @returns {boolean} True if initialized
     */
    isInitialized() {
        return this.initialized;
    }

    /**
     * Get current gaze target
     * @returns {Object} Current gaze target {x, y} normalized to -1 to 1
     */
    getGazeTarget() {
        return this.renderer.state.gazeTarget;
    }

    /**
     * Check if gaze tracking is enabled
     * @returns {boolean} True if enabled
     */
    isEnabled() {
        return this.renderer.state.gazeTrackingEnabled;
    }
}
