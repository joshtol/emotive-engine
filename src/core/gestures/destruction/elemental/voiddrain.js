/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Void Drain Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Voiddrain gesture - slowly draining energy, light dims and color fades
 * @module gestures/destruction/elemental/voiddrain
 *
 * Category: Absorption — mascot is becoming void
 * Surface spawn with void-shard and corruption-patch models.
 * Slow void pulse with inward drift.
 */

import { createVoidEffectGesture } from './voidEffectFactory.js';

export default createVoidEffectGesture('drain');
