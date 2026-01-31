/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Velocity Motion Blur Pass
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview DIY velocity-based motion blur post-processing pass
 * @module effects/VelocityMotionBlurPass
 *
 * A custom post-processing pass that creates motion blur by sampling along
 * velocity vectors. Works with Three.js EffectComposer.
 *
 * Two-pass approach:
 * 1. Velocity pass: Renders velocity vectors to a texture (via a separate render)
 * 2. Blur pass: Samples the color buffer along velocity direction
 *
 * For instanced elements, velocity is stored in per-instance attributes and
 * rendered to the velocity buffer. For non-instanced objects, velocity can be
 * derived from previous frame transforms.
 *
 * ## Usage
 *
 * ```javascript
 * import { VelocityMotionBlurPass } from './VelocityMotionBlurPass.js';
 *
 * const composer = new EffectComposer(renderer);
 * composer.addPass(new RenderPass(scene, camera));
 * composer.addPass(new VelocityMotionBlurPass(scene, camera, {
 *     samples: 8,
 *     intensity: 1.0
 * }));
 * ```
 */

import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════════════════════════════
// VELOCITY RENDER MATERIAL
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Material that outputs velocity as color for the velocity buffer.
 * For instanced elements, reads velocity from per-instance attribute.
 * For regular objects, uses uniform-based velocity.
 */
const VELOCITY_VERTEX_SHADER = /* glsl */`
uniform mat4 uPrevModelViewMatrix;  // Previous frame's modelViewMatrix
uniform mat4 uPrevProjectionMatrix; // Previous frame's projectionMatrix
uniform float uIsInstanced;

// Instance attribute for instanced rendering
attribute vec4 aVelocity;

varying vec4 vVelocity;
varying vec4 vCurrentPos;
varying vec4 vPrevPos;

void main() {
    // Current position
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vCurrentPos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    // For instanced elements, use the velocity attribute directly
    if (uIsInstanced > 0.5) {
        vVelocity = aVelocity;
        vPrevPos = vCurrentPos;  // Will calculate screen-space velocity in fragment
    } else {
        // For non-instanced, calculate from previous frame transform
        vPrevPos = uPrevProjectionMatrix * uPrevModelViewMatrix * vec4(position, 1.0);
        vVelocity = vec4(0.0);  // Will calculate in fragment
    }

    gl_Position = vCurrentPos;
}
`;

