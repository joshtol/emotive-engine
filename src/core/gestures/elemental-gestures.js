/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Elemental Gesture Registration (Side-effect module)
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Registers all elemental gestures into the gesture registry.
 * Importing this module is a SIDE EFFECT — it adds 160 elemental gestures to
 * GESTURE_REGISTRY. The base 3D bundle omits this import so it stays lean; the
 * "3d-elementals" bundle includes it, and each lean "3d-<element>" bundle imports
 * only its own ./elemental/<element>/register.js.
 *
 * @module gestures/elemental-gestures
 */

import './elemental/water/register.js';
import './elemental/fire/register.js';
import './elemental/electric/register.js';
import './elemental/void/register.js';
import './elemental/ice/register.js';
import './elemental/light/register.js';
import './elemental/earth/register.js';
import './elemental/nature/register.js';
