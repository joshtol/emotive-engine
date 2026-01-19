# Shatter System Implementation Plan

## Overview

A runtime geometry fracturing system that automatically generates shards from any mesh, enabling dramatic "shatter" effects for storytelling. The system must work with any geometry at scale (hundreds of millions of models) without manual shard creation.

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SHATTER SYSTEM ARCHITECTURE                        │
└─────────────────────────────────────────────────────────────────────────────┘

  Gesture Trigger (shatter/oofExtreme)
           │
           ▼
  ┌─────────────────┐
  │  GestureBlender │  New shatter channel: { enabled, impactPoint, intensity }
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │ Core3DManager   │  Transforms impactPoint, manages shatter state machine
  └────────┬────────┘
           │
           ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │                      ShatterSystem                               │
  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐   │
  │  │ ShardGenerator│  │   ShardPool   │  │  ShardAnimator    │   │
  │  │ (Voronoi/     │  │ (Pre-alloc    │  │  (Physics,        │   │
  │  │  Triangle)    │  │  mesh pool)   │  │   trajectories)   │   │
  │  └───────────────┘  └───────────────┘  └───────────────────┘   │
  └─────────────────────────────────────────────────────────────────┘
           │
           ▼
  ┌─────────────────┐
  │  ThreeRenderer  │  Manages mesh visibility, renders shards
  └─────────────────┘
```

---

## Component Design

### 1. ShardGenerator (`src/3d/effects/shatter/ShardGenerator.js`)

**Purpose:** Generate shard geometries from any input BufferGeometry.

**Algorithm Options:**

| Method | Pros | Cons | Use Case |
|--------|------|------|----------|
| **Triangle-based** | Fast, simple, preserves mesh topology | Less natural looking | V1 prototype |
| **Voronoi 3D** | Natural fracture patterns | Complex, slower | V2 production |
| **Hybrid** | Voronoi for surface, triangles for depth | Balance of quality/speed | V3 optimal |

**V1 Implementation (Triangle-based):**

```javascript
class ShardGenerator {
    /**
     * Generate shards from a BufferGeometry
     * @param {THREE.BufferGeometry} geometry - Source geometry
     * @param {Object} options - Generation options
     * @returns {ShardData[]} Array of shard definitions
     */
    static generate(geometry, options = {}) {
        const {
            shardCount = 30,          // Target number of shards
            minShardSize = 0.05,      // Minimum shard scale (prevents dust)
            seed = Date.now(),        // Random seed for reproducibility
            preserveUVs = true        // Keep texture coordinates
        } = options;

        // 1. Extract vertices and faces from BufferGeometry
        const positions = geometry.getAttribute('position');
        const indices = geometry.getIndex();
        const uvs = geometry.getAttribute('uv');
        const normals = geometry.getAttribute('normal');

        // 2. Build face adjacency graph
        const adjacency = this._buildAdjacencyGraph(positions, indices);

        // 3. Cluster faces into shards using flood-fill with random seeds
        const clusters = this._clusterFaces(adjacency, shardCount, seed);

        // 4. Generate BufferGeometry for each cluster
        const shards = clusters.map((cluster, i) => {
            return this._createShardGeometry(cluster, positions, indices, uvs, normals);
        });

        return shards;
    }

    /**
     * Build adjacency graph from indexed geometry
     * Two faces are adjacent if they share an edge
     */
    static _buildAdjacencyGraph(positions, indices) {
        const faceCount = indices.count / 3;
        const adjacency = new Map(); // faceIndex -> Set<adjacentFaceIndices>
        const edgeToFaces = new Map(); // "v1,v2" -> [faceIndices]

        for (let f = 0; f < faceCount; f++) {
            const i0 = indices.getX(f * 3);
            const i1 = indices.getX(f * 3 + 1);
            const i2 = indices.getX(f * 3 + 2);

            // Register edges (sorted to ensure consistent keys)
            const edges = [
                [Math.min(i0, i1), Math.max(i0, i1)],
                [Math.min(i1, i2), Math.max(i1, i2)],
                [Math.min(i2, i0), Math.max(i2, i0)]
            ];

            edges.forEach(([a, b]) => {
                const key = `${a},${b}`;
                if (!edgeToFaces.has(key)) edgeToFaces.set(key, []);
                edgeToFaces.get(key).push(f);
            });

            adjacency.set(f, new Set());
        }

        // Build adjacency from shared edges
        for (const faces of edgeToFaces.values()) {
            if (faces.length === 2) {
                adjacency.get(faces[0]).add(faces[1]);
                adjacency.get(faces[1]).add(faces[0]);
            }
        }

        return adjacency;
    }

