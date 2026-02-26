/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *                       ◐ ◑ ◒ ◓  SOUND SYSTEM  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Sound System - Web Audio API Integration for Emotional Audio
 * @author Emotive Engine Team
 * @version 2.0.0
 * @module SoundSystem
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Adds the VOICE of emotion through sound. Generates ambient tones that match
 * ║ emotional states and plays gesture sound effects. Uses Web Audio API for
 * ║ programmatic sound generation - no external audio files needed!
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎵 AUDIO FEATURES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Emotional ambient tones (frequency based on emotion)
 * │ • Gesture sound effects (pops, sweeps, chimes)
 * │ • Volume control with fade in/out
 * │ • Warning throttling to reduce console spam
 * │ • Graceful degradation if Web Audio unavailable
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎼 EMOTIONAL TONE MAPPING
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ EMOTION        FREQUENCY    WAVEFORM    VOLUME
 * │ neutral        220Hz        sine        0.1
 * │ joy            440Hz        sine        0.15
 * │ sadness        110Hz        sine        0.08
 * │ anger          330Hz        sawtooth    0.2
 * │ fear           550Hz        square      0.12
 * │ love           262Hz        sine        0.12
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */
import HarmonicSystem from './HarmonicSystem.js';
import { GestureSoundLibrary } from './GestureSoundLibrary.js';
import { AudioLayerManager } from './AudioLayerManager.js';

export class SoundSystem {
    constructor() {
        this.context = null;
        this.isEnabled = false;
        this.isInitialized = false;

        // Audio nodes
        this.nodes = {
            master: null, // Master gain node
            ambient: null, // Ambient oscillator for emotional tones
            effects: null, // Effects gain node for gesture sounds
        };

        // Harmonic system for musical intelligence
        this.harmonicSystem = null;
        this.useHarmonicSystem = false; // Toggle between old and new system

        // Track warning frequency to reduce spam
        this.warningTimestamps = {};
        this.warningThrottle = 5000; // Only show same warning every 5 seconds
        this.maxWarningKeys = 50; // Maximum warning keys to cache
        this.warningAccessOrder = []; // LRU tracking for warning keys

        // Current ambient oscillator
        this.currentOscillator = null;
        this.currentGain = null;

        // Default settings
        this.masterVolume = 0.5;
        this.ambientVolume = 0.1;

        // Emotional tone mappings
        this.emotionalTones = new Map([
            ['neutral', { frequency: 220, waveform: 'sine', volume: 0.1 }],
            ['joy', { frequency: 440, waveform: 'triangle', volume: 0.15 }],
            ['sadness', { frequency: 165, waveform: 'sine', volume: 0.08 }],
            ['anger', { frequency: 330, waveform: 'sawtooth', volume: 0.12 }],
            ['fear', { frequency: 880, waveform: 'square', volume: 0.09 }],
            ['surprise', { frequency: 660, waveform: 'triangle', volume: 0.13 }],
            ['disgust', { frequency: 110, waveform: 'sawtooth', volume: 0.07 }],
            ['love', { frequency: 528, waveform: 'sine', volume: 0.11 }],
        ]);

        // Emotional modifiers for gesture sounds (created once to prevent memory leaks)
        this.emotionalModifiers = new Map([
            ['neutral', { intensity: 1.0, speed: 1.0 }],
            ['joy', { intensity: 1.3, speed: 1.2 }],
            ['sadness', { intensity: 0.6, speed: 0.8 }],
            ['anger', { intensity: 1.5, speed: 1.4 }],
            ['fear', { intensity: 0.8, speed: 1.3 }],
            ['surprise', { intensity: 1.4, speed: 1.5 }],
            ['disgust', { intensity: 0.7, speed: 0.9 }],
            ['love', { intensity: 1.1, speed: 0.9 }],
        ]);
    }

