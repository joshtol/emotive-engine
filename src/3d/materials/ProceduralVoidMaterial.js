/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Procedural Void Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Advanced procedural void shader that creates dynamic, light-absorbing
 * effects. Features swirling darkness, tendrils, and rift orientation support for
 * portals/tears in space.
 *
 * @author Emotive Engine Team
 * @module materials/ProceduralVoidMaterial
 *
 * ## Key Features
 * - Light absorption (subtractive blending)
 * - Swirling inner patterns with FBM noise
 * - Extending tendrils via vertex displacement
 * - Rift orientation mode for flat portal effects
 * - Depth-based behavior (wispy to black hole)
 *
 * ## Master Parameter: depth (0-1)
 *
 * | Depth | Visual                     | Effect           |
 * |-------|----------------------------|------------------|
 * | 0.0   | Wispy shadows              | Subtle darkness  |
 * | 0.3   | Dark mist                  | Spreading shadow |
 * | 0.5   | Dense void mass            | Light absorption |
 * | 0.7   | Deep void with tendrils    | Strong pull      |
 * | 1.0   | Black hole, pure darkness  | Total absorption |
 *
 * ## Usage
 *
 * ```javascript
 * const voidMaterial = createProceduralVoidMaterial({
 *     depth: 0.6,
 *     isRift: true  // For portal/tear effects
 * });
 * mesh.material = voidMaterial;
 *
 * // In render loop:
 * updateProceduralVoidMaterial(voidMaterial, deltaTime);
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

// Fractal Brownian Motion - 5 octaves for void details
float fbm5(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for (int i = 0; i < 5; i++) {
        value += amplitude * snoise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

// Swirl distortion for void vortex
vec2 swirl(vec2 uv, float amount, float time) {
    vec2 centered = uv - 0.5;
    float dist = length(centered);
    float angle = atan(centered.y, centered.x);
    angle += amount * (1.0 - dist) * 2.0 - time * 0.3;
    return vec2(cos(angle), sin(angle)) * dist + 0.5;
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// VERTEX SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════

const VERTEX_SHADER = /* glsl */`
uniform float uTime;
uniform float uDepth;
uniform float uTendrilStrength;
uniform float uDisplacementStrength;
uniform float uFadeProgress;
uniform int uIsRift;

varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec2 vUv;
varying float vDisplacement;
varying float vRadialGradient;

${NOISE_GLSL}

