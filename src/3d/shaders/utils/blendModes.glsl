/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Blend Modes Utility
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Universal Photoshop-style blend mode functions for GLSL shaders
 * @author Emotive Engine Team
 * @module 3d/shaders/utils/blendModes
 *
 * Provides 18 blend modes compatible with Adobe Photoshop/Affinity Photo:
 * - Darkening: Multiply, Linear Burn, Color Burn, Darken, Subtract
 * - Lightening: Screen, Color Dodge, Add, Lighten, Divide
 * - Contrast: Overlay, Soft Light, Hard Light, Vivid Light, Linear Light, Pin Light
 * - Inversion: Difference, Exclusion
 *
 * Usage in any shader:
 * ```glsl
 * vec3 baseColor = vec3(0.5, 0.5, 0.5);
 * vec3 blendColor = vec3(0.8, 0.2, 0.1);
 * vec3 result = applyBlendMode(baseColor, blendColor, 0); // Multiply
 * ```
 */

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
        // Classic darkening mode - black stays black, white preserves base
        return base * blend;
    } else if (mode == 1) {
        // LINEAR BURN: base + blend - 1
        // Linear darkening with strong contrast
        return max(base + blend - vec3(1.0), vec3(0.0));
    } else if (mode == 2) {
        // COLOR BURN: (blend==0.0) ? 0.0 : max((1.0-((1.0-base)/blend)), 0.0)
        // Darkens base color to reflect blend color by increasing contrast
        return vec3(
            blend.r == 0.0 ? 0.0 : max(1.0 - ((1.0 - base.r) / blend.r), 0.0),
            blend.g == 0.0 ? 0.0 : max(1.0 - ((1.0 - base.g) / blend.g), 0.0),
            blend.b == 0.0 ? 0.0 : max(1.0 - ((1.0 - base.b) / blend.b), 0.0)
        );
    } else if (mode == 3) {
        // COLOR DODGE: (blend==1.0) ? 1.0 : min(base/(1.0-blend), 1.0)
        // Brightens base color to reflect blend color by decreasing contrast
        return vec3(
            blend.r == 1.0 ? 1.0 : min(base.r / (1.0 - blend.r), 1.0),
            blend.g == 1.0 ? 1.0 : min(base.g / (1.0 - blend.g), 1.0),
            blend.b == 1.0 ? 1.0 : min(base.b / (1.0 - blend.b), 1.0)
        );
    } else if (mode == 4) {
        // SCREEN: 1 - (1 - base) * (1 - blend)
        // Inverse multiply - brightens overall, black has no effect
        return vec3(1.0) - (vec3(1.0) - base) * (vec3(1.0) - blend);
    } else if (mode == 5) {
        // OVERLAY: base < 0.5 ? (2 * base * blend) : (1 - 2 * (1 - base) * (1 - blend))
        // Multiplies or screens depending on base color - preserves highlights/shadows
        return vec3(
            base.r < 0.5 ? (2.0 * base.r * blend.r) : (1.0 - 2.0 * (1.0 - base.r) * (1.0 - blend.r)),
            base.g < 0.5 ? (2.0 * base.g * blend.g) : (1.0 - 2.0 * (1.0 - base.g) * (1.0 - blend.g)),
            base.b < 0.5 ? (2.0 * base.b * blend.b) : (1.0 - 2.0 * (1.0 - base.b) * (1.0 - blend.b))
        );
    } else if (mode == 6) {
        // ADD (LINEAR DODGE): base + blend
        // Pure additive - useful for glow effects
        return min(base + blend, vec3(1.0));
    } else if (mode == 7) {
        // SOFT LIGHT: blend < 0.5 ? (2*base*blend + base^2*(1-2*blend)) : (sqrt(base)*(2*blend-1) + 2*base*(1-blend))
        // Gentle diffused light effect - darkens or lightens based on blend
        return vec3(
            blend.r < 0.5 ? (2.0 * base.r * blend.r + base.r * base.r * (1.0 - 2.0 * blend.r)) : (sqrt(base.r) * (2.0 * blend.r - 1.0) + 2.0 * base.r * (1.0 - blend.r)),
            blend.g < 0.5 ? (2.0 * base.g * blend.g + base.g * base.g * (1.0 - 2.0 * blend.g)) : (sqrt(base.g) * (2.0 * blend.g - 1.0) + 2.0 * base.g * (1.0 - blend.g)),
            blend.b < 0.5 ? (2.0 * base.b * blend.b + base.b * base.b * (1.0 - 2.0 * blend.b)) : (sqrt(base.b) * (2.0 * blend.b - 1.0) + 2.0 * base.b * (1.0 - blend.b))
        );
    } else if (mode == 8) {
        // HARD LIGHT: blend < 0.5 ? (2 * base * blend) : (1 - 2 * (1 - base) * (1 - blend))
        // Strong spotlight effect - overlay with blend as base
        return vec3(
            blend.r < 0.5 ? (2.0 * base.r * blend.r) : (1.0 - 2.0 * (1.0 - base.r) * (1.0 - blend.r)),
            blend.g < 0.5 ? (2.0 * base.g * blend.g) : (1.0 - 2.0 * (1.0 - base.g) * (1.0 - blend.g)),
            blend.b < 0.5 ? (2.0 * base.b * blend.b) : (1.0 - 2.0 * (1.0 - base.b) * (1.0 - blend.b))
        );
    } else if (mode == 9) {
        // VIVID LIGHT: blend < 0.5 ? ColorBurn(base, 2*blend) : ColorDodge(base, 2*(blend-0.5))
        // Burns or dodges by increasing/decreasing contrast - extreme saturation boost
        return vec3(
            blend.r < 0.5 ? (blend.r == 0.0 ? 0.0 : max(1.0 - ((1.0 - base.r) / (2.0 * blend.r)), 0.0)) : (blend.r == 1.0 ? 1.0 : min(base.r / (2.0 * (1.0 - blend.r)), 1.0)),
            blend.g < 0.5 ? (blend.g == 0.0 ? 0.0 : max(1.0 - ((1.0 - base.g) / (2.0 * blend.g)), 0.0)) : (blend.g == 1.0 ? 1.0 : min(base.g / (2.0 * (1.0 - blend.g)), 1.0)),
            blend.b < 0.5 ? (blend.b == 0.0 ? 0.0 : max(1.0 - ((1.0 - base.b) / (2.0 * blend.b)), 0.0)) : (blend.b == 1.0 ? 1.0 : min(base.b / (2.0 * (1.0 - blend.b)), 1.0))
        );
    } else if (mode == 10) {
        // LINEAR LIGHT: blend < 0.5 ? LinearBurn(base, 2*blend) : LinearDodge(base, 2*(blend-0.5))
        // Linear version of Vivid Light - burns or dodges linearly
        return vec3(
            blend.r < 0.5 ? max(base.r + 2.0 * blend.r - 1.0, 0.0) : min(base.r + 2.0 * (blend.r - 0.5), 1.0),
            blend.g < 0.5 ? max(base.g + 2.0 * blend.g - 1.0, 0.0) : min(base.g + 2.0 * (blend.g - 0.5), 1.0),
            blend.b < 0.5 ? max(base.b + 2.0 * blend.b - 1.0, 0.0) : min(base.b + 2.0 * (blend.b - 0.5), 1.0)
        );
    } else if (mode == 11) {
        // DIFFERENCE: abs(base - blend)
        // Subtracts blend from base, taking absolute value - creates inversion effect
        return abs(base - blend);
    } else if (mode == 12) {
        // EXCLUSION: base + blend - 2 * base * blend
        // Similar to Difference but with lower contrast - softer inversion
        return base + blend - 2.0 * base * blend;
    } else if (mode == 13) {
        // DARKEN: min(base, blend)
        // Selects darker of base and blend per channel
        return min(base, blend);
    } else if (mode == 14) {
        // LIGHTEN: max(base, blend)
        // Selects lighter of base and blend per channel
        return max(base, blend);
    } else if (mode == 15) {
        // SUBTRACT: max(base - blend, 0)
        // Subtracts blend from base - creates deep shadows
        return max(base - blend, vec3(0.0));
    } else if (mode == 16) {
        // DIVIDE: base / (blend + epsilon)
        // Divides base by blend - creates ethereal glow, inverse of Multiply
        return min(base / (blend + vec3(0.001)), vec3(1.0));
    } else {
        // PIN LIGHT (mode 17): Replaces colors based on blend brightness
        // Combines Darken and Lighten based on blend luminance - creates posterization
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
