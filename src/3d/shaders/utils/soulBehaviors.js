/**
 * SoulBehaviors — Pluggable energy animation patterns for CrystalSoul
 *
 * Each behavior defines HOW energy moves around the soul geometry.
 * Selected at runtime via integer uniform (no shader recompilation).
 * Follows WetnessCore pattern: GLSL strings + JS API in one module.
 *
 * REQUIRES: noise3D(vec3) must be defined in the host shader before
 * the function GLSL block is injected.
 */

// ─────────────────────────────────────────────────────────────────────
// JS Enum + Name Lookup
// ─────────────────────────────────────────────────────────────────────

export const SOUL_BEHAVIORS = {
    NEBULA_DRIFT: 0,
    SPIRAL_FLOW: 1,
    TIDAL_BREATHING: 2,
    ORBITAL_RINGS: 3,
    RADIAL_PULSE: 4,
    WANDERING_HOTSPOT: 5,
};

export const SOUL_BEHAVIOR_COUNT = 6;

export const SOUL_BEHAVIOR_NAMES = {
    nebula: SOUL_BEHAVIORS.NEBULA_DRIFT,
    spiral: SOUL_BEHAVIORS.SPIRAL_FLOW,
    tidal: SOUL_BEHAVIORS.TIDAL_BREATHING,
    orbital: SOUL_BEHAVIORS.ORBITAL_RINGS,
    radial: SOUL_BEHAVIORS.RADIAL_PULSE,
    hotspot: SOUL_BEHAVIORS.WANDERING_HOTSPOT,
};

// ─────────────────────────────────────────────────────────────────────
// GLSL Uniform Declarations
// ─────────────────────────────────────────────────────────────────────

export const SOUL_BEHAVIOR_UNIFORMS_GLSL = /* glsl */ `
    // Soul behavior system (soulBehaviors.js)
    // Current mix pair (AB)
    uniform int uBehaviorMode;
    uniform int uBehaviorModeB;
    uniform float uBehaviorBlend;     // 0.0 = all A, 1.0 = all B
    // Crossfade target pair (CD)
    uniform int uBehaviorModeC;
    uniform int uBehaviorModeD;
    uniform float uBehaviorBlendCD;   // 0.0 = all C, 1.0 = all D
    uniform float uBehaviorCrossfade; // 0.0 = current (AB), 1.0 = target (CD)
    uniform float uBehaviorSpeed;
    uniform float uBaselineStrength;  // 0.0 = no baseline, 1.0 = full nebula floor
`;

// ─────────────────────────────────────────────────────────────────────
// GLSL Behavior Functions + Dispatch
// ─────────────────────────────────────────────────────────────────────

