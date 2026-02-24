/**
 * Shadow Shader Registry
 *
 * Central export point for all moon shadow effect shaders.
 * Supports multiple shadow types for different visual effects.
 *
 * Available Shadow Types:
 * - crescent: Camera-fixed crescent moon phase (directional shadow)
 * - lunar-eclipse: Total lunar eclipse with red shadow (future)
 * - solar-eclipse: Solar eclipse corona effect (future)
 * - black-hole: Gravitational lensing distortion (future)
 */

// Current implementations
import { getMoonCrescentShaders } from './moonCrescent.js';
export { getMoonCrescentShaders };

/**
 * Get shadow shaders by type
 * @param {string} shadowType - Type of shadow effect
 * @returns {Object} Object with vertexShader and fragmentShader strings
 */
export function getShadowShaders(shadowType) {
    switch (shadowType) {
    case 'crescent':
        return getMoonCrescentShaders();

    default:
        console.warn(`Unknown shadow type: ${shadowType}, defaulting to crescent`);
        return getMoonCrescentShaders();
    }
}
