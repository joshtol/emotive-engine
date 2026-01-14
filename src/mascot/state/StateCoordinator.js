/**
 * StateCoordinator - Manages emotion states and transitions
 * @module mascot/StateCoordinator
 * @complexity ⭐⭐⭐ Intermediate-Advanced
 * @audience Modify this when changing state validation or transition logic
 */

import { getEmotion, getEmotionVisualParams } from '../../core/emotions/index.js';
import rhythmIntegration from '../../core/audio/rhythmIntegration.js';

export class StateCoordinator {
    /**
     * Create StateCoordinator
     *
     * @param {Object} deps - Dependencies
     * @param {Object} deps.stateMachine - State machine instance
     * @param {Object} [deps.particleSystem] - Particle system instance
     * @param {Object} [deps.canvasManager] - Canvas manager instance
     * @param {Object} [deps.renderer] - Renderer instance
     * @param {Object} deps.config - Configuration object
     * @param {Object} [deps.soundSystem] - Sound system instance
     * @param {Function} deps.emit - Event emission function
     * @param {Object} [deps.chainTarget] - Return value for method chaining
     */
    constructor(deps) {
        this.stateMachine = deps.stateMachine;
        this.particleSystem = deps.particleSystem || null;
        this.canvasManager = deps.canvasManager || null;
        this.renderer = deps.renderer || null;
        this.config = deps.config;
        this.soundSystem = deps.soundSystem || null;
        this._emit = deps.emit;
        this._chainTarget = deps.chainTarget || this;
        this.currentEmotion = 'neutral';
        this.emotionIntensity = 1.0;
    }

    /**
     * Initialize state coordinator
     */
    init() {
        // Will contain initialization logic
    }

    /**
     * Sets the emotional state with optional undertone
     * @param {string} emotion - The emotion to set
     * @param {Object|string|null} options - Options object or undertone string for backward compatibility
     * @returns {Object} Chain target for method chaining
     */
    setEmotion(emotion, options = null) {
        // Map common aliases to actual emotion states
        const emotionMapping = {
            'happy': 'joy',
            'curious': 'surprise',
            'frustrated': 'anger',
            'sad': 'sadness'
        };

        // Use mapped emotion or original if not an alias
        const mappedEmotion = emotionMapping[emotion] || emotion;

        // Handle backward compatibility - if options is a string, treat as undertone
        let undertone = null;
        let duration = 500;

        if (typeof options === 'string') {
            undertone = options;
        } else if (options && typeof options === 'object') {
            undertone = options.undertone || null;
            duration = options.duration || 500;
        }

        // Set emotional state in state machine
        const success = this.stateMachine.setEmotion(mappedEmotion, undertone, duration);

        if (success) {
            // Register emotion's rhythm configuration
            const emotionConfig = getEmotion(mappedEmotion);
            if (emotionConfig) {
                rhythmIntegration.registerConfig('emotion', mappedEmotion, emotionConfig);
            }
            // Clear and reset particles when changing emotional states
            if (this.particleSystem) {
                // Clear all existing particles
                this.particleSystem.clear();

                // Get the new emotional properties
                const emotionalProps = this.stateMachine.getCurrentEmotionalProperties();

                // Spawn initial particles for the new state
                // Use burst to immediately populate with a few particles
                // DECIMATED neutral
                let initialCount;
                if (mappedEmotion === 'neutral') {
                    initialCount = 1;  // DECIMATED to 1 particle
                } else if (mappedEmotion === 'resting') {
                    initialCount = 4;  // Keep resting at 4
                } else {
                    initialCount = Math.min(3, Math.floor(emotionalProps.particleRate / 4));
                }

                if (initialCount > 0) {
                    // Use effective center (includes position offsets) instead of raw canvas center
                    let centerX, centerY;
                    if (this.renderer && typeof this.renderer.getEffectiveCenter === 'function') {
                        const effectiveCenter = this.renderer.getEffectiveCenter();
                        centerX = effectiveCenter.x;
                        centerY = effectiveCenter.y;
                    } else {
                        // Fallback to canvas center if renderer not available
                        centerX = this.canvasManager.width / 2;
                        centerY = this.canvasManager.height / 2;
                    }

                    this.particleSystem.burst(
                        initialCount,
                        emotionalProps.particleBehavior,
                        centerX,
                        centerY
                    );
                }
            }

            // Update sound system ambient tone - DISABLED (annoying)
            // if (this.soundSystem.isAvailable()) {
            //     this.soundSystem.setAmbientTone(mappedEmotion, duration);
            // }

            // Update Emotive renderer if in classic mode
            if (this.config.renderingStyle === 'classic' && this.renderer.setEmotionalState) {
                const emotionParams = getEmotionVisualParams(mappedEmotion);
                this.renderer.setEmotionalState(mappedEmotion, emotionParams, undertone);
            }

            // Emit emotion change event
            this._emit('emotionChanged', { emotion: mappedEmotion, undertone, duration });

        }

        this.currentEmotion = mappedEmotion;
        return this._chainTarget;
    }

    /**
     * Methods to be moved here:
     * - getEmotion()
     * - setUndertoneModifier()
     * - transitionToEmotion() (new smooth transition)
     * - setEmotionVector() (new 2D control)
     * - Emotion blending logic
     */

    /**
     * Cleanup
     */
    destroy() {
        this.currentEmotion = 'neutral';
    }
}