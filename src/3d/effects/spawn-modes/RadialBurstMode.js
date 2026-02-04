/**
 * RadialBurstMode - Elements spawn at center and burst outward radially
 *
 * Enables effects like:
 * - Radiating heat waves
 * - Explosion/nova bursts
 * - Expanding energy pulses
 *
 * Each element gets a unique radial direction at spawn time,
 * then animates outward along that direction.
 *
 * This module provides both:
 * - Static utility functions for use by ElementInstancedSpawner
 * - Class-based API for legacy ElementSpawner compatibility
 *
 * @module spawn-modes/RadialBurstMode
 */

import { BaseSpawnMode } from './BaseSpawnMode.js';
import { getEasing } from '../animation/Easing.js';

// ═══════════════════════════════════════════════════════════════════════════════
// STATIC UTILITY FUNCTIONS - Used by ElementInstancedSpawner
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Parse radial burst configuration from spawn mode config.
 * @param {Object} config - Raw spawn mode configuration
 * @param {Function} resolveLandmark - Function to resolve landmark names to Y positions
 * @returns {Object} Parsed radial burst configuration
 */
export function parseRadialBurstConfig(config, resolveLandmark) {
    const burst = config.burst || {};

    return {
        // Center point settings
        landmark: burst.landmark || 'center',
        landmarkY: resolveLandmark(burst.landmark || 'center'),
        offset: {
            x: burst.offset?.x || 0,
            y: burst.offset?.y || 0,
            z: burst.offset?.z || 0,
        },

        // Burst behavior
        startRadius: burst.startRadius || 0.05,      // Start slightly off center
        endRadius: burst.endRadius || 0.5,           // How far to travel outward
        plane: burst.plane || 'xz',                  // 'xz' = horizontal, 'xyz' = spherical
        easing: burst.easing || 'easeOutQuad',

        // Scale animation during burst
        startScale: burst.startScale ?? 0.8,
        endScale: burst.endScale ?? 1.2,

        // Pass through other spawn options
        count: config.count || 5,
        models: config.models || [],
        scale: config.scale ?? 1.0,
    };
}

/**
 * Calculate radial direction for an element based on its index.
 * Distributes elements evenly around the burst pattern.
 * @param {number} index - Element index
 * @param {number} count - Total element count
 * @param {string} plane - 'xz' for horizontal, 'xyz' for spherical
 * @returns {{ x: number, y: number, z: number }} Normalized direction vector
 */
export function calculateRadialDirection(index, count, plane = 'xz') {
    if (plane === 'xz') {
        // Horizontal burst - evenly distributed around Y axis
        const angle = (index / count) * Math.PI * 2;
        return {
            x: Math.cos(angle),
            y: 0,
            z: Math.sin(angle),
        };
    } else {
        // Spherical burst - fibonacci sphere distribution for even coverage
        const phi = Math.acos(1 - 2 * (index + 0.5) / count);
        const theta = Math.PI * (1 + Math.sqrt(5)) * index;
        return {
            x: Math.sin(phi) * Math.cos(theta),
            y: Math.cos(phi),
            z: Math.sin(phi) * Math.sin(theta),
        };
    }
}

/**
 * Calculate element position during burst animation.
 * @param {Object} burstConfig - Parsed burst configuration
 * @param {Object} direction - Radial direction vector { x, y, z }
 * @param {number} progress - Animation progress (0-1)
 * @returns {{ x: number, y: number, z: number, scale: number }} Position and scale
 */
export function calculateRadialBurstPosition(burstConfig, direction, progress) {
    // Apply easing to progress using shared easing library
    const easingFn = getEasing(burstConfig.easing);
    const easedProgress = easingFn(progress);

    // Interpolate radius
    const radius = burstConfig.startRadius + (burstConfig.endRadius - burstConfig.startRadius) * easedProgress;

    // Calculate position along radial direction
    const x = burstConfig.offset.x + direction.x * radius;
    const y = burstConfig.landmarkY + burstConfig.offset.y + direction.y * radius;
    const z = burstConfig.offset.z + direction.z * radius;

    // Interpolate scale
    const scale = burstConfig.startScale + (burstConfig.endScale - burstConfig.startScale) * easedProgress;

    return { x, y, z, scale };
}

