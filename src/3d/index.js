/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE 3D
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Emotive Engine 3D - Experimental WebGL Rendering
 * @author Emotive Engine Team
 * @version 3.1.0-alpha
 * @module EmotiveEngine3D
 *
 * EXPERIMENTAL: 3D rendering variant with WebGL core + Canvas2D particles
 *
 * Features:
 * - 3D core geometries (crystal, diamond, sphere, etc.)
 * - Procedural animations (bounce, pulse, rotate)
 * - Same API as 2D version: express(), setEmotion(), morphTo()
 * - WebGL rendering with shader-based glow effects
 * - Canvas2D particle overlay (existing particle system)
 *
 * Usage:
 *   import EmotiveMascot3D from '@joshtol/emotive-engine/3d';
 *
 *   const mascot = new EmotiveMascot3D({
 *       canvasId: 'mascot-canvas',
 *       coreGeometry: 'crystal'  // or 'diamond', 'sphere', etc.
 *   });
 *
 *   await mascot.init(canvas);
 *   mascot.start();
 *
 *   // Same API as 2D version
 *   mascot.setEmotion('joy');
 *   mascot.express('bounce');
 */

import { Core3DManager } from './Core3DManager.js';
import ParticleSystem from '../core/ParticleSystem.js'; // Reuse 2D particles!
import { EventManager } from '../core/events/EventManager.js';
import ErrorBoundary from '../core/events/ErrorBoundary.js';
import { getEmotion } from '../core/emotions/index.js';
import { getGesture } from '../core/gestures/index.js';
import { OBJLoader } from './loaders/index.js';

/**
 * EmotiveMascot3D - 3D rendering variant
 *
 * Hybrid architecture:
 * - Layer 1 (back): WebGL canvas with 3D core
 * - Layer 2 (front): Canvas2D with particles
 */
export class EmotiveMascot3D {
    constructor(config = {}) {
        this.config = {
            canvasId: config.canvasId || 'emotive-canvas',
            coreGeometry: config.coreGeometry || 'sphere',
            targetFPS: config.targetFPS || 60,
            enableParticles: config.enableParticles !== false,
            defaultEmotion: config.defaultEmotion || 'neutral',
            ...config
        };

        // Create dual canvas system
        this.container = null;
        this.webglCanvas = null;
        this.canvas2D = null;

        // Renderers
        this.core3D = null;
        this.particleSystem = null;

        // State
        this.isRunning = false;
        this.animationFrameId = null;
        this.lastFrameTime = 0;

        // Event system (reuse from 2D engine)
        this.eventManager = new EventManager();

        // Add emit/on/off methods to EventManager (DOM event manager doesn't have these)
        if (!this.eventManager.emit) {
            this.eventManager._listeners = {};
            this.eventManager.emit = (event, data) => {
                const listeners = this.eventManager._listeners[event];
                if (listeners) {
                    listeners.forEach(listener => listener(data));
                }
            };
            this.eventManager.on = (event, listener) => {
                if (!this.eventManager._listeners[event]) {
                    this.eventManager._listeners[event] = [];
                }
                this.eventManager._listeners[event].push(listener);
            };
            this.eventManager.off = (event, listener) => {
                const listeners = this.eventManager._listeners[event];
                if (listeners) {
                    const index = listeners.indexOf(listener);
                    if (index > -1) {
                        listeners.splice(index, 1);
                    }
                }
            };
        }

        // Error boundary (no parameters needed)
        this.errorBoundary = new ErrorBoundary();

        // State tracking
        this.emotion = 'neutral';
        this.undertone = null;
    }

