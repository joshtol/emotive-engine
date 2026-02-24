/**
 * ===========================================================================================
 *  +=o-+  emotive
 *    oo  ENGINE - Instanced Nature Material
 *  +-o=+
 * ===========================================================================================
 *
 * @fileoverview GPU-instanced nature material with organic foliage and bioluminescent effects
 * @module materials/InstancedNatureMaterial
 *
 * Uses per-instance attributes for:
 * - Time-offset animation (each instance has its own local time)
 * - Model selection (merged geometry with multiple nature model variants)
 * - Trail rendering (main + 3 trail copies per logical element)
 * - Spawn/exit fade transitions
 * - Velocity for motion blur
 *
 * ## Master Parameter: growth (0-1)
 *
 * | Growth | Visual                       | Physics           | Example       |
 * |--------|------------------------------|-------------------|---------------|
 * | 0.0    | Bare bark, dormant           | Dry, rigid        | Dead wood     |
 * | 0.5    | Sprouting, partial foliage   | Flexible          | Sapling       |
 * | 1.0    | Full lush canopy             | Dense, vibrant    | Ancient tree  |
 *
 * ## Visual Model: Organic Plant Surface
 *
 * Multiple layers compose the nature aesthetic:
 * 1. Growth-driven base color -- bark brown to lush green via uGrowth
 *    1.5 Vertical gradient -- roots darker, canopy lighter
 * 2. Subsurface translucency -- warm green light through leaf-like surfaces
 * 3. Branching veins -- FBM-derivative dark green veins on body (NOT Voronoi)
 * 4. Hemisphere ambient -- canopy green above, soil brown below
 * 5. Diffuse lighting -- standard NdotL from 3 lights with 0.4 ambient floor
 * 6. Fresnel backlit edge -- bright spring green rim
 * 7. Bioluminescent spots -- sparse cyan-green glow points (~2% of surface)
 * 8. Bloom soft clamp -- body bounded, bio spots exceed for bloom
 *
 * Key difference from earth: nature is ORGANIC. Smooth displacement, warm SSS.
 * Key difference from ice: nature is OPAQUE. NormalBlending, no refraction.
 * NormalBlending with depthWrite:true -- solid organic forms.
 */

import * as THREE from 'three';
import {
    INSTANCED_ATTRIBUTES_VERTEX,
    INSTANCED_ATTRIBUTES_FRAGMENT,
    createInstancedUniforms
} from '../cores/InstancedShaderUtils.js';
import {
    ANIMATION_TYPES,
    CUTOUT_PATTERNS,
    CUTOUT_BLEND,
    CUTOUT_TRAVEL,
    GRAIN_TYPES,
    GRAIN_BLEND,
    ANIMATION_UNIFORMS_FRAGMENT,
    CUTOUT_PATTERN_FUNC_GLSL,
    CUTOUT_GLSL,
    GRAIN_GLSL,
    createAnimationUniforms,
    setShaderAnimation,
    updateAnimationProgress,
    setGestureGlow,
    setGlowScale,
    setCutout,
    resetCutout,
    setGrain,
    resetGrain,
    resetAnimation
} from '../cores/InstancedAnimationCore.js';

// ===========================================================================================
// NATURE DEFAULTS
// ===========================================================================================

const NATURE_DEFAULTS = {
    growth: 0.5,
    intensity: 1.0,
    opacity: 0.85,
    glowScale: 0.1,
    fadeInDuration: 0.2,
    fadeOutDuration: 0.4
};

function lerp(a, b, t) {
    return a + (b - a) * t;
}

// ===========================================================================================
// NOISE GLSL (shared noise functions -- hash, noise, snoise, fbm4, hash2, voronoi2D)
// ===========================================================================================

