/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - 3D Particle System Exports
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Central export point for 3D particle translation layer
 * @author Emotive Engine Team
 * @module 3d/particles
 *
 * This module provides the bridge between the 2D particle system and 3D rendering:
 * - Particle3DTranslator: Converts 2D positions/behaviors to 3D world space
 * - Particle3DRenderer: Renders particles using Three.js with custom shaders
 * - Particle3DOrchestrator: Orchestrates emotion, gesture, and visual effects
 * - ParticleEmotionCalculator: Calculates particle config from emotion/undertone
 * - GestureDataExtractor: Extracts gesture data from animations
 * - ParticleEffectsBuilder: Maps gestures to visual effects
 */

// Core rendering components
export { Particle3DTranslator } from './Particle3DTranslator.js';
export { Particle3DRenderer } from './Particle3DRenderer.js';

// Orchestration and coordination
export { Particle3DOrchestrator } from './Particle3DOrchestrator.js';

// Specialized calculators/extractors
export { ParticleEmotionCalculator } from './ParticleEmotionCalculator.js';
export { GestureDataExtractor } from './GestureDataExtractor.js';
export { ParticleEffectsBuilder } from './ParticleEffectsBuilder.js';
