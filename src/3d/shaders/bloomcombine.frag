#version 300 es
precision highp float;

// Bloom Combine - Add blurred bright areas back to HDR scene

in vec2 v_uv;

uniform sampler2D u_hdrTexture;   // Original HDR scene
uniform sampler2D u_bloomTexture; // Blurred bright areas
uniform float u_bloomStrength;    // Bloom intensity (default 0.5)

out vec4 fragColor;

void main() {
    vec3 hdrColor = texture(u_hdrTexture, v_uv).rgb;
    vec3 bloomColor = texture(u_bloomTexture, v_uv).rgb;

    // Additive blend with strength control
    vec3 result = hdrColor + bloomColor * u_bloomStrength;

    fragColor = vec4(result, 1.0);
}
