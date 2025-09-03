/**
 * Easing Functions - Smooth animation transitions
 * Provides various easing functions for natural motion
 */

/**
 * Linear easing - no acceleration
 * @param {number} t - Progress (0 to 1)
 * @returns {number} Eased value
 */
export function linear(t) {
    return t;
}

/**
 * Ease out quadratic - decelerating to zero velocity
 * @param {number} t - Progress (0 to 1)
 * @returns {number} Eased value
 */
export function easeOutQuad(t) {
    return t * (2 - t);
}

/**
 * Ease in quadratic - accelerating from zero velocity
 * @param {number} t - Progress (0 to 1)
 * @returns {number} Eased value
 */
export function easeInQuad(t) {
    return t * t;
}

/**
 * Ease in-out quadratic - acceleration until halfway, then deceleration
 * @param {number} t - Progress (0 to 1)
 * @returns {number} Eased value
 */
export function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/**
 * Ease out cubic - decelerating to zero velocity (smoother than quad)
 * @param {number} t - Progress (0 to 1)
 * @returns {number} Eased value
 */
export function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

/**
 * Ease in cubic - accelerating from zero velocity
 * @param {number} t - Progress (0 to 1)
 * @returns {number} Eased value
 */
export function easeInCubic(t) {
    return t * t * t;
}

/**
 * Ease in-out cubic - acceleration until halfway, then deceleration
 * @param {number} t - Progress (0 to 1)
 * @returns {number} Eased value
 */
export function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Ease out elastic - elastic snap effect
 * @param {number} t - Progress (0 to 1)
 * @returns {number} Eased value
 */
export function easeOutElastic(t) {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

/**
 * Ease out bounce - bouncing effect
 * @param {number} t - Progress (0 to 1)
 * @returns {number} Eased value
 */
export function easeOutBounce(t) {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
        return n1 * t * t;
    } else if (t < 2 / d1) {
        return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
}

/**
 * Ease in-out back - slight overshoot effect
 * @param {number} t - Progress (0 to 1)
 * @returns {number} Eased value
 */
export function easeInOutBack(t) {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;

    return t < 0.5
        ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
        : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
}

/**
 * Ease out sine - sinusoidal easing
 * @param {number} t - Progress (0 to 1)
 * @returns {number} Eased value
 */
export function easeOutSine(t) {
    return Math.sin((t * Math.PI) / 2);
}

/**
 * Ease in-out sine - sinusoidal easing with smooth start and end
 * @param {number} t - Progress (0 to 1)
 * @returns {number} Eased value
 */
export function easeInOutSine(t) {
    return -(Math.cos(Math.PI * t) - 1) / 2;
}

/**
 * Gets an easing function by name
 * @param {string} name - Name of the easing function
 * @returns {Function} Easing function
 */
export function getEasingFunction(name) {
    const easingFunctions = {
        linear,
        easeOutQuad,
        easeInQuad,
        easeInOutQuad,
        easeOutCubic,
        easeInCubic,
        easeInOutCubic,
        easeOutElastic,
        easeOutBounce,
        easeInOutBack,
        easeOutSine,
        easeInOutSine
    };

    return easingFunctions[name] || linear;
}

/**
 * Applies easing to a value between start and end
 * @param {number} progress - Progress (0 to 1)
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {string|Function} easing - Easing function name or function
 * @returns {number} Eased value between start and end
 */
export function applyEasing(progress, start, end, easing = 'linear') {
    const easingFn = typeof easing === 'string' ? getEasingFunction(easing) : easing;
    const easedProgress = easingFn(Math.max(0, Math.min(1, progress)));
    return start + (end - start) * easedProgress;
}