/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Dance Choreographer
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Automatic dance choreography system triggered by audio signals
 * @author Emotive Engine Team
 * @module 3d/animation/DanceChoreographer
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║ CONCEPT
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Once BPM is locked, the mascot should start dancing automatically. This module
 * ║ monitors audio signals (bass energy, vocal flux, spectral data) and intelligently
 * ║ triggers gestures, switches groove presets, and fires effects at musically
 * ║ appropriate moments.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * FEATURES:
 * • Audio-driven gesture triggering based on bass/vocal/spectral analysis
 * • Automatic groove preset switching with 2-bar quantized transitions
 * • Intensity slider for user control (0-1)
 * • Glow effect safety limits (epilepsy-safe)
 * • Section detection for chorus/verse groove matching
 *
 * ARCHITECTURE:
 * ┌──────────────────────────────────────────────────────────────────────────────────┐
 * │  Audio Stream → AudioDeformer → DanceChoreographer → Rhythm3DAdapter/Mascot     │
 * │                     ↓                    ↓                                       │
 * │              bass/vocal/flux     gesture triggers                                │
 * │              spectral data       groove switches                                 │
 * └──────────────────────────────────────────────────────────────────────────────────┘
 *
 * SAFETY:
 * • Glow effects limited to max 2Hz frequency changes
 * • Max glow boost capped at 1.3x (not 3x)
 * • 2 second cooldown between glow events
 * • Max 1 flash per 8 bars
 */

import { GROOVE_PRESETS } from './Rhythm3DAdapter.js';
import { setMoonPhase } from '../geometries/Moon.js';

