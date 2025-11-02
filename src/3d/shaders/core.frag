#version 300 es
// Fragment Shader - Core with Blended Rendering
precision highp float;

in vec3 v_normal;
in vec3 v_position;

uniform vec3 u_glowColor;
uniform float u_glowIntensity;
uniform vec3 u_cameraPosition;
uniform vec3 u_lightDirection;
uniform float u_time;  // Time for animations

// Blended rendering system (all modes mix together)
uniform float u_pbrAmount;      // 0.0-1.0
uniform float u_toonAmount;     // 0.0-1.0
uniform float u_flatAmount;     // 0.0-1.0
uniform float u_normalsAmount;  // 0.0-1.0
uniform float u_edgesAmount;    // 0.0-1.0
uniform float u_rimAmount;      // 0.0-1.0
uniform float u_wireframeAmount; // 0.0-1.0

// Material properties
uniform float u_roughness;      // 0.0 = mirror, 1.0 = matte
uniform float u_metallic;       // 0.0 = dielectric, 1.0 = metal
uniform float u_ao;             // 0.0 = full occlusion, 1.0 = no occlusion
uniform float u_sssStrength;    // Subsurface scattering strength
uniform float u_anisotropy;     // Anisotropic reflection (-1.0 to 1.0)
uniform float u_iridescence;    // Iridescence intensity (0.0 to 1.0)

out vec4 fragColor;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// HSV to RGB conversion
vec3 hueToRGB(float H) {
    float R = abs(H * 6.0 - 3.0) - 1.0;
    float G = 2.0 - abs(H * 6.0 - 2.0);
    float B = 2.0 - abs(H * 6.0 - 4.0);
    return clamp(vec3(R, G, B), 0.0, 1.0);
}

// Smooth band transitions
float stepmix(float edge0, float edge1, float E, float x) {
    float T = clamp(0.5 * (x - edge0 + E) / E, 0.0, 1.0);
    return mix(edge0, edge1, T);
}

// Fresnel-Schlick approximation
vec3 fresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

// GGX Normal Distribution Function
float DistributionGGX(vec3 N, vec3 H, float roughness) {
    float a = roughness * roughness;
    float a2 = a * a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH * NdotH;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = 3.14159265359 * denom * denom;
    return a2 / max(denom, 0.0000001);
}

// Geometry function (self-shadowing)
float GeometrySchlickGGX(float NdotV, float roughness) {
    float r = (roughness + 1.0);
    float k = (r * r) / 8.0;
    return NdotV / (NdotV * (1.0 - k) + k);
}

float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2 = GeometrySchlickGGX(NdotV, roughness);
    float ggx1 = GeometrySchlickGGX(NdotL, roughness);
    return ggx1 * ggx2;
}

// ============================================================================
// ADVANCED MATERIAL EFFECTS
// ============================================================================

// Optimized subsurface scattering approximation
vec3 calculateSSS(vec3 normal, vec3 viewDir, vec3 lightDir, vec3 baseColor, float strength) {
    // Enhanced back-lighting with deeper penetration
    vec3 scatterDir = lightDir + normal * 0.3;  // Reduced offset for more pronounced effect
    float backScatter = pow(clamp(dot(viewDir, -scatterDir), 0.0, 1.0), 3.0);  // Lower power for wider spread

    // Add wrap-around diffuse for softer appearance
    float wrapDiffuse = max(0.0, (dot(normal, lightDir) + 0.5) / 1.5);

    // Combine effects with strength multiplier
    return baseColor * (backScatter * 1.5 + wrapDiffuse * 0.3) * strength;
}

// Anisotropic GGX distribution
float DistributionGGXAnisotropic(vec3 N, vec3 H, vec3 T, vec3 B, float roughness, float anisotropy) {
    float at = max(roughness * (1.0 + anisotropy), 0.001);
    float ab = max(roughness * (1.0 - anisotropy), 0.001);

    float NdotH = max(dot(N, H), 0.0);
    float TdotH = dot(T, H);
    float BdotH = dot(B, H);

    float a2t = at * at;
    float a2b = ab * ab;

    float denom = (TdotH * TdotH / a2t) + (BdotH * BdotH / a2b) + NdotH * NdotH;
    return 1.0 / (3.14159265359 * at * ab * denom * denom);
}

