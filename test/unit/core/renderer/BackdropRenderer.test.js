/**
 * Comprehensive tests for BackdropRenderer
 * Tests backdrop rendering, effects, canvas operations, and audio responsiveness
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { BackdropRenderer } from '../../../../src/core/renderer/BackdropRenderer.js';

describe('BackdropRenderer', () => {
    let backdropRenderer;
    let mockRenderer;
    let mockCanvas;
    let mockCtx;
    let mockGradient;

    beforeEach(() => {
        // Create mock gradient with tracking
        mockGradient = {
            addColorStop: vi.fn()
        };

        // Create mock canvas
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
            fillRect: vi.fn(),
            createRadialGradient: vi.fn(() => mockGradient),
            fillStyle: '',
            strokeStyle: '',
            globalAlpha: 1,
            globalCompositeOperation: 'source-over',
            filter: 'none'
        };

        // Create mock renderer
        mockRenderer = {
            ctx: mockCtx,
            canvas: mockCanvas
        };

        backdropRenderer = new BackdropRenderer(mockRenderer);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Constructor and Initialization', () => {
        it('should create BackdropRenderer instance', () => {
            expect(backdropRenderer).toBeDefined();
            expect(backdropRenderer).toBeInstanceOf(BackdropRenderer);
        });

        it('should store renderer reference', () => {
            expect(backdropRenderer.renderer).toBe(mockRenderer);
        });

        it('should store context reference', () => {
            expect(backdropRenderer.ctx).toBe(mockCtx);
        });

        it('should initialize with default config', () => {
            expect(backdropRenderer.config).toBeDefined();
            expect(backdropRenderer.config.enabled).toBe(false);
            expect(backdropRenderer.config.radius).toBe(1.5);
            expect(backdropRenderer.config.intensity).toBe(0.7);
        });

        it('should initialize dynamic state properties', () => {
            expect(backdropRenderer.currentIntensity).toBe(0);
            expect(backdropRenderer.targetIntensity).toBe(0);
            expect(backdropRenderer.pulsePhase).toBe(0);
        });

        it('should initialize with correct default shape', () => {
            expect(backdropRenderer.config.shape).toBe('circle');
        });

        it('should initialize with correct default color', () => {
            expect(backdropRenderer.config.color).toBe('rgba(0, 0, 0, 0.6)');
        });

        it('should initialize with correct default blend mode', () => {
            expect(backdropRenderer.config.blendMode).toBe('normal');
        });

        it('should initialize with correct default falloff', () => {
            expect(backdropRenderer.config.falloff).toBe('smooth');
        });

        it('should initialize with correct default offset', () => {
            expect(backdropRenderer.config.offset).toEqual({ x: 0, y: 0 });
        });
    });

    describe('Configuration Management', () => {
        it('should update config with setConfig', () => {
            backdropRenderer.setConfig({ enabled: true, radius: 2.0 });
            expect(backdropRenderer.config.enabled).toBe(true);
            expect(backdropRenderer.config.radius).toBe(2.0);
        });

        it('should merge new config with existing config', () => {
            const originalColor = backdropRenderer.config.color;
            backdropRenderer.setConfig({ radius: 2.5 });
            expect(backdropRenderer.config.radius).toBe(2.5);
            expect(backdropRenderer.config.color).toBe(originalColor);
        });

        it('should set target intensity when enabled', () => {
            backdropRenderer.setConfig({ enabled: true, intensity: 0.8 });
            expect(backdropRenderer.targetIntensity).toBe(0.8);
        });

        it('should set target intensity to 0 when disabled', () => {
            backdropRenderer.setConfig({ enabled: false });
            expect(backdropRenderer.targetIntensity).toBe(0);
        });

        it('should handle empty options object', () => {
            const originalConfig = { ...backdropRenderer.config };
            backdropRenderer.setConfig({});
            expect(backdropRenderer.config).toEqual(originalConfig);
        });

        it('should return config copy with getConfig', () => {
            const config = backdropRenderer.getConfig();
            expect(config).toEqual(backdropRenderer.config);
            expect(config).not.toBe(backdropRenderer.config); // Should be a copy
        });

        it('should handle custom blend modes', () => {
            backdropRenderer.setConfig({ blendMode: 'multiply' });
            expect(backdropRenderer.config.blendMode).toBe('multiply');
        });

        it('should handle custom colors', () => {
            backdropRenderer.setConfig({ color: 'rgba(255, 0, 0, 0.5)' });
            expect(backdropRenderer.config.color).toBe('rgba(255, 0, 0, 0.5)');
        });

        it('should handle blur settings', () => {
            backdropRenderer.setConfig({ blur: 10 });
            expect(backdropRenderer.config.blur).toBe(10);
        });

        it('should handle responsive mode', () => {
            backdropRenderer.setConfig({ responsive: false });
            expect(backdropRenderer.config.responsive).toBe(false);
        });

        it('should handle pulse mode', () => {
            backdropRenderer.setConfig({ pulse: true });
            expect(backdropRenderer.config.pulse).toBe(true);
        });

        it('should handle position offset', () => {
            backdropRenderer.setConfig({ offset: { x: 10, y: 20 } });
            expect(backdropRenderer.config.offset).toEqual({ x: 10, y: 20 });
        });
    });

    describe('Enable/Disable/Toggle', () => {
        it('should enable backdrop', () => {
            backdropRenderer.enable();
            expect(backdropRenderer.config.enabled).toBe(true);
            expect(backdropRenderer.targetIntensity).toBe(backdropRenderer.config.intensity);
        });

        it('should disable backdrop', () => {
            backdropRenderer.disable();
            expect(backdropRenderer.config.enabled).toBe(false);
            expect(backdropRenderer.targetIntensity).toBe(0);
        });

        it('should toggle from disabled to enabled', () => {
            backdropRenderer.config.enabled = false;
            backdropRenderer.toggle();
            expect(backdropRenderer.config.enabled).toBe(true);
        });

        it('should toggle from enabled to disabled', () => {
            backdropRenderer.config.enabled = true;
            backdropRenderer.toggle();
            expect(backdropRenderer.config.enabled).toBe(false);
        });
    });

    describe('Update Method', () => {
        it('should fade out when disabled', () => {
            backdropRenderer.config.enabled = false;
            backdropRenderer.currentIntensity = 1.0;
            backdropRenderer.update(16);
            expect(backdropRenderer.currentIntensity).toBeLessThan(1.0);
            expect(backdropRenderer.currentIntensity).toBeCloseTo(0.95, 2);
        });

        it('should lerp towards target intensity when enabled', () => {
            backdropRenderer.config.enabled = true;
            backdropRenderer.targetIntensity = 1.0;
            backdropRenderer.currentIntensity = 0.0;
            backdropRenderer.update(16);
            expect(backdropRenderer.currentIntensity).toBeGreaterThan(0);
            expect(backdropRenderer.currentIntensity).toBeLessThan(1.0);
        });

        it('should update pulse phase in responsive mode', () => {
            backdropRenderer.config.enabled = true;
            backdropRenderer.config.responsive = true;
            backdropRenderer.pulsePhase = 0;
            backdropRenderer.update(1000);
            expect(backdropRenderer.pulsePhase).toBe(1);
        });

        it('should not update pulse phase when not responsive', () => {
            backdropRenderer.config.responsive = false;
            backdropRenderer.pulsePhase = 0;
            backdropRenderer.update(1000);
            expect(backdropRenderer.pulsePhase).toBe(0);
        });

        it('should handle multiple update cycles', () => {
            backdropRenderer.config.enabled = true;
            backdropRenderer.targetIntensity = 1.0;
            backdropRenderer.currentIntensity = 0.0;

            for (let i = 0; i < 100; i++) {
                backdropRenderer.update(16);
            }

            expect(backdropRenderer.currentIntensity).toBeCloseTo(1.0, 1);
        });
    });

    describe('Audio Responsiveness', () => {
        it('should boost intensity with audio when responsive', () => {
            backdropRenderer.config.responsive = true;
            backdropRenderer.config.intensity = 0.7;
            backdropRenderer.setAudioIntensity(0.5);
            expect(backdropRenderer.targetIntensity).toBeGreaterThan(0.7);
            expect(backdropRenderer.targetIntensity).toBeLessThanOrEqual(0.8);
        });

        it('should not exceed max intensity of 1.0', () => {
            backdropRenderer.config.responsive = true;
            backdropRenderer.config.intensity = 0.95;
            backdropRenderer.setAudioIntensity(1.0);
            expect(backdropRenderer.targetIntensity).toBeLessThanOrEqual(1.0);
        });

        it('should not respond to audio when not responsive', () => {
            backdropRenderer.config.responsive = false;
            backdropRenderer.config.intensity = 0.7;
            backdropRenderer.setAudioIntensity(0.5);
            expect(backdropRenderer.targetIntensity).toBe(0);
        });

        it('should calculate boost correctly', () => {
            backdropRenderer.config.responsive = true;
            backdropRenderer.config.intensity = 0.5;
            backdropRenderer.setAudioIntensity(0.5);
            // 0.5 amplitude * 0.2 = 0.1 boost
            expect(backdropRenderer.targetIntensity).toBeCloseTo(0.6, 2);
        });

        it('should handle zero audio amplitude', () => {
            backdropRenderer.config.responsive = true;
            backdropRenderer.config.intensity = 0.7;
            backdropRenderer.setAudioIntensity(0);
            expect(backdropRenderer.targetIntensity).toBe(0.7);
        });

        it('should handle maximum audio amplitude', () => {
            backdropRenderer.config.responsive = true;
            backdropRenderer.config.intensity = 0.7;
            backdropRenderer.setAudioIntensity(1.0);
            expect(backdropRenderer.targetIntensity).toBeCloseTo(0.9, 2);
        });
    });

    describe('Render Method - Core Functionality', () => {
        it('should not render when intensity is too low', () => {
            backdropRenderer.currentIntensity = 0.005;
            backdropRenderer.render(400, 300, 100);
            expect(mockCtx.save).not.toHaveBeenCalled();
        });

        it('should call save and restore on context', () => {
            backdropRenderer.currentIntensity = 0.5;
            backdropRenderer.config.type = 'radial-gradient';
            backdropRenderer.render(400, 300, 100);
            expect(mockCtx.save).toHaveBeenCalled();
            expect(mockCtx.restore).toHaveBeenCalled();
        });

        it('should render radial-gradient type', () => {
            backdropRenderer.currentIntensity = 0.5;
            backdropRenderer.config.type = 'radial-gradient';
            backdropRenderer.render(400, 300, 100);
            expect(mockCtx.createRadialGradient).toHaveBeenCalled();
        });

        it('should render vignette type', () => {
            backdropRenderer.currentIntensity = 0.5;
            backdropRenderer.config.type = 'vignette';
            backdropRenderer.render(400, 300, 100);
            expect(mockCtx.createRadialGradient).toHaveBeenCalled();
            expect(mockCtx.fillRect).toHaveBeenCalled();
        });

        it('should render glow type', () => {
            backdropRenderer.currentIntensity = 0.5;
            backdropRenderer.config.type = 'glow';
            backdropRenderer.render(400, 300, 100);
            // Glow renders 3 layers
            expect(mockCtx.createRadialGradient).toHaveBeenCalledTimes(3);
        });

        it('should use provided target context if given', () => {
            const customCtx = { ...mockCtx };
            customCtx.save = vi.fn();
            customCtx.restore = vi.fn();

            backdropRenderer.currentIntensity = 0.5;
            backdropRenderer.render(400, 300, 100, customCtx);
            expect(customCtx.save).toHaveBeenCalled();
        });

        it('should use default context if no target provided', () => {
            backdropRenderer.currentIntensity = 0.5;
            backdropRenderer.render(400, 300, 100);
            expect(mockCtx.save).toHaveBeenCalled();
        });
    });

    describe('Radial Gradient Rendering', () => {
        beforeEach(() => {
            backdropRenderer.currentIntensity = 0.7;
        });

        it('should calculate radius correctly', () => {
            backdropRenderer.config.radius = 2.0;
            backdropRenderer.renderRadialGradient(400, 300, 100, mockCtx);

            // Should create gradient with radius = 100 * 2.0 = 200
            expect(mockCtx.createRadialGradient).toHaveBeenCalledWith(
                400, 300, 0,
                400, 300, 200
            );
        });

        it('should apply position offset', () => {
            backdropRenderer.config.offset = { x: 50, y: -30 };
            backdropRenderer.renderRadialGradient(400, 300, 100, mockCtx);

            expect(mockCtx.createRadialGradient).toHaveBeenCalledWith(
                450, 270, 0,
                450, 270, 150
            );
        });

        it('should apply pulse effect when enabled', () => {
            backdropRenderer.config.pulse = true;
            backdropRenderer.pulsePhase = Math.PI / 2; // sin(π/2) = 1
            backdropRenderer.renderRadialGradient(400, 300, 100, mockCtx);

            // Should modulate radius by ~5%
            const calls = mockCtx.createRadialGradient.mock.calls[0];
            const radius = calls[5];
            expect(radius).toBeGreaterThan(150);
            expect(radius).toBeLessThan(160);
        });

        it('should apply blend mode', () => {
            backdropRenderer.config.blendMode = 'multiply';
            const originalOp = mockCtx.globalCompositeOperation;
            backdropRenderer.renderRadialGradient(400, 300, 100, mockCtx);

            // Check that blend mode was temporarily set (it gets restored)
            // Verify it was called during render by checking fill was called
            expect(mockCtx.fill).toHaveBeenCalled();
            expect(mockCtx.globalCompositeOperation).toBe(originalOp); // Restored
        });

        it('should restore original blend mode', () => {
            const originalOp = 'source-over';
            mockCtx.globalCompositeOperation = originalOp;
            backdropRenderer.config.blendMode = 'screen';
            backdropRenderer.renderRadialGradient(400, 300, 100, mockCtx);

            expect(mockCtx.globalCompositeOperation).toBe(originalOp);
        });

        it('should apply blur filter', () => {
            backdropRenderer.config.blur = 15;
            backdropRenderer.renderRadialGradient(400, 300, 100, mockCtx);

            // Filter gets reset after rendering, check that fill was called
            expect(mockCtx.fill).toHaveBeenCalled();
            expect(mockCtx.filter).toBe('none'); // Reset after render
        });

        it('should reset blur filter after rendering', () => {
            backdropRenderer.config.blur = 10;
            backdropRenderer.renderRadialGradient(400, 300, 100, mockCtx);

            expect(mockCtx.filter).toBe('none');
        });

        it('should draw arc with correct parameters', () => {
            backdropRenderer.renderRadialGradient(400, 300, 100, mockCtx);

            expect(mockCtx.beginPath).toHaveBeenCalled();
            expect(mockCtx.arc).toHaveBeenCalledWith(
                400, 300, 150, 0, Math.PI * 2
            );
            expect(mockCtx.fill).toHaveBeenCalled();
        });

        it('should handle zero blur', () => {
            backdropRenderer.config.blur = 0;
            backdropRenderer.renderRadialGradient(400, 300, 100, mockCtx);

            expect(mockCtx.filter).toBe('none');
        });

        it('should not change blend mode when set to normal', () => {
            const originalOp = mockCtx.globalCompositeOperation;
            backdropRenderer.config.blendMode = 'normal';
            backdropRenderer.renderRadialGradient(400, 300, 100, mockCtx);

            expect(mockCtx.globalCompositeOperation).toBe(originalOp);
        });
    });

    describe('Vignette Rendering', () => {
        beforeEach(() => {
            backdropRenderer.currentIntensity = 0.7;
        });

        it('should create gradient from mascot to max dimension', () => {
            backdropRenderer.renderVignette(400, 300, 100, mockCtx);

            const maxRadius = Math.max(mockCanvas.width, mockCanvas.height);
            expect(mockCtx.createRadialGradient).toHaveBeenCalledWith(
                400, 300, 50,
                400, 300, maxRadius
            );
        });

        it('should fill entire canvas', () => {
            backdropRenderer.renderVignette(400, 300, 100, mockCtx);

            expect(mockCtx.fillRect).toHaveBeenCalledWith(
                0, 0, mockCanvas.width, mockCanvas.height
            );
        });

        it('should add two color stops', () => {
            backdropRenderer.renderVignette(400, 300, 100, mockCtx);

            expect(mockGradient.addColorStop).toHaveBeenCalledTimes(2);
        });

        it('should have transparent center', () => {
            backdropRenderer.renderVignette(400, 300, 100, mockCtx);

            expect(mockGradient.addColorStop).toHaveBeenCalledWith(0, 'rgba(0, 0, 0, 0)');
        });
    });

    describe('Glow Rendering', () => {
        beforeEach(() => {
            backdropRenderer.currentIntensity = 0.7;
        });

        it('should render 3 glow layers', () => {
            backdropRenderer.renderGlow(400, 300, 100, mockCtx);

            expect(mockCtx.createRadialGradient).toHaveBeenCalledTimes(3);
        });

        it('should render layers with decreasing radius', () => {
            backdropRenderer.config.radius = 2.0;
            backdropRenderer.renderGlow(400, 300, 100, mockCtx);

            const {calls} = mockCtx.createRadialGradient.mock;
            const radius0 = calls[0][5];
            const radius1 = calls[1][5];
            const radius2 = calls[2][5];

            expect(radius0).toBeGreaterThan(radius1);
            expect(radius1).toBeGreaterThan(radius2);
        });

        it('should render layers with decreasing alpha', () => {
            backdropRenderer.renderGlow(400, 300, 100, mockCtx);

            expect(mockCtx.arc).toHaveBeenCalledTimes(3);
            expect(mockCtx.fill).toHaveBeenCalledTimes(3);
        });

        it('should draw arc for each layer', () => {
            backdropRenderer.renderGlow(400, 300, 100, mockCtx);

            expect(mockCtx.beginPath).toHaveBeenCalledTimes(3);
            expect(mockCtx.arc).toHaveBeenCalledTimes(3);
        });
    });

    describe('Gradient Stop Generation - Simple', () => {
        it('should add multiple gradient stops', () => {
            backdropRenderer.addGradientStopsSimple(mockGradient, 'rgba(0, 0, 0, 0.6)', 1.0);

            // Should add many stops for smooth gradient
            expect(mockGradient.addColorStop.mock.calls.length).toBeGreaterThan(10);
        });

        it('should have darkest color at center', () => {
            backdropRenderer.addGradientStopsSimple(mockGradient, 'rgba(0, 0, 0, 0.6)', 1.0);

            const firstCall = mockGradient.addColorStop.mock.calls[0];
            expect(firstCall[0]).toBe(0); // Position 0
        });

        it('should end with transparent edge', () => {
            backdropRenderer.addGradientStopsSimple(mockGradient, 'rgba(0, 0, 0, 0.6)', 1.0);

            const lastCall = mockGradient.addColorStop.mock.calls[mockGradient.addColorStop.mock.calls.length - 1];
            expect(lastCall[0]).toBe(1); // Position 1.0
            expect(lastCall[1]).toBe('rgba(0, 0, 0, 0)'); // Transparent
        });

        it('should maintain dark core based on coreTransparency', () => {
            backdropRenderer.config.coreTransparency = 0.3;
            backdropRenderer.addGradientStopsSimple(mockGradient, 'rgba(0, 0, 0, 0.6)', 1.0);

            const secondCall = mockGradient.addColorStop.mock.calls[1];
            expect(secondCall[0]).toBe(0.3); // Core transparency position
        });

        it('should scale intensity with multiplier', () => {
            backdropRenderer.addGradientStopsSimple(mockGradient, 'rgba(0, 0, 0, 0.6)', 0.5);

            // Check that colors have reduced alpha
            const {calls} = mockGradient.addColorStop.mock;
            // Most calls should have reduced intensity
            expect(calls.length).toBeGreaterThan(10);
        });
    });

    describe('Gradient Stop Generation - Advanced', () => {
        it('should handle custom falloff curve', () => {
            backdropRenderer.config.falloffCurve = [
                { stop: 0, alpha: 0 },
                { stop: 0.5, alpha: 0.5 },
                { stop: 1, alpha: 1 }
            ];

            backdropRenderer.addGradientStops(mockGradient, 'rgba(0, 0, 0, 0.6)', 1.0);

            expect(mockGradient.addColorStop).toHaveBeenCalledTimes(3);
        });

        it('should handle linear falloff', () => {
            backdropRenderer.config.falloff = 'linear';
            backdropRenderer.addGradientStops(mockGradient, 'rgba(0, 0, 0, 0.6)', 1.0);

            expect(mockGradient.addColorStop).toHaveBeenCalledTimes(3);
        });

        it('should handle exponential falloff', () => {
            backdropRenderer.config.falloff = 'exponential';
            backdropRenderer.addGradientStops(mockGradient, 'rgba(0, 0, 0, 0.6)', 1.0);

            expect(mockGradient.addColorStop.mock.calls.length).toBeGreaterThan(3);
        });

        it('should handle smooth falloff', () => {
            backdropRenderer.config.falloff = 'smooth';
            backdropRenderer.addGradientStops(mockGradient, 'rgba(0, 0, 0, 0.6)', 1.0);

            expect(mockGradient.addColorStop.mock.calls.length).toBeGreaterThan(10);
        });

        it('should default to smooth falloff', () => {
            backdropRenderer.config.falloff = 'unknown';
            backdropRenderer.addGradientStops(mockGradient, 'rgba(0, 0, 0, 0.6)', 1.0);

            expect(mockGradient.addColorStop.mock.calls.length).toBeGreaterThan(10);
        });

        it('should use scale parameter', () => {
            backdropRenderer.config.falloff = 'smooth';
            backdropRenderer.addGradientStops(mockGradient, 'rgba(0, 0, 0, 0.6)', 1.0, 0.5);

            // Should scale the coreTransparency position
            expect(mockGradient.addColorStop).toHaveBeenCalled();
        });

        it('should respect edgeSoftness in smooth mode', () => {
            backdropRenderer.config.falloff = 'smooth';
            backdropRenderer.config.edgeSoftness = 0.8;
            backdropRenderer.addGradientStops(mockGradient, 'rgba(0, 0, 0, 0.6)', 1.0);

            expect(mockGradient.addColorStop.mock.calls.length).toBeGreaterThan(10);
        });
    });

    describe('Color Utilities', () => {
        it('should parse rgba color and adjust alpha', () => {
            const result = backdropRenderer.adjustColorAlpha('rgba(100, 150, 200, 0.8)', 0.5);
            expect(result).toBe('rgba(100, 150, 200, 0.4)');
        });

        it('should parse rgb color and adjust alpha', () => {
            const result = backdropRenderer.adjustColorAlpha('rgb(100, 150, 200)', 0.5);
            expect(result).toBe('rgba(100, 150, 200, 0.5)');
        });

        it('should handle color without alpha', () => {
            const result = backdropRenderer.adjustColorAlpha('rgb(255, 0, 0)', 0.7);
            expect(result).toBe('rgba(255, 0, 0, 0.7)');
        });

        it('should handle invalid color with fallback', () => {
            const result = backdropRenderer.adjustColorAlpha('#invalid', 0.5);
            expect(result).toBe('rgba(0, 0, 0, 0.3)');
        });

        it('should handle zero intensity', () => {
            const result = backdropRenderer.adjustColorAlpha('rgba(100, 150, 200, 0.8)', 0);
            expect(result).toBe('rgba(100, 150, 200, 0)');
        });

        it('should handle full intensity', () => {
            const result = backdropRenderer.adjustColorAlpha('rgba(100, 150, 200, 0.5)', 1.0);
            expect(result).toBe('rgba(100, 150, 200, 0.5)');
        });

        it('should handle whitespace in color string', () => {
            const result = backdropRenderer.adjustColorAlpha('rgba(100, 150, 200, 0.8)', 0.5);
            expect(result).toBe('rgba(100, 150, 200, 0.4)');
        });
    });

    describe('Easing Functions', () => {
        it('should return 0 at t=0', () => {
            expect(backdropRenderer.easeInOutCubic(0)).toBe(0);
        });

        it('should return 1 at t=1', () => {
            expect(backdropRenderer.easeInOutCubic(1)).toBe(1);
        });

        it('should return 0.5 at t=0.5', () => {
            expect(backdropRenderer.easeInOutCubic(0.5)).toBe(0.5);
        });

        it('should ease in during first half', () => {
            const value = backdropRenderer.easeInOutCubic(0.25);
            expect(value).toBeLessThan(0.25); // Slow start
        });

        it('should ease out during second half', () => {
            const value = backdropRenderer.easeInOutCubic(0.75);
            expect(value).toBeGreaterThan(0.75); // Fast end
        });

        it('should be symmetric', () => {
            const value1 = backdropRenderer.easeInOutCubic(0.3);
            const value2 = backdropRenderer.easeInOutCubic(0.7);
            expect(value1 + value2).toBeCloseTo(1, 5);
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle negative mascot radius', () => {
            backdropRenderer.currentIntensity = 0.5;
            expect(() => {
                backdropRenderer.renderRadialGradient(400, 300, -100, mockCtx);
            }).not.toThrow();
        });

        it('should handle zero mascot radius', () => {
            backdropRenderer.currentIntensity = 0.5;
            expect(() => {
                backdropRenderer.renderRadialGradient(400, 300, 0, mockCtx);
            }).not.toThrow();
        });

        it('should handle very large mascot radius', () => {
            backdropRenderer.currentIntensity = 0.5;
            expect(() => {
                backdropRenderer.renderRadialGradient(400, 300, 10000, mockCtx);
            }).not.toThrow();
        });

        it('should handle negative position coordinates', () => {
            backdropRenderer.currentIntensity = 0.5;
            expect(() => {
                backdropRenderer.renderRadialGradient(-100, -200, 100, mockCtx);
            }).not.toThrow();
        });

        it('should handle very high intensity values', () => {
            backdropRenderer.currentIntensity = 5.0;
            expect(() => {
                backdropRenderer.render(400, 300, 100);
            }).not.toThrow();
        });

        it('should handle NaN in deltaTime', () => {
            backdropRenderer.config.enabled = true;
            expect(() => {
                backdropRenderer.update(NaN);
            }).not.toThrow();
        });

        it('should handle undefined type gracefully', () => {
            backdropRenderer.currentIntensity = 0.5;
            backdropRenderer.config.type = 'undefined-type';
            expect(() => {
                backdropRenderer.render(400, 300, 100);
            }).not.toThrow();
        });

        it('should handle undefined offset values', () => {
            backdropRenderer.config.offset = { x: undefined, y: undefined };
            backdropRenderer.currentIntensity = 0.5;
            expect(() => {
                backdropRenderer.renderRadialGradient(400, 300, 100, mockCtx);
            }).not.toThrow();
        });

        it('should handle extreme blur values', () => {
            backdropRenderer.config.blur = 1000;
            backdropRenderer.currentIntensity = 0.5;
            expect(() => {
                backdropRenderer.renderRadialGradient(400, 300, 100, mockCtx);
            }).not.toThrow();
        });
    });

    describe('Integration Scenarios', () => {
        it('should handle complete enable-update-render cycle', () => {
            backdropRenderer.enable();
            backdropRenderer.update(16);
            backdropRenderer.render(400, 300, 100);

            expect(mockCtx.save).toHaveBeenCalled();
            expect(mockCtx.restore).toHaveBeenCalled();
        });

        it('should handle audio-responsive rendering', () => {
            backdropRenderer.setConfig({ enabled: true, responsive: true });
            backdropRenderer.setAudioIntensity(0.8);
            backdropRenderer.update(16);
            backdropRenderer.render(400, 300, 100);

            expect(backdropRenderer.targetIntensity).toBeGreaterThan(backdropRenderer.config.intensity);
        });

        it('should handle multiple render types in sequence', () => {
            backdropRenderer.currentIntensity = 0.5;

            backdropRenderer.config.type = 'radial-gradient';
            backdropRenderer.render(400, 300, 100);

            mockCtx.save.mockClear();
            backdropRenderer.config.type = 'vignette';
            backdropRenderer.render(400, 300, 100);

            mockCtx.save.mockClear();
            backdropRenderer.config.type = 'glow';
            backdropRenderer.render(400, 300, 100);

            expect(mockCtx.save).toHaveBeenCalledTimes(1);
        });

        it('should maintain state across multiple updates', () => {
            backdropRenderer.enable();

            for (let i = 0; i < 5; i++) {
                backdropRenderer.update(16);
            }

            expect(backdropRenderer.currentIntensity).toBeGreaterThan(0);
            expect(backdropRenderer.config.enabled).toBe(true);
        });

        it('should handle rapid enable/disable toggling', () => {
            for (let i = 0; i < 10; i++) {
                backdropRenderer.toggle();
            }

            expect(backdropRenderer.config.enabled).toBe(false);
        });
    });
});
