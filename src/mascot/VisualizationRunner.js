/**
 * VisualizationRunner - Manages the main animation loop and rendering
 * @module mascot/VisualizationRunner
 */

import { getEmotionVisualParams, getEmotion } from '../core/emotions/index.js';

export class VisualizationRunner {
    constructor(mascot) {
        this.mascot = mascot;
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
        if (this.mascot.animationController.isAnimating()) {
            return this.mascot;
        }
        
        // Start the animation controller
        const success = this.mascot.animationController.start();
        
        if (success) {
            this.mascot.isRunning = true;
            this.isRunning = true;
            
            // Spawn initial particles for classic mode
            if (this.mascot.config.renderingStyle === 'classic' && this.mascot.particleSystem) {
                const currentState = this.mascot.stateMachine.getCurrentState();
                const {emotion} = currentState;
                const {undertone} = currentState;
                const emotionParams = getEmotionVisualParams(emotion);
                
                // Get the actual orb position from the renderer (includes gaze offset)
                let orbX, orbY;
                if (this.mascot.renderer && this.mascot.renderer.getCurrentOrbPosition) {
                    const orbPos = this.mascot.renderer.getCurrentOrbPosition();
                    orbX = orbPos.x;
                    orbY = orbPos.y;
                } else {
                    // Fallback to center if method doesn't exist
                    orbX = this.mascot.canvasManager.width / 2;
                    orbY = this.mascot.canvasManager.height / 2;
                }
                
                // Clear any existing particles first
                this.mascot.particleSystem.clear();
                
                // Check if emotion has specific particle configuration
                if (emotionParams.particleRate > 0) {
                    // Spawn initial burst of particles
                    const initialCount = Math.min(3, Math.floor(emotionParams.particleRate / 4));
                    
                    if (initialCount > 0) {
                        this.mascot.particleSystem.burst(
                            initialCount,
                            emotionParams.particleBehavior,
                            orbX,
                            orbY
                        );
                    }
                }
            }
            
            // Start degradation monitoring
            if (this.mascot.degradationManager) {
                this.mascot.degradationManager.startMonitoring();
            }
            
            // Emit start event
            this.mascot.emit('started');
        }
        
        return this.mascot;
    }

    /**
     * Stops the animation loop and cleans up resources
     * @returns {Object} The mascot instance for chaining
     */
    stop() {
        if (!this.mascot.animationController.isAnimating()) {
            return this.mascot;
        }
        
        // Stop speech reactivity if active
        if (this.mascot.speaking) {
            this.mascot.audioHandler.stopSpeaking();
        }
        
        // Stop the animation controller
        const success = this.mascot.animationController.stop();
        
        if (success) {
            this.mascot.isRunning = false;
            this.isRunning = false;
            
            // Stop degradation monitoring
            if (this.mascot.degradationManager) {
                this.mascot.degradationManager.stopMonitoring();
            }
            
            // Emit stop event
            this.mascot.emit('stopped');
        }
        
        return this.mascot;
    }

    /**
     * Updates audio level monitoring and other per-frame updates
     * @param {number} deltaTime - Time since last frame in milliseconds
     */
    update(deltaTime) {
        // Update audio level monitoring if speaking
        if (this.mascot.speaking && this.mascot.audioLevelProcessor.isProcessingActive()) {
            this.mascot.audioLevelProcessor.updateAudioLevel(deltaTime);
        }
        
        // Update classic mode components
        if (this.mascot.config.renderingStyle === 'classic') {
            // Update gaze tracker
            if (this.mascot.gazeTracker) {
                this.mascot.gazeTracker.update(deltaTime);
                
                // Update threat level for suspicion emotion
                const currentEmotion = this.mascot.stateMachine.getCurrentState().emotion;
                if (currentEmotion === 'suspicion') {
                    // Get mouse position and calculate distance to center
                    const {mousePos} = this.mascot.gazeTracker;
                    const centerX = this.mascot.canvas.width / 2;
                    const centerY = this.mascot.canvas.height / 2;
                    const distance = Math.sqrt(
                        Math.pow(mousePos.x - centerX, 2) + 
                        Math.pow(mousePos.y - centerY, 2)
                    );
                    
                    // Get emotion configuration
                    const suspicionEmotion = getEmotion('suspicion');
                    if (suspicionEmotion && suspicionEmotion.visual) {
                        const maxDistance = Math.min(centerX, centerY);
                        const threatLevel = Math.max(0, Math.min(1, 1 - (distance / maxDistance)));
                        suspicionEmotion.visual.threatLevel = threatLevel;
                    }
                }
            }
            
            // Update idle behaviors
            if (this.mascot.idleBehavior) {
                this.mascot.idleBehavior.update(deltaTime);
            }
            
            // Combine gaze and sway offsets
            if (this.mascot.gazeTracker && this.mascot.idleBehavior) {
                const gazeOffset = this.mascot.gazeTracker.getGazeOffset();
                const swayOffset = this.mascot.idleBehavior.getSwayOffset();
                
                // Get full gaze state including proximity for eye narrowing
                const gazeState = this.mascot.gazeTracker.getState();
                
                // Combine the offsets and include proximity data
                const gazeData = {
                    offset: {
                        x: gazeOffset.x + swayOffset.x,
                        y: gazeOffset.y + swayOffset.y
                    },
                    proximity: gazeState.proximity,
                    isFocused: gazeState.isFocused
                };
                
                // Pass to renderer
                if (this.mascot.renderer.setGazeData) {
                    this.mascot.renderer.setGazeData(gazeData);
                }
            }
        }

        // Update plugins
        if (this.mascot.pluginSystem) {
            const state = this.mascot.stateMachine.getCurrentState();
            this.mascot.pluginSystem.update(deltaTime, state);
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        this.stop();
    }
}