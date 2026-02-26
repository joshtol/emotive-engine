/**
 * =================================================================================================
 *  emotive ENGINE - Void Particle Material
 * =================================================================================================
 *
 * @fileoverview GPU-instanced billboard shader for void/darkness particles.
 * @module materials/VoidParticleMaterial
 *
 * Same GPU-deterministic vertex shader as smoke/mist/spray but optimized for
 * inky black void particles.
 *
 * Uses premultiplied alpha blending with near-zero neutral color:
 *   output = vec4(ink * alpha, alpha)  where ink ≈ vec3(0.01)
 *   result = ink*alpha + dest*(1-alpha) ≈ dest*(1-alpha)
 *
 * This effectively darkens the background toward black with no color tint.
 * The tiny neutral color (equal RGB) ensures particles are minimally visible
 * even on very dark backgrounds — no purple/blue bias.
 *
 * Fragment shader: alcohol ink aesthetic — dense organic blobs with defined
 * edges, internal fracture channels that split each blob into sub-pools,
 * and rim darkening where pigment concentrates at boundaries.
 * 2-octave noise for boundary perturbation + 1 for internal fractures.
 */

import * as THREE from 'three';

// =================================================================================================
// SHARED VERTEX SHADER (same as smoke/mist/spray — GPU-deterministic billboard)
// =================================================================================================

const PARTICLE_VERTEX_GLSL = /* glsl */ `
attribute vec3 aSpawnPos;
attribute vec3 aSpawnVelocity;
attribute float aSpawnTime;
attribute float aLifetime;
attribute float aSize;
attribute float aRotation;
attribute float aSeed;

uniform float uTime;
uniform float uBuoyancy;
uniform float uDrag;
uniform float uTurbulenceStrength;
uniform float uEndSizeMultiplier;
uniform float uRotationSpeedMax;
uniform float uGravityStrength;
uniform vec3 uGravityCenter;

varying vec2 vUv;
varying float vLife;
varying float vSeed;

float sizeOverLife(float life) {
    return 0.3 + 0.7 * (smoothstep(0.0, 0.3, life) + 0.3 * smoothstep(0.3, 1.0, life));
}

void main() {
    float age = uTime - aSpawnTime;
    float life = clamp(age / aLifetime, 0.0, 1.0);

    vUv = position.xy + 0.5;
    vLife = life;
    vSeed = aSeed;

    float dragDecay = 1.0 - exp(-uDrag * age);
    float invDrag = 1.0 / max(uDrag, 0.001);
    vec3 driftPos = aSpawnVelocity * dragDecay * invDrag;

    float buoyancyDisp = uBuoyancy * (age - dragDecay * invDrag);

    float turbT = age * 1.3 + aSeed * 100.0;
    float turbX = sin(turbT) * cos(turbT * 0.7 + 3.0);
    float turbZ = cos(turbT * 1.1) * sin(turbT * 0.6 + 1.7);
    vec3 turbulence = vec3(turbX, 0.0, turbZ) * uTurbulenceStrength * age * 0.5;

    vec3 worldPos = aSpawnPos + driftPos + vec3(0.0, buoyancyDisp, 0.0) + turbulence;

    // Gravity: drag-limited acceleration toward uGravityCenter
    // Direction computed from DRIFTED position (worldPos), not aSpawnPos —
    // particles spawn near mascot center so aSpawnPos ≈ gravityCenter,
    // giving no useful direction. After drift, worldPos is offset and
    // pullDir correctly points back inward.
    if (uGravityStrength > 0.0) {
        vec3 toCenter = uGravityCenter - worldPos;
        float dist = length(toCenter);
        if (dist > 0.01) {
            vec3 pullDir = toCenter / dist;
            float gravDisp = uGravityStrength * (age - dragDecay * invDrag);
            worldPos += pullDir * gravDisp;
        }
    }

    float size = aSize * mix(1.0, uEndSizeMultiplier, sizeOverLife(life));

    float rotSpeed = (fract(aSeed * 7.31) - 0.5) * 2.0 * uRotationSpeedMax;
    float rot = aRotation + rotSpeed * age;
    float c = cos(rot), s = sin(rot);
    vec2 rotated = mat2(c, s, -s, c) * position.xy;

    vec4 viewPos = viewMatrix * vec4(worldPos, 1.0);
    viewPos.xy += rotated * size;

    gl_Position = projectionMatrix * viewPos;
}
`;

