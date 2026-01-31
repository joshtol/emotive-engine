/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Instanced Fire Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview GPU-instanced version of ProceduralFireMaterial
 * @module materials/InstancedFireMaterial
 *
 * Uses per-instance attributes for:
 * - Time-offset animation (each instance has its own local time)
 * - Model selection (merged geometry with multiple fire model variants)
 * - Trail rendering (main + 3 trail copies per logical element)
 * - Spawn/exit fade transitions
 * - Velocity for motion blur
 *
 * This material is designed to work with ElementInstancePool for
 * GPU-efficient rendering of many fire elements with a single draw call.
 */

import * as THREE from 'three';
import {
    INSTANCED_ATTRIBUTES_VERTEX,
    INSTANCED_ATTRIBUTES_FRAGMENT,
    createInstancedUniforms
} from './InstancedShaderUtils.js';

// ═══════════════════════════════════════════════════════════════════════════════════════
// NOISE UTILITIES (GLSL) - Same as ProceduralFireMaterial
// ═══════════════════════════════════════════════════════════════════════════════════════

const NOISE_GLSL = /* glsl */`
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

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

float fbm3(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for (int i = 0; i < 3; i++) {
        value += amplitude * snoise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

float turbulence(vec3 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for (int i = 0; i < 3; i++) {
        if (i >= octaves) break;
        value += amplitude * abs(snoise(p * frequency));
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// FIRE COLOR UTILITIES (GLSL)
// ═══════════════════════════════════════════════════════════════════════════════════════

const FIRE_COLOR_GLSL = /* glsl */`
vec3 fireColor(float t, float temperature) {
    float heat = t * (0.5 + temperature * 0.5);
    vec3 color;

    if (heat < 0.25) {
        float f = heat / 0.25;
        color = vec3(0.5 + f * 0.5, f * 0.2, 0.0);
    } else if (heat < 0.5) {
        float f = (heat - 0.25) / 0.25;
        color = vec3(1.0, 0.2 + f * 0.6, f * 0.1);
    } else if (heat < 0.75) {
        float f = (heat - 0.5) / 0.25;
        color = vec3(1.0, 0.8 + f * 0.2, 0.1 + f * 0.6);
    } else {
        float f = (heat - 0.75) / 0.25;
        color = vec3(1.0 - f * 0.2, 1.0, 0.7 + f * 0.3);
    }

    return color;
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// INSTANCED VERTEX SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════

const VERTEX_SHADER = /* glsl */`
// Standard uniforms
uniform float uGlobalTime;
uniform float uFadeInDuration;
uniform float uFadeOutDuration;
uniform float uFlameHeight;
uniform float uTurbulence;
uniform float uDisplacementStrength;

// Arc visibility uniforms (for vortex effects)
uniform int uAnimationType;      // 0=none, 1=rotating arc
uniform float uArcWidth;         // Arc width in radians
uniform float uArcSpeed;         // Rotations per gesture
uniform int uArcCount;           // Number of visible arcs
uniform float uGestureProgress;  // 0-1 gesture progress
// Note: Arc phase is now a per-instance attribute (aArcPhase) from InstancedShaderUtils

// Per-instance attributes
${INSTANCED_ATTRIBUTES_VERTEX}

// Varyings to fragment
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vViewDir;
varying float vDisplacement;
varying float vVerticalGradient;
varying float vArcVisibility;  // 0-1 visibility based on arc position

${NOISE_GLSL}

void main() {
    // ═══════════════════════════════════════════════════════════════════════════════
    // INSTANCING: Calculate local time and fade
    // ═══════════════════════════════════════════════════════════════════════════════

    vLocalTime = uGlobalTime - aSpawnTime;

    // Trail instances have delayed local time
    float trailDelay = max(0.0, aTrailIndex) * 0.05;
    float effectiveLocalTime = max(0.0, vLocalTime - trailDelay);

    // Fade in/out
    float fadeIn = clamp(effectiveLocalTime / uFadeInDuration, 0.0, 1.0);
    float fadeOut = 1.0;
    if (aExitTime > 0.0) {
        float exitElapsed = uGlobalTime - aExitTime;
        fadeOut = 1.0 - clamp(exitElapsed / uFadeOutDuration, 0.0, 1.0);
    }

    // Trail fade
    vTrailFade = aTrailIndex < 0.0 ? 1.0 : (1.0 - (aTrailIndex + 1.0) * 0.25);
    vInstanceAlpha = fadeIn * fadeOut * aInstanceOpacity * vTrailFade;

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
    // FIRE ANIMATION (using local time, not global)
    // ═══════════════════════════════════════════════════════════════════════════════

    vPosition = selectedPosition;
    // Note: Normal transform will be done after instanceMatrix is applied

    float modelHeight = 1.0;
    vVerticalGradient = (selectedPosition.y + 0.5) / modelHeight;
    vVerticalGradient = clamp(vVerticalGradient, 0.0, 1.0);

    // Use instance fade for displacement
    float fadeFactor = fadeIn * fadeOut;

    // Add random seed variation for per-instance uniqueness
    float instanceVariation = aRandomSeed * 0.3;

    // Noise-based displacement (using local time for time-offset animation)
    vec3 noisePos = selectedPosition * 3.0 + vec3(instanceVariation, -effectiveLocalTime * 0.001, instanceVariation);
    float noiseValue = fbm3(noisePos);

    float posVariation = snoise(selectedPosition * 5.0 + vec3(aRandomSeed * 10.0)) * 0.3 + 0.85;

    float heightFactor = pow(vVerticalGradient, 0.5);
    float displacement = noiseValue * uDisplacementStrength * (0.3 + heightFactor * 0.7) * posVariation * fadeFactor;

    vec3 displaced = selectedPosition + selectedNormal * displacement;
    displaced.y += heightFactor * uFlameHeight * (0.5 + noiseValue * 0.5) * fadeFactor;

    float turbX = snoise(noisePos + vec3(100.0, 0.0, 0.0)) * uTurbulence * heightFactor * posVariation * fadeFactor;
    float turbZ = snoise(noisePos + vec3(0.0, 0.0, 100.0)) * uTurbulence * heightFactor * posVariation * fadeFactor;
    displaced.x += turbX * 0.3;
    displaced.z += turbZ * 0.3;

    // Apply trail offset
    displaced += trailOffset;

    vDisplacement = displacement;

    // ═══════════════════════════════════════════════════════════════════════════════
    // CRITICAL: Apply instance matrix for per-instance transforms!
    // instanceMatrix contains position/rotation/scale set in ElementInstancePool
    // ═══════════════════════════════════════════════════════════════════════════════
    vec4 instancePosition = instanceMatrix * vec4(displaced, 1.0);

    // Transform normal with instance matrix
    vNormal = normalMatrix * mat3(instanceMatrix) * selectedNormal;

    vec4 worldPos = modelMatrix * instancePosition;
    vWorldPosition = worldPos.xyz;
    vViewDir = normalize(cameraPosition - worldPos.xyz);

    // ═══════════════════════════════════════════════════════════════════════════════
    // ARC VISIBILITY (for vortex ring effects)
    // ═══════════════════════════════════════════════════════════════════════════════
    vArcVisibility = 1.0;
    if (uAnimationType == 1) {
        // Calculate angle of this vertex in local XZ plane
        float vertexAngle = atan(selectedPosition.z, selectedPosition.x);

        // Arc center rotates based on gesture progress + per-instance phase offset
        // For vortex effects, aRandomSeed stores the arc phase (rotationOffset) instead of random value
        float arcAngle = uGestureProgress * uArcSpeed * 6.28318 + aRandomSeed;

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

    gl_Position = projectionMatrix * modelViewMatrix * instancePosition;
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// INSTANCED FRAGMENT SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════

const FRAGMENT_SHADER = /* glsl */`
uniform float uGlobalTime;
uniform float uTemperature;
uniform float uIntensity;
uniform float uOpacity;
uniform float uFlickerSpeed;
uniform float uFlickerAmount;
uniform float uNoiseScale;
uniform float uEdgeFade;

// Arc visibility uniforms
uniform int uAnimationType;

// Instancing varyings
${INSTANCED_ATTRIBUTES_FRAGMENT}

varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vViewDir;
varying float vDisplacement;
varying float vVerticalGradient;
varying float vArcVisibility;

${NOISE_GLSL}
${FIRE_COLOR_GLSL}

void main() {
    // Early discard for fully faded instances
    if (vInstanceAlpha < 0.01) discard;

    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewDir);

    // Use local time for animation
    float localTime = vLocalTime;

    // Flame pattern generation (using local time for time-offset)
    vec3 noisePos = vPosition * uNoiseScale + vec3(0.0, -localTime * 0.00085, 0.0);
    float flame = turbulence(noisePos, 3);

    vec3 detailPos = noisePos * 2.0 + vec3(localTime * 0.00015, 0.0, localTime * 0.0001);
    float detail = snoise(detailPos) * 0.5 + 0.5;

    float posVariation = snoise(vPosition * 7.0) * 0.15 + 0.92;
    flame = (flame * 0.7 + detail * 0.3) * posVariation;

    // Vertical fade
    float verticalFade = 1.0 - pow(vVerticalGradient, 1.5);
    float tipBrightness = smoothstep(0.7, 0.9, vVerticalGradient) * flame * 0.5;

    // Flicker (using local time)
    float flickerOffset = snoise(vPosition * 3.0) * 2.0;
    float flicker = 1.0 - uFlickerAmount + uFlickerAmount *
        (snoise(vec3(localTime * uFlickerSpeed + flickerOffset, vPosition.y * 5.0, vPosition.x * 3.0)) * 0.5 + 0.5);
    float microFlicker = 0.95 + 0.05 * snoise(vec3(localTime * 0.004, vPosition.yz * 6.0));
    flicker *= microFlicker;

    // Fresnel edge glow
    float fresnel = 1.0 - abs(dot(normal, viewDir));
    fresnel = pow(fresnel, 2.0);
    float edgeGlow = fresnel * (0.5 + flame * 0.5);

    // Color calculation
    float localIntensity = flame * verticalFade * flicker + tipBrightness + edgeGlow * 0.3;
    localIntensity = clamp(localIntensity, 0.0, 1.0);

    vec3 color = fireColor(localIntensity, uTemperature);
    color *= uIntensity * (0.7 + localIntensity * 0.3);

    // Alpha calculation
    float alpha = localIntensity * uOpacity;
    float surfaceFade = smoothstep(0.0, uEdgeFade, vDisplacement);
    alpha *= mix(1.0, surfaceFade, 0.5);
    alpha *= mix(1.0, 1.0 - vVerticalGradient * 0.5, 0.3);
    alpha += fresnel * 0.2 * flame;
    alpha = clamp(alpha, 0.0, 1.0);

    // Apply instance alpha (spawn/exit fade + trail fade)
    alpha *= vInstanceAlpha;

    // Apply arc visibility (for vortex effects)
    if (uAnimationType == 1) {
        alpha *= vArcVisibility;
    }

    if (alpha < 0.12) discard;

    color = max(color, vec3(0.6, 0.25, 0.0) * uIntensity * 0.7);

    gl_FragColor = vec4(color, alpha);
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// MATERIAL FACTORY
// ═══════════════════════════════════════════════════════════════════════════════════════

function lerp3(low, mid, high, t) {
    if (t < 0.5) {
        return low + (mid - low) * (t * 2);
    }
    return mid + (high - mid) * ((t - 0.5) * 2);
}

/**
 * Create an instanced procedural fire material
 *
 * @param {Object} options - Configuration options
 * @param {number} [options.temperature=0.5] - Fire temperature (0=embers, 0.5=fire, 1=plasma)
 * @param {number} [options.intensity=2.5] - Brightness multiplier
 * @param {number} [options.opacity=0.85] - Base opacity
 * @param {number} [options.flameHeight=0.08] - Vertical flame extension
 * @param {number} [options.turbulence=0.03] - Lateral wobble
 * @param {number} [options.displacementStrength=0.04] - Vertex displacement
 * @param {number} [options.noiseScale=4.0] - Noise detail level
 * @param {number} [options.flickerSpeed=3.0] - Flicker speed
 * @param {number} [options.flickerAmount=0.2] - Flicker variance
 * @param {number} [options.edgeFade=0.25] - Edge fade distance
 * @param {number} [options.fadeInDuration=0.3] - Spawn fade duration
 * @param {number} [options.fadeOutDuration=0.5] - Exit fade duration
 * @returns {THREE.ShaderMaterial}
 */
export function createInstancedFireMaterial(options = {}) {
    const {
        temperature = 0.5,
        intensity = null,
        opacity = 0.85,
        flameHeight = 0.08,
        turbulence = 0.03,
        displacementStrength = 0.04,
        noiseScale = 4.0,
        flickerSpeed = null,
        flickerAmount = null,
        edgeFade = 0.25,
        fadeInDuration = 0.3,
        fadeOutDuration = 0.5
    } = options;

    const finalIntensity = intensity ?? lerp3(1.5, 2.5, 4.0, temperature);
    const finalFlickerSpeed = flickerSpeed ?? lerp3(0.001, 0.002, 0.003, temperature);
    const finalFlickerAmount = flickerAmount ?? lerp3(0.15, 0.12, 0.08, temperature);

    const material = new THREE.ShaderMaterial({
        uniforms: {
            // Instancing uniforms
            uGlobalTime: { value: 0 },
            uFadeInDuration: { value: fadeInDuration },
            uFadeOutDuration: { value: fadeOutDuration },
            // Arc visibility uniforms (for vortex effects)
            uAnimationType: { value: 0 },      // 0=none, 1=rotating arc
            uArcWidth: { value: 0.5 },         // Arc width (0.5 ≈ 29% visible)
            uArcSpeed: { value: 1.0 },         // 1 rotation per gesture
            uArcCount: { value: 1 },           // 1 arc per ring
            uGestureProgress: { value: 0.0 },  // 0-1 gesture progress
            // Note: Arc phase is now a per-instance attribute (aArcPhase), not a uniform
            // Fire uniforms
            uTemperature: { value: temperature },
            uIntensity: { value: finalIntensity },
            uOpacity: { value: opacity },
            uFlameHeight: { value: flameHeight },
            uTurbulence: { value: turbulence },
            uDisplacementStrength: { value: displacementStrength },
            uNoiseScale: { value: noiseScale },
            uFlickerSpeed: { value: finalFlickerSpeed },
            uFlickerAmount: { value: finalFlickerAmount },
            uEdgeFade: { value: edgeFade }
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
    });

    material.userData.temperature = temperature;
    material.userData.elementalType = 'fire';
    material.userData.isProcedural = true;
    material.userData.isInstanced = true;

    return material;
}

/**
 * Update the global time uniform for instanced fire material
 * @param {THREE.ShaderMaterial} material - Instanced fire material
 * @param {number} time - Current global time in seconds
 * @param {number} [gestureProgress=0] - Gesture progress 0-1 (for arc animation)
 */
export function updateInstancedFireMaterial(material, time, gestureProgress = 0) {
    if (material?.uniforms?.uGlobalTime) {
        material.uniforms.uGlobalTime.value = time;
    }
    if (material?.uniforms?.uGestureProgress) {
        material.uniforms.uGestureProgress.value = gestureProgress;
    }
}

/**
 * Configure arc visibility animation for vortex effects
 * Note: Arc phase is now a per-instance attribute (aArcPhase), set via ElementInstancePool.
 * Each ring in a formation gets its own arc phase based on rotationOffset.
 * @param {THREE.ShaderMaterial} material - Instanced fire material
 * @param {Object} config - Arc animation config
 * @param {number} [config.type=1] - Animation type (0=none, 1=rotating arc)
 * @param {number} [config.arcWidth=0.5] - Arc width (0.5 ≈ 29% of ring visible)
 * @param {number} [config.arcSpeed=1.0] - Rotations per gesture
 * @param {number} [config.arcCount=1] - Number of visible arcs
 */
export function setInstancedFireArcAnimation(material, config = {}) {
    if (!material?.uniforms) return;

    const {
        type = 1,
        arcWidth = 0.5,
        arcSpeed = 1.0,
        arcCount = 1
    } = config;

    material.uniforms.uAnimationType.value = type;
    material.uniforms.uArcWidth.value = arcWidth;
    material.uniforms.uArcSpeed.value = arcSpeed;
    material.uniforms.uArcCount.value = arcCount;
}

/**
 * Set temperature on existing instanced fire material
 * @param {THREE.ShaderMaterial} material - Instanced fire material
 * @param {number} temperature - New temperature (0-1)
 */
export function setInstancedFireTemperature(material, temperature) {
    if (!material?.uniforms) return;

    material.uniforms.uTemperature.value = temperature;
    material.uniforms.uIntensity.value = lerp3(1.5, 2.5, 4.0, temperature);
    material.uniforms.uFlickerSpeed.value = lerp3(0.001, 0.002, 0.003, temperature);
    material.uniforms.uFlickerAmount.value = lerp3(0.15, 0.12, 0.08, temperature);
    material.userData.temperature = temperature;
}

export default {
    createInstancedFireMaterial,
    updateInstancedFireMaterial,
    setInstancedFireTemperature,
    setInstancedFireArcAnimation
};
