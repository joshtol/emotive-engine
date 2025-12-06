/**
 * CrystalSoul - Inner glowing core effect for translucent geometries
 *
 * A reusable soul/core effect that can be added to any translucent geometry
 * (crystal, diamond, heart, etc). Creates an animated glowing inclusion
 * with drifting energy and shimmer effects.
 */

import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { blendModesGLSL } from '../shaders/utils/blendModes.js';

// Cache for loaded inclusion geometry
let inclusionGeometryCache = null;
let inclusionGeometryLoading = null;

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

        // Output the computed core color with full opacity
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
     * @param {number} options.radius - Base radius for fallback geometry (default: 0.15)
     * @param {number} options.detail - Detail level for fallback geometry (default: 1)
     */
    constructor(options = {}) {
        this.radius = options.radius || 0.15;
        this.detail = options.detail || 1;
        this.geometryType = options.geometryType || 'crystal';

        this.mesh = null;
        this.material = null;
        this.parentMesh = null;
        this.baseScale = 0.5;
        this._pendingParent = null;

        this._createMesh();
    }

    /**
     * Load the inclusion geometry from OBJ file
     * @returns {Promise<THREE.BufferGeometry>}
     * @private
     */
    static _loadInclusionGeometry() {
        // Return cached geometry if available
        if (inclusionGeometryCache) {
            return Promise.resolve(inclusionGeometryCache.clone());
        }

        // Return existing loading promise if in progress
        if (inclusionGeometryLoading) {
            return inclusionGeometryLoading.then(geo => geo.clone());
        }

        // Start loading
        inclusionGeometryLoading = new Promise((resolve) => {
            const loader = new OBJLoader();
            loader.load(
                '/assets/models/Crystal/inclusion.obj',
                (obj) => {
                    let geometry = null;
                    obj.traverse(child => {
                        if (child.isMesh && child.geometry) {
                            geometry = child.geometry;
                        }
                    });

                    if (geometry) {
                        // Center the geometry
                        geometry.computeBoundingBox();
                        const center = new THREE.Vector3();
                        geometry.boundingBox.getCenter(center);
                        geometry.translate(-center.x, -center.y, -center.z);

                        // Rotate 90 degrees around X-axis to make it vertical
                        geometry.rotateX(Math.PI / 2);

                        // Scale to unit size (will be scaled by baseScale)
                        geometry.computeBoundingBox();
                        const size = new THREE.Vector3();
                        geometry.boundingBox.getSize(size);
                        const maxDim = Math.max(size.x, size.y, size.z);
                        const scale = 0.3 / maxDim;  // Target ~0.3 unit radius
                        geometry.scale(scale, scale, scale);

                        geometry.computeVertexNormals();
                        inclusionGeometryCache = geometry;
                        console.log('[🔮 SOUL] Inclusion geometry loaded');
                        resolve(geometry.clone());
                    } else {
                        console.warn('[🔮 SOUL] No mesh in inclusion.obj, using fallback');
                        resolve(null);
                    }
                },
                undefined,
                (err) => {
                    console.warn('[🔮 SOUL] Failed to load inclusion.obj:', err);
                    resolve(null);
                }
            );
        });

        return inclusionGeometryLoading;
    }

    /**
     * Create the soul mesh with shader material
     * Uses inclusion geometry if available, falls back to octahedron
     * @private
     */
    _createMesh() {
        // Create material first (shared regardless of geometry)
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
            depthWrite: true,
            depthTest: true,
            side: THREE.FrontSide
        });

        // Start with fallback octahedron geometry
        const fallbackGeometry = new THREE.OctahedronGeometry(this.radius, this.detail);
        this.mesh = new THREE.Mesh(fallbackGeometry, this.material);
        this.mesh.name = 'crystalSoul';
        this.mesh.renderOrder = 0;
        this.mesh.layers.set(2);

        // Async load inclusion geometry and swap when ready
        CrystalSoul._loadInclusionGeometry().then(geometry => {
            if (geometry && this.mesh) {
                // Dispose old geometry
                this.mesh.geometry.dispose();
                // Use inclusion geometry
                this.mesh.geometry = geometry;
                console.log('[🔮 SOUL] Switched to inclusion geometry');

                // Re-attach if we had a pending parent
                if (this._pendingParent) {
                    this.attachTo(this._pendingParent);
                    this._pendingParent = null;
                }
            }
        });

        console.log(`[🔮 SOUL] created: radius=${this.radius} layer=${this.mesh.layers.mask} (loading inclusion...)`);
    }

    /**
     * Attach the soul to a parent mesh (adds to scene, syncs position)
     * Soul is added to the scene root (not as child) so it can be on a separate layer
     * @param {THREE.Mesh} parentMesh - The mesh to follow (e.g., crystal, heart)
     */
    attachTo(parentMesh) {
        if (!parentMesh) {
            console.warn('[CrystalSoul] Cannot attach to null parent');
            return;
        }

        // Remove from previous scene if any
        if (this.mesh.parent) {
            this.mesh.parent.remove(this.mesh);
        }

        this.parentMesh = parentMesh;

        // Add to scene directly (not as child of parentMesh)
        // This allows the soul to be rendered on layer 2 independently
        let scene = parentMesh;
        while (scene.parent) {
            scene = scene.parent;
        }
        scene.add(this.mesh);

        // Sync initial position
        this._syncPosition();

        // DEBUG: Log attachment details
        const pwp = parentMesh.getWorldPosition(new THREE.Vector3());
        console.log(`[🔮 SOUL] attached: parent=${parentMesh.name} parentPos=[${pwp.x.toFixed(2)},${pwp.y.toFixed(2)},${pwp.z.toFixed(2)}] soulPos=[${this.mesh.position.x.toFixed(2)},${this.mesh.position.y.toFixed(2)},${this.mesh.position.z.toFixed(2)}] layer=${this.mesh.layers.mask} visible=${this.mesh.visible} inScene=${scene.children.includes(this.mesh)}`);
    }

    /**
     * Sync soul world position/rotation to parent mesh
     * Called automatically on attach and should be called each frame
     * @private
     */
    _syncPosition() {
        if (this.parentMesh && this.mesh) {
            this.parentMesh.getWorldPosition(this.mesh.position);
            this.parentMesh.getWorldQuaternion(this.mesh.quaternion);
        }
    }

    /**
     * Detach from current parent
     */
    detach() {
        if (this.mesh.parent) {
            this.mesh.parent.remove(this.mesh);
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

        // Sync position with parent mesh each frame
        this._syncPosition();

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

        // Map size (0-1) to scale (0.05-1.0) - allows very small soul for crystal
        const scale = 0.05 + size * 0.95;
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
        return this.parentMesh !== null && this.mesh.parent !== null;
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
