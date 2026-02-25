/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Ambient Occlusion Pass
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Screen-space ambient occlusion post-processing pass
 * @module AmbientOcclusionPass
 *
 * Four-step pipeline:
 * 1. Compute AO at half-resolution → aoTarget (normal-aware hemisphere sampling)
 * 2. Bilateral blur at half-resolution → blurTarget (edge-preserving via depth)
 * 3. Copy scene from readBuffer → writeBuffer (simple blit)
 * 4. Composite blurred AO with CustomBlending multiply on top (darkens scene, preserves alpha)
 *
 * ## Multi-Scale Normal-Aware SSAO
 *
 * Two sampling radii for realistic occlusion at different spatial frequencies:
 * - Fine (small radius): tight contact shadows between adjacent geometry
 * - Coarse (large radius): broad ambient darkening in concavities
 *
 * View-space normals reconstructed from depth derivatives (dFdx/dFdy) orient
 * hemisphere sampling — only occluders above the surface plane contribute,
 * eliminating false darkening on flat faces and silhouette edges.
 *
 * Fibonacci spiral sampling with noise-rotated disc per pixel.
 * Perceptual power curve softens shadow edges, distance fade reduces AO far away.
 *
 * ## Performance
 *
 * - Half-resolution AO + blur: 1/4 pixel count, ~3 fullscreen quads at half-res
 * - Bilinear upscale on composite: smooth result at full resolution
 * - No extra scene render: depth reused from RenderPass via shared DepthTexture
 *
 * ## Element Filtering
 *
 * Only geometry with `depthWrite: true` contributes depth and receives AO:
 * - Earth, Ice: solid opaque — get AO
 * - Fire, Electricity, Water, Void, Light: depthWrite false — excluded automatically
 * - Mascot mesh: contributes depth for contact shadows
 */

import * as THREE from 'three';
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';

// ═══════════════════════════════════════════════════════════════════════════════════════
// SHARED VERTEX SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════

