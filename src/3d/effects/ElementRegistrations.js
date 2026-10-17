/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Element Type Registrations (all eight)
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Registers all eight element types with the ElementTypeRegistry.
 * @module effects/ElementRegistrations
 *
 * Each element lives in its own side-effect module under ./elements/ so a lean build
 * can import just one (see src/3d/elements.js and the `./3d-<element>` entries).
 * Importing this file registers all of them. Keep the list in sync with
 * src/3d/elements.js; package.json `sideEffects` must list these modules or a
 * bundler will tree-shake the registrations away.
 */

import './elements/fire.js';
import './elements/water.js';
import './elements/ice.js';
import './elements/electricity.js';
import './elements/void.js';
import './elements/light.js';
import './elements/earth.js';
import './elements/nature.js';

// Export for explicit import (side-effect import also works)
export { ElementTypeRegistry } from './ElementTypeRegistry.js';
