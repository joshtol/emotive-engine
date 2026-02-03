/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Drill Spawn Preset
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Drill spawn pattern - spiral rings traveling DOWN with narrowing
 * @module spawn-modes/presets/drill
 *
 * VISUAL DIAGRAM:
 *      ┌───────┐   TOP (wide)
 *       ╲     ╱
 *        ╲   ╱     ← Rings spiral downward
 *         ╲ ╱
 *          V       BOTTOM (narrow point)
 *
 * Opposite of vortex - starts wide at top, narrows as it drills down.
 * Fast rotation creates drilling/boring visual.
 */

/**
 * Create a drill spawn mode configuration
 *
 * @param {Object} options - Drill options
 * @param {string[]} [options.models=['ring']] - Model names to spawn
 * @param {number} [options.ringCount=3] - Number of rings in the spiral
 * @param {number} [options.arcOffset=90] - Degrees between each ring (fast rotation)
 * @param {string} [options.start='top'] - Start landmark (top of mascot)
 * @param {string} [options.end='bottom'] - End landmark (drilling down)
 * @param {string} [options.easing='easeIn'] - Easing function (accelerating drill)
 * @param {number} [options.startDiameter=1.3] - Diameter at start (wide)
 * @param {number} [options.endDiameter=0.6] - Diameter at end (narrow point)
 * @param {number} [options.startScale=1.1] - Scale at start
 * @param {number} [options.endScale=0.8] - Scale at end
 * @param {number} [options.spacing=0.1] - Vertical spacing between rings
 * @param {number} [options.phaseOffset=0.03] - Timing stagger (tight for fast drill)
 * @param {string} [options.orientation='flat'] - Ring orientation: flat, vertical, radial, camera
 * @param {Object} [options.shaderAnimation] - Arc visibility shader settings
 * @returns {Object} Spawn mode configuration for axis-travel
 */
export function createDrillConfig(options = {}) {
    const {
        models = ['ring'],
        ringCount = 3,
        arcOffset = 90,
        start = 'top',
        end = 'bottom',
        easing = 'easeIn',
        startDiameter = 1.3,
        endDiameter = 0.6,
        startScale = 1.1,
        endScale = 0.8,
        spacing = 0.1,
        phaseOffset = 0.03,
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

    // Add shader animation if provided
    if (shaderAnimation) {
        config.animation = {
            modelOverrides: {},
        };
        for (const model of models) {
            config.animation.modelOverrides[model] = {
                shaderAnimation,
                orientationOverride: orientation,
            };
        }
    }

    return config;
}

export default createDrillConfig;
