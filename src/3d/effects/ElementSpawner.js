/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Element Spawner
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Spawns 3D elemental geometry (ice crystals, rocks, vines) around mascot
 * @author Emotive Engine Team
 * @module effects/ElementSpawner
 *
 * Uses GLTFLoader to load .glb assets and MeshPhysicalMaterial for realistic rendering.
 * Ice crystals use transmission/refraction for glass-like appearance.
 * Earth rocks use PBR materials for stone appearance.
 * Nature vines use standard materials with leaf textures.
 *
 * ## Surface Spawn Configuration
 *
 * Surface mode supports detailed configuration for aesthetically pleasing placement:
 *
 * | Pattern    | Description                                      | Use Case            |
 * |------------|--------------------------------------------------|---------------------|
 * | crown      | Ring around top of mascot                        | Ice crown, halo     |
 * | shell      | Full surface coverage, evenly distributed        | Encasement, armor   |
 * | scattered  | Random organic distribution                      | Frost patches       |
 * | spikes     | Clustered formations pointing outward            | Crystalline growth  |
 * | ring       | Horizontal ring around mascot center             | Belt, barrier       |
 *
 * Configuration object:
 * ```javascript
 * spawnMode: {
 *   type: 'surface',
 *   pattern: 'shell',       // crown | shell | scattered | spikes | ring
 *   embedDepth: 0.3,        // 0-1, how deep into surface (0=on surface, 1=fully inside)
 *   cameraFacing: 0.5,      // 0=orient to normal, 1=face camera (billboard)
 *   clustering: 0.4,        // 0=evenly spread, 1=tightly clustered
 *   count: 8,               // Override default count
 *   scale: 1.5              // Scale multiplier
 * }
 * ```
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// ═══════════════════════════════════════════════════════════════════════════════════════
// GOLDEN RATIO SIZING SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════════════
//
// Element sizes are defined relative to the mascot's bounding sphere radius (R)
// using Golden Ratio (φ = 1.618) based progressions for aesthetic harmony.
//
// Size Classes (as fractions of mascot radius R):
//
// | Class     | Ratio  | % of R | Use Case                          |
// |-----------|--------|--------|-----------------------------------|
// | tiny      | 1/φ⁴   | ~6.9%  | Particles, debris, frost crystals |
// | small     | 1/φ³   | ~11.1% | Small crystals, pebbles           |
// | medium    | 1/φ²   | ~18.0% | Medium crystals, rocks            |
// | large     | 1/φ    | ~29.2% | Large formations, clusters        |
// | prominent | 1/φ⁰·⁵ | ~38.2% | Focal pieces, crown jewels        |
//
// The φ-based progression ensures visually pleasing size relationships:
// - Adjacent size classes differ by factor of φ (~1.618)
// - Natural, organic-feeling scale hierarchy
// - Fibonacci-like proportions found in nature
//
// ═══════════════════════════════════════════════════════════════════════════════════════

/** Golden Ratio constant */
const PHI = 1.6180339887;

/** Size class definitions as fractions of mascot radius */
const SIZE_CLASSES = {
    tiny:      1 / Math.pow(PHI, 4),    // ~0.069 (6.9% of R)
    small:     1 / Math.pow(PHI, 3),    // ~0.111 (11.1% of R)
    medium:    1 / Math.pow(PHI, 2),    // ~0.180 (18.0% of R)
    large:     1 / PHI,                 // ~0.292 (29.2% of R)
    prominent: 1 / Math.pow(PHI, 0.5)   // ~0.382 (38.2% of R)
};

/**
 * Model size definitions using Golden Ratio size classes
 * Each model maps to a size class with optional variance
 */
const MODEL_SIZES = {
    // Ice models - smaller than earth for delicate crystalline feel
    'crystal-small':   { class: 'tiny',   variance: 0.25 }, // ~0.05R - 0.09R
    'crystal-medium':  { class: 'small',  variance: 0.2 },  // ~0.09R - 0.13R
    'crystal-cluster': { class: 'medium', variance: 0.2 },  // ~0.14R - 0.22R
    'ice-spike':       { class: 'small',  variance: 0.25 }, // ~0.08R - 0.14R

    // Earth models - chunky, substantial feel
    'rock-chunk-small':  { class: 'small',  variance: 0.25 }, // ~0.08R - 0.14R
    'rock-chunk-medium': { class: 'medium', variance: 0.2 },  // ~0.14R - 0.22R
    'rock-cluster':      { class: 'large',  variance: 0.2 },  // ~0.23R - 0.35R
    'stone-slab':        { class: 'medium', variance: 0.25 }, // ~0.14R - 0.23R

    // Nature models - organic, varied sizes
    'vine-tendril':    { class: 'medium', variance: 0.3 },  // Curving vine segment
    'vine-coil':       { class: 'medium', variance: 0.25 }, // Spiral coiled vine
    'thorn-vine':      { class: 'small',  variance: 0.3 },  // Thorny vine piece
    'leaf-single':     { class: 'tiny',   variance: 0.25 }, // Individual leaf
    'leaf-cluster':    { class: 'small',  variance: 0.3 },  // Group of leaves
    'fern-frond':      { class: 'medium', variance: 0.25 }, // Fern shape
    'flower-bud':      { class: 'tiny',   variance: 0.3 },  // Closed bud
    'flower-bloom':    { class: 'small',  variance: 0.25 }, // Open flower
    'petal-scatter':   { class: 'tiny',   variance: 0.3 },  // Loose petals
    'root-tendril':    { class: 'small',  variance: 0.3 },  // Root piece
    'moss-patch':      { class: 'tiny',   variance: 0.25 }, // Moss cluster
    'mushroom-cap':    { class: 'small',  variance: 0.3 }   // Small mushroom
};

