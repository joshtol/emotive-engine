/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Sun Shader with Blend Layers
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Sun shader extended with universal blend mode layer system and solar eclipse
 * @author Emotive Engine Team
 * @module 3d/shaders/sunWithBlendLayers
 *
 * Extends the standard sun shader with support for:
 * - Solar eclipse effects (moon's shadow covering sun)
 * - Multiple sequential blend mode layers for eclipse appearance adjustment
 * - Umbra/penumbra shadow calculations
 * - Emissive darkening where shadow covers sun
 *
 * Uses universal blend mode utilities from src/3d/shaders/utils/blendModes.js
 */

import { blendModesGLSL } from './utils/blendModes.js';

export const sunWithBlendLayersVertexShader = `
/**
 * Sun Vertex Shader
 * Passes view-space position for camera-relative eclipse shadow calculations
 */

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vViewPosition;  // View-space position (camera-relative)

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;

    // Calculate view-space position (camera-relative, always faces camera)
    vec4 viewPos = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = viewPos.xyz;

    gl_Position = projectionMatrix * viewPos;
}
`;

export const sunWithBlendLayersFragmentShader = `
/**
 * Sun Fragment Shader with Blend Layers and Solar Eclipse
 *
 * Supports solar eclipse effects with moon's shadow darkening the sun
 * and up to 4 sequential blend mode layers for eclipse appearance adjustment
 */

uniform float time;
uniform sampler2D colorMap;
uniform sampler2D normalMap;
uniform vec3 baseColor;
uniform float emissiveIntensity;
uniform vec2 shadowOffset;
uniform float shadowCoverage;
uniform float shadowSoftness;
uniform float opacity;

// Solar Eclipse uniforms (moon's shadow covering sun)
uniform float eclipseProgress;        // Eclipse progress (0 = no eclipse, 1 = totality)
uniform vec2 eclipseShadowPos;        // Shadow center position in UV space
uniform float eclipseShadowRadius;    // Moon's shadow radius
uniform float shadowDarkness;         // How much to darken the sun (0-1)

// Blend Layer Uniforms (up to 4 layers)
uniform float layer1Mode;
uniform float layer1Strength;
uniform float layer1Enabled;

uniform float layer2Mode;
uniform float layer2Strength;
uniform float layer2Enabled;

uniform float layer3Mode;
uniform float layer3Strength;
uniform float layer3Enabled;

uniform float layer4Mode;
uniform float layer4Strength;
uniform float layer4Enabled;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vViewPosition;  // View-space position (camera-relative)

// ═══════════════════════════════════════════════════════════════════════════
// UNIVERSAL BLEND MODES (injected from utils/blendModes.js)
// ═══════════════════════════════════════════════════════════════════════════
${blendModesGLSL}

// ═══════════════════════════════════════════════════════════════════════════
// SIMPLEX NOISE (for fire animation - from original sun shader)
// ═══════════════════════════════════════════════════════════════════════════
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
    // ═══════════════════════════════════════════════════════════════════════════
    // BASE SUN RENDERING (photosphere texture + fire animation)
    // ═══════════════════════════════════════════════════════════════════════════

    // Sample base photosphere texture
    vec4 texColor = texture2D(colorMap, vUv);

    // Optimized single-octave noise for subtle fire
    vec3 noiseCoord = vPosition * 30.0 + vec3(0.0, time * 0.025, 0.0);
    float fireNoise = snoise(noiseCoord);

    // Simple threshold - fire appears only in specific noise ranges
    float fireMask = fireNoise * 0.5 + 0.5; // Remap -1..1 to 0..1
    fireMask = step(0.45, fireMask) * (1.0 - step(0.55, fireMask)); // Only 0.45-0.55 range

    // Almost imperceptible warmth shift
    vec3 fireColor = vec3(1.01, 1.0, 0.99);

    // Microscopic blending
    vec3 finalColor = mix(texColor.rgb, fireColor, fireMask * 0.008);

    // Apply base color tinting
    finalColor *= baseColor;

    // Apply emissive intensity for HDR bloom
    finalColor *= emissiveIntensity;

    // ═══════════════════════════════════════════════════════════════════════════
    // LIMB DARKENING (realistic solar effect - edges appear darker than center)
    // ═══════════════════════════════════════════════════════════════════════════

    // Calculate distance from center (0 at center, 1 at edge)
    float distFromCenterLimb = length(vWorldPosition.xy) / 0.9; // normalize by sun radius (0.9)
    distFromCenterLimb = clamp(distFromCenterLimb, 0.0, 1.0);

    // Limb darkening formula: I(μ) = 1 - u*(1-μ) where μ = cos(viewing angle)
    // Simplified using distance: darker at edges, brighter at center
    float mu = sqrt(1.0 - distFromCenterLimb * distFromCenterLimb); // cos approximation
    // EXTREME limb darkening for visibility
    float limbDarkeningCoeff = 0.98; // 98% darkening at edges
    float limbBrightness = 1.0 - limbDarkeningCoeff * (1.0 - mu);
    limbBrightness = pow(limbBrightness, 0.4); // Very aggressive power curve

    // Clamp to prevent over-darkening
    limbBrightness = max(limbBrightness, 0.02); // Edges at least 2% brightness

    // Apply limb darkening (BEFORE bloom processing)
    finalColor *= limbBrightness;

    // ═══════════════════════════════════════════════════════════════════════════
    // SOLAR ECLIPSE EFFECT (Moon Occulting Sun)
    // ═══════════════════════════════════════════════════════════════════════════
    // Solar eclipse: Moon passes BETWEEN viewer and sun, blocking our view
    // The moon appears as a dark circular disk that covers parts of the sun
    // From Earth, moon and sun appear same angular size (0.5°)

    // Only apply eclipse if there's a moon to occlude (radius > 0)
    if (eclipseShadowRadius > 0.01) {
        // Only occlude FRONT-FACING parts of the sun (vViewPosition.z < 0 faces camera in view space)
        // Back of sun should not be affected by moon
        if (vViewPosition.z < 0.1) {
            // Project to screen space - camera-relative, independent of sun rotation
            // vViewPosition.xy is already in camera space, just normalize to sun radius
            // Sun radius in view space is approximately 0.5 at typical camera distance
            vec2 screenPos = vViewPosition.xy;

            // Moon center position in screen space (same coordinate system)
            vec2 moonCenter = eclipseShadowPos;

            // Distance from this sun point to moon center (2D screen space)
            float distToMoon = length(screenPos - moonCenter);

            // Moon's angular size (appears same size as sun from Earth)
            // In normalized screen space, sun radius = 1.0, moon radius = 1.0 for total eclipse
            float moonRadius = eclipseShadowRadius;
            float moonEdge = 0.01; // Sharp edge for moon silhouette

            // Check if moon blocks this point (moon is in front of sun)
            float moonOcclusion = 1.0 - smoothstep(moonRadius - moonEdge, moonRadius + moonEdge, distToMoon);

            // Only apply if moon is actually occluding something
            if (moonOcclusion > 0.001) {
                // Moon completely blocks sun where it overlaps (no light gets through)
                finalColor *= (1.0 - moonOcclusion);

                // Subtle penumbra around moon edge (diffraction)
                float penumbraRadius = moonRadius * 1.02;
                float penumbraEdge = 0.03;
                float penumbra = 1.0 - smoothstep(penumbraRadius - penumbraEdge, penumbraRadius + penumbraEdge, distToMoon);
                float penumbraBlocking = (penumbra - moonOcclusion) * 0.2;
                finalColor *= (1.0 - penumbraBlocking);
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // BLEND LAYERS (Applied globally to entire sun)
    // These allow adjusting the appearance of the sun
    // ═══════════════════════════════════════════════════════════════════════════

    // Layer 1
    if (layer1Enabled > 0.5) {
        vec3 blendColor1 = vec3(min(layer1Strength, 1.0));
        int mode1 = int(layer1Mode + 0.5);
        vec3 blended1 = clamp(applyBlendMode(finalColor, blendColor1, mode1), 0.0, 1.0);
        finalColor = clamp(blended1, 0.0, 1.0);
    }

    // Layer 2
    if (layer2Enabled > 0.5) {
        vec3 blendColor2 = vec3(min(layer2Strength, 1.0));
        int mode2 = int(layer2Mode + 0.5);
        vec3 blended2 = clamp(applyBlendMode(finalColor, blendColor2, mode2), 0.0, 1.0);
        finalColor = clamp(blended2, 0.0, 1.0);
    }

    // Layer 3
    if (layer3Enabled > 0.5) {
        vec3 blendColor3 = vec3(min(layer3Strength, 1.0));
        int mode3 = int(layer3Mode + 0.5);
        vec3 blended3 = clamp(applyBlendMode(finalColor, blendColor3, mode3), 0.0, 1.0);
        finalColor = clamp(blended3, 0.0, 1.0);
    }

    // Layer 4
    if (layer4Enabled > 0.5) {
        vec3 blendColor4 = vec3(min(layer4Strength, 1.0));
        int mode4 = int(layer4Mode + 0.5);
        vec3 blended4 = clamp(applyBlendMode(finalColor, blendColor4, mode4), 0.0, 1.0);
        finalColor = clamp(blended4, 0.0, 1.0);
    }

    // Apply fade-in opacity to prevent texture flash during load
    gl_FragColor = vec4(finalColor, opacity);
}
`;

/**
 * Get sun shader with blend layers
 * @returns {Object} Object with vertexShader and fragmentShader strings
 */
export function getSunWithBlendLayersShaders() {
    return {
        vertexShader: sunWithBlendLayersVertexShader,
        fragmentShader: sunWithBlendLayersFragmentShader
    };
}
