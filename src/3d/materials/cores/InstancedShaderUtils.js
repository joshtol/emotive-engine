/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Instanced Shader Utilities
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview GLSL snippets for GPU-instanced elemental rendering
 * @module materials/InstancedShaderUtils
 *
 * Provides shader code for:
 * - Per-instance time-offset animation (local time = global time - spawn time)
 * - Model selection via vertex attribute (discard non-matching vertices)
 * - Trail instance handling (delayed animation based on trail index)
 * - Instance fade in/out based on spawn/exit times
 * - Velocity passthrough for motion blur
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// INSTANCED ATTRIBUTE DECLARATIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Vertex shader attribute declarations for instancing
 */
export const INSTANCED_ATTRIBUTES_VERTEX = /* glsl */ `
// Per-instance attributes from ElementInstancePool
attribute float aSpawnTime;       // When this instance spawned (global time)
attribute float aExitTime;        // When fade-out started (0 = not exiting)
attribute float aModelIndex;      // Vertex attribute: which model this vertex belongs to
attribute float aSelectedModel;   // Instance attribute: which model to render
attribute float aInstanceOpacity; // Per-instance opacity multiplier
attribute float aTrailParent;     // Trail parent slot (-1 for main instance)
attribute float aTrailIndex;      // Which trail copy (0-2, or -1 for main)
attribute vec4 aVelocity;         // xyz = direction, w = speed
attribute float aRandomSeed;      // Per-instance random for variation (also used as arc phase for vortex)

// Passed to fragment shader
varying float vLocalTime;         // Time since this instance spawned
varying float vInstanceAlpha;     // Combined opacity from spawn/exit fades
varying float vTrailFade;         // Trail opacity fade (1.0 for main, 0.75/0.5/0.25 for trails)
varying vec4 vVelocity;           // For motion blur in fragment/post-process
`;

/**
 * Fragment shader varying declarations for instancing
 */
export const INSTANCED_ATTRIBUTES_FRAGMENT = /* glsl */ `
varying float vLocalTime;
varying float vInstanceAlpha;
varying float vTrailFade;
varying vec4 vVelocity;
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// TIME-OFFSET ANIMATION
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Vertex shader code to calculate local time and instance fade
 * Place this early in the vertex shader main() function
 *
 * Uniforms required:
 * - uGlobalTime: Current global animation time
 * - uFadeInDuration: How long fade-in takes (seconds)
 * - uFadeOutDuration: How long fade-out takes (seconds)
 */
export const INSTANCED_TIME_CALC_VERTEX = /* glsl */ `
// Calculate local time for this instance (time since spawn)
vLocalTime = uGlobalTime - aSpawnTime;

// Trail instances have delayed local time (they lag behind main)
float trailDelay = max(0.0, aTrailIndex) * 0.05;  // 50ms delay per trail copy
float effectiveLocalTime = max(0.0, vLocalTime - trailDelay);

// Calculate fade-in alpha (0 -> 1 over uFadeInDuration)
float fadeIn = clamp(effectiveLocalTime / uFadeInDuration, 0.0, 1.0);

// Calculate fade-out alpha (if exiting)
float fadeOut = 1.0;
if (aExitTime > 0.0) {
    float exitElapsed = uGlobalTime - aExitTime;
    fadeOut = 1.0 - clamp(exitElapsed / uFadeOutDuration, 0.0, 1.0);
}

// Trail copies have reduced opacity
vTrailFade = aTrailIndex < 0.0 ? 1.0 : (1.0 - (aTrailIndex + 1.0) * 0.25);

// Combined instance alpha
vInstanceAlpha = fadeIn * fadeOut * aInstanceOpacity * vTrailFade;

// Pass velocity to fragment shader
vVelocity = aVelocity;
`;

/**
 * Uniforms required for time-offset animation
 */
export const INSTANCED_TIME_UNIFORMS = {
    uGlobalTime: { value: 0 },
    uFadeInDuration: { value: 0.3 },
    uFadeOutDuration: { value: 0.5 },
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// MODEL SELECTION
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Vertex shader code for model selection
 * Place this early in vertex shader, before any position calculations
 *
 * This scales vertices of non-selected models to zero, effectively hiding them.
 * More GPU-efficient than discard in fragment shader for merged geometry.
 */
export const MODEL_SELECTION_VERTEX = /* glsl */ `
// Hide vertices from non-selected models by scaling to zero
float modelMatch = step(abs(aModelIndex - aSelectedModel), 0.5);
vec3 selectedPosition = position * modelMatch;
vec3 selectedNormal = normal * modelMatch;
`;

/**
 * Alternative: Fragment shader discard for model selection
 * Use this if you need accurate geometry for non-visual purposes
 */
export const MODEL_SELECTION_FRAGMENT = /* glsl */ `
// Discard fragments from non-selected models
// Note: This is less efficient than vertex-level culling
// if (abs(aModelIndex - aSelectedModel) > 0.5) discard;
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// TRAIL HANDLING
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Vertex shader code for trail position offset
 * Trails are positioned slightly behind the main instance based on velocity
 */
export const TRAIL_OFFSET_VERTEX = /* glsl */ `
// Offset trail positions backward along velocity
vec3 trailOffset = vec3(0.0);
if (aTrailIndex >= 0.0 && length(aVelocity.xyz) > 0.001) {
    // Each trail copy is further back
    float trailDistance = (aTrailIndex + 1.0) * 0.05;
    trailOffset = -normalize(aVelocity.xyz) * trailDistance * aVelocity.w;
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// INSTANCE ALPHA APPLICATION
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Fragment shader code to apply instance alpha
 * Place this near the end of fragment shader, before final gl_FragColor assignment
 */
export const INSTANCED_ALPHA_FRAGMENT = /* glsl */ `
// Apply per-instance alpha (spawn/exit fade + trail fade)
float finalAlpha = alpha * vInstanceAlpha;

// Discard fully transparent fragments
if (finalAlpha < 0.01) discard;
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Creates the additional uniforms needed for instanced rendering.
 * Merge these with the material's existing uniforms.
 * @returns {Object} Uniforms object
 */
export function createInstancedUniforms() {
    return {
        uGlobalTime: { value: 0 },
        uFadeInDuration: { value: 0.3 },
        uFadeOutDuration: { value: 0.5 },
    };
}

export default {
    INSTANCED_ATTRIBUTES_VERTEX,
    INSTANCED_ATTRIBUTES_FRAGMENT,
    INSTANCED_TIME_CALC_VERTEX,
    INSTANCED_TIME_UNIFORMS,
    MODEL_SELECTION_VERTEX,
    MODEL_SELECTION_FRAGMENT,
    TRAIL_OFFSET_VERTEX,
    INSTANCED_ALPHA_FRAGMENT,
    createInstancedUniforms,
};
