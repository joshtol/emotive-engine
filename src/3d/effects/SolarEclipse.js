/**
 * Solar Eclipse Effect Manager
 *
 * Orchestrates solar eclipse shadow disk effect.
 * Supports annular and total eclipses.
 */

import * as THREE from 'three';
import { ECLIPSE_TYPES, getEclipseConfig } from './EclipseTypes.js';

export class SolarEclipse {
    /**
     * Create a solar eclipse effect manager
     * @param {THREE.Scene} scene - Three.js scene
     * @param {number} sunRadius - Radius of the sun geometry
     */
    constructor(scene, sunRadius) {
        this.scene = scene;
        this.sunRadius = sunRadius;
        this.eclipseType = ECLIPSE_TYPES.OFF;
        this.enabled = false;
        this.time = 0;
        this.randomSeed = Math.random() * 1000; // Random seed for corona pattern

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
        const initialShadowRadius = this.sunRadius * 0.5;
        const shadowGeometry = new THREE.CircleGeometry(initialShadowRadius, 64);
        const shadowMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: false,
            side: THREE.FrontSide,
            depthWrite: true,
            depthTest: true,
            fog: false
        });

        this.shadowDisk = new THREE.Mesh(shadowGeometry, shadowMaterial);
        this.shadowDisk.position.set(200, 0, 0); // Start off-screen
        this.shadowDisk.renderOrder = 999; // Render on top
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
     * @param {string} eclipseType - Eclipse type from ECLIPSE_TYPES
     */
    setEclipseType(eclipseType) {
        this.eclipseType = eclipseType;
        this.enabled = (eclipseType !== ECLIPSE_TYPES.OFF);

        if (!this.enabled) {
            // Move shadow off-screen when disabled
            this.shadowDisk.position.set(200, 0, 0);
            this.coronaDisk.position.set(200, 0, 0);
        } else if (eclipseType === ECLIPSE_TYPES.TOTAL) {
            // Regenerate random seed for new corona pattern
            this.randomSeed = Math.random() * 1000;
            this.coronaDisk.material.uniforms.randomSeed.value = this.randomSeed;
        }
    }

    /**
     * Update eclipse effects (call every frame)
     * @param {THREE.Camera} camera - Camera for position calculations
     * @param {THREE.Mesh} sunMesh - Sun mesh for position/scale
     * @param {number} deltaTime - Time since last frame (seconds)
     */
    update(camera, sunMesh, deltaTime) {
        const cameraPosition = camera.position;
        const sunPosition = sunMesh.position;
        const sunScale = sunMesh.scale;

        // Update time for corona animation
        this.time += deltaTime;

        // Update shadow disk if eclipse is active
        if (this.enabled) {
            const config = getEclipseConfig(this.eclipseType);
            const worldScale = sunScale.x;
            const scaledSunRadius = this.sunRadius * worldScale;

            // Calculate shadow size based on eclipse type
            const shadowRadius = scaledSunRadius * config.shadowCoverage;
            const shadowScale = shadowRadius / this.sunRadius / 0.5;
            this.shadowDisk.scale.setScalar(shadowScale);

            // CAMERA LOCKING: Position shadow between camera and sun
            const directionToCamera = new THREE.Vector3()
                .subVectors(cameraPosition, sunPosition)
                .normalize();

            // Place shadow very close to sun surface
            const shadowOffset = scaledSunRadius * 1.001;
            this.shadowDisk.position.copy(sunPosition).add(
                directionToCamera.multiplyScalar(shadowOffset)
            );

            // Make shadow face the camera (billboard effect)
            this.shadowDisk.lookAt(cameraPosition);

            // Update corona disk for TOTAL eclipse only
            if (this.eclipseType === ECLIPSE_TYPES.TOTAL) {
                // Position corona at sun center
                this.coronaDisk.position.copy(sunPosition);

                // Scale corona with sun
                this.coronaDisk.scale.setScalar(worldScale);

                // Billboard corona to camera
                this.coronaDisk.lookAt(cameraPosition);

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
            this.shadowDisk.geometry.dispose();
            this.shadowDisk.material.dispose();
            this.scene.remove(this.shadowDisk);
            this.shadowDisk = null;
        }

        // Dispose corona disk
        if (this.coronaDisk) {
            this.coronaDisk.geometry.dispose();
            this.coronaDisk.material.dispose();
            this.scene.remove(this.coronaDisk);
            this.coronaDisk = null;
        }
    }
}
