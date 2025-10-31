#version 300 es
// Vertex Shader - Core 3D Object

in vec3 a_position;
in vec3 a_normal;

uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

out vec3 v_normal;
out vec3 v_position;

void main() {
    // Transform position
    vec4 worldPos = u_modelMatrix * vec4(a_position, 1.0);
    vec4 viewPos = u_viewMatrix * worldPos;
    gl_Position = u_projectionMatrix * viewPos;

    // Pass to fragment shader
    v_normal = mat3(u_modelMatrix) * a_normal;
    v_position = worldPos.xyz;
}
