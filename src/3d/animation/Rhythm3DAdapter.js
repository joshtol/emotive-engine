/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - 3D Rhythm Adapter
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Bridges RhythmEngine with the 3D animation system
 * @author Emotive Engine Team
 * @module 3d/animation/Rhythm3DAdapter
 */

import { FRAME_TIMING } from '../../core/config/defaults.js';

/**
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║ CONCEPT
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Translates musical timing from RhythmEngine into multipliers and modulation
 * ║ values that the 3D system (GestureBlender, Core3DManager) can use to sync
 * ║ animations with rhythm.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * FEATURES:
 * • Beat-synced gesture intensity modulation
 * • Accent-aware animation scaling
 * • Ambient groove idle animations (subtle bounce/sway when no gestures)
 * • BPM-aware duration conversion for gestures
 * • Pattern-specific modulation overrides
 * • Multiple groove presets with seamless transitions
 *
 * GROOVE PRESETS:
 * • groove1 (subtle): Minimal, elegant - gentle bounce and sway
 * • groove2 (energetic): Bouncy, lively - pronounced vertical motion
 * • groove3 (flowing): Smooth, languid - emphasis on rotation and sway
 *
 * ARCHITECTURE:
 * ┌──────────────────────────────────────────────────────────────────────────────────┐
 * │  RHYTHM FLOW TO 3D                                                               │
 * │                                                                                   │
 * │  [RhythmEngine] → [Rhythm3DAdapter] → [GestureBlender / Core3DManager]          │
 * │       ↓                   ↓                                                      │
 * │   beat/accent         modulation                                                 │
 * │   intensity          multipliers                                                 │
 * │                                                                                   │
 * └──────────────────────────────────────────────────────────────────────────────────┘
 *
 * TIMING MODEL (Frame-Rate Independent):
 * ┌──────────────────────────────────────────────────────────────────────────────────┐
 * │  • RhythmEngine provides absolute beatProgress/barProgress from performance.now()│
 * │  • Groove computed from absolute beat phase (NOT accumulated frame deltas)       │
 * │  • Smoothing applied only to OUTPUT values, not timing                          │
 * │  • deltaTime clamped to prevent overshoot during frame drops                    │
 * └──────────────────────────────────────────────────────────────────────────────────┘
 */

import rhythmEngine from '../../core/audio/rhythm.js';

// ═══════════════════════════════════════════════════════════════════════════════════════
// GROOVE PRESETS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Groove preset definitions
 * Each preset defines the character of the ambient groove animation
 */
const GROOVE_PRESETS = {
    // Subtle, minimal groove - elegant and understated
    groove1: {
        name: 'groove1',
        description: 'Subtle, elegant - gentle bounce and sway',
        bounceAmount: 0.015,      // Vertical bounce amplitude
        swayAmount: 0.012,        // Horizontal sway amplitude
        pulseAmount: 0.02,        // Scale pulse amplitude
        rotationAmount: 0.015,    // Rotation sway amplitude
        bounceFreq: 1,            // Bounce cycles per beat
        swayFreq: 0.5,            // Sway cycles per bar (half-bar period)
        phaseOffset: 0,           // Phase offset in radians
        easing: 'sine'            // Easing curve type
    },

    // Energetic, bouncy groove - lively and playful
    groove2: {
        name: 'groove2',
        description: 'Energetic, bouncy - pronounced vertical motion',
        bounceAmount: 0.035,      // More pronounced bounce
        swayAmount: 0.02,         // Moderate sway
        pulseAmount: 0.045,       // Strong scale pulse
        rotationAmount: 0.025,    // Moderate rotation
        bounceFreq: 1,            // Standard beat-synced bounce
        swayFreq: 1,              // Faster sway (full bar period)
        phaseOffset: 0,
        easing: 'bounce'          // Snappier easing
    },

    // Smooth, flowing groove - languid and expressive
    groove3: {
        name: 'groove3',
        description: 'Smooth, flowing - emphasis on rotation and sway',
        bounceAmount: 0.01,       // Subtle bounce
        swayAmount: 0.03,         // Pronounced sway
        pulseAmount: 0.015,       // Gentle pulse
        rotationAmount: 0.04,     // Strong rotation emphasis
        bounceFreq: 0.5,          // Slower bounce (half-beat)
        swayFreq: 0.25,           // Very slow sway (quarter-bar)
        phaseOffset: Math.PI / 4, // Phase offset for flowing feel
        easing: 'sine'            // Smooth sine easing
    }
};

