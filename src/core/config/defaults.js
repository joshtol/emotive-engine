/**
 * Default configuration constants for Emotive Engine
 *
 * These constants control timing, thresholds, and animation parameters
 * across the engine. Import and use these instead of hardcoded magic numbers.
 *
 * @module core/config/defaults
 */

/**
 * Frame timing constants for animation consistency
 */
export const FRAME_TIMING = {
    /** Target frame time for 60 FPS (ms) */
    TARGET_FRAME_TIME: 16.67,

    /** Maximum allowed delta time to prevent physics explosions (ms) */
    DELTA_TIME_CAP: 20,

    /** Frame budget for performance monitoring (ms) */
    FRAME_BUDGET: 16.67
};

/**
 * Visibility/tab change thresholds
 */
export const VISIBILITY = {
    /** Gap threshold for clearing all particles (ms) */
    LONG_PAUSE_THRESHOLD: 30000,

    /** Gap threshold for reducing particle count (ms) */
    MEDIUM_PAUSE_THRESHOLD: 10000,

    /** Particle reduction factor for medium gaps */
    PARTICLE_REDUCTION_FACTOR: 0.5,

    /** Minimum particles to keep after reduction */
    MIN_PARTICLES_AFTER_REDUCTION: 10
};

/**
 * Audio analyzer configuration
 */
export const AUDIO = {
    /** FFT size for audio analysis (must be power of 2) */
    FFT_SIZE: 256,

    /** Smoothing time constant for analyzer (0-1) */
    SMOOTHING_TIME_CONSTANT: 0.8,

    /** BPM lock timeout before retry (ms) */
    BPM_LOCK_TIMEOUT: 10000
};

/**
 * Health check and monitoring intervals
 */
export const MONITORING = {
    /** Health check interval (ms) */
    HEALTH_CHECK_INTERVAL: 30000,

    /** Feature flags refresh interval (ms) */
    FEATURE_FLAGS_REFRESH: 300000,

    /** Context decay interval (ms) */
    CONTEXT_DECAY_INTERVAL: 10000,

    /** Frustration decay interval (ms) */
    FRUSTRATION_DECAY_INTERVAL: 10000
};

/**
 * Combined defaults object for constructor overrides
 *
 * Usage:
 * ```javascript
 * import { DEFAULT_CONFIG } from '@joshtol/emotive-engine/core/config/defaults';
 *
 * const mascot = new EmotiveMascot3D({
 *   timing: {
 *     deltaTimeCap: 25  // Override default
 *   }
 * });
 * ```
 */
export const DEFAULT_CONFIG = {
    timing: {
        targetFrameTime: FRAME_TIMING.TARGET_FRAME_TIME,
        deltaTimeCap: FRAME_TIMING.DELTA_TIME_CAP,
        frameBudget: FRAME_TIMING.FRAME_BUDGET
    },
    visibility: {
        longPauseThreshold: VISIBILITY.LONG_PAUSE_THRESHOLD,
        mediumPauseThreshold: VISIBILITY.MEDIUM_PAUSE_THRESHOLD,
        particleReductionFactor: VISIBILITY.PARTICLE_REDUCTION_FACTOR,
        minParticlesAfterReduction: VISIBILITY.MIN_PARTICLES_AFTER_REDUCTION
    },
    audio: {
        fftSize: AUDIO.FFT_SIZE,
        smoothingTimeConstant: AUDIO.SMOOTHING_TIME_CONSTANT,
        bpmLockTimeout: AUDIO.BPM_LOCK_TIMEOUT
    },
    monitoring: {
        healthCheckInterval: MONITORING.HEALTH_CHECK_INTERVAL,
        featureFlagsRefresh: MONITORING.FEATURE_FLAGS_REFRESH,
        contextDecayInterval: MONITORING.CONTEXT_DECAY_INTERVAL,
        frustrationDecayInterval: MONITORING.FRUSTRATION_DECAY_INTERVAL
    }
};

export default DEFAULT_CONFIG;
