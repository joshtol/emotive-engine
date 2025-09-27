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
import { animationLoopManager, AnimationPriority } from './AnimationLoopManager.js';

class AnimationController {
    constructor(errorBoundary, config = {}) {
        this.errorBoundary = errorBoundary;
        this.config = config;
        this.config.targetFPS = config.targetFPS || 60;
        
        // Animation state
        this.isRunning = false;
        this.animationFrameId = null;
        this.loopCallbackId = null; // For AnimationLoopManager
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        this.isPaused = false;
        
        // Set up visibility change and window focus handling
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.handleWindowBlur = this.handleWindowBlur.bind(this);
        this.handleWindowFocus = this.handleWindowFocus.bind(this);

        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', this.handleVisibilityChange);
            window.addEventListener('blur', this.handleWindowBlur);
            window.addEventListener('focus', this.handleWindowFocus);
        }
        
        // PerformanceMonitor DISABLED - no FPS interference
        this.performanceMonitor = null;
        /* 
        this.performanceMonitor = new PerformanceMonitor(config);
        this.performanceMonitor.setEventCallback((event, data) => {
            this.emit(event, data);
        });
        */
        
        // Simple FPS counter for accurate display
        this.fpsCounter = new SimpleFPSCounter();
        
        // Subsystem references (injected via setSubsystems)
        this.subsystems = {};
        
        // Event callback for external integration
        this.eventCallback = null;
        
        // Reference to parent EmotiveMascot for audio level updates
        this.parentMascot = null;
        
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
        
        // PerformanceMonitor disabled
        if (this.performanceMonitor) {
            this.performanceMonitor.setSubsystems(this.subsystems);
        }
        
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

            // Register with AnimationLoopManager instead of direct RAF
            this.loopCallbackId = animationLoopManager.register(
                (deltaTime, timestamp) => this.animate(deltaTime, timestamp),
                AnimationPriority.CRITICAL, // Main render loop is critical priority
                this
            );

