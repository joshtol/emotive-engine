/**
 * =================================================================================================
 *  emotive ENGINE - Atmospheric Presets
 * =================================================================================================
 *
 * @fileoverview Named particle atmosphere presets and per-gesture config resolution.
 * @module effects/AtmosphericPresets
 *
 * Each gesture can specify one or more atmospheric layers in its animation config.
 * A layer references a named preset (smoke, mist, steam, fog) and applies per-gesture
 * overrides for intensity, size, speed, color, anchor mode, and progress curve.
 *
 * resolveLayerConfig() merges the preset defaults with the gesture layer overrides
 * into a fully-resolved config that ParticleAtmosphericsManager can use directly.
 */

import { createSmokeParticleMaterial } from '../materials/SmokeParticleMaterial.js';
import { createMistParticleMaterial } from '../materials/MistParticleMaterial.js';
import { createSprayParticleMaterial } from '../materials/SprayParticleMaterial.js';

// =================================================================================================
// MATERIAL FACTORIES (keyed by preset material name)
// =================================================================================================

const MATERIAL_FACTORIES = {
    smoke: createSmokeParticleMaterial,
    mist: createMistParticleMaterial,
    spray: createSprayParticleMaterial,
};

// =================================================================================================
// NAMED PRESETS
// =================================================================================================

export const ATMOSPHERIC_PRESETS = {
    /**
     * Smoke: warm grey rising plumes, expanding, fading to cool grey.
     * Best for: fire gestures, explosions, embers.
     */
    smoke: {
        materialType: 'smoke',
        maxParticles: 64,
        spawnRate: 18,
        lifetimeMin: 1.5,
        lifetimeMax: 2.5,
        sizeMin: 0.10,
        sizeMax: 0.18,
        spawnOffsetY: 0.0,
        initialSpeedMin: 0.1,
        initialSpeedMax: 0.25,
        spreadXZ: 0.15,
        directionY: 1.0,
        buoyancy: 0.04,
        drag: 1.8,
        turbulence: 0.2,
        rotationSpeedMax: 1.0,
        endSizeMultiplier: 1.8,
        opacity: 0.20,
        colorWarm: [0.25, 0.22, 0.18],
        colorCool: [0.18, 0.18, 0.20],
    },

    /**
     * Mist: pale blue-white ground fog, sinking, slow, barely visible.
     * Best for: ice gestures, cold effects, ground-level atmosphere.
     */
    mist: {
        materialType: 'mist',
        maxParticles: 48,
        spawnRate: 8,
        lifetimeMin: 1.5,
        lifetimeMax: 3.0,
        sizeMin: 0.25,
        sizeMax: 0.50,
        spawnOffsetY: -0.10,
        initialSpeedMin: 0.02,
        initialSpeedMax: 0.06,
        spreadXZ: 0.20,
        directionY: -0.05,
        buoyancy: -0.005,
        drag: 0.8,
        turbulence: 0.08,
        rotationSpeedMax: 0.4,
        endSizeMultiplier: 1.5,
        opacity: 0.12,
        color: [0.75, 0.82, 0.90],
    },

    /**
     * Steam: fast-rising small white puffs, short-lived.
     * Best for: impacts, rapid evaporation, hot surfaces.
     */
    steam: {
        materialType: 'smoke',
        maxParticles: 32,
        spawnRate: 15,
        lifetimeMin: 0.8,
        lifetimeMax: 1.5,
        sizeMin: 0.08,
        sizeMax: 0.18,
        spawnOffsetY: 0.05,
        initialSpeedMin: 1.5,
        initialSpeedMax: 2.5,
        spreadXZ: 0.15,
        directionY: 1.0,
        buoyancy: 0.5,
        drag: 2.0,
        turbulence: 0.2,
        rotationSpeedMax: 2.0,
        endSizeMultiplier: 2.5,
        opacity: 0.25,
        colorWarm: [0.80, 0.80, 0.80],
        colorCool: [0.60, 0.60, 0.60],
    },

    /**
     * Fog: large, barely-moving, extremely transparent volume.
     * Best for: ambient atmosphere, mystery, environmental mood.
     */
    fog: {
        materialType: 'mist',
        maxParticles: 16,
        spawnRate: 1,
        lifetimeMin: 6.0,
        lifetimeMax: 10.0,
        sizeMin: 0.50,
        sizeMax: 1.00,
        spawnOffsetY: 0.0,
        initialSpeedMin: 0.01,
        initialSpeedMax: 0.03,
        spreadXZ: 0.3,
        directionY: 0.0,
        buoyancy: 0.0,
        drag: 0.5,
        turbulence: 0.03,
        rotationSpeedMax: 0.15,
        endSizeMultiplier: 1.1,
        opacity: 0.03,
        color: [0.65, 0.70, 0.75],
    },

    /**
     * Ozone: fast-rising, short-lived ionized air wisps.
     * Best for: electricity gestures, lightning strikes, plasma arcs.
     */
    ozone: {
        materialType: 'smoke',
        maxParticles: 32,
        spawnRate: 10,
        lifetimeMin: 0.6,
        lifetimeMax: 1.2,
        sizeMin: 0.06,
        sizeMax: 0.12,
        spawnOffsetY: 0.0,
        initialSpeedMin: 0.3,
        initialSpeedMax: 0.8,
        spreadXZ: 0.10,
        directionY: 1.0,
        buoyancy: 0.15,
        drag: 2.5,
        turbulence: 0.15,
        rotationSpeedMax: 2.0,
        endSizeMultiplier: 2.0,
        opacity: 0.15,
        colorWarm: [0.60, 0.70, 0.85],
        colorCool: [0.40, 0.45, 0.55],
    },

    /**
     * Spray: fine water droplets thrown into the air by splashing/crashing water.
     * Best for: water gestures, fountains, waterfalls, vortex effects.
     *
     * Each particle is ONE tiny bright point (not a cloud). Many small particles
     * arc upward then fall under gravity, creating a fine spray curtain.
     */
    spray: {
        materialType: 'spray',
        maxParticles: 180,
        spawnRate: 60,
        lifetimeMin: 0.5,
        lifetimeMax: 1.2,
        sizeMin: 0.14,
        sizeMax: 0.30,
        spawnOffsetY: 0.05,
        spawnRadius: 0.35,
        initialSpeedMin: 0.8,
        initialSpeedMax: 1.6,
        spreadXZ: 0.40,
        directionY: 0.5,
        buoyancy: -0.8,
        drag: 1.0,
        turbulence: 0.06,
        rotationSpeedMax: 0.3,
        endSizeMultiplier: 0.8,
        opacity: 0.55,
        color: [0.4, 0.7, 1.0],
    },
};