// Default groove preset
const DEFAULT_GROOVE = 'groove1';

export class Rhythm3DAdapter {
    /**
     * Create a new Rhythm3DAdapter instance
     * Bridges RhythmEngine with the 3D animation system for audio-reactive animations
     */
    constructor() {
        // Adapter state
        this.enabled = false;
        this.adapter = null;

        // Cached rhythm values (updated each frame)
        this.beatProgress = 0;
        this.barProgress = 0;
        this.accent = 0.5;
        this.intensity = 1.0;
        this.bpm = 120;
        this.isOnBeat = false;
        this.pattern = null;

        // Ambient groove state
        this.grooveEnabled = true;
        this.currentGroove = DEFAULT_GROOVE;
        this.targetGroove = DEFAULT_GROOVE;
        this.grooveTransition = 0;        // 0 = at current, 1 = at target
        this.grooveTransitionSpeed = 2.0; // Transition speed (per second)

        // Groove confidence: scales animation amplitude based on BPM detection confidence
        // Ranges from 0.15 (tentative) to 1.0 (fully locked), provided by BPM detector
        this.grooveConfidence = 1.0;      // Default to full when not using BPM detection

        // BPM multiplier: scales the effective BPM used for animations
        // Default 1.0 = use detected BPM as-is
        // Set to 0.5 to halve animation speed (e.g., for high BPM songs)
        // Set to 2.0 to double animation speed (e.g., for slow songs)
        this.bpmMultiplier = 1.0;

        // Modulation output (computed each frame) - these are the SMOOTHED values
        this.modulation = {
            scaleMultiplier: 1.0,      // Applied to gesture scale output
            glowMultiplier: 1.0,       // Applied to gesture glow output
            positionMultiplier: 1.0,   // Applied to gesture position output
            rotationMultiplier: 1.0,   // Applied to gesture rotation output
            accentBoost: 0.0,          // Extra boost on accented beats
            grooveOffset: [0, 0, 0],   // Ambient groove position offset
            grooveScale: 1.0,          // Ambient groove scale pulse
            grooveRotation: [0, 0, 0], // Ambient groove rotation sway
            grooveGlow: 1.0            // Ambient groove glow pulse (beat-synced)
        };

        // Target values (raw computed values before smoothing)
        this._target = {
            scaleMultiplier: 1.0,
            glowMultiplier: 1.0,
            positionMultiplier: 1.0,
            rotationMultiplier: 1.0,
            accentBoost: 0.0,
            grooveOffset: [0, 0, 0],
            grooveScale: 1.0,
            grooveRotation: [0, 0, 0],
            grooveGlow: 1.0
        };

        // Configuration
        this.config = {
            // Beat sync intensity
            beatSyncStrength: 0.3,     // How much beat affects animations (0-1)
            accentMultiplier: 1.5,     // Boost on accented beats

            // Smoothing settings
            smoothingSpeed: 8.0,       // How fast values ease toward target (higher = faster)
            grooveSmoothingSpeed: 12.0 // Groove smoothing (higher for tighter beat sync)
        };

        // Maximum deltaTime to prevent smoothing overshoot during frame drops
        // Convert from ms to seconds (PARTICLE_DELTA_CAP is 50ms = 0.05s)
        this._maxDeltaTime = FRAME_TIMING.PARTICLE_DELTA_CAP / 1000;

        // Pending groove change (for quantized transitions)
        this._pendingGroove = null;
        this._pendingGrooveOptions = null;
    }

    /**
     * Smooth interpolation helper (exponential ease)
     * @private
     * @param {number} current - Current value
     * @param {number} target - Target value
     * @param {number} speed - Interpolation speed
     * @param {number} deltaTime - Time delta in seconds (clamped)
     * @returns {number} Interpolated value
     */
    _lerp(current, target, speed, deltaTime) {
        const t = 1 - Math.exp(-speed * deltaTime);
        return current + (target - current) * t;
    }

