/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Easing Functions
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Easing functions for smooth animations
 * @author Emotive Engine Team
 * @module particles/utils/easing
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Easing functions create smooth, natural-looking animations. Instead of linear     
 * ║ movement (boring), these functions create acceleration and deceleration           
 * ║ (organic and pleasing to the eye).                                               
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 * 
 * VISUAL GUIDE TO EASING:
 * 
 * Linear (boring):        Ease In Out (smooth):
 * 1 │      ╱             1 │      ╭─╮
 *   │    ╱                 │    ╱   ╲
 *   │  ╱                   │  ╱       ╲
 * 0 │╱___                0 │╱___________╲
 *   0    t    1            0      t      1
 */

/**
 * Linear interpolation - no easing
 * @param {number} t - Progress (0 to 1)
 * @returns {number} Eased value (0 to 1)
 */
export function linear(t) {
    return t;
}

/**
 * Smooth start and end (cubic)
 * Most commonly used for natural animations
 * @param {number} t - Progress (0 to 1)
 * @returns {number} Eased value (0 to 1)
 */
export function easeInOutCubic(t) {
    return t < 0.5 
        ? 4 * t * t * t                    // First half: ease in
        : 1 - Math.pow(-2 * t + 2, 3) / 2; // Second half: ease out
}

/**
 * Slow start, normal end (quadratic)
 * Good for things that need to build momentum
 * @param {number} t - Progress (0 to 1)
 * @returns {number} Eased value (0 to 1)
 */
export function easeInQuad(t) {
    return t * t;
}

/**
 * Normal start, slow end (quadratic)
 * Good for things coming to rest
 * @param {number} t - Progress (0 to 1)
 * @returns {number} Eased value (0 to 1)
 */
export function easeOutQuad(t) {
    return t * (2 - t);
}

/**
 * Smooth start and end (quadratic)
 * Gentler than cubic
 * @param {number} t - Progress (0 to 1)
 * @returns {number} Eased value (0 to 1)
 */
export function easeInOutQuad(t) {
    return t < 0.5 
        ? 2 * t * t 
        : -1 + (4 - 2 * t) * t;
}

/**
 * Elastic bounce effect
 * Great for playful animations
 * @param {number} t - Progress (0 to 1)
 * @returns {number} Eased value (can overshoot 0-1)
 */
export function easeOutElastic(t) {
    const p = 0.3;
    return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
}

/**
 * Bounce effect
 * Like a ball dropping
 * @param {number} t - Progress (0 to 1)
 * @returns {number} Eased value (0 to 1)
 */
export function easeOutBounce(t) {
    if (t < 1 / 2.75) {
        return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
        t -= 1.5 / 2.75;
        return 7.5625 * t * t + 0.75;
    } else if (t < 2.5 / 2.75) {
        t -= 2.25 / 2.75;
        return 7.5625 * t * t + 0.9375;
    } else {
        t -= 2.625 / 2.75;
        return 7.5625 * t * t + 0.984375;
    }
}

/**
 * Back easing - overshoots then returns
 * Creates anticipation
 * @param {number} t - Progress (0 to 1)
 * @returns {number} Eased value (can slightly exceed 0-1)
 */
export function easeInOutBack(t) {
    const s = 1.70158 * 1.525;
    if (t < 0.5) {
        return 0.5 * (t * 2 * t * 2 * ((s + 1) * t * 2 - s));
    }
    return 0.5 * ((t * 2 - 2) * (t * 2 - 2) * ((s + 1) * (t * 2 - 2) + s) + 2);
}

/**
 * Sine wave easing - very gentle
 * Natural for breathing animations
 * @param {number} t - Progress (0 to 1)
 * @returns {number} Eased value (0 to 1)
 */
export function easeInOutSine(t) {
    return -(Math.cos(Math.PI * t) - 1) / 2;
}

// Export all as default object for convenience
export default {
    linear,
    easeInOutCubic,
    easeInQuad,
    easeOutQuad,
    easeInOutQuad,
    easeOutElastic,
    easeOutBounce,
    easeInOutBack,
    easeInOutSine
};