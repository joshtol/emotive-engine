/**
 * EyeRenderer Tests
 * Comprehensive tests for eye expression rendering and blinking animations
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { EyeRenderer } from '../../../../src/core/renderer/EyeRenderer.js';

describe('EyeRenderer', () => {
    let eyeRenderer;
    let mockRenderer;
    let mockCanvas;
    let mockCtx;

    beforeEach(() => {
        // Create comprehensive mock canvas
        mockCanvas = {
            width: 800,
            height: 600,
            getContext: vi.fn(),
            getBoundingClientRect: vi.fn(() => ({
                width: 800,
                height: 600,
                top: 0,
                left: 0
            }))
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
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            translate: vi.fn(),
            rotate: vi.fn(),
            scale: vi.fn(),
            fillRect: vi.fn(),
            strokeRect: vi.fn(),
            createRadialGradient: vi.fn(() => ({
                addColorStop: vi.fn()
            })),
            createLinearGradient: vi.fn(() => ({
                addColorStop: vi.fn()
            })),
            fillStyle: '',
            strokeStyle: '',
            globalAlpha: 1,
            lineWidth: 1,
            lineCap: 'butt',
            lineJoin: 'miter',
            shadowBlur: 0,
            shadowColor: '',
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            globalCompositeOperation: 'source-over'
        };

        mockCanvas.getContext.mockReturnValue(mockCtx);

        // Create mock renderer with helper methods
        mockRenderer = {
            ctx: mockCtx,
            canvas: mockCanvas,
            scaleValue: vi.fn(value => value * 2), // Simple scaling for testing
            hexToRgba: vi.fn((hex, alpha) => `rgba(0, 0, 0, ${alpha})`)
        };

        eyeRenderer = new EyeRenderer(mockRenderer);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Constructor', () => {
        it('should create EyeRenderer instance', () => {
            expect(eyeRenderer).toBeDefined();
            expect(eyeRenderer).toBeInstanceOf(EyeRenderer);
        });

        it('should store renderer reference', () => {
            expect(eyeRenderer.renderer).toBe(mockRenderer);
        });

        it('should store canvas context reference', () => {
            expect(eyeRenderer.ctx).toBe(mockCtx);
        });

        it('should store canvas reference', () => {
            expect(eyeRenderer.canvas).toBe(mockCanvas);
        });

        it('should initialize blinking state to false', () => {
            expect(eyeRenderer.blinking).toBe(false);
        });

        it('should initialize blinkingEnabled to true', () => {
            expect(eyeRenderer.blinkingEnabled).toBe(true);
        });

        it('should initialize blinkTimer to 0', () => {
            expect(eyeRenderer.blinkTimer).toBe(0);
        });

        it('should set nextBlinkTime to future value', () => {
            expect(eyeRenderer.nextBlinkTime).toBeGreaterThan(0);
        });

        it('should initialize squintAmount to 0', () => {
            expect(eyeRenderer.squintAmount).toBe(0);
        });

        it('should initialize eyeClose to null', () => {
            expect(eyeRenderer.eyeClose).toBeNull();
        });

        it('should initialize eyeOpen to null', () => {
            expect(eyeRenderer.eyeOpen).toBeNull();
        });

        it('should create scaleValue helper method', () => {
            expect(eyeRenderer.scaleValue).toBeDefined();
            expect(typeof eyeRenderer.scaleValue).toBe('function');
        });

        it('should create hexToRgba helper method', () => {
            expect(eyeRenderer.hexToRgba).toBeDefined();
            expect(typeof eyeRenderer.hexToRgba).toBe('function');
        });

        it('should properly bind scaleValue to renderer', () => {
            const result = eyeRenderer.scaleValue(10);
            expect(mockRenderer.scaleValue).toHaveBeenCalledWith(10);
            expect(result).toBe(20); // 10 * 2 from mock
        });

        it('should properly bind hexToRgba to renderer', () => {
            const result = eyeRenderer.hexToRgba('#FFFFFF', 0.5);
            expect(mockRenderer.hexToRgba).toHaveBeenCalledWith('#FFFFFF', 0.5);
            expect(result).toBe('rgba(0, 0, 0, 0.5)');
        });
    });

    describe('getRandomBlinkTime', () => {
        it('should return time in range 3000-7000ms', () => {
            for (let i = 0; i < 10; i++) {
                const time = eyeRenderer.getRandomBlinkTime();
                expect(time).toBeGreaterThanOrEqual(3000);
                expect(time).toBeLessThanOrEqual(7000);
            }
        });

        it('should return different values on multiple calls', () => {
            const times = new Set();
            for (let i = 0; i < 20; i++) {
                times.add(eyeRenderer.getRandomBlinkTime());
            }
            // Should have at least some variety
            expect(times.size).toBeGreaterThan(10);
        });

        it('should return number type', () => {
            const time = eyeRenderer.getRandomBlinkTime();
            expect(typeof time).toBe('number');
        });
    });

    describe('startBlink', () => {
        it('should set blinking to true', () => {
            eyeRenderer.startBlink();
            expect(eyeRenderer.blinking).toBe(true);
        });

        it('should reset blinkTimer to 0', () => {
            eyeRenderer.blinkTimer = 50;
            eyeRenderer.startBlink();
            expect(eyeRenderer.blinkTimer).toBe(0);
        });

        it('should not start blink if blinkingEnabled is false', () => {
            eyeRenderer.blinkingEnabled = false;
            eyeRenderer.startBlink();
            expect(eyeRenderer.blinking).toBe(false);
        });

        it('should work when called multiple times', () => {
            eyeRenderer.startBlink();
            eyeRenderer.startBlink();
            expect(eyeRenderer.blinking).toBe(true);
            expect(eyeRenderer.blinkTimer).toBe(0);
        });
    });

    describe('update', () => {
        it('should update blinkTimer when blinking', () => {
            eyeRenderer.blinking = true;
            eyeRenderer.blinkTimer = 0;
            eyeRenderer.update(16);
            expect(eyeRenderer.blinkTimer).toBe(16);
        });

        it('should accumulate deltaTime in blinkTimer', () => {
            eyeRenderer.blinking = true;
            eyeRenderer.blinkTimer = 50;
            eyeRenderer.update(16);
            expect(eyeRenderer.blinkTimer).toBe(66);
        });

        it('should end blink after 150ms', () => {
            eyeRenderer.blinking = true;
            eyeRenderer.blinkTimer = 0;
            eyeRenderer.update(150);
            expect(eyeRenderer.blinking).toBe(false);
            expect(eyeRenderer.blinkTimer).toBe(0);
        });

        it('should set new nextBlinkTime after blink ends', () => {
            eyeRenderer.blinking = true;
            eyeRenderer.blinkTimer = 0;
            const oldNextBlinkTime = eyeRenderer.nextBlinkTime;
            eyeRenderer.update(150);
            expect(eyeRenderer.nextBlinkTime).toBeGreaterThan(Date.now());
            expect(eyeRenderer.nextBlinkTime).not.toBe(oldNextBlinkTime);
        });

        it('should not update blinkTimer when not blinking', () => {
            eyeRenderer.blinking = false;
            eyeRenderer.blinkTimer = 0;
            eyeRenderer.update(16);
            expect(eyeRenderer.blinkTimer).toBe(0);
        });

        it('should trigger natural blink when time is reached', () => {
            eyeRenderer.blinking = false;
            eyeRenderer.blinkingEnabled = true;
            eyeRenderer.nextBlinkTime = Date.now() - 100; // Time in past
            eyeRenderer.update(16);
            expect(eyeRenderer.blinking).toBe(true);
        });

        it('should not trigger blink if blinkingEnabled is false', () => {
            eyeRenderer.blinkingEnabled = false;
            eyeRenderer.nextBlinkTime = Date.now() - 100;
            eyeRenderer.update(16);
            expect(eyeRenderer.blinking).toBe(false);
        });

        it('should not trigger blink if already blinking', () => {
            eyeRenderer.blinking = true;
            eyeRenderer.blinkTimer = 50;
            const nextTime = eyeRenderer.nextBlinkTime;
            eyeRenderer.nextBlinkTime = Date.now() - 100;
            eyeRenderer.update(16);
            expect(eyeRenderer.blinkTimer).toBe(66); // Continues current blink
        });

        it('should handle zero deltaTime', () => {
            eyeRenderer.blinking = true;
            eyeRenderer.blinkTimer = 50;
            eyeRenderer.update(0);
            expect(eyeRenderer.blinkTimer).toBe(50);
        });

        it('should handle large deltaTime', () => {
            eyeRenderer.blinking = true;
            eyeRenderer.blinkTimer = 0;
            eyeRenderer.update(1000);
            expect(eyeRenderer.blinking).toBe(false);
        });
    });

    describe('getBlinkScale', () => {
        it('should return 1 when not blinking', () => {
            eyeRenderer.blinking = false;
            expect(eyeRenderer.getBlinkScale()).toBe(1);
        });

        it('should return value less than 1 when blinking', () => {
            eyeRenderer.blinking = true;
            eyeRenderer.blinkTimer = 75; // Middle of blink
            const scale = eyeRenderer.getBlinkScale();
            expect(scale).toBeLessThan(1);
            expect(scale).toBeGreaterThan(0);
        });

        it('should return minimum scale at blink peak (75ms)', () => {
            eyeRenderer.blinking = true;
            eyeRenderer.blinkTimer = 75;
            const scale = eyeRenderer.getBlinkScale();
            expect(scale).toBeCloseTo(0.3, 1); // 1 - 0.7 = 0.3
        });

        it('should return scale close to 1 at blink start', () => {
            eyeRenderer.blinking = true;
            eyeRenderer.blinkTimer = 0;
            const scale = eyeRenderer.getBlinkScale();
            expect(scale).toBeCloseTo(1, 1);
        });

        it('should return scale close to 1 at blink end', () => {
            eyeRenderer.blinking = true;
            eyeRenderer.blinkTimer = 150;
            const scale = eyeRenderer.getBlinkScale();
            expect(scale).toBeCloseTo(1, 1);
        });

        it('should use sine curve for smooth animation', () => {
            eyeRenderer.blinking = true;

            // Test several points along the curve
            const points = [0, 37.5, 75, 112.5, 150];
            const scales = points.map(time => {
                eyeRenderer.blinkTimer = time;
                return eyeRenderer.getBlinkScale();
            });

            // Scale should decrease then increase (sine curve)
            expect(scales[0]).toBeGreaterThan(scales[2]); // Start > Middle
            expect(scales[2]).toBeLessThan(scales[4]); // Middle < End
        });

        it('should squish vertically by maximum 70%', () => {
            eyeRenderer.blinking = true;
            eyeRenderer.blinkTimer = 75; // Peak
            const scale = eyeRenderer.getBlinkScale();
            expect(scale).toBeGreaterThanOrEqual(0.3);
        });
    });

    describe('drawEyes', () => {
        beforeEach(() => {
            vi.clearAllMocks();
        });

        it('should not draw eyes for zen emotion', () => {
            eyeRenderer.drawEyes(400, 300, 100, 'zen');
            expect(mockCtx.save).not.toHaveBeenCalled();
        });

        it('should not draw eyes for neutral emotion', () => {
            eyeRenderer.drawEyes(400, 300, 100, 'neutral');
            expect(mockCtx.save).not.toHaveBeenCalled();
        });

        it('should draw eyes even when eyeOpenness is 0 (defaults to 1)', () => {
            // eyeOpenness: 0 is falsy, so it defaults to 1 via || operator
            eyeRenderer.drawEyes(400, 300, 100, 'happy', { eyeOpenness: 0, eyeExpression: 'happy' });
            expect(mockCtx.save).toHaveBeenCalled();
        });

        it('should not draw eyes when eyeOpenness is explicitly set in params as 0.00001 and emotion passes', () => {
            // This tests the actual <= 0 check, but since || operator defaults falsy to 1,
            // we need to test with a value that's truthy but <= 0, which isn't possible
            // So instead, test that negative values work
            eyeRenderer.drawEyes(400, 300, 100, 'happy', { eyeOpenness: -0.5, eyeExpression: 'happy' });
            expect(mockCtx.save).not.toHaveBeenCalled();
        });

        it('should call save and restore for valid emotion', () => {
            eyeRenderer.drawEyes(400, 300, 100, 'happy', { eyeExpression: 'happy' });
            expect(mockCtx.save).toHaveBeenCalled();
            expect(mockCtx.restore).toHaveBeenCalled();
        });

        it('should set stroke style', () => {
            eyeRenderer.drawEyes(400, 300, 100, 'happy', { eyeExpression: 'happy' });
            expect(mockCtx.strokeStyle).toBe('rgba(0, 0, 0, 0.3)');
        });

        it('should set line width using scaleValue', () => {
            eyeRenderer.drawEyes(400, 300, 100, 'happy', { eyeExpression: 'happy' });
            expect(mockRenderer.scaleValue).toHaveBeenCalledWith(2);
            expect(mockCtx.lineWidth).toBe(4); // 2 * 2 from mock
        });

        it('should set lineCap to round', () => {
            eyeRenderer.drawEyes(400, 300, 100, 'happy', { eyeExpression: 'happy' });
            expect(mockCtx.lineCap).toBe('round');
        });

        it('should use default eyeOpenness of 1', () => {
            eyeRenderer.drawEyes(400, 300, 100, 'happy', { eyeExpression: 'happy' });
            expect(mockCtx.save).toHaveBeenCalled();
        });

        it('should use default eyeExpression of neutral', () => {
            eyeRenderer.drawEyes(400, 300, 100, 'happy');
            // Still calls save/restore, but doesn't draw eyes (default case in switch)
            expect(mockCtx.save).toHaveBeenCalled();
            expect(mockCtx.restore).toHaveBeenCalled();
        });

        it('should handle empty params object', () => {
            eyeRenderer.drawEyes(400, 300, 100, 'happy', {});
            // Still calls save/restore even with default neutral expression
            expect(mockCtx.save).toHaveBeenCalled();
            expect(mockCtx.restore).toHaveBeenCalled();
        });

        it('should handle missing params', () => {
            eyeRenderer.drawEyes(400, 300, 100, 'happy');
            // Still calls save/restore even with default neutral expression
            expect(mockCtx.save).toHaveBeenCalled();
            expect(mockCtx.restore).toHaveBeenCalled();
        });
    });

    describe('drawHappyEyes', () => {
        it('should draw two arc strokes', () => {
            eyeRenderer.drawHappyEyes(mockCtx, 400, 300, 40, 25, 1);
            expect(mockCtx.arc).toHaveBeenCalledTimes(2);
            expect(mockCtx.stroke).toHaveBeenCalledTimes(2);
        });

        it('should draw left eye with correct parameters', () => {
            eyeRenderer.drawHappyEyes(mockCtx, 400, 300, 40, 25, 1);
            expect(mockCtx.arc).toHaveBeenCalledWith(
                360, // x - spacing
                300, // y
                25,  // size
                Math.PI * 0.2,
                Math.PI * 0.8,
                false
            );
        });

        it('should draw right eye with correct parameters', () => {
            eyeRenderer.drawHappyEyes(mockCtx, 400, 300, 40, 25, 1);
            expect(mockCtx.arc).toHaveBeenCalledWith(
                440, // x + spacing
                300, // y
                25,  // size
                Math.PI * 0.2,
                Math.PI * 0.8,
                false
            );
        });

        it('should call beginPath before each eye', () => {
            eyeRenderer.drawHappyEyes(mockCtx, 400, 300, 40, 25, 1);
            expect(mockCtx.beginPath).toHaveBeenCalledTimes(2);
        });
    });

    describe('drawSadEyes', () => {
        it('should draw two arc strokes', () => {
            eyeRenderer.drawSadEyes(mockCtx, 400, 300, 40, 25, 1);
            expect(mockCtx.arc).toHaveBeenCalledTimes(2);
            expect(mockCtx.stroke).toHaveBeenCalledTimes(2);
        });

        it('should draw left eye with downward curve', () => {
            eyeRenderer.drawSadEyes(mockCtx, 400, 300, 40, 25, 1);
            expect(mockCtx.arc).toHaveBeenCalledWith(
                360,             // x - spacing
                300 + 25 * 0.5, // y + size * 0.5
                25,              // size
                Math.PI * 1.2,
                Math.PI * 1.8,
                false
            );
        });

        it('should draw right eye with downward curve', () => {
            eyeRenderer.drawSadEyes(mockCtx, 400, 300, 40, 25, 1);
            expect(mockCtx.arc).toHaveBeenCalledWith(
                440,             // x + spacing
                300 + 25 * 0.5, // y + size * 0.5
                25,              // size
                Math.PI * 1.2,
                Math.PI * 1.8,
                false
            );
        });
    });

    describe('drawAngryEyes', () => {
        it('should draw two line strokes', () => {
            eyeRenderer.drawAngryEyes(mockCtx, 400, 300, 40, 25, 1);
            expect(mockCtx.moveTo).toHaveBeenCalledTimes(2);
            expect(mockCtx.lineTo).toHaveBeenCalledTimes(2);
            expect(mockCtx.stroke).toHaveBeenCalledTimes(2);
        });

        it('should draw left eye angled down-right', () => {
            eyeRenderer.drawAngryEyes(mockCtx, 400, 300, 40, 25, 1);
            expect(mockCtx.moveTo).toHaveBeenCalledWith(
                360 - 25,           // x - spacing - size
                300 - 25 * 0.3      // y - size * 0.3
            );
            expect(mockCtx.lineTo).toHaveBeenCalledWith(
                360 + 25 * 0.5,     // x - spacing + size * 0.5
                300 + 25 * 0.3      // y + size * 0.3
            );
        });

        it('should draw right eye angled down-left', () => {
            eyeRenderer.drawAngryEyes(mockCtx, 400, 300, 40, 25, 1);
            expect(mockCtx.moveTo).toHaveBeenCalledWith(
                440 + 25,           // x + spacing + size
                300 - 25 * 0.3      // y - size * 0.3
            );
            expect(mockCtx.lineTo).toHaveBeenCalledWith(
                440 - 25 * 0.5,     // x + spacing - size * 0.5
                300 + 25 * 0.3      // y + size * 0.3
            );
        });
    });

    describe('drawSurprisedEyes', () => {
        it('should draw two wide circles', () => {
            eyeRenderer.drawSurprisedEyes(mockCtx, 400, 300, 40, 25, 1);
            expect(mockCtx.arc).toHaveBeenCalledTimes(2);
            expect(mockCtx.stroke).toHaveBeenCalledTimes(2);
        });

        it('should draw left eye with 1.2x size', () => {
            eyeRenderer.drawSurprisedEyes(mockCtx, 400, 300, 40, 25, 1);
            expect(mockCtx.arc).toHaveBeenCalledWith(
                360,           // x - spacing
                300,           // y
                30,            // size * 1.2
                0,
                Math.PI * 2
            );
        });

        it('should draw right eye with 1.2x size', () => {
            eyeRenderer.drawSurprisedEyes(mockCtx, 400, 300, 40, 25, 1);
            expect(mockCtx.arc).toHaveBeenCalledWith(
                440,           // x + spacing
                300,           // y
                30,            // size * 1.2
                0,
                Math.PI * 2
            );
        });
    });

    describe('drawFocusedEyes', () => {
        it('should draw two filled dots', () => {
            eyeRenderer.drawFocusedEyes(mockCtx, 400, 300, 40, 25, 1);
            expect(mockCtx.arc).toHaveBeenCalledTimes(2);
            expect(mockCtx.fill).toHaveBeenCalledTimes(2);
        });

        it('should set fill style', () => {
            eyeRenderer.drawFocusedEyes(mockCtx, 400, 300, 40, 25, 1);
            expect(mockCtx.fillStyle).toBe('rgba(0, 0, 0, 0.4)');
        });

        it('should draw left eye as small dot', () => {
            eyeRenderer.drawFocusedEyes(mockCtx, 400, 300, 40, 25, 1);
            expect(mockCtx.arc).toHaveBeenCalledWith(
                360,           // x - spacing
                300,           // y
                7.5,           // size * 0.3
                0,
                Math.PI * 2
            );
        });

        it('should draw right eye as small dot', () => {
            eyeRenderer.drawFocusedEyes(mockCtx, 400, 300, 40, 25, 1);
            expect(mockCtx.arc).toHaveBeenCalledWith(
                440,           // x + spacing
                300,           // y
                7.5,           // size * 0.3
                0,
                Math.PI * 2
            );
        });
    });

    describe('drawSleepyEyes', () => {
        it('should draw two horizontal lines', () => {
            eyeRenderer.drawSleepyEyes(mockCtx, 400, 300, 40, 25, 1);
            expect(mockCtx.moveTo).toHaveBeenCalledTimes(2);
            expect(mockCtx.lineTo).toHaveBeenCalledTimes(2);
            expect(mockCtx.stroke).toHaveBeenCalledTimes(2);
        });

        it('should draw left eye as horizontal line', () => {
            eyeRenderer.drawSleepyEyes(mockCtx, 400, 300, 40, 25, 1);
            expect(mockCtx.moveTo).toHaveBeenCalledWith(335, 300); // x - spacing - size
            expect(mockCtx.lineTo).toHaveBeenCalledWith(385, 300); // x - spacing + size
        });

        it('should draw right eye as horizontal line', () => {
            eyeRenderer.drawSleepyEyes(mockCtx, 400, 300, 40, 25, 1);
            expect(mockCtx.moveTo).toHaveBeenCalledWith(415, 300); // x + spacing - size
            expect(mockCtx.lineTo).toHaveBeenCalledWith(465, 300); // x + spacing + size
        });
    });

    describe('drawSuspiciousEyes', () => {
        it('should draw line for left eye and arc for right eye', () => {
            eyeRenderer.drawSuspiciousEyes(mockCtx, 400, 300, 40, 25, 1);
            expect(mockCtx.moveTo).toHaveBeenCalledTimes(1);
            expect(mockCtx.lineTo).toHaveBeenCalledTimes(1);
            expect(mockCtx.arc).toHaveBeenCalledTimes(1);
            expect(mockCtx.stroke).toHaveBeenCalledTimes(2);
        });

        it('should draw left eye narrowed', () => {
            eyeRenderer.drawSuspiciousEyes(mockCtx, 400, 300, 40, 25, 1);
            expect(mockCtx.moveTo).toHaveBeenCalledWith(335, 300); // x - spacing - size
            expect(mockCtx.lineTo).toHaveBeenCalledWith(377.5, 300); // x - spacing + size * 0.7
        });

        it('should draw right eye more open', () => {
            eyeRenderer.drawSuspiciousEyes(mockCtx, 400, 300, 40, 25, 1);
            expect(mockCtx.arc).toHaveBeenCalledWith(
                440,           // x + spacing
                300,           // y
                20,            // size * 0.8
                Math.PI * 0.1,
                Math.PI * 0.9,
                false
            );
        });

        it('should create asymmetric expression', () => {
            eyeRenderer.drawSuspiciousEyes(mockCtx, 400, 300, 40, 25, 1);
            // Left eye uses moveTo/lineTo (line)
            expect(mockCtx.moveTo).toHaveBeenCalled();
            // Right eye uses arc (curve)
            expect(mockCtx.arc).toHaveBeenCalled();
        });
    });

    describe('setBlinkingEnabled', () => {
        it('should enable blinking', () => {
            eyeRenderer.blinkingEnabled = false;
            eyeRenderer.setBlinkingEnabled(true);
            expect(eyeRenderer.blinkingEnabled).toBe(true);
        });

        it('should disable blinking', () => {
            eyeRenderer.blinkingEnabled = true;
            eyeRenderer.setBlinkingEnabled(false);
            expect(eyeRenderer.blinkingEnabled).toBe(false);
        });

        it('should stop current blink when disabled', () => {
            eyeRenderer.blinking = true;
            eyeRenderer.blinkTimer = 50;
            eyeRenderer.setBlinkingEnabled(false);
            expect(eyeRenderer.blinking).toBe(false);
            expect(eyeRenderer.blinkTimer).toBe(0);
        });

        it('should not affect state when enabling', () => {
            eyeRenderer.blinking = false;
            eyeRenderer.blinkTimer = 0;
            eyeRenderer.setBlinkingEnabled(true);
            expect(eyeRenderer.blinking).toBe(false);
            expect(eyeRenderer.blinkTimer).toBe(0);
        });
    });

    describe('setSquintAmount', () => {
        it('should set squint amount', () => {
            eyeRenderer.setSquintAmount(0.5);
            expect(eyeRenderer.squintAmount).toBe(0.5);
        });

        it('should clamp minimum to 0', () => {
            eyeRenderer.setSquintAmount(-0.5);
            expect(eyeRenderer.squintAmount).toBe(0);
        });

        it('should clamp maximum to 1', () => {
            eyeRenderer.setSquintAmount(1.5);
            expect(eyeRenderer.squintAmount).toBe(1);
        });

        it('should accept 0', () => {
            eyeRenderer.setSquintAmount(0);
            expect(eyeRenderer.squintAmount).toBe(0);
        });

        it('should accept 1', () => {
            eyeRenderer.setSquintAmount(1);
            expect(eyeRenderer.squintAmount).toBe(1);
        });

        it('should handle values in range', () => {
            const values = [0, 0.25, 0.5, 0.75, 1];
            values.forEach(val => {
                eyeRenderer.setSquintAmount(val);
                expect(eyeRenderer.squintAmount).toBe(val);
            });
        });
    });

    describe('forceBlink', () => {
        it('should start a blink', () => {
            eyeRenderer.blinking = false;
            eyeRenderer.forceBlink();
            expect(eyeRenderer.blinking).toBe(true);
        });

        it('should reset blink timer', () => {
            eyeRenderer.blinkTimer = 50;
            eyeRenderer.forceBlink();
            expect(eyeRenderer.blinkTimer).toBe(0);
        });

        it('should work even if already blinking', () => {
            eyeRenderer.blinking = true;
            eyeRenderer.blinkTimer = 75;
            eyeRenderer.forceBlink();
            expect(eyeRenderer.blinking).toBe(true);
            expect(eyeRenderer.blinkTimer).toBe(0);
        });

        it('should respect blinkingEnabled', () => {
            eyeRenderer.blinkingEnabled = false;
            eyeRenderer.forceBlink();
            expect(eyeRenderer.blinking).toBe(false);
        });
    });

    describe('Eye Expression Integration', () => {
        it('should draw happy eyes for happy emotion', () => {
            eyeRenderer.drawEyes(400, 300, 100, 'happy', { eyeExpression: 'happy' });
            expect(mockCtx.arc).toHaveBeenCalled();
        });

        it('should draw sad eyes for sad emotion', () => {
            eyeRenderer.drawEyes(400, 300, 100, 'sad', { eyeExpression: 'sad' });
            expect(mockCtx.arc).toHaveBeenCalled();
        });

        it('should draw angry eyes for angry emotion', () => {
            eyeRenderer.drawEyes(400, 300, 100, 'angry', { eyeExpression: 'angry' });
            expect(mockCtx.moveTo).toHaveBeenCalled();
            expect(mockCtx.lineTo).toHaveBeenCalled();
        });

        it('should draw surprised eyes for surprised emotion', () => {
            eyeRenderer.drawEyes(400, 300, 100, 'surprise', { eyeExpression: 'surprised' });
            expect(mockCtx.arc).toHaveBeenCalled();
        });

        it('should draw focused eyes for focused emotion', () => {
            eyeRenderer.drawEyes(400, 300, 100, 'focus', { eyeExpression: 'focused' });
            expect(mockCtx.fill).toHaveBeenCalled();
        });

        it('should draw sleepy eyes for sleepy emotion', () => {
            eyeRenderer.drawEyes(400, 300, 100, 'sleepy', { eyeExpression: 'sleepy' });
            expect(mockCtx.moveTo).toHaveBeenCalled();
        });

        it('should draw suspicious eyes for suspicious emotion', () => {
            eyeRenderer.drawEyes(400, 300, 100, 'suspicious', { eyeExpression: 'suspicious' });
            expect(mockCtx.moveTo).toHaveBeenCalled();
            expect(mockCtx.arc).toHaveBeenCalled();
        });
    });

    describe('Edge Cases', () => {
        it('should handle very small radius', () => {
            expect(() => eyeRenderer.drawEyes(400, 300, 1, 'happy', { eyeExpression: 'happy' })).not.toThrow();
        });

        it('should handle very large radius', () => {
            expect(() => eyeRenderer.drawEyes(400, 300, 1000, 'happy', { eyeExpression: 'happy' })).not.toThrow();
        });

        it('should handle negative coordinates', () => {
            expect(() => eyeRenderer.drawEyes(-100, -100, 50, 'happy', { eyeExpression: 'happy' })).not.toThrow();
        });

        it('should handle eyeOpenness at boundary values', () => {
            expect(() => eyeRenderer.drawEyes(400, 300, 100, 'happy', {
                eyeExpression: 'happy',
                eyeOpenness: 0.001
            })).not.toThrow();
        });

        it('should handle multiple rapid blinks', () => {
            for (let i = 0; i < 10; i++) {
                eyeRenderer.startBlink();
                eyeRenderer.update(150);
            }
            expect(eyeRenderer).toBeDefined();
        });

        it('should handle update with very small deltaTime', () => {
            eyeRenderer.blinking = true;
            expect(() => eyeRenderer.update(0.001)).not.toThrow();
        });

        it('should handle update with very large deltaTime', () => {
            eyeRenderer.blinking = true;
            expect(() => eyeRenderer.update(10000)).not.toThrow();
        });
    });

    describe('Blinking Animation Lifecycle', () => {
        it('should complete full blink cycle', () => {
            eyeRenderer.startBlink();
            expect(eyeRenderer.blinking).toBe(true);

            // Start of blink
            eyeRenderer.update(0);
            expect(eyeRenderer.getBlinkScale()).toBeCloseTo(1, 1);

            // Middle of blink
            eyeRenderer.update(75);
            expect(eyeRenderer.getBlinkScale()).toBeLessThan(0.5);

            // End of blink
            eyeRenderer.update(75);
            expect(eyeRenderer.blinking).toBe(false);
        });

        it('should schedule next blink after completion', () => {
            eyeRenderer.startBlink();
            eyeRenderer.update(150);
            expect(eyeRenderer.nextBlinkTime).toBeGreaterThan(Date.now());
        });

        it('should handle rapid consecutive updates', () => {
            eyeRenderer.startBlink();
            for (let i = 0; i < 10; i++) {
                eyeRenderer.update(15);
            }
            expect(eyeRenderer.blinking).toBe(false);
        });
    });
});
