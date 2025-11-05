/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Gesture Data Extractor
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Extracts gesture data from active animation stack for particle system
 * @author Emotive Engine Team
 * @module 3d/particles/GestureDataExtractor
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Bridges animation system and particle system:
 * ║ • Extracts gesture data from ProceduralAnimator animation stack
 * ║ • Calculates gesture progress (0-1)
 * ║ • Builds gestureMotion object for 2D particle system
 * ║ • Handles multiple simultaneous gestures (primary + secondary)
 * ║ • Provides clean API for particle orchestrator
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

export class GestureDataExtractor {
    constructor() {
        // Track previous gesture for cleanup detection
        this.previousGesture = null;
    }

    /**
     * Extract gesture data from animation stack
     * @param {Array} animations - Active animations from ProceduralAnimator
     * @param {number} currentTime - Current animation time
     * @returns {Object|null} Gesture data with motion, progress, and config
     */
    extract(animations, currentTime) {
        // No active animations
        if (!animations || animations.length === 0) {
            this.previousGesture = null;
            return null;
        }

        // Get primary gesture (first in stack)
        const primaryAnimation = animations[0];

        // Calculate progress
        const progress = this._calculateProgress(primaryAnimation, currentTime);

        // Gesture completed
        if (progress >= 1.0) {
            this.previousGesture = null;
            return null;
        }

        // Extract gesture name (need to add this to animation data)
        const gestureName = this._extractGestureName(primaryAnimation);

        if (!gestureName) {
            // Animation exists but no gesture name (emotion animation, not gesture)
            return null;
        }

        // Build gesture motion object (compatible with 2D particle system)
        const motion = this._buildGestureMotion(primaryAnimation, gestureName);

        // Track for cleanup detection
        this.previousGesture = gestureName;

        return {
            motion,
            progress,
            config: primaryAnimation.config || {},
            gestureName,
            animation: primaryAnimation
        };
    }

    /**
     * Calculate gesture progress (0-1)
     * @param {Object} animation - Animation object
     * @param {number} currentTime - Current time in ms
     * @returns {number} Progress from 0.0 to 1.0
     */
    _calculateProgress(animation, currentTime) {
        const elapsed = currentTime - animation.startTime;
        const progress = elapsed / animation.duration;
        return Math.max(0, Math.min(1, progress)); // Clamp to 0-1
    }

    /**
     * Extract gesture name from animation object
     * @param {Object} animation - Animation object
     * @returns {string|null} Gesture name or null
     */
    _extractGestureName(animation) {
        // Check multiple possible locations for gesture name
        return animation.gestureName ||
               animation.name ||
               animation.config?.gestureName ||
               null;
    }

    /**
     * Build gestureMotion object for particle system
     * @param {Object} animation - Animation object
     * @param {string} gestureName - Gesture name
     * @returns {Object} Gesture motion configuration
     */
    _buildGestureMotion(animation, gestureName) {
        const config = animation.config || {};

        return {
            type: gestureName,
            amplitude: config.amplitude || 1.0,
            strength: config.strength || 1.0,
            wobbleAmount: config.wobbleAmount || 0,
            duration: animation.duration
        };
    }

    /**
     * Check if gesture has changed since last frame
     * @param {Object} gestureData - Current gesture data
     * @returns {boolean} True if gesture changed
     */
    hasGestureChanged(gestureData) {
        if (!gestureData && !this.previousGesture) {
            return false; // No gesture before or now
        }

        if (!gestureData && this.previousGesture) {
            return true; // Gesture ended
        }

        if (gestureData && !this.previousGesture) {
            return true; // Gesture started
        }

        // Check if gesture name changed
        return gestureData.gestureName !== this.previousGesture;
    }

    /**
     * Extract all active gestures (primary + secondary)
     * @param {Array} animations - Active animations
     * @param {number} currentTime - Current time
     * @returns {Array} Array of gesture data objects
     */
    extractAll(animations, currentTime) {
        if (!animations || animations.length === 0) {
            return [];
        }

        const gestures = [];

        for (const animation of animations) {
            const progress = this._calculateProgress(animation, currentTime);

            if (progress >= 1.0) {
                continue; // Skip completed
            }

            const gestureName = this._extractGestureName(animation);

            if (!gestureName) {
                continue; // Skip non-gesture animations
            }

            const motion = this._buildGestureMotion(animation, gestureName);

            gestures.push({
                motion,
                progress,
                config: animation.config || {},
                gestureName,
                animation
            });
        }

        return gestures;
    }

    /**
     * Reset state (useful for cleanup)
     */
    reset() {
        this.previousGesture = null;
    }
}

export default GestureDataExtractor;
