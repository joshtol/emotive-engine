/**
 * CrystalSoul - Inner glowing core effect for translucent geometries
 *
 * A reusable soul/core effect that can be added to any translucent geometry
 * (crystal, diamond, heart, etc). Creates an animated glowing octahedron
 * with drifting energy and shimmer effects.
 */

import * as THREE from 'three';
import { blendModesGLSL } from '../shaders/utils/blendModes.js';

// Vertex shader for soul effect
const soulVertexShader = `
    varying vec3 vPosition;
    varying vec3 vNormal;

    void main() {
        vPosition = position;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

// Fragment shader for animated energy effect
const soulFragmentShader = `
    uniform float time;
    uniform vec3 emotionColor;
    uniform float energyIntensity;
    uniform float driftEnabled;
    uniform float driftSpeed;
    uniform float shimmerEnabled;
    uniform float shimmerSpeed;

    // Blend layer uniforms
    uniform float blendLayer1Mode;
    uniform float blendLayer1Strength;
    uniform float blendLayer1Enabled;
    uniform float blendLayer2Mode;
    uniform float blendLayer2Strength;
    uniform float blendLayer2Enabled;

    varying vec3 vPosition;
    varying vec3 vNormal;

    // Blend modes (injected from blendModesGLSL)
    ${blendModesGLSL}

    // Smooth noise function
    float noise3D(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float n = i.x + i.y * 157.0 + i.z * 113.0;
        vec4 v = fract(sin(vec4(n, n+1.0, n+157.0, n+158.0)) * 43758.5453);
        return mix(mix(v.x, v.y, f.x), mix(v.z, v.w, f.x), f.y);
    }

    void main() {
        // Drifting energy clouds - slow, ethereal movement
        float energy = 0.8;
        if (driftEnabled > 0.5) {
            float t = time * driftSpeed;
            float drift1 = noise3D(vPosition * 2.0 + vec3(t, t * 0.7, t * 0.3));
            float drift2 = noise3D(vPosition * 3.0 - vec3(t * 0.5, t, t * 0.8));
            energy = 0.5 + drift1 * drift2 * 1.0;
        }

        // Vertical shimmer - slow rising bands
        float shimmer = 0.0;
        if (shimmerEnabled > 0.5) {
            float t = time * shimmerSpeed;
            shimmer = sin(vPosition.y * 5.0 - t) * 0.5 + 0.5;
        }

        // Combine effects
        float totalEnergy = energy;
        totalEnergy += shimmer * 0.2;

        // Edge glow
        vec3 viewDir = normalize(-vPosition);
        float edgeGlow = 1.0 - abs(dot(vNormal, viewDir));
        edgeGlow = pow(edgeGlow, 2.0) * 0.4;

        // Final color before blend layers
        vec3 coreColor = emotionColor * totalEnergy * energyIntensity;
        coreColor += emotionColor * edgeGlow * 0.3;

        // Apply blend layers to the entire soul color
        if (blendLayer1Enabled > 0.5) {
            int mode = int(blendLayer1Mode + 0.5);
            vec3 blendResult = applyBlendMode(coreColor, emotionColor * blendLayer1Strength, mode);
            coreColor = mix(coreColor, blendResult, blendLayer1Strength);
        }
        if (blendLayer2Enabled > 0.5) {
            int mode = int(blendLayer2Mode + 0.5);
            vec3 blendResult = applyBlendMode(coreColor, emotionColor * blendLayer2Strength, mode);
            coreColor = mix(coreColor, blendResult, blendLayer2Strength);
        }

        gl_FragColor = vec4(coreColor, 1.0);
    }
