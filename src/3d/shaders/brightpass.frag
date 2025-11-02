#version 300 es
precision highp float;

// Bright-pass extraction - Extract bright areas for bloom

in vec2 v_uv;

uniform sampler2D u_sourceTexture;
uniform float u_threshold;  // Brightness threshold (default 1.0 for HDR)

out vec4 fragColor;

void main() {
    vec3 color = texture(u_sourceTexture, v_uv).rgb;

    // Calculate luminance (perceptual brightness)
    float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));

    // Extract bright areas above threshold
    if (luminance > u_threshold) {
        // Preserve color, just threshold
        fragColor = vec4(color, 1.0);
    } else {
        // Below threshold = black
        fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}
