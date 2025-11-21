/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Gravitational Accretion Behavior
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Black hole gravitational accretion with Keplerian orbital mechanics
 * @author Emotive Engine Team
 * @module particles/behaviors/gravitational-accretion
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Particles spiral into black hole with realistic physics:
 * ║ • Keplerian orbital mechanics (v ∝ √(1/r))
 * ║ • Orbital decay via angular momentum dissipation
 * ║ • Spaghettification (tidal stretching) near event horizon
 * ║ • Particle death at Schwarzschild radius
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *                  ╱
 *               ╱ ╱     ← particles spiral inward
 *            ╱ ╱ ╱
 *         ╱ ╱ ╱ ╱
 *      ╱ ╱ ╱● ╱ ╱       ● = event horizon (black hole)
 *         ╲ ╲ ╲ ╲
 *            ╲ ╲ ╲
 *               ╲ ╲
 *                  ╲
 *
 * USED BY GEOMETRIES:
 * - blackHole (M87* supermassive black hole)
 *
 * TECHNICAL NOTES:
 * - This is a 3D-ONLY behavior
 * - The 2D particle system does minimal work (just initialization)
 * - All physics are handled by Particle3DTranslator._translateGravitationalAccretion()
 * - Particles store orbital state in behaviorData (radius, angle, tangentialSpeed)
 */

import { selectWeightedColor } from '../utils/colorUtils.js';

/**
 * Initialize gravitational accretion behavior for a particle
 * Sets up orbital parameters - actual physics handled in 3D translator
 *
 * @param {Particle} particle - The particle to initialize
 */
export function initializeGravitationalAccretion(particle) {
    // Minimal 2D initialization - just set behavior name
    // The 3D translator will initialize orbital parameters on first translation

    particle.vx = 0;  // No 2D movement
    particle.vy = 0;  // No 2D movement
    particle.lifeDecay = 0;  // No life decay - particles die at event horizon

    // Use emotion colors if provided (typically white/orange for hot accretion plasma)
    if (particle.emotionColors && particle.emotionColors.length > 0) {
        particle.color = selectWeightedColor(particle.emotionColors);
    }

    // Initialize behavior data - 3D translator will populate orbital parameters
    particle.behaviorData = {
        // Orbital state (initialized by 3D translator on first frame)
        radius: null,           // Current orbital radius (world units)
        angle: null,            // Current orbital angle (radians)
        tangentialSpeed: null,  // Current tangential velocity (Keplerian)
        initialized: false      // Flag for 3D translator to initialize
    };
}

/**
 * Update gravitational accretion behavior each frame
 * This is a NO-OP for 2D - all physics happen in 3D translator
 *
 * @param {Particle} particle - The particle to update
 * @param {number} dt - Delta time (frame time)
 * @param {number} centerX - Orb center X (unused)
 * @param {number} centerY - Orb center Y (unused)
 */
export function updateGravitationalAccretion(particle, dt, _centerX, _centerY) {
    // NO-OP in 2D space
    // All gravitational physics are handled by Particle3DTranslator._translateGravitationalAccretion()
    // The 3D translator updates particle.behaviorData with orbital state

    // Keep particle stationary in 2D canvas space
    particle.vx = 0;
    particle.vy = 0;
}

// Export behavior definition for registry
export default {
    name: 'gravitationalAccretion',
    emoji: '🕳️',
    description: 'Black hole accretion with Keplerian orbital mechanics and spaghettification',
    initialize: initializeGravitationalAccretion,
    update: updateGravitationalAccretion
};
