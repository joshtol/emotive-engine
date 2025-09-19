/**
 * Feature exports for code splitting
 * Contains optional features that can be loaded on-demand
 */

// Particle System
export { default as ParticleSystem } from './core/ParticleSystem.js';

// Audio Features
export { SoundSystem } from './core/SoundSystem.js';
export { default as AudioLevelProcessor } from './core/AudioLevelProcessor.js';
export { default as AudioAnalyzer } from './core/AudioAnalyzer.js';

// Emotions
export { default as EmotionModel } from './emotions/EmotionModel.js';
export { default as EmotionPresets } from './emotions/EmotionPresets.js';

// Features
export { default as Breathe } from './features/Breathe.js';
export { default as Blink } from './features/Blink.js';
export { default as WaveSpeech } from './features/WaveSpeech.js';
export { default as WaveIdle } from './features/WaveIdle.js';
export { default as Sparkle } from './features/Sparkle.js';
export { default as ColorPalette } from './features/ColorPalette.js';

// Behaviors
export { default as Behavior } from './behaviors/Behavior.js';
export { default as IdleBehavior } from './behaviors/IdleBehavior.js';
export { default as ListeningBehavior } from './behaviors/ListeningBehavior.js';
export { default as ThinkingBehavior } from './behaviors/ThinkingBehavior.js';
export { default as SpeakingBehavior } from './behaviors/SpeakingBehavior.js';