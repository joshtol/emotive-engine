/**
 * Post-Processing Crack Layer Effect
 *
 * A screen-space overlay that renders procedural crack patterns on any geometry.
 *
 * PERSISTENT DAMAGE MODEL:
 * - Supports up to 3 simultaneous crack impacts
 * - Cracks persist until explicitly healed via crackHeal or shatter
 * - Each impact has its own center, direction, and propagation
 * - Impacts are additive - hitting from multiple directions accumulates damage
 *
 * ARCHITECTURE:
 * Unlike per-material crack shaders, this is a universal post-process that:
 * 1. Reads the depth buffer to know where the mesh exists
 * 2. Generates procedural cracks in screen space for each impact
 * 3. Composites all crack layers together
 * 4. Supports healing animation that clears all cracks
 */

import * as THREE from 'three';

const MAX_IMPACTS = 3;

export class CrackLayer {
    /**
     * Create a crack layer effect
     * @param {THREE.WebGLRenderer} renderer - Three.js renderer
     */
    constructor(renderer) {
        this.renderer = renderer;

        // Persistent impact storage (up to MAX_IMPACTS)
        // Each impact: { centerUV, direction, propagation, amount, seed }
        this.impacts = [];

        // Global crack state - increased visibility
        this.crackColor = new THREE.Color(0.15, 0.08, 0.05); // Darker brown crack interior (more visible)
        this.crackGlowColor = new THREE.Color(1.0, 0.6, 0.2); // Orange-amber edge emission
        this.glowStrength = 0.5; // Increased from 0.3

        // Healing state
        this.isHealing = false;
        this.healProgress = 0;

        // Animation state
        this.time = 0;

        // Depth texture reference (set externally)
        this.depthTexture = null;

        // Own scene and camera for screen-space rendering
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        this.camera.position.z = 1;

        // Create the crack mesh
        this.createCrackMesh();

        // Temp vectors
        this._tempVector = new THREE.Vector3();
    }

