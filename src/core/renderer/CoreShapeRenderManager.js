/**
 * CoreShapeRenderManager
 *
 * Manages core and shape rendering with all special effects.
 * Handles:
 * - Sleep opacity application
 * - Shape morpher updates
 * - Sun effects rendering
 * - Core rendering
 * - Sparkle effects
 * - Moon/lunar shadow rendering
 * - Solar hybrid effects
 * - Bailey's Beads effects
 * - Alpha and rotation cleanup
 */
export class CoreShapeRenderManager {
    constructor(renderer) {
        this.renderer = renderer;
    }

    /**
     * Apply sleep opacity to core if needed
     * @param {number} sleepOpacityMod - Sleep opacity modifier
     */
    applySleepOpacity(sleepOpacityMod) {
        // Apply sleep opacity to core
        if (this.renderer.state.sleeping || this.renderer.state.emotion === 'resting') {
            this.renderer.ctx.globalAlpha = sleepOpacityMod;
        }
    }

    /**
     * Update shape morpher and get shape data
     * @param {number} coreRadius - Core radius
     * @returns {Object} Shape points and current shadow
     */
    updateShapeMorpher(coreRadius) {
        let shapePoints = null;
        let currentShadow = null;

        if (this.renderer.shapeMorpher) {
            this.renderer.shapeMorpher.update();
            // Get the canvas points relative to center (0,0) since CoreRenderer will translate
            shapePoints = this.renderer.shapeMorpher.getCanvasPoints(0, 0, coreRadius);
            currentShadow = this.renderer.shapeMorpher.getCurrentShadow();
        }

        return { shapePoints, currentShadow };
    }

    /**
     * Render sun effects if needed
     * @param {number} coreX - Core X position
     * @param {number} coreY - Core Y position
     * @param {number} coreRadius - Core radius
     * @param {Object} currentShadow - Current shadow object
     * @returns {boolean} Whether sun effects were rendered
     */
    renderSunEffects(coreX, coreY, coreRadius, currentShadow) {
        // Render sun effects BEFORE core (so they appear behind)
        let renderingSunEffects = false;
        if (currentShadow && (currentShadow.type === 'sun' || currentShadow.type === 'solar-hybrid')) {
            this.renderer.renderSunEffects(coreX, coreY, coreRadius, currentShadow);
            renderingSunEffects = true;
        }
        return renderingSunEffects;
    }

    /**
     * Render core shape
     * @param {number} coreX - Core X position
     * @param {number} coreY - Core Y position
     * @param {number} coreRadius - Core radius
     * @param {number} totalRotation - Total rotation value
     * @param {Array} shapePoints - Shape points for morphing
     */
    renderCore(coreX, coreY, coreRadius, totalRotation, shapePoints) {
        // Render the core shape with rotation
        // Note: We already applied rotation to the canvas, but CoreRenderer does its own transform
        // So we need to pass the rotation value to it
        this.renderer.coreRenderer.renderCore(coreX, coreY, coreRadius, {
            scaleX: 1,
            scaleY: 1,
            rotation: totalRotation,
            shapePoints
        });
    }

    /**
     * Update and render sparkles
     * @param {number} deltaTime - Time elapsed since last frame
     */
    renderSparkles(deltaTime) {
        // Update and render sparkles BEFORE moon shadow so they don't cover it
        if (this.renderer.specialEffects) {
            this.renderer.specialEffects.update(deltaTime);
            this.renderer.specialEffects.renderSparkles();
        }
    }