const NOISE_GLSL = /* glsl */`
// Hash function for noise
float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

// 3D noise
float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    return mix(
        mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
            mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
        mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
            mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
        f.z
    );
}

// Simplex-ish noise (signed, -1 to 1)
float snoise(vec3 p) {
    return noise(p) * 2.0 - 1.0;
}

// FBM with 3 octaves (base color — 4th octave is 6% of signal, sub-pixel on small geometry)
float fbm3(vec3 p) {
    float f = 0.0;
    f += 0.5000 * noise(p); p *= 2.01;
    f += 0.2500 * noise(p); p *= 2.02;
    f += 0.1250 * noise(p);
    return f / 0.8750;
}

// FBM with 4 octaves (branchingVeins — needs full detail for gradient computation)
float fbm4(vec3 p) {
    float f = 0.0;
    f += 0.5000 * noise(p); p *= 2.01;
    f += 0.2500 * noise(p); p *= 2.02;
    f += 0.1250 * noise(p); p *= 2.03;
    f += 0.0625 * noise(p);
    return f / 0.9375;
}

// 2D hash for Voronoi
vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
}

// Voronoi 2D edge-distance for vine/vein patterns
float voronoi2D(vec2 p) {
    vec2 n = floor(p);
    vec2 f = fract(p);

    float d1 = 10.0;
    float d2 = 10.0;

    for (int j = -1; j <= 1; j++) {
        for (int i = -1; i <= 1; i++) {
            vec2 nb = vec2(float(i), float(j));
            vec2 pt = hash2(n + nb) * 0.8 + 0.1 + nb;
            float d = length(f - pt);

            if (d < d1) {
                d2 = d1;
                d1 = d;
            } else if (d < d2) {
                d2 = d;
            }
        }
    }

    return d2 - d1;
}
`;

// ===========================================================================================
// NATURE GLSL (nature-specific shader functions)
// ===========================================================================================

const NATURE_GLSL = /* glsl */`
// Branching vein pattern using FBM-derivative approach.
// Forward differences (3 fbm3) instead of central differences (4 fbm4).
// fbm3 sufficient — 4th octave at 6% weight contributes negligibly to gradient.
float branchingVeins(vec2 p, float scale) {
    vec3 sp = vec3(p * scale, 0.0);

    // Forward differences: base + 2 offsets (was 4 central diff calls)
    float eps = 0.05;
    float base = fbm3(sp);
    float dx = fbm3(sp + vec3(eps, 0.0, 0.0)) - base;
    float dy = fbm3(sp + vec3(0.0, eps, 0.0)) - base;

    // Gradient magnitude
    float gradMag = length(vec2(dx, dy)) / eps;

    // Directional derivative along diagonal for asymmetric branching
    float dirDeriv = abs(dx * 0.7 + dy * 0.7) / eps;

    // Combine: high gradient + directional alignment = vein
    float vein = smoothstep(0.3, 0.8, gradMag) * smoothstep(0.2, 0.6, dirDeriv);

    return vein;
}

// Subsurface scattering approximation for organic translucency.
// Light passes through thin leaf-like geometry, creating a warm glow
// when the light source is behind the surface relative to the viewer.
// pow(dot(-V, L), 4) peaks when V and L are anti-parallel (backlit).
vec3 subsurfaceScatter(vec3 viewDir, vec3 lightDir, float thickness, vec3 leafColor) {
    float scatter = pow(max(0.0, dot(-viewDir, lightDir)), 4.0) * thickness;
    return leafColor * scatter;
}

// Bioluminescent spots -- sparse bright points like fungal glow or fireflies.
// Returns 0.0 for most of the surface, 1.0 for the rare ~2% bright spots.
float bioluminescence(vec3 p) {
    return step(0.98, noise(p * 30.0));
}
`;

// ===========================================================================================
// INSTANCED VERTEX SHADER
// ===========================================================================================