    /**
     * Initialize the 3D engine
     * @param {HTMLElement} container - Container element or canvas
     * @returns {EmotiveMascot3D}
     */
    init(container) {
        try {
            // Setup dual canvas layers
            this.setupCanvasLayers(container);

            // Initialize 3D core renderer
            this.core3D = new Core3DManager(this.webglCanvas, {
                geometry: this.config.coreGeometry,
                emotion: this.config.defaultEmotion,
                coreScale: this.config.coreScale,  // Pass through coreScale option
                eventTarget: this.container  // Use container for events (webglCanvas has pointerEvents: none)
            });

            // Initialize particle system (2D overlay)
            if (this.config.enableParticles) {
                const maxParticles = this.config.maxParticles || 300;
                this.particleSystem = new ParticleSystem(maxParticles, this.errorBoundary);

                // Set canvas dimensions for particle containment
                this.particleSystem.canvasWidth = this.canvas2D.width;
                this.particleSystem.canvasHeight = this.canvas2D.height;
            }

            // Initialization complete
            // console.log('Emotive Engine 3D initialized:', {
            //     geometry: this.config.coreGeometry,
            //     particles: this.config.enableParticles
            // });

            return this;
        } catch (error) {
            console.error('Failed to initialize 3D engine:', error);
            throw error;
        }
    }

    /**
     * Setup dual canvas architecture
     * WebGL canvas (back) + Canvas2D (front) stacked
     */
    setupCanvasLayers(containerOrCanvas) {
        // Create or use container
        if (containerOrCanvas.tagName === 'CANVAS') {
            // User provided single canvas, create container
            const parent = containerOrCanvas.parentElement;
            this.container = document.createElement('div');
            this.container.style.position = 'relative';
            // Use parent's size (styled by CSS) instead of canvas default size
            this.container.style.width = '100%';
            this.container.style.height = '100%';
            parent.replaceChild(this.container, containerOrCanvas);
        } else {
            this.container = containerOrCanvas;
            this.container.style.position = 'relative';
        }

        // Create Canvas2D for particles (Layer 1 - back)
        this.canvas2D = document.createElement('canvas');
        this.canvas2D.id = `${this.config.canvasId}-particles`;
        this.canvas2D.width = this.container.offsetWidth || 400;
        this.canvas2D.height = this.container.offsetHeight || 400;
        this.canvas2D.style.position = 'absolute';
        this.canvas2D.style.top = '0';
        this.canvas2D.style.left = '0';
        this.canvas2D.style.zIndex = '1';
        this.container.appendChild(this.canvas2D);

        // Create WebGL canvas for 3D core (Layer 2 - front)
        this.webglCanvas = document.createElement('canvas');
        this.webglCanvas.id = `${this.config.canvasId}-3d`;
        this.webglCanvas.width = this.canvas2D.width;
        this.webglCanvas.height = this.canvas2D.height;
        this.webglCanvas.style.position = 'absolute';
        this.webglCanvas.style.top = '0';
        this.webglCanvas.style.left = '0';
        this.webglCanvas.style.zIndex = '2';
        this.webglCanvas.style.pointerEvents = 'none'; // Click through to particles
        this.container.appendChild(this.webglCanvas);
    }

    /**
     * Start animation loop
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.animate(this.lastFrameTime);
    }

    /**
     * Stop animation loop
     */
    stop() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Build gesture transform object for particle visual effects
     * Matches 2D VisualEffectAnimator behavior
     */
    buildGestureTransform(gestureName, progress, config) {
        const time = Date.now() * 0.001;

        switch (gestureName) {
        case 'sparkle':
            return {
                particleGlow: config.intensity || 2.0,
                glow: Math.sin(progress * Math.PI * 4) * 0.3 + 0.7,
                fireflyTime: time,
                fireflyEffect: true
            };

        case 'flicker':
        {
            const intensity = config.intensity || 2.0;
            const shimmerSpeed = config.speed || 3;
            const glow = 1 + Math.sin(progress * Math.PI * 2 * shimmerSpeed) * intensity * 0.3;
            const mainPulse = Math.sin(progress * Math.PI * shimmerSpeed * 2) * 0.5 + 0.5;
            return {
                offsetX: Math.sin(progress * Math.PI * 4) * 5,
                glow,
                particleGlow: mainPulse * intensity,
                flickerTime: time,
                flickerEffect: true
            };
        }

        case 'shimmer':
        {
            const intensity = config.intensity || 0.3;
            const wave = Math.sin(time * 2 + progress * Math.PI * 2);
            return {
                offsetX: 0,
                offsetY: 0,
                glow: 1 + wave * intensity,
                scale: 1 + wave * 0.01,
                particleGlow: 1 + wave * 0.2,
                shimmerTime: time,
                shimmerWave: wave,
                shimmerEffect: true
            };
        }

        case 'glow':
            return {
                glowEffect: true,
                glowProgress: progress,
                particleGlow: config.glowAmount || 2.0
            };

        default:
            return null;
        }
    }

