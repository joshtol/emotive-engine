/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Particle 3D Translator
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Translates 2D particle positions and behaviors to 3D world space
 * @author Emotive Engine Team
 * @module 3d/particles/Particle3DTranslator
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Bridges the gap between 2D particle system and 3D rendering:
 * ║ • Converts canvas coordinates (x, y) to 3D world space
 * ║ • Maps z-depth to actual 3D distances and orbital radii
 * ║ • Translates 2D particle behaviors to 3D vector fields
 * ║ • Handles camera-relative positioning
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * COORDINATE SYSTEM TRANSFORMATION:
 *
 * 2D Canvas Space:              3D World Space:
 * (0,0)───────► X              Y ▲
 *   │                             │
 *   │    ⭐                        │  ⭐─── X
 *   ▼                             │ /
 *   Y                             │/
 *                                 └─────► Z
 *
 * - Canvas: origin top-left, Y down
 * - World:  origin center, Y up
 * - Z-depth: -1 (far) to +1 (near) → actual radius multipliers
 */

import * as THREE from 'three';

export class Particle3DTranslator {
    constructor(options = {}) {
        // Base world scale - how large is the particle field in world units
        this.worldScale = options.worldScale || 0.2;

        // Base orbital radius around the mascot core (in world units)
        // This should match the 3D core's actual radius
        this.baseRadius = options.baseRadius || 0.15;

        // Depth scale multiplier - how much z-depth affects radius
        this.depthScale = options.depthScale || 0.75;

        // Vertical scale multiplier
        this.verticalScale = options.verticalScale || 1.0;

        // 3D core radius in world units - updated each frame from Core3DManager
        // This is the actual size of the crystal/orb that particles orbit around
        this.coreRadius3D = options.coreRadius3D || 1.0;

        // Reusable vectors for performance
        this.tempVec3 = new THREE.Vector3();
        this.tempVec3_2 = new THREE.Vector3();

        // Behavior-specific translators
        this.behaviorTranslators = this._initBehaviorTranslators();

        // Current gesture data (updated each frame)
        this.currentGestureData = null;
    }

    /**
     * Update the 3D core radius (called each frame when core scale changes)
     * This ensures particles orbit at correct distance regardless of screen size
     * @param {number} radius - Core radius in world units
     */
    setCoreRadius3D(radius) {
        this.coreRadius3D = radius;
    }

    /**
     * Update gesture state for gesture-based transformations
     * Called once per frame before translating particles
     *
     * @param {Object} rotationState - {euler: [x,y,z], quaternion: THREE.Quaternion, angularVelocity: [x,y,z]}
     * @param {number} deltaTime - Time since last frame (ms)
     * @param {Object} gestureData - Active gesture data
     */
    updateRotationState(rotationState, deltaTime, gestureData = null) {
        this.rotationState = rotationState;
        this.deltaTime = deltaTime;

        // Store current gesture data for use in translation
        this.currentGestureData = gestureData;
    }


    /**
     * Initialize behavior-specific translation functions
     * Each behavior gets custom logic for 3D positioning
     * @returns {Object} Map of behavior names to translator functions
     */
    _initBehaviorTranslators() {
        return {
            ambient: this._translateAmbient.bind(this),
            orbiting: this._translateOrbiting.bind(this),
            rising: this._translateRising.bind(this),
            falling: this._translateFalling.bind(this),  // Rain-like tears falling - spawns behind crystal
            popcorn: this._translatePopcorn.bind(this),
            burst: this._translateBurst.bind(this),
            aggressive: this._translateAggressive.bind(this),
            scattering: this._translateScattering.bind(this),
            repelling: this._translateRepelling.bind(this),
            connecting: this._translateConnecting.bind(this),
            resting: this._translateResting.bind(this),
            radiant: this._translateRadiant.bind(this),
            ascending: this._translateAscending.bind(this),
            erratic: this._translateErratic.bind(this),
            cautious: this._translateCautious.bind(this),
            surveillance: this._translateSurveillance.bind(this),
            glitchy: this._translateGlitchy.bind(this),
            spaz: this._translateSpaz.bind(this),
            directed: this._translateDirected.bind(this),
            fizzy: this._translateFizzy.bind(this),
            zen: this._translateZen.bind(this),
            gravitationalAccretion: this._translateGravitationalAccretion.bind(this)
        };
    }

    /**
     * Main translation function - converts 2D particle to 3D position with gesture override
     * @param {Object} particle - 2D particle with x, y, z, behavior
     * @param {Object} corePosition - 3D mascot position {x, y, z}
     * @param {Object} canvasSize - Canvas dimensions {width, height}
     * @returns {THREE.Vector3} 3D world position
     */
    translate2DTo3D(particle, corePosition, canvasSize) {
        // Check if rain gesture is active on this particle
        // Rain gesture takes priority over normal behavior translation
        if (particle.gestureData?.rain?.initialized) {
            return this._translateRainGesture(particle, corePosition, canvasSize);
        }

        // Get behavior-specific translation (normal emotional state position)
        const translator = this.behaviorTranslators[particle.behavior] || this._translateDefault.bind(this);
        const basePosition = translator(particle, corePosition, canvasSize);

        // Apply gesture-specific transformations
        if (this.currentGestureData && this.currentGestureData.gestureName === 'spin') {
            return this._applySpinRotation(basePosition, corePosition, this.currentGestureData.progress);
        }

        // For other gestures (like scan), the 2D particle system handles the positioning
        // We just translate those 2D positions to 3D without additional transforms
        return basePosition;
    }

