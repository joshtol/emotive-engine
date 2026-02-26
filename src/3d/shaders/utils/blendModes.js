/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Blend Modes Utility (JavaScript loader)
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview JavaScript wrapper for universal blend mode GLSL functions
 * @author Emotive Engine Team
 * @module 3d/shaders/utils/blendModes
 *
 * Provides GLSL code injection for any shader that needs Photoshop-style blend modes.
 */

/**
 * GLSL blend mode functions (18 modes total)
 * Copy this into your fragment shader to use blend modes
 */
export const blendModesGLSL = `
/**
 * Apply a single blend mode to two colors
 * @param base - Base color (RGB, 0.0-1.0 range)
 * @param blend - Blend color (RGB, 0.0-1.0 range)
 * @param mode - Blend mode index (0-17)
 * @return Blended color (RGB, 0.0-1.0 range)
 *
 * Blend Mode Reference:
 *  0 = Multiply        (darkening)
 *  1 = Linear Burn     (darkening, linear)
 *  2 = Color Burn      (darkening, intense)
 *  3 = Color Dodge     (brightening, intense)
 *  4 = Screen          (brightening)
 *  5 = Overlay         (contrast, screen/multiply hybrid)
 *  6 = Add             (brightening, additive glow)
 *  7 = Soft Light      (contrast, gentle)
 *  8 = Hard Light      (contrast, strong)
 *  9 = Vivid Light     (contrast, saturation boost)
 * 10 = Linear Light    (contrast, linear)
 * 11 = Difference      (inversion)
 * 12 = Exclusion       (soft inversion)
 * 13 = Darken          (comparison, darker)
 * 14 = Lighten         (comparison, lighter)
 * 15 = Subtract        (darkening, deep shadows)
 * 16 = Divide          (brightening, ethereal glow)
 * 17 = Pin Light       (posterization)
 */
vec3 applyBlendMode(vec3 base, vec3 blend, int mode) {
    if (mode == 0) {
        // MULTIPLY: base * blend
        return base * blend;
    } else if (mode == 1) {
        // LINEAR BURN: base + blend - 1
        return max(base + blend - vec3(1.0), vec3(0.0));
    } else if (mode == 2) {
        // COLOR BURN: (blend==0.0) ? 0.0 : max((1.0-((1.0-base)/blend)), 0.0)
        return vec3(
            blend.r == 0.0 ? 0.0 : max(1.0 - ((1.0 - base.r) / blend.r), 0.0),
            blend.g == 0.0 ? 0.0 : max(1.0 - ((1.0 - base.g) / blend.g), 0.0),
            blend.b == 0.0 ? 0.0 : max(1.0 - ((1.0 - base.b) / blend.b), 0.0)
        );
    } else if (mode == 3) {
        // COLOR DODGE: (blend==1.0) ? 1.0 : min(base/(1.0-blend), 1.0)
        return vec3(
            blend.r == 1.0 ? 1.0 : min(base.r / (1.0 - blend.r), 1.0),
            blend.g == 1.0 ? 1.0 : min(base.g / (1.0 - blend.g), 1.0),
            blend.b == 1.0 ? 1.0 : min(base.b / (1.0 - blend.b), 1.0)
        );
    } else if (mode == 4) {
        // SCREEN: 1 - (1 - base) * (1 - blend)
        return vec3(1.0) - (vec3(1.0) - base) * (vec3(1.0) - blend);
    } else if (mode == 5) {
        // OVERLAY: base < 0.5 ? (2 * base * blend) : (1 - 2 * (1 - base) * (1 - blend))
        return vec3(
            base.r < 0.5 ? (2.0 * base.r * blend.r) : (1.0 - 2.0 * (1.0 - base.r) * (1.0 - blend.r)),
            base.g < 0.5 ? (2.0 * base.g * blend.g) : (1.0 - 2.0 * (1.0 - base.g) * (1.0 - blend.g)),
            base.b < 0.5 ? (2.0 * base.b * blend.b) : (1.0 - 2.0 * (1.0 - base.b) * (1.0 - blend.b))
        );
    } else if (mode == 6) {
        // ADD (LINEAR DODGE): base + blend
        return min(base + blend, vec3(1.0));
    } else if (mode == 7) {
        // SOFT LIGHT: blend < 0.5 ? (2*base*blend + base^2*(1-2*blend)) : (sqrt(base)*(2*blend-1) + 2*base*(1-blend))
        return vec3(
            blend.r < 0.5 ? (2.0 * base.r * blend.r + base.r * base.r * (1.0 - 2.0 * blend.r)) : (sqrt(base.r) * (2.0 * blend.r - 1.0) + 2.0 * base.r * (1.0 - blend.r)),
            blend.g < 0.5 ? (2.0 * base.g * blend.g + base.g * base.g * (1.0 - 2.0 * blend.g)) : (sqrt(base.g) * (2.0 * blend.g - 1.0) + 2.0 * base.g * (1.0 - blend.g)),
            blend.b < 0.5 ? (2.0 * base.b * blend.b + base.b * base.b * (1.0 - 2.0 * blend.b)) : (sqrt(base.b) * (2.0 * blend.b - 1.0) + 2.0 * base.b * (1.0 - blend.b))
        );
    } else if (mode == 8) {
        // HARD LIGHT: blend < 0.5 ? (2 * base * blend) : (1 - 2 * (1 - base) * (1 - blend))
        return vec3(
            blend.r < 0.5 ? (2.0 * base.r * blend.r) : (1.0 - 2.0 * (1.0 - base.r) * (1.0 - blend.r)),
            blend.g < 0.5 ? (2.0 * base.g * blend.g) : (1.0 - 2.0 * (1.0 - base.g) * (1.0 - blend.g)),
            blend.b < 0.5 ? (2.0 * base.b * blend.b) : (1.0 - 2.0 * (1.0 - base.b) * (1.0 - blend.b))
        );
    } else if (mode == 9) {
        // VIVID LIGHT: blend < 0.5 ? ColorBurn(base, 2*blend) : ColorDodge(base, 2*(blend-0.5))
        return vec3(
            blend.r < 0.5 ? (blend.r == 0.0 ? 0.0 : max(1.0 - ((1.0 - base.r) / (2.0 * blend.r)), 0.0)) : (blend.r == 1.0 ? 1.0 : min(base.r / (2.0 * (1.0 - blend.r)), 1.0)),
            blend.g < 0.5 ? (blend.g == 0.0 ? 0.0 : max(1.0 - ((1.0 - base.g) / (2.0 * blend.g)), 0.0)) : (blend.g == 1.0 ? 1.0 : min(base.g / (2.0 * (1.0 - blend.g)), 1.0)),
            blend.b < 0.5 ? (blend.b == 0.0 ? 0.0 : max(1.0 - ((1.0 - base.b) / (2.0 * blend.b)), 0.0)) : (blend.b == 1.0 ? 1.0 : min(base.b / (2.0 * (1.0 - blend.b)), 1.0))
        );
    } else if (mode == 10) {
        // LINEAR LIGHT: blend < 0.5 ? LinearBurn(base, 2*blend) : LinearDodge(base, 2*(blend-0.5))
        return vec3(
            blend.r < 0.5 ? max(base.r + 2.0 * blend.r - 1.0, 0.0) : min(base.r + 2.0 * (blend.r - 0.5), 1.0),
            blend.g < 0.5 ? max(base.g + 2.0 * blend.g - 1.0, 0.0) : min(base.g + 2.0 * (blend.g - 0.5), 1.0),
            blend.b < 0.5 ? max(base.b + 2.0 * blend.b - 1.0, 0.0) : min(base.b + 2.0 * (blend.b - 0.5), 1.0)
        );
    } else if (mode == 11) {
        // DIFFERENCE: abs(base - blend)
        return abs(base - blend);
    } else if (mode == 12) {
        // EXCLUSION: base + blend - 2 * base * blend
        return base + blend - 2.0 * base * blend;
    } else if (mode == 13) {
        // DARKEN: min(base, blend)
        return min(base, blend);
    } else if (mode == 14) {
        // LIGHTEN: max(base, blend)
        return max(base, blend);
    } else if (mode == 15) {
        // SUBTRACT: max(base - blend, 0)
        return max(base - blend, vec3(0.0));
    } else if (mode == 16) {
        // DIVIDE: base / (blend + epsilon)
        return min(base / (blend + vec3(0.001)), vec3(1.0));
    } else {
        // PIN LIGHT (mode 17): Replaces colors based on blend brightness
        float blendLum = (blend.r + blend.g + blend.b) / 3.0;
        if (blendLum > 0.5) {
            // Lighten: replace pixels darker than blend
            return max(base, 2.0 * blend - vec3(1.0));
        } else {
            // Darken: replace pixels lighter than blend
            return min(base, 2.0 * blend);
        }
    }
}
`;

