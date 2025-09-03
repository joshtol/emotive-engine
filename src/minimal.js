/**
 * Minimal build entry point - Core visual functionality only
 * Excludes audio features for smaller bundle size
 */

import CanvasManager from './core/CanvasManager.js';
import ErrorBoundary from './core/ErrorBoundary.js';
import EmotiveStateMachine from './core/EmotiveStateMachine.js';
import ParticleSystem from './core/ParticleSystem.js';
import EmotiveRenderer from './core/EmotiveRenderer.js';
import AnimationController from './core/AnimationController.js';
import EventManager from './core/EventManager.js';

/**
 * Minimal EmotiveMascot - Visual-only version without audio features
 * Smaller bundle size for applications that don't need audio
 */
class EmotiveMascotMinimal {
    constructor(config = {}) {
        // Initialize error boundary first
        this.errorBoundary = new ErrorBoundary();
        
        // Wrap initialization in error boundary
        this.errorBoundary.wrap(() => {
            this.initialize(config);
        }, 'initialization')();
    }

    /**
     * Initialize the minimal mascot system (no audio)
     * @param {Object} config - Configuration options
     */
    initialize(config) {
        // Default configuration (audio disabled)
        const defaults = {
            canvasId: 'emotive-mascot',
            targetFPS: 60,
            enableAudio: false, // Always disabled in minimal build
            maxParticles: 30,   // Reduced for performance
            defaultEmotion: 'neutral'
        };
        
        this.config = { ...defaults, ...config, enableAudio: false };
        
        // Get canvas element
        this.canvas = typeof this.config.canvasId === 'string' 
            ? document.getElementById(this.config.canvasId)
            : this.config.canvasId;
            
        if (!this.canvas) {
            throw new Error(`Canvas with ID '${this.config.canvasId}' not found`);
        }

        // Initialize core systems (no audio)
        this.canvasManager = new CanvasManager(this.canvas);
        this.stateMachine = new EmotiveStateMachine(this.errorBoundary);
        this.particleSystem = new ParticleSystem(this.config.maxParticles, this.errorBoundary);
        this.renderer = new EmotiveRenderer(this.canvasManager, {});
        
        // Initialize animation controller
        this.animationController = new AnimationController(this.errorBoundary, {
            targetFPS: this.config.targetFPS
        });
        
        // Configure animation controller with subsystems (no sound system)
        this.animationController.setSubsystems({
            stateMachine: this.stateMachine,
            particleSystem: this.particleSystem,
            renderer: this.renderer,
            canvasManager: this.canvasManager
        });
        
        // Set up event forwarding from animation controller
        this.animationController.setEventCallback((event, data) => {
            this.emit(event, data);
        });
        
        // Set parent mascot reference
        this.animationController.setParentMascot(this);
        
        // Backward compatibility properties
        this.isRunning = false;
        
        // Initialize EventManager for centralized event management
        this.eventManager = new EventManager({
            maxListeners: this.config.maxEventListeners || 50, // Reduced for minimal build
            enableDebugging: false, // Disabled for performance
            enableMonitoring: this.config.enableEventMonitoring || false,
            memoryWarningThreshold: this.config.eventMemoryWarningThreshold || 25
        });
        
        // Set initial emotional state
        this.stateMachine.setEmotion(this.config.defaultEmotion);
        
        console.log('EmotiveMascot Minimal initialized successfully (audio disabled)');
    }

    /**
     * Sets the emotional state with optional undertone
     * @param {string} emotion - The emotion to set
     * @param {Object|string|null} options - Options object or undertone string
     * @returns {EmotiveMascotMinimal} This instance for chaining
     */
    setEmotion(emotion, options = null) {
        return this.errorBoundary.wrap(() => {
            let undertone = null;
            let duration = 500;
            
            if (typeof options === 'string') {
                undertone = options;
            } else if (options && typeof options === 'object') {
                undertone = options.undertone || null;
                duration = options.duration || 500;
            }
            
            const success = this.stateMachine.setEmotion(emotion, undertone, duration);
            
            if (success) {
                this.emit('emotionChanged', { emotion, undertone, duration });
                console.log(`Emotion set to: ${emotion}${undertone ? ` (${undertone})` : ''}`);
            }
            
            return this;
        }, 'emotion-setting', this)();
    }

    /**
     * Executes a single gesture
     * @param {string} gesture - The gesture to execute
     * @returns {EmotiveMascotMinimal} This instance for chaining
     */
    express(gesture) {
        return this.errorBoundary.wrap(() => {
            if (!gesture) {
                console.warn('No gesture provided to express()');
                return this;
            }
            
            // Direct call to renderer methods
            const rendererMethods = {
                'bounce': 'startBounce',
                'pulse': 'startPulse',
                'shake': 'startShake',
                'spin': 'startSpin',
                'drift': 'startDrift',
                'morph': 'startMorph',
                'glow': 'startGlow',
                'flicker': 'startFlicker',
                'vibrate': 'startVibrate',
                'nod': 'startNod',
                'tilt': 'startTilt',
                'wave': 'startWave'
            };
            
            const methodName = rendererMethods[gesture];
            if (methodName && this.renderer && this.renderer[methodName]) {
                this.renderer[methodName]();
                this.emit('gestureStarted', { gesture });
                console.log(`Expressing gesture: ${gesture}`);
            } else {
                console.warn(`Gesture not available: ${gesture}`);
            }
            
            return this;
        }, 'gesture-expression', this)();
    }

