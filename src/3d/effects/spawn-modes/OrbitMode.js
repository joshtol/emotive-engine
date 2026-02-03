/**
 * OrbitMode - Elements orbit around the mascot
 *
 * Elements positioned in a circular orbit around the mascot center,
 * with configurable height, radius, and formation patterns.
 *
 * This module provides both:
 * - Static utility functions for use by ElementInstancedSpawner
 * - Class-based API for legacy ElementSpawner compatibility
 *
 * @module spawn-modes/OrbitMode
 */

import { BaseSpawnMode } from './BaseSpawnMode.js';
import { normalizeOrientation } from './AxisTravelMode.js';

// ═══════════════════════════════════════════════════════════════════════════════
// STATIC UTILITY FUNCTIONS - Used by ElementInstancedSpawner
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Parse orbit configuration from gesture spawnMode
 * @param {Object} config - Raw configuration from gesture
 * @param {Function} resolveLandmark - Function to resolve landmark names to Y positions
 * @returns {Object} Parsed orbit configuration
 */
export function parseOrbitConfig(config, resolveLandmark) {
    const orbit = config.orbit || {};
    const formation = config.formation || null;

    // Resolve height - can be a landmark name or a number
    let height = 0;
    if (typeof orbit.height === 'string') {
        height = resolveLandmark(orbit.height);
    } else if (typeof orbit.height === 'number') {
        ({ height } = orbit);
    }

    // Orientation: prefer 'orientation', fall back to legacy 'ringOrientation'
    const rawOrientation = orbit.orientation ?? orbit.ringOrientation;

    return {
        // Orbit geometry
        height,
        radius: orbit.radius ?? 1.5,
        plane: orbit.plane || 'horizontal',

        // Orientation (unified naming, normalized) - default to vertical for orbit
        orientation: normalizeOrientation(rawOrientation) || 'vertical',

        // Formation settings
        formation: parseOrbitFormation(formation),

        // Pass through spawn options
        count: config.count || formation?.count || 4,
        models: config.models || [],
        scale: config.scale ?? 1.0,
    };
}

/**
 * Parse orbit formation configuration
 * @param {Object} formation - Formation config from gesture
 * @returns {Object|null} Parsed formation config
 */
export function parseOrbitFormation(formation) {
    if (!formation) return null;

    return {
        type: formation.type || 'ring',
        count: formation.count || 4,
        pairSpacing: (formation.pairSpacing || 180) * Math.PI / 180, // Convert to radians
        startAngle: (formation.startAngle || 0) * Math.PI / 180,
    };
}

/**
 * Expand orbit formation into per-element configurations
 * @param {Object} parsedConfig - Parsed orbit configuration
 * @returns {Array<Object>} Array of per-element formation data
 */
export function expandOrbitFormation(parsedConfig) {
    const { formation, count } = parsedConfig;
    const elements = [];
    const actualCount = formation?.count || count;

    for (let i = 0; i < actualCount; i++) {
        const elem = {
            index: i,
            angle: 0,           // Angle around orbit circle
            heightOffset: 0,    // Additional height offset
            rotationOffset: 0,  // Per-element rotation (for counter-rotating pairs)
        };

        const formationType = formation?.type || 'ring';

        switch (formationType) {
        case 'ring':
            // Even distribution around circle
            elem.angle = (i / actualCount) * Math.PI * 2 + (formation?.startAngle || 0);
            break;

        case 'pairs': {
            // Pairs positioned opposite each other
            // Elements 0,2 on one side, 1,3 on opposite
            const pairIndex = Math.floor(i / 2);
            const isSecondInPair = i % 2 === 1;
            const baseAngle = (pairIndex / Math.ceil(actualCount / 2)) * Math.PI * 2;
            elem.angle = isSecondInPair ? baseAngle + (formation?.pairSpacing || Math.PI) : baseAngle;
            break;
        }

        case 'cluster': {
            // Clustered within a portion of the circle
            const clusterArc = Math.PI / 2; // 90 degree cluster
            elem.angle = (i / actualCount) * clusterArc + (formation?.startAngle || 0);
            break;
        }

        default:
            elem.angle = (i / actualCount) * Math.PI * 2;
        }

        elements.push(elem);
    }

    return elements;
}

/**
 * Calculate position for orbit element
 * @param {Object} orbitConfig - Parsed orbit configuration
 * @param {Object} formationData - Per-element formation data
 * @param {number} gestureProgress - Current gesture progress (0-1)
 * @param {number} mascotRadius - Mascot radius for scaling
 * @returns {{ x: number, y: number, z: number, angle: number }}
 */
export function calculateOrbitPosition(orbitConfig, formationData, gestureProgress, mascotRadius = 1) {
    const radius = orbitConfig.radius * mascotRadius;
    const height = orbitConfig.height * mascotRadius;
    const {angle} = formationData;

    // For orbit, position is fixed (no travel based on progress)
    // Progress could be used for orbital rotation if desired
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = height + (formationData.heightOffset || 0);

    return { x, y, z, angle };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLASS-BASED API - For legacy ElementSpawner compatibility
// ═══════════════════════════════════════════════════════════════════════════════

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
