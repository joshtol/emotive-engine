/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Instanced Ice Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview GPU-instanced ice material with crystalline effects
 * @module materials/InstancedIceMaterial
 *
 * Uses per-instance attributes for:
 * - Time-offset animation (each instance has its own local time)
 * - Model selection (merged geometry with multiple ice model variants)
 * - Trail rendering (main + 3 trail copies per logical element)
 * - Spawn/exit fade transitions
 * - Velocity for motion blur
 *
 * This material is designed to work with ElementInstancePool for
 * GPU-efficient rendering of many ice elements with a single draw call.
 *
 * ## Master Parameter: melt (0-1)
 *
 * | Melt | Visual                       | Physics           | Example      |
 * |------|------------------------------|-------------------|--------------|
 * | 0.0  | Sharp refraction, frost      | Brittle, heavy    | Solid ice    |
 * | 0.5  | Softer edges, dripping       | Slippery, cracking| Melting      |
 * | 1.0  | Transitions to water         | Water physics     | Slush        |
 */

import * as THREE from 'three';
import {
    INSTANCED_ATTRIBUTES_VERTEX,
    INSTANCED_ATTRIBUTES_FRAGMENT,
    createInstancedUniforms
} from './InstancedShaderUtils.js';
import {
    ANIMATION_TYPES,
    CUTOUT_PATTERNS,
    CUTOUT_BLEND,
    CUTOUT_TRAVEL,
    GRAIN_TYPES,
    GRAIN_BLEND,
    ANIMATION_UNIFORMS_FRAGMENT,
    CUTOUT_PATTERN_FUNC_GLSL,
    CUTOUT_GLSL,
    GRAIN_GLSL,
    createAnimationUniforms,
    setShaderAnimation,
    updateAnimationProgress,
    setGestureGlow,
    setGlowScale,
    setCutout,
    resetCutout,
    setGrain,
    resetGrain,
    resetAnimation
} from './cores/InstancedAnimationCore.js';

// ═══════════════════════════════════════════════════════════════════════════════════════
// ICE DEFAULTS
// ═══════════════════════════════════════════════════════════════════════════════════════

