/**
 * Mascot Lite - Minimal build entry point
 * Only includes core functionality without extra features
 */

import CanvasManager from './core/CanvasManager.js';
import EmotiveStateMachine from './core/EmotiveStateMachine.js';
import ParticleSystem from './core/ParticleSystem.js';
import EmotiveRenderer from './core/EmotiveRenderer.js';
import ErrorBoundary from './core/ErrorBoundary.js';

class MascotLite {
    constructor(config = {}) {
        this.config = {
            canvasId: 'mascot-lite',
            targetFPS: 30,
            maxParticles: 20,
            defaultEmotion: 'neutral',
            ...config
        };
        
        // Get canvas
        this.canvas = typeof this.config.canvasId === 'string' 
            ? document.getElementById(this.config.canvasId)
            : this.config.canvasId;
            
        if (!this.canvas) {
            throw new Error(`Canvas not found: ${this.config.canvasId}`);
        }
        
        // Initialize core systems only
        this.errorBoundary = new ErrorBoundary();
        this.canvasManager = new CanvasManager(this.canvas);
        this.stateMachine = new EmotiveStateMachine(this.errorBoundary);
        this.particleSystem = new ParticleSystem(this.config.maxParticles, this.errorBoundary);
        this.renderer = new EmotiveRenderer(this.canvasManager, {});
        
        // Basic animation state
        this.isRunning = false;
        this.lastTime = 0;
        this.animationFrame = null;
        
        // Set initial state
        this.stateMachine.setState(this.config.defaultEmotion);
    }
    
    /**
     * Start animation
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.animate();
    }
    
    /**
     * Stop animation
     */
    stop() {
        this.isRunning = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }
    
    /**
     * Animation loop
     */
    animate() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;
        
        // Update systems
        this.stateMachine.update(deltaTime * 1000);
        this.particleSystem.update(deltaTime);
        
        // Clear and render
        const ctx = this.canvasManager.getContext();
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render mascot
        const state = this.stateMachine.getCurrentState();
        this.renderer.render(state, {
            position: { x: this.canvas.width / 2, y: this.canvas.height / 2 },
            scale: 1,
            rotation: 0
        });
        
        // Render particles
        this.particleSystem.render(ctx);
        
        // Continue animation
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
    
    /**
     * Set emotional state
     * @param {string} emotion - Emotional state
     */
    setState(emotion) {
        this.stateMachine.setState(emotion);
    }
    
    /**
     * Trigger a gesture
     * @param {string} gesture - Gesture name
     */
    runAnimation(gesture) {
        // Direct call to renderer methods
        const rendererMethods = {
            'bounce': 'startBounce',
            'pulse': 'startPulse',
            'shake': 'startShake',
            'spin': 'startSpin',
            'drift': 'startDrift'
        };
        
        const methodName = rendererMethods[gesture];
        if (methodName && this.renderer && this.renderer[methodName]) {
            this.renderer[methodName]();
        }
    }
    
    /**
     * Clean up
     */
    destroy() {
        this.stop();
        this.particleSystem.destroy();
        this.renderer.destroy();
        this.canvasManager.destroy();
    }
}

export default MascotLite;