/**
 * =================================================================================================
 *  emotive ENGINE - Smoke Particle Material
 * =================================================================================================
 *
 * @fileoverview GPU-instanced billboard shader for smoke particles.
 * @module materials/SmokeParticleMaterial
 *
 * GPU-deterministic design: all particle motion computed in vertex shader from
 * spawn-time constants + uTime. No per-frame CPU position updates.
 *
 * Attributes set ONCE at spawn (never updated):
 *   aSpawnPos, aSpawnVelocity, aSpawnTime, aLifetime, aSize, aRotation, aSeed
 *
 * Vertex shader computes current position via analytic integration:
 *   - Exponential drag on initial velocity
 *   - Buoyancy (upward acceleration, drag-limited)
 *   - Deterministic sinusoidal turbulence
 *   - Size growth over life (3.5x expansion)
 *   - Rotation from initial angle + seed-derived speed
 *   - Camera-facing billboard expansion in view space
 *
 * Fragment shader creates organic smoke puff:
 *   - Noise-perturbed radial distance for irregular silhouette
 *   - Quick fade in (10%), long hold, gradual fade out (45%)
 *   - Color shift: warm grey near fire → cool grey dissipating
 *   - Premultiplied alpha output
 */

import * as THREE from 'three';

// =================================================================================================
// SHARED VERTEX SHADER (used by both smoke and mist)
// =================================================================================================

const PARTICLE_VERTEX_GLSL = /* glsl */`
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

varying vec2 vUv;
varying float vLife;
varying float vSeed;

// Size over life: fast growth then plateau
float sizeOverLife(float life) {
    return 0.3 + 0.7 * (smoothstep(0.0, 0.3, life) + 0.3 * smoothstep(0.3, 1.0, life));
}

void main() {
    float age = uTime - aSpawnTime;
    float life = clamp(age / aLifetime, 0.0, 1.0);

    vUv = position.xy + 0.5;
    vLife = life;
    vSeed = aSeed;

    // === POSITION: deterministic from spawn constants ===

    // Drag: v(t) = v0 * e^(-drag*t)
    // Integrated: p(t) = p0 + v0 * (1 - e^(-drag*t)) / drag
    float dragDecay = 1.0 - exp(-uDrag * age);
    float invDrag = 1.0 / max(uDrag, 0.001);
    vec3 driftPos = aSpawnVelocity * dragDecay * invDrag;

    // Buoyancy: constant upward accel, drag-limited
    float buoyancyDisp = uBuoyancy * (age - dragDecay * invDrag);

    // Turbulence: deterministic sinusoidal displacement
    float turbT = age * 1.3 + aSeed * 100.0;
    float turbX = sin(turbT) * cos(turbT * 0.7 + 3.0);
    float turbZ = cos(turbT * 1.1) * sin(turbT * 0.6 + 1.7);
    vec3 turbulence = vec3(turbX, 0.0, turbZ) * uTurbulenceStrength * age * 0.5;

    vec3 worldPos = aSpawnPos + driftPos + vec3(0.0, buoyancyDisp, 0.0) + turbulence;

    // === SIZE: grows over life ===
    float size = aSize * mix(1.0, uEndSizeMultiplier, sizeOverLife(life));

    // === ROTATION: initial angle + speed derived from seed ===
    float rotSpeed = (fract(aSeed * 7.31) - 0.5) * 2.0 * uRotationSpeedMax;
    float rot = aRotation + rotSpeed * age;
    float c = cos(rot), s = sin(rot);
    vec2 rotated = mat2(c, s, -s, c) * position.xy;

    // === BILLBOARD: expand in view space (always faces camera) ===
    vec4 viewPos = viewMatrix * vec4(worldPos, 1.0);
    viewPos.xy += rotated * size;

    gl_Position = projectionMatrix * viewPos;
}
`;

// =================================================================================================
// SMOKE FRAGMENT SHADER
// =================================================================================================

const SMOKE_FRAGMENT_GLSL = /* glsl */`
uniform float uOpacity;
uniform vec3 uColorWarm;
uniform vec3 uColorCool;

varying vec2 vUv;
varying float vLife;
varying float vSeed;

// Simple hash for noise perturbation
float hash(vec2 p) {
    float h = dot(p, vec2(127.1, 311.7));
    return fract(sin(h) * 43758.5453);
}

// Value noise (one octave)
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f); // smoothstep
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main() {
    // Center UV to [-0.5, 0.5]
    vec2 centered = vUv - 0.5;
    float dist = length(centered);

    // Noise-perturbed distance for irregular silhouette
    float angle = atan(centered.y, centered.x);
    float seed2 = vSeed * 17.3;
    float n = noise(vec2(angle * 2.0 + seed2, dist * 4.0 + seed2 * 0.7)) * 0.15
            + noise(vec2(angle * 4.0 - seed2 * 1.3, dist * 8.0 + seed2)) * 0.08;
    float perturbedDist = dist + n - 0.07;

    // Soft radial falloff — smoke puff shape
    float radial = 1.0 - smoothstep(0.15, 0.50, perturbedDist);

    // Life-based fade: quick in (10%), long hold, gradual out (last 45%)
    float fadeIn = smoothstep(0.0, 0.10, vLife);
    float fadeOut = 1.0 - smoothstep(0.55, 1.0, vLife);
    float lifeFade = fadeIn * fadeOut;

    // Combined alpha
    float alpha = radial * lifeFade * uOpacity;

    // Discard fully transparent fragments
    if (alpha < 0.003) discard;

    // Color: warm near birth → cool as it dissipates
    float colorShift = smoothstep(0.0, 0.6, vLife);
    vec3 color = mix(uColorWarm, uColorCool, colorShift);

    // Premultiplied alpha output (blending: ONE + ONE_MINUS_SRC_ALPHA)
    gl_FragColor = vec4(color * alpha, alpha);
}
`;

// =================================================================================================
// MATERIAL FACTORY
// =================================================================================================

export function createSmokeParticleMaterial(config) {
    return new THREE.ShaderMaterial({
        name: 'SmokeParticle',
        uniforms: {
            uTime:               { value: 0.0 },
            uOpacity:            { value: config.opacity ?? 0.40 },
            uColorWarm:          { value: new THREE.Color(...(config.colorWarm ?? [0.45, 0.38, 0.30])) },
            uColorCool:          { value: new THREE.Color(...(config.colorCool ?? [0.30, 0.30, 0.30])) },
            uBuoyancy:           { value: config.buoyancy ?? 0.3 },
            uDrag:               { value: config.drag ?? 1.5 },
            uTurbulenceStrength: { value: config.turbulence ?? 0.4 },
            uEndSizeMultiplier:  { value: config.endSizeMultiplier ?? 3.5 },
            uRotationSpeedMax:   { value: config.rotationSpeedMax ?? 1.5 },
        },
        vertexShader: PARTICLE_VERTEX_GLSL,
        fragmentShader: SMOKE_FRAGMENT_GLSL,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        side: THREE.DoubleSide,
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
        blendSrcAlpha: THREE.OneFactor,
        blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
    });
}