/**
 * Calculate initial state for an element at spawn time.
 * Used by ElementInstancedSpawner for generic mode handling.
 * @param {Object} config - Parsed burst configuration
 * @param {number} index - Element index
 * @param {number} mascotRadius - Mascot radius for scaling
 * @returns {Object} Initial state { position, rotation, scale, modeData }
 */
export function calculateInitialState(config, index, mascotRadius) {
    const direction = calculateRadialDirection(index, config.count, config.plane);
    const pos = calculateRadialBurstPosition(config, direction, 0);

    return {
        position: { x: pos.x * mascotRadius, y: pos.y, z: pos.z * mascotRadius },
        rotation: { x: 0, y: 0, z: 0, w: 1 }, // Identity quaternion
        scaleMultiplier: pos.scale,
        // Mode-specific data stored on activeElement
        modeData: {
            radialBurst: {
                config,
                direction,
            }
        }
    };
}

/**
 * Calculate updated state for an element during animation.
 * Used by ElementInstancedSpawner for generic mode handling.
 * @param {Object} modeData - Mode-specific data from activeElement
 * @param {number} gestureProgress - Current gesture progress (0-1)
 * @param {number} mascotRadius - Mascot radius for scaling
 * @returns {Object} Updated state { position, scaleMultiplier }
 */
export function calculateUpdateState(modeData, gestureProgress, mascotRadius) {
    const { config, direction } = modeData.radialBurst;
    const pos = calculateRadialBurstPosition(config, direction, gestureProgress);

    return {
        position: { x: pos.x * mascotRadius, y: pos.y, z: pos.z * mascotRadius },
        scaleMultiplier: pos.scale,
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLASS-BASED API - For legacy ElementSpawner compatibility
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Spawn mode for elements that burst outward radially from a center point
 */
export class RadialBurstMode extends BaseSpawnMode {
    static get modeType() {
        return 'radial-burst';
    }

    /**
     * Parse radial burst configuration
     * @param {Object} config - Raw configuration
     * @returns {Object} Parsed configuration with resolved landmarks
     */
    parseConfig(config) {
        return parseRadialBurstConfig(config, name => this.spatialRef.resolveLandmark(name));
    }

    /**
     * Position an element at spawn with its radial direction
     * @param {THREE.Mesh} mesh - The mesh to position
     * @param {Object} config - Parsed configuration
     * @param {number} index - Element index
     */
    positionElement(mesh, config, index) {
        // Calculate this element's radial direction
        const direction = calculateRadialDirection(index, config.count, config.plane);

        // Calculate initial position (at startRadius)
        const pos = calculateRadialBurstPosition(config, direction, 0);

        mesh.position.set(pos.x, pos.y, pos.z);
        mesh.scale.setScalar(pos.scale * config.scale);

        // Store burst data on mesh for update loop
        mesh.userData.radialBurst = {
            config,
            direction,
            startTime: this.spawner?.time || 0,
        };

        // Mark spawn mode type
        mesh.userData.spawnModeType = 'radial-burst';
        mesh.userData.requiresSpawnModeUpdate = true;
    }

    /**
     * Update element position along radial direction
     * @param {THREE.Mesh} mesh - The mesh to update
     * @param {number} deltaTime - Time since last frame
     * @param {number} gestureProgress - Current gesture progress (0-1)
     */
    updateElement(mesh, deltaTime, gestureProgress) {
        const burst = mesh.userData.radialBurst;
        if (!burst) return;

        // Use gesture progress for animation
        const pos = calculateRadialBurstPosition(burst.config, burst.direction, gestureProgress);

        mesh.position.set(pos.x, pos.y, pos.z);

        // Apply scale (multiply by base scale from config)
        const baseScale = mesh.userData.baseScale || burst.config.scale;
        mesh.scale.setScalar(pos.scale * baseScale);
    }

    /**
     * This mode requires per-frame updates
     * @returns {boolean} Always true
     */
    requiresUpdate() {
        return true;
    }
}

export default RadialBurstMode;
