/**
 * OrbScaleAnimator
 *
 * Animates orb scale changes with easing functions.
 * Handles:
 * - Scale animation with configurable duration
 * - Multiple easing functions (linear, easeIn, easeOut, easeInOut)
 * - Smooth interpolation between scale values
 * - Animation frame management
 *
 * @module OrbScaleAnimator
 */
export class OrbScaleAnimator {
    /**
     * Create OrbScaleAnimator
     *
     * @param {Object} deps - Dependencies
     * @param {Object} deps.errorBoundary - Error handling wrapper
     * @param {Object} [deps.renderer] - Renderer instance
     * @param {Object} deps.state - Shared state with currentOrbScale and isRunning
     * @param {Object} [deps.chainTarget] - Return value for method chaining
     */
    constructor(deps) {
        this.errorBoundary = deps.errorBoundary;
        this.renderer = deps.renderer || null;
        this._state = deps.state;
        this._chainTarget = deps.chainTarget || this;
        this.animationId = null;
    }

    /**
     * Animate orb scale to target value
     * @param {number} scale - Target scale factor
     * @param {number} duration - Animation duration in milliseconds
     * @param {string} easing - Easing function ('linear', 'easeIn', 'easeOut', 'easeInOut')
     * @returns {EmotiveMascot} Mascot instance for chaining
     */
    setOrbScale(scale, duration = 1000, easing = 'easeInOut') {
        return this.errorBoundary.wrap(
            () => {
                if (this.renderer) {
                    this.startScaleAnimation(scale, duration, easing);
                }

                return this._chainTarget;
            },
            'setOrbScale',
            this._chainTarget
        )();
    }

    /**
     * Start scale animation
     * @param {number} targetScale - Target scale
     * @param {number} duration - Duration in ms
     * @param {string} easing - Easing function
     */
    startScaleAnimation(targetScale, duration, easing) {
        const startScale = this._state.currentOrbScale || 1.0;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Apply easing
            const easedProgress = this.applyEasing(progress, easing);

            // Calculate current scale
            this._state.currentOrbScale = startScale + (targetScale - startScale) * easedProgress;

            // Apply to renderer
            if (this.renderer && this.renderer.setCustomScale) {
                this.renderer.setCustomScale(this._state.currentOrbScale);
            }

            // Continue animation
            if (progress < 1 && this._state.isRunning) {
                this.animationId = requestAnimationFrame(animate);
            }
        };

        animate();
    }

    /**
     * Apply easing function to progress
     * @param {number} progress - Linear progress (0-1)
     * @param {string} easing - Easing function name
     * @returns {number} Eased progress (0-1)
     */
    applyEasing(progress, easing) {
        switch (easing) {
            case 'easeIn':
                return this.easeIn(progress);

            case 'easeOut':
                return this.easeOut(progress);

            case 'easeInOut':
                return this.easeInOut(progress);

            default: // 'linear'
                return progress;
        }
    }

    /**
     * Ease-in (quadratic)
     * @param {number} t - Progress (0-1)
     * @returns {number} Eased progress
     */
    easeIn(t) {
        return t * t;
    }

    /**
     * Ease-out (quadratic)
     * @param {number} t - Progress (0-1)
     * @returns {number} Eased progress
     */
    easeOut(t) {
        return t * (2 - t);
    }

    /**
     * Ease-in-out (quadratic)
     * @param {number} t - Progress (0-1)
     * @returns {number} Eased progress
     */
    easeInOut(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    /**
     * Clean up resources and cancel animations
     */
    destroy() {
        // Cancel any pending animation frame
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        // Null references
        this.renderer = null;
        this._state = null;
    }
}