void main() {
    vPosition = position;
    vNormal = normalMatrix * normal;
    vUv = uv;

    // Calculate radial gradient from center
    vec2 centered = uv - 0.5;
    vRadialGradient = length(centered) * 2.0;

    // ═══════════════════════════════════════════════════════════════════════════════
    // VERTEX DISPLACEMENT - Void expands and tendrils reach outward
    // ═══════════════════════════════════════════════════════════════════════════════

    float fadeFactor = uFadeProgress;

    // Noise-based displacement (very slow, ominous movement)
    vec3 noisePos = position * 2.0 + vec3(uTime * 0.0005, uTime * 0.0003, 0.0);
    float noiseValue = fbm5(noisePos);

    // Tendril-like displacement (reaches outward from center)
    float tendrilNoise = snoise(position * 3.0 + vec3(0.0, uTime * 0.001, 0.0));
    float tendrilMask = smoothstep(0.3, 0.8, vRadialGradient);
    float tendrils = tendrilNoise * tendrilMask * uTendrilStrength;

    // Combined displacement
    float displacement = (noiseValue * uDisplacementStrength + tendrils) * fadeFactor;

    // Void contracts inward for rift mode (creates portal depth effect)
    vec3 displaced = position;
    if (uIsRift == 1) {
        // Rifts pull inward at center, creating depth illusion
        float inwardPull = (1.0 - vRadialGradient) * uDepth * 0.2 * fadeFactor;
        displaced -= normal * inwardPull;
        // Add edge distortion
        displaced += normal * displacement * 0.5;
    } else {
        // Regular void expands outward
        displaced += normal * displacement;
    }

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
uniform float uDepth;
uniform float uIntensity;
uniform float uOpacity;
uniform float uSwirlSpeed;
uniform float uSwirlAmount;
uniform float uPulseSpeed;
uniform float uEdgeGlow;
uniform int uIsRift;

varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec2 vUv;
varying float vDisplacement;
varying float vRadialGradient;

${NOISE_GLSL}

// Void color palette - deep purples and blacks
vec3 voidColor(float intensity, float depth) {
    // Core is pure black
    vec3 core = vec3(0.0);

    // Deep purple for mid-depth
    vec3 purple = vec3(0.15, 0.0, 0.25);

    // Faint blue-purple at edges
    vec3 edge = vec3(0.1, 0.05, 0.2);

    // Mix based on intensity and depth
    vec3 color = mix(core, purple, intensity * 0.5);
    color = mix(color, edge, (1.0 - depth) * 0.3);

    return color;
}

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewDir);

    // ═══════════════════════════════════════════════════════════════════════════════
    // SWIRL PATTERN - Vortex effect in the void
    // ═══════════════════════════════════════════════════════════════════════════════

    vec2 swirlUv = swirl(vUv, uSwirlAmount * uDepth, uTime * uSwirlSpeed);

    // Multi-octave noise for void pattern
    vec3 noisePos = vec3(swirlUv * 3.0, uTime * 0.0005);
    float voidPattern = fbm5(noisePos);
    voidPattern = voidPattern * 0.5 + 0.5; // Normalize to 0-1

    // Spiral arms
    vec2 centered = vUv - 0.5;
    float angle = atan(centered.y, centered.x);
    float dist = length(centered);
    float spirals = sin(angle * 4.0 + dist * 8.0 - uTime * uSwirlSpeed) * 0.5 + 0.5;
    spirals = pow(spirals, 3.0) * smoothstep(0.0, 0.3, dist);

    // ═══════════════════════════════════════════════════════════════════════════════
    // RIFT MODE - Portal/tear specific effects
    // ═══════════════════════════════════════════════════════════════════════════════

    float riftEdge = 0.0;
    float riftDepthEffect = 0.0;

    if (uIsRift == 1) {
        // Rift has bright crackling edges
        float edgeDist = 1.0 - vRadialGradient;
        float edgeNoise = snoise(vec3(vUv * 10.0, uTime * 0.002)) * 0.5 + 0.5;
        riftEdge = smoothstep(0.1, 0.0, edgeDist) * edgeNoise;

        // Depth creates layered look (like looking into abyss)
        riftDepthEffect = pow(1.0 - vRadialGradient, 2.0) * uDepth;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // PULSE / BREATHE EFFECT
    // ═══════════════════════════════════════════════════════════════════════════════

    float pulse = sin(uTime * uPulseSpeed) * 0.1 + 1.0;

    // Position-based variation
    float posVar = snoise(vPosition * 4.0) * 0.15 + 0.92;

    // ═══════════════════════════════════════════════════════════════════════════════
    // FRESNEL - Edge effects
    // ═══════════════════════════════════════════════════════════════════════════════

    float fresnel = 1.0 - abs(dot(normal, viewDir));
    fresnel = pow(fresnel, 2.5);

    // Edge glow - faint purple at edges
    float edgeGlow = fresnel * uEdgeGlow;

    // ═══════════════════════════════════════════════════════════════════════════════
    // DARKNESS CALCULATION
    // ═══════════════════════════════════════════════════════════════════════════════

    // Core darkness (center is darkest)
    float coreDarkness = 1.0 - vRadialGradient * 0.3;
    coreDarkness = pow(coreDarkness, 1.0 + uDepth);

    // Combine patterns
    float darkness = coreDarkness * (0.7 + voidPattern * 0.3 + spirals * 0.2);
    darkness *= pulse * posVar;

    // Rift enhancement
    if (uIsRift == 1) {
        darkness = mix(darkness, 1.0, riftDepthEffect * 0.5);
    }

    darkness = clamp(darkness, 0.0, 1.0);

    // ═══════════════════════════════════════════════════════════════════════════════
    // COLOR CALCULATION
    // ═══════════════════════════════════════════════════════════════════════════════

    vec3 color = voidColor(1.0 - darkness, uDepth);

    // Add spiral arm visibility
    color += vec3(0.2, 0.0, 0.35) * spirals * (1.0 - uDepth) * 0.5;

    // Add edge glow
    color += vec3(0.3, 0.1, 0.5) * edgeGlow;

    // Rift edge crackling (bright energy)
    if (uIsRift == 1) {
        color += vec3(0.5, 0.2, 0.8) * riftEdge * 2.0;
    }

    // Apply intensity
    color *= uIntensity;

    // ═══════════════════════════════════════════════════════════════════════════════
    // ALPHA CALCULATION - Light absorption strength
    // ═══════════════════════════════════════════════════════════════════════════════

    float alpha = darkness * uOpacity;

    // Edge fade for soft integration
    float edgeFade = 1.0 - smoothstep(0.8, 1.0, vRadialGradient);
    alpha *= edgeFade;

    // Depth increases opacity (deeper void is more opaque)
    alpha = mix(alpha, min(1.0, alpha + 0.3), uDepth);

    // Add rift edge
    if (uIsRift == 1) {
        alpha = max(alpha, riftEdge * 0.8);
    }

    alpha = clamp(alpha, 0.0, 1.0);

    if (alpha < 0.01) discard;

    gl_FragColor = vec4(color, alpha);
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// MATERIAL FACTORY
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Interpolate between values
 */
function lerp(a, b, t) {
    return a + (b - a) * t;
}

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
 * Create a procedural void material
 *
 * @param {Object} options - Configuration options
 * @param {number} [options.depth=0.5] - Void depth (0=wispy, 0.5=mass, 1=black hole)
 * @param {boolean} [options.isRift=false] - Enable rift/portal mode
 * @param {number} [options.intensity=1.0] - Brightness multiplier
 * @param {number} [options.opacity=0.9] - Base opacity
 * @param {number} [options.swirlSpeed=0.0003] - Swirl animation speed
 * @param {number} [options.swirlAmount=2.0] - Swirl distortion strength
 * @param {number} [options.tendrilStrength=0.15] - Tendril displacement
 * @param {number} [options.displacementStrength=0.05] - Base displacement
 * @param {number} [options.pulseSpeed=0.5] - Pulse animation speed
 * @param {number} [options.edgeGlow=0.4] - Edge glow intensity
 * @returns {THREE.ShaderMaterial}
 */
export function createProceduralVoidMaterial(options = {}) {
    const {
        depth = 0.5,
        isRift = false,
        intensity = 1.0,
        opacity = 0.9,
        swirlSpeed = 0.0003,
        swirlAmount = 2.0,
        tendrilStrength = null,
        displacementStrength = null,
        pulseSpeed = null,
        edgeGlow = null
    } = options;

    // Derive values from depth if not explicitly set
    const finalTendrilStrength = tendrilStrength ?? lerp3(0.05, 0.15, 0.25, depth);
    const finalDisplacementStrength = displacementStrength ?? lerp3(0.02, 0.05, 0.08, depth);
    const finalPulseSpeed = pulseSpeed ?? lerp3(0.3, 0.5, 0.8, depth);
    const finalEdgeGlow = edgeGlow ?? lerp3(0.6, 0.4, 0.2, depth); // Less glow at high depth

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uDepth: { value: depth },
            uIsRift: { value: isRift ? 1 : 0 },
            uIntensity: { value: intensity },
            uFadeProgress: { value: 1.0 },
            uOpacity: { value: opacity },
            uSwirlSpeed: { value: swirlSpeed },
            uSwirlAmount: { value: swirlAmount },
            uTendrilStrength: { value: finalTendrilStrength },
            uDisplacementStrength: { value: finalDisplacementStrength },
            uPulseSpeed: { value: finalPulseSpeed },
            uEdgeGlow: { value: finalEdgeGlow }
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        // Custom blending for light absorption
        blending: THREE.CustomBlending,
        blendEquation: THREE.AddEquation,
        blendSrc: THREE.SrcAlphaFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
        blendSrcAlpha: THREE.OneFactor,
        blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
        depthWrite: false,
        side: THREE.DoubleSide
    });

    // Store config for external access
    material.userData.depth = depth;
    material.userData.isRift = isRift;
    material.userData.elementalType = 'void';
    material.userData.isProcedural = true;

    return material;
}

