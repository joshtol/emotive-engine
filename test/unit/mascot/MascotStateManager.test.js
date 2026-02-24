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
        it('should initialize with default values', () => {
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

        it('should accept custom initial state', () => {
            stateManager = new MascotStateManager({
                initialState: {
                    isRunning: true,
                    debugMode: true,
                    speaking: true,
                    audioLevel: 0.5,
                    currentModularGesture: 'wave',
                    breathePhase: 'inhale',
                    orbScale: 1.5
                }
            });

            expect(stateManager.isRunning).toBe(true);
            expect(stateManager.debugMode).toBe(true);
            expect(stateManager.speaking).toBe(true);
            expect(stateManager.audioLevel).toBe(0.5);
            expect(stateManager.currentModularGesture).toBe('wave');
            expect(stateManager.breathePhase).toBe('inhale');
            expect(stateManager.orbScale).toBe(1.5);
        });
    });

    describe('Event Emission', () => {
        beforeEach(() => {
            stateManager = new MascotStateManager({ emit: mockEmit });
        });

        // Properties that SHOULD emit stateChange when changed
        it.each([
            ['isRunning', true],
            ['debugMode', true],
            ['speaking', true],
            ['recording', true],
            ['sleeping', true]
        ])('%s should emit stateChange when value changes', (property, newValue) => {
            stateManager[property] = newValue;

            expect(mockEmit).toHaveBeenCalledWith('stateChange', {
                property,
                value: newValue
            });
        });

        // Same-value changes should NOT emit
        it.each([
            ['isRunning', false],
            ['debugMode', false],
            ['speaking', false],
            ['recording', false],
            ['sleeping', false]
        ])('%s should not emit when set to same value', (property, defaultValue) => {
            stateManager[property] = defaultValue;
            expect(mockEmit).not.toHaveBeenCalled();
        });

        // Properties that should NEVER emit (too frequent or internal)
        it.each([
            ['audioLevel', 0.5],
            ['rhythmEnabled', true],
            ['currentModularGesture', 'wave'],
            ['breathePhase', 'inhale'],
            ['breatheStartTime', 12345],
            ['orbScale', 2.0],
            ['warningTimestamps', { test: 123 }],
            ['warningThrottle', 10000]
        ])('%s should not emit stateChange', (property, newValue) => {
            stateManager[property] = newValue;
            expect(mockEmit).not.toHaveBeenCalled();
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
            expect(() => {
                stateManager.isRunning = true;
                stateManager.speaking = true;
            }).not.toThrow();
        });
    });

    describe('getSnapshot()', () => {
        it('should return snapshot of all observable state', () => {
            stateManager = new MascotStateManager({
                initialState: {
                    isRunning: true,
                    speaking: true,
                    audioLevel: 0.7,
                    currentModularGesture: 'wave',
                    orbScale: 1.2
                }
            });

            const snapshot = stateManager.getSnapshot();

            expect(snapshot.isRunning).toBe(true);
            expect(snapshot.speaking).toBe(true);
            expect(snapshot.audioLevel).toBe(0.7);
            expect(snapshot.currentModularGesture).toBe('wave');
            expect(snapshot.orbScale).toBe(1.2);
        });

        it('should exclude internal-only properties', () => {
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
                    warningTimestamps: { test: 123 }
                }
            });

            stateManager.reset();

            expect(stateManager.isRunning).toBe(false);
            expect(stateManager.speaking).toBe(false);
            expect(stateManager.audioLevel).toBe(0);
            expect(stateManager.currentModularGesture).toBe(null);
            expect(stateManager.breathePhase).toBe('idle');
            expect(stateManager.orbScale).toBe(1.0);
            expect(stateManager.warningTimestamps).toEqual({});
        });

        it('should not reset warningThrottle', () => {
            stateManager = new MascotStateManager({
                initialState: { warningThrottle: 10000 }
            });

            stateManager.reset();
            expect(stateManager.warningThrottle).toBe(10000);
        });

        it('should be callable multiple times', () => {
            stateManager = new MascotStateManager();

            stateManager.isRunning = true;
            stateManager.speaking = true;
            stateManager.reset();

            stateManager.debugMode = true;
            stateManager.reset();

            expect(stateManager.isRunning).toBe(false);
            expect(stateManager.debugMode).toBe(false);
        });
    });
});
