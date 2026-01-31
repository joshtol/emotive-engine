/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Element Positioning System
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Shared positioning logic for element spawning
 * @module effects/ElementPositioning
 *
 * Extracted from ElementSpawner.js for reuse across spawning systems.
 * Provides surface sampling, orientation calculation, and position utilities.
 *
 * Key features:
 * - Pattern-aware surface point sampling (crown, shell, scattered, spikes, ring)
 * - Model-specific orientation modes (outward, flat, tangent, rising, falling, velocity)
 * - Embed depth calculation for surface attachment
 * - Camera-facing blend for visibility optimization
 * - Reusable temp object pool to avoid allocations
 */

import * as THREE from 'three';
import { getModelOrientation } from './ElementSizing.js';

// ═══════════════════════════════════════════════════════════════════════════════════════
// REUSABLE TEMP OBJECT POOL - Prevents per-frame/per-element allocations
// ═══════════════════════════════════════════════════════════════════════════════════════
//
// These objects are reused across method calls to avoid creating garbage.
// CRITICAL: Never store references to these objects - they get overwritten!
// ═══════════════════════════════════════════════════════════════════════════════════════

const _tempPool = {
    // Vectors for surface sampling and orientation
    vec3_a: new THREE.Vector3(),
    vec3_b: new THREE.Vector3(),
    vec3_c: new THREE.Vector3(),
    vec3_d: new THREE.Vector3(),
    vec3_e: new THREE.Vector3(),
    vec3_f: new THREE.Vector3(),
    vec3_g: new THREE.Vector3(),
    // Quaternions for orientation
    quat_a: new THREE.Quaternion(),
    quat_b: new THREE.Quaternion(),
    // Matrix for basis calculation
    matrix_a: new THREE.Matrix4(),
    // Camera direction (reused across surface samples)
    cameraDir: new THREE.Vector3(),
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// SURFACE POINT SAMPLING
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Surface spawn configuration options
 * @typedef {Object} SurfaceConfig
 * @property {string} [pattern='scattered'] - Distribution pattern: 'crown', 'shell', 'scattered', 'spikes', 'ring'
 * @property {number} [clustering=0] - Clustering amount (0-1)
 * @property {number} [minDistanceFactor=0.15] - Minimum distance as fraction of mascot radius
 */

/**
 * Surface sample point result
 * @typedef {Object} SurfaceSample
 * @property {THREE.Vector3} position - Surface position
 * @property {THREE.Vector3} normal - Surface normal
 * @property {number} weight - Selection weight
 */

/**
 * Sample surface points with pattern-aware distribution
 *
 * @param {THREE.BufferGeometry} geometry - Mascot geometry
 * @param {number} count - Number of points to sample
 * @param {number} mascotRadius - Mascot bounding radius (for min distance calculation)
 * @param {SurfaceConfig} [config] - Surface spawn configuration
 * @param {THREE.Camera} [camera] - Camera for facing calculations
 * @param {THREE.Vector3} [meshScale] - Mesh scale to apply to sampled positions
 * @returns {SurfaceSample[]} Array of surface samples
 */
export function sampleSurfacePoints(geometry, count, mascotRadius, config = {}, camera = null, meshScale = null) {
    const {
        pattern = 'scattered',
        clustering = 0,
        minDistanceFactor = 0.15  // Minimum distance as fraction of mascot radius
    } = config;

    // Calculate minimum distance between elements
    // Default: 15% of mascot radius, ensuring elements don't overlap
    const minDistance = mascotRadius * minDistanceFactor;

    const positions = geometry.attributes.position;
    const normals = geometry.attributes.normal;
    const vertexCount = positions.count;

    // Build weighted vertex list based on pattern and camera
    // Use temp pool vectors for calculations, only clone when storing in candidates
    const candidates = [];
    const cameraDir = _tempPool.cameraDir;
    if (camera) {
        cameraDir.set(0, 0, -1).applyQuaternion(camera.quaternion);
    } else {
        cameraDir.set(0, 0, 1);
    }

    // Reusable temp vectors for loop - NEVER store references to these
    const tempPos = _tempPool.vec3_a;
    const tempNormal = _tempPool.vec3_b;
    const tempRadial = _tempPool.vec3_c;

    for (let i = 0; i < vertexCount; i++) {
        tempPos.set(
            positions.getX(i),
            positions.getY(i),
            positions.getZ(i)
        );

        if (normals) {
            tempNormal.set(
                normals.getX(i),
                normals.getY(i),
                normals.getZ(i)
            ).normalize();
        } else {
            tempNormal.set(0, 1, 0);
        }

        // Calculate weight based on pattern
        let weight = 1.0;

        switch (pattern) {
        case 'crown':
            // Favor top of mascot (high Y, facing upward)
            weight = Math.max(0, tempPos.y) * 2 + Math.max(0, tempNormal.y) * 0.5;
            break;

        case 'shell':
            // Even distribution, slight camera bias for visibility
            weight = 0.5 + Math.max(0, tempNormal.dot(cameraDir)) * 0.5;
            break;

        case 'scattered':
            // Random with camera visibility weighting
            weight = 0.3 + Math.max(0, tempNormal.dot(cameraDir)) * 0.7;
            break;

        case 'spikes': {
            // Favor outward-facing normals (edges, protrusions)
            tempRadial.copy(tempPos).normalize();
            weight = Math.max(0, tempNormal.dot(tempRadial)) * 1.5;
            break;
        }

        case 'ring': {
            // Horizontal ring around center
            const horizontalness = 1 - Math.abs(tempNormal.y);
            const atCenter = 1 - Math.abs(tempPos.y) * 2;
            weight = horizontalness * 0.5 + Math.max(0, atCenter) * 0.5;
            break;
        }

        default:
            weight = 1.0;
        }

        // Apply camera-facing boost for all patterns
        const cameraDot = tempNormal.dot(cameraDir);
        if (cameraDot > 0) {
            weight *= 1 + cameraDot * 0.3;
        }

        // Only clone when storing - these are the positions/normals we need to keep
        if (weight > 0.01) {
            candidates.push({
                position: tempPos.clone(),
                normal: tempNormal.clone(),
                weight,
                index: i
            });
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
            // Clone and optionally scale the position
            const scaledPosition = selected.position.clone();
            if (meshScale) {
                scaledPosition.multiply(meshScale);
            }
            samples.push({
                position: scaledPosition,
                normal: selected.normal.clone(),
                weight: selected.weight
            });
        }
    }

    return samples;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ELEMENT ORIENTATION
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Calculate orientation quaternion for an element based on model type and surface normal
 *
 * Supports orientation modes:
 * - 'outward': Element points away from surface (crystals, flowers, mushrooms)
 * - 'flat': Element lies parallel to surface (moss, fallen petals)
 * - 'tangent': Element trails along surface (vines, roots)
 * - 'rising': Biases toward world-up (fire, bubbles)
 * - 'falling': Biases toward world-down (droplets)
 * - 'outward-flat': Faces away but lies flat (rifts, portals)
 * - 'velocity': Orients along velocity vector
 *
 * @param {THREE.Vector3} normal - Surface normal
 * @param {string} modelName - Model name for orientation lookup
 * @param {number} [cameraFacing=0] - 0=normal aligned, 1=camera facing
 * @param {THREE.Camera} [camera] - Camera for facing calculations
 * @param {THREE.Vector3} [elementPosition] - Element world position (for camera facing)
 * @param {{x:number, y:number, z:number}} [velocity] - Velocity for velocity-based orientation
 * @returns {THREE.Quaternion} Orientation quaternion (caller must clone if storing)
 */
export function calculateOrientation(normal, modelName, cameraFacing = 0, camera = null, elementPosition = null, velocity = null) {
    // Use temp pool to avoid per-call allocations
    const up = _tempPool.vec3_a.set(0, 1, 0);
    const tangent = _tempPool.vec3_b;
    const bitangent = _tempPool.vec3_c;
    const rotatedTangent = _tempPool.vec3_d;
    const baseQuat = _tempPool.quat_a;
    const tiltQuat = _tempPool.quat_b;

    const orientConfig = modelName ? getModelOrientation(modelName) : { mode: 'outward', tiltAngle: 0.2 };

    // Random angle for variety (used by all modes)
    const randomAngle = Math.random() * Math.PI * 2;

    // Calculate a tangent vector perpendicular to the normal
    // This gives us a direction "along" the surface
    if (Math.abs(normal.y) < 0.999) {
        tangent.crossVectors(up, normal).normalize();
    } else {
        // If normal is nearly vertical, use a different reference
        tangent.set(1, 0, 0).cross(normal).normalize();
    }

    // Calculate bitangent (perpendicular to both normal and tangent)
    bitangent.crossVectors(normal, tangent).normalize();

    // Rotate tangent by random angle around normal for variety
    rotatedTangent.copy(tangent)
        .multiplyScalar(Math.cos(randomAngle))
        .addScaledVector(bitangent, Math.sin(randomAngle));

    baseQuat.identity();

    switch (orientConfig.mode) {
    case 'flat':
        // Element lies parallel to surface
        // Up axis becomes the surface normal, forward is along tangent
        {
            const matrix = _tempPool.matrix_a;
            // X = rotated tangent (forward), Y = normal (up), Z = cross product
            const zAxis = _tempPool.vec3_e.crossVectors(rotatedTangent, normal).normalize();
            matrix.makeBasis(rotatedTangent, normal, zAxis);
            baseQuat.setFromRotationMatrix(matrix);

            // Apply tilt - rotate around tangent axis to lift one edge
            if (orientConfig.tiltAngle !== 0) {
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
            const elementUp = _tempPool.vec3_e.copy(normal)
                .multiplyScalar(tiltAmount)
                .addScaledVector(rotatedTangent, 1 - tiltAmount)
                .normalize();

            baseQuat.setFromUnitVectors(up, elementUp);

            // Apply additional tilt (negative = digs in, positive = lifts)
            if (orientConfig.tiltAngle !== 0) {
                const tiltAxis = _tempPool.vec3_f.crossVectors(rotatedTangent, normal).normalize();
                tiltQuat.setFromAxisAngle(tiltAxis, orientConfig.tiltAngle);
                baseQuat.premultiply(tiltQuat);
            }
        }
        break;

    case 'rising':
    case 'falling': {
        // Fire/bubbles rise toward world-up, water droplets fall toward world-down
        // Blends between surface normal and world direction based on riseFactor
        const riseFactor = orientConfig.riseFactor ?? 0.7;

        // For 'falling', use fallFactor instead if defined
        const effectiveFactor = orientConfig.mode === 'falling'
            ? -(orientConfig.fallFactor ?? 0.7)
            : riseFactor;

        const targetDir = _tempPool.vec3_e;
        if (effectiveFactor >= 0) {
            // Blend from surface normal toward world-up
            targetDir.copy(normal)
                .multiplyScalar(1 - effectiveFactor)
                .add(_tempPool.vec3_f.set(0, effectiveFactor, 0))
                .normalize();
        } else {
            // Blend from surface normal toward world-down
            const fallFactor = Math.abs(effectiveFactor);
            targetDir.copy(normal)
                .multiplyScalar(1 - fallFactor)
                .add(_tempPool.vec3_f.set(0, -fallFactor, 0))
                .normalize();
        }

        baseQuat.setFromUnitVectors(up, targetDir);

        // Apply tilt for variation
        if (orientConfig.tiltAngle !== 0) {
            tiltQuat.setFromAxisAngle(rotatedTangent, orientConfig.tiltAngle);
            baseQuat.premultiply(tiltQuat);
        }

        // Random spin around the target direction
        tiltQuat.setFromAxisAngle(targetDir, randomAngle);
        baseQuat.premultiply(tiltQuat);
        break;
    }

    case 'outward-flat': {
        // Element faces away from surface but lies flat (parallel to surface)
        // Perfect for rifts, portals, spreading cracks
        const forward = _tempPool.vec3_e.copy(normal);  // Element faces this direction

        // Create a basis where forward = normal, up lies in surface plane
        const matrix = _tempPool.matrix_a;

        // Pick an "up" direction that lies in the surface plane
        const elementUp = _tempPool.vec3_f.copy(rotatedTangent);

        // Right vector completes the basis
        const elementRight = _tempPool.vec3_g.crossVectors(elementUp, forward).normalize();

        // Recalculate up to ensure orthogonality
        const finalUp = _tempPool.vec3_f.crossVectors(forward, elementRight).normalize();

        // Build rotation matrix: X=right, Y=up (in surface plane), Z=forward (away from surface)
        matrix.makeBasis(elementRight, finalUp, forward);
        baseQuat.setFromRotationMatrix(matrix);

        // Apply tilt - slight angle off the surface for depth
        if (orientConfig.tiltAngle !== 0) {
            tiltQuat.setFromAxisAngle(elementRight, orientConfig.tiltAngle);
            baseQuat.premultiply(tiltQuat);
        }
        break;
    }

    case 'velocity': {
        // Orient along velocity vector (for falling droplets, moving particles)
        if (velocity && (velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z) > 0.0001) {
            const velDir = _tempPool.vec3_e.set(velocity.x, velocity.y, velocity.z).normalize();
            baseQuat.setFromUnitVectors(up, velDir);
        } else {
            // Fall back to 'falling' mode when stationary or no velocity
            const worldDown = _tempPool.vec3_f.set(0, -1, 0);
            const fallFactor = 0.5;
            const targetDir = _tempPool.vec3_e.copy(normal)
                .multiplyScalar(1 - fallFactor)
                .addScaledVector(worldDown, fallFactor)
                .normalize();
            baseQuat.setFromUnitVectors(up, targetDir);
        }

        // Apply tilt for variation
        if (orientConfig.tiltAngle !== 0) {
            tiltQuat.setFromAxisAngle(rotatedTangent, orientConfig.tiltAngle);
            baseQuat.premultiply(tiltQuat);
        }
        break;
    }

    case 'outward':
    default: {
        // Element points away from surface (default behavior)
        baseQuat.setFromUnitVectors(up, normal);

        // Apply tilt - rotate away from straight-out for more natural look
        if (orientConfig.tiltAngle !== 0) {
            tiltQuat.setFromAxisAngle(rotatedTangent, orientConfig.tiltAngle);
            baseQuat.premultiply(tiltQuat);
        }

        // Random spin around normal (reuse tiltQuat since tilt is done)
        tiltQuat.setFromAxisAngle(normal, randomAngle);
        baseQuat.premultiply(tiltQuat);
        break;
    }
    }

    // Apply camera-facing blend if requested (only for outward mode)
    if (cameraFacing > 0 && camera && elementPosition && orientConfig.mode === 'outward') {
        const cameraPos = _tempPool.cameraDir.copy(camera.position);
        const toCamera = cameraPos.sub(elementPosition).normalize();

        // Reuse tiltQuat for camera quaternion
        tiltQuat.setFromUnitVectors(up, toCamera);

        // Slerp between base orientation and camera facing
        baseQuat.slerp(tiltQuat, cameraFacing);
    }

    return baseQuat;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// POSITION CALCULATION UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Calculate surface position with embed depth
 *
 * @param {THREE.Vector3} surfacePosition - Position on the surface
 * @param {THREE.Vector3} surfaceNormal - Surface normal
 * @param {number} scale - Element scale
 * @param {number} [embedDepth=0.2] - 0=on surface, 1=fully embedded
 * @returns {{position: THREE.Vector3, offset: number}} Position and offset value
 */
export function calculateSurfacePosition(surfacePosition, surfaceNormal, scale, embedDepth = 0.2) {
    // offset = (1 - embedDepth) * scale * 0.5 - embedDepth * scale * 0.3
    // At embedDepth=0: sits on surface with slight outward offset
    // At embedDepth=1: embedded mostly inside
    const outwardOffset = (1 - embedDepth) * scale * 0.4;
    const inwardOffset = embedDepth * scale * 0.3;
    const netOffset = outwardOffset - inwardOffset;

    const position = surfacePosition.clone();
    const offset = surfaceNormal.clone().multiplyScalar(netOffset);
    position.add(offset);

    return { position, offset: netOffset };
}

/**
 * Calculate orbital position around center
 *
 * @param {number} index - Element index
 * @param {number} count - Total element count
 * @param {Object} config - Orbital configuration
 * @param {Object} config.orbitRadius - { min, max } radius range
 * @param {Object} config.heightOffset - { min, max } height range
 * @returns {{position: THREE.Vector3, angle: number, radius: number, height: number}}
 */
export function calculateOrbitalPosition(index, count, config) {
    const angle = (index / count) * Math.PI * 2 + Math.random() * 0.5;
    const radius = config.orbitRadius.min +
        Math.random() * (config.orbitRadius.max - config.orbitRadius.min);
    const height = config.heightOffset.min +
        Math.random() * (config.heightOffset.max - config.heightOffset.min);

    const position = new THREE.Vector3(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
    );

    return { position, angle, radius, height };
}

/**
 * Calculate random rotation for orbital elements
 * @returns {THREE.Euler} Random rotation
 */
export function calculateRandomRotation() {
    return new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
    );
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// INSTANCED MESH HELPERS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Set instance matrix from position, quaternion, and scale
 * Modifies the instancedMesh's instanceMatrix at the given index
 *
 * @param {THREE.InstancedMesh} instancedMesh - The instanced mesh
 * @param {number} index - Instance index
 * @param {THREE.Vector3} position - World position
 * @param {THREE.Quaternion} quaternion - Orientation
 * @param {number} scale - Uniform scale
 */
export function setInstanceTransform(instancedMesh, index, position, quaternion, scale) {
    const matrix = _tempPool.matrix_a;
    matrix.compose(position, quaternion, _tempPool.vec3_a.setScalar(scale));
    instancedMesh.setMatrixAt(index, matrix);
}

/**
 * Create a surface spawn configuration from options
 *
 * @param {string|Object} mode - Mode string or config object
 * @returns {Object|null} Normalized surface configuration or null
 */
export function normalizeSurfaceConfig(mode) {
    if (typeof mode === 'object' && mode !== null) {
        return {
            pattern: mode.pattern || 'shell',
            embedDepth: mode.embedDepth ?? 0.2,
            cameraFacing: mode.cameraFacing ?? 0.3,
            clustering: mode.clustering ?? 0,
            countOverride: mode.count || null,
            scaleMultiplier: mode.scale ?? 1.5,
            minDistanceFactor: mode.minDistance ?? 0.18
        };
    }

    if (mode === 'surface') {
        return {
            pattern: 'shell',
            embedDepth: 0.2,
            cameraFacing: 0.3,
            clustering: 0,
            countOverride: null,
            scaleMultiplier: 1.5,
            minDistanceFactor: 0.18
        };
    }

    return null;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export default {
    sampleSurfacePoints,
    calculateOrientation,
    calculateSurfacePosition,
    calculateOrbitalPosition,
    calculateRandomRotation,
    setInstanceTransform,
    normalizeSurfaceConfig
};