    /**
     * Smooth interpolation for arrays
     * @private
     * @param {number[]} current - Current values
     * @param {number[]} target - Target values
     * @param {number} speed - Interpolation speed
     * @param {number} deltaTime - Time delta in seconds (clamped)
     * @returns {number[]} Interpolated values
     */
    _lerpArray(current, target, speed, deltaTime) {
        const t = 1 - Math.exp(-speed * deltaTime);
        return current.map((v, i) => v + (target[i] - v) * t);
    }

    /**
     * Apply easing curve to a normalized value (-1 to 1 or 0 to 1)
     * Each preset can specify an easing type for different character
     * @private
     * @param {number} value - Input value (typically from sine wave, -1 to 1)
     * @param {string} easingType - Easing curve type ('sine', 'bounce', 'elastic')
     * @returns {number} Eased value
     */
    _applyEasing(value, easingType) {
        switch (easingType) {
        case 'bounce':
            // Sharper attack, slower decay - snappier, more rhythmic feel
            // Uses power curve to create punch on peaks
            return Math.sign(value) * Math.pow(Math.abs(value), 0.6);

        case 'elastic':
            // Playful overshoot with subtle wobble
            // Good for excited/energetic moods
            return value * (1 + 0.15 * Math.sin(Math.abs(value) * Math.PI * 2));

        case 'sine':
        default:
            // Smooth sine wave - current behavior, elegant and flowing
            return value;
        }
    }

    /**
     * Get groove preset by name
     * @private
     * @param {string} name - Preset name
     * @returns {Object} Groove preset configuration
     */
    _getGroovePreset(name) {
        return GROOVE_PRESETS[name] || GROOVE_PRESETS[DEFAULT_GROOVE];
    }

    /**
     * Interpolate between two groove presets
     * @private
     * @param {Object} from - Source preset
     * @param {Object} to - Target preset
     * @param {number} t - Interpolation factor (0-1)
     * @returns {Object} Interpolated preset values
     */
    _interpolatePresets(from, to, t) {
        return {
            bounceAmount: from.bounceAmount + (to.bounceAmount - from.bounceAmount) * t,
            swayAmount: from.swayAmount + (to.swayAmount - from.swayAmount) * t,
            pulseAmount: from.pulseAmount + (to.pulseAmount - from.pulseAmount) * t,
            rotationAmount: from.rotationAmount + (to.rotationAmount - from.rotationAmount) * t,
            bounceFreq: from.bounceFreq + (to.bounceFreq - from.bounceFreq) * t,
            swayFreq: from.swayFreq + (to.swayFreq - from.swayFreq) * t,
            phaseOffset: from.phaseOffset + (to.phaseOffset - from.phaseOffset) * t
        };
    }

    /**
     * Initialize the adapter by connecting to RhythmEngine
     */
    initialize() {
        this.adapter = rhythmEngine.getAdapter();
        this.enabled = true;

        // Subscribe to beat events for accent tracking
        this.adapter.onBeat(beatInfo => {
            this.accent = beatInfo.accent;
            this.isOnBeat = true;
            // Clear on-beat flag after short window
            setTimeout(() => { this.isOnBeat = false; }, 100);
        });
    }

    /**
     * Start rhythm playback
     * Must be called to activate rhythm sync (or it auto-starts with audio detection)
     * @param {number} bpm - Beats per minute (default: 120)
     * @param {string} pattern - Rhythm pattern name (default: 'straight')
     */
    start(bpm = 120, pattern = 'straight') {
        if (!this.enabled) {
            this.initialize();
        }
        if (bpm) rhythmEngine.setBPM(bpm);
        if (pattern) rhythmEngine.setPattern(pattern);
        rhythmEngine.start();
    }

    /**
     * Stop rhythm playback
     */
    stop() {
        rhythmEngine.stop();
    }

    /**
     * Set BPM (beats per minute)
     * @param {number} bpm - BPM value (20-360)
     */
    setBPM(bpm) {
        rhythmEngine.setBPM(bpm);
        this.bpm = bpm;
    }

