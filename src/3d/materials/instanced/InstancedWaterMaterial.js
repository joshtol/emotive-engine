/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Instanced Water Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview GPU-instanced water material for element models
 * @module materials/InstancedWaterMaterial
 *
 * Uses per-instance attributes for:
 * - Time-offset animation (each instance has its own local time)
 * - Model selection (merged geometry with multiple water model variants)
 * - Trail rendering (main + 3 trail copies per logical element)
 * - Spawn/exit fade transitions
 * - Velocity for motion blur
 *
 * This material is designed to work with ElementInstancePool for
 * GPU-efficient rendering of many water elements with a single draw call.
 */

import * as THREE from 'three';
import {
    INSTANCED_ATTRIBUTES_VERTEX,
    INSTANCED_ATTRIBUTES_FRAGMENT
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
// ═══════════════════════════════════════════════════════════════════════════════════════
// WATER UTILITIES (inlined from WaterShaderCore.js — single consumer)
// ═══════════════════════════════════════════════════════════════════════════════════════

function lerp3(low, mid, high, t) {
    if (t < 0.5) {
        return low + (mid - low) * (t * 2);
    }
    return mid + (high - mid) * ((t - 0.5) * 2);
}

const WATER_DEFAULTS = {
    turbulence: 0.5,
    intensity: 1.0,
    opacity: 0.85,
    displacementStrength: 0.08,
    flowSpeed: 1.0,
    noiseScale: 3.0,
    edgeFade: 0.15,
    glowScale: 1.0,
    fadeInDuration: 0.3,
    fadeOutDuration: 0.5,
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// WATER GLSL (inlined from WaterShaderCore.js — single consumer)
// ═══════════════════════════════════════════════════════════════════════════════════════

const NOISE_GLSL = /* glsl */`
// Permutation polynomial hash
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

// 3D Simplex noise
float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// Fractal Brownian Motion - 4 octaves for fluid motion
float fbm4(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for (int i = 0; i < 4; i++) {
        value += amplitude * snoise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

// Hash function for Voronoi and bubble patterns
float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

// 3D value noise (trilinear interpolated hash)
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

// Animated 2D Voronoi for caustic ray patterns — sin-free hash, squared distance comparison
vec3 voronoiCaustic(vec2 p, float time) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float d1sq = 10.0, d2sq = 10.0;
    float cell1Hash = 0.0;

    for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
            vec2 nb = vec2(float(x), float(y));
            vec2 cell = i + nb;
            // Sin-free 2D hash
            vec2 ch = fract(vec2(dot(cell, vec2(127.1, 311.7)), dot(cell, vec2(269.5, 183.3))) * 0.0243902);
            ch = fract(ch * (ch + 33.33));
            float h = ch.x;
            float h2 = ch.y;
            vec2 pt = nb + vec2(h, h2) + vec2(
                (fract(time * 0.48 + h) * 2.0 - 1.0) * 0.15,
                (fract(time * 0.40 + h2) * 2.0 - 1.0) * 0.15
            );
            vec2 diff = f - pt;
            float dsq = dot(diff, diff);
            if (dsq < d1sq) { d2sq = d1sq; d1sq = dsq; cell1Hash = h; }
            else if (dsq < d2sq) { d2sq = dsq; }
        }
    }
    return vec3(sqrt(d2sq) - sqrt(d1sq), cell1Hash, 0.0);
}

// Water bubbles with rising animation
vec2 waterBubbles3D(vec3 p, float scale, float density, float time) {
    vec3 sp = p * scale + vec3(0.0, time * 0.3, 0.0);
    vec3 i = floor(sp);
    vec3 f = fract(sp);

    float bright = 0.0;
    float ringDark = 0.0;

    for (int x = 0; x <= 1; x++) {
        for (int y = 0; y <= 1; y++) {
            for (int z = 0; z <= 1; z++) {
                vec3 nb = vec3(float(x), float(y), float(z));
                vec3 cid = i + nb;

                float exists = hash(cid * 1.7 + 3.73);
                if (exists < density) {
                    vec3 center = nb + vec3(
                        hash(cid + 0.37),
                        hash(cid + 1.51),
                        hash(cid + 2.93)
                    ) * 0.6 + 0.2;
                    float r = mix(0.10, 0.25, hash(cid + 4.31));
                    float d = length(f - center);

                    if (d < r) {
                        float nd = d / r;
                        bright += (1.0 - nd * nd) * 0.55;
                        ringDark += smoothstep(0.65, 0.95, nd) * 0.5;
                        vec3 sphereDir = normalize(f - center);
                        bright += pow(max(dot(sphereDir, normalize(vec3(0.3, 0.8, 0.2))), 0.0), 6.0) * 0.2;
                    }
                }
            }
        }
    }
    return vec2(bright, ringDark);
}
`;

const WATER_COLOR_GLSL = /* glsl */`
const vec3 WATER_DEEP = vec3(0.05, 0.15, 0.35);
const vec3 WATER_MID = vec3(0.15, 0.4, 0.6);
const vec3 WATER_BRIGHT = vec3(0.3, 0.6, 0.8);
const vec3 WATER_FOAM = vec3(0.85, 0.92, 1.0);
const vec3 WATER_SUBSURFACE = vec3(0.2, 0.5, 0.7);

vec3 waterColor(float intensity, float turbulence) {
    vec3 color;
    if (intensity < 0.5) {
        color = mix(WATER_DEEP, WATER_MID, intensity * 2.0);
    } else if (intensity < 0.8) {
        color = mix(WATER_MID, WATER_BRIGHT, (intensity - 0.5) * 3.33);
    } else {
        color = mix(WATER_BRIGHT, WATER_FOAM, (intensity - 0.8) * 5.0);
    }
    return color;
}
`;

const WATER_FRAGMENT_CORE = /* glsl */`
    vec3 viewDir = normalize(vViewDir);

    vec3 worldNormal = normalize(vWorldNormal);
    if (length(vWorldNormal) < 0.01) worldNormal = viewDir;
    worldNormal = faceforward(worldNormal, -viewDir, worldNormal);

    float smoothNdotV = max(0.0, dot(worldNormal, viewDir));
    float fresnel = pow(1.0 - smoothNdotV, 3.0);
    float thickness = smoothNdotV * smoothNdotV * 0.5;

    float F0 = 0.02;
    float schlick = F0 + (1.0 - F0) * fresnel;

    vec3 waterBodyColor = vec3(0.05, 0.15, 0.30) * uTint;
    vec3 transmittedLight;
    float bgPresence = 1.0;

    if (uHasBackground == 1) {
        vec2 screenUV = gl_FragCoord.xy / uResolution;

        vec3 I_vs = normalize(vViewPosition);
        vec3 N_vs = faceforward(normalize(vNormal), I_vs, normalize(vNormal));

        vec3 refDir = refract(I_vs, N_vs, 0.75);
        if (length(refDir) < 0.1) refDir = I_vs;
        float physDistortion = 0.04 + thickness * 0.10;
        vec2 physOffset = refDir.xy * physDistortion;

        float rt = uGlobalTime * 0.001;
        vec2 ripple1 = vec2(
            sin(vPosition.x * 8.0 + rt * 4.0) * cos(vPosition.z * 6.0 + rt * 3.0),
            cos(vPosition.x * 7.0 - rt * 3.5) * sin(vPosition.z * 9.0 + rt * 2.5)
        ) * 0.15;
        vec2 ripple2 = vec2(
            sin(vPosition.x * 15.0 - rt * 5.0 + 1.7) * cos(vPosition.z * 12.0 + rt * 4.5),
            cos(vPosition.x * 13.0 + rt * 6.0) * sin(vPosition.z * 16.0 - rt * 3.0)
        ) * 0.08;
        vec2 rippleOffset = (ripple1 + ripple2) * 0.60;

        vec2 totalOffset = physOffset + rippleOffset;

        vec4 bgCenter = texture2D(uBackgroundTexture, clamp(screenUV + totalOffset, 0.0, 1.0));
        bgPresence = smoothstep(0.05, 0.3, bgCenter.a);

        vec3 refractedBg;
        if (bgPresence > 0.1) {
            refractedBg = vec3(
                texture2D(uBackgroundTexture, clamp(screenUV + totalOffset * 0.97, 0.0, 1.0)).r,
                bgCenter.g,
                texture2D(uBackgroundTexture, clamp(screenUV + totalOffset * 1.03, 0.0, 1.0)).b
            );
        } else {
            refractedBg = bgCenter.rgb;
        }

        vec3 skyTint = vec3(0.12, 0.20, 0.30) * uTint;
        vec3 ambientLift = mix(skyTint, vec3(0.03, 0.06, 0.10), bgPresence);
        refractedBg += ambientLift * (vec3(1.0) - refractedBg);

        transmittedLight = mix(refractedBg, waterBodyColor, thickness * 0.15);
    } else {
        vec3 voidColor = vec3(0.08, 0.15, 0.25);
        transmittedLight = mix(voidColor, waterBodyColor, thickness * 0.3);
    }

    vec3 absorptionTint = mix(vec3(1.0), vec3(0.65, 0.85, 1.0), 0.20 + thickness * 0.8);
    transmittedLight *= absorptionTint;

    transmittedLight *= (1.0 - fresnel * 0.08);

    vec2 parallaxDir = viewDir.xz / max(smoothNdotV, 0.25);
    vec2 coarseParallax = parallaxDir * 0.08;
    vec2 fineParallax = parallaxDir * 0.12;

    float breakNoise = noise(vec3(vPosition.xz * 0.4, 0.0));
    float causticMask = smoothstep(0.55, 0.85, breakNoise);

    float causticTime = uGlobalTime * 0.001;

    vec3 coarseCaustic = voronoiCaustic(
        (vPosition.xz + coarseParallax) * 3.0 + vec2(vRandomSeed * 3.0),
        causticTime
    );
    vec3 fineCaustic = voronoiCaustic(
        (vPosition.xz + fineParallax) * 6.0 + vec2(vRandomSeed * 5.7),
        causticTime * 1.3
    );

    float coarseAngle = coarseCaustic.y * 6.28318;
    vec2 coarsePlaneDir = vec2(cos(coarseAngle), sin(coarseAngle));
    float coarseSparkle = abs(dot(coarsePlaneDir, viewDir.xz));
    coarseSparkle = mix(0.1, 1.0, coarseSparkle);

    float fineAngle = fineCaustic.y * 6.28318;
    vec2 finePlaneDir = vec2(cos(fineAngle), sin(fineAngle));
    float fineSparkle = abs(dot(finePlaneDir, viewDir.xz));
    fineSparkle = mix(0.1, 1.0, fineSparkle);

    float coarseBright = 1.0 - smoothstep(0.0, 0.03, coarseCaustic.x);
    float fineBright = 1.0 - smoothstep(0.0, 0.02, fineCaustic.x);

    float causticCombined = (coarseBright * coarseSparkle * 0.6 + fineBright * fineSparkle * 0.4) * causticMask;

    transmittedLight *= 1.0 + causticCombined * 0.04;

    vec3 bubbleParallax = viewDir * 0.08 / max(smoothNdotV, 0.25);
    vec3 bubbleSamplePos = vPosition + bubbleParallax + vec3(vRandomSeed * 10.0);

    float bubbleClusterMask = 0.5 + 0.5 * causticMask;

    vec2 bub = waterBubbles3D(bubbleSamplePos, 20.0, 0.50, uGlobalTime * 0.001);

    float fizz = smoothstep(0.84, 0.90, noise(bubbleSamplePos * 40.0)) * 0.15;

    float bubbleBright = (bub.x + fizz) * bubbleClusterMask;
    float bubbleRing = bub.y * bubbleClusterMask;

    vec3 wetReflDir = reflect(-viewDir, worldNormal);

    float wetSpec1 = pow(max(dot(wetReflDir, normalize(vec3(0.5, 1.0, 0.3))), 0.0), 128.0);
    float wetSpec2 = pow(max(dot(wetReflDir, normalize(vec3(-0.4, 0.8, -0.4))), 0.0), 128.0) * 0.7;
    float wetSpec3 = pow(max(dot(wetReflDir, normalize(vec3(-0.3, 0.6, 0.7))), 0.0), 96.0) * 0.5;
    float wetSpec4 = pow(max(dot(wetReflDir, normalize(vec3(0.2, 0.9, -0.3))), 0.0), 160.0) * 0.4;
    float broadSpec = (wetSpec1 + wetSpec2 + wetSpec3 + wetSpec4) * 1.5;

    float spark1 = pow(max(dot(wetReflDir, normalize(vec3(0.5, 1.0, 0.3))), 0.0), 512.0);
    float spark2 = pow(max(dot(wetReflDir, normalize(vec3(-0.3, 0.9, 0.4))), 0.0), 512.0) * 0.6;
    float spark3 = pow(max(dot(wetReflDir, normalize(vec3(0.4, 0.7, -0.5))), 0.0), 384.0) * 0.4;

    float sparkleAnim = noise(vPosition * 8.0 + vec3(localTime * 0.004));

    float sharpSpec = (spark1 + spark2 + spark3) * sparkleAnim * 3.0 * uSparkleIntensity;

    vec3 specContrib = vec3(0.85, 0.92, 1.0) * (broadSpec + sharpSpec);

    vec3 color = transmittedLight;

    float softCap = uBloomThreshold + 0.40;
    float maxChannel = max(color.r, max(color.g, color.b));
    if (maxChannel > softCap) {
        color *= softCap / maxChannel;
    }

    color += specContrib;
    color += vec3(0.80, 0.85, 0.92) * bubbleBright * 0.35;
    color -= vec3(0.05, 0.04, 0.02) * bubbleRing;

    float edgeAlpha = smoothstep(0.08, 0.60, smoothNdotV) * 0.25;
    float skyAlpha = mix(0.25, 1.0, bgPresence);
    float alpha = edgeAlpha * skyAlpha;
`;

const WATER_ARC_FOAM_GLSL = /* glsl */`
    float arcEdgeFoam = smoothstep(0.5, 0.85, vArcVisibility) * (1.0 - smoothstep(0.85, 1.0, vArcVisibility));
    float leadingFoam = smoothstep(0.0, 0.3, vArcVisibility) * (1.0 - smoothstep(0.3, 0.5, vArcVisibility));
    float totalFoam = max(arcEdgeFoam, leadingFoam * 0.7);

    float foamShimmer = 0.8 + 0.2 * sin(localTime * 0.005 + vPosition.x * 10.0);
    color = mix(color, WATER_FOAM * foamShimmer, totalFoam * 0.35);

    float arcEdgeIntensity = 1.0 - vArcVisibility;
    vec3 edgeGlow = WATER_FOAM * (0.8 + 0.15 * uGlowScale);
    color = mix(color, edgeGlow, arcEdgeIntensity * 0.2 * uGlowScale);

    color += arcEdgeIntensity * vec3(0.1, 0.2, 0.25) * 0.3 * uGlowScale;

    alpha = mix(alpha, min(1.0, alpha + 0.3), totalFoam);

    alpha = mix(alpha, min(1.0, alpha + 0.15), arcEdgeIntensity * 0.4);
`;

const WATER_CUTOUT_FOAM_GLSL = /* glsl */`
    if (uCutoutStrength > 0.01 && finalCutout < 0.99) {
        float cutoutThreshold = 0.5;

        float nearEdge = smoothstep(cutoutThreshold, cutoutThreshold + 0.15, finalCutout);
        float farEdge = smoothstep(cutoutThreshold + 0.3, cutoutThreshold + 0.5, finalCutout);

        float innerRim = nearEdge * (1.0 - smoothstep(cutoutThreshold + 0.15, cutoutThreshold + 0.25, finalCutout));

        float outerGlow = nearEdge * (1.0 - farEdge) * 0.4;

        float foamSparkle = sin(localTime * 0.008 + vPosition.x * 15.0 + vPosition.z * 12.0) * 0.5 + 0.5;
        foamSparkle *= sin(localTime * 0.006 - vPosition.y * 18.0) * 0.5 + 0.5;
        foamSparkle = pow(foamSparkle, 3.0) * innerRim;

        color = mix(color, WATER_FOAM * 0.9, innerRim * uCutoutStrength * 0.3);
        color = mix(color, WATER_BRIGHT * 0.8, outerGlow * uCutoutStrength * 0.2);
        color = mix(color, vec3(1.0), foamSparkle * uCutoutStrength * uSparkleIntensity * 0.15);
    }
`;

const WATER_DRIP_ANTICIPATION_GLSL = /* glsl */`
    // Hash-based noise instead of snoise — these just drive threshold masks
    float dripHash1 = noise(vPosition * 8.0 + vec3(12.34, 56.78, 90.12)) * 2.0 - 1.0;
    float dripHash2 = noise(vPosition * 8.0 + vec3(98.76, 54.32, 10.98)) * 2.0 - 1.0;
    float dripHash3 = noise(vPosition * 6.0 + vec3(45.67, 23.45, 67.89)) * 2.0 - 1.0;

    float dripPoint1 = smoothstep(0.65, 0.85, dripHash1);
    float dripPoint2 = smoothstep(0.7, 0.88, dripHash2);
    float dripPoint3 = smoothstep(0.72, 0.9, dripHash3);

    float dripPhase1 = localTime * 0.003 + dripHash1 * 6.28318;
    float dripPhase2 = localTime * 0.0025 + dripHash2 * 6.28318;
    float dripPhase3 = localTime * 0.002 + dripHash3 * 6.28318;

    float dripPulse1 = pow(fract(dripPhase1 * 0.15), 3.0);
    float dripPulse2 = pow(fract(dripPhase2 * 0.12), 3.0);
    float dripPulse3 = pow(fract(dripPhase3 * 0.1), 2.5);

    float dripFlash1 = smoothstep(0.85, 0.95, dripPulse1) * (1.0 - smoothstep(0.95, 1.0, dripPulse1));
    float dripFlash2 = smoothstep(0.85, 0.95, dripPulse2) * (1.0 - smoothstep(0.95, 1.0, dripPulse2));
    float dripFlash3 = smoothstep(0.88, 0.96, dripPulse3) * (1.0 - smoothstep(0.96, 1.0, dripPulse3));

    float tensionBulge1 = smoothstep(0.5, 0.85, dripPulse1) * dripPoint1;
    float tensionBulge2 = smoothstep(0.5, 0.85, dripPulse2) * dripPoint2;
    float tensionBulge = (tensionBulge1 + tensionBulge2) * 0.5;

    float dripIntensity = dripPoint1 * (dripPulse1 * 0.35 + dripFlash1 * 0.65)
                        + dripPoint2 * (dripPulse2 * 0.35 + dripFlash2 * 0.65)
                        + dripPoint3 * (dripPulse3 * 0.3 + dripFlash3 * 0.7);

    float flashTotal = dripFlash1 + dripFlash2 + dripFlash3;
    vec3 dripColor = mix(WATER_BRIGHT, WATER_FOAM, min(1.0, flashTotal));

    float rainbowPhase = localTime * 0.002 + vPosition.x * 5.0;
    vec3 rainbowTint = vec3(
        0.5 + 0.5 * sin(rainbowPhase),
        0.5 + 0.5 * sin(rainbowPhase + 2.094),
        0.5 + 0.5 * sin(rainbowPhase + 4.189)
    );
    dripColor = mix(dripColor, dripColor * rainbowTint, flashTotal * 0.15);

    color += dripIntensity * dripColor * 0.15 * uGlowScale;

    color += tensionBulge * WATER_BRIGHT * 0.10;
`;

const WATER_FLOOR_AND_DISCARD_GLSL = /* glsl */`
    if (alpha < 0.1) discard;
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// INSTANCED VERTEX SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════

const VERTEX_SHADER = /* glsl */`
// Standard uniforms
uniform float uGlobalTime;
uniform float uFadeInDuration;
uniform float uFadeOutDuration;
uniform float uTurbulence;
uniform float uDisplacementStrength;
uniform float uFlowSpeed;

// Arc visibility uniforms (for vortex effects)
uniform int uAnimationType;      // 0=none, 1=rotating arc
uniform float uArcWidth;         // Arc width in radians
uniform float uArcSpeed;         // Rotations per gesture
uniform int uArcCount;           // Number of visible arcs
uniform float uArcPhase;         // Arc starting angle in radians
uniform float uGestureProgress;  // 0-1 gesture progress
uniform int uRelayCount;         // Number of relay rings
uniform float uRelayArcWidth;   // Relay arc width in radians
uniform float uRelayFloor;

// Per-instance attributes
${INSTANCED_ATTRIBUTES_VERTEX}

// Varyings to fragment
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vInstancePosition;  // Instance origin in world space (for trail dissolve)
varying vec3 vNormal;
varying vec3 vViewDir;
varying float vDisplacement;
varying float vNoiseValue;
varying float vRandomSeed;
varying float vArcVisibility;  // 0-1 visibility based on arc position
varying float vVerticalGradient;  // Normalized vertical position (0=bottom, 1=top) for tip effects
varying vec3 vWorldNormal;   // World-space normal for refraction
varying vec3 vViewPosition;  // View-space position for refraction

${NOISE_GLSL}

void main() {
    // ═══════════════════════════════════════════════════════════════════════════════
    // INSTANCING: Calculate local time and fade
    // ═══════════════════════════════════════════════════════════════════════════════

    vLocalTime = uGlobalTime - aSpawnTime;

    // Trail instances have delayed local time
    float trailDelay = max(0.0, aTrailIndex) * 0.05;
    float effectiveLocalTime = max(0.0, vLocalTime - trailDelay);

    // Fade in/out controlled by aInstanceOpacity from AnimationState
    float fadeIn = 1.0;
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

    // ═══════════════════════════════════════════════════════════════════════════════
    // MODEL SELECTION: Scale non-selected models to zero
    // ═══════════════════════════════════════════════════════════════════════════════

    float modelMatch = step(abs(aModelIndex - aSelectedModel), 0.5);
    vec3 selectedPosition = position * modelMatch;
    vec3 selectedNormal = normal * modelMatch;

    // ═══════════════════════════════════════════════════════════════════════════════
    // TRAIL OFFSET: Position trails behind main along velocity
    // ═══════════════════════════════════════════════════════════════════════════════

    vec3 trailOffset = vec3(0.0);
    if (aTrailIndex >= 0.0 && length(aVelocity.xyz) > 0.001) {
        float trailDistance = (aTrailIndex + 1.0) * 0.05;
        trailOffset = -normalize(aVelocity.xyz) * trailDistance * aVelocity.w;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // WATER DISPLACEMENT (using local time)
    // ═══════════════════════════════════════════════════════════════════════════════

    vPosition = selectedPosition;
    vRandomSeed = aRandomSeed;

    // Calculate vertical gradient for tip-based effects
    // Normalize Y position to 0-1 range (assuming model centered at y=0)
    float modelHeight = 1.0;  // Water models are typically unit-sized
    vVerticalGradient = clamp((selectedPosition.y + 0.5) / modelHeight, 0.0, 1.0);

    // Animated noise for fluid wobble
    float instanceVariation = aRandomSeed * 0.3;
    vec3 noisePos = selectedPosition * 2.5 + vec3(
        effectiveLocalTime * uFlowSpeed * 0.002 + instanceVariation,
        effectiveLocalTime * uFlowSpeed * 0.001,
        effectiveLocalTime * uFlowSpeed * 0.0015 + instanceVariation
    );
    float noiseValue = fbm4(noisePos);
    vNoiseValue = noiseValue * 0.5 + 0.5;

    // Position-based variation for asymmetric wobble
    float posVariation = snoise(selectedPosition * 3.0 + vec3(aRandomSeed * 10.0)) * 0.4 + 0.8;

    // Primary displacement along normal (fluid bulging)
    float fadeFactor = fadeOut * aInstanceOpacity;
    float baseDisplacement = noiseValue * uDisplacementStrength * (0.4 + uTurbulence * 0.6) * posVariation;

    vec3 displaced = selectedPosition + selectedNormal * baseDisplacement * fadeFactor;

    // Secondary wobble - perpendicular fluid motion
    vec3 perpNoise = selectedPosition * 2.0 + vec3(
        effectiveLocalTime * uFlowSpeed * 0.001,
        effectiveLocalTime * uFlowSpeed * 0.0008,
        0.0
    );
    float wobbleX = snoise(perpNoise + vec3(50.0, 0.0, 0.0)) * uDisplacementStrength * uTurbulence * 0.5 * fadeFactor;
    float wobbleY = snoise(perpNoise + vec3(0.0, 50.0, 0.0)) * uDisplacementStrength * uTurbulence * 0.3 * fadeFactor;
    float wobbleZ = snoise(perpNoise + vec3(0.0, 0.0, 50.0)) * uDisplacementStrength * uTurbulence * 0.5 * fadeFactor;
    displaced.x += wobbleX;
    displaced.y += wobbleY;
    displaced.z += wobbleZ;

    // ═══════════════════════════════════════════════════════════════════════════
    // ANIMATED SURFACE WAVES — visible undulation of the water surface
    // Two frequency layers: broad swells + fine ripples.
    // The analytical gradient perturbs the normal so specular and refraction
    // react to the wave shapes, not just the flat polygon normal.
    // ═══════════════════════════════════════════════════════════════════════════
    float wt = uGlobalTime * 0.001;

    // Broad swells (5 cycles across model, slow drift)
    float wave1 = sin(selectedPosition.x * 5.0 + wt * 3.0)
                * cos(selectedPosition.z * 4.0 + wt * 2.0);
    // Fine ripples (12 cycles, faster counter-drift)
    float wave2 = sin(selectedPosition.x * 12.0 - wt * 4.0)
                * cos(selectedPosition.z * 9.0 + wt * 3.5);

    float waveDispl = (wave1 * 0.07 + wave2 * 0.03) * fadeFactor;
    displaced += selectedNormal * waveDispl;

    // Analytical gradient: dh/dx and dh/dz for normal perturbation
    // Normal perturbation amplified 3x beyond displacement — strong refraction waviness
    // without moving geometry enough to create spikes on low-poly mesh
    float normalBoost = 1.5;
    float dwdx = (5.0  * cos(selectedPosition.x * 5.0  + wt * 3.0) * cos(selectedPosition.z * 4.0 + wt * 2.0) * 0.07
               +  12.0 * cos(selectedPosition.x * 12.0 - wt * 4.0) * cos(selectedPosition.z * 9.0 + wt * 3.5) * 0.03) * normalBoost;
    float dwdz = (-4.0 * sin(selectedPosition.x * 5.0  + wt * 3.0) * sin(selectedPosition.z * 4.0 + wt * 2.0) * 0.07
               +  -9.0 * sin(selectedPosition.x * 12.0 - wt * 4.0) * sin(selectedPosition.z * 9.0 + wt * 3.5) * 0.03) * normalBoost;

    // Perturbed normal: standard height-field approximation N' = normalize(N - gradient)
    vec3 waveNormal = normalize(selectedNormal - vec3(dwdx, 0.0, dwdz) * fadeFactor);

    // Apply trail offset
    displaced += trailOffset;

    vDisplacement = baseDisplacement;

    // Transform wave-perturbed normal with instance matrix
    vNormal = normalMatrix * mat3(instanceMatrix) * waveNormal;

    // ═══════════════════════════════════════════════════════════════════════════════
    // Apply instance matrix for per-instance transforms
    // ═══════════════════════════════════════════════════════════════════════════════
    vec4 instancePosition = instanceMatrix * vec4(displaced, 1.0);

    vec4 worldPos = modelMatrix * instancePosition;
    vWorldPosition = worldPos.xyz;
    vViewDir = normalize(cameraPosition - worldPos.xyz);

    // Instance origin in world space (for trail dissolve - uses cutout at instance floor)
    vec4 instanceOrigin = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    vInstancePosition = instanceOrigin.xyz;

    // ═══════════════════════════════════════════════════════════════════════════════
    // ARC VISIBILITY (for vortex ring effects)
    // ═══════════════════════════════════════════════════════════════════════════════
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
        // Calculate angle of this vertex in local XZ plane
        float vertexAngle = atan(selectedPosition.z, selectedPosition.x);

        // Arc center rotates based on gesture progress + per-instance phase offset
        // aRandomSeed stores the arc phase (rotationOffset) for vortex effects
        float arcAngle = uGestureProgress * uArcSpeed * 6.28318 + uArcPhase;

        // Calculate arc visibility
        float halfWidth = uArcWidth * 3.14159;  // Convert to radians
        float arcSpacing = 6.28318 / float(max(1, uArcCount));

        float maxVis = 0.0;
        for (int i = 0; i < 4; i++) {
            if (i >= uArcCount) break;
            float thisArcAngle = arcAngle + float(i) * arcSpacing;

            // Distance from vertex angle to arc center (wrapping around 2PI)
            float angleDiff = vertexAngle - thisArcAngle;
            angleDiff = mod(angleDiff + 3.14159, 6.28318) - 3.14159;  // Wrap to -PI to PI

            // Smooth visibility falloff at arc edges
            float vis = 1.0 - smoothstep(halfWidth * 0.7, halfWidth, abs(angleDiff));
            maxVis = max(maxVis, vis);
        }
        vArcVisibility = maxVis;
    }

    // World-space normal for refraction (wave-perturbed)
    vec3 transformedNormal = (instanceMatrix * vec4(waveNormal, 0.0)).xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * transformedNormal);

    // View-space position for refraction
    vec4 mvPosition = modelViewMatrix * instancePosition;
    vViewPosition = mvPosition.xyz;

    gl_Position = projectionMatrix * mvPosition;
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// INSTANCED FRAGMENT SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════

const FRAGMENT_SHADER = /* glsl */`
uniform float uGlobalTime;
uniform float uTurbulence;
uniform float uIntensity;
uniform float uOpacity;
uniform float uFlowSpeed;
uniform float uNoiseScale;
uniform float uEdgeFade;
uniform float uBloomThreshold;  // Mascot-specific bloom threshold for compression
uniform vec3 uTint;

// Enhanced water system uniforms
uniform float uDepthGradient;      // Depth-based color variation strength (0=off, 1=full)
uniform float uInternalFlowSpeed;  // Internal spiral/flow animation speed multiplier
uniform float uSparkleIntensity;   // Specular sparkle highlight intensity

// Screen-space refraction uniforms
uniform sampler2D uBackgroundTexture;
uniform vec2 uResolution;
uniform int uHasBackground;

// Animation system uniforms (glow, cutout, travel, etc.) from shared core
${ANIMATION_UNIFORMS_FRAGMENT}

// Instancing varyings
${INSTANCED_ATTRIBUTES_FRAGMENT}

varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vInstancePosition;  // Instance origin in world space (for trail dissolve)
varying vec3 vNormal;
varying vec3 vViewDir;
varying float vDisplacement;
varying float vNoiseValue;
varying float vRandomSeed;
varying float vArcVisibility;
varying float vVerticalGradient;
varying vec3 vWorldNormal;
varying vec3 vViewPosition;

${NOISE_GLSL}
${WATER_COLOR_GLSL}
${CUTOUT_PATTERN_FUNC_GLSL}

void main() {
    // Early discard for fully faded instances
    if (vInstanceAlpha < 0.01) discard;

    // Use local time for animation
    float localTime = vLocalTime;

    // ═══════════════════════════════════════════════════════════════════════════════
    // CORE WATER EFFECTS (from WaterShaderCore)
    // Includes: patterns, caustics, fresnel, subsurface, specular, depth variation
    // ═══════════════════════════════════════════════════════════════════════════════
    ${WATER_FRAGMENT_CORE}

    // Apply instance alpha (NormalBlending uses alpha for fade, no color pre-multiply)
    alpha *= vInstanceAlpha;

    // ═══════════════════════════════════════════════════════════════════════════════
    // ARC VISIBILITY (for vortex effects)
    // ═══════════════════════════════════════════════════════════════════════════════
    if (uAnimationType == 1) {
        // Apply arc foam effect at edges (uniform-based arc only)
        ${WATER_ARC_FOAM_GLSL}
    }
    // Apply arc visibility (for vortex/relay effects)
    if (vArcVisibility < 0.999) {
        alpha *= vArcVisibility;
        color *= mix(0.3, 1.0, vArcVisibility);
        if (vArcVisibility < 0.05) discard;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // CUTOUT EFFECT (shared pattern system from InstancedAnimationCore)
    // ═══════════════════════════════════════════════════════════════════════════════
    ${CUTOUT_GLSL}

    // Apply trail dissolve alpha (smooth fade at instance bottom - no hard edge)
    // With AdditiveBlending: only fade ALPHA, keep color bright
    // result = color * alpha + background
    // If color is bright and alpha is low, we get a dim ADDITIVE contribution
    // If color is dark and alpha is low, we get nearly nothing (but no darkening either)
    alpha *= trailAlpha;

    // ═══════════════════════════════════════════════════════════════════════════════
    // WATER CUTOUT FOAM (brightens edges to prevent dark artifacts)
    // ═══════════════════════════════════════════════════════════════════════════════
    ${WATER_CUTOUT_FOAM_GLSL}

    // ═══════════════════════════════════════════════════════════════════════════════
    // GRAIN EFFECT (noise texture overlay for gritty realism)
    // ═══════════════════════════════════════════════════════════════════════════════
    ${GRAIN_GLSL}

    // ═══════════════════════════════════════════════════════════════════════════════
    // DRIP ANTICIPATION (surface tension bright spots)
    // ═══════════════════════════════════════════════════════════════════════════════
    ${WATER_DRIP_ANTICIPATION_GLSL}

    // ═══════════════════════════════════════════════════════════════════════════════
    // FINAL OUTPUT
    // ═══════════════════════════════════════════════════════════════════════════════
    ${WATER_FLOOR_AND_DISCARD_GLSL}

    gl_FragColor = vec4(color, alpha);
}
`;

// Helper functions and defaults are imported from WaterShaderCore.js

// ═══════════════════════════════════════════════════════════════════════════════════════
// MATERIAL FACTORY
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Create an instanced procedural water material
 *
 * @param {Object} options - Configuration options
 * @param {number} [options.turbulence=0.5] - Water turbulence (0=calm, 0.5=flow, 1=storm)
 * @param {number} [options.intensity=1.0] - Brightness multiplier
 * @param {number} [options.opacity=0.85] - Base opacity
 * @param {number} [options.displacementStrength=0.08] - Vertex displacement amount
 * @param {number} [options.flowSpeed=1.0] - Flow animation speed
 * @param {number} [options.noiseScale=3.0] - Noise detail level
 * @param {number} [options.edgeFade=0.15] - Soft edge fade distance
 * @param {number} [options.glowScale=1.0] - Scale for additive glow effects (0=off, 1=full)
 * @param {THREE.Color|number} [options.tint=0xffffff] - Color tint
 * @param {number} [options.fadeInDuration=0.3] - Spawn fade duration
 * @param {number} [options.fadeOutDuration=0.5] - Exit fade duration
 * @returns {THREE.ShaderMaterial}
 */
export function createInstancedWaterMaterial(options = {}) {
    const {
        turbulence = WATER_DEFAULTS.turbulence,
        intensity = null,
        opacity = WATER_DEFAULTS.opacity,
        displacementStrength = null,
        flowSpeed = null,
        noiseScale = WATER_DEFAULTS.noiseScale,
        edgeFade = WATER_DEFAULTS.edgeFade,
        glowScale = WATER_DEFAULTS.glowScale,
        tint = 0xffffff,
        fadeInDuration = WATER_DEFAULTS.fadeInDuration,
        fadeOutDuration = WATER_DEFAULTS.fadeOutDuration
    } = options;

    // Derive values from turbulence if not explicitly set
    const finalIntensity = intensity ?? lerp3(0.8, 1.0, 1.2, turbulence);
    const finalDisplacement = displacementStrength ?? lerp3(0.06, 0.1, 0.15, turbulence);
    const finalFlowSpeed = flowSpeed ?? lerp3(0.8, 1.5, 3.0, turbulence);

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
            // Relay arc uniforms
            uRelayCount: { value: 3 },
            uRelayArcWidth: { value: 3.14159 },
            uRelayFloor: { value: 0.0 },
            // Override glowScale if provided in options
            uGlowScale: { value: glowScale },
            // Water uniforms
            uTurbulence: { value: turbulence },
            uIntensity: { value: finalIntensity },
            uOpacity: { value: opacity },
            uDisplacementStrength: { value: finalDisplacement },
            uFlowSpeed: { value: finalFlowSpeed },
            uNoiseScale: { value: noiseScale },
            uEdgeFade: { value: edgeFade },
            uBloomThreshold: { value: 0.5 },  // Mascot bloom threshold (0.35 crystal, 0.85 moon)
            uTint: { value: tintColor },
            // Enhanced water system uniforms
            uDepthGradient: { value: 0.3 },      // Depth color variation
            uInternalFlowSpeed: { value: 1.0 },  // Internal flow speed multiplier
            uSparkleIntensity: { value: 0.4 },   // Specular sparkle intensity
            // Screen-space refraction
            uBackgroundTexture: { value: null },
            uResolution: { value: new THREE.Vector2(1, 1) },
            uHasBackground: { value: 0 }
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
    });

    material.userData.turbulence = turbulence;
    material.userData.elementalType = 'water';
    material.userData.isProcedural = true;
    material.userData.isInstanced = true;
    material.userData.needsRefraction = true;

    return material;
}

