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
        this.randomSeed = Math.random() * 1000; // Random seed for corona pattern

        // Transition animation state
        this.isTransitioning = false;
        this.transitionProgress = 0;
        this.transitionDuration = 0.4; // 0.4 seconds for quick, snappy eclipse transition
        this.transitionDirection = 'in'; // 'in' or 'out'

        // Reusable temp objects to avoid per-frame allocations (performance optimization)
        this._directionToCamera = new THREE.Vector3();
        this._up = new THREE.Vector3(0, 1, 0);
        this._right = new THREE.Vector3();
        this._upVector = new THREE.Vector3();
        this._tempOffset = new THREE.Vector3();

        // Create shadow disk
        this.createShadowDisk();

        // Create corona disk
        this.createCoronaDisk();
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
            transparent: false,
            side: THREE.DoubleSide,
            depthWrite: false,
            depthTest: false,
            fog: false
        });

        this.shadowDisk = new THREE.Mesh(shadowGeometry, shadowMaterial);
        this.shadowDisk.renderOrder = 10000;

        // Always add to scene, never as child
        this.shadowDisk.position.set(200, 0, 0); // Start off-screen
        this.scene.add(this.shadowDisk);
    }

    /**
     * Create the corona disk geometry with radial wave shader
     * @private
     */
    createCoronaDisk() {
        const coronaRadius = this.sunRadius * 2; // 2x sun diameter
        const coronaGeometry = new THREE.CircleGeometry(coronaRadius, 64);

        // Shader material with radial wave pattern
        const coronaMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                glowColor: { value: new THREE.Color(0.9, 0.95, 1.0) }, // Cool white/blue-white
                intensity: { value: 1.2 },
                randomSeed: { value: this.randomSeed }
            },
            vertexShader: `
                varying vec2 vUv;

                void main() {
                    vUv = uv;
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
                    float angle = atan(toCenter.y, toCenter.x);

                    // Shadow edge - where corona starts
                    float shadowEdge = 0.465;

                    // Varied radial streamer pattern
                    float rayIntensity = 0.0;

                    // 32 streamers with non-uniform angular distribution
                    for (float i = 0.0; i < 32.0; i++) {
                        // Use hash to create non-uniform angular positions
                        float angleOffset = hash(i * 7.7321 + randomSeed) * 6.28318;
                        float rayAngle = angleOffset;
                        float angleDiff = abs(mod(angle - rayAngle + 3.14159, 6.28318) - 3.14159);

                        // Unique random values per ray
                        float random1 = hash(i * 12.9898 + randomSeed);
                        float random2 = hash(i * 78.233 + randomSeed);
                        float random3 = hash(i * 37.719 + randomSeed);
                        float random4 = hash(i * 93.989 + randomSeed);

                        // Highly varied ray lengths with more extremes
                        float lengthVariation = random1 * random1 * random1; // Cubed for even more variation
                        float rayLength = 0.08 + lengthVariation * 0.5; // 0.08 to 0.58

                        // 15% chance of very long streamers
                        float isLong = step(0.85, random2);
                        rayLength = mix(rayLength, 0.4 + random3 * 0.6, isLong); // 0.4 to 1.0

                        // Very thin rays by default, some thicker
                        float baseWidth = 0.02 + random4 * random4 * 0.15; // 0.02 to 0.17 (much thinner)

                        // Taper: wide at base, narrow at tip
                        float distFromEdge = dist - shadowEdge;

                        // Check if we're in the ray's radial range
                        float inRadialRange = step(0.0, distFromEdge) * step(distFromEdge, rayLength);

                        // Sharp taper for pointed tips
                        float taper = pow(1.0 - clamp(distFromEdge / max(rayLength, 0.001), 0.0, 1.0), 2.5);
                        float rayWidth = baseWidth * taper;

                        // Check if we're in the ray's angular range
                        float inAngularRange = step(angleDiff, rayWidth);

                        // Intensity with gradient falloff
                        float angularMask = (1.0 - clamp(angleDiff / max(rayWidth, 0.001), 0.0, 1.0)) * inAngularRange;
                        float radialFalloff = pow(taper, 0.5); // Gentler radial falloff

                        float streamerIntensity = angularMask * radialFalloff * inRadialRange;
                        rayIntensity = max(rayIntensity, streamerIntensity);
                    }

                    // Base corona glow (thin bright ring)
                    float baseGlow = smoothstep(shadowEdge - 0.02, shadowEdge, dist) *
                                    (1.0 - smoothstep(shadowEdge + 0.05, shadowEdge + 0.1, dist));

                    // Combine: base glow + streamers
                    float finalIntensity = (baseGlow * 0.6 + rayIntensity) * intensity;

                    // Cool white gradient (blue-white to pale blue)
                    vec3 finalColor = mix(
                        vec3(1.0, 1.0, 1.0),     // Pure white at base
                        vec3(0.8, 0.9, 1.0),     // Pale blue at tips
                        smoothstep(shadowEdge, shadowEdge + 0.3, dist)
                    ) * finalIntensity;

                    // Alpha with sharper falloff
                    float alpha = finalIntensity * 0.9;

                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide
        });

        this.coronaDisk = new THREE.Mesh(coronaGeometry, coronaMaterial);
        this.coronaDisk.position.set(200, 0, 0); // Start off-screen
        this.coronaDisk.renderOrder = -5; // Render behind sun and shadow
        this.scene.add(this.coronaDisk);
    }

    /**
     * Set eclipse type (annular, total, or off)
     * Triggers transition animation when type changes
     * @param {string} eclipseType - Eclipse type from ECLIPSE_TYPES
     */
    setEclipseType(eclipseType) {
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

        // Regenerate random seed for new corona pattern on total eclipse
        if (eclipseType === ECLIPSE_TYPES.TOTAL) {
            this.randomSeed = Math.random() * 1000;
            this.coronaDisk.material.uniforms.randomSeed.value = this.randomSeed;
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
     * Update eclipse effects (call every frame)
     *
     * IMPORTANT: This method must be called AFTER the sun mesh's position, rotation,
     * and scale have been updated for the current frame to ensure synchronized movement.
     * Called from ThreeRenderer.render() after transforms are applied.
     *
     * @param {THREE.Camera} camera - Camera for position calculations
     * @param {THREE.Mesh} sunMesh - Sun mesh for position/scale (already updated for current frame)
     * @param {number} deltaTime - Time since last frame (seconds)
     */
    update(camera, sunMesh, deltaTime) {
        const cameraPosition = camera.position;
        const sunPosition = sunMesh.position;
        const sunScale = sunMesh.scale;

        // Update time for corona animation
        this.time += deltaTime;

        // Update transition animation
        if (this.isTransitioning) {
            const progressDelta = deltaTime / this.transitionDuration;
            this.transitionProgress += progressDelta;

            if (this.transitionProgress >= 1.0) {
                this.transitionProgress = 1.0;
                this.isTransitioning = false;
            }
        }

        // Update shadow disk if eclipse is active or transitioning out
        if (this.enabled || (this.transitionDirection === 'out' && this.isTransitioning)) {
            // Use previous eclipse type during exit animation (since eclipseType is now OFF)
            const activeEclipseType = (this.transitionDirection === 'out' && this.isTransitioning)
                ? this.previousEclipseType
                : this.eclipseType;
            const config = getEclipseConfig(activeEclipseType);
            const worldScale = sunScale.x;
            const scaledSunRadius = this.sunRadius * worldScale;

            // Use linear progress for constant speed (no easing - prevents jerkiness)
            const easedProgress = this.transitionProgress;

            // Calculate shadow size based on eclipse type
            const shadowRadius = scaledSunRadius * config.shadowCoverage;
            const baseShadowScale = shadowRadius / this.sunRadius;

            // Keep shadow at full size throughout transition (no scale animation)
            // The moon-like eclipse entrance is achieved purely through horizontal slide
            this.shadowDisk.scale.setScalar(baseShadowScale);

            // Position shadow disk between camera and sun - REUSE temp vector
            this._directionToCamera.subVectors(cameraPosition, sunPosition).normalize();

            // Calculate arc path offset for realistic eclipse motion
            // Arc geometry: Downward-facing arc (inverted parabola) passing through sun center
            // Entry: lower-left → center (apex at top)
            // Exit: center (apex at top) → lower-right
            let horizontalOffset = 0;
            let verticalOffset = 0;

            if (this.isTransitioning) {
                const arcRadius = scaledSunRadius * 2.5; // Larger radius for extended arc path

                if (this.transitionDirection === 'in') {
                    // Arc in from lower-left to center (apex)
                    const arcProgress = easedProgress; // 0 → 1
                    // Progress from -1.5 (far left) to 0 (center) - extended range
                    const arcT = -1.5 + (arcProgress * 1.5);

                    horizontalOffset = arcT * arcRadius;
                    // Downward arc: y = -x² (negative parabola)
                    verticalOffset = -(arcT * arcT) * arcRadius;
                } else if (this.transitionDirection === 'out') {
                    // Arc out from center (apex) to lower-right
                    const arcProgress = easedProgress; // 0 → 1
                    // Progress from 0 (center) to 1.5 (far right) - extended range
                    const arcT = arcProgress * 1.5;

                    horizontalOffset = arcT * arcRadius;
                    // Downward arc: y = -x² (negative parabola)
                    verticalOffset = -(arcT * arcT) * arcRadius;
                }
            }

            // Get perpendicular vectors for arc motion - REUSE temp vectors
            this._right.crossVectors(this._directionToCamera, this._up).normalize();
            this._upVector.crossVectors(this._right, this._directionToCamera).normalize();

            const shadowOffset = scaledSunRadius * 1.01;
            // Build position using temp vector to avoid allocations
            this._tempOffset.copy(this._directionToCamera).multiplyScalar(shadowOffset);
            this.shadowDisk.position.copy(sunPosition).add(this._tempOffset);

            // Add horizontal offset
            this._tempOffset.copy(this._right).multiplyScalar(horizontalOffset);
            this.shadowDisk.position.add(this._tempOffset);

            // Add vertical offset
            this._tempOffset.copy(this._upVector).multiplyScalar(verticalOffset);
            this.shadowDisk.position.add(this._tempOffset);

            // Make shadow face camera (billboard effect)
            this.shadowDisk.lookAt(cameraPosition);

            // Update corona disk for TOTAL eclipse only
            if (activeEclipseType === ECLIPSE_TYPES.TOTAL) {
                // Position corona at sun center
                this.coronaDisk.position.copy(sunPosition);

                // Scale corona with sun
                this.coronaDisk.scale.setScalar(worldScale);

                // Billboard corona to camera
                this.coronaDisk.lookAt(cameraPosition);

                // Apply fade-in animation to corona intensity
                let coronaIntensity = 1.2;
                if (this.isTransitioning && this.transitionDirection === 'in') {
                    // Fade in corona after shadow is mostly visible (starts at 70% shadow progress)
                    const coronaFadeStart = 0.7;
                    const coronaFadeProgress = Math.max(0, (easedProgress - coronaFadeStart) / (1.0 - coronaFadeStart));
                    coronaIntensity = 1.2 * coronaFadeProgress;
                } else if (this.isTransitioning && this.transitionDirection === 'out') {
                    // Fade out corona quickly (finishes at 30% progress)
                    const coronaFadeEnd = 0.3;
                    const coronaFadeProgress = Math.min(1.0, easedProgress / coronaFadeEnd);
                    coronaIntensity = 1.2 * (1.0 - coronaFadeProgress);
                }
                this.coronaDisk.material.uniforms.intensity.value = coronaIntensity;

                // Update shader time uniform
                this.coronaDisk.material.uniforms.time.value = this.time;
            } else {
                // Hide corona for annular eclipse
                this.coronaDisk.position.set(200, 0, 0);
            }
        } else {
            // Move shadow and corona off-screen when disabled
            this.shadowDisk.position.set(200, 0, 0);
            this.coronaDisk.position.set(200, 0, 0);
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

        // Dispose corona disk
        if (this.coronaDisk) {
            this.scene.remove(this.coronaDisk);
            this.coronaDisk.geometry.dispose();
            // Dispose shader material uniforms
            if (this.coronaDisk.material.uniforms) {
                if (this.coronaDisk.material.uniforms.glowColor?.value) {
                    this.coronaDisk.material.uniforms.glowColor.value = null;
                }
            }
            this.coronaDisk.material.dispose();
            this.coronaDisk = null;
        }

        // Clear references
        this.scene = null;
        this.sunMesh = null;
    }
}
