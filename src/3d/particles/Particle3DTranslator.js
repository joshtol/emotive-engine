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
        this.worldScale = options.worldScale || 2.0;

        // Base orbital radius around the mascot core
        this.baseRadius = options.baseRadius || 1.5;

        // Depth scale multiplier - how much z-depth affects radius
        this.depthScale = options.depthScale || 0.75;

        // Vertical scale multiplier
        this.verticalScale = options.verticalScale || 1.0;

        // Reusable vectors for performance
        this.tempVec3 = new THREE.Vector3();
        this.tempVec3_2 = new THREE.Vector3();

        // Behavior-specific translators
        this.behaviorTranslators = this._initBehaviorTranslators();

        // Current gesture data (updated each frame)
        this.currentGestureData = null;
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
            falling: this._translateFalling.bind(this),
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
            zen: this._translateZen.bind(this)
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

        // Use particle's properties as deterministic seeds
        const seed1 = particle.x + particle.y + particle.vx * 100;
        const seed2 = particle.x * particle.y + particle.vy * 100;
        const seed3 = particle.vx + particle.vy + particle.x * 0.1;

        // Generate uniform spherical coordinates
        // Theta (azimuth): 0 to 2π (horizontal rotation)
        const theta = ((Math.sin(seed1 * 0.1) + 1) * 0.5) * Math.PI * 2;

        // Phi (elevation): using cos for uniform distribution
        // cos(phi) uniform in [-1, 1] ensures uniform surface distribution
        const cosphi = Math.sin(seed2 * 0.1); // Range: -1 to +1
        const phi = Math.acos(cosphi);

        // Additional rotation for more randomness
        const rotation = Math.sin(seed3 * 0.1) * Math.PI * 2;

        // Convert spherical to Cartesian coordinates
        const sinPhi = Math.sin(phi);
        const x = sinPhi * Math.cos(theta + rotation);
        const y = sinPhi * Math.sin(theta + rotation);
        const z = cosphi;

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

        // Calculate distance from center in 2D
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const distance2D = Math.sqrt(dx * dx + dy * dy);
        const worldDistance = (distance2D / centerX) * this.worldScale * this.baseRadius * 0.8;

        // Add slow spiral motion based on particle age
        const spiralAngle = particle.age * 0.5;
        const spiralRadius = 0.05;
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
    _translateOrbiting(particle, corePosition, canvasSize) {
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
        const radius = (behaviorData.radius || 100) * 0.01 * this.baseRadius;

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
     * FALLING: Tears falling in 360°x360°x360° sphere with downward bias
     * Particles spawn in all directions but fall downward (sadness tears)
     */
    _translateFalling(particle, corePosition, canvasSize) {
        // Get uniform 3D direction for spawn position
        const dir = this._getUniformDirection3D(particle);

        const centerX = canvasSize.width / 2;
        const centerY = canvasSize.height / 2;

        // Calculate distance from center in 2D
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const distance2D = Math.sqrt(dx * dx + dy * dy);
        const worldDistance = (distance2D / centerX) * this.worldScale * this.baseRadius * 0.7;

        // Position along 3D direction
        const baseX = corePosition.x + dir.x * worldDistance;
        const baseY = corePosition.y + dir.y * worldDistance * this.verticalScale;
        const baseZ = corePosition.z + dir.z * worldDistance;

        // Add downward fall based on particle age (gravity effect)
        const fallAmount = particle.age * 0.3;

        return this.tempVec3.set(baseX, baseY - fallAmount, baseZ);
    }

    /**
     * POPCORN: Explosive bursts with uniform spherical distribution (360°x360°x360°)
     * Uses uniform sphere sampling for true omnidirectional emission
     */
    _translatePopcorn(particle, corePosition, canvasSize) {
        const centerX = canvasSize.width / 2;
        const centerY = canvasSize.height / 2;
        const behaviorData = particle.behaviorData || {};

        // Before pop, position particle slightly in front of origin so it's visible
        // (at origin with camera at z=1.2, particles would be nearly invisible during fade-in)
        if (!behaviorData.hasPopped) {
            // Get or generate the direction the particle will travel when it pops
            const dir = this._getUniformDirection3D(particle);

            // Position slightly away from center (0.05 world units) so particles are visible while waiting
            const waitDistance = this.baseRadius * 0.05;
            return this.tempVec3.set(
                corePosition.x + dir.x * waitDistance,
                corePosition.y + dir.y * waitDistance * this.verticalScale,
                corePosition.z + dir.z * waitDistance
            );
        }

        // Get or generate uniform 3D direction
        const dir = this._getUniformDirection3D(particle);

        // Calculate distance traveled based on 2D position from center
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const distance2D = Math.sqrt(dx * dx + dy * dy);

        // Convert 2D distance to world units (scale down for less chaos)
        const worldDistance = (distance2D / centerX) * this.worldScale * this.baseRadius * 0.5;

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
    _translateBurst(particle, corePosition, canvasSize) {
        // Get uniform 3D direction
        const dir = this._getUniformDirection3D(particle);

        // Expand outward over lifetime
        const outwardSpeed = 2;
        const expansion = (1 - particle.life) * outwardSpeed * 0.5;
        const radius = this.baseRadius * expansion;

        // Position along 3D direction
        return this.tempVec3.set(
            corePosition.x + dir.x * radius,
            corePosition.y + dir.y * radius * this.verticalScale,
            corePosition.z + dir.z * radius
        );
    }

    /**
     * AGGRESSIVE: Fast chaotic motion bursting outward in 360°x360°x360°
     * Anger particles explode from center with violent, erratic movement
     */
    _translateAggressive(particle, corePosition, canvasSize) {
        // Get uniform 3D direction for outward burst
        const dir = this._getUniformDirection3D(particle);

        const centerX = canvasSize.width / 2;
        const centerY = canvasSize.height / 2;

        // Calculate distance from center in 2D
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const distance2D = Math.sqrt(dx * dx + dy * dy);
        const worldDistance = (distance2D / centerX) * this.worldScale * this.baseRadius;

        // Position along 3D direction with chaotic jitter
        const jitterScale = 0.08; // Strong chaotic movement
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
     * SCATTERING: Dispersing outward in all directions with uniform 3D distribution
     */
    _translateScattering(particle, corePosition, canvasSize) {
        // Get uniform 3D direction
        const dir = this._getUniformDirection3D(particle);

        // Scatter outward based on particle age
        const scatterAmount = particle.age * 2;
        const scatterRadius = this.baseRadius * scatterAmount;

        // Position along 3D direction
        return this.tempVec3.set(
            corePosition.x + dir.x * scatterRadius,
            corePosition.y + dir.y * scatterRadius * this.verticalScale,
            corePosition.z + dir.z * scatterRadius
        );
    }

    /**
     * REPELLING: Push away from core with uniform 3D distribution
     */
    _translateRepelling(particle, corePosition, canvasSize) {
        // Get uniform 3D direction
        const dir = this._getUniformDirection3D(particle);

        // Repel outward based on particle age
        const repelStrength = particle.age * 1.5;
        const repelRadius = this.baseRadius * repelStrength;

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

        // Calculate distance from center in 2D
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const distance2D = Math.sqrt(dx * dx + dy * dy);
        const worldDistance = (distance2D / centerX) * this.worldScale * this.baseRadius * 0.75;

        // Add very subtle breathing motion
        const breathPhase = particle.age * 0.3;
        const breathOffset = Math.sin(breathPhase) * 0.02;

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
    _translateRadiant(particle, corePosition, canvasSize) {
        // Get uniform 3D direction
        const dir = this._getUniformDirection3D(particle);

        // Expand outward uniformly
        const expansion = 0.5;
        const radius = this.baseRadius * expansion * (1 - particle.life);

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
    _translateAscending(particle, corePosition, canvasSize) {
        const behaviorData = particle.behaviorData || {};

        // Helical motion parameters
        const angle = (behaviorData.spiralAngle || 0);
        const radius = (behaviorData.spiralRadius || 50) * 0.01 * this.baseRadius;
        const height = particle.age * this.verticalScale;

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
     */
    _translateSurveillance(particle, corePosition, canvasSize) {
        const behaviorData = particle.behaviorData || {};

        // Get or generate unique orbital path for this particle
        if (!behaviorData.orbitPath) {
            // Each particle gets a unique orbital plane using its properties as seeds
            const seed1 = particle.x + particle.y * 0.7;
            const seed2 = particle.x * 0.3 + particle.y;

            // Generate inclination and orientation for orbital plane
            behaviorData.orbitPath = {
                inclination: ((Math.sin(seed1 * 0.1) + 1) * 0.5) * Math.PI, // 0 to PI
                orientation: ((Math.sin(seed2 * 0.1) + 1) * 0.5) * Math.PI * 2  // 0 to 2PI
            };
        }

        const { inclination, orientation } = behaviorData.orbitPath;
        const radius = this.baseRadius * 1.2;

        // Orbit angle progresses with particle age
        const orbitAngle = particle.age * 0.5 + orientation;

        // Calculate position on tilted orbital plane
        // First, position in XZ plane
        const x = Math.cos(orbitAngle) * radius;
        const z = Math.sin(orbitAngle) * radius;

        // Then rotate by inclination to create 3D orbital paths
        const cosIncl = Math.cos(inclination);
        const sinIncl = Math.sin(inclination);

        const x3d = x;
        const y3d = z * sinIncl;  // Vertical component from tilt
        const z3d = z * cosIncl;  // Depth component from tilt

        return this.tempVec3.set(
            corePosition.x + x3d,
            corePosition.y + y3d * this.verticalScale,
            corePosition.z + z3d
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

        // Calculate distance from center in 2D (or use age for steady outward motion)
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const distance2D = Math.sqrt(dx * dx + dy * dy);
        const worldDistance = (distance2D / centerX) * this.worldScale * this.baseRadius * 0.6;

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
    _translateZen(particle, corePosition, canvasSize) {
        // Get uniform 3D direction for orbital plane
        const dir = this._getUniformDirection3D(particle);

        // Zen particles orbit slowly in their own plane
        const zenAngle = particle.age * 0.2;
        const zenRadius = this.baseRadius * 0.7;

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
