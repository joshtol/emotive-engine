/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝                                                                             
 *                         ◐ ◑ ◒ ◓  PARTICLE  ◓ ◒ ◑ ◐                         
 *                                                                                    
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Particle - Individual Particle Entity with Behavioral Movement
 * @author Emotive Engine Team
 * @version 2.0.0
 * @module Particle
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ The ATOMS of emotion. Each particle is an individual entity with its own          
 * ║ behavior, movement pattern, and lifecycle. Together they create the               
 * ║ emotional atmosphere around the orb through coordinated chaos.                    
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎯 PARTICLE BEHAVIORS (13 Types)                                                  
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • ambient     : Gentle upward drift (neutral state)                               
 * │ • rising      : Buoyant upward movement (joy)                                     
 * │ • falling     : Heavy downward drift (sadness)                                    
 * │ • aggressive  : Sharp, chaotic movement (anger)                                   
 * │ • scattering  : Fleeing from center (fear)                                        
 * │ • burst       : Explosive expansion (surprise, suspicion)                         
 * │ • repelling   : Pushing away from core (disgust)                                  
 * │ • orbiting    : Circular motion around center (love, thinking)                    
 * │ • connecting  : Chaotic with attraction (connection states)                       
 * │ • resting     : Ultra-slow drift (deep relaxation)                                
 * │ • ascending   : Slow rise like incense (zen)                                      
 * │ • erratic     : Nervous, jittery movement (anxiety)                               
 * │ • cautious    : Slow with pauses (suspicion - deprecated)                         
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🌟 PARTICLE PROPERTIES                                                            
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Position (x, y)     : Current location on canvas                                
 * │ • Velocity (vx, vy)   : Movement speed and direction                              
 * │ • Life (0.0 - 1.0)    : Current lifecycle stage                                   
 * │ • Size                : Radius in pixels (4-10 typical)                           
 * │ • Opacity             : Transparency (0.0 - 1.0)                                  
 * │ • Color               : Inherited from emotion                                    
 * │ • Glow                : 33% chance of glow effect                                  
 * │ • Cell Shading        : 33% chance of cartoon style                               
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🔄 LIFECYCLE STAGES                                                               
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ 1. BIRTH    : Fade in (15% of life)                                               
 * │ 2. PRIME    : Full opacity and size                                               
 * │ 3. DECAY    : Fade out (last 30% of life)                                         
 * │ 4. DEATH    : Removed and returned to pool                                        
 * │                                                                                    
 * │ • lifeDecay : Rate of aging (0.001 - 0.02 per frame)                              
 * │ • age       : Current age (0.0 - 1.0)                                             
 * │ • fadeIn    : 15% of lifecycle                                                    
 * │ • fadeOut   : 30% of lifecycle                                                    
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎮 GESTURE RESPONSE                                                               
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ Particles respond to gestures through motion types:                               
 * │ • Overriding  : Gesture completely controls particle (wave, tilt, drift)          
 * │ • Blending    : Gesture adds to existing motion (pulse, shake, bounce)            
 * │ • Special     : Unique effects per gesture (breathe synchronization)              
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ ⚡ PERFORMANCE OPTIMIZATIONS                                                      
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Cached trigonometry    : Pre-calculated sin/cos values                          
 * │ • Object pooling         : Reuse particle instances                               
 * │ • Gradient caching       : Store gradient objects                                 
 * │ • Boundary constraints   : Prevent off-screen calculations                        
 * │ • Frame-independent      : DeltaTime-based movement                               
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

// Cached trigonometric values for performance - using arrays instead of Maps
const CACHE_PRECISION = 100; // Cache values at 0.01 radian intervals
const CACHE_SIZE = 629; // Covers 0 to 2π
const SIN_CACHE = new Float32Array(CACHE_SIZE);
const COS_CACHE = new Float32Array(CACHE_SIZE);

// Pre-populate all angles
for (let i = 0; i < CACHE_SIZE; i++) {
    const angle = i / CACHE_PRECISION;
    SIN_CACHE[i] = Math.sin(angle);
    COS_CACHE[i] = Math.cos(angle);
}