    /**
     * Cluster faces into N groups using seeded flood-fill
     */
    static _clusterFaces(adjacency, targetCount, seed) {
        const rng = this._seededRandom(seed);
        const faceCount = adjacency.size;
        const assigned = new Array(faceCount).fill(-1);
        const clusters = [];

        // Pick random seed faces
        const seedFaces = [];
        const available = [...Array(faceCount).keys()];
        for (let i = 0; i < Math.min(targetCount, faceCount); i++) {
            const idx = Math.floor(rng() * available.length);
            seedFaces.push(available.splice(idx, 1)[0]);
        }

        // Initialize clusters with seed faces
        seedFaces.forEach((face, clusterIdx) => {
            clusters.push([face]);
            assigned[face] = clusterIdx;
        });

        // Grow clusters simultaneously (BFS from all seeds)
        let changed = true;
        while (changed) {
            changed = false;
            for (let c = 0; c < clusters.length; c++) {
                const frontier = clusters[c].filter(f => {
                    for (const neighbor of adjacency.get(f)) {
                        if (assigned[neighbor] === -1) return true;
                    }
                    return false;
                });

                for (const f of frontier) {
                    for (const neighbor of adjacency.get(f)) {
                        if (assigned[neighbor] === -1) {
                            assigned[neighbor] = c;
                            clusters[c].push(neighbor);
                            changed = true;
                        }
                    }
                }
            }
        }

        // Assign any remaining faces to nearest cluster
        for (let f = 0; f < faceCount; f++) {
            if (assigned[f] === -1) {
                clusters[0].push(f); // Fallback to first cluster
            }
        }

        return clusters;
    }

    /**
     * Create BufferGeometry for a single shard
     */
    static _createShardGeometry(faceIndices, positions, indices, uvs, normals) {
        const vertices = [];
        const shardUvs = [];
        const shardNormals = [];
        const shardIndices = [];
        const vertexMap = new Map(); // old index -> new index

        for (const f of faceIndices) {
            const triIndices = [
                indices.getX(f * 3),
                indices.getX(f * 3 + 1),
                indices.getX(f * 3 + 2)
            ];

            const newTriIndices = triIndices.map(oldIdx => {
                if (!vertexMap.has(oldIdx)) {
                    const newIdx = vertices.length / 3;
                    vertexMap.set(oldIdx, newIdx);

                    // Copy position
                    vertices.push(
                        positions.getX(oldIdx),
                        positions.getY(oldIdx),
                        positions.getZ(oldIdx)
                    );

                    // Copy UV if present
                    if (uvs) {
                        shardUvs.push(uvs.getX(oldIdx), uvs.getY(oldIdx));
                    }

                    // Copy normal if present
                    if (normals) {
                        shardNormals.push(
                            normals.getX(oldIdx),
                            normals.getY(oldIdx),
                            normals.getZ(oldIdx)
                        );
                    }
                }
                return vertexMap.get(oldIdx);
            });

            shardIndices.push(...newTriIndices);
        }

        // Build BufferGeometry
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        if (shardUvs.length) {
            geometry.setAttribute('uv', new THREE.Float32BufferAttribute(shardUvs, 2));
        }
        if (shardNormals.length) {
            geometry.setAttribute('normal', new THREE.Float32BufferAttribute(shardNormals, 3));
        } else {
            geometry.computeVertexNormals();
        }
        geometry.setIndex(shardIndices);

        // Compute centroid for physics origin
        geometry.computeBoundingBox();
        const center = new THREE.Vector3();
        geometry.boundingBox.getCenter(center);
        geometry.userData.centroid = center.clone();

        return geometry;
    }

