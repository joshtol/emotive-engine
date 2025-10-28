/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE v4.0
 *  └─○═╝                                                                             
 *              ◐ ◑ ◒ ◓  EXAMPLE: CUSTOM GESTURE PLUGIN  ◓ ◒ ◑ ◐              
 *                                                                                    
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Example Custom Gesture Plugin using v4.0 Plugin Adapter System
 * @author Emotive Engine Team
 * @version 2.0.0
 * @module ExampleGesturePlugin
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Shows how to add custom gestures/animations to the Emotive Engine.                
 * ║ This example adds "wobble", "figure8", and "heartbeat" gestures.                  
 * ║ Use this as a template to create your own unique animations!                      
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎬 CUSTOM GESTURES ADDED                                                          
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • wobble    : Side-to-side wobbling motion (like jello)                           
 * │ • figure8   : Traces a figure-8 pattern                                           
 * │ • heartbeat : Double-pulse like a heartbeat                                       
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🔧 HOW TO USE                                                                     
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ import EmotiveMascot from './src/EmotiveMascot.js';                               
 * │ import GesturePlugin from './src/plugins/example-gesture-plugin.js';              
 * │                                                                                    
 * │ const mascot = new EmotiveMascot(canvas);                                         
 * │ mascot.registerPlugin(new GesturePlugin());                                       
 * │                                                                                    
 * │ // Trigger custom gestures!
 * │ mascot.express('wobble');
 * │ mascot.express('figure8');
 * │ mascot.express('heartbeat');                                               
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

class CustomGesturePlugin {
    constructor() {
        this.type = 'gesture';
        this.name = 'CustomGesturePlugin';
        this.version = '1.0.0';
        
        // Define our custom gestures
        this.gestures = {
            wobble: {
                duration: 1000,          // 1 second
                easing: 'easeInOutQuad',
                amplitude: 20,           // Pixels of movement
                frequency: 4,            // Number of wobbles
                axis: 'horizontal',      // Wobble direction
                description: 'Jello-like wobble effect'
            },
            
            figure8: {
                duration: 2000,          // 2 seconds
                easing: 'linear',
                radius: 15,              // Size of the figure-8
                rotationSpeed: 1,        // Full rotation per duration
                description: 'Traces a figure-8 pattern'
            },
            
            heartbeat: {
                duration: 800,           // 0.8 seconds
                easing: 'easeOutQuad',
                firstPulse: 1.15,        // First beat scale
                secondPulse: 1.25,       // Second beat scale
                pauseBetween: 100,       // ms between beats
                description: 'Double pulse like a heartbeat'
            }
        };
        
        // Track active animations
        this.activeAnimations = new Map();
        
        // Track if we're initialized
        this.initialized = false;
    }
    
    /**
     * Initialize the plugin (called when registered)
     * @param {Object} api - Plugin API from PluginSystem
     */
    init(api) {
        this.mascot = api.mascot || api;  // Support both PluginSystem API and direct mascot
        this.initialized = true;

        // Register gestures with the plugin adapter
        this.registerGestures();

    }
    
    /**
     * Register custom gestures with the gesture plugin adapter
     * @private
     */
    registerGestures() {
        // Import the gesture plugin adapter
        const gestureModule = this.mascot.Gestures || window.Gestures;
        if (!gestureModule || !gestureModule.pluginAdapter) {
            return;
        }
        
        const adapter = gestureModule.pluginAdapter;
        
        // Register each gesture properly
        Object.entries(this.gestures).forEach(([name, config]) => {
            const gestureDef = {
                name,
                type: 'blending',
                emoji: this.getGestureEmoji(name),
                description: config.description,
                config,
                apply: (particle, progress, _motion, _dt, _centerX, _centerY) => {
                    // Create a temporary animation state if needed
                    if (!this.activeAnimations.has(name)) {
                        this.startGesture(name, {});
                    }
                    
                    // Update the animation
                    const animation = this.activeAnimations.get(name);
                    if (animation) {
                        animation.progress = progress;
                        
                        switch (name) {
                        case 'wobble':
                            this.applyWobbleToParticle(particle, animation, progress);
                            break;
                        case 'figure8':
                            this.applyFigure8ToParticle(particle, animation, progress);
                            break;
                        case 'heartbeat':
                            this.applyHeartbeatToParticle(particle, animation, progress);
                            break;
                        }
                    }
                },
                cleanup: particle => {
                    // Clean up any gesture-specific data
                    if (particle.gestureData && particle.gestureData[name]) {
                        delete particle.gestureData[name];
                    }
                    this.activeAnimations.delete(name);
                }
            };
            
            adapter.registerPluginGesture(name, gestureDef);
        });
    }
    
    /**
     * Get emoji for gesture
     * @private
     */
    getGestureEmoji(name) {
        const emojis = {
            wobble: '〰️',
            figure8: '♾️',
            heartbeat: '💓'
        };
        return emojis[name] || '🔌';
    }
    
