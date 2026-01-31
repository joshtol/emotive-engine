/**
 * AnchorMode - Elements anchored at landmark positions
 *
 * Enables effects like:
 * - Halos hovering above the head
 * - Crown effects at the top
 * - Ground indicators at the feet
 *
 * @module spawn-modes/AnchorMode
 */

import { BaseSpawnMode } from './BaseSpawnMode.js';

/**
 * Spawn mode for elements anchored at landmark positions
 */
export class AnchorMode extends BaseSpawnMode {
    static get modeType() {
        return 'anchor';
    }

    /**
     * Parse anchor configuration
     * @param {Object} config - Raw configuration
     * @returns {Object} Parsed configuration with resolved landmarks
     */
    parseConfig(config) {
        const anchor = config.anchor || {};

        return {
            // Anchor settings
            landmark: anchor.landmark || 'head',
            landmarkY: this.spatialRef.resolveLandmark(anchor.landmark || 'head'),
            offset: {
                x: anchor.offset?.x || 0,
                y: anchor.offset?.y || 0,
                z: anchor.offset?.z || 0,
            },
            orientation: anchor.orientation || 'flat',
            bob: anchor.bob ? {
                amplitude: anchor.bob.amplitude || 0.02,
                frequency: anchor.bob.frequency || 0.5,
            } : null,

            // Pass through other spawn options
            count: config.count || 1,
            models: config.models || [],
            scale: config.scale ?? 1.0,
        };
    }

    /**
     * Position an element at anchor location
     * @param {THREE.Mesh} mesh - The mesh to position
     * @param {Object} config - Parsed configuration
     * @param {number} index - Element index
     */
    positionElement(mesh, config, index) {
        // Calculate final position
        const x = config.offset.x;
        const y = config.landmarkY + config.offset.y;
        const z = config.offset.z;

        mesh.position.set(x, y, z);

        // Apply orientation
        this._applyOrientation(mesh, config.orientation);

        // Store anchor data on mesh for update loop
        mesh.userData.anchor = {
            baseY: y,
            orientation: config.orientation,
            bob: config.bob,
        };

        // Mark spawn mode type
        mesh.userData.spawnModeType = 'anchor';
        mesh.userData.requiresSpawnModeUpdate = config.bob !== null || config.orientation === 'billboard';
    }

    /**
     * Apply orientation to mesh
     * @param {THREE.Mesh} mesh - The mesh
     * @param {string} orientation - Orientation type
     * @private
     */
    _applyOrientation(mesh, orientation) {
        switch (orientation) {
        case 'flat':
            // Lie flat (horizontal) - rotate 90 degrees around X
            mesh.rotation.x = -Math.PI / 2;
            mesh.rotation.y = 0;
            mesh.rotation.z = 0;
            break;

        case 'upright':
            // Default vertical orientation
            mesh.rotation.x = 0;
            mesh.rotation.y = 0;
            mesh.rotation.z = 0;
            break;

        case 'billboard':
            // Will be updated each frame to face camera
            // Initial orientation is upright
            mesh.rotation.x = 0;
            mesh.rotation.y = 0;
            mesh.rotation.z = 0;
            break;

        default:
            // Unknown orientation, use default
            break;
        }
    }

    /**
     * Update element (bob animation, billboard orientation)
     * @param {THREE.Mesh} mesh - The mesh to update
     * @param {number} deltaTime - Time since last frame
     * @param {number} gestureProgress - Current gesture progress (0-1)
     */
    updateElement(mesh, deltaTime, gestureProgress) {
        const anchor = mesh.userData.anchor;
        if (!anchor) return;

        // Apply bob animation
        if (anchor.bob) {
            const time = this.spawner?.time || 0;
            const bobOffset = Math.sin(time * anchor.bob.frequency * Math.PI * 2) * anchor.bob.amplitude;
            mesh.position.y = anchor.baseY + bobOffset;
        }

        // Update billboard orientation
        if (anchor.orientation === 'billboard') {
            const camera = this.spawner?.camera;
            if (camera) {
                mesh.quaternion.copy(camera.quaternion);
            }
        }
    }

    /**
     * This mode requires updates if bob or billboard is enabled
     * @returns {boolean} True if updates are needed
     */
    requiresUpdate() {
        return true; // Always return true, actual check is done per-mesh
    }
}

export default AnchorMode;
