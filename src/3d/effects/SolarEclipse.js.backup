/**
 * Solar Eclipse Effect Manager
 *
 * Orchestrates solar eclipse shadow disk and corona effects.
 * Supports annular and total eclipses with billboarded rendering.
 *
 * SYNCHRONIZATION ARCHITECTURE:
 * - The eclipse effects are updated in ThreeRenderer.render() AFTER sun transforms
 *   are applied to ensure shadow/corona position matches the current frame's sun
 *   position, preventing visible lag during gesture animations.
 * - Shadow disk and corona are always added directly to the scene (not as children)
 *   and manually positioned each frame to maintain billboarding and proper scaling.
 */

import * as THREE from 'three';
import { ECLIPSE_TYPES, getEclipseConfig } from './EclipseTypes.js';
import { BaileysBeads } from './BaileysBeads.js';

export class SolarEclipse {
    /**
     * Create a solar eclipse effect manager
     * @param {THREE.Scene} scene - Three.js scene
     * @param {number} sunRadius - Radius of the sun geometry
     * @param {THREE.Mesh} sunMesh - Sun mesh to parent shadow disk to
     */
    constructor(scene, sunRadius, sunMesh = null) {
        this.scene = scene;
        this.sunRadius = sunRadius;
        this.sunMesh = sunMesh;
        this.eclipseType = ECLIPSE_TYPES.OFF;
        this.previousEclipseType = ECLIPSE_TYPES.OFF; // Store previous type for exit animations
        this.enabled = false;
        this.time = 0;
        this.randomSeed = 12345; // Fixed initial seed - will be randomized on first total eclipse

        // Transition animation state
        this.isTransitioning = false;
        this.transitionProgress = 0;
        this.transitionDuration = 400; // 400ms for quick, snappy eclipse transition
        this.transitionDirection = 'in'; // 'in' or 'out'
        this.manualControl = false; // Flag to disable automatic animation when using sliders

        // Reusable temp objects to avoid per-frame allocations (performance optimization)
        this._directionToCamera = new THREE.Vector3();
        this._up = new THREE.Vector3(0, 1, 0);
        this._right = new THREE.Vector3();
        this._upVector = new THREE.Vector3();
        this._tempOffset = new THREE.Vector3();
        this._tempColor = new THREE.Color(); // Temp color for reuse

        // Create shadow disk
        this.createShadowDisk();

        // Create corona disks (two counter-rotating for dynamic effect)
        this.createCoronaDisk();
        this.createCounterCoronaDisk();

        // Create Bailey's Beads effect
        this.baileysBeads = new BaileysBeads(scene, sunRadius);
    }

