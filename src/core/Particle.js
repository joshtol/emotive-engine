/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Modular Particle System
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Orchestrator for the modular particle system
 * @author Emotive Engine Team
 * @module core/Particle-modular
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                               MODULAR ARCHITECTURE                                
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ This is a drop-in replacement for the original Particle.js                        
 * ║ Same API, but with modular architecture for easier maintenance                    
 * ║                                                                                    
 * ║ STRUCTURE:                                                                         
 * ║ - Particle class (this file) - orchestrates everything                            
 * ║ - particles/behaviors/* - 15 behavior modules                                     
 * ║ - particles/config/* - configuration constants                                    
 * ║ - particles/utils/* - utility functions                                           
 * ║ - particles/gestures/* - gesture system (coming soon)                             
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

// Import behaviors
import { initializeBehavior, updateBehavior } from './particles/behaviors/index.js';

// Import utilities
import { selectWeightedColor } from './particles/utils/colorUtils.js';

// Import config
import { PHYSICS } from './particles/config/physics.js';

/**
 * Particle class - Individual particle with behavior and rendering
 * 
 * LIFECYCLE:
 * 1. Created by ParticleSystem with position and behavior
 * 2. Initialized with behavior-specific properties
 * 3. Updated each frame (position, behavior, lifecycle)
 * 4. Rendered to canvas
 * 5. Removed when life reaches 0
 */
class Particle {
    /**
     * Creates a new particle with specific behavior and appearance
     * 
     * @param {number} x - Starting X position on canvas
     * @param {number} y - Starting Y position on canvas
     * @param {string} behavior - Behavior type (ambient, rising, falling, etc.)
     * @param {number} scaleFactor - Global scale multiplier (affects size/distance)
     * @param {number} particleSizeMultiplier - Additional size multiplier
     * @param {Array} emotionColors - Array of color options with weights
     */
    constructor(x, y, behavior = 'ambient', scaleFactor = 1, particleSizeMultiplier = 1, emotionColors = null) {
        // Position and movement
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        
        // Lifecycle
        this.life = 0.0; // Start at 0 for fade-in
        this.maxLife = 1.0;
        this.lifeDecay = 0.01; // Life lost per frame
        this.fadeInTime = 0.15; // 15% of life for fade-in
        this.fadeOutTime = 0.3; // Last 30% of life for fade-out
        this.isFadingOut = false; // Track if particle is in fade-out phase
        this.age = 0; // Track particle age for smooth fading
        
        // Visual properties - matching original Emotive scale
        this.scaleFactor = scaleFactor;
        this.particleSizeMultiplier = particleSizeMultiplier;
        this.size = (4 + Math.random() * 6) * scaleFactor * particleSizeMultiplier; // 4-10 pixels scaled
        this.baseSize = this.size;
        this.emotionColors = emotionColors; // Store emotion colors for use in behaviors
        this.color = '#ffffff';
        this.opacity = 1.0;
        
        // Glow properties - 1/3 of particles have glow with varying sizes
        this.hasGlow = Math.random() < 0.333;  // 1/3 chance of glow
        this.glowSizeMultiplier = this.hasGlow ? (1.33 + Math.random() * 0.33) : 0;  // 1.33x to 1.66x particle size
        
        // Cell shading - 1/3 of particles are cell shaded (cartoon style)
        this.isCellShaded = Math.random() < 0.333;  // 1/3 chance of cell shading
        
        // Make particles more ephemeral
        this.baseOpacity = 0.3 + Math.random() * 0.4;  // 30-70% max opacity for ethereal look
        
        // Color caching for performance
        this.cachedColors = new Map(); // Cache RGBA strings
        this.lastColor = null;
        this.lastOpacity = -1;
        
        // Behavior properties
        this.behavior = behavior;
        this.behaviorData = {}; // Behavior-specific data
        
        // Gesture properties for motion system
        this.gestureData = {
            initialX: x,
            initialY: y
        };
        
        // Initialize behavior-specific properties
        initializeBehavior(this, behavior);
    }

