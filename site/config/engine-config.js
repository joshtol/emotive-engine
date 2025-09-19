/**
 * Emotive Engine Configuration
 * Central configuration for all engine settings
 * @module config/engine-config
 */

export const ENGINE_CONFIG = {
    // Version information
    version: '2.0.0',
    buildDate: '2024-01-18',

    // Debug settings
    debug: {
        enabled: false,
        logLevel: 'info', // 'error', 'warn', 'info', 'debug', 'verbose'
        showFPS: false,
        showPerformance: false,
        categories: [] // Empty = show all
    },

    // Feature flags
    features: {
        rhythmSync: true,
        grooveTemplates: true,
        gestureBlending: true,
        audioReactive: true,
        emotionTransitions: true,
        undertones: true,
        particleEffects: true,
        glowEffects: true,
        recording: true,
        socialFeatures: false, // Not yet implemented
        rhythmGame: false // Coming soon
    },

    // Performance settings
    performance: {
        targetFPS: 60,
        maxParticles: 1000,
        particlePoolSize: 2000,
        renderMode: 'auto', // 'auto', 'canvas', 'webgl', 'offscreen'
        offscreenBuffer: true,
        autoQuality: true, // Automatically adjust quality based on performance
        qualityLevels: {
            low: {
                particleIntensity: 0.3,
                glowIntensity: 0.3,
                maxParticles: 100,
                renderScale: 0.5
            },
            medium: {
                particleIntensity: 0.7,
                glowIntensity: 0.7,
                maxParticles: 500,
                renderScale: 0.75
            },
            high: {
                particleIntensity: 1.0,
                glowIntensity: 1.0,
                maxParticles: 1000,
                renderScale: 1.0
            },
            ultra: {
                particleIntensity: 1.2,
                glowIntensity: 1.2,
                maxParticles: 2000,
                renderScale: 1.0
            }
        },
        currentQuality: 'high'
    },

    // Gesture settings
    gestures: {
        queueSize: 10,
        defaultDuration: 1000,
        blendTime: 200,
        interruptThreshold: 0.7, // How complete a gesture must be before interruption
        chordMaxSize: 3, // Maximum simultaneous gestures
        cooldownTime: 100 // Minimum time between same gesture
    },

    // Rhythm settings
    rhythm: {
        bpmMin: 60,
        bpmMax: 200,
        bpmDefault: 120,
        confidenceThreshold: 0.7,
        beatWindow: 100, // ms tolerance for beat matching
        tapTimeout: 2000, // ms before tap tempo resets
        audioAnalysisRate: 30, // Hz
        adaptiveTiming: true, // Adjust to user's timing
        subdivision: 4 // Beat subdivisions (4 = quarter notes)
    },

    // Emotion settings
    emotions: {
        transitionDuration: 1000, // ms
        responsiveness: 0.8, // How quickly emotions respond (0-1)
        persistence: 0.5, // How long emotions persist (0-1)
        blendingEnabled: true,
        undertoneIntensity: 0.6, // How much undertones affect base emotion
        defaultEmotion: 'neutral',
        defaultUndertone: null
    },

    // Audio settings
    audio: {
        enabled: true,
        volume: 0.5,
        soundEffects: true,
        musicReactive: true,
        microphoneEnabled: false,
        fftSize: 2048,
        smoothingTimeConstant: 0.8,
        minDecibels: -90,
        maxDecibels: -10
    },

    // Renderer settings
    renderer: {
        canvasId: 'emotive-canvas',
        backgroundColor: 'transparent',
        antialias: true,
        preserveDrawingBuffer: false,
        premultipliedAlpha: true,
        coreColor: '#FFFFFF',
        coreSizeDivisor: 12, // Core radius = min(width,height) / divisor
        glowMultiplier: 2.5, // Glow radius = core radius * multiplier
        defaultGlowColor: '#14B8A6', // Teal
        breathingSpeed: 0.42, // rad/s (≈16 breaths/min)
        breathingDepth: 0.08 // 8% size variation
    },

    // Recording settings
    recording: {
        maxDuration: 300000, // 5 minutes max recording
        compression: true,
        sampleRate: 60, // Events per second
        includeAudio: false,
        format: 'json' // 'json' or 'binary'
    },

    // UI settings
    ui: {
        theme: 'dark',
        showControls: true,
        controlsPosition: 'bottom', // 'top', 'bottom', 'left', 'right'
        controlsAutoHide: true,
        controlsHideDelay: 3000, // ms
        tooltips: true,
        animations: true,
        reducedMotion: false // Respect prefers-reduced-motion
    },

    // Network settings (for future features)
    network: {
        apiEndpoint: 'https://api.emotiveengine.com',
        websocketEndpoint: 'wss://ws.emotiveengine.com',
        reconnectAttempts: 3,
        reconnectDelay: 1000,
        timeout: 10000
    },

    // Storage settings
    storage: {
        prefix: 'emotive_',
        compress: false,
        maxSize: 5242880, // 5MB
        cleanup: true,
        cleanupAge: 604800000 // 1 week
    }
};

