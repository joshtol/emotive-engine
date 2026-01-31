/**
 * OrbitMode - Elements orbit around the mascot
 *
 * Elements positioned in a circular orbit around the mascot center,
 * with gentle continuous orbital motion and bobbing animation.
 *
 * @module spawn-modes/OrbitMode
 */

import { BaseSpawnMode } from './BaseSpawnMode.js';

/**
 * Spawn mode for elements orbiting around the mascot
 */
export class OrbitMode extends BaseSpawnMode {
    static get modeType() {
        return 'orbit';
    }

    /**
     * Parse orbit configuration
     * @param {Object} config - Raw configuration (from spawnConfig[elementType])
     * @returns {Object} Parsed configuration
     */
    parseConfig(config) {
        return {
            orbitRadius: config.orbitRadius || { min: 0.5, max: 1.0 },
            heightOffset: config.heightOffset || { min: -0.3, max: 0.5 },
            rotationSpeed: config.rotationSpeed || { min: 0.02, max: 0.08 },
            count: config.count || { min: 3, max: 8 },
            scale: config.scale || { min: 0.08, max: 0.15 }
        };
    }

    /**
     * Position an element in orbit
     * @param {THREE.Mesh} mesh - The mesh to position
     * @param {Object} config - Parsed configuration
     * @param {number} index - Element index
     * @param {number} totalCount - Total elements being spawned
     */
    positionElement(mesh, config, index, totalCount = 1) {
        // Distribute elements evenly with slight randomness
        const angle = (index / totalCount) * Math.PI * 2 + Math.random() * 0.5;

        // Random radius within range
        const radius = config.orbitRadius.min +
            Math.random() * (config.orbitRadius.max - config.orbitRadius.min);

        // Random height within range
        const height = config.heightOffset.min +
            Math.random() * (config.heightOffset.max - config.heightOffset.min);

        // Set position
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

        // Store orbit data on mesh for update loop
        mesh.userData.orbitAngle = angle;
        mesh.userData.orbitRadius = radius;
        mesh.userData.heightOffset = height;
        mesh.userData.rotationSpeed = config.rotationSpeed.min +
            Math.random() * (config.rotationSpeed.max - config.rotationSpeed.min);

        // Mark spawn mode
        mesh.userData.spawnModeType = 'orbit';
        mesh.userData.requiresSpawnModeUpdate = true;
    }

    /**
     * Update element orbit position
     * @param {THREE.Mesh} mesh - The mesh to update
     * @param {number} deltaTime - Time since last frame
     * @param {number} gestureProgress - Current gesture progress (0-1) - not used for orbit
     */
    updateElement(mesh, deltaTime, gestureProgress) {
        if (mesh.userData.orbitAngle === undefined) return;

        // Very slow orbit (~35 minutes per revolution)
        mesh.userData.orbitAngle += deltaTime * 0.003;

        const radius = mesh.userData.orbitRadius;
        const height = mesh.userData.heightOffset;

        // Subtle bobbing - very slow and gentle
        const time = this.spawner?.time || 0;
        const bob = Math.sin(time * 0.15 + mesh.userData.orbitAngle) * 0.008;

        mesh.position.set(
            Math.cos(mesh.userData.orbitAngle) * radius,
            height + bob,
            Math.sin(mesh.userData.orbitAngle) * radius
        );

        // Very slow rotation - barely perceptible
        if (mesh.userData.rotationSpeed) {
            mesh.rotation.y += deltaTime * mesh.userData.rotationSpeed * 0.1;
            mesh.rotation.x += deltaTime * mesh.userData.rotationSpeed * 0.03;
        }
    }

    /**
     * This mode requires per-frame updates for orbital motion
     * @returns {boolean} Always true
     */
    requiresUpdate() {
        return true;
    }
}

export default OrbitMode;
