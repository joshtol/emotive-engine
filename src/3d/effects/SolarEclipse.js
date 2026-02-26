/**
 * Solar Eclipse Effect Manager
 *
 * Orchestrates solar eclipse shadow disk and corona effects.
 * Supports annular and total eclipses with billboarded rendering.
 *
 * SYNCHRONIZATION ARCHITECTURE:
 * - The eclipse effects are updated in ThreeRenderer.render() AFTER sun transforms
 *   are applied to ensure shadow/corona position matches the current frame's sun
 *   position, preventing visible lag during gesture animations.
 * - Shadow disk and corona are always added directly to the scene (not as children)
 *   and manually positioned each frame to maintain billboarding and proper scaling.
 */

import * as THREE from 'three';
import { ECLIPSE_TYPES, getEclipseConfig } from './EclipseTypes.js';
import { BaileysBeads } from './BaileysBeads.js';
import { blendModesGLSL } from '../shaders/utils/blendModes.js';
import { easeInOutCubic } from './animation/Easing.js';

export class SolarEclipse {
    /**
     * Create a solar eclipse effect manager
     * @param {THREE.Scene} scene - Three.js scene
     * @param {number} sunRadius - Radius of the sun geometry
     * @param {THREE.Mesh} sunMesh - Sun mesh to parent shadow disk to
     */
    constructor(scene, sunRadius, sunMesh = null) {
        this.scene = scene;
        this.sunRadius = sunRadius;
        this.sunMesh = sunMesh;
        this.eclipseType = ECLIPSE_TYPES.OFF;
        this.previousEclipseType = ECLIPSE_TYPES.OFF; // Store previous type for exit animations
        this.enabled = false;
        this.time = 0;
        this.randomSeed = 12345; // Fixed initial seed - will be randomized on first total eclipse

        // Transition animation state
        this.isTransitioning = false;
        this.transitionProgress = 0;
        this.transitionDuration = 400; // 400ms for quick, snappy eclipse transition
        this.transitionDirection = 'in'; // 'in' or 'out'
        this.manualControl = false; // Flag to disable automatic animation when using sliders

        this.customShadowCoverage = undefined; // Override for shadow disk size from sliders
        // Reusable temp objects to avoid per-frame allocations (performance optimization)
        this._directionToCamera = new THREE.Vector3();
        this._up = new THREE.Vector3(0, 1, 0);
        this._right = new THREE.Vector3();
        this._upVector = new THREE.Vector3();
        this._tempOffset = new THREE.Vector3();
        this._tempColor = new THREE.Color(); // Temp color for reuse

        // Create shadow disk
        this.createShadowDisk();

        // Create corona disks (two counter-rotating for dynamic effect)
        this.createCoronaDisk();
        this.createCounterCoronaDisk();

        // Parent coronas to sun mesh for guaranteed transform sync (Fix 9)
        // Shadow disk stays in scene for proper billboarding
        if (this.sunMesh) {
            this.scene.remove(this.coronaDisk);
            this.scene.remove(this.counterCoronaDisk);
            this.sunMesh.add(this.coronaDisk);
            this.sunMesh.add(this.counterCoronaDisk);
        }

        // Create Bailey's Beads effect
        this.baileysBeads = new BaileysBeads(scene, sunRadius);
    }

