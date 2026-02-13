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
 * Output format: gl_FragColor = vec4(dx, dy, strength, 1.0)
 *   R/G = signed UV offset direction
 *   B   = strength/falloff multiplier
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

    // Transform vertex through instance + model + view
    vec4 worldPos = modelMatrix * instanceMatrix * vec4(position, 1.0);
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

                // Two-octave turbulence — frequencies sized for half-res RT survival
                // (features must be larger than 2 RT pixels to avoid aliasing away)
                float n1 = dNoise2D(vec2(wp.x * 18.0, wp.y * 10.0 - t * 2.5));
                float n2 = dNoise2D(vec2(wp.x * 35.0, wp.y * 18.0 - t * 3.5)) * 0.5;
                float turb = (n1 + n2) - 0.75; // Center around zero

                // Horizontal: subtle — heat shimmer is mostly vertical
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
            uStrength: { value: 0.002 },
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

                // Cold mist: slow, horizontal drift
                float t = uTime * 0.3;
                float mist1 = dNoise2D(uv * 2.0 + vec2(t * 0.4, -t * 0.1));
                float mist2 = dNoise2D(uv * 3.5 + vec2(-t * 0.3, t * 0.05));

                // Horizontal spread, slight downward pull
                float dx = (mist1 - 0.5) * uStrength * 2.0;
                float dy = (mist2 - 0.5) * uStrength * 0.5 - uStrength * 0.3; // Downward bias

                // Concentrated at bottom, fades upward (cold air sinks)
                float heightWeight = smoothstep(1.0, 0.2, uv.y);

                // Edge falloff
                float falloff = smoothstep(0.0, 0.2, uv.x) * smoothstep(1.0, 0.8, uv.x)
                              * smoothstep(0.0, 0.15, uv.y);

                float strength = falloff * heightWeight;

                gl_FragColor = vec4(dx, dy, strength, 1.0);
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

                // Concentric expanding rings
                float t = uTime * 1.0;
                float ring1 = sin(dist * 20.0 - t * 4.0) * 0.5 + 0.5;
                float ring2 = sin(dist * 14.0 - t * 2.8 + 1.0) * 0.5 + 0.5;
                float rings = ring1 * 0.6 + ring2 * 0.4;

                // Radial push (outward from center)
                vec2 offset = dir * rings * uStrength;

                // Falloff: strong near center, zero at edge
                float falloff = smoothstep(0.5, 0.1, dist);

                float strength = falloff;

                gl_FragColor = vec4(offset, strength, 1.0);
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
// ELECTRIC — Static Jitter
// ═══════════════════════════════════════════════════════════════════════════════════════

export function createElectricDistortionMaterial() {
    return new THREE.ShaderMaterial({
        name: 'ElectricDistortion',
        uniforms: {
            uTime: { value: 0.0 },
            uStrength: { value: 0.003 },
            uFlashIntensity: { value: 0.0 },
        },
        vertexShader: DISTORTION_VERTEX_GLSL,
        fragmentShader: /* glsl */`
            uniform float uTime;
            uniform float uStrength;
            uniform float uFlashIntensity;
            varying vec2 vUv;
            varying vec3 vWorldPos;

            ${DISTORTION_NOISE_GLSL}

            void main() {
                vec2 uv = vUv;

                // Step noise: random jitter that changes abruptly (not smooth)
                float t = floor(uTime * 15.0); // 15 fps step noise
                vec2 hashCoord1 = uv * 50.0 + vec2(t);
                vec2 hashCoord2 = uv * 50.0 + vec2(t + 100.0);
                float jitterX = (dHash(hashCoord1) - 0.5) * 2.0;
                float jitterY = (dHash(hashCoord2) - 0.5) * 2.0;

                // Sparse: only ~30% of pixels get jitter
                vec2 cellCoord = floor(uv * 20.0) + vec2(t * 0.1);
                float active = step(0.7, dHash(cellCoord));

                vec2 offset = vec2(jitterX, jitterY) * uStrength * active;

                // Flash boost: distortion spikes during lightning flash
                offset *= 1.0 + uFlashIntensity * 3.0;

                // Edge falloff
                float falloff = smoothstep(0.0, 0.15, uv.x) * smoothstep(1.0, 0.85, uv.x)
                              * smoothstep(0.0, 0.15, uv.y) * smoothstep(1.0, 0.85, uv.y);

                float strength = falloff * active;

                gl_FragColor = vec4(offset, strength, 1.0);
            }
        `,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        transparent: true,
        side: THREE.DoubleSide,
    });
}