// ═══════════════════════════════════════════════════════════════════════════════════════
// GESTURE PALETTE
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * ACCENT GESTURES (Dance-friendly - boost groove, don't compete)
 * These are the PRIMARY gestures to use during dancing because they
 * work WITH the groove as punctuation rather than fighting it.
 *
 * Accent gestures use scaleBoost, rotationBoost, positionBoost instead
 * of absolute position/rotation/scale, so they layer on top of groove.
 */
const ACCENT_GESTURES = {
    // Beat punctuation - quick accents on the beat
    punctuation: ['pop', 'bob', 'flare', 'dip'],
    // Movement accents - subtle position/rotation boosts
    movement: ['swagger', 'dip', 'bob'],
    // Build/release - for section changes
    dynamics: ['swell', 'flare']
};

/**
 * Motion-based gestures (ABSOLUTE - use sparingly during dance)
 * These create their own motion and compete with groove.
 * Best for special moments like drops, breakdowns, or climactic points.
 */
const MOTION_GESTURES = {
    // Rhythmic - beat-synced (can fight groove)
    rhythmic: ['wiggle', 'headBob', 'nod', 'sway'],
    // Expressive - for special moments only
    expressive: ['spin', 'jump', 'twist', 'hula'],
    // Accent - subtle emphasis
    accent: ['twitch', 'lean', 'tilt']
};

/**
 * Glow-based gestures (USE SPARINGLY - brightness changes)
 * These are rate-limited for epilepsy safety
 */
const GLOW_GESTURES = ['flash', 'glow', 'burst', 'flicker'];

/**
 * Gesture pools by energy level
 * Single gestures are the norm; combos are rare and reserved for high energy
 */
const GESTURE_POOLS = {
    // Low energy: gentle accents + subtle absolutes (no combos)
    subtle: {
        single: ['pop', 'bob', 'swell', 'nod', 'sway', 'tilt'],
        combo: []  // No combos at low energy
    },
    // Medium energy: moderate variety (rare combos)
    moderate: {
        single: ['pop', 'bob', 'dip', 'swagger', 'bounce', 'wiggle', 'headBob', 'lean'],
        combo: [['pop', 'bob'], ['dip', 'swell']]  // 10% chance
    },
    // High energy: full variety (occasional combos)
    energetic: {
        single: ['flare', 'swagger', 'dip', 'spin', 'jump', 'twist', 'hula'],
        combo: [['flare', 'bob'], ['pop', 'dip'], ['swagger', 'flare']]  // 15% chance
    }
};

/**
 * Morph targets available for section changes
 * Each target specifies geometry and optional variant (eclipse, phase, material)
 *
 * Safe geometries with compatible material systems:
 * - Crystal-type: crystal, rough, heart, star (CrystalSoul + SSS shader)
 * - Moon: phases (full, new, crescent, etc.) and lunar eclipse (blood moon)
 * - Sun: normal and solar eclipses (annular, total)
 */
const MORPH_TARGETS = [
    // Crystal family (SSS shader + CrystalSoul)
    { geometry: 'crystal', variant: null },
    { geometry: 'rough', variant: null },
    { geometry: 'heart', variant: null },
    { geometry: 'star', variant: null },

    // Moon variants
    { geometry: 'moon', variant: { type: 'phase', value: 'full' } },
    { geometry: 'moon', variant: { type: 'phase', value: 'waxing-gibbous' } },
    { geometry: 'moon', variant: { type: 'phase', value: 'first-quarter' } },
    { geometry: 'moon', variant: { type: 'phase', value: 'waxing-crescent' } },
    { geometry: 'moon', variant: { type: 'phase', value: 'new' } },
    { geometry: 'moon', variant: { type: 'eclipse', value: 'partial' } },
    { geometry: 'moon', variant: { type: 'eclipse', value: 'total' } },  // Blood moon

    // Sun variants
    { geometry: 'sun', variant: null },  // Normal sun
    { geometry: 'sun', variant: { type: 'eclipse', value: 'annular' } },
    { geometry: 'sun', variant: { type: 'eclipse', value: 'total' } }
];

/**
 * Emotions available for automatic switching during dance
 * Grouped by energy/mood to enable smart transitions
 */
const DANCE_EMOTIONS = {
    // High energy emotions - for drops, chorus, peak moments
    high: ['joy', 'excited', 'euphoria', 'surprise'],
    // Medium energy emotions - for verses, builds
    medium: ['focused', 'love', 'calm', 'neutral'],
    // Low energy emotions - for breakdowns, outros
    low: ['resting', 'calm', 'sadness'],
    // Special/dramatic emotions - rare, for impact moments
    dramatic: ['anger', 'fear', 'suspicion', 'glitch', 'disgust']
};

/**
 * Flat list of all dance-safe emotions
 */
const ALL_DANCE_EMOTIONS = [
    'joy', 'excited', 'euphoria', 'surprise',
    'focused', 'love', 'calm', 'neutral',
    'resting', 'sadness',
    'anger', 'fear', 'suspicion', 'glitch'
];

// ═══════════════════════════════════════════════════════════════════════════════════════
// ENERGY THRESHOLDS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Audio energy thresholds for groove selection
 * Higher values = more demanding criteria
 */
const ENERGY_THRESHOLDS = {
    // groove1 (subtle): Low energy sections - verse, breakdown
    subtle: { bass: 0.0, vocal: 0.0 },
    // groove2 (energetic): High energy sections - chorus, drop
    energetic: { bass: 0.55, vocal: 0.35 },
    // groove3 (flowing): Medium energy with melodic content - bridge, build
    flowing: { bass: 0.25, vocal: 0.50 }
};

/**
 * Safety limits for glow effects
 */
const GLOW_SAFETY = {
    maxHz: 2,              // No faster than 2Hz changes
    maxBoost: 1.3,         // Cap brightness at 130%
    cooldownMs: 800,       // 0.8 seconds between glow events (was 2s)
    flashesPerPhrase: 2,   // Max 2 flashes per 4 bars (was 1 per 8)
    minBarsBetweenFlash: 4 // Minimum bars between flash effects (was 8)
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// DANCE CHOREOGRAPHER CLASS
// ═══════════════════════════════════════════════════════════════════════════════════════

export class DanceChoreographer {
    constructor() {
        // References (set via setters)
        this.rhythmAdapter = null;
        this.mascot = null;
        this.audioDeformer = null;

        // State
        this.enabled = false;
        this.intensity = 0.5;          // 0-1, affects gesture frequency & amplitude
        this.currentGroove = 'groove1';
        this.lastGestureTime = 0;
        this.lastGlowTime = 0;
        this.lastFlashBar = -GLOW_SAFETY.minBarsBetweenFlash;
        this.barCount = 0;
        this.lastBarProgress = 0;

        // Rolling averages for section detection
        this._bassHistory = [];
        this._vocalHistory = [];
        this._historyLength = 60; // ~2 seconds at 30fps

        // Gesture scheduling
        this._pendingGestures = [];
        this._gesturesThisBar = 0;
        this._lastGestureBar = -1;

        // Morph tracking
        this._lastMorphBar = -16;  // Start with cooldown expired
        this._currentTarget = { geometry: 'crystal', variant: null };  // Current morph target
        this._baseTarget = { geometry: 'crystal', variant: null };     // "Home" target to return to
        this._morphReturnTimeout = null;    // Timer for returning to base geometry

        // Emotion tracking
        this._lastEmotionBar = -12;  // Start with cooldown expired
        this._currentEmotion = 'neutral';
        this._baseEmotion = 'neutral';  // "Home" emotion to return to
        this._emotionReturnTimeout = null;  // Timer for returning to base emotion

        // Configuration
        this.config = {
            // How often to trigger gestures (in bars)
            // At 100% intensity: 4 / (0.5 + 1.0) = 2.67 → rounds to 3 bars
            // At 50% intensity: 4 / (0.5 + 0.5) = 4 bars
            // At 0% intensity: 4 / (0.5 + 0) = 8 bars
            gestureFrequencyBars: 4,       // Base: every 4 bars (intentional, not frantic)
            minGestureIntervalMs: 800,     // Minimum time between gestures (longer)

            // Combo probability by energy level
            comboProbability: {
                subtle: 0,      // No combos at low energy
                moderate: 0.10, // 10% chance at medium energy
                energetic: 0.15 // 15% chance at high energy
            },

            // Morph settings (geometry changes on section changes)
            morphEnabled: true,
            morphCooldownBars: 16,         // Minimum 16 bars between morphs (~8 seconds at 120bpm)
            morphEnergyThreshold: 0.5,     // Only morph when energy changes significantly
            morphReturnBars: 8,            // Bars before morphing back to base geometry (~4 sec at 120bpm)

            // Emotion settings (mood changes during dance)
            emotionEnabled: true,
            emotionCooldownBars: 12,       // Minimum 12 bars between emotion changes (~6 seconds at 120bpm)
            emotionReturnBars: 16,         // Bars before returning to base emotion (~8 sec at 120bpm)
            emotionMatchEnergy: true,      // Match emotion energy level to audio energy
            dramaticEmotionProbability: 0.1, // 10% chance of dramatic emotion on high energy

            // Groove switching
            grooveSwitchBars: 2,           // Transition duration
            energySmoothing: 0.05,         // How fast energy averages update

            // Intensity scaling
            intensityAffectsFrequency: true,
            intensityAffectsAmplitude: true,

            // Glow settings (with safety limits)
            glowEnabled: true,
            maxGlowBoost: GLOW_SAFETY.maxBoost,
            glowCooldownMs: GLOW_SAFETY.cooldownMs,

            // Auto-enable when BPM locks
            autoEnableOnLock: true
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════════════
    // SETUP
    // ═══════════════════════════════════════════════════════════════════════════════════

    /**
     * Set rhythm adapter reference
     * @param {Object} adapter - Rhythm3DAdapter instance
     */
    setRhythmAdapter(adapter) {
        this.rhythmAdapter = adapter;
    }

    /**
     * Set mascot reference for triggering gestures
     * @param {Object} mascot - Mascot instance with gesture() method
     */
    setMascot(mascot) {
        this.mascot = mascot;

        // Sync geometry from mascot to avoid morph crashes
        if (mascot?.core3D?.geometryType) {
            const geometry = mascot.core3D.geometryType;
            this._currentTarget = { geometry, variant: null };
            this._baseTarget = { geometry, variant: null };
        }

        // Sync emotion from mascot
        if (mascot?.core3D?.emotion) {
            this._currentEmotion = mascot.core3D.emotion;
            this._baseEmotion = mascot.core3D.emotion;
        }
    }

    /**
     * Set audio deformer reference for audio signals
     * @param {Object} deformer - AudioDeformer instance
     */
    setAudioDeformer(deformer) {
        this.audioDeformer = deformer;
    }

    /**
     * Enable choreographer
     */
    enable() {
        this.enabled = true;
    }

    /**
     * Disable choreographer
     */
    disable() {
        this.enabled = false;
    }

    /**
     * Set dance intensity (0-1)
     * Higher intensity = more frequent gestures, larger movements
     * @param {number} value - Intensity value 0-1
     */
    setIntensity(value) {
        this.intensity = Math.max(0, Math.min(1, value));
    }

    /**
     * Get current intensity
     * @returns {number} Current intensity 0-1
     */
    getIntensity() {
        return this.intensity;
    }

    // ═══════════════════════════════════════════════════════════════════════════════════
    // MAIN UPDATE LOOP
    // ═══════════════════════════════════════════════════════════════════════════════════

    /**
     * Update choreographer - call every frame
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {Object} audioData - Audio analysis data (bass, vocal, flux)
     */
    update(deltaTime, audioData = null) {
        if (!this.rhythmAdapter) {
            console.log('[DanceChoreographer] No rhythmAdapter!');
            return;
        }

        // Check if we should auto-enable when BPM locks
        // BPM detector is on the mascot instance, not on rhythmAdapter
        if (this.config.autoEnableOnLock && !this.enabled && this.mascot) {
            const bpmDetector = this.mascot._bpmDetector;
            if (bpmDetector) {
                const status = bpmDetector.getStatus();
                if (status?.finalized) {
                    this.enable();
                    this.setIntensity(1.0); // Full intensity when auto-enabled
                    console.log('[DanceChoreographer] Auto-enabled at full intensity - BPM locked!');
                }
            }
        }

        // Skip rest of update if not enabled
        if (!this.enabled) return;

        // Debug: Log barProgress periodically (every ~2 seconds)
        if (!this._lastBarProgressLog || performance.now() - this._lastBarProgressLog > 2000) {
            const barProg = this.rhythmAdapter?.barProgress ?? 'N/A';
            const beatProg = this.rhythmAdapter?.beatProgress ?? 'N/A';
            const isPlaying = this.rhythmAdapter?.isPlaying?.() ?? false;
            console.log(`[DanceChoreographer] barProgress=${typeof barProg === 'number' ? barProg.toFixed(3) : barProg}, beatProgress=${typeof beatProg === 'number' ? beatProg.toFixed(3) : beatProg}, isPlaying=${isPlaying}, barCount=${this.barCount}`);
            this._lastBarProgressLog = performance.now();
        }

        // Get audio data from deformer if not provided
        const audio = audioData || this._getAudioData();

        // Update rolling averages
        this._updateEnergyHistory(audio);

        // Detect bar transitions
        this._detectBarTransition();

        // Decide groove preset based on audio energy
        this._updateGroovePreset();

        // Trigger gestures at appropriate moments
        this._triggerGestures(audio);

        // Consider morphing on significant energy changes
        this._considerMorph(audio);

        // Consider emotion changes based on energy/section
        this._considerEmotion(audio);
    }

    /**
     * Get audio data from AudioDeformer
     * @private
     * @returns {Object} Audio data object
     */
    _getAudioData() {
        if (!this.audioDeformer) {
            return { bass: 0, vocal: 0, flux: 0 };
        }

        return {
            bass: this.audioDeformer.bassEnergy || 0,
            vocal: this.audioDeformer.vocalPresence || 0,
            flux: this.audioDeformer.transientStrength || 0
        };
    }

    /**
     * Update rolling energy averages
     * @private
     * @param {Object} audio - Current audio data
     */
    _updateEnergyHistory(audio) {
        // Add to history
        this._bassHistory.push(audio.bass);
        this._vocalHistory.push(audio.vocal);

        // Trim to max length
        while (this._bassHistory.length > this._historyLength) {
            this._bassHistory.shift();
        }
        while (this._vocalHistory.length > this._historyLength) {
            this._vocalHistory.shift();
        }
    }

    /**
     * Get smoothed average of energy history
     * @private
     * @param {number[]} history - Energy history array
     * @returns {number} Smoothed average
     */
    _getSmoothedEnergy(history) {
        if (history.length === 0) return 0;
        return history.reduce((a, b) => a + b, 0) / history.length;
    }

    /**
     * Detect bar boundary crossings
     * @private
     */
    _detectBarTransition() {
        if (!this.rhythmAdapter) return;

        // Only count bars when rhythm is actually playing
        // This prevents phantom bar counting during idle or before music starts
        const isPlaying = this.rhythmAdapter?.isPlaying?.() ?? false;
        if (!isPlaying) {
            // Reset lastBarProgress when not playing so we don't get false wraps when starting
            this.lastBarProgress = 0;
            return;
        }

        const currentBarProgress = this.rhythmAdapter.barProgress || 0;

        // Detect bar boundary: progress wraps from high value back to low value
        // Use a more robust check that handles cases where we might miss the exact wrap
        // due to frame rate or timing issues (e.g., going from 0.75 to 0.25 directly)
        const wrapped = currentBarProgress < this.lastBarProgress - 0.5;

        if (wrapped) {
            this.barCount++;
            this._gesturesThisBar = 0;
            console.log(`[DanceChoreographer] Bar transition! barCount=${this.barCount} (${this.lastBarProgress.toFixed(2)} → ${currentBarProgress.toFixed(2)})`);
        }

        this.lastBarProgress = currentBarProgress;
    }

    // ═══════════════════════════════════════════════════════════════════════════════════
    // GROOVE PRESET SWITCHING
    // ═══════════════════════════════════════════════════════════════════════════════════

    /**
     * Update groove preset based on audio energy
     * Uses 2-bar quantized transitions for smooth changes
     * @private
     */
    _updateGroovePreset() {
        if (!this.rhythmAdapter) return;

        // Get smoothed energy levels
        const avgBass = this._getSmoothedEnergy(this._bassHistory);
        const avgVocal = this._getSmoothedEnergy(this._vocalHistory);

        // Detect appropriate groove preset
        const newGroove = this._detectGroovePreset(avgBass, avgVocal);

        // Switch if different (with 2-bar transition)
        if (newGroove !== this.currentGroove) {
            this._switchGroove(newGroove);
        }
    }

    /**
     * Detect appropriate groove preset based on energy levels
     * @private
     * @param {number} bass - Bass energy (0-1)
     * @param {number} vocal - Vocal presence (0-1)
     * @returns {string} Groove preset name
     */
    _detectGroovePreset(bass, vocal) {
        // Scale thresholds by intensity (lower intensity = harder to reach energetic)
        const intensityScale = 0.5 + this.intensity * 0.5; // 0.5-1.0

        // Check for energetic (high bass = drop/chorus)
        if (bass > ENERGY_THRESHOLDS.energetic.bass * intensityScale) {
            return 'groove2';
        }

        // Check for flowing (high vocals, moderate bass = melodic section)
        if (vocal > ENERGY_THRESHOLDS.flowing.vocal * intensityScale &&
            bass < ENERGY_THRESHOLDS.flowing.bass * 1.5) {
            return 'groove3';
        }

        // Default to subtle
        return 'groove1';
    }

    /**
     * Switch to a new groove preset with quantized transition
     * @private
     * @param {string} newGroove - New groove preset name
     */
    _switchGroove(newGroove) {
        if (!this.rhythmAdapter || !GROOVE_PRESETS[newGroove]) return;

        // Use existing setGroove API with 2-bar quantized transition
        this.rhythmAdapter.setGroove(newGroove, {
            quantize: true,
            bars: this.config.grooveSwitchBars
        });

        this.currentGroove = newGroove;
    }

    // ═══════════════════════════════════════════════════════════════════════════════════
    // GESTURE TRIGGERING
    // ═══════════════════════════════════════════════════════════════════════════════════

    /**
     * Decide when and what gestures to trigger
     * @private
     * @param {Object} audio - Current audio data
     */
    _triggerGestures(audio) {
        if (!this.mascot) {
            console.log('[DanceChoreographer] _triggerGestures: No mascot reference!');
            return;
        }

        // Only trigger gestures when rhythm is actually playing
        // This prevents premature gesture firing before music starts
        const isPlaying = this.rhythmAdapter?.isPlaying?.() ?? false;
        if (!isPlaying) {
            // Reset lastGestureBar when not playing so we can fire immediately when rhythm starts
            this._lastGestureBar = -1;
            return;
        }

        const now = performance.now();

        // Check minimum interval
        if (now - this.lastGestureTime < this.config.minGestureIntervalMs) {
            return;
        }

        // Calculate gesture frequency based on intensity
        const gestureFrequency = this.config.intensityAffectsFrequency
            ? Math.max(1, Math.round(this.config.gestureFrequencyBars / (0.5 + this.intensity)))
            : this.config.gestureFrequencyBars;

        // Check if it's time for a gesture (bar-aligned)
        if (this.barCount % gestureFrequency !== 0) {
            // Only log occasionally to avoid spam
            if (this.barCount > 0 && this.barCount % 8 === 0 && this._lastLoggedBar !== this.barCount) {
                console.log(`[DanceChoreographer] Waiting... barCount=${this.barCount}, freq=${gestureFrequency}, mod=${this.barCount % gestureFrequency}`);
                this._lastLoggedBar = this.barCount;
            }
            return;
        }
        if (this._lastGestureBar === this.barCount) return;

        // Decide what type of gesture based on current groove and energy
        const gestureType = this._selectGestureType(audio);
        const gesture = this._selectGesture(gestureType, audio);

        if (gesture) {
            console.log(`[DanceChoreographer] Triggering gesture: ${Array.isArray(gesture) ? gesture.join('+') : gesture} at bar ${this.barCount}`);
            this._executeGesture(gesture);
            this._lastGestureBar = this.barCount;
            this.lastGestureTime = now;
        }
    }

    /**
     * Select gesture type based on current state
     * @private
     * @param {Object} audio - Current audio data
     * @returns {string} Gesture type: 'punctuation', 'movement', 'dynamics', 'climactic'
     */
    _selectGestureType(audio) {
        // Very high energy (drop, climax) = rare climactic gestures (absolute motion)
        // Only use these sparingly - they interrupt the groove
        if (this.currentGroove === 'groove2' && this.intensity > 0.85 && audio.bass > 0.7) {
            // 30% chance of climactic gesture at very high energy
            if (Math.random() < 0.3) {
                return 'climactic';
            }
        }

        // Section changes or builds = dynamics (swell, flare)
        if (audio.flux > 0.6) {
            return 'dynamics';
        }

        // High energy with groove = movement accents (swagger, dip)
        if (this.currentGroove === 'groove2' && this.intensity > 0.6) {
            return 'movement';
        }

        // Default = punctuation (pop, punch) - the bread and butter of dancing
        return 'punctuation';
    }

    /**
     * Select gesture(s) based on energy level
     * Single gestures are the norm; combos are rare and reserved for high energy moments
     * @private
     * @param {string} type - Gesture type (unused, kept for API compatibility)
     * @param {Object} audio - Current audio data
     * @returns {string|string[]} Single gesture name or array of gesture names
     */
    _selectGesture(type, audio) {
        // Determine energy level
        let level = 'subtle';
        if (this.intensity > 0.7 || this.currentGroove === 'groove2') {
            level = 'energetic';
        } else if (this.intensity > 0.4) {
            level = 'moderate';
        }

        const pool = GESTURE_POOLS[level];
        const comboProbability = this.config.comboProbability[level] || 0;

        // Check if we should use a combo (rare)
        if (pool.combo.length > 0 && Math.random() < comboProbability) {
            return pool.combo[Math.floor(Math.random() * pool.combo.length)];
        }

        // Default: single gesture (the norm)
        return pool.single[Math.floor(Math.random() * pool.single.length)];
    }

    /**
     * Execute a gesture or combo of gestures
     * @private
     * @param {string|string[]} gesture - Single gesture name or array of gesture names
     */
    _executeGesture(gesture) {
        if (!this.mascot || !gesture) return;

        // Handle combo (array of gestures)
        if (Array.isArray(gesture)) {
            // Execute each gesture in the combo with slight stagger
            gesture.forEach((g, i) => {
                // Small delay between combo gestures (50ms stagger)
                setTimeout(() => {
                    this._executeSingleGesture(g);
                }, i * 50);
            });
            return;
        }

        // Single gesture
        this._executeSingleGesture(gesture);
    }

    /**
     * Execute a single gesture (internal)
     * @private
     * @param {string} gesture - Gesture name
     */
    _executeSingleGesture(gesture) {
        if (!this.mascot || !gesture) return;

        // Check if it's a glow gesture (requires safety check)
        if (GLOW_GESTURES.includes(gesture)) {
            if (!this._canTriggerGlow()) {
                return; // Skip glow gesture if on cooldown
            }
            this.lastGlowTime = performance.now();
            if (gesture === 'flash') {
                this.lastFlashBar = this.barCount;
            }
        }

        // Calculate amplitude based on intensity
        const amplitudeScale = this.config.intensityAffectsAmplitude
            ? 0.5 + this.intensity * 0.5
            : 1.0;

        // Trigger the gesture via mascot API
        if (typeof this.mascot.gesture === 'function') {
            this.mascot.gesture(gesture, { scale: amplitudeScale });
        }
    }

    /**
     * Check if glow effects can be triggered (safety check)
     * @private
     * @returns {boolean} True if glow is allowed
     */
    _canTriggerGlow() {
        if (!this.config.glowEnabled) return false;

        const now = performance.now();

        // Check cooldown
        if (now - this.lastGlowTime < this.config.glowCooldownMs) {
            return false;
        }

        // For flash specifically, check bar distance
        if (this.barCount - this.lastFlashBar < GLOW_SAFETY.minBarsBetweenFlash) {
            return false;
        }

        return true;
    }

    // ═══════════════════════════════════════════════════════════════════════════════════
    // GEOMETRY MORPHING
    // ═══════════════════════════════════════════════════════════════════════════════════

    /**
     * Consider triggering a geometry morph on significant energy changes
     * Morphs are rare and intentional - like the mascot "deciding" to transform
     * @private
     * @param {Object} audio - Current audio data
     */
    _considerMorph(audio) {
        if (!this.config.morphEnabled || !this.mascot) return;

        // Only consider morphs when rhythm is actually playing
        // This prevents random morphs during idle or before music starts
        const isPlaying = this.rhythmAdapter?.isPlaying?.() ?? false;
        if (!isPlaying) return;

        // Check cooldown (long cooldown between morphs)
        const barsSinceLastMorph = this.barCount - this._lastMorphBar;
        if (barsSinceLastMorph < this.config.morphCooldownBars) return;

        // Get current energy levels
        const avgBass = this._getSmoothedEnergy(this._bassHistory);
        const avgVocal = this._getSmoothedEnergy(this._vocalHistory);

        // Morph triggers:
        // 1. Groove change (section change) - most natural trigger
        // 2. Very high energy moment (drop) with low probability
        // 3. Energy "reset" - going from high back to low (breakdown)

        let shouldMorph = false;
        let morphReason = '';

        // Track previous groove for section change detection
        if (this._previousGroove === undefined) {
            this._previousGroove = this.currentGroove;
        }

        // Trigger 1: Section change (groove switched)
        if (this.currentGroove !== this._previousGroove) {
            // 40% chance on groove change
            if (Math.random() < 0.4) {
                shouldMorph = true;
                morphReason = 'section_change';
            }
            this._previousGroove = this.currentGroove;
        }

        // Trigger 2: High energy drop (very rare)
        if (!shouldMorph && this.currentGroove === 'groove2' && avgBass > 0.7) {
            // 5% chance during high energy (checked every frame, so still rare)
            // Only check once per bar to avoid spam
            if (this._lastMorphCheckBar !== this.barCount) {
                if (Math.random() < 0.05) {
                    shouldMorph = true;
                    morphReason = 'energy_peak';
                }
                this._lastMorphCheckBar = this.barCount;
            }
        }

        // Trigger 3: Time-based fallback (ensures morphs happen even without groove changes)
        // After dancing without a morph, transform to keep things interesting
        // At 120 BPM: 16 bars = ~32 seconds, so we morph roughly every 30-45 seconds
        if (!shouldMorph && barsSinceLastMorph >= 16) {
            // 25% chance per bar after 16 bars without morphing
            // This guarantees a morph within ~20 bars on average
            if (this._lastMorphCheckBar !== this.barCount) {
                if (Math.random() < 0.25) {
                    shouldMorph = true;
                    morphReason = 'time_variety';
                }
                this._lastMorphCheckBar = this.barCount;
            }
        }

        // Trigger 4: First morph comes early (introduce variety quickly)
        // If we haven't morphed yet and we're past bar 8, 15% chance per bar
        if (!shouldMorph && this._lastMorphBar < 0 && this.barCount >= 8) {
            if (this._lastMorphCheckBar !== this.barCount) {
                if (Math.random() < 0.15) {
                    shouldMorph = true;
                    morphReason = 'intro_variety';
                }
                this._lastMorphCheckBar = this.barCount;
            }
        }

        if (shouldMorph) {
            this._triggerMorph(morphReason);
        }
    }

    /**
     * Trigger a geometry morph to a new shape/variant
     * After morphReturnBars, will morph back to base geometry
     * @private
     * @param {string} reason - Why the morph was triggered (for logging)
     */
    _triggerMorph(reason) {
        if (!this.mascot) return;

        // Clear any pending return morph
        if (this._morphReturnTimeout) {
            clearTimeout(this._morphReturnTimeout);
            this._morphReturnTimeout = null;
        }

        // Check if two targets are the same (geometry + variant)
        const targetsEqual = (a, b) => {
            if (a.geometry !== b.geometry) return false;
            if (!a.variant && !b.variant) return true;
            if (!a.variant || !b.variant) return false;
            return a.variant.type === b.variant.type && a.variant.value === b.variant.value;
        };

        // Select a different target than current (excluding base so we have somewhere to return to)
        const candidates = MORPH_TARGETS.filter(t =>
            !targetsEqual(t, this._currentTarget) && !targetsEqual(t, this._baseTarget)
        );

        // If no options (only base left), pick any non-current
        const finalCandidates = candidates.length > 0
            ? candidates
            : MORPH_TARGETS.filter(t => !targetsEqual(t, this._currentTarget));

        if (finalCandidates.length === 0) return;

        const newTarget = finalCandidates[Math.floor(Math.random() * finalCandidates.length)];
        const targetLabel = this._getTargetLabel(newTarget);
        const currentLabel = this._getTargetLabel(this._currentTarget);

        console.log(`[DanceChoreographer] 🎭 Morphing: ${currentLabel} → ${targetLabel} (reason: ${reason}) at bar ${this.barCount}`);

        // Apply the morph target
        this._applyMorphTarget(newTarget);

        this._currentTarget = newTarget;
        this._lastMorphBar = this.barCount;

        // Schedule return to base geometry
        const bpm = this.rhythmAdapter?.getBPM?.() || 120;
        const barDurationMs = (60 / bpm) * 4 * 1000; // 4 beats per bar
        const returnDelayMs = this.config.morphReturnBars * barDurationMs;

        this._morphReturnTimeout = setTimeout(() => {
            this._returnToBaseGeometry();
        }, returnDelayMs);
    }

    /**
     * Return to base geometry after morph duration expires
     * @private
     */
    _returnToBaseGeometry() {
        if (!this.mascot) return;

        this._morphReturnTimeout = null;

        // Check if two targets are the same
        const targetsEqual = (a, b) => {
            if (a.geometry !== b.geometry) return false;
            if (!a.variant && !b.variant) return true;
            if (!a.variant || !b.variant) return false;
            return a.variant.type === b.variant.type && a.variant.value === b.variant.value;
        };

        // Only return if we're not already at base
        if (targetsEqual(this._currentTarget, this._baseTarget)) return;

        const currentLabel = this._getTargetLabel(this._currentTarget);
        const baseLabel = this._getTargetLabel(this._baseTarget);

        console.log(`[DanceChoreographer] 🔄 Returning: ${currentLabel} → ${baseLabel} at bar ${this.barCount}`);

        // Apply the base target
        this._applyMorphTarget(this._baseTarget);

        this._currentTarget = { ...this._baseTarget };
        // Don't update _lastMorphBar here - the cooldown is for outgoing morphs only
    }

    /**
     * Apply a morph target (geometry + variant)
     * @private
     * @param {Object} target - Target with geometry and optional variant
     */
    _applyMorphTarget(target) {
        const core3D = this.mascot?.core3D;
        if (!core3D) return;

        // Check if we need to change geometry
        const currentGeometry = core3D.geometryType;
        const needsGeometryChange = currentGeometry !== target.geometry;

        if (needsGeometryChange) {
            // Trigger geometry morph
            if (typeof this.mascot.morphTo === 'function') {
                this.mascot.morphTo(target.geometry);
            } else if (typeof this.mascot.setGeometry === 'function') {
                this.mascot.setGeometry(target.geometry);
            }

            // Apply variant after morph completes (morph duration is ~1000ms)
            // Wait 1200ms to ensure material is ready
            if (target.variant) {
                setTimeout(() => {
                    // Verify geometry actually changed before applying variant
                    if (core3D.geometryType === target.geometry) {
                        this._applyVariant(target.geometry, target.variant);
                    }
                }, 1200);
            }
        } else {
            // Same geometry - just apply/clear variant immediately
            if (target.variant) {
                this._applyVariant(target.geometry, target.variant);
            } else {
                this._clearVariant(target.geometry);
            }
        }
    }

    /**
     * Apply a variant effect (eclipse, phase, etc.)
     * @private
     * @param {string} geometry - Geometry type
     * @param {Object} variant - Variant config { type, value }
     */
    _applyVariant(geometry, variant) {
        const core3D = this.mascot?.core3D;
        if (!core3D) return;

        // Safety check: only apply variant if we're on the correct geometry
        if (core3D.geometryType !== geometry) {
            console.warn(`[DanceChoreographer] Skipping variant - expected ${geometry}, got ${core3D.geometryType}`);
            return;
        }

        if (geometry === 'moon') {
            // Verify moon material is ready
            if (!core3D.customMaterial?.uniforms?.shadowOffset) {
                console.warn('[DanceChoreographer] Moon material not ready for phase/eclipse');
                return;
            }

            if (variant.type === 'eclipse') {
                // Set moon to full first (required for eclipse)
                setMoonPhase(core3D.customMaterial, 'full');
                // Apply eclipse
                if (typeof core3D.setMoonEclipse === 'function') {
                    core3D.setMoonEclipse(variant.value);
                }
            } else if (variant.type === 'phase') {
                // Clear any eclipse first
                if (typeof core3D.setMoonEclipse === 'function') {
                    core3D.setMoonEclipse('off');
                }
                // Apply phase using the Moon.js utility
                setMoonPhase(core3D.customMaterial, variant.value);
            }
        } else if (geometry === 'sun') {
            if (variant.type === 'eclipse') {
                if (typeof core3D.setSunShadow === 'function') {
                    core3D.setSunShadow(variant.value);
                }
            }
        }
    }

    /**
     * Clear variant effects for a geometry
     * Only clears if we're currently on that geometry
     * @private
     * @param {string} geometry - Geometry type
     */
    _clearVariant(geometry) {
        const core3D = this.mascot?.core3D;
        if (!core3D) return;

        // Only clear if we're on the correct geometry
        if (core3D.geometryType !== geometry) return;

        if (geometry === 'moon') {
            if (typeof core3D.setMoonEclipse === 'function') {
                core3D.setMoonEclipse('off');
            }
            // Reset to full moon
            if (core3D.customMaterial?.uniforms?.shadowOffset) {
                setMoonPhase(core3D.customMaterial, 'full');
            }
        } else if (geometry === 'sun') {
            if (typeof core3D.setSunShadow === 'function') {
                core3D.setSunShadow('off');
            }
        }
    }

    /**
     * Get a human-readable label for a morph target
     * @private
     * @param {Object} target - Target with geometry and optional variant
     * @returns {string} Label like "moon:blood" or "crystal"
     */
    _getTargetLabel(target) {
        if (!target.variant) return target.geometry;
        return `${target.geometry}:${target.variant.value}`;
    }

    // ═══════════════════════════════════════════════════════════════════════════════════
    // EMOTION SWITCHING
    // ═══════════════════════════════════════════════════════════════════════════════════

    /**
     * Consider triggering an emotion change based on audio energy
     * Emotions change more frequently than morphs, adding life to the dance
     * @private
     * @param {Object} audio - Current audio data
     */
    _considerEmotion(audio) {
        if (!this.config.emotionEnabled || !this.mascot) return;

        // Only consider emotion changes when rhythm is actually playing
        const isPlaying = this.rhythmAdapter?.isPlaying?.() ?? false;
        if (!isPlaying) return;

        // Check cooldown
        const barsSinceLastEmotion = this.barCount - this._lastEmotionBar;
        if (barsSinceLastEmotion < this.config.emotionCooldownBars) return;

        // Get current energy levels
        const avgBass = this._getSmoothedEnergy(this._bassHistory);
        const avgVocal = this._getSmoothedEnergy(this._vocalHistory);
        const combinedEnergy = (avgBass + avgVocal) / 2;

        // Emotion change triggers (more frequent than morphs):
        // 1. Groove change (section change) - guaranteed emotion shift
        // 2. Energy level changes - adapt mood to music
        // 3. Time-based variety - keep the mascot "alive"

        let shouldChangeEmotion = false;
        let emotionReason = '';

        // Track groove for section detection
        if (this._prevGrooveForEmotion === undefined) {
            this._prevGrooveForEmotion = this.currentGroove;
        }

        // Trigger 1: Section change (groove switched) - high probability
        if (this.currentGroove !== this._prevGrooveForEmotion) {
            // 60% chance on groove change (emotions are more fluid than morphs)
            if (Math.random() < 0.6) {
                shouldChangeEmotion = true;
                emotionReason = 'section_change';
            }
            this._prevGrooveForEmotion = this.currentGroove;
        }

        // Trigger 2: High energy peak (drops, chorus)
        if (!shouldChangeEmotion && this.currentGroove === 'groove2' && combinedEnergy > 0.6) {
            // 15% chance per bar during high energy
            if (this._lastEmotionCheckBar !== this.barCount) {
                if (Math.random() < 0.15) {
                    shouldChangeEmotion = true;
                    emotionReason = 'energy_peak';
                }
                this._lastEmotionCheckBar = this.barCount;
            }
        }

        // Trigger 3: Low energy (breakdowns) - shift to calmer emotions
        if (!shouldChangeEmotion && this.currentGroove === 'groove1' && combinedEnergy < 0.25) {
            // 10% chance per bar during quiet sections
            if (this._lastEmotionCheckBar !== this.barCount) {
                if (Math.random() < 0.10) {
                    shouldChangeEmotion = true;
                    emotionReason = 'energy_low';
                }
                this._lastEmotionCheckBar = this.barCount;
            }
        }

        // Trigger 4: Time-based variety (every ~12-16 bars without change)
        if (!shouldChangeEmotion && barsSinceLastEmotion >= 12) {
            // 20% chance per bar after cooldown
            if (this._lastEmotionCheckBar !== this.barCount) {
                if (Math.random() < 0.20) {
                    shouldChangeEmotion = true;
                    emotionReason = 'time_variety';
                }
                this._lastEmotionCheckBar = this.barCount;
            }
        }

        if (shouldChangeEmotion) {
            this._triggerEmotion(emotionReason, combinedEnergy);
        }
    }

    /**
     * Trigger an emotion change
     * Selects an appropriate emotion based on energy level
     * @private
     * @param {string} reason - Why the emotion was triggered
     * @param {number} energy - Current combined energy level (0-1)
     */
    _triggerEmotion(reason, energy) {
        if (!this.mascot) return;

        // Clear any pending return
        if (this._emotionReturnTimeout) {
            clearTimeout(this._emotionReturnTimeout);
            this._emotionReturnTimeout = null;
        }

        // Select emotion based on energy level
        let emotionPool;

        if (this.config.emotionMatchEnergy) {
            // Check for dramatic emotion chance on high energy moments
            if (energy > 0.65 && Math.random() < this.config.dramaticEmotionProbability) {
                emotionPool = DANCE_EMOTIONS.dramatic;
            } else if (energy > 0.55) {
                emotionPool = DANCE_EMOTIONS.high;
            } else if (energy > 0.3) {
                emotionPool = DANCE_EMOTIONS.medium;
            } else {
                emotionPool = DANCE_EMOTIONS.low;
            }
        } else {
            // Random from all emotions
            emotionPool = ALL_DANCE_EMOTIONS;
        }

        // Filter out current emotion
        const candidates = emotionPool.filter(e => e !== this._currentEmotion);
        if (candidates.length === 0) return;

        const newEmotion = candidates[Math.floor(Math.random() * candidates.length)];

        console.log(`[DanceChoreographer] 😊 Emotion: ${this._currentEmotion} → ${newEmotion} (reason: ${reason}, energy: ${energy.toFixed(2)}) at bar ${this.barCount}`);

        // Apply emotion via mascot
        if (typeof this.mascot.setEmotion === 'function') {
            this.mascot.setEmotion(newEmotion);
        } else if (this.mascot.core3D && typeof this.mascot.core3D.setEmotion === 'function') {
            this.mascot.core3D.setEmotion(newEmotion);
        }

        this._currentEmotion = newEmotion;
        this._lastEmotionBar = this.barCount;

        // Schedule return to base emotion
        const bpm = this.rhythmAdapter?.getBPM?.() || 120;
        const barDurationMs = (60 / bpm) * 4 * 1000;
        const returnDelayMs = this.config.emotionReturnBars * barDurationMs;

        this._emotionReturnTimeout = setTimeout(() => {
            this._returnToBaseEmotion();
        }, returnDelayMs);
    }

    /**
     * Return to base emotion after emotion duration expires
     * @private
     */
    _returnToBaseEmotion() {
        if (!this.mascot) return;

        this._emotionReturnTimeout = null;

        // Only return if we're not already at base
        if (this._currentEmotion === this._baseEmotion) return;

        console.log(`[DanceChoreographer] 🔄 Emotion return: ${this._currentEmotion} → ${this._baseEmotion} at bar ${this.barCount}`);

        // Apply base emotion via mascot
        if (typeof this.mascot.setEmotion === 'function') {
            this.mascot.setEmotion(this._baseEmotion);
        } else if (this.mascot.core3D && typeof this.mascot.core3D.setEmotion === 'function') {
            this.mascot.core3D.setEmotion(this._baseEmotion);
        }

        this._currentEmotion = this._baseEmotion;
        // Don't update _lastEmotionBar - cooldown is for outgoing changes only
    }

    /**
     * Set the base emotion (the "home" to return to after changes)
     * @param {string} emotion - Emotion name (e.g., 'neutral', 'joy')
     */
    setBaseEmotion(emotion) {
        this._baseEmotion = emotion;
        this._currentEmotion = emotion;
    }

    /**
     * Sync emotion state from mascot
     * Call this after external setEmotion() calls to keep choreographer in sync
     */
    syncEmotionFromMascot() {
        if (this.mascot?.core3D?.emotion) {
            this._currentEmotion = this.mascot.core3D.emotion;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════════
    // DEBUG & STATUS
    // ═══════════════════════════════════════════════════════════════════════════════════

    /**
     * Get choreographer status for debugging
     * @returns {Object} Status object
     */
    getStatus() {
        return {
            enabled: this.enabled,
            intensity: this.intensity,
            currentGroove: this.currentGroove,
            currentTarget: this._getTargetLabel(this._currentTarget),
            baseTarget: this._getTargetLabel(this._baseTarget),
            currentEmotion: this._currentEmotion,
            baseEmotion: this._baseEmotion,
            barCount: this.barCount,
            avgBass: this._getSmoothedEnergy(this._bassHistory).toFixed(3),
            avgVocal: this._getSmoothedEnergy(this._vocalHistory).toFixed(3),
            lastGestureAgo: Math.round((performance.now() - this.lastGestureTime) / 1000) + 's',
            lastGlowAgo: Math.round((performance.now() - this.lastGlowTime) / 1000) + 's',
            lastMorphBar: this._lastMorphBar,
            barsSinceLastMorph: this.barCount - this._lastMorphBar,
            lastEmotionBar: this._lastEmotionBar,
            barsSinceLastEmotion: this.barCount - this._lastEmotionBar,
            canGlow: this._canTriggerGlow()
        };
    }

    /**
     * Set the base geometry target (the "home" to return to after morphs)
     * Also sets current target to base
     * @param {string} geometry - Geometry name (e.g., 'crystal', 'moon', 'sun')
     * @param {Object} [variant] - Optional variant { type, value }
     */
    setBaseGeometry(geometry, variant = null) {
        this._baseTarget = { geometry, variant };
        this._currentTarget = { geometry, variant };
    }

    /**
     * Sync geometry state from mascot
     * Call this after external morphTo() calls to keep choreographer in sync
     */
    syncGeometryFromMascot() {
        if (this.mascot?.core3D?.geometryType) {
            const geometry = this.mascot.core3D.geometryType;
            this._currentTarget = { geometry, variant: null };
        }
    }

    /**
     * Reset state
     */
    reset() {
        this.enabled = false;
        this.currentGroove = 'groove1';
        this.barCount = 0;
        this.lastBarProgress = 0;
        this.lastGestureTime = 0;
        this.lastGlowTime = 0;
        this.lastFlashBar = -GLOW_SAFETY.minBarsBetweenFlash;
        this._bassHistory = [];
        this._vocalHistory = [];
        this._gesturesThisBar = 0;
        this._lastGestureBar = -1;
        // Morph state - sync from mascot if available, else default to 'crystal'
        this._lastMorphBar = -16;
        const mascotGeometry = this.mascot?.core3D?.geometryType || 'crystal';
        this._currentTarget = { geometry: mascotGeometry, variant: null };
        this._baseTarget = { geometry: mascotGeometry, variant: null };
        this._previousGroove = undefined;
        this._lastMorphCheckBar = -1;
        // Clear morph return timer
        if (this._morphReturnTimeout) {
            clearTimeout(this._morphReturnTimeout);
            this._morphReturnTimeout = null;
        }
        // Emotion state - sync from mascot if available, else default to 'neutral'
        this._lastEmotionBar = -12;
        const mascotEmotion = this.mascot?.core3D?.emotion || 'neutral';
        this._currentEmotion = mascotEmotion;
        this._baseEmotion = mascotEmotion;
        this._prevGrooveForEmotion = undefined;
        this._lastEmotionCheckBar = -1;
        // Clear emotion return timer
        if (this._emotionReturnTimeout) {
            clearTimeout(this._emotionReturnTimeout);
            this._emotionReturnTimeout = null;
        }
    }

    /**
     * Cleanup resources
     */
    destroy() {
        // Clear timers first
        if (this._morphReturnTimeout) {
            clearTimeout(this._morphReturnTimeout);
            this._morphReturnTimeout = null;
        }
        if (this._emotionReturnTimeout) {
            clearTimeout(this._emotionReturnTimeout);
            this._emotionReturnTimeout = null;
        }
        this.reset();
        this.rhythmAdapter = null;
        this.mascot = null;
        this.audioDeformer = null;
    }
}

export default DanceChoreographer;
