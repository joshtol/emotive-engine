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
    /**
     * Create DestructionManager
     *
     * @param {Object} deps - Dependencies
     * @param {Object} deps.errorBoundary - Error handling wrapper
     * @param {Object} deps.animationController - Animation controller instance
     * @param {Object} [deps.positionController] - Position controller instance
     * @param {Object} [deps.soundSystem] - Sound system instance
     * @param {Object} [deps.audioLevelProcessor] - Audio level processor instance
     * @param {Object} [deps.particleSystem] - Particle system instance
     * @param {Object} [deps.renderer] - Renderer instance
     * @param {Object} [deps.canvasManager] - Canvas manager instance
     * @param {Object} [deps.eventManager] - Event manager instance
     * @param {Object} [deps.accessibilityManager] - Accessibility manager instance
     * @param {Object} [deps.mobileOptimization] - Mobile optimization instance
     * @param {Object} [deps.pluginSystem] - Plugin system instance
     * @param {Object} [deps.audioAnalyzer] - Audio analyzer instance
     * @param {Object} [deps.shapeMorpher] - Shape morpher instance
     * @param {Object} deps.state - Shared state with speaking, llmHandler properties
     * @param {Function} deps.stop - Function to stop animation
     * @param {Function} deps.stopSpeaking - Function to stop speaking
     * @param {Function} deps.disconnectAudio - Function to disconnect audio
     *
     * @example
     * // New DI style:
     * new DestructionManager({ errorBoundary, animationController, positionController, ... })
     *
     * // Legacy style:
     * new DestructionManager(mascot)
     */
    constructor(deps) {
        // Check for explicit DI style (has _diStyle marker property)
        if (deps && deps._diStyle === true) {
            // New DI style
            this.errorBoundary = deps.errorBoundary;
            this.animationController = deps.animationController;
            this.positionController = deps.positionController || null;
            this.soundSystem = deps.soundSystem || null;
            this.audioLevelProcessor = deps.audioLevelProcessor || null;
            this.particleSystem = deps.particleSystem || null;
            this.renderer = deps.renderer || null;
            this.canvasManager = deps.canvasManager || null;
            this.eventManager = deps.eventManager || null;
            this.accessibilityManager = deps.accessibilityManager || null;
            this.mobileOptimization = deps.mobileOptimization || null;
            this.pluginSystem = deps.pluginSystem || null;
            this.audioAnalyzer = deps.audioAnalyzer || null;
            this.shapeMorpher = deps.shapeMorpher || null;
            this._state = deps.state;
            this._stop = deps.stop;
            this._stopSpeaking = deps.stopSpeaking;
            this._disconnectAudio = deps.disconnectAudio;
        } else {
            // Legacy: deps is mascot
            const mascot = deps;
            this.errorBoundary = mascot.errorBoundary;
            this.animationController = mascot.animationController;
            this.positionController = mascot.positionController;
            this.soundSystem = mascot.soundSystem;
            this.audioLevelProcessor = mascot.audioLevelProcessor;
            this.particleSystem = mascot.particleSystem;
            this.renderer = mascot.renderer;
            this.canvasManager = mascot.canvasManager;
            this.eventManager = mascot.eventManager;
            this.accessibilityManager = mascot.accessibilityManager;
            this.mobileOptimization = mascot.mobileOptimization;
            this.pluginSystem = mascot.pluginSystem;
            this.audioAnalyzer = mascot.audioAnalyzer;
            this.shapeMorpher = mascot.shapeMorpher;
            this._state = {
                get speaking() { return mascot.speaking; },
                get llmHandler() { return mascot.llmHandler; },
                set llmHandler(v) { mascot.llmHandler = v; }
            };
            this._stop = () => mascot.stop();
            this._stopSpeaking = () => mascot.stopSpeaking();
            this._disconnectAudio = () => mascot.disconnectAudio();
            this._legacyMode = true;
        }
    }

    /**
     * Destroy all mascot resources
     */
    destroy() {
        this.errorBoundary.wrap(() => {
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
        this._stop();

        // Stop speech reactivity
        if (this._state.speaking) {
            this._stopSpeaking();
        }
    }

    /**
     * Destroy controllers
     */
    destroyControllers() {
        // Destroy animation controller
        if (this.animationController) {
            this.animationController.destroy();
        }

        // Destroy position controller
        if (this.positionController) {
            this.positionController.destroy();
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
        if (this.soundSystem) {
            this.soundSystem.cleanup();
        }
    }

    /**
     * Clean up audio processing
     */
    cleanupAudio() {
        if (this.audioLevelProcessor) {
            this.audioLevelProcessor.cleanup();
        }
    }

    /**
     * Clean up particle system
     */
    cleanupParticles() {
        if (this.particleSystem) {
            this.particleSystem.destroy();
        }
    }

    /**
     * Clean up renderer
     */
    cleanupRenderer() {
        if (this.renderer) {
            // Stop all active gestures
            this.renderer.stopAllGestures();
            this.renderer.destroy();
        }
    }

    /**
     * Clean up canvas manager
     */
    cleanupCanvas() {
        if (this.canvasManager) {
            this.canvasManager.destroy();
        }
    }

    /**
     * Clean up event listeners
     */
    cleanupEvents() {
        // Clear event listeners
        if (this.eventManager) {
            this.eventManager.destroy();
        }

        // Clean up LLM handler
        if (this._state.llmHandler) {
            this._state.llmHandler = null;
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
        if (this.accessibilityManager) {
            this.accessibilityManager.destroy();
        }
    }

    /**
     * Clean up mobile optimization
     */
    cleanupMobile() {
        if (this.mobileOptimization) {
            this.mobileOptimization.destroy();
        }
    }

    /**
     * Clean up plugin system
     */
    cleanupPlugins() {
        if (this.pluginSystem) {
            this.pluginSystem.destroy();
        }
    }

    /**
     * Clean up audio extensions (analyzer and shape morpher)
     */
    cleanupAudioExtensions() {
        // Clean up shape morpher and audio analyzer
        if (this.audioAnalyzer) {
            this._disconnectAudio();
            this.audioAnalyzer.destroy();
        }

        if (this.shapeMorpher) {
            this.shapeMorpher.reset();
        }
    }

    /**
     * Clear error boundary
     */
    clearErrorBoundary() {
        // Clear error boundary
        this.errorBoundary.clearErrors();
    }
}