export const SOUL_BEHAVIOR_FUNC_GLSL = /* glsl */ `
    // ═══════════════════════════════════════════════════════════════════
    // SOUL BEHAVIOR SYSTEM — Pluggable energy patterns
    //
    // Each behavior returns a float energy value centered around 0.53
    // with subtle variation up to ~0.60. This feeds into the existing
    // color pipeline: energy → totalEnergy → coreColor → ghost mode
    //
    // REQUIRES: noise3D(vec3) defined before this block.
    // ═══════════════════════════════════════════════════════════════════

    // --- Behavior 0: Nebula Drift (default — extracted from original inline code) ---
    float soulBehaviorNebula(vec3 pos, float time,
        float driftEnabled, float driftSpeed,
        float crossWaveEnabled, float crossWaveSpeed,
        float phaseOffset1, float phaseOffset2, float phaseOffset3,
        float behaviorSpeed)
    {
        // 3-phase 120° spatial zones
        float angle = atan(pos.x, pos.z);
        float normalizedAngle = (angle + 3.14159) / 6.28318;
        float zone = floor(normalizedAngle * 3.0);

        float phaseSpeed = 0.15 * behaviorSpeed;
        float t = time * phaseSpeed;
        float phase1Time = sin(t + phaseOffset1) * 0.5 + 0.5;
        float phase2Time = sin(t + phaseOffset2) * 0.5 + 0.5;
        float phase3Time = sin(t + phaseOffset3) * 0.5 + 0.5;
        float activePhase = zone < 1.0 ? phase1Time : (zone < 2.0 ? phase2Time : phase3Time);

        float driftEnergy = 0.0;
        if (driftEnabled > 0.5) {
            float dt = time * driftSpeed * behaviorSpeed;
            float drift1 = noise3D(pos * 2.0 + vec3(dt, dt * 0.7, dt * 0.3));
            float primaryDrift = max(0.0, drift1 - 0.3) * 1.5;
            float drift2 = noise3D(pos * 2.5 - vec3(dt * 0.6, dt * 0.4, dt));
            float secondaryDrift = max(0.0, drift2 - 0.3) * 1.5;
            driftEnergy = primaryDrift + secondaryDrift;
        }

        float crossWaveEnergy = 0.0;
        if (crossWaveEnabled > 0.5) {
            float ct = time * crossWaveSpeed * behaviorSpeed;
            float wave = sin(pos.x * 4.0 + pos.z * 2.0 - ct) * 0.5 + 0.5;
            crossWaveEnergy = pow(wave, 2.5);
        }

        float normalizedDrift = min(1.0, driftEnergy * 0.5);
        float remappedPhase = 0.53 + activePhase * 0.05;
        float effectContrib = (normalizedDrift * 0.03) + (crossWaveEnergy * 0.02);
        return remappedPhase + effectContrib;
    }

    // --- Behavior 1: Spiral Flow ---
    float soulBehaviorSpiral(vec3 pos, float time, float behaviorSpeed) {
        float t = time * 0.3 * behaviorSpeed;
        float angle = atan(pos.x, pos.z);
        float height = pos.y;
        // Primary helix: angle + height coupled with time for corkscrew
        float helix = sin(angle * 2.0 - height * 4.0 + t * 6.28318) * 0.5 + 0.5;
        helix = pow(helix, 2.0);
        // Counter-helix for depth
        float helix2 = sin(-angle * 1.5 + height * 3.0 + t * 4.0) * 0.5 + 0.5;
        helix2 = pow(helix2, 2.5) * 0.4;
        // Noise breakup so helices aren't perfectly smooth
        float breakup = noise3D(pos * 3.0 + vec3(0.0, t, 0.0));
        return 0.53 + (helix + helix2) * breakup * 0.07;
    }

    // --- Behavior 2: Tidal Breathing ---
    float soulBehaviorTidal(vec3 pos, float time, float behaviorSpeed) {
        float t = time * 0.2 * behaviorSpeed;
        // Tide level oscillates between bottom and top
        float tideLevel = sin(t * 3.14159) * 0.8;
        float distFromTide = pos.y - tideLevel;
        // Bright below tide surface, dark above
        float tideMask = 1.0 - smoothstep(0.0, 0.25, distFromTide);
        // Thin bright crest band at surface (softened for gentler pulse)
        float crest = exp(-distFromTide * distFromTide * 40.0);
        // Surface turbulence
        float turbulence = noise3D(pos * 4.0 + vec3(t * 0.5, 0.0, t * 0.3)) * 0.15;
        return 0.53 + (tideMask * 0.04) + (crest * 0.03) + turbulence * tideMask * 0.02;
    }

    // --- Behavior 3: Orbital Rings ---
    float soulBehaviorOrbital(vec3 pos, float time, float behaviorSpeed) {
        float t = time * 0.25 * behaviorSpeed;
        float energy = 0.0;
        // Ring 1: tilted 30° around X, orbiting around Y
        float d1 = abs(pos.y * 0.866 - pos.z * 0.5 + sin(t * 2.0) * 0.1);
        energy += exp(-d1 * d1 * 200.0) * (0.8 + 0.2 * sin(atan(pos.x, pos.z) * 3.0 + t * 4.0));
        // Ring 2: tilted -45° around X, different speed
        float d2 = abs(pos.y * 0.707 + pos.z * 0.707 + sin(t * 1.5 + 2.094) * 0.15);
        energy += exp(-d2 * d2 * 180.0) * (0.7 + 0.3 * sin(atan(pos.x, pos.z) * 2.0 - t * 3.0));
        // Ring 3: tilted 60° around Z
        float d3 = abs(pos.y * 0.5 - pos.x * 0.866 + sin(t * 1.8 + 4.189) * 0.12);
        energy += exp(-d3 * d3 * 160.0) * (0.6 + 0.4 * sin(atan(pos.z, pos.x) * 4.0 + t * 5.0));
        return 0.53 + min(energy, 1.0) * 0.07;
    }

    // --- Behavior 4: Radial Pulse ---
    // Dual overlapping wavefronts offset by half-cycle.
    // Prevents light-switch effect: one is always fading in as the other fades out.
    float soulBehaviorRadial(vec3 pos, float time, float behaviorSpeed) {
        float t = time * 0.2 * behaviorSpeed;
        float dist = length(pos);

        // Wavefront A
        float phaseA = fract(t * 0.3);
        float radiusA = phaseA * 1.5;
        float shellA = exp(-(dist - radiusA) * (dist - radiusA) * 20.0);
        // Smooth fade: raised cosine (0→1→0 over cycle, no discontinuity)
        float fadeA = 0.5 + 0.5 * cos(phaseA * 6.28318);
        float energyA = shellA * fadeA;

        // Wavefront B — half-cycle offset
        float phaseB = fract(t * 0.3 + 0.5);
        float radiusB = phaseB * 1.5;
        float shellB = exp(-(dist - radiusB) * (dist - radiusB) * 20.0);
        float fadeB = 0.5 + 0.5 * cos(phaseB * 6.28318);
        float energyB = shellB * fadeB;

        float energy = max(energyA, energyB);

        // Noise breaks perfect spherical symmetry
        float noiseMod = noise3D(normalize(pos + vec3(0.001)) * 5.0 + vec3(t * 0.2));
        energy *= (0.7 + noiseMod * 0.3);
        return 0.53 + min(energy, 1.0) * 0.07;
    }

    // --- Behavior 5: Wandering Hotspot ---
    float soulBehaviorHotspot(vec3 pos, float time, float behaviorSpeed) {
        float t = time * 0.15 * behaviorSpeed;
        // 3D Lissajous curve for hotspot position
        vec3 hotspot = vec3(
            sin(t * 2.0) * 0.25,
            sin(t * 3.0 + 1.5708) * 0.2,
            sin(t * 2.5 + 3.14159) * 0.25
        );
        float dist = length(pos - hotspot);
        float core = exp(-dist * dist * 30.0);
        // Trailing ghost positions (dimmer, wider)
        vec3 trail1 = vec3(
            sin((t - 0.3) * 2.0) * 0.25,
            sin((t - 0.3) * 3.0 + 1.5708) * 0.2,
            sin((t - 0.3) * 2.5 + 3.14159) * 0.25
        );
        float trailGlow1 = exp(-length(pos - trail1) * length(pos - trail1) * 20.0) * 0.5;
        vec3 trail2 = vec3(
            sin((t - 0.6) * 2.0) * 0.25,
            sin((t - 0.6) * 3.0 + 1.5708) * 0.2,
            sin((t - 0.6) * 2.5 + 3.14159) * 0.25
        );
        float trailGlow2 = exp(-length(pos - trail2) * length(pos - trail2) * 15.0) * 0.25;
        float energy = core + trailGlow1 + trailGlow2;
        return 0.53 + min(energy, 1.0) * 0.07;
    }

    // ═══════════════════════════════════════════════════════════════════
    // DISPATCH — Call a behavior by mode index
    // ═══════════════════════════════════════════════════════════════════
    float dispatchSoulBehavior(int mode, vec3 pos, float time, float behaviorSpeed,
        float driftEnabled, float driftSpeed,
        float crossWaveEnabled, float crossWaveSpeed,
        float phaseOffset1, float phaseOffset2, float phaseOffset3)
    {
        if (mode == 0) {
            return soulBehaviorNebula(pos, time,
                driftEnabled, driftSpeed,
                crossWaveEnabled, crossWaveSpeed,
                phaseOffset1, phaseOffset2, phaseOffset3,
                behaviorSpeed);
        } else if (mode == 1) {
            return soulBehaviorSpiral(pos, time, behaviorSpeed);
        } else if (mode == 2) {
            return soulBehaviorTidal(pos, time, behaviorSpeed);
        } else if (mode == 3) {
            return soulBehaviorOrbital(pos, time, behaviorSpeed);
        } else if (mode == 4) {
            return soulBehaviorRadial(pos, time, behaviorSpeed);
        } else {
            return soulBehaviorHotspot(pos, time, behaviorSpeed);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // MIX + CROSSFADE — Baseline floor + active accent
    //
    // Nebula drift always runs as an ambient baseline floor.
    // Active behaviors (AB/CD crossfade system) accentuate on top.
    // uBaselineStrength controls how much baseline shows (0 = off, 1 = full).
    // ═══════════════════════════════════════════════════════════════════
    float calculateSoulBehavior(vec3 pos, float time, float behaviorSpeed,
        float driftEnabled, float driftSpeed,
        float crossWaveEnabled, float crossWaveSpeed,
        float phaseOffset1, float phaseOffset2, float phaseOffset3)
    {
        // Always-on baseline: nebula drift provides ambient energy floor
        float baseline = soulBehaviorNebula(pos, time,
            driftEnabled, driftSpeed, crossWaveEnabled, crossWaveSpeed,
            phaseOffset1, phaseOffset2, phaseOffset3, behaviorSpeed);
        float baseEnergy = baseline - 0.53; // [0, ~0.07]

        // Current mix (AB pair)
        float energyA = dispatchSoulBehavior(uBehaviorMode, pos, time, behaviorSpeed,
            driftEnabled, driftSpeed, crossWaveEnabled, crossWaveSpeed,
            phaseOffset1, phaseOffset2, phaseOffset3);
        float currentMix = energyA;
        if (uBehaviorBlend > 0.001) {
            float energyB = dispatchSoulBehavior(uBehaviorModeB, pos, time, behaviorSpeed,
                driftEnabled, driftSpeed, crossWaveEnabled, crossWaveSpeed,
                phaseOffset1, phaseOffset2, phaseOffset3);
            currentMix = mix(energyA, energyB, uBehaviorBlend);
        }

        // Crossfade to target (CD pair) if active
        if (uBehaviorCrossfade >= 0.001) {
            float energyC = dispatchSoulBehavior(uBehaviorModeC, pos, time, behaviorSpeed,
                driftEnabled, driftSpeed, crossWaveEnabled, crossWaveSpeed,
                phaseOffset1, phaseOffset2, phaseOffset3);
            float targetMix = energyC;
            if (uBehaviorBlendCD > 0.001) {
                float energyD = dispatchSoulBehavior(uBehaviorModeD, pos, time, behaviorSpeed,
                    driftEnabled, driftSpeed, crossWaveEnabled, crossWaveSpeed,
                    phaseOffset1, phaseOffset2, phaseOffset3);
                targetMix = mix(energyC, energyD, uBehaviorBlendCD);
            }
            currentMix = mix(currentMix, targetMix, uBehaviorCrossfade);
        }

        float activeEnergy = currentMix - 0.53; // [0, ~0.07]

        // Combine: baseline floor + active accent
        // Peaks from both add together → more dynamic range
        return 0.53 + baseEnergy * uBaselineStrength + activeEnergy;
    }
`;

