/**
 * RadiusCalculator
 *
 * Calculates core and glow radii with all modifiers applied.
 * Handles:
 * - Sleep state modifications (opacity, scale)
 * - Breathing factors (core and glow)
 * - Nervous glow pulse
 * - Core/glow radius calculations with all multipliers
 */
import { getEffect, isEffectActive } from '../effects/index.js';

export class RadiusCalculator {
    constructor(renderer) {
        this.renderer = renderer;
    }

    /**
     * Calculate sleep state modifiers
     * @returns {Object} Sleep opacity and scale modifiers
     */
    calculateSleepModifiers() {
        let sleepOpacityMod = 1;
        let sleepScaleMod = 1;
        let glowOpacityMod = 1;

        if (this.renderer.state.sleeping || this.renderer.state.emotion === 'resting' || isEffectActive('sleeping', this.renderer.state)) {
            const sleepEffect = getEffect('sleeping');
            if (sleepEffect) {
                const dimming = sleepEffect.getDimmingValues();
                // Use effect's dimming values
                sleepOpacityMod = this.renderer.state.sleepDimness !== undefined ? this.renderer.state.sleepDimness : dimming.orbDimming;
                glowOpacityMod = dimming.glowDimming; // Dim glow even more
                sleepScaleMod = this.renderer.state.sleepScale !== undefined ? this.renderer.state.sleepScale : 0.9;
            } else {
                // Fallback values
                sleepOpacityMod = this.renderer.state.sleepDimness !== undefined ? this.renderer.state.sleepDimness : 0.3;
                glowOpacityMod = 0.2;
                sleepScaleMod = this.renderer.state.sleepScale !== undefined ? this.renderer.state.sleepScale : 0.9;
            }
            this.renderer.state.breathRate = 0.5;  // Slower breathing
            this.renderer.state.breathDepth = 0.15; // Deeper breaths
        }

        return { sleepOpacityMod, sleepScaleMod, glowOpacityMod };
    }

    /**
     * Calculate breathing factors for core and glow
     * @returns {Object} Breathing factors
     */
    calculateBreathingFactors() {
        let coreBreathFactor, glowBreathFactor;

        if (this.renderer.state.customScale !== null) {
            // Use custom scale directly for breathing exercises
            coreBreathFactor = this.renderer.state.customScale;
            glowBreathFactor = 1 + (this.renderer.state.customScale - 1) * 0.5; // Glow follows at half intensity
        } else {
            // Normal breathing behavior
            // Get breathing scale from BreathingAnimator
            const breathingScale = this.renderer.breathingAnimator.getBreathingScale();
            coreBreathFactor = breathingScale;
            glowBreathFactor = 1 - (breathingScale - 1) * 0.5; // Glow breathes opposite, less pronounced
        }

        // Add nervous glow pulse if needed
        if (this.renderer.state.undertone === 'nervous' && this.renderer.undertoneModifiers.nervous.glowPulse) {
            const nervousPulse = Math.sin(Date.now() / 200) * this.renderer.undertoneModifiers.nervous.glowPulse; // Fast subtle pulse
            glowBreathFactor *= (1 + nervousPulse);
        }

        return { coreBreathFactor, glowBreathFactor };
    }

    /**
     * Calculate core and glow radii with all modifiers
     * @param {Object} state - Current emotional state
     * @param {number} scaleMultiplier - Scale multiplier from gestures
     * @param {number} glowMultiplier - Glow multiplier from gestures
     * @returns {Object} Core radius, glow radius, effective glow intensity, and opacity modifiers
     */
    calculateRadii(state, scaleMultiplier, glowMultiplier) {
        // Get sleep modifiers
        const { sleepOpacityMod, sleepScaleMod, glowOpacityMod } = this.calculateSleepModifiers();

        // Get breathing factors
        const { coreBreathFactor, glowBreathFactor } = this.calculateBreathingFactors();

        // Calculate core dimensions - using unified scale factor
        const baseRadius = (this.renderer.config.referenceSize / this.renderer.config.coreSizeDivisor) * this.renderer.scaleFactor;

        // Apply emotion core size from state properties
        const emotionSizeMult = (state.properties && state.properties.coreSize) ? state.properties.coreSize : 1.0;

        // Apply undertone size multiplier
        const undertoneSizeMult = this.renderer.state.sizeMultiplier || 1.0;

        const coreRadius = baseRadius * emotionSizeMult * coreBreathFactor * scaleMultiplier * sleepScaleMod * undertoneSizeMult;
        const glowRadius = baseRadius * this.renderer.config.glowMultiplier * glowBreathFactor * this.renderer.state.glowIntensity * scaleMultiplier * sleepScaleMod * undertoneSizeMult * glowMultiplier;  // Apply gesture glow multiplier

        // Use state glow intensity directly multiplied by gesture glow
        const effectiveGlowIntensity = this.renderer.state.glowIntensity * glowMultiplier;

        return {
            coreRadius,
            glowRadius,
            effectiveGlowIntensity,
            sleepOpacityMod,
            glowOpacityMod
        };
    }
}
