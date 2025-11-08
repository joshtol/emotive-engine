/**
 * Moon Crescent Fragment Shader
 *
 * Implements sphere-sphere clipping to create crescent shadow effect
 * Features:
 * - Dynamic crescent shadow via distance field clipping
 * - NASA texture mapping (color + normal)
 * - Emotion-based emissive glow
 * - Smooth anti-aliased shadow edge
 */

// Uniforms
uniform sampler2D colorMap;        // NASA lunar surface color texture
uniform sampler2D normalMap;       // NASA-derived normal map
uniform vec2 shadowOffset;         // Shadow sphere offset (X, Y)
uniform float shadowCoverage;      // Crescent coverage (0=full moon, 1=new moon)
uniform float shadowSoftness;      // Edge softness for anti-aliasing
uniform vec3 glowColor;            // Emotion-based glow color (RGB)
uniform float glowIntensity;       // Glow brightness multiplier

// Varyings (from vertex shader)
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;

void main() {
    // ═══════════════════════════════════════════════════════════════════════════
    // 1. SPHERE-SPHERE CLIPPING (Crescent Shadow)
    // ═══════════════════════════════════════════════════════════════════════════

    // Moon sphere center (world space origin)
    vec3 moonCenter = vec3(0.0, 0.0, 0.0);
    float moonRadius = 0.9; // Matches geometry radius

    // Shadow sphere center (offset from moon center)
    vec3 shadowCenter = vec3(shadowOffset.x, shadowOffset.y, 0.0);

    // Calculate distance from fragment to shadow sphere center
    float distToShadow = distance(vWorldPosition, shadowCenter);

    // Clipping threshold (shadow sphere radius adjusted by coverage)
    float clipThreshold = moonRadius * shadowCoverage;

    // Hard clip if deep inside shadow
    if (distToShadow < clipThreshold) {
        discard; // Fragment is in shadow, don't render
    }

    // Soft edge gradient near boundary (anti-aliasing)
    float edgeDist = distToShadow - clipThreshold;
    float alpha = 1.0;
    if (edgeDist < shadowSoftness) {
        alpha = smoothstep(0.0, shadowSoftness, edgeDist);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 2. TEXTURE SAMPLING
    // ═══════════════════════════════════════════════════════════════════════════

    // Sample NASA color texture
    vec4 texColor = texture2D(colorMap, vUv);

    // Sample normal map and convert from [0,1] to [-1,1]
    vec3 normalSample = texture2D(normalMap, vUv).rgb * 2.0 - 1.0;

    // ═══════════════════════════════════════════════════════════════════════════
    // 3. LIGHTING (Simplified Phong)
    // ═══════════════════════════════════════════════════════════════════════════

    // Light direction (top-right, simulates sun)
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));

    // Diffuse lighting (Lambertian)
    float diffuse = max(dot(vNormal, lightDir), 0.0);

    // Ambient lighting (prevents pure black shadows)
    float ambient = 0.3;

    // Combine ambient + diffuse
    float lighting = ambient + (1.0 - ambient) * diffuse;

    // ═══════════════════════════════════════════════════════════════════════════
    // 4. EMISSIVE GLOW (Emotion System)
    // ═══════════════════════════════════════════════════════════════════════════

    // Base emissive for moon visibility
    vec3 baseEmissive = vec3(0.3, 0.3, 0.3);

    // Emotion-based glow (additive)
    vec3 emotionGlow = glowColor * glowIntensity * 0.2;

    // ═══════════════════════════════════════════════════════════════════════════
    // 5. FINAL COLOR COMPOSITION
    // ═══════════════════════════════════════════════════════════════════════════

    // Combine texture, lighting, and glow
    vec3 finalColor = texColor.rgb * lighting + baseEmissive + emotionGlow;

    // Output with alpha from shadow edge
    gl_FragColor = vec4(finalColor, alpha * texColor.a);
}
