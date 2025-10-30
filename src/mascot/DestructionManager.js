/**
 * DestructionManager
 *
 * Manages cleanup and destruction of all mascot subsystems.
 * Handles:
 * - Animation stopping
 * - Speech cleanup
 * - Controller destruction
 * - Subsystem cleanup (sound, audio, particles, renderer)
 * - Event listener removal
 * - Plugin cleanup
 * - Error boundary clearing
 */
export class DestructionManager {
    constructor(mascot) {
        this.mascot = mascot;
    }

    /**
     * Destroy all mascot resources
     */
    destroy() {
        this.mascot.errorBoundary.wrap(() => {
            this.stopAnimations();
            this.destroyControllers();
            this.cleanupSubsystems();
            this.cleanupEvents();
            this.cleanupPluginsAndExtensions();
            this.clearErrorBoundary();
        }, 'destruction')();
    }

    /**
     * Stop animations and speech
     */
    stopAnimations() {
        // Stop animation
        this.mascot.stop();

        // Stop speech reactivity
        if (this.mascot.speaking) {
            this.mascot.stopSpeaking();
        }
    }

    /**
     * Destroy controllers
     */
    destroyControllers() {
        // Destroy animation controller
        if (this.mascot.animationController) {
            this.mascot.animationController.destroy();
        }

        // Destroy position controller
        if (this.mascot.positionController) {
            this.mascot.positionController.destroy();
        }
    }

    /**
     * Clean up core subsystems
     */
    cleanupSubsystems() {
        this.cleanupSound();
        this.cleanupAudio();
        this.cleanupParticles();
        this.cleanupRenderer();
        this.cleanupCanvas();
    }

    /**
     * Clean up sound system
     */
    cleanupSound() {
        if (this.mascot.soundSystem) {
            this.mascot.soundSystem.cleanup();
        }
    }

    /**
     * Clean up audio processing
     */
    cleanupAudio() {
        if (this.mascot.audioLevelProcessor) {
            this.mascot.audioLevelProcessor.cleanup();
        }
    }

    /**
     * Clean up particle system
     */
    cleanupParticles() {
        if (this.mascot.particleSystem) {
            this.mascot.particleSystem.destroy();
        }
    }

    /**
     * Clean up renderer
     */
    cleanupRenderer() {
        if (this.mascot.renderer) {
            // Stop all active gestures
            this.mascot.renderer.stopAllGestures();
            this.mascot.renderer.destroy();
        }
    }

    /**
     * Clean up canvas manager
     */
    cleanupCanvas() {
        if (this.mascot.canvasManager) {
            this.mascot.canvasManager.destroy();
        }
    }

    /**
     * Clean up event listeners
     */
    cleanupEvents() {
        // Clear event listeners
        if (this.mascot.eventManager) {
            this.mascot.eventManager.destroy();
        }

        // Clean up LLM handler
        if (this.mascot.llmHandler) {
            this.mascot.llmHandler = null;
        }
    }

    /**
     * Clean up plugins and extensions
     */
    cleanupPluginsAndExtensions() {
        this.cleanupAccessibility();
        this.cleanupMobile();
        this.cleanupPlugins();
        this.cleanupAudioExtensions();
    }

    /**
     * Clean up accessibility manager
     */
    cleanupAccessibility() {
        if (this.mascot.accessibilityManager) {
            this.mascot.accessibilityManager.destroy();
        }
    }

    /**
     * Clean up mobile optimization
     */
    cleanupMobile() {
        if (this.mascot.mobileOptimization) {
            this.mascot.mobileOptimization.destroy();
        }
    }

    /**
     * Clean up plugin system
     */
    cleanupPlugins() {
        if (this.mascot.pluginSystem) {
            this.mascot.pluginSystem.destroy();
        }
    }

    /**
     * Clean up audio extensions (analyzer and shape morpher)
     */
    cleanupAudioExtensions() {
        // Clean up shape morpher and audio analyzer
        if (this.mascot.audioAnalyzer) {
            this.mascot.disconnectAudio();
            this.mascot.audioAnalyzer.destroy();
        }

        if (this.mascot.shapeMorpher) {
            this.mascot.shapeMorpher.reset();
        }
    }

    /**
     * Clear error boundary
     */
    clearErrorBoundary() {
        // Clear error boundary
        this.mascot.errorBoundary.clearErrors();
    }
}
