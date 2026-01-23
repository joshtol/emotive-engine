/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Smoke Particle System
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Billboard sprite particle system for soft organic smoke effects
 * @author Emotive Engine Team
 * @module effects/SmokeParticleSystem
 *
 * ## Why Billboard Sprites?
 *
 * Unlike mesh-based smoke overlays that inherit angular geometry, billboard sprites:
 * - Always face the camera (no angular facets visible)
 * - Use soft pre-rendered cloud textures with radial alpha falloff
 * - Overlap and blend for volumetric appearance
 * - Industry-standard technique for game smoke effects
 *
 * ## Categories
 *
 * | Category  | Behavior                          | Visual Effect           |
 * |-----------|-----------------------------------|-------------------------|
 * | emanating | Rise upward, drift outward        | Smoke rising from source|
 * | afflicted | Swirl around, close inward        | Smoke enveloping target |
 */

import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════════════════════════════
// SOFT CLOUD TEXTURE - Procedurally generated
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Simple hash function for noise
 */
function hash(x, y) {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
}

/**
 * Value noise function
 */
function valueNoise(x, y) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;

    // Smooth interpolation
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);

    const a = hash(ix, iy);
    const b = hash(ix + 1, iy);
    const c = hash(ix, iy + 1);
    const d = hash(ix + 1, iy + 1);

    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

/**
 * FBM (Fractal Brownian Motion) for organic cloud shapes
 */
function fbm(x, y, octaves = 5) {
    let value = 0;
    let amplitude = 0.5;
    let frequency = 1;

    for (let i = 0; i < octaves; i++) {
        value += amplitude * valueNoise(x * frequency, y * frequency);
        amplitude *= 0.5;
        frequency *= 2;
    }

    return value;
}

function smoothstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
}

/**
 * Generate a realistic smoke puff texture with irregular edges
 * Uses FBM noise to create organic cloud-like shapes
 * @param {number} size - Texture size (power of 2)
 * @returns {THREE.DataTexture}
 */
function createSmokeTexture(size = 128) {
    const data = new Uint8Array(size * size * 4);
    const center = size / 2;

    // Random seed offset for variation
    const seedX = Math.random() * 100;
    const seedY = Math.random() * 100;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const i = (y * size + x) * 4;

            // Normalized coordinates (-1 to 1)
            const nx = (x - center) / center;
            const ny = (y - center) / center;
            const dist = Math.sqrt(nx * nx + ny * ny);

            // ═══════════════════════════════════════════════════════════════
            // IRREGULAR EDGE SHAPE - Use noise to distort the boundary
            // ═══════════════════════════════════════════════════════════════

            // Base noise for edge distortion (HIGH amplitude for visible irregular edges)
            const edgeNoise = fbm(nx * 2.5 + seedX, ny * 2.5 + seedY, 4) * 0.55;

            // Wispy tendrils extending outward (directional noise)
            const angle = Math.atan2(ny, nx);
            const tendrilNoise = fbm(angle * 4 + seedX, dist * 5 + seedY, 3) * 0.35;

            // Additional blob deformation for non-circular shape
            const blobNoise = fbm(nx * 1.2 + seedX + 200, ny * 1.2 + seedY + 200, 3) * 0.3;

            // Combined irregular boundary - multiple noise layers create organic shape
            const irregularDist = dist - edgeNoise - tendrilNoise * (1.2 - dist) - blobNoise;

            // Sharper falloff for more defined irregular edges
            const edgeAlpha = 1.0 - smoothstep(0.15, 0.7, irregularDist);

            // ═══════════════════════════════════════════════════════════════
            // INTERNAL CLOUD TURBULENCE - Wispy internal structure
            // ═══════════════════════════════════════════════════════════════

            // Multiple noise layers for internal cloud texture
            const cloud1 = fbm(nx * 3 + seedX + 50, ny * 3 + seedY + 50, 5);
            const cloud2 = fbm(nx * 6 + seedX + 100, ny * 6 + seedY + 100, 4);
            const cloud3 = fbm(nx * 12 + seedX + 150, ny * 12 + seedY + 150, 3);

            // Combine cloud layers
            const cloudiness = cloud1 * 0.5 + cloud2 * 0.3 + cloud3 * 0.2;

            // Internal variation - some areas denser than others
            const internalAlpha = smoothstep(0.25, 0.7, cloudiness);

            // ═══════════════════════════════════════════════════════════════
            // COMBINE FOR FINAL SMOKE PUFF
            // ═══════════════════════════════════════════════════════════════

            // Edge shape modulated by internal cloudiness - higher base for visibility
            let alpha = edgeAlpha * (0.5 + internalAlpha * 0.5);

            // Soft outer fade only at extreme distance
            alpha *= 1.0 - smoothstep(0.75, 1.1, dist);

            // Center variation - smoke has gaps and thin spots
            const centerFade = smoothstep(0.0, 0.2, dist);
            const centerHole = 1.0 - smoothstep(0.0, 0.15, dist) * 0.3 * (1.0 - cloudiness);
            alpha *= (0.6 + centerFade * 0.4) * centerHole;

            // Boost alpha for more visible smoke
            alpha = Math.pow(alpha, 0.85); // Slightly brighter

            // ═══════════════════════════════════════════════════════════════
            // COLOR - Dark gray (real smoke is dark, not white)
            // ═══════════════════════════════════════════════════════════════

            // Base gray - MUCH darker (real smoke blocks light)
            const baseGray = 80 + cloudiness * 50; // 80-130 range (dark gray)

            // Slight color variation for depth
            const colorNoise = fbm(nx * 8 + seedX, ny * 8 + seedY, 3);
            const gray = baseGray + (colorNoise - 0.5) * 25;

            data[i] = Math.floor(gray);     // R
            data[i + 1] = Math.floor(gray); // G
            data[i + 2] = Math.floor(gray + 8); // B - slight blue tint for smoke
            data[i + 3] = Math.floor(Math.max(0, Math.min(255, alpha * 255)));
        }
    }

    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    return texture;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PARTICLE CLASS
