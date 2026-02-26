/**
 * Material Factory - Creates geometry-specific materials
 */

import * as THREE from 'three';
import { createMoonShadowMaterial, createMoonMultiplexerMaterial } from '../geometries/Moon.js';
import { createSunMaterial } from '../geometries/Sun.js';
import { getCrystalShaders, CRYSTAL_DEFAULT_UNIFORMS } from '../shaders/crystalWithSoul.js';
import { SSS_PRESETS } from '../shaders/utils/subsurfaceScattering.js';
import { DEFORMATION_DEFAULT_UNIFORMS } from '../shaders/utils/deformation.js';
import { CRACK_DEFAULT_UNIFORMS } from '../shaders/utils/objectSpaceCracks.js';

export function createCustomMaterial(geometryType, geometryConfig, options = {}) {
    const {
        glowColor = [1.0, 1.0, 0.95],
        glowIntensity = 1.0,
        materialVariant = null,
        emotionData = null,
        assetBasePath = '/assets',
        onTextureReady = null,
    } = options;

    if (geometryConfig.material === 'custom') {
        return createCustomTypeMaterial(
            geometryType,
            glowColor,
            glowIntensity,
            materialVariant,
            emotionData,
            assetBasePath,
            onTextureReady
        );
    }

    if (geometryConfig.material === 'emissive') {
        return createEmissiveMaterial(
            geometryType,
            glowColor,
            glowIntensity,
            materialVariant,
            emotionData,
            assetBasePath
        );
    }

    return null;
}

function createCustomTypeMaterial(
    geometryType,
    glowColor,
    glowIntensity,
    materialVariant,
    _emotionData,
    assetBasePath,
    onTextureReady
) {
    const textureLoader = new THREE.TextureLoader();

    switch (geometryType) {
        case 'moon':
            return createMoonMaterial(
                textureLoader,
                glowColor,
                glowIntensity,
                materialVariant,
                assetBasePath,
                onTextureReady
            );
        case 'crystal':
            // Uses quartz SSS preset for clear crystal appearance
            return createCrystalMaterial(
                glowColor,
                glowIntensity,
                'crystal',
                { sssPreset: 'quartz' },
                assetBasePath
            );
        case 'rough':
            // Custom crystal appearance for rough stone, uses crystal SSS preset
            return createCrystalMaterial(
                glowColor,
                glowIntensity,
                'rough',
                {
                    frostiness: 0.05,
                    innerGlowStrength: 0.0,
                    fresnelIntensity: 1.6,
                },
                assetBasePath
            );
        case 'heart':
            // Custom crystal appearance for heart - tuned for flat geometry
            return createCrystalMaterial(
                glowColor,
                glowIntensity,
                'heart',
                {
                    frostiness: 0.475,
                    innerGlowStrength: 0.117,
                    fresnelIntensity: 1.206,
                },
                assetBasePath
            );
        case 'star':
            // Star crystal with citrine SSS preset
            return createCrystalMaterial(
                glowColor,
                glowIntensity,
                'star',
                { sssPreset: 'citrine' },
                assetBasePath
            );
        default:
            console.warn('Unknown custom material type:', geometryType);
            return null;
    }
}

function createEmissiveMaterial(
    geometryType,
    glowColor,
    glowIntensity,
    materialVariant,
    emotionData,
    assetBasePath
) {
    const textureLoader = new THREE.TextureLoader();

    switch (geometryType) {
        case 'sun':
            return createSunMaterialWrapper(
                textureLoader,
                glowColor,
                glowIntensity,
                materialVariant,
                emotionData,
                assetBasePath
            );
        default:
            console.warn('Unknown emissive material type:', geometryType);
            return null;
    }
}

