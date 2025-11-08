/**
 * Moon Crescent Vertex Shader
 *
 * Passes world position and normals to fragment shader for:
 * - Sphere-sphere clipping (crescent shadow)
 * - Lighting calculations
 * - Texture mapping
 */

// Three.js built-in uniforms (automatically provided)
// uniform mat4 modelMatrix;
// uniform mat4 viewMatrix;
// uniform mat4 projectionMatrix;
// uniform mat3 normalMatrix;

// Three.js built-in attributes
// attribute vec3 position;
// attribute vec3 normal;
// attribute vec2 uv;

// Varyings (passed to fragment shader)
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;

void main() {
    // Pass UV coordinates for texture sampling
    vUv = uv;

    // Transform normal to world space for lighting
    vNormal = normalize(normalMatrix * normal);

    // Calculate world position (needed for sphere clipping)
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;

    // Calculate view space position for camera-relative effects
    vec4 viewPosition = viewMatrix * worldPosition;
    vViewPosition = viewPosition.xyz;

    // Final vertex position (clip space)
    gl_Position = projectionMatrix * viewPosition;
}
