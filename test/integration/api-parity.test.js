/**
 * API Parity Tests
 * Ensures 2D and 3D EmotiveMascot classes have consistent public APIs
 *
 * These tests verify that both engine variants expose the same core API
 * for developers switching between 2D and 3D modes.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock 3D dependencies
vi.mock('../../src/3d/Core3DManager.js', () => ({
    Core3DManager: vi.fn().mockImplementation(() => ({
        waitUntilReady: vi.fn().mockResolvedValue(),
        render: vi.fn(),
        setEmotion: vi.fn(),
        playGesture: vi.fn(),
        morphToShape: vi.fn(),
        isMorphing: vi.fn().mockReturnValue(false),
        getMorphState: vi.fn().mockReturnValue(null),
        destroy: vi.fn(),
        emotion: 'neutral',
        glowColor: [1, 1, 1],
        rhythm3DAdapter: { setGrooveConfidence: vi.fn(), grooveConfidence: 1.0 }
    }))
}));

vi.mock('../../src/3d/CanvasLayerManager.js', () => ({
    CanvasLayerManager: vi.fn().mockImplementation(() => ({
        setup: vi.fn().mockReturnValue({
            container: document.createElement('div'),
            webglCanvas: document.createElement('canvas'),
            canvas2D: document.createElement('canvas')
        }),
        isCanvasAppended: vi.fn().mockReturnValue(true),
        appendWebGLCanvas: vi.fn(),
        destroy: vi.fn()
    }))
}));

vi.mock('../../src/3d/animation/DanceChoreographer.js', () => ({
    DanceChoreographer: vi.fn().mockImplementation(() => ({
        setRhythmAdapter: vi.fn(),
        setMascot: vi.fn(),
        update: vi.fn(),
        destroy: vi.fn()
    }))
}));

import EmotiveMascot from '../../src/EmotiveMascotPublic.js';
import { EmotiveMascot3D } from '../../src/3d/index.js';

// Helper to check if method exists on prototype or instance
const hasMethod = (obj, methodName) => {
    return typeof obj[methodName] === 'function';
};

/**
 * Core public methods that MUST exist on both 2D and 3D
 */
const REQUIRED_SHARED_METHODS = [
    // Lifecycle
    'init',
    'start',
    'stop',

    // Emotions & Expressions
    'setEmotion',
    'express',
    'chain',
    'morphTo',
    'feel',

    // Position
    'setPosition',

    // Helpers
    'getAvailableEmotions',
    'getAvailableGestures'
];

/**
 * Methods that exist on 2D but NOT required on 3D (different architectures)
 */
const TWOD_ONLY_METHODS = [
    'setGazeTarget',
    'enableGazeTracking',
    'disableGazeTracking',
    'getGazeState',
    'setParticleSystemCanvasDimensions',
    'setQuality',
    'setMaxParticles',
    'getParticleCount',
    'setColor',
    'setGlowColor',
    'setBackdrop',
    'getBackdrop',
    'startRecording',
    'stopRecording',
    'stopPlayback',
    'getTimeline',
    'getCurrentTime',
    'getFrameData',
    'getFrameBlob',
    'getAnimationData'
];

/**
 * Methods that exist on 3D but NOT on 2D (3D-specific features)
 */
const THREED_ONLY_METHODS = [
    'destroy',
    'getPosition',
    'enableAutoRotate',
    'disableAutoRotate',
    'setCameraPreset',
    'enableRhythmSync',
    'disableRhythmSync',
    'enableGroove',
    'disableGroove',
    'setGroove',
    'getGroovePresets',
    'getCurrentGroove',
    'startRhythm',
    'stopRhythm',
    'setRhythmBPM',
    'setRhythmPattern',
    'setSSSPreset',
    'startSolarEclipse',
    'startLunarEclipse',
    'stopEclipse',
    'breathePhase',
    'stopBreathingPhase',
    'setCoreGlowEnabled',
    'isCoreGlowEnabled',
    'growIn',
    'isMorphing',
    'getMorphState',
    'getAvailableGeometries'
];

