/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Elemental Materials
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Barrel export for elemental materials system
 * @author Emotive Engine Team
 * @module materials
 *
 * ## Elemental Materials System
 *
 * Six elemental materials, each with a master parameter:
 *
 * | Element  | Master Param  | Range                          |
 * |----------|---------------|--------------------------------|
 * | fire     | temperature   | 0=embers, 0.5=fire, 1=plasma   |
 * | water    | turbulence    | 0=calm, 0.5=river, 1=storm     |
 * | smoke    | density       | 0=steam, 0.5=smoke, 1=heavy    |
 * | ice      | melt          | 0=frozen, 0.5=melting, 1=slush |
 * | electric | charge        | 0=static, 0.5=arcs, 1=lightning|
 * | void     | depth         | 0=wispy, 0.5=dark, 1=black hole|
 *
 * ## Procedural Materials (Advanced)
 *
 * For realistic, shader-based elemental effects:
 * - ProceduralFireMaterial - Dynamic flames with blackbody colors
 * - InstancedWaterMaterial - Waves, caustics, foam, subsurface (GPU-instanced)
 * - ProceduralPoisonMaterial - Viscous toxic fluid (uses water models)
 * - ProceduralSmokeMaterial - Billowing rising smoke (uses void models)
 *
 * ## Quick Start
 *
 * ```javascript
 * import { createElementalMaterial, getElementalPhysics } from 'emotive-engine/materials';
 *
 * // Create a fire material
 * const fireMat = createElementalMaterial('fire', 0.7);
 *
 * // Get physics for shatter system
 * const physics = getElementalPhysics('fire', 0.7);
 * ```
 *
 * ## Individual Materials
 *
 * Each material can also be imported directly:
 *
 * ```javascript
 * import { createFireMaterial } from 'emotive-engine/materials';
 *
 * const fireMat = createFireMaterial({ temperature: 0.7 });
 * ```
 */

// ═══════════════════════════════════════════════════════════════════════════
// Factory (recommended entry point)
// ═══════════════════════════════════════════════════════════════════════════
export {
    createElementalMaterial,
    updateElementalMaterial,
    getElementalPhysics,
    getElementalCrackStyle,
    getMasterParamName,
    getSupportedElements,
    isElementSupported,
    getElementalConfig,
    applyCrackStyleToManager
} from './ElementalMaterialFactory.js';

// ═══════════════════════════════════════════════════════════════════════════
// Fire Material
// ═══════════════════════════════════════════════════════════════════════════
export {
    createFireMaterial,
    updateFireMaterial,
    getFirePhysics,
    getFireCrackStyle
} from './FireMaterial.js';

// ═══════════════════════════════════════════════════════════════════════════
// Water Material
// ═══════════════════════════════════════════════════════════════════════════
export {
    createWaterMaterial,
    updateWaterMaterial,
    getWaterPhysics,
    getWaterCrackStyle
} from './WaterMaterial.js';

// ═══════════════════════════════════════════════════════════════════════════
// Ice Material
// ═══════════════════════════════════════════════════════════════════════════
export {
    createIceMaterial,
    updateIceMaterial,
    getIcePhysics,
    getIceCrackStyle
} from './IceMaterial.js';

// ═══════════════════════════════════════════════════════════════════════════
// Electric Material
// ═══════════════════════════════════════════════════════════════════════════
export {
    createElectricMaterial,
    updateElectricMaterial,
    getElectricPhysics,
    getElectricCrackStyle
} from './ElectricMaterial.js';

// ═══════════════════════════════════════════════════════════════════════════
// Void Material
// ═══════════════════════════════════════════════════════════════════════════
export {
    createVoidMaterial,
    updateVoidMaterial,
    getVoidPhysics,
    getVoidCrackStyle
} from './VoidMaterial.js';

// ═══════════════════════════════════════════════════════════════════════════
// Procedural Fire Material (advanced shader-based)
// ═══════════════════════════════════════════════════════════════════════════
export {
    createProceduralFireMaterial,
    updateProceduralFireMaterial,
    setProceduralFireTemperature,
    setProceduralFireIntensity,
    getProceduralFirePhysics
} from './ProceduralFireMaterial.js';

// ═══════════════════════════════════════════════════════════════════════════
// Instanced Water Material (GPU-efficient instanced version)
// Note: ProceduralWaterMaterial was removed - use InstancedWaterMaterial instead
// ═══════════════════════════════════════════════════════════════════════════
export {
    createInstancedWaterMaterial,
    updateInstancedWaterMaterial,
    setInstancedWaterTurbulence,
    setInstancedWaterTint,
    setInstancedWaterGlowScale,
    setInstancedWaterGestureGlow,
    setInstancedWaterArcAnimation,
    ANIMATION_TYPES as WATER_ANIMATION_TYPES
} from './InstancedWaterMaterial.js';

// ═══════════════════════════════════════════════════════════════════════════
// Procedural Void Material (advanced shader-based with rift support)
// ═══════════════════════════════════════════════════════════════════════════
export {
    createProceduralVoidMaterial,
    updateProceduralVoidMaterial,
    setProceduralVoidDepth,
    setProceduralVoidIntensity,
    setProceduralVoidRiftMode,
    getProceduralVoidPhysics
} from './ProceduralVoidMaterial.js';

// ═══════════════════════════════════════════════════════════════════════════
// Instanced Shader Utilities (for GPU-efficient element rendering)
// ═══════════════════════════════════════════════════════════════════════════
export {
    INSTANCED_ATTRIBUTES_VERTEX,
    INSTANCED_ATTRIBUTES_FRAGMENT,
    INSTANCED_TIME_CALC_VERTEX,
    INSTANCED_TIME_UNIFORMS,
    MODEL_SELECTION_VERTEX,
    TRAIL_OFFSET_VERTEX,
    injectInstancedVertex,
    injectInstancedFragment,
    createInstancedUniforms
} from './InstancedShaderUtils.js';

// ═══════════════════════════════════════════════════════════════════════════
// Instanced Fire Material (GPU-efficient instanced version)
// ═══════════════════════════════════════════════════════════════════════════
export {
    createInstancedFireMaterial,
    updateInstancedFireMaterial,
    setInstancedFireTemperature,
    setInstancedFireGlowScale,
    setInstancedFireGestureGlow
} from './InstancedFireMaterial.js';

// ═══════════════════════════════════════════════════════════════════════════
// Instanced Animation Core (shared animation system for all elements)
// ═══════════════════════════════════════════════════════════════════════════
export {
    ANIMATION_TYPES,
    ANIMATION_DEFAULTS,
    createAnimationUniforms,
    setShaderAnimation,
    updateAnimationProgress,
    resetAnimation,
    setGestureGlow,
    clearGestureGlow,
    setGlowScale
} from './cores/InstancedAnimationCore.js';