    static _seededRandom(seed) {
        let s = seed;
        return () => {
            s = (s * 1103515245 + 12345) & 0x7fffffff;
            return s / 0x7fffffff;
        };
    }
}
```

---

### 2. ShardPool (`src/3d/effects/shatter/ShardPool.js`)

**Purpose:** Pre-allocate and reuse shard meshes to avoid GC during shatter.

```javascript
class ShardPool {
    constructor(options = {}) {
        const {
            maxShards = 100,
            scene = null
        } = options;

        this.maxShards = maxShards;
        this.scene = scene;
        this.pool = [];           // Available shards
        this.active = [];         // Currently animating shards
        this.shardMaterial = null; // Shared material

        this._initPool();
    }

    _initPool() {
        // Create placeholder geometry (will be swapped per-shard)
        const placeholder = new THREE.BufferGeometry();
        placeholder.setAttribute('position', new THREE.Float32BufferAttribute([0,0,0], 3));

        // Shared material (cloned from crystal material)
        this.shardMaterial = this._createShardMaterial();

        for (let i = 0; i < this.maxShards; i++) {
            const mesh = new THREE.Mesh(placeholder, this.shardMaterial.clone());
            mesh.visible = false;
            mesh.userData.poolIndex = i;
            mesh.userData.state = {
                velocity: new THREE.Vector3(),
                angularVelocity: new THREE.Vector3(),
                lifetime: 0,
                maxLifetime: 2000,
                opacity: 1
            };
            this.pool.push(mesh);

            if (this.scene) {
                this.scene.add(mesh);
            }
        }
    }

    _createShardMaterial() {
        // Simplified crystal material for shards
        // Could import from MaterialFactory or create minimal version
        return new THREE.MeshStandardMaterial({
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide,
            metalness: 0.1,
            roughness: 0.3
        });
    }

    /**
     * Activate shards for a shatter event
     * @param {THREE.BufferGeometry[]} shardGeometries - Pre-generated shard geometries
     * @param {THREE.Vector3} impactPoint - World-space impact location
     * @param {THREE.Vector3} impactDirection - Direction of impact force
     * @param {Object} config - Animation config
     */
    activate(shardGeometries, impactPoint, impactDirection, config = {}) {
        const {
            explosionForce = 2.0,
            rotationForce = 5.0,
            lifetime = 2000,
            gravity = -9.8,
            inheritVelocity = new THREE.Vector3()
        } = config;

        const shardsNeeded = Math.min(shardGeometries.length, this.pool.length);

        for (let i = 0; i < shardsNeeded; i++) {
            if (this.pool.length === 0) break;

            const shard = this.pool.pop();
            const shardGeo = shardGeometries[i];

            // Swap geometry
            shard.geometry.dispose();
            shard.geometry = shardGeo;

            // Position at centroid
            const centroid = shardGeo.userData.centroid || new THREE.Vector3();
            shard.position.copy(centroid);

            // Calculate ejection velocity
            const ejectionDir = centroid.clone().sub(impactPoint).normalize();
            const distFromImpact = centroid.distanceTo(impactPoint);
            const force = explosionForce * (1 / (1 + distFromImpact));

            shard.userData.state.velocity
                .copy(ejectionDir)
                .multiplyScalar(force)
                .add(inheritVelocity);

            // Random rotation
            shard.userData.state.angularVelocity.set(
                (Math.random() - 0.5) * rotationForce,
                (Math.random() - 0.5) * rotationForce,
                (Math.random() - 0.5) * rotationForce
            );

            // Reset lifetime
            shard.userData.state.lifetime = 0;
            shard.userData.state.maxLifetime = lifetime;
            shard.userData.state.opacity = 1;
            shard.userData.state.gravity = gravity;

            // Show shard
            shard.visible = true;
            shard.material.opacity = 1;

            this.active.push(shard);
        }

        return shardsNeeded;
    }