            // Emit start event
            this.emit('animationStarted', { targetFPS: this.targetFPS });
            
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
                return false;
            }
            
            // Stop animation loop
            this.isRunning = false;

            // Unregister from AnimationLoopManager
            if (this.loopCallbackId) {
                animationLoopManager.unregister(this.loopCallbackId);
                this.loopCallbackId = null;
            }

            // Clean up old RAF if it exists (for backwards compatibility)
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
            
            return true;
        }, 'animation-stop')();
    }

    /**
     * Handles window blur event
     */
    handleWindowBlur() {
        // Use same logic as visibility change
        if (!document.hidden) {
            // Only pause if document isn't already hidden (avoid double-pause)
            this.handleVisibilityChange();
        }
    }

    /**
     * Handles window focus event
     */
    handleWindowFocus() {
        // Force a resume check
        if (!document.hidden && this.isPaused) {
            // Simulate visibility change to visible
            this.handleVisibilityChange();
        }
    }

    /**
     * Handles document visibility changes to pause/resume animation
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Tab became hidden - pause animation
            this.wasRunning = this.isRunning;
            this.isPaused = true;

            // Store current time to calculate gap when resuming
            this.pauseTime = performance.now();

            // TAB FOCUS FIX: Don't clear particles immediately - let them fade naturally
            if (this.subsystems?.particleSystem) {
                // Just reset accumulator, don't clear particles
                this.subsystems.particleSystem.resetAccumulator();
                // Store particle count for debugging
                this.pausedParticleCount = this.subsystems.particleSystem.particles?.length || 0;
            }

            // Pause gesture animations if any are active
            if (this.subsystems?.renderer?.gestureAnimator) {
                this.subsystems.renderer.gestureAnimator.pauseCurrentAnimation?.();
            }

            // Notify parent mascot to pause
            if (this.parentMascot?.pause) {
                this.parentMascot.pause();
            }
        } else {
            // Tab became visible - resume animation smoothly
            if (this.isPaused && this.wasRunning) {
                // Calculate time gap
                const resumeTime = performance.now();
                const gap = resumeTime - this.pauseTime;

                // TAB FOCUS FIX: Reset timing more gently
                this.lastFrameTime = resumeTime;
                this.frameTimeAccumulator = 0;

                // TAB FOCUS FIX: Reset FPS counter to prevent false low FPS readings
                if (this.fpsCounter) {
                    this.fpsCounter.reset();
                }

                // TAB FOCUS FIX: Gradual particle recovery instead of clearing all
                if (this.subsystems?.particleSystem) {
                    // Clear accumulator again to be safe
                    this.subsystems.particleSystem.resetAccumulator();
                    
                    // Only clear particles if gap was VERY long (30+ seconds)
                    if (gap > 30000) {
                        this.subsystems.particleSystem.particles = [];
                    } else if (gap > 10000) {
                        // For medium gaps (10-30s), reduce particle count gradually
                        const targetCount = Math.max(10, Math.floor(this.pausedParticleCount * 0.5));
                        while (this.subsystems.particleSystem.particles.length > targetCount) {
                            this.subsystems.particleSystem.removeParticle(0);
                        }
                    }
                    // For short gaps (<10s), keep all particles
                }

                // TAB FOCUS FIX: Don't reset canvas context aggressively
                if (this.renderer) {
                    // Only reset if gap was very long
                    if (gap > 30000) {
                        this.renderer.resetCanvasContext();
                    }
                    
                    // Reset any active animations
                    if (this.renderer.gestureAnimator) {
                        this.renderer.gestureAnimator.resumeAnimation?.();
                    }

                    // Only force clean render for very long gaps
                    if (gap > 30000) {
                        this.renderer.forceCleanRender = true;
                    }
                }

                // Reset state machine timing
                if (this.subsystems?.stateMachine) {
                    // Update state machine's last update time
                    this.subsystems.stateMachine.lastUpdateTime = resumeTime;
                }

                // Notify parent mascot to resume
                if (this.parentMascot?.resume) {
                    this.parentMascot.resume();
                }

                // Finally unpause
                this.isPaused = false;

                // Log for debugging
                if (this.performanceMonitor) {
                    console.warn(`TAB FOCUS FIX: Resumed after ${(gap/1000).toFixed(1)}s pause. Particles kept: ${this.subsystems?.particleSystem?.particles?.length || 0}/${this.pausedParticleCount || 0}`);
                }
            }
        }
    }
    
    /**
     * Main animation loop - SIMPLIFIED for performance
     * Removed AnimationLoopManager overhead
     */
    animate(deltaTime, timestamp) {
        if (!this.isRunning || this.isPaused) return;

        // Simple deltaTime calculation
        const currentTime = timestamp || performance.now();
        this.deltaTime = deltaTime || (currentTime - this.lastFrameTime);
        
        // TAB FOCUS FIX: More aggressive deltaTime cap for smooth recovery
        // After tab focus, browsers can give inconsistent timing
        if (this.deltaTime > 20) {
            this.deltaTime = 20; // Reduced from 50ms to 20ms for smoother recovery
        }
        
        // TAB FOCUS FIX: Detect and handle tab focus recovery
        if (this.deltaTime > 16.67 && this.deltaTime < 20) {
            // Likely tab focus recovery - use target frame time
            this.deltaTime = 16.67; // Force 60fps timing
        }
        
        this.lastFrameTime = currentTime;
        
        // Simple update and render - no overhead
        this.update(this.deltaTime);
        this.render();
    }

    /**
     * Updates all subsystems
     * @param {number} deltaTime - Time since last frame in milliseconds
     */
    update(deltaTime) {
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
        
        // PerformanceMonitor disabled
        if (this.performanceMonitor) {
            this.performanceMonitor.updateMetrics({
                particleCount: this.subsystems.particleSystem?.getActiveParticleCount?.() || 0,
                audioLatency: this.subsystems.soundSystem?.getLatency?.() || 0
            });
        }
    }

    /**
     * Renders the current frame
     */
    render() {
        // Call parent mascot's render method if available
        if (this.parentMascot && typeof this.parentMascot.render === 'function') {
            this.parentMascot.render();
        } else if (this.subsystems.renderer) {
            // Fallback to direct renderer call
            this.subsystems.renderer.render();
        }
    }



    /**
     * Gets current performance metrics (delegated to PerformanceMonitor)
     * @returns {Object} Performance data
     */
    getPerformanceMetrics() {
        // PerformanceMonitor disabled - use simple FPS counter only
        const fpsMetrics = this.fpsCounter ? this.fpsCounter.getMetrics() : {};
        return {
            fps: fpsMetrics.fps || 60,
            instantFps: fpsMetrics.smoothedFPS || 60,
            frameTime: fpsMetrics.frameTime || 16.67,
            averageFrameTime: fpsMetrics.averageFrameTime || 16.67,
            isRunning: this.isRunning,
            deltaTime: this.deltaTime
        };
    }

    /**
     * Sets the target FPS (delegated to PerformanceMonitor)
     * @param {number} fps - Target FPS value
     */
    setTargetFPS(fps) {
        // DISABLED - no FPS changes allowed
        
    }

    /**
     * Gets the target FPS
     * @returns {number} Target FPS value
     */
    get targetFPS() {
        return this.config.targetFPS || 60;
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
        
        // Remove visibility change and focus listeners
        if (typeof document !== 'undefined') {
            document.removeEventListener('visibilitychange', this.handleVisibilityChange);
            window.removeEventListener('blur', this.handleWindowBlur);
            window.removeEventListener('focus', this.handleWindowFocus);
        }
        
        // Destroy performance monitor
        if (this.performanceMonitor) {
            this.performanceMonitor.destroy();
            this.performanceMonitor = null;
        }
        
        // Clear subsystem references
        this.subsystems = {};
        this.eventCallback = null;
        
    }
}

export default AnimationController;