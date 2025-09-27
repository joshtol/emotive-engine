/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Color Utilities
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Color selection and manipulation utilities for particles
 * @author Emotive Engine Team
 * @module particles/utils/colorUtils
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Handles weighted color selection for particles. Each emotion has a palette of     
 * ║ colors with different weights (probabilities). This creates visual variety        
 * ║ while maintaining the emotional theme.                                            
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Select a color from an array with optional weights
 * 
 * EXAMPLE INPUT:
 * [
 *   { color: '#FF69B4', weight: 30 },  // 30% chance
 *   { color: '#FFB6C1', weight: 25 },  // 25% chance
 *   { color: '#FF1493', weight: 20 },  // 20% chance
 *   '#FFC0CB',                          // Remaining weight split evenly
 *   '#C71585'                           // between unweighted colors
 * ]
 * 
 * @param {Array} colors - Array of color strings or {color, weight} objects
 * @returns {string} Selected hex color
 */
export function selectWeightedColor(colors) {
    if (!colors || colors.length === 0) return '#FFFFFF';
    
    // Parse colors and weights
    let totalExplicitWeight = 0;
    let unweightedCount = 0;
    const parsedColors = [];
    
    for (const item of colors) {
        if (typeof item === 'string') {
            // Simple string color - will get default weight
            parsedColors.push({ color: item, weight: null });
            unweightedCount++;
        } else if (item && typeof item === 'object' && item.color) {
            // Object with color and optional weight
            parsedColors.push({ color: item.color, weight: item.weight || null });
            if (item.weight) {
                totalExplicitWeight += item.weight;
            } else {
                unweightedCount++;
            }
        }
    }
    
    // Calculate weight for unweighted colors
    // If weights total 75, and there are 2 unweighted colors, each gets 12.5
    const remainingWeight = Math.max(0, 100 - totalExplicitWeight);
    const defaultWeight = unweightedCount > 0 ? remainingWeight / unweightedCount : 0;
    
    // Build cumulative probability table for efficient selection
    const probTable = [];
    let cumulative = 0;
    
    for (const item of parsedColors) {
        const weight = item.weight !== null ? item.weight : defaultWeight;
        cumulative += weight;
        probTable.push({ color: item.color, threshold: cumulative });
    }
    
    // Select based on random value
    const random = Math.random() * cumulative;
    for (const entry of probTable) {
        if (random <= entry.threshold) {
            return entry.color;
        }
    }
    
    // Fallback to last color (shouldn't happen but safety first)
    return parsedColors[parsedColors.length - 1].color;
}

/**
 * Convert hex color to RGB object
 * @param {string} hex - Hex color string (#RRGGBB)
 * @returns {Object} RGB values {r, g, b}
 */
export function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 }; // Default to white
}

/**
 * Convert RGB values to hex string
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string} Hex color string
 */
export function rgbToHex(r, g, b) {
    return `#${[r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
    }).join('')}`;
}

/**
 * Blend two colors together
 * @param {string} color1 - First hex color
 * @param {string} color2 - Second hex color
 * @param {number} ratio - Blend ratio (0=color1, 1=color2)
 * @returns {string} Blended hex color
 */
export function blendColors(color1, color2, ratio) {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * ratio);
    const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * ratio);
    const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * ratio);
    
    return rgbToHex(r, g, b);
}

export default {
    selectWeightedColor,
    hexToRgb,
    rgbToHex,
    blendColors
};