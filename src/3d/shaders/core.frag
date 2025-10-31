#version 300 es
// Fragment Shader - Core with Glow
precision highp float;

in vec3 v_normal;
in vec3 v_position;

uniform vec3 u_glowColor;
uniform float u_glowIntensity;
uniform vec3 u_cameraPosition;

out vec4 fragColor;

void main() {
    // Normalize normal
    vec3 normal = normalize(v_normal);

    // View direction
    vec3 viewDir = normalize(u_cameraPosition - v_position);

    // Fresnel effect (glow at edges)
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);

    // Base color (white core)
    vec3 coreColor = vec3(1.0);

    // Glow color
    vec3 glow = u_glowColor * u_glowIntensity * (0.3 + fresnel * 0.7);

    // Combine
    vec3 finalColor = coreColor + glow;

    // Fully opaque to properly occlude particles behind it
    fragColor = vec4(finalColor, 1.0);
}
