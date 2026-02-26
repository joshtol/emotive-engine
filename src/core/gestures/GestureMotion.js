/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Gesture Motion Orchestrator
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Orchestrator for modular gesture system - replaces monolithic switch
 * @author Emotive Engine Team
 * @module gestures/GestureMotion
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ This orchestrator manages gesture application using the modular gesture system.
 * ║ It replaces the old 538-line switch statement with clean, modular lookups.
 * ║ Drop-in replacement for the old applyGestureMotion function.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

import { getGesture, isBlendingGesture, isOverrideGesture } from './index.js';
import rhythmIntegration from '../audio/rhythmIntegration.js';

/**
 * Apply gesture motion to a particle using the modular system
 * This is a drop-in replacement for the old applyGestureMotion function
 *
 * @param {Particle} particle - The particle to animate
 * @param {number} dt - Delta time (normalized to 60fps)
 * @param {Object} motion - Gesture motion configuration
 * @param {number} progress - Gesture progress (0-1)
 * @param {number} centerX - Orb center X position
 * @param {number} centerY - Orb center Y position
 */
export function applyGestureMotion(particle, dt, motion, progress, centerX, centerY) {
    // Validate inputs
    if (!motion || !motion.type || progress >= 1) {
        return;
    }

    // Initialize gesture data if needed
    if (!particle.gestureData) {
        particle.gestureData = {
            originalVx: particle.vx,
            originalVy: particle.vy,
            initialX: particle.x,
            initialY: particle.y,
            // For compatibility with gestures that expect these
            startAngle: Math.atan2(particle.y - centerY, particle.x - centerX),
            startRadius: Math.sqrt(
                Math.pow(particle.x - centerX, 2) + Math.pow(particle.y - centerY, 2)
            ),
        };
    }

    // Look up the gesture from registry
    const gesture = getGesture(motion.type);

    if (!gesture) {
        return;
    }

    // Apply rhythm modulation if enabled
    let rhythmModifiedMotion = motion;
    if (rhythmIntegration.isEnabled() && gesture.rhythm?.enabled) {
        const modulation = rhythmIntegration.applyGestureRhythm(gesture, particle, progress, dt);

        // Create modified motion with rhythm adjustments
        rhythmModifiedMotion = {
            ...motion,
            amplitude:
                (motion.amplitude || 1) *
                (modulation.amplitudeMultiplier || 1) *
                (modulation.accentMultiplier || 1),
            wobbleAmount: (motion.wobbleAmount || 0) * (modulation.wobbleMultiplier || 1),
            // Allow rhythm to affect other parameters as needed
            rhythmModulation: modulation,
        };
    }

    // Apply the gesture using its modular implementation
    if (gesture.apply) {
        gesture.apply(particle, progress, rhythmModifiedMotion, dt, centerX, centerY);
    }

    // Handle cleanup when gesture completes
    if (progress >= 0.99 && gesture.cleanup) {
        gesture.cleanup(particle);
        // Reset gesture data for next gesture
        particle.gestureData = null;
    }
}

/**
 * Helper function to check if a gesture should override particle behavior
 * Used by Particle.js to determine update flow
 *
 * @param {string} gestureType - The gesture type name
 * @returns {boolean} True if gesture completely overrides particle motion
 */
export function isGestureOverriding(gestureType) {
    return isOverrideGesture(gestureType);
}

/**
 * Helper function to check if a gesture blends with existing motion
 * Used by Particle.js to determine update flow
 *
 * @param {string} gestureType - The gesture type name
 * @returns {boolean} True if gesture blends with existing motion
 */
export function isGestureBlending(gestureType) {
    return isBlendingGesture(gestureType);
}

/**
 * Get list of all available gesture types
 * Useful for debugging and UI generation
 *
 * @returns {Array<string>} Array of gesture type names
 */
export function getAvailableGestures() {
    const gestures = [];

    // Import the registry to get all gestures
    import('./index.js').then(module => {
        const allGestures = module.listGestures();
        allGestures.forEach(g => gestures.push(g.name));
    });

    return gestures;
}

/**
 * Legacy compatibility layer
 * Maps old gesture motion configurations to new system
 *
 * @param {Object} motion - Old-style motion object
 * @returns {Object} Normalized motion object
 */
function normalizeMotion(motion) {
    // Handle legacy motion properties
    const normalized = { ...motion };

    // Map legacy aliases to their primary gestures
    if (motion.type === 'radial') {
        normalized.type = 'pulse';
    }

    if (motion.type === 'oscillate') {
        normalized.type = 'bounce';
        normalized.axis = motion.axis || 'vertical';
    }

    if (motion.type === 'jitter') {
        normalized.type = 'shake';
    }

    return normalized;
}

/**
 * Main export - drop-in replacement for old applyGestureMotion
 * Includes legacy compatibility
 */
export default function (particle, dt, motion, progress, centerX, centerY) {
    // Normalize motion for legacy compatibility
    const normalizedMotion = normalizeMotion(motion);

    // Apply using modular system
    applyGestureMotion(particle, dt, normalizedMotion, progress, centerX, centerY);
}

// Also export named function for clarity
export { applyGestureMotion as applyModularGestureMotion };