function createCrystalMaterial(
    glowColor,
    glowIntensity,
    textureType = 'crystal',
    overrides = {},
    assetBasePath = '/assets'
) {
    const { vertexShader, fragmentShader } = getCrystalShaders();

    // Load texture based on geometry type
    let crystalTexture = null;
    if (textureType) {
        const textureLoader = new THREE.TextureLoader();
        const texturePaths = {
            crystal: `${assetBasePath}/textures/Crystal/crystal.png`,
            rough: `${assetBasePath}/textures/Crystal/rough.png`,
            heart: `${assetBasePath}/textures/Crystal/heart.png`,
            star: `${assetBasePath}/textures/Crystal/star.png`,
        };
        const texturePath = texturePaths[textureType] || texturePaths.crystal;
        crystalTexture = textureLoader.load(texturePath, undefined, err =>
            console.warn(`💎 ${textureType} texture failed to load:`, err)
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
            fresnelPower: {
                value: overrides.fresnelPower ?? CRYSTAL_DEFAULT_UNIFORMS.fresnelPower,
            },
            fresnelIntensity: {
                value: overrides.fresnelIntensity ?? CRYSTAL_DEFAULT_UNIFORMS.fresnelIntensity,
            },
            innerGlowStrength: {
                value: overrides.innerGlowStrength ?? CRYSTAL_DEFAULT_UNIFORMS.innerGlowStrength,
            },
            surfaceRoughness: { value: CRYSTAL_DEFAULT_UNIFORMS.surfaceRoughness },
            // Enhanced lighting uniforms
            shadowDarkness: {
                value: overrides.shadowDarkness ?? CRYSTAL_DEFAULT_UNIFORMS.shadowDarkness,
            },
            specularIntensity: {
                value: overrides.specularIntensity ?? CRYSTAL_DEFAULT_UNIFORMS.specularIntensity,
            },
            specularPower: {
                value: overrides.specularPower ?? CRYSTAL_DEFAULT_UNIFORMS.specularPower,
            },
            transmissionContrast: {
                value:
                    overrides.transmissionContrast ?? CRYSTAL_DEFAULT_UNIFORMS.transmissionContrast,
            },
            minBrightness: {
                value: overrides.minBrightness ?? CRYSTAL_DEFAULT_UNIFORMS.minBrightness,
            },
            surfaceNoiseScale: { value: CRYSTAL_DEFAULT_UNIFORMS.surfaceNoiseScale },
            noiseFrequency: { value: CRYSTAL_DEFAULT_UNIFORMS.noiseFrequency },
            // Internal caustics
            causticIntensity: {
                value: overrides.causticIntensity ?? CRYSTAL_DEFAULT_UNIFORMS.causticIntensity,
            },
            causticScale: {
                value: overrides.causticScale ?? CRYSTAL_DEFAULT_UNIFORMS.causticScale,
            },
            causticSpeed: {
                value: overrides.causticSpeed ?? CRYSTAL_DEFAULT_UNIFORMS.causticSpeed,
            },
            crystalTexture: { value: crystalTexture },
            // Heart texture slightly more transparent than crystal
            textureStrength: {
                value:
                    textureType === 'heart'
                        ? 0.35
                        : textureType
                          ? CRYSTAL_DEFAULT_UNIFORMS.textureStrength
                          : 0.0,
            },
            // Soul refraction - samples soul texture with optical distortion
            soulTexture: { value: null }, // Set by ThreeRenderer at render time
            resolution: {
                value: new THREE.Vector2(
                    CRYSTAL_DEFAULT_UNIFORMS.resolution[0],
                    CRYSTAL_DEFAULT_UNIFORMS.resolution[1]
                ),
            },
            soulTextureSize: {
                value: new THREE.Vector2(
                    CRYSTAL_DEFAULT_UNIFORMS.soulTextureSize[0],
                    CRYSTAL_DEFAULT_UNIFORMS.soulTextureSize[1]
                ),
            },
            soulScreenCenter: {
                value: new THREE.Vector2(
                    CRYSTAL_DEFAULT_UNIFORMS.soulScreenCenter[0],
                    CRYSTAL_DEFAULT_UNIFORMS.soulScreenCenter[1]
                ),
            },
            refractionIndex: {
                value: overrides.refractionIndex ?? CRYSTAL_DEFAULT_UNIFORMS.refractionIndex,
            },
            refractionStrength: {
                value: overrides.refractionStrength ?? CRYSTAL_DEFAULT_UNIFORMS.refractionStrength,
            },
            // Physically-based subsurface scattering
            sssStrength: {
                value:
                    overrides.sssStrength ??
                    sssPreset?.sssStrength ??
                    CRYSTAL_DEFAULT_UNIFORMS.sssStrength,
            },
            sssAbsorption: {
                value: new THREE.Vector3(
                    ...(overrides.sssAbsorption ??
                        sssPreset?.sssAbsorption ??
                        CRYSTAL_DEFAULT_UNIFORMS.sssAbsorption)
                ),
            },
            sssScatterDistance: {
                value: new THREE.Vector3(
                    ...(overrides.sssScatterDistance ??
                        sssPreset?.sssScatterDistance ??
                        CRYSTAL_DEFAULT_UNIFORMS.sssScatterDistance)
                ),
            },
            sssThicknessBias: {
                value:
                    overrides.sssThicknessBias ??
                    sssPreset?.sssThicknessBias ??
                    CRYSTAL_DEFAULT_UNIFORMS.sssThicknessBias,
            },
            sssThicknessScale: {
                value:
                    overrides.sssThicknessScale ??
                    sssPreset?.sssThicknessScale ??
                    CRYSTAL_DEFAULT_UNIFORMS.sssThicknessScale,
            },
            sssCurvatureScale: {
                value:
                    overrides.sssCurvatureScale ??
                    sssPreset?.sssCurvatureScale ??
                    CRYSTAL_DEFAULT_UNIFORMS.sssCurvatureScale,
            },
            sssAmbient: {
                value:
                    overrides.sssAmbient ??
                    sssPreset?.sssAmbient ??
                    CRYSTAL_DEFAULT_UNIFORMS.sssAmbient,
            },
            sssLightDir: {
                value: new THREE.Vector3(
                    ...(overrides.sssLightDir ?? CRYSTAL_DEFAULT_UNIFORMS.sssLightDir)
                ),
            },
            sssLightColor: {
                value: new THREE.Vector3(
                    ...(overrides.sssLightColor ?? CRYSTAL_DEFAULT_UNIFORMS.sssLightColor)
                ),
            },
            // Emotion color bleed - how much soul color tints the gem
            emotionColorBleed: {
                value: overrides.emotionColorBleed ?? sssPreset?.emotionColorBleed ?? 0.0,
            },
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
            sssLayer2Enabled: { value: CRYSTAL_DEFAULT_UNIFORMS.sssLayer2Enabled },
            // ═══════════════════════════════════════════════════════════════
            // DEFORMATION UNIFORMS - Localized vertex displacement
            // Values from deformation.js utility module
            // ═══════════════════════════════════════════════════════════════
            deformationStrength: { value: DEFORMATION_DEFAULT_UNIFORMS.deformationStrength },
            impactPoint: { value: new THREE.Vector3(...DEFORMATION_DEFAULT_UNIFORMS.impactPoint) },
            deformationFalloff: { value: DEFORMATION_DEFAULT_UNIFORMS.deformationFalloff },
            // ═══════════════════════════════════════════════════════════════
            // OBJECT-SPACE CRACK UNIFORMS - Persistent damage
            // Values from objectSpaceCracks.js utility module
            // ═══════════════════════════════════════════════════════════════
            crackImpact0: { value: new THREE.Vector3(...CRACK_DEFAULT_UNIFORMS.crackImpact0) },
            crackImpact1: { value: new THREE.Vector3(...CRACK_DEFAULT_UNIFORMS.crackImpact1) },
            crackImpact2: { value: new THREE.Vector3(...CRACK_DEFAULT_UNIFORMS.crackImpact2) },
            crackDirection0: {
                value: new THREE.Vector3(...CRACK_DEFAULT_UNIFORMS.crackDirection0),
            },
            crackDirection1: {
                value: new THREE.Vector3(...CRACK_DEFAULT_UNIFORMS.crackDirection1),
            },
            crackDirection2: {
                value: new THREE.Vector3(...CRACK_DEFAULT_UNIFORMS.crackDirection2),
            },
            crackParams0: { value: new THREE.Vector3(...CRACK_DEFAULT_UNIFORMS.crackParams0) },
            crackParams1: { value: new THREE.Vector3(...CRACK_DEFAULT_UNIFORMS.crackParams1) },
            crackParams2: { value: new THREE.Vector3(...CRACK_DEFAULT_UNIFORMS.crackParams2) },
            crackNumImpacts: { value: CRACK_DEFAULT_UNIFORMS.crackNumImpacts },
            crackColor: { value: new THREE.Color(...CRACK_DEFAULT_UNIFORMS.crackColor) },
            crackGlowColor: { value: new THREE.Color(...CRACK_DEFAULT_UNIFORMS.crackGlowColor) },
            crackGlowStrength: { value: CRACK_DEFAULT_UNIFORMS.crackGlowStrength },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: true, // Soul renders to separate RT via texture sampling, not depth
        blending: THREE.NormalBlending,
    });

    return { material, type: 'crystal' };
}

