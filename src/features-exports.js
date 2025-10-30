/**
 * Feature exports for code splitting
 * Contains optional features that can be loaded on-demand
 */

// Particle System
export { default as ParticleSystem } from './core/ParticleSystem.js';

// Audio Features
export { SoundSystem } from './core/audio/SoundSystem.js';
export { default as AudioLevelProcessor } from './core/audio/AudioLevelProcessor.js';
export { AudioAnalyzer } from './core/audio/AudioAnalyzer.js';

// Behaviors
export { default as IdleBehavior } from './core/behavior/IdleBehavior.js';