// =================================================================================================
// VOID FRAGMENT SHADER — inky black with organic edges
// =================================================================================================

const VOID_FRAGMENT_GLSL = /* glsl */ `
uniform float uOpacity;
uniform float uTime;

varying vec2 vUv;
varying float vLife;
varying float vSeed;

float vHash(vec2 p) {
    float h = dot(p, vec2(127.1, 311.7));
    return fract(sin(h) * 43758.5453);
}

float vNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = vHash(i);
    float b = vHash(i + vec2(1.0, 0.0));
    float c = vHash(i + vec2(0.0, 1.0));
    float d = vHash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main() {
    vec2 center = vUv - 0.5;
    float dist = length(center);

    // Billboard clip — tight feather, not wide gradient
    float clipFade = 1.0 - smoothstep(0.40, 0.46, dist);
    if (clipFade < 0.01) discard;

    // ═══ SHAPE FIELD ═══
    // All detail lives in the boundary shape (WHERE the threshold cuts).
    // Result will be thresholded into binary ink-or-void.

    // Per-particle orientation and shape from seed
    float tendrilAngle = vSeed * 6.283;
    vec2 tendrilDir = vec2(cos(tendrilAngle), sin(tendrilAngle));
    vec2 tendrilPerp = vec2(-tendrilDir.y, tendrilDir.x);

    // Seed-driven stretch: elongated vs round blobs
    float stretchAlong = 0.5 + fract(vSeed * 3.17) * 0.3;
    float stretchAcross = 1.0 + fract(vSeed * 7.53) * 0.5;

    float along = dot(center, tendrilDir);
    float across = dot(center, tendrilPerp);
    float anisoDist = length(vec2(along * stretchAlong, across * stretchAcross));

    // ═══ TIME DRIFT ═══
    // Slow organic undulation — ink spreading on wet paper.
    // Each octave drifts at different speed/direction for counterflow.
    float freqMod = 0.8 + fract(vSeed * 11.3) * 0.4;
    float seedOff = vSeed * 73.0;
    float t = uTime * 0.45;  // Visible undulation — living ink
    vec2 drift1 = vec2(t * 0.7, -t * 0.5);           // Large-scale: slow diagonal
    vec2 drift2 = vec2(-t * 1.1, t * 0.8);            // Medium: counter-drift
    vec2 drift3 = vec2(t * 0.6, t * 1.5);             // Fine: faster perpendicular

    // 3-octave noise for organic boundary perturbation
    float n1 = vNoise(center * 3.0 * freqMod + seedOff + drift1);
    float n2 = vNoise(center * 7.0 * freqMod + seedOff * 1.7 + vec2(3.7, 1.2) + drift2);
    float n3 = vNoise(center * 15.0 * freqMod + seedOff * 2.9 + vec2(1.3, 5.1) + drift3);
    float noiseField = n1 * 0.45 + n2 * 0.35 + n3 * 0.20;

    // Noise-perturbed distance — organic blob boundary
    float perturbedDist = anisoDist + (noiseField - 0.45) * 0.30;

    // Raw shape: where ink could exist (before binary cuts)
    float rawShape = 1.0 - smoothstep(0.08, 0.26, perturbedDist);

    // ═══ BINARY CUTS ═══
    // Fractures and density are hard masks — transparent gaps, not alpha fades.
    // This is what makes ink look like ink: pigment IS or ISN'T deposited.

    // Fracture channels: hard transparent veins splitting blob into sub-pools
    // Fractures drift slower than boundary — veins migrate, not vibrate
    vec2 fracDrift1 = vec2(-t * 0.8, t * 0.5);
    vec2 fracDrift2 = vec2(t * 0.9, t * 1.2);
    float fracNoise = vNoise(center * 5.0 * freqMod + seedOff * 2.1 + fracDrift1);
    float fracNoise2 = vNoise(center * 9.0 * freqMod + seedOff * 3.7 + vec2(2.1, 4.3) + fracDrift2);
    // Two-scale fractures: wide primary splits + fine secondary cracks
    float fracture = min(
        smoothstep(0.18, 0.25, fracNoise),      // Wide primary veins
        smoothstep(0.12, 0.18, fracNoise2)       // Fine secondary cracks
    );
    rawShape *= fracture;

    // Ink density: hard cutoff — thin areas are GONE, not faded
    // Uses the already-animated noiseField, so density boundary undulates with shape
    float inkDensity = smoothstep(0.32, 0.42, noiseField);
    rawShape *= inkDensity;

    // ═══ BINARY THRESHOLD ═══
    // Collapse the raw shape into ink-or-void.
    // All the organic detail above determines WHERE this threshold cuts.
    // Interior is near-opaque, exterior is transparent. No grey zone.
    float inkMask = smoothstep(0.12, 0.35, rawShape);

    // ═══ EDGE FEATHER ═══
    // Thin rim-softening at the ink boundary prevents aliasing.
    // Only the outermost few percent get feathered — interior stays solid.
    float edgeFeather = smoothstep(0.26, 0.16, perturbedDist);
    inkMask *= edgeFeather;

    // ═══ LIFE FADE + OPACITY ═══
    // Applied AFTER thresholding: fading particles go from "dark ink"
    // to "dark ink dissolving" — not "grey getting lighter."
    float fadeIn = smoothstep(0.0, 0.08, vLife);
    float fadeOut = 1.0 - smoothstep(0.50, 1.0, vLife);

    float alpha = inkMask * fadeIn * fadeOut * clipFade * uOpacity;
    if (alpha < 0.01) discard;

    // ═══ TONAL GRADIENT ═══
    // Rim = darkest (pigment pools at boundary as solvent evaporates).
    // Core = slightly brighter (thinner ink deposit).
    float depthInBlob = smoothstep(0.26, 0.06, perturbedDist);
    float tone = mix(0.002, 0.025, depthInBlob * depthInBlob);
    gl_FragColor = vec4(vec3(tone) * alpha, alpha);
}
`;

