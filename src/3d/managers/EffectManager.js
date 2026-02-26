/**
 * EffectManager - Manages geometry-specific visual effects
 *
 * Handles lifecycle management for:
 * - SolarEclipse (sun geometry)
 * - LunarEclipse (moon geometry)
 * - CrystalSoul (crystal-type geometries)
 *
 * Extracted from Core3DManager to improve separation of concerns.
 *
 * @module 3d/managers/EffectManager
 */

import { SolarEclipse } from '../effects/SolarEclipse.js';
import { LunarEclipse } from '../effects/LunarEclipse.js';
import { CrystalSoul } from '../effects/CrystalSoul.js';

/**
 * Geometry types that use CrystalSoul effect
 */
const CRYSTAL_SOUL_GEOMETRIES = ['crystal', 'rough', 'heart', 'star'];

export class EffectManager {
    /**
     * Create effect manager
     * @param {ThreeRenderer} renderer - The Three.js renderer
     * @param {string} assetBasePath - Base path for loading assets
     */
    constructor(renderer, assetBasePath = '/assets') {
        this.renderer = renderer;
        this.assetBasePath = assetBasePath;

        // Effect instances
        this.solarEclipse = null;
        this.lunarEclipse = null;
        this.crystalSoul = null;

        // State tracking
        this.currentGeometryType = null;
        this.coreGlowEnabled = true;
    }

    /**
     * Initialize effects for a specific geometry type
     * @param {string} geometryType - The geometry type (sun, moon, crystal, etc.)
     * @param {Object} options - Options for initialization
     * @param {THREE.Mesh} options.coreMesh - The core mesh to attach effects to
     * @param {Object} options.customMaterial - Custom material (for lunar eclipse)
     * @param {number} options.sunRadius - Sun radius (for solar eclipse)
     */
    initializeForGeometry(geometryType, options = {}) {
        const { coreMesh, customMaterial, sunRadius = 1.0 } = options;
        this.currentGeometryType = geometryType;

        // Clean up effects not needed for this geometry
        this._cleanupUnneededEffects(geometryType);

        // Initialize geometry-specific effects
        if (geometryType === 'sun') {
            this._initSolarEclipse(sunRadius, coreMesh);
        } else if (geometryType === 'moon') {
            this._initLunarEclipse(customMaterial);
        } else if (CRYSTAL_SOUL_GEOMETRIES.includes(geometryType)) {
            // CrystalSoul is initialized separately via createCrystalSoul()
            // because it has complex async loading requirements
        }
    }

    /**
     * Initialize solar eclipse effect
     * @private
     */
    _initSolarEclipse(sunRadius, coreMesh) {
        if (!this.solarEclipse && this.renderer?.scene) {
            this.solarEclipse = new SolarEclipse(this.renderer.scene, sunRadius, coreMesh);
        }
    }

    /**
     * Initialize lunar eclipse effect
     * @private
     */
    _initLunarEclipse(customMaterial) {
        if (!this.lunarEclipse && customMaterial) {
            this.lunarEclipse = new LunarEclipse(customMaterial);
        }
    }

    /**
     * Clean up effects that are not needed for the current geometry
     * @private
     */
    _cleanupUnneededEffects(geometryType) {
        // Dispose solar eclipse if not sun
        if (geometryType !== 'sun' && this.solarEclipse) {
            this.solarEclipse.dispose();
            this.solarEclipse = null;
        }

        // Dispose lunar eclipse if not moon
        if (geometryType !== 'moon' && this.lunarEclipse) {
            this.lunarEclipse.dispose();
            this.lunarEclipse = null;
        }

        // Dispose crystal soul if not a crystal-type geometry
        if (!CRYSTAL_SOUL_GEOMETRIES.includes(geometryType) && this.crystalSoul) {
            this.crystalSoul.dispose();
            this.crystalSoul = null;
        }
    }

    /**
     * Create crystal soul effect (async due to inclusion geometry loading)
     * @param {Object} options - Crystal soul options
     * @param {THREE.Mesh} options.coreMesh - Core mesh to attach to
     * @param {string} options.geometryType - Geometry type for configuration
     * @returns {Object} Soul configuration { mesh, material, baseScale, shellBaseScale }
     */
    async createCrystalSoul(options = {}) {
        const { coreMesh, geometryType } = options;

        // Dispose existing soul
        if (this.crystalSoul) {
            this.crystalSoul.dispose();
            this.crystalSoul = null;
        }

        if (!coreMesh) {
            return null;
        }

        // Preload inclusion geometry
        await CrystalSoul._loadInclusionGeometry(this.assetBasePath);

        // Create new soul
        this.crystalSoul = new CrystalSoul({
            radius: 0.35,
            detail: 1,
            geometryType,
            renderer: this.renderer,
            assetBasePath: this.assetBasePath,
        });

        this.crystalSoul.attachTo(coreMesh, this.renderer?.scene);

        // Get geometry-specific scale configuration
        const { shellBaseScale, soulScale } = this._getCrystalScaleConfig(geometryType);

        this.crystalSoul.baseScale = soulScale;
        this.crystalSoul.mesh.scale.setScalar(soulScale);
        this.crystalSoul.setVisible(this.coreGlowEnabled);

        return {
            mesh: this.crystalSoul.mesh,
            material: this.crystalSoul.material,
            baseScale: this.crystalSoul.baseScale,
            shellBaseScale,
        };
    }