    /**
     * Update all active shards
     * @param {number} deltaTime - Time since last frame (ms)
     */
    update(deltaTime) {
        const dt = deltaTime / 1000; // Convert to seconds

        for (let i = this.active.length - 1; i >= 0; i--) {
            const shard = this.active[i];
            const state = shard.userData.state;

            // Update lifetime
            state.lifetime += deltaTime;
            const progress = state.lifetime / state.maxLifetime;

            if (progress >= 1) {
                // Return to pool
                shard.visible = false;
                this.active.splice(i, 1);
                this.pool.push(shard);
                continue;
            }

            // Apply gravity
            state.velocity.y += state.gravity * dt;

            // Update position
            shard.position.addScaledVector(state.velocity, dt);

            // Update rotation
            shard.rotation.x += state.angularVelocity.x * dt;
            shard.rotation.y += state.angularVelocity.y * dt;
            shard.rotation.z += state.angularVelocity.z * dt;

            // Fade out in last 30%
            if (progress > 0.7) {
                state.opacity = 1 - ((progress - 0.7) / 0.3);
                shard.material.opacity = state.opacity;
            }
        }
    }

    /**
     * Immediately deactivate all shards
     */
    clear() {
        for (const shard of this.active) {
            shard.visible = false;
            this.pool.push(shard);
        }
        this.active = [];
    }

    /**
     * Clean up resources
     */
    dispose() {
        this.clear();
        for (const shard of this.pool) {
            if (this.scene) this.scene.remove(shard);
            shard.geometry.dispose();
            shard.material.dispose();
        }
        this.pool = [];
    }

    /**
     * Update shared material properties (e.g., emotion color)
     */
    updateMaterial(uniforms) {
        // Apply to all shard materials
        [...this.pool, ...this.active].forEach(shard => {
            if (uniforms.color) shard.material.color.copy(uniforms.color);
            if (uniforms.emissive) shard.material.emissive.copy(uniforms.emissive);
        });
    }
}
```

---

### 3. ShatterSystem (`src/3d/effects/shatter/ShatterSystem.js`)

**Purpose:** Orchestrate the complete shatter lifecycle.

```javascript
import * as THREE from 'three';
import { ShardGenerator } from './ShardGenerator.js';
import { ShardPool } from './ShardPool.js';

/**
 * States for the shatter state machine
 */
const ShatterState = {
    IDLE: 'idle',
    GENERATING: 'generating',
    SHATTERING: 'shattering',
    REASSEMBLING: 'reassembling'
};

class ShatterSystem {
    constructor(options = {}) {
        const {
            scene = null,
            maxShards = 50,
            shardLifetime = 2000,
            enableReassembly = true
        } = options;

        this.scene = scene;
        this.maxShards = maxShards;
        this.shardLifetime = shardLifetime;
        this.enableReassembly = enableReassembly;

        // State machine
        this.state = ShatterState.IDLE;

        // Shard management
        this.shardPool = new ShardPool({ maxShards, scene });
        this.geometryCache = new Map(); // geometryId -> ShardData[]

        // References
        this.targetMesh = null;
        this.innerMesh = null;

        // Callbacks
        this.onShatterStart = null;
        this.onShatterComplete = null;
        this.onReassemblyComplete = null;
    }

    /**
     * Prepare shards for a geometry (can be called ahead of time)
     * @param {THREE.BufferGeometry} geometry - Source geometry
     * @param {string} geometryId - Unique identifier for caching
     */
    prepareGeometry(geometry, geometryId) {
        if (this.geometryCache.has(geometryId)) {
            return Promise.resolve(this.geometryCache.get(geometryId));
        }

        return new Promise((resolve) => {
            // Run generation (could be in Web Worker for heavy meshes)
            const shards = ShardGenerator.generate(geometry, {
                shardCount: this.maxShards,
                seed: geometryId.hashCode?.() || Date.now()
            });

            this.geometryCache.set(geometryId, shards);
            resolve(shards);
        });
    }

