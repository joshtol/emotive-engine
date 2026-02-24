// @vitest-environment jsdom
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

    describe('State Aliases', () => {
        it('should delegate state properties to stateManager', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            // Two-way binding: mascot property → stateManager
            mascot.speaking = true;
            expect(mascot.stateManager.speaking).toBe(true);

            // stateManager → mascot property
            mascot.stateManager.speaking = false;
            expect(mascot.speaking).toBe(false);
        });

        it('should initialize debugMode from config', () => {
            mascot = new EmotiveMascot({
                canvasId: 'init-test-canvas',
                enableDebug: true
            });

            expect(mascot.debugMode).toBe(true);
        });
    });

    describe('Configuration', () => {
        it('should merge user config with defaults', () => {
            mascot = new EmotiveMascot({
                canvasId: 'init-test-canvas',
                customOption: 'custom-value',
                targetFPS: 30
            });

            expect(mascot.config.customOption).toBe('custom-value');
            expect(mascot.config.targetFPS).toBe(30);
            expect(mascot.config.defaultEmotion).toBe('neutral');
        });

        it('should respect targetFPS config', () => {
            mascot = new EmotiveMascot({
                canvasId: 'init-test-canvas',
                targetFPS: 30
            });

            expect(mascot.animationController.targetFPS).toBe(30);
        });
    });

    describe('Canvas Resolution', () => {
        it('should resolve canvas from string ID', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });
            expect(mascot.canvas).toBe(canvas);
        });

        it('should resolve canvas from element reference', () => {
            mascot = new EmotiveMascot({ canvasId: canvas });
            expect(mascot.canvas).toBe(canvas);
        });

        it('should handle missing canvas gracefully', () => {
            const errorMascot = new EmotiveMascot({ canvasId: 'nonexistent-canvas' });
            expect(errorMascot.canvas).toBeFalsy();
        });
    });

    describe('System Wiring', () => {
        it('should cross-wire renderer and stateMachine', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            expect(mascot.renderer.stateMachine).toBe(mascot.stateMachine);
            expect(mascot.stateMachine.renderer).toBe(mascot.renderer);
        });

        it('should wire healthCheckManager into performanceMonitoringManager', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            expect(mascot.performanceMonitoringManager.healthCheckManager).toBe(
                mascot.healthCheckManager
            );
        });

        it('should pass chainTarget to modular managers', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            expect(mascot.audioHandler._chainTarget).toBe(mascot);
            expect(mascot.stateCoordinator._chainTarget).toBe(mascot);
        });
    });

    describe('Conditional Initialization', () => {
        it('should initialize gazeTracker only when enabled', () => {
            const withGaze = new EmotiveMascot({
                canvasId: 'init-test-canvas',
                enableGazeTracking: true
            });
            expect(withGaze.gazeTracker).toBeDefined();

            const withoutGaze = new EmotiveMascot({
                canvasId: 'init-test-canvas',
                enableGazeTracking: false
            });
            expect(withoutGaze.gazeTracker).toBeUndefined();
        });

        it('should initialize idleBehavior only when enabled', () => {
            const withIdle = new EmotiveMascot({
                canvasId: 'init-test-canvas',
                enableIdleBehaviors: true
            });
            expect(withIdle.idleBehavior).toBeDefined();

            const withoutIdle = new EmotiveMascot({
                canvasId: 'init-test-canvas',
                enableIdleBehaviors: false
            });
            expect(withoutIdle.idleBehavior).toBeUndefined();
        });
    });

    describe('All Managers Initialized', () => {
        it('should initialize all required managers across all phases', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            const requiredManagers = [
                // Phase 0: State
                'stateManager',
                // Phase 2: Canvas
                'canvasManager', 'positionController',
                // Phase 3: Core
                'stateMachine', 'particleSystem', 'renderer',
                // Phase 4: Audio
                'shapeMorpher', 'audioAnalyzer', 'soundSystem',
                'gestureController', 'audioLevelProcessor',
                // Phase 6: Optimization
                'accessibilityManager', 'mobileOptimization', 'pluginSystem',
                // Phase 7: Animation
                'animationController',
                // Phase 8: Performance
                'contextManager', 'sequenceExecutor', 'performanceSystem',
                // Phase 9: Layer 1
                'audioHandler', 'stateCoordinator', 'visualizationRunner',
                'executionLifecycleManager', 'animationFrameController',
                'shapeTransformManager', 'eventListenerManager', 'ttsManager',
                'speechReactivityManager', 'canvasResizeManager',
                'offsetPositionManager', 'visualTransformationManager',
                'frustrationContextManager', 'llmIntegrationBridge',
                // Phase 9: Layer 2
                'diagnosticsManager', 'emotionalStateQueryManager',
                'debugProfilingManager',
                // Phase 9: Layer 3
                'performanceBehaviorManager', 'healthCheckManager',
                'performanceMonitoringManager', 'configurationManager',
                // Infrastructure
                'errorBoundary', 'eventManager'
            ];

            const missing = requiredManagers.filter(m => !mascot[m]);
            expect(missing).toEqual([]);
        });
    });

    describe('Finalization', () => {
        it('should set initial emotion from config', () => {
            mascot = new EmotiveMascot({
                canvasId: 'init-test-canvas',
                defaultEmotion: 'joy',
                enableAudio: false
            });

            expect(mascot.stateMachine.state.emotion).toBe('joy');
        });

        it('should initialize rhythmIntegration', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas', enableAudio: false });
            expect(mascot.rhythmIntegration).toBeDefined();
        });
    });

    describe('Full Lifecycle', () => {
        it('should be startable after initialization', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            expect(() => mascot.start()).not.toThrow();
            expect(mascot.isRunning).toBe(true);
        });

        it('should expose all public API methods', () => {
            mascot = new EmotiveMascot({ canvasId: 'init-test-canvas' });

            const apiMethods = [
                'start', 'stop', 'setEmotion', 'express',
                'on', 'off', 'emit',
                'setVolume', 'connectAudio', 'getSystemStatus'
            ];

            const missing = apiMethods.filter(m => typeof mascot[m] !== 'function');
            expect(missing).toEqual([]);
        });
    });
});
