/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Water Shader Core
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Shared GLSL code and utilities for water materials
 * @module materials/cores/WaterShaderCore
 *
 * This module provides the core shader code used by both:
 * - ProceduralWaterMaterial (single-mesh water effects)
 * - InstancedWaterMaterial (GPU-instanced water elements)
 *
 * By centralizing the water logic here, we ensure:
 * - Single source of truth for water visuals
 * - Consistent behavior across all water effects
 * - One fix applies to all water materials
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// NOISE UTILITIES (GLSL)
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * GLSL noise functions for water effects
 * Uses 4-octave FBM for fluid motion
 */
export const NOISE_GLSL = /* glsl */`
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

// Animated 2D Voronoi for caustic ray patterns (Euclidean distance)
// Returns vec3: x=edgeDist (F2-F1), y=cellHash for sparkle, z=unused
vec3 voronoiCaustic(vec2 p, float time) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float d1 = 10.0, d2 = 10.0;
    float cell1Hash = 0.0;

    for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
            vec2 nb = vec2(float(x), float(y));
            vec2 cell = i + nb;
            float h = fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453);
            float h2 = fract(sin(dot(cell, vec2(269.5, 183.3))) * 43758.5453);
            // Animated cell centers — swimming caustics
            vec2 pt = nb + vec2(h, h2) + vec2(
                sin(time * 3.0 + h * 6.28318) * 0.15,
                cos(time * 2.5 + h2 * 6.28318) * 0.15
            );
            float d = length(f - pt); // Euclidean for smooth curves
            if (d < d1) { d2 = d1; d1 = d; cell1Hash = h; }
            else if (d < d2) { d2 = d; }
        }
    }
    return vec3(d2 - d1, cell1Hash, 0.0);
}

// Water bubbles with rising animation
// Returns vec2(brightness, ringDarkness) for compositing
vec2 waterBubbles3D(vec3 p, float scale, float density, float time) {
    vec3 sp = p * scale + vec3(0.0, time * 0.3, 0.0); // Rising motion
    vec3 i = floor(sp);
    vec3 f = fract(sp);

    float bright = 0.0;
    float ringDark = 0.0;

    for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
            for (int z = -1; z <= 1; z++) {
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

// ═══════════════════════════════════════════════════════════════════════════════════════
// WATER COLOR UTILITIES (GLSL)
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * GLSL water color ramp
 * Maps intensity and turbulence to realistic water colors
 *
 * @param intensity - Local intensity (0-1)
 * @param turbulence - How turbulent the water is (0=calm, 1=storm)
 */
export const WATER_COLOR_GLSL = /* glsl */`
// Water color palette constants (accessible for effects)
const vec3 WATER_DEEP = vec3(0.05, 0.15, 0.35);       // Deep blue
const vec3 WATER_MID = vec3(0.15, 0.4, 0.6);          // Ocean blue
const vec3 WATER_BRIGHT = vec3(0.3, 0.6, 0.8);        // Bright cyan
const vec3 WATER_FOAM = vec3(0.85, 0.92, 1.0);        // White foam/highlights
const vec3 WATER_SUBSURFACE = vec3(0.2, 0.5, 0.7);    // Subsurface scatter color

