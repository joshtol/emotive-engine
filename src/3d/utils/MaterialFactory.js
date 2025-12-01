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
        return createCrystalMaterial(glowColor, glowIntensity);
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

function createCrystalMaterial(glowColor, glowIntensity) {

    const { vertexShader, fragmentShader } = getCrystalShaders();

    // Load crystal texture
    const textureLoader = new THREE.TextureLoader();
    const crystalTexture = textureLoader.load('/assets/textures/Crystal/crystal.png',
        undefined,
        err => console.warn('💎 Crystal texture failed to load:', err)
    );

    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            emotionColor: { value: new THREE.Color(glowColor[0], glowColor[1], glowColor[2]) },
            glowIntensity: { value: glowIntensity },
            opacity: { value: 1.0 },
            frostiness: { value: CRYSTAL_DEFAULT_UNIFORMS.frostiness },
            fresnelPower: { value: CRYSTAL_DEFAULT_UNIFORMS.fresnelPower },
            fresnelIntensity: { value: CRYSTAL_DEFAULT_UNIFORMS.fresnelIntensity },
            innerGlowStrength: { value: CRYSTAL_DEFAULT_UNIFORMS.innerGlowStrength },
            surfaceRoughness: { value: CRYSTAL_DEFAULT_UNIFORMS.surfaceRoughness },
            surfaceNoiseScale: { value: CRYSTAL_DEFAULT_UNIFORMS.surfaceNoiseScale },
            innerWispScale: { value: CRYSTAL_DEFAULT_UNIFORMS.innerWispScale },
            noiseFrequency: { value: CRYSTAL_DEFAULT_UNIFORMS.noiseFrequency },
            crystalTexture: { value: crystalTexture },
            textureStrength: { value: CRYSTAL_DEFAULT_UNIFORMS.textureStrength },
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
        depthWrite: true,
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
