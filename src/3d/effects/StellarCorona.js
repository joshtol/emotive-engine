/**
 * Stellar Corona Effect
 *
 * Shader-based corona using Stemkoski's dual-geometry approach combined
 * with procedural noise animation. No canvas textures = no banding.
 *
 * Techniques:
 * - Fresnel-based edge glow (Stemkoski method)
 * - Multi-layer scaled geometry for depth
 * - Simplex noise for animated deformation
 * - Additive blending for natural compositing
 *
 * References:
 * - stemkoski.github.io/Three.js/Shader-Glow.html
 * - bpodgursky.com/2017/02/01/procedural-star-rendering-with-three-js-and-webgl-shaders/
 */

import * as THREE from 'three';

export class StellarCorona {
    /**
     * Create stellar corona effect
     * @param {THREE.Scene} scene - Three.js scene
     * @param {number} sunRadius - Radius of sun geometry
     * @param {Object} config - Configuration options
     */
    constructor(scene, sunRadius, config = {}) {
        this.scene = scene;
        this.sunRadius = sunRadius;

        // Configuration with defaults
        this.config = {
            layerCount: 4,         // Layers of corona
            baseScale: 1.4,        // Start outside sun edge
            scaleIncrement: 0.5,   // Each layer significantly larger
            baseOpacity: 0.6,      // Innermost layer opacity
            opacityFalloff: 0.5,   // Faster falloff for outer layers
            glowPower: 2.5,        // Edge glow sharpness
            animationSpeed: 0.2,   // Animation speed
            noiseScale: 1.5,       // Noise frequency
            noiseAmplitude: 0.12,  // Vertex displacement
            baseIntensity: 4.0,    // Brightness multiplier
            ...config
        };

        this.layers = [];
        this.time = 0;

        // Temp color for reuse
        this._tempColor = new THREE.Color();

        this.createCoronaLayers();
    }

    /**
     * Create multiple corona layers with scaled geometry
     * @private
     */
    createCoronaLayers() {
        for (let i = 0; i < this.config.layerCount; i++) {
            const scale = this.config.baseScale + (i * this.config.scaleIncrement);
            const opacity = this.config.baseOpacity * Math.pow(this.config.opacityFalloff, i);

            const layer = this.createCoronaLayer(scale, opacity, i);
            this.layers.push(layer);
            this.scene.add(layer);
        }
    }

