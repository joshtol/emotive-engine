/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Procedural Smoke Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Advanced procedural smoke shader that transforms void anchor meshes into
 * billowing, rising smoke forms. Uses void models but applies gray colors, upward UV
 * distortion, and edge softening for wispy appearance.
 *
 * @author Emotive Engine Team
 * @module materials/ProceduralSmokeMaterial
 *
 * ## Key Features
 * - Billowing Perlin noise shapes
 * - Upward UV scroll for rising effect
 * - Edge softening for wispy look
 * - Time-based density variation
 * - Translucent with depth-sorted blending
 *
 * ## Master Parameter: density (0-1)
 *
 * | Density  | Visual                     | Smoke Style        |
 * |----------|----------------------------|--------------------|
 * | 0.0      | Very thin, nearly invisible| Steam/mist         |
 * | 0.3      | Light, wispy               | Cigarette smoke    |
 * | 0.5      | Moderate billowing         | Campfire smoke     |
 * | 0.7      | Thick, opaque              | Heavy smoke        |
 * | 1.0      | Dense, dark                | Industrial smoke   |
 *
 * ## Usage
 *
 * ```javascript
 * const smokeMaterial = createProceduralSmokeMaterial({
 *     density: 0.5
 * });
 * mesh.material = smokeMaterial;
 *
 * // In render loop:
 * updateProceduralSmokeMaterial(smokeMaterial, deltaTime);
 * ```
 */

import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════════════════════════════
// NOISE UTILITIES (GLSL)
// ═══════════════════════════════════════════════════════════════════════════════════════

