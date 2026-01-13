/**
 * EmotiveMascot3D Tests
 * Unit tests for the main 3D mascot class API
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock Three.js and WebGL dependencies before importing EmotiveMascot3D
vi.mock('../../../src/3d/Core3DManager.js', () => ({
    Core3DManager: vi.fn().mockImplementation(() => ({
        waitUntilReady: vi.fn().mockResolvedValue(),
        render: vi.fn(),
        setEmotion: vi.fn(),
        playGesture: vi.fn(),
        morphToShape: vi.fn(),
        isMorphing: vi.fn().mockReturnValue(false),
        getMorphState: vi.fn().mockReturnValue(null),
        growIn: vi.fn(),
        setCoreGlowEnabled: vi.fn(),
        coreGlowEnabled: true,
        setRhythmEnabled: vi.fn(),
        setGrooveEnabled: vi.fn(),
        setBeatSyncStrength: vi.fn(),
        setGrooveConfig: vi.fn(),
        setGroove: vi.fn(),
        getGroovePresets: vi.fn().mockReturnValue(['groove1', 'groove2', 'groove3']),
        getCurrentGroove: vi.fn().mockReturnValue('groove1'),
        startRhythm: vi.fn(),
        stopRhythm: vi.fn(),
        setRhythmBPM: vi.fn(),
        setRhythmPattern: vi.fn(),
        isRhythmPlaying: vi.fn().mockReturnValue(false),
        getRhythmBPM: vi.fn().mockReturnValue(120),
        breathePhase: vi.fn(),
        stopBreathingPhase: vi.fn(),
        setWobbleEnabled: vi.fn(),
        setMaterialVariant: vi.fn(),
        destroy: vi.fn(),
        emotion: 'neutral',
        geometryType: 'crystal',
        glowColor: [1, 1, 1],
        rhythm3DAdapter: {
            setGrooveConfidence: vi.fn(),
            grooveConfidence: 1.0
        }
    }))
}));

vi.mock('../../../src/3d/CanvasLayerManager.js', () => ({
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

vi.mock('../../../src/3d/animation/DanceChoreographer.js', () => ({
    DanceChoreographer: vi.fn().mockImplementation(() => ({
        setRhythmAdapter: vi.fn(),
        setMascot: vi.fn(),
        update: vi.fn(),
        enable: vi.fn(),
        disable: vi.fn(),
        enabled: false,
        setIntensity: vi.fn(),
        getIntensity: vi.fn().mockReturnValue(0.5),
        getStatus: vi.fn().mockReturnValue({ enabled: false }),
        destroy: vi.fn()
    }))
}));

// Import after mocks are set up
import { EmotiveMascot3D } from '../../../src/3d/index.js';

describe('EmotiveMascot3D', () => {
    let mascot;
    let container;

    beforeEach(() => {
        // Create DOM container
        container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);

        // Create mascot instance
        mascot = new EmotiveMascot3D({
            canvasId: 'test-canvas',
            coreGeometry: 'crystal',
            defaultEmotion: 'neutral'
        });
    });

    afterEach(() => {
        if (mascot) {
            mascot.destroy();
            mascot = null;
        }
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    });

    describe('Constructor', () => {
        it('should create instance with default config', () => {
            const m = new EmotiveMascot3D();
            expect(m).toBeDefined();
            expect(m.config.canvasId).toBe('emotive-canvas');
            expect(m.config.coreGeometry).toBe('sphere');
            expect(m.config.targetFPS).toBe(60);
            expect(m.config.enableParticles).toBe(true);
            expect(m.config.defaultEmotion).toBe('neutral');
        });

        it('should create instance with custom config', () => {
            const m = new EmotiveMascot3D({
                canvasId: 'custom-canvas',
                coreGeometry: 'moon',
                targetFPS: 30,
                enableParticles: false,
                defaultEmotion: 'joy'
            });
            expect(m.config.canvasId).toBe('custom-canvas');
            expect(m.config.coreGeometry).toBe('moon');
            expect(m.config.targetFPS).toBe(30);
            expect(m.config.enableParticles).toBe(false);
            expect(m.config.defaultEmotion).toBe('joy');
        });

        it('should initialize with neutral emotion', () => {
            expect(mascot.emotion).toBe('neutral');
            expect(mascot.undertone).toBe(null);
        });

        it('should not be running initially', () => {
            expect(mascot.isRunning).toBe(false);
        });
    });

    describe('init()', () => {
        it('should initialize successfully with container', () => {
            expect(() => mascot.init(container)).not.toThrow();
            expect(mascot.container).toBeDefined();
        });

        it('should return this for chaining', () => {
            const result = mascot.init(container);
            expect(result).toBe(mascot);
        });

        it('should throw in SSR environment', () => {
            // Temporarily mock window as undefined
            const originalWindow = global.window;
            delete global.window;

            const m = new EmotiveMascot3D();
            expect(() => m.init(container)).toThrow(/browser environment/);

            global.window = originalWindow;
        });
    });

    describe('setEmotion()', () => {
        beforeEach(() => {
            mascot.init(container);
        });

        it('should set emotion and return this for chaining', () => {
            const result = mascot.setEmotion('joy');
            expect(mascot.emotion).toBe('joy');
            expect(result).toBe(mascot);
        });

        it('should handle undertone as string', () => {
            mascot.setEmotion('joy', 'excitement');
            expect(mascot.emotion).toBe('joy');
            expect(mascot.undertone).toBe('excitement');
        });

        it('should handle undertone as options object', () => {
            mascot.setEmotion('joy', { undertone: 'calm' });
            expect(mascot.emotion).toBe('joy');
            expect(mascot.undertone).toBe('calm');
        });

        it('should handle duration as number (2D API compatibility)', () => {
            mascot.setEmotion('joy', 'existing');
            mascot.setEmotion('calm', 500);
            expect(mascot.emotion).toBe('calm');
            expect(mascot.undertone).toBe('existing'); // Keeps existing undertone
        });

        it('should clear undertone when passed null', () => {
            mascot.setEmotion('joy', 'excitement');
            mascot.setEmotion('calm', null);
            expect(mascot.undertone).toBe(null);
        });

        it('should warn on invalid emotion parameter', () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            mascot.setEmotion(null);
            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('Invalid emotion')
            );

            mascot.setEmotion(123);
            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('Invalid emotion')
            );

            warnSpy.mockRestore();
        });

        it('should warn on unknown emotion but still set it', () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            mascot.setEmotion('nonexistent');
            expect(mascot.emotion).toBe('nonexistent');
            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('Unknown emotion')
            );

            warnSpy.mockRestore();
        });

        it('should emit emotion:change event', () => {
            const handler = vi.fn();
            mascot.eventManager.on('emotion:change', handler);

            mascot.setEmotion('joy', 'excitement');

            expect(handler).toHaveBeenCalledWith({
                emotion: 'joy',
                undertone: 'excitement'
            });
        });

        it('should return this after destroy (not throw)', () => {
            mascot.destroy();
            const result = mascot.setEmotion('joy');
            expect(result).toBe(mascot);
        });
    });

    describe('express()', () => {
        beforeEach(() => {
            mascot.init(container);
        });

        it('should return this for chaining', () => {
            const result = mascot.express('bounce');
            expect(result).toBe(mascot);
        });

        it('should warn on invalid gesture parameter', () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            mascot.express(null);
            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('Invalid gesture')
            );

            mascot.express(123);
            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('Invalid gesture')
            );

            warnSpy.mockRestore();
        });

        it('should emit gesture:trigger event', () => {
            const handler = vi.fn();
            mascot.eventManager.on('gesture:trigger', handler);

            mascot.express('bounce');

            expect(handler).toHaveBeenCalledWith({ gesture: 'bounce' });
        });

        it('should return this after destroy (not throw)', () => {
            mascot.destroy();
            const result = mascot.express('bounce');
            expect(result).toBe(mascot);
        });
    });

    describe('morphTo()', () => {
        beforeEach(() => {
            mascot.init(container);
        });

        it('should return this for chaining', () => {
            const result = mascot.morphTo('heart');
            expect(result).toBe(mascot);
        });

        it('should warn on invalid shape parameter', () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            mascot.morphTo(null);
            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('Invalid shape')
            );

            mascot.morphTo(123);
            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('Invalid shape')
            );

            warnSpy.mockRestore();
        });

        it('should warn on unknown geometry but still proceed', () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            mascot.morphTo('nonexistent');
            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('Unknown geometry')
            );

            warnSpy.mockRestore();
        });

        it('should accept valid geometries without warning', () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            ['sphere', 'crystal', 'diamond', 'heart', 'star', 'moon', 'sun'].forEach(geo => {
                warnSpy.mockClear();
                mascot.morphTo(geo);
                expect(warnSpy).not.toHaveBeenCalled();
            });

            warnSpy.mockRestore();
        });

        it('should emit shape:morph event', () => {
            const handler = vi.fn();
            mascot.eventManager.on('shape:morph', handler);

            mascot.morphTo('heart');

            expect(handler).toHaveBeenCalledWith({ shape: 'heart' });
        });

        it('should return this after destroy (not throw)', () => {
            mascot.destroy();
            const result = mascot.morphTo('heart');
            expect(result).toBe(mascot);
        });
    });

    describe('feel()', () => {
        beforeEach(() => {
            mascot.init(container);
        });

        it('should parse and apply emotion from natural language', () => {
            const result = mascot.feel('happy');
            expect(result.success).toBe(true);
            expect(result.parsed).toBeDefined();
        });

        it('should parse emotion with gesture', () => {
            const result = mascot.feel('happy, bouncing');
            expect(result.success).toBe(true);
        });

        it('should return error for destroyed engine', () => {
            mascot.destroy();
            const result = mascot.feel('happy');
            expect(result.success).toBe(false);
            expect(result.error).toBe('Engine destroyed');
        });

        it('should rate limit excessive calls', () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            // Make 10 calls quickly (the limit)
            for (let i = 0; i < 10; i++) {
                mascot.feel('happy');
            }

            // 11th call should be rate limited
            const result = mascot.feel('happy');
            expect(result.success).toBe(false);
            expect(result.error).toBe('Rate limit exceeded');
            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('Rate limit exceeded')
            );

            warnSpy.mockRestore();
        });
    });

    describe('updateUndertone()', () => {
        beforeEach(() => {
            mascot.init(container);
        });

        it('should update undertone and return this', () => {
            const result = mascot.updateUndertone('nervous');
            expect(mascot.undertone).toBe('nervous');
            expect(result).toBe(mascot);
        });

        it('should emit undertone:change event', () => {
            const handler = vi.fn();
            mascot.eventManager.on('undertone:change', handler);

            mascot.updateUndertone('nervous');

            expect(handler).toHaveBeenCalledWith({ undertone: 'nervous' });
        });

        it('should return this after destroy (not throw)', () => {
            mascot.destroy();
            const result = mascot.updateUndertone('nervous');
            expect(result).toBe(mascot);
        });
    });

    describe('setPosition()', () => {
        beforeEach(() => {
            mascot.init(container);
        });

        it('should set position and return this', () => {
            const result = mascot.setPosition(100, 50, 0);
            expect(mascot.getPosition()).toEqual({ x: 100, y: 50, z: 0 });
            expect(result).toBe(mascot);
        });

        it('should emit position:change event with previous value', () => {
            const handler = vi.fn();
            mascot.eventManager.on('position:change', handler);

            mascot.setPosition(0, 0, 0);
            mascot.setPosition(100, 50, 0);

            expect(handler).toHaveBeenLastCalledWith({
                x: 100,
                y: 50,
                z: 0,
                previous: { x: 0, y: 0, z: 0 }
            });
        });
    });

    describe('setContainment()', () => {
        beforeEach(() => {
            mascot.init(container);
            // Clear particle system to avoid mock issues (3D uses WebGL particles, not 2D)
            mascot.particleSystem = null;
        });

        it('should set containment and return this', () => {
            const result = mascot.setContainment({ width: 200, height: 200 }, 0.5);
            expect(result).toBe(mascot);
        });

        it('should emit scale:change event when scale changes', () => {
            const handler = vi.fn();
            mascot.eventManager.on('scale:change', handler);

            mascot.setContainment({ width: 200, height: 200 }, 0.5);

            expect(handler).toHaveBeenCalledWith({
                scale: 0.5,
                previous: 1
            });
        });

        it('should not emit scale:change event when scale unchanged', () => {
            const handler = vi.fn();
            mascot.setContainment(null, 1); // Set initial scale

            mascot.eventManager.on('scale:change', handler);
            mascot.setContainment({ width: 200, height: 200 }, 1); // Same scale

            expect(handler).not.toHaveBeenCalled();
        });
    });

    describe('getAvailable* helpers', () => {
        it('should return array of available emotions', () => {
            const emotions = mascot.getAvailableEmotions();
            expect(Array.isArray(emotions)).toBe(true);
            expect(emotions.length).toBeGreaterThan(0);
            expect(emotions).toContain('joy');
            expect(emotions).toContain('neutral');
        });

        it('should return array of available gestures', () => {
            const gestures = mascot.getAvailableGestures();
            expect(Array.isArray(gestures)).toBe(true);
            expect(gestures.length).toBeGreaterThan(0);
        });

        it('should return array of available geometries', () => {
            const geometries = mascot.getAvailableGeometries();
            expect(Array.isArray(geometries)).toBe(true);
            expect(geometries).toContain('crystal');
            expect(geometries).toContain('sphere');
            expect(geometries).toContain('moon');
            expect(geometries).toContain('sun');
            expect(geometries).toContain('heart');
        });
    });

    describe('Lifecycle', () => {
        beforeEach(() => {
            mascot.init(container);
        });

        it('should start animation loop', async () => {
            await mascot.start();
            expect(mascot.isRunning).toBe(true);
        });

        it('should stop animation loop', async () => {
            await mascot.start();
            mascot.stop();
            expect(mascot.isRunning).toBe(false);
        });

        it('should not start twice', async () => {
            await mascot.start();
            await mascot.start();
            expect(mascot.isRunning).toBe(true);
        });

        it('should destroy cleanly', () => {
            expect(() => mascot.destroy()).not.toThrow();
            expect(mascot._destroyed).toBe(true);
        });

        it('should handle destroy without init', () => {
            const m = new EmotiveMascot3D();
            expect(() => m.destroy()).not.toThrow();
        });
    });

    describe('Deprecated Methods', () => {
        beforeEach(() => {
            mascot.init(container);
        });

        it('should warn when using setGeometry()', () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            mascot.setGeometry('heart');

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('setGeometry() is deprecated')
            );

            warnSpy.mockRestore();
        });

        it('should setGeometry() still work (calls morphTo)', () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const handler = vi.fn();
            mascot.eventManager.on('shape:morph', handler);

            mascot.setGeometry('heart');

            expect(handler).toHaveBeenCalledWith({ shape: 'heart' });

            warnSpy.mockRestore();
        });
    });

    describe('Method Chaining', () => {
        beforeEach(() => {
            mascot.init(container);
        });

        it('should support full method chaining', () => {
            expect(() => {
                mascot
                    .setEmotion('joy')
                    .express('bounce')
                    .morphTo('heart')
                    .setPosition(100, 100)
                    .updateUndertone('excitement');
            }).not.toThrow();
        });
    });

    describe('Post-Destroy Behavior', () => {
        beforeEach(() => {
            mascot.init(container);
            mascot.destroy();
        });

        it('should not throw when calling setEmotion after destroy', () => {
            expect(() => mascot.setEmotion('joy')).not.toThrow();
        });

        it('should not throw when calling express after destroy', () => {
            expect(() => mascot.express('bounce')).not.toThrow();
        });

        it('should not throw when calling morphTo after destroy', () => {
            expect(() => mascot.morphTo('heart')).not.toThrow();
        });

        it('should return error from feel after destroy', () => {
            const result = mascot.feel('happy');
            expect(result.success).toBe(false);
            expect(result.error).toBe('Engine destroyed');
        });
    });
});
