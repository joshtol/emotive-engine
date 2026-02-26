/**
 * Core exports for code splitting
 * Contains essential systems needed for basic functionality
 */

// State Management
export { default as EmotiveStateMachine } from './core/state/EmotiveStateMachine.js';
export { EventManager, eventManager } from './core/events/EventManager.js';
export { StateStore, engineState } from './core/state/StateStore.js';

// Rendering
export { default as EmotiveRenderer } from './core/EmotiveRenderer.js';
export { default as CanvasManager } from './core/canvas/CanvasManager.js';
export { default as AnimationController } from './core/AnimationController.js';

// Performance Optimization
export {
    AnimationLoopManager,
    animationLoopManager,
    AnimationPriority,
} from './core/AnimationLoopManager.js';
export { GradientCache, gradientCache } from './core/renderer/GradientCache.js';
export { ContextStateManager } from './core/renderer/ContextStateManager.js';

// Monitoring
export { PerformanceMonitor, performanceMonitor } from './core/system/PerformanceMonitor.js';
export { ErrorTracker, errorTracker } from './core/events/ErrorTracker.js';
