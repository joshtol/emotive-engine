/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *                      ♪ ♫ ♬ ♭  MUSIC THEORY SYSTEM  ♭ ♬ ♫ ♪
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Music Theory System - Musical Intelligence & Harmonic Generation
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module MusicTheory
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ The MUSICAL BRAIN of the system. Provides comprehensive music theory utilities
 * ║ for generating scales, chords, progressions, and harmonic relationships that
 * ║ respond to emotional states and user interactions.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎼 MUSIC THEORY FEATURES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Note frequency calculation (Equal Temperament)
 * │ • Scale generation (Major, Minor, Modal, Exotic)
 * │ • Chord construction (Triads, 7ths, Extensions)
 * │ • Circle of Fifths navigation
 * │ • Interval relationships
 * │ • Chord progression generation
 * │ • Key signature management
 * │ • Emotion-to-mode mapping
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

class MusicTheory {
    constructor() {
        // A4 = 440Hz standard tuning
        this.A4_FREQUENCY = 440;

        // Note names in chromatic scale
        this.NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

        // Interval definitions (in semitones)
        this.INTERVALS = {
            unison: 0,
            minorSecond: 1,
            majorSecond: 2,
            minorThird: 3,
            majorThird: 4,
            perfectFourth: 5,
            tritone: 6,
            perfectFifth: 7,
            minorSixth: 8,
            majorSixth: 9,
            minorSeventh: 10,
            majorSeventh: 11,
            octave: 12,
        };

        // Scale patterns (in semitones from root)
        this.SCALES = {
            // Traditional scales
            major: [0, 2, 4, 5, 7, 9, 11],
            naturalMinor: [0, 2, 3, 5, 7, 8, 10],
            harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
            melodicMinor: [0, 2, 3, 5, 7, 9, 11],

            // Modes
            ionian: [0, 2, 4, 5, 7, 9, 11], // Major
            dorian: [0, 2, 3, 5, 7, 9, 10], // Minor with raised 6th
            phrygian: [0, 1, 3, 5, 7, 8, 10], // Spanish/Flamenco feel
            lydian: [0, 2, 4, 6, 7, 9, 11], // Dreamy, ethereal
            mixolydian: [0, 2, 4, 5, 7, 9, 10], // Bluesy major
            aeolian: [0, 2, 3, 5, 7, 8, 10], // Natural minor
            locrian: [0, 1, 3, 5, 6, 8, 10], // Diminished, unstable

            // Pentatonic scales
            majorPentatonic: [0, 2, 4, 7, 9],
            minorPentatonic: [0, 3, 5, 7, 10],

            // Exotic scales
            blues: [0, 3, 5, 6, 7, 10],
            chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
            wholeHalfDiminished: [0, 2, 3, 5, 6, 8, 9, 11],
            arabic: [0, 1, 4, 5, 7, 8, 11], // Hijaz scale
            japanese: [0, 1, 5, 7, 8], // Hirajoshi scale
            hungarian: [0, 2, 3, 6, 7, 8, 11], // Hungarian minor
            bebopMajor: [0, 2, 4, 5, 7, 8, 9, 11], // Jazz bebop
        };

        // Chord patterns (intervals from root)
        this.CHORDS = {
            // Triads
            major: [0, 4, 7],
            minor: [0, 3, 7],
            diminished: [0, 3, 6],
            augmented: [0, 4, 8],
            sus2: [0, 2, 7],
            sus4: [0, 5, 7],

            // Seventh chords
            maj7: [0, 4, 7, 11],
            min7: [0, 3, 7, 10],
            dom7: [0, 4, 7, 10],
            min7b5: [0, 3, 6, 10],
            dim7: [0, 3, 6, 9],

            // Extended chords
            maj9: [0, 4, 7, 11, 14],
            min9: [0, 3, 7, 10, 14],
            dom9: [0, 4, 7, 10, 14],
            add9: [0, 4, 7, 14],
            maj11: [0, 4, 7, 11, 14, 17],
            min11: [0, 3, 7, 10, 14, 17],
            maj13: [0, 4, 7, 11, 14, 17, 21],
            min13: [0, 3, 7, 10, 14, 17, 21],
        };

        // Emotion to musical mode mapping
        this.EMOTION_MODES = {
            excited: {
                scale: 'lydian',
                tempo: 140,
                dynamics: 'forte',
                articulation: 'staccato',
            },
            calm: {
                scale: 'major',
                tempo: 60,
                dynamics: 'piano',
                articulation: 'legato',
            },
            curious: {
                scale: 'mixolydian',
                tempo: 100,
                dynamics: 'mezzoForte',
                articulation: 'tenuto',
            },
            sleepy: {
                scale: 'aeolian',
                tempo: 50,
                dynamics: 'pianissimo',
                articulation: 'legato',
            },
            alert: {
                scale: 'dorian',
                tempo: 120,
                dynamics: 'forte',
                articulation: 'marcato',
            },
            pleased: {
                scale: 'majorPentatonic',
                tempo: 90,
                dynamics: 'mezzoForte',
                articulation: 'legato',
            },
            confused: {
                scale: 'wholeHalfDiminished',
                tempo: 80,
                dynamics: 'mezzoPiano',
                articulation: 'rubato',
            },
            energetic: {
                scale: 'bebopMajor',
                tempo: 160,
                dynamics: 'fortissimo',
                articulation: 'staccato',
            },
            melancholy: {
                scale: 'harmonicMinor',
                tempo: 70,
                dynamics: 'mezzoPiano',
                articulation: 'legato',
            },
            playful: {
                scale: 'blues',
                tempo: 110,
                dynamics: 'mezzoForte',
                articulation: 'swing',
            },
        };

        // Common chord progressions
        this.PROGRESSIONS = {
            // Pop/Rock progressions
            I_V_vi_IV: [1, 5, 6, 4], // Most common pop progression
            I_IV_V: [1, 4, 5], // Classic rock/blues
            ii_V_I: [2, 5, 1], // Jazz standard
            I_vi_IV_V: [1, 6, 4, 5], // 50s doo-wop
            vi_IV_I_V: [6, 4, 1, 5], // Alternative pop

            // Jazz progressions
            I_VI_ii_V: [1, 6, 2, 5], // Rhythm changes A
            iii_vi_ii_V: [3, 6, 2, 5], // Turnaround
            I_ii_iii_IV: [1, 2, 3, 4], // Modal jazz

            // Blues progressions
            I_I_I_I_IV_IV_I_I_V_IV_I_V: [1, 1, 1, 1, 4, 4, 1, 1, 5, 4, 1, 5], // 12-bar blues

            // Modal progressions
            i_VII_VI_VII: [1, 7, 6, 7], // Aeolian vamp
            I_II_IV_I: [1, 2, 4, 1], // Lydian progression
        };
    }

