/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Transport Spawn Preset
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Transport spawn pattern - stacked rings descend then reverse (teleport effect)
 * @module spawn-modes/presets/transport
 *
 * VISUAL DIAGRAM:
 *     ○───○───○   TOP
 *        ↓
 *     ○───○───○   ← Rings descend together
 *        ↓
 *     ○───○───○   MIDDLE (reverseAt point)
 *        ↑
 *     ○───○───○   ← Then rise back up
 *        ↑
 *     ○───○───○   TOP (return)
 *
 * All rings are aligned vertically (stack formation), no spiral offset.
 * Uses reverseAt for the down-then-up "teleport" effect.
 */

/**
 * Create a transport spawn mode configuration
 *
 * @param {Object} options - Transport options
 * @param {string[]} [options.models=['ring']] - Model names to spawn
 * @param {number} [options.ringCount=3] - Number of stacked rings
 * @param {string} [options.start='above'] - Start landmark (above mascot)
 * @param {string} [options.end='bottom'] - End landmark (target)
 * @param {string} [options.easing='easeInOut'] - Easing function name
 * @param {number} [options.reverseAt=0.5] - Progress point to reverse direction (0-1)
 * @param {number} [options.startDiameter=1.0] - Diameter at start
 * @param {number} [options.endDiameter=1.0] - Diameter at end (usually same as start)
 * @param {number} [options.startScale=1.0] - Scale at start
 * @param {number} [options.endScale=1.0] - Scale at end
 * @param {number} [options.spacing=0.2] - Vertical spacing between rings
 * @param {number} [options.phaseOffset=0] - Timing stagger (usually 0 for synchronized)
 * @param {string} [options.ringOrientation='flat'] - Ring orientation: flat, vertical, radial
 * @param {Object} [options.shaderAnimation] - Arc visibility shader settings
 * @returns {Object} Spawn mode configuration for axis-travel
 */
export function createTransportConfig(options = {}) {
    const {
        models = ['ring'],
        ringCount = 3,
        start = 'above',
        end = 'center',
        easing = 'easeInOut',
        reverseAt = 0.5,
        startDiameter = 1.0,
        endDiameter = 1.0,
        startScale = 1.0,
        endScale = 1.0,
        spacing = 0.2,
        phaseOffset = 0,
        ringOrientation = 'flat',
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
            reverseAt,
            ringOrientation,
        },
        formation: {
            type: 'stack',
            count: ringCount,
            spacing,
            arcOffset: 0, // No rotation for transport
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

export default createTransportConfig;