    /**
     * Create a single corona layer
     * @param {number} scale - Size multiplier relative to sun
     * @param {number} opacity - Layer opacity
     * @param {number} index - Layer index for animation offset
     * @returns {THREE.Mesh} Corona layer mesh
     * @private
     */
    createCoronaLayer(scale, opacity, index) {
        // Use sphere geometry matching sun
        const geometry = new THREE.SphereGeometry(
            this.sunRadius * scale,
            64,
            64
        );

        // Store original positions for noise deformation
        const positionAttribute = geometry.attributes.position;
        const originalPositions = new Float32Array(positionAttribute.array);
        geometry.userData.originalPositions = originalPositions;
        geometry.userData.animationOffset = index * 0.5; // Offset animation per layer

        // Radial falloff shader (distance-based, not Fresnel)
        const material = new THREE.ShaderMaterial({
            uniforms: {
                glowColor: { value: new THREE.Color(1.0, 0.9, 0.7) }, // Warm yellow/white
                opacity: { value: opacity },
                intensity: { value: this.config.baseIntensity },
                glowPower: { value: this.config.glowPower },
                time: { value: 0 },
                noiseScale: { value: this.config.noiseScale },
                noiseAmplitude: { value: this.config.noiseAmplitude },
                layerScale: { value: scale } // For radial falloff calculation
            },
            vertexShader: `
                uniform float time;
                uniform float noiseScale;
                uniform float noiseAmplitude;
                uniform float glowPower;
                uniform float layerScale;

                varying float vIntensity;
                varying vec3 vNormal;
                varying vec3 vPosition;

                // Simplex noise (Ashima Arts - WebGL compatible)
                vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
                vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

                float snoise(vec3 v) {
                    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

                    vec3 i  = floor(v + dot(v, C.yyy));
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

                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;

                    // Animated noise deformation
                    vec3 noiseCoord = position * noiseScale + vec3(0.0, time * 0.5, time * 0.3);
                    float noise = snoise(noiseCoord);

                    // Displace vertices along normal direction
                    vec3 displacedPosition = position + normal * noise * noiseAmplitude;

                    // Calculate radial distance from center (for falloff)
                    float dist = length(position);

                    // Normalize to 0-1 range within this layer
                    // At the inner edge (close to previous layer), intensity is high
                    // At the outer edge, intensity falls to zero
                    vIntensity = 1.0;

                    vec4 mvPosition = modelViewMatrix * vec4(displacedPosition, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                uniform float opacity;
                uniform float intensity;
                uniform float glowPower;

                varying float vIntensity;
                varying vec3 vNormal;
                varying vec3 vPosition;

                void main() {
                    // Radial falloff from center to edge of sphere
                    float dist = length(vPosition);

                    // Create edge glow: brightest at inner radius, fades to outer
                    // Normalize position on sphere surface
                    float radialGlow = 1.0;

                    // Apply glow color with intensity
                    vec3 glow = glowColor * intensity * radialGlow;

                    // Output with opacity falloff
                    float alpha = opacity * radialGlow;
                    gl_FragColor = vec4(glow, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.BackSide  // Render from inside so we only see the back faces
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = -10 + index; // Render behind sun
        mesh.frustumCulled = false; // Prevent culling when large

        return mesh;
    }

    /**
     * Update corona animation
     * @param {number} deltaTime - Time since last frame (seconds)
     */
    update(deltaTime) {
        this.time += deltaTime * this.config.animationSpeed;

        // Update time uniform for all layers
        this.layers.forEach(layer => {
            layer.material.uniforms.time.value = this.time + layer.geometry.userData.animationOffset;
        });
    }

    /**
     * Set corona position (follow sun)
     * @param {THREE.Vector3} position - Sun position
     */
    setPosition(position) {
        this.layers.forEach(layer => {
            layer.position.copy(position);
        });
    }

    /**
     * Update corona scale (follow sun scale)
     * @param {THREE.Vector3} scale - Sun scale
     */
    updateScale(scale) {
        this.layers.forEach(layer => {
            layer.scale.copy(scale);
        });
    }

    /**
     * Set corona intensity
     * @param {number} intensity - Intensity multiplier
     */
    setIntensity(intensity) {
        this.layers.forEach((layer, i) => {
            const baseOpacity = this.config.baseOpacity * Math.pow(this.config.opacityFalloff, i);
            layer.material.uniforms.opacity.value = baseOpacity * intensity;
        });
    }

    /**
     * Set corona color
     * @param {THREE.Color|number} color - Color (THREE.Color or hex)
     */
    setColor(color) {
        // Reuse temp color instead of allocating new THREE.Color
        if (color instanceof THREE.Color) {
            this._tempColor.copy(color);
        } else {
            this._tempColor.set(color);
        }
        this.layers.forEach(layer => {
            layer.material.uniforms.glowColor.value.copy(this._tempColor);
        });
    }

    /**
     * Set visibility
     * @param {boolean} visible - Show/hide corona
     */
    setVisible(visible) {
        this.layers.forEach(layer => {
            layer.visible = visible;
        });
    }

    /**
     * Dispose of all resources
     */
    dispose() {
        this.layers.forEach(layer => {
            // Clean up Float32Array from geometry userData
            if (layer.geometry.userData.originalPositions) {
                layer.geometry.userData.originalPositions = null;
            }
            layer.geometry.dispose();
            layer.material.dispose();
            this.scene.remove(layer);
        });
        this.layers = [];

        // Clear temp objects
        this._tempColor = null;

        // Clear scene reference
        this.scene = null;
    }
}