    /**
     * Set rhythm pattern
     * @param {string} pattern - Pattern name: 'straight', 'swing', 'waltz', 'dubstep', etc.
     */
    setPattern(pattern) {
        rhythmEngine.setPattern(pattern);
        this.pattern = pattern;
    }

    /**
     * Set the active groove preset
     * @param {string} grooveName - Groove preset name ('groove1', 'groove2', 'groove3')
     * @param {Object} [options] - Transition options
     * @param {number} [options.bars] - Transition duration in bars (default: immediate)
     * @param {number} [options.duration] - Transition duration in seconds (alternative to bars)
     * @param {boolean} [options.quantize] - Wait for next bar boundary before transitioning
     */
    setGroove(grooveName, options = {}) {
        if (!GROOVE_PRESETS[grooveName]) {
            console.warn(`[Rhythm3DAdapter] Unknown groove preset: ${grooveName}`);
            return;
        }

        // If same groove, no-op
        if (this.currentGroove === grooveName && this.grooveTransition >= 1) {
            return;
        }

        // If quantize is requested, queue the change for next bar boundary
        if (options.quantize) {
            this._pendingGroove = grooveName;
            // Store options without quantize flag to avoid infinite loop
            this._pendingGrooveOptions = { ...options, quantize: false };
            return;
        }

        // Set up transition
        this.targetGroove = grooveName;

        if (options.bars || options.duration) {
            // Gradual transition
            this.grooveTransition = 0;

            if (options.bars) {
                // Calculate transition speed based on bars at current BPM
                const barDuration = (60 / this.bpm) * 4; // seconds per bar (4/4)
                const transitionDuration = options.bars * barDuration;
                this.grooveTransitionSpeed = 1 / transitionDuration;
            } else if (options.duration) {
                this.grooveTransitionSpeed = 1 / options.duration;
            }
        } else {
            // Immediate transition (but still smoothed via grooveSmoothingSpeed)
            this.currentGroove = grooveName;
            this.grooveTransition = 1;
        }
    }

    /**
     * Get available groove preset names
     * @returns {string[]} Array of groove preset names
     */
    getGroovePresets() {
        return Object.keys(GROOVE_PRESETS);
    }

    /**
     * Get current groove preset name
     * @returns {string} Current groove preset name
     */
    getCurrentGroove() {
        return this.grooveTransition >= 1 ? this.targetGroove : this.currentGroove;
    }

    /**
     * Update rhythm state and compute modulation values
     * Should be called each frame before gesture blending
     *
     * IMPORTANT: This method is frame-rate independent.
     * - beatProgress/barProgress come from RhythmEngine (performance.now() based)
     * - Groove computed from absolute beat phase, NOT accumulated frame time
     * - deltaTime clamped to prevent smoothing overshoot
     *
     * @param {number} deltaTime - Time since last frame in ms
     */
    update(deltaTime) {
        // Convert to seconds and clamp to prevent smoothing overshoot during frame drops
        const dt = Math.min(deltaTime / 1000, this._maxDeltaTime);

        // Auto-initialize on first update if not done yet
        if (!this.adapter) {
            this.adapter = rhythmEngine.getAdapter();
        }

        if (!this.adapter) {
            this.resetModulation(dt);
            return;
        }

        // Check if rhythm is actually playing (started by any system - 2D or 3D)
        const playing = this.adapter.isPlaying();
        if (!playing) {
            this.resetModulation(dt);
            return;
        }

        // Mark as enabled if rhythm is playing (auto-enable when rhythm starts)
        this.enabled = true;

        // Get rhythm values directly from RhythmEngine (performance.now() based)
        // This is frame-rate independent - beatProgress is computed from elapsed time
        const timeInfo = this.adapter.getTimeInfo();

        // Use absolute beat/bar progress from RhythmEngine (already frame-rate independent)
        this.beatProgress = timeInfo.beatProgress;
        this.barProgress = timeInfo.barProgress;
        this.intensity = timeInfo.intensity;
        this.bpm = timeInfo.bpm || this.bpm;
        this.pattern = timeInfo.pattern;

        // Check for pending groove change at bar boundary (quantized transitions)
        // Trigger when barProgress is near 0 (start of new bar)
        if (this._pendingGroove && this.barProgress < 0.05) {
            this.setGroove(this._pendingGroove, this._pendingGrooveOptions || {});
            this._pendingGroove = null;
            this._pendingGrooveOptions = null;
        }

        // Update groove transition (for morphing between presets)
        if (this.grooveTransition < 1) {
            this.grooveTransition = Math.min(1, this.grooveTransition + this.grooveTransitionSpeed * dt);
            if (this.grooveTransition >= 1) {
                // Transition complete - swap current to target
                this.currentGroove = this.targetGroove;
            }
        }

        // Compute target modulation values (raw, unsmoothed)
        this.computeModulation();

        // Apply smoothing to reach target values
        this.applySmoothing(dt);
    }

