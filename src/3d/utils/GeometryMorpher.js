/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - 3D Geometry Morpher
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Smooth geometry morphing system for 3D shapes
 * @author Emotive Engine Team
 * @module 3d/utils/GeometryMorpher
 *
 * Manages smooth transitions between geometries similar to 2D ShapeMorpher
 */

import * as THREE from 'three';

export class GeometryMorpher {
    constructor() {
        this.isTransitioning = false;
        this.currentGeometryType = null;
        this.targetGeometryType = null;
        this.morphStartTime = 0;
        this.morphDuration = 1000; // Smooth, relaxed transition (increased from 800ms)
        this.morphProgress = 0;
        this.visualProgress = 0; // Smoothed progress for rendering
        this.hasSwappedGeometry = false; // Track if we've swapped at midpoint

        // Easing function
        this.easing = 'easeInOutCubic';
    }

    /**
     * Start morphing to a new geometry
     * @param {string} targetType - Target geometry type name
     * @param {Object} targetGeometry - Target Three.js geometry
     * @param {number} duration - Duration in milliseconds
     * @returns {boolean} True if morph started, false if already at target
     */
    startMorph(currentType, targetType, duration = 1000) {
        // If already at target, skip
        if (currentType === targetType && !this.isTransitioning) {
            return false;
        }

        // If already transitioning to this target, skip
        if (this.isTransitioning && this.targetGeometryType === targetType) {
            return false;
        }

        // Start new transition
        this.currentGeometryType = currentType;
        this.targetGeometryType = targetType;
        this.morphStartTime = Date.now();
        this.morphDuration = duration;
        this.morphProgress = 0;
        this.visualProgress = 0;
        this.isTransitioning = true;
        this.hasSwappedGeometry = false; // Reset swap flag

        return true;
    }

    /**
     * Update morph animation
     * @param {number} deltaTime - Time since last frame in ms
     * @returns {Object} Current morph state
     */
    update(deltaTime) {
        if (!this.isTransitioning) {
            return {
                isTransitioning: false,
                progress: 0,
                visualProgress: 0,
                scaleMultiplier: 1.0
            };
        }

        // Calculate progress
        const elapsed = Date.now() - this.morphStartTime;
        const rawProgress = Math.min(elapsed / this.morphDuration, 1.0);

        // Apply easing
        this.morphProgress = this.applyEasing(rawProgress);

        // Smooth visual progress for ultra-smooth rendering (like 2D)
        // Heavy smoothing: 80% of previous frame, 20% of new
        this.visualProgress = this.visualProgress * 0.8 + this.morphProgress * 0.2;

        // Snap to final value when very close
        if (Math.abs(this.visualProgress - this.morphProgress) < 0.001) {
            this.visualProgress = this.morphProgress;
        }

        // Calculate scale multiplier for shrink/grow effect
        const scaleMultiplier = this.calculateScaleMultiplier(this.visualProgress);

        // Signal to swap geometry at midpoint (when scale is at minimum ~0.5)
        // This makes the swap imperceptible
        let shouldSwap = false;
        if (!this.hasSwappedGeometry && this.morphProgress >= 0.5) {
            this.hasSwappedGeometry = true;
            shouldSwap = true;
        }

        // Check if complete
        if (this.morphProgress >= 1.0) {
            this.completeMorph();
            return {
                isTransitioning: false,
                progress: 1.0,
                visualProgress: 1.0,
                scaleMultiplier: 1.0,
                completed: true
            };
        }

        return {
            isTransitioning: true,
            progress: this.morphProgress,
            visualProgress: this.visualProgress,
            scaleMultiplier,
            shouldSwapGeometry: shouldSwap
        };
    }

    /**
     * Calculate scale multiplier for shrink/grow animation
     * Uses smooth continuous curve with playful overshoot
     * @param {number} progress - Visual progress (0-1)
     * @returns {number} Scale multiplier
     */
    calculateScaleMultiplier(progress) {
        // Use a sine wave for smooth, continuous animation
        // Starts at 1.0, dips to minimum at 0.5, returns to 1.0
        // Smooth and gentle transition without overshoot

        const minScale = 0.75; // Shrink to 75% for subtle, smooth effect

        // Pure sine curve for ultra-smooth animation
        const sinePhase = Math.sin(progress * Math.PI);
        const mainScale = 1.0 - (sinePhase * (1.0 - minScale));

        return mainScale;
    }

    /**
     * Complete the morph transition
     */
    completeMorph() {
        this.currentGeometryType = this.targetGeometryType;
        this.targetGeometryType = null;
        this.isTransitioning = false;
        this.morphProgress = 0;
        this.visualProgress = 0;
    }

    /**
     * Apply easing function to progress
     * @param {number} t - Raw progress (0-1)
     * @returns {number} Eased progress (0-1)
     */
    applyEasing(t) {
        switch (this.easing) {
        case 'linear':
            return t;
        case 'easeInQuad':
            return t * t;
        case 'easeOutQuad':
            return t * (2 - t);
        case 'easeInOutQuad':
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        case 'easeInOutSine':
            return -(Math.cos(Math.PI * t) - 1) / 2;
        case 'easeInOutCubic':
        default:
            // Same as 2D ShapeMorpher
            return t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }
    }

    /**
     * Get current state
     * @returns {Object} Current morph state
     */
    getState() {
        return {
            isTransitioning: this.isTransitioning,
            currentGeometryType: this.currentGeometryType,
            targetGeometryType: this.targetGeometryType,
            progress: this.morphProgress,
            visualProgress: this.visualProgress
        };
    }

    /**
     * Cancel current morph
     */
    cancel() {
        this.isTransitioning = false;
        this.targetGeometryType = null;
        this.morphProgress = 0;
        this.visualProgress = 0;
    }
}

export default GeometryMorpher;