    /**
     * Trigger a shatter effect
     * @param {THREE.Mesh} mesh - The mesh to shatter
     * @param {Object} config - Shatter configuration
     */
    async shatter(mesh, config = {}) {
        if (this.state !== ShatterState.IDLE) {
            console.warn('ShatterSystem: Already shattering');
            return false;
        }

        const {
            impactPoint = new THREE.Vector3(0, 0, 0.4),  // Camera-relative default
            impactDirection = new THREE.Vector3(0, 0, -1),
            intensity = 1.0,
            geometryId = mesh.geometry.uuid,
            revealInner = true,       // Show soul when shell shatters
            inheritMeshVelocity = null
        } = config;

        this.state = ShatterState.GENERATING;
        this.targetMesh = mesh;

        // Get or generate shards
        let shards = this.geometryCache.get(geometryId);
        if (!shards) {
            shards = await this.prepareGeometry(mesh.geometry, geometryId);
        }

        // Transform impact point from mesh-local to world space
        const worldImpact = impactPoint.clone();
        mesh.localToWorld(worldImpact);

        // Position shards relative to mesh
        const transformedShards = shards.map(shardGeo => {
            const clone = shardGeo.clone();
            // Apply mesh's world transform to shard centroid
            if (clone.userData.centroid) {
                const worldCentroid = clone.userData.centroid.clone();
                mesh.localToWorld(worldCentroid);
                clone.userData.centroid = worldCentroid;
            }
            return clone;
        });

        // Hide original mesh
        mesh.visible = false;

        // Reveal inner mesh (soul) if present
        if (revealInner && this.innerMesh) {
            this.innerMesh.visible = true;
            // Could animate soul brightness here
        }

        // Activate shards
        this.state = ShatterState.SHATTERING;
        this.shardPool.activate(transformedShards, worldImpact, impactDirection, {
            explosionForce: 2.0 * intensity,
            rotationForce: 5.0 * intensity,
            lifetime: this.shardLifetime,
            gravity: -9.8,
            inheritVelocity: inheritMeshVelocity || new THREE.Vector3()
        });

        // Copy material properties to shards
        if (mesh.material.uniforms?.emotionColor) {
            this.shardPool.updateMaterial({
                color: mesh.material.uniforms.emotionColor.value,
                emissive: mesh.material.uniforms.emotionColor.value
            });
        }

        // Callback
        this.onShatterStart?.(mesh);

        return true;
    }

    /**
     * Trigger reassembly (reverse shatter)
     */
    reassemble() {
        if (this.state !== ShatterState.SHATTERING || !this.enableReassembly) {
            return false;
        }

        this.state = ShatterState.REASSEMBLING;

        // TODO: Implement reverse animation
        // - Lerp shard positions back to original
        // - Lerp rotations to identity
        // - When complete, hide shards and show mesh

        return true;
    }

    /**
     * Update loop - call every frame
     * @param {number} deltaTime - Time since last frame (ms)
     */
    update(deltaTime) {
        if (this.state === ShatterState.SHATTERING) {
            this.shardPool.update(deltaTime);

            // Check if all shards finished
            if (this.shardPool.active.length === 0) {
                this.state = ShatterState.IDLE;
                this.onShatterComplete?.(this.targetMesh);

                // Optionally restore mesh visibility
                if (this.enableReassembly && this.targetMesh) {
                    this.targetMesh.visible = true;
                    if (this.innerMesh) {
                        this.innerMesh.visible = false;
                    }
                }
            }
        }

        if (this.state === ShatterState.REASSEMBLING) {
            // TODO: Update reassembly animation
        }
    }

    /**
     * Set references to target meshes
     */
    setTargets(coreMesh, innerMesh = null) {
        this.targetMesh = coreMesh;
        this.innerMesh = innerMesh;
    }

    /**
     * Clean up
     */
    dispose() {
        this.shardPool.dispose();
        this.geometryCache.clear();
        this.targetMesh = null;
        this.innerMesh = null;
    }
}