`;

/**
 * CrystalSoul class - manages the inner glowing core
 */
export class CrystalSoul {
    /**
     * Create a new CrystalSoul
     * @param {Object} options - Configuration options
     * @param {number} options.radius - Octahedron radius (default: 0.35)
     * @param {number} options.detail - Octahedron detail level (default: 1)
     */
    constructor(options = {}) {
        this.radius = options.radius || 0.35;
        this.detail = options.detail || 1;
        this.geometryType = options.geometryType || 'crystal';

        this.mesh = null;
        this.material = null;
        this.parentMesh = null;
        this.baseScale = 1.0;

        this._createMesh();
    }

    /**
     * Create the soul mesh with shader material
     * @private
     */
    _createMesh() {
        const geometry = new THREE.OctahedronGeometry(this.radius, this.detail);

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                emotionColor: { value: new THREE.Color(1, 1, 1) },
                energyIntensity: { value: 1.5 },
                driftEnabled: { value: 1.0 },
                driftSpeed: { value: 0.5 },
                shimmerEnabled: { value: 1.0 },
                shimmerSpeed: { value: 0.5 },
                // Blend layer uniforms
                blendLayer1Mode: { value: 0 },
                blendLayer1Strength: { value: 0 },
                blendLayer1Enabled: { value: 0 },
                blendLayer2Mode: { value: 0 },
                blendLayer2Strength: { value: 0 },
                blendLayer2Enabled: { value: 0 }
            },
            vertexShader: soulVertexShader,
            fragmentShader: soulFragmentShader,
            transparent: true,
            depthWrite: false,
            depthTest: false,  // Always render, ignore depth
            side: THREE.FrontSide
        });

        this.mesh = new THREE.Mesh(geometry, this.material);
        this.mesh.name = 'crystalSoul';
        this.mesh.renderOrder = 1;  // Render after shell (shell is 0)
    }

    /**
     * Attach the soul to a parent mesh
     * @param {THREE.Mesh} parentMesh - The mesh to attach to (e.g., crystal, heart)
     */
    attachTo(parentMesh) {
        if (!parentMesh) {
            console.warn('[CrystalSoul] Cannot attach to null parent');
            return;
        }

        // Remove from previous parent if any
        if (this.parentMesh && this.mesh.parent === this.parentMesh) {
            this.parentMesh.remove(this.mesh);
        }

        this.parentMesh = parentMesh;
        parentMesh.add(this.mesh);
    }

    /**
     * Detach from current parent
     */
    detach() {
        if (this.parentMesh && this.mesh.parent === this.parentMesh) {
            this.parentMesh.remove(this.mesh);
        }
        this.parentMesh = null;
    }

    /**
     * Update the soul animation and color
     * @param {number} deltaTime - Time since last frame in ms
     * @param {Array} glowColor - RGB color array [r, g, b] (0-1 range)
     * @param {number} breathScale - Optional breathing scale multiplier
     */
    update(deltaTime, glowColor, breathScale = 1.0) {
        if (!this.material || !this.material.uniforms) return;

        const {uniforms} = this.material;

        // Update time for animation
        if (uniforms.time) {
            uniforms.time.value += deltaTime / 1000;
        }

        // Update emotion color
        if (uniforms.emotionColor && glowColor) {
            uniforms.emotionColor.value.setRGB(
                glowColor[0], glowColor[1], glowColor[2]
            );
        }

        // Fixed intensity matching original implementation
        if (uniforms.energyIntensity) {
            uniforms.energyIntensity.value = 0.8;
        }

        // Apply breathing scale
        if (this.mesh) {
            this.mesh.scale.setScalar(this.baseScale * breathScale);
        }
    }

    /**
     * Set the soul size
     * @param {number} size - Size value 0-1, where 0.5 is default
     */
    setSize(size) {
        if (!this.mesh) return;

        // Map size (0-1) to scale (0.3-1.5)
        const scale = 0.3 + size * 1.2;
        this.baseScale = scale;
        this.mesh.scale.setScalar(scale);
    }

    /**
     * Set soul effect parameters
     * @param {Object} params - Effect parameters
     * @param {boolean} params.driftEnabled - Enable/disable drifting energy
     * @param {number} params.driftSpeed - Drift animation speed (0.1-3.0)
     * @param {boolean} params.shimmerEnabled - Enable/disable vertical shimmer
     * @param {number} params.shimmerSpeed - Shimmer animation speed (0.1-3.0)
     */
    setEffects(params = {}) {
        if (!this.material || !this.material.uniforms) return;

        const {uniforms} = this.material;

        if (params.driftEnabled !== undefined && uniforms.driftEnabled) {
            uniforms.driftEnabled.value = params.driftEnabled ? 1.0 : 0.0;
        }
        if (params.driftSpeed !== undefined && uniforms.driftSpeed) {
            uniforms.driftSpeed.value = Math.max(0.1, Math.min(3.0, params.driftSpeed));
        }
        if (params.shimmerEnabled !== undefined && uniforms.shimmerEnabled) {
            uniforms.shimmerEnabled.value = params.shimmerEnabled ? 1.0 : 0.0;
        }
        if (params.shimmerSpeed !== undefined && uniforms.shimmerSpeed) {
            uniforms.shimmerSpeed.value = Math.max(0.1, Math.min(3.0, params.shimmerSpeed));
        }
    }

    /**
     * Set emotion color directly
     * @param {Array} color - RGB array [r, g, b] (0-1 range)
     */
    setColor(color) {
        if (this.material && this.material.uniforms && this.material.uniforms.emotionColor) {
            this.material.uniforms.emotionColor.value.setRGB(color[0], color[1], color[2]);
        }
    }

    /**
     * Set blend layers for the soul
     * @param {Array} layers - Array of layer objects [{mode, strength, enabled}, ...]
     */
    setBlendLayers(layers) {
        if (!this.material || !this.material.uniforms) return;

        const u = this.material.uniforms;

        // Layer 1
        if (layers[0]) {
            if (u.blendLayer1Mode) u.blendLayer1Mode.value = layers[0].mode ?? 0;
            if (u.blendLayer1Strength) u.blendLayer1Strength.value = layers[0].strength ?? 0;
            if (u.blendLayer1Enabled) u.blendLayer1Enabled.value = layers[0].enabled ? 1 : 0;
        } else {
            if (u.blendLayer1Enabled) u.blendLayer1Enabled.value = 0;
        }

        // Layer 2
        if (layers[1]) {
            if (u.blendLayer2Mode) u.blendLayer2Mode.value = layers[1].mode ?? 0;
            if (u.blendLayer2Strength) u.blendLayer2Strength.value = layers[1].strength ?? 0;
            if (u.blendLayer2Enabled) u.blendLayer2Enabled.value = layers[1].enabled ? 1 : 0;
        } else {
            if (u.blendLayer2Enabled) u.blendLayer2Enabled.value = 0;
        }
    }

    /**
     * Check if soul is attached to a parent
     * @returns {boolean}
     */
    isAttached() {
        return this.parentMesh !== null && this.mesh.parent === this.parentMesh;
    }

    /**
     * Set soul visibility
     * @param {boolean} visible - Whether the soul should be visible
     */
    setVisible(visible) {
        if (this.mesh) {
            this.mesh.visible = visible;
        }
    }

    /**
     * Dispose of resources
     */
    dispose() {
        this.detach();

        if (this.mesh) {
            if (this.mesh.geometry) {
                this.mesh.geometry.dispose();
            }
            this.mesh = null;
        }

        if (this.material) {
            this.material.dispose();
            this.material = null;
        }

        this.parentMesh = null;
    }
}
