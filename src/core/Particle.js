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

// Import gesture system
import { applyGestureMotion as applyFullGestureMotion } from './particles/gestures/applyGestureMotion.js';

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
        
        // Universal law: Gestures override state behavior based on their motion type
        const blendingMotionTypes = ['radial', 'oscillate', 'jitter', 'directional', 'burst', 'flicker', 'fade', 'settle', 'hold', 'breathe'];
        // Note: 'drift', 'tilt', 'wave', 'orbital', 'morph', 'jump', 'stretch' are overriding types
        const isGestureOverriding = gestureMotion && gestureProgress > 0 && 
            !blendingMotionTypes.includes(gestureMotion.type);
        
        if (isGestureOverriding) {
            // Gesture completely controls particle - skip normal behavior
            this.applyGestureMotion(gestureMotion, gestureProgress, dt, centerX, centerY);
        } else {
            // Normal behavior update
            updateBehavior(this, this.behavior, dt, centerX, centerY);
            
            // Apply undertone modifications if present
            if (undertoneModifier) {
                this.applyUndertoneModifier(dt, undertoneModifier);
            }
            
            // Apply non-overriding gesture motion if present
            if (gestureMotion && gestureProgress > 0) {
                this.applyGestureMotion(gestureMotion, gestureProgress, dt, centerX, centerY);
            }
        }
        
        // Apply velocity to position (unless gesture is directly controlling position)
        if (!isGestureOverriding) {
            this.x += this.vx * dt;
            this.y += this.vy * dt;
        }
        
        // HARD BOUNDARY CONSTRAINTS - particles NEVER leave canvas
        const canvasWidth = centerX * 2;
        const canvasHeight = centerY * 2;
        const margin = 20;
        
        // Bounce off boundaries
        if (this.x - this.size < margin) {
            this.x = margin + this.size;
            this.vx = Math.abs(this.vx) * 0.5;
        } else if (this.x + this.size > canvasWidth - margin) {
            this.x = canvasWidth - margin - this.size;
            this.vx = -Math.abs(this.vx) * 0.5;
        }
        
        if (this.y - this.size < margin) {
            this.y = margin + this.size;
            this.vy = Math.abs(this.vy) * 0.5;
        } else if (this.y + this.size > canvasHeight - margin) {
            this.y = canvasHeight - margin - this.size;
            this.vy = -Math.abs(this.vy) * 0.5;
        }
        
        // Update age and life (EXACT COPY FROM ORIGINAL)
        this.age += this.lifeDecay * dt;
        
        // Smooth fade-in at birth
        if (this.age < this.fadeInTime) {
            this.life = this.age / this.fadeInTime;
        }
        // Full opacity in middle of life
        else if (this.age < (1.0 - this.fadeOutTime)) {
            this.life = 1.0;
        }
        // Smooth fade-out at death
        else {
            this.life = (1.0 - this.age) / this.fadeOutTime;
            this.isFadingOut = true;
            
            // Dynamic size reduction for popcorn during fade-out
            if (this.behavior === 'popcorn') {
                this.size = this.baseSize * (0.5 + 0.5 * this.life);
            }
        }
        
        this.life = Math.max(0, Math.min(1, this.life));
        
        // Update opacity with easing for extra smoothness
        this.opacity = this.easeInOutCubic(this.life);
        
        // Update size based on life for some behaviors
        if (this.behavior === 'burst' && this.behaviorData && this.life < this.behaviorData.fadeStart) {
            this.size = this.baseSize * (this.life / this.behaviorData.fadeStart);
        }
    }


    /**
     * Apply undertone modifications to particle behavior
     * @param {number} dt - Normalized delta time
     * @param {Object} modifier - Undertone modifier settings
     */
    applyUndertoneModifier(dt, modifier) {
        if (!modifier) return;
        
        const weight = modifier.weight !== undefined ? modifier.weight : 1.0;
        
        // Speed modification
        if (modifier.particleSpeedMult && modifier.particleSpeedMult !== 1.0) {
            if (!this.undertoneData) {
                this.undertoneData = {
                    baseVx: this.vx,
                    baseVy: this.vy,
                    lastSpeedMult: 1.0
                };
            }
            
            const speedMult = 1.0 + (modifier.particleSpeedMult - 1.0) * weight;
            this.vx = this.undertoneData.baseVx * speedMult;
            this.vy = this.undertoneData.baseVy * speedMult;
            
            if (Math.abs(speedMult - this.undertoneData.lastSpeedMult) > 0.5) {
                this.undertoneData.baseVx = this.vx / speedMult;
                this.undertoneData.baseVy = this.vy / speedMult;
            }
            this.undertoneData.lastSpeedMult = speedMult;
        } else if (this.undertoneData) {
            this.vx = this.undertoneData.baseVx;
            this.vy = this.undertoneData.baseVy;
            this.undertoneData = null;
        }
        
        // Size modification
        if (modifier.particleSizeMult) {
            const sizeMult = 1.0 + (modifier.particleSizeMult - 1.0) * weight;
            this.size = this.baseSize * sizeMult;
        }
        
        // Opacity modification
        if (modifier.particleOpacityMult) {
            const opacityMult = 1.0 + (modifier.particleOpacityMult - 1.0) * weight;
            this.opacity *= opacityMult;
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
        // Use the full gesture system from the original
        applyFullGestureMotion(this, dt, motion, progress, centerX, centerY);
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
     * Check if particle is still alive
     * @returns {boolean} True if particle life > 0
     */
    isAlive() {
        return this.life > 0;
    }

    /**
     * Set outward velocity for gesture effects
     * @param {number} angle - Direction angle in radians
     */
    setOutwardVelocity(angle) {
        if (this.behaviorData && this.behaviorData.outwardSpeed !== undefined) {
            const speed = this.behaviorData.outwardSpeed;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed + (this.behaviorData.upwardBias || 0);
        }
    }

    /**
     * Get particle state for debugging
     * @returns {Object} Current particle state
     */
    getState() {
        return {
            position: { x: this.x, y: this.y },
            velocity: { x: this.vx, y: this.vy },
            life: this.life,
            behavior: this.behavior,
            size: this.size,
            opacity: this.opacity
        };
    }


    /**
     * Reset particle for reuse from pool
     * @param {number} x - New X position
     * @param {number} y - New Y position
     * @param {string} behavior - New behavior type
     * @param {number} scaleFactor - Scale factor
     * @param {number} particleSizeMultiplier - Size multiplier
     * @param {Array} emotionColors - Emotion colors
     */
    reset(x, y, behavior = 'ambient', scaleFactor = 1, particleSizeMultiplier = 1, emotionColors = null) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.life = 0.0;  // Start at 0 for fade-in
        this.age = 0;  // Reset age
        this.scaleFactor = scaleFactor;
        this.particleSizeMultiplier = particleSizeMultiplier;
        this.size = (4 + Math.random() * 6) * scaleFactor * particleSizeMultiplier;  // Scaled size
        this.baseSize = this.size;
        this.emotionColors = emotionColors;  // Store emotion colors
        
        // Clear cached colors for reuse
        this.cachedColors.clear();
        this.opacity = 0.0;  // Start invisible
        this.isFadingOut = false;
        this.baseOpacity = 0.3 + Math.random() * 0.4;  // Reset base opacity
        this.color = '#ffffff';  // Reset color to white before reinitializing
        this.behavior = behavior;
        
        // Clear gesture data if it exists
        this.gestureData = {
            initialX: x,
            initialY: y
        };
        
        // Reset behavior data
        if (!this.behaviorData) {
            this.behaviorData = {};
        } else {
            // Clear existing properties
            for (let key in this.behaviorData) {
                delete this.behaviorData[key];
            }
        }
        
        // Reinitialize behavior
        initializeBehavior(this, behavior);
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
     * Cubic ease in/out function for smooth animations
     * @param {number} t - Progress value (0-1)
     * @returns {number} Eased value (0-1)
     */
    easeInOutCubic(t) {
        return t < 0.5 
            ? 4 * t * t * t 
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
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