/*!
 * Emotive Engine™ - Proprietary and Confidential
 * Copyright (c) 2025 Emotive Engine. All Rights Reserved.
 *
 * NOTICE: This code is proprietary and confidential. Unauthorized copying,
 * modification, or distribution is strictly prohibited and may result in
 * legal action. This software is licensed, not sold.
 *
 * Website: https://emotiveengine.com
 * License: https://emotive-engine.web.app/LICENSE.md
 */
/**
 * Constants Configuration - Centralized magic numbers and thresholds
 * Documents all numeric constants used throughout the application
 */

// Animation Timing Constants (in milliseconds)
export const TIMING = {
    // Gesture animations
    GESTURE_TRIGGERED_DURATION: 200,      // Visual feedback when gesture is triggered
    GESTURE_QUEUE_COOLDOWN: 500,          // Minimum time between queued gestures
    GESTURE_CHAIN_DELAY: 100,             // Delay between chained gestures

    // Rhythm sync
    BEAT_PULSE_DURATION: 150,             // Beat indicator pulse animation duration
    BEAT_PREVENTION_THRESHOLD: 50,        // Prevent double-triggering if beats < 50ms apart
    RHYTHM_FADE_TRANSITION: 300,          // Fade animation when hiding rhythm bar

    // UI transitions
    THEME_TRANSITION: 200,                 // Theme switching animation
    NOTIFICATION_DURATION: 3000,           // How long notifications stay visible
    NOTIFICATION_FADE: 500,                // Notification fade out time

    // Audio visualization
    AUDIO_VIZ_TRANSITION: 150,            // Smoothing for audio bar animations
    AUDIO_VIZ_UPDATE_INTERVAL: 16,        // ~60fps update rate

    // Dice roller
    DICE_ROLL_DURATION: 600,               // Dice animation duration
    DICE_COOLDOWN: 1000                    // Prevent rapid dice rolling
};

// BPM and Music Detection Constants
export const BPM = {
    MIN: 40,                               // Minimum detectable BPM
    MAX: 300,                              // Maximum detectable BPM
    DEFAULT: 120,                          // Default BPM when no music

    // Subdivision multipliers for rhythm sync
    SUBDIVISION_HALF: 0.5,                 // Half-time feel
    SUBDIVISION_NORMAL: 1.0,               // Normal time
    SUBDIVISION_DOUBLE: 2.0,               // Double-time feel

    // Auto-subdivision thresholds
    AUTO_DOUBLE_BELOW: 80,                // Use double-time below 80 BPM
    AUTO_HALF_ABOVE: 160                  // Use half-time above 160 BPM
};

// Audio Analysis Constants
export const AUDIO = {
    // Frequency spectrum
    NUM_BARS: 16,                         // Number of frequency bars in visualizer
    MIN_BAR_HEIGHT: 2,                    // Minimum bar height in pixels
    MAX_BAR_HEIGHT: 100,                  // Maximum bar height in pixels
    LOGARITHMIC_SCALE: 0.7,               // Log scale factor for frequency distribution

    // Volume thresholds
    VOLUME_SPIKE_THRESHOLD: 0.7,          // Trigger gesture on volume spike (0-1)
    SILENCE_THRESHOLD: 0.01,              // Below this is considered silence

    // FFT settings
    FFT_SIZE: 256,                        // Fast Fourier Transform size
    SMOOTHING_TIME_CONSTANT: 0.8          // Audio analysis smoothing
};

// Gesture System Constants
export const GESTURES = {
    MAX_QUEUE_SIZE: 4,                    // Maximum gestures in queue
    CHAIN_MAX_LENGTH: 10,                 // Maximum chain combo length
    RANDOM_CHANCE: {
        SHAPE_ON_CHAIN: 0.1,              // 10% chance to change shape on chain
        UNDERTONE_VARIATION: 0.3,         // 30% chance for undertone variation
        MICRO_PULSE_ON_WORD: 0.3          // 30% chance for pulse on TTS word
    }
};