/**
 * Update the global time uniform for instanced water material
 * Also handles gesture progress and glow ramping via shared animation system
 * @param {THREE.ShaderMaterial} material - Instanced water material
 * @param {number} time - Current global time in seconds
 * @param {number} [gestureProgress=0] - Gesture progress 0-1 (for arc animation)
 */
export function updateInstancedWaterMaterial(material, time, gestureProgress = 0) {
    if (material?.uniforms?.uGlobalTime) {
        material.uniforms.uGlobalTime.value = time;
    }
    // Use shared animation system for gesture progress and glow ramping
    updateAnimationProgress(material, gestureProgress);
}

/**
 * Set turbulence on existing instanced water material
 * @param {THREE.ShaderMaterial} material - Instanced water material
 * @param {number} turbulence - New turbulence (0-1)
 */
export function setInstancedWaterTurbulence(material, turbulence) {
    if (!material?.uniforms) return;

    material.uniforms.uTurbulence.value = turbulence;
    material.uniforms.uIntensity.value = lerp3(0.8, 1.0, 1.2, turbulence);
    material.uniforms.uDisplacementStrength.value = lerp3(0.06, 0.1, 0.15, turbulence);
    material.uniforms.uFlowSpeed.value = lerp3(0.8, 1.5, 3.0, turbulence);
    material.userData.turbulence = turbulence;
}