// Development overrides
const DEV_CONFIG = {
    debug: {
        enabled: true,
        logLevel: 'debug',
        showFPS: true,
        showPerformance: true
    },
    features: {
        rhythmGame: true // Enable in development
    }
};

// Production overrides
const PROD_CONFIG = {
    debug: {
        enabled: false,
        logLevel: 'error',
        showFPS: false,
        showPerformance: false
    },
    performance: {
        autoQuality: true
    }
};

/**
 * Get configuration based on environment
 * @returns {Object} Merged configuration
 */
export function getConfig() {
    // Check environment
    const isDev = window.location.hostname === 'localhost' ||
                  window.location.hostname === '127.0.0.1' ||
                  window.location.search.includes('dev=true');

    const isProd = !isDev;

    // Start with base config
    let config = { ...ENGINE_CONFIG };

    // Apply environment overrides
    if (isDev) {
        config = mergeDeep(config, DEV_CONFIG);
    } else if (isProd) {
        config = mergeDeep(config, PROD_CONFIG);
    }

    // Apply URL parameters
    config = applyUrlParams(config);

    // Apply localStorage overrides
    config = applyLocalStorageOverrides(config);

    return config;
}

/**
 * Deep merge objects
 * @private
 */
function mergeDeep(target, source) {
    const output = { ...target };

    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    Object.assign(output, { [key]: source[key] });
                } else {
                    output[key] = mergeDeep(target[key], source[key]);
                }
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }

    return output;
}

/**
 * Check if value is an object
 * @private
 */
function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Apply URL parameter overrides
 * @private
 */
function applyUrlParams(config) {
    const params = new URLSearchParams(window.location.search);

    // Debug mode
    if (params.has('debug')) {
        config.debug.enabled = params.get('debug') === 'true';
    }

    // FPS display
    if (params.has('fps')) {
        config.debug.showFPS = params.get('fps') === 'true';
    }

    // Quality level
    if (params.has('quality')) {
        const quality = params.get('quality');
        if (['low', 'medium', 'high', 'ultra'].includes(quality)) {
            config.performance.currentQuality = quality;
        }
    }

    // Feature flags
    if (params.has('features')) {
        const features = params.get('features').split(',');
        features.forEach(feature => {
            if (feature.startsWith('!')) {
                // Disable feature
                const name = feature.slice(1);
                if (Object.prototype.hasOwnProperty.call(config.features, name)) {
                    config.features[name] = false;
                }
            } else {
                // Enable feature
                if (Object.prototype.hasOwnProperty.call(config.features, feature)) {
                    config.features[feature] = true;
                }
            }
        });
    }

    return config;
}

/**
 * Apply localStorage overrides
 * @private
 */
function applyLocalStorageOverrides(config) {
    try {
        const stored = localStorage.getItem('emotive_config');
        if (stored) {
            const overrides = JSON.parse(stored);
            config = mergeDeep(config, overrides);
        }
    } catch (_e) {
        // Ignore localStorage errors
    }

    return config;
}

/**
 * Save configuration overrides to localStorage
 * @param {Object} overrides - Configuration overrides
 */
export function saveConfigOverrides(overrides) {
    try {
        localStorage.setItem('emotive_config', JSON.stringify(overrides));
    } catch (e) {
        console.error('Failed to save config:', e);
    }
}

/**
 * Clear configuration overrides from localStorage
 */
export function clearConfigOverrides() {
    try {
        localStorage.removeItem('emotive_config');
    } catch (e) {
        console.error('Failed to clear config:', e);
    }
}

/**
 * Validate configuration
 * @param {Object} config - Configuration to validate
 * @returns {Object} Validation result
 */
export function validateConfig(config) {
    const errors = [];
    const warnings = [];

    // Check FPS
    if (config.performance.targetFPS < 30) {
        warnings.push('Target FPS below 30 may cause poor animation');
    }
    if (config.performance.targetFPS > 120) {
        warnings.push('Target FPS above 120 may waste resources');
    }

    // Check particle limits
    if (config.performance.maxParticles > 5000) {
        warnings.push('High particle count may impact performance');
    }

    // Check audio settings
    if (config.audio.fftSize > 4096) {
        warnings.push('Large FFT size may impact audio analysis performance');
    }

    // Check recording limits
    if (config.recording.maxDuration > 600000) {
        warnings.push('Recording duration over 10 minutes may use excessive memory');
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

// Export default configuration
export default getConfig();

// Make available globally for debugging
if (typeof window !== 'undefined' && window.DEBUG) {
    window.engineConfig = getConfig();
    // eslint-disable-next-line no-console
    console.log('Engine configuration loaded:', window.engineConfig);
}