const ICE_DEFAULTS = {
    melt: 0.0,
    intensity: 1.0,
    opacity: 0.55,
    frostAmount: 1.0,
    internalCracks: 0.8,
    subsurfaceScatter: 0.3,
    glowScale: 0.1,
    fadeInDuration: 0.2,
    fadeOutDuration: 0.4
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// NOISE GLSL (shared with other materials)
// ═══════════════════════════════════════════════════════════════════════════════════════

const NOISE_GLSL = /* glsl */`
// Hash function for noise
float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

// 3D noise
float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    return mix(
        mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
            mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
        mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
            mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
        f.z
    );
}

// Simplex-ish noise
float snoise(vec3 p) {
    return noise(p) * 2.0 - 1.0;
}

// FBM
float fbm4(vec3 p) {
    float f = 0.0;
    f += 0.5000 * noise(p); p *= 2.01;
    f += 0.2500 * noise(p); p *= 2.02;
    f += 0.1250 * noise(p); p *= 2.03;
    f += 0.0625 * noise(p);
    return f / 0.9375;
}

// Voronoi for crystalline patterns
float voronoi(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    float minDist = 1.0;

    for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
            for (int z = -1; z <= 1; z++) {
                vec3 neighbor = vec3(float(x), float(y), float(z));
                vec3 point = neighbor + hash(i + neighbor) * 0.8;
                float dist = length(f - point);
                minDist = min(minDist, dist);
            }
        }
    }
    return minDist;
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// ICE COLOR GLSL
// ═══════════════════════════════════════════════════════════════════════════════════════

const ICE_COLOR_GLSL = /* glsl */`
// Beer's Law absorption: light passing through ice loses red first, blue last
// thickness: how much ice light passes through (0=surface, 1=deep)
// melt: softens the absorption (melting ice is more transparent)
vec3 iceAbsorption(float thickness, float melt) {
    // Absorption coefficients: strong contrast — thin=bright white, thick=deep blue
    float absR = mix(3.0, 0.8, melt);   // red absorbed aggressively — thick areas go deep blue
    float absG = mix(1.1, 0.3, melt);   // green moderate-strong for visible blue shift
    float absB = mix(0.08, 0.03, melt); // blue passes through almost freely
    return vec3(exp(-thickness * absR), exp(-thickness * absG), exp(-thickness * absB));
}

// Perturb normal using noise gradient for crystalline sparkle
vec3 perturbNormal(vec3 normal, vec3 pos, float strength) {
    float eps = 0.05;
    float nx = noise(pos + vec3(eps, 0, 0)) - noise(pos - vec3(eps, 0, 0));
    float ny = noise(pos + vec3(0, eps, 0)) - noise(pos - vec3(0, eps, 0));
    float nz = noise(pos + vec3(0, 0, eps)) - noise(pos - vec3(0, 0, eps));
    vec3 grad = vec3(nx, ny, nz) / (2.0 * eps);
    return normalize(normal - grad * strength);
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// INSTANCED VERTEX SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════

const VERTEX_SHADER = /* glsl */`
// Standard uniforms
uniform float uGlobalTime;
uniform float uFadeInDuration;
uniform float uFadeOutDuration;
uniform float uMelt;

// Arc visibility uniforms (for vortex effects)
uniform int uAnimationType;
uniform float uArcWidth;
uniform float uArcSpeed;
uniform int uArcCount;
uniform float uGestureProgress;

// Per-instance attributes
${INSTANCED_ATTRIBUTES_VERTEX}

// Varyings to fragment
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vInstancePosition;
varying vec3 vNormal;
varying vec3 vViewDir;
varying float vRandomSeed;
varying float vArcVisibility;
varying float vVerticalGradient;
varying vec2 vUv;

${NOISE_GLSL}

void main() {
    // ═══════════════════════════════════════════════════════════════════════════════
    // INSTANCING: Calculate local time and fade
    // ═══════════════════════════════════════════════════════════════════════════════

    vLocalTime = uGlobalTime - aSpawnTime;

    // Trail instances have delayed local time
    float trailDelay = max(0.0, aTrailIndex) * 0.05;
    float effectiveLocalTime = max(0.0, vLocalTime - trailDelay);

    // Fade in/out controlled by aInstanceOpacity from AnimationState
    float fadeOut = 1.0;
    if (aExitTime > 0.0) {
        float exitElapsed = uGlobalTime - aExitTime;
        fadeOut = 1.0 - clamp(exitElapsed / uFadeOutDuration, 0.0, 1.0);
    }

    // Trail fade
    vTrailFade = aTrailIndex < 0.0 ? 1.0 : (1.0 - (aTrailIndex + 1.0) * 0.25);
    vInstanceAlpha = fadeOut * aInstanceOpacity * vTrailFade;

    // Pass velocity
    vVelocity = aVelocity;

    // ═══════════════════════════════════════════════════════════════════════════════
    // MODEL SELECTION: Scale non-selected models to zero
    // ═══════════════════════════════════════════════════════════════════════════════

    float modelMatch = step(abs(aModelIndex - aSelectedModel), 0.5);
    vec3 selectedPosition = position * modelMatch;
    vec3 selectedNormal = normal * modelMatch;

    // ═══════════════════════════════════════════════════════════════════════════════
    // TRAIL OFFSET: Position trails behind main along velocity
    // ═══════════════════════════════════════════════════════════════════════════════

    vec3 trailOffset = vec3(0.0);
    if (aTrailIndex >= 0.0 && length(aVelocity.xyz) > 0.001) {
        float trailDistance = (aTrailIndex + 1.0) * 0.05;
        trailOffset = -normalize(aVelocity.xyz) * trailDistance * aVelocity.w;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // ICE DISPLACEMENT (crystalline wobble - much less than water)
    // ═══════════════════════════════════════════════════════════════════════════════

    vPosition = selectedPosition;
    vRandomSeed = aRandomSeed;
    vUv = uv;

    // Calculate vertical gradient for tip-based effects
    float modelHeight = 1.0;
    vVerticalGradient = clamp((selectedPosition.y + 0.5) / modelHeight, 0.0, 1.0);

    // Ice is rigid - no vertex displacement (displacement creates visible
    // ripple artifacts on ring geometry)
    vec3 displaced = selectedPosition;

    // Apply trail offset
    displaced += trailOffset;

    // Transform normal with instance matrix
    vNormal = normalMatrix * mat3(instanceMatrix) * selectedNormal;

    // ═══════════════════════════════════════════════════════════════════════════════
    // Apply instance matrix for per-instance transforms
    // ═══════════════════════════════════════════════════════════════════════════════
    vec4 instancePosition = instanceMatrix * vec4(displaced, 1.0);

    vec4 worldPos = modelMatrix * instancePosition;
    vWorldPosition = worldPos.xyz;
    vViewDir = normalize(cameraPosition - worldPos.xyz);

    // Instance origin in world space (for trail dissolve)
    vec4 instanceOrigin = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    vInstancePosition = instanceOrigin.xyz;

    // ═══════════════════════════════════════════════════════════════════════════════
    // ARC VISIBILITY (for vortex ring effects)
    // ═══════════════════════════════════════════════════════════════════════════════
    vArcVisibility = 1.0;
    if (uAnimationType == 1) {
        float vertexAngle = atan(selectedPosition.z, selectedPosition.x);
        float arcAngle = uGestureProgress * uArcSpeed * 6.28318 + aRandomSeed;
        float halfWidth = uArcWidth * 3.14159;
        float arcSpacing = 6.28318 / float(max(1, uArcCount));

        float maxVis = 0.0;
        for (int i = 0; i < 4; i++) {
            if (i >= uArcCount) break;
            float thisArcAngle = arcAngle + float(i) * arcSpacing;
            float angleDiff = vertexAngle - thisArcAngle;
            angleDiff = mod(angleDiff + 3.14159, 6.28318) - 3.14159;
            float vis = 1.0 - smoothstep(halfWidth * 0.7, halfWidth, abs(angleDiff));
            maxVis = max(maxVis, vis);
        }
        vArcVisibility = maxVis;
    }

    gl_Position = projectionMatrix * modelViewMatrix * instancePosition;
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// INSTANCED FRAGMENT SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════

const FRAGMENT_SHADER = /* glsl */`
uniform float uGlobalTime;
uniform float uMelt;
uniform float uIntensity;
uniform float uOpacity;
uniform float uFrostAmount;
uniform float uInternalCracks;
uniform float uSubsurfaceScatter;
uniform vec3 uTint;
uniform float uGlowIntensity;
uniform float uBloomThreshold;

// Animation system uniforms (glow, cutout, travel, etc.) from shared core
${ANIMATION_UNIFORMS_FRAGMENT}

// Instancing varyings
${INSTANCED_ATTRIBUTES_FRAGMENT}

varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vInstancePosition;
varying vec3 vNormal;
varying vec3 vViewDir;
varying float vRandomSeed;
varying float vArcVisibility;
varying float vVerticalGradient;
varying vec2 vUv;

${NOISE_GLSL}
${ICE_COLOR_GLSL}
${CUTOUT_PATTERN_FUNC_GLSL}

void main() {
    // Early discard for fully faded instances
    if (vInstanceAlpha < 0.01) discard;

    float localTime = vLocalTime;

    // ═══════════════════════════════════════════════════════════════════════════════
    // NORMALS — smooth for shading, flat for facet glints
    // Smooth: interpolated vertex normals → soft fresnel, absorption, rim
    // Flat: screen-space derivatives → each polygon catches light independently
    // ═══════════════════════════════════════════════════════════════════════════════
    vec3 normal = normalize(vNormal);
    vec3 faceNormal = normalize(cross(dFdx(vWorldPosition), dFdy(vWorldPosition)));
    vec3 viewDir = normalize(vViewDir);

    float NdotV = abs(dot(normal, viewDir));
    float fresnel = pow(1.0 - NdotV, 3.0);

    // ═══════════════════════════════════════════════════════════════════════════════
    // BEER'S LAW ABSORPTION
    // ═══════════════════════════════════════════════════════════════════════════════
    float thickness = mix(0.05, 1.0, NdotV);

    vec3 absorption = iceAbsorption(thickness, uMelt);
    vec3 baseLight = vec3(0.90, 0.92, 0.95) * uTint;
    vec3 color = baseLight * absorption;

    // ═══════════════════════════════════════════════════════════════════════════════
    // FRESNEL RIM (bright edge glow - the glassy look)
    // ═══════════════════════════════════════════════════════════════════════════════
    vec3 rimColor = baseLight * iceAbsorption(0.1, uMelt);
    color = mix(color, rimColor, fresnel * 0.6);

    color *= uIntensity;

    // ═══════════════════════════════════════════════════════════════════════════════
    // BLOOM COMPRESSION (wider knee to preserve color variation)
    // ═══════════════════════════════════════════════════════════════════════════════
    float knee = 0.25 + uGlowScale * 0.08;
    float maxChannel = max(color.r, max(color.g, color.b));

    if (maxChannel > uBloomThreshold) {
        float excess = maxChannel - uBloomThreshold;
        float compressed = uBloomThreshold + knee * (1.0 - exp(-excess / knee));
        color *= compressed / maxChannel;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // SUBSURFACE SCATTERING (light passing through ice)
    // Back-lit areas get blue internal glow
    // ═══════════════════════════════════════════════════════════════════════════════
    vec3 sssLight1 = normalize(vec3(0.3, -0.6, 0.5));
    vec3 sssLight2 = normalize(vec3(-0.5, -0.3, -0.4));
    float sss1 = pow(max(dot(viewDir, -sssLight1), 0.0), 2.5);
    float sss2 = pow(max(dot(viewDir, -sssLight2), 0.0), 2.5) * 0.6;
    float sssStrength = (sss1 + sss2) * uSubsurfaceScatter * (1.0 - uMelt);
    sssStrength *= mix(0.5, 1.0, fresnel);
    vec3 sssColor = vec3(0.7, 0.8, 0.95) * sssStrength;
    color += sssColor;

    // ═══════════════════════════════════════════════════════════════════════════════
    // SPECULAR (bright glossy highlights — the #1 visual cue for ice)
    // Uses FLAT face normals so each polygon facet catches light independently,
    // creating the sharp glints that make ice look crystalline.
    // ═══════════════════════════════════════════════════════════════════════════════
    float specPower = mix(128.0, 24.0, uMelt);

    vec3 reflDir = reflect(-viewDir, faceNormal);
    float spec1 = pow(max(dot(reflDir, normalize(vec3(0.5, 1.0, 0.3))), 0.0), specPower);
    float spec2 = pow(max(dot(reflDir, normalize(vec3(-0.4, 0.8, -0.4))), 0.0), specPower) * 0.7;
    float spec3 = pow(max(dot(reflDir, normalize(vec3(-0.3, 0.6, 0.7))), 0.0), specPower) * 0.5;
    float spec4 = pow(max(dot(reflDir, normalize(vec3(0.6, 0.3, -0.6))), 0.0), specPower) * 0.4;
    float spec = spec1 + spec2 + spec3 + spec4;

    vec3 specContrib = vec3(0.95, 0.97, 1.0) * spec * (1.0 - uMelt * 0.5);
    // No per-component cap — soft clamp below handles bounding while
    // preserving relative brightness between facets
    color += specContrib;

    // ═══════════════════════════════════════════════════════════════════════════════
    // FINAL SOFT CLAMP — bound total after SSS + specular additions
    // Preserves relative brightness (glinting facets stay brighter than flat ones)
    // while preventing absolute blowout to white
    // ═══════════════════════════════════════════════════════════════════════════════
    float softCap = uBloomThreshold + 0.7;
    float finalMax = max(color.r, max(color.g, color.b));
    if (finalMax > softCap) {
        color *= softCap / finalMax;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERNAL CRACK LINES (two-scale Voronoi with Chebyshev distance)
    // Coarse pass: major fracture planes (thick, dark, angular)
    // Fine pass: secondary cracks (thin, subtle, varied)
    // Per-cell shade variation breaks the uniform monotone look
    // Applied AFTER soft clamp so cracks are always visible (color is bounded)
    // ═══════════════════════════════════════════════════════════════════════════════
    if (uInternalCracks > 0.01) {

        // ─── COARSE FRACTURE PLANES (scale 2.0 — large angular shards) ───
        vec2 coarsePos = vPosition.xz * 2.0;
        vec2 cci = floor(coarsePos);
        vec2 ccf = fract(coarsePos);
        float cd1 = 10.0, cd2 = 10.0;
        vec2 cCell1 = vec2(0.0), cCell2 = vec2(0.0);

        for (int x = -1; x <= 1; x++) {
            for (int y = -1; y <= 1; y++) {
                vec2 nb = vec2(float(x), float(y));
                vec2 cell = cci + nb;
                vec2 pt = nb + fract(sin(vec2(
                    dot(cell, vec2(127.1, 311.7)),
                    dot(cell, vec2(269.5, 183.3))
                )) * 43758.5453);
                vec2 diff = ccf - pt;
                float d = max(abs(diff.x), abs(diff.y)); // Chebyshev: angular cells
                if (d < cd1) { cd2 = cd1; cCell2 = cCell1; cd1 = d; cCell1 = cell; }
                else if (d < cd2) { cd2 = d; cCell2 = cell; }
            }
        }

        float coarseEdge = cd2 - cd1;
        // Variable width: hash the cell pair so each crack has its own thickness
        float coarsePairHash = fract(sin(dot(cCell1 + cCell2, vec2(78.233, 143.71))) * 43758.5453);
        float coarseWidth = mix(0.08, 0.20, coarsePairHash);
        float coarseCrack = 1.0 - smoothstep(0.0, coarseWidth, coarseEdge);
        // Bright refraction edge: just outside the dark crack, light refracts at crack surface
        float coarseBrightEdge = smoothstep(0.0, coarseWidth, coarseEdge) * (1.0 - smoothstep(coarseWidth, coarseWidth + 0.08, coarseEdge));
        // Depth variation: major fractures are bold and deep
        float coarseDepth = mix(0.8, 1.0, coarsePairHash);

        // ─── FINE CRACKS (scale 6.0 — small secondary fractures) ───
        vec2 finePos = vPosition.xz * 6.0;
        vec2 fci = floor(finePos);
        vec2 fcf = fract(finePos);
        float fd1 = 10.0, fd2 = 10.0;
        vec2 fCell1 = vec2(0.0), fCell2 = vec2(0.0);

        for (int x = -1; x <= 1; x++) {
            for (int y = -1; y <= 1; y++) {
                vec2 nb = vec2(float(x), float(y));
                vec2 cell = fci + nb;
                vec2 pt = nb + fract(sin(vec2(
                    dot(cell, vec2(127.1, 311.7)),
                    dot(cell, vec2(269.5, 183.3))
                )) * 43758.5453);
                vec2 diff = fcf - pt;
                float d = max(abs(diff.x), abs(diff.y)); // Chebyshev
                if (d < fd1) { fd2 = fd1; fCell2 = fCell1; fd1 = d; fCell1 = cell; }
                else if (d < fd2) { fd2 = d; fCell2 = cell; }
            }
        }

        float fineEdge = fd2 - fd1;
        float finePairHash = fract(sin(dot(fCell1 + fCell2, vec2(78.233, 143.71))) * 43758.5453);
        float fineWidth = mix(0.04, 0.12, finePairHash);
        float fineCrack = 1.0 - smoothstep(0.0, fineWidth, fineEdge);
        float fineDepth = mix(0.3, 0.7, finePairHash);

        // ─── PER-CELL SHADE VARIATION ───
        // Hash the nearest fine cell to shift each shard's apparent thickness
        // Some shards clearly whiter (thinner ice), others clearly deeper blue (thicker)
        float cellShade = fract(sin(dot(fCell1, vec2(93.97, 214.63))) * 43758.5453);
        float shadeShift = mix(-0.4, 0.4, cellShade);
        color *= 1.0 + shadeShift * uInternalCracks;

        // ─── COMPOSITE: coarse cracks (major, dominant) then fine cracks (subtle) ───

        // Coarse: deep dark fracture lines — the primary structural feature
        vec3 deepCrackColor = mix(vec3(0.04, 0.05, 0.08), color * vec3(0.15, 0.18, 0.25), 0.2);
        color = mix(color, deepCrackColor, coarseCrack * coarseDepth * uInternalCracks);

        // Coarse bright edge: refraction highlight adjacent to dark crack
        vec3 brightEdgeColor = min(color * 1.3, vec3(0.9));
        color = mix(color, brightEdgeColor, coarseBrightEdge * 0.35 * uInternalCracks);

        // Fine: secondary fractures — visible but not competing with coarse
        vec3 fineCrackColor = mix(vec3(0.08, 0.10, 0.14), color * vec3(0.30, 0.35, 0.45), 0.35);
        color = mix(color, fineCrackColor, fineCrack * fineDepth * uInternalCracks * 0.5);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // ALPHA (translucent — you should see through ice)
    // Low base opacity, fresnel makes edges more opaque (natural dielectric)
    // ═══════════════════════════════════════════════════════════════════════════════
    float alpha = uOpacity;
    alpha = mix(alpha, min(1.0, alpha + 0.4), fresnel);

    // Instance fade (spawn/exit)
    alpha *= vInstanceAlpha;

    // ═══════════════════════════════════════════════════════════════════════════════
    // ARC VISIBILITY (for vortex effects)
    // ═══════════════════════════════════════════════════════════════════════════════
    if (uAnimationType == 1) {
        alpha *= vArcVisibility;
        color *= mix(0.3, 1.0, vArcVisibility);
        if (vArcVisibility < 0.05) discard;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // CUTOUT EFFECT (shared pattern system from InstancedAnimationCore)
    // ═══════════════════════════════════════════════════════════════════════════════
    ${CUTOUT_GLSL}

    // Apply trail dissolve
    alpha *= trailAlpha;

    // ═══════════════════════════════════════════════════════════════════════════════
    // GRAIN EFFECT (noise texture overlay)
    // ═══════════════════════════════════════════════════════════════════════════════
    ${GRAIN_GLSL}

    // ═══════════════════════════════════════════════════════════════════════════════
    // FINAL OUTPUT
    // ═══════════════════════════════════════════════════════════════════════════════
    if (alpha < 0.01) discard;

    gl_FragColor = vec4(color, alpha);
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

function lerp(a, b, t) {
    return a + (b - a) * t;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// MATERIAL FACTORY
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Create an instanced procedural ice material
 *
 * @param {Object} options - Configuration options
 * @param {number} [options.melt=0.0] - Melt level (0=frozen, 0.5=melting, 1=slush)
 * @param {number} [options.intensity=1.0] - Brightness multiplier
 * @param {number} [options.opacity=0.9] - Base opacity
 * @param {number} [options.frostAmount=1.0] - Surface frost intensity
 * @param {number} [options.internalCracks=0.8] - Internal crack visibility
 * @param {number} [options.subsurfaceScatter=0.3] - Subsurface scattering amount
 * @param {number} [options.glowScale=0.8] - Scale for additive glow effects
 * @param {THREE.Color|number} [options.tint=0xffffff] - Color tint
 * @param {number} [options.fadeInDuration=0.2] - Spawn fade duration
 * @param {number} [options.fadeOutDuration=0.4] - Exit fade duration
 * @returns {THREE.ShaderMaterial}
 */
export function createInstancedIceMaterial(options = {}) {
    const {
        melt = ICE_DEFAULTS.melt,
        intensity = ICE_DEFAULTS.intensity,
        opacity = ICE_DEFAULTS.opacity,
        frostAmount = ICE_DEFAULTS.frostAmount,
        internalCracks = ICE_DEFAULTS.internalCracks,
        subsurfaceScatter = ICE_DEFAULTS.subsurfaceScatter,
        glowScale = ICE_DEFAULTS.glowScale,
        tint = 0xffffff,
        fadeInDuration = ICE_DEFAULTS.fadeInDuration,
        fadeOutDuration = ICE_DEFAULTS.fadeOutDuration
    } = options;

    // Derive values from melt
    const finalFrost = frostAmount * (1.0 - melt);
    const finalCracks = internalCracks * (1.0 - melt * 0.5);

    // Convert tint to THREE.Color
    const tintColor = tint instanceof THREE.Color ? tint : new THREE.Color(tint);

    const material = new THREE.ShaderMaterial({
        uniforms: {
            // Instancing uniforms
            uGlobalTime: { value: 0 },
            uFadeInDuration: { value: fadeInDuration },
            uFadeOutDuration: { value: fadeOutDuration },
            // Animation uniforms (cutout, glow, etc. from shared core)
            ...createAnimationUniforms(),
            // Override glowScale if provided in options
            uGlowScale: { value: glowScale },
            // Ice uniforms
            uMelt: { value: melt },
            uIntensity: { value: intensity },
            uOpacity: { value: opacity },
            uFrostAmount: { value: finalFrost },
            uInternalCracks: { value: finalCracks },
            uSubsurfaceScatter: { value: subsurfaceScatter },
            uTint: { value: tintColor },
            uGlowIntensity: { value: 1.0 },
            uBloomThreshold: { value: 0.5 }
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        depthWrite: true,
        side: THREE.DoubleSide
    });

    material.userData.melt = melt;
    material.userData.elementalType = 'ice';
    material.userData.isProcedural = true;
    material.userData.isInstanced = true;

    return material;
}

/**
 * Update the global time uniform for instanced ice material
 * @param {THREE.ShaderMaterial} material - Instanced ice material
 * @param {number} time - Current global time in seconds
 * @param {number} [gestureProgress=0] - Gesture progress 0-1 (for arc animation)
 */
export function updateInstancedIceMaterial(material, time, gestureProgress = 0) {
    if (material?.uniforms?.uGlobalTime) {
        material.uniforms.uGlobalTime.value = time;
    }
    updateAnimationProgress(material, gestureProgress);
}

/**
 * Set melt level on existing instanced ice material
 * @param {THREE.ShaderMaterial} material - Instanced ice material
 * @param {number} melt - New melt level (0-1)
 */
export function setInstancedIceMelt(material, melt) {
    if (!material?.uniforms) return;

    material.uniforms.uMelt.value = melt;
    material.uniforms.uFrostAmount.value = ICE_DEFAULTS.frostAmount * (1.0 - melt);
    material.uniforms.uInternalCracks.value = ICE_DEFAULTS.internalCracks * (1.0 - melt * 0.5);
    material.userData.melt = melt;
}

/**
 * Set tint color on existing instanced ice material
 * @param {THREE.ShaderMaterial} material - Instanced ice material
 * @param {THREE.Color|number} color - New tint color
 */
export function setInstancedIceTint(material, color) {
    if (!material?.uniforms?.uTint) return;

    const tintColor = color instanceof THREE.Color ? color : new THREE.Color(color);
    material.uniforms.uTint.value.copy(tintColor);
}

/**
 * Configure gesture-driven glow for ice effects.
 * @param {THREE.ShaderMaterial} material - Instanced ice material
 * @param {Object} config - Glow configuration
 */
export function setInstancedIceGestureGlow(material, config) {
    setGestureGlow(material, config);
}

/**
 * Configure cutout effect for ice elements.
 * @param {THREE.ShaderMaterial} material - Instanced ice material
 * @param {number|Object} config - Cutout strength (0-1) or config object
 */
export function setInstancedIceCutout(material, config) {
    setCutout(material, config);
}

/**
 * Set per-mascot bloom threshold for ice elements.
 * Prevents bloom blowout on low-threshold geometries (crystal/heart).
 * @param {THREE.ShaderMaterial} material - Instanced ice material
 * @param {number} threshold - Bloom threshold (0.35 for crystal/heart/rough, 0.85 for moon/star)
 */
export function setInstancedIceBloomThreshold(material, threshold) {
    if (material?.uniforms?.uBloomThreshold) {
        material.uniforms.uBloomThreshold.value = threshold;
    }
}

/**
 * Configure arc visibility animation for vortex effects
 * @param {THREE.ShaderMaterial} material - Instanced ice material
 * @param {Object} config - Animation config
 */
export const setInstancedIceArcAnimation = setShaderAnimation;

// Re-export animation types and shared functions for convenience
export {
    ANIMATION_TYPES,
    CUTOUT_PATTERNS,
    CUTOUT_BLEND,
    CUTOUT_TRAVEL,
    GRAIN_TYPES,
    GRAIN_BLEND,
    setShaderAnimation,
    setGestureGlow,
    setGlowScale,
    setCutout,
    resetCutout,
    setGrain,
    resetGrain,
    resetAnimation
};

export default {
    createInstancedIceMaterial,
    updateInstancedIceMaterial,
    setInstancedIceMelt,
    setInstancedIceTint,
    setInstancedIceGestureGlow,
    setInstancedIceBloomThreshold,
    setInstancedIceCutout,
    setInstancedIceArcAnimation,
    setShaderAnimation,
    setGestureGlow,
    setGlowScale,
    setCutout,
    setGrain,
    ANIMATION_TYPES,
    CUTOUT_PATTERNS,
    CUTOUT_BLEND,
    CUTOUT_TRAVEL,
    GRAIN_TYPES,
    GRAIN_BLEND
};
