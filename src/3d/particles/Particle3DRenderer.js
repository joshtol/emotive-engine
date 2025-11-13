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
 * Particle Vertex Shader - Enhanced with Depth-of-Field
 * Handles per-particle positioning, sizing, and depth-based scaling
 *
 * ENHANCEMENTS:
 * - Depth attribute for distance-based effects
 * - Style attribute for cell-shaded borders
 */

// Per-particle attributes
attribute float size;
attribute vec3 customColor;
attribute float alpha;
attribute float glowIntensity;
attribute float depth;        // NEW: Normalized distance (0=near, 1=far)
attribute float style;        // NEW: 0.0=solid, 1.0=bordered

// Varying to fragment shader
varying vec3 vColor;
varying float vAlpha;
varying float vGlowIntensity;
varying float vDepth;         // NEW: Depth for blur/fade
varying float vStyle;         // NEW: Style for rendering

void main() {
    // Pass attributes to fragment shader
    vColor = customColor;
    vAlpha = alpha;
    vGlowIntensity = glowIntensity;
    vDepth = depth;
    vStyle = style;

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
 * Particle Fragment Shader - Enhanced with Multiple Effects
 * Creates soft, glowing particles with depth-of-field and style variety
 *
 * ENHANCEMENTS (from report):
 * - Priority 1: Depth-of-field (distance-based blur and opacity)
 * - Priority 2: Cell-shaded borders (ring style for 1/3 of particles)
 * - Priority 3: Multi-layer glow system (outer + inner layers)
 * - Priority 4: Multi-stop color gradients (bright center → dark edge)
 */

// From vertex shader
varying vec3 vColor;
varying float vAlpha;
varying float vGlowIntensity;
varying float vDepth;
varying float vStyle;

void main() {
    // Calculate distance from center of point sprite
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);

    // Discard fragments outside circle
    if (dist > 0.5) {
        discard;
    }

    // PRIORITY 1: Depth-of-Field Effect
    // Distance-based edge softness (near=sharp 0.2, far=soft 0.5)
    float depthBlur = mix(0.2, 0.5, vDepth);
    float gradient = smoothstep(0.5, 0.5 - depthBlur, dist);

    // Distance-based opacity falloff (distant particles dimmer)
    float depthOpacity = mix(1.0, 0.6, vDepth * 0.5);

    // PRIORITY 4: Multi-Stop Color Gradient
    // Three-stop gradient: bright center → mid-tone → dark edge
    float gradientPos = dist * 2.0; // 0 (center) to 1 (edge)

    vec3 centerColor = vColor * 1.3; // Bright center
    vec3 midColor = vColor * 1.0;    // Normal mid
    vec3 edgeColor = vColor * 0.7;   // Dark edge

    vec3 gradientColor;
    if (gradientPos < 0.5) {
        // Blend center → mid
        gradientColor = mix(centerColor, midColor, gradientPos * 2.0);
    } else {
        // Blend mid → edge
        gradientColor = mix(midColor, edgeColor, (gradientPos - 0.5) * 2.0);
    }

    // PRIORITY 3: Enhanced Multi-Layer Glow System
    vec3 finalColor = gradientColor;
    float glowAlpha = 0.0;

    if (vGlowIntensity > 0.5) {
        // Outer glow ring (soft, large halo)
        float outerGlow = 1.0 - smoothstep(0.3, 0.5, dist);
        outerGlow *= vGlowIntensity * 0.3;

        // Inner glow core (bright, concentrated)
        float innerGlow = 1.0 - smoothstep(0.0, 0.2, dist);
        innerGlow *= vGlowIntensity * 0.5;

        // Combine glow layers
        float totalGlow = outerGlow + innerGlow;
        finalColor += finalColor * totalGlow;
        glowAlpha = totalGlow * 0.3;
    }

    // PRIORITY 2: Cell-Shaded Border Style
    float finalAlpha = vAlpha * gradient * depthOpacity;

    if (vStyle > 0.5) {
        // Cell-shaded particle: render border ring
        float borderWidth = 0.08; // 8% of particle radius
        float borderDist = abs(dist - 0.4); // Distance from border ring
        float borderAlpha = smoothstep(borderWidth, 0.0, borderDist);

        // Mix core and border
        float coreMask = smoothstep(0.4, 0.35, dist); // Inner core
        finalAlpha = mix(borderAlpha * 0.9, finalAlpha, coreMask);

        // Slightly brighter border
        finalColor = mix(finalColor * 1.2, finalColor, coreMask);
    }

    // Apply glow alpha if stronger than base
    finalAlpha = max(finalAlpha, glowAlpha);

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
        this.depths = null;        // NEW: Depth for depth-of-field
        this.styles = null;        // NEW: Style for cell-shaded borders

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
        this.depths = new Float32Array(maxParticles); // depth (0=near, 1=far)
        this.styles = new Float32Array(maxParticles); // style (0=solid, 1=bordered)

        // Create buffer attributes
        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));
        this.geometry.setAttribute('customColor', new THREE.BufferAttribute(this.colors, 3));
        this.geometry.setAttribute('alpha', new THREE.BufferAttribute(this.alphas, 1));
        this.geometry.setAttribute('glowIntensity', new THREE.BufferAttribute(this.glowIntensities, 1));
        this.geometry.setAttribute('depth', new THREE.BufferAttribute(this.depths, 1));
        this.geometry.setAttribute('style', new THREE.BufferAttribute(this.styles, 1));

        // Set dynamic flags for attributes that will be updated
        this.geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
        this.geometry.attributes.size.setUsage(THREE.DynamicDrawUsage);
        this.geometry.attributes.customColor.setUsage(THREE.DynamicDrawUsage);
        this.geometry.attributes.alpha.setUsage(THREE.DynamicDrawUsage);
        this.geometry.attributes.glowIntensity.setUsage(THREE.DynamicDrawUsage);
        this.geometry.attributes.depth.setUsage(THREE.DynamicDrawUsage);
        this.geometry.attributes.style.setUsage(THREE.DynamicDrawUsage);

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

            // PRIORITY 5: Size variety (0.8x-1.2x variation for organic feel)
            const depthSize = particle.getDepthAdjustedSize ? particle.getDepthAdjustedSize() : particle.size;
            const sizeVariation = 0.8 + Math.random() * 0.4; // 0.8x - 1.2x
            this.sizes[i] = depthSize * 0.3 * sizeVariation; // Scale for point sprite size

            // Update color
            const color = this._parseColor(particle.color || '#ffffff');
            const colorIndex = i * 3;
            this.colors[colorIndex + 0] = color.r;
            this.colors[colorIndex + 1] = color.g;
            this.colors[colorIndex + 2] = color.b;

            // PRIORITY 5: Read baseOpacity from 2D particle (already varies 0.3-0.7)
            this.alphas[i] = particle.opacity * (particle.baseOpacity || 1.0);

            // PRIORITY 3: Enhanced glow with size multipliers (1.33x-1.66x)
            // Map 2D glow multiplier (1.33-1.66) to shader intensity (3.0-12.0 range)
            let glowIntensity = particle.hasGlow ? (particle.glowSizeMultiplier || 1.5) * 3.0 : 0;

            // Apply gesture effects (these can boost glow further)
            glowIntensity = this._applyGestureEffects(particle, glowIntensity, i);

            this.glowIntensities[i] = glowIntensity;

            // PRIORITY 1: Calculate depth for depth-of-field
            // Normalize particle.z from [-1, 1] to [0, 1] for shader
            // z=-1 (far behind) → depth=1.0 (max blur)
            // z=0 (at orb) → depth=0.5 (medium blur)
            // z=1 (far front) → depth=0.0 (sharp)
            const normalizedDepth = (1.0 - particle.z) * 0.5; // Invert and scale
            this.depths[i] = Math.max(0.0, Math.min(1.0, normalizedDepth));

            // PRIORITY 2: Read cell-shaded style from 2D particle
            // 1/3 of 2D particles have isCellShaded=true
            this.styles[i] = particle.isCellShaded ? 1.0 : 0.0;
        }

        // Mark attributes as needing update
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.size.needsUpdate = true;
        this.geometry.attributes.customColor.needsUpdate = true;
        this.geometry.attributes.alpha.needsUpdate = true;
        this.geometry.attributes.glowIntensity.needsUpdate = true;
        this.geometry.attributes.depth.needsUpdate = true;
        this.geometry.attributes.style.needsUpdate = true;

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
        this.depths = null;
        this.styles = null;
    }
}

export default Particle3DRenderer;
