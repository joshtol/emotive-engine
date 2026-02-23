/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Electric Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Standalone electric/lightning material with charge-driven behavior
 * @author Emotive Engine Team
 * @module materials/ElectricMaterial
 *
 * ## Master Parameter: charge (0-1)
 *
 * | Charge | Visual              | Physics            | Example   |
 * |--------|---------------------|--------------------|-----------|
 * | 0.0    | Faint static        | Subtle attraction  | Static    |
 * | 0.5    | Visible arcs        | Medium chain       | Standard  |
 * | 1.0    | Intense bolts       | Strong chain       | Lightning |
 *
 * Electric is often used as an OVERLAY on other shatters.
 *
 * ## Usage
 *
 * Standalone:
 *   const electricMesh = new THREE.Mesh(geometry, createElectricMaterial({ charge: 0.7 }));
 *
 * As overlay on shatter:
 *   shatterSystem.shatter(mesh, dir, { overlay: 'electric', overlayParam: 0.8 });
 */

import * as THREE from 'three';

/**
 * Interpolate between values based on parameter
 */
function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Get electric color based on charge
 */
function getElectricColor(charge, tint) {
    if (tint) return tint.clone();

    const color = new THREE.Color();

    if (charge < 0.3) {
        // Low charge - pale blue static
        color.setRGB(0.6, 0.8, 1.0);
    } else if (charge < 0.7) {
        // Medium - bright cyan
        const t = (charge - 0.3) / 0.4;
        color.setRGB(
            lerp(0.6, 0.3, t),
            lerp(0.8, 1.0, t),
            1.0
        );
    } else {
        // High charge - white-blue intense
        const t = (charge - 0.7) / 0.3;
        color.setRGB(
            lerp(0.3, 0.9, t),
            1.0,
            1.0
        );
    }

    return color;
}

/**
 * Create an electric material with charge-driven appearance
 *
 * @param {Object} options
 * @param {number} [options.charge=0.5] - Master parameter (0=static, 0.5=arcs, 1=lightning)
 * @param {THREE.Color} [options.color] - Override color (otherwise cyan-blue gradient)
 * @param {number} [options.opacity=0.9] - Base opacity
 * @returns {THREE.ShaderMaterial}
 */