    /**
     * Chains multiple gestures for sequential execution
     * @param {...string} gestures - Gestures to chain
     * @returns {EmotiveMascotMinimal} This instance for chaining
     */
    chain(...gestures) {
        console.warn('Gesture chaining not available in this version');
        return this;
    }

    /**
     * Starts the animation loop
     * @returns {EmotiveMascotMinimal} This instance for chaining
     */
    start() {
        return this.errorBoundary.wrap(() => {
            if (this.animationController.isAnimating()) {
                console.warn('EmotiveMascot is already running');
                return this;
            }
            
            const success = this.animationController.start();
            
            if (success) {
                this.isRunning = true;
                this.emit('started');
                console.log(`EmotiveMascot Minimal started (target: ${this.animationController.targetFPS} FPS)`);
            }
            
            return this;
        }, 'start', this)();
    }

    /**
     * Stops the animation loop
     * @returns {EmotiveMascotMinimal} This instance for chaining
     */
    stop() {
        return this.errorBoundary.wrap(() => {
            if (!this.animationController.isAnimating()) {
                console.warn('EmotiveMascot is not running');
                return this;
            }
            
            const success = this.animationController.stop();
            
            if (success) {
                this.isRunning = false;
                this.emit('stopped');
                console.log('EmotiveMascot Minimal stopped');
            }
            
            return this;
        }, 'stop', this)();
    }

    // Event system methods
    on(event, callback) {
        return this.errorBoundary.wrap(() => {
            const success = this.eventManager.on(event, callback);
            if (!success) {
                console.warn(`Failed to add event listener for '${event}'`);
            }
            return this;
        }, 'event-listener-add', this)();
    }

    off(event, callback) {
        return this.errorBoundary.wrap(() => {
            this.eventManager.off(event, callback);
            return this;
        }, 'event-listener-remove', this)();
    }

    once(event, callback) {
        return this.errorBoundary.wrap(() => {
            const success = this.eventManager.once(event, callback);
            if (!success) {
                console.warn(`Failed to add once event listener for '${event}'`);
            }
            return this;
        }, 'event-listener-once', this)();
    }

    emit(event, data = null) {
        this.eventManager.emit(event, data);
    }

    // State query methods
    getCurrentState() {
        return this.stateMachine.getCurrentState();
    }

    getEmotionalColor() {
        const properties = this.stateMachine.getCurrentEmotionalProperties();
        return properties.primaryColor;
    }

    getAvailableEmotions() {
        return this.stateMachine.getAvailableEmotions();
    }

    getAvailableUndertones() {
        return this.stateMachine.getAvailableUndertones();
    }

    getAvailableGestures() {
        return ['bounce', 'pulse', 'shake', 'spin', 'drift', 'morph', 'glow', 'flicker', 'vibrate', 'nod', 'tilt', 'wave'];
    }

    getPerformanceMetrics() {
        return this.animationController.getPerformanceMetrics();
    }

    // Update method (called by AnimationController)
    update(deltaTime) {
        // No audio processing in minimal build
    }

    // Render method (called by AnimationController)
    render() {
        this.errorBoundary.wrap(() => {
            const renderState = {
                properties: this.stateMachine.getCurrentEmotionalProperties(),
                emotion: this.stateMachine.getCurrentState().emotion,
                particleSystem: this.particleSystem,
                speaking: false, // Always false in minimal build
                audioLevel: 0    // Always 0 in minimal build
            };
            
            const deltaTime = this.animationController.deltaTime;
            this.renderer.render(renderState, deltaTime);
            
            if (this.config.showFPS || this.config.showDebug) {
                this.renderDebugInfo();
            }
        }, 'main-render')();
    }

    renderDebugInfo() {
        const ctx = this.canvasManager.getContext();
        ctx.save();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        
        let y = 20;
        const lineHeight = 16;
        
        if (this.config.showFPS) {
            const metrics = this.animationController.getPerformanceMetrics();
            const fpsText = `FPS: ${metrics.fps} (Minimal)`;
            ctx.strokeText(fpsText, 10, y);
            ctx.fillText(fpsText, 10, y);
            y += lineHeight;
        }
        
        if (this.config.showDebug) {
            const state = this.stateMachine.getCurrentState();
            const particleStats = this.particleSystem.getStats();
            
            const debugInfo = [
                `Emotion: ${state.emotion}${state.undertone ? ` (${state.undertone})` : ''}`,
                `Particles: ${particleStats.activeParticles}/${particleStats.maxParticles}`,
                `Gesture: ${this.renderer?.currentGesture || 'none'}`,
                `Audio: disabled (minimal build)`
            ];
            
            for (const info of debugInfo) {
                ctx.strokeText(info, 10, y);
                ctx.fillText(info, 10, y);
                y += lineHeight;
            }
        }
        
        ctx.restore();
    }
}

export default EmotiveMascotMinimal;