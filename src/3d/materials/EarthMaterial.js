/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Earth Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Standalone earth/stone material — consuming petrification overlay for mascot mesh
 * @author Emotive Engine Team
 * @module materials/EarthMaterial
 *
 * ## Master Parameters
 *
 * petrification (0-1): Controls maximum consumption coverage
 *   0.0 = Faint edge stone | 0.5 = Partial petrification | 1.0 = Near-total encasement
 *
 * progress (0-1): Gesture progress drives the SPREAD of stone over time
 *   0.0 = Stone just beginning to creep from edges
 *   1.0 = Full petrification-dependent consumption achieved
 *
 * ## Organic Growth/Retreat
 *
 * Stone rises from BELOW — feet/base first, climbing upward like earth reclaiming.
 * Growth uses Voronoi-cell patch boundaries so stone spreads in organic irregular patches,
 * not a smooth noise front. Each patch has its own growth timing via cell hash.
 *
 * On retreat (low/falling progress), consumed areas CRUMBLE — Voronoi crack texture
 * fragments the retreating edge so stone breaks apart into debris rather than fading.
 *
 * Amber-gold emission rim marks the boundary where stone meets flesh.
 * Consumed areas have rocky stone texture with crack patterns and dirt in crevices.
 */

import * as THREE from 'three';

function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Create an earth material with consuming petrification effect
 *
 * @param {Object} options
 * @param {number} [options.petrification=0.5] - Max consumption coverage (0=faint, 1=near-total)
 * @param {number} [options.opacity=0.9] - Base opacity
 * @returns {THREE.ShaderMaterial}
 */
