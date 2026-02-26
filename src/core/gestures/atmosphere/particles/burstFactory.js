/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Burst Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory function for directional burst gestures
 * @author Emotive Engine Team
 * @module gestures/effects/burstFactory
 *
 * Creates directional burst gestures for all four directions.
 * Unlike the original omni-directional burst, these burst in a specific direction.
 *
 * Use cases:
 * - burstUp: Fountain, celebration, firework
 * - burstDown: Shower, impact splash
 * - burstLeft/Right: Side explosion, whoosh
 */

import { DIRECTIONS, capitalize } from '../../_shared/directions.js';

/**
 * Create a directional burst gesture
 * @param {string} direction - 'up', 'down', 'left', 'right'
 * @returns {Object} Gesture definition
 */
export function createBurstGesture(direction) {
    const dir = DIRECTIONS[direction];
    if (!dir) throw new Error(`Invalid burst direction: ${direction}`);

    const isVertical = direction === 'up' || direction === 'down';

    return {
        name: `burst${capitalize(direction)}`,
        emoji: direction === 'up' ? '⛲' : direction === 'down' ? '🚿' : '💨',
        type: 'blending',
        description: `Explosive burst ${direction}`,

        config: {
            duration: 600,
            musicalDuration: { musical: true, beats: 1 },
            decay: 0.5,
            strength: 2.0,
            spread: 0.3, // How much spread perpendicular to direction
            direction,
            particleMotion: {
                type: 'burst',
                strength: 2.0,
                direction,
            },
        },

        rhythm: {
            enabled: true,
            syncMode: 'beat',
            durationSync: { mode: 'beats', beats: 1 },
            timingSync: 'onBeat',

            strengthSync: {
                onBeat: 3.5,
                offBeat: 1.0,
                curve: 'explosion',
            },

            accentResponse: {
                enabled: true,
                multiplier: 2.5,
                type: 'strength',
            },
        },

        apply(particle, progress, motion, dt, _centerX, _centerY) {
            const config = { ...this.config, ...motion };
            const decay = config.decay || 0.5;
            const strength = (config.strength || 2.0) * (1 - progress * decay);
            const spread = config.spread || 0.3;

            // Main direction force
            let forceX = dir.x * strength * 2;
            let forceY = dir.y * strength * 2;

            // Add spread perpendicular to direction
            const spreadForce = (Math.random() - 0.5) * spread * strength;
            if (isVertical) {
                forceX += spreadForce;
            } else {
                forceY += spreadForce;
            }

            particle.vx += forceX * dt;
            particle.vy += forceY * dt;
        },

        '3d': {
            evaluate(progress, motion) {
                const config = motion.config || this.config || {};
                const strength = config.strength || 2.0;
                const burstDirection = config.direction || 'up';

                // Phase 1: Explosive burst (0-0.15)
                // Phase 2: Recoil (0.15-0.35)
                // Phase 3: Settle (0.35-1.0)
                let posX = 0,
                    posY = 0,
                    posZ = 0;
                let scale = 1.0,
                    glow = 1.0,
                    glowBoost = 0;

                // Direction vectors for 3D
                const dirVec = { up: [0, 1], down: [0, -1], left: [-1, 0], right: [1, 0] };
                const [dx, dy] = dirVec[burstDirection] || [0, 1];

                if (progress < 0.15) {
                    // Explosive burst
                    const attack = progress / 0.15;
                    const eased = 1 - Math.pow(1 - attack, 3);
                    posX = dx * eased * 0.2 * strength;
                    posY = dy * eased * 0.2 * strength;
                    posZ = eased * 0.1 * strength; // Also come forward
                    scale = 1.0 + eased * 0.15 * strength;
                    glow = 1.0 + eased * 0.5;
                    glowBoost = eased * 0.4;
                } else if (progress < 0.35) {
                    // Recoil
                    const recoilT = (progress - 0.15) / 0.2;
                    const remain = 1 - recoilT * 1.5;
                    posX = dx * 0.2 * remain * strength;
                    posY = dy * 0.2 * remain * strength;
                    posZ = 0.1 * remain * strength;
                    scale = 1.0 + 0.15 * (1 - recoilT) * strength;
                    glow = 1.0 + (1 - recoilT) * 0.4;
                    glowBoost = (1 - recoilT) * 0.2;
                } else {
                    // Damped settle
                    const settleT = (progress - 0.35) / 0.65;
                    const decay = Math.pow(1 - settleT, 2);
                    const ring = Math.sin(settleT * Math.PI * 2) * decay;
                    posX = dx * ring * 0.05 * strength;
                    posY = dy * ring * 0.05 * strength;
                    scale = 1.0 + ring * 0.05;
                    glow = 1.0 + Math.abs(ring) * 0.15;
                }

                return {
                    cameraRelativePosition: [posX, posY, posZ],
                    position: [0, 0, 0],
                    rotation: [0, 0, 0],
                    scale,
                    glowIntensity: glow,
                    glowBoost,
                };
            },
        },
    };
}

export default createBurstGesture;