// =================================================================================================
// PROGRESS CURVES
// =================================================================================================

/**
 * Attempt to behave like GLSL smoothstep for [0,1] mapped input.
 */
function smoothstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
}

/**
 * Evaluate a named progress curve at a given gesture progress (0→1).
 * Returns a multiplier (0→1) used to scale spawnRate.
 *
 * @param {string} curve - Curve name
 * @param {number} progress - Gesture progress 0→1
 * @returns {number} Multiplier 0→1
 */
export function evaluateProgressCurve(curve, progress) {
    switch (curve) {
    case 'sustain':
        return 1.0;
    case 'rampUp':
        return smoothstep(0, 0.5, progress);
    case 'rampDown':
        return 1 - smoothstep(0.5, 1.0, progress);
    case 'pulse':
        return Math.sin(progress * Math.PI);
    case 'burst':
        return 1 - smoothstep(0, 0.3, progress);
    default:
        return 1.0;
    }
}

// =================================================================================================
// LAYER CONFIG RESOLUTION
// =================================================================================================

/**
 * Resolve a gesture's atmospheric layer config into a fully-specified config
 * ready for ParticleEmitter construction.
 *
 * Merges preset defaults with per-gesture overrides:
 *   - intensity scales spawnRate and opacity
 *   - sizeScale multiplies sizeMin/sizeMax
 *   - speedScale multiplies initialSpeedMin/Max
 *   - colorTint overrides color fields
 *
 * @param {Object} layerConfig - Per-gesture layer config
 * @param {string} layerConfig.preset - Preset name ('smoke', 'mist', 'steam', 'fog')
 * @param {string[]|null} [layerConfig.targets] - Model names to target (null = all)
 * @param {string} [layerConfig.anchor='above'] - Anchor mode
 * @param {number} [layerConfig.anchorOffset=0] - Vertical offset from anchor
 * @param {number} [layerConfig.intensity=1] - Master intensity (0-1+)
 * @param {number} [layerConfig.sizeScale=1] - Particle size multiplier
 * @param {number} [layerConfig.speedScale=1] - Velocity multiplier
 * @param {number} [layerConfig.burstCount=0] - Instant particles at start
 * @param {string} [layerConfig.progressCurve='sustain'] - Progress curve name
 * @param {number[]|null} [layerConfig.colorTint] - [r,g,b] override
 * @returns {Object} Fully-resolved config for ParticleEmitter
 */