// Display and Rendering Constants
export const DISPLAY = {
    // Canvas sizing
    DEFAULT_SIZE: 400,                    // Default canvas size in pixels
    MOBILE_SIZE: 300,                     // Canvas size on mobile devices
    TOP_OFFSET_BUFFER: 20,                // Extra space at top for UI elements

    // Particle system
    MAX_PARTICLES: 100,                   // Maximum particle count
    PARTICLE_SPAWN_RATE: 0.3,             // Particles per frame
    PARTICLE_LIFETIME: 2000,              // Particle lifetime in ms

    // Performance
    TARGET_FPS: 60,                       // Target frames per second
    LOW_PERFORMANCE_FPS: 30,              // Enable optimizations below this
    FPS_SAMPLE_SIZE: 60                   // Frames to average for FPS calculation
};

// Emotion System Constants
export const EMOTIONS = {
    // Emotion transition
    TRANSITION_DURATION: 1000,             // Emotion change animation duration
    RESPONSIVENESS_DEFAULT: 0.8,          // How quickly emotions change (0-1)

    // Undertone modifiers (-3 to +3 scale)
    UNDERTONE_LEVELS: {
        INTENSE_NEGATIVE: -3,
        MODERATE_NEGATIVE: -2,
        SLIGHT_NEGATIVE: -1,
        NEUTRAL: 0,
        SLIGHT_POSITIVE: 1,
        MODERATE_POSITIVE: 2,
        INTENSE_POSITIVE: 3
    }
};

// Mobile Optimization Constants
export const MOBILE = {
    BREAKPOINT: 768,                      // Mobile breakpoint in pixels
    TOUCH_THRESHOLD: 10,                  // Touch movement threshold
    ORIENTATION_TRANSITION: 500,          // Orientation change animation
    REDUCED_PARTICLE_COUNT: 50,           // Fewer particles on mobile
    GESTURE_DEBOUNCE: 300                 // Prevent accidental double-taps
};

// Shape Morph Constants
export const SHAPES = {
    MORPH_DURATION: 800,                  // Shape transition duration
    ROTATION_SPEED: {
        SLOW: 0.5,                        // Slow rotation multiplier
        NORMAL: 1.0,                      // Normal rotation
        FAST: 2.0                         // Fast rotation
    },
    SCALE_RANGE: {
        MIN: 0.5,                         // Minimum shape scale
        MAX: 1.5                          // Maximum shape scale
    }
};

// Network and Loading Constants
export const NETWORK = {
    MODULE_RETRY_COUNT: 3,                // Module loading retry attempts
    MODULE_RETRY_DELAY: 1000,             // Delay between retries
    ASSET_LOAD_TIMEOUT: 10000,           // Asset loading timeout
    CACHE_DURATION: 900000                // 15 minutes cache for web fetch
};

// Debug and Development Constants
export const DEBUG = {
    LOG_LEVELS: {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        NONE: 4
    },
    PERFORMANCE_WARNING_MS: 16.67,        // Warn if frame takes > 1/60 second
    MEMORY_WARNING_MB: 100                // Warn if memory usage exceeds
};

// Export as default object for convenience
export default {
    TIMING,
    BPM,
    AUDIO,
    GESTURES,
    DISPLAY,
    EMOTIONS,
    MOBILE,
    SHAPES,
    NETWORK,
    DEBUG
};

// Make available globally
if (typeof window !== 'undefined') {
    window.APP_CONSTANTS = {
        TIMING,
        BPM,
        AUDIO,
        GESTURES,
        DISPLAY,
        EMOTIONS,
        MOBILE,
        SHAPES,
        NETWORK,
        DEBUG
    };
}

// LEGAL WARNING: This code is protected by copyright law and international treaties.
// Unauthorized reproduction or distribution of this code, or any portion of it,
// may result in severe civil and criminal penalties, and will be prosecuted
// to the maximum extent possible under the law.