/**
 * AxisTravelMode - Elements travel along an axis based on gesture progress
 *
 * Enables effects like:
 * - Splash rings rising from feet to head
 * - Vortex spirals with multiple stacked rings
 * - Transport-style rings descending then reversing
 *
 * This module provides both:
 * - Static utility functions for use by ElementInstancedSpawner
 * - Class-based API for legacy ElementSpawner compatibility
 *
 * @module spawn-modes/AxisTravelMode
 */

import { BaseSpawnMode } from './BaseSpawnMode.js';
import { getEasing } from '../animation/Easing.js';

// ═══════════════════════════════════════════════════════════════════════════════
// STATIC UTILITY FUNCTIONS - Used by ElementInstancedSpawner and presets
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Parse formation configuration
 * @param {Object} formation - Formation config
 * @returns {Object} Parsed formation config with radians
 */
export function parseFormation(formation) {
    if (!formation) return null;
    return {
        type: formation.type || 'stack',
        count: formation.count || 1,
        spacing: formation.spacing || 0.15,
        arcOffset: (formation.arcOffset || 60) * Math.PI / 180, // Convert to radians
        phaseOffset: formation.phaseOffset || 0,
        strands: formation.strands || 1, // 1 = single helix, 2 = double helix (DNA-style)
        // Mandala support: center formation around origin instead of stacking upward
        centered: formation.centered || false,
        // Per-element scale multipliers (e.g., [0.5, 0.75, 1.0, 0.75, 0.5] for mandala)
        scales: formation.scales || null,
        // Explicit XYZ positions for each element (overrides spacing-based positioning)
        // e.g., [{ x: 0, y: 0.5, z: 0 }, { x: -0.4, y: 0, z: 0 }, ...]
        positions: formation.positions || null,
        // Mandala-specific: radius for auto-generated circular pattern
        radius: formation.radius || 0.4,
    };
}

/**
 * Normalize orientation value - maps legacy names to canonical names
 * @param {string} orientation - Orientation value (may be legacy)
 * @returns {string} Canonical orientation name
 */
export function normalizeOrientation(orientation) {
    const mapping = {
        'horizontal': 'flat',    // Legacy: horizontal rings = flat
        'upright': 'vertical',   // Legacy: upright = vertical
        'billboard': 'camera',   // Legacy: billboard = camera
    };
    return mapping[orientation] || orientation || 'flat';
}

/**
 * Parse axis-travel configuration (without spatialRef - landmarks as raw values)
 * @param {Object} config - Raw configuration
 * @param {Function} resolveLandmark - Function to resolve landmark names to positions
 * @returns {Object} Parsed configuration with resolved landmarks
 */
export function parseAxisTravelConfig(config, resolveLandmark) {
    const axisTravel = config.axisTravel || {};
    const formation = config.formation || null;

    // Support offset to adjust for ring radius (vertical rings need offset to anchor edge, not center)
    const startOffset = axisTravel.startOffset ?? 0;
    const endOffset = axisTravel.endOffset ?? 0;

    // Orientation: prefer 'orientation', fall back to legacy 'ringOrientation'
    const rawOrientation = axisTravel.orientation ?? axisTravel.ringOrientation;

    return {
        // Axis travel settings
        axis: axisTravel.axis || 'y',
        startPos: resolveLandmark(axisTravel.start ?? 'bottom') + startOffset,
        endPos: resolveLandmark(axisTravel.end ?? 'top') + endOffset,
        easing: getEasing(axisTravel.easing || 'easeInOut'),
        startScale: axisTravel.startScale ?? 1.0,
        endScale: axisTravel.endScale ?? 1.0,
        startDiameter: axisTravel.startDiameter ?? 1.0,
        endDiameter: axisTravel.endDiameter ?? 1.0,
        reverseAt: axisTravel.reverseAt ?? null,

        // Orientation (unified naming, normalized)
        orientation: normalizeOrientation(rawOrientation),

        // Formation settings
        formation: parseFormation(formation),

        // Pass through other spawn options
        count: config.count || 1,
        models: config.models || [],
        scale: config.scale ?? 1.0,
    };
}