// ═══════════════════════════════════════════════════════════════════════════════════════

class SmokeParticle {
    constructor() {
        this.position = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.scale = 1;
        this.scaleGrowth = 0;
        this.alpha = 1;
        this.alphaDecay = 0;
        this.life = 0;
        this.maxLife = 1;
        this.active = false;
    }

    reset() {
        this.position.set(0, 0, 0);
        this.velocity.set(0, 0, 0);
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.scale = 1;
        this.scaleGrowth = 0;
        this.alpha = 1;
        this.alphaDecay = 0;
        this.life = 0;
        this.maxLife = 1;
        this.active = false;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SMOKE PARTICLE SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════════════

export class SmokeParticleSystem {
    /**
     * Create a smoke particle system
     * @param {Object} options
     * @param {number} [options.maxParticles=60] - Maximum particles
     * @param {string} [options.category='emanating'] - 'emanating' or 'afflicted'
     * @param {Array} [options.tint=[1,1,1]] - RGB tint
     * @param {number} [options.density=0.5] - Smoke density (affects spawn rate)
     */
    constructor(options = {}) {
        // More particles for visible motion
        this.maxParticles = options.maxParticles || 50;
        this.category = options.category || 'emanating';
        this.tint = options.tint || [1, 1, 1];
        this.density = options.density || 0.5;
        this.swirl = options.swirl || 0;

        // Particle pool
        this.particles = [];
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push(new SmokeParticle());
        }

        // Create geometry and material
        this._createGeometry();
        this._createMaterial();

        // Create Points mesh
        this.mesh = new THREE.Points(this.geometry, this.material);
        this.mesh.frustumCulled = false;
        this.mesh.renderOrder = 100; // Render on top

        // Spawn timing
        this.spawnTimer = 0;
        this.spawnInterval = 0.08; // Spawn every 80ms
        this.time = 0;
        this.effectStrength = 1.0;
        this.hasBurst = false; // Track if initial burst has happened
    }

    _createGeometry() {
        this.geometry = new THREE.BufferGeometry();

        // Position attribute (xyz for each particle)
        const positions = new Float32Array(this.maxParticles * 3);
        // Custom attributes for size, rotation, alpha, variation
        const sizes = new Float32Array(this.maxParticles);
        const rotations = new Float32Array(this.maxParticles);
        const alphas = new Float32Array(this.maxParticles);
        const variations = new Float32Array(this.maxParticles); // UV variation seed

        // Initialize all as inactive (size 0)
        for (let i = 0; i < this.maxParticles; i++) {
            positions[i * 3] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;
            sizes[i] = 0;
            rotations[i] = 0;
            alphas[i] = 0;
            variations[i] = Math.random(); // Random seed for each particle slot
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
        this.geometry.setAttribute('aRotation', new THREE.BufferAttribute(rotations, 1));
        this.geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
        this.geometry.setAttribute('aVariation', new THREE.BufferAttribute(variations, 1));
    }

    _createMaterial() {
        // HYBRID APPROACH: Animated FBM noise directly in shader
        // No static texture - each particle is a living, animated smoke wisp
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uTint: { value: new THREE.Vector3(this.tint[0], this.tint[1], this.tint[2]) },
                uOpacity: { value: 0.8 },
                uTime: { value: 0 } // Animation time
            },

            vertexShader: /* glsl */`
                attribute float aSize;
                attribute float aRotation;
                attribute float aAlpha;
                attribute float aVariation;

                varying float vAlpha;
                varying float vRotation;
                varying float vVariation;

                void main() {
                    vAlpha = aAlpha;
                    vRotation = aRotation;
                    vVariation = aVariation;

                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

                    // Billboard sizing - scale with distance
                    gl_PointSize = aSize * (300.0 / -mvPosition.z);
                    gl_PointSize = clamp(gl_PointSize, 1.0, 256.0);

                    gl_Position = projectionMatrix * mvPosition;
                }
            `,

            fragmentShader: /* glsl */`
                uniform vec3 uTint;
                uniform float uOpacity;
                uniform float uTime;

                varying float vAlpha;
                varying float vRotation;
                varying float vVariation;

                void main() {
                    // Point coord centered
                    vec2 uv = gl_PointCoord - 0.5;

                    // Rotate UV - VISIBLE rotation as particle spins
                    float c = cos(vRotation);
                    float s = sin(vRotation);
                    uv = vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c);

                    // Distance from center
                    float dist = length(uv) * 2.0;

                    // ═══════════════════════════════════════════════════════════════
                    // SIMPLE SOFT PUFF - Clean cloud shape
                    // Motion comes from particle movement, not shader complexity
                    // ═══════════════════════════════════════════════════════════════

                    // Soft radial falloff - clean puff shape
                    float puff = 1.0 - smoothstep(0.0, 1.0, dist);
                    puff = pow(puff, 0.6); // Softer falloff

                    // Per-particle variation for unique shapes
                    float seed = vVariation * 6.28318;

                    // Slight wobble to break perfect circle
                    float angle = atan(uv.y, uv.x);
                    float wobble = sin(angle * 3.0 + seed) * 0.15 + sin(angle * 5.0 + seed * 2.0) * 0.08;
                    float wobbledDist = dist - wobble * (1.0 - dist);

                    // Final soft shape
                    float shape = 1.0 - smoothstep(0.0, 0.95, wobbledDist);
                    shape = pow(shape, 0.5);

                    // Alpha
                    float alpha = shape * vAlpha * uOpacity;

                    if (alpha < 0.02) discard;

                    // ═══════════════════════════════════════════════════════════════
                    // COLOR - Simple gray smoke
                    // ═══════════════════════════════════════════════════════════════

                    // Core is lighter, edges darker
                    vec3 coreColor = vec3(0.4, 0.4, 0.45);
                    vec3 edgeColor = vec3(0.2, 0.2, 0.25);
                    vec3 smokeColor = mix(coreColor, edgeColor, dist);

                    // Apply tint
                    smokeColor *= uTint;

                    gl_FragColor = vec4(smokeColor, alpha);
                }
            `,

            transparent: true,
            blending: THREE.NormalBlending,
            depthWrite: false,
            depthTest: true
        });
    }

    /**
     * Spawn a new particle
     */
    _spawnParticle() {
        // Find inactive particle
        let particle = null;
        for (const p of this.particles) {
            if (!p.active) {
                particle = p;
                break;
            }
        }

        if (!particle) return;

        particle.active = true;
        particle.life = 0;

        if (this.category === 'explosive') {
            // ═══════════════════════════════════════════════════════════════
            // EXPLOSIVE: FAST burst outward - dramatic poof!
            // ═══════════════════════════════════════════════════════════════
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            // Start at center
            const spawnRadius = 0.02 + Math.random() * 0.03;

            particle.position.set(
                Math.sin(phi) * Math.cos(theta) * spawnRadius,
                Math.sin(phi) * Math.sin(theta) * spawnRadius * 0.3,
                Math.cos(phi) * spawnRadius
            );

            // FAST burst - visible expansion!
            const burstSpeed = 1.2 + Math.random() * 0.8;
            particle.velocity.set(
                Math.sin(phi) * Math.cos(theta) * burstSpeed,
                Math.abs(Math.sin(phi) * Math.sin(theta)) * burstSpeed * 0.5 + 0.4,
                Math.cos(phi) * burstSpeed
            );

            particle.maxLife = 0.8 + Math.random() * 0.4;
            particle.scale = 0.06 + Math.random() * 0.04;
            particle.scaleGrowth = 0.25 + Math.random() * 0.15; // Grow fast
            particle.alpha = 0.5 + Math.random() * 0.2;
            particle.alphaDecay = particle.alpha / particle.maxLife;
            // FAST spin
            particle.rotationSpeed = (Math.random() - 0.5) * 4.0;

        } else if (this.category === 'afflicted') {
            // ═══════════════════════════════════════════════════════════════
            // AFFLICTED: VISIBLE swirling orbit around mascot
            // ═══════════════════════════════════════════════════════════════
            const angle = Math.random() * Math.PI * 2;
            const radius = 0.25 + Math.random() * 0.15;
            const height = (Math.random() - 0.5) * 0.5;

            particle.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );

            // FAST orbital swirl - visibly circling!
            const orbitSpeed = 0.6 + this.swirl * 0.6;
            const inwardPull = 0.1 + this.swirl * 0.1;
            const riseSpeed = 0.15 + Math.random() * 0.1;
            particle.velocity.set(
                -Math.sin(angle) * orbitSpeed - Math.cos(angle) * inwardPull,
                riseSpeed,
                Math.cos(angle) * orbitSpeed - Math.sin(angle) * inwardPull
            );

            particle.maxLife = 1.5 + Math.random() * 0.8;
            particle.scale = 0.06 + Math.random() * 0.04;
            particle.scaleGrowth = 0.08 + Math.random() * 0.05;
            particle.alpha = 0.4 + Math.random() * 0.2;
            particle.alphaDecay = particle.alpha / particle.maxLife;
            // Visible spin
            particle.rotationSpeed = (Math.random() - 0.5) * 3.0;

        } else {
            // ═══════════════════════════════════════════════════════════════
            // EMANATING: VISIBLE rising wisps with drift
            // ═══════════════════════════════════════════════════════════════
            const angle = Math.random() * Math.PI * 2;
            const radius = 0.08 + Math.random() * 0.12;
            const startHeight = -0.3 + Math.random() * 0.1;

            particle.position.set(
                Math.cos(angle) * radius,
                startHeight,
                Math.sin(angle) * radius
            );

            // VISIBLE rise with sideways drift
            const driftX = (Math.random() - 0.5) * 0.3;
            const driftZ = (Math.random() - 0.5) * 0.3;
            const riseSpeed = 0.4 + Math.random() * 0.3;
            particle.velocity.set(
                driftX,
                riseSpeed,
                driftZ
            );

            particle.maxLife = 1.5 + Math.random() * 0.8;
            particle.scale = 0.05 + Math.random() * 0.04;
            particle.scaleGrowth = 0.1 + Math.random() * 0.06;
            particle.alpha = 0.4 + Math.random() * 0.2;
            particle.alphaDecay = particle.alpha / particle.maxLife;
            // Visible spin
            particle.rotationSpeed = (Math.random() - 0.5) * 2.5;
        }

        particle.rotation = Math.random() * Math.PI * 2;
    }

    /**
     * Update the particle system
     * @param {number} deltaTime - Time since last update in seconds
     * @param {Object} config - Configuration from smokeOverlay
     */
    update(deltaTime, config = {}) {
        this.time += deltaTime;
        this.effectStrength = config.thickness || 1.0;

        // Update time uniform for animated FBM
        this.material.uniforms.uTime.value = this.time;

        // Update category-specific settings
        if (config.category && config.category !== this.category) {
            this.category = config.category;
        }

        if (config.tint) {
            this.material.uniforms.uTint.value.set(config.tint[0], config.tint[1], config.tint[2]);
        }

        if (config.swirl !== undefined) {
            this.swirl = config.swirl;
        }

        if (config.density !== undefined) {
            this.density = config.density;
        }

        // Spawn new particles
        this.spawnTimer += deltaTime;

        // ═══════════════════════════════════════════════════════════════
        // INITIAL BURST - For explosive category, spawn many at once!
        // ═══════════════════════════════════════════════════════════════
        if (this.category === 'explosive' && !this.hasBurst && this.effectStrength > 0.5) {
            // INSTANT burst - many particles at once!
            const burstCount = 15 + Math.floor(Math.random() * 5);
            for (let i = 0; i < burstCount; i++) {
                this._spawnParticle();
            }
            this.hasBurst = true;
        }

        // Reset burst flag when effect ends
        if (this.effectStrength < 0.1) {
            this.hasBurst = false;
        }

        // Spawn rates - fast enough to see continuous stream
        let baseInterval;
        if (this.category === 'explosive') {
            baseInterval = 0.04; // Rapid burst
        } else if (this.category === 'afflicted') {
            baseInterval = 0.06; // Fast swirl
        } else {
            baseInterval = 0.05; // Fast rise
        }
        const spawnRate = baseInterval / (0.5 + this.density * 0.5) / this.effectStrength;

        while (this.spawnTimer >= spawnRate) {
            this._spawnParticle();
            this.spawnTimer -= spawnRate;
        }

        // Update particles
        const positions = this.geometry.attributes.position.array;
        const sizes = this.geometry.attributes.aSize.array;
        const rotations = this.geometry.attributes.aRotation.array;
        const alphas = this.geometry.attributes.aAlpha.array;

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];

            if (!p.active) {
                sizes[i] = 0;
                alphas[i] = 0;
                continue;
            }

            // Update life
            p.life += deltaTime;
            if (p.life >= p.maxLife) {
                p.active = false;
                sizes[i] = 0;
                alphas[i] = 0;
                continue;
            }

            // Progress (0-1)
            const progress = p.life / p.maxLife;

            // Update position
            p.position.x += p.velocity.x * deltaTime;
            p.position.y += p.velocity.y * deltaTime;
            p.position.z += p.velocity.z * deltaTime;

            // Slow down over time
            // Light drag - particles keep moving!
            p.velocity.multiplyScalar(0.995);

            // Update rotation
            p.rotation += p.rotationSpeed * deltaTime;

            // Update scale (grow over time)
            const currentScale = p.scale + p.scaleGrowth * progress;

            // Update alpha (fade out)
            // Smooth fade: full alpha until 30%, then fade
            let currentAlpha = p.alpha;
            if (progress > 0.3) {
                const fadeProgress = (progress - 0.3) / 0.7;
                currentAlpha = p.alpha * (1 - fadeProgress * fadeProgress);
            }

            // Write to buffers
            positions[i * 3] = p.position.x;
            positions[i * 3 + 1] = p.position.y;
            positions[i * 3 + 2] = p.position.z;
            sizes[i] = currentScale * 100 * this.effectStrength;
            rotations[i] = p.rotation;
            alphas[i] = currentAlpha * this.effectStrength;
        }

        // Mark buffers as needing update
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.aSize.needsUpdate = true;
        this.geometry.attributes.aRotation.needsUpdate = true;
        this.geometry.attributes.aAlpha.needsUpdate = true;
    }

    /**
     * Set the parent mesh (for positioning)
     * @param {THREE.Object3D} parent
     */
    attachTo(parent) {
        if (this.mesh.parent) {
            this.mesh.parent.remove(this.mesh);
        }
        parent.add(this.mesh);
    }

    /**
     * Remove from scene
     */
    detach() {
        if (this.mesh.parent) {
            this.mesh.parent.remove(this.mesh);
        }
    }

    /**
     * Clean up resources
     */
    dispose() {
        this.detach();
        this.geometry.dispose();
        this.material.dispose();
        // Don't dispose shared texture
    }
}

// Static shared texture with version for forced regeneration
SmokeParticleSystem._cloudTexture = null;
SmokeParticleSystem._textureVersion = 0;

export default SmokeParticleSystem;
