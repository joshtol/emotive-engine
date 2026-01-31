/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Phoenix Spawn Preset
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Phoenix spawn pattern - wave formation rising with emissive scale animation
 * @module spawn-modes/presets/phoenix
 *
 * VISUAL DIAGRAM:
 *           ★          TOP (small, fading)
 *          ╱ ╲
 *        🔥   🔥       ← Expanding mid-rise
 *       ╱       ╲
 *     🔥    ★    🔥    ← Peak expansion
 *       ╲       ╱
 *        🔥   🔥       ← Contracting
 *          ╲ ╱
 *           ★          BOTTOM (small, emerging)
 *
 * Wave formation creates organic rising pattern.
 * Scale peaks in the middle of travel for dramatic "rebirth" effect.
 */

/**
 * Create a phoenix spawn mode configuration
 *
 * @param {Object} options - Phoenix options
 * @param {string[]} [options.models=['ring']] - Model names to spawn
 * @param {number} [options.ringCount=3] - Number of rings in the wave
 * @param {string} [options.start='bottom'] - Start landmark
 * @param {string} [options.end='above'] - End landmark (rises above mascot)
 * @param {string} [options.easing='easeOut'] - Easing function (easeOut for dramatic rise)
 * @param {number} [options.startDiameter=0.5] - Diameter at start (small)
 * @param {number} [options.endDiameter=0.3] - Diameter at end (fades small)
 * @param {number} [options.startScale=0.5] - Scale at start
 * @param {number} [options.endScale=0.3] - Scale at end (fades out)
 * @param {number} [options.spacing=0.15] - Wave amplitude
 * @param {number} [options.phaseOffset=0.1] - Timing stagger between rings
 * @param {string} [options.ringOrientation='vertical'] - Ring orientation (gyroscope effect)
 * @param {Object} [options.shaderAnimation] - Arc visibility shader settings
 * @returns {Object} Spawn mode configuration for axis-travel
 */
export function createPhoenixConfig(options = {}) {
    const {
        models = ['ring'],
        ringCount = 3,
        start = 'bottom',
        end = 'above',
        easing = 'easeOut',
        startDiameter = 0.5,
        endDiameter = 0.3,
        startScale = 0.5,
        endScale = 0.3,
        spacing = 0,            // All rings at same position (gyroscope)
        arcOffset = 120,        // 120 degrees between rings
        phaseOffset = 0,        // All rotate together
        ringOrientation = 'vertical',
        shaderAnimation = null,
    } = options;

    const config = {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start,
            end,
            easing,
            startScale,
            endScale,
            startDiameter,
            endDiameter,
            ringOrientation,
        },
        formation: {
            type: 'spiral',     // Spiral for rotation offset
            count: ringCount,
            spacing,
            arcOffset,          // 120 degrees between rings
            phaseOffset,
        },
        count: ringCount,
        scale: 1.0,
        models,
    };

    // Add shader animation if provided
    if (shaderAnimation) {
        config.animation = {
            modelOverrides: {},
        };
        for (const model of models) {
            config.animation.modelOverrides[model] = {
                shaderAnimation,
                orientationOverride: ringOrientation,
            };
        }
    }

    return config;
}

export default createPhoenixConfig;
