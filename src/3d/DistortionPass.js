/**
 * DistortionPass — Post-processing shader that warps the scene via a UV-offset map.
 *
 * Reads a distortion map where R/G = pre-scaled signed UV offset (already includes
 * per-instance strength/falloff). Multiple instances add via AdditiveBlending.
 * Hard-clamped to +/-0.04 UV (~77px at 1920) as a safety rail.
 *
 * The pass is inserted before bloom in the EffectComposer chain.
 * The composer auto-manages renderToScreen via isLastEnabledPass().
 *
 * @module DistortionPass
 */

export const DistortionShader = {
    name: 'DistortionShader',

    uniforms: {
        tDiffuse: { value: null },              // Auto-filled by ShaderPass from readBuffer
        tDistortion: { value: null },           // Distortion map (half-res RT)
        uGlobalStrength: { value: 1.0 },
    },

    vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,

    fragmentShader: /* glsl */`
        uniform sampler2D tDiffuse;
        uniform sampler2D tDistortion;
        uniform float uGlobalStrength;
        varying vec2 vUv;

        void main() {
            vec4 distSample = texture2D(tDistortion, vUv);

            // R/G = signed UV offset (pre-multiplied by strength/falloff)
            vec2 offset = distSample.rg * uGlobalStrength;

            // Hard clamp: safety rail against runaway accumulation
            offset = clamp(offset, vec2(-0.04), vec2(0.04));

            // Base scene warp — full vec4 preserves alpha
            // (canvas is transparent + premultipliedAlpha; alpha=1.0 would make BG opaque black)
            vec4 scene = texture2D(tDiffuse, vUv + offset);

            // B channel = chromatic aberration UV spread (written by light distortion)
            // Prism split: red refracts outward more, blue less (matches real dispersion)
            // B is a direct UV spread amount (~0.008-0.016), NOT scaled by offset.
            // When B=0 (non-light elements), chrShift=vec2(0), R/B read same UV as scene.
            float chromatic = distSample.b * uGlobalStrength;
            vec2 chrDir = length(offset) > 0.0001 ? normalize(offset) : vec2(0.0);
            vec2 chrShift = chrDir * chromatic;
            scene.r = texture2D(tDiffuse, vUv + offset + chrShift).r;
            scene.b = texture2D(tDiffuse, vUv + offset - chrShift).b;

            gl_FragColor = scene;
        }
    `
};