// Enhanced thin-film iridescence with richer colors
vec3 calculateIridescence(float NdotV, float iridescenceStrength) {
    // Multi-layer interference for richer color variation
    float hue1 = fract(NdotV * 2.5 + u_time * 0.05);  // Slower, smoother animation
    float hue2 = fract(NdotV * 4.0 + u_time * 0.08);  // Secondary layer

    // Combine layers for more complex color shifts
    vec3 iridColor1 = hueToRGB(hue1);
    vec3 iridColor2 = hueToRGB(hue2);
    vec3 iridColor = mix(iridColor1, iridColor2, 0.3);  // Blend layers

    // Enhance saturation for more vibrant colors
    float luminance = dot(iridColor, vec3(0.299, 0.587, 0.114));
    iridColor = mix(vec3(luminance), iridColor, 1.3);  // Boost saturation

    return mix(vec3(1.0), iridColor, iridescenceStrength);
}

// ============================================================================
// RENDERING COMPONENT FUNCTIONS
// ============================================================================

// Calculate PBR shading with advanced material properties
vec3 calculatePBR(vec3 normal, vec3 viewDir, vec3 lightDir) {
    // Use uniform material properties
    vec3 F0 = mix(vec3(0.04), u_glowColor, u_metallic);
    vec3 H = normalize(viewDir + lightDir);

    float NdotV = max(dot(normal, viewDir), 0.0);
    float NdotL = max(dot(normal, lightDir), 0.0);

    // Anisotropic reflection (if enabled)
    float NDF;
    if (abs(u_anisotropy) > 0.01) {
        // Create tangent and bitangent from normal
        vec3 up = abs(normal.y) < 0.999 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
        vec3 tangent = normalize(cross(up, normal));
        vec3 bitangent = cross(normal, tangent);
        NDF = DistributionGGXAnisotropic(normal, H, tangent, bitangent, u_roughness, u_anisotropy);
    } else {
        // Standard isotropic GGX
        NDF = DistributionGGX(normal, H, u_roughness);
    }

    float G = GeometrySmith(normal, viewDir, lightDir, u_roughness);
    vec3 F = fresnelSchlick(max(dot(H, viewDir), 0.0), F0);

    // Iridescence modulates Fresnel
    if (u_iridescence > 0.01) {
        vec3 iridColor = calculateIridescence(NdotV, u_iridescence);
        F *= iridColor;
    }

    vec3 specular = (NDF * G * F) / (4.0 * max(NdotV, 0.0) * max(NdotL, 0.0) + 0.0001);

    vec3 kS = F;
    vec3 kD = vec3(1.0) - kS;
    kD *= 1.0 - u_metallic;

    // Enhanced AO with smoothed influence
    float aoInfluence = mix(1.0, u_ao, 0.8);  // Soften AO effect slightly

    // Diffuse with AO
    vec3 diffuse = kD * u_glowColor * aoInfluence;

    // Subsurface scattering (for non-metals) - enhanced with better visibility
    vec3 sss = vec3(0.0);
    if (u_sssStrength > 0.01 && u_metallic < 0.5) {
        sss = calculateSSS(normal, viewDir, lightDir, u_glowColor, u_sssStrength);
    }

    // Ambient with smoothed AO (squared for softer shadows)
    float aoSq = u_ao * u_ao;  // Quadratic falloff for smoother transitions
    vec3 ambient = vec3(0.005) * u_glowColor * aoSq;

    vec3 lightColor = vec3(1.0);

    // Combine: ambient + lit diffuse + SSS + specular + subtle fresnel
    return ambient + (diffuse + sss + specular) * lightColor * NdotL + F * 0.1;
}

