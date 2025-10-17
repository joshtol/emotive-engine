/**
 * GestureController Tests
 * Tests for the gesture management module
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GestureController } from '../../../src/mascot/GestureController.js';

describe('GestureController', () => {
    let gestureController;
    let mockMascot;

    beforeEach(() => {
        mockMascot = {
            errorBoundary: {
                wrap: fn => fn
            },
            performanceMonitor: {
                markGestureStart: vi.fn(),
                markGestureEnd: vi.fn(),
                recordGestureTime: vi.fn()
            },
            renderer: {
                startBounce: vi.fn(),
                startPulse: vi.fn(),
                startShake: vi.fn(),
                startSpin: vi.fn(),
                startNod: vi.fn(),
                startFloat: vi.fn(),
                startGlow: vi.fn(),
                specialEffects: {
                    addSparkle: vi.fn()
                }
            },
            soundSystem: {
                isAvailable: vi.fn().mockReturnValue(true),
                playGestureSound: vi.fn()
            },
            config: {
                soundEnabled: true
            },
            currentModularGesture: null,
            throttledWarn: vi.fn()
        };

        gestureController = new GestureController(mockMascot);
    });

    describe('Constructor', () => {
        it('should initialize with mascot reference', () => {
            expect(gestureController.mascot).toBe(mockMascot);
        });

        it('should initialize currentGesture as null', () => {
            expect(gestureController.currentGesture).toBeNull();
        });

        it('should initialize gestureCompatibility as null', () => {
            expect(gestureController.gestureCompatibility).toBeNull();
        });

        it('should initialize rendererMethods mapping', () => {
            expect(gestureController.rendererMethods).toBeDefined();
            expect(gestureController.rendererMethods.bounce).toBe('startBounce');
            expect(gestureController.rendererMethods.pulse).toBe('startPulse');
        });

        it('should have 47 gesture mappings', () => {
            expect(Object.keys(gestureController.rendererMethods).length).toBe(47);
        });
    });

    describe('init()', () => {
        it('should exist as a method', () => {
            expect(typeof gestureController.init).toBe('function');
        });

        it('should not throw when called', () => {
            expect(() => gestureController.init()).not.toThrow();
        });
    });

    describe('express()', () => {
        it('should return mascot for chaining', () => {
            const result = gestureController.express('bounce');
            expect(result).toBe(mockMascot);
        });

        it('should return early if no gesture provided', () => {
            const result = gestureController.express(null);
            expect(result).toBe(mockMascot);
            expect(mockMascot.renderer.startBounce).not.toHaveBeenCalled();
        });

        it('should mark gesture start in performance monitor', () => {
            gestureController.express('bounce');
            expect(mockMascot.performanceMonitor.markGestureStart).toHaveBeenCalledWith('bounce');
        });

        it('should mark gesture end in performance monitor', () => {
            gestureController.express('bounce');
            expect(mockMascot.performanceMonitor.markGestureEnd).toHaveBeenCalledWith('bounce');
        });

        it('should record gesture time', () => {
            gestureController.express('bounce');
            expect(mockMascot.performanceMonitor.recordGestureTime).toHaveBeenCalledWith(
                'bounce',
                expect.any(Number)
            );
        });

        it('should execute renderer method for known gesture', () => {
            gestureController.express('bounce', { intensity: 1.5 });
            expect(mockMascot.renderer.startBounce).toHaveBeenCalledWith({ intensity: 1.5 });
        });

        it('should play sound for gesture if enabled', () => {
            gestureController.express('bounce');
            expect(mockMascot.soundSystem.playGestureSound).toHaveBeenCalledWith('bounce');
        });

        it('should not play sound if soundEnabled is false', () => {
            mockMascot.config.soundEnabled = false;
            gestureController.express('bounce');
            expect(mockMascot.soundSystem.playGestureSound).not.toHaveBeenCalled();
        });

        it('should not play sound if soundSystem unavailable', () => {
            mockMascot.soundSystem.isAvailable.mockReturnValue(false);
            gestureController.express('bounce');
            expect(mockMascot.soundSystem.playGestureSound).not.toHaveBeenCalled();
        });

        it('should handle array of gestures as chord', () => {
            vi.spyOn(gestureController, 'expressChord');
            gestureController.express(['bounce', 'pulse']);
            expect(gestureController.expressChord).toHaveBeenCalledWith(['bounce', 'pulse'], {});
        });

        it('should handle chord object', () => {
            vi.spyOn(gestureController, 'expressChord');
            gestureController.express({ type: 'chord', gestures: ['bounce', 'pulse'] });
            expect(gestureController.expressChord).toHaveBeenCalledWith(['bounce', 'pulse'], {});
        });

        it('should warn for unknown gesture', () => {
            gestureController.express('unknownGesture');
            expect(mockMascot.throttledWarn).toHaveBeenCalledWith(
                'Unknown gesture: unknownGesture',
                'gesture_unknownGesture'
            );
        });

        it('should handle missing renderer gracefully', () => {
            mockMascot.renderer = null;
            expect(() => gestureController.express('bounce')).not.toThrow();
        });

        it('should handle missing performanceMonitor gracefully', () => {
            mockMascot.performanceMonitor = null;
            expect(() => gestureController.express('bounce')).not.toThrow();
        });
    });

    describe('expressChord()', () => {
        it('should return mascot for chaining', () => {
            const result = gestureController.expressChord(['bounce', 'pulse']);
            expect(result).toBe(mockMascot);
        });

        it('should return early if gestures is null', () => {
            const result = gestureController.expressChord(null);
            expect(result).toBe(mockMascot);
        });

        it('should return early if gestures is empty array', () => {
            const result = gestureController.expressChord([]);
            expect(result).toBe(mockMascot);
        });

        it('should execute multiple gestures', () => {
            vi.spyOn(gestureController, 'executeGestureDirectly');
            gestureController.expressChord(['bounce', 'pulse']);
            expect(gestureController.executeGestureDirectly).toHaveBeenCalledWith('bounce', {});
            expect(gestureController.executeGestureDirectly).toHaveBeenCalledWith('pulse', {});
        });

        it('should handle gesture compatibility if available', () => {
            gestureController.gestureCompatibility = {
                getCompatibleGestures: vi.fn().mockReturnValue(['bounce']),
                isEnhancingCombination: vi.fn().mockReturnValue(false)
            };

            gestureController.expressChord(['bounce', 'conflictingGesture']);
            expect(gestureController.gestureCompatibility.getCompatibleGestures).toHaveBeenCalled();
        });

        it('should add sparkle for enhancing combinations', () => {
            gestureController.gestureCompatibility = {
                getCompatibleGestures: vi.fn().mockReturnValue(['bounce', 'pulse']),
                isEnhancingCombination: vi.fn().mockReturnValue(true)
            };

            gestureController.expressChord(['bounce', 'pulse']);
            expect(mockMascot.renderer.specialEffects.addSparkle).toHaveBeenCalled();
        });
    });

    describe('executeGestureDirectly()', () => {
        it('should call renderer method for known gesture', () => {
            gestureController.executeGestureDirectly('bounce', { intensity: 2 });
            expect(mockMascot.renderer.startBounce).toHaveBeenCalledWith({ intensity: 2 });
        });

        it('should not throw for unknown gesture', () => {
            expect(() => gestureController.executeGestureDirectly('unknown')).not.toThrow();
        });

        it('should not throw if renderer is null', () => {
            mockMascot.renderer = null;
            expect(() => gestureController.executeGestureDirectly('bounce')).not.toThrow();
        });

        it('should not throw if renderer method does not exist', () => {
            delete mockMascot.renderer.startBounce;
            expect(() => gestureController.executeGestureDirectly('bounce')).not.toThrow();
        });
    });

    describe('chain()', () => {
        it('should return mascot for chaining', () => {
            const result = gestureController.chain('bounce', 'pulse', 'shake');
            expect(result).toBe(mockMascot);
        });

        it('should execute first gesture as fallback if no gestureCompatibility', () => {
            vi.spyOn(gestureController, 'express');
            gestureController.chain('bounce', 'pulse');
            expect(gestureController.express).toHaveBeenCalledWith('bounce');
        });

        it('should use gestureCompatibility if available', () => {
            gestureController.gestureCompatibility = {
                parseChain: vi.fn().mockReturnValue([['bounce'], ['pulse']])
            };
            vi.spyOn(gestureController, 'executeChainSequence');

            gestureController.chain('bounce', 'pulse');
            expect(gestureController.gestureCompatibility.parseChain).toHaveBeenCalledWith('bounce>pulse');
            expect(gestureController.executeChainSequence).toHaveBeenCalled();
        });

        it('should handle empty gesture list', () => {
            expect(() => gestureController.chain()).not.toThrow();
        });
    });

    describe('executeChainSequence()', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('should return early if steps is null', () => {
            expect(() => gestureController.executeChainSequence(null)).not.toThrow();
        });

        it('should return early if steps is empty', () => {
            expect(() => gestureController.executeChainSequence([])).not.toThrow();
        });

        it('should execute single gesture in step', () => {
            vi.spyOn(gestureController, 'express');
            gestureController.executeChainSequence([['bounce']]);
            expect(gestureController.express).toHaveBeenCalledWith('bounce');
        });

        it('should execute chord for multiple gestures in step', () => {
            vi.spyOn(gestureController, 'expressChord');
            gestureController.executeChainSequence([['bounce', 'pulse']]);
            expect(gestureController.expressChord).toHaveBeenCalledWith(['bounce', 'pulse']);
        });

        it('should execute steps sequentially with timing', () => {
            vi.spyOn(gestureController, 'express');
            gestureController.executeChainSequence([['bounce'], ['pulse'], ['shake']]);

            expect(gestureController.express).toHaveBeenCalledWith('bounce');
            expect(gestureController.express).not.toHaveBeenCalledWith('pulse');

            vi.advanceTimersByTime(800);
            expect(gestureController.express).toHaveBeenCalledWith('pulse');
            expect(gestureController.express).not.toHaveBeenCalledWith('shake');

            vi.advanceTimersByTime(800);
            expect(gestureController.express).toHaveBeenCalledWith('shake');
        });
    });

    describe('destroy()', () => {
        it('should clear current gesture', () => {
            gestureController.currentGesture = 'bounce';
            gestureController.destroy();
            expect(gestureController.currentGesture).toBeNull();
        });

        it('should clear gestureCompatibility', () => {
            gestureController.gestureCompatibility = {};
            gestureController.destroy();
            expect(gestureController.gestureCompatibility).toBeNull();
        });

        it('should not throw when called', () => {
            expect(() => gestureController.destroy()).not.toThrow();
        });
    });
});
