/**
 * Emotive Engine - Audio Build
 * Audio-focused features with full visualization
 * Optimized for music-reactive applications
 *
 * @module emotive-engine/audio
 * @version 3.3.8
 */

// ============================================================================
// CORE ENGINE
// ============================================================================

// Main API class
export { default as EmotiveMascot } from './EmotiveMascot.js';
export { default as EmotiveMascotPublic } from './EmotiveMascotPublic.js';

// ============================================================================
// CORE SYSTEMS
// ============================================================================

// Rendering
export { default as EmotiveRenderer } from './core/EmotiveRenderer.js';
export { default as CanvasManager } from './core/canvas/CanvasManager.js';
export { default as AnimationController } from './core/AnimationController.js';

// Particle System
export { default as ParticleSystem } from './core/ParticleSystem.js';

// State Management
export { default as EmotiveStateMachine } from './core/state/EmotiveStateMachine.js';
export { EventManager, eventManager } from './core/events/EventManager.js';
export { StateStore, engineState } from './core/state/StateStore.js';

// Performance
export { AnimationLoopManager, animationLoopManager, AnimationPriority } from './core/AnimationLoopManager.js';

// ============================================================================
// AUDIO SYSTEMS (Primary Focus)
// ============================================================================

export { SoundSystem } from './core/audio/SoundSystem.js';
export { default as AudioLevelProcessor } from './core/audio/AudioLevelProcessor.js';
export { AudioAnalyzer } from './core/audio/AudioAnalyzer.js';
export { default as GrooveTemplates } from './core/audio/GrooveTemplates.js';
export { RhythmInputEvaluator } from './core/audio/RhythmInputEvaluator.js';
export { AudioLayerManager } from './core/audio/AudioLayerManager.js';

// State
export { EmotionDynamics } from './core/state/EmotionDynamics.js';

// Timeline
export { Timeline } from './core/timeline/Timeline.js';
export { TimelineSection } from './core/timeline/TimelineSection.js';

// ============================================================================
// EMOTIONS & GESTURES
// ============================================================================

export {
    getEmotion,
    getEmotionVisualParams,
    hasEmotion,
    listEmotions,
    getEmotionGestures,
    getEmotionRhythmModifiers,
    getBlendedRhythmModifiers
} from './core/emotions/index.js';

export {
    getGesture,
    isBlendingGesture,
    isOverrideGesture,
    applyGesture,
    listGestures,
    GESTURE_REGISTRY,
    GESTURE_TYPES
} from './core/gestures/index.js';

// ============================================================================
// BEHAVIORS
// ============================================================================

export { default as IdleBehavior } from './core/behavior/IdleBehavior.js';
export { default as GazeTracker } from './core/behavior/GazeTracker.js';

// ============================================================================
// UTILITIES
// ============================================================================

// Error Handling
export { default as ErrorBoundary } from './core/events/ErrorBoundary.js';
export { ErrorLogger, getErrorLogger, resetErrorLogger } from './core/events/ErrorLogger.js';

// Performance
export { default as DegradationManager } from './core/system/DegradationManager.js';

// Color utilities
export { interpolateHsl, applyUndertoneSaturation } from './utils/colorUtils.js';

// Easing functions
export * from './utils/easing.js';

// ============================================================================
// CONSTANTS
// ============================================================================

export { UNDERTONE_MODIFIERS } from './config/undertoneModifiers.js';

// ============================================================================
// VERSION INFO
// ============================================================================

export const VERSION = '3.3.8-audio';
export const ENGINE_NAME = 'Emotive Engine Audio';
export const BUILD_TYPE = 'audio';

// ============================================================================
// FEATURES (Audio Build)
// ============================================================================

export const FEATURES = {
    rhythmSync: true,           // Enabled
    grooveTemplates: true,      // Enabled
    gestureBlending: true,      // Enabled
    audioReactive: true,        // Enabled
    particleSystem: true,       // Enabled
    accessibility: false,       // Disabled for size
    mobileOptimization: false,  // Disabled for size
    performanceMonitoring: true // Enabled for audio perf
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
 * import EmotiveMascot from '@joshtol/emotive-engine/dist/emotive-mascot.audio.js';
 *
 * const mascot = new EmotiveMascot({
 *     canvasId: 'mascot-canvas',
 *     emotion: 'joy'
 * });
 *
 * // Connect audio for reactive visualization
 * const audio = document.getElementById('music');
 * mascot.connectAudio(audio);
 *
 * mascot.start();
 */
