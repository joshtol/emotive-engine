/**
 * =================================================================================================
 *  emotive ENGINE - Mist Particle Material
 * =================================================================================================
 *
 * @fileoverview GPU-instanced billboard shader for cold mist/fog particles.
 * @module materials/MistParticleMaterial
 *
 * Same GPU-deterministic architecture as SmokeParticleMaterial but tuned for
 * cold ground fog: slower, more transparent, larger, sinking, pale blue-white.
 *
 * Key differences from smoke:
 *   - Softer shape (wider falloff, pow shaping)
 *   - Wider noise perturbation for wispier edges
 *   - Slower fade in/out (20% in, 40% out)
 *   - Constant pale color (no warm-to-cool shift)
 *   - Much lower opacity (0.10 vs 0.40)
 */

import * as THREE from 'three';

// =================================================================================================
// SHARED VERTEX SHADER (identical to smoke — GPU-deterministic billboard)
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
// MIST FRAGMENT SHADER
// =================================================================================================

const MIST_FRAGMENT_GLSL = /* glsl */ `
uniform float uOpacity;
uniform vec3 uColor;

varying vec2 vUv;
varying float vLife;
varying float vSeed;

float pHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float pNoise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(pHash(i), pHash(i + vec2(1.0, 0.0)), f.x),
               mix(pHash(i + vec2(0.0, 1.0)), pHash(i + vec2(1.0, 1.0)), f.x), f.y);
}

void main() {
    vec2 center = vUv - 0.5;

    // Per-particle wisp direction — each particle stretches differently
    float wispAngle = vSeed * 6.283;
    vec2 wispDir = vec2(cos(wispAngle), sin(wispAngle));
    vec2 wispPerp = vec2(-wispDir.y, wispDir.x);

    // Anisotropic distance: stretch along wisp direction for tendril shape
    float along = dot(center, wispDir);
    float across = dot(center, wispPerp);
    float anisoDist = length(vec2(along * 0.7, across * 1.3));

    // 3-octave FBM for organic cloud structure
    float seedOff = vSeed * 73.0;
    float fbm = pNoise(center * 3.0 + seedOff) * 0.50
              + pNoise(center * 7.0 + seedOff * 1.7 + vec2(3.7, 1.2)) * 0.25
              + pNoise(center * 14.0 + seedOff * 2.3 + vec2(7.1, 5.3)) * 0.125;

    // Shape: anisotropic falloff with FBM erosion at edges
    float shape = 1.0 - smoothstep(0.05, 0.42, anisoDist + (fbm - 0.4) * 0.20);

    // Internal density variation — wisps and gaps through the body
    float density = smoothstep(0.25, 0.55, fbm);
    shape *= mix(0.3, 1.0, density);

    // Fade over lifetime
    float fadeIn = smoothstep(0.0, 0.15, vLife);
    float fadeOut = 1.0 - smoothstep(0.60, 1.0, vLife);
    float lifeAlpha = fadeIn * fadeOut;

    float alpha = shape * lifeAlpha * uOpacity;
    if (alpha < 0.003) discard;

    // Premultiplied alpha output — constant pale color
    gl_FragColor = vec4(uColor * alpha, alpha);
}
`;

// =================================================================================================
// MATERIAL FACTORY
// =================================================================================================

export function createMistParticleMaterial(config) {
    return new THREE.ShaderMaterial({
        name: 'MistParticle',
        uniforms: {
            uTime: { value: 0.0 },
            uOpacity: { value: config.opacity ?? 0.1 },
            uColor: { value: new THREE.Color(...(config.color ?? [0.75, 0.85, 0.95])) },
            uBuoyancy: { value: config.buoyancy ?? -0.02 },
            uDrag: { value: config.drag ?? 0.8 },
            uTurbulenceStrength: { value: config.turbulence ?? 0.08 },
            uEndSizeMultiplier: { value: config.endSizeMultiplier ?? 1.5 },
            uRotationSpeedMax: { value: config.rotationSpeedMax ?? 0.4 },
        },
        vertexShader: PARTICLE_VERTEX_GLSL,
        fragmentShader: MIST_FRAGMENT_GLSL,
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