// Water color based on local intensity and turbulence
vec3 waterColor(float intensity, float turbulence) {
    // Mix based on intensity - biased toward blue colors
    // Only very high intensities should reach white/foam
    vec3 color;
    if (intensity < 0.5) {
        // 0-0.5: Deep blue to ocean blue (most of the water)
        color = mix(WATER_DEEP, WATER_MID, intensity * 2.0);
    } else if (intensity < 0.8) {
        // 0.5-0.8: Ocean blue to bright cyan
        color = mix(WATER_MID, WATER_BRIGHT, (intensity - 0.5) * 3.33);
    } else {
        // 0.8-1.0: Bright cyan to foam (only extreme highlights)
        color = mix(WATER_BRIGHT, WATER_FOAM, (intensity - 0.8) * 5.0);
    }

    return color;
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// WATER FRAGMENT CORE (GLSL)
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Core water fragment processing: flow patterns, fresnel, shimmer,
 * color calculation, and alpha handling.
 *
 * Expected uniforms: uTurbulence, uIntensity, uOpacity, uNoiseScale,
 *                    uFlowSpeed, uEdgeFade, uTint, uGlowScale,
 *                    uDepthGradient, uInternalFlowSpeed, uSparkleIntensity
 * Expected varyings: vPosition, vNormal, vViewDir, vDisplacement, vNoiseValue
 * Required: localTime variable must be defined before including this
 *
 * Outputs: color (vec3), alpha (float) - ready for final output
 */
export const WATER_FRAGMENT_CORE = /* glsl */`
    // ═══════════════════════════════════════════════════════════════════════════════
    // NORMALS + THICKNESS
    // Smooth normals hide low-poly faces. Used for: thickness, fresnel, scatter.
    // ═══════════════════════════════════════════════════════════════════════════════
    vec3 viewDir = normalize(vViewDir);

    // World normal with faceforward for DoubleSide geometry
    vec3 worldNormal = normalize(vWorldNormal);
    if (length(vWorldNormal) < 0.01) worldNormal = viewDir;
    worldNormal = faceforward(worldNormal, -viewDir, worldNormal);

    float smoothNdotV = max(0.0, dot(worldNormal, viewDir));
    float fresnel = pow(1.0 - smoothNdotV, 3.0);   // Power 3 for water (ice uses 4)
    float thickness = smoothNdotV * smoothNdotV * 0.5; // Quadratic proxy

    // Schlick fresnel
    float F0 = 0.02; // water IOR ~1.33
    float schlick = F0 + (1.0 - F0) * fresnel;

    // ═══════════════════════════════════════════════════════════════════════════════
    // SCREEN-SPACE REFRACTION — sample background through distorted UVs
    // The background was rendered to a texture without water meshes.
    //
    // KEY INSIGHT: Don't feed ripples into refract() — at near-perpendicular
    // incidence, refract() suppresses bending (output ≈ input direction).
    // Instead, apply ripple offsets DIRECTLY to screen UVs. This is the
    // standard real-time water technique: surface normals/ripples directly
    // offset the background lookup, producing large, visible distortion.
    // ═══════════════════════════════════════════════════════════════════════════════
    vec3 waterBodyColor = vec3(0.05, 0.15, 0.30) * uTint; // Stylized blue — reads as "water" at game scale
    vec3 transmittedLight;
    float bgPresence = 1.0; // 1.0 = 3D geometry behind, 0.0 = empty sky (CSS background)

    if (uHasBackground == 1) {
        vec2 screenUV = gl_FragCoord.xy / uResolution;

        // View-space vectors
        vec3 I_vs = normalize(vViewPosition);
        vec3 N_vs = faceforward(normalize(vNormal), I_vs, normalize(vNormal));

        // ── Physical refraction: small but correct geometry-dependent bending ──
        vec3 refDir = refract(I_vs, N_vs, 0.75);
        if (length(refDir) < 0.1) refDir = I_vs;
        float physDistortion = 0.04 + thickness * 0.10;
        vec2 physOffset = refDir.xy * physDistortion;

        // ── Animated ripple distortion: PRIMARY visible effect ──
        // Ripples directly offset screen UVs = looking through wavy water surface.
        // Adjacent pixels get smooth, similar offsets → clean wavy distortion.
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

        // Combined: physical refraction + animated ripples
        vec2 totalOffset = physOffset + rippleOffset;

        // ── Alpha-aware refraction ──
        // The refraction target clears to (0,0,0,0). Areas with 3D geometry have
        // alpha > 0. Areas with no geometry (empty sky / CSS background) have alpha ≈ 0.
        // Over geometry: refract normally. Over sky: be transparent so CSS shows through.
        vec4 bgCenter = texture2D(uBackgroundTexture, clamp(screenUV + totalOffset, 0.0, 1.0));
        bgPresence = smoothstep(0.05, 0.3, bgCenter.a);

        vec3 refractedBg;
        if (bgPresence > 0.1) {
            // 3D geometry behind — full refraction with chromatic dispersion
            refractedBg = vec3(
                texture2D(uBackgroundTexture, clamp(screenUV + totalOffset * 0.97, 0.0, 1.0)).r,
                bgCenter.g,
                texture2D(uBackgroundTexture, clamp(screenUV + totalOffset * 1.03, 0.0, 1.0)).b
            );
        } else {
            // Empty sky behind — just use the (near-black) sample
            refractedBg = bgCenter.rgb;
        }

        // Over geometry: blue-tinted lift. Over sky: light tint so water has some color.
        vec3 skyTint = vec3(0.12, 0.20, 0.30) * uTint;
        vec3 ambientLift = mix(skyTint, vec3(0.03, 0.06, 0.10), bgPresence);
        refractedBg += ambientLift * (vec3(1.0) - refractedBg);

        // Body color tint — visible at thick areas
        transmittedLight = mix(refractedBg, waterBodyColor, thickness * 0.15);
    } else {
        vec3 voidColor = vec3(0.08, 0.15, 0.25);
        transmittedLight = mix(voidColor, waterBodyColor, thickness * 0.3);
    }

    // Blue absorption — water absorbs red > green > blue wavelengths
    // Base tint even at thin edges so entire surface reads as "water"
    vec3 absorptionTint = mix(vec3(1.0), vec3(0.65, 0.85, 1.0), 0.20 + thickness * 0.8);
    transmittedLight *= absorptionTint;

    // Subtle energy conservation
    transmittedLight *= (1.0 - fresnel * 0.08);

    // ═══════════════════════════════════════════════════════════════════════════════
    // PARALLAX + BREAK MASK + VORONOI CAUSTICS + VIEW SPARKLE
    // Two-scale animated Voronoi with Euclidean distance → smooth caustic curves.
    // Break mask erases ~75% for "current channels" of clear vs active water.
    // ═══════════════════════════════════════════════════════════════════════════════
    vec2 parallaxDir = viewDir.xz / max(smoothNdotV, 0.25);
    vec2 coarseParallax = parallaxDir * 0.08;
    vec2 fineParallax = parallaxDir * 0.12;

    // Break mask — low-frequency noise erases ~80% of caustics, wide gradient for soft edges
    float breakNoise = noise(vec3(vPosition.xz * 0.4, 0.0));
    float causticMask = smoothstep(0.55, 0.85, breakNoise);

    // Caustic time — use global time for steady swimming independent of instance
    float causticTime = uGlobalTime * 0.001;

    // Two-scale animated Voronoi caustics
    vec3 coarseCaustic = voronoiCaustic(
        (vPosition.xz + coarseParallax) * 3.0 + vec2(vRandomSeed * 3.0),
        causticTime
    );
    vec3 fineCaustic = voronoiCaustic(
        (vPosition.xz + fineParallax) * 6.0 + vec2(vRandomSeed * 5.7),
        causticTime * 1.3
    );

    // Per-cell view sparkle: pseudo-plane-normal from cell hash
    float coarseAngle = coarseCaustic.y * 6.28318;
    vec2 coarsePlaneDir = vec2(cos(coarseAngle), sin(coarseAngle));
    float coarseSparkle = abs(dot(coarsePlaneDir, viewDir.xz));
    coarseSparkle = mix(0.1, 1.0, coarseSparkle);

    float fineAngle = fineCaustic.y * 6.28318;
    vec2 finePlaneDir = vec2(cos(fineAngle), sin(fineAngle));
    float fineSparkle = abs(dot(finePlaneDir, viewDir.xz));
    fineSparkle = mix(0.1, 1.0, fineSparkle);

    // Caustic edge-distance to brightness — very narrow widths for thin bright rays only
    float coarseBright = 1.0 - smoothstep(0.0, 0.03, coarseCaustic.x);
    float fineBright = 1.0 - smoothstep(0.0, 0.02, fineCaustic.x);

    // Combined caustic brightness
    float causticCombined = (coarseBright * coarseSparkle * 0.6 + fineBright * fineSparkle * 0.4) * causticMask;

    // Very subtle caustic modulation — refraction distortion IS the real caustic effect,
    // this just adds a faint hint of surface variation
    transmittedLight *= 1.0 + causticCombined * 0.04;

    // ═══════════════════════════════════════════════════════════════════════════════
    // VOLUMETRIC BUBBLES — round spheres rising through the water
    // Cluster mask ties bubbles to caustic zones for natural grouping.
    // ═══════════════════════════════════════════════════════════════════════════════
    vec3 bubbleParallax = viewDir * 0.08 / max(smoothNdotV, 0.25);
    vec3 bubbleSamplePos = vPosition + bubbleParallax + vec3(vRandomSeed * 10.0);

    // Cluster mask tied to break mask: bubbles congregate near caustic zones
    float bubbleClusterMask = 0.5 + 0.5 * causticMask;

    vec2 bub = waterBubbles3D(bubbleSamplePos, 20.0, 0.35, uGlobalTime * 0.001);

    // Fizz micro-detail
    float fizz = smoothstep(0.84, 0.90, noise(bubbleSamplePos * 40.0)) * 0.15;

    float bubbleBright = (bub.x + fizz) * bubbleClusterMask;
    float bubbleRing = bub.y * bubbleClusterMask;

    // ═══════════════════════════════════════════════════════════════════════════════
    // SPECULAR — THE DOMINANT VISUAL FEATURE
    // Real water is mostly invisible; sharp bright glints are what you SEE.
    // High power (128-512) for needle-sharp highlights, multiple light directions.
    // ═══════════════════════════════════════════════════════════════════════════════
    vec3 wetReflDir = reflect(-viewDir, worldNormal);

    // Broad wet sheen — sharper than before (power 128), stronger (1.5x)
    float wetSpec1 = pow(max(dot(wetReflDir, normalize(vec3(0.5, 1.0, 0.3))), 0.0), 128.0);
    float wetSpec2 = pow(max(dot(wetReflDir, normalize(vec3(-0.4, 0.8, -0.4))), 0.0), 128.0) * 0.7;
    float wetSpec3 = pow(max(dot(wetReflDir, normalize(vec3(-0.3, 0.6, 0.7))), 0.0), 96.0) * 0.5;
    float wetSpec4 = pow(max(dot(wetReflDir, normalize(vec3(0.2, 0.9, -0.3))), 0.0), 160.0) * 0.4;
    float broadSpec = (wetSpec1 + wetSpec2 + wetSpec3 + wetSpec4) * 1.5;

    // Needle-sharp sparkle — power 512, multiple light directions for more glint points
    float spark1 = pow(max(dot(wetReflDir, normalize(vec3(0.5, 1.0, 0.3))), 0.0), 512.0);
    float spark2 = pow(max(dot(wetReflDir, normalize(vec3(-0.3, 0.9, 0.4))), 0.0), 512.0) * 0.6;
    float spark3 = pow(max(dot(wetReflDir, normalize(vec3(0.4, 0.7, -0.5))), 0.0), 384.0) * 0.4;

    // Twinkling animation (3-freq multiplicative pattern)
    float specShift1 = sin(localTime * 0.003 + vPosition.x * 8.0) * 0.5 + 0.5;
    float specShift2 = sin(localTime * 0.005 - vPosition.z * 12.0) * 0.5 + 0.5;
    float specShift3 = sin(localTime * 0.007 + vPosition.y * 10.0) * 0.5 + 0.5;
    float sparkleAnim = specShift1 * specShift2 * specShift3;

    float sharpSpec = (spark1 + spark2 + spark3) * sparkleAnim * 3.0 * uSparkleIntensity;

    vec3 specContrib = vec3(0.85, 0.92, 1.0) * (broadSpec + sharpSpec);

    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERNAL SPIRAL FLOW (reduced contribution for refraction-based approach)
    // ═══════════════════════════════════════════════════════════════════════════════
    float flowTimeScale = localTime * uInternalFlowSpeed;
    float spiralAngle = atan(vPosition.y, vPosition.x) + flowTimeScale * 0.001;
    float spiralRadius = length(vPosition.xy);
    float spiralFlow = sin(spiralAngle * 3.0 - spiralRadius * 4.0 + flowTimeScale * 0.002);
    spiralFlow = spiralFlow * 0.5 + 0.5;

    float spiral2 = sin(-spiralAngle * 2.0 + spiralRadius * 3.0 + flowTimeScale * 0.0015);
    spiral2 = spiral2 * 0.5 + 0.5;

    float spiral3 = sin(spiralAngle * 5.0 + spiralRadius * 6.0 - flowTimeScale * 0.0025);
    spiral3 = spiral3 * 0.5 + 0.5;

    float internalFlow = (spiralFlow * 0.4 + spiral2 * 0.35 + spiral3 * 0.25) * 0.02; // Near-zero: real water has no internal pattern

    // ═══════════════════════════════════════════════════════════════════════════════
    // COMPOSITING — soft clamp + post-clamp
    // Cap smooth glass body before adding bright features (specular, caustics, bubbles)
    // so they can exceed the cap and trigger bloom glow.
    // ═══════════════════════════════════════════════════════════════════════════════
    vec3 color = transmittedLight;

    // Add internal flow contribution (procedural, so scale by uIntensity)
    color += internalFlow * waterBodyColor * uIntensity;

    // DON'T multiply refracted background by uIntensity — it would wash out the
    // background visibility. Only procedural additions (flow, specular) scale.

    // ── SOFT CLAMP: cap smooth body before bright features ──
    float softCap = uBloomThreshold + 0.40;
    float maxChannel = max(color.r, max(color.g, color.b));
    if (maxChannel > softCap) {
        color *= softCap / maxChannel;
    }

    // ── POST-CLAMP: bright features exceed cap for bloom ──
    // Caustics now modulate transmittedLight directly (physically-based light focusing)
    color += specContrib;
    color += vec3(0.80, 0.85, 0.92) * bubbleBright * 0.35;
    color -= vec3(0.05, 0.04, 0.02) * bubbleRing;

    // ═══════════════════════════════════════════════════════════════════════════════
    // ALPHA — two factors:
    // 1. Edge dissolution: NdotV-based fade makes thin edges transparent
    // 2. Background presence: when no refraction background is set AND there's no
    //    3D geometry behind, reduce alpha so CSS shows through. With a refraction
    //    background set, bgPresence → 1.0 everywhere → full refraction alpha.
    // ═══════════════════════════════════════════════════════════════════════════════
    float edgeAlpha = smoothstep(0.08, 0.60, smoothNdotV);
    float skyAlpha = mix(0.25, 1.0, bgPresence); // 0.25 fallback if no bg set, 1.0 with bg
    float alpha = edgeAlpha * skyAlpha;
`;

/**
 * Arc edge foam effect for vortex animations
 * Adds bright foam accumulation at leading/trailing edges of rotating arcs
 *
 * Expected: vArcVisibility varying from vertex shader
 * Should be called AFTER base color calculation, BEFORE final output
 */
export const WATER_ARC_FOAM_GLSL = /* glsl */`
    // Foam accumulates at arc edges (where visibility transitions)
    float arcEdgeFoam = smoothstep(0.5, 0.85, vArcVisibility) * (1.0 - smoothstep(0.85, 1.0, vArcVisibility));
    // Secondary foam at leading edge
    float leadingFoam = smoothstep(0.0, 0.3, vArcVisibility) * (1.0 - smoothstep(0.3, 0.5, vArcVisibility));
    float totalFoam = max(arcEdgeFoam, leadingFoam * 0.7);

    // Add foam color with animated shimmer - reduced mix amount
    float foamShimmer = 0.8 + 0.2 * sin(localTime * 0.005 + vPosition.x * 10.0);
    color = mix(color, WATER_FOAM * foamShimmer, totalFoam * 0.35);

    // ═══════════════════════════════════════════════════════════════════════════════
    // DRAMATIC ARC EDGE GRADIENT (scaled by uGlowScale)
    // ═══════════════════════════════════════════════════════════════════════════════

    // Color shifts toward bright cyan at arc edges for dramatic effect
    // Reduced base values - gestureGlow ramps this up for impact
    float arcEdgeIntensity = 1.0 - vArcVisibility;  // Inverse: brighter at fading edges
    vec3 edgeGlow = WATER_FOAM * (0.8 + 0.15 * uGlowScale);  // Subtle overexposure
    color = mix(color, edgeGlow, arcEdgeIntensity * 0.2 * uGlowScale);

    // Extra bloom hint at arc edges (scaled) - reduced for subtlety
    color += arcEdgeIntensity * vec3(0.1, 0.2, 0.25) * 0.3 * uGlowScale;

    // Foam is more opaque
    alpha = mix(alpha, min(1.0, alpha + 0.3), totalFoam);

    // Arc edges slightly more visible
    alpha = mix(alpha, min(1.0, alpha + 0.15), arcEdgeIntensity * 0.4);
`;

/**
 * Cutout effect - creates transparent holes to break up water shapes
 * Combines cellular/bubble holes with flow-aligned streaks
 *
 * Expected uniforms: uCutoutStrength (0=solid, 1=maximum holes)
 * Expected variables: pattern, flow, vPosition, localTime
 * Should be called BEFORE final alpha calculation
 */
export const WATER_CUTOUT_GLSL = /* glsl */`
    // ═══════════════════════════════════════════════════════════════════════════════
    // CUTOUT EFFECT (cellular holes + flow streaks)
    // ═══════════════════════════════════════════════════════════════════════════════

    if (uCutoutStrength > 0.01) {
        // --- CELLULAR/BUBBLE HOLES ---
        // Create voronoi-like cell pattern using layered noise
        vec3 cellPos = vPosition * 6.0 + vec3(localTime * 0.0005);
        float cell1 = snoise(cellPos);
        float cell2 = snoise(cellPos * 1.7 + vec3(50.0));

        // Combine cells - areas where both are low become holes
        float cellPattern = min(cell1, cell2);

        // Threshold creates discrete holes (sharper = more defined holes)
        float cellHoles = smoothstep(-0.3, 0.1, cellPattern);

        // --- FLOW-ALIGNED STREAKS ---
        // Streaks that follow the internal flow direction
        float streakAngle = atan(vPosition.y, vPosition.x);
        float streakPhase = streakAngle * 4.0 + flow * 3.0 + localTime * 0.001;
        float streak = sin(streakPhase);

        // Secondary perpendicular streaks for cross-hatch effect
        float streak2 = sin(streakPhase * 0.7 + 2.094);

        // Combine streaks - both high = visible, either low = transparent
        float streakPattern = max(streak, streak2);
        float streakHoles = smoothstep(-0.2, 0.3, streakPattern);

        // --- ANIMATED DISSOLUTION ---
        // Some holes grow and shrink over time
        float dissolvePhase = localTime * 0.002 + snoise(vPosition * 3.0) * 6.28318;
        float dissolve = sin(dissolvePhase) * 0.3 + 0.7;

        // --- COMBINE ALL CUTOUT PATTERNS ---
        // Multiply patterns: hole where ANY pattern has a hole
        float cutoutMask = cellHoles * streakHoles * dissolve;

        // Apply cutout strength (0 = no cutout, 1 = full cutout)
        // Interpolate between 1.0 (solid) and cutoutMask
        float finalCutout = mix(1.0, cutoutMask, uCutoutStrength);

        // BINARY CUTOUT: discard below threshold, keep full brightness above
        // This prevents dark semi-transparent artifacts
        float cutoutThreshold = 0.5;
        if (finalCutout < cutoutThreshold) {
            discard;
        }

        // Enhanced foam rim effect at hole edges - multiple layers for depth
        float nearEdge = smoothstep(cutoutThreshold, cutoutThreshold + 0.1, finalCutout);
        float farEdge = smoothstep(cutoutThreshold + 0.25, cutoutThreshold + 0.4, finalCutout);

        // Sharp inner rim (bright foam line at cutout boundary)
        float innerRim = nearEdge * (1.0 - smoothstep(cutoutThreshold + 0.1, cutoutThreshold + 0.2, finalCutout));

        // Softer outer glow (wider, subtler foam aura)
        float outerGlow = nearEdge * (1.0 - farEdge) * 0.5;

        // Animated sparkles along the foam edge
        float foamSparkle = sin(localTime * 0.008 + vPosition.x * 15.0 + vPosition.z * 12.0) * 0.5 + 0.5;
        foamSparkle *= sin(localTime * 0.006 - vPosition.y * 18.0) * 0.5 + 0.5;
        foamSparkle = pow(foamSparkle, 3.0) * innerRim;

        // Apply foam effects
        color += innerRim * WATER_FOAM * 0.7 * uCutoutStrength;
        color += outerGlow * WATER_BRIGHT * 0.4 * uCutoutStrength;
        color += foamSparkle * vec3(1.0, 1.0, 1.0) * 0.5 * uCutoutStrength * uSparkleIntensity;

        // Foam edges are slightly more opaque
        alpha = mix(alpha, min(1.0, alpha + 0.1), innerRim * uCutoutStrength);
    }
`;

/**
 * Drip anticipation effect - bright spots that pulse suggesting droplets about to fall
 * Creates the illusion of surface tension holding water that wants to drip
 *
 * Expected: vPosition varying, localTime variable, pattern variable
 * Should be called AFTER base color calculation
 */
export const WATER_DRIP_ANTICIPATION_GLSL = /* glsl */`
    // ═══════════════════════════════════════════════════════════════════════════════
    // ENHANCED DRIP ANTICIPATION (surface tension hotspots with visible gathering)
    // ═══════════════════════════════════════════════════════════════════════════════

    // Create multiple potential drip points using spatial hash
    float dripHash1 = snoise(vPosition * 8.0 + vec3(12.34, 56.78, 90.12));
    float dripHash2 = snoise(vPosition * 8.0 + vec3(98.76, 54.32, 10.98));
    float dripHash3 = snoise(vPosition * 6.0 + vec3(45.67, 23.45, 67.89));

    // Only some areas become drip points (threshold creates sparse points)
    float dripPoint1 = smoothstep(0.65, 0.85, dripHash1);
    float dripPoint2 = smoothstep(0.7, 0.88, dripHash2);
    float dripPoint3 = smoothstep(0.72, 0.9, dripHash3);

    // Each drip point has its own pulse timing (offset by position hash)
    float dripPhase1 = localTime * 0.003 + dripHash1 * 6.28318;
    float dripPhase2 = localTime * 0.0025 + dripHash2 * 6.28318;
    float dripPhase3 = localTime * 0.002 + dripHash3 * 6.28318;

    // Pulse pattern: slow build, quick release (like water gathering then almost falling)
    float dripPulse1 = pow(fract(dripPhase1 * 0.15), 3.0);
    float dripPulse2 = pow(fract(dripPhase2 * 0.12), 3.0);
    float dripPulse3 = pow(fract(dripPhase3 * 0.1), 2.5);

    // Occasional bright flash at peak (surface tension breaking point)
    float dripFlash1 = smoothstep(0.85, 0.95, dripPulse1) * (1.0 - smoothstep(0.95, 1.0, dripPulse1));
    float dripFlash2 = smoothstep(0.85, 0.95, dripPulse2) * (1.0 - smoothstep(0.95, 1.0, dripPulse2));
    float dripFlash3 = smoothstep(0.88, 0.96, dripPulse3) * (1.0 - smoothstep(0.96, 1.0, dripPulse3));

    // Surface tension bulge effect - visible gathering before flash
    float tensionBulge1 = smoothstep(0.5, 0.85, dripPulse1) * dripPoint1;
    float tensionBulge2 = smoothstep(0.5, 0.85, dripPulse2) * dripPoint2;
    float tensionBulge = (tensionBulge1 + tensionBulge2) * 0.5;

    // Combine drip effects with enhanced visibility
    float dripIntensity = dripPoint1 * (dripPulse1 * 0.35 + dripFlash1 * 0.65)
                        + dripPoint2 * (dripPulse2 * 0.35 + dripFlash2 * 0.65)
                        + dripPoint3 * (dripPulse3 * 0.3 + dripFlash3 * 0.7);

    // Apply drip highlights - bright white-cyan flash with subtle rainbow
    float flashTotal = dripFlash1 + dripFlash2 + dripFlash3;
    vec3 dripColor = mix(WATER_BRIGHT, WATER_FOAM, min(1.0, flashTotal));

    // Add subtle rainbow shimmer to the flash (refraction effect)
    float rainbowPhase = localTime * 0.002 + vPosition.x * 5.0;
    vec3 rainbowTint = vec3(
        0.5 + 0.5 * sin(rainbowPhase),
        0.5 + 0.5 * sin(rainbowPhase + 2.094),
        0.5 + 0.5 * sin(rainbowPhase + 4.189)
    );
    dripColor = mix(dripColor, dripColor * rainbowTint, flashTotal * 0.15);

    color += dripIntensity * dripColor * 0.15 * uGlowScale;

    // Surface tension bulge adds subtle brightness
    color += tensionBulge * WATER_BRIGHT * 0.10;
`;

/**
 * Foam edge effects for water cutout holes.
 * Uses finalCutout from CUTOUT_GLSL (must be included before this).
 * Adds bright foam rim at hole edges and boosts alpha to prevent dark artifacts.
 *
 * Expected: finalCutout (from CUTOUT_GLSL), color, alpha, localTime, vPosition, uCutoutStrength
 */
export const WATER_CUTOUT_FOAM_GLSL = /* glsl */`
    // ═══════════════════════════════════════════════════════════════════════════════
    // WATER CUTOUT FOAM EDGES (brightens cutout boundaries to prevent dark artifacts)
    // ═══════════════════════════════════════════════════════════════════════════════

    if (uCutoutStrength > 0.01 && finalCutout < 0.99) {
        float cutoutThreshold = 0.5;

        // Enhanced foam rim effect at hole edges - multiple layers for depth
        float nearEdge = smoothstep(cutoutThreshold, cutoutThreshold + 0.15, finalCutout);
        float farEdge = smoothstep(cutoutThreshold + 0.3, cutoutThreshold + 0.5, finalCutout);

        // Sharp inner rim (bright foam line at cutout boundary)
        float innerRim = nearEdge * (1.0 - smoothstep(cutoutThreshold + 0.15, cutoutThreshold + 0.25, finalCutout));

        // Softer outer glow (wider, subtler foam aura)
        float outerGlow = nearEdge * (1.0 - farEdge) * 0.4;

        // Animated sparkles along the foam edge
        float foamSparkle = sin(localTime * 0.008 + vPosition.x * 15.0 + vPosition.z * 12.0) * 0.5 + 0.5;
        foamSparkle *= sin(localTime * 0.006 - vPosition.y * 18.0) * 0.5 + 0.5;
        foamSparkle = pow(foamSparkle, 3.0) * innerRim;

        // Apply foam effects — blend toward white (mix, not additive) for NormalBlending
        color = mix(color, WATER_FOAM * 0.9, innerRim * uCutoutStrength * 0.3);
        color = mix(color, WATER_BRIGHT * 0.8, outerGlow * uCutoutStrength * 0.2);
        color = mix(color, vec3(1.0), foamSparkle * uCutoutStrength * uSparkleIntensity * 0.15);
    }
`;

/**
 * Floor color and discard logic for water
 * Prevents water from becoming too transparent
 */
export const WATER_FLOOR_AND_DISCARD_GLSL = /* glsl */`
    // Discard faint fragments
    if (alpha < 0.01) discard;
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// JAVASCRIPT UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Interpolate between three values based on parameter (0-1)
 * Used for turbulence-dependent parameter derivation
 *
 * @param {number} low - Value at t=0
 * @param {number} mid - Value at t=0.5
 * @param {number} high - Value at t=1
 * @param {number} t - Interpolation parameter (0-1)
 * @returns {number} Interpolated value
 */
export function lerp3(low, mid, high, t) {
    if (t < 0.5) {
        return low + (mid - low) * (t * 2);
    }
    return mid + (high - mid) * ((t - 0.5) * 2);
}

/**
 * Derive water material parameters from turbulence
 * Provides consistent defaults across all water materials
 *
 * @param {number} turbulence - Water turbulence (0-1)
 * @param {Object} [overrides] - Optional explicit overrides
 * @returns {Object} Derived parameters
 */
export function deriveWaterParameters(turbulence, overrides = {}) {
    return {
        intensity: overrides.intensity ?? lerp3(0.8, 1.0, 1.2, turbulence),
        displacementStrength: overrides.displacementStrength ?? lerp3(0.06, 0.1, 0.15, turbulence),
        flowSpeed: overrides.flowSpeed ?? lerp3(0.8, 1.5, 3.0, turbulence),
    };
}

/**
 * Default water material options
 * Single source of truth for all water material defaults
 */
export const WATER_DEFAULTS = {
    turbulence: 0.5,
    intensity: 1.0,
    opacity: 0.85,
    displacementStrength: 0.08,
    flowSpeed: 1.0,
    noiseScale: 3.0,
    edgeFade: 0.15,
    glowScale: 1.0,  // Scale for additive glow effects (0=off, 1=full, >1=bloom-heavy)
    fadeInDuration: 0.3,
    fadeOutDuration: 0.5,
};

export default {
    NOISE_GLSL,
    WATER_COLOR_GLSL,
    WATER_FRAGMENT_CORE,
    WATER_ARC_FOAM_GLSL,
    WATER_CUTOUT_GLSL,
    WATER_CUTOUT_FOAM_GLSL,
    WATER_DRIP_ANTICIPATION_GLSL,
    WATER_FLOOR_AND_DISCARD_GLSL,
    lerp3,
    deriveWaterParameters,
    WATER_DEFAULTS,
};
