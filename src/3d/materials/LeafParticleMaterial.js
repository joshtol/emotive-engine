/**
 * =================================================================================================
 *  emotive ENGINE - Leaf Particle Material
 * =================================================================================================
 *
 * @fileoverview GPU-instanced billboard shader for falling leaf particles.
 * @module materials/LeafParticleMaterial
 *
 * Same GPU-deterministic vertex shader as smoke/mist/spray/dust.
 * Fragment shader creates leaf-shaped silhouettes with 4 shape types:
 *   - Simple/willow: narrow pointed oval with serrated edges
 *   - Folded: asymmetric oval with one half curled under (darker underside + crease)
 *   - Folded oak: scalloped lobes with one half curled under
 *   - Round/aspen: wide nearly-circular with heart indent
 *   - Center vein line for organic detail
 *   - Per-particle color variation (golden, red-brown, green, burgundy)
 *   - Premultiplied alpha blending for correct compositing
 *
 * Used by 'falling-leaves' atmospheric preset.
 * Leaves tumble downward with high rotation and lateral drift.
 */

import * as THREE from 'three';

// =================================================================================================
// VERTEX SHADER (same GPU-deterministic billboard as smoke/mist/spray/dust)
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
uniform float uGravity;

varying vec2 vUv;
varying float vLife;
varying float vSeed;

