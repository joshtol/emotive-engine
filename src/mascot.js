/**
 * Universal Emotive Mascot System
 * A charming, animated mascot component for web applications.
 * @version 2.0.0 - Emotive Communication Engine
 */

// Import the new Emotive Communication Engine
import EmotiveMascot from './EmotiveMascot.js';

// --- Event Emitter for internal events (legacy support) ---
class EventEmitter {
    constructor() {
        this.events = new Map();
    }
    on(event, callback) {
        if (!this.events.has(event)) this.events.set(event, []);
        this.events.get(event).push(callback);
    }
    off(event, callback) {
        const callbacks = this.events.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) callbacks.splice(index, 1);
        }
    }
    emit(event, data) {
        const callbacks = this.events.get(event);
        if (callbacks) callbacks.forEach(cb => cb(data));
    }
}

// --- Main Mascot Class ---
class EmotiveMascotLegacy extends EventEmitter {
    constructor(config = {}) {
        super();
        // Default configuration
        const defaults = {
            canvasId: 'my-mascot',
            colors: null, // If null, uses CSS variables
            enableTwitching: true,
            idleBreathCycle: 4000,
            animationDuration: 500
        };
        this.config = { ...defaults, ...config };

        // Initialize canvas and context
        this.canvas = typeof this.config.canvasId === 'string' 
            ? document.getElementById(this.config.canvasId) 
            : this.config.canvasId;
        if (!this.canvas) {
            console.error(`EmotiveMascotLegacy: Canvas with ID '${this.config.canvasId}' not found.`);
            return;
        }
        this.ctx = this.canvas.getContext('2d');

        // State
        this.animationFrameId = null;
        this.particles = [];
        this.speechRings = [];
        this.state = 'idle';
        this.isAnimating = false;
        this.pointerPos = { x: 0, y: 0 };
        this.gazePos = { x: 0, y: 0 };
        this.isPointerActive = false;
        this.isGazeLocked = false;
        this.gazeIntensity = 0;
        this.radius = 10;
        this.animTime = 0;
        this.lastRingTime = 0;
        this.blinkTime = 0;
        this.isBlinking = false;
        this.nextBlink = 2000 + Math.random() * 4000;
        this.lookTarget = { x: 0, y: 0 };
        this.nextLook = 3000 + Math.random() * 5000;
        this.nextTwitch = 0;
        this.isTwitching = false;
        this.twitchDuration = 100;
        this.twitchTime = 0;

        // Color system: use config colors first, fall back to CSS vars
        this.colors = {};
        this.updateColors();

        // Animation registry for extensibility
        this.animations = new Map();
        this.registerDefaultAnimations();

        // Setup
        this.center = { x: 0, y: 0 };
        this.resize();
        this.addEventListeners();

        // Emit creation event
        this.emit('init', { mascot: this });
    }

    // --- Color & Theming ---
    updateColors() {
        const styles = getComputedStyle(document.body);
        const getVar = (name, fallback) => {
            const value = styles.getPropertyValue(name).trim();
            return value || fallback;
        };

        // Use config colors if provided, otherwise use CSS variables
        this.colors = {
            primary: this.config.colors?.primary || getVar('--accent-primary', '#14B8A6'),
            primaryRGB: this.config.colors?.primaryRGB || getVar('--accent-primary-rgb', '20, 184, 166'),
            secondaryRGB: this.config.colors?.secondaryRGB || getVar('--accent-secondary-rgb', '129, 140, 248'),
            core: this.config.colors?.core || getVar('--core-glow-contrast-color', '#1E293B'),
            ambientGlowRGB: this.config.colors?.ambientGlowRGB || getVar('--ambient-glow-color-rgb', '20, 184, 166')
        };
    }

