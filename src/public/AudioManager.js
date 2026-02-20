/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *                  ◐ ◑ ◒ ◓  AUDIO MANAGER  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview AudioManager - Audio Loading, Analysis, and Rhythm Synchronization
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module AudioManager
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Manages all audio-related functionality for EmotiveMascotPublic, including loading
 * ║ audio from URLs or Blobs, connecting/disconnecting audio elements, retrieving
 * ║ audio analysis data (BPM, beats, energy, spectrum), and controlling rhythm sync.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎵 RESPONSIBILITIES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Load audio from URLs or Blob objects
 * │ • Extract audio duration metadata
 * │ • Connect/disconnect HTMLAudioElement for visualization
 * │ • Retrieve audio analysis (BPM, beats, energy, frequencies)
 * │ • Get spectrum data for real-time visualization
 * │ • Start/stop rhythm synchronization
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

export class AudioManager {
    /**
     * Create AudioManager
     * @param {Function} getEngine - Function that returns the real engine instance
     */
    constructor(getEngine) {
        this._getEngine = getEngine;
        this._audioBlob = null;
        this._audioDuration = 0;
    }

    /**
     * Get audio blob (for timeline export)
     * @returns {Blob|null} Audio blob if loaded
     */
    getAudioBlob() {
        return this._audioBlob;
    }

    /**
     * Get audio duration (for timeline operations)
     * @returns {number} Audio duration in milliseconds
     */
    getAudioDuration() {
        return this._audioDuration;
    }

    /**
     * Set audio duration (for timeline import)
     * @param {number} duration - Duration in milliseconds
     */
    setAudioDuration(duration) {
        this._audioDuration = duration || 0;
    }

    /**
     * Load audio from URL or Blob
     * @param {string|Blob} source - Audio URL or Blob object
     * @returns {Promise<void>}
     *
     * @example
     * // Load from URL
     * await audioManager.loadAudio('https://example.com/music.mp3');
     *
     * @example
     * // Load from Blob
     * const blob = new Blob([audioData], { type: 'audio/mp3' });
     * await audioManager.loadAudio(blob);
     */
    async loadAudio(source) {
        if (source instanceof Blob) {
            this._audioBlob = source;
            const audioUrl = URL.createObjectURL(source);
            await this._loadAudioFromUrl(audioUrl);
            URL.revokeObjectURL(audioUrl);
        } else {
            await this._loadAudioFromUrl(source);
        }
    }

    /**
     * Load audio from URL (internal helper)
     * @private
     * @param {string} url - Audio URL
     * @returns {Promise<void>}
     */
    async _loadAudioFromUrl(url) {
        // Load audio and get duration
        const audio = new Audio(url);
        await new Promise((resolve, reject) => {
            audio.addEventListener('loadedmetadata', () => {
                this._audioDuration = audio.duration * 1000; // Convert to ms
                resolve();
            });
            audio.addEventListener('error', reject);
            audio.load();
        });

        // Connect to engine's audio system
        const engine = this._getEngine();
        if (engine && engine.soundSystem) {
            await engine.soundSystem.loadAudioFromURL(url);
        }
    }

    /**
     * Get audio analysis data
     * @returns {Object|null} Audio analysis (bpm, beats, energy, frequencies) or null if unavailable
     *
     * @example
     * const analysis = audioManager.getAudioAnalysis();
     * console.log('BPM:', analysis.bpm);
     * console.log('Energy:', analysis.energy);
     * console.log('Beats:', analysis.beats.length);
     */
    getAudioAnalysis() {
        const engine = this._getEngine();
        if (!engine) return null;
        if (!engine.audioAnalyzer) return null;

        return {
            bpm: engine.rhythmIntegration?.getBPM() || 0,
            beats: engine.rhythmIntegration?.getBeatMarkers() || [],
            energy: engine.audioAnalyzer?.getEnergyLevel() || 0,
            frequencies: engine.audioAnalyzer?.getFrequencyData() || []
        };
    }

