/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Procedural Fire Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Advanced procedural fire shader that transforms anchor meshes into
 * realistic, volumetric-looking flames. The mesh geometry acts as an anchor/seed point,
 * while the shader generates dynamic fire that extends beyond the original bounds.
 *
 * @author Emotive Engine Team
 * @module materials/ProceduralFireMaterial
 *
 * ## Key Features
 * - Procedural noise-based flame generation (6-octave FBM)
 * - Vertex displacement for volumetric flame extension
 * - Temperature-based blackbody color ramp
 * - Soft edges via fresnel and alpha falloff
 * - Time-based animation with flicker and turbulence
 *
 * ## Master Parameter: temperature (0-1)
 *
 * | Temperature | Visual                     | Flame Style      |
 * |-------------|----------------------------|------------------|
 * | 0.0         | Deep red, smoldering       | Dying embers     |
 * | 0.3         | Orange, flickering         | Campfire         |
 * | 0.5         | Bright orange-yellow       | Standard fire    |
 * | 0.7         | Yellow-white, intense      | Hot blaze        |
 * | 1.0         | White-blue, plasma         | Welding/plasma   |
 *
 * ## Usage
 *
 * ```javascript
 * const fireMaterial = createProceduralFireMaterial({
 *     temperature: 0.6,
 *     flameHeight: 1.5,
 *     turbulence: 0.8
 * });
 * mesh.material = fireMaterial;
 *
 * // In render loop:
 * updateProceduralFireMaterial(fireMaterial, deltaTime);
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

// Fractal Brownian Motion - 3 octaves (reduced from 6 for GPU performance)
float fbm3(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    float lacunarity = 2.0;
    float persistence = 0.5;

    for (int i = 0; i < 3; i++) {
        value += amplitude * snoise(p * frequency);
        frequency *= lacunarity;
        amplitude *= persistence;
    }
    return value;
}

// Turbulence - absolute value FBM for sharper, more chaotic patterns (3 octaves max for GPU performance)
float turbulence(vec3 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for (int i = 0; i < 3; i++) {
        if (i >= octaves) break;
        value += amplitude * abs(snoise(p * frequency));
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// FIRE COLOR UTILITIES (GLSL)
// ═══════════════════════════════════════════════════════════════════════════════════════

const FIRE_COLOR_GLSL = /* glsl */`
// Blackbody-inspired color ramp for realistic fire
vec3 fireColor(float t, float temperature) {
    // t is local intensity (0-1), temperature is global hotness
    float heat = t * (0.5 + temperature * 0.5);

    vec3 color;

    if (heat < 0.25) {
        // Dark red to orange (embers)
        float f = heat / 0.25;
        color = vec3(0.5 + f * 0.5, f * 0.2, 0.0);
    } else if (heat < 0.5) {
        // Orange to yellow
        float f = (heat - 0.25) / 0.25;
        color = vec3(1.0, 0.2 + f * 0.6, f * 0.1);
    } else if (heat < 0.75) {
        // Yellow to white
        float f = (heat - 0.5) / 0.25;
        color = vec3(1.0, 0.8 + f * 0.2, 0.1 + f * 0.6);
    } else {
        // White to blue-white (plasma)
        float f = (heat - 0.75) / 0.25;
        color = vec3(1.0 - f * 0.2, 1.0, 0.7 + f * 0.3);
    }

    return color;
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// VERTEX SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════

const VERTEX_SHADER = /* glsl */`
uniform float uTime;
uniform float uFlameHeight;
uniform float uTurbulence;
uniform float uDisplacementStrength;
uniform float uFadeProgress;  // Smooth 0-1 fade (no flicker) for stable geometry

varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vViewDir;
varying float vDisplacement;
varying float vVerticalGradient;

${NOISE_GLSL}

void main() {
    vPosition = position;
    vNormal = normalMatrix * normal;

    // Calculate vertical gradient (0 at bottom, 1 at top)
    // Assumes model is roughly centered, adjust based on geometry
    float modelHeight = 1.0; // Will be normalized
    vVerticalGradient = (position.y + 0.5) / modelHeight;
    vVerticalGradient = clamp(vVerticalGradient, 0.0, 1.0);

    // ═══════════════════════════════════════════════════════════════════════════════
    // VERTEX DISPLACEMENT - Expand geometry to create flame volume
    // ═══════════════════════════════════════════════════════════════════════════════

    // Use smooth fade progress for displacement (NOT flickering intensity)
    // This keeps geometry stable while brightness can flicker
    float fadeFactor = uFadeProgress;

    // Noise-based displacement along normal (very slow for realistic fire)
    vec3 noisePos = position * 3.0 + vec3(0.0, -uTime * 0.001, 0.0);
    float noiseValue = fbm3(noisePos);

    // Position-based variation for asymmetric flames
    float posVariation = snoise(position * 5.0) * 0.3 + 0.85;

    // Displacement increases toward the top (flames rise and spread)
    float heightFactor = pow(vVerticalGradient, 0.5);
    float displacement = noiseValue * uDisplacementStrength * (0.3 + heightFactor * 0.7) * posVariation * fadeFactor;

    // Add upward stretch for rising flames (scaled by fade)
    vec3 displaced = position + normal * displacement;
    displaced.y += heightFactor * uFlameHeight * (0.5 + noiseValue * 0.5) * fadeFactor;

    // Add lateral turbulence with position variation (scaled by fade)
    float turbX = snoise(noisePos + vec3(100.0, 0.0, 0.0)) * uTurbulence * heightFactor * posVariation * fadeFactor;
    float turbZ = snoise(noisePos + vec3(0.0, 0.0, 100.0)) * uTurbulence * heightFactor * posVariation * fadeFactor;
    displaced.x += turbX * 0.3;
    displaced.z += turbZ * 0.3;

    vDisplacement = displacement;

    // World position for lighting/view calculations
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
uniform float uTemperature;
uniform float uIntensity;
uniform float uOpacity;
uniform float uFlickerSpeed;
uniform float uFlickerAmount;
uniform float uNoiseScale;
uniform float uEdgeFade;

varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vViewDir;
varying float vDisplacement;
varying float vVerticalGradient;

${NOISE_GLSL}
${FIRE_COLOR_GLSL}

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewDir);

    // ═══════════════════════════════════════════════════════════════════════════════
    // FLAME PATTERN GENERATION
    // ═══════════════════════════════════════════════════════════════════════════════

    // Animated noise position - flames rise upward (very slow for realism)
    vec3 noisePos = vPosition * uNoiseScale + vec3(0.0, -uTime * 0.00085, 0.0);

    // Primary flame pattern using turbulence (3 octaves for GPU performance)
    float flame = turbulence(noisePos, 3);

    // Secondary detail layer (very slow)
    vec3 detailPos = noisePos * 2.0 + vec3(uTime * 0.00015, 0.0, uTime * 0.0001);
    float detail = snoise(detailPos) * 0.5 + 0.5;

    // Position-based variation for non-uniform flames
    float posVariation = snoise(vPosition * 7.0) * 0.15 + 0.92;

    // Combine layers with position variation
    flame = (flame * 0.7 + detail * 0.3) * posVariation;

    // ═══════════════════════════════════════════════════════════════════════════════
    // VERTICAL FLAME FALLOFF
    // ═══════════════════════════════════════════════════════════════════════════════

    // Flames are strongest at bottom, fade toward top
    float verticalFade = 1.0 - pow(vVerticalGradient, 1.5);

    // But tips can have wispy bright spots
    float tipBrightness = smoothstep(0.7, 0.9, vVerticalGradient) * flame * 0.5;

    // ═══════════════════════════════════════════════════════════════════════════════
    // FLICKER ANIMATION
    // ═══════════════════════════════════════════════════════════════════════════════

    // Position-based flicker offset for per-flame variation
    float flickerOffset = snoise(vPosition * 3.0) * 2.0;

    float flicker = 1.0 - uFlickerAmount + uFlickerAmount *
        (snoise(vec3(uTime * uFlickerSpeed + flickerOffset, vPosition.y * 5.0, vPosition.x * 3.0)) * 0.5 + 0.5);

    // Gentle micro-flicker (very slow)
    float microFlicker = 0.95 + 0.05 * snoise(vec3(uTime * 0.004, vPosition.yz * 6.0));
    flicker *= microFlicker;

    // ═══════════════════════════════════════════════════════════════════════════════
    // FRESNEL EDGE GLOW
    // ═══════════════════════════════════════════════════════════════════════════════

    float fresnel = 1.0 - abs(dot(normal, viewDir));
    fresnel = pow(fresnel, 2.0);

    // Edge flames - bright rim effect
    float edgeGlow = fresnel * (0.5 + flame * 0.5);

    // ═══════════════════════════════════════════════════════════════════════════════
    // COLOR CALCULATION
    // ═══════════════════════════════════════════════════════════════════════════════

    // Local intensity combines all factors
    float localIntensity = flame * verticalFade * flicker + tipBrightness + edgeGlow * 0.3;
    localIntensity = clamp(localIntensity, 0.0, 1.0);

    // Get fire color based on intensity and global temperature
    vec3 color = fireColor(localIntensity, uTemperature);

    // Apply intensity multiplier for bloom
    color *= uIntensity * (0.7 + localIntensity * 0.3);

    // ═══════════════════════════════════════════════════════════════════════════════
    // ALPHA CALCULATION
    // ═══════════════════════════════════════════════════════════════════════════════

    // Base alpha from flame intensity with minimum threshold to hide anchor mesh
    float alpha = localIntensity * uOpacity;

    // Soft edge fade based on distance from surface
    float surfaceFade = smoothstep(0.0, uEdgeFade, vDisplacement);
    alpha *= mix(1.0, surfaceFade, 0.5);

    // Vertical fade - tips become more transparent
    alpha *= mix(1.0, 1.0 - vVerticalGradient * 0.5, 0.3);

    // Fresnel adds brightness at edges
    alpha += fresnel * 0.2 * flame;

    // Final alpha clamp
    alpha = clamp(alpha, 0.0, 1.0);

    // Discard faint pixels to hide anchor mesh geometry
    if (alpha < 0.12) discard;

    // Ensure minimum brightness for visible pixels (prevents dark anchor showing)
    color = max(color, vec3(0.6, 0.25, 0.0) * uIntensity * 0.7);

    gl_FragColor = vec4(color, alpha);
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// MATERIAL FACTORY
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Interpolate between three values based on parameter
 */
function lerp3(low, mid, high, t) {
    if (t < 0.5) {
        return low + (mid - low) * (t * 2);
    }
    return mid + (high - mid) * ((t - 0.5) * 2);
}

/**
 * Create a procedural fire material
 *
 * @param {Object} options - Configuration options
 * @param {number} [options.temperature=0.5] - Fire temperature (0=embers, 0.5=fire, 1=plasma)
 * @param {number} [options.intensity=2.5] - Brightness multiplier (for bloom)
 * @param {number} [options.opacity=0.85] - Base opacity
 * @param {number} [options.flameHeight=0.08] - How much flames extend upward
 * @param {number} [options.turbulence=0.03] - Lateral flame wobble
 * @param {number} [options.displacementStrength=0.04] - Vertex displacement amount
 * @param {number} [options.noiseScale=4.0] - Noise detail level
 * @param {number} [options.flickerSpeed=3.0] - Flicker animation speed
 * @param {number} [options.flickerAmount=0.2] - Flicker intensity variance
 * @param {number} [options.edgeFade=0.1] - Soft edge fade distance
 * @returns {THREE.ShaderMaterial}
 */
export function createProceduralFireMaterial(options = {}) {
    const {
        temperature = 0.5,
        intensity = null,
        opacity = 0.85,
        flameHeight = 0.08,
        turbulence = 0.03,
        displacementStrength = 0.04,
        noiseScale = 4.0,
        flickerSpeed = null,
        flickerAmount = null,
        edgeFade = 0.25  // Increased for softer flame edges
    } = options;

    // Derive values from temperature if not explicitly set
    const finalIntensity = intensity ?? lerp3(1.5, 2.5, 4.0, temperature);
    const finalFlickerSpeed = flickerSpeed ?? lerp3(0.001, 0.002, 0.003, temperature);  // Near-static flicker
    const finalFlickerAmount = flickerAmount ?? lerp3(0.15, 0.12, 0.08, temperature);  // Subtler flicker

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uTemperature: { value: temperature },
            uIntensity: { value: finalIntensity },
            uFadeProgress: { value: 1.0 },  // Smooth fade for vertex displacement (no flicker)
            uOpacity: { value: opacity },
            uFlameHeight: { value: flameHeight },
            uTurbulence: { value: turbulence },
            uDisplacementStrength: { value: displacementStrength },
            uNoiseScale: { value: noiseScale },
            uFlickerSpeed: { value: finalFlickerSpeed },
            uFlickerAmount: { value: finalFlickerAmount },
            uEdgeFade: { value: edgeFade }
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
    });

    // Store config for external access
    material.userData.temperature = temperature;
    material.userData.elementalType = 'fire';
    material.userData.isProcedural = true;

    return material;
}

/**
 * Update procedural fire material animation
 * Call this each frame for animated fire
 *
 * @param {THREE.ShaderMaterial} material - Procedural fire material
 * @param {number} deltaTime - Time since last frame in seconds
 */
export function updateProceduralFireMaterial(material, deltaTime) {
    if (material?.uniforms?.uTime) {
        material.uniforms.uTime.value += deltaTime;
    }
}

/**
 * Set temperature on existing material
 *
 * @param {THREE.ShaderMaterial} material - Procedural fire material
 * @param {number} temperature - New temperature (0-1)
 */
export function setProceduralFireTemperature(material, temperature) {
    if (!material?.uniforms) return;

    material.uniforms.uTemperature.value = temperature;
    material.uniforms.uIntensity.value = lerp3(1.5, 2.5, 4.0, temperature);
    material.uniforms.uFlickerSpeed.value = lerp3(0.001, 0.002, 0.003, temperature);  // Near-static flicker
    material.uniforms.uFlickerAmount.value = lerp3(0.15, 0.12, 0.08, temperature);  // Subtler flicker
    material.userData.temperature = temperature;
}

/**
 * Set intensity multiplier (for gesture animation integration)
 *
 * @param {THREE.ShaderMaterial} material - Procedural fire material
 * @param {number} intensity - Intensity multiplier (0-1, includes flicker, for brightness)
 * @param {number} [fadeProgress=null] - Smooth fade 0-1 (no flicker, for stable geometry)
 */
export function setProceduralFireIntensity(material, intensity, fadeProgress = null) {
    if (!material?.uniforms) return;

    // Clamp intensity to small minimum to prevent rendering artifacts at zero
    const clampedIntensity = Math.max(0.01, intensity);

    const temp = material.userData.temperature || 0.5;
    const baseIntensity = lerp3(1.5, 2.5, 4.0, temp);
    material.uniforms.uIntensity.value = baseIntensity * clampedIntensity;

    // Set smooth fade progress for vertex displacement (no flicker jitter)
    if (fadeProgress !== null && material.uniforms.uFadeProgress) {
        material.uniforms.uFadeProgress.value = Math.max(0.01, fadeProgress);
    }
}

/**
 * Get physics configuration for procedural fire
 *
 * @param {number} temperature - Temperature parameter 0-1
 * @returns {Object} Physics configuration
 */
export function getProceduralFirePhysics(temperature = 0.5) {
    return {
        gravity: lerp3(-0.05, -0.15, -0.3, temperature),
        drag: lerp3(0.08, 0.05, 0.02, temperature),
        bounce: 0.0,
        lifetime: lerp3(2.0, 1.5, 0.8, temperature),
        fadeOut: true,
        riseSpeed: lerp3(0.5, 1.0, 2.0, temperature),
        flicker: true
    };
}

export default {
    createProceduralFireMaterial,
    updateProceduralFireMaterial,
    setProceduralFireTemperature,
    setProceduralFireIntensity,
    getProceduralFirePhysics
};
