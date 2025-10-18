/**
 * Emotive Engine - Main Export
 *
 * This is the primary entry point for the Emotive Engine library.
 * It provides a clean API surface for consumers.
 *
 * @module emotive-engine
 * @version 2.5.1
 */

// ============================================================================
// CORE EXPORTS
// ============================================================================

// Main API class
import EmotiveMascotPublic from './EmotiveMascotPublic.js';
export { default as EmotiveMascot } from './EmotiveMascot.js';
export { default as EmotiveMascotPublic } from './EmotiveMascotPublic.js';

// ============================================================================
// CORE SYSTEMS
// ============================================================================

// State Management
export { default as EmotiveStateMachine } from './core/EmotiveStateMachine.js';
export { EventManager, eventManager } from './core/EventManager.js';
export { StateStore, engineState } from './core/StateStore.js';

// Rendering
export { default as EmotiveRenderer } from './core/EmotiveRenderer.js';
export { default as CanvasManager } from './core/CanvasManager.js';
export { default as AnimationController } from './core/AnimationController.js';

// Performance Optimization
export { AnimationLoopManager, animationLoopManager, AnimationPriority } from './core/AnimationLoopManager.js';
export { GradientCache, gradientCache } from './core/renderer/GradientCache.js';
export { default as ContextStateManager } from './core/renderer/ContextStateManager.js';
export { PerformanceMonitor, performanceMonitor } from './core/PerformanceMonitor.js';
export { ErrorTracker, errorTracker } from './core/ErrorTracker.js';
export { LazyLoader, lazyLoader, lazyLoad, preloadModules, prefetchModules } from './core/LazyLoader.js';
export { SecurityManager, securityManager } from './core/SecurityManager.js';
export { HealthCheck, healthCheck } from './core/HealthCheck.js';
export { FeatureFlags, featureFlags, isFeatureEnabled, getFeatureVariant } from './core/FeatureFlags.js';

// Particle System
export { default as ParticleSystem } from './core/ParticleSystem.js';

// Audio
export { SoundSystem } from './core/SoundSystem.js';
export { default as AudioLevelProcessor } from './core/AudioLevelProcessor.js';
export { AudioAnalyzer } from './core/AudioAnalyzer.js';

// ============================================================================
// FEATURES
// ============================================================================

// Emotions
export {
    getEmotion,
    getEmotionVisualParams,
    hasEmotion,
    listEmotions,
    getEmotionGestures
} from './core/emotions/index.js';

// Gestures
export {
    getGesture,
    isBlendingGesture,
    isOverrideGesture,
    applyGesture,
    listGestures,
    GESTURE_REGISTRY,
    GESTURE_TYPES
} from './core/gestures/index.js';

// Groove Templates
export { default as GrooveTemplates } from './core/GrooveTemplates.js';

// Behaviors
export { default as IdleBehavior } from './core/IdleBehavior.js';
export { default as GazeTracker } from './core/GazeTracker.js';

// ============================================================================
// UTILITIES
// ============================================================================

// Error Handling
export { default as ErrorBoundary } from './core/ErrorBoundary.js';
export { ErrorLogger, getErrorLogger, resetErrorLogger } from './core/ErrorLogger.js';

// Performance (already exported above)
export { default as DegradationManager } from './core/DegradationManager.js';

// Accessibility
export { default as AccessibilityManager } from './core/AccessibilityManager.js';

// Optimization
export { default as MobileOptimization } from './core/MobileOptimization.js';

// Browser Support
export {
    getBrowserCompatibility,
    initializeBrowserCompatibility,
    polyfillRequestAnimationFrame,
    polyfillPerformanceNow,
    polyfillWebAudio,
    browserCompatibility
} from './utils/browserCompatibility.js';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

export { UNDERTONE_MODIFIERS } from './config/undertoneModifiers.js';

// ============================================================================
// VERSION INFO
// ============================================================================

export const VERSION = '2.5.1';
export const ENGINE_NAME = 'Emotive Engine';

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURES = {
    rhythmSync: true,
    grooveTemplates: true,
    gestureBlending: true,
    audioReactive: true,
    particleSystem: true,
    accessibility: true,
    mobileOptimization: true,
    performanceMonitoring: true
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

// Default export is the public API class
export default EmotiveMascotPublic;

/**
 * Usage Examples:
 *
 * // ES6 Modules
 * import EmotiveMascot from 'emotive-engine';
 * const mascot = new EmotiveMascot();
 *
 * // Named imports
 * import { EmotiveMascot, getGesture, listEmotions } from 'emotive-engine';
 *
 * // Tree-shaking friendly
 * import { getEmotion } from 'emotive-engine';
 */
// SDK helpers
export { SiteController } from './sdk/site-controller.js';