    /**
     * Connect audio element for visualization
     * @param {HTMLAudioElement} audioElement - Audio element to connect
     * @throws {Error} If engine not initialized
     *
     * @example
     * const audioEl = document.getElementById('myAudio');
     * audioManager.connectAudio(audioEl);
     */
    connectAudio(audioElement) {
        const engine = this._getEngine();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');

        if (engine.connectAudio) {
            engine.connectAudio(audioElement);
        }
    }

    /**
     * Disconnect audio element
     * @param {HTMLAudioElement} [audioElement] - Audio element to disconnect
     *
     * @example
     * audioManager.disconnectAudio(audioEl);
     */
    disconnectAudio(audioElement) {
        const engine = this._getEngine();
        if (!engine) return;

        if (engine.disconnectAudio) {
            engine.disconnectAudio(audioElement);
        }
    }

    /**
     * Get spectrum data for visualization
     * @returns {Array<number>} Frequency spectrum data normalized to 0-1
     *
     * @example
     * const spectrum = audioManager.getSpectrumData();
     * spectrum.forEach((value, index) => {
     *   drawBar(index, value * 100); // Draw frequency bars
     * });
     */
    getSpectrumData() {
        const engine = this._getEngine();
        if (!engine) return [];
        if (!engine.audioAnalyzer) return [];

        // Get raw frequency data from the analyzer
        if (engine.audioAnalyzer.dataArray) {
            // Convert Uint8Array to regular array and normalize to 0-1
            return Array.from(engine.audioAnalyzer.dataArray).map(v => v / 255);
        }

        // Try alternative sources
        if (engine.shapeMorpher && engine.shapeMorpher.frequencyData) {
            return Array.from(engine.shapeMorpher.frequencyData);
        }

        return [];
    }

    /**
     * Start rhythm synchronization
     * @param {number} [bpm] - Optional BPM to sync to
     * @throws {Error} If engine not initialized
     *
     * @example
     * // Auto-detect BPM from audio
     * audioManager.startRhythmSync();
     *
     * @example
     * // Force specific BPM
     * audioManager.startRhythmSync(128);
     */
    startRhythmSync(bpm) {
        const engine = this._getEngine();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');

        if (engine.rhythmIntegration) {
            if (bpm) {
                engine.rhythmIntegration.setBPM(bpm);
            }
            engine.rhythmIntegration.start();
        }
    }

    /**
     * Stop rhythm synchronization
     *
     * @example
     * audioManager.stopRhythmSync();
     */
    stopRhythmSync() {
        const engine = this._getEngine();
        if (!engine) return;

        if (engine.rhythmIntegration) {
            engine.rhythmIntegration.stop();
        }
    }

    /**
     * Get the RhythmInputEvaluator for grading tap timing.
     * @param {Object} [config] - Optional evaluator config
     * @returns {import('../core/audio/RhythmInputEvaluator.js').RhythmInputEvaluator|null}
     */
    getInputEvaluator(config) {
        const engine = this._getEngine();
        if (!engine || !engine.rhythmIntegration) return null;
        const evaluator = engine.rhythmIntegration.getInputEvaluator(config);

        // Auto-wire emotion target if stateCoordinator available (UP-RESONANCE-2 Feature 2)
        if (evaluator && !evaluator._emotionTarget && engine.stateCoordinator) {
            evaluator.setEmotionTarget((emotion, delta) => {
                engine.stateCoordinator.nudgeEmotion(emotion, delta);
            });
        }

        return evaluator;
    }

    /**
     * Get the AudioLayerManager for stem-based adaptive music.
     * @returns {import('../core/audio/AudioLayerManager.js').AudioLayerManager|null}
     */
    getLayers() {
        const engine = this._getEngine();
        if (!engine || !engine.soundSystem) return null;
        return engine.soundSystem.getAudioLayerManager();
    }
}
