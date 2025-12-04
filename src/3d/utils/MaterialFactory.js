/**
 * Material Factory - Creates geometry-specific materials
 */

import * as THREE from 'three';
import { createMoonShadowMaterial, createMoonMultiplexerMaterial } from '../geometries/Moon.js';
import { createSunMaterial } from '../geometries/Sun.js';
import { createBlackHoleMaterial } from '../geometries/BlackHole.js';
import { getCrystalShaders, CRYSTAL_DEFAULT_UNIFORMS } from '../shaders/crystalWithSoul.js';
import { SSS_PRESETS } from '../shaders/utils/subsurfaceScattering.js';

export function createCustomMaterial(geometryType, geometryConfig, options = {}) {
    const { glowColor = [1.0, 1.0, 0.95], glowIntensity = 1.0, materialVariant = null, emotionData = null } = options;

    if (geometryConfig.material === 'custom') {
        return createCustomTypeMaterial(geometryType, glowColor, glowIntensity, materialVariant, emotionData);
    }

    if (geometryConfig.material === 'emissive') {
        return createEmissiveMaterial(geometryType, glowColor, glowIntensity, materialVariant, emotionData);
    }

    return null;
}

function createCustomTypeMaterial(geometryType, glowColor, glowIntensity, materialVariant, _emotionData) {
    const textureLoader = new THREE.TextureLoader();

    switch (geometryType) {
    case 'moon':
        return createMoonMaterial(textureLoader, glowColor, glowIntensity, materialVariant);
    case 'crystal':
        // Uses CRYSTAL_DEFAULT_UNIFORMS - no overrides needed
        return createCrystalMaterial(glowColor, glowIntensity, 'crystal', {});
    case 'rough':
        // Custom crystal appearance for rough stone, uses crystal SSS preset
        return createCrystalMaterial(glowColor, glowIntensity, 'rough', {
            frostiness: 0.05,
            innerGlowStrength: 0.0,
            fresnelIntensity: 1.6
        });
    case 'heart':
        // Custom crystal appearance for heart - tuned for flat geometry
        return createCrystalMaterial(glowColor, glowIntensity, 'heart', {
            frostiness: 0.475,
            innerGlowStrength: 0.117,
            fresnelIntensity: 1.206
        });
    default:
        console.warn('Unknown custom material type:', geometryType);
        return null;
    }
}

function createEmissiveMaterial(geometryType, glowColor, glowIntensity, materialVariant, emotionData) {
    const textureLoader = new THREE.TextureLoader();

    switch (geometryType) {
    case 'sun':
        return createSunMaterialWrapper(textureLoader, glowColor, glowIntensity, materialVariant, emotionData);
    case 'blackHole':
        return createBlackHoleMaterialWrapper(textureLoader, glowColor, glowIntensity, materialVariant, emotionData);
    default:
        console.warn('Unknown emissive material type:', geometryType);
        return null;
    }
}

