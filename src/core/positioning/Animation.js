/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Animation-Based Positioning
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Animation-based positioning methods for mascot movement
 * @author Emotive Engine Team
 * @module positioning/Animation
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Provides animation-based positioning methods like path following, time-based
 * ║ movement, and scroll-based positioning. Creates smooth, predictable animations.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

class Animation {
    constructor(positionController) {
        this.positionController = positionController;
        this.isRunning = false;
        this.animationCallbacks = new Map();
        this.pathProgress = 0;
        this.timeProgress = 0;
        this.scrollProgress = 0;
    }

    /**
     * Move mascot along a path
     * @param {Array} points - Array of {x, y} points
     * @param {number} speed - Movement speed (points per second)
     * @param {Object} options - Path options
     */
    moveToPath(points = [], speed = 1, options = {}) {
        if (points.length < 2) {
            console.warn('Path requires at least 2 points');
            return;
        }

        const callbackId = 'path';
        const loop = options.loop !== false;
        const reverse = options.reverse || false;

        const followPath = currentTime => {
            if (!this.isRunning) return;

            const deltaTime = currentTime - (this.lastTime || currentTime);
            this.lastTime = currentTime;

            if (deltaTime > 0) {
                // Update progress
                this.pathProgress += (speed * deltaTime) / 1000;

                if (loop) {
                    this.pathProgress = this.pathProgress % points.length;
                } else {
                    this.pathProgress = Math.min(this.pathProgress, points.length - 1);
                }

                // Get current position on path
                const segmentIndex = Math.floor(this.pathProgress);
                const segmentProgress = this.pathProgress - segmentIndex;

                let currentPoint, nextPoint;

                if (reverse) {
                    currentPoint = points[points.length - 1 - segmentIndex];
                    nextPoint = points[points.length - 2 - segmentIndex] || points[0];
                } else {
                    currentPoint = points[segmentIndex];
                    nextPoint = points[segmentIndex + 1] || points[0];
                }

                // Interpolate between points
                const targetX = currentPoint.x + (nextPoint.x - currentPoint.x) * segmentProgress;
                const targetY = currentPoint.y + (nextPoint.y - currentPoint.y) * segmentProgress;

                // Convert to mascot coordinate system
                const mascotX = targetX - window.innerWidth / 2;
                const mascotY = targetY - window.innerHeight / 2;

                this.positionController.setOffset(mascotX, mascotY, 0);

                // Check if path is complete
                if (!loop && this.pathProgress >= points.length - 1) {
                    this.isRunning = false;
                    this.animationCallbacks.delete(callbackId);
                    if (options.onComplete) options.onComplete();
                    return;
                }
            }

            if (this.isRunning) {
                requestAnimationFrame(followPath);
            }
        };

        this.animationCallbacks.set(callbackId, followPath);
        this.isRunning = true;
        this.lastTime = performance.now();
        followPath(this.lastTime);

        return () => {
            this.isRunning = false;
            this.animationCallbacks.delete(callbackId);
        };
    }

    /**
     * Move mascot based on time
     * @param {number} duration - Animation duration in ms
     * @param {string} easing - Easing function name
     * @param {Object} options - Time-based options
     */
    moveToTime(duration = 2000, easing = 'easeInOutCubic', options = {}) {
        const callbackId = 'time';
        const startTime = performance.now();
        const startPosition = this.positionController.getOffset();
        const targetPosition = options.target || { x: 0, y: 0 };

        const animateTime = currentTime => {
            if (!this.isRunning) return;

            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Apply easing
            const easedProgress = this.applyEasing(progress, easing);

            // Interpolate position
            const currentX = startPosition.x + (targetPosition.x - startPosition.x) * easedProgress;
            const currentY = startPosition.y + (targetPosition.y - startPosition.y) * easedProgress;

            this.positionController.setOffset(currentX, currentY, 0);

            if (progress >= 1) {
                this.isRunning = false;
                this.animationCallbacks.delete(callbackId);
                if (options.onComplete) options.onComplete();
            } else {
                requestAnimationFrame(animateTime);
            }
        };

        this.animationCallbacks.set(callbackId, animateTime);
        this.isRunning = true;
        animateTime(startTime);

        return () => {
            this.isRunning = false;
            this.animationCallbacks.delete(callbackId);
        };
    }

