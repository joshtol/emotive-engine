/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Procedural Water Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Advanced procedural water shader that transforms anchor meshes into
 * realistic, dynamic fluid forms. The mesh geometry acts as an anchor/seed point,
 * while the shader generates dynamic water that wobbles and flows.
 *
 * @author Emotive Engine Team
 * @module materials/ProceduralWaterMaterial
 *
 * ## Key Features
 * - Procedural noise-based fluid distortion (4-octave FBM)
 * - Vertex displacement for wobbling fluid motion
 * - Turbulence-based dynamic movement
 * - Soft edges via fresnel and alpha falloff
 * - Time-based animation with flow and ripple
 *
 * ## Master Parameter: turbulence (0-1)
 *
 * | Turbulence | Visual                     | Water Style        |
 * |------------|----------------------------|--------------------|
 * | 0.0        | Glass-like, still          | Calm droplet       |
 * | 0.3        | Gentle wobble              | Pond ripple        |
 * | 0.5        | Moderate flow              | River              |
 * | 0.7        | Active movement            | Rapids             |
 * | 1.0        | Chaotic churning           | Storm              |
 *
 * ## Animation Types
 *
 * | Type           | Value | Description                                |
 * |----------------|-------|--------------------------------------------|
 * | none           | 0     | Default wobble/flow (existing behavior)    |
 * | rotating-arc   | 1     | Sweeping arc for splash rings              |
 * | ripple-pulse   | 2     | Concentric expanding rings                 |
 * | drip-fall      | 3     | Vertical stretch for falling droplets      |
 * | flow-stream    | 4     | Directional flow along path                |
 * | surface-shimmer| 5     | Caustic patterns on surface                |
 *
 * ## Usage
 *
 * ```javascript
 * const waterMaterial = createProceduralWaterMaterial({
 *     turbulence: 0.6,
 *     flowSpeed: 1.0
 * });
 * mesh.material = waterMaterial;
 *
 * // In render loop:
 * updateProceduralWaterMaterial(waterMaterial, deltaTime);
 * ```
 */

import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════════════════════════════
// NOISE UTILITIES (GLSL)
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
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// WATER COLOR UTILITIES (GLSL)
// ═══════════════════════════════════════════════════════════════════════════════════════

const WATER_COLOR_GLSL = /* glsl */`
// Water color based on local intensity and turbulence
vec3 waterColor(float intensity, float turbulence) {
    // Base water colors
    vec3 deepColor = vec3(0.05, 0.15, 0.35);      // Deep blue
    vec3 midColor = vec3(0.15, 0.4, 0.6);         // Ocean blue
    vec3 brightColor = vec3(0.3, 0.6, 0.8);       // Bright cyan
    vec3 foamColor = vec3(0.85, 0.92, 1.0);       // White foam/highlights

    // Mix based on intensity (similar to fire's heat approach)
    vec3 color;
    if (intensity < 0.33) {
        color = mix(deepColor, midColor, intensity * 3.0);
    } else if (intensity < 0.66) {
        color = mix(midColor, brightColor, (intensity - 0.33) * 3.0);
    } else {
        color = mix(brightColor, foamColor, (intensity - 0.66) * 3.0);
    }

    return color;
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// VERTEX SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════

const VERTEX_SHADER = /* glsl */`
uniform float uTime;
uniform float uTurbulence;
uniform float uDisplacementStrength;
uniform float uFlowSpeed;
uniform float uFadeProgress;      // Smooth 0-1 fade for stable geometry
uniform float uGestureProgress;   // 0-1 progress through entire gesture lifetime

// Animation uniforms
uniform int uAnimationType;      // 0=none, 1=rotating-arc, 2=ripple-pulse, 3=drip-fall, 4=flow-stream, 5=shimmer
uniform float uArcWidth;         // Arc width in radians (for rotating-arc)
uniform float uArcSpeed;         // Max rotations (1.0 = one full rotation over gesture)
uniform int uArcCount;           // Number of arcs (for rotating-arc)
uniform float uRippleSpeed;      // Ripple expansion speed
uniform float uRippleCount;      // Number of ripple rings
uniform float uFlowDirection;    // Flow direction angle in radians (for flow-stream)

varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vViewDir;
varying float vDisplacement;
varying float vNoiseValue;
varying float vAnimationMask;    // Animation intensity mask (passed to fragment)

${NOISE_GLSL}

void main() {
    vPosition = position;
    vNormal = normalMatrix * normal;

    // ═══════════════════════════════════════════════════════════════════════════════
    // VERTEX DISPLACEMENT - Wobble geometry to create fluid motion
    // ═══════════════════════════════════════════════════════════════════════════════

    vAnimationMask = 1.0;  // Default full visibility

    // Animated noise for fluid wobble - slow like fire for realism
    vec3 noisePos = position * 2.5 + vec3(
        uTime * uFlowSpeed * 0.002,   // Slow horizontal flow (was 0.15)
        uTime * uFlowSpeed * 0.001,   // Slower vertical (was 0.08)
        uTime * uFlowSpeed * 0.0015   // (was 0.12)
    );
    float noiseValue = fbm4(noisePos);
    vNoiseValue = noiseValue * 0.5 + 0.5;  // Normalize to 0-1

    // Position-based variation for asymmetric wobble
    float posVariation = snoise(position * 3.0) * 0.4 + 0.8;

    // Primary displacement along normal (fluid bulging outward)
    // NOTE: Do NOT multiply by fadeProgress - geometry stays stable during fade
    // Only opacity changes, not shape (prevents shimmy at end of life)
    float baseDisplacement = noiseValue * uDisplacementStrength * (0.4 + uTurbulence * 0.6) * posVariation;

    vec3 displaced = position + normal * baseDisplacement;

    // ═══════════════════════════════════════════════════════════════════════════════
    // ANIMATION TYPE SPECIFIC DISPLACEMENT
    // ═══════════════════════════════════════════════════════════════════════════════

    if (uAnimationType == 1) {
        // ═══════════════════════════════════════════════════════════════════════
        // ROTATING-ARC: Arc masking done in fragment shader for pixel accuracy
        // Vertex shader just applies gentle displacement, fragment does visibility
        // ═══════════════════════════════════════════════════════════════════════

        // Pass through vertex angle for fragment shader (but masking done there)
        vAnimationMask = 1.0;  // Fragment shader will compute actual mask

        // Gentle uniform displacement - no vertex-based arc masking
        displaced = position + normal * baseDisplacement * 0.8;

    } else if (uAnimationType == 2) {
        // ═══════════════════════════════════════════════════════════════════════
        // RIPPLE-PULSE: Concentric expanding rings
        // ═══════════════════════════════════════════════════════════════════════

        float distFromCenter = length(position.xz);

        // Multiple expanding rings
        float rippleMask = 0.0;
        for (int i = 0; i < 5; i++) {
            if (float(i) >= uRippleCount) break;
            // Each ring expands outward over time
            float ringRadius = mod(uTime * uRippleSpeed + float(i) * 0.5, 3.0);
            float ringWidth = 0.15;
            float ring = smoothstep(ringRadius - ringWidth, ringRadius, distFromCenter) *
                        smoothstep(ringRadius + ringWidth, ringRadius, distFromCenter);
            rippleMask = max(rippleMask, ring);
        }

        vAnimationMask = rippleMask;

        // Vertical pulse at ring locations (no fadeFactor - geometry stays stable)
        displaced.y += rippleMask * uDisplacementStrength * 1.5;

        // Subtle outward push at rings
        if (distFromCenter > 0.01) {
            vec2 outDir = normalize(position.xz);
            displaced.x += outDir.x * rippleMask * uDisplacementStrength * 0.5;
            displaced.z += outDir.y * rippleMask * uDisplacementStrength * 0.5;
        }

    } else if (uAnimationType == 3) {
        // ═══════════════════════════════════════════════════════════════════════
        // DRIP-FALL: Vertical stretching for falling droplets
        // ═══════════════════════════════════════════════════════════════════════

        // Stretch vertically based on time (accelerating fall)
        float fallProgress = min(uTime * 0.5, 1.0);
        float stretchFactor = 1.0 + fallProgress * 1.5;

        // Apply vertical stretch - elongate in Y
        displaced.y = position.y * stretchFactor;

        // Compress horizontally to maintain volume
        float squash = 1.0 / sqrt(stretchFactor);
        displaced.x = position.x * squash;
        displaced.z = position.z * squash;

        // Add downward drift (no fadeFactor - geometry stays stable)
        displaced.y -= fallProgress * 0.5;

        // Wobble increases as droplet falls
        float fallWobble = sin(uTime * 8.0 + position.y * 5.0) * 0.02 * fallProgress;
        displaced.x += fallWobble;
        displaced.z += fallWobble * 0.7;

        vAnimationMask = 0.8 + 0.2 * sin(position.y * 10.0 + uTime * 3.0);

    } else if (uAnimationType == 4) {
        // ═══════════════════════════════════════════════════════════════════════
        // FLOW-STREAM: Directional flow along path
        // ═══════════════════════════════════════════════════════════════════════

        // Direction vector from angle
        vec2 flowDir = vec2(cos(uFlowDirection), sin(uFlowDirection));

        // Project position onto flow direction
        float alongFlow = dot(position.xz, flowDir);

        // Traveling wave along flow direction
        float wave = sin(alongFlow * 4.0 - uTime * uFlowSpeed * 2.0);
        float wave2 = sin(alongFlow * 7.0 - uTime * uFlowSpeed * 3.0) * 0.5;

        // Perpendicular undulation
        vec2 perpDir = vec2(-flowDir.y, flowDir.x);
        float perpPos = dot(position.xz, perpDir);
        float perpWave = sin(perpPos * 3.0 + uTime * uFlowSpeed) * 0.3;

        // Apply waves (no fadeFactor - geometry stays stable)
        displaced.y += (wave + wave2 + perpWave) * uDisplacementStrength;

        // Slight push in flow direction
        displaced.x += flowDir.x * wave * uDisplacementStrength * 0.3;
        displaced.z += flowDir.y * wave * uDisplacementStrength * 0.3;

        vAnimationMask = 0.7 + 0.3 * (wave * 0.5 + 0.5);

    } else {
        // ═══════════════════════════════════════════════════════════════════════
        // DEFAULT (0 or 5): Standard wobble + optional shimmer
        // ═══════════════════════════════════════════════════════════════════════

        // Secondary wobble - perpendicular fluid motion (like jello)
        // No fadeFactor - geometry stays stable during fade, only opacity changes
        vec3 perpNoise = position * 2.0 + vec3(uTime * uFlowSpeed * 0.001, uTime * uFlowSpeed * 0.0008, 0.0);
        float wobbleX = snoise(perpNoise + vec3(50.0, 0.0, 0.0)) * uDisplacementStrength * uTurbulence * 0.5;
        float wobbleY = snoise(perpNoise + vec3(0.0, 50.0, 0.0)) * uDisplacementStrength * uTurbulence * 0.3;
        float wobbleZ = snoise(perpNoise + vec3(0.0, 0.0, 50.0)) * uDisplacementStrength * uTurbulence * 0.5;
        displaced.x += wobbleX;
        displaced.y += wobbleY;
        displaced.z += wobbleZ;

        // Tertiary slow undulation - large-scale movement
        float slowWave = sin(uTime * uFlowSpeed * 0.003 + position.x * 2.0 + position.z * 2.0) * uDisplacementStrength * 0.3;
        displaced += normal * slowWave;
    }

    float displacement = length(displaced - position);
    vDisplacement = displacement;

    // World position for view calculations
    vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
    vWorldPosition = worldPos.xyz;
    vViewDir = normalize(cameraPosition - worldPos.xyz);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// FRAGMENT SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════

const FRAGMENT_SHADER = /* glsl */`
uniform float uTime;
uniform float uTurbulence;
uniform float uIntensity;
uniform float uOpacity;
uniform float uFlowSpeed;
uniform float uNoiseScale;
uniform float uEdgeFade;
uniform vec3 uTint;

// Animation uniforms
uniform int uAnimationType;
uniform float uArcWidth;
uniform float uArcSpeed;
uniform int uArcCount;
uniform float uGestureProgress;   // 0-1 progress through entire gesture lifetime
uniform float uArcPhase;          // Formation rotation offset (radians) for spiral patterns

varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vViewDir;
varying float vDisplacement;
varying float vNoiseValue;
varying float vAnimationMask;

${NOISE_GLSL}
${WATER_COLOR_GLSL}

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewDir);

    // ═══════════════════════════════════════════════════════════════════════════════
    // WATER PATTERN GENERATION
    // ═══════════════════════════════════════════════════════════════════════════════

    // Animated noise for surface patterns - slow like fire for realism
    vec3 noisePos = vPosition * uNoiseScale + vec3(
        uTime * 0.001,    // (was 0.08)
        uTime * 0.0008,   // (was 0.05)
        uTime * 0.0009    // (was 0.06)
    );

    // Primary flow pattern
    float flow = fbm4(noisePos);

    // Secondary ripple detail
    vec3 ripplePos = noisePos * 2.0 + vec3(uTime * 0.0004, 0.0, uTime * 0.0005);
    float ripple = snoise(ripplePos) * 0.5 + 0.5;

    // Position-based variation for unique appearance per point
    float posVariation = snoise(vPosition * 4.0) * 0.15 + 0.92;

    // Combine patterns - stronger contrast
    float pattern = (flow * 0.5 + ripple * 0.5) * posVariation;
    pattern = pattern * 0.5 + 0.5;  // Normalize to 0-1
    pattern = pow(pattern, 0.8);  // Boost mid-tones

    // ═══════════════════════════════════════════════════════════════════════════════
    // ANIMATION-SPECIFIC PATTERN MODIFICATIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    float animBoost = 1.0;
    float arcMask = 1.0;  // For ROTATING_ARC visibility

    if (uAnimationType == 1) {
        // ═══════════════════════════════════════════════════════════════════════
        // ROTATING-ARC: Per-pixel arc calculation for accurate ring masking
        // Only ~1/3 of the ring should be visible at any time
        // Arc rotates based on gesture progress, not time (max 1 rotation)
        // ═══════════════════════════════════════════════════════════════════════

        // Distance from center in XZ plane - used to avoid pivot artifacts
        float distFromCenter = length(vPosition.xz);

        // Skip arc masking for center area (avoids atan artifacts at pivot)
        if (distFromCenter < 0.05) {
            // Center pixels just fade based on overall gesture
            arcMask = 0.5;
        } else {
            // Calculate this pixel's angle in the XZ plane (around Y axis)
            float pixelAngle = atan(vPosition.z, vPosition.x);

            // Arc position based on gesture progress (uArcSpeed = number of rotations)
            // 1.0 = 270 degree rotation over gesture lifetime (avoids overshoot)
            // uArcPhase adds formation offset for spiral patterns (each ring offset by arcOffset)
            float arcAngle = uGestureProgress * uArcSpeed * 4.71239 + uArcPhase;

            // Calculate visibility mask - check distance from each arc center
            arcMask = 0.0;
            float arcSpacing = 6.28318 / float(uArcCount);  // 2*PI / arcCount

            // Arc width in radians - with 2 arcs at 1.0 radian each = ~32% visible
            float effectiveWidth = uArcWidth;

            for (int i = 0; i < 8; i++) {
                if (i >= uArcCount) break;
                float thisArcAngle = arcAngle + float(i) * arcSpacing;
                // Wrap angle difference to [-PI, PI]
                float angleDiff = mod(pixelAngle - thisArcAngle + 3.14159, 6.28318) - 3.14159;
                // Hard cutoff - either in arc or not (sharper edges)
                float thisArcMask = 1.0 - smoothstep(effectiveWidth * 0.8, effectiveWidth, abs(angleDiff));
                arcMask = max(arcMask, thisArcMask);
            }
        }

        // DISCARD pixels outside the arc - this is the key visibility control
        if (arcMask < 0.1) discard;

        // Boost pattern intensity within arc
        animBoost = mix(0.6, 1.4, arcMask);

        // Add foam/spray texture within arc
        float foam = snoise(vPosition * 15.0 + vec3(uTime * 0.3, 0.0, 0.0)) * 0.5 + 0.5;
        pattern = mix(pattern, max(pattern, foam * 0.6), arcMask);

    } else if (uAnimationType == 2) {
        // RIPPLE-PULSE: Enhance rings with bright edges
        animBoost = mix(0.6, 1.5, vAnimationMask);
        // Ring highlights
        float ringHighlight = pow(vAnimationMask, 2.0);
        pattern = mix(pattern, 1.0, ringHighlight * 0.5);

    } else if (uAnimationType == 3) {
        // DRIP-FALL: Vertical streaks in falling drops
        float streaks = sin(vPosition.x * 20.0) * sin(vPosition.z * 20.0);
        streaks = streaks * 0.5 + 0.5;
        pattern = mix(pattern, pattern * streaks, 0.3);

    } else if (uAnimationType == 4) {
        // FLOW-STREAM: Directional pattern enhancement
        animBoost = mix(0.8, 1.3, vAnimationMask);

    } else if (uAnimationType == 5) {
        // SURFACE-SHIMMER: Caustic patterns
        vec3 causticPos = vPosition * 8.0 + vec3(uTime * 0.02, 0.0, uTime * 0.015);
        float caustic1 = snoise(causticPos);
        float caustic2 = snoise(causticPos * 1.5 + vec3(100.0, 0.0, 0.0));
        float caustics = max(caustic1, caustic2) * 0.5 + 0.5;
        caustics = pow(caustics, 3.0);  // Sharpen caustic edges
        pattern = max(pattern, caustics * 0.7);
        animBoost = 1.0 + caustics * 0.5;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // FRESNEL EDGE EFFECT
    // ═══════════════════════════════════════════════════════════════════════════════

    float fresnel = 1.0 - abs(dot(normal, viewDir));
    fresnel = pow(fresnel, 2.5);

    // Edge shimmer
    float edgeShimmer = fresnel * (0.4 + pattern * 0.4);

    // ═══════════════════════════════════════════════════════════════════════════════
    // FLOW ANIMATION (subtle pulsing)
    // ═══════════════════════════════════════════════════════════════════════════════

    // Position-based flow offset for variation
    float flowOffset = snoise(vPosition * 2.0) * 1.5;
    float flowPulse = sin(uTime * uFlowSpeed * 0.002 + flowOffset) * 0.1 + 0.9;

    // Micro-shimmer
    float microShimmer = 0.95 + 0.05 * snoise(vec3(uTime * 0.003, vPosition.yz * 4.0));
    flowPulse *= microShimmer;

    // ═══════════════════════════════════════════════════════════════════════════════
    // COLOR CALCULATION
    // ═══════════════════════════════════════════════════════════════════════════════

    // Local intensity from pattern and flow
    float localIntensity = pattern * flowPulse * animBoost + edgeShimmer * 0.25;
    localIntensity = clamp(localIntensity, 0.0, 1.0);

    // Get water color
    vec3 color = waterColor(localIntensity, uTurbulence);

    // Apply tint
    color *= uTint;

    // Apply intensity multiplier
    color *= uIntensity * (0.7 + localIntensity * 0.3);

    // ═══════════════════════════════════════════════════════════════════════════════
    // ALPHA CALCULATION
    // ═══════════════════════════════════════════════════════════════════════════════

    // Base alpha - intensity-driven with lower floor
    float alpha = (0.25 + localIntensity * 0.6) * uOpacity;

    // For ROTATING_ARC, apply soft alpha fade at arc edges (discard already done above)
    if (uAnimationType == 1) {
        alpha *= smoothstep(0.05, 0.4, arcMask);
    }

    // Edge fade based on displacement
    float surfaceFade = smoothstep(0.0, uEdgeFade, abs(vDisplacement) + 0.05);
    alpha *= mix(0.85, 1.0, surfaceFade);

    // Fresnel adds subtle rim effect
    alpha += fresnel * 0.1;

    // Final alpha
    alpha = clamp(alpha, 0.0, 1.0);

    // Discard faint pixels (but not for ROTATING_ARC which already discarded)
    if (uAnimationType != 1 && alpha < 0.1) discard;

    // Minimum brightness - subtle blue floor to mask anchor
    color = max(color, vec3(0.1, 0.2, 0.4) * uIntensity * 0.4);

    gl_FragColor = vec4(color, alpha);
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// MATERIAL FACTORY
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Interpolate between three values based on parameter
 */
function lerp3(low, mid, high, t) {
    if (t < 0.5) {
        return low + (mid - low) * (t * 2);
    }
    return mid + (high - mid) * ((t - 0.5) * 2);
}

/**
 * Animation type constants
 */
export const WATER_ANIMATION_TYPES = {
    NONE: 0,
    ROTATING_ARC: 1,
    RIPPLE_PULSE: 2,
    DRIP_FALL: 3,
    FLOW_STREAM: 4,
    SURFACE_SHIMMER: 5
};

/**
 * Create a procedural water material
 *
 * @param {Object} options - Configuration options
 * @param {number} [options.turbulence=0.5] - Water turbulence (0=calm, 0.5=flow, 1=storm)
 * @param {number} [options.intensity=1.0] - Brightness multiplier
 * @param {number} [options.opacity=0.85] - Base opacity
 * @param {number} [options.displacementStrength=0.06] - Vertex displacement amount
 * @param {number} [options.flowSpeed=1.0] - Flow animation speed
 * @param {number} [options.noiseScale=3.0] - Noise detail level
 * @param {number} [options.edgeFade=0.15] - Soft edge fade distance
 * @param {THREE.Color|number} [options.tint=0xffffff] - Color tint
 * @param {number} [options.animationType=0] - Animation type (see WATER_ANIMATION_TYPES)
 * @param {number} [options.arcWidth=0.8] - Arc width in radians (for rotating-arc)
 * @param {number} [options.arcSpeed=2.0] - Arc rotation speed (for rotating-arc)
 * @param {number} [options.arcCount=1] - Number of arcs (for rotating-arc)
 * @param {number} [options.rippleSpeed=0.5] - Ripple expansion speed (for ripple-pulse)
 * @param {number} [options.rippleCount=3] - Number of ripple rings (for ripple-pulse)
 * @param {number} [options.flowDirection=0] - Flow direction angle in radians (for flow-stream)
 * @returns {THREE.ShaderMaterial}
 */
export function createProceduralWaterMaterial(options = {}) {
    const {
        turbulence = 0.5,
        intensity = null,
        opacity = 0.85,
        displacementStrength = null,
        flowSpeed = null,
        noiseScale = 3.0,
        edgeFade = 0.15,
        tint = 0xffffff,
        // Animation options
        animationType = WATER_ANIMATION_TYPES.NONE,
        arcWidth = 0.8,
        arcSpeed = 2.0,
        arcCount = 1,
        rippleSpeed = 0.5,
        rippleCount = 3,
        flowDirection = 0
    } = options;

    // Derive values from turbulence if not explicitly set
    // Lower intensity for subtler water look (not as bright as fire)
    const finalIntensity = intensity ?? lerp3(0.8, 1.0, 1.2, turbulence);
    const finalDisplacement = displacementStrength ?? lerp3(0.06, 0.1, 0.15, turbulence);
    const finalFlowSpeed = flowSpeed ?? lerp3(0.8, 1.5, 3.0, turbulence);

    // Convert tint to THREE.Color
    const tintColor = tint instanceof THREE.Color ? tint : new THREE.Color(tint);

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uTurbulence: { value: turbulence },
            uIntensity: { value: finalIntensity },
            uFadeProgress: { value: 1.0 },  // Smooth fade for vertex displacement
            uOpacity: { value: opacity },
            uDisplacementStrength: { value: finalDisplacement },
            uFlowSpeed: { value: finalFlowSpeed },
            uNoiseScale: { value: noiseScale },
            uEdgeFade: { value: edgeFade },
            uTint: { value: tintColor },
            // Animation uniforms
            uAnimationType: { value: animationType },
            uArcWidth: { value: arcWidth },
            uArcSpeed: { value: arcSpeed },
            uArcCount: { value: arcCount },
            uRippleSpeed: { value: rippleSpeed },
            uRippleCount: { value: rippleCount },
            uFlowDirection: { value: flowDirection },
            uGestureProgress: { value: 0 },  // 0-1 gesture progress, set by ElementSpawner
            uArcPhase: { value: 0 }          // Formation rotation offset for spiral patterns
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide
    });

    // Store config for external access
    material.userData.turbulence = turbulence;
    material.userData.elementalType = 'water';
    material.userData.isProcedural = true;
    material.userData.animationType = animationType;

    return material;
}

/**
 * Update procedural water material animation
 * Call this each frame for animated water
 *
 * @param {THREE.ShaderMaterial} material - Procedural water material
 * @param {number} deltaTime - Time since last frame in seconds
 */
export function updateProceduralWaterMaterial(material, deltaTime) {
    if (material?.uniforms?.uTime) {
        material.uniforms.uTime.value += deltaTime;
    }
}

/**
 * Set turbulence on existing material
 *
 * @param {THREE.ShaderMaterial} material - Procedural water material
 * @param {number} turbulence - New turbulence (0-1)
 */
export function setProceduralWaterTurbulence(material, turbulence) {
    if (!material?.uniforms) return;

    material.uniforms.uTurbulence.value = turbulence;
    // Match values from createProceduralWaterMaterial
    material.uniforms.uIntensity.value = lerp3(0.8, 1.0, 1.2, turbulence);
    material.uniforms.uDisplacementStrength.value = lerp3(0.06, 0.1, 0.15, turbulence);
    material.uniforms.uFlowSpeed.value = lerp3(0.8, 1.5, 3.0, turbulence);
    material.userData.turbulence = turbulence;
}

/**
 * Set intensity multiplier (for gesture animation integration)
 *
 * @param {THREE.ShaderMaterial} material - Procedural water material
 * @param {number} intensity - Intensity multiplier (0-1, for brightness)
 * @param {number} [fadeProgress=null] - Smooth fade 0-1 (for stable geometry)
 */
export function setProceduralWaterIntensity(material, intensity, fadeProgress = null) {
    if (!material?.uniforms) return;

    // Clamp intensity to small minimum to prevent rendering artifacts at zero
    const clampedIntensity = Math.max(0.01, intensity);

    const turb = material.userData.turbulence || 0.5;
    // Match values from createProceduralWaterMaterial
    const baseIntensity = lerp3(0.8, 1.0, 1.2, turb);
    material.uniforms.uIntensity.value = baseIntensity * clampedIntensity;

    // Set smooth fade progress for vertex displacement
    if (fadeProgress !== null && material.uniforms.uFadeProgress) {
        material.uniforms.uFadeProgress.value = Math.max(0.01, fadeProgress);
    }
}

/**
 * Set water tint color
 *
 * @param {THREE.ShaderMaterial} material - Procedural water material
 * @param {THREE.Color|number} color - New tint color
 */
export function setProceduralWaterTint(material, color) {
    if (!material?.uniforms?.uTint) return;

    const tintColor = color instanceof THREE.Color ? color : new THREE.Color(color);
    material.uniforms.uTint.value.copy(tintColor);
}

/**
 * Set animation type and parameters
 *
 * @param {THREE.ShaderMaterial} material - Procedural water material
 * @param {number} animationType - Animation type (see WATER_ANIMATION_TYPES)
 * @param {Object} [params={}] - Animation-specific parameters
 */
export function setProceduralWaterAnimation(material, animationType, params = {}) {
    if (!material?.uniforms) return;

    material.uniforms.uAnimationType.value = animationType;
    material.userData.animationType = animationType;

    // Set animation-specific parameters
    if (params.arcWidth !== undefined) material.uniforms.uArcWidth.value = params.arcWidth;
    if (params.arcSpeed !== undefined) material.uniforms.uArcSpeed.value = params.arcSpeed;
    if (params.arcCount !== undefined) material.uniforms.uArcCount.value = params.arcCount;
    if (params.rippleSpeed !== undefined) material.uniforms.uRippleSpeed.value = params.rippleSpeed;
    if (params.rippleCount !== undefined) material.uniforms.uRippleCount.value = params.rippleCount;
    if (params.flowDirection !== undefined) material.uniforms.uFlowDirection.value = params.flowDirection;
}

/**
 * Configure rotating-arc animation (splash ring)
 *
 * @param {THREE.ShaderMaterial} material - Procedural water material
 * @param {Object} [options={}] - Arc options
 * @param {number} [options.width=0.8] - Arc width in radians
 * @param {number} [options.speed=2.0] - Rotation speed
 * @param {number} [options.count=1] - Number of arcs (1-8)
 */
export function setRotatingArc(material, options = {}) {
    setProceduralWaterAnimation(material, WATER_ANIMATION_TYPES.ROTATING_ARC, {
        arcWidth: options.width ?? 0.8,
        arcSpeed: options.speed ?? 2.0,
        arcCount: Math.min(8, options.count ?? 1)
    });
}

/**
 * Configure ripple-pulse animation (expanding rings)
 *
 * @param {THREE.ShaderMaterial} material - Procedural water material
 * @param {Object} [options={}] - Ripple options
 * @param {number} [options.speed=0.5] - Expansion speed
 * @param {number} [options.count=3] - Number of rings (1-5)
 */
export function setRipplePulse(material, options = {}) {
    setProceduralWaterAnimation(material, WATER_ANIMATION_TYPES.RIPPLE_PULSE, {
        rippleSpeed: options.speed ?? 0.5,
        rippleCount: Math.min(5, options.count ?? 3)
    });
}

/**
 * Configure flow-stream animation (directional flow)
 *
 * @param {THREE.ShaderMaterial} material - Procedural water material
 * @param {Object} [options={}] - Flow options
 * @param {number} [options.direction=0] - Flow direction in radians
 */
export function setFlowStream(material, options = {}) {
    setProceduralWaterAnimation(material, WATER_ANIMATION_TYPES.FLOW_STREAM, {
        flowDirection: options.direction ?? 0
    });
}

/**
 * Get physics configuration for procedural water
 *
 * @param {number} turbulence - Turbulence parameter 0-1
 * @returns {Object} Physics configuration
 */
export function getProceduralWaterPhysics(turbulence = 0.5) {
    return {
        gravity: lerp3(0.8, 1.0, 1.2, turbulence),
        drag: lerp3(0.15, 0.1, 0.05, turbulence),
        bounce: lerp3(0.1, 0.2, 0.3, turbulence),
        lifetime: lerp3(3.0, 2.0, 1.2, turbulence),
        fadeOut: true,
        splashIntensity: lerp3(0.3, 0.6, 1.0, turbulence),
        viscosity: lerp3(0.8, 0.5, 0.2, turbulence)
    };
}

export default {
    createProceduralWaterMaterial,
    updateProceduralWaterMaterial,
    setProceduralWaterTurbulence,
    setProceduralWaterIntensity,
    setProceduralWaterTint,
    setProceduralWaterAnimation,
    setRotatingArc,
    setRipplePulse,
    setFlowStream,
    getProceduralWaterPhysics,
    WATER_ANIMATION_TYPES
};
