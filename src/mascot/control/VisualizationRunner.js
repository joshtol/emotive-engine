/**
 * VisualizationRunner - Manages the main animation loop and rendering
 * @module mascot/VisualizationRunner
 */

import { getEmotionVisualParams, getEmotion } from '../../core/emotions/index.js';

export class VisualizationRunner {
    /**
     * Create VisualizationRunner
     *
     * @param {Object} deps - Dependencies
     * @param {Object} deps.animationController - Animation controller instance
     * @param {Object} deps.stateMachine - State machine instance
     * @param {Object} [deps.particleSystem] - Particle system instance
     * @param {Object} [deps.canvasManager] - Canvas manager instance
     * @param {Object} [deps.renderer] - Renderer instance
     * @param {Object} [deps.audioHandler] - Audio handler instance
     * @param {Object} [deps.audioLevelProcessor] - Audio level processor instance
     * @param {Object} [deps.gazeTracker] - Gaze tracker instance
     * @param {Object} [deps.idleBehavior] - Idle behavior instance
     * @param {Object} [deps.degradationManager] - Degradation manager instance
     * @param {Object} [deps.pluginSystem] - Plugin system instance
     * @param {Object} deps.config - Configuration object
     * @param {Object} deps.canvas - Canvas element
     * @param {Object} deps.state - Shared state with isRunning, speaking properties
     * @param {Function} deps.emit - Event emission function
     * @param {Object} [deps.chainTarget] - Return value for method chaining
     */
    constructor(deps) {
        // Required dependency validation
        if (!deps.animationController)
            throw new Error('VisualizationRunner: animationController required');
        if (!deps.stateMachine) throw new Error('VisualizationRunner: stateMachine required');
        if (!deps.config) throw new Error('VisualizationRunner: config required');
        if (!deps.state) throw new Error('VisualizationRunner: state required');
        if (!deps.emit) throw new Error('VisualizationRunner: emit required');

        this.animationController = deps.animationController;
        this.stateMachine = deps.stateMachine;
        this.particleSystem = deps.particleSystem || null;
        this.canvasManager = deps.canvasManager || null;
        this.renderer = deps.renderer || null;
        this.audioHandler = deps.audioHandler || null;
        this.audioLevelProcessor = deps.audioLevelProcessor || null;
        this.gazeTracker = deps.gazeTracker || null;
        this.idleBehavior = deps.idleBehavior || null;
        this.degradationManager = deps.degradationManager || null;
        this.pluginSystem = deps.pluginSystem || null;
        this.config = deps.config;
        this.canvas = deps.canvas || null;
        this._state = deps.state;
        this._emit = deps.emit;
        this._chainTarget = deps.chainTarget || this;

        this.animationId = null;
        this.isRunning = false;
        this.lastTime = 0;
    }

    /**
     * Initialize visualization runner
     */
    init() {
        // Will contain initialization logic
    }

    /**
     * Starts the animation loop at target 60 FPS
     * @returns {Object} The mascot instance for chaining
     */
    start() {
        if (this.animationController.isAnimating()) {
            return this._chainTarget;
        }

        // Start the animation controller
        const success = this.animationController.start();

        if (success) {
            this._state.isRunning = true;
            this.isRunning = true;

            // Spawn initial particles for classic mode
            if (this.config.renderingStyle === 'classic' && this.particleSystem) {
                const currentState = this.stateMachine.getCurrentState();
                const { emotion } = currentState;
                // undertone not used for classic rendering
                const emotionParams = getEmotionVisualParams(emotion);

                // Get the actual orb position from the renderer (includes gaze offset)
                let orbX, orbY;
                if (this.renderer && this.renderer.getCurrentOrbPosition) {
                    const orbPos = this.renderer.getCurrentOrbPosition();
                    orbX = orbPos.x;
                    orbY = orbPos.y;
                } else {
                    // Fallback to center if method doesn't exist
                    orbX = this.canvasManager.width / 2;
                    orbY = this.canvasManager.height / 2;
                }

                // Clear any existing particles first
                this.particleSystem.clear();

                // Check if emotion has specific particle configuration
                if (emotionParams.particleRate > 0) {
                    // Spawn initial burst of particles
                    const initialCount = Math.min(3, Math.floor(emotionParams.particleRate / 4));

                    if (initialCount > 0) {
                        this.particleSystem.burst(
                            initialCount,
                            emotionParams.particleBehavior,
                            orbX,
                            orbY
                        );
                    }
                }
            }

            // Start degradation monitoring
            if (this.degradationManager) {
                this.degradationManager.startMonitoring();
            }

            // Emit start event
            this._emit('started');
        }

        return this._chainTarget;
    }