/**
 * Model orientation definitions for surface spawning
 *
 * Orientation modes:
 * - 'outward': Points away from surface (default) - good for spikes, flowers, mushrooms
 * - 'flat': Lies parallel to surface - good for moss, fallen petals, flat leaves
 * - 'tangent': Trails along surface in random direction - good for vines, roots
 *
 * tiltAngle: Additional tilt from base orientation (radians)
 * - For 'outward': 0 = straight out, positive = tilts away from vertical
 * - For 'flat': 0 = flush, positive = slight lift at one end
 * - For 'tangent': 0 = flush, positive = one end lifts off surface
 */
const MODEL_ORIENTATIONS = {
    // Ice - all point outward like crystals
    'crystal-small':   { mode: 'outward', tiltAngle: 0.1 },
    'crystal-medium':  { mode: 'outward', tiltAngle: 0.15 },
    'crystal-cluster': { mode: 'outward', tiltAngle: 0.1 },
    'ice-spike':       { mode: 'outward', tiltAngle: 0.2 },

    // Earth - chunky rocks embedded
    'rock-chunk-small':  { mode: 'outward', tiltAngle: 0.3 },  // Tumbled rocks
    'rock-chunk-medium': { mode: 'outward', tiltAngle: 0.25 },
    'rock-cluster':      { mode: 'outward', tiltAngle: 0.2 },
    'stone-slab':        { mode: 'flat',    tiltAngle: 0.15 }, // Slabs lie flatter

    // Nature - organic variety
    'vine-tendril':    { mode: 'tangent', tiltAngle: 0.2 },   // Trails along surface
    'vine-coil':       { mode: 'tangent', tiltAngle: 0.15 },  // Coils along surface
    'thorn-vine':      { mode: 'tangent', tiltAngle: 0.25 },  // Trails with thorns up
    'leaf-single':     { mode: 'flat',    tiltAngle: 0.3 },   // Lies flat, slight curl
    'leaf-cluster':    { mode: 'outward', tiltAngle: 0.4 },   // Spreads from attachment
    'fern-frond':      { mode: 'outward', tiltAngle: 0.5 },   // Arcs gracefully outward
    'flower-bud':      { mode: 'outward', tiltAngle: 0.2 },   // Points outward
    'flower-bloom':    { mode: 'outward', tiltAngle: 0.3 },   // Faces outward/camera
    'petal-scatter':   { mode: 'flat',    tiltAngle: 0.1 },   // Fallen petals lie flat
    'root-tendril':    { mode: 'tangent', tiltAngle: -0.1 },  // Digs into surface (negative = into)
    'moss-patch':      { mode: 'flat',    tiltAngle: 0 },     // Completely flush
    'mushroom-cap':    { mode: 'outward', tiltAngle: 0.15 }   // Cap faces outward
};

/**
 * Get orientation config for a model
 * @param {string} modelName - Name of the model
 * @returns {{ mode: string, tiltAngle: number }}
 */
function getModelOrientation(modelName) {
    return MODEL_ORIENTATIONS[modelName] || { mode: 'outward', tiltAngle: 0.2 };
}

/**
 * Get the size for a model as a fraction of mascot radius
 * @param {string} modelName - Name of the model
 * @returns {{ base: number, min: number, max: number }} Size fractions of R
 */
function getModelSizeFraction(modelName) {
    const sizeInfo = MODEL_SIZES[modelName];
    if (!sizeInfo) {
        // Default to small size class
        const base = SIZE_CLASSES.small;
        return { base, min: base * 0.8, max: base * 1.2 };
    }

    const base = SIZE_CLASSES[sizeInfo.class];
    const variance = sizeInfo.variance || 0.2;

    return {
        base,
        min: base * (1 - variance),
        max: base * (1 + variance)
    };
}

/**
 * Create ice crystal material with realistic refraction
 * Uses MeshPhysicalMaterial's transmission for glass-like appearance
 *
 * @param {Object} options
 * @param {number} [options.tint=0x88ccff] - Ice color tint
 * @param {number} [options.roughness=0.05] - Surface roughness (0=mirror, 1=matte)
 * @param {number} [options.transmission=0.95] - Transparency (0=opaque, 1=fully transparent)
 * @param {number} [options.thickness=1.5] - Refraction depth
 * @returns {THREE.MeshPhysicalMaterial}
 */
export function createIceCrystalMaterial(options = {}) {
    const {
        tint = 0x88ddff,
        roughness = 0.15,
        opacity = 0.85
    } = options;

    // Use MeshStandardMaterial with transparency for reliable visibility
    // MeshPhysicalMaterial transmission requires envMap to show refraction
    return new THREE.MeshStandardMaterial({
        color: tint,
        metalness: 0.1,
        roughness,
        transparent: true,
        opacity,
        side: THREE.DoubleSide,
        // Emissive gives ice a subtle inner glow
        emissive: 0x4488aa,
        emissiveIntensity: 0.15
    });
}

/**
 * Create earth/rock material for stone chunks
 *
 * @param {Object} options
 * @param {number} [options.baseColor=0x5a4a3a] - Stone base color
 * @param {number} [options.roughness=0.8] - Surface roughness
 * @returns {THREE.MeshStandardMaterial}
 */
