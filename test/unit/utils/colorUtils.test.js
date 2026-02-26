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
    UNDERTONE_SATURATION,
    applyUndertoneSaturation,
    applyUndertoneSaturationToArray,
    getUndertoneSaturationFactor,
    EMOTIONAL_COLORS,
    EMOTIONAL_COLORS_RGB,
} from '../../../src/utils/colorUtils.js';

describe('hexToRgb', () => {
    it('should convert 6-digit hex to RGB', () => {
        expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
        expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 });
        expect(hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 });
        expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
        expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should handle hex without # prefix', () => {
        expect(hexToRgb('FF0000')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should handle 3-digit hex shorthand', () => {
        expect(hexToRgb('#F00')).toEqual({ r: 255, g: 0, b: 0 });
        expect(hexToRgb('#FFF')).toEqual({ r: 255, g: 255, b: 255 });
    });
});

describe('rgbToHex', () => {
    it('should convert RGB to hex', () => {
        expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
        expect(rgbToHex(0, 255, 0)).toBe('#00ff00');
        expect(rgbToHex(0, 0, 255)).toBe('#0000ff');
        expect(rgbToHex(0, 0, 0)).toBe('#000000');
        expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
    });

    it('should clamp values to 0-255', () => {
        expect(rgbToHex(300, -10, 128)).toBe('#ff0080');
    });

    it('should pad single-digit hex values', () => {
        expect(rgbToHex(0, 0, 0)).toBe('#000000');
        expect(rgbToHex(1, 1, 1)).toBe('#010101');
    });
});

describe('RGB ↔ HSL roundtrip', () => {
    const testColors = [
        { r: 255, g: 0, b: 0, name: 'red' },
        { r: 0, g: 255, b: 0, name: 'green' },
        { r: 0, g: 0, b: 255, name: 'blue' },
        { r: 255, g: 255, b: 0, name: 'yellow' },
        { r: 128, g: 128, b: 128, name: 'gray' },
        { r: 0, g: 0, b: 0, name: 'black' },
        { r: 255, g: 255, b: 255, name: 'white' },
    ];

    for (const color of testColors) {
        it(`should roundtrip ${color.name} through HSL`, () => {
            const hsl = rgbToHsl(color.r, color.g, color.b);
            const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
            expect(rgb.r).toBeCloseTo(color.r, 0);
            expect(rgb.g).toBeCloseTo(color.g, 0);
            expect(rgb.b).toBeCloseTo(color.b, 0);
        });
    }
});

describe('rgbToHsl', () => {
    it('should return 0 saturation for achromatic colors', () => {
        const gray = rgbToHsl(128, 128, 128);
        expect(gray.s).toBe(0);
    });

    it('should return hue=0 for red', () => {
        const red = rgbToHsl(255, 0, 0);
        expect(red.h).toBe(0);
        expect(red.s).toBe(100);
        expect(red.l).toBe(50);
    });

    it('should return correct values for primary colors', () => {
        const green = rgbToHsl(0, 255, 0);
        expect(green.h).toBe(120);

        const blue = rgbToHsl(0, 0, 255);
        expect(blue.h).toBe(240);
    });
});

describe('hslToRgb', () => {
    it('should handle achromatic (s=0) correctly', () => {
        const gray = hslToRgb(0, 0, 50);
        expect(gray.r).toBe(128);
        expect(gray.g).toBe(128);
        expect(gray.b).toBe(128);
    });
});

describe('interpolateRgb', () => {
    it('should return start color at progress=0', () => {
        expect(interpolateRgb('#FF0000', '#0000FF', 0).toLowerCase()).toBe('#ff0000');
    });

    it('should return end color at progress=1', () => {
        expect(interpolateRgb('#FF0000', '#0000FF', 1).toLowerCase()).toBe('#0000ff');
    });

    it('should return midpoint at progress=0.5', () => {
        const mid = interpolateRgb('#000000', '#FFFFFF', 0.5);
        const rgb = hexToRgb(mid);
        expect(rgb.r).toBeCloseTo(128, 0);
        expect(rgb.g).toBeCloseTo(128, 0);
        expect(rgb.b).toBeCloseTo(128, 0);
    });
});

