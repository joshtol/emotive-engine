/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Procedural Poison Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Advanced procedural poison shader that transforms water anchor meshes into
 * viscous, toxic fluid forms. Uses water models but applies sickly green/purple colors,
 * slower movement (viscosity), and bubbling effects.
 *
 * @author Emotive Engine Team
 * @module materials/ProceduralPoisonMaterial
 *
 * ## Key Features
 * - Viscous, slow-moving fluid (slower than water)
 * - Sickly green/purple color oscillation
 * - Bubble noise patterns for toxic appearance
 * - Subtle inner glow (toxicity)
 * - Time-based animation with reduced speed
 *
 * ## Master Parameter: toxicity (0-1)
 *
 * | Toxicity | Visual                     | Poison Style       |
 * |----------|----------------------------|--------------------|
 * | 0.0      | Mild, green tint           | Weak venom         |
 * | 0.3      | Visible green, some bubble | Diluted poison     |
 * | 0.5      | Green/purple shift         | Standard toxin     |
 * | 0.7      | Strong color shift, glow   | Concentrated       |
 * | 1.0      | Intense, bubbling          | Deadly venom       |
 *
 * ## Usage
 *
 * ```javascript
 * const poisonMaterial = createProceduralPoisonMaterial({
 *     toxicity: 0.6
 * });
 * mesh.material = poisonMaterial;
 *
 * // In render loop:
 * updateProceduralPoisonMaterial(poisonMaterial, deltaTime);
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

// Fractal Brownian Motion - 4 octaves for viscous motion
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
// POISON COLOR UTILITIES (GLSL)
// ═══════════════════════════════════════════════════════════════════════════════════════

const POISON_COLOR_GLSL = /* glsl */`
// Poison color based on local intensity, toxicity, and time
vec3 poisonColor(float intensity, float toxicity, float time) {
    // Base poison colors - sickly greens and purples
    vec3 darkGreen = vec3(0.05, 0.15, 0.05);       // Deep murky green
    vec3 sicklyGreen = vec3(0.2, 0.5, 0.15);       // Neon-ish green
    vec3 acidGreen = vec3(0.4, 0.7, 0.1);          // Bright acid
    vec3 purpleToxic = vec3(0.4, 0.1, 0.5);        // Purple undertone
    vec3 glowGreen = vec3(0.3, 0.9, 0.2);          // Glow highlights

    // Color oscillation between green and purple based on time
    float colorShift = sin(time * 0.0005) * 0.5 + 0.5;  // Very slow oscillation
    colorShift *= toxicity;  // More toxicity = more color shift

    // Mix based on intensity
    vec3 baseColor;
    if (intensity < 0.33) {
        baseColor = mix(darkGreen, sicklyGreen, intensity * 3.0);
    } else if (intensity < 0.66) {
        baseColor = mix(sicklyGreen, acidGreen, (intensity - 0.33) * 3.0);
    } else {
        baseColor = mix(acidGreen, glowGreen, (intensity - 0.66) * 3.0);
    }

    // Blend with purple based on oscillation
    vec3 color = mix(baseColor, purpleToxic, colorShift * 0.4);

    // Add subtle glow at high toxicity
    float glowPulse = sin(time * 0.001) * 0.5 + 0.5;
    color += glowGreen * glowPulse * toxicity * 0.15;

    return color;
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// VERTEX SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════

const VERTEX_SHADER = /* glsl */`
uniform float uTime;
uniform float uToxicity;
uniform float uDisplacementStrength;
uniform float uViscosity;
uniform float uFadeProgress;

varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vViewDir;
varying float vDisplacement;
varying float vNoiseValue;
varying float vBubble;

${NOISE_GLSL}

void main() {
    vPosition = position;
    vNormal = normalMatrix * normal;

    // ═══════════════════════════════════════════════════════════════════════════════
    // VERTEX DISPLACEMENT - Slow, viscous wobble for thick poison
    // ═══════════════════════════════════════════════════════════════════════════════

    float fadeFactor = uFadeProgress;

    // Animated noise for viscous wobble - MUCH slower than water
    // Viscosity reduces speed (higher viscosity = slower movement)
    float speedFactor = 1.0 - uViscosity * 0.8;  // 0.2 to 1.0

    vec3 noisePos = position * 2.0 + vec3(
        uTime * 0.0008 * speedFactor,   // Very slow horizontal
        uTime * 0.0005 * speedFactor,   // Even slower vertical
        uTime * 0.0006 * speedFactor
    );
    float noiseValue = fbm4(noisePos);
    vNoiseValue = noiseValue * 0.5 + 0.5;

    // Position-based variation
    float posVariation = snoise(position * 2.5) * 0.3 + 0.85;

    // Primary displacement - less aggressive than water (viscous)
    float baseDisplacement = noiseValue * uDisplacementStrength * (0.3 + uToxicity * 0.4) * posVariation * fadeFactor;

    vec3 displaced = position + normal * baseDisplacement;

    // Bubble-like perturbations - small, localized bumps
    vec3 bubblePos = position * 5.0 + vec3(uTime * 0.001, uTime * 0.0008, 0.0);
    float bubble = pow(max(0.0, snoise(bubblePos)), 2.0) * uToxicity;
    vBubble = bubble;
    displaced += normal * bubble * uDisplacementStrength * 0.5 * fadeFactor;

    // Slow undulation - thick, sluggish movement
    float slowWave = sin(uTime * 0.001 + position.x * 1.5 + position.z * 1.5) * uDisplacementStrength * 0.2 * fadeFactor;
    displaced += normal * slowWave;

    float displacement = baseDisplacement + bubble * uDisplacementStrength * 0.5 + slowWave;
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
uniform float uToxicity;
uniform float uIntensity;
uniform float uOpacity;
uniform float uNoiseScale;
uniform float uEdgeFade;
uniform float uGlowIntensity;
uniform vec3 uTint;

varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vViewDir;
varying float vDisplacement;
varying float vNoiseValue;
varying float vBubble;

${NOISE_GLSL}
${POISON_COLOR_GLSL}

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewDir);

    // ═══════════════════════════════════════════════════════════════════════════════
    // POISON PATTERN GENERATION
    // ═══════════════════════════════════════════════════════════════════════════════

    // Animated noise for surface patterns - very slow for viscous feel
    vec3 noisePos = vPosition * uNoiseScale + vec3(
        uTime * 0.0004,
        uTime * 0.0003,
        uTime * 0.00035
    );

    // Primary flow pattern - slower, thicker
    float flow = fbm4(noisePos);

    // Bubble pattern detail
    vec3 bubbleNoisePos = noisePos * 3.0 + vec3(uTime * 0.0006, 0.0, uTime * 0.0005);
    float bubblePattern = pow(max(0.0, snoise(bubbleNoisePos)), 1.5) * uToxicity;

    // Position-based variation
    float posVariation = snoise(vPosition * 3.0) * 0.12 + 0.94;

    // Combine patterns
    float pattern = (flow * 0.6 + bubblePattern * 0.4) * posVariation;
    pattern = pattern * 0.5 + 0.5;
    pattern = pow(pattern, 0.9);

    // ═══════════════════════════════════════════════════════════════════════════════
    // FRESNEL EDGE EFFECT
    // ═══════════════════════════════════════════════════════════════════════════════

    float fresnel = 1.0 - abs(dot(normal, viewDir));
    fresnel = pow(fresnel, 2.0);

    // ═══════════════════════════════════════════════════════════════════════════════
    // COLOR CALCULATION
    // ═══════════════════════════════════════════════════════════════════════════════

    // Local intensity from noise and pattern
    float localIntensity = (vNoiseValue * 0.4 + pattern * 0.6);
    localIntensity = clamp(localIntensity, 0.0, 1.0);

    // Add bubble highlights
    localIntensity += vBubble * 0.3;
    localIntensity = clamp(localIntensity, 0.0, 1.0);

    // Get poison color with time-based oscillation
    vec3 color = poisonColor(localIntensity, uToxicity, uTime);

    // Apply tint
    color *= uTint;

    // Fresnel rim glow - greenish
    vec3 rimColor = vec3(0.2, 0.8, 0.1) * fresnel * 0.4 * uToxicity;
    color += rimColor;

    // Apply intensity multiplier
    color *= uIntensity * (0.75 + localIntensity * 0.25);

    // ═══════════════════════════════════════════════════════════════════════════════
    // INNER GLOW (toxicity effect)
    // ═══════════════════════════════════════════════════════════════════════════════

    float glowPulse = sin(uTime * 0.0008) * 0.5 + 0.5;
    vec3 glowColor = vec3(0.3, 0.9, 0.15) * uGlowIntensity * glowPulse * uToxicity;
    color += glowColor * (1.0 - fresnel) * 0.3;  // Inner glow, not rim

    // ═══════════════════════════════════════════════════════════════════════════════
    // ALPHA CALCULATION
    // ═══════════════════════════════════════════════════════════════════════════════

    // Base alpha - higher than water (more opaque, viscous)
    float alpha = (0.4 + localIntensity * 0.5) * uOpacity;

    // Edge fade
    float surfaceFade = smoothstep(0.0, uEdgeFade, abs(vDisplacement) + 0.05);
    alpha *= mix(0.9, 1.0, surfaceFade);

    // Fresnel subtle rim
    alpha += fresnel * 0.08;

    // Final alpha
    alpha = clamp(alpha, 0.0, 1.0);

    // Discard faint pixels
    if (alpha < 0.08) discard;

    // Minimum brightness - murky green floor
    color = max(color, vec3(0.08, 0.15, 0.05) * uIntensity * 0.5);

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
 * Create a procedural poison material
 *
 * @param {Object} options - Material configuration
 * @param {number} [options.toxicity=0.5] - Master parameter (0-1)
 * @param {number} [options.intensity] - Brightness multiplier
 * @param {number} [options.viscosity] - Movement slowdown (0-1)
 * @param {number} [options.glowIntensity] - Inner glow strength
 * @param {number} [options.tint=0xffffff] - Color tint
 * @returns {THREE.ShaderMaterial}
 */
export function createProceduralPoisonMaterial(options = {}) {
    const {
        toxicity = 0.5,
        intensity = null,
        displacementStrength = null,
        viscosity = null,
        noiseScale = 2.5,
        edgeFade = 0.12,
        glowIntensity = null,
        tint = 0xffffff
    } = options;

    // Derive values from toxicity if not explicitly set
    const finalIntensity = intensity ?? lerp3(0.7, 0.9, 1.1, toxicity);
    const finalDisplacement = displacementStrength ?? lerp3(0.04, 0.08, 0.12, toxicity);
    const finalViscosity = viscosity ?? lerp3(0.8, 0.6, 0.4, toxicity);  // Higher toxicity = less viscous (more active)
    const finalGlow = glowIntensity ?? lerp3(0.1, 0.3, 0.5, toxicity);

    // Convert tint to THREE.Color
    const tintColor = tint instanceof THREE.Color ? tint : new THREE.Color(tint);

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uToxicity: { value: toxicity },
            uIntensity: { value: finalIntensity },
            uOpacity: { value: 0.85 },
            uDisplacementStrength: { value: finalDisplacement },
            uViscosity: { value: finalViscosity },
            uNoiseScale: { value: noiseScale },
            uEdgeFade: { value: edgeFade },
            uGlowIntensity: { value: finalGlow },
            uTint: { value: tintColor },
            uFadeProgress: { value: 1.0 }
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        depthWrite: true,
        side: THREE.DoubleSide,
        blending: THREE.NormalBlending
    });

    // Store toxicity for reference
    material.userData.toxicity = toxicity;
    material.userData.isProceduralPoison = true;

    return material;
}

/**
 * Update procedural poison material time
 *
 * @param {THREE.ShaderMaterial} material - Procedural poison material
 * @param {number} deltaTime - Time since last frame (seconds)
 */
export function updateProceduralPoisonMaterial(material, deltaTime) {
    if (!material?.uniforms?.uTime) return;
    material.uniforms.uTime.value += deltaTime * 1000;  // Convert to ms
}

/**
 * Set toxicity level (master parameter)
 *
 * @param {THREE.ShaderMaterial} material - Procedural poison material
 * @param {number} toxicity - New toxicity (0-1)
 */
export function setProceduralPoisonToxicity(material, toxicity) {
    if (!material?.uniforms) return;

    material.uniforms.uToxicity.value = toxicity;
    material.uniforms.uIntensity.value = lerp3(0.7, 0.9, 1.1, toxicity);
    material.uniforms.uDisplacementStrength.value = lerp3(0.04, 0.08, 0.12, toxicity);
    material.uniforms.uViscosity.value = lerp3(0.8, 0.6, 0.4, toxicity);
    material.uniforms.uGlowIntensity.value = lerp3(0.1, 0.3, 0.5, toxicity);
    material.userData.toxicity = toxicity;
}

/**
 * Set intensity multiplier (for gesture animation integration)
 *
 * @param {THREE.ShaderMaterial} material - Procedural poison material
 * @param {number} intensity - Intensity multiplier (0-1)
 * @param {number} [fadeProgress] - Smooth fade for vertex displacement
 */
export function setProceduralPoisonIntensity(material, intensity, fadeProgress = null) {
    if (!material?.uniforms) return;

    const clampedIntensity = Math.max(0.01, intensity);
    const tox = material.userData.toxicity || 0.5;
    const baseIntensity = lerp3(0.7, 0.9, 1.1, tox);
    material.uniforms.uIntensity.value = baseIntensity * clampedIntensity;

    if (fadeProgress !== null && material.uniforms.uFadeProgress) {
        material.uniforms.uFadeProgress.value = Math.max(0.01, fadeProgress);
    }
}

/**
 * Get physics-like properties for poison at given toxicity
 *
 * @param {number} toxicity - Toxicity level (0-1)
 * @returns {Object} Physics properties
 */
export function getProceduralPoisonPhysics(toxicity) {
    return {
        viscosity: lerp3(0.9, 0.7, 0.5, toxicity),      // High viscosity, decreases with toxicity
        spreadRate: lerp3(0.02, 0.04, 0.06, toxicity),  // Slow spread
        fallSpeed: lerp3(0.01, 0.02, 0.03, toxicity),   // Very slow fall (thick)
        bubbleRate: lerp3(0.5, 1.5, 3.0, toxicity)      // Bubble frequency
    };
}

export default {
    createProceduralPoisonMaterial,
    updateProceduralPoisonMaterial,
    setProceduralPoisonToxicity,
    setProceduralPoisonIntensity,
    getProceduralPoisonPhysics
};
