/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Element Instanced Spawner
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview GPU-efficient element spawning using instanced rendering
 * @module effects/ElementInstancedSpawner
 *
 * Replaces the original ElementSpawner with a pool-based architecture:
 * - 1 InstancedMesh per element type (fire, ice, water, etc.)
 * - Merged geometry with all model variants baked in
 * - Per-instance attributes for animation (no material cloning!)
 * - Trails as additional instance slots (not separate meshes)
 * - Time-offset animation calculated in shaders
 *
 * This fixes the GPU memory leaks caused by material cloning in the original.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Pool and geometry utilities
import { ElementInstancePool } from './ElementInstancePool.js';
import { MergedGeometryBuilder } from './MergedGeometryBuilder.js';

// Element type registry - decouples spawner from specific element implementations
// Import bare registry — element registrations are side effects loaded by index-with-elementals.js
import { ElementTypeRegistry } from './ElementTypeRegistry.js';

// Spatial reference for mascot-relative positioning
import { MascotSpatialRef } from './MascotSpatialRef.js';

// Shared sizing/orientation logic (Golden Ratio system from original ElementSpawner)
import {
    getModelOrientation,
    getModelSizeFraction,
    calculateElementScale
} from './ElementSizing.js';

// Shared positioning logic (surface sampling, orientation, embed depth)
import {
    sampleSurfacePoints,
    calculateOrientation,
    calculateSurfacePosition
} from './ElementPositioning.js';

// Animation state machine for per-element lifecycle
import { AnimationState, AnimationStates } from './animation/AnimationState.js';
import { AnimationConfig, evaluateEnergy } from './animation/AnimationConfig.js';
import { getEasing } from './animation/Easing.js';

// Axis-travel utilities from spawn-modes (shared with legacy spawner)
import {
    parseAxisTravelConfig,
    expandFormation,
    calculateAxisTravelPosition
} from './spawn-modes/AxisTravelMode.js';

// Anchor utilities from spawn-modes
import {
    parseAnchorConfig,
    calculateAnchorPosition,
    getAnchorOrientation
} from './spawn-modes/AnchorMode.js';

// Orbit utilities from spawn-modes
import {
    parseOrbitConfig,
    expandOrbitFormation,
    calculateOrbitPosition
} from './spawn-modes/OrbitMode.js';

// Surface utilities from spawn-modes
import { parseSurfaceConfig } from './spawn-modes/SurfaceMode.js';

// RadialBurst utilities from spawn-modes
import {
    parseRadialBurstConfig,
    calculateRadialBurstInitialState,
    calculateRadialBurstUpdateState
} from './spawn-modes/index.js';

// ═══════════════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════

const MAX_ELEMENTS_PER_TYPE = 48;  // Max logical elements per type (×4 for trails = 192 instances)

// Default scale multiplier for surface mode elements (matches original ElementSpawner)
const DEFAULT_SCALE_MULTIPLIER = 1.5;

// ═══════════════════════════════════════════════════════════════════════════════════════
// TEMP OBJECT POOL (avoid per-frame allocations)
// ═══════════════════════════════════════════════════════════════════════════════════════

