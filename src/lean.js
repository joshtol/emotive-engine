/**
 * Emotive Engine - Lean Build
 * Ultra-optimized for homepage/marketing sites
 * Removes: Rhythm sync, undertone saturation, accessibility utils
 * Keeps: All emotions, gestures, color interpolation, particle system
 *
 * @module emotive-engine/lean
 * @version 3.2.0
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
export { default as CanvasManager } from './core/canvas/CanvasManager.js';

// Particle System
export { default as ParticleSystem } from './core/ParticleSystem.js';

// State Management
export { EventManager, eventManager } from './core/events/EventManager.js';
export { StateStore, engineState } from './core/state/StateStore.js';

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
// UTILITIES (Lean - No Undertones)
// ============================================================================

// Error Handling
export { default as ErrorBoundary } from './core/events/ErrorBoundary.js';

// Position Controller (CRITICAL for setPosition/animateToPosition)
export { default as PositionController } from './utils/PositionController.js';

// Color utilities (interpolation only, no undertone saturation)
export { interpolateHsl } from './utils/colorUtils.js';

// Easing functions
export { easeInOutQuad, easeOutCubic, easeInOutSine, applyEasing } from './utils/easing.js';

// ============================================================================
// VERSION INFO
// ============================================================================

export const VERSION = '3.2.0-lean';
export const ENGINE_NAME = 'Emotive Engine Lean';
export const BUILD_TYPE = 'lean';

// ============================================================================
// FEATURES (Lean Build)
// ============================================================================

export const FEATURES = {
    rhythmSync: false,              // Removed for size
    grooveTemplates: false,         // Removed for size
    undertones: false,              // Removed for size
    undertoneSaturation: false,     // Removed for size
    gestureBlending: true,          // Core feature
    audioReactive: false,           // No audio
    particleSystem: true,           // Core feature
    accessibility: false,           // Removed for size
    mobileOptimization: true,       // Keep for responsive
    performanceMonitoring: false    // Removed for size
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
 * import EmotiveMascot from '@joshtol/emotive-engine/dist/emotive-mascot.lean.js';
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
