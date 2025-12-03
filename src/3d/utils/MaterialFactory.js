/**
 * Material Factory - Creates geometry-specific materials
 */

import * as THREE from 'three';
import { createMoonShadowMaterial, createMoonMultiplexerMaterial } from '../geometries/Moon.js';
import { createSunMaterial } from '../geometries/Sun.js';
import { createBlackHoleMaterial } from '../geometries/BlackHole.js';
import { getCrystalShaders, CRYSTAL_DEFAULT_UNIFORMS } from '../shaders/crystalWithSoul.js';

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
        return createCrystalMaterial(glowColor, glowIntensity, 'crystal', {
            frostiness: 0.30,
            innerGlowStrength: 0.10,
            fresnelIntensity: 0.20,
            sssStrength: 0.20
        });  // Crystal texture with tuned settings
    case 'rough':
        return createCrystalMaterial(glowColor, glowIntensity, 'rough', {
            frostiness: 0.05,
            innerGlowStrength: 0.0,
            fresnelIntensity: 1.6,
            sssStrength: 0.8
        });  // Rough texture with SSS
    case 'heart':
        return createCrystalMaterial(glowColor, glowIntensity, 'heart', {
            frostiness: 0.05,           // Low frost - more transparent shell
            innerGlowStrength: 0.0,     // Soul provides the glow
            fresnelIntensity: 1.4,      // Strong edge glow
            sssStrength: 0.6            // Light scatters through
        });    // Heart texture with transparent shell
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
            surfaceNoiseScale: { value: CRYSTAL_DEFAULT_UNIFORMS.surfaceNoiseScale },
            innerWispScale: { value: CRYSTAL_DEFAULT_UNIFORMS.innerWispScale },
            noiseFrequency: { value: CRYSTAL_DEFAULT_UNIFORMS.noiseFrequency },
            crystalTexture: { value: crystalTexture },
            // Heart texture slightly more transparent than crystal
            textureStrength: { value: textureType === 'heart' ? 0.35 : (textureType ? CRYSTAL_DEFAULT_UNIFORMS.textureStrength : 0.0) },
            // Subsurface scattering
            sssStrength: { value: overrides.sssStrength ?? CRYSTAL_DEFAULT_UNIFORMS.sssStrength },
            sssDistortion: { value: overrides.sssDistortion ?? CRYSTAL_DEFAULT_UNIFORMS.sssDistortion },
            sssColor: { value: new THREE.Color(CRYSTAL_DEFAULT_UNIFORMS.sssColor[0], CRYSTAL_DEFAULT_UNIFORMS.sssColor[1], CRYSTAL_DEFAULT_UNIFORMS.sssColor[2]) },
            layer1Mode: { value: CRYSTAL_DEFAULT_UNIFORMS.layer1Mode },
            layer1Strength: { value: CRYSTAL_DEFAULT_UNIFORMS.layer1Strength },
            layer1Enabled: { value: CRYSTAL_DEFAULT_UNIFORMS.layer1Enabled },
            layer2Mode: { value: CRYSTAL_DEFAULT_UNIFORMS.layer2Mode },
            layer2Strength: { value: CRYSTAL_DEFAULT_UNIFORMS.layer2Strength },
            layer2Enabled: { value: CRYSTAL_DEFAULT_UNIFORMS.layer2Enabled },
            layer3Mode: { value: CRYSTAL_DEFAULT_UNIFORMS.layer3Mode },
            layer3Strength: { value: CRYSTAL_DEFAULT_UNIFORMS.layer3Strength },
            layer3Enabled: { value: CRYSTAL_DEFAULT_UNIFORMS.layer3Enabled },
            layer4Mode: { value: CRYSTAL_DEFAULT_UNIFORMS.layer4Mode },
            layer4Strength: { value: CRYSTAL_DEFAULT_UNIFORMS.layer4Strength },
            layer4Enabled: { value: CRYSTAL_DEFAULT_UNIFORMS.layer4Enabled }
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
