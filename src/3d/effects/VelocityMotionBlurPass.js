/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Velocity Motion Blur Pass
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Element-isolated velocity-based motion blur for instanced elements.
 * @module effects/VelocityMotionBlurPass
 *
 * Two-pass approach:
 * 1. Velocity pass: Renders instanced meshes to a velocity+mask buffer
 *    (RG = screen-space velocity in UV coords, A = element coverage mask)
 * 2. Blur pass: Samples scene along velocity vectors with depth-aware isolation.
 *    - Only element pixels (velocity alpha > 0.5) enter the blur path.
 *    - Each blur sample compares depth against the center pixel — samples at a
 *      different depth layer (mascot, background) are rejected.
 *    - This makes it physically impossible for the blur to read or modify any
 *      pixel that isn't part of the moving instanced elements.
 *
 * Depth buffer is reused from RenderPass (zero extra cost — same as AO pass).
 *
 * Velocity is projected to screen space (UV coordinates) in the velocity vertex
 * shader, making blur strength resolution-independent — same visual result on
 * mobile (375px) and desktop (1920px).
 */

import * as THREE from 'three';
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';

// ═══════════════════════════════════════════════════════════════════════════════════════
// VELOCITY RENDER MATERIAL — Projects world-space velocity to screen-space UV
// ═══════════════════════════════════════════════════════════════════════════════════════

const VELOCITY_VERTEX_SHADER = /* glsl */ `
attribute vec4 aVelocity;
varying vec2 vScreenVelocity;

void main() {
    vec4 localPos = vec4(position, 1.0);
    #ifdef USE_INSTANCING
        localPos = instanceMatrix * localPos;
    #endif

    // Current world position (vertex)
    vec4 worldPos = modelMatrix * localPos;

    // Project current position to clip space
    vec4 clipPos = projectionMatrix * viewMatrix * worldPos;

    // Compute screen-space velocity at INSTANCE CENTER only.
    // aVelocity is the translational velocity of the instance center (container space).
    // Using the vertex position would include rotational displacement as fake velocity —
    // a spinning ring's edge vertices would get tangential blur even when barely translating.
    // By projecting the center and its previous position, rotation is excluded cleanly.
    #ifdef USE_INSTANCING
        vec3 instanceCenter = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    #else
        vec3 instanceCenter = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    #endif
    vec3 prevCenter = instanceCenter - (mat3(modelMatrix) * aVelocity.xyz);

    vec4 centerClip = projectionMatrix * viewMatrix * vec4(instanceCenter, 1.0);
    vec4 prevCenterClip = projectionMatrix * viewMatrix * vec4(prevCenter, 1.0);

    // Screen-space velocity in UV coordinates
    // NDC is [-1,1], UV is [0,1] — scale by 0.5
    vec2 ndcCurr = centerClip.xy / centerClip.w;
    vec2 ndcPrev = prevCenterClip.xy / prevCenterClip.w;
    vScreenVelocity = (ndcCurr - ndcPrev) * 0.5;

    gl_Position = clipPos;
}
`;

const VELOCITY_FRAGMENT_SHADER = /* glsl */ `
varying vec2 vScreenVelocity;

void main() {
    // Clamp screen-space velocity to ±50% of screen (sanity limit)
    vec2 vel = clamp(vScreenVelocity, vec2(-0.5), vec2(0.5));
    // Encode: bias to [0,1] range (0.5 = zero velocity)
    gl_FragColor = vec4(vel * 0.5 + 0.5, 0.0, 1.0);
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// BLUR + COMPOSITE SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════

const BLUR_VERTEX_SHADER = /* glsl */ `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/**
 * Depth-aware element-isolated blur.
 *
 * Gate 1: velocity alpha — non-element pixels pass through unchanged.
 * Gate 2: per-sample depth comparison — samples at a different depth layer
 *         (mascot behind, background, other objects) are rejected.
 *
 * Result: only element-depth pixels contribute to blur. The mascot and
 * background are never read, never modified. A blurred element racing in
 * front of the mascot appears blurry while the mascot stays crystal sharp.
 */
const BLUR_FRAGMENT_SHADER = /* glsl */ `
uniform sampler2D tColor;
uniform sampler2D tVelocity;
uniform sampler2D tDepth;
uniform float uIntensity;
uniform float cameraNear;
uniform float cameraFar;
uniform float uDepthThreshold;

varying vec2 vUv;

float linDepth(float d) {
    return (cameraNear * cameraFar) / (cameraFar - d * (cameraFar - cameraNear));
}

// Per-pixel jitter to break banding — cheap interleaved gradient noise
float interleavedGradientNoise(vec2 coord) {
    return fract(52.9829189 * fract(0.06711056 * coord.x + 0.00583715 * coord.y));
}

void main() {
    vec4 velData = texture2D(tVelocity, vUv);

    // Gate 1: Non-element pixel — pass through scene untouched.
    if (velData.a < 0.5) {
        gl_FragColor = texture2D(tColor, vUv);
        return;
    }

    // Decode screen-space velocity from RG channels (UV coordinates)
    vec2 velocity = (velData.rg - 0.5) * 2.0;
    velocity *= uIntensity;

    // Stationary element — no blur needed
    float speed = length(velocity);
    if (speed < 0.0001) {
        gl_FragColor = texture2D(tColor, vUv);
        return;
    }

    // Clamp max blur to 2% of screen (resolution-independent)
    // ~38px at 1920px, ~7.5px at 375px — subtle streaks, never smear
    if (speed > 0.02) velocity *= 0.02 / speed;

    // Center pixel depth for comparison
    float centerDepth = linDepth(texture2D(tDepth, vUv).x);

    // Per-pixel jitter offset — shifts sample positions to break banding
    float jitter = (interleavedGradientNoise(gl_FragCoord.xy) - 0.5) / 8.0;

    // 8 samples along velocity direction with per-sample isolation.
    // 8 is enough with jitter — halves texture lookups vs 16 (24 vs 48).
    vec4 color = vec4(0.0);
    float totalWeight = 0.0;

    for (int i = 0; i < 8; i++) {
        float t = (float(i) + 0.5) / 8.0 - 0.5 + jitter;
        vec2 sampleUv = clamp(vUv + velocity * t, vec2(0.001), vec2(0.999));

        // Gate A: velocity alpha — only sample element-covered pixels
        if (texture2D(tVelocity, sampleUv).a < 0.5) continue;

        // Gate B: depth — reject samples at a different depth layer
        float sampleDepth = linDepth(texture2D(tDepth, sampleUv).x);
        if (abs(sampleDepth - centerDepth) > uDepthThreshold) continue;

        // Tent weight — center samples contribute more than edge samples
        float weight = 1.0 - abs(t * 2.0);
        weight = max(weight, 0.15);
        color += texture2D(tColor, sampleUv) * weight;
        totalWeight += weight;
    }

    // Fallback: all samples rejected (element at depth boundary)
    if (totalWeight < 0.001) {
        gl_FragColor = texture2D(tColor, vUv);
        return;
    }

    // Preserve original alpha (canvas uses premultiplied alpha)
    vec4 original = texture2D(tColor, vUv);
    gl_FragColor = vec4((color / totalWeight).rgb, original.a);
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// VELOCITY MOTION BLUR PASS
// ═══════════════════════════════════════════════════════════════════════════════════════

export class VelocityMotionBlurPass extends Pass {
    /**
     * @param {THREE.Camera} camera - Camera for velocity rendering
     * @param {Object} options - Configuration
     * @param {number} [options.intensity=1.0] - Blur intensity multiplier
     * @param {number} [options.depthThreshold=0.5] - Max linear depth difference for same-layer
     */
    constructor(camera, options = {}) {
        super();
        this.camera = camera;

        const { intensity = 1.0, depthThreshold = 0.5 } = options;
        this.intensity = intensity;
        this.depthThreshold = depthThreshold;

        // Velocity render target (created on first render at correct size)
        this.velocityTarget = null;
        this._targetWidth = 0;
        this._targetHeight = 0;

        // Velocity material — instanced, uses aVelocity attribute
        this.velocityMaterial = new THREE.ShaderMaterial({
            vertexShader: VELOCITY_VERTEX_SHADER,
            fragmentShader: VELOCITY_FRAGMENT_SHADER,
        });

        // Blur material
        this.blurMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tColor: { value: null },
                tVelocity: { value: null },
                tDepth: { value: null },
                uIntensity: { value: intensity },
                cameraNear: { value: camera.near },
                cameraFar: { value: camera.far },
                uDepthThreshold: { value: depthThreshold },
            },
            vertexShader: BLUR_VERTEX_SHADER,
            fragmentShader: BLUR_FRAGMENT_SHADER,
        });

        this.fsQuad = new FullScreenQuad(this.blurMaterial);

        // Registered instanced meshes
        this.instancedMeshes = new Set();

        // Temporary scene for velocity rendering
        this._velocityScene = new THREE.Scene();
    }

    /** Register an instanced mesh (must have aVelocity attribute). */
    addInstancedMesh(mesh) {
        this.instancedMeshes.add(mesh);
    }

    /** Unregister an instanced mesh. */
    removeInstancedMesh(mesh) {
        this.instancedMeshes.delete(mesh);
    }

    setIntensity(intensity) {
        this.intensity = intensity;
        this.blurMaterial.uniforms.uIntensity.value = intensity;
    }

    setDepthThreshold(threshold) {
        this.depthThreshold = threshold;
        this.blurMaterial.uniforms.uDepthThreshold.value = threshold;
    }

    setSize(width, height) {
        this._targetWidth = width;
        this._targetHeight = height;
        if (this.velocityTarget) this.velocityTarget.setSize(width, height);
    }

    render(renderer, writeBuffer, readBuffer) {
        if (!this.enabled) return;

        // Depth texture from RenderPass — same as AO, zero extra cost
        const { depthTexture } = readBuffer;
        if (!depthTexture) return;

        const width = this._targetWidth || readBuffer.width;
        const height = this._targetHeight || readBuffer.height;

        // Create/resize velocity target if needed
        if (
            !this.velocityTarget ||
            this.velocityTarget.width !== width ||
            this.velocityTarget.height !== height
        ) {
            if (this.velocityTarget) this.velocityTarget.dispose();
            this.velocityTarget = new THREE.WebGLRenderTarget(width, height, {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                type: THREE.FloatType,
            });
        }

        // Pass 1: Render velocity + element mask buffer
        this._renderVelocityPass(renderer);

        // Update camera uniforms (may change if camera zooms)
        const cam = this.camera;
        this.blurMaterial.uniforms.cameraNear.value = cam.near;
        this.blurMaterial.uniforms.cameraFar.value = cam.far;

        // Adaptive depth threshold — scale with camera range so it works
        // correctly regardless of near/far setup
        const range = cam.far - cam.near;
        this.blurMaterial.uniforms.uDepthThreshold.value = Math.max(0.1, range * 0.005);

        // Pass 2: Blur composite with depth-aware sampling
        this.blurMaterial.uniforms.tColor.value = readBuffer.texture;
        this.blurMaterial.uniforms.tVelocity.value = this.velocityTarget.texture;
        this.blurMaterial.uniforms.tDepth.value = depthTexture;

        if (this.renderToScreen) {
            renderer.setRenderTarget(null);
        } else {
            renderer.setRenderTarget(writeBuffer);
            if (this.clear) renderer.clear();
        }

        this.fsQuad.render(renderer);
    }

    /** @private Renders instanced meshes with velocity material to velocity buffer. */
    _renderVelocityPass(renderer) {
        const currentRenderTarget = renderer.getRenderTarget();
        const currentClearColor = new THREE.Color();
        const currentClearAlpha = renderer.getClearAlpha();
        renderer.getClearColor(currentClearColor);
        const currentAutoClear = renderer.autoClear;

        // Clear velocity target: RG=0.5 (zero velocity), A=0 (no element)
        renderer.setRenderTarget(this.velocityTarget);
        renderer.setClearColor(0x808000, 0.0);
        renderer.clear();
        renderer.autoClear = false;

        const originalParents = new Map();
        const originalMaterials = new Map();
        const savedWorldMatrices = new Map();

        for (const mesh of this.instancedMeshes) {
            if (!mesh.visible || mesh.count === 0) continue;

            // Capture world transform BEFORE reparenting — pool meshes live
            // inside a container Group at the mascot's position. Reparenting
            // to the flat velocity scene would lose that offset, causing the
            // velocity buffer to mark the wrong screen pixels.
            savedWorldMatrices.set(mesh, mesh.matrixWorld.clone());

            originalParents.set(mesh, mesh.parent);
            originalMaterials.set(mesh, mesh.material);
            mesh.material = this.velocityMaterial;
            this._velocityScene.add(mesh);

            // Force the saved world matrix — prevents renderer.render() from
            // recomputing it relative to the velocity scene's identity root.
            mesh.matrixWorldAutoUpdate = false;
            mesh.matrixWorld.copy(savedWorldMatrices.get(mesh));
        }

        if (this._velocityScene.children.length > 0) {
            renderer.render(this._velocityScene, this.camera);
        }

        for (const [mesh, parent] of originalParents) {
            this._velocityScene.remove(mesh);
            mesh.material = originalMaterials.get(mesh);
            mesh.matrixWorldAutoUpdate = true;
            if (parent) parent.add(mesh);
        }

        renderer.autoClear = currentAutoClear;
        renderer.setClearColor(currentClearColor, currentClearAlpha);
        renderer.setRenderTarget(currentRenderTarget);
    }

    dispose() {
        if (this.velocityTarget) this.velocityTarget.dispose();
        this.velocityMaterial.dispose();
        this.blurMaterial.dispose();
        this.fsQuad.dispose();
        this.instancedMeshes.clear();
    }
}
