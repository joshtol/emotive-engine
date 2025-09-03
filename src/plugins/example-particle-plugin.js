/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝                                                                             
 *             ◐ ◑ ◒ ◓  EXAMPLE: CUSTOM PARTICLE PLUGIN  ◓ ◒ ◑ ◐             
 *                                                                                    
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Example Custom Particle Plugin - Create New Particle Effects!
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module ExampleParticlePlugin
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Shows how to add custom particle behaviors to the Emotive Engine.                 
 * ║ This example adds "fireflies", "snow", and "matrix" particle effects.             
 * ║ Use this as a template to create your own particle magic!                         
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ ✨ CUSTOM PARTICLE BEHAVIORS                                                      
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • fireflies : Glowing particles that blink and wander                             
 * │ • snow      : Gentle falling particles with drift                                 
 * │ • matrix    : Digital rain effect with trailing particles                         
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🔧 HOW TO USE                                                                     
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ import EmotiveMascot from './src/EmotiveMascot.js';                               
 * │ import ParticlePlugin from './src/plugins/example-particle-plugin.js';            
 * │                                                                                    
 * │ const mascot = new EmotiveMascot(canvas);                                         
 * │ mascot.registerPlugin(new ParticlePlugin());                                      
 * │                                                                                    
 * │ // Activate custom particle effects!                                              
 * │ mascot.setParticleBehavior('fireflies');                                          
 * │ mascot.setParticleBehavior('snow');                                               
 * │ mascot.setParticleBehavior('matrix');                                             
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

class CustomParticlePlugin {
    constructor() {
        this.type = 'particle';
        this.name = 'CustomParticlePlugin';
        this.version = '1.0.0';
        
        // Define our custom particle behaviors
        this.behaviors = {
            fireflies: {
                // Spawn configuration
                spawnRate: 3,            // Particles per second
                maxParticles: 15,
                spawnPattern: 'random',   // Random positions around orb
                
                // Particle properties
                size: { min: 2, max: 4 },
                lifespan: { min: 3000, max: 6000 }, // 3-6 seconds
                speed: { min: 0.2, max: 0.5 },
                color: ['#FFE74C', '#FFFD82', '#FFF59D'], // Warm yellows
                glow: true,
                blinkRate: 0.5,           // Blinks per second
                
                // Movement
                movementType: 'wander',   // Random wandering
                turbulence: 0.3,          // Movement randomness
                
                description: 'Magical fireflies that blink and wander'
            },
            
            snow: {
                // Spawn configuration
                spawnRate: 10,
                maxParticles: 40,
                spawnPattern: 'top',      // Spawn from top of canvas
                
                // Particle properties
                size: { min: 1, max: 3 },
                lifespan: { min: 5000, max: 8000 },
                speed: { min: 0.3, max: 0.8 },
                color: ['#FFFFFF', '#F0F8FF', '#E6F3FF'],
                opacity: { min: 0.4, max: 0.9 },
                
                // Movement
                movementType: 'fall',     // Falling motion
                drift: 0.2,               // Horizontal drift
                swayAmplitude: 10,        // Pixels of sway
                swayFrequency: 0.5,       // Sway cycles per second
                
                description: 'Gentle falling snow with realistic drift'
            },
            
            matrix: {
                // Spawn configuration
                spawnRate: 20,
                maxParticles: 60,
                spawnPattern: 'grid',     // Spawn in grid pattern
                
                // Particle properties
                size: { min: 1, max: 2 },
                lifespan: { min: 1000, max: 2000 },
                speed: { min: 2, max: 4 },
                color: ['#00FF41', '#00E53A', '#00CC33'], // Matrix green
                opacity: { min: 0.3, max: 1 },
                trail: true,              // Leave trailing effect
                trailLength: 5,
                
                // Movement
                movementType: 'rain',     // Digital rain
                acceleration: 0.1,        // Speed increase over time
                glitchChance: 0.01,       // Chance to glitch per frame
                
                description: 'Digital rain effect like The Matrix'
            }
        };
        
        // Track custom particles
        this.customParticles = new Map();
        
        // Current active behavior
        this.activeBehavior = null;
        
        // Track if we're initialized
        this.initialized = false;
    }
    
