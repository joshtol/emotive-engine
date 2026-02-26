/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Material Analyzer
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Extracts material properties from source meshes for dynamic shard materials
 * @author Emotive Engine Team
 * @module effects/shatter/MaterialAnalyzer
 *
 * ## Purpose
 *
 * When a mesh shatters, shards should look like fragments of that mesh, not generic crystal.
 * This module analyzes source materials (custom shaders, standard materials, etc.) and
 * extracts visual properties to create matching shard materials.
 *
 * ## Architecture
 *
 * Different geometry types use different material systems:
 * - Crystal: Custom shader with emotionColor, glowColor uniforms
 * - Sun: Emissive fire shader with coreColor, coronaColor
 * - Moon: MeshPhysicalMaterial with texture maps
 * - Standard: MeshStandardMaterial or MeshPhysicalMaterial
 *
 * SHADER_EXTRACTORS provides type-specific extraction logic for each material system.
 */

import * as THREE from 'three';

/**
 * Type-specific material property extractors
 * Each extractor returns a normalized property set for shard material creation
 */
const SHADER_EXTRACTORS = {
    /**
     * Crystal geometry - custom shader with emotion-driven colors
     */
    crystal: material => {
        const uniforms = material?.uniforms;
        return {
            type: 'physical',
            color: uniforms?.emotionColor?.value?.clone() || new THREE.Color(0x9966ff),
            emissive: uniforms?.glowColor?.value?.clone() || new THREE.Color(0x6633cc),
            emissiveIntensity: 0.4,
            transmission: 0.3,
            roughness: 0.15,
            metalness: 0.0,
            ior: 1.5,
            thickness: 0.2,
            iridescence: 0.2,
            clearcoat: 0.3,
            map: null, // Crystal uses procedural patterns
        };
    },

    /**
     * Rough crystal variant - same as crystal but slightly different defaults
     */
    rough: material => {
        const uniforms = material?.uniforms;
        return {
            type: 'physical',
            color: uniforms?.emotionColor?.value?.clone() || new THREE.Color(0x8866dd),
            emissive: uniforms?.glowColor?.value?.clone() || new THREE.Color(0x5533aa),
            emissiveIntensity: 0.3,
            transmission: 0.2,
            roughness: 0.35, // Rougher surface
            metalness: 0.0,
            ior: 1.4,
            thickness: 0.2,
            iridescence: 0.1,
            clearcoat: 0.2,
            map: null,
        };
    },

    /**
     * Heart geometry - emotion-colored crystal variant
     */
    heart: material => {
        const uniforms = material?.uniforms;
        return {
            type: 'physical',
            color: uniforms?.emotionColor?.value?.clone() || new THREE.Color(0xff4488),
            emissive: uniforms?.glowColor?.value?.clone() || new THREE.Color(0xcc2266),
            emissiveIntensity: 0.5,
            transmission: 0.25,
            roughness: 0.2,
            metalness: 0.0,
            ior: 1.5,
            thickness: 0.2,
            iridescence: 0.15,
            clearcoat: 0.25,
            map: null,
        };
    },

    /**
     * Star geometry - bright, glowing crystal variant
     */
    star: material => {
        const uniforms = material?.uniforms;
        return {
            type: 'physical',
            color: uniforms?.emotionColor?.value?.clone() || new THREE.Color(0xffdd44),
            emissive: uniforms?.glowColor?.value?.clone() || new THREE.Color(0xffaa00),
            emissiveIntensity: 0.7,
            transmission: 0.2,
            roughness: 0.1,
            metalness: 0.1,
            ior: 1.6,
            thickness: 0.15,
            iridescence: 0.3,
            clearcoat: 0.4,
            map: null,
        };
    },

    /**
     * Sun geometry - emissive fire material
     */
    sun: material => {
        const uniforms = material?.uniforms;
        return {
            type: 'physical',
            color: uniforms?.coreColor?.value?.clone() || new THREE.Color(0xffaa00),
            emissive: uniforms?.coronaColor?.value?.clone() || new THREE.Color(0xff6600),
            emissiveIntensity: 2.0,
            transmission: 0.0, // Sun is opaque fire
            roughness: 0.3,
            metalness: 0.0,
            ior: 1.0,
            thickness: 0.0,
            iridescence: 0.0,
            clearcoat: 0.0,
            map: null, // Sun is procedural fire
        };
    },

    /**
     * Moon geometry - ShaderMaterial with colorMap/normalMap uniforms
     * Moon uses custom shadow shader, not MeshPhysicalMaterial
     *
     * IMPORTANT: Moon has a texture map, so we use NEUTRAL emissive (white)
     * to avoid tinting the texture. The emissive provides subtle visibility
     * in shadow but shouldn't colorize the rocky surface.
     */
    moon: material => {
        const uniforms = material?.uniforms;

        return {
            type: 'physical',
            // Moon surface is grayish-white rocky - use white to let texture dominate
            color: new THREE.Color(0xffffff),
            // NEUTRAL emissive - don't tint the texture with colored glow
            emissive: new THREE.Color(0x888888),
            emissiveIntensity: 0.15, // Low intensity - texture should dominate
            transmission: 0.0, // Moon is opaque rock
            roughness: 0.85, // Rocky, not shiny
            metalness: 0.0,
            ior: 1.0,
            thickness: 0.0,
            iridescence: 0.0,
            clearcoat: 0.0,
            // Preserve texture from shader uniforms (colorMap, not map)
            map: uniforms?.colorMap?.value || null,
            normalMap: uniforms?.normalMap?.value || null,
        };
    },

    /**
     * Sphere - basic geometry fallback
     */
    sphere: material => {
        return SHADER_EXTRACTORS.default(material);
    },

    /**
     * Default extractor for unknown/standard materials
     */
    default: material => {
        // Handle both shader materials (with uniforms) and standard materials
        const uniforms = material?.uniforms;

        if (uniforms) {
            // Custom shader - try common uniform names
            return {
                type: 'physical',
                color:
                    uniforms.color?.value?.clone() ||
                    uniforms.baseColor?.value?.clone() ||
                    uniforms.diffuse?.value?.clone() ||
                    new THREE.Color(0x888888),
                emissive:
                    uniforms.emissive?.value?.clone() ||
                    uniforms.glowColor?.value?.clone() ||
                    new THREE.Color(0x000000),
                emissiveIntensity: uniforms.emissiveIntensity?.value ?? 0.3,
                transmission: 0.0,
                roughness: uniforms.roughness?.value ?? 0.5,
                metalness: uniforms.metalness?.value ?? 0.0,
                ior: 1.0,
                thickness: 0.0,
                iridescence: 0.0,
                clearcoat: 0.0,
                map: uniforms.map?.value || uniforms.diffuseMap?.value || null,
            };
        }

        // Standard material (MeshStandardMaterial, MeshPhysicalMaterial, etc.)
        return {
            type: 'physical',
            color: material?.color?.clone() || new THREE.Color(0x888888),
            emissive: material?.emissive?.clone() || new THREE.Color(0x000000),
            emissiveIntensity: material?.emissiveIntensity ?? 0.0,
            transmission: material?.transmission ?? 0.0,
            roughness: material?.roughness ?? 0.5,
            metalness: material?.metalness ?? 0.0,
            ior: material?.ior ?? 1.5,
            thickness: material?.thickness ?? 0.0,
            iridescence: material?.iridescence ?? 0.0,
            clearcoat: material?.clearcoat ?? 0.0,
            map: material?.map || null,
            normalMap: material?.normalMap || null,
        };
    },
};

