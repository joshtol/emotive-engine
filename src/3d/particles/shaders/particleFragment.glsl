/**
 * Particle Fragment Shader
 * Creates soft, glowing particles with radial gradients
 */

// From vertex shader
varying vec3 vColor;
varying float vAlpha;
varying float vGlowIntensity;

void main() {
    // Calculate distance from center of point sprite
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);

    // Discard fragments outside circle
    if (dist > 0.5) {
        discard;
    }

    // Create radial gradient for soft edges
    float edgeSoftness = 0.5;
    float gradient = smoothstep(0.5, 0.5 - edgeSoftness, dist);

    // Apply glow intensity to brightness - EXTREME BOOST
    float brightness = 1.0 + vGlowIntensity * 10.0; // 10x brightness multiplier

    // Create core glow (brighter in center)
    float coreGlow = 1.0 - (dist * 2.0);
    coreGlow = max(0.0, coreGlow);

    // Combine color with glow - MUCH brighter
    vec3 finalColor = vColor * brightness;
    finalColor += vColor * coreGlow * vGlowIntensity * 5.0; // 5x core glow

    // Apply alpha with gradient - EXTREME alpha boost when glowing
    float glowAlphaBoost = 1.0 + vGlowIntensity * 20.0; // 20x alpha boost at max glow!
    float finalAlpha = vAlpha * gradient * glowAlphaBoost;

    gl_FragColor = vec4(finalColor, finalAlpha);
}