    /**
     * Create crystal soul synchronously (non-async version)
     * @param {Object} options - Crystal soul options
     * @returns {Object} Soul configuration
     */
    createCrystalSoulSync(options = {}) {
        const { coreMesh, geometryType } = options;

        if (this.crystalSoul) {
            this.crystalSoul.dispose();
            this.crystalSoul = null;
        }

        if (!coreMesh) {
            return null;
        }

        this.crystalSoul = new CrystalSoul({
            radius: 0.35,
            detail: 1,
            geometryType,
            renderer: this.renderer,
            assetBasePath: this.assetBasePath,
        });

        this.crystalSoul.attachTo(coreMesh, this.renderer?.scene);

        const { shellBaseScale, soulScale } = this._getCrystalScaleConfig(geometryType);

        this.crystalSoul.baseScale = soulScale;
        this.crystalSoul.mesh.scale.setScalar(soulScale);
        this.crystalSoul.setVisible(this.coreGlowEnabled);

        return {
            mesh: this.crystalSoul.mesh,
            material: this.crystalSoul.material,
            baseScale: this.crystalSoul.baseScale,
            shellBaseScale,
        };
    }

    /**
     * Get scale configuration for crystal-type geometries
     * @private
     */
    _getCrystalScaleConfig(geometryType) {
        let shellBaseScale = 2.0; // Default crystal shell size
        let soulScale = 1.0; // Default: full size

        if (geometryType === 'heart') {
            shellBaseScale = 2.4;
            soulScale = 1.0;
        } else if (geometryType === 'rough') {
            shellBaseScale = 1.6;
            soulScale = 1.0;
        } else if (geometryType === 'star') {
            shellBaseScale = 2.0;
            soulScale = 1.4; // Larger soul for star to fill the shape
        } else if (geometryType === 'crystal') {
            shellBaseScale = 2.0;
            soulScale = 1.0;
        }

        return { shellBaseScale, soulScale };
    }

    /**
     * Set solar eclipse type
     * @param {string} eclipseType - 'off', 'annular', or 'total'
     * @returns {boolean} True if eclipse was set
     */
    setSolarEclipse(eclipseType) {
        if (!this.solarEclipse) {
            return false;
        }
        this.solarEclipse.setEclipseType(eclipseType);
        return true;
    }

    /**
     * Set lunar eclipse type
     * @param {string} eclipseType - 'off', 'penumbral', 'partial', 'total'
     * @returns {boolean} True if eclipse was set
     */
    setLunarEclipse(eclipseType) {
        if (!this.lunarEclipse) {
            return false;
        }
        this.lunarEclipse.setEclipseType(eclipseType);
        return true;
    }

    /**
     * Stop all eclipse effects
     */
    stopAllEclipses() {
        if (this.solarEclipse) {
            this.solarEclipse.setEclipseType('off');
        }
        if (this.lunarEclipse) {
            this.lunarEclipse.setEclipseType('off');
        }
    }

    /**
     * Update crystal soul
     * @param {number} deltaTime - Time since last frame
     * @param {Array} glowColor - RGB color [r, g, b]
     * @param {number} breathScale - Breathing animation scale
     */
    updateCrystalSoul(deltaTime, glowColor, breathScale = 1.0) {
        if (this.crystalSoul) {
            this.crystalSoul.update(deltaTime, glowColor, breathScale);
        }
    }

    /**
     * Update lunar eclipse
     * @param {number} deltaTime - Time since last frame
     */
    updateLunarEclipse(deltaTime) {
        if (this.lunarEclipse) {
            this.lunarEclipse.update(deltaTime);
        }
    }

    /**
     * Set crystal soul effect parameters
     * @param {Object} params - Effect parameters
     */
    setCrystalSoulEffects(params) {
        if (this.crystalSoul) {
            this.crystalSoul.setEffects(params);
        }
    }

    /**
     * Set crystal soul size
     * @param {number} size - Size value
     * @returns {number} The new base scale
     */
    setCrystalSoulSize(size) {
        if (this.crystalSoul) {
            this.crystalSoul.setSize(size);
            return this.crystalSoul.baseScale;
        }
        return 1.0;
    }

    /**
     * Set crystal soul visibility
     * @param {boolean} visible - Whether soul should be visible
     */
    setCrystalSoulVisible(visible) {
        this.coreGlowEnabled = visible;
        if (this.crystalSoul) {
            this.crystalSoul.setVisible(visible);
        }
    }

    /**
     * Check if crystal soul exists
     * @returns {boolean}
     */
    hasCrystalSoul() {
        return !!this.crystalSoul;
    }

    /**
     * Get crystal soul base scale
     * @returns {number}
     */
    getCrystalSoulBaseScale() {
        return this.crystalSoul?.baseScale ?? 1.0;
    }

    /**
     * Check if solar eclipse is active
     * @returns {boolean}
     */
    hasSolarEclipse() {
        return !!this.solarEclipse;
    }

    /**
     * Check if lunar eclipse is active
     * @returns {boolean}
     */
    hasLunarEclipse() {
        return !!this.lunarEclipse;
    }

    /**
     * Get solar eclipse instance (for render pass)
     * @returns {SolarEclipse|null}
     */
    getSolarEclipse() {
        return this.solarEclipse;
    }

    /**
     * Dispose all effects
     */
    dispose() {
        if (this.solarEclipse) {
            this.solarEclipse.dispose();
            this.solarEclipse = null;
        }

        if (this.lunarEclipse) {
            this.lunarEclipse.dispose();
            this.lunarEclipse = null;
        }

        if (this.crystalSoul) {
            this.crystalSoul.dispose();
            this.crystalSoul = null;
        }

        this.renderer = null;
    }
}

export default EffectManager;