/**
 * Set tint color on existing instanced water material
 * @param {THREE.ShaderMaterial} material - Instanced water material
 * @param {THREE.Color|number} color - New tint color
 */
export function setInstancedWaterTint(material, color) {
    if (!material?.uniforms?.uTint) return;

    const tintColor = color instanceof THREE.Color ? color : new THREE.Color(color);
    material.uniforms.uTint.value.copy(tintColor);
}

/**
 * Set glow scale for additive glow effects (rim, inner glow, bloom hints)
 * Use lower values (0.3-0.5) for crystal mascot, higher (1.0+) for moon/meditation
 * Convenience wrapper around shared setGlowScale from InstancedAnimationCore
 * @param {THREE.ShaderMaterial} material - Instanced water material
 * @param {number} scale - Glow scale (0=off, 1=full, >1=bloom-heavy)
 */
export function setInstancedWaterGlowScale(material, scale) {
    setGlowScale(material, scale);
}

/**
 * Configure gesture-driven glow ramping for water effects.
 * Convenience wrapper around shared setGestureGlow from InstancedAnimationCore
 * @param {THREE.ShaderMaterial} material - Instanced water material
 * @param {Object} config - Glow configuration (see InstancedAnimationCore.setGestureGlow)
 */
export function setInstancedWaterGestureGlow(material, config) {
    setGestureGlow(material, config);
}

