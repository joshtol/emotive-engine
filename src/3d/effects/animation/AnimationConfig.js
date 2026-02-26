/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Animation Config Parser
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Parses, validates, and provides defaults for animation configurations
 * @module effects/animation/AnimationConfig
 *
 * The animation config controls the lifecycle of spawned elements:
 * - TIMING: When elements appear/disappear (gesture progress 0-1 or milliseconds)
 * - ENTER/EXIT: How elements animate in/out (fade, flash, grow, shrink, pop)
 * - HOLD: Continuous animations while visible (pulse, flicker, drift, rotate)
 * - VARIANCE: Per-element random variation within bounds
 *
 * See ELEMENTAL.md for complete schema documentation.
 */

import { getEasing } from './Easing.js';

// ═══════════════════════════════════════════════════════════════════════════════════════
// DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Default animation configuration
 * These values are used when not specified in the config
 */
export const ANIMATION_DEFAULTS = {
    // Timing
    appearAt: 0,
    disappearAt: 1.0,
    delayMs: 0,
    lifetimeMs: null, // null = use gesture progress
    stagger: 0,
    staggerMs: 0,

    // Enter animation
    enter: {
        type: 'fade',
        duration: 0.05,
        durationMs: 50,
        easing: 'easeOut',
        scale: [0, 1],
        overshoot: 1.2,
    },

    // Exit animation
    exit: {
        type: 'fade',
        duration: 0.15,
        durationMs: 150,
        easing: 'easeIn',
        scale: [1, 0],
    },

    // Hold animations (all optional)
    pulse: null,
    flicker: null,
    drift: null,
    rotate: null,
    emissive: null,

    // Variance
    scaleVariance: 0,
    lifetimeVariance: 0,
    colorVariance: 0,
    delayVariance: 0,

    // Appearance
    color: null,
    opacity: { base: 1.0, variance: 0 },
    scale: { base: 1.0, variance: 0 },

    // Rendering
    renderOrder: 0,
    depthTest: true,
    depthWrite: false,
    blending: 'normal',

    // Trail
    trail: null,

    // Lifecycle
    respawn: false,
    respawnDelay: 0,
    respawnDelayMs: 0,
    maxRespawns: -1,

    // Events (null = no callback)
    onSpawn: null,
    onEnterStart: null,
    onEnterComplete: null,
    onExitStart: null,
    onExitComplete: null,
    onRespawn: null,
};

/**
 * Default pulse animation config
 */
export const PULSE_DEFAULTS = {
    amplitude: 0.1,
    frequency: 2,
    easing: 'easeInOut',
    sync: 'global',
};

/**
 * Default flicker animation config
 */
export const FLICKER_DEFAULTS = {
    intensity: 0.2,
    rate: 10,
    pattern: 'random',
    seed: null,
};

/**
 * Default drift animation config
 * distance: total distance to drift over gesture lifetime (musical timing)
 * distance: total drift over gesture lifetime (musical timing)
 */
export const DRIFT_DEFAULTS = {
    direction: 'outward',
    distance: 0.1, // Total drift distance over gesture lifetime (musical timing)
    speed: 0.02, // Speed for physics-based drift (units per frame)
    maxDistance: 1.0, // Maximum drift distance cap
    bounce: false,
    noise: 0,
};

/**
 * Default rotate animation config
 *
 * Supports two formats:
 * 1. Simple (all elements same): { axis: 'y', speed: 0.1 }
 * 2. Per-element with musical timing: [{ axis: 'x', rotations: 1, phase: 0 }, ...]
 *
 * Musical timing: `rotations` = full rotations over gesture duration (more intuitive than speed)
 */
export const ROTATE_DEFAULTS = {
    axis: 'y',
    speed: 0.1, // Legacy: arbitrary speed units
    rotations: null, // Musical timing: full rotations per gesture (overrides speed if set)
    phase: 0, // Starting angle in degrees
    oscillate: false,
    range: Math.PI / 4,
    easing: 'linear',
};

/**
 * Default emissive animation config
 */
export const EMISSIVE_DEFAULTS = {
    min: 0.5,
    max: 1.5,
    frequency: 1,
    pattern: 'sine',
    dutyCycle: 0.5,
};

