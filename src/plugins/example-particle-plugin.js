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
 * @version 2.0.0
 * @module ExampleParticlePlugin
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Shows how to add custom particle behaviors to the Emotive Engine using the        
 * ║ modular particle system. This example adds "fireflies", "snow", and "matrix"     
 * ║ particle effects that integrate seamlessly with the core behaviors.               
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
 * │ // The plugin registers its behaviors with the modular system                     
 * │ // You can now use them just like core behaviors!                                 
 * │ mascot.particleSystem.setBehavior('fireflies');                                   
 * │ mascot.particleSystem.setBehavior('snow');                                        
 * │ mascot.particleSystem.setBehavior('matrix');                                      
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { pluginAdapter } from '../core/particles/behaviors/index.js';
import { selectWeightedColor } from '../utils/colorUtils.js';

class CustomParticlePlugin {
    constructor() {
        this.type = 'particle';
        this.name = 'CustomParticlePlugin';
        this.version = '2.0.0';
        
        // Track registered behaviors for cleanup
        this.registeredBehaviors = [];
        
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

        // Register our custom behaviors with the modular system
        this.registerBehaviors();

    }
    
    /**
     * Register custom particle behaviors
     * @private
     */
    registerBehaviors() {
        // FIREFLIES BEHAVIOR
        const firefliesBehavior = {
            name: 'fireflies',
            emoji: '✨',
            description: 'Magical fireflies that blink and wander',
            
            initialize(particle) {
                // Gentle random movement
                particle.vx = (Math.random() - 0.5) * 0.3;
                particle.vy = (Math.random() - 0.5) * 0.3;
                particle.lifeDecay = 0.001; // Very slow fade
                
                // Warm yellow colors
                const colors = ['#FFE74C', '#FFFD82', '#FFF59D', '#FFEB3B', '#FFC107'];
                particle.color = selectWeightedColor(colors);
                
                // Small glowing size
                particle.size = (2 + Math.random() * 2) * particle.scaleFactor * particle.particleSizeMultiplier;
                particle.baseSize = particle.size;
                
                // Always have glow
                particle.hasGlow = true;
                particle.glowSizeMultiplier = 2.0;
                
                particle.behaviorData = {
                    wanderAngle: Math.random() * Math.PI * 2,
                    wanderSpeed: 0.2 + Math.random() * 0.3,
                    blinkPhase: Math.random() * Math.PI * 2,
                    blinkRate: 0.5 + Math.random() * 0.5,
                    turbulence: 0.3
                };
            },
            
            update(particle, dt, centerX, centerY) {
                const data = particle.behaviorData;
                
                // Random wandering
                data.wanderAngle += (Math.random() - 0.5) * data.turbulence * dt;
                
                particle.vx = Math.cos(data.wanderAngle) * data.wanderSpeed;
                particle.vy = Math.sin(data.wanderAngle) * data.wanderSpeed;
                
                // Blinking effect
                data.blinkPhase += data.blinkRate * 0.1 * dt;
                const blinkIntensity = (Math.sin(data.blinkPhase) + 1) / 2;
                particle.size = particle.baseSize * (0.5 + blinkIntensity * 0.5);
                
                // Boundary avoidance
                const margin = 50 * particle.scaleFactor;
                const canvas = particle.canvas || { width: 800, height: 600 };
                
                if (particle.x < margin) particle.vx += 0.1 * dt;
                if (particle.x > centerX * 2 - margin) particle.vx -= 0.1 * dt;
                if (particle.y < margin) particle.vy += 0.1 * dt;
                if (particle.y > centerY * 2 - margin) particle.vy -= 0.1 * dt;
            }
        };
        
        // SNOW BEHAVIOR
        const snowBehavior = {
            name: 'snow',
            emoji: '❄️',
            description: 'Gentle falling snow with realistic drift',
            
            initialize(particle) {
                // Start at top, fall downward
                particle.vx = (Math.random() - 0.5) * 0.2;
                particle.vy = 0.3 + Math.random() * 0.5;
                particle.lifeDecay = 0.002;
                
                // White/blue colors
                const colors = ['#FFFFFF', '#F0F8FF', '#E6F3FF', '#DCEEFF', '#C9E4FF'];
                particle.color = selectWeightedColor(colors);
                
                // Various sizes
                particle.size = (1 + Math.random() * 2) * particle.scaleFactor * particle.particleSizeMultiplier;
                particle.baseSize = particle.size;
                
                // Soft glow
                particle.hasGlow = Math.random() < 0.3;
                particle.glowSizeMultiplier = 1.5;
                
                particle.behaviorData = {
                    swayPhase: Math.random() * Math.PI * 2,
                    swayAmplitude: 10 + Math.random() * 10,
                    swayFrequency: 0.5 + Math.random() * 0.5,
                    drift: 0.2,
                    baseVy: particle.vy
                };
            },
            
            update(particle, dt, centerX, centerY) {
                const data = particle.behaviorData;
                
                // Gentle sway while falling
                data.swayPhase += data.swayFrequency * 0.1 * dt;
                particle.vx = Math.sin(data.swayPhase) * data.swayAmplitude * 0.01 + 
                             (Math.random() - 0.5) * data.drift * dt;
                
                // Consistent falling speed
                particle.vy = data.baseVy;
                
                // Reset at top when reaching bottom
                if (particle.y > centerY * 2 + 10) {
                    particle.y = -10;
                    particle.x = Math.random() * centerX * 2;
                    particle.life = 1.0; // Reset opacity
                }
            }
        };
        
        // MATRIX BEHAVIOR
        const matrixBehavior = {
            name: 'matrix',
            emoji: '💻',
            description: 'Digital rain effect like The Matrix',
            
            initialize(particle) {
                // Fast downward movement
                particle.vx = 0;
                particle.vy = 2 + Math.random() * 2;
                particle.lifeDecay = 0.005;
                
                // Matrix green colors
                const colors = ['#00FF41', '#00E53A', '#00CC33', '#00B82D', '#00A527'];
                particle.color = selectWeightedColor(colors);
                
                // Small rectangular particles
                particle.size = (1 + Math.random() * 1) * particle.scaleFactor * particle.particleSizeMultiplier;
                particle.baseSize = particle.size;
                
                // Digital glow
                particle.hasGlow = true;
                particle.glowSizeMultiplier = 1.2;
                
                particle.behaviorData = {
                    acceleration: 0.1,
                    glitchChance: 0.01,
                    trailOpacity: 1.0,
                    columnX: particle.x // Stay in column
                };
            },
            
            update(particle, dt, centerX, centerY) {
                const data = particle.behaviorData;
                
                // Accelerating fall
                particle.vy += data.acceleration * dt;
                
                // Stay in column with occasional glitch
                if (Math.random() < data.glitchChance) {
                    particle.x += (Math.random() - 0.5) * 10;
                } else {
                    particle.x = data.columnX;
                }
                
                // Fade trail effect
                data.trailOpacity *= 0.98;
                
                // Reset at top
                if (particle.y > centerY * 2 + 10) {
                    particle.y = -10;
                    particle.x = Math.floor(Math.random() * 20) * (centerX * 2 / 20);
                    data.columnX = particle.x;
                    particle.vy = 2 + Math.random() * 2;
                    particle.life = 1.0;
                    data.trailOpacity = 1.0;
                }
            }
        };
        
        // Register behaviors with the modular system
        if (pluginAdapter.registerPluginBehavior('fireflies', firefliesBehavior)) {
            this.registeredBehaviors.push('fireflies');
        }
        
        if (pluginAdapter.registerPluginBehavior('snow', snowBehavior)) {
            this.registeredBehaviors.push('snow');
        }
        
        if (pluginAdapter.registerPluginBehavior('matrix', matrixBehavior)) {
            this.registeredBehaviors.push('matrix');
        }
        
        // Add convenience method to particle system
        if (this.mascot.particleSystem) {
            this.mascot.particleSystem.setBehavior = behaviorName => {
                // This will work with both core and plugin behaviors
                if (this.mascot.particleSystem.currentBehavior !== behaviorName) {
                    this.mascot.particleSystem.currentBehavior = behaviorName;
                    // Clear existing particles to apply new behavior
                    this.mascot.particleSystem.particles = [];
                    return true;
                }
                return false;
            };
        }
    }
    
    /**
     * Update function called every frame
     * Plugin behaviors are automatically handled by the modular system
     * @param {number} deltaTime - Time since last frame
     * @param {Object} state - Current mascot state
     */
    update(deltaTime, state) {
        // No need to manually update particles - the modular system handles it!
        // This is where you could add additional plugin logic if needed
    }
    
    /**
     * Render function for any additional visual effects
     * The particles themselves are rendered by the core system
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} state - Current mascot state
     */
    render(ctx, state) {
        // Particles are rendered by the core system
        // Add any additional visual effects here if needed
    }
    
    /**
     * Clean up when plugin is unregistered
     */
    destroy() {
        // Unregister all our behaviors
        this.registeredBehaviors.forEach(behaviorName => {
            pluginAdapter.unregisterPluginBehavior(behaviorName);
        });
        
        // Remove added methods
        if (this.mascot && this.mascot.particleSystem) {
            delete this.mascot.particleSystem.setBehavior;
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
            behaviors: this.registeredBehaviors,
            author: 'Emotive Engine Team',
            description: 'Adds fireflies, snow, and matrix particle effects using the modular system'
        };
    }
}

export default CustomParticlePlugin;