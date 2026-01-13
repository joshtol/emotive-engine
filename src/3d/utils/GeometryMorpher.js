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
        this.isPausedAtSwap = false; // Paused waiting for async geometry load
        this.pausedAtTime = 0; // Time when paused (to resume correctly)

        // Easing function
        this.easing = 'easeInOutCubic';
    }

    /**
     * Start morphing to a new geometry
     * Handles interruptions gracefully - if called during an active morph,
     * will smoothly transition to the new target without visual glitches.
     *
     * @param {string} currentType - Current geometry type name
     * @param {string} targetType - Target geometry type name
     * @param {number} duration - Duration in milliseconds
     * @returns {boolean} True if morph started, false if already at target
     */
    startMorph(currentType, targetType, duration = 1000) {
        // If already at target and not transitioning, skip
        if (currentType === targetType && !this.isTransitioning) {
            return false;
        }

        // If already transitioning to this exact target, skip
        if (this.isTransitioning && this.targetGeometryType === targetType) {
            return false;
        }

        // ═══════════════════════════════════════════════════════════════════
        // INTERRUPTION HANDLING - Smooth transition when morph is interrupted
        // ═══════════════════════════════════════════════════════════════════
        if (this.isTransitioning) {
            // We're interrupting an active morph - handle gracefully
            const currentScale = this.calculateScaleMultiplier(this.visualProgress);

            if (!this.hasSwappedGeometry) {
                // Still in SHRINK phase (haven't swapped yet)
                // Continue shrinking to 0, but swap to NEW target at midpoint
                // Keep current progress, just change the target
                this.targetGeometryType = targetType;
                // Signal that we need a new geometry loaded (handled by Core3DManager)
                this._interruptedTarget = targetType;
                return true;
            } else {
                // In GROW phase (already swapped to old target)
                // Need to shrink back down, swap to NEW target, then grow
                // Calculate how long it takes to shrink from current scale to 0
                // eslint-disable-next-line no-unused-vars
                const _shrinkDuration = duration * 0.5; // Half duration for shrink (reserved for future optimization)

                // Reset to shrink phase with current scale as starting point
                this.morphStartTime = Date.now();
                this.morphDuration = duration;
                // Map current scale back to progress (inverse of shrink calculation)
                // scale = 1 - (progress*2)^2, so progress = sqrt(1-scale) / 2
                const inverseProgress = currentScale > 0
                    ? Math.sqrt(1 - Math.min(currentScale, 1)) / 2
                    : 0.5;
                this.morphProgress = inverseProgress;
                this.visualProgress = inverseProgress;
                this.hasSwappedGeometry = false; // Need to swap again at midpoint
                this.targetGeometryType = targetType;
                this._interruptedTarget = targetType;
                this.isPausedAtSwap = false;
                this.isGrowIn = false;

                // Adjust start time so animation continues from current visual state
                const elapsedEquivalent = inverseProgress * duration;
                this.morphStartTime = Date.now() - elapsedEquivalent;

                return true;
            }
        }

        // Start fresh transition (no interruption)
        this.currentGeometryType = currentType;
        this.targetGeometryType = targetType;
        this.morphStartTime = Date.now();
        this.morphDuration = duration;
        this.morphProgress = 0;
        this.visualProgress = 0;
        this.isTransitioning = true;
        this.hasSwappedGeometry = false; // Reset swap flag
        this.isPausedAtSwap = false; // Reset pause flag
        this.pausedAtTime = 0;
        this.isGrowIn = false; // Not a grow-in animation
        this._interruptedTarget = null;

        return true;
    }

    /**
     * Check if the current morph was interrupted and needs a new target geometry
     * @returns {string|null} The new target geometry type, or null if not interrupted
     */
    getInterruptedTarget() {
        const target = this._interruptedTarget;
        this._interruptedTarget = null; // Clear after reading
        return target;
    }

    /**
     * Start a grow-in animation from scale 0 to 1 (no geometry swap)
     * Used for initial appearance of mascots
     * @param {string} geometryType - Current geometry type
     * @param {number} duration - Duration in milliseconds (default: 500ms for snappy pop)
     * @returns {boolean} True if grow-in started
     */
    growIn(geometryType, duration = 500) {
        // If already transitioning, skip
        if (this.isTransitioning) {
            return false;
        }

        // Start grow-in transition (just the grow phase, no shrink)
        this.currentGeometryType = geometryType;
        this.targetGeometryType = geometryType; // Same geometry
        this.morphStartTime = Date.now();
        this.morphDuration = duration;
        this.morphProgress = 0;
        this.visualProgress = 0;
        this.isTransitioning = true;
        this.hasSwappedGeometry = true; // Already "swapped" - skip swap logic
        this.isPausedAtSwap = false;
        this.pausedAtTime = 0;
        this.isGrowIn = true; // Flag for grow-only animation

        return true;
    }

    /**
     * Pause morph at swap point (waiting for async geometry)
     */
    pauseAtSwap() {
        if (this.isTransitioning && !this.isPausedAtSwap) {
            this.isPausedAtSwap = true;
            this.pausedAtTime = Date.now();
        }
    }

    /**
     * Resume morph after async geometry loaded
     */
    resumeFromSwap() {
        if (this.isPausedAtSwap) {
            // Adjust start time so morph continues from where it was
            const pauseDuration = Date.now() - this.pausedAtTime;
            this.morphStartTime += pauseDuration;
            this.isPausedAtSwap = false;
            this.pausedAtTime = 0;
        }
    }

    /**
     * Update morph animation
     * @param {number} deltaTime - Time since last frame in ms
     * @returns {Object} Current morph state
     */
    update(_deltaTime) {
        if (!this.isTransitioning) {
            return {
                isTransitioning: false,
                progress: 0,
                visualProgress: 0,
                scaleMultiplier: 1.0
            };
        }

        // If paused at swap point, hold at minimum scale (0 for invisible swap)
        if (this.isPausedAtSwap) {
            return {
                isTransitioning: true,
                progress: 0.5,
                visualProgress: 0.5,
                scaleMultiplier: 0.0,
                waitingForGeometry: true
            };
        }

        // Calculate progress
        const elapsed = Date.now() - this.morphStartTime;
        const rawProgress = Math.min(elapsed / this.morphDuration, 1.0);

        // Apply easing
        this.morphProgress = this.applyEasing(rawProgress);

        // Smooth visual progress for ultra-smooth rendering (like 2D)
        // Lighter smoothing (60/40) so scale can reach 0 at midpoint
        this.visualProgress = this.visualProgress * 0.6 + this.morphProgress * 0.4;

        // Snap to target when close (ensures we hit 0 at midpoint and 1 at end)
        if (Math.abs(this.visualProgress - this.morphProgress) < 0.01) {
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
     * Shrinks to 0 at midpoint for invisible geometry swap, then grows back
     * Uses smooth easing for jaunty blink effect
     * @param {number} progress - Visual progress (0-1)
     * @returns {number} Scale multiplier
     */
    calculateScaleMultiplier(progress) {
        // For grow-in animations, just scale 0→1 (no shrink phase)
        if (this.isGrowIn) {
            // Use easeOutBack for bouncy pop-in effect
            // easeOutBack: overshoots slightly then settles
            const c1 = 1.70158;
            const c3 = c1 + 1;
            const eased = 1 + c3 * Math.pow(progress - 1, 3) + c1 * Math.pow(progress - 1, 2);
            return Math.max(0, eased); // Clamp to prevent negative scale
        }

        // Shrink phase (0 to 0.5): scale goes from 1.0 to 0.0
        // Grow phase (0.5 to 1.0): scale goes from 0.0 to 1.0
        // This creates a smooth "blink out, swap, blink in" effect

        if (progress <= 0.5) {
            // Shrinking: progress 0->0.5 maps to scale 1->0
            // Use easeInQuad for accelerating shrink (jaunty feel)
            const shrinkProgress = progress * 2; // 0 to 1
            const eased = shrinkProgress * shrinkProgress; // easeIn
            return 1.0 - eased;
        } else {
            // Growing: progress 0.5->1.0 maps to scale 0->1
            // Use easeOutQuad for decelerating grow (bouncy arrival)
            const growProgress = (progress - 0.5) * 2; // 0 to 1
            const eased = growProgress * (2 - growProgress); // easeOut
            return eased;
        }
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