    // --- Canvas & Events ---
    resize() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.canvas.clientWidth * dpr;
        this.canvas.height = this.canvas.clientHeight * dpr;
        this.ctx.scale(dpr, dpr);
        this.center.x = this.canvas.clientWidth / 2;
        this.center.y = this.canvas.clientHeight / 2;
        this.radius = Math.min(this.canvas.clientWidth, this.canvas.clientHeight) / 12;
        this.gazePos = { ...this.center };
        this.pointerPos = { ...this.center };
    }

    addEventListeners() {
        const updatePointer = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches ? e.touches[0] : e;
            this.pointerPos = { 
                x: touch.clientX - rect.left, 
                y: touch.clientY - rect.top 
            };
        };

        this.canvas.addEventListener('mouseenter', () => { this.isPointerActive = true; });
        this.canvas.addEventListener('mouseleave', () => { 
            this.isPointerActive = false; 
            this.isGazeLocked = false;
        });
        this.canvas.addEventListener('mousemove', updatePointer);
        this.canvas.addEventListener('touchstart', (e) => { 
            this.isPointerActive = true; 
            updatePointer(e); 
            e.preventDefault(); 
        }, { passive: false });
        this.canvas.addEventListener('touchmove', (e) => { 
            if(this.isPointerActive) updatePointer(e); 
            e.preventDefault(); 
        }, { passive: false });
    }

    // --- Core Animation Loop ---
    updateAndDraw() {
        this.animTime += 0.015;
        const now = performance.now();

        // Handle twitching
        if (this.config.enableTwitching && this.state === 'idle' && now > this.nextTwitch && !this.isTwitching) {
            this.isTwitching = true;
            this.twitchTime = now;
            this.nextTwitch = now + 3000 + Math.random() * 5000;
        }
        if (this.isTwitching) {
            const elapsed = now - this.twitchTime;
            if (elapsed > this.twitchDuration) {
                this.isTwitching = false;
            } else {
                const twitchAmount = 0.5;
                this.gazePos.x += (Math.random() - 0.5) * twitchAmount;
                this.gazePos.y += (Math.random() - 0.5) * twitchAmount;
            }
        }

        // Jitter in 'connecting' state
        if (this.state === 'connecting') {
            const jitterAmount = 0.5;
            this.gazePos.x += (Math.random() - 0.5) * jitterAmount;
            this.gazePos.y += (Math.random() - 0.5) * jitterAmount;
        }

        // Create particles
        const isConnecting = this.state === 'connecting';
        if (isConnecting || (this.state === 'idle' && Math.random() > 0.90)) {
            this.createParticle();
        }

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Handle blinking
        if (now > this.nextBlink && !this.isBlinking) {
            this.isBlinking = true;
            this.blinkTime = now;
            this.nextBlink = now + 150 + 2000 + Math.random() * 4000;
        }
        if (this.isBlinking && now > this.blinkTime + 150) {
            this.isBlinking = false;
        }

        // Update gaze
        const distToPointer = Math.sqrt(
            Math.pow(this.pointerPos.x - this.gazePos.x, 2) + 
            Math.pow(this.pointerPos.y - this.gazePos.y, 2)
        );
        this.isGazeLocked = this.isPointerActive && distToPointer < this.radius;

        let targetIntensity = 0;
        if (this.isPointerActive && !this.isGazeLocked) {
            targetIntensity = Math.max(0, 1 - (distToPointer - this.radius) / (this.canvas.clientWidth / 2));
            this.lookTarget = this.pointerPos;
        }
        this.gazeIntensity += (targetIntensity - this.gazeIntensity) * 0.1;

        // Move gaze target smoothly
        const targetGazeX = this.center.x + (this.lookTarget.x - this.center.x) * 0.15;
        const targetGazeY = this.center.y + (this.lookTarget.y - this.center.y) * 0.15;
        this.gazePos.x += (targetGazeX - this.gazePos.x) * 0.05;
        this.gazePos.y += (targetGazeY - this.gazePos.y) * 0.05;

        // Add subtle movement
        this.gazePos.x += Math.sin(this.animTime * 0.5) * 0.1;
        this.gazePos.y += Math.cos(this.animTime * 0.7) * 0.1;

        // Keep gaze within bounds
        const margin = this.radius * 1.5;
        this.gazePos.x = Math.max(margin, Math.min(this.canvas.clientWidth - margin, this.gazePos.x));
        this.gazePos.y = Math.max(margin, Math.min(this.canvas.clientHeight - margin, this.gazePos.y));

        // Update particles
        const pullFactor = isConnecting ? 0.008 : 0.005;
        const chaosFactor = isConnecting ? 1 : 0.6;
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.vx *= 0.95; p.vy *= 0.95;
            p.vx += (this.gazePos.x - p.x) * pullFactor + (Math.random() - 0.5) * chaosFactor;
            p.vy += (this.gazePos.y - p.y) * pullFactor + (Math.random() - 0.5) * chaosFactor;
            p.x += p.vx; p.y += p.vy; 
            p.life -= p.lifeDecay;
            if (p.life <= 0) { 
                this.particles.splice(i, 1); 
                continue; 
            }
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.life; 
            this.ctx.beginPath(); 
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); 
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1;

        // Draw outer glow
        const breathCycle = this.config.idleBreathCycle;
        const breathProgress = (this.animTime * 1000) % breathCycle / breathCycle;
        const baseRadius = isConnecting ? this.radius * 1.5 : this.radius;
        let outerRadius = baseRadius * 2.5;
        outerRadius *= 1 - Math.sin(breathProgress * Math.PI * 2) * 0.1;
        const outerGlow = this.ctx.createRadialGradient(this.gazePos.x, this.gazePos.y, baseRadius, this.gazePos.x, this.gazePos.y, outerRadius);
        outerGlow.addColorStop(0, `rgba(${this.colors.primaryRGB}, 0.5)`);
        outerGlow.addColorStop(1, `rgba(${this.colors.primaryRGB}, 0)`);
        this.ctx.fillStyle = outerGlow; 
        this.ctx.beginPath(); 
        this.ctx.arc(this.gazePos.x, this.gazePos.y, outerRadius, 0, Math.PI * 2); 
        this.ctx.fill();

        // Draw speech rings
        this.drawSpeechRings();

        // Draw the core
        this.drawCore(breathProgress);

        // Continue the loop
        this.animationFrameId = requestAnimationFrame(() => this.updateAndDraw());
    }

    createParticle(count = 1, speedMultiplier = 1, lifeDecay = 0.012, color = this.colors.primary) {
        for (let i = 0; i < count; i++) {
            const isConnecting = this.state === 'connecting';
            const angle = Math.random() * Math.PI * 2;
            const speed = (isConnecting ? 2 + Math.random() * 5 : 0.5 + Math.random() * 1.5) * speedMultiplier;
            this.particles.push({ 
                x: this.center.x, y: this.center.y, 
                vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, 
                life: 1, lifeDecay: lifeDecay,
                size: (isConnecting ? 3 : 4) + Math.random() * (isConnecting ? 7.5 : 6),
                color: color
            });
        }
    }

    drawCore(breathProgress) {
        let baseRadius = this.state === 'connecting' ? this.radius * 1.5 : this.radius;
        if (this.state === 'idle' && !this.isGazeLocked) {
            baseRadius *= 1 + Math.sin(breathProgress * Math.PI * 2) * 0.05;
        }
        if (this.isGazeLocked) {
            const pulseCycle = 1500;
            const pulseProgress = (this.animTime * 1000) % pulseCycle / pulseCycle;
            baseRadius *= 1 + Math.sin(pulseProgress * Math.PI * 2) * 0.1;
        }

        let rotation = 0;
        if (this.gazeIntensity > 0.05 && !this.isGazeLocked) {
            const angleToPointer = Math.atan2(this.lookTarget.y - this.gazePos.y, this.lookTarget.x - this.gazePos.x);
            rotation = angleToPointer + Math.PI / 2;
        }

        let scaleY = 1 - 0.5 * this.gazeIntensity; 
        let scaleX = 1 + 0.3 * this.gazeIntensity;

        if (this.isBlinking) {
            const blinkDuration = 150;
            const blinkProgress = Math.min((performance.now() - this.blinkTime) / blinkDuration, 1);
            const easedProgress = Math.sin(blinkProgress * Math.PI);
            scaleY = 1 - easedProgress;
            scaleX = 1 + easedProgress * 0.1;
        }

        this.ctx.save();
        this.ctx.translate(this.gazePos.x, this.gazePos.y);
        this.ctx.rotate(rotation);
        this.ctx.scale(scaleX, scaleY);
        this.ctx.fillStyle = this.colors.core;
        this.ctx.shadowColor = this.colors.core;
        this.ctx.shadowBlur = 15;
        const coreSize = this.state === 'emulatingSpeech' 
            ? baseRadius * (0.8 + Math.sin(this.animTime * 10) * 0.2)
            : baseRadius;
        this.ctx.globalAlpha = 0.9 + Math.sin(Date.now() / 400) * 0.1;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, coreSize, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
        this.ctx.restore();
        this.ctx.shadowBlur = 0;
    }

    drawSpeechRings() {
        if (this.state !== 'emulatingSpeech' && this.speechRings.length === 0) return;
        if (this.state === 'emulatingSpeech' && this.animTime > this.lastRingTime + 0.2) {
            this.speechRings.push({ radius: this.radius, life: 1, animOffset: Math.random() * 10 });
            this.lastRingTime = this.animTime;
        }
        this.ctx.strokeStyle = `rgba(${this.colors.primaryRGB}, 0.7)`;
        this.ctx.lineWidth = 2;
        for (let i = this.speechRings.length - 1; i >= 0; i--) {
            const ring = this.speechRings[i];
            ring.radius += 1.5;
            ring.life -= 0.02;
            if (ring.life <= 0) { 
                this.speechRings.splice(i, 1); 
                continue; 
            }
            this.ctx.globalAlpha = ring.life;
            this.ctx.beginPath();
            for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
                const wavyRadius = ring.radius + Math.sin(angle * 10 + this.animTime * 5 + ring.animOffset) * (ring.radius / 20);
                const x = this.gazePos.x + Math.cos(angle) * wavyRadius;
                const y = this.gazePos.y + Math.sin(angle) * wavyRadius;
                if (angle === 0) { this.ctx.moveTo(x, y); }
                else { this.ctx.lineTo(x, y); }
            }
            this.ctx.closePath();
            this.ctx.stroke();
        }
        this.ctx.globalAlpha = 1;
    }

    // --- Animation System ---
    registerDefaultAnimations() {
        this.animations.set('thinking', (duration, params) => {
            return new Promise((resolve) => {
                const startTime = performance.now();
                const maxScale = 1.15 + Math.random() * 0.2;
                const rotation = (Math.random() > 0.5 ? 1 : -1) * (270 + Math.random() * 180);
                const animate = (currentTime) => {
                    const elapsedTime = currentTime - startTime;
                    let progress = elapsedTime / duration;
                    if (progress > 1) progress = 1;
                    const easedProgress = 1 - Math.pow(1 - progress, 3);
                    this.canvas.style.transform = `scale(${1 + (maxScale - 1) * Math.sin(progress * Math.PI)}) rotate(${rotation * progress}deg)`;
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        this.canvas.style.transform = '';
                        this.emit('animation:end', { type: 'thinking', duration });
                        resolve();
                    }
                };
                requestAnimationFrame(animate);
                this.emit('animation:start', { type: 'thinking', duration });
            });
        });

        this.animations.set('sparkle', (duration, params) => {
            return new Promise((resolve) => {
                const count = 15 + Math.random() * 35;
                const speedMultiplier = 1.5 + Math.random() * 2;
                const lifeDecay = 0.01 + Math.random() * 0.015;
                const color = Math.random() > 0.8 ? `rgba(${this.colors.secondaryRGB}, 0.9)` : this.colors.primary;
                this.createParticle(count, speedMultiplier, lifeDecay, color);
                this.emit('animation:start', { type: 'sparkle', duration });
                this.emit('animation:end', { type: 'sparkle', duration });
                resolve();
            });
        });

        this.animations.set('wobble', (duration, params) => {
            return new Promise((resolve) => {
                const startTime = performance.now();
                const animate = (currentTime) => {
                    const elapsedTime = currentTime - startTime;
                    let progress = elapsedTime / duration;
                    if (progress > 1) progress = 1;
                    const angle = 20 * Math.sin(progress * Math.PI * 4);
                    this.canvas.style.transform = `rotate(${angle}deg)`;
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        this.canvas.style.transform = '';
                        this.emit('animation:end', { type: 'wobble', duration });
                        resolve();
                    }
                };
                requestAnimationFrame(animate);
                this.emit('animation:start', { type: 'wobble', duration });
            });
        });
    }

    registerAnimation(name, animationFunction) {
        this.animations.set(name, animationFunction);
        return this;
    }

    async runAnimation(type, params = {}) {
        if (this.isAnimating) return;
        if (!this.animations.has(type)) {
            console.warn(`EmotiveMascotLegacy: Animation '${type}' not found.`);
            return;
        }
        this.isAnimating = true;
        try {
            await this.animations.get(type)(this.config.animationDuration, params);
        } finally {
            this.isAnimating = false;
        }
    }

    // --- Public API ---
    start() {
        if (this.animationFrameId) return;
        // The canvas must be visible before resizing, otherwise its clientWidth/Height will be 0.
        this.canvas.style.display = 'block';
        this.updateColors();
        this.resize();
        this.updateAndDraw();
        this.emit('start');
    }

    stop() {
        return new Promise(resolve => {
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
            this.canvas.style.display = 'none';
            this.emit('stop');
            resolve();
        });
    }

    destroy() {
        this.stop();
        this.canvas.style.display = 'none';
        this.canvas = null;
        this.ctx = null;
        this.events.clear();
        this.emit('destroy');
    }

    setState(newState) {
        // Define valid states (emotions)
        const validStates = [
            'neutral', 'joy', 'sadness', 'anger', 'fear', 
            'surprise', 'disgust', 'love', 
            // Also support the aliases from index.html
            'happy', 'excited', 'calm', 'curious', 'frustrated', 'sad'
        ];
        
        // Validate the new state
        if (!validStates.includes(newState)) {
            console.warn(`EmotiveMascotLegacy: Invalid state '${newState}'. Valid states are: ${validStates.join(', ')}`);
            return;
        }
        
        // Map aliases to actual emotion states
        const stateMapping = {
            'happy': 'joy',
            'excited': 'surprise',
            'calm': 'neutral',
            'curious': 'surprise',
            'frustrated': 'anger',
            'sad': 'sadness'
        };
        
        const mappedState = stateMapping[newState] || newState;
        const oldState = this.state;
        
        if (oldState !== mappedState) {
            this.state = mappedState;
            this.emit('state:change', { oldState, newState: mappedState });
        }
    }
}

// Export both the legacy EmotiveMascotLegacy and new EmotiveMascot
export default EmotiveMascotLegacy;
export { EmotiveMascotLegacy };
export { EmotiveMascot };