/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Jitter Gesture (Alias for Shake)
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Jitter gesture - alias for shake motion
 * @author Emotive Engine Team
 * @module gestures/motions/jitter
 */

import shake from './shake.js';

// Jitter is essentially the same as shake
export default {
    ...shake,
    name: 'jitter',
    description: 'Jittery motion (alias for shake)'
};