    /**
     * Compute rhythm modulation TARGET values based on current beat state
     * These are raw values that will be smoothed before output
     * @private
     */
    computeModulation() {
        const { beatSyncStrength, accentMultiplier } = this.config;

        // Beat pulse curve: smooth sine wave, gentler than cosine^2
        // This creates a natural breathing rhythm that peaks on the beat
        const beatPhase = this.beatProgress * Math.PI * 2;
        const beatPulse = (Math.cos(beatPhase) + 1) * 0.5; // 0 to 1, peaks at beat start

        // Scale multiplier: subtle pulse on beat
        // 1.0 at rest, up to 1.0 + beatSyncStrength at beat
        this._target.scaleMultiplier = 1.0 + beatPulse * beatSyncStrength * 0.4;

        // Glow multiplier: brighter on beat (slightly more pronounced)
        this._target.glowMultiplier = 1.0 + beatPulse * beatSyncStrength * 0.8;

        // Position/rotation multipliers for gestures (subtle)
        this._target.positionMultiplier = 1.0 + beatPulse * beatSyncStrength * 0.2;
        this._target.rotationMultiplier = 1.0 + beatPulse * beatSyncStrength * 0.15;

        // Accent boost on strong beats (smoothed separately)
        this._target.accentBoost = this.isOnBeat ? (this.accent - 0.5) * accentMultiplier : 0;

        // Compute ambient groove (always active when rhythm is playing)
        if (this.grooveEnabled) {
            this.computeGroove();
        } else {
            this._target.grooveOffset = [0, 0, 0];
            this._target.grooveScale = 1.0;
            this._target.grooveRotation = [0, 0, 0];
        }
    }

