/**
 * Plugin exports for code splitting
 * Contains plugin system and extensions
 */

// Plugin System
export { default as PluginManager } from './plugins/PluginManager.js';
export { default as Plugin } from './plugins/Plugin.js';

// Built-in Plugins
export { default as SparklePlugin } from './plugins/SparklePlugin.js';
export { default as ConfettiEffectPlugin } from './plugins/ConfettiEffectPlugin.js';
export { default as DialoguePlugin } from './plugins/DialoguePlugin.js';

// Utils (often needed by plugins)
export * from './utils/mathUtils.js';
export * from './utils/animationUtils.js';
export * from './utils/colorUtils.js';
export * from './utils/domUtils.js';