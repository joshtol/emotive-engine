/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Moon Shader with Blend Layers
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Moon shader extended with universal blend mode layer system
 * @author Emotive Engine Team
 * @module 3d/shaders/shadows/moonWithBlendLayers
 *
 * Extends the standard moon shader with support for multiple sequential blend mode layers.
 * Uses universal blend mode utilities from src/3d/shaders/utils/blendModes.js
 * Allows drag-and-drop layer stacking for complex color grading effects.
 */

import { blendModesGLSL } from '../utils/blendModes.js';

export const moonWithBlendLayersVertexShader = `
/**
 * Moon Vertex Shader
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

export const moonWithBlendLayersFragmentShader = `
/**
 * Moon Fragment Shader with Blend Layers
 *
 * Supports up to 4 sequential blend mode layers for complex color grading
 * using universal Photoshop-style blend modes
 */

uniform sampler2D colorMap;
uniform sampler2D normalMap;
uniform vec2 shadowOffset;
uniform float shadowCoverage;
uniform float shadowSoftness;
uniform vec3 glowColor;
uniform float glowIntensity;
uniform float opacity;

// Lunar Eclipse (Blood Moon) uniforms
uniform float eclipseProgress;
uniform float eclipseIntensity;
uniform vec3 bloodMoonColor;
uniform float emissiveStrength;
uniform vec2 eclipseShadowPos;      // Shadow center position (-2 to 1)
uniform float eclipseShadowRadius;  // Shadow radius

// Eclipse Color Grading (from color pickers)
uniform vec3 eclipseShadowColor;
uniform vec3 eclipseMidtoneColor;
uniform vec3 eclipseHighlightColor;
uniform vec3 eclipseGlowColor;

// Brightness model toggle (0 = centeredness-based, 1 = edge-based)
uniform float eclipseBrightnessModel;

// Blend Layer Uniforms (up to 4 layers)
uniform float layer1Mode;
uniform float layer1Strength;
uniform float layer1Enabled;

uniform float layer2Mode;
uniform float layer2Strength;
uniform float layer2Enabled;

uniform float layer3Mode;
uniform float layer3Strength;
uniform float layer3Enabled;

uniform float layer4Mode;
uniform float layer4Strength;
uniform float layer4Enabled;

varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying vec3 vViewPosition;
varying vec2 vUv;

// ═══════════════════════════════════════════════════════════════════════════
// UNIVERSAL BLEND MODES (injected from utils/blendModes.js)
// ═══════════════════════════════════════════════════════════════════════════
${blendModesGLSL}