    /**
     * Compute ambient groove animation (subtle idle motion synced to rhythm)
     * Uses absolute beat/bar progress for frame-rate independence
     * Supports morphing between groove presets
     * Animation amplitudes are scaled by grooveConfidence (0.15-1.0)
     *
     * @private
     */
    computeGroove() {
        // Get current and target presets
        const fromPreset = this._getGroovePreset(this.currentGroove);
        const toPreset = this._getGroovePreset(this.targetGroove);

        // Interpolate preset values for smooth transitions
        const preset = this.grooveTransition >= 1
            ? toPreset
            : this._interpolatePresets(fromPreset, toPreset, this.grooveTransition);

        // Scale amplitudes by grooveConfidence
        // At 0.15 (tentative): animations are very subtle, searching feel
        // At 1.0 (locked): full groove amplitude
        const conf = this.grooveConfidence;
        const bounceAmount = preset.bounceAmount * conf;
        const swayAmount = preset.swayAmount * conf;
        const pulseAmount = preset.pulseAmount * conf;
        const rotationAmount = preset.rotationAmount * conf;
        const { bounceFreq, swayFreq, phaseOffset, easing } = preset;

        // Compute groove motions from ABSOLUTE beat/bar progress
        // This is frame-rate independent because beatProgress/barProgress come from
        // RhythmEngine which uses performance.now(), not accumulated frame deltas
        //
        // BPM multiplier scales animation FREQUENCY (not progress value):
        // - multiplier 0.5 = animations take 2 beats to complete one cycle (half speed)
        // - multiplier 2.0 = animations complete 2 cycles per beat (double speed)
        // Applied directly to the phase calculation, not the progress value

        // Vertical bounce: synced to beat with configurable frequency
        // bpmMultiplier scales the frequency so 0.5 = half as many bounces per beat
        const bouncePhase = (this.beatProgress * bounceFreq * this.bpmMultiplier * Math.PI * 2) + phaseOffset;
        const rawBounce = Math.sin(bouncePhase);
        const easedBounce = this._applyEasing(rawBounce, easing);

        // Horizontal sway: synced to bar with configurable frequency
        const swayPhase = (this.barProgress * swayFreq * this.bpmMultiplier * Math.PI * 2) + phaseOffset;
        const rawSway = Math.sin(swayPhase);
        const easedSway = this._applyEasing(rawSway, easing);

        // Accent response: smooth curve that peaks at beat start, scaled by accent level
        // Uses cosine curve centered on beat boundaries (0 and 1) for smooth falloff
        // beatProgress 0.0 → peak, 0.5 → minimum, 1.0 → peak again
        // Note: accent response uses raw beatProgress (not multiplied) to still sync with actual beats
        const beatProximity = (Math.cos(this.beatProgress * Math.PI * 2) + 1) * 0.5; // 0-1, peaks at beat
        const accentStrength = Math.max(0, this.accent - 0.4) / 0.6; // 0-1, normalized above 0.4 threshold
        const accentBoost = beatProximity * accentStrength * 0.25; // Smooth accent curve

        // Apply easing and accent to motion values
        const bounce = easedBounce * bounceAmount * (1 + accentBoost);
        const sway = easedSway * swayAmount;

        // Scale pulse: synced to beat with accent boost
        const rawPulse = Math.sin(bouncePhase);
        const pulse = 1.0 + this._applyEasing(rawPulse, easing) * pulseAmount * (1 + accentBoost * 0.5);

        // Rotation sway: synced to bar for smooth rotation
        const rotationSway = easedSway * rotationAmount;

        // Multi-axis motion for organic 3D feel
        // Use different phase relationships so axes don't move in lockstep
        // Z-drift: subtle forward/back bobbing, offset from sway for depth
        const zDrift = Math.sin(swayPhase + Math.PI / 3) * swayAmount * 0.3;

        // X/Y rotation for "head tilt" effect - slower frequencies for subtle organic motion
        const tiltX = Math.sin(swayPhase * 0.5) * rotationAmount * 0.4;
        const tiltY = Math.cos(bouncePhase * 0.7) * rotationAmount * 0.25;

        // Groove glow: subtle beat-synced glow pulse with accent response
        // Uses cosine for peak at beat start (when bouncePhase = 0)
        const glowBase = 1.0 + (Math.cos(bouncePhase) + 1) * 0.5 * 0.12 * conf;
        const accentGlow = beatProximity * accentStrength * 0.12; // Smooth glow accent
        const grooveGlow = glowBase + accentGlow;

        // Write to target values (these get smoothed in applySmoothing)
        // Position: X sway, Y bounce, Z drift (forward/back)
        this._target.grooveOffset = [sway, bounce, zDrift];
        this._target.grooveScale = pulse;
        // Rotation: X tilt (nod), Y tilt (turn), Z sway (lean)
        this._target.grooveRotation = [tiltX, tiltY, rotationSway];
        this._target.grooveGlow = grooveGlow;
    }

