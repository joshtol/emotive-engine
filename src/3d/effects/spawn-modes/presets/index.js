/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Spawn Mode Presets
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Reusable spawn mode configurations for common patterns
 * @module spawn-modes/presets
 *
 * All presets return axis-travel configurations that can be customized per element.
 * Each element factory imports the preset it needs and provides element-specific models.
 *
 * PRESET PATTERNS:
 * - vortex: Spiral formation, rings travel up with funnel expansion
 * - transport: Stack formation, rings descend then reverse (teleport effect)
 * - phoenix: Wave formation, rising with emissive scale animation
 * - drill: Spiral formation, rings travel DOWN with narrowing
 */

import { createVortexConfig } from './vortex.js';
import { createTransportConfig } from './transport.js';
import { createPhoenixConfig } from './phoenix.js';
import { createDrillConfig } from './drill.js';

export { createVortexConfig, createTransportConfig, createPhoenixConfig, createDrillConfig };

/**
 * All presets as a single object for convenient imports
 */
export const SPAWN_PRESETS = {
    vortex: createVortexConfig,
    transport: createTransportConfig,
    phoenix: createPhoenixConfig,
    drill: createDrillConfig,
};
