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
 */

import rhythmEngine from '../../core/audio/rhythm.js';

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
        this.grooveTime = 0;
        this._lastBeatProgress = 0;
        this._staleFrameCount = 0;

        // Modulation output (computed each frame) - these are the SMOOTHED values
        this.modulation = {
            scaleMultiplier: 1.0,      // Applied to gesture scale output
            glowMultiplier: 1.0,       // Applied to gesture glow output
            positionMultiplier: 1.0,   // Applied to gesture position output
            rotationMultiplier: 1.0,   // Applied to gesture rotation output
            accentBoost: 0.0,          // Extra boost on accented beats
            grooveOffset: [0, 0, 0],   // Ambient groove position offset
            grooveScale: 1.0,          // Ambient groove scale pulse
            grooveRotation: [0, 0, 0]  // Ambient groove rotation sway
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
            grooveRotation: [0, 0, 0]
        };

        // Configuration
        this.config = {
            // Beat sync intensity
            beatSyncStrength: 0.3,     // How much beat affects animations (0-1)
            accentMultiplier: 1.5,     // Boost on accented beats

            // Ambient groove settings
            grooveBounceAmount: 0.02,  // Vertical bounce amplitude
            grooveSwayAmount: 0.015,   // Horizontal sway amplitude
            groovePulseAmount: 0.03,   // Scale pulse amplitude
            grooveRotationAmount: 0.02, // Rotation sway amplitude

            // Smoothing settings
            smoothingSpeed: 8.0,       // How fast values ease toward target (higher = faster)
            grooveSmoothingSpeed: 6.0  // Separate smoothing for groove (slightly slower for fluidity)
        };
    }

    /**
     * Smooth interpolation helper (exponential ease)
     * @private
     * @param {number} current - Current value
     * @param {number} target - Target value
     * @param {number} speed - Interpolation speed
     * @param {number} deltaTime - Time delta in seconds
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
     * @param {number} deltaTime - Time delta in seconds
     * @returns {number[]} Interpolated values
     */
    _lerpArray(current, target, speed, deltaTime) {
        const t = 1 - Math.exp(-speed * deltaTime);
        return current.map((v, i) => v + (target[i] - v) * t);
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
     * Update rhythm state and compute modulation values
     * Should be called each frame before gesture blending
     * @param {number} deltaTime - Time since last frame in ms
     */
    update(deltaTime) {
        // Convert to seconds for smoothing calculations
        const dt = deltaTime / 1000;

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

        // Update cached rhythm values
        const timeInfo = this.adapter.getTimeInfo();

        // Detect stale rhythm data (beatProgress not updating)
        if (Math.abs(timeInfo.beatProgress - this._lastBeatProgress) < 0.001) {
            this._staleFrameCount++;
        } else {
            this._staleFrameCount = 0;
            this._lastBeatProgress = timeInfo.beatProgress;
        }

        // If rhythm data is stale for too long, use time-based fallback
        const isStale = this._staleFrameCount > 10;

        if (isStale) {
            // Fallback: compute beat progress from elapsed time and BPM
            const beatsPerSecond = (timeInfo.bpm || this.bpm || 120) / 60;
            this.grooveTime += dt;
            this.beatProgress = (this.grooveTime * beatsPerSecond) % 1;
            this.barProgress = ((this.grooveTime * beatsPerSecond) / 4) % 1;
        } else {
            this.beatProgress = timeInfo.beatProgress;
            this.barProgress = timeInfo.barProgress;
            // Keep grooveTime synced when not stale
            this.grooveTime += dt;
        }

        this.intensity = timeInfo.intensity;
        this.bpm = timeInfo.bpm || this.bpm;
        this.pattern = timeInfo.pattern;

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
     * Writes to _target values which are then smoothed
     * @private
     */
    computeGroove() {
        const { grooveBounceAmount, grooveSwayAmount, groovePulseAmount, grooveRotationAmount } = this.config;

        // Use smooth sine waves for all groove motions
        // beatProgress: 0-1 over one beat
        // barProgress: 0-1 over one bar (4 beats typically)

        // Vertical bounce: synced to beat, gentle up-down motion
        const bouncePhase = this.beatProgress * Math.PI * 2;
        const bounce = Math.sin(bouncePhase) * grooveBounceAmount;

        // Horizontal sway: slower, synced to half-bar for natural feel
        const swayPhase = this.barProgress * Math.PI * 2;
        const sway = Math.sin(swayPhase) * grooveSwayAmount;

        // Scale pulse: subtle breathing synced to beat
        const pulse = 1.0 + Math.sin(bouncePhase) * groovePulseAmount;

        // Rotation sway: gentle roll synced to bar
        const rotationSway = Math.sin(swayPhase) * grooveRotationAmount;

        // Write to target values (these get smoothed)
        this._target.grooveOffset = [sway, bounce, 0];
        this._target.grooveScale = pulse;
        this._target.grooveRotation = [0, 0, rotationSway];
    }

    /**
     * Apply exponential smoothing from current values toward targets
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

        // Smooth groove values (slightly slower for fluid motion)
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
     * Set groove configuration
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
export { rhythm3DAdapter };
export default rhythm3DAdapter;