    /**
     * Start a custom gesture animation
     * @private
     */
    startGesture(gestureName, options = {}) {
        const gesture = this.gestures[gestureName];
        const startTime = Date.now();
        
        // Create animation data
        const animation = {
            gesture,
            startTime,
            options,
            progress: 0,
            active: true,
            // Store initial state for relative animations
            initialPosition: {
                x: this.mascot.renderer?.state?.gazeOffset?.x || 0,
                y: this.mascot.renderer?.state?.gazeOffset?.y || 0
            },
            initialScale: this.mascot.renderer?.state?.customScale || 1.0
        };
        
        // Store in active animations
        this.activeAnimations.set(gestureName, animation);
        
    }
    
    /**
     * Update function called every frame
     * @param {number} deltaTime - Time since last frame
     * @param {Object} state - Current mascot state
     */
    update(_deltaTime, _state) {
        // Update all active animations
        this.activeAnimations.forEach((animation, gestureName) => {
            if (!animation.active) {
                this.activeAnimations.delete(gestureName);
                return;
            }
            
            const elapsed = Date.now() - animation.startTime;
            const progress = Math.min(elapsed / animation.gesture.duration, 1);
            animation.progress = progress;
            
            // Apply gesture-specific animations
            switch (gestureName) {
            case 'wobble':
                this.updateWobble(animation, progress);
                break;
            case 'figure8':
                this.updateFigure8(animation, progress);
                break;
            case 'heartbeat':
                this.updateHeartbeat(animation, progress);
                break;
            }
            
            // Mark complete when done
            if (progress >= 1) {
                animation.active = false;
                this.onGestureComplete(gestureName);
            }
        });
    }
    
    /**
     * Apply wobble to individual particle
     * @private
     */
    applyWobbleToParticle(particle, animation, progress) {
        const { amplitude, frequency, axis } = animation.gesture;
        
        // Apply easing
        const easedProgress = this.applyEasing(progress, animation.gesture.easing);
        
        // Calculate wobble offset using sine wave
        const wobbleOffset = Math.sin(easedProgress * Math.PI * 2 * frequency) * 
                            amplitude * (1 - progress); // Decay over time
        
        // Initialize gesture data if needed
        if (!particle.gestureData) particle.gestureData = {};
        if (!particle.gestureData.wobble) {
            particle.gestureData.wobble = {
                originalX: particle.x,
                originalY: particle.y
            };
        }
        
        // Apply offset to particle
        if (axis === 'horizontal') {
            particle.x = particle.gestureData.wobble.originalX + wobbleOffset;
        } else {
            particle.y = particle.gestureData.wobble.originalY + wobbleOffset;
        }
    }
    
    /**
     * Update wobble animation
     * @private
     */
    updateWobble(animation, progress) {
        const { amplitude, frequency, axis } = animation.gesture;
        
        // Apply easing
        const easedProgress = this.applyEasing(progress, animation.gesture.easing);
        
        // Calculate wobble offset using sine wave
        const wobbleOffset = Math.sin(easedProgress * Math.PI * 2 * frequency) * 
                            amplitude * (1 - progress); // Decay over time
        
        // Apply to renderer state
        if (this.mascot.renderer?.state) {
            if (axis === 'horizontal') {
                this.mascot.renderer.state.gazeOffset.x = animation.initialPosition.x + wobbleOffset;
            } else {
                this.mascot.renderer.state.gazeOffset.y = animation.initialPosition.y + wobbleOffset;
            }
        }
    }
    
    /**
     * Apply figure-8 to individual particle
     * @private
     */
    applyFigure8ToParticle(particle, animation, progress) {
        const { radius, rotationSpeed } = animation.gesture;
        
        // Calculate figure-8 position
        const t = progress * Math.PI * 2 * rotationSpeed;
        const x = radius * Math.sin(t);
        const y = radius * Math.sin(t * 2) / 2; // Half height for figure-8 shape
        
        // Initialize gesture data if needed
        if (!particle.gestureData) particle.gestureData = {};
        if (!particle.gestureData.figure8) {
            particle.gestureData.figure8 = {
                originalX: particle.x,
                originalY: particle.y
            };
        }
        
        // Apply offset to particle
        particle.x = particle.gestureData.figure8.originalX + x;
        particle.y = particle.gestureData.figure8.originalY + y;
    }
    
    /**
     * Apply heartbeat to individual particle
     * @private
     */
    applyHeartbeatToParticle(particle, animation, progress) {
        const { firstPulse, secondPulse, pauseBetween, duration } = animation.gesture;
        
        let scale = 1.0;
        const beatDuration = (duration - pauseBetween) / 2;
        const elapsed = progress * duration;
        
        if (elapsed < beatDuration) {
            // First beat
            const beatProgress = elapsed / beatDuration;
            const easedProgress = this.applyEasing(beatProgress, 'easeOutQuad');
            scale = 1.0 + (firstPulse - 1.0) * (1 - Math.abs(easedProgress * 2 - 1));
        } else if (elapsed < beatDuration + pauseBetween) {
            // Pause between beats
            scale = 1.0;
        } else {
            // Second beat
            const beatProgress = (elapsed - beatDuration - pauseBetween) / beatDuration;
            const easedProgress = this.applyEasing(beatProgress, 'easeOutQuad');
            scale = 1.0 + (secondPulse - 1.0) * (1 - Math.abs(easedProgress * 2 - 1));
        }
        
        // Initialize gesture data if needed
        if (!particle.gestureData) particle.gestureData = {};
        if (!particle.gestureData.heartbeat) {
            particle.gestureData.heartbeat = {
                originalSize: particle.size
            };
        }
        
        // Apply scale to particle size
        particle.size = particle.gestureData.heartbeat.originalSize * scale;
    }
    
