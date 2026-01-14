/**
 * ThreatLevelCalculator
 *
 * Calculates threat level for suspicion emotion based on gaze distance.
 * Handles:
 * - Distance calculation from mouse to orb center
 * - Threat level computation (closer = higher threat)
 * - Suspicion emotion visual property updates
 *
 * @module ThreatLevelCalculator
 */
import { getEmotion } from '../../core/emotions/index.js';

export class ThreatLevelCalculator {
    /**
     * Create ThreatLevelCalculator
     *
     * @param {Object} deps - Dependencies
     * @param {Object} deps.canvasManager - Canvas manager instance
     * @param {Object} deps.config - Configuration object
     * @param {Object} [deps.gazeTracker] - Gaze tracker instance
     */
    constructor(deps) {
        this.canvasManager = deps.canvasManager;
        this.config = deps.config;
        this.gazeTracker = deps.gazeTracker || null;
    }

    /**
     * Update threat level for suspicion emotion
     * @param {Object} renderState - Current render state
     */
    updateThreatLevel(renderState) {
        if (renderState.emotion !== 'suspicion' || !this.gazeTracker) {
            return;
        }

        const suspicionEmotion = getEmotion('suspicion');
        if (!suspicionEmotion || !suspicionEmotion.visual) {
            return;
        }

        const threatLevel = this.calculateThreatLevel();
        suspicionEmotion.visual.threatLevel = threatLevel;
    }

    /**
     * Calculate threat level based on mouse distance from orb
     * @returns {number} Threat level (0-1, closer = higher)
     */
    calculateThreatLevel() {
        // Get gaze state
        this.gazeTracker.getState();
        const { mousePos } = this.gazeTracker;

        // Calculate orb center position
        const centerX = this.canvasManager.width / 2;
        const centerY = this.canvasManager.height / 2 - this.config.topOffset;

        // Calculate distance from mouse to center
        const distance = this.calculateDistance(mousePos, { x: centerX, y: centerY });

        // Maximum distance for threat calculation (canvas diagonal / 3)
        const maxDist = Math.min(
            this.canvasManager.width,
            this.canvasManager.height
        ) / 2;

        // Closer = higher threat (inverted distance)
        return Math.max(0, Math.min(1, 1 - (distance / maxDist)));
    }

    /**
     * Calculate Euclidean distance between two points
     * @param {Object} p1 - First point with x and y
     * @param {Object} p2 - Second point with x and y
     * @returns {number} Distance between points
     */
    calculateDistance(p1, p2) {
        return Math.sqrt(
            Math.pow(p1.x - p2.x, 2) +
            Math.pow(p1.y - p2.y, 2)
        );
    }
}