export function createElectricMaterial(options = {}) {
    const {
        charge = 0.5,
        color = null,
        opacity = 0.9
    } = options;

    // Derive properties from charge
    const electricColor = getElectricColor(charge, color);
    const intensity = lerp(0.5, 5.0, charge);
    const arcFrequency = lerp(0.5, 8.0, charge);
    const branchCount = Math.floor(lerp(2, 12, charge));
    const arcThickness = lerp(0.01, 0.04, charge);
    const flickerRate = lerp(4.0, 20.0, charge);

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: electricColor },
            uIntensity: { value: intensity },
            uArcFrequency: { value: arcFrequency },
            uBranchCount: { value: branchCount },
            uArcThickness: { value: arcThickness },
            uFlickerRate: { value: flickerRate },
            uOpacity: { value: opacity },
            uTime: { value: 0 },
            uCharge: { value: charge }
        },

        vertexShader: /* glsl */`
            varying vec3 vPosition;
            varying vec3 vWorldPosition;
            varying vec3 vNormal;
            varying vec3 vViewDir;
            varying vec2 vUv;

            void main() {
                vPosition = position;
                vUv = uv;

                // World space position for view direction
                vec4 worldPos = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPos.xyz;

                // View direction in world space
                vViewDir = normalize(cameraPosition - worldPos.xyz);

                // Normal in world space
                vNormal = normalize(mat3(modelMatrix) * normal);

                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,

        fragmentShader: /* glsl */`
            uniform vec3 uColor;
            uniform float uIntensity;
            uniform float uArcFrequency;
            uniform float uBranchCount;
            uniform float uArcThickness;
            uniform float uFlickerRate;
            uniform float uOpacity;
            uniform float uTime;
            uniform float uCharge;

            varying vec3 vPosition;
            varying vec3 vWorldPosition;
            varying vec3 vNormal;
            varying vec3 vViewDir;
            varying vec2 vUv;

            // ═══════════════════════════════════════════════════════════════
            // HASH FUNCTIONS
            // ═══════════════════════════════════════════════════════════════
            float hash(float n) {
                return fract(sin(n) * 43758.5453);
            }

            vec2 hash2(vec2 p) {
                p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
                return fract(sin(p) * 43758.5453);
            }

            vec3 hash3(vec3 p) {
                p = vec3(
                    dot(p, vec3(127.1, 311.7, 74.7)),
                    dot(p, vec3(269.5, 183.3, 246.1)),
                    dot(p, vec3(113.5, 271.9, 124.6))
                );
                return fract(sin(p) * 43758.5453);
            }

            // ═══════════════════════════════════════════════════════════════
            // VORONOI WITH EDGE DISTANCE
            // Returns: x = distance to nearest cell, y = distance to edge
            // The EDGE DISTANCE creates thin branching lines perfect for electricity
            // ═══════════════════════════════════════════════════════════════
            vec2 voronoi(vec3 p, float time, float jitter) {
                vec3 n = floor(p);
                vec3 f = fract(p);

                // First pass: find closest cell
                float minDist = 10.0;
                vec3 closestCell = vec3(0.0);
                vec3 closestPoint = vec3(0.0);

                for (int k = -1; k <= 1; k++) {
                    for (int j = -1; j <= 1; j++) {
                        for (int i = -1; i <= 1; i++) {
                            vec3 neighbor = vec3(float(i), float(j), float(k));
                            vec3 cellId = n + neighbor;

                            // Animate cell position over time for moving electricity
                            vec3 cellHash = hash3(cellId);
                            vec3 cellOffset = cellHash * jitter;
                            // Add time-based movement
                            cellOffset += sin(time * 3.0 + cellHash * 6.28) * 0.15;

                            vec3 cellPoint = neighbor + cellOffset;
                            float d = length(cellPoint - f);

                            if (d < minDist) {
                                minDist = d;
                                closestCell = cellId;
                                closestPoint = cellPoint;
                            }
                        }
                    }
                }

                // Second pass: find distance to nearest edge
                // This is where the THIN LINES come from
                float minEdgeDist = 10.0;

                for (int k = -1; k <= 1; k++) {
                    for (int j = -1; j <= 1; j++) {
                        for (int i = -1; i <= 1; i++) {
                            vec3 neighbor = vec3(float(i), float(j), float(k));
                            vec3 cellId = n + neighbor;

                            if (cellId == closestCell) continue;

                            vec3 cellHash = hash3(cellId);
                            vec3 cellOffset = cellHash * jitter;
                            cellOffset += sin(time * 3.0 + cellHash * 6.28) * 0.15;

                            vec3 cellPoint = neighbor + cellOffset;

                            // Calculate distance to edge between cells
                            // Edge is the perpendicular bisector of the line between cells
                            vec3 toCenter = (closestPoint + cellPoint) * 0.5;
                            vec3 cellDiff = normalize(cellPoint - closestPoint);
                            float edgeDist = dot(toCenter - f, cellDiff);
                            edgeDist = abs(edgeDist);

                            minEdgeDist = min(minEdgeDist, edgeDist);
                        }
                    }
                }

                return vec2(minDist, minEdgeDist);
            }

            // ═══════════════════════════════════════════════════════════════
            // 2D VORONOI FOR SECONDARY CRACKLING
            // ═══════════════════════════════════════════════════════════════
            float voronoi2D(vec2 p, float time) {
                vec2 n = floor(p);
                vec2 f = fract(p);

                float minDist = 10.0;
                vec2 closestPoint = vec2(0.0);
                vec2 closestCell = vec2(0.0);

                for (int j = -1; j <= 1; j++) {
                    for (int i = -1; i <= 1; i++) {
                        vec2 neighbor = vec2(float(i), float(j));
                        vec2 cellId = n + neighbor;
                        vec2 cellHash = hash2(cellId);
                        vec2 cellOffset = cellHash * 0.9;
                        cellOffset += sin(time * 5.0 + cellHash * 6.28) * 0.2;

                        vec2 cellPoint = neighbor + cellOffset;
                        float d = length(cellPoint - f);

                        if (d < minDist) {
                            minDist = d;
                            closestPoint = cellPoint;
                            closestCell = cellId;
                        }
                    }
                }

                float minEdgeDist = 10.0;
                for (int j = -1; j <= 1; j++) {
                    for (int i = -1; i <= 1; i++) {
                        vec2 neighbor = vec2(float(i), float(j));
                        vec2 cellId = n + neighbor;

                        if (cellId == closestCell) continue;

                        vec2 cellHash = hash2(cellId);
                        vec2 cellOffset = cellHash * 0.9;
                        cellOffset += sin(time * 5.0 + cellHash * 6.28) * 0.2;

                        vec2 cellPoint = neighbor + cellOffset;

                        vec2 toCenter = (closestPoint + cellPoint) * 0.5;
                        vec2 cellDiff = normalize(cellPoint - closestPoint);
                        float edgeDist = abs(dot(toCenter - f, cellDiff));

                        minEdgeDist = min(minEdgeDist, edgeDist);
                    }
                }

                return minEdgeDist;
            }

            // ═══════════════════════════════════════════════════════════════
            // SPARK POINTS - Random flickering bright spots
            // ═══════════════════════════════════════════════════════════════
            float sparks(vec3 pos, float time) {
                vec3 gridPos = pos * 12.0;
                vec3 gridId = floor(gridPos);
                vec3 gridUv = fract(gridPos);

                float spark = 0.0;
                for (int z = 0; z <= 1; z++) {
                    for (int y = 0; y <= 1; y++) {
                        for (int x = 0; x <= 1; x++) {
                            vec3 offset = vec3(float(x), float(y), float(z));
                            vec3 cellId = gridId + offset;

                            vec3 sparkPos = hash3(cellId) * 0.8 + 0.1;
                            float d = length(gridUv - offset - sparkPos + 0.5);

                            // Irregular flicker timing
                            float flickerSeed = dot(cellId, vec3(127.1, 311.7, 74.7));
                            float flicker = step(0.75, fract(sin(time * 15.0 + flickerSeed) * 43758.5453));

                            spark += smoothstep(0.12, 0.0, d) * flicker;
                        }
                    }
                }

                return spark;
            }

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewDir);

                // ═══════════════════════════════════════════════════════════════
                // FRESNEL RIM - Subtle edge highlight
                // ═══════════════════════════════════════════════════════════════
                float fresnel = 1.0 - abs(dot(normal, viewDir));
                fresnel = pow(fresnel, 3.0);
                float rimGlow = fresnel * 0.15 * uCharge;

                // ═══════════════════════════════════════════════════════════════
                // LIGHTNING ARCS: Voronoi cell edges = thin branching lines
                // ═══════════════════════════════════════════════════════════════

                // Use VERY thin line thickness for sharp electricity
                float lineWidth = 0.015;  // Thin lines regardless of charge

                // Primary arcs - larger cells = fewer, thicker main bolts
                float scale1 = 3.0;
                vec2 v1 = voronoi(vPosition * scale1, uTime * 0.8, 0.85);
                float bolt1 = 1.0 - smoothstep(0.0, lineWidth * 1.2, v1.y);
                bolt1 = pow(bolt1, 2.0);  // Sharpen the falloff

                // Secondary crackling - smaller cells = more fine detail
                float scale2 = 6.0;
                vec2 v2 = voronoi(vPosition * scale2, uTime * 1.2, 0.8);
                float bolt2 = 1.0 - smoothstep(0.0, lineWidth * 0.8, v2.y);
                bolt2 = pow(bolt2, 2.5) * 0.6;

                // Tertiary micro-cracks
                float scale3 = 10.0;
                vec2 v3 = voronoi(vPosition * scale3, uTime * 1.6, 0.75);
                float bolt3 = 1.0 - smoothstep(0.0, lineWidth * 0.5, v3.y);
                bolt3 = pow(bolt3, 3.0) * 0.3;

                // Combine - don't let it exceed 1.0
                float lightning = min(bolt1 + bolt2 + bolt3, 1.0);

                // ═══════════════════════════════════════════════════════════════
                // FLICKER - Electrical pulsing
                // ═══════════════════════════════════════════════════════════════
                float flickerTime = uTime * uFlickerRate * 0.5;
                float flicker = 0.7 + 0.3 * step(0.5, fract(sin(flickerTime * 11.3) * 43758.5453));
                lightning *= flicker;

                // ═══════════════════════════════════════════════════════════════
                // SPARKS - Occasional bright point flashes
                // ═══════════════════════════════════════════════════════════════
                float sparkVal = sparks(vPosition, uTime) * 0.8;

                // ═══════════════════════════════════════════════════════════════
                // FINAL COLOR - Keep it CYAN, not white
                // ═══════════════════════════════════════════════════════════════
                float brightness = lightning + sparkVal + rimGlow;

                // Color stays cyan - only the very brightest peaks go slightly white
                vec3 cyanColor = uColor;  // Base cyan
                vec3 brightCyan = uColor * 1.5 + vec3(0.2, 0.3, 0.4);  // Brighter cyan, slight white tint

                // Mix based on brightness - mostly cyan, white only at peaks
                float whiteMix = smoothstep(0.7, 1.0, brightness) * 0.3;
                vec3 finalColor = mix(cyanColor, brightCyan, whiteMix);

                // Apply brightness to color (capped to prevent white-out)
                finalColor *= min(brightness * 1.5, 2.0);

                // ═══════════════════════════════════════════════════════════════
                // ALPHA: Thin lines visible, dark areas transparent
                // ═══════════════════════════════════════════════════════════════
                float alpha = brightness * uOpacity;
                alpha = clamp(alpha, 0.0, 0.9);

                // Discard dark pixels
                if (alpha < 0.03) discard;

                gl_FragColor = vec4(finalColor, alpha);
            }
        `,

        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
    });

    // Store parameters for external access
    material.userData.charge = charge;
    material.userData.elementalType = 'electric';

    return material;
}

/**
 * Update electric material animation
 * Call this each frame for animated electricity
 *
 * @param {THREE.ShaderMaterial} material - Electric material to update
 * @param {number} deltaTime - Time since last frame in seconds
 */
export function updateElectricMaterial(material, deltaTime) {
    if (material?.uniforms?.uTime) {
        material.uniforms.uTime.value += deltaTime;
    }
}

/**
 * Get physics configuration for electric element
 * Used by shatter system for shard behavior
 *
 * @param {number} charge - Charge parameter 0-1
 * @returns {Object} Physics configuration
 */
export function getElectricPhysics(charge = 0.5) {
    return {
        gravity: 0.0,                                // Electric floats/hovers
        drag: lerp(0.3, 0.02, charge),              // High charge = less drag
        bounce: 0.0,
        chainToNearby: charge > 0.3,                 // Arcs jump between shards
        chainRadius: lerp(0.5, 2.0, charge),
        lifetime: lerp(0.3, 0.8, charge),           // Quick flashes
        flickerOnMove: true,
        attractToMetal: charge > 0.5                 // High charge attracted to metallic objects
    };
}

/**
 * Get crack style for electric element
 * Used by crack system for elemental crack appearance
 *
 * @param {number} charge - Charge parameter 0-1
 * @returns {Object} Crack style configuration
 */
export function getElectricCrackStyle(charge = 0.5) {
    const color = getElectricColor(charge);

    return {
        color: color.getHex(),
        emissive: lerp(1.0, 6.0, charge),
        animated: true,
        pattern: 'branching',
        arcBetweenCracks: charge > 0.5   // Lightning jumps between crack lines
    };
}

export default {
    createElectricMaterial,
    updateElectricMaterial,
    getElectricPhysics,
    getElectricCrackStyle
};
