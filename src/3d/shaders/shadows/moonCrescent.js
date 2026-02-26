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
uniform float opacity; // Fade in opacity (0-1) to prevent gray flash during texture load

// Lunar Eclipse (Blood Moon) uniforms
uniform float eclipseProgress; // 0.0 = no eclipse, 1.0 = totality
uniform float eclipseIntensity; // Darkening strength (0.0-1.0)
uniform vec3 bloodMoonColor; // Deep reddish-orange for total eclipse
uniform float blendMode; // 0=Multiply, 1=LinearBurn, 2=ColorBurn, 3=ColorDodge, 4=Screen, 5=Overlay
uniform float blendStrength; // Blend strength multiplier (0.0-5.0)
uniform float emissiveStrength; // Emissive glow strength (0.0-1.0)

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
    // Softer edge for realistic lunar terminator (like real moon photography)
    // Use fwidth() for automatic screen-space anti-aliasing
    float edgeWidth = max(fwidth(facing) * 4.0, shadowSoftness * 3.0);
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

    // ═══════════════════════════════════════════════════════════════════════════
    // LUNAR ECLIPSE (BLOOD MOON) EFFECT
    // ═══════════════════════════════════════════════════════════════════════════
    // Simulates Earth's umbral shadow with Rayleigh scattering (reddish glow)
    if (eclipseProgress > 0.001) {
        // Calculate gradient from lit edge to dark center
        // Use rim factor (view angle) to create radial gradient
        float gradientFactor = rimFactor; // 1.0 at edges, 0.0 at center

        // Darken the moon (Earth's shadow)
        float darkeningFactor = 1.0 - eclipseIntensity;
        finalColor *= darkeningFactor;

        // ═══════════════════════════════════════════════════════════════════
        // PHOTOSHOP-STYLE BLEND MODES: Multiple modes for deep saturation control
        // ═══════════════════════════════════════════════════════════════════

        // Define blood moon gradient colors
        vec3 deepRed = vec3(0.6, 0.2, 0.12);       // Dark burnt red-orange (center)
        vec3 brightOrange = vec3(0.95, 0.45, 0.22); // Bright burnt orange (edges)

        // Create radial gradient from center (dark) to edge (bright)
        vec3 bloodGradient = mix(deepRed, brightOrange, pow(gradientFactor, 1.8));

        // Apply blend strength multiplier
        vec3 blendColor = bloodGradient * blendStrength;

        // Calculate all blend modes
        vec3 finalBlend;
        int mode = int(blendMode + 0.5); // Round to nearest int

        if (mode == 0) {
            // MULTIPLY: base * blend
            finalBlend = finalColor * blendColor;
        } else if (mode == 1) {
            // LINEAR BURN: base + blend - 1
            finalBlend = max(finalColor + blendColor - vec3(1.0), vec3(0.0));
        } else if (mode == 2) {
            // COLOR BURN: (blend==0.0) ? 0.0 : max((1.0-((1.0-base)/blend)), 0.0)
            finalBlend = vec3(
                blendColor.r == 0.0 ? 0.0 : max(1.0 - ((1.0 - finalColor.r) / blendColor.r), 0.0),
                blendColor.g == 0.0 ? 0.0 : max(1.0 - ((1.0 - finalColor.g) / blendColor.g), 0.0),
                blendColor.b == 0.0 ? 0.0 : max(1.0 - ((1.0 - finalColor.b) / blendColor.b), 0.0)
            );
        } else if (mode == 3) {
            // COLOR DODGE: (blend==1.0) ? 1.0 : min(base/(1.0-blend), 1.0)
            finalBlend = vec3(
                blendColor.r == 1.0 ? 1.0 : min(finalColor.r / (1.0 - blendColor.r), 1.0),
                blendColor.g == 1.0 ? 1.0 : min(finalColor.g / (1.0 - blendColor.g), 1.0),
                blendColor.b == 1.0 ? 1.0 : min(finalColor.b / (1.0 - blendColor.b), 1.0)
            );
        } else if (mode == 4) {
            // SCREEN: 1 - (1 - base) * (1 - blend)
            finalBlend = vec3(1.0) - (vec3(1.0) - finalColor) * (vec3(1.0) - blendColor);
        } else {
            // OVERLAY: base < 0.5 ? (2 * base * blend) : (1 - 2 * (1 - base) * (1 - blend))
            finalBlend = vec3(
                finalColor.r < 0.5 ? (2.0 * finalColor.r * blendColor.r) : (1.0 - 2.0 * (1.0 - finalColor.r) * (1.0 - blendColor.r)),
                finalColor.g < 0.5 ? (2.0 * finalColor.g * blendColor.g) : (1.0 - 2.0 * (1.0 - finalColor.g) * (1.0 - blendColor.g)),
                finalColor.b < 0.5 ? (2.0 * finalColor.b * blendColor.b) : (1.0 - 2.0 * (1.0 - finalColor.b) * (1.0 - blendColor.b))
            );
        }

        // Apply blood moon effect
        finalColor = mix(finalColor, finalBlend, eclipseProgress);

        // Add emissive glow for visibility
        finalColor += bloodGradient * emissiveStrength * eclipseProgress;

        // Add bright rim glow during totality (refracted atmosphere light)
        if (eclipseProgress > 0.7) {
            float rimIntensity = pow(gradientFactor, 2.5); // Sharp falloff from edge
            vec3 rimGlow = brightOrange * rimIntensity * (eclipseProgress - 0.7) * 2.5;
            finalColor += rimGlow;
        }
    }

    // Apply fade-in opacity to prevent gray flash during texture load
    gl_FragColor = vec4(finalColor, opacity);
}
`;

/**
 * Get moon crescent shadow shaders
 * @returns {Object} Object with vertexShader and fragmentShader strings
 */
export function getMoonCrescentShaders() {
    return {
        vertexShader: moonCrescentVertexShader,
        fragmentShader: moonCrescentFragmentShader,
    };
}
