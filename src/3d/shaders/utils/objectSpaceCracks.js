/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Object-Space Crack Shader Utilities
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview GLSL code for object-space procedural crack patterns
 * @author Emotive Engine Team
 * @module 3d/shaders/utils/objectSpaceCracks
 *
 * Provides shader code injection for persistent crack damage that rotates with the mesh.
 * Uses the same pattern as deformation.js - GLSL strings for injection into materials.
 *
 * ## Architecture
 *
 * Unlike screen-space CrackLayer (post-process overlay), this system:
 * 1. Renders cracks IN the material's fragment shader
 * 2. Uses MESH-LOCAL space for impact positions (cracks rotate with mesh)
 * 3. Supports up to 3 persistent impacts (same as CrackLayer)
 *
 * ## Tidal Locking
 *
 * Like deformation, crack impact points are specified in CAMERA-RELATIVE coordinates
 * by gestures, then transformed to MESH-LOCAL space by Core3DManager. This ensures
 * cracks appear on the camera-facing side when triggered, but then stay fixed in
 * object space as the mesh rotates.
 *
 * ## Data Flow
 *
 * crackFactory.js (camera-relative impact point)
 *      ↓
 * GestureBlender.js (passes trigger data)
 *      ↓
 * Core3DManager.js (transforms to mesh-local space, stores in ObjectSpaceCrackManager)
 *      ↓
 * ThreeRenderer.js (sets shader uniforms from manager)
 *      ↓
 * crystalWithSoul.js + this module (GLSL crack rendering)
 */

const MAX_IMPACTS = 3;

/**
 * GLSL uniform declarations for object-space cracks
 * Include this in fragment shaders that use cracks
 */
export const crackUniformsGLSL = `
// ═══════════════════════════════════════════════════════════════════════════
// OBJECT-SPACE CRACK UNIFORMS - Persistent damage that rotates with mesh
// ═══════════════════════════════════════════════════════════════════════════

// Impact positions in MESH-LOCAL space (pre-transformed by JS)
uniform vec3 crackImpact0;
uniform vec3 crackImpact1;
uniform vec3 crackImpact2;

// Impact directions in MESH-LOCAL space (crack spread direction)
uniform vec3 crackDirection0;
uniform vec3 crackDirection1;
uniform vec3 crackDirection2;

// Impact parameters: x=propagation, y=amount, z=seed
uniform vec3 crackParams0;
uniform vec3 crackParams1;
uniform vec3 crackParams2;

// Number of active impacts (0-3)
uniform int crackNumImpacts;

// Visual parameters
uniform vec3 crackColor;       // Dark crack interior color
uniform vec3 crackGlowColor;   // Edge emission color
uniform float crackGlowStrength;
`;

/**
 * GLSL fragment shader functions for crack rendering
 * Creates procedural crack patterns in object space
 *
 * Usage in fragment main():
 *   vec4 crackContrib = calculateObjectSpaceCracks(vPosition, vNormal);
 *   finalColor = mix(finalColor, crackContrib.rgb, crackContrib.a);
 */
