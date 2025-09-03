/**
 * Renderer Tests - Base rendering infrastructure
 * Tests the 3-layer rendering system and emotional layer functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import Renderer from '../src/core/Renderer.js';
import CanvasManager from '../src/core/CanvasManager.js';
import ErrorBoundary from '../src/core/ErrorBoundary.js';

// Mock canvas and context
const createMockCanvas = () => {
    const canvas = {
        width: 400,
        height: 400,
        getBoundingClientRect: () => ({ width: 400, height: 400 }),
        getContext: vi.fn()
    };
    
    const ctx = {
        clearRect: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        scale: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        createRadialGradient: vi.fn(() => ({
            addColorStop: vi.fn()
        })),
        set fillStyle(value) { this._fillStyle = value; },
        get fillStyle() { return this._fillStyle; },
        set globalAlpha(value) { this._globalAlpha = value; },
        get globalAlpha() { return this._globalAlpha || 1; },
        set globalCompositeOperation(value) { this._globalCompositeOperation = value; },
        get globalCompositeOperation() { return this._globalCompositeOperation || 'source-over'; },
        set strokeStyle(value) { this._strokeStyle = value; },
        get strokeStyle() { return this._strokeStyle; },
        set lineWidth(value) { this._lineWidth = value; },
        get lineWidth() { return this._lineWidth; },
        stroke: vi.fn()
    };
    
    canvas.getContext.mockReturnValue(ctx);
    return { canvas, ctx };
};

describe('Renderer', () => {
    let renderer;
    let canvasManager;
    let errorBoundary;
    let mockCanvas;
    let mockCtx;

    beforeEach(() => {
        const mock = createMockCanvas();
        mockCanvas = mock.canvas;
        mockCtx = mock.ctx;
        
        // Mock window for CanvasManager
        global.window = {
            devicePixelRatio: 1,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
        };
        
        canvasManager = new CanvasManager(mockCanvas);
        errorBoundary = new ErrorBoundary();
        renderer = new Renderer(canvasManager, errorBoundary);
    });

    describe('Initialization', () => {
        it('should initialize with correct layer configuration', () => {
            const config = renderer.getLayerConfig();
            
            expect(config.emotional).toEqual({
                zIndex: 0,
                opacity: 1.0,
                blendMode: 'normal'
            });
            
            expect(config.gesture).toEqual({
                zIndex: 1,
                opacity: 0.0,
                blendMode: 'normal'
            });
            
            expect(config.speaking).toEqual({
                zIndex: 2,
                opacity: 0.0,
                blendMode: 'screen'
            });
        });

        it('should initialize breathing state', () => {
            const stats = renderer.getStats();
            expect(stats.breathingPhase).toBe(0);
            expect(stats.breathingTime).toBe(0);
        });

        it('should initialize empty gradient cache', () => {
            const stats = renderer.getStats();
            expect(stats.gradientCacheSize).toBe(0);
            expect(stats.maxCacheSize).toBe(20);
        });
    });

    describe('Emotional Layer Rendering', () => {
        it('should render emotional layer with correct properties', () => {
            const state = {
                properties: {
                    primaryColor: '#FFD700',
                    glowIntensity: 1.2,
                    coreSize: 1.1,
                    breathRate: 1.3,
                    breathDepth: 0.15
                },
                particleSystem: null
            };

            renderer.render(state, 16);

            // Verify canvas was cleared
            expect(mockCtx.clearRect).toHaveBeenCalled();
            
            // Verify glow rendering
            expect(mockCtx.createRadialGradient).toHaveBeenCalled();
            expect(mockCtx.arc).toHaveBeenCalled();
            expect(mockCtx.fill).toHaveBeenCalled();
        });

        it('should apply breathing animation to core size', () => {
            const state = {
                properties: {
                    primaryColor: '#FFD700',
                    glowIntensity: 1.0,
                    coreSize: 1.0,
                    breathRate: 1.0,
                    breathDepth: 0.2
                }
            };

            // Render multiple frames to advance breathing animation
            renderer.render(state, 100);
            renderer.render(state, 100);
            
            const stats = renderer.getStats();
            expect(stats.breathingTime).toBeGreaterThan(0);
            expect(Math.abs(stats.breathingPhase)).toBeLessThanOrEqual(1);
        });

        it('should cache gradients for performance', () => {
            const state = {
                properties: {
                    primaryColor: '#FFD700',
                    glowIntensity: 1.2,
                    coreSize: 1.0,
                    breathRate: 1.0,
                    breathDepth: 0.1
                }
            };

            // Render same state multiple times
            renderer.render(state, 16);
            renderer.render(state, 16);
            
            const stats = renderer.getStats();
            expect(stats.gradientCacheSize).toBeGreaterThan(0);
        });

        it('should limit gradient cache size', () => {
            const baseState = {
                properties: {
                    glowIntensity: 1.0,
                    coreSize: 1.0,
                    breathRate: 1.0,
                    breathDepth: 0.1
                }
            };

            // Render with many different colors to fill cache
            for (let i = 0; i < 25; i++) {
                const state = {
                    ...baseState,
                    properties: {
                        ...baseState.properties,
                        primaryColor: `#${i.toString(16).padStart(6, '0')}`
                    }
                };
                renderer.render(state, 16);
            }
            
            const stats = renderer.getStats();
            expect(stats.gradientCacheSize).toBeLessThanOrEqual(20);
        });
    });

    describe('Layer Management', () => {
        it('should set layer opacity correctly', () => {
            renderer.setLayerOpacity('gesture', 0.5, 0); // Immediate transition
            
            const config = renderer.getLayerConfig();
            expect(config.gesture.opacity).toBe(0.5);
        });

        it('should clamp layer opacity to valid range', () => {
            renderer.setLayerOpacity('gesture', -0.5, 0); // Immediate transition
            expect(renderer.getLayerConfig().gesture.opacity).toBe(0);
            
            renderer.setLayerOpacity('gesture', 1.5, 0); // Immediate transition
            expect(renderer.getLayerConfig().gesture.opacity).toBe(1);
        });

        it('should set layer blend mode correctly', () => {
            renderer.setLayerBlendMode('speaking', 'multiply');
            
            const config = renderer.getLayerConfig();
            expect(config.speaking.blendMode).toBe('multiply');
        });

        it('should warn for invalid layer names', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            
            renderer.setLayerOpacity('invalid', 0.5);
            expect(consoleSpy).toHaveBeenCalledWith('Unknown layer: invalid');
            
            consoleSpy.mockRestore();
        });
    });

    describe('Breathing Animation', () => {
        it('should calculate breathing scale correctly', () => {
            const properties = {
                breathRate: 1.0,
                breathDepth: 0.2
            };

            // Test at different phases
            renderer.breathingState.phase = 0; // No breathing effect
            let scale = renderer.calculateBreathingScale(properties);
            expect(scale).toBe(1.0);

            renderer.breathingState.phase = 1; // Maximum expansion
            scale = renderer.calculateBreathingScale(properties);
            expect(scale).toBe(1.2);

            renderer.breathingState.phase = -1; // Maximum contraction
            scale = renderer.calculateBreathingScale(properties);
            expect(scale).toBe(0.8);
        });

        it('should update breathing animation with deltaTime', () => {
            const properties = {
                breathRate: 2.0,
                breathDepth: 0.1
            };

            const initialTime = renderer.breathingState.time;
            renderer.updateBreathingAnimation(100, properties);
            
            expect(renderer.breathingState.time).toBeGreaterThan(initialTime);
        });

        it('should handle different breath rates', () => {
            const fastBreathing = { breathRate: 2.0, breathDepth: 0.1 };
            const slowBreathing = { breathRate: 0.5, breathDepth: 0.1 };

            renderer.updateBreathingAnimation(100, fastBreathing);
            const fastTime = renderer.breathingState.time;

            renderer.breathingState.time = 0; // Reset
            renderer.updateBreathingAnimation(100, slowBreathing);
            const slowTime = renderer.breathingState.time;

            expect(fastTime).toBeGreaterThan(slowTime);
        });
    });

    describe('Glow Rendering', () => {
        it('should create radial gradient with correct parameters', () => {
            const mockGradient = {
                addColorStop: vi.fn()
            };
            mockCtx.createRadialGradient.mockReturnValue(mockGradient);

            renderer.renderOptimizedGlow(200, 200, 40, '#FFD700', 1.2);

            expect(mockCtx.createRadialGradient).toHaveBeenCalled();
            expect(mockGradient.addColorStop).toHaveBeenCalledTimes(4);
        });

        it('should render glow with correct size and position', () => {
            renderer.renderOptimizedGlow(100, 150, 30, '#FF0000', 1.0);

            expect(mockCtx.arc).toHaveBeenCalledWith(100, 150, 90, 0, Math.PI * 2);
        });
    });

    describe('Core Rendering', () => {
        it('should render core with correct size and color', () => {
            renderer.renderCore(200, 200, 40, '#FFD700');

            // Should render main core and highlight
            expect(mockCtx.arc).toHaveBeenCalledTimes(2);
            expect(mockCtx.fill).toHaveBeenCalledTimes(2);
        });
    });

    describe('Performance and Memory', () => {
        it('should provide performance statistics', () => {
            const stats = renderer.getStats();
            
            expect(stats).toHaveProperty('gradientCacheSize');
            expect(stats).toHaveProperty('maxCacheSize');
            expect(stats).toHaveProperty('breathingPhase');
            expect(stats).toHaveProperty('breathingTime');
            expect(stats).toHaveProperty('layers');
        });

        it('should clear gradient cache on resize', () => {
            // Add something to cache
            const state = {
                properties: {
                    primaryColor: '#FFD700',
                    glowIntensity: 1.0,
                    coreSize: 1.0,
                    breathRate: 1.0,
                    breathDepth: 0.1
                }
            };
            renderer.render(state, 16);
            
            expect(renderer.getStats().gradientCacheSize).toBeGreaterThan(0);
            
            renderer.resize();
            expect(renderer.getStats().gradientCacheSize).toBe(0);
        });

        it('should clean up resources on destroy', () => {
            renderer.destroy();
            expect(renderer.getStats().gradientCacheSize).toBe(0);
        });
    });

    describe('Gesture Layer', () => {
        it('should render gesture layer when gesture is active', () => {
            const mockGestureSystem = {
                isActive: vi.fn(() => true),
                getCurrentTransform: vi.fn(() => ({
                    x: 10,
                    y: -5,
                    scale: 1.2,
                    rotation: 15,
                    glowMultiplier: 1.3
                }))
            };

            const state = {
                properties: {
                    primaryColor: '#FFD700',
                    glowIntensity: 1.0,
                    coreSize: 1.0,
                    breathRate: 1.0,
                    breathDepth: 0.1
                },
                gestureSystem: mockGestureSystem
            };

            // Force gesture layer opacity for testing
            renderer.forceGestureLayerOpacity(1.0);
            renderer.render(state, 16);

            expect(mockGestureSystem.getCurrentTransform).toHaveBeenCalled();
            expect(mockCtx.save).toHaveBeenCalled();
            expect(mockCtx.translate).toHaveBeenCalledWith(210, 195); // center + transform
            expect(mockCtx.rotate).toHaveBeenCalled();
            expect(mockCtx.scale).toHaveBeenCalledWith(1.2, 1.2);
            expect(mockCtx.restore).toHaveBeenCalled();
        });

        it('should not render gesture layer when no gesture is active', () => {
            const mockGestureSystem = {
                isActive: vi.fn(() => false),
                getCurrentTransform: vi.fn(() => null)
            };

            const state = {
                properties: {
                    primaryColor: '#FFD700',
                    glowIntensity: 1.0,
                    coreSize: 1.0,
                    breathRate: 1.0,
                    breathDepth: 0.1
                },
                gestureSystem: mockGestureSystem
            };

            renderer.render(state, 16);

            expect(mockGestureSystem.getCurrentTransform).not.toHaveBeenCalled();
        });

        it('should auto-manage gesture layer opacity', () => {
            const mockGestureSystem = {
                isActive: vi.fn(() => true),
                getCurrentTransform: vi.fn(() => ({ x: 0, y: 0, scale: 1, rotation: 0, glowMultiplier: 1 }))
            };

            const state = {
                properties: {
                    primaryColor: '#FFD700',
                    glowIntensity: 1.0,
                    coreSize: 1.0,
                    breathRate: 1.0,
                    breathDepth: 0.1
                },
                gestureSystem: mockGestureSystem
            };

            // Start with gesture layer at 0 opacity
            renderer.forceGestureLayerOpacity(0.0);
            
            // Render should trigger opacity increase
            renderer.render(state, 16);
            
            const stats = renderer.getGestureLayerStats();
            expect(stats.hasActiveTransition).toBe(true);
        });

        it('should apply gesture glow multiplier correctly', () => {
            const mockGestureSystem = {
                isActive: vi.fn(() => true),
                getCurrentTransform: vi.fn(() => ({
                    x: 0,
                    y: 0,
                    scale: 1,
                    rotation: 0,
                    glowMultiplier: 2.0
                }))
            };

            const state = {
                properties: {
                    primaryColor: '#FFD700',
                    glowIntensity: 1.0,
                    coreSize: 1.0,
                    breathRate: 1.0,
                    breathDepth: 0.1
                },
                gestureSystem: mockGestureSystem
            };

            renderer.forceGestureLayerOpacity(1.0);
            renderer.render(state, 16);

            // Verify glow was rendered with multiplied intensity
            expect(mockCtx.createRadialGradient).toHaveBeenCalled();
        });
    });

    describe('Layer Transitions', () => {
        it('should smoothly transition layer opacity', () => {
            // Mock performance.now for consistent timing
            const originalNow = performance.now;
            let mockTime = 1000;
            performance.now = vi.fn(() => mockTime);
            
            renderer.setLayerOpacity('gesture', 0.8, 100);
            
            const stats = renderer.getGestureLayerStats();
            expect(stats.hasActiveTransition).toBe(true);
            
            // Simulate time passing (50ms)
            mockTime += 50;
            renderer.updateLayerTransitions(16);
            
            const midStats = renderer.getGestureLayerStats();
            expect(midStats.opacity).toBeGreaterThan(0);
            expect(midStats.opacity).toBeLessThan(0.8);
            
            // Restore original performance.now
            performance.now = originalNow;
        });

        it('should complete transitions correctly', () => {
            // Mock performance.now for consistent timing
            const originalNow = performance.now;
            let mockTime = 1000;
            performance.now = vi.fn(() => mockTime);
            
            renderer.setLayerOpacity('gesture', 0.5, 50);
            
            // Simulate enough time for completion (60ms > 50ms duration)
            mockTime += 60;
            renderer.updateLayerTransitions(16);
            
            const stats = renderer.getGestureLayerStats();
            expect(stats.opacity).toBe(0.5);
            expect(stats.hasActiveTransition).toBe(false);
            
            // Restore original performance.now
            performance.now = originalNow;
        });

        it('should handle immediate transitions when duration is 0', () => {
            renderer.setLayerOpacity('gesture', 0.7, 0);
            
            const stats = renderer.getGestureLayerStats();
            expect(stats.opacity).toBe(0.7);
            expect(stats.hasActiveTransition).toBe(false);
        });
    });

    describe('Gesture Events', () => {
        it('should handle gesture start events', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            
            renderer.onGestureStart('pulse');
            
            expect(consoleSpy).toHaveBeenCalledWith('Gesture started: pulse');
            
            const stats = renderer.getGestureLayerStats();
            expect(stats.hasActiveTransition).toBe(true);
            
            consoleSpy.mockRestore();
        });

        it('should handle gesture completion events', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            
            renderer.onGestureComplete('bounce');
            
            expect(consoleSpy).toHaveBeenCalledWith('Gesture completed: bounce');
            
            const stats = renderer.getGestureLayerStats();
            expect(stats.hasActiveTransition).toBe(true);
            
            consoleSpy.mockRestore();
        });
    });

    describe('Speaking Layer', () => {
        it('should render speaking layer when speech is active', () => {
            const state = {
                properties: {
                    primaryColor: '#FFD700',
                    glowIntensity: 1.0,
                    coreSize: 1.0,
                    breathRate: 1.0,
                    breathDepth: 0.1
                },
                speaking: true,
                audioLevel: 0.5
            };

            renderer.forceSpeakingLayerOpacity(1.0);
            renderer.render(state, 16);

            // Verify speech-reactive rendering occurred
            expect(mockCtx.createRadialGradient).toHaveBeenCalled();
            expect(mockCtx.arc).toHaveBeenCalled();
        });

        it('should not render speaking layer when not speaking', () => {
            const state = {
                properties: {
                    primaryColor: '#FFD700',
                    glowIntensity: 1.0,
                    coreSize: 1.0,
                    breathRate: 1.0,
                    breathDepth: 0.1
                },
                speaking: false,
                audioLevel: 0
            };

            renderer.render(state, 16);

            // Speaking layer should not be rendered
            const stats = renderer.getSpeakingLayerStats();
            expect(stats.opacity).toBe(0);
        });

        it('should scale core size based on audio level', () => {
            const state = {
                properties: {
                    primaryColor: '#FFD700',
                    glowIntensity: 1.0,
                    coreSize: 1.0,
                    breathRate: 1.0,
                    breathDepth: 0.1
                },
                speaking: true,
                audioLevel: 1.0 // Maximum audio level
            };

            renderer.forceSpeakingLayerOpacity(1.0);
            renderer.render(state, 16);

            // Verify audio-reactive effects were applied
            expect(mockCtx.arc).toHaveBeenCalled();
        });

        it('should auto-manage speaking layer opacity', () => {
            const state = {
                properties: {
                    primaryColor: '#FFD700',
                    glowIntensity: 1.0,
                    coreSize: 1.0,
                    breathRate: 1.0,
                    breathDepth: 0.1
                },
                speaking: true,
                audioLevel: 0.3
            };

            // Start with speaking layer at 0 opacity
            renderer.forceSpeakingLayerOpacity(0.0);
            
            // Render should trigger opacity increase
            renderer.render(state, 16);
            
            const stats = renderer.getSpeakingLayerStats();
            expect(stats.hasActiveTransition).toBe(true);
        });

        it('should detect volume spikes and trigger pulse gestures', () => {
            const mockGestureSystem = {
                isActive: vi.fn(() => false),
                execute: vi.fn(() => true)
            };

            const state = {
                properties: {
                    primaryColor: '#FFD700',
                    glowIntensity: 1.0,
                    coreSize: 1.0,
                    breathRate: 1.0,
                    breathDepth: 0.1
                },
                speaking: true,
                audioLevel: 0.2,
                gestureSystem: mockGestureSystem,
                emotion: 'joy'
            };

            // Build up audio level history with consistent low levels
            renderer.render(state, 16);
            renderer.render(state, 16);
            renderer.render(state, 16);

            // Create significant volume spike (more than 1.5x increase)
            state.audioLevel = 0.35; // 0.35 > 0.2 * 1.5 (0.3)
            renderer.render(state, 16);

            expect(mockGestureSystem.execute).toHaveBeenCalledWith('pulse', { emotion: 'joy' });
        });

        it('should render audio-reactive outer ring at high levels', () => {
            const state = {
                properties: {
                    primaryColor: '#FFD700',
                    glowIntensity: 1.0,
                    coreSize: 1.0,
                    breathRate: 1.0,
                    breathDepth: 0.1
                },
                speaking: true,
                audioLevel: 0.8 // High audio level
            };

            renderer.forceSpeakingLayerOpacity(1.0);
            renderer.render(state, 16);

            // Verify stroke was called for outer ring
            expect(mockCtx.stroke).toHaveBeenCalled();
        });
    });

    describe('Speech Events', () => {
        it('should handle speech start events', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            
            renderer.onSpeechStart({});
            
            expect(consoleSpy).toHaveBeenCalledWith('Speech started - speaking layer activated');
            
            const stats = renderer.getSpeakingLayerStats();
            expect(stats.hasActiveTransition).toBe(true);
            
            consoleSpy.mockRestore();
        });

        it('should handle speech stop events', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            
            renderer.onSpeechStop();
            
            expect(consoleSpy).toHaveBeenCalledWith('Speech stopped - returning to base state');
            
            const stats = renderer.getSpeakingLayerStats();
            expect(stats.hasActiveTransition).toBe(true);
            expect(stats.audioLevelHistoryLength).toBe(0);
            
            consoleSpy.mockRestore();
        });
    });

    describe('Audio Level Management', () => {
        it('should update and clamp audio levels correctly', () => {
            renderer.updateAudioLevel(0.5);
            expect(renderer.getCurrentAudioLevel()).toBe(0.5);

            renderer.updateAudioLevel(-0.1);
            expect(renderer.getCurrentAudioLevel()).toBe(0);

            renderer.updateAudioLevel(1.5);
            expect(renderer.getCurrentAudioLevel()).toBe(1);
        });

        it('should provide speaking layer statistics', () => {
            renderer.updateAudioLevel(0.7);
            const stats = renderer.getSpeakingLayerStats();
            
            expect(stats).toHaveProperty('opacity');
            expect(stats).toHaveProperty('blendMode');
            expect(stats).toHaveProperty('hasActiveTransition');
            expect(stats).toHaveProperty('currentAudioLevel');
            expect(stats).toHaveProperty('audioLevelHistoryLength');
            expect(stats.currentAudioLevel).toBe(0.7);
        });
    });

    describe('Error Handling', () => {
        it('should handle rendering errors gracefully', () => {
            const errorRenderer = new Renderer(canvasManager, errorBoundary);
            
            // Mock an error in context operations
            mockCtx.arc.mockImplementation(() => {
                throw new Error('Canvas error');
            });

            // Should not throw
            expect(() => {
                const state = {
                    properties: {
                        primaryColor: '#FFD700',
                        glowIntensity: 1.0,
                        coreSize: 1.0,
                        breathRate: 1.0,
                        breathDepth: 0.1
                    }
                };
                errorRenderer.render(state, 16);
            }).not.toThrow();
        });
    });
});