const VERTEX_SHADER = /* glsl */`
// Standard uniforms
uniform float uGlobalTime;
uniform float uFadeInDuration;
uniform float uFadeOutDuration;
uniform float uGrowth;

// Arc visibility uniforms (for vortex effects)
uniform int uAnimationType;
uniform float uArcWidth;
uniform float uArcSpeed;
uniform int uArcCount;
uniform float uArcPhase;
uniform float uGestureProgress;
uniform int uRelayCount;
uniform float uRelayArcWidth;
uniform float uRelayFloor;

// Per-instance attributes
${INSTANCED_ATTRIBUTES_VERTEX}

// Varyings to fragment
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vInstancePosition;
varying vec3 vNormal;
varying vec3 vWorldNormal;
varying vec3 vViewDir;
varying vec3 vViewPosition;
varying float vRandomSeed;
varying float vArcVisibility;
varying float vVerticalGradient;
varying vec2 vUv;

${NOISE_GLSL}

void main() {
    // =====================================================================================
    // INSTANCING: Calculate local time and fade
    // =====================================================================================

    vLocalTime = uGlobalTime - aSpawnTime;

    // Trail instances have delayed local time
    float trailDelay = max(0.0, aTrailIndex) * 0.05;
    float effectiveLocalTime = max(0.0, vLocalTime - trailDelay);

    // Fade in/out controlled by aInstanceOpacity from AnimationState
    float fadeOut = 1.0;
    if (aExitTime > 0.0) {
        float exitElapsed = uGlobalTime - aExitTime;
        fadeOut = 1.0 - clamp(exitElapsed / uFadeOutDuration, 0.0, 1.0);
    }

    // Trail fade
    vTrailFade = aTrailIndex < 0.0 ? 1.0 : (1.0 - (aTrailIndex + 1.0) * 0.25);
    vInstanceAlpha = fadeOut * aInstanceOpacity * vTrailFade;

    // Pass velocity
    vVelocity = aVelocity;

    // =====================================================================================
    // MODEL SELECTION: Scale non-selected models to zero
    // =====================================================================================

    float modelMatch = step(abs(aModelIndex - aSelectedModel), 0.5);
    vec3 selectedPosition = position * modelMatch;
    vec3 selectedNormal = normal * modelMatch;

    // =====================================================================================
    // TRAIL OFFSET: Position trails behind main along velocity
    // =====================================================================================

    vec3 trailOffset = vec3(0.0);
    if (aTrailIndex >= 0.0 && length(aVelocity.xyz) > 0.001) {
        float trailDistance = (aTrailIndex + 1.0) * 0.05;
        trailOffset = -normalize(aVelocity.xyz) * trailDistance * aVelocity.w;
    }

    // =====================================================================================
    // NATURE: Organic flowing displacement
    //
    // Gentle flowing deformation based on sin/cos with time.
    // NOT quantized like ice -- smooth, organic, like breathing plant tissue.
    // Edge factor (1 - NdotV) makes displacement stronger at silhouette edges
    // so the outline undulates like leaves swaying in a breeze.
    // Growth modulates: dormant = rigid, full growth = swaying.
    // =====================================================================================

    vPosition = selectedPosition;
    vRandomSeed = aRandomSeed;
    vUv = uv;

    // Calculate vertical gradient for root-to-canopy effects
    float modelHeight = 1.0;
    vVerticalGradient = clamp((selectedPosition.y + 0.5) / modelHeight, 0.0, 1.0);

    vec3 displaced = selectedPosition;

    if (modelMatch > 0.5 && length(selectedNormal) > 0.1) {
        // Edge factor: displacement stronger at silhouette edges
        vec4 approxWorldPos = modelMatrix * instanceMatrix * vec4(selectedPosition, 1.0);
        vec3 approxViewDir = normalize(cameraPosition - approxWorldPos.xyz);
        vec3 worldNrm = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * selectedNormal);
        float edgeNdotV = abs(dot(worldNrm, approxViewDir));
        float edgeFactor = 1.0 - edgeNdotV; // Linear -- softer than quadratic for organic motion

        // Organic flowing displacement -- sin/cos waves with per-instance phase
        float instancePhase = aRandomSeed * 6.28;
        float displX = sin(selectedPosition.x * 3.0 + uGlobalTime * 0.8 + instancePhase)
                      * cos(selectedPosition.z * 2.5 + uGlobalTime * 0.6 + instancePhase * 0.7);
        float displY = sin(selectedPosition.y * 2.0 + uGlobalTime * 0.5 + instancePhase * 1.3)
                      * 0.5; // Vertical sway is gentler
        float displZ = cos(selectedPosition.z * 2.8 + uGlobalTime * 0.7 + instancePhase * 0.5)
                      * sin(selectedPosition.x * 2.2 + uGlobalTime * 0.9);

        // Growth modulates displacement: dormant = rigid, full growth = swaying
        float growthSway = 0.3 + uGrowth * 0.7;

        vec3 organicDispl = vec3(displX, displY, displZ) * 0.03 * edgeFactor * growthSway;
        displaced += normalize(selectedNormal) * length(organicDispl);
    }

    // Apply trail offset
    displaced += trailOffset;

    // Transform normal with instance matrix
    vNormal = normalMatrix * mat3(instanceMatrix) * selectedNormal;
    // Ensure we use the 0.0 w-component to isolate rotation from scale/translation
    vec3 transformedNormal = (instanceMatrix * vec4(selectedNormal, 0.0)).xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * transformedNormal);

    // =====================================================================================
    // Apply instance matrix for per-instance transforms
    // =====================================================================================
    vec4 instancePosition = instanceMatrix * vec4(displaced, 1.0);

    vec4 worldPos = modelMatrix * instancePosition;
    vWorldPosition = worldPos.xyz;
    vViewDir = normalize(cameraPosition - worldPos.xyz);

    // Instance origin in world space (for trail dissolve)
    vec4 instanceOrigin = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    vInstancePosition = instanceOrigin.xyz;

    // =====================================================================================
    // ARC VISIBILITY (for vortex ring effects)
    // =====================================================================================
    vArcVisibility = 1.0;
    if (aRandomSeed >= 100.0) {
        // Generalized relay: supports arbitrary relay count via uRelayCount
        float encoded = aRandomSeed - 100.0;
        float ringId = floor(encoded / 10.0);
        float instanceArcPhase = encoded - ringId * 10.0;

        float vertexAngle = atan(selectedPosition.y, selectedPosition.x);
        float hw = uRelayArcWidth * 0.5;
        float angleDiff = vertexAngle - instanceArcPhase;
        angleDiff = mod(angleDiff + 3.14159, 6.28318) - 3.14159;
        float arcMask = 1.0 - smoothstep(hw * 0.7, hw, abs(angleDiff));

        float cp = uGestureProgress * float(uRelayCount) * 1.5;
        float d = cp - ringId;
        float relayAlpha = smoothstep(-0.30, 0.05, d) * (1.0 - smoothstep(0.70, 1.05, d));
        vArcVisibility = arcMask * mix(uRelayFloor, 1.0, relayAlpha);
    } else if (uAnimationType == 1) {
        // Standard uniform-based arc masking (natureroot, naturevortex, constrict corset, etc.)
        float vertexAngle = atan(selectedPosition.y, selectedPosition.x);
        float arcAngle = uGestureProgress * uArcSpeed * 6.28318 + uArcPhase + aRandomSeed;
        float halfWidth = uArcWidth * 3.14159;
        float arcSpacing = 6.28318 / float(max(1, uArcCount));

        float maxVis = 0.0;
        for (int i = 0; i < 4; i++) {
            if (i >= uArcCount) break;
            float thisArcAngle = arcAngle + float(i) * arcSpacing;
            float angleDiff = vertexAngle - thisArcAngle;
            angleDiff = mod(angleDiff + 3.14159, 6.28318) - 3.14159;
            float vis = 1.0 - smoothstep(halfWidth * 0.7, halfWidth, abs(angleDiff));
            maxVis = max(maxVis, vis);
        }
        vArcVisibility = maxVis;
    }

    // View-space position
    vec4 mvPosition = modelViewMatrix * instancePosition;
    vViewPosition = mvPosition.xyz;

    gl_Position = projectionMatrix * mvPosition;
}
`;

