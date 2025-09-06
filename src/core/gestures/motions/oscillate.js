/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Oscillate Gesture (Alias for Bounce)
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Oscillate gesture - alias for bounce with axis control
 * @author Emotive Engine Team
 * @module gestures/motions/oscillate
 */

import bounce from './bounce.js';

// Oscillate is essentially the same as bounce but with explicit axis control
export default {
    ...bounce,
    name: 'oscillate',
    description: 'Oscillating motion along specified axis (alias for bounce)'
};