    /**
     * Create the crack mesh with procedural crack shader supporting multiple impacts
     * @private
     */
    createCrackMesh() {
        const geometry = new THREE.PlaneGeometry(2, 2);

        const material = new THREE.ShaderMaterial({
            uniforms: {
                // Impact data arrays (vec4: xy=center, zw=direction)
                impactData0: { value: new THREE.Vector4(0, 0, 0, 0) },
                impactData1: { value: new THREE.Vector4(0, 0, 0, 0) },
                impactData2: { value: new THREE.Vector4(0, 0, 0, 0) },
                // Impact propagation and amount (vec2: x=propagation, y=amount)
                impactParams0: { value: new THREE.Vector2(0, 0) },
                impactParams1: { value: new THREE.Vector2(0, 0) },
                impactParams2: { value: new THREE.Vector2(0, 0) },
                // Impact seeds for unique patterns
                impactSeeds: { value: new THREE.Vector3(0, 0, 0) },
                // Number of active impacts
                numImpacts: { value: 0 },
                // Visual params
                crackColor: { value: new THREE.Color(0.05, 0.03, 0.02) },
                crackGlowColor: { value: new THREE.Color(1.0, 0.8, 0.4) },
                glowStrength: { value: 0.3 },
                time: { value: 0.0 },
                aspectRatio: { value: 1.0 },
                // Depth masking
                depthTexture: { value: null },
                cameraNear: { value: 0.1 },
                cameraFar: { value: 100.0 },
                hasDepth: { value: 0.0 },
            },
            vertexShader: `
                varying vec2 vUv;

                void main() {
                    vUv = uv;
                    gl_Position = vec4(position.xy, 0.0, 1.0);
                }
            `,
            fragmentShader: `
                // Impact data
                uniform vec4 impactData0;  // xy=center, zw=direction
                uniform vec4 impactData1;
                uniform vec4 impactData2;
                uniform vec2 impactParams0; // x=propagation, y=amount
                uniform vec2 impactParams1;
                uniform vec2 impactParams2;
                uniform vec3 impactSeeds;
                uniform int numImpacts;

                // Visual params
                uniform vec3 crackColor;
                uniform vec3 crackGlowColor;
                uniform float glowStrength;
                uniform float time;
                uniform float aspectRatio;

                // Depth masking
                uniform sampler2D depthTexture;
                uniform float cameraNear;
                uniform float cameraFar;
                uniform float hasDepth;

                varying vec2 vUv;

                // Hash functions
                float hash(vec2 p) {
                    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
                }

                vec2 hash2(vec2 p) {
                    return vec2(
                        fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453),
                        fract(sin(dot(p, vec2(269.5, 183.3))) * 43758.5453)
                    );
                }

                float noise(vec2 p) {
                    vec2 i = floor(p);
                    vec2 f = fract(p);
                    f = f * f * (3.0 - 2.0 * f);
                    float a = hash(i);
                    float b = hash(i + vec2(1.0, 0.0));
                    float c = hash(i + vec2(0.0, 1.0));
                    float d = hash(i + vec2(1.0, 1.0));
                    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
                }

                float voronoiEdge(vec2 p) {
                    vec2 i = floor(p);
                    vec2 f = fract(p);
                    float minDist = 1.0;
                    float secondDist = 1.0;
                    for (int y = -1; y <= 1; y++) {
                        for (int x = -1; x <= 1; x++) {
                            vec2 neighbor = vec2(float(x), float(y));
                            vec2 cellPoint = neighbor + hash2(i + neighbor) * 0.8;
                            float dist = length(f - cellPoint);
                            if (dist < minDist) {
                                secondDist = minDist;
                                minDist = dist;
                            } else if (dist < secondDist) {
                                secondDist = dist;
                            }
                        }
                    }
                    return secondDist - minDist;
                }

                // Crack line with wobble
                float crackLine(vec2 uv, vec2 origin, vec2 dir, float seed) {
                    vec2 toPoint = uv - origin;
                    float along = dot(toPoint, dir);
                    float perp = abs(dot(toPoint, vec2(-dir.y, dir.x)));
                    if (along < 0.0) return 1.0;
                    float wobble = noise(vec2(along * 8.0 + seed, seed)) * 0.03;
                    perp += wobble * along;
                    float width = 0.015 * (1.0 - along * 0.5);
                    width = max(width, 0.003);
                    return perp / width;
                }

                // Generate crack pattern for a single impact
                float singleImpactCrack(vec2 uv, vec2 center, vec2 direction, float propagation, float seed) {
                    vec2 toPixel = uv - center;
                    float distFromCenter = length(toPixel);

                    float meshRadius = 0.4;
                    float maxRadius = propagation * meshRadius;

                    // Outside propagation radius = no crack
                    if (distFromCenter > maxRadius && propagation < 0.99) {
                        return 1.0;
                    }

                    float crack = 1.0;
                    bool isRadial = length(direction) < 0.1;

                    if (isRadial) {
                        // Radial cracks from center
                        vec2 crackUV = (uv - center) * 15.0 + seed * 10.0;
                        crackUV += vec2(noise(uv * 10.0 + seed), noise(uv * 10.0 + 100.0 + seed)) * 0.3;
                        float edge = voronoiEdge(crackUV);

                        float angle = atan(toPixel.y, toPixel.x);
                        float radialLines = abs(sin(angle * 8.0 + seed * 3.14159 + noise(vec2(distFromCenter * 5.0 + seed)) * 2.0));
                        radialLines = smoothstep(0.0, 0.15, radialLines);

                        crack = min(edge * 2.0, radialLines + 0.3);
                    } else {
                        // Directional cracks
                        vec2 dir = normalize(direction);
                        vec2 perp = vec2(-dir.y, dir.x);

                        for (float i = -2.0; i <= 2.0; i += 1.0) {
                            vec2 offset = perp * i * 0.06;
                            vec2 crackOrigin = center + offset;

                            float angleVar = noise(vec2(i * 10.0 + seed, seed)) * 0.3 - 0.15;
                            vec2 crackDir = vec2(
                                dir.x * cos(angleVar) - dir.y * sin(angleVar),
                                dir.x * sin(angleVar) + dir.y * cos(angleVar)
                            );

                            float line = crackLine(uv, crackOrigin, crackDir, i * 17.3 + seed * 100.0);
                            crack = min(crack, line);

                            // Branch
                            float branchPoint = 0.1 + hash(vec2(i + seed, seed)) * 0.15;
                            vec2 branchOrigin = crackOrigin + crackDir * branchPoint;
                            vec2 branchDir = normalize(crackDir + perp * (hash(vec2(i + seed, 1.0 + seed)) - 0.5) * 0.8);
                            float branch = crackLine(uv, branchOrigin, branchDir, i * 23.7 + seed * 50.0);
                            crack = min(crack, branch * 1.2);
                        }

                        // Web cracks
                        vec2 webUV = uv * 20.0 + seed * 5.0;
                        float web = voronoiEdge(webUV) * 3.0;
                        float crackReach = dot(toPixel, dir);
                        if (crackReach > 0.0 && crackReach < maxRadius) {
                            crack = min(crack, web + 0.5);
                        }
                    }

                    // Fade at propagation edge
                    float edgeFade = 1.0 - smoothstep(maxRadius * 0.5, maxRadius, distFromCenter);

                    return crack / max(edgeFade, 0.3);
                }

                void main() {
                    if (numImpacts == 0) discard;

                    // Work in centered UV space
                    vec2 uv = vUv - 0.5;
                    uv.x *= aspectRatio;

                    // Elliptical mesh bounds check - crystal is taller than wide
                    // Use ellipse: (x/a)^2 + (y/b)^2 <= 1
                    // a = horizontal radius (narrower), b = vertical radius (taller)
                    float meshRadiusX = 0.18;  // Narrow horizontal
                    float meshRadiusY = 0.38;  // Tall vertical
                    float ellipseDist = (uv.x * uv.x) / (meshRadiusX * meshRadiusX) +
                                        (uv.y * uv.y) / (meshRadiusY * meshRadiusY);

                    // Soft edge fade instead of hard cutoff
                    float meshMask = 1.0 - smoothstep(0.7, 1.0, ellipseDist);
                    if (meshMask < 0.01) {
                        discard;
                    }

                    // Depth check (if depth texture available)
                    if (hasDepth > 0.5) {
                        float depth = texture2D(depthTexture, vUv).r;
                        if (depth >= 0.9999) {
                            discard;
                        }
                    }

                    float distFromMeshCenter = length(uv);

                    // Combine all impacts
                    float combinedCrack = 1.0;
                    float maxAmount = 0.0;

                    // Impact 0
                    if (numImpacts >= 1 && impactParams0.y > 0.01) {
                        vec2 center0 = (impactData0.xy - 0.5);
                        center0.x *= aspectRatio;
                        float crack0 = singleImpactCrack(uv, center0, impactData0.zw, impactParams0.x, impactSeeds.x);
                        combinedCrack = min(combinedCrack, crack0);
                        maxAmount = max(maxAmount, impactParams0.y);
                    }

                    // Impact 1
                    if (numImpacts >= 2 && impactParams1.y > 0.01) {
                        vec2 center1 = (impactData1.xy - 0.5);
                        center1.x *= aspectRatio;
                        float crack1 = singleImpactCrack(uv, center1, impactData1.zw, impactParams1.x, impactSeeds.y);
                        combinedCrack = min(combinedCrack, crack1);
                        maxAmount = max(maxAmount, impactParams1.y);
                    }

                    // Impact 2
                    if (numImpacts >= 3 && impactParams2.y > 0.01) {
                        vec2 center2 = (impactData2.xy - 0.5);
                        center2.x *= aspectRatio;
                        float crack2 = singleImpactCrack(uv, center2, impactData2.zw, impactParams2.x, impactSeeds.z);
                        combinedCrack = min(combinedCrack, crack2);
                        maxAmount = max(maxAmount, impactParams2.y);
                    }

                    // Convert to line visibility - INCREASED WIDTH for visibility
                    float crackWidth = 0.12;  // Wider cracks (was 0.08)
                    float crackLine = 1.0 - smoothstep(0.0, crackWidth, combinedCrack);

                    // Edge glow - wider and brighter
                    float glowWidth = crackWidth * 4.0;  // Wider glow (was 3.0)
                    float edgeGlow = 1.0 - smoothstep(crackWidth * 0.3, glowWidth, combinedCrack);
                    edgeGlow = max(0.0, edgeGlow - crackLine * 0.3);

                    // Apply amount - this is the FADE control
                    crackLine *= maxAmount;
                    edgeGlow *= maxAmount * glowStrength;

                    // Shimmer on glow
                    float shimmer = 0.85 + 0.15 * sin(time * 3.0 + distFromMeshCenter * 20.0);
                    edgeGlow *= shimmer;

                    // Final output - INCREASED ALPHA for visibility
                    vec3 color = crackColor * crackLine * 1.5 + crackGlowColor * edgeGlow * 3.0;
                    float alpha = crackLine * 1.0 + edgeGlow * 0.8;  // Full opacity on crack lines

                    if (alpha < 0.001) discard;

                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            blending: THREE.NormalBlending,
            depthTest: false,
            depthWrite: false,
        });

        this.crackMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.crackMesh);
    }

    /**
     * Add a new crack impact
     * @param {Object} impact - Impact parameters
     * @param {THREE.Vector2} impact.centerUV - Screen UV of impact point
     * @param {THREE.Vector2} impact.direction - Crack spread direction
     * @param {number} impact.propagation - How far cracks spread (0-1)
     * @param {number} impact.amount - Crack intensity (0-1)
     */
    addImpact(impact) {
        // Generate unique seed for this impact's pattern
        const seed = Math.random() * 100;

        const newImpact = {
            centerUV: impact.centerUV ? impact.centerUV.clone() : new THREE.Vector2(0.5, 0.5),
            direction: impact.direction ? impact.direction.clone() : new THREE.Vector2(0, 0),
            propagation: impact.propagation ?? 0.8,
            amount: impact.amount ?? 1.0,
            seed,
        };

        // Add to impacts array, enforce max
        if (this.impacts.length >= MAX_IMPACTS) {
            // Remove oldest impact
            this.impacts.shift();
        }
        this.impacts.push(newImpact);

        this._updateUniforms();
    }

    /**
     * Start healing animation - clears all cracks
     * @param {number} duration - Heal duration in ms (default 1500)
     */
    startHealing(duration = 1500) {
        this.isHealing = true;
        this.healDuration = duration;
        this.healStartTime = performance.now();
    }

    /**
     * Clear all cracks immediately (called by shatter)
     */
    clearAll() {
        this.impacts = [];
        this.isHealing = false;
        this.healProgress = 0;
        this._updateUniforms();
    }

    /**
     * Check if there are any active cracks
     * @returns {boolean}
     */
    hasCracks() {
        return this.impacts.length > 0;
    }

    /**
     * Update shader uniforms from impacts array
     * @private
     */
    _updateUniforms() {
        const { uniforms } = this.crackMesh.material;
        uniforms.numImpacts.value = this.impacts.length;

        // Update each impact slot
        for (let i = 0; i < MAX_IMPACTS; i++) {
            const impact = this.impacts[i];
            const dataUniform = uniforms[`impactData${i}`];
            const paramsUniform = uniforms[`impactParams${i}`];

            if (impact) {
                dataUniform.value.set(
                    impact.centerUV.x,
                    impact.centerUV.y,
                    impact.direction.x,
                    impact.direction.y
                );
                paramsUniform.value.set(impact.propagation, impact.amount);
            } else {
                dataUniform.value.set(0, 0, 0, 0);
                paramsUniform.value.set(0, 0);
            }
        }

        // Update seeds
        uniforms.impactSeeds.value.set(
            this.impacts[0]?.seed ?? 0,
            this.impacts[1]?.seed ?? 0,
            this.impacts[2]?.seed ?? 0
        );
    }

    /**
     * Set the depth texture for mesh masking
     * @param {THREE.DepthTexture} depthTexture
     */
    setDepthTexture(depthTexture) {
        this.depthTexture = depthTexture;
        if (this.crackMesh) {
            this.crackMesh.material.uniforms.depthTexture.value = depthTexture;
            this.crackMesh.material.uniforms.hasDepth.value = depthTexture ? 1.0 : 0.0;
        }
    }

    /**
     * Set camera parameters for depth linearization
     * @param {number} near
     * @param {number} far
     */
    setCameraParams(near, far) {
        if (this.crackMesh) {
            this.crackMesh.material.uniforms.cameraNear.value = near;
            this.crackMesh.material.uniforms.cameraFar.value = far;
        }
    }

    /**
     * Set glow color
     * @param {THREE.Color|Array} color
     */
    setGlowColor(color) {
        if (Array.isArray(color)) {
            this.crackGlowColor.setRGB(color[0], color[1], color[2]);
        } else if (color) {
            this.crackGlowColor.copy(color);
        }
        this.crackMesh.material.uniforms.crackGlowColor.value.copy(this.crackGlowColor);
    }

    /**
     * Update the crack layer
     * @param {number} deltaTime - Time since last frame in ms
     * @param {THREE.Camera} mainCamera
     */
    update(deltaTime, mainCamera) {
        const dt = deltaTime / 1000;
        this.time += dt;

        // Handle healing animation
        if (this.isHealing && this.impacts.length > 0) {
            const elapsed = performance.now() - this.healStartTime;
            this.healProgress = Math.min(elapsed / this.healDuration, 1.0);

            // Smooth fade curve (ease-out for natural healing feel)
            const t = this.healProgress;
            const fadeAmount = 1.0 - t * t * (3 - 2 * t); // smoothstep

            // Fade out all impacts - both amount (opacity) AND propagation (spread)
            for (const impact of this.impacts) {
                // Store original values on first heal frame
                if (impact.originalAmount === undefined) {
                    impact.originalAmount = impact.amount;
                    impact.originalPropagation = impact.propagation;
                }
                // Fade opacity
                impact.amount = impact.originalAmount * fadeAmount;
                // Shrink cracks slightly as they heal (cracks "close up")
                impact.propagation = impact.originalPropagation * (0.3 + 0.7 * fadeAmount);
            }

            // Clear when done
            if (this.healProgress >= 1.0) {
                this.clearAll();
            } else {
                this._updateUniforms();
            }
        }

        // Update time and aspect ratio
        const { uniforms } = this.crackMesh.material;
        uniforms.time.value = this.time;
        uniforms.glowStrength.value = this.glowStrength;

        const canvas = this.renderer.domElement;
        uniforms.aspectRatio.value = canvas.width / canvas.height;

        if (mainCamera) {
            uniforms.cameraNear.value = mainCamera.near;
            uniforms.cameraFar.value = mainCamera.far;
        }
    }

    /**
     * Render the crack layer
     * @param {THREE.WebGLRenderer} renderer
     */
    render(renderer) {
        if (this.impacts.length === 0) return;

        const { autoClear } = renderer;
        renderer.autoClear = false;
        renderer.render(this.scene, this.camera);
        renderer.autoClear = autoClear;
    }

    /**
     * Check if crack layer is active
     * @returns {boolean}
     */
    isActive() {
        return this.impacts.length > 0;
    }

    /**
     * Reset all state
     */
    reset() {
        this.clearAll();
    }

    /**
     * Dispose resources
     */
    dispose() {
        if (this.crackMesh) {
            this.crackMesh.geometry.dispose();
            this.crackMesh.material.dispose();
            this.scene.remove(this.crackMesh);
            this.crackMesh = null;
        }
        this.scene = null;
        this.camera = null;
        this.depthTexture = null;
        this._tempVector = null;
        this.impacts = [];
    }
}