// ===========================================================================================
// INSTANCED FRAGMENT SHADER
// ===========================================================================================

const FRAGMENT_SHADER = /* glsl */`
uniform float uGlobalTime;
uniform float uGrowth;
uniform float uIntensity;
uniform float uOpacity;
uniform vec3 uTint;
uniform float uGlowIntensity;
uniform float uBloomThreshold;

// Animation system uniforms (glow, cutout, travel, etc.) from shared core
${ANIMATION_UNIFORMS_FRAGMENT}

// Instancing varyings
${INSTANCED_ATTRIBUTES_FRAGMENT}

varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vInstancePosition;
varying vec3 vNormal;
varying vec3 vWorldNormal;
varying vec3 vViewDir;
varying vec3 vViewPosition;
varying float vRandomSeed;
varying float vArcVisibility;
varying float vVerticalGradient;
varying vec2 vUv;

${NOISE_GLSL}
${NATURE_GLSL}
${CUTOUT_PATTERN_FUNC_GLSL}

void main() {
    // Early discard for fully faded instances
    if (vInstanceAlpha < 0.01) discard;

    float localTime = vLocalTime;

    // =====================================================================================
    // NORMALS -- smooth normals hide low-poly faces for organic forms
    //
    // smoothNdotV from interpolated vWorldNormal: hides polygon facets.
    // faceNormal from dFdx/dFdy: kept for specular glint variation.
    // =====================================================================================
    vec3 faceNormal = normalize(cross(dFdx(vWorldPosition), dFdy(vWorldPosition)));
    vec3 viewDir = normalize(vViewDir);

    // World normal with faceforward for DoubleSide geometry
    vec3 worldNormal = normalize(vWorldNormal);

    // Fallback for corrupted/zeroed normal buffer
    if (length(vWorldNormal) < 0.01) {
        worldNormal = viewDir;
    }

    // Flip normal for back faces so dot(N, viewDir) > 0
    worldNormal = faceforward(worldNormal, -viewDir, worldNormal);

    // Smooth NdotV hides polygon facets for organic appearance
    float smoothNdotV = max(0.0, dot(worldNormal, viewDir));
    float fresnel = pow(1.0 - smoothNdotV, 4.0);

    // =====================================================================================
    // 1. GROWTH-DRIVEN BASE COLOR
    //
    // Mix between bark brown (dormant) and lush green (full growth).
    // FBM noise adds organic color variation across the surface.
    // Vertical gradient: roots are darker, canopy is lighter.
    // =====================================================================================

    vec3 barkBrown = vec3(0.15, 0.08, 0.03);   // Dark woody bark
    vec3 lushGreen = vec3(0.20, 0.50, 0.15);   // Rich leaf green

    // Growth-driven base blend
    vec3 baseColor = mix(barkBrown, lushGreen, uGrowth);

    // Organic noise variation -- 2 octaves sufficient for ±15% color variation
    float organicNoise = noise(vPosition * 3.0 + vec3(vRandomSeed * 5.0)) * 0.5
                       + noise(vPosition * 6.03 + vec3(vRandomSeed * 5.0)) * 0.25;
    baseColor *= 0.85 + organicNoise * 0.30; // +/-15% variation

    // Per-instance color shift -- each nature element is unique
    float instanceWarm = fract(vRandomSeed * 4.37) * 2.0 - 1.0;
    baseColor *= vec3(
        1.0 + instanceWarm * 0.06,
        1.0 + instanceWarm * 0.08,
        1.0 - instanceWarm * 0.04
    );

    // Vertical gradient: roots darker, canopy brighter
    float vertGrad = mix(0.7, 1.15, vVerticalGradient);
    baseColor *= vertGrad;

    // =====================================================================================
    // 2. SUBSURFACE TRANSLUCENCY
    //
    // Light passes through thin organic tissue. Three directional lights
    // contribute warm green SSS when behind the surface relative to viewer.
    // Thickness derived from smooth NdotV (like ice approach but for leaf tissue).
    // =====================================================================================

    // Three directional lights (matching other materials)
    vec3 lightDir1 = normalize(vec3(0.5, 1.0, 0.3));
    vec3 lightDir2 = normalize(vec3(-0.4, 0.6, -0.5));
    vec3 lightDir3 = normalize(vec3(0.0, -0.3, 0.8));

    // Thickness: thin at edges (silhouette), thick at center
    float thickness = pow(smoothNdotV, 2.0) * 0.5;

    // Warm transmitted leaf color -- greenish light filtering through tissue
    vec3 leafTransmitColor = vec3(0.15, 0.35, 0.10);

    // SSS from each light (primary strongest, others are fill)
    vec3 sss = vec3(0.0);
    sss += subsurfaceScatter(viewDir, lightDir1, thickness, leafTransmitColor);
    sss += subsurfaceScatter(viewDir, lightDir2, thickness, leafTransmitColor) * 0.6;
    sss += subsurfaceScatter(viewDir, lightDir3, thickness, leafTransmitColor) * 0.3;

    // Growth modulates SSS -- dormant bark has less translucency than leaves
    sss *= 0.3 + uGrowth * 0.7;

    // =====================================================================================
    // 3. SURFACE VEINS (branching pattern)
    //
    // FBM-derivative branching veins on vPosition.xz (GLBs may lack UVs).
    // NOT Voronoi -- uses gradient-based branching for organic vein structures.
    // Dark green veins visible especially at high growth levels.
    // =====================================================================================

    // Skip branchingVeins at low growth — saves 32 noise calls (8× fbm4)
    // At growth < 0.1, vein contribution is negligible on dark bark
    if (uGrowth > 0.1) {
        float veinPattern = branchingVeins(
            vPosition.xz + vec2(vRandomSeed * 3.0),
            4.0
        );

        vec3 veinColor = vec3(0.05, 0.15, 0.02);
        float veinStrength = veinPattern * (0.2 + uGrowth * 0.6);
        baseColor = mix(baseColor, veinColor, veinStrength * 0.4);
    }

    // =====================================================================================
    // 4. HEMISPHERE AMBIENT
    //
    // Sky = leaf canopy green, ground = soil brown.
    // Mixed by worldNormal.y to simulate environment lighting.
    // =====================================================================================

    vec3 envUp = vec3(0.15, 0.22, 0.12);    // Leaf canopy green overhead
    vec3 envDown = vec3(0.06, 0.04, 0.02);  // Soil brown ground bounce
    float skyAmt = worldNormal.y * 0.5 + 0.5;
    vec3 ambient = mix(envDown, envUp, skyAmt);

    // =====================================================================================
    // 5. DIFFUSE LIGHTING
    //
    // Standard NdotL from 3 lights with 0.4 ambient floor.
    // Nature-appropriate warm light colors.
    // =====================================================================================

    float NdotL1 = max(0.0, dot(worldNormal, lightDir1));
    float NdotL2 = max(0.0, dot(worldNormal, lightDir2));
    float NdotL3 = max(0.0, dot(worldNormal, lightDir3));

    // Warm sunlight primary, cooler fill lights
    vec3 lightColor1 = vec3(1.0, 0.95, 0.85);  // Warm sunlight
    vec3 lightColor2 = vec3(0.7, 0.75, 0.85);  // Cool sky fill
    vec3 lightColor3 = vec3(0.5, 0.6, 0.5);    // Green bounce

    vec3 diffuse = lightColor1 * NdotL1 * 0.65
                 + lightColor2 * NdotL2 * 0.22
                 + lightColor3 * NdotL3 * 0.13;

    // Ambient floor prevents pure black shadows
    float diffuseFloor = 0.4;
    float diffuseMag = max(diffuseFloor, NdotL1 * 0.65 + NdotL2 * 0.22 + NdotL3 * 0.13);

    // Compose: base color lit by diffuse + ambient
    vec3 color = baseColor * (ambient + diffuse);

    // Add subsurface scattering on top
    color += sss;

    // =====================================================================================
    // EDGE AMBIENT OCCLUSION
    // Silhouette edges get subtle darkening for depth.
    // =====================================================================================

    float edgeAO = smoothstep(0.0, 0.4, smoothNdotV);
    color *= mix(0.82, 1.0, edgeAO);

    // =====================================================================================
    // 6. FRESNEL (Backlit Leaf Edge)
    //
    // Subtle bright rim suggesting backlit leaf edges.
    // Spring green color, modulated by growth.
    // F0 = 0.04 -- not reflective like ice.
    // Rim glow strengthens when main light is behind the surface.
    // =====================================================================================

    float F0 = 0.04;
    float schlick = F0 + (1.0 - F0) * fresnel;

    // Backlit leaf edge: bright spring green rim
    vec3 rimColor = vec3(0.30, 0.60, 0.15);
    vec3 fresnelContrib = rimColor * fresnel * 0.15 * (0.4 + uGrowth * 0.6);

    // Rim glow is stronger when lit from behind (backlit leaf effect)
    float backLight = max(0.0, dot(-viewDir, lightDir1));
    fresnelContrib *= 0.5 + backLight * 0.5;

    color += fresnelContrib;

    // =====================================================================================
    // SPECULAR -- subtle waxy leaf sheen, not metallic
    // Low power (16) for broad organic gloss. Much subtler than ice.
    // Uses smooth worldNormal for consistent organic highlights.
    // =====================================================================================

    vec3 reflDir = reflect(-viewDir, worldNormal);
    float spec1 = pow(max(dot(reflDir, lightDir1), 0.0), 16.0);
    float spec2 = pow(max(dot(reflDir, lightDir2), 0.0), 16.0) * 0.4;
    float spec3 = pow(max(dot(reflDir, lightDir3), 0.0), 16.0) * 0.2;
    float spec = spec1 + spec2 + spec3;

    // Waxy leaf specular -- very subtle green-white highlight
    vec3 specColor = vec3(0.6, 0.65, 0.55) * spec * 0.12 * (0.3 + uGrowth * 0.7);
    color += specColor;

    // =====================================================================================
    // Apply tint and intensity
    // =====================================================================================

    color *= uTint;
    color *= uIntensity;

    // =====================================================================================
    // 8. BLOOM SOFT CLAMP
    //
    // Cap body brightness before adding bioluminescent features.
    // Body stays under bloom threshold; bio spots and fresnel exceed it.
    // =====================================================================================

    float softCap = uBloomThreshold + 0.35;
    float maxC = max(color.r, max(color.g, color.b));
    if (maxC > softCap) {
        color *= softCap / maxC;
    }

    // =====================================================================================
    // 7. BIOLUMINESCENT SPOTS
    //
    // Sparse ~2% of surface gets bright cyan-green glow points.
    // Only appear at growth > 0.5 (dormant wood has no bioluminescence).
    // Added AFTER soft clamp so they exceed bloom threshold and glow.
    // =====================================================================================

    // Skip bioluminescence at low growth — saves noise + sin when invisible
    // bioGrowthMask = smoothstep(0.4, 0.7, uGrowth) is 0.0 below 0.4
    if (uGrowth > 0.4) {
        float bioSpot = bioluminescence(vPosition + vec3(vRandomSeed * 12.0));
        float bioGrowthMask = smoothstep(0.4, 0.7, uGrowth);
        float bioPulse = 0.7 + 0.3 * sin(
            uGlobalTime * 1.5 + vRandomSeed * 6.28 + vPosition.x * 3.0
        );
        vec3 bioColor = vec3(0.30, 1.00, 0.50) * 1.5;
        color += bioColor * bioSpot * bioGrowthMask * bioPulse;
    }

    // =====================================================================================
    // ALPHA -- Solid organic forms
    //
    // NormalBlending with alpha=1.0 for opaque plant matter.
    // Instance alpha still applies for spawn/exit fades.
    // =====================================================================================

    float alpha = 1.0;

    // Instance fade (spawn/exit)
    alpha *= vInstanceAlpha;
    alpha *= uOpacity;

    // =====================================================================================
    // ARC VISIBILITY (for relay vine + vortex ring effects)
    // =====================================================================================
    // Always apply — vArcVisibility defaults to 1.0 for non-arc instances (no-op).
    // Relay rings compute it via per-instance path; corset rings via uniform path.
    if (vArcVisibility < 0.999) {
        alpha *= vArcVisibility;
        color *= mix(0.3, 1.0, vArcVisibility);
        if (vArcVisibility < 0.05) discard;
    }

    // =====================================================================================
    // CUTOUT EFFECT (shared pattern system from InstancedAnimationCore)
    // =====================================================================================
    ${CUTOUT_GLSL}

    // Apply trail dissolve
    alpha *= trailAlpha;

    // =====================================================================================
    // GRAIN EFFECT (noise texture overlay)
    // =====================================================================================
    ${GRAIN_GLSL}

    // =====================================================================================
    // FINAL OUTPUT
    // =====================================================================================
    if (alpha < 0.01) discard;

    gl_FragColor = vec4(color, alpha);
}
`;

