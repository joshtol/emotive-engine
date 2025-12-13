/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - 3D Color Utilities
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Color conversion and manipulation utilities for 3D rendering
 * @author Emotive Engine Team
 * @module 3d/utils/ColorUtilities
 */

/**
 * Convert hex color to RGB [0-1]
 * @param {string} hex - Hex color code (with or without #)
 * @returns {Array} RGB color [r, g, b] in [0-1] range
 */
export function hexToRGB(hex) {
    // Remove # if present
    hex = hex.replace('#', '');

    // Parse
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    return [r, g, b];
}

/**
 * Convert RGB [0-1] to HSL [0-360, 0-100, 0-100]
 * @param {number} r - Red component [0-1]
 * @param {number} g - Green component [0-1]
 * @param {number} b - Blue component [0-1]
 * @returns {Array} HSL color [h, s, l]
 */
export function rgbToHsl(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    const sum = max + min;

    let h = 0;
    let s = 0;
    const l = sum / 2;

    if (diff !== 0) {
        s = l > 0.5 ? diff / (2 - sum) : diff / sum;

        switch (max) {
        case r: h = ((g - b) / diff + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / diff + 2) / 6; break;
        case b: h = ((r - g) / diff + 4) / 6; break;
        }
    }

    return [h * 360, s * 100, l * 100];
}

/**
 * Convert HSL [0-360, 0-100, 0-100] to RGB [0-1]
 * @param {number} h - Hue [0-360]
 * @param {number} s - Saturation [0-100]
 * @param {number} l - Lightness [0-100]
 * @returns {Array} RGB color [r, g, b] in [0-1] range
 */
export function hslToRgb(h, s, l) {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [r, g, b];
}

/**
 * Apply undertone saturation multiplier to RGB color
 * @param {Array} rgb - RGB color [r, g, b] in [0-1]
 * @param {string|null} undertone - Undertone name
 * @returns {Array} Modified RGB color
 */
export function applyUndertoneSaturation(rgb, undertone) {
    if (!undertone || undertone === 'clear' || undertone === 'none') {
        return rgb;
    }

    // Saturation and lightness modifiers - AMPLIFIED for 3D visibility
    const colorModifiers = {
        'intense': { saturation: 2.5, lightness: 1.3 },     // Extremely vivid + much brighter
        'confident': { saturation: 1.8, lightness: 1.15 },  // Bold saturated + brighter
        'nervous': { saturation: 1.6, lightness: 1.1 },     // Heightened + slightly brighter
        'tired': { saturation: 0.4, lightness: 0.65 },      // Very washed out + much dimmer
        'subdued': { saturation: 0.25, lightness: 0.55 }    // Ghostly desaturated + very dim
    };

    const mods = colorModifiers[undertone];
    if (!mods) return rgb;

    // Convert to HSL
    const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);

    // Apply saturation multiplier
    hsl[1] = Math.min(100, hsl[1] * mods.saturation);

    // Apply lightness multiplier (makes intense brighter, subdued darker)
    hsl[2] = Math.min(100, Math.max(0, hsl[2] * mods.lightness));

    // Convert back to RGB
    return hslToRgb(hsl[0], hsl[1], hsl[2]);
}
