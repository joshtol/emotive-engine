/**
 * Moon Crescent Shadow Shader
 *
 * Creates realistic lunar phases using world-space directional lighting.
 * The shadow rotates naturally with the moon sphere.
 *
 * Based on real lunar terminator physics:
 * - Light direction is fixed in world space (like the sun)
 * - Normals rotate with the moon (in world space)
 * - dot(normal, lightDir) < 0 = shadow side
 * - dot(normal, lightDir) > 0 = lit side
 * - Creates smooth curved terminator line like real moon phases
 */

export const moonCrescentVertexShader = `
/**
 * Moon Crescent Vertex Shader
 * Passes world-space normal to fragment shader for realistic lighting
 */

varying vec3 vPosition; // LOCAL position
varying vec3 vWorldPosition;
varying vec3 vWorldNormal; // WORLD SPACE normal (rotates with moon)
varying vec3 vViewPosition;
varying vec2 vUv;

void main() {
    vUv = uv;
    vPosition = position;

    // Transform normal to WORLD space (not view space)
    // This makes the shadow rotate with the moon geometry
    vWorldNormal = normalize(mat3(modelMatrix) * normal);

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
 * Uses directional half-space test in WORLD SPACE to create realistic terminator:
 * - Light direction fixed in world space (like the sun)
 * - Normals rotate with moon geometry (in world space)
 * - dot(normal, lightDir) < 0 = shadow side
 * - dot(normal, lightDir) > 0 = lit side
 * - Smooth terminator with earthshine on dark side
 */

uniform sampler2D colorMap;
uniform sampler2D normalMap;
uniform vec2 shadowOffset; // Controls light direction (x=horizontal, y=vertical)
uniform float shadowCoverage; // Unused for directional shadow
uniform float shadowSoftness; // Terminator edge softness (default: 0.05)
uniform vec3 glowColor;
uniform float glowIntensity;

varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vWorldNormal; // WORLD SPACE normal (rotates with moon)
varying vec3 vViewPosition;
varying vec2 vUv;

void main() {
    // DIRECTIONAL SHADOW in WORLD SPACE - realistic moon phase lighting
    // Light direction is fixed in world space, shadow rotates with moon

    // Use world-space normal (rotates with moon geometry)
    vec3 worldNormal = normalize(vWorldNormal);

    // Light direction in WORLD SPACE
    // shadowOffset.x controls horizontal angle (left/right)
    // shadowOffset.y controls vertical angle (up/down)
    // For thin crescents, we need extreme angles (light from the side or behind)

    float lightX = shadowOffset.x;
    float lightY = shadowOffset.y;

    // Adaptive Z component with LOGARITHMIC scaling for wider angular range
    // Goal: Spread phases across full 0° to 180° instead of plateauing at 135°
    //
    // Target angles after normalization:
    // - Full moon (x=0): 0° (light from front)
    // - Quarter moon (x=1): 90° (light from side)
    // - Crescent (x=3): 120° (thin crescent)
    // - New moon (x=10): 170° (nearly behind)

    float offsetMagnitude = length(vec2(lightX, lightY));

    // Use exponential decay for Z to spread angular range
    // Formula: Z = 1.0 - offsetMagnitude^1.5 for better distribution
    float lightZ = 1.0 - pow(offsetMagnitude, 1.5);

    // Normalize the light direction vector
    vec3 lightDir = normalize(vec3(lightX, lightY, lightZ));

    // Calculate how much this fragment faces the light source
    float facing = dot(worldNormal, lightDir);

    // Smooth transition at terminator (shadow boundary)
    // Sharp edge with enhanced anti-aliasing for photorealistic terminator
    // Use fwidth() for automatic screen-space anti-aliasing
    float edgeWidth = max(fwidth(facing) * 4.0, shadowSoftness * 0.5);
    float shadowFactor = smoothstep(-edgeWidth, edgeWidth, facing);

    // Sample moon surface texture
    vec4 texColor = texture2D(colorMap, vUv);

    // Fallback to gray if texture not loaded yet
    float brightness = texColor.r + texColor.g + texColor.b;
    if (brightness < 0.03) {
        texColor = vec4(0.5, 0.5, 0.5, 1.0);
    }

    // LIMB DARKENING: Moon gets darker at edges (spherical falloff)
    vec3 viewDir = normalize(-vViewPosition);
    float rimFactor = dot(worldNormal, viewDir);
    float limbDarkening = smoothstep(0.0, 0.6, rimFactor); // Subtle edge darkening

    // DIFFUSE LIGHTING: Vary brightness across lit surface (not uniform)
    // More realistic Lambertian diffuse reflection
    float diffuse = max(facing, 0.0);
    float diffuseLighting = mix(0.7, 1.0, diffuse); // Subtle variation

    // EARTHSHINE: Almost invisible (~1% for ultimate realism)
    vec3 earthshine = texColor.rgb * 0.01 * vec3(0.35, 0.4, 0.6);

    // Apply dramatic shadow transition with maximum contrast
    float litFactor = pow(shadowFactor, 2.0); // Maximum contrast

    // TEXTURE ENHANCEMENT: Boost surface detail contrast
    // Slightly darken dark areas, brighten bright areas of texture
    vec3 detailEnhanced = texColor.rgb * 1.08; // Subtle boost
    float textureLuminance = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
    detailEnhanced = mix(texColor.rgb * 0.95, texColor.rgb * 1.12, smoothstep(0.3, 0.7, textureLuminance));

    // Combine enhanced texture with diffuse lighting
    vec3 litColor = detailEnhanced * diffuseLighting;
    vec3 shadowedColor = mix(earthshine, litColor, litFactor);

    // Apply limb darkening (slightly stronger for more depth)
    shadowedColor *= mix(0.6, 1.0, limbDarkening);

    // Nearly zero emissive for pure realism
    vec3 emissive = vec3(0.02, 0.02, 0.02) * shadowFactor;

    // Emotion glow (almost invisible)
    vec3 emotionGlow = glowColor * glowIntensity * 0.02 * shadowFactor;

    // Combine all lighting components
    vec3 finalColor = shadowedColor + emissive + emotionGlow;

    gl_FragColor = vec4(finalColor, 1.0);
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
