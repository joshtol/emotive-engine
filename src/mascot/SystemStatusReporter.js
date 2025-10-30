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
    constructor(mascot) {
        this.mascot = mascot;
    }

    /**
     * Get comprehensive system status
     * @returns {Object} System status with all subsystem metrics
     */
    getSystemStatus() {
        return this.mascot.errorBoundary.wrap(() => {
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
        const animationMetrics = this.mascot.animationController.getPerformanceMetrics();

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
        const state = this.mascot.stateMachine.getCurrentState();

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
            currentGesture: this.mascot.renderer?.currentGesture || null,
            gestureActive: this.mascot.renderer?.isGestureActive() || false
        };
    }

    /**
     * Get particle system status
     * @returns {Object} Particle metrics
     */
    getParticleStatus() {
        const particleStats = this.mascot.particleSystem.getStats();

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
            audioEnabled: this.mascot.config.enableAudio,
            soundSystemAvailable: this.mascot.soundSystem.isAvailable(),
            speaking: this.mascot.speaking,
            audioLevel: this.mascot.audioLevel,
            masterVolume: this.mascot.config.masterVolume
        };
    }

    /**
     * Get renderer status
     * @returns {Object} Renderer statistics
     */
    getRendererStatus() {
        const rendererStats = this.mascot.renderer.getStats();

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
        return this.mascot.getEventNames().length;
    }

    /**
     * Get error statistics
     * @returns {Object} Error boundary statistics
     */
    getErrorStats() {
        return this.mascot.errorBoundary.getErrorStats();
    }
}
