/**
 * AmbientDanceAnimator - Connects ambient dance gestures to the renderer
 * Bridges the GestureBlender output with the actual rendering system
 */

class AmbientDanceAnimator {
    constructor(renderer) {
        this.renderer = renderer;

        // Animation states for ambient gestures
        this.animations = {
            grooveSway: null,
            grooveBob: null,
            grooveFlow: null,
            groovePulse: null,
            grooveStep: null
        };

        // Current active animation
        this.activeAnimation = null;

        // Blend state from GestureBlender
        this.blendState = {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            opacity: 1
        };
    }

    /**
     * Start an ambient dance animation
     * @param {string} animationName - Name of the ambient gesture
     * @param {Object} options - Animation options
     */
    startAmbientAnimation(animationName, options = {}) {
        // Stop previous animation
        if (this.activeAnimation && this.activeAnimation !== animationName) {
            this.stopAmbientAnimation(this.activeAnimation);
        }

        this.activeAnimation = animationName;
        this.animations[animationName] = {
            startTime: Date.now(),
            intensity: options.intensity || 1.0,
            frequency: options.frequency || 1.0,
            options
        };
    }

    /**
     * Stop an ambient animation
     */
    stopAmbientAnimation(animationName) {
        if (this.animations[animationName]) {
            this.animations[animationName] = null;
        }
        if (this.activeAnimation === animationName) {
            this.activeAnimation = null;
        }
    }

    /**
     * Update blend state from GestureBlender
     */
    updateBlendState(blendState) {
        if (!blendState) return;

        // Smooth interpolation
        const lerpFactor = 0.2;
        this.blendState.x = this.lerp(this.blendState.x, blendState.x || 0, lerpFactor);
        this.blendState.y = this.lerp(this.blendState.y, blendState.y || 0, lerpFactor);
        this.blendState.rotation = this.lerp(this.blendState.rotation, blendState.rotation || 0, lerpFactor);
        this.blendState.scale = this.lerp(this.blendState.scale, blendState.scale || 1, lerpFactor);
        this.blendState.opacity = this.lerp(this.blendState.opacity, blendState.opacity || 1, lerpFactor);
    }

    /**
     * Get current animation transform
     */
    getTransform(deltaTime) {
        const transform = {
            x: this.blendState.x,
            y: this.blendState.y,
            rotation: this.blendState.rotation,
            scale: this.blendState.scale,
            opacity: this.blendState.opacity
        };

        // Apply active animation on top
        if (this.activeAnimation) {
            const animation = this.animations[this.activeAnimation];
            if (animation) {
                const elapsed = Date.now() - animation.startTime;

                switch (this.activeAnimation) {
                case 'grooveSway':
                    transform.x += Math.sin(elapsed / 500 * animation.frequency) * 15 * animation.intensity;
                    transform.rotation += Math.sin(elapsed / 500 * animation.frequency + Math.PI/4) * 5 * animation.intensity;
                    break;

                case 'grooveBob':
                    transform.y += Math.sin(elapsed / 400 * animation.frequency) * 10 * animation.intensity;
                    transform.scale *= 1 + Math.sin(elapsed / 400 * animation.frequency) * 0.03 * animation.intensity;
                    break;

                case 'grooveFlow': {
                    const t = elapsed / 1000 * animation.frequency;
                    transform.x += Math.sin(t) * Math.cos(t * 2) * 20 * animation.intensity;
                    transform.y += Math.cos(t) * Math.sin(t * 2) * 10 * animation.intensity;
                    transform.rotation += Math.sin(t * 2) * 8 * animation.intensity;
                    break;
                }

                case 'groovePulse': {
                    transform.scale *= 1 + Math.sin(elapsed / 250 * animation.frequency) * 0.05 * animation.intensity;
                    transform.opacity *= 0.9 + Math.sin(elapsed / 250 * animation.frequency) * 0.1 * animation.intensity;
                    break;
                }

                case 'grooveStep': {
                    const stepPhase = Math.floor(elapsed / 500 * animation.frequency) % 4;
                    const stepProgress = (elapsed / 500 * animation.frequency) % 1;
                    const smoothStep = this.smoothStep(stepProgress);

                    if (stepPhase === 0) transform.x += smoothStep * 25 * animation.intensity;
                    else if (stepPhase === 2) transform.x -= smoothStep * 25 * animation.intensity;

                    transform.y += Math.abs(Math.sin(elapsed / 250 * animation.frequency)) * 5 * animation.intensity;
                    break;
                }
            }
        }
        }

        return transform;
    }

    /**
     * Linear interpolation
     */
    lerp(a, b, t) {
        return a + (b - a) * t;
    }

    /**
     * Smooth step function
     */
    smoothStep(t) {
        return t * t * (3 - 2 * t);
    }
}

// Export for ES6 modules
export { AmbientDanceAnimator };

// Also export as default
export default AmbientDanceAnimator;