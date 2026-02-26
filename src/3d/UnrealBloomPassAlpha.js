/**
 * UnrealBloomPassAlpha - Modified UnrealBloomPass that preserves alpha channel
 *
 * Based on Three.js UnrealBloomPass with shader modifications to prevent
 * alpha channel destruction during Gaussian blur operations.
 *
 * Issue: Standard UnrealBloomPass sets fragment alpha to 1.0, destroying transparency
 * Solution: Accumulate alpha values during blur using same Gaussian weights as RGB
 *
 * References:
 * - https://github.com/mrdoob/three.js/issues/14104
 * - https://gist.github.com/DOSputin/3bcb7355cbb2aef87013dbacb33ec2e1
 */

import {
    Color,
    CustomBlending,
    HalfFloatType,
    LinearFilter,
    MeshBasicMaterial,
    NoBlending,
    OneFactor,
    RGBAFormat,
    ShaderMaterial,
    // UniformsUtils - available for uniform cloning if needed
    Vector2,
    Vector3,
    WebGLRenderTarget,
    ZeroFactor
} from 'three';
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';

/**
 * UnrealBloomPassAlpha - preserves alpha channel transparency
 * Note: Separable blur shader is inlined in getSeperableBlurMaterial()
 */
export class UnrealBloomPassAlpha extends Pass {
    constructor(resolution, strength, radius, threshold) {
        super();

        this.strength = (strength !== undefined) ? strength : 1;
        this.radius = radius;
        this.threshold = threshold;
        this.resolution = (resolution !== undefined) ? new Vector2(resolution.x, resolution.y) : new Vector2(256, 256);

        // Render targets with RGBA format for alpha preservation + HDR
        const pars = {
            minFilter: LinearFilter,
            magFilter: LinearFilter,
            format: RGBAFormat,      // CRITICAL: Use RGBA not RGB
            type: HalfFloatType      // HDR: Allow values > 1.0 for proper bloom
        };

        this.renderTargetsHorizontal = [];
        this.renderTargetsVertical = [];
        this.nMips = 5;

        // All bloom targets at 75% resolution — bloom is inherently blurry, saves ~44%
        // fill rate. Bicubic (B-spline) upsampling in the copy pass smoothly upscales
        // to canvas, eliminating the pixel grid visible with bilinear-only upsampling.
        let resx = Math.round(this.resolution.x * 0.75);
        let resy = Math.round(this.resolution.y * 0.75);

        this.renderTargetBright = new WebGLRenderTarget(resx, resy, pars);
        this.renderTargetBright.texture.name = 'UnrealBloomPassAlpha.bright';
        this.renderTargetBright.texture.generateMipmaps = false;

        for (let i = 0; i < this.nMips; i++) {
            const renderTargetHorizonal = new WebGLRenderTarget(resx, resy, pars);
            renderTargetHorizonal.texture.name = `UnrealBloomPassAlpha.h${i}`;
            renderTargetHorizonal.texture.generateMipmaps = false;

            this.renderTargetsHorizontal.push(renderTargetHorizonal);

            const renderTargetVertical = new WebGLRenderTarget(resx, resy, pars);
            renderTargetVertical.texture.name = `UnrealBloomPassAlpha.v${i}`;
            renderTargetVertical.texture.generateMipmaps = false;

            this.renderTargetsVertical.push(renderTargetVertical);

            resx = Math.round(resx / 2);
            resy = Math.round(resy / 2);
        }

        // Custom luminosity high pass material that PRESERVES ALPHA
        this.highPassUniforms = {
            tDiffuse: { value: null },
            luminosityThreshold: { value: threshold },
            smoothWidth: { value: 0.1 }
        };

        this.materialHighPassFilter = new ShaderMaterial({
            uniforms: this.highPassUniforms,
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }`,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float luminosityThreshold;
                uniform float smoothWidth;
                varying vec2 vUv;

                void main() {
                    vec4 texel = texture2D(tDiffuse, vUv);
                    vec3 luma = vec3(0.299, 0.587, 0.114);
                    float v = dot(texel.xyz, luma);
                    float alpha = smoothstep(luminosityThreshold, luminosityThreshold + smoothWidth, v);

                    // CRITICAL: Preserve original alpha, only filter by luminosity
                    gl_FragColor = vec4(texel.rgb * alpha, texel.a);
                }`
        });

