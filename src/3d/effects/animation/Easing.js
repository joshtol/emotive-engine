/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Animation Easing Library
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Comprehensive easing function library for elemental animations
 * @module effects/animation/Easing
 *
 * All easing functions take t (0-1) and return a value (typically 0-1).
 * Some functions like elastic/bounce may overshoot these bounds.
 *
 * Usage:
 *   import { Easing, getEasing } from './animation/Easing.js';
 *   const easedValue = Easing.easeOutCubic(t);
 *   // or
 *   const easingFn = getEasing('easeOutCubic');
 *   const easedValue = easingFn(t);
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// CORE EASING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Linear easing - constant speed
 * @param {number} t - Progress 0-1
 * @returns {number} Eased value
 */
export function linear(t) {
    return t;
}

/**
 * Ease in - slow start (quadratic by default)
 * @param {number} t - Progress 0-1
 * @returns {number} Eased value
 */
export function easeIn(t) {
    return t * t;
}

/**
 * Ease out - slow end (quadratic by default)
 * @param {number} t - Progress 0-1
 * @returns {number} Eased value
 */
export function easeOut(t) {
    return 1 - (1 - t) * (1 - t);
}

/**
 * Ease in-out - slow start and end (quadratic by default)
 * @param {number} t - Progress 0-1
 * @returns {number} Eased value
 */
export function easeInOut(t) {
    return t < 0.5
        ? 2 * t * t
        : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// QUADRATIC EASING (power of 2)
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Quadratic ease in - accelerating from zero
 * @param {number} t - Progress 0-1
 * @returns {number} Eased value
 */
export function easeInQuad(t) {
    return t * t;
}

/**
 * Quadratic ease out - decelerating to zero
 * @param {number} t - Progress 0-1
 * @returns {number} Eased value
 */
export function easeOutQuad(t) {
    return 1 - (1 - t) * (1 - t);
}

/**
 * Quadratic ease in-out - acceleration then deceleration
 * @param {number} t - Progress 0-1
 * @returns {number} Eased value
 */
export function easeInOutQuad(t) {
    return t < 0.5
        ? 2 * t * t
        : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CUBIC EASING (power of 3)
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Cubic ease in - strong accelerating from zero
 * @param {number} t - Progress 0-1
 * @returns {number} Eased value
 */
export function easeInCubic(t) {
    return t * t * t;
}

/**
 * Cubic ease out - strong decelerating to zero
 * @param {number} t - Progress 0-1
 * @returns {number} Eased value
 */
export function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

/**
 * Cubic ease in-out - strong acceleration then deceleration
 * @param {number} t - Progress 0-1
 * @returns {number} Eased value
 */
export function easeInOutCubic(t) {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ELASTIC EASING (springy overshoot)
// ═══════════════════════════════════════════════════════════════════════════════════════

const ELASTIC_C4 = (2 * Math.PI) / 3;
const ELASTIC_C5 = (2 * Math.PI) / 4.5;

/**
 * Elastic ease in - pull back then snap forward
 * @param {number} t - Progress 0-1
 * @returns {number} Eased value (can go below 0)
 */
export function elastic(t) {
    if (t === 0) return 0;
    if (t === 1) return 1;
    return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * ELASTIC_C4);
}

/**
 * Elastic ease out - overshoot then settle
 * @param {number} t - Progress 0-1
 * @returns {number} Eased value (can exceed 1)
 */
export function elasticOut(t) {
    if (t === 0) return 0;
    if (t === 1) return 1;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ELASTIC_C4) + 1;
}

/**
 * Elastic ease in-out - pull back, snap, overshoot, settle
 * @param {number} t - Progress 0-1
 * @returns {number} Eased value (can go below 0 or exceed 1)
 */
export function elasticInOut(t) {
    if (t === 0) return 0;
    if (t === 1) return 1;
    return t < 0.5
        ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * ELASTIC_C5)) / 2
        : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * ELASTIC_C5)) / 2 + 1;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// BOUNCE EASING (bouncing ball)
// ═══════════════════════════════════════════════════════════════════════════════════════

const BOUNCE_N1 = 7.5625;
const BOUNCE_D1 = 2.75;

/**
 * Helper function for bounce calculations
 * @param {number} t - Progress 0-1
 * @returns {number} Bounce value
 */
function bounceOutHelper(t) {
    if (t < 1 / BOUNCE_D1) {
        return BOUNCE_N1 * t * t;
    } else if (t < 2 / BOUNCE_D1) {
        return BOUNCE_N1 * (t -= 1.5 / BOUNCE_D1) * t + 0.75;
    } else if (t < 2.5 / BOUNCE_D1) {
        return BOUNCE_N1 * (t -= 2.25 / BOUNCE_D1) * t + 0.9375;
    } else {
        return BOUNCE_N1 * (t -= 2.625 / BOUNCE_D1) * t + 0.984375;
    }
}

/**
 * Bounce ease in - bounces at start
 * @param {number} t - Progress 0-1
 * @returns {number} Eased value
 */
export function bounce(t) {
    return 1 - bounceOutHelper(1 - t);
}

/**
 * Bounce ease out - bounces at end (like a ball landing)
 * @param {number} t - Progress 0-1
 * @returns {number} Eased value
 */
export function bounceOut(t) {
    return bounceOutHelper(t);
}

/**
 * Bounce ease in-out - bounces at both ends
 * @param {number} t - Progress 0-1
 * @returns {number} Eased value
 */