export const crackFragmentGLSL = `
// ═══════════════════════════════════════════════════════════════════════════
// OBJECT-SPACE CRACK FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

// Hash functions for procedural patterns
float crackHash(vec3 p) {
    p = fract(p * vec3(443.8975, 397.2973, 491.1871));
    p += dot(p.zxy, p.yxz + 19.19);
    return fract(p.x * p.y * p.z);
}

vec2 crackHash2(vec2 p) {
    return vec2(
        fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453),
        fract(sin(dot(p, vec2(269.5, 183.3))) * 43758.5453)
    );
}

float crackNoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float n = mix(
        mix(
            mix(crackHash(i), crackHash(i + vec3(1, 0, 0)), f.x),
            mix(crackHash(i + vec3(0, 1, 0)), crackHash(i + vec3(1, 1, 0)), f.x),
            f.y
        ),
        mix(
            mix(crackHash(i + vec3(0, 0, 1)), crackHash(i + vec3(1, 0, 1)), f.x),
            mix(crackHash(i + vec3(0, 1, 1)), crackHash(i + vec3(1, 1, 1)), f.x),
            f.y
        ),
        f.z
    );
    return n;
}

// Voronoi edge detection for crack patterns
float crackVoronoiEdge(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float minDist = 1.0;
    float secondDist = 1.0;

    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 cellPoint = neighbor + crackHash2(i + neighbor) * 0.8;
            float dist = length(f - cellPoint);
            if (dist < minDist) {
                secondDist = minDist;
                minDist = dist;
            } else if (dist < secondDist) {
                secondDist = dist;
            }
        }
    }
    return secondDist - minDist;
}

// Generate crack pattern for a single impact in object space
// Returns 0.0 where crack lines are, 1.0 where no cracks
float singleObjectSpaceCrack(vec3 fragPos, vec3 impactPos, vec3 direction, float propagation, float seed) {
    vec3 toFrag = fragPos - impactPos;
    float distFromImpact = length(toFrag);

    // Max spread radius - cover entire crystal mesh
    // Crystal vertex positions: radius ~0.7, height -1.5 to +1.5
    // Use very large radius to ensure visibility
    float maxRadius = propagation * 3.0;

    // Outside propagation radius = no crack (return 1.0)
    if (distFromImpact > maxRadius) {
        return 1.0;
    }

    // Normalized distance for falloff (0 at impact, 1 at edge)
    float normalizedDist = distFromImpact / max(maxRadius, 0.001);

    // Simple radial crack pattern - spoke lines radiating from impact
    vec3 radialDir = normalize(toFrag + vec3(0.0001));
    float angle = atan(radialDir.y, radialDir.x) + atan(radialDir.z, radialDir.x) * 0.5;

    // Create spoke lines - we want lines where angle is near multiples of (2*PI/numSpokes)
    float numSpokes = 8.0;
    float spokeAngle = angle * numSpokes;
    // spokeLine is low (near 0) at crack lines, high (near 1) between them
    float spokeLine = abs(sin(spokeAngle + seed * 0.1));

    // Concentric rings for "shattered glass" look
    float ringFreq = 6.0;
    float rings = abs(sin(distFromImpact * ringFreq + seed));

    // Combine spokes and rings - crack where either is low
    float pattern = min(spokeLine, rings);

    // Fade crack intensity at edges of propagation radius
    float edgeFade = 1.0 - smoothstep(0.7, 1.0, normalizedDist);

    // Return the raw pattern value (0 = crack line, 1 = no crack)
    // Modulated by edge fade
    return mix(1.0, pattern, edgeFade);
}

// Calculate all object-space cracks
// Returns vec4: rgb = crack/glow color, a = crack alpha (blend factor)
vec4 calculateObjectSpaceCracks(vec3 fragPos, vec3 normal) {
    if (crackNumImpacts == 0) {
        return vec4(0.0);
    }

    float combinedCrack = 1.0;
    float maxAmount = 0.0;

    // Impact 0
    if (crackNumImpacts >= 1 && crackParams0.y > 0.01) {
        float crack0 = singleObjectSpaceCrack(fragPos, crackImpact0, crackDirection0, crackParams0.x, crackParams0.z);
        combinedCrack = min(combinedCrack, crack0);
        maxAmount = max(maxAmount, crackParams0.y);
    }

    // Impact 1
    if (crackNumImpacts >= 2 && crackParams1.y > 0.01) {
        float crack1 = singleObjectSpaceCrack(fragPos, crackImpact1, crackDirection1, crackParams1.x, crackParams1.z);
        combinedCrack = min(combinedCrack, crack1);
        maxAmount = max(maxAmount, crackParams1.y);
    }

    // Impact 2
    if (crackNumImpacts >= 3 && crackParams2.y > 0.01) {
        float crack2 = singleObjectSpaceCrack(fragPos, crackImpact2, crackDirection2, crackParams2.x, crackParams2.z);
        combinedCrack = min(combinedCrack, crack2);
        maxAmount = max(maxAmount, crackParams2.y);
    }

    // combinedCrack: 0.0 = crack line, 1.0 = no crack
    // Convert to crack visibility (invert and threshold)
    float crackThickness = 0.3;  // Threshold for what counts as a crack line
    float crackLine = 1.0 - smoothstep(0.0, crackThickness, combinedCrack);

    // Edge glow around cracks
    float glowWidth = 0.5;
    float edgeGlow = 1.0 - smoothstep(crackThickness, crackThickness + glowWidth, combinedCrack);
    edgeGlow = max(0.0, edgeGlow - crackLine);  // Remove overlap with crack line
    edgeGlow *= edgeGlow;  // Softer falloff

    // Apply amount (intensity control)
    crackLine *= maxAmount;
    edgeGlow *= maxAmount * crackGlowStrength;

    // Final color composition
    // Dark crack interior (nearly black)
    vec3 crackInterior = crackColor * 0.2;
    // Bright glow at edges
    vec3 glowContrib = crackGlowColor * edgeGlow * 2.0;

    vec3 color = crackInterior * crackLine + glowContrib;
    float alpha = crackLine * 0.95 + edgeGlow * 0.6;

    return vec4(color, alpha);
}
`;

/**
 * Default uniform values for object-space cracks
 * Use these when initializing shader materials
 */
export const CRACK_DEFAULT_UNIFORMS = {
    crackImpact0: [0, 0, 0],
    crackImpact1: [0, 0, 0],
    crackImpact2: [0, 0, 0],
    crackDirection0: [0, 0, 0],
    crackDirection1: [0, 0, 0],
    crackDirection2: [0, 0, 0],
    crackParams0: [0, 0, 0], // propagation, amount, seed
    crackParams1: [0, 0, 0],
    crackParams2: [0, 0, 0],
    crackNumImpacts: 0,
    crackColor: [0.15, 0.08, 0.05], // Dark brown crack interior
    crackGlowColor: [1.0, 0.6, 0.2], // Orange-amber edge emission
    crackGlowStrength: 0.5,
};

export { MAX_IMPACTS };