function createCrystalMaterial(glowColor, glowIntensity, textureType = 'crystal', overrides = {}) {

    const { vertexShader, fragmentShader } = getCrystalShaders();

    // Load texture based on geometry type
    let crystalTexture = null;
    if (textureType) {
        const textureLoader = new THREE.TextureLoader();
        const texturePaths = {
            crystal: '/assets/textures/Crystal/crystal.png',
            rough: '/assets/textures/Crystal/rough.png',
            heart: '/assets/textures/Crystal/heart.png'
        };
        const texturePath = texturePaths[textureType] || texturePaths.crystal;
        crystalTexture = textureLoader.load(texturePath,
            undefined,
            err => console.warn(`💎 ${textureType} texture failed to load:`, err)
        );
    }

    // Get SSS preset if specified, otherwise use defaults
    const sssPreset = overrides.sssPreset ? SSS_PRESETS[overrides.sssPreset] : null;

    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            emotionColor: { value: new THREE.Color(glowColor[0], glowColor[1], glowColor[2]) },
            glowIntensity: { value: glowIntensity },
            opacity: { value: 1.0 },
            frostiness: { value: overrides.frostiness ?? CRYSTAL_DEFAULT_UNIFORMS.frostiness },
            fresnelPower: { value: overrides.fresnelPower ?? CRYSTAL_DEFAULT_UNIFORMS.fresnelPower },
            fresnelIntensity: { value: overrides.fresnelIntensity ?? CRYSTAL_DEFAULT_UNIFORMS.fresnelIntensity },
            innerGlowStrength: { value: overrides.innerGlowStrength ?? CRYSTAL_DEFAULT_UNIFORMS.innerGlowStrength },
            surfaceRoughness: { value: CRYSTAL_DEFAULT_UNIFORMS.surfaceRoughness },
            // Enhanced lighting uniforms
            shadowDarkness: { value: overrides.shadowDarkness ?? CRYSTAL_DEFAULT_UNIFORMS.shadowDarkness },
            specularIntensity: { value: overrides.specularIntensity ?? CRYSTAL_DEFAULT_UNIFORMS.specularIntensity },
            specularPower: { value: overrides.specularPower ?? CRYSTAL_DEFAULT_UNIFORMS.specularPower },
            transmissionContrast: { value: overrides.transmissionContrast ?? CRYSTAL_DEFAULT_UNIFORMS.transmissionContrast },
            minBrightness: { value: overrides.minBrightness ?? CRYSTAL_DEFAULT_UNIFORMS.minBrightness },
            surfaceNoiseScale: { value: CRYSTAL_DEFAULT_UNIFORMS.surfaceNoiseScale },
            innerWispScale: { value: CRYSTAL_DEFAULT_UNIFORMS.innerWispScale },
            noiseFrequency: { value: CRYSTAL_DEFAULT_UNIFORMS.noiseFrequency },
            crystalTexture: { value: crystalTexture },
            // Heart texture slightly more transparent than crystal
            textureStrength: { value: textureType === 'heart' ? 0.35 : (textureType ? CRYSTAL_DEFAULT_UNIFORMS.textureStrength : 0.0) },
            // Physically-based subsurface scattering
            sssStrength: { value: overrides.sssStrength ?? sssPreset?.sssStrength ?? CRYSTAL_DEFAULT_UNIFORMS.sssStrength },
            sssAbsorption: { value: new THREE.Vector3(
                ...(overrides.sssAbsorption ?? sssPreset?.sssAbsorption ?? CRYSTAL_DEFAULT_UNIFORMS.sssAbsorption)
            ) },
            sssScatterDistance: { value: new THREE.Vector3(
                ...(overrides.sssScatterDistance ?? sssPreset?.sssScatterDistance ?? CRYSTAL_DEFAULT_UNIFORMS.sssScatterDistance)
            ) },
            sssThicknessBias: { value: overrides.sssThicknessBias ?? sssPreset?.sssThicknessBias ?? CRYSTAL_DEFAULT_UNIFORMS.sssThicknessBias },
            sssThicknessScale: { value: overrides.sssThicknessScale ?? sssPreset?.sssThicknessScale ?? CRYSTAL_DEFAULT_UNIFORMS.sssThicknessScale },
            sssCurvatureScale: { value: overrides.sssCurvatureScale ?? sssPreset?.sssCurvatureScale ?? CRYSTAL_DEFAULT_UNIFORMS.sssCurvatureScale },
            sssAmbient: { value: overrides.sssAmbient ?? sssPreset?.sssAmbient ?? CRYSTAL_DEFAULT_UNIFORMS.sssAmbient },
            sssLightDir: { value: new THREE.Vector3(...(overrides.sssLightDir ?? CRYSTAL_DEFAULT_UNIFORMS.sssLightDir)) },
            sssLightColor: { value: new THREE.Vector3(...(overrides.sssLightColor ?? CRYSTAL_DEFAULT_UNIFORMS.sssLightColor)) },
            // Component-specific blend layers
            // Shell layers
            shellLayer1Mode: { value: CRYSTAL_DEFAULT_UNIFORMS.shellLayer1Mode },
            shellLayer1Strength: { value: CRYSTAL_DEFAULT_UNIFORMS.shellLayer1Strength },
            shellLayer1Enabled: { value: CRYSTAL_DEFAULT_UNIFORMS.shellLayer1Enabled },
            shellLayer2Mode: { value: CRYSTAL_DEFAULT_UNIFORMS.shellLayer2Mode },
            shellLayer2Strength: { value: CRYSTAL_DEFAULT_UNIFORMS.shellLayer2Strength },
            shellLayer2Enabled: { value: CRYSTAL_DEFAULT_UNIFORMS.shellLayer2Enabled },
            // Soul layers
            soulLayer1Mode: { value: CRYSTAL_DEFAULT_UNIFORMS.soulLayer1Mode },
            soulLayer1Strength: { value: CRYSTAL_DEFAULT_UNIFORMS.soulLayer1Strength },
            soulLayer1Enabled: { value: CRYSTAL_DEFAULT_UNIFORMS.soulLayer1Enabled },
            soulLayer2Mode: { value: CRYSTAL_DEFAULT_UNIFORMS.soulLayer2Mode },
            soulLayer2Strength: { value: CRYSTAL_DEFAULT_UNIFORMS.soulLayer2Strength },
            soulLayer2Enabled: { value: CRYSTAL_DEFAULT_UNIFORMS.soulLayer2Enabled },
            // Rim layers
            rimLayer1Mode: { value: CRYSTAL_DEFAULT_UNIFORMS.rimLayer1Mode },
            rimLayer1Strength: { value: CRYSTAL_DEFAULT_UNIFORMS.rimLayer1Strength },
            rimLayer1Enabled: { value: CRYSTAL_DEFAULT_UNIFORMS.rimLayer1Enabled },
            rimLayer2Mode: { value: CRYSTAL_DEFAULT_UNIFORMS.rimLayer2Mode },
            rimLayer2Strength: { value: CRYSTAL_DEFAULT_UNIFORMS.rimLayer2Strength },
            rimLayer2Enabled: { value: CRYSTAL_DEFAULT_UNIFORMS.rimLayer2Enabled },
            // SSS layers
            sssLayer1Mode: { value: CRYSTAL_DEFAULT_UNIFORMS.sssLayer1Mode },
            sssLayer1Strength: { value: CRYSTAL_DEFAULT_UNIFORMS.sssLayer1Strength },
            sssLayer1Enabled: { value: CRYSTAL_DEFAULT_UNIFORMS.sssLayer1Enabled },
            sssLayer2Mode: { value: CRYSTAL_DEFAULT_UNIFORMS.sssLayer2Mode },
            sssLayer2Strength: { value: CRYSTAL_DEFAULT_UNIFORMS.sssLayer2Strength },
            sssLayer2Enabled: { value: CRYSTAL_DEFAULT_UNIFORMS.sssLayer2Enabled }
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,  // Don't write depth so inner soul can render through
        blending: THREE.NormalBlending
    });


    return { material, type: 'crystal' };
}

