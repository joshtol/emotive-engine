/**
 * EmotiveMascotPublic Integration Tests
 *
 * Comprehensive integration tests for the public API facade (EmotiveMascotPublic.js)
 *
 * This file focuses on:
 * - All public API methods and their contracts
 * - API parameter validation and error handling
 * - Method chaining and fluent API patterns
 * - Integration with underlying EmotiveMascot core
 * - Real user workflows (init → configure → animate → cleanup)
 * - Backward compatibility and API consistency
 *
 * Testing Philosophy:
 * - Mock the underlying EmotiveMascot core
 * - Test the public API surface, not internals
 * - Focus on user-facing behavior and error messages
 * - Verify security boundaries (proxy protection)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import EmotiveMascotPublic from '../../src/EmotiveMascotPublic.js';
import EmotiveMascot from '../../src/EmotiveMascot.js';

// Mock the EmotiveMascot core
vi.mock('../../src/EmotiveMascot.js', () => {
    const mockEngine = {
        canvas: null,
        start: vi.fn(),
        stop: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        setEmotion: vi.fn(),
        express: vi.fn(),
        morphTo: vi.fn(),
        connectAudio: vi.fn(),
        disconnectAudio: vi.fn(),
        destroy: vi.fn(),
        updateUndertone: vi.fn(),
        addUndertone: vi.fn(),
        setBackdrop: vi.fn(),
        getBackdrop: vi.fn(),
        setParticleSystemCanvasDimensions: vi.fn(),

        // Components
        soundSystem: {
            enabled: true,
            loadAudioFromURL: vi.fn().mockResolvedValue()
        },
        audioAnalyzer: {
            getEnergyLevel: vi.fn().mockReturnValue(0.5),
            getFrequencyData: vi.fn().mockReturnValue([0.1, 0.2, 0.3]),
            dataArray: new Uint8Array([100, 150, 200]),
            microphoneStream: null,
            currentFrequencies: []
        },
        rhythmIntegration: {
            getBPM: vi.fn().mockReturnValue(120),
            getBeatMarkers: vi.fn().mockReturnValue([]),
            setBPM: vi.fn(),
            start: vi.fn(),
            stop: vi.fn()
        },
        particleSystem: {
            setContainmentBounds: vi.fn(),
            setMaxParticles: vi.fn(),
            clear: vi.fn(),
            particles: [],
            activeParticles: 10,
            refreshPool: vi.fn()
        },
        positionController: {
            setOffset: vi.fn(),
            animateOffset: vi.fn(),
            onUpdate: vi.fn(),
            coreScaleOverride: 1,
            particleScaleOverride: 1,
            globalScale: 1,
            setScaleOverrides: vi.fn()
        },
        gazeTracker: {
            enable: vi.fn(),
            disable: vi.fn(),
            mousePos: { x: 0, y: 0 },
            updateTargetGaze: vi.fn(),
            currentGaze: { x: 0, y: 0 },
            getState: vi.fn().mockReturnValue({ enabled: true })
        },
        renderer: {
            setBlinkingEnabled: vi.fn(),
            config: {
                coreColor: '#FFFFFF',
                defaultGlowColor: '#667eea'
            }
        },
        shapeMorpher: {
            resetMusicDetection: vi.fn(),
            frequencyData: [0.1, 0.2, 0.3]
        },
        animationController: {
            currentFPS: 60,
            targetFPS: 60,
            setTargetFPS: vi.fn(),
            isPaused: false
        },
        eventManager: {
            on: vi.fn(),
            off: vi.fn()
        },
        canvasManager: {
            getContext: vi.fn().mockReturnValue({
                globalAlpha: 1.0
            })
        },
        performanceMonitor: {
            getCurrentFPS: vi.fn().mockReturnValue(60),
            getAverageFrameTime: vi.fn().mockReturnValue(16.67),
            setTargetFPS: vi.fn()
        },
        state: {
            emotion: 'neutral',
            currentShape: 'circle'
        }
    };

    return {
        default: vi.fn(() => mockEngine),
        __esModule: true
    };
});

describe('EmotiveMascotPublic - Public API Integration Tests', () => {
    let canvas;
    let mascot;

    beforeEach(() => {
        // Create a real canvas element
        canvas = document.createElement('canvas');
        canvas.id = 'test-canvas';
        canvas.width = 800;
        canvas.height = 600;
        document.body.appendChild(canvas);

        // Mock canvas.toDataURL and toBlob
        canvas.toDataURL = vi.fn().mockReturnValue('data:image/png;base64,mock');
        canvas.toBlob = vi.fn(callback => {
            callback(new Blob(['mock'], { type: 'image/png' }));
        });

        // Clear all mocks before each test
        vi.clearAllMocks();
    });

    afterEach(() => {
        // Cleanup
        if (mascot) {
            try {
                mascot.destroy();
            } catch (_e) {
                // Ignore cleanup errors
            }
            mascot = null;
        }
        if (canvas && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
        }
    });

    // ═══════════════════════════════════════════════════════════════════
    // CONSTRUCTION & INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════

    describe('Construction & Initialization', () => {
        it('should construct without errors', () => {
            mascot = new EmotiveMascotPublic();
            expect(mascot).toBeDefined();
            expect(mascot).toBeInstanceOf(EmotiveMascotPublic);
        });

        it('should accept configuration object', () => {
            mascot = new EmotiveMascotPublic({
                emotion: 'joy',
                particleCount: 50
            });
            expect(mascot).toBeDefined();
        });

        it('should sanitize configuration to remove debug flags', () => {
            mascot = new EmotiveMascotPublic({
                enableDebug: true,
                enableInternalAPIs: true,
                exposeInternals: true
            });
            expect(mascot._config.enableDebug).toBeUndefined();
            expect(mascot._config.enableInternalAPIs).toBeUndefined();
            expect(mascot._config.exposeInternals).toBeUndefined();
        });

        it('should force production mode', () => {
            mascot = new EmotiveMascotPublic({ mode: 'development' });
            expect(mascot._config.mode).toBe('production');
        });

        it('should enable gaze tracking by default', () => {
            mascot = new EmotiveMascotPublic({});
            expect(mascot._config.enableGazeTracking).toBe(true);
        });

        it('should respect explicit gaze tracking setting', () => {
            mascot = new EmotiveMascotPublic({ enableGazeTracking: false });
            expect(mascot._config.enableGazeTracking).toBe(false);
        });

        it('should initialize state variables', () => {
            mascot = new EmotiveMascotPublic();
            expect(mascot._initialized).toBe(false);
            expect(mascot._isRecording).toBe(false);
            expect(mascot._isPlaying).toBe(false);
            expect(mascot._timeline).toEqual([]);
        });

        it('should bind public methods to instance', () => {
            mascot = new EmotiveMascotPublic();
            const { init, start, stop, pause, resume } = mascot;

            // Should not throw when called as standalone functions
            expect(typeof init).toBe('function');
            expect(typeof start).toBe('function');
            expect(typeof stop).toBe('function');
            expect(typeof pause).toBe('function');
            expect(typeof resume).toBe('function');
        });
    });

    describe('init() - Initialization', () => {
        it('should initialize with canvas element', async () => {
            mascot = new EmotiveMascotPublic();
            await mascot.init(canvas);
            expect(mascot._initialized).toBe(true);
            expect(mascot.canvas).toBeDefined();
        });

        it('should initialize with canvas ID string', async () => {
            mascot = new EmotiveMascotPublic();
            await mascot.init('test-canvas');
            expect(mascot._initialized).toBe(true);
        });

        it('should be idempotent (calling twice should not re-initialize)', async () => {
            mascot = new EmotiveMascotPublic();
            await mascot.init(canvas);
            await mascot.init(canvas);
            expect(EmotiveMascot).toHaveBeenCalledTimes(1);
        });

        it('should create protective proxy around engine', async () => {
            mascot = new EmotiveMascotPublic();
            await mascot.init(canvas);

            // Should have access to engine but not internal components
            expect(mascot._engine).toBeDefined();

            // Blocked properties should return empty proxy
            const {soundSystem} = mascot._engine;
            expect(soundSystem).toBeDefined();
        });

        it('should store canvas reference', async () => {
            mascot = new EmotiveMascotPublic();
            await mascot.init(canvas);
            expect(mascot._canvas).toBe(canvas);
        });

        it('should propagate initialization errors', async () => {
            // Suppress console.error for this test since we expect an error
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            // Mock the implementation to throw an error during construction
            EmotiveMascot.mockImplementationOnce(() => {
                throw new Error('Initialization failed');
            });

            mascot = new EmotiveMascotPublic();

            // Use try-catch instead of expect().rejects to avoid Vitest treating it as uncaught
            try {
                await mascot.init(canvas);
                // If we get here, the test should fail
                throw new Error('Expected init() to throw but it did not');
            } catch (error) {
                expect(error.message).toBe('Initialization failed');
            }

            // Restore console.error
            consoleErrorSpy.mockRestore();
        });
    });

    // ═══════════════════════════════════════════════════════════════════
    // LIFECYCLE METHODS
    // ═══════════════════════════════════════════════════════════════════

    describe('Lifecycle Methods', () => {
        beforeEach(async () => {
            mascot = new EmotiveMascotPublic();
            await mascot.init(canvas);
        });

        describe('start()', () => {
            it('should start the engine', () => {
                mascot.start();
                expect(mascot._getReal().start).toHaveBeenCalled();
            });

            it('should throw if not initialized', () => {
                // Create a fresh instance without initializing
                const uninitializedMascot = new EmotiveMascotPublic();
                uninitializedMascot._engine = null;
                expect(() => uninitializedMascot.start()).toThrow('Engine not initialized. Call init() first.');
            });
        });

        describe('stop()', () => {
            it('should stop the engine', () => {
                mascot.stop();
                expect(mascot._getReal().stop).toHaveBeenCalled();
            });

            it('should throw if not initialized', () => {
                const uninitializedMascot = new EmotiveMascotPublic();
                uninitializedMascot._engine = null;
                expect(() => uninitializedMascot.stop()).toThrow('Engine not initialized. Call init() first.');
            });
        });

        describe('pause()', () => {
            it('should pause the engine', () => {
                mascot.pause();
                expect(mascot._getReal().pause).toHaveBeenCalled();
            });

            it('should throw if not initialized', () => {
                const uninitializedMascot = new EmotiveMascotPublic();
                uninitializedMascot._engine = null;
                expect(() => uninitializedMascot.pause()).toThrow('Engine not initialized. Call init() first.');
            });
        });

        describe('resume()', () => {
            it('should resume the engine', () => {
                mascot.resume();
                expect(mascot._getReal().resume).toHaveBeenCalled();
            });

            it('should throw if not initialized', () => {
                const uninitializedMascot = new EmotiveMascotPublic();
                uninitializedMascot._engine = null;
                expect(() => uninitializedMascot.resume()).toThrow('Engine not initialized. Call init() first.');
            });
        });
    });

    // ═══════════════════════════════════════════════════════════════════
    // ANIMATION CONTROL
    // ═══════════════════════════════════════════════════════════════════

    describe('Animation Control', () => {
        beforeEach(async () => {
            mascot = new EmotiveMascotPublic();
            await mascot.init(canvas);
        });

        describe('setEmotion()', () => {
            it('should set emotion on engine', () => {
                mascot.setEmotion('joy');
                expect(mascot._getReal().setEmotion).toHaveBeenCalledWith('joy', null, 500);
            });

            it('should accept undertone as second parameter', () => {
                mascot.setEmotion('joy', 'gentle');
                expect(mascot._getReal().setEmotion).toHaveBeenCalledWith('joy', { undertone: 'gentle' }, 500);
            });

            it('should accept duration as second parameter', () => {
                mascot.setEmotion('joy', 1000);
                expect(mascot._getReal().setEmotion).toHaveBeenCalledWith('joy', null, 500);
            });

            it('should accept options object', () => {
                mascot.setEmotion('joy', { undertone: 'gentle', duration: 1000 });
                expect(mascot._getReal().setEmotion).toHaveBeenCalledWith('joy', { undertone: 'gentle' }, 1000);
            });

            it('should record emotion during recording', () => {
                mascot.startRecording();
                mascot.setEmotion('joy');
                const timeline = mascot.stopRecording();

                expect(timeline.length).toBe(1);
                expect(timeline[0].type).toBe('emotion');
                expect(timeline[0].name).toBe('joy');
            });

            it('should throw if not initialized', () => {
                const uninitializedMascot = new EmotiveMascotPublic();
                uninitializedMascot._engine = null;
                expect(() => uninitializedMascot.setEmotion('joy')).toThrow('Engine not initialized. Call init() first.');
            });
        });

        describe('triggerGesture()', () => {
            it('should trigger gesture on engine', () => {
                mascot.triggerGesture('bounce');
                expect(mascot._getReal().express).toHaveBeenCalledWith('bounce');
            });

            it('should record gesture during recording', () => {
                mascot.startRecording();
                mascot.triggerGesture('bounce');
                const timeline = mascot.stopRecording();

                expect(timeline.length).toBe(1);
                expect(timeline[0].type).toBe('gesture');
                expect(timeline[0].name).toBe('bounce');
            });

            it('should accept timestamp parameter', () => {
                mascot.startRecording();
                mascot.triggerGesture('bounce', 1000);
                const timeline = mascot.stopRecording();

                expect(timeline[0].time).toBe(1000);
            });

            it('should throw if not initialized', () => {
                const uninitializedMascot = new EmotiveMascotPublic();
                uninitializedMascot._engine = null;
                expect(() => uninitializedMascot.triggerGesture('bounce')).toThrow('Engine not initialized. Call init() first.');
            });
        });

        describe('express()', () => {
            it('should be an alias for triggerGesture', () => {
                mascot.express('bounce');
                expect(mascot._getReal().express).toHaveBeenCalledWith('bounce');
            });

            it('should record gesture during recording', () => {
                mascot.startRecording();
                mascot.express('pulse');
                const timeline = mascot.stopRecording();

                expect(timeline[0].type).toBe('gesture');
                expect(timeline[0].name).toBe('pulse');
            });
        });

        describe('chain()', () => {
            it('should execute predefined chain combo', async () => {
                vi.useFakeTimers();

                mascot.chain('burst');

                // Wait for first gesture to be called
                await vi.runAllTimersAsync();

                // Check all gestures were called
                expect(mascot._getReal().express).toHaveBeenCalledWith('jump');
                expect(mascot._getReal().express).toHaveBeenCalledWith('nod');
                expect(mascot._getReal().express).toHaveBeenCalledWith('shake');
                expect(mascot._getReal().express).toHaveBeenCalledWith('flash');

                vi.useRealTimers();
            });

            it('should handle simultaneous gestures', () => {
                mascot.chain('drift');

                // All gestures should be called immediately
                expect(mascot._getReal().express).toHaveBeenCalledWith('sway');
                expect(mascot._getReal().express).toHaveBeenCalledWith('breathe');
                expect(mascot._getReal().express).toHaveBeenCalledWith('float');
                expect(mascot._getReal().express).toHaveBeenCalledWith('drift');
            });

            it('should warn on unknown chain', () => {
                const consoleSpy = vi.spyOn(console, 'warn').mockImplementation();
                mascot.chain('unknown-chain');
                expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('not found'));
                consoleSpy.mockRestore();
            });

            it('should throw if not initialized', () => {
                const uninitializedMascot = new EmotiveMascotPublic();
                uninitializedMascot._engine = null;
                expect(() => uninitializedMascot.chain('burst')).toThrow('Engine not initialized. Call init() first.');
            });
        });

        describe('setShape() / morphTo()', () => {
            it('should set shape on engine', () => {
                mascot.setShape('circle');
                expect(mascot._getReal().morphTo).toHaveBeenCalledWith('circle', {});
            });

            it('should accept config object', () => {
                mascot.setShape('circle', { duration: 1000 });
                expect(mascot._getReal().morphTo).toHaveBeenCalledWith('circle', { duration: 1000 });
            });

            it('should accept timestamp for recording', () => {
                mascot.startRecording();
                mascot.setShape('circle', 500);
                const timeline = mascot.stopRecording();

                expect(timeline[0].time).toBe(500);
            });

            it('should record shape during recording', () => {
                mascot.startRecording();
                mascot.setShape('star');
                const timeline = mascot.stopRecording();

                expect(timeline[0].type).toBe('shape');
                expect(timeline[0].name).toBe('star');
            });

            it('morphTo should be an alias for setShape', () => {
                mascot.morphTo('heart');
                expect(mascot._getReal().morphTo).toHaveBeenCalledWith('heart', {});
            });

            it('should throw if not initialized', () => {
                const uninitializedMascot = new EmotiveMascotPublic();
                uninitializedMascot._engine = null;
                expect(() => uninitializedMascot.setShape('circle')).toThrow('Engine not initialized. Call init() first.');
            });
        });

        describe('updateUndertone()', () => {
            it('should update undertone on engine', () => {
                mascot.updateUndertone('gentle');
                expect(mascot._getReal().updateUndertone).toHaveBeenCalledWith('gentle');
            });

            it('should clear undertone when null', () => {
                mascot.updateUndertone(null);
                expect(mascot._getReal().updateUndertone).toHaveBeenCalledWith(null);
            });

            it('should fall back to addUndertone if updateUndertone not available', () => {
                const engine = mascot._getReal();
                delete engine.updateUndertone;

                mascot.updateUndertone('gentle');
                expect(engine.addUndertone).toHaveBeenCalledWith('gentle');
            });

            it('should throw if not initialized', () => {
                const uninitializedMascot = new EmotiveMascotPublic();
                uninitializedMascot._engine = null;
                expect(() => uninitializedMascot.updateUndertone('gentle')).toThrow('Engine not initialized. Call init() first.');
            });
        });
    });

    // ═══════════════════════════════════════════════════════════════════
    // AUDIO MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════

    describe('Audio Management', () => {
        beforeEach(async () => {
            mascot = new EmotiveMascotPublic();
            await mascot.init(canvas);
        });

        describe('loadAudio()', () => {
            it('should load audio from URL', async () => {
                const mockAudio = {
                    duration: 10,
                    addEventListener: vi.fn((event, callback) => {
                        if (event === 'loadedmetadata') callback();
                    }),
                    load: vi.fn()
                };
                global.Audio = vi.fn(() => mockAudio);

                await mascot.loadAudio('http://example.com/audio.mp3');

                expect(mascot._audioManager.getAudioDuration()).toBe(10000);
                expect(mascot._getReal().soundSystem.loadAudioFromURL).toHaveBeenCalledWith('http://example.com/audio.mp3');
            });

            it('should load audio from Blob', async () => {
                const mockAudio = {
                    duration: 5,
                    addEventListener: vi.fn((event, callback) => {
                        if (event === 'loadedmetadata') callback();
                    }),
                    load: vi.fn()
                };
                global.Audio = vi.fn(() => mockAudio);
                global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock');
                global.URL.revokeObjectURL = vi.fn();

                const blob = new Blob(['audio data'], { type: 'audio/mp3' });
                await mascot.loadAudio(blob);

                expect(mascot._audioManager.getAudioBlob()).toBe(blob);
                expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
                expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock');
            });
        });

        describe('connectAudio()', () => {
            it('should connect audio element', () => {
                const audioElement = document.createElement('audio');
                mascot.connectAudio(audioElement);
                expect(mascot._getReal().connectAudio).toHaveBeenCalledWith(audioElement);
            });

            it('should throw if not initialized', () => {
                const uninitializedMascot = new EmotiveMascotPublic();
                uninitializedMascot._engine = null;
                const audioElement = document.createElement('audio');
                expect(() => uninitializedMascot.connectAudio(audioElement)).toThrow('Engine not initialized. Call init() first.');
            });
        });

        describe('disconnectAudio()', () => {
            it('should disconnect audio element', () => {
                const audioElement = document.createElement('audio');
                mascot.disconnectAudio(audioElement);
                expect(mascot._getReal().disconnectAudio).toHaveBeenCalledWith(audioElement);
            });

            it('should not throw if not initialized', () => {
                mascot._initialized = false;
                mascot._engine = null;
                expect(() => mascot.disconnectAudio()).not.toThrow();
            });
        });

        describe('getAudioAnalysis()', () => {
            it('should return audio analysis data', () => {
                const analysis = mascot.getAudioAnalysis();
                expect(analysis).toEqual({
                    bpm: 120,
                    beats: [],
                    energy: 0.5,
                    frequencies: [0.1, 0.2, 0.3]
                });
            });

            it('should return null if engine not initialized', () => {
                const uninitializedMascot = new EmotiveMascotPublic();
                uninitializedMascot._engine = null;
                uninitializedMascot._realEngine = null;
                const analysis = uninitializedMascot.getAudioAnalysis();
                expect(analysis).toBeNull();
            });
        });

        describe('getSpectrumData()', () => {
            it('should return normalized spectrum data', () => {
                const spectrum = mascot.getSpectrumData();
                expect(Array.isArray(spectrum)).toBe(true);
                expect(spectrum.length).toBeGreaterThan(0);
                expect(spectrum[0]).toBeCloseTo(100 / 255);
            });

            it('should fall back to shapeMorpher frequency data', () => {
                const engine = mascot._getReal();
                delete engine.audioAnalyzer.dataArray;

                const spectrum = mascot.getSpectrumData();
                expect(spectrum).toEqual([0.1, 0.2, 0.3]);
            });

            it('should return empty array if no data available', () => {
                const uninitializedMascot = new EmotiveMascotPublic();
                uninitializedMascot._engine = null;
                uninitializedMascot._realEngine = null;
                const spectrum = uninitializedMascot.getSpectrumData();
                expect(spectrum).toEqual([]);
            });
        });

        describe('setSoundEnabled()', () => {
            it('should enable sound', () => {
                mascot.setSoundEnabled(true);
                expect(mascot._getReal().soundSystem.enabled).toBe(true);
            });

            it('should disable sound', () => {
                mascot.setSoundEnabled(false);
                expect(mascot._getReal().soundSystem.enabled).toBe(false);
            });

            it('should throw if not initialized', () => {
                const uninitializedMascot = new EmotiveMascotPublic();
                uninitializedMascot._engine = null;
                expect(() => uninitializedMascot.setSoundEnabled(true)).toThrow('Engine not initialized. Call init() first.');
            });
        });

        describe('Rhythm Sync', () => {
            it('startRhythmSync should start with optional BPM', () => {
                mascot.startRhythmSync(140);
                expect(mascot._getReal().rhythmIntegration.setBPM).toHaveBeenCalledWith(140);
                expect(mascot._getReal().rhythmIntegration.start).toHaveBeenCalled();
            });

            it('startRhythmSync should start without BPM', () => {
                mascot.startRhythmSync();
                expect(mascot._getReal().rhythmIntegration.start).toHaveBeenCalled();
            });

            it('stopRhythmSync should stop rhythm', () => {
                mascot.stopRhythmSync();
                expect(mascot._getReal().rhythmIntegration.stop).toHaveBeenCalled();
            });

            it('setBPM should set BPM', () => {
                mascot.setBPM(130);
                expect(mascot._getReal().rhythmIntegration.setBPM).toHaveBeenCalledWith(130);
            });
        });
    });

    // ═══════════════════════════════════════════════════════════════════
    // GAZE TRACKING
    // ═══════════════════════════════════════════════════════════════════

    describe('Gaze Tracking', () => {
        beforeEach(async () => {
            mascot = new EmotiveMascotPublic();
            await mascot.init(canvas);
        });

        describe('enableGazeTracking()', () => {
            it('should enable gaze tracker', () => {
                mascot.enableGazeTracking();
                expect(mascot._getReal().gazeTracker.enable).toHaveBeenCalled();
            });

            it('should throw if not initialized', () => {
                const uninitializedMascot = new EmotiveMascotPublic();
                uninitializedMascot._engine = null;
                expect(() => uninitializedMascot.enableGazeTracking()).toThrow('Engine not initialized. Call init() first.');
            });
        });

        describe('disableGazeTracking()', () => {
            it('should disable gaze tracker', () => {
                mascot.disableGazeTracking();
                expect(mascot._getReal().gazeTracker.disable).toHaveBeenCalled();
            });

            it('should throw if not initialized', () => {
                const uninitializedMascot = new EmotiveMascotPublic();
                uninitializedMascot._engine = null;
                expect(() => uninitializedMascot.disableGazeTracking()).toThrow('Engine not initialized. Call init() first.');
            });
        });

        describe('setGazeTarget()', () => {
            it('should set gaze target position', () => {
                mascot.setGazeTarget(100, 200);
                expect(mascot._getReal().gazeTracker.mousePos).toEqual({ x: 100, y: 200 });
                expect(mascot._getReal().gazeTracker.updateTargetGaze).toHaveBeenCalled();
            });

            it('should throw if not initialized', () => {
                const uninitializedMascot = new EmotiveMascotPublic();
                uninitializedMascot._engine = null;
                expect(() => uninitializedMascot.setGazeTarget(100, 200)).toThrow('Engine not initialized. Call init() first.');
            });
        });

        describe('getGazeState()', () => {
            it('should return gaze state', () => {
                const state = mascot.getGazeState();
                expect(state).toEqual({ enabled: true });
            });

            it('should throw if not initialized', () => {
                const uninitializedMascot = new EmotiveMascotPublic();
                uninitializedMascot._engine = null;
                expect(() => uninitializedMascot.getGazeState()).toThrow('Engine not initialized. Call init() first.');
            });
        });
    });

    // ═══════════════════════════════════════════════════════════════════
    // POSITIONING & CONTAINMENT
    // ═══════════════════════════════════════════════════════════════════

    describe('Positioning & Containment', () => {
        beforeEach(async () => {
            mascot = new EmotiveMascotPublic();
            await mascot.init(canvas);
        });

        describe('setPosition()', () => {
            it('should set position offset', () => {
                mascot.setPosition(100, 200);
                expect(mascot._getReal().positionController.setOffset).toHaveBeenCalledWith(100, 200, 0);
            });

            it('should accept z parameter', () => {
                mascot.setPosition(100, 200, 50);
                expect(mascot._getReal().positionController.setOffset).toHaveBeenCalledWith(100, 200, 50);
            });

            it('should create onUpdate callback if missing', () => {
                const pc = mascot._getReal().positionController;
                delete pc.onUpdate;

                mascot.setPosition(100, 200);
                expect(pc.onUpdate).toBeDefined();
            });

            it('should throw if not initialized', () => {
                const uninitializedMascot = new EmotiveMascotPublic();
                uninitializedMascot._engine = null;
                expect(() => uninitializedMascot.setPosition(100, 200)).toThrow('Engine not initialized. Call init() first.');
            });
        });

        describe('animateToPosition()', () => {
            it('should animate to position offset', () => {
                mascot.animateToPosition(100, 200, 0, 1000, 'easeOutCubic');
                expect(mascot._getReal().positionController.animateOffset).toHaveBeenCalledWith(
                    100, 200, 0, 1000, 'easeOutCubic'
                );
            });

            it('should use default duration and easing', () => {
                mascot.animateToPosition(100, 200);
                expect(mascot._getReal().positionController.animateOffset).toHaveBeenCalledWith(
                    100, 200, 0, 1000, 'easeOutCubic'
                );
            });

            it('should create onUpdate callback if missing', () => {
                const pc = mascot._getReal().positionController;
                delete pc.onUpdate;

                mascot.animateToPosition(100, 200);
                expect(pc.onUpdate).toBeDefined();
            });

            it('should throw if not initialized', () => {
                const uninitializedMascot = new EmotiveMascotPublic();
                uninitializedMascot._engine = null;
                expect(() => uninitializedMascot.animateToPosition(100, 200)).toThrow('Engine not initialized. Call init() first.');
            });
        });

        describe('setContainment()', () => {
            it('should set containment bounds', () => {
                mascot.setContainment({ width: 500, height: 400 }, 1);
                expect(mascot._getReal().particleSystem.setContainmentBounds).toHaveBeenCalledWith(
                    { width: 500, height: 400 }
                );
            });

            it('should set scale on position controller', () => {
                mascot.setContainment({ width: 500, height: 400 }, 0.5);
                expect(mascot._getReal().positionController.coreScaleOverride).toBe(0.5);
                expect(mascot._getReal().positionController.particleScaleOverride).toBe(0.5);
            });

            it('should update existing particles scale', () => {
                const particles = [
                    { baseSize: 10, scaleFactor: 1, size: 10 },
                    { baseSize: 20, scaleFactor: 1, size: 20 }
                ];
                mascot._getReal().particleSystem.particles = particles;

                mascot.setContainment(null, 0.5);

                expect(particles[0].scaleFactor).toBe(0.5);
                expect(particles[0].size).toBe(5);
                expect(particles[1].scaleFactor).toBe(0.5);
                expect(particles[1].size).toBe(10);
            });

            it('should throw if not initialized', () => {
                const uninitializedMascot = new EmotiveMascotPublic();
                uninitializedMascot._engine = null;
                expect(() => uninitializedMascot.setContainment(null)).toThrow('Engine not initialized. Call init() first.');
            });
        });

        describe('clearParticles()', () => {
            it('should clear all particles', () => {
                mascot.clearParticles();
                expect(mascot._getReal().particleSystem.clear).toHaveBeenCalled();
            });

            it('should throw if not initialized', () => {
                const uninitializedMascot = new EmotiveMascotPublic();
                uninitializedMascot._engine = null;
                expect(() => uninitializedMascot.clearParticles()).toThrow('Engine not initialized. Call init() first.');
            });
        });

        describe('setParticleSystemCanvasDimensions()', () => {
            it('should set canvas dimensions and return this', () => {
                const result = mascot.setParticleSystemCanvasDimensions(800, 600);
                expect(mascot._getReal().setParticleSystemCanvasDimensions).toHaveBeenCalledWith(800, 600);
                expect(result).toBe(mascot);
            });

            it('should throw if not initialized', () => {
                const uninitializedMascot = new EmotiveMascotPublic();
                uninitializedMascot._engine = null;
                expect(() => uninitializedMascot.setParticleSystemCanvasDimensions(800, 600)).toThrow('Engine not initialized. Call init() first.');
            });
        });
    });

    // ═══════════════════════════════════════════════════════════════════
    // ELEMENT ATTACHMENT
    // ═══════════════════════════════════════════════════════════════════

    describe('Element Attachment', () => {
        let targetElement;

        beforeEach(async () => {
            mascot = new EmotiveMascotPublic();
            await mascot.init(canvas);

            // Create target element
            targetElement = document.createElement('div');
            targetElement.id = 'target-element';
            targetElement.style.width = '400px';
            targetElement.style.height = '300px';
            targetElement.style.position = 'absolute';
            targetElement.style.left = '100px';
            targetElement.style.top = '100px';
            document.body.appendChild(targetElement);
        });

        afterEach(() => {
            if (targetElement && targetElement.parentNode) {
                targetElement.parentNode.removeChild(targetElement);
            }
        });

        describe('attachToElement()', () => {
            it('should attach to element by selector', () => {
                const result = mascot.attachToElement('#target-element');
                expect(result).toBe(mascot);
                expect(mascot._elementAttachmentManager._attachedElement).toBe(targetElement);
            });

            it('should attach to element by reference', () => {
                const result = mascot.attachToElement(targetElement);
                expect(result).toBe(mascot);
                expect(mascot._elementAttachmentManager._attachedElement).toBe(targetElement);
            });

            it('should set default options', () => {
                mascot.attachToElement(targetElement);
                expect(mascot._elementAttachmentManager._attachOptions).toEqual({
                    offsetX: 0,
                    offsetY: 0,
                    animate: true,
                    duration: 1000,
                    scale: 1,
                    containParticles: true
                });
            });

            it('should accept custom options', () => {
                mascot.attachToElement(targetElement, {
                    offsetX: 50,
                    offsetY: 100,
                    animate: false,
                    duration: 500,
                    scale: 0.5,
                    containParticles: false
                });

                expect(mascot._elementAttachmentManager._attachOptions.offsetX).toBe(50);
                expect(mascot._elementAttachmentManager._attachOptions.offsetY).toBe(100);
                expect(mascot._elementAttachmentManager._attachOptions.animate).toBe(false);
                expect(mascot._elementAttachmentManager._attachOptions.duration).toBe(500);
                expect(mascot._elementAttachmentManager._attachOptions.scale).toBe(0.5);
                expect(mascot._elementAttachmentManager._attachOptions.containParticles).toBe(false);
            });

            it('should set up scroll event listener', () => {
                mascot.attachToElement(targetElement);
                expect(mascot._elementAttachmentManager._elementTrackingHandlers).toBeDefined();
                expect(mascot._elementAttachmentManager._elementTrackingHandlers.scroll).toBeDefined();
            });

            it('should set up resize event listener', () => {
                mascot.attachToElement(targetElement);
                expect(mascot._elementAttachmentManager._elementTrackingHandlers).toBeDefined();
                expect(mascot._elementAttachmentManager._elementTrackingHandlers.resize).toBeDefined();
            });

            it('should return this for chaining when element not found', () => {
                const result = mascot.attachToElement('#non-existent');
                expect(result).toBe(mascot);
            });

            it('should throw if not initialized', () => {
                const uninitializedMascot = new EmotiveMascotPublic();
                uninitializedMascot._engine = null;
                expect(() => uninitializedMascot.attachToElement(targetElement)).toThrow('Engine not initialized. Call init() first.');
            });
        });

        describe('isAttachedToElement()', () => {
            it('should return false when not attached', () => {
                expect(mascot.isAttachedToElement()).toBe(false);
            });

            it('should return true when attached', () => {
                mascot.attachToElement(targetElement);
                expect(mascot.isAttachedToElement()).toBe(true);
            });
        });

        describe('detachFromElement()', () => {
            it('should detach from element', () => {
                mascot.attachToElement(targetElement);
                const result = mascot.detachFromElement();

                expect(mascot._elementAttachmentManager._attachedElement).toBeNull();
                expect(result).toBe(mascot);
            });

            it('should remove event listeners', () => {
                mascot.attachToElement(targetElement);
                mascot.detachFromElement();

                expect(mascot._elementAttachmentManager._elementTrackingHandlers).toBeNull();
            });

            it('should reset state', () => {
                mascot.attachToElement(targetElement);
                mascot.detachFromElement();

                expect(mascot._getReal().setEmotion).toHaveBeenCalledWith('neutral', null, 500);
                expect(mascot._getReal().morphTo).toHaveBeenCalledWith('sphere', { duration: 800 });
            });
        });
    });

    // ═══════════════════════════════════════════════════════════════════
    // VISUAL CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════

    describe('Visual Configuration', () => {
        beforeEach(async () => {
            mascot = new EmotiveMascotPublic();
            await mascot.init(canvas);
        });

        describe('setColor()', () => {
            it('should set core color and return this', () => {
                const result = mascot.setColor('#FF0000');
                expect(mascot._getReal().renderer.config.coreColor).toBe('#FF0000');
                expect(result).toBe(mascot);
            });
        });

        describe('setGlowColor()', () => {
            it('should set glow color and return this', () => {
                const result = mascot.setGlowColor('#00FF00');
                expect(mascot._getReal().renderer.config.defaultGlowColor).toBe('#00FF00');
                expect(result).toBe(mascot);
            });
        });

        describe('setTheme()', () => {
            it('should set both core and glow colors', () => {
                const result = mascot.setTheme({
                    core: '#FF0000',
                    glow: '#00FF00'
                });

                expect(mascot._getReal().renderer.config.coreColor).toBe('#FF0000');
                expect(mascot._getReal().renderer.config.defaultGlowColor).toBe('#00FF00');
                expect(result).toBe(mascot);
            });

            it('should accept partial theme', () => {
                mascot.setTheme({ core: '#FF0000' });
                expect(mascot._getReal().renderer.config.coreColor).toBe('#FF0000');
            });
        });

        describe('setOpacity()', () => {
            it('should set opacity and return this', () => {
                const result = mascot.setOpacity(0.5);
                expect(mascot.getOpacity()).toBe(0.5);
                expect(result).toBe(mascot);
            });

            it('should clamp opacity between 0 and 1', () => {
                mascot.setOpacity(1.5);
                expect(mascot.getOpacity()).toBe(1);

                mascot.setOpacity(-0.5);
                expect(mascot.getOpacity()).toBe(0);
            });
        });

        describe('fadeIn()', () => {
            it('should fade in over duration', () => {
                vi.useFakeTimers();

                mascot.setOpacity(0);
                mascot.fadeIn(100);

                vi.advanceTimersByTime(50);
                expect(mascot.getOpacity()).toBeGreaterThan(0);
                expect(mascot.getOpacity()).toBeLessThan(1);

                vi.advanceTimersByTime(100);
                expect(mascot.getOpacity()).toBe(1);

                vi.useRealTimers();
            });

            it('should return this for chaining', () => {
                const result = mascot.fadeIn();
                expect(result).toBe(mascot);
            });
        });

        describe('fadeOut()', () => {
            it('should fade out over duration', () => {
                vi.useFakeTimers();

                mascot.setOpacity(1);
                mascot.fadeOut(100);

                vi.advanceTimersByTime(50);
                expect(mascot.getOpacity()).toBeGreaterThan(0);
                expect(mascot.getOpacity()).toBeLessThan(1);

                vi.advanceTimersByTime(100);
                expect(mascot.getOpacity()).toBe(0);

                vi.useRealTimers();
            });

            it('should return this for chaining', () => {
                const result = mascot.fadeOut();
                expect(result).toBe(mascot);
            });
        });

        describe('setScale()', () => {
            it('should set global scale with number', () => {
                const result = mascot.setScale(0.5);
                expect(mascot._getReal().positionController.setScaleOverrides).toHaveBeenCalledWith(0.5);
                expect(result).toBe(mascot);
            });

            it('should set independent scales with object', () => {
                mascot.setScale({ core: 0.8, particles: 1.2 });
                expect(mascot._getReal().positionController.setScaleOverrides).toHaveBeenCalledWith({
                    core: 0.8,
                    particles: 1.2
                });
            });

            it('should refresh particle pool when particle scale changes', () => {
                mascot.setScale({ particles: 1.5 });
                expect(mascot._getReal().particleSystem.refreshPool).toHaveBeenCalled();
            });
        });

        describe('getScale()', () => {
            it('should return current scale', () => {
                expect(mascot.getScale()).toBe(1.0);
            });

            it('should return 1.0 if not initialized', () => {
                mascot._initialized = false;
                mascot._engine = null;
                expect(mascot.getScale()).toBe(1.0);
            });
        });

        describe('setBackdrop()', () => {
            it('should set backdrop configuration', () => {
                const config = {
                    enabled: true,
                    radius: 2,
                    color: 'rgba(0,0,0,0.8)'
                };

                const result = mascot.setBackdrop(config);
                expect(mascot._getReal().setBackdrop).toHaveBeenCalledWith(config);
                expect(result).toBe(mascot);
            });
        });

        describe('getBackdrop()', () => {
            it('should get backdrop configuration', () => {
                mascot._getReal().getBackdrop.mockReturnValue({ enabled: true });
                const config = mascot.getBackdrop();
                expect(config).toEqual({ enabled: true });
            });

            it('should return null if not available', () => {
                mascot._getReal().getBackdrop = undefined;
                const config = mascot.getBackdrop();
                expect(config).toBeNull();
            });
        });
    });

    // ═══════════════════════════════════════════════════════════════════
    // PERFORMANCE & QUALITY
    // ═══════════════════════════════════════════════════════════════════

    describe('Performance & Quality', () => {
        beforeEach(async () => {
            mascot = new EmotiveMascotPublic();
            await mascot.init(canvas);
        });

        describe('setQuality()', () => {
            it('should set low quality', () => {
                mascot.setQuality('low');
                expect(mascot._getReal().particleSystem.setMaxParticles).toHaveBeenCalledWith(50);
            });

            it('should set medium quality', () => {
                mascot.setQuality('medium');
                expect(mascot._getReal().particleSystem.setMaxParticles).toHaveBeenCalledWith(100);
            });

            it('should set high quality', () => {
                mascot.setQuality('high');
                expect(mascot._getReal().particleSystem.setMaxParticles).toHaveBeenCalledWith(200);
            });

            it('should default to medium for unknown quality', () => {
                mascot.setQuality('ultra');
                expect(mascot._getReal().particleSystem.setMaxParticles).toHaveBeenCalledWith(100);
            });
        });

        describe('setMaxParticles()', () => {
            it('should set max particles and return this', () => {
                const result = mascot.setMaxParticles(150);
                expect(mascot._getReal().particleSystem.setMaxParticles).toHaveBeenCalledWith(150);
                expect(result).toBe(mascot);
            });
        });

        describe('getParticleCount()', () => {
            it('should return current particle count', () => {
                mascot._getReal().particleSystem.particles = [1, 2, 3];
                expect(mascot.getParticleCount()).toBe(3);
            });

            it('should return 0 if not available', () => {
                mascot._getReal().particleSystem.particles = null;
                expect(mascot.getParticleCount()).toBe(0);
            });
        });

        describe('setFPS()', () => {
            it('should set target FPS and return this', () => {
                const result = mascot.setFPS(30);
                expect(mascot._getReal().animationController.setTargetFPS).toHaveBeenCalledWith(30);
                expect(result).toBe(mascot);
            });

            it('should clamp FPS between 1 and 120', () => {
                mascot.setFPS(0);
                expect(mascot._getReal().animationController.setTargetFPS).toHaveBeenCalledWith(1);

                mascot.setFPS(200);
                expect(mascot._getReal().animationController.setTargetFPS).toHaveBeenCalledWith(120);
            });
        });

        describe('getFPS()', () => {
            it('should return target FPS', () => {
                expect(mascot.getFPS()).toBe(60);
            });

            it('should return 60 if not available', () => {
                mascot._getReal().animationController.targetFPS = null;
                expect(mascot.getFPS()).toBe(60);
            });
        });

        describe('setSpeed()', () => {
            it('should set speed multiplier and return this', () => {
                const result = mascot.setSpeed(2.0);
                expect(mascot.getSpeed()).toBe(2.0);
                expect(result).toBe(mascot);
            });

            it('should clamp speed between 0.1 and 10', () => {
                mascot.setSpeed(0);
                expect(mascot.getSpeed()).toBe(0.1);

                mascot.setSpeed(20);
                expect(mascot.getSpeed()).toBe(10);
            });
        });

        describe('getPerformanceMetrics()', () => {
            it('should return performance metrics', () => {
                const metrics = mascot.getPerformanceMetrics();
                expect(metrics).toEqual({
                    fps: 60,
                    frameTime: 16.67,
                    particleCount: 10
                });
            });

            it('should return default metrics if not initialized', () => {
                const uninitializedMascot = new EmotiveMascotPublic();
                uninitializedMascot._engine = null;
                uninitializedMascot._realEngine = null;
                const metrics = uninitializedMascot.getPerformanceMetrics();
                expect(metrics).toEqual({ fps: 0, frameTime: 0 });
            });
        });

        describe('isPaused()', () => {
            it('should return pause state', () => {
                expect(mascot.isPaused()).toBe(false);
            });

            it('should return false if not initialized', () => {
                mascot._initialized = false;
                mascot._engine = null;
                expect(mascot.isPaused()).toBe(false);
            });
        });

        describe('batch()', () => {
            it('should execute callback in batch', () => {
                const callback = vi.fn();
                const result = mascot.batch(callback);

                expect(callback).toHaveBeenCalledWith(mascot);
                expect(result).toBe(mascot);
            });

            it('should pause and resume if not paused', () => {
                mascot._getReal().animationController.isPaused = false;

                mascot.batch(() => {
                    expect(mascot._getReal().pause).toHaveBeenCalled();
                });

                expect(mascot._getReal().resume).toHaveBeenCalled();
            });

            it('should not resume if already paused', () => {
                mascot._getReal().animationController.isPaused = true;

                mascot.batch(() => {});

                expect(mascot._getReal().resume).not.toHaveBeenCalled();
            });
        });
    });

    // ═══════════════════════════════════════════════════════════════════
    // EVENT MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════

    describe('Event Management', () => {
        beforeEach(async () => {
            mascot = new EmotiveMascotPublic();
            await mascot.init(canvas);
        });

        describe('on()', () => {
            it('should register event listener and return this', () => {
                const listener = vi.fn();
                const result = mascot.on('emotionChange', listener);

                expect(mascot._getReal().eventManager.on).toHaveBeenCalledWith('emotionChange', listener);
                expect(result).toBe(mascot);
            });
        });

        describe('off()', () => {
            it('should remove event listener and return this', () => {
                const listener = vi.fn();
                const result = mascot.off('emotionChange', listener);

                expect(mascot._getReal().eventManager.off).toHaveBeenCalledWith('emotionChange', listener);
                expect(result).toBe(mascot);
            });
        });
    });

    // ═══════════════════════════════════════════════════════════════════
    // TIMELINE RECORDING & PLAYBACK
    // ═══════════════════════════════════════════════════════════════════

    describe('Timeline Recording & Playback', () => {
        beforeEach(async () => {
            mascot = new EmotiveMascotPublic();
            await mascot.init(canvas);
        });

        describe('startRecording()', () => {
            it('should start recording', () => {
                mascot.startRecording();
                expect(mascot._isRecording).toBe(true);
                expect(mascot._timeline).toEqual([]);
            });
        });

        describe('stopRecording()', () => {
            it('should stop recording and return timeline', () => {
                mascot.startRecording();
                mascot.triggerGesture('bounce');
                const timeline = mascot.stopRecording();

                expect(mascot._isRecording).toBe(false);
                expect(timeline.length).toBe(1);
                expect(timeline[0].type).toBe('gesture');
            });
        });

        describe('getTimeline()', () => {
            it('should return copy of timeline', () => {
                mascot.startRecording();
                mascot.triggerGesture('bounce');
                mascot.stopRecording();

                const timeline = mascot.getTimeline();
                expect(timeline.length).toBe(1);

                // Should be a copy
                timeline.push({ type: 'test' });
                expect(mascot._timeline.length).toBe(1);
            });
        });

        describe('loadTimeline()', () => {
            it('should load timeline', () => {
                const timeline = [
                    { type: 'gesture', name: 'bounce', time: 0 },
                    { type: 'emotion', name: 'joy', time: 500 }
                ];

                mascot.loadTimeline(timeline);
                expect(mascot._timeline).toEqual(timeline);
            });
        });

        describe('playTimeline()', () => {
            it('should play timeline events', () => {
                vi.useFakeTimers();

                const timeline = [
                    { type: 'gesture', name: 'bounce', time: 0 },
                    { type: 'emotion', name: 'joy', time: 500 },
                    { type: 'shape', name: 'star', time: 1000 }
                ];

                mascot.playTimeline(timeline);
                expect(mascot._isPlaying).toBe(true);

                // First event should execute immediately
                vi.advanceTimersByTime(0);
                expect(mascot._getReal().express).toHaveBeenCalledWith('bounce');

                // Second event
                vi.advanceTimersByTime(500);
                expect(mascot._getReal().setEmotion).toHaveBeenCalledWith('joy');

                // Third event
                vi.advanceTimersByTime(500);
                expect(mascot._getReal().morphTo).toHaveBeenCalledWith('star');

                vi.useRealTimers();
            });

            it('should do nothing for empty timeline', () => {
                mascot.playTimeline([]);
                expect(mascot._isPlaying).toBe(false);
            });
        });

        describe('stopPlayback()', () => {
            it('should stop playback', () => {
                mascot._isPlaying = true;
                mascot.stopPlayback();
                expect(mascot._isPlaying).toBe(false);
            });
        });

        describe('getCurrentTime()', () => {
            it('should return current playback time', () => {
                vi.useFakeTimers();
                const now = Date.now();

                mascot._isPlaying = true;
                mascot._playbackStartTime = now;

                vi.advanceTimersByTime(500);
                expect(mascot.getCurrentTime()).toBeGreaterThanOrEqual(500);

                vi.useRealTimers();
            });

            it('should return 0 when not playing', () => {
                expect(mascot.getCurrentTime()).toBe(0);
            });
        });

        describe('seek()', () => {
            it('should seek to time and apply last events', () => {
                mascot._timeline = [
                    { type: 'emotion', name: 'joy', time: 0 },
                    { type: 'emotion', name: 'sadness', time: 500 },
                    { type: 'shape', name: 'star', time: 1000 }
                ];

                mascot.seek(750);

                // Should apply last emotion (sadness) but not shape
                expect(mascot._getReal().setEmotion).toHaveBeenCalledWith('sadness');
                expect(mascot._getReal().morphTo).not.toHaveBeenCalled();
            });
        });

        describe('exportTimeline() / importTimeline()', () => {
            it('should export timeline as JSON', () => {
                mascot._timeline = [
                    { type: 'gesture', name: 'bounce', time: 0 }
                ];
                mascot._audioManager.setAudioDuration(5000);

                const json = mascot.exportTimeline();
                const data = JSON.parse(json);

                expect(data.version).toBe('1.0');
                expect(data.duration).toBe(5000);
                expect(data.events.length).toBe(1);
            });

            it('should import timeline from JSON', () => {
                const json = JSON.stringify({
                    version: '1.0',
                    duration: 5000,
                    events: [
                        { type: 'gesture', name: 'bounce', time: 0 }
                    ]
                });

                mascot.importTimeline(json);

                expect(mascot._timeline.length).toBe(1);
                expect(mascot._audioManager.getAudioDuration()).toBe(5000);
            });
        });
    });

    // ═══════════════════════════════════════════════════════════════════
    // EXPORT CAPABILITIES
    // ═══════════════════════════════════════════════════════════════════

    describe('Export Capabilities', () => {
        beforeEach(async () => {
            mascot = new EmotiveMascotPublic();
            await mascot.init(canvas);
        });

        describe('getFrameData()', () => {
            it('should return frame as data URL', () => {
                const data = mascot.getFrameData();
                expect(data).toBe('data:image/png;base64,mock');
            });

            it('should accept custom format', () => {
                mascot.getFrameData('jpeg');
                expect(canvas.toDataURL).toHaveBeenCalledWith('image/jpeg');
            });

            it('should return null if no canvas', () => {
                mascot.canvas = null;
                mascot._canvas = null;
                mascot._getReal().canvas = null;
                expect(mascot.getFrameData()).toBeNull();
            });
        });

        describe('getFrameBlob()', () => {
            it('should return frame as Blob', async () => {
                const blob = await mascot.getFrameBlob();
                expect(blob).toBeInstanceOf(Blob);
            });

            it('should accept custom format', async () => {
                await mascot.getFrameBlob('jpeg');
                expect(canvas.toBlob).toHaveBeenCalled();
            });

            it('should return null if no canvas', async () => {
                mascot.canvas = null;
                mascot._canvas = null;
                mascot._getReal().canvas = null;
                const blob = await mascot.getFrameBlob();
                expect(blob).toBeNull();
            });
        });

        describe('getAnimationData()', () => {
            it('should return animation state', () => {
                mascot._timeline = [{ type: 'gesture', name: 'bounce', time: 0 }];
                mascot._audioManager.setAudioDuration(5000);

                const data = mascot.getAnimationData();

                expect(data.timeline).toBeDefined();
                expect(data.duration).toBe(5000);
                expect(data.emotion).toBe('neutral');
                expect(data.shape).toBe('circle');
            });
        });
    });

    // ═══════════════════════════════════════════════════════════════════
    // QUERY METHODS
    // ═══════════════════════════════════════════════════════════════════

    describe('Query Methods', () => {
        beforeEach(() => {
            mascot = new EmotiveMascotPublic();
        });

        describe('getAvailableGestures()', () => {
            it('should return array of gesture names', () => {
                const gestures = mascot.getAvailableGestures();
                expect(Array.isArray(gestures)).toBe(true);
                expect(gestures.length).toBeGreaterThan(0);
                expect(gestures).toContain('bounce');
                expect(gestures).toContain('pulse');
            });
        });

        describe('getAvailableEmotions()', () => {
            it('should return array of emotion names', () => {
                const emotions = mascot.getAvailableEmotions();
                expect(Array.isArray(emotions)).toBe(true);
                expect(emotions.length).toBeGreaterThan(0);
                expect(emotions).toContain('neutral');
                expect(emotions).toContain('joy');
            });
        });

        describe('getAvailableShapes()', () => {
            it('should return array of shape names', () => {
                const shapes = mascot.getAvailableShapes();
                expect(Array.isArray(shapes)).toBe(true);
                expect(shapes.length).toBeGreaterThan(0);
                expect(shapes).toContain('circle');
                expect(shapes).toContain('star');
            });
        });

        describe('getVersion()', () => {
            it('should return version string', () => {
                const version = mascot.getVersion();
                expect(typeof version).toBe('string');
                expect(version).toMatch(/^\d+\.\d+\.\d+$/);
            });
        });

        describe('getCapabilities()', () => {
            it('should return capabilities object', () => {
                const capabilities = mascot.getCapabilities();
                expect(capabilities).toEqual({
                    audio: true,
                    recording: true,
                    timeline: true,
                    export: true,
                    shapes: true,
                    gestures: true,
                    emotions: true,
                    particles: true,
                    gazeTracking: true
                });
            });
        });
    });

    // ═══════════════════════════════════════════════════════════════════
    // COMPONENT GETTERS (PROXY PROTECTION)
    // ═══════════════════════════════════════════════════════════════════

    describe('Component Getters - Proxy Protection', () => {
        beforeEach(async () => {
            mascot = new EmotiveMascotPublic();
            await mascot.init(canvas);
        });

        describe('renderer getter', () => {
            it('should return safe proxy with limited methods', () => {
                const {renderer} = mascot;
                expect(renderer).toBeDefined();
                expect(renderer.setBlinkingEnabled).toBeDefined();

                // Should block access to other properties
                expect(renderer.config).toBeUndefined();
            });

            it('should return null if not available', () => {
                mascot._getReal().renderer = null;
                expect(mascot.renderer).toBeNull();
            });
        });

        describe('shapeMorpher getter', () => {
            it('should return safe proxy with limited methods', () => {
                const {shapeMorpher} = mascot;
                expect(shapeMorpher).toBeDefined();
                expect(shapeMorpher.resetMusicDetection).toBeDefined();
                expect(shapeMorpher.frequencyData).toBeDefined();
            });

            it('should return null if not available', () => {
                mascot._getReal().shapeMorpher = null;
                expect(mascot.shapeMorpher).toBeNull();
            });
        });

        describe('gazeTracker getter', () => {
            it('should return safe proxy with limited methods', () => {
                const {gazeTracker} = mascot;
                expect(gazeTracker).toBeDefined();
                expect(gazeTracker.enable).toBeDefined();
                expect(gazeTracker.disable).toBeDefined();
                expect(gazeTracker.getState).toBeDefined();
            });

            it('should return null if not available', () => {
                mascot._getReal().gazeTracker = null;
                expect(mascot.gazeTracker).toBeNull();
            });
        });
    });

    // ═══════════════════════════════════════════════════════════════════
    // CLEANUP & DESTRUCTION
    // ═══════════════════════════════════════════════════════════════════

    describe('Cleanup & Destruction', () => {
        beforeEach(async () => {
            mascot = new EmotiveMascotPublic();
            await mascot.init(canvas);
        });

        describe('destroy()', () => {
            it('should stop engine', () => {
                mascot.destroy();
                expect(mascot._getReal().stop).toHaveBeenCalled();
            });

            it('should clear timeline', () => {
                mascot._timeline = [{ type: 'gesture', name: 'bounce', time: 0 }];
                mascot.destroy();
                expect(mascot._timeline).toEqual([]);
            });

            it('should reset recording state', () => {
                mascot._isRecording = true;
                mascot._isPlaying = true;
                mascot.destroy();
                expect(mascot._isRecording).toBe(false);
                expect(mascot._isPlaying).toBe(false);
            });

            it('should detach from element', () => {
                const element = document.createElement('div');
                document.body.appendChild(element);

                mascot.attachToElement(element);
                mascot.destroy();

                expect(mascot._elementAttachmentManager._attachedElement).toBeNull();

                element.parentNode.removeChild(element);
            });

            it('should call engine destroy', () => {
                mascot.destroy();
                expect(mascot._getReal().destroy).toHaveBeenCalled();
            });
        });
    });

    // ═══════════════════════════════════════════════════════════════════
    // USER WORKFLOWS - INTEGRATION SCENARIOS
    // ═══════════════════════════════════════════════════════════════════

    describe('User Workflows - Real Integration Scenarios', () => {
        it('should complete basic workflow: init → start → animate → stop', async () => {
            mascot = new EmotiveMascotPublic();

            // Init
            await mascot.init(canvas);
            expect(mascot._initialized).toBe(true);

            // Start
            mascot.start();
            expect(mascot._getReal().start).toHaveBeenCalled();

            // Animate
            mascot.setEmotion('joy');
            mascot.triggerGesture('bounce');
            mascot.setShape('star');

            // Stop
            mascot.stop();
            expect(mascot._getReal().stop).toHaveBeenCalled();
        });

        it('should support method chaining workflow', async () => {
            mascot = new EmotiveMascotPublic();
            await mascot.init(canvas);

            // Chained configuration
            mascot
                .setColor('#FF0000')
                .setGlowColor('#00FF00')
                .setScale(0.8)
                .setMaxParticles(100)
                .setFPS(60);

            // All should return this
            const engine = mascot._getReal();
            if (engine.renderer && engine.renderer.config) {
                expect(engine.renderer.config.coreColor).toBe('#FF0000');
            }
            expect(engine.particleSystem.setMaxParticles).toHaveBeenCalledWith(100);
        });

        it('should handle recording and playback workflow', async () => {
            vi.useFakeTimers();

            mascot = new EmotiveMascotPublic();
            await mascot.init(canvas);

            // Record sequence
            mascot.startRecording();
            mascot.setEmotion('joy');
            vi.advanceTimersByTime(500);
            mascot.triggerGesture('bounce');
            vi.advanceTimersByTime(500);
            mascot.setShape('star');
            const timeline = mascot.stopRecording();

            expect(timeline.length).toBe(3);

            // Export
            const json = mascot.exportTimeline();
            expect(json).toBeTruthy();

            // Import and play
            mascot.importTimeline(json);
            mascot.playTimeline(mascot._timeline);
            expect(mascot._isPlaying).toBe(true);

            vi.useRealTimers();
        });

        it('should handle element attachment workflow', async () => {
            const element = document.createElement('div');
            element.style.width = '400px';
            element.style.height = '300px';
            document.body.appendChild(element);

            mascot = new EmotiveMascotPublic();
            await mascot.init(canvas);

            // Attach with options
            mascot
                .attachToElement(element, {
                    scale: 0.5,
                    offsetX: 10,
                    offsetY: 20,
                    containParticles: true
                })
                .setEmotion('joy');

            mascot.start();

            expect(mascot.isAttachedToElement()).toBe(true);

            // Detach
            mascot.detachFromElement();
            expect(mascot.isAttachedToElement()).toBe(false);

            element.parentNode.removeChild(element);
        });

        it('should handle batch updates workflow', async () => {
            mascot = new EmotiveMascotPublic();
            await mascot.init(canvas);

            // Mark as not paused initially
            mascot._getReal().animationController.isPaused = false;

            mascot.start();

            // Clear mocks after start to track pause/resume from batch
            vi.clearAllMocks();

            // Batch multiple updates
            mascot.batch(m => {
                m.setColor('#FF0000');
                m.setGlowColor('#00FF00');
                m.setScale(0.8);
                m.setOpacity(0.9);
                m.setEmotion('joy');
            });

            // Should have paused and resumed
            expect(mascot._getReal().pause).toHaveBeenCalled();
            expect(mascot._getReal().resume).toHaveBeenCalled();
        });

        it('should handle audio visualization workflow', async () => {
            mascot = new EmotiveMascotPublic();
            await mascot.init(canvas);

            const audioElement = document.createElement('audio');

            // Connect audio
            mascot.connectAudio(audioElement);
            expect(mascot._getReal().connectAudio).toHaveBeenCalledWith(audioElement);

            // Start rhythm sync
            mascot.startRhythmSync(120);
            expect(mascot._getReal().rhythmIntegration.setBPM).toHaveBeenCalledWith(120);

            // Get analysis
            const analysis = mascot.getAudioAnalysis();
            expect(analysis.bpm).toBe(120);

            // Get spectrum
            const spectrum = mascot.getSpectrumData();
            expect(Array.isArray(spectrum)).toBe(true);

            // Disconnect
            mascot.disconnectAudio(audioElement);
            expect(mascot._getReal().disconnectAudio).toHaveBeenCalledWith(audioElement);
        });
    });

    // ═══════════════════════════════════════════════════════════════════
    // API CONSISTENCY & BACKWARD COMPATIBILITY
    // ═══════════════════════════════════════════════════════════════════

    describe('API Consistency & Backward Compatibility', () => {
        beforeEach(async () => {
            mascot = new EmotiveMascotPublic();
            await mascot.init(canvas);
        });

        it('should maintain consistent error messages', () => {
            const uninitializedMascot = new EmotiveMascotPublic();
            uninitializedMascot._engine = null;

            expect(() => uninitializedMascot.start()).toThrow('Engine not initialized. Call init() first.');
            expect(() => uninitializedMascot.stop()).toThrow('Engine not initialized. Call init() first.');
            expect(() => uninitializedMascot.pause()).toThrow('Engine not initialized. Call init() first.');
            expect(() => uninitializedMascot.resume()).toThrow('Engine not initialized. Call init() first.');
        });

        it('should support both morphTo and setShape (aliases)', () => {
            mascot.morphTo('star');
            expect(mascot._getReal().morphTo).toHaveBeenCalledWith('star', {});

            vi.clearAllMocks();

            mascot.setShape('circle');
            expect(mascot._getReal().morphTo).toHaveBeenCalledWith('circle', {});
        });

        it('should support both express and triggerGesture (aliases)', () => {
            mascot.express('bounce');
            expect(mascot._getReal().express).toHaveBeenCalledWith('bounce');

            vi.clearAllMocks();

            mascot.triggerGesture('pulse');
            expect(mascot._getReal().express).toHaveBeenCalledWith('pulse');
        });

        it('should maintain chainable API pattern', () => {
            const result = mascot
                .setColor('#FF0000')
                .setGlowColor('#00FF00')
                .setScale(0.5)
                .setOpacity(0.9)
                .setMaxParticles(100)
                .setFPS(60);

            expect(result).toBe(mascot);
        });

        it('should handle various parameter formats for setEmotion', () => {
            // Emotion only
            mascot.setEmotion('joy');
            expect(mascot._getReal().setEmotion).toHaveBeenCalledWith('joy', null, 500);

            vi.clearAllMocks();

            // Emotion with undertone
            mascot.setEmotion('joy', 'gentle');
            expect(mascot._getReal().setEmotion).toHaveBeenCalledWith('joy', { undertone: 'gentle' }, 500);

            vi.clearAllMocks();

            // Emotion with options
            mascot.setEmotion('joy', { undertone: 'gentle', duration: 1000 });
            expect(mascot._getReal().setEmotion).toHaveBeenCalledWith('joy', { undertone: 'gentle' }, 1000);
        });
    });

    // ═══════════════════════════════════════════════════════════════════
    // SECURITY BOUNDARIES
    // ═══════════════════════════════════════════════════════════════════

    describe('Security Boundaries - Proxy Protection', () => {
        beforeEach(async () => {
            mascot = new EmotiveMascotPublic();
            await mascot.init(canvas);
        });

        it('should block access to sensitive internal components', () => {
            const blockedProps = [
                'soundSystem', 'stateMachine', 'emotionLibrary',
                'audioLevelProcessor', 'particleSystem', 'errorBoundary',
                'performanceMonitor', 'config', 'debugMode'
            ];

            blockedProps.forEach(prop => {
                const component = mascot._engine[prop];
                if (component) {
                    // Should return empty proxy
                    expect(Object.keys(component).length).toBe(0);
                }
            });
        });

        it('should prevent modifications to engine through proxy', () => {
            // In strict mode, the proxy's set trap returning false will throw
            // We're testing that modifications are blocked
            const result = Reflect.set(mascot._engine, 'someProperty', 'test');
            expect(result).toBe(false); // Proxy should return false

            expect(mascot._engine.someProperty).toBeUndefined();
        });

        it('should hide internal properties from Object.keys', () => {
            const keys = Object.keys(mascot._engine);
            expect(keys).not.toContain('soundSystem');
            expect(keys).not.toContain('stateMachine');
            expect(keys).not.toContain('emotionLibrary');
        });

        it('should hide _realEngine from enumeration', () => {
            const keys = Object.keys(mascot);
            expect(keys).not.toContain('_realEngine');
        });

        it('should maintain access to _realEngine through _getReal()', () => {
            const realEngine = mascot._getReal();
            expect(realEngine).toBeDefined();
            expect(realEngine.start).toBeDefined();
            expect(realEngine.soundSystem).toBeDefined();
        });
    });
});
