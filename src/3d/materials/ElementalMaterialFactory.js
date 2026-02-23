/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Elemental Material Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Central factory for elemental materials, physics, and crack styles
 * @author Emotive Engine Team
 * @module materials/ElementalMaterialFactory
 *
 * ## Unified Elemental System
 *
 * This factory provides a single entry point for:
 * 1. Creating elemental materials (visual appearance)
 * 2. Getting elemental physics configs (shard/particle behavior)
 * 3. Getting elemental crack styles (crack system integration)
 *
 * ## Supported Elements
 *
 * | Element  | Master Param  | Range Description              |
 * |----------|---------------|--------------------------------|
 * | fire     | temperature   | 0=embers, 0.5=fire, 1=plasma   |
 * | water    | viscosity     | 0=mercury, 0.3=water, 1=jello  |
 * | smoke    | density       | 0=steam, 0.5=smoke, 1=heavy    |
 * | ice      | melt          | 0=frozen, 0.5=melting, 1=slush |
 * | electric | charge        | 0=static, 0.5=arcs, 1=lightning|
 * | void     | depth         | 0=wispy, 0.5=dark, 1=black hole|
 *
 * ## Usage
 *
 * ```javascript
 * // Create material
 * const material = createElementalMaterial('fire', 0.7);
 *
 * // Get physics for shatter system
 * const physics = getElementalPhysics('water', 0.3);
 *
 * // Get crack style for crack system
 * const crackStyle = getElementalCrackStyle('ice', 0.1);
 * ```
 */

import {
    createFireMaterial,
    updateFireMaterial,
    getFirePhysics,
    getFireCrackStyle
} from './overlays/FireMaterial.js';

import {
    createWaterMaterial,
    updateWaterMaterial,
    getWaterPhysics,
    getWaterCrackStyle
} from './overlays/WaterMaterial.js';

import {
    createIceMaterial,
    updateIceMaterial,
    getIcePhysics,
    getIceCrackStyle
} from './overlays/IceMaterial.js';

import {
    createElectricMaterial,
    updateElectricMaterial,
    getElectricPhysics,
    getElectricCrackStyle
} from './overlays/ElectricMaterial.js';

import {
    createVoidMaterial,
    updateVoidMaterial,
    getVoidPhysics,
    getVoidCrackStyle
} from './overlays/VoidMaterial.js';

/**
 * Registry of all elemental types with their handlers
 * @private
 */
const ELEMENTAL_REGISTRY = {
    fire: {
        create: createFireMaterial,
        update: updateFireMaterial,
        physics: getFirePhysics,
        crack: getFireCrackStyle,
        masterParam: 'temperature'
    },
    water: {
        create: createWaterMaterial,
        update: updateWaterMaterial,
        physics: getWaterPhysics,
        crack: getWaterCrackStyle,
        masterParam: 'viscosity'
    },
    ice: {
        create: createIceMaterial,
        update: updateIceMaterial,
        physics: getIcePhysics,
        crack: getIceCrackStyle,
        masterParam: 'melt'
    },
    electric: {
        create: createElectricMaterial,
        update: updateElectricMaterial,
        physics: getElectricPhysics,
        crack: getElectricCrackStyle,
        masterParam: 'charge'
    },
    void: {
        create: createVoidMaterial,
        update: updateVoidMaterial,
        physics: getVoidPhysics,
        crack: getVoidCrackStyle,
        masterParam: 'depth'
    }
};

/**
 * Default crack style for non-elemental materials
 * @private
 */
const DEFAULT_CRACK_STYLE = {
    color: 0x442211,
    emissive: 0.3,
    animated: false,
    pattern: 'organic'
};

/**
 * Default physics for non-elemental materials
 * @private
 */
const DEFAULT_PHYSICS = {
    gravity: 1.0,
    bounce: 0.3,
    drag: 0.02,
    lifetime: 3.0
};

/**
 * Create an elemental material
 *
 * @param {string} element - Element type ('fire', 'water', 'smoke', 'ice', 'electric', 'void')
 * @param {number} [masterParam=0.5] - Master parameter value (0-1)
 * @param {Object} [options={}] - Additional options passed to the material creator
 * @returns {THREE.ShaderMaterial|null} The created material, or null if element unknown
 */
export function createElementalMaterial(element, masterParam = 0.5, options = {}) {
    console.log('[ELEMENTAL_FACTORY] 🔧 createElementalMaterial called:', {
        element,
        masterParam,
        options,
        registryKeys: Object.keys(ELEMENTAL_REGISTRY),
        hasRegistry: !!ELEMENTAL_REGISTRY[element]
    });

    const registry = ELEMENTAL_REGISTRY[element];
    if (!registry) {
        console.warn(`ElementalMaterialFactory: Unknown element type '${element}'`);
        return null;
    }

    // Build options with master parameter
    const materialOptions = {
        [registry.masterParam]: masterParam,
        ...options
    };

    console.log('[ELEMENTAL_FACTORY] 📦 Calling registry.create with:', {
        element,
        masterParamName: registry.masterParam,
        materialOptions
    });

    const material = registry.create(materialOptions);

    console.log('[ELEMENTAL_FACTORY] ✅ Material created:', {
        element,
        materialCreated: !!material,
        materialType: material?.type,
        materialUserData: material?.userData,
        hasUniforms: !!material?.uniforms,
        uniformKeys: material?.uniforms ? Object.keys(material.uniforms) : []
    });

    return material;
}

