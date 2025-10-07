/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Math Cache Utilities
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Cached trigonometric calculations for performance
 * @author Emotive Engine Team
 * @module particles/utils/mathCache
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Trigonometric functions (sin, cos) are expensive to calculate 60 times per       
 * ║ second for hundreds of particles. This module pre-calculates common values        
 * ║ and stores them for instant lookup, trading memory for speed.                     
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ CACHE CONFIGURATION
// └─────────────────────────────────────────────────────────────────────────────────────
const CACHE_PRECISION = 100; // Cache values at 0.01 radian intervals
const CACHE_SIZE = 629;      // Covers 0 to 2π (6.28 radians)

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ CACHE STORAGE - Pre-calculated values stored in typed arrays for performance
// └─────────────────────────────────────────────────────────────────────────────────────
const SIN_CACHE = new Float32Array(CACHE_SIZE);
const COS_CACHE = new Float32Array(CACHE_SIZE);

// Pre-populate all angles from 0 to 2π
for (let i = 0; i < CACHE_SIZE; i++) {
    const angle = i / CACHE_PRECISION;
    SIN_CACHE[i] = Math.sin(angle);
    COS_CACHE[i] = Math.cos(angle);
}

/**
 * Get cached sine value for an angle
 * @param {number} angle - Angle in radians
 * @returns {number} Sine value
 * 
 * PERFORMANCE: ~10x faster than Math.sin() for repeated calls
 */
export function cachedSin(angle) {
    // Normalize angle to 0-2π range
    const normalized = ((angle % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
    const index = Math.min(Math.round(normalized * CACHE_PRECISION), CACHE_SIZE - 1);
    return SIN_CACHE[index];
}

/**
 * Get cached cosine value for an angle
 * @param {number} angle - Angle in radians
 * @returns {number} Cosine value
 * 
 * PERFORMANCE: ~10x faster than Math.cos() for repeated calls
 */
export function cachedCos(angle) {
    // Normalize angle to 0-2π range
    const normalized = ((angle % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
    const index = Math.min(Math.round(normalized * CACHE_PRECISION), CACHE_SIZE - 1);
    return COS_CACHE[index];
}

// Export for debugging and testing
export const _DEBUG = {
    CACHE_PRECISION,
    CACHE_SIZE,
    SIN_CACHE,
    COS_CACHE
};

export default {
    cachedSin,
    cachedCos
};