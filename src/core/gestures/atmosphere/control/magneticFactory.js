/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Magnetic Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory function for directional magnetic gestures
 * @author Emotive Engine Team
 * @module gestures/effects/magneticFactory
 *
 * Creates magnetic gestures that pull/push toward specific directions.
 * Particles and core are attracted/repelled in the specified direction.
 *
 * MAGNETIC: Attraction/repulsion effect (~1200ms, 3 beats)
 *
 * Use cases:
 * - magneticForward: Pull toward camera
 * - magneticBack: Push away from camera
 * - magneticUp/Down: Vertical attraction
 * - magneticLeft/Right: Horizontal attraction
 * - magneticAttract: Classic pull to center
 * - magneticRepel: Classic push from center
 */

import { capitalize } from '../../_shared/directions.js';

/**
 * Create a magnetic gesture - directional attraction/repulsion
 * @param {string} direction - 'forward', 'back', 'left', 'right', 'up', 'down', 'attract', 'repel'
 * @returns {Object} Gesture definition
 */
export function createMagneticGesture(direction) {
    const validDirections = ['forward', 'back', 'left', 'right', 'up', 'down', 'attract', 'repel'];
    if (!validDirections.includes(direction)) {
        throw new Error(`Invalid magnetic direction: ${direction}`);
    }

    const emojis = {
        forward: '🧲',
        back: '🧲',
        left: '⬅️',
        right: '➡️',
        up: '⬆️',
        down: '⬇️',
        attract: '🧲',
        repel: '💥'
    };

    const descriptions = {
        forward: 'Magnetic pull toward camera',
        back: 'Magnetic push away from camera',
        left: 'Magnetic pull leftward',
        right: 'Magnetic pull rightward',
        up: 'Magnetic pull upward',
        down: 'Magnetic pull downward',
        attract: 'Magnetic attraction to center',
        repel: 'Magnetic repulsion from center'
    };

    return {
        name: `magnetic${capitalize(direction)}`,
        emoji: emojis[direction],
        type: 'effect',
        description: descriptions[direction],

        config: {
            duration: 1200,
            musicalDuration: { musical: true, beats: 3 },
            direction,
            pullStrength: 1.0,
            returnToOrigin: true,
            strength: 1.0,
            particleMotion: {
                type: 'magnetic',
                strength: 1.0,
                direction
            }
        },

        rhythm: {
            enabled: true,
            syncMode: 'beat',
            durationSync: { mode: 'beats', beats: 3 },
            timingSync: 'onBeat',

            strengthSync: {
                onBeat: 1.5,
                offBeat: 0.7
            }
        },

        // 2D particle effects (inherited from base magnetic)
        initialize(particle, _motion, _centerX, _centerY) {
            if (!particle.gestureData) particle.gestureData = {};

            particle.gestureData.magnetic = {
                originalX: particle.x,
                originalY: particle.y,
                originalOpacity: particle.opacity ?? 1,
                initialized: true
            };
        },

        apply(particle, progress, motion, dt, centerX, centerY) {
            if (!particle.gestureData?.magnetic?.initialized) {
                this.initialize(particle, motion, centerX, centerY);
            }

            const config = { ...this.config, ...motion };
            const strength = config.strength || 1.0;
            const pullStrength = config.pullStrength || 1.0;
            const returnToOrigin = config.returnToOrigin !== false;
            const data = particle.gestureData.magnetic;
            const dir = config.direction || 'attract';

            // Effect envelope
            let effectStrength;
            if (returnToOrigin) {
                effectStrength = Math.sin(progress * Math.PI);
            } else {
                effectStrength = Math.min(1, progress * 2);
            }

            // Direction vectors for 2D
            let targetX, targetY;
            switch (dir) {
            case 'left':
                targetX = data.originalX - 100;
                targetY = data.originalY;
                break;
            case 'right':
                targetX = data.originalX + 100;
                targetY = data.originalY;
                break;
            case 'up':
                targetX = data.originalX;
                targetY = data.originalY - 100;
                break;
            case 'down':
                targetX = data.originalX;
                targetY = data.originalY + 100;
                break;
            case 'repel': {
                // Push away from center
                const dx = data.originalX - centerX;
                const dy = data.originalY - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                targetX = data.originalX + (dx / dist) * 100;
                targetY = data.originalY + (dy / dist) * 100;
                break;
            }
            default:
                // attract, forward, back - pull to center
                targetX = centerX;
                targetY = centerY;
            }

            // Calculate movement
            const moveX = (targetX - data.originalX) * effectStrength * pullStrength * strength * 0.5;
            const moveY = (targetY - data.originalY) * effectStrength * pullStrength * strength * 0.5;

            particle.x = data.originalX + moveX;
            particle.y = data.originalY + moveY;
        },

        cleanup(particle) {
            if (particle.gestureData?.magnetic) {
                const data = particle.gestureData.magnetic;
                particle.x = data.originalX;
                particle.y = data.originalY;
                particle.opacity = data.originalOpacity;
                delete particle.gestureData.magnetic;
            }
        },

        '3d': {
            evaluate(progress, motion) {
                const config = motion.config || this.config || {};
                const strength = config.strength || 1.0;
                const dir = config.direction || 'attract';
                const returnToOrigin = config.returnToOrigin !== false;

                // Effect envelope
                let effectStrength;
                if (returnToOrigin) {
                    effectStrength = Math.sin(progress * Math.PI);
                } else {
                    effectStrength = Math.min(1, progress * 2);
                }

                let posX = 0, posY = 0, posZ = 0;
                let scale = 1.0;

                // Direction-specific movement
                const moveAmount = 0.15 * effectStrength * strength;

                // Camera-relative coordinate system (from Core3DManager):
                // X: positive = right from camera's view, negative = left
                // Y: positive = up, negative = down
                // Z: POSITIVE = toward camera, NEGATIVE = away from camera
                switch (dir) {
                case 'forward':
                    // Forward = pull toward camera = positive Z
                    posZ = moveAmount;
                    scale = 1 + effectStrength * 0.1 * strength;
                    break;
                case 'back':
                    // Back = push away from camera = negative Z
                    posZ = -moveAmount;
                    scale = 1 - effectStrength * 0.08 * strength;
                    break;
                case 'left':
                    posX = -moveAmount;
                    break;
                case 'right':
                    posX = moveAmount;
                    break;
                case 'up':
                    posY = moveAmount;
                    break;
                case 'down':
                    posY = -moveAmount;
                    break;
                case 'attract':
                    // Classic attract - pull toward camera, contract
                    posZ = moveAmount;
                    scale = 1 - effectStrength * 0.1 * strength;
                    break;
                case 'repel':
                    // Classic repel - push away, expand
                    posZ = -moveAmount;
                    scale = 1 + effectStrength * 0.1 * strength;
                    break;
                }

                // Glow intensifies with magnetic field
                const glowIntensity = 1.0 + effectStrength * 0.4;
                const glowBoost = effectStrength * 0.3;

                // Vibration at peak magnetism
                const vibration = effectStrength > 0.5
                    ? Math.sin(progress * Math.PI * 20) * 0.01 * (effectStrength - 0.5) * 2
                    : 0;

                // Use camera-relative for ALL directions so magnetic works regardless of model rotation
                return {
                    cameraRelativePosition: [posX + vibration, posY, posZ],
                    rotation: [0, 0, 0],
                    scale,
                    glowIntensity,
                    glowBoost
                };
            }
        }
    };
}

// Export factory
export default createMagneticGesture;