// ===========================================================================================
// MATERIAL FACTORY
// ===========================================================================================

/**
 * Create an instanced procedural nature material
 *
 * @param {Object} options - Configuration options
 * @param {number} [options.growth=0.5] - Master parameter (0=dormant bark, 0.5=sprouting, 1=full canopy)
 * @param {number} [options.intensity=1.0] - Brightness multiplier
 * @param {number} [options.opacity=0.85] - Base opacity
 * @param {number} [options.glowScale=0.1] - Scale for additive glow effects
 * @param {THREE.Color|number} [options.tint=0xffffff] - Color tint
 * @param {number} [options.fadeInDuration=0.2] - Spawn fade duration
 * @param {number} [options.fadeOutDuration=0.4] - Exit fade duration
 * @returns {THREE.ShaderMaterial}
 */
export function createInstancedNatureMaterial(options = {}) {
    const {
        growth = NATURE_DEFAULTS.growth,
        intensity = NATURE_DEFAULTS.intensity,
        opacity = NATURE_DEFAULTS.opacity,
        glowScale = NATURE_DEFAULTS.glowScale,
        tint = 0xffffff,
        fadeInDuration = NATURE_DEFAULTS.fadeInDuration,
        fadeOutDuration = NATURE_DEFAULTS.fadeOutDuration
    } = options;

    // Convert tint to THREE.Color
    const tintColor = tint instanceof THREE.Color ? tint : new THREE.Color(tint);

    const material = new THREE.ShaderMaterial({
        uniforms: {
            // Instancing uniforms
            uGlobalTime: { value: 0 },
            uFadeInDuration: { value: fadeInDuration },
            uFadeOutDuration: { value: fadeOutDuration },
            // Animation uniforms (cutout, glow, etc. from shared core)
            ...createAnimationUniforms(),
            // Override glowScale if provided in options
            uGlowScale: { value: glowScale },
            // Nature uniforms
            uGrowth: { value: growth },
            uIntensity: { value: intensity },
            uOpacity: { value: opacity },
            uTint: { value: tintColor },
            uGlowIntensity: { value: 1.0 },
            uBloomThreshold: { value: 0.65 },
            uRelayCount: { value: 3 },
            uRelayArcWidth: { value: 3.14159 },
            uRelayFloor: { value: 0.0 }
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        depthWrite: true,
        side: THREE.DoubleSide,
        blending: THREE.NormalBlending
    });

    material.userData.growth = growth;
    material.userData.elementalType = 'nature';
    material.userData.isProcedural = true;
    material.userData.isInstanced = true;

    return material;
}

/**
 * Update the global time uniform for instanced nature material.
 * Also handles gesture progress and glow ramping via shared animation system.
 * @param {THREE.ShaderMaterial} material - Instanced nature material
 * @param {number} time - Current global time in seconds
 * @param {number} [gestureProgress=0] - Gesture progress 0-1 (for arc animation)
 */
export function updateInstancedNatureMaterial(material, time, gestureProgress = 0) {
    if (material?.uniforms?.uGlobalTime) {
        material.uniforms.uGlobalTime.value = time;
    }
    updateAnimationProgress(material, gestureProgress);
}

/**
 * Set growth level on existing instanced nature material.
 * Growth controls the visual blend from bark to full foliage.
 * @param {THREE.ShaderMaterial} material - Instanced nature material
 * @param {number} growth - New growth level (0-1)
 */
export function setInstancedNatureGrowth(material, growth) {
    if (!material?.uniforms) return;

    material.uniforms.uGrowth.value = growth;
    material.userData.growth = growth;
}

/**
 * Set tint color on existing instanced nature material.
 * @param {THREE.ShaderMaterial} material - Instanced nature material
 * @param {THREE.Color|number} color - New tint color
 */
export function setInstancedNatureTint(material, color) {
    if (!material?.uniforms?.uTint) return;

    const tintColor = color instanceof THREE.Color ? color : new THREE.Color(color);
    material.uniforms.uTint.value.copy(tintColor);
}

/**
 * Configure gesture-driven glow for nature effects.
 * @param {THREE.ShaderMaterial} material - Instanced nature material
 * @param {Object} config - Glow configuration
 */
export function setInstancedNatureGestureGlow(material, config) {
    setGestureGlow(material, config);
}

/**
 * Configure cutout effect for nature elements.
 * @param {THREE.ShaderMaterial} material - Instanced nature material
 * @param {number|Object} config - Cutout strength (0-1) or config object
 */
export function setInstancedNatureCutout(material, config) {
    setCutout(material, config);
}

/**
 * Set per-mascot bloom threshold for nature elements.
 * Prevents bloom blowout on low-threshold geometries.
 * @param {THREE.ShaderMaterial} material - Instanced nature material
 * @param {number} threshold - Bloom threshold (0.35 for crystal/heart/rough, 0.85 for moon/star)
 */
export function setInstancedNatureBloomThreshold(material, threshold) {
    if (material?.uniforms?.uBloomThreshold) {
        material.uniforms.uBloomThreshold.value = threshold;
    }
}

/**
 * Configure arc visibility animation for vortex effects.
 * Uses the shared animation system from InstancedAnimationCore.
 * @param {THREE.ShaderMaterial} material - Instanced nature material
 * @param {Object} config - Animation config
 */
export const setInstancedNatureArcAnimation = setShaderAnimation;

export function setRelay(material, config) {
    if (!material) return;
    if (config.count !== undefined && material.uniforms?.uRelayCount) {
        material.uniforms.uRelayCount.value = config.count;
    }
    if (config.arcWidth !== undefined && material.uniforms?.uRelayArcWidth) {
        material.uniforms.uRelayArcWidth.value = config.arcWidth;
    }
    if (config.floor !== undefined && material.uniforms?.uRelayFloor) {
        material.uniforms.uRelayFloor.value = config.floor;
    }
}

export function resetRelay(material) {
    if (!material) return;
    if (material.uniforms?.uRelayCount) material.uniforms.uRelayCount.value = 3;
    if (material.uniforms?.uRelayArcWidth) material.uniforms.uRelayArcWidth.value = Math.PI;
    if (material.uniforms?.uRelayFloor) material.uniforms.uRelayFloor.value = 0.0;
}

// Re-export animation types and shared functions for convenience
export {
    ANIMATION_TYPES,
    CUTOUT_PATTERNS,
    CUTOUT_BLEND,
    CUTOUT_TRAVEL,
    GRAIN_TYPES,
    GRAIN_BLEND,
    setShaderAnimation,
    setGestureGlow,
    setGlowScale,
    setCutout,
    resetCutout,
    setGrain,
    resetGrain,
    resetAnimation
};

export default {
    createInstancedNatureMaterial,
    updateInstancedNatureMaterial,
    setInstancedNatureGrowth,
    setInstancedNatureTint,
    setInstancedNatureGestureGlow,
    setInstancedNatureBloomThreshold,
    setInstancedNatureCutout,
    setInstancedNatureArcAnimation,
    setShaderAnimation,
    setGestureGlow,
    setGlowScale,
    setCutout,
    setGrain,
    ANIMATION_TYPES,
    CUTOUT_PATTERNS,
    CUTOUT_BLEND,
    CUTOUT_TRAVEL,
    GRAIN_TYPES,
    GRAIN_BLEND
};