    /**
     * Render moon/lunar shadows and solar hybrid effects
     * @param {number} coreX - Core X position
     * @param {number} coreY - Core Y position
     * @param {number} coreRadius - Core radius
     * @param {Object} currentShadow - Current shadow object
     * @param {Array} shapePoints - Shape points for morphing
     * @param {boolean} renderingSunEffects - Whether sun effects were rendered
     */
    renderShadowEffects(coreX, coreY, coreRadius, currentShadow, shapePoints, renderingSunEffects) {
        // Check if we're dealing with solar transitions
        const currentShape = this.renderer.shapeMorpher ? this.renderer.shapeMorpher.currentShape : null;
        const targetShape = this.renderer.shapeMorpher ? this.renderer.shapeMorpher.targetShape : null;
        const isTransitioningToSolar = this.renderer.shapeMorpher && targetShape === 'solar' && this.renderer.shapeMorpher.isTransitioning;
        const isTransitioningFromSolar = this.renderer.shapeMorpher && currentShape === 'solar' && this.renderer.shapeMorpher.isTransitioning;
        const isAtSolar = currentShadow && currentShadow.type === 'solar-hybrid';

        // Check specific transition directions
        const isSolarToMoon = this.renderer.shapeMorpher && this.renderer.shapeMorpher.isTransitioning &&
            currentShape === 'solar' && targetShape === 'moon';
        const isMoonToSolar = this.renderer.shapeMorpher && this.renderer.shapeMorpher.isTransitioning &&
            currentShape === 'moon' && targetShape === 'solar';

        // Render moon/lunar shadows AFTER core AND sparkles (as top overlay)
        // Always render moon shadow EXCEPT when transitioning FROM moon TO solar
        if (currentShadow && (currentShadow.type === 'crescent' || currentShadow.type === 'lunar') &&
            !isMoonToSolar) {
            // Shadow is rendered in the already-rotated coordinate space
            this.renderer.renderMoonShadow(coreX, coreY, coreRadius, currentShadow, shapePoints, false, 0);
        }

        // For solar-hybrid, render lunar overlay on top of sun
        // Skip when transitioning FROM solar TO moon (let moon's shadow handle it)
        if (((isAtSolar && currentShadow.lunarOverlay) || isTransitioningToSolar || isTransitioningFromSolar) &&
            !isSolarToMoon) {
            // Use the lunar overlay from solar definition
            const lunarShadow = (isAtSolar && currentShadow.lunarOverlay) ? currentShadow.lunarOverlay : {
                type: 'lunar',
                coverage: 1.0,
                color: 'rgba(0, 0, 0, 1.0)',
                progression: 'center'
            };

            // Calculate shadow offset for Bailey's Beads
            let shadowOffsetX = 0;
            let shadowOffsetY = 0;
            let morphProgress = 0;

            if (this.renderer.shapeMorpher) {
                morphProgress = this.renderer.shapeMorpher.getProgress();

                const slideDistance = coreRadius * 2.5;

                if (isTransitioningToSolar && morphProgress < 1) {
                    // Shadow sliding in from bottom-left
                    shadowOffsetX = -slideDistance * (1 - morphProgress);
                    shadowOffsetY = slideDistance * (1 - morphProgress);
                } else if (isTransitioningFromSolar && morphProgress < 1) {
                    // Shadow sliding out to top-right
                    shadowOffsetX = slideDistance * morphProgress;
                    shadowOffsetY = -slideDistance * morphProgress;
                }
            }

            // Render the shadow
            this.renderer.renderMoonShadow(coreX, coreY, coreRadius, lunarShadow, shapePoints, true);

            // Render Bailey's Beads during transitions
            // Show beads when transitioning TO solar (which will have rays) or FROM solar (which had rays)
            // But only if we're actually rendering or about to render sun effects
            const willHaveSunEffects = isTransitioningToSolar || renderingSunEffects;

            if ((isTransitioningToSolar || isTransitioningFromSolar) && willHaveSunEffects) {
                this.renderer.renderBaileysBeads(coreX, coreY, coreRadius, shadowOffsetX, shadowOffsetY, morphProgress, isTransitioningToSolar, true);

                // Trigger chromatic aberration when shadow is near center
                const shadowNearCenter = Math.abs(shadowOffsetX) < 30 && Math.abs(shadowOffsetY) < 30;
                if (shadowNearCenter && this.renderer.specialEffects) {
                    // Stronger aberration as shadow gets closer to center
                    const distance = Math.sqrt(shadowOffsetX * shadowOffsetX + shadowOffsetY * shadowOffsetY);
                    const intensity = Math.max(0.1, 0.5 * (1 - distance / 30));
                    this.renderer.specialEffects.triggerChromaticAberration(intensity);
                }
            }
        }
    }

    /**
     * Reset alpha and restore context
     * @param {number} totalRotation - Total rotation value
     */
    cleanup(totalRotation) {
        // Reset alpha
        if (this.renderer.state.sleeping || this.renderer.state.emotion === 'resting') {
            this.renderer.ctx.globalAlpha = 1;
        }

        // Restore context if rotated
        if (totalRotation !== 0) {
            this.renderer.ctx.restore();
        }
    }

    /**
     * Render all core and shape effects
     * @param {Object} params - Rendering parameters
     */
    renderCoreAndShapes(params) {
        const { coreX, coreY, coreRadius, totalRotation, sleepOpacityMod, deltaTime } = params;

        // Apply sleep opacity
        this.applySleepOpacity(sleepOpacityMod);

        // Update shape morpher and get shape data
        const { shapePoints, currentShadow } = this.updateShapeMorpher(coreRadius);

        // Render sun effects
        const renderingSunEffects = this.renderSunEffects(coreX, coreY, coreRadius, currentShadow);

        // Render core
        this.renderCore(coreX, coreY, coreRadius, totalRotation, shapePoints);

        // Render sparkles
        this.renderSparkles(deltaTime);

        // Render shadow effects
        this.renderShadowEffects(coreX, coreY, coreRadius, currentShadow, shapePoints, renderingSunEffects);

        // Cleanup
        this.cleanup(totalRotation);
    }
}
