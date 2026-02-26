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
    INSTANCED_ATTRIBUTES_FRAGMENT
} from '../cores/InstancedShaderUtils.js';
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
} from '../cores/InstancedAnimationCore.js';
import {
    WETNESS_UNIFORMS_GLSL,
    WETNESS_FUNC_GLSL,
    createWetnessUniforms,
    setWetness,
    resetWetness
} from '../cores/WetnessCore.js';

// ═══════════════════════════════════════════════════════════════════════════════════════
// ICE DEFAULTS
// ═══════════════════════════════════════════════════════════════════════════════════════

const ICE_DEFAULTS = {
    melt: 0.0,
    intensity: 1.0,
    opacity: 0.70,
    frostAmount: 1.0,
    internalCracks: 0.8,
    subsurfaceScatter: 0.15,
    glowScale: 0.1,
    wetSpeed: 0.5,          // Moderate pace for ice melt/moisture
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

// Voronoi for crystalline patterns — 2D (9 iterations, used in vertex displacement)
float voronoi2D(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float minDist = 1.0;

    for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 point = neighbor + hash(vec3(i + neighbor, 0.0)) * 0.8;
            float dist = length(f - point);
            minDist = min(minDist, dist);
        }
    }
    return minDist;
}

// Trapped air bubbles: 2D cell grid with circular cross-sections.
// On thin ring geometry, Z depth is negligible — 2D captures the same look.
// Returns vec2(brightness, ringDarkness) for compositing.
vec2 bubbleField2D(vec3 p, float scale, float density) {
    vec2 sp = p.xz * scale;
    vec2 i = floor(sp);
    vec2 f = fract(sp);

    float bright = 0.0;
    float ringDark = 0.0;

    for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
            vec2 nb = vec2(float(x), float(y));
            vec2 cid = i + nb;
            vec3 cid3 = vec3(cid, 0.0);

            float exists = hash(cid3 * 1.7 + 3.73);
            if (exists < density) {
                vec2 center = nb + vec2(
                    hash(cid3 + 0.37),
                    hash(cid3 + 1.51)
                ) * 0.6 + 0.2;
                float r = mix(0.12, 0.30, hash(cid3 + 4.31));
                float d = length(f - center);

                if (d < r) {
                    float nd = d / r;
                    bright += (1.0 - nd * nd) * 0.45;
                    ringDark += smoothstep(0.65, 0.95, nd) * 0.5;

                    vec2 discDir = normalize(f - center);
                    bright += pow(max(dot(discDir, normalize(vec2(0.3, 0.2))), 0.0), 6.0) * 0.2;
                }
            }
        }
    }

    return vec2(bright, ringDark);
}

// Internal fracture planes: flat disc-shaped inclusions at random orientations
// inside the ice volume. Where the surface cuts through a fracture disc, you see
// a bright scattered-light line that shifts with viewing angle (like real ice).
// Each cell in the 3D grid may contain a fracture plane with:
//   - Random center position within cell
//   - Random plane orientation (normal vector)
//   - Disc radius with feathery noise-perturbed edges
//   - View-dependent brightness (planes facing camera flash bright)
// Returns: brightness (0-1) of fracture scatter at this point.
float fractureField3D(vec3 p, vec3 viewDir, float scale, float density) {
    vec3 sp = p * scale;
    vec3 i = floor(sp);
    vec3 f = fract(sp);

    float result = 0.0;

    for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
            for (int z = -1; z <= 1; z++) {
                vec3 nb = vec3(float(x), float(y), float(z));
                vec3 cid = i + nb;

                float exists = hash(cid * 2.3 + 7.91);
                if (exists < density) {
                    // Fracture center within cell
                    vec3 center = nb + vec3(
                        hash(cid + 0.37),
                        hash(cid + 1.51),
                        hash(cid + 2.93)
                    ) * 0.6 + 0.2;

                    // Random plane orientation
                    vec3 planeNorm = normalize(vec3(
                        hash(cid + 5.17) * 2.0 - 1.0,
                        hash(cid + 6.83) * 2.0 - 1.0,
                        hash(cid + 8.41) * 2.0 - 1.0
                    ));

                    // Distance from point to the fracture plane
                    vec3 toPoint = f - center;
                    float planeDist = abs(dot(toPoint, planeNorm));

                    // Thick slab — 0.25 ensures high intersection probability.
                    // At scale 1.5, cell=0.67 units, slab=0.25 → 37% of cell height.
                    float planeVis = 1.0 - smoothstep(0.0, 0.25, planeDist);

                    // Disc boundary — large discs spanning most of the cell
                    vec3 inPlane = toPoint - dot(toPoint, planeNorm) * planeNorm;
                    float radialDist = length(inPlane);
                    float discRadius = mix(0.5, 0.9, hash(cid + 9.73));
                    float discMask = 1.0 - smoothstep(discRadius * 0.7, discRadius, radialDist);

                    // No sparkle/brightness multipliers — just geometry.
                    // Visibility = plane intersection × disc shape. Range 0-1.
                    result += planeVis * discMask;
                }
            }
        }
    }
    return result;
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
    // Absorption: visible blue-grey tint at typical viewing angles.
    // With QUADRATIC NdotV and thickness max 2.5:
    //   NdotV=0.7 → thickness=1.27 → R=exp(-1.02)=0.36, G=exp(-0.44)=0.64, B=exp(-0.13)=0.88
    //   NdotV=0.5 → thickness=0.66 → R=exp(-0.53)=0.59, G=exp(-0.23)=0.79, B=exp(-0.07)=0.93
    // Grey-blue body, not pale white clay, not opaque dark quartz.
    float absR = mix(0.80, 0.40, melt);  // strong red removal → clearly blue
    float absG = mix(0.35, 0.18, melt);  // moderate green removal → grey-blue
    float absB = mix(0.10, 0.05, melt);  // slight blue attenuation → desaturated
    vec3 a = vec3(exp(-thickness * absR), exp(-thickness * absG), exp(-thickness * absB));
    // Floor: deep ice scatters ambient — never pure black void.
    // Cap at 0.98: zero-thickness glass is NOT pure white. Even a thin sheet
    // has a hint of absorption. Without this, tips read as lit white plastic.
    return clamp(a, vec3(0.02, 0.05, 0.10), vec3(0.98));
}

