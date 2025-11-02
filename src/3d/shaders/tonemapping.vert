#version 300 es

// Fullscreen quad vertex shader for post-processing

in vec2 a_position;  // NDC positions (-1 to 1)
in vec2 a_uv;        // Texture coordinates (0 to 1)

out vec2 v_uv;

void main() {
    v_uv = a_uv;
    gl_Position = vec4(a_position, 0.0, 1.0);
}