const FULLSCREEN_VERTEX = /* glsl */`
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// COPY SHADER — simple blit from readBuffer to writeBuffer
// ═══════════════════════════════════════════════════════════════════════════════════════

const COPY_FRAGMENT = /* glsl */`
uniform sampler2D tDiffuse;
varying vec2 vUv;
void main() {
    gl_FragColor = texture2D(tDiffuse, vUv);
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// AO SHADER — multi-scale depth comparison with normal-aware hemisphere
// ═══════════════════════════════════════════════════════════════════════════════════════

const AO_FRAGMENT = /* glsl */`
#define GOLDEN_ANGLE 2.39996323

uniform sampler2D tDepth;
uniform sampler2D tNoise;
uniform vec2 resolution;
uniform vec2 uViewParams;
uniform float cameraNear;
uniform float cameraFar;
uniform float uFineRadius;
uniform float uCoarseRadius;
uniform float uIntensity;
uniform float uBias;
uniform float uFineFalloff;
uniform float uCoarseFalloff;
uniform vec3 uLightDirView;
uniform float uShadowIntensity;

varying vec2 vUv;

float linDepth(float d) {
    return (cameraNear * cameraFar) / (cameraFar - d * (cameraFar - cameraNear));
}

void main() {
    float rawDepth = textureLod(tDepth, vUv, 0.0).x;

    if (rawDepth > 0.999) {
        gl_FragColor = vec4(1.0);
        return;
    }

    float centerDepth = linDepth(rawDepth);
    vec2 texelSize = 1.0 / resolution;

    // Reconstruct view-space position
    vec2 ndc = vUv * 2.0 - 1.0;
    vec3 viewPos = vec3(ndc * uViewParams, -1.0) * centerDepth;

    // Reconstruct normal from depth derivatives
    vec3 normal = normalize(cross(dFdx(viewPos), dFdy(viewPos)));

    vec2 noiseUV = vUv * resolution / 64.0;
    vec2 noise = texture2D(tNoise, noiseUV).rg;
    mat2 rotMat = mat2(noise.x, -noise.y, noise.y, noise.x);

    // ── Fine scale: tight contact shadows between adjacent geometry ──
    float fineOcc = 0.0;
    float fineScreenR = uFineRadius / centerDepth;
    for (int i = 0; i < 16; i++) {
        float fi = float(i);
        float angle = fi * GOLDEN_ANGLE;
        float r = sqrt((fi + 0.5) / 16.0) * fineScreenR;
        // Per-sample radius jitter — breaks Fibonacci ring banding
        r *= (0.85 + 0.3 * fract(noise.x * (fi + 1.0) * 7.3));
        vec2 dir = rotMat * vec2(cos(angle), sin(angle));
        vec2 sUV = clamp(vUv + dir * r * texelSize, vec2(0.0), vec2(1.0));

        float sd = textureLod(tDepth, sUV, 0.0).x;
        if (sd > 0.999) continue;

        float sDepth = linDepth(sd);
        float diff = centerDepth - sDepth;

        if (diff > uBias) {
            // Normal-aware hemisphere weighting: reject samples behind the surface
            vec3 sViewPos = vec3((sUV * 2.0 - 1.0) * uViewParams, -1.0) * sDepth;
            vec3 sDir = normalize(sViewPos - viewPos);
            float nWeight = smoothstep(-0.2, 0.3, dot(sDir, normal));

            fineOcc += nWeight * (1.0 - smoothstep(0.0, uFineFalloff, diff));
        }
    }
    fineOcc /= 16.0;

    // ── Coarse scale: broad ambient darkening in concavities ──
    float coarseOcc = 0.0;
    float coarseScreenR = uCoarseRadius / centerDepth;
    for (int i = 0; i < 16; i++) {
        float fi = float(i);
        float angle = (fi + 16.0) * GOLDEN_ANGLE;
        float r = sqrt((fi + 0.5) / 16.0) * coarseScreenR;
        // Per-sample radius jitter — breaks Fibonacci ring banding
        r *= (0.85 + 0.3 * fract(noise.y * (fi + 1.0) * 11.7));
        vec2 dir = rotMat * vec2(cos(angle), sin(angle));
        vec2 sUV = clamp(vUv + dir * r * texelSize, vec2(0.0), vec2(1.0));

        float sd = textureLod(tDepth, sUV, 0.0).x;
        if (sd > 0.999) continue;

        float sDepth = linDepth(sd);
        float diff = centerDepth - sDepth;

        // Higher bias for coarse: only deep cavities, not adjacent surfaces
        if (diff > uBias * 6.0) {
            vec3 sViewPos = vec3((sUV * 2.0 - 1.0) * uViewParams, -1.0) * sDepth;
            vec3 sDir = normalize(sViewPos - viewPos);
            float nWeight = smoothstep(-0.2, 0.3, dot(sDir, normal));

            coarseOcc += nWeight * (1.0 - smoothstep(0.0, uCoarseFalloff, diff));
        }
    }
    coarseOcc /= 16.0;

    // Combine: fine for contact detail, coarse for ambient depth
    float totalOcc = fineOcc * 0.75 + coarseOcc * 0.25;
    float ao = clamp(1.0 - totalOcc * uIntensity, 0.0, 1.0);

    // Perceptual curve: soften harsh shadow edges
    ao = pow(ao, 0.85);

    // Distance fade: reduce AO for far geometry (less visible, saves quality)
    float distFade = smoothstep(15.0, 25.0, centerDepth);
    ao = mix(ao, 1.0, distFade);

    // ── Screen-space contact shadows (directional) ──
    // Ray-march toward the key light in view space. Accumulated penumbra:
    // each occluding step contributes, closer = more shadow. Floor at 0.3
    // so shadows never crush to black (ambient light persists).
    float contactShadow = 1.0;
    if (uShadowIntensity > 0.0) {
        vec3 marchDir = normalize(uLightDirView);
        float maxRayDist = centerDepth * 0.15;
        float rayStep = maxRayDist / 16.0;
        float thickThresh = centerDepth * 0.03;
        float jitter = noise.x * 0.5 + 0.5;

        float shadowAccum = 0.0;
        for (int i = 1; i <= 16; i++) {
            float dist = rayStep * (float(i) + jitter - 0.5);
            vec3 marchPos = viewPos + marchDir * dist;

            float marchZ = -marchPos.z;
            if (marchZ <= cameraNear || marchZ > cameraFar) break;

            vec2 marchUV = marchPos.xy / (uViewParams * marchZ) * 0.5 + 0.5;
            if (marchUV.x < 0.0 || marchUV.x > 1.0 || marchUV.y < 0.0 || marchUV.y > 1.0) break;

            float sRaw = textureLod(tDepth, marchUV, 0.0).x;
            if (sRaw > 0.999) continue;
            float sDepth = linDepth(sRaw);

            float depthDiff = marchZ - sDepth;
            if (depthDiff > 0.005 && depthDiff < thickThresh) {
                // Closer occluders contribute more shadow
                float stepOcc = 1.0 - smoothstep(0.0, maxRayDist, dist);
                shadowAccum = max(shadowAccum, stepOcc);
            }
        }

        // Floor: shadows never go below 30% brightness (ambient persists)
        contactShadow = max(1.0 - shadowAccum, 0.3);
        contactShadow = mix(1.0, contactShadow, uShadowIntensity);
        contactShadow = mix(contactShadow, 1.0, distFade);
    }

    // Combine AO and contact shadow
    float combined = ao * contactShadow;
    float totalShadow = 1.0 - combined;

    // Warm tint in shadows — earthy bounce light instead of cool blue
    vec3 aoColor = vec3(combined) + vec3(0.02, 0.005, -0.02) * totalShadow;
    gl_FragColor = vec4(aoColor, 1.0);
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// BILATERAL BLUR — edge-preserving smooth using depth comparison
// ═══════════════════════════════════════════════════════════════════════════════════════

const BLUR_FRAGMENT = /* glsl */`
uniform sampler2D tAO;
uniform sampler2D tDepth;
uniform vec2 aoResolution;
uniform float cameraNear;
uniform float cameraFar;

varying vec2 vUv;

float linDepth(float d) {
    return (cameraNear * cameraFar) / (cameraFar - d * (cameraFar - cameraNear));
}

void main() {
    vec2 texelSize = 1.0 / aoResolution;
    float centerDepth = linDepth(textureLod(tDepth, vUv, 0.0).x);

    // Depth-adaptive bilateral threshold (2% of center depth)
    float depthThreshold = centerDepth * 0.02;
    float invThreshSq = 1.0 / (2.0 * depthThreshold * depthThreshold);

    vec3 totalColor = vec3(0.0);
    float totalWeight = 0.0;

    // 7x7 bilateral blur with Gaussian spatial weighting
    for (int x = -3; x <= 3; x++) {
        for (int y = -3; y <= 3; y++) {
            vec2 sUV = vUv + vec2(float(x), float(y)) * texelSize;

            float sDepth = linDepth(textureLod(tDepth, sUV, 0.0).x);
            float depthDiff = centerDepth - sDepth;

            // Bilateral weight: preserve edges at depth discontinuities
            float w = exp(-depthDiff * depthDiff * invThreshSq);
            // Spatial Gaussian weight (sigma ~2 pixels)
            float dist2 = float(x * x + y * y);
            w *= exp(-dist2 / 8.0);

            totalColor += texture2D(tAO, sUV).rgb * w;
            totalWeight += w;
        }
    }

    gl_FragColor = vec4(totalColor / max(totalWeight, 0.001), 1.0);
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPOSITE — samples blurred AO, multiply-blended onto scene
// ═══════════════════════════════════════════════════════════════════════════════════════

const COMPOSITE_FRAGMENT = /* glsl */`
uniform sampler2D tAO;
varying vec2 vUv;
void main() {
    vec4 ao = texture2D(tAO, vUv);
    // Interleaved Gradient Noise dithering (Jimenez 2014)
    // Breaks banding into imperceptible noise
    float ign = fract(52.9829189 * fract(0.06711056 * gl_FragCoord.x + 0.00583715 * gl_FragCoord.y));
    ao.rgb += (ign - 0.5) / 32.0;
    gl_FragColor = ao;
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// AMBIENT OCCLUSION PASS CLASS
// ═══════════════════════════════════════════════════════════════════════════════════════

class AmbientOcclusionPass extends Pass {

    constructor(camera, width, height) {
        super();
        this.camera = camera;
        this.needsSwap = true;

        /** AO strength. 0 = no effect, higher = stronger. */
        this.intensity = 1.3;

        /** Fine-scale pixel radius at depth=1.0 — tight contact shadows. */
        this.fineRadius = 120.0;

        /** Coarse-scale pixel radius at depth=1.0 — broad ambient darkening. */
        this.coarseRadius = 280.0;

        /** Min depth diff for occlusion (prevents self-occlusion). */
        this.bias = 0.05;

        /** Max depth diff for fine-scale occlusion. */
        this.fineFalloff = 1.5;

        /** Max depth diff for coarse-scale occlusion. */
        this.coarseFalloff = 3.0;

        /** Enable screen-space contact shadows from key light. */
        this.shadowEnabled = true;

        /** Contact shadow strength. 0 = off, 1 = full black. */
        this.shadowIntensity = 0.65;

        this._fullWidth = width;
        this._fullHeight = height;
        this._halfWidth = Math.ceil(width / 2);
        this._halfHeight = Math.ceil(height / 2);

        // ── Internal half-resolution render targets ──
        const halfOpts = {
            format: THREE.RGBAFormat,
            type: THREE.HalfFloatType,     // 16-bit — eliminates shadow banding from 8-bit quantization
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter
        };
        this.aoTarget = new THREE.WebGLRenderTarget(this._halfWidth, this._halfHeight, halfOpts);
        this.blurTarget = new THREE.WebGLRenderTarget(this._halfWidth, this._halfHeight, halfOpts);

        // 64x64 noise texture for per-pixel rotation (reduces visible banding)
        const noiseSize = 64;
        const noiseData = new Float32Array(noiseSize * noiseSize * 4);
        for (let i = 0; i < noiseSize * noiseSize; i++) {
            const stride = i * 4;
            const angle = Math.random() * Math.PI * 2;
            noiseData[stride] = Math.cos(angle);
            noiseData[stride + 1] = Math.sin(angle);
            noiseData[stride + 2] = 0;
            noiseData[stride + 3] = 1;
        }
        this.noiseTexture = new THREE.DataTexture(
            noiseData, noiseSize, noiseSize,
            THREE.RGBAFormat, THREE.FloatType
        );
        this.noiseTexture.minFilter = THREE.NearestFilter;
        this.noiseTexture.magFilter = THREE.NearestFilter;
        this.noiseTexture.wrapS = THREE.RepeatWrapping;
        this.noiseTexture.wrapT = THREE.RepeatWrapping;
        this.noiseTexture.needsUpdate = true;

        // ── Copy material (simple blit) ──
        this.copyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tDiffuse: { value: null }
            },
            vertexShader: FULLSCREEN_VERTEX,
            fragmentShader: COPY_FRAGMENT,
            blending: THREE.NoBlending,
            depthTest: false,
            depthWrite: false
        });

        // ── AO material (renders to internal half-res target, NoBlending) ──
        this.aoMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tDepth: { value: null },
                tNoise: { value: this.noiseTexture },
                resolution: { value: new THREE.Vector2(width, height) },
                uViewParams: { value: new THREE.Vector2() },
                cameraNear: { value: camera.near },
                cameraFar: { value: camera.far },
                uFineRadius: { value: this.fineRadius },
                uCoarseRadius: { value: this.coarseRadius },
                uIntensity: { value: this.intensity },
                uBias: { value: this.bias },
                uFineFalloff: { value: this.fineFalloff },
                uCoarseFalloff: { value: this.coarseFalloff },
                uLightDirView: { value: new THREE.Vector3() },
                uShadowIntensity: { value: this.shadowIntensity }
            },
            vertexShader: FULLSCREEN_VERTEX,
            fragmentShader: AO_FRAGMENT,
            blending: THREE.NoBlending,
            depthTest: false,
            depthWrite: false
        });

        // ── Blur material (bilateral edge-preserving) ──
        this.blurMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tAO: { value: null },
                tDepth: { value: null },
                aoResolution: { value: new THREE.Vector2(this._halfWidth, this._halfHeight) },
                cameraNear: { value: camera.near },
                cameraFar: { value: camera.far }
            },
            vertexShader: FULLSCREEN_VERTEX,
            fragmentShader: BLUR_FRAGMENT,
            blending: THREE.NoBlending,
            depthTest: false,
            depthWrite: false
        });

        // ── Composite material (multiply blurred AO onto scene) ──
        this.compositeMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tAO: { value: null }
            },
            vertexShader: FULLSCREEN_VERTEX,
            fragmentShader: COMPOSITE_FRAGMENT,
            blending: THREE.CustomBlending,
            blendSrc: THREE.ZeroFactor,
            blendDst: THREE.SrcColorFactor,
            blendSrcAlpha: THREE.ZeroFactor,
            blendDstAlpha: THREE.OneFactor,
            depthTest: false,
            depthWrite: false
        });

        this._fsQuad = new FullScreenQuad(null);
        this._tempVec3 = new THREE.Vector3();
    }

    render(renderer, writeBuffer, readBuffer) {
        const {depthTexture} = readBuffer;
        if (!depthTexture) {
            console.warn('[AO] No depth texture on readBuffer — skipping');
            return;
        }

        // Update camera-dependent uniforms
        const cam = this.camera;
        const fovY = cam.fov * Math.PI / 180;
        const tanHalfFov = Math.tan(fovY * 0.5);

        const aoU = this.aoMaterial.uniforms;
        aoU.tDepth.value = depthTexture;
        aoU.resolution.value.set(this._fullWidth, this._fullHeight);
        aoU.uViewParams.value.set(cam.aspect * tanHalfFov, tanHalfFov);
        aoU.cameraNear.value = cam.near;
        aoU.cameraFar.value = cam.far;
        aoU.uFineRadius.value = this.fineRadius;
        aoU.uCoarseRadius.value = this.coarseRadius;
        aoU.uIntensity.value = this.intensity;
        aoU.uBias.value = this.bias;
        aoU.uFineFalloff.value = this.fineFalloff;
        aoU.uCoarseFalloff.value = this.coarseFalloff;

        // Screen-space shadow: compute key light direction in view space
        // Light direction matches earth shader's lightDir1: normalize(0.5, 1.0, 0.3)
        this._tempVec3.set(0.5, 1.0, 0.3).normalize().transformDirection(cam.matrixWorldInverse);
        aoU.uLightDirView.value.copy(this._tempVec3);
        aoU.uShadowIntensity.value = this.shadowEnabled ? this.shadowIntensity : 0.0;

        // ── Step 1: Compute AO at half-resolution ──
        this._fsQuad.material = this.aoMaterial;
        renderer.setRenderTarget(this.aoTarget);
        renderer.clear();
        this._fsQuad.render(renderer);

        // ── Step 2a: First bilateral blur pass (aoTarget → blurTarget) ──
        const blurU = this.blurMaterial.uniforms;
        blurU.tAO.value = this.aoTarget.texture;
        blurU.tDepth.value = depthTexture;
        blurU.aoResolution.value.set(this._halfWidth, this._halfHeight);
        blurU.cameraNear.value = cam.near;
        blurU.cameraFar.value = cam.far;

        this._fsQuad.material = this.blurMaterial;
        renderer.setRenderTarget(this.blurTarget);
        renderer.clear();
        this._fsQuad.render(renderer);

        // ── Step 2b: Second bilateral blur pass (blurTarget → aoTarget) ──
        blurU.tAO.value = this.blurTarget.texture;
        renderer.setRenderTarget(this.aoTarget);
        renderer.clear();
        this._fsQuad.render(renderer);

        // ── Step 3: Copy scene from readBuffer to writeBuffer ──
        this.copyMaterial.uniforms.tDiffuse.value = readBuffer.texture;
        this._fsQuad.material = this.copyMaterial;
        renderer.setRenderTarget(writeBuffer);
        renderer.clear();
        this._fsQuad.render(renderer);

        // ── Step 4: Composite blurred AO with multiply blend on top ──
        this.compositeMaterial.uniforms.tAO.value = this.aoTarget.texture;
        this._fsQuad.material = this.compositeMaterial;
        // Don't clear — blend on top of the copied scene
        this._fsQuad.render(renderer);
    }

    setSize(width, height) {
        this._fullWidth = width;
        this._fullHeight = height;
        this._halfWidth = Math.ceil(width / 2);
        this._halfHeight = Math.ceil(height / 2);
        this.aoTarget.setSize(this._halfWidth, this._halfHeight);
        this.blurTarget.setSize(this._halfWidth, this._halfHeight);
    }

    dispose() {
        this.copyMaterial.dispose();
        this.aoMaterial.dispose();
        this.blurMaterial.dispose();
        this.compositeMaterial.dispose();
        this.aoTarget.dispose();
        this.blurTarget.dispose();
        if (this.noiseTexture) this.noiseTexture.dispose();
        this._fsQuad.dispose();
    }
}

export { AmbientOcclusionPass };
export default AmbientOcclusionPass;