export function createEarthMaterial(options = {}) {
    const {
        baseColor = 0x5a4a3a,
        roughness = 0.8
    } = options;

    return new THREE.MeshStandardMaterial({
        color: baseColor,
        metalness: 0.1,
        roughness,
        side: THREE.DoubleSide
    });
}

/**
 * Create nature/plant material for organic elements
 *
 * @param {Object} options
 * @param {number} [options.baseColor=0x2d5a1d] - Plant base color (green)
 * @param {number} [options.roughness=0.7] - Surface roughness
 * @returns {THREE.MeshStandardMaterial}
 */
export function createNatureMaterial(options = {}) {
    const {
        baseColor = 0x3a6b2a,  // Forest green
        roughness = 0.75
    } = options;

    return new THREE.MeshStandardMaterial({
        color: baseColor,
        metalness: 0.0,
        roughness,
        side: THREE.DoubleSide,
        // Subtle subsurface-like effect
        emissive: 0x1a3510,
        emissiveIntensity: 0.1
    });
}

/**
 * ElementSpawner - Manages loading and spawning of 3D elemental geometry
 */
export class ElementSpawner {
    /**
     * @param {Object} options
     * @param {THREE.Scene} options.scene - Three.js scene
     * @param {string} [options.assetBasePath='/assets'] - Base path for assets
     * @param {number} [options.maxElements=20] - Maximum spawned elements per type
     */
    constructor(options = {}) {
        this.scene = options.scene;
        this.assetBasePath = options.assetBasePath || '/assets';
        this.maxElements = options.maxElements || 20;

        // Loader
        this.gltfLoader = new GLTFLoader();

        // Loaded geometry cache (shared across instances)
        this.geometryCache = new Map();

        // Active spawned elements by type
        this.activeElements = {
            ice: [],
            earth: [],
            nature: []
        };

        // Materials (created once, reused)
        this.iceMaterial = null;
        this.earthMaterial = null;
        this.natureMaterial = null;

        // Animation state
        this.time = 0;

        // Spawn configuration per element type
        this.spawnConfig = {
            ice: {
                models: ['crystal-small', 'crystal-medium', 'crystal-cluster', 'ice-spike'],
                count: { min: 5, max: 12 },
                scale: { min: 0.08, max: 0.18 },
                orbitRadius: { min: 0.7, max: 1.2 },
                heightOffset: { min: -0.3, max: 0.5 },
                rotationSpeed: { min: 0.02, max: 0.08 }  // Slow, gentle rotation
            },
            earth: {
                models: ['rock-chunk-small', 'rock-chunk-medium', 'rock-cluster', 'stone-slab'],
                count: { min: 4, max: 10 },
                scale: { min: 0.1, max: 0.2 },
                orbitRadius: { min: 0.6, max: 1.0 },
                heightOffset: { min: -0.4, max: 0.3 },
                rotationSpeed: { min: 0.01, max: 0.04 }  // Very slow, rocks barely rotate
            },
            nature: {
                models: [
                    'vine-tendril', 'vine-coil', 'thorn-vine',
                    'leaf-single', 'leaf-cluster', 'fern-frond',
                    'flower-bud', 'flower-bloom', 'petal-scatter',
                    'root-tendril', 'moss-patch', 'mushroom-cap'
                ],
                count: { min: 4, max: 10 },
                scale: { min: 0.08, max: 0.2 },
                orbitRadius: { min: 0.5, max: 0.9 },
                heightOffset: { min: -0.2, max: 0.6 },
                rotationSpeed: { min: 0.01, max: 0.05 }  // Gentle sway
            }
        };

        // Parent container for all elements (attached to core mesh)
        this.container = new THREE.Group();
        this.container.name = 'ElementSpawnerContainer';

        // Reference to core mesh for positioning
        this.coreMesh = null;

        // Camera reference for facing calculations
        this.camera = null;

        // Mascot bounding sphere radius (calculated on initialize)
        // Used for Golden Ratio relative sizing
        this.mascotRadius = 1.0;  // Default fallback
    }

    /**
     * Initialize spawner with core mesh reference
     * @param {THREE.Mesh} coreMesh - The main mascot mesh
     * @param {THREE.Camera} [camera] - Camera for facing calculations
     */
    initialize(coreMesh, camera = null) {
        this.coreMesh = coreMesh;
        this.camera = camera;

        // Calculate mascot's bounding sphere radius for Golden Ratio sizing
        this._calculateMascotRadius();

        // Add container to scene (not coreMesh) for reliable rendering
        // We'll sync position with coreMesh in update()
        if (this.scene && !this.container.parent) {
            this.scene.add(this.container);
        }

        // Pre-create materials
        this.iceMaterial = createIceCrystalMaterial();
        this.earthMaterial = createEarthMaterial();
        this.natureMaterial = createNatureMaterial();

        // Debug: console.log(`[ElementSpawner] Initialized with mascot radius: ${this.mascotRadius.toFixed(3)}`);
    }