    /**
     * Apply exponential smoothing from current values toward targets
     * Smoothing is applied to OUTPUT values only, not to timing
     * @private
     */
    applySmoothing(dt) {
        const { smoothingSpeed, grooveSmoothingSpeed } = this.config;

        // Smooth beat-sync multipliers
        this.modulation.scaleMultiplier = this._lerp(
            this.modulation.scaleMultiplier,
            this._target.scaleMultiplier,
            smoothingSpeed, dt
        );
        this.modulation.glowMultiplier = this._lerp(
            this.modulation.glowMultiplier,
            this._target.glowMultiplier,
            smoothingSpeed, dt
        );
        this.modulation.positionMultiplier = this._lerp(
            this.modulation.positionMultiplier,
            this._target.positionMultiplier,
            smoothingSpeed, dt
        );
        this.modulation.rotationMultiplier = this._lerp(
            this.modulation.rotationMultiplier,
            this._target.rotationMultiplier,
            smoothingSpeed, dt
        );
        this.modulation.accentBoost = this._lerp(
            this.modulation.accentBoost,
            this._target.accentBoost,
            smoothingSpeed * 0.5, dt  // Slower decay for accent
        );

        // Smooth groove values
        // Higher smoothing speed keeps groove tightly synced to beat
        this.modulation.grooveOffset = this._lerpArray(
            this.modulation.grooveOffset,
            this._target.grooveOffset,
            grooveSmoothingSpeed, dt
        );
        this.modulation.grooveScale = this._lerp(
            this.modulation.grooveScale,
            this._target.grooveScale,
            grooveSmoothingSpeed, dt
        );
        this.modulation.grooveRotation = this._lerpArray(
            this.modulation.grooveRotation,
            this._target.grooveRotation,
            grooveSmoothingSpeed, dt
        );
        this.modulation.grooveGlow = this._lerp(
            this.modulation.grooveGlow,
            this._target.grooveGlow,
            grooveSmoothingSpeed, dt
        );
    }

    /**
     * Reset modulation to neutral values (when rhythm not playing)
     * Smoothly eases back to neutral instead of snapping
     * @private
     */
    resetModulation(dt = 0.016) {
        // Set targets to neutral
        this._target.scaleMultiplier = 1.0;
        this._target.glowMultiplier = 1.0;
        this._target.positionMultiplier = 1.0;
        this._target.rotationMultiplier = 1.0;
        this._target.accentBoost = 0.0;
        this._target.grooveOffset = [0, 0, 0];
        this._target.grooveScale = 1.0;
        this._target.grooveRotation = [0, 0, 0];
        this._target.grooveGlow = 1.0;

        // Smooth toward neutral (slower speed for graceful fade-out)
        const fadeSpeed = 4.0;
        this.modulation.scaleMultiplier = this._lerp(this.modulation.scaleMultiplier, 1.0, fadeSpeed, dt);
        this.modulation.glowMultiplier = this._lerp(this.modulation.glowMultiplier, 1.0, fadeSpeed, dt);
        this.modulation.positionMultiplier = this._lerp(this.modulation.positionMultiplier, 1.0, fadeSpeed, dt);
        this.modulation.rotationMultiplier = this._lerp(this.modulation.rotationMultiplier, 1.0, fadeSpeed, dt);
        this.modulation.accentBoost = this._lerp(this.modulation.accentBoost, 0.0, fadeSpeed, dt);
        this.modulation.grooveOffset = this._lerpArray(this.modulation.grooveOffset, [0, 0, 0], fadeSpeed, dt);
        this.modulation.grooveScale = this._lerp(this.modulation.grooveScale, 1.0, fadeSpeed, dt);
        this.modulation.grooveRotation = this._lerpArray(this.modulation.grooveRotation, [0, 0, 0], fadeSpeed, dt);
        this.modulation.grooveGlow = this._lerp(this.modulation.grooveGlow, 1.0, fadeSpeed, dt);
    }

    /**
     * Get rhythm modulation to apply to blended gesture output
     * @returns {Object} Modulation values
     */
    getModulation() {
        return this.modulation;
    }

    /**
     * Convert gesture duration to musical time (BPM-aware)
     * @param {number} baseDuration - Base duration in ms
     * @param {Object} rhythmConfig - Gesture's rhythm config (optional)
     * @returns {number} Adjusted duration in ms
     */
    getMusicalDuration(baseDuration, rhythmConfig = null) {
        if (!this.enabled || !this.adapter || !this.adapter.isPlaying()) {
            return baseDuration;
        }

        // If gesture has rhythm config with duration sync, use it
        if (rhythmConfig?.durationSync) {
            const sync = rhythmConfig.durationSync;

            if (sync.mode === 'beats' && sync.beats) {
                return this.adapter.beatsToMs(sync.beats);
            }
            if (sync.mode === 'bars' && sync.bars) {
                return this.adapter.beatsToMs(sync.bars * 4); // Assuming 4/4
            }
        }

        // Otherwise return base duration (no rhythm adjustment)
        return baseDuration;
    }