        // Gaussian blur materials with alpha preservation
        this.separableBlurMaterials = [];
        const kernelSizeArray = [3, 5, 7, 9, 11];
        // 75% resolution — matches render target sizes above
        resx = Math.round(this.resolution.x * 0.75);
        resy = Math.round(this.resolution.y * 0.75);

        for (let i = 0; i < this.nMips; i++) {
            this.separableBlurMaterials.push(this.getSeperableBlurMaterial(kernelSizeArray[i]));
            this.separableBlurMaterials[i].uniforms['texSize'].value = new Vector2(resx, resy);

            resx = Math.round(resx / 2);
            resy = Math.round(resy / 2);
        }

        // Composite material
        this.compositeMaterial = this.getCompositeMaterial(this.nMips);
        this.compositeMaterial.uniforms['blurTexture1'].value = this.renderTargetsVertical[0].texture;
        this.compositeMaterial.uniforms['blurTexture2'].value = this.renderTargetsVertical[1].texture;
        this.compositeMaterial.uniforms['blurTexture3'].value = this.renderTargetsVertical[2].texture;
        this.compositeMaterial.uniforms['blurTexture4'].value = this.renderTargetsVertical[3].texture;
        this.compositeMaterial.uniforms['blurTexture5'].value = this.renderTargetsVertical[4].texture;
        this.compositeMaterial.uniforms['bloomStrength'].value = strength;
        this.compositeMaterial.uniforms['bloomRadius'].value = 0.1;

        const bloomFactors = [1.0, 0.8, 0.6, 0.4, 0.2];
        this.compositeMaterial.uniforms['bloomFactors'].value = bloomFactors;
        this.bloomTintColors = [new Vector3(1, 1, 1), new Vector3(1, 1, 1), new Vector3(1, 1, 1), new Vector3(1, 1, 1), new Vector3(1, 1, 1)];
        this.compositeMaterial.uniforms['bloomTintColors'].value = this.bloomTintColors;

        // Copy material with bicubic (B-spline) upsampling for smooth bloom edges.
        // CustomBlending: RGB additive, Alpha preserve destination.
        // With premultipliedAlpha: true, this avoids double-darkening on CSS composite.
        this.materialCopy = new ShaderMaterial({
            uniforms: {
                'tDiffuse': { value: null },
                'texelSize': { value: new Vector2(1.0 / 256, 1.0 / 256) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }`,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform vec2 texelSize;
                varying vec2 vUv;
                void main() {
                    // B-spline bicubic upsampling — 4 bilinear taps, all-positive weights.
                    // Smoothly upscales 0.75-resolution bloom to canvas without pixel grid
                    // artifacts or ringing. Slightly smoother than Catmull-Rom (no negative
                    // lobes) which is ideal for bloom halos.
                    vec2 coord = vUv / texelSize - 0.5;
                    vec2 f = fract(coord);
                    coord = floor(coord);

                    vec2 f2 = f * f;
                    vec2 f3 = f2 * f;
                    vec2 omf = 1.0 - f;

                    // B-spline weights (unnormalized — divided out via s0/s1 pairs)
                    vec2 w0 = omf * omf * omf;
                    vec2 w1 = 3.0 * f3 - 6.0 * f2 + 4.0;
                    vec2 w2 = -3.0 * f3 + 3.0 * f2 + 3.0 * f + 1.0;
                    vec2 w3 = f3;

                    // Pair sums normalized to [0,1] range (weights sum to 6 per axis)
                    vec2 s0 = (w0 + w1) / 6.0;
                    vec2 s1 = (w2 + w3) / 6.0;

                    // Bilinear tap offsets within each pair
                    vec2 f0 = w1 / (w0 + w1);
                    vec2 f1 = w3 / max(w2 + w3, 1e-4);

                    // 4 sample positions
                    vec2 t0 = (coord - 0.5 + f0) * texelSize;
                    vec2 t1 = (coord + 1.5 + f1) * texelSize;

                    vec4 color =
                        (texture2D(tDiffuse, vec2(t0.x, t0.y)) * s0.x +
                         texture2D(tDiffuse, vec2(t1.x, t0.y)) * s1.x) * s0.y +
                        (texture2D(tDiffuse, vec2(t0.x, t1.y)) * s0.x +
                         texture2D(tDiffuse, vec2(t1.x, t1.y)) * s1.x) * s1.y;

                    // Interleaved Gradient Noise dithering (Jimenez 2014)
                    // Breaks 8-bit display banding into imperceptible noise
                    float ign = fract(52.9829189 * fract(0.06711056 * gl_FragCoord.x + 0.00583715 * gl_FragCoord.y));
                    gl_FragColor = color + (ign - 0.5) / 255.0;
                }`,
            blending: CustomBlending,
            blendSrc: OneFactor,       // RGB: src * 1
            blendDst: OneFactor,       // RGB: + dst * 1 (additive)
            blendSrcAlpha: ZeroFactor, // Alpha: src * 0 (ignore bloom alpha)
            blendDstAlpha: OneFactor,  // Alpha: + dst * 1 (preserve scene alpha)
            depthTest: false,
            depthWrite: false,
            transparent: true
        });

        this.enabled = true;
        this.needsSwap = false; // No swap - we modify readBuffer in place with additive blending

        this._oldClearColor = new Color();
        this.oldClearAlpha = 1;
        this.clearColor = new Color(0, 0, 0); // CRITICAL: Initialize clear color

        // CRITICAL: Use NoBlending to copy pixels directly without alpha-blending with destination
        // NormalBlending causes dark halos: result = src * srcAlpha + dst * (1 - srcAlpha)
        // If dst is black and srcAlpha < 1 at edges, edges get darkened
        this.basic = new MeshBasicMaterial({
            transparent: false,
            depthTest: false,
            depthWrite: false,
            blending: NoBlending  // Just copy pixels, don't blend
        });

        this.fsQuad = new FullScreenQuad(null);
    }