    /**
     * Update figure-8 animation
     * @private
     */
    updateFigure8(animation, progress) {
        const { radius, rotationSpeed } = animation.gesture;
        
        // Calculate figure-8 position
        const t = progress * Math.PI * 2 * rotationSpeed;
        const x = radius * Math.sin(t);
        const y = radius * Math.sin(t * 2) / 2; // Half height for figure-8 shape
        
        // Apply to renderer state
        if (this.mascot.renderer?.state) {
            this.mascot.renderer.state.gazeOffset.x = animation.initialPosition.x + x;
            this.mascot.renderer.state.gazeOffset.y = animation.initialPosition.y + y;
        }
    }
    
    /**
     * Update heartbeat animation
     * @private
     */
    updateHeartbeat(animation, progress) {
        const { firstPulse, secondPulse, pauseBetween, duration } = animation.gesture;
        
        let scale = animation.initialScale;
        const beatDuration = (duration - pauseBetween) / 2;
        const elapsed = progress * duration;
        
        if (elapsed < beatDuration) {
            // First beat
            const beatProgress = elapsed / beatDuration;
            const easedProgress = this.applyEasing(beatProgress, 'easeOutQuad');
            scale = animation.initialScale + (firstPulse - animation.initialScale) * 
                   (1 - Math.abs(easedProgress * 2 - 1));
        } else if (elapsed < beatDuration + pauseBetween) {
            // Pause between beats
            scale = animation.initialScale;
        } else {
            // Second beat
            const beatProgress = (elapsed - beatDuration - pauseBetween) / beatDuration;
            const easedProgress = this.applyEasing(beatProgress, 'easeOutQuad');
            scale = animation.initialScale + (secondPulse - animation.initialScale) * 
                   (1 - Math.abs(easedProgress * 2 - 1));
        }
        
        // Apply scale to renderer
        if (this.mascot.renderer?.state) {
            this.mascot.renderer.state.customScale = scale;
        }
    }
    
    /**
     * Apply easing function
     * @private
     */
    applyEasing(t, easing) {
        switch (easing) {
        case 'linear':
            return t;
        case 'easeInQuad':
            return t * t;
        case 'easeOutQuad':
            return t * (2 - t);
        case 'easeInOutQuad':
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        default:
            return t;
        }
    }
    
    /**
     * Called when a gesture completes
     * @private
     */
    onGestureComplete(gestureName) {
        
        // Reset any modified states
        if (this.mascot.renderer?.state) {
            // Reset custom scale if it was modified
            if (gestureName === 'heartbeat') {
                this.mascot.renderer.state.customScale = null;
            }
        }
    }
    
    /**
     * Render function for custom rendering (optional)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} state - Current mascot state
     */
    render(ctx, _state) {
        // Add visual indicators for active gestures (optional)
        this.activeAnimations.forEach((animation, gestureName) => {
            if (gestureName === 'figure8' && animation.progress < 1) {
                // Draw a faint trail for figure-8
                this.renderFigure8Trail(ctx, animation);
            }
        });
    }
    
    /**
     * Render figure-8 trail
     * @private
     */
    renderFigure8Trail(ctx, animation) {
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height / 2;
        const { radius } = animation.gesture;
        
        ctx.save();
        ctx.globalAlpha = 0.2 * (1 - animation.progress); // Fade out over time
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        
        // Draw figure-8 path
        ctx.beginPath();
        for (let i = 0; i <= 100; i++) {
            const t = (i / 100) * Math.PI * 2;
            const x = centerX + radius * Math.sin(t);
            const y = centerY + radius * Math.sin(t * 2) / 2;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        
        ctx.restore();
    }
    
    /**
     * Clean up when plugin is unregistered
     */
    destroy() {
        // Clear active animations
        this.activeAnimations.clear();
        
        // Unregister gestures from the plugin adapter
        const gestureModule = this.mascot?.Gestures || window.Gestures;
        if (gestureModule && gestureModule.pluginAdapter) {
            const adapter = gestureModule.pluginAdapter;
            Object.keys(this.gestures).forEach(gestureName => {
                adapter.unregisterPluginGesture(gestureName);
            });
        }
        
        this.initialized = false;
    }
    
    /**
     * Get plugin information
     */
    getInfo() {
        return {
            name: this.name,
            version: this.version,
            type: this.type,
            gestures: Object.keys(this.gestures),
            author: 'Emotive Engine Team',
            description: 'Adds wobble, figure8, and heartbeat gesture animations'
        };
    }
}

export default CustomGesturePlugin;