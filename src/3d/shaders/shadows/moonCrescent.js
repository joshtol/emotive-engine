/**
 * Moon Crescent Shadow Shader
 *
 * Creates a camera-fixed crescent shadow using directional half-space clipping.
 * The shadow stays in the same screen position regardless of moon rotation/position.
 *
 * Based on real lunar terminator physics:
 * - Light direction is fixed in view space (camera coordinates)
 * - Fragments facing away from light are in shadow (discarded)
 * - Creates smooth curved terminator line like real moon phases
 */

export const moonCrescentVertexShader = `
/**
 * Moon Crescent Vertex Shader
 */

varying vec3 vPosition; // LOCAL position
varying vec3 vWorldPosition;
varying vec3 vNormal; // VIEW SPACE normal (after normalMatrix transform)
varying vec3 vViewPosition;
varying vec2 vUv;

void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normalize(normalMatrix * normal); // Transform to view space
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vec4 viewPosition = viewMatrix * worldPosition;
    vViewPosition = viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
}
`;

export const moonCrescentFragmentShader = `
/**
 * Moon Crescent Fragment Shader
 *
 * Uses directional half-space test to create terminator line:
 * - Light direction fixed in view space
 * - Normals rotate with moon (in view space)
 * - dot(normal, lightDir) < 0 = shadow side
 * - dot(normal, lightDir) > 0 = lit side
 */

uniform sampler2D colorMap;
uniform sampler2D normalMap;
uniform vec2 shadowOffset; // Controls light direction (x=horizontal, y=vertical)
uniform float shadowCoverage; // Unused for directional shadow
uniform float shadowSoftness; // Terminator edge softness
uniform vec3 glowColor;
uniform float glowIntensity;

varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vNormal; // Already in view space from vertex shader
varying vec3 vViewPosition;
varying vec2 vUv;

void main() {
    // DIRECTIONAL SHADOW in VIEW SPACE - camera-fixed crescent
    // Shadow direction stays constant on screen, moon rotates underneath

    // Light direction in view space (camera coordinates)
    // shadowOffset.x controls horizontal position (left/right)
    // shadowOffset.y controls vertical position (up/down)
    // Positive X = light from right, negative X = light from left
    vec3 lightDir = normalize(vec3(shadowOffset.x, shadowOffset.y, 1.0));

    // vNormal is already in view space (normalMatrix applied in vertex shader)
    vec3 viewNormal = normalize(vNormal);

    // Calculate how much this fragment faces the light
    // > 0 = facing light (lit side)
    // < 0 = facing away from light (shadow side)
    float facing = dot(viewNormal, lightDir);

    // Discard fragments on shadow side (facing away from light)
    if (facing < 0.0) {
        discard;
    }

    // Soft edge at terminator for smooth transition
    float alpha = 1.0;
    if (facing < shadowSoftness) {
        alpha = smoothstep(0.0, shadowSoftness, facing);
    }

    // Sample texture
    vec4 texColor = texture2D(colorMap, vUv);

    // If texture not loaded yet, show gray fallback
    float brightness = texColor.r + texColor.g + texColor.b;
    if (brightness < 0.03) {
        texColor = vec4(0.5, 0.5, 0.5, 1.0);
    }

    // Lighting - simple directional from light source
    float diffuse = max(dot(viewNormal, lightDir), 0.0);
    float ambient = 0.3;
    float lighting = ambient + (1.0 - ambient) * diffuse;

    // Apply lighting to texture
    vec3 litColor = texColor.rgb * lighting;

    // Add emissive glow for visibility and emotion
    vec3 emissive = vec3(0.15, 0.15, 0.15);
    vec3 emotionGlow = glowColor * glowIntensity * 0.15;
    vec3 finalColor = litColor + emissive + emotionGlow;

    gl_FragColor = vec4(finalColor, alpha);
}
`;

/**
 * Get moon crescent shadow shaders
 * @returns {Object} Object with vertexShader and fragmentShader strings
 */
export function getMoonCrescentShaders() {
    return {
        vertexShader: moonCrescentVertexShader,
        fragmentShader: moonCrescentFragmentShader
    };
}
