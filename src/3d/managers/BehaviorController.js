/**
 * BehaviorController - Manages rotation, righting, and facing behaviors
 *
 * Centralizes behavior management for 3D mascot:
 * - RotationBehavior: Emotion-driven rotation with wobble
 * - RightingBehavior: Self-stabilization (punching bag effect)
 * - FacingBehavior: Tidal lock for moon geometry
 *
 * Extracted from Core3DManager to improve separation of concerns.
 *
 * @module 3d/managers/BehaviorController
 */

import RotationBehavior from '../behaviors/RotationBehavior.js';
import RightingBehavior from '../behaviors/RightingBehavior.js';
import FacingBehavior from '../behaviors/FacingBehavior.js';

/**
 * Default righting behavior configuration
 */
const DEFAULT_RIGHTING_CONFIG = {
    strength: 5.0,              // Strong righting without overdoing it
    damping: 0.85,              // Critically damped for smooth return
    centerOfMass: [0, -0.3, 0], // Bottom-heavy
    axes: { pitch: true, roll: true, yaw: false }
};

export class BehaviorController {
    /**
     * Create behavior controller
     * @param {Object} options - Configuration options
     * @param {boolean} options.rotationDisabled - Whether rotation is disabled
     * @param {boolean} options.wobbleEnabled - Whether wobble effects are enabled
     */
    constructor(options = {}) {
        this.rotationBehavior = null;
        this.rightingBehavior = null;
        this.facingBehavior = null;

        // State flags
        this.rotationDisabled = options.rotationDisabled || false;
        this.wobbleEnabled = options.wobbleEnabled !== false; // Default: enabled

        // Initialize righting behavior (always active)
        this.rightingBehavior = new RightingBehavior(DEFAULT_RIGHTING_CONFIG);
    }

    /**
     * Configure rotation behavior based on emotion and geometry
     * @param {Object} options - Configuration options
     * @param {string} options.geometryType - Current geometry type
     * @param {Object} options.emotionData - Emotion data with 3d rotation config
     * @param {Object} options.facingConfig - Facing behavior config (for moon)
     */
    configureForEmotion(options = {}) {
        const { geometryType, emotionData, facingConfig } = options;

        // Moon is tidally locked - no rotation
        if (geometryType === 'moon') {
            this._disableRotation();
            this._initFacingBehavior(facingConfig);
            return;
        }

        // Dispose facing behavior if not moon
        this._disposeFacingBehavior();

        // Skip if rotation is disabled by user
        if (this.rotationDisabled) {
            this._disableRotation();
            return;
        }

        // Configure rotation based on emotion
        if (emotionData?.['3d']?.rotation) {
            this._configureRotationFromEmotion(emotionData['3d'].rotation);
        } else {
            // Default rotation if no emotion-specific config
            this._ensureDefaultRotation();
        }

        // Reset righting behavior on emotion change
        if (this.rightingBehavior) {
            this.rightingBehavior.reset();
        }
    }

    /**
     * Apply undertone modifiers to behaviors
     * @param {Object} undertone3d - 3D undertone modifiers
     */
    applyUndertone(undertone3d) {
        if (!undertone3d) return;

        if (undertone3d.rotation && this.rotationBehavior) {
            this.rotationBehavior.applyUndertoneMultipliers(undertone3d.rotation);
        }

        if (undertone3d.righting && this.rightingBehavior) {
            this.rightingBehavior.applyUndertoneMultipliers(undertone3d.righting);
        }
    }

    /**
     * Update all behaviors for current frame
     * @param {number} deltaTime - Time since last frame
     * @param {THREE.Euler} baseEuler - Base euler rotation to modify
     */
    update(deltaTime, baseEuler) {
        // Update rotation behavior
        if (this.rotationBehavior) {
            this.rotationBehavior.update(deltaTime, baseEuler);
        }

        // Update righting behavior (self-stabilization)
        if (this.rightingBehavior) {
            this.rightingBehavior.update(deltaTime, baseEuler);
        }

        // Update facing behavior (tidal lock)
        if (this.facingBehavior) {
            this.facingBehavior.update(deltaTime, baseEuler);
        }
    }

    /**
     * Set wobble enabled state
     * @param {boolean} enabled - Whether wobble is enabled
     */
    setWobbleEnabled(enabled) {
        this.wobbleEnabled = enabled;
        if (this.rotationBehavior) {
            this.rotationBehavior.setWobbleEnabled(enabled);
        }

        // When disabling wobble, reset to upright position
        if (!enabled && this.rightingBehavior) {
            this.rightingBehavior.reset();
        }
    }

    /**
     * Reset righting behavior
     */
    resetRighting() {
        if (this.rightingBehavior) {
            this.rightingBehavior.reset();
        }
    }

    /**
     * Get angular velocity from rotation behavior
     * @returns {Array} [x, y, z] angular velocity or [0, 0, 0]
     */
    getAngularVelocity() {
        return this.rotationBehavior ? this.rotationBehavior.axes : [0, 0, 0];
    }

    /**
     * Check if rotation behavior is active
     * @returns {boolean}
     */
    hasRotationBehavior() {
        return !!this.rotationBehavior;
    }

    /**
     * Configure rotation behavior from emotion data
     * @private
     */
    _configureRotationFromEmotion(rotationConfig) {
        if (this.rotationBehavior) {
            this.rotationBehavior.updateConfig(rotationConfig);
        } else {
            this.rotationBehavior = new RotationBehavior(rotationConfig);
        }
        this.rotationBehavior.setWobbleEnabled(this.wobbleEnabled);
    }

    /**
     * Ensure default rotation behavior exists
     * @private
     */
    _ensureDefaultRotation() {
        if (!this.rotationBehavior) {
            this.rotationBehavior = new RotationBehavior({
                axes: [0, 0.3, 0] // Default gentle Y rotation
            });
            this.rotationBehavior.setWobbleEnabled(this.wobbleEnabled);
        }
    }

    /**
     * Disable rotation behavior
     * @private
     */
    _disableRotation() {
        this.rotationBehavior = null;
    }

    /**
     * Initialize facing behavior for tidal lock
     * @private
     */
    _initFacingBehavior(facingConfig) {
        if (!this.facingBehavior && facingConfig?.enabled) {
            this.facingBehavior = new FacingBehavior({
                strength: facingConfig.strength,
                damping: facingConfig.damping,
                faceAxis: facingConfig.faceAxis,
                targetAxis: facingConfig.targetAxis
            });
        }
    }

    /**
     * Dispose facing behavior
     * @private
     */
    _disposeFacingBehavior() {
        if (this.facingBehavior) {
            this.facingBehavior.dispose();
            this.facingBehavior = null;
        }
    }

    /**
     * Dispose all behaviors and clean up
     */
    dispose() {
        if (this.rotationBehavior) {
            this.rotationBehavior.destroy?.();
            this.rotationBehavior = null;
        }

        if (this.rightingBehavior) {
            this.rightingBehavior.destroy?.();
            this.rightingBehavior = null;
        }

        if (this.facingBehavior) {
            this.facingBehavior.dispose();
            this.facingBehavior = null;
        }
    }
}

export default BehaviorController;
