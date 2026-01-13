/**
 * ParticleConfigCalculator
 *
 * Calculates particle system configuration for current frame.
 * Handles:
 * - Orb position calculation with offsets
 * - Particle behavior selection based on emotion
 * - Particle rate and count limits
 * - Undertone modifier overrides
 * - Special emotion behaviors (zen mixing)
 */
export class ParticleConfigCalculator {
    constructor(mascot) {
        this.mascot = mascot;
    }

    /**
     * Calculate particle configuration for current render
     * @param {Object} renderState - Current render state
     * @param {Object} emotionParams - Emotion visual parameters
     * @returns {Object} Particle configuration with position, behavior, rates, and modifiers
     */
    calculateParticleConfig(renderState, emotionParams) {
        const { orbX, orbY } = this.calculateOrbPosition(renderState);
        const { particleBehavior, particleRate, minParticles, maxParticles } =
            this.calculateParticleBehavior(renderState, emotionParams);

        return {
            orbX, orbY, particleBehavior, particleRate,
            minParticles, maxParticles,
            emotionParams
        };
    }

    /**
     * Calculate orb position with offsets
     * @param {Object} renderState - Current render state
     * @returns {Object} Orb position with x and y coordinates
     */
    calculateOrbPosition(_renderState) {
        // Always use effective center for particle spawning (with position offsets applied)
        const effectiveCenter = this.mascot.renderer.getEffectiveCenter();
        const orbX = effectiveCenter.x;
        let orbY = effectiveCenter.y - this.mascot.config.topOffset;

        // Get min/max from state machine
        const stateProps = this.mascot.stateMachine.getCurrentEmotionalProperties();

        // Apply vertical offset for certain emotions (like excited for exclamation mark)
        if (stateProps.verticalOffset) {
            orbY = effectiveCenter.y - this.mascot.config.topOffset +
                   (this.mascot.canvasManager.height * stateProps.verticalOffset);
        }

        return { orbX, orbY };
    }

    /**
     * Calculate particle behavior configuration
     * @param {Object} renderState - Current render state
     * @param {Object} emotionParams - Emotion visual parameters
     * @returns {Object} Particle behavior configuration
     */
    calculateParticleBehavior(renderState, emotionParams) {
        // Apply undertone modifiers to particle behavior
        let particleBehavior = emotionParams.particleBehavior || 'ambient';
        let particleRate = emotionParams.particleRate || 15;

        // Get state properties
        const stateProps = this.mascot.stateMachine.getCurrentEmotionalProperties();

        // Use emotionParams min/max if available, otherwise fall back to stateProps
        const minParticles = emotionParams.minParticles !== undefined ?
            emotionParams.minParticles : (stateProps.minParticles || 0);
        let maxParticles = emotionParams.maxParticles !== undefined ?
            emotionParams.maxParticles : (stateProps.maxParticles || 10);

        // Special case for zen: mix falling and orbiting behaviors
        if (renderState.emotion === 'zen') {
            particleBehavior = this.selectZenBehavior();
        }

        // Apply renderer undertone overrides
        ({ particleBehavior, particleRate, maxParticles } =
            this.applyRendererOverrides(particleBehavior, particleRate, maxParticles));

        return { particleBehavior, particleRate, minParticles, maxParticles };
    }

    /**
     * Select random behavior for zen emotion
     * @returns {string} Particle behavior ('falling' or 'orbiting')
     */
    selectZenBehavior() {
        // Randomly choose between falling (sad) and orbiting (love) for each spawn
        return Math.random() < 0.6 ? 'falling' : 'orbiting';
    }

    /**
     * Apply renderer state overrides to particle configuration
     * @param {string} particleBehavior - Base particle behavior
     * @param {number} particleRate - Base particle rate
     * @param {number} maxParticles - Base max particles
     * @returns {Object} Overridden particle configuration
     */
    applyRendererOverrides(particleBehavior, particleRate, maxParticles) {
        // Check if renderer has undertone overrides
        if (this.mascot.renderer.state && this.mascot.renderer.state.particleBehaviorOverride) {
            particleBehavior = this.mascot.renderer.state.particleBehaviorOverride;
        }

        if (this.mascot.renderer.state && this.mascot.renderer.state.particleRateMult) {
            particleRate = Math.floor(particleRate * this.mascot.renderer.state.particleRateMult);
            maxParticles = Math.floor(maxParticles * this.mascot.renderer.state.particleRateMult);
        }

        return { particleBehavior, particleRate, maxParticles };
    }

    /**
     * Get particle modifier for update
     * @param {Object} renderState - Current render state
     * @returns {Object|null} Particle modifier with undertone and zen vortex data
     */
    getParticleModifier(renderState) {
        // Get undertone modifier from renderer if present
        const undertoneModifier = this.mascot.renderer.getUndertoneModifier ?
            this.mascot.renderer.getUndertoneModifier() : null;

        // Add zen vortex intensity to undertone modifier if in zen state
        if (renderState.emotion === 'zen' && this.mascot.renderer.state.zenVortexIntensity) {
            return {
                ...(undertoneModifier || {}),
                zenVortexIntensity: this.mascot.renderer.state.zenVortexIntensity
            };
        }

        return undertoneModifier;
    }
}