// Calculate Toon shading
vec3 calculateToon(vec3 normal, vec3 lightDir) {
    float NdotL = dot(normal, lightDir);
    float halfLambert = NdotL * 0.5 + 0.5;
    halfLambert = halfLambert * halfLambert;

    float E = fwidth(halfLambert) * 2.0;

    float toonDiffuse;
    if (halfLambert > 0.75 - E && halfLambert < 0.85 + E) {
        toonDiffuse = stepmix(0.7, 1.0, E, halfLambert);
    } else if (halfLambert > 0.45 - E && halfLambert < 0.55 + E) {
        toonDiffuse = stepmix(0.4, 0.7, E, halfLambert);
    } else if (halfLambert > 0.15 - E && halfLambert < 0.25 + E) {
        toonDiffuse = stepmix(0.2, 0.4, E, halfLambert);
    } else if (halfLambert > 0.75) {
        toonDiffuse = 1.0;
    } else if (halfLambert > 0.45) {
        toonDiffuse = 0.7;
    } else if (halfLambert > 0.15) {
        toonDiffuse = 0.4;
    } else {
        toonDiffuse = 0.2;
    }

    return vec3(toonDiffuse);
}

// Calculate normals visualization (XYZ -> RGB)
vec3 calculateNormalsOverlay(vec3 normal) {
    // Map normal range from [-1, 1] to [0, 1] for RGB display
    // X -> Red, Y -> Green, Z -> Blue
    return normal * 0.5 + 0.5;
}

// Calculate edge effect
float calculateEdges(vec3 normal, vec3 viewDir, vec3 lightDir) {
    // Fresnel edges
    float rim = 1.0 - max(dot(normal, viewDir), 0.0);
    float fresnelEdge = pow(rim, 2.5);
    fresnelEdge = smoothstep(0.25, 0.4, fresnelEdge);

    // Geometric edges
    vec3 fdx = dFdx(normal);
    vec3 fdy = dFdy(normal);
    float geometricEdge = (length(fdx) + length(fdy)) * 10.0;
    geometricEdge = smoothstep(0.5, 1.5, geometricEdge);

    return max(fresnelEdge, geometricEdge);
}

// Calculate rim lighting effect (Fresnel-style edge glow)
vec3 calculateRim(vec3 normal, vec3 viewDir, vec3 lightDir) {
    // Fresnel effect - brightest at glancing angles
    float fresnel = 1.0 - max(dot(normal, viewDir), 0.0);
    float rimIntensity = pow(fresnel, 3.0);
    return vec3(rimIntensity);
}

// ============================================================================
// MAIN SHADER - BLENDED RENDERING ONLY
// ============================================================================

void main() {
    // Normalize normal and compute view direction
    vec3 normal = normalize(v_normal);
    vec3 viewDir = normalize(u_cameraPosition - v_position);
    vec3 lightDir = normalize(u_lightDirection);

    // Fresnel effect for glow (HDR-ready, can exceed 1.0)
    // Reduced base glow to prevent washing out shading detail
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
    vec3 glow = u_glowColor * u_glowIntensity * (0.0 + fresnel * 0.4) * 0.8; // Subtle edge glow only

    // Calculate each rendering mode independently
    vec3 pbrColor = calculatePBR(normal, viewDir, lightDir);
    vec3 toonColor = calculateToon(normal, lightDir);
    vec3 flatColor = u_glowColor * 0.5;
    vec3 normalsColor = calculateNormalsOverlay(normal);
    float edgeIntensity = calculateEdges(normal, viewDir, lightDir);
    vec3 rimColor = calculateRim(normal, viewDir, lightDir);

    // Blend base modes with direct weighted mix (no normalization)
    vec3 coreColor = pbrColor * u_pbrAmount +
                     toonColor * u_toonAmount +
                     flatColor * u_flatAmount +
                     normalsColor * u_normalsAmount;

    // Effects are additive (applied after base blending)
    if (u_edgesAmount > 0.0) {
        coreColor = mix(coreColor, vec3(1.0), edgeIntensity * u_edgesAmount * 0.8);
    }
    if (u_rimAmount > 0.0) {
        coreColor += rimColor * u_rimAmount;
    }

    // Combine with glow
    vec3 finalColor = coreColor + glow;

    // Output final color
    fragColor = vec4(finalColor, 1.0);
}