/**
 * Set the bloom threshold for brightness compression.
 * Should match the mascot's bloom threshold to prevent blowout.
 * @param {THREE.ShaderMaterial} material - Instanced water material
 * @param {number} threshold - Bloom threshold (0.35 for crystal/heart/rough, 0.85 for moon/star)
 */
export function setInstancedWaterBloomThreshold(material, threshold) {
    if (material?.uniforms?.uBloomThreshold) {
        material.uniforms.uBloomThreshold.value = threshold;
    }
}

/**
 * Configure cutout effect for water elements.
 * Uses the shared cutout system from InstancedAnimationCore.
 *
 * @example
 * // Simple: just set strength (uses default CELLULAR_STREAKS pattern)
 * setInstancedWaterCutout(material, 0.8);
 *
 * @example
 * // Waves pattern for interference effects
 * setInstancedWaterCutout(material, { strength: 0.7, pattern: CUTOUT_PATTERNS.WAVES });
 *
 * @param {THREE.ShaderMaterial} material - Instanced water material
 * @param {number|Object} config - Cutout strength (0-1) or config object
 */
export function setInstancedWaterCutout(material, config) {
    setCutout(material, config);
}

/**
 * Configure arc visibility animation for vortex effects
 * Now uses the shared animation system from InstancedAnimationCore.
 * @param {THREE.ShaderMaterial} material - Instanced water material
 * @param {Object} config - Animation config (see setShaderAnimation)
 */