    /**
     * Calculate mascot's bounding sphere radius for relative sizing
     * @private
     */
    _calculateMascotRadius() {
        if (!this.coreMesh?.geometry) {
            console.warn('[ElementSpawner] No coreMesh geometry, using default radius');
            this.mascotRadius = 1.0;
            return;
        }

        const {geometry} = this.coreMesh;

        // Ensure bounding sphere is computed
        if (!geometry.boundingSphere) {
            geometry.computeBoundingSphere();
        }

        if (geometry.boundingSphere) {
            // Use the geometry's bounding sphere radius
            this.mascotRadius = geometry.boundingSphere.radius;

            // Account for mesh scale if any
            const {scale} = this.coreMesh;
            const avgScale = (scale.x + scale.y + scale.z) / 3;
            this.mascotRadius *= avgScale;
        } else {
            // Fallback: compute from bounding box
            if (!geometry.boundingBox) {
                geometry.computeBoundingBox();
            }

            if (geometry.boundingBox) {
                const size = new THREE.Vector3();
                geometry.boundingBox.getSize(size);
                // Use half the diagonal as approximate radius
                this.mascotRadius = size.length() / 2;
            } else {
                this.mascotRadius = 1.0;
            }
        }

        // Ensure reasonable minimum
        this.mascotRadius = Math.max(0.1, this.mascotRadius);

        // Debug logging disabled for production
        // console.log(`[ElementSpawner] φ-based sizing: mascot radius R = ${this.mascotRadius.toFixed(3)}`);
        // console.log(`[ElementSpawner] Size classes: ...`);
    }

    /**
     * Load a model from disk
     * @param {string} elementType - 'ice', 'earth', or 'nature'
     * @param {string} modelName - Model name without extension
     * @returns {Promise<THREE.BufferGeometry>}
     */
    loadModel(elementType, modelName) {
        const cacheKey = `${elementType}/${modelName}`;

        if (this.geometryCache.has(cacheKey)) {
            return Promise.resolve(this.geometryCache.get(cacheKey));
        }

        const path = `${this.assetBasePath}/models/Elements/${this._capitalize(elementType)}/${modelName}.glb`;

        return new Promise((resolve, _reject) => {
            this.gltfLoader.load(
                path,
                gltf => {
                    let geometry = null;

                    gltf.scene.traverse(child => {
                        if (child.isMesh && child.geometry) {
                            geometry = child.geometry.clone();
                        }
                    });

                    if (geometry) {
                        // Center and normalize geometry
                        geometry.computeBoundingBox();
                        const center = new THREE.Vector3();
                        geometry.boundingBox.getCenter(center);
                        geometry.translate(-center.x, -center.y, -center.z);

                        // Compute normals if missing
                        if (!geometry.attributes.normal) {
                            geometry.computeVertexNormals();
                        }

                        this.geometryCache.set(cacheKey, geometry);
                        resolve(geometry);
                    } else {
                        console.warn(`[ElementSpawner] No mesh found in ${path}`);
                        resolve(null);
                    }
                },
                undefined,
                error => {
                    console.warn(`[ElementSpawner] Failed to load ${path}:`, error);
                    resolve(null); // Don't reject - allow graceful degradation
                }
            );
        });
    }

    /**
     * Preload all models for an element type
     * @param {string} elementType - 'ice', 'earth', or 'nature'
     */
    async preloadModels(elementType) {
        const config = this.spawnConfig[elementType];
        if (!config) return;

        const promises = config.models.map(modelName =>
            this.loadModel(elementType, modelName)
        );

        await Promise.all(promises);
    }

    /**
     * Sample surface points with pattern-aware distribution
     *
     * @param {THREE.BufferGeometry} geometry - Mascot geometry
     * @param {number} count - Number of points to sample
     * @param {Object} [config] - Surface spawn configuration
     * @param {string} [config.pattern='scattered'] - Distribution pattern
     * @param {number} [config.clustering=0] - Clustering amount (0-1)
     * @param {THREE.Camera} [camera] - Camera for facing calculations
     * @returns {Array<{position: THREE.Vector3, normal: THREE.Vector3, weight: number}>}
     * @private
     */
    _sampleSurfacePoints(geometry, count, config = {}, camera = null) {
        const {
            pattern = 'scattered',
            clustering = 0,
            minDistanceFactor = 0.15  // Minimum distance as fraction of mascot radius
        } = config;

        // Calculate minimum distance between elements
        // Default: 15% of mascot radius, ensuring elements don't overlap
        const minDistance = this.mascotRadius * minDistanceFactor;

        const positions = geometry.attributes.position;
        const normals = geometry.attributes.normal;
        const vertexCount = positions.count;

        // Build weighted vertex list based on pattern and camera
        const candidates = [];
        const cameraDir = camera ?
            new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion) :
            new THREE.Vector3(0, 0, 1);

        for (let i = 0; i < vertexCount; i++) {
            const pos = new THREE.Vector3(
                positions.getX(i),
                positions.getY(i),
                positions.getZ(i)
            );
            const normal = normals ?
                new THREE.Vector3(
                    normals.getX(i),
                    normals.getY(i),
                    normals.getZ(i)
                ).normalize() :
                new THREE.Vector3(0, 1, 0);

            // Calculate weight based on pattern
            let weight = 1.0;

            switch (pattern) {
            case 'crown':
                // Favor top of mascot (high Y, facing upward)
                weight = Math.max(0, pos.y) * 2 + Math.max(0, normal.y) * 0.5;
                break;

            case 'shell':
                // Even distribution, slight camera bias for visibility
                weight = 0.5 + Math.max(0, normal.dot(cameraDir)) * 0.5;
                break;

            case 'scattered':
                // Random with camera visibility weighting
                weight = 0.3 + Math.max(0, normal.dot(cameraDir)) * 0.7;
                break;

            case 'spikes': {
                // Favor outward-facing normals (edges, protrusions)
                const radialDir = pos.clone().normalize();
                weight = Math.max(0, normal.dot(radialDir)) * 1.5;
                break;
            }

            case 'ring': {
                // Horizontal ring around center
                const horizontalness = 1 - Math.abs(normal.y);
                const atCenter = 1 - Math.abs(pos.y) * 2;
                weight = horizontalness * 0.5 + Math.max(0, atCenter) * 0.5;
                break;
            }

            default:
                weight = 1.0;
            }

            // Apply camera-facing boost for all patterns
            const cameraDot = normal.dot(cameraDir);
            if (cameraDot > 0) {
                weight *= 1 + cameraDot * 0.3;
            }

            if (weight > 0.01) {
                candidates.push({ position: pos, normal, weight, index: i });
            }
        }