    /**
     * Create the shadow disk geometry
     * @private
     */
    createShadowDisk() {
        // Start with a reasonable size - will be scaled in update()
        const initialShadowRadius = this.sunRadius;
        const shadowGeometry = new THREE.CircleGeometry(initialShadowRadius, 256);
        const shadowMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true, // Enable transparency for multiply blending
            opacity: 1.0,
            blending: THREE.MultiplyBlending, // Black (0,0,0) * CoronaColor = Black (complete occlusion)
            premultipliedAlpha: true, // Required for MultiplyBlending
            side: THREE.DoubleSide,
            depthWrite: false, // Don't write to depth buffer (like coronas)
            depthTest: false, // Don't test depth - always render on top
            fog: false,
        });

        this.shadowDisk = new THREE.Mesh(shadowGeometry, shadowMaterial);
        this.shadowDisk.renderOrder = 10000; // Render AFTER coronas to occlude them

        // Add to scene initially, will be re-parented to sun mesh if available
        this.shadowDisk.position.set(200, 0, 0); // Start off-screen
        this.scene.add(this.shadowDisk);
    }

    /**
     * Create the corona disk geometry with radial wave shader
     * @private
     */
    createCoronaDisk() {
        const coronaRadius = this.sunRadius * 2.05; // x sun diameter
        // RingGeometry with inner radius well inside sun, so corona overlaps bloomed edge
        const innerRadius = this.sunRadius * 0.6; // 40% inside sun's edge
        const coronaGeometry = new THREE.RingGeometry(innerRadius, coronaRadius, 256);

        // Shader material with radial wave pattern
        const coronaMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                glowColor: { value: new THREE.Color(0.9, 0.95, 1.0) }, // Cool white/blue-white
                intensity: { value: 2.4 }, // Increased for stronger bloom
                randomSeed: { value: this.randomSeed },
                uvRotation: { value: 0.0 }, // UV rotation angle in radians
                rayElongation: { value: 1.0 }, // Ray elongation factor (1.0 = circular, >1.0 = elongated)
                uberHeroElongation: { value: 1.0 }, // Uber hero ray elongation (much more dramatic)
                isTotalEclipse: { value: 0.0 }, // 1.0 = total eclipse effects enabled

                // Blend Layer Uniforms (up to 4 layers)
                // Default: Soft Light @ 2.155 to fix black edges
                layer1Mode: { value: 11.0 }, // Soft Light
                layer1Strength: { value: 2.155 },
                layer1Enabled: { value: 1.0 },

                // Default: Darken @ 0.695 for depth
                layer2Mode: { value: 5.0 }, // Overlay
                layer2Strength: { value: 0.695 },
                layer2Enabled: { value: 1.0 },

                layer3Mode: { value: 0.0 },
                layer3Strength: { value: 1.0 },
                layer3Enabled: { value: 0.0 },

                layer4Mode: { value: 0.0 },
                layer4Strength: { value: 1.0 },
                layer4Enabled: { value: 0.0 },
            },
            vertexShader: `
                uniform float uvRotation;
                varying vec2 vUv;

                void main() {
                    // Rotate UVs around center (0.5, 0.5)
                    vec2 centeredUV = uv - 0.5;
                    float cosRot = cos(uvRotation);
                    float sinRot = sin(uvRotation);
                    mat2 rotMatrix = mat2(cosRot, -sinRot, sinRot, cosRot);
                    vec2 rotatedUV = rotMatrix * centeredUV;
                    vUv = rotatedUV + 0.5;

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 glowColor;
                uniform float intensity;
                uniform float randomSeed;
                uniform float rayElongation;
                uniform float uberHeroElongation;
                uniform float isTotalEclipse;

                // Blend Layer Uniforms (up to 4 layers)
                uniform float layer1Mode;
                uniform float layer1Strength;
                uniform float layer1Enabled;

                uniform float layer2Mode;
                uniform float layer2Strength;
                uniform float layer2Enabled;

                uniform float layer3Mode;
                uniform float layer3Strength;
                uniform float layer3Enabled;

                uniform float layer4Mode;
                uniform float layer4Strength;
                uniform float layer4Enabled;

                varying vec2 vUv;

                // ═══════════════════════════════════════════════════════════════════════════
                // UNIVERSAL BLEND MODES (injected from utils/blendModes.js)
                // ═══════════════════════════════════════════════════════════════════════════
                ${blendModesGLSL}

                // Hash function for pseudo-random variation
                float hash(float n) {
                    return fract(sin(n) * 43758.5453123);
                }

                // 2D hash for more variation
                float hash2(vec2 p) {
                    return fract(sin(dot(p, vec2(12.9898 + randomSeed, 78.233 + randomSeed))) * 43758.5453);
                }

                void main() {
                    // Calculate distance and angle from center
                    vec2 center = vec2(0.5, 0.5);
                    vec2 toCenter = vUv - center;
                    float dist = length(toCenter) * 2.0; // Normalize to 0-1 range
                    float angle = atan(toCenter.y, toCenter.x);  // UVs are already rotated in vertex shader

                    // Shadow edge - where corona rays start
                    // Ring inner edge is at (sunRadius*0.85)/coronaRadius = 0.765/1.845 = 0.415
                    // Start rays at sun's geometric edge (0.488) so they don't show inside sun
                    float shadowEdge = 0.488;

                    // Varied radial streamer pattern with artistic composition
                    float rayIntensity = 0.0;

                    // RULE OF THIRDS: Place 3 hero rays at compositionally strong points
                    // Golden angles based on rule of thirds: 1/3, 2/3, and offset positions
                    float heroAngles[3];
                    heroAngles[0] = hash(randomSeed * 1.234) * 6.28318; // First hero ray (random rotation)
                    heroAngles[1] = heroAngles[0] + 2.0944; // 120° apart (1/3 circle)
                    heroAngles[2] = heroAngles[0] + 4.1888; // 240° apart (2/3 circle)

                    // Process hero rays first (3 extra-long dramatic rays)
                    for (int h = 0; h < 3; h++) {
                        float rayAngle = heroAngles[h];
                        float angleDiff = abs(mod(angle - rayAngle + 3.14159, 6.28318) - 3.14159);

                        // Hero rays: extra long and prominent (fit within 0.535 normalized space)
                        float baseHeroLength = 0.45 + hash(float(h) * 31.415 + randomSeed) * 0.08; // 0.45 to 0.53 (max available, longer!)

                        // Apply UBER elongation: hero rays ALWAYS get extreme elongation (regardless of angle)
                        // This creates 3 dramatic streamers that extend far in their respective directions
                        float heroLength = baseHeroLength * uberHeroElongation;

                        // Uber hero rays: keep them narrow but visible for dramatic pointy effect
                        // Width scales with elongation to stay sharp but visible
                        float baseHeroWidth = 0.15 + hash(float(h) * 27.183 + randomSeed) * 0.15; // 0.15 to 0.3 base width
                        float narrowingFactor = mix(1.0, 0.3, (uberHeroElongation - 1.0) / max(uberHeroElongation, 1.0)); // 1.0 → 0.3 (70% narrower at max elongation)
                        float heroWidth = baseHeroWidth * narrowingFactor; // Narrow when elongated = pointy!

                        float distFromEdge = dist - shadowEdge;

                        // Ghostly ethereal taper - very gradual falloff
                        float taper = pow(1.0 - clamp(distFromEdge / max(heroLength, 0.001), 0.0, 1.0), 3.0);
                        float rayWidth = heroWidth * taper;

                        // Soft feathered edges instead of hard cutoff
                        float edgeSoftness = 0.15; // Wider feather for smooth edges
                        float angularMask = smoothstep(rayWidth + edgeSoftness, rayWidth - edgeSoftness, angleDiff);

                        // Very gentle radial falloff for ethereal look
                        float radialFalloff = pow(taper, 0.8);

                        // Soft radial range with feathered ends
                        float radialMask = smoothstep(-0.1, 0.05, distFromEdge) *
                                          smoothstep(heroLength + 0.15, heroLength - 0.05, distFromEdge);

                        float heroIntensity = angularMask * radialFalloff * radialMask * 0.7; // Reduced intensity for ghostly effect
                        rayIntensity = max(rayIntensity, heroIntensity);
                    }

                    // 20 supporting rays with rule-of-thirds-aware distribution
                    for (float i = 0.0; i < 20.0; i++) {
                        // Cluster more rays around hero ray positions (rule of thirds)
                        float clusterTarget = mod(i, 3.0); // Which hero ray to cluster near
                        float clusterAngle = heroAngles[int(clusterTarget)];

                        // Base distribution with clustering tendency
                        float spreadAngle = (i / 20.0) * 6.28318;
                        float clusterPull = (hash(i * 13.579 + randomSeed) - 0.5) * 1.5; // Stronger variation
                        float rayAngle = spreadAngle + clusterPull;

                        float angleDiff = abs(mod(angle - rayAngle + 3.14159, 6.28318) - 3.14159);

                        // Unique random values per ray
                        float random1 = hash(i * 12.9898 + randomSeed);
                        float random2 = hash(i * 78.233 + randomSeed);
                        float random3 = hash(i * 37.719 + randomSeed);
                        float random4 = hash(i * 93.989 + randomSeed);

                        // Varied lengths following power law distribution (more short, fewer long)
                        float lengthVariation = random1 * random1; // Squared for naturalistic distribution
                        float baseRayLength = 0.1 + lengthVariation * 0.7; // 0.1 to 0.8

                        // 20% chance of long streamers (supporting the hero rays)
                        float isLong = step(0.80, random2);
                        baseRayLength = mix(baseRayLength, 0.7 + random3 * 0.6, isLong); // 0.7 to 1.3

                        // Apply directional elongation: rays pointing up/down (vertical) get elongated
                        float verticalWeight = abs(sin(rayAngle));
                        float elongationFactor = mix(1.0, rayElongation, verticalWeight);
                        float rayLength = baseRayLength * elongationFactor;

                        // EQUATORIAL ASYMMETRY (total eclipse only): rays along equator are more prominent
                        // Solar minimum: streamers cluster along equatorial plane
                        float equatorialWeight = abs(cos(rayAngle)); // 1.0 at horizontal, 0.0 at vertical
                        float asymmetryBoost = mix(1.0, 1.0 + equatorialWeight * 0.5, isTotalEclipse);
                        rayLength *= asymmetryBoost;

                        // Varied widths with power law (more thin, fewer thick)
                        float baseWidth = 0.03 + (random4 * random4) * 0.2; // 0.03 to 0.23 (naturally varied)

                        // Taper: wide at base, narrow at tip
                        float distFromEdge = dist - shadowEdge;

                        // Ghostly ethereal taper - very gradual falloff
                        float taper = pow(1.0 - clamp(distFromEdge / max(rayLength, 0.001), 0.0, 1.0), 3.5);
                        float rayWidth = baseWidth * taper;

                        // Soft feathered edges for ethereal wisps
                        float edgeSoftness = 0.10; // Wider feather for smooth edges
                        float angularMask = smoothstep(rayWidth + edgeSoftness, rayWidth - edgeSoftness, angleDiff);

                        // Very gentle radial falloff for ghostly appearance
                        float radialFalloff = pow(taper, 1.0);

                        // Soft radial range with feathered ends
                        float radialMask = smoothstep(-0.08, 0.03, distFromEdge) *
                                          smoothstep(rayLength + 0.12, rayLength - 0.03, distFromEdge);

                        float streamerIntensity = angularMask * radialFalloff * radialMask * 0.5; // Reduced for ethereal wisps
                        rayIntensity = max(rayIntensity, streamerIntensity);
                    }

                    // Base corona glow - thinner during total eclipse for realism
                    float baseGlowWidth = mix(0.04, 0.015, isTotalEclipse); // Thinner during totality
                    float baseGlow = smoothstep(shadowEdge - 0.01, shadowEdge, dist) *
                                    (1.0 - smoothstep(shadowEdge + baseGlowWidth * 0.5, shadowEdge + baseGlowWidth, dist));

                    // Enhanced gradient: white → cool blue-white → deep blue with distance
                    // Distance normalized to corona extent (0 = shadow edge, 1 = far corona)
                    float coronaDist = clamp((dist - shadowEdge) / 0.6, 0.0, 1.0);

                    // ═══════════════════════════════════════════════════════════════════════════
                    // TOTAL ECLIPSE ENHANCEMENTS (scaled continuously by isTotalEclipse 0.0-1.0)
                    // ═══════════════════════════════════════════════════════════════════════════

                    // 1. CHROMOSPHERE RED RIM - thin pink/red ring at sun's edge (hydrogen emission)
                    float rimStart = shadowEdge;
                    float rimEnd = shadowEdge + 0.025;
                    float chromosphereRim = smoothstep(rimStart - 0.005, rimStart, dist) *
                                     (1.0 - smoothstep(rimEnd - 0.01, rimEnd, dist));
                    chromosphereRim *= 0.6 * isTotalEclipse; // Scale by eclipse progress
                    vec3 chromosphereColor = vec3(1.0, 0.3, 0.4); // Pink-red (H-alpha emission)

                    // 2. STRONGER BRIGHTNESS FALLOFF - inner corona much brighter
                    // Mix between 1.0 (normal) and enhanced falloff based on isTotalEclipse
                    float enhancedFalloff = mix(3.0, 0.3, pow(coronaDist, 0.7));
                    float brightnessMultiplier = mix(1.0, enhancedFalloff, isTotalEclipse);

                    // 3. F-CORONA OUTER GLOW - faint diffuse glow from interplanetary dust
                    float fCoronaDist = clamp((dist - shadowEdge) / 1.2, 0.0, 1.0);
                    float fCorona = (1.0 - fCoronaDist) * 0.08;
                    fCorona *= smoothstep(0.3, 0.5, coronaDist);
                    fCorona *= isTotalEclipse; // Scale by eclipse progress

                    // 4. WISPY TENDRILS - add fine detail noise to ray intensity
                    float noiseAngle = angle * 8.0 + time * 0.1;
                    float noiseRadius = dist * 15.0;
                    float wispyDetail = hash(noiseAngle + noiseRadius + randomSeed * 3.0) * 0.15;
                    wispyDetail *= rayIntensity * isTotalEclipse; // Scale by eclipse progress

                    // Combine: base glow + streamers + wispy detail
                    float finalIntensity = (baseGlow * 0.6 + rayIntensity + wispyDetail) * intensity;
                    finalIntensity *= brightnessMultiplier;

                    // Multi-stage color gradient for realistic corona
                    vec3 innerGlow = vec3(1.0, 1.0, 1.0);           // Pure white at base
                    vec3 middleGlow = vec3(0.9, 0.95, 1.0);         // Cool white
                    vec3 outerGlow = vec3(0.6, 0.75, 0.95);         // Pale blue
                    vec3 farGlow = vec3(0.3, 0.5, 0.8);             // Deep blue

                    // Three-stage color mix
                    vec3 coronaColor;
                    if (coronaDist < 0.3) {
                        // Inner: white → cool white
                        coronaColor = mix(innerGlow, middleGlow, coronaDist / 0.3);
                    } else if (coronaDist < 0.7) {
                        // Middle: cool white → pale blue
                        coronaColor = mix(middleGlow, outerGlow, (coronaDist - 0.3) / 0.4);
                    } else {
                        // Outer: pale blue → deep blue
                        coronaColor = mix(outerGlow, farGlow, (coronaDist - 0.7) / 0.3);
                    }

                    vec3 finalColor = coronaColor * finalIntensity;

                    // Add chromosphere red rim (total eclipse only)
                    finalColor += chromosphereColor * chromosphereRim * intensity;

                    // Add F-corona outer glow (total eclipse only)
                    finalColor += vec3(0.9, 0.85, 0.8) * fCorona * intensity; // Slightly warm white

                    // ═══════════════════════════════════════════════════════════════════════════
                    // BLEND LAYERS (Applied globally to entire corona)
                    // These allow adjusting the appearance of the corona to prevent black edges
                    // ═══════════════════════════════════════════════════════════════════════════

                    // Layer 1
                    if (layer1Enabled > 0.5) {
                        vec3 blendColor1 = vec3(min(layer1Strength, 1.0));
                        int mode1 = int(layer1Mode + 0.5);
                        vec3 blended1 = clamp(applyBlendMode(finalColor, blendColor1, mode1), 0.0, 1.0);
                        finalColor = clamp(blended1, 0.0, 1.0);
                    }

                    // Layer 2
                    if (layer2Enabled > 0.5) {
                        vec3 blendColor2 = vec3(min(layer2Strength, 1.0));
                        int mode2 = int(layer2Mode + 0.5);
                        vec3 blended2 = clamp(applyBlendMode(finalColor, blendColor2, mode2), 0.0, 1.0);
                        finalColor = clamp(blended2, 0.0, 1.0);
                    }

                    // Layer 3
                    if (layer3Enabled > 0.5) {
                        vec3 blendColor3 = vec3(min(layer3Strength, 1.0));
                        int mode3 = int(layer3Mode + 0.5);
                        vec3 blended3 = clamp(applyBlendMode(finalColor, blendColor3, mode3), 0.0, 1.0);
                        finalColor = clamp(blended3, 0.0, 1.0);
                    }

                    // Layer 4
                    if (layer4Enabled > 0.5) {
                        vec3 blendColor4 = vec3(min(layer4Strength, 1.0));
                        int mode4 = int(layer4Mode + 0.5);
                        vec3 blended4 = clamp(applyBlendMode(finalColor, blendColor4, mode4), 0.0, 1.0);
                        finalColor = clamp(blended4, 0.0, 1.0);
                    }

                    // Sharp alpha falloff to prevent black bleeding in bloom
                    // Higher power = sharper cutoff at edges (less semi-transparent area)
                    float alphaFalloff = pow(1.0 - coronaDist, 3.0);
                    float alpha = finalIntensity * alphaFalloff * 0.95;

                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending, // Additive blending to fill gap with sun bloom
            depthWrite: false,
            side: THREE.DoubleSide,
        });

        this.coronaDisk = new THREE.Mesh(coronaGeometry, coronaMaterial);
        this.coronaDisk.position.set(0, 0, 0); // At sun center (will be parented to sun)
        this.coronaDisk.renderOrder = 9998;
        // Add to scene initially, will be re-parented to sun mesh when available
        this.scene.add(this.coronaDisk);
    }

    /**
     * Create counter-rotating corona disk (second layer for moiré effect)
     * @private
     */
    createCounterCoronaDisk() {
        // Reuse geometry from main corona (efficient - shared geometry)
        const coronaGeometry = this.coronaDisk.geometry;

        // Clone material with different random seed for variation
        const counterSeed = this.randomSeed + 5000; // Large offset for visibly different pattern
        const counterMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                glowColor: { value: new THREE.Color(0.9, 0.95, 1.0) },
                intensity: { value: 2.4 }, // Increased for stronger bloom
                randomSeed: { value: counterSeed },
                uvRotation: { value: 0.0 }, // UV rotation angle in radians
                rayElongation: { value: 1.0 }, // Ray elongation factor (1.0 = circular, >1.0 = elongated)
                uberHeroElongation: { value: 1.0 }, // Uber hero ray elongation (much more dramatic)
                isTotalEclipse: { value: 0.0 }, // 1.0 = total eclipse effects enabled

                // Blend Layer Uniforms (up to 4 layers) - shared with main corona
                // Default: Soft Light @ 2.155 to fix black edges
                layer1Mode: { value: 11.0 }, // Soft Light
                layer1Strength: { value: 2.155 },
                layer1Enabled: { value: 1.0 },

                // Default: Darken @ 0.695 for depth
                layer2Mode: { value: 5.0 }, // Overlay
                layer2Strength: { value: 0.695 },
                layer2Enabled: { value: 1.0 },

                layer3Mode: { value: 0.0 },
                layer3Strength: { value: 1.0 },
                layer3Enabled: { value: 0.0 },

                layer4Mode: { value: 0.0 },
                layer4Strength: { value: 1.0 },
                layer4Enabled: { value: 0.0 },
            },
            vertexShader: this.coronaDisk.material.vertexShader,
            fragmentShader: this.coronaDisk.material.fragmentShader,
            transparent: true,
            blending: THREE.AdditiveBlending, // Additive blending to fill gap with sun bloom
            depthWrite: false,
            side: THREE.DoubleSide,
        });

        this.counterCoronaDisk = new THREE.Mesh(coronaGeometry, counterMaterial);
        this.counterCoronaDisk.position.set(0, 0, 0); // At sun center
        this.counterCoronaDisk.renderOrder = 9997;
        this.scene.add(this.counterCoronaDisk);
    }
    /**
     * Set shadow coverage (billboard disk size)
     * @param {number} coverage - Shadow coverage multiplier (0-1+)
     */
    setShadowCoverage(coverage) {
        this.customShadowCoverage = coverage;
    }

    /**
     * Set corona blend layer parameters
     * @param {number} layerNum - Layer number (1-4)
     * @param {Object} params - Layer parameters { mode, strength, enabled }
     */
    setCoronaBlendLayer(layerNum, params) {
        if (layerNum < 1 || layerNum > 4) {
            console.error(`❌ Invalid corona layer number: ${layerNum} (must be 1-4)`);
            return;
        }

        const { mode = 0, strength = 1.0, enabled = false } = params;

        // Update both corona disks with the same blend layer settings
        if (this.coronaDisk?.material?.uniforms) {
            this.coronaDisk.material.uniforms[`layer${layerNum}Mode`].value = mode;
            this.coronaDisk.material.uniforms[`layer${layerNum}Strength`].value = strength;
            this.coronaDisk.material.uniforms[`layer${layerNum}Enabled`].value = enabled
                ? 1.0
                : 0.0;
        }

        if (this.counterCoronaDisk?.material?.uniforms) {
            this.counterCoronaDisk.material.uniforms[`layer${layerNum}Mode`].value = mode;
            this.counterCoronaDisk.material.uniforms[`layer${layerNum}Strength`].value = strength;
            this.counterCoronaDisk.material.uniforms[`layer${layerNum}Enabled`].value = enabled
                ? 1.0
                : 0.0;
        }
    }

    /**
     * Set eclipse type (annular, total, or off)
     * Triggers transition animation when type changes
     * @param {string} eclipseType - Eclipse type from ECLIPSE_TYPES
     */
    setEclipseType(eclipseType) {
        // Only trigger transition if type actually changed
        if (eclipseType === this.eclipseType) {
            return;
        }

        const wasEnabled = this.enabled;
        this.previousEclipseType = this.eclipseType; // Store previous type before changing
        this.eclipseType = eclipseType;
        this.enabled = eclipseType !== ECLIPSE_TYPES.OFF;
        this.manualControl = false; // Reset manual control when eclipse type changes

        // Get shadow coverage values for interpolation
        const prevConfig = getEclipseConfig(this.previousEclipseType);
        const newConfig = getEclipseConfig(eclipseType);
        this.startShadowCoverage = prevConfig.shadowCoverage;
        this.targetShadowCoverage = newConfig.shadowCoverage;

        // Determine transition direction
        if (!wasEnabled && this.enabled) {
            // Entering eclipse: slide in from right
            this.transitionDirection = 'in';
            this.isTransitioning = true;
            this.transitionProgress = 0;
        } else if (wasEnabled && !this.enabled) {
            // Exiting eclipse: slide out to left
            this.transitionDirection = 'out';
            this.isTransitioning = true;
            this.transitionProgress = 0;
        } else if (wasEnabled && this.enabled) {
            // Switching between annular/total: animate shadow size change
            this.isTransitioning = true;
            this.transitionProgress = 0;
            this.transitionDirection = 'switch';
        }

        // Corona pattern uses fixed seed for consistency - no randomization on eclipse type change
    }

    /**
     * Manually set transition progress (for manual control via sliders)
     * @param {number} progress - Progress value (0-1, where 0 is start, 1 is totality)
     */
    setManualProgress(progress) {
        this.manualControl = true; // Enable manual control mode
        this.transitionProgress = Math.max(0, Math.min(1, progress));
        this.isTransitioning = true; // Keep transitioning active for effects
        this.transitionDirection = 'in'; // Always use 'in' direction for manual control
    }

    /**
     * Manually set shadow position (for full eclipse cycle control)
     * @param {number} shadowPosition - Shadow X position (-2.0 = left, 0.0 = center/totality, +2.0 = right)
     */
    setManualShadowPosition(shadowPosition) {
        this.manualControl = true; // Enable manual control mode
        this.manualShadowPosition = Math.max(-2.0, Math.min(2.0, shadowPosition)); // Clamp to valid range
        this.isTransitioning = true; // Keep effects active
        this.transitionDirection = 'manual'; // Special mode for direct position control
    }

    /**
     * Update eclipse effects (call every frame)
     *
     * IMPORTANT: This method must be called AFTER the sun mesh's position, rotation,
     * and scale have been updated for the current frame to ensure synchronized movement.
     * Called from ThreeRenderer.render() after transforms are applied.
     *
     * @param {THREE.Camera} camera - Camera for position calculations
     * @param {THREE.Mesh} sunMesh - Sun mesh for position/scale (already updated for current frame)
     * @param {number} deltaTime - Time since last frame (milliseconds)
     * @param {number|null} morphProgress - Morph animation progress (null = no morph, 0-1 = morphing)
     */
    update(camera, sunMesh, deltaTime, morphProgress = null) {
        const cameraPosition = camera.position;
        const sunPosition = sunMesh.position;
        const sunScale = sunMesh.scale;
        const worldScale = sunScale.x; // World scale for consistent sizing

        // Calculate corona fade multiplier for morph transitions
        // Entry (Anything->Sun): rays fade in with inverse cubic (slow start, fast finish - bloom effect)
        // Exit (Sun->Anything): rays fade out with cubic (fast start, slow finish - rays lead)
        let coronaMorphFade = 1.0;
        if (morphProgress !== null && morphProgress > 0.5) {
            // Grow phase (entry): progress 0.5->1.0
            // Inverse of exit: slow start, accelerating finish (rays bloom from sun)
            const t = (morphProgress - 0.5) * 2; // 0 to 1 as grow progresses
            coronaMorphFade = t * t * t; // Cubic: starts slow at 0, accelerates to 1
        } else if (morphProgress !== null && morphProgress <= 0.5) {
            // Shrink phase (exit): morphProgress goes 0->0.5
            // At start (morphProgress=0): rays should be full (1.0)
            // At end (morphProgress=0.5): rays should be gone (0.0)
            // Rays fade FAST (cubic) - they lead ahead of sun's shrink
            const t = morphProgress * 2; // 0 to 1 as shrink progresses
            coronaMorphFade = (1.0 - t) * (1.0 - t) * (1.0 - t); // Cubic: starts at 1, drops fast to 0
        }

        // Update time for corona animation
        // Accelerate time 3x for normal sun (more visible undulation), normal speed for eclipses
        const timeMultiplier = this.eclipseType === ECLIPSE_TYPES.OFF ? 3.0 : 1.0;
        this.time += deltaTime * timeMultiplier;

        // Update transition animation (skip if in manual control mode)
        if (this.isTransitioning && !this.manualControl) {
            const progressDelta = deltaTime / this.transitionDuration;
            this.transitionProgress += progressDelta;

            if (this.transitionProgress >= 1.0) {
                this.transitionProgress = 1.0;
                this.isTransitioning = false;
            }
        }

        // Update shadow disk if eclipse is active or transitioning out
        if (this.enabled || (this.transitionDirection === 'out' && this.isTransitioning)) {
            // Use previous eclipse type during exit animation (since eclipseType is now OFF)
            const activeEclipseType =
                this.transitionDirection === 'out' && this.isTransitioning
                    ? this.previousEclipseType
                    : this.eclipseType;
            const config = getEclipseConfig(activeEclipseType);
            const scaledSunRadius = this.sunRadius * worldScale;

            // Use eased progress for smooth transitions
            const easedProgress = easeInOutCubic(this.transitionProgress);

            // Calculate shadow size - only interpolate during 'switch' transitions (annular ↔ total)
            // For 'in' and 'out' transitions, shadow maintains its size (like real moon)
            let shadowCoverage;
            if (this.customShadowCoverage !== undefined) {
                // Manual slider override
                shadowCoverage = this.customShadowCoverage;
            } else if (
                this.transitionDirection === 'switch' &&
                this.isTransitioning &&
                this.startShadowCoverage !== undefined &&
                this.targetShadowCoverage !== undefined
            ) {
                // Only interpolate size when switching between annular/total
                shadowCoverage =
                    this.startShadowCoverage +
                    (this.targetShadowCoverage - this.startShadowCoverage) * easedProgress;
            } else {
                // Use target config coverage (constant size during in/out transitions)
                ({ shadowCoverage } = config);
            }
            const shadowRadius = scaledSunRadius * shadowCoverage;
            const baseShadowScale = shadowRadius / this.sunRadius;

            // Scale shadow disk
            this.shadowDisk.scale.setScalar(baseShadowScale);

            // Calculate shadow position
            // shadowPosX range: -2.0 to +2.0
            this.currentShadowPosX = -2.0; // Start off-screen

            if (this.transitionDirection === 'manual' && this.manualShadowPosition !== undefined) {
                // MANUAL CONTROL MODE: Use direct shadow position from dial
                this.currentShadowPosX = this.manualShadowPosition;
            } else if (this.isTransitioning) {
                if (this.transitionDirection === 'in') {
                    // Arc in from -2.0 to 0.0
                    this.currentShadowPosX = -2.0 + easedProgress * 2.0; // -2.0 → 0.0
                } else if (this.transitionDirection === 'out') {
                    // Arc out from 0.0 to 1.0
                    this.currentShadowPosX = 0.0 + easedProgress * 1.0; // 0.0 → 1.0
                } else if (this.transitionDirection === 'switch') {
                    // Shadow stays centered during annular<->total switch, only size changes
                    this.currentShadowPosX = 0.0;
                }
            } else {
                // At rest: centered
                this.currentShadowPosX = 0.0;
            }

            const shadowPosX = this.currentShadowPosX;

            // Calculate parabolic arc motion (like real eclipse)
            // Horizontal: linear movement from -2.0 to +2.0
            // Vertical: downward parabola y = -x²
            const arcRadius = scaledSunRadius * 2.5; // Arc depth
            const arcT = shadowPosX; // Use shadowPosX directly as arc parameter (-2.0 to +2.0)

            const horizontalOffset = arcT * arcRadius * 0.5; // Horizontal position
            const verticalOffset = -(arcT * arcT) * arcRadius * 0.25; // Downward parabola: y = -x²

            // Position shadow disk between camera and sun - REUSE temp vector
            this._directionToCamera.subVectors(cameraPosition, sunPosition).normalize();

            // Get perpendicular vectors for positioning - REUSE temp vectors
            this._right.crossVectors(this._directionToCamera, this._up).normalize();
            this._upVector.crossVectors(this._right, this._directionToCamera).normalize();

            // Position shadow at sun's surface (no offset) to maintain consistent relative size
            // The small Z-offset was causing perspective-based size changes when zooming
            const shadowOffset = 0;
            // Build position using temp vector to avoid allocations
            this._tempOffset.copy(this._directionToCamera).multiplyScalar(shadowOffset);
            this.shadowDisk.position.copy(sunPosition).add(this._tempOffset);

            // Add horizontal offset
            this._tempOffset.copy(this._right).multiplyScalar(horizontalOffset);
            this.shadowDisk.position.add(this._tempOffset);

            // Add vertical offset (parabolic arc)
            this._tempOffset.copy(this._upVector).multiplyScalar(verticalOffset);
            this.shadowDisk.position.add(this._tempOffset);

            // Make shadow face camera (billboard effect)
            this.shadowDisk.lookAt(cameraPosition);

            // Update corona disks - ALWAYS VISIBLE (intensity varies by eclipse state)
            // Coronas are parented to sun mesh, so position/scale is inherited
            // Only set position if NOT parented (fallback for older code paths)
            if (!this.coronaDisk.parent || this.coronaDisk.parent === this.scene) {
                this.coronaDisk.position.copy(sunPosition);
                this.counterCoronaDisk.position.copy(sunPosition);
                this.coronaDisk.scale.setScalar(worldScale);
                this.counterCoronaDisk.scale.setScalar(worldScale);
            }
            // If parented, position is (0,0,0) and scale is (1,1,1) relative to parent

            // Calculate proximity to totality for dynamic rotation speed and intensity
            // proximity = 0 at edges (shadow far away), 1 at totality (shadow centered)
            const distanceFromCenter = Math.abs(this.currentShadowPosX || 0);
            const maxDistance = 2.0;
            const proximity = Math.max(0, 1 - distanceFromCenter / maxDistance);

            // Calculate total eclipse blend factor
            // During 'switch' transition, animate between 0 (annular) and 1 (total)
            let totalEclipseBlend = 0.0;
            if (this.transitionDirection === 'switch' && this.isTransitioning) {
                // Switching between annular/total: animate the blend
                const wasTotal = this.previousEclipseType === ECLIPSE_TYPES.TOTAL;
                const isTotal = this.eclipseType === ECLIPSE_TYPES.TOTAL;
                if (isTotal && !wasTotal) {
                    // Annular → Total: blend from 0 to 1
                    totalEclipseBlend = easedProgress;
                } else if (!isTotal && wasTotal) {
                    // Total → Annular: blend from 1 to 0
                    totalEclipseBlend = 1.0 - easedProgress;
                }
            } else if (activeEclipseType === ECLIPSE_TYPES.TOTAL) {
                // Normal total eclipse: use proximity-based effects
                totalEclipseBlend = 1.0;
            }

            // For total eclipse: elongate rays via shader (not geometry scaling)
            // Pass elongation factor to shader (1.0 = circular, 25.0 = 2400% longer rays at poles)
            // Use quartic easing (^4) to keep rays normal length until very close to totality
            const baseRayElongation = 1.0 + 24.0 * Math.pow(proximity, 4); // 1.0 → 25.0
            const rayElongation = 1.0 + (baseRayElongation - 1.0) * totalEclipseBlend;

            // Uber hero rays: 3 dramatic streamers that extend MUCH further at totality
            const baseUberHeroElongation = 1.0 + 199.0 * Math.pow(proximity, 5); // 1.0 → 200.0
            const uberHeroElongation = 1.0 + (baseUberHeroElongation - 1.0) * totalEclipseBlend;

            this.coronaDisk.material.uniforms.rayElongation.value = rayElongation;
            this.counterCoronaDisk.material.uniforms.rayElongation.value = rayElongation;
            this.coronaDisk.material.uniforms.uberHeroElongation.value = uberHeroElongation;
            this.counterCoronaDisk.material.uniforms.uberHeroElongation.value = uberHeroElongation;

            // Ease shader effects (chromosphere, asymmetry, F-corona) as we approach totality
            // Ramp from 0 to 1.0 between 0.50 and 0.99 proximity with easeInOut curve
            const effectsMin = 0.5; // Start easing shader effects at 50% proximity
            const effectsMax = 0.99; // Full shader effects at 99% proximity
            const effectsLinear = Math.max(
                0,
                Math.min(1, (proximity - effectsMin) / (effectsMax - effectsMin))
            );
            // Smoothstep easeInOut: 3t² - 2t³
            const effectsProgress = effectsLinear * effectsLinear * (3 - 2 * effectsLinear);
            // Apply total eclipse blend to shader effects
            const isTotalEclipse = effectsProgress * totalEclipseBlend;
            this.coronaDisk.material.uniforms.isTotalEclipse.value = isTotalEclipse;
            this.counterCoronaDisk.material.uniforms.isTotalEclipse.value = isTotalEclipse;

            // Layer 3: Linear Burn eases in with the other effects
            // Linear Burn: strength 1.0 = no effect, strength 0.0 = max darkening
            // So we ramp from 1.0 (no effect) DOWN to 0.053 (full effect) at totality
            const linearBurnEnabled = totalEclipseBlend > 0 && proximity >= effectsMin;
            const linearBurnStrength = 1.0 - (1.0 - 0.053) * effectsProgress * totalEclipseBlend; // 1.0 → 0.053
            this.setCoronaBlendLayer(3, {
                mode: 1,
                strength: linearBurnStrength,
                enabled: linearBurnEnabled,
            });

            // Billboard both coronas to camera (must happen BEFORE rotation)
            this.coronaDisk.lookAt(cameraPosition);
            this.counterCoronaDisk.lookAt(cameraPosition);

            // Rotation: dynamic speed based on eclipse state and proximity to totality
            // Use vertex shader UV rotation (mesh stays billboarded to camera)
            let rotationSpeed = 0;
            if (activeEclipseType === ECLIPSE_TYPES.OFF) {
                // NORMAL SUN: Full rotation speed
                rotationSpeed = (deltaTime / 1000) * 0.075; // radians per second (~84 seconds per rotation)
            } else if (activeEclipseType === ECLIPSE_TYPES.ANNULAR) {
                // ANNULAR ECLIPSE: Slow down rotation at totality (75% reduction)
                const baseSpeed = 0.075;
                const minSpeed = baseSpeed * 0.25; // 25% of normal = 75% reduction
                rotationSpeed =
                    (deltaTime / 1000) * (baseSpeed - (baseSpeed - minSpeed) * proximity);
            } else if (activeEclipseType === ECLIPSE_TYPES.TOTAL) {
                // TOTAL ECLIPSE: Nearly freeze rotation at totality (95% reduction)
                const baseSpeed = 0.075;
                const minSpeed = baseSpeed * 0.05; // 5% of normal = 95% reduction
                rotationSpeed =
                    (deltaTime / 1000) * (baseSpeed - (baseSpeed - minSpeed) * proximity);
            }

            // Apply rotation to both coronas
            this.coronaDisk.material.uniforms.uvRotation.value += rotationSpeed; // Clockwise
            this.counterCoronaDisk.material.uniforms.uvRotation.value -= rotationSpeed; // Counter-clockwise

            // Determine corona intensity based on eclipse state and proximity to totality
            let coronaIntensity = 1.2;

            if (activeEclipseType === ECLIPSE_TYPES.OFF) {
                // NORMAL SUN: Bright corona (solar atmosphere always visible)
                coronaIntensity = 3.6; // Increased for stronger bloom
            } else if (activeEclipseType === ECLIPSE_TYPES.ANNULAR) {
                // ANNULAR ECLIPSE: Dim corona based on proximity to shadow
                const maxIntensity = 3.6; // Normal sun brightness
                const minIntensity = maxIntensity * 0.08; // 8% at totality
                if (this.transitionDirection === 'manual') {
                    coronaIntensity = maxIntensity - (maxIntensity - minIntensity) * proximity;
                } else {
                    // Use proximity for automatic dimming (shadow position determines intensity)
                    coronaIntensity = maxIntensity - (maxIntensity - minIntensity) * proximity;
                }
            } else if (activeEclipseType === ECLIPSE_TYPES.TOTAL) {
                // TOTAL ECLIPSE: Dim corona based on proximity to shadow
                const maxIntensity = 3.6; // Normal sun brightness
                const minIntensity = maxIntensity * 0.65; // 65% at totality
                if (this.transitionDirection === 'manual') {
                    coronaIntensity = maxIntensity - (maxIntensity - minIntensity) * proximity;
                } else {
                    // Use proximity for automatic dimming (shadow position determines intensity)
                    coronaIntensity = maxIntensity - (maxIntensity - minIntensity) * proximity;
                }
            }

            // Apply intensity to both coronas (with morph fade multiplier)
            this.coronaDisk.material.uniforms.intensity.value = coronaIntensity * coronaMorphFade;
            this.counterCoronaDisk.material.uniforms.intensity.value =
                coronaIntensity * coronaMorphFade;

            // Update shader time uniform for both
            this.coronaDisk.material.uniforms.time.value = this.time;
            this.counterCoronaDisk.material.uniforms.time.value = this.time;
        } else {
            // Eclipse disabled: hide shadow disk, but keep coronas visible for normal sun
            this.shadowDisk.position.set(200, 0, 0);

            // Position both coronas at sun center for normal sun mode
            // Only set position/scale if NOT parented (fallback for older code paths)
            if (!this.coronaDisk.parent || this.coronaDisk.parent === this.scene) {
                this.coronaDisk.position.copy(sunPosition);
                this.counterCoronaDisk.position.copy(sunPosition);
                this.coronaDisk.scale.setScalar(worldScale);
                this.counterCoronaDisk.scale.setScalar(worldScale);
            }
            // If parented, position is (0,0,0) and scale is (1,1,1) relative to parent

            // Reset elongation to normal (no uber rays when eclipse is off)
            this.coronaDisk.material.uniforms.rayElongation.value = 1.0;
            this.counterCoronaDisk.material.uniforms.rayElongation.value = 1.0;
            this.coronaDisk.material.uniforms.uberHeroElongation.value = 1.0;
            this.counterCoronaDisk.material.uniforms.uberHeroElongation.value = 1.0;

            // Disable total eclipse enhancements when not in eclipse
            this.coronaDisk.material.uniforms.isTotalEclipse.value = 0.0;
            this.counterCoronaDisk.material.uniforms.isTotalEclipse.value = 0.0;

            // Reduce corona intensity for normal sun (85% of base, with morph fade)
            this.coronaDisk.material.uniforms.intensity.value = 3.6 * 0.85 * coronaMorphFade;
            this.counterCoronaDisk.material.uniforms.intensity.value = 3.6 * 0.85 * coronaMorphFade;

            // Disable Linear Burn when not in eclipse
            this.setCoronaBlendLayer(3, { mode: 1, strength: 0.0, enabled: false });

            // Billboard both coronas to camera (must happen BEFORE rotation)
            this.coronaDisk.lookAt(cameraPosition);
            this.counterCoronaDisk.lookAt(cameraPosition);

            // Rotate coronas in opposite directions (living sun effect)
            // Use vertex shader UV rotation (mesh stays billboarded to camera)
            const rotationSpeed = (deltaTime / 1000) * 0.075; // radians per second (~84 seconds per rotation)
            this.coronaDisk.material.uniforms.uvRotation.value += rotationSpeed; // Clockwise
            this.counterCoronaDisk.material.uniforms.uvRotation.value -= rotationSpeed; // Counter-clockwise

            // Bright corona for normal sun (no eclipse, with morph fade)
            this.coronaDisk.material.uniforms.intensity.value = 3.6 * coronaMorphFade;
            this.counterCoronaDisk.material.uniforms.intensity.value = 3.6 * coronaMorphFade;

            // Update shader time uniform for both
            this.coronaDisk.material.uniforms.time.value = this.time;
            this.counterCoronaDisk.material.uniforms.time.value = this.time;
        }

        // Update Bailey's Beads effect
        // Beads are ONLY visible when shadow is near the sun's rim (final 20% of transition)
        if (this.eclipseType === ECLIPSE_TYPES.TOTAL) {
            // Calculate coverage based on transition progress or shadow position
            let coverage = 0;
            let beadsVisible = false;

            if (this.transitionDirection === 'manual') {
                // MANUAL MODE: Calculate coverage from shadow position
                // Shadow at -2.0 or +2.0 = 0% coverage (no eclipse)
                // Shadow at 0.0 = 100% coverage (totality)
                const distanceFromCenter = Math.abs(this.currentShadowPosX);
                const maxDistance = 2.0;
                coverage = Math.max(0, Math.min(1, 1 - distanceFromCenter / maxDistance));

                // Beads visible when coverage is between 90% and 100% (INCLUDING totality)
                if (coverage >= 0.9 && coverage <= 1.0) {
                    beadsVisible = true;
                }
            } else if (this.transitionDirection === 'in' && this.isTransitioning) {
                // Beads only appear in final 20% of transition (when shadow is nearly covering sun)
                const beadsStartProgress = 0.8; // Start showing beads at 80% of transition
                if (this.transitionProgress >= beadsStartProgress) {
                    beadsVisible = true;
                    // Map 0.8-1.0 transition progress to 0.9-1.0 coverage
                    const normalizedProgress =
                        (this.transitionProgress - beadsStartProgress) / (1.0 - beadsStartProgress);
                    coverage = 0.9 + normalizedProgress * 0.1;
                }
            } else if (this.transitionDirection === 'out' && this.isTransitioning) {
                // Beads appear in first 20% of exit transition (when shadow is leaving sun's rim)
                const beadsEndProgress = 0.2; // Stop showing beads at 20% of exit transition
                if (this.transitionProgress <= beadsEndProgress) {
                    beadsVisible = true;
                    // Map 0.0-0.2 transition progress to 1.0-0.9 coverage
                    const normalizedProgress = this.transitionProgress / beadsEndProgress;
                    coverage = 1.0 - normalizedProgress * 0.1;
                }
            } else if (!this.isTransitioning) {
                // At totality: coverage = 1.0, beads VISIBLE (most dramatic moment)
                coverage = 1.0;
                beadsVisible = true;
            }

            this.baileysBeads.setVisible(beadsVisible);
            this.baileysBeads.update(camera, sunPosition, coverage, deltaTime, worldScale);
        } else {
            this.baileysBeads.setVisible(false);
            this.baileysBeads.update(camera, sunPosition, 0, deltaTime, worldScale);
        }
    }

    /**
     * Dispose of all eclipse resources
     */
    dispose() {
        // Dispose shadow disk (always in scene, not parented)
        if (this.shadowDisk) {
            this.scene.remove(this.shadowDisk);
            this.shadowDisk.geometry.dispose();
            this.shadowDisk.material.dispose();
            this.shadowDisk = null;
        }

        // Dispose corona disks
        // Corona disks may be children of sunMesh OR in scene directly
        if (this.coronaDisk) {
            // Remove from parent (sunMesh or scene)
            if (this.coronaDisk.parent) {
                this.coronaDisk.parent.remove(this.coronaDisk);
            }
            this.coronaDisk.geometry.dispose();
            // Dispose shader material uniforms - no need to null, just dispose material
            this.coronaDisk.material.dispose();
            this.coronaDisk = null;
        }

        if (this.counterCoronaDisk) {
            // Remove from parent (sunMesh or scene)
            if (this.counterCoronaDisk.parent) {
                this.counterCoronaDisk.parent.remove(this.counterCoronaDisk);
            }
            // Geometry is shared with main corona, already disposed above
            this.counterCoronaDisk.material.dispose();
            this.counterCoronaDisk = null;
        }

        // Dispose Bailey's Beads
        if (this.baileysBeads) {
            this.baileysBeads.dispose();
            this.baileysBeads = null;
        }

        // Clear temp objects
        this._directionToCamera = null;
        this._up = null;
        this._right = null;
        this._upVector = null;
        this._tempOffset = null;
        this._tempColor = null;

        // Clear references
        this.scene = null;
        this.sunMesh = null;
    }
}
