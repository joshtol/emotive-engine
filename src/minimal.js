/**
 * Emotive Engine - Minimal Build
 * Core functionality only - animations, emotions, gestures
 * No audio features - optimized for smallest bundle size
 *
 * @module emotive-engine/minimal
 * @version 2.5.1
 */

// ============================================================================
// CORE ENGINE
// ============================================================================

// Main API class
export { default as EmotiveMascot } from './EmotiveMascot.js';
export { default as EmotiveMascotPublic } from './EmotiveMascotPublic.js';

// ============================================================================
// ESSENTIAL SYSTEMS
// ============================================================================

// Rendering
export { default as EmotiveRenderer } from './core/EmotiveRenderer.js';
export { default as CanvasManager } from './core/CanvasManager.js';

// Particle System
export { default as ParticleSystem } from './core/ParticleSystem.js';

// State Management
export { EventManager, eventManager } from './core/EventManager.js';
export { StateStore, engineState } from './core/StateStore.js';

// ============================================================================
// EMOTIONS & GESTURES
// ============================================================================

export {
    getEmotion,
    getEmotionVisualParams,
    hasEmotion,
    listEmotions
} from './core/emotions/index.js';

export {
    getGesture,
    applyGesture,
    listGestures,
    GESTURE_TYPES
} from './core/gestures/index.js';

// ============================================================================
// UTILITIES
// ============================================================================

// Error Handling
export { default as ErrorBoundary } from './core/ErrorBoundary.js';

// Color utilities
export { interpolateHsl, applyUndertoneSaturation } from './utils/colorUtils.js';

// Easing functions
export { easeInOutQuad, easeOutCubic, easeInOutSine, applyEasing } from './utils/easing.js';

// ============================================================================
// CONSTANTS
// ============================================================================

export { UNDERTONE_MODIFIERS } from './config/undertoneModifiers.js';

// ============================================================================
// VERSION INFO
// ============================================================================

export const VERSION = '2.5.1-minimal';
export const ENGINE_NAME = 'Emotive Engine Minimal';
export const BUILD_TYPE = 'minimal';

// ============================================================================
// FEATURES (Minimal Build)
// ============================================================================

export const FEATURES = {
    rhythmSync: false,          // Audio features disabled
    grooveTemplates: false,     // Audio features disabled
    gestureBlending: true,      // Core feature
    audioReactive: false,       // Audio features disabled
    particleSystem: true,       // Core feature
    accessibility: false,       // Disabled for size
    mobileOptimization: false,  // Disabled for size
    performanceMonitoring: false // Disabled for size
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

// Default export is the public API class
import EmotiveMascotPublicDefault from './EmotiveMascotPublic.js';
export default EmotiveMascotPublicDefault;

/**
 * Usage Example:
 *
 * import EmotiveMascot from '@joshtol/emotive-engine/dist/emotive-mascot.minimal.js';
 *
 * const mascot = new EmotiveMascot({
 *     canvasId: 'mascot-canvas',
 *     emotion: 'joy'
 * });
 *
 * mascot.start();
 * mascot.setEmotion('surprise');
 * mascot.express('bounce');
 */