describe('API Parity', () => {
    let canvas2D;
    let container3D;

    beforeEach(() => {
        // Setup 2D canvas
        canvas2D = document.createElement('canvas');
        canvas2D.id = 'parity-test-canvas-2d';
        canvas2D.width = 400;
        canvas2D.height = 300;
        document.body.appendChild(canvas2D);

        // Setup 3D container
        container3D = document.createElement('div');
        container3D.id = 'parity-test-container-3d';
        document.body.appendChild(container3D);
    });

    afterEach(() => {
        if (canvas2D?.parentNode) canvas2D.parentNode.removeChild(canvas2D);
        if (container3D?.parentNode) container3D.parentNode.removeChild(container3D);
    });

    describe('Required Shared Methods', () => {
        it('should have all required methods on 2D', () => {
            const mascot2D = new EmotiveMascot({ canvasId: 'parity-test-canvas-2d' });

            REQUIRED_SHARED_METHODS.forEach(method => {
                expect(typeof mascot2D[method]).toBe('function',
                    `2D missing method: ${method}`);
            });

            // Don't call stop - requires init
        });

        it('should have all required methods on 3D', () => {
            const mascot3D = new EmotiveMascot3D({ canvasId: 'parity-test-canvas-3d' });

            REQUIRED_SHARED_METHODS.forEach(method => {
                expect(typeof mascot3D[method]).toBe('function',
                    `3D missing method: ${method}`);
            });

            mascot3D.destroy();
        });
    });

    describe('2D-Only Methods', () => {
        it('should have 2D-only methods on EmotiveMascot', () => {
            const mascot2D = new EmotiveMascot({ canvasId: 'parity-test-canvas-2d' });

            TWOD_ONLY_METHODS.forEach(method => {
                expect(typeof mascot2D[method]).toBe('function',
                    `2D missing expected method: ${method}`);
            });

            // Don't call stop - requires init
        });
    });

    describe('3D-Only Methods', () => {
        it('should have 3D-only methods on EmotiveMascot3D', () => {
            const mascot3D = new EmotiveMascot3D({ canvasId: 'parity-test-canvas-3d' });

            THREED_ONLY_METHODS.forEach(method => {
                expect(typeof mascot3D[method]).toBe('function',
                    `3D missing expected method: ${method}`);
            });

            mascot3D.destroy();
        });
    });

    describe('setEmotion Signature Parity (3D only - 2D requires init)', () => {
        let mascot3D;

        beforeEach(() => {
            mascot3D = new EmotiveMascot3D({ canvasId: 'parity-test-canvas-3d' });
            mascot3D.init(container3D);
        });

        afterEach(() => {
            mascot3D?.destroy();
        });

        it('should accept (emotion) on 3D', () => {
            expect(() => mascot3D.setEmotion('joy')).not.toThrow();
        });

        it('should accept (emotion, undertone) on 3D', () => {
            expect(() => mascot3D.setEmotion('joy', 'excitement')).not.toThrow();
        });

        it('should accept (emotion, options) on 3D', () => {
            expect(() => mascot3D.setEmotion('joy', { undertone: 'calm' })).not.toThrow();
        });

        it('should accept (emotion, duration) on 3D (2D API compatibility)', () => {
            expect(() => mascot3D.setEmotion('joy', 500)).not.toThrow();
        });

        it('should accept (emotion, null) to clear undertone on 3D', () => {
            expect(() => mascot3D.setEmotion('joy', null)).not.toThrow();
        });
    });

    describe('Method Chaining Parity (3D only)', () => {
        let mascot3D;

        beforeEach(() => {
            mascot3D = new EmotiveMascot3D({ canvasId: 'parity-test-canvas-3d' });
            mascot3D.init(container3D);
        });

        afterEach(() => {
            mascot3D?.destroy();
        });

        it('should return this from setEmotion', () => {
            expect(mascot3D.setEmotion('joy')).toBe(mascot3D);
        });

        it('should return this from express', () => {
            expect(mascot3D.express('bounce')).toBe(mascot3D);
        });

        it('should return this from morphTo', () => {
            expect(mascot3D.morphTo('heart')).toBe(mascot3D);
        });
    });

    describe('Event System Parity (3D only)', () => {
        let mascot3D;

        beforeEach(() => {
            mascot3D = new EmotiveMascot3D({ canvasId: 'parity-test-canvas-3d' });
            mascot3D.init(container3D);
        });

        afterEach(() => {
            mascot3D?.destroy();
        });

        it('should support on/off for event listening on 3D', () => {
            const handler = vi.fn();

            expect(() => mascot3D.eventManager.on('emotion:change', handler)).not.toThrow();
            expect(() => mascot3D.eventManager.off('emotion:change', handler)).not.toThrow();
        });

        it('should emit emotion:change on setEmotion', () => {
            const handler = vi.fn();
            mascot3D.eventManager.on('emotion:change', handler);

            mascot3D.setEmotion('joy');

            expect(handler).toHaveBeenCalledWith({
                emotion: 'joy',
                undertone: null
            });
        });
    });

    describe('Helper Methods Return Same Types', () => {
        let mascot2D, mascot3D;

        beforeEach(() => {
            mascot2D = new EmotiveMascot({ canvasId: 'parity-test-canvas-2d' });
            mascot3D = new EmotiveMascot3D({ canvasId: 'parity-test-canvas-3d' });
        });

        afterEach(() => {
            // Don't call stop on 2D - it requires init
            mascot3D?.destroy();
        });

        it('should return arrays from getAvailableEmotions on both', () => {
            const emotions2D = mascot2D.getAvailableEmotions();
            const emotions3D = mascot3D.getAvailableEmotions();

            expect(Array.isArray(emotions2D)).toBe(true);
            expect(Array.isArray(emotions3D)).toBe(true);
            expect(emotions2D.length).toBeGreaterThan(0);
            expect(emotions3D.length).toBeGreaterThan(0);
        });

        it('should return arrays from getAvailableGestures on both', () => {
            const gestures2D = mascot2D.getAvailableGestures();
            const gestures3D = mascot3D.getAvailableGestures();

            expect(Array.isArray(gestures2D)).toBe(true);
            expect(Array.isArray(gestures3D)).toBe(true);
            expect(gestures2D.length).toBeGreaterThan(0);
            expect(gestures3D.length).toBeGreaterThan(0);
        });

        it('should return position object from getPosition on 3D', () => {
            const pos3D = mascot3D.getPosition();

            expect(pos3D).toHaveProperty('x');
            expect(pos3D).toHaveProperty('y');
            expect(pos3D).toHaveProperty('z');
        });
    });

    describe('feel() API Parity (3D only)', () => {
        let mascot3D;

        beforeEach(() => {
            mascot3D = new EmotiveMascot3D({ canvasId: 'parity-test-canvas-3d' });
            mascot3D.init(container3D);
        });

        afterEach(() => {
            mascot3D?.destroy();
        });

        it('should return result object with success property', () => {
            const result = mascot3D.feel('happy');
            expect(result).toHaveProperty('success');
        });

        it('should return result object with parsed property', () => {
            const result = mascot3D.feel('happy, bouncing');
            expect(result).toHaveProperty('parsed');
        });

        it('should return error object when destroyed', () => {
            mascot3D.destroy();

            const result = mascot3D.feel('happy');
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });
});
