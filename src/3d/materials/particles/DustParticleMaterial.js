/**
 * =================================================================================================
 *  emotive ENGINE - Dust & Gravel Particle Material
 * =================================================================================================
 *
 * @fileoverview GPU-instanced billboard shader for earth dust motes and falling gravel.
 * @module materials/DustParticleMaterial
 *
 * Same GPU-deterministic vertex shader as smoke/mist/spray/firefly.
 * Fragment shader creates gritty earth particles:
 *   - Irregular angular shapes (noise-eroded edges, not smooth circles)
 *   - Per-particle variation via aSeed (shape, brightness, opacity)
 *   - Matte opaque appearance — NOT glowing or translucent
 *   - Supports both dust (fine, wispy) and gravel (chunky, angular)
 *   - Premultiplied alpha blending for correct compositing over scene
 *
 * Used by 'earth-dust' and 'earth-gravel' atmospheric presets.
 * Dust rises slowly with high turbulence (disturbed earth settling).
 * Gravel falls with gravity (debris from impacts/tremors).
 */

import * as THREE from 'three';

// =================================================================================================
// VERTEX SHADER (same GPU-deterministic billboard as smoke/mist/spray/firefly)
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
uniform float uGravity;

varying vec2 vUv;
varying float vLife;
varying float vSeed;

float sizeOverLife(float life) {
    // Dust: appear small, grow slightly, shrink at end
    // Gravel: appear full size, no growth
    return smoothstep(0.0, 0.15, life) * (1.0 - 0.3 * smoothstep(0.7, 1.0, life));
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

    // Buoyancy (upward for dust) + Gravity (downward for gravel)
    float buoyancyDisp = uBuoyancy * (age - dragDecay * invDrag);
    float gravityDisp = -uGravity * age * age * 0.5;

    // Turbulence: deterministic sinusoidal brownian drift
    float turbT = age * 1.3 + aSeed * 100.0;
    float turbX = sin(turbT) * cos(turbT * 0.7 + 3.0);
    float turbZ = cos(turbT * 1.1) * sin(turbT * 0.6 + 1.7);
    vec3 turbulence = vec3(turbX, 0.0, turbZ) * uTurbulenceStrength * age * 0.5;

    vec3 worldPos = aSpawnPos + driftPos + vec3(0.0, buoyancyDisp + gravityDisp, 0.0) + turbulence;

    float size = aSize * mix(1.0, uEndSizeMultiplier, sizeOverLife(life));

    // Rotation for angular debris
    float angle = aRotation + age * uRotationSpeedMax * (aSeed - 0.5) * 2.0;
    float c = cos(angle);
    float s = sin(angle);
    vec2 rotated = vec2(
        position.x * c - position.y * s,
        position.x * s + position.y * c
    );

    vec4 viewPos = viewMatrix * vec4(worldPos, 1.0);
    viewPos.xy += rotated * size;

    gl_Position = projectionMatrix * viewPos;
}
`;

// =================================================================================================
// DUST/GRAVEL FRAGMENT SHADER
// =================================================================================================

const DUST_FRAGMENT_GLSL = /* glsl */ `
uniform float uOpacity;
uniform float uTime;
uniform vec3 uColor;
uniform vec3 uColorVariant;

varying vec2 vUv;
varying float vLife;
varying float vSeed;

// Simple hash for shape noise
float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
}

void main() {
    vec2 center = vUv - 0.5;
    float dist = length(center);

    // ═══ SOFT MOTE SHAPE ═══
    // Smooth radial falloff — dust reads as out-of-focus floating motes,
    // not sharp geometric debris. Slight angular wobble keeps them organic.
    float ang = atan(center.y, center.x);
    float wobble = sin(ang * 3.0 + vSeed * 20.0) * 0.04;  // Subtle, not angular
    float effectiveRadius = 0.38 + wobble;

    // Soft Gaussian-like falloff — core opaque, edges dissolve
    float shape = smoothstep(effectiveRadius, effectiveRadius * 0.15, dist);

    // Billboard clip
    if (shape < 0.01) discard;

    // ═══ SURFACE TEXTURE ═══
    // Very subtle brightness variation — dust is mostly uniform, not gritty
    float grain = hash21(floor(vUv * 8.0 + vSeed * 10.0));
    float surfaceVar = 0.92 + grain * 0.16;

    // ═══ LIFE FADE ═══
    float fadeIn = smoothstep(0.0, 0.10, vLife);
    float fadeOut = 1.0 - smoothstep(0.55, 1.0, vLife);  // Gradual dissipation — settling dust

    // ═══ COLOR ═══
    // Per-particle color variation — lerp between base and variant
    vec3 particleColor = mix(uColor, uColorVariant, vSeed);
    float seedVar = vSeed * 0.15;
    vec3 color = particleColor * surfaceVar * (0.9 + seedVar);

    // Gentle center brightening — dust motes catch light at core
    color *= mix(0.85, 1.0, smoothstep(effectiveRadius, 0.0, dist));

    float alpha = shape * fadeIn * fadeOut * uOpacity;
    if (alpha < 0.005) discard;

    // Premultiplied alpha output for correct compositing
    gl_FragColor = vec4(color * alpha, alpha);
}
`;

// =================================================================================================
// MATERIAL FACTORY
// =================================================================================================

export function createDustParticleMaterial(config) {
    return new THREE.ShaderMaterial({
        name: 'DustParticle',
        uniforms: {
            uTime: { value: 0.0 },
            uOpacity: { value: config.opacity ?? 0.75 },
            uColor: { value: new THREE.Color(...(config.color || [0.55, 0.45, 0.35])) },
            uColorVariant: {
                value: new THREE.Color(
                    ...(config.colorVariant || config.color || [0.55, 0.45, 0.35])
                ),
            },
            uBuoyancy: { value: config.buoyancy ?? 0.01 },
            uDrag: { value: config.drag ?? 0.8 },
            uTurbulenceStrength: { value: config.turbulence ?? 0.1 },
            uEndSizeMultiplier: { value: config.endSizeMultiplier ?? 0.6 },
            uRotationSpeedMax: { value: config.rotationSpeedMax ?? 1.5 },
            uGravity: { value: config.gravity ?? 0.0 },
        },
        vertexShader: PARTICLE_VERTEX_GLSL,
        fragmentShader: DUST_FRAGMENT_GLSL,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        side: THREE.DoubleSide,
        // Premultiplied alpha blending — correct compositing over scene
        blending: THREE.CustomBlending,
        blendEquation: THREE.AddEquation,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
    });
}
