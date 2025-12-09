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
    uniform float crossWaveEnabled;
    uniform float crossWaveSpeed;
    uniform float ghostMode;      // 0.0 = solid, 1.0 = ghost (only visible through bloom)
    uniform float baseOpacity;    // Base opacity when not in ghost mode (default 1.0)
    uniform float phaseOffset1;   // Phase offset for primary drift (radians)
    uniform float phaseOffset2;   // Phase offset for secondary drift (radians)
    uniform float phaseOffset3;   // Phase offset for crosswave (radians)

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
        // Start with zero energy - only effects add to it
        float driftEnergy = 0.0;
        float crossWaveEnergy = 0.0;

        // Spatially triangulated fire bands - each owns a 120° wedge of the geometry
        // Bands can never overlap because they're physically separated
        float angle = atan(vPosition.x, vPosition.z); // -π to π
        float normalizedAngle = (angle + 3.14159) / 6.28318; // 0 to 1

        // Determine which zone this fragment belongs to (0, 1, or 2)
        float zone = floor(normalizedAngle * 3.0);
        float zonePos = fract(normalizedAngle * 3.0); // Position within zone (0-1)

        // Time-based phase for each zone (120° offset in time)
        float phaseSpeed = 0.15;
        float t = time * phaseSpeed;
        float phase1Time = sin(t + phaseOffset1) * 0.5 + 0.5;
        float phase2Time = sin(t + phaseOffset2) * 0.5 + 0.5;
        float phase3Time = sin(t + phaseOffset3) * 0.5 + 0.5;

        // Only ONE phase affects this fragment - the one that owns this spatial zone
        float activePhase = zone < 1.0 ? phase1Time : (zone < 2.0 ? phase2Time : phase3Time);

        float primaryDrift = 0.0;
        float secondaryDrift = 0.0;

        if (driftEnabled > 0.5) {
            float t = time * driftSpeed;
            // Primary drift - moving in one direction
            float drift1 = noise3D(vPosition * 2.0 + vec3(t, t * 0.7, t * 0.3));
            float drift2 = noise3D(vPosition * 3.0 - vec3(t * 0.5, t, t * 0.8));
            // Use max instead of multiply to avoid near-zero products
            primaryDrift = max(drift1, drift2);
            primaryDrift = max(0.0, primaryDrift - 0.4) * 2.0; // Rescale after threshold

            // Secondary drift - offset in opposite direction to fill gaps
            float drift3 = noise3D(vPosition * 2.5 - vec3(t * 0.8, t * 0.4, t));
            float drift4 = noise3D(vPosition * 1.8 + vec3(t * 0.6, t * 0.9, t * 0.2));
            secondaryDrift = max(drift3, drift4);
            secondaryDrift = max(0.0, secondaryDrift - 0.4) * 2.0;

            driftEnergy = primaryDrift + secondaryDrift;
        }

        // Horizontal cross wave - thin bands sweeping across
        float rawCrossWave = 0.0;
        if (crossWaveEnabled > 0.5) {
            float t = time * crossWaveSpeed;
            float wave = sin(vPosition.x * 4.0 + vPosition.z * 2.0 - t) * 0.5 + 0.5;
            // pow(4) for thin bright bands
            rawCrossWave = pow(wave, 4.0);
            crossWaveEnergy = rawCrossWave;
        }

        // Mix the effects - normalize to prevent blowout
        // driftEnergy can be 0-2 (two drifts), rawCrossWave is 0-1
        float normalizedDrift = min(1.0, driftEnergy * 0.5);
        float normalizedWave = rawCrossWave;

        // activePhase is 0-1, remap to visibility range
        // 0.53 floor (just above 0.52 threshold), 0.58 ceiling (subtle glow)
        float remappedPhase = 0.53 + activePhase * 0.05;

        // Effects add subtle variation (max 0.05)
        float effectContrib = (normalizedDrift * 0.03) + (normalizedWave * 0.02);
        float phasedActivity = remappedPhase + effectContrib;

        // Keep unclamped for visibility threshold check (ghost mode needs full range)
        float rawEffectActivity = phasedActivity;
        // Clamp for color intensity (floor: guaranteed visible, ceiling: no blowout)
        float effectActivity = clamp(phasedActivity, 0.53, 0.60);

        // Total energy for color calculation (reduced for subtler bloom)
        float totalEnergy = 0.25 + effectActivity * 0.55; // Base glow + effect contribution

        // Edge glow - adds rim lighting
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

        // Ghost mode: ONLY the traveling fire bands are visible
        // Everything below the threshold is completely invisible
        float alpha = baseOpacity;
        if (ghostMode > 0.01) {
            // High threshold - only the peaks of the thin bands pass through
            float threshold = 0.4 + ghostMode * 0.4; // 0.4-0.8 range
            float visibility = smoothstep(threshold, threshold + 0.05, rawEffectActivity);

            // Hard cutoff - only bright fire bands visible
            alpha = visibility * baseOpacity;

            // Discard everything that isn't a bright fire band
            if (alpha < 0.05) {
                discard;
            }

            // Boost color intensity for visible fire
            coreColor *= 1.2 + visibility * 0.6;
        }

        // Output the computed core color
        gl_FragColor = vec4(coreColor, alpha);
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
        this.baseScale = 1.0;  // Full size by default (size=1.0)
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
        inclusionGeometryLoading = new Promise(resolve => {
            const loader = new OBJLoader();
            loader.load(
                '/assets/models/Crystal/inclusion.obj',
                obj => {
                    let geometry = null;
                    obj.traverse(child => {
                        if (child.isMesh && child.geometry) {
                            ({ geometry } = child);
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
                        resolve(geometry.clone());
                    } else {
                        console.warn('[🔮 SOUL] No mesh in inclusion.obj, using fallback');
                        resolve(null);
                    }
                },
                undefined,
                err => {
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
                crossWaveEnabled: { value: 1.0 },
                crossWaveSpeed: { value: 0.4 },
                ghostMode: { value: 0.36 },    // 0.36 = partial ghost, 0.0 = solid, 1.0 = full ghost
                baseOpacity: { value: 1.0 },   // Base opacity when not in ghost mode
                // 3-phase offsets (radians) - default to 120° apart
                phaseOffset1: { value: 0.0 },
                phaseOffset2: { value: 2.094 },  // 2π/3 = 120°
                phaseOffset3: { value: 4.189 },  // 4π/3 = 240°
                // Blend layer uniforms - Quartz preset defaults
                blendLayer1Mode: { value: 2 },       // Color Burn
                blendLayer1Strength: { value: 2.3 },
                blendLayer1Enabled: { value: 1 },
                blendLayer2Mode: { value: 0 },       // Multiply
                blendLayer2Strength: { value: 1.0 },
                blendLayer2Enabled: { value: 1 }
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

                // Re-attach if we had a pending parent
                if (this._pendingParent) {
                    this.attachTo(this._pendingParent);
                    this._pendingParent = null;
                }
            }
        });
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
     * @param {boolean} params.crossWaveEnabled - Enable/disable horizontal cross wave
     * @param {number} params.crossWaveSpeed - Cross wave animation speed (0.1-3.0)
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
        if (params.crossWaveEnabled !== undefined && uniforms.crossWaveEnabled) {
            uniforms.crossWaveEnabled.value = params.crossWaveEnabled ? 1.0 : 0.0;
        }
        if (params.crossWaveSpeed !== undefined && uniforms.crossWaveSpeed) {
            uniforms.crossWaveSpeed.value = Math.max(0.1, Math.min(3.0, params.crossWaveSpeed));
        }
        // Phase offsets (0 to 2π radians)
        if (params.phaseOffset1 !== undefined && uniforms.phaseOffset1) {
            uniforms.phaseOffset1.value = params.phaseOffset1;
        }
        if (params.phaseOffset2 !== undefined && uniforms.phaseOffset2) {
            uniforms.phaseOffset2.value = params.phaseOffset2;
        }
        if (params.phaseOffset3 !== undefined && uniforms.phaseOffset3) {
            uniforms.phaseOffset3.value = params.phaseOffset3;
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
     * Set ghost mode - soul is only visible through bloom when effects are active
     * @param {boolean} enabled - Whether ghost mode is enabled
     */
    setGhostMode(enabled) {
        if (this.material && this.material.uniforms && this.material.uniforms.ghostMode) {
            this.material.uniforms.ghostMode.value = enabled ? 1.0 : 0.0;
        }
    }

    /**
     * Set base opacity (only used when not in ghost mode)
     * @param {number} opacity - Opacity value 0-1
     */
    setBaseOpacity(opacity) {
        if (this.material && this.material.uniforms && this.material.uniforms.baseOpacity) {
            this.material.uniforms.baseOpacity.value = Math.max(0, Math.min(1, opacity));
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
