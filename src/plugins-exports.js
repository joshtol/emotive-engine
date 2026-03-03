/**
 * Plugin exports for code splitting
 * Contains plugin system and extensions
 */

// Utils (often needed by plugins) — named exports for tree-shaking
export {
    hexToRgb,
    rgbToHex,
    rgbToHsl,
    hslToRgb,
    interpolateRgb,
    interpolateHsl,
    hexToRgba,
    adjustBrightness,
    adjustSaturation,
    getLuminance,
    getContrastRatio,
    UNDERTONE_SATURATION,
    applyUndertoneSaturation,
    applyUndertoneSaturationToArray,
    getUndertoneSaturationFactor,
    EMOTIONAL_COLORS,
    EMOTIONAL_COLORS_RGB,
} from './utils/colorUtils.js';

// Note: Plugin files are example templates only
// No actual plugin classes exist yet in production
