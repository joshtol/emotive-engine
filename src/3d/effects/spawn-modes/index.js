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

// OrbitMode - class and static utilities
export {
    OrbitMode,
    parseOrbitConfig,
    parseOrbitFormation,
    expandOrbitFormation,
    calculateOrbitPosition,
} from './OrbitMode.js';

// SurfaceMode - class and static utilities
export { SurfaceMode, parseSurfaceConfig } from './SurfaceMode.js';

// AnchorMode - class and static utilities
export {
    AnchorMode,
    parseAnchorConfig,
    calculateAnchorPosition,
    getAnchorOrientation,
} from './AnchorMode.js';

// RadialBurstMode - class and static utilities
export {
    RadialBurstMode,
    parseRadialBurstConfig,
    calculateRadialDirection,
    calculateRadialBurstPosition,
    calculateInitialState as calculateRadialBurstInitialState,
    calculateUpdateState as calculateRadialBurstUpdateState,
} from './RadialBurstMode.js';

// AxisTravelMode - class and static utilities
export {
    AxisTravelMode,
    // Static utility functions for use by ElementInstancedSpawner and presets
    parseFormation,
    parseAxisTravelConfig,
    expandFormation,
    calculateAxisTravelPosition,
    normalizeOrientation, // Shared orientation value normalizer
} from './AxisTravelMode.js';

/**
 * Registry of spawn mode classes
 * @type {Object.<string, typeof BaseSpawnMode>}
 */
import { OrbitMode } from './OrbitMode.js';
import { SurfaceMode } from './SurfaceMode.js';
import { AxisTravelMode } from './AxisTravelMode.js';
import { AnchorMode } from './AnchorMode.js';
import { RadialBurstMode } from './RadialBurstMode.js';

export const SPAWN_MODES = {
    'axis-travel': AxisTravelMode,
    anchor: AnchorMode,
    orbit: OrbitMode,
    surface: SurfaceMode,
    'radial-burst': RadialBurstMode,
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
        console.warn(`[SpawnModes] Unknown spawn mode type: ${type}`);
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
