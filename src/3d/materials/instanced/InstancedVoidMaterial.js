/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Instanced Void Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview GPU-instanced black hole singularity material with gravitational lensing
 * @module materials/InstancedVoidMaterial
 *
 * Uses per-instance attributes for:
 * - Time-offset animation (each instance has unique phase)
 * - Model selection (merged geometry with multiple void model variants)
 * - Trail rendering (main + 3 trail copies per logical element)
 * - Spawn/exit fade transitions
 * - Velocity for motion blur
 *
 * ## Master Parameter: depth (0-1)
 *
 * | Depth | Visual                         | Example       |
 * |-------|--------------------------------|---------------|
 * | 0.0   | Slight lensing, faint ring     | Spatial tear  |
 * | 0.5   | Noticeable lensing, dark core  | Dark mass     |
 * | 1.0   | Full singularity, total black  | Black hole    |
 *
 * ## Visual Model: Black Hole Singularity
 *
 * Three layers compose the black hole aesthetic:
 * 1. Event Horizon — absolute black core (no light escapes)
 * 2. Photon Ring — razor-thin bright ring at the horizon boundary
 * 3. Gravitational Lensing — background warped inward via screen-space refraction
 *
 * Uses screen-space background sampling (like ice refraction) to warp
 * the scene behind each void element, creating visible spacetime distortion.
 * CustomBlending with the lensed result as color — black in the center,
 * warped background at the edges, thin bright photon ring at the boundary.
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

// ═══════════════════════════════════════════════════════════════════════════════════════
// VOID DEFAULTS
// ═══════════════════════════════════════════════════════════════════════════════════════

const VOID_DEFAULTS = {
    depth: 0.5,
    intensity: 1.5,
    opacity: 1.0,
    tendrilSpeed: 0.3,   // Breathing/animation speed (time dilation feel)
    edgeGlow: 0.7,       // Photon ring brightness
    fadeInDuration: 0.2,
    fadeOutDuration: 0.4
};

function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Derive visual parameters from depth level.
 * Higher depth = stronger lensing, brighter photon ring, deeper black.
 *
 * @param {number} depth - Master parameter 0-1
 * @param {Object} [overrides] - Optional overrides for individual parameters
 * @returns {Object} Derived parameters
 */