/**
 * Expand formation into per-element configurations
 * @param {Object} parsedConfig - Parsed configuration with formation
 * @returns {Array<Object>} Array of per-element formation data
 */
export function expandFormation(parsedConfig) {
    const { formation } = parsedConfig;

    if (!formation) {
        return [{ index: 0, positionOffset: { x: 0, y: 0, z: 0 }, rotationOffset: 0, progressOffset: 0, scaleMultiplier: 1.0 }];
    }

    const elements = [];

    // Calculate centering offset if centered mode is enabled
    const totalSpan = (formation.count - 1) * formation.spacing;
    const centerOffset = formation.centered ? -totalSpan / 2 : 0;

    for (let i = 0; i < formation.count; i++) {
        const elem = {
            index: i,
            positionOffset: { x: 0, y: 0, z: 0 },  // Now supports XYZ
            rotationOffset: 0,
            progressOffset: i * formation.phaseOffset,
            // Per-element scale multiplier (defaults to 1.0)
            scaleMultiplier: formation.scales?.[i] ?? 1.0,
        };

        switch (formation.type) {
        case 'stack':
            // Vertical stack - offset Y position only
            elem.positionOffset = { x: 0, y: i * formation.spacing + centerOffset, z: 0 };
            break;

        case 'spiral': {
            // Spiral - stack with rotation, optionally interleaved across multiple strands
            const strands = formation.strands || 1;
            const strandIndex = i % strands;
            const indexWithinStrand = Math.floor(i / strands);

            // Position offset based on index within strand (Y axis only)
            elem.positionOffset = { x: 0, y: indexWithinStrand * formation.spacing + centerOffset, z: 0 };

            // Rotation: base rotation for position + strand offset
            const baseRotation = indexWithinStrand * formation.arcOffset;
            const strandOffset = (strandIndex / strands) * Math.PI * 2;
            elem.rotationOffset = baseRotation + strandOffset;
            break;
        }

        case 'wave':
            // Wave - sinusoidal Y offset
            elem.positionOffset = {
                x: 0,
                y: Math.sin(i / formation.count * Math.PI) * formation.spacing + centerOffset,
                z: 0
            };
            elem.progressOffset = i * (formation.phaseOffset || 0.08);
            break;

        case 'mandala': {
            // MANDALA: Rings positioned in a circular pattern around center
            // First element is center, rest are arranged in a circle
            if (i === 0) {
                // Center ring
                elem.positionOffset = { x: 0, y: 0, z: 0 };
            } else {
                // Outer rings arranged in circle
                const outerCount = formation.count - 1;
                const angle = ((i - 1) / outerCount) * Math.PI * 2;
                const radius = formation.radius || 0.4;
                elem.positionOffset = {
                    x: Math.sin(angle) * radius,
                    y: Math.cos(angle) * radius,
                    z: 0
                };
            }
            // Rotation offset for visual variety
            elem.rotationOffset = i * formation.arcOffset;
            break;
        }

        case 'positioned':
            // EXPLICIT POSITIONS: Use positions array directly
            if (formation.positions && formation.positions[i]) {
                const pos = formation.positions[i];
                elem.positionOffset = {
                    x: pos.x || 0,
                    y: pos.y || 0,
                    z: pos.z || 0
                };
            }
            elem.rotationOffset = i * formation.arcOffset;
            break;

        default:
            elem.positionOffset = { x: 0, y: i * formation.spacing + centerOffset, z: 0 };
        }

        elements.push(elem);
    }

    return elements;
}

/**
 * Calculate position, scale, and diameter for axis-travel element
 * @param {Object} axisConfig - Parsed axis-travel configuration
 * @param {Object} formationData - Per-element formation data
 * @param {number} gestureProgress - Current gesture progress (0-1)
 * @param {number} [mascotRadius=1] - Mascot radius for scaling offsets
 * @returns {{ axisPos: number, axis: string, positionOffset: number, scale: number, diameter: number, rotationOffset: number }}
 */