/**
 * GLSL helper function for applying sequential blend layers
 * Requires applyBlendMode() function to be included first
 */
export const blendLayersGLSL = `
/**
 * Apply sequential blend layers (up to 4 layers)
 * Each layer blends onto the result of the previous layer
 * @param baseColor - Starting color
 * @param blendColor - Color to blend with (same for all layers)
 * @param layer1Mode, layer1Strength, layer1Enabled - Layer 1 parameters
 * @param layer2Mode, layer2Strength, layer2Enabled - Layer 2 parameters
 * @param layer3Mode, layer3Strength, layer3Enabled - Layer 3 parameters
 * @param layer4Mode, layer4Strength, layer4Enabled - Layer 4 parameters
 * @return Final blended color after all layers applied
 */
vec3 applyBlendLayers(
    vec3 baseColor,
    vec3 blendColor,
    float layer1Mode, float layer1Strength, float layer1Enabled,
    float layer2Mode, float layer2Strength, float layer2Enabled,
    float layer3Mode, float layer3Strength, float layer3Enabled,
    float layer4Mode, float layer4Strength, float layer4Enabled
) {
    vec3 result = baseColor;

    // Layer 1
    if (layer1Enabled > 0.5) {
        vec3 blendColor1 = blendColor * layer1Strength;
        int mode1 = int(layer1Mode + 0.5);
        result = applyBlendMode(result, blendColor1, mode1);
    }

    // Layer 2
    if (layer2Enabled > 0.5) {
        vec3 blendColor2 = blendColor * layer2Strength;
        int mode2 = int(layer2Mode + 0.5);
        result = applyBlendMode(result, blendColor2, mode2);
    }

    // Layer 3
    if (layer3Enabled > 0.5) {
        vec3 blendColor3 = blendColor * layer3Strength;
        int mode3 = int(layer3Mode + 0.5);
        result = applyBlendMode(result, blendColor3, mode3);
    }

    // Layer 4
    if (layer4Enabled > 0.5) {
        vec3 blendColor4 = blendColor * layer4Strength;
        int mode4 = int(layer4Mode + 0.5);
        result = applyBlendMode(result, blendColor4, mode4);
    }

    return result;
}
`;

