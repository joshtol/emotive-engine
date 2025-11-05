/**
 * Particle Vertex Shader
 * Handles per-particle positioning, sizing, and depth-based scaling
 */

// Per-particle attributes
attribute float size;
attribute vec3 customColor;
attribute float alpha;
attribute float glowIntensity;

// Varying to fragment shader
varying vec3 vColor;
varying float vAlpha;
varying float vGlowIntensity;

void main() {
    // Pass attributes to fragment shader
    vColor = customColor;
    vAlpha = alpha;
    vGlowIntensity = glowIntensity;

    // Calculate position in clip space
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // Calculate point size with perspective scaling
    // Closer particles appear larger
    float perspectiveScale = 1000.0 / length(mvPosition.xyz);
    gl_PointSize = size * perspectiveScale;

    // Final position
    gl_Position = projectionMatrix * mvPosition;
}
