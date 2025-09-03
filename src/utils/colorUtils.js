/**
 * Color Utilities - Color interpolation and manipulation
 * Provides smooth color transitions for emotional states
 */

/**
 * Converts hex color to RGB values
 * @param {string} hex - Hex color string (e.g., '#FF0000')
 * @returns {Object} RGB object with r, g, b properties
 */
export function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Handle 3-digit hex
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }
    
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return { r, g, b };
}

/**
 * Converts RGB values to hex color
 * @param {number} r - Red component (0-255)
 * @param {number} g - Green component (0-255)
 * @param {number} b - Blue component (0-255)
 * @returns {string} Hex color string
 */
export function rgbToHex(r, g, b) {
    const toHex = (component) => {
        const hex = Math.round(Math.max(0, Math.min(255, component))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Converts RGB to HSL color space
 * @param {number} r - Red component (0-255)
 * @param {number} g - Green component (0-255)
 * @param {number} b - Blue component (0-255)
 * @returns {Object} HSL object with h, s, l properties
 */
export function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    
    return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Converts HSL to RGB color space
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {Object} RGB object with r, g, b properties
 */
export function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    
    const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    };
    
    let r, g, b;
    
    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

/**
 * Interpolates between two colors in RGB space
 * @param {string} color1 - Start color (hex)
 * @param {string} color2 - End color (hex)
 * @param {number} progress - Interpolation progress (0-1)
 * @returns {string} Interpolated color (hex)
 */
export function interpolateRgb(color1, color2, progress) {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * progress);
    const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * progress);
    const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * progress);
    
    return rgbToHex(r, g, b);
}

/**
 * Interpolates between two colors in HSL space (better for emotional transitions)
 * @param {string} color1 - Start color (hex)
 * @param {string} color2 - End color (hex)
 * @param {number} progress - Interpolation progress (0-1)
 * @returns {string} Interpolated color (hex)
 */
export function interpolateHsl(color1, color2, progress) {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    const hsl1 = rgbToHsl(rgb1.r, rgb1.g, rgb1.b);
    const hsl2 = rgbToHsl(rgb2.r, rgb2.g, rgb2.b);
    
    // Handle hue interpolation (shortest path around color wheel)
    let h1 = hsl1.h;
    let h2 = hsl2.h;
    let hDiff = h2 - h1;
    
    if (hDiff > 180) {
        h2 -= 360;
    } else if (hDiff < -180) {
        h2 += 360;
    }
    
    const h = h1 + (h2 - h1) * progress;
    const s = hsl1.s + (hsl2.s - hsl1.s) * progress;
    const l = hsl1.l + (hsl2.l - hsl1.l) * progress;
    
    // Normalize hue
    const normalizedH = ((h % 360) + 360) % 360;
    
    const rgb = hslToRgb(normalizedH, s, l);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
}

/**
 * Creates an RGBA color string
 * @param {string} hex - Hex color
 * @param {number} alpha - Alpha value (0-1)
 * @returns {string} RGBA color string
 */
export function hexToRgba(hex, alpha = 1) {
    const rgb = hexToRgb(hex);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * Adjusts the brightness of a color
 * @param {string} hex - Hex color
 * @param {number} factor - Brightness factor (0.5 = darker, 1.5 = brighter)
 * @returns {string} Adjusted color (hex)
 */
export function adjustBrightness(hex, factor) {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    hsl.l = Math.max(0, Math.min(100, hsl.l * factor));
    
    const adjustedRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    return rgbToHex(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b);
}

/**
 * Adjusts the saturation of a color
 * @param {string} hex - Hex color
 * @param {number} factor - Saturation factor (0.5 = less saturated, 1.5 = more saturated)
 * @returns {string} Adjusted color (hex)
 */
export function adjustSaturation(hex, factor) {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    hsl.s = Math.max(0, Math.min(100, hsl.s * factor));
    
    const adjustedRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    return rgbToHex(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b);
}

/**
 * Gets the luminance of a color (for contrast calculations)
 * @param {string} hex - Hex color
 * @returns {number} Luminance value (0-1)
 */
export function getLuminance(hex) {
    const rgb = hexToRgb(hex);
    
    // Convert to linear RGB
    const toLinear = (component) => {
        const c = component / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    
    const r = toLinear(rgb.r);
    const g = toLinear(rgb.g);
    const b = toLinear(rgb.b);
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculates contrast ratio between two colors
 * @param {string} color1 - First color (hex)
 * @param {string} color2 - Second color (hex)
 * @returns {number} Contrast ratio (1-21)
 */
export function getContrastRatio(color1, color2) {
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Emotional color palette for the mascot system
 */
export const EMOTIONAL_COLORS = {
    neutral: '#B0B0B0',
    joy: '#FFD700',
    sadness: '#4169E1',
    anger: '#DC143C',
    fear: '#8B008B',
    surprise: '#FF8C00',
    disgust: '#9ACD32',
    love: '#FF69B4'
};

/**
 * Gets RGB values for emotional colors (for performance)
 */
export const EMOTIONAL_COLORS_RGB = Object.fromEntries(
    Object.entries(EMOTIONAL_COLORS).map(([emotion, hex]) => {
        const rgb = hexToRgb(hex);
        return [emotion, `${rgb.r}, ${rgb.g}, ${rgb.b}`];
    })
);