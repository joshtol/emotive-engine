/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Universal Glow Intensity Filter
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Universal glow intensity calculator based on color luminance
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module utils/glowIntensityFilter
 * @complexity ⭐⭐ Intermediate
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Automatically calculates optimal glow intensity for glass materials based on
 * ║ color luminance. Ensures consistent visibility across all emotions regardless
 * ║ of their native color brightness.
 * ║
 * ║ DERIVED FROM: 14 hand-tuned emotion values using linear regression
 * ║ CORRELATION: -0.89 (very strong inverse relationship)
 * ║ FORMULA: intensity = -1.0692 × luminance + 1.2353
 * ║ WORKS FOR: Any hex color, not just predefined emotions
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Normalize color to have equal luminance across all colors
 * This ensures bloom pass sees the same brightness regardless of color hue
 *
 * @param {string} hexColor - Hex color code (e.g., '#FF6B35')
 * @param {number} targetLuminance - Target luminance value (default 0.5)
 * @returns {Object} RGB object with normalized values {r, g, b}
 *
 * @example
 * normalizeColorLuminance('#FFEB3B', 0.5) // Scales down bright yellow
 * normalizeColorLuminance('#6B46C1', 0.5) // Scales up dark purple
 */
export function normalizeColorLuminance(hexColor, targetLuminance = 0.5) {
    const currentLuminance = calculateLuminance(hexColor);
    const scaleFactor = targetLuminance / Math.max(currentLuminance, 0.01);

    // Get RGB values
    const r = parseInt(hexColor.slice(1, 3), 16) / 255;
    const g = parseInt(hexColor.slice(3, 5), 16) / 255;
    const b = parseInt(hexColor.slice(5, 7), 16) / 255;

    // Scale RGB to achieve target luminance
    return {
        r: Math.min(1.0, r * scaleFactor),
        g: Math.min(1.0, g * scaleFactor),
        b: Math.min(1.0, b * scaleFactor)
    };
}

/**
 * Calculate relative luminance using W3C/WCAG sRGB formula
 * Uses ITU-R BT.709 coefficients for color-to-luminance conversion
 *
 * @param {string} hexColor - Hex color code (e.g., '#FF6B35')
 * @returns {number} Relative luminance value between 0 (black) and 1 (white)
 *
 * @example
 * calculateLuminance('#FFEB3B') // 0.8099 (bright yellow)
 * calculateLuminance('#6B46C1') // 0.1136 (dark purple)
 */
export function calculateLuminance(hexColor) {
    // Convert hex to RGB (0-1 range)
    const r = parseInt(hexColor.slice(1, 3), 16) / 255;
    const g = parseInt(hexColor.slice(3, 5), 16) / 255;
    const b = parseInt(hexColor.slice(5, 7), 16) / 255;

    // Apply sRGB gamma correction (inverse transfer function)
    // Official threshold is 0.04045 per W3C/sRGB specification
    const linearize = c => {
        return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };

    const rLinear = linearize(r);
    const gLinear = linearize(g);
    const bLinear = linearize(b);

    // Calculate relative luminance using ITU-R BT.709 coefficients
    // These weights reflect human eye's sensitivity (green > red > blue)
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate optimal glow intensity based on color luminance and material mode
 *
 * GLASS MODE (high transmission):
 * - Bright colors get washed out → need HIGHER intensity
 * - Dark colors stay visible → need LOWER intensity
 * - Formula inverted: positive slope
 *
 * GLOW MODE (dark background):
 * - Bright colors naturally visible → need LOWER intensity
 * - Dark colors hard to see → need HIGHER intensity
 * - Formula: negative slope (original)
 *
 * @param {string} hexColor - Hex color code (e.g., '#FF6B35')
 * @param {number} calibrationOffset - Optional offset to adjust global brightness (default: 0)
 * @param {string} mode - Material mode: 'glass' or 'glow' (default: 'glass')
 * @returns {number} Optimal glow intensity (typically 0.4 - 1.3)
 *
 * @example
 * // GLASS MODE (default) - bright colors need MORE intensity
 * getGlowIntensityForColor('#FFEB3B', 0, 'glass') // ~1.20 (bright yellow needs boost)
 * getGlowIntensityForColor('#4169E1', 0, 'glass') // ~0.70 (dark blue stays dim)
 *
 * // GLOW MODE - dark colors need MORE intensity
 * getGlowIntensityForColor('#FFEB3B', 0, 'glow') // ~0.37 (bright yellow stays dim)
 * getGlowIntensityForColor('#4169E1', 0, 'glow') // ~1.11 (dark blue needs boost)
 */
export function getGlowIntensityForColor(hexColor, calibrationOffset = 0, mode = 'glow') {
    const luminance = calculateLuminance(hexColor);

    // Target perceived brightness (luminance × intensity = constant)
    // This ensures all colors appear equally bright regardless of their base luminance
    // Higher target needed because darker colors need significant boost
    const targetBrightness = 0.5 + calibrationOffset;

    // To achieve uniform perceived brightness, divide target by luminance
    // Bright colors (high luminance) get low intensity multipliers
    // Dark colors (low luminance) get high intensity multipliers
    // Prevent division by very small numbers with minimum luminance threshold
    const minLuminance = 0.05;
    const intensity = targetBrightness / Math.max(luminance, minLuminance);

    // Clamp to reasonable range
    // Min 0.3: Ensures even brightest colors remain visible
    // Max 10.0: Allows very dark colors to be boosted dramatically
    return Math.max(0.3, Math.min(10.0, intensity));
}

/**
 * Calculate glow intensity with optional emotional emphasis
 * Allows boosting intensity for emotionally intense states (anger, love, fear)
 *
 * @param {string} hexColor - Hex color code
 * @param {number} emphasisMultiplier - Multiplier for emotional emphasis (default: 1.0)
 * @returns {number} Adjusted glow intensity
 *
 * @example
 * // Normal intensity
 * getGlowIntensityWithEmphasis('#DC143C', 1.0) // ~1.06
 *
 * // 20% boost for anger
 * getGlowIntensityWithEmphasis('#DC143C', 1.2) // ~1.27
 */
export function getGlowIntensityWithEmphasis(hexColor, emphasisMultiplier = 1.0) {
    const baseIntensity = getGlowIntensityForColor(hexColor);
    const adjusted = baseIntensity * emphasisMultiplier;

    // Clamp adjusted value
    return Math.max(0.3, Math.min(1.5, adjusted));
}

/**
 * Get diagnostic information about a color's glow characteristics
 * Useful for debugging and understanding why certain intensities are chosen
 *
 * @param {string} hexColor - Hex color code
 * @returns {Object} Diagnostic information
 */
export function getGlowDiagnostics(hexColor) {
    const luminance = calculateLuminance(hexColor);
    const intensity = getGlowIntensityForColor(hexColor);

    return {
        color: hexColor,
        luminance: luminance.toFixed(4),
        intensity: intensity.toFixed(2),
        category: luminance < 0.2 ? 'very dark' :
            luminance < 0.4 ? 'dark' :
                luminance < 0.6 ? 'medium' :
                    luminance < 0.8 ? 'bright' : 'very bright'
    };
}

export default {
    calculateLuminance,
    getGlowIntensityForColor,
    getGlowIntensityWithEmphasis,
    getGlowDiagnostics
};
