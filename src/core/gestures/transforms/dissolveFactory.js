/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Dissolve Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory for dissolve gestures - shards blow away like dust in wind
 * @author Emotive Engine Team
 * @module gestures/transforms/dissolveFactory
 *
 * DISSOLVE: Shards blow away in a specified wind direction, fading like dust.
 * Creates an ethereal, melancholic effect - great for sad/loss emotions.
 *
 * ## Directional Variants
 *
 * - dissolveUp: Wind blows shards upward (ascending, release)
 * - dissolveDown: Wind blows shards downward (falling, despair)
 * - dissolveLeft: Wind blows shards left (departure)
 * - dissolveRight: Wind blows shards right (moving on)
 * - dissolveAway: Wind blows shards away from camera (fading into distance)
 * - dissolveToward: Wind blows shards toward camera (approaching)
 *
 * ## Dual-Mode Behavior
 *
 * - From IDLE: Shatters mesh first, then dissolves shards in wind direction
 * - From FROZEN: Blows existing frozen shards away in wind direction
 */

/**
 * Wind direction configurations for dissolve variants
 */
const DISSOLVE_DIRECTIONS = {
    up: {
        name: 'dissolveUp',
        emoji: '🌬️',
        description: 'Shards blow upward like rising dust',
        windDirection: [0, 1, 0.1],      // Up with slight forward drift
        windForce: 2.5,
        turbulence: 0.6
    },
    down: {
        name: 'dissolveDown',
        emoji: '💨',
        description: 'Shards blow downward like falling ash',
        windDirection: [0, -1, 0.1],     // Down with slight forward drift
        windForce: 1.8,
        turbulence: 0.4
    },
    left: {
        name: 'dissolveLeft',
        emoji: '⬅️',
        description: 'Shards blow left in the wind',
        windDirection: [-1, 0.15, 0],    // World -X = screen left (for dual-mode dissolve)
        impactDir: [1, 0.15, 0],         // Camera-relative (inverted X due to camRight calculation)
        windForce: 2.2,
        turbulence: 0.5
    },
    right: {
        name: 'dissolveRight',
        emoji: '➡️',
        description: 'Shards blow right in the wind',
        windDirection: [1, 0.15, 0],     // World +X = screen right (for dual-mode dissolve)
        impactDir: [-1, 0.15, 0],        // Camera-relative (inverted X due to camRight calculation)
        windForce: 2.2,
        turbulence: 0.5
    },
    away: {
        name: 'dissolveAway',
        emoji: '🌫️',
        description: 'Shards blow away from camera into distance',
        windDirection: [0, 0.1, -1],     // Away (negative Z) with slight lift
        windForce: 2.0,
        turbulence: 0.4
    },
    toward: {
        name: 'dissolveToward',
        emoji: '🌪️',
        description: 'Shards blow toward camera',
        windDirection: [0, 0.1, 1],      // Toward (positive Z) with slight lift
        windForce: 2.5,
        turbulence: 0.6
    }
};

/**
 * Create a dissolve gesture with specified wind direction
 * @param {string} direction - 'up', 'down', 'left', 'right', 'away', 'toward'
 * @returns {Object} Gesture definition
 */
export function createDissolveGesture(direction = 'away') {
    const dirConfig = DISSOLVE_DIRECTIONS[direction] || DISSOLVE_DIRECTIONS.away;

    return {
        name: dirConfig.name,
        emoji: dirConfig.emoji,
        type: 'override',
        description: dirConfig.description,

        config: {
            duration: 3500,
            musicalDuration: { musical: true, beats: 6 },
            intensity: 0.7,
            direction
        },

        rhythm: {
            enabled: true,
            syncMode: 'beat',
            durationSync: { mode: 'beats', beats: 6 },
            timingSync: 'onBeat',
            accentResponse: {
                enabled: true,
                multiplier: 1.2
            }
        },

        '3d': {
            evaluate(progress, motion) {
                const cfg = motion.config || this.config || {};
                const intensity = cfg.intensity || 0.7;
                const dir = cfg.direction || 'away';
                const config = DISSOLVE_DIRECTIONS[dir] || DISSOLVE_DIRECTIONS.away;

                let shatterTrigger = false;
                let glowIntensity = 1.0;
                let glowBoost = 0;
                let scale = 1.0;

                // Phase timing - dissolve starts IMMEDIATELY with shatter (like leaves on wind)
                const shatterAt = 0.06;

                // PHASE 1: Build-up (0-6%)
                if (progress < shatterAt) {
                    const t = progress / shatterAt;
                    glowIntensity = 1.0 + t * 0.4;
                    glowBoost = t * 0.2;
                    scale = 1.0 + t * 0.03;
                }
                // PHASE 2: Shatter trigger (6%)
                else if (progress < shatterAt + 0.02) {
                    shatterTrigger = progress >= shatterAt && progress < shatterAt + 0.005;
                    glowIntensity = 1.4;
                    glowBoost = 0.3;
                }
                // PHASE 3: Dissolving (8-100%) - shards blow away like leaves
                else {
                    const dissolveProgress = (progress - shatterAt) / (1 - shatterAt);
                    // Glow fades as shards dissolve
                    glowIntensity = 1.4 - dissolveProgress * 0.6;
                    glowBoost = Math.max(0, 0.3 - dissolveProgress * 0.3);
                }

                return {
                    scale,
                    glowIntensity,
                    glowBoost,

                    // Shatter channel - dissolve starts immediately (no freeze pause)
                    shatter: {
                        enabled: shatterTrigger,
                        impactPoint: [0, 0, 0],
                        impactDirection: config.impactDir || config.windDirection,
                        intensity: intensity * 0.5,
                        variant: `dissolve_${dir}`,
                        // Soul reveal
                        revealSoul: true,
                        // NO freeze/suspend - immediate dissolve like leaves on wind
                        isSuspendMode: false,
                        isFreezeMode: false,
                        // Gentle initial physics - wind takes over immediately
                        gravity: -0.5,
                        explosionForce: 0.3,
                        gestureDuration: 3500,
                        // Dual-mode dissolve - starts immediately (no transition delay)
                        isDualMode: true,
                        dualModeType: 'dissolve',
                        dualModeConfig: {
                            duration: 3000,
                            windDirection: config.windDirection,
                            windForce: config.windForce * intensity,
                            turbulence: config.turbulence
                        }
                    }
                };
            }
        }
    };
}

/**
 * Create all dissolve gesture variants
 * @returns {Object[]} Array of gesture definitions
 */
export function createAllDissolveGestures() {
    return Object.keys(DISSOLVE_DIRECTIONS).map(dir => createDissolveGesture(dir));
}

/**
 * Get available dissolve direction names
 * @returns {string[]}
 */
export function getDissolveDirections() {
    return Object.keys(DISSOLVE_DIRECTIONS);
}

export default createDissolveGesture;