    /**
     * Initialize Web Audio API and create node architecture
     * @returns {boolean} Success status
     */
    initialize() {
        try {
            // Check for Web Audio API support
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) {
                // SoundSystem: Web Audio API not supported, continuing without audio
                return false;
            }

            // Create audio context
            this.context = new AudioContextClass();

            // Initialize harmonic system
            this.harmonicSystem = new HarmonicSystem(this.context);

            // Handle suspended context (required by browser autoplay policies)
            if (this.context.state === 'suspended') {
                // Will be resumed on first user interaction
                // SoundSystem: AudioContext suspended, will resume on user interaction
            }

            // Create master gain node with default volume
            this.nodes.master = this.context.createGain();
            this.nodes.master.gain.setValueAtTime(this.masterVolume, this.context.currentTime);
            this.nodes.master.connect(this.context.destination);

            // Create effects gain node for gesture sounds
            this.nodes.effects = this.context.createGain();
            this.nodes.effects.gain.setValueAtTime(1.0, this.context.currentTime);
            this.nodes.effects.connect(this.nodes.master);

            this.isEnabled = true;
            this.isInitialized = true;

            // SoundSystem: Successfully initialized Web Audio API
            return true;
        } catch {
            // SoundSystem: Failed to initialize Web Audio API
            this.isEnabled = false;
            return false;
        }
    }

    /**
     * Resume audio context if suspended (call on user interaction)
     */
    async resumeContext() {
        if (this.context && this.context.state === 'suspended') {
            try {
                await this.context.resume();
                // Silently resume without logging
            } catch {
                // Silently fail - this is expected before user interaction
            }
        }
    }

    /**
     * Set master volume for all audio output
     * @param {number} volume - Volume level (0.0 to 1.0)
     * @param {string} currentEmotion - Current emotion for ambient tone volume update
     */
    setMasterVolume(volume, currentEmotion = null) {
        this.masterVolume = Math.max(0, Math.min(1, volume));

        if (this.isEnabled && this.nodes.master) {
            this.nodes.master.gain.setValueAtTime(this.masterVolume, this.context.currentTime);

            // Update ambient tone volume if active
            if (currentEmotion) {
                this.updateAmbientVolume(currentEmotion);
            }
        }
    }

    /**
     * Get current master volume
     * @returns {number} Current master volume
     */
    getMasterVolume() {
        return this.masterVolume;
    }

    /**
     * Check if sound system is available and enabled
     * @returns {boolean} Availability status
     */
    isAvailable() {
        return this.isEnabled && this.isInitialized;
    }

    /**
     * Enable or disable the harmonic music system
     * @param {boolean} enabled - Whether to enable harmonic system
     */
    setHarmonicMode(enabled) {
        this.useHarmonicSystem = enabled;

        if (enabled && this.harmonicSystem) {
            // Stop simple ambient tone when switching to harmonic mode
            this.stopAmbientTone();
            // SoundSystem: Switched to harmonic music mode
        } else if (!enabled && this.harmonicSystem) {
            // Stop harmonic system when switching back
            this.harmonicSystem.stopHarmony();
            // SoundSystem: Switched to simple sound mode
        }
    }

    /**
     * Start harmonic background music
     */
    startHarmony() {
        if (this.harmonicSystem && this.useHarmonicSystem && this.isAvailable()) {
            this.harmonicSystem.startHarmony();
        }
    }

    /**
     * Stop harmonic background music
     */
    stopHarmony() {
        if (this.harmonicSystem) {
            this.harmonicSystem.stopHarmony();
        }
    }

    /**
     * Set harmonic layer active state
     * @param {string} layer - Layer name (bass, chord, melody, pad)
     * @param {boolean} active - Whether layer should be active
     */
    setHarmonicLayer(layer, active) {
        if (this.harmonicSystem) {
            this.harmonicSystem.setLayerActive(layer, active);
        }
    }

    /**
     * Set harmonic effects mix
     * @param {number} wetness - Wet/dry mix (0-1)
     */
    setHarmonicEffects(wetness) {
        if (this.harmonicSystem) {
            this.harmonicSystem.setEffectsMix(wetness);
        }
    }

    /**
     * Get (or lazily create) the AudioLayerManager for stem-based adaptive music.
     * @returns {AudioLayerManager|null}
     */
    getAudioLayerManager() {
        if (!this.isAvailable()) return null;
        if (!this._audioLayerManager) {
            this._audioLayerManager = new AudioLayerManager(this.context);
        }
        return this._audioLayerManager;
    }

    /**
     * Clean up audio resources
     */
    cleanup() {
        try {
            // Stop current ambient oscillator
            if (this.currentOscillator) {
                this.currentOscillator.stop();
                this.currentOscillator = null;
            }

            if (this.currentGain) {
                this.currentGain = null;
            }

            // Close audio context
            if (this.context && this.context.state !== 'closed') {
                this.context.close();
            }

            // SoundSystem: Cleaned up audio resources
        } catch {
            // SoundSystem: Error during cleanup
        } finally {
            // Clean up audio layer manager
            if (this._audioLayerManager) {
                this._audioLayerManager.destroy();
                this._audioLayerManager = null;
            }
            // Always reset state regardless of errors
            this.context = null;
            this.nodes = { master: null, ambient: null, effects: null };
            this.currentOscillator = null;
            this.currentGain = null;
            this.isEnabled = false;
            this.isInitialized = false;
        }
    }

    /**
     * Get emotional tone configuration for given emotion
     * @param {string} emotion - Emotion name
     * @returns {Object|null} Tone configuration or null if not found
     */
    getEmotionalTone(emotion) {
        return this.emotionalTones.get(emotion) || null;
    }

    /**
     * Start ambient emotional tone for given emotion
     * @param {string} emotion - Emotion name
     * @param {number} transitionDuration - Transition duration in milliseconds (default: 500)
     */
    setAmbientTone(emotion, transitionDuration = 500) {
        if (!this.isAvailable()) {
            return;
        }

        // Use harmonic system if enabled
        if (this.useHarmonicSystem && this.harmonicSystem) {
            this.harmonicSystem.setEmotion(emotion);
            return;
        }

        const toneConfig = this.getEmotionalTone(emotion);
        if (!toneConfig) {
            // SoundSystem: Unknown emotion, cannot set ambient tone
            return;
        }

        try {
            // Resume context if suspended
            this.resumeContext();

            const { currentTime } = this.context;
            const transitionTime = transitionDuration / 1000; // Convert to seconds

            // Stop current oscillator with fade out
            if (this.currentOscillator && this.currentGain) {
                this.currentGain.gain.exponentialRampToValueAtTime(
                    0.001,
                    currentTime + transitionTime * 0.5
                );
                this.currentOscillator.stop(currentTime + transitionTime * 0.5);
            }

            // Create new oscillator and gain for the new tone
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();

            // Configure oscillator
            oscillator.type = toneConfig.waveform;
            oscillator.frequency.setValueAtTime(toneConfig.frequency, currentTime);

            // Configure gain with smooth transition
            const targetVolume = toneConfig.volume * this.masterVolume;
            gainNode.gain.setValueAtTime(0.001, currentTime); // Start silent
            gainNode.gain.exponentialRampToValueAtTime(targetVolume, currentTime + transitionTime);

            // Connect nodes
            oscillator.connect(gainNode);
            gainNode.connect(this.nodes.master);

            // Start oscillator
            oscillator.start(currentTime);

            // Store references
            this.currentOscillator = oscillator;
            this.currentGain = gainNode;

            // SoundSystem: Started ambient tone
        } catch {
            // SoundSystem: Failed to set ambient tone
        }
    }

    /**
     * Stop current ambient tone
     * @param {number} fadeOutDuration - Fade out duration in milliseconds (default: 500)
     */
    stopAmbientTone(fadeOutDuration = 500) {
        if (!this.isAvailable() || !this.currentOscillator) {
            return;
        }

        try {
            const { currentTime } = this.context;
            const fadeTime = fadeOutDuration / 1000; // Convert to seconds

            // Fade out current tone
            if (this.currentGain) {
                this.currentGain.gain.exponentialRampToValueAtTime(0.001, currentTime + fadeTime);
            }

            // Stop oscillator after fade
            this.currentOscillator.stop(currentTime + fadeTime);

            // Clear references
            this.currentOscillator = null;
            this.currentGain = null;

            // SoundSystem: Stopped ambient tone
        } catch {
            // SoundSystem: Failed to stop ambient tone
        }
    }

    /**
     * Update ambient tone volume based on master volume changes
     * @param {string} currentEmotion - Current emotion for volume calculation
     */
    updateAmbientVolume(currentEmotion) {
        if (!this.isAvailable() || !this.currentGain || !currentEmotion) {
            return;
        }

        const toneConfig = this.getEmotionalTone(currentEmotion);
        if (!toneConfig) {
            return;
        }

        try {
            const targetVolume = toneConfig.volume * this.masterVolume;
            const { currentTime } = this.context;

            this.currentGain.gain.exponentialRampToValueAtTime(targetVolume, currentTime + 0.1);
        } catch {
            // SoundSystem: Failed to update ambient volume
        }
    }

    /**
     * Play gesture sound effect with frequency envelope
     * @param {string} gestureId - Gesture identifier
     * @param {string} emotionalContext - Current emotion for intensity modifiers
     */
    playGestureSound(gestureId, emotionalContext = 'neutral') {
        if (!this.isAvailable()) {
            return;
        }

        // Use harmonic system if enabled
        if (this.useHarmonicSystem && this.harmonicSystem) {
            this.harmonicSystem.playGestureSound(gestureId);
            return;
        }

        const soundConfig = this.getGestureSoundConfig(gestureId);
        if (!soundConfig) {
            // Throttled warning for unknown gestures
            this.throttledWarn(
                `Unknown gesture "${gestureId}", cannot play sound`,
                `gesture_${gestureId}`
            );
            return;
        }

        try {
            // Resume context if suspended
            this.resumeContext();

            const { currentTime } = this.context;
            const duration = soundConfig.duration / 1000; // Convert to seconds

            // Apply emotional modifiers
            const modifiers = this.getEmotionalModifiers(emotionalContext);
            const baseVolume = soundConfig.volume * this.masterVolume * modifiers.intensity;

            // Create oscillator and gain for the effect
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();

            // Configure oscillator
            oscillator.type = soundConfig.waveform;

            // Apply frequency envelope
            this.applyFrequencyEnvelope(
                oscillator,
                soundConfig.frequencyEnvelope,
                currentTime,
                duration
            );

            // Apply volume envelope
            this.applyVolumeEnvelope(
                gainNode,
                soundConfig.volumeEnvelope,
                currentTime,
                duration,
                baseVolume
            );

            // Connect nodes
            oscillator.connect(gainNode);
            gainNode.connect(this.nodes.effects);

            // Start and stop oscillator
            oscillator.start(currentTime);
            oscillator.stop(currentTime + duration);

            // SoundSystem: Playing gesture sound
        } catch {
            // SoundSystem: Failed to play gesture sound
        }
    }

    /**
     * Get gesture sound configuration
     * @param {string} gestureId - Gesture identifier
     * @returns {Object|null} Sound configuration or null if not found
     */
    getGestureSoundConfig(gestureId) {
        return GestureSoundLibrary.getSoundConfig(gestureId);
    }

    /**
     * Apply frequency envelope to oscillator
     * @param {OscillatorNode} oscillator - Web Audio oscillator
     * @param {Array} envelope - Frequency envelope points
     * @param {number} startTime - Start time in audio context
     * @param {number} duration - Total duration in seconds
     */
    applyFrequencyEnvelope(oscillator, envelope, startTime, duration) {
        envelope.forEach(point => {
            const time = startTime + point.time * duration;
            oscillator.frequency.linearRampToValueAtTime(point.frequency, time);
        });
    }

    /**
     * Apply volume envelope to gain node
     * @param {GainNode} gainNode - Web Audio gain node
     * @param {Array} envelope - Volume envelope points
     * @param {number} startTime - Start time in audio context
     * @param {number} duration - Total duration in seconds
     * @param {number} baseVolume - Base volume level
     */
    applyVolumeEnvelope(gainNode, envelope, startTime, duration, baseVolume) {
        envelope.forEach((point, index) => {
            const time = startTime + point.time * duration;
            const volume = point.volume * baseVolume;

            if (index === 0) {
                gainNode.gain.setValueAtTime(volume, time);
            } else {
                gainNode.gain.linearRampToValueAtTime(volume, time);
            }
        });
    }

    /**
     * Get emotional modifiers for gesture sounds
     * @param {string} emotion - Current emotion
     * @returns {Object} Modifier values
     */
    getEmotionalModifiers(emotion) {
        return this.emotionalModifiers.get(emotion) || this.emotionalModifiers.get('neutral');
    }

    /**
     * Enable/disable quality reduction for performance
     * @param {boolean} enabled - Whether to reduce quality
     */
    setQualityReduction(enabled) {
        this.qualityReduction = enabled;

        if (enabled && this.audioContext) {
            // Reduce audio quality for performance
            // Lower sample rate if possible
            if (this.audioContext.sampleRate > 22050) {
                // Audio quality reduced for performance
            }
            // Reduce active oscillators
            this.maxOscillators = 2;
        } else {
            // Restore full quality
            this.maxOscillators = 4;
        }
    }

    /**
     * Check if Web Audio API is supported in current browser
     * @returns {boolean} Support status
     */
    static isSupported() {
        return !!(window.AudioContext || window.webkitAudioContext);
    }

    /**
     * Throttled warning to reduce console spam
     * @param {string} message - Warning message
     * @param {string} key - Unique key for this warning type
     */
    throttledWarn(message, key) {
        const now = Date.now();
        const lastWarning = this.warningTimestamps[key] || 0;

        if (now - lastWarning > this.warningThrottle) {
            // LRU eviction: Remove oldest key when limit reached
            if (Object.keys(this.warningTimestamps).length >= this.maxWarningKeys) {
                const oldestKey = this.warningAccessOrder.shift();
                delete this.warningTimestamps[oldestKey];
            }

            // SoundSystem warning
            this.warningTimestamps[key] = now;

            // Track access order for LRU
            const existingIndex = this.warningAccessOrder.indexOf(key);
            if (existingIndex !== -1) {
                this.warningAccessOrder.splice(existingIndex, 1);
            }
            this.warningAccessOrder.push(key);
        }
    }
}