    /**
     * Translate a particle that has the rain gesture active
     * The rain gesture controls the 2D Y position, we translate that to 3D
     */
    _translateRainGesture(particle, corePosition, canvasSize) {
        const centerX = canvasSize.width / 2;
        const centerY = canvasSize.height / 2;
        const rainData = particle.gestureData.rain;

        // Get the fall offset from the original position (set by rain.js apply())
        const fallOffset = particle.y - rainData.originalY;

        // Convert 2D fall to 3D fall (scale appropriately)
        const PIXEL_TO_3D = 0.004; // Same scale used elsewhere
        const fallDistance3D = fallOffset * PIXEL_TO_3D;

        // Use same uniform 3D direction as ambient
        const dir = this._getUniformDirection3D(particle);

        // Calculate base position using ORIGINAL position (before rain started)
        const dx = rainData.originalX - centerX;
        const dy = rainData.originalY - centerY;
        const distance2D = Math.sqrt(dx * dx + dy * dy);
        const normalizedDistance = distance2D / centerX;

        const minOrbit = this.coreRadius3D * 0.6;
        const maxOrbit = this.coreRadius3D * 1.2;
        const worldDistance = minOrbit + normalizedDistance * (maxOrbit - minOrbit);

        // Apply the rain gesture's fall in 3D (negative Y is down)
        return this.tempVec3.set(
            corePosition.x + dir.x * worldDistance,
            corePosition.y + dir.y * worldDistance * this.verticalScale - fallDistance3D,
            corePosition.z + dir.z * worldDistance
        );
    }

    /**
     * Apply spin rotation to particle position
     * Rotates particle around the core on Y-axis based on gesture progress
     *
     * @param {THREE.Vector3} position - Particle's base position from emotional behavior
     * @param {Object} corePosition - Mascot center {x, y, z}
     * @param {number} progress - Gesture progress (0-1)
     * @returns {THREE.Vector3} Rotated position
     */
    _applySpinRotation(position, corePosition, progress) {
        // Get position relative to core
        const relativeX = position.x - corePosition.x;
        const relativeY = position.y - corePosition.y;
        const relativeZ = position.z - corePosition.z;

        // Spin gesture rotates 360° (2π radians) around Y-axis
        // Use sin curve so rotation smoothly returns to 0 at end
        const rotationCurve = Math.sin(progress * Math.PI);
        const angle = rotationCurve * Math.PI * 2; // 0 → 2π → 0

        // Rotate around Y-axis (vertical)
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);

        const rotatedX = relativeX * cosAngle - relativeZ * sinAngle;
        const rotatedZ = relativeX * sinAngle + relativeZ * cosAngle;

