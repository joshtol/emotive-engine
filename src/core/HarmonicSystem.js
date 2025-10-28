/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝                                                                             
 *                      ♬ ♭ ♮ ♯  HARMONIC SYSTEM  ♯ ♮ ♭ ♬                      
 *                                                                                    
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Harmonic System - Real-time Musical Intelligence
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module HarmonicSystem
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ The CONDUCTOR of musical experiences. Orchestrates the music theory system with   
 * ║ the sound engine to create emotionally-responsive, harmonically-rich audio that   
 * ║ adapts in real-time to mascot states and user interactions.                       
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎭 HARMONIC FEATURES                                                              
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Real-time harmonic generation                                                   
 * │ • Emotion-driven key modulation                                                   
 * │ • Adaptive tempo and dynamics                                                     
 * │ • Gesture-to-chord mapping                                                        
 * │ • Harmonic tension and release                                                    
 * │ • Polyrhythmic patterns                                                           
 * │ • Voice leading and smooth transitions                                            
 * │ • Ambient pad generation                                                          
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

import MusicTheory from './MusicTheory.js';

class HarmonicSystem {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.musicTheory = new MusicTheory();
        
        // Current musical state
        this.currentKey = 'C4';
        this.currentScale = 'major';
        this.currentTempo = 120; // BPM
        this.currentEmotion = 'calm';
        
        // Active voices (oscillators and gains)
        this.voices = new Map();
        
        // Harmonic layers
        this.layers = {
            bass: { active: false, gain: 0.3 },
            chord: { active: false, gain: 0.2 },
            melody: { active: false, gain: 0.4 },
            pad: { active: false, gain: 0.15 }
        };
        
        // Master output
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.5;
        this.masterGain.connect(this.audioContext.destination);
        
        // Effects chain
        this.reverb = this.createReverb();
        this.delay = this.createDelay();
        this.filter = this.createFilter();
        
        // Connect effects
        this.filter.connect(this.delay);
        this.delay.connect(this.reverb);
        this.reverb.connect(this.masterGain);
        
        // Dry signal path
        this.dryGain = this.audioContext.createGain();
        this.dryGain.gain.value = 0.7;
        this.dryGain.connect(this.masterGain);
        
        // Wet signal path
        this.wetGain = this.audioContext.createGain();
        this.wetGain.gain.value = 0.3;
        this.wetGain.connect(this.filter);
        
        // Rhythm tracking
        this.nextNoteTime = 0;
        this.noteResolution = 0; // 0 = 16th, 1 = 8th, 2 = quarter
        this.noteLength = 0.05; // Length of "beep" (staccato)
        
        // Sequence tracking
        this.currentChordIndex = 0;
        this.currentMelodyNote = 0;
        this.progression = null;
        