    /**
     * Initialize the plugin (called when registered)
     * @param {EmotiveMascot} mascot - The mascot instance
     */
    init(mascot) {
        this.mascot = mascot;
        this.initialized = true;
        
        // Set up custom particle behavior handler
        this.setupParticleBehavior();
        
        console.log(`[${this.name}] Initialized with behaviors:`, Object.keys(this.behaviors));
    }
    
    /**
     * Set up custom particle behavior handling
     * @private
     */
    setupParticleBehavior() {
        // Add method to mascot for setting particle behavior
        this.mascot.setParticleBehavior = (behaviorName) => {
            if (this.behaviors[behaviorName]) {
                this.activeBehavior = behaviorName;
                this.initializeBehavior(behaviorName);
                console.log(`[${this.name}] Activated particle behavior: ${behaviorName}`);
                return true;
            }
            return false;
        };
    }
    
    /**
     * Initialize a particle behavior
     * @private
     */
    initializeBehavior(behaviorName) {
        const behavior = this.behaviors[behaviorName];
        
        // Clear existing custom particles
        this.customParticles.clear();
        
        // Set particle system configuration if available
        if (this.mascot.particleSystem) {
            this.mascot.particleSystem.maxParticles = behavior.maxParticles;
        }
        
        // Initialize spawn timer
        this.lastSpawnTime = Date.now();
        this.spawnInterval = 1000 / behavior.spawnRate;
    }
    
    /**
     * Update function called every frame
     * @param {number} deltaTime - Time since last frame
     * @param {Object} state - Current mascot state
     */
    update(deltaTime, state) {
        if (!this.activeBehavior) return;
        
        const behavior = this.behaviors[this.activeBehavior];
        const now = Date.now();
        
        // Spawn new particles
        if (now - this.lastSpawnTime > this.spawnInterval) {
            this.spawnParticle(behavior);
            this.lastSpawnTime = now;
        }
        
        // Update custom particles
        this.customParticles.forEach((particle, id) => {
            this.updateParticle(particle, behavior, deltaTime);
            
            // Remove dead particles
            if (particle.age > particle.lifespan) {
                this.customParticles.delete(id);
            }
        });
    }
    
    /**
     * Spawn a new particle
     * @private
     */
    spawnParticle(behavior) {
        const canvas = this.mascot.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Determine spawn position based on pattern
        let x, y;
        switch (behavior.spawnPattern) {
            case 'top':
                x = Math.random() * canvas.width;
                y = -10;
                break;
            case 'grid':
                x = Math.floor(Math.random() * 10) * (canvas.width / 10);
                y = -10;
                break;
            case 'random':
            default:
                const angle = Math.random() * Math.PI * 2;
                const radius = 50 + Math.random() * 50;
                x = centerX + Math.cos(angle) * radius;
                y = centerY + Math.sin(angle) * radius;
                break;
        }
        
        // Create particle
        const particle = {
            id: Date.now() + Math.random(),
            x,
            y,
            vx: 0,
            vy: 0,
            size: this.randomRange(behavior.size.min, behavior.size.max),
            color: this.randomChoice(behavior.color),
            opacity: behavior.opacity ? 
                    this.randomRange(behavior.opacity.min, behavior.opacity.max) : 1,
            lifespan: this.randomRange(behavior.lifespan.min, behavior.lifespan.max),
            age: 0,
            speed: this.randomRange(behavior.speed.min, behavior.speed.max),
            
            // Behavior-specific properties
            blinkPhase: Math.random() * Math.PI * 2,
            swayPhase: Math.random() * Math.PI * 2,
            wanderAngle: Math.random() * Math.PI * 2,
            trail: behavior.trail ? [] : null
        };
        
        this.customParticles.set(particle.id, particle);
    }
    
    /**
     * Update a particle
     * @private
     */
    updateParticle(particle, behavior, deltaTime) {
        particle.age += deltaTime;
        
        // Update based on movement type
        switch (behavior.movementType) {
            case 'wander':
                this.updateWanderMovement(particle, behavior);
                break;
            case 'fall':
                this.updateFallMovement(particle, behavior);
                break;
            case 'rain':
                this.updateRainMovement(particle, behavior);
                break;
        }
        
        // Update trail if enabled
        if (particle.trail) {
            particle.trail.push({ x: particle.x, y: particle.y, opacity: particle.opacity });
            if (particle.trail.length > (behavior.trailLength || 5)) {
                particle.trail.shift();
            }
        }
        
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Wrap around screen for some behaviors
        if (behavior.movementType === 'fall' || behavior.movementType === 'rain') {
            if (particle.y > this.mascot.canvas.height + 10) {
                particle.y = -10;
                particle.x = Math.random() * this.mascot.canvas.width;
            }
        }
    }
    