export const setInstancedWaterArcAnimation = setShaderAnimation;

/**
 * Set depth gradient intensity for water depth color variation.
 * Higher values make the center-to-edge color transition more pronounced.
 * @param {THREE.ShaderMaterial} material - Instanced water material
 * @param {number} intensity - Depth gradient intensity (0=off, 0.3=subtle, 1=full)
 */
export function setInstancedWaterDepthGradient(material, intensity) {
    if (material?.uniforms?.uDepthGradient) {
        material.uniforms.uDepthGradient.value = intensity;
    }
}

/**
 * Set internal flow animation speed for spiral/current effects.
 * @param {THREE.ShaderMaterial} material - Instanced water material
 * @param {number} speed - Flow speed multiplier (0.5=slow, 1.0=normal, 2.0=fast)
 */
export function setInstancedWaterFlowSpeed(material, speed) {
    if (material?.uniforms?.uInternalFlowSpeed) {
        material.uniforms.uInternalFlowSpeed.value = speed;
    }
}

/**
 * Set sparkle intensity for specular highlights and caustic sparkles.
 * @param {THREE.ShaderMaterial} material - Instanced water material
 * @param {number} intensity - Sparkle intensity (0=off, 0.4=normal, 1.0=high)
 */
export function setInstancedWaterSparkle(material, intensity) {
    if (material?.uniforms?.uSparkleIntensity) {
        material.uniforms.uSparkleIntensity.value = intensity;
    }
}

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
export { ANIMATION_TYPES, CUTOUT_PATTERNS, CUTOUT_BLEND, CUTOUT_TRAVEL, GRAIN_TYPES, GRAIN_BLEND, setShaderAnimation, setGestureGlow, setGlowScale, setCutout, resetCutout, setGrain, resetGrain, resetAnimation };

export default {
    createInstancedWaterMaterial,
    updateInstancedWaterMaterial,
    setInstancedWaterTurbulence,
    setInstancedWaterTint,
    setInstancedWaterGlowScale,
    setInstancedWaterGestureGlow,
    setInstancedWaterBloomThreshold,
    setInstancedWaterCutout,
    setInstancedWaterArcAnimation,
    setInstancedWaterDepthGradient,
    setInstancedWaterFlowSpeed,
    setInstancedWaterSparkle,
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

// Note: Water element is registered in ElementRegistrations.js to avoid
// circular dependency issues with the bundler.