function createMoonMaterial(textureLoader, glowColor, glowIntensity, materialVariant = null) {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const resolution = isMobile ? '2k' : '4k';

    if (materialVariant === 'multiplexer') {
        const material = createMoonMultiplexerMaterial(textureLoader, {
            resolution,
            glowColor: new THREE.Color(glowColor[0], glowColor[1], glowColor[2]),
            glowIntensity
        });
        return { material, type: 'moon-multiplexer' };
    }

    const material = createMoonShadowMaterial(textureLoader, {
        resolution,
        glowColor: new THREE.Color(glowColor[0], glowColor[1], glowColor[2]),
        glowIntensity,
        moonPhase: 'full'
    });

    return { material, type: 'moon' };
}

function createSunMaterialWrapper(textureLoader, glowColor, glowIntensity, materialVariant = null, _emotionData = null) {
    const material = createSunMaterial(textureLoader, {
        glowColor,
        glowIntensity,
        resolution: '4k',
        materialVariant
    });
    return { material, type: 'sun' };
}

function createBlackHoleMaterialWrapper(textureLoader, glowColor, glowIntensity, materialVariant = null, emotionData = null) {
    const { diskMaterial, shadowMaterial } = createBlackHoleMaterial(textureLoader, {
        glowColor,
        glowIntensity,
        materialVariant,
        emotionData
    });
    return { material: { diskMaterial, shadowMaterial }, type: 'blackHole' };
}

export function disposeCustomMaterial(customMaterial) {
    if (!customMaterial) return;
    if (customMaterial.map) customMaterial.map.dispose();
    if (customMaterial.normalMap) customMaterial.normalMap.dispose();
    if (customMaterial.emissiveMap) customMaterial.emissiveMap.dispose();
    if (customMaterial.roughnessMap) customMaterial.roughnessMap.dispose();
    if (customMaterial.metalnessMap) customMaterial.metalnessMap.dispose();
}

export default { createCustomMaterial, disposeCustomMaterial };