    /**
     * Update wander movement (fireflies)
     * @private
     */
    updateWanderMovement(particle, behavior) {
        // Random direction changes
        particle.wanderAngle += (Math.random() - 0.5) * behavior.turbulence;
        
        particle.vx = Math.cos(particle.wanderAngle) * particle.speed;
        particle.vy = Math.sin(particle.wanderAngle) * particle.speed;
        
        // Boundary avoidance
        const margin = 50;
        const canvas = this.mascot.canvas;
        
        if (particle.x < margin) particle.vx += 0.1;
        if (particle.x > canvas.width - margin) particle.vx -= 0.1;
        if (particle.y < margin) particle.vy += 0.1;
        if (particle.y > canvas.height - margin) particle.vy -= 0.1;
    }
    
    /**
     * Update fall movement (snow)
     * @private
     */
    updateFallMovement(particle, behavior) {
        // Falling with sway
        particle.vy = particle.speed;
        
        particle.swayPhase += behavior.swayFrequency * 0.1;
        particle.vx = Math.sin(particle.swayPhase) * behavior.swayAmplitude * 0.1 + 
                     (Math.random() - 0.5) * behavior.drift;
    }
    
    /**
     * Update rain movement (matrix)
     * @private
     */
    updateRainMovement(particle, behavior) {
        // Accelerating fall
        particle.vy = particle.speed + (particle.age / 1000) * behavior.acceleration;
        particle.vx = 0;
        
        // Random glitch
        if (Math.random() < behavior.glitchChance) {
            particle.x += (Math.random() - 0.5) * 10;
            particle.opacity = Math.random();
        }
    }
    
    /**
     * Render function for custom particles
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} state - Current mascot state
     */
    render(ctx, state) {
        if (!this.activeBehavior) return;
        
        const behavior = this.behaviors[this.activeBehavior];
        
        ctx.save();
        
        this.customParticles.forEach(particle => {
            // Draw trail if enabled
            if (particle.trail) {
                particle.trail.forEach((point, index) => {
                    ctx.globalAlpha = point.opacity * (index / particle.trail.length) * 0.5;
                    ctx.fillStyle = particle.color;
                    ctx.fillRect(point.x, point.y, particle.size, particle.size * 2);
                });
            }
            
            // Set particle style
            ctx.globalAlpha = particle.opacity;
            
            // Apply blinking for fireflies
            if (behavior.blinkRate) {
                particle.blinkPhase += behavior.blinkRate * 0.1;
                ctx.globalAlpha *= (Math.sin(particle.blinkPhase) + 1) / 2;
            }
            
            // Draw particle
            ctx.fillStyle = particle.color;
            
            if (behavior.glow) {
                // Add glow effect
                ctx.shadowBlur = particle.size * 3;
                ctx.shadowColor = particle.color;
            }
            
            if (this.activeBehavior === 'matrix') {
                // Matrix-style rectangular particles
                ctx.fillRect(particle.x, particle.y, particle.size, particle.size * 2);
            } else {
                // Circular particles
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.shadowBlur = 0;
        });
        
        ctx.restore();
    }
    
    /**
     * Utility: Random range
     * @private
     */
    randomRange(min, max) {
        return min + Math.random() * (max - min);
    }
    
    /**
     * Utility: Random choice from array
     * @private
     */
    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    /**
     * Clean up when plugin is unregistered
     */
    destroy() {
        // Clear custom particles
        this.customParticles.clear();
        this.activeBehavior = null;
        
        // Remove added methods
        if (this.mascot) {
            delete this.mascot.setParticleBehavior;
        }
        
        this.initialized = false;
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
            behaviors: Object.keys(this.behaviors),
            author: 'Emotive Engine Team',
            description: 'Adds fireflies, snow, and matrix particle effects'
        };
    }
}

export default CustomParticlePlugin;