        // Sort by weight and use weighted random selection
        candidates.sort((a, b) => b.weight - a.weight);

        const samples = [];
        const usedIndices = new Set();

        // If clustering, pick cluster centers first
        const clusterCenters = [];
        if (clustering > 0 && count > 2) {
            const numClusters = Math.max(1, Math.floor(count * (1 - clustering) * 0.5));
            for (let c = 0; c < numClusters && candidates.length > 0; c++) {
                // Pick from top candidates
                const idx = Math.floor(Math.random() * Math.min(candidates.length, 10));
                clusterCenters.push(candidates[idx].position.clone());
            }
        }

        // Helper to check if a position is far enough from all selected samples
        const isFarEnough = (pos, threshold) => {
            for (const sample of samples) {
                if (pos.distanceTo(sample.position) < threshold) {
                    return false;
                }
            }
            return true;
        };

        // Track attempts to avoid infinite loops
        let consecutiveFailures = 0;
        const maxFailures = 20;
        let currentMinDistance = minDistance;

        for (let i = 0; i < count && candidates.length > 0; i++) {
            let selected = null;
            let attempts = 0;
            const maxAttempts = 30;

            while (!selected && attempts < maxAttempts) {
                attempts++;
                let candidateIdx;

                if (clustering > 0 && clusterCenters.length > 0) {
                    // Find candidates near cluster centers that meet distance requirement
                    const clusterCenter = clusterCenters[i % clusterCenters.length];
                    let bestScore = Infinity;
                    let bestIdx = -1;

                    for (let j = 0; j < Math.min(candidates.length, 50); j++) {
                        if (usedIndices.has(candidates[j].index)) continue;

                        const pos = candidates[j].position;
                        // Check minimum distance from existing samples
                        if (!isFarEnough(pos, currentMinDistance)) continue;

                        const dist = pos.distanceTo(clusterCenter);
                        const score = dist / (candidates[j].weight + 0.1);
                        if (score < bestScore) {
                            bestScore = score;
                            bestIdx = j;
                        }
                    }
                    candidateIdx = bestIdx;
                } else {
                    // Weighted random selection with distance checking
                    const poolSize = Math.min(candidates.length, Math.max(20, candidates.length * 0.4));

                    // Build list of valid candidates (not used, far enough)
                    const validCandidates = [];
                    for (let j = 0; j < poolSize; j++) {
                        if (usedIndices.has(candidates[j].index)) continue;
                        if (!isFarEnough(candidates[j].position, currentMinDistance)) continue;
                        validCandidates.push({ idx: j, weight: candidates[j].weight });
                    }

                    if (validCandidates.length > 0) {
                        // Weighted random from valid candidates
                        const totalWeight = validCandidates.reduce((sum, c) => sum + c.weight, 0);
                        let r = Math.random() * totalWeight;
                        candidateIdx = validCandidates[0].idx;

                        for (const vc of validCandidates) {
                            r -= vc.weight;
                            if (r <= 0) {
                                candidateIdx = vc.idx;
                                break;
                            }
                        }
                    } else {
                        candidateIdx = -1;
                    }
                }

                if (candidateIdx >= 0) {
                    selected = candidates[candidateIdx];
                    usedIndices.add(selected.index);
                    consecutiveFailures = 0;
                } else {
                    // No valid candidate found, reduce distance requirement
                    consecutiveFailures++;
                    if (consecutiveFailures >= maxFailures) {
                        // Significantly relax distance for remaining elements
                        currentMinDistance *= 0.5;
                        consecutiveFailures = 0;
                    }
                }
            }

            if (selected) {
                samples.push({
                    position: selected.position.clone(),
                    normal: selected.normal.clone(),
                    weight: selected.weight
                });
            }
        }