        // Return rotated position in world space
        return this.tempVec3.set(
            corePosition.x + rotatedX,
            corePosition.y + relativeY, // Y unchanged (spin on Y-axis)
            corePosition.z + rotatedZ
        );
    }

    /**
     * Convert canvas coordinates to world space (basic conversion)
     * @param {number} canvasX - Canvas X coordinate
     * @param {number} canvasY - Canvas Y coordinate
     * @param {number} canvasZ - Z-depth (-1 to 1)
     * @param {number} centerX - Canvas center X
     * @param {number} centerY - Canvas center Y
     * @param {Object} corePosition - Core 3D position
     * @returns {THREE.Vector3} World space position
     */
    _canvasToWorld(canvasX, canvasY, canvasZ, centerX, centerY, corePosition) {
        // Convert to normalized coordinates (-1 to 1)
        const normalizedX = (canvasX - centerX) / centerX;
        const normalizedY = -(canvasY - centerY) / centerY; // Flip Y axis

        // Map z-depth to radius multiplier
        // z = -1 (far) → radius 0.5x
        // z = 0 (mid) → radius 1.0x
        // z = +1 (near) → radius 1.75x
        const radiusMultiplier = 1.0 + (canvasZ * this.depthScale);

        // Calculate world position
        const worldX = normalizedX * this.worldScale * radiusMultiplier + corePosition.x;
        const worldY = normalizedY * this.worldScale * this.verticalScale * radiusMultiplier + corePosition.y;
        const worldZ = canvasZ * this.worldScale * 0.5 + corePosition.z; // Z contributes to actual depth

        return this.tempVec3.set(worldX, worldY, worldZ);
    }

    /**
     * Simple deterministic hash function for better pseudo-random distribution
     * Returns value in range [0, 1)
     */
    _hash(n) {
        const x = Math.sin(n) * 43758.5453123;
        return x - Math.floor(x);
    }

    /**
     * Generate uniform random direction on sphere (360°x360°x360°)
     * Uses spherical coordinates with deterministic seeds from particle properties
     * Caches result in behaviorData.direction3D to maintain consistent trajectory
     *
     * @param {Object} particle - Particle with properties for seeding
     * @returns {Object} Normalized 3D direction vector {x, y, z}
     */
    _getUniformDirection3D(particle) {
        const behaviorData = particle.behaviorData || {};

        // Return cached direction if already generated
        if (behaviorData.direction3D) {
            return behaviorData.direction3D;
        }

        // Use particle's properties as deterministic seeds with better hash
        // Combine multiple properties for unique seeds per particle
        const baseSeed = particle.x * 127.1 + particle.y * 311.7 + (particle.vx || 0) * 74.7 + (particle.vy || 0) * 159.3;

        // Generate two uniform random values using hash function
        const u1 = this._hash(baseSeed);
        const u2 = this._hash(baseSeed + 1.0);

        // Generate uniform spherical coordinates
        // Theta (azimuth): 0 to 2π - uniform distribution
        const theta = u1 * Math.PI * 2;

        // Phi (elevation): use arccos for uniform sphere surface distribution
        // cos(phi) uniform in [-1, 1] ensures uniform surface distribution
        const cosphi = 2.0 * u2 - 1.0; // Range: -1 to +1
        const sinPhi = Math.sqrt(1.0 - cosphi * cosphi);

        // Convert spherical to Cartesian coordinates
        const x = sinPhi * Math.cos(theta);
        const y = cosphi; // Y is up
        const z = sinPhi * Math.sin(theta);

        // Cache the direction for consistent trajectory
        behaviorData.direction3D = { x, y, z };
        return behaviorData.direction3D;
    }

    /**
     * Convert Cartesian to Spherical coordinates
     * @param {number} x - World X
     * @param {number} y - World Y
     * @param {number} z - World Z
     * @param {Object} center - Sphere center
     * @returns {Object} {radius, theta, phi}
     */
    _toSpherical(x, y, z, center) {
        const dx = x - center.x;
        const dy = y - center.y;
        const dz = z - center.z;

        const radius = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const theta = Math.atan2(dz, dx); // Azimuthal angle
        const phi = Math.acos(dy / (radius || 1)); // Polar angle

        return { radius, theta, phi };
    }

    /**
     * Convert Spherical to Cartesian coordinates
     * @param {number} radius - Distance from center
     * @param {number} theta - Azimuthal angle
     * @param {number} phi - Polar angle
     * @param {Object} center - Sphere center
     * @returns {THREE.Vector3} Cartesian position
     */
    _toCartesian(radius, theta, phi, center) {
        const x = radius * Math.sin(phi) * Math.cos(theta) + center.x;
        const y = radius * Math.cos(phi) + center.y;
        const z = radius * Math.sin(phi) * Math.sin(theta) + center.z;

        return this.tempVec3_2.set(x, y, z);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // BEHAVIOR TRANSLATORS - One function per behavior
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * DEFAULT: Basic canvas-to-world conversion
     */
    _translateDefault(particle, corePosition, canvasSize) {
        return this._canvasToWorld(
            particle.x, particle.y, particle.z,
            canvasSize.width / 2, canvasSize.height / 2,
            corePosition
        );
    }

    /**
     * AMBIENT: Gentle floating in 360°x360°x360° sphere
     * Particles drift slowly around the mascot in all directions
     */
    _translateAmbient(particle, corePosition, canvasSize) {
        // Get uniform 3D direction
        const dir = this._getUniformDirection3D(particle);

        const centerX = canvasSize.width / 2;
        const centerY = canvasSize.height / 2;

        // Calculate normalized distance (0-1) from center in 2D
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const distance2D = Math.sqrt(dx * dx + dy * dy);
        const normalizedDistance = distance2D / centerX; // 0 at center, 1 at edge

        // Convert to world distance using 3D core radius
        // Neutral: particles spread out wider (0.6x to 1.2x core radius)
        const minOrbit = this.coreRadius3D * 0.6;
        const maxOrbit = this.coreRadius3D * 1.2;
        const worldDistance = minOrbit + normalizedDistance * (maxOrbit - minOrbit);

        // Add slow spiral motion based on particle age
        const spiralAngle = particle.age * 0.5;
        const spiralRadius = this.coreRadius3D * 0.03;
        const spiralX = Math.cos(spiralAngle) * spiralRadius;
        const spiralZ = Math.sin(spiralAngle) * spiralRadius;

        // Position along 3D direction with gentle drift
        return this.tempVec3.set(
            corePosition.x + dir.x * worldDistance + spiralX,
            corePosition.y + dir.y * worldDistance * this.verticalScale,
            corePosition.z + dir.z * worldDistance + spiralZ
        );
    }

    /**
     * ORBITING: Circular paths around the core in full 3D sphere
     * Each particle orbits in its own tilted plane for 360°x360°x360° coverage
     */
    _translateOrbiting(particle, corePosition, _canvasSize) {
        const behaviorData = particle.behaviorData || {};

        // Get or generate unique orbital plane for this particle
        if (!behaviorData.orbitPlane) {
            const seed1 = particle.x + particle.y * 0.5;
            const seed2 = particle.x * 0.7 + particle.y;

            behaviorData.orbitPlane = {
                inclination: ((Math.sin(seed1 * 0.1) + 1) * 0.5) * Math.PI,
                rotation: ((Math.sin(seed2 * 0.1) + 1) * 0.5) * Math.PI * 2
            };
        }

        const { inclination, rotation } = behaviorData.orbitPlane;
        const angle = behaviorData.angle || 0;
        // Love: tighter orbits (0.25x base radius)
        const radius = (behaviorData.radius || 100) * 0.01 * this.baseRadius * 0.25;

        // Depth affects orbital radius
        const radiusMultiplier = 1.0 + (particle.z * this.depthScale);
        const finalRadius = radius * radiusMultiplier;

        // Calculate position in XZ plane first
        const xFlat = Math.cos(angle) * finalRadius;
        const zFlat = Math.sin(angle) * finalRadius;

        // Rotate by inclination to tilt the orbital plane
        const cosIncl = Math.cos(inclination);
        const sinIncl = Math.sin(inclination);
        const cosRot = Math.cos(rotation);
        const sinRot = Math.sin(rotation);

        // Apply 3D rotation for diverse orbital planes
        const x = xFlat * cosRot - zFlat * cosIncl * sinRot;
        const y = zFlat * sinIncl;
        const z = xFlat * sinRot + zFlat * cosIncl * cosRot;

        return this.tempVec3.set(
            corePosition.x + x,
            corePosition.y + y * this.verticalScale,
            corePosition.z + z
        );
    }

    /**
     * RISING: Upward motion with slight swirl
     */
    _translateRising(particle, corePosition, canvasSize) {
        const pos = this._canvasToWorld(
            particle.x, particle.y, particle.z,
            canvasSize.width / 2, canvasSize.height / 2,
            corePosition
        );

        // Add upward emphasis
        const riseBoost = particle.vy * -0.01; // vy is negative for upward
        pos.y += riseBoost;

        return pos;
    }

    /**
     * FALLING: Rain-like tears falling downward (Sadness)
     * When rain gesture is active, respects the 2D particle's Y position
     * Otherwise falls based on age for ambient sad emotion
     */
    _translateFalling(particle, corePosition, canvasSize) {
        const centerX = canvasSize.width / 2;
        const centerY = canvasSize.height / 2;

        // Check if rain gesture is controlling this particle's position
        const hasRainGestureData = particle.gestureData?.rain?.initialized;

        if (hasRainGestureData) {
            // Rain gesture is active - use the 2D particle's Y position directly
            // The rain gesture has already calculated the fall, so translate that to 3D
            const rainData = particle.gestureData.rain;

            // Get the fall offset from the original position (set by rain.js apply())
            const fallOffset = particle.y - rainData.originalY;

            // Convert 2D fall to 3D fall (scale appropriately)
            const PIXEL_TO_3D = 0.004; // Same scale used elsewhere
            const fallDistance3D = fallOffset * PIXEL_TO_3D;

            // Use same uniform 3D direction as ambient
            const dir = this._getUniformDirection3D(particle);

            // Calculate base position like ambient
            const dx = rainData.originalX - centerX;
            const dy = rainData.originalY - centerY;
            const distance2D = Math.sqrt(dx * dx + dy * dy);
            const normalizedDistance = distance2D / centerX;

            const minOrbit = this.coreRadius3D * 0.6;
            const maxOrbit = this.coreRadius3D * 1.2;
            const worldDistance = minOrbit + normalizedDistance * (maxOrbit - minOrbit);

            // Apply the rain gesture's fall in 3D (negative Y is down)
            return this.tempVec3.set(
                corePosition.x + dir.x * worldDistance,
                corePosition.y + dir.y * worldDistance * this.verticalScale - fallDistance3D,
                corePosition.z + dir.z * worldDistance
            );
        }

        // No rain gesture - use age-based falling for ambient sadness
        const dir = this._getUniformDirection3D(particle);

        // Calculate normalized distance (0-1) from center in 2D - SAME AS AMBIENT
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const distance2D = Math.sqrt(dx * dx + dy * dy);
        const normalizedDistance = distance2D / centerX;

        // Convert to world distance using 3D core radius - SAME AS AMBIENT
        const minOrbit = this.coreRadius3D * 0.6;
        const maxOrbit = this.coreRadius3D * 1.2;
        const worldDistance = minOrbit + normalizedDistance * (maxOrbit - minOrbit);

        // Calculate fall distance based on age
        // fallSpeed=0.6 means particle falls 0.6x coreRadius over its ~8 second lifetime
        const fallSpeed = 0.6;
        const fallDistance = particle.age * fallSpeed * this.coreRadius3D;

        // Position along 3D direction (like ambient) but fall straight down
        return this.tempVec3.set(
            corePosition.x + dir.x * worldDistance,
            corePosition.y + dir.y * worldDistance * this.verticalScale - fallDistance,
            corePosition.z + dir.z * worldDistance
        );
    }

    /**
     * POPCORN: Explosive bursts with uniform spherical distribution (360°x360°x360°)
     * Uses uniform sphere sampling for true omnidirectional emission
     * Particles burst outward from the soul, never appearing in front of it
     */
    _translatePopcorn(particle, corePosition, canvasSize) {
        const centerX = canvasSize.width / 2;
        const centerY = canvasSize.height / 2;
        const behaviorData = particle.behaviorData || {};

        // Get or generate uniform 3D direction
        const dir = this._getUniformDirection3D(particle);

        // Before pop, position particle at the soul surface ready to burst
        if (!behaviorData.hasPopped) {
            // Position at soul edge (0.7x core radius) - visible but not overlapping
            const waitDistance = this.coreRadius3D * 0.7;
            return this.tempVec3.set(
                corePosition.x + dir.x * waitDistance,
                corePosition.y + dir.y * waitDistance * this.verticalScale,
                corePosition.z + dir.z * waitDistance
            );
        }

        // Calculate normalized distance (0-1) from center in 2D
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const distance2D = Math.sqrt(dx * dx + dy * dy);
        const normalizedDistance = Math.min(distance2D / centerX, 1.5); // Cap at 1.5x

        // Convert to world distance using 3D core radius
        // Popcorn particles burst from outside the soul (1.2x) to far out (4.0x core radius)
        const minOrbit = this.coreRadius3D * 1.2;
        const maxOrbit = this.coreRadius3D * 4.0;
        const worldDistance = minOrbit + normalizedDistance * (maxOrbit - minOrbit);

        // Position particle along its 3D direction
        return this.tempVec3.set(
            corePosition.x + dir.x * worldDistance,
            corePosition.y + dir.y * worldDistance * this.verticalScale,
            corePosition.z + dir.z * worldDistance
        );
    }

    /**
     * BURST: Radial explosion from center with uniform 3D distribution
     */
    _translateBurst(particle, corePosition, _canvasSize) {
        // Get uniform 3D direction
        const dir = this._getUniformDirection3D(particle);

        // Expand outward over lifetime (from core surface to 2x radius)
        const expansion = (1 - particle.life); // 0 to 1 as particle ages
        const radius = this.coreRadius3D * (1.0 + expansion * 1.0);

        // Position along 3D direction
        return this.tempVec3.set(
            corePosition.x + dir.x * radius,
            corePosition.y + dir.y * radius * this.verticalScale,
            corePosition.z + dir.z * radius
        );
    }

    /**
     * AGGRESSIVE: Fast chaotic motion bursting outward in 360°x360°x360° (Anger)
     * Anger particles explode from center with violent, erratic movement
     */
    _translateAggressive(particle, corePosition, canvasSize) {
        // Get uniform 3D direction for outward burst
        const dir = this._getUniformDirection3D(particle);

        const centerX = canvasSize.width / 2;
        const centerY = canvasSize.height / 2;

        // Calculate normalized distance (0-1) from center in 2D
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const distance2D = Math.sqrt(dx * dx + dy * dy);
        const normalizedDistance = distance2D / centerX;

        // Convert to world distance using 3D core radius - tight (0.3x to 0.55x)
        const minOrbit = this.coreRadius3D * 0.3;
        const maxOrbit = this.coreRadius3D * 0.55;
        const worldDistance = minOrbit + normalizedDistance * (maxOrbit - minOrbit);

        // Position along 3D direction with chaotic jitter (scaled to core size)
        const jitterScale = this.coreRadius3D * 0.04;
        const jitterX = Math.sin(particle.age * 10 + particle.x * 0.1) * jitterScale;
        const jitterY = Math.cos(particle.age * 12 + particle.y * 0.1) * jitterScale;
        const jitterZ = Math.sin(particle.age * 8 + particle.vx * 0.1) * jitterScale;

        return this.tempVec3.set(
            corePosition.x + dir.x * worldDistance + jitterX,
            corePosition.y + dir.y * worldDistance * this.verticalScale + jitterY,
            corePosition.z + dir.z * worldDistance + jitterZ
        );
    }

    /**
     * SCATTERING: Dispersing outward in all directions with uniform 3D distribution (Fear)
     */
    _translateScattering(particle, corePosition, _canvasSize) {
        // Get uniform 3D direction
        const dir = this._getUniformDirection3D(particle);

        // Scatter outward based on particle age - tight (0.3x to 0.6x)
        const scatterAmount = Math.min(particle.age * 0.8, 1.0);
        const scatterRadius = this.coreRadius3D * (0.3 + scatterAmount * 0.3);

        // Position along 3D direction
        return this.tempVec3.set(
            corePosition.x + dir.x * scatterRadius,
            corePosition.y + dir.y * scatterRadius * this.verticalScale,
            corePosition.z + dir.z * scatterRadius
        );
    }

    /**
     * REPELLING: Push away from core with uniform 3D distribution (Disgust)
     */
    _translateRepelling(particle, corePosition, _canvasSize) {
        // Get uniform 3D direction
        const dir = this._getUniformDirection3D(particle);

        // Repel outward based on particle age - tight around core (0.3x to 0.6x)
        const repelStrength = Math.min(particle.age * 0.6, 1.0);
        const repelRadius = this.coreRadius3D * (0.3 + repelStrength * 0.3);

        // Position along 3D direction
        return this.tempVec3.set(
            corePosition.x + dir.x * repelRadius,
            corePosition.y + dir.y * repelRadius * this.verticalScale,
            corePosition.z + dir.z * repelRadius
        );
    }

    /**
     * CONNECTING: Draw toward core (magnetic attraction)
     */
    _translateConnecting(particle, corePosition, canvasSize) {
        const pos = this._canvasToWorld(
            particle.x, particle.y, particle.z,
            canvasSize.width / 2, canvasSize.height / 2,
            corePosition
        );

        // Pull toward core based on life
        const pullStrength = (1 - particle.life) * 0.3;
        const direction = this.tempVec3_2.set(
            corePosition.x - pos.x,
            corePosition.y - pos.y,
            corePosition.z - pos.z
        ).normalize();

        pos.add(direction.multiplyScalar(pullStrength));

        return pos;
    }

    /**
     * RESTING: Minimal movement in 360°x360°x360° sphere
     * Particles float gently around the mascot with subtle breathing motion
     */
    _translateResting(particle, corePosition, canvasSize) {
        // Get uniform 3D direction
        const dir = this._getUniformDirection3D(particle);

        const centerX = canvasSize.width / 2;
        const centerY = canvasSize.height / 2;

        // Calculate normalized distance (0-1) from center in 2D
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const distance2D = Math.sqrt(dx * dx + dy * dy);
        const normalizedDistance = distance2D / centerX;

        // Convert to world distance using 3D core radius - tight (0.25x to 0.45x)
        const minOrbit = this.coreRadius3D * 0.25;
        const maxOrbit = this.coreRadius3D * 0.45;
        const worldDistance = minOrbit + normalizedDistance * (maxOrbit - minOrbit);

        // Add very subtle breathing motion (scaled to core size)
        const breathPhase = particle.age * 0.3;
        const breathOffset = Math.sin(breathPhase) * this.coreRadius3D * 0.01;

        // Position along 3D direction with gentle breathing
        return this.tempVec3.set(
            corePosition.x + dir.x * worldDistance,
            corePosition.y + dir.y * worldDistance * this.verticalScale + breathOffset,
            corePosition.z + dir.z * worldDistance
        );
    }

    /**
     * RADIANT: Expanding glow from center with uniform 3D distribution
     */
    _translateRadiant(particle, corePosition, _canvasSize) {
        // Get uniform 3D direction
        const dir = this._getUniformDirection3D(particle);

        // Expand outward uniformly (from core to 1.8x radius)
        const expansion = 1 - particle.life; // 0 to 1 as particle ages
        const radius = this.coreRadius3D * (1.0 + expansion * 0.8);

        // Position along 3D direction
        return this.tempVec3.set(
            corePosition.x + dir.x * radius,
            corePosition.y + dir.y * radius * this.verticalScale,
            corePosition.z + dir.z * radius
        );
    }

    /**
     * ASCENDING: Spiral upward in helical path
     */
    _translateAscending(particle, corePosition, _canvasSize) {
        const behaviorData = particle.behaviorData || {};

        // Helical motion parameters (scaled to core size)
        const angle = (behaviorData.spiralAngle || 0);
        const radius = (behaviorData.spiralRadius || 50) * 0.01 * this.coreRadius3D;
        const height = particle.age * this.coreRadius3D * 0.5;

        // Create helix
        const x = Math.cos(angle) * radius + corePosition.x;
        const y = height + corePosition.y;
        const z = Math.sin(angle) * radius + corePosition.z;

        return this.tempVec3.set(x, y, z);
    }

    /**
     * ERRATIC: Random jittery motion with noise
     */
    _translateErratic(particle, corePosition, canvasSize) {
        const pos = this._canvasToWorld(
            particle.x, particle.y, particle.z,
            canvasSize.width / 2, canvasSize.height / 2,
            corePosition
        );

        // Add 3D noise
        const noiseScale = 0.1;
        const time = particle.age * 10;
        pos.x += Math.sin(time * 1.1) * noiseScale;
        pos.y += Math.cos(time * 1.3) * noiseScale;
        pos.z += Math.sin(time * 1.7) * noiseScale;

        return pos;
    }

    /**
     * CAUTIOUS: Slow deliberate movement
     */
    _translateCautious(particle, corePosition, canvasSize) {
        // Similar to ambient but slower
        return this._translateAmbient(particle, corePosition, canvasSize);
    }

    /**
     * SURVEILLANCE: Tracking/scanning motion in full 3D sphere
     * Particles orbit and scan like searchlights covering all angles
     * Uses same technique as zen/ambient for consistent 3D distribution
     */
    _translateSurveillance(particle, corePosition, _canvasSize) {
        // Get uniform 3D direction (uses x,y as seeds but results in sphere distribution)
        const dir = this._getUniformDirection3D(particle);

        // Surveillance particles orbit slowly in their own tilted plane
        const orbitAngle = particle.age * 0.5;
        const radius = this.coreRadius3D * 1.2;

        // Create perpendicular vector for rotation plane (same as zen)
        const up = { x: 0, y: 1, z: 0 };
        const perp = {
            x: dir.y * up.z - dir.z * up.y,
            y: dir.z * up.x - dir.x * up.z,
            z: dir.x * up.y - dir.y * up.x
        };

        // Normalize perpendicular vector
        const perpMag = Math.sqrt(perp.x * perp.x + perp.y * perp.y + perp.z * perp.z);
        if (perpMag > 0) {
            perp.x /= perpMag;
            perp.y /= perpMag;
            perp.z /= perpMag;
        }

        // Orbit in 3D plane defined by dir and perp
        const orbitX = Math.cos(orbitAngle) * dir.x + Math.sin(orbitAngle) * perp.x;
        const orbitY = Math.cos(orbitAngle) * dir.y + Math.sin(orbitAngle) * perp.y;
        const orbitZ = Math.cos(orbitAngle) * dir.z + Math.sin(orbitAngle) * perp.z;

        return this.tempVec3.set(
            corePosition.x + orbitX * radius,
            corePosition.y + orbitY * radius * this.verticalScale,
            corePosition.z + orbitZ * radius
        );
    }

    /**
     * GLITCHY: Digital artifact effect with teleportation
     */
    _translateGlitchy(particle, corePosition, canvasSize) {
        const pos = this._canvasToWorld(
            particle.x, particle.y, particle.z,
            canvasSize.width / 2, canvasSize.height / 2,
            corePosition
        );

        // Random glitch jumps
        const glitchPhase = Math.floor(particle.age * 10);
        if (glitchPhase % 3 === 0) {
            pos.x += (Math.random() - 0.5) * 0.3;
            pos.y += (Math.random() - 0.5) * 0.3;
            pos.z += (Math.random() - 0.5) * 0.3;
        }

        return pos;
    }

    /**
     * SPAZ: High-energy chaotic turbulence
     */
    _translateSpaz(particle, corePosition, canvasSize) {
        const pos = this._canvasToWorld(
            particle.x, particle.y, particle.z,
            canvasSize.width / 2, canvasSize.height / 2,
            corePosition
        );

        // Intense turbulence
        const turbulence = 0.15;
        const time = particle.age * 20;
        pos.x += Math.sin(time * 2.1) * turbulence;
        pos.y += Math.cos(time * 2.3) * turbulence;
        pos.z += Math.sin(time * 2.7) * turbulence;

        return pos;
    }

    /**
     * DIRECTED: Moves toward specific target, or emits uniformly in 360°x360°x360° if no target
     * Focused attention that can lock onto targets or scan in all directions
     */
    _translateDirected(particle, corePosition, canvasSize) {
        const behaviorData = particle.behaviorData || {};

        // If target is specified, move toward it
        if (behaviorData.targetX !== undefined && behaviorData.targetY !== undefined) {
            const targetPos = this._canvasToWorld(
                behaviorData.targetX,
                behaviorData.targetY,
                particle.z,
                canvasSize.width / 2,
                canvasSize.height / 2,
                corePosition
            );

            const currentPos = this._canvasToWorld(
                particle.x, particle.y, particle.z,
                canvasSize.width / 2, canvasSize.height / 2,
                corePosition
            );

            // Lerp toward target
            const progress = 1 - particle.life;
            return this.tempVec3.lerpVectors(currentPos, targetPos, progress);
        }

        // No target: emit uniformly in all directions like focused beams
        const dir = this._getUniformDirection3D(particle);

        const centerX = canvasSize.width / 2;
        const centerY = canvasSize.height / 2;

        // Calculate normalized distance (0-1) from center in 2D
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const distance2D = Math.sqrt(dx * dx + dy * dy);
        const normalizedDistance = distance2D / centerX;

        // Convert to world distance using 3D core radius
        const minOrbit = this.coreRadius3D * 1.0;
        const maxOrbit = this.coreRadius3D * 1.6;
        const worldDistance = minOrbit + normalizedDistance * (maxOrbit - minOrbit);

        // Position along 3D direction - focused beams radiating outward
        return this.tempVec3.set(
            corePosition.x + dir.x * worldDistance,
            corePosition.y + dir.y * worldDistance * this.verticalScale,
            corePosition.z + dir.z * worldDistance
        );
    }

    /**
     * FIZZY: Bubbly upward motion like champagne
     */
    _translateFizzy(particle, corePosition, canvasSize) {
        const pos = this._canvasToWorld(
            particle.x, particle.y, particle.z,
            canvasSize.width / 2, canvasSize.height / 2,
            corePosition
        );

        // Add fizzy bubble motion
        const bubbleWobble = Math.sin(particle.age * 8) * 0.05;
        pos.x += bubbleWobble;
        pos.z += Math.cos(particle.age * 8) * 0.05;

        // Emphasize upward motion
        pos.y += particle.age * 0.5;

        return pos;
    }

    /**
     * ZEN: Meditative slow drift
     */
    _translateZen(particle, corePosition, _canvasSize) {
        // Get uniform 3D direction for orbital plane
        const dir = this._getUniformDirection3D(particle);

        // Zen particles orbit slowly in their own plane
        const zenAngle = particle.age * 0.2;
        const zenRadius = this.coreRadius3D * 1.4;

        // Create perpendicular vector for rotation plane
        // Use cross product to get perpendicular direction
        const up = { x: 0, y: 1, z: 0 };
        const perp = {
            x: dir.y * up.z - dir.z * up.y,
            y: dir.z * up.x - dir.x * up.z,
            z: dir.x * up.y - dir.y * up.x
        };

        // Normalize perpendicular vector
        const perpMag = Math.sqrt(perp.x * perp.x + perp.y * perp.y + perp.z * perp.z);
        if (perpMag > 0) {
            perp.x /= perpMag;
            perp.y /= perpMag;
            perp.z /= perpMag;
        }

        // Orbit in 3D plane defined by dir and perp
        const orbitX = Math.cos(zenAngle) * dir.x + Math.sin(zenAngle) * perp.x;
        const orbitY = Math.cos(zenAngle) * dir.y + Math.sin(zenAngle) * perp.y;
        const orbitZ = Math.cos(zenAngle) * dir.z + Math.sin(zenAngle) * perp.z;

        return this.tempVec3.set(
            corePosition.x + orbitX * zenRadius,
            corePosition.y + orbitY * zenRadius * this.verticalScale,
            corePosition.z + orbitZ * zenRadius
        );
    }

    /**
     * GRAVITATIONAL ACCRETION: Black hole accretion disk with spaghettification
     *
     * NASA M87* Supermassive Black Hole Physics:
     * - Keplerian orbits: tangential velocity increases as radius decreases
     * - Orbital decay: friction dissipates angular momentum, particles spiral inward
     * - Tidal stretching (spaghettification): starts at 2.5x, dramatic at 1.5x, death at 1.0x
     * - Accretion disk: particles orbit in equatorial plane with small vertical wobble
     *
     * @param {Object} particle - 2D particle with physics state
     * @param {Object} corePosition - Black hole center position
     * @param {Object} canvasSize - Canvas dimensions (unused for black hole)
     * @returns {THREE.Vector3} 3D position in accretion disk
     */
    _translateGravitationalAccretion(particle, corePosition, _canvasSize) {
        const behaviorData = particle.behaviorData || {};
        const SCHWARZSCHILD_RADIUS = 0.25; // Base radius from BlackHole.js

        // Initialize orbital parameters on first call
        if (!behaviorData.orbitRadius) {
            // Spawn particles between ISCO (2.5x) and outer disk (8x)
            const _seed = particle.x * 0.1 + particle.y * 0.2; // Reserved for future seeded randomness
            behaviorData.orbitRadius = SCHWARZSCHILD_RADIUS * (2.5 + Math.random() * 5.5);

            // Only spawn particles in back hemisphere (away from camera on +Z axis)
            // Camera is at (0, 0, +Z) looking at origin, so particles should have negative Z
            // z = sin(angle) * radius, so negative Z means: π < angle < 2π
            // Angle range: π to 2π (180° to 360°, back half of orbit)
            behaviorData.orbitAngle = Math.PI + Math.random() * Math.PI;

            // Each particle gets slight inclination offset (thin disk, not perfectly flat)
            behaviorData.diskInclination = (Math.random() - 0.5) * 0.1; // ±5.7 degrees

            // Keplerian velocity: v ∝ 1/sqrt(r)
            behaviorData.angularVelocity = 0.5 / Math.sqrt(behaviorData.orbitRadius / SCHWARZSCHILD_RADIUS);

            // Tidal stretching factor (increases as radius decreases)
            behaviorData.tidalStretch = { x: 1.0, y: 1.0, z: 1.0 };
        }

        // Orbital decay: friction reduces angular momentum
        const decayRate = 0.0001; // Slow inward spiral
        behaviorData.orbitRadius -= decayRate * this.baseRadius;

        // Update angular velocity as radius changes (Kepler's 3rd law)
        behaviorData.angularVelocity = 0.5 / Math.sqrt(behaviorData.orbitRadius / SCHWARZSCHILD_RADIUS);

        // Advance orbital angle
        behaviorData.orbitAngle += behaviorData.angularVelocity * (this.deltaTime || 16) * 0.001;

        // Normalize angle to 0-2π range
        behaviorData.orbitAngle = behaviorData.orbitAngle % (Math.PI * 2);
        if (behaviorData.orbitAngle < 0) behaviorData.orbitAngle += Math.PI * 2;

        // Kill particles that orbit into front hemisphere (in front of black hole)
        // Camera is at +Z, so front hemisphere is when z = sin(angle) * radius > 0
        // This occurs when 0 < angle < π (0° to 180°)
        // Keep particles only in back hemisphere: π < angle < 2π (180° to 360°)
        if (behaviorData.orbitAngle < Math.PI) {
            // Particle orbited into front hemisphere - fade out and respawn
            particle.isAlive = false;
            particle.life = 0;
            return this.tempVec3.set(corePosition.x, corePosition.y, corePosition.z);
        }

        // Calculate tidal stretching (spaghettification)
        const radiusRatio = behaviorData.orbitRadius / SCHWARZSCHILD_RADIUS;

        if (radiusRatio <= 1.0) {
            // Particle crossed event horizon - mark for death
            particle.isAlive = false;
            particle.life = 0;
        } else if (radiusRatio <= 1.5) {
            // Dramatic stretching at photon sphere (1.5x)
            behaviorData.tidalStretch.x = 0.3; // Compressed horizontally
            behaviorData.tidalStretch.y = 3.0; // Stretched radially (toward black hole)
            behaviorData.tidalStretch.z = 0.3; // Compressed horizontally
        } else if (radiusRatio <= 2.5) {
            // Start stretching at ISCO (2.5x)
            const stretchFactor = (2.5 - radiusRatio) / 1.0; // 0 to 1 as we approach photon sphere
            behaviorData.tidalStretch.x = 1.0 - stretchFactor * 0.7; // Compress to 0.3
            behaviorData.tidalStretch.y = 1.0 + stretchFactor * 2.0; // Stretch to 3.0
            behaviorData.tidalStretch.z = 1.0 - stretchFactor * 0.7; // Compress to 0.3
        } else {
            // Outer disk - minimal tidal forces
            behaviorData.tidalStretch.x = 1.0;
            behaviorData.tidalStretch.y = 1.0;
            behaviorData.tidalStretch.z = 1.0;
        }

        // Position in accretion disk (equatorial plane)
        const x = Math.cos(behaviorData.orbitAngle) * behaviorData.orbitRadius;
        const z = Math.sin(behaviorData.orbitAngle) * behaviorData.orbitRadius;

        // Small vertical wobble (thin disk, not perfectly flat)
        const diskThickness = SCHWARZSCHILD_RADIUS * 0.1;
        const y = Math.sin(behaviorData.orbitAngle * 3 + particle.x) * diskThickness * Math.sin(behaviorData.diskInclination);

        // Apply tidal stretching to position (visual spaghettification effect)
        const stretchedX = x * behaviorData.tidalStretch.x;
        const stretchedY = y * behaviorData.tidalStretch.y;
        const stretchedZ = z * behaviorData.tidalStretch.z;

        // Scale to match black hole group scale (0.5 / (8 * SCHWARZSCHILD_RADIUS))
        const blackHoleScale = 0.5 / (SCHWARZSCHILD_RADIUS * 8.0);

        return this.tempVec3.set(
            corePosition.x + stretchedX * blackHoleScale,
            corePosition.y + stretchedY * blackHoleScale,
            corePosition.z + stretchedZ * blackHoleScale
        );
    }

    /**
     * Update world scale (for responsive sizing)
     * @param {number} scale - New world scale
     */
    setWorldScale(scale) {
        this.worldScale = scale;
    }

    /**
     * Update base radius (for different core sizes)
     * @param {number} radius - New base radius
     */
    setBaseRadius(radius) {
        this.baseRadius = radius;
    }

    /**
     * Clean up cached particle state data
     * Call this periodically or when particles are removed to prevent memory leaks
     * @param {Array} particles - Array of particles to clean up
     */
    cleanupParticleCaches(particles) {
        for (const particle of particles) {
            if (!particle.isAlive && particle.behaviorData) {
                // Clear cached 3D direction
                if (particle.behaviorData.direction3D) {
                    particle.behaviorData.direction3D = null;
                }
                // Clear orbital plane data
                if (particle.behaviorData.orbitPlane) {
                    particle.behaviorData.orbitPlane = null;
                }
                // Clear orbital path data
                if (particle.behaviorData.orbitPath) {
                    particle.behaviorData.orbitPath = null;
                }
                // Clear black hole accretion data
                if (particle.behaviorData.orbitRadius) {
                    particle.behaviorData.orbitRadius = null;
                    particle.behaviorData.orbitAngle = null;
                    particle.behaviorData.diskInclination = null;
                    particle.behaviorData.angularVelocity = null;
                    particle.behaviorData.tidalStretch = null;
                }
            }
        }
    }

    /**
     * Dispose of resources and clear references
     */
    dispose() {
        this.tempVec3 = null;
        this.tempVec3_2 = null;
        this.rotationState = null;
        this.currentGestureData = null;
    }
}

export default Particle3DTranslator;