    /**
     * Check if currently on a beat (for triggering effects)
     * @param {number} tolerance - Tolerance window (0-1, fraction of beat)
     * @returns {boolean}
     */
    isOnBeatNow(tolerance = 0.1) {
        if (!this.enabled || !this.adapter) return false;
        return this.adapter.isOnBeat(tolerance);
    }

    /**
     * Check if currently on an accented beat
     * @param {number} accentThreshold - Minimum accent level (0-1)
     * @returns {boolean}
     */
    isOnAccent(accentThreshold = 0.7) {
        return this.isOnBeat && this.accent >= accentThreshold;
    }

    /**
     * Get beat-synced interpolated value
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @param {string} curve - Interpolation curve ('linear', 'ease', 'bounce', 'pulse')
     * @returns {number} Interpolated value
     */
    getBeatSync(min, max, curve = 'pulse') {
        if (!this.enabled || !this.adapter) return min;
        return this.adapter.getBeatSync(min, max, curve);
    }

    /**
     * Apply accent multiplier to a base value
     * @param {number} baseValue - Base value
     * @param {number} multiplier - Accent multiplier strength
     * @returns {number} Accent-modulated value
     */
    getAccentedValue(baseValue, multiplier = 2) {
        if (!this.enabled || !this.adapter) return baseValue;
        return this.adapter.getAccentedValue(baseValue, multiplier);
    }

    /**
     * Enable or disable ambient groove
     * @param {boolean} enabled
     */
    setGrooveEnabled(enabled) {
        this.grooveEnabled = enabled;
        if (!enabled) {
            // Set targets to neutral - smoothing will handle the transition
            this._target.grooveOffset = [0, 0, 0];
            this._target.grooveScale = 1.0;
            this._target.grooveRotation = [0, 0, 0];
        }
    }

    /**
     * Set groove confidence from BPM detector
     * This scales animation amplitudes: 0.15 = tentative, 1.0 = full groove
     * @param {number} confidence - Groove confidence value (0.15 to 1.0)
     */
    setGrooveConfidence(confidence) {
        this.grooveConfidence = Math.max(0, Math.min(1, confidence));
    }

    /**
     * Set BPM multiplier for animation speed control
     *
     * This scales the effective BPM used for groove animations without affecting
     * the actual BPM detection or rhythm engine. Useful for:
     * - Halving animation speed for high BPM songs (set to 0.5)
     * - Doubling animation speed for slow songs (set to 2.0)
     *
     * @example
     * // Halve animation speed for songs > 90 BPM
     * const status = mascot.getBPMStatus();
     * if (status.bpm > 90) {
     *     mascot.setBPMMultiplier(0.5);
     * }
     *
     * @param {number} multiplier - BPM multiplier (0.25 to 4.0, default 1.0)
     */
    setBPMMultiplier(multiplier) {
        this.bpmMultiplier = Math.max(0.25, Math.min(4.0, multiplier));
    }

    /**
     * Get current BPM multiplier
     * @returns {number} Current BPM multiplier (default 1.0)
     */
    getBPMMultiplier() {
        return this.bpmMultiplier;
    }

    /**
     * Set groove configuration (for custom tuning)
     * @param {Object} config - Groove settings
     */
    setGrooveConfig(config) {
        Object.assign(this.config, config);
    }

    /**
     * Set beat sync strength
     * @param {number} strength - Sync strength (0-1)
     */
    setBeatSyncStrength(strength) {
        this.config.beatSyncStrength = Math.max(0, Math.min(1, strength));
    }

    /**
     * Check if rhythm is currently playing
     * @returns {boolean}
     */
    isPlaying() {
        return this.enabled && this.adapter && this.adapter.isPlaying();
    }

    /**
     * Get current BPM
     * @returns {number}
     */
    getBPM() {
        return this.bpm;
    }

    /**
     * Get current pattern name
     * @returns {string|null}
     */
    getPattern() {
        return this.pattern;
    }

    /**
     * Cleanup
     */
    destroy() {
        this.enabled = false;
        this.adapter = null;
        this.resetModulation();
    }
}

// Export singleton for easy access
const rhythm3DAdapter = new Rhythm3DAdapter();
export { rhythm3DAdapter, GROOVE_PRESETS };
export default rhythm3DAdapter;