function deriveVoidParameters(depth, overrides = {}) {
    return {
        intensity: overrides.intensity ?? lerp(1.0, 2.5, depth),
        tendrilSpeed: overrides.tendrilSpeed ?? lerp(0.2, 0.5, depth),
        edgeGlow: overrides.edgeGlow ?? lerp(0.5, 1.0, depth)
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
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// INSTANCED VERTEX SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════

const VERTEX_SHADER = /* glsl */`
// Standard uniforms
uniform float uGlobalTime;
uniform float uFadeInDuration;
uniform float uFadeOutDuration;
uniform float uDepth;
uniform int uDiskMode;

// Arc visibility uniforms (for vortex effects)
uniform int uAnimationType;
uniform float uArcWidth;
uniform float uArcSpeed;
uniform int uArcCount;
uniform float uArcPhase;
uniform float uGestureProgress;
uniform int uRelayCount;
uniform float uRelayArcWidth;
uniform float uRelayFloor;

// Per-instance attributes
${INSTANCED_ATTRIBUTES_VERTEX}

// Varyings to fragment
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vInstancePosition;
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vViewPosition;
varying float vRandomSeed;
varying float vArcVisibility;
varying float vVerticalGradient;
varying float vDopplerAngleXY;  // Pre-computed atan(pos.y, pos.x) for disk mode
varying float vDopplerAngleXZ;  // Pre-computed atan(pos.z, pos.x) for non-disk mode

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
    // VOID: Slow breathing — event horizon pulsation (time dilation feel)
    // ═══════════════════════════════════════════════════════════════════════════════

    float instanceTime = vLocalTime + aRandomSeed * 10.0;
    // Disk mode: ZERO vertex displacement — must stay perfectly round
    float breathe = uDiskMode == 1 ? 0.0 : sin(instanceTime * 0.3) * 0.008 * uDepth;

    vPosition = selectedPosition;
    vRandomSeed = aRandomSeed;
    vVerticalGradient = clamp((selectedPosition.y + 0.5) / 1.0, 0.0, 1.0);

    // Pre-compute atan for Doppler asymmetry — saves 30 ops/fragment
    vDopplerAngleXY = atan(selectedPosition.y, selectedPosition.x);
    vDopplerAngleXZ = atan(selectedPosition.z, selectedPosition.x);

    vec3 displaced = selectedPosition + selectedNormal * breathe + trailOffset;

    // View-space normal (for screen-aligned lensing direction on 3D geometry)
    vNormal = normalMatrix * mat3(instanceMatrix) * selectedNormal;

    // ═══════════════════════════════════════════════════════════════════════════════
    // Apply instance matrix for per-instance transforms
    // ═══════════════════════════════════════════════════════════════════════════════
    vec4 instancePosition = instanceMatrix * vec4(displaced, 1.0);

    vec4 worldPos = modelMatrix * instancePosition;
    vWorldPosition = worldPos.xyz;
    vViewDir = normalize(cameraPosition - worldPos.xyz);

    // View-space position (for proper NdotV in fragment)
    vec4 viewPos = modelViewMatrix * instancePosition;
    vViewPosition = viewPos.xyz;

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
            float angleDiff = mod(vertexAngle - thisArcAngle + 3.14159, 6.28318) - 3.14159;
            float vis = 1.0 - smoothstep(halfWidth * 0.7, halfWidth, abs(angleDiff));
            maxVis = max(maxVis, vis);
        }
        vArcVisibility = maxVis;
    }

    gl_Position = projectionMatrix * viewPos;
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// INSTANCED FRAGMENT SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════

const FRAGMENT_SHADER = /* glsl */`
uniform float uGlobalTime;
uniform float uDepth;
uniform float uIntensity;
uniform float uOpacity;
uniform float uTendrilSpeed;    // Breathing/animation speed
uniform float uEdgeGlow;        // Photon ring brightness
uniform float uBloomThreshold;
uniform int uDiskMode;

// Screen-space gravitational lensing
uniform sampler2D uBackgroundTexture;
uniform vec2 uResolution;
uniform int uHasBackground;

// Animation system uniforms (glow, cutout, travel, etc.) from shared core
${ANIMATION_UNIFORMS_FRAGMENT}

// Instancing varyings
${INSTANCED_ATTRIBUTES_FRAGMENT}

varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vInstancePosition;
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vViewPosition;
varying float vRandomSeed;
varying float vArcVisibility;
varying float vVerticalGradient;
varying float vDopplerAngleXY;
varying float vDopplerAngleXZ;

${NOISE_GLSL}
${CUTOUT_PATTERN_FUNC_GLSL}

void main() {
    // Early discard for fully faded instances
    if (vInstanceAlpha < 0.01) discard;

    // Local time (required by CUTOUT_GLSL and GRAIN_GLSL)
    float localTime = vLocalTime;

    // View-space normal (screen-aligned for lensing direction)
    vec3 normal = normalize(vNormal);

    // Proper view-space NdotV (both vectors in view space)
    vec3 viewDirVS = -normalize(vViewPosition);
    float NdotV = max(0.0, dot(normal, viewDirVS));
    float edgeness = 1.0 - NdotV; // 0 = face-on (event horizon), 1 = silhouette

    // ═══════════════════════════════════════════════════════════════════════════════
    // DISK MODE — billboard singularity with built-in gravitational lensing.
    //
    // The disk is a perfect circle (billboard PlaneGeometry). It handles its
    // OWN background warping here in the shader — the DistortionManager
    // post-process is disabled (distortionStrength: 0) so the disk geometry
    // stays perfectly round on screen.
    //
    // Three zones from center outward:
    //   1. Event horizon (diskDist < horizonRadius): absolute black
    //   2. Photon ring (thin band at horizon boundary): bright amber emission
    //   3. Lensing zone (horizonRadius → edge): warped background, fading out
    // ═══════════════════════════════════════════════════════════════════════════════
    if (uDiskMode == 1) {
        float diskDist = length(vPosition.xy * 2.0);
        if (diskDist > 1.0) discard;

        float instanceTime = vLocalTime + vRandomSeed * 10.0;

        // Event horizon radius — everything inside is absolute black
        float horizonRadius = 0.50;

        // ═══════════════════════════════════════════════════════════════════
        // GRAVITATIONAL LENSING — warp background around singularity
        //
        // Billboard local XY maps directly to screen right/up (camera-facing),
        // so vPosition.xy gives us the screen-aligned lensing direction.
        // Offset UV OUTWARD from center → samples from further out →
        // image appears pulled inward toward singularity.
        // ═══════════════════════════════════════════════════════════════════
        vec2 screenUV = gl_FragCoord.xy / uResolution;

        vec2 diskXY = vPosition.xy * 2.0;
        vec2 lensDir = length(diskXY) > 0.001 ? normalize(diskXY) : vec2(0.0);

        // Lensing strength: strongest near horizon, fading toward edge
        // Scale by vInstanceAlpha so lensing fades gradually during exit (not binary pop)
        float lensMask = smoothstep(1.0, horizonRadius + 0.10, diskDist);
        float lensAmount = lensMask * 0.08 * uIntensity / 1.5 * vInstanceAlpha;

        // Horizon mask: 0 inside event horizon (black), 1 outside (show lensed bg)
        // Fade toward 1.0 (show unwarped bg) as instance fades out
        float horizonMask = mix(1.0, smoothstep(horizonRadius - 0.03, horizonRadius + 0.08, diskDist), vInstanceAlpha);

        // Sample with chromatic aberration (wavelength-dependent bending)
        vec3 lensedBg = vec3(0.0);
        if (uHasBackground == 1) {
            vec2 lensOffset = lensDir * lensAmount;
            float chrAb = lensAmount * 0.08;
            lensedBg.r = texture2D(uBackgroundTexture, screenUV + lensOffset + lensDir * chrAb).r;
            lensedBg.g = texture2D(uBackgroundTexture, screenUV + lensOffset).g;
            lensedBg.b = texture2D(uBackgroundTexture, screenUV + lensOffset - lensDir * chrAb).b;
        }

        // Black center + lensed edges
        vec3 color = lensedBg * horizonMask;

        // ═══════════════════════════════════════════════════════════════════
        // PHOTON RING — bright band at horizon boundary
        // ═══════════════════════════════════════════════════════════════════
        float ring = smoothstep(horizonRadius - 0.08, horizonRadius, diskDist)
                   * smoothstep(horizonRadius + 0.06, horizonRadius, diskDist);
        ring = pow(ring, 1.5);

        // Shimmer — photons in unstable orbit
        float shimmer = 0.9 + 0.1 * sin(instanceTime * 2.5 + diskDist * 40.0);
        ring *= shimmer;

        // Doppler asymmetry — slow rotation brightens approaching side
        float dopplerAngle = vDopplerAngleXY;
        float dopplerPhase = dopplerAngle + instanceTime * 0.4;
        float doppler = 0.82 + 0.18 * sin(dopplerPhase);
        ring *= doppler;

        // Warm amber ring color — gravitationally redshifted photons
        vec3 ringBase   = vec3(0.90, 0.55, 0.15);
        vec3 ringBright = vec3(1.00, 0.90, 0.65);
        vec3 ringColor  = mix(ringBase, ringBright, pow(ring, 2.0));

        float softCap = uBloomThreshold + 0.30;
        float ringBrightness = min(1.5, softCap) * uEdgeGlow;
        color += ringColor * ring * ringBrightness * vInstanceAlpha;

        // Instance fade — gradual (lensing already scaled by vInstanceAlpha above)
        if (vInstanceAlpha < 0.02) discard;

        // Cutout/grain (for gestures that use them)
        float alpha = 1.0;
        ${CUTOUT_GLSL}
        alpha *= trailAlpha;
        ${GRAIN_GLSL}
        if (alpha < 0.1) discard;

        gl_FragColor = vec4(color, 1.0);
        return;
    }

    // Per-instance time
    float instanceTime = vLocalTime + vRandomSeed * 10.0;

    // ═══════════════════════════════════════════════════════════════════════════════
    // NOISE SMOOTHING — subtle world-space noise hides polygon seams
    // Must be very small (0.02) — photon ring is only 0.18 wide, so even
    // ±0.01 perturbation is ~5% of ring width. Larger values (0.1) made
    // the singularity visibly blobby instead of a perfect circle.
    // ═══════════════════════════════════════════════════════════════════════════════
    float t = instanceTime * uTendrilSpeed;
    vec3 np = vWorldPosition * 5.0;
    float smoothNoise = noise(np * 2.0 + vec3(t * 0.3, -t * 0.2, t * 0.15));
    float smoothEdge = edgeness + (smoothNoise - 0.5) * 0.02;

    // ═══════════════════════════════════════════════════════════════════════════════
    // GRAVITATIONAL LENSING — screen-space background distortion
    //
    // For 3D geometry (void-orb, void-ring, void-wrap): warps background
    // through the geometry surface using view-space normals for lens direction.
    // For disk mode (void-disk): lensing is handled above using diskDist.
    // ═══════════════════════════════════════════════════════════════════════════════
    vec2 screenUV = gl_FragCoord.xy / uResolution;

    // Lensing direction: view-space normal .xy → screen-space direction.
    // Positive offset = sample further out = image appears pulled inward.
    vec2 lensDir = normal.xy;
    float lensMag = length(lensDir);
    lensDir = lensMag > 0.001 ? lensDir / lensMag : vec2(0.0);

    // Event horizon boundary — below this = absolute black, above = lensing
    float horizonEdge = 0.45;

    // Lensing strength ramps up beyond the horizon
    // Scale by vInstanceAlpha so lensing fades gradually during exit (not binary pop)
    float lensMask = smoothstep(horizonEdge, horizonEdge + 0.30, smoothEdge);
    float lensAmount = lensMask * 0.06 * uIntensity / 1.5 * vInstanceAlpha;

    // Event horizon mask: 0 = pure black, 1 = shows lensed background
    // Fade toward 1.0 (show unwarped bg) as instance fades out
    float horizonMask = mix(1.0, smoothstep(horizonEdge - 0.05, horizonEdge + 0.10, smoothEdge), vInstanceAlpha);

    // Sample lensed background with subtle chromatic aberration (wavelength-dependent bending)
    vec3 lensedBg = vec3(0.0);
    if (uHasBackground == 1) {
        vec2 lensOffset = lensDir * lensAmount;
        float chrAb = lensAmount * 0.08;  // Subtle prismatic shift, not rainbow
        lensedBg.r = texture2D(uBackgroundTexture, screenUV + lensOffset + lensDir * chrAb).r;
        lensedBg.g = texture2D(uBackgroundTexture, screenUV + lensOffset).g;
        lensedBg.b = texture2D(uBackgroundTexture, screenUV + lensOffset - lensDir * chrAb).b;
    }

    // Composite: black center + gravitationally lensed edges
    vec3 color = lensedBg * horizonMask;

    // ═══════════════════════════════════════════════════════════════════════════════
    // PHOTON RING — thin bright emission at the horizon boundary
    // Photons in unstable orbits pile up at the photon sphere, creating
    // the bright ring visible in the reference image.
    // ═══════════════════════════════════════════════════════════════════════════════
    float ring = smoothstep(horizonEdge - 0.10, horizonEdge, smoothEdge)
               * smoothstep(horizonEdge + 0.08, horizonEdge, smoothEdge);
    ring = pow(ring, 1.5);

    // Shimmer — photons in unstable orbit
    float shimmer = 0.9 + 0.1 * sin(instanceTime * 2.5 + smoothEdge * 25.0 + smoothNoise * 10.0);
    ring *= shimmer;

    // Doppler asymmetry — rotating singularity brightens the approaching side.
    // Uses object-space vertex angle (pre-computed in vertex shader).
    // Subtle: dim side still at 65% — must preserve circular read.
    float dopplerAngle = vDopplerAngleXZ;
    float dopplerPhase = dopplerAngle + instanceTime * 0.4;  // Slow rotation
    float doppler = 0.82 + 0.18 * sin(dopplerPhase);         // 0.64 to 1.0 range
    ring *= doppler;

    // Warm amber photon ring — gravitationally redshifted photons
    // Slightly hotter than overlay edge emission to read as distinct ring
    vec3 ringBase   = vec3(0.90, 0.55, 0.15);
    vec3 ringBright = vec3(1.00, 0.90, 0.65);
    vec3 ringColor  = mix(ringBase, ringBright, pow(ring, 2.0));

    float softCap = uBloomThreshold + 0.30;
    float ringBrightness = min(1.5, softCap) * uEdgeGlow;
    color += ringColor * ring * ringBrightness * vInstanceAlpha;

    // ═══════════════════════════════════════════════════════════════════════════════
    // VISIBILITY — discard invisible pixels, everything else is fully opaque.
    // Lensing, horizon mask, and photon ring all scale by vInstanceAlpha above,
    // so elements fade gracefully during exit instead of binary popping.
    // ═══════════════════════════════════════════════════════════════════════════════

    // Instance fade — gradual (lensing already scaled by vInstanceAlpha)
    if (vInstanceAlpha < 0.02) discard;

    // Arc visibility (for vortex/relay effects)
    if (vArcVisibility < 0.999) {
        if (vArcVisibility < 0.05) discard;
    }

    // Cutout/grain reduce alpha to create holes (tears in spacetime).
    // Visible pixels are ALWAYS alpha=1.0. Low-alpha pixels are discarded.
    float alpha = 1.0;
    ${CUTOUT_GLSL}
    alpha *= trailAlpha;
    ${GRAIN_GLSL}

    // Binary: visible (alpha=1) or discarded. No partial transparency.
    if (alpha < 0.1) discard;

    // ═══════════════════════════════════════════════════════════════════════════════
    // FINAL OUTPUT — always opaque
    // Color already composited: black center + lensed edges + photon ring
    // ═══════════════════════════════════════════════════════════════════════════════
    gl_FragColor = vec4(color, 1.0);
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// MATERIAL FACTORY
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Create an instanced procedural void material (black hole singularity)
 *
 * @param {Object} options - Configuration options
 * @param {number} [options.depth=0.5] - Master parameter (0=spatial tear, 0.5=dark mass, 1=singularity)
 * @param {number} [options.intensity] - Lensing strength + photon ring (derived from depth if not set)
 * @param {number} [options.opacity=0.95] - Base opacity
 * @param {number} [options.tendrilSpeed] - Breathing speed (derived from depth if not set)
 * @param {number} [options.edgeGlow] - Photon ring brightness (derived from depth if not set)
 * @param {number} [options.fadeInDuration=0.2] - Spawn fade duration (seconds)
 * @param {number} [options.fadeOutDuration=0.4] - Exit fade duration (seconds)
 * @returns {THREE.ShaderMaterial}
 */
export function createInstancedVoidMaterial(options = {}) {
    const {
        depth = VOID_DEFAULTS.depth,
        intensity = null,
        opacity = VOID_DEFAULTS.opacity,
        tendrilSpeed = null,
        edgeGlow = null,
        fadeInDuration = VOID_DEFAULTS.fadeInDuration,
        fadeOutDuration = VOID_DEFAULTS.fadeOutDuration
    } = options;

    // Derive depth-dependent parameters
    const derived = deriveVoidParameters(depth, {
        intensity, tendrilSpeed, edgeGlow
    });

    const material = new THREE.ShaderMaterial({
        uniforms: {
            // Instancing uniforms
            uGlobalTime: { value: 0 },
            uFadeInDuration: { value: fadeInDuration },
            uFadeOutDuration: { value: fadeOutDuration },
            // Animation uniforms (cutout, glow, etc. from shared core)
            ...createAnimationUniforms(),
            // Void uniforms
            uDiskMode: { value: 0 },
            uDepth: { value: depth },
            uIntensity: { value: derived.intensity },
            uOpacity: { value: opacity },
            uTendrilSpeed: { value: derived.tendrilSpeed },
            uEdgeGlow: { value: derived.edgeGlow },
            uBloomThreshold: { value: 0.85 },
            uRelayCount: { value: 3 },
            uRelayArcWidth: { value: 3.14159 },
            uRelayFloor: { value: 0.0 },
            // Screen-space gravitational lensing
            uBackgroundTexture: { value: null },
            uResolution: { value: new THREE.Vector2(1, 1) },
            uHasBackground: { value: 0 }
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,       // Needed for arc discard path
        blending: THREE.NormalBlending,
        depthWrite: true,
        side: THREE.DoubleSide
    });

    material.userData.depth = depth;
    material.userData.elementalType = 'void';
    material.userData.isProcedural = true;
    material.userData.isInstanced = true;
    material.userData.needsRefraction = true; // Register for screen-space background pass

    return material;
}

/**
 * Update the global time uniform for instanced void material.
 * Also handles gesture progress and glow ramping via shared animation system.
 * @param {THREE.ShaderMaterial} material - Instanced void material
 * @param {number} time - Current global time in seconds
 * @param {number} [gestureProgress=0] - Gesture progress 0-1 (for arc animation)
 */
export function updateInstancedVoidMaterial(material, time, gestureProgress = 0) {
    if (material?.uniforms?.uGlobalTime) {
        material.uniforms.uGlobalTime.value = time;
    }
    // Use shared animation system for gesture progress and glow ramping
    updateAnimationProgress(material, gestureProgress);
}

/**
 * Set depth on existing instanced void material.
 * Updates all depth-dependent parameters (intensity, animation speed, photon ring).
 * @param {THREE.ShaderMaterial} material - Instanced void material
 * @param {number} depth - New depth level (0-1)
 */
export function setInstancedVoidDepth(material, depth) {
    if (!material?.uniforms) return;

    const derived = deriveVoidParameters(depth);
    material.uniforms.uDepth.value = depth;
    material.uniforms.uIntensity.value = derived.intensity;
    material.uniforms.uTendrilSpeed.value = derived.tendrilSpeed;
    material.uniforms.uEdgeGlow.value = derived.edgeGlow;
    material.userData.depth = depth;
}

/**
 * Set per-mascot bloom threshold for void elements.
 * @param {THREE.ShaderMaterial} material - Instanced void material
 * @param {number} threshold - Bloom threshold (0.35 for crystal/heart/rough, 0.85 for moon/star)
 */
export function setInstancedVoidBloomThreshold(material, threshold) {
    if (material?.uniforms?.uBloomThreshold) {
        material.uniforms.uBloomThreshold.value = threshold;
    }
}

/**
 * Configure shader animation for void elements.
 * Uses the shared animation system from InstancedAnimationCore.
 * @param {THREE.ShaderMaterial} material - Instanced void material
 * @param {Object} config - Animation config (see InstancedAnimationCore.setShaderAnimation)
 */
export const setInstancedVoidArcAnimation = setShaderAnimation;

/**
 * Configure gesture-driven glow ramping for void effects.
 * @param {THREE.ShaderMaterial} material - Instanced void material
 * @param {Object} config - Glow configuration (see InstancedAnimationCore.setGestureGlow)
 */
export function setInstancedVoidGestureGlow(material, config) {
    setGestureGlow(material, config);
}

/**
 * Configure cutout effect for void elements.
 * @param {THREE.ShaderMaterial} material - Instanced void material
 * @param {number|Object} config - Cutout strength (0-1) or config object
 */
export function setInstancedVoidCutout(material, config) {
    setCutout(material, config);
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
export { ANIMATION_TYPES, CUTOUT_PATTERNS, CUTOUT_BLEND, CUTOUT_TRAVEL, GRAIN_TYPES, GRAIN_BLEND, setShaderAnimation, setGestureGlow, setGlowScale, setCutout, resetCutout, setGrain, resetGrain, resetAnimation };

export default {
    createInstancedVoidMaterial,
    updateInstancedVoidMaterial,
    setInstancedVoidDepth,
    setInstancedVoidBloomThreshold,
    setInstancedVoidGestureGlow,
    setInstancedVoidCutout,
    setInstancedVoidArcAnimation,
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
