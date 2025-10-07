/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Element Targeting Effects
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Element targeting with visual effects for mascot movement
 * @author Emotive Engine Team
 * @module positioning/elementTargeting/ElementTargetingEffects
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Provides element targeting with visual effects including trails, particles,       
 * ║ glow effects, and other visual enhancements for mascot movement.                  
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

import ElementTargeting from './ElementTargeting.js';

class ElementTargetingEffects extends ElementTargeting {
    constructor(positionController) {
        super(positionController);
        this.activeEffects = new Map();
        this.trailPoints = [];
        this.particles = [];
        this.effectCanvas = null;
        this.effectContext = null;
        this.maxTrailPoints = 50;
        this.maxParticles = 100;
    }

    /**
     * Move mascot to element with trail effect
     * @param {string} targetSelector - CSS selector for target element
     * @param {Object} trailOptions - Trail effect options
     * @param {string} position - Position relative to element
     * @param {Object} offset - Pixel offset
     */
    moveToElementWithTrail(targetSelector, trailOptions = {}, position = 'right', offset = { x: 20, y: 0 }) {
        const element = document.querySelector(targetSelector);
        if (!element) {
            console.warn(`Element not found: ${targetSelector}`);
            return;
        }

        const effectId = `trail-${Date.now()}-${Math.random()}`;
        const {
            color = '#00ff88',
            width = 3,
            opacity = 0.8,
            fadeSpeed = 0.95,
            onComplete = null
        } = trailOptions;

        this.initializeEffectCanvas();

        const rect = element.getBoundingClientRect();
        const targetX = rect.left + rect.width / 2 + offset.x;
        const targetY = rect.top + rect.height / 2 + offset.y;

        const startOffset = this.positionController.getOffset();
        const startX = startOffset.x + window.innerWidth / 2;
        const startY = startOffset.y + window.innerHeight / 2;

        const startTime = performance.now();
        const duration = 1000;

        const animate = currentTime => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Calculate current position
            const currentX = startX + (targetX - startX) * progress;
            const currentY = startY + (targetY - startY) * progress;

            // Add point to trail
            this.trailPoints.push({
                x: currentX,
                y: currentY,
                opacity: opacity * (1 - progress),
                timestamp: currentTime
            });

            // Remove old trail points
            if (this.trailPoints.length > this.maxTrailPoints) {
                this.trailPoints.shift();
            }

            // Fade trail points
            this.trailPoints.forEach(point => {
                point.opacity *= fadeSpeed;
            });

            // Remove faded points
            this.trailPoints = this.trailPoints.filter(point => point.opacity > 0.01);

            // Draw trail
            this.drawTrail(color, width);

            // Update mascot position
            this.positionController.setOffset(currentX - window.innerWidth / 2, currentY - window.innerHeight / 2, 0);

            if (progress < 1) {
                this.activeEffects.set(effectId, animate);
                requestAnimationFrame(animate);
            } else {
                this.activeEffects.delete(effectId);
                if (onComplete) onComplete();
            }
        };

        this.activeEffects.set(effectId, animate);
        requestAnimationFrame(animate);

