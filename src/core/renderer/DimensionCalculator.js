/**
 * DimensionCalculator
 *
 * Calculates dimensions, positions, and base transform values for rendering.
 * Handles:
 * - Canvas size and scale factors
 * - Center position with emotion offsets
 * - Gesture transform application
 * - Gesture animation transform accumulation
 */
export class DimensionCalculator {
    constructor(renderer) {
        this.renderer = renderer;
    }

    /**
     * Calculate base dimensions and scale factors
     * @param {number} logicalWidth - Canvas logical width
     * @param {number} logicalHeight - Canvas logical height
     * @returns {Object} Canvas size
     */
    calculateBaseDimensions(logicalWidth, logicalHeight) {
        // Calculate dimensions - using logical size for proper scaling
        const canvasSize = Math.min(logicalWidth, logicalHeight);

        // Get effective center coordinates (with position offsets applied)
        const effectiveCenter = this.renderer.getEffectiveCenter();

        // Calculate global scale factor for core rendering (uses coreScale for independent control)
        this.renderer.scaleFactor =
            (canvasSize / this.renderer.config.referenceSize) *
            this.renderer.config.baseScale *
            (effectiveCenter.coreScale || effectiveCenter.scale);

        // Store particle scale factor separately for particle system
        this.renderer.particleScaleFactor =
            (canvasSize / this.renderer.config.referenceSize) *
            this.renderer.config.baseScale *
            (effectiveCenter.particleScale || effectiveCenter.scale);

        return { canvasSize, effectiveCenter };
    }

    /**
     * Calculate center position with emotion offsets
     * @param {Object} effectiveCenter - Effective center coordinates
     * @param {Object} state - Current emotional state
     * @param {number} logicalHeight - Canvas logical height
     * @returns {Object} Center coordinates {centerX, centerY}
     */
    calculateCenterPosition(effectiveCenter, state, logicalHeight) {
        const centerX = effectiveCenter.x;
        let centerY = effectiveCenter.y - this.renderer.config.topOffset;

        // Apply vertical offset for certain emotions (like excited for exclamation mark)
        if (state.properties && state.properties.verticalOffset) {
            centerY =
                effectiveCenter.y -
                this.renderer.config.topOffset +
                logicalHeight * state.properties.verticalOffset;
        }

        return { centerX, centerY };
    }

    /**
     * Apply gesture transform to position and calculate transform multipliers
     * @param {number} centerX - Initial center X
     * @param {number} centerY - Initial center Y
     * @param {Object|null} gestureTransform - Gesture transform object
     * @returns {Object} Updated position and transform values
     */
    applyGestureTransform(centerX, centerY, gestureTransform) {
        let scaleMultiplier = 1;
        let rotationAngle = 0;
        let glowMultiplier = 1;

        if (gestureTransform) {
            centerX += gestureTransform.x || 0;
            centerY += gestureTransform.y || 0;
            scaleMultiplier = gestureTransform.scale || 1;
            rotationAngle = ((gestureTransform.rotation || 0) * Math.PI) / 180;
            glowMultiplier = gestureTransform.glowIntensity || 1;
        }

        return { centerX, centerY, scaleMultiplier, rotationAngle, glowMultiplier };
    }

    /**
     * Apply gesture animations and accumulate transforms
     * @param {number} centerX - Current center X
     * @param {number} centerY - Current center Y
     * @param {number} scaleMultiplier - Current scale multiplier
     * @param {number} rotationAngle - Current rotation angle
     * @param {number} glowMultiplier - Current glow multiplier
     * @returns {Object} Updated position and transform values, plus gestureTransforms object
     */
    applyGestureAnimations(centerX, centerY, scaleMultiplier, rotationAngle, glowMultiplier) {
        // Apply gesture animations (delegate to GestureAnimator)
        const gestureTransforms = this.renderer.gestureAnimator.applyGestureAnimations();
        if (gestureTransforms) {
            centerX += gestureTransforms.offsetX || 0;
            centerY += gestureTransforms.offsetY || 0;
            scaleMultiplier *= gestureTransforms.scale || 1;
            rotationAngle += ((gestureTransforms.rotation || 0) * Math.PI) / 180;
            // DON'T MULTIPLY - just use the glow value directly to prevent accumulation
            glowMultiplier = gestureTransforms.glow || 1;
        }

        return {
            centerX,
            centerY,
            scaleMultiplier,
            rotationAngle,
            glowMultiplier,
            gestureTransforms,
        };
    }

    /**
     * Calculate all dimensions, positions, and base transforms
     * @param {number} logicalWidth - Canvas logical width
     * @param {number} logicalHeight - Canvas logical height
     * @param {Object} state - Current emotional state
     * @param {Object|null} gestureTransform - Gesture transform object
     * @returns {Object} All calculated dimensions and transforms
     */
    calculateRenderDimensions(logicalWidth, logicalHeight, state, gestureTransform) {
        // Calculate base dimensions and scale factors
        const { canvasSize, effectiveCenter } = this.calculateBaseDimensions(
            logicalWidth,
            logicalHeight
        );

        // Calculate center position with emotion offsets
        let { centerX, centerY } = this.calculateCenterPosition(
            effectiveCenter,
            state,
            logicalHeight
        );

        // Apply gesture transform
        let scaleMultiplier, rotationAngle, glowMultiplier;
        ({ centerX, centerY, scaleMultiplier, rotationAngle, glowMultiplier } =
            this.applyGestureTransform(centerX, centerY, gestureTransform));

        // Apply gesture animations
        const result = this.applyGestureAnimations(
            centerX,
            centerY,
            scaleMultiplier,
            rotationAngle,
            glowMultiplier
        );
        ({ centerX, centerY, scaleMultiplier, rotationAngle, glowMultiplier } = result);
        const { gestureTransforms } = result;

        return {
            canvasSize,
            effectiveCenter,
            centerX,
            centerY,
            scaleMultiplier,
            rotationAngle,
            glowMultiplier,
            gestureTransforms,
        };
    }
}
