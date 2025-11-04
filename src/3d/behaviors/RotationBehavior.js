/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - 3D Rotation Behavior System
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Evaluates state-based rotation behaviors for 3D mascot
 * @author Emotive Engine Team
 * @module 3d/behaviors/RotationBehavior
 */

/**
 * Rotation behavior system for state-based mascot rotation patterns
 *
 * Supports multiple rotation types:
 * - gentle: Smooth slow spin (calm, neutral)
 * - unstable: Wobble/shake pattern (anger, fear)
 * - rhythmic: Syncs to music BPM (joy, excited)
 * - orbital: Figure-8 or circular patterns (euphoria)
 * - still: Minimal/no rotation (focused, resting)
 */
export default class RotationBehavior {
    /**
     * Create rotation behavior evaluator
     * @param {object} config - Rotation config from emotional state's 3d section
     * @param {object} rhythmEngine - Optional rhythm engine for BPM sync
     */
    constructor(config = {}, rhythmEngine = null) {
        this.config = config;
        this.rhythmEngine = rhythmEngine;

        // Rotation type (gentle, unstable, rhythmic, orbital, still)
        this.type = config.type || 'gentle';

        // Speed multiplier (default 1.0 = neutral speed)
        this.speed = config.speed || 1.0;

        // Rotation axes rates [X, Y, Z] in radians per second
        this.axes = config.axes || [0, 0.01, 0]; // Default: gentle Y-axis spin

        // Shake/wobble config (for unstable type)
        this.shake = config.shake || { amplitude: 0, frequency: 0 };

        // Music sync enabled
        this.musicSync = config.musicSync !== undefined ? config.musicSync : false;

        // Internal state for time-based patterns
        this.time = 0;

        // Episodic wobble (random shake bursts, e.g., for nervous undertone)
        this.episodicWobble = {
            enabled: false,              // Set by undertone
            minInterval: 2000,           // Minimum time between wobbles (ms)
            maxInterval: 5000,           // Maximum time between wobbles (ms)
            amplitude: 0.05,             // Wobble amplitude (radians)
            duration: 200,               // Wobble duration (ms)
            nextWobbleTime: 0,           // When next wobble should trigger
            wobbleStartTime: -1,         // When current wobble started (-1 = not wobbling)
            wobbleTarget: [0, 0, 0]      // Random target angles for current wobble
        };
    }

    /**
     * Update rotation behavior based on delta time
     * @param {number} deltaTime - Time since last frame (ms)
     * @param {Array} baseRotation - Current base rotation [x, y, z] to modify
     * @returns {Array} Updated rotation [x, y, z]
     */
    update(deltaTime, baseRotation) {
        // Update internal time
        this.time += deltaTime;

        // Apply episodic wobble if enabled (before type-specific behavior)
        if (this.episodicWobble.enabled) {
            this._applyEpisodicWobble(deltaTime, baseRotation);
        }

        // Evaluate rotation based on type
        switch (this.type) {
        case 'gentle':
            return this._evaluateGentle(deltaTime, baseRotation);

        case 'unstable':
            return this._evaluateUnstable(deltaTime, baseRotation);

        case 'rhythmic':
            return this._evaluateRhythmic(deltaTime, baseRotation);

        case 'orbital':
            return this._evaluateOrbital(deltaTime, baseRotation);

        case 'still':
            return this._evaluateStill(deltaTime, baseRotation);

        case 'suspicious':
            return this._evaluateSuspicious(deltaTime, baseRotation);

        default:
            return this._evaluateGentle(deltaTime, baseRotation);
        }
    }

    /**
     * Gentle rotation - smooth slow spin
     * Used by: calm, neutral, love
     */
    _evaluateGentle(deltaTime, baseRotation) {
        const dt = deltaTime * 0.001; // Convert ms to seconds

        // Apply axes rotation rates with speed multiplier
        baseRotation[0] += this.axes[0] * this.speed * dt;
        baseRotation[1] += this.axes[1] * this.speed * dt;
        baseRotation[2] += this.axes[2] * this.speed * dt;

        return baseRotation;
    }

