/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Shatter Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory function for shatter gestures that trigger mesh fragmentation
 * @author Emotive Engine Team
 * @module gestures/transforms/shatterFactory
 *
 * SHATTER: Mesh breaks into fragments that fly apart, optionally revealing
 * an inner mesh (soul). Used for dramatic storytelling moments.
 *
 * ## Variants
 *
 * - `shatter` (default): Standard outward explosion from impact point
 * - `shatterExplosive`: High-energy explosion from center
 * - `shatterCrumble`: Gravity-driven collapse (slower, more dramatic)
 *
 * ## Animation Phases
 *
 * 1. Build-up (0-10%): Glow intensifies, slight scale increase
 * 2. Trigger (10%): Shatter event fires, mesh hidden, shards activated
 * 3. Aftermath (10-100%): Shards animate, glow fades
 */

import { capitalize } from '../motions/directions.js';

/**
 * Shatter variant configurations
 */
const SHATTER_VARIANTS = {
    default: {
        name: 'shatter',
        emoji: '💥',
        description: 'Dramatic shattering effect',
        duration: 2500,
        beats: 4,
        intensity: 1.0,
        impactPoint: [0, 0, 0.4]  // Front-center
    },
    explosive: {
        name: 'shatterExplosive',
        emoji: '🔥',
        description: 'Explosive outward shatter',
        duration: 2000,
        beats: 3,
        intensity: 1.5,
        impactPoint: [0, 0, 0]  // Center
    },
    crumble: {
        name: 'shatterCrumble',
        emoji: '🪨',
        description: 'Slow crumbling collapse',
        duration: 4000,
        beats: 8,
        intensity: 0.7,
        impactPoint: [0, -0.4, 0]  // Bottom
    }
};

/**
 * Create a shatter gesture
 * @param {string} [variant='default'] - 'default', 'explosive', or 'crumble'
 * @returns {Object} Gesture definition
 */
export function createShatterGesture(variant = 'default') {
    const config = SHATTER_VARIANTS[variant] || SHATTER_VARIANTS.default;

    return {
        name: config.name,
        emoji: config.emoji,
        type: 'override',
        description: config.description,

        config: {
            duration: config.duration,
            musicalDuration: { musical: true, beats: config.beats },
            intensity: config.intensity,
            variant
        },

        rhythm: {
            enabled: true,
            syncMode: 'beat',
            durationSync: { mode: 'beats', beats: config.beats },
            timingSync: 'onBeat',
            accentResponse: {
                enabled: true,
                multiplier: 1.3
            }
        },

        '3d': {
            evaluate(progress, motion) {
                const cfg = motion.config || this.config || {};
                const intensity = cfg.intensity || 1.0;
                const variantType = cfg.variant || 'default';
                const variantConfig = SHATTER_VARIANTS[variantType] || SHATTER_VARIANTS.default;

                // Track if we've triggered (only trigger once)
                let shatterTrigger = false;
                let glowIntensity = 1.0;
                let glowBoost = 0;
                let scale = 1.0;

                // ═══════════════════════════════════════════════════════════════
                // PHASE 1: BUILD-UP (0-10%)
                // ═══════════════════════════════════════════════════════════════
                if (progress < 0.1) {
                    const t = progress / 0.1;
                    // Ease in
                    const eased = t * t;

                    glowIntensity = 1.0 + eased * 0.6;
                    glowBoost = eased * 0.3;
                    scale = 1.0 + eased * 0.05;

                    // Subtle shake before shatter
                    if (variantType === 'explosive') {
                        const shake = Math.sin(progress * 200) * 0.01 * t;
                        scale += shake;
                    }
                }
                // ═══════════════════════════════════════════════════════════════
                // PHASE 2: TRIGGER POINT (10-12%)
                // ═══════════════════════════════════════════════════════════════
                else if (progress < 0.12) {
                    // Trigger shatter at exactly 10%
                    shatterTrigger = progress >= 0.1 && progress < 0.105;

                    glowIntensity = 1.6;
                    glowBoost = 0.4;
                    scale = 1.05;
                }
                // ═══════════════════════════════════════════════════════════════
                // PHASE 3: AFTERMATH (12-100%)
                // ═══════════════════════════════════════════════════════════════
                else {
                    const t = (progress - 0.12) / 0.88;
                    // Ease out
                    const eased = 1 - (1 - t) * (1 - t);

                    glowIntensity = 1.6 - eased * 0.6;
                    glowBoost = 0.4 - eased * 0.4;
                    scale = 1.0;
                }

                return {
                    scale,
                    glowIntensity,
                    glowBoost,

                    // Shatter channel - consumed by Core3DManager
                    shatter: {
                        enabled: shatterTrigger,
                        impactPoint: variantConfig.impactPoint,
                        intensity: intensity * variantConfig.intensity,
                        variant: variantType
                    }
                };
            }
        }
    };
}

/**
 * Create all shatter gesture variants
 * @returns {Object[]} Array of gesture definitions
 */
export function createAllShatterGestures() {
    return Object.keys(SHATTER_VARIANTS).map(variant => createShatterGesture(variant));
}

/**
 * Get available shatter variant names
 * @returns {string[]}
 */
export function getShatterVariants() {
    return Object.keys(SHATTER_VARIANTS);
}

export default createShatterGesture;