void main() {
    // DIRECTIONAL SHADOW in WORLD SPACE - realistic moon phase lighting
    vec3 worldNormal = normalize(vWorldNormal);

    float lightX = shadowOffset.x;
    float lightY = shadowOffset.y;
    float offsetMagnitude = length(vec2(lightX, lightY));
    float lightZ = 1.0 - pow(offsetMagnitude, 1.5);
    vec3 lightDir = normalize(vec3(lightX, lightY, lightZ));

    float facing = dot(worldNormal, lightDir);
    float edgeWidth = max(fwidth(facing) * 4.0, shadowSoftness * 3.0);
    float shadowFactor = smoothstep(-edgeWidth, edgeWidth, facing);

    // Sample moon surface texture
    vec4 texColor = texture2D(colorMap, vUv);
    float brightness = texColor.r + texColor.g + texColor.b;
    if (brightness < 0.03) {
        texColor = vec4(0.5, 0.5, 0.5, 1.0);
    }

    // LIMB DARKENING
    vec3 viewDir = normalize(-vViewPosition);
    float rimFactor = dot(worldNormal, viewDir);
    float limbDarkening = smoothstep(0.0, 0.6, rimFactor);

    // DIFFUSE LIGHTING
    float diffuse = max(facing, 0.0);
    float diffuseLighting = mix(0.7, 1.0, diffuse);

    // EARTHSHINE
    vec3 earthshine = texColor.rgb * 0.01 * vec3(0.35, 0.4, 0.6);

    // Apply shadow transition
    float litFactor = pow(shadowFactor, 2.0);
    vec3 detailEnhanced = texColor.rgb * 1.08;
    float textureLuminance = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
    detailEnhanced = mix(texColor.rgb * 0.95, texColor.rgb * 1.12, smoothstep(0.3, 0.7, textureLuminance));

    vec3 litColor = detailEnhanced * diffuseLighting;
    vec3 shadowedColor = mix(earthshine, litColor, litFactor);
    shadowedColor *= mix(0.6, 1.0, limbDarkening);

    vec3 emissive = vec3(0.02, 0.02, 0.02) * shadowFactor;
    vec3 emotionGlow = glowColor * glowIntensity * 0.02 * shadowFactor;
    vec3 finalColor = shadowedColor + emissive + emotionGlow;

    // ═══════════════════════════════════════════════════════════════════════════
    // LUNAR ECLIPSE EFFECT (Earth's Shadow Sweep)
    // Shadow position drives everything - automatically transitions from dark sharp shadow to red glow
    // ═══════════════════════════════════════════════════════════════════════════
    // Only apply eclipse if shadow is actually near the moon (shadowX > -1.5)
    if (eclipseProgress > 0.001 && eclipseShadowPos.x > -1.5) {
        // Calculate distance from shadow center in UV space
        vec2 shadowCenter = vec2(eclipseShadowPos.x, eclipseShadowPos.y);
        vec2 moonCenter = vUv - vec2(0.5, 0.5); // Center UV coordinates
        float distFromShadow = length(moonCenter - shadowCenter);

        // Earth's umbra (full shadow) - Softer edge for smoother transitions
        float umbraRadius = eclipseShadowRadius * 0.7;
        float umbraEdge = 0.08; // Softer for smoother shadow transitions
        float umbra = 1.0 - smoothstep(umbraRadius - umbraEdge, umbraRadius + umbraEdge, distFromShadow);

        // Earth's penumbra (partial shadow) - softer outer edge
        float penumbraRadius = eclipseShadowRadius * 1.1;
        float penumbraEdge = 0.15;
        float penumbra = 1.0 - smoothstep(penumbraRadius - penumbraEdge, penumbraRadius + penumbraEdge, distFromShadow);

        // TOTALITY FACTOR: Based on how centered the shadow is on the moon
        // When shadowX near 0.0 (centered), we're at totality - brightens and reddens
        // When shadowX far from 0.0 (off to side), we're partial - stays dark and sharp
        // VERY WIDE RANGE: 0.6 range - blood moon glow visible through most of shadow sweep
        float shadowCenteredness = 1.0 - smoothstep(0.0, 0.6, abs(eclipseShadowPos.x));
        float totalityFactor = shadowCenteredness;

        // UMBRA DARKENING: Less aggressive to prevent total black
        // Partials (shadow off-center): 70% darkening (visible dark amber glow)
        // Totality (shadow centered): 30% darkening (bright blood moon)
        // NEVER goes to total black - amber always visible
        float umbraDarkeningAmount = mix(0.70, 0.30, totalityFactor);
        float umbraDarkening = umbra * eclipseProgress;

        // Apply base darkening first
        finalColor *= (1.0 - umbraDarkening * umbraDarkeningAmount);

        // PENUMBRA: Lighter darkening (Earth partially blocks sunlight)
        float penumbraDarkening = (penumbra - umbra) * eclipseProgress;
        finalColor *= (1.0 - penumbraDarkening * 0.20);

        // BLOOD MOON COLOR: Applied throughout entire eclipse, not just totality
        // Matches real lunar eclipse behavior - color present at all phases
        // Use totality factor to control BRIGHTNESS, not color presence
        float colorStrength = umbra; // Color appears wherever umbra shadow is present
        vec3 bloodMoonTint = mix(vec3(1.0), eclipseMidtoneColor, colorStrength);
        finalColor *= bloodMoonTint;

        // REALISTIC ECLIPSE PROGRESSION (corrected):
        // Shadow sweeps LEFT → RIGHT but NEVER fully covers moon during partials
        // A bright crescent ALWAYS remains visible (shadow stops before covering moon)
        // Just before totality: shadow nearly covers moon, blood moon glow appears
        // The glow spreads FROM the visible bright crescent INTO the shadowed area
        // During totality: shadow finally covers entire moon, full blood moon

        vec2 pixelPos = vUv - vec2(0.5, 0.5);
        float pixelX = pixelPos.x;

        // THE LIT CRESCENT: Always visible during partial phases
        // During partials, the moon is partially lit (outside umbra)
        // Only during totality does the shadow fully cover the moon

        // Where is the bright crescent? Opposite side from shadow
        // Approaching (shadowX < 0): crescent on RIGHT (positive X)
        // Leaving (shadowX > 0): crescent on LEFT (negative X)
        float crescentSide = -sign(eclipseShadowPos.x);

        // CRESCENT EDGE: Where shadow meets lit surface
        // This is always VISIBLE during partials - never goes to zero
        float umbraEdgeX = eclipseShadowPos.x + (umbraRadius * crescentSide);

        // Distance from this pixel to the lit crescent edge
        // Positive = inside shadow, negative = in lit crescent
        float distFromLitEdge = (pixelX - umbraEdgeX) * crescentSide;

        // GRADIENT: Blood moon glow spreads from the LIT CRESCENT
        // Only pixels INSIDE the shadow get the gradient
        // Gradient is strongest at the umbra edge (where crescent is)
        float crescentGradient = smoothstep(0.5, 0.0, distFromLitEdge);

        // BRIGHTNESS CONTROL: Glow only appears near totality
        // When shadow is far from center: stays dark
        // When shadow approaches center: glow spreads from crescent
        float brightnessControl = umbra * crescentGradient * totalityFactor;

        // During full totality (shadowX ≈ 0), switch to uniform brightness
        brightnessControl = mix(brightnessControl, umbra * totalityFactor, totalityFactor);

        // EMISSIVE GLOW: Blood moon color spreading from crescent
        float glowStrength = mix(0.0, 1.0, brightnessControl);
        vec3 atmosphereGlow = eclipseMidtoneColor * emissiveStrength * glowStrength * umbra;
        finalColor += atmosphereGlow;

        // RIM GLOW: Atmospheric limb brightening
        float limbGlowStrength = mix(0.0, 1.5, brightnessControl);
        float limbGlow = pow(1.0 - rimFactor, 3.0) * umbra;
        vec3 rimColor = mix(eclipseGlowColor, eclipseHighlightColor, 0.5);
        finalColor += rimColor * limbGlow * emissiveStrength * limbGlowStrength;

        // ═══════════════════════════════════════════════════════════════════════════
        // ECLIPSE BLEND LAYERS (Applied AFTER blood moon color)
        // Applied throughout eclipse wherever umbra is present
        // Strength modulated by totality factor for smooth brightness transitions
        // ═══════════════════════════════════════════════════════════════════════════

        // Layer 1: Linear Burn @ 0.634
        if (layer1Enabled > 0.5 && eclipseProgress > 0.1) {
            vec3 blendColor1 = vec3(min(layer1Strength, 1.0));
            int mode1 = int(layer1Mode + 0.5);
            vec3 blended1 = clamp(applyBlendMode(finalColor, blendColor1, mode1), 0.0, 1.0);
            // Apply at FULL strength wherever umbra exists
            finalColor = clamp(mix(finalColor, blended1, umbra), 0.0, 1.0);
        }

        // Layer 2: Multiply @ 3.086 - Brightness enhancement
        if (layer2Enabled > 0.5 && eclipseProgress > 0.1) {
            // Apply full brightness boost wherever umbra exists
            vec3 brightened = clamp(finalColor * min(layer2Strength, 5.0), 0.0, 1.0);
            finalColor = mix(finalColor, brightened, umbra);
        }

        // Layer 3: Hard Light @ 0.351
        if (layer3Enabled > 0.5 && eclipseProgress > 0.1) {
            vec3 blendColor3 = vec3(min(layer3Strength, 1.0));
            int mode3 = int(layer3Mode + 0.5);
            vec3 blended3 = clamp(applyBlendMode(finalColor, blendColor3, mode3), 0.0, 1.0);
            // Apply at FULL strength wherever umbra exists
            finalColor = clamp(mix(finalColor, blended3, umbra), 0.0, 1.0);
        }

        // Layer 4: Manual UI layer
        if (layer4Enabled > 0.5 && eclipseProgress > 0.1) {
            vec3 blendColor4 = vec3(min(layer4Strength, 1.0));
            int mode4 = int(layer4Mode + 0.5);
            vec3 blended4 = clamp(applyBlendMode(finalColor, blendColor4, mode4), 0.0, 1.0);
            finalColor = clamp(mix(finalColor, blended4, umbra), 0.0, 1.0);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // UNIVERSAL BLEND MODE LAYERS (Only applied when eclipse is OFF)
    // These are manual UI-driven color grading tools
    // NOTE: These are DISABLED by default - they're NEVER used since the multiplexer
    // demo doesn't enable them. This section exists for potential future manual control.
    // ═══════════════════════════════════════════════════════════════════════════
    // INTENTIONALLY COMMENTED OUT - these would interfere with eclipse blend layers
    // if (eclipseProgress < 0.001) {
    //     // Layer 1 - manual UI control only
    //     if (layer1Enabled > 0.5) {
    //         vec3 blendColor1 = vec3(layer1Strength);
    //         int mode1 = int(layer1Mode + 0.5);
    //         finalColor = applyBlendMode(finalColor, blendColor1, mode1);
    //     }
    // }

    gl_FragColor = vec4(finalColor, opacity);
}
`;

/**
 * Get moon shader with blend layers
 * @returns {Object} Object with vertexShader and fragmentShader strings
 */
export function getMoonWithBlendLayersShaders() {
    return {
        vertexShader: moonWithBlendLayersVertexShader,
        fragmentShader: moonWithBlendLayersFragmentShader
    };
}
