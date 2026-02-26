/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *                       ◐ ◑ ◒ ◓  IDLE BEHAVIOR  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Idle Behavior - Organic Life Through Subtle Animations
 * @author Emotive Engine Team
 * @version 2.0.0
 * @module IdleBehavior
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Makes the orb feel ALIVE even when you're not interacting. Random blinks,
 * ║ subtle swaying, gentle breathing - all the little unconscious movements
 * ║ that make something feel like it has a soul rather than just code.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 😴 IDLE ANIMATIONS
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Blinking     : Random intervals (3-7 seconds)
 * │ • Swaying      : Subtle drift (20-40 second intervals)
 * │ • Breathing    : Continuous gentle pulsing
 * │ • Sleep Mode   : After timeout (default: never)
 * │ • Weight Shift : Occasional position adjustments
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ ⏱️ TIMING CONFIGURATION
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ BEHAVIOR       MIN TIME    MAX TIME    DURATION
 * │ Blinking       3000ms      7000ms      150ms
 * │ Swaying        20000ms     40000ms     4000ms
 * │ Sleep          Infinity    -            -
 * │ Breathing      continuous  -            0.25 rad/s
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

class IdleBehavior {
    constructor(options = {}) {
        // Configuration
        this.config = {
            blinkInterval: options.blinkInterval || { min: 3000, max: 7000 }, // ms - less frequent
            blinkDuration: options.blinkDuration || 150, // ms
            swayInterval: options.swayInterval || { min: 20000, max: 40000 }, // ms - very infrequent weight shifts
            swayDuration: options.swayDuration || 4000, // ms - very slow, smooth transition
            swayIntensity: options.swayIntensity || 1.5, // pixels - extremely subtle drift
            sleepTimeout: options.sleepTimeout !== undefined ? options.sleepTimeout : Infinity, // Default: never auto-sleep
            breathingSpeed: options.breathingSpeed || 0.25, // radians per second
            breathingDepth: options.breathingDepth || 0.1, // 10% size variation
            enabled: options.enabled !== false,
        };

        // State
        this.state = {
            isBlinking: false,
            isSwaying: false,
            isAsleep: false,
            breathingPhase: 0,
            breathRate: 1.0,
            breathDepth: this.config.breathingDepth,
        };

        // Timers
        this.timers = {
            idle: 0,
            blink: 0,
            sway: 0,
            swayProgress: 0, // 0 to 1 progress through sway animation
            nextBlink: this.getRandomInterval('blink'),
            nextSway: this.getRandomInterval('sway'),
        };

        // Sway state - smooth weight shift
        this.swayOffset = { x: 0, y: 0 };
        this.swayTarget = { x: 0, y: 0 };
        this.swayStart = { x: 0, y: 0 };

        // Track timeouts for cleanup
        this.wakeUpTimeout = null;

        // Callbacks
        this.callbacks = {
            onBlink: null,
            onSway: null,
            onSleep: null,
            onWake: null,
        };
    }

    /**
     * Update idle behaviors
     * @param {number} deltaTime - Time since last update in ms
     */
    update(deltaTime) {
        if (!this.config.enabled) return;

        // Update breathing
        this.updateBreathing(deltaTime);

        // Update idle timer
        this.timers.idle += deltaTime;

        // Check for sleep
        if (!this.state.isAsleep && this.timers.idle >= this.config.sleepTimeout) {
            this.enterSleep();
        }

        // Update blinking (only when awake)
        if (!this.state.isAsleep) {
            this.updateBlinking(deltaTime);
        }

        // Update swaying (only when awake)
        if (!this.state.isAsleep) {
            this.updateSwaying(deltaTime);
        }
    }

    /**
     * Update breathing animation
     */
    updateBreathing(deltaTime) {
        const speed = this.config.breathingSpeed * this.state.breathRate;
        this.state.breathingPhase += (speed * deltaTime) / 1000;

        // Keep phase in reasonable range
        if (this.state.breathingPhase > Math.PI * 2) {
            this.state.breathingPhase -= Math.PI * 2;
        }
    }

