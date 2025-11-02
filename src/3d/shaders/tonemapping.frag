#version 300 es
precision highp float;

// Tone Mapping - Convert HDR to LDR for display
//
// Multiple algorithms available:
// 0 = Reinhard (simple, good default)
// 1 = ACES Filmic (cinematic, industry standard)
// 2 = Uncharted 2 (popular in games)

in vec2 v_uv;

uniform sampler2D u_hdrTexture;
uniform float u_exposure;      // Global exposure multiplier (default 1.0)
uniform int u_toneMappingMode; // Which algorithm to use
uniform float u_gamma;         // Gamma correction (default 2.2)

out vec4 fragColor;

// ============================================================================
// TONE MAPPING ALGORITHMS
// ============================================================================

// Reinhard tone mapping - Simple and effective
vec3 reinhardToneMapping(vec3 color) {
    return color / (color + vec3(1.0));
}

// ACES Filmic tone mapping - Industry standard, used in film/games
// Based on Stephen Hill's fit of the ACES RRT and ODT
vec3 acesToneMapping(vec3 color) {
    const float a = 2.51;
    const float b = 0.03;
    const float c = 2.43;
    const float d = 0.59;
    const float e = 0.14;

    color = (color * (a * color + b)) / (color * (c * color + d) + e);
    return clamp(color, 0.0, 1.0);
}

// Uncharted 2 tone mapping - John Hable's formula
vec3 uncharted2Tonemap(vec3 x) {
    const float A = 0.15;  // Shoulder strength
    const float B = 0.50;  // Linear strength
    const float C = 0.10;  // Linear angle
    const float D = 0.20;  // Toe strength
    const float E = 0.02;  // Toe numerator
    const float F = 0.30;  // Toe denominator

    return ((x * (A * x + C * B) + D * E) / (x * (A * x + B) + D * F)) - E / F;
}

vec3 uncharted2ToneMapping(vec3 color) {
    const float W = 11.2;  // Linear white point value
    vec3 curr = uncharted2Tonemap(color * 2.0);
    vec3 whiteScale = 1.0 / uncharted2Tonemap(vec3(W));
    return curr * whiteScale;
}

// ============================================================================
// MAIN
// ============================================================================

void main() {
    // Sample HDR color
    vec3 hdrColor = texture(u_hdrTexture, v_uv).rgb;

    // Apply exposure
    hdrColor *= u_exposure;

    // Apply tone mapping
    vec3 ldrColor;
    if (u_toneMappingMode == 1) {
        ldrColor = acesToneMapping(hdrColor);
    } else if (u_toneMappingMode == 2) {
        ldrColor = uncharted2ToneMapping(hdrColor);
    } else {
        // Default: Reinhard
        ldrColor = reinhardToneMapping(hdrColor);
    }

    // Gamma correction (convert from linear to sRGB)
    ldrColor = pow(ldrColor, vec3(1.0 / u_gamma));

    // Output final color
    fragColor = vec4(ldrColor, 1.0);
}
