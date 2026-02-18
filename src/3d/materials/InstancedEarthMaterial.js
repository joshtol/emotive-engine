/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Instanced Earth Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview GPU-instanced rocky stone material with mineral vein highlights
 * @module materials/InstancedEarthMaterial
 *
 * Uses per-instance attributes for:
 * - Time-offset animation (each instance has unique phase)
 * - Model selection (merged geometry with multiple earth model variants)
 * - Trail rendering (main + 3 trail copies per logical element)
 * - Spawn/exit fade transitions
 * - Velocity for motion blur
 *
 * ## Master Parameter: petrification (0-1)
 *
 * | Petrification | Visual                    | Effect              | Example       |
 * |---------------|---------------------------|---------------------|---------------|
 * | 0.0           | Soft loose earth           | Crumbly, warm       | Sandstone     |
 * | 0.5           | Rocky granite              | Hardening           | Granite       |
 * | 1.0           | Solid ancient stone        | Completely petrified| Fossil        |
 *
 * ## Visual Model: Matte Earthy Stone
 *
 * Multiple layers compose the earth aesthetic:
 * 1. Stone Body — warm ochre/brown base, NdotL diffuse-dominant + hemisphere ambient
 *    1.5 Mineral Patches — iron-oxide (rust), clay (ochre), slate (blue-grey) zones
 * 2. Surface Detail — FBM noise for crevice darkening and ridge brightening
 *    2.5 Sedimentary Strata — subtle horizontal warm/cool banding
 * 3. Dark Cracks — Voronoi edge-distance SHADOW crevices (dark, not bright)
 *    3.5 Iron-Oxide Stains — rust streaks adjacent to cracks
 *    3.6 Moss/Lichen — sparse grey-green patches on upward faces
 * 4. Wet Sheen — noise-driven moisture patches (darken + broad specular)
 * 5. Specular — dry tight glint (power 80) + wet broad sheen (power 16)
 *
 * Key difference from ice: stone is MATTE. Diffuse lighting dominates.
 * Cracks are dark shadow lines, not bright reflections.
 * Wet patches add localized gloss contrast against the matte body.
 * NormalBlending with depthWrite:true — stone is opaque, solid geometry.
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
import {
    WETNESS_UNIFORMS_GLSL,
    WETNESS_FUNC_GLSL,
    createWetnessUniforms,
    setWetness,
    resetWetness
} from './cores/WetnessCore.js';

// ═══════════════════════════════════════════════════════════════════════════════════════
// EARTH DEFAULTS
// ═══════════════════════════════════════════════════════════════════════════════════════

const EARTH_DEFAULTS = {
    petrification: 0.5,
    intensity: 1.2,
    opacity: 1.0,          // Opaque stone — no transparency
    pulseSpeed: 0.5,        // Slow geological pulse
    veinIntensity: 0.6,
    wetSpeed: 0.3,          // Slow geological moisture drift
    fadeInDuration: 0.15,
    fadeOutDuration: 0.3
};

function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Derive visual parameters from petrification level.
 * Higher petrification = harder stone, more mineral veins, less surface noise.
 *
 * @param {number} petrification - Master parameter 0-1
 * @param {Object} [overrides] - Optional overrides for individual parameters
 * @returns {Object} Derived parameters
 */