export function calculateAxisTravelPosition(axisConfig, formationData, gestureProgress, mascotRadius = 1) {
    // Apply formation progress offset (stagger)
    let progress = gestureProgress;
    if (formationData?.progressOffset) {
        progress = Math.max(0, Math.min(1, progress - formationData.progressOffset));
    }

    // Handle reverseAt for down-then-up patterns (e.g., Transport)
    let travelProgress = progress;
    if (axisConfig.reverseAt !== null && progress > axisConfig.reverseAt) {
        // After reverseAt, travel back toward start
        const reverseProgress = (progress - axisConfig.reverseAt) / (1 - axisConfig.reverseAt);
        travelProgress = 1 - reverseProgress;
    }

    // Apply easing
    const easedProgress = axisConfig.easing(travelProgress);

    // Interpolate position on axis
    let axisPos = axisConfig.startPos + (axisConfig.endPos - axisConfig.startPos) * easedProgress;

    // Interpolate uniform scale
    const scale = axisConfig.startScale + (axisConfig.endScale - axisConfig.startScale) * easedProgress;

    // Interpolate diameter
    const diameter = axisConfig.startDiameter + (axisConfig.endDiameter - axisConfig.startDiameter) * easedProgress;

    // For vertical rings, offset so the bottom EDGE touches the landmark (not the center)
    // Ring radius ≈ diameter * mascotRadius * scale * base_model_factor
    if (axisConfig.orientation === 'vertical' && axisConfig.axis === 'y') {
        const ringRadius = diameter * mascotRadius * scale * 0.25;  // 0.25 empirical for ring model size
        axisPos += ringRadius;
    }

    // Position offset scaled by mascot radius - now supports XYZ
    const rawOffset = formationData?.positionOffset || { x: 0, y: 0, z: 0 };
    // Handle both old format (number) and new format (object with x,y,z)
    const positionOffset = typeof rawOffset === 'number'
        ? { x: 0, y: rawOffset * mascotRadius, z: 0 }
        : {
            x: (rawOffset.x || 0) * mascotRadius,
            y: (rawOffset.y || 0) * mascotRadius,
            z: (rawOffset.z || 0) * mascotRadius
        };

    return {
        axisPos,
        axis: axisConfig.axis,
        positionOffset,
        scale,
        diameter,
        rotationOffset: formationData?.rotationOffset || 0,
        scaleMultiplier: formationData?.scaleMultiplier ?? 1.0,
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLASS-BASED API - For legacy ElementSpawner compatibility
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Spawn mode for elements traveling along an axis
 */
export class AxisTravelMode extends BaseSpawnMode {
    static get modeType() {
        return 'axis-travel';
    }

    /**
     * Parse axis-travel configuration
     * @param {Object} config - Raw configuration
     * @returns {Object} Parsed configuration with resolved landmarks
     */
    parseConfig(config) {
        // Delegate to static function with bound landmark resolver
        return parseAxisTravelConfig(config, name => this.spatialRef.resolveLandmark(name));
    }

    /**
     * Expand formation into per-element configurations
     * @param {Object} parsedConfig - Parsed configuration
     * @returns {Array<Object>} Array of per-element formation data
     */
    expandFormation(parsedConfig) {
        // Delegate to static function
        return expandFormation(parsedConfig);
    }

    /**
     * Position an element for axis travel
     * @param {THREE.Mesh} mesh - The mesh to position
     * @param {Object} config - Parsed configuration
     * @param {number} index - Element index
     * @param {Object} [formationData] - Optional formation data for this element
     */
    positionElement(mesh, config, index, formationData = null) {
        // Use formation data if provided, otherwise default
        const fd = formationData || { positionOffset: 0, rotationOffset: 0, progressOffset: 0 };

        // Store axis-travel data on mesh for update loop
        mesh.userData.axisTravel = {
            axis: config.axis,
            startPos: config.startPos,
            endPos: config.endPos,
            easing: config.easing,
            startScale: config.startScale,
            endScale: config.endScale,
            startDiameter: config.startDiameter,
            endDiameter: config.endDiameter,
            reverseAt: config.reverseAt,
            baseScale: mesh.userData.finalScale || mesh.scale.x,
        };

        // Store formation data
        mesh.userData.formation = {
            positionOffset: fd.positionOffset,
            rotationOffset: fd.rotationOffset,
            progressOffset: fd.progressOffset,
            scaleMultiplier: fd.scaleMultiplier ?? 1.0,
        };

        // Mark as requiring updates
        mesh.userData.spawnModeType = 'axis-travel';
        mesh.userData.requiresSpawnModeUpdate = true;

        // Set initial position at start
        this._updatePosition(mesh, 0);
    }

    /**
     * Update element position based on gesture progress
     * @param {THREE.Mesh} mesh - The mesh to update
     * @param {number} deltaTime - Time since last frame
     * @param {number} gestureProgress - Current gesture progress (0-1)
     */
    updateElement(mesh, deltaTime, gestureProgress) {
        this._updatePosition(mesh, gestureProgress);
    }

    /**
     * Internal method to update position based on progress
     * @param {THREE.Mesh} mesh - The mesh
     * @param {number} gestureProgress - Gesture progress (0-1)
     * @private
     */
    _updatePosition(mesh, gestureProgress) {
        const at = mesh.userData.axisTravel;
        const { formation } = mesh.userData;

        if (!at) return;

        // Apply formation progress offset (stagger)
        let progress = gestureProgress;
        if (formation?.progressOffset) {
            progress = Math.max(0, Math.min(1, progress - formation.progressOffset));
        }

        // Handle reverseAt for down-then-up patterns (e.g., Stargate)
        let travelProgress = progress;
        if (at.reverseAt !== null && progress > at.reverseAt) {
            // After reverseAt, travel back toward start
            const reverseProgress = (progress - at.reverseAt) / (1 - at.reverseAt);
            travelProgress = 1 - reverseProgress;
        }

        // Apply easing
        const easedProgress = at.easing(travelProgress);

        // Interpolate position on axis
        const axisPos = at.startPos + (at.endPos - at.startPos) * easedProgress;

        // Apply to appropriate axis
        switch (at.axis) {
        case 'y':
            mesh.position.y = axisPos;
            break;
        case 'x':
            mesh.position.x = axisPos;
            break;
        case 'z':
            mesh.position.z = axisPos;
            break;
        }

        // Apply formation position offset (for stacking/mandala)
        // Supports both old format (number = Y only) and new format (object with x,y,z)
        if (formation?.positionOffset) {
            const offset = formation.positionOffset;
            if (typeof offset === 'number') {
                mesh.position.y += offset;
            } else {
                mesh.position.x += offset.x || 0;
                mesh.position.y += offset.y || 0;
                mesh.position.z += offset.z || 0;
            }
        }

        // Per-element scale multiplier (for mandala/varied ring sizes)
        const scaleMultiplier = formation?.scaleMultiplier ?? 1.0;

        // Interpolate uniform scale if configured
        if (at.startScale !== at.endScale) {
            const scaleInterp = at.startScale + (at.endScale - at.startScale) * easedProgress;
            const finalScale = at.baseScale * scaleInterp * scaleMultiplier;
            mesh.scale.setScalar(finalScale);
        } else if (scaleMultiplier !== 1.0) {
            // Apply scale multiplier even without start/end scale interpolation
            const finalScale = at.baseScale * scaleMultiplier;
            mesh.scale.setScalar(finalScale);
        }

        // Interpolate diameter (XY circular face scale) for rings
        // Ring model's circular face is in XY plane, Z is thickness
        if (at.startDiameter !== at.endDiameter) {
            const diamInterp = at.startDiameter + (at.endDiameter - at.startDiameter) * easedProgress;
            // Apply diameter to X and Y (circular face) while preserving Z scale (thickness)
            const baseScale = at.baseScale * scaleMultiplier * (at.startScale !== at.endScale
                ? at.startScale + (at.endScale - at.startScale) * easedProgress
                : 1.0);
            mesh.scale.x = baseScale * diamInterp;
            mesh.scale.y = baseScale * diamInterp;
            // Z scale stays at baseScale (thickness)
            mesh.scale.z = baseScale;
        }

        // Apply formation rotation offset to shader (for spiral arc alignment)
        if (formation?.rotationOffset && mesh.material?.uniforms?.uArcPhase) {
            mesh.material.uniforms.uArcPhase.value = formation.rotationOffset;
        }
    }

    /**
     * This mode requires per-frame updates
     * @returns {boolean} Always true
     */
    requiresUpdate() {
        return true;
    }
}

export default AxisTravelMode;