    /**
     * Convert note name to MIDI note number
     * @param {string} note - Note name (e.g., 'C4', 'A#3')
     * @returns {number} MIDI note number
     */
    noteToMidi(note) {
        const noteName = note.slice(0, -1);
        const octave = parseInt(note.slice(-1), 10);
        const noteIndex = this.NOTES.indexOf(noteName);

        if (noteIndex === -1) {
            throw new Error(`Invalid note: ${note}`);
        }

        // C4 = MIDI 60
        return (octave + 1) * 12 + noteIndex;
    }

    /**
     * Convert MIDI note number to frequency
     * @param {number} midiNote - MIDI note number
     * @returns {number} Frequency in Hz
     */
    midiToFrequency(midiNote) {
        // f = 440 * 2^((n - 69) / 12)
        return this.A4_FREQUENCY * Math.pow(2, (midiNote - 69) / 12);
    }

    /**
     * Convert note name to frequency
     * @param {string} note - Note name (e.g., 'C4', 'A#3')
     * @returns {number} Frequency in Hz
     */
    noteToFrequency(note) {
        return this.midiToFrequency(this.noteToMidi(note));
    }

    /**
     * Generate a scale from a root note
     * @param {string} root - Root note (e.g., 'C4')
     * @param {string} scaleType - Scale type from SCALES
     * @returns {Array} Array of frequencies
     */
    generateScale(root, scaleType = 'major') {
        const scale = this.SCALES[scaleType];
        if (!scale) {
            throw new Error(`Unknown scale type: ${scaleType}`);
        }

        const rootMidi = this.noteToMidi(root);
        return scale.map(interval => this.midiToFrequency(rootMidi + interval));
    }

    /**
     * Generate a chord from a root note
     * @param {string} root - Root note (e.g., 'C4')
     * @param {string} chordType - Chord type from CHORDS
     * @returns {Array} Array of frequencies
     */
    generateChord(root, chordType = 'major') {
        const chord = this.CHORDS[chordType];
        if (!chord) {
            throw new Error(`Unknown chord type: ${chordType}`);
        }

        const rootMidi = this.noteToMidi(root);
        return chord.map(interval => this.midiToFrequency(rootMidi + interval));
    }

    /**
     * Generate a chord progression
     * @param {string} key - Key center (e.g., 'C4')
     * @param {string} scaleType - Scale type for the key
     * @param {Array} progression - Array of scale degrees
     * @returns {Array} Array of chord arrays
     */
    generateProgression(key, scaleType = 'major', progression = this.PROGRESSIONS.I_V_vi_IV) {
        const scale = this.generateScale(key, scaleType);
        const chords = [];

        for (const degree of progression) {
            const chordRoot = scale[(degree - 1) % scale.length];

            // Determine chord quality based on scale degree
            let chordType = 'major';
            if (scaleType === 'major') {
                if (degree === 2 || degree === 3 || degree === 6) {
                    chordType = 'minor';
                } else if (degree === 7) {
                    chordType = 'diminished';
                }
            } else if (scaleType === 'naturalMinor') {
                if (degree === 1 || degree === 4 || degree === 5) {
                    chordType = 'minor';
                } else if (degree === 2) {
                    chordType = 'diminished';
                } else {
                    chordType = 'major';
                }
            }

            // Convert frequency back to note for chord generation
            const midiNote = Math.round(12 * Math.log2(chordRoot / this.A4_FREQUENCY) + 69);
            const octave = Math.floor(midiNote / 12) - 1;
            const noteIndex = midiNote % 12;
            const noteName = this.NOTES[noteIndex] + octave;

            chords.push({
                degree,
                root: chordRoot,
                frequencies: this.generateChord(noteName, chordType),
                type: chordType,
            });
        }

        return chords;
    }

