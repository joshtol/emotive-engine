/**
 * GazeInputHandler
 *
 * Handles gaze input processing and orb positioning.
 * Handles:
 * - Gaze data format conversion (old vs new format)
 * - Gaze offset application
 * - Idle timer reset on interaction
 * - Wake-up triggering from gaze input
 * - Current orb position calculation
 */
export class GazeInputHandler {
    constructor(renderer) {
        this.renderer = renderer;
    }

    /**
     * Set gaze data from GazeTracker
     * @param {Object} gazeData - Contains offset, proximity, and lock status
     */
    setGazeOffset(gazeData) {
        this.processGazeData(gazeData);
        this.handleGazeInteraction();
    }

    /**
     * Process gaze data (handle both old and new formats)
     * @param {Object} gazeData - Gaze data object
     */
    processGazeData(gazeData) {
        // Handle both old format (just offset) and new format (full data)
        if (typeof gazeData === 'object' && gazeData !== null) {
            if (this.isOldFormat(gazeData)) {
                // Old format - just offset
                this.renderer.state.gazeOffset = gazeData;
            } else {
                // New format - full gaze data
                this.applyNewFormatData(gazeData);
            }
        }
    }

    /**
     * Check if gaze data is in old format (just x/y offset)
     * @param {Object} gazeData - Gaze data object
     * @returns {boolean} True if old format
     */
    isOldFormat(gazeData) {
        return Object.prototype.hasOwnProperty.call(gazeData, 'x') &&
               Object.prototype.hasOwnProperty.call(gazeData, 'y');
    }

    /**
     * Apply new format gaze data
     * @param {Object} gazeData - Gaze data in new format
     */
    applyNewFormatData(gazeData) {
        this.renderer.state.gazeOffset = gazeData.offset || { x: 0, y: 0 };
        this.renderer.state.gazeIntensity = gazeData.proximity || 0;
        this.renderer.state.gazeLocked = gazeData.isLocked || false;
    }

    /**
     * Handle gaze interaction side effects
     */
    handleGazeInteraction() {
        // Reset idle timer on interaction
        this.renderer.idleTimer = 0;

        // Wake up if asleep
        if (this.renderer.isAsleep) {
            this.renderer.wakeUp();
        }
    }

    /**
     * Get current orb position (center + gaze offset)
     * @returns {Object} Position with x and y coordinates
     */
    getCurrentOrbPosition() {
        const logicalWidth = this.renderer.canvasManager.width;
        const logicalHeight = this.renderer.canvasManager.height;
        const centerX = logicalWidth / 2;
        const centerY = logicalHeight / 2 - this.renderer.config.topOffset;

        return {
            x: centerX + this.renderer.state.gazeOffset.x,
            y: centerY + this.renderer.state.gazeOffset.y
        };
    }
}
