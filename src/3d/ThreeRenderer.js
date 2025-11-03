/**
 * ThreeRenderer - Three.js-based WebGL rendering engine
 *
 * Replaces custom WebGL renderer with Three.js for:
 * - Better lighting (three-point lighting system)
 * - Post-processing effects (bloom, glow)
 * - Advanced materials and shaders
 * - Model loading capabilities (GLTF/GLB)
 * - Real-time shadows
 * - GPU-accelerated particles
 *
 * @module ThreeRenderer
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export class ThreeRenderer {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.options = options;

        // Create Three.js scene
        this.scene = new THREE.Scene();
        this.scene.background = null; // Transparent background for particle overlay

        // Create WebGL renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true, // Transparent background
            antialias: true,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: false
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(canvas.width, canvas.height, false);

        // Enable shadows if requested
        if (options.enableShadows) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            45, // FOV (matches custom WebGL)
            canvas.width / canvas.height, // aspect
            0.1, // near
            100 // far
        );
        this.camera.position.set(0, 0, 3); // Match custom WebGL camera position
        this.camera.lookAt(0, 0, 0);

        // Setup lighting
        this.setupLights();

        // Setup post-processing
        if (options.enablePostProcessing !== false) {
            this.setupPostProcessing();
        }

        // Core mascot mesh (will be created by Core3DManager)
        this.coreMesh = null;

        // Animation mixer for GLTF models
        this.mixer = null;
        this.clock = new THREE.Clock();
    }

    /**
     * Setup three-point lighting system
     * Creates ambient, key, fill, and rim lights for professional look
     */
    setupLights() {
        // Ambient light - base illumination, no shadows
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.ambientLight.name = 'ambientLight';
        this.scene.add(this.ambientLight);

        // Key light - main light source (brightest)
        this.keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.keyLight.position.set(2, 2, 2);
        this.keyLight.name = 'keyLight';
        if (this.options.enableShadows) {
            this.keyLight.castShadow = true;
            this.keyLight.shadow.mapSize.width = 1024;
            this.keyLight.shadow.mapSize.height = 1024;
            this.keyLight.shadow.camera.near = 0.5;
            this.keyLight.shadow.camera.far = 10;
        }
        this.scene.add(this.keyLight);

        // Fill light - softer light from side to reduce harsh shadows
        this.fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        this.fillLight.position.set(-2, 1, 1);
        this.fillLight.name = 'fillLight';
        this.scene.add(this.fillLight);

        // Rim light - backlight for depth and separation from background
        this.rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
        this.rimLight.position.set(0, 1, -2);
        this.rimLight.name = 'rimLight';
        this.scene.add(this.rimLight);
    }

    /**
     * Setup post-processing pipeline
     * Adds bloom/glow effects for emotion-based glow intensity
     */
    setupPostProcessing() {
        // Effect composer for post-processing chain
        this.composer = new EffectComposer(this.renderer);

        // Render pass - base scene render
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        // Bloom pass - glow/bloom effect (Unreal Engine style)
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(this.canvas.width, this.canvas.height),
            1.5, // strength
            0.4, // radius
            0.85 // threshold (only bright areas bloom)
        );
        this.bloomPass.name = 'bloomPass';
        this.composer.addPass(this.bloomPass);
    }

    /**
     * Create core mascot mesh with custom glow material
     * @param {THREE.BufferGeometry} geometry - Three.js geometry
     * @returns {THREE.Mesh}
     */
    createCoreMesh(geometry) {
        // Remove existing mesh if present
        if (this.coreMesh) {
            this.scene.remove(this.coreMesh);
            this.coreMesh.geometry.dispose();
            this.coreMesh.material.dispose();
            this.coreMesh = null;
        }

        // Create custom glow material with Fresnel effect
        const material = this.createGlowMaterial();

        // Create mesh
        this.coreMesh = new THREE.Mesh(geometry, material);
        this.coreMesh.name = 'coreMascot';

        if (this.options.enableShadows) {
            this.coreMesh.castShadow = true;
            this.coreMesh.receiveShadow = true;
        }

        this.scene.add(this.coreMesh);
        return this.coreMesh;
    }

    /**
     * Create custom glow material with Fresnel shader
     * Matches the look of the custom WebGL renderer's core.vert/core.frag
     */
    createGlowMaterial() {
        return new THREE.ShaderMaterial({
            uniforms: {
                glowColor: { value: new THREE.Color(1, 1, 1) },
                glowIntensity: { value: 1.0 },
                coreColor: { value: new THREE.Color(1, 1, 1) },
                fresnelPower: { value: 3.0 }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vViewPosition;

                void main() {
                    // Transform normal to view space
                    vNormal = normalize(normalMatrix * normal);

                    // Calculate view space position
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    vViewPosition = -mvPosition.xyz;

                    // Output clip space position
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                uniform vec3 coreColor;
                uniform float glowIntensity;
                uniform float fresnelPower;

                varying vec3 vNormal;
                varying vec3 vViewPosition;

                void main() {
                    // Fresnel effect: edges glow more than center
                    vec3 viewDir = normalize(vViewPosition);
                    float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), fresnelPower);

                    // Combine white core with colored glow
                    vec3 finalColor = coreColor + (glowColor * glowIntensity * fresnel);

                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `,
            transparent: false,
            side: THREE.FrontSide
        });
    }

    /**
     * Update lighting based on emotion
     * @param {string} emotion - Emotion name
     * @param {Object} emotionData - Emotion visual parameters
     */
    updateLighting(emotion, emotionData) {
        if (!emotionData || !emotionData.visual) return;

        // Get emotion color
        const glowColor = emotionData.visual.glowColor || '#FFFFFF';
        const color = new THREE.Color(glowColor);

        // Get emotion intensity
        const intensity = emotionData.visual.glowIntensity || 1.0;

        // Update key light color and intensity based on emotion
        if (this.keyLight) {
            this.keyLight.color.copy(color);
            this.keyLight.intensity = 0.8 * intensity;
        }

        // Slightly tint fill light
        if (this.fillLight) {
            this.fillLight.color.lerp(color, 0.3);
            this.fillLight.intensity = 0.3 * intensity;
        }

        // Adjust ambient light based on emotion intensity
        if (this.ambientLight) {
            this.ambientLight.intensity = 0.4 * intensity;
        }
    }

    /**
     * Update bloom pass strength based on emotion intensity
     * @param {number} intensity - Glow intensity (0.0 - 2.0)
     */
    updateBloom(intensity) {
        if (this.bloomPass) {
            this.bloomPass.strength = Math.max(0.5, intensity * 1.5);
            this.bloomPass.radius = 0.4;
            this.bloomPass.threshold = Math.max(0.5, 1.0 - intensity * 0.3);
        }
    }

    /**
     * Render frame
     * @param {Object} params - Render parameters
     */
    render(params = {}) {
        const {
            position = [0, 0, 0],
            rotation = [0, 0, 0],
            scale = 1.0,
            glowColor = [1, 1, 1],
            glowIntensity = 1.0
        } = params;

        // Update core mesh transform
        if (this.coreMesh) {
            this.coreMesh.position.set(...position);
            this.coreMesh.rotation.set(...rotation);
            this.coreMesh.scale.setScalar(scale);

            // Update material uniforms
            if (this.coreMesh.material.uniforms) {
                this.coreMesh.material.uniforms.glowColor.value.setRGB(...glowColor);
                this.coreMesh.material.uniforms.glowIntensity.value = glowIntensity;
            }
        }

        // Update animation mixer if present (for GLTF models)
        if (this.mixer) {
            const delta = this.clock.getDelta();
            this.mixer.update(delta);
        }

        // Render with post-processing if enabled, otherwise direct render
        if (this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    /**
     * Resize renderer and camera
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     */
    resize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height, false);

        if (this.composer) {
            this.composer.setSize(width, height);
        }
    }

    /**
     * Cleanup resources
     */
    destroy() {
        // Dispose core mesh
        if (this.coreMesh) {
            this.scene.remove(this.coreMesh);
            this.coreMesh.geometry.dispose();
            this.coreMesh.material.dispose();
            this.coreMesh = null;
        }

        // Dispose composer
        if (this.composer) {
            this.composer.dispose();
            this.composer = null;
        }

        // Dispose renderer
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer = null;
        }

        // Clear scene
        this.scene.clear();
    }
}
