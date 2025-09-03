/**
 * Particle Ascending Behavior Tests
 * Tests for the zen state ascending particle behavior
 */

import { describe, it, expect, beforeEach } from 'vitest';
import Particle from '../src/core/Particle.js';

describe('Particle Ascending Behavior', () => {
    let particle;
    
    describe('Initialization', () => {
        beforeEach(() => {
            particle = new Particle(200, 200, 'ascending');
        });
        
        it('should initialize with ascending behavior', () => {
            expect(particle.behavior).toBe('ascending');
        });
        
        it('should have slow upward velocity', () => {
            expect(particle.vy).toBeLessThan(0); // Negative is upward
            expect(particle.vy).toBeGreaterThan(-0.06); // Not too fast
            expect(Math.abs(particle.vx)).toBeLessThan(0.03); // Minimal horizontal
        });
        
        it('should have very long life', () => {
            expect(particle.lifeDecay).toBe(0.0008); // 30+ seconds lifetime
        });
        
        it('should have ethereal appearance', () => {
            expect(particle.size).toBeGreaterThanOrEqual(3);
            expect(particle.size).toBeLessThanOrEqual(6);
            expect(particle.baseOpacity).toBeGreaterThanOrEqual(0.2);
            expect(particle.baseOpacity).toBeLessThanOrEqual(0.4);
        });
        
        it('should have correct behavior data', () => {
            const data = particle.behaviorData;
            expect(data.ascensionSpeed).toBe(0.0003);
            expect(data.waveFactor).toBe(0.5);
            expect(data.waveFrequency).toBe(0.001);
            expect(data.friction).toBe(0.998);
            expect(data.fadeStartDistance).toBe(100);
        });
    });
    
    describe('Update Behavior', () => {
        beforeEach(() => {
            particle = new Particle(200, 300, 'ascending');
        });
        
        it('should rise upward over time', () => {
            const initialY = particle.y;
            
            // Update multiple times
            for (let i = 0; i < 10; i++) {
                particle.update(16.67, 200, 200); // 60 FPS frame
            }
            
            expect(particle.y).toBeLessThan(initialY); // Should have moved up
        });
        
        it('should apply friction to velocities', () => {
            const initialVx = particle.vx;
            const initialVy = particle.vy;
            
            particle.update(16.67, 200, 200);
            
            // Velocities should be slightly reduced by friction
            expect(Math.abs(particle.vx)).toBeLessThanOrEqual(Math.abs(initialVx));
            expect(Math.abs(particle.vy)).toBeLessThanOrEqual(Math.abs(initialVy) * 1.01); // Allow for ascension
        });
        
        it('should add wave motion for organic movement', () => {
            // Set initial horizontal velocity to 0 for clearer test
            particle.vx = 0;
            particle.age = 0;
            
            // Update over time
            const velocities = [];
            for (let i = 0; i < 20; i++) {
                particle.update(100, 200, 200); // Larger time steps
                velocities.push(particle.vx);
            }
            
            // Should have some variation in horizontal velocity
            const uniqueVelocities = new Set(velocities);
            expect(uniqueVelocities.size).toBeGreaterThan(1);
        });
        
        it('should track initial Y position', () => {
            expect(particle.initialY).toBeUndefined();
            
            particle.update(16.67, 200, 200);
            
            expect(particle.initialY).toBe(300);
        });
        
        it('should start fading after rising fadeStartDistance', () => {
            // Force particle to rise quickly for testing
            particle.y = 300;
            particle.initialY = 300;
            particle.baseOpacity = 0.4;
            
            // Move particle up past fade distance
            particle.y = 150; // 150px up from start
            
            const initialOpacity = particle.baseOpacity;
            particle.update(16.67, 200, 200);
            
            // Should start fading
            expect(particle.baseOpacity).toBeLessThan(initialOpacity);
        });
        
        it('should accelerate decay when fading', () => {
            particle.y = 300;
            particle.initialY = 300;
            particle.baseOpacity = 0.2; // Low opacity for fade test
            
            // Move far up to trigger fade
            particle.y = 100; // 200px up
            
            const initialDecay = particle.lifeDecay;
            particle.update(16.67, 200, 200);
            
            // Life decay should increase when fading
            expect(particle.lifeDecay).toBeGreaterThan(initialDecay);
        });
        
        it('should dampen excessive horizontal movement', () => {
            particle.vx = 0.1; // Set excessive horizontal velocity
            
            particle.update(16.67, 200, 200);
            
            // Should be dampened
            expect(Math.abs(particle.vx)).toBeLessThan(0.1);
        });
        
        it('should cap upward velocity', () => {
            particle.vy = -0.2; // Set excessive upward velocity
            
            particle.update(16.67, 200, 200);
            
            // Should be capped at -0.1
            expect(particle.vy).toBeGreaterThanOrEqual(-0.1);
        });
    });
    
    describe('Zen-like Characteristics', () => {
        beforeEach(() => {
            particle = new Particle(200, 200, 'ascending');
        });
        
        it('should move like incense smoke', () => {
            const positions = [];
            
            // Track movement over time
            for (let i = 0; i < 100; i++) {
                particle.update(16.67, 200, 200);
                positions.push({ x: particle.x, y: particle.y });
            }
            
            // Should primarily move upward
            const verticalMovement = positions[0].y - positions[99].y;
            const horizontalMovement = Math.abs(positions[99].x - positions[0].x);
            
            expect(verticalMovement).toBeGreaterThan(0); // Moved up
            expect(verticalMovement).toBeGreaterThan(horizontalMovement * 2); // Much more vertical than horizontal
        });
        
        it('should have very slow, graceful movement', () => {
            const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
            
            // Speed should be very low for zen aesthetic
            expect(speed).toBeLessThan(0.1);
        });
        
        it('should remain visible for extended time', () => {
            // Simulate many updates
            for (let i = 0; i < 1000; i++) {
                particle.update(16.67, 200, 200);
            }
            
            // Should still be alive after ~16 seconds
            expect(particle.isAlive()).toBe(true);
            expect(particle.life).toBeGreaterThan(0);
        });
    });
    
    describe('Integration with Zen State', () => {
        it('should work with zen state particle configuration', () => {
            // Zen state config from EmotiveStateMachine
            const zenConfig = {
                particleRate: 20,  // Very rare
                minParticles: 0,
                maxParticles: 2,
                particleBehavior: 'ascending'
            };
            
            // Create particle with zen behavior
            const zenParticle = new Particle(200, 200, zenConfig.particleBehavior);
            
            expect(zenParticle.behavior).toBe('ascending');
            expect(zenParticle.lifeDecay).toBeLessThan(0.001); // Very long-lived
            
            // Update and verify zen-like movement
            for (let i = 0; i < 10; i++) {
                zenParticle.update(16.67, 200, 200);
            }
            
            // Should be rising slowly
            expect(zenParticle.y).toBeLessThan(200);
        });
        
        it('should create minimal visual disturbance', () => {
            // Zen particles should be subtle
            expect(particle.baseOpacity).toBeLessThan(0.5); // Translucent
            expect(particle.size).toBeLessThan(7); // Small
            
            // Movement should be gentle
            expect(Math.abs(particle.vx)).toBeLessThan(0.05);
            expect(Math.abs(particle.vy)).toBeLessThanOrEqual(0.1); // Allow up to 0.1 for upward movement
        });
    });
});