    /**
     * Main animation loop
     */
    animate(currentTime) {
        if (!this.isRunning) return;

        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;

        // Render 3D core
        if (this.core3D) {
            this.core3D.render(deltaTime);
        }

        // Render 2D particles
        if (this.particleSystem) {
            const centerX = this.canvas2D.width / 2;
            const centerY = this.canvas2D.height / 2;
            const ctx = this.canvas2D.getContext('2d');

            // Get current emotion and its visual parameters
            const currentEmotion = this.core3D ? this.core3D.emotion : 'neutral';
            const emotionData = getEmotion(currentEmotion);
            const glowColor = this.core3D ? this.rgbToHex(this.core3D.glowColor) : '#FFFFFF';

            // Extract emotion-specific particle parameters
            const particleBehavior = emotionData?.visual?.particleBehavior || 'ambient';
            const particleRate = emotionData?.visual?.particleRate || 15;
            const minParticles = emotionData?.visual?.minParticles || 5;
            const maxParticles = emotionData?.visual?.maxParticles || 30;
            const particleColors = emotionData?.visual?.particleColors || null;

            // Spawn particles - EXACT same as 2D site, no modifications
            this.particleSystem.spawn(
                particleBehavior,   // Use emotion's particle behavior
                currentEmotion,     // emotion
                particleRate,       // Use emotion's spawn rate
                centerX, centerY,   // position
                deltaTime,          // deltaTime
                null,               // count (rate-based)
                minParticles,       // Use emotion's min particles
                maxParticles,       // Use emotion's max particles
                1.0,                // scaleFactor (same as 2D)
                1.0,                // particleSizeMultiplier
                particleColors,     // Use emotion's color palette
                this.undertone      // undertone modifier
            );

            // Apply gesture to particles if active
            let gestureMotion = null;
            let gestureProgress = 0;
            let gestureTransform = null;
            if (this.currentGesture) {
                const elapsed = currentTime - this.currentGesture.startTime;
                gestureProgress = Math.min(elapsed / this.currentGesture.duration, 1);
                gestureMotion = {
                    ...this.currentGesture.config,
                    type: this.currentGesture.name  // Use gesture NAME (e.g., "bounce"), not TYPE
                };

                // Build gesture transform for visual effects
                gestureTransform = this.buildGestureTransform(this.currentGesture.name, gestureProgress, this.currentGesture.config);
            }

            // Update particles - EXACT same as 2D site
            this.particleSystem.update(deltaTime, centerX, centerY, gestureMotion, gestureProgress, this.undertone);

            // Clear canvas before rendering
            ctx.clearRect(0, 0, this.canvas2D.width, this.canvas2D.height);

            // Render particles with emotion color and gesture effects
            this.particleSystem.render(ctx, glowColor, gestureTransform);
        }

        // Continue loop
        this.animationFrameId = requestAnimationFrame(time => this.animate(time));
    }

    /**
     * Set emotional state (same API as 2D version)
     * @param {string} emotion - Emotion name
     * @param {Object|string|null} options - Options object or undertone string
     */
    setEmotion(emotion, options) {
        this.emotion = emotion;

        // Handle options parameter (can be undertone string or options object)
        if (typeof options === 'string') {
            this.undertone = options;
        } else if (options && typeof options === 'object') {
            this.undertone = options.undertone || null;
        }

        if (this.core3D) {
            this.core3D.setEmotion(emotion);
        }

        // Clear all particles for instant transition
        if (this.particleSystem) {
            this.particleSystem.particles = [];
        }

        this.eventManager.emit('emotion:change', { emotion, undertone: this.undertone });
    }

