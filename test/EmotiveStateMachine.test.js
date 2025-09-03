/**
 * EmotiveStateMachine Tests
 * Tests for emotional state management, transitions, and undertone modifiers
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import EmotiveStateMachine from '../src/core/EmotiveStateMachine.js';
import ErrorBoundary from '../src/core/ErrorBoundary.js';

describe('EmotiveStateMachine', () => {
    let stateMachine;
    let errorBoundary;

    beforeEach(() => {
        errorBoundary = new ErrorBoundary();
        stateMachine = new EmotiveStateMachine(errorBoundary);
    });

    describe('Emotional State Management', () => {
        it('should initialize with neutral emotion', () => {
            const state = stateMachine.getCurrentState();
            expect(state.emotion).toBe('neutral');
            expect(state.undertone).toBe(null);
            expect(state.isTransitioning).toBe(false);
        });

        it('should validate all 10 emotional states including zen and focused', () => {
            const expectedEmotions = ['neutral', 'joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'love', 'resting', 'zen', 'focused'];
            const availableEmotions = stateMachine.getAvailableEmotions();
            
            expect(availableEmotions).toEqual(expect.arrayContaining(expectedEmotions));
            expect(availableEmotions.length).toBeGreaterThanOrEqual(10);
        });

        it('should set valid emotions successfully', () => {
            const result = stateMachine.setEmotion('joy');
            expect(result).toBe(true);
            
            const state = stateMachine.getCurrentState();
            expect(state.emotion).toBe('joy');
        });

        it('should handle invalid emotions gracefully', () => {
            const result = stateMachine.setEmotion('invalid-emotion');
            expect(result).toBe(false);
            
            // Should remain in current state
            const state = stateMachine.getCurrentState();
            expect(state.emotion).toBe('neutral');
        });

        it('should have correct visual properties for each emotion', () => {
            // Test joy emotion properties - wait for transition to complete
            stateMachine.setEmotion('joy', null, 0); // No transition time
            const joyProps = stateMachine.getCurrentEmotionalProperties();
            expect(joyProps.primaryColor).toBe('#FFD700');
            expect(joyProps.glowIntensity).toBe(1.2);
            expect(joyProps.particleBehavior).toBe('rising');

            // Test sadness emotion properties - wait for transition to complete
            stateMachine.setEmotion('sadness', null, 0); // No transition time
            const sadnessProps = stateMachine.getCurrentEmotionalProperties();
            expect(sadnessProps.primaryColor).toBe('#4169E1');
            expect(sadnessProps.glowIntensity).toBe(0.6);
            expect(sadnessProps.particleBehavior).toBe('falling');
        });
        
        describe('Zen State', () => {
            it('should set zen emotion successfully', () => {
                const result = stateMachine.setEmotion('zen');
                expect(result).toBe(true);
                
                const state = stateMachine.getCurrentState();
                expect(state.emotion).toBe('zen');
            });
            
            it('should have correct zen state properties', () => {
                stateMachine.setEmotion('zen', null, 0); // Immediate transition
                const zenProps = stateMachine.getCurrentEmotionalProperties();
                
                expect(zenProps.primaryColor).toBe('#4B0082'); // Deep purple-blue
                expect(zenProps.glowIntensity).toBe(0.6);
                expect(zenProps.particleRate).toBe(20); // Very rare particles
                expect(zenProps.minParticles).toBe(0);
                expect(zenProps.maxParticles).toBe(2);
                expect(zenProps.particleBehavior).toBe('ascending');
                expect(zenProps.breathRate).toBe(0.1); // Ultra-slow breathing
                expect(zenProps.breathDepth).toBe(0.03); // Very subtle
                expect(zenProps.eyeOpenness).toBe(0.3); // Narrowed happy eyes
                expect(zenProps.eyeArc).toBe(-0.2); // Buddha eyes arc
            });
            
            it('should transition smoothly from neutral to zen', () => {
                stateMachine.setEmotion('zen', null, 500);
                
                // Initially should be transitioning
                let state = stateMachine.getCurrentState();
                expect(state.isTransitioning).toBe(true);
                expect(state.emotion).toBe('zen');
                
                // Simulate time passing
                stateMachine.enableSimulatedTime(true);
                stateMachine.update(250); // Half-way through
                
                state = stateMachine.getCurrentState();
                expect(state.transitionProgress).toBeGreaterThan(0.4);
                expect(state.transitionProgress).toBeLessThan(0.6);
                
                // Complete transition
                stateMachine.update(250);
                state = stateMachine.getCurrentState();
                expect(state.isTransitioning).toBe(false);
                expect(state.transitionProgress).toBe(1);
            });
            
            it('should support zen with undertones', () => {
                const result = stateMachine.setEmotion('zen', 'subdued');
                expect(result).toBe(true);
                
                const state = stateMachine.getCurrentState();
                expect(state.emotion).toBe('zen');
                expect(state.undertone).toBe('subdued');
                
                // Check that undertone modifiers are applied
                const props = stateMachine.getCurrentEmotionalProperties();
                // Subdued should dampen properties
                expect(props.glowIntensity).toBeLessThan(0.6); // Less than base zen glow
            });
        });
        
        describe('Focused State', () => {
            it('should set focused emotion successfully', () => {
                const result = stateMachine.setEmotion('focused');
                expect(result).toBe(true);
                
                const state = stateMachine.getCurrentState();
                expect(state.emotion).toBe('focused');
            });
            
            it('should have correct focused state properties', () => {
                stateMachine.setEmotion('focused', null, 0); // Immediate transition
                const focusedProps = stateMachine.getCurrentEmotionalProperties();
                
                expect(focusedProps.primaryColor).toBe('#00CED1'); // Bright cyan
                expect(focusedProps.glowIntensity).toBe(1.2);
                expect(focusedProps.particleRate).toBe(0.5); // Frequent particles
                expect(focusedProps.minParticles).toBe(2);
                expect(focusedProps.maxParticles).toBe(5);
                expect(focusedProps.particleBehavior).toBe('directed');
                expect(focusedProps.breathRate).toBe(1.2); // Alert breathing
                expect(focusedProps.breathDepth).toBe(0.08);
                expect(focusedProps.eyeOpenness).toBe(0.7); // Narrowed for concentration
                expect(focusedProps.microAdjustments).toBe(true);
            });
        });
        
        describe('Resting State', () => {
            it('should set resting emotion successfully', () => {
                const result = stateMachine.setEmotion('resting');
                expect(result).toBe(true);
                
                const state = stateMachine.getCurrentState();
                expect(state.emotion).toBe('resting');
            });
            
            it('should have correct resting state properties', () => {
                stateMachine.setEmotion('resting', null, 0); // Immediate transition
                const restingProps = stateMachine.getCurrentEmotionalProperties();
                
                expect(restingProps.primaryColor).toBe('#7C3AED'); // Soft purple
                expect(restingProps.glowIntensity).toBe(0.8);
                expect(restingProps.particleRate).toBe(2);
                expect(restingProps.minParticles).toBe(3);
                expect(restingProps.maxParticles).toBe(5);
                expect(restingProps.particleBehavior).toBe('resting');
                expect(restingProps.breathRate).toBe(0.8); // Relaxed breathing
                expect(restingProps.breathDepth).toBe(0.12);
            });
        });
    });

    describe('Undertone Modifier System', () => {
        it('should validate all 5 undertone modifiers', () => {
            const expectedUndertones = ['nervous', 'confident', 'tired', 'intense', 'subdued'];
            const availableUndertones = stateMachine.getAvailableUndertones();
            
            expect(availableUndertones).toEqual(expect.arrayContaining(expectedUndertones));
            expect(availableUndertones.length).toBe(5);
        });

        it('should apply undertones to emotions', () => {
            const result = stateMachine.setEmotion('joy', 'nervous');
            expect(result).toBe(true);
            
            const state = stateMachine.getCurrentState();
            expect(state.emotion).toBe('joy');
            expect(state.undertone).toBe('nervous');
        });

        it('should handle invalid undertones gracefully', () => {
            const result = stateMachine.setEmotion('joy', 'invalid-undertone');
            expect(result).toBe(false);
            
            // Should remain in current state
            const state = stateMachine.getCurrentState();
            expect(state.emotion).toBe('neutral');
            expect(state.undertone).toBe(null);
        });

        it('should apply nervous undertone modifiers correctly', () => {
            stateMachine.setEmotion('neutral', 'nervous');
            const props = stateMachine.getCurrentEmotionalProperties();
            
            // Nervous should add jitter and increase breath rate
            expect(props.jitterAmount).toBe(0.3);
            expect(props.breathRate).toBeCloseTo(1.0 * 1.2); // base * multiplier
            expect(props.glowIntensity).toBeCloseTo(0.7 * 0.9); // base * multiplier
        });

        it('should apply confident undertone modifiers correctly', () => {
            stateMachine.setEmotion('neutral', 'confident');
            const props = stateMachine.getCurrentEmotionalProperties();
            
            // Confident should increase core size and glow
            expect(props.coreSize).toBeCloseTo(1.0 * 1.1);
            expect(props.glowIntensity).toBeCloseTo(0.7 * 1.2);
            expect(props.breathRate).toBeCloseTo(1.0 * 0.9);
        });

        it('should apply tired undertone modifiers correctly', () => {
            stateMachine.setEmotion('neutral', 'tired');
            const props = stateMachine.getCurrentEmotionalProperties();
            
            // Tired should reduce breath rate and particle rate
            expect(props.breathRate).toBeCloseTo(1.0 * 0.7);
            expect(props.particleRate).toBe(Math.round(15 * 0.5)); // 15 is neutral base rate
            expect(props.glowIntensity).toBeCloseTo(0.7 * 0.8);
        });

        it('should apply intense undertone modifiers correctly', () => {
            stateMachine.setEmotion('neutral', 'intense');
            const props = stateMachine.getCurrentEmotionalProperties();
            
            // Intense should amplify all properties by 1.3
            expect(props.glowIntensity).toBeCloseTo(0.7 * 1.3);
            expect(props.breathRate).toBeCloseTo(1.0 * 1.3);
            expect(props.particleRate).toBe(Math.round(15 * 1.3));
        });

        it('should apply subdued undertone modifiers correctly', () => {
            stateMachine.setEmotion('neutral', 'subdued');
            const props = stateMachine.getCurrentEmotionalProperties();
            
            // Subdued should dampen all properties by 0.7
            expect(props.glowIntensity).toBeCloseTo(0.7 * 0.7);
            expect(props.breathRate).toBeCloseTo(1.0 * 0.7);
            expect(props.particleRate).toBe(Math.round(15 * 0.7));
        });

        it('should clear undertones correctly', () => {
            stateMachine.setEmotion('joy', 'nervous');
            stateMachine.clearUndertone();
            
            const state = stateMachine.getCurrentState();
            expect(state.undertone).toBe(null);
            
            // Properties should return to base emotional state
            const props = stateMachine.getCurrentEmotionalProperties();
            expect(props.jitterAmount).toBeUndefined();
        });

        it('should apply undertone using applyUndertoneModifier method', () => {
            stateMachine.setEmotion('joy');
            const result = stateMachine.applyUndertoneModifier('confident');
            
            expect(result).toBe(true);
            const state = stateMachine.getCurrentState();
            expect(state.undertone).toBe('confident');
        });

        it('should get undertone modifier data', () => {
            const nervousModifier = stateMachine.getUndertoneModifier('nervous');
            expect(nervousModifier).toEqual({
                jitterAmount: 0.3,
                breathRateMultiplier: 1.2,
                glowIntensityMultiplier: 0.9,
                particleRateMultiplier: 1.1
            });

            const intenseModifier = stateMachine.getUndertoneModifier('intense');
            expect(intenseModifier).toEqual({
                amplificationFactor: 1.3
            });

            const invalidModifier = stateMachine.getUndertoneModifier('invalid');
            expect(invalidModifier).toBe(null);
        });
    });

    describe('State Validation', () => {
        it('should validate emotions correctly', () => {
            expect(stateMachine.isValidEmotion('joy')).toBe(true);
            expect(stateMachine.isValidEmotion('invalid')).toBe(false);
        });

        it('should validate undertones correctly', () => {
            expect(stateMachine.isValidUndertone('nervous')).toBe(true);
            expect(stateMachine.isValidUndertone(null)).toBe(true);
            expect(stateMachine.isValidUndertone('invalid')).toBe(false);
        });
    });

    describe('Emotional State Interpolation and Blending', () => {
        beforeEach(() => {
            // Enable simulated time for consistent testing
            stateMachine.enableSimulatedTime(true);
        });

        it('should interpolate colors smoothly during transitions', () => {
            // Start transition from neutral to joy
            stateMachine.setEmotion('joy', null, 1000); // 1 second transition
            
            const state = stateMachine.getCurrentState();
            expect(state.isTransitioning).toBe(true);
            expect(state.transitionProgress).toBe(0);
            
            // Simulate some progress
            stateMachine.update(100); // 10% through
            
            // Color should be interpolated between neutral (#B0B0B0) and joy (#FFD700)
            const props = stateMachine.getCurrentEmotionalProperties();
            expect(props.primaryColor).not.toBe('#B0B0B0'); // Should not be pure neutral
            expect(props.primaryColor).not.toBe('#FFD700'); // Should not be pure joy yet
        });

        it('should blend numeric properties smoothly', () => {
            // Set up transition from neutral to anger
            stateMachine.setEmotion('anger', null, 1000);
            
            // Simulate some progress
            stateMachine.update(100); // 10% through
            
            const props = stateMachine.getCurrentEmotionalProperties();
            
            // Properties should be between neutral and anger values
            expect(props.glowIntensity).toBeGreaterThan(0.7); // neutral base
            expect(props.glowIntensity).toBeLessThan(1.3); // anger target
            
            expect(props.coreSize).toBeGreaterThan(1.0); // neutral base
            expect(props.coreSize).toBeLessThan(1.2); // anger target
        });

        it('should track transition progress', () => {
            stateMachine.setEmotion('sadness', null, 500);
            
            const initialState = stateMachine.getCurrentState();
            expect(initialState.isTransitioning).toBe(true);
            expect(initialState.transitionProgress).toBe(0);
            
            // Simulate time passing
            stateMachine.update(250); // Half the transition time
            
            const midState = stateMachine.getCurrentState();
            expect(midState.isTransitioning).toBe(true);
            expect(midState.transitionProgress).toBeGreaterThan(0.4); // Should be around 0.5
            expect(midState.transitionProgress).toBeLessThan(0.6);
        });

        it('should complete transitions properly', () => {
            stateMachine.setEmotion('fear', null, 100);
            
            // Simulate enough time for transition to complete
            stateMachine.update(150);
            
            const finalState = stateMachine.getCurrentState();
            expect(finalState.isTransitioning).toBe(false);
            expect(finalState.transitionProgress).toBe(1);
            expect(finalState.emotion).toBe('fear');
            
            // Properties should match target emotion exactly
            const props = stateMachine.getCurrentEmotionalProperties();
            expect(props.primaryColor).toBe('#8B008B'); // fear color
            expect(props.glowIntensity).toBe(0.8); // fear glow
        });

        it('should use easing for smooth transitions', () => {
            stateMachine.setEmotion('surprise', null, 1000);
            
            // Get properties at different points in transition
            const startProps = stateMachine.getCurrentEmotionalProperties();
            
            stateMachine.update(250); // 25% through
            const quarterProps = stateMachine.getCurrentEmotionalProperties();
            
            stateMachine.update(250); // 50% through total (25% more)
            const halfProps = stateMachine.getCurrentEmotionalProperties();
            
            // Due to easeOutCubic easing, the change should not be linear
            // easeOutCubic starts fast and slows down, so first quarter should have more change
            const startToQuarter = Math.abs(quarterProps.glowIntensity - startProps.glowIntensity);
            const quarterToHalf = Math.abs(halfProps.glowIntensity - quarterProps.glowIntensity);
            
            // For easeOutCubic, the first quarter should have more change than the second quarter
            expect(startToQuarter).toBeGreaterThan(quarterToHalf);
            
            // Also verify that easing is actually being applied (not linear)
            const linearQuarter = startProps.glowIntensity + (1.4 - 0.7) * 0.25; // Linear interpolation
            expect(Math.abs(quarterProps.glowIntensity - linearQuarter)).toBeGreaterThan(0.01);
        });

        it('should handle particle behavior transitions correctly', () => {
            // Start with neutral (ambient behavior)
            expect(stateMachine.getCurrentEmotionalProperties().particleBehavior).toBe('ambient');
            
            // Transition to joy (rising behavior)
            stateMachine.setEmotion('joy', null, 1000);
            
            // At start of transition, should still be ambient
            const startProps = stateMachine.getCurrentEmotionalProperties();
            expect(startProps.particleBehavior).toBe('ambient');
            
            // Simulate transition past 50%
            stateMachine.update(600);
            
            // Should now use target behavior
            const endProps = stateMachine.getCurrentEmotionalProperties();
            expect(endProps.particleBehavior).toBe('rising');
        });
    });

    describe('State Reset', () => {
        it('should reset to neutral state', () => {
            stateMachine.setEmotion('anger', 'intense');
            stateMachine.reset();
            
            const state = stateMachine.getCurrentState();
            expect(state.emotion).toBe('neutral');
            expect(state.undertone).toBe(null);
        });
    });
});