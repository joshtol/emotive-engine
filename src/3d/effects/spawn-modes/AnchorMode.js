/**
 * AnchorMode - Elements anchored at landmark positions
 *
 * Enables effects like:
 * - Halos hovering above the head
 * - Crown effects at the top
 * - Ground indicators at the feet
 *
 * This module provides both:
 * - Static utility functions for use by ElementInstancedSpawner
 * - Class-based API for legacy ElementSpawner compatibility
 *
 * @module spawn-modes/AnchorMode
 */

import { BaseSpawnMode } from './BaseSpawnMode.js';
import { normalizeOrientation } from './AxisTravelMode.js';

// ═══════════════════════════════════════════════════════════════════════════════
// STATIC UTILITY FUNCTIONS - Used by ElementInstancedSpawner
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Parse anchor configuration from spawn mode config.
 * @param {Object} config - Raw spawn mode configuration
 * @param {Function} resolveLandmark - Function to resolve landmark names to Y positions
 * @returns {Object} Parsed anchor configuration
 */
export function parseAnchorConfig(config, resolveLandmark) {
    const anchor = config.anchor || {};

    return {
        // Anchor settings
        landmark: anchor.landmark || 'head',
        landmarkY: resolveLandmark(anchor.landmark || 'head'),
        offset: {
            x: anchor.offset?.x || 0,
            y: anchor.offset?.y || 0,
            z: anchor.offset?.z || 0,
        },
        orientation: normalizeOrientation(anchor.orientation) || 'flat',
        bob: anchor.bob
            ? {
                  amplitude: anchor.bob.amplitude || 0.02,
                  frequency: anchor.bob.frequency || 0.5,
              }
            : null,
        wander: anchor.wander
            ? {
                  radius: anchor.wander.radius || 0.1,
                  speedX: anchor.wander.speedX || 0.3,
                  speedZ: anchor.wander.speedZ || 0.2,
              }
            : null,

        // Camera offset: push element toward camera by N × mascotRadius
        // Use for billboard elements that would otherwise clip into mascot geometry
        cameraOffset: anchor.cameraOffset || 0,

        // Relative offset: if true, offset x/y/z are fractions of mascotRadius
        // This keeps element spacing proportional to mascot size
        relativeOffset: anchor.relativeOffset || false,

        // Pass through other spawn options
        count: config.count || 1,
        models: config.models || [],
        scale: config.scale ?? 1.0,

        // Mascot-relative diameter: 'mascot' = diameter values are multiples of mascot width
        diameterUnit: config.diameterUnit || null,
        diameter: config.diameter ?? 1.0,

        // Scale animation over element lifetime (like axis-travel)
        // If both are equal or only scale is set, no interpolation occurs
        startScale: anchor.startScale ?? 1.0,
        endScale: anchor.endScale ?? 1.0,
        scaleEasing: anchor.scaleEasing || 'easeOutExpo', // Default to explosive ease
    };
}

/**
 * Calculate anchor position with optional bob animation.
 * @param {Object} anchorConfig - Parsed anchor configuration
 * @param {number} time - Current time in seconds (for bob animation)
 * @returns {{ x: number, y: number, z: number, baseY: number }} Position coordinates
 */
export function calculateAnchorPosition(anchorConfig, time = 0) {
    const baseY = anchorConfig.landmarkY + anchorConfig.offset.y;
    let { x } = anchorConfig.offset;
    let y = baseY;
    let { z } = anchorConfig.offset;

    // Apply bob animation if configured (vertical oscillation)
    if (anchorConfig.bob) {
        const bobOffset =
            Math.sin(time * anchorConfig.bob.frequency * Math.PI * 2) * anchorConfig.bob.amplitude;
        y = baseY + bobOffset;
    }

    // Apply wander if configured (XZ Lissajous wandering)
    // Uses incommensurate frequencies for natural non-repeating paths
    if (anchorConfig.wander) {
        const w = anchorConfig.wander;
        x += Math.sin(time * w.speedX * Math.PI * 2) * w.radius;
        z += Math.cos(time * w.speedZ * Math.PI * 2) * w.radius;
    }

    return {
        x,
        y,
        z,
        baseY, // Store for update loop
    };
}

/**
 * Get rotation values for anchor orientation.
 * @param {string} orientation - Orientation type ('flat', 'vertical', 'camera', 'radial')
 * @returns {{ x: number, y: number, z: number }} Euler rotation in radians
 */
export function getAnchorOrientation(orientation) {
    switch (orientation) {
        case 'flat':
            // Horizontal ring (like a halo/crown) - rotate +90° around X
            return { x: Math.PI / 2, y: 0, z: 0 };
        case 'vertical':
            // Standing upright
            return { x: 0, y: 0, z: 0 };
        case 'radial':
            // Tilted outward ~45°
            return { x: Math.PI / 4, y: 0, z: 0 };
        case 'camera':
            // Start upright, will be updated per-frame to face camera
            return { x: 0, y: 0, z: 0 };
        default:
            return { x: 0, y: 0, z: 0 };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLASS-BASED API - For legacy ElementSpawner compatibility
// ═══════════════════════════════════════════════════════════════════════════════

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
        // Delegate to static utility function
        return parseAnchorConfig(config, name => this.spatialRef.resolveLandmark(name));
    }

    /**
     * Position an element at anchor location
     * @param {THREE.Mesh} mesh - The mesh to position
     * @param {Object} config - Parsed configuration
     * @param {number} index - Element index
     */
    positionElement(mesh, config, _index) {
        // Calculate final position
        const { x } = config.offset;
        const y = config.landmarkY + config.offset.y;
        const { z } = config.offset;

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
        mesh.userData.requiresSpawnModeUpdate =
            config.bob !== null || config.orientation === 'camera';
    }

    /**
     * Apply orientation to mesh
     * @param {THREE.Mesh} mesh - The mesh
     * @param {string} orientation - Orientation type
     * @private
     */
    _applyOrientation(mesh, orientation) {
        const rot = getAnchorOrientation(orientation);
        mesh.rotation.set(rot.x, rot.y, rot.z);
    }

    /**
     * Update element (bob animation, billboard orientation)
     * @param {THREE.Mesh} mesh - The mesh to update
     * @param {number} deltaTime - Time since last frame
     * @param {number} gestureProgress - Current gesture progress (0-1)
     */
    updateElement(mesh, _deltaTime, _gestureProgress) {
        const { anchor } = mesh.userData;
        if (!anchor) return;

        // Apply bob animation
        if (anchor.bob) {
            const time = this.spawner?.time || 0;
            const bobOffset =
                Math.sin(time * anchor.bob.frequency * Math.PI * 2) * anchor.bob.amplitude;
            mesh.position.y = anchor.baseY + bobOffset;
        }

        // Update camera-facing orientation
        if (anchor.orientation === 'camera') {
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