    /**
     * Unstable rotation - wobble and shake
     * Used by: anger, fear, glitch
     */
    _evaluateUnstable(deltaTime, baseRotation) {
        const dt = deltaTime * 0.001; // Convert ms to seconds

        // Base rotation on all axes (wobbles unpredictably)
        baseRotation[0] += this.axes[0] * this.speed * dt;
        baseRotation[1] += this.axes[1] * this.speed * dt;
        baseRotation[2] += this.axes[2] * this.speed * dt;

        // Add shake/tremor using high-frequency sine waves
        const shakeTime = this.time * 0.001; // Time in seconds
        const freq = this.shake.frequency || 8; // Default 8 Hz
        const amp = this.shake.amplitude || 0.02; // Default 0.02 radians (~1 degree)

        // Multi-frequency shake for more organic feel
        const shakeX = Math.sin(shakeTime * freq * Math.PI * 2) * amp * 0.7;
        const shakeY = Math.sin(shakeTime * freq * Math.PI * 2 * 1.3) * amp * 0.5;
        const shakeZ = Math.sin(shakeTime * freq * Math.PI * 2 * 0.9) * amp * 0.8;

        baseRotation[0] += shakeX;
        baseRotation[1] += shakeY;
        baseRotation[2] += shakeZ;

        return baseRotation;
    }

    /**
     * Rhythmic rotation - syncs to music BPM
     * Used by: joy, excited, euphoria
     */
    _evaluateRhythmic(deltaTime, baseRotation) {
        const dt = deltaTime * 0.001; // Convert ms to seconds

        // If music sync enabled and rhythm engine available
        if (this.musicSync && this.rhythmEngine) {
            const bpm = this.rhythmEngine.bpm || 120;
            const beatDuration = 60 / bpm; // Seconds per beat

            // Pulse rotation speed on beat
            const beatPhase = (this.time * 0.001) % beatDuration;
            const beatPulse = Math.sin((beatPhase / beatDuration) * Math.PI * 2);
            const speedMod = 1.0 + (beatPulse * 0.3); // Pulse ±30% speed

            baseRotation[0] += this.axes[0] * this.speed * speedMod * dt;
            baseRotation[1] += this.axes[1] * this.speed * speedMod * dt;
            baseRotation[2] += this.axes[2] * this.speed * speedMod * dt;
        } else {
            // Fall back to gentle rotation if no rhythm engine
            return this._evaluateGentle(deltaTime, baseRotation);
        }

        return baseRotation;
    }

    /**
     * Orbital rotation - figure-8 or circular patterns
     * Used by: euphoria, surprise
     */
    _evaluateOrbital(deltaTime, baseRotation) {
        const dt = deltaTime * 0.001; // Convert ms to seconds
        const time = this.time * 0.001;

        // Figure-8 pattern using Lissajous curves
        const orbitSpeed = this.speed * 0.5; // Slower for smooth orbits
        const x = Math.sin(time * orbitSpeed * Math.PI * 2) * 0.1;
        const y = Math.sin(time * orbitSpeed * Math.PI * 2 * 2) * 0.1; // Double frequency for figure-8
        const z = Math.sin(time * orbitSpeed * Math.PI * 2 * 0.5) * 0.05;

        // Set rotation (not additive for orbits)
        baseRotation[0] = x;
        baseRotation[1] += this.axes[1] * this.speed * dt; // Continue Y-axis spin
        baseRotation[2] = z;

        return baseRotation;
    }

    /**
     * Still rotation - minimal or no rotation
     * Used by: focused, resting
     */
    _evaluateStill(deltaTime, baseRotation) {
        // Very slow or no rotation - just maintain current rotation
        // Apply minimal drift if axes are defined
        const dt = deltaTime * 0.001;
        const stillSpeed = 0.1; // 10% of normal speed

        baseRotation[0] += this.axes[0] * stillSpeed * dt;
        baseRotation[1] += this.axes[1] * stillSpeed * dt;
        baseRotation[2] += this.axes[2] * stillSpeed * dt;

        return baseRotation;
    }