    /**
     * Create the shadow disk geometry
     * @private
     */
    createShadowDisk() {
        // Start with a reasonable size - will be scaled in update()
        const initialShadowRadius = this.sunRadius;
        const shadowGeometry = new THREE.CircleGeometry(initialShadowRadius, 64);
        const shadowMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,  // Enable transparency for multiply blending
            opacity: 1.0,
            blending: THREE.MultiplyBlending,  // Black (0,0,0) * CoronaColor = Black (complete occlusion)
            side: THREE.DoubleSide,
            depthWrite: false,   // Don't write to depth buffer (like coronas)
            depthTest: false,    // Don't test depth - always render on top
            fog: false
        });

        this.shadowDisk = new THREE.Mesh(shadowGeometry, shadowMaterial);
        this.shadowDisk.renderOrder = 10000;  // Render AFTER coronas to occlude them

        // Always add to scene, never as child
        this.shadowDisk.position.set(200, 0, 0); // Start off-screen
        this.scene.add(this.shadowDisk);
    }

    /**
     * Create the corona disk geometry with radial wave shader
     * @private
     */
    createCoronaDisk() {
        const coronaRadius = this.sunRadius * 2.05; // x sun diameter
        const coronaGeometry = new THREE.CircleGeometry(coronaRadius, 64);

        // Shader material with radial wave pattern
        const coronaMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                glowColor: { value: new THREE.Color(0.9, 0.95, 1.0) }, // Cool white/blue-white
                intensity: { value: 1.2 },
                randomSeed: { value: this.randomSeed },
                uvRotation: { value: 0.0 }  // UV rotation angle in radians
            },
            vertexShader: `
                uniform float uvRotation;
                varying vec2 vUv;

                void main() {
                    // Rotate UVs around center (0.5, 0.5)
                    vec2 centeredUV = uv - 0.5;
                    float cosRot = cos(uvRotation);
                    float sinRot = sin(uvRotation);
                    mat2 rotMatrix = mat2(cosRot, -sinRot, sinRot, cosRot);
                    vec2 rotatedUV = rotMatrix * centeredUV;
                    vUv = rotatedUV + 0.5;

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 glowColor;
                uniform float intensity;
                uniform float randomSeed;

                varying vec2 vUv;

                // Hash function for pseudo-random variation
                float hash(float n) {
                    return fract(sin(n) * 43758.5453123);
                }

                // 2D hash for more variation
                float hash2(vec2 p) {
                    return fract(sin(dot(p, vec2(12.9898 + randomSeed, 78.233 + randomSeed))) * 43758.5453);
                }

                void main() {
                    // Calculate distance and angle from center
                    vec2 center = vec2(0.5, 0.5);
                    vec2 toCenter = vUv - center;
                    float dist = length(toCenter) * 2.0; // Normalize to 0-1 range
                    float angle = atan(toCenter.y, toCenter.x);  // UVs are already rotated in vertex shader

                    // Shadow edge - where corona starts
                    float shadowEdge = 0.465;

                    // Varied radial streamer pattern with artistic composition
                    float rayIntensity = 0.0;

                    // RULE OF THIRDS: Place 3 hero rays at compositionally strong points
                    // Golden angles based on rule of thirds: 1/3, 2/3, and offset positions
                    float heroAngles[3];
                    heroAngles[0] = hash(randomSeed * 1.234) * 6.28318; // First hero ray (random rotation)
                    heroAngles[1] = heroAngles[0] + 2.0944; // 120° apart (1/3 circle)
                    heroAngles[2] = heroAngles[0] + 4.1888; // 240° apart (2/3 circle)

                    // Process hero rays first (3 extra-long dramatic rays)
                    for (int h = 0; h < 3; h++) {
                        float rayAngle = heroAngles[h];
                        float angleDiff = abs(mod(angle - rayAngle + 3.14159, 6.28318) - 3.14159);

                        // Hero rays: extra long and prominent (fit within 0.535 normalized space)
                        float heroLength = 0.45 + hash(float(h) * 31.415 + randomSeed) * 0.08; // 0.45 to 0.53 (max available, longer!)
                        float heroWidth = 0.15 + hash(float(h) * 27.183 + randomSeed) * 0.15; // 0.15 to 0.3 (thick!)

                        float distFromEdge = dist - shadowEdge;

                        // Ghostly ethereal taper - very gradual falloff
                        float taper = pow(1.0 - clamp(distFromEdge / max(heroLength, 0.001), 0.0, 1.0), 3.0);
                        float rayWidth = heroWidth * taper;

                        // Soft feathered edges instead of hard cutoff
                        float edgeSoftness = 0.08; // Feather distance
                        float angularMask = smoothstep(rayWidth + edgeSoftness, rayWidth - edgeSoftness, angleDiff);

                        // Very gentle radial falloff for ethereal look
                        float radialFalloff = pow(taper, 0.8);

                        // Soft radial range with feathered ends
                        float radialMask = smoothstep(-0.05, 0.0, distFromEdge) *
                                          smoothstep(heroLength + 0.1, heroLength, distFromEdge);

                        float heroIntensity = angularMask * radialFalloff * radialMask * 0.7; // Reduced intensity for ghostly effect
                        rayIntensity = max(rayIntensity, heroIntensity);
                    }

                    // 45 supporting rays with rule-of-thirds-aware distribution
                    for (float i = 0.0; i < 45.0; i++) {
                        // Cluster more rays around hero ray positions (rule of thirds)
                        float clusterTarget = mod(i, 3.0); // Which hero ray to cluster near
                        float clusterAngle = heroAngles[int(clusterTarget)];

                        // Base distribution with clustering tendency
                        float spreadAngle = (i / 45.0) * 6.28318;
                        float clusterPull = (hash(i * 13.579 + randomSeed) - 0.5) * 1.5; // Stronger variation
                        float rayAngle = spreadAngle + clusterPull;

                        float angleDiff = abs(mod(angle - rayAngle + 3.14159, 6.28318) - 3.14159);

                        // Unique random values per ray
                        float random1 = hash(i * 12.9898 + randomSeed);
                        float random2 = hash(i * 78.233 + randomSeed);
                        float random3 = hash(i * 37.719 + randomSeed);
                        float random4 = hash(i * 93.989 + randomSeed);

                        // Varied lengths following power law distribution (more short, fewer long)
                        float lengthVariation = random1 * random1; // Squared for naturalistic distribution
                        float rayLength = 0.1 + lengthVariation * 0.7; // 0.1 to 0.8

                        // 20% chance of long streamers (supporting the hero rays)
                        float isLong = step(0.80, random2);
                        rayLength = mix(rayLength, 0.7 + random3 * 0.6, isLong); // 0.7 to 1.3

                        // Varied widths with power law (more thin, fewer thick)
                        float baseWidth = 0.03 + (random4 * random4) * 0.2; // 0.03 to 0.23 (naturally varied)

                        // Taper: wide at base, narrow at tip
                        float distFromEdge = dist - shadowEdge;

                        // Ghostly ethereal taper - very gradual falloff
                        float taper = pow(1.0 - clamp(distFromEdge / max(rayLength, 0.001), 0.0, 1.0), 3.5);
                        float rayWidth = baseWidth * taper;

                        // Soft feathered edges for ethereal wisps
                        float edgeSoftness = 0.05; // Feather distance for supporting rays
                        float angularMask = smoothstep(rayWidth + edgeSoftness, rayWidth - edgeSoftness, angleDiff);

                        // Very gentle radial falloff for ghostly appearance
                        float radialFalloff = pow(taper, 1.0);

                        // Soft radial range with feathered ends
                        float radialMask = smoothstep(-0.03, 0.0, distFromEdge) *
                                          smoothstep(rayLength + 0.08, rayLength, distFromEdge);

                        float streamerIntensity = angularMask * radialFalloff * radialMask * 0.5; // Reduced for ethereal wisps
                        rayIntensity = max(rayIntensity, streamerIntensity);
                    }

                    // Base corona glow (very thin bright ring for realistic total eclipse)
                    float baseGlow = smoothstep(shadowEdge - 0.01, shadowEdge, dist) *
                                    (1.0 - smoothstep(shadowEdge + 0.02, shadowEdge + 0.04, dist));

                    // Combine: base glow + streamers
                    float finalIntensity = (baseGlow * 0.6 + rayIntensity) * intensity;

                    // Enhanced gradient: white → cool blue-white → deep blue with distance
                    // Distance normalized to corona extent (0 = shadow edge, 1 = far corona)
                    float coronaDist = clamp((dist - shadowEdge) / 0.6, 0.0, 1.0);

                    // Multi-stage color gradient for realistic corona
                    vec3 innerGlow = vec3(1.0, 1.0, 1.0);           // Pure white at base
                    vec3 middleGlow = vec3(0.9, 0.95, 1.0);         // Cool white
                    vec3 outerGlow = vec3(0.6, 0.75, 0.95);         // Pale blue
                    vec3 farGlow = vec3(0.3, 0.5, 0.8);             // Deep blue

                    // Three-stage color mix
                    vec3 coronaColor;
                    if (coronaDist < 0.3) {
                        // Inner: white → cool white
                        coronaColor = mix(innerGlow, middleGlow, coronaDist / 0.3);
                    } else if (coronaDist < 0.7) {
                        // Middle: cool white → pale blue
                        coronaColor = mix(middleGlow, outerGlow, (coronaDist - 0.3) / 0.4);
                    } else {
                        // Outer: pale blue → deep blue
                        coronaColor = mix(outerGlow, farGlow, (coronaDist - 0.7) / 0.3);
                    }

                    vec3 finalColor = coronaColor * finalIntensity;

                    // Enhanced alpha falloff: stronger near shadow, gradual fade to transparent
                    // Quadratic falloff for smooth but noticeable fade
                    float alphaFalloff = pow(1.0 - coronaDist, 1.5);
                    float alpha = finalIntensity * alphaFalloff * 0.95;

                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            blending: THREE.NormalBlending,  // Use alpha blending instead of additive
            depthWrite: false,
            side: THREE.DoubleSide
        });

        this.coronaDisk = new THREE.Mesh(coronaGeometry, coronaMaterial);
        this.coronaDisk.position.set(200, 0, 0); // Start off-screen
        this.coronaDisk.renderOrder = 9998; // Render before shadow (shadow renders at 9990, then coronas on top)
        this.scene.add(this.coronaDisk);
    }

    /**
     * Create counter-rotating corona disk (second layer for moiré effect)
     * @private
     */
    createCounterCoronaDisk() {
        // Reuse geometry from main corona (efficient - shared geometry)
        const coronaGeometry = this.coronaDisk.geometry;

        // Clone material with different random seed for variation
        const counterSeed = this.randomSeed + 5000; // Large offset for visibly different pattern
        const counterMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                glowColor: { value: new THREE.Color(0.9, 0.95, 1.0) },
                intensity: { value: 1.2 },
                randomSeed: { value: counterSeed },
                uvRotation: { value: 0.0 }  // UV rotation angle in radians
            },
            vertexShader: this.coronaDisk.material.vertexShader,
            fragmentShader: this.coronaDisk.material.fragmentShader,
            transparent: true,
            blending: THREE.NormalBlending,  // Use alpha blending instead of additive
            depthWrite: false,
            side: THREE.DoubleSide
        });

        this.counterCoronaDisk = new THREE.Mesh(coronaGeometry, counterMaterial);
        this.counterCoronaDisk.position.set(200, 0, 0); // Start off-screen
        this.counterCoronaDisk.renderOrder = 9997; // Render before main corona and shadow
        this.scene.add(this.counterCoronaDisk);
    }

    /**
     * Set eclipse type (annular, total, or off)
     * Triggers transition animation when type changes
     * @param {string} eclipseType - Eclipse type from ECLIPSE_TYPES
     */
    setEclipseType(eclipseType) {
        // Reset logging flags
        this._loggedShaderCheck = false;
        this._lastLogThreshold = null;

        // Only trigger transition if type actually changed
        if (eclipseType === this.eclipseType) {
            console.log(`🌑 Eclipse type unchanged: ${eclipseType}`);
            return;
        }

        console.log(`🌑 Eclipse type changing: ${this.eclipseType} → ${eclipseType}`);

        const wasEnabled = this.enabled;
        this.previousEclipseType = this.eclipseType; // Store previous type before changing
        this.eclipseType = eclipseType;
        this.enabled = (eclipseType !== ECLIPSE_TYPES.OFF);
        this.manualControl = false; // Reset manual control when eclipse type changes

        // Determine transition direction
        if (!wasEnabled && this.enabled) {
            // Entering eclipse: slide in from right
            this.transitionDirection = 'in';
            this.isTransitioning = true;
            this.transitionProgress = 0;
            console.log(`🌑 Starting transition: ${this.transitionDirection} (OFF → ${eclipseType})`);
        } else if (wasEnabled && !this.enabled) {
            // Exiting eclipse: slide out to left
            this.transitionDirection = 'out';
            this.isTransitioning = true;
            this.transitionProgress = 0;
            console.log(`🌑 Starting transition: ${this.transitionDirection} (${this.eclipseType} → OFF)`);
        } else if (wasEnabled && this.enabled) {
            // Switching between annular/total: quick cross-fade
            this.isTransitioning = true;
            this.transitionProgress = 0;
            this.transitionDirection = 'switch';
            console.log(`🌑 Starting transition: ${this.transitionDirection} (${this.eclipseType} ↔ ${eclipseType})`);
        }

        // Regenerate random seed for new corona pattern ONLY when switching TO total eclipse
        // (not when already total - prevents double regeneration on repeated clicks)
        console.log(`🌟 Corona seed check: eclipseType=${eclipseType}, previousEclipseType=${this.previousEclipseType}`);
        if (eclipseType === ECLIPSE_TYPES.TOTAL && this.previousEclipseType !== ECLIPSE_TYPES.TOTAL) {
            console.log(`🌟 Regenerating corona seed from ${this.randomSeed}`);
            this.randomSeed = Math.random() * 1000;
            this.coronaDisk.material.uniforms.randomSeed.value = this.randomSeed;
            this.counterCoronaDisk.material.uniforms.randomSeed.value = this.randomSeed + 5000;
            console.log(`🌟 New corona seed: ${this.randomSeed}`);
        } else {
            console.log(`🌟 Keeping existing corona seed: ${this.randomSeed}`);
        }
    }

    /**
     * Cubic ease in-out function for smooth transitions
     * @param {number} t - Progress value (0-1)
     * @returns {number} Eased value (0-1)
     * @private
     */
    easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /**
     * Manually set transition progress (for manual control via sliders)
     * @param {number} progress - Progress value (0-1, where 0 is start, 1 is totality)
     */
    setManualProgress(progress) {
        this.manualControl = true; // Enable manual control mode
        this.transitionProgress = Math.max(0, Math.min(1, progress));
        this.isTransitioning = true; // Keep transitioning active for effects
        this.transitionDirection = 'in'; // Always use 'in' direction for manual control
    }

    /**
     * Manually set shadow position (for full eclipse cycle control)
     * @param {number} shadowPosition - Shadow X position (-2.0 = left, 0.0 = center/totality, +2.0 = right)
     */
    setManualShadowPosition(shadowPosition) {
        this.manualControl = true; // Enable manual control mode
        this.manualShadowPosition = Math.max(-2.0, Math.min(2.0, shadowPosition)); // Clamp to valid range
        this.isTransitioning = true; // Keep effects active
        this.transitionDirection = 'manual'; // Special mode for direct position control
    }

    /**
     * Update eclipse effects (call every frame)
     *
     * IMPORTANT: This method must be called AFTER the sun mesh's position, rotation,
     * and scale have been updated for the current frame to ensure synchronized movement.
     * Called from ThreeRenderer.render() after transforms are applied.
     *
     * @param {THREE.Camera} camera - Camera for position calculations
     * @param {THREE.Mesh} sunMesh - Sun mesh for position/scale (already updated for current frame)
     * @param {number} deltaTime - Time since last frame (milliseconds)
     */
    update(camera, sunMesh, deltaTime) {
        const cameraPosition = camera.position;
        const sunPosition = sunMesh.position;
        const sunScale = sunMesh.scale;
        const worldScale = sunScale.x; // World scale for consistent sizing

        // Update time for corona animation
        // Accelerate time 3x for normal sun (more visible undulation), normal speed for eclipses
        const timeMultiplier = (this.eclipseType === ECLIPSE_TYPES.OFF) ? 3.0 : 1.0;
        this.time += deltaTime * timeMultiplier;

        // Update transition animation (skip if in manual control mode)
        if (this.isTransitioning && !this.manualControl) {
            const progressDelta = deltaTime / this.transitionDuration;
            this.transitionProgress += progressDelta;

            if (this.transitionProgress >= 1.0) {
                this.transitionProgress = 1.0;
                this.isTransitioning = false;
            }
        }

        // Update shadow disk if eclipse is active or transitioning out
        if (!this._pathLogged) {
            console.log(`🔍 Update path: enabled=${this.enabled}, eclipseType=${this.eclipseType}, isTransitioning=${this.isTransitioning}, transitionDirection=${this.transitionDirection}`);
            this._pathLogged = true;
        }
        if (this.enabled || (this.transitionDirection === 'out' && this.isTransitioning)) {
            // Use previous eclipse type during exit animation (since eclipseType is now OFF)
            const activeEclipseType = (this.transitionDirection === 'out' && this.isTransitioning)
                ? this.previousEclipseType
                : this.eclipseType;
            const config = getEclipseConfig(activeEclipseType);
            const scaledSunRadius = this.sunRadius * worldScale;

            // Use linear progress for constant speed (no easing - prevents jerkiness)
            const easedProgress = this.transitionProgress;

            // Calculate shadow size based on eclipse type (restore original logic)
            const shadowRadius = scaledSunRadius * config.shadowCoverage;
            const baseShadowScale = shadowRadius / this.sunRadius;

            // Keep shadow at full size throughout transition (no scale animation)
            this.shadowDisk.scale.setScalar(baseShadowScale);

            // Position shadow disk between camera and sun - REUSE temp vector
            this._directionToCamera.subVectors(cameraPosition, sunPosition).normalize();

            // Calculate shadow position
            // shadowPosX range: -2.0 to +2.0
            this.currentShadowPosX = -2.0; // Start off-screen

            if (this.transitionDirection === 'manual' && this.manualShadowPosition !== undefined) {
                // MANUAL CONTROL MODE: Use direct shadow position from dial
                this.currentShadowPosX = this.manualShadowPosition;
            } else if (this.isTransitioning) {
                if (this.transitionDirection === 'in') {
                    // Arc in from -2.0 to 0.0
                    this.currentShadowPosX = -2.0 + (easedProgress * 2.0); // -2.0 → 0.0
                } else if (this.transitionDirection === 'out') {
                    // Arc out from 0.0 to 1.0
                    this.currentShadowPosX = 0.0 + (easedProgress * 1.0); // 0.0 → 1.0
                }
            } else {
                // At rest: centered
                this.currentShadowPosX = 0.0;
            }

            const shadowPosX = this.currentShadowPosX;

            // Calculate parabolic arc motion (like real eclipse)
            // Horizontal: linear movement from -2.0 to +2.0
            // Vertical: downward parabola y = -x²
            const arcRadius = scaledSunRadius * 2.5; // Arc depth
            const arcT = shadowPosX; // Use shadowPosX directly as arc parameter (-2.0 to +2.0)

            const horizontalOffset = arcT * arcRadius * 0.5; // Horizontal position
            const verticalOffset = -(arcT * arcT) * arcRadius * 0.25; // Downward parabola: y = -x²

            // BILLBOARD SHADOW DISK: Position shadow disk to occlude corona
            // Get perpendicular vectors for positioning - REUSE temp vectors
            this._right.crossVectors(this._directionToCamera, this._up).normalize();
            this._upVector.crossVectors(this._right, this._directionToCamera).normalize();

            const shadowOffset = scaledSunRadius * 1.01;
            // Build position using temp vector to avoid allocations
            this._tempOffset.copy(this._directionToCamera).multiplyScalar(shadowOffset);
            this.shadowDisk.position.copy(sunPosition).add(this._tempOffset);

            // Add horizontal offset
            this._tempOffset.copy(this._right).multiplyScalar(horizontalOffset);
            this.shadowDisk.position.add(this._tempOffset);

            // Add vertical offset (parabolic arc)
            this._tempOffset.copy(this._upVector).multiplyScalar(verticalOffset);
            this.shadowDisk.position.add(this._tempOffset);

            // Make shadow face camera (billboard effect)
            this.shadowDisk.lookAt(cameraPosition);

            // ALWAYS log in manual mode to debug shadow movement
            if (this.transitionDirection === 'manual') {
                console.log(`🌑 MANUAL MODE: shadowPosX=${shadowPosX.toFixed(3)}, arcT=${arcT.toFixed(3)}, horizontal=${horizontalOffset.toFixed(3)}, vertical=${verticalOffset.toFixed(3)}`);
            }

            // Update corona disks - ALWAYS VISIBLE (intensity varies by eclipse state)
            // Position both coronas at sun center
            this.coronaDisk.position.copy(sunPosition);
            this.counterCoronaDisk.position.copy(sunPosition);

            // Scale both coronas with sun
            this.coronaDisk.scale.setScalar(worldScale);
            this.counterCoronaDisk.scale.setScalar(worldScale);

            // Billboard both coronas to camera (must happen BEFORE rotation)
            this.coronaDisk.lookAt(cameraPosition);
            this.counterCoronaDisk.lookAt(cameraPosition);

            // Calculate proximity to totality for dynamic rotation speed and intensity
            // proximity = 0 at edges (shadow far away), 1 at totality (shadow centered)
            const distanceFromCenter = Math.abs(this.currentShadowPosX || 0);
            const maxDistance = 2.0;
            const proximity = Math.max(0, 1 - (distanceFromCenter / maxDistance));

            // Rotation: dynamic speed based on eclipse state and proximity to totality
            // Use vertex shader UV rotation (mesh stays billboarded to camera)
            let rotationSpeed = 0;
            if (activeEclipseType === ECLIPSE_TYPES.OFF) {
                // NORMAL SUN: Full rotation speed
                rotationSpeed = (deltaTime / 1000) * 0.075; // radians per second (~84 seconds per rotation)
            } else if (activeEclipseType === ECLIPSE_TYPES.ANNULAR) {
                // ANNULAR ECLIPSE: Slow down rotation at totality (75% reduction)
                const baseSpeed = 0.075;
                const minSpeed = baseSpeed * 0.25; // 25% of normal = 75% reduction
                rotationSpeed = (deltaTime / 1000) * (baseSpeed - (baseSpeed - minSpeed) * proximity);
            } else if (activeEclipseType === ECLIPSE_TYPES.TOTAL) {
                // TOTAL ECLIPSE: Nearly freeze rotation at totality (95% reduction)
                const baseSpeed = 0.075;
                const minSpeed = baseSpeed * 0.05; // 5% of normal = 95% reduction
                rotationSpeed = (deltaTime / 1000) * (baseSpeed - (baseSpeed - minSpeed) * proximity);
            }

            // Apply rotation to both coronas
            this.coronaDisk.material.uniforms.uvRotation.value += rotationSpeed; // Clockwise
            this.counterCoronaDisk.material.uniforms.uvRotation.value -= rotationSpeed; // Counter-clockwise

            // Determine corona intensity based on eclipse state and proximity to totality
            let coronaIntensity = 1.2;

            if (activeEclipseType === ECLIPSE_TYPES.OFF) {
                // NORMAL SUN: Bright corona (solar atmosphere always visible)
                coronaIntensity = 1.8;
            } else if (activeEclipseType === ECLIPSE_TYPES.ANNULAR) {
                // ANNULAR ECLIPSE: Dim corona at totality (92% reduction - more dramatic than total)
                if (this.transitionDirection === 'manual') {
                    // MANUAL MODE: Gradient from full brightness to 8% at totality
                    const maxIntensity = 1.8; // Normal sun brightness
                    const minIntensity = maxIntensity * 0.08; // 8% = 92% reduction
                    coronaIntensity = maxIntensity - (maxIntensity - minIntensity) * proximity;
                } else if (this.isTransitioning && this.transitionDirection === 'in') {
                    // TRANSITION IN: Fade from full brightness to dimmed
                    const maxIntensity = 1.8;
                    const minIntensity = maxIntensity * 0.08;
                    coronaIntensity = maxIntensity - (maxIntensity - minIntensity) * easedProgress;
                } else if (this.isTransitioning && this.transitionDirection === 'out') {
                    // TRANSITION OUT: Fade from dimmed to full brightness
                    const maxIntensity = 1.8;
                    const minIntensity = maxIntensity * 0.08;
                    coronaIntensity = minIntensity + (maxIntensity - minIntensity) * easedProgress;
                } else {
                    // STEADY STATE: Dimmed (8% of normal)
                    coronaIntensity = 1.8 * 0.08;
                }
            } else if (activeEclipseType === ECLIPSE_TYPES.TOTAL) {
                // TOTAL ECLIPSE: Slightly dim corona at totality (25% reduction)
                if (this.transitionDirection === 'manual') {
                    // MANUAL MODE: Gradient from full brightness to 75% at totality
                    const maxIntensity = 1.8; // Normal sun brightness
                    const minIntensity = maxIntensity * 0.75; // 75% = 25% reduction
                    coronaIntensity = maxIntensity - (maxIntensity - minIntensity) * proximity;
                } else if (this.isTransitioning && this.transitionDirection === 'in') {
                    // TRANSITION IN: Fade from full brightness to slightly dimmed
                    const maxIntensity = 1.8;
                    const minIntensity = maxIntensity * 0.75;
                    coronaIntensity = maxIntensity - (maxIntensity - minIntensity) * easedProgress;
                } else if (this.isTransitioning && this.transitionDirection === 'out') {
                    // TRANSITION OUT: Fade from slightly dimmed to full brightness
                    const maxIntensity = 1.8;
                    const minIntensity = maxIntensity * 0.75;
                    coronaIntensity = minIntensity + (maxIntensity - minIntensity) * easedProgress;
                } else {
                    // STEADY STATE: Slightly dimmed (75% of normal)
                    coronaIntensity = 1.8 * 0.75;
                }
            }

            // Apply intensity to both coronas
            this.coronaDisk.material.uniforms.intensity.value = coronaIntensity;
            this.counterCoronaDisk.material.uniforms.intensity.value = coronaIntensity;

            // Update shader time uniform for both
            this.coronaDisk.material.uniforms.time.value = this.time;
            this.counterCoronaDisk.material.uniforms.time.value = this.time;
        } else {
            // Eclipse disabled: hide shadow disk, but keep coronas visible for normal sun
            if (!this._elsePathLogged) {
                console.log('🔍 ELSE path executing (eclipse OFF, normal sun)');
                this._elsePathLogged = true;
            }
            this.shadowDisk.position.set(200, 0, 0);

            // Position both coronas at sun center for normal sun mode
            this.coronaDisk.position.copy(sunPosition);
            this.counterCoronaDisk.position.copy(sunPosition);
            this.coronaDisk.scale.setScalar(worldScale);
            this.counterCoronaDisk.scale.setScalar(worldScale);

            // Billboard both coronas to camera (must happen BEFORE rotation)
            this.coronaDisk.lookAt(cameraPosition);
            this.counterCoronaDisk.lookAt(cameraPosition);

            // Rotate coronas in opposite directions (living sun effect)
            // Use vertex shader UV rotation (mesh stays billboarded to camera)
            const rotationSpeed = (deltaTime / 1000) * 0.075; // radians per second (~84 seconds per rotation)
            this.coronaDisk.material.uniforms.uvRotation.value += rotationSpeed; // Clockwise
            this.counterCoronaDisk.material.uniforms.uvRotation.value -= rotationSpeed; // Counter-clockwise

            // Bright corona for normal sun (no eclipse)
            this.coronaDisk.material.uniforms.intensity.value = 1.8;
            this.counterCoronaDisk.material.uniforms.intensity.value = 1.8;

            // Update shader time uniform for both
            this.coronaDisk.material.uniforms.time.value = this.time;
            this.counterCoronaDisk.material.uniforms.time.value = this.time;
        }

        // Update Bailey's Beads effect
        // Beads are ONLY visible when shadow is near the sun's rim (final 20% of transition)
        if (this.eclipseType === ECLIPSE_TYPES.TOTAL) {
            // Calculate coverage based on transition progress or shadow position
            let coverage = 0;
            let beadsVisible = false;

            if (this.transitionDirection === 'manual') {
                // MANUAL MODE: Calculate coverage from shadow position
                // Shadow at -2.0 or +2.0 = 0% coverage (no eclipse)
                // Shadow at 0.0 = 100% coverage (totality)
                const distanceFromCenter = Math.abs(this.currentShadowPosX);
                const maxDistance = 2.0;
                coverage = Math.max(0, Math.min(1, 1 - (distanceFromCenter / maxDistance)));

                // Beads visible when coverage is between 90% and 100% (INCLUDING totality)
                if (coverage >= 0.90 && coverage <= 1.0) {
                    beadsVisible = true;
                }
            } else if (this.transitionDirection === 'in' && this.isTransitioning) {
                // Beads only appear in final 20% of transition (when shadow is nearly covering sun)
                const beadsStartProgress = 0.8; // Start showing beads at 80% of transition
                if (this.transitionProgress >= beadsStartProgress) {
                    beadsVisible = true;
                    // Map 0.8-1.0 transition progress to 0.9-1.0 coverage
                    const normalizedProgress = (this.transitionProgress - beadsStartProgress) / (1.0 - beadsStartProgress);
                    coverage = 0.9 + (normalizedProgress * 0.1);
                }
            } else if (this.transitionDirection === 'out' && this.isTransitioning) {
                // Beads appear in first 20% of exit transition (when shadow is leaving sun's rim)
                const beadsEndProgress = 0.2; // Stop showing beads at 20% of exit transition
                if (this.transitionProgress <= beadsEndProgress) {
                    beadsVisible = true;
                    // Map 0.0-0.2 transition progress to 1.0-0.9 coverage
                    const normalizedProgress = this.transitionProgress / beadsEndProgress;
                    coverage = 1.0 - (normalizedProgress * 0.1);
                }
            } else if (!this.isTransitioning) {
                // At totality: coverage = 1.0, beads VISIBLE (most dramatic moment)
                coverage = 1.0;
                beadsVisible = true;
            }

            this.baileysBeads.setVisible(beadsVisible);
            this.baileysBeads.update(camera, sunPosition, coverage, deltaTime, worldScale);
        } else {
            this.baileysBeads.setVisible(false);
            this.baileysBeads.update(camera, sunPosition, 0, deltaTime, worldScale);
        }
    }

    /**
     * Dispose of all eclipse resources
     */
    dispose() {
        // Dispose shadow disk
        if (this.shadowDisk) {
            this.scene.remove(this.shadowDisk);
            this.shadowDisk.geometry.dispose();
            this.shadowDisk.material.dispose();
            this.shadowDisk = null;
        }

        // Dispose corona disks
        if (this.coronaDisk) {
            this.scene.remove(this.coronaDisk);
            this.coronaDisk.geometry.dispose();
            // Dispose shader material uniforms - no need to null, just dispose material
            this.coronaDisk.material.dispose();
            this.coronaDisk = null;
        }

        if (this.counterCoronaDisk) {
            this.scene.remove(this.counterCoronaDisk);
            // Geometry is shared with main corona, already disposed above
            this.counterCoronaDisk.material.dispose();
            this.counterCoronaDisk = null;
        }

        // Dispose Bailey's Beads
        if (this.baileysBeads) {
            this.baileysBeads.dispose();
            this.baileysBeads = null;
        }

        // Clear temp objects
        this._directionToCamera = null;
        this._up = null;
        this._right = null;
        this._upVector = null;
        this._tempOffset = null;
        this._tempColor = null;

        // Clear references
        this.scene = null;
        this.sunMesh = null;
    }
}
