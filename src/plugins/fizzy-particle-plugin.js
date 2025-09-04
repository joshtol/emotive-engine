/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝                                                                             
 *               ◐ ◑ ◒ ◓  FIZZY PARTICLE PLUGIN  ◓ ◒ ◑ ◐               
 *                                                                                    
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Fizzy Particle Plugin - Carbonated Bubble Effect
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module FizzyParticlePlugin
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a carbonated soda/champagne effect with continuously rising bubbles       
 * ║ that pop randomly on their way up. This plugin can be used with ANY emotion      
 * ║ to add a fizzy, effervescent quality to the particle system.                      
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ ✨ FIZZY PARTICLE BEHAVIOR                                                        
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Continuous stream of bubbles rising from the orb                                
 * │ • Random popping with visual effect                                               
 * │ • Automatic replacement to maintain constant carbonation                          
 * │ • Works independently with any emotion state                                      
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🔧 HOW TO USE                                                                     
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ import EmotiveMascot from './src/EmotiveMascot.js';                               
 * │ import FizzyParticlePlugin from './src/plugins/fizzy-particle-plugin.js';         
 * │                                                                                    
 * │ const mascot = new EmotiveMascot(canvas);                                         
 * │ const fizzyPlugin = new FizzyParticlePlugin();                                    
 * │ mascot.registerPlugin(fizzyPlugin);                                               
 * │                                                                                    
 * │ // Activate fizzy particles with current emotion                                  
 * │ mascot.setEmotion('excited');  // Or any emotion                                  
 * │ fizzyPlugin.activate();         // Start the carbonation!                         
 * │                                                                                    
 * │ // Deactivate when done                                                           
 * │ fizzyPlugin.deactivate();                                                         
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

class FizzyParticlePlugin {
    constructor(options = {}) {
        this.type = 'particle';
        this.name = 'FizzyParticlePlugin';
        this.version = '1.0.0';
        
        // Fizzy configuration (can be overridden via options)
        this.config = {
            spawnRate: options.spawnRate || 30,           // Bubbles per second
            targetParticles: options.targetParticles || 50, // Target number of active bubbles
            bubbleSize: {
                min: options.minSize || 1.5,
                max: options.maxSize || 3.5
            },
            riseSpeed: {
                min: options.minSpeed || 2.5,
                max: options.maxSpeed || 4.0
            },
            popChance: options.popChance || 0.02,         // 2% chance to pop per frame
            columnWidth: options.columnWidth || 8,         // Width of bubble column
            startOffset: options.startOffset || 5,         // Start slightly above orb
            
            // Visual effects
            popSizeMultiplier: 1.5,                       // Size increase when popping
            colors: options.colors || ['#FFFFFF', '#F0F8FF', '#E0FFFF'], // White to light blue
            opacity: {
                min: 0.3,
                max: 0.7
            }
        };
        
        // Track fizzy particles
        this.fizzyParticles = new Map();
        
        // State
        this.active = false;
        this.mascot = null;
        this.lastSpawnTime = 0;
        this.spawnAccumulator = 0;
    }
    
    /**
     * Initialize the plugin (called when registered)
     * @param {EmotiveMascot} mascot - The mascot instance
     */
    init(mascot) {
        this.mascot = mascot;
        console.log(`[${this.name}] Initialized - Ready to add carbonation!`);
        
        // Store original particle system behavior
        this.originalBehavior = null;
    }
    
    /**
     * Activate fizzy particle behavior
     */
    activate() {
        if (!this.mascot) {
            console.error(`[${this.name}] Cannot activate - plugin not initialized`);
            return;
        }
        
        this.active = true;
        this.fizzyParticles.clear();
        this.lastSpawnTime = Date.now();
        this.spawnAccumulator = 0;
        
        console.log(`[${this.name}] Fizzy particles ACTIVATED! 🍾`);
    }
    
    /**
     * Deactivate fizzy particle behavior
     */
    deactivate() {
        this.active = false;
        this.fizzyParticles.clear();
        console.log(`[${this.name}] Fizzy particles deactivated`);
    }
    
