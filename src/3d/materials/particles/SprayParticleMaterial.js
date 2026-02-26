/**
 * =================================================================================================
 *  emotive ENGINE - Spray Particle Material
 * =================================================================================================
 *
 * @fileoverview GPU-instanced billboard shader for water spray particles.
 * @module materials/SprayParticleMaterial
 *
 * Same GPU-deterministic vertex shader as smoke/mist but a fundamentally
 * different fragment shader: each billboard is a FIELD of many tiny scattered
 * bright specks — cell-based noise where only ~20% of cells contain a visible
 * droplet, creating a fine spray stipple pattern.
 *
 * Key differences from smoke/mist:
 *   - Many tiny bright specks per billboard (not one soft cloud)
 *   - Two-scale cell noise: coarse visible dots + fine sub-pixel shimmer
 *   - Soft radial fade so overlapping billboards blend seamlessly
 *   - Fast arc-and-fall trajectory (high speed, gravity, short life)
 *   - Premultiplied alpha, additive-ish: bright on dark, invisible on bright
 */

import * as THREE from 'three';

// =================================================================================================
// SHARED VERTEX SHADER (same as smoke/mist — GPU-deterministic billboard)
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
// SPRAY FRAGMENT SHADER — field of scattered bright specks per billboard
// =================================================================================================

const SPRAY_FRAGMENT_GLSL = /* glsl */ `
uniform float uOpacity;
uniform vec3 uColor;

varying vec2 vUv;
varying float vLife;
varying float vSeed;

float hash21(vec2 p) {
    p = fract(p * vec2(233.34, 851.73));
    p += dot(p, p + 23.45);
    return fract(p.x * p.y);
}

void main() {
    vec2 center = vUv - 0.5;
    float dist = length(center);

    // Soft radial fade — billboards blend seamlessly at overlapping edges
    float radialFade = 1.0 - smoothstep(0.15, 0.48, dist);
    if (radialFade < 0.01) discard;

    float seed = floor(vSeed * 1000.0);
    float totalDroplet = 0.0;

    // Scale 1: coarse droplets — ~6 cells across, ~20% contain a bright speck
    // At typical billboard size (~30px), each dot is ~1px — barely visible
    vec2 p1 = vUv * 6.0;
    vec2 cell1 = floor(p1);
    vec2 local1 = fract(p1);
    float presence1 = step(0.80, hash21(cell1 + seed));
    vec2 dropPos1 = vec2(hash21(cell1 * 1.7 + seed), hash21(cell1 * 2.3 + seed + 5.0));
    float d1 = length(local1 - dropPos1);
    float bright1 = 0.6 + 0.4 * hash21(cell1 * 5.3 + seed);
    totalDroplet += (1.0 - smoothstep(0.0, 0.22, d1)) * presence1 * bright1;

    // Scale 2: fine shimmer — ~12 cells across, ~15% occupied, dimmer
    vec2 p2 = vUv * 12.0 + 7.3;
    vec2 cell2 = floor(p2);
    vec2 local2 = fract(p2);
    float presence2 = step(0.85, hash21(cell2 + seed * 1.3));
    vec2 dropPos2 = vec2(hash21(cell2 * 1.9 + seed), hash21(cell2 * 3.1 + seed + 3.0));
    float d2 = length(local2 - dropPos2);
    float bright2 = 0.5 + 0.5 * hash21(cell2 * 7.1 + seed);
    totalDroplet += (1.0 - smoothstep(0.0, 0.15, d2)) * presence2 * bright2 * 0.5;

    totalDroplet = min(totalDroplet, 1.2);

    // Life fade: fast in, fast out
    float fadeIn = smoothstep(0.0, 0.08, vLife);
    float fadeOut = 1.0 - smoothstep(0.4, 1.0, vLife);
    float lifeFade = fadeIn * fadeOut;

    float alpha = totalDroplet * radialFade * lifeFade * uOpacity;
    if (alpha < 0.003) discard;

    // Premultiplied alpha output
    gl_FragColor = vec4(uColor * alpha, alpha);
}
`;

// =================================================================================================
// MATERIAL FACTORY
// =================================================================================================

export function createSprayParticleMaterial(config) {
    return new THREE.ShaderMaterial({
        name: 'SprayParticle',
        uniforms: {
            uTime: { value: 0.0 },
            uOpacity: { value: config.opacity ?? 0.1 },
            uColor: { value: new THREE.Color(...(config.color ?? [0.4, 0.7, 1.0])) },
            uBuoyancy: { value: config.buoyancy ?? -0.01 },
            uDrag: { value: config.drag ?? 1.2 },
            uTurbulenceStrength: { value: config.turbulence ?? 0.12 },
            uEndSizeMultiplier: { value: config.endSizeMultiplier ?? 1.3 },
            uRotationSpeedMax: { value: config.rotationSpeedMax ?? 0.6 },
        },
        vertexShader: PARTICLE_VERTEX_GLSL,
        fragmentShader: SPRAY_FRAGMENT_GLSL,
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