/**
 * Update procedural void material animation
 *
 * @param {THREE.ShaderMaterial} material - Procedural void material
 * @param {number} deltaTime - Time since last frame in seconds
 */
export function updateProceduralVoidMaterial(material, deltaTime) {
    if (material?.uniforms?.uTime) {
        material.uniforms.uTime.value += deltaTime;
    }
}

/**
 * Set depth on existing material
 *
 * @param {THREE.ShaderMaterial} material - Procedural void material
 * @param {number} depth - New depth (0-1)
 */
export function setProceduralVoidDepth(material, depth) {
    if (!material?.uniforms) return;

    material.uniforms.uDepth.value = depth;
    material.uniforms.uTendrilStrength.value = lerp3(0.05, 0.15, 0.25, depth);
    material.uniforms.uDisplacementStrength.value = lerp3(0.02, 0.05, 0.08, depth);
    material.uniforms.uPulseSpeed.value = lerp3(0.3, 0.5, 0.8, depth);
    material.uniforms.uEdgeGlow.value = lerp3(0.6, 0.4, 0.2, depth);
    material.userData.depth = depth;
}

/**
 * Set intensity multiplier (for gesture animation integration)
 *
 * @param {THREE.ShaderMaterial} material - Procedural void material
 * @param {number} intensity - Intensity multiplier (0-1)
 * @param {number} [fadeProgress=null] - Smooth fade 0-1 for stable geometry
 */
