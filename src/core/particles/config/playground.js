/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Playground Configuration 🎮
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Safe values for experimentation and tweaking
 * @author Emotive Engine Team
 * @module particles/config/playground
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                            🎮 PLAYGROUND VALUES                                   
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ SAFE TO MODIFY! These values are designed for experimentation.                    
 * ║ Change them to create new visual effects and behaviors.                           
 * ║                                                                                    
 * ║ TIP: After changing values, refresh your browser to see the effects!              
 * ║ TIP: Set window.DEBUG_PARTICLES = true in console to visualize changes            
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

export const PLAYGROUND = {
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
 * ┌─────────────────────────────────────────────────────────────────────────────────────
 * │ 📝 RECIPES FOR COMMON MODIFICATIONS
 * └─────────────────────────────────────────────────────────────────────────────────────
 * 
 * MAKE PARTICLES MORE ENERGETIC:
 * - Increase JOY_BOUNCE to 2.5+
 * - Decrease POP_DELAY_MIN to 50
 * - Increase POP_FORCE_MAX to 12
 * 
 * MAKE PARTICLES MORE ROMANTIC:
 * - Increase LOVE_SWAY to 1.8
 * - Increase BLINK_SPEED_MAX to 2.0
 * - Increase SIZE_PULSE to 0.5
 * 
 * MAKE PARTICLES MORE DRAMATIC:
 * - Increase all emotion intensities by 50%
 * - Increase MAX_SIZE to 15
 * - Set GLOW_CHANCE to 0.7
 * 
 * MAKE PARTICLES MORE SUBTLE:
 * - Decrease all emotion intensities by 50%
 * - Decrease MAX_SIZE to 6
 * - Set BASE_OPACITY to 0.7
 */

export default PLAYGROUND;