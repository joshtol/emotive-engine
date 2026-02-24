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
import {
    SOUL_BEHAVIOR_UNIFORMS_GLSL, SOUL_BEHAVIOR_FUNC_GLSL,
    SOUL_BEHAVIOR_NAMES, createSoulBehaviorUniforms, setSoulBehavior,
    resolveBehaviorMode
} from '../shaders/utils/soulBehaviors.js';

// Cache for loaded inclusion geometry
let inclusionGeometryCache = null;
let inclusionGeometryLoading = null;

// Vertex shader for soul effect
const soulVertexShader = `
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
        vPosition = position;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
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
    uniform float colorDriftSpeed;   // Speed of color drift (default 0.15)
    uniform float colorDriftAmount;  // How far colors drift from base (default 0.3)

    // Blend layer uniforms
    uniform float blendLayer1Mode;
    uniform float blendLayer1Strength;
    uniform float blendLayer1Enabled;
    uniform float blendLayer2Mode;
    uniform float blendLayer2Strength;
    uniform float blendLayer2Enabled;

    // Soul behavior system
    ${SOUL_BEHAVIOR_UNIFORMS_GLSL}

    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    // Blend modes (injected from blendModesGLSL)
    ${blendModesGLSL}

    // Sin-free hash — fract/dot arithmetic (no sin())
    float soulHash(vec3 p) {
        p = fract(p * vec3(443.8975, 397.2973, 491.1871));
        p += dot(p.zxy, p.yxz + 19.19);
        return fract(p.x * p.y * p.z);
    }

    // True 3D noise — 8 hash lookups with trilinear interpolation
    // (Previous version only interpolated x/y — missing z caused visible banding)
    float noise3D(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        f = f * f * (3.0 - 2.0 * f); // smoothstep

        // 8 cube corners
        float a = soulHash(i);
        float b = soulHash(i + vec3(1, 0, 0));
        float c = soulHash(i + vec3(0, 1, 0));
        float d = soulHash(i + vec3(1, 1, 0));
        float e = soulHash(i + vec3(0, 0, 1));
        float g = soulHash(i + vec3(1, 0, 1));
        float h = soulHash(i + vec3(0, 1, 1));
        float j = soulHash(i + vec3(1, 1, 1));

        // Trilinear interpolation
        return mix(
            mix(mix(a, b, f.x), mix(c, d, f.x), f.y),
            mix(mix(e, g, f.x), mix(h, j, f.x), f.y),
            f.z
        );
    }

    // Soul behavior functions (must come after noise3D)
    ${SOUL_BEHAVIOR_FUNC_GLSL}

    void main() {
        // Dispatch to active behavior — returns energy in 0.53-0.60 range
        float rawBehavior = calculateSoulBehavior(
            vPosition, time, uBehaviorSpeed,
            driftEnabled, driftSpeed,
            crossWaveEnabled, crossWaveSpeed,
            phaseOffset1, phaseOffset2, phaseOffset3
        );

        // Expand narrow behavior range [0.53, 0.60] to full [0, 1] display range
        // Behaviors output tight range for mixing stability; remap here for contrast
        float rawEffectActivity = clamp((rawBehavior - 0.53) / 0.07, 0.0, 1.0);

        // Total energy for color calculation
        // Compress range so dim↔bright swing is gentler (less pulsing)
        float totalEnergy = 0.30 + rawEffectActivity * 0.38;

        // Edge glow - adds rim lighting (proper camera-relative view direction)
        vec3 viewDir = normalize(vViewPosition);
        float edgeGlow = 1.0 - abs(dot(vNormal, viewDir));
        edgeGlow = pow(edgeGlow, 2.0) * 0.4;

        // Color drift — warm/cool variants derived from the emotion color itself
        // Warm: boost reds/greens, pull back blues (shift toward warmer hue)
        vec3 warmColor = emotionColor * vec3(1.2, 1.05, 0.8);
        // Cool: boost blues, pull back reds (shift toward cooler hue)
        vec3 coolColor = emotionColor * vec3(0.8, 0.95, 1.25);

        // Spatially-varying blend using noise + slow time drift
        float driftT = time * colorDriftSpeed;
        float spatialDrift = noise3D(vPosition * 2.0 + vec3(driftT, driftT * 0.7, driftT * 0.4));
        float spatialDrift2 = noise3D(vPosition * 4.0 - vec3(driftT * 0.5, driftT * 0.3, driftT * 0.8));
        // Blend factor: 0 to 1 range (warm to cool)
        float driftFactor = spatialDrift * 0.65 + spatialDrift2 * 0.35;

        // Blend: warm ← emotionColor → cool
        vec3 driftedColor = mix(warmColor, coolColor, driftFactor) * colorDriftAmount
                          + emotionColor * (1.0 - colorDriftAmount);

        // Final color before blend layers
        vec3 coreColor = driftedColor * totalEnergy * energyIntensity;
        coreColor += driftedColor * edgeGlow * 0.3;

        // Apply blend layers to the entire soul color
        // Mix factor clamped to [0,1] — strength > 1.0 only scales the blend color,
        // it must NOT extrapolate the mix (which causes blowout/crushing)
        if (blendLayer1Enabled > 0.5) {
            int mode = int(blendLayer1Mode + 0.5);
            vec3 blendResult = applyBlendMode(coreColor, emotionColor * blendLayer1Strength, mode);
            coreColor = mix(coreColor, blendResult, min(blendLayer1Strength, 1.0));
        }
        if (blendLayer2Enabled > 0.5) {
            int mode = int(blendLayer2Mode + 0.5);
            vec3 blendResult = applyBlendMode(coreColor, emotionColor * blendLayer2Strength, mode);
            coreColor = mix(coreColor, blendResult, min(blendLayer2Strength, 1.0));
        }

        // Ghost mode: ONLY the traveling energy bands are visible
        // Everything below the threshold is completely invisible
        float alpha = baseOpacity;
        if (ghostMode > 0.01) {
            // Threshold splits the 0-1 range: below = invisible, above = visible
            float threshold = ghostMode * 0.4; // 0.0-0.4 range (softer than 0.5)
            float visibility = smoothstep(threshold, threshold + 0.35, rawEffectActivity);

            // Soft cutoff - dim areas fade rather than hard-clip
            alpha = visibility * baseOpacity;

            // Discard only truly invisible fragments
            if (alpha < 0.02) {
                discard;
            }

            // Boost color intensity for visible bands
            coreColor *= 1.0 + visibility * 0.3;
        }

        // Fade near outer boundary so soul doesn't overbloom where it clips crystal shell
        // Inclusion geometry is ~0.15 radius; wider fade (0.06-0.20) for gentler edge
        float boundaryDist = length(vPosition);
        float boundaryFade = 1.0 - smoothstep(0.06, 0.20, boundaryDist);
        alpha *= boundaryFade;
        if (alpha < 0.01) discard;

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
     * @param {Object} options.renderer - ThreeRenderer instance for scene locking
     * @param {string} options.assetBasePath - Base path for assets (default: '/assets')
     */
    constructor(options = {}) {
        this.radius = options.radius || 0.15;
        this.detail = options.detail || 1;
        this.geometryType = options.geometryType || 'crystal';
        this.renderer = options.renderer || null;  // ThreeRenderer for scene locking
        this.assetBasePath = options.assetBasePath || '/assets';

        this.mesh = null;
        this.material = null;
        this.parentMesh = null;
        this.baseScale = 1.0;  // Full size by default (size=1.0)
        this._pendingParent = null;
        this._disposed = false;  // Track disposal state for async safety

        // Behavior mix state — AB pair is the current settled state
        this._mixState = { modeA: 0, modeB: 0, blend: 0.0 };
        this._crossfade = null;  // { targetA, targetB, targetBlend, progress, duration }

        this._createMesh();
    }

    /**
     * Load the inclusion geometry from OBJ file
     * @param {string} assetBasePath - Base path for assets (default: '/assets')
     * @returns {Promise<THREE.BufferGeometry>}
     * @private
     */
    static _loadInclusionGeometry(assetBasePath = '/assets') {
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
                `${assetBasePath}/models/Crystal/inclusion.obj`,
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
     * Uses inclusion geometry if available (from cache), falls back to octahedron
     * @private
     */
    _createMesh() {
        // Create material first (shared regardless of geometry)
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                emotionColor: { value: new THREE.Color(1, 1, 1) },
                energyIntensity: { value: 0.8 },  // Fixed value - no per-frame update needed
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
                // Color drift uniforms
                colorDriftSpeed: { value: 0.15 },    // Slow organic drift
                colorDriftAmount: { value: 0.3 },    // Subtle but visible shift
                // Soul behavior uniforms
                ...createSoulBehaviorUniforms(),
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

        // Use cached inclusion geometry if available (preloaded by Core3DManager),
        // otherwise fall back to octahedron
        let geometry;
        if (inclusionGeometryCache) {
            geometry = inclusionGeometryCache.clone();
        } else {
            // Fallback octahedron - will be used if preloading didn't happen
            geometry = new THREE.OctahedronGeometry(this.radius, this.detail);
        }

        this.mesh = new THREE.Mesh(geometry, this.material);
        this.mesh.name = 'crystalSoul';
        this.mesh.renderOrder = 0;
        this.mesh.layers.set(2);
    }

    /**
     * Attach the soul to a parent mesh (adds to same scene, syncs position each frame)
     * @param {THREE.Mesh} parentMesh - The mesh to follow (e.g., crystal, heart)
     * @param {THREE.Scene} scene - The scene to add the soul to
     */
    attachTo(parentMesh, scene) {
        if (this._disposed) {
            return;
        }

        if (!parentMesh) {
            console.warn('[CrystalSoul] Cannot attach to null parent');
            return;
        }

        if (!this.mesh) {
            console.warn('[CrystalSoul] Cannot attach - mesh is null');
            return;
        }

        // Remove from previous parent if any
        if (this.mesh.parent) {
            this.mesh.parent.remove(this.mesh);
        }

        this.parentMesh = parentMesh;
        this._scene = scene;

        // Add to scene as separate object (not child of parentMesh)
        // This keeps soul at full scale regardless of parent's morph scale
        if (scene && !this.mesh.parent) {
            scene.add(this.mesh);
        }

        // Sync initial position
        this._syncPosition();
        this.mesh.visible = true;
    }

    /**
     * Sync soul world position/rotation to parent mesh
     * Called each frame to follow the parent
     * @private
     */
    _syncPosition() {
        if (!this.parentMesh || !this.mesh) return;

        // Copy world position from parent
        this.parentMesh.getWorldPosition(this.mesh.position);
        this.parentMesh.getWorldQuaternion(this.mesh.quaternion);
    }

    /**
     * Detach from current parent
     * Marks invisible but does NOT remove from scene (removal happens in dispose)
     * This avoids Three.js render loop race conditions
     */
    detach() {
        if (!this.mesh) return;

        // Mark invisible - DO NOT remove from scene here
        // Removal during render causes race conditions with projectObject traversal
        // The mesh will be removed properly in dispose() on next frame
        this.mesh.visible = false;
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

        // Update emotion color only if changed (avoid unnecessary GPU uniform sync)
        if (uniforms.emotionColor && glowColor) {
            const current = uniforms.emotionColor.value;
            if (current.r !== glowColor[0] || current.g !== glowColor[1] || current.b !== glowColor[2]) {
                current.setRGB(glowColor[0], glowColor[1], glowColor[2]);
            }
        }

        // Note: energyIntensity is fixed at 0.8 (set in constructor, no per-frame update needed)

        // Tick crossfade between AB (current) and CD (target) pairs
        if (this._crossfade) {
            const cf = this._crossfade;
            cf.progress += deltaTime / cf.duration;
            if (cf.progress >= 1.0) {
                // Complete: copy CD → AB, reset crossfade
                this._mixState.modeA = cf.targetA;
                this._mixState.modeB = cf.targetB;
                this._mixState.blend = cf.targetBlend;
                if (uniforms.uBehaviorMode) uniforms.uBehaviorMode.value = cf.targetA;
                if (uniforms.uBehaviorModeB) uniforms.uBehaviorModeB.value = cf.targetB;
                if (uniforms.uBehaviorBlend) uniforms.uBehaviorBlend.value = cf.targetBlend;
                if (uniforms.uBehaviorCrossfade) uniforms.uBehaviorCrossfade.value = 0.0;
                this._crossfade = null;
            } else {
                // Ease-in-out cubic
                const p = cf.progress;
                const eased = p < 0.5
                    ? 4.0 * p * p * p
                    : 1.0 - Math.pow(-2.0 * p + 2.0, 3) / 2.0;
                if (uniforms.uBehaviorCrossfade) uniforms.uBehaviorCrossfade.value = eased;
            }
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
        // Color drift
        if (params.colorDriftSpeed !== undefined && uniforms.colorDriftSpeed) {
            uniforms.colorDriftSpeed.value = params.colorDriftSpeed;
        }
        if (params.colorDriftAmount !== undefined && uniforms.colorDriftAmount) {
            uniforms.colorDriftAmount.value = Math.max(0, Math.min(1.0, params.colorDriftAmount));
        }
        // Behavior mode (string name or integer)
        if (params.behaviorMode !== undefined) {
            this.setBehavior(params.behaviorMode);
        }
        if (params.behaviorSpeed !== undefined) {
            setSoulBehavior(this.material, undefined, params.behaviorSpeed);
        }
        // Mix params
        if (params.mixA !== undefined && params.mixB !== undefined) {
            this.setMix(params.mixA, params.mixB, params.mixBlend ?? 0.5);
        }
    }

    /**
     * Mix two behaviors with adjustable weight
     * @param {string|number} modeA - Primary behavior name or integer
     * @param {string|number} modeB - Secondary behavior name or integer
     * @param {number} blend - Blend ratio (0.0 = all A, 1.0 = all B)
     * @param {number} [transitionMs=2000] - Ease duration in ms (0 for instant)
     */
    setMix(modeA, modeB, blend, transitionMs = 2000) {
        if (!this.material?.uniforms) return;
        const u = this.material.uniforms;

        const intA = resolveBehaviorMode(modeA);
        const intB = resolveBehaviorMode(modeB);
        const targetBlend = Math.max(0, Math.min(1, blend));

        // No change from current settled state?
        if (!this._crossfade
            && intA === this._mixState.modeA && intB === this._mixState.modeB
            && targetBlend === this._mixState.blend) {
            return;
        }

        if (transitionMs <= 0) {
            // Instant — set AB directly, no crossfade
            this._mixState.modeA = intA;
            this._mixState.modeB = intB;
            this._mixState.blend = targetBlend;
            if (u.uBehaviorMode) u.uBehaviorMode.value = intA;
            if (u.uBehaviorModeB) u.uBehaviorModeB.value = intB;
            if (u.uBehaviorBlend) u.uBehaviorBlend.value = targetBlend;
            if (u.uBehaviorCrossfade) u.uBehaviorCrossfade.value = 0.0;
            this._crossfade = null;
            return;
        }

        // If mid-crossfade, snap AB to the old target to settle it, then start fresh
        if (this._crossfade) {
            const old = this._crossfade;
            this._mixState.modeA = old.targetA;
            this._mixState.modeB = old.targetB;
            this._mixState.blend = old.targetBlend;
            if (u.uBehaviorMode) u.uBehaviorMode.value = old.targetA;
            if (u.uBehaviorModeB) u.uBehaviorModeB.value = old.targetB;
            if (u.uBehaviorBlend) u.uBehaviorBlend.value = old.targetBlend;
            if (u.uBehaviorCrossfade) u.uBehaviorCrossfade.value = 0.0;
            this._crossfade = null;
        }

        // Set CD uniforms for the new target
        if (u.uBehaviorModeC) u.uBehaviorModeC.value = intA;
        if (u.uBehaviorModeD) u.uBehaviorModeD.value = intB;
        if (u.uBehaviorBlendCD) u.uBehaviorBlendCD.value = targetBlend;
        if (u.uBehaviorCrossfade) u.uBehaviorCrossfade.value = 0.0;

        // Start crossfade from AB (current) → CD (target)
        this._crossfade = {
            targetA: intA,
            targetB: intB,
            targetBlend,
            progress: 0,
            duration: transitionMs
        };
    }

    /**
     * Set a single soul behavior mode with crossfade transition
     * @param {string|number} mode - Behavior name ('nebula', 'spiral', 'tidal',
     *   'orbital', 'radial', 'hotspot') or integer (0-5)
     * @param {number} [speed] - Optional speed multiplier (0.1-5.0)
     * @param {number} [transitionMs=2000] - Crossfade duration in ms (0 for instant)
     */
    setBehavior(mode, speed, transitionMs = 2000) {
        if (speed !== undefined) {
            setSoulBehavior(this.material, undefined, speed);
        }
        if (mode !== undefined) {
            const modeInt = resolveBehaviorMode(mode);
            // Single behavior = both slots same mode, blend irrelevant
            this.setMix(modeInt, modeInt, 0.0, transitionMs);
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
        return this.parentMesh !== null && this.mesh !== null && this.mesh.parent !== null;
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
     * Removes from scene SYNCHRONOUSLY to prevent Three.js projectObject crash,
     * but defers geometry disposal to next frame for safety.
     */
    dispose() {
        // Prevent double disposal
        if (this._disposed) return;

        // Set disposed flag FIRST to prevent async callbacks from running
        this._disposed = true;

        // Store references for cleanup BEFORE clearing them
        const meshToDispose = this.mesh;
        const materialToDispose = this.material;

        // CRITICAL FIX: Remove from scene SYNCHRONOUSLY
        // This prevents Three.js projectObject from encountering the mesh after
        // we've cleared our references. The previous deferred removal caused
        // race conditions when morphing away from crystal-type geometries.
        if (meshToDispose?.parent) {
            meshToDispose.parent.remove(meshToDispose);
        }

        // Mark invisible (belt and suspenders)
        if (meshToDispose) {
            meshToDispose.visible = false;
        }

        // Clear references immediately
        this.mesh = null;
        this.material = null;
        this.parentMesh = null;

        // Defer ONLY geometry disposal to next frame
        // Scene removal already happened synchronously above
        requestAnimationFrame(() => {
            if (meshToDispose?.geometry) {
                meshToDispose.geometry.dispose();
            }
            if (materialToDispose) {
                materialToDispose.dispose();
            }
        });
    }
}
