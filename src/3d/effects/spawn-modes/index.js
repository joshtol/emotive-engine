/**
 * Spawn Modes Registry
 *
 * Central registry for all spawn mode implementations.
 * Each mode handles element positioning differently:
 * - orbit: Elements orbit around the mascot
 * - surface: Elements spawn on the mascot surface
 * - axis-travel: Elements travel along an axis over time
 * - anchor: Elements anchored at landmark positions
 *
 * @module spawn-modes
 */

export { BaseSpawnMode } from './BaseSpawnMode.js';
export { OrbitMode } from './OrbitMode.js';
export { SurfaceMode } from './SurfaceMode.js';
export { AnchorMode } from './AnchorMode.js';

// AxisTravelMode - class and static utilities
export {
    AxisTravelMode,
    // Static utility functions for use by ElementInstancedSpawner and presets
    parseFormation,
    parseAxisTravelConfig,
    expandFormation,
    calculateAxisTravelPosition
} from './AxisTravelMode.js';

/**
 * Registry of spawn mode classes
 * @type {Object.<string, typeof BaseSpawnMode>}
 */
import { OrbitMode } from './OrbitMode.js';
import { SurfaceMode } from './SurfaceMode.js';
import { AxisTravelMode } from './AxisTravelMode.js';
import { AnchorMode } from './AnchorMode.js';

export const SPAWN_MODES = {
    // Note: 'orbit' and 'surface' are still handled inline in ElementSpawner.spawn()
    // They have complex interactions with surface sampling that _spawnWithNewMode doesn't handle
    'axis-travel': AxisTravelMode,
    'anchor': AnchorMode,
};

/**
 * Create a spawn mode instance
 * @param {string} type - Mode type ('axis-travel', 'anchor', etc.)
 * @param {Object} spawner - ElementSpawner instance
 * @param {MascotSpatialRef} spatialRef - Spatial reference for landmarks
 * @returns {BaseSpawnMode|null} Mode instance or null if type not found
 */
export function createSpawnMode(type, spawner, spatialRef) {
    const ModeClass = SPAWN_MODES[type];

    if (!ModeClass) {
        // Return null for modes still handled inline (orbit, surface)
        return null;
    }

    return new ModeClass(spawner, spatialRef);
}

/**
 * Check if a mode type is handled by the new spawn mode system
 * @param {string} type - Mode type to check
 * @returns {boolean} True if mode is in the registry
 */
export function isNewSpawnMode(type) {
    return type in SPAWN_MODES;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRESETS - Reusable spawn mode configurations
// ═══════════════════════════════════════════════════════════════════════════════

export {
    SPAWN_PRESETS,
    createVortexConfig,
    createTransportConfig,
    createPhoenixConfig,
    createDrillConfig,
} from './presets/index.js';
