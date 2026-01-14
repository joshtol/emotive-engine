/**
 * MascotStateManager Tests
 * Tests for the centralized state management module
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MascotStateManager } from '../../../src/mascot/state/MascotStateManager.js';

describe('MascotStateManager', () => {
    let stateManager;
    let mockEmit;

    beforeEach(() => {
        mockEmit = vi.fn();
    });

    describe('Constructor', () => {
        it('should initialize with default values when no deps provided', () => {
            stateManager = new MascotStateManager();

            expect(stateManager.isRunning).toBe(false);
            expect(stateManager.debugMode).toBe(false);
            expect(stateManager.speaking).toBe(false);
            expect(stateManager.recording).toBe(false);
            expect(stateManager.audioLevel).toBe(0);
            expect(stateManager.sleeping).toBe(false);
            expect(stateManager.rhythmEnabled).toBe(false);
            expect(stateManager.currentModularGesture).toBe(null);
            expect(stateManager.breathePhase).toBe('idle');
            expect(stateManager.breatheStartTime).toBe(0);
            expect(stateManager.orbScale).toBe(1.0);
            expect(stateManager.warningTimestamps).toEqual({});
            expect(stateManager.warningThrottle).toBe(5000);
        });

        it('should initialize with custom initial state', () => {
            stateManager = new MascotStateManager({
                initialState: {
                    isRunning: true,
                    debugMode: true,
                    speaking: true,
                    recording: true,
                    audioLevel: 0.5,
                    sleeping: true,
                    rhythmEnabled: true,
                    currentModularGesture: 'wave',
                    breathePhase: 'inhale',
                    breatheStartTime: 1000,
                    orbScale: 1.5,
                    warningTimestamps: { test: 123 },
                    warningThrottle: 10000
                }
            });

            expect(stateManager.isRunning).toBe(true);
            expect(stateManager.debugMode).toBe(true);
            expect(stateManager.speaking).toBe(true);
            expect(stateManager.recording).toBe(true);
            expect(stateManager.audioLevel).toBe(0.5);
            expect(stateManager.sleeping).toBe(true);
            expect(stateManager.rhythmEnabled).toBe(true);
            expect(stateManager.currentModularGesture).toBe('wave');
            expect(stateManager.breathePhase).toBe('inhale');
            expect(stateManager.breatheStartTime).toBe(1000);
            expect(stateManager.orbScale).toBe(1.5);
            expect(stateManager.warningTimestamps).toEqual({ test: 123 });
            expect(stateManager.warningThrottle).toBe(10000);
        });

        it('should store emit function', () => {
            stateManager = new MascotStateManager({ emit: mockEmit });
            stateManager.isRunning = true;

            expect(mockEmit).toHaveBeenCalled();
        });

        it('should handle empty deps object', () => {
            stateManager = new MascotStateManager({});

            expect(stateManager.isRunning).toBe(false);
        });
    });

    describe('Operational State', () => {
        beforeEach(() => {
            stateManager = new MascotStateManager({ emit: mockEmit });
        });

        describe('isRunning', () => {
            it('should get and set isRunning', () => {
                stateManager.isRunning = true;
                expect(stateManager.isRunning).toBe(true);

                stateManager.isRunning = false;
                expect(stateManager.isRunning).toBe(false);
            });

            it('should emit stateChange event when isRunning changes', () => {
                stateManager.isRunning = true;

                expect(mockEmit).toHaveBeenCalledWith('stateChange', {
                    property: 'isRunning',
                    value: true
                });
            });

            it('should not emit when isRunning set to same value', () => {
                stateManager.isRunning = false; // same as default
                expect(mockEmit).not.toHaveBeenCalled();
            });
        });

        describe('debugMode', () => {
            it('should get and set debugMode', () => {
                stateManager.debugMode = true;
                expect(stateManager.debugMode).toBe(true);
            });

            it('should emit stateChange event when debugMode changes', () => {
                stateManager.debugMode = true;

                expect(mockEmit).toHaveBeenCalledWith('stateChange', {
                    property: 'debugMode',
                    value: true
                });
            });

            it('should not emit when debugMode set to same value', () => {
                stateManager.debugMode = false;
                expect(mockEmit).not.toHaveBeenCalled();
            });
        });
    });

    describe('Speech/Audio State', () => {
        beforeEach(() => {
            stateManager = new MascotStateManager({ emit: mockEmit });
        });

        describe('speaking', () => {
            it('should get and set speaking', () => {
                stateManager.speaking = true;
                expect(stateManager.speaking).toBe(true);
            });

            it('should emit stateChange event when speaking changes', () => {
                stateManager.speaking = true;

                expect(mockEmit).toHaveBeenCalledWith('stateChange', {
                    property: 'speaking',
                    value: true
                });
            });

            it('should not emit when speaking set to same value', () => {
                stateManager.speaking = false;
                expect(mockEmit).not.toHaveBeenCalled();
            });
        });

        describe('recording', () => {
            it('should get and set recording', () => {
                stateManager.recording = true;
                expect(stateManager.recording).toBe(true);
            });

            it('should emit stateChange event when recording changes', () => {
                stateManager.recording = true;

                expect(mockEmit).toHaveBeenCalledWith('stateChange', {
                    property: 'recording',
                    value: true
                });
            });

            it('should not emit when recording set to same value', () => {
                stateManager.recording = false;
                expect(mockEmit).not.toHaveBeenCalled();
            });
        });

        describe('audioLevel', () => {
            it('should get and set audioLevel', () => {
                stateManager.audioLevel = 0.75;
                expect(stateManager.audioLevel).toBe(0.75);
            });

            it('should NOT emit stateChange for audioLevel (too frequent)', () => {
                stateManager.audioLevel = 0.5;
                stateManager.audioLevel = 0.8;
                stateManager.audioLevel = 1.0;

                expect(mockEmit).not.toHaveBeenCalled();
            });
        });
    });

    describe('Behavioral State', () => {
        beforeEach(() => {
            stateManager = new MascotStateManager({ emit: mockEmit });
        });

        describe('sleeping', () => {
            it('should get and set sleeping', () => {
                stateManager.sleeping = true;
                expect(stateManager.sleeping).toBe(true);
            });

            it('should emit stateChange event when sleeping changes', () => {
                stateManager.sleeping = true;

                expect(mockEmit).toHaveBeenCalledWith('stateChange', {
                    property: 'sleeping',
                    value: true
                });
            });

            it('should not emit when sleeping set to same value', () => {
                stateManager.sleeping = false;
                expect(mockEmit).not.toHaveBeenCalled();
            });
        });

        describe('rhythmEnabled', () => {
            it('should get and set rhythmEnabled', () => {
                stateManager.rhythmEnabled = true;
                expect(stateManager.rhythmEnabled).toBe(true);
            });

            it('should NOT emit stateChange for rhythmEnabled', () => {
                stateManager.rhythmEnabled = true;
                expect(mockEmit).not.toHaveBeenCalled();
            });
        });
    });

    describe('Gesture State', () => {
        beforeEach(() => {
            stateManager = new MascotStateManager({ emit: mockEmit });
        });

        describe('currentModularGesture', () => {
            it('should get and set currentModularGesture', () => {
                stateManager.currentModularGesture = 'wave';
                expect(stateManager.currentModularGesture).toBe('wave');
            });

            it('should handle object gestures', () => {
                const gesture = { type: 'complex', duration: 1000 };
                stateManager.currentModularGesture = gesture;
                expect(stateManager.currentModularGesture).toBe(gesture);
            });

            it('should NOT emit stateChange for currentModularGesture', () => {
                stateManager.currentModularGesture = 'wave';
                expect(mockEmit).not.toHaveBeenCalled();
            });
        });
    });

    describe('Breathing State', () => {
        beforeEach(() => {
            stateManager = new MascotStateManager({ emit: mockEmit });
        });

        describe('breathePhase', () => {
            it('should get and set breathePhase', () => {
                stateManager.breathePhase = 'inhale';
                expect(stateManager.breathePhase).toBe('inhale');

                stateManager.breathePhase = 'exhale';
                expect(stateManager.breathePhase).toBe('exhale');
            });

            it('should NOT emit stateChange for breathePhase', () => {
                stateManager.breathePhase = 'inhale';
                expect(mockEmit).not.toHaveBeenCalled();
            });
        });

        describe('breatheStartTime', () => {
            it('should get and set breatheStartTime', () => {
                stateManager.breatheStartTime = 12345;
                expect(stateManager.breatheStartTime).toBe(12345);
            });

            it('should NOT emit stateChange for breatheStartTime', () => {
                stateManager.breatheStartTime = 12345;
                expect(mockEmit).not.toHaveBeenCalled();
            });
        });

        describe('orbScale', () => {
            it('should get and set orbScale', () => {
                stateManager.orbScale = 1.5;
                expect(stateManager.orbScale).toBe(1.5);
            });

            it('should handle decimal values', () => {
                stateManager.orbScale = 0.333;
                expect(stateManager.orbScale).toBe(0.333);
            });

            it('should NOT emit stateChange for orbScale', () => {
                stateManager.orbScale = 2.0;
                expect(mockEmit).not.toHaveBeenCalled();
            });
        });
    });

    describe('Utility State', () => {
        beforeEach(() => {
            stateManager = new MascotStateManager({ emit: mockEmit });
        });

        describe('warningTimestamps', () => {
            it('should get and set warningTimestamps', () => {
                const timestamps = { warn1: 1000, warn2: 2000 };
                stateManager.warningTimestamps = timestamps;
                expect(stateManager.warningTimestamps).toBe(timestamps);
            });

            it('should NOT emit stateChange for warningTimestamps', () => {
                stateManager.warningTimestamps = { test: 123 };
                expect(mockEmit).not.toHaveBeenCalled();
            });
        });

        describe('warningThrottle', () => {
            it('should get and set warningThrottle', () => {
                stateManager.warningThrottle = 10000;
                expect(stateManager.warningThrottle).toBe(10000);
            });

            it('should NOT emit stateChange for warningThrottle', () => {
                stateManager.warningThrottle = 10000;
                expect(mockEmit).not.toHaveBeenCalled();
            });
        });
    });

    describe('getSnapshot()', () => {
        it('should return snapshot of all state', () => {
            stateManager = new MascotStateManager({
                initialState: {
                    isRunning: true,
                    debugMode: true,
                    speaking: true,
                    recording: true,
                    audioLevel: 0.7,
                    sleeping: false,
                    rhythmEnabled: true,
                    currentModularGesture: 'wave',
                    breathePhase: 'inhale',
                    breatheStartTime: 5000,
                    orbScale: 1.2
                }
            });

            const snapshot = stateManager.getSnapshot();

            expect(snapshot).toEqual({
                isRunning: true,
                debugMode: true,
                speaking: true,
                recording: true,
                audioLevel: 0.7,
                sleeping: false,
                rhythmEnabled: true,
                currentModularGesture: 'wave',
                breathePhase: 'inhale',
                breatheStartTime: 5000,
                orbScale: 1.2
            });
        });

        it('should return snapshot with default values', () => {
            stateManager = new MascotStateManager();

            const snapshot = stateManager.getSnapshot();

            expect(snapshot).toEqual({
                isRunning: false,
                debugMode: false,
                speaking: false,
                recording: false,
                audioLevel: 0,
                sleeping: false,
                rhythmEnabled: false,
                currentModularGesture: null,
                breathePhase: 'idle',
                breatheStartTime: 0,
                orbScale: 1.0
            });
        });

        it('should not include warningTimestamps or warningThrottle', () => {
            stateManager = new MascotStateManager({
                initialState: {
                    warningTimestamps: { test: 123 },
                    warningThrottle: 10000
                }
            });

            const snapshot = stateManager.getSnapshot();

            expect(snapshot.warningTimestamps).toBeUndefined();
            expect(snapshot.warningThrottle).toBeUndefined();
        });
    });

    describe('reset()', () => {
        it('should reset all state to defaults', () => {
            stateManager = new MascotStateManager({
                initialState: {
                    isRunning: true,
                    debugMode: true,
                    speaking: true,
                    recording: true,
                    audioLevel: 0.9,
                    sleeping: true,
                    rhythmEnabled: true,
                    currentModularGesture: 'wave',
                    breathePhase: 'exhale',
                    breatheStartTime: 9999,
                    orbScale: 2.5,
                    warningTimestamps: { test: 123 },
                    warningThrottle: 10000
                }
            });

            stateManager.reset();

            expect(stateManager.isRunning).toBe(false);
            expect(stateManager.debugMode).toBe(false);
            expect(stateManager.speaking).toBe(false);
            expect(stateManager.recording).toBe(false);
            expect(stateManager.audioLevel).toBe(0);
            expect(stateManager.sleeping).toBe(false);
            expect(stateManager.rhythmEnabled).toBe(false);
            expect(stateManager.currentModularGesture).toBe(null);
            expect(stateManager.breathePhase).toBe('idle');
            expect(stateManager.breatheStartTime).toBe(0);
            expect(stateManager.orbScale).toBe(1.0);
            expect(stateManager.warningTimestamps).toEqual({});
        });

        it('should not reset warningThrottle', () => {
            stateManager = new MascotStateManager({
                initialState: { warningThrottle: 10000 }
            });

            stateManager.reset();

            // warningThrottle is not reset in the current implementation
            expect(stateManager.warningThrottle).toBe(10000);
        });

        it('should be callable multiple times', () => {
            stateManager = new MascotStateManager();

            stateManager.isRunning = true;
            stateManager.speaking = true;
            stateManager.reset();

            stateManager.debugMode = true;
            stateManager.recording = true;
            stateManager.reset();

            expect(stateManager.isRunning).toBe(false);
            expect(stateManager.debugMode).toBe(false);
            expect(stateManager.speaking).toBe(false);
            expect(stateManager.recording).toBe(false);
        });
    });

    describe('Event Emission Edge Cases', () => {
        beforeEach(() => {
            stateManager = new MascotStateManager({ emit: mockEmit });
        });

        it('should emit multiple times for multiple changes', () => {
            stateManager.isRunning = true;
            stateManager.speaking = true;
            stateManager.sleeping = true;

            expect(mockEmit).toHaveBeenCalledTimes(3);
        });

        it('should emit on toggle from true to false', () => {
            stateManager.isRunning = true;
            mockEmit.mockClear();

            stateManager.isRunning = false;

            expect(mockEmit).toHaveBeenCalledWith('stateChange', {
                property: 'isRunning',
                value: false
            });
        });

        it('should work without emit function', () => {
            stateManager = new MascotStateManager();

            // Should not throw
            expect(() => {
                stateManager.isRunning = true;
                stateManager.speaking = true;
            }).not.toThrow();
        });
    });
});
