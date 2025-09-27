/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Modular Particle System with 3D Depth
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Orchestrator for the modular particle system with z-coordinate depth
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
 * ║ - particles/behaviors/* - behavior modules                                     
 * ║ - particles/config/* - configuration constants                                    
 * ║ - particles/utils/* - utility functions                                           
 * ║ - gestures/* - modular gesture system                                             
 * ║                                                                                    
 * ║ 3D DEPTH SYSTEM:                                                                   
 * ║ - Z-coordinate ranges from -1 (behind orb) to +1 (in front)                       
 * ║ - 1/13 particles spawn in foreground, 12/13 in background                         
 * ║ - Depth affects visual size (20% scaling based on z)                              
 * ║ - Foreground particles spawn with offset to prevent stacking                      
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

// Import behaviors
import { initializeBehavior, updateBehavior } from './particles/behaviors/index.js';

// Import utilities
import { selectWeightedColor } from './particles/utils/colorUtils.js';

// Import config
import { PHYSICS } from './particles/config/physics.js';

// Import gesture system - NOW USING MODULAR GESTURES!
import { 
    applyGestureMotion as applyFullGestureMotion,
    isGestureOverriding,
    isGestureBlending 
} from './gestures/GestureMotion.js';

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
        // Position and movement (now with z-coordinate for depth)
        // 1/13 chance of being in front (z > 0), 12/13 chance of being behind (z < 0)
        const zRoll = Math.random();
        this.z = zRoll < (1/13) ? 0.5 + Math.random() * 0.5 : -1 + Math.random() * 0.9;
        
        // Add spawn offset to prevent stacking
        // Much larger offset for foreground particles to completely avoid visual stacking
        const spawnRadius = this.z > 0 ? (20 + Math.random() * 20) * scaleFactor : 3 * scaleFactor;
        const angle = Math.random() * Math.PI * 2;
        this.x = x + Math.cos(angle) * spawnRadius;
        this.y = y + Math.sin(angle) * spawnRadius;
        this.vx = 0;
        this.vy = 0;
        this.vz = 0; // For future 3D motion effects
        
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
        // Use the modular gesture system to determine gesture behavior
        const gestureIsOverriding = gestureMotion && gestureMotion.type && gestureProgress > 0 && 
            isGestureOverriding(gestureMotion.type);
        
        if (gestureIsOverriding) {
            // Gesture completely controls particle - skip normal behavior
            this.applyGestureMotion(gestureMotion, gestureProgress, dt, centerX, centerY);
        } else if (this.gestureBehavior === 'falling') {
            // Rain gesture is active - use falling behavior instead of normal behavior
            updateBehavior(this, 'falling', dt, centerX, centerY);
        } else if (this.gestureBehavior === 'radiant') {
            // Shimmer gesture is active - use radiant behavior for shimmering effect
            updateBehavior(this, 'radiant', dt, centerX, centerY);
        } else {
            // Normal behavior update
            updateBehavior(this, this.behavior, dt, centerX, centerY);
            
            // Don't apply undertone modifications to particle motion
            // Undertones only affect color saturation and core behaviors
            
            // Apply non-overriding gesture motion if present
            if (gestureMotion && gestureProgress > 0) {
                this.applyGestureMotion(gestureMotion, gestureProgress, dt, centerX, centerY);
            }
        }
        
        // Apply velocity to position (unless gesture is directly controlling position)
        if (!gestureIsOverriding) {
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
     * DEPRECATED - Undertones no longer affect particle motion
     * Kept for compatibility but does nothing
     * @param {number} dt - Normalized delta time
     * @param {Object} modifier - Undertone modifier settings
     */
    applyUndertoneModifier(dt, modifier) {
        // Undertones no longer affect particles
        // They only affect color saturation and core behaviors
        
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
     * Get depth-adjusted size for 3D effect
     * Particles farther away (negative z) appear smaller for depth perception
     * 
     * @returns {number} Adjusted size based on z-depth
     * 
     * DEPTH SCALING:
     * - z = -1.0: 80% size (farthest back)
     * - z =  0.0: 100% size (orb plane)
     * - z = +1.0: 120% size (closest to viewer)
     */
    getDepthAdjustedSize() {
        // Map z from [-1, 1] to scale [0.8, 1.2]
        // Negative z (behind) = smaller, positive z (front) = larger
        const depthScale = 1 + (this.z * 0.2);
        return this.size * depthScale;
    }
    
    /**
     * Get particle state for debugging
     * @returns {Object} Current particle state
     */
    getState() {
        return {
            position: { x: this.x, y: this.y, z: this.z },
            velocity: { x: this.vx, y: this.vy, z: this.vz },
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
        // 1/13 chance of being in front (z > 0), 12/13 chance of being behind (z < 0)
        const zRoll = Math.random();
        this.z = zRoll < (1/13) ? 0.5 + Math.random() * 0.5 : -1 + Math.random() * 0.9;
        
        // Add spawn offset to prevent stacking
        // Much larger offset for foreground particles to completely avoid visual stacking
        const spawnRadius = this.z > 0 ? (20 + Math.random() * 20) * scaleFactor : 3 * scaleFactor;
        const angle = Math.random() * Math.PI * 2;
        this.x = x + Math.cos(angle) * spawnRadius;
        this.y = y + Math.sin(angle) * spawnRadius;
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
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
        this.gestureData = null;
        
        // Reset behavior data
        if (!this.behaviorData) {
            this.behaviorData = {};
        } else {
            // Clear existing properties
            for (const key in this.behaviorData) {
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

                // Make glow visible even when particles are subdued
                // Use a minimum opacity for glow to ensure visibility
                const minGlowOpacity = 0.3; // Minimum glow visibility
                const particleOpacity = Math.max(minGlowOpacity, this.opacity);

                // Scale glow intensity based on glowSizeMultiplier
                // Higher multiplier = more intense glow (especially for gesture effects)
                const glowIntensity = Math.min(1.0, this.glowSizeMultiplier / 3); // More aggressive scaling

                // Create bright, visible glow with minimum opacity thresholds
                glowGradient.addColorStop(0, this.getCachedColor(particleColor, Math.max(0.5, particleOpacity * 0.8) * glowIntensity));
                glowGradient.addColorStop(0.25, this.getCachedColor(particleColor, Math.max(0.3, particleOpacity * 0.6) * glowIntensity));
                glowGradient.addColorStop(0.5, this.getCachedColor(particleColor, Math.max(0.2, particleOpacity * 0.4) * glowIntensity));
                glowGradient.addColorStop(0.75, this.getCachedColor(particleColor, Math.max(0.1, particleOpacity * 0.2) * glowIntensity));
                glowGradient.addColorStop(1, this.getCachedColor(particleColor, 0));

                // Use additive blending for brighter glow effect
                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                ctx.fillStyle = glowGradient;
                ctx.beginPath();
                ctx.arc(renderX, renderY, glowSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
        
        ctx.restore();
    }
}

// Export the Particle class as default
export default Particle;