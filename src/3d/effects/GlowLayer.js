/**
 * Isolated Glow Layer Effect
 *
 * A completely separate rendering layer that creates an expanding luminous halo
 * around the crystal during glow/flash gestures. This effect is:
 *
 * - INVISIBLE at baseline (opacity=0, no geometry rendered)
 * - Only activates when glowAmount > 0
 * - Renders AFTER all existing post-processing
 * - Uses its own dedicated scene/camera/render pass
 *
 * ARCHITECTURE:
 * The key insight is that this layer is completely isolated from the main
 * rendering pipeline. It doesn't touch bloom, materials, or the crystal shader.
 * The glow layer renders as a screen-space overlay guaranteed to appear on top.
 *
 * Visual effect: An expanding luminous halo/ring that emanates from the crystal
 * during glow gestures, fading at the edges like light radiating outward.
 */

import * as THREE from 'three';

export class GlowLayer {
    /**
     * Create a glow layer effect
     * @param {THREE.WebGLRenderer} renderer - Three.js renderer
     */
    constructor(renderer) {
        this.renderer = renderer;

        // Current glow state
        this.glowAmount = 0; // 0 = invisible, >0 = visible
        this.targetGlowAmount = 0;
        this.glowColor = new THREE.Color(1.0, 1.0, 1.0);
        this.targetGlowColor = new THREE.Color(1.0, 1.0, 1.0);
        this.worldPosition = new THREE.Vector3(0, 0, 0);

        // Animation state
        this.time = 0;
        this.ringPhase = 0; // For animated ring expansion

        // Own scene and camera for screen-space rendering
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        this.camera.position.z = 1;

        // Create the glow geometry and material
        this.createGlowMesh();

        // Temp vectors for calculations
        this._tempVector = new THREE.Vector3();
        this._tempColor = new THREE.Color();
    }