    /**
     * Move mascot based on scroll progress
     * @param {number} progress - Scroll progress (0-1)
     * @param {Object} offset - Pixel offset
     * @param {Object} options - Scroll-based options
     */
    moveToScroll(progress = 0, offset = { x: 0, y: 0 }, options = {}) {
        const callbackId = 'scroll';

        const updateScrollPosition = () => {
            if (!this.isRunning) return;

            // Calculate position based on scroll progress
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let targetX, targetY;

            if (options.direction === 'horizontal') {
                targetX = progress * viewportWidth + offset.x;
                targetY = viewportHeight / 2 + offset.y;
            } else if (options.direction === 'vertical') {
                targetX = viewportWidth / 2 + offset.x;
                targetY = progress * viewportHeight + offset.y;
            } else {
                // Circular or custom path
                const angle = progress * Math.PI * 2;
                const radius = options.radius || Math.min(viewportWidth, viewportHeight) / 4;
                targetX = viewportWidth / 2 + Math.cos(angle) * radius + offset.x;
                targetY = viewportHeight / 2 + Math.sin(angle) * radius + offset.y;
            }

            // Convert to mascot coordinate system
            const mascotX = targetX - viewportWidth / 2;
            const mascotY = targetY - viewportHeight / 2;

            this.positionController.setOffset(mascotX, mascotY, 0);
        };

        this.animationCallbacks.set(callbackId, updateScrollPosition);
        this.isRunning = true;
        updateScrollPosition();

        return () => {
            this.isRunning = false;
            this.animationCallbacks.delete(callbackId);
        };
    }

    /**
     * Animate to specific coordinates
     * @param {number} x - Target X coordinate
     * @param {number} y - Target Y coordinate
     * @param {number} duration - Animation duration
     * @param {string} easing - Easing function
     */
    animateTo(x, y, duration = 1000, easing = 'easeOutCubic') {
        this.positionController.animateOffset(x, y, 0, duration, easing);
    }

    /**
     * Apply easing function
     * @param {number} t - Input value (0-1)
     * @param {string} easing - Easing function name
     * @returns {number} Eased value
     */
    applyEasing(t, easing) {
        switch (easing) {
            case 'linear':
                return t;
            case 'easeInQuad':
                return t * t;
            case 'easeOutQuad':
                return 1 - (1 - t) * (1 - t);
            case 'easeInOutQuad':
                return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            case 'easeInCubic':
                return t * t * t;
            case 'easeOutCubic':
                return 1 - Math.pow(1 - t, 3);
            case 'easeInOutCubic':
                return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            case 'easeInBack': {
                const c1 = 1.70158;
                const c3 = c1 + 1;
                return c3 * t * t * t - c1 * t * t;
            }
            case 'easeOutBack': {
                const c1_back = 1.70158;
                const c3_back = c1_back + 1;
                return 1 + c3_back * Math.pow(t - 1, 3) + c1_back * Math.pow(t - 1, 2);
            }
            case 'easeInElastic':
                return t === 0
                    ? 0
                    : t === 1
                      ? 1
                      : -Math.pow(2, 10 * t - 10) *
                        Math.sin((t * 10 - 10.75) * ((2 * Math.PI) / 3));
            case 'easeOutElastic':
                return t === 0
                    ? 0
                    : t === 1
                      ? 1
                      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
            default:
                return t;
        }
    }

    /**
     * Stop all animations
     */
    stopAllAnimations() {
        this.isRunning = false;
        this.animationCallbacks.clear();
        this.pathProgress = 0;
        this.timeProgress = 0;
        this.scrollProgress = 0;
    }

    /**
     * Destroy the animation system
     */
    destroy() {
        this.stopAllAnimations();
        this.positionController = null;
    }
}

export default Animation;
