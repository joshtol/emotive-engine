/**
 * SystemStatusReporter
 *
 * Collects and reports comprehensive system status information.
 * Handles:
 * - Core animation status (FPS, degradation)
 * - Emotional state tracking
 * - Gesture system status
 * - Particle system metrics
 * - Audio system status
 * - Renderer statistics
 * - Event system metrics
 * - Error boundary statistics
 */
export class SystemStatusReporter {
    /**
     * Create SystemStatusReporter
     *
     * @param {Object} deps - Dependencies
     * @param {Object} deps.errorBoundary - Error handling wrapper
     * @param {Object} deps.animationController - Animation controller instance
     * @param {Object} deps.stateMachine - State machine instance
     * @param {Object} deps.particleSystem - Particle system instance
     * @param {Object} deps.soundSystem - Sound system instance
     * @param {Object} [deps.renderer] - Renderer instance
     * @param {Object} deps.config - Configuration object
     * @param {Object} deps.state - Shared state with speaking, audioLevel properties
     * @param {Function} deps.getEventNames - Function to get event names
     */
    constructor(deps) {
        this.errorBoundary = deps.errorBoundary;
        this.animationController = deps.animationController;
        this.stateMachine = deps.stateMachine;
        this.particleSystem = deps.particleSystem;
        this.soundSystem = deps.soundSystem;
        this.renderer = deps.renderer || null;
        this.config = deps.config;
        this._state = deps.state;
        this._getEventNames = deps.getEventNames;
    }

    /**
     * Get comprehensive system status
     * @returns {Object} System status with all subsystem metrics
     */
    getSystemStatus() {
        return this.errorBoundary.wrap(() => {
            return {
                ...this.getCoreStatus(),
                ...this.getEmotionalStatus(),
                ...this.getGestureStatus(),
                particles: this.getParticleStatus(),
                ...this.getAudioStatus(),
                renderer: this.getRendererStatus(),
                eventListeners: this.getEventListenerCount(),
                errorStats: this.getErrorStats()
            };
        }, 'system-status', {})();
    }

    /**
     * Get core animation status
     * @returns {Object} Core status with FPS and degradation
     */
    getCoreStatus() {
        const animationMetrics = this.animationController.getPerformanceMetrics();

        return {
            isRunning: animationMetrics.isRunning,
            fps: animationMetrics.fps,
            targetFPS: animationMetrics.targetFPS,
            performanceDegradation: animationMetrics.performanceDegradation
        };
    }

    /**
     * Get emotional state status
     * @returns {Object} Emotional state with transitions
     */
    getEmotionalStatus() {
        const state = this.stateMachine.getCurrentState();

        return {
            emotion: state.emotion,
            undertone: state.undertone,
            isTransitioning: state.isTransitioning,
            transitionProgress: state.transitionProgress
        };
    }

    /**
     * Get gesture system status
     * @returns {Object} Gesture status
     */
    getGestureStatus() {
        return {
            currentGesture: this.renderer?.currentGesture || null,
            gestureActive: this.renderer?.isGestureActive() || false
        };
    }

    /**
     * Get particle system status
     * @returns {Object} Particle metrics
     */
    getParticleStatus() {
        const particleStats = this.particleSystem.getStats();

        return {
            active: particleStats.activeParticles,
            max: particleStats.maxParticles,
            poolEfficiency: particleStats.poolEfficiency
        };
    }

    /**
     * Get audio system status
     * @returns {Object} Audio system metrics
     */
    getAudioStatus() {
        return {
            audioEnabled: this.config.enableAudio,
            soundSystemAvailable: this.soundSystem.isAvailable(),
            speaking: this._state.speaking,
            audioLevel: this._state.audioLevel,
            masterVolume: this.config.masterVolume
        };
    }

    /**
     * Get renderer status
     * @returns {Object} Renderer statistics
     */
    getRendererStatus() {
        const rendererStats = this.renderer.getStats();

        return {
            gradientCacheSize: rendererStats.gradientCacheSize,
            breathingPhase: rendererStats.breathingPhase,
            layers: rendererStats.layers
        };
    }

    /**
     * Get event listener count
     * @returns {number} Number of registered event listeners
     */
    getEventListenerCount() {
        return this._getEventNames().length;
    }

    /**
     * Get error statistics
     * @returns {Object} Error boundary statistics
     */
    getErrorStats() {
        return this.errorBoundary.getErrorStats();
    }
}