/**
 * Extract material properties from a source mesh
 * @param {THREE.Material} material - Source material to analyze
 * @param {string} geometryType - Geometry type for type-specific extraction
 * @returns {Object} Normalized material properties
 */
export function extractMaterialProperties(material, geometryType) {
    const extractor = SHADER_EXTRACTORS[geometryType] || SHADER_EXTRACTORS.default;
    return extractor(material);
}

/**
 * Create a shard material from extracted properties
 * @param {Object} properties - Properties from extractMaterialProperties()
 * @returns {THREE.MeshPhysicalMaterial} Material for shards
 */
export function createShardBaseMaterial(properties) {
    const materialConfig = {
        color: properties.color,
        emissive: properties.emissive,
        emissiveIntensity: properties.emissiveIntensity,
        roughness: properties.roughness,
        metalness: properties.metalness,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
    };

    // Add physical properties if present
    if (properties.transmission > 0) {
        materialConfig.transmission = properties.transmission;
        materialConfig.thickness = properties.thickness || 0.2;
        materialConfig.ior = properties.ior || 1.5;
    }

    if (properties.iridescence > 0) {
        materialConfig.iridescence = properties.iridescence;
        materialConfig.iridescenceIOR = 1.3;
    }

    if (properties.clearcoat > 0) {
        materialConfig.clearcoat = properties.clearcoat;
        materialConfig.clearcoatRoughness = 0.2;
    }

    // Textures (if available)
    if (properties.map) {
        materialConfig.map = properties.map;
    }
    if (properties.normalMap) {
        materialConfig.normalMap = properties.normalMap;
    }

    return new THREE.MeshPhysicalMaterial(materialConfig);
}