    /**
     * Update function called every frame
     * @param {number} deltaTime - Time since last frame in ms
     * @param {Object} state - Current mascot state
     */
    update(deltaTime, state) {
        if (!this.active || !this.mascot) return;
        
        const now = Date.now();
        const dt = deltaTime / 16.67; // Normalize to 60fps
        
        // Get canvas dimensions and center
        const canvas = this.mascot.canvasManager?.canvas || this.mascot.canvas;
        if (!canvas) return;
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Spawn new bubbles to maintain target count
        const particleDeficit = this.config.targetParticles - this.fizzyParticles.size;
        if (particleDeficit > 0) {
            // Accumulate spawn time
            this.spawnAccumulator += (this.config.spawnRate / 60) * dt;
            
            while (this.spawnAccumulator >= 1.0 && this.fizzyParticles.size < this.config.targetParticles) {
                this.spawnBubble(centerX, centerY);
                this.spawnAccumulator -= 1.0;
            }
        }
        
        // Update all bubbles
        const toRemove = [];
        this.fizzyParticles.forEach((bubble, id) => {
            // Update position
            bubble.y += bubble.vy * dt;
            bubble.age += deltaTime;
            
            // Check for popping
            if (!bubble.isPopping && Math.random() < this.config.popChance) {
                bubble.isPopping = true;
                bubble.size *= this.config.popSizeMultiplier;
                bubble.opacity = 1.0;
                bubble.deathTime = now + 50; // Die in 50ms
            }
            
            // Check if bubble should die
            if (bubble.isPopping && now > bubble.deathTime) {
                toRemove.push(id);
                // Immediately spawn replacement
                this.spawnBubble(centerX, centerY);
            }
            // Check if bubble reached top
            else if (bubble.y < -10) {
                toRemove.push(id);
                // Immediately spawn replacement
                this.spawnBubble(centerX, centerY);
            }
            
            // Fade based on height (optional atmospheric effect)
            if (!bubble.isPopping) {
                const heightRatio = (centerY - bubble.y) / centerY;
                bubble.opacity = bubble.baseOpacity * (1 - heightRatio * 0.3);
            }
        });
        
        // Remove dead bubbles
        toRemove.forEach(id => this.fizzyParticles.delete(id));
    }
    
    /**
     * Spawn a new bubble
     * @private
     */
    spawnBubble(centerX, centerY) {
        const bubble = {
            id: Date.now() + Math.random(),
            x: centerX + (Math.random() - 0.5) * this.config.columnWidth,
            y: centerY - this.config.startOffset,
            vy: -(this.config.riseSpeed.min + Math.random() * 
                  (this.config.riseSpeed.max - this.config.riseSpeed.min)),
            size: this.config.bubbleSize.min + 
                  Math.random() * (this.config.bubbleSize.max - this.config.bubbleSize.min),
            color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)],
            baseOpacity: this.config.opacity.min + 
                        Math.random() * (this.config.opacity.max - this.config.opacity.min),
            opacity: 0,
            age: 0,
            isPopping: false,
            deathTime: 0
        };
        
        bubble.opacity = bubble.baseOpacity;
        this.fizzyParticles.set(bubble.id, bubble);
    }
    
    /**
     * Render function for fizzy particles
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} state - Current mascot state
     */
    render(ctx, state) {
        if (!this.active || this.fizzyParticles.size === 0) return;
        
        ctx.save();
        
        // Draw all fizzy bubbles
        this.fizzyParticles.forEach(bubble => {
            ctx.globalAlpha = bubble.opacity;
            ctx.fillStyle = bubble.color;
            
            // Add subtle glow for popping bubbles
            if (bubble.isPopping) {
                ctx.shadowBlur = bubble.size * 2;
                ctx.shadowColor = bubble.color;
            }
            
            // Draw bubble
            ctx.beginPath();
            ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw highlight for 3D effect
            if (!bubble.isPopping) {
                ctx.globalAlpha = bubble.opacity * 0.5;
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(bubble.x - bubble.size * 0.3, 
                       bubble.y - bubble.size * 0.3, 
                       bubble.size * 0.3, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.shadowBlur = 0;
        });
        
        ctx.restore();
    }
    
    /**
     * Clean up when plugin is unregistered
     */
    destroy() {
        this.deactivate();
        this.mascot = null;
        console.log(`[${this.name}] Plugin destroyed`);
    }
    
    /**
     * Get plugin information
     */
    getInfo() {
        return {
            name: this.name,
            version: this.version,
            type: this.type,
            author: 'Emotive Engine Team',
            description: 'Adds carbonated bubble effect that works with any emotion',
            config: this.config
        };
    }
}

export default FizzyParticlePlugin;