    dispose() {
        // Safely dispose render targets
        if (this.renderTargetsHorizontal) {
            for (let i = 0; i < this.renderTargetsHorizontal.length; i++) {
                this.renderTargetsHorizontal[i]?.dispose();
            }
        }

        if (this.renderTargetsVertical) {
            for (let i = 0; i < this.renderTargetsVertical.length; i++) {
                this.renderTargetsVertical[i]?.dispose();
            }
        }

        this.renderTargetBright?.dispose();

        if (this.separableBlurMaterials) {
            for (let i = 0; i < this.separableBlurMaterials.length; i++) {
                this.separableBlurMaterials[i]?.dispose();
            }
        }

        this.compositeMaterial?.dispose();
        this.blendMaterial?.dispose();
        this.basic?.dispose();

        this.fsQuad?.dispose();
    }

    /**
     * Clear all bloom render targets to remove residual glow
     * Call this during geometry swaps to prevent bloom bleeding between shapes
     * @param {WebGLRenderer} renderer - Three.js renderer
     */
    clearBloomBuffers(renderer) {
        const currentRenderTarget = renderer.getRenderTarget();
        const currentClearColor = renderer.getClearColor(this._oldClearColor);
        const currentClearAlpha = renderer.getClearAlpha();

        renderer.setClearColor(0x000000, 0);

        // Clear bright pass target
        renderer.setRenderTarget(this.renderTargetBright);
        renderer.clear();

        // Clear all horizontal blur targets
        for (let i = 0; i < this.renderTargetsHorizontal.length; i++) {
            renderer.setRenderTarget(this.renderTargetsHorizontal[i]);
            renderer.clear();
        }

        // Clear all vertical blur targets
        for (let i = 0; i < this.renderTargetsVertical.length; i++) {
            renderer.setRenderTarget(this.renderTargetsVertical[i]);
            renderer.clear();
        }

        // Restore previous state
        renderer.setRenderTarget(currentRenderTarget);
        renderer.setClearColor(currentClearColor, currentClearAlpha);
    }

    setSize(width, height) {
        // Update resolution property for accurate diagnostics
        this.resolution.set(width, height);

        // All bloom targets at 75% resolution (bicubic copy pass handles smooth upscaling)
        let resx = Math.round(width * 0.75);
        let resy = Math.round(height * 0.75);

        this.renderTargetBright.setSize(resx, resy);

        for (let i = 0; i < this.nMips; i++) {
            this.renderTargetsHorizontal[i].setSize(resx, resy);
            this.renderTargetsVertical[i].setSize(resx, resy);

            this.separableBlurMaterials[i].uniforms['texSize'].value = new Vector2(resx, resy);

            resx = Math.round(resx / 2);
            resy = Math.round(resy / 2);
        }
    }