/**
 * Update an elemental material's animation
 *
 * @param {THREE.ShaderMaterial} material - Material to update
 * @param {number} deltaTime - Time since last frame in seconds
 */
export function updateElementalMaterial(material, deltaTime) {
    if (!material?.userData?.elementalType) return;

    const registry = ELEMENTAL_REGISTRY[material.userData.elementalType];
    if (registry?.update) {
        registry.update(material, deltaTime);
    }
}

/**
 * Get physics configuration for an element
 *
 * @param {string} element - Element type
 * @param {number} [masterParam=0.5] - Master parameter value (0-1)
 * @returns {Object} Physics configuration
 */
export function getElementalPhysics(element, masterParam = 0.5) {
    const registry = ELEMENTAL_REGISTRY[element];
    if (!registry) {
        return { ...DEFAULT_PHYSICS };
    }

    return registry.physics(masterParam);
}

/**
 * Get crack style for an element
 * Used by crack system to style cracks based on elemental type
 *
 * @param {string} element - Element type
 * @param {number} [masterParam=0.5] - Master parameter value (0-1)
 * @returns {Object} Crack style configuration
 */
export function getElementalCrackStyle(element, masterParam = 0.5) {
    const registry = ELEMENTAL_REGISTRY[element];
    if (!registry) {
        return { ...DEFAULT_CRACK_STYLE };
    }

    return registry.crack(masterParam);
}

/**
 * Get the master parameter name for an element
 *
 * @param {string} element - Element type
 * @returns {string} Master parameter name (e.g., 'temperature' for fire)
 */
export function getMasterParamName(element) {
    const registry = ELEMENTAL_REGISTRY[element];
    return registry?.masterParam || 'intensity';
}

/**
 * Get list of all supported elemental types
 *
 * @returns {string[]} Array of element type names
 */
export function getSupportedElements() {
    return Object.keys(ELEMENTAL_REGISTRY);
}

/**
 * Check if an element type is supported
 *
 * @param {string} element - Element type to check
 * @returns {boolean} True if supported
 */
export function isElementSupported(element) {
    return element in ELEMENTAL_REGISTRY;
}

/**
 * Get complete elemental configuration (material, physics, crack style)
 * Useful for shatter system initialization
 *
 * @param {string} element - Element type
 * @param {number} [masterParam=0.5] - Master parameter value (0-1)
 * @param {Object} [materialOptions={}] - Additional material options
 * @returns {Object} Complete configuration { material, physics, crackStyle }
 */
export function getElementalConfig(element, masterParam = 0.5, materialOptions = {}) {
    return {
        element,
        masterParam,
        material: createElementalMaterial(element, masterParam, materialOptions),
        physics: getElementalPhysics(element, masterParam),
        crackStyle: getElementalCrackStyle(element, masterParam)
    };
}

/**
 * Apply crack style to crack manager uniforms
 * Helper for crack system integration
 *
 * @param {Object} crackManager - ObjectSpaceCrackManager or CrackLayer instance
 * @param {string} element - Element type
 * @param {number} [masterParam=0.5] - Master parameter value
 */
export function applyCrackStyleToManager(crackManager, element, masterParam = 0.5) {
    const style = getElementalCrackStyle(element, masterParam);

    if (crackManager.crackColor) {
        if (typeof style.color === 'number') {
            crackManager.crackColor.setHex(style.color);
        } else {
            crackManager.crackColor.copy(style.color);
        }
    }

    if (crackManager.crackGlowColor) {
        if (typeof style.color === 'number') {
            crackManager.crackGlowColor.setHex(style.color);
        } else {
            crackManager.crackGlowColor.copy(style.color);
        }
    }

    if (crackManager.glowStrength !== undefined) {
        // Handle negative emissive for void (light absorption)
        crackManager.glowStrength = Math.max(0, style.emissive);
    }

    // Store pattern for potential shader use
    if (crackManager.pattern !== undefined) {
        crackManager.pattern = style.pattern;
    }

    // Store animated flag
    if (crackManager.animated !== undefined) {
        crackManager.animated = style.animated;
    }
}

export default {
    createElementalMaterial,
    updateElementalMaterial,
    getElementalPhysics,
    getElementalCrackStyle,
    getMasterParamName,
    getSupportedElements,
    isElementSupported,
    getElementalConfig,
    applyCrackStyleToManager
};
