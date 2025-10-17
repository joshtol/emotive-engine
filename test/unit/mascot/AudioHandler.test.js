/**
 * AudioHandler Tests
 * Tests for the audio management module
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AudioHandler } from '../../../src/mascot/AudioHandler.js';

describe('AudioHandler', () => {
    let audioHandler;
    let mockMascot;

    beforeEach(() => {
        // Create mock mascot with required properties
        mockMascot = {
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
            speaking: false,
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
            emit: vi.fn()
        };

        audioHandler = new AudioHandler(mockMascot);
    });

    describe('Constructor', () => {
        it('should initialize with mascot reference', () => {
            expect(audioHandler.mascot).toBe(mockMascot);
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

            expect(mockMascot.audioAnalyzer.stop).toHaveBeenCalled();
        });

        it('should clear vocal update interval if set', () => {
            // Set up an interval
            audioHandler.vocalUpdateInterval = setInterval(() => {}, 50);
            const intervalId = audioHandler.vocalUpdateInterval;

            audioHandler.disconnectAudio();

            expect(audioHandler.vocalUpdateInterval).toBeNull();
        });

        it('should reset shape morpher vocal data', () => {
            audioHandler.disconnectAudio();

            expect(mockMascot.shapeMorpher.setVocalEnergy).toHaveBeenCalledWith(0);
            expect(mockMascot.shapeMorpher.setAudioDeformation).toHaveBeenCalledWith(0);
            expect(mockMascot.shapeMorpher.audioAnalyzer).toBeNull();
            expect(mockMascot.shapeMorpher.beatGlitchIntensity).toBe(0);
        });

        it('should stop ambient groove animation', () => {
            audioHandler.disconnectAudio();

            expect(mockMascot.renderer.ambientDanceAnimator.stopAmbientAnimation)
                .toHaveBeenCalledWith('grooveBob');
        });

        it('should return mascot instance for chaining', () => {
            const result = audioHandler.disconnectAudio();

            expect(result).toBe(mockMascot);
        });

        it('should handle missing audioAnalyzer gracefully', () => {
            mockMascot.audioAnalyzer = null;

            expect(() => audioHandler.disconnectAudio()).not.toThrow();
        });

        it('should handle missing shapeMorpher gracefully', () => {
            mockMascot.shapeMorpher = null;

            expect(() => audioHandler.disconnectAudio()).not.toThrow();
        });

        it('should handle missing renderer gracefully', () => {
            mockMascot.renderer = null;

            expect(() => audioHandler.disconnectAudio()).not.toThrow();
        });
    });

    describe('connectAudio()', () => {
        let mockAudioElement;

        beforeEach(() => {
            mockAudioElement = document.createElement('audio');
        });

        it('should return early if audioAnalyzer is not available', async () => {
            mockMascot.audioAnalyzer = null;

            const result = await audioHandler.connectAudio(mockAudioElement);

            expect(result).toBe(mockMascot);
        });

        it('should initialize audio context if not present', async () => {
            mockMascot.audioAnalyzer.audioContext = null;

            await audioHandler.connectAudio(mockAudioElement);

            expect(mockMascot.audioAnalyzer.init).toHaveBeenCalled();
        });

        it('should resume suspended audio context', async () => {
            mockMascot.audioAnalyzer.audioContext = {
                state: 'suspended',
                resume: vi.fn().mockResolvedValue(undefined)
            };

            await audioHandler.connectAudio(mockAudioElement);

            expect(mockMascot.audioAnalyzer.audioContext.resume).toHaveBeenCalled();
        });

        it('should connect audio element to analyzer', async () => {
            mockMascot.audioAnalyzer.audioContext = { state: 'running' };

            await audioHandler.connectAudio(mockAudioElement);

            expect(mockMascot.audioAnalyzer.connectAudioElement)
                .toHaveBeenCalledWith(mockAudioElement);
        });

        it('should pass analyzer reference to shape morpher', async () => {
            mockMascot.audioAnalyzer.audioContext = { state: 'running' };

            await audioHandler.connectAudio(mockAudioElement);

            expect(mockMascot.shapeMorpher.audioAnalyzer).toBe(mockMascot.audioAnalyzer);
        });

        it('should set up beat detection callback', async () => {
            mockMascot.audioAnalyzer.audioContext = { state: 'running' };

            await audioHandler.connectAudio(mockAudioElement);

            expect(mockMascot.audioAnalyzer.onBeat).toHaveBeenCalled();
        });

        it('should start ambient groove animation', async () => {
            mockMascot.audioAnalyzer.audioContext = { state: 'running' };

            await audioHandler.connectAudio(mockAudioElement);

            expect(mockMascot.renderer.startGrooveBob).toHaveBeenCalledWith({
                intensity: 0.5,
                frequency: 1.0
            });
        });

        it('should start vocal update interval', async () => {
            mockMascot.audioAnalyzer.audioContext = { state: 'running' };

            await audioHandler.connectAudio(mockAudioElement);

            expect(audioHandler.vocalUpdateInterval).not.toBeNull();

            // Clean up interval
            clearInterval(audioHandler.vocalUpdateInterval);
        });

        it('should clear previous vocal update interval if exists', async () => {
            mockMascot.audioAnalyzer.audioContext = { state: 'running' };

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
            mockMascot.audioAnalyzer.audioContext = { state: 'running' };

            await audioHandler.connectAudio(mockAudioElement);

            expect(mockMascot.renderer.audioAnalyzer).toBe(mockMascot.audioAnalyzer);
        });

        it('should return mascot instance for chaining', async () => {
            mockMascot.audioAnalyzer.audioContext = { state: 'running' };

            const result = await audioHandler.connectAudio(mockAudioElement);

            expect(result).toBe(mockMascot);

            // Clean up
            if (audioHandler.vocalUpdateInterval) {
                clearInterval(audioHandler.vocalUpdateInterval);
            }
        });

        it('should handle init failure gracefully', async () => {
            mockMascot.audioAnalyzer.audioContext = null;
            mockMascot.audioAnalyzer.init.mockRejectedValue(new Error('Init failed'));

            const result = await audioHandler.connectAudio(mockAudioElement);

            expect(result).toBe(mockMascot);
        });

        it('should handle resume failure gracefully', async () => {
            mockMascot.audioAnalyzer.audioContext = {
                state: 'suspended',
                resume: vi.fn().mockRejectedValue(new Error('Resume failed'))
            };

            await expect(audioHandler.connectAudio(mockAudioElement)).resolves.toBe(mockMascot);
        });
    });

    describe('stopSpeaking()', () => {
        beforeEach(() => {
            mockMascot.speaking = true;
        });

        it('should return early if not speaking', () => {
            mockMascot.speaking = false;

            const result = audioHandler.stopSpeaking();

            expect(mockMascot.audioLevelProcessor.cleanup).not.toHaveBeenCalled();
            expect(result).toBe(mockMascot);
        });

        it('should cleanup audio level processor', () => {
            audioHandler.stopSpeaking();

            expect(mockMascot.audioLevelProcessor.cleanup).toHaveBeenCalled();
        });

        it('should reset speaking state', () => {
            audioHandler.stopSpeaking();

            expect(mockMascot.speaking).toBe(false);
        });

        it('should notify renderer about speech stop', () => {
            audioHandler.stopSpeaking();

            expect(mockMascot.renderer.onSpeechStop).toHaveBeenCalled();
        });

        it('should emit speechStopped event with data', () => {
            mockMascot.audioLevelProcessor.getCurrentLevel.mockReturnValue(0.75);

            audioHandler.stopSpeaking();

            expect(mockMascot.emit).toHaveBeenCalledWith('speechStopped', {
                previousAudioLevel: 0.75,
                returnToBaseTime: 500
            });
        });

        it('should return mascot instance for chaining', () => {
            const result = audioHandler.stopSpeaking();

            expect(result).toBe(mockMascot);
        });
    });

    describe('setVolume()', () => {
        it('should clamp volume to 0-1 range (below 0)', () => {
            audioHandler.setVolume(-0.5);

            expect(mockMascot.config.masterVolume).toBe(0);
        });

        it('should clamp volume to 0-1 range (above 1)', () => {
            audioHandler.setVolume(1.5);

            expect(mockMascot.config.masterVolume).toBe(1);
        });

        it('should set valid volume', () => {
            audioHandler.setVolume(0.75);

            expect(mockMascot.config.masterVolume).toBe(0.75);
        });

        it('should update sound system volume if available', () => {
            mockMascot.stateMachine.getCurrentState.mockReturnValue({ emotion: 'joy' });

            audioHandler.setVolume(0.6);

            expect(mockMascot.soundSystem.setMasterVolume).toHaveBeenCalledWith(0.6, 'joy');
        });

        it('should not update sound system if not available', () => {
            mockMascot.soundSystem.isAvailable.mockReturnValue(false);

            audioHandler.setVolume(0.5);

            expect(mockMascot.soundSystem.setMasterVolume).not.toHaveBeenCalled();
        });

        it('should emit volumeChanged event', () => {
            audioHandler.setVolume(0.8);

            expect(mockMascot.emit).toHaveBeenCalledWith('volumeChanged', { volume: 0.8 });
        });

        it('should return mascot instance for chaining', () => {
            const result = audioHandler.setVolume(0.5);

            expect(result).toBe(mockMascot);
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

            expect(mockMascot.audioAnalyzer.stop).toHaveBeenCalled();
            expect(audioHandler.vocalUpdateInterval).toBeNull();
        });
    });
});
