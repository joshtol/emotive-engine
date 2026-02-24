// @vitest-environment jsdom
/**
 * AudioHandler Tests
 * Tests for the audio management module
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AudioHandler } from '../../../src/mascot/audio/AudioHandler.js';

describe('AudioHandler', () => {
    let audioHandler;
    let mockDeps;
    let mockChainTarget;

    beforeEach(() => {
        mockChainTarget = { _isChainTarget: true };
        // Create mock dependencies
        mockDeps = {
            audioAnalyzer: {
                stop: vi.fn(),
                init: vi.fn().mockResolvedValue(undefined),
                audioContext: null,
                connectAudioElement: vi.fn(),
                onBeat: vi.fn(),
                isAnalyzing: false,
                currentAmplitude: 0,
                getVocalInstability: vi.fn().mockReturnValue(0)
            },
            shapeMorpher: {
                setVocalEnergy: vi.fn(),
                setAudioDeformation: vi.fn(),
                audioAnalyzer: null,
                beatGlitchIntensity: 0,
                glitchPoints: [],
                vocalEffectActive: false,
                musicDetector: null
            },
            renderer: {
                ambientDanceAnimator: {
                    stopAmbientAnimation: vi.fn()
                },
                startGrooveBob: vi.fn(),
                audioAnalyzer: null,
                onSpeechStop: vi.fn()
            },
            audioLevelProcessor: {
                getCurrentLevel: vi.fn().mockReturnValue(0.5),
                cleanup: vi.fn()
            },
            stateMachine: {
                getCurrentState: vi.fn().mockReturnValue({ emotion: 'neutral' })
            },
            soundSystem: {
                isAvailable: vi.fn().mockReturnValue(true),
                setMasterVolume: vi.fn()
            },
            config: {
                masterVolume: 0.5
            },
            state: {
                speaking: false
            },
            emit: vi.fn(),
            chainTarget: mockChainTarget
        };

        audioHandler = new AudioHandler(mockDeps);
    });

    describe('Constructor', () => {
        it('should initialize with DI dependencies', () => {
            expect(audioHandler.audioAnalyzer).toBe(mockDeps.audioAnalyzer);
        });

        it('should initialize vocalUpdateInterval as null', () => {
            expect(audioHandler.vocalUpdateInterval).toBeNull();
        });
    });

    describe('init()', () => {
        it('should exist as a method', () => {
            expect(typeof audioHandler.init).toBe('function');
        });

        it('should not throw when called', () => {
            expect(() => audioHandler.init()).not.toThrow();
        });
    });

    describe('disconnectAudio()', () => {
        it('should stop audio analyzer if it exists', () => {
            audioHandler.disconnectAudio();

            expect(mockDeps.audioAnalyzer.stop).toHaveBeenCalled();
        });

        it('should clear vocal update interval if set', () => {
            // Set up an interval
            audioHandler.vocalUpdateInterval = setInterval(() => {}, 50);

            audioHandler.disconnectAudio();

            expect(audioHandler.vocalUpdateInterval).toBeNull();
        });

        it('should reset shape morpher vocal data', () => {
            audioHandler.disconnectAudio();

            expect(mockDeps.shapeMorpher.setVocalEnergy).toHaveBeenCalledWith(0);
            expect(mockDeps.shapeMorpher.setAudioDeformation).toHaveBeenCalledWith(0);
            expect(mockDeps.shapeMorpher.audioAnalyzer).toBeNull();
            expect(mockDeps.shapeMorpher.beatGlitchIntensity).toBe(0);
        });

        it('should stop ambient groove animation', () => {
            audioHandler.disconnectAudio();

            expect(mockDeps.renderer.ambientDanceAnimator.stopAmbientAnimation)
                .toHaveBeenCalledWith('grooveBob');
        });

        it('should return chain target for chaining', () => {
            const result = audioHandler.disconnectAudio();

            expect(result).toBe(mockChainTarget);
        });

        it('should handle missing audioAnalyzer gracefully', () => {
            audioHandler.audioAnalyzer = null;

            expect(() => audioHandler.disconnectAudio()).not.toThrow();
        });

        it('should handle missing shapeMorpher gracefully', () => {
            audioHandler.shapeMorpher = null;

            expect(() => audioHandler.disconnectAudio()).not.toThrow();
        });

        it('should handle missing renderer gracefully', () => {
            audioHandler.renderer = null;

            expect(() => audioHandler.disconnectAudio()).not.toThrow();
        });
    });

    describe('connectAudio()', () => {
        let mockAudioElement;

        beforeEach(() => {
            mockAudioElement = document.createElement('audio');
        });

        it('should return early if audioAnalyzer is not available', async () => {
            audioHandler.audioAnalyzer = null;

            const result = await audioHandler.connectAudio(mockAudioElement);

            expect(result).toBe(mockChainTarget);
        });

        it('should initialize audio context if not present', async () => {
            mockDeps.audioAnalyzer.audioContext = null;

            await audioHandler.connectAudio(mockAudioElement);

            expect(mockDeps.audioAnalyzer.init).toHaveBeenCalled();
        });

        it('should resume suspended audio context', async () => {
            mockDeps.audioAnalyzer.audioContext = {
                state: 'suspended',
                resume: vi.fn().mockResolvedValue(undefined)
            };

            await audioHandler.connectAudio(mockAudioElement);

            expect(mockDeps.audioAnalyzer.audioContext.resume).toHaveBeenCalled();
        });

        it('should connect audio element to analyzer', async () => {
            mockDeps.audioAnalyzer.audioContext = { state: 'running' };

            await audioHandler.connectAudio(mockAudioElement);

            expect(mockDeps.audioAnalyzer.connectAudioElement)
                .toHaveBeenCalledWith(mockAudioElement);
        });

        it('should pass analyzer reference to shape morpher', async () => {
            mockDeps.audioAnalyzer.audioContext = { state: 'running' };

            await audioHandler.connectAudio(mockAudioElement);

            expect(mockDeps.shapeMorpher.audioAnalyzer).toBe(mockDeps.audioAnalyzer);
        });

        it('should set up beat detection callback', async () => {
            mockDeps.audioAnalyzer.audioContext = { state: 'running' };

            await audioHandler.connectAudio(mockAudioElement);

            expect(mockDeps.audioAnalyzer.onBeat).toHaveBeenCalled();
        });

        it('should start ambient groove animation', async () => {
            mockDeps.audioAnalyzer.audioContext = { state: 'running' };

            await audioHandler.connectAudio(mockAudioElement);

            expect(mockDeps.renderer.startGrooveBob).toHaveBeenCalledWith({
                intensity: 0.5,
                frequency: 1.0
            });
        });

        it('should start vocal update interval', async () => {
            mockDeps.audioAnalyzer.audioContext = { state: 'running' };

            await audioHandler.connectAudio(mockAudioElement);

            expect(audioHandler.vocalUpdateInterval).not.toBeNull();

            // Clean up interval
            clearInterval(audioHandler.vocalUpdateInterval);
        });

        it('should clear previous vocal update interval if exists', async () => {
            mockDeps.audioAnalyzer.audioContext = { state: 'running' };

            // Set up first interval
            await audioHandler.connectAudio(mockAudioElement);
            const firstInterval = audioHandler.vocalUpdateInterval;

            // Connect again
            await audioHandler.connectAudio(mockAudioElement);

            expect(audioHandler.vocalUpdateInterval).not.toBe(firstInterval);

            // Clean up
            clearInterval(audioHandler.vocalUpdateInterval);
        });

        it('should pass audio analyzer to renderer', async () => {
            mockDeps.audioAnalyzer.audioContext = { state: 'running' };

            await audioHandler.connectAudio(mockAudioElement);

            expect(mockDeps.renderer.audioAnalyzer).toBe(mockDeps.audioAnalyzer);
        });

        it('should return chain target for chaining', async () => {
            mockDeps.audioAnalyzer.audioContext = { state: 'running' };

            const result = await audioHandler.connectAudio(mockAudioElement);

            expect(result).toBe(mockChainTarget);

            // Clean up
            if (audioHandler.vocalUpdateInterval) {
                clearInterval(audioHandler.vocalUpdateInterval);
            }
        });

        it('should handle init failure gracefully', async () => {
            mockDeps.audioAnalyzer.audioContext = null;
            mockDeps.audioAnalyzer.init.mockRejectedValue(new Error('Init failed'));

            const result = await audioHandler.connectAudio(mockAudioElement);

            expect(result).toBe(mockChainTarget);
        });

        it('should handle resume failure gracefully', async () => {
            mockDeps.audioAnalyzer.audioContext = {
                state: 'suspended',
                resume: vi.fn().mockRejectedValue(new Error('Resume failed'))
            };

            await expect(audioHandler.connectAudio(mockAudioElement)).resolves.toBe(mockChainTarget);
        });
    });

    describe('stopSpeaking()', () => {
        beforeEach(() => {
            mockDeps.state.speaking = true;
        });

        it('should return early if not speaking', () => {
            mockDeps.state.speaking = false;

            const result = audioHandler.stopSpeaking();

            expect(mockDeps.audioLevelProcessor.cleanup).not.toHaveBeenCalled();
            expect(result).toBe(mockChainTarget);
        });

        it('should cleanup audio level processor', () => {
            audioHandler.stopSpeaking();

            expect(mockDeps.audioLevelProcessor.cleanup).toHaveBeenCalled();
        });

        it('should reset speaking state', () => {
            audioHandler.stopSpeaking();

            expect(mockDeps.state.speaking).toBe(false);
        });

        it('should notify renderer about speech stop', () => {
            audioHandler.stopSpeaking();

            expect(mockDeps.renderer.onSpeechStop).toHaveBeenCalled();
        });

        it('should emit speechStopped event with data', () => {
            mockDeps.audioLevelProcessor.getCurrentLevel.mockReturnValue(0.75);

            audioHandler.stopSpeaking();

            expect(mockDeps.emit).toHaveBeenCalledWith('speechStopped', {
                previousAudioLevel: 0.75,
                returnToBaseTime: 500
            });
        });

        it('should return chain target for chaining', () => {
            const result = audioHandler.stopSpeaking();

            expect(result).toBe(mockChainTarget);
        });
    });

    describe('setVolume()', () => {
        it('should clamp volume to 0-1 range (below 0)', () => {
            audioHandler.setVolume(-0.5);

            expect(mockDeps.config.masterVolume).toBe(0);
        });

        it('should clamp volume to 0-1 range (above 1)', () => {
            audioHandler.setVolume(1.5);

            expect(mockDeps.config.masterVolume).toBe(1);
        });

        it('should set valid volume', () => {
            audioHandler.setVolume(0.75);

            expect(mockDeps.config.masterVolume).toBe(0.75);
        });

        it('should update sound system volume if available', () => {
            mockDeps.stateMachine.getCurrentState.mockReturnValue({ emotion: 'joy' });

            audioHandler.setVolume(0.6);

            expect(mockDeps.soundSystem.setMasterVolume).toHaveBeenCalledWith(0.6, 'joy');
        });

        it('should not update sound system if not available', () => {
            mockDeps.soundSystem.isAvailable.mockReturnValue(false);

            audioHandler.setVolume(0.5);

            expect(mockDeps.soundSystem.setMasterVolume).not.toHaveBeenCalled();
        });

        it('should emit volumeChanged event', () => {
            audioHandler.setVolume(0.8);

            expect(mockDeps.emit).toHaveBeenCalledWith('volumeChanged', { volume: 0.8 });
        });

        it('should return chain target for chaining', () => {
            const result = audioHandler.setVolume(0.5);

            expect(result).toBe(mockChainTarget);
        });
    });

    describe('destroy()', () => {
        it('should call disconnectAudio', () => {
            vi.spyOn(audioHandler, 'disconnectAudio');

            audioHandler.destroy();

            expect(audioHandler.disconnectAudio).toHaveBeenCalled();
        });

        it('should cleanup all resources', () => {
            audioHandler.vocalUpdateInterval = setInterval(() => {}, 50);

            audioHandler.destroy();

            expect(mockDeps.audioAnalyzer.stop).toHaveBeenCalled();
            expect(audioHandler.vocalUpdateInterval).toBeNull();
        });
    });
});