        // Performance optimization
        this.isPlaying = false;
        this.lookahead = 25.0; // How frequently to call scheduling function (ms)
        this.scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)
    }
    
    /**
     * Create reverb effect using convolver
     */
    createReverb() {
        const convolver = this.audioContext.createConvolver();
        const length = this.audioContext.sampleRate * 2; // 2 second reverb
        const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                // Exponential decay
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
            }
        }
        
        convolver.buffer = impulse;
        return convolver;
    }
    
    /**
     * Create delay effect
     */
    createDelay() {
        const delay = this.audioContext.createDelay(1.0);
        delay.delayTime.value = 0.15; // 150ms delay
        
        const feedback = this.audioContext.createGain();
        feedback.gain.value = 0.3;
        
        delay.connect(feedback);
        feedback.connect(delay);
        
        return delay;
    }
    
    /**
     * Create filter for tone shaping
     */
    createFilter() {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        filter.Q.value = 1;
        return filter;
    }
    
    /**
     * Update emotion and adapt musical parameters
     */
    setEmotion(emotion) {
        this.currentEmotion = emotion;
        const musicParams = this.musicTheory.getEmotionMusic(emotion);
        
        // Update scale and tempo
        this.currentScale = musicParams.scale;
        this.currentTempo = musicParams.tempo;
        
        // Adapt filter based on emotion
        const filterSettings = {
            excited: { freq: 4000, Q: 2 },
            calm: { freq: 1500, Q: 0.7 },
            curious: { freq: 2500, Q: 1.5 },
            sleepy: { freq: 800, Q: 0.5 },
            alert: { freq: 3000, Q: 1.8 },
            energetic: { freq: 5000, Q: 2.5 }
        };
        
        const settings = filterSettings[emotion] || { freq: 2000, Q: 1 };
        this.filter.frequency.exponentialRampToValueAtTime(
            settings.freq,
            this.audioContext.currentTime + 0.5
        );
        this.filter.Q.linearRampToValueAtTime(
            settings.Q,
            this.audioContext.currentTime + 0.5
        );
        
        // Generate new progression for this emotion
        this.generateEmotionProgression();
    }
    
    /**
     * Generate chord progression based on current emotion
     */
    generateEmotionProgression() {
        const progressionMap = {
            excited: 'I_V_vi_IV',
            calm: 'I_vi_IV_V',
            curious: 'ii_V_I',
            sleepy: 'vi_IV_I_V',
            alert: 'I_IV_V',
            energetic: 'I_V_vi_IV'
        };
        
        const progressionType = progressionMap[this.currentEmotion] || 'I_V_vi_IV';
        this.progression = this.musicTheory.generateProgression(
            this.currentKey,
            this.currentScale,
            this.musicTheory.PROGRESSIONS[progressionType]
        );
    }
    
    /**
     * Play a chord with voice leading
     */
    playChord(frequencies, duration = 1.0, attack = 0.01) {
        const startTime = this.audioContext.currentTime;
        const chordGain = this.audioContext.createGain();
        
        // ADSR envelope
        chordGain.gain.setValueAtTime(0, startTime);
        chordGain.gain.linearRampToValueAtTime(this.layers.chord.gain, startTime + attack);
        chordGain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        // Connect to wet/dry mix
        chordGain.connect(this.dryGain);
        chordGain.connect(this.wetGain);
        
        // Create oscillators for each note
        const oscillators = frequencies.map((freq, index) => {
            const osc = this.audioContext.createOscillator();
            osc.frequency.value = freq;
            
            // Different waveforms for different voices
            if (index === 0) osc.type = 'sine';        // Root
            else if (index === 1) osc.type = 'triangle'; // Third
            else osc.type = 'sawtooth';                // Fifth and extensions
            
            // Slight detuning for richness
            osc.detune.value = (Math.random() - 0.5) * 10;
            
            osc.connect(chordGain);
            osc.start(startTime);
            osc.stop(startTime + duration);
            
            return osc;
        });
        
        // Store for potential manipulation
        const chordId = `chord_${Date.now()}`;
        this.voices.set(chordId, { oscillators, gain: chordGain });
        
        // Cleanup
        setTimeout(() => {
            this.voices.delete(chordId);
        }, (duration + 0.1) * 1000);
    }
    
    /**
     * Play a melodic sequence
     */
    playMelody(notes, baseTime = 0) {
        const startTime = baseTime || this.audioContext.currentTime;
        let currentTime = startTime;
        
        notes.forEach((note, _index) => {
            if (note.isRest) {
                currentTime += note.duration;
                return;
            }
            
            const osc = this.audioContext.createOscillator();
            const noteGain = this.audioContext.createGain();
            
            osc.frequency.value = note.frequency;
            osc.type = 'sine';
            
            // Vibrato for expressiveness
            const vibrato = this.audioContext.createOscillator();
            const vibratoGain = this.audioContext.createGain();
            vibrato.frequency.value = 5; // 5 Hz vibrato
            vibratoGain.gain.value = 5; // 5 cents depth
            
            vibrato.connect(vibratoGain);
            vibratoGain.connect(osc.frequency);
            
            // Note envelope
            noteGain.gain.setValueAtTime(0, currentTime);
            noteGain.gain.linearRampToValueAtTime(this.layers.melody.gain, currentTime + 0.01);
            noteGain.gain.exponentialRampToValueAtTime(0.01, currentTime + note.duration * 0.9);
            
            osc.connect(noteGain);
            noteGain.connect(this.dryGain);
            noteGain.connect(this.wetGain);
            
            osc.start(currentTime);
            osc.stop(currentTime + note.duration);
            vibrato.start(currentTime);
            vibrato.stop(currentTime + note.duration);
            
            currentTime += note.duration;
        });
    }
    
    /**
     * Create ambient pad layer
     */
    createPad(frequency, duration = 4.0) {
        const startTime = this.audioContext.currentTime;
        const voices = 4; // Number of detuned voices
        const padGain = this.audioContext.createGain();
        
        // Slow attack and release for pad
        padGain.gain.setValueAtTime(0, startTime);
        padGain.gain.linearRampToValueAtTime(this.layers.pad.gain, startTime + 1.0);
        padGain.gain.linearRampToValueAtTime(this.layers.pad.gain, startTime + duration - 1.0);
        padGain.gain.linearRampToValueAtTime(0, startTime + duration);
        
        padGain.connect(this.wetGain); // Pads sound better with effects
        
        for (let i = 0; i < voices; i++) {
            const osc = this.audioContext.createOscillator();
            osc.frequency.value = frequency;
            osc.type = 'sawtooth';
            
            // Detune each voice
            osc.detune.value = (i - voices / 2) * 15;
            
            // Individual voice gain for stereo spread
            const voiceGain = this.audioContext.createGain();
            voiceGain.gain.value = 1 / voices;
            
            // Add slow LFO for movement
            const lfo = this.audioContext.createOscillator();
            const lfoGain = this.audioContext.createGain();
            lfo.frequency.value = 0.2 + (i * 0.1); // Slightly different LFO rates
            lfoGain.gain.value = 10; // Subtle pitch modulation
            
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            
            osc.connect(voiceGain);
            voiceGain.connect(padGain);
            
            osc.start(startTime);
            osc.stop(startTime + duration);
            lfo.start(startTime);
            lfo.stop(startTime + duration);
        }
    }
    
    /**
     * Map gesture to musical response
     */
    playGestureSound(gesture) {
        const gestureMap = {
            breathe: () => {
                // Breathing creates slow, expanding chords
                const chord = this.musicTheory.generateChord(this.currentKey, 'maj7');
                this.playChord(chord, 2.0, 0.5);
                this.createPad(chord[0] / 2, 3.0); // Sub bass pad
            },
            
            excited: () => {
                // Excited creates ascending arpeggios
                const scale = this.musicTheory.generateScale(this.currentKey, 'lydian');
                const arpeggio = scale.map((freq, _i) => ({
                    frequency: freq,
                    duration: 0.1,
                    isRest: false
                }));
                this.playMelody(arpeggio);
            },
            
            wave: () => {
                // Wave creates a glissando effect
                const startFreq = this.musicTheory.noteToFrequency(this.currentKey);
                const endFreq = startFreq * 2; // Octave up
                
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                
                osc.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
                osc.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + 0.5);
                osc.frequency.exponentialRampToValueAtTime(startFreq, this.audioContext.currentTime + 1.0);
                
                gain.gain.setValueAtTime(0, this.audioContext.currentTime);
                gain.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.1);
                gain.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.9);
                gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1.0);
                
                osc.connect(gain);
                gain.connect(this.wetGain);
                
                osc.start();
                osc.stop(this.audioContext.currentTime + 1.0);
            },
            
            morph: () => {
                // Morph creates harmonic morphing between chords
                const chord1 = this.musicTheory.generateChord(this.currentKey, 'minor');
                const chord2 = this.musicTheory.generateChord(this.currentKey, 'major');
                
                // Play first chord
                this.playChord(chord1, 0.5);
                
                // Morph to second chord
                setTimeout(() => {
                    this.playChord(chord2, 1.0);
                }, 400);
            },
            
            jump: () => {
                // Jump creates staccato chord stabs
                const chord = this.musicTheory.generateChord(this.currentKey, 'dom7');
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        this.playChord(chord.map(f => f * Math.pow(2, i/12)), 0.1, 0.001);
                    }, i * 100);
                }
            },
            
            curious: () => {
                // Curious creates questioning melodic phrases
                const melody = this.musicTheory.generateMelody({
                    key: this.currentKey,
                    scale: 'mixolydian',
                    length: 5,
                    stepProbability: 0.3
                });
                this.playMelody(melody);
            }
        };
        
        const soundFunction = gestureMap[gesture];
        if (soundFunction) {
            soundFunction();
        }
    }
    
    /**
     * Start background harmony generation
     */
    startHarmony() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.currentChordIndex = 0;
        this.nextNoteTime = this.audioContext.currentTime;
        
        // Generate initial progression
        this.generateEmotionProgression();
        
        // Start the scheduling loop
        this.scheduleHarmony();
    }
    
    /**
     * Schedule harmony playback
     */
    scheduleHarmony() {
        if (!this.isPlaying) return;
        
        // Schedule notes that need to play in the next interval
        while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
            // Play current chord in progression
            if (this.progression && this.layers.chord.active) {
                const chord = this.progression[this.currentChordIndex];
                this.playChord(chord.frequencies, 0.5);
                
                // Advance to next chord
                this.currentChordIndex = (this.currentChordIndex + 1) % this.progression.length;
            }
            
            // Generate and play bass line
            if (this.layers.bass.active && this.progression) {
                const bassNote = this.progression[this.currentChordIndex].frequencies[0] / 2;
                this.playBassNote(bassNote, 0.25);
            }
            
            // Advance time based on tempo
            const secondsPerBeat = 60.0 / this.currentTempo;
            this.nextNoteTime += 0.25 * secondsPerBeat; // 16th notes
        }
        
        // Continue scheduling
        setTimeout(() => this.scheduleHarmony(), this.lookahead);
    }
    
    /**
     * Play a bass note
     */
    playBassNote(frequency, duration) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.frequency.value = frequency;
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(this.layers.bass.gain, this.audioContext.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.dryGain);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + duration);
    }
    
    /**
     * Stop harmony generation
     */
    stopHarmony() {
        this.isPlaying = false;
    }
    
    /**
     * Set layer active state
     */
    setLayerActive(layer, active) {
        if (this.layers[layer]) {
            this.layers[layer].active = active;
        }
    }
    
    /**
     * Set master volume
     */
    setMasterVolume(volume) {
        this.masterGain.gain.exponentialRampToValueAtTime(
            Math.max(0.01, volume),
            this.audioContext.currentTime + 0.1
        );
    }
    
    /**
     * Set wet/dry mix for effects
     */
    setEffectsMix(wetness) {
        const dry = 1 - wetness;
        this.dryGain.gain.linearRampToValueAtTime(dry, this.audioContext.currentTime + 0.1);
        this.wetGain.gain.linearRampToValueAtTime(wetness, this.audioContext.currentTime + 0.1);
    }
}

export default HarmonicSystem;