export { ShatterSystem, ShatterState };
```

---

### 4. Gesture Integration (`src/core/gestures/transforms/shatterFactory.js`)

**Purpose:** Define shatter gestures that trigger the system.

```javascript
/**
 * Factory for shatter gestures
 */
export function createShatterGesture(variant = 'default') {
    const variants = {
        default: {
            name: 'shatter',
            emoji: '💥',
            description: 'Dramatic shattering effect',
            duration: 2500
        },
        explosive: {
            name: 'shatterExplosive',
            emoji: '🔥',
            description: 'Explosive outward shatter',
            duration: 2000
        },
        crumble: {
            name: 'shatterCrumble',
            emoji: '🪨',
            description: 'Slow crumbling collapse',
            duration: 4000
        }
    };

    const config = variants[variant] || variants.default;

    return {
        name: config.name,
        emoji: config.emoji,
        type: 'override',
        description: config.description,

        config: {
            duration: config.duration,
            musicalDuration: { musical: true, beats: 4 },
            intensity: 1.0,
            variant
        },

        rhythm: {
            enabled: true,
            syncMode: 'beat',
            durationSync: { mode: 'beats', beats: 4 }
        },

        '3d': {
            evaluate(progress, motion) {
                const cfg = motion.config || this.config || {};
                const intensity = cfg.intensity || 1.0;
                const variant = cfg.variant || 'default';

                // Phase 1: Build-up (0-10%)
                // Phase 2: Shatter trigger (10%)
                // Phase 3: Aftermath (10-100%)

                let shatterTrigger = false;
                let glowIntensity = 1.0;
                let scale = 1.0;

                if (progress < 0.1) {
                    // Build-up: increase glow, slight scale
                    const t = progress / 0.1;
                    glowIntensity = 1.0 + t * 0.5;
                    scale = 1.0 + t * 0.05;
                } else if (progress < 0.12) {
                    // Trigger point
                    shatterTrigger = progress >= 0.1 && progress < 0.11;
                    glowIntensity = 1.5;
                    scale = 1.05;
                } else {
                    // Aftermath: glow fades
                    const t = (progress - 0.12) / 0.88;
                    glowIntensity = 1.5 - t * 0.5;
                    scale = 1.0;
                }

                // Explosion direction based on variant
                let impactPoint = [0, 0, 0.4]; // Center-front
                if (variant === 'explosive') {
                    impactPoint = [0, 0, 0]; // Center
                } else if (variant === 'crumble') {
                    impactPoint = [0, -0.4, 0]; // Bottom (gravity-based)
                }

                return {
                    scale,
                    glowIntensity,

                    // Shatter channel
                    shatter: {
                        enabled: shatterTrigger,
                        impactPoint,
                        intensity: intensity * (variant === 'explosive' ? 1.5 : 1.0),
                        variant
                    }
                };
            }
        }
    };
}

export default createShatterGesture;
```

---

### 5. Integration Points

#### GestureBlender.js Changes

Add shatter channel to accumulated state:

```javascript
// In blend() method, add to accumulated initialization:
accumulated = {
    // ... existing channels ...

    // SHATTER channel - geometry fragmentation
    shatter: null  // {enabled, impactPoint, intensity, variant}
};

// In gesture output processing:
if (output.shatter && output.shatter.enabled) {
    // Shatter is one-shot, don't blend
    accumulated.shatter = { ...output.shatter };
}

// In return object:
return {
    // ... existing returns ...
    shatter: accumulated.shatter
};
```

#### Core3DManager.js Changes

Handle shatter channel:

```javascript
// After deformation handling, add:
if (blended.shatter && blended.shatter.enabled) {
    // Transform impact point (same as deformation)
    const ip = blended.shatter.impactPoint;
    // ... same camera-relative to mesh-local transform ...

    this._pendingShatter = {
        ...blended.shatter,
        impactPoint: [transformedX, transformedY, transformedZ]
    };
}

