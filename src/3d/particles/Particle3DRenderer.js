/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Particle 3D Renderer
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Three.js-based particle renderer with custom shaders
 * @author Emotive Engine Team
 * @module 3d/particles/Particle3DRenderer
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Renders 2D particles in 3D space using Three.js:
 * ║ • Creates point sprite system with BufferGeometry
 * ║ • Custom shaders for glow and color effects
 * ║ • Efficient attribute updates for 60fps performance
 * ║ • Gesture effects (firefly glow, shimmer, flicker)
 * ║ • Frustum culling and LOD optimization
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * RENDERING STRATEGY:
 * - Use THREE.Points with BufferGeometry for instanced rendering
 * - Per-particle attributes: position, size, color, alpha, glow
 * - Custom shaders for soft glowing particles
 * - Additive blending for overlapping glow effects
 */

import * as THREE from 'three';

// Define shaders inline (avoid import issues with .glsl files)
const particleVertexShader = `
/**
 * Particle Vertex Shader
 * Handles per-particle positioning, sizing, and depth-based scaling
 */

// Per-particle attributes
attribute float size;
attribute vec3 customColor;
attribute float alpha;
attribute float glowIntensity;

// Varying to fragment shader
varying vec3 vColor;
varying float vAlpha;
varying float vGlowIntensity;

void main() {
    // Pass attributes to fragment shader
    vColor = customColor;
    vAlpha = alpha;
    vGlowIntensity = glowIntensity;

    // Calculate position in clip space
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // Calculate point size with perspective scaling
    // Closer particles appear larger
    float perspectiveScale = 150.0 / length(mvPosition.xyz);
    gl_PointSize = size * perspectiveScale;

    // Final position
    gl_Position = projectionMatrix * mvPosition;
}
`;

const particleFragmentShader = `
/**
 * Particle Fragment Shader
 * Creates soft, glowing particles with radial gradients
 */

// From vertex shader
varying vec3 vColor;
varying float vAlpha;
varying float vGlowIntensity;

void main() {
    // Calculate distance from center of point sprite
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);

    // Discard fragments outside circle
    if (dist > 0.5) {
        discard;
    }

    // Create radial gradient for soft edges (sharper falloff)
    float edgeSoftness = 0.3;
    float gradient = smoothstep(0.5, 0.5 - edgeSoftness, dist);

    // Apply glow intensity to brightness (minimal)
    float brightness = 1.0 + vGlowIntensity * 0.05;

    // Create core glow (brighter in center) - extremely subtle
    float coreGlow = 1.0 - (dist * 2.0);
    coreGlow = max(0.0, coreGlow);

    // Combine color with glow (minimal glow contribution)
    vec3 finalColor = vColor * brightness;
    finalColor += vColor * coreGlow * vGlowIntensity * 0.02;

    // Apply alpha with gradient
    float finalAlpha = vAlpha * gradient;

    gl_FragColor = vec4(finalColor, finalAlpha);
}
`;

export class Particle3DRenderer {
    constructor(maxParticles = 50, options = {}) {
        this.maxParticles = maxParticles;
        this.options = options;

        // Three.js objects
        this.geometry = null;
        this.material = null;
        this.points = null;

        // Particle attributes (typed arrays for performance)
        this.positions = null;
        this.sizes = null;
        this.colors = null;
        this.alphas = null;
        this.glowIntensities = null;

        // Current particle count
        this.particleCount = 0;

        // Gesture effect state
        this.gestureEffects = {
            firefly: false,
            flicker: false,
            shimmer: false,
            glow: false,
            time: 0
        };

        // Initialize the rendering system
        this._initGeometry();
        this._initMaterial();
        this._initPoints();
    }

