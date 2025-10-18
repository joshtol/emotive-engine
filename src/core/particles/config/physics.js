/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Particle Physics Configuration
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Physics constants for particle behavior
 * @author Emotive Engine Team
 * @module particles/config/physics
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Core physics values that control how particles move and interact with the world.  
 * ║ Modify these with caution as they affect all particle behaviors globally.         
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ PHYSICS CONSTANTS - Core physics values (modify with caution)
// └─────────────────────────────────────────────────────────────────────────────────────
export const PHYSICS = {
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
export const LIFECYCLE = {
    FADE_IN_PERCENT: 0.15,    // First 15% of life fades in
    FADE_OUT_PERCENT: 0.30,   // Last 30% of life fades out
    MIN_LIFESPAN: 50,         // Minimum frames before death
    MAX_LIFESPAN: 500,        // Maximum frames before death
    DEFAULT_DECAY: 0.01       // Standard life lost per frame
};

export default { PHYSICS, LIFECYCLE };