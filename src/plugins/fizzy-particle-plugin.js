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
 * @version 2.0.0
 * @module FizzyParticlePlugin
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a carbonated soda/champagne effect with continuously rising bubbles       
 * ║ that pop randomly on their way up. This plugin integrates with the modular       
 * ║ particle system to add a fizzy behavior that works with ANY emotion.              
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ ✨ FIZZY PARTICLE BEHAVIOR                                                        
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Continuous stream of bubbles rising from the orb                                
 * │ • Random popping with visual effect                                               
 * │ • Works as an overlay on any emotion state                                        
 * │ • Integrates seamlessly with the modular particle system                          
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
 * │ mascot.particleSystem.setBehavior('fizzy');  // Use the fizzy behavior!           
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { pluginAdapter } from '../core/particles/behaviors/index.js';
import { selectWeightedColor } from '../utils/colorUtils.js';

class FizzyParticlePlugin {
    constructor(options = {}) {
        this.type = 'particle';
        this.name = 'FizzyParticlePlugin';
        this.version = '2.0.0';
        
        // Fizzy configuration (can be overridden via options)
        this.config = {
            popChance: options.popChance || 0.02,         // 2% chance to pop per frame
            columnWidth: options.columnWidth || 8,         // Width of bubble column
            startOffset: options.startOffset || 5,         // Start slightly above orb
            popSizeMultiplier: options.popSizeMultiplier || 1.5, // Size increase when popping
            colors: options.colors || ['#FFFFFF', '#F0F8FF', '#E0FFFF'], // White to light blue
            ...options
        };
        
        // State
        this.active = false;
        this.mascot = null;
        this.registeredBehaviors = [];
    }
    
    /**
     * Initialize the plugin (called when registered)
     * @param {EmotiveMascot} mascot - The mascot instance
     */
    init(mascot) {
        this.mascot = mascot;
        
        // Register the fizzy behavior with the modular system
        this.registerFizzyBehavior();
        
    }
    
    /**
     * Register the fizzy behavior with the modular particle system
     * @private
     */
    registerFizzyBehavior() {
        const {config} = this;
        
        const fizzyBehavior = {
            name: 'fizzy',
            emoji: '🍾',
            description: 'Carbonated bubbles that rise and pop',
            
            initialize(particle) {
                // Bubbles rise straight up with slight horizontal variation
                particle.vx = (Math.random() - 0.5) * 0.1;
                particle.vy = -(2.5 + Math.random() * 1.5); // Rising speed
                particle.lifeDecay = 0.003; // Medium fade
                
                // Bubble colors
                particle.color = selectWeightedColor(config.colors);
                
                // Small to medium bubble sizes
                particle.size = (1.5 + Math.random() * 2) * particle.scaleFactor * particle.particleSizeMultiplier;
                particle.baseSize = particle.size;
                
                // Subtle glow for bubble effect
                particle.hasGlow = Math.random() < 0.4;
                particle.glowSizeMultiplier = 1.3;
                
                particle.behaviorData = {
                    // Pop mechanics
                    popChance: config.popChance,
                    isPopping: false,
                    popTime: 0,
                    popDuration: 150, // ms
                    
                    // Visual properties
                    opacity: 0.3 + Math.random() * 0.4,
                    wobblePhase: Math.random() * Math.PI * 2,
                    wobbleSpeed: 2 + Math.random() * 2,
                    wobbleAmount: 0.05,
                    
                    // Position tracking
                    columnCenter: particle.x,
                    columnWidth: config.columnWidth
                };
            },
            
            update(particle, dt, centerX, centerY) {
                const data = particle.behaviorData;
                
                // Check for popping
                if (!data.isPopping && Math.random() < data.popChance) {
                    data.isPopping = true;
                    data.popTime = 0;
                    particle.size = particle.baseSize * config.popSizeMultiplier;
                    particle.hasGlow = true;
                    particle.glowSizeMultiplier = 2.0;
                }
                
                if (data.isPopping) {
                    data.popTime += dt * 16.67; // Convert to ms
                    
                    // Expand and fade during pop
                    const popProgress = data.popTime / data.popDuration;
                    particle.size = particle.baseSize * (config.popSizeMultiplier + popProgress * 0.5);
                    particle.life *= 0.9; // Rapid fade
                    
                    // Stop movement when popping
                    particle.vx *= 0.8;
                    particle.vy *= 0.8;
                    
                    // Remove when pop animation complete
                    if (data.popTime >= data.popDuration) {
                        particle.life = 0;
                    }
                } else {
                    // Normal bubble behavior
                    
                    // Gentle wobble as it rises
                    data.wobblePhase += data.wobbleSpeed * 0.1 * dt;
                    const wobble = Math.sin(data.wobblePhase) * data.wobbleAmount;
                    particle.vx = wobble + (data.columnCenter - particle.x) * 0.01;
                    
                    // Accelerate slightly as it rises (buoyancy)
                    particle.vy *= 1.002;
                    
                    // Fade based on height
                    const heightRatio = Math.abs(particle.y - centerY) / centerY;
                    if (heightRatio > 0.5) {
                        particle.life *= 0.98;
                    }
                    
                    // Size variation (breathing effect)
                    const breathe = Math.sin(data.wobblePhase * 0.5) * 0.1;
                    particle.size = particle.baseSize * (1 + breathe);
                }
                
                // Remove if reached top
                if (particle.y < -20) {
                    particle.life = 0;
                }
            }
        };
        
        // Register the behavior
        if (pluginAdapter.registerPluginBehavior('fizzy', fizzyBehavior)) {
            this.registeredBehaviors.push('fizzy');
        }
        
        // Add convenience methods to particle system
        if (this.mascot.particleSystem) {
            // Allow setting behavior through particle system
            if (!this.mascot.particleSystem.setBehavior) {
                this.mascot.particleSystem.setBehavior = behaviorName => {
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
    }
    
    /**
     * Activate fizzy particle behavior
     * Convenience method that switches particle system to fizzy mode
     */
    activate() {
        if (!this.mascot) {
            return;
        }
        
        if (this.mascot.particleSystem && this.mascot.particleSystem.setBehavior) {
            this.mascot.particleSystem.setBehavior('fizzy');
            this.active = true;
        }
    }
    
    /**
     * Deactivate fizzy particle behavior
     * Returns to the emotion's default behavior
     */
    deactivate() {
        if (this.mascot && this.mascot.particleSystem) {
            // Return to default emotion behavior
            const currentEmotion = this.mascot.getEmotion();
            if (currentEmotion) {
                this.mascot.setEmotion(currentEmotion);
            }
        }
        this.active = false;
    }
    
    /**
     * Update function called every frame
     * The modular system handles particle updates automatically
     * @param {number} deltaTime - Time since last frame in ms
     * @param {Object} state - Current mascot state
     */
    update(deltaTime, state) {
        // Particles are updated by the modular system - nothing needed here!
    }
    
    /**
     * Render function for any additional effects
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
        // Unregister our behavior
        this.registeredBehaviors.forEach(behaviorName => {
            pluginAdapter.unregisterPluginBehavior(behaviorName);
        });
        
        this.deactivate();
        this.mascot = null;
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
            description: 'Adds carbonated bubble effect using the modular particle system',
            config: this.config,
            behaviors: this.registeredBehaviors
        };
    }
}

export default FizzyParticlePlugin;