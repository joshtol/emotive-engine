/**
 * Feature exports for code splitting
 * Contains optional features that can be loaded on-demand
 */

// Particle System
export { default as ParticleSystem } from './core/ParticleSystem.js';

// Audio Features
export { SoundSystem } from './core/SoundSystem.js';
export { default as AudioLevelProcessor } from './core/AudioLevelProcessor.js';
export { AudioAnalyzer } from './core/AudioAnalyzer.js';

// Behaviors
export { default as IdleBehavior } from './core/IdleBehavior.js';