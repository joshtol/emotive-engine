/**
 * Emotive Engine Main Export
 * @module EmotiveEngine
 * @version 2.0.0
 *
 * This is the main entry point for the Emotive Engine.
 * Only public API exports are exposed here.
 */

// ============================================
// Public API Exports
// ============================================

// Main engine class (public wrapper)
import EmotiveMascot from './EmotiveMascotPublic.js';
export { default as EmotiveMascot } from './EmotiveMascotPublic.js';

// Version information
export const VERSION = '2.0.0';
export const BUILD_DATE = '2024-01-18';

// Engine capabilities
export const CAPABILITIES = {
    gestures: true,
    emotions: true,
    undertones: true,
    rhythmSync: true,
    audioAnalysis: true,
    recording: true,
    grooves: true,
    particleEffects: true
};

// ============================================
// Configuration Defaults (for reference)
// ============================================

export const DEFAULT_CONFIG = {
    canvasId: 'emotive-canvas',
    startingEmotion: 'neutral',
    emotionalResponsiveness: 0.8,
    particleIntensity: 1.0,
    glowIntensity: 0.8,
    audioEnabled: true,
    debugMode: false,
    renderMode: 'default',
    maxParticles: 100
};

// ============================================
// Available Gestures (for reference)
// ============================================

export const GESTURES = {
    movement: [
        'bounce', 'spin', 'orbit', 'sway', 'jump',
        'twist', 'float', 'wiggle', 'lean'
    ],
    expression: [
        'wave', 'nod', 'shake', 'point', 'tilt',
        'reach', 'shrug'
    ],
    effects: [
        'pulse', 'glow', 'sparkle', 'shimmer',
        'flash', 'flicker', 'vibrate'
    ],
    ambient: [
        'breathe', 'idle', 'drift'
    ],
    groove: [
        'grooveSway', 'grooveBob', 'grooveFlow',
        'groovePulse', 'grooveStep'
    ]
};

// ============================================
// Available Emotions (for reference)
// ============================================

export const EMOTIONS = {
    base: [
        'happy', 'sad', 'excited', 'calm', 'neutral',
        'curious', 'confused', 'angry', 'sleepy', 'love'
    ],
    undertones: [
        'energetic', 'mellow', 'playful', 'focused',
        'dreamy', 'intense', 'gentle', 'wild'
    ]
};

// ============================================
// Error Codes
// ============================================

export const ERROR_CODES = {
    NOT_INITIALIZED: 'ENGINE_NOT_INITIALIZED',
    INVALID_CANVAS: 'INVALID_CANVAS',
    INVALID_GESTURE: 'INVALID_GESTURE',
    INVALID_EMOTION: 'INVALID_EMOTION',
    AUDIO_LOAD_FAILED: 'AUDIO_LOAD_FAILED',
    RHYTHM_SYNC_FAILED: 'RHYTHM_SYNC_FAILED',
    RECORDING_IN_PROGRESS: 'RECORDING_IN_PROGRESS',
    PLAYBACK_IN_PROGRESS: 'PLAYBACK_IN_PROGRESS'
};

// ============================================
// Utility Functions
// ============================================

/**
 * Check if the browser supports all required features
 * @returns {Object} Support status for each feature
 */
export function checkBrowserSupport() {
    return {
        canvas: !!window.HTMLCanvasElement,
        requestAnimationFrame: !!window.requestAnimationFrame,
        webAudio: !!window.AudioContext || !!window.webkitAudioContext,
        es6Modules: true, // If this code runs, modules are supported
        localStorage: !!window.localStorage,
        performance: !!window.performance
    };
}

/**
 * Get optimal canvas size based on device
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @returns {Object} Recommended dimensions
 */
export function getOptimalCanvasSize(maxWidth = 1920, maxHeight = 1080) {
    const pixelRatio = window.devicePixelRatio || 1;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    let width = Math.min(screenWidth, maxWidth);
    let height = Math.min(screenHeight, maxHeight);

    // Adjust for high DPI displays
    if (pixelRatio > 1) {
        width = Math.floor(width / pixelRatio);
        height = Math.floor(height / pixelRatio);
    }

    return {
        width,
        height,
        pixelRatio,
        cssWidth: width,
        cssHeight: height,
        canvasWidth: width * pixelRatio,
        canvasHeight: height * pixelRatio
    };
}

/**
 * Create a properly configured canvas element
 * @param {Object} options - Canvas options
 * @returns {HTMLCanvasElement} Configured canvas
 */
export function createCanvas(options = {}) {
    const canvas = document.createElement('canvas');
    const size = getOptimalCanvasSize(options.maxWidth, options.maxHeight);

    // Set canvas dimensions
    canvas.width = size.canvasWidth;
    canvas.height = size.canvasHeight;

    // Set CSS dimensions
    canvas.style.width = size.cssWidth + 'px';
    canvas.style.height = size.cssHeight + 'px';

    // Set ID if provided
    if (options.id) {
        canvas.id = options.id;
    }

    // Add accessibility attributes
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Emotive mascot animation');

    return canvas;
}

// ============================================
// Main Export
// ============================================

const EmotiveEngine = {
    // Constructor
    EmotiveMascot,

    // Metadata
    VERSION,
    BUILD_DATE,
    CAPABILITIES,

    // References
    DEFAULT_CONFIG,
    GESTURES,
    EMOTIONS,
    ERROR_CODES,

    // Utilities
    checkBrowserSupport,
    getOptimalCanvasSize,
    createCanvas
};

// Default export for convenience
export default EmotiveEngine;

// ============================================
// Auto-initialization for script tag usage
// ============================================

if (typeof window !== 'undefined') {
    // Make available globally for non-module usage
    window.EmotiveEngine = EmotiveEngine;

    // Log version in debug mode
    if (window.DEBUG) {
        console.warn(`Emotive Engine v${VERSION} loaded`);
        console.warn('Browser support:', checkBrowserSupport());
    }
}