        return () => {
            this.activeEffects.delete(effectId);
        };
    }

    /**
     * Move mascot to element with particle effect
     * @param {string} targetSelector - CSS selector for target element
     * @param {Object} particleOptions - Particle effect options
     * @param {string} position - Position relative to element
     * @param {Object} offset - Pixel offset
     */
    moveToElementWithParticles(targetSelector, particleOptions = {}, position = 'right', offset = { x: 20, y: 0 }) {
        const element = document.querySelector(targetSelector);
        if (!element) {
            console.warn(`Element not found: ${targetSelector}`);
            return;
        }

        const effectId = `particles-${Date.now()}-${Math.random()}`;
        const {
            count = 20,
            color = '#00ff88',
            size = 2,
            speed = 2,
            life = 1000,
            onComplete = null
        } = particleOptions;

        this.initializeEffectCanvas();

        const rect = element.getBoundingClientRect();
        const targetX = rect.left + rect.width / 2 + offset.x;
        const targetY = rect.top + rect.height / 2 + offset.y;

        const startOffset = this.positionController.getOffset();
        const startX = startOffset.x + window.innerWidth / 2;
        const startY = startOffset.y + window.innerHeight / 2;

        const startTime = performance.now();
        const duration = 1000;

        // Create initial particles
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: startX,
                y: startY,
                vx: (Math.random() - 0.5) * speed,
                vy: (Math.random() - 0.5) * speed,
                life,
                maxLife: life,
                color,
                size
            });
        }

        const animate = currentTime => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Update particles
            this.particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.life -= 16; // Assuming 60fps

                // Fade particle
                particle.opacity = particle.life / particle.maxLife;
            });

            // Remove dead particles
            this.particles = this.particles.filter(particle => particle.life > 0);

            // Draw particles
            this.drawParticles();

            // Update mascot position
            const currentX = startX + (targetX - startX) * progress;
            const currentY = startY + (targetY - startY) * progress;
            this.positionController.setOffset(currentX - window.innerWidth / 2, currentY - window.innerHeight / 2, 0);

            if (progress < 1 || this.particles.length > 0) {
                this.activeEffects.set(effectId, animate);
                requestAnimationFrame(animate);
            } else {
                this.activeEffects.delete(effectId);
                if (onComplete) onComplete();
            }
        };

        this.activeEffects.set(effectId, animate);
        requestAnimationFrame(animate);

        return () => {
            this.activeEffects.delete(effectId);
        };
    }

    /**
     * Move mascot to element with glow effect
     * @param {string} targetSelector - CSS selector for target element
     * @param {Object} glowOptions - Glow effect options
     * @param {string} position - Position relative to element
     * @param {Object} offset - Pixel offset
     */
    moveToElementWithGlow(targetSelector, glowOptions = {}, position = 'right', offset = { x: 20, y: 0 }) {
        const element = document.querySelector(targetSelector);
        if (!element) {
            console.warn(`Element not found: ${targetSelector}`);
            return;
        }

        const effectId = `glow-${Date.now()}-${Math.random()}`;
        const {
            color = '#00ff88',
            intensity = 50,
            radius = 100,
            duration = 1000,
            onComplete = null
        } = glowOptions;

        this.initializeEffectCanvas();

        const rect = element.getBoundingClientRect();
        const targetX = rect.left + rect.width / 2 + offset.x;
        const targetY = rect.top + rect.height / 2 + offset.y;

        const startOffset = this.positionController.getOffset();
        const startX = startOffset.x + window.innerWidth / 2;
        const startY = startOffset.y + window.innerHeight / 2;

        const startTime = performance.now();

        const animate = currentTime => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Calculate current position
            const currentX = startX + (targetX - startX) * progress;
            const currentY = startY + (targetY - startY) * progress;

            // Draw glow effect
            this.drawGlow(currentX, currentY, color, intensity, radius, progress);

            // Update mascot position
            this.positionController.setOffset(currentX - window.innerWidth / 2, currentY - window.innerHeight / 2, 0);

            if (progress < 1) {
                this.activeEffects.set(effectId, animate);
                requestAnimationFrame(animate);
            } else {
                this.activeEffects.delete(effectId);
                if (onComplete) onComplete();
            }
        };

        this.activeEffects.set(effectId, animate);
        requestAnimationFrame(animate);

        return () => {
            this.activeEffects.delete(effectId);
        };
    }

    /**
     * Initialize the effect canvas
     */
    initializeEffectCanvas() {
        if (!this.effectCanvas) {
            this.effectCanvas = document.createElement('canvas');
            this.effectCanvas.style.position = 'fixed';
            this.effectCanvas.style.top = '0';
            this.effectCanvas.style.left = '0';
            this.effectCanvas.style.width = '100%';
            this.effectCanvas.style.height = '100%';
            this.effectCanvas.style.pointerEvents = 'none';
            this.effectCanvas.style.zIndex = '1000';
            document.body.appendChild(this.effectCanvas);

            this.effectContext = this.effectCanvas.getContext('2d');
            this.resizeEffectCanvas();
        }
    }

    /**
     * Resize the effect canvas
     */
    resizeEffectCanvas() {
        if (this.effectCanvas) {
            this.effectCanvas.width = window.innerWidth;
            this.effectCanvas.height = window.innerHeight;
        }
    }

    /**
     * Draw trail effect
     * @param {string} color - Trail color
     * @param {number} width - Trail width
     */
    drawTrail(color, width) {
        if (!this.effectContext || this.trailPoints.length < 2) return;

        this.effectContext.clearRect(0, 0, this.effectCanvas.width, this.effectCanvas.height);

        this.effectContext.strokeStyle = color;
        this.effectContext.lineWidth = width;
        this.effectContext.lineCap = 'round';
        this.effectContext.lineJoin = 'round';

        this.effectContext.beginPath();
        this.effectContext.moveTo(this.trailPoints[0].x, this.trailPoints[0].y);

        for (let i = 1; i < this.trailPoints.length; i++) {
            const point = this.trailPoints[i];
            this.effectContext.globalAlpha = point.opacity;
            this.effectContext.lineTo(point.x, point.y);
        }

        this.effectContext.stroke();
        this.effectContext.globalAlpha = 1;
    }

    /**
     * Draw particles
     */
    drawParticles() {
        if (!this.effectContext) return;

        this.effectContext.clearRect(0, 0, this.effectCanvas.width, this.effectCanvas.height);

        this.particles.forEach(particle => {
            this.effectContext.globalAlpha = particle.opacity;
            this.effectContext.fillStyle = particle.color;
            this.effectContext.beginPath();
            this.effectContext.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.effectContext.fill();
        });

        this.effectContext.globalAlpha = 1;
    }

    /**
     * Draw glow effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} color - Glow color
     * @param {number} intensity - Glow intensity
     * @param {number} radius - Glow radius
     * @param {number} progress - Animation progress
     */
    drawGlow(x, y, color, intensity, radius, progress) {
        if (!this.effectContext) return;

        this.effectContext.clearRect(0, 0, this.effectCanvas.width, this.effectCanvas.height);

        const gradient = this.effectContext.createRadialGradient(x, y, 0, x, y, radius);
        // Ensure color is valid hex format and add alpha channel
        const alpha = Math.floor(intensity * progress).toString(16).padStart(2, '0');
        const validColor = color.startsWith('#') ? color : `#${color}`;
        
        gradient.addColorStop(0, `${validColor}${alpha}`);
        gradient.addColorStop(1, `${validColor}00`);

        this.effectContext.fillStyle = gradient;
        this.effectContext.beginPath();
        this.effectContext.arc(x, y, radius, 0, Math.PI * 2);
        this.effectContext.fill();
    }

    /**
     * Stop all active effects
     */
    stopAllEffects() {
        this.activeEffects.forEach((effect, id) => {
            this.activeEffects.delete(id);
        });
        this.trailPoints = [];
        this.particles = [];
    }

    /**
     * Destroy the effect system
     */
    destroy() {
        this.stopAllEffects();
        
        if (this.effectCanvas) {
            document.body.removeChild(this.effectCanvas);
            this.effectCanvas = null;
            this.effectContext = null;
        }
        
        super.destroy();
    }
}

export default ElementTargetingEffects;
