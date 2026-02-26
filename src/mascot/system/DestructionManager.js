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
     * @param {Object} [deps.gestureController] - Gesture controller instance
     * @param {Object} [deps.stateCoordinator] - State coordinator instance
     * @param {Object} [deps.visualizationRunner] - Visualization runner instance
     * @param {Object} [deps.orbScaleAnimator] - Orb scale animator instance
     * @param {Object} [deps.audioHandler] - Audio handler instance
     * @param {Object} [deps.degradationManager] - Degradation manager instance
     * @param {Object} [deps.stateMachine] - State machine instance
     * @param {Object} deps.state - Shared state with speaking, llmHandler properties
     * @param {Function} deps.stop - Function to stop animation
     * @param {Function} deps.stopSpeaking - Function to stop speaking
     * @param {Function} deps.disconnectAudio - Function to disconnect audio
     */
    constructor(deps) {
        // Required dependency validation
        if (!deps.errorBoundary) throw new Error('DestructionManager: errorBoundary required');
        if (!deps.animationController)
            throw new Error('DestructionManager: animationController required');
        if (!deps.state) throw new Error('DestructionManager: state required');
        if (!deps.stop) throw new Error('DestructionManager: stop required');
        if (!deps.stopSpeaking) throw new Error('DestructionManager: stopSpeaking required');
        if (!deps.disconnectAudio) throw new Error('DestructionManager: disconnectAudio required');

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
        this.gestureController = deps.gestureController || null;
        this.stateCoordinator = deps.stateCoordinator || null;
        this.visualizationRunner = deps.visualizationRunner || null;
        this.orbScaleAnimator = deps.orbScaleAnimator || null;
        this.audioHandler = deps.audioHandler || null;
        this.degradationManager = deps.degradationManager || null;
        this.stateMachine = deps.stateMachine || null;
        this._state = deps.state;
        this._stop = deps.stop;
        this._stopSpeaking = deps.stopSpeaking;
        this._disconnectAudio = deps.disconnectAudio;
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
        this.cleanupManagers();
    }

    /**
     * Clean up manager instances that have destroy methods
     */
    cleanupManagers() {
        // Clean up gesture controller (clears pending gesture timeouts)
        if (this.gestureController && typeof this.gestureController.destroy === 'function') {
            this.gestureController.destroy();
        }

        // Clean up state coordinator (clears state tracking)
        if (this.stateCoordinator && typeof this.stateCoordinator.destroy === 'function') {
            this.stateCoordinator.destroy();
        }

        // Clean up visualization runner (stops render loop)
        if (this.visualizationRunner && typeof this.visualizationRunner.destroy === 'function') {
            this.visualizationRunner.destroy();
        }

        // Clean up orb scale animator (clears animation state)
        if (this.orbScaleAnimator && typeof this.orbScaleAnimator.destroy === 'function') {
            this.orbScaleAnimator.destroy();
        }

        // Clean up audio handler (clears intervals)
        if (this.audioHandler && typeof this.audioHandler.destroy === 'function') {
            this.audioHandler.destroy();
        }

        // Clean up degradation manager (stops monitoring interval)
        if (this.degradationManager && typeof this.degradationManager.destroy === 'function') {
            this.degradationManager.destroy();
        }

        // Clean up state machine (clears state and transitions)
        if (this.stateMachine && typeof this.stateMachine.destroy === 'function') {
            this.stateMachine.destroy();
        }
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

        // Nullify all references to prevent memory leaks from circular references
        this.nullifyReferences();
    }

    /**
     * Nullify all references to allow garbage collection
     * This prevents memory leaks from circular references
     */
    nullifyReferences() {
        this.errorBoundary = null;
        this.animationController = null;
        this.positionController = null;
        this.soundSystem = null;
        this.audioLevelProcessor = null;
        this.particleSystem = null;
        this.renderer = null;
        this.canvasManager = null;
        this.eventManager = null;
        this.accessibilityManager = null;
        this.mobileOptimization = null;
        this.pluginSystem = null;
        this.audioAnalyzer = null;
        this.shapeMorpher = null;
        this.gestureController = null;
        this.stateCoordinator = null;
        this.visualizationRunner = null;
        this.orbScaleAnimator = null;
        this.audioHandler = null;
        this.degradationManager = null;
        this.stateMachine = null;
        this._state = null;
        this._stop = null;
        this._stopSpeaking = null;
        this._disconnectAudio = null;
    }
}