    /**
     * Update the undertone without resetting emotion
     * @param {string|null} undertone - The undertone to apply
     */
    updateUndertone(undertone) {
        this.undertone = undertone;
        this.eventManager.emit('undertone:change', { undertone });
    }

    /**
     * Express a gesture (same API as 2D version)
     * @param {string} gestureName - Gesture name
     */
    express(gestureName) {
        // Apply gesture to 3D core
        if (this.core3D) {
            this.core3D.playGesture(gestureName);
        }

        // Apply gesture to particles (same as 2D)
        const gesture = getGesture(gestureName);
        if (gesture) {
            const config = gesture.config || {};
            const duration = config.musicalDuration?.musical
                ? (config.musicalDuration.beats || 2) * 500
                : (config.duration || 800);

            // console.log(`[3D] Gesture ${gestureName} duration: ${duration}ms`);

            // Track current gesture for particle system
            this.currentGesture = {
                name: gestureName,
                gesture,
                config,
                startTime: performance.now(),
                duration
            };

            // Clear gesture when complete
            setTimeout(() => {
                if (this.currentGesture && this.currentGesture.name === gestureName) {
                    // console.log(`[3D] Gesture ${gestureName} completed`);
                    this.currentGesture = null;
                }
            }, duration);
        }

        this.eventManager.emit('gesture:trigger', { gesture: gestureName });
    }

    /**
     * Execute a gesture chain combo (same API as 2D version)
     * @param {string|Array} chainName - Chain combo name or array of gestures
     */
    chain(chainName) {
        // Chain definitions from site demo
        const chainDefinitions = {
            'rise': 'breathe > sway+lean+tilt',
            'flow': 'sway > lean+tilt > spin > bounce',
            'burst': 'jump > nod > shake > flash',
            'drift': 'sway+breathe+float+drift',
            'chaos': 'shake+shake > spin+flash > bounce+pulse > twist+sparkle',
            'morph': 'expand > contract > morph+glow > expand+flash',
            'rhythm': 'pulse > pulse+sparkle > pulse+flicker',
            'spiral': 'spin > orbital > twist > orbital+sparkle',
            'routine': 'nod > bounce > spin+sparkle > sway+pulse > nod+flash',
            'radiance': 'sparkle > pulse+flicker > shimmer',
            'twinkle': 'sparkle > flash > pulse+sparkle > shimmer+flicker',
            'stream': 'wave > nod+pulse > sparkle > flash'
        };

        // Get chain definition
        const chainString = typeof chainName === 'string' ? chainDefinitions[chainName] || chainName : chainName.join('>');

        // Parse chain: split by '>' for sequential steps
        const steps = chainString.split('>').map(step =>
            step.trim().split('+').map(g => g.trim()).filter(g => g.length > 0)
        );

        // Execute chain sequence
        this.executeChainSequence(steps);
    }

    /**
     * Execute a sequence of gesture steps with proper timing
     * @param {Array<Array<string>>} steps - Array of steps, each containing simultaneous gestures
     * @private
     */
    executeChainSequence(steps) {
        if (!steps || steps.length === 0) return;

        let currentStep = 0;
        const stepDuration = 800; // Base duration per step (ms)

        const executeStep = () => {
            if (currentStep >= steps.length) return;

            const step = steps[currentStep];

            // Execute all gestures in this step simultaneously
            step.forEach(gestureName => {
                this.express(gestureName);
            });

            currentStep++;
            if (currentStep < steps.length) {
                setTimeout(executeStep, stepDuration);
            }
        };

        executeStep();
    }

