/**
 * GeometryStateManager - Reset Shader States During Morphs
 *
 * Provides reset functions for each geometry type to clear shader uniforms
 * to their default values when morphing away. This prevents visual remnants
 * from bleeding between geometries (e.g., blood moon effects on crystal).
 *
 * Architecture:
 * - Each geometry has its own reset function
 * - Reset functions clear uniforms to defaults (don't dispose materials)
 * - Called during the "shrink" phase of morph before geometry swap
 */

// THREE - available for type checking if needed
import { MOON_PHASES } from './geometries/Moon.js';
import { CRYSTAL_DEFAULT_UNIFORMS } from './shaders/crystalWithSoul.js';

/**
 * Reset moon material to default state
 * Clears: moon phase, blood moon effects, eclipse states, blend layers
 *
 * @param {THREE.ShaderMaterial} material - Moon shader material
 */
export function resetMoon(material) {
    if (!material || !material.uniforms) {
        return;
    }

    const u = material.uniforms;

    // Moon phase - reset to full moon
    if (u.shadowOffset) {
        u.shadowOffset.value.set(MOON_PHASES['full'].x, MOON_PHASES['full'].y);
    }
    if (u.shadowCoverage) {
        u.shadowCoverage.value = 0.5;
    }
    if (u.shadowSoftness) {
        u.shadowSoftness.value = 0.05;
    }

    // Blood moon / lunar eclipse effects
    if (u.eclipseProgress) {
        u.eclipseProgress.value = 0.0;
    }
    if (u.eclipseIntensity) {
        u.eclipseIntensity.value = 0.0;
    }
    if (u.bloodMoonColor) {
        u.bloodMoonColor.value = [0.85, 0.18, 0.08];
    }
    if (u.emissiveStrength) {
        u.emissiveStrength.value = 0.39;
    }
    if (u.eclipseShadowPos) {
        u.eclipseShadowPos.value = [-2.0, 0.0];
    }
    if (u.eclipseShadowRadius) {
        u.eclipseShadowRadius.value = 1.2;
    }
    if (u.shadowDarkness) {
        u.shadowDarkness.value = 0.53;
    }

    // Eclipse color grading
    if (u.eclipseShadowColor) {
        u.eclipseShadowColor.value = [1.00, 0.58, 0.00];
    }
    if (u.eclipseMidtoneColor) {
        u.eclipseMidtoneColor.value = [0.71, 0.43, 0.03];
    }
    if (u.eclipseHighlightColor) {
        u.eclipseHighlightColor.value = [1.00, 0.28, 0.10];
    }
    if (u.eclipseGlowColor) {
        u.eclipseGlowColor.value = [0.09, 0.09, 0.09];
    }
    if (u.eclipseBrightnessModel) {
        u.eclipseBrightnessModel.value = 0.0;
    }

    // Blend layers - reset to calibrated defaults
    if (u.layer1Mode) u.layer1Mode.value = 9.0;  // Vivid Light
    if (u.layer1Strength) u.layer1Strength.value = 0.322;
    if (u.layer1Enabled) u.layer1Enabled.value = 1.0;

    if (u.layer2Mode) u.layer2Mode.value = 0.0;  // Multiply
    if (u.layer2Strength) u.layer2Strength.value = 2.785;
    if (u.layer2Enabled) u.layer2Enabled.value = 1.0;

    if (u.layer3Mode) u.layer3Mode.value = 7.0;  // Overlay
    if (u.layer3Strength) u.layer3Strength.value = 0.199;
    if (u.layer3Enabled) u.layer3Enabled.value = 1.0;

    if (u.layer4Mode) u.layer4Mode.value = 0.0;
    if (u.layer4Strength) u.layer4Strength.value = 0.0;
    if (u.layer4Enabled) u.layer4Enabled.value = 0.0;

    // Reset opacity to full
    if (u.opacity) {
        u.opacity.value = 1.0;
    }

}

/**
 * Reset sun material to default state
 * Clears: solar eclipse state, shadow position, blend layers
 *
 * @param {THREE.ShaderMaterial} material - Sun shader material
 */
export function resetSun(material) {
    if (!material || !material.uniforms) {
        return;
    }

    const u = material.uniforms;

    // Solar eclipse - reset to no eclipse
    if (u.eclipseProgress) {
        u.eclipseProgress.value = 0.0;
    }
    if (u.eclipseShadowPos) {
        u.eclipseShadowPos.value = [-2.0, 0.0];  // Off-screen
    }
    if (u.eclipseShadowRadius) {
        u.eclipseShadowRadius.value = 0.882;
    }
    if (u.shadowDarkness) {
        u.shadowDarkness.value = 1.0;  // Sun shadow is always 100%
    }

    // Standard shadow (legacy/fallback)
    if (u.shadowOffset) {
        u.shadowOffset.value.set(200.0, 0.0);  // Far off-screen
    }
    if (u.shadowCoverage) {
        u.shadowCoverage.value = 0.5;
    }
    if (u.shadowSoftness) {
        u.shadowSoftness.value = 0.1;
    }

    // Blend layers - reset to sun defaults
    if (u.layer1Mode) u.layer1Mode.value = 0.0;  // Multiply
    if (u.layer1Strength) u.layer1Strength.value = 0.230;
    if (u.layer1Enabled) u.layer1Enabled.value = 1.0;

    if (u.layer2Mode) u.layer2Mode.value = 0.0;
    if (u.layer2Strength) u.layer2Strength.value = 0.0;
    if (u.layer2Enabled) u.layer2Enabled.value = 0.0;

    if (u.layer3Mode) u.layer3Mode.value = 0.0;
    if (u.layer3Strength) u.layer3Strength.value = 0.0;
    if (u.layer3Enabled) u.layer3Enabled.value = 0.0;

    if (u.layer4Mode) u.layer4Mode.value = 0.0;
    if (u.layer4Strength) u.layer4Strength.value = 0.0;
    if (u.layer4Enabled) u.layer4Enabled.value = 0.0;

    // Reset emissive intensity to default
    if (u.emissiveIntensity) {
        u.emissiveIntensity.value = 4.0;
    }

    // Reset opacity to full
    if (u.opacity) {
        u.opacity.value = 1.0;
    }

    // Reset time (prevents odd animation state on return)
    if (u.time) {
        u.time.value = 0;
    }

}

