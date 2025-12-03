/**
 * CrystalSoul - Inner glowing core effect for translucent geometries
 *
 * A reusable soul/core effect that can be added to any translucent geometry
 * (crystal, diamond, heart, etc). Creates an animated glowing octahedron
 * with drifting energy and shimmer effects.
 */

import * as THREE from 'three';

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

    varying vec3 vPosition;
    varying vec3 vNormal;

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

        // Final color
        vec3 coreColor = emotionColor * totalEnergy * energyIntensity;
        coreColor += emotionColor * edgeGlow * 0.3;

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
                shimmerSpeed: { value: 0.5 }
            },
            vertexShader: soulVertexShader,
            fragmentShader: soulFragmentShader,
            transparent: false,
            side: THREE.FrontSide
        });

        this.mesh = new THREE.Mesh(geometry, this.material);
        this.mesh.name = 'crystalSoul';
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

        // Debug: check parent mesh properties including geometry bounds
        const bbox = parentMesh.geometry?.boundingBox;
        console.log('[SOUL DEBUG] Attaching to parent:', {
            parentName: parentMesh.name,
            parentScale: parentMesh.scale.toArray(),
            parentPosition: parentMesh.position.toArray(),
            geometryBounds: bbox ? { min: bbox.min.toArray(), max: bbox.max.toArray() } : 'no bbox',
            parentVisible: parentMesh.visible
        });

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
     * Check if soul is attached to a parent
     * @returns {boolean}
     */
    isAttached() {
        return this.parentMesh !== null && this.mesh.parent === this.parentMesh;
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
