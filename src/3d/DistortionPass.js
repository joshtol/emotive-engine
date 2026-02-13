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
            // Sample distortion map raw (all 4 channels)
            vec4 distSample = texture2D(tDistortion, vUv);

            // R/G = signed UV offset (pre-multiplied by strength/falloff)
            vec2 offset = distSample.rg * uGlobalStrength;

            // Hard clamp: safety rail against runaway accumulation
            offset = clamp(offset, vec2(-0.04), vec2(0.04));

            // Apply UV warp to scene
            vec4 color = texture2D(tDiffuse, vUv + offset);

            gl_FragColor = color;
        }
    `
};
