/**
 * SurfaceMode - Elements spawn on the mascot's surface
 *
 * Elements sampled from mascot geometry surface with configurable:
 * - Pattern (crown, shell, scattered, spikes, ring)
 * - Embed depth (how deep into surface)
 * - Camera facing (billboard vs normal-aligned)
 * - Clustering (tight vs spread)
 *
 * This module provides both:
 * - Static utility functions for use by ElementInstancedSpawner
 * - Class-based API for legacy ElementSpawner compatibility
 *
 * @module spawn-modes/SurfaceMode
 */

import { BaseSpawnMode } from './BaseSpawnMode.js';

// ═══════════════════════════════════════════════════════════════════════════════
// STATIC UTILITY FUNCTIONS - Used by ElementInstancedSpawner
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Parse surface configuration from spawn mode config.
 * Normalizes string shorthand and object configs into consistent format.
 * @param {Object|string} config - Raw spawn mode configuration
 * @returns {Object} Parsed surface configuration
 */
export function parseSurfaceConfig(config) {
    // Handle string shorthand (e.g., mode='surface')
    if (typeof config === 'string') {
        return {
            pattern: 'shell',
            embedDepth: 0.2,
            cameraFacing: 0.3,
            clustering: 0,
            countOverride: null,
            scaleMultiplier: 1.5,
            minDistanceFactor: 0.18,
            ephemeral: null,
            models: [],
        };
    }

    // Handle object config - support both config.surface and direct config
    const surface = config.surface || config;

    return {
        pattern: surface.pattern || 'shell',
        embedDepth: surface.embedDepth ?? 0.2,
        cameraFacing: surface.cameraFacing ?? 0.3,
        clustering: surface.clustering ?? 0,
        countOverride: surface.count || config.count || null,
        scaleMultiplier: surface.scale || config.scale || 1.5,
        minDistanceFactor: surface.minDistance ?? 0.18,
        ephemeral: surface.ephemeral || null,
        models: config.models || [],
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLASS-BASED API - For legacy ElementSpawner compatibility
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Spawn mode for elements on mascot surface
 */
export class SurfaceMode extends BaseSpawnMode {
    static get modeType() {
        return 'surface';
    }

    /**
     * Parse surface configuration
     * @param {Object} config - Raw configuration
     * @returns {Object} Parsed configuration
     */
    parseConfig(config) {
        return {
            pattern: config.pattern || 'shell',
            embedDepth: config.embedDepth ?? 0.2,
            cameraFacing: config.cameraFacing ?? 0.3,
            clustering: config.clustering ?? 0,
            countOverride: config.count || null,
            scaleMultiplier: config.scale ?? 1.5,
            minDistanceFactor: config.minDistance ?? 0.18,
            ephemeral: config.ephemeral || null
        };
    }

    /**
     * Sample surface points from mascot geometry
     * Delegates to ElementSpawner._sampleSurfacePoints
     * @param {number} count - Number of points to sample
     * @param {Object} config - Parsed configuration
     * @param {THREE.Camera} camera - Camera for facing calculations
     * @returns {Array} Array of surface sample objects
     */
    sampleSurfacePoints(count, config, camera) {
        const coreMesh = this.spawner?.coreMesh;
        if (!coreMesh?.geometry) return null;

        // Delegate to spawner's surface sampling method
        if (this.spawner?._sampleSurfacePoints) {
            return this.spawner._sampleSurfacePoints(
                coreMesh.geometry,
                count,
                config,
                camera
            );
        }

        return null;
    }

    /**
     * Position an element on the surface
     * @param {THREE.Mesh} mesh - The mesh to position
     * @param {Object} config - Parsed configuration
     * @param {number} index - Element index
     * @param {Object} surfaceSample - Surface sample with position and normal
     * @param {THREE.Camera} camera - Camera for orientation
     * @param {string} modelName - Model name for orientation lookup
     */
    positionElement(mesh, config, index, surfaceSample = null, camera = null, modelName = null) {
        if (!surfaceSample) {
            console.warn('[SurfaceMode] No surface sample provided');
            return;
        }

        const scale = mesh.userData.finalScale || mesh.scale.x;

        // Store surface normal for physics drift
        mesh.userData.surfaceNormal = {
            x: surfaceSample.normal.x,
            y: surfaceSample.normal.y,
            z: surfaceSample.normal.z
        };

        // Calculate embed depth offset
        const embedDepth = config.embedDepth ?? 0.2;
        const outwardOffset = (1 - embedDepth) * scale * 0.4;
        const inwardOffset = embedDepth * scale * 0.3;
        const netOffset = outwardOffset - inwardOffset;

        const offset = surfaceSample.normal.clone().multiplyScalar(netOffset);
        mesh.position.copy(surfaceSample.position).add(offset);

        // Orient element using spawner's method
        const cameraFacing = config.cameraFacing ?? 0.3;
        if (this.spawner?._orientElement) {
            this.spawner._orientElement(mesh, surfaceSample.normal, cameraFacing, camera, modelName);
        }

        // Store surface data for animation
        mesh.userData.surfaceNormal = surfaceSample.normal.clone();
        mesh.userData.surfacePosition = surfaceSample.position.clone();
        mesh.userData.embedDepth = embedDepth;
        mesh.userData.growthOffset = 0;
        mesh.userData.targetGrowthOffset = netOffset;

        // Mark spawn mode
        mesh.userData.spawnModeType = 'surface';
        mesh.userData.spawnMode = 'surface';
        mesh.userData.requiresSpawnModeUpdate = false; // Surface mode is static
    }

    /**
     * Update element - surface mode elements are static
     * @param {THREE.Mesh} mesh - The mesh to update
     * @param {number} deltaTime - Time since last frame
     * @param {number} gestureProgress - Current gesture progress (0-1)
     */
    updateElement(mesh, deltaTime, gestureProgress) {
        // Surface mode elements are static - no animation
        // All animation handled by the animation system (AnimationState)
    }

    /**
     * Surface mode doesn't require spawn mode updates (static positioning)
     * Animation is handled by AnimationState system
     * @returns {boolean} Always false
     */
    requiresUpdate() {
        return false;
    }
}

export default SurfaceMode;