// In update loop:
if (this._pendingShatter && this.shatterSystem) {
    const impactVec = new THREE.Vector3(...this._pendingShatter.impactPoint);
    this.shatterSystem.shatter(this.renderer.coreMesh, {
        impactPoint: impactVec,
        intensity: this._pendingShatter.intensity,
        revealInner: true
    });
    this._pendingShatter = null;
}
```

#### ThreeRenderer.js Changes

Initialize and update ShatterSystem:

```javascript
// In constructor or init:
this.shatterSystem = new ShatterSystem({
    scene: this.scene,
    maxShards: 50,
    shardLifetime: 2000
});

// After creating coreMesh:
this.shatterSystem.setTargets(this.coreMesh, this.innerCore);

// In render loop:
if (this.shatterSystem) {
    this.shatterSystem.update(deltaTime);
}

// In dispose:
this.shatterSystem?.dispose();
```

---

## Performance Considerations

### Mobile Optimization

```javascript
// In ShatterSystem constructor:
const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
this.maxShards = isMobile ? 20 : 50;
this.shardLifetime = isMobile ? 1500 : 2000;
```

### Web Worker for Heavy Meshes

```javascript
// ShardGeneratorWorker.js
self.onmessage = (e) => {
    const { positions, indices, shardCount, seed } = e.data;
    const shards = ShardGenerator.generate(/* ... */);

    // Transfer buffers back (zero-copy)
    const transferable = shards.map(s => s.attributes.position.array.buffer);
    self.postMessage({ shards }, transferable);
};
```

### Geometry Hashing for Cache

```javascript
// Hash geometry to detect duplicates across different mesh instances
function hashGeometry(geometry) {
    const positions = geometry.getAttribute('position');
    let hash = 0;
    for (let i = 0; i < Math.min(positions.count, 100); i++) {
        hash ^= (positions.getX(i) * 1000) | 0;
        hash ^= (positions.getY(i) * 1000) | 0;
        hash ^= (positions.getZ(i) * 1000) | 0;
    }
    return `geo_${positions.count}_${hash}`;
}
```

---

## Implementation Phases

### Phase 1: Core System (MVP)
- [ ] ShardGenerator with triangle-based clustering
- [ ] ShardPool with basic physics
- [ ] ShatterSystem orchestration
- [ ] Basic shatter gesture
- [ ] Integration with GestureBlender and Core3DManager

### Phase 2: Visual Polish
- [ ] Shard materials inherit crystal shader properties
- [ ] Impact glow on shatter trigger
- [ ] Particle effects at ejection points
- [ ] Soul reveal animation

### Phase 3: Advanced Features
- [ ] Reassembly animation
- [ ] Voronoi-based fracturing
- [ ] Directional shatters (from impact direction)
- [ ] Chained shatters (multiple meshes)

### Phase 4: Scale Optimization
- [ ] Web Worker shard generation
- [ ] Geometry hashing and deduplication
- [ ] LOD for distant shards
- [ ] Instanced rendering

---

## File Structure

```
src/3d/effects/shatter/
├── index.js              # Exports
├── ShatterSystem.js      # Main orchestrator
├── ShardGenerator.js     # Geometry fracturing
├── ShardPool.js          # Mesh pooling
└── ShardMaterial.js      # Shard-specific material (optional)

src/core/gestures/transforms/
└── shatterFactory.js     # Gesture definitions

docs/
└── SHATTER_SYSTEM_PLAN.md  # This document
```

---

## Testing Strategy

1. **Unit Tests**
   - ShardGenerator produces valid BufferGeometry
   - ShardPool correctly recycles meshes
   - State machine transitions are correct

2. **Visual Tests**
   - Shatter on crystal geometry
   - Shatter on heart geometry (thin areas)
   - Shatter with soul reveal
   - Mobile performance check

3. **Integration Tests**
   - Gesture triggers shatter correctly
   - Shatter during morph transition
   - Multiple rapid shatters

---

## Open Questions

1. **Sound Integration**: Should shatter trigger audio events?
2. **Collision Detection**: Should shards collide with each other or floor?
3. **Persistence**: Should shattered state persist across page refresh?
4. **Multi-mesh**: How to handle shattering when multiple meshes are visible?