    /**
     * Stops the animation loop and cleans up resources
     * @returns {Object} The mascot instance for chaining
     */
    stop() {
        if (!this.animationController.isAnimating()) {
            return this._chainTarget;
        }

        // Stop speech reactivity if active
        if (this._state.speaking && this.audioHandler) {
            this.audioHandler.stopSpeaking();
        }

        // Stop the animation controller
        const success = this.animationController.stop();

        if (success) {
            this._state.isRunning = false;
            this.isRunning = false;

            // Stop degradation monitoring
            if (this.degradationManager) {
                this.degradationManager.stopMonitoring();
            }

            // Emit stop event
            this._emit('stopped');
        }

        return this._chainTarget;
    }

    /**
     * Updates audio level monitoring and other per-frame updates
     * @param {number} deltaTime - Time since last frame in milliseconds
     */
    update(deltaTime) {
        // Update audio level monitoring if speaking
        if (
            this._state.speaking &&
            this.audioLevelProcessor &&
            this.audioLevelProcessor.isProcessingActive()
        ) {
            this.audioLevelProcessor.updateAudioLevel(deltaTime);
        }

        // Update classic mode components
        if (this.config.renderingStyle === 'classic') {
            // Update gaze tracker
            if (this.gazeTracker) {
                this.gazeTracker.update(deltaTime);

                // Update threat level for suspicion emotion
                const currentEmotion = this.stateMachine.getCurrentState().emotion;
                if (currentEmotion === 'suspicion') {
                    // Get mouse position and calculate distance to center
                    const { mousePos } = this.gazeTracker;
                    const centerX = this.canvas.width / 2;
                    const centerY = this.canvas.height / 2;
                    const distance = Math.sqrt(
                        Math.pow(mousePos.x - centerX, 2) + Math.pow(mousePos.y - centerY, 2)
                    );

                    // Get emotion configuration
                    const suspicionEmotion = getEmotion('suspicion');
                    if (suspicionEmotion && suspicionEmotion.visual) {
                        const maxDistance = Math.min(centerX, centerY);
                        const threatLevel = Math.max(0, Math.min(1, 1 - distance / maxDistance));
                        suspicionEmotion.visual.threatLevel = threatLevel;
                    }
                }
            }

            // Update idle behaviors
            if (this.idleBehavior) {
                this.idleBehavior.update(deltaTime);
            }

            // Combine gaze and sway offsets
            if (this.gazeTracker && this.idleBehavior) {
                const gazeOffset = this.gazeTracker.getGazeOffset();
                const swayOffset = this.idleBehavior.getSwayOffset();

                // Get full gaze state including proximity for eye narrowing
                const gazeState = this.gazeTracker.getState();

                // Combine the offsets and include proximity data
                const gazeData = {
                    offset: {
                        x: gazeOffset.x + swayOffset.x,
                        y: gazeOffset.y + swayOffset.y,
                    },
                    proximity: gazeState.proximity,
                    isFocused: gazeState.isFocused,
                };

                // Pass to renderer
                if (this.renderer && this.renderer.setGazeData) {
                    this.renderer.setGazeData(gazeData);
                }
            }
        }

        // Update plugins
        if (this.pluginSystem) {
            const state = this.stateMachine.getCurrentState();
            this.pluginSystem.update(deltaTime, state);
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        this.stop();
    }
}