/**
 * Default procedural element config
 * For elements with shader-driven animations (fire, water, electricity, etc.)
 */
export const PROCEDURAL_DEFAULTS = {
    // Geometry stability: use smooth fade for vertex displacement
    geometryStability: true,
    // Scale smoothing: lerp factor per frame (0 = instant, 1 = no change)
    scaleSmoothing: 0, // 0 = disabled (instant), 0.08 = smooth (fire), 0.15 = very smooth
    // Shader bindings: map animation state to shader uniforms
    shaderBindings: null,
};

/**
 * Default parameter animation config
 * Animates shader uniforms over gesture lifetime (e.g., temperature, waveHeight)
 */
export const PARAMETER_ANIMATION_DEFAULTS = {
    start: 0,
    peak: 1,
    end: 0,
    curve: 'bell', // 'bell', 'spike', 'sustained', 'pulse', 'linear'
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// ANIMATION CONFIG CLASS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * AnimationConfig - Parses and validates animation configuration
 */
export class AnimationConfig {
    /**
     * @param {Object} config - Raw animation config from user
     * @param {number} [gestureDuration=1000] - Gesture duration in ms (for progress conversion)
     */
    constructor(config = {}, gestureDuration = 1000) {
        this.gestureDuration = gestureDuration;
        this.raw = config;

        // Parse and validate all sections
        this.timing = this._parseTiming(config);
        this.enter = this._parseEnter(config.enter);
        this.exit = this._parseExit(config.exit);
        this.hold = this._parseHold(config);
        this.variance = this._parseVariance(config);
        this.appearance = this._parseAppearance(config);
        this.rendering = this._parseRendering(config);
        this.lifecycle = this._parseLifecycle(config);
        this.events = this._parseEvents(config);
        this.intensityScaling = this._parseIntensityScaling(config.intensityScaling);

        // Procedural element config (geometry stability, scale smoothing)
        this.procedural = this._parseProcedural(config);

        // Parameter animation: animate shader uniforms over gesture lifetime
        // Generic system that works for any element (fire temperature, water flow, etc.)
        this.parameterAnimation = this._parseParameterAnimation(
            config.parameterAnimation || config.temperature
        );

        // Phase 11: Model-specific behavior overrides
        // Allows gestures to override MODEL_BEHAVIORS for specific models
        this.modelOverrides = config.modelOverrides || null;

        // Current intensity (can be updated dynamically)
        this._intensity = 1.0;
    }

    /**
     * Get effective animation config for a specific model
     * Merges base config with model-specific overrides
     * @param {string} modelName - Model name
     * @returns {Object} Config with model overrides applied
     */
    getConfigForModel(modelName) {
        if (!this.modelOverrides || !this.modelOverrides[modelName]) {
            return null;
        }
        return this.modelOverrides[modelName];
    }

    /**
     * Parse intensity scaling configuration
     * Defines how animation values scale with gesture intensity (0-1)
     * @private
     */
    _parseIntensityScaling(scaling = {}) {
        return {
            scale: scaling.scale ?? 1.0, // At max intensity, scale multiplier
            count: scaling.count ?? 1.0, // At max intensity, count multiplier
            lifetime: scaling.lifetime ?? 1.0, // At max intensity, lifetime multiplier
            enterDuration: scaling.enterDuration ?? 1.0,
            exitDuration: scaling.exitDuration ?? 1.0,
            pulseAmplitude: scaling.pulseAmplitude ?? 1.0,
            flickerIntensity: scaling.flickerIntensity ?? 1.0,
            emissiveMax: scaling.emissiveMax ?? 1.0,
            driftSpeed: scaling.driftSpeed ?? 1.0,
            rotateSpeed: scaling.rotateSpeed ?? 1.0,
        };
    }

    /**
     * Set the current intensity level
     * @param {number} intensity - Intensity 0-1
     */
    setIntensity(intensity) {
        this._intensity = Math.max(0, Math.min(1, intensity));
    }

    /**
     * Get the current intensity level
     * @returns {number} Current intensity 0-1
     */
    getIntensity() {
        return this._intensity;
    }

    /**
     * Get a scaled value based on current intensity
     * @param {string} property - Property name from intensityScaling
     * @param {number} baseValue - Base value to scale
     * @returns {number} Scaled value
     */
    getScaledValue(property, baseValue) {
        const scaleFactor = this.intensityScaling[property] ?? 1.0;
        // Interpolate: at intensity 0 = baseValue, at intensity 1 = baseValue * scaleFactor
        return baseValue * (1 + (scaleFactor - 1) * this._intensity);
    }

    /**
     * Parse timing configuration
     * @private
     */
    _parseTiming(config) {
        return {
            // Progress-based (0-1)
            appearAt: config.appearAt ?? ANIMATION_DEFAULTS.appearAt,
            disappearAt: config.disappearAt ?? ANIMATION_DEFAULTS.disappearAt,

            // Millisecond-based (fallback)
            delayMs: config.delayMs ?? ANIMATION_DEFAULTS.delayMs,
            lifetimeMs: config.lifetimeMs ?? ANIMATION_DEFAULTS.lifetimeMs,

            // Stagger
            stagger: config.stagger ?? ANIMATION_DEFAULTS.stagger,
            staggerMs: config.staggerMs ?? ANIMATION_DEFAULTS.staggerMs,

            // Beat sync (optional)
            appearOnBeat: config.appearOnBeat ?? null,

            // Mode: 'progress' or 'ms'
            mode: this._determineTimingMode(config),
        };
    }

    /**
     * Determine whether to use progress-based or ms-based timing
     * @private
     */
    _determineTimingMode(config) {
        // If explicit progress values are set, prefer progress mode
        if (config.appearAt !== undefined || config.disappearAt !== undefined) {
            return 'progress';
        }
        // If only ms values are set, use ms mode
        if (config.delayMs !== undefined || config.lifetimeMs !== undefined) {
            return 'ms';
        }
        // Default to progress mode
        return 'progress';
    }

    /**
     * Parse enter animation configuration
     * @private
     */
    _parseEnter(enter = {}) {
        const defaults = ANIMATION_DEFAULTS.enter;
        return {
            type: enter.type ?? defaults.type,
            duration: enter.duration ?? defaults.duration,
            durationMs: enter.durationMs ?? defaults.durationMs,
            easing: getEasing(enter.easing ?? defaults.easing),
            easingName: enter.easing ?? defaults.easing,
            scale: enter.scale ?? defaults.scale,
            overshoot: enter.overshoot ?? defaults.overshoot,
        };
    }

    /**
     * Parse exit animation configuration
     * @private
     */
    _parseExit(exit = {}) {
        const defaults = ANIMATION_DEFAULTS.exit;
        return {
            type: exit.type ?? defaults.type,
            duration: exit.duration ?? defaults.duration,
            durationMs: exit.durationMs ?? defaults.durationMs,
            easing: getEasing(exit.easing ?? defaults.easing),
            easingName: exit.easing ?? defaults.easing,
            scale: exit.scale ?? defaults.scale,
        };
    }

    /**
     * Parse hold animations configuration
     * @private
     */
    _parseHold(config) {
        return {
            pulse: config.pulse ? this._parsePulse(config.pulse) : null,
            flicker: config.flicker ? this._parseFlicker(config.flicker) : null,
            drift: config.drift ? this._parseDrift(config.drift) : null,
            rotate: config.rotate ? this._parseRotate(config.rotate) : null,
            emissive: config.emissive ? this._parseEmissive(config.emissive) : null,
        };
    }

    /**
     * Parse pulse animation
     * @private
     */
    _parsePulse(pulse) {
        return {
            amplitude: pulse.amplitude ?? PULSE_DEFAULTS.amplitude,
            frequency: pulse.frequency ?? PULSE_DEFAULTS.frequency,
            easing: getEasing(pulse.easing ?? PULSE_DEFAULTS.easing),
            sync: pulse.sync ?? PULSE_DEFAULTS.sync,
        };
    }

    /**
     * Parse flicker animation
     * @private
     */
    _parseFlicker(flicker) {
        return {
            intensity: flicker.intensity ?? FLICKER_DEFAULTS.intensity,
            rate: flicker.rate ?? FLICKER_DEFAULTS.rate,
            pattern: flicker.pattern ?? FLICKER_DEFAULTS.pattern,
            seed: flicker.seed ?? FLICKER_DEFAULTS.seed,
        };
    }

    /**
     * Parse drift animation
     * Uses musical timing: distance = total drift over gesture lifetime
     * @private
     */
    _parseDrift(drift) {
        return {
            direction: drift.direction ?? DRIFT_DEFAULTS.direction,
            distance: drift.distance ?? DRIFT_DEFAULTS.distance,
            speed: drift.speed ?? DRIFT_DEFAULTS.speed,
            maxDistance: drift.maxDistance ?? DRIFT_DEFAULTS.maxDistance,
            gestureDuration: this.gestureDuration,
            bounce: drift.bounce ?? DRIFT_DEFAULTS.bounce,
            noise: drift.noise ?? DRIFT_DEFAULTS.noise,
        };
    }

    /**
     * Parse rotate animation
     * Supports two formats:
     * 1. Simple object: { axis: 'y', speed: 0.1 } - same config for all elements
     * 2. Per-element array: [{ axis: 'x', rotations: 1, phase: 0 }, ...] - musical timing
     * @private
     */
    _parseRotate(rotate) {
        // Check for per-element array format (new musical timing system)
        if (Array.isArray(rotate)) {
            const elements = rotate.map(elem => this._parseRotateElement(elem));
            return {
                isPerElement: true,
                elements,
                // Shared settings (use first element's values as defaults for compatibility)
                oscillate: elements[0]?.oscillate ?? ROTATE_DEFAULTS.oscillate,
                range: elements[0]?.range ?? ROTATE_DEFAULTS.range,
                easing: elements[0]?.easing ?? getEasing(ROTATE_DEFAULTS.easing),
            };
        }

        // Simple object format (legacy or single config for all elements)
        const elem = this._parseRotateElement(rotate);
        return {
            isPerElement: false,
            elements: [elem], // Wrap in array for consistent access
            ...elem,
        };
    }

    /**
     * Parse a single rotation element config
     * @private
     */
    _parseRotateElement(elem) {
        // Normalize axis to array format [x, y, z]
        let axis = elem.axis ?? ROTATE_DEFAULTS.axis;
        if (typeof axis === 'string') {
            axis =
                axis === 'x'
                    ? [1, 0, 0]
                    : axis === 'y'
                      ? [0, 1, 0]
                      : axis === 'z'
                        ? [0, 0, 1]
                        : [0, 1, 0]; // default to Y
        }

        return {
            axis,
            speed: elem.speed ?? ROTATE_DEFAULTS.speed,
            rotations: elem.rotations ?? ROTATE_DEFAULTS.rotations, // Musical timing (overrides speed)
            phase: elem.phase ?? ROTATE_DEFAULTS.phase, // Starting angle in degrees
            oscillate: elem.oscillate ?? ROTATE_DEFAULTS.oscillate,
            range: elem.range ?? ROTATE_DEFAULTS.range,
            easing: getEasing(elem.easing ?? ROTATE_DEFAULTS.easing),
        };
    }

    /**
     * Parse emissive animation
     * @private
     */
    _parseEmissive(emissive) {
        return {
            min: emissive.min ?? EMISSIVE_DEFAULTS.min,
            max: emissive.max ?? EMISSIVE_DEFAULTS.max,
            frequency: emissive.frequency ?? EMISSIVE_DEFAULTS.frequency,
            pattern: emissive.pattern ?? EMISSIVE_DEFAULTS.pattern,
            dutyCycle: emissive.dutyCycle ?? EMISSIVE_DEFAULTS.dutyCycle,
        };
    }

    /**
     * Parse variance configuration
     * @private
     */
    _parseVariance(config) {
        return {
            scale: config.scaleVariance ?? ANIMATION_DEFAULTS.scaleVariance,
            lifetime: config.lifetimeVariance ?? ANIMATION_DEFAULTS.lifetimeVariance,
            color: config.colorVariance ?? ANIMATION_DEFAULTS.colorVariance,
            delay: config.delayVariance ?? ANIMATION_DEFAULTS.delayVariance,
        };
    }

    /**
     * Parse appearance configuration
     * @private
     */
    _parseAppearance(config) {
        const color = config.color
            ? {
                  tint: config.color.tint ?? null,
                  multiply: config.color.multiply ?? true,
                  variance: config.color.variance ?? 0,
              }
            : null;

        const opacity = config.opacity
            ? {
                  base: config.opacity.base ?? ANIMATION_DEFAULTS.opacity.base,
                  variance: config.opacity.variance ?? ANIMATION_DEFAULTS.opacity.variance,
              }
            : { ...ANIMATION_DEFAULTS.opacity };

        const scale = config.scale
            ? {
                  base: config.scale.base ?? ANIMATION_DEFAULTS.scale.base,
                  variance: config.scale.variance ?? ANIMATION_DEFAULTS.scale.variance,
              }
            : { ...ANIMATION_DEFAULTS.scale };

        return { color, opacity, scale };
    }

    /**
     * Parse rendering configuration
     * @private
     */
    _parseRendering(config) {
        return {
            renderOrder: config.renderOrder ?? ANIMATION_DEFAULTS.renderOrder,
            depthTest: config.depthTest ?? ANIMATION_DEFAULTS.depthTest,
            depthWrite: config.depthWrite ?? ANIMATION_DEFAULTS.depthWrite,
            blending: config.blending ?? ANIMATION_DEFAULTS.blending,
            trail: config.trail ? this._parseTrail(config.trail) : null,
        };
    }

    /**
     * Parse trail configuration
     * @private
     */
    _parseTrail(trail) {
        return {
            count: trail.count ?? 3,
            fadeRate: trail.fadeRate ?? 0.3,
            spacing: trail.spacing ?? 0.05,
            inheritRotation: trail.inheritRotation ?? true,
        };
    }

    /**
     * Parse lifecycle configuration
     * @private
     */
    _parseLifecycle(config) {
        return {
            respawn: config.respawn ?? ANIMATION_DEFAULTS.respawn,
            respawnDelay: config.respawnDelay ?? ANIMATION_DEFAULTS.respawnDelay,
            respawnDelayMs: config.respawnDelayMs ?? ANIMATION_DEFAULTS.respawnDelayMs,
            maxRespawns: config.maxRespawns ?? ANIMATION_DEFAULTS.maxRespawns,
        };
    }

    /**
     * Parse event callbacks
     * @private
     */
    _parseEvents(config) {
        return {
            onSpawn: config.onSpawn ?? null,
            onEnterStart: config.onEnterStart ?? null,
            onEnterComplete: config.onEnterComplete ?? null,
            onExitStart: config.onExitStart ?? null,
            onExitComplete: config.onExitComplete ?? null,
            onRespawn: config.onRespawn ?? null,
        };
    }

    /**
     * Parse procedural element configuration
     * For elements with shader-driven animations (fire, water, electricity, etc.)
     * @private
     */
    _parseProcedural(config) {
        // Check if any procedural features are explicitly configured
        const hasProceduralConfig =
            config.procedural ||
            config.scaleSmoothing !== undefined ||
            config.geometryStability !== undefined;

        if (!hasProceduralConfig) {
            return null;
        }

        const procedural = config.procedural || {};
        return {
            geometryStability:
                procedural.geometryStability ??
                config.geometryStability ??
                PROCEDURAL_DEFAULTS.geometryStability,
            scaleSmoothing:
                procedural.scaleSmoothing ??
                config.scaleSmoothing ??
                PROCEDURAL_DEFAULTS.scaleSmoothing,
            shaderBindings: procedural.shaderBindings ?? null,
        };
    }

    /**
     * Parse parameter animation configuration
     * Generic system to animate any shader uniform over gesture lifetime
     * Works for fire (temperature), water (waveHeight), electricity (intensity), etc.
     * @private
     */
    _parseParameterAnimation(paramConfig) {
        if (!paramConfig) return null;

        // If it's the old fire-style config with start/peak/end at top level
        if (paramConfig.start !== undefined || paramConfig.peak !== undefined) {
            return {
                primary: {
                    start: paramConfig.start ?? PARAMETER_ANIMATION_DEFAULTS.start,
                    peak: paramConfig.peak ?? PARAMETER_ANIMATION_DEFAULTS.peak,
                    end: paramConfig.end ?? PARAMETER_ANIMATION_DEFAULTS.end,
                    curve: paramConfig.curve ?? PARAMETER_ANIMATION_DEFAULTS.curve,
                },
            };
        }

        // New style: object with named parameters
        // e.g., { temperature: { start, peak, end, curve }, waveHeight: { ... } }
        const parsed = {};
        for (const [key, value] of Object.entries(paramConfig)) {
            if (typeof value === 'object' && value !== null) {
                parsed[key] = {
                    start: value.start ?? PARAMETER_ANIMATION_DEFAULTS.start,
                    peak: value.peak ?? PARAMETER_ANIMATION_DEFAULTS.peak,
                    end: value.end ?? PARAMETER_ANIMATION_DEFAULTS.end,
                    curve: value.curve ?? PARAMETER_ANIMATION_DEFAULTS.curve,
                };
            }
        }
        return Object.keys(parsed).length > 0 ? parsed : null;
    }

    // ═══════════════════════════════════════════════════════════════════════════════════
    // UTILITY METHODS
    // ═══════════════════════════════════════════════════════════════════════════════════

    /**
     * Convert gesture progress (0-1) to milliseconds
     * @param {number} progress - Gesture progress 0-1
     * @returns {number} Milliseconds
     */
    progressToMs(progress) {
        return progress * this.gestureDuration;
    }

    /**
     * Convert milliseconds to gesture progress (0-1)
     * @param {number} ms - Milliseconds
     * @returns {number} Gesture progress 0-1
     */
    msToProgress(ms) {
        return ms / this.gestureDuration;
    }

    /**
     * Get appear time in the specified mode
     * @param {string} [mode='auto'] - 'progress', 'ms', or 'auto'
     * @returns {number} Appear time
     */
    getAppearTime(mode = 'auto') {
        const useMode = mode === 'auto' ? this.timing.mode : mode;
        if (useMode === 'ms') {
            return this.timing.delayMs > 0
                ? this.timing.delayMs
                : this.progressToMs(this.timing.appearAt);
        }
        return this.timing.appearAt;
    }

    /**
     * Get disappear time in the specified mode
     * @param {string} [mode='auto'] - 'progress', 'ms', or 'auto'
     * @returns {number} Disappear time
     */
    getDisappearTime(mode = 'auto') {
        const useMode = mode === 'auto' ? this.timing.mode : mode;
        if (useMode === 'ms' && this.timing.lifetimeMs !== null) {
            return this.timing.delayMs + this.timing.lifetimeMs;
        }
        if (useMode === 'ms') {
            return this.progressToMs(this.timing.disappearAt);
        }
        return this.timing.disappearAt;
    }

    /**
     * Get stagger time for a specific element index
     * @param {number} index - Element index
     * @param {string} [mode='auto'] - 'progress', 'ms', or 'auto'
     * @returns {number} Stagger offset
     */
    getStaggerOffset(index, mode = 'auto') {
        const useMode = mode === 'auto' ? this.timing.mode : mode;
        if (useMode === 'ms') {
            return this.timing.staggerMs > 0
                ? index * this.timing.staggerMs
                : index * this.progressToMs(this.timing.stagger);
        }
        return index * this.timing.stagger;
    }

    /**
     * Apply variance to a base value
     * @param {number} base - Base value
     * @param {number} variance - Variance amount (0-1, as ±percentage)
     * @returns {number} Value with variance applied
     */
    applyVariance(base, variance) {
        if (variance === 0) return base;
        const range = base * variance;
        return base + (Math.random() * 2 - 1) * range;
    }

    /**
     * Create per-element config with variance applied
     * @param {number} index - Element index
     * @param {number} [seed] - Optional random seed for deterministic variance
     * @returns {Object} Per-element configuration
     */
    createElementConfig(index, _seed = null) {
        // Could use seeded random here if seed is provided
        return {
            index,
            appearOffset: this.getStaggerOffset(index),
            scale: this.applyVariance(this.appearance.scale.base, this.variance.scale),
            opacity: this.applyVariance(
                this.appearance.opacity.base,
                this.appearance.opacity.variance
            ),
            lifetimeMultiplier: 1 + (Math.random() * 2 - 1) * this.variance.lifetime,
            delayOffset: this.applyVariance(0, this.variance.delay),
        };
    }

    /**
     * Merge this config with element-specific overrides
     * @param {Object} elementConfig - Per-element overrides
     * @returns {AnimationConfig} Merged config
     */
    mergeWithElement(elementConfig) {
        if (!elementConfig) return this;

        // Deep merge the raw configs
        const merged = {
            ...this.raw,
            ...elementConfig,
            enter: { ...this.raw.enter, ...elementConfig.enter },
            exit: { ...this.raw.exit, ...elementConfig.exit },
        };

        return new AnimationConfig(merged, this.gestureDuration);
    }
}

/**
 * Parse animation config (convenience function)
 * @param {Object} config - Raw animation config
 * @param {number} [gestureDuration=1000] - Gesture duration in ms
 * @returns {AnimationConfig} Parsed config
 */
export function parseAnimationConfig(config, gestureDuration = 1000) {
    return new AnimationConfig(config, gestureDuration);
}

// ═══════════════════════════════════════════════════════════════════════════════════
// PARAMETER ANIMATION EVALUATION
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Attempt to behave like GLSL smoothstep for arbitrary edge values.
 * @param {number} edge0 - Lower edge
 * @param {number} edge1 - Upper edge
 * @param {number} x - Input value
 * @returns {number} Smoothed value 0→1
 */
function smoothstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
}