function cachedSin(angle) {
    // Normalize angle to 0-2π range
    const normalized = ((angle % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
    const index = Math.min(Math.round(normalized * CACHE_PRECISION), CACHE_SIZE - 1);
    return SIN_CACHE[index];
}

function cachedCos(angle) {
    // Normalize angle to 0-2π range
    const normalized = ((angle % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
    const index = Math.min(Math.round(normalized * CACHE_PRECISION), CACHE_SIZE - 1);
    return COS_CACHE[index];
}

class Particle {
    constructor(x, y, behavior = 'ambient', scaleFactor = 1, particleSizeMultiplier = 1) {
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
        this.age = 0; // Track particle age for smooth fading
        
        // Visual properties - matching original Emotive scale
        this.scaleFactor = scaleFactor;
        this.particleSizeMultiplier = particleSizeMultiplier;
        this.size = (4 + Math.random() * 6) * scaleFactor * particleSizeMultiplier; // 4-10 pixels scaled
        this.baseSize = this.size;
        this.color = '#ffffff';
        this.opacity = 1.0;
        
        // Glow properties - 1/3 of particles have glow with varying sizes
        this.hasGlow = Math.random() < 0.333;  // 1/3 chance of glow
        this.glowSizeMultiplier = this.hasGlow ? (1.33 + Math.random() * 0.33) : 0;  // 1.33x to 1.66x particle size (2/3 smaller than before)
        
        // Cell shading - 1/3 of particles are cell shaded (cartoon style)
        this.isCellShaded = Math.random() < 0.333;  // 1/3 chance of cell shading
        
        // Make particles more ephemeral
        this.baseOpacity = 0.3 + Math.random() * 0.4;  // 30-70% max opacity for ethereal look
        
        // Gradient caching for performance
        this.cachedGradient = null;
        this.cachedGradientKey = null; // Track gradient state
        
        // Behavior properties
        this.behavior = behavior;
        this.behaviorData = {}; // Behavior-specific data
        
        // Initialize behavior-specific properties
        this.initializeBehavior();
    }

    /**
     * Initialize behavior-specific properties and velocities
     */
    initializeBehavior() {
        switch (this.behavior) {
            case 'ambient':
                this.initializeAmbient();
                break;
            case 'rising':
                this.initializeRising();
                break;
            case 'falling':
                this.initializeFalling();
                break;
            case 'aggressive':
                this.initializeAggressive();
                break;
            case 'scattering':
                this.initializeScattering();
                break;
            case 'burst':
                this.initializeBurst();
                break;
            case 'repelling':
                this.initializeRepelling();
                break;
            case 'orbiting':
                this.initializeOrbiting();
                break;
            case 'connecting':
                this.initializeConnecting();
                break;
            case 'resting':
                this.initializeResting();
                break;
            case 'ascending':
                this.initializeAscending();
                break;
            case 'erratic':
                this.initializeErratic();
                break;
            case 'cautious':
                this.initializeCautious();
                break;
            case 'fizzy':
                this.initializeFizzy();
                break;
            default:
                this.initializeAmbient();
        }
    }

    /**
     * Fizzy behavior - carbonated soda effect
     * Rapid spawning with short life, creating a bubbling effect
     */
    initializeFizzy() {
        // Rapid upward movement like bubbles
        this.vx = (Math.random() - 0.5) * 0.15;  // Slight horizontal wobble
        this.vy = -0.15 - Math.random() * 0.1;   // Fast upward
        
        // For excited emotion, make particles live longer to have more visible at once
        if (this.emotion === 'excited') {
            this.lifeDecay = 0.01;  // Half the decay rate = double the lifetime
            this.size = (3 + Math.random() * 4) * (this.scaleFactor || 1);  // Slightly bigger
        } else {
            this.lifeDecay = 0.02;  // Very short life (about 3 seconds)
            this.size = (2 + Math.random() * 4) * (this.scaleFactor || 1);  // Smaller particles
        }
        
        this.behaviorData = {
            wobbleSpeed: 0.002 + Math.random() * 0.001,  // Rapid wobble
            wobbleAmount: 0.1,                            // Small wobble
            riseAcceleration: -0.0008,                    // Accelerate upward like bubbles
            popChance: this.emotion === 'excited' ? 0.0005 : 0.001  // Less popping when excited
        };
    }

    /**
     * Ambient behavior - gentle outward movement (neutral)
     * Particles emanate from center and drift outward
     */
    initializeAmbient() {
        // Start with gentle upward movement
        this.vx = 0;  // NO horizontal drift
        this.vy = -0.04 - Math.random() * 0.02;  // Slower upward movement
        this.lifeDecay = 0.002;  // Even slower fade - particles last ~8 seconds
        this.behaviorData = {
            // Languid upward drift
            upwardSpeed: 0.0005,      // Very slow continuous upward drift
            waviness: 0,              // NO side-to-side
            friction: 0.998           // Even more gradual slowdown
        };
    }

    /**
     * Rising behavior - upward float with slight drift (joy)
     */
    initializeRising() {
        this.vx = (Math.random() - 0.5) * 0.02;  // Even slower horizontal drift
        this.vy = -0.05 - Math.random() * 0.03;   // Much slower upward movement
        this.lifeDecay = 0.002;                   // Very slow decay
        this.baseOpacity = 0.7 + Math.random() * 0.3;  // More opaque (70-100%)
        this.behaviorData = {
            buoyancy: 0.001,      // Even gentler upward force
            driftAmount: 0.005    // Minimal drift
        };
    }

    /**
     * Falling behavior - downward drift with gravity (sadness)
     */
    initializeFalling() {
        this.vx = (Math.random() - 0.5) * 0.03;   // MUCH slower horizontal drift
        this.vy = 0.05 + Math.random() * 0.05;    // MUCH slower falling
        this.lifeDecay = 0.002;                   // Very slow decay
        this.behaviorData = {
            gravity: 0.002,       // Very gentle gravity
            drag: 0.995           // High drag for slow fall
        };
    }

    /**
     * Aggressive behavior - sharp, fast movements (anger)
     */
    initializeAggressive() {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.lifeDecay = 0.015;
        this.behaviorData = {
            acceleration: 0.05,
            jitter: 0.3,
            speedDecay: 0.95
        };
    }

    /**
     * Scattering behavior - flee from center (fear)
     */
    initializeScattering() {
        // Will be set relative to center in update
        this.vx = 0;
        this.vy = 0;
        this.lifeDecay = 0.008;  // Live longer to spread further
        this.behaviorData = {
            fleeSpeed: 2.0,  // Much faster fleeing
            panicFactor: 1.2,  // More panicked movement
            initialized: false
        };
    }

    /**
     * Burst behavior - sudden expansion from center (surprise)
     */
    initializeBurst() {
        // For suspicion, make burst slower and more controlled
        const isSuspicion = this.emotion === 'suspicion';
        const angle = Math.random() * Math.PI * 2;
        const speed = isSuspicion ? 
            (1.0 + Math.random() * 0.8) :  // Faster burst for suspicion to spread out
            (3.5 + Math.random() * 2.5);   // Much faster burst for surprise
        
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.lifeDecay = isSuspicion ? 0.010 : 0.015;  // Live longer to spread further
        
        // Make suspicion particles more visible
        if (isSuspicion) {
            this.size = (6 + Math.random() * 4) * (this.scaleFactor || 1) * (this.particleSizeMultiplier || 1);
            this.baseSize = this.size;
            this.opacity = 1.0;  // Full opacity for visibility
            this.baseOpacity = this.opacity;
        }
        
        this.behaviorData = {
            initialSpeed: speed,
            expansion: isSuspicion ? 1.02 : 1.05,  // Less expansion for suspicion
            fadeStart: 0.7,
            isSuspicion: isSuspicion
        };
    }

    /**
     * Repelling behavior - push away from core
     */
    initializeRepelling() {
        this.vx = 0;
        this.vy = 0;
        this.lifeDecay = 0.01;
        this.behaviorData = {
            repelStrength: 0.8,
            minDistance: 50,
            initialized: false
        };
    }

    /**
     * Connecting behavior - faster, more chaotic particles (from original Emotive)
     */
    initializeConnecting() {
        // Original Emotive connecting: speed 2-7, higher chaos
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5; // Faster than ambient
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.lifeDecay = 0.012;
        this.behaviorData = {
            // Higher attraction and chaos for connecting state
            attractionForce: 0.008,  // Stronger pull (original)
            chaosFactor: 1.0,        // Higher chaos (original)
            friction: 0.95           // Same friction
        };
    }
    
    /**
     * Resting behavior - ultra-slow outward drift like incense smoke
     */
    initializeResting() {
        // Very slow upward drift ONLY
        this.vx = 0;  // NO horizontal at all
        this.vy = -0.04 - Math.random() * 0.02;  // Slow upward movement only
        this.lifeDecay = 0.002;  // Very slow fade - particles last ~25 seconds
        this.behaviorData = {
            // Ultra-languid upward drift
            upwardSpeed: 0.0005,      // Tiny continuous upward
            waviness: 0,              // NO side-to-side
            friction: 0.999           // Almost no slowdown
        };
    }
    
    /**
     * Orbiting behavior - gentle circular motion (love)
     */
    initializeOrbiting() {
        this.lifeDecay = 0.002;  // Very slow decay for love
        this.behaviorData = {
            angle: Math.random() * Math.PI * 2,
            radius: 40 + Math.random() * 60,
            angularVelocity: 0.003 + Math.random() * 0.005,  // MUCH slower orbit
            radiusOscillation: 0.01,
            centerX: this.x,
            centerY: this.y
        };
    }
    
    
    /**
     * Ascending behavior - slow upward float like incense smoke (zen)
     * Particles rise slowly and steadily with minimal horizontal drift
     */
    initializeAscending() {
        // Very slow, steady upward movement
        this.vx = (Math.random() - 0.5) * 0.02;  // Minimal horizontal drift
        this.vy = -0.03 - Math.random() * 0.02;  // Slow upward movement (0.03-0.05)
        this.lifeDecay = 0.0008;  // Very long-lived particles (30+ seconds)
        
        // Larger, more ethereal particles for zen
        this.size = (6 + Math.random() * 6) * (this.scaleFactor || 1) * (this.particleSizeMultiplier || 1) * 1.33;  // 1.33x larger for zen (reduced from 2x)
        this.baseSize = this.size;
        this.baseOpacity = 0.2 + Math.random() * 0.2;  // Very translucent (20-40%)
        
        this.behaviorData = {
            // Continuous gentle upward drift
            ascensionSpeed: 0.0003,      // Very gentle continuous upward
            waveFactor: 0.5,             // Subtle horizontal wave motion
            waveFrequency: 0.001,        // Very slow wave oscillation
            friction: 0.998,             // Almost no slowdown
            fadeStartDistance: 100       // Start fading after rising 100px
        };
    }
    
    /**
     * Erratic behavior - nervous, jittery movement (nervous undertone)
     */
    initializeErratic() {
        // Random, chaotic initial direction
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.1 + Math.random() * 0.15;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.lifeDecay = 0.004;  // Shorter lived due to nervous energy
        
        this.size = (2 + Math.random() * 4) * (this.scaleFactor || 1) * (this.particleSizeMultiplier || 1);  // Varied sizes scaled
        this.baseSize = this.size;
        this.baseOpacity = 0.4 + Math.random() * 0.3;  // More visible
        
        this.behaviorData = {
            jitterStrength: 0.02,        // Random direction changes
            directionChangeRate: 0.1,    // How often to change direction
            speedVariation: 0.3,         // Speed changes randomly
            spinRate: 0.05 + Math.random() * 0.1  // Particles spin
        };
    }
    
    /**
     * Cautious behavior - slow, careful movement for suspicion
     */
    initializeCautious() {
        // Particles move very slowly and deliberately
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.02 + Math.random() * 0.03; // Very slow: 0.02-0.05 units/frame
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.lifeDecay = 0.001;  // Very long-lived for visibility
        this.life = 1.0;  // Ensure full life
        
        this.size = (4 + Math.random() * 4) * (this.scaleFactor || 1) * (this.particleSizeMultiplier || 1);
        this.baseSize = this.size;
        this.baseOpacity = 0.8 + Math.random() * 0.2;  // Very visible
        this.opacity = this.baseOpacity;
        
        this.behaviorData = {
            pauseTimer: Math.random() * 2,      // Start with random pause offset
            pauseDuration: 0.5 + Math.random() * 0.5,  // Pause for 0.5-1s
            moveDuration: 1 + Math.random() * 0.5,     // Move for 1-1.5s
            isMoving: Math.random() > 0.5,             // Randomly start moving or paused
            moveTimer: 0,
            originalVx: this.vx,
            originalVy: this.vy,
            watchRadius: 50 + Math.random() * 30       // Stay within 50-80 units of core
        };
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
        // Some gestures need complete control, others blend with existing motion
        const blendingMotionTypes = ['radial', 'oscillate', 'jitter', 'directional', 'burst', 'flicker', 'fade', 'settle', 'hold'];
        // Note: 'drift', 'tilt', 'wave' are overriding types (not in blending list)
        const isGestureOverriding = gestureMotion && gestureProgress > 0 && 
            !blendingMotionTypes.includes(gestureMotion.type);
        
        if (isGestureOverriding) {
            // Gesture completely controls particle - skip normal behavior
            this.applyGestureMotion(dt, gestureMotion, gestureProgress, centerX, centerY);
        } else {
            // Normal behavior update
            this.updateBehavior(dt, centerX, centerY);
            
            // Apply undertone modifications if present
            if (undertoneModifier) {
                this.applyUndertoneModifier(dt, undertoneModifier);
            }
            
            // Apply non-overriding gesture motion if present
            if (gestureMotion && gestureProgress > 0) {
                this.applyGestureMotion(dt, gestureMotion, gestureProgress, centerX, centerY);
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
        const margin = 20; // Keep particles away from edges
        
        // Bounce off boundaries
        if (this.x - this.size < margin) {
            this.x = margin + this.size;
            this.vx = Math.abs(this.vx) * 0.5; // Bounce back with dampening
        } else if (this.x + this.size > canvasWidth - margin) {
            this.x = canvasWidth - margin - this.size;
            this.vx = -Math.abs(this.vx) * 0.5; // Bounce back with dampening
        }
        
        if (this.y - this.size < margin) {
            this.y = margin + this.size;
            this.vy = Math.abs(this.vy) * 0.5; // Bounce back with dampening
        } else if (this.y + this.size > canvasHeight - margin) {
            this.y = canvasHeight - margin - this.size;
            this.vy = -Math.abs(this.vy) * 0.5; // Bounce back with dampening
        }
        
        // Update age and life
        // dt is already normalized to 60fps equivalent in the update method
        // lifeDecay is per-frame at 60fps, so just use it directly with normalized dt
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
        }
        
        this.life = Math.max(0, Math.min(1, this.life));
        
        // Update opacity with easing for extra smoothness
        this.opacity = this.easeInOutCubic(this.life);
        
        // Update size based on life for some behaviors
        if (this.behavior === 'burst' && this.life < this.behaviorData.fadeStart) {
            this.size = this.baseSize * (this.life / this.behaviorData.fadeStart);
        }
    }

    /**
     * Updates behavior-specific movement patterns
     * @param {number} dt - Normalized delta time
     * @param {number} centerX - Center X coordinate
     * @param {number} centerY - Center Y coordinate
     */
    updateBehavior(dt, centerX, centerY) {
        switch (this.behavior) {
            case 'ambient':
                this.updateAmbient(dt, centerX, centerY);
                break;
            case 'rising':
                this.updateRising(dt);
                break;
            case 'falling':
                this.updateFalling(dt);
                break;
            case 'aggressive':
                this.updateAggressive(dt);
                break;
            case 'scattering':
                this.updateScattering(dt, centerX, centerY);
                break;
            case 'burst':
                this.updateBurst(dt);
                break;
            case 'repelling':
                this.updateRepelling(dt, centerX, centerY);
                break;
            case 'orbiting':
                this.updateOrbiting(dt, centerX, centerY);
                break;
            case 'connecting':
                this.updateConnecting(dt, centerX, centerY);
                break;
            case 'resting':
                this.updateResting(dt, centerX, centerY);
                break;
            case 'ascending':
                this.updateAscending(dt, centerX, centerY);
                break;
            case 'erratic':
                this.updateErratic(dt);
                break;
            case 'cautious':
                this.updateCautious(dt, centerX, centerY);
                break;
            case 'fizzy':
                this.updateFizzy(dt);
                break;
        }
    }

    /**
     * Update fizzy behavior - carbonated bubble effect
     */
    updateFizzy(dt) {
        const data = this.behaviorData;
        
        // Add wobble for bubble-like movement
        this.vx += Math.sin(this.age * data.wobbleSpeed * 100) * data.wobbleAmount * dt;
        
        // Accelerate upward like rising bubbles
        this.vy += data.riseAcceleration * dt;
        
        // Apply slight friction to horizontal movement
        this.vx *= Math.pow(0.98, dt / 16.67);
        
        // Random chance to "pop" early (sudden death)
        if (Math.random() < data.popChance * dt) {
            this.age = 1.0;  // Instant death
        }
    }

    /**
     * Update ambient behavior - gentle outward emanation
     */
    updateAmbient(dt, centerX, centerY) {
        const data = this.behaviorData;
        
        // Apply friction to y velocity only (frame-rate independent)
        // Use exponential decay: friction^dt where dt is normalized to 60fps
        this.vy *= Math.pow(data.friction, dt);
        
        // Add continuous upward drift
        this.vy -= data.upwardSpeed * dt;
        
        // NO horizontal movement or waviness
        this.vx = 0;
    }

    /**
     * Update rising behavior - upward float with drift
     */
    updateRising(dt) {
        const data = this.behaviorData;
        
        // Add buoyancy (upward force)
        this.vy -= data.buoyancy * dt;
        
        // Add horizontal drift
        this.vx += (Math.random() - 0.5) * data.driftAmount * dt;
        
        // Apply air resistance (frame-independent)
        this.vx *= Math.pow(0.995, dt);
        this.vy *= Math.pow(0.998, dt);
    }

    /**
     * Update falling behavior - downward drift with gravity
     */
    updateFalling(dt) {
        const data = this.behaviorData;
        
        // Apply gravity
        this.vy += data.gravity * dt;
        
        // Apply drag (frame-independent)
        this.vx *= Math.pow(data.drag, dt);
        this.vy *= Math.pow(data.drag, dt);
        
        // Limit terminal velocity
        if (this.vy > 2) {
            this.vy = 2;
        }
    }

    /**
     * Update aggressive behavior - sharp, fast movements
     */
    updateAggressive(dt) {
        const data = this.behaviorData;
        
        // Add jitter to movement
        this.vx += (Math.random() - 0.5) * data.jitter * dt;
        this.vy += (Math.random() - 0.5) * data.jitter * dt;
        
        // Apply speed decay (frame-independent)
        this.vx *= Math.pow(data.speedDecay, dt);
        this.vy *= Math.pow(data.speedDecay, dt);
        
        // Occasionally add burst of acceleration
        // Scale probability with frame time
        if (Math.random() < Math.min(0.05 * dt, 0.5)) {
            const angle = Math.random() * Math.PI * 2;
            this.vx += Math.cos(angle) * data.acceleration;
            this.vy += Math.sin(angle) * data.acceleration;
        }
    }

    /**
     * Update scattering behavior - flee from center
     */
    updateScattering(dt, centerX, centerY) {
        const data = this.behaviorData;
        
        // Initialize flee direction if not done
        if (!data.initialized) {
            const dx = this.x - centerX;
            const dy = this.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                this.vx = (dx / distance) * data.fleeSpeed;
                this.vy = (dy / distance) * data.fleeSpeed;
            } else {
                // If at center, pick random direction
                const angle = Math.random() * Math.PI * 2;
                this.vx = Math.cos(angle) * data.fleeSpeed;
                this.vy = Math.sin(angle) * data.fleeSpeed;
            }
            data.initialized = true;
        }
        
        // Continue fleeing with panic factor
        const dx = this.x - centerX;
        const dy = this.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            const panicForce = data.panicFactor / Math.max(distance, 10);
            this.vx += (dx / distance) * panicForce * dt;
            this.vy += (dy / distance) * panicForce * dt;
        }
        
        // Apply damping (frame-independent)
        this.vx *= Math.pow(0.98, dt);
        this.vy *= Math.pow(0.98, dt);
    }

    /**
     * Update burst behavior - sudden expansion
     */
    updateBurst(dt) {
        const data = this.behaviorData;
        
        // Expand outward with decreasing speed (frame-independent)
        // Suspicion particles slow down quickly to hover nearby
        const friction = data.isSuspicion ? 0.99 : 0.95;
        this.vx *= Math.pow(friction, dt);
        this.vy *= Math.pow(friction, dt);
        
        // For suspicion, add a subtle scanning motion
        if (data.isSuspicion) {
            // Add a very subtle side-to-side drift
            const time = Date.now() * 0.001;
            this.vx += Math.sin(time * 2 + this.id) * 0.01 * dt;
        }
        
        // Scale up size initially
        if (this.life > data.fadeStart) {
            this.size = this.baseSize * data.expansion;
        }
    }

    /**
     * Update repelling behavior - push away from core
     */
    updateRepelling(dt, centerX, centerY) {
        const data = this.behaviorData;
        
        const dx = this.x - centerX;
        const dy = this.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Initialize if too close to center
        if (!data.initialized || distance < data.minDistance) {
            if (distance > 0) {
                const repelForce = data.repelStrength / Math.max(distance, 5);
                this.vx += (dx / distance) * repelForce * dt;
                this.vy += (dy / distance) * repelForce * dt;
            }
            data.initialized = true;
        }
        
        // Apply gentle damping (frame-independent)
        this.vx *= Math.pow(0.99, dt);
        this.vy *= Math.pow(0.99, dt);
    }

    /**
     * Update connecting behavior - like ambient but with more chaos
     */
    updateConnecting(dt, centerX, centerY) {
        const data = this.behaviorData;
        
        // Same as ambient but with higher values from original (frame-independent)
        this.vx *= Math.pow(data.friction, dt);
        this.vy *= Math.pow(data.friction, dt);
        this.vx += (centerX - this.x) * data.attractionForce + (Math.random() - 0.5) * data.chaosFactor;
        this.vy += (centerY - this.y) * data.attractionForce + (Math.random() - 0.5) * data.chaosFactor;
    }
    
    /**
     * Update resting behavior - ultra-slow outward drift
     */
    updateResting(dt, centerX, centerY) {
        const data = this.behaviorData;
        
        // Apply friction to y only (almost none) (frame-independent)
        this.vy *= Math.pow(data.friction, dt);
        
        // Add tiny continuous upward drift
        this.vy -= data.upwardSpeed * dt;
        
        // NO horizontal movement
        this.vx = 0;
    }
    
    /**
     * Update orbiting behavior - circular motion
     */
    updateOrbiting(dt, centerX, centerY) {
        const data = this.behaviorData;
        
        // Update angle
        data.angle += data.angularVelocity * dt;
        
        // Oscillate radius slightly
        const radiusVariation = Math.sin(data.angle * 3) * 5;
        const currentRadius = data.radius + radiusVariation;
        
        // Calculate orbital position
        this.x = centerX + Math.cos(data.angle) * currentRadius;
        this.y = centerY + Math.sin(data.angle) * currentRadius;
        
        // Set velocity for smooth movement
        this.vx = -Math.sin(data.angle) * data.angularVelocity * currentRadius;
        this.vy = Math.cos(data.angle) * data.angularVelocity * currentRadius;
    }
    
    
    /**
     * Update ascending behavior - slow upward float like incense
     */
    updateAscending(dt, centerX, centerY) {
        const data = this.behaviorData;
        
        // Validate data exists
        if (!data) {
            this.initializeAscending();
            return;
        }
        
        // Apply friction to velocities (frame-independent)
        this.vx *= Math.pow(data.friction, dt);
        this.vy *= Math.pow(data.friction, dt);
        
        // Add continuous upward ascension
        this.vy -= data.ascensionSpeed * dt;
        
        // Add subtle wave motion for organic feel
        const waveOffset = Math.sin(this.age * data.waveFrequency * 1000) * data.waveFactor;
        this.vx += waveOffset * 0.001 * dt;
        
        // Track initial Y position for fade calculation
        if (this.initialY === undefined) {
            this.initialY = this.y;
        }
        
        // Calculate distance traveled upward
        const distanceTraveled = this.initialY - this.y;
        
        // Start fading after traveling fadeStartDistance pixels
        if (distanceTraveled > data.fadeStartDistance) {
            const fadeProgress = (distanceTraveled - data.fadeStartDistance) / 100;
            const fadeFactor = Math.max(0, 1 - fadeProgress);
            this.baseOpacity *= 0.995;  // Gradual fade
            
            // Accelerate life decay as particle fades
            if (fadeFactor < 0.5) {
                this.lifeDecay *= 1.02;
            }
        }
        
        // Ensure particle doesn't drift too far horizontally
        if (Math.abs(this.vx) > 0.05) {
            this.vx *= Math.pow(0.95, dt);  // Dampen excessive horizontal movement (frame-independent)
        }
        
        // Cap upward velocity for consistency
        if (this.vy < -0.1) {
            this.vy = -0.1;
        }
    }

    /**
     * Renders the particle to the canvas context
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
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
        
        ctx.save();
        
        if (this.isCellShaded) {
            // Cell shaded style - hard edges, no gradients
            
            // Draw outline (darker color)
            ctx.strokeStyle = this.hexToRgba(emotionColor, this.opacity * 0.9);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(renderX, renderY, safeSize, 0, Math.PI * 2);
            ctx.stroke();
            
            // Draw flat color fill with discrete opacity levels and ephemeral base
            const discreteOpacity = Math.floor(this.opacity * 3) / 3;  // 3 discrete levels: 0, 0.33, 0.66, 1
            ctx.fillStyle = this.hexToRgba(emotionColor, discreteOpacity * (this.baseOpacity || 0.5) * 0.5);
            ctx.beginPath();
            ctx.arc(renderX, renderY, Math.max(0.1, safeSize - 1), 0, Math.PI * 2);
            ctx.fill();
            
            // Add hard-edged highlight
            if (discreteOpacity > 0.5) {
                ctx.fillStyle = this.hexToRgba('#FFFFFF', 0.3);
                ctx.beginPath();
                ctx.arc(renderX - safeSize * 0.3, renderY - safeSize * 0.3, Math.max(0.1, safeSize * 0.3), 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            // Regular smooth style (2/3 of particles)
            
            // Set the fill color once
            ctx.fillStyle = emotionColor;
            
            // Draw glow first if this particle has one
            if (this.hasGlow) {
                const glowRadius = Math.max(0.1, safeSize * this.glowSizeMultiplier);
                
                // Outer glow layer
                ctx.globalAlpha = this.opacity * 0.15;
                ctx.beginPath();
                ctx.arc(renderX, renderY, glowRadius, 0, Math.PI * 2);
                ctx.fill();
                
                // Inner glow layer
                ctx.globalAlpha = this.opacity * 0.25;
                ctx.beginPath();
                ctx.arc(renderX, renderY, glowRadius * 0.6, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Draw the particle core with ephemeral opacity
            ctx.globalAlpha = this.opacity * (this.baseOpacity || 0.5) * 0.6;
            ctx.beginPath();
            ctx.arc(renderX, renderY, safeSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    /**
     * Convert hex to rgba
     */
    hexToRgba(hex, alpha = 1) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`;
        }
        return `rgba(0, 0, 0, ${alpha})`;
    }

    /**
     * Smooth easing function for opacity
     */
    easeInOutCubic(t) {
        return t < 0.5 
            ? 4 * t * t * t 
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    /**
     * Apply gesture motion to particle
     * @param {number} dt - Normalized delta time  
     * @param {Object} motion - Gesture motion settings
     * @param {number} progress - Gesture progress (0-1)
     * @param {number} centerX - Center X coordinate
     * @param {number} centerY - Center Y coordinate
     */
    applyGestureMotion(dt, motion, progress, centerX, centerY) {
        if (!motion || !motion.type) return;
        
        // Stop applying gesture at 100% completion
        if (progress >= 1) return;
        
        // Initialize gesture data on first frame
        if (!this.gestureData) {
            this.gestureData = {
                originalVx: this.vx,
                originalVy: this.vy,
                initialX: this.x,
                initialY: this.y,
                // For orbital motion, calculate starting angle
                startAngle: Math.atan2(this.y - centerY, this.x - centerX),
                startRadius: Math.sqrt(Math.pow(this.x - centerX, 2) + Math.pow(this.y - centerY, 2))
            };
        }
        
        const strength = (motion.strength || 1.0); // Full strength for complete override
        const easeProgress = this.easeInOutCubic(progress);
        
        // Check if this gesture type should completely override behavior
        const overrideBehaviors = ['orbital', 'morph', 'jump'];
        const shouldOverride = overrideBehaviors.includes(motion.type);
        
        switch (motion.type) {
            case 'oscillate': {
                // Vertical or horizontal oscillation (bounce, nod)
                const axis = motion.axis || 'vertical';
                const frequency = motion.frequency || 1;
                const phase = motion.phase || 0;
                const oscillation = Math.sin((easeProgress + phase) * Math.PI * 2 * frequency) * strength;
                
                if (axis === 'vertical') {
                    this.vy += oscillation * 0.5 * dt;
                } else {
                    this.vx += oscillation * 0.5 * dt;
                }
                break;
            }
            
            case 'tilt': {
                // COMPLETE OVERRIDE - Particles come home then tilt with orb
                const frequency = motion.frequency || 2;
                const swayAmount = (motion.swayAmount || 40) * this.scaleFactor;
                const liftAmount = (motion.liftAmount || 25) * this.scaleFactor;
                
                // Initialize tilt data
                if (!this.gestureData.tiltInitialized) {
                    this.gestureData.tiltInitialized = true;
                    this.gestureData.startX = this.x;
                    this.gestureData.startY = this.y;
                    // Store angle from center for tilt motion
                    const dx = this.x - centerX;
                    const dy = this.y - centerY;
                    this.gestureData.tiltAngle = Math.atan2(dy, dx);
                    // Random home position near orb (30-60px from center)
                    this.gestureData.homeRadius = 30 + Math.random() * 30;
                    this.gestureData.tiltRole = Math.random();
                }
                
                // First 30% - particles come home to orb
                // Next 70% - particles tilt with orb
                let targetX, targetY;
                
                if (progress < 0.3) {
                    // Come home phase - rapid gathering near orb
                    const homeProgress = progress / 0.3;
                    const easedHome = this.easeInOutCubic(homeProgress);
                    
                    // Target position near orb
                    const homeX = centerX + Math.cos(this.gestureData.tiltAngle) * this.gestureData.homeRadius;
                    const homeY = centerY + Math.sin(this.gestureData.tiltAngle) * this.gestureData.homeRadius;
                    
                    // Interpolate from start to home
                    targetX = this.gestureData.startX + (homeX - this.gestureData.startX) * easedHome;
                    targetY = this.gestureData.startY + (homeY - this.gestureData.startY) * easedHome;
                    
                    // Fast movement to get home quickly
                    const speed = 0.3;
                    this.x += (targetX - this.x) * speed;
                    this.y += (targetY - this.y) * speed;
                    
                } else {
                    // Tilt phase - particles move with orb tilt
                    const tiltPhase = (progress - 0.3) / 0.7;
                    const t = tiltPhase * Math.PI * frequency;
                    const tiltProgress = Math.sin(t);
                    
                    // Particles sway and lift from their home position
                    const swayAngle = this.gestureData.tiltAngle + (tiltProgress * Math.PI * 0.15);
                    const currentRadius = this.gestureData.homeRadius + Math.abs(tiltProgress) * liftAmount;
                    
                    targetX = centerX + Math.cos(swayAngle) * currentRadius;
                    targetY = centerY + Math.sin(swayAngle) * currentRadius - Math.abs(tiltProgress) * liftAmount * 0.3;
                    
                    // Smooth tilt motion
                    const smoothness = 0.15 + this.gestureData.tiltRole * 0.1;
                    this.x += (targetX - this.x) * smoothness;
                    this.y += (targetY - this.y) * smoothness;
                }
                
                // Set velocity for motion blur
                this.vx = (targetX - this.x) * 0.2;
                this.vy = (targetY - this.y) * 0.2;
                
                // Opacity fades in during gather, pulses during tilt
                const fadeFactor = progress < 0.3 ? 
                    0.3 + (progress / 0.3) * 0.7 : 
                    0.8 + Math.sin(progress * Math.PI * frequency) * 0.2;
                this.opacity = this.baseOpacity * fadeFactor;
                
                // Cleanup
                if (progress >= 0.99) {
                    this.gestureData.tiltInitialized = false;
                }
                break;
            }
            
            case 'orbital': {
                // COMPLETE OVERRIDE - Move particle in a perfect circle
                const rotations = motion.rotations || 1;
                const targetRadius = this.gestureData.startRadius || 80; // Use starting radius
                
                // Calculate the target angle based on progress
                const totalRotation = Math.PI * 2 * rotations;
                const currentAngle = this.gestureData.startAngle + (totalRotation * easeProgress);
                
                // Calculate target position on the circle
                const targetX = centerX + Math.cos(currentAngle) * targetRadius;
                const targetY = centerY + Math.sin(currentAngle) * targetRadius;
                
                // DIRECTLY SET particle position for perfect circular motion
                this.x = targetX;
                this.y = targetY;
                
                // Near the end, prepare for smooth transition
                if (progress > 0.95) {
                    // Gradually reduce velocities for smooth transition
                    const fadeOut = (1 - progress) * 20; // 1 to 0 as we approach completion
                    this.vx *= fadeOut;
                    this.vy *= fadeOut;
                } else {
                    // Set velocity to match circular motion (for smooth visual)
                    const nextAngle = currentAngle + 0.1;
                    const nextX = centerX + Math.cos(nextAngle) * targetRadius;
                    const nextY = centerY + Math.sin(nextAngle) * targetRadius;
                    this.vx = (nextX - targetX) * 0.5;
                    this.vy = (nextY - targetY) * 0.5;
                }
                
                break;
            }
            
            case 'radial': {
                // Expand or contract from center (pulse, expand, contract)
                const direction = motion.direction || 'outward';
                const dx = this.x - centerX;
                const dy = this.y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 1) {
                    const normalX = dx / distance;
                    const normalY = dy / distance;
                    const force = direction === 'outward' ? strength : -strength;
                    
                    // Reduced force multiplier from 0.5 to 0.2 for gentler effect
                    this.vx += normalX * force * 0.2 * dt;
                    this.vy += normalY * force * 0.2 * dt;
                }
                break;
            }
            
            case 'jitter': {
                // Random shaking (shake, vibrate)
                const frequency = motion.frequency || 10;
                const decay = motion.decay ? (1 - easeProgress * 0.5) : 1;
                const jitterStrength = strength * decay;
                
                this.vx += (Math.random() - 0.5) * jitterStrength * dt;
                this.vy += (Math.random() - 0.5) * jitterStrength * dt;
                break;
            }
            
            case 'drift': {
                // COMPLETE OVERRIDE - Particles come home then drift with orb
                const distance = (motion.distance || 60) * this.scaleFactor;
                
                // Initialize drift data
                if (!this.gestureData.driftInitialized) {
                    this.gestureData.driftInitialized = true;
                    this.gestureData.startX = this.x;
                    this.gestureData.startY = this.y;
                    // Store angle from center
                    const dx = this.x - centerX;
                    const dy = this.y - centerY;
                    this.gestureData.driftAngle = Math.atan2(dy, dx);
                    // Random home position near orb (25-50px from center)
                    this.gestureData.homeRadius = 25 + Math.random() * 25;
                    // Slight angle variation for organic drift
                    this.gestureData.angleOffset = (Math.random() - 0.5) * 0.3;
                    this.gestureData.driftRole = Math.random();
                }
                
                let targetX, targetY;
                
                if (progress < 0.25) {
                    // Come home phase - particles quickly gather near orb
                    const homeProgress = progress / 0.25;
                    const easedHome = this.easeInOutCubic(homeProgress);
                    
                    // Home position near orb
                    const homeX = centerX + Math.cos(this.gestureData.driftAngle) * this.gestureData.homeRadius;
                    const homeY = centerY + Math.sin(this.gestureData.driftAngle) * this.gestureData.homeRadius;
                    
                    // Fast interpolation to home
                    targetX = this.gestureData.startX + (homeX - this.gestureData.startX) * easedHome;
                    targetY = this.gestureData.startY + (homeY - this.gestureData.startY) * easedHome;
                    
                    // Rapid movement home
                    const speed = 0.35;
                    this.x += (targetX - this.x) * speed;
                    this.y += (targetY - this.y) * speed;
                    
                } else {
                    // Drift phase - particles drift out and back with orb
                    const driftPhase = (progress - 0.25) / 0.75;
                    
                    // Apply slight role-based delay
                    const adjustedPhase = Math.max(0, driftPhase - this.gestureData.driftRole * 0.1);
                    
                    // Calculate drift distance with return
                    let currentRadius;
                    if (motion.returnToOrigin && adjustedPhase > 0.6) {
                        // Return phase
                        const returnPhase = (adjustedPhase - 0.6) / 0.4;
                        currentRadius = this.gestureData.homeRadius + 
                            Math.cos(returnPhase * Math.PI * 0.5) * distance;
                    } else {
                        // Drift out phase
                        const outPhase = Math.min(1, adjustedPhase / 0.6);
                        currentRadius = this.gestureData.homeRadius + 
                            Math.sin(outPhase * Math.PI * 0.5) * distance;
                    }
                    
                    // Apply angle with slight offset for variety
                    const angle = this.gestureData.driftAngle + this.gestureData.angleOffset;
                    
                    targetX = centerX + Math.cos(angle) * currentRadius;
                    targetY = centerY + Math.sin(angle) * currentRadius;
                    
                    // Smooth drift motion
                    const smoothness = 0.12 + this.gestureData.driftRole * 0.08;
                    this.x += (targetX - this.x) * smoothness;
                    this.y += (targetY - this.y) * smoothness;
                }
                
                // Set velocity for motion blur
                this.vx = (targetX - this.x) * 0.25;
                this.vy = (targetY - this.y) * 0.25;
                
                // Opacity fades in during gather, brightens during drift
                const fadeFactor = progress < 0.25 ? 
                    0.3 + (progress / 0.25) * 0.7 : 
                    0.7 + Math.sin((progress - 0.25) * Math.PI / 0.75) * 0.3;
                this.opacity = this.baseOpacity * fadeFactor;
                
                // Cleanup
                if (progress >= 0.99) {
                    this.gestureData.driftInitialized = false;
                }
                break;
            }
            
            case 'directional': {
                // Move in specific direction (look)
                const angle = (motion.angle || 0) * Math.PI / 180;
                const followGaze = motion.followGaze || false;
                
                if (!followGaze) {
                    this.vx += Math.cos(angle) * strength * 0.3 * dt;
                    this.vy += Math.sin(angle) * strength * 0.3 * dt;
                }
                
                if (motion.returnToOrigin && progress > 0.5) {
                    // Return phase
                    const returnProgress = (progress - 0.5) * 2;
                    const dx = this.gestureData.initialX - this.x;
                    const dy = this.gestureData.initialY - this.y;
                    this.vx += dx * returnProgress * 0.02 * dt;
                    this.vy += dy * returnProgress * 0.02 * dt;
                }
                break;
            }
            
            case 'breathe': {
                // Synchronized breathing motion with the orb
                const breathPhase = motion.breathPhase || 0; // Get breath phase from motion
                
                // Initialize breathe data
                if (!this.gestureData.breatheInitialized) {
                    this.gestureData.breatheInitialized = true;
                    this.gestureData.breatheStartX = this.x;
                    this.gestureData.breatheStartY = this.y;
                    
                    // Store initial distance and angle from center
                    const dx = this.x - centerX;
                    const dy = this.y - centerY;
                    this.gestureData.breatheAngle = Math.atan2(dy, dx);
                    this.gestureData.breatheBaseRadius = Math.sqrt(dx * dx + dy * dy);
                    
                    // Add slight phase offset for organic motion
                    this.gestureData.breathePhaseOffset = Math.random() * 0.2 - 0.1;
                }
                
                // Calculate target radius based on breath phase
                const inhaleRadius = (motion.inhaleRadius || 1.5) * this.orbRadius;
                const exhaleRadius = (motion.exhaleRadius || 0.3) * this.orbRadius;
                const targetRadius = exhaleRadius + (inhaleRadius - exhaleRadius) * breathPhase;
                
                // Current position relative to center
                const currentDx = this.x - centerX;
                const currentDy = this.y - centerY;
                const currentRadius = Math.sqrt(currentDx * currentDx + currentDy * currentDy);
                
                // Smoothly move towards target radius
                const radiusDiff = targetRadius - currentRadius;
                const moveStrength = (motion.strength || 0.8) * 0.05 * dt;
                
                // Apply radial motion
                if (currentRadius > 0) {
                    const moveX = (currentDx / currentRadius) * radiusDiff * moveStrength;
                    const moveY = (currentDy / currentRadius) * radiusDiff * moveStrength;
                    
                    this.vx += moveX;
                    this.vy += moveY;
                    
                    // Add gentle spiral motion for more organic feel
                    const spiralStrength = 0.002 * dt * motion.strength;
                    const tangentX = -currentDy / currentRadius;
                    const tangentY = currentDx / currentRadius;
                    
                    this.vx += tangentX * spiralStrength * breathPhase;
                    this.vy += tangentY * spiralStrength * breathPhase;
                }
                
                // Apply gentle damping for smooth motion
                this.vx *= 0.98;
                this.vy *= 0.98;
                
                break;
            }
            
            case 'wave': {
                // COMPLETE OVERRIDE - Magical flowing wave with particles tracing infinity symbol
                const amplitude = (motion.amplitude || 50) * this.scaleFactor;
                
                // Initialize wave data
                if (!this.gestureData.waveInitialized) {
                    this.gestureData.waveInitialized = true;
                    this.gestureData.waveStartX = this.x;
                    this.gestureData.waveStartY = this.y;
                    
                    // Calculate particle's angle from center for unique flow pattern
                    const dx = this.x - centerX;
                    const dy = this.y - centerY;
                    this.gestureData.waveAngle = Math.atan2(dy, dx);
                    this.gestureData.waveRadius = Math.sqrt(dx * dx + dy * dy);
                    
                    // Random offset for organic variation (0 to 2π)
                    this.gestureData.waveOffset = Math.random() * Math.PI * 2;
                    
                    // Particle "role" in the wave (some lead, some follow)
                    this.gestureData.waveRole = Math.random();
                }
                
                // Create a flowing infinity pattern with particle-specific timing
                // Leading particles (role < 0.3) move ahead, trailing particles follow
                const phaseShift = this.gestureData.waveRole * 0.3; // Up to 30% phase shift
                const t = (easeProgress - phaseShift) * Math.PI * 2;
                
                // Infinity symbol with varying radius based on particle's starting position
                const radiusFactor = 0.5 + (this.gestureData.waveRadius / 100) * 0.5; // Scale based on distance
                
                // Create flowing infinity motion
                const infinityX = Math.sin(t + this.gestureData.waveOffset) * amplitude * radiusFactor;
                const infinityY = Math.sin(t * 2 + this.gestureData.waveOffset) * amplitude * 0.3 * radiusFactor;
                
                // Add a "lift" effect - particles rise slightly during the wave
                const lift = -Math.abs(Math.sin(easeProgress * Math.PI)) * 20;
                
                // Calculate target position
                const targetX = centerX + infinityX;
                const targetY = centerY + infinityY + lift;
                
                // Smooth interpolation with role-based speed
                // Leading particles move faster, trailing particles are smoother
                const smoothness = 0.08 + this.gestureData.waveRole * 0.12; // 0.08 to 0.20
                
                this.x += (targetX - this.x) * smoothness;
                this.y += (targetY - this.y) * smoothness;
                
                // Set velocity for natural motion blur effect
                this.vx = (targetX - this.x) * 0.3;
                this.vy = (targetY - this.y) * 0.3;
                
                // Fade particles in and out for magical effect
                const fadeFactor = Math.sin(easeProgress * Math.PI);
                this.opacity = this.baseOpacity * (0.5 + fadeFactor * 0.5);
                
                // Cleanup wave data (velocity reset handled universally)
                if (progress >= 0.99) {
                    this.gestureData.waveInitialized = false;
                    this.gestureData.waveStartX = null;
                    this.gestureData.waveStartY = null;
                }
                break;
            }
            
            case 'burst': {
                // Explosive outward motion (flash)
                const decay = motion.decay || 0.5;
                const burstStrength = strength * (1 - easeProgress * decay);
                const dx = this.x - centerX;
                const dy = this.y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 1) {
                    this.vx += (dx / distance) * burstStrength * 2 * dt;
                    this.vy += (dy / distance) * burstStrength * 2 * dt;
                }
                break;
            }
            
            case 'morph': {
                // COMPLETE OVERRIDE - Form geometric patterns
                const pattern = motion.pattern || 'circle';
                
                // Initialize target position on first frame
                if (!this.gestureData.morphTarget) {
                    const angle = Math.atan2(this.y - centerY, this.x - centerX);
                    
                    if (pattern === 'star') {
                        const points = motion.points || 5;
                        const armAngle = (Math.PI * 2) / points;
                        const nearestArm = Math.round(angle / armAngle) * armAngle;
                        const armIndex = Math.round(angle / armAngle);
                        const isOuter = armIndex % 2 === 0;
                        const radius = isOuter ? (80 + Math.random() * 20) : (30 + Math.random() * 10);
                        
                        this.gestureData.morphTarget = {
                            x: centerX + Math.cos(nearestArm) * radius,
                            y: centerY + Math.sin(nearestArm) * radius
                        };
                    } else {
                        // Circle pattern
                        const targetRadius = 60 + Math.random() * 20;
                        this.gestureData.morphTarget = {
                            x: centerX + Math.cos(angle) * targetRadius,
                            y: centerY + Math.sin(angle) * targetRadius
                        };
                    }
                }
                
                // Interpolate position to target
                const targetX = this.gestureData.initialX + (this.gestureData.morphTarget.x - this.gestureData.initialX) * easeProgress;
                const targetY = this.gestureData.initialY + (this.gestureData.morphTarget.y - this.gestureData.initialY) * easeProgress;
                
                // DIRECTLY SET position
                this.x = targetX;
                this.y = targetY;
                
                // Set velocity for visual continuity
                this.vx = (targetX - this.x) * 0.1;
                this.vy = (targetY - this.y) * 0.1;
                
                // Blend back to original behavior at the end
                if (progress > 0.9) {
                    const blendFactor = (1 - progress) * 10;
                    this.vx = this.vx * blendFactor + this.gestureData.originalVx * (1 - blendFactor);
                    this.vy = this.vy * blendFactor + this.gestureData.originalVy * (1 - blendFactor);
                }
                break;
            }
            
            case 'stretch': {
                // COMPLETE OVERRIDE - Stretch particles along axes with direct position control
                const scaleX = motion.scaleX || 1;
                const scaleY = motion.scaleY || 1;
                
                // Initialize starting position relative to center
                if (!this.gestureData.stretchStartDX) {
                    this.gestureData.stretchStartDX = this.x - centerX;
                    this.gestureData.stretchStartDY = this.y - centerY;
                }
                
                // Apply stretch transformation with smooth easing
                const stretchX = 1 + (scaleX - 1) * strength * easeProgress;
                const stretchY = 1 + (scaleY - 1) * strength * easeProgress;
                
                // Set position directly based on stretched coordinates
                this.x = centerX + this.gestureData.stretchStartDX * stretchX;
                this.y = centerY + this.gestureData.stretchStartDY * stretchY;
                
                // Add velocity for smooth motion
                this.vx = this.gestureData.stretchStartDX * (scaleX - 1) * strength * 0.1;
                this.vy = this.gestureData.stretchStartDY * (scaleY - 1) * strength * 0.1;
                
                // Cleanup stretch data (velocity reset handled universally)
                if (progress >= 0.99) {
                    this.gestureData.stretchStartDX = null;
                    this.gestureData.stretchStartDY = null;
                }
                break;
            }
            
            case 'jump': {
                // Jump motion that completely overrides particle behavior
                const jumpHeight = (motion.jumpHeight || 80) * this.scaleFactor;
                const squash = motion.squash || 0.7;
                const stretch = motion.stretch || 1.3;
                
                // Store initial position if not set
                if (!this.jumpStartY) {
                    this.jumpStartY = this.y;
                    this.jumpStartX = this.x;
                }
                
                if (progress < 0.2) {
                    // Squash phase - particles gather and compress
                    const squashProgress = progress / 0.2;
                    this.size = this.baseSize * (1 - (1 - squash) * squashProgress);
                    
                    // Particles stay in place or slightly sink
                    this.y = this.jumpStartY + squashProgress * 5;
                    this.vx = 0;
                    this.vy = 0;
                    
                } else if (progress < 0.8) {
                    // Jump phase - particles jump up and down
                    const jumpProgress = (progress - 0.2) / 0.6;
                    const jumpCurve = Math.sin(jumpProgress * Math.PI);
                    
                    // Direct position control for consistent jump
                    this.y = this.jumpStartY - jumpCurve * jumpHeight;
                    
                    // Add slight horizontal drift for natural motion
                    const driftAmount = (this.jumpStartX - centerX) * 0.1;
                    this.x = this.jumpStartX + jumpCurve * driftAmount;
                    
                    // Stretch during ascent, compress during descent
                    if (jumpProgress < 0.5) {
                        this.size = this.baseSize * (squash + (stretch - squash) * (jumpProgress * 2));
                    } else {
                        this.size = this.baseSize * (stretch - (stretch - 1) * ((jumpProgress - 0.5) * 2));
                    }
                    
                    // Set velocity for smooth transition at end
                    this.vx = driftAmount * 0.01;
                    this.vy = (this.y - this.jumpStartY) * 0.01;
                    
                } else {
                    // Landing phase - bounce and settle
                    const landProgress = (progress - 0.8) / 0.2;
                    const bounce = Math.abs(Math.sin(landProgress * Math.PI * 2)) * (1 - landProgress);
                    
                    this.y = this.jumpStartY - bounce * 10;
                    this.size = this.baseSize * (1 + bounce * 0.1);
                    
                    // Cleanup jump data (velocity reset handled universally)
                    if (progress >= 0.95) {
                        // Reset for next jump
                        this.jumpStartY = undefined;
                        this.jumpStartX = undefined;
                    }
                }
                
                // Apply position updates directly since we're overriding
                // The main update loop will skip position updates when overriding
                break;
            }
            
            case 'settle': {
                // Settling motion with decay
                const decay = motion.decay || 0.9;
                const wobbleFreq = motion.wobbleFreq || 3;
                const settleStrength = strength * Math.pow(decay, easeProgress * 10);
                const wobble = Math.sin(easeProgress * Math.PI * 2 * wobbleFreq) * settleStrength;
                
                this.vx += wobble * 0.3 * dt;
                this.vy -= settleStrength * 0.2 * dt; // Slight downward settle
                break;
            }
            
            case 'fade': {
                // Fade effect (slowBlink)
                const holdDuration = motion.holdDuration || 0;
                // This affects opacity rather than movement
                if (progress < 0.3) {
                    this.opacity *= (1 - progress / 0.3) * strength;
                } else if (progress > 0.7) {
                    this.opacity *= ((progress - 0.7) / 0.3) * strength;
                } else {
                    this.opacity *= (1 - strength);
                }
                break;
            }
            
            case 'hold': {
                // Minimal movement (breathHold)
                const slight = motion.slight || false;
                const tight = motion.tight || false;
                
                if (slight) {
                    // Very slight breathing motion
                    const breathe = Math.sin(easeProgress * Math.PI * 4) * 0.1;
                    this.vx *= (1 - strength * 0.5);
                    this.vy *= (1 - strength * 0.5);
                    this.vy += breathe * strength * 0.01 * dt;
                } else if (tight) {
                    // Almost frozen
                    this.vx *= (1 - strength * 0.8);
                    this.vy *= (1 - strength * 0.8);
                }
                break;
            }
            
            case 'flicker': {
                // Flickering motion and opacity
                const frequency = motion.frequency || 6;
                const flicker = Math.random() < (frequency / 10);
                if (flicker) {
                    this.opacity *= (0.3 + Math.random() * 0.7);
                    this.vx += (Math.random() - 0.5) * strength * 0.5 * dt;
                    this.vy += (Math.random() - 0.5) * strength * 0.5 * dt;
                }
                break;
            }
        }
        
        // Reset gesture data when gesture completes
        if (progress >= 1) {
            this.gestureData = null;
        }
    }
    
    /**
     * Apply undertone modifications to particle behavior
     * @param {number} dt - Normalized delta time
     * @param {Object} modifier - Undertone modifier settings
     */
    applyUndertoneModifier(dt, modifier) {
        
        // Speed modification
        if (modifier.particleSpeedMult && modifier.particleSpeedMult !== 1.0) {
            this.vx *= modifier.particleSpeedMult;
            this.vy *= modifier.particleSpeedMult;
        }
        
        // Particle burst for confident undertone
        if (modifier.particleBurst) {
            if (!this.burstData) {
                this.burstData = {
                    timer: Math.random() * 200, // Random start
                    active: false,
                    duration: 0
                };
            }
            
            this.burstData.timer -= dt;
            if (this.burstData.timer <= 0 && !this.burstData.active) {
                // Trigger burst
                this.burstData.active = true;
                this.burstData.duration = 30; // Half second burst
                this.burstData.timer = 200 + Math.random() * 100; // Next in 3-5 seconds at 60fps
            }
            
            if (this.burstData.active) {
                // Speed boost during burst
                this.vx *= 1.5;
                this.vy *= 1.5;
                this.burstData.duration -= dt;
                if (this.burstData.duration <= 0) {
                    this.burstData.active = false;
                }
            }
        }
        
        // Particle slowdown for tired undertone
        if (modifier.particleSlowdown) {
            if (!this.slowdownData) {
                this.slowdownData = {
                    timer: 100 + Math.random() * 200, // Start between 1.5-5 seconds
                    active: false,
                    duration: 0,
                    originalVx: this.vx,
                    originalVy: this.vy
                };
            }
            
            this.slowdownData.timer -= dt;
            if (this.slowdownData.timer <= 0 && !this.slowdownData.active) {
                // Trigger slowdown
                this.slowdownData.active = true;
                this.slowdownData.duration = 60 + Math.random() * 60; // 1-2 seconds
                this.slowdownData.originalVx = this.vx;
                this.slowdownData.originalVy = this.vy;
                this.slowdownData.timer = 300 + Math.random() * 200; // Next in 5-8 seconds
            }
            
            if (this.slowdownData.active) {
                // Nearly stop
                const slowFactor = 0.1;
                this.vx = this.slowdownData.originalVx * slowFactor;
                this.vy = this.slowdownData.originalVy * slowFactor;
                this.slowdownData.duration -= dt;
                if (this.slowdownData.duration <= 0) {
                    this.slowdownData.active = false;
                    // Resume normal speed
                    this.vx = this.slowdownData.originalVx;
                    this.vy = this.slowdownData.originalVy;
                }
            }
        }
        
        // Particle spiral for intense undertone
        if (modifier.particleSpiral) {
            if (!this.spiralData) {
                this.spiralData = {
                    timer: 180 + Math.random() * 180, // 3-6 seconds
                    active: false,
                    duration: 0,
                    angle: 0
                };
            }
            
            this.spiralData.timer -= dt;
            if (this.spiralData.timer <= 0 && !this.spiralData.active) {
                this.spiralData.active = true;
                this.spiralData.duration = 20 + Math.random() * 20; // 0.3-0.6 seconds
                this.spiralData.angle = 0;
                this.spiralData.timer = 180 + Math.random() * 180;
            }
            
            if (this.spiralData.active) {
                // Tight spiral
                this.spiralData.angle += 0.5 * dt;
                const spiralRadius = 0.05;
                this.vx += Math.cos(this.spiralData.angle) * spiralRadius * dt;
                this.vy += Math.sin(this.spiralData.angle) * spiralRadius * dt;
                this.spiralData.duration -= dt;
                if (this.spiralData.duration <= 0) {
                    this.spiralData.active = false;
                }
            }
        }
        
        // Particle pull inward for subdued undertone
        if (modifier.particlePullInward) {
            if (!this.pullData) {
                this.pullData = {
                    timer: 240 + Math.random() * 180, // 4-7 seconds
                    active: false,
                    duration: 0
                };
            }
            
            this.pullData.timer -= dt;
            if (this.pullData.timer <= 0 && !this.pullData.active) {
                this.pullData.active = true;
                this.pullData.duration = 120 + Math.random() * 60; // 2-3 seconds
                this.pullData.timer = 240 + Math.random() * 180;
            }
            
            if (this.pullData.active) {
                // Gentle pull toward center (assuming center is at origin in particle space)
                const pullStrength = 0.001;
                const dx = -this.x * pullStrength;
                const dy = -this.y * pullStrength;
                this.vx += dx * dt;
                this.vy += dy * dt;
                this.pullData.duration -= dt;
                if (this.pullData.duration <= 0) {
                    this.pullData.active = false;
                }
            }
        }
        
        // Add wobble for nervous undertone
        if (modifier.particleWobble) {
            // Initialize wobble data if not present
            if (!this.wobbleData) {
                this.wobbleData = {
                    phase: Math.random() * Math.PI * 2,
                    frequency: 0.1 + Math.random() * 0.05, // 0.1-0.15 oscillations per frame
                    amplitude: 0.02 + Math.random() * 0.01, // Small amplitude
                    spiralPhase: 0,
                    spiralActive: false,
                    spiralTimer: Math.random() * 100 // Random start for spiral trigger
                };
            }
            
            // Update wobble phase
            this.wobbleData.phase += this.wobbleData.frequency * dt;
            
            // Add perpendicular wobble to current velocity
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (speed > 0.01) { // Only wobble if moving
                // Get perpendicular direction
                const perpX = -this.vy / speed;
                const perpY = this.vx / speed;
                
                // Apply sine wave wobble
                const wobbleStrength = Math.sin(this.wobbleData.phase) * this.wobbleData.amplitude;
                this.vx += perpX * wobbleStrength * dt;
                this.vy += perpY * wobbleStrength * dt;
                
                // Occasional tiny spiral
                this.wobbleData.spiralTimer -= dt;
                if (this.wobbleData.spiralTimer <= 0) {
                    // Trigger spiral for next 20-40 frames
                    if (!this.wobbleData.spiralActive) {
                        this.wobbleData.spiralActive = true;
                        this.wobbleData.spiralDuration = 20 + Math.random() * 20;
                        this.wobbleData.spiralPhase = 0;
                    }
                }
                
                // Apply spiral if active
                if (this.wobbleData.spiralActive) {
                    this.wobbleData.spiralPhase += 0.2 * dt;
                    const spiralRadius = 0.01 * Math.sin(this.wobbleData.spiralPhase * 0.5);
                    const spiralAngle = this.wobbleData.spiralPhase;
                    
                    this.vx += Math.cos(spiralAngle) * spiralRadius * dt;
                    this.vy += Math.sin(spiralAngle) * spiralRadius * dt;
                    
                    this.wobbleData.spiralDuration -= dt;
                    if (this.wobbleData.spiralDuration <= 0) {
                        this.wobbleData.spiralActive = false;
                        this.wobbleData.spiralTimer = 100 + Math.random() * 200; // Wait 100-300 frames
                    }
                }
            }
        }
        
        // Brightness flicker for nervous
        if (modifier.brightnessFlicker && modifier.brightnessFlicker > 0) {
            const flicker = 1.0 + (Math.random() - 0.5) * modifier.brightnessFlicker;
            this.opacity *= flicker;
        }
    }
    
    /**
     * Checks if the particle is still alive
     * @returns {boolean} True if particle should continue existing
     */
    isAlive() {
        return this.age < 1.0;
    }

    /**
     * Sets outward velocity for emanating effect
     * @param {number} angle - Angle from center in radians
     */
    setOutwardVelocity(angle) {
        if (this.behaviorData.outwardSpeed !== undefined) {
            const speed = this.behaviorData.outwardSpeed;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed + this.behaviorData.upwardBias;
        }
    }
    
    /**
     * Resets the particle for reuse (object pooling)
     * @param {number} x - New X position
     * @param {number} y - New Y position
     * @param {string} behavior - New behavior type
     */
    reset(x, y, behavior = 'ambient', scaleFactor = 1, particleSizeMultiplier = 1) {
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
        
        // Clear cached gradient for reuse
        this.cachedGradient = null;
        this.cachedGradientKey = null;
        this.opacity = 0.0;  // Start invisible
        
        // Clear behavior data to prevent memory leaks
        this.rotation = 0;
        this.phaseOffset = Math.random() * Math.PI * 2;
        this.behavior = behavior;
        
        // Clear gesture data if it exists
        this.gestureData = null;
        
        // Reuse existing behaviorData object if it exists, otherwise create new
        if (!this.behaviorData) {
            this.behaviorData = {};
        } else {
            // Clear existing properties
            for (let key in this.behaviorData) {
                delete this.behaviorData[key];
            }
        }
        
        // Re-roll glow properties on reset
        this.hasGlow = Math.random() < 0.333;  // 1/3 chance of glow
        this.glowSizeMultiplier = this.hasGlow ? (1.33 + Math.random() * 0.33) : 0;  // 1.33x to 1.66x particle size (2/3 smaller)
        this.isCellShaded = Math.random() < 0.333;  // 1/3 chance of cell shading
        this.baseOpacity = 0.3 + Math.random() * 0.4;  // Reset ephemeral opacity
        
        this.initializeBehavior();
    }

    /**
     * Gets the particle's current state for debugging
     * @returns {Object} Particle state information
     */
    getState() {
        return {
            position: { x: this.x, y: this.y },
            velocity: { x: this.vx, y: this.vy },
            life: this.life,
            size: this.size,
            behavior: this.behavior,
            opacity: this.opacity
        };
    }
    
    /**
     * Update erratic behavior - nervous, jittery movement
     */
    updateErratic(dt) {
        const data = this.behaviorData;
        
        // Random direction changes (scale probability with time)
        if (Math.random() < Math.min(data.directionChangeRate * dt, 0.5)) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.1 * (1 + Math.random() * data.speedVariation);
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
        }
        
        // Add jitter
        this.vx += (Math.random() - 0.5) * data.jitterStrength * dt;
        this.vy += (Math.random() - 0.5) * data.jitterStrength * dt;
        
        // Rotate particle
        this.rotation = (this.rotation || 0) + data.spinRate * dt;
        
        // Flickering opacity for nervous energy
        this.opacity = this.baseOpacity * (0.7 + Math.random() * 0.3);
        
        // Size variation
        this.size = this.baseSize * (0.8 + Math.random() * 0.4);
    }
    
    /**
     * Update cautious behavior - slow, deliberate movement with pauses
     */
    updateCautious(dt, centerX, centerY) {
        const data = this.behaviorData;
        
        // Update timers
        data.moveTimer += dt;
        
        // Switch between moving and pausing
        if (data.isMoving) {
            if (data.moveTimer > data.moveDuration) {
                data.isMoving = false;
                data.moveTimer = 0;
                // Stop movement during pause
                this.vx = 0;
                this.vy = 0;
            } else {
                // Restore movement velocity
                this.vx = data.originalVx;
                this.vy = data.originalVy;
            }
        } else {
            if (data.moveTimer > data.pauseDuration) {
                data.isMoving = true;
                data.moveTimer = 0;
                // Pick a new careful direction
                const angle = Math.random() * Math.PI * 2;
                const speed = 0.02 + Math.random() * 0.03;
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed;
                data.originalVx = this.vx;
                data.originalVy = this.vy;
            }
        }
        
        // Keep particles within watch radius of core
        const dx = this.x - centerX;
        const dy = this.y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > data.watchRadius) {
            // Pull back towards core slowly
            const pullStrength = 0.02;
            this.vx -= (dx / dist) * pullStrength;
            this.vy -= (dy / dist) * pullStrength;
        }
        
        // Cautious particles stay more visible (watching)
        this.opacity = this.baseOpacity;
        
        // Subtle size pulsing (like breathing while watching)
        const breathe = Math.sin(Date.now() / 1000 + this.phaseOffset) * 0.1 + 1;
        this.size = this.baseSize * breathe;
    }
}

export default Particle;