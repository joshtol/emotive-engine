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
        this.gestureTimeouts = []; // Track setTimeout IDs for cleanup

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
                enableParticles: this.config.enableParticles,
                enablePostProcessing: this.config.enablePostProcessing,
                enableShadows: this.config.enableShadows,
                enableControls: this.config.enableControls,
                autoRotate: this.config.autoRotate,
                enableBlinking: this.config.enableBlinking,
                enableBreathing: this.config.enableBreathing,
                cameraDistance: this.config.cameraDistance,
                materialVariant: this.config.materialVariant
            });

            // Cache 2D canvas context to prevent repeated getContext() calls
            this.ctx2D = this.canvas2D.getContext('2d');

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
        // ENABLE pointer events for camera controls (mouse/touch interaction)
        // Note: This means the WebGL canvas captures clicks, not the particle layer
        this.webglCanvas.style.pointerEvents = 'auto';
        this.container.appendChild(this.webglCanvas);
    }

    /**
     * Start animation loop
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastFrameTime = null; // Will be set on first animate() call
        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
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
     * Main animation loop
     */
    animate(currentTime) {
        if (!this.isRunning) return;

        // Initialize lastFrameTime on first frame
        if (this.lastFrameTime === null) {
            this.lastFrameTime = currentTime;
            this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
            return;
        }

        // Calculate deltaTime and cap it to prevent huge jumps when tab is inactive
        // Max 100ms prevents rotation explosions when tabbing back in
        const rawDeltaTime = currentTime - this.lastFrameTime;
        const deltaTime = Math.min(rawDeltaTime, 100); // deltaTime in milliseconds

        this.lastFrameTime = currentTime;

        // Render 3D core
        if (this.core3D) {
            this.core3D.render(deltaTime);
        }

        // Render 2D particles (or clear canvas if disabled)
        if (this.canvas2D && this.ctx2D) {
            // Always clear canvas first
            this.ctx2D.clearRect(0, 0, this.canvas2D.width, this.canvas2D.height);

            // Fill with transparent to ensure clearing
            this.ctx2D.fillStyle = 'rgba(0,0,0,0)';
            this.ctx2D.fillRect(0, 0, this.canvas2D.width, this.canvas2D.height);

            if (this.particleSystem) {
                const centerX = this.canvas2D.width / 2;
                const centerY = this.canvas2D.height / 2;

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
                    deltaTime,          // deltaTime in milliseconds
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
                if (this.currentGesture) {
                    const elapsed = currentTime - this.currentGesture.startTime;
                    gestureProgress = Math.min(elapsed / this.currentGesture.duration, 1);
                    gestureMotion = {
                        ...this.currentGesture.config,
                        type: this.currentGesture.name  // Use gesture NAME (e.g., "bounce"), not TYPE
                    };
                }

                // Update particles - EXACT same as 2D site
                this.particleSystem.update(deltaTime, centerX, centerY, gestureMotion, gestureProgress, this.undertone);

                // Render particles with emotion color
                this.particleSystem.render(this.ctx2D, glowColor, null);
            }
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
        // If no options provided, keep existing undertone
        if (options !== undefined) {
            if (typeof options === 'string') {
                this.undertone = options;
            } else if (options && typeof options === 'object') {
                this.undertone = options.undertone || null;
            } else if (options === null) {
                // Explicitly clearing undertone
                this.undertone = null;
            }
        }
        // else: options undefined, keep existing this.undertone

        if (this.core3D) {
            this.core3D.setEmotion(emotion, this.undertone);
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

        // Re-apply emotion with new undertone
        if (this.core3D && this.emotion) {
            this.core3D.setEmotion(this.emotion, undertone);
        }

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
            const timeoutId = setTimeout(() => {
                if (this.currentGesture && this.currentGesture.name === gestureName) {
                    // console.log(`[3D] Gesture ${gestureName} completed`);
                    this.currentGesture = null;
                }
            }, duration);
            this.gestureTimeouts.push(timeoutId);
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
                const timeoutId = setTimeout(executeStep, stepDuration);
                this.gestureTimeouts.push(timeoutId);
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
     * Enable auto-rotation
     */
    enableAutoRotate() {
        if (this.core3D) {
            // Don't enable rotation for geometries with special rotation rules (moon is tidally locked)
            if (this.core3D.geometryType !== 'moon') {
                // Enable OrbitControls camera rotation
                if (this.core3D.renderer?.controls) {
                    this.core3D.renderer.controls.autoRotate = true;
                }

                // Enable geometry's internal rotation behavior
                this.core3D.rotationDisabled = false;
                // Re-trigger emotion to restore rotation behavior
                this.setEmotion(this.core3D.emotion, this.undertone);
            }
        }
    }

    /**
     * Disable auto-rotation (stops both camera and emotion-based rotation)
     */
    disableAutoRotate() {
        if (this.core3D?.renderer?.controls) {
            this.core3D.renderer.controls.autoRotate = false;
        }
        if (this.core3D) {
            this.core3D.rotationDisabled = true;
            this.core3D.rotationBehavior = null;
        }
    }

    /**
     * Set camera to a preset position
     * @param {string} preset - Camera preset: 'front', 'side', 'top', 'bottom', 'angle', 'back'
     * @param {number} duration - Animation duration in ms (0 for instant)
     */
    setCameraPreset(preset, duration = 1000) {
        if (this.core3D?.renderer?.setCameraPreset) {
            this.core3D.renderer.setCameraPreset(preset, duration);
        }
    }

    /**
     * Check if auto-rotate is enabled
     */
    get autoRotateEnabled() {
        // Check rotationDisabled flag (inverse logic) for accurate state
        // rotationDisabled is the source of truth set by enable/disableAutoRotate
        return this.core3D?.rotationDisabled === false;
    }

    /**
     * Enable particles
     */
    enableParticles() {
        // Enable 3D WebGL particle system rendering
        if (this.core3D?.particleOrchestrator?.renderer) {
            // Enable visibility and force emotion recalculation to spawn particles immediately
            this.core3D.particleVisibility = true;
            this.core3D.particleOrchestrator.renderer.setVisible(true);
            this.core3D.particleOrchestrator.setEmotion(this.core3D.emotion, this.core3D.undertone);

            const {points} = this.core3D.particleOrchestrator.renderer;
            const geom = this.core3D.particleOrchestrator.renderer.geometry;
            console.log('✨ 3D Particles enabled', {
                pointsVisible: points.visible,
                drawRangeStart: geom.drawRange.start,
                drawRangeCount: geom.drawRange.count,
                particleCount: this.core3D.particleOrchestrator.getParticleCount()
            });
        }

        // Only enable 2D canvas particle system if we don't have 3D particles
        // (3D mode uses WebGL particles, not 2D canvas particles)
        if (!this.core3D?.particleOrchestrator) {
            // Enable 2D canvas particle system (if needed)
            if (!this.particleSystem && this.canvas2D) {
                const maxParticles = this.config.maxParticles || 300;
                this.particleSystem = new ParticleSystem(maxParticles, this.errorBoundary);
                this.particleSystem.canvasWidth = this.canvas2D.width;
                this.particleSystem.canvasHeight = this.canvas2D.height;
                console.log('✨ 2D Particles enabled - system created');
            } else if (this.particleSystem) {
                console.log('⚠️ 2D Particles already enabled');
            }
        }
    }

    /**
     * Disable particles
     */
    disableParticles() {
        // Disable 3D WebGL particle system rendering
        if (this.core3D?.particleOrchestrator?.renderer) {
            this.core3D.particleVisibility = false;
            this.core3D.particleOrchestrator.renderer.setVisible(false);
            // Clear particles immediately and let update loop handle draw range naturally
            this.core3D.particleOrchestrator.clear();
            console.log('💨 3D Particles disabled');
        }

        // Only disable 2D canvas particle system if we don't have 3D particles
        // (3D mode uses WebGL particles, not 2D canvas particles)
        if (!this.core3D?.particleOrchestrator) {
            // Disable 2D canvas particle system
            if (this.particleSystem) {
                this.particleSystem.destroy();
                this.particleSystem = null;
                console.log('💨 2D Particles disabled - system destroyed');
                // Canvas will be automatically cleared on next animation frame
            } else {
                console.log('⚠️ 2D Particles already disabled');
            }
        }
    }

    /**
     * Check if particles are enabled
     */
    get particlesEnabled() {
        return this.particleSystem !== null;
    }

    /**
     * Enable blinking
     */
    enableBlinking() {
        if (this.core3D && this.core3D.blinkAnimator) {
            this.core3D.blinkAnimator.resume();
        }
    }

    /**
     * Disable blinking
     */
    disableBlinking() {
        if (this.core3D && this.core3D.blinkAnimator) {
            this.core3D.blinkAnimator.pause();
        }
    }

    /**
     * Check if blinking is enabled
     */
    get blinkingEnabled() {
        return this.core3D && this.core3D.blinkAnimator ? this.core3D.blinkAnimator.enabled : false;
    }

    /**
     * Enable breathing
     */
    enableBreathing() {
        if (this.core3D) {
            this.core3D.breathingEnabled = true;
        }
    }

    /**
     * Disable breathing
     */
    disableBreathing() {
        if (this.core3D) {
            this.core3D.breathingEnabled = false;
        }
    }

    /**
     * Check if breathing is enabled
     */
    get breathingEnabled() {
        return this.core3D ? this.core3D.breathingEnabled !== false : true;
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

        // Clear all pending gesture timeouts
        this.gestureTimeouts.forEach(id => clearTimeout(id));
        this.gestureTimeouts = [];

        // Clear all event listeners to prevent memory leaks
        if (this.eventManager && this.eventManager._listeners) {
            Object.keys(this.eventManager._listeners).forEach(key => {
                this.eventManager._listeners[key] = [];
            });
            this.eventManager._listeners = null;
        }

        if (this.core3D) {
            this.core3D.destroy();
        }
        if (this.particleSystem) {
            this.particleSystem.destroy();
        }

        // Null out DOM element references to prevent memory leaks
        this.container = null;
        this.webglCanvas = null;
        this.canvas2D = null;
        this.ctx2D = null;

        // Null out config object
        this.config = null;

        // Null out ErrorBoundary
        this.errorBoundary = null;

        // Null out current gesture reference
        this.currentGesture = null;
    }
}

// Default export
export default EmotiveMascot3D;

// Named exports for tree-shaking
export { Core3DManager } from './Core3DManager.js';
export * from './geometries/index.js';

// Export moon phase utilities
export {
    MOON_PHASES,
    getMoonPhaseNames,
    getPhaseFromProgress,
    setMoonPhase,
    animateMoonPhase
} from './geometries/Moon.js';
