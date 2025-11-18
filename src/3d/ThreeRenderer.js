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
import { normalizeColorLuminance } from '../utils/glowIntensityFilter.js';

export class ThreeRenderer {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.options = options;

        // Create Three.js scene
        this.scene = new THREE.Scene();
        this.scene.background = null; // Transparent background for particle overlay

        // Create WebGL renderer with high precision to reduce banding
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true, // Transparent background
            antialias: true,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: false,
            precision: 'highp', // High precision float for smoother gradients
            logarithmicDepthBuffer: false,
            stencil: false
        });

        // Force higher color depth if available
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.NoToneMapping;
        this.renderer.toneMappingExposure = 1.0;

        // PERFORMANCE: Limit pixel ratio to 1.5 for desktop (35% performance gain, no visible difference)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        this.renderer.setSize(canvas.width, canvas.height, false);

        // Enable shadows if requested
        if (options.enableShadows) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }

        // WebGL context loss handling (critical for mobile stability)
        this._contextLost = false;
        this._boundHandleContextLost = this.handleContextLost.bind(this);
        this._boundHandleContextRestored = this.handleContextRestored.bind(this);
        canvas.addEventListener('webglcontextlost', this._boundHandleContextLost, false);
        canvas.addEventListener('webglcontextrestored', this._boundHandleContextRestored, false);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            45, // FOV (matches custom WebGL)
            canvas.width / canvas.height, // aspect
            0.1, // near
            100 // far
        );
        this.cameraDistance = options.cameraDistance !== undefined ? options.cameraDistance : 3;
        this.camera.position.set(0, 0, this.cameraDistance);
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

        // Quaternion/Euler temp objects for render() - avoid 10-15 allocations per frame
        this._tempQuat = new THREE.Quaternion();
        this._tempEuler = new THREE.Euler();
        this._quatX = new THREE.Quaternion();
        this._quatY = new THREE.Quaternion();
        this._quatZ = new THREE.Quaternion();
        this._rollQuat = new THREE.Quaternion();
        this._meshQuat = new THREE.Quaternion();
        this._xAxis = new THREE.Vector3(1, 0, 0);
        this._yAxis = new THREE.Vector3(0, 1, 0);
        this._zAxis = new THREE.Vector3(0, 0, 1);
        this._cameraToMesh = new THREE.Vector3();
        this._cameraDir = new THREE.Vector3();
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
        this.controls.dampingFactor = 0.1; // Increased from 0.05 for faster response

        // Set distance limits (min/max zoom for both mouse wheel and pinch)
        // Use configured camera distance as the baseline, allowing zoom from 50% to 200% of initial distance
        const minZoom = this.cameraDistance * 0.5;
        const maxZoom = this.cameraDistance * 2.0;
        this.controls.minDistance = minZoom;
        this.controls.maxDistance = maxZoom;

        // Disable panning to keep mascot centered
        this.controls.enablePan = false;

        // Enable auto-rotate for gentle spinning (can be toggled)
        this.controls.autoRotate = this.options.autoRotate === true; // default false
        this.controls.autoRotateSpeed = this.options.autoRotateSpeed !== undefined ? this.options.autoRotateSpeed : 0.5; // slow, subtle rotation

        // Limit vertical rotation to prevent upside-down views
        this.controls.minPolarAngle = Math.PI * 0.2; // 36 degrees from top
        this.controls.maxPolarAngle = Math.PI * 0.8; // 36 degrees from bottom

        // Touch-specific optimizations - improved responsiveness
        this.controls.rotateSpeed = 0.8; // Increased from 0.5 for faster touch rotation
        this.controls.zoomSpeed = 1.5; // Increased from 1.2 for more responsive pinch zoom

        // Touch gestures configuration
        // - ONE finger: Rotate (orbit around mascot)
        // - TWO fingers: Pinch to zoom + pan (but pan is disabled above)

        // Mobile-specific improvements
        if ('ontouchstart' in window) {
            // Faster response on touch devices
            this.controls.dampingFactor = 0.15; // Even faster on touch
            this.controls.rotateSpeed = 1.0; // More responsive rotation on mobile
            this.controls.zoomSpeed = 2.0; // Very responsive pinch zoom
        }

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
     * Create environment map for glass material reflections
     * Loads HDRI studio lighting or falls back to procedural generation
     */
    async createEnvironmentMap() {
        // Try to load HDRI first
        try {
            const { EXRLoader } = await import('three/examples/jsm/loaders/EXRLoader.js');
            const { RGBELoader } = await import('three/examples/jsm/loaders/RGBELoader.js');
            const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
            pmremGenerator.compileEquirectangularShader();

            // Try EXR first
            try {
                const exrLoader = new EXRLoader();
                const texture = await exrLoader.loadAsync('/hdri/studio_01.exr');
                texture.mapping = THREE.EquirectangularReflectionMapping;
                this.envMap = pmremGenerator.fromEquirectangular(texture).texture;
                texture.dispose(); // CRITICAL: Dispose source texture after PMREM conversion (10-22MB GPU memory leak fix)
                pmremGenerator.dispose();
                // console.log('✅ Loaded HDRI environment map');
                return;
            } catch (exrError) {
                console.warn('Could not load EXR, trying fallback:', exrError.message);
            }
        } catch (error) {
            console.warn('HDRI loaders not available, using procedural envmap:', error.message);
        }

        // Fallback: Procedural environment map
        const size = 512;
        const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(size);
        const envScene = new THREE.Scene();

        const skyColor = new THREE.Color(0x5599ff);
        const horizonColor = new THREE.Color(0xff6b9d);
        const groundColor = new THREE.Color(0x1a1a2e);

        const hemiLight = new THREE.HemisphereLight(skyColor, groundColor, 1.5);
        envScene.add(hemiLight);

        const light1 = new THREE.PointLight(0x00d4ff, 2, 20);
        light1.position.set(-5, 2, -5);
        envScene.add(light1);

        const light2 = new THREE.PointLight(0xff1493, 2, 20);
        light2.position.set(5, 2, -5);
        envScene.add(light2);

        const light3 = new THREE.PointLight(0xffaa00, 1.5, 20);
        light3.position.set(0, 5, 0);
        envScene.add(light3);

        envScene.background = horizonColor;

        const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);
        cubeCamera.update(this.renderer, envScene);

        this.envMap = cubeRenderTarget.texture;

        // CRITICAL: Store procedural environment resources for proper disposal (GPU memory leak fix)
        this._envCubeRenderTarget = cubeRenderTarget;
        this._envScene = envScene;
        this._envCubeCamera = cubeCamera;

        // console.log('Using procedural environment map');
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
        // PERFORMANCE: Use half resolution for bloom - bloom is a blur effect so lower resolution
        // doesn't affect visual quality significantly, but improves performance by 2-4x
        const bloomResolution = new THREE.Vector2(
            Math.floor(this.canvas.width / 2),
            Math.floor(this.canvas.height / 2)
        );
        this.bloomPass = new UnrealBloomPass(
            bloomResolution,
            1.2, // strength - moderate glow
            0.5, // radius - tight spread
            0.3  // threshold - preserve texture detail
        );
        this.bloomPass.name = 'bloomPass';
        this.bloomPass.enabled = true;
        this.composer.addPass(this.bloomPass);
    }

    /**
     * Handle WebGL context loss
     * Prevents default behavior and sets flag to stop rendering
     * @param {Event} event - Context lost event
     */
    handleContextLost(event) {
        event.preventDefault();
        this._contextLost = true;
        console.warn('⚠️ WebGL context lost - rendering paused');

        // Cancel any ongoing animation frames
        if (this.cameraAnimationId) {
            cancelAnimationFrame(this.cameraAnimationId);
            this.cameraAnimationId = null;
        }
    }

    /**
     * Handle WebGL context restoration
     * Recreates resources and resumes rendering
     */
    handleContextRestored() {
        // console.log('✅ WebGL context restored - recreating resources');
        this._contextLost = false;

        // Recreate all GPU resources
        this.recreateResources();
    }

    /**
     * Recreate all GPU resources after context loss
     * Rebuilds geometries, materials, textures, and post-processing
     */
    recreateResources() {
        // console.log('🔄 Recreating GPU resources after context restoration');

        // Recreate environment map
        this.createEnvironmentMap();

        // Recreate materials
        if (this.materialMode === 'glow') {
            this.glowMaterial = this.createGlowMaterial();
            if (this.coreMesh) {
                this.coreMesh.material = this.glowMaterial;
            }
        } else if (this.materialMode === 'glass') {
            this.glassMaterial = this.createGlassMaterial();
            if (this.coreMesh) {
                this.coreMesh.material = this.glassMaterial;
            }
            // Recreate inner core
            if (this.coreMesh) {
                this.createInnerCore();
            }
        }

        // Note: Three.js automatically recreates geometries and textures
        // when they are first accessed after context restoration

        // console.log('✅ GPU resources recreated successfully');
    }

    /**
     * Create core mascot mesh with custom glow material
     * @param {THREE.BufferGeometry} geometry - Three.js geometry
     * @param {THREE.Material} customMaterial - Optional custom material (e.g., moon textures)
     * @returns {THREE.Mesh}
     */
    createCoreMesh(geometry, customMaterial = null) {
        // Remove existing mesh if present
        if (this.coreMesh) {
            this.scene.remove(this.coreMesh);
            this.coreMesh.geometry.dispose();
            this.disposeMaterial(this.coreMesh.material);
            this.coreMesh = null;
        }

        // Determine which material to use
        let material;

        if (customMaterial) {
            // Use provided custom material (e.g., moon with NASA textures)
            material = customMaterial;
            // console.log('✅ Using custom material for geometry');
        } else {
            // Create glow material and store it
            if (!this.glowMaterial) {
                this.glowMaterial = this.createGlowMaterial();
            }

            // Use current material mode
            material = this.materialMode === 'glass'
                ? (this.glassMaterial || this.createGlassMaterial())
                : this.glowMaterial;
        }

        // Create mesh
        this.coreMesh = new THREE.Mesh(geometry, material);
        this.coreMesh.name = 'coreMascot';

        if (this.options.enableShadows) {
            this.coreMesh.castShadow = true;
            this.coreMesh.receiveShadow = true;
        }

        this.scene.add(this.coreMesh);

        // Create white inner core for glass mode (lightsaber effect)
        if (this.materialMode === 'glass') {
            this.createInnerCore();
        }

        return this.coreMesh;
    }

    /**
     * Swap geometry without recreating mesh (performance optimization)
     * @param {THREE.BufferGeometry} newGeometry - New geometry to swap to
     * @param {THREE.Material} customMaterial - Optional custom material to swap to
     */
    swapGeometry(newGeometry, customMaterial = null) {
        if (!this.coreMesh) return;

        // Dispose old geometry
        const oldGeometry = this.coreMesh.geometry;
        if (oldGeometry) {
            oldGeometry.dispose();
        }

        // Swap to new geometry
        this.coreMesh.geometry = newGeometry;

        // If custom material provided, swap material too
        if (customMaterial) {
            // console.log('✅ Swapping to custom material during morph');
            // Dispose old material (but NOT if it's glow/glass material - we reuse those)
            if (this.coreMesh.material && this.coreMesh.material !== this.glowMaterial && this.coreMesh.material !== this.glassMaterial) {
                this.disposeMaterial(this.coreMesh.material);
            }
            // Assign new custom material
            this.coreMesh.material = customMaterial;
        } else {
            // Swapping back to standard material - restore glow or glass
            const standardMaterial = this.materialMode === 'glass'
                ? (this.glassMaterial || this.createGlassMaterial())
                : this.glowMaterial;

            if (this.coreMesh.material !== standardMaterial) {
                // console.log('✅ Restoring standard material:', this.materialMode);
                // Dispose custom material
                if (this.coreMesh.material && this.coreMesh.material !== this.glowMaterial && this.coreMesh.material !== this.glassMaterial) {
                    this.disposeMaterial(this.coreMesh.material);
                }
                this.coreMesh.material = standardMaterial;
            }
        }

        // Recreate inner core to match new geometry (if in glass mode and NOT custom material)
        if (this.materialMode === 'glass' && !customMaterial) {
            this.createInnerCore();
        }
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
                    // Both core and glow respect glowIntensity for proper on/off toggle
                    vec3 finalColor = (coreColor * glowIntensity) + (glowColor * glowIntensity * fresnel);

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
        // Using white emissive for uniform bloom, so this needs to be low
        this.glassEmissiveMultiplier = 0.60;

        const material = new THREE.MeshPhysicalMaterial({
            transmission: 1.0,           // Full interior transparency (refraction)
            thickness: 2.7,              // Strong refraction intensity (user-tuned)
            roughness: 0.37,             // Slightly frosted surface (user-tuned)
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
     * Create white inner core for lightsaber effect in glass mode
     * Creates a smaller mesh inside the glass crystal with bright white emissive
     */
    createInnerCore() {
        // Remove existing inner core if present
        if (this.innerCore) {
            // Inner core is a child of coreMesh, not scene
            if (this.coreMesh) {
                this.coreMesh.remove(this.innerCore);
            }
            this.innerCore.geometry.dispose();
            this.disposeMaterial(this.innerCore.material);
            this.innerCore = null;
        }

        if (!this.coreMesh || !this.coreMesh.geometry) return;

        // Detect geometry type and create matching inner core
        const outerGeometry = this.coreMesh.geometry;
        let coreGeometry;

        console.log('🔍 Creating inner core:', {
            type: outerGeometry.type,
            hasParams: !!outerGeometry.parameters,
            tube: outerGeometry.parameters?.tube,
            radius: outerGeometry.parameters?.radius
        });

        // Check geometry type by constructor or parameters
        if (outerGeometry.type === 'TorusGeometry' || outerGeometry.parameters?.tube !== undefined) {
            // TORUS: Create thinner torus that follows the donut hole
            console.log('✅ Detected TORUS, creating torus inner core');
            const params = outerGeometry.parameters;
            const radius = params.radius || 1.0;
            const tubeRadius = (params.tube || 0.4) * 0.25; // Much thinner tube for lightsaber effect
            const radialSegments = params.radialSegments || 16;
            const tubularSegments = params.tubularSegments || 100;
            coreGeometry = new THREE.TorusGeometry(radius, tubeRadius, radialSegments, tubularSegments);
        }
        else if (outerGeometry.type === 'SphereGeometry') {
            // SPHERE: Smaller sphere
            const params = outerGeometry.parameters;
            const radius = (params.radius || 1.0) * 0.2;
            coreGeometry = new THREE.SphereGeometry(radius, 32, 32);
        }
        else if (outerGeometry.type === 'BoxGeometry') {
            // BOX/CUBE: Smaller box
            const params = outerGeometry.parameters;
            const width = (params.width || 1.0) * 0.2;
            const height = (params.height || 1.0) * 0.2;
            const depth = (params.depth || 1.0) * 0.2;
            coreGeometry = new THREE.BoxGeometry(width, height, depth);
        }
        else if (outerGeometry.type === 'IcosahedronGeometry' || outerGeometry.type === 'OctahedronGeometry') {
            // CRYSTAL SHAPES: Smaller version (20% scale works perfectly)
            const params = outerGeometry.parameters;
            const radius = (params.radius || 1.0) * 0.2;
            const detail = params.detail || 2;
            if (outerGeometry.type === 'IcosahedronGeometry') {
                coreGeometry = new THREE.IcosahedronGeometry(radius, detail);
            } else {
                coreGeometry = new THREE.OctahedronGeometry(radius, detail);
            }
        }
        else {
            // DEFAULT: Use small icosahedron for unknown geometries
            coreGeometry = new THREE.IcosahedronGeometry(0.2, 2);
        }

        // Bright white emissive material for lightsaber effect
        const coreMaterial = new THREE.MeshStandardMaterial({
            emissive: 0xffffff,
            emissiveIntensity: 2.0,  // Bright white core
            color: 0xffffff,
            transparent: false,
            opacity: 1.0
        });

        this.innerCore = new THREE.Mesh(coreGeometry, coreMaterial);
        this.innerCore.name = 'innerCore';

        // Add inner core as child of main core mesh so it transforms with it
        this.coreMesh.add(this.innerCore);
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

        // Create or remove inner core based on mode
        if (mode === 'glass') {
            this.createInnerCore();
        } else if (this.innerCore) {
            // Remove inner core when switching to glow mode
            this.coreMesh.remove(this.innerCore);
            this.innerCore.geometry.dispose();
            this.disposeMaterial(this.innerCore.material);
            this.innerCore = null;
        }

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
        if (props.roughness !== undefined) {
            this.glassMaterial.roughness = props.roughness;
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
    /**
     * Normalize intensity to a narrow range using logarithmic scaling
     * Compresses wide intensity range (0.3-10.0) to uniform output (0.8-1.2)
     * @param {number} intensity - Raw intensity value
     * @returns {number} Normalized intensity (0.8-1.2)
     */
    normalizeIntensity(intensity) {
        // Logarithmic scaling to compress wide range
        const normalized = Math.log(intensity + 1) / Math.log(11); // 0.3-10.0 → 0.0-1.0
        return 0.8 + normalized * 0.4; // Maps to 0.8-1.2 range (±20% variation)
    }

    /**
     * Calculate relative luminance of RGB color (0-1 range)
     * Uses sRGB formula with gamma correction
     * @param {number} r - Red (0-1)
     * @param {number} g - Green (0-1)
     * @param {number} b - Blue (0-1)
     * @returns {number} Relative luminance (0-1)
     */
    calculateColorLuminance(r, g, b) {
        const linearize = c => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
    }

    updateBloom(targetIntensity, transitionSpeed = 0.1, geometryType = null) {
        if (this.bloomPass) {
            const normalized = this.normalizeIntensity(targetIntensity);
            let targetThreshold, targetStrength, targetRadius;

            // Sun geometry needs controlled bloom for NASA-quality photosphere detail
            // Reduced values to show texture while maintaining edge glow
            if (geometryType === 'sun') {
                targetStrength = 1.2;   // Moderate glow strength (was 5.0 - too extreme)
                targetRadius = 0.5;     // Tighter glow spread (was 1.5 - too large)
                targetThreshold = 0.3;  // Higher threshold to preserve texture detail (was 0.05)
            } else if (this.materialMode === 'glass') {
                // Glass mode needs much lower bloom strength to avoid haziness
                // Since we're using white emissive at fixed intensity for uniformity
                targetStrength = 0.3;  // Low strength for subtle glass glow
                targetRadius = 0.2;     // Tight radius to reduce haze
                targetThreshold = 0.85; // Fixed threshold
            } else {
                // Glow mode uses variable bloom
                targetStrength = 1.0 + normalized * 0.8; // Maps to 1.0-1.8 range
                targetRadius = 0.4;
                targetThreshold = 0.85; // Fixed threshold
            }

            this.bloomPass.strength += (targetStrength - this.bloomPass.strength) * transitionSpeed;
            this.bloomPass.threshold += (targetThreshold - this.bloomPass.threshold) * transitionSpeed;
            this.bloomPass.radius = targetRadius;
        }
    }

    /**
     * Set camera to a preset view with smooth transition
     * @param {string} preset - Preset name ('front', 'side', 'top', 'angle')
     * @param {number} duration - Transition duration in ms (default 1000)
     */
    setCameraPreset(preset, duration = 1000) {
        if (!this.controls) return;

        const d = this.cameraDistance;
        const presets = {
            front: { x: 0, y: 0, z: d },
            side: { x: d, y: 0, z: 0 },
            top: { x: 0, y: d, z: 0 },  // True top-down view (directly above)
            angle: { x: d * 0.67, y: d * 0.5, z: d * 0.67 },
            back: { x: 0, y: 0, z: -d },
            bottom: { x: 0, y: -d, z: 0 }  // Bottom view (directly below)
        };

        const target = presets[preset];
        if (!target) {
            console.warn(`Unknown camera preset: ${preset}`);
            return;
        }

        // If instant (duration = 0), set position directly
        if (duration === 0) {
            // Fully reset OrbitControls to initial state
            this.controls.reset();
            // Then set to target position
            this.camera.position.set(target.x, target.y, target.z);
            this.camera.lookAt(0, 0, 0);
            this.controls.target.set(0, 0, 0);
            this.controls.update();
            return;
        }

        // Reset OrbitControls target to center (origin) for animated presets
        this.controls.target.set(0, 0, 0);

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
            this.camera.lookAt(0, 0, 0);
            this.controls.update();

            if (progress < 1.0) {
                this.cameraAnimationId = requestAnimationFrame(animate);
            } else {
                this.cameraAnimationId = null;
            }
        };

        this.cameraAnimationId = requestAnimationFrame(animate);
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
     * @param {Array<number>} [params.position=[0,0,0]] - Core mesh position [x, y, z]
     * @param {Array<number>} [params.rotation=[0,0,0]] - Core mesh rotation [x, y, z]
     * @param {number} [params.scale=1.0] - Core mesh scale
     * @param {Array<number>} [params.glowColor=[1,1,1]] - Glow color RGB [r, g, b]
     * @param {number} [params.glowIntensity=1.0] - Glow intensity
     * @param {string} [params.glowColorHex=null] - Hex color for luminance normalization
     * @param {boolean} [params.hasActiveGesture=false] - Whether a gesture is currently active
     * @param {Array<number>} [params.calibrationRotation=[0,0,0]] - Manual rotation offset
     * @param {number} [params.cameraRoll=0] - Camera-space roll rotation
     * @param {SolarEclipse} [params.solarEclipse=null] - Solar eclipse manager for synchronized updates
     * @param {number} [params.deltaTime=0] - Delta time for eclipse animation (seconds)
     */
    render(params = {}) {
        const {
            position = [0, 0, 0],
            rotation = [0, 0, 0],
            scale = 1.0,
            glowColor = [1, 1, 1],
            glowIntensity = 1.0,
            glowColorHex = null,  // Hex color for luminance normalization
            hasActiveGesture = false,  // Whether a gesture is currently active
            calibrationRotation = [0, 0, 0],  // Manual rotation offset applied on top of animations
            cameraRoll = 0,  // Camera-space roll rotation applied after all other rotations
            solarEclipse = null,  // Solar eclipse manager for synchronized updates
            deltaTime = 0  // Delta time for eclipse animation
        } = params;

        // Update camera controls (required for damping and auto-rotate)
        if (this.controls) {
            this.controls.update();
        }

        // Update core mesh transform
        if (this.coreMesh) {
            this.coreMesh.position.set(...position);

            // Apply animated rotation + calibration offset using quaternions
            // X and Y rotate around world axes, Z rotates around camera's viewing direction

            // Start with base rotation from animation system - REUSE temp objects
            this._tempEuler.set(rotation[0], rotation[1], rotation[2], 'XYZ');
            this._tempQuat.setFromEuler(this._tempEuler);

            // Apply calibration rotations - REUSE quaternions
            this._quatX.setFromAxisAngle(this._xAxis, calibrationRotation[0]); // X-axis (world)
            this._quatY.setFromAxisAngle(this._yAxis, calibrationRotation[1]); // Y-axis (world)

            // Z rotates around camera's viewing direction (camera to moon) - REUSE vector
            this._cameraToMesh.subVectors(this.coreMesh.position, this.camera.position).normalize();
            this._quatZ.setFromAxisAngle(this._cameraToMesh, calibrationRotation[2]); // Z-axis (camera view direction)

            // Combine: base rotation, then X, then Y, then Z
            // Reuse tempQuat for final result (already contains base rotation)
            this._tempQuat.multiply(this._quatX);
            this._tempQuat.multiply(this._quatY);
            this._tempQuat.multiply(this._quatZ);

            this.coreMesh.rotation.setFromQuaternion(this._tempQuat);

            // Apply camera-space roll (rotates around camera's forward vector)
            if (cameraRoll !== 0) {
                // Get camera direction (from camera to mesh) - REUSE vector
                this._cameraDir.subVectors(this.coreMesh.position, this.camera.position).normalize();

                // Create quaternion for rotation around camera direction - REUSE quaternion
                this._rollQuat.setFromAxisAngle(this._cameraDir, cameraRoll);

                // Apply camera roll to mesh rotation - REUSE quaternion
                this._meshQuat.setFromEuler(this.coreMesh.rotation);
                this._meshQuat.premultiply(this._rollQuat);
                this.coreMesh.rotation.setFromQuaternion(this._meshQuat);
            }

            this.coreMesh.scale.setScalar(scale);

            // Update solar eclipse effects after transforms are applied (synchronized movement)
            // CRITICAL: Eclipse update must happen AFTER position/rotation/scale are applied to coreMesh
            // to ensure shadow disk and corona are positioned based on the CURRENT frame's transforms,
            // not the previous frame's. This prevents visible lag during gesture animations.
            if (solarEclipse) {
                solarEclipse.update(this.camera, this.coreMesh, deltaTime);
            }

            // Update material properties based on material type
            if (this.coreMesh.material.uniforms) {
                // ShaderMaterial (glow material) - update uniforms
                this._tempColor.setRGB(...glowColor);
                this.coreMesh.material.uniforms.glowColor.value.lerp(this._tempColor, 0.15);

                // Normalize intensity to prevent huge brightness differences between emotions
                // Use wider range during gestures to make effects visible
                // Special case: if glowIntensity is 0 (glow disabled), pass 0 directly
                let targetIntensity;
                if (glowIntensity === 0) {
                    targetIntensity = 0;
                } else {
                    if (hasActiveGesture) {
                        // During gestures: bypass normalization entirely, use raw intensity
                        // Direct mapping: gesture outputs 1.0-1.8 → shader sees 1.0-1.8
                        targetIntensity = glowIntensity;
                    } else {
                        // Normal state: use normalized intensity for consistent emotions
                        targetIntensity = this.normalizeIntensity(glowIntensity);
                    }
                }
                const currentIntensity = this.coreMesh.material.uniforms.glowIntensity.value;
                // Use faster lerp (0.5) for gestures, slower (0.15) for smooth emotion transitions
                const lerpSpeed = hasActiveGesture ? 0.5 : 0.15;
                this.coreMesh.material.uniforms.glowIntensity.value += (targetIntensity - currentIntensity) * lerpSpeed;
            } else if (this.coreMesh.material.emissive) {
                // MeshPhysicalMaterial (glass material) - update emissive properties
                // BLOOM + COLOR SOLUTION:
                // User wants BOTH uniform bloom AND visible emotion colors
                // Compromise: Use colored emissive with per-color intensity compensation
                // to MINIMIZE (not eliminate) brightness differences

                // Apply emotion color to emissive
                this._tempColor.setRGB(...glowColor);
                this.coreMesh.material.emissive.lerp(this._tempColor, 0.15);

                // Use the ORIGINAL glowIntensity which compensates for color luminance
                // But keep base multiplier low to minimize remaining differences
                const compensatedIntensity = glowIntensity * 0.15; // Much lower than glow mode
                const currentEmissiveIntensity = this.coreMesh.material.emissiveIntensity;
                // Use faster lerp (0.5) for gestures, slower (0.15) for smooth emotion transitions
                const lerpSpeed = hasActiveGesture ? 0.5 : 0.15;
                this.coreMesh.material.emissiveIntensity += (compensatedIntensity - currentEmissiveIntensity) * lerpSpeed;

                // Keep base color white for clean glass
                this.coreMesh.material.color.lerp(this._white, 0.15);
            }

            // Control inner core visibility based on glow intensity
            if (this.innerCore) {
                // Hide inner core when glow is disabled (intensity = 0)
                this.innerCore.visible = glowIntensity > 0;
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

            // PERFORMANCE: Update bloom pass resolution to half size for better performance
            if (this.bloomPass && this.bloomPass.resolution) {
                this.bloomPass.resolution.set(
                    Math.floor(width / 2),
                    Math.floor(height / 2)
                );
            }
        }
    }

    /**
     * Dispose material and all its textures (prevent GPU memory leaks)
     * @param {THREE.Material} material - Material to dispose
     * @private
     */
    disposeMaterial(material) {
        if (!material) return;

        // Dispose all texture properties (map, normalMap, envMap, etc.)
        const textureProperties = [
            'map', 'lightMap', 'bumpMap', 'normalMap', 'specularMap',
            'envMap', 'alphaMap', 'aoMap', 'displacementMap', 'emissiveMap',
            'gradientMap', 'metalnessMap', 'roughnessMap'
        ];

        textureProperties.forEach(prop => {
            if (material[prop]) {
                material[prop].dispose();
            }
        });

        // For ShaderMaterial, dispose textures and clear Color objects in uniforms
        if (material.uniforms) {
            Object.values(material.uniforms).forEach(uniform => {
                if (uniform.value) {
                    // Dispose textures
                    if (uniform.value.isTexture) {
                        uniform.value.dispose();
                        uniform.value = null;
                    }
                    // Clear Color objects to break references
                    else if (uniform.value.isColor) {
                        uniform.value = null;
                    }
                    // Clear Vector objects to break references
                    else if (uniform.value.isVector2 || uniform.value.isVector3 || uniform.value.isVector4) {
                        uniform.value = null;
                    }
                }
            });
        }

        // Dispose the material itself
        material.dispose();
    }

    /**
     * Cleanup resources
     */
    destroy() {
        // Remove WebGL context event listeners
        if (this.canvas) {
            this.canvas.removeEventListener('webglcontextlost', this._boundHandleContextLost, false);
            this.canvas.removeEventListener('webglcontextrestored', this._boundHandleContextRestored, false);
        }

        // Cancel camera animation RAF
        if (this.cameraAnimationId) {
            cancelAnimationFrame(this.cameraAnimationId);
            this.cameraAnimationId = null;
        }

        // Dispose inner core
        if (this.innerCore) {
            if (this.coreMesh) {
                this.coreMesh.remove(this.innerCore);
            }
            this.innerCore.geometry.dispose();
            this.disposeMaterial(this.innerCore.material);
            this.innerCore = null;
        }

        // Dispose core mesh
        if (this.coreMesh) {
            this.scene.remove(this.coreMesh);
            this.coreMesh.geometry.dispose();
            this.disposeMaterial(this.coreMesh.material);
            this.coreMesh = null;
        }

        // Dispose shared materials (glow and glass)
        if (this.glowMaterial) {
            this.disposeMaterial(this.glowMaterial);
            this.glowMaterial = null;
        }
        if (this.glassMaterial) {
            this.disposeMaterial(this.glassMaterial);
            this.glassMaterial = null;
        }

        // Dispose composer
        if (this.composer) {
            this.composer.dispose();
            this.composer = null;
        }

        // Dispose controls (removes DOM event listeners)
        if (this.controls) {
            this.controls.dispose();
            this.controls = null;
        }

        // Dispose lights with shadow maps
        if (this.keyLight?.shadow?.map) this.keyLight.shadow.map.dispose();
        if (this.fillLight?.shadow?.map) this.fillLight.shadow.map.dispose();
        if (this.rimLight?.shadow?.map) this.rimLight.shadow.map.dispose();
        this.keyLight = null;
        this.fillLight = null;
        this.rimLight = null;
        this.ambientLight = null;
        this.accentLight1 = null;
        this.accentLight2 = null;
        this.accentLight3 = null;

        // Dispose environment map
        if (this.envMap) {
            this.envMap.dispose();
            this.envMap = null;
        }

        // CRITICAL: Dispose procedural environment resources (GPU memory leak fix)
        if (this._envCubeRenderTarget) {
            this._envCubeRenderTarget.dispose();
            this._envCubeRenderTarget = null;
        }
        if (this._envScene) {
            // Dispose all geometries and materials in environment scene
            this._envScene.traverse(obj => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) this.disposeMaterial(obj.material);
            });
            this._envScene.clear();
            this._envScene = null;
        }
        if (this._envCubeCamera) {
            this._envCubeCamera = null;
        }

        // Dispose renderer
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer = null;
        }

        // Clear scene
        this.scene.clear();

        // Dispose animation mixer
        if (this.mixer) {
            this.mixer.stopAllAction();
            this.mixer = null;
        }

        // Clear clock
        this.clock = null;

        // Clear camera
        this.camera = null;

        // Clear temp THREE objects
        this._tempColor = null;
        this._tempColor2 = null;
        this._white = null;
        this._tempQuat = null;
        this._tempEuler = null;
        this._quatX = null;
        this._quatY = null;
        this._quatZ = null;
        this._rollQuat = null;
        this._meshQuat = null;
        this._xAxis = null;
        this._yAxis = null;
        this._zAxis = null;
        this._cameraToMesh = null;
        this._cameraDir = null;
    }
}