    /**
     * Updates particle position and behavior
     * @param {number} deltaTime - Time since last update in milliseconds
     * @param {number} centerX - Center X coordinate for behavior calculations
     * @param {number} centerY - Center Y coordinate for behavior calculations
     * @param {Object} undertoneModifier - Optional undertone modifications
     * @param {Object} gestureMotion - Optional gesture motion to apply
     * @param {number} gestureProgress - Progress of the gesture (0-1)
     */
    update(deltaTime, centerX, centerY, undertoneModifier = null, gestureMotion = null, gestureProgress = 0) {
        // Cap deltaTime to prevent huge jumps
        const cappedDeltaTime = Math.min(deltaTime, 50);
        // Normalize to 60 FPS equivalent for consistent physics
        const dt = cappedDeltaTime / 16.67; // 16.67ms = 60 FPS frame time
        
        // Age the particle for smooth fading
        this.age += deltaTime / 1000; // Convert to seconds
        
        // Update lifecycle
        this.updateLifecycle(dt);
        
        // Apply gesture motion if active
        if (gestureMotion && gestureMotion.isActive) {
            this.applyGestureMotion(gestureMotion, gestureProgress, dt, centerX, centerY);
        }
        
        // Update behavior
        updateBehavior(this, this.behavior, dt, centerX, centerY);
        
        // Apply undertone modifications if provided
        if (undertoneModifier) {
            this.applyUndertone(undertoneModifier, dt);
        }
        
        // Update position based on velocity
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        
        // Apply fade based on lifecycle
        this.updateOpacity();
    }

    /**
     * Update particle lifecycle (life, fade in/out)
     * @param {number} dt - Normalized delta time
     */
    updateLifecycle(dt) {
        // Fade in during first part of life
        if (this.life < this.fadeInTime) {
            this.life = Math.min(this.fadeInTime, this.life + 0.03 * dt);
        } else {
            // Normal life decay
            this.life = Math.max(0, this.life - this.lifeDecay * dt);
        }
        
        // Check if entering fade-out phase
        if (this.life < this.fadeOutTime && !this.isFadingOut) {
            this.isFadingOut = true;
        }
    }

    /**
     * Update particle opacity based on lifecycle
     */
    updateOpacity() {
        let lifeFactor = 1.0;
        
        if (this.life < this.fadeInTime) {
            // Fade in
            lifeFactor = this.life / this.fadeInTime;
        } else if (this.isFadingOut) {
            // Fade out
            lifeFactor = this.life / this.fadeOutTime;
        }
        
        this.opacity = this.baseOpacity * lifeFactor;
    }

    /**
     * Apply undertone modifications
     * @param {Object} undertoneModifier - Undertone settings
     * @param {number} dt - Normalized delta time
     */
    applyUndertone(undertoneModifier, dt) {
        // Apply undertone velocity modifications
        if (undertoneModifier.velocityMultiplier) {
            this.vx *= undertoneModifier.velocityMultiplier;
            this.vy *= undertoneModifier.velocityMultiplier;
        }
        
        // Apply undertone size modifications
        if (undertoneModifier.sizeMultiplier) {
            this.size = this.baseSize * undertoneModifier.sizeMultiplier;
        }
        
        // Apply undertone opacity modifications
        if (undertoneModifier.opacityMultiplier) {
            this.opacity *= undertoneModifier.opacityMultiplier;
        }
    }

    /**
     * Apply gesture motion to particle
     * @param {Object} motion - Gesture motion configuration
     * @param {number} progress - Gesture progress (0-1)
     * @param {number} dt - Normalized delta time
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    applyGestureMotion(motion, progress, dt, centerX, centerY) {
        // Simple implementation for now - will be expanded with gesture system
        const strength = motion.strength || 1;
        
        switch (motion.type) {
            case 'pulse':
                // Particles expand and contract with orb
                const pulseFactor = 1 + Math.sin(progress * Math.PI * 2) * 0.3 * strength;
                const dx = this.x - centerX;
                const dy = this.y - centerY;
                this.x = centerX + dx * pulseFactor;
                this.y = centerY + dy * pulseFactor;
                break;
                
            case 'wave':
                // Particles flow in wave pattern
                const waveOffset = Math.sin(progress * Math.PI * 2 + this.x * 0.01) * 10 * strength;
                this.y += waveOffset * dt * 0.1;
                break;
                
            case 'gather':
                // Particles gather towards center
                if (progress < 0.5) {
                    const gatherStrength = progress * 2 * strength;
                    this.vx += (centerX - this.x) * gatherStrength * 0.001 * dt;
                    this.vy += (centerY - this.y) * gatherStrength * 0.001 * dt;
                }
                break;
        }
    }

    /**
     * Check if particle is out of bounds
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @returns {boolean} True if particle is out of bounds
     */
    isOutOfBounds(width, height) {
        const margin = 50; // Allow some margin for particles to re-enter
        return this.x < -margin || this.x > width + margin || 
               this.y < -margin || this.y > height + margin;
    }

