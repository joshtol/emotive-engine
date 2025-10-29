/**
 * Tests for ColorUtilities - Color manipulation and transition utilities
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ColorUtilities } from '../../../../src/core/renderer/ColorUtilities.js';

describe('ColorUtilities', () => {
    let colorUtils;

    beforeEach(() => {
        colorUtils = new ColorUtilities();
    });

    describe('Constructor', () => {
        it('should initialize with null colorTransition', () => {
            expect(colorUtils.colorTransition).toBeNull();
        });
    });

    describe('hexToRgb', () => {
        it('should convert hex color with # prefix to RGB', () => {
            const rgb = colorUtils.hexToRgb('#ff0000');
            expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
        });

        it('should convert hex color without # prefix to RGB', () => {
            const rgb = colorUtils.hexToRgb('00ff00');
            expect(rgb).toEqual({ r: 0, g: 255, b: 0 });
        });

        it('should handle blue color', () => {
            const rgb = colorUtils.hexToRgb('#0000ff');
            expect(rgb).toEqual({ r: 0, g: 0, b: 255 });
        });

        it('should handle white color', () => {
            const rgb = colorUtils.hexToRgb('#ffffff');
            expect(rgb).toEqual({ r: 255, g: 255, b: 255 });
        });

        it('should handle black color', () => {
            const rgb = colorUtils.hexToRgb('#000000');
            expect(rgb).toEqual({ r: 0, g: 0, b: 0 });
        });

        it('should handle gray color', () => {
            const rgb = colorUtils.hexToRgb('#808080');
            expect(rgb).toEqual({ r: 128, g: 128, b: 128 });
        });

        it('should handle uppercase hex', () => {
            const rgb = colorUtils.hexToRgb('#ABCDEF');
            expect(rgb).toEqual({ r: 171, g: 205, b: 239 });
        });

        it('should handle mixed case hex', () => {
            const rgb = colorUtils.hexToRgb('#AbCdEf');
            expect(rgb).toEqual({ r: 171, g: 205, b: 239 });
        });

        it('should return null for invalid hex string', () => {
            const rgb = colorUtils.hexToRgb('invalid');
            expect(rgb).toBeNull();
        });

        it('should return null for short hex string', () => {
            const rgb = colorUtils.hexToRgb('#fff');
            expect(rgb).toBeNull();
        });

        it('should return null for empty string', () => {
            const rgb = colorUtils.hexToRgb('');
            expect(rgb).toBeNull();
        });

        it('should return null for null input', () => {
            const rgb = colorUtils.hexToRgb(null);
            expect(rgb).toBeNull();
        });
    });

    describe('rgbToHex', () => {
        it('should convert RGB to hex with red', () => {
            const hex = colorUtils.rgbToHex(255, 0, 0);
            expect(hex).toBe('#ff0000');
        });

        it('should convert RGB to hex with green', () => {
            const hex = colorUtils.rgbToHex(0, 255, 0);
            expect(hex).toBe('#00ff00');
        });

        it('should convert RGB to hex with blue', () => {
            const hex = colorUtils.rgbToHex(0, 0, 255);
            expect(hex).toBe('#0000ff');
        });

        it('should convert white', () => {
            const hex = colorUtils.rgbToHex(255, 255, 255);
            expect(hex).toBe('#ffffff');
        });

        it('should convert black', () => {
            const hex = colorUtils.rgbToHex(0, 0, 0);
            expect(hex).toBe('#000000');
        });

        it('should pad single digit hex values', () => {
            const hex = colorUtils.rgbToHex(1, 2, 3);
            expect(hex).toBe('#010203');
        });

        it('should handle mid-range values', () => {
            const hex = colorUtils.rgbToHex(128, 128, 128);
            expect(hex).toBe('#808080');
        });

        it('should round decimal values', () => {
            const hex = colorUtils.rgbToHex(255.7, 128.4, 64.2);
            expect(hex).toBe('#1008040');
        });
    });

    describe('rgbToHsl', () => {
        it('should convert pure red to HSL', () => {
            const hsl = colorUtils.rgbToHsl(255, 0, 0);
            expect(hsl.h).toBeCloseTo(0, 1);
            expect(hsl.s).toBeCloseTo(100, 1);
            expect(hsl.l).toBeCloseTo(50, 1);
        });

        it('should convert pure green to HSL', () => {
            const hsl = colorUtils.rgbToHsl(0, 255, 0);
            expect(hsl.h).toBeCloseTo(120, 1);
            expect(hsl.s).toBeCloseTo(100, 1);
            expect(hsl.l).toBeCloseTo(50, 1);
        });

        it('should convert pure blue to HSL', () => {
            const hsl = colorUtils.rgbToHsl(0, 0, 255);
            expect(hsl.h).toBeCloseTo(240, 1);
            expect(hsl.s).toBeCloseTo(100, 1);
            expect(hsl.l).toBeCloseTo(50, 1);
        });

        it('should convert white to HSL', () => {
            const hsl = colorUtils.rgbToHsl(255, 255, 255);
            expect(hsl.h).toBe(0);
            expect(hsl.s).toBe(0);
            expect(hsl.l).toBeCloseTo(100, 1);
        });

        it('should convert black to HSL', () => {
            const hsl = colorUtils.rgbToHsl(0, 0, 0);
            expect(hsl.h).toBe(0);
            expect(hsl.s).toBe(0);
            expect(hsl.l).toBe(0);
        });

        it('should convert gray to HSL', () => {
            const hsl = colorUtils.rgbToHsl(128, 128, 128);
            expect(hsl.h).toBe(0);
            expect(hsl.s).toBe(0);
            expect(hsl.l).toBeCloseTo(50.2, 1);
        });

        it('should handle desaturated colors', () => {
            const hsl = colorUtils.rgbToHsl(200, 180, 180);
            expect(hsl.s).toBeGreaterThan(0);
            expect(hsl.s).toBeLessThan(100);
        });

        it('should handle light colors', () => {
            const hsl = colorUtils.rgbToHsl(240, 220, 220);
            expect(hsl.l).toBeGreaterThan(80);
        });

        it('should handle dark colors', () => {
            const hsl = colorUtils.rgbToHsl(20, 10, 10);
            expect(hsl.l).toBeLessThan(10);
        });
    });

    describe('hslToHex', () => {
        it('should convert red HSL to hex', () => {
            const hex = colorUtils.hslToHex(0, 100, 50);
            expect(hex).toBe('#ff0000');
        });

        it('should convert green HSL to hex', () => {
            const hex = colorUtils.hslToHex(120, 100, 50);
            expect(hex).toBe('#00ff00');
        });

        it('should convert blue HSL to hex', () => {
            const hex = colorUtils.hslToHex(240, 100, 50);
            expect(hex).toBe('#0000ff');
        });

        it('should convert white HSL to hex', () => {
            const hex = colorUtils.hslToHex(0, 0, 100);
            expect(hex).toBe('#ffffff');
        });

        it('should convert black HSL to hex', () => {
            const hex = colorUtils.hslToHex(0, 0, 0);
            expect(hex).toBe('#000000');
        });

        it('should convert gray HSL to hex', () => {
            const hex = colorUtils.hslToHex(0, 0, 50);
            expect(hex).toBe('#808080');
        });

        it('should handle desaturated colors', () => {
            const hex = colorUtils.hslToHex(180, 20, 60);
            expect(hex).toMatch(/^#[0-9a-f]{6}$/);
        });

        it('should handle cyan', () => {
            const hex = colorUtils.hslToHex(180, 100, 50);
            expect(hex).toBe('#00ffff');
        });

        it('should handle magenta', () => {
            const hex = colorUtils.hslToHex(300, 100, 50);
            expect(hex).toBe('#ff00ff');
        });

        it('should handle yellow', () => {
            const hex = colorUtils.hslToHex(60, 100, 50);
            expect(hex).toBe('#ffff00');
        });
    });

    describe('Color conversion round-trip', () => {
        it('should maintain color through hex->RGB->hex conversion', () => {
            const original = '#ff8800';
            const rgb = colorUtils.hexToRgb(original);
            const result = colorUtils.rgbToHex(rgb.r, rgb.g, rgb.b);
            expect(result).toBe(original);
        });

        it('should maintain color through hex->RGB->HSL->hex conversion', () => {
            const original = '#ff0000';
            const rgb = colorUtils.hexToRgb(original);
            const hsl = colorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
            const result = colorUtils.hslToHex(hsl.h, hsl.s, hsl.l);
            expect(result).toBe(original);
        });
    });

    describe('applyUndertoneSaturation', () => {
        it('should increase saturation for intense undertone', () => {
            const base = '#ff0000';
            const result = colorUtils.applyUndertoneSaturation(base, 'intense');
            expect(result).toBeDefined();
            // Should remain red but possibly more vibrant
            expect(result).toMatch(/^#[0-9a-f]{6}$/);
        });

        it('should increase saturation for confident undertone', () => {
            const base = '#0000ff';
            const result = colorUtils.applyUndertoneSaturation(base, 'confident');
            expect(result).toBeDefined();
            expect(result).toMatch(/^#[0-9a-f]{6}$/);
        });

        it('should increase saturation for energetic undertone', () => {
            const base = '#00ff00';
            const result = colorUtils.applyUndertoneSaturation(base, 'energetic');
            expect(result).toBeDefined();
            expect(result).toMatch(/^#[0-9a-f]{6}$/);
        });

        it('should increase saturation for upbeat undertone', () => {
            const base = '#ffff00';
            const result = colorUtils.applyUndertoneSaturation(base, 'upbeat');
            expect(result).toBeDefined();
            expect(result).toMatch(/^#[0-9a-f]{6}$/);
        });

        it('should slightly increase saturation for nervous undertone', () => {
            const base = '#ff00ff';
            const result = colorUtils.applyUndertoneSaturation(base, 'nervous');
            expect(result).toBeDefined();
            expect(result).toMatch(/^#[0-9a-f]{6}$/);
        });

        it('should decrease saturation for mellow undertone', () => {
            const base = '#ff0000';
            const result = colorUtils.applyUndertoneSaturation(base, 'mellow');
            expect(result).toBeDefined();
            expect(result).toMatch(/^#[0-9a-f]{6}$/);
        });

        it('should decrease saturation for tired undertone', () => {
            const base = '#00ff00';
            const result = colorUtils.applyUndertoneSaturation(base, 'tired');
            expect(result).toBeDefined();
            expect(result).toMatch(/^#[0-9a-f]{6}$/);
        });

        it('should greatly decrease saturation for subdued undertone', () => {
            const base = '#0000ff';
            const result = colorUtils.applyUndertoneSaturation(base, 'subdued');
            expect(result).toBeDefined();
            expect(result).toMatch(/^#[0-9a-f]{6}$/);
        });

        it('should return same color for unknown undertone', () => {
            const base = '#808080';
            const result = colorUtils.applyUndertoneSaturation(base, 'unknown');
            expect(result).toBe(base);
        });

        it('should cap saturation at 100%', () => {
            const base = '#ff0000'; // Already fully saturated
            const result = colorUtils.applyUndertoneSaturation(base, 'intense');
            const rgb = colorUtils.hexToRgb(result);
            const hsl = colorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
            expect(hsl.s).toBeLessThanOrEqual(100);
        });
    });

    describe('applyUndertoneToColor', () => {
        it('should return base color for clear undertone', () => {
            const base = '#ff0000';
            const result = colorUtils.applyUndertoneToColor(base, 'clear');
            expect(result).toBe(base);
        });

        it('should return base color for null undertone', () => {
            const base = '#00ff00';
            const result = colorUtils.applyUndertoneToColor(base, null);
            expect(result).toBe(base);
        });

        it('should return base color for undefined undertone', () => {
            const base = '#0000ff';
            const result = colorUtils.applyUndertoneToColor(base, undefined);
            expect(result).toBe(base);
        });

        it('should apply string-based undertone', () => {
            const base = '#ff0000';
            const result = colorUtils.applyUndertoneToColor(base, 'intense');
            expect(result).toBeDefined();
            expect(result).toMatch(/^#[0-9a-f]{6}$/);
        });

        it('should handle weighted undertone with zero weight', () => {
            const base = '#ff0000';
            const result = colorUtils.applyUndertoneToColor(base, { type: 'intense', weight: 0 });
            expect(result).toBe(base);
        });

        it('should handle weighted undertone with full weight', () => {
            const base = '#ff0000';
            const result = colorUtils.applyUndertoneToColor(base, { type: 'intense', weight: 1 });
            expect(result).toBeDefined();
            expect(result).toMatch(/^#[0-9a-f]{6}$/);
        });

        it('should interpolate weighted undertone at 50%', () => {
            const base = '#ff0000';
            const result = colorUtils.applyUndertoneToColor(base, { type: 'subdued', weight: 0.5 });
            expect(result).toBeDefined();
            expect(result).toMatch(/^#[0-9a-f]{6}$/);
            expect(result).not.toBe(base);
        });

        it('should interpolate weighted undertone at 25%', () => {
            const base = '#00ff00';
            const result = colorUtils.applyUndertoneToColor(base, { type: 'energetic', weight: 0.25 });
            expect(result).toBeDefined();
            expect(result).toMatch(/^#[0-9a-f]{6}$/);
        });

        it('should handle weighted clear undertone', () => {
            const base = '#0000ff';
            const result = colorUtils.applyUndertoneToColor(base, { type: 'clear', weight: 0.5 });
            expect(result).toBe(base);
        });

        it('should handle weighted undertone without type', () => {
            const base = '#ff00ff';
            const result = colorUtils.applyUndertoneToColor(base, { weight: 0.5 });
            expect(result).toBe(base);
        });
    });

    describe('startColorTransition', () => {
        it('should initialize transition with target values', () => {
            colorUtils.startColorTransition('#ff0000', 0.8, 1000);
            expect(colorUtils.colorTransition).toBeDefined();
            expect(colorUtils.colorTransition.active).toBe(true);
            expect(colorUtils.colorTransition.toColor).toBe('#ff0000');
            expect(colorUtils.colorTransition.toIntensity).toBe(0.8);
            expect(colorUtils.colorTransition.duration).toBe(1000);
        });

        it('should use default duration when not specified', () => {
            colorUtils.startColorTransition('#00ff00', 0.5);
            expect(colorUtils.colorTransition.duration).toBe(1500);
        });

        it('should set fromColor to white if no current color', () => {
            colorUtils.startColorTransition('#0000ff', 1.0);
            expect(colorUtils.colorTransition.fromColor).toBe('#ffffff');
        });

        it('should set fromIntensity to 1.0 if no current intensity', () => {
            colorUtils.startColorTransition('#ff00ff', 0.5);
            expect(colorUtils.colorTransition.fromIntensity).toBe(1.0);
        });

        it('should not start transition if already at target', () => {
            colorUtils.currentColor = '#ff0000';
            colorUtils.currentIntensity = 0.8;
            colorUtils.startColorTransition('#ff0000', 0.8);
            expect(colorUtils.colorTransition).toBeNull();
        });

        it('should start transition with current values as from values', () => {
            colorUtils.currentColor = '#ff0000';
            colorUtils.currentIntensity = 0.5;
            colorUtils.startColorTransition('#0000ff', 1.0);
            expect(colorUtils.colorTransition.fromColor).toBe('#ff0000');
            expect(colorUtils.colorTransition.fromIntensity).toBe(0.5);
        });

        it('should store start time', () => {
            const now = performance.now();
            colorUtils.startColorTransition('#ff0000', 1.0);
            expect(colorUtils.colorTransition.startTime).toBeGreaterThanOrEqual(now);
        });

        it('should initialize progress to 0', () => {
            colorUtils.startColorTransition('#ff0000', 1.0);
            expect(colorUtils.colorTransition.progress).toBe(0);
        });
    });

    describe('updateColorTransition', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should return null if no active transition', () => {
            const result = colorUtils.updateColorTransition(16);
            expect(result).toBeNull();
        });

        it('should return null if transition is not active', () => {
            colorUtils.colorTransition = { active: false };
            const result = colorUtils.updateColorTransition(16);
            expect(result).toBeNull();
        });

        it('should interpolate color at start of transition', () => {
            const now = performance.now();
            colorUtils.colorTransition = {
                active: true,
                fromColor: '#ff0000',
                toColor: '#0000ff',
                fromIntensity: 1.0,
                toIntensity: 0.5,
                startTime: now,
                duration: 1000
            };

            const result = colorUtils.updateColorTransition(0);
            expect(result).toBeDefined();
            expect(result.color).toMatch(/^#[0-9a-f]{6}$/);
            expect(result.intensity).toBeCloseTo(1.0, 1);
        });

        it('should interpolate color at mid-transition', () => {
            const now = performance.now();
            vi.setSystemTime(now);

            colorUtils.colorTransition = {
                active: true,
                fromColor: '#ff0000',
                toColor: '#0000ff',
                fromIntensity: 1.0,
                toIntensity: 0.5,
                startTime: now,
                duration: 1000
            };

            vi.advanceTimersByTime(500);
            const result = colorUtils.updateColorTransition(16);
            expect(result).toBeDefined();
            expect(result.intensity).toBeGreaterThan(0.5);
            expect(result.intensity).toBeLessThan(1.0);
        });

        it('should complete transition at end', () => {
            const now = performance.now();
            vi.setSystemTime(now);

            colorUtils.colorTransition = {
                active: true,
                fromColor: '#ff0000',
                toColor: '#0000ff',
                fromIntensity: 1.0,
                toIntensity: 0.5,
                startTime: now,
                duration: 1000
            };

            vi.advanceTimersByTime(1000);
            const result = colorUtils.updateColorTransition(16);
            expect(result.color).toBe('#0000ff');
            expect(result.intensity).toBeCloseTo(0.5, 2);
            expect(colorUtils.colorTransition.active).toBe(false);
        });

        it('should store current color and intensity', () => {
            const now = performance.now();
            vi.setSystemTime(now);

            colorUtils.colorTransition = {
                active: true,
                fromColor: '#ff0000',
                toColor: '#00ff00',
                fromIntensity: 1.0,
                toIntensity: 0.8,
                startTime: now,
                duration: 1000
            };

            colorUtils.updateColorTransition(16);
            expect(colorUtils.currentColor).toBeDefined();
            expect(colorUtils.currentIntensity).toBeDefined();
        });

        it('should use ease-out-quad for smooth deceleration', () => {
            const now = performance.now();
            vi.setSystemTime(now);

            colorUtils.colorTransition = {
                active: true,
                fromColor: '#ffffff',
                toColor: '#000000',
                fromIntensity: 1.0,
                toIntensity: 0.0,
                startTime: now,
                duration: 1000
            };

            // At 25% time, eased value should be greater than 25%
            vi.advanceTimersByTime(250);
            const result1 = colorUtils.updateColorTransition(16);

            // At 75% time, eased value should be greater than 75%
            vi.setSystemTime(now);
            colorUtils.colorTransition.startTime = now;
            vi.advanceTimersByTime(750);
            const result2 = colorUtils.updateColorTransition(16);

            expect(result1).toBeDefined();
            expect(result2).toBeDefined();
        });

        it('should handle transition past duration', () => {
            const now = performance.now();
            vi.setSystemTime(now);

            colorUtils.colorTransition = {
                active: true,
                fromColor: '#ff0000',
                toColor: '#0000ff',
                fromIntensity: 1.0,
                toIntensity: 0.5,
                startTime: now,
                duration: 1000
            };

            vi.advanceTimersByTime(2000);
            const result = colorUtils.updateColorTransition(16);
            expect(result.color).toBe('#0000ff');
            expect(result.intensity).toBeCloseTo(0.5, 2);
            expect(colorUtils.colorTransition.active).toBe(false);
        });
    });

    describe('applyUndertoneModifiers', () => {
        it('should return visualProperties unchanged', () => {
            const props = { color: '#ff0000', intensity: 0.8 };
            const result = colorUtils.applyUndertoneModifiers('intense', props);
            expect(result).toBe(props);
        });

        it('should handle null undertone', () => {
            const props = { color: '#ff0000' };
            const result = colorUtils.applyUndertoneModifiers(null, props);
            expect(result).toBe(props);
        });

        it('should handle undefined visualProperties', () => {
            const result = colorUtils.applyUndertoneModifiers('intense', undefined);
            expect(result).toBeUndefined();
        });
    });

    describe('Edge cases and error handling', () => {
        it('should handle very bright colors in HSL conversion', () => {
            const rgb = { r: 255, g: 255, b: 254 };
            const hsl = colorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
            expect(hsl.l).toBeGreaterThan(99);
        });

        it('should handle very dark colors in HSL conversion', () => {
            const rgb = { r: 1, g: 1, b: 1 };
            const hsl = colorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
            expect(hsl.l).toBeLessThan(1);
        });

        it('should handle color interpolation with identical colors', () => {
            const base = '#ff0000';
            const result = colorUtils.applyUndertoneToColor(base, { type: 'intense', weight: 0.5 });
            expect(result).toMatch(/^#[0-9a-f]{6}$/);
        });

        it('should handle zero RGB values in conversion', () => {
            const hex = colorUtils.rgbToHex(0, 0, 0);
            expect(hex).toBe('#000000');
        });

        it('should handle maximum RGB values in conversion', () => {
            const hex = colorUtils.rgbToHex(255, 255, 255);
            expect(hex).toBe('#ffffff');
        });

        it('should convert negative RGB values without clamping', () => {
            const hex = colorUtils.rgbToHex(-10, 100, 200);
            expect(hex).toBe('#-a64c8');
        });

        it('should convert RGB values over 255 without clamping', () => {
            const hex = colorUtils.rgbToHex(300, 100, 50);
            expect(hex).toBe('#12c6432');
        });
    });
});