export function setProceduralVoidIntensity(material, intensity, fadeProgress = null) {
    if (!material?.uniforms) return;

    material.uniforms.uIntensity.value = Math.max(0.01, intensity);

    if (fadeProgress !== null && material.uniforms.uFadeProgress) {
        material.uniforms.uFadeProgress.value = Math.max(0.01, fadeProgress);
    }
}

/**
 * Enable or disable rift mode
 *
 * @param {THREE.ShaderMaterial} material - Procedural void material
 * @param {boolean} isRift - Enable rift mode
 */
export function setProceduralVoidRiftMode(material, isRift) {
    if (!material?.uniforms) return;

    material.uniforms.uIsRift.value = isRift ? 1 : 0;
    material.userData.isRift = isRift;
}

/**
 * Get physics configuration for procedural void
 *
 * @param {number} depth - Depth parameter 0-1
 * @returns {Object} Physics configuration
 */
export function getProceduralVoidPhysics(depth = 0.5) {
    return {
        gravity: lerp(0.0, 0.3, depth),
        drag: lerp(0.2, 0.0, depth),
        bounce: 0.0,
        gravityWell: depth > 0.7,
        gravityWellStrength: depth > 0.7 ? lerp(0, 2.0, (depth - 0.7) / 0.3) : 0,
        disperseOverTime: depth < 0.3,
        lifetime: lerp(2.0, 999.0, depth),
        absorbLight: true,
        corruptNearby: depth > 0.6
    };
}

export default {
    createProceduralVoidMaterial,
    updateProceduralVoidMaterial,
    setProceduralVoidDepth,
    setProceduralVoidIntensity,
    setProceduralVoidRiftMode,
    getProceduralVoidPhysics
};