    /**
     * Get musical parameters for an emotion
     * @param {string} emotion - Emotion name
     * @returns {Object} Musical parameters
     */
    getEmotionMusic(emotion) {
        return this.EMOTION_MODES[emotion] || this.EMOTION_MODES.calm;
    }

    /**
     * Generate Circle of Fifths progression
     * @param {string} startNote - Starting note
     * @param {number} steps - Number of steps around the circle
     * @param {boolean} clockwise - Direction (true = sharps, false = flats)
     * @returns {Array} Array of note names
     */
    circleOfFifths(startNote = 'C', steps = 12, clockwise = true) {
        const noteBase = startNote.replace(/\d/, '');
        let currentIndex = this.NOTES.indexOf(noteBase);
        const notes = [startNote];

        for (let i = 1; i < steps; i++) {
            // Perfect fifth = 7 semitones (clockwise) or 5 semitones (counter-clockwise)
            currentIndex = clockwise ? (currentIndex + 7) % 12 : (currentIndex + 5) % 12;

            notes.push(this.NOTES[currentIndex]);
        }

        return notes;
    }

    /**
     * Analyze interval between two notes
     * @param {string} note1 - First note
     * @param {string} note2 - Second note
     * @returns {Object} Interval information
     */
    analyzeInterval(note1, note2) {
        const midi1 = this.noteToMidi(note1);
        const midi2 = this.noteToMidi(note2);
        const semitones = Math.abs(midi2 - midi1);

        // Find interval name
        let intervalName = 'unknown';
        for (const [name, value] of Object.entries(this.INTERVALS)) {
            if (value === semitones % 12) {
                intervalName = name;
                break;
            }
        }

        return {
            semitones,
            intervalName,
            octaves: Math.floor(semitones / 12),
            consonant: [0, 3, 4, 5, 7, 8, 9, 12].includes(semitones % 12),
            ratio: this.getIntervalRatio(semitones % 12),
        };
    }

    /**
     * Get frequency ratio for an interval
     * @param {number} semitones - Number of semitones
     * @returns {string} Simplified ratio
     */
    getIntervalRatio(semitones) {
        const ratios = {
            0: '1:1', // Unison
            1: '16:15', // Minor second
            2: '9:8', // Major second
            3: '6:5', // Minor third
            4: '5:4', // Major third
            5: '4:3', // Perfect fourth
            6: '45:32', // Tritone
            7: '3:2', // Perfect fifth
            8: '8:5', // Minor sixth
            9: '5:3', // Major sixth
            10: '16:9', // Minor seventh
            11: '15:8', // Major seventh
            12: '2:1', // Octave
        };

        return ratios[semitones] || 'complex';
    }

    /**
     * Generate a melody based on parameters
     * @param {Object} params - Melody parameters
     * @returns {Array} Array of note objects with timing
     */
    generateMelody(params = {}) {
        const {
            key = 'C4',
            scale = 'major',
            length = 8,
            stepProbability = 0.7, // Probability of stepwise motion
            restProbability = 0.1, // Probability of rest
        } = params;

        const scaleNotes = this.generateScale(key, scale);
        const melody = [];
        let currentIndex = 0;

        for (let i = 0; i < length; i++) {
            // Decide if this is a rest
            if (Math.random() < restProbability) {
                melody.push({ frequency: 0, duration: 0.25, isRest: true });
                continue;
            }

            // Decide step size
            let nextIndex;
            if (Math.random() < stepProbability) {
                // Stepwise motion
                const direction = Math.random() < 0.5 ? -1 : 1;
                nextIndex = Math.max(0, Math.min(scaleNotes.length - 1, currentIndex + direction));
            } else {
                // Leap
                const leap = Math.floor(Math.random() * 3) + 2; // 2-4 scale degrees
                const direction = Math.random() < 0.5 ? -1 : 1;
                nextIndex = Math.max(
                    0,
                    Math.min(scaleNotes.length - 1, currentIndex + leap * direction)
                );
            }

            currentIndex = nextIndex;

            // Random duration
            const durations = [0.25, 0.5, 0.75, 1];
            const duration = durations[Math.floor(Math.random() * durations.length)];

            melody.push({
                frequency: scaleNotes[currentIndex],
                duration,
                isRest: false,
            });
        }

        return melody;
    }
}

export default MusicTheory;
