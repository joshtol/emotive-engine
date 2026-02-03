/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Vortex Spawn Preset
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Vortex spawn pattern - spiral rings traveling upward with funnel expansion
 * @module spawn-modes/presets/vortex
 *
 * VISUAL DIAGRAM:
 *        ┌─────┐  TOP (wide)
 *       ╱       ╲
 *      │  🔥🔥🔥  │   ← Rings expand as they rise
 *       ╲       ╱
 *        └─────┘  BOTTOM (narrow)
 *
 * Each ring is offset by arcOffset degrees (default 120° for 3 rings = fire tornado)
 */

/**
 * Create a vortex spawn mode configuration
 *
 * @param {Object} options - Vortex options
 * @param {string[]} [options.models=['ring']] - Model names to spawn
 * @param {number} [options.ringCount=3] - Number of rings in the spiral
 * @param {number} [options.arcOffset=120] - Degrees between each ring
 * @param {string} [options.start='bottom'] - Start landmark (bottom, feet, center, etc.)
 * @param {string} [options.end='top'] - End landmark (top, head, above, etc.)
 * @param {string} [options.easing='easeInOut'] - Easing function name
 * @param {number} [options.startDiameter=0.8] - Diameter at start (funnel narrow)
 * @param {number} [options.endDiameter=1.2] - Diameter at end (funnel wide)
 * @param {number} [options.startScale=0.9] - Scale at start
 * @param {number} [options.endScale=1.1] - Scale at end
 * @param {number} [options.spacing=0.12] - Vertical spacing between rings
 * @param {number} [options.phaseOffset=0.05] - Timing stagger between rings
 * @param {string} [options.orientation='flat'] - Ring orientation: flat, vertical, radial, camera
 * @param {Object} [options.shaderAnimation] - Arc visibility shader settings
 * @returns {Object} Spawn mode configuration for axis-travel
 */
export function createVortexConfig(options = {}) {
    const {
        models = ['ring'],
        ringCount = 3,
        arcOffset = 120,
        start = 'bottom',
        end = 'top',
        easing = 'easeInOut',
        startDiameter = 0.8,
        endDiameter = 1.2,
        startScale = 0.9,
        endScale = 1.1,
        spacing = 0,            // All rings at same position (tornado)
        phaseOffset = 0,        // All travel together
        orientation = 'flat',
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
            orientation,
        },
        formation: {
            type: 'spiral',
            count: ringCount,
            spacing,
            arcOffset,
            phaseOffset,
        },
        count: ringCount,
        scale: 1.0,
        models,
    };

    // Add shader animation if provided (e.g., rotating arc visibility)
    if (shaderAnimation) {
        config.animation = {
            modelOverrides: {},
        };
        // Apply to all models
        for (const model of models) {
            config.animation.modelOverrides[model] = {
                shaderAnimation,
                orientationOverride: orientation,
            };
        }
    }

    return config;
}

export default createVortexConfig;
