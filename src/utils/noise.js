/**
 * Pseudo-random hash and 1D value noise for deterministic animation.
 * Used by elemental gesture factories for flicker, jitter, and tremor.
 */

/**
 * Deterministic hash function based on sin().
 * @param {number} n - Input value
 * @returns {number} Pseudo-random value in [0, 1)
 */
export function hash(n) {
    return (((Math.sin(n) * 43758.5453) % 1) + 1) % 1;
}

/**
 * 1D value noise with Hermite interpolation.
 * @param {number} x - Input coordinate
 * @returns {number} Smooth noise value in [0, 1)
 */
export function noise1D(x) {
    const i = Math.floor(x);
    const f = x - i;
    const u = f * f * (3 - 2 * f);
    return hash(i) * (1 - u) + hash(i + 1) * u;
}
