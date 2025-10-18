/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Configuration Index
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Central export for all particle configuration
 * @author Emotive Engine Team
 * @module particles/config
 */

export { PHYSICS, LIFECYCLE } from './physics.js';
export { PLAYGROUND } from './playground.js';

// Re-export as default for convenience
import { PHYSICS, LIFECYCLE } from './physics.js';
import { PLAYGROUND } from './playground.js';

export default {
    PHYSICS,
    LIFECYCLE,
    PLAYGROUND
};