const NOISE_GLSL = /* glsl */`
// Permutation polynomial hash
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

// 3D Simplex noise
float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// Fractal Brownian Motion - 4 octaves for billowing motion
float fbm4(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for (int i = 0; i < 4; i++) {
        value += amplitude * snoise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// SMOKE COLOR UTILITIES (GLSL)
// ═══════════════════════════════════════════════════════════════════════════════════════

const SMOKE_COLOR_GLSL = /* glsl */`
// Smoke color based on local intensity and density
vec3 smokeColor(float intensity, float density, float warmth) {
    // Base smoke colors - grays with optional warmth
    vec3 lightGray = vec3(0.6, 0.6, 0.62);        // Light wispy smoke
    vec3 midGray = vec3(0.35, 0.35, 0.38);        // Standard smoke
    vec3 darkGray = vec3(0.15, 0.15, 0.17);       // Dense smoke
    vec3 almostBlack = vec3(0.05, 0.05, 0.06);    // Heavy industrial

    // Warm tint for fire smoke
    vec3 warmTint = vec3(0.08, 0.04, 0.0);

    // Mix based on density and intensity
    vec3 baseColor;
    float densityIntensity = density * 0.6 + intensity * 0.4;

    if (densityIntensity < 0.33) {
        baseColor = mix(lightGray, midGray, densityIntensity * 3.0);
    } else if (densityIntensity < 0.66) {
        baseColor = mix(midGray, darkGray, (densityIntensity - 0.33) * 3.0);
    } else {
        baseColor = mix(darkGray, almostBlack, (densityIntensity - 0.66) * 3.0);
    }

    // Add warmth for fire-related smoke
    baseColor += warmTint * warmth * (1.0 - densityIntensity);

    return baseColor;
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// VERTEX SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════

const VERTEX_SHADER = /* glsl */`
uniform float uTime;
uniform float uDensity;
uniform float uTurbulence;
uniform float uRiseSpeed;
uniform float uDisplacementStrength;
uniform float uFadeProgress;

varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vViewDir;
varying float vDisplacement;
varying float vNoiseValue;
varying float vRiseOffset;

${NOISE_GLSL}

void main() {
    vPosition = position;
    vNormal = normalMatrix * normal;

    // ═══════════════════════════════════════════════════════════════════════════════
    // VERTEX DISPLACEMENT - Billowing, rising smoke
    // ═══════════════════════════════════════════════════════════════════════════════

    float fadeFactor = uFadeProgress;

    // Rising offset - smoke drifts upward over time
    float riseOffset = uTime * uRiseSpeed * 0.0005;
    vRiseOffset = riseOffset;

    // Animated noise for billowing - offset Y for rise effect
    vec3 noisePos = position * 1.8 + vec3(
        uTime * 0.0006,
        uTime * 0.0004 + riseOffset,  // Y rises
        uTime * 0.0005
    );
    float noiseValue = fbm4(noisePos);
    vNoiseValue = noiseValue * 0.5 + 0.5;

    // Position-based variation for organic billowing
    float posVariation = snoise(position * 2.0 + vec3(0.0, riseOffset * 0.5, 0.0)) * 0.4 + 0.8;

    // Primary displacement - billowing outward
    float baseDisplacement = noiseValue * uDisplacementStrength * (0.5 + uTurbulence * 0.5) * posVariation * fadeFactor;

    vec3 displaced = position + normal * baseDisplacement;

    // Secondary billowing - perpendicular puffs
    vec3 billowPos = position * 2.5 + vec3(uTime * 0.0004, uTime * 0.0003 + riseOffset, uTime * 0.0005);
    float billowX = snoise(billowPos + vec3(30.0, 0.0, 0.0)) * uDisplacementStrength * uTurbulence * 0.4 * fadeFactor;
    float billowZ = snoise(billowPos + vec3(0.0, 0.0, 30.0)) * uDisplacementStrength * uTurbulence * 0.4 * fadeFactor;
    displaced.x += billowX;
    displaced.z += billowZ;

    // Subtle upward drift in vertex position
    displaced.y += riseOffset * 0.02 * fadeFactor;

    // Slow undulation - lazy smoke movement
    float slowBillow = sin(uTime * 0.001 + position.x * 2.0) * uDisplacementStrength * 0.15 * fadeFactor;
    displaced += normal * slowBillow;

    float displacement = baseDisplacement + slowBillow;
    vDisplacement = displacement;

    // World position for view calculations
    vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
    vWorldPosition = worldPos.xyz;
    vViewDir = normalize(cameraPosition - worldPos.xyz);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// FRAGMENT SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════

const FRAGMENT_SHADER = /* glsl */`
uniform float uTime;
uniform float uDensity;
uniform float uIntensity;
uniform float uOpacity;
uniform float uNoiseScale;
uniform float uDissipation;
uniform float uWarmth;
uniform vec3 uTint;

varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vViewDir;
varying float vDisplacement;
varying float vNoiseValue;
varying float vRiseOffset;

${NOISE_GLSL}
${SMOKE_COLOR_GLSL}

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewDir);

    // ═══════════════════════════════════════════════════════════════════════════════
    // SMOKE PATTERN GENERATION
    // ═══════════════════════════════════════════════════════════════════════════════

    // Animated noise for billowing patterns - includes rise offset
    vec3 noisePos = vPosition * uNoiseScale + vec3(
        uTime * 0.0003,
        uTime * 0.0002 + vRiseOffset,
        uTime * 0.00025
    );

    // Primary billow pattern
    float billow = fbm4(noisePos);

    // Secondary wisp detail
    vec3 wispPos = noisePos * 2.5 + vec3(uTime * 0.0002, vRiseOffset * 0.5, uTime * 0.00025);
    float wisp = snoise(wispPos) * 0.5 + 0.5;

    // Position-based variation
    float posVariation = snoise(vPosition * 2.5) * 0.1 + 0.95;

    // Combine patterns
    float pattern = (billow * 0.6 + wisp * 0.4) * posVariation;
    pattern = pattern * 0.5 + 0.5;
    pattern = pow(pattern, 0.85);

    // ═══════════════════════════════════════════════════════════════════════════════
    // EDGE SOFTENING (wispy edges)
    // ═══════════════════════════════════════════════════════════════════════════════

    float fresnel = 1.0 - abs(dot(normal, viewDir));
    fresnel = pow(fresnel, 1.5);

    // Edge dissipation - smoke fades at edges
    float edgeFade = 1.0 - fresnel * uDissipation;
    edgeFade = clamp(edgeFade, 0.0, 1.0);

    // ═══════════════════════════════════════════════════════════════════════════════
    // COLOR CALCULATION
    // ═══════════════════════════════════════════════════════════════════════════════

    // Local intensity from noise and pattern
    float localIntensity = (vNoiseValue * 0.5 + pattern * 0.5);
    localIntensity = clamp(localIntensity, 0.0, 1.0);

    // Get smoke color
    vec3 color = smokeColor(localIntensity, uDensity, uWarmth);

    // Apply tint
    color *= uTint;

    // Apply intensity
    color *= uIntensity * (0.8 + localIntensity * 0.2);

    // ═══════════════════════════════════════════════════════════════════════════════
    // ALPHA CALCULATION - Key for smoke transparency
    // ═══════════════════════════════════════════════════════════════════════════════

    // Base alpha from density - smoke is translucent
    float baseAlpha = uDensity * 0.5 + 0.1;

    // Pattern affects alpha (denser in billows)
    float alpha = baseAlpha * (0.6 + pattern * 0.4) * uOpacity;

    // Edge softening - wispy edges
    alpha *= edgeFade;

    // Displacement affects alpha (thinner at edges)
    float dispFade = smoothstep(0.0, 0.1, abs(vDisplacement) + 0.02);
    alpha *= mix(0.7, 1.0, dispFade);

    // Final alpha
    alpha = clamp(alpha, 0.0, 0.9);  // Cap at 0.9 for some transparency

    // Discard very faint pixels
    if (alpha < 0.02) discard;

    gl_FragColor = vec4(color, alpha);
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// MATERIAL FACTORY
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Linear interpolation helper for 3-point value mapping
 */
