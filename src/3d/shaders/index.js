/**
 * Shader Loader
 *
 * Central export point for all shader effects.
 * Shadow shaders are now organized in ./shadows/ subdirectory.
 */

// Re-export shadow shaders
export { getMoonCrescentShaders, getShadowShaders } from './shadows/index.js';

// Future: Other shader types (particles, effects, etc.) can be added here