    /**
     * Get cached color string for performance
     * @param {string} hexColor - Hex color code
     * @param {number} opacity - Opacity value (0-1)
     * @returns {string} RGBA color string
     */
    getCachedColor(hexColor, opacity) {
        // Round opacity to reduce cache entries
        const roundedOpacity = Math.round(opacity * 100) / 100;
        const cacheKey = `${hexColor}_${roundedOpacity}`;
        
        if (!this.cachedColors.has(cacheKey)) {
            this.cachedColors.set(cacheKey, this.hexToRgba(hexColor, roundedOpacity));
        }
        
        return this.cachedColors.get(cacheKey);
    }

    /**
     * Convert hex color to RGBA string
     * @param {string} hex - Hex color code
     * @param {number} alpha - Alpha value (0-1)
     * @returns {string} RGBA color string
     */
    hexToRgba(hex, alpha) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return `rgba(255, 255, 255, ${alpha})`;
        
        return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`;
    }

    /**
     * Render the particle to canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} emotionColor - Color to use for rendering
     */
    render(ctx, emotionColor = '#ffffff') {
        if (this.life <= 0) return;
        
        // Validate position values to prevent rendering errors
        if (!isFinite(this.x) || !isFinite(this.y)) {
            return;
        }
        
        // Use sub-pixel accurate coordinates for smooth rendering
        const renderX = this.x;
        const renderY = this.y;
        
        // Ensure size is never negative
        const safeSize = Math.max(0.1, this.size);
        
        // Use the particle's own color if set, otherwise fall back to emotion color
        const particleColor = this.tempColor || this.color || emotionColor;
        
        ctx.save();
        
        if (this.isCellShaded) {
            // Cell shaded style - hard edges, no gradients
            
            // Draw outline (darker color)
            ctx.strokeStyle = this.getCachedColor(particleColor, this.opacity * 0.9);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(renderX, renderY, safeSize, 0, Math.PI * 2);
            ctx.stroke();
            
            // Draw flat color fill with discrete opacity levels
            const discreteOpacity = Math.floor(this.opacity * 3) / 3;
            ctx.fillStyle = this.getCachedColor(particleColor, discreteOpacity * (this.baseOpacity || 0.5) * 0.5);
            ctx.beginPath();
            ctx.arc(renderX, renderY, Math.max(0.1, safeSize - 1), 0, Math.PI * 2);
            ctx.fill();
            
            // Add hard-edged highlight
            if (discreteOpacity > 0.5) {
                ctx.fillStyle = this.getCachedColor('#FFFFFF', 0.3);
                ctx.beginPath();
                ctx.arc(renderX - safeSize * 0.3, renderY - safeSize * 0.3, safeSize * 0.3, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            // Standard gradient style
            
            // Create radial gradient for soft particle
            const gradient = ctx.createRadialGradient(renderX, renderY, 0, renderX, renderY, safeSize);
            
            // Core is full opacity with base opacity applied
            gradient.addColorStop(0, this.getCachedColor(particleColor, this.opacity * (this.baseOpacity || 0.5)));
            // Mid fade
            gradient.addColorStop(0.5, this.getCachedColor(particleColor, this.opacity * (this.baseOpacity || 0.5) * 0.5));
            // Edge is transparent
            gradient.addColorStop(1, this.getCachedColor(particleColor, 0));
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(renderX, renderY, safeSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Add glow effect if enabled
            if (this.hasGlow && this.glowSizeMultiplier > 0) {
                const glowSize = safeSize * this.glowSizeMultiplier;
                const glowGradient = ctx.createRadialGradient(renderX, renderY, safeSize * 0.5, renderX, renderY, glowSize);
                
                glowGradient.addColorStop(0, this.getCachedColor(particleColor, this.opacity * 0.15));
                glowGradient.addColorStop(0.5, this.getCachedColor(particleColor, this.opacity * 0.08));
                glowGradient.addColorStop(1, this.getCachedColor(particleColor, 0));
                
                ctx.fillStyle = glowGradient;
                ctx.beginPath();
                ctx.arc(renderX, renderY, glowSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
    }
}

// Export the Particle class as default
export default Particle;