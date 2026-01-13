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
 *
 * @module ParticleConfigCalculator
 */
export class ParticleConfigCalculator {
    /**
     * Create ParticleConfigCalculator
     *
     * @param {Object} deps - Dependencies
     * @param {Object} deps.renderer - Renderer instance
     * @param {Object} deps.stateMachine - State machine instance
     * @param {Object} deps.canvasManager - Canvas manager instance
     * @param {Object} deps.config - Configuration object
     *
     * @example
     * // New DI style:
     * new ParticleConfigCalculator({ renderer, stateMachine, canvasManager, config })
     *
     * // Legacy style:
     * new ParticleConfigCalculator(mascot)
     */
    constructor(deps) {
        if (deps && deps.renderer && deps.stateMachine && deps.canvasManager && deps.config) {
            // New DI style
            this.renderer = deps.renderer;
            this.stateMachine = deps.stateMachine;
            this.canvasManager = deps.canvasManager;
            this.config = deps.config;
        } else {
            // Legacy: deps is mascot
            const mascot = deps;
            this.renderer = mascot.renderer;
            this.stateMachine = mascot.stateMachine;
            this.canvasManager = mascot.canvasManager;
            this.config = mascot.config;
            this._legacyMode = true;
        }
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
        const effectiveCenter = this.renderer.getEffectiveCenter();
        const orbX = effectiveCenter.x;
        let orbY = effectiveCenter.y - this.config.topOffset;

        // Get min/max from state machine
        const stateProps = this.stateMachine.getCurrentEmotionalProperties();

        // Apply vertical offset for certain emotions (like excited for exclamation mark)
        if (stateProps.verticalOffset) {
            orbY = effectiveCenter.y - this.config.topOffset +
                   (this.canvasManager.height * stateProps.verticalOffset);
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
        const stateProps = this.stateMachine.getCurrentEmotionalProperties();

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
        if (this.renderer.state && this.renderer.state.particleBehaviorOverride) {
            particleBehavior = this.renderer.state.particleBehaviorOverride;
        }

        if (this.renderer.state && this.renderer.state.particleRateMult) {
            particleRate = Math.floor(particleRate * this.renderer.state.particleRateMult);
            maxParticles = Math.floor(maxParticles * this.renderer.state.particleRateMult);
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
        const undertoneModifier = this.renderer.getUndertoneModifier ?
            this.renderer.getUndertoneModifier() : null;

        // Add zen vortex intensity to undertone modifier if in zen state
        if (renderState.emotion === 'zen' && this.renderer.state.zenVortexIntensity) {
            return {
                ...(undertoneModifier || {}),
                zenVortexIntensity: this.renderer.state.zenVortexIntensity
            };
        }

        return undertoneModifier;
    }
}
