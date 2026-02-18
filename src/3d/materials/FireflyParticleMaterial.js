/**
 * =================================================================================================
 *  emotive ENGINE - Firefly Particle Material
 * =================================================================================================
 *
 * @fileoverview GPU-instanced billboard shader for firefly/mote-of-light particles.
 * @module materials/FireflyParticleMaterial
 *
 * Same GPU-deterministic vertex shader as smoke/mist/spray (no gravity).
 * Fragment shader creates twinkling firefly points of light:
 *   - Tiny bright core with soft radial glow halo
 *   - Per-particle blink cycle: sharp flash-on (~80ms), slow exponential fade (~1.5s)
 *   - Random phase per particle (aSeed) so they blink independently
 *   - Warm golden base color, shifting toward white at peak brightness
 *   - AdditiveBlending (pure light emission)
 */

import * as THREE from 'three';

// =================================================================================================
// VERTEX SHADER (same GPU-deterministic billboard as smoke/mist/spray)
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

    // Turbulence: deterministic sinusoidal brownian drift
    float turbT = age * 1.3 + aSeed * 100.0;
    float turbX = sin(turbT) * cos(turbT * 0.7 + 3.0);
    float turbZ = cos(turbT * 1.1) * sin(turbT * 0.6 + 1.7);
    vec3 turbulence = vec3(turbX, 0.0, turbZ) * uTurbulenceStrength * age * 0.5;

    vec3 worldPos = aSpawnPos + driftPos + vec3(0.0, buoyancyDisp, 0.0) + turbulence;

    float size = aSize * mix(1.0, uEndSizeMultiplier, sizeOverLife(life));

    // No rotation for point lights — but keep attribute for compatibility
    vec2 rotated = position.xy;

    vec4 viewPos = viewMatrix * vec4(worldPos, 1.0);
    viewPos.xy += rotated * size;

    gl_Position = projectionMatrix * viewPos;
}
`;

// =================================================================================================
// FIREFLY FRAGMENT SHADER
// =================================================================================================

const FIREFLY_FRAGMENT_GLSL = /* glsl */`
uniform float uOpacity;
uniform float uTime;
uniform vec3 uColor;

varying vec2 vUv;
varying float vLife;
varying float vSeed;

void main() {
    vec2 center = vUv - 0.5;
    float dist = length(center);
    float ang = atan(center.y, center.x);

    // ═══ TWINKLE STAR SHAPE ═══
    // 4-pointed star cross radiating from center — not a round blob.
    // Star rays extend further than the circular core.
    float star4 = pow(abs(cos(ang * 2.0)), 10.0);      // 4-pointed cross pattern
    float starExtend = star4 * 0.15;                     // Rays extend 0.15 beyond core

    // Bright core (small tight center)
    float core = smoothstep(0.10, 0.0, dist);

    // Star rays: thin spikes along 4 axes
    float starRays = smoothstep(0.10 + starExtend, 0.0, dist) * 0.6;

    // Faint circular glow halo around star
    float glow = smoothstep(0.40, 0.0, dist) * 0.15;

    float shape = core + starRays + glow;

    // Billboard clip
    if (shape < 0.005) discard;

    // ═══ TWINKLE CYCLE ═══
    // Two overlapping sine waves at different frequencies create an irregular
    // beat pattern — brief bright flashes when both waves align, dark gaps
    // between. Looks like real twinkling / sparkle, not slow bioluminescence.

    float freq1 = 1.5 + vSeed * 1.0;                    // 1.5-2.5 Hz per particle
    float freq2 = 2.3 + vSeed * 0.8;                    // 2.3-3.1 Hz (different rate)
    float phase1 = uTime * freq1 + vSeed * 12.0;
    float phase2 = uTime * freq2 + vSeed * 7.0;
    float beat = sin(phase1) * sin(phase2);

    // Sharp peaks: pow(4) makes flashes brief and intense
    float twinkle = pow(max(0.0, beat), 4.0);

    // Minimum glow floor so particles don't completely vanish
    twinkle = twinkle * 0.85 + 0.15;

    // ═══ LIFE FADE ═══
    float fadeIn = smoothstep(0.0, 0.15, vLife);
    float fadeOut = 1.0 - smoothstep(0.70, 1.0, vLife);

    // ═══ COLOR ═══
    // Warm golden at low brightness, shifts toward white at peak twinkle
    vec3 color = mix(uColor, vec3(1.0, 0.98, 0.90), twinkle * 0.5);

    float alpha = shape * twinkle * fadeIn * fadeOut * uOpacity;
    if (alpha < 0.003) discard;

    // Additive blending: output color * alpha (premultiplied for additive)
    gl_FragColor = vec4(color * alpha, alpha);
}
`;

// =================================================================================================
// MATERIAL FACTORY
// =================================================================================================

export function createFireflyParticleMaterial(config) {
    return new THREE.ShaderMaterial({
        name: 'FireflyParticle',
        uniforms: {
            uTime:               { value: 0.0 },
            uOpacity:            { value: config.opacity ?? 0.85 },
            uColor:              { value: new THREE.Color(...(config.color || [1.0, 0.85, 0.4])) },
            uBuoyancy:           { value: config.buoyancy ?? 0.01 },
            uDrag:               { value: config.drag ?? 0.8 },
            uTurbulenceStrength: { value: config.turbulence ?? 0.15 },
            uEndSizeMultiplier:  { value: config.endSizeMultiplier ?? 0.8 },
            uRotationSpeedMax:   { value: config.rotationSpeedMax ?? 0.0 },
        },
        vertexShader: PARTICLE_VERTEX_GLSL,
        fragmentShader: FIREFLY_FRAGMENT_GLSL,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        side: THREE.DoubleSide,
        // Additive blending — pure light emission, stacks naturally
        blending: THREE.AdditiveBlending,
    });
}
