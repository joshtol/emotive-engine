/**
 * ComplexAnimationAnimator - Handles complex animation gestures
 * @module core/renderer/ComplexAnimationAnimator
 *
 * Extracted from GestureAnimator as part of god object refactoring.
 * Handles complex animation gestures: flashWave, rain, groove, headBob, runningMan, charleston
 */

export class ComplexAnimationAnimator {
    constructor(renderer) {
        this.renderer = renderer;
        this.scaleFactor = renderer.scaleFactor || 1;
    }

    /**
     * Apply flashWave animation - wave-like flash that emanates outward
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with glow and flashWave data
     */
    applyFlashWave(anim, progress) {
        // Wave-like flash that emanates outward
        // Store wave state in the animation object
        if (!anim.flashWave) {
            anim.flashWave = {
                innerRadius: 0,
                outerRadius: 0,
                maxRadius: 3.0 // How far the wave travels (relative to core)
            };
        }

        // Update wave radius based on progress
        anim.flashWave.outerRadius = progress * anim.flashWave.maxRadius;
        anim.flashWave.innerRadius = Math.max(0, (progress - 0.1) * anim.flashWave.maxRadius);

        // Fade intensity as wave travels outward
        const waveIntensity = Math.max(0, 1 - progress * 0.7);

        // Store wave data for renderer to use
        anim.flashWaveData = {
            innerRadius: anim.flashWave.innerRadius,
            outerRadius: anim.flashWave.outerRadius,
            intensity: waveIntensity
        };

        // Return a very subtle glow increase at the core
        return {
            glow: 1 + waveIntensity * 0.3, // Very subtle core glow
            flashWave: anim.flashWaveData // Pass wave data to renderer
        };
    }

    /**
     * Apply rain animation - falling particle behavior with gentle drift
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with offsetX, offsetY, and particleEffect
     */
    applyRain(anim, progress) {
        // Rain effect - triggers falling particle behavior
        // The actual particle motion is handled by the particle system
        // This just adds a subtle downward drift to the core

        const rainIntensity = anim.params?.intensity || 1.0;

        // Gentle downward drift
        const driftY = progress * 10 * this.scaleFactor * rainIntensity;

        // Slight sway as if affected by wind
        const swayX = Math.sin(progress * Math.PI * 4) * 5 * this.scaleFactor;

        // Trigger particle falling effect through the renderer
        if (this.renderer && this.renderer.particleSystem) {
            // Enable falling behavior for particles during rain
            this.renderer.particleSystem.setGestureBehavior('falling', progress > 0 && progress < 1);
        }

        return {
            offsetX: swayX,
            offsetY: driftY,
            particleEffect: 'falling'  // Signal to particle system
        };
    }

    /**
     * Apply groove animation - smooth, flowing dance movement
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with offsetX, offsetY, scale, rotation
     */
    applyGroove(anim, progress) {
        // Groove motion - smooth, flowing dance movement
        const amplitude = (anim.params?.amplitude || 25) * this.scaleFactor;

        // Smoother wave pattern with organic flow
        const wave1 = Math.sin(progress * Math.PI * 2) * amplitude;
        const wave2 = Math.sin(progress * Math.PI * 3 + 0.5) * amplitude * 0.4;
        const grooveX = wave1 + wave2;

        // Gentle vertical bob with offset timing
        const grooveY = Math.sin(progress * Math.PI * 4 + 0.3) * amplitude * 0.25;

        // Subtle pulse that breathes naturally
        const scale = 1 + Math.sin(progress * Math.PI * 3 + 0.7) * 0.03;

        // Slight rotation for more natural movement
        const rotation = Math.sin(progress * Math.PI * 2 + 0.2) * 8;

        return {
            offsetX: grooveX,
            offsetY: grooveY,
            scale,
            rotation
        };
    }

    /**
     * Apply headBob animation - rhythmic vertical movement with sharp down and smooth up
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with offsetY and rotation
     */
    applyHeadBob(anim, progress) {
        // Head bob motion - rhythmic vertical movement
        const amplitude = (anim.params?.amplitude || 20) * this.scaleFactor;
        const frequency = anim.params?.frequency || 2;

        // Vertical bob with sharp down, smooth up
        const bobPhase = (progress * frequency) % 1;
        let bobY;
        if (bobPhase < 0.3) {
            // Quick down
            bobY = -amplitude * (bobPhase / 0.3);
        } else {
            // Smooth up
            bobY = -amplitude * (1 - (bobPhase - 0.3) / 0.7);
        }

        // Slight forward tilt on the down beat
        const rotation = bobPhase < 0.3 ? -3 : 0;

        return {
            offsetY: bobY,
            rotation
        };
    }

    /**
     * Apply runningMan animation - simple running shuffle with quick slide and step
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with offsetX, offsetY, rotation, scaleY
     */
    applyRunningMan(anim, progress) {
        // Simple running shuffle - quick slide and step
        const slide = Math.sin(progress * Math.PI * 4) * 20 * this.scaleFactor;
        const step = -Math.abs(Math.sin(progress * Math.PI * 8)) * 10 * this.scaleFactor;

        return {
            offsetX: slide,
            offsetY: step,
            rotation: slide * 0.3,
            scaleY: 1 - Math.abs(Math.sin(progress * Math.PI * 8)) * 0.05
        };
    }

    /**
     * Apply charleston animation - crisscross kicks with hop
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with offsetX, offsetY, rotation, scaleY
     */
    applyCharleston(anim, progress) {
        // Charleston - crisscross kicks
        const kick = Math.sin(progress * Math.PI * 8) * 25 * this.scaleFactor;
        const hop = -Math.abs(Math.sin(progress * Math.PI * 8)) * 10 * this.scaleFactor;

        return {
            offsetX: kick,
            offsetY: hop,
            rotation: kick * 0.6,
            scaleY: 1 - Math.abs(Math.sin(progress * Math.PI * 8)) * 0.06
        };
    }
}

export default ComplexAnimationAnimator;