    render(renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
        renderer.getClearColor(this._oldClearColor);
        this.oldClearAlpha = renderer.getClearAlpha();
        const oldAutoClear = renderer.autoClear;
        renderer.autoClear = false;

        renderer.setClearColor(this.clearColor, 0);

        if (maskActive) renderer.state.buffers.stencil.setTest(false);

        // Render input to screen (skip if we're doing overlay-only bloom like particles)
        if (this.renderToScreen && !this.skipBaseCopy) {
            this.fsQuad.material = this.basic;
            this.basic.map = readBuffer.texture;

            renderer.setRenderTarget(null);
            // CRITICAL: Do NOT clear when rendering to screen - this preserves CSS background transparency
            // The scene is already rendered to readBuffer with proper transparency
            // Clearing here would fill with black, destroying the alpha channel
            this.fsQuad.render(renderer);
        }

        // 1. Extract bright areas
        this.highPassUniforms['tDiffuse'].value = readBuffer.texture;
        this.highPassUniforms['luminosityThreshold'].value = this.threshold;
        this.fsQuad.material = this.materialHighPassFilter;

        renderer.setRenderTarget(this.renderTargetBright);
        renderer.clear();
        this.fsQuad.render(renderer);

        // 2. Blur bright areas with separable blur
        let inputRenderTarget = this.renderTargetBright;

        for (let i = 0; i < this.nMips; i++) {
            this.fsQuad.material = this.separableBlurMaterials[i];

            this.separableBlurMaterials[i].uniforms['colorTexture'].value = inputRenderTarget.texture;
            this.separableBlurMaterials[i].uniforms['direction'].value = UnrealBloomPassAlpha.BlurDirectionX;
            renderer.setRenderTarget(this.renderTargetsHorizontal[i]);
            renderer.clear();
            this.fsQuad.render(renderer);

            this.separableBlurMaterials[i].uniforms['colorTexture'].value = this.renderTargetsHorizontal[i].texture;
            this.separableBlurMaterials[i].uniforms['direction'].value = UnrealBloomPassAlpha.BlurDirectionY;
            renderer.setRenderTarget(this.renderTargetsVertical[i]);
            renderer.clear();
            this.fsQuad.render(renderer);

            inputRenderTarget = this.renderTargetsVertical[i];
        }

        // Composite all blur mips into renderTargetsHorizontal[0] (reusable since blur
        // already consumed its data). All at 0.75 resolution — the bicubic copy pass
        // smoothly upscales to canvas resolution.
        this.fsQuad.material = this.compositeMaterial;
        this.compositeMaterial.uniforms['bloomStrength'].value = this.strength;
        this.compositeMaterial.uniforms['bloomRadius'].value = this.radius;
        this.compositeMaterial.uniforms['bloomTintColors'].value = this.bloomTintColors;

        renderer.setRenderTarget(this.renderTargetsHorizontal[0]);
        renderer.clear();
        this.fsQuad.render(renderer);

        // Bicubic (B-spline) upsample bloom to canvas — eliminates pixel grid artifacts
        const compositeRT = this.renderTargetsHorizontal[0];
        this.fsQuad.material = this.materialCopy;
        this.materialCopy.uniforms['tDiffuse'].value = compositeRT.texture;
        this.materialCopy.uniforms['texelSize'].value.set(1.0 / compositeRT.width, 1.0 / compositeRT.height);

        if (maskActive) renderer.state.buffers.stencil.setTest(true);

        // Render to readBuffer with additive blending (working implementation approach)
        if (this.renderToScreen) {
            renderer.setRenderTarget(null);
            this.fsQuad.render(renderer);
        } else {
            renderer.setRenderTarget(readBuffer);
            this.fsQuad.render(renderer);
        }

        // Restore renderer settings
        renderer.setClearColor(this._oldClearColor, this.oldClearAlpha);
        renderer.autoClear = oldAutoClear;
    }