    /**
     * Create the glow mesh with expandable ring/halo geometry
     * @private
     */
    createGlowMesh() {
        // Create a large quad that covers the screen
        // The shader will handle the actual ring/halo shape
        const geometry = new THREE.PlaneGeometry(2, 2);

        const material = new THREE.ShaderMaterial({
            uniforms: {
                glowAmount: { value: 0.0 },
                glowColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
                centerUV: { value: new THREE.Vector2(0.5, 0.5) },
                time: { value: 0.0 },
                ringPhase: { value: 0.0 }, // 0 = tight ring, 1 = expanded
                aspectRatio: { value: 1.0 },
            },
            vertexShader: `
                varying vec2 vUv;

                void main() {
                    vUv = uv;
                    gl_Position = vec4(position.xy, 0.0, 1.0);
                }
            `,
            fragmentShader: `
                uniform float glowAmount;
                uniform vec3 glowColor;
                uniform vec2 centerUV;
                uniform float time;
                uniform float ringPhase;
                uniform float aspectRatio;

                varying vec2 vUv;

                void main() {
                    // Aspect-correct UV coordinates - apply aspect to Y instead
                    // This prevents horizontal clipping on wide screens
                    vec2 centeredUV = vUv - centerUV;
                    // Don't multiply by aspect - let glow be circular in screen space

                    float dist = length(centeredUV);

                    // Ring parameters that evolve with ringPhase
                    // MUCH LARGER radii to prevent clipping - glow can extend to screen edges
                    // At ringPhase=0: tight ring close to center
                    // At ringPhase=1: expanded ring that can fill most of screen
                    float innerRadius = mix(0.02, 0.08, ringPhase);
                    float outerRadius = mix(0.15, 1.2, ringPhase);  // Can extend beyond screen!
                    float peakRadius = mix(0.06, 0.25, ringPhase);

                    // Create soft ring falloff
                    // Inner falloff: 0 at center, 1 at peak
                    float innerFalloff = smoothstep(innerRadius * 0.3, peakRadius, dist);

                    // Outer falloff: 1 at peak, 0 at outer edge (very gradual fade)
                    float outerFalloff = 1.0 - smoothstep(peakRadius, outerRadius, dist);

                    // Combine for ring shape
                    float ringIntensity = innerFalloff * outerFalloff;

                    // Add subtle shimmer/undulation
                    float shimmer = 0.9 + 0.1 * sin(time * 3.0 + dist * 20.0);

                    // Final intensity with glow amount control
                    float intensity = ringIntensity * glowAmount * shimmer;

                    // Soft glow color with intensity
                    // Use HDR values (>1.0) for bloom pickup
                    vec3 color = glowColor * intensity * 2.0;

                    // Alpha for blending - GlowLayer needs true alpha transparency
                    // for its overlay effect (unlike water which uses opaque additive)
                    float alpha = intensity * 0.6;

                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            depthWrite: false,
        });

        this.glowMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.glowMesh);
    }

    /**
     * Update glow parameters
     * @param {number} glowAmount - Glow intensity (0 = off, >0 = active)
     * @param {THREE.Color|Array} color - Glow color
     * @param {THREE.Vector3} worldPosition - World position of the glow source
     */
    setGlow(glowAmount, color, worldPosition) {
        this.targetGlowAmount = Math.max(0, glowAmount);

        if (color) {
            if (Array.isArray(color)) {
                this.targetGlowColor.setRGB(color[0], color[1], color[2]);
            } else {
                this.targetGlowColor.copy(color);
            }
        }

        if (worldPosition) {
            this.worldPosition.copy(worldPosition);
        }
    }

    /**
     * Update the glow layer animation
     * @param {number} deltaTime - Time since last frame in milliseconds
     * @param {THREE.Camera} mainCamera - Main scene camera for projection
     */
    update(deltaTime, mainCamera) {
        const dt = deltaTime / 1000; // Convert to seconds
        this.time += dt;

        // Smooth lerp to target glow amount
        const lerpSpeed = 8.0; // Fast response for gestures
        this.glowAmount +=
            (this.targetGlowAmount - this.glowAmount) * Math.min(1.0, lerpSpeed * dt);

        // Smooth lerp color
        this.glowColor.lerp(this.targetGlowColor, Math.min(1.0, lerpSpeed * dt));

        // Update ring phase based on glow amount
        // Ring expands as glow increases, contracts as it fades
        const targetPhase = Math.min(1.0, this.glowAmount);
        this.ringPhase += (targetPhase - this.ringPhase) * Math.min(1.0, 4.0 * dt);

        // Project world position to screen UV
        if (mainCamera) {
            this._tempVector.copy(this.worldPosition);
            this._tempVector.project(mainCamera);

            // Convert from NDC (-1 to 1) to UV (0 to 1)
            const centerU = (this._tempVector.x + 1) / 2;
            const centerV = (this._tempVector.y + 1) / 2;

            this.glowMesh.material.uniforms.centerUV.value.set(centerU, centerV);
        }

        // Update uniforms
        this.glowMesh.material.uniforms.glowAmount.value = this.glowAmount;
        this.glowMesh.material.uniforms.glowColor.value.copy(this.glowColor);
        this.glowMesh.material.uniforms.time.value = this.time;
        this.glowMesh.material.uniforms.ringPhase.value = this.ringPhase;

        // Update aspect ratio
        const canvas = this.renderer.domElement;
        this.glowMesh.material.uniforms.aspectRatio.value = canvas.width / canvas.height;
    }

    /**
     * Render the glow layer
     * Should be called AFTER the main scene render with autoClear: false
     * @param {THREE.WebGLRenderer} renderer - WebGL renderer
     */
    render(renderer) {
        // Only render if there's visible glow
        if (this.glowAmount < 0.001) {
            return;
        }

        // Save renderer state
        const { autoClear } = renderer;
        renderer.autoClear = false;

        // Render glow layer on top of existing frame
        renderer.render(this.scene, this.camera);

        // Restore state
        renderer.autoClear = autoClear;
    }

    /**
     * Check if glow layer is currently active (visible)
     * @returns {boolean} True if glow is active
     */
    isActive() {
        return this.glowAmount > 0.001 || this.targetGlowAmount > 0;
    }

    /**
     * Dispose of glow layer resources
     */
    dispose() {
        if (this.glowMesh) {
            this.glowMesh.geometry.dispose();
            this.glowMesh.material.dispose();
            this.scene.remove(this.glowMesh);
            this.glowMesh = null;
        }

        this.scene = null;
        this.camera = null;
        this._tempVector = null;
        this._tempColor = null;
    }
}