function deriveEarthParameters(petrification, overrides = {}) {
    return {
        intensity: overrides.intensity ?? lerp(0.85, 1.1, petrification),  // Matte stone — never bright
        pulseSpeed: overrides.pulseSpeed ?? lerp(0.3, 0.8, petrification),
        veinIntensity: overrides.veinIntensity ?? lerp(0.2, 0.6, petrification),  // Subtle mica
        wetness: overrides.wetness ?? lerp(0.55, 0.25, petrification)  // Loose earth wetter, petrified stone drier
    };
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// NOISE GLSL (required by cutout system — snoise must exist)
// ═══════════════════════════════════════════════════════════════════════════════════════

const NOISE_GLSL = /* glsl */`
float noiseHash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(mix(noiseHash(i), noiseHash(i + vec3(1,0,0)), f.x),
            mix(noiseHash(i + vec3(0,1,0)), noiseHash(i + vec3(1,1,0)), f.x), f.y),
        mix(mix(noiseHash(i + vec3(0,0,1)), noiseHash(i + vec3(1,0,1)), f.x),
            mix(noiseHash(i + vec3(0,1,1)), noiseHash(i + vec3(1,1,1)), f.x), f.y),
        f.z
    );
}

float snoise(vec3 p) {
    return noise(p) * 2.0 - 1.0;
}

// FBM for rocky surface detail
float fbm(vec3 p) {
    float value = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
        value += amp * noise(p);
        p *= 2.0;
        amp *= 0.5;
    }
    return value;
}

// 2D hash for Voronoi
vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
}

// Voronoi edge-distance for mineral veins
float voronoiEdge(vec2 p) {
    vec2 n = floor(p);
    vec2 f = fract(p);

    float minDist = 1.0;
    float secondDist = 1.0;

    for (int j = -1; j <= 1; j++) {
        for (int i = -1; i <= 1; i++) {
            vec2 neighbor = vec2(float(i), float(j));
            vec2 point = hash2(n + neighbor) * 0.8 + 0.1 + neighbor;
            float d = length(f - point);

            if (d < minDist) {
                secondDist = minDist;
                minDist = d;
            } else if (d < secondDist) {
                secondDist = d;
            }
        }
    }

    return secondDist - minDist;
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
uniform float uPetrification;
uniform float uPulseSpeed;

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
varying vec3 vWorldNormal;
varying vec3 vViewDir;
varying float vRandomSeed;
varying float vArcVisibility;
varying float vVerticalGradient;

${NOISE_GLSL}

void main() {
    // ═══════════════════════════════════════════════════════════════════════════════
    // INSTANCING: Calculate local time and fade
    // ═══════════════════════════════════════════════════════════════════════════════

    vLocalTime = uGlobalTime - aSpawnTime;

    // Trail instances have delayed local time
    float trailDelay = max(0.0, aTrailIndex) * 0.05;
    float effectiveLocalTime = max(0.0, vLocalTime - trailDelay);

    // Fade controlled by aInstanceOpacity from AnimationState
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
    // EARTH: Subtle geological displacement along normal
    // Very subtle (0.01) — stone is rigid, not organic.
    // ═══════════════════════════════════════════════════════════════════════════════

    float instanceTime = vLocalTime + aRandomSeed * 10.0;
    float breathe = sin(instanceTime * uPulseSpeed + aRandomSeed * 6.28) * 0.01 * uPetrification;

    vPosition = selectedPosition;
    vRandomSeed = aRandomSeed;
    vVerticalGradient = clamp((selectedPosition.y + 0.5) / 1.0, 0.0, 1.0);

    vec3 displaced = selectedPosition + selectedNormal * breathe + trailOffset;

    // Normal transform through instance matrix
    mat3 normalMat = mat3(instanceMatrix);
    vNormal = normalMatrix * normalMat * selectedNormal;
    vWorldNormal = normalMat * selectedNormal;

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
            float angleDiff = mod(vertexAngle - thisArcAngle + 3.14159, 6.28318) - 3.14159;
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
uniform float uPetrification;
uniform float uIntensity;
uniform float uOpacity;
uniform float uPulseSpeed;
uniform float uVeinIntensity;
uniform float uBloomThreshold;

// Shared wetness system (WetnessCore)
${WETNESS_UNIFORMS_GLSL}

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
varying float vRandomSeed;
varying float vArcVisibility;
varying float vVerticalGradient;

${NOISE_GLSL}
${WETNESS_FUNC_GLSL}
${CUTOUT_PATTERN_FUNC_GLSL}

void main() {
    // Early discard for fully faded instances
    if (vInstanceAlpha < 0.01) discard;

    vec3 normal = normalize(vNormal);
    vec3 faceNormal = normalize(cross(dFdx(vWorldPosition), dFdy(vWorldPosition)));
    vec3 viewDir = normalize(vViewDir);

    // Local time (required by CUTOUT_GLSL and GRAIN_GLSL)
    float localTime = vLocalTime;
    float instanceTime = localTime + vRandomSeed * 10.0;

    // NdotV for fresnel
    float NdotV = max(0.0, dot(normal, viewDir));

    // ═══════════════════════════════════════════════════════════════════════════════
    // LAYER 1: STONE BODY — Seiryu-style dark grey limestone
    //
    // Cool charcoal grey base with slight blue undertones.
    // Petrification drives from slightly warm grey → pure cool grey.
    // Stone is primarily diffuse. NdotL is the main lighting model.
    // ═══════════════════════════════════════════════════════════════════════════════

    // Petrification-driven base color — dark cool grey (Seiryu limestone)
    vec3 warmGrey  = vec3(0.38, 0.35, 0.30);  // Warm medium grey — slightly warmer/earthier
    vec3 coolGrey  = vec3(0.31, 0.31, 0.33);  // Cool medium grey (more petrified)
    vec3 baseColor = mix(warmGrey, coolGrey, uPetrification);

    // Per-instance geological color shift — each rock is unique
    float instanceWarm = fract(vRandomSeed * 3.71) * 2.0 - 1.0;
    baseColor *= vec3(1.0 + instanceWarm * 0.04, 1.0 + instanceWarm * 0.01, 1.0 - instanceWarm * 0.03);

    // ═══════════════════════════════════════════════════════════════════════════════
    // MINERAL COLOR PATCHES — subtle geological variety
    //
    // Seiryu stones are mostly uniform cool grey. Very subtle mineral shifts.
    // Slight warm ochre in sparse patches, blue-grey dominant.
    // ═══════════════════════════════════════════════════════════════════════════════

    float mineralNoise1 = noise(vPosition * 1.5 + vec3(vRandomSeed * 4.0));
    float mineralNoise2 = noise(vPosition * 0.8 + vec3(vRandomSeed * 2.5, 1.3, 0.7));

    // Mineral masks — computed here but applied AFTER diffuse lighting
    // Pre-diffuse mixing loses warmth through shade noise, diffuse, crevice, grain.
    // Post-diffuse multiplicative tint preserves warm/cool contrast on screen.
    float ochreMask = smoothstep(0.42, 0.65, mineralNoise1);
    float mineralNoise3 = noise(vPosition * 2.5 + vec3(vRandomSeed * 6.0, 0.0, 3.0));
    float warmMask = smoothstep(0.45, 0.68, mineralNoise3);

    // Blue-grey dominant patches — reinforces cool base tone
    vec3 blueGrey = vec3(0.18, 0.20, 0.26);
    float blueGreyMask = smoothstep(0.35, 0.18, mineralNoise2);
    baseColor = mix(baseColor, blueGrey, blueGreyMask * 0.22);

    // Per-pixel shade variation — reduced amplitude to not overpower mineral patches
    vec3 warpOffset = vec3(
        noise(vPosition * 2.0 + vec3(vRandomSeed * 3.3)),
        noise(vPosition * 2.0 + vec3(0.0, vRandomSeed * 4.1, 7.0)),
        0.0
    ) * 0.4;
    vec3 warpedPos = vPosition + warpOffset;
    float shadeNoise = noise(warpedPos * 8.0 + vec3(vRandomSeed * 5.5));
    baseColor *= 0.88 + shadeNoise * 0.24;  // ±12% — stronger tonal variation
    float tintNoise = noise(warpedPos * 5.0 + vec3(vRandomSeed * 2.2, 1.7, 0.4));
    vec3 warmShift = baseColor * vec3(1.05, 0.99, 0.93);
    vec3 coolShift = baseColor * vec3(0.94, 0.99, 1.06);
    baseColor = mix(coolShift, warmShift, tintNoise);

    // ═══════════════════════════════════════════════════════════════════════════════
    // SURFACE NOISE + PROCEDURAL BUMP — computed BEFORE diffuse lighting
    //
    // Noise drives both color variation (crevice/ridge/grain) AND bump normal
    // perturbation. dFdx/dFdy of smooth noise gives stable screen-space gradients.
    // Gritty zones get strong bumps (rough sandstone), polished zones stay flat.
    // ═══════════════════════════════════════════════════════════════════════════════

    // Two-scale rock noise: large tonal zones + medium detail
    float rockLarge = fbm(vPosition * 1.8 + vec3(vRandomSeed * 3.0));
    float rockMedium = noise(vPosition * 5.0 + vec3(vRandomSeed * 6.0));
    float rockNoise = rockLarge * 0.7 + rockMedium * 0.3;
    float detailNoise = noise(vPosition * 10.0 + vec3(vRandomSeed * 7.0));

    // Zone noise for gritty/polished regions (also controls grain amplitude later)
    float zoneNoise = noise(vPosition * 1.8 + vec3(vRandomSeed * 4.5));
    float grittyZone = smoothstep(0.30, 0.55, zoneNoise);    // 0=smooth, 1=gritty
    float polishedZone = smoothstep(0.78, 0.88, zoneNoise);  // top slice = polished

    // ─── Procedural bump mapping ───
    // Height field: rockNoise (broad ridges/crevices) + detailNoise (fine grit)
    // Zone modulation on strength only — height field is uniform, perturbation varies
    float bumpHeight = rockNoise * 0.6 + detailNoise * 0.4;

    // Screen-space derivatives of height → surface gradient
    float dhdx = dFdx(bumpHeight);
    float dhdy = dFdy(bumpHeight);

    // Surface tangent frame from object-space position derivatives
    vec3 surfT = normalize(dFdx(vPosition));
    vec3 surfB = normalize(dFdy(vPosition));

    // Bump strength: gritty zones get full bump, polished zones nearly flat
    float bumpStrength = mix(0.3, 1.0, grittyZone) * (1.0 - polishedZone * 0.8);
    vec3 bumpedNormal = normalize(normal - 5.0 * bumpStrength * (surfT * dhdx + surfB * dhdy));

    // Three lights for diffuse (same positioning as other elements)
    vec3 lightDir1 = normalize(vec3(0.5, 1.0, 0.3));
    vec3 lightDir2 = normalize(vec3(-0.4, 0.6, -0.5));
    vec3 lightDir3 = normalize(vec3(0.0, -0.3, 0.8));

    // Diffuse uses bumped normal — per-pixel lighting variation from surface relief
    float NdotL1 = max(0.0, dot(bumpedNormal, lightDir1));
    float NdotL2 = max(0.0, dot(bumpedNormal, lightDir2));
    float NdotL3 = max(0.0, dot(bumpedNormal, lightDir3));

    // Directional diffuse — primary light dominant for clear light/shadow contrast
    float diffuse = NdotL1 * 0.78 + NdotL2 * 0.14 + NdotL3 * 0.08;

    // Cool ambient with hemisphere variation (sky vs ground)
    float skyAmt = bumpedNormal.y * 0.5 + 0.5;
    vec3 ambientUp   = vec3(0.22, 0.22, 0.23);  // Raised — survives AO+shadow multiply
    vec3 ambientDown = vec3(0.11, 0.11, 0.12);  // Raised — shadow-side faces stay readable
    vec3 ambient = mix(ambientDown, ambientUp, skyAmt);

    vec3 stoneColor = baseColor * (ambient + vec3(diffuse));

    // ─── Edge ambient occlusion ───
    // Silhouette edges (low NdotV) get subtle darkening — simulates cavity
    // occlusion between adjacent faces. Adds depth to shadow areas that
    // otherwise look uniformly flat. Uses bumped normal so AO varies per-pixel.
    float edgeNdotV = max(0.0, dot(bumpedNormal, viewDir));
    float edgeAO = smoothstep(0.0, 0.45, edgeNdotV);  // 0=edge, 1=face-on
    stoneColor *= mix(0.85, 1.0, edgeAO);  // 15% darken at extreme edges (SSAO handles inter-object)

    // ═══════════════════════════════════════════════════════════════════════════════
    // LAYER 2: SURFACE DETAIL — color variation from the same noise
    //
    // Bump already handles lighting relief. These add color darkening/brightening
    // that stacks on top — crevice shadows get both physical and tonal depth.
    // ═══════════════════════════════════════════════════════════════════════════════

    // Crevice darkening — lighter floor since bump already handles physical shadow
    float crevice = smoothstep(0.30, 0.48, rockNoise);
    vec3 creviceColor = baseColor * vec3(0.48, 0.48, 0.50);  // Neutral-cool crevice shadow
    stoneColor = mix(creviceColor, stoneColor, crevice);

    // Ridge brightening — cool highlight on exposed faces
    float ridge = smoothstep(0.60, 0.75, rockNoise);
    stoneColor = mix(stoneColor, baseColor * vec3(1.10, 1.08, 1.05), ridge * 0.25);

    // ─── Mottled grain zones ───
    // Fine angular micro-grain — sharp hash at 120x (cells too small to see)
    float microGrain = noiseHash(floor(vPosition * 120.0 + vec3(vRandomSeed * 2.0)));

    // Blend with smooth detail noise for broader tonal patches
    float grit = detailNoise * 0.55 + microGrain * 0.45;

    // Polished zones: grain fades strongly to neutral (smooth worn faces)
    grit = mix(grit, 0.5, polishedZone * 0.90);

    // Zone-controlled amplitude: gritty=moderate (±18%), smooth=subtle (±8%)
    float gritAmp = mix(0.16, 0.36, grittyZone) * (1.0 - polishedZone * 0.85);
    stoneColor *= (1.0 - gritAmp * 0.5) + grit * gritAmp;

    // ─── Post-diffuse warm mineral mottling ───
    // Applied AFTER diffuse + crevice + grain so warmth isn't diluted.
    // Multiplicative tint: warm zones get red/green boosted, blue reduced.
    // This is like color grading — survives all prior processing.
    float warmAmount = min(ochreMask * 0.48 + warmMask * 0.38, 0.55);
    warmAmount *= smoothstep(0.05, 0.4, diffuse);  // Only show warm color in lit areas — shadows stay neutral grey
    vec3 warmTint = vec3(1.18, 1.06, 0.82);  // Stronger warm ochre — more visible mineral contrast
    stoneColor *= mix(vec3(1.0), warmTint, warmAmount);

    // ═══════════════════════════════════════════════════════════════════════════════
    // SEDIMENTARY STRATA — subtle horizontal color banding
    //
    // Alternating warm/cool layers based on object-space Y, warped by noise
    // so bands aren't perfectly straight — like real layered rock.
    // ═══════════════════════════════════════════════════════════════════════════════

    float strataY = vPosition.y * 6.0 + vRandomSeed * 3.0;
    float strataWarp = noise(vPosition * 2.0 + vec3(0.0, vRandomSeed * 5.0, 0.0));
    float strata = sin(strataY + strataWarp * 2.0) * 0.5 + 0.5;
    vec3 warmBand = stoneColor * vec3(1.03, 1.01, 0.97);
    vec3 coolBand = stoneColor * vec3(0.97, 0.99, 1.03);
    stoneColor = mix(coolBand, warmBand, strata);

    // ═══════════════════════════════════════════════════════════════════════════════
    // LAYER 3: CRACKS + CALCITE VEINS — Seiryu stone-inspired fractures
    //
    // Voronoi edge-distance drives both DARK crevices and BRIGHT calcite veins.
    // Noise selects which cracks are empty (dark shadow) vs calcite-filled (white).
    // Calcite veins are the signature look of Seiryu/limestone rocks.
    // ═══════════════════════════════════════════════════════════════════════════════

    // Voronoi on object-space XZ (models may lack UVs)
    vec2 crackPos = vPosition.xz * 2.5 + vec2(vPosition.y * 0.7, vRandomSeed * 2.0);
    float crackEdge = voronoiEdge(crackPos);

    // Break mask — erases ~35% of all crack features for natural variation
    float breakNoise = noise(vec3(crackPos * 0.5, vRandomSeed * 5.0));
    float breakMask = smoothstep(0.25, 0.50, breakNoise);

    // Calcite selection — separate noise decides which surviving cracks are bright
    float calciteNoise = noise(vec3(crackPos * 0.7, vRandomSeed * 3.0 + 7.0));
    float isCalcite = smoothstep(0.42, 0.58, calciteNoise);  // ~40% of cracks become calcite

    // Dark crack lines — empty crevices (deeper on dark stone)
    float darkCrackLine = 1.0 - smoothstep(0.0, 0.045, crackEdge);
    darkCrackLine *= breakMask * (1.0 - isCalcite);  // only where NOT calcite
    vec3 crackColor = vec3(0.04, 0.035, 0.03);  // Deeper crevice shadow
    stoneColor = mix(stoneColor, crackColor, darkCrackLine * 0.90);

    // Calcite veins — bright white lines tracing fracture paths
    float calciteLine = 1.0 - smoothstep(0.0, 0.05, crackEdge);
    calciteLine *= breakMask * isCalcite;
    // Subtle cream calcite — close to stone tone with slight warm offset
    vec3 calciteColor = vec3(0.75, 0.74, 0.72);  // Bright white calcite mineral
    stoneColor = mix(stoneColor, calciteColor, calciteLine * 0.75);

    // Combined crack line for wetness crack-pooling (both dark + calcite)
    float crackLine = max(darkCrackLine, calciteLine);

    // Rare mica sparkle — cool silver in dark cracks, top 15%
    float micaMask = smoothstep(0.85, 1.0, breakNoise) * (1.0 - isCalcite);
    float micaShimmer = 0.6 + 0.4 * sin(instanceTime * uPulseSpeed * 2.0 + crackEdge * 20.0);
    vec3 micaColor = vec3(0.30, 0.30, 0.35) * micaShimmer * uVeinIntensity;  // Subtle silver, not bright
    float micaLine = (1.0 - smoothstep(0.0, 0.04, crackEdge)) * micaMask;  // Wider spread, less point-like

    // ═══════════════════════════════════════════════════════════════════════════════
    // MINERAL STAINING — very sparse warm hints near cracks (Seiryu has minimal)
    // ═══════════════════════════════════════════════════════════════════════════════

    float stainNoise = noise(vec3(crackPos * 0.8, vPosition.y * 3.0));
    float stainZone = smoothstep(0.0, 0.08, crackEdge) * (1.0 - smoothstep(0.08, 0.25, crackEdge));
    float stainDrip = smoothstep(0.55, 0.70, stainNoise);  // Rarer
    vec3 stainColor = vec3(0.32, 0.28, 0.22);  // Muted warm deposit (subtle)
    stoneColor = mix(stoneColor, stainColor, stainZone * stainDrip * breakMask * 0.12);

    // ═══════════════════════════════════════════════════════════════════════════════
    // WET SHEEN — moisture patches with crack pooling and temporal drift
    //
    // Uses shared WetnessCore module. Noise-driven damp patches:
    //   1. Strong darkening (wet stone absorbs more light)
    //   2. Saturation boost (water fills pores → richer color, like wetting a pebble)
    //   3. Broad glossy specular sheen on wet faces
    // Dry stone = warm matte. Wet stone = dark, rich, with broad soft gloss.
    // ═══════════════════════════════════════════════════════════════════════════════

    float crackProximity = 1.0 - smoothstep(0.0, 0.10, crackEdge);
    float wetMask = calculateWetMask(vPosition, vRandomSeed, instanceTime, crackProximity);

    // Moderate darkening — wet stone absorbs light, darker than dry.
    // Tuned for dark Seiryu grey base: 0.45 multiplier (was 0.75 for bright sandstone).
    // At wetMask=0.40 (typical peak): ×0.82 = 18% darker. Visible but not black.
    stoneColor *= 1.0 - wetMask * 0.45;

    // Brightness floor — prevent wet areas from going near-black on dark base
    float wetLuma = dot(stoneColor, vec3(0.299, 0.587, 0.114));
    stoneColor = max(stoneColor, stoneColor * (0.08 / max(wetLuma, 0.01)));

    // Saturation boost — water fills micro-pores, reduces diffuse scatter.
    // Only apply when stone is bright enough for saturation to matter.
    // On near-black values (wetLuma < 0.10), saturation boost creates odd
    // color shifts instead of enrichment — skip in dark areas.
    float satBoost = wetMask * smoothstep(0.06, 0.14, wetLuma);
    float luma = dot(stoneColor, vec3(0.299, 0.587, 0.114));
    stoneColor = mix(stoneColor, mix(vec3(luma), stoneColor, 1.4), satBoost);

    // ═══════════════════════════════════════════════════════════════════════════════
    // SPECULAR — unified dry-to-wet transition (Lagarde wet surfaces model)
    //
    // ONE specular with parameters that smoothly transition from dry to wet:
    //   Power:     80 (tight matte) → 24 (broad sheen)
    //   Intensity: 0.08 (faint)     → 0.50 (visible gloss)
    //   Color:     warm stone       → near-white (water reflects sky)
    //   Normal:    face normal      → 30% blend toward smooth (water film)
    //
    // Stone porosity ~0.8. Water fills pores → roughness drops, reflectance rises.
    // Face normals still dominate (70%) so different polygons catch light
    // differently — some faces glossy, others matte. NOT uniform sheen.
    //
    // Ref: Lagarde "Water Drop 3b — Physically Based Wet Surfaces" (2013)
    // Game-friendly simplification: modify power/intensity, don't add separate terms.
    // ═══════════════════════════════════════════════════════════════════════════════

    vec3 halfDir1 = normalize(lightDir1 + viewDir);
    vec3 halfDir2 = normalize(lightDir2 + viewDir);
    vec3 halfDir3 = normalize(lightDir3 + viewDir);

    // Sharpened wet mask for specular — creates binary-ish wet/dry boundary.
    // wetMask is gradual (0-0.65 typical). Sharpen so wet areas reach near 1.0
    // and dry areas stay near 0.0. This makes the specular parameters actually
    // reach the "visibly wet" range in wet zones, instead of everything at 0.5.
    // Darkening still uses the gradual wetMask for soft transitions.
    float specWet = smoothstep(0.15, 0.45, wetMask);

    // ─── Water film micro-ripple normal perturbation ───
    // On flat-shaded low-poly, specular is binary per face (on or off).
    // Real wet stone has per-pixel variation from water micro-geometry:
    // ripples, droplet menisci, surface tension patterns.
    // Noise-based normal perturbation creates shimmering specular WITHIN
    // each polygon face — some pixels catch light, others don't.
    // Dry areas: zero perturbation (flat matte rock, correct).
    // Wet areas: subtle ripple → per-pixel specular variation.
    float rippleX = noise(vPosition * 12.0 + vec3(instanceTime * 0.08, 0.0, 0.0)) - 0.5;
    float rippleZ = noise(vPosition * 12.0 + vec3(0.0, 0.0, instanceTime * 0.06 + 3.7)) - 0.5;
    vec3 ripplePerturbation = vec3(rippleX, 0.0, rippleZ) * specWet * 0.18;

    // Normal blending: start from face normal, blend toward smooth (55% max),
    // then add water ripple perturbation in wet zones.
    // Water film bridges polygon edges → broad continuous sheen across faces.
    vec3 baseSpecNormal = mix(faceNormal, normalize(vWorldNormal), specWet * 0.35);
    vec3 specNormal = normalize(baseSpecNormal + ripplePerturbation);

    // Power: dry=80 (tight matte glint) → wet=24 (broad sheen, not mirror)
    float specPower = mix(80.0, 24.0, specWet);

    // Intensity: dry=0.06 (barely-there) → wet=0.18 (visible but not chrome)
    float specIntensity = mix(0.06, 0.18, specWet);

    // Color: dry=cool grey → wet=warm neutral (wet stone reflects warm ground bounce)
    vec3 drySpecColor = vec3(0.15, 0.15, 0.17);
    vec3 wetSpecColor = vec3(0.72, 0.71, 0.68);
    vec3 specColor = mix(drySpecColor, wetSpecColor, specWet);

    // Three-light specular (primary + fill + rim)
    float spec1 = pow(max(0.0, dot(specNormal, halfDir1)), specPower) * specIntensity;
    float spec2 = pow(max(0.0, dot(specNormal, halfDir2)), specPower) * specIntensity * 0.4;
    float spec3 = pow(max(0.0, dot(specNormal, halfDir3)), specPower) * specIntensity * 0.25;

    // Dry specular: added to stoneColor (will be soft-clamped with body)
    // Wet specular: stored separately, added AFTER soft clamp to exceed bloom
    vec3 drySpecContrib = drySpecColor * (spec1 + spec2 + spec3) * (1.0 - specWet);
    vec3 wetSpecContrib = specColor * (spec1 + spec2 + spec3) * specWet;
    stoneColor += drySpecContrib;

    // ─── Rim/backlight — sky light wrapping around silhouette edges ───
    // Separates overlapping rocks visually. Uses face normal so each polygon
    // has a distinct rim contribution. Cool sky tint like ambient fill light.
    float rimNdotV = max(0.0, dot(faceNormal, viewDir));
    float rim = pow(1.0 - rimNdotV, 3.0) * 0.14;
    vec3 rimColor = vec3(0.22, 0.24, 0.30);
    stoneColor += rimColor * rim;

    // ─── Thin-edge translucency — warm internal scatter at sharp edges ───
    // Real stone transmits a faint warm glow where geometry thins at silhouettes.
    // Uses same rimNdotV as rim light but steeper falloff and warm earth color.
    float sssRim = pow(1.0 - rimNdotV, 5.0) * 0.06;
    vec3 sssColor = vec3(0.35, 0.22, 0.12);
    stoneColor += sssColor * sssRim * (0.3 + diffuse * 0.7);

    // ═══════════════════════════════════════════════════════════════════════════════
    // BLOOM — Mica sparkle and wet specular peaks exceed threshold
    //
    // Stone body stays well under threshold (matte rock never blooms).
    // Wet specular and mica added AFTER soft clamp — they can bloom naturally.
    // ═══════════════════════════════════════════════════════════════════════════════

    vec3 color = stoneColor * uIntensity * uGlowScale;

    // Soft clamp: stone body bounded
    float softCap = uBloomThreshold + 0.30;
    float maxC = max(color.r, max(color.g, color.b));
    if (maxC > softCap) {
        color *= softCap / maxC;
    }

    // Wet specular added AFTER soft clamp — can exceed bloom threshold naturally
    // Water film sheen on wet stone should glow, like real wet rocks catching light
    color += wetSpecContrib * uIntensity * uGlowScale;

    // Mica highlights — bloom-exceeding features
    color += micaColor * micaLine * uPetrification * 0.15;

    // Crystal micro-glints — sparse mineral sparkles on rock faces
    // Top ~3% of pixels get tight specular glints. Uses face normal so each polygon
    // facet has a sharp, distinct sparkle. Added after soft clamp to exceed bloom.
    float glintNoise = noise(vPosition * 18.0 + vec3(vRandomSeed * 7.0));
    float glintMask = smoothstep(0.92, 1.0, glintNoise);  // top ~4% of pixels
    vec3 glintHalf1 = normalize(lightDir1 + viewDir);
    float glintSpec = pow(max(0.0, dot(faceNormal, glintHalf1)), 200.0);
    vec3 glintHalf2 = normalize(lightDir2 + viewDir);
    glintSpec += pow(max(0.0, dot(faceNormal, glintHalf2)), 200.0) * 0.6;
    color += vec3(0.40, 0.38, 0.32) * glintSpec * glintMask * 2.0;

    // ═══════════════════════════════════════════════════════════════════════════════
    // ALPHA — Opaque stone body
    //
    // NormalBlending with alpha=1.0 — stone replaces what's behind it.
    // Instance alpha still applies for spawn/exit fades.
    // ═══════════════════════════════════════════════════════════════════════════════

    float alpha = uOpacity;

    // Apply instance alpha (spawn/exit fade + trail fade)
    alpha *= vInstanceAlpha;

    // Apply arc visibility (for vortex effects)
    if (uAnimationType == 1) {
        alpha *= vArcVisibility;
    }

    // Discard invisible pixels
    if (alpha < 0.05) discard;

    // Shared cutout system from InstancedAnimationCore
    ${CUTOUT_GLSL}

    // Grain effect
    ${GRAIN_GLSL}

    gl_FragColor = vec4(color, alpha);
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// MATERIAL FACTORY
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Create an instanced procedural earth material (rocky stone)
 *
 * @param {Object} options - Configuration options
 * @param {number} [options.petrification=0.5] - Master parameter (0=sandstone, 0.5=granite, 1=fossil)
 * @param {number} [options.intensity] - Brightness multiplier (derived from petrification if not set)
 * @param {number} [options.opacity=1.0] - Base opacity (1.0 for opaque stone)
 * @param {number} [options.pulseSpeed] - Geological pulse speed (derived from petrification if not set)
 * @param {number} [options.veinIntensity] - Mineral vein strength (derived from petrification if not set)
 * @param {number} [options.fadeInDuration=0.15] - Spawn fade duration (seconds)
 * @param {number} [options.fadeOutDuration=0.3] - Exit fade duration (seconds)
 * @returns {THREE.ShaderMaterial}
 */
export function createInstancedEarthMaterial(options = {}) {
    const {
        petrification = EARTH_DEFAULTS.petrification,
        intensity = null,
        opacity = EARTH_DEFAULTS.opacity,
        pulseSpeed = null,
        veinIntensity = null,
        fadeInDuration = EARTH_DEFAULTS.fadeInDuration,
        fadeOutDuration = EARTH_DEFAULTS.fadeOutDuration
    } = options;

    // Derive petrification-dependent parameters
    const derived = deriveEarthParameters(petrification, {
        intensity, pulseSpeed, veinIntensity
    });

    const material = new THREE.ShaderMaterial({
        uniforms: {
            // Instancing uniforms
            uGlobalTime: { value: 0 },
            uFadeInDuration: { value: fadeInDuration },
            uFadeOutDuration: { value: fadeOutDuration },
            // Animation uniforms (cutout, glow, etc. from shared core)
            ...createAnimationUniforms(),
            // Shared wetness system
            ...createWetnessUniforms({ wetness: derived.wetness, wetSpeed: EARTH_DEFAULTS.wetSpeed }),
            // Earth uniforms
            uPetrification: { value: petrification },
            uIntensity: { value: derived.intensity },
            uOpacity: { value: opacity },
            uPulseSpeed: { value: derived.pulseSpeed },
            uVeinIntensity: { value: derived.veinIntensity },
            uBloomThreshold: { value: 0.75 }
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,         // Needed for spawn/exit fades and cutout
        blending: THREE.NormalBlending,
        depthWrite: true,
        side: THREE.DoubleSide
    });

    material.userData.petrification = petrification;
    material.userData.elementalType = 'earth';
    material.userData.isProcedural = true;
    material.userData.isInstanced = true;

    return material;
}

/**
 * Update the global time uniform for instanced earth material.
 * Also handles gesture progress and glow ramping via shared animation system.
 * @param {THREE.ShaderMaterial} material - Instanced earth material
 * @param {number} time - Current global time in seconds
 * @param {number} [gestureProgress=0] - Gesture progress 0-1 (for arc animation)
 */
export function updateInstancedEarthMaterial(material, time, gestureProgress = 0) {
    if (material?.uniforms?.uGlobalTime) {
        material.uniforms.uGlobalTime.value = time;
    }
    // Use shared animation system for gesture progress and glow ramping
    updateAnimationProgress(material, gestureProgress);
}

/**
 * Set petrification on existing instanced earth material.
 * Updates all petrification-dependent parameters.
 * @param {THREE.ShaderMaterial} material - Instanced earth material
 * @param {number} petrification - New petrification level (0-1)
 */
export function setInstancedEarthPetrification(material, petrification) {
    if (!material?.uniforms) return;

    const derived = deriveEarthParameters(petrification);
    material.uniforms.uPetrification.value = petrification;
    material.uniforms.uIntensity.value = derived.intensity;
    material.uniforms.uPulseSpeed.value = derived.pulseSpeed;
    material.uniforms.uVeinIntensity.value = derived.veinIntensity;

    // Update wetness based on petrification — loose earth wetter, petrified stone drier
    if (material.uniforms.uWetness) {
        material.uniforms.uWetness.value = derived.wetness;
    }

    material.userData.petrification = petrification;
}

/**
 * Set per-mascot bloom threshold for earth elements.
 * @param {THREE.ShaderMaterial} material - Instanced earth material
 * @param {number} threshold - Bloom threshold (0.35 for crystal/heart/rough, 0.85 for moon/star)
 */
export function setInstancedEarthBloomThreshold(material, threshold) {
    if (material?.uniforms?.uBloomThreshold) {
        material.uniforms.uBloomThreshold.value = threshold;
    }
}

/**
 * Configure shader animation for earth elements.
 * Uses the shared animation system from InstancedAnimationCore.
 * @param {THREE.ShaderMaterial} material - Instanced earth material
 * @param {Object} config - Animation config (see InstancedAnimationCore.setShaderAnimation)
 */
export const setInstancedEarthArcAnimation = setShaderAnimation;

/**
 * Configure gesture-driven glow ramping for earth effects.
 * @param {THREE.ShaderMaterial} material - Instanced earth material
 * @param {Object} config - Glow configuration (see InstancedAnimationCore.setGestureGlow)
 */
export function setInstancedEarthGestureGlow(material, config) {
    setGestureGlow(material, config);
}

/**
 * Configure cutout effect for earth elements.
 * @param {THREE.ShaderMaterial} material - Instanced earth material
 * @param {number|Object} config - Cutout strength (0-1) or config object
 */
export function setInstancedEarthCutout(material, config) {
    setCutout(material, config);
}

/**
 * Configure wetness on earth elements.
 * @param {THREE.ShaderMaterial} material - Instanced earth material
 * @param {Object} config - Wetness configuration { wetness, wetSpeed }
 */
export function setInstancedEarthWetness(material, config) {
    setWetness(material, config);
}

// Re-export animation types and shared functions for convenience
export { ANIMATION_TYPES, CUTOUT_PATTERNS, CUTOUT_BLEND, CUTOUT_TRAVEL, GRAIN_TYPES, GRAIN_BLEND, setShaderAnimation, setGestureGlow, setGlowScale, setCutout, resetCutout, setGrain, resetGrain, resetAnimation, setWetness, resetWetness };

export default {
    createInstancedEarthMaterial,
    updateInstancedEarthMaterial,
    setInstancedEarthPetrification,
    setInstancedEarthBloomThreshold,
    setInstancedEarthGestureGlow,
    setInstancedEarthCutout,
    setInstancedEarthWetness,
    setInstancedEarthArcAnimation,
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