/**
 * Blend mode names for UI dropdowns
 */
export const blendModeNames = [
    'Multiply', // 0 - Darkening
    'Linear Burn', // 1 - Darkening
    'Color Burn', // 2 - Darkening (intense)
    'Color Dodge', // 3 - Brightening (intense)
    'Screen', // 4 - Brightening
    'Overlay', // 5 - Contrast
    'Add', // 6 - Brightening (glow)
    'Soft Light', // 7 - Contrast (gentle)
    'Hard Light', // 8 - Contrast (strong)
    'Vivid Light', // 9 - Saturation boost
    'Linear Light', // 10 - Linear saturation
    'Difference', // 11 - Inversion
    'Exclusion', // 12 - Soft inversion
    'Darken', // 13 - Comparison (darker)
    'Lighten', // 14 - Comparison (lighter)
    'Subtract', // 15 - Deep shadows
    'Divide', // 16 - Ethereal glow
    'Pin Light', // 17 - Posterization
];

/**
 * Get blend mode name by index
 * @param {number} index - Blend mode index (0-17)
 * @returns {string} Blend mode name
 */
export function getBlendModeName(index) {
    return blendModeNames[index] || 'Unknown';
}

/**
 * Get blend mode index by name
 * @param {string} name - Blend mode name
 * @returns {number} Blend mode index (0-17), or 0 if not found
 */
export function getBlendModeIndex(name) {
    const index = blendModeNames.indexOf(name);
    return index !== -1 ? index : 0;
}
