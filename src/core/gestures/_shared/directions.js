/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Direction Vectors
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Shared direction vectors for directional gestures
 * @author Emotive Engine Team
 * @module gestures/motions/directions
 *
 * Centralized direction definitions used by all directional gesture factories.
 * Single source of truth for movement vectors.
 */

/**
 * Cardinal direction vectors (normalized)
 * Used for step, slide, lean, float, point gestures
 */
export const DIRECTIONS = {
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
    up: { x: 0, y: 1 },
    down: { x: 0, y: -1 },
};

/**
 * Diagonal direction vectors (normalized to unit length)
 * Available for future use if diagonal gestures are needed
 */
export const DIAGONALS = {
    upLeft: { x: -0.7071, y: 0.7071 },
    upRight: { x: 0.7071, y: 0.7071 },
    downLeft: { x: -0.7071, y: -0.7071 },
    downRight: { x: 0.7071, y: -0.7071 },
};

/**
 * All directions combined
 */
export const ALL_DIRECTIONS = {
    ...DIRECTIONS,
    ...DIAGONALS,
};

/**
 * Direction utilities
 */
export function isValidDirection(direction) {
    return direction in DIRECTIONS;
}

export function isValidDiagonal(direction) {
    return direction in DIAGONALS;
}

export function getDirection(direction) {
    return ALL_DIRECTIONS[direction] || null;
}

/**
 * Capitalize first letter for gesture naming
 * @param {string} str - Direction string
 * @returns {string} Capitalized string (e.g., 'left' -> 'Left')
 */
export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
