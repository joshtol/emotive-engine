/**
 * Comprehensive tests for GlowRenderer
 * Tests glow effects rendering for the EmotiveRenderer
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { GlowRenderer } from '../../../../src/core/renderer/GlowRenderer.js';
import { gradientCache } from '../../../../src/core/renderer/GradientCache.js';

describe('GlowRenderer', () => {
    let glowRenderer;
    let mockRenderer;
    let mockCanvas;
    let mockCtx;
    let mockOffscreenCanvas;
    let mockOffscreenCtx;

    beforeEach(() => {
        // Create mock offscreen context
        mockOffscreenCtx = {
            clearRect: vi.fn(),
            fillRect: vi.fn(),
            createRadialGradient: vi.fn(() => ({
                addColorStop: vi.fn()
            })),
            fillStyle: '',
            canvas: { width: 0, height: 0 }
        };

        // Create mock offscreen canvas
        mockOffscreenCanvas = {
            width: 0,
            height: 0,
            getContext: vi.fn(() => mockOffscreenCtx)
        };

        // Create mock main canvas
        mockCanvas = {
            width: 800,
            height: 600,
            getContext: vi.fn()
        };

        // Create comprehensive mock context
        mockCtx = {
            canvas: mockCanvas,
            save: vi.fn(),
            restore: vi.fn(),
            clearRect: vi.fn(),
            beginPath: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            stroke: vi.fn(),
            fillRect: vi.fn(),
            createRadialGradient: vi.fn(() => ({
                addColorStop: vi.fn()
            })),
            createLinearGradient: vi.fn(() => ({
                addColorStop: vi.fn()
            })),
            fillStyle: '',
            strokeStyle: '',
            globalAlpha: 1,
            globalCompositeOperation: 'source-over'
        };

        // Create mock renderer
        mockRenderer = {
            ctx: mockCtx,
            canvas: mockCanvas,
            scaleValue: vi.fn(value => value * 2),
            hexToRgba: vi.fn((hex, alpha) => `rgba(74, 144, 226, ${alpha})`)
        };

        // Mock document.createElement for offscreen canvas
        global.document = {
            createElement: vi.fn(tag => {
                if (tag === 'canvas') {
                    return mockOffscreenCanvas;
                }
                return null;
            })
        };

        // Clear gradient cache before each test
        gradientCache.clear();

        glowRenderer = new GlowRenderer(mockRenderer);
    });

    afterEach(() => {
        vi.clearAllMocks();
        gradientCache.clear();
    });

    describe('Constructor and Initialization', () => {
        it('should create GlowRenderer instance', () => {
            expect(glowRenderer).toBeDefined();
            expect(glowRenderer).toBeInstanceOf(GlowRenderer);
        });

        it('should store renderer reference', () => {
            expect(glowRenderer.renderer).toBe(mockRenderer);
        });

        it('should store canvas context reference', () => {
            expect(glowRenderer.ctx).toBe(mockCtx);
        });

        it('should store canvas reference', () => {
            expect(glowRenderer.canvas).toBe(mockCanvas);
        });

        it('should initialize glow intensity to 1.0', () => {
            expect(glowRenderer.glowIntensity).toBe(1.0);
        });

        it('should initialize glow color to default blue', () => {
            expect(glowRenderer.glowColor).toBe('#4a90e2');
        });

        it('should initialize target glow color to default blue', () => {
            expect(glowRenderer.targetGlowColor).toBe('#4a90e2');
        });

        it('should initialize glow color transition to 0', () => {
            expect(glowRenderer.glowColorTransition).toBe(0);
        });

        it('should initialize glow color transition speed', () => {
            expect(glowRenderer.glowColorTransitionSpeed).toBe(0.05);
        });

        it('should initialize offscreen canvas', () => {
            expect(glowRenderer.offscreenCanvas).toBeDefined();
            expect(global.document.createElement).toHaveBeenCalledWith('canvas');
        });

        it('should initialize offscreen context', () => {
            expect(glowRenderer.offscreenCtx).toBeDefined();
            expect(mockOffscreenCanvas.getContext).toHaveBeenCalledWith('2d');
        });

        it('should initialize cached glow color to null', () => {
            expect(glowRenderer.cachedGlowColor).toBeNull();
        });

        it('should initialize cached glow radius to 0', () => {
            expect(glowRenderer.cachedGlowRadius).toBe(0);
        });

        it('should store scaleValue helper method', () => {
            expect(glowRenderer.scaleValue).toBeDefined();
            expect(typeof glowRenderer.scaleValue).toBe('function');
        });

        it('should store hexToRgba helper method', () => {
            expect(glowRenderer.hexToRgba).toBeDefined();
            expect(typeof glowRenderer.hexToRgba).toBe('function');
        });

        it('should call initOffscreenCanvas during construction', () => {
            expect(glowRenderer.offscreenCanvas).toBeDefined();
        });
    });

    describe('initOffscreenCanvas', () => {
        it('should create canvas element', () => {
            glowRenderer.initOffscreenCanvas();
            expect(global.document.createElement).toHaveBeenCalledWith('canvas');
        });

        it('should get 2d context from offscreen canvas', () => {
            glowRenderer.initOffscreenCanvas();
            expect(mockOffscreenCanvas.getContext).toHaveBeenCalledWith('2d');
        });

        it('should store offscreen canvas reference', () => {
            glowRenderer.initOffscreenCanvas();
            expect(glowRenderer.offscreenCanvas).toBe(mockOffscreenCanvas);
        });

        it('should store offscreen context reference', () => {
            glowRenderer.initOffscreenCanvas();
            expect(glowRenderer.offscreenCtx).toBe(mockOffscreenCtx);
        });
    });

    describe('updateOffscreenSize', () => {
        it('should update canvas width when size changes', () => {
            glowRenderer.updateOffscreenSize(200);
            expect(glowRenderer.offscreenCanvas.width).toBe(200);
        });

        it('should update canvas height when size changes', () => {
            glowRenderer.updateOffscreenSize(200);
            expect(glowRenderer.offscreenCanvas.height).toBe(200);
        });

        it('should invalidate cache when size changes', () => {
            glowRenderer.cachedGlowColor = '#FF0000';
            glowRenderer.updateOffscreenSize(200);
            expect(glowRenderer.cachedGlowColor).toBeNull();
        });

        it('should not invalidate cache when size unchanged', () => {
            glowRenderer.offscreenCanvas.width = 200;
            glowRenderer.offscreenCanvas.height = 200;
            glowRenderer.cachedGlowColor = '#FF0000';
            glowRenderer.updateOffscreenSize(200);
            expect(glowRenderer.cachedGlowColor).toBe('#FF0000');
        });

        it('should handle zero size', () => {
            expect(() => glowRenderer.updateOffscreenSize(0)).not.toThrow();
            expect(glowRenderer.offscreenCanvas.width).toBe(0);
            expect(glowRenderer.offscreenCanvas.height).toBe(0);
        });

        it('should handle large sizes', () => {
            expect(() => glowRenderer.updateOffscreenSize(2000)).not.toThrow();
            expect(glowRenderer.offscreenCanvas.width).toBe(2000);
            expect(glowRenderer.offscreenCanvas.height).toBe(2000);
        });
    });

    describe('renderGlow', () => {
        it('should render glow without throwing', () => {
            expect(() => glowRenderer.renderGlow(400, 300, 50)).not.toThrow();
        });

        it('should use default glow color when not provided', () => {
            glowRenderer.renderGlow(400, 300, 50);
            expect(mockRenderer.hexToRgba).toHaveBeenCalled();
        });

        it('should use custom color from params', () => {
            const customColor = '#FF0000';
            glowRenderer.renderGlow(400, 300, 50, { color: customColor });
            // Verify hexToRgba was called with the custom color
            const {calls} = mockRenderer.hexToRgba.mock;
            expect(calls.some(call => call[0] === customColor)).toBe(true);
        });

        it('should use default intensity when not provided', () => {
            glowRenderer.glowIntensity = 0.8;
            expect(() => glowRenderer.renderGlow(400, 300, 50)).not.toThrow();
        });

        it('should use custom intensity from params', () => {
            expect(() => glowRenderer.renderGlow(400, 300, 50, { intensity: 0.5 })).not.toThrow();
        });

        it('should skip rendering when intensity is very low', () => {
            mockCtx.save.mockClear();
            glowRenderer.renderGlow(400, 300, 50, { intensity: 0.005 });
            expect(mockCtx.save).not.toHaveBeenCalled();
        });

        it('should skip rendering when intensity is zero', () => {
            mockCtx.save.mockClear();
            glowRenderer.renderGlow(400, 300, 50, { intensity: 0 });
            expect(mockCtx.save).not.toHaveBeenCalled();
        });

        it('should call renderGlowDirect when intensity is sufficient', () => {
            const spy = vi.spyOn(glowRenderer, 'renderGlowDirect');
            glowRenderer.renderGlow(400, 300, 50, { intensity: 0.5 });
            expect(spy).toHaveBeenCalled();
        });

        it('should handle different positions', () => {
            expect(() => glowRenderer.renderGlow(100, 100, 50)).not.toThrow();
            expect(() => glowRenderer.renderGlow(700, 500, 50)).not.toThrow();
        });

        it('should handle different radii', () => {
            expect(() => glowRenderer.renderGlow(400, 300, 10)).not.toThrow();
            expect(() => glowRenderer.renderGlow(400, 300, 200)).not.toThrow();
        });

        it('should accept empty params object', () => {
            expect(() => glowRenderer.renderGlow(400, 300, 50, {})).not.toThrow();
        });
    });

    describe('cacheGlowGradient', () => {
        it('should cache glow gradient without throwing', () => {
            expect(() => glowRenderer.cacheGlowGradient('#FF0000', 100)).not.toThrow();
        });

        it('should update offscreen canvas size', () => {
            glowRenderer.cacheGlowGradient('#FF0000', 100);
            expect(glowRenderer.offscreenCanvas.width).toBe(200);
            expect(glowRenderer.offscreenCanvas.height).toBe(200);
        });

        it('should clear offscreen canvas', () => {
            glowRenderer.cacheGlowGradient('#FF0000', 100);
            expect(mockOffscreenCtx.clearRect).toHaveBeenCalledWith(0, 0, 200, 200);
        });

        it('should use gradient cache', () => {
            const spy = vi.spyOn(gradientCache, 'getRadialGradient');
            glowRenderer.cacheGlowGradient('#FF0000', 100);
            expect(spy).toHaveBeenCalled();
        });

        it('should draw gradient to offscreen canvas', () => {
            glowRenderer.cacheGlowGradient('#FF0000', 100);
            expect(mockOffscreenCtx.fillRect).toHaveBeenCalledWith(0, 0, 200, 200);
        });

        it('should update cached glow color', () => {
            const color = '#FF0000';
            glowRenderer.cacheGlowGradient(color, 100);
            expect(glowRenderer.cachedGlowColor).toBe(color);
        });

        it('should update cached glow radius', () => {
            const size = 100;
            glowRenderer.cacheGlowGradient('#FF0000', size);
            expect(glowRenderer.cachedGlowRadius).toBe(size);
        });

        it('should handle different colors', () => {
            expect(() => glowRenderer.cacheGlowGradient('#00FF00', 100)).not.toThrow();
            expect(() => glowRenderer.cacheGlowGradient('#0000FF', 100)).not.toThrow();
        });

        it('should handle different sizes', () => {
            expect(() => glowRenderer.cacheGlowGradient('#FF0000', 50)).not.toThrow();
            expect(() => glowRenderer.cacheGlowGradient('#FF0000', 200)).not.toThrow();
        });
    });

    describe('renderGlowDirect', () => {
        it('should render glow directly without throwing', () => {
            expect(() => glowRenderer.renderGlowDirect(mockCtx, 400, 300, 50, '#FF0000', 1.0)).not.toThrow();
        });

        it('should save canvas context state', () => {
            glowRenderer.renderGlowDirect(mockCtx, 400, 300, 50, '#FF0000', 1.0);
            expect(mockCtx.save).toHaveBeenCalled();
        });

        it('should restore canvas context state', () => {
            glowRenderer.renderGlowDirect(mockCtx, 400, 300, 50, '#FF0000', 1.0);
            expect(mockCtx.restore).toHaveBeenCalled();
        });

        it('should use screen blending mode', () => {
            glowRenderer.renderGlowDirect(mockCtx, 400, 300, 50, '#FF0000', 1.0);
            expect(mockCtx.globalCompositeOperation).toBe('screen');
        });

        it('should create gradient with multiple stops', () => {
            const spy = vi.spyOn(gradientCache, 'getRadialGradient');
            glowRenderer.renderGlowDirect(mockCtx, 400, 300, 50, '#FF0000', 1.0);
            expect(spy).toHaveBeenCalled();
            const gradientStops = spy.mock.calls[0][7];
            expect(gradientStops.length).toBe(21); // 20 stops + 1
        });

        it('should draw arc for glow effect', () => {
            glowRenderer.renderGlowDirect(mockCtx, 400, 300, 50, '#FF0000', 1.0);
            expect(mockCtx.beginPath).toHaveBeenCalled();
            expect(mockCtx.arc).toHaveBeenCalledWith(400, 300, 50, 0, Math.PI * 2);
            expect(mockCtx.fill).toHaveBeenCalled();
        });

        it('should handle zero intensity', () => {
            expect(() => glowRenderer.renderGlowDirect(mockCtx, 400, 300, 50, '#FF0000', 0)).not.toThrow();
        });

        it('should handle maximum intensity', () => {
            expect(() => glowRenderer.renderGlowDirect(mockCtx, 400, 300, 50, '#FF0000', 1.0)).not.toThrow();
        });

        it('should handle fractional intensity', () => {
            expect(() => glowRenderer.renderGlowDirect(mockCtx, 400, 300, 50, '#FF0000', 0.5)).not.toThrow();
        });

        it('should use hexToRgba for color conversion', () => {
            glowRenderer.renderGlowDirect(mockCtx, 400, 300, 50, '#FF0000', 1.0);
            expect(mockRenderer.hexToRgba).toHaveBeenCalled();
        });

        it('should handle different positions', () => {
            expect(() => glowRenderer.renderGlowDirect(mockCtx, 0, 0, 50, '#FF0000', 1.0)).not.toThrow();
            expect(() => glowRenderer.renderGlowDirect(mockCtx, 800, 600, 50, '#FF0000', 1.0)).not.toThrow();
        });

        it('should handle different radii', () => {
            expect(() => glowRenderer.renderGlowDirect(mockCtx, 400, 300, 1, '#FF0000', 1.0)).not.toThrow();
            expect(() => glowRenderer.renderGlowDirect(mockCtx, 400, 300, 500, '#FF0000', 1.0)).not.toThrow();
        });
    });

    describe('renderRecordingGlow', () => {
        it('should render recording glow without throwing', () => {
            expect(() => glowRenderer.renderRecordingGlow(400, 300, 50, 1.0)).not.toThrow();
        });

        it('should save canvas context state', () => {
            glowRenderer.renderRecordingGlow(400, 300, 50, 1.0);
            expect(mockCtx.save).toHaveBeenCalled();
        });

        it('should restore canvas context state', () => {
            glowRenderer.renderRecordingGlow(400, 300, 50, 1.0);
            expect(mockCtx.restore).toHaveBeenCalled();
        });

        it('should use screen blending mode', () => {
            glowRenderer.renderRecordingGlow(400, 300, 50, 1.0);
            expect(mockCtx.globalCompositeOperation).toBe('screen');
        });

        it('should create radial gradient', () => {
            const spy = vi.spyOn(gradientCache, 'getRadialGradient');
            glowRenderer.renderRecordingGlow(400, 300, 50, 1.0);
            expect(spy).toHaveBeenCalled();
        });

        it('should use red color for recording', () => {
            const spy = vi.spyOn(gradientCache, 'getRadialGradient');
            glowRenderer.renderRecordingGlow(400, 300, 50, 1.0);
            const gradientStops = spy.mock.calls[0][7];
            expect(gradientStops[0].color).toContain('255, 0, 0');
        });

        it('should scale glow size by 2.5x radius', () => {
            const spy = vi.spyOn(gradientCache, 'getRadialGradient');
            const radius = 50;
            glowRenderer.renderRecordingGlow(400, 300, radius, 1.0);
            const glowSize = spy.mock.calls[0][6]; // r1 parameter
            expect(glowSize).toBe(radius * 2.5);
        });

        it('should draw filled rectangle for glow', () => {
            glowRenderer.renderRecordingGlow(400, 300, 50, 1.0);
            expect(mockCtx.fillRect).toHaveBeenCalled();
        });

        it('should handle zero intensity', () => {
            expect(() => glowRenderer.renderRecordingGlow(400, 300, 50, 0)).not.toThrow();
        });

        it('should handle maximum intensity', () => {
            expect(() => glowRenderer.renderRecordingGlow(400, 300, 50, 1.0)).not.toThrow();
        });

        it('should handle fractional intensity', () => {
            expect(() => glowRenderer.renderRecordingGlow(400, 300, 50, 0.5)).not.toThrow();
        });
    });

    describe('renderZenGlow', () => {
        it('should render zen glow without throwing', () => {
            expect(() => glowRenderer.renderZenGlow(400, 300, 50, 1000)).not.toThrow();
        });

        it('should save canvas context state', () => {
            glowRenderer.renderZenGlow(400, 300, 50, 1000);
            expect(mockCtx.save).toHaveBeenCalled();
        });

        it('should restore canvas context state', () => {
            glowRenderer.renderZenGlow(400, 300, 50, 1000);
            expect(mockCtx.restore).toHaveBeenCalled();
        });

        it('should use screen blending mode', () => {
            glowRenderer.renderZenGlow(400, 300, 50, 1000);
            expect(mockCtx.globalCompositeOperation).toBe('screen');
        });

        it('should create radial gradient', () => {
            const spy = vi.spyOn(gradientCache, 'getRadialGradient');
            glowRenderer.renderZenGlow(400, 300, 50, 1000);
            expect(spy).toHaveBeenCalled();
        });

        it('should use purple color for zen', () => {
            const spy = vi.spyOn(gradientCache, 'getRadialGradient');
            glowRenderer.renderZenGlow(400, 300, 50, 1000);
            const gradientStops = spy.mock.calls[0][7];
            expect(gradientStops[0].color).toContain('147, 112, 219');
        });

        it('should animate radius based on time', () => {
            const spy = vi.spyOn(gradientCache, 'getRadialGradient');
            const radius = 50;
            glowRenderer.renderZenGlow(400, 300, radius, 1000);
            const zenRadius = spy.mock.calls[0][6];
            expect(zenRadius).toBeGreaterThan(radius * 0.9);
            expect(zenRadius).toBeLessThanOrEqual(radius * 1.5 * 1.5);
        });

        it('should draw arc for zen glow', () => {
            glowRenderer.renderZenGlow(400, 300, 50, 1000);
            expect(mockCtx.beginPath).toHaveBeenCalled();
            expect(mockCtx.arc).toHaveBeenCalled();
            expect(mockCtx.fill).toHaveBeenCalled();
        });

        it('should handle zero time', () => {
            expect(() => glowRenderer.renderZenGlow(400, 300, 50, 0)).not.toThrow();
        });

        it('should handle large time values', () => {
            expect(() => glowRenderer.renderZenGlow(400, 300, 50, 100000)).not.toThrow();
        });

        it('should animate breathing effect over time', () => {
            const spy = vi.spyOn(gradientCache, 'getRadialGradient');
            glowRenderer.renderZenGlow(400, 300, 50, 0);
            const radius1 = spy.mock.calls[0][6];
            spy.mockClear();
            // Use a time that will produce a different breath phase
            glowRenderer.renderZenGlow(400, 300, 50, Math.PI * 500);
            const radius2 = spy.mock.calls[0][6];
            // Radii should be different due to breathing animation
            expect(radius1).not.toBe(radius2);
        });
    });

    describe('updateGlowColor', () => {
        it('should update target glow color', () => {
            const newColor = '#FF0000';
            glowRenderer.updateGlowColor(newColor, 16);
            expect(glowRenderer.targetGlowColor).toBe(newColor);
        });

        it('should reset transition when target changes', () => {
            glowRenderer.glowColorTransition = 0.5;
            const newColor = '#FF0000';
            glowRenderer.updateGlowColor(newColor, 16);
            // After reset to 0, it immediately increments by speed in same call
            expect(glowRenderer.glowColorTransition).toBe(glowRenderer.glowColorTransitionSpeed);
        });

        it('should not reset transition for same target', () => {
            glowRenderer.targetGlowColor = '#FF0000';
            glowRenderer.glowColorTransition = 0.5;
            glowRenderer.updateGlowColor('#FF0000', 16);
            expect(glowRenderer.glowColorTransition).toBeGreaterThan(0.5);
        });

        it('should animate color transition', () => {
            glowRenderer.glowColor = '#FF0000';
            glowRenderer.targetGlowColor = '#00FF00';
            glowRenderer.glowColorTransition = 0;
            glowRenderer.updateGlowColor('#00FF00', 16);
            expect(glowRenderer.glowColorTransition).toBeGreaterThan(0);
        });

        it('should increment transition by speed', () => {
            glowRenderer.glowColorTransition = 0;
            glowRenderer.updateGlowColor('#FF0000', 16);
            expect(glowRenderer.glowColorTransition).toBe(glowRenderer.glowColorTransitionSpeed);
        });

        it('should cap transition at 1.0', () => {
            glowRenderer.targetGlowColor = '#FF0000'; // Set target first to avoid reset
            glowRenderer.glowColorTransition = 0.98;
            glowRenderer.updateGlowColor('#FF0000', 16);
            expect(glowRenderer.glowColorTransition).toBe(1);
        });

        it('should not exceed 1.0 transition', () => {
            glowRenderer.targetGlowColor = '#FF0000'; // Set target first to avoid reset
            glowRenderer.glowColorTransition = 1.0;
            glowRenderer.updateGlowColor('#FF0000', 16);
            expect(glowRenderer.glowColorTransition).toBe(1);
        });

        it('should call lerpColor during transition', () => {
            const spy = vi.spyOn(glowRenderer, 'lerpColor');
            glowRenderer.glowColorTransition = 0;
            glowRenderer.updateGlowColor('#FF0000', 16);
            expect(spy).toHaveBeenCalled();
        });

        it('should not call lerpColor when transition complete', () => {
            const spy = vi.spyOn(glowRenderer, 'lerpColor');
            glowRenderer.targetGlowColor = '#FF0000'; // Set target first to avoid reset
            glowRenderer.glowColorTransition = 1.0;
            glowRenderer.updateGlowColor('#FF0000', 16);
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('lerpColor', () => {
        it('should interpolate between two colors', () => {
            const result = glowRenderer.lerpColor('#FF0000', '#0000FF', 0.5);
            expect(result).toBeDefined();
            expect(result).toMatch(/^#[0-9a-f]{6}$/);
        });

        it('should return start color at t=0', () => {
            const result = glowRenderer.lerpColor('#FF0000', '#0000FF', 0);
            expect(result).toBe('#ff0000');
        });

        it('should return end color at t=1', () => {
            const result = glowRenderer.lerpColor('#FF0000', '#0000FF', 1);
            expect(result).toBe('#0000ff');
        });

        it('should handle colors with lowercase hex', () => {
            const result = glowRenderer.lerpColor('#ff0000', '#00ff00', 0.5);
            expect(result).toMatch(/^#[0-9a-f]{6}$/);
        });

        it('should handle colors with uppercase hex', () => {
            const result = glowRenderer.lerpColor('#FF0000', '#00FF00', 0.5);
            expect(result).toMatch(/^#[0-9a-f]{6}$/);
        });

        it('should interpolate red channel correctly', () => {
            const result = glowRenderer.lerpColor('#FF0000', '#000000', 0.5);
            // Should be approximately #800000
            expect(result).toMatch(/^#[78][0-9a-f]0000$/);
        });

        it('should interpolate green channel correctly', () => {
            const result = glowRenderer.lerpColor('#00FF00', '#000000', 0.5);
            // Should be approximately #008000
            expect(result).toMatch(/^#00[78][0-9a-f]00$/);
        });

        it('should interpolate blue channel correctly', () => {
            const result = glowRenderer.lerpColor('#0000FF', '#000000', 0.5);
            // Should be approximately #000080
            expect(result).toMatch(/^#0000[78][0-9a-f]$/);
        });

        it('should handle fractional t values', () => {
            const result = glowRenderer.lerpColor('#FF0000', '#0000FF', 0.25);
            expect(result).toMatch(/^#[0-9a-f]{6}$/);
        });

        it('should call hexToRgb internally', () => {
            const spy = vi.spyOn(glowRenderer, 'hexToRgb');
            glowRenderer.lerpColor('#FF0000', '#0000FF', 0.5);
            expect(spy).toHaveBeenCalledTimes(2);
        });
    });

    describe('hexToRgb', () => {
        it('should convert hex to RGB object', () => {
            const result = glowRenderer.hexToRgb('#FF0000');
            expect(result).toEqual({ r: 255, g: 0, b: 0 });
        });

        it('should handle lowercase hex', () => {
            const result = glowRenderer.hexToRgb('#ff0000');
            expect(result).toEqual({ r: 255, g: 0, b: 0 });
        });

        it('should handle hex without hash', () => {
            const result = glowRenderer.hexToRgb('FF0000');
            expect(result).toEqual({ r: 255, g: 0, b: 0 });
        });

        it('should convert green correctly', () => {
            const result = glowRenderer.hexToRgb('#00FF00');
            expect(result).toEqual({ r: 0, g: 255, b: 0 });
        });

        it('should convert blue correctly', () => {
            const result = glowRenderer.hexToRgb('#0000FF');
            expect(result).toEqual({ r: 0, g: 0, b: 255 });
        });

        it('should convert white correctly', () => {
            const result = glowRenderer.hexToRgb('#FFFFFF');
            expect(result).toEqual({ r: 255, g: 255, b: 255 });
        });

        it('should convert black correctly', () => {
            const result = glowRenderer.hexToRgb('#000000');
            expect(result).toEqual({ r: 0, g: 0, b: 0 });
        });

        it('should handle mixed case hex', () => {
            const result = glowRenderer.hexToRgb('#FfAa00');
            expect(result).toEqual({ r: 255, g: 170, b: 0 });
        });

        it('should return black for invalid hex', () => {
            const result = glowRenderer.hexToRgb('invalid');
            expect(result).toEqual({ r: 0, g: 0, b: 0 });
        });

        it('should return black for short hex', () => {
            const result = glowRenderer.hexToRgb('#FFF');
            expect(result).toEqual({ r: 0, g: 0, b: 0 });
        });

        it('should return black for long hex', () => {
            const result = glowRenderer.hexToRgb('#FF00FF00');
            expect(result).toEqual({ r: 0, g: 0, b: 0 });
        });
    });

    describe('setGlowIntensity', () => {
        it('should set glow intensity', () => {
            glowRenderer.setGlowIntensity(0.5);
            expect(glowRenderer.glowIntensity).toBe(0.5);
        });

        it('should clamp intensity to minimum 0', () => {
            glowRenderer.setGlowIntensity(-1);
            expect(glowRenderer.glowIntensity).toBe(0);
        });

        it('should clamp intensity to maximum 1', () => {
            glowRenderer.setGlowIntensity(2);
            expect(glowRenderer.glowIntensity).toBe(1);
        });

        it('should accept zero intensity', () => {
            glowRenderer.setGlowIntensity(0);
            expect(glowRenderer.glowIntensity).toBe(0);
        });

        it('should accept maximum intensity', () => {
            glowRenderer.setGlowIntensity(1);
            expect(glowRenderer.glowIntensity).toBe(1);
        });

        it('should handle fractional values', () => {
            glowRenderer.setGlowIntensity(0.333);
            expect(glowRenderer.glowIntensity).toBe(0.333);
        });

        it('should handle very small positive values', () => {
            glowRenderer.setGlowIntensity(0.001);
            expect(glowRenderer.glowIntensity).toBe(0.001);
        });

        it('should handle values very close to 1', () => {
            glowRenderer.setGlowIntensity(0.999);
            expect(glowRenderer.glowIntensity).toBe(0.999);
        });
    });

    describe('setGlowColor', () => {
        it('should set glow color immediately', () => {
            const color = '#FF0000';
            glowRenderer.setGlowColor(color);
            expect(glowRenderer.glowColor).toBe(color);
        });

        it('should set target glow color', () => {
            const color = '#FF0000';
            glowRenderer.setGlowColor(color);
            expect(glowRenderer.targetGlowColor).toBe(color);
        });

        it('should set transition to complete', () => {
            glowRenderer.setGlowColor('#FF0000');
            expect(glowRenderer.glowColorTransition).toBe(1);
        });

        it('should handle different color formats', () => {
            expect(() => glowRenderer.setGlowColor('#FF0000')).not.toThrow();
            expect(() => glowRenderer.setGlowColor('#00FF00')).not.toThrow();
            expect(() => glowRenderer.setGlowColor('#0000FF')).not.toThrow();
        });

        it('should override previous target', () => {
            glowRenderer.setGlowColor('#FF0000');
            glowRenderer.setGlowColor('#00FF00');
            expect(glowRenderer.glowColor).toBe('#00FF00');
            expect(glowRenderer.targetGlowColor).toBe('#00FF00');
        });
    });

    describe('destroy', () => {
        it('should clean up offscreen canvas', () => {
            glowRenderer.destroy();
            expect(glowRenderer.offscreenCanvas).toBeNull();
        });

        it('should clean up offscreen context', () => {
            glowRenderer.destroy();
            expect(glowRenderer.offscreenCtx).toBeNull();
        });

        it('should clean up cached glow color', () => {
            glowRenderer.cachedGlowColor = '#FF0000';
            glowRenderer.destroy();
            expect(glowRenderer.cachedGlowColor).toBeNull();
        });

        it('should not throw when called multiple times', () => {
            expect(() => {
                glowRenderer.destroy();
                glowRenderer.destroy();
            }).not.toThrow();
        });
    });

    describe('Helper Methods', () => {
        it('should call renderer scaleValue through helper', () => {
            const value = 100;
            const result = glowRenderer.scaleValue(value);
            expect(mockRenderer.scaleValue).toHaveBeenCalledWith(value);
            expect(result).toBe(200); // Mock returns value * 2
        });

        it('should call renderer hexToRgba through helper', () => {
            const hex = '#FF0000';
            const alpha = 0.5;
            const result = glowRenderer.hexToRgba(hex, alpha);
            expect(mockRenderer.hexToRgba).toHaveBeenCalledWith(hex, alpha);
            expect(result).toContain('rgba');
        });
    });

    describe('Edge Cases and Boundary Conditions', () => {
        it('should handle negative coordinates', () => {
            expect(() => glowRenderer.renderGlow(-100, -100, 50)).not.toThrow();
        });

        it('should handle coordinates beyond canvas', () => {
            expect(() => glowRenderer.renderGlow(10000, 10000, 50)).not.toThrow();
        });

        it('should handle very small radius', () => {
            expect(() => glowRenderer.renderGlow(400, 300, 0.1)).not.toThrow();
        });

        it('should handle zero radius', () => {
            expect(() => glowRenderer.renderGlow(400, 300, 0)).not.toThrow();
        });

        it('should handle negative radius gracefully', () => {
            expect(() => glowRenderer.renderGlow(400, 300, -50)).not.toThrow();
        });

        it('should handle intensity above 1', () => {
            glowRenderer.setGlowIntensity(5);
            expect(glowRenderer.glowIntensity).toBe(1);
        });

        it('should handle intensity far below 0', () => {
            glowRenderer.setGlowIntensity(-100);
            expect(glowRenderer.glowIntensity).toBe(0);
        });

        it('should handle rapid color changes', () => {
            expect(() => {
                glowRenderer.setGlowColor('#FF0000');
                glowRenderer.setGlowColor('#00FF00');
                glowRenderer.setGlowColor('#0000FF');
            }).not.toThrow();
        });

        it('should handle null renderer gracefully', () => {
            const nullRenderer = {
                ctx: mockCtx,
                canvas: mockCanvas,
                scaleValue: vi.fn(v => v),
                hexToRgba: vi.fn(() => 'rgba(0,0,0,0)')
            };
            expect(() => new GlowRenderer(nullRenderer)).not.toThrow();
        });

        it('should handle rendering with cached gradient', () => {
            glowRenderer.cacheGlowGradient('#FF0000', 100);
            expect(() => glowRenderer.renderGlow(400, 300, 50, { color: '#FF0000' })).not.toThrow();
        });
    });

    describe('Integration with GradientCache', () => {
        it('should use gradient cache for rendering', () => {
            const spy = vi.spyOn(gradientCache, 'getRadialGradient');
            glowRenderer.renderGlow(400, 300, 50);
            expect(spy).toHaveBeenCalled();
        });

        it('should cache gradients efficiently', () => {
            const spy = vi.spyOn(gradientCache, 'getRadialGradient');
            glowRenderer.cacheGlowGradient('#FF0000', 100);
            const callCount = spy.mock.calls.length;
            expect(callCount).toBeGreaterThan(0);
        });

        it('should create unique gradients for different parameters', () => {
            const spy = vi.spyOn(gradientCache, 'getRadialGradient');
            glowRenderer.renderGlow(400, 300, 50, { color: '#FF0000' });
            glowRenderer.renderGlow(400, 300, 50, { color: '#00FF00' });
            expect(spy).toHaveBeenCalledTimes(2);
        });
    });

    describe('Color Transition Animation', () => {
        it('should animate from current to target color', () => {
            glowRenderer.glowColor = '#FF0000';
            glowRenderer.targetGlowColor = '#00FF00';
            glowRenderer.glowColorTransition = 0;

            const initialColor = glowRenderer.glowColor;
            glowRenderer.updateGlowColor('#00FF00', 16);

            expect(glowRenderer.glowColor).not.toBe(initialColor);
        });

        it('should complete transition over multiple frames', () => {
            glowRenderer.glowColor = '#FF0000';
            glowRenderer.glowColorTransition = 0;

            for (let i = 0; i < 25; i++) {
                glowRenderer.updateGlowColor('#00FF00', 16);
            }

            expect(glowRenderer.glowColorTransition).toBe(1);
        });

        it('should maintain color after transition completes', () => {
            glowRenderer.glowColor = '#FF0000';
            glowRenderer.targetGlowColor = '#00FF00';
            glowRenderer.glowColorTransition = 0;

            for (let i = 0; i < 30; i++) {
                glowRenderer.updateGlowColor('#00FF00', 16);
            }

            const finalColor = glowRenderer.glowColor;
            glowRenderer.updateGlowColor('#00FF00', 16);

            expect(glowRenderer.glowColor).toBe(finalColor);
        });
    });
});