        return samples;
    }

    /**
     * Orient element based on model type and surface normal
     *
     * Supports three orientation modes:
     * - 'outward': Element points away from surface (crystals, flowers, mushrooms)
     * - 'flat': Element lies parallel to surface (moss, fallen petals)
     * - 'tangent': Element trails along surface (vines, roots)
     *
     * @param {THREE.Mesh} mesh - Mesh to orient
     * @param {THREE.Vector3} normal - Surface normal
     * @param {number} cameraFacing - 0=normal aligned, 1=camera facing
     * @param {THREE.Camera} [camera] - Camera for facing
     * @param {string} [modelName] - Model name for orientation lookup
     * @private
     */
    _orientElement(mesh, normal, cameraFacing, camera = null, modelName = null) {
        const up = new THREE.Vector3(0, 1, 0);
        const orientConfig = modelName ? getModelOrientation(modelName) : { mode: 'outward', tiltAngle: 0.2 };

        // Random angle for variety (used by all modes)
        const randomAngle = Math.random() * Math.PI * 2;

        // Calculate a tangent vector perpendicular to the normal
        // This gives us a direction "along" the surface
        const tangent = new THREE.Vector3();
        if (Math.abs(normal.y) < 0.999) {
            tangent.crossVectors(up, normal).normalize();
        } else {
            // If normal is nearly vertical, use a different reference
            tangent.crossVectors(new THREE.Vector3(1, 0, 0), normal).normalize();
        }

        // Calculate bitangent (perpendicular to both normal and tangent)
        const bitangent = new THREE.Vector3().crossVectors(normal, tangent).normalize();

        // Rotate tangent by random angle around normal for variety
        const rotatedTangent = tangent.clone()
            .multiplyScalar(Math.cos(randomAngle))
            .addScaledVector(bitangent, Math.sin(randomAngle));

        const baseQuat = new THREE.Quaternion();

        switch (orientConfig.mode) {
        case 'flat':
            // Element lies parallel to surface
            // Up axis becomes the surface normal, forward is along tangent
            {
                const matrix = new THREE.Matrix4();
                // X = rotated tangent (forward), Y = normal (up), Z = cross product
                const zAxis = new THREE.Vector3().crossVectors(rotatedTangent, normal).normalize();
                matrix.makeBasis(rotatedTangent, normal, zAxis);
                baseQuat.setFromRotationMatrix(matrix);

                // Apply tilt - rotate around tangent axis to lift one edge
                if (orientConfig.tiltAngle !== 0) {
                    const tiltQuat = new THREE.Quaternion();
                    tiltQuat.setFromAxisAngle(rotatedTangent, orientConfig.tiltAngle);
                    baseQuat.premultiply(tiltQuat);
                }
            }
            break;

        case 'tangent':
            // Element trails along surface (vines, roots)
            // Forward axis follows surface, slight lift for natural drape
            {
                // Element's "up" is tilted between normal and tangent
                const tiltAmount = 0.3; // How much the element lifts off surface
                const elementUp = normal.clone()
                    .multiplyScalar(tiltAmount)
                    .addScaledVector(rotatedTangent, 1 - tiltAmount)
                    .normalize();

                baseQuat.setFromUnitVectors(up, elementUp);

                // Apply additional tilt (negative = digs in, positive = lifts)
                if (orientConfig.tiltAngle !== 0) {
                    const tiltAxis = new THREE.Vector3().crossVectors(rotatedTangent, normal).normalize();
                    const tiltQuat = new THREE.Quaternion();
                    tiltQuat.setFromAxisAngle(tiltAxis, orientConfig.tiltAngle);
                    baseQuat.premultiply(tiltQuat);
                }
            }
            break;

        case 'outward':
        default: {
            // Element points away from surface (default behavior)
            baseQuat.setFromUnitVectors(up, normal);

            // Apply tilt - rotate away from straight-out for more natural look
            if (orientConfig.tiltAngle !== 0) {
                const tiltQuat = new THREE.Quaternion();
                tiltQuat.setFromAxisAngle(rotatedTangent, orientConfig.tiltAngle);
                baseQuat.premultiply(tiltQuat);
            }

            // Random spin around normal
            const spinQuat = new THREE.Quaternion();
            spinQuat.setFromAxisAngle(normal, randomAngle);
            baseQuat.premultiply(spinQuat);
            break;
        }
        }

        // Apply camera-facing blend if requested
        if (cameraFacing > 0 && camera && orientConfig.mode === 'outward') {
            const cameraPos = camera.position.clone();
            const meshWorldPos = mesh.getWorldPosition(new THREE.Vector3());
            const toCamera = cameraPos.sub(meshWorldPos).normalize();

            const cameraQuat = new THREE.Quaternion();
            cameraQuat.setFromUnitVectors(up, toCamera);

            // Slerp between base orientation and camera facing
            baseQuat.slerp(cameraQuat, cameraFacing);
        }

        mesh.quaternion.copy(baseQuat);
    }

    /**
     * Spawn elements around the mascot
     * @param {string} elementType - 'ice', 'earth', or 'nature'
     * @param {Object} options
     * @param {number} [options.intensity=1.0] - Spawn intensity (affects count)
     * @param {boolean} [options.animated=true] - Enable spawn animation
     * @param {string|Object} [options.mode='orbit'] - Spawn mode string or config object
     * @param {THREE.Camera} [options.camera] - Camera for facing calculations
     */
    async spawn(elementType, options = {}) {
        const { intensity = 1.0, animated = true } = options;
        // Use passed camera or fall back to stored camera
        const camera = options.camera || this.camera;
        const { mode = 'orbit' } = options;

        // Normalize mode to configuration object
        let surfaceConfig = null;
        let modeType = 'orbit';

        if (typeof mode === 'object' && mode !== null) {
            // Full configuration object
            modeType = mode.type || 'surface';
            surfaceConfig = {
                pattern: mode.pattern || 'shell',
                embedDepth: mode.embedDepth ?? 0.2,
                cameraFacing: mode.cameraFacing ?? 0.3,
                clustering: mode.clustering ?? 0,
                countOverride: mode.count || null,
                scaleMultiplier: mode.scale ?? 1.5,
                // Minimum distance between elements as fraction of mascot radius
                // Higher values = more spread out, lower = allows closer placement
                minDistanceFactor: mode.minDistance ?? 0.18
            };
        } else if (typeof mode === 'string') {
            modeType = mode;
            if (mode === 'surface') {
                // Default surface config
                surfaceConfig = {
                    pattern: 'shell',
                    embedDepth: 0.2,
                    cameraFacing: 0.3,
                    clustering: 0,
                    countOverride: null,
                    scaleMultiplier: 1.5,
                    minDistanceFactor: 0.18
                };
            }
        }

        const config = this.spawnConfig[elementType];

        if (!config) {
            console.warn(`[ElementSpawner] Unknown element type: ${elementType}`);
            return;
        }

        // Clear existing elements of this type
        this.despawn(elementType, false);

        // Calculate spawn count based on intensity (or use override)
        const count = surfaceConfig?.countOverride || Math.floor(
            config.count.min + (config.count.max - config.count.min) * intensity
        );

        // Debug: console.log(`[ElementSpawner] Spawning ${count} ${elementType} elements (mode: ${modeType}, pattern: ${surfaceConfig?.pattern || 'n/a'})`);

        // Get material for this type
        const material = this._getMaterial(elementType);

        // For surface mode, sample points from mascot geometry with pattern awareness
        let surfacePoints = null;
        if (modeType === 'surface' && this.coreMesh?.geometry) {
            surfacePoints = this._sampleSurfacePoints(
                this.coreMesh.geometry,
                count,
                surfaceConfig,
                camera
            );
        }

        for (let i = 0; i < count; i++) {
            // Select random model
            const modelName = config.models[Math.floor(Math.random() * config.models.length)];
            const geometry = await this.loadModel(elementType, modelName);

            if (!geometry) continue;

            // Create mesh with shared material
            const mesh = new THREE.Mesh(geometry, material);

            // ═══════════════════════════════════════════════════════════════════════
            // GOLDEN RATIO SIZING: Calculate scale relative to mascot radius
            // ═══════════════════════════════════════════════════════════════════════
            const modelSizeFraction = getModelSizeFraction(modelName);
            const baseScale = modelSizeFraction.min +
                Math.random() * (modelSizeFraction.max - modelSizeFraction.min);

            // Convert fraction of R to actual world units
            const mascotRelativeScale = baseScale * this.mascotRadius;

            // Apply mode-specific multiplier (surface mode elements may be larger/smaller)
            const scaleMultiplier = surfaceConfig?.scaleMultiplier ?? 1.0;
            const scale = mascotRelativeScale * scaleMultiplier;

            // Store spawn mode and config
            mesh.userData.spawnMode = modeType;
            mesh.userData.surfaceConfig = surfaceConfig;
            mesh.userData.elementType = elementType;
            mesh.userData.spawnTime = this.time;

            if (modeType === 'surface' && surfacePoints && surfacePoints[i]) {
                // SURFACE MODE: Attach to mascot surface with configurable depth and orientation
                const sample = surfacePoints[i];

                // Calculate embed depth: negative offset moves into the mesh
                const embedDepth = surfaceConfig?.embedDepth ?? 0.2;
                // offset = (1 - embedDepth) * scale * 0.5 - embedDepth * scale * 0.3
                // At embedDepth=0: sits on surface with slight outward offset
                // At embedDepth=1: embedded mostly inside
                const outwardOffset = (1 - embedDepth) * scale * 0.4;
                const inwardOffset = embedDepth * scale * 0.3;
                const netOffset = outwardOffset - inwardOffset;

                const offset = sample.normal.clone().multiplyScalar(netOffset);
                mesh.position.copy(sample.position).add(offset);

                // Hybrid orientation: blend normal-aligned with camera-facing
                // Uses model-specific orientation (flat, tangent, outward)
                const cameraFacing = surfaceConfig?.cameraFacing ?? 0.3;
                this._orientElement(mesh, sample.normal, cameraFacing, camera, modelName);

                // Store surface data for animation
                mesh.userData.surfaceNormal = sample.normal.clone();
                mesh.userData.surfacePosition = sample.position.clone();
                mesh.userData.embedDepth = embedDepth;
                mesh.userData.growthOffset = 0;
                mesh.userData.targetGrowthOffset = netOffset;

            } else {
                // ORBIT MODE (default): Elements orbit around mascot
                const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
                const radius = config.orbitRadius.min +
                    Math.random() * (config.orbitRadius.max - config.orbitRadius.min);
                const height = config.heightOffset.min +
                    Math.random() * (config.heightOffset.max - config.heightOffset.min);

                mesh.position.set(
                    Math.cos(angle) * radius,
                    height,
                    Math.sin(angle) * radius
                );

                // Random rotation
                mesh.rotation.set(
                    Math.random() * Math.PI,
                    Math.random() * Math.PI,
                    Math.random() * Math.PI
                );

                mesh.userData.orbitAngle = angle;
                mesh.userData.orbitRadius = radius;
                mesh.userData.heightOffset = height;
                mesh.userData.rotationSpeed = config.rotationSpeed.min +
                    Math.random() * (config.rotationSpeed.max - config.rotationSpeed.min);
            }

            // Spawn animation - start small and grow
            // Store final scale for pulse animation
            mesh.userData.finalScale = scale;

            if (animated) {
                mesh.userData.targetScale = scale;
                mesh.scale.setScalar(0.01);
            } else {
                mesh.scale.setScalar(scale);
            }

            // For surface mode, add to coreMesh so it moves with it
            if (modeType === 'surface' && this.coreMesh) {
                this.coreMesh.add(mesh);
            } else {
                this.container.add(mesh);
            }
            this.activeElements[elementType].push(mesh);
        }
    }

    /**
     * Despawn all elements of a type
     * @param {string} elementType - 'ice', 'earth', or 'nature'
     * @param {boolean} [animated=true] - Enable despawn animation
     */
    despawn(elementType, animated = true) {
        const elements = this.activeElements[elementType];
        if (!elements) return;

        for (const mesh of elements) {
            if (animated) {
                mesh.userData.despawning = true;
                mesh.userData.despawnStart = this.time;
            } else {
                // Surface mode elements are attached to coreMesh
                if (mesh.userData.spawnMode === 'surface' && this.coreMesh) {
                    this.coreMesh.remove(mesh);
                } else {
                    this.container.remove(mesh);
                }
                mesh.geometry.dispose();
            }
        }

        if (!animated) {
            this.activeElements[elementType] = [];
        }
    }

    /**
     * Despawn all elements
     */
    despawnAll() {
        for (const type of ['ice', 'earth', 'nature']) {
            this.despawn(type, false);
        }
    }

    /**
     * Update animations
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        this.time += deltaTime;

        // Sync container position with coreMesh
        if (this.coreMesh) {
            this.container.position.copy(this.coreMesh.position);
        }

        for (const type of ['ice', 'earth', 'nature']) {
            const elements = this.activeElements[type];
            const toRemove = [];

            for (const mesh of elements) {
                const isSurfaceMode = mesh.userData.spawnMode === 'surface';

                // Spawn animation
                if (mesh.userData.targetScale) {
                    const elapsed = this.time - mesh.userData.spawnTime;
                    const duration = isSurfaceMode ? 0.8 : 0.5;  // Slower growth for surface mode
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

                    mesh.scale.setScalar(mesh.userData.targetScale * eased);

                    // Surface mode: also animate position outward along normal
                    if (isSurfaceMode && mesh.userData.surfaceNormal && mesh.userData.surfacePosition) {
                        const growthOffset = mesh.userData.targetGrowthOffset * eased;
                        const normal = mesh.userData.surfaceNormal;
                        const basePos = mesh.userData.surfacePosition;
                        mesh.position.copy(basePos).addScaledVector(normal, growthOffset);
                    }

                    if (progress >= 1) {
                        delete mesh.userData.targetScale;
                    }
                }

                // Despawn animation
                if (mesh.userData.despawning) {
                    const elapsed = this.time - mesh.userData.despawnStart;
                    const progress = Math.min(elapsed / 0.3, 1); // 0.3s despawn duration

                    mesh.scale.setScalar(mesh.scale.x * (1 - progress * progress));

                    if (progress >= 1) {
                        toRemove.push(mesh);
                    }
                    continue; // Skip other animations during despawn
                }

                // SURFACE MODE: Static after spawn - no animation
                // Elements attached to surface should feel solid and grounded
                if (isSurfaceMode) {
                    continue;  // Skip all animations for surface mode
                }

                // ORBIT MODE: Gentle orbital drift - extremely slow, meditative orbiting
                if (mesh.userData.orbitAngle !== undefined) {
                    mesh.userData.orbitAngle += deltaTime * 0.003;  // Very slow orbit (~35 minutes per revolution)
                    const radius = mesh.userData.orbitRadius;
                    const height = mesh.userData.heightOffset;

                    // Subtle bobbing - very slow and gentle
                    const bob = Math.sin(this.time * 0.15 + mesh.userData.orbitAngle) * 0.008;

                    mesh.position.set(
                        Math.cos(mesh.userData.orbitAngle) * radius,
                        height + bob,
                        Math.sin(mesh.userData.orbitAngle) * radius
                    );
                }

                // Very slow rotation - barely perceptible (orbit mode only)
                if (mesh.userData.rotationSpeed) {
                    mesh.rotation.y += deltaTime * mesh.userData.rotationSpeed * 0.1;
                    mesh.rotation.x += deltaTime * mesh.userData.rotationSpeed * 0.03;
                }
            }

            // Remove despawned elements
            for (const mesh of toRemove) {
                // Surface mode elements are attached to coreMesh, not container
                if (mesh.userData.spawnMode === 'surface' && this.coreMesh) {
                    this.coreMesh.remove(mesh);
                } else {
                    this.container.remove(mesh);
                }
                mesh.geometry.dispose();
                const idx = elements.indexOf(mesh);
                if (idx > -1) elements.splice(idx, 1);
            }
        }
    }

    /**
     * Check if elements are currently spawned
     * @param {string} elementType - 'ice', 'earth', or 'nature'
     * @returns {boolean}
     */
    hasElements(elementType) {
        return this.activeElements[elementType]?.length > 0;
    }

    /**
     * Get material for element type
     * @private
     */
    _getMaterial(elementType) {
        switch (elementType) {
        case 'ice':
            return this.iceMaterial;
        case 'earth':
            return this.earthMaterial;
        case 'nature':
            return this.natureMaterial;
        default:
            return new THREE.MeshStandardMaterial({ color: 0x888888 });
        }
    }

    /**
     * Capitalize first letter
     * @private
     */
    _capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Dispose all resources
     */
    dispose() {
        this.despawnAll();

        // Dispose cached geometries
        for (const geometry of this.geometryCache.values()) {
            geometry?.dispose();
        }
        this.geometryCache.clear();

        // Dispose materials
        this.iceMaterial?.dispose();
        this.earthMaterial?.dispose();
        this.natureMaterial?.dispose();

        // Remove container from parent
        if (this.container.parent) {
            this.container.parent.remove(this.container);
        }
    }
}

export default ElementSpawner;