/**
 * Reset crystal material to default state
 * Clears: blend layers, frostiness, glow settings
 *
 * @param {THREE.ShaderMaterial} material - Crystal shader material
 */
export function resetCrystal(material) {
    if (!material || !material.uniforms) {
        return;
    }

    const u = material.uniforms;
    const defaults = CRYSTAL_DEFAULT_UNIFORMS;

    // Crystal appearance
    if (u.frostiness) u.frostiness.value = defaults.frostiness;
    if (u.fresnelPower) u.fresnelPower.value = defaults.fresnelPower;
    if (u.fresnelIntensity) u.fresnelIntensity.value = defaults.fresnelIntensity;
    if (u.innerGlowStrength) u.innerGlowStrength.value = defaults.innerGlowStrength;
    if (u.surfaceRoughness) u.surfaceRoughness.value = defaults.surfaceRoughness;

    // Noise scales
    if (u.surfaceNoiseScale) u.surfaceNoiseScale.value = defaults.surfaceNoiseScale;
    if (u.noiseFrequency) u.noiseFrequency.value = defaults.noiseFrequency;

    // Internal caustics
    if (u.causticIntensity) u.causticIntensity.value = defaults.causticIntensity;
    if (u.causticScale) u.causticScale.value = defaults.causticScale;
    if (u.causticSpeed) u.causticSpeed.value = defaults.causticSpeed;

    // Texture
    if (u.textureStrength) u.textureStrength.value = defaults.textureStrength;

    // Blend layers
    if (u.layer1Mode) u.layer1Mode.value = defaults.layer1Mode;
    if (u.layer1Strength) u.layer1Strength.value = defaults.layer1Strength;
    if (u.layer1Enabled) u.layer1Enabled.value = defaults.layer1Enabled;

    if (u.layer2Mode) u.layer2Mode.value = defaults.layer2Mode;
    if (u.layer2Strength) u.layer2Strength.value = defaults.layer2Strength;
    if (u.layer2Enabled) u.layer2Enabled.value = defaults.layer2Enabled;

    if (u.layer3Mode) u.layer3Mode.value = defaults.layer3Mode;
    if (u.layer3Strength) u.layer3Strength.value = defaults.layer3Strength;
    if (u.layer3Enabled) u.layer3Enabled.value = defaults.layer3Enabled;

    if (u.layer4Mode) u.layer4Mode.value = defaults.layer4Mode;
    if (u.layer4Strength) u.layer4Strength.value = defaults.layer4Strength;
    if (u.layer4Enabled) u.layer4Enabled.value = defaults.layer4Enabled;

    // Glow (preserve emotion color, just reset intensity)
    if (u.glowIntensity) u.glowIntensity.value = defaults.glowIntensity;

    // Reset opacity to full
    if (u.opacity) u.opacity.value = defaults.opacity;

    // Reset time
    if (u.time) u.time.value = defaults.time;

}

/**
 * Reset material state based on geometry type
 * Dispatcher function that calls the appropriate reset function
 *
 * @param {string} geometryType - The geometry type ('moon', 'sun', 'crystal')
 * @param {THREE.ShaderMaterial} material - The material to reset
 */
export function resetGeometryState(geometryType, material) {
    switch (geometryType) {
    case 'moon':
        resetMoon(material);
        break;
    case 'sun':
        resetSun(material);
        break;
    case 'crystal':
    case 'diamond':
        resetCrystal(material);
        break;
    default:
    }
}

/**
 * Get default state for a geometry type
 * Returns an object with all default uniform values
 *
 * @param {string} geometryType - The geometry type
 * @returns {Object|null} Default uniform values or null
 */
export function getDefaultState(geometryType) {
    switch (geometryType) {
    case 'moon':
        return {
            shadowOffset: { x: MOON_PHASES['full'].x, y: MOON_PHASES['full'].y },
            eclipseProgress: 0.0,
            eclipseIntensity: 0.0,
            bloodMoonColor: [0.85, 0.18, 0.08],
            blendMode: 0.0,
            blendStrength: 2.0
        };
    case 'sun':
        return {
            eclipseProgress: 0.0,
            eclipseShadowPos: [-2.0, 0.0],
            shadowOffset: { x: 200.0, y: 0.0 }
        };
    case 'crystal':
    case 'diamond':
        return { ...CRYSTAL_DEFAULT_UNIFORMS };
    default:
        return null;
    }
}

export default {
    resetMoon,
    resetSun,
    resetCrystal,
    resetGeometryState,
    getDefaultState
};
