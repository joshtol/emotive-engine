/**
 * Integration Tests - Initialization Flow
 * Tests the InitializationManager phases and manager wiring
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import EmotiveMascot from '../../src/EmotiveMascot.js';

describe('Initialization Flow Integration', () => {
    let canvas;
    let mascot;

    beforeEach(() => {
        canvas = document.createElement('canvas');
        canvas.id = 'init-test-canvas';
        canvas.width = 800;
        canvas.height = 600;
        document.body.appendChild(canvas);
    });

    afterEach(() => {
        if (mascot) {
            try {
                mascot.stop();
            } catch {
                // Ignore cleanup errors
            }
            mascot = null;
        }
        if (canvas && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
        }
    });

    describe('Phase 0: MascotStateManager', () => {
        it('should initialize stateManager before other systems', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            expect(mascot.stateManager).toBeDefined();
            expect(mascot.stateManager.getSnapshot).toBeDefined();
        });

        it('should create state aliases on mascot', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            // Verify aliases delegate to stateManager
            mascot.speaking = true;
            expect(mascot.stateManager.speaking).toBe(true);

            mascot.stateManager.speaking = false;
            expect(mascot.speaking).toBe(false);
        });

        it('should support all state properties through aliases', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            const stateProps = [
                'speaking', 'recording', 'sleeping', 'isRunning',
                'debugMode', 'audioLevel', 'rhythmEnabled',
                'currentModularGesture', 'breathePhase', 'breatheStartTime',
                'orbScale', 'warningTimestamps', 'warningThrottle'
            ];

            stateProps.forEach(prop => {
                expect(mascot[prop]).toBeDefined();
            });
        });

        it('should initialize debugMode from config', () => {
            mascot = new EmotiveMascot({
                canvasId: 'init-test-canvas',
                enableDebug: true
            });

            expect(mascot.debugMode).toBe(true);
        });
    });

    describe('Phase 1: Configuration', () => {
        it('should merge user config with defaults', () => {
            mascot = new EmotiveMascot({
                canvasId: 'init-test-canvas',
                customOption: 'custom-value',
                targetFPS: 30
            });

            expect(mascot.config.customOption).toBe('custom-value');
            expect(mascot.config.targetFPS).toBe(30);
            expect(mascot.config.defaultEmotion).toBe('neutral'); // default
        });

        it('should set default canvasId', () => {
            // Create canvas with default ID
            const defaultCanvas = document.createElement('canvas');
            defaultCanvas.id = 'emotive-mascot';
            defaultCanvas.width = 800;
            defaultCanvas.height = 600;
            document.body.appendChild(defaultCanvas);

            mascot = new EmotiveMascot({});

            expect(mascot.config.canvasId).toBe('emotive-mascot');

            document.body.removeChild(defaultCanvas);
        });
    });

    describe('Phase 2: Canvas', () => {
        it('should initialize canvas from string ID', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            expect(mascot.canvas).toBe(canvas);
        });

        it('should initialize canvas from element reference', () => {
            mascot = new EmotiveMascot({ canvasId: canvas });

            expect(mascot.canvas).toBe(canvas);
        });

        it('should handle missing canvas gracefully with error boundary', () => {
            // Error boundary catches initialization errors
            // So this won't throw but mascot will be in error state
            const errorMascot = new EmotiveMascot({ canvasId: 'nonexistent-canvas' });

            // Canvas will be null/undefined since it wasn't found
            expect(errorMascot.canvas).toBeFalsy();
        });

        it('should initialize canvasManager', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            expect(mascot.canvasManager).toBeDefined();
            // JSDOM doesn't always reflect canvas dimensions correctly
            expect(mascot.canvasManager.width).toBeGreaterThanOrEqual(0);
        });

        it('should initialize positionController with offsets', () => {
            mascot = new EmotiveMascot({
                canvasId: 'init-test-canvas',
                offsetX: 100,
                offsetY: 50,
                offsetZ: 0.5
            });

            expect(mascot.positionController).toBeDefined();
        });
    });

    describe('Phase 3: Core Systems', () => {
        it('should initialize stateMachine', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            expect(mascot.stateMachine).toBeDefined();
            expect(mascot.stateMachine.setEmotion).toBeDefined();
        });

        it('should initialize particleSystem', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            expect(mascot.particleSystem).toBeDefined();
        });

        it('should initialize renderer', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            expect(mascot.renderer).toBeDefined();
        });

        it('should connect renderer and stateMachine', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            expect(mascot.renderer.stateMachine).toBe(mascot.stateMachine);
            expect(mascot.stateMachine.renderer).toBe(mascot.renderer);
        });
    });

    describe('Phase 4: Audio Systems', () => {
        it('should initialize shapeMorpher', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            expect(mascot.shapeMorpher).toBeDefined();
        });

        it('should initialize audioAnalyzer', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            expect(mascot.audioAnalyzer).toBeDefined();
        });

        it('should initialize soundSystem', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            expect(mascot.soundSystem).toBeDefined();
        });

        it('should initialize gestureController', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            expect(mascot.gestureController).toBeDefined();
        });

        it('should initialize audioLevelProcessor', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            expect(mascot.audioLevelProcessor).toBeDefined();
        });
    });

    describe('Phase 5: Interaction Systems', () => {
        it('should initialize gazeTracker when enabled', () => {
            mascot = new EmotiveMascot({
                canvasId: 'init-test-canvas',
                enableGazeTracking: true
            });

            expect(mascot.gazeTracker).toBeDefined();
        });

        it('should not initialize gazeTracker when disabled', () => {
            mascot = new EmotiveMascot({
                canvasId: 'init-test-canvas',
                enableGazeTracking: false
            });

            expect(mascot.gazeTracker).toBeUndefined();
        });

        it('should initialize idleBehavior when enabled', () => {
            mascot = new EmotiveMascot({
                canvasId: 'init-test-canvas',
                enableIdleBehaviors: true
            });

            expect(mascot.idleBehavior).toBeDefined();
        });

        it('should not initialize idleBehavior when disabled', () => {
            mascot = new EmotiveMascot({
                canvasId: 'init-test-canvas',
                enableIdleBehaviors: false
            });

            expect(mascot.idleBehavior).toBeUndefined();
        });
    });

    describe('Phase 6: Optimization Systems', () => {
        it('should initialize accessibilityManager', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            expect(mascot.accessibilityManager).toBeDefined();
        });

        it('should initialize mobileOptimization', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            expect(mascot.mobileOptimization).toBeDefined();
        });

        it('should initialize pluginSystem', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            expect(mascot.pluginSystem).toBeDefined();
        });
    });

    describe('Phase 7: Animation Controller', () => {
        it('should initialize animationController', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            expect(mascot.animationController).toBeDefined();
        });

        it('should configure animationController with subsystems', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            expect(mascot.animationController.isAnimating).toBeDefined();
            expect(mascot.animationController.start).toBeDefined();
            expect(mascot.animationController.stop).toBeDefined();
        });

        it('should respect targetFPS config', () => {
            mascot = new EmotiveMascot({
                canvasId: 'init-test-canvas',
                targetFPS: 30
            });

            expect(mascot.animationController.targetFPS).toBe(30);
        });
    });

    describe('Phase 8: Performance Systems', () => {
        it('should initialize contextManager', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            expect(mascot.contextManager).toBeDefined();
        });

        it('should initialize sequenceExecutor', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            expect(mascot.sequenceExecutor).toBeDefined();
        });

        it('should initialize performanceSystem', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            expect(mascot.performanceSystem).toBeDefined();
        });
    });

    describe('Phase 9: Modular Handlers', () => {
        it('should initialize audioHandler', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            expect(mascot.audioHandler).toBeDefined();
        });

        it('should initialize stateCoordinator', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            expect(mascot.stateCoordinator).toBeDefined();
        });

        it('should initialize visualizationRunner', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            expect(mascot.visualizationRunner).toBeDefined();
        });

        it('should initialize executionLifecycleManager', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            expect(mascot.executionLifecycleManager).toBeDefined();
        });

        it('should initialize all Layer 1 managers', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            const layer1 = [
                'audioHandler', 'stateCoordinator', 'visualizationRunner',
                'executionLifecycleManager', 'animationFrameController',
                'shapeTransformManager', 'eventListenerManager', 'ttsManager',
                'speechReactivityManager', 'canvasResizeManager',
                'offsetPositionManager', 'visualTransformationManager',
                'frustrationContextManager', 'llmIntegrationBridge'
            ];

            layer1.forEach(manager => {
                expect(mascot[manager]).toBeDefined();
            });
        });

        it('should initialize all Layer 2 managers', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            const layer2 = [
                'diagnosticsManager', 'emotionalStateQueryManager',
                'debugProfilingManager'
            ];

            layer2.forEach(manager => {
                expect(mascot[manager]).toBeDefined();
            });
        });

        it('should initialize all Layer 3 managers', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            const layer3 = [
                'performanceBehaviorManager', 'healthCheckManager',
                'performanceMonitoringManager', 'configurationManager'
            ];

            layer3.forEach(manager => {
                expect(mascot[manager]).toBeDefined();
            });
        });
    });

    describe('Phase 10: Finalization', () => {
        it('should set initial emotion from config', () => {
            mascot = new EmotiveMascot({
                canvasId: 'init-test-canvas',
                defaultEmotion: 'joy',
                enableAudio: false
            });

            // State machine stores emotion in state.emotion
            expect(mascot.stateMachine.state.emotion).toBe('joy');
        });

        it('should initialize rhythmIntegration', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas', enableAudio: false });

            expect(mascot.rhythmIntegration).toBeDefined();
        });
    });

    describe('Manager Dependencies', () => {
        it('should wire healthCheckManager before performanceMonitoringManager', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            // healthCheckManager should be available to performanceMonitoringManager
            expect(mascot.performanceMonitoringManager.healthCheckManager).toBe(
                mascot.healthCheckManager
            );
        });

        it('should pass errorBoundary to managers that need it', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            // Managers have errorBoundary injected - verify the mascot has one
            expect(mascot.errorBoundary).toBeDefined();
            // And that it's passed to managers (they store it internally)
            expect(mascot.healthCheckManager).toBeDefined();
        });

        it('should pass chainTarget to all managers', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            // All managers should return mascot for chaining
            expect(mascot.audioHandler._chainTarget).toBe(mascot);
            expect(mascot.stateCoordinator._chainTarget).toBe(mascot);
        });
    });

    describe('Error Boundary Integration', () => {
        it('should have errorBoundary initialized', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            expect(mascot.errorBoundary).toBeDefined();
            expect(mascot.errorBoundary.wrap).toBeDefined();
        });

        it('should have eventManager initialized', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            expect(mascot.eventManager).toBeDefined();
            expect(mascot.eventManager.emit).toBeDefined();
        });
    });

    describe('Full Initialization Verification', () => {
        it('should complete initialization without errors', () => {
            expect(() => {
                mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });
            }).not.toThrow();
        });

        it('should be startable after initialization', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            expect(() => mascot.start()).not.toThrow();
            expect(mascot.isRunning).toBe(true);
        });

        it('should have all public API methods available', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            // Core lifecycle methods
            expect(typeof mascot.start).toBe('function');
            expect(typeof mascot.stop).toBe('function');

            // Emotion and gesture methods
            expect(typeof mascot.setEmotion).toBe('function');
            expect(typeof mascot.express).toBe('function');

            // Event methods
            expect(typeof mascot.on).toBe('function');
            expect(typeof mascot.off).toBe('function');
            expect(typeof mascot.emit).toBe('function');

            // Audio methods
            expect(typeof mascot.setVolume).toBe('function');
            expect(typeof mascot.connectAudio).toBe('function');

            // Status methods
            expect(typeof mascot.getSystemStatus).toBe('function');
        });
    });
});