// ─────────────────────────────────────────────────────────────────────
// JS API
// ─────────────────────────────────────────────────────────────────────

export const SOUL_BEHAVIOR_DEFAULTS = {
    behaviorMode: SOUL_BEHAVIORS.NEBULA_DRIFT,
    behaviorSpeed: 1.0,
    baselineStrength: 0.5, // Nebula floor at half-strength by default
};

export function createSoulBehaviorUniforms(defaults = {}) {
    const mode = defaults.behaviorMode ?? SOUL_BEHAVIOR_DEFAULTS.behaviorMode;
    return {
        uBehaviorMode: { value: mode },
        uBehaviorModeB: { value: mode },
        uBehaviorBlend: { value: 0.0 },
        uBehaviorModeC: { value: mode },
        uBehaviorModeD: { value: mode },
        uBehaviorBlendCD: { value: 0.0 },
        uBehaviorCrossfade: { value: 0.0 },
        uBehaviorSpeed: { value: defaults.behaviorSpeed ?? SOUL_BEHAVIOR_DEFAULTS.behaviorSpeed },
        uBaselineStrength: {
            value: defaults.baselineStrength ?? SOUL_BEHAVIOR_DEFAULTS.baselineStrength,
        },
    };
}

/**
 * Resolve mode to integer (accepts string name or int)
 */