    /**
     * Morph to shape (same API as 2D version)
     * @param {string} shapeName - Shape name
     */
    morphTo(shapeName) {
        if (this.core3D) {
            this.core3D.morphToShape(shapeName);
        }
        this.eventManager.emit('shape:morph', { shape: shapeName });
    }

    /**
     * Set render mode for visualization
     * @param {number|string} mode - 0/'standard', 1/'normals', 2/'toon', 3/'edge'
     */
    setRenderMode(mode) {
        const modeMap = {
            'standard': 0,
            'normals': 1,
            'toon': 2,
            'edge': 3,
            'holographic': 4,
            'technical': 5,
            'neon': 6
        };

        const modeValue = typeof mode === 'string' ? modeMap[mode] : mode;

        if (this.core3D) {
            this.core3D.renderMode = modeValue;
        } else {
            console.warn('Renderer not available yet');
        }
    }

    /**
     * Toggle wireframe overlay
     * @param {boolean} enabled - Enable/disable wireframe
     */
    setWireframe(enabled) {
        if (this.core3D) {
            this.core3D.wireframeEnabled = enabled;
        } else {
            console.warn('Renderer not available yet');
        }
    }

    /**
     * Set light direction for 3D rendering
     * @param {number} x - X component of light direction
     * @param {number} y - Y component of light direction
     * @param {number} z - Z component of light direction
     */
    setLightDirection(x, y, z) {
        if (this.core3D) {
            this.core3D.lightDirection = [x, y, z];
        } else {
            console.warn('Renderer not available yet');
        }
    }

    /**
     * Get current render mode
     * @returns {number} Current render mode (0=standard, 1=normals, 2=toon, 3=edge)
     */
    getCurrentRenderMode() {
        return this.core3D ? this.core3D.renderMode : 0;
    }

    /**
     * Check if wireframe is enabled
     * @returns {boolean} Wireframe enabled state
     */
    isWireframeEnabled() {
        return this.core3D ? this.core3D.wireframeEnabled : false;
    }

    /**
     * Get current render state
     * @returns {Object} Render state including mode, wireframe, and geometry
     */
    getRenderState() {
        return {
            mode: this.getCurrentRenderMode(),
            wireframe: this.isWireframeEnabled(),
            geometry: this.config.coreGeometry,
            lightDirection: this.core3D ? this.core3D.lightDirection : [0.5, 1.0, 1.0],
            layers: this.core3D ? this.core3D.renderLayers : null
        };
    }

    /**
     * Set render blend amounts (NEW blended rendering system)
     * All modes blend together - you can mix multiple at once!
     * @param {Object} amounts - Blend amounts (0.0-1.0 for each)
     *   pbr: PBR shading weight
     *   toon: Toon/cel shading weight
     *   flat: Flat color weight
     *   normals: Rainbow normals weight
     *   edges: Edge detection weight
     *   rim: Rim lighting weight
     *   wireframe: Wireframe overlay weight
     */
    setRenderBlend(amounts) {
        if (!this.core3D) {
            console.warn('Renderer not available yet');
            return;
        }

        // Update blend amounts (clamp to 0-1)
        if (amounts.pbr !== undefined) this.core3D.renderBlend.pbr = Math.max(0, Math.min(1, amounts.pbr));
        if (amounts.toon !== undefined) this.core3D.renderBlend.toon = Math.max(0, Math.min(1, amounts.toon));
        if (amounts.flat !== undefined) this.core3D.renderBlend.flat = Math.max(0, Math.min(1, amounts.flat));
        if (amounts.normals !== undefined) this.core3D.renderBlend.normals = Math.max(0, Math.min(1, amounts.normals));
        if (amounts.edges !== undefined) this.core3D.renderBlend.edges = Math.max(0, Math.min(1, amounts.edges));
        if (amounts.rim !== undefined) this.core3D.renderBlend.rim = Math.max(0, Math.min(1, amounts.rim));
        if (amounts.wireframe !== undefined) this.core3D.renderBlend.wireframe = Math.max(0, Math.min(1, amounts.wireframe));
    }

