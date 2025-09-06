/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Radial Gesture (Alias for Pulse)
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Radial gesture - alias for pulse motion
 * @author Emotive Engine Team
 * @module gestures/motions/radial
 */

import pulse from './pulse.js';

// Radial is essentially the same as pulse
export default {
    ...pulse,
    name: 'radial',
    description: 'Radial expansion/contraction (alias for pulse)'
};