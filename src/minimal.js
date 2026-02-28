/**
 * Emotive Engine — Minimal Build
 * Ultra-light loading screen bundle. No audio, plugins, or manager overhead.
 * Supports: emotions, 2D gestures, shape morphing, particles.
 *
 * @module emotive-engine/minimal
 * @version 3.3.8
 */

// ============================================================================
// CORE ENGINE
// ============================================================================

// Main class — standalone lightweight mascot (no InitializationManager chain)
export { MinimalMascot } from './MinimalMascot.js';

// ============================================================================
// EMOTIONS & GESTURES
// ============================================================================

export {
    getEmotion,
    getEmotionVisualParams,
    hasEmotion,
    listEmotions,
} from './core/emotions/index.js';

export {
    getGesture,
    applyGesture,
    listGestures,
    GESTURE_TYPES,
} from './core/gestures/index-minimal.js';

// ============================================================================
// CORE SYSTEMS (for advanced users)
// ============================================================================

export { default as EmotiveRenderer } from './core/EmotiveRenderer.js';
export { default as ParticleSystem } from './core/ParticleSystem.js';
export { EventManager } from './core/events/EventManager.js';

// ============================================================================
// VERSION INFO
// ============================================================================

export const VERSION = '3.3.8-minimal';
export const ENGINE_NAME = 'Emotive Engine Minimal';
export const BUILD_TYPE = 'minimal';

// ============================================================================
// FEATURES (Minimal Build)
// ============================================================================

export const FEATURES = {
    rhythmSync: false,
    grooveTemplates: false,
    gestureBlending: true,
    audioReactive: false,
    particleSystem: true,
    accessibility: false,
    mobileOptimization: false,
    performanceMonitoring: false,
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

import { MinimalMascot as DefaultExport } from './MinimalMascot.js';
export default DefaultExport;

/**
 * Usage Example:
 *
 * import MinimalMascot from '@joshtol/emotive-engine/minimal';
 *
 * const mascot = new MinimalMascot({ defaultEmotion: 'joy' });
 * await mascot.init('mascot-canvas');
 * mascot.start();
 * mascot.setEmotion('surprise');
 * mascot.express('bounce');
 *
 * // Hand off state to full/3D mascot:
 * const state = mascot.getState();
 * mascot.destroy();
 */