export function resolveLayerConfig(layerConfig) {
    const presetName = layerConfig.preset || 'smoke';
    const preset = ATMOSPHERIC_PRESETS[presetName];
    if (!preset) {
        console.warn(`[AtmosphericPresets] Unknown preset "${presetName}", falling back to smoke`);
        return resolveLayerConfig({ ...layerConfig, preset: 'smoke' });
    }

    const intensity = layerConfig.intensity ?? 1.0;
    const sizeScale = layerConfig.sizeScale ?? 1.0;
    const speedScale = layerConfig.speedScale ?? 1.0;

    // Build the material config (what gets passed to material factory)
    const materialConfig = { ...preset };

    // Apply intensity to spawnRate (linear) and opacity (sqrt — prevents crush at low intensity)
    materialConfig.spawnRate = preset.spawnRate * intensity;
    materialConfig.opacity = preset.opacity * Math.sqrt(Math.min(intensity, 1.5));

    // Apply size scale
    materialConfig.sizeMin = preset.sizeMin * sizeScale;
    materialConfig.sizeMax = preset.sizeMax * sizeScale;

    // Apply speed scale
    materialConfig.initialSpeedMin = preset.initialSpeedMin * speedScale;
    materialConfig.initialSpeedMax = preset.initialSpeedMax * speedScale;

    // Apply color tint override
    if (layerConfig.colorTint) {
        if (preset.materialType === 'smoke') {
            materialConfig.colorWarm = layerConfig.colorTint;
            materialConfig.colorCool = layerConfig.colorTint;
        } else {
            materialConfig.color = layerConfig.colorTint;
        }
    }

    // Apply anchor offset to spawnOffsetY
    const anchor = layerConfig.anchor || 'above';
    let {spawnOffsetY} = preset;
    const anchorOffset = layerConfig.anchorOffset ?? 0;

    switch (anchor) {
    case 'above':
        spawnOffsetY = Math.abs(preset.spawnOffsetY) + anchorOffset;
        materialConfig.directionY = 1.0;
        break;
    case 'below':
        spawnOffsetY = -(Math.abs(preset.spawnOffsetY)) + anchorOffset;
        materialConfig.directionY = preset.directionY ?? -0.3;
        break;
    case 'around':
        spawnOffsetY = anchorOffset;
        materialConfig.spreadXZ = preset.spreadXZ * 1.5; // Wider lateral spread
        break;
    case 'trailing':
        spawnOffsetY = anchorOffset;
        break;
    }
    materialConfig.spawnOffsetY = spawnOffsetY;

    // Create material instance
    const materialFactory = MATERIAL_FACTORIES[preset.materialType];
    const material = materialFactory(materialConfig);

    return {
        // Particle emitter config
        material,
        maxParticles: materialConfig.maxParticles,
        spawnRate: materialConfig.spawnRate,
        lifetimeMin: materialConfig.lifetimeMin,
        lifetimeMax: materialConfig.lifetimeMax,
        sizeMin: materialConfig.sizeMin,
        sizeMax: materialConfig.sizeMax,
        spawnOffsetY: materialConfig.spawnOffsetY,
        initialSpeedMin: materialConfig.initialSpeedMin,
        initialSpeedMax: materialConfig.initialSpeedMax,
        spreadXZ: materialConfig.spreadXZ,
        directionY: materialConfig.directionY,
        spawnRadius: materialConfig.spawnRadius || 0,

        // Targeting
        targetModels: layerConfig.targets || null,
        anchor,

        // Modulation
        progressCurve: layerConfig.progressCurve || 'sustain',
        burstCount: layerConfig.burstCount || 0,
        baseSpawnRate: materialConfig.spawnRate, // Unmodulated rate for progress curve

        // Physics: velocity inheritance (0-1 fraction of source element motion)
        velocityInheritance: layerConfig.velocityInheritance || 0,

        // Physics: centrifugal emission for spinning gestures
        // { speed: outward velocity, tangentialBias: 0-1 radial vs tangential mix }
        centrifugal: layerConfig.centrifugal || null,
    };
}