// Organic surface undulation — the "Wet" look.
// Low-frequency noise that flows over time, breaking perfect polygon refraction.
// Applied to SMOOTH view-space normals for refraction ONLY (not specular).
// Perturbs XY only (screen-right/up) since it targets view-space normals.
vec3 applyMeltRipple(vec3 n, vec3 worldPos, float seed, float melt) {
    float flow = uGlobalTime * 0.1;
    vec3 noisePos = worldPos * 2.0 + vec3(seed * 13.7, flow, seed * 7.3);
    float nA = snoise(noisePos);
    float nB = snoise(noisePos + vec3(12.5, 0.0, 12.5));
    float strength = 0.05 + melt * 0.15;
    return normalize(n + vec3(nA, nB, 0.0) * strength);
}

// Voronoi edge-distance for dendritic frost crystal patterns
// Returns F2-F1: thin at cell boundaries (frost veins), wide at cell centers (clear)
// Euclidean distance → organic rounded dendrites (vs Chebyshev in cracks → angular)
float voronoiFrost(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float d1 = 10.0, d2 = 10.0;
    for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
            vec2 nb = vec2(float(x), float(y));
            vec2 cell = i + nb;
            vec2 pt = nb + fract(sin(vec2(
                dot(cell, vec2(127.1, 311.7)),
                dot(cell, vec2(269.5, 183.3))
            )) * 43758.5453);
            float d = length(f - pt);
            if (d < d1) { d2 = d1; d1 = d; }
            else if (d < d2) { d2 = d; }
        }
    }
    return d2 - d1;
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
uniform float uArcPhase;
uniform float uGestureProgress;
uniform int uRelayCount;         // Number of relay rings
uniform float uRelayArcWidth;   // Relay arc width in radians
uniform float uRelayFloor;

// Per-instance attributes
${INSTANCED_ATTRIBUTES_VERTEX}