function lerp3(low, mid, high, t) {
    if (t < 0.5) {
        return low + (mid - low) * (t * 2);
    } else {
        return mid + (high - mid) * ((t - 0.5) * 2);
    }
}

/**
 * Create a procedural smoke material
 *
 * @param {Object} options - Material configuration
 * @param {number} [options.density=0.5] - Master parameter (0-1)
 * @param {number} [options.intensity] - Brightness multiplier
 * @param {number} [options.turbulence] - Billowing intensity
 * @param {number} [options.riseSpeed] - Upward drift speed
 * @param {number} [options.dissipation] - Edge fade rate
 * @param {number} [options.warmth] - Fire warmth tint (0-1)
 * @param {number} [options.tint=0xffffff] - Color tint
 * @returns {THREE.ShaderMaterial}
 */
export function createProceduralSmokeMaterial(options = {}) {
    const {
        density = 0.5,
        intensity = null,
        displacementStrength = null,
        turbulence = null,
        riseSpeed = null,
        noiseScale = 2.0,
        dissipation = null,
        warmth = 0.0,
        tint = 0xffffff
    } = options;

    // Derive values from density if not explicitly set
    const finalIntensity = intensity ?? lerp3(0.9, 0.7, 0.5, density);  // Denser = darker
    const finalDisplacement = displacementStrength ?? lerp3(0.06, 0.1, 0.14, density);
    const finalTurbulence = turbulence ?? lerp3(0.2, 0.4, 0.6, density);
    const finalRiseSpeed = riseSpeed ?? lerp3(0.3, 0.2, 0.1, density);  // Dense smoke rises slower
    const finalDissipation = dissipation ?? lerp3(0.6, 0.4, 0.2, density);  // Dense = less edge fade

    // Convert tint to THREE.Color
    const tintColor = tint instanceof THREE.Color ? tint : new THREE.Color(tint);

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uDensity: { value: density },
            uIntensity: { value: finalIntensity },
            uOpacity: { value: 0.6 },
            uDisplacementStrength: { value: finalDisplacement },
            uTurbulence: { value: finalTurbulence },
            uRiseSpeed: { value: finalRiseSpeed },
            uNoiseScale: { value: noiseScale },
            uDissipation: { value: finalDissipation },
            uWarmth: { value: warmth },
            uTint: { value: tintColor },
            uFadeProgress: { value: 1.0 }
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,  // Important for smoke layering
        side: THREE.DoubleSide,
        blending: THREE.NormalBlending
    });

    // Store density for reference
    material.userData.density = density;
    material.userData.isProceduralSmoke = true;

    return material;
}