function createMoonMaterial(
    textureLoader,
    glowColor,
    glowIntensity,
    materialVariant = null,
    assetBasePath = '/assets',
    onTextureReady = null
) {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
    const resolution = isMobile ? '2k' : '4k';

    if (materialVariant === 'multiplexer') {
        const material = createMoonMultiplexerMaterial(textureLoader, {
            resolution,
            glowColor: new THREE.Color(glowColor[0], glowColor[1], glowColor[2]),
            glowIntensity,
            assetBasePath,
            onTextureReady,
        });
        return { material, type: 'moon-multiplexer' };
    }

    const material = createMoonShadowMaterial(textureLoader, {
        resolution,
        glowColor: new THREE.Color(glowColor[0], glowColor[1], glowColor[2]),
        glowIntensity,
        moonPhase: 'full',
        assetBasePath,
        onTextureReady,
    });

    return { material, type: 'moon' };
}

function createSunMaterialWrapper(
    textureLoader,
    glowColor,
    glowIntensity,
    materialVariant = null,
    _emotionData = null,
    assetBasePath = '/assets'
) {
    const material = createSunMaterial(textureLoader, {
        glowColor,
        glowIntensity,
        resolution: '4k',
        materialVariant,
        assetBasePath,
    });
    return { material, type: 'sun' };
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