describe('interpolateHsl', () => {
    it('should return start color at progress=0', () => {
        const result = interpolateHsl('#FF0000', '#0000FF', 0);
        const rgb = hexToRgb(result);
        expect(rgb.r).toBeCloseTo(255, 0);
    });

    it('should return end color at progress=1', () => {
        const result = interpolateHsl('#FF0000', '#0000FF', 1);
        const rgb = hexToRgb(result);
        expect(rgb.b).toBeCloseTo(255, 0);
    });

    it('should take shortest path around hue wheel', () => {
        // Red(0) to Blue(240) — shortest path goes through magenta, not through green
        const mid = interpolateHsl('#FF0000', '#0000FF', 0.5);
        const rgb = hexToRgb(mid);
        // Midpoint should be in magenta/purple range, not green/cyan
        expect(rgb.r).toBeGreaterThan(rgb.g);
    });
});

describe('hexToRgba', () => {
    it('should create rgba string', () => {
        expect(hexToRgba('#FF0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
    });

    it('should default to alpha=1', () => {
        expect(hexToRgba('#FF0000')).toBe('rgba(255, 0, 0, 1)');
    });
});

describe('adjustBrightness', () => {
    it('should darken when factor < 1', () => {
        const darker = adjustBrightness('#808080', 0.5);
        const rgb = hexToRgb(darker);
        const originalRgb = hexToRgb('#808080');
        expect(rgb.r).toBeLessThan(originalRgb.r);
    });

    it('should brighten when factor > 1', () => {
        const brighter = adjustBrightness('#808080', 1.5);
        const rgb = hexToRgb(brighter);
        const originalRgb = hexToRgb('#808080');
        expect(rgb.r).toBeGreaterThan(originalRgb.r);
    });
});

describe('adjustSaturation', () => {
    it('should desaturate when factor < 1', () => {
        const desaturated = adjustSaturation('#FF0000', 0.5);
        const hsl = rgbToHsl(...Object.values(hexToRgb(desaturated)));
        const originalHsl = rgbToHsl(255, 0, 0);
        expect(hsl.s).toBeLessThan(originalHsl.s);
    });

    it('should not change achromatic colors', () => {
        // Gray has s=0, adjusting saturation should leave it gray
        const result = adjustSaturation('#808080', 2.0);
        const rgb = hexToRgb(result);
        expect(rgb.r).toBe(rgb.g);
        expect(rgb.g).toBe(rgb.b);
    });
});

describe('getLuminance', () => {
    it('should return 0 for black', () => {
        expect(getLuminance('#000000')).toBeCloseTo(0, 3);
    });

    it('should return 1 for white', () => {
        expect(getLuminance('#FFFFFF')).toBeCloseTo(1, 3);
    });

    it('should return intermediate values for other colors', () => {
        const lum = getLuminance('#808080');
        expect(lum).toBeGreaterThan(0);
        expect(lum).toBeLessThan(1);
    });

    it('should weight green more than red and blue (perceptual)', () => {
        const redLum = getLuminance('#FF0000');
        const greenLum = getLuminance('#00FF00');
        const blueLum = getLuminance('#0000FF');
        expect(greenLum).toBeGreaterThan(redLum);
        expect(greenLum).toBeGreaterThan(blueLum);
    });
});

describe('getContrastRatio', () => {
    it('should return 21 for black vs white', () => {
        expect(getContrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 0);
    });

    it('should return 1 for same color', () => {
        expect(getContrastRatio('#FF0000', '#FF0000')).toBeCloseTo(1, 1);
    });

    it('should be symmetric', () => {
        const ratio1 = getContrastRatio('#FF0000', '#0000FF');
        const ratio2 = getContrastRatio('#0000FF', '#FF0000');
        expect(ratio1).toBeCloseTo(ratio2, 5);
    });

    it('should always be >= 1', () => {
        expect(getContrastRatio('#808080', '#808080')).toBeGreaterThanOrEqual(1);
    });
});

describe('Undertone Saturation', () => {
    describe('UNDERTONE_SATURATION constants', () => {
        it('should have all 6 undertone levels', () => {
            expect(UNDERTONE_SATURATION.intense).toBe(1.6);
            expect(UNDERTONE_SATURATION.confident).toBe(1.3);
            expect(UNDERTONE_SATURATION.nervous).toBe(1.15);
            expect(UNDERTONE_SATURATION.clear).toBe(1.0);
            expect(UNDERTONE_SATURATION.tired).toBe(0.8);
            expect(UNDERTONE_SATURATION.subdued).toBe(0.5);
        });
    });

    describe('applyUndertoneSaturation', () => {
        it('should return unchanged color for "clear" undertone', () => {
            expect(applyUndertoneSaturation('#FF0000', 'clear')).toBe('#FF0000');
        });

        it('should return unchanged color for missing undertone', () => {
            expect(applyUndertoneSaturation('#FF0000', null)).toBe('#FF0000');
            expect(applyUndertoneSaturation('#FF0000', undefined)).toBe('#FF0000');
        });

        it('should be case-insensitive', () => {
            const result1 = applyUndertoneSaturation('#FF8800', 'intense');
            const result2 = applyUndertoneSaturation('#FF8800', 'INTENSE');
            expect(result1).toBe(result2);
        });
    });

    describe('applyUndertoneSaturationToArray', () => {
        it('should apply undertone to array of color strings', () => {
            const colors = ['#FF0000', '#00FF00'];
            const result = applyUndertoneSaturationToArray(colors, 'intense');
            expect(result).toHaveLength(2);
            expect(typeof result[0]).toBe('string');
        });

        it('should handle weighted color objects', () => {
            const colors = [{ color: '#FF0000', weight: 1 }];
            const result = applyUndertoneSaturationToArray(colors, 'intense');
            expect(result[0].weight).toBe(1);
            expect(typeof result[0].color).toBe('string');
        });

        it('should return unchanged array for "clear" undertone', () => {
            const colors = ['#FF0000'];
            expect(applyUndertoneSaturationToArray(colors, 'clear')).toBe(colors);
        });

        it('should handle null/undefined input', () => {
            expect(applyUndertoneSaturationToArray(null, 'intense')).toBeNull();
            expect(applyUndertoneSaturationToArray(undefined, 'intense')).toBeUndefined();
        });
    });

    describe('getUndertoneSaturationFactor', () => {
        it('should return correct factor for each undertone', () => {
            expect(getUndertoneSaturationFactor('intense')).toBe(1.6);
            expect(getUndertoneSaturationFactor('subdued')).toBe(0.5);
        });

        it('should return 1.0 for unknown undertones', () => {
            expect(getUndertoneSaturationFactor('unknown')).toBe(1.0);
        });

        it('should return 1.0 for null/undefined', () => {
            expect(getUndertoneSaturationFactor(null)).toBe(1.0);
            expect(getUndertoneSaturationFactor(undefined)).toBe(1.0);
        });
    });
});

describe('Emotional Color Palette', () => {
    it('should have all core emotions', () => {
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
        for (const [, hex] of Object.entries(EMOTIONAL_COLORS)) {
            expect(hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
        }
    });

    it('should have matching RGB precomputed values', () => {
        for (const emotion of Object.keys(EMOTIONAL_COLORS)) {
            expect(EMOTIONAL_COLORS_RGB[emotion]).toBeDefined();
            // Should be in "r, g, b" format
            expect(EMOTIONAL_COLORS_RGB[emotion]).toMatch(/^\d+, \d+, \d+$/);
        }
    });
});
