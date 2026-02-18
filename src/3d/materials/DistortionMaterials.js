/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Distortion Materials
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Per-element distortion materials that write UV offsets to the distortion map.
 * @module materials/DistortionMaterials
 *
 * Each element type has a physically-motivated distortion pattern:
 * - Fire: rising heat shimmer (turbulent sine waves drifting upward)
 * - Ice: settling cold mist (slow horizontal drift, pools at bottom)
 * - Water: concentric expanding ripples (radial push outward)
 * - Electric: static jitter (step noise, sparse random flicker)
 *
 * All materials use AdditiveBlending + depthWrite:false so multiple element types
 * naturally combine in the distortion map.
 *
 * Output format: gl_FragColor = vec4(dx * falloff, dy * falloff, 0.0, 1.0)
 *   R/G = signed UV offset, pre-multiplied by falloff (DistortionPass reads only R/G)
 *   B   = unused (reserved)
 *   Additive blending accumulates overlapping instances naturally.
 */

import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════════════════════════════
// SHARED NOISE (inline hash-based value noise — lightweight, no simplex overhead)
// ═══════════════════════════════════════════════════════════════════════════════════════

const DISTORTION_NOISE_GLSL = /* glsl */`
float dHash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float dNoise2D(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f); // smoothstep interpolation
    float a = dHash(i);
    float b = dHash(i + vec2(1.0, 0.0));
    float c = dHash(i + vec2(0.0, 1.0));
    float d = dHash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// SHARED VERTEX SHADER (all distortion types)
// ═══════════════════════════════════════════════════════════════════════════════════════

const DISTORTION_VERTEX_GLSL = /* glsl */`
varying vec2 vUv;
varying vec3 vWorldPos;

