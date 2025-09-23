/**
 * Integration Tests - Comprehensive testing of system interactions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import EmotiveStateMachine from '../src/core/EmotiveStateMachine.js';
import GestureCompositor from '../src/core/GestureCompositor.js';
import GestureScheduler from '../src/core/GestureScheduler.js';
import { getGesture } from '../src/core/gestures/index.js';
import ParticleSystem from '../src/core/ParticleSystem.js';
import { SoundSystem } from '../src/core/SoundSystem.js';

describe('System Integration Tests', () => {
    let stateMachine;
    let gestureSystem;
    let particleSystem;
    let soundSystem;
    let mockCtx;

    beforeEach(() => {
        // Create mock canvas context for rendering tests
        mockCtx = {
            save: vi.fn(),
            restore: vi.fn(),
            clearRect: vi.fn(),
            beginPath: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            fillStyle: '#ffffff',
            globalAlpha: 1
        };

        // Create mock error boundary
        const mockErrorBoundary = {
            wrap: (fn) => fn
        };

        // Initialize systems with mock error boundary
        stateMachine = new EmotiveStateMachine(mockErrorBoundary);
        gestureSystem = new GestureSystem(mockErrorBoundary);
        particleSystem = new ParticleSystem(50, mockErrorBoundary);
        soundSystem = new SoundSystem();
    });

    afterEach(() => {
        if (particleSystem) {
            particleSystem.destroy();
        }
    });

    describe('StateMachine and GestureSystem Integration', () => {
        it('should coordinate emotional states with gesture execution', () => {
            // Set initial emotion
            stateMachine.setEmotion('neutral');
            const initialState = stateMachine.getCurrentState();
            expect(initialState.emotion).toBe('neutral');
            
            // Execute a gesture
            const gestureResult = gestureSystem.execute('bounce');
            expect(gestureResult).toBe(true);
            
            // Verify systems can work together
            const emotionalProps = stateMachine.getCurrentEmotionalProperties();
            expect(emotionalProps).toBeDefined();
            expect(emotionalProps.primaryColor).toBeDefined();
        });

        it('should handle gesture chaining', () => {
            // Execute multiple gestures in sequence
            const gestures = ['bounce', 'pulse', 'drift'];
            const results = [];
            
            for (const gesture of gestures) {
                const result = gestureSystem.execute(gesture);
                results.push(result);
            }
            
            // All valid gestures should execute
            expect(results.every(r => r === true)).toBe(true);
        });

        it('should handle invalid gestures gracefully', () => {
            // Try to execute an invalid gesture - should throw error
            expect(() => {
                gestureSystem.execute('invalid_gesture');
            }).toThrow('Unknown gesture: invalid_gesture');
            
            // State machine should remain stable
            const state = stateMachine.getCurrentState();
            expect(state).toBeDefined();
        });

        it('should maintain state consistency', () => {
            // Set emotion and execute gesture
            stateMachine.setEmotion('joy');
            gestureSystem.execute('bounce');
            
            // Both systems should maintain consistent state
            const emotionState = stateMachine.getCurrentState();
            
            expect(emotionState.emotion).toBe('joy');
            expect(gestureSystem.currentGesture).toBeDefined();
        });
    });

    describe('ParticleSystem and EmotiveStateMachine Integration', () => {
        it('should spawn particles based on emotional state', () => {
            // Set emotional state
            stateMachine.setEmotion('joy');
            const emotionalProps = stateMachine.getCurrentEmotionalProperties();
            
            // Spawn particles based on emotional properties
            particleSystem.spawn(
                emotionalProps.particleBehavior,
                'joy',
                emotionalProps.particleRate,
                400,
                300,
                16.67,
                5
            );
            
            // Verify particles were spawned
            expect(particleSystem.particles.length).toBe(5);
            expect(particleSystem.particles[0].behavior).toBe(emotionalProps.particleBehavior);
        });

        it('should render particles with emotional colors', () => {
            // Set emotional state and get color
            stateMachine.setEmotion('anger');
            const emotionalProps = stateMachine.getCurrentEmotionalProperties();
            
            // Spawn and render particles
            particleSystem.spawn('aggressive', 'anger', 10, 400, 300, 16.67, 3);
            particleSystem.render(mockCtx, emotionalProps.primaryColor);
            
            // Verify rendering calls were made
            expect(mockCtx.save).toHaveBeenCalled();
            expect(mockCtx.restore).toHaveBeenCalled();
            expect(mockCtx.arc).toHaveBeenCalled();
            expect(mockCtx.fill).toHaveBeenCalled();
        });

        it('should handle particle updates with emotional context', () => {
            // Spawn particles
            particleSystem.spawn('ambient', 'neutral', 10, 400, 300, 16.67, 5);
            const initialCount = particleSystem.particles.length;
            
            // Update particles
            particleSystem.update(16.67, 400, 300);
            
            // Verify particles were updated
            expect(particleSystem.particles.length).toBeLessThanOrEqual(initialCount);
            expect(particleSystem.particles.every(p => p.life <= 1.0)).toBe(true);
        });

        it('should handle different emotional particle behaviors', () => {
            const emotions = ['joy', 'sadness', 'anger', 'fear'];
            
            for (const emotion of emotions) {
                stateMachine.setEmotion(emotion);
                const props = stateMachine.getCurrentEmotionalProperties();
                
                particleSystem.clear();
                particleSystem.spawn(props.particleBehavior, emotion, 10, 400, 300, 16.67, 3);
                
                expect(particleSystem.particles.length).toBe(3);
                expect(particleSystem.particles[0].behavior).toBe(props.particleBehavior);
            }
        });
    });

    describe('SoundSystem Integration', () => {
        it('should initialize without errors', () => {
            expect(soundSystem).toBeDefined();
            expect(soundSystem.isEnabled).toBe(false); // Not initialized yet
        });

        it('should handle emotional tone mapping', () => {
            // Check that emotional tones are defined
            expect(soundSystem.emotionalTones).toBeDefined();
            expect(soundSystem.emotionalTones.size).toBeGreaterThan(0);
            
            // Verify specific emotional tones exist
            expect(soundSystem.emotionalTones.has('joy')).toBe(true);
            expect(soundSystem.emotionalTones.has('sadness')).toBe(true);
            expect(soundSystem.emotionalTones.has('anger')).toBe(true);
        });

        it('should coordinate with emotional state changes', () => {
            // Set different emotional states
            const emotions = ['joy', 'sadness', 'anger', 'fear'];
            
            for (const emotion of emotions) {
                stateMachine.setEmotion(emotion);
                const emotionalProps = stateMachine.getCurrentEmotionalProperties();
                
                // Verify emotional properties exist for sound mapping
                expect(emotionalProps).toBeDefined();
                expect(emotionalProps.primaryColor).toBeDefined();
                
                // Verify sound system has tone mapping for this emotion
                expect(soundSystem.emotionalTones.has(emotion)).toBe(true);
            }
        });

        it('should handle audio unavailability gracefully', () => {
            // Sound system should not throw errors when audio is unavailable
            expect(() => {
                soundSystem.setMasterVolume(0.5);
            }).not.toThrow();
        });
    });

    describe('Full Workflow Integration', () => {
        it('should handle complete emotional expression workflow', () => {
            // 1. Set initial emotional state
            stateMachine.setEmotion('joy');
            
            // 2. Execute gesture
            const gestureResult = gestureSystem.execute('bounce');
            expect(gestureResult).toBe(true);
            
            // 3. Get emotional properties
            const emotionalProps = stateMachine.getCurrentEmotionalProperties();
            
            // 4. Spawn particles based on emotion
            particleSystem.spawn(
                emotionalProps.particleBehavior,
                'joy',
                emotionalProps.particleRate,
                400,
                300,
                16.67,
                5
            );
            
            // 5. Update particles
            particleSystem.update(16.67, 400, 300);
            
            // 6. Render particles
            particleSystem.render(mockCtx, emotionalProps.primaryColor);
            
            // Verify complete workflow
            expect(particleSystem.particles.length).toBeGreaterThan(0);
            expect(mockCtx.arc).toHaveBeenCalled();
        });

        it('should handle rapid gesture execution with system coordination', () => {
            const gestures = ['bounce', 'pulse', 'drift'];
            const results = [];
            
            // Execute gestures rapidly
            for (const gesture of gestures) {
                const result = gestureSystem.execute(gesture);
                results.push(result);
                
                if (result) {
                    // Spawn particles for each gesture
                    const emotionalProps = stateMachine.getCurrentEmotionalProperties();
                    particleSystem.spawn(
                        emotionalProps.particleBehavior,
                        'neutral',
                        20,
                        400,
                        300,
                        16.67,
                        2
                    );
                    
                    // Update and render
                    particleSystem.update(16.67, 400, 300);
                    particleSystem.render(mockCtx, emotionalProps.primaryColor);
                }
            }
            
            // Verify system handled rapid execution
            expect(results.length).toBe(gestures.length);
            expect(particleSystem.particles.length).toBeGreaterThan(0);
        });

        it('should handle system cleanup and resource management', () => {
            // Initialize all systems with resources
            stateMachine.setEmotion('joy');
            gestureSystem.execute('bounce');
            particleSystem.spawn('rising', 'joy', 10, 400, 300, 16.67, 10);
            
            // Verify resources are allocated
            expect(particleSystem.particles.length).toBeGreaterThan(0);
            expect(particleSystem.pool.length).toBeGreaterThan(0);
            
            // Cleanup particle system
            particleSystem.destroy();
            
            // Verify cleanup
            expect(particleSystem.particles.length).toBe(0);
            expect(particleSystem.pool.length).toBe(0);
        });

        it('should maintain performance under system load', () => {
            const startTime = performance.now();
            
            // Simulate heavy load
            for (let i = 0; i < 10; i++) {
                // Emotional transitions
                stateMachine.setEmotion(['joy', 'sadness', 'neutral'][i % 3]);
                
                // Gesture execution
                gestureSystem.execute(['bounce', 'pulse', 'drift'][i % 3]);
                
                // Particle spawning
                particleSystem.spawn('ambient', 'neutral', 50, 400, 300, 16.67, 5);
                
                // System updates
                particleSystem.update(16.67, 400, 300);
                particleSystem.render(mockCtx, '#ffffff');
            }
            
            const endTime = performance.now();
            const totalTime = endTime - startTime;
            
            // Should complete within reasonable time
            expect(totalTime).toBeLessThan(100); // 100ms threshold
        });
    });

    describe('Error Propagation and Recovery', () => {
        it('should handle cascading errors gracefully', () => {
            // Force error in one system - should throw
            expect(() => {
                gestureSystem.execute('invalid_gesture');
            }).toThrow();
            
            // Other systems should continue working
            stateMachine.setEmotion('neutral');
            particleSystem.spawn('ambient', 'neutral', 10, 400, 300, 16.67, 3);
            
            const state = stateMachine.getCurrentState();
            expect(state.emotion).toBe('neutral');
            expect(particleSystem.particles.length).toBe(3);
        });

        it('should recover from rendering failures', () => {
            // Spawn particles
            particleSystem.spawn('ambient', 'neutral', 10, 400, 300, 16.67, 3);
            
            // Simulate rendering failure
            expect(() => {
                particleSystem.render(null, '#ffffff');
            }).toThrow();
            
            // System should recover with valid context
            expect(() => {
                particleSystem.render(mockCtx, '#ffffff');
            }).not.toThrow();
        });

        it('should validate system state consistency', () => {
            // Set up systems
            stateMachine.setEmotion('joy');
            const gestureResult = gestureSystem.execute('bounce');
            
            if (gestureResult) {
                particleSystem.spawn('rising', 'joy', 10, 400, 300, 16.67, 5);
            }
            
            // Verify state consistency
            const state = stateMachine.getCurrentState();
            expect(state.emotion).toBe('joy');
            expect(particleSystem.particles.length).toBe(5);
            expect(particleSystem.particles.every(p => p.behavior === 'rising')).toBe(true);
        });

        it('should handle memory pressure and cleanup', () => {
            // Create memory pressure by spawning many particles
            for (let i = 0; i < 20; i++) {
                particleSystem.spawn('ambient', 'neutral', 100, 400, 300, 16.67, 10);
                particleSystem.update(16.67, 400, 300);
            }
            
            // System should enforce limits
            expect(particleSystem.particles.length).toBeLessThanOrEqual(particleSystem.maxParticles);
            
            // Pool should maintain efficiency
            const stats = particleSystem.getStats();
            expect(stats.poolEfficiency).toBeGreaterThan(0);
        });
    });
});