export function createEarthMaterial(options = {}) {
    const {
        petrification = 0.5,
        opacity = 0.9
    } = options;

    const pulseSpeed = lerp(0.5, 1.5, petrification);

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uPetrification: { value: petrification },
            uProgress: { value: 0 },
            uPulseSpeed: { value: pulseSpeed },
            uOpacity: { value: opacity },
            uTime: { value: 0 }
        },

        vertexShader: /* glsl */`
            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec3 vWorldNormal;
            varying vec3 vViewPosition;
            varying float vVerticalPos;

            void main() {
                vPosition = position;
                vNormal = normalMatrix * normal;
                vWorldNormal = (modelMatrix * vec4(normal, 0.0)).xyz;

                // Vertical gradient in object space — feet are bottom, head is top
                vVerticalPos = position.y;

                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;

                gl_Position = projectionMatrix * mvPosition;
            }
        `,

        fragmentShader: /* glsl */`
            uniform float uPetrification;
            uniform float uProgress;
            uniform float uPulseSpeed;
            uniform float uOpacity;
            uniform float uTime;

            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec3 vWorldNormal;
            varying vec3 vViewPosition;
            varying float vVerticalPos;

            // ═══ HASH FUNCTIONS ═══
            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
            }

            float hash3(vec3 p) {
                p = fract(p * 0.3183099 + 0.1);
                p *= 17.0;
                return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
            }

            // ═══ VALUE NOISE ═══
            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                return mix(
                    mix(hash(i), hash(i + vec2(1, 0)), f.x),
                    mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x),
                    f.y
                );
            }

            float noise3D(vec3 p) {
                vec3 i = floor(p);
                vec3 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                return mix(
                    mix(mix(hash3(i), hash3(i + vec3(1,0,0)), f.x),
                        mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), f.x), f.y),
                    mix(mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), f.x),
                        mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), f.x), f.y),
                    f.z
                );
            }

            // FBM for rock surface detail
            float fbm3D(vec3 p) {
                float value = 0.0;
                float amp = 0.5;
                for (int i = 0; i < 4; i++) {
                    value += amp * noise3D(p);
                    p *= 2.0;
                    amp *= 0.5;
                }
                return value;
            }

            // ═══ VORONOI ═══
            // Returns vec2(minDist, cellHash) for patch growth timing
            vec3 voronoi(vec2 p) {
                vec2 n = floor(p);
                vec2 f = fract(p);
                float minDist = 1.0;
                float secondDist = 1.0;
                float cellHash = 0.0;
                for (int j = -1; j <= 1; j++) {
                    for (int i = -1; i <= 1; i++) {
                        vec2 neighbor = vec2(float(i), float(j));
                        vec2 cellId = n + neighbor;
                        vec2 point = hash(cellId) * vec2(0.8) + 0.1 + neighbor;
                        float d = length(f - point);
                        if (d < minDist) {
                            secondDist = minDist;
                            minDist = d;
                            cellHash = hash(cellId + vec2(73.1, 19.4));
                        } else if (d < secondDist) {
                            secondDist = d;
                        }
                    }
                }
                float edgeDist = secondDist - minDist;
                return vec3(minDist, edgeDist, cellHash);
            }

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewPosition);
                float NdotV = abs(dot(normal, viewDir));
                float edgeness = 1.0 - NdotV;

                // ═══ CONSUMPTION FIELD ═══
                // Object-space position projected to 2D for consistent pattern
                vec2 pos = vPosition.xz * 2.5 + vec2(vPosition.y * 0.8, -vPosition.y * 0.6);

                // 3-octave FBM — organic creeping consumption boundary
                float n1 = noise(pos * 1.5 + uTime * 0.06);
                float n2 = noise(pos * 4.0 - uTime * 0.08);
                float n3 = noise(pos * 9.0 + uTime * 0.12);
                float consumeField = n1 * 0.45 + n2 * 0.30 + n3 * 0.15;

                // ═══ VORONOI PATCH GROWTH ═══
                // Large Voronoi cells create organic patch boundaries
                // Each cell has a unique growth delay from its hash
                vec3 voro = voronoi(pos * 1.8);
                float cellDelay = voro.z * 0.35; // 0-0.35 stagger per cell
                float patchEdge = voro.y; // Edge distance for crack boundaries

                // Mix Voronoi patch field into consumption
                consumeField += voro.x * 0.10;

                // ═══ BOTTOM-UP VERTICAL BIAS ═══
                // Earth rises from below — feet/base consumed first, head last
                // vVerticalPos: roughly -0.5 (feet) to +0.5 (head) in object space
                float verticalBias = smoothstep(0.6, -0.4, vVerticalPos) * 0.35;
                consumeField += verticalBias;

                // Fresnel bias: stone also creeps from silhouette edges inward
                consumeField += edgeness * 0.15;

                // ═══ DISSOLVE IN ═══
                float rawDissolve = smoothstep(0.0, 0.35, uProgress);
                float dissolveIn = rawDissolve * rawDissolve;

                // ═══ PROGRESS-DRIVEN THRESHOLD ═══
                // Per-cell delay makes patches appear at staggered times
                float effectiveProgress = max(0.0, uProgress - cellDelay);
                float rawRamp = smoothstep(0.0, 1.0, effectiveProgress);
                float progressRamp = rawRamp * rawRamp;

                // At progress=0: threshold=0.95 (nearly nothing consumed)
                // At progress=1: threshold based on petrification
                float targetThreshold = mix(0.85, 0.12, uPetrification);
                float threshold = mix(0.95, targetThreshold, progressRamp);

                // Wider transition zone for organic edge (not a hard line)
                float consumed = smoothstep(threshold, threshold - 0.08, consumeField);

                // ═══ CRUMBLE RETREAT ═══
                // When progress is falling (retreat phase), fragmenting the edge
                // This makes stone break apart into debris rather than smooth-fading
                float crumbleField = noise(pos * 12.0 + uTime * 0.2) * 0.5
                                   + noise(pos * 20.0 - uTime * 0.15) * 0.3
                                   + noise(pos * 35.0) * 0.2;
                // Crumble texture erodes the retreating edge
                float crumbleErosion = smoothstep(0.35, 0.65, crumbleField);
                // Only apply crumble near the consumption boundary (retreating edge)
                float nearEdge = smoothstep(threshold - 0.12, threshold - 0.04, consumeField)
                               * smoothstep(threshold + 0.02, threshold - 0.02, consumeField);
                consumed *= mix(1.0, crumbleErosion, nearEdge * 0.6);

                // ═══ TENDRILS ═══
                // Fine stone veins reaching AHEAD of the main consumption front
                float tendrilField = noise(pos * 8.0 + uTime * 0.15) * 0.6
                                   + noise(pos * 14.0 - uTime * 0.10) * 0.4;
                float tendrilThreshold = threshold + 0.10;
                float tendrils = smoothstep(tendrilThreshold, tendrilThreshold - 0.03,
                                            tendrilField + edgeness * 0.12);
                tendrils *= 0.35 * smoothstep(0.0, 0.4, uPetrification * progressRamp);

                float stoneMask = max(consumed, tendrils);

                // ═══ STONE COLOR — Seiryu-style dark grey limestone ═══
                // Cool charcoal grey with slight blue undertones.
                // Petrification drives from warm grey → cool grey.
                vec3 warmGrey = vec3(0.36, 0.34, 0.31);
                vec3 coolGrey = vec3(0.31, 0.31, 0.33);
                vec3 baseStone = mix(warmGrey, coolGrey, uPetrification);

                // ═══ MINERAL COLOR PATCHES ═══
                // Blue-grey dominant, sparse warm ochre — Seiryu uniformity
                float mineralNoise1 = noise3D(vPosition * 1.5 + vec3(3.7, 0.0, 0.0));
                float mineralNoise2 = noise3D(vPosition * 0.8 + vec3(1.3, 0.7, 2.5));
                vec3 blueGrey = vec3(0.18, 0.20, 0.26);
                float blueGreyMask = smoothstep(0.35, 0.18, mineralNoise2);
                baseStone = mix(baseStone, blueGrey, blueGreyMask * 0.12);

                // Per-pixel shade variation — subtle warm/cool shifts
                float shadeNoise = noise3D(vPosition * 8.0 + vec3(5.5, 0.0, 0.0));
                baseStone *= 0.93 + shadeNoise * 0.14;
                float tintNoise = noise3D(vPosition * 5.0 + vec3(2.2, 1.7, 0.4));
                vec3 warmShift = baseStone * vec3(1.03, 0.99, 0.95);
                vec3 coolShift = baseStone * vec3(0.97, 1.00, 1.03);
                baseStone = mix(coolShift, warmShift, tintNoise);

                // ═══ SURFACE NOISE + PROCEDURAL BUMP ═══
                // FBM drives both color crevice/ridge AND bump normal perturbation
                float rockLarge = fbm3D(vPosition * 1.8 + vec3(3.0, 0.0, 0.0));
                float rockMedium = noise3D(vPosition * 5.0 + vec3(6.0, 0.0, 0.0));
                float rockNoise = rockLarge * 0.7 + rockMedium * 0.3;
                float detailNoise = noise3D(vPosition * 10.0 + vec3(7.0, 0.0, 0.0));

                // Procedural bump — dFdx/dFdy of noise height field
                float bumpHeight = rockNoise * 0.6 + detailNoise * 0.4;
                float dhdx = dFdx(bumpHeight);
                float dhdy = dFdy(bumpHeight);
                vec3 surfT = normalize(dFdx(vPosition));
                vec3 surfB = normalize(dFdy(vPosition));
                vec3 bumpedNormal = normalize(normal - 5.0 * 0.6 * (surfT * dhdx + surfB * dhdy));

                // ═══ THREE-LIGHT DIFFUSE + HEMISPHERE AMBIENT ═══
                vec3 lightDir1 = normalize(vec3(0.5, 1.0, 0.3));
                vec3 lightDir2 = normalize(vec3(-0.4, 0.6, -0.5));
                vec3 lightDir3 = normalize(vec3(0.0, -0.3, 0.8));
                float NdotL1 = max(0.0, dot(bumpedNormal, lightDir1));
                float NdotL2 = max(0.0, dot(bumpedNormal, lightDir2));
                float NdotL3 = max(0.0, dot(bumpedNormal, lightDir3));
                float diffuse = NdotL1 * 0.78 + NdotL2 * 0.14 + NdotL3 * 0.08;

                float skyAmt = bumpedNormal.y * 0.5 + 0.5;
                vec3 ambientUp = vec3(0.21, 0.21, 0.22);
                vec3 ambientDown = vec3(0.10, 0.10, 0.11);
                vec3 ambient = mix(ambientDown, ambientUp, skyAmt);

                vec3 consumedColor = baseStone * (ambient + vec3(diffuse));

                // ═══ EDGE AMBIENT OCCLUSION ═══
                float edgeNdotV = max(0.0, dot(bumpedNormal, viewDir));
                float edgeAO = smoothstep(0.0, 0.45, edgeNdotV);
                consumedColor *= mix(0.84, 1.0, edgeAO);

                // ═══ SURFACE DETAIL — crevice/ridge color ═══
                float crevice = smoothstep(0.30, 0.48, rockNoise);
                vec3 creviceColor = baseStone * vec3(0.55, 0.55, 0.57);
                consumedColor = mix(creviceColor, consumedColor, crevice);

                float ridge = smoothstep(0.60, 0.75, rockNoise);
                consumedColor = mix(consumedColor, baseStone * vec3(1.10, 1.08, 1.05), ridge * 0.25);

                // Micro-grain texture
                float microGrain = hash(floor(vPosition.xz * 120.0));
                float grit = detailNoise * 0.55 + microGrain * 0.45;
                consumedColor *= 0.88 + grit * 0.24;

                // ═══ POST-DIFFUSE WARM MOTTLING ═══
                // Multiplicative tint preserves warm/cool contrast on screen
                float ochreMask = smoothstep(0.42, 0.65, mineralNoise1);
                float mineralNoise3 = noise3D(vPosition * 2.5 + vec3(6.0, 0.0, 3.0));
                float warmMask = smoothstep(0.45, 0.68, mineralNoise3);
                float warmAmount = min(ochreMask * 0.35 + warmMask * 0.25, 0.40);
                warmAmount *= smoothstep(0.05, 0.4, diffuse);  // Only in lit areas
                vec3 warmTint = vec3(1.08, 1.03, 0.93);
                consumedColor *= mix(vec3(1.0), warmTint, warmAmount);

                // ═══ SEDIMENTARY STRATA ═══
                float strataY = vPosition.y * 6.0;
                float strataWarp = noise3D(vPosition * 2.0 + vec3(0.0, 5.0, 0.0));
                float strata = sin(strataY + strataWarp * 2.0) * 0.5 + 0.5;
                vec3 warmBand = consumedColor * vec3(1.03, 1.01, 0.97);
                vec3 coolBand = consumedColor * vec3(0.97, 0.99, 1.03);
                consumedColor = mix(coolBand, warmBand, strata);

                // ═══ CRACKS + CALCITE VEINS — Seiryu limestone signature ═══
                // Separate visual crack Voronoi from the consumption growth Voronoi
                vec2 crackPos2 = vPosition.xz * 2.5 + vec2(vPosition.y * 0.7, 2.0);
                vec3 crackVoro = voronoi(crackPos2);
                float visualCrackEdge = crackVoro.y;

                // Break mask — erases ~35% of crack features
                float breakNoise2 = noise3D(vec3(crackPos2 * 0.5, 5.0));
                float breakMask2 = smoothstep(0.25, 0.50, breakNoise2);

                // Calcite selection — ~40% of surviving cracks become bright white
                float calciteNoise = noise3D(vec3(crackPos2 * 0.7, 7.0));
                float isCalcite = smoothstep(0.42, 0.58, calciteNoise);

                // Dark crack lines (empty crevice shadows)
                float darkCrackLine = 1.0 - smoothstep(0.0, 0.04, visualCrackEdge);
                darkCrackLine *= breakMask2 * (1.0 - isCalcite);
                consumedColor = mix(consumedColor, vec3(0.06, 0.05, 0.04), darkCrackLine * 0.85);

                // Calcite veins — bright white lines
                float calciteLine = 1.0 - smoothstep(0.0, 0.05, visualCrackEdge);
                calciteLine *= breakMask2 * isCalcite;
                vec3 calciteColor = vec3(0.75, 0.74, 0.72);
                consumedColor = mix(consumedColor, calciteColor, calciteLine * 0.75);

                // ═══ DIRT IN CREVICES ═══
                // Dark soil in consumption-front crevices (from growth Voronoi patchEdge)
                vec3 dirtColor = vec3(0.12, 0.10, 0.08);
                float creviceMask = smoothstep(0.4, 0.0, patchEdge) * 0.3;
                consumedColor = mix(consumedColor, dirtColor, creviceMask);

                // ═══ EDGE EMISSION ═══
                // Amber-gold rim where stone meets flesh — grinding mineral energy
                float edgeBand = smoothstep(threshold - 0.08, threshold - 0.02, consumeField)
                               * smoothstep(threshold + 0.04, threshold, consumeField);

                // Breathing pulse
                float pulse = 0.85 + 0.15 * sin(uTime * uPulseSpeed);
                edgeBand *= pulse;

                // ═══ TENDRIL GLOW ═══
                // Faint mineral energy in the tendrils reaching ahead
                float tendrilGlow = tendrils * 0.3 * dissolveIn;

                // ═══ COMPOSITE COLOR ═══
                vec3 color = consumedColor * stoneMask;

                // Amber-gold edge emission
                vec3 emissionColor = vec3(0.85, 0.60, 0.25);
                color += emissionColor * edgeBand * uPetrification * 2.0 * dissolveIn * uOpacity;

                // Tendril glow — subtle warm veins
                color += vec3(0.60, 0.40, 0.15) * tendrilGlow * uOpacity;

                // ═══ FRESNEL RIM ═══
                float fresnelGlow = pow(edgeness, 3.0) * uPetrification * progressRamp * 0.2;
                color += baseStone * fresnelGlow;

                // ═══ ALPHA ═══
                float alpha = stoneMask * uOpacity * dissolveIn;

                // Edge emission alpha
                float edgeAlpha = edgeBand * uPetrification * 0.5 * dissolveIn * dissolveIn * uOpacity;
                alpha = max(alpha, edgeAlpha);

                // Fresnel rim alpha
                alpha = max(alpha, fresnelGlow * dissolveIn * uOpacity);

                if (alpha < 0.01) discard;

                gl_FragColor = vec4(color, alpha);
            }
        `,

        transparent: true,
        blending: THREE.NormalBlending,
        depthWrite: false,
        side: THREE.DoubleSide
    });

    material.userData.petrification = petrification;
    material.userData.elementalType = 'earth';

    return material;
}

/**
 * Update earth material animation
 */
export function updateEarthMaterial(material, deltaTime) {
    if (material?.uniforms?.uTime) {
        material.uniforms.uTime.value += deltaTime;
    }
}

/**
 * Get physics configuration for earth element
 */
export function getEarthPhysics(petrification = 0.5) {
    return {
        gravity: lerp(1.0, 1.5, petrification),
        drag: lerp(0.2, 0.05, petrification),
        bounce: lerp(0.1, 0.3, petrification),
        friction: lerp(0.8, 0.6, petrification),
        canShatter: petrification > 0.7,
        crumblesOnImpact: petrification < 0.4,
        weight: lerp(1.0, 2.0, petrification),
        rootsTarget: petrification < 0.3
    };
}

export default {
    createEarthMaterial,
    updateEarthMaterial,
    getEarthPhysics
};