    /**
     * Load external 3D model file
     * @param {string} urlOrPath - URL or path to model file (.obj, .gltf, etc.)
     * @param {string} format - Optional file format ('obj', 'gltf'), auto-detected if not provided
     * @returns {Promise<void>}
     */
    async loadGeometry(urlOrPath, format = null) {
        if (!this.core3D) {
            throw new Error('Core3D not initialized. Call init() first.');
        }

        // Auto-detect format from extension
        if (!format) {
            const ext = urlOrPath.split('.').pop().toLowerCase();
            format = ext;
        }

        let geometry;

        switch (format) {
            case 'obj':
                geometry = await OBJLoader.load(urlOrPath);
                break;
            default:
                throw new Error(`Unsupported file format: ${format}`);
        }

        // Replace current geometry
        this.core3D.geometry = geometry;
        this.core3D.geometryType = 'loaded';
    }

    /**
     * Set material properties (roughness and metallic)
     * @param {Object} properties - Material properties
     *   roughness: Surface roughness (0.0 = mirror, 1.0 = matte)
     *   metallic: Material metalness (0.0 = dielectric, 1.0 = metal)
     */
    setMaterial(properties) {
        if (!this.core3D) {
            console.warn('Renderer not available yet');
            return;
        }

        // Update material properties (clamp to appropriate ranges)
        if (properties.roughness !== undefined) {
            this.core3D.roughness = Math.max(0, Math.min(1, properties.roughness));
        }
        if (properties.metallic !== undefined) {
            this.core3D.metallic = Math.max(0, Math.min(1, properties.metallic));
        }
        if (properties.ao !== undefined) {
            this.core3D.ao = Math.max(0, Math.min(1, properties.ao));
        }
        if (properties.sssStrength !== undefined) {
            this.core3D.sssStrength = Math.max(0, Math.min(1, properties.sssStrength));
        }
        if (properties.anisotropy !== undefined) {
            this.core3D.anisotropy = Math.max(-1, Math.min(1, properties.anisotropy));
        }
        if (properties.iridescence !== undefined) {
            this.core3D.iridescence = Math.max(0, Math.min(1, properties.iridescence));
        }
    }

    /**
     * Enable particles
     */
    enableParticles() {
        if (!this.particleSystem && this.canvas2D) {
            const maxParticles = this.config.maxParticles || 300;
            this.particleSystem = new ParticleSystem(maxParticles, this.errorBoundary);
            this.particleSystem.canvasWidth = this.canvas2D.width;
            this.particleSystem.canvasHeight = this.canvas2D.height;
        }
    }

    /**
     * Disable particles
     */
    disableParticles() {
        if (this.particleSystem) {
            this.particleSystem.destroy();
            this.particleSystem = null;
        }
    }

    /**
     * Check if particles are enabled
     */
    get particlesEnabled() {
        return this.particleSystem !== null;
    }

    /**
     * Helper: Convert RGB array to hex color
     */
    rgbToHex(rgb) {
        const r = Math.round(rgb[0] * 255);
        const g = Math.round(rgb[1] * 255);
        const b = Math.round(rgb[2] * 255);
        return `#${[r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? `0${hex}` : hex;
        }).join('')}`;
    }

    /**
     * Cleanup
     */
    destroy() {
        this.stop();
        if (this.core3D) {
            this.core3D.destroy();
        }
        if (this.particleSystem) {
            this.particleSystem.destroy();
        }
    }
}

// Default export
export default EmotiveMascot3D;

// Named exports for tree-shaking
export { Core3DManager } from './Core3DManager.js';
export { SceneObject } from './SceneObject.js';
export { MultiObjectPass } from './passes/MultiObjectPass.js';
export { SkyboxPass } from './passes/SkyboxPass.js';
export { ToneMappingPass } from './passes/ToneMappingPass.js';
export { Camera } from './Camera.js';
export { FramebufferManager } from './FramebufferManager.js';
export * from './geometries/index.js';
export * from './loaders/index.js';
