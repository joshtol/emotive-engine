/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Utilities Index
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Central export for all particle utilities
 * @author Emotive Engine Team
 * @module particles/utils
 */

// Math utilities
export { cachedSin, cachedCos } from './mathCache.js';

// Color utilities
export { selectWeightedColor, hexToRgb, rgbToHex, blendColors } from './colorUtils.js';

// Easing functions
export {
    linear,
    easeInOutCubic,
    easeInQuad,
    easeOutQuad,
    easeInOutQuad,
    easeOutElastic,
    easeOutBounce,
    easeInOutBack,
    easeInOutSine,
} from './easing.js';

// Re-export as organized groups for convenience
import * as mathCache from './mathCache.js';
import * as colorUtils from './colorUtils.js';
import * as easing from './easing.js';

export default {
    math: mathCache,
    color: colorUtils,
    easing,
};
