#version 300 es
precision highp float;

// Separable Gaussian Blur - Efficient two-pass blur

in vec2 v_uv;

uniform sampler2D u_sourceTexture;
uniform vec2 u_direction;  // (1,0) for horizontal, (0,1) for vertical
uniform vec2 u_resolution; // Texture resolution for pixel size

out vec4 fragColor;

// 9-tap Gaussian blur kernel
// Weights for standard deviation = 1.0
const float weights[5] = float[](
    0.227027,  // Center
    0.1945946, // +/- 1
    0.1216216, // +/- 2
    0.054054,  // +/- 3
    0.016216   // +/- 4
);

void main() {
    vec2 texelSize = 1.0 / u_resolution;
    vec3 result = texture(u_sourceTexture, v_uv).rgb * weights[0];

    // Sample in the specified direction (horizontal or vertical)
    for (int i = 1; i < 5; i++) {
        vec2 offset = u_direction * texelSize * float(i);

        // Sample in positive direction
        result += texture(u_sourceTexture, v_uv + offset).rgb * weights[i];

        // Sample in negative direction
        result += texture(u_sourceTexture, v_uv - offset).rgb * weights[i];
    }

    fragColor = vec4(result, 1.0);
}