// Varyings to fragment
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vInstancePosition;
varying vec3 vNormal;
varying vec3 vWorldNormal;
varying vec3 vViewDir;
varying vec3 vViewPosition;
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

    // ═══════════════════════════════════════════════════════════════════════════════
    // SILHOUETTE BREAKUP — Voronoi vertex displacement at edges
    // Uses the same Voronoi cell pattern as our cutout/crack system.
    // Only active at silhouette edges (low NdotV) → jagged crystal outlines.
    // Face-on vertices stay put, preserving the clean faceted interior.
    // Per-instance random offset breaks repetition between identical models.
    // ═══════════════════════════════════════════════════════════════════════════════
    vec3 displaced = selectedPosition;

    if (modelMatch > 0.5 && length(selectedNormal) > 0.1) {
        // Edge factor: how close is this vertex to the silhouette?
        vec4 approxWorldPos = modelMatrix * instanceMatrix * vec4(selectedPosition, 1.0);
        vec3 approxViewDir = normalize(cameraPosition - approxWorldPos.xyz);
        vec3 worldNormal = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * selectedNormal);
        float edgeNdotV = abs(dot(worldNormal, approxViewDir));
        float edgeFactor = pow(1.0 - edgeNdotV, 2.0); // Quadratic — wider influence band

        // Voronoi cell distance — crystalline breakup matching our crack aesthetic
        // Per-instance offset so each crystal has unique edges
        // Low frequency (1.5) → broad heavy warps, not tiny bumps
        // Ring looks "bent" not "vibrating" — big surface undulations
        // 2D Voronoi (9 iter) — ring geometry has minimal Z variation
        float vor = voronoi2D(selectedPosition.xz * 1.5 + vec2(aRandomSeed * 7.13, aRandomSeed * 3.71));
        float displ = (vor - 0.4) * 2.0;

        // QUANTIZE into terraces — "chiseled ice plates" not smooth waves.
        // floor() cuts the smooth displacement into hard steps so flat shading
        // creates clean geometric plateaus instead of folded-paper look.
        float steppedDispl = floor(displ * 4.0) / 4.0; // 4 terrace levels
        float finalDispl = mix(displ, steppedDispl, 0.8); // 80% stepped, 20% smooth anti-aliasing

        displaced += normalize(selectedNormal) * finalDispl * 0.08 * edgeFactor;
    }

    // Apply trail offset
    displaced += trailOffset;

    // Transform normal with instance matrix
    vNormal = normalMatrix * mat3(instanceMatrix) * selectedNormal;
    // Ensure we use the 0.0 w-component to isolate rotation from scale/translation
    vec3 transformedNormal = (instanceMatrix * vec4(selectedNormal, 0.0)).xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * transformedNormal);

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
    if (aRandomSeed >= 100.0) {
        // Generalized relay: supports arbitrary relay count via uRelayCount
        float encoded = aRandomSeed - 100.0;
        float ringId = floor(encoded / 10.0);
        float instanceArcPhase = encoded - ringId * 10.0;

        float vertexAngle = atan(selectedPosition.y, selectedPosition.x);
        float hw = uRelayArcWidth * 0.5;
        float angleDiff = vertexAngle - instanceArcPhase;
        angleDiff = mod(angleDiff + 3.14159, 6.28318) - 3.14159;
        float arcMask = 1.0 - smoothstep(hw * 0.7, hw, abs(angleDiff));

        float cp = uGestureProgress * float(uRelayCount) * 1.5;
        float d = cp - ringId;
        float relayAlpha = smoothstep(-0.30, 0.05, d) * (1.0 - smoothstep(0.70, 1.05, d));
        vArcVisibility = arcMask * mix(uRelayFloor, 1.0, relayAlpha);
    } else if (uAnimationType == 1) {
        float vertexAngle = atan(selectedPosition.z, selectedPosition.x);
        float arcAngle = uGestureProgress * uArcSpeed * 6.28318 + uArcPhase;
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

    // View-space position: camera is at origin, so mvPosition IS the
    // vector from camera to surface — used directly as incident ray for refract()
    vec4 mvPosition = modelViewMatrix * instancePosition;
    vViewPosition = mvPosition.xyz;

    gl_Position = projectionMatrix * mvPosition;
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

// Shared wetness system (WetnessCore)
${WETNESS_UNIFORMS_GLSL}

// Screen-space refraction uniforms
uniform sampler2D uBackgroundTexture;
uniform vec2 uResolution;
uniform int uHasBackground;
uniform float uIOR;

// Animation system uniforms (glow, cutout, travel, etc.) from shared core
${ANIMATION_UNIFORMS_FRAGMENT}

// Instancing varyings
${INSTANCED_ATTRIBUTES_FRAGMENT}

varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vInstancePosition;
varying vec3 vNormal;
varying vec3 vWorldNormal;
varying vec3 vViewDir;
varying vec3 vViewPosition;
varying float vRandomSeed;
varying float vArcVisibility;
varying float vVerticalGradient;
varying vec2 vUv;

${NOISE_GLSL}
${WETNESS_FUNC_GLSL}
${ICE_COLOR_GLSL}
${CUTOUT_PATTERN_FUNC_GLSL}

void main() {
    // Early discard for fully faded instances
    if (vInstanceAlpha < 0.01) discard;

    float localTime = vLocalTime;

    // ═══════════════════════════════════════════════════════════════════════════════
    // HYBRID NORMALS — split flat/smooth for crystal shell vs liquid interior
    // FLAT faceNormal: specular, fresnel, NdotV → sharp chiseled crystal facets
    // SMOOTH vNormal + wet ripple: refraction → organic liquid warp through volume
    // This kills the "fun house kaleidoscope" without losing the faceted look.
    // ═══════════════════════════════════════════════════════════════════════════════
    vec3 faceNormal = normalize(cross(dFdx(vWorldPosition), dFdy(vWorldPosition)));
    vec3 viewDir = normalize(vViewDir);

    // World normal with faceforward for DoubleSide geometry
    vec3 worldNormal = normalize(vWorldNormal);

    // If normal buffer corrupted/zeroed, fallback to view direction
    if (length(vWorldNormal) < 0.01) {
        worldNormal = viewDir;
    }

    // faceforward: flip normal for back faces so dot(N, viewDir) > 0
    worldNormal = faceforward(worldNormal, -viewDir, worldNormal);

    float smoothNdotV = max(0.0, dot(worldNormal, viewDir));
    float fresnel = pow(1.0 - smoothNdotV, 4.0);
    vec3 normal = faceNormal; // specular only

    // ═══════════════════════════════════════════════════════════════════════════════
    // SURFACE FROST — opaque white rime patches that block refraction
    // Creates visual contrast: clear glass zones vs frosted matte zones.
    // Frost is surface scattering — kills specular, blocks see-through.
    // ═══════════════════════════════════════════════════════════════════════════════
    // Dendritic frost — Voronoi edge-distance (F2-F1) creates crystal vein patterns.
    // THIN VEINS ONLY — no broadFill. Frost is sharp crystalline lines, not sheets.
    // broadFill was covering 60% of rings in opaque white → "plastic sheet" look.
    float frostVein = voronoiFrost(vPosition.xz * 4.0 + vec2(vRandomSeed * 5.2));
    float thinVein = 1.0 - smoothstep(0.0, 0.06, frostVein); // Thinner veins = sharper crystal lines
    float frostRaw = thinVein; // No broadFill — veins, not sheets
    // Break mask — TIGHT so frost appears in rare clusters, not everywhere.
    // Low frequency (0.4x) → each break patch spans ~10 Voronoi cells → coherent crystal clusters.
    float frostBreak = noise(vec3(vPosition.xz * 0.4, 0.0));
    frostRaw *= smoothstep(0.50, 0.75, frostBreak);
    float frostMask = frostRaw * uFrostAmount;
    frostMask *= (1.0 - smoothstep(0.1, 0.4, uMelt)); // Melt kills frost first

    // ═══════════════════════════════════════════════════════════════════════════════
    // BEER'S LAW ABSORPTION — defines how light is colored passing through ice
    // ═══════════════════════════════════════════════════════════════════════════════
    // STABLE THICKNESS & CLARITY MASK (Iteration 100)
    // Linear transition ensures the teal tint doesn't "snap" to geometry
    float distFromCenter = length(vPosition);
    float isTip = smoothstep(0.4, 1.2, distFromCenter);
    float thickness = smoothstep(0.0, 1.0, smoothNdotV) * 0.65 * (1.0 - isTip);

    // ═══════════════════════════════════════════════════════════════════════════════
    // SCHLICK FRESNEL — dielectric reflection coefficient
    // Head-on: mostly transmitted (see through). Glancing: mostly reflected.
    // ═══════════════════════════════════════════════════════════════════════════════
    float F0 = 0.02;
    float schlick = F0 + (1.0 - F0) * fresnel;

    // ═══════════════════════════════════════════════════════════════════════════════
    // LIGHT DIRECTION — used ONLY for frost diffuse shading.
    // Glass body has ZERO diffuse. It's invisible until it refracts or reflects.
    // ═══════════════════════════════════════════════════════════════════════════════
    vec3 mainLight = normalize(vec3(0.3, 1.0, 0.5));

    // ═══════════════════════════════════════════════════════════════════════════════
    // SCREEN-SPACE REFRACTION — sample background through distorted UVs
    // The background was rendered to a texture without ice meshes.
    // Normal-based UV distortion simulates light bending through ice volume.
    // The refracted result is composited at FULL OPACITY — the "transparency"
    // is already baked into transmittedLight via Beer's Law absorption.
    // Using partial alpha would blend warped with un-warped = ghostly weak warp.
    // ═══════════════════════════════════════════════════════════════════════════════
    // ─── GRAND UNIFIED GLASS MODEL ───
    // Glass has ZERO diffuse. It is invisible until it refracts something
    // or reflects a specular highlight. In a vacuum it is BLACK.
    // Final = (refractedBackground × absorption) + specular. Nothing else.
    //
    // Three DECOUPLED properties:
    // 1. absorptionDepth (= thickness) → Controls COLOR only. Tips = clear (white).
    // 2. Refraction distortion → INDEPENDENT of thickness. Tips still bend light.
    // 3. Alpha = 1.0 → We ALWAYS see the warped background. "Transparency"
    //    is in the absorption color, not the alpha channel.

    // ═══════════════════════════════════════════════════════════════════════════════
    // REFRACTION — View-space vectors for screen-aligned UV distortion
    // I_vs = incident ray (camera→surface in view space) = normalize(vViewPosition)
    // N_vs = view-space normal with faceforward for DoubleSide geometry
    // refract() .xy maps directly to screen right/up — no camera rotation artifacts.
    // ═══════════════════════════════════════════════════════════════════════════════
    vec3 transmittedLight;
    vec3 voidColor = vec3(0.08, 0.12, 0.18);

    // Ice body color — "average environment as seen through ice volume."
    // Acts as ambient fill where refracted background is too dark.
    vec3 iceBodyColor = vec3(0.30, 0.48, 0.58) * uTint;

    if (uHasBackground == 1) {
        vec2 screenUV = gl_FragCoord.xy / uResolution;

        // View-space vectors for refraction
        vec3 I_vs = normalize(vViewPosition);
        vec3 N_vs = faceforward(normalize(vNormal), I_vs, normalize(vNormal));

        float distortion = 0.04 + (thickness * 0.15);
        vec3 refDir = refract(I_vs, N_vs, 0.75);

        // TIR fallback: use incident direction (minimal distortion)
        if (length(refDir) < 0.1) refDir = I_vs;

        vec2 uvBase = clamp(screenUV + refDir.xy * distortion, 0.0, 1.0);
        vec3 refractedBg = texture2D(uBackgroundTexture, uvBase).rgb;

        // Screen-blend lift: adds light to dark areas, barely touches bright areas.
        // Dark pixel (0.1) → 0.1 + 0.15*0.9 = 0.235 (visible shadow detail)
        // Bright pixel (0.8) → 0.8 + 0.15*0.2 = 0.83 (unchanged)
        // This is the "ambient environment light entering through the glass."
        vec3 ambientLift = vec3(0.10, 0.15, 0.22);
        refractedBg += ambientLift * (vec3(1.0) - refractedBg);

        // LERP absorption: blend lifted background toward ice body color.
        transmittedLight = mix(refractedBg, iceBodyColor, thickness * 0.4);
    } else {
        transmittedLight = mix(voidColor, iceBodyColor, thickness * 0.4);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // ENERGY CONSERVATION — softer teeter-totter (×0.3 not ×0.5).
    // At edges fresnel≈0.8: multiplier = 0.76 (gentle dim, not black).
    // ═══════════════════════════════════════════════════════════════════════════════
    transmittedLight *= (1.0 - fresnel * 0.3);

    // Ambient reflection at glancing angles (Schlick-driven edge brightness)
    vec3 envReflection = vec3(0.15, 0.25, 0.35) * uTint;
    transmittedLight += envReflection * schlick;

    // Internal scatter — faint volumetric glow at edges
    transmittedLight += vec3(0.04, 0.1, 0.14) * fresnel;

    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERNAL FRACTURE PLANES — flat crystalline sheets trapped inside the volume
    // Voronoi cells with Chebyshev distance → large angular regions.
    // Each cell is either a fracture plane (milky scatter) or clear glass.
    // Per-plane view-dependent brightness from random orientation.
    // Boundary edges highlighted where fractured meets clear glass.
    // Computed here, composited AFTER soft clamp (see below).
    // ═══════════════════════════════════════════════════════════════════════════════
    float fracPlanes = 0.0;
    float fracEdge = 0.0;
    {
        vec2 fpPx = viewDir.xz / max(smoothNdotV, 0.25) * 0.12;
        vec2 fpPos = (vPosition.xz + fpPx) * 1.5 + vec2(vRandomSeed * 6.0, vRandomSeed * 4.2);
        vec2 fpi = floor(fpPos);
        vec2 fpf = fract(fpPos);

        float fd1 = 10.0, fd2 = 10.0;
        vec2 fcell1 = vec2(0.0), fcell2 = vec2(0.0);

        for (int x = -1; x <= 1; x++) {
            for (int y = -1; y <= 1; y++) {
                vec2 nb = vec2(float(x), float(y));
                vec2 cell = fpi + nb;
                vec2 pt = nb + fract(sin(vec2(
                    dot(cell, vec2(127.1, 311.7)),
                    dot(cell, vec2(269.5, 183.3))
                )) * 43758.5453);
                vec2 diff = fpf - pt;
                float d = max(abs(diff.x), abs(diff.y));
                if (d < fd1) { fd2 = fd1; fcell2 = fcell1; fd1 = d; fcell1 = cell; }
                else if (d < fd2) { fd2 = d; fcell2 = cell; }
            }
        }

        float edgeDist = fd2 - fd1;

        // Per-cell fracture determination (~18% of cells have fractures)
        float fh1 = fract(sin(dot(fcell1, vec2(43.37, 87.71))) * 43758.5453);
        float fh2 = fract(sin(dot(fcell2, vec2(43.37, 87.71))) * 43758.5453);
        float fhas1 = step(0.82, fh1);
        float fhas2 = step(0.82, fh2);

        // View-dependent brightness for the fractured cell's "plane orientation"
        float fang = fract(sin(dot(fcell1, vec2(13.17, 67.29))) * 43758.5453) * 6.28;
        vec2 fdir = vec2(cos(fang), sin(fang));
        float fbright = abs(dot(fdir, viewDir.xz));
        fbright = mix(0.25, 1.0, fbright);
        float fbase = mix(0.5, 1.0, fract(fh1 * 7.13));

        // Fracture fill: milky scatter inside fractured cells
        fracPlanes = fhas1 * fbright * fbase;

        // Fracture boundary edge: bright line where fractured cell meets clear cell
        float isBoundary = abs(fhas1 - fhas2);
        fracEdge = isBoundary * (1.0 - smoothstep(0.0, 0.04, edgeDist));
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // FROST — opaque rime veins over clear glass
    // Applied after energy conservation so frost isn't dimmed at edges.
    // ═══════════════════════════════════════════════════════════════════════════════
    float frostLuma = min(0.65, uBloomThreshold + 0.25);
    vec3 frostColor = vec3(frostLuma, frostLuma * 1.02, frostLuma * 1.05);
    float frostDiffuse = max(0.4, dot(normal, mainLight));
    frostColor *= frostDiffuse;
    transmittedLight = mix(transmittedLight, frostColor, frostMask);

    // ═══════════════════════════════════════════════════════════════════════════════
    // PIXEL MATH — transmission + specular only. No boost, no scatter, no Schlick.
    // ═══════════════════════════════════════════════════════════════════════════════
    vec3 color = transmittedLight;
    color *= uIntensity;

    // ═══════════════════════════════════════════════════════════════════════════════
    // TRAPPED AIR BUBBLES — round spherical voids frozen inside the ice
    // Two scales: large prominent bubbles + small fizzy detail.
    // Each bubble: bright interior, dark ring edge, caustic highlight on top.
    // Cluster mask concentrates bubbles in patches (not uniform everywhere).
    // ═══════════════════════════════════════════════════════════════════════════════
    vec3 bubbleParallax = viewDir * 0.08 / max(smoothNdotV, 0.25);
    // Per-instance offset so each ice element has unique bubble placement
    vec3 bubbleSamplePos = vPosition + bubbleParallax + vec3(vRandomSeed * 10.0);

    // Cluster mask — mild variation, NOT aggressive culling
    float bubbleCluster = noise(vPosition * 2.0 + vec3(vRandomSeed * 5.0, 0.0, 0.0));
    float clusterMask = 0.5 + 0.5 * bubbleCluster; // 0.5–1.0 range, never fully off

    // 2D bubbles (scale 8, 65% density) — circles on thin ring geometry
    vec2 bub = bubbleField2D(bubbleSamplePos, 8.0, 0.65);

    // Tiny fizzy specks — cheap noise threshold dots for density between big bubbles
    float fizz = smoothstep(0.82, 0.89, noise(bubbleSamplePos * 35.0)) * 0.20;

    float bubbleBright = (bub.x + fizz) * clusterMask * (1.0 - frostMask);
    float bubbleRing = bub.y * clusterMask * (1.0 - frostMask);

    // Bright interior (primary) + subtle dark edge (secondary)
    color += vec3(0.80, 0.85, 0.92) * bubbleBright * 0.35;
    color -= vec3(0.07, 0.06, 0.04) * bubbleRing;

    // ═══════════════════════════════════════════════════════════════════════════════
    // SPECULAR — sharp concentrated glints for the wet/glossy look
    // Uses FLAT face normals: each polygon catches light independently
    // 4 lights for good coverage, high power for sharp points
    // ═══════════════════════════════════════════════════════════════════════════════
    float specPower = mix(128.0, 32.0, uMelt); // Broader highlights — glossy glass, not pinpoint diamond

    // 3 lights — enough coverage for visible glints on the now-darker body.
    // Sparse deep scratches: only top 5% of noise peaks become cuts.
    // 95% of surface is perfectly smooth glass. Where a scratch exists,
    // perturbation is strong (0.3) → visible specular scatter without
    // the "sandpaper everywhere" problem of low-strength global noise.
    float scratchNoise = noise(vWorldPosition * 20.0 + vec3(vRandomSeed * 17.3));
    float scratchMask = step(0.95, scratchNoise); // Only top 5% become scratches
    float scrAngle = noise(vWorldPosition * 3.0 + vec3(vRandomSeed * 5.1)) * 6.28;
    vec3 scratchDir = vec3(sin(scrAngle), cos(scrAngle), 0.0);
    vec3 scratchedNormal = normalize(normal + scratchDir * scratchMask * 0.3);
    vec3 reflDir = reflect(-viewDir, scratchedNormal);
    float spec1 = pow(max(dot(reflDir, normalize(vec3(0.5, 1.0, 0.3))), 0.0), specPower);
    float spec2 = pow(max(dot(reflDir, normalize(vec3(-0.4, 0.8, -0.4))), 0.0), specPower) * 0.6;
    float spec3 = pow(max(dot(reflDir, normalize(vec3(-0.3, 0.6, 0.7))), 0.0), specPower) * 0.4;
    float spec = spec1 + spec2 + spec3;

    vec3 specContrib = mix(vec3(1.0), vec3(0.9, 0.95, 1.0), fresnel) * spec * 2.5 * (1.0 - uMelt * 0.5);
    specContrib *= (1.0 - frostMask); // Frost is matte — kills specular completely
    color += specContrib;

    // Spatial wetness mask — modulates wet film specular for natural variation.
    // Uses shared WetnessCore. crackProximity=0.0 for now (coarseEdge computed later).
    // Guard: at low melt (uWetness ≤ 0.4), wet patches are barely visible.
    // Skip 4 noise + sin (~165 ALU) and use constant instead.
    float wetMask = uWetness > 0.4 ? calculateWetMask(vPosition, vRandomSeed, localTime + vRandomSeed * 10.0, 0.0) : 0.3;

    // Wet film specular — secondary tighter highlight on smooth surface.
    // Creates the "water on glass" look. Uses smooth world normal, not flat facets.
    // Power 120 = very sharp pinpoints. Spatially modulated by wetMask.
    vec3 wetReflDir = reflect(-viewDir, worldNormal);
    float wetSpec = pow(max(dot(wetReflDir, normalize(vec3(0.5, 1.0, 0.3))), 0.0), 120.0);
    wetSpec += pow(max(dot(wetReflDir, normalize(vec3(-0.4, 0.8, -0.4))), 0.0), 120.0) * 0.5;
    wetSpec += pow(max(dot(wetReflDir, normalize(vec3(0.0, 0.6, -0.8))), 0.0), 120.0) * 0.3;
    color += vec3(1.0) * wetSpec * 0.8 * (1.0 - frostMask) * wetMask;

    // Broad wet sheen — soft glossy highlight from thin water film on ice surface.
    // Medium specular power = visible gloss patches, not uniform brightening.
    // Uses smooth worldNormal: the water film IS smooth even over faceted ice.
    float sheen1 = pow(max(dot(wetReflDir, normalize(vec3(0.3, 1.0, 0.2))), 0.0), 24.0);
    float sheen2 = pow(max(dot(wetReflDir, normalize(vec3(-0.3, 0.8, -0.5))), 0.0), 24.0) * 0.5;
    float sheen3 = pow(max(dot(wetReflDir, normalize(vec3(0.6, 0.4, 0.6))), 0.0), 16.0) * 0.3;
    float wetSheen = sheen1 + sheen2 + sheen3;
    color += vec3(0.92, 0.95, 1.0) * wetSheen * 0.06 * (1.0 - frostMask) * (1.0 - uMelt * 0.5) * wetMask;

    // Subtle spatial darkening from moisture (ice is translucent, so minimal)
    color = applyWetDarkening(color, wetMask, 0.92);

    // ═══════════════════════════════════════════════════════════════════════════════
    // SOFT CLAMP — cap the smooth glass BASE before adding bright features
    // Cracks/specular/bubbles are added AFTER this so they can exceed the cap
    // and trigger bloom glow. The smooth glass body stays within bounds.
    // ═══════════════════════════════════════════════════════════════════════════════
    float softCap = uBloomThreshold + 0.30;
    float finalMax = max(color.r, max(color.g, color.b));
    if (finalMax > softCap) {
        color *= softCap / finalMax;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERNAL FRACTURE PLANES — milky crystalline inclusions
    // Cell fill: angular milky zones where flat fracture sheets scatter light.
    // Boundary edges: bright lines where fractured cells meet clear glass.
    // Applied post-clamp so both features exceed the capped body color.
    // ═══════════════════════════════════════════════════════════════════════════════
    color = mix(color, vec3(0.88, 0.92, 0.97), fracPlanes * 0.42 * uInternalCracks);
    color = mix(color, vec3(1.02, 1.05, 1.08), fracEdge * 0.55 * uInternalCracks);

    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERNAL CRACK LINES (two-scale Voronoi with Chebyshev distance)
    // Three realism layers:
    //   1. LOW-FREQ MASK: breaks continuous loops into isolated jagged segments
    //   2. DARK FRACTURES: occlusion planes that block light (applied first)
    //   3. BRIGHT SCATTER: reflection planes that catch light (applied on top)
    // Plus view-dependent sparkle: fracture brightness shifts with camera angle.
    // ═══════════════════════════════════════════════════════════════════════════════
    // Crack values hoisted for edge-breakup discard (used after crack coloring)
    float coarseCrack = 0.0;

    if (uInternalCracks > 0.01) {

        // ─── PARALLAX INTERIOR OFFSET ───
        // Offset crack sampling by view direction to create depth illusion.
        // Cracks shift as you rotate, looking like they're INSIDE the volume.
        float parallaxScale = 0.12;
        vec2 parallaxDir = viewDir.xz / max(smoothNdotV, 0.25);
        vec2 coarseParallax = parallaxDir * parallaxScale;        // shallow layer

        // ─── BREAK-THE-WEB MASK ───
        // Low-frequency noise erases ~75% of crack lines. Most of the surface
        // is PERFECTLY CLEAR glass — only 20-25% has dramatic fractures.
        // Frequency 0.4 → large smooth patches, not small noisy spots.
        float breakMask = noise(vec3(vPosition.xz * 0.4, 0.0));
        float coarseMask = smoothstep(0.55, 0.78, breakMask); // ~75% erased — huge quiet zones

        // ─── COARSE FRACTURE PLANES (scale 0.7 — MASSIVE structural cleaves) ───
        // Very low frequency → 3-4 fractures spanning the entire object.
        // Ring torus gets 2-3 dramatic cracks, not 1000 tiny scratches.
        vec2 coarsePos = (vPosition.xz + coarseParallax) * 0.7;
        vec2 cci = floor(coarsePos);
        vec2 ccf = fract(coarsePos);
        float cd1 = 10.0, cd2 = 10.0;
        vec2 cCell1 = vec2(0.0), cCell2 = vec2(0.0);
        vec2 cAbsPt1 = vec2(0.0), cAbsPt2 = vec2(0.0); // absolute Voronoi point positions (for dark reuse)

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
                if (d < cd1) { cd2 = cd1; cCell2 = cCell1; cAbsPt2 = cAbsPt1; cd1 = d; cCell1 = cell; cAbsPt1 = cci + pt; }
                else if (d < cd2) { cd2 = d; cCell2 = cell; cAbsPt2 = cci + pt; }
            }
        }

        float coarseEdge = cd2 - cd1;
        float coarsePairHash = fract(sin(dot(cCell1 + cCell2, vec2(78.233, 143.71))) * 43758.5453);
        float coarseWidth = mix(0.008, 0.025, coarsePairHash); // Slightly wider — dramatic structural cleaves
        coarseCrack = (1.0 - smoothstep(0.0, coarseWidth, coarseEdge)) * coarseMask;
        // Halo band just outside crack — refraction brightening
        float coarseBrightEdge = smoothstep(0.0, coarseWidth, coarseEdge) * (1.0 - smoothstep(coarseWidth, coarseWidth + 0.08, coarseEdge));
        float coarseDepth = mix(0.75, 1.0, coarsePairHash);

        // ─── VIEW-DEPENDENT SPARKLE ───
        // Each fracture plane has a pseudo-normal derived from its cell hash.
        // Planes facing the camera flash bright; planes facing away go dim.
        // This makes cracks "twinkle" as the object rotates — like diamond facets.
        vec2 coarsePlaneDir = normalize(vec2(coarsePairHash * 2.0 - 1.0, fract(coarsePairHash * 7.13) * 2.0 - 1.0));
        float coarseSparkle = abs(dot(coarsePlaneDir, viewDir.xz)); // 0=edge-on (dim), 1=face-on (flash)
        coarseSparkle = mix(0.05, 1.0, coarseSparkle); // Wide range: TIR flicker — some nearly vanish

        // ─── DARK FRACTURES (reuse coarse Voronoi topology) ───
        // Same cell structure as coarse but at offset parallax. Recompute just
        // 2 distances from the stored cell points instead of a full 9-iteration loop.
        vec2 darkParallax = parallaxDir * parallaxScale * 0.5;
        vec2 darkPos = (vPosition.xz + darkParallax + vec2(0.13, -0.09)) * 0.7;
        vec2 dv1 = darkPos - cAbsPt1;
        vec2 dv2 = darkPos - cAbsPt2;
        float ddd1 = max(abs(dv1.x), abs(dv1.y));
        float ddd2 = max(abs(dv2.x), abs(dv2.y));
        if (ddd1 > ddd2) { float tmp = ddd1; ddd1 = ddd2; ddd2 = tmp; }
        float darkEdge = ddd2 - ddd1;
        float darkCrack = (1.0 - smoothstep(0.0, 0.012, darkEdge)) * coarseMask;

        // ─── CRACK SPECULAR GLINTS (physical grooves catch light) ───
        // Use dFdx/dFdy of edge distances to get crack surface gradient.
        // This perturbs the normal WHERE cracks exist, so fracture lines
        // physically interact with specular — they glint like real grooves.
        float crackSpecGlint = 0.0;
        if (coarseCrack > 0.1) {
            float dex = dFdx(coarseEdge);
            float dey = dFdy(coarseEdge);
            vec3 crackGrad = vec3(dex, 0.0, dey);
            vec3 crackNorm = normalize(normal + crackGrad * 10.0); // Strong groove perturbation
            vec3 crackRefl = reflect(-viewDir, crackNorm);
            float cSpec = pow(max(dot(crackRefl, normalize(vec3(0.3, 1.0, 0.5))), 0.0), 48.0);
            cSpec += pow(max(dot(crackRefl, normalize(vec3(-0.4, 0.8, -0.4))), 0.0), 48.0) * 0.6;
            cSpec += pow(max(dot(crackRefl, normalize(vec3(0.6, 0.3, -0.6))), 0.0), 48.0) * 0.3;
            crackSpecGlint += cSpec * coarseCrack * coarseSparkle;
        }

        // ─── COMPOSITE ───
        // 1. Dark occlusion fractures FIRST (subtractive — blocks light)
        color = mix(color, vec3(0.0, 0.1, 0.3), darkCrack * 0.25 * uInternalCracks);

        // 2. Coarse bright scatter ON TOP (additive — catches light)
        //    Sparkle modulates brightness: some planes flash, others nearly vanish.
        color = mix(color, vec3(1.15), coarseCrack * coarseDepth * coarseSparkle * uInternalCracks * 0.7);

        // 3. Crack specular glints — physical groove highlights (the "shattered glass" flash)
        color += vec3(1.0) * crackSpecGlint * 2.5 * uInternalCracks;

        // 4. Refraction halo: subtle brightening adjacent to fracture
        color = mix(color, vec3(1.3), coarseBrightEdge * coarseMask * 0.25 * uInternalCracks);

    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // EDGE BREAKUP — discard at silhouette edges where cracks exist
    // Uses the SAME Voronoi cracks already computed above, so holes perfectly
    // match the visible crack lines. Only active when gesture opts in via edgeMask.
    // ═══════════════════════════════════════════════════════════════════════════════
    if (uCutoutEdgeMask > 0.0) {
        float eLenX = length(dFdx(vWorldPosition));
        float eLenY = length(dFdy(vWorldPosition));
        float eRatio = max(eLenX, eLenY) / max(min(eLenX, eLenY), 0.00001);

        float eLow = mix(1.1, 2.5, uCutoutEdgeMask);
        float eHigh = eLow + 0.8;
        float eFactor = smoothstep(eLow, eHigh, eRatio);

        float crackMask = coarseCrack;

        // At edges where cracks exist → discard for jagged silhouette
        if (eFactor * crackMask > 0.2) discard;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // ALPHA — SOLID CRYSTAL. Always 1.0.
    // "Transparency" comes from the refracted background painted onto the surface,
    // NOT from alpha blending. Alpha<1.0 blends warped+unwarped = ghost artifact.
    // ═══════════════════════════════════════════════════════════════════════════════
    float alpha = 1.0;

    // Instance fade (spawn/exit)
    alpha *= vInstanceAlpha;

    // ═══════════════════════════════════════════════════════════════════════════════
    // ARC VISIBILITY (for vortex effects)
    // ═══════════════════════════════════════════════════════════════════════════════
    if (vArcVisibility < 0.999) {
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
            // Relay arc uniforms
            uRelayCount: { value: 3 },
            uRelayArcWidth: { value: 3.14159 },
            uRelayFloor: { value: 0.0 },
            // Shared wetness system — melt drives wetness (frozen=0.3, melting=1.0)
            ...createWetnessUniforms({ wetness: melt * 0.7 + 0.3, wetSpeed: ICE_DEFAULTS.wetSpeed }),
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
            uBloomThreshold: { value: 0.5 },
            // Screen-space refraction
            uBackgroundTexture: { value: null },
            uResolution: { value: new THREE.Vector2(1, 1) },
            uHasBackground: { value: 0 },
            uIOR: { value: 1.31 }
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
    material.userData.needsRefraction = true;

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

    // More melt = more surface moisture (range 0.3-1.0, frozen ice still has some)
    if (material.uniforms.uWetness) {
        material.uniforms.uWetness.value = melt * 0.7 + 0.3;
    }

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

/**
 * Configure wetness on ice elements.
 * @param {THREE.ShaderMaterial} material - Instanced ice material
 * @param {Object} config - Wetness configuration { wetness, wetSpeed }
 */
export function setInstancedIceWetness(material, config) {
    setWetness(material, config);
}

export function setRelay(material, config) {
    if (!material) return;
    if (config.count !== undefined && material.uniforms?.uRelayCount) {
        material.uniforms.uRelayCount.value = config.count;
    }
    if (config.arcWidth !== undefined && material.uniforms?.uRelayArcWidth) {
        material.uniforms.uRelayArcWidth.value = config.arcWidth;
    }
    if (config.floor !== undefined && material.uniforms?.uRelayFloor) {
        material.uniforms.uRelayFloor.value = config.floor;
    }
}

export function resetRelay(material) {
    if (!material) return;
    if (material.uniforms?.uRelayCount) material.uniforms.uRelayCount.value = 3;
    if (material.uniforms?.uRelayArcWidth) material.uniforms.uRelayArcWidth.value = Math.PI;
    if (material.uniforms?.uRelayFloor) material.uniforms.uRelayFloor.value = 0.0;
}

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
    resetAnimation,
    setWetness,
    resetWetness
};

export default {
    createInstancedIceMaterial,
    updateInstancedIceMaterial,
    setInstancedIceMelt,
    setInstancedIceTint,
    setInstancedIceGestureGlow,
    setInstancedIceBloomThreshold,
    setInstancedIceCutout,
    setInstancedIceWetness,
    setInstancedIceArcAnimation,
    setShaderAnimation,
    setGestureGlow,
    setGlowScale,
    setCutout,
    setGrain,
    setWetness,
    resetWetness,
    ANIMATION_TYPES,
    CUTOUT_PATTERNS,
    CUTOUT_BLEND,
    CUTOUT_TRAVEL,
    GRAIN_TYPES,
    GRAIN_BLEND
};