    /**
     * Update blinking behavior
     */
    updateBlinking(deltaTime) {
        // Check if blinking is disabled
        if (!this.isBlinkingEnabled()) {
            return;
        }

        if (!this.state.isBlinking) {
            // Wait for next blink
            this.timers.blink += deltaTime;
            if (this.timers.blink >= this.timers.nextBlink) {
                this.startBlink();
            }
        } else {
            // Currently blinking
            this.timers.blink += deltaTime;
            if (this.timers.blink >= this.config.blinkDuration) {
                this.endBlink();
            }
        }
    }

    /**
     * Update swaying behavior (smooth weight shift)
     */
    updateSwaying(deltaTime) {
        if (!this.state.isSwaying) {
            // Wait for next sway
            this.timers.sway += deltaTime;
            if (this.timers.sway >= this.timers.nextSway) {
                this.startSway();
            }
        } else {
            // Currently swaying - smooth interpolation
            this.timers.sway += deltaTime;
            const progress = Math.min(this.timers.sway / this.config.swayDuration, 1);

            // Use sine wave for smooth in-out easing
            const easedProgress = (Math.sin((progress - 0.5) * Math.PI) + 1) / 2;

            // Interpolate between start and target positions
            this.swayOffset.x =
                this.swayStart.x + (this.swayTarget.x - this.swayStart.x) * easedProgress;
            this.swayOffset.y =
                this.swayStart.y + (this.swayTarget.y - this.swayStart.y) * easedProgress;

            if (progress >= 1) {
                this.endSway();
            }
        }
    }

    /**
     * Start a blink
     */
    startBlink() {
        this.state.isBlinking = true;
        this.timers.blink = 0;

        if (this.callbacks.onBlink) {
            this.callbacks.onBlink({ phase: 'start' });
        }
    }

    /**
     * End a blink
     */
    endBlink() {
        this.state.isBlinking = false;
        this.timers.blink = 0;
        this.timers.nextBlink = this.getRandomInterval('blink');

        if (this.callbacks.onBlink) {
            this.callbacks.onBlink({ phase: 'end' });
        }
    }

    /**
     * Start a sway (smooth weight shift)
     */
    startSway() {
        this.state.isSwaying = true;
        this.timers.sway = 0;

        // Save current position as start
        this.swayStart = { ...this.swayOffset };

        // Generate subtle target offset - like shifting weight
        // Favor horizontal movement (side to side weight shift)
        const angle = Math.random() * Math.PI * 2;
        const distance = this.config.swayIntensity * (0.5 + Math.random() * 0.5);
        this.swayTarget = {
            x: Math.cos(angle) * distance * 1.5, // Slightly more horizontal
            y: Math.sin(angle) * distance * 0.5, // Less vertical
        };

        if (this.callbacks.onSway) {
            this.callbacks.onSway({
                phase: 'start',
                offset: this.swayOffset,
            });
        }
    }

    /**
     * End a sway
     */
    endSway() {
        this.state.isSwaying = false;
        this.timers.sway = 0;
        this.timers.nextSway = this.getRandomInterval('sway');

        // Start position for next sway is current position
        this.swayStart = { ...this.swayOffset };

        if (this.callbacks.onSway) {
            this.callbacks.onSway({
                phase: 'end',
                offset: this.swayOffset,
            });
        }
    }

    /**
     * Enter sleep mode
     */
    enterSleep() {
        this.state.isAsleep = true;
        this.state.breathRate = 0.5; // Slower breathing
        this.state.breathDepth = 0.15; // Deeper breaths

        // Force end any active blink
        if (this.state.isBlinking) {
            this.state.isBlinking = false;
            this.timers.blink = 0;
            if (this.callbacks.onBlink) {
                this.callbacks.onBlink({ phase: 'end' });
            }
        }

        if (this.callbacks.onSleep) {
            this.callbacks.onSleep();
        }
    }

    /**
     * Wake up from sleep
     */
    wakeUp() {
        if (!this.state.isAsleep) return;

        this.state.isAsleep = false;
        this.state.breathRate = 1.0;
        this.state.breathDepth = this.config.breathingDepth;
        this.timers.idle = 0; // Reset idle timer

        // Trigger a shake animation
        if (this.callbacks.onWake) {
            this.callbacks.onWake();
        }

        // Quick twitch series for wake animation
        this.performWakeAnimation();
    }

