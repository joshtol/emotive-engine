/**
 * ColorUtils Tests
 * Tests for color conversion, interpolation, and undertone saturation
 */

import { describe, it, expect } from 'vitest';
import {
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
    applyUndertoneSaturation,
    applyUndertoneSaturationToArray,
    getUndertoneSaturationFactor,
    UNDERTONE_SATURATION,
    EMOTIONAL_COLORS
} from '../../../src/utils/colorUtils.js';

describe('ColorUtils', () => {
    describe('Hex to RGB Conversion', () => {
        it('should convert 6-digit hex to RGB', () => {
            const rgb = hexToRgb('#FF0000');
            expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
        });

        it('should convert 3-digit hex to RGB', () => {
            const rgb = hexToRgb('#F00');
            expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
        });

        it('should handle hex without #', () => {
            const rgb = hexToRgb('00FF00');
            expect(rgb).toEqual({ r: 0, g: 255, b: 0 });
        });

        it('should convert white correctly', () => {
            const rgb = hexToRgb('#FFFFFF');
            expect(rgb).toEqual({ r: 255, g: 255, b: 255 });
        });

        it('should convert black correctly', () => {
            const rgb = hexToRgb('#000000');
            expect(rgb).toEqual({ r: 0, g: 0, b: 0 });
        });
    });

    describe('RGB to Hex Conversion', () => {
        it('should convert RGB to hex', () => {
            const hex = rgbToHex(255, 0, 0);
            expect(hex).toBe('#ff0000');
        });

        it('should handle values with single digit hex', () => {
            const hex = rgbToHex(1, 2, 3);
            expect(hex).toBe('#010203');
        });

        it('should clamp values above 255', () => {
            const hex = rgbToHex(300, 0, 0);
            expect(hex).toBe('#ff0000');
        });

        it('should clamp values below 0', () => {
            const hex = rgbToHex(-10, 0, 0);
            expect(hex).toBe('#000000');
        });
    });

    describe('RGB to HSL Conversion', () => {
        it('should convert RGB to HSL', () => {
            const hsl = rgbToHsl(255, 0, 0);
            expect(hsl.h).toBeCloseTo(0, 0);
            expect(hsl.s).toBeCloseTo(100, 0);
            expect(hsl.l).toBeCloseTo(50, 0);
        });

        it('should handle grayscale (achromatic)', () => {
            const hsl = rgbToHsl(128, 128, 128);
            expect(hsl.s).toBeCloseTo(0, 0);
        });

        it('should convert blue correctly', () => {
            const hsl = rgbToHsl(0, 0, 255);
            expect(hsl.h).toBeCloseTo(240, 0);
        });

        it('should convert green correctly', () => {
            const hsl = rgbToHsl(0, 255, 0);
            expect(hsl.h).toBeCloseTo(120, 0);
        });
    });

    describe('HSL to RGB Conversion', () => {
        it('should convert HSL to RGB', () => {
            const rgb = hslToRgb(0, 100, 50);
            expect(rgb.r).toBe(255);
            expect(rgb.g).toBe(0);
            expect(rgb.b).toBe(0);
        });

        it('should handle achromatic colors', () => {
            const rgb = hslToRgb(0, 0, 50);
            expect(rgb.r).toBe(128);
            expect(rgb.g).toBe(128);
            expect(rgb.b).toBe(128);
        });

        it('should round trip with rgbToHsl', () => {
            const originalRgb = { r: 120, g: 200, b: 80 };
            const hsl = rgbToHsl(originalRgb.r, originalRgb.g, originalRgb.b);
            const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);

            expect(rgb.r).toBeCloseTo(originalRgb.r, 0);
            expect(rgb.g).toBeCloseTo(originalRgb.g, 0);
            expect(rgb.b).toBeCloseTo(originalRgb.b, 0);
        });
    });

    describe('RGB Interpolation', () => {
        it('should interpolate at 0% progress', () => {
            const result = interpolateRgb('#FF0000', '#0000FF', 0);
            expect(result).toBe('#ff0000');
        });

        it('should interpolate at 100% progress', () => {
            const result = interpolateRgb('#FF0000', '#0000FF', 1);
            expect(result).toBe('#0000ff');
        });

        it('should interpolate at 50% progress', () => {
            const result = interpolateRgb('#FF0000', '#0000FF', 0.5);
            // Midpoint between red and blue in RGB space
            expect(result).toBe('#800080'); // Purple-ish
        });
    });

    describe('HSL Interpolation', () => {
        it('should interpolate at 0% progress', () => {
            const result = interpolateHsl('#FF0000', '#0000FF', 0);
            expect(result).toBe('#ff0000');
        });

        it('should interpolate at 100% progress', () => {
            const result = interpolateHsl('#FF0000', '#0000FF', 1);
            expect(result).toBe('#0000ff');
        });

        it('should take shortest path around color wheel', () => {
            // Red (0°) to Yellow (60°) should go through orange, not all the way around
            const result = interpolateHsl('#FF0000', '#FFFF00', 0.5);
            const rgb = hexToRgb(result);
            // Should be orangish (high red, medium green)
            expect(rgb.r).toBeGreaterThan(200);
            expect(rgb.g).toBeGreaterThan(100);
        });
    });

    describe('RGBA Conversion', () => {
        it('should create RGBA string with default alpha', () => {
            const rgba = hexToRgba('#FF0000');
            expect(rgba).toBe('rgba(255, 0, 0, 1)');
        });

        it('should create RGBA string with custom alpha', () => {
            const rgba = hexToRgba('#FF0000', 0.5);
            expect(rgba).toBe('rgba(255, 0, 0, 0.5)');
        });

        it('should handle alpha of 0', () => {
            const rgba = hexToRgba('#FF0000', 0);
            expect(rgba).toBe('rgba(255, 0, 0, 0)');
        });
    });

    describe('Brightness Adjustment', () => {
        it('should darken color with factor < 1', () => {
            const darker = adjustBrightness('#FF0000', 0.5);
            const rgb = hexToRgb(darker);
            // Should be darker red
            expect(rgb.r).toBeLessThan(255);
        });

        it('should brighten color with factor > 1', () => {
            const brighter = adjustBrightness('#800000', 1.5);
            const rgb = hexToRgb(brighter);
            // Should be brighter
            expect(rgb.r).toBeGreaterThan(128);
        });

        it('should not change color with factor = 1', () => {
            const same = adjustBrightness('#FF0000', 1.0);
            expect(same).toBe('#ff0000');
        });

        it('should clamp at maximum brightness', () => {
            const maxBright = adjustBrightness('#FFFFFF', 2.0);
            expect(maxBright).toBe('#ffffff');
        });
    });

    describe('Saturation Adjustment', () => {
        it('should desaturate color with factor < 1', () => {
            const desaturated = adjustSaturation('#FF0000', 0.5);
            // Desaturated red should move toward gray
            expect(desaturated).not.toBe('#ff0000');
        });

        it('should increase saturation with factor > 1', () => {
            const saturated = adjustSaturation('#CC6666', 1.5);
            // Should become more vibrant
            expect(saturated).not.toBe('#cc6666');
        });

        it('should not change grayscale colors', () => {
            const gray = adjustSaturation('#808080', 1.5);
            // Gray has no saturation to increase
            expect(gray).toBe('#808080');
        });
    });

    describe('Luminance Calculation', () => {
        it('should calculate luminance for white', () => {
            const luminance = getLuminance('#FFFFFF');
            expect(luminance).toBeCloseTo(1.0, 1);
        });

        it('should calculate luminance for black', () => {
            const luminance = getLuminance('#000000');
            expect(luminance).toBeCloseTo(0.0, 1);
        });

        it('should calculate luminance for mid-gray', () => {
            const luminance = getLuminance('#808080');
            expect(luminance).toBeGreaterThan(0.1);
            expect(luminance).toBeLessThan(0.5);
        });
    });

    describe('Contrast Ratio', () => {
        it('should calculate contrast between black and white', () => {
            const contrast = getContrastRatio('#000000', '#FFFFFF');
            expect(contrast).toBeCloseTo(21, 0);
        });

        it('should calculate contrast between identical colors', () => {
            const contrast = getContrastRatio('#FF0000', '#FF0000');
            expect(contrast).toBeCloseTo(1, 0);
        });

        it('should be symmetric', () => {
            const contrast1 = getContrastRatio('#FF0000', '#0000FF');
            const contrast2 = getContrastRatio('#0000FF', '#FF0000');
            expect(contrast1).toBeCloseTo(contrast2, 5);
        });
    });

    describe('Undertone Saturation', () => {
        it('should have correct saturation factors', () => {
            expect(UNDERTONE_SATURATION.intense).toBe(1.6);
            expect(UNDERTONE_SATURATION.confident).toBe(1.3);
            expect(UNDERTONE_SATURATION.nervous).toBe(1.15);
            expect(UNDERTONE_SATURATION.clear).toBe(1.0);
            expect(UNDERTONE_SATURATION.tired).toBe(0.8);
            expect(UNDERTONE_SATURATION.subdued).toBe(0.5);
        });

        it('should not change color for clear undertone', () => {
            const original = '#FF0000';
            const adjusted = applyUndertoneSaturation(original, 'clear');
            expect(adjusted).toBe(original);
        });

        it('should increase saturation for intense undertone', () => {
            const original = '#CC6666';
            const intense = applyUndertoneSaturation(original, 'intense');
            expect(intense).not.toBe(original);

            // More saturated should be more vibrant
            const originalHsl = rgbToHsl(...Object.values(hexToRgb(original)));
            const intenseHsl = rgbToHsl(...Object.values(hexToRgb(intense)));
            expect(intenseHsl.s).toBeGreaterThan(originalHsl.s);
        });

        it('should decrease saturation for subdued undertone', () => {
            const original = '#FF0000';
            const subdued = applyUndertoneSaturation(original, 'subdued');
            expect(subdued).not.toBe(original);

            // Less saturated should be closer to gray
            const originalHsl = rgbToHsl(...Object.values(hexToRgb(original)));
            const subduedHsl = rgbToHsl(...Object.values(hexToRgb(subdued)));
            expect(subduedHsl.s).toBeLessThan(originalHsl.s);
        });

        it('should handle missing undertone', () => {
            const original = '#FF0000';
            const result = applyUndertoneSaturation(original, null);
            expect(result).toBe(original);
        });

        it('should handle invalid undertone', () => {
            const original = '#FF0000';
            const result = applyUndertoneSaturation(original, 'invalid');
            expect(result).toBe(original);
        });
    });

    describe('Undertone Saturation Array', () => {
        it('should apply undertone to string array', () => {
            const colors = ['#FF0000', '#00FF00', '#0000FF'];
            const result = applyUndertoneSaturationToArray(colors, 'intense');

            expect(result).toHaveLength(3);
            result.forEach((color, i) => {
                expect(color).not.toBe(colors[i]);
            });
        });

        it('should apply undertone to object array', () => {
            const colors = [
                { color: '#FF0000', weight: 0.5 },
                { color: '#00FF00', weight: 0.5 }
            ];
            const result = applyUndertoneSaturationToArray(colors, 'subdued');

            expect(result).toHaveLength(2);
            expect(result[0]).toHaveProperty('color');
            expect(result[0]).toHaveProperty('weight');
            expect(result[0].color).not.toBe(colors[0].color);
            expect(result[0].weight).toBe(0.5);
        });

        it('should not change array for clear undertone', () => {
            const colors = ['#FF0000', '#00FF00'];
            const result = applyUndertoneSaturationToArray(colors, 'clear');
            expect(result).toEqual(colors);
        });

        it('should handle null colors array', () => {
            const result = applyUndertoneSaturationToArray(null, 'intense');
            expect(result).toBeNull();
        });

        it('should handle non-array input', () => {
            const result = applyUndertoneSaturationToArray('#FF0000', 'intense');
            expect(result).toBe('#FF0000');
        });
    });

    describe('Get Undertone Saturation Factor', () => {
        it('should return correct factor for valid undertone', () => {
            expect(getUndertoneSaturationFactor('intense')).toBe(1.6);
            expect(getUndertoneSaturationFactor('subdued')).toBe(0.5);
        });

        it('should return 1.0 for null undertone', () => {
            expect(getUndertoneSaturationFactor(null)).toBe(1.0);
        });

        it('should return 1.0 for invalid undertone', () => {
            expect(getUndertoneSaturationFactor('invalid')).toBe(1.0);
        });

        it('should handle case insensitivity', () => {
            expect(getUndertoneSaturationFactor('INTENSE')).toBe(1.6);
            expect(getUndertoneSaturationFactor('Confident')).toBe(1.3);
        });
    });

    describe('Emotional Colors', () => {
        it('should have all basic emotions defined', () => {
            expect(EMOTIONAL_COLORS.neutral).toBeDefined();
            expect(EMOTIONAL_COLORS.joy).toBeDefined();
            expect(EMOTIONAL_COLORS.sadness).toBeDefined();
            expect(EMOTIONAL_COLORS.anger).toBeDefined();
            expect(EMOTIONAL_COLORS.fear).toBeDefined();
            expect(EMOTIONAL_COLORS.surprise).toBeDefined();
            expect(EMOTIONAL_COLORS.disgust).toBeDefined();
            expect(EMOTIONAL_COLORS.love).toBeDefined();
        });

        it('should have valid hex colors', () => {
            Object.values(EMOTIONAL_COLORS).forEach(color => {
                expect(color).toMatch(/^#[0-9A-F]{6}$/i);
            });
        });
    });
});