void main() {
    vUv = uv;

    // Transform vertex through model + view (single Mesh, not InstancedMesh)
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vec4 clipPos = projectionMatrix * viewMatrix * worldPos;

    gl_Position = clipPos;
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// FIRE — Rising Heat Column
// ═══════════════════════════════════════════════════════════════════════════════════════

export function createFireDistortionMaterial() {
    return new THREE.ShaderMaterial({
        name: 'FireDistortion',
        uniforms: {
            uTime: { value: 0.0 },
            uStrength: { value: 0.005 },
        },
        vertexShader: DISTORTION_VERTEX_GLSL,
        fragmentShader: /* glsl */`
            uniform float uTime;
            uniform float uStrength;
            varying vec2 vUv;
            varying vec3 vWorldPos;

            ${DISTORTION_NOISE_GLSL}

            void main() {
                vec2 uv = vUv;
                vec2 wp = vWorldPos.xy;

                float t = uTime * 2.0;

                // Two-octave turbulence - frequencies sized for half-res RT survival
                // (features must be larger than 2 RT pixels to avoid aliasing away)
                float n1 = dNoise2D(vec2(wp.x * 18.0, wp.y * 10.0 - t * 2.5));
                float n2 = dNoise2D(vec2(wp.x * 35.0, wp.y * 18.0 - t * 3.5)) * 0.5;
                float turb = (n1 + n2) - 0.75; // Center around zero

                // Horizontal: subtle - heat shimmer is mostly vertical
                float dx = turb * uStrength * 0.25;

                // Vertical: dominant rising streaks
                float wobble = sin(wp.x * 25.0 + t * 1.2) * 0.2;
                float dy = (turb + wobble) * uStrength;

                // Edge falloff (UV-space)
                float falloff = smoothstep(0.0, 0.2, uv.x) * smoothstep(1.0, 0.8, uv.x)
                              * smoothstep(0.0, 0.15, uv.y) * smoothstep(1.0, 0.85, uv.y);

                // Stronger in the middle height band (above heat source)
                float heightWeight = smoothstep(0.0, 0.25, uv.y) * smoothstep(1.0, 0.5, uv.y);

                float strength = falloff * heightWeight;
                gl_FragColor = vec4(dx * strength, dy * strength, 0.0, 1.0);
            }
        `,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        transparent: true,
        side: THREE.DoubleSide,
    });
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ICE — Settling Cold Mist
// ═══════════════════════════════════════════════════════════════════════════════════════

export function createIceDistortionMaterial() {
    return new THREE.ShaderMaterial({
        name: 'IceDistortion',
        uniforms: {
            uTime: { value: 0.0 },
            uStrength: { value: 0.003 },
        },
        vertexShader: DISTORTION_VERTEX_GLSL,
        fragmentShader: /* glsl */`
            uniform float uTime;
            uniform float uStrength;
            varying vec2 vUv;
            varying vec3 vWorldPos;

            ${DISTORTION_NOISE_GLSL}

            void main() {
                vec2 uv = vUv;
                vec2 wp = vWorldPos.xy;

                float t = uTime * 0.3; // Slow - cold mist is languid

                // Gentle pulse: strength oscillates slowly (0.8-1.0)
                float pulse = 0.8 + 0.2 * sin(uTime * 0.5);

                // Two-layer rolling fog - world-space so pattern is stable
                float mist1 = dNoise2D(wp * 3.0 + vec2(t * 0.4, -t * 0.2));
                float mist2 = dNoise2D(wp * 5.0 + vec2(-t * 0.3, -t * 0.15));

                // Equal horizontal drift and downward pull
                float dx = (mist1 - 0.5) * uStrength;
                float dy = (mist2 - 0.5) * uStrength - uStrength * 0.5; // Constant downward bias

                // Cold air pools at bottom - strongest low, fading upward
                float heightWeight = smoothstep(0.6, 0.1, uv.y);

                // Edge falloff (UV-space - plane edges)
                float falloff = smoothstep(0.0, 0.2, uv.x) * smoothstep(1.0, 0.8, uv.x)
                              * smoothstep(0.0, 0.1, uv.y) * smoothstep(1.0, 0.9, uv.y);

                float strength = falloff * heightWeight * pulse;

                gl_FragColor = vec4(dx * strength, dy * strength, 0.0, 1.0);
            }
        `,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        transparent: true,
        side: THREE.DoubleSide,
    });
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// WATER — Expanding Ripples
// ═══════════════════════════════════════════════════════════════════════════════════════

export function createWaterDistortionMaterial() {
    return new THREE.ShaderMaterial({
        name: 'WaterDistortion',
        uniforms: {
            uTime: { value: 0.0 },
            uStrength: { value: 0.003 },
        },
        vertexShader: DISTORTION_VERTEX_GLSL,
        fragmentShader: /* glsl */`
            uniform float uTime;
            uniform float uStrength;
            varying vec2 vUv;
            varying vec3 vWorldPos;

            void main() {
                vec2 uv = vUv;
                vec2 center = uv - 0.5;
                float dist = length(center);
                vec2 dir = normalize(center + 0.001);

                // Concentric expanding rings (UV-space center - rings scale with effect)
                float t = uTime * 1.0;
                float ring1 = sin(dist * 20.0 - t * 4.0) * 0.5 + 0.5;
                float ring2 = sin(dist * 14.0 - t * 2.8 + 1.0) * 0.5 + 0.5;
                float rings = ring1 * 0.6 + ring2 * 0.4;

                // Radial push (outward from center)
                vec2 offset = dir * rings * uStrength;

                // Falloff: strong near center, zero at edge
                float falloff = smoothstep(0.5, 0.1, dist);

                gl_FragColor = vec4(offset * falloff, 0.0, 1.0);
            }
        `,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        transparent: true,
        side: THREE.DoubleSide,
    });
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// VOID — Kerr Metric Spacetime Warping (rotating black hole)
//
// Real black holes don't just pull inward. A spinning (Kerr) black hole DRAGS
// spacetime in the direction of rotation (frame dragging / Lense-Thirring effect).
// The result is a spiral distortion pattern that:
// - Pulls strongly inward at close range (gravitational lensing)
// - Twists tangentially at medium range (frame dragging dominates)
// - Creates visible spiral warping in the background (like the reference grid diagram)
//
// The distortion is dramatically stronger than other elements (6× base strength)
// and extends further (wider padding in registration).
// ═══════════════════════════════════════════════════════════════════════════════════════

export function createVoidDistortionMaterial() {
    return new THREE.ShaderMaterial({
        name: 'VoidDistortion',
        uniforms: {
            uTime: { value: 0.0 },
            uStrength: { value: 0.018 },
            uFadeProgress: { value: 0.0 },  // 0-1-0 lifecycle easing (enter/hold/exit)
        },
        vertexShader: DISTORTION_VERTEX_GLSL,
        fragmentShader: /* glsl */`
            uniform float uTime;
            uniform float uStrength;
            uniform float uFadeProgress;
            varying vec2 vUv;
            varying vec3 vWorldPos;

            ${DISTORTION_NOISE_GLSL}

            void main() {
                vec2 uv = vUv;
                vec2 center = uv - 0.5;
                float dist = length(center);
                vec2 dir = normalize(center + 0.001);

                float t = uTime * 0.4; // Slow, ominous - time dilation

                // Kerr metric: gravitational pull + frame dragging
                // Radial = inward pull (Schwarzschild), Tangential = frame dragging
                // Enhancement pass on top of per-fragment lensing in InstancedVoidMaterial

                // Schwarzschild radius in UV space
                float rSchwarz = 0.06;
                float r = max(dist, rSchwarz * 0.5);

                // RADIAL: smoothstep-based (bounded, no 1/r^2 explosion)
                // Peak at photon sphere, gentle tail outward
                float radialStrength = smoothstep(0.45, 0.05, dist) * smoothstep(0.0, 0.04, dist);

                // FRAME DRAGGING: tangential twist (the Kerr signature)
                // Smoothstep-based so it stays bounded at all radii
                float angle = atan(center.y, center.x);
                vec2 tangent = vec2(-sin(angle), cos(angle));
                // Strong near ergosphere, visible at medium range, fades at edge
                float frameDrag = smoothstep(0.45, 0.06, dist) * smoothstep(0.0, 0.03, dist);
                // Boost near the hole - frame dragging peaks closer than radial
                frameDrag += smoothstep(0.15, 0.04, dist) * 0.5;

                // Slow spacetime pulsation
                float pulse = 0.9 + 0.1 * sin(t * 1.2);

                // RADIAL: inward pull
                vec2 offset = -dir * radialStrength * uStrength * pulse;

                // TANGENTIAL: frame dragging twist (spiral character)
                offset += tangent * frameDrag * uStrength * 2.0 * pulse;

                // Subtle spacetime turbulence
                float turb = dNoise2D(vWorldPos.xy * 6.0 + vec2(t * 0.5)) - 0.5;
                offset += vec2(turb, -turb) * uStrength * 0.1;

                // Edge falloff (UV-space - plane edges)
                float falloff = smoothstep(0.0, 0.10, uv.x) * smoothstep(1.0, 0.90, uv.x)
                              * smoothstep(0.0, 0.10, uv.y) * smoothstep(1.0, 0.90, uv.y);

                // Radial fade - distortion concentrated toward center
                float radialFade = smoothstep(0.5, 0.15, dist);
                falloff *= radialFade;

                // Lifecycle easing: smoothstep fade for gentle enter/exit
                float fade = uFadeProgress * uFadeProgress * (3.0 - 2.0 * uFadeProgress);
                gl_FragColor = vec4(offset * falloff * fade, 0.0, 1.0);
            }
        `,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        transparent: true,
        side: THREE.DoubleSide,
    });
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// LIGHT — Holy Shimmer (warm rising refraction + radial bloom push)
//
// Intense light sources heat surrounding air, creating refractive index gradients.
// Chromatic Prism — light refracts into a rainbow halo around the mascot.
// R/G channels write radial UV push (outward from center). B channel writes
// non-zero to trigger the chromatic aberration split in DistortionPass.
// The pass samples R/G/B at slightly different offset magnitudes, creating
// rainbow fringing. Stronger at edges (where refraction is most visible).
// ═══════════════════════════════════════════════════════════════════════════════════════

export function createLightDistortionMaterial() {
    return new THREE.ShaderMaterial({
        name: 'LightDistortion',
        uniforms: {
            uTime: { value: 0.0 },
            uStrength: { value: 0.004 },
        },
        vertexShader: DISTORTION_VERTEX_GLSL,
        fragmentShader: /* glsl */`
            uniform float uTime;
            uniform float uStrength;
            varying vec2 vUv;
            varying vec3 vWorldPos;

            ${DISTORTION_NOISE_GLSL}

            void main() {
                vec2 uv = vUv;
                vec2 wp = vWorldPos.xy;

                float t = uTime * 1.2;

                // Breathing pulse — slow divine rhythm
                float pulse = 0.85 + 0.15 * sin(t * 0.7);

                // Radial direction from center — prism pushes outward
                vec2 center = uv - 0.5;
                float dist = length(center);
                vec2 dir = dist > 0.001 ? normalize(center) : vec2(0.0);

                // Radial push — strongest in a ring band (not center, not edge)
                // Creates the classic "halo" refraction zone
                float ring = smoothstep(0.05, 0.2, dist) * smoothstep(0.5, 0.3, dist);

                // Subtle noise modulation — prism edge shimmers, not static
                float shimmer = dNoise2D(vec2(wp.x * 6.0 + t * 0.3, wp.y * 6.0 - t * 0.2));
                shimmer = shimmer * 0.3 + 0.7; // 0.7 to 1.0 range — mostly stable, slight variation

                float radialStrength = ring * shimmer * pulse * uStrength;

                // R/G: radial UV offset (pushes pixels outward from mascot center)
                float dx = dir.x * radialStrength;
                float dy = dir.y * radialStrength;

                // B: chromatic aberration UV spread for DistortionPass
                // Written as direct UV-space spread (not scaled by uStrength like R/G).
                // With AdditiveBlending, 1-2 overlapping planes → ~0.008-0.016 UV total
                // = ~15-30px separation at 1920 for visible rainbow fringing.
                float chromaticSignal = ring * shimmer * pulse * 0.008;

                // Edge falloff (UV-space)
                float falloff = smoothstep(0.0, 0.1, uv.x) * smoothstep(1.0, 0.9, uv.x)
                              * smoothstep(0.0, 0.1, uv.y) * smoothstep(1.0, 0.9, uv.y);

                gl_FragColor = vec4(dx * falloff, dy * falloff, chromaticSignal * falloff, 1.0);
            }
        `,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        transparent: true,
        side: THREE.DoubleSide,
    });
}
