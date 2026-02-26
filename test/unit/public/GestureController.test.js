import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GestureController } from '../../../src/public/GestureController.js';

describe('GestureController', () => {
    let controller;
    let mockEngine;
    let mockRecording;

    beforeEach(() => {
        mockEngine = {
            express: vi.fn(),
            updateUndertone: vi.fn(),
        };

        mockRecording = {
            isRecording: vi.fn(() => false),
            startTime: vi.fn(() => 0),
            timeline: vi.fn(() => []),
        };

        controller = new GestureController(() => mockEngine, mockRecording);
    });

    describe('triggerGesture / express', () => {
        it('should trigger gesture on engine', () => {
            controller.triggerGesture('bounce');
            expect(mockEngine.express).toHaveBeenCalledWith('bounce');
        });

        it('express() should alias triggerGesture()', () => {
            controller.express('wave');
            expect(mockEngine.express).toHaveBeenCalledWith('wave');
        });

        it('should throw when engine is not initialized', () => {
            const noEngine = new GestureController(() => null, mockRecording);
            expect(() => noEngine.triggerGesture('bounce')).toThrow('Engine not initialized');
        });

        it('should record gesture when recording', () => {
            const timeline = [];
            mockRecording.isRecording.mockReturnValue(true);
            mockRecording.startTime.mockReturnValue(1000);
            mockRecording.timeline.mockReturnValue(timeline);

            controller.triggerGesture('bounce', 2500);

            expect(timeline).toHaveLength(1);
            expect(timeline[0].type).toBe('gesture');
            expect(timeline[0].name).toBe('bounce');
            expect(timeline[0].time).toBe(2500);
        });
    });

    describe('chain definitions', () => {
        it('should have all 12 built-in chains', () => {
            const chains = controller.getAvailableChains();
            expect(chains).toContain('rise');
            expect(chains).toContain('flow');
            expect(chains).toContain('burst');
            expect(chains).toContain('drift');
            expect(chains).toContain('chaos');
            expect(chains).toContain('morph');
            expect(chains).toContain('rhythm');
            expect(chains).toContain('spiral');
            expect(chains).toContain('routine');
            expect(chains).toContain('radiance');
            expect(chains).toContain('twinkle');
            expect(chains).toContain('stream');
            expect(chains).toHaveLength(12);
        });

        it('should return chain definition by name', () => {
            const def = controller.getChainDefinition('rise');
            expect(def).toBe('breathe > sway+lean+tilt');
        });

        it('should be case-insensitive', () => {
            expect(controller.getChainDefinition('RISE')).toBe('breathe > sway+lean+tilt');
        });

        it('should return null for unknown chains', () => {
            expect(controller.getChainDefinition('nonexistent')).toBeNull();
        });
    });

    describe('chain execution', () => {
        it('should execute simultaneous gestures (+ syntax)', () => {
            // 'drift' = 'sway+breathe+float+drift' (no >, all simultaneous)
            controller.chain('drift');
            expect(mockEngine.express).toHaveBeenCalledWith('sway');
            expect(mockEngine.express).toHaveBeenCalledWith('breathe');
            expect(mockEngine.express).toHaveBeenCalledWith('float');
            expect(mockEngine.express).toHaveBeenCalledWith('drift');
        });

        it('should execute first group immediately for sequential chains', () => {
            vi.useFakeTimers();
            // 'rise' = 'breathe > sway+lean+tilt'
            controller.chain('rise');
            // First group runs at setTimeout(0), flush it
            vi.advanceTimersByTime(0);
            expect(mockEngine.express).toHaveBeenCalledWith('breathe');
            vi.useRealTimers();
        });

        it('should warn for unknown chain name', () => {
            const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            controller.chain('nonexistent');
            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
        });

        it('should throw when engine is not initialized', () => {
            const noEngine = new GestureController(() => null, mockRecording);
            expect(() => noEngine.chain('rise')).toThrow('Engine not initialized');
        });
    });

    describe('updateUndertone', () => {
        it('should call engine.updateUndertone', () => {
            controller.updateUndertone('nervous');
            expect(mockEngine.updateUndertone).toHaveBeenCalledWith('nervous');
        });

        it('should clear undertone with null', () => {
            controller.updateUndertone(null);
            expect(mockEngine.updateUndertone).toHaveBeenCalledWith(null);
        });

        it('should throw when engine is not initialized', () => {
            const noEngine = new GestureController(() => null, mockRecording);
            expect(() => noEngine.updateUndertone('nervous')).toThrow('Engine not initialized');
        });

        it('should fall back to addUndertone if updateUndertone is missing', () => {
            const fallbackEngine = {
                addUndertone: vi.fn(),
            };
            const ctrl = new GestureController(() => fallbackEngine, mockRecording);
            ctrl.updateUndertone('confident');
            expect(fallbackEngine.addUndertone).toHaveBeenCalledWith('confident');
        });
    });
});
