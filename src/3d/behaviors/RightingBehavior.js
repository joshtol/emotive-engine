/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - 3D Righting Behavior System
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Self-righting mechanism for 3D models (like inflatable punching clowns)
 * @author Emotive Engine Team
 * @module 3d/behaviors/RightingBehavior
 */

/**
 * Righting behavior - automatically returns model to upright orientation
 *
 * Like a weighted bottom or gyroscopic stabilization. The model naturally
 * returns its "up" vector (local Y-axis) to world up, even as it rotates.
 *
 * Physics simulation:
 * - Center of mass creates restoring torque when tilted
 * - Torque proportional to tilt angle (small angle approximation)
 * - Damping prevents oscillation
 * - Yaw rotation preserved (free spin around vertical)
 */
export default class RightingBehavior {
    /**
     * Create righting behavior
     * @param {object} config - Righting configuration
     */
    constructor(config = {}) {
        this.config = config;

        // Strength of righting force (0.0 = disabled, 1.0 = strong)
        this.strength = config.strength !== undefined ? config.strength : 0.5;

        // Damping coefficient (prevents oscillation)
        // Low = bouncy/springy, High = smooth/overdamped
        this.damping = config.damping !== undefined ? config.damping : 0.8;

        // Center of mass offset from model center [x, y, z]
        // Negative Y = bottom-heavy (strong righting)
        // Positive Y = top-heavy (weak/inverted righting)
        // X/Z offsets = eccentric weighting (leans to one side)
        this.centerOfMass = config.centerOfMass || [0, -0.3, 0];

        // Which axes to apply righting force to
        // { pitch: true, roll: true, yaw: false } = upright but free spin
        this.axes = config.axes || { pitch: true, roll: true, yaw: false };

        // Velocity state (for damping calculation)
        this.angularVelocity = { x: 0, y: 0, z: 0 };
    }

    /**
     * Apply righting torque to Euler angles
     * @param {number} deltaTime - Time since last frame (ms)
     * @param {Array} euler - Current Euler angles [pitch, yaw, roll] to modify
     * @returns {Array} Updated Euler angles
     */
    update(deltaTime, euler) {
        if (this.strength === 0) return euler; // Disabled

        const dt = deltaTime * 0.001; // Convert ms to seconds

        // Current orientation
        const pitch = euler[0]; // Rotation around X (forward/back tilt)
        const yaw = euler[1];   // Rotation around Y (left/right spin)
        const roll = euler[2];  // Rotation around Z (left/right tilt)

        // Calculate restoring torque based on center of mass
        // Torque = -k * angle (spring force, small angle approximation)
        // Larger tilt = larger torque pulling back to upright

        if (this.axes.pitch) {
            // Pitch righting (X-axis)
            const pitchTorque = -pitch * this.strength;

            // Apply torque to angular velocity with damping
            this.angularVelocity.x += pitchTorque * dt;
            this.angularVelocity.x *= (1.0 - this.damping);

            // Update pitch from velocity
            euler[0] += this.angularVelocity.x * dt;
        }

        if (this.axes.roll) {
            // Roll righting (Z-axis)
            const rollTorque = -roll * this.strength;

            // Apply torque to angular velocity with damping
            this.angularVelocity.z += rollTorque * dt;
            this.angularVelocity.z *= (1.0 - this.damping);

            // Update roll from velocity
            euler[2] += this.angularVelocity.z * dt;
        }

        // Yaw is typically left free (no righting) for natural spin
        // But can be enabled for models that should resist yaw rotation
        if (this.axes.yaw) {
            const yawTorque = -yaw * this.strength;
            this.angularVelocity.y += yawTorque * dt;
            this.angularVelocity.y *= (1.0 - this.damping);
            euler[1] += this.angularVelocity.y * dt;
        }

        return euler;
    }

    /**
     * Reset angular velocity (when changing states or teleporting)
     */
    reset() {
        this.angularVelocity = { x: 0, y: 0, z: 0 };
    }

    /**
     * Update configuration
     * @param {object} config - New righting config
     */
    updateConfig(config) {
        this.config = config;
        this.strength = config.strength !== undefined ? config.strength : this.strength;
        this.damping = config.damping !== undefined ? config.damping : this.damping;
        this.centerOfMass = config.centerOfMass || this.centerOfMass;
        this.axes = config.axes || this.axes;
    }

    /**
     * Apply undertone multipliers to righting behavior
     * Called after updateConfig when an undertone is active
     * @param {object} undertoneRighting - Undertone righting multipliers
     */
    applyUndertoneMultipliers(undertoneRighting) {
        // Apply strength multiplier
        if (undertoneRighting.strengthMultiplier !== undefined) {
            this.strength *= undertoneRighting.strengthMultiplier;
        }
    }
}