export function resolveBehaviorMode(mode) {
    return typeof mode === 'string' ? (SOUL_BEHAVIOR_NAMES[mode] ?? 0) : mode;
}

export function setSoulBehavior(material, mode, speed) {
    if (!material?.uniforms) return;
    if (mode !== undefined) {
        const modeInt = resolveBehaviorMode(mode);
        if (material.uniforms.uBehaviorMode) {
            material.uniforms.uBehaviorMode.value = modeInt;
        }
    }
    if (speed !== undefined && material.uniforms.uBehaviorSpeed) {
        material.uniforms.uBehaviorSpeed.value = Math.max(0.1, Math.min(5.0, speed));
    }
}

export function resetSoulBehavior(material) {
    if (!material?.uniforms) return;
    const u = material.uniforms;
    const mode = SOUL_BEHAVIOR_DEFAULTS.behaviorMode;
    if (u.uBehaviorMode) u.uBehaviorMode.value = mode;
    if (u.uBehaviorModeB) u.uBehaviorModeB.value = mode;
    if (u.uBehaviorBlend) u.uBehaviorBlend.value = 0.0;
    if (u.uBehaviorModeC) u.uBehaviorModeC.value = mode;
    if (u.uBehaviorModeD) u.uBehaviorModeD.value = mode;
    if (u.uBehaviorBlendCD) u.uBehaviorBlendCD.value = 0.0;
    if (u.uBehaviorCrossfade) u.uBehaviorCrossfade.value = 0.0;
    if (u.uBehaviorSpeed) u.uBehaviorSpeed.value = SOUL_BEHAVIOR_DEFAULTS.behaviorSpeed;
    if (u.uBaselineStrength) u.uBaselineStrength.value = SOUL_BEHAVIOR_DEFAULTS.baselineStrength;
}