/**
 * Evaluate a single parameter animation at a given gesture progress.
 *
 * Interpolates start → peak → end using the specified curve shape.
 * Returns the parameter value at the current progress point.
 *
 * @param {Object} param - Parameter config { start, peak, end, curve }
 * @param {number} progress - Gesture progress 0→1
 * @returns {number} Interpolated parameter value
 */
export function evaluateParameterValue(param, progress) {
    if (!param) return 0;
    const { start, peak, end, curve } = param;

    switch (curve) {
        case 'bell': {
            // Smooth rise to peak at midpoint, smooth fall
            if (progress <= 0.5) {
                return start + (peak - start) * smoothstep(0, 0.5, progress);
            }
            return peak + (end - peak) * smoothstep(0.5, 1.0, progress);
        }
        case 'spike': {
            // Fast rise to peak at 25%, slow fall through remaining 75%
            if (progress <= 0.25) {
                return start + (peak - start) * smoothstep(0, 0.25, progress);
            }
            return peak + (end - peak) * smoothstep(0.25, 1.0, progress);
        }
        case 'sustained': {
            // Quick ramp up, hold at peak, quick ramp down
            if (progress <= 0.15) {
                return start + (peak - start) * smoothstep(0, 0.15, progress);
            }
            if (progress >= 0.85) {
                return peak + (end - peak) * smoothstep(0.85, 1.0, progress);
            }
            return peak;
        }
        case 'fadeOut': {
            // Start at peak, smooth fade to end
            return peak + (end - peak) * smoothstep(0, 1.0, progress);
        }
        case 'linear': {
            // Linear two-segment interpolation
            if (progress <= 0.5) {
                return start + (peak - start) * (progress * 2);
            }
            return peak + (end - peak) * ((progress - 0.5) * 2);
        }
        default:
            // Unknown curve — use bell as fallback
            if (progress <= 0.5) {
                return start + (peak - start) * smoothstep(0, 0.5, progress);
            }
            return peak + (end - peak) * smoothstep(0.5, 1.0, progress);
    }
}

/**
 * Extract the primary energy value from a parsed parameterAnimation object.
 *
 * parameterAnimation can have named keys like { temperature: {...} } or
 * { turbulence: {...} } or { primary: {...} }. This function finds the
 * first parameter and evaluates it at the given progress.
 *
 * Returns null if no parameterAnimation is defined (caller should use fallback).
 *
 * @param {Object|null} parameterAnimation - Parsed parameterAnimation from AnimationConfig
 * @param {number} progress - Gesture progress 0→1
 * @returns {number|null} Energy value (typically 0→1), or null if not defined
 */
export function evaluateEnergy(parameterAnimation, progress) {
    if (!parameterAnimation) return null;

    // Get the first parameter (temperature, turbulence, charge, primary, etc.)
    const keys = Object.keys(parameterAnimation);
    if (keys.length === 0) return null;

    return evaluateParameterValue(parameterAnimation[keys[0]], progress);
}

export default AnimationConfig;