    /**
     * Suspicious rotation - biased toward facing forward
     * Used by: suspicion
     *
     * Like a nervous person keeping eyes on a threat - spends most time
     * facing forward, then quick snap to look around before returning.
     * Uses sawtooth wave for asymmetric rotation (slow one way, fast back).
     */
    _evaluateSuspicious(deltaTime, baseRotation) {
        const dt = deltaTime * 0.001; // Convert to seconds
        const time = this.time * 0.001; // Time in seconds

        // Rotation cycle parameters
        const cycleDuration = 4.0; // 4 second cycle (configurable via speed)
        const adjustedCycle = cycleDuration / this.speed;

        // Current position in cycle [0, 1]
        const cycleProgress = (time % adjustedCycle) / adjustedCycle;

        // Sawtooth wave: slow rotation away from forward (0 → 180°), quick snap back (180° → 0°)
        // Spend 85% of time rotating slowly away, 15% snapping back (more forward-facing time)
        let targetYaw;
        if (cycleProgress < 0.85) {
            // Slow rotation phase: 0 → π over 85% of cycle
            targetYaw = (cycleProgress / 0.85) * Math.PI;
        } else {
            // Quick snap back: π → 0 over 15% of cycle
            const snapProgress = (cycleProgress - 0.85) / 0.15;
            targetYaw = Math.PI * (1.0 - snapProgress);
        }

        // Smooth interpolation toward target (prevents instant jumps)
        const lerpSpeed = 3.0; // Higher = faster following
        const yawDelta = targetYaw - baseRotation[1];
        baseRotation[1] += yawDelta * lerpSpeed * dt;

        return baseRotation;
    }

    /**
     * Reset internal time (useful for state transitions)
     */
    reset() {
        this.time = 0;
    }

    /**
     * Apply episodic wobble (random shake bursts)
     * @param {number} deltaTime - Time since last frame (ms)
     * @param {Array} baseRotation - Current base rotation to modify
     */
    _applyEpisodicWobble(deltaTime, baseRotation) {
        const wobble = this.episodicWobble;

        // Check if it's time to start a new wobble
        if (wobble.wobbleStartTime === -1 && this.time >= wobble.nextWobbleTime) {
            // Start new wobble
            wobble.wobbleStartTime = this.time;

            // Generate random target angles
            wobble.wobbleTarget = [
                (Math.random() - 0.5) * wobble.amplitude,  // Pitch
                (Math.random() - 0.5) * wobble.amplitude,  // Yaw
                (Math.random() - 0.5) * wobble.amplitude   // Roll
            ];

            // Schedule next wobble
            const interval = wobble.minInterval + Math.random() * (wobble.maxInterval - wobble.minInterval);
            wobble.nextWobbleTime = this.time + interval;
        }

        // Apply wobble if active
        if (wobble.wobbleStartTime !== -1) {
            const elapsed = this.time - wobble.wobbleStartTime;
            const progress = Math.min(elapsed / wobble.duration, 1.0);

            if (progress < 1.0) {
                // Wobble in progress - use sine wave for smooth shake
                const wobbleIntensity = Math.sin(progress * Math.PI);

                baseRotation[0] += wobble.wobbleTarget[0] * wobbleIntensity;
                baseRotation[1] += wobble.wobbleTarget[1] * wobbleIntensity;
                baseRotation[2] += wobble.wobbleTarget[2] * wobbleIntensity;
            } else {
                // Wobble complete
                wobble.wobbleStartTime = -1;
            }
        }
    }

    /**
     * Update config (when emotional state changes)
     * @param {object} config - New rotation config from state's 3d section
     */
    updateConfig(config) {
        this.config = config;
        this.type = config.type || 'gentle';
        this.speed = config.speed || 1.0;
        this.axes = config.axes || [0, 0.01, 0];
        this.shake = config.shake || { amplitude: 0, frequency: 0 };
        this.musicSync = config.musicSync !== undefined ? config.musicSync : false;
    }

    /**
     * Apply undertone multipliers to rotation behavior
     * Called after updateConfig when an undertone is active
     * @param {object} undertoneRotation - Undertone rotation multipliers
     */
    applyUndertoneMultipliers(undertoneRotation) {
        // Apply speed multiplier
        if (undertoneRotation.speedMultiplier !== undefined) {
            this.speed *= undertoneRotation.speedMultiplier;
        }

        // Apply shake multiplier to shake amplitude
        if (undertoneRotation.shakeMultiplier !== undefined && this.shake.amplitude) {
            this.shake.amplitude *= undertoneRotation.shakeMultiplier;
        }

        // Enable episodic wobble for nervous undertone
        if (undertoneRotation.enableEpisodicWobble !== undefined) {
            this.episodicWobble.enabled = undertoneRotation.enableEpisodicWobble;

            // Initialize first wobble timing if enabling
            if (this.episodicWobble.enabled && this.episodicWobble.nextWobbleTime === 0) {
                const interval = this.episodicWobble.minInterval +
                                Math.random() * (this.episodicWobble.maxInterval - this.episodicWobble.minInterval);
                this.episodicWobble.nextWobbleTime = this.time + interval;
            }
        }
    }
}
