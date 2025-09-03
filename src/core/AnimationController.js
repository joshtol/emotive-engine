/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝                                                                             
 *                    ◐ ◑ ◒ ◓  ANIMATION CONTROLLER  ◓ ◒ ◑ ◐                    
 *                                                                                    
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Animation Controller - Main Loop & Performance Management
 * @author Emotive Engine Team
 * @version 2.0.0
 * @module AnimationController
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ The HEARTBEAT of the Emotive Engine. Manages the main animation loop,             
 * ║ coordinates all subsystems, monitors performance, and ensures smooth              
 * ║ frame rates through adaptive quality control.                                     
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎬 CORE RESPONSIBILITIES                                                          
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Main requestAnimationFrame loop management                                      
 * │ • Frame timing and deltaTime calculation                                          
 * │ • Performance monitoring and FPS tracking                                         
 * │ • Adaptive quality degradation when performance drops                             
 * │ • Subsystem update coordination (render, particles, state)                        
 * │ • Visibility and pause state handling                                             
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ ⚡ PERFORMANCE FEATURES                                                           
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Dynamic FPS targeting (15, 30, 45, 60 FPS)                                      
 * │ • Frame skipping for consistent timing                                            
 * │ • Automatic quality reduction when FPS drops                                      
 * │ • Recovery system when performance improves                                       
 * │ • Memory leak detection and prevention                                            
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🔧 CONFIGURATION OPTIONS                                                          
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • targetFPS         : Desired frame rate (default: 60)                            
 * │ • enableDegradation : Allow quality reduction (default: true)                     
 * │ • performanceMode   : 'adaptive' | 'fixed' | 'maximum'                           
 * │ • monitoringInterval: Performance check frequency (default: 1000ms)               
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ ❌ CRITICAL - DO NOT MODIFY                                                       
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ ✗ Frame timing logic       → Breaks animation smoothness                         
 * │ ✗ Update order            → Causes render/state desync                           
 * │ ✗ Performance thresholds   → May cause excessive degradation                     
 * │ ✗ Memory cleanup          → Creates memory leaks                                 
 * │ ✗ RAF loop management     → Breaks entire animation system                       
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                          SUBSYSTEM UPDATE ORDER                                   
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ 1. Performance monitoring (FPS calculation)                                       
 * ║ 2. State machine update (emotions, transitions)                                   
 * ║ 3. Gesture processing (animation progress)                                        
 * ║ 4. Particle system update (movement, spawning)                                    
 * ║ 5. Renderer update (draw orb and particles)                                       
 * ║ 6. Cleanup and memory management                                                  
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

import PerformanceMonitor from './PerformanceMonitor.js';
import SimpleFPSCounter from './SimpleFPSCounter.js';

class AnimationController {
    constructor(errorBoundary, config = {}) {
        this.errorBoundary = errorBoundary;
        
        // Animation state
        this.isRunning = false;
        this.animationFrameId = null;
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        this.isPaused = false;
        
        // Set up visibility change handling
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', this.handleVisibilityChange);
        }
        
        // Performance monitoring (delegated to PerformanceMonitor)
        this.performanceMonitor = new PerformanceMonitor(config);
        this.performanceMonitor.setEventCallback((event, data) => {
            this.emit(event, data);
        });
        
        // Simple FPS counter for accurate display
        this.fpsCounter = new SimpleFPSCounter();
        
        // Subsystem references (injected via setSubsystems)
        this.subsystems = {};
        
        // Event callback for external integration
        this.eventCallback = null;
        
        // Reference to parent EmotiveMascot for audio level updates
        this.parentMascot = null;
        