const _temp = {
    position: new THREE.Vector3(),
    quaternion: new THREE.Quaternion(),
    quaternion2: new THREE.Quaternion(),  // For rotation offsets
    scale: new THREE.Vector3(1, 1, 1),
    euler: new THREE.Euler(),             // For rotation offset application
    direction: new THREE.Vector3(),
    axis: new THREE.Vector3(),            // For axis-angle rotation
    up: new THREE.Vector3(0, 1, 0)
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// ELEMENT INSTANCED SPAWNER
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * GPU-efficient element spawner using instanced rendering.
 */
export class ElementInstancedSpawner {
    /**
     * @param {Object} options
     * @param {THREE.Scene} options.scene - Scene to add elements to
     * @param {THREE.Mesh} [options.coreMesh] - Mascot mesh for spatial reference
     * @param {THREE.Camera} [options.camera] - Camera for orientation calculations
     * @param {string} [options.assetsBasePath=''] - Base path for model assets
     * @param {Object} [options.renderer] - ThreeRenderer for refraction mesh registration
     */
    constructor(options = {}) {
        const {
            scene,
            coreMesh = null,
            camera = null,
            assetsBasePath = '',
            renderer = null
        } = options;

        if (!scene) {
            throw new Error('[ElementInstancedSpawner] Scene is required');
        }

        this.scene = scene;
        this.coreMesh = coreMesh;
        this.camera = camera;
        this.assetsBasePath = assetsBasePath;
        this._renderer = renderer;

        // Container for all element meshes
        this.container = new THREE.Group();
        this.container.name = 'ElementInstancedSpawner';
        this.scene.add(this.container);

        // Mascot spatial reference for positioning
        this.spatialRef = new MascotSpatialRef();
        if (coreMesh) {
            this.spatialRef.initialize(coreMesh);
        }

        // Pools per element type
        this.pools = new Map();  // elementType -> ElementInstancePool

        // Model geometry cache
        this.geometryCache = new Map();  // modelPath -> BufferGeometry
        this.loader = new GLTFLoader();

        // Merged geometries per element type
        this.mergedGeometries = new Map();  // elementType -> { geometry, modelMap }

        // Materials per element type (one per type, shared across all instances)
        this.materials = new Map();  // elementType -> ShaderMaterial

        // Active element tracking
        this.activeElements = new Map();  // elementId -> { type, poolId, spawnTime, ... }

        // Global time
        this.time = 0;

        // Element ID counter
        this._nextId = 0;

        // Initialization state
        this._initialized = new Set();  // Element types that have been initialized
        this._initializing = new Map();  // Element types currently initializing -> Promise

        // Pool cleanup tracking (dispose pools after inactivity)
        this._poolLastUsed = new Map();  // elementType -> timestamp

        // Cached model geometry diameters for mascot-relative diameter calculations
        this._modelGeometryDiameters = new Map();  // modelName -> diameter in model space
        this._poolCleanupInterval = 30000;  // 30 seconds of inactivity before disposal
        this._lastCleanupCheck = 0;

        // Per-type parameterAnimation configs for atmospheric energy evaluation
        // Stored at gesture start, evaluated each frame to drive particle energy
        this._parameterAnimations = new Map();  // elementType -> parsed parameterAnimation object
    }

    /**
     * Gets the mascot radius for scale calculations.
     * @returns {number}
     */
    get mascotRadius() {
        return this.spatialRef.radius || 1.0;
    }

    // ═══════════════════════════════════════════════════════════════════════════════════════
    // COMPATIBILITY API (matches old ElementSpawner for drop-in replacement)
    // ═══════════════════════════════════════════════════════════════════════════════════════

    /**
     * Initialize with mascot mesh and camera.
     * Called by Core3DManager after coreMesh is available.
     * @param {THREE.Mesh} coreMesh - Mascot mesh
     * @param {THREE.Camera} camera - Camera for orientation
     */
    initialize(coreMesh, camera) {
        this.coreMesh = coreMesh;
        this.camera = camera;
        if (coreMesh) {
            this.spatialRef.initialize(coreMesh);
        }
    }

    /**
     * Preload models for an element type.
     * This initializes the pool which loads and merges all geometries.
     * @param {string} elementType - Element type to preload
     * @returns {Promise<void>}
     */
    async preloadModels(elementType) {
        // Only preload if we have config for this element type
        if (!ElementTypeRegistry.get(elementType)) {
            // Silently skip unsupported elements for now
            // They'll use the old spawner until we add instanced materials
            return;
        }
        await this.initializePool(elementType);
    }

    /**
     * Check if elements of a type are currently active.
     * @param {string} elementType - Element type to check
     * @returns {boolean}
     */
    hasElements(elementType) {
        for (const data of this.activeElements.values()) {
            if (data.type === elementType) {
                return true;
            }
        }
        return false;
    }

    /**
     * Initializes a pool for an element type.
     * Loads models, creates merged geometry, and sets up the instanced mesh.
     * @param {string} elementType - Element type to initialize
     * @returns {Promise<ElementInstancePool>}
     */
    async initializePool(elementType) {
        // Already initialized
        if (this._initialized.has(elementType)) {
            return this.pools.get(elementType);
        }

        // Currently initializing - wait for it
        if (this._initializing.has(elementType)) {
            return this._initializing.get(elementType);
        }

        // Start initialization
        const initPromise = this._doInitializePool(elementType);
        this._initializing.set(elementType, initPromise);

        try {
            const pool = await initPromise;
            this._initialized.add(elementType);
            return pool;
        } finally {
            this._initializing.delete(elementType);
        }
    }

    /**
     * Internal pool initialization.
     * @private
     */
    async _doInitializePool(elementType) {
        const config = ElementTypeRegistry.get(elementType);
        if (!config) {
            console.warn(`[ElementInstancedSpawner] Unknown element type: ${elementType}`);
            return null;
        }

        // Load all models for this element type (parallel)
        const loadPromises = config.models.map(modelName => {
            const modelPath = `${this.assetsBasePath}/${config.basePath}${modelName}`;
            return this._loadGeometry(modelPath).then(geometry => {
                return geometry ? { geometry, name: modelName.replace('.glb', '') } : null;
            });
        });
        const results = await Promise.all(loadPromises);
        const geometries = results.filter(r => r !== null);

        if (geometries.length === 0) {
            console.error(`[ElementInstancedSpawner] No models loaded for ${elementType}`);
            return null;
        }

        // Create merged geometry
        const builder = new MergedGeometryBuilder();
        for (const { geometry, name } of geometries) {
            builder.addGeometry(geometry, name);
        }
        const { geometry: mergedGeometry, modelMap } = builder.build();
        builder.dispose(); // Clean up cloned geometries
        this.mergedGeometries.set(elementType, { geometry: mergedGeometry, modelMap });

        // Create instanced material
        const material = config.createMaterial();
        this.materials.set(elementType, material);

        // Store original depthWrite so it can be restored between gestures
        material.userData._originalDepthWrite = material.depthWrite;

        // Create pool
        const pool = new ElementInstancePool(mergedGeometry, material, MAX_ELEMENTS_PER_TYPE);
        this.pools.set(elementType, pool);

        // Add the instanced mesh to the container
        this.container.add(pool.mesh);

        // Register mesh for screen-space refraction if material requests it
        if (this._renderer && material.userData.needsRefraction) {
            this._renderer.addRefractionMesh(pool.mesh);
        }

        // Register mesh for velocity-based motion blur
        if (this._renderer?.motionBlurPass) {
            this._renderer.motionBlurPass.addInstancedMesh(pool.mesh);
        }

        // Register distortion config if element type has one (and not already registered)
        if (this._distortionManager && config.distortion &&
            !this._distortionManager.hasElement(elementType)) {
            const dist = config.distortion;
            this._distortionManager.registerElement(elementType, {
                geometry: dist.geometry(),
                material: dist.material(),
                transform: dist.transform,
                billboard: dist.billboard,
                strength: dist.strength,
            });
        }

        // Particle atmospherics are now per-gesture (started in _applyShaderAnimationOverrides)
        // No registration needed here — emitters are created on-demand from gesture configs


        return pool;
    }

    /**
     * Loads a geometry from a GLTF file, or generates procedural geometry
     * for models that don't need external assets.
     * @private
     */
    async _loadGeometry(modelPath) {
        // Check cache
        if (this.geometryCache.has(modelPath)) {
            return this.geometryCache.get(modelPath);
        }

        // Procedural geometry: void-orb is a sphere, no GLB needed
        if (modelPath.includes('void-orb.glb')) {
            const geometry = new THREE.IcosahedronGeometry(0.5, 4);
            this.geometryCache.set(modelPath, geometry);
            return geometry;
        }

        // Procedural geometry: void-disk is a circular billboard disk (for singularity/hollow)
        if (modelPath.includes('void-disk.glb')) {
            const geometry = new THREE.CircleGeometry(0.5, 32);
            this.geometryCache.set(modelPath, geometry);
            return geometry;
        }

        // Procedural geometry: light-ray is an elongated diamond (billboard ray of light)
        if (modelPath.includes('light-ray.glb')) {
            const shape = new THREE.Shape();
            shape.moveTo(0, 0.6);     // Top point (elongated)
            shape.lineTo(0.12, 0);    // Right
            shape.lineTo(0, -0.6);    // Bottom point
            shape.lineTo(-0.12, 0);   // Left
            shape.closePath();
            const geometry = new THREE.ShapeGeometry(shape);
            this.geometryCache.set(modelPath, geometry);
            return geometry;
        }

        // Procedural geometry: light-orb is a glowing sphere
        if (modelPath.includes('light-orb.glb')) {
            const geometry = new THREE.IcosahedronGeometry(0.4, 3);
            this.geometryCache.set(modelPath, geometry);
            return geometry;
        }

        try {
            const gltf = await new Promise((resolve, reject) => {
                this.loader.load(modelPath, resolve, undefined, reject);
            });

            // Find the first mesh in the scene
            let geometry = null;
            gltf.scene.traverse(child => {
                if (!geometry && child.isMesh) {
                    ({ geometry } = child);
                }
            });

            if (geometry) {
                // void-ring is exported in XZ plane — rotate -90° X to match XY convention of all other rings
                if (modelPath.includes('void-ring')) {
                    geometry.rotateX(-Math.PI / 2);
                }
                this.geometryCache.set(modelPath, geometry);
                return geometry;
            }

            console.warn(`[ElementInstancedSpawner] No mesh found in ${modelPath}`);
            return null;
        } catch (error) {
            console.error(`[ElementInstancedSpawner] Failed to load ${modelPath}:`, error);
            return null;
        }
    }

    /**
     * Spawns elements around the mascot.
     * @param {string} elementType - Element type ('fire', 'ice', etc.)
     * @param {Object} options
     * @param {number} [options.count=8] - Number of elements to spawn
     * @param {string|Object} [options.mode='orbit'] - Spawn mode string or config object
     * @param {number} [options.intensity=1.0] - Spawn intensity
     * @param {Array<string>} [options.models] - Specific models to use
     * @param {THREE.Camera} [options.camera] - Camera for orientation calculations
     * @param {Object} [options.animation] - Animation config for elements
     * @param {number} [options.gestureDuration=1000] - Gesture duration in ms
     * @returns {Promise<string[]>} Array of spawned element IDs
     */
    async spawn(elementType, options = {}) {
        const {
            count = 8,
            mode = 'orbit',
            intensity = 1.0,
            models = null,
            camera = null,
            animation = null,
            gestureDuration = 1000
        } = options;

        // ═══════════════════════════════════════════════════════════════════════════════════════
        // SPAWN LAYERS - If mode is an array, spawn each layer independently
        // Each layer can have its own type, timing (appearAt/disappearAt), models, etc.
        // ═══════════════════════════════════════════════════════════════════════════════════════
        if (Array.isArray(mode)) {

            // Ensure pool is initialized first
            const pool = await this.initializePool(elementType);
            if (!pool) {
                return [];
            }

            // Track pool usage time for cleanup
            this._poolLastUsed.set(elementType, performance.now());

            // Clear existing elements (only once for all layers)
            this.despawn(elementType);

            // Reset cutout, grain, and shader animation to default state to prevent bleeding from previous gesture
            const elementConfig = ElementTypeRegistry.get(elementType);
            const material = this.materials.get(elementType);
            if (elementConfig?.resetCutout && material) {
                elementConfig.resetCutout(material);
            }
            if (elementConfig?.resetGrain && material) {
                elementConfig.resetGrain(material);
            }
            if (elementConfig?.resetFlash && material) {
                elementConfig.resetFlash(material);
            }
            if (elementConfig?.resetRelay && material) {
                elementConfig.resetRelay(material);
            }
            if (elementConfig?.resetWetness && material) {
                elementConfig.resetWetness(material);
            }
            if (elementConfig?.resetShaderAnimation && material) {
                elementConfig.resetShaderAnimation(material);
            }
            // Reset disk mode (only singularity uses it)
            if (material?.uniforms?.uDiskMode) {
                material.uniforms.uDiskMode.value = 0;
            }
            // Reset gesture glow to prevent bleeding between gestures
            if (material) {
                delete material.userData.gestureGlow;
                if (material.uniforms?.uGlowScale) {
                    material.uniforms.uGlowScale.value = 1.0;
                }
            }
            // Force-stop atmospherics from previous gesture (immediate cleanup on interruption)
            if (this._particleAtmospherics) {
                this._particleAtmospherics.forceStopGesture(elementType);
            }
            this._parameterAnimations.delete(elementType);

            // Apply minimum renderOrder from all layers (most negative = furthest back)
            let minRenderOrder = undefined;
            let layerDepthWrite = undefined;
            for (const layerConfig of mode) {
                const layerRenderOrder = layerConfig.animation?.renderOrder;
                if (layerRenderOrder !== undefined) {
                    if (minRenderOrder === undefined || layerRenderOrder < minRenderOrder) {
                        minRenderOrder = layerRenderOrder;
                    }
                }
                if (layerConfig.animation?.depthWrite !== undefined) {
                    layerDepthWrite = layerConfig.animation.depthWrite;
                }
            }
            if (minRenderOrder !== undefined) {
                pool.mesh.renderOrder = minRenderOrder;
            }

            // Apply per-gesture depthWrite override from layers
            if (material) {
                if (layerDepthWrite !== undefined) {
                    material.depthWrite = layerDepthWrite;
                } else if (material.userData._originalDepthWrite !== undefined) {
                    material.depthWrite = material.userData._originalDepthWrite;
                }
            }

            // Spawn each layer
            const allIds = [];
            for (let layerIndex = 0; layerIndex < mode.length; layerIndex++) {
                const layerConfig = mode[layerIndex];
                const layerIds = await this._spawnLayer(elementType, layerConfig, {
                    layerIndex,
                    camera,
                    gestureDuration,
                    intensity
                });
                allIds.push(...layerIds);
            }

            return allIds;
        }

        // Parse animation config if provided
        const animConfig = animation
            ? new AnimationConfig(animation, gestureDuration)
            : null;

        // Ensure pool is initialized
        const pool = await this.initializePool(elementType);
        if (!pool) {
            return [];
        }

        // Track pool usage time for cleanup (prevents premature disposal)
        this._poolLastUsed.set(elementType, performance.now());

        // Apply renderOrder from animation config to mesh (affects depth sorting)
        if (animConfig?.rendering?.renderOrder !== undefined) {
            pool.mesh.renderOrder = animConfig.rendering.renderOrder;
        }

        // Clear existing elements of this type first
        this.despawn(elementType);

        // Reset cutout, grain, and shader animation to default state to prevent bleeding from previous gesture
        const elementConfig = ElementTypeRegistry.get(elementType);
        const material = this.materials.get(elementType);

        // Apply per-gesture depthWrite override (e.g. icemeditation needs false to not occlude mascot)
        if (material) {
            if (animation && animation.depthWrite !== undefined) {
                material.depthWrite = animation.depthWrite;
            } else if (material.userData._originalDepthWrite !== undefined) {
                material.depthWrite = material.userData._originalDepthWrite;
            }
        }
        if (elementConfig?.resetCutout && material) {
            elementConfig.resetCutout(material);
        }
        if (elementConfig?.resetGrain && material) {
            elementConfig.resetGrain(material);
        }
        if (elementConfig?.resetFlash && material) {
            elementConfig.resetFlash(material);
        }
        if (elementConfig?.resetRelay && material) {
            elementConfig.resetRelay(material);
        }
        if (elementConfig?.resetWetness && material) {
            elementConfig.resetWetness(material);
        }
        if (elementConfig?.resetShaderAnimation && material) {
            elementConfig.resetShaderAnimation(material);
        }
        // Reset disk mode (only singularity uses it)
        if (material?.uniforms?.uDiskMode) {
            material.uniforms.uDiskMode.value = 0;
        }
        // Reset gesture glow to prevent bleeding between gestures
        if (material) {
            delete material.userData.gestureGlow;
            if (material.uniforms?.uGlowScale) {
                material.uniforms.uGlowScale.value = 1.0;
            }
        }
        // Force-stop atmospherics from previous gesture (immediate cleanup on interruption)
        if (this._particleAtmospherics) {
            this._particleAtmospherics.forceStopGesture(elementType);
        }
        this._parameterAnimations.delete(elementType);

        const merged = this.mergedGeometries.get(elementType);
        if (!merged) {
            return [];
        }

        // Determine spawn mode type
        const modeType = typeof mode === 'object' ? (mode.type || 'surface') : mode;

        // ═══════════════════════════════════════════════════════════════════════════════════════
        // AXIS-TRAVEL MODE
        // ═══════════════════════════════════════════════════════════════════════════════════════
        if (modeType === 'axis-travel') {
            return this._spawnAxisTravel(elementType, mode, models, animConfig, camera);
        }

        // ═══════════════════════════════════════════════════════════════════════════════════════
        // ANCHOR MODE - Elements anchored at landmark positions (crowns, halos, etc.)
        // ═══════════════════════════════════════════════════════════════════════════════════════
        if (modeType === 'anchor') {
            return this._spawnAnchor(elementType, mode, models, animConfig, camera);
        }

        // ═══════════════════════════════════════════════════════════════════════════════════════
        // RADIAL-BURST MODE - Elements burst outward radially from center
        // Logic lives in RadialBurstMode.js - this just coordinates with pool
        // ═══════════════════════════════════════════════════════════════════════════════════════
        if (modeType === 'radial-burst') {
            return this._spawnRadialBurst(elementType, mode, models, animConfig);
        }

        // ═══════════════════════════════════════════════════════════════════════════════════════
        // ORBIT MODE - Elements orbit around mascot at fixed height
        // ═══════════════════════════════════════════════════════════════════════════════════════
        if (modeType === 'orbit') {
            return this._spawnOrbit(elementType, mode, models, animConfig, camera);
        }

        // ═══════════════════════════════════════════════════════════════════════════════════════
        // SURFACE MODE - Elements spawn on mascot surface
        // ═══════════════════════════════════════════════════════════════════════════════════════
        if (modeType === 'surface') {
            return this._spawnSurface(elementType, mode, count, models, animConfig, camera);
        }

        // ═══════════════════════════════════════════════════════════════════════════════════════
        // UNKNOWN MODE - Fall back to basic orbit positioning
        // ═══════════════════════════════════════════════════════════════════════════════════════
        console.warn(`[ElementInstancedSpawner] Unknown spawn mode: ${modeType}, falling back to orbit`);
        return this._spawnOrbitFallback(elementType, count, models, animConfig, camera);
    }

    /**
     * Fallback spawn for unknown modes - simple orbit positioning.
     * @private
     */
    _spawnOrbitFallback(elementType, count, models, animConfig, _camera) {
        const ctx = this._getSpawnContext(elementType);
        if (!ctx) return [];

        const { pool, merged, config: elementConfig } = ctx;

        const spawnedIds = [];
        const actualCount = Math.min(count, pool.availableSlots);
        const availableModels = models || Array.from(merged.modelMap.keys());

        for (let i = 0; i < actualCount; i++) {
            const modelName = availableModels[Math.floor(Math.random() * availableModels.length)];
            const modelIndex = this._resolveModelIndex(merged, modelName) ?? 0;

            const scaleMultiplier = elementConfig?.scaleMultiplier || DEFAULT_SCALE_MULTIPLIER;
            const scale = calculateElementScale(modelName, this.mascotRadius, scaleMultiplier);
            _temp.scale.setScalar(scale);

            const position = this._generateSpawnPosition('orbit', i, actualCount);
            const rotation = this._generateSpawnRotation('orbit', position);

            const elementId = `${elementType}_${this._nextId++}`;
            const success = pool.spawn(elementId, position, rotation, _temp.scale, modelIndex);

            if (success) {
                const animState = this._initAnimState(pool, elementId, animConfig, i);
                if (animState) {
                    pool.updateInstanceTransform(elementId, position, rotation, scale * animState.scale);
                }

                this.activeElements.set(elementId, {
                    type: elementType,
                    modelName,
                    modelIndex,
                    spawnTime: this.time,
                    basePosition: position.clone(),
                    position: position.clone(),
                    rotation: rotation.clone(),
                    baseScale: scale,
                    scale,
                    animState
                });
                spawnedIds.push(elementId);
            }
        }

        return spawnedIds;
    }

    /**
     * Generates spawn position based on pattern (for non-surface modes).
     * Surface mode uses sampleSurfacePoints from ElementPositioning.js directly.
     * @private
     */
    _generateSpawnPosition(pattern, index, total) {
        const pos = _temp.position;
        const radius = this.mascotRadius * 1.5;

        switch (pattern) {
        case 'orbit': {
            // Circular orbit around mascot
            const angle = (index / total) * Math.PI * 2;
            const height = (Math.random() - 0.5) * this.mascotRadius;
            pos.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            break;
        }

        case 'crown': {
            // Ring around top
            const angle = (index / total) * Math.PI * 2;
            pos.set(
                Math.cos(angle) * radius * 0.6,
                this.mascotRadius * 0.8,
                Math.sin(angle) * radius * 0.6
            );
            break;
        }

        case 'scattered':
        case 'scatter': {
            // Random scatter around mascot
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            pos.set(
                Math.sin(phi) * Math.cos(theta) * radius,
                Math.sin(phi) * Math.sin(theta) * radius,
                Math.cos(phi) * radius
            );
            break;
        }

        default:
            // Default to orbit
            return this._generateSpawnPosition('orbit', index, total);
        }

        // NOTE: Don't add coreMesh.position here - container is synced to it in update()
        // Positions are in local space relative to mascot center

        return pos.clone();
    }

    /**
     * Generates spawn rotation based on pattern.
     * @private
     */
    _generateSpawnRotation(_pattern, _position) {
        const quat = _temp.quaternion;

        // Random rotation for most patterns (use shared _temp.euler to avoid allocation)
        _temp.euler.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );
        quat.setFromEuler(_temp.euler);

        return quat.clone();
    }

    // ═══════════════════════════════════════════════════════════════════════════════════════
    // AXIS-TRAVEL MODE HELPERS
    // ═══════════════════════════════════════════════════════════════════════════════════════

    // ═══════════════════════════════════════════════════════════════════════════════
    // AXIS-TRAVEL UTILITIES - Delegated to shared spawn-modes/AxisTravelMode.js
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * Parse axis-travel configuration from spawn mode.
     * Delegates to shared utility function.
     * @param {Object} spawnMode - The spawn mode configuration
     * @returns {Object} Parsed axis-travel config with resolved landmarks
     * @private
     */
    _parseAxisTravelConfig(spawnMode) {
        return parseAxisTravelConfig(spawnMode, name => this.spatialRef.resolveLandmark(name));
    }

    /**
     * Get the geometry diameter of a model in model space.
     * Used for mascot-relative diameter calculations.
     * @param {string} modelName - Model name (e.g., 'vine-ring')
     * @param {string} elementType - Element type for path resolution
     * @returns {number} Model diameter in model space (from bounding sphere)
     * @private
     */
    _getModelGeometryDiameter(modelName, _elementType) {
        if (this._modelGeometryDiameters.has(modelName)) {
            return this._modelGeometryDiameters.get(modelName);
        }

        // Try to find geometry in cache by searching for this model name
        let diameter = 2.0; // Default fallback (radius 1.0)
        for (const [path, geometry] of this.geometryCache.entries()) {
            if (path.includes(`${modelName}.glb`) || path.includes(`/${modelName}`)) {
                if (!geometry.boundingSphere) {
                    geometry.computeBoundingSphere();
                }
                diameter = geometry.boundingSphere.radius * 2;
                break;
            }
        }

        this._modelGeometryDiameters.set(modelName, diameter);
        return diameter;
    }

    /**
     * Compute the diameter conversion factor for mascot-relative sizing.
     * When diameterUnit='mascot', config diameter 1.0 = exactly mascot width.
     * @param {string} modelName - Model name
     * @param {string} elementType - Element type
     * @param {number} scaleMultiplier - The config scale value
     * @returns {number} Factor to multiply config diameter by
     * @private
     */
    _computeMascotDiameterFactor(modelName, elementType, scaleMultiplier) {
        const geomDiameter = this._getModelGeometryDiameter(modelName, elementType);
        const sizeFraction = getModelSizeFraction(modelName);
        // baseScale = sizeFraction.base * mascotRadius * scaleMultiplier
        // worldDiameter = geomDiameter * baseScale * interpScale * diameter
        // For worldDiameter = 2*mascotRadius when diameter=1.0, interpScale=1.0:
        // 2*mascotRadius = geomDiameter * sizeFraction.base * mascotRadius * scaleMultiplier * 1.0
        // factor = 2 / (geomDiameter * sizeFraction.base * scaleMultiplier)
        const factor = 2.0 / (geomDiameter * sizeFraction.base * scaleMultiplier);
        return factor;
    }

    /**
     * Expand formation into per-element configurations.
     * Delegates to shared utility function.
     * @param {Object} parsedConfig - Parsed axis-travel config
     * @returns {Array<Object>} Array of per-element formation data
     * @private
     */
    _expandFormation(parsedConfig) {
        return expandFormation(parsedConfig);
    }

    /**
     * Calculate position and scale for axis-travel element based on gesture progress.
     * Wraps shared utility to return THREE.Vector3.
     * @param {Object} axisConfig - Parsed axis-travel configuration
     * @param {Object} formationData - Per-element formation data
     * @param {number} gestureProgress - Current gesture progress (0-1)
     * @returns {{ position: THREE.Vector3, scale: number, diameter: number, rotationOffset: number }}
     * @private
     */
    _calculateAxisTravelPosition(axisConfig, formationData, gestureProgress) {
        const result = calculateAxisTravelPosition(axisConfig, formationData, gestureProgress, this.mascotRadius);

        // Build position vector from axis result
        // positionOffset is now {x, y, z} for mandala/positioned formations
        const offset = result.positionOffset;
        const position = _temp.position.set(0, 0, 0);

        switch (result.axis) {
        case 'y':
            position.y = result.axisPos;
            break;
        case 'x':
            position.x = result.axisPos;
            break;
        case 'z':
            position.z = result.axisPos;
            break;
        }

        // Apply XYZ position offset from formation
        position.x += offset.x || 0;
        position.y += offset.y || 0;
        position.z += offset.z || 0;

        // Return shared _temp.position - caller must copy if needed for persistence
        // Avoids per-frame Vector3 allocation (was causing GC pressure/memory leak)
        return {
            position,
            scale: result.scale,
            diameter: result.diameter,
            rotationOffset: result.rotationOffset,
            scaleMultiplier: result.scaleMultiplier
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════════════════
    // SPAWN HELPERS
    // ═══════════════════════════════════════════════════════════════════════════════════════

    /**
     * Gets spawn context (pool, merged geometry, config) for an element type.
     * Returns null if not ready, with warning logged.
     * @param {string} elementType - Element type
     * @returns {{ pool: ElementInstancePool, merged: Object, config: Object } | null}
     * @private
     */
    _getSpawnContext(elementType) {
        const pool = this.pools.get(elementType);
        const merged = this.mergedGeometries.get(elementType);
        const config = ElementTypeRegistry.get(elementType);

        if (!pool || !merged) {
            console.warn(`[ElementInstancedSpawner] Pool or merged geometry not ready for ${elementType}`);
            return null;
        }

        return { pool, merged, config };
    }

    /**
     * Resolves model name to index, with warning if not found.
     * @param {Object} merged - Merged geometry data
     * @param {string} modelName - Model name to resolve
     * @returns {number | undefined} Model index or undefined
     * @private
     */
    _resolveModelIndex(merged, modelName) {
        const modelIndex = merged.modelMap.get(modelName);
        if (modelIndex === undefined) {
            console.warn(`[ElementInstancedSpawner] Model ${modelName} not found in merged geometry`);
        }
        return modelIndex;
    }

    /**
     * Creates and initializes animation state for an element.
     * @param {ElementInstancePool} pool - The pool
     * @param {string} elementId - Element ID
     * @param {AnimationConfig} animConfig - Animation config (or null)
     * @param {number} index - Element index for stagger
     * @returns {AnimationState | null}
     * @private
     */
    _initAnimState(pool, elementId, animConfig, index) {
        if (!animConfig) {
            pool.updateInstanceOpacity(elementId, 1.0);
            return null;
        }

        const animState = new AnimationState(animConfig, index);
        animState.initialize(this.time);
        pool.updateInstanceOpacity(elementId, animState.opacity);
        return animState;
    }

    /**
     * Applies shader animation overrides from modelOverrides config.
     * Also applies gestureGlow config if present in animation.
     * @param {string} elementType - Element type for material lookup
     * @param {string[]} modelNames - Model names to check for overrides
     * @param {Object} modelOverrides - Animation modelOverrides config
     * @param {Object} elementConfig - Element config from registry
     * @param {Object} [animation] - Full animation config (may contain gestureGlow)
     * @private
     */
    _applyShaderAnimationOverrides(elementType, modelNames, modelOverrides, elementConfig, animation = null) {
        const material = this.materials.get(elementType);
        if (!material) return;

        // Apply shader animation from modelOverrides
        if (modelOverrides && elementConfig?.setShaderAnimation) {
            for (const modelName of modelNames) {
                const overrides = modelOverrides[modelName];
                if (overrides?.shaderAnimation) {
                    elementConfig.setShaderAnimation(material, overrides.shaderAnimation);
                    break;  // Apply once per spawn (all elements use same settings)
                }
            }
        }

        // Apply disk mode from modelOverrides (void singularity billboard disk)
        if (modelOverrides && material?.uniforms?.uDiskMode) {
            for (const modelName of modelNames) {
                if (modelOverrides[modelName]?.diskMode) {
                    material.uniforms.uDiskMode.value = 1;
                    break;
                }
            }
        }

        // Apply gestureGlow from animation config
        if (animation?.gestureGlow && elementConfig?.setGestureGlow) {
            elementConfig.setGestureGlow(material, animation.gestureGlow);
        }

        // Apply cutout from animation config (breaks up water shapes with holes)
        // Only set if explicitly defined - don't reset to 0 (that's done at gesture start in spawn())
        // This allows multi-layer gestures where only some layers define cutout
        if (elementConfig?.setCutout && animation?.cutout !== undefined) {
            elementConfig.setCutout(material, animation.cutout);
        }

        // Apply grain from animation config (noise texture for gritty realism)
        // Only set if explicitly defined - don't reset to 0 (that's done at gesture start in spawn())
        if (elementConfig?.setGrain && animation?.grain !== undefined) {
            elementConfig.setGrain(material, animation.grain);
        }

        // Apply flash from animation config (opt-in lightning strike effect for electric elements)
        if (elementConfig?.setFlash && animation?.flash !== undefined) {
            elementConfig.setFlash(material, animation.flash);
        }

        // Apply wetness from animation config (moisture sheen for earth/ice elements)
        if (elementConfig?.setWetness && animation?.wetness !== undefined) {
            elementConfig.setWetness(material, animation.wetness);
        }

        // Apply relay config from animation (per-gesture relay count + arc width)
        if (elementConfig?.setRelay && animation?.relay !== undefined) {
            elementConfig.setRelay(material, animation.relay);
        }

        // Store parameterAnimation for atmospheric energy evaluation per frame
        // The first named parameter (temperature, turbulence, charge) drives particle energy
        if (animation?.parameterAnimation) {
            const animConfig = new AnimationConfig({ parameterAnimation: animation.parameterAnimation });
            this._parameterAnimations.set(elementType, animConfig.parameterAnimation);
        }

        // Start atmospherics from animation config (per-gesture smoke/mist particles)
        // Additive: each layer can contribute its own atmospheric emitters
        if (this._particleAtmospherics && animation?.atmospherics) {
            this._particleAtmospherics.startGesture(elementType, animation.atmospherics);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════════════
    // SPAWN LAYERS SUPPORT
    // ═══════════════════════════════════════════════════════════════════════════════════════

    /**
     * Spawn a single layer of elements.
     * Called by spawn() when mode is an array of layer configs.
     * Each layer can have its own spawn type, models, timing, etc.
     *
     * @param {string} elementType - Element type to spawn
     * @param {Object} layerConfig - Configuration for this layer
     * @param {Object} options - Shared options (camera, gestureDuration, etc.)
     * @returns {string[]} Array of spawned element IDs
     * @private
     */
    _spawnLayer(elementType, layerConfig, options) {
        const { layerIndex, camera, gestureDuration } = options;

        // Extract layer-specific config
        const layerType = layerConfig.type || 'surface';
        const layerModels = layerConfig.models || null;
        const layerAnimation = layerConfig.animation || {};

        // Create animation config for this layer
        const animConfig = new AnimationConfig(layerAnimation, gestureDuration);

        // Tag spawned elements with layer index for debugging
        const layerTag = `layer${layerIndex}`;


        // Dispatch to appropriate spawn method based on layer type
        // NOTE: We don't call despawn() here - already done once by spawn() for all layers
        switch (layerType) {
        case 'axis-travel':
            return this._spawnAxisTravel(elementType, layerConfig, layerModels, animConfig, camera, layerTag);

        case 'anchor':
            return this._spawnAnchor(elementType, layerConfig, layerModels, animConfig, camera, layerTag);

        case 'radial-burst':
            return this._spawnRadialBurst(elementType, layerConfig, layerModels, animConfig, layerTag);

        case 'orbit':
            return this._spawnOrbit(elementType, layerConfig, layerModels, animConfig, camera, layerTag);

        case 'surface':
            return this._spawnSurface(elementType, layerConfig, layerConfig.count || 5, layerModels, animConfig, camera, layerTag);

        default:
            console.warn(`[ElementInstancedSpawner] Unknown layer type: ${layerType}, skipping`);
            return [];
        }
    }

    /**
     * Spawn elements in axis-travel mode.
     * @param {string} elementType - Element type to spawn
     * @param {Object} spawnMode - Spawn mode configuration
     * @param {string[]} models - Model names to use
     * @param {AnimationConfig} animConfig - Animation configuration
     * @param {THREE.Camera} camera - Camera for orientation
     * @param {string} [layerTag] - Optional tag for layer identification (used with spawn layers)
     * @returns {Promise<string[]>} Array of spawned element IDs
     * @private
     */
    _spawnAxisTravel(elementType, spawnMode, models, animConfig, _camera, _layerTag = null) {
        const ctx = this._getSpawnContext(elementType);
        if (!ctx) {
            console.warn(`[ElementInstancedSpawner] _spawnAxisTravel: no context for ${elementType}`);
            return [];
        }

        const { pool, merged, config: elementConfig } = ctx;

        // Parse axis-travel configuration
        const axisConfig = this._parseAxisTravelConfig(spawnMode);

        // Expand formation into per-element data
        const formationElements = this._expandFormation(axisConfig);

        // Check for arc animation configuration in modelOverrides
        const animation = spawnMode.animation || {};
        const modelOverrides = animation.modelOverrides || {};

        // Apply shader animation settings and gesture glow if configured
        this._applyShaderAnimationOverrides(elementType, axisConfig.models, modelOverrides, elementConfig, animation);


        const spawnedIds = [];
        const availableModels = axisConfig.models.length > 0
            ? axisConfig.models
            : (models || Array.from(merged.modelMap.keys()));

        for (let i = 0; i < formationElements.length; i++) {
            const formationData = formationElements[i];

            // Select model (for axis-travel, typically all the same model like flame-ring)
            const modelName = availableModels[i % availableModels.length];
            const modelIndex = this._resolveModelIndex(merged, modelName);
            if (modelIndex === undefined) continue;

            // Calculate initial position at gesture progress 0
            const initialResult = this._calculateAxisTravelPosition(axisConfig, formationData, 0);
            const {position} = initialResult;

            // Calculate scale using shared Golden Ratio sizing system
            const scaleMultiplier = axisConfig.scale || elementConfig?.scaleMultiplier || DEFAULT_SCALE_MULTIPLIER;
            const baseScale = calculateElementScale(modelName, this.mascotRadius, scaleMultiplier);

            // Apply initial scale and diameter
            // Include per-element scaleMultiplier from formation (for mandala varied ring sizes)
            const formationScaleMultiplier = initialResult.scaleMultiplier ?? 1.0;
            const initialScale = baseScale * initialResult.scale * formationScaleMultiplier;

            // Mascot-relative diameter: compute factor so diameter 1.0 = mascot width
            const diameterFactor = axisConfig.diameterUnit === 'mascot'
                ? this._computeMascotDiameterFactor(modelName, elementType, scaleMultiplier)
                : 1.0;

            // Scale by diameter — non-uniform (XY face only) or uniform (all axes)
            const effectiveDiameter = initialResult.diameter * diameterFactor;
            if (axisConfig.uniformDiameter) {
                _temp.scale.setScalar(initialScale * effectiveDiameter);
            } else {
                _temp.scale.set(
                    initialScale * effectiveDiameter,
                    initialScale * effectiveDiameter,
                    initialScale
                );
            }

            // Determine ring orientation:
            // 1. Use per-model orientationOverride from modelOverrides if specified
            // 2. Use orientation from axis-travel config if specified
            // 3. Fall back to model's default orientation from ElementSizing
            const perModelOrientation = modelOverrides[modelName]?.orientationOverride;
            const configOrientation = perModelOrientation || axisConfig.orientation;
            const modelOrientation = getModelOrientation(modelName);
            const orientationMode = configOrientation || modelOrientation.mode || 'outward';

            // Build rotation: first apply ring orientation, then formation arcOffset
            // Note: flame-ring model's circular face is in XY plane (faces -Z)
            //
            // IMPORTANT: The container copies mascot's quaternion in update(), so to keep
            // rings flat in WORLD space, we need to apply the INVERSE of the mascot's rotation.
            // This cancels out the container rotation so rings stay truly horizontal.
            let rotation;
            let worldSpaceOrientation = false;  // Track if we need to cancel container rotation

            switch (orientationMode) {
            case 'flat':
                // Flat: ring lies horizontal (XZ plane), Y-axis up in WORLD space
                // Model faces camera by default, rotate +90° around X to lay it flat
                rotation = _temp.quaternion.setFromAxisAngle(_temp.axis.set(1, 0, 0), Math.PI / 2);
                worldSpaceOrientation = true;  // Flat should be world-relative
                break;

            case 'vertical':
                // Vertical: ring stands upright, arcOffset creates gyroscope spread
                // Model faces camera, identity keeps it upright
                // arcOffset rotates each ring around Y (0°, 120°, 240°) for gyroscope effect
                rotation = _temp.quaternion.identity();
                worldSpaceOrientation = true;  // Vertical should be world-relative
                break;

            case 'radial':
                // Radial: tilted outward like a funnel (45° from horizontal)
                // Start from flat (+90° X) then tilt back 45°
                rotation = _temp.quaternion.setFromAxisAngle(_temp.axis.set(1, 0, 0), Math.PI / 4);
                worldSpaceOrientation = true;  // Radial should be world-relative
                break;

            case 'camera':
                // Camera-facing: ring always faces the camera (billboard)
                // Start with identity, update loop will set to camera quaternion
                rotation = _temp.quaternion.identity();
                worldSpaceOrientation = true;  // Need world-space for camera quaternion to work
                break;

            default:
                // Use model's default or generate based on position
                rotation = this._generateSpawnRotation('orbit', position);
            }

            // Apply formation arcOffset rotation (e.g., 0°, 120°, 240° for 3-ring spiral)
            // This rotates each ring around the Y axis to spread them out
            if (formationData.rotationOffset) {
                _temp.quaternion2.setFromAxisAngle(_temp.up, formationData.rotationOffset);
                rotation = rotation.clone().premultiply(_temp.quaternion2);
            }

            // Apply mesh rotation offset (for breaking up noise patterns)
            // This is a physical Y-axis rotation separate from shader arcOffset
            if (formationData.meshRotationOffset) {
                _temp.quaternion2.setFromAxisAngle(_temp.up, formationData.meshRotationOffset);
                rotation = rotation.clone().premultiply(_temp.quaternion2);
            }

            // Store the world rotation for update loop
            // Container will have identity rotation when worldSpaceOrientation is true
            const baseWorldRotation = rotation.clone();

            // Generate element ID
            const elementId = `${elementType}_${this._nextId++}`;

            // Spawn in pool — arcPhase=null for axis-travel elements (normal random seed).
            // Per-instance arc phase only works in the relay shader branch (aRandomSeed >= 100).
            // The normal arc branch uses the uniform uArcPhase, so per-instance encoding
            // from stagger has no effect and only corrupts the random seed.
            // Relay gestures pass arcPhase/relayIndex through anchor mode's modelOverrides.
            const success = pool.spawn(elementId, position, rotation, _temp.scale, modelIndex);

            if (success) {
                const animState = this._initAnimState(pool, elementId, animConfig, i);
                if (animState) {
                    pool.updateInstanceTransform(elementId, position, rotation, initialScale * animState.scale);
                }

                this.activeElements.set(elementId, {
                    type: elementType,
                    modelName,
                    modelIndex,
                    spawnTime: this.time,
                    basePosition: position.clone(),
                    position: position.clone(),
                    rotation: rotation.clone(),
                    baseScale,
                    scale: initialScale,
                    animState,
                    // World-space orientation: if true, rotation is relative to world, not mascot
                    worldSpaceOrientation,
                    baseWorldRotation: worldSpaceOrientation ? baseWorldRotation : null,
                    // Camera billboard: if true, element always faces camera
                    cameraOrientation: orientationMode === 'camera',
                    // Axis-travel specific data
                    axisTravel: {
                        config: axisConfig,
                        formationData,
                        initialResult,
                        diameterFactor,
                        uniformDiameter: axisConfig.uniformDiameter || false
                    }
                });
                spawnedIds.push(elementId);
            }
        }

        return spawnedIds;
    }

    // ═══════════════════════════════════════════════════════════════════════════════════════
    // ANCHOR MODE - Elements anchored at landmark positions
    // ═══════════════════════════════════════════════════════════════════════════════════════

    /**
     * Spawn elements in anchor mode (crowns, halos, ground indicators).
     * @param {string} elementType - Element type to spawn
     * @param {Object} spawnMode - Spawn mode configuration
     * @param {string[]} models - Model names to use
     * @param {AnimationConfig} animConfig - Animation configuration
     * @param {THREE.Camera} camera - Camera for orientation
     * @returns {string[]} Array of spawned element IDs
     * @private
     */
    _spawnAnchor(elementType, spawnMode, models, animConfig, camera, _layerTag = null) {
        const ctx = this._getSpawnContext(elementType);
        if (!ctx) return [];

        const { pool, merged, config: elementConfig } = ctx;

        // Parse anchor configuration using shared utility
        const anchorConfig = parseAnchorConfig(spawnMode, name => this.spatialRef.resolveLandmark(name));

        // Check for arc animation configuration
        const animation = spawnMode.animation || {};
        const modelOverrides = animation.modelOverrides || {};

        // Apply shader animation settings and gesture glow if configured
        this._applyShaderAnimationOverrides(elementType, anchorConfig.models, modelOverrides, elementConfig, animation);


        const spawnedIds = [];
        const availableModels = anchorConfig.models.length > 0
            ? anchorConfig.models
            : (models || Array.from(merged.modelMap.keys()));

        for (let i = 0; i < anchorConfig.count; i++) {
            // Select model
            const modelName = availableModels[i % availableModels.length];
            const modelIndex = this._resolveModelIndex(merged, modelName);
            if (modelIndex === undefined) continue;

            // Calculate position at anchor point using shared utility
            const anchorPos = calculateAnchorPosition(anchorConfig, 0);
            // If relativeOffset, scale offset by mascotRadius so spacing stays proportional
            if (anchorConfig.relativeOffset) {
                anchorPos.x *= this.mascotRadius;
                anchorPos.y = anchorConfig.landmarkY + anchorConfig.offset.y * this.mascotRadius;
                anchorPos.z *= this.mascotRadius;
            }
            const position = _temp.position.set(anchorPos.x, anchorPos.y, anchorPos.z).clone();

            // Calculate scale (sizeVariance override: 0 = identical sizes for relay rings)
            const scaleMultiplier = anchorConfig.scale || elementConfig?.scaleMultiplier || DEFAULT_SCALE_MULTIPLIER;
            const baseScale = calculateElementScale(modelName, this.mascotRadius, scaleMultiplier, spawnMode.sizeVariance);

            // Mascot-relative diameter: compute factor so diameter 1.0 = mascot width
            const diameterFactor = anchorConfig.diameterUnit === 'mascot'
                ? this._computeMascotDiameterFactor(modelName, elementType, scaleMultiplier)
                : 0;

            if (diameterFactor) {
                // Non-uniform scale: XY = ring face diameter, Z = thickness
                const effectiveDiameter = (anchorConfig.diameter || 1.0) * diameterFactor;
                _temp.scale.set(
                    baseScale * effectiveDiameter,
                    baseScale * effectiveDiameter,
                    baseScale
                );
            } else {
                _temp.scale.setScalar(baseScale);
            }

            // Apply orientation - check per-model override first, then anchor config
            const anchorOrientMode = modelOverrides[modelName]?.orientationOverride || anchorConfig.orientation;
            let rotation;
            if (anchorOrientMode === 'camera' && this.camera) {
                // Billboard: copy camera quaternion so element faces toward camera
                rotation = this.camera.quaternion.clone();
            } else {
                // Use static orientation from shared utility
                const orientRot = getAnchorOrientation(anchorOrientMode);
                _temp.euler.set(orientRot.x, orientRot.y, orientRot.z);
                rotation = _temp.quaternion.setFromEuler(_temp.euler).clone();
            }

            // Generate element ID
            const elementId = `${elementType}_${this._nextId++}`;

            // Extract per-instance relay config from modelOverrides (if configured)
            // arcPhase: model-space angle where arc sits (fixed, moves with ring rotation)
            // relayIndex: which ring in the relay cycle (0=top, 1=right, 2=left)
            const instanceArcPhase = modelOverrides[modelName]?.arcPhase ?? null;
            const instanceRelayIndex = modelOverrides[modelName]?.relayIndex ?? null;

            // Spawn in pool (arcPhase + relayIndex encode into aRandomSeed for relay vine masking)
            const success = pool.spawn(elementId, position, rotation, _temp.scale, modelIndex, instanceArcPhase, instanceRelayIndex);

            if (success) {
                const animState = this._initAnimState(pool, elementId, animConfig, i);
                if (animState) {
                    pool.updateInstanceTransform(elementId, position, rotation, baseScale * animState.scale);
                }

                this.activeElements.set(elementId, {
                    type: elementType,
                    modelName,
                    modelIndex,
                    spawnTime: this.time,
                    basePosition: position.clone(),
                    position: position.clone(),
                    rotation: rotation.clone(),
                    baseScale,
                    scale: baseScale,
                    animState,
                    // Camera billboard: if true, element always faces camera
                    cameraOrientation: anchorOrientMode === 'camera',
                    // Camera offset: push toward camera by N × mascotRadius (prevents z-fighting with mascot)
                    cameraOffset: anchorConfig.cameraOffset || 0,
                    // World-space orientation: needed for camera-facing AND for static orientations
                    // Camera-facing needs world-space so container rotation doesn't interfere
                    worldSpaceOrientation: true,
                    baseWorldRotation: rotation.clone(),
                    // Anchor-specific data for bob animation and scale interpolation
                    anchor: {
                        config: anchorConfig,
                        baseY: anchorPos.baseY,
                        // Mascot-relative diameter factor (0 = uniform scale, >0 = non-uniform XY)
                        diameterFactor: diameterFactor || 0,
                        diameter: anchorConfig.diameter || 1.0,
                        // Scale animation: interpolate from startScale to endScale over lifetime
                        startScale: anchorConfig.startScale,
                        endScale: anchorConfig.endScale,
                        // Store exit duration for localProgress calculation (explosion effects)
                        exitDuration: animConfig?.exit?.duration ?? 0,
                    }
                });
                spawnedIds.push(elementId);
            }
        }

        return spawnedIds;
    }

    // ═══════════════════════════════════════════════════════════════════════════════════════
    // RADIAL-BURST MODE - Elements burst outward radially from center
    // All positioning logic lives in RadialBurstMode.js
    // ═══════════════════════════════════════════════════════════════════════════════════════

    /**
     * Spawn elements in radial-burst mode.
     * Uses utility functions from RadialBurstMode.js for all positioning logic.
     * @private
     */
    _spawnRadialBurst(elementType, spawnMode, models, animConfig, _layerTag = null) {
        const ctx = this._getSpawnContext(elementType);
        if (!ctx) return [];

        const { pool, merged, config: elementConfig } = ctx;

        // Parse config using RadialBurstMode utility
        const burstConfig = parseRadialBurstConfig(spawnMode, name => this.spatialRef.resolveLandmark(name));

        // Parse orientation from radialBurst config (per-model override resolved in loop)
        const baseOrientationMode = spawnMode.radialBurst?.orientation || 'vertical';

        // Check for animation configuration (gesture glow, shader animations)
        const animation = spawnMode.animation || {};
        const modelOverrides = animation.modelOverrides || {};

        // Apply shader animation settings and gesture glow if configured
        this._applyShaderAnimationOverrides(elementType, burstConfig.models, modelOverrides, elementConfig, animation);


        const spawnedIds = [];
        const availableModels = burstConfig.models.length > 0
            ? burstConfig.models
            : (models || Array.from(merged.modelMap.keys()));

        for (let i = 0; i < burstConfig.count; i++) {
            const modelName = availableModels[i % availableModels.length];
            const modelIndex = this._resolveModelIndex(merged, modelName);
            if (modelIndex === undefined) continue;

            // Get initial state from RadialBurstMode utility
            const initialState = calculateRadialBurstInitialState(burstConfig, i, this.mascotRadius);

            const position = _temp.position.set(
                initialState.position.x,
                initialState.position.y,
                initialState.position.z
            ).clone();

            // Apply orientation - per-model override > burst config
            const orientationMode = modelOverrides[modelName]?.orientationOverride || baseOrientationMode;
            let rotation;
            if (orientationMode === 'camera' && this.camera) {
                // Billboard: copy camera quaternion so element faces toward camera
                rotation = this.camera.quaternion.clone();
            } else {
                rotation = _temp.quaternion.set(
                    initialState.rotation.x,
                    initialState.rotation.y,
                    initialState.rotation.z,
                    initialState.rotation.w
                ).clone();
            }

            const scaleMultiplier = burstConfig.scale || elementConfig?.scaleMultiplier || DEFAULT_SCALE_MULTIPLIER;
            const baseScale = calculateElementScale(modelName, this.mascotRadius, scaleMultiplier);
            const initialScale = baseScale * initialState.scaleMultiplier;

            const elementId = `${elementType}_${this._nextId++}`;
            const success = pool.spawn(elementId, position, rotation, _temp.scale.setScalar(initialScale), modelIndex);

            if (success) {
                const animState = this._initAnimState(pool, elementId, animConfig, i);

                this.activeElements.set(elementId, {
                    type: elementType,
                    modelName,
                    modelIndex,
                    spawnTime: this.time,
                    basePosition: position.clone(),
                    position: position.clone(),
                    rotation: rotation.clone(),
                    baseScale,
                    scale: initialScale,
                    animState,
                    // Camera billboard: if true, element always faces camera
                    cameraOrientation: orientationMode === 'camera',
                    // World-space orientation: needed for camera-facing to work correctly
                    worldSpaceOrientation: true,
                    baseWorldRotation: rotation.clone(),
                    // Mode-specific data from RadialBurstMode
                    ...initialState.modeData
                });
                spawnedIds.push(elementId);
            }
        }

        return spawnedIds;
    }

    // ═══════════════════════════════════════════════════════════════════════════════════════
    // ORBIT MODE - Elements orbit around mascot at fixed height
    // ═══════════════════════════════════════════════════════════════════════════════════════

    /**
     * Spawn elements in orbit mode (circling at fixed height around mascot).
     * @param {string} elementType - Element type to spawn
     * @param {Object} spawnMode - Spawn mode configuration
     * @param {string[]} models - Model names to use
     * @param {AnimationConfig} animConfig - Animation configuration
     * @param {THREE.Camera} camera - Camera for orientation
     * @returns {string[]} Array of spawned element IDs
     * @private
     */
    _spawnOrbit(elementType, spawnMode, models, animConfig, _camera, _layerTag = null) {
        const ctx = this._getSpawnContext(elementType);
        if (!ctx) return [];

        const { pool, merged, config: elementConfig } = ctx;

        // Parse orbit configuration using utility from OrbitMode.js
        const orbitConfig = parseOrbitConfig(spawnMode, name => this.spatialRef.resolveLandmark(name));

        // Expand formation into per-element data
        const formationElements = expandOrbitFormation(orbitConfig);

        // Check for arc animation configuration in modelOverrides
        const animation = spawnMode.animation || {};
        const modelOverrides = animation.modelOverrides || {};

        // Apply shader animation settings and gesture glow if configured
        this._applyShaderAnimationOverrides(elementType, orbitConfig.models, modelOverrides, elementConfig, animation);


        const spawnedIds = [];
        const availableModels = orbitConfig.models.length > 0
            ? orbitConfig.models
            : (models || Array.from(merged.modelMap.keys()));

        for (let i = 0; i < formationElements.length; i++) {
            const formationData = formationElements[i];

            // Select model
            const modelName = availableModels[i % availableModels.length];
            const modelIndex = this._resolveModelIndex(merged, modelName);
            if (modelIndex === undefined) continue;

            // Calculate position
            const posResult = calculateOrbitPosition(orbitConfig, formationData, 0, this.mascotRadius);
            const position = _temp.position.set(posResult.x, posResult.y, posResult.z).clone();

            // Calculate scale
            const scaleMultiplier = orbitConfig.scale || elementConfig?.scaleMultiplier || DEFAULT_SCALE_MULTIPLIER;
            const baseScale = calculateElementScale(modelName, this.mascotRadius, scaleMultiplier);
            _temp.scale.setScalar(baseScale);

            // Determine ring orientation (per-model override > orbit config > model default)
            const perModelOrbitOrientation = modelOverrides[modelName]?.orientationOverride;
            const configOrientation = perModelOrbitOrientation || orbitConfig.orientation;
            const modelOrientation = getModelOrientation(modelName);
            const orientationMode = configOrientation || modelOrientation.mode || 'vertical';

            // Build rotation based on orientation
            let rotation;
            const worldSpaceOrientation = true;

            switch (orientationMode) {
            case 'flat':
            case 'horizontal':
                // Flat: ring lies horizontal (XZ plane)
                rotation = _temp.quaternion.setFromAxisAngle(_temp.axis.set(1, 0, 0), Math.PI / 2);
                break;

            case 'vertical':
                // Vertical: ring stands upright, facing outward from center
                // Rotate to face outward based on orbit angle
                _temp.euler.set(0, posResult.angle + Math.PI / 2, 0);
                rotation = _temp.quaternion.setFromEuler(_temp.euler);
                break;

            case 'radial':
                // Tilted outward
                rotation = _temp.quaternion.setFromAxisAngle(_temp.axis.set(1, 0, 0), Math.PI / 4);
                break;

            default:
                rotation = _temp.quaternion.identity();
            }

            const baseWorldRotation = rotation.clone();

            // Generate element ID
            const elementId = `${elementType}_${this._nextId++}`;

            // Spawn in pool
            const success = pool.spawn(elementId, position, rotation, _temp.scale, modelIndex);

            if (success) {
                const animState = this._initAnimState(pool, elementId, animConfig, i);
                if (animState) {
                    pool.updateInstanceTransform(elementId, position, rotation, baseScale * animState.scale);
                }

                this.activeElements.set(elementId, {
                    type: elementType,
                    modelName,
                    modelIndex,
                    spawnTime: this.time,
                    basePosition: position.clone(),
                    position: position.clone(),
                    rotation: rotation.clone(),
                    baseScale,
                    scale: baseScale,
                    animState,
                    worldSpaceOrientation,
                    baseWorldRotation,
                    // Orbit-specific data
                    orbit: {
                        config: orbitConfig,
                        formationData,
                        angle: posResult.angle
                    }
                });
                spawnedIds.push(elementId);
            }
        }

        return spawnedIds;
    }

    // ═══════════════════════════════════════════════════════════════════════════════════════
    // SURFACE MODE - Elements spawn on mascot surface
    // ═══════════════════════════════════════════════════════════════════════════════════════

    /**
     * Spawn elements in surface mode (on mascot geometry).
     * @param {string} elementType - Element type to spawn
     * @param {Object} spawnMode - Spawn mode configuration
     * @param {number} count - Number of elements to spawn
     * @param {string[]} models - Model names to use
     * @param {AnimationConfig} animConfig - Animation configuration
     * @param {THREE.Camera} camera - Camera for orientation
     * @returns {string[]} Array of spawned element IDs
     * @private
     */
    _spawnSurface(elementType, spawnMode, count, models, animConfig, camera, _layerTag = null) {
        const ctx = this._getSpawnContext(elementType);
        if (!ctx) return [];

        const { pool, merged, config: elementConfig } = ctx;

        // Parse surface configuration using utility from SurfaceMode.js
        const surfaceConfig = parseSurfaceConfig(spawnMode);

        // Check for animation configuration (gesture glow, shader animations)
        const animation = spawnMode.animation || {};
        const modelOverrides = animation.modelOverrides || {};

        // Apply shader animation settings and gesture glow if configured
        this._applyShaderAnimationOverrides(elementType, surfaceConfig.models, modelOverrides, elementConfig, animation);

        // Check for coreMesh geometry
        if (!this.coreMesh?.geometry) {
            console.warn('[ElementInstancedSpawner] Surface mode requested but no coreMesh geometry available');
            return [];
        }

        // Sample surface points
        const surfacePoints = sampleSurfacePoints(
            this.coreMesh.geometry,
            count,
            this.mascotRadius,
            surfaceConfig,
            camera || this.camera,
            null  // Don't scale - container syncs to coreMesh transform
        );

        if (surfacePoints.length === 0) {
            console.warn('[ElementInstancedSpawner] No surface points sampled');
            return [];
        }


        const spawnedIds = [];
        const availableModels = surfaceConfig.models.length > 0
            ? surfaceConfig.models
            : (models || Array.from(merged.modelMap.keys()));
        const actualCount = Math.min(
            surfaceConfig.countOverride || count,
            pool.availableSlots,
            surfacePoints.length
        );

        for (let i = 0; i < actualCount; i++) {
            const sample = surfacePoints[i];

            // Select model
            const modelName = availableModels[Math.floor(Math.random() * availableModels.length)];
            const modelIndex = this._resolveModelIndex(merged, modelName);
            if (modelIndex === undefined) continue;

            // Calculate scale
            const scaleMultiplier = surfaceConfig.scaleMultiplier || elementConfig?.scaleMultiplier || DEFAULT_SCALE_MULTIPLIER;
            const baseScale = calculateElementScale(modelName, this.mascotRadius, scaleMultiplier);
            _temp.scale.setScalar(baseScale);

            // Calculate position with embed depth
            const embedDepth = surfaceConfig.embedDepth ?? 0.2;
            const surfaceResult = calculateSurfacePosition(
                sample.position,
                sample.normal,
                baseScale,
                embedDepth
            );
            const {position} = surfaceResult;

            // Calculate orientation based on model type and surface normal
            const cameraFacing = surfaceConfig.cameraFacing ?? 0.3;
            const rotation = calculateOrientation(
                sample.normal,
                modelName,
                cameraFacing,
                camera || this.camera,
                position,
                null  // velocity
            ).clone();

            // Generate element ID
            const elementId = `${elementType}_${this._nextId++}`;

            // Spawn in pool
            const success = pool.spawn(elementId, position, rotation, _temp.scale, modelIndex);

            if (success) {
                const animState = this._initAnimState(pool, elementId, animConfig, i);
                if (animState) {
                    pool.updateInstanceTransform(elementId, position, rotation, baseScale * animState.scale);
                }

                this.activeElements.set(elementId, {
                    type: elementType,
                    modelName,
                    modelIndex,
                    spawnTime: this.time,
                    basePosition: position.clone(),
                    position: position.clone(),
                    rotation: rotation.clone(),
                    baseScale,
                    scale: baseScale,
                    animState,
                    // Surface-specific data
                    surface: {
                        config: surfaceConfig,
                        normal: sample.normal.clone(),
                        embedDepth
                    }
                });
                spawnedIds.push(elementId);
            }
        }

        return spawnedIds;
    }

    /**
     * Triggers exit animation for all elements of a type.
     * Elements will animate out and be removed when complete.
     * @param {string} [elementType] - Element type to trigger exit for, or all if null
     */
    triggerExit(elementType = null) {
        // Stop atmospherics when gesture exits (particles drain naturally)
        if (this._particleAtmospherics) {
            if (elementType) {
                this._particleAtmospherics.stopGesture(elementType);
            } else {
                // Stop all element types
                for (const [type] of this.pools) {
                    this._particleAtmospherics.stopGesture(type);
                }
            }
        }

        for (const [elementId, data] of this.activeElements) {
            if (elementType && data.type !== elementType) continue;

            if (data.animState) {
                data.animState.triggerExit(this.time);
            } else {
                // No animation state - use pool's built-in fade
                const pool = this.pools.get(data.type);
                if (pool) {
                    pool.beginDespawn(elementId);
                }
            }
        }
    }

    /**
     * Despawns all elements of a type (or all if no type specified).
     * @param {string} [elementType] - Element type to despawn, or all if null
     * @param {boolean} [animated=true] - Whether to animate the despawn
     */
    despawn(elementType = null, animated = true) {
        const typesToClear = elementType
            ? [elementType]
            : Array.from(this.pools.keys());

        for (const type of typesToClear) {
            const pool = this.pools.get(type);
            if (!pool) continue;

            // Get elements of this type
            const toRemove = [];
            for (const [id, data] of this.activeElements) {
                if (data.type === type) {
                    toRemove.push(id);
                }
            }

            // Remove from pool
            for (const id of toRemove) {
                if (animated) {
                    pool.beginDespawn(id);
                } else {
                    pool.removeImmediate(id);
                }
                this.activeElements.delete(id);
            }
        }
    }

    /**
     * Despawns all elements immediately.
     */
    despawnAll() {
        this.despawn(null, false);
    }

    /**
     * Updates all active elements.
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {number} [gestureProgress=null] - Gesture progress 0-1
     */
    update(deltaTime, gestureProgress = null) {
        // Skip ALL work if no elements are active and no pools exist
        // This ensures demos that don't use elemental gestures have zero overhead
        if (this.activeElements.size === 0 && this.pools.size === 0) {
            if (this._renderer?.motionBlurPass) {
                this._renderer.motionBlurPass.enabled = false;
            }
            return;
        }

        this.time += deltaTime;

        // OPTIMIZATION: When no elements are active but pools exist,
        // skip expensive per-frame work and just check for pool cleanup
        if (this.activeElements.size === 0) {
            // Sync distortion to zero before early return — ensures distortion
            // turns off even if the last element was removed by a non-standard path
            if (this._distortionManager) {
                for (const [type, pool] of this.pools) {
                    this._distortionManager.syncInstances(type, pool.mesh, pool.mesh.count);
                }
            }
            // Sync particle atmospherics to zero sources (same reason)
            // Pass empty activeElements so all emitters get sourceCount=0
            if (this._particleAtmospherics) {
                for (const [type] of this.pools) {
                    this._particleAtmospherics.syncSources(type, this.activeElements, this.container);
                }
            }
            // Disable motion blur when no elements are active
            if (this._renderer?.motionBlurPass) {
                this._renderer.motionBlurPass.enabled = false;
            }
            this._checkPoolCleanup();
            return;
        }

        // Enable motion blur when instanced elements are actively moving
        // Disabled on mobile — small viewports make even capped blur too prominent
        if (this._renderer?.motionBlurPass) {
            const isMobile = window.innerWidth <= 1000;
            this._renderer.motionBlurPass.enabled = !isMobile;
        }

        // Sync container transform with mascot (position, rotation, scale)
        // This ensures surface-spawned elements follow mascot transformations
        // NOTE: For axis-travel elements with worldSpaceOrientation, we skip rotation
        // sync so rings stay flat in world space
        if (this.coreMesh) {
            this.container.position.copy(this.coreMesh.position);
            // Check if any active elements need world-space orientation
            let hasWorldSpaceElements = false;
            for (const data of this.activeElements.values()) {
                if (data.worldSpaceOrientation) {
                    hasWorldSpaceElements = true;
                    break;
                }
            }
            // Only copy mascot rotation if no world-space elements are active
            if (!hasWorldSpaceElements) {
                this.container.quaternion.copy(this.coreMesh.quaternion);
            } else {
                this.container.quaternion.identity();  // No rotation for world-space elements
            }
            this.container.scale.copy(this.coreMesh.scale);
        }

        // Update each pool's global time and material
        for (const [type, pool] of this.pools) {
            pool.setTime(this.time);

            // Update material uniforms (including gestureProgress for arc animation)
            const config = ElementTypeRegistry.get(type);
            const material = this.materials.get(type);
            if (config?.updateMaterial && material) {
                config.updateMaterial(material, this.time, gestureProgress ?? 1.0);
            }
        }

        // Process per-element animations
        const deadElements = [];

        for (const [elementId, data] of this.activeElements) {
            const { animState, type, basePosition, baseScale, rotation } = data;

            if (!animState) continue;

            // Update animation state
            const alive = animState.update(this.time, deltaTime, gestureProgress);

            if (!alive) {
                // Element has completed its lifecycle
                deadElements.push(elementId);
                continue;
            }

            // Get pool for this element type
            const pool = this.pools.get(type);
            if (!pool) continue;

            // For WAITING elements, ensure they stay invisible but don't process transforms
            if (animState.state === AnimationStates.WAITING) {
                pool.updateInstanceOpacity(elementId, 0);
                continue;
            }

            // Check for axis-travel mode
            const {axisTravel} = data;
            let finalPosition;
            let finalScale;

            // Determine if this is a procedural element (used for opacity calculation)
            const elementConfig = ElementTypeRegistry.get(type);
            const isProceduralElement = elementConfig?.createMaterial != null;

            if (axisTravel) {
                // AXIS-TRAVEL MODE: Recalculate position based on gesture progress
                // When gesture ends (gestureProgress=null), use 1.0 so elements maintain
                // their end-of-travel position while exit animation completes (no snap-back)
                const effectiveProgress = gestureProgress ?? 1.0;
                const result = this._calculateAxisTravelPosition(
                    axisTravel.config,
                    axisTravel.formationData,
                    effectiveProgress
                );

                // Apply calculated position
                finalPosition = result.position;

                // Apply scale with diameter
                // Include per-element scaleMultiplier from formation (for mandala varied ring sizes)
                // NOTE: Do NOT multiply by fadeProgress here — that causes shrinking on exit.
                // Exit animations that want scale changes use animState.scale directly.
                // fadeProgress is only used for enter animation (growing in).
                const formationScaleMultiplier = result.scaleMultiplier ?? 1.0;
                const enterFade = animState.state === AnimationStates.ENTERING ? animState.fadeProgress : 1.0;
                const animScale = baseScale * result.scale * formationScaleMultiplier * enterFade;
                const effectiveDiameter = result.diameter * (axisTravel.diameterFactor || 1.0);
                if (axisTravel.uniformDiameter) {
                    _temp.scale.setScalar(animScale * effectiveDiameter);
                } else {
                    _temp.scale.set(
                        animScale * effectiveDiameter,
                        animScale * effectiveDiameter,
                        animScale
                    );
                }
                finalScale = animScale;

                // Update base position for any drift effects
                data.basePosition.copy(finalPosition);
            } else if (data.anchor) {
                // ANCHOR MODE: Apply bob animation using shared utility
                const anchorPos = calculateAnchorPosition(data.anchor.config, this.time);
                _temp.position.set(anchorPos.x, anchorPos.y, anchorPos.z);

                // Camera-relative positioning: rotate XZ offset to track camera orbit
                // so "left" stays camera-left regardless of camera angle
                if (data.cameraOrientation && this.camera) {
                    const camRight = _temp.direction.set(1, 0, 0).applyQuaternion(this.camera.quaternion);
                    camRight.y = 0;
                    camRight.normalize();
                    const camFwd = _temp.axis.set(0, 0, -1).applyQuaternion(this.camera.quaternion);
                    camFwd.y = 0;
                    camFwd.normalize();
                    const ox = anchorPos.x;
                    const oz = anchorPos.z;
                    _temp.position.x = ox * camRight.x + oz * camFwd.x;
                    _temp.position.z = ox * camRight.z + oz * camFwd.z;
                    // Y unchanged — vertical offset stays world-relative
                }

                finalPosition = _temp.position;

                // Calculate local progress for scale interpolation (0-1 within element's FULL visibility window)
                // Include exit duration so scale animation syncs with fade for explosion effects
                const appearAt = animState.elementConfig?.appearAt ?? 0;
                const disappearAt = animState.elementConfig?.disappearAt ?? 1;
                const exitDuration = data.anchor.exitDuration ?? 0;
                const fullLifetimeEnd = disappearAt + exitDuration;
                const visibleDuration = fullLifetimeEnd - appearAt;
                const localProgress = (gestureProgress !== null && visibleDuration > 0)
                    ? Math.max(0, Math.min(1, (gestureProgress - appearAt) / visibleDuration))
                    : 0;

                // Interpolate scale from startScale to endScale over lifetime
                // Use shared easing library for consistent behavior across all modes
                const { startScale: anchorStartScale, endScale: anchorEndScale, config: anchorCfg } = data.anchor;
                const scaleEasingFn = getEasing(anchorCfg?.scaleEasing || 'easeOutExpo');
                const easedProgress = scaleEasingFn(localProgress);
                const scaleInterp = anchorStartScale + (anchorEndScale - anchorStartScale) * easedProgress;

                // Apply animated scale with interpolation
                // For elements with explicit scale animation (startScale != endScale), don't multiply
                // by fadeProgress - the scale should expand independently while opacity fades
                // This enables explosion effects that expand AND fade simultaneously
                const hasScaleAnimation = anchorStartScale !== anchorEndScale;
                if (hasScaleAnimation) {
                    finalScale = baseScale * scaleInterp;
                } else {
                    finalScale = isProceduralElement
                        ? baseScale * scaleInterp * animState.fadeProgress
                        : baseScale * scaleInterp * animState.scale;
                }

                // Mascot-relative diameter: apply non-uniform XY scale for ring face
                if (data.anchor.diameterFactor) {
                    const effectiveDiameter = data.anchor.diameter * data.anchor.diameterFactor;
                    _temp.scale.set(
                        finalScale * effectiveDiameter,
                        finalScale * effectiveDiameter,
                        finalScale
                    );
                }
            } else if (data.radialBurst) {
                // RADIAL-BURST MODE: Update position using RadialBurstMode utility
                // Use LOCAL progress (0-1 within element's appearance window) not global gestureProgress
                // This ensures elements start bursting from center when they appear, not partway through
                const appearAt = animState.elementConfig?.appearAt ?? 0;
                const disappearAt = animState.elementConfig?.disappearAt ?? 1;
                const visibleDuration = disappearAt - appearAt;
                const localProgress = visibleDuration > 0
                    ? Math.max(0, Math.min(1, (gestureProgress - appearAt) / visibleDuration))
                    : gestureProgress;

                const updateState = calculateRadialBurstUpdateState(
                    { radialBurst: data.radialBurst },
                    localProgress,
                    this.mascotRadius
                );
                _temp.position.set(updateState.position.x, updateState.position.y, updateState.position.z);
                finalPosition = _temp.position;

                // Apply animated scale with burst scale multiplier
                finalScale = isProceduralElement
                    ? baseScale * updateState.scaleMultiplier * animState.fadeProgress
                    : baseScale * updateState.scaleMultiplier * animState.scale;
            } else if (data.orbit && data.orbit.config.speed !== 0) {
                // ORBIT MODE: Recalculate position with orbital rotation + radius/height interpolation
                // When gesture ends (gestureProgress=null), use 1.0 so elements maintain
                // their end-of-orbit position while exit animation completes (no snap-back)
                const effectiveOrbitProgress = gestureProgress ?? 1.0;
                const orbitCfg = data.orbit.config;

                // Use local progress (0-1 within element's appearance window)
                const appearAt = animState.elementConfig?.appearAt ?? 0;
                const disappearAt = animState.elementConfig?.disappearAt ?? 1;
                const visibleDuration = disappearAt - appearAt;
                const localProgress = visibleDuration > 0
                    ? Math.max(0, Math.min(1, (effectiveOrbitProgress - appearAt) / visibleDuration))
                    : effectiveOrbitProgress;

                // Get easing function for orbit travel
                const orbitEasingFn = getEasing(orbitCfg.easing || 'linear');

                const result = calculateOrbitPosition(
                    orbitCfg,
                    data.orbit.formationData,
                    localProgress,
                    this.mascotRadius,
                    orbitEasingFn
                );

                _temp.position.set(result.x, result.y, result.z);
                finalPosition = _temp.position;

                // Apply scale with orbit scale interpolation and fade
                const orbitScale = result.scale ?? 1.0;
                finalScale = isProceduralElement
                    ? baseScale * orbitScale * animState.fadeProgress
                    : baseScale * orbitScale * animState.scale;

                data.basePosition.copy(finalPosition);
            } else {
                // STANDARD MODE: Apply drift offset to position
                const drift = animState.driftOffset;
                _temp.position.set(
                    basePosition.x + drift.x,
                    basePosition.y + drift.y,
                    basePosition.z + drift.z
                );
                finalPosition = _temp.position;

                // Apply animated scale (pulse effect)
                // For procedural elements (fire, water, etc.), skip pulse - shader handles it
                finalScale = isProceduralElement
                    ? baseScale * animState.fadeProgress  // Just enter/exit scale, no pulse
                    : baseScale * animState.scale;        // Full scale with pulse
            }

            data.position.copy(finalPosition);
            data.scale = finalScale;

            // Apply rotation offset
            const rotOffset = animState.rotationOffset;

            // Camera billboard: always face the camera
            if (data.cameraOrientation && this.camera) {
                // Copy camera quaternion so element faces camera
                _temp.quaternion.copy(this.camera.quaternion);

                // Model-specific geometry corrections:
                // Some models have geometry that faces a different axis than -Z (camera default)
                // Apply correction rotations so they face the camera properly
                if (data.modelName === 'wave-curl') {
                    // Wave-curl geometry needs 90° X rotation to face camera
                    _temp.quaternion2.setFromAxisAngle(_temp.axis.set(1, 0, 0), Math.PI / 2);
                    _temp.quaternion.multiply(_temp.quaternion2);
                }

                // Apply formation arcOffset as Z rotation (kaleidoscope effect)
                // This keeps each ring at its unique angle while facing camera
                const formationOffset = data.axisTravel?.formationData?.rotationOffset || 0;
                if (formationOffset !== 0) {
                    _temp.quaternion2.setFromAxisAngle(_temp.axis.set(0, 0, 1), formationOffset);
                    _temp.quaternion.multiply(_temp.quaternion2);
                }

                // Camera offset: push element toward camera so it doesn't clip into mascot
                // Direction toward camera = camera's local +Z in world space
                if (data.cameraOffset) {
                    _temp.direction.set(0, 0, 1).applyQuaternion(this.camera.quaternion);
                    finalPosition.addScaledVector(_temp.direction, data.cameraOffset * this.mascotRadius);
                }
            } else if (data.worldSpaceOrientation && data.baseWorldRotation) {
                // For world-space orientations, use the base world rotation directly
                // The container now has identity rotation when worldSpaceOrientation elements exist
                _temp.quaternion.copy(data.baseWorldRotation);
            } else {
                _temp.quaternion.copy(rotation);
            }

            if (rotOffset.x !== 0 || rotOffset.y !== 0 || rotOffset.z !== 0) {
                _temp.euler.set(rotOffset.x, rotOffset.y, rotOffset.z);
                _temp.quaternion2.setFromEuler(_temp.euler);
                _temp.quaternion.multiply(_temp.quaternion2);
            }

            // Update instance transform in pool
            // Note: updateInstanceTransform accepts both scalar and Vector3 scale
            if (axisTravel || (data.anchor && data.anchor.diameterFactor)) {
                // Non-uniform scale: diameter affects XY circular face, Z stays at base
                pool.updateInstanceTransform(
                    elementId,
                    finalPosition,
                    _temp.quaternion,
                    _temp.scale  // Vector3 with non-uniform scale
                );
            } else {
                pool.updateInstanceTransform(
                    elementId,
                    finalPosition,
                    _temp.quaternion,
                    finalScale   // Uniform scalar
                );
            }

            // Update instance opacity
            // For procedural elements, use smooth fadeProgress (no flicker - shader does that)
            // For non-procedural, use full opacity with flicker
            const instanceOpacity = isProceduralElement
                ? animState.fadeProgress  // Smooth 0→1→0, shader handles flicker
                : animState.opacity;      // Includes flicker/pulse effects

            pool.updateInstanceOpacity(elementId, instanceOpacity);
        }

        // Remove dead elements
        for (const elementId of deadElements) {
            const data = this.activeElements.get(elementId);
            if (data) {
                const pool = this.pools.get(data.type);
                if (pool) {
                    pool.removeImmediate(elementId);
                }
                this.activeElements.delete(elementId);
            }
        }

        // Sync distortion instance matrices from element pools
        // Must sync ALL pools (including count=0) so distortion meshes get reset
        if (this._distortionManager) {
            for (const [type, pool] of this.pools) {
                this._distortionManager.syncInstances(type, pool.mesh, pool.mesh.count);
            }

            // Void distortion lifecycle easing: compute max fadeProgress across active void elements
            // Uses max (not average) so distortion stays full while ANY element is fully visible
            let voidMaxFade = 0;
            for (const [, data] of this.activeElements) {
                if (data.type === 'void' && data.animState) {
                    if (data.animState.fadeProgress > voidMaxFade) {
                        voidMaxFade = data.animState.fadeProgress;
                    }
                }
            }
            this._distortionManager.setVoidFade(voidMaxFade);
        }

        // Sync particle atmospherics: feed filtered positions + gesture progress + energy
        if (this._particleAtmospherics) {
            // Collect unique element types with active elements
            const activeTypes = new Set();
            for (const [, data] of this.activeElements) {
                activeTypes.add(data.type);
            }
            // Sync sources (filtered by targetModels inside manager) and progress
            // Pass container so PAM can transform positions to world space
            for (const type of activeTypes) {
                this._particleAtmospherics.syncSources(type, this.activeElements, this.container);
                this._particleAtmospherics.setGestureProgress(type, gestureProgress);

                // Evaluate parameterAnimation energy (temperature/turbulence/charge)
                // and pipe to atmospheric particles so they scale with gesture intensity
                const paramAnim = this._parameterAnimations.get(type);
                if (paramAnim && gestureProgress !== null) {
                    const energy = evaluateEnergy(paramAnim, gestureProgress);
                    if (energy !== null) {
                        this._particleAtmospherics.setEnergy(type, energy);
                    }
                }
            }
        }
    }

    /**
     * Sets the distortion manager for syncing distortion instances.
     * @param {DistortionManager} manager
     */
    setDistortionManager(manager) {
        this._distortionManager = manager;
    }

    /**
     * Sets the particle atmospherics manager for smoke/mist particles.
     * @param {ParticleAtmosphericsManager} manager
     */
    setParticleAtmospherics(manager) {
        this._particleAtmospherics = manager;
    }

    /**
     * Sets the core mesh (mascot) for spatial reference.
     * @param {THREE.Mesh} mesh
     */
    setCoreMesh(mesh) {
        this.coreMesh = mesh;
        if (mesh) {
            this.spatialRef.initialize(mesh);
        }
    }

    /**
     * Sets the camera for orientation calculations.
     * @param {THREE.Camera} camera
     */
    setCamera(camera) {
        this.camera = camera;
    }

    /**
     * Gets stats for debugging.
     * @returns {Object}
     */
    getStats() {
        const stats = {
            activeElements: this.activeElements.size,
            poolStats: {}
        };

        for (const [type, pool] of this.pools) {
            stats.poolStats[type] = pool.getStats();
        }

        return stats;
    }

    /**
     * Check for and clean up inactive pools.
     * Pools are disposed after _poolCleanupInterval of inactivity.
     * @private
     */
    _checkPoolCleanup() {
        const now = performance.now();

        // Throttle cleanup checks to once per second
        if (now - this._lastCleanupCheck < 1000) {
            return;
        }
        this._lastCleanupCheck = now;

        // Check each pool for inactivity
        for (const [type, pool] of this.pools) {
            const lastUsed = this._poolLastUsed.get(type) || 0;
            if (now - lastUsed > this._poolCleanupInterval) {
                // Unregister from refraction before disposal
                if (this._renderer && pool.mesh?.material?.userData?.needsRefraction) {
                    this._renderer.removeRefractionMesh(pool.mesh);
                }
                // Unregister from motion blur before disposal
                if (this._renderer?.motionBlurPass) {
                    this._renderer.motionBlurPass.removeInstancedMesh(pool.mesh);
                }
                // Pool has been inactive - dispose it
                pool.dispose();
                this.pools.delete(type);
                this._poolLastUsed.delete(type);

                // Also dispose the material
                const material = this.materials.get(type);
                if (material) {
                    material.dispose();
                    this.materials.delete(type);
                }

                // Clear from initialized set so it can be re-initialized later
                this._initialized.delete(type);
            }
        }
    }

    /**
     * Sets the bloom threshold for an element type's material.
     * Called when mascot geometry type changes to prevent bloom blowout.
     * @param {string} elementType - Element type (e.g., 'water')
     * @param {number} threshold - Bloom threshold (0.35 for crystal/heart/rough, 0.85 for moon/star)
     */
    setElementBloomThreshold(elementType, threshold) {
        const material = this.materials.get(elementType);
        const config = ElementTypeRegistry.get(elementType);
        if (material && config?.setBloomThreshold) {
            config.setBloomThreshold(material, threshold);
        }
    }

    /**
     * Disposes of all resources.
     */
    dispose() {
        // Clear all elements
        this.despawnAll();

        // Dispose pools (unregister refraction/motion blur meshes first)
        for (const pool of this.pools.values()) {
            if (this._renderer && pool.mesh?.material?.userData?.needsRefraction) {
                this._renderer.removeRefractionMesh(pool.mesh);
            }
            if (this._renderer?.motionBlurPass) {
                this._renderer.motionBlurPass.removeInstancedMesh(pool.mesh);
            }
            pool.dispose();
        }
        this.pools.clear();

        // Dispose materials
        for (const material of this.materials.values()) {
            material.dispose();
        }
        this.materials.clear();

        // Dispose merged geometries
        for (const { geometry } of this.mergedGeometries.values()) {
            geometry.dispose();
        }
        this.mergedGeometries.clear();

        // Dispose cached geometries
        for (const geometry of this.geometryCache.values()) {
            geometry.dispose();
        }
        this.geometryCache.clear();

        // Remove container from scene
        if (this.container.parent) {
            this.container.parent.remove(this.container);
        }

        this._initialized.clear();
        this.activeElements.clear();
        this._poolLastUsed.clear();
    }
}

export default ElementInstancedSpawner;
