#version 300 es
// Fragment Shader - Core with Glow and Multiple Rendering Modes
precision highp float;

in vec3 v_normal;
in vec3 v_position;

uniform vec3 u_glowColor;
uniform float u_glowIntensity;
uniform vec3 u_cameraPosition;
uniform int u_renderMode;  // 0=standard, 1=normals, 2=toon, 3=edge

out vec4 fragColor;

void main() {
    // Normalize normal
    vec3 normal = normalize(v_normal);

    // View direction
    vec3 viewDir = normalize(u_cameraPosition - v_position);

    // Fresnel effect (glow at edges)
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);

    vec3 coreColor;
    vec3 glow = u_glowColor * u_glowIntensity * (0.3 + fresnel * 0.7);

    // MODE 1: Normal Visualization (RGB = XYZ)
    if (u_renderMode == 1) {
        // Map normals from [-1,1] to [0,1] for RGB
        coreColor = normal * 0.5 + 0.5;
        // Make it brighter
        coreColor *= 1.2;
    }
    // MODE 2: Cel/Toon Shading (hard-edged bands)
    else if (u_renderMode == 2) {
        vec3 lightDir = normalize(vec3(0.5, 1.0, 1.0));
        float diffuse = max(dot(normal, lightDir), 0.0);

        // Quantize lighting into discrete bands
        float toonDiffuse;
        if (diffuse > 0.8) toonDiffuse = 1.0;
        else if (diffuse > 0.5) toonDiffuse = 0.7;
        else if (diffuse > 0.2) toonDiffuse = 0.4;
        else toonDiffuse = 0.2;

        coreColor = vec3(toonDiffuse);
    }
    // MODE 3: Edge Detection
    else if (u_renderMode == 3) {
        vec3 lightDir = normalize(vec3(0.5, 1.0, 1.0));
        float diffuse = max(dot(normal, lightDir), 0.0);
        float ambient = 0.4;
        float lighting = ambient + diffuse * 0.6;

        // Edge detection using view angle
        float edge = abs(dot(normal, viewDir));
        // Darken edges
        if (edge < 0.3) {
            coreColor = vec3(0.1);  // Dark edges
        } else {
            coreColor = vec3(lighting);
        }
    }
    // MODE 0: Standard lighting (default)
    else {
        vec3 lightDir = normalize(vec3(0.5, 1.0, 1.0));
        float diffuse = max(dot(normal, lightDir), 0.0);
        float ambient = 0.4;
        float lighting = ambient + diffuse * 0.6;
        coreColor = vec3(lighting);
    }

    // Combine with glow
    vec3 finalColor = coreColor + glow;

    // Fully opaque to properly occlude particles behind it
    fragColor = vec4(finalColor, 1.0);
}
