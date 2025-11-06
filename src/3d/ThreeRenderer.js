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
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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

        // Setup camera controls (OrbitControls)
        if (options.enableControls !== false) {
            this.setupCameraControls();
        }

        // Setup lighting
        this.setupLights();

        // Setup post-processing
        if (options.enablePostProcessing !== false) {
            this.setupPostProcessing();
        }

        // Core mascot mesh (will be created by Core3DManager)
        this.coreMesh = null;

        // Material mode: 'glow' (default) or 'glass'
        this.materialMode = 'glow';
        this.glowMaterial = null;
        this.glassMaterial = null;

        // Animation mixer for GLTF models
        this.mixer = null;
        this.clock = new THREE.Clock();

        // Reusable objects to avoid per-frame allocations (performance optimization)
        this._tempColor = new THREE.Color();
        this._tempColor2 = new THREE.Color();
        this._white = new THREE.Color(1, 1, 1);
    }

    /**
     * Setup camera controls (OrbitControls)
     * Allows mouse/touch interaction to rotate and zoom the camera
     */
    setupCameraControls() {
        // IMPORTANT: OrbitControls needs renderer.domElement, not the canvas directly
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        // Enable smooth damping for better feel (especially important for touch)
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Set distance limits (min/max zoom for both mouse wheel and pinch)
        this.controls.minDistance = 2;
        this.controls.maxDistance = 5;

        // Disable panning to keep mascot centered
        this.controls.enablePan = false;

        // Enable auto-rotate for gentle spinning (can be toggled)
        this.controls.autoRotate = this.options.autoRotate !== false; // default true
        this.controls.autoRotateSpeed = 0.5; // slow, subtle rotation

        // Limit vertical rotation to prevent upside-down views
        this.controls.minPolarAngle = Math.PI * 0.2; // 36 degrees from top
        this.controls.maxPolarAngle = Math.PI * 0.8; // 36 degrees from bottom

        // Touch-specific optimizations
        this.controls.rotateSpeed = 0.5; // Slower rotation for more control (both mouse and touch)
        this.controls.zoomSpeed = 1.2; // Slightly faster zoom for better pinch responsiveness

        // Touch gestures are enabled by default:
        // - ONE finger: Rotate (orbit around mascot)
        // - TWO fingers: Pinch to zoom + pan (but pan is disabled above)
        // No need to configure this.controls.touches - defaults are optimal

        // Prevent browser touch gestures from interfering with canvas interaction
        this.renderer.domElement.style.touchAction = 'none';
    }

    /**
     * Setup three-point lighting system
     * Creates ambient, key, fill, and rim lights for professional look
     */
    setupLights() {
        // Scene background - dark gradient instead of pure black
        this.scene.background = new THREE.Color(0x0a0a0f); // Very dark blue-gray

        // Ambient light - moderate for balanced visibility
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
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
        this.fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
        this.fillLight.position.set(-2, 1, 1);
        this.fillLight.name = 'fillLight';
        this.scene.add(this.fillLight);

        // Rim light - backlight for depth and separation from background
        this.rimLight = new THREE.DirectionalLight(0xffffff, 0.7);
        this.rimLight.position.set(0, 1, -2);
        this.rimLight.name = 'rimLight';
        this.scene.add(this.rimLight);

        // Accent lights for glass material (colored rim lights) - subtle for glass effects only
        // Blue accent from left
        this.accentLight1 = new THREE.PointLight(0x00d4ff, 0.3, 10);
        this.accentLight1.position.set(-3, 0, 1);
        this.accentLight1.name = 'accentLight1';
        this.scene.add(this.accentLight1);

        // Pink accent from right
        this.accentLight2 = new THREE.PointLight(0xff1493, 0.2, 10);
        this.accentLight2.position.set(3, 0, 1);
        this.accentLight2.name = 'accentLight2';
        this.scene.add(this.accentLight2);

        // Orange accent from top
        this.accentLight3 = new THREE.PointLight(0xff6b35, 0.2, 10);
        this.accentLight3.position.set(0, 3, -1);
        this.accentLight3.name = 'accentLight3';
        this.scene.add(this.accentLight3);

        // Create environment map for glass reflections
        this.createEnvironmentMap();
    }

    /**
     * Create a vibrant environment map for glass material reflections
     * Generates a colorful gradient cubemap procedurally
     */
    createEnvironmentMap() {
        const size = 512; // Higher resolution for better reflections
        const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(size);

        // Create a vibrant gradient scene for the environment
        const envScene = new THREE.Scene();

        // Vibrant gradient colors
        const skyColor = new THREE.Color(0x5599ff); // Bright sky blue
        const horizonColor = new THREE.Color(0xff6b9d); // Pink horizon
        const groundColor = new THREE.Color(0x1a1a2e); // Deep purple-blue

        // Create gradient using hemisphere light
        const hemiLight = new THREE.HemisphereLight(skyColor, groundColor, 1.5);
        envScene.add(hemiLight);

        // Add colorful point lights to create interesting reflections
        const light1 = new THREE.PointLight(0x00d4ff, 2, 20); // Cyan
        light1.position.set(-5, 2, -5);
        envScene.add(light1);

        const light2 = new THREE.PointLight(0xff1493, 2, 20); // Pink
        light2.position.set(5, 2, -5);
        envScene.add(light2);

        const light3 = new THREE.PointLight(0xffaa00, 1.5, 20); // Orange
        light3.position.set(0, 5, 0);
        envScene.add(light3);

        // Background gradient (top to bottom)
        envScene.background = horizonColor;

        // Create cube camera to capture the environment
        const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);

        // Render the environment
        cubeCamera.update(this.renderer, envScene);

        // Store for use in materials
        this.envMap = cubeRenderTarget.texture;
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

        // Create glow material and store it
        if (!this.glowMaterial) {
            this.glowMaterial = this.createGlowMaterial();
        }

        // Use current material mode
        const material = this.materialMode === 'glass'
            ? (this.glassMaterial || this.createGlassMaterial())
            : this.glowMaterial;

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
     * Swap geometry without recreating mesh (performance optimization)
     * @param {THREE.BufferGeometry} newGeometry - New geometry to swap to
     */
    swapGeometry(newGeometry) {
        if (!this.coreMesh) return;

        // Dispose old geometry
        const oldGeometry = this.coreMesh.geometry;
        if (oldGeometry) {
            oldGeometry.dispose();
        }

        // Swap to new geometry
        this.coreMesh.geometry = newGeometry;
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
     * Create glass material with realistic refraction
     * Uses MeshPhysicalMaterial with transmission for refraction through particles
     */
    createGlassMaterial() {
        // Store default emissive multiplier (can be adjusted via UI)
        this.glassEmissiveMultiplier = 1.5;

        const material = new THREE.MeshPhysicalMaterial({
            transmission: 1.0,           // Full interior transparency (refraction)
            thickness: 0.8,              // Moderate refraction intensity
            roughness: 0.05,             // Nearly clear glass (slight softness)
            metalness: 0.0,              // Non-metallic
            ior: 1.5,                    // Index of refraction (glass)
            reflectivity: 0.5,           // Subtle surface reflections
            envMapIntensity: 1.2,        // Environment reflection strength (boosted)
            side: THREE.DoubleSide,      // Render both faces for proper refraction
            transparent: true,
            opacity: 1.0,
            color: 0xffffff,             // Base color (can be tinted)
            emissive: 0xffffff,          // Internal glow color (white, will be tinted by emotion)
            emissiveIntensity: 0.6,      // Internal glow brightness (raised for visibility)
            clearcoat: 0.8,              // Strong glossy coating for sparkle
            clearcoatRoughness: 0.05,    // Very smooth for sharp highlights
            iridescence: 0.4,            // Color shifting based on viewing angle
            iridescenceIOR: 1.3,         // IOR for iridescence effect
            iridescenceThicknessRange: [100, 400]  // Thickness range for color variation
        });

        // Apply environment map if available
        if (this.envMap) {
            material.envMap = this.envMap;
        }

        return material;
    }

    /**
     * Set material mode and swap materials
     * @param {string} mode - 'glow' or 'glass'
     */
    setMaterialMode(mode) {
        if (!this.coreMesh) {
            console.warn('Cannot set material mode: core mesh not created yet');
            this.materialMode = mode; // Store for when mesh is created
            return;
        }

        if (mode === this.materialMode) {
            return; // Already in this mode
        }

        this.materialMode = mode;

        // Create materials if they don't exist
        if (mode === 'glass' && !this.glassMaterial) {
            this.glassMaterial = this.createGlassMaterial();
        } else if (mode === 'glow' && !this.glowMaterial) {
            this.glowMaterial = this.createGlowMaterial();
        }

        // Swap material
        const newMaterial = mode === 'glass' ? this.glassMaterial : this.glowMaterial;
        this.coreMesh.material = newMaterial;

        console.log(`Material mode set to: ${mode}`);
    }

    /**
     * Update glass material properties
     * @param {Object} props - Glass properties {transmission, thickness, emissiveMultiplier}
     */
    updateGlassProperties(props) {
        if (!this.glassMaterial) return;

        if (props.transmission !== undefined) {
            this.glassMaterial.transmission = props.transmission;
            this.glassMaterial.needsUpdate = true;
        }
        if (props.thickness !== undefined) {
            this.glassMaterial.thickness = props.thickness;
            this.glassMaterial.needsUpdate = true;
        }
        if (props.emissiveMultiplier !== undefined) {
            this.glassEmissiveMultiplier = props.emissiveMultiplier;
        }
    }

    /**
     * Update lighting based on emotion (with smooth transitions)
     * @param {string} emotion - Emotion name
     * @param {Object} emotionData - Emotion visual parameters
     * @param {number} transitionSpeed - Lerp factor (0.0 - 1.0), default 0.15
     */
    updateLighting(emotion, emotionData, transitionSpeed = 0.15) {
        if (!emotionData || !emotionData.visual) return;

        // Get emotion color (reuse temp color to avoid allocation)
        const glowColor = emotionData.visual.glowColor || '#FFFFFF';
        this._tempColor.set(glowColor);

        // Get emotion intensity
        const targetIntensity = emotionData.visual.glowIntensity || 1.0;

        // Smooth transition for key light (primary accent light)
        if (this.keyLight) {
            this.keyLight.color.lerp(this._tempColor, transitionSpeed);
            this.keyLight.intensity += (0.8 * targetIntensity - this.keyLight.intensity) * transitionSpeed;
        }

        // Subtle tint for fill light (secondary light)
        if (this.fillLight) {
            // Reuse temp color 2 for fill target (blend emotion color with white)
            this._tempColor2.copy(this._tempColor).lerp(this._white, 0.7);
            this.fillLight.color.lerp(this._tempColor2, transitionSpeed * 0.5);
            this.fillLight.intensity += (0.3 * targetIntensity - this.fillLight.intensity) * transitionSpeed;
        }

        // Adjust ambient light intensity
        if (this.ambientLight) {
            const ambientTarget = 0.4 * targetIntensity;
            this.ambientLight.intensity += (ambientTarget - this.ambientLight.intensity) * transitionSpeed;
        }
    }

    /**
     * Update bloom pass strength based on emotion intensity (with smooth transitions)
     * @param {number} targetIntensity - Target glow intensity (0.0 - 2.0)
     * @param {number} transitionSpeed - Lerp factor (0.0 - 1.0), default 0.1
     */
    updateBloom(targetIntensity, transitionSpeed = 0.1) {
        if (this.bloomPass) {
            // Smooth transitions for bloom strength and threshold
            const targetStrength = Math.max(0.5, targetIntensity * 1.5);
            const targetThreshold = Math.max(0.5, 1.0 - targetIntensity * 0.3);

            this.bloomPass.strength += (targetStrength - this.bloomPass.strength) * transitionSpeed;
            this.bloomPass.threshold += (targetThreshold - this.bloomPass.threshold) * transitionSpeed;
            this.bloomPass.radius = 0.4; // Keep radius constant
        }
    }

    /**
     * Set camera to a preset view with smooth transition
     * @param {string} preset - Preset name ('front', 'side', 'top', 'angle')
     * @param {number} duration - Transition duration in ms (default 1000)
     */
    setCameraPreset(preset, duration = 1000) {
        if (!this.controls) return;

        const presets = {
            front: { x: 0, y: 0, z: 3 },
            side: { x: 3, y: 0, z: 0 },
            top: { x: 0, y: 3, z: 0.5 },
            angle: { x: 2, y: 1.5, z: 2 },
            back: { x: 0, y: 0, z: -3 }
        };

        const target = presets[preset];
        if (!target) {
            console.warn(`Unknown camera preset: ${preset}`);
            return;
        }

        // Smoothly animate camera to target position
        const startPos = this.camera.position.clone();
        const endPos = new THREE.Vector3(target.x, target.y, target.z);
        const startTime = performance.now();

        const animate = currentTime => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1.0);

            // Ease out cubic for smooth deceleration
            const eased = 1 - Math.pow(1 - progress, 3);

            this.camera.position.lerpVectors(startPos, endPos, eased);

            if (progress < 1.0) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Reset camera to default position
     */
    resetCamera() {
        this.setCameraPreset('front', 1000);
    }

    /**
     * Toggle auto-rotate on/off
     * @param {boolean} enabled - Whether auto-rotate should be enabled
     */
    toggleAutoRotate(enabled) {
        if (this.controls) {
            this.controls.autoRotate = enabled !== undefined ? enabled : !this.controls.autoRotate;
        }
    }

    /**
     * Get current auto-rotate state
     * @returns {boolean}
     */
    isAutoRotateEnabled() {
        return this.controls ? this.controls.autoRotate : false;
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

        // Update camera controls (required for damping and auto-rotate)
        if (this.controls) {
            this.controls.update();
        }

        // Update core mesh transform
        if (this.coreMesh) {
            this.coreMesh.position.set(...position);
            this.coreMesh.rotation.set(...rotation);
            this.coreMesh.scale.setScalar(scale);

            // Update material properties based on material type
            if (this.coreMesh.material.uniforms) {
                // ShaderMaterial (glow material) - update uniforms
                this._tempColor.setRGB(...glowColor);
                this.coreMesh.material.uniforms.glowColor.value.lerp(this._tempColor, 0.15);

                const currentIntensity = this.coreMesh.material.uniforms.glowIntensity.value;
                this.coreMesh.material.uniforms.glowIntensity.value += (glowIntensity - currentIntensity) * 0.15;
            } else if (this.coreMesh.material.emissive) {
                // MeshPhysicalMaterial (glass material) - update emissive properties
                this._tempColor.setRGB(...glowColor);
                this.coreMesh.material.emissive.lerp(this._tempColor, 0.15);

                // Update emissive intensity (smooth transition) - uses adjustable multiplier
                const multiplier = this.glassEmissiveMultiplier || 1.5;
                const targetEmissiveIntensity = glowIntensity * multiplier;
                const currentEmissiveIntensity = this.coreMesh.material.emissiveIntensity;
                this.coreMesh.material.emissiveIntensity += (targetEmissiveIntensity - currentEmissiveIntensity) * 0.15;

                // Also tint the base color slightly for more vibrant glow
                this._tempColor2.setRGB(...glowColor);
                this._tempColor2.lerp(this._white, 0.7); // Mix 30% glow color with 70% white
                this.coreMesh.material.color.lerp(this._tempColor2, 0.15);
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