/**
 * Apply per-shard color variation using HSL offset
 * Automatically detects "fiery" materials (high emissive) and applies more dramatic variation
 *
 * @param {THREE.MeshPhysicalMaterial} material - Material to vary
 * @param {Object} [options] - Variation options
 * @param {number} [options.hueRange=0.1] - Max hue shift (±5%)
 * @param {number} [options.satRange=0.1] - Max saturation shift (±5%)
 * @param {number} [options.lightRange=0.15] - Max lightness shift (±7.5%)
 */
export function applyShardVariation(material, options = {}) {
    // Detect "fiery" materials like sun - high emissive intensity indicates fire/glow
    const isFiery = material.emissiveIntensity >= 1.5;

    const { hueRange = 0.1, satRange = 0.1, lightRange = 0.15 } = options;

    // Clone the color before modifying
    const color = material.color.clone();

    if (isFiery) {
        // FIERY VARIATION: Use RGB lerp instead of HSL to avoid hue wrap-around
        // Create a spectrum from bright yellow through orange to deep orange
        // GREEN FLOOR: Must stay >= 0.2 to look like fire, not brown
        const lerpFactor = Math.random();

        // Moderate color shift - yellow to orange to deep orange (NOT brown)
        // lerpFactor 0-0.3: stay yellow-ish (white-hot)
        // lerpFactor 0.3-0.7: shift to orange
        // lerpFactor 0.7-1.0: shift to deep orange
        const orangeShift = lerpFactor * 0.5; // Max 50% shift
        color.r = Math.min(1.0, color.r + orangeShift * 0.05);
        color.g = Math.max(0.35, color.g - orangeShift * 0.6); // GREEN FLOOR 0.35 - keeps fire look
        color.b = Math.max(0.0, color.b - orangeShift * 0.2);

        // Brightness variation - bias toward brighter (white-hot)
        const brightnessVar = (Math.random() - 0.2) * 0.2; // Slight bright bias
        color.r = Math.min(1.0, Math.max(0.8, color.r + brightnessVar));
        color.g = Math.min(0.9, Math.max(0.2, color.g + brightnessVar * 0.5));
    } else {
        // Standard HSL variation for non-fiery materials
        color.offsetHSL(
            (Math.random() - 0.5) * hueRange,
            (Math.random() - 0.5) * satRange,
            (Math.random() - 0.5) * lightRange
        );
    }
    material.color = color;

    // Vary emissive color and intensity
    if (material.emissive) {
        const emissive = material.emissive.clone();

        if (isFiery) {
            // FIERY EMISSIVE: Variation for fire effect
            // GREEN FLOOR: Must stay >= 0.2 to look like fire, not brown
            const lerpFactor = Math.random();
            const orangeShift = lerpFactor * 0.4;
            emissive.r = Math.min(1.0, emissive.r + orangeShift * 0.1);
            emissive.g = Math.max(0.3, emissive.g - orangeShift * 0.5); // GREEN FLOOR 0.3
            emissive.b = Math.max(0.0, emissive.b - orangeShift * 0.3);

            // EMISSIVE INTENSITY VARIATION: Higher floor to prevent dark shards
            // Some shards white-hot (1.4x), none go too dim (0.85x minimum)
            const intensityVariation = 0.85 + Math.random() * 0.55; // Range 0.85x to 1.4x
            material.emissiveIntensity *= intensityVariation;
        } else {
            // Standard subtle emissive variation
            emissive.offsetHSL(
                (Math.random() - 0.5) * hueRange * 0.5,
                (Math.random() - 0.5) * satRange * 0.5,
                (Math.random() - 0.5) * lightRange * 0.5
            );
        }
        material.emissive = emissive;
    }
}
