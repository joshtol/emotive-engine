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
     * Main translation function - converts 2D particle to 3D position
     * @param {Object} particle - 2D particle with x, y, z, behavior
     * @param {Object} corePosition - 3D mascot position {x, y, z}
     * @param {Object} canvasSize - Canvas dimensions {width, height}
     * @returns {THREE.Vector3} 3D world position
     */
    translate2DTo3D(particle, corePosition, canvasSize) {
        // Get behavior-specific translation
        const translator = this.behaviorTranslators[particle.behavior] || this._translateDefault.bind(this);

        // Call the appropriate translator
        return translator(particle, corePosition, canvasSize);
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
     * AMBIENT: Gentle upward drift in 3D space
     * Particles slowly rise and orbit
     */
    _translateAmbient(particle, corePosition, canvasSize) {
        const centerX = canvasSize.width / 2;
        const centerY = canvasSize.height / 2;

        // Base position
        const pos = this._canvasToWorld(
            particle.x, particle.y, particle.z,
            centerX, centerY, corePosition
        );

        // Add slow spiral motion based on particle age
        const spiralAngle = particle.age * 0.5;
        const spiralRadius = 0.05;
        pos.x += Math.cos(spiralAngle) * spiralRadius;
        pos.z += Math.sin(spiralAngle) * spiralRadius;

        return pos;
    }

    /**
     * ORBITING: Circular paths around the core in 3D
     * Uses spherical coordinates for true orbital motion
     */
    _translateOrbiting(particle, corePosition, canvasSize) {
        const behaviorData = particle.behaviorData || {};

        // Get orbital parameters
        const angle = behaviorData.angle || 0;
        const radius = (behaviorData.radius || 100) * 0.01 * this.baseRadius;
        const verticalOffset = behaviorData.verticalOffset || 0;

        // Depth affects orbital radius
        const radiusMultiplier = 1.0 + (particle.z * this.depthScale);
        const finalRadius = radius * radiusMultiplier;

        // Calculate orbital position
        // Orbit in XZ plane with Y offset
        const x = Math.cos(angle) * finalRadius + corePosition.x;
        const y = verticalOffset * 0.01 * this.verticalScale + corePosition.y;
        const z = Math.sin(angle) * finalRadius + corePosition.z;

        return this.tempVec3.set(x, y, z);
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
     * FALLING: Downward motion with gravity
     */
    _translateFalling(particle, corePosition, canvasSize) {
        const pos = this._canvasToWorld(
            particle.x, particle.y, particle.z,
            canvasSize.width / 2, canvasSize.height / 2,
            corePosition
        );

        // Add downward emphasis
        const fallBoost = particle.vy * 0.01; // vy is positive for downward
        pos.y -= fallBoost;

        return pos;
    }

    /**
     * POPCORN: Explosive bursts with random trajectories
     * Uses particle's 2D canvas position (x, y) and converts to 3D with synthesized Z
     */
    _translatePopcorn(particle, corePosition, canvasSize) {
        const centerX = canvasSize.width / 2;
        const centerY = canvasSize.height / 2;

        // Get base 3D position from 2D canvas coordinates
        const pos = this._canvasToWorld(
            particle.x,
            particle.y,
            particle.z,
            centerX,
            centerY,
            corePosition
        );

        // Synthesize Z-axis movement from 2D velocity to create true 3D distribution
        // Use particle's velocity direction to determine Z trajectory
        const behaviorData = particle.behaviorData || {};

        if (behaviorData.hasPopped) {
            // After pop, particles should spread in all directions including Z
            // Use the particle's horizontal velocity magnitude to drive Z variation
            const velocityMagnitude = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);

            // Create Z-axis component based on velocity and a pseudo-random offset
            // Use particle's initial position as seed for consistent Z direction
            const zSeed = (particle.x + particle.y) % 100;
            const zDirection = (zSeed / 50) - 1; // Range: -1 to +1

            // Scale Z offset by velocity magnitude and lifetime
            const lifetimeProgress = 1 - particle.life;
            const zOffset = zDirection * velocityMagnitude * 0.02 * lifetimeProgress * this.baseRadius;

            pos.z += zOffset;
        }

        return pos;
    }

    /**
     * BURST: Radial explosion from center
     */
    _translateBurst(particle, corePosition, canvasSize) {
        const behaviorData = particle.behaviorData || {};
        const angle = behaviorData.angle || 0;
        const outwardSpeed = behaviorData.outwardSpeed || 2;

        // Expand outward over lifetime
        const expansion = (1 - particle.life) * outwardSpeed * 0.5;

        // Use spherical distribution
        const phi = behaviorData.phi || Math.PI / 2;
        const radius = this.baseRadius * expansion;

        return this._toCartesian(radius, angle, phi, corePosition);
    }

    /**
     * AGGRESSIVE: Fast chaotic motion in 3D
     */
    _translateAggressive(particle, corePosition, canvasSize) {
        const pos = this._canvasToWorld(
            particle.x, particle.y, particle.z,
            canvasSize.width / 2, canvasSize.height / 2,
            corePosition
        );

        // Add jitter based on velocity
        const jitterScale = 0.02;
        pos.x += particle.vx * jitterScale;
        pos.y -= particle.vy * jitterScale;
        pos.z += (particle.vx + particle.vy) * 0.5 * jitterScale;

        return pos;
    }

    /**
     * SCATTERING: Dispersing outward in all directions
     */
    _translateScattering(particle, corePosition, canvasSize) {
        const centerX = canvasSize.width / 2;
        const centerY = canvasSize.height / 2;

        // Calculate direction from center
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Scatter outward based on particle age
        const scatterAmount = particle.age * 2;
        const scatterRadius = (distance / centerX) * this.baseRadius * scatterAmount;

        // Convert to 3D with spherical distribution
        const theta = Math.atan2(dy, dx);
        const phi = Math.PI / 2 + (particle.z * 0.5); // Use z for vertical spread

        return this._toCartesian(scatterRadius, theta, phi, corePosition);
    }

    /**
     * REPELLING: Push away from core
     */
    _translateRepelling(particle, corePosition, canvasSize) {
        const pos = this._canvasToWorld(
            particle.x, particle.y, particle.z,
            canvasSize.width / 2, canvasSize.height / 2,
            corePosition
        );

        // Calculate repulsion vector
        const repelVec = this.tempVec3_2.copy(pos).sub(
            new THREE.Vector3(corePosition.x, corePosition.y, corePosition.z)
        );
        repelVec.normalize().multiplyScalar(0.2);

        pos.add(repelVec);

        return pos;
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
     * RESTING: Minimal movement, nearly stationary
     */
    _translateResting(particle, corePosition, canvasSize) {
        const pos = this._canvasToWorld(
            particle.x, particle.y, particle.z,
            canvasSize.width / 2, canvasSize.height / 2,
            corePosition
        );

        // Add very subtle breathing motion
        const breathPhase = particle.age * 0.3;
        pos.y += Math.sin(breathPhase) * 0.02;

        return pos;
    }

    /**
     * RADIANT: Expanding glow from center
     */
    _translateRadiant(particle, corePosition, canvasSize) {
        const behaviorData = particle.behaviorData || {};

        // Expand outward uniformly
        const expansion = behaviorData.expansionRate || 0.5;
        const radius = this.baseRadius * expansion * (1 - particle.life);

        // Spherical distribution
        const theta = (behaviorData.angle || 0) + particle.age * 0.1;
        const phi = Math.PI / 2 + (particle.z * Math.PI * 0.3);

        return this._toCartesian(radius, theta, phi, corePosition);
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
     * SURVEILLANCE: Tracking/scanning motion
     */
    _translateSurveillance(particle, corePosition, canvasSize) {
        const behaviorData = particle.behaviorData || {};

        // Orbital with vertical scanning
        const angle = behaviorData.angle || 0;
        const radius = this.baseRadius * 1.2;
        const scanHeight = Math.sin(particle.age * 2) * 0.5;

        const x = Math.cos(angle) * radius + corePosition.x;
        const y = scanHeight + corePosition.y;
        const z = Math.sin(angle) * radius + corePosition.z;

        return this.tempVec3.set(x, y, z);
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
     * DIRECTED: Moves toward specific target
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

        return this._translateDefault(particle, corePosition, canvasSize);
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
        const pos = this._canvasToWorld(
            particle.x, particle.y, particle.z,
            canvasSize.width / 2, canvasSize.height / 2,
            corePosition
        );

        // Very slow circular drift
        const zenAngle = particle.age * 0.2;
        const zenRadius = 0.03;
        pos.x += Math.cos(zenAngle) * zenRadius;
        pos.z += Math.sin(zenAngle) * zenRadius;

        return pos;
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
}

export default Particle3DTranslator;
