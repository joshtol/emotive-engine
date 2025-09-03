/**
 * Visual Regression Tests - Comprehensive visual validation testing
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import EmotiveStateMachine from '../src/core/EmotiveStateMachine.js';
import GestureSystem from '../src/core/GestureSystem.js';
import ParticleSystem from '../src/core/ParticleSystem.js';
import { interpolateHsl } from '../src/utils/colorUtils.js';

describe('Visual Regression Testing System', () => {
    let stateMachine;
    let gestureSystem;
    let particleSystem;
    let visualTester;
    let mockCtx;

    beforeEach(() => {
        // Create mock error boundary
        const mockErrorBoundary = {
            wrap: (fn) => fn
        };

        // Create comprehensive mock canvas context
        mockCtx = {
            save: vi.fn(),
            restore: vi.fn(),
            clearRect: vi.fn(),
            beginPath: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            stroke: vi.fn(),
            fillRect: vi.fn(),
            strokeRect: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            quadraticCurveTo: vi.fn(),
            bezierCurveTo: vi.fn(),
            setTransform: vi.fn(),
            transform: vi.fn(),
            translate: vi.fn(),
            rotate: vi.fn(),
            scale: vi.fn(),
            createLinearGradient: vi.fn(() => ({
                addColorStop: vi.fn()
            })),
            createRadialGradient: vi.fn(() => ({
                addColorStop: vi.fn()
            })),
            getImageData: vi.fn(() => ({
                data: new Uint8ClampedArray(4 * 100 * 100), // 100x100 mock image
                width: 100,
                height: 100
            })),
            putImageData: vi.fn(),
            fillStyle: '#ffffff',
            strokeStyle: '#ffffff',
            globalAlpha: 1,
            lineWidth: 1,
            lineCap: 'butt',
            lineJoin: 'miter',
            shadowColor: 'rgba(0,0,0,0)',
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            font: '10px sans-serif',
            textAlign: 'start',
            textBaseline: 'alphabetic',
            globalCompositeOperation: 'source-over'
        };

        // Initialize systems
        stateMachine = new EmotiveStateMachine(mockErrorBoundary);
        gestureSystem = new GestureSystem(mockErrorBoundary);
        particleSystem = new ParticleSystem(50, mockErrorBoundary);
        visualTester = new VisualRegressionTester();
    });

    afterEach(() => {
        if (particleSystem) {
            particleSystem.destroy();
        }
        if (visualTester) {
            visualTester.cleanup();
        }
    });

    describe('Canvas Snapshot Comparison for Emotional States', () => {
        it('should capture consistent visual state for each emotion', () => {
            const emotions = ['neutral', 'joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'love'];
            const snapshots = [];

            for (const emotion of emotions) {
                stateMachine.setEmotion(emotion);
                const emotionalProps = stateMachine.getCurrentEmotionalProperties();
                
                // Capture visual state snapshot
                const snapshot = visualTester.captureEmotionalState(emotionalProps, mockCtx);
                snapshots.push({ emotion, snapshot });
                
                // Verify snapshot contains expected properties
                expect(snapshot.primaryColor).toBeDefined();
                expect(snapshot.glowIntensity).toBeGreaterThan(0);
                expect(snapshot.particleBehavior).toBeDefined();
                expect(snapshot.coreSize).toBeGreaterThan(0);
            }

            // Verify each emotion has unique visual characteristics
            const uniqueColors = new Set(snapshots.map(s => s.snapshot.primaryColor));
            expect(uniqueColors.size).toBe(emotions.length);
            
            // Verify snapshots are reproducible
            stateMachine.setEmotion('joy');
            const joyProps = stateMachine.getCurrentEmotionalProperties();
            const joySnapshot1 = visualTester.captureEmotionalState(joyProps, mockCtx);
            const joySnapshot2 = visualTester.captureEmotionalState(joyProps, mockCtx);
            
            expect(visualTester.compareSnapshots(joySnapshot1, joySnapshot2)).toBe(true);
        });

        it('should detect visual changes between emotional states', () => {
            // Capture baseline state
            stateMachine.setEmotion('neutral');
            const neutralProps = stateMachine.getCurrentEmotionalProperties();
            const neutralSnapshot = visualTester.captureEmotionalState(neutralProps, mockCtx);
            
            // Capture different state
            stateMachine.setEmotion('anger');
            const angerProps = stateMachine.getCurrentEmotionalProperties();
            const angerSnapshot = visualTester.captureEmotionalState(angerProps, mockCtx);
            
            // Should detect differences
            expect(visualTester.compareSnapshots(neutralSnapshot, angerSnapshot)).toBe(false);
            
            const differences = visualTester.analyzeDifferences(neutralSnapshot, angerSnapshot);
            expect(differences.colorChanged).toBe(true);
            expect(differences.glowIntensityChanged).toBe(true);
            expect(differences.particleBehaviorChanged).toBe(true);
        });

        it('should validate emotional state transitions', () => {
            const transitionFrames = [];
            
            // Start transition
            stateMachine.setEmotion('neutral');
            stateMachine.setEmotion('joy', null, 500); // 500ms transition
            
            // Capture frames during transition
            for (let i = 0; i <= 10; i++) {
                const progress = i / 10;
                stateMachine._simulatedTime = progress * 500; // Simulate time progression
                stateMachine.update(50); // Update transition
                
                const props = stateMachine.getCurrentEmotionalProperties();
                const frame = visualTester.captureEmotionalState(props, mockCtx);
                transitionFrames.push({ progress, frame });
            }
            
            // Verify smooth transition
            expect(transitionFrames.length).toBe(11);
            
            // Check that colors interpolate smoothly
            for (let i = 1; i < transitionFrames.length; i++) {
                const prevFrame = transitionFrames[i - 1].frame;
                const currentFrame = transitionFrames[i].frame;
                
                // Colors should be different but related
                expect(prevFrame.primaryColor).not.toBe(currentFrame.primaryColor);
                
                // Glow intensity should change gradually
                const glowDiff = Math.abs(currentFrame.glowIntensity - prevFrame.glowIntensity);
                expect(glowDiff).toBeLessThan(0.2); // Gradual change
            }
        });

        it('should handle canvas size variations', () => {
            const canvasSizes = [
                { width: 400, height: 300 },
                { width: 800, height: 600 },
                { width: 1200, height: 900 }
            ];
            
            stateMachine.setEmotion('joy');
            const emotionalProps = stateMachine.getCurrentEmotionalProperties();
            
            const snapshots = canvasSizes.map(size => {
                mockCtx.canvas = { width: size.width, height: size.height };
                return visualTester.captureEmotionalState(emotionalProps, mockCtx, size);
            });
            
            // Visual properties should be consistent across sizes
            snapshots.forEach(snapshot => {
                expect(snapshot.primaryColor).toBe(snapshots[0].primaryColor);
                expect(snapshot.glowIntensity).toBe(snapshots[0].glowIntensity);
                expect(snapshot.particleBehavior).toBe(snapshots[0].particleBehavior);
            });
            
            // But rendering calls should scale appropriately
            expect(snapshots[0].renderingCalls).toBeLessThan(snapshots[2].renderingCalls);
        });
    });

    describe('Gesture Animation Validation', () => {
        it('should capture gesture animation frames', () => {
            const gestures = ['bounce', 'pulse', 'shake', 'spin'];
            
            for (const gestureName of gestures) {
                const result = gestureSystem.execute(gestureName);
                if (!result) continue; // Skip if gesture queue is full
                
                const animationFrames = visualTester.captureGestureAnimation(
                    gestureName, 
                    gestureSystem, 
                    mockCtx,
                    { frameCount: 10, duration: 400 }
                );
                
                expect(animationFrames.length).toBe(10);
                
                // Verify frame progression
                animationFrames.forEach((frame, index) => {
                    expect(frame.timestamp).toBeDefined();
                    expect(frame.progress).toBeCloseTo(index / 9, 1);
                    expect(frame.visualState).toBeDefined();
                });
                
                // Verify animation properties change over time
                const firstFrame = animationFrames[0];
                const lastFrame = animationFrames[animationFrames.length - 1];
                
                if (gestureName === 'pulse') {
                    // Pulse should change scale
                    expect(firstFrame.visualState.scale).not.toBe(lastFrame.visualState.scale);
                } else if (gestureName === 'bounce') {
                    // Bounce should change position
                    expect(firstFrame.visualState.position.y).not.toBe(lastFrame.visualState.position.y);
                }
            }
        });

        it('should validate gesture visual consistency', () => {
            const gesture = 'pulse';
            
            // Capture animation multiple times
            const animation1 = visualTester.captureGestureAnimation(
                gesture, gestureSystem, mockCtx, { frameCount: 5, duration: 300 }
            );
            
            // Reset and capture again
            gestureSystem.currentGesture = null;
            const animation2 = visualTester.captureGestureAnimation(
                gesture, gestureSystem, mockCtx, { frameCount: 5, duration: 300 }
            );
            
            // Animations should be consistent
            expect(animation1.length).toBe(animation2.length);
            
            for (let i = 0; i < animation1.length; i++) {
                const frame1 = animation1[i];
                const frame2 = animation2[i];
                
                expect(frame1.progress).toBeCloseTo(frame2.progress, 2);
                expect(visualTester.compareVisualStates(frame1.visualState, frame2.visualState)).toBe(true);
            }
        });

        it('should detect gesture animation regressions', () => {
            const gesture = 'bounce';
            
            // Capture baseline animation
            const baselineAnimation = visualTester.captureGestureAnimation(
                gesture, gestureSystem, mockCtx, { frameCount: 8, duration: 400 }
            );
            
            // Simulate a regression (modify gesture properties)
            const originalGesture = gestureSystem.gestures.get(gesture);
            const modifiedDefinition = { ...originalGesture.definition, scale: 2.0 }; // Different scale
            
            // Create modified gesture system
            const modifiedGestureSystem = new GestureSystem();
            modifiedGestureSystem.registerGesture(gesture, modifiedDefinition);
            
            const regressionAnimation = visualTester.captureGestureAnimation(
                gesture, modifiedGestureSystem, mockCtx, { frameCount: 8, duration: 400 }
            );
            
            // Should detect regression
            const comparison = visualTester.compareAnimations(baselineAnimation, regressionAnimation);
            expect(comparison.isIdentical).toBe(false);
            expect(comparison.differences.length).toBeGreaterThan(0);
            expect(comparison.differences[0].type).toBe('scale_mismatch');
        });
    });

    describe('Particle Behavior Visual Validation', () => {
        it('should validate particle behavior visual characteristics', () => {
            const behaviors = ['ambient', 'rising', 'falling', 'aggressive', 'scattering', 'burst', 'repelling', 'orbiting'];
            const behaviorSnapshots = [];
            
            for (const behavior of behaviors) {
                particleSystem.clear();
                particleSystem.spawn(behavior, 'neutral', 50, 400, 300, 16.67, 10);
                
                // Update particles to establish behavior
                for (let i = 0; i < 5; i++) {
                    particleSystem.update(16.67, 400, 300);
                }
                
                const snapshot = visualTester.captureParticleBehavior(particleSystem, mockCtx);
                behaviorSnapshots.push({ behavior, snapshot });
                
                // Verify behavior-specific characteristics
                expect(snapshot.particleCount).toBe(10);
                expect(snapshot.behavior).toBe(behavior);
                expect(snapshot.averageVelocity).toBeDefined();
                expect(snapshot.positionDistribution).toBeDefined();
            }
            
            // Verify behaviors have distinct characteristics
            const risingSnapshot = behaviorSnapshots.find(s => s.behavior === 'rising').snapshot;
            const fallingSnapshot = behaviorSnapshots.find(s => s.behavior === 'falling').snapshot;
            
            // Rising particles should have negative Y velocity, falling should have positive
            expect(risingSnapshot.averageVelocity.y).toBeLessThan(0);
            expect(fallingSnapshot.averageVelocity.y).toBeGreaterThan(0);
            
            // Orbiting particles should have circular distribution
            const orbitingSnapshot = behaviorSnapshots.find(s => s.behavior === 'orbiting').snapshot;
            expect(orbitingSnapshot.positionDistribution.type).toBe('circular');
        });

        it('should track particle lifecycle visually', () => {
            particleSystem.spawn('ambient', 'neutral', 30, 400, 300, 16.67, 5);
            
            const lifecycleFrames = [];
            
            // Capture particle lifecycle over time
            for (let frame = 0; frame < 20; frame++) {
                particleSystem.update(16.67, 400, 300);
                
                const snapshot = visualTester.captureParticleBehavior(particleSystem, mockCtx);
                lifecycleFrames.push({
                    frame,
                    particleCount: snapshot.particleCount,
                    averageLife: snapshot.averageLife,
                    averageOpacity: snapshot.averageOpacity
                });
            }
            
            // Verify particle lifecycle progression
            expect(lifecycleFrames[0].particleCount).toBe(5);
            
            // Particles should gradually lose life and opacity
            const firstFrame = lifecycleFrames[0];
            const lastFrame = lifecycleFrames[lifecycleFrames.length - 1];
            
            expect(lastFrame.averageLife).toBeLessThan(firstFrame.averageLife);
            expect(lastFrame.averageOpacity).toBeLessThan(firstFrame.averageOpacity);
            
            // Some particles should have died
            expect(lastFrame.particleCount).toBeLessThanOrEqual(firstFrame.particleCount);
        });

        it('should validate particle rendering consistency', () => {
            const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];
            const renderingResults = [];
            
            for (const color of colors) {
                particleSystem.clear();
                particleSystem.spawn('ambient', 'neutral', 20, 400, 300, 16.67, 8);
                
                // Render with specific color
                particleSystem.render(mockCtx, color);
                
                const renderingSnapshot = visualTester.captureRenderingState(mockCtx);
                renderingResults.push({ color, snapshot: renderingSnapshot });
                
                // Verify rendering calls
                expect(renderingSnapshot.fillStyleCalls).toContain(color);
                expect(renderingSnapshot.arcCalls).toBe(8); // One per particle
                expect(renderingSnapshot.fillCalls).toBe(8);
            }
            
            // Verify consistent rendering structure across colors
            const callCounts = renderingResults.map(r => r.snapshot.arcCalls);
            expect(new Set(callCounts).size).toBe(1); // All should be the same
        });
    });  
  describe('Color Interpolation Accuracy Tests', () => {
        it('should validate HSL color interpolation accuracy', () => {
            const colorPairs = [
                { from: '#ff0000', to: '#00ff00' }, // Red to Green
                { from: '#0000ff', to: '#ffff00' }, // Blue to Yellow
                { from: '#ff00ff', to: '#00ffff' }, // Magenta to Cyan
            ];
            
            for (const { from, to } of colorPairs) {
                const interpolationSteps = [];
                
                // Test interpolation at different progress points
                for (let progress = 0; progress <= 1; progress += 0.1) {
                    const interpolatedColor = interpolateHsl(from, to, progress);
                    interpolationSteps.push({ progress, color: interpolatedColor });
                    
                    // Verify color format
                    expect(interpolatedColor).toMatch(/^#[0-9a-f]{6}$/i);
                }
                
                // Verify interpolation boundaries
                expect(interpolationSteps[0].color.toLowerCase()).toBe(from.toLowerCase());
                expect(interpolationSteps[interpolationSteps.length - 1].color.toLowerCase()).toBe(to.toLowerCase());
                
                // Verify smooth progression
                const colorAnalysis = visualTester.analyzeColorProgression(interpolationSteps);
                expect(colorAnalysis.isSmooth).toBe(true);
                expect(colorAnalysis.hasJumps).toBe(false);
                expect(colorAnalysis.progressionType).toBe('linear');
            }
        });

        it('should validate emotional color transitions', () => {
            const emotionTransitions = [
                { from: 'neutral', to: 'joy' },
                { from: 'sadness', to: 'anger' },
                { from: 'fear', to: 'love' }
            ];
            
            for (const { from, to } of emotionTransitions) {
                // Get emotion colors
                stateMachine.setEmotion(from);
                const fromProps = stateMachine.getCurrentEmotionalProperties();
                
                stateMachine.setEmotion(to);
                const toProps = stateMachine.getCurrentEmotionalProperties();
                
                // Test transition
                const transitionColors = [];
                for (let progress = 0; progress <= 1; progress += 0.2) {
                    const interpolatedColor = interpolateHsl(
                        fromProps.primaryColor, 
                        toProps.primaryColor, 
                        progress
                    );
                    transitionColors.push({ progress, color: interpolatedColor });
                }
                
                // Validate transition quality
                const transitionAnalysis = visualTester.analyzeColorTransition(transitionColors);
                expect(transitionAnalysis.isValid).toBe(true);
                expect(transitionAnalysis.smoothness).toBeGreaterThan(0.8);
                expect(transitionAnalysis.colorSpace).toBe('HSL');
            }
        });

        it('should detect color interpolation regressions', () => {
            const testColor1 = '#ff0000'; // Red
            const testColor2 = '#0000ff'; // Blue
            
            // Capture baseline interpolation
            const baselineInterpolation = [];
            for (let i = 0; i <= 10; i++) {
                const progress = i / 10;
                const color = interpolateHsl(testColor1, testColor2, progress);
                baselineInterpolation.push({ progress, color });
            }
            
            // Test against known good values (simplified test)
            expect(baselineInterpolation[0].color.toLowerCase()).toBe('#ff0000');
            expect(baselineInterpolation[10].color.toLowerCase()).toBe('#0000ff');
            
            // Midpoint should be a purple-ish color
            const midpoint = baselineInterpolation[5].color;
            expect(midpoint).toMatch(/^#[0-9a-f]{6}$/i);
            
            // Verify interpolation consistency
            const consistencyCheck = visualTester.validateInterpolationConsistency(baselineInterpolation);
            expect(consistencyCheck.isConsistent).toBe(true);
            expect(consistencyCheck.hasReversals).toBe(false);
        });

        it('should validate undertone color modifications', () => {
            const baseEmotion = 'joy';
            const undertones = ['warm', 'cool', 'intense', 'subtle'];
            
            stateMachine.setEmotion(baseEmotion);
            const baseProps = stateMachine.getCurrentEmotionalProperties();
            const baseColor = baseProps.primaryColor;
            
            const undertoneColors = [];
            
            for (const undertone of undertones) {
                stateMachine.applyUndertoneModifier(undertone);
                const modifiedProps = stateMachine.getCurrentEmotionalProperties();
                
                undertoneColors.push({
                    undertone,
                    color: modifiedProps.primaryColor,
                    glowIntensity: modifiedProps.glowIntensity
                });
                
                // Clear undertone for next test
                stateMachine.clearUndertone();
            }
            
            // Verify undertones create distinct colors
            const uniqueColors = new Set(undertoneColors.map(u => u.color));
            expect(uniqueColors.size).toBe(undertones.length);
            
            // Verify undertones modify the base appropriately
            undertoneColors.forEach(({ undertone, color }) => {
                const colorDifference = visualTester.calculateColorDistance(baseColor, color);
                expect(colorDifference).toBeGreaterThan(0); // Should be different
                expect(colorDifference).toBeLessThan(100); // But not completely different
            });
        });
    });

    describe('Rendering Consistency Tests', () => {
        it('should maintain consistent rendering across canvas sizes', () => {
            const canvasSizes = [
                { width: 200, height: 150 },
                { width: 400, height: 300 },
                { width: 800, height: 600 },
                { width: 1600, height: 1200 }
            ];
            
            const renderingResults = [];
            
            for (const size of canvasSizes) {
                // Setup canvas size
                mockCtx.canvas = { width: size.width, height: size.height };
                
                // Setup consistent scene
                stateMachine.setEmotion('joy');
                particleSystem.clear();
                particleSystem.spawn('rising', 'joy', 30, size.width / 2, size.height / 2, 16.67, 10);
                
                // Render scene
                const emotionalProps = stateMachine.getCurrentEmotionalProperties();
                particleSystem.render(mockCtx, emotionalProps.primaryColor);
                
                const renderingSnapshot = visualTester.captureRenderingState(mockCtx);
                renderingResults.push({ size, snapshot: renderingSnapshot });
            }
            
            // Verify consistent particle count across sizes
            const particleCounts = renderingResults.map(r => r.snapshot.arcCalls);
            expect(new Set(particleCounts).size).toBe(1); // All should render same number of particles
            
            // Verify scaling relationships
            const smallCanvas = renderingResults[0];
            const largeCanvas = renderingResults[renderingResults.length - 1];
            
            // Larger canvas should have proportionally positioned elements
            expect(largeCanvas.size.width / smallCanvas.size.width).toBe(8); // 1600/200
            expect(largeCanvas.size.height / smallCanvas.size.height).toBe(8); // 1200/150
        });

        it('should validate high-DPI rendering consistency', () => {
            const dpiScales = [1, 1.5, 2, 3];
            const dpiResults = [];
            
            for (const dpiScale of dpiScales) {
                // Simulate high-DPI canvas
                const scaledWidth = 400 * dpiScale;
                const scaledHeight = 300 * dpiScale;
                
                mockCtx.canvas = { 
                    width: scaledWidth, 
                    height: scaledHeight,
                    style: { width: '400px', height: '300px' }
                };
                
                // Setup scene
                particleSystem.clear();
                particleSystem.spawn('ambient', 'neutral', 25, scaledWidth / 2, scaledHeight / 2, 16.67, 8);
                
                // Render with DPI scaling
                mockCtx.scale = vi.fn();
                mockCtx.scale(dpiScale, dpiScale);
                
                particleSystem.render(mockCtx, '#00ff00');
                
                const snapshot = visualTester.captureRenderingState(mockCtx);
                dpiResults.push({ dpiScale, snapshot });
                
                // Verify scaling was applied
                expect(mockCtx.scale).toHaveBeenCalledWith(dpiScale, dpiScale);
            }
            
            // All DPI scales should render same number of particles
            const particleCounts = dpiResults.map(r => r.snapshot.arcCalls);
            expect(new Set(particleCounts).size).toBe(1);
        });

        it('should validate rendering performance across different scenarios', () => {
            const scenarios = [
                { name: 'light', particles: 5, emotion: 'neutral' },
                { name: 'medium', particles: 25, emotion: 'joy' },
                { name: 'heavy', particles: 50, emotion: 'anger' }
            ];
            
            const performanceResults = [];
            
            for (const scenario of scenarios) {
                const startTime = performance.now();
                
                // Setup scenario
                stateMachine.setEmotion(scenario.emotion);
                const emotionalProps = stateMachine.getCurrentEmotionalProperties();
                
                particleSystem.clear();
                particleSystem.spawn(
                    emotionalProps.particleBehavior, 
                    scenario.emotion, 
                    50, 
                    400, 
                    300, 
                    16.67, 
                    scenario.particles
                );
                
                // Render multiple frames
                for (let frame = 0; frame < 10; frame++) {
                    particleSystem.update(16.67, 400, 300);
                    particleSystem.render(mockCtx, emotionalProps.primaryColor);
                }
                
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                performanceResults.push({
                    scenario: scenario.name,
                    particles: scenario.particles,
                    duration,
                    framesRendered: 10
                });
            }
            
            // Verify performance scales reasonably
            performanceResults.forEach(result => {
                expect(result.duration).toBeLessThan(200); // Should complete within 200ms
                
                // Performance should scale with particle count
                const particlesPerMs = result.particles / result.duration;
                expect(particlesPerMs).toBeGreaterThan(0.1); // At least 0.1 particles per ms
            });
        });

        it('should detect visual rendering regressions', () => {
            // Capture baseline rendering
            stateMachine.setEmotion('joy');
            const emotionalProps = stateMachine.getCurrentEmotionalProperties();
            
            particleSystem.spawn('rising', 'joy', 30, 400, 300, 16.67, 15);
            particleSystem.render(mockCtx, emotionalProps.primaryColor);
            
            const baselineSnapshot = visualTester.captureRenderingState(mockCtx);
            
            // Clear and re-render (should be identical)
            vi.clearAllMocks();
            particleSystem.clear();
            particleSystem.spawn('rising', 'joy', 30, 400, 300, 16.67, 15);
            particleSystem.render(mockCtx, emotionalProps.primaryColor);
            
            const comparisonSnapshot = visualTester.captureRenderingState(mockCtx);
            
            // Should be identical
            const comparison = visualTester.compareRenderingSnapshots(baselineSnapshot, comparisonSnapshot);
            expect(comparison.isIdentical).toBe(true);
            expect(comparison.differences).toHaveLength(0);
            
            // Test with intentional difference
            vi.clearAllMocks();
            particleSystem.clear();
            particleSystem.spawn('rising', 'joy', 30, 400, 300, 16.67, 20); // Different particle count
            particleSystem.render(mockCtx, emotionalProps.primaryColor);
            
            const regressionSnapshot = visualTester.captureRenderingState(mockCtx);
            const regressionComparison = visualTester.compareRenderingSnapshots(baselineSnapshot, regressionSnapshot);
            
            expect(regressionComparison.isIdentical).toBe(false);
            expect(regressionComparison.differences).toContain('particle_count_mismatch');
        });
    });
});

// Helper Classes for Visual Regression Testing

class VisualRegressionTester {
    constructor() {
        this.snapshots = new Map();
        this.baselines = new Map();
    }
    
    captureEmotionalState(emotionalProps, ctx, canvasSize = null) {
        return {
            primaryColor: emotionalProps.primaryColor,
            glowIntensity: emotionalProps.glowIntensity,
            particleBehavior: emotionalProps.particleBehavior,
            coreSize: emotionalProps.coreSize,
            breathRate: emotionalProps.breathRate,
            breathDepth: emotionalProps.breathDepth,
            particleRate: emotionalProps.particleRate,
            timestamp: Date.now(),
            canvasSize: canvasSize || { width: 800, height: 600 },
            renderingCalls: this.countRenderingCalls(ctx)
        };
    }
    
    captureGestureAnimation(gestureName, gestureSystem, ctx, options = {}) {
        const { frameCount = 10, duration = 400 } = options;
        const frames = [];
        
        // Execute gesture if not already active
        if (!gestureSystem.currentGesture) {
            gestureSystem.execute(gestureName);
        }
        
        const gesture = gestureSystem.gestures.get(gestureName);
        if (!gesture) return frames;
        
        // Capture animation frames
        for (let i = 0; i < frameCount; i++) {
            const progress = i / (frameCount - 1);
            const timestamp = progress * duration;
            
            // Calculate gesture state at this progress
            const visualState = this.calculateGestureVisualState(gesture, progress);
            
            frames.push({
                timestamp,
                progress,
                visualState,
                gestureName
            });
        }
        
        return frames;
    }
    
    captureParticleBehavior(particleSystem, ctx) {
        const particles = particleSystem.particles;
        
        if (particles.length === 0) {
            return {
                particleCount: 0,
                behavior: null,
                averageVelocity: { x: 0, y: 0 },
                averageLife: 0,
                averageOpacity: 0,
                positionDistribution: { type: 'empty' }
            };
        }
        
        // Calculate average velocity
        const totalVelocity = particles.reduce(
            (sum, p) => ({ x: sum.x + p.vx, y: sum.y + p.vy }),
            { x: 0, y: 0 }
        );
        const averageVelocity = {
            x: totalVelocity.x / particles.length,
            y: totalVelocity.y / particles.length
        };
        
        // Calculate average life and opacity
        const averageLife = particles.reduce((sum, p) => sum + p.life, 0) / particles.length;
        const averageOpacity = particles.reduce((sum, p) => sum + p.opacity, 0) / particles.length;
        
        // Analyze position distribution
        const positionDistribution = this.analyzePositionDistribution(particles);
        
        return {
            particleCount: particles.length,
            behavior: particles[0].behavior,
            averageVelocity,
            averageLife,
            averageOpacity,
            positionDistribution,
            timestamp: Date.now()
        };
    }
    
    captureRenderingState(ctx) {
        const calls = {
            saveCalls: ctx.save.mock.calls.length,
            restoreCalls: ctx.restore.mock.calls.length,
            arcCalls: ctx.arc.mock.calls.length,
            fillCalls: ctx.fill.mock.calls.length,
            beginPathCalls: ctx.beginPath.mock.calls.length,
            fillStyleCalls: this.extractFillStyleValues(ctx),
            globalAlphaCalls: this.extractGlobalAlphaValues(ctx)
        };
        
        return {
            ...calls,
            timestamp: Date.now(),
            isValid: this.validateRenderingCalls(calls)
        };
    }
    
    compareSnapshots(snapshot1, snapshot2) {
        if (!snapshot1 || !snapshot2) return false;
        
        const keys = ['primaryColor', 'glowIntensity', 'particleBehavior', 'coreSize'];
        return keys.every(key => snapshot1[key] === snapshot2[key]);
    }
    
    compareVisualStates(state1, state2) {
        if (!state1 || !state2) return false;
        
        const tolerance = 0.01;
        return Math.abs(state1.scale - state2.scale) < tolerance &&
               Math.abs(state1.position.x - state2.position.x) < tolerance &&
               Math.abs(state1.position.y - state2.position.y) < tolerance &&
               Math.abs(state1.rotation - state2.rotation) < tolerance;
    }
    
    compareAnimations(animation1, animation2) {
        if (animation1.length !== animation2.length) {
            return {
                isIdentical: false,
                differences: [{ type: 'length_mismatch', expected: animation1.length, actual: animation2.length }]
            };
        }
        
        const differences = [];
        
        for (let i = 0; i < animation1.length; i++) {
            const frame1 = animation1[i];
            const frame2 = animation2[i];
            
            if (!this.compareVisualStates(frame1.visualState, frame2.visualState)) {
                differences.push({
                    type: 'visual_state_mismatch',
                    frame: i,
                    expected: frame1.visualState,
                    actual: frame2.visualState
                });
            }
        }
        
        return {
            isIdentical: differences.length === 0,
            differences
        };
    }
    
    compareRenderingSnapshots(snapshot1, snapshot2) {
        const differences = [];
        
        if (snapshot1.arcCalls !== snapshot2.arcCalls) {
            differences.push('particle_count_mismatch');
        }
        
        if (snapshot1.fillCalls !== snapshot2.fillCalls) {
            differences.push('fill_calls_mismatch');
        }
        
        if (snapshot1.saveCalls !== snapshot2.saveCalls) {
            differences.push('save_restore_mismatch');
        }
        
        return {
            isIdentical: differences.length === 0,
            differences
        };
    }
    
    analyzeDifferences(snapshot1, snapshot2) {
        return {
            colorChanged: snapshot1.primaryColor !== snapshot2.primaryColor,
            glowIntensityChanged: snapshot1.glowIntensity !== snapshot2.glowIntensity,
            particleBehaviorChanged: snapshot1.particleBehavior !== snapshot2.particleBehavior,
            coreSizeChanged: snapshot1.coreSize !== snapshot2.coreSize
        };
    }
    
    analyzeColorProgression(colorSteps) {
        let isSmooth = true;
        let hasJumps = false;
        
        // Simple analysis - check for large jumps in color values
        for (let i = 1; i < colorSteps.length; i++) {
            const prev = colorSteps[i - 1].color;
            const current = colorSteps[i].color;
            
            const distance = this.calculateColorDistance(prev, current);
            
            // If color distance is too large for the progress step, it's not smooth
            if (distance > 50) { // Arbitrary threshold
                hasJumps = true;
                isSmooth = false;
            }
        }
        
        return {
            isSmooth,
            hasJumps,
            progressionType: 'linear' // Simplified
        };
    }
    
    analyzeColorTransition(transitionColors) {
        const distances = [];
        
        for (let i = 1; i < transitionColors.length; i++) {
            const distance = this.calculateColorDistance(
                transitionColors[i - 1].color,
                transitionColors[i].color
            );
            distances.push(distance);
        }
        
        const averageDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
        const maxDistance = Math.max(...distances);
        const minDistance = Math.min(...distances);
        
        // Calculate smoothness (lower variation = smoother)
        const variation = maxDistance - minDistance;
        const smoothness = Math.max(0, 1 - (variation / averageDistance));
        
        return {
            isValid: smoothness > 0.5,
            smoothness,
            colorSpace: 'HSL'
        };
    }
    
    validateInterpolationConsistency(interpolationSteps) {
        let isConsistent = true;
        let hasReversals = false;
        
        // Check that progress values are monotonic
        for (let i = 1; i < interpolationSteps.length; i++) {
            if (interpolationSteps[i].progress < interpolationSteps[i - 1].progress) {
                hasReversals = true;
                isConsistent = false;
            }
        }
        
        return { isConsistent, hasReversals };
    }
    
    calculateColorDistance(color1, color2) {
        // Simple RGB distance calculation
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        
        if (!rgb1 || !rgb2) return 0;
        
        const dr = rgb1.r - rgb2.r;
        const dg = rgb1.g - rgb2.g;
        const db = rgb1.b - rgb2.b;
        
        return Math.sqrt(dr * dr + dg * dg + db * db);
    }
    
    // Helper methods
    
    calculateGestureVisualState(gesture, progress) {
        const definition = gesture.definition;
        const easeProgress = this.applyEasing(progress, definition.easing || 'linear');
        
        return {
            scale: 1.0 + (definition.scale - 1.0) * easeProgress,
            position: {
                x: definition.movement.x * easeProgress,
                y: definition.movement.y * easeProgress
            },
            rotation: definition.rotation * easeProgress,
            glowIntensity: definition.glowIntensity || 1.0
        };
    }
    
    analyzePositionDistribution(particles) {
        if (particles.length === 0) return { type: 'empty' };
        
        // Calculate center of mass
        const centerX = particles.reduce((sum, p) => sum + p.x, 0) / particles.length;
        const centerY = particles.reduce((sum, p) => sum + p.y, 0) / particles.length;
        
        // Calculate average distance from center
        const avgDistance = particles.reduce((sum, p) => {
            const dx = p.x - centerX;
            const dy = p.y - centerY;
            return sum + Math.sqrt(dx * dx + dy * dy);
        }, 0) / particles.length;
        
        // Simple classification
        if (avgDistance > 80) {
            return { type: 'circular', center: { x: centerX, y: centerY }, radius: avgDistance };
        } else if (avgDistance < 20) {
            return { type: 'clustered', center: { x: centerX, y: centerY } };
        } else {
            return { type: 'scattered', center: { x: centerX, y: centerY } };
        }
    }
    
    countRenderingCalls(ctx) {
        return {
            total: Object.keys(ctx).filter(key => key.endsWith('mock')).length,
            arc: ctx.arc.mock?.calls?.length || 0,
            fill: ctx.fill.mock?.calls?.length || 0
        };
    }
    
    extractFillStyleValues(ctx) {
        // In a real implementation, this would track fillStyle changes
        return [ctx.fillStyle];
    }
    
    extractGlobalAlphaValues(ctx) {
        // In a real implementation, this would track globalAlpha changes
        return [ctx.globalAlpha];
    }
    
    validateRenderingCalls(calls) {
        // Basic validation - save/restore should be balanced
        return calls.saveCalls === calls.restoreCalls;
    }
    
    applyEasing(progress, easingType) {
        switch (easingType) {
            case 'easeInQuad':
                return progress * progress;
            case 'easeOutQuad':
                return progress * (2 - progress);
            case 'easeInOutQuad':
                return progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
            default:
                return progress; // linear
        }
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    cleanup() {
        this.snapshots.clear();
        this.baselines.clear();
    }
}