// =================================================================================================
// MATERIAL FACTORY
// =================================================================================================

export function createVoidParticleMaterial(config) {
    return new THREE.ShaderMaterial({
        name: 'VoidParticle',
        uniforms: {
            uTime: { value: 0.0 },
            uOpacity: { value: config.opacity ?? 0.85 },
            uBuoyancy: { value: config.buoyancy ?? -0.04 },
            uDrag: { value: config.drag ?? 0.3 },
            uTurbulenceStrength: { value: config.turbulence ?? 0.02 },
            uEndSizeMultiplier: { value: config.endSizeMultiplier ?? 2.5 },
            uRotationSpeedMax: { value: config.rotationSpeedMax ?? 0.1 },
            uGravityStrength: { value: config.gravityStrength ?? 0.0 },
            uGravityCenter: { value: new THREE.Vector3(0, 0, 0) },
        },
        vertexShader: PARTICLE_VERTEX_GLSL,
        fragmentShader: VOID_FRAGMENT_GLSL,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        side: THREE.DoubleSide,
        // Premultiplied alpha — same as smoke/mist/spray.
        // With ink ≈ vec3(0.01), this effectively darkens the background
        // while keeping particles minimally visible on dark areas.
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
        blendSrcAlpha: THREE.OneFactor,
        blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
    });
}
