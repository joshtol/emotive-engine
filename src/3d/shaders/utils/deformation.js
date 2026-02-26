/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Mesh Deformation Shader Utilities
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview GLSL code for localized mesh deformation (punch impacts, etc.)
 * @author Emotive Engine Team
 * @module 3d/shaders/utils/deformation
 *
 * Provides shader code injection for vertex deformation and fragment impact glow.
 * Uses the same pattern as blendModes.js and subsurfaceScattering.js.
 *
 * ## Architecture
 *
 * The deformation system creates localized "dents" on the mesh surface, used for
 * impact effects like punches (oof gestures). It consists of:
 *
 * 1. **Vertex Deformation**: Pushes vertices inward toward mesh center at impact site
 * 2. **Impact Glow**: Adds a bright spot at the impact location in the fragment shader
 *
 * ## Tidal Locking
 *
 * The impactPoint is specified in CAMERA-RELATIVE coordinates by gestures:
 * - X = camera's right (positive = right side of screen)
 * - Y = up (positive = top of screen)
 * - Z = toward camera (positive = closer to viewer)
 *
 * Core3DManager transforms this to MESH-LOCAL space using:
 * 1. Camera basis vectors (same as cameraRelativePosition)
 * 2. Inverse mesh world quaternion
 *
 * This ensures the dent always appears on the camera-facing side regardless of
 * mesh rotation - the deformation is "tidally locked" to the camera view.
 *
 * ## Data Flow
 *
 * oofFactory.js (camera-relative impactPoint)
 *      ↓
 * GestureBlender.js (passes through without fadeEnvelope)
 *      ↓
 * Core3DManager.js (transforms to mesh-local space)
 *      ↓
 * ThreeRenderer.js (sets shader uniforms)
 *      ↓
 * crystalWithSoul.js (GLSL deformation + glow)
 */

/**
 * GLSL uniform declarations for deformation
 * Include this in both vertex and fragment shaders that use deformation
 */
export const deformationUniformsGLSL = `
// ═══════════════════════════════════════════════════════════════════════════
// DEFORMATION UNIFORMS - Localized vertex displacement for impacts
// ═══════════════════════════════════════════════════════════════════════════
uniform float deformationStrength;  // 0-2+ (intensity of dent)
uniform vec3 impactPoint;           // Impact position in MESH-LOCAL space
                                    // Transformed by JS to account for camera direction
uniform float deformationFalloff;   // Radius of influence (0.1-0.5 typical)
`;

/**
 * GLSL vertex shader function for mesh deformation
 * Creates a localized concave dent at the impact point
 *
 * Include deformationUniformsGLSL before this in your vertex shader.
 *
 * The impactPoint is in MESH-LOCAL space, pre-transformed by JavaScript
 * to account for camera direction. This ensures the dent appears on the
 * correct side regardless of mesh rotation (tidal locking done in JS).
 *
 * Usage in vertex main():
 *   vec3 deformedPosition = position + calculateDeformation(position);
 */
export const deformationVertexGLSL = `
// ═══════════════════════════════════════════════════════════════════════════
// DEFORMATION - Localized dent toward mesh center
// ═══════════════════════════════════════════════════════════════════════════

vec3 calculateDeformation(vec3 pos) {
    if (deformationStrength < 0.001) {
        return vec3(0.0);
    }

    // Distance from this vertex to the impact point (both in mesh-local space)
    float dist = length(pos - impactPoint);

    // Falloff: 1.0 at impact point, 0.0 at falloff radius
    // Use squared falloff for sharper edges
    float t = dist / max(deformationFalloff, 0.001);
    float falloff = max(0.0, 1.0 - t * t);

    // Direction: push vertex INWARD toward mesh center
    vec3 inward = -normalize(pos + vec3(0.0001));

    // Depth of dent
    float depth = deformationStrength * 0.15 * falloff;

    return inward * depth;
}
`;

/**
 * GLSL fragment shader function for impact glow effect
 * Creates a localized bright spot at the punch impact site
 *
 * Include deformationUniformsGLSL before this in your fragment shader.
 *
 * Usage in fragment main():
 *   finalColor += calculateImpactGlow(vPosition, emotionColor);
 *
 * @param fragPos - Fragment position in MESH-LOCAL space
 * @param emotionColor - The current emotion/glow color
 */
export const deformationFragmentGLSL = `
// ═══════════════════════════════════════════════════════════════════════════
// IMPACT GLOW - Localized bright spot at punch impact site
// ═══════════════════════════════════════════════════════════════════════════

vec3 calculateImpactGlow(vec3 fragPos, vec3 emotionColor) {
    if (deformationStrength < 0.001) {
        return vec3(0.0);
    }

    // Distance from this fragment to the impact point (both in mesh-local space)
    float impactDist = length(fragPos - impactPoint);
    float impactT = impactDist / max(deformationFalloff, 0.001);
    float impactFalloff = max(0.0, 1.0 - impactT * impactT);

    // Bright glow at impact site
    vec3 impactColor = mix(emotionColor, vec3(1.0), impactFalloff * 0.7);

    return impactColor * impactFalloff * 1.5;
}
`;

/**
 * Default uniform values for deformation
 * Use these when initializing shader materials
 */
export const DEFORMATION_DEFAULT_UNIFORMS = {
    deformationStrength: 0.0,
    impactPoint: [0, 0, 0],
    deformationFalloff: 0.5, // Increased for wider effect area
};
