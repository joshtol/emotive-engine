/**
 * EffectsRenderManager
 *
 * Manages rendering of visual effects.
 * Handles:
 * - Glow rendering (recording, zen-vortex, normal, sleep-dimmed)
 * - Flash wave effect rendering
 * - Speaking pulse effect rendering
 */
import { isEffectActive, applyEffect } from '../effects/index.js';
import { gradientCache } from './GradientCache.js';

export class EffectsRenderManager {
    constructor(renderer) {
        this.renderer = renderer;
    }

    /**
     * Render glow with appropriate visual effects
     * @param {number} coreX - Core X position
     * @param {number} coreY - Core Y position
     * @param {number} glowRadius - Glow radius
     * @param {number} effectiveGlowIntensity - Effective glow intensity
     * @param {number} glowOpacityMod - Glow opacity modifier
     * @param {number} deltaTime - Time elapsed since last frame
     */
    renderGlow(coreX, coreY, glowRadius, effectiveGlowIntensity, glowOpacityMod, deltaTime) {
        // Render glow with visual effects
        if (isEffectActive('recording-glow', this.renderer.state)) {
            // Recording takes precedence over normal glow
            applyEffect('recording-glow', this.renderer.ctx, {
                x: coreX,
                y: coreY,
                radius: glowRadius,
                deltaTime
            });
        } else if (isEffectActive('zen-vortex', this.renderer.state)) {
            // Zen vortex handles its own visuals
            // Skip normal glow to prevent flash
        } else {
            // Normal glow with sleep dimming
            if (this.renderer.state.sleeping || this.renderer.state.emotion === 'resting' || isEffectActive('sleeping', this.renderer.state)) {
                this.renderer.ctx.save();
                this.renderer.ctx.globalAlpha = glowOpacityMod;
                this.renderer.glowRenderer.renderGlow(coreX, coreY, glowRadius, { intensity: effectiveGlowIntensity });
                this.renderer.ctx.restore();
            } else {
                this.renderer.glowRenderer.renderGlow(coreX, coreY, glowRadius, { intensity: effectiveGlowIntensity });
            }
        }
    }

    /**
     * Render flash wave effect if present
     * @param {Object} gestureTransforms - Gesture transforms object
     * @param {number} coreX - Core X position
     * @param {number} coreY - Core Y position
     * @param {number} coreRadius - Core radius
     */
    renderFlashWave(gestureTransforms, coreX, coreY, coreRadius) {
        // Render flash wave if present
        if (gestureTransforms && gestureTransforms.flashWave) {
            const wave = gestureTransforms.flashWave;
            const {ctx} = this.renderer;

            ctx.save();
            ctx.globalCompositeOperation = 'lighter';

            // Create a ring gradient for the wave
            const innerR = coreRadius * wave.innerRadius;
            const outerR = coreRadius * wave.outerRadius;

            if (outerR > innerR) {
                // Use cached gradient for flash wave
                const gradient = gradientCache.getRadialGradient(
                    ctx, coreX, coreY, innerR, coreX, coreY, outerR,
                    [
                        { offset: 0, color: 'rgba(255, 255, 255, 0)' },
                        { offset: 0.2, color: `rgba(255, 255, 255, ${wave.intensity * 0.15})` },
                        { offset: 0.5, color: `rgba(255, 255, 255, ${wave.intensity * 0.25})` }, // Peak in center
                        { offset: 0.8, color: `rgba(255, 255, 255, ${wave.intensity * 0.15})` },
                        { offset: 1, color: 'rgba(255, 255, 255, 0)' }
                    ]
                );

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(coreX, coreY, outerR, 0, Math.PI * 2);
                ctx.arc(coreX, coreY, Math.max(0, innerR), 0, Math.PI * 2, true);
                ctx.fill();
            }

            ctx.restore();
        }
    }

    /**
     * Render speaking pulse effect if active
     * @param {number} coreX - Core X position
     * @param {number} coreY - Core Y position
     * @param {number} coreRadius - Core radius
     * @param {number} deltaTime - Time elapsed since last frame
     */
    renderSpeakingPulse(coreX, coreY, coreRadius, deltaTime) {
        // Apply speaking pulse effect
        if (isEffectActive('speaking-pulse', this.renderer.state)) {
            applyEffect('speaking-pulse', this.renderer.ctx, {
                x: coreX,
                y: coreY,
                radius: coreRadius,
                audioLevel: this.renderer.state.audioLevel || 0,
                deltaTime
            });
        }
    }

    /**
     * Render all effects
     * @param {Object} params - Rendering parameters
     */
    renderAllEffects(params) {
        const { coreX, coreY, glowRadius, effectiveGlowIntensity, glowOpacityMod,
            gestureTransforms, coreRadius, deltaTime } = params;

        this.renderGlow(coreX, coreY, glowRadius, effectiveGlowIntensity, glowOpacityMod, deltaTime);
        this.renderFlashWave(gestureTransforms, coreX, coreY, coreRadius);
        this.renderSpeakingPulse(coreX, coreY, coreRadius, deltaTime);
    }
}