float sizeOverLife(float life) {
    // Leaves: appear quickly, hold size, slight shrink as they settle
    return smoothstep(0.0, 0.08, life) * (1.0 - 0.15 * smoothstep(0.8, 1.0, life));
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

    // Buoyancy (negative for downward pull) + Gravity
    float buoyancyDisp = uBuoyancy * (age - dragDecay * invDrag);
    float gravityDisp = -uGravity * age * age * 0.5;

    // Turbulence: deterministic sinusoidal drift for side-to-side swaying
    float turbT = age * 1.3 + aSeed * 100.0;
    float turbX = sin(turbT) * cos(turbT * 0.7 + 3.0);
    float turbZ = cos(turbT * 1.1) * sin(turbT * 0.6 + 1.7);
    vec3 turbulence = vec3(turbX, 0.0, turbZ) * uTurbulenceStrength * age * 0.5;

    vec3 worldPos = aSpawnPos + driftPos + vec3(0.0, buoyancyDisp + gravityDisp, 0.0) + turbulence;

    float size = aSize * mix(1.0, uEndSizeMultiplier, sizeOverLife(life));

    // Rotation — fast tumbling like a real falling leaf
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
// LEAF FRAGMENT SHADER
// =================================================================================================

const LEAF_FRAGMENT_GLSL = /* glsl */`
uniform float uOpacity;
uniform float uTime;
uniform vec3 uColor;
uniform vec3 uColorVariant;

varying vec2 vUv;
varying float vLife;
varying float vSeed;

void main() {
    vec2 center = vUv - 0.5;

    // ═══ SHAPE SELECTION — 4 leaf types from seed ═══
    float shapeSeed = fract(vSeed * 2.37);
    float widthSeed = fract(vSeed * 3.71);
    float heightSeed = fract(vSeed * 5.93);

    int shapeType = int(floor(shapeSeed * 4.0));

    float edgeDist;
    float tipFade = 1.0;
    float foldMask = 0.0;      // >0 darkens folded half (underside)
    float creaseStrength = 0.0; // >0 adds bright crease line at fold

    if (shapeType == 0) {
        // ── SIMPLE LEAF — pointed oval (willow / birch) ──
        float leafHalfH = 0.34 + heightSeed * 0.10;
        float leafMaxW = 0.14 + widthSeed * 0.06;
        float yN = center.y / leafHalfH;
        if (abs(yN) > 1.0) discard;
        float asymmetry = 1.0 + yN * 0.12;
        float hw = leafMaxW * (1.0 - yN * yN) * asymmetry;
        hw += sin(yN * 12.0 + vSeed * 8.0) * 0.006 * (1.0 - yN * yN);
        edgeDist = abs(center.x) - hw;
        tipFade = smoothstep(1.0, 0.85, abs(yN));

    } else if (shapeType == 1) {
        // ── FOLDED LEAF — one half curled under, showing underside ──
        float leafHalfH = 0.36 + heightSeed * 0.08;
        float leafMaxW = 0.16 + widthSeed * 0.06;
        float yN = center.y / leafHalfH;
        if (abs(yN) > 1.0) discard;
        float base = leafMaxW * (1.0 - yN * yN) * (1.0 + yN * 0.10);
        // Fold: one side narrower (curled under/away from viewer)
        float foldDir = step(0.5, fract(vSeed * 4.13)) * 2.0 - 1.0; // L or R
        float foldAmt = 0.35 + fract(vSeed * 6.77) * 0.25; // 35-60%
        float isFoldSide = step(0.0, center.x * foldDir);
        float hw = mix(base, base * (1.0 - foldAmt), isFoldSide);
        edgeDist = abs(center.x) - hw;
        tipFade = smoothstep(1.0, 0.85, abs(yN));
        foldMask = isFoldSide * 0.35;
        creaseStrength = 0.3;

    } else if (shapeType == 2) {
        // ── FOLDED OAK — scalloped lobes, one half curled under ──
        float leafHalfH = 0.38 + heightSeed * 0.08;
        float leafMaxW = 0.16 + widthSeed * 0.06;
        float yN = center.y / leafHalfH;
        if (abs(yN) > 1.0) discard;
        float base = leafMaxW * (1.0 - yN * yN);
        // 4 pairs of rounded scallops along length
        float scallop = sin(yN * 12.57 + vSeed * 5.0) * 0.04 * (1.0 - yN * yN);
        float hw = base + scallop;
        // Asymmetric — wider toward tip end
        hw *= 1.0 - yN * 0.15;
        // Fold: one side narrower (curled under)
        float foldDir2 = step(0.5, fract(vSeed * 8.29)) * 2.0 - 1.0;
        float foldAmt2 = 0.30 + fract(vSeed * 9.41) * 0.25;
        float isFoldSide2 = step(0.0, center.x * foldDir2);
        hw = mix(hw, hw * (1.0 - foldAmt2), isFoldSide2);
        edgeDist = abs(center.x) - hw;
        tipFade = smoothstep(1.0, 0.88, abs(yN));
        foldMask = isFoldSide2 * 0.35;
        creaseStrength = 0.3;

    } else {
        // ── ROUND LEAF — egg / teardrop (aspen / linden) ──
        float leafHalfH = 0.30 + heightSeed * 0.06;
        float leafMaxW = 0.18 + widthSeed * 0.05;
        float yN = center.y / leafHalfH;
        if (abs(yN) > 1.0) discard;
        // Egg shape: wider below center, narrower above → pointed tip
        float hw = leafMaxW * (1.0 - yN * yN) * (1.0 - yN * 0.25);
        // Slight heart indent at base (bottom of leaf)
        hw *= 1.0 - 0.12 * smoothstep(0.5, 1.0, -yN) * smoothstep(0.05, 0.0, abs(center.x));
        edgeDist = abs(center.x) - hw;
        tipFade = smoothstep(1.0, 0.80, abs(yN));
    }

    // ═══ ANTI-ALIASED EDGE — fixed-width transition, never collapses ═══
    float shape = smoothstep(0.008, -0.008, edgeDist);
    shape *= tipFade;

    if (shape < 0.01) discard;

    // ═══ CENTER VEIN ═══
    float vein = smoothstep(0.012, 0.003, abs(center.x)) * shape * 0.35;

    // ═══ LIFE FADE ═══
    float fadeIn = smoothstep(0.0, 0.08, vLife);
    float fadeOut = 1.0 - smoothstep(0.65, 1.0, vLife);

    // ═══ COLOR — wide variety ═══
    // Continuous hue cycle through 4 colors for maximum diversity
    float hue = fract(vSeed * 5.17);

    // 4 anchor colors, smoothly interpolated
    vec3 c0 = vec3(0.30, 0.55, 0.15);   // Fresh green
    vec3 c1 = uColor;                    // Golden yellow
    vec3 c2 = uColorVariant;             // Warm orange-red
    vec3 c3 = vec3(0.45, 0.18, 0.10);   // Deep burgundy-brown

    // Smooth cycling: 0→c0, 0.25→c1, 0.5→c2, 0.75→c3, 1.0→c0
    float t = hue * 4.0;
    vec3 leafColor;
    if (t < 1.0) {
        leafColor = mix(c0, c1, t);
    } else if (t < 2.0) {
        leafColor = mix(c1, c2, t - 1.0);
    } else if (t < 3.0) {
        leafColor = mix(c2, c3, t - 2.0);
    } else {
        leafColor = mix(c3, c0, t - 3.0);
    }

    // Per-leaf brightness variation
    leafColor *= 0.82 + fract(vSeed * 7.31) * 0.36;

    // Edge darkening — natural shadow at curled edges
    leafColor *= mix(0.75, 1.0, smoothstep(0.0, -0.03, edgeDist));

    // Vein darkens center
    leafColor *= 1.0 - vein;

    // Fold effect — darken underside half + bright crease at fold line
    leafColor *= 1.0 - foldMask;
    leafColor += creaseStrength * smoothstep(0.015, 0.003, abs(center.x)) * shape;

    float alpha = shape * fadeIn * fadeOut * uOpacity;
    if (alpha < 0.005) discard;

    // Premultiplied alpha output for correct compositing
    gl_FragColor = vec4(leafColor * alpha, alpha);
}
`;

// =================================================================================================
// MATERIAL FACTORY
// =================================================================================================

export function createLeafParticleMaterial(config) {
    return new THREE.ShaderMaterial({
        name: 'LeafParticle',
        uniforms: {
            uTime:               { value: 0.0 },
            uOpacity:            { value: config.opacity ?? 0.55 },
            uColor:              { value: new THREE.Color(...(config.color || [0.85, 0.65, 0.25])) },
            uColorVariant:       { value: new THREE.Color(...(config.colorVariant || config.color || [0.70, 0.35, 0.15])) },
            uBuoyancy:           { value: config.buoyancy ?? -0.005 },
            uDrag:               { value: config.drag ?? 1.0 },
            uTurbulenceStrength: { value: config.turbulence ?? 0.25 },
            uEndSizeMultiplier:  { value: config.endSizeMultiplier ?? 0.85 },
            uRotationSpeedMax:   { value: config.rotationSpeedMax ?? 2.5 },
            uGravity:            { value: config.gravity ?? 0.03 },
        },
        vertexShader: PARTICLE_VERTEX_GLSL,
        fragmentShader: LEAF_FRAGMENT_GLSL,
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
