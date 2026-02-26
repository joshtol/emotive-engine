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
    strength: 5.0, // Strong righting without overdoing it
    damping: 0.85, // Critically damped for smooth return
    centerOfMass: [0, -0.3, 0], // Bottom-heavy
    axes: { pitch: true, roll: true, yaw: false },
};

export class BehaviorController {
    /**
     * Create behavior controller
     * @param {Object} options - Configuration options
     * @param {boolean} options.rotationDisabled - Whether rotation is disabled
     * @param {boolean} options.wobbleEnabled - Whether wobble effects are enabled
     * @param {Object} options.rhythmEngine - Optional rhythm engine for beat-synced rotation
     * @param {THREE.Camera} options.camera - Camera reference for facing behavior
     */
    constructor(options = {}) {
        this.rotationBehavior = null;
        this.rightingBehavior = null;
        this.facingBehavior = null;

        // State flags
        this.rotationDisabled = options.rotationDisabled || false;
        this.wobbleEnabled = options.wobbleEnabled !== false; // Default: enabled

        // External references
        this.rhythmEngine = options.rhythmEngine || null;
        this.camera = options.camera || null;

        // Current geometry type (affects behavior configuration)
        this.geometryType = null;

        // Initialize righting behavior (always active)
        this.rightingBehavior = new RightingBehavior(DEFAULT_RIGHTING_CONFIG);
    }

    /**
     * Configure rotation behavior based on emotion and geometry
     * @param {Object} options - Configuration options
     * @param {string} options.geometryType - Current geometry type
     * @param {Object} options.emotionData - Emotion data with 3d rotation config
     * @param {Object} options.facingConfig - Facing behavior config (for moon)
     * @param {Object} options.geometryRotation - Geometry-specific base rotation config (e.g., SUN_ROTATION_CONFIG)
     */
    configureForEmotion(options = {}) {
        const { geometryType, emotionData, facingConfig, geometryRotation } = options;

        // Track current geometry type
        this.geometryType = geometryType;

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
            this._configureRotationFromEmotion(emotionData['3d'].rotation, geometryRotation);
        } else {
            // Default rotation if no emotion-specific config
            this._ensureDefaultRotation(geometryRotation);
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
     * @param {Array} baseEuler - Base euler rotation array [x, y, z] to modify
     */
    update(deltaTime, baseEuler) {
        // Update rotation behavior
        if (this.rotationBehavior) {
            this.rotationBehavior.update(deltaTime, baseEuler);
        } else if (this.geometryType !== 'moon' && !this.rotationDisabled) {
            // Fallback: simple Y rotation if no behavior defined
            // EXCEPT for moon (tidally locked - no rotation)
            // EXCEPT when user has manually disabled rotation
            baseEuler[1] += deltaTime * 0.0003;
        }

        // Update righting behavior (self-stabilization) after rotation
        // This pulls tilted models back to upright while preserving yaw spin
        if (this.rightingBehavior) {
            this.rightingBehavior.update(deltaTime, baseEuler);
        }

        // Apply facing behavior (tidal lock) after righting
        // This overrides rotation to keep object stationary (no rotation)
        // Tidal lock is achieved by keeping baseEuler at [0,0,0]
        if (this.facingBehavior) {
            // Simply reset baseEuler to zero - moon doesn't rotate at all
            baseEuler[0] = 0; // No pitch
            baseEuler[1] = 0; // No yaw
            baseEuler[2] = 0; // No roll
            // calibrationRotation is already applied in renderer to show correct face
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
     * Check if facing behavior is active (for moon tidal lock)
     * @returns {boolean}
     */
    hasFacingBehavior() {
        return !!this.facingBehavior;
    }

    /**
     * Configure for a geometry morph transition
     * Called when morphing to a new geometry type
     * @param {Object} options - Configuration options
     * @param {string} options.targetGeometryType - Target geometry type
     * @param {Object} options.emotionData - Current emotion data
     * @param {Object} options.facingConfig - Facing behavior config (for moon)
     * @param {Object} options.geometryRotation - Geometry-specific rotation config
     */
    configureForMorph(options = {}) {
        const { targetGeometryType, emotionData, facingConfig, geometryRotation } = options;

        // Reset righting behavior during morph transition
        this.resetRighting();

        // Configure for target geometry (same logic as emotion change)
        this.configureForEmotion({
            geometryType: targetGeometryType,
            emotionData,
            facingConfig,
            geometryRotation,
        });
    }

    /**
     * Configure rotation behavior from emotion data
     * @param {Object} rotationConfig - Rotation configuration from emotion
     * @param {Object} geometryRotation - Geometry-specific base rotation config
     * @private
     */
    _configureRotationFromEmotion(rotationConfig, geometryRotation) {
        if (this.rotationBehavior) {
            this.rotationBehavior.updateConfig(rotationConfig);
        } else {
            this.rotationBehavior = new RotationBehavior(
                rotationConfig,
                this.rhythmEngine,
                geometryRotation
            );
        }
        this.rotationBehavior.setWobbleEnabled(this.wobbleEnabled);
    }

    /**
     * Ensure default rotation behavior exists
     * @param {Object} geometryRotation - Geometry-specific base rotation config
     * @private
     */
    _ensureDefaultRotation(geometryRotation) {
        if (!this.rotationBehavior) {
            this.rotationBehavior = new RotationBehavior(
                { type: 'gentle', speed: 1.0, axes: [0, 0.01, 0] },
                this.rhythmEngine,
                geometryRotation
            );
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
            this.facingBehavior = new FacingBehavior(
                {
                    strength: facingConfig.strength,
                    lockedFace: facingConfig.lockedFace,
                    lerpSpeed: facingConfig.lerpSpeed,
                    calibrationRotation: facingConfig.calibrationRotation,
                },
                this.camera
            );
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