    getSeperableBlurMaterial(kernelRadius) {
        const defines = {
            MAX_RADIUS: kernelRadius
        };

        return new ShaderMaterial({
            defines,
            uniforms: {
                'colorTexture': { value: null },
                'texSize': { value: new Vector2(0.5, 0.5) },
                'direction': { value: new Vector2(0.5, 0.5) },
                'kernelRadius': { value: 1.0 }
            },

            vertexShader: `
                varying vec2 vUv;

                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }`,

            fragmentShader: `
                #include <common>
                varying vec2 vUv;
                uniform sampler2D colorTexture;
                uniform vec2 texSize;
                uniform vec2 direction;
                uniform float kernelRadius;

                float gaussianPdf(in float x, in float sigma) {
                    return 0.39894 * exp( -0.5 * x * x / ( sigma * sigma ) ) / sigma;
                }

                void main() {
                    vec2 invSize = 1.0 / texSize;
                    float sigma = kernelRadius / 2.0;
                    float weightSum = gaussianPdf(0.0, sigma);

                    // CRITICAL: Accumulate RGB and alpha SEPARATELY
                    // Include center pixel for BOTH RGB and alpha
                    vec4 centerPixel = texture2D(colorTexture, vUv);
                    vec3 diffuseSum = centerPixel.rgb * weightSum;
                    float alphaSum = centerPixel.a * weightSum;

                    vec2 delta = direction * invSize * kernelRadius / float(MAX_RADIUS);

                    for( int i = 1; i < MAX_RADIUS; i ++ ) {
                        float x = kernelRadius * float(i) / float(MAX_RADIUS);
                        float w = gaussianPdf(x, sigma);

                        vec2 uvOffset = delta * float(i);
                        vec4 sample1 = texture2D(colorTexture, vUv + uvOffset);
                        vec4 sample2 = texture2D(colorTexture, vUv - uvOffset);

                        // Accumulate RGB and alpha separately
                        diffuseSum += (sample1.rgb + sample2.rgb) * w;
                        alphaSum += (sample1.a + sample2.a) * w;
                        weightSum += 2.0 * w;
                    }

                    // Output with separately normalized alpha
                    gl_FragColor = vec4(diffuseSum / weightSum, alphaSum / weightSum);
                }`
        });
    }

    getCompositeMaterial(_nMips) {
        return new ShaderMaterial({
            uniforms: {
                'blurTexture1': { value: null },
                'blurTexture2': { value: null },
                'blurTexture3': { value: null },
                'blurTexture4': { value: null },
                'blurTexture5': { value: null },
                'bloomStrength': { value: 1.0 },
                'bloomFactors': { value: null },
                'bloomTintColors': { value: null },
                'bloomRadius': { value: 0.0 }
            },

            vertexShader: `
                varying vec2 vUv;

                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }`,

            fragmentShader: `
                varying vec2 vUv;
                uniform sampler2D blurTexture1;
                uniform sampler2D blurTexture2;
                uniform sampler2D blurTexture3;
                uniform sampler2D blurTexture4;
                uniform sampler2D blurTexture5;
                uniform float bloomStrength;
                uniform float bloomRadius;
                uniform float bloomFactors[5];
                uniform vec3 bloomTintColors[5];

                float lerpBloomFactor(const in float factor) {
                    float mirrorFactor = 1.2 - factor;
                    return mix(factor, mirrorFactor, bloomRadius);
                }

                void main() {
                    // ALPHA PRESERVATION: Sample all textures and preserve their alpha
                    vec4 sample1 = texture2D(blurTexture1, vUv);
                    vec4 sample2 = texture2D(blurTexture2, vUv);
                    vec4 sample3 = texture2D(blurTexture3, vUv);
                    vec4 sample4 = texture2D(blurTexture4, vUv);
                    vec4 sample5 = texture2D(blurTexture5, vUv);

                    // Apply tint to RGB only, preserve alpha from samples
                    vec4 color = bloomStrength * (
                        lerpBloomFactor(bloomFactors[0]) * vec4(sample1.rgb * bloomTintColors[0], sample1.a) +
                        lerpBloomFactor(bloomFactors[1]) * vec4(sample2.rgb * bloomTintColors[1], sample2.a) +
                        lerpBloomFactor(bloomFactors[2]) * vec4(sample3.rgb * bloomTintColors[2], sample3.a) +
                        lerpBloomFactor(bloomFactors[3]) * vec4(sample4.rgb * bloomTintColors[3], sample4.a) +
                        lerpBloomFactor(bloomFactors[4]) * vec4(sample5.rgb * bloomTintColors[4], sample5.a)
                    );

                    gl_FragColor = color;
                }`
        });
    }
}

UnrealBloomPassAlpha.BlurDirectionX = new Vector2(1.0, 0.0);
UnrealBloomPassAlpha.BlurDirectionY = new Vector2(0.0, 1.0);
