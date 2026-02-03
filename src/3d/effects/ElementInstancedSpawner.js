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
import { ElementInstancePool, SLOTS_PER_ELEMENT } from './ElementInstancePool.js';
import { MergedGeometryBuilder } from './MergedGeometryBuilder.js';

// Instanced materials - GPU-efficient versions with time-offset animation
import {
    createInstancedFireMaterial,
    updateInstancedFireMaterial,
    setInstancedFireArcAnimation
} from '../materials/InstancedFireMaterial.js';

// Spatial reference for mascot-relative positioning
import { MascotSpatialRef } from './MascotSpatialRef.js';

// Shared sizing/orientation logic (Golden Ratio system from original ElementSpawner)
import {
    getModelSizeFraction,
    getModelOrientation,
    calculateMascotRadius,
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
import { AnimationConfig } from './animation/AnimationConfig.js';

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

// ═══════════════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════

const MAX_ELEMENTS_PER_TYPE = 16;  // Max logical elements per type (×4 for trails = 64 instances)

// Default scale multiplier for surface mode elements (matches original ElementSpawner)
const DEFAULT_SCALE_MULTIPLIER = 1.5;

// Element types and their model paths (relative to assetsBasePath)
const ELEMENT_CONFIGS = {
    fire: {
        basePath: 'models/Elements/Fire/',
        models: [
            'flame-wisp.glb',
            'flame-tongue.glb',
            'ember-cluster.glb',
            'fire-burst.glb',
            'flame-ring.glb'    // For vortex effect
        ],
        createMaterial: createInstancedFireMaterial,
        updateMaterial: updateInstancedFireMaterial,
        scaleMultiplier: 1.5  // Fire elements slightly larger
    },
    // Additional elements will be added as instanced materials are created
    // ice: { ... },
    // water: { ... },
    // etc.
};

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
     */
    constructor(options = {}) {
        const {
            scene,
            coreMesh = null,
            camera = null,
            assetsBasePath = ''
        } = options;

        if (!scene) {
            throw new Error('[ElementInstancedSpawner] Scene is required');
        }

        this.scene = scene;
        this.coreMesh = coreMesh;
        this.camera = camera;
        this.assetsBasePath = assetsBasePath;

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
        console.log('[ElementInstancedSpawner] Initialized with coreMesh');
    }

    /**
     * Preload models for an element type.
     * This initializes the pool which loads and merges all geometries.
     * @param {string} elementType - Element type to preload
     * @returns {Promise<void>}
     */
    async preloadModels(elementType) {
        // Only preload if we have config for this element type
        if (!ELEMENT_CONFIGS[elementType]) {
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
        const config = ELEMENT_CONFIGS[elementType];
        if (!config) {
            console.warn(`[ElementInstancedSpawner] Unknown element type: ${elementType}`);
            return null;
        }

        // Load all models for this element type
        const geometries = [];
        for (const modelName of config.models) {
            const modelPath = `${this.assetsBasePath}/${config.basePath}${modelName}`;
            const geometry = await this._loadGeometry(modelPath);
            if (geometry) {
                geometries.push({ geometry, name: modelName.replace('.glb', '') });
            }
        }

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
        this.mergedGeometries.set(elementType, { geometry: mergedGeometry, modelMap });

        // Create instanced material
        const material = config.createMaterial();
        this.materials.set(elementType, material);

        // Create pool
        const pool = new ElementInstancePool(mergedGeometry, material, MAX_ELEMENTS_PER_TYPE);
        this.pools.set(elementType, pool);

        // Add the instanced mesh to the container
        this.container.add(pool.mesh);

        console.log(`[ElementInstancedSpawner] Initialized ${elementType} pool with ${geometries.length} models, ${MAX_ELEMENTS_PER_TYPE * SLOTS_PER_ELEMENT} max instances`);

        return pool;
    }

    /**
     * Loads a geometry from a GLTF file.
     * @private
     */
    async _loadGeometry(modelPath) {
        // Check cache
        if (this.geometryCache.has(modelPath)) {
            return this.geometryCache.get(modelPath);
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

        // Parse animation config if provided
        const animConfig = animation
            ? new AnimationConfig(animation, gestureDuration)
            : null;

        // Ensure pool is initialized
        const pool = await this.initializePool(elementType);
        if (!pool) {
            return [];
        }

        // Clear existing elements of this type first
        this.despawn(elementType);

        const merged = this.mergedGeometries.get(elementType);
        if (!merged) {
            return [];
        }

        // Determine spawn mode type
        const modeType = typeof mode === 'object' ? (mode.type || 'surface') : mode;

        // Debug: log spawn mode
        console.log(`[ElementInstancedSpawner] spawn ${elementType}: modeType=${modeType}`);

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
    _spawnOrbitFallback(elementType, count, models, animConfig, camera) {
        const pool = this.pools.get(elementType);
        const merged = this.mergedGeometries.get(elementType);
        const elementConfig = ELEMENT_CONFIGS[elementType];

        if (!pool || !merged) {
            return [];
        }

        const spawnedIds = [];
        const actualCount = Math.min(count, pool.availableSlots);
        const availableModels = models || Array.from(merged.modelMap.keys());

        for (let i = 0; i < actualCount; i++) {
            const modelName = availableModels[Math.floor(Math.random() * availableModels.length)];
            const modelIndex = merged.modelMap.get(modelName) || 0;

            const scaleMultiplier = elementConfig?.scaleMultiplier || DEFAULT_SCALE_MULTIPLIER;
            const scale = calculateElementScale(modelName, this.mascotRadius, scaleMultiplier);
            _temp.scale.setScalar(scale);

            const position = this._generateSpawnPosition('orbit', i, actualCount);
            const rotation = this._generateSpawnRotation('orbit', position);

            const elementId = `${elementType}_${this._nextId++}`;
            const success = pool.spawn(elementId, position, rotation, _temp.scale, modelIndex);

            if (success) {
                let animState = null;
                if (animConfig) {
                    animState = new AnimationState(animConfig, i);
                    animState.initialize(this.time);
                    pool.updateInstanceOpacity(elementId, animState.opacity);
                    pool.updateInstanceTransform(elementId, position, rotation, scale * animState.scale);
                } else {
                    // No animation config - make visible immediately
                    pool.updateInstanceOpacity(elementId, 1.0);
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

        console.log(`[ElementInstancedSpawner] Spawned ${spawnedIds.length} ${elementType} elements (fallback orbit)`);
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
    _generateSpawnRotation(pattern, position) {
        const quat = _temp.quaternion;

        // Random rotation for most patterns
        quat.setFromEuler(new THREE.Euler(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        ));

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
        const position = _temp.position.set(0, 0, 0);
        switch (result.axis) {
        case 'y':
            position.y = result.axisPos + result.positionOffset;
            break;
        case 'x':
            position.x = result.axisPos;
            position.y = result.positionOffset;
            break;
        case 'z':
            position.z = result.axisPos;
            position.y = result.positionOffset;
            break;
        }

        return {
            position: position.clone(),
            scale: result.scale,
            diameter: result.diameter,
            rotationOffset: result.rotationOffset
        };
    }

    /**
     * Spawn elements in axis-travel mode.
     * @param {string} elementType - Element type to spawn
     * @param {Object} spawnMode - Spawn mode configuration
     * @param {string[]} models - Model names to use
     * @param {AnimationConfig} animConfig - Animation configuration
     * @param {THREE.Camera} camera - Camera for orientation
     * @returns {Promise<string[]>} Array of spawned element IDs
     * @private
     */
    _spawnAxisTravel(elementType, spawnMode, models, animConfig, _camera) {
        const pool = this.pools.get(elementType);
        const merged = this.mergedGeometries.get(elementType);
        const elementConfig = ELEMENT_CONFIGS[elementType];

        if (!pool || !merged) {
            console.warn(`[ElementInstancedSpawner] Pool or merged geometry not ready for ${elementType}`);
            return [];
        }

        // Parse axis-travel configuration
        const axisConfig = this._parseAxisTravelConfig(spawnMode);

        // Expand formation into per-element data
        const formationElements = this._expandFormation(axisConfig);

        // Check for arc animation configuration in modelOverrides
        const animation = spawnMode.animation || {};
        const modelOverrides = animation.modelOverrides || {};
        const material = this.materials.get(elementType);

        // Apply arc animation settings if configured
        for (const modelName of axisConfig.models) {
            const overrides = modelOverrides[modelName];
            if (overrides?.shaderAnimation && material) {
                console.log(`[ElementInstancedSpawner] Applying arc animation for ${modelName}:`, overrides.shaderAnimation);
                setInstancedFireArcAnimation(material, overrides.shaderAnimation);
                break;  // Apply once per spawn (all rings use same settings)
            }
        }

        console.log(`[ElementInstancedSpawner] axis-travel: ${formationElements.length} formation elements, models: ${axisConfig.models.join(', ')}`);

        const spawnedIds = [];
        const availableModels = axisConfig.models.length > 0
            ? axisConfig.models
            : (models || Array.from(merged.modelMap.keys()));

        for (let i = 0; i < formationElements.length; i++) {
            const formationData = formationElements[i];

            // Select model (for axis-travel, typically all the same model like flame-ring)
            const modelName = availableModels[i % availableModels.length];
            const modelIndex = merged.modelMap.get(modelName);

            if (modelIndex === undefined) {
                console.warn(`[ElementInstancedSpawner] Model ${modelName} not found in merged geometry`);
                continue;
            }

            // Calculate initial position at gesture progress 0
            const initialResult = this._calculateAxisTravelPosition(axisConfig, formationData, 0);
            const {position} = initialResult;

            // Calculate scale using shared Golden Ratio sizing system
            const scaleMultiplier = axisConfig.scale || elementConfig?.scaleMultiplier || DEFAULT_SCALE_MULTIPLIER;
            const baseScale = calculateElementScale(modelName, this.mascotRadius, scaleMultiplier);

            // Apply initial scale and diameter
            const initialScale = baseScale * initialResult.scale;
            _temp.scale.set(
                initialScale * initialResult.diameter,
                initialScale,
                initialScale * initialResult.diameter
            );

            // Determine ring orientation:
            // 1. Use orientation from config if specified
            // 2. Fall back to model's default orientation from ElementSizing
            const configOrientation = axisConfig.orientation;
            const modelOrientation = getModelOrientation(modelName);
            const orientationMode = configOrientation || modelOrientation.mode || 'outward';
            console.log(`[ElementInstancedSpawner] Ring orientation for ${modelName}: config=${configOrientation}, model=${modelOrientation.mode}, resolved=${orientationMode}`);

            // Build rotation: first apply ring orientation, then formation arcOffset
            // Note: flame-ring model is created flat in XZ plane (normal = +Y)
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

            // Store the world rotation for update loop
            // Container will have identity rotation when worldSpaceOrientation is true
            const baseWorldRotation = rotation.clone();

            // Generate element ID
            const elementId = `${elementType}_${this._nextId++}`;

            // Spawn in pool - pass arc phase for shader arc visibility
            // For staggered animations, use time-based offset so each ring's arc starts fresh
            // when that ring appears (converts stagger timing to angle offset in shader)
            let arcPhase = formationData.rotationOffset || 0;
            const stagger = animation.stagger || 0;
            const shaderAnim = modelOverrides[modelName]?.shaderAnimation;
            if (stagger > 0 && shaderAnim?.arcSpeed) {
                // Time offset: negative angle to delay arc start based on element index
                // arcAngle in shader = gestureProgress * arcSpeed * 2π + arcPhase
                // Setting arcPhase = -stagger * index * arcSpeed * 2π makes each element
                // start its arc animation when it appears, not at gesture start
                const timeOffset = stagger * i * shaderAnim.arcSpeed * Math.PI * 2;
                arcPhase = -timeOffset;
                console.log(`[ElementInstancedSpawner] Arc time offset for element ${i}: stagger=${stagger}, arcSpeed=${shaderAnim.arcSpeed}, arcPhase=${arcPhase.toFixed(3)}`);
            }
            const success = pool.spawn(elementId, position, rotation, _temp.scale, modelIndex, arcPhase);

            if (success) {
                // Create per-element animation state if animation config provided
                let animState = null;
                if (animConfig) {
                    animState = new AnimationState(animConfig, i);
                    animState.initialize(this.time);

                    // Set initial opacity/scale from animation state
                    pool.updateInstanceOpacity(elementId, animState.opacity);
                    pool.updateInstanceTransform(elementId, position, rotation, initialScale * animState.scale);
                } else {
                    // No animation config - make visible immediately (backwards compatible)
                    pool.updateInstanceOpacity(elementId, 1.0);
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
                        initialResult
                    }
                });
                spawnedIds.push(elementId);
            }
        }

        console.log(`[ElementInstancedSpawner] Spawned ${spawnedIds.length} ${elementType} axis-travel elements`);
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
    _spawnAnchor(elementType, spawnMode, models, animConfig, _camera) {
        const pool = this.pools.get(elementType);
        const merged = this.mergedGeometries.get(elementType);
        const elementConfig = ELEMENT_CONFIGS[elementType];

        if (!pool || !merged) {
            console.warn(`[ElementInstancedSpawner] Pool or merged geometry not ready for ${elementType}`);
            return [];
        }

        // Parse anchor configuration using shared utility
        const anchorConfig = parseAnchorConfig(spawnMode, name => this.spatialRef.resolveLandmark(name));

        // Check for arc animation configuration
        const animation = spawnMode.animation || {};
        const modelOverrides = animation.modelOverrides || {};
        const material = this.materials.get(elementType);

        // Apply arc animation settings if configured
        for (const modelName of anchorConfig.models) {
            const overrides = modelOverrides[modelName];
            if (overrides?.shaderAnimation && material) {
                console.log(`[ElementInstancedSpawner] Applying arc animation for ${modelName}:`, overrides.shaderAnimation);
                setInstancedFireArcAnimation(material, overrides.shaderAnimation);
                break;
            }
        }

        console.log(`[ElementInstancedSpawner] anchor: landmark=${anchorConfig.landmark}, landmarkY=${anchorConfig.landmarkY.toFixed(3)}, offset=(${anchorConfig.offset.x}, ${anchorConfig.offset.y}, ${anchorConfig.offset.z}), orientation=${anchorConfig.orientation}`);

        const spawnedIds = [];
        const availableModels = anchorConfig.models.length > 0
            ? anchorConfig.models
            : (models || Array.from(merged.modelMap.keys()));

        for (let i = 0; i < anchorConfig.count; i++) {
            // Select model
            const modelName = availableModels[i % availableModels.length];
            const modelIndex = merged.modelMap.get(modelName);

            if (modelIndex === undefined) {
                console.warn(`[ElementInstancedSpawner] Model ${modelName} not found in merged geometry`);
                continue;
            }

            // Calculate position at anchor point using shared utility
            const anchorPos = calculateAnchorPosition(anchorConfig, 0);
            const position = _temp.position.set(anchorPos.x, anchorPos.y, anchorPos.z).clone();

            // Calculate scale
            const scaleMultiplier = anchorConfig.scale || elementConfig?.scaleMultiplier || DEFAULT_SCALE_MULTIPLIER;
            const baseScale = calculateElementScale(modelName, this.mascotRadius, scaleMultiplier);
            _temp.scale.setScalar(baseScale);

            // Apply orientation using shared utility
            const orientRot = getAnchorOrientation(anchorConfig.orientation);
            _temp.euler.set(orientRot.x, orientRot.y, orientRot.z);
            const rotation = _temp.quaternion.setFromEuler(_temp.euler).clone();

            // Generate element ID
            const elementId = `${elementType}_${this._nextId++}`;

            // Spawn in pool
            const success = pool.spawn(elementId, position, rotation, _temp.scale, modelIndex);

            if (success) {
                // Create per-element animation state
                let animState = null;
                if (animConfig) {
                    animState = new AnimationState(animConfig, i);
                    animState.initialize(this.time);

                    pool.updateInstanceOpacity(elementId, animState.opacity);
                    pool.updateInstanceTransform(elementId, position, rotation, baseScale * animState.scale);
                } else {
                    // No animation config - make visible immediately
                    pool.updateInstanceOpacity(elementId, 1.0);
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
                    // World-space orientation: anchor elements should maintain orientation
                    worldSpaceOrientation: true,
                    baseWorldRotation: rotation.clone(),
                    // Anchor-specific data for bob animation
                    anchor: {
                        config: anchorConfig,
                        baseY: anchorPos.baseY,
                    }
                });
                spawnedIds.push(elementId);
            }
        }

        console.log(`[ElementInstancedSpawner] Spawned ${spawnedIds.length} ${elementType} anchor elements`);
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
    _spawnOrbit(elementType, spawnMode, models, animConfig, _camera) {
        const pool = this.pools.get(elementType);
        const merged = this.mergedGeometries.get(elementType);
        const elementConfig = ELEMENT_CONFIGS[elementType];

        if (!pool || !merged) {
            console.warn(`[ElementInstancedSpawner] Pool or merged geometry not ready for ${elementType}`);
            return [];
        }

        // Parse orbit configuration using utility from OrbitMode.js
        const orbitConfig = parseOrbitConfig(spawnMode, name => this.spatialRef.resolveLandmark(name));

        // Expand formation into per-element data
        const formationElements = expandOrbitFormation(orbitConfig);

        // Check for arc animation configuration in modelOverrides
        const animation = spawnMode.animation || {};
        const modelOverrides = animation.modelOverrides || {};
        const material = this.materials.get(elementType);

        // Apply arc animation settings if configured
        for (const modelName of orbitConfig.models) {
            const overrides = modelOverrides[modelName];
            if (overrides?.shaderAnimation && material) {
                console.log(`[ElementInstancedSpawner] Applying arc animation for ${modelName}:`, overrides.shaderAnimation);
                setInstancedFireArcAnimation(material, overrides.shaderAnimation);
                break;
            }
        }

        console.log(`[ElementInstancedSpawner] orbit: ${formationElements.length} elements, radius=${orbitConfig.radius}, height=${orbitConfig.height}`);

        const spawnedIds = [];
        const availableModels = orbitConfig.models.length > 0
            ? orbitConfig.models
            : (models || Array.from(merged.modelMap.keys()));

        for (let i = 0; i < formationElements.length; i++) {
            const formationData = formationElements[i];

            // Select model
            const modelName = availableModels[i % availableModels.length];
            const modelIndex = merged.modelMap.get(modelName);

            if (modelIndex === undefined) {
                console.warn(`[ElementInstancedSpawner] Model ${modelName} not found in merged geometry`);
                continue;
            }

            // Calculate position
            const posResult = calculateOrbitPosition(orbitConfig, formationData, 0, this.mascotRadius);
            const position = _temp.position.set(posResult.x, posResult.y, posResult.z).clone();

            // Calculate scale
            const scaleMultiplier = orbitConfig.scale || elementConfig?.scaleMultiplier || DEFAULT_SCALE_MULTIPLIER;
            const baseScale = calculateElementScale(modelName, this.mascotRadius, scaleMultiplier);
            _temp.scale.setScalar(baseScale);

            // Determine ring orientation
            const configOrientation = orbitConfig.orientation;
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
                // Create per-element animation state
                let animState = null;
                if (animConfig) {
                    animState = new AnimationState(animConfig, i);
                    animState.initialize(this.time);

                    pool.updateInstanceOpacity(elementId, animState.opacity);
                    pool.updateInstanceTransform(elementId, position, rotation, baseScale * animState.scale);
                } else {
                    // No animation config - make visible immediately
                    pool.updateInstanceOpacity(elementId, 1.0);
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

        console.log(`[ElementInstancedSpawner] Spawned ${spawnedIds.length} ${elementType} orbit elements`);
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
    _spawnSurface(elementType, spawnMode, count, models, animConfig, camera) {
        const pool = this.pools.get(elementType);
        const merged = this.mergedGeometries.get(elementType);
        const elementConfig = ELEMENT_CONFIGS[elementType];

        if (!pool || !merged) {
            console.warn(`[ElementInstancedSpawner] Pool or merged geometry not ready for ${elementType}`);
            return [];
        }

        // Parse surface configuration using utility from SurfaceMode.js
        const surfaceConfig = parseSurfaceConfig(spawnMode);

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

        console.log(`[ElementInstancedSpawner] surface: ${surfacePoints.length} points sampled, pattern=${surfaceConfig.pattern}`);

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
            const modelIndex = merged.modelMap.get(modelName);

            if (modelIndex === undefined) {
                console.warn(`[ElementInstancedSpawner] Model ${modelName} not found in merged geometry`);
                continue;
            }

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
                // Create per-element animation state
                let animState = null;
                if (animConfig) {
                    animState = new AnimationState(animConfig, i);
                    animState.initialize(this.time);

                    pool.updateInstanceOpacity(elementId, animState.opacity);
                    pool.updateInstanceTransform(elementId, position, rotation, baseScale * animState.scale);
                } else {
                    // No animation config - make visible immediately
                    pool.updateInstanceOpacity(elementId, 1.0);
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

        console.log(`[ElementInstancedSpawner] Spawned ${spawnedIds.length} ${elementType} surface elements`);
        return spawnedIds;
    }

    /**
     * Triggers exit animation for all elements of a type.
     * Elements will animate out and be removed when complete.
     * @param {string} [elementType] - Element type to trigger exit for, or all if null
     */
    triggerExit(elementType = null) {
        for (const [elementId, data] of this.activeElements) {
            if (elementType && data.type !== elementType) continue;

            if (data.animState) {
                data.animState.triggerExit();
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
            return;
        }

        this.time += deltaTime;

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
            const config = ELEMENT_CONFIGS[type];
            const material = this.materials.get(type);
            if (config?.updateMaterial && material) {
                config.updateMaterial(material, this.time, gestureProgress ?? 0);
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
            const elementConfig = ELEMENT_CONFIGS[type];
            const isProceduralElement = elementConfig?.createMaterial != null;

            if (axisTravel && gestureProgress !== null) {
                // AXIS-TRAVEL MODE: Recalculate position based on gesture progress
                const result = this._calculateAxisTravelPosition(
                    axisTravel.config,
                    axisTravel.formationData,
                    gestureProgress
                );

                // Apply calculated position
                finalPosition = result.position;

                // Apply scale with diameter (X/Z) and animation fadeProgress
                const animScale = baseScale * result.scale * animState.fadeProgress;
                _temp.scale.set(
                    animScale * result.diameter,
                    animScale,
                    animScale * result.diameter
                );
                finalScale = animScale;

                // Update base position for any drift effects
                data.basePosition.copy(finalPosition);
            } else if (data.anchor) {
                // ANCHOR MODE: Apply bob animation using shared utility
                const anchorPos = calculateAnchorPosition(data.anchor.config, this.time);
                _temp.position.set(anchorPos.x, anchorPos.y, anchorPos.z);
                finalPosition = _temp.position;

                // Apply animated scale
                finalScale = isProceduralElement
                    ? baseScale * animState.fadeProgress
                    : baseScale * animState.scale;
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

                // Apply formation arcOffset as Z rotation (kaleidoscope effect)
                // This keeps each ring at its unique angle while facing camera
                const formationOffset = data.axisTravel?.formationData?.rotationOffset || 0;
                if (formationOffset !== 0) {
                    _temp.quaternion2.setFromAxisAngle(_temp.axis.set(0, 0, 1), formationOffset);
                    _temp.quaternion.multiply(_temp.quaternion2);
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
            if (axisTravel && gestureProgress !== null) {
                // Axis-travel uses non-uniform scale (diameter affects X/Z)
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
     * Disposes of all resources.
     */
    dispose() {
        // Clear all elements
        this.despawnAll();

        // Dispose pools
        for (const pool of this.pools.values()) {
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
    }
}

export default ElementInstancedSpawner;