/**
 * Update procedural smoke material time
 *
 * @param {THREE.ShaderMaterial} material - Procedural smoke material
 * @param {number} deltaTime - Time since last frame (seconds)
 */
export function updateProceduralSmokeMaterial(material, deltaTime) {
    if (!material?.uniforms?.uTime) return;
    material.uniforms.uTime.value += deltaTime * 1000;  // Convert to ms
}

/**
 * Set density level (master parameter)
 *
 * @param {THREE.ShaderMaterial} material - Procedural smoke material
 * @param {number} density - New density (0-1)
 */
export function setProceduralSmokeDensity(material, density) {
    if (!material?.uniforms) return;

    material.uniforms.uDensity.value = density;
    material.uniforms.uIntensity.value = lerp3(0.9, 0.7, 0.5, density);
    material.uniforms.uDisplacementStrength.value = lerp3(0.06, 0.1, 0.14, density);
    material.uniforms.uTurbulence.value = lerp3(0.2, 0.4, 0.6, density);
    material.uniforms.uRiseSpeed.value = lerp3(0.3, 0.2, 0.1, density);
    material.uniforms.uDissipation.value = lerp3(0.6, 0.4, 0.2, density);
    material.userData.density = density;
}

/**
 * Set intensity multiplier (for gesture animation integration)
 *
 * @param {THREE.ShaderMaterial} material - Procedural smoke material
 * @param {number} intensity - Intensity multiplier (0-1)
 * @param {number} [fadeProgress] - Smooth fade for vertex displacement
 */
export function setProceduralSmokeIntensity(material, intensity, fadeProgress = null) {
    if (!material?.uniforms) return;

    const clampedIntensity = Math.max(0.01, intensity);
    const dens = material.userData.density || 0.5;
    const baseIntensity = lerp3(0.9, 0.7, 0.5, dens);
    material.uniforms.uIntensity.value = baseIntensity * clampedIntensity;

    if (fadeProgress !== null && material.uniforms.uFadeProgress) {
        material.uniforms.uFadeProgress.value = Math.max(0.01, fadeProgress);
    }
}

/**
 * Set warmth for fire-related smoke
 *
 * @param {THREE.ShaderMaterial} material - Procedural smoke material
 * @param {number} warmth - Warmth level (0-1)
 */
export function setProceduralSmokeWarmth(material, warmth) {
    if (!material?.uniforms?.uWarmth) return;
    material.uniforms.uWarmth.value = warmth;
}

/**
 * Get physics-like properties for smoke at given density
 *
 * @param {number} density - Density level (0-1)
 * @returns {Object} Physics properties
 */
export function getProceduralSmokePhysics(density) {
    return {
        riseSpeed: lerp3(0.04, 0.025, 0.01, density),     // Light smoke rises faster
        spreadRate: lerp3(0.03, 0.05, 0.07, density),     // Dense spreads more
        dissipationTime: lerp3(2.0, 4.0, 8.0, density),   // Dense lingers longer
        turbulence: lerp3(0.3, 0.5, 0.7, density)         // Dense = more turbulent
    };
}

export default {
    createProceduralSmokeMaterial,
    updateProceduralSmokeMaterial,
    setProceduralSmokeDensity,
    setProceduralSmokeIntensity,
    setProceduralSmokeWarmth,
    getProceduralSmokePhysics
};
