/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *             ◐ ◑ ◒ ◓  GESTURE SOUND LIBRARY  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview GestureSoundLibrary - Sound Configuration Database for Gestures
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module GestureSoundLibrary
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Centralized library of sound configurations for all gesture types. Each gesture
 * ║ has a defined waveform, duration, volume, frequency envelope, and volume envelope
 * ║ that creates its unique sonic signature.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎵 RESPONSIBILITIES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Store sound configurations for all gesture types
 * │ • Provide frequency envelopes for pitch modulation
 * │ • Provide volume envelopes for amplitude modulation
 * │ • Return sound config by gesture ID
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Gesture Sound Library - Configuration database for gesture audio
 */
export class GestureSoundLibrary {
    /**
     * Get the static gesture sound configuration map
     * Created once and cached to avoid repeated allocation
     * @private
     */
    static _getGestureSoundsMap() {
        if (!GestureSoundLibrary._GESTURE_SOUNDS_CACHE) {
            GestureSoundLibrary._GESTURE_SOUNDS_CACHE = new Map([
                [
                    'bounce',
                    {
                        duration: 100,
                        waveform: 'triangle',
                        volume: 0.3,
                        frequencyEnvelope: [
                            { time: 0, frequency: 200 },
                            { time: 0.5, frequency: 400 },
                            { time: 1, frequency: 300 },
                        ],
                        volumeEnvelope: [
                            { time: 0, volume: 1.0 },
                            { time: 0.1, volume: 0.8 },
                            { time: 1, volume: 0.0 },
                        ],
                    },
                ],
                [
                    'pulse',
                    {
                        duration: 300,
                        waveform: 'sine',
                        volume: 0.25,
                        frequencyEnvelope: [
                            { time: 0, frequency: 300 },
                            { time: 0.5, frequency: 450 },
                            { time: 1, frequency: 300 },
                        ],
                        volumeEnvelope: [
                            { time: 0, volume: 0.0 },
                            { time: 0.3, volume: 1.0 },
                            { time: 0.7, volume: 1.0 },
                            { time: 1, volume: 0.0 },
                        ],
                    },
                ],
                [
                    'shake',
                    {
                        duration: 200,
                        waveform: 'sawtooth',
                        volume: 0.2,
                        frequencyEnvelope: [
                            { time: 0, frequency: 150 },
                            { time: 0.25, frequency: 200 },
                            { time: 0.5, frequency: 150 },
                            { time: 0.75, frequency: 200 },
                            { time: 1, frequency: 150 },
                        ],
                        volumeEnvelope: [
                            { time: 0, volume: 0.8 },
                            { time: 0.5, volume: 1.0 },
                            { time: 1, volume: 0.0 },
                        ],
                    },
                ],
                [
                    'spin',
                    {
                        duration: 800,
                        waveform: 'sine',
                        volume: 0.18,
                        frequencyEnvelope: [
                            { time: 0, frequency: 200 },
                            { time: 0.5, frequency: 600 },
                            { time: 1, frequency: 200 },
                        ],
                        volumeEnvelope: [
                            { time: 0, volume: 0.5 },
                            { time: 0.5, volume: 1.0 },
                            { time: 1, volume: 0.0 },
                        ],
                    },
                ],
                [
                    'breathe',
                    {
                        duration: 1500,
                        waveform: 'sine',
                        volume: 0.12,
                        frequencyEnvelope: [
                            { time: 0, frequency: 150 },
                            { time: 0.5, frequency: 180 },
                            { time: 1, frequency: 150 },
                        ],
                        volumeEnvelope: [
                            { time: 0, volume: 0.0 },
                            { time: 0.3, volume: 0.7 },
                            { time: 0.7, volume: 0.7 },
                            { time: 1, volume: 0.0 },
                        ],
                    },
                ],
                [
                    'morph',
                    {
                        duration: 600,
                        waveform: 'triangle',
                        volume: 0.2,
                        frequencyEnvelope: [
                            { time: 0, frequency: 250 },
                            { time: 0.3, frequency: 400 },
                            { time: 0.7, frequency: 300 },
                            { time: 1, frequency: 200 },
                        ],
                        volumeEnvelope: [
                            { time: 0, volume: 0.0 },
                            { time: 0.2, volume: 1.0 },
                            { time: 0.8, volume: 0.8 },
                            { time: 1, volume: 0.0 },
                        ],
                    },
                ],
                [
                    'float',
                    {
                        duration: 2000,
                        waveform: 'sine',
                        volume: 0.15,
                        frequencyEnvelope: [
                            { time: 0, frequency: 300 },
                            { time: 0.5, frequency: 350 },
                            { time: 1, frequency: 300 },
                        ],
                        volumeEnvelope: [
                            { time: 0, volume: 0.0 },
                            { time: 0.2, volume: 0.6 },
                            { time: 0.8, volume: 0.6 },
                            { time: 1, volume: 0.0 },
                        ],
                    },
                ],
                [
                    'wobble',
                    {
                        duration: 400,
                        waveform: 'square',
                        volume: 0.2,
                        frequencyEnvelope: [
                            { time: 0, frequency: 180 },
                            { time: 0.25, frequency: 220 },
                            { time: 0.5, frequency: 180 },
                            { time: 0.75, frequency: 220 },
                            { time: 1, frequency: 180 },
                        ],
                        volumeEnvelope: [
                            { time: 0, volume: 0.7 },
                            { time: 0.5, volume: 1.0 },
                            { time: 1, volume: 0.0 },
                        ],
                    },
                ],
                [
                    'wave',
                    {
                        duration: 1200,
                        waveform: 'sine',
                        volume: 0.22,
                        frequencyEnvelope: [
                            { time: 0, frequency: 200 },
                            { time: 0.25, frequency: 400 },
                            { time: 0.5, frequency: 250 },
                            { time: 0.75, frequency: 450 },
                            { time: 1, frequency: 200 },
                        ],
                        volumeEnvelope: [
                            { time: 0, volume: 0.0 },
                            { time: 0.2, volume: 1.0 },
                            { time: 0.8, volume: 0.9 },
                            { time: 1, volume: 0.0 },
                        ],
                    },
                ],
                [
                    'pop',
                    {
                        duration: 80,
                        waveform: 'triangle',
                        volume: 0.4,
                        frequencyEnvelope: [
                            { time: 0, frequency: 500 },
                            { time: 0.3, frequency: 300 },
                            { time: 1, frequency: 100 },
                        ],
                        volumeEnvelope: [
                            { time: 0, volume: 1.0 },
                            { time: 0.2, volume: 0.6 },
                            { time: 1, volume: 0.0 },
                        ],
                    },
                ],
                [
                    'shimmer',
                    {
                        duration: 1000,
                        waveform: 'sine',
                        volume: 0.16,
                        frequencyEnvelope: [
                            { time: 0, frequency: 600 },
                            { time: 0.2, frequency: 700 },
                            { time: 0.4, frequency: 650 },
                            { time: 0.6, frequency: 750 },
                            { time: 0.8, frequency: 700 },
                            { time: 1, frequency: 600 },
                        ],
                        volumeEnvelope: [
                            { time: 0, volume: 0.0 },
                            { time: 0.2, volume: 0.8 },
                            { time: 0.8, volume: 0.8 },
                            { time: 1, volume: 0.0 },
                        ],
                    },
                ],
                [
                    'glitch',
                    {
                        duration: 250,
                        waveform: 'square',
                        volume: 0.25,
                        frequencyEnvelope: [
                            { time: 0, frequency: 100 },
                            { time: 0.2, frequency: 800 },
                            { time: 0.4, frequency: 200 },
                            { time: 0.6, frequency: 600 },
                            { time: 0.8, frequency: 300 },
                            { time: 1, frequency: 100 },
                        ],
                        volumeEnvelope: [
                            { time: 0, volume: 0.8 },
                            { time: 0.5, volume: 1.0 },
                            { time: 1, volume: 0.0 },
                        ],
                    },
                ],
                [
                    'reach',
                    {
                        duration: 500,
                        waveform: 'triangle',
                        volume: 0.2,
                        frequencyEnvelope: [
                            { time: 0, frequency: 250 },
                            { time: 1, frequency: 450 },
                        ],
                        volumeEnvelope: [
                            { time: 0, volume: 0.7 },
                            { time: 0.5, volume: 1.0 },
                            { time: 1, volume: 0.0 },
                        ],
                    },
                ],
                [
                    'shrink',
                    {
                        duration: 600,
                        waveform: 'sine',
                        volume: 0.18,
                        frequencyEnvelope: [
                            { time: 0, frequency: 400 },
                            { time: 1, frequency: 150 },
                        ],
                        volumeEnvelope: [
                            { time: 0, volume: 0.9 },
                            { time: 0.5, volume: 0.6 },
                            { time: 1, volume: 0.0 },
                        ],
                    },
                ],
                [
                    'grow',
                    {
                        duration: 700,
                        waveform: 'sine',
                        volume: 0.22,
                        frequencyEnvelope: [
                            { time: 0, frequency: 150 },
                            { time: 1, frequency: 500 },
                        ],
                        volumeEnvelope: [
                            { time: 0, volume: 0.5 },
                            { time: 0.5, volume: 0.9 },
                            { time: 1, volume: 0.0 },
                        ],
                    },
                ],
                [
                    'drift',
                    {
                        duration: 1500,
                        waveform: 'sine',
                        volume: 0.14,
                        frequencyEnvelope: [
                            { time: 0, frequency: 200 },
                            { time: 0.5, frequency: 280 },
                            { time: 1, frequency: 220 },
                        ],
                        volumeEnvelope: [
                            { time: 0, volume: 0.0 },
                            { time: 0.3, volume: 0.7 },
                            { time: 0.7, volume: 0.6 },
                            { time: 1, volume: 0.0 },
                        ],
                    },
                ],
                [
                    'zoom',
                    {
                        duration: 400,
                        waveform: 'triangle',
                        volume: 0.28,
                        frequencyEnvelope: [
                            { time: 0, frequency: 200 },
                            { time: 1, frequency: 800 },
                        ],
                        volumeEnvelope: [
                            { time: 0, volume: 0.6 },
                            { time: 0.5, volume: 1.0 },
                            { time: 1, volume: 0.0 },
                        ],
                    },
                ],
                [
                    'squish',
                    {
                        duration: 300,
                        waveform: 'sawtooth',
                        volume: 0.24,
                        frequencyEnvelope: [
                            { time: 0, frequency: 350 },
                            { time: 0.5, frequency: 120 },
                            { time: 1, frequency: 180 },
                        ],
                        volumeEnvelope: [
                            { time: 0, volume: 0.9 },
                            { time: 0.3, volume: 1.0 },
                            { time: 1, volume: 0.0 },
                        ],
                    },
                ],
                [
                    'stretch',
                    {
                        duration: 800,
                        waveform: 'sine',
                        volume: 0.19,
                        frequencyEnvelope: [
                            { time: 0, frequency: 200 },
                            { time: 0.5, frequency: 350 },
                            { time: 1, frequency: 300 },
                        ],
                        volumeEnvelope: [
                            { time: 0, volume: 0.6 },
                            { time: 0.4, volume: 1.0 },
                            { time: 1, volume: 0.0 },
                        ],
                    },
                ],
                [
                    'snap',
                    {
                        duration: 100,
                        waveform: 'square',
                        volume: 0.35,
                        frequencyEnvelope: [
                            { time: 0, frequency: 600 },
                            { time: 0.5, frequency: 300 },
                            { time: 1, frequency: 150 },
                        ],
                        volumeEnvelope: [
                            { time: 0, volume: 1.0 },
                            { time: 0.3, volume: 0.5 },
                            { time: 1, volume: 0.0 },
                        ],
                    },
                ],
                [
                    'ripple',
                    {
                        duration: 1000,
                        waveform: 'sine',
                        volume: 0.17,
                        frequencyEnvelope: [
                            { time: 0, frequency: 300 },
                            { time: 0.25, frequency: 350 },
                            { time: 0.5, frequency: 300 },
                            { time: 0.75, frequency: 350 },
                            { time: 1, frequency: 300 },
                        ],
                        volumeEnvelope: [
                            { time: 0, volume: 0.8 },
                            { time: 0.2, volume: 1.0 },
                            { time: 0.8, volume: 0.7 },
                            { time: 1, volume: 0.0 },
                        ],
                    },
                ],
                [
                    'swirl',
                    {
                        duration: 1200,
                        waveform: 'triangle',
                        volume: 0.2,
                        frequencyEnvelope: [
                            { time: 0, frequency: 250 },
                            { time: 0.33, frequency: 400 },
                            { time: 0.66, frequency: 300 },
                            { time: 1, frequency: 500 },
                        ],
                        volumeEnvelope: [
                            { time: 0, volume: 0.0 },
                            { time: 0.2, volume: 0.9 },
                            { time: 0.8, volume: 0.8 },
                            { time: 1, volume: 0.0 },
                        ],
                    },
                ],
                [
                    'explode',
                    {
                        duration: 600,
                        waveform: 'sawtooth',
                        volume: 0.3,
                        frequencyEnvelope: [
                            { time: 0, frequency: 100 },
                            { time: 0.2, frequency: 800 },
                            { time: 1, frequency: 50 },
                        ],
                        volumeEnvelope: [
                            { time: 0, volume: 1.0 },
                            { time: 0.3, volume: 0.8 },
                            { time: 1, volume: 0.0 },
                        ],
                    },
                ],
                [
                    'implode',
                    {
                        duration: 700,
                        waveform: 'sine',
                        volume: 0.25,
                        frequencyEnvelope: [
                            { time: 0, frequency: 500 },
                            { time: 0.5, frequency: 200 },
                            { time: 1, frequency: 100 },
                        ],
                        volumeEnvelope: [
                            { time: 0, volume: 0.9 },
                            { time: 0.5, volume: 1.0 },
                            { time: 1, volume: 0.0 },
                        ],
                    },
                ],
                [
                    'flutter',
                    {
                        duration: 800,
                        waveform: 'triangle',
                        volume: 0.18,
                        frequencyEnvelope: [
                            { time: 0, frequency: 400 },
                            { time: 0.2, frequency: 450 },
                            { time: 0.4, frequency: 400 },
                            { time: 0.6, frequency: 450 },
                            { time: 0.8, frequency: 400 },
                            { time: 1, frequency: 450 },
                        ],
                        volumeEnvelope: [
                            { time: 0, volume: 0.0 },
                            { time: 0.2, volume: 0.8 },
                            { time: 0.8, volume: 0.7 },
                            { time: 1, volume: 0.0 },
                        ],
                    },
                ],
                [
                    'twist',
                    {
                        duration: 500,
                        waveform: 'sawtooth',
                        volume: 0.21,
                        frequencyEnvelope: [
                            { time: 0, frequency: 200 },
                            { time: 0.5, frequency: 400 },
                            { time: 1, frequency: 200 },
                        ],
                        volumeEnvelope: [
                            { time: 0, volume: 0.7 },
                            { time: 0.5, volume: 1.0 },
                            { time: 1, volume: 0.0 },
                        ],
                    },
                ],
                [
                    'blink',
                    {
                        duration: 150,
                        waveform: 'sine',
                        volume: 0.15,
                        frequencyEnvelope: [
                            { time: 0, frequency: 400 },
                            { time: 0.5, frequency: 500 },
                            { time: 1, frequency: 400 },
                        ],
                        volumeEnvelope: [
                            { time: 0, volume: 0.0 },
                            { time: 0.5, volume: 1.0 },
                            { time: 1, volume: 0.0 },
                        ],
                    },
                ],
                [
                    'glow',
                    {
                        duration: 1500,
                        waveform: 'sine',
                        volume: 0.12,
                        frequencyEnvelope: [
                            { time: 0, frequency: 300 },
                            { time: 0.5, frequency: 400 },
                            { time: 1, frequency: 350 },
                        ],
                        volumeEnvelope: [
                            { time: 0, volume: 0.0 },
                            { time: 0.4, volume: 0.8 },
                            { time: 0.6, volume: 0.8 },
                            { time: 1, volume: 0.0 },
                        ],
                    },
                ],
                [
                    'sparkle',
                    {
                        duration: 600,
                        waveform: 'sine',
                        volume: 0.2,
                        frequencyEnvelope: [
                            { time: 0, frequency: 800 },
                            { time: 0.3, frequency: 1000 },
                            { time: 0.6, frequency: 900 },
                            { time: 1, frequency: 700 },
                        ],
                        volumeEnvelope: [
                            { time: 0, volume: 0.6 },
                            { time: 0.2, frequency: 1.0 },
                            { time: 0.8, volume: 0.9 },
                            { time: 1, volume: 0.0 },
                        ],
                    },
                ],
            ]);
        }
        return GestureSoundLibrary._GESTURE_SOUNDS_CACHE;
    }

    /**
     * Get sound configuration for a gesture
     * @param {string} gestureId - Gesture identifier
     * @returns {Object|null} Sound config with duration, waveform, volume, envelopes
     */
    static getSoundConfig(gestureId) {
        const gestureSounds = GestureSoundLibrary._getGestureSoundsMap();
        return gestureSounds.get(gestureId) || null;
    }
}