    /**
     * Initialize BufferGeometry with particle attributes
     */
    _initGeometry() {
        this.geometry = new THREE.BufferGeometry();

        // Allocate typed arrays (pre-allocate for max particles)
        const {maxParticles} = this;

        this.positions = new Float32Array(maxParticles * 3); // x, y, z
        this.sizes = new Float32Array(maxParticles); // size
        this.colors = new Float32Array(maxParticles * 3); // r, g, b
        this.alphas = new Float32Array(maxParticles); // alpha
        this.glowIntensities = new Float32Array(maxParticles); // glow

        // Create buffer attributes
        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));
        this.geometry.setAttribute('customColor', new THREE.BufferAttribute(this.colors, 3));
        this.geometry.setAttribute('alpha', new THREE.BufferAttribute(this.alphas, 1));
        this.geometry.setAttribute('glowIntensity', new THREE.BufferAttribute(this.glowIntensities, 1));

        // Set dynamic flags for attributes that will be updated
        this.geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
        this.geometry.attributes.size.setUsage(THREE.DynamicDrawUsage);
        this.geometry.attributes.customColor.setUsage(THREE.DynamicDrawUsage);
        this.geometry.attributes.alpha.setUsage(THREE.DynamicDrawUsage);
        this.geometry.attributes.glowIntensity.setUsage(THREE.DynamicDrawUsage);

        // Set initial draw range to 0 (no particles yet)
        this.geometry.setDrawRange(0, 0);
    }

    /**
     * Initialize shader material
     */
    _initMaterial() {
        this.material = new THREE.ShaderMaterial({
            uniforms: {},
            vertexShader: particleVertexShader,
            fragmentShader: particleFragmentShader,
            transparent: true,
            blending: THREE.NormalBlending, // Changed from Additive to Normal for less blowout
            depthWrite: false, // Don't write to depth buffer
            depthTest: true // Test depth for proper occlusion
        });
    }

    /**
     * Initialize THREE.Points object
     */
    _initPoints() {
        this.points = new THREE.Points(this.geometry, this.material);
        this.points.frustumCulled = false; // Disable frustum culling for now (particles can be outside view)
    }

    /**
     * Update particle data from 2D particle system
     * @param {Array} particles - Array of 2D particles
     * @param {Particle3DTranslator} translator - Position translator
     * @param {Object} corePosition - 3D mascot position
     * @param {Object} canvasSize - Canvas dimensions
     * @param {Object} rotationState - Mascot rotation state for orbital physics (optional)
     * @param {number} deltaTime - Time delta for physics (optional)
     * @param {Object} gestureData - Active gesture data (optional)
     */
    updateParticles(particles, translator, corePosition, canvasSize, rotationState, deltaTime, gestureData) {
        this.particleCount = Math.min(particles.length, this.maxParticles);
        // Update gesture effect time - cap at 2π to prevent indefinite accumulation
        this.gestureEffects.time += 0.016; // ~60fps
        if (this.gestureEffects.time > Math.PI * 2) {
            this.gestureEffects.time = this.gestureEffects.time % (Math.PI * 2);
        }

        // Update translator rotation state for orbital physics (with gesture info)
        if (rotationState && deltaTime) {
            translator.updateRotationState(rotationState, deltaTime, gestureData);
        }

        // Update each particle's attributes
        for (let i = 0; i < this.particleCount; i++) {
            const particle = particles[i];

            // Skip dead particles
            if (!particle.isAlive()) {
                continue;
            }

            // Translate 2D position to 3D (with orbital physics if enabled)
            const pos3D = translator.translate2DTo3D(particle, corePosition, canvasSize);

            // Update position
            const posIndex = i * 3;
            this.positions[posIndex + 0] = pos3D.x;
            this.positions[posIndex + 1] = pos3D.y;
            this.positions[posIndex + 2] = pos3D.z;

            // Update size (depth-adjusted)
            const depthSize = particle.getDepthAdjustedSize ? particle.getDepthAdjustedSize() : particle.size;
            this.sizes[i] = depthSize * 0.3; // Scale for point sprite size (2x larger)

            // Update color
            const color = this._parseColor(particle.color || '#ffffff');
            const colorIndex = i * 3;
            this.colors[colorIndex + 0] = color.r;
            this.colors[colorIndex + 1] = color.g;
            this.colors[colorIndex + 2] = color.b;

            // Update alpha
            this.alphas[i] = particle.opacity * (particle.baseOpacity || 1.0);

            // Calculate glow intensity (base + gesture effects)
            let glowIntensity = particle.hasGlow ? (particle.glowSizeMultiplier || 1.5) * 0.3 : 0;

            // Apply gesture effects
            glowIntensity = this._applyGestureEffects(particle, glowIntensity, i);

            this.glowIntensities[i] = glowIntensity;
        }

        // Mark attributes as needing update
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.size.needsUpdate = true;
        this.geometry.attributes.customColor.needsUpdate = true;
        this.geometry.attributes.alpha.needsUpdate = true;
        this.geometry.attributes.glowIntensity.needsUpdate = true;

        // Update draw range
        this.geometry.setDrawRange(0, this.particleCount);
    }

    /**
     * Apply gesture effects to particle glow
     * @param {Object} particle - 2D particle
     * @param {number} baseGlow - Base glow intensity
     * @param {number} index - Particle index
     * @returns {number} Modified glow intensity
     */
    _applyGestureEffects(particle, baseGlow, index) {
        let glow = baseGlow;

        // Firefly effect (sparkle gesture) - pulsing particles
        if (this.gestureEffects.firefly) {
            const particlePhase = (particle.x * 0.01 + particle.y * 0.01 + particle.size * 0.1) % (Math.PI * 2);
            const sineValue = (Math.sin(this.gestureEffects.time * 3 + particlePhase) + 1.0) * 0.5; // 0 to 1
            const fireflyGlow = 2.0 + sineValue * 10.0; // Range: 2.0 to 12.0
            glow = Math.max(glow, fireflyGlow);
        }

        // Flicker effect - dramatic random flickering
        if (this.gestureEffects.flicker) {
            // Create rapid, chaotic flicker
            const particlePhase = (particle.x * 0.02 + particle.y * 0.02) % (Math.PI * 2);
            const time = this.gestureEffects.time * 15; // Fast flicker rate

            // Combine fast oscillation with random jumps - normalized to 0-1
            const baseSine = (Math.sin(time + particlePhase) + 1.0) * 0.5; // 0 to 1
            const timeStep = Math.floor(time * 10 + index);
            const randomJump = (Math.sin(timeStep * 123.456) + 1.0) * 0.5; // 0 to 1

            // Random flicker - NEVER zero, always visible, range 2.0 to 12.0
            const flickerValue = baseSine * 0.3 + randomJump * 0.7; // 0 to 1
            const flickerGlow = 2.0 + flickerValue * 10.0; // Range: 2.0 to 12.0

            glow = Math.max(glow, flickerGlow);
        }

        // Shimmer effect - traveling wave of glow
        if (this.gestureEffects.shimmer) {
            const dx = particle.x - (this.gestureEffects.centerX || 0);
            const dy = particle.y - (this.gestureEffects.centerY || 0);
            const distance = Math.sqrt(dx * dx + dy * dy);
            const normalizedDistance = distance / 200;

            const wave = (Math.sin(this.gestureEffects.time * 3 - normalizedDistance) + 1.0) * 0.5; // 0 to 1
            const shimmerGlow = 2.0 + wave * 8.0; // Range: 2.0 to 10.0
            glow = Math.max(glow, shimmerGlow);
        }

        // Glow effect - dramatic pulsing radiant glow
        if (this.gestureEffects.glow) {
            const progress = this.gestureEffects.glowProgress || 0;

            // Simple pulsing glow that affects all particles
            // Peak at middle of gesture (progress = 0.5)
            const glowCurve = Math.sin(progress * Math.PI); // 0 to 1 to 0

            // Pulse from moderately bright to extremely bright
            const glowPulse = 3.0 + glowCurve * 12.0; // Range: 3.0 to 15.0

            glow = Math.max(glow, glowPulse);
        }

        return glow;
    }

    /**
     * Parse hex color to RGB object
     * @param {string} hex - Hex color code
     * @returns {Object} {r, g, b} in 0-1 range
     */
    _parseColor(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) {
            return { r: 1.0, g: 1.0, b: 1.0 };
        }

        return {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
        };
    }

    /**
     * Set gesture effects
     * @param {Object} gestureTransform - Gesture transform data
     */
    setGestureEffects(gestureTransform) {
        if (!gestureTransform) {
            // Clear all effects
            this.gestureEffects.firefly = false;
            this.gestureEffects.flicker = false;
            this.gestureEffects.shimmer = false;
            this.gestureEffects.glow = false;
            return;
        }

        // Update effect flags
        this.gestureEffects.firefly = gestureTransform.fireflyEffect || false;
        this.gestureEffects.flicker = gestureTransform.flickerEffect || false;
        this.gestureEffects.shimmer = gestureTransform.shimmerEffect || false;
        this.gestureEffects.glow = gestureTransform.glowEffect || false;

        // Store effect parameters
        this.gestureEffects.glowProgress = gestureTransform.glowProgress;
        this.gestureEffects.centerX = gestureTransform.centerX;
        this.gestureEffects.centerY = gestureTransform.centerY;
    }

    /**
     * Get the THREE.Points object for adding to scene
     * @returns {THREE.Points} The particle system
     */
    getPoints() {
        return this.points;
    }

    /**
     * Update visibility
     * @param {boolean} visible - Whether particles should be visible
     */
    setVisible(visible) {
        this.points.visible = visible;
    }

    /**
     * Resize particle buffer capacity
     * Properly disposes old geometry before creating new one
     * @param {number} newMaxParticles - New maximum particle count
     */
    resize(newMaxParticles) {
        if (newMaxParticles === this.maxParticles) {
            return; // No change needed
        }

        // Dispose old geometry to free GPU memory
        if (this.geometry) {
            this.geometry.dispose();
        }

        // Update max particles
        this.maxParticles = newMaxParticles;

        // Recreate geometry with new size
        this._initGeometry();

        // Update points reference to new geometry
        if (this.points) {
            this.points.geometry = this.geometry;
        }
    }

    /**
     * Clean up per-particle physics state
     * Call this when particles are removed to prevent memory accumulation
     * @param {Array} particles - Current active particles array
     */
    cleanupParticleStates(particles) {
        // Remove behaviorData from dead particles to prevent memory leaks
        for (const particle of particles) {
            if (!particle.isAlive() && particle.behaviorData) {
                // Clear cached 3D direction and orbital data
                if (particle.behaviorData.direction3D) {
                    particle.behaviorData.direction3D = null;
                }
                if (particle.behaviorData.orbitPlane) {
                    particle.behaviorData.orbitPlane = null;
                }
                if (particle.behaviorData.orbitPath) {
                    particle.behaviorData.orbitPath = null;
                }
                // Clear entire behaviorData object
                particle.behaviorData = null;
            }
        }
    }

    /**
     * Cleanup resources
     */
    dispose() {
        if (this.geometry) {
            this.geometry.dispose();
        }
        if (this.material) {
            this.material.dispose();
        }
        this.positions = null;
        this.sizes = null;
        this.colors = null;
        this.alphas = null;
        this.glowIntensities = null;
    }
}

export default Particle3DRenderer;
