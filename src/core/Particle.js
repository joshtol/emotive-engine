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
 * @version 3.0.0 - Open Source Refactor
 * @module Particle
 * @changelog 3.0.0 - Major refactor for open source: added playground config, debug mode,
 *                    comprehensive documentation, and behavior registry pattern
 * @changelog 2.2.0 - Added color caching for RGBA conversions
 * @changelog 2.1.0 - Added weighted color selection system and individual particle colors
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ The ATOMS of emotion. Each particle is an individual entity with its own          
 * ║ behavior, movement pattern, and lifecycle. Together they create the               
 * ║ emotional atmosphere around the orb through coordinated chaos.                    
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                              TABLE OF CONTENTS                                    
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ 1. CONFIGURATION & CONSTANTS ................. Line 100                          
 * ║ 2. PLAYGROUND VALUES ......................... Line 200                          
 * ║ 3. PERFORMANCE CACHE ......................... Line 300                          
 * ║ 4. UTILITY FUNCTIONS ......................... Line 400                          
 * ║ 5. PARTICLE CLASS ............................ Line 500                          
 * ║ 6. BEHAVIOR INITIALIZATION ................... Line 700                          
 * ║ 7. BEHAVIOR UPDATES .......................... Line 1000                         
 * ║ 8. GESTURE SYSTEM ............................ Line 1400                         
 * ║ 9. RENDERING ................................. Line 1800                         
 * ║ 10. DEBUG UTILITIES .......................... Line 2000                         
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎯 PARTICLE BEHAVIORS (15 Types)                                                  
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ CORE BEHAVIORS (Basic movement patterns)
 * │ • ambient     : Gentle upward drift (neutral state)                               
 * │ • rising      : Buoyant upward movement (joy)                                     
 * │ • falling     : Heavy downward drift (sadness)                                    
 * │ • resting     : Ultra-slow drift (deep relaxation)                                
 * │
 * │ EMOTIONAL BEHAVIORS (Emotion-specific patterns)
 * │ • aggressive  : Sharp, chaotic movement (anger)                                   
 * │ • scattering  : Fleeing from center (fear)                                        
 * │ • repelling   : Pushing away from core (disgust)                                  
 * │ • orbiting    : Circular motion around center (love)                              
 * │ • radiant     : Radiating outward like sun rays (euphoria)                        
 * │
 * │ SPECIAL EFFECTS (Unique visual effects)
 * │ • burst       : Explosive expansion (surprise)                                    
 * │ • popcorn     : Spontaneous popping with gravity (joy)                            
 * │ • connecting  : Chaotic with attraction (connection states)                       
 * │ • ascending   : Slow rise like incense (zen)                                      
 * │ • erratic     : Nervous, jittery movement (anxiety)                               
 * │ • cautious    : Slow with pauses (suspicion - deprecated)                         
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎮 FOR VIBE CODERS - QUICK START GUIDE                                            
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ Want to tweak particle behavior? Here's where to start:                           
 * │                                                                                    
 * │ 1. PLAYGROUND VALUES (Line 200) - Safe values to modify                           
 * │    Change these to make particles faster, bouncier, sparklier!                    
 * │                                                                                    
 * │ 2. Add a new behavior:                                                            
 * │    a) Copy any initialize method (e.g., initializeAmbient)                        
 * │    b) Copy the matching update method (e.g., updateAmbient)                       
 * │    c) Add your behavior name to BEHAVIOR_REGISTRY                                 
 * │    d) Use it in emotionMap.js!                                                    
 * │                                                                                    
 * │ 3. Debug your changes:                                                            
 * │    Set window.DEBUG_PARTICLES = true to see velocity vectors!                     
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *                           SECTION 1: CONFIGURATION & CONSTANTS
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ PHYSICS CONSTANTS - Core physics values (modify with caution)
// └─────────────────────────────────────────────────────────────────────────────────────
const PHYSICS = {
    GRAVITY: 0.098,           // Downward acceleration (Earth-like)
    AIR_RESISTANCE: 0.99,     // Velocity dampening per frame
    BOUNCE_DAMPENING: 0.5,    // Energy lost on boundary collision
    MIN_VELOCITY: 0.01,       // Velocity below this is set to 0
    MAX_VELOCITY: 10,         // Speed limit to prevent runaway particles
    BOUNDARY_MARGIN: 20,      // Pixels from canvas edge
    
    // Math constants
    TWO_PI: Math.PI * 2,
    HALF_PI: Math.PI / 2,
    QUARTER_PI: Math.PI / 4
};

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ LIFECYCLE CONSTANTS - Particle birth/death timing
// └─────────────────────────────────────────────────────────────────────────────────────
const LIFECYCLE = {
    FADE_IN_PERCENT: 0.15,    // First 15% of life fades in
    FADE_OUT_PERCENT: 0.30,   // Last 30% of life fades out
    MIN_LIFESPAN: 50,         // Minimum frames before death
    MAX_LIFESPAN: 500,        // Maximum frames before death
    DEFAULT_DECAY: 0.01       // Standard life lost per frame
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *                           SECTION 2: 🎮 PLAYGROUND VALUES
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * SAFE TO MODIFY! These values are designed for experimentation.
 * Change them to create new visual effects and behaviors.
 * 
 * TIP: After changing values, refresh your browser to see the effects!
 * TIP: Set window.DEBUG_PARTICLES = true in console to visualize changes
 */

const PLAYGROUND = {
    // ┌─────────────────────────────────────────────────────────────────────────────────
    // │ PARTICLE APPEARANCE - How particles look
    // └─────────────────────────────────────────────────────────────────────────────────
    particle: {
        MIN_SIZE: 4,           // 🎯 Smallest particle (pixels) - Try: 2-10
        MAX_SIZE: 10,          // 🎯 Largest particle (pixels) - Try: 5-20
        GLOW_CHANCE: 0.33,     // 🎯 Chance of glowing (0=never, 1=always)
        CELL_SHADE_CHANCE: 0.33, // 🎯 Chance of cartoon style (0=never, 1=always)
        BASE_OPACITY: 1.0      // 🎯 Starting opacity (0=invisible, 1=solid)
    },
    
    // ┌─────────────────────────────────────────────────────────────────────────────────
    // │ SPARKLE & SHIMMER - Valentine firefly effects (love state)
    // └─────────────────────────────────────────────────────────────────────────────────
    sparkle: {
        BLINK_SPEED_MIN: 0.3,  // 🎯 Slowest blink rate - Try: 0.1-1.0
        BLINK_SPEED_MAX: 1.5,  // 🎯 Fastest blink rate - Try: 0.5-3.0
        INTENSITY_MIN: 0.6,    // 🎯 Dimmest sparkle - Try: 0.3-0.8
        INTENSITY_MAX: 1.0,    // 🎯 Brightest sparkle - Try: 0.8-1.2
        SIZE_PULSE: 0.3        // 🎯 Size change during sparkle - Try: 0.1-0.5
    },
    
    // ┌─────────────────────────────────────────────────────────────────────────────────
    // │ POPCORN BEHAVIOR - Joy particles that pop!
    // └─────────────────────────────────────────────────────────────────────────────────
    popcorn: {
        POP_DELAY_MIN: 100,    // 🎯 Fastest pop (ms) - Try: 50-500
        POP_DELAY_MAX: 2000,   // 🎯 Slowest pop (ms) - Try: 1000-5000
        POP_FORCE_MIN: 3,      // 🎯 Weakest pop - Try: 1-5
        POP_FORCE_MAX: 8,      // 🎯 Strongest pop - Try: 5-15
        BOUNCE_HEIGHT: 0.7     // 🎯 Bounce energy retained - Try: 0.3-0.9
    },
    
    // ┌─────────────────────────────────────────────────────────────────────────────────
    // │ EMOTION INTENSITIES - How dramatic each emotion appears
    // └─────────────────────────────────────────────────────────────────────────────────
    emotions: {
        ANGER_SHAKE: 2.0,      // 🎯 Anger intensity - Try: 1.0-3.0
        FEAR_JITTER: 1.5,      // 🎯 Fear nervousness - Try: 0.5-2.5
        LOVE_SWAY: 1.2,        // 🎯 Love romance - Try: 0.8-2.0
        JOY_BOUNCE: 1.8,       // 🎯 Joy energy - Try: 1.0-3.0
        SADNESS_WEIGHT: 0.6    // 🎯 Sadness heaviness - Try: 0.3-0.8
    }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *                           SECTION 3: PERFORMANCE CACHE
 * ═══════════════════════════════════════════════════════════════════════════════════════
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

/**
 * Select a color from an array with optional weights
 * @param {Array} colors - Array of color strings or {color, weight} objects
 * @returns {string} Selected color
 */
function selectWeightedColor(colors) {
    if (!colors || colors.length === 0) return '#FFFFFF';
    
    // Parse colors and weights
    let totalExplicitWeight = 0;
    let unweightedCount = 0;
    const parsedColors = [];
    
    for (const item of colors) {
        if (typeof item === 'string') {
            parsedColors.push({ color: item, weight: null });
            unweightedCount++;
        } else if (item && typeof item === 'object' && item.color) {
            parsedColors.push({ color: item.color, weight: item.weight || null });
            if (item.weight) {
                totalExplicitWeight += item.weight;
            } else {
                unweightedCount++;
            }
        }
    }
    
    // Calculate weight for unweighted colors
    const remainingWeight = Math.max(0, 100 - totalExplicitWeight);
    const defaultWeight = unweightedCount > 0 ? remainingWeight / unweightedCount : 0;
    
    // Build cumulative probability table
    const probTable = [];
    let cumulative = 0;
    
    for (const item of parsedColors) {
        const weight = item.weight !== null ? item.weight : defaultWeight;
        cumulative += weight;
        probTable.push({ color: item.color, threshold: cumulative });
    }
    
    // Select based on random value
    const random = Math.random() * cumulative;
    for (const entry of probTable) {
        if (random <= entry.threshold) {
            return entry.color;
        }
    }
    
    // Fallback to last color
    return parsedColors[parsedColors.length - 1].color;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *                           SECTION 5: PARTICLE CLASS
 * ═══════════════════════════════════════════════════════════════════════════════════════
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
        this.glowSizeMultiplier = this.hasGlow ? (1.33 + Math.random() * 0.33) : 0;  // 1.33x to 1.66x particle size (2/3 smaller than before)
        
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
            case 'radiant':
                this.initializeRadiant();
                break;
            case 'popcorn':
                this.initializePopcorn();
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
            default:
                this.initializeAmbient();
        }
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
        
        // Use emotion colors if provided
        if (this.emotionColors && this.emotionColors.length > 0) {
            this.color = selectWeightedColor(this.emotionColors);
        }
        
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
        
        // Use emotion colors if provided
        if (this.emotionColors && this.emotionColors.length > 0) {
            this.color = selectWeightedColor(this.emotionColors);
        }
        
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
        
        // Use emotion colors if provided
        if (this.emotionColors && this.emotionColors.length > 0) {
            this.color = selectWeightedColor(this.emotionColors);
        }
        
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
        
        // Use emotion colors if provided
        if (this.emotionColors && this.emotionColors.length > 0) {
            this.color = selectWeightedColor(this.emotionColors);
        }
        
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
        
        // Use emotion colors if provided
        if (this.emotionColors && this.emotionColors.length > 0) {
            this.color = selectWeightedColor(this.emotionColors);
        }
        
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
        const isSurprise = this.emotion === 'surprise';
        const angle = Math.random() * Math.PI * 2;
        const speed = isSuspicion ? 
            (1.0 + Math.random() * 0.8) :  // Controlled burst for suspicion
            (isSurprise ? 
                (7.0 + Math.random() * 5.0) :   // Much faster burst for wide spread (7-12)
                (3.5 + Math.random() * 2.5));   // Normal burst for others
        
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.lifeDecay = isSuspicion ? 0.010 : (isSurprise ? 0.006 + Math.random() * 0.008 : 0.015);  // Longer life for surprise to travel further
        
        // Use emotion colors if provided
        if (this.emotionColors && this.emotionColors.length > 0) {
            this.color = selectWeightedColor(this.emotionColors);
        }
        
        // Make suspicion particles more visible
        if (isSuspicion) {
            this.size = (6 + Math.random() * 4) * (this.scaleFactor || 1) * (this.particleSizeMultiplier || 1);
            this.baseSize = this.size;
            this.opacity = 1.0;  // Full opacity for visibility
            this.baseOpacity = this.opacity;
        }
        
        // Keep surprise particles normal sized
        if (this.emotion === 'surprise') {
            this.hasGlow = Math.random() < 0.3; // 30% have subtle glow
            this.glowSizeMultiplier = this.hasGlow ? 1.3 : 0; // Subtle glow
        }
        
        this.behaviorData = {
            initialSpeed: speed,
            expansion: isSuspicion ? 1.02 : 1.05,  // Normal expansion
            fadeStart: 0.7,
            isSuspicion: isSuspicion,
            isSurprise: this.emotion === 'surprise'
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
        
        // Use emotion colors if provided
        if (this.emotionColors && this.emotionColors.length > 0) {
            this.color = selectWeightedColor(this.emotionColors);
        }
        
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
        
        // Use emotion colors if provided
        if (this.emotionColors && this.emotionColors.length > 0) {
            this.color = selectWeightedColor(this.emotionColors);
        }
        
        this.behaviorData = {
            // Ultra-languid upward drift
            upwardSpeed: 0.0005,      // Tiny continuous upward
            waviness: 0,              // NO side-to-side
            friction: 0.999           // Almost no slowdown
        };
    }
    
    /**
     * Radiant behavior - particles radiate outward like sun rays
     */
    initializeRadiant() {
        // Particles burst outward from center like sunbeams
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.8 + Math.random() * 0.4; // Moderate to fast speed
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.lifeDecay = 0.006; // Moderate life - last ~8-10 seconds
        
        // Use emotion colors if provided, otherwise default sunrise colors
        if (this.emotionColors && this.emotionColors.length > 0) {
            this.color = selectWeightedColor(this.emotionColors);
        } else {
            // Default golden sunrise colors
            const colors = ['#FFD700', '#FFB347', '#FFA500', '#FF69B4'];
            this.color = selectWeightedColor(colors);
        }
        
        // More particles have glow for radiant effect
        this.hasGlow = Math.random() < 0.7; // 70% chance of glow
        this.glowSizeMultiplier = this.hasGlow ? (1.5 + Math.random() * 0.5) : 0; // Bigger glow
        
        this.behaviorData = {
            // Continuous outward radiation
            radialSpeed: 0.02,        // Constant outward acceleration
            shimmer: Math.random() * Math.PI * 2, // Initial shimmer phase
            shimmerSpeed: 0.1,        // Shimmer oscillation speed
            friction: 0.98            // Slight slowdown over time
        };
    }
    
    /**
     * Popcorn behavior - spontaneous popping particles (joy)
     */
    initializePopcorn() {
        // Start with little to no movement (kernel waiting to pop)
        this.vx = (Math.random() - 0.5) * 0.1;
        this.vy = (Math.random() - 0.5) * 0.1;
        // Faster, more varied decay for dynamic disappearing
        this.lifeDecay = 0.008 + Math.random() * 0.012; // Random between 0.008-0.020 (faster fade)
        
        // Use emotion colors if provided, otherwise default popcorn colors
        if (this.emotionColors && this.emotionColors.length > 0) {
            this.color = selectWeightedColor(this.emotionColors);
        } else {
            // Default popcorn colors
            const colors = ['#FFFFFF', '#FFFACD', '#FFF8DC', '#FFFFE0', '#FAFAD2'];
            this.color = selectWeightedColor(colors);
        }
        
        // Vary sizes more dramatically - some big fluffy pieces, some small
        this.size = (Math.random() < 0.3) ? 
            (8 + Math.random() * 4) * this.scaleFactor * this.particleSizeMultiplier : // 30% big pieces
            (2 + Math.random() * 4) * this.scaleFactor * this.particleSizeMultiplier;  // 70% small pieces
        this.baseSize = this.size;
        
        // Less glow, more solid popcorn look
        this.hasGlow = Math.random() < 0.2; // Only 20% have glow
        this.glowSizeMultiplier = this.hasGlow ? 1.2 : 0;
        
        this.behaviorData = {
            // Popcorn popping mechanics
            popDelay: Math.random() * 800,     // Even faster, more varied popping (0-0.8 seconds)
            hasPopped: false,                    // Track if this kernel has popped
            popStrength: 2.5 + Math.random() * 3.5, // Much stronger pops for wide spread (2.5-6)
            bounceCount: 0,                      // Track bounces after popping
            maxBounces: 2 + Math.floor(Math.random() * 3), // 2-4 bounces
            gravity: 0.02,                       // Gravity acceleration
            bounceDamping: 0.6,                  // Energy lost per bounce
            spinRate: (Math.random() - 0.5) * 0.3, // Rotation while flying
            lifetime: 0                          // Track particle age for pop timing
        };
    }
    
    /**
     * Orbiting behavior - gentle circular motion (love)
     */
    initializeOrbiting() {
        // Individual fade timing - each particle has its own lifespan
        this.lifeDecay = 0.001 + Math.random() * 0.002;  // Variable decay (0.001-0.003)
        
        // Use emotion colors if provided - glittery valentine palette
        if (this.emotionColors && this.emotionColors.length > 0) {
            this.color = selectWeightedColor(this.emotionColors);
        }
        
        // Check if this is a lighter/sparkle color (light pinks)
        this.isSparkle = this.color === '#FFE4E1' || this.color === '#FFCCCB' || this.color === '#FFC0CB';
        
        // Particles orbit at various distances for depth
        const orbRadius = (this.scaleFactor || 1) * 40; // Approximate orb size
        const depthLayer = Math.random();
        const baseRadius = orbRadius * (1.3 + depthLayer * 0.9); // 1.3x to 2.2x orb radius
        
        // Glitter firefly properties - each with unique timing
        this.blinkPhase = Math.random() * Math.PI * 2; // Random starting phase
        this.blinkSpeed = 0.3 + Math.random() * 1.2; // Varied blink speeds (0.3-1.5)
        this.blinkIntensity = 0.6 + Math.random() * 0.4; // How bright the blink gets
        
        // Individual fade properties
        this.fadePhase = Math.random() * Math.PI * 2; // Random fade starting phase
        this.fadeSpeed = 0.1 + Math.random() * 0.3; // Different fade speeds
        this.minOpacity = 0.2 + Math.random() * 0.2; // Min brightness varies (0.2-0.4)
        this.maxOpacity = 0.8 + Math.random() * 0.2; // Max brightness varies (0.8-1.0)
        
        // Sparkles have different properties
        if (this.isSparkle) {
            this.blinkSpeed *= 2; // Sparkles blink faster
            this.blinkIntensity = 1.0; // Full intensity sparkles
            this.minOpacity = 0; // Can fade to nothing
            this.maxOpacity = 1.0; // Can be fully bright
        }
        
        this.behaviorData = {
            angle: Math.random() * Math.PI * 2,
            radius: baseRadius,
            baseRadius: baseRadius,
            angularVelocity: 0.0008 + Math.random() * 0.0017,  // Varied rotation speeds
            swayAmount: 3 + Math.random() * 7,  // Gentle floating sway
            swaySpeed: 0.2 + Math.random() * 0.5,  // Varied sway rhythm
            floatOffset: Math.random() * Math.PI * 2,  // Random vertical float phase
            floatSpeed: 0.3 + Math.random() * 0.7,  // Varied vertical floating speed
            floatAmount: 2 + Math.random() * 6,  // How much they float up/down
            twinklePhase: Math.random() * Math.PI * 2,  // Individual twinkle timing
            twinkleSpeed: 2 + Math.random() * 3  // Fast twinkle for glitter effect
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
            this.isFadingOut = true;
            
            // Dynamic size reduction for popcorn during fade-out
            if (this.behavior === 'popcorn') {
                this.size = this.baseSize * (0.5 + 0.5 * this.life); // Shrink to 50% size
            }
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
            case 'radiant':
                this.updateRadiant(dt, centerX, centerY);
                break;
            case 'popcorn':
                this.updatePopcorn(dt, centerX, centerY);
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
        }
    }


    /**
     * Update ambient behavior - gentle outward emanation
     * 
     * Used for: NEUTRAL emotion (calm, peaceful state)
     * Visual effect: Particles gently drift upward like smoke or steam
     * 
     * VISUAL DIAGRAM:
     *        ↑  ↑  ↑
     *       ·  ·  ·    ← particles
     *      ·  ·  ·  
     *     ·  ⭐  ·     ← orb center
     *      ·  ·  ·
     *       ·  ·  ·
     * 
     * @param {number} dt - Delta time (frame time)
     * @param {number} centerX - Orb center X (unused but kept for consistency)
     * @param {number} centerY - Orb center Y (unused but kept for consistency)
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
        
        // Surprise particles: burst out then STOP suddenly
        if (data.isSurprise) {
            // Track age for timing the stop
            data.age = (data.age || 0) + dt * 0.016; // Convert to seconds
            
            if (data.age < 0.15) {
                // First 0.15 seconds: maintain high speed
                // Very little friction
                const friction = 0.98;
                this.vx *= Math.pow(friction, dt);
                this.vy *= Math.pow(friction, dt);
            } else if (data.age < 0.25) {
                // 0.15-0.25 seconds: SUDDEN STOP!
                const friction = 0.85; // Heavy braking
                this.vx *= Math.pow(friction, dt);
                this.vy *= Math.pow(friction, dt);
            } else {
                // After stop: float gently
                const friction = 0.99;
                this.vx *= Math.pow(friction, dt);
                this.vy *= Math.pow(friction, dt);
                // Tiny random drift
                this.vx += (Math.random() - 0.5) * 0.01 * dt;
                this.vy += (Math.random() - 0.5) * 0.01 * dt;
            }
        } else {
            // Normal burst behavior for other emotions
            const friction = data.isSuspicion ? 0.99 : 0.95;
            this.vx *= Math.pow(friction, dt);
            this.vy *= Math.pow(friction, dt);
        }
        
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
     * Update radiant behavior - particles radiate outward like sun rays
     * 
     * Used for: EUPHORIA emotion (first day of spring, sunrise vibes)
     * Visual effect: Particles burst outward from center like sunbeams, with a 
     *                shimmering/twinkling effect as they travel
     * 
     * @param {number} dt - Delta time (milliseconds since last frame, typically ~16.67 for 60fps)
     * @param {number} centerX - X coordinate of the orb's center (canvas center)
     * @param {number} centerY - Y coordinate of the orb's center (canvas center)
     */
    updateRadiant(dt, centerX, centerY) {
        const data = this.behaviorData;
        
        // STEP 1: Calculate this particle's direction from the orb center
        // dx/dy = distance from center to particle (can be negative)
        const dx = this.x - centerX;
        const dy = this.y - centerY;
        // dist = straight-line distance using Pythagorean theorem
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // STEP 2: Push particle outward from center (like sun rays)
        if (dist > 0) {
            // Convert dx/dy into a unit vector (length = 1) pointing away from center
            // This gives us pure direction without magnitude
            const dirX = dx / dist;
            const dirY = dy / dist;
            
            // Add velocity in the outward direction
            // radialSpeed controls how fast particles shoot outward (defined in initializeRadiant)
            // Multiply by dt to make movement frame-rate independent
            this.vx += dirX * data.radialSpeed * dt;
            this.vy += dirY * data.radialSpeed * dt;
        }
        
        // STEP 3: Create shimmering effect (particles twinkle as they radiate)
        // Increment shimmer phase over time (shimmerSpeed controls twinkle rate)
        data.shimmer += data.shimmerSpeed * dt;
        // Create sine wave oscillation (-1 to 1)
        const shimmerEffect = Math.sin(data.shimmer);
        // Make particle size pulse: baseSize ± 20%
        // When shimmerEffect = 1: size = baseSize * 1.2 (120%)
        // When shimmerEffect = -1: size = baseSize * 0.8 (80%)
        this.size = this.baseSize * (1 + shimmerEffect * 0.2);
        // Make particle opacity pulse: baseOpacity ± 30%
        // Creates a twinkling star effect as particles radiate
        this.opacity = this.baseOpacity * (1 + shimmerEffect * 0.3);
        
        // STEP 4: Apply friction to slow particles over time
        // This prevents infinite acceleration and creates natural deceleration
        // Math.pow(friction, dt) ensures frame-rate independent decay
        // If friction = 0.99 and dt = 1, velocity reduces by 1% per frame
        this.vx *= Math.pow(data.friction, dt);
        this.vy *= Math.pow(data.friction, dt);
    }
    
    /**
     * Update popcorn behavior - spontaneous popping with bounces
     * 
     * Used for: JOY emotion (celebration, happiness)
     * Visual effect: Particles wait, then POP! and bounce around with gravity
     * 
     * VISUAL DIAGRAM:
     *     Stage 1: Wait      Stage 2: POP!       Stage 3: Bounce
     *         ·                  💥 ↗             ↘ 
     *        ···                ↖ 💥 ↗              ↓
     *       ·⭐·                  💥                 🎊 ← bounce!
     *        ···                ↙ 💥 ↘              ↑
     *         ·                  💥 ↓               ↗
     * 
     * RECIPE TO MODIFY:
     * - Decrease popDelay for faster popping (more energetic)
     * - Increase popStrength for bigger pops
     * - Adjust gravity for different bounce physics
     * 
     * @param {number} dt - Delta time (frame time)
     * @param {number} centerX - Orb center X (unused)
     * @param {number} centerY - Orb center Y (unused)
     */
    updatePopcorn(dt, centerX, centerY) {
        const data = this.behaviorData;
        data.lifetime += dt * 16.67; // Convert to milliseconds
        
        // Check if it's time to pop
        if (!data.hasPopped && data.lifetime > data.popDelay) {
            // POP! Sudden burst of velocity in all directions for celebration
            data.hasPopped = true;
            const popAngle = Math.random() * Math.PI * 2; // Full 360 degree spread
            this.vx = Math.cos(popAngle) * data.popStrength * 1.5; // Extra horizontal spread
            this.vy = Math.sin(popAngle) * data.popStrength - 0.3; // Slight upward bias for joy
            
            // Expand size when popping for dramatic effect
            this.size = this.baseSize * 1.25;
        }
        
        if (data.hasPopped) {
            // Apply gravity
            this.vy += data.gravity * dt;
            
            // Apply spin (visual effect would need rotation rendering)
            // data.spinRate is stored for potential visual use
            
            // Check for ground bounce
            const groundLevel = centerY + 100 * this.scaleFactor; // Below the orb
            if (this.y > groundLevel && data.bounceCount < data.maxBounces) {
                this.y = groundLevel;
                this.vy = -Math.abs(this.vy) * data.bounceDamping; // Bounce up with damping
                this.vx *= 0.9; // Reduce horizontal speed on bounce
                data.bounceCount++;
                
                // Shrink slightly with each bounce
                this.size = this.baseSize * (1.5 - data.bounceCount * 0.1);
            }
            
            // Fade dramatically after final bounce
            if (data.bounceCount >= data.maxBounces) {
                this.lifeDecay = 0.03 + Math.random() * 0.02; // Very fast fade (0.03-0.05)
                this.size *= 0.95; // Also shrink rapidly
            }
            
            // Dynamic fading based on velocity - slower particles fade faster
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (speed < 0.5) {
                this.lifeDecay *= 1.5; // 50% faster fade when moving slowly
            }
        }
    }
    
    /**
     * Update orbiting behavior - circular motion
     * 
     * Used for: LOVE emotion (romantic, valentine's day vibes)
     * Visual effect: Particles orbit around orb like fireflies dancing,
     *                with individual blinking and fading
     * 
     * VISUAL DIAGRAM:
     *        ✨     ✨
     *      💕  ╭───╮  💕    ← particles orbit & sparkle
     *    ✨   │  ⭐  │   ✨   ← orb center
     *      💕  ╰───╯  💕
     *        ✨     ✨
     * 
     * RECIPE TO MODIFY:
     * - Increase angularVelocity for faster spinning
     * - Increase floatAmount for more vertical movement
     * - Adjust blinkSpeed for different firefly effects
     * 
     * @param {number} dt - Delta time (frame time)
     * @param {number} centerX - Orb center X position
     * @param {number} centerY - Orb center Y position
     */
    updateOrbiting(dt, centerX, centerY) {
        const data = this.behaviorData;
        
        // Slow romantic rotation around the orb
        data.angle += data.angularVelocity * dt;
        
        // Gentle swaying motion
        const swayOffset = Math.sin(data.angle * data.swaySpeed) * data.swayAmount;
        
        // Radius changes for breathing effect
        const radiusPulse = Math.sin(data.angle * 1.5) * 6;
        const currentRadius = data.baseRadius + radiusPulse + swayOffset * 0.2;
        
        // Calculate orbital position
        this.x = centerX + Math.cos(data.angle) * currentRadius;
        this.y = centerY + Math.sin(data.angle) * currentRadius;
        
        // Add gentle vertical floating (like fireflies)
        data.floatOffset += data.floatSpeed * dt * 0.001;
        const verticalFloat = Math.sin(data.floatOffset) * data.floatAmount;
        this.y += verticalFloat;
        
        // Update individual fade phase
        this.fadePhase += this.fadeSpeed * dt * 0.001;
        
        // Calculate individual particle fade (independent timing)
        const fadeValue = Math.sin(this.fadePhase) * 0.5 + 0.5; // 0 to 1
        const fadeOpacity = this.minOpacity + (this.maxOpacity - this.minOpacity) * fadeValue;
        
        // Firefly blinking effect
        this.blinkPhase += this.blinkSpeed * dt * 0.002;
        
        // Create a complex glitter blink with multiple harmonics
        let blinkValue;
        if (this.isSparkle) {
            // Sparkles have sharp, dramatic twinkles
            data.twinklePhase += data.twinkleSpeed * dt * 0.001;
            const twinkle = Math.pow(Math.sin(data.twinklePhase), 16); // Sharp peaks
            const shimmer = Math.sin(this.blinkPhase * 5) * 0.2;
            blinkValue = twinkle * 0.7 + shimmer + 0.1;
        } else {
            // Regular particles have smoother, firefly-like pulses
            blinkValue = Math.sin(this.blinkPhase) * 0.4 + 
                        Math.sin(this.blinkPhase * 3) * 0.3 +
                        Math.sin(this.blinkPhase * 7) * 0.2 +
                        Math.sin(this.blinkPhase * 11) * 0.1; // Added harmonic
        }
        
        // Map to 0-1 range with intensity control
        const normalizedBlink = (blinkValue + 1) * 0.5; // Convert from -1,1 to 0,1
        const blink = 0.2 + normalizedBlink * this.blinkIntensity * 0.8;
        
        // Combine individual fade with blink effect
        this.opacity = this.baseOpacity * fadeOpacity * blink;
        
        // Sparkles pulse size more dramatically
        if (this.isSparkle) {
            this.size = this.baseSize * (0.5 + normalizedBlink * 1.0); // 50-150% size
        } else {
            this.size = this.baseSize * (0.8 + normalizedBlink * 0.3); // 80-110% size
        }
        
        // Add subtle color shift for sparkles (shimmer effect)
        if (this.isSparkle) {
            // Light pink sparkles can shift to white at peak brightness
            if (normalizedBlink > 0.85) {
                this.tempColor = '#FFFFFF'; // Flash white at peak for extra sparkle
            } else {
                this.tempColor = this.color;
            }
        }
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
        
        // Use the particle's own color if set, otherwise fall back to emotion color
        // tempColor is used for special effects like sparkle flashes
        const particleColor = this.tempColor || this.color || emotionColor;
        
        ctx.save();
        
        if (this.isCellShaded) {
            // Cell shaded style - hard edges, no gradients
            
            // Draw outline (darker color)
            ctx.strokeStyle = this.hexToRgba(particleColor, this.opacity * 0.9);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(renderX, renderY, safeSize, 0, Math.PI * 2);
            ctx.stroke();
            
            // Draw flat color fill with discrete opacity levels and ephemeral base
            const discreteOpacity = Math.floor(this.opacity * 3) / 3;  // 3 discrete levels: 0, 0.33, 0.66, 1
            ctx.fillStyle = this.hexToRgba(particleColor, discreteOpacity * (this.baseOpacity || 0.5) * 0.5);
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
            
            // Cache fill style to avoid redundant sets
            if (ctx.fillStyle !== particleColor) {
                ctx.fillStyle = particleColor;
            }
            
            // Draw glow first if this particle has one
            if (this.hasGlow) {
                const glowRadius = Math.max(0.1, safeSize * this.glowSizeMultiplier);
                
                // Batch glow layers with single path
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
     * Convert hex to rgba with caching
     */
    hexToRgba(hex, alpha = 1) {
        // Create cache key
        const key = `${hex}_${alpha.toFixed(3)}`;
        
        // Check cache first
        if (this.cachedColors.has(key)) {
            return this.cachedColors.get(key);
        }
        
        // Parse and cache
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        let rgba;
        if (result) {
            rgba = `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`;
        } else {
            rgba = `rgba(0, 0, 0, ${alpha})`;
        }
        
        // Cache for future use (limit cache size to prevent memory leak)
        if (this.cachedColors.size > 20) {
            // Clear oldest entries
            const firstKey = this.cachedColors.keys().next().value;
            this.cachedColors.delete(firstKey);
        }
        this.cachedColors.set(key, rgba);
        
        return rgba;
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
                
                // Dampen velocities near end to prevent wiggle
                if (progress > 0.9) {
                    const dampFactor = 1 - ((progress - 0.9) * 10);
                    this.vx *= (0.95 + dampFactor * 0.05);
                    this.vy *= (0.95 + dampFactor * 0.05);
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
                    // Reset velocities to prevent wiggle
                    this.vx *= 0.1;
                    this.vy *= 0.1;
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
                    // Reset velocities to prevent wiggle
                    this.vx *= 0.1;
                    this.vy *= 0.1;
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
                // Use a fixed reference radius since particles don't have orbRadius
                const referenceRadius = 100 * (this.scaleFactor || 1);
                const inhaleRadius = (motion.inhaleRadius || 1.5) * referenceRadius;
                const exhaleRadius = (motion.exhaleRadius || 0.8) * referenceRadius;
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
                
                // Cleanup wave data
                if (progress >= 0.99) {
                    this.gestureData.waveInitialized = false;
                    this.gestureData.waveStartX = null;
                    this.gestureData.waveStartY = null;
                    // Reset velocities to prevent wiggle
                    this.vx *= 0.1;
                    this.vy *= 0.1;
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
                
                // Cleanup stretch data
                if (progress >= 0.99) {
                    this.gestureData.stretchStartDX = null;
                    this.gestureData.stretchStartDY = null;
                    // Reset velocities to prevent wiggle
                    this.vx *= 0.1;
                    this.vy *= 0.1;
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
        
        // Reset gesture data and velocities when gesture completes
        if (progress >= 1) {
            // Clear velocities to prevent stuck wiggling
            this.vx = 0;
            this.vy = 0;
            this.gestureData = null;
        }
    }
    
    /**
     * Apply undertone modifications to particle behavior
     * @param {number} dt - Normalized delta time
     * @param {Object} modifier - Undertone modifier settings (can be weighted)
     */
    applyUndertoneModifier(dt, modifier) {
        // Early exit if no modifier
        if (!modifier) return;
        
        // Handle weighted modifiers (smooth transitions)
        const weight = modifier.weight !== undefined ? modifier.weight : 1.0;
        
        // Speed modification (apply with weight for smooth transitions)
        if (modifier.particleSpeedMult && modifier.particleSpeedMult !== 1.0) {
            // Store base velocities if not already stored
            if (!this.undertoneData) {
                this.undertoneData = {
                    baseVx: this.vx,
                    baseVy: this.vy,
                    lastSpeedMult: 1.0
                };
            }
            
            // Apply multiplier to BASE velocity, not current velocity
            const speedMult = 1.0 + (modifier.particleSpeedMult - 1.0) * weight;
            
            // Reset to base velocity then apply new multiplier
            this.vx = this.undertoneData.baseVx * speedMult;
            this.vy = this.undertoneData.baseVy * speedMult;
            
            // Update base velocities if behavior changes significantly
            if (Math.abs(speedMult - this.undertoneData.lastSpeedMult) > 0.5) {
                this.undertoneData.baseVx = this.vx / speedMult;
                this.undertoneData.baseVy = this.vy / speedMult;
            }
            this.undertoneData.lastSpeedMult = speedMult;
        } else if (this.undertoneData) {
            // No speed modifier, reset to base velocities
            this.vx = this.undertoneData.baseVx;
            this.vy = this.undertoneData.baseVy;
            this.undertoneData = null;
        }
        
        // Particle burst for confident undertone (apply with weight)
        if (modifier.particleBurst) {
            if (!this.burstData) {
                this.burstData = {
                    timer: Math.random() * 200, // Random start
                    active: false,
                    duration: 0,
                    baseVx: this.vx,
                    baseVy: this.vy,
                    boosted: false
                };
            }
            
            this.burstData.timer -= dt;
            if (this.burstData.timer <= 0 && !this.burstData.active) {
                // Trigger burst
                this.burstData.active = true;
                this.burstData.duration = 30; // Half second burst
                this.burstData.timer = 200 + Math.random() * 100; // Next in 3-5 seconds at 60fps
                this.burstData.baseVx = this.vx;
                this.burstData.baseVy = this.vy;
                this.burstData.boosted = false;
            }
            
            if (this.burstData.active) {
                // Apply speed boost ONCE at the start of burst
                if (!this.burstData.boosted) {
                    const boostFactor = 1.0 + (0.5 * weight);
                    this.vx = this.burstData.baseVx * boostFactor;
                    this.vy = this.burstData.baseVy * boostFactor;
                    this.burstData.boosted = true;
                }
                
                this.burstData.duration -= dt;
                if (this.burstData.duration <= 0) {
                    // Reset to base velocity after burst
                    this.vx = this.burstData.baseVx;
                    this.vy = this.burstData.baseVy;
                    this.burstData.active = false;
                    this.burstData.boosted = false;
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
                // Nearly stop (weighted for smooth transition)
                const slowFactor = 1.0 - (0.9 * weight); // Blend from 1.0 to 0.1
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
                // Tight spiral (weighted for smooth transition)
                this.spiralData.angle += 0.5 * dt;
                const spiralRadius = 0.05 * weight;
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
                // Gentle pull toward center (weighted for smooth transition)
                const pullStrength = 0.001 * weight;
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
                
                // Apply sine wave wobble (weighted for smooth transition)
                const wobbleStrength = Math.sin(this.wobbleData.phase) * this.wobbleData.amplitude * weight;
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
        
        // Clear behavior data to prevent memory leaks
        this.rotation = 0;
        this.phaseOffset = Math.random() * Math.PI * 2;
        this.color = '#ffffff';  // Reset color to white before reinitializing
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