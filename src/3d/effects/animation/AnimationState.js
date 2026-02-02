/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Animation State Machine
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Per-element animation state machine for lifecycle management
 * @module effects/animation/AnimationState
 *
 * Lifecycle states:
 *   [waiting] → [entering] → [holding] → [exiting] → [dead/respawn]
 *
 * The state machine tracks progress through each phase and applies appropriate
 * animations based on the AnimationConfig.
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// ANIMATION STATES
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Animation lifecycle states
 */
export const AnimationStates = {
    WAITING: 'waiting',     // Waiting for appear time (stagger delay)
    ENTERING: 'entering',   // Enter animation playing
    HOLDING: 'holding',     // Visible, continuous animations active
    EXITING: 'exiting',     // Exit animation playing
    DEAD: 'dead'            // Animation complete, ready for cleanup or respawn
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// ANIMATION STATE CLASS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * AnimationState - Manages animation lifecycle for a single element
 */
export class AnimationState {
    /**
     * @param {AnimationConfig} config - Parsed animation configuration
     * @param {number} index - Element index (for stagger calculation)
     * @param {Object} [elementConfig] - Per-element overrides
     */
    constructor(config, index = 0, elementConfig = null) {
        this.config = config;
        this.index = index;
        this.elementConfig = config.createElementConfig(index);

        // Apply per-element overrides if provided
        if (elementConfig) {
            Object.assign(this.elementConfig, elementConfig);
        }

        // Current state
        this.state = AnimationStates.WAITING;

        // Progress through current state (0-1)
        this.progress = 0;

        // Absolute time tracking
        this.birthTime = 0;           // When element was created
        this.stateStartTime = 0;      // When current state began
        this.enterCompleteTime = 0;   // When enter finished (for hold duration)
        this.exitStartTime = 0;       // When exit began

        // Respawn tracking
        this.respawnCount = 0;
        this.isDead = false;

        // Computed values (updated each frame)
        this.opacity = 0;
        this.scale = 0;
        this.emissive = 1;
        this.fadeProgress = 0;  // Smooth fade 0-1 (no flicker) for stable geometry

        // Hold animation state
        this.holdTime = 0;            // Time since entering hold state
        this.pulsePhase = 0;          // Phase offset for pulse (for staggered sync)
        this.flickerValue = 1;        // Current flicker multiplier
        this.driftOffset = { x: 0, y: 0, z: 0 };  // Current drift offset
        this.rotationOffset = { x: 0, y: 0, z: 0 };  // Current rotation offset

        // Beat sync state
        this.currentBeat = 0;         // Current beat number (updated externally)
        this.lastBeatTriggered = -1;  // Last beat that triggered an action
        this.waitingForBeat = false;  // Whether we're waiting for a specific beat

        // Gesture progress tracking (for temperature animation etc.)
        this.gestureProgress = 0;     // Gesture progress 0-1
    }

    /**
     * Update beat state (called externally when beat occurs)
     * @param {number} beatNumber - Current beat number
     * @param {number} bpm - Beats per minute
     */
    setBeat(beatNumber, bpm = 120) {
        this.currentBeat = beatNumber;
        this.bpm = bpm;

        // Check if we're waiting for this beat to appear
        const {appearOnBeat} = this.config.timing;
        if (appearOnBeat !== null && this.state === AnimationStates.WAITING) {
            if (beatNumber >= appearOnBeat && this.lastBeatTriggered < appearOnBeat) {
                this.waitingForBeat = false;
                this.lastBeatTriggered = beatNumber;
            }
        }
    }

    /**
     * Initialize state at spawn time
     * @param {number} time - Current time in seconds
     */
    initialize(time) {
        this.birthTime = time;
        this.stateStartTime = time;
        this.state = AnimationStates.WAITING;
        this.progress = 0;
        this.opacity = 0;
        this.scale = 0;
        this.respawnCount = 0;
        this.isDead = false;

        // Set pulse phase based on sync mode
        if (this.config.hold.pulse?.sync === 'local') {
            this.pulsePhase = this.index * 0.2; // Stagger phase by index
        }

        // Fire onSpawn event
        this._fireEvent('onSpawn');
    }

    /**
     * Update animation state
     * @param {number} time - Current time in seconds
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {number} gestureProgress - Gesture progress 0-1 (optional)
     * @returns {boolean} True if element is still alive
     */
    update(time, deltaTime, gestureProgress = null) {
        if (this.isDead) return false;

        // Store gesture progress for external access (temperature animation, etc.)
        if (gestureProgress !== null) {
            this.gestureProgress = gestureProgress;
        }

        // Calculate appear/disappear thresholds
        const appearTime = this._getAppearTime(gestureProgress);
        const disappearTime = this._getDisappearTime(gestureProgress);
        const currentTime = this._getCurrentTime(time, gestureProgress);

        // State machine
        switch (this.state) {
        case AnimationStates.WAITING:
            this._updateWaiting(currentTime, appearTime);
            break;

        case AnimationStates.ENTERING:
            this._updateEntering(time, deltaTime, currentTime, disappearTime);
            break;

        case AnimationStates.HOLDING:
            this._updateHolding(time, deltaTime, currentTime, disappearTime);
            break;

        case AnimationStates.EXITING:
            this._updateExiting(time, deltaTime);
            break;

        case AnimationStates.DEAD:
            return this._handleDead();
        }

        return !this.isDead;
    }

    /**
     * Get current time based on mode (progress or absolute)
     * @private
     */
    _getCurrentTime(time, gestureProgress) {
        if (this.config.timing.mode === 'progress' && gestureProgress !== null) {
            return gestureProgress;
        }
        return (time - this.birthTime) * 1000; // Convert to ms
    }

    /**
     * Get appear time with stagger offset
     * @private
     */
    _getAppearTime(gestureProgress) {
        // Beat sync mode - return special sentinel if waiting for beat
        const {appearOnBeat} = this.config.timing;
        if (appearOnBeat !== null) {
            // If we haven't reached the beat yet, return Infinity to stay waiting
            if (this.currentBeat < appearOnBeat) {
                this.waitingForBeat = true;
                return Infinity;
            }
            // Beat reached, proceed with normal timing
            this.waitingForBeat = false;
        }

        const baseAppear = this.config.getAppearTime();
        const stagger = this.config.getStaggerOffset(this.index);

        // Apply delay variance
        const delayVariance = this.elementConfig.delayOffset || 0;

        if (this.config.timing.mode === 'progress') {
            return baseAppear + stagger + delayVariance;
        }
        return baseAppear + stagger + delayVariance * this.config.gestureDuration;
    }

    /**
     * Get disappear time
     * @private
     */
    _getDisappearTime(gestureProgress) {
        const baseDisappear = this.config.getDisappearTime();

        // Apply lifetime variance
        const lifetimeMultiplier = this.elementConfig.lifetimeMultiplier || 1;

        if (this.config.timing.mode === 'progress') {
            // Adjust disappear time based on lifetime multiplier
            const duration = baseDisappear - this.config.timing.appearAt;
            return this.config.timing.appearAt + duration * lifetimeMultiplier;
        }

        return baseDisappear * lifetimeMultiplier;
    }

    /**
     * Update WAITING state - waiting for appear time
     * @private
     */
    _updateWaiting(currentTime, appearTime) {
        if (currentTime >= appearTime) {
            this._transitionTo(AnimationStates.ENTERING);
            this._fireEvent('onEnterStart');
        }

        // Stay invisible during wait
        this.opacity = 0;
        this.scale = 0;
    }

    /**
     * Update ENTERING state - enter animation playing
     * @private
     */
    _updateEntering(time, deltaTime, currentTime, disappearTime) {
        const {enter} = this.config;
        // Convert progress-based duration to seconds (same formula as _updateExiting)
        const duration = this.config.timing.mode === 'progress'
            ? enter.duration * this.config.gestureDuration / 1000
            : enter.durationMs / 1000;

        // Calculate progress through enter animation
        const elapsed = time - this.stateStartTime;
        this.progress = Math.min(elapsed / duration, 1);

        // Apply easing
        const easedProgress = enter.easing(this.progress);

        // Apply enter animation type
        this._applyEnterAnimation(easedProgress);

        // Check for transition to holding
        if (this.progress >= 1) {
            this.enterCompleteTime = time;
            this._transitionTo(AnimationStates.HOLDING);
            this._fireEvent('onEnterComplete');

            // Normalize opacity/scale to final values
            this.opacity = this.elementConfig.opacity;
            this.scale = this.elementConfig.scale;
        }

        // Check if we should skip straight to exiting (short lifetime)
        if (currentTime >= disappearTime && this.state === AnimationStates.ENTERING) {
            this._transitionTo(AnimationStates.EXITING);
            this._fireEvent('onExitStart');
        }
    }

    /**
     * Apply enter animation based on type
     * @private
     */
    _applyEnterAnimation(progress) {
        const {enter} = this.config;
        const targetOpacity = this.elementConfig.opacity;
        const targetScale = this.elementConfig.scale;

        // Track smooth fade progress (no flicker) for stable geometry
        this.fadeProgress = progress;

        switch (enter.type) {
        case 'fade':
            // Simple opacity fade
            this.opacity = progress * targetOpacity;
            this.scale = targetScale;
            break;

        case 'flash':
            // Overbright then settle: 0 → peak → 1
            if (progress < 0.5) {
                // First half: ramp up to overbright
                const flashProgress = progress * 2;
                this.opacity = flashProgress * targetOpacity * 2; // Peak at 2x
                this.emissive = 1 + flashProgress * 1.5; // Extra bright
            } else {
                // Second half: settle to normal
                const settleProgress = (progress - 0.5) * 2;
                this.opacity = targetOpacity * (2 - settleProgress); // 2x → 1x
                this.emissive = 2.5 - settleProgress * 1.5; // Settle emissive
            }
            this.scale = targetScale;
            break;

        case 'grow': {
            // Scale from 0 to target
            const scaleRange = enter.scale;
            const startScale = scaleRange[0] * targetScale;
            const endScale = scaleRange[1] * targetScale;
            this.scale = startScale + progress * (endScale - startScale);
            this.opacity = targetOpacity;
            break;
        }

        case 'pop': {
            // Scale with overshoot: 0 → overshoot → target
            const {overshoot} = enter;
            if (progress < 0.7) {
                // Scale up to overshoot
                const popProgress = progress / 0.7;
                this.scale = popProgress * targetScale * overshoot;
            } else {
                // Settle back to target
                const settleProgress = (progress - 0.7) / 0.3;
                const bounce = this.config.enter.easing(settleProgress);
                this.scale = targetScale * (overshoot - (overshoot - 1) * bounce);
            }
            this.opacity = targetOpacity;
            break;
        }

        case 'none':
        default:
            // Instant appear
            this.opacity = targetOpacity;
            this.scale = targetScale;
            break;
        }
    }

    /**
     * Update HOLDING state - visible with continuous animations
     * @private
     */
    _updateHolding(time, deltaTime, currentTime, disappearTime) {
        this.holdTime += deltaTime;

        // Apply continuous hold animations
        this._applyHoldAnimations(time, deltaTime);

        // Check for transition to exiting
        if (currentTime >= disappearTime) {
            this.exitStartTime = time;
            this._transitionTo(AnimationStates.EXITING);
            this._fireEvent('onExitStart');
        }
    }

    /**
     * Apply continuous hold animations (pulse, flicker, drift, rotate, emissive)
     * @private
     */
    _applyHoldAnimations(time, deltaTime) {
        const {hold} = this.config;
        const baseOpacity = this.elementConfig.opacity;
        const baseScale = this.elementConfig.scale;

        // Fade progress stays at 1.0 during hold (smooth, no flicker)
        this.fadeProgress = 1.0;

        // Start with base values
        let opacityMod = 1;
        let scaleMod = 1;

        // PULSE: Scale oscillation
        if (hold.pulse) {
            const p = hold.pulse;
            const phase = (time + this.pulsePhase) * p.frequency * Math.PI * 2;
            const wave = Math.sin(phase);
            scaleMod *= 1 + wave * p.amplitude;
        }

        // FLICKER: Opacity variation
        if (hold.flicker) {
            const f = hold.flicker;
            switch (f.pattern) {
            case 'sine': {
                const phase = time * f.rate * Math.PI * 2;
                this.flickerValue = 1 + Math.sin(phase) * f.intensity;
                break;
            }
            case 'square': {
                const phase = (time * f.rate) % 1;
                this.flickerValue = phase < 0.5 ? (1 + f.intensity) : (1 - f.intensity);
                break;
            }
            case 'random':
            default:
                // Random flicker with some persistence
                if (Math.random() < f.rate * deltaTime) {
                    this.flickerValue = 1 + (Math.random() * 2 - 1) * f.intensity;
                }
                break;
            }
            opacityMod *= this.flickerValue;
        }

        // EMISSIVE: Glow animation (stored separately)
        if (hold.emissive) {
            const e = hold.emissive;
            switch (e.pattern) {
            case 'sine': {
                const phase = time * e.frequency * Math.PI * 2;
                const wave = (Math.sin(phase) + 1) / 2; // 0-1
                this.emissive = e.min + wave * (e.max - e.min);
                break;
            }
            case 'sawtooth': {
                const phase = (time * e.frequency) % 1;
                this.emissive = e.min + phase * (e.max - e.min);
                break;
            }
            case 'pulse': {
                const phase = (time * e.frequency) % 1;
                this.emissive = phase < e.dutyCycle ? e.max : e.min;
                break;
            }
            default:
                this.emissive = (e.min + e.max) / 2;
            }
        }

        // DRIFT: Position offset (applied externally)
        // Uses musical timing: distance = total drift over gesture lifetime
        if (hold.drift) {
            const d = hold.drift;
            // Calculate per-frame increment from total distance and gesture duration
            const increment = (d.distance / d.gestureDuration) * deltaTime;

            // Add noise if configured
            const noiseX = d.noise > 0 ? (Math.random() - 0.5) * d.noise * increment : 0;
            const noiseY = d.noise > 0 ? (Math.random() - 0.5) * d.noise * increment : 0;
            const noiseZ = d.noise > 0 ? (Math.random() - 0.5) * d.noise * increment : 0;

            switch (d.direction) {
            case 'outward':
                // Move away from origin (use element's initial position direction)
                this.driftOffset.x += (this.driftOffset.x || 0.001) > 0 ? increment + noiseX : -increment + noiseX;
                this.driftOffset.y += (this.driftOffset.y || 0.001) > 0 ? increment + noiseY : -increment + noiseY;
                this.driftOffset.z += (this.driftOffset.z || 0.001) > 0 ? increment + noiseZ : -increment + noiseZ;
                break;
            case 'inward':
                // Move toward origin
                this.driftOffset.x -= (this.driftOffset.x || 0.001) > 0 ? increment : -increment;
                this.driftOffset.y -= (this.driftOffset.y || 0.001) > 0 ? increment : -increment;
                this.driftOffset.z -= (this.driftOffset.z || 0.001) > 0 ? increment : -increment;
                break;
            case 'up':
                this.driftOffset.y += increment + noiseY;
                break;
            case 'down':
                this.driftOffset.y -= increment + noiseY;
                break;
            case 'tangent':
                // Flow along surface (horizontal drift)
                this.driftOffset.x += increment + noiseX;
                this.driftOffset.z += noiseZ;
                break;
            case 'random':
                this.driftOffset.x += (Math.random() - 0.5) * increment * 2;
                this.driftOffset.y += (Math.random() - 0.5) * increment * 2;
                this.driftOffset.z += (Math.random() - 0.5) * increment * 2;
                break;
            }

            // Clamp to distance limit (the configured total distance is the max)
            const dist = Math.sqrt(
                this.driftOffset.x ** 2 +
                this.driftOffset.y ** 2 +
                this.driftOffset.z ** 2
            );

            if (dist > d.distance) {
                if (d.bounce) {
                    // Reverse direction
                    const scale = d.distance / dist;
                    this.driftOffset.x *= -scale;
                    this.driftOffset.y *= -scale;
                    this.driftOffset.z *= -scale;
                } else {
                    // Clamp to max
                    const scale = d.distance / dist;
                    this.driftOffset.x *= scale;
                    this.driftOffset.y *= scale;
                    this.driftOffset.z *= scale;
                }
            }
        }

        // ROTATE: Rotation animation (applied externally)
        if (hold.rotate) {
            const r = hold.rotate;
            const speed = r.speed * deltaTime;

            // Gyroscope mode: each element rotates on a different axis based on index
            // Element 0 = X axis, Element 1 = Y axis, Element 2 = Z axis, then repeats
            let {axis} = r;
            if (r.gyroscope) {
                const axisIndex = this.index % 3;
                axis = axisIndex === 0 ? [1, 0, 0] :  // X axis
                    axisIndex === 1 ? [0, 1, 0] :  // Y axis
                        [0, 0, 1];  // Z axis
            }

            if (r.oscillate) {
                // Oscillating rotation
                const phase = time * r.speed * 2;
                const wave = Math.sin(phase);
                this.rotationOffset.x = axis[0] * wave * r.range;
                this.rotationOffset.y = axis[1] * wave * r.range;
                this.rotationOffset.z = axis[2] * wave * r.range;
            } else {
                // Continuous rotation
                this.rotationOffset.x += axis[0] * speed;
                this.rotationOffset.y += axis[1] * speed;
                this.rotationOffset.z += axis[2] * speed;
            }
        }

        // Apply modifiers to base values
        this.opacity = baseOpacity * opacityMod;
        this.scale = baseScale * scaleMod;
    }

    /**
     * Update EXITING state - exit animation playing
     * @private
     */
    _updateExiting(time, deltaTime) {
        const {exit} = this.config;
        const duration = this.config.timing.mode === 'progress'
            ? exit.duration * this.config.gestureDuration / 1000
            : exit.durationMs / 1000;

        // Calculate progress through exit animation
        const elapsed = time - this.exitStartTime;
        this.progress = Math.min(elapsed / duration, 1);

        // Apply easing
        const easedProgress = exit.easing(this.progress);

        // Apply exit animation type
        this._applyExitAnimation(easedProgress);

        // Check for transition to dead
        if (this.progress >= 1) {
            this._transitionTo(AnimationStates.DEAD);
            this._fireEvent('onExitComplete');
        }
    }

    /**
     * Apply exit animation based on type
     * @private
     */
    _applyExitAnimation(progress) {
        const {exit} = this.config;
        const currentOpacity = this.elementConfig.opacity;
        const currentScale = this.elementConfig.scale;

        // Track smooth fade progress (no flicker) for stable geometry
        this.fadeProgress = 1 - progress;

        switch (exit.type) {
        case 'fade':
            // Simple opacity fade out
            this.opacity = (1 - progress) * currentOpacity;
            break;

        case 'flash':
            // Flash bright then fade: 1 → peak → 0
            if (progress < 0.3) {
                // Flash up
                const flashProgress = progress / 0.3;
                this.opacity = currentOpacity * (1 + flashProgress);
                this.emissive = 1 + flashProgress * 2;
            } else {
                // Fade out
                const fadeProgress = (progress - 0.3) / 0.7;
                this.opacity = currentOpacity * 2 * (1 - fadeProgress);
                this.emissive = 3 * (1 - fadeProgress);
            }
            break;

        case 'shrink': {
            // Scale down to 0
            const scaleRange = exit.scale;
            const startScale = scaleRange[0] * currentScale;
            const endScale = scaleRange[1] * currentScale;
            this.scale = startScale + progress * (endScale - startScale);
            this.opacity = currentOpacity;
            break;
        }

        case 'pop': {
            // Quick shrink with slight bounce
            if (progress < 0.2) {
                // Slight expand before shrink
                this.scale = currentScale * (1 + progress * 0.5);
            } else {
                // Rapid shrink
                const shrinkProgress = (progress - 0.2) / 0.8;
                this.scale = currentScale * 1.1 * (1 - shrinkProgress);
            }
            this.opacity = currentOpacity * (1 - progress * 0.5); // Slight fade too
            break;
        }

        case 'none':
        default:
            // Instant disappear at end
            if (progress >= 1) {
                this.opacity = 0;
                this.scale = 0;
            }
            break;
        }
    }

    /**
     * Handle DEAD state - cleanup or respawn
     * @private
     */
    _handleDead() {
        const {lifecycle} = this.config;

        // Check if we should respawn
        if (lifecycle.respawn) {
            const {maxRespawns} = lifecycle;
            if (maxRespawns === -1 || this.respawnCount < maxRespawns) {
                // Will respawn - set up waiting period
                this.respawnCount++;
                this._fireEvent('onRespawn', this.respawnCount);

                // Reset to waiting state with respawn delay
                this.state = AnimationStates.WAITING;
                this.progress = 0;

                // Calculate respawn delay
                const delay = lifecycle.respawnDelay > 0
                    ? lifecycle.respawnDelay
                    : lifecycle.respawnDelayMs / 1000;

                this.birthTime = this.stateStartTime + delay;
                return true; // Still alive
            }
        }

        // Truly dead - ready for cleanup
        this.isDead = true;
        return false;
    }

    /**
     * Transition to a new state
     * @private
     */
    _transitionTo(newState) {
        this.state = newState;
        this.stateStartTime = this.exitStartTime || this.stateStartTime;
        this.progress = 0;
    }

    /**
     * Fire event callback if defined
     * @private
     */
    _fireEvent(eventName, ...args) {
        const callback = this.config.events[eventName];
        if (typeof callback === 'function') {
            try {
                callback(this.getElementInfo(), this.index, ...args);
            } catch (err) {
                console.warn(`[AnimationState] Error in ${eventName} callback:`, err);
            }
        }
    }

    /**
     * Get current element info for event callbacks
     * @returns {Object} Element information
     */
    getElementInfo() {
        return {
            state: this.state,
            progress: this.progress,
            opacity: this.opacity,
            scale: this.scale,
            emissive: this.emissive,
            driftOffset: { ...this.driftOffset },
            rotationOffset: { ...this.rotationOffset },
            respawnCount: this.respawnCount,
            config: this.config
        };
    }

    /**
     * Force transition to exit state
     */
    triggerExit() {
        if (this.state !== AnimationStates.EXITING && this.state !== AnimationStates.DEAD) {
            this._transitionTo(AnimationStates.EXITING);
            this._fireEvent('onExitStart');
        }
    }

    /**
     * Force immediate death (no exit animation)
     */
    kill() {
        this.isDead = true;
        this.state = AnimationStates.DEAD;
        this.opacity = 0;
        this.scale = 0;
    }
}

export default AnimationState;