        console.log('AnimationController initialized');
    }

    /**
     * Injects subsystem dependencies
     * @param {Object} subsystems - Object containing all required subsystems
     */
    setSubsystems(subsystems) {
        this.subsystems = {
            stateMachine: subsystems.stateMachine,
            particleSystem: subsystems.particleSystem,
            renderer: subsystems.renderer,
            soundSystem: subsystems.soundSystem,
            canvasManager: subsystems.canvasManager
        };
        
        // Validate required subsystems
        const required = ['stateMachine', 'particleSystem', 'renderer'];
        for (const system of required) {
            if (!this.subsystems[system]) {
                throw new Error(`Required subsystem '${system}' not provided`);
            }
        }
        
        // Configure performance monitor with subsystems
        this.performanceMonitor.setSubsystems(this.subsystems);
        
        console.log('AnimationController subsystems configured');
    }

    /**
     * Sets the event callback for external integration
     * @param {Function} callback - Function to call for event emission
     */
    setEventCallback(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Event callback must be a function');
        }
        this.eventCallback = callback;
    }

    /**
     * Sets the parent EmotiveMascot reference for audio level updates
     * @param {EmotiveMascot} mascot - Parent mascot instance
     */
    setParentMascot(mascot) {
        this.parentMascot = mascot;
    }

    /**
     * Emits an event through the callback if available
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data = null) {
        if (this.eventCallback) {
            this.eventCallback(event, data);
        }
    }

    /**
     * Starts the animation loop
     * @returns {boolean} Success status
     */
    start() {
        return this.errorBoundary.wrap(() => {
            if (this.isRunning) {
                console.warn('AnimationController is already running');
                return false;
            }

            if (!this.subsystems.stateMachine) {
                throw new Error('Cannot start animation without subsystems configured');
            }
            
            // Initialize animation state
            this.isRunning = true;
            this.lastFrameTime = performance.now();
            
            // Resume audio context if available
            if (this.subsystems.soundSystem && this.subsystems.soundSystem.isAvailable()) {
                this.subsystems.soundSystem.resumeContext();
            }
            
            // Start the main animation loop
            this.animate();
            
            // Emit start event
            this.emit('animationStarted', { targetFPS: this.targetFPS });
            
            console.log(`AnimationController started (target: ${this.targetFPS} FPS)`);
            return true;
        }, 'animation-start')();
    }

    /**
     * Stops the animation loop
     * @returns {boolean} Success status
     */
    stop() {
        return this.errorBoundary.wrap(() => {
            if (!this.isRunning) {
                console.warn('AnimationController is not running');
                return false;
            }
            
            // Stop animation loop
            this.isRunning = false;
            
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
            

            
            // Stop all active gestures
            if (this.subsystems.renderer && this.subsystems.renderer.stopAllGestures) {
                this.subsystems.renderer.stopAllGestures();
            }
            
            // Stop ambient audio
            if (this.subsystems.soundSystem && this.subsystems.soundSystem.isAvailable()) {
                this.subsystems.soundSystem.stopAmbientTone();
            }
            
            // Clear particles
            if (this.subsystems.particleSystem) {
                this.subsystems.particleSystem.clear();
            }
            
            // Emit stop event
            this.emit('animationStopped');
            
            console.log('AnimationController stopped');
            return true;
        }, 'animation-stop')();
    }

    /**
     * Handles document visibility changes to pause/resume animation
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Tab became hidden - pause animation
            this.isPaused = true;
            
            // Only reset accumulator, don't clear existing particles
            if (this.subsystems?.particleSystem) {
                this.subsystems.particleSystem.resetAccumulator();
            }
        } else {
            // Tab became visible - resume animation smoothly
            if (this.isPaused) {
                this.isPaused = false;
                // Reset the last frame time to current time to avoid huge delta
                this.lastFrameTime = performance.now();
                // Reset accumulator to prevent burst spawning
                if (this.subsystems?.particleSystem) {
                    this.subsystems.particleSystem.resetAccumulator();
                }
            }
        }
    }
    
    /**
     * Main animation loop with deltaTime calculation and performance monitoring
     */
    animate() {
        if (!this.isRunning || this.isPaused) return;
        
        this.errorBoundary.wrap(() => {
            const currentTime = performance.now();
            this.deltaTime = currentTime - this.lastFrameTime;
            
            // Cap deltaTime to prevent physics instability
            // Use a consistent cap of 50ms (20 FPS minimum)
            const skipParticleSpawn = this.deltaTime > 33; // Skip spawning if under 30fps
            
            if (this.deltaTime > 50) {
                // Large gap detected - cap and reset accumulator
                this.deltaTime = 50;
                // Reset the accumulator to prevent burst spawning
                if (this.subsystems?.particleSystem) {
                    this.subsystems.particleSystem.resetAccumulator();
                }
            }
            
            // Store skip flag for particle system
            if (this.subsystems?.particleSystem) {
                this.subsystems.particleSystem.skipSpawnThisFrame = skipParticleSpawn;
            }
            
            this.lastFrameTime = currentTime;
            
            // Start performance monitoring for this frame
            this.performanceMonitor.startFrame(currentTime);
            
            // Update simple FPS counter
            this.fpsCounter.update(currentTime);
            
            // Update all subsystems with integrated deltaTime
            this.update(this.deltaTime);
            
            // Render the current frame
            this.render();
            
            // End performance monitoring for this frame
            this.performanceMonitor.endFrame(performance.now());
            
            // Schedule next frame using requestAnimationFrame for optimal timing
            this.animationFrameId = requestAnimationFrame(() => this.animate());
            
        }, 'animation-loop')();
    }

    /**
     * Updates all subsystems
     * @param {number} deltaTime - Time since last frame in milliseconds
     */
    update(deltaTime) {
        this.errorBoundary.wrap(() => {
            const currentTime = performance.now();
            
            // Update state machine
            if (this.subsystems.stateMachine) {
                this.subsystems.stateMachine.update(deltaTime);
            }
            
            // Gesture updates now handled by renderer
            
            // Update parent mascot for audio level monitoring
            if (this.parentMascot && typeof this.parentMascot.update === 'function') {
                this.parentMascot.update(deltaTime);
            }
            
            // Only handle particles here if NOT in classic rendering mode
            // Classic mode handles its own particles in EmotiveMascot.render()
            const isClassicMode = this.parentMascot?.config?.renderingStyle === 'classic';
            
            if (!isClassicMode) {
                // Get current emotional properties and center for particle system (advanced mode only)
                if (this.subsystems.particleSystem && this.subsystems.stateMachine && this.subsystems.canvasManager) {
                    const emotionalProps = this.subsystems.stateMachine.getCurrentEmotionalProperties();
                    const center = this.subsystems.canvasManager.getCenter();
                    
                    // Get current gesture info from renderer if available
                    let gestureMotion = null;
                    let gestureProgress = 0;
                    
                    if (this.subsystems.renderer && this.subsystems.renderer.getCurrentGesture) {
                        const currentGesture = this.subsystems.renderer.getCurrentGesture();
                        if (currentGesture && currentGesture.particleMotion) {
                            gestureMotion = currentGesture.particleMotion;
                            gestureProgress = currentGesture.progress || 0;
                        }
                    }
                    
                    // Update particle system with current emotional context
                    this.subsystems.particleSystem.spawn(
                        emotionalProps.particleBehavior,
                        this.subsystems.stateMachine.getCurrentState().emotion,
                        emotionalProps.particleRate,
                        center.x,
                        center.y,
                        deltaTime
                    );
                    
                    // Update particles with gesture motion if available
                    this.subsystems.particleSystem.update(deltaTime, center.x, center.y, gestureMotion, gestureProgress);
                }
            }
            
            // Update performance monitor with current system state
            this.performanceMonitor.updateMetrics({
                particleCount: this.subsystems.particleSystem?.getActiveParticleCount?.() || 0,
                gestureQueueLength: 0,
                audioLatency: this.subsystems.soundSystem?.getLatency?.() || 0
            });
            
        }, 'subsystem-update')();
    }

    /**
     * Renders the current frame
     */
    render() {
        this.errorBoundary.wrap(() => {
            // Call parent mascot's render method if available
            if (this.parentMascot && typeof this.parentMascot.render === 'function') {
                this.parentMascot.render();
            } else if (this.subsystems.renderer) {
                // Fallback to direct renderer call
                this.subsystems.renderer.render();
            }
        }, 'frame-render')();
    }



    /**
     * Gets current performance metrics (delegated to PerformanceMonitor)
     * @returns {Object} Performance data
     */
    getPerformanceMetrics() {
        const metrics = this.performanceMonitor.getMetrics();
        const fpsMetrics = this.fpsCounter ? this.fpsCounter.getMetrics() : {};
        return {
            ...metrics,
            // Override with simple FPS counter values if available
            fps: fpsMetrics.fps || metrics.fps,
            instantFps: fpsMetrics.smoothedFPS || metrics.instantFps,
            frameTime: fpsMetrics.frameTime || metrics.frameTime,
            averageFrameTime: fpsMetrics.averageFrameTime || metrics.averageFrameTime,
            isRunning: this.isRunning,
            deltaTime: this.deltaTime
        };
    }

    /**
     * Sets the target FPS (delegated to PerformanceMonitor)
     * @param {number} fps - Target FPS value
     */
    setTargetFPS(fps) {
        if (typeof fps !== 'number' || fps <= 0) {
            throw new Error('Target FPS must be a positive number');
        }
        this.performanceMonitor.setTargetFPS(fps);
        console.log(`AnimationController target FPS set to ${fps}`);
    }

    /**
     * Gets the target FPS
     * @returns {number} Target FPS value
     */
    get targetFPS() {
        return this.performanceMonitor.config.targetFPS;
    }

    /**
     * Checks if the animation is currently running
     * @returns {boolean} Running status
     */
    isAnimating() {
        return this.isRunning;
    }

    /**
     * Destroys the animation controller and cleans up resources
     */
    destroy() {
        this.stop();
        
        // Remove visibility change listener
        if (typeof document !== 'undefined') {
            document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        }
        
        // Destroy performance monitor
        if (this.performanceMonitor) {
            this.performanceMonitor.destroy();
            this.performanceMonitor = null;
        }
        
        // Clear subsystem references
        this.subsystems = {};
        this.eventCallback = null;
        
        console.log('AnimationController destroyed');
    }
}

export default AnimationController;