export function bounceInOut(t) {
    return t < 0.5
        ? (1 - bounceOutHelper(1 - 2 * t)) / 2
        : (1 + bounceOutHelper(2 * t - 1)) / 2;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SPECIAL EASING
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Snap - instant transition (step function)
 * Use for flash effects where you want immediate appearance
 * @param {number} t - Progress 0-1
 * @returns {number} 0 or 1
 */
export function snap(t) {
    return t < 0.5 ? 0 : 1;
}

/**
 * Step - no interpolation, useful for frame-by-frame
 * @param {number} t - Progress 0-1
 * @returns {number} 0 or 1
 */
export function step(t) {
    return t >= 1 ? 1 : 0;
}

/**
 * Smoothstep - hermite interpolation (S-curve)
 * Smoother than linear, commonly used in shaders
 * @param {number} t - Progress 0-1
 * @returns {number} Eased value
 */
export function smoothstep(t) {
    return t * t * (3 - 2 * t);
}

/**
 * Smoother step - Ken Perlin's smoother version
 * Even smoother acceleration/deceleration
 * @param {number} t - Progress 0-1
 * @returns {number} Eased value
 */
export function smootherstep(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// BACK EASING (anticipation/overshoot)
// ═══════════════════════════════════════════════════════════════════════════════════════

const BACK_C1 = 1.70158;
const BACK_C2 = BACK_C1 * 1.525;
const BACK_C3 = BACK_C1 + 1;

/**
 * Back ease in - pull back before accelerating
 * @param {number} t - Progress 0-1
 * @returns {number} Eased value (can go below 0)
 */
export function backIn(t) {
    return BACK_C3 * t * t * t - BACK_C1 * t * t;
}

/**
 * Back ease out - overshoot then settle back
 * @param {number} t - Progress 0-1
 * @returns {number} Eased value (can exceed 1)
 */
export function backOut(t) {
    return 1 + BACK_C3 * Math.pow(t - 1, 3) + BACK_C1 * Math.pow(t - 1, 2);
}

/**
 * Back ease in-out - pull back, overshoot, settle
 * @param {number} t - Progress 0-1
 * @returns {number} Eased value (can go below 0 or exceed 1)
 */
export function backInOut(t) {
    return t < 0.5
        ? (Math.pow(2 * t, 2) * ((BACK_C2 + 1) * 2 * t - BACK_C2)) / 2
        : (Math.pow(2 * t - 2, 2) * ((BACK_C2 + 1) * (t * 2 - 2) + BACK_C2) + 2) / 2;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EASING LOOKUP
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * All easing functions by name
 */
export const Easing = {
    // Core
    linear,
    easeIn,
    easeOut,
    easeInOut,

    // Quadratic
    easeInQuad,
    easeOutQuad,
    easeInOutQuad,

    // Cubic
    easeInCubic,
    easeOutCubic,
    easeInOutCubic,

    // Elastic
    elastic,
    elasticOut,
    elasticInOut,

    // Bounce
    bounce,
    bounceOut,
    bounceInOut,

    // Special
    snap,
    step,
    smoothstep,
    smootherstep,

    // Back
    backIn,
    backOut,
    backInOut,

    // Aliases for common naming conventions (easeOutBack, etc.)
    easeInBack: backIn,
    easeOutBack: backOut,
    easeInOutBack: backInOut,
    easeInElastic: elastic,
    easeOutElastic: elasticOut,
    easeInOutElastic: elasticInOut,
    easeInBounce: bounce,
    easeOutBounce: bounceOut,
    easeInOutBounce: bounceInOut
};

/**
 * Get easing function by name
 * @param {string|Function} easing - Easing name or custom function
 * @returns {Function} Easing function
 */
export function getEasing(easing) {
    // If it's already a function, return it
    if (typeof easing === 'function') {
        return easing;
    }

    // Look up by name
    if (typeof easing === 'string' && Easing[easing]) {
        return Easing[easing];
    }

    // Default to linear
    console.warn(`[Easing] Unknown easing "${easing}", falling back to linear`);
    return linear;
}

/**
 * Create a custom easing function with configurable parameters
 * @param {string} type - Easing type ('elastic', 'bounce', 'back')
 * @param {Object} params - Custom parameters
 * @returns {Function} Custom easing function
 */
export function createCustomEasing(type, params = {}) {
    switch (type) {
    case 'elastic': {
        const amplitude = params.amplitude ?? 1;
        const period = params.period ?? 0.3;
        const c4 = (2 * Math.PI) / period;
        return t => {
            if (t === 0) return 0;
            if (t === 1) return 1;
            return amplitude * Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
        };
    }

    case 'bounce': {
        const bounces = params.bounces ?? 4;
        const decay = params.decay ?? 0.5;
        return t => {
            let value = 0;
            let bounce = 1;
            for (let i = 0; i < bounces; i++) {
                const start = i === 0 ? 0 : (1 - Math.pow(decay, i)) / (1 - decay) / bounces;
                const end = (1 - Math.pow(decay, i + 1)) / (1 - decay) / bounces;
                if (t >= start && t < end) {
                    const localT = (t - start) / (end - start);
                    value = 4 * localT * (1 - localT) * bounce;
                    break;
                }
                bounce *= decay;
            }
            if (t >= 1) return 1;
            return Math.min(1, value);
        };
    }

    case 'back': {
        const overshoot = params.overshoot ?? 1.70158;
        return t => {
            return 1 + (overshoot + 1) * Math.pow(t - 1, 3) + overshoot * Math.pow(t - 1, 2);
        };
    }

    default:
        return linear;
    }
}

export default Easing;