    /**
     * Perform wake-up animation
     */
    performWakeAnimation() {
        // Gentle stretch animation when waking
        const stretchOffset = {
            x: this.config.swayIntensity * 0.5,
            y: -this.config.swayIntensity, // Slight upward stretch
        };

        // Animate from current position to stretch and back
        this.swayStart = { ...this.swayOffset };
        this.swayTarget = stretchOffset;
        this.state.isSwaying = true;
        this.timers.sway = 0;

        if (this.callbacks.onSway) {
            this.callbacks.onSway({
                phase: 'wake',
                offset: this.swayOffset,
            });
        }

        // Clear any existing timeout
        if (this.wakeUpTimeout) {
            clearTimeout(this.wakeUpTimeout);
        }

        // Return to neutral after stretch
        this.wakeUpTimeout = setTimeout(() => {
            this.swayStart = { ...this.swayOffset };
            this.swayTarget = { x: 0, y: 0 };
            this.timers.sway = 0;
            this.wakeUpTimeout = null;
        }, 1000);
    }

    /**
     * Reset idle timer (called on user interaction)
     */
    resetIdleTimer() {
        this.timers.idle = 0;
        if (this.state.isAsleep) {
            this.wakeUp();
        }
    }

    /**
     * Enable or disable blinking
     * @param {boolean} enabled - Whether blinking should be enabled
     */
    setBlinkingEnabled(enabled) {
        this.config.blinkingEnabled = enabled;
        if (!enabled && this.state.isBlinking) {
            // If currently blinking, finish the blink
            this.endBlink();
        }
    }

    /**
     * Check if blinking is enabled
     * @returns {boolean} Whether blinking is enabled
     */
    isBlinkingEnabled() {
        return this.config.blinkingEnabled !== false;
    }

    /**
     * Get breathing factor for current phase
     * @returns {number} Breathing factor (0.9 - 1.1 typically)
     */
    getBreathingFactor() {
        return (
            1 + Math.sin(this.state.breathingPhase) * this.state.breathDepth * this.state.breathRate
        );
    }

    /**
     * Get blink progress (0-1)
     * @returns {number} Blink progress
     */
    getBlinkProgress() {
        if (!this.state.isBlinking) return 0;
        return Math.min(this.timers.blink / this.config.blinkDuration, 1);
    }

    /**
     * Get current sway offset
     * @returns {Object} Sway offset {x, y}
     */
    getSwayOffset() {
        return this.swayOffset || { x: 0, y: 0 };
    }

    /**
     * Get random interval for behavior
     */
    getRandomInterval(type) {
        const interval = this.config[`${type}Interval`];
        return interval.min + Math.random() * (interval.max - interval.min);
    }

    /**
     * Set callback for behavior events
     */
    setCallback(event, callback) {
        if (Object.prototype.hasOwnProperty.call(this.callbacks, event)) {
            this.callbacks[event] = callback;
        }
    }

    /**
     * Get current state
     */
    getState() {
        return {
            ...this.state,
            breathingFactor: this.getBreathingFactor(),
            blinkProgress: this.getBlinkProgress(),
            swayOffset: this.getSwayOffset(),
        };
    }

    /**
     * Enable idle behaviors
     */
    enable() {
        this.config.enabled = true;
    }

    /**
     * Disable idle behaviors
     */
    disable() {
        this.config.enabled = false;
        this.state.isBlinking = false;
        this.state.isSwaying = false;
        this.swayOffset = { x: 0, y: 0 };
    }

    /**
     * Clean up
     */
    destroy() {
        // Clear any pending timeouts
        if (this.wakeUpTimeout) {
            clearTimeout(this.wakeUpTimeout);
            this.wakeUpTimeout = null;
        }

        this.callbacks = {
            onBlink: null,
            onSway: null,
            onSleep: null,
            onWake: null,
        };
    }
}

export default IdleBehavior;
