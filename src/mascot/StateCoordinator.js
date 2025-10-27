/**
 * StateCoordinator - Manages emotion states and transitions
 * @module mascot/StateCoordinator
 * @complexity ⭐⭐⭐ Intermediate-Advanced
 * @audience Modify this when changing state validation or transition logic
 */

import { getEmotion, getEmotionVisualParams } from '../core/emotions/index.js';
import rhythmIntegration from '../core/rhythmIntegration.js';

export class StateCoordinator {
    constructor(mascot) {
        this.mascot = mascot;
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
     * @returns {Object} The mascot instance for chaining
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
        const success = this.mascot.stateMachine.setEmotion(mappedEmotion, undertone, duration);
        
        if (success) {
            // Register emotion's rhythm configuration
            const emotionConfig = getEmotion(mappedEmotion);
            if (emotionConfig) {
                rhythmIntegration.registerConfig('emotion', mappedEmotion, emotionConfig);
            }
            // Clear and reset particles when changing emotional states
            if (this.mascot.particleSystem) {
                // Clear all existing particles
                this.mascot.particleSystem.clear();
                
                // Get the new emotional properties
                const emotionalProps = this.mascot.stateMachine.getCurrentEmotionalProperties();
                
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
                    if (this.mascot.renderer && typeof this.mascot.renderer.getEffectiveCenter === 'function') {
                        const effectiveCenter = this.mascot.renderer.getEffectiveCenter();
                        centerX = effectiveCenter.x;
                        centerY = effectiveCenter.y;
                    } else {
                        // Fallback to canvas center if renderer not available
                        centerX = this.mascot.canvasManager.width / 2;
                        centerY = this.mascot.canvasManager.height / 2;
                    }

                    this.mascot.particleSystem.burst(
                        initialCount,
                        emotionalProps.particleBehavior,
                        centerX,
                        centerY
                    );
                }
            }
            
            // Update sound system ambient tone - DISABLED (annoying)
            // if (this.mascot.soundSystem.isAvailable()) {
            //     this.mascot.soundSystem.setAmbientTone(mappedEmotion, duration);
            // }
            
            // Update Emotive renderer if in classic mode
            if (this.mascot.config.renderingStyle === 'classic' && this.mascot.renderer.setEmotionalState) {
                const emotionParams = getEmotionVisualParams(mappedEmotion);
                this.mascot.renderer.setEmotionalState(mappedEmotion, emotionParams, undertone);
            }
            
            // Emit emotion change event
            this.mascot.emit('emotionChanged', { emotion: mappedEmotion, undertone, duration });
            
        }
        
        this.currentEmotion = mappedEmotion;
        return this.mascot;
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