const VELOCITY_FRAGMENT_SHADER = /* glsl */`
uniform float uIsInstanced;
uniform vec2 uResolution;

varying vec4 vVelocity;
varying vec4 vCurrentPos;
varying vec4 vPrevPos;

void main() {
    vec2 velocity;

    if (uIsInstanced > 0.5) {
        // Convert world-space velocity to screen-space
        // Approximate: project velocity direction
        velocity = vVelocity.xy * vVelocity.w * 0.01;  // Scale by speed
    } else {
        // Calculate screen-space velocity from position difference
        vec2 currentScreen = (vCurrentPos.xy / vCurrentPos.w) * 0.5 + 0.5;
        vec2 prevScreen = (vPrevPos.xy / vPrevPos.w) * 0.5 + 0.5;
        velocity = (currentScreen - prevScreen) * uResolution;
    }

    // Encode velocity in RG channels (signed, -1 to 1 mapped to 0 to 1)
    gl_FragColor = vec4(velocity * 0.5 + 0.5, 0.0, 1.0);
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// MOTION BLUR SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════

const BLUR_VERTEX_SHADER = /* glsl */`
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const BLUR_FRAGMENT_SHADER = /* glsl */`
uniform sampler2D tColor;        // Color buffer from previous pass
uniform sampler2D tVelocity;     // Velocity buffer
uniform float uIntensity;        // Blur intensity multiplier
uniform int uSamples;            // Number of samples (performance vs quality)
uniform vec2 uResolution;

varying vec2 vUv;

void main() {
    // Sample velocity at this pixel
    vec4 velocityData = texture2D(tVelocity, vUv);
    vec2 velocity = (velocityData.rg - 0.5) * 2.0;  // Decode from 0-1 to -1-1

    // Scale velocity by intensity
    velocity *= uIntensity;

    // Skip blur for static pixels
    float speed = length(velocity);
    if (speed < 0.001) {
        gl_FragColor = texture2D(tColor, vUv);
        return;
    }

    // Calculate sample step
    vec2 texelSize = 1.0 / uResolution;
    vec2 step = velocity * texelSize;

    // Accumulate samples along velocity direction
    vec4 color = vec4(0.0);
    float totalWeight = 0.0;

    for (int i = 0; i < 16; i++) {  // Max 16 samples (loop unrolling limit)
        if (i >= uSamples) break;

        float t = float(i) / float(uSamples - 1) - 0.5;  // -0.5 to 0.5
        vec2 sampleUv = vUv + step * t;

        // Clamp to texture bounds
        sampleUv = clamp(sampleUv, vec2(0.001), vec2(0.999));

        // Weight samples - center samples are more important
        float weight = 1.0 - abs(t * 2.0);
        weight = max(weight, 0.1);

        color += texture2D(tColor, sampleUv) * weight;
        totalWeight += weight;
    }

    gl_FragColor = color / totalWeight;
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// VELOCITY MOTION BLUR PASS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Post-processing pass that applies velocity-based motion blur.
 *
 * This is a DIY implementation that doesn't require additional dependencies.
 * It works by:
 * 1. Rendering a velocity buffer (objects render their velocity as color)
 * 2. Blurring the scene along the velocity direction
 */
export class VelocityMotionBlurPass {
    /**
     * @param {THREE.Scene} scene - Scene to render velocity from
     * @param {THREE.Camera} camera - Camera for rendering
     * @param {Object} options - Configuration
     * @param {number} [options.samples=8] - Blur samples (more = smoother but slower)
     * @param {number} [options.intensity=1.0] - Blur intensity multiplier
     * @param {number} [options.width] - Render target width (defaults to renderer width)
     * @param {number} [options.height] - Render target height (defaults to renderer height)
     */
    constructor(scene, camera, options = {}) {
        this.scene = scene;
        this.camera = camera;
        this.enabled = true;
        this.needsSwap = true;
        this.clear = false;
        this.renderToScreen = false;

        const {
            samples = 8,
            intensity = 1.0,
            width = null,
            height = null
        } = options;

        this.samples = samples;
        this.intensity = intensity;

        // Create velocity render target (will be sized on first render)
        this.velocityTarget = null;
        this.targetWidth = width;
        this.targetHeight = height;

        // Create velocity material
        this.velocityMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uPrevModelViewMatrix: { value: new THREE.Matrix4() },
                uPrevProjectionMatrix: { value: new THREE.Matrix4() },
                uIsInstanced: { value: 0.0 },
                uResolution: { value: new THREE.Vector2() }
            },
            vertexShader: VELOCITY_VERTEX_SHADER,
            fragmentShader: VELOCITY_FRAGMENT_SHADER
        });

        // Create blur material
        this.blurMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tColor: { value: null },
                tVelocity: { value: null },
                uIntensity: { value: intensity },
                uSamples: { value: samples },
                uResolution: { value: new THREE.Vector2() }
            },
            vertexShader: BLUR_VERTEX_SHADER,
            fragmentShader: BLUR_FRAGMENT_SHADER
        });

        // Fullscreen quad for blur pass
        this.fsQuad = new FullScreenQuad(this.blurMaterial);

        // Track objects for velocity calculation
        this.prevMatrices = new WeakMap();

        // List of instanced meshes to include in velocity pass
        this.instancedMeshes = new Set();
    }

    /**
     * Registers an instanced mesh for velocity rendering.
     * The mesh must have an aVelocity attribute.
     * @param {THREE.InstancedMesh} mesh
     */
    addInstancedMesh(mesh) {
        this.instancedMeshes.add(mesh);
    }

    /**
     * Removes an instanced mesh from velocity rendering.
     * @param {THREE.InstancedMesh} mesh
     */
    removeInstancedMesh(mesh) {
        this.instancedMeshes.delete(mesh);
    }

    /**
     * Sets the blur intensity.
     * @param {number} intensity
     */
    setIntensity(intensity) {
        this.intensity = intensity;
        this.blurMaterial.uniforms.uIntensity.value = intensity;
    }

    /**
     * Sets the number of blur samples.
     * @param {number} samples
     */
    setSamples(samples) {
        this.samples = Math.min(16, Math.max(2, samples));
        this.blurMaterial.uniforms.uSamples.value = this.samples;
    }

    /**
     * Sets render target size.
     * @param {number} width
     * @param {number} height
     */
    setSize(width, height) {
        this.targetWidth = width;
        this.targetHeight = height;

        if (this.velocityTarget) {
            this.velocityTarget.setSize(width, height);
        }

        this.velocityMaterial.uniforms.uResolution.value.set(width, height);
        this.blurMaterial.uniforms.uResolution.value.set(width, height);
    }

    /**
     * Renders the motion blur pass.
     * @param {THREE.WebGLRenderer} renderer
     * @param {THREE.WebGLRenderTarget} writeBuffer
     * @param {THREE.WebGLRenderTarget} readBuffer
     */
    render(renderer, writeBuffer, readBuffer) {
        if (!this.enabled) {
            // Pass through without blur
            if (this.renderToScreen) {
                renderer.setRenderTarget(null);
                this.fsQuad.material = new THREE.MeshBasicMaterial({ map: readBuffer.texture });
                this.fsQuad.render(renderer);
            }
            return;
        }

        const width = this.targetWidth || readBuffer.width;
        const height = this.targetHeight || readBuffer.height;

        // Create/resize velocity target if needed
        if (!this.velocityTarget || this.velocityTarget.width !== width || this.velocityTarget.height !== height) {
            if (this.velocityTarget) {
                this.velocityTarget.dispose();
            }
            this.velocityTarget = new THREE.WebGLRenderTarget(width, height, {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                type: THREE.FloatType
            });
            this.velocityMaterial.uniforms.uResolution.value.set(width, height);
            this.blurMaterial.uniforms.uResolution.value.set(width, height);
        }

        // Pass 1: Render velocity buffer
        this._renderVelocityPass(renderer);

        // Pass 2: Apply motion blur
        this.blurMaterial.uniforms.tColor.value = readBuffer.texture;
        this.blurMaterial.uniforms.tVelocity.value = this.velocityTarget.texture;

        if (this.renderToScreen) {
            renderer.setRenderTarget(null);
        } else {
            renderer.setRenderTarget(writeBuffer);
            if (this.clear) renderer.clear();
        }

        this.fsQuad.render(renderer);
    }

    /**
     * Renders the velocity pass.
     * @private
     */
    _renderVelocityPass(renderer) {
        const currentRenderTarget = renderer.getRenderTarget();

        renderer.setRenderTarget(this.velocityTarget);
        renderer.setClearColor(0x808080);  // Neutral velocity (0,0)
        renderer.clear();

        // Render instanced meshes with velocity
        for (const mesh of this.instancedMeshes) {
            if (!mesh.visible) continue;

            const originalMaterial = mesh.material;
            mesh.material = this.velocityMaterial;
            this.velocityMaterial.uniforms.uIsInstanced.value = 1.0;

            renderer.render(mesh, this.camera);

            mesh.material = originalMaterial;
        }

        // Could also render non-instanced objects using prev frame transforms
        // For now, we focus on instanced elements

        renderer.setRenderTarget(currentRenderTarget);
    }

    /**
     * Disposes of resources.
     */
    dispose() {
        if (this.velocityTarget) {
            this.velocityTarget.dispose();
        }
        this.velocityMaterial.dispose();
        this.blurMaterial.dispose();
        this.fsQuad.dispose();
        this.instancedMeshes.clear();
    }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// FULLSCREEN QUAD HELPER
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Simple fullscreen quad for post-processing.
 * Three.js has FullScreenQuad in examples, but we include our own for zero deps.
 */
class FullScreenQuad {
    constructor(material) {
        this._mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2),
            material
        );
        this._camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    }

    get material() {
        return this._mesh.material;
    }

    set material(value) {
        this._mesh.material = value;
    }

    render(renderer) {
        renderer.render(this._mesh, this._camera);
    }

    dispose() {
        this._mesh.geometry.dispose();
    }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SIMPLIFIED MOTION BLUR (No velocity buffer)
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Simpler motion blur that uses camera movement instead of per-object velocity.
 * Lower quality but easier to integrate and faster.
 */
export class SimpleMotionBlurPass {
    /**
     * @param {Object} options - Configuration
     * @param {number} [options.samples=8] - Blur samples
     * @param {number} [options.intensity=1.0] - Blur intensity
     * @param {THREE.Vector2} [options.direction] - Blur direction (null = radial)
     */
    constructor(options = {}) {
        this.enabled = true;
        this.needsSwap = true;
        this.clear = false;
        this.renderToScreen = false;

        const {
            samples = 8,
            intensity = 1.0,
            direction = null
        } = options;

        this.samples = samples;
        this.intensity = intensity;
        this.direction = direction;

        // Simple directional blur shader
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                tDiffuse: { value: null },
                uIntensity: { value: intensity },
                uSamples: { value: samples },
                uDirection: { value: direction || new THREE.Vector2(0.5, 0.5) },
                uCenter: { value: new THREE.Vector2(0.5, 0.5) },
                uRadial: { value: direction ? 0.0 : 1.0 }
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
                uniform float uIntensity;
                uniform int uSamples;
                uniform vec2 uDirection;
                uniform vec2 uCenter;
                uniform float uRadial;
                varying vec2 vUv;

                void main() {
                    vec2 dir;
                    if (uRadial > 0.5) {
                        // Radial blur from center
                        dir = (vUv - uCenter) * uIntensity * 0.1;
                    } else {
                        // Directional blur
                        dir = uDirection * uIntensity * 0.01;
                    }

                    vec4 color = vec4(0.0);
                    float totalWeight = 0.0;

                    for (int i = 0; i < 16; i++) {
                        if (i >= uSamples) break;
                        float t = float(i) / float(uSamples - 1) - 0.5;
                        vec2 sampleUv = clamp(vUv + dir * t, 0.001, 0.999);
                        float weight = 1.0 - abs(t * 2.0);
                        color += texture2D(tDiffuse, sampleUv) * weight;
                        totalWeight += weight;
                    }

                    gl_FragColor = color / totalWeight;
                }
            `
        });

        this.fsQuad = new FullScreenQuad(this.material);
    }

    setIntensity(intensity) {
        this.intensity = intensity;
        this.material.uniforms.uIntensity.value = intensity;
    }

    setSamples(samples) {
        this.samples = Math.min(16, Math.max(2, samples));
        this.material.uniforms.uSamples.value = this.samples;
    }

    setDirection(x, y) {
        this.material.uniforms.uDirection.value.set(x, y);
        this.material.uniforms.uRadial.value = 0.0;
    }

    setRadial(centerX = 0.5, centerY = 0.5) {
        this.material.uniforms.uCenter.value.set(centerX, centerY);
        this.material.uniforms.uRadial.value = 1.0;
    }

    setSize(/* width, height */) {
        // Not needed for this simple pass
    }

    render(renderer, writeBuffer, readBuffer) {
        if (!this.enabled || this.intensity < 0.01) {
            return;
        }

        this.material.uniforms.tDiffuse.value = readBuffer.texture;

        if (this.renderToScreen) {
            renderer.setRenderTarget(null);
        } else {
            renderer.setRenderTarget(writeBuffer);
            if (this.clear) renderer.clear();
        }

        this.fsQuad.render(renderer);
    }

    dispose() {
        this.material.dispose();
        this.fsQuad.dispose();
    }
}

export default { VelocityMotionBlurPass, SimpleMotionBlurPass };
