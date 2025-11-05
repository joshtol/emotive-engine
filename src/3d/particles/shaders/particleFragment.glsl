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

    // Apply glow intensity to brightness
    float brightness = 1.0 + vGlowIntensity * 0.5;

    // Create core glow (brighter in center)
    float coreGlow = 1.0 - (dist * 2.0);
    coreGlow = max(0.0, coreGlow);

    // Combine color with glow
    vec3 finalColor = vColor * brightness;
    finalColor += vColor * coreGlow * vGlowIntensity * 0.3;

    // Apply alpha with gradient
    float finalAlpha = vAlpha * gradient;

    gl_FragColor = vec4(finalColor, finalAlpha);
}
