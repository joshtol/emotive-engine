/**
 * Integration Tests - Full Lifecycle
 * Tests the complete lifecycle of EmotiveMascot from construction to destruction
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import EmotiveMascot from '../../src/EmotiveMascot.js';

describe('EmotiveMascot Lifecycle Integration', () => {
    let canvas;
    let mascot;

    beforeEach(() => {
        // Create canvas element
        canvas = document.createElement('canvas');
        canvas.id = 'integration-test-canvas';
        canvas.width = 800;
        canvas.height = 600;
        document.body.appendChild(canvas);
    });

    afterEach(() => {
        // Cleanup
        if (mascot) {
            try {
                mascot.stop();
            } catch (e) {
                // Ignore cleanup errors
            }
            mascot = null;
        }
        if (canvas && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
        }
    });

    describe('Full Lifecycle', () => {
        it('should complete full lifecycle: construct → start → setEmotion → stop', () => {
            // Construct
            mascot = new EmotiveMascot({
                canvasId: 'integration-test-canvas',
                emotion: 'neutral',
                particleCount: 20
            });
            expect(mascot).toBeDefined();

            // Start
            expect(() => mascot.start()).not.toThrow();

            // Change emotion
            expect(() => mascot.setEmotion('joy')).not.toThrow();

            // Stop
            expect(() => mascot.stop()).not.toThrow();
        });

        it('should handle multiple emotion transitions', () => {
            mascot = new EmotiveMascot({ canvasId: 'integration-test-canvas' });
            mascot.start();

            const emotions = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'love', 'neutral'];

            emotions.forEach(emotion => {
                expect(() => mascot.setEmotion(emotion)).not.toThrow();
            });

            mascot.stop();
        });

        it('should handle start/stop cycles', () => {
            mascot = new EmotiveMascot({ canvasId: 'integration-test-canvas' });

            // Start and stop multiple times
            expect(() => mascot.start()).not.toThrow();
            expect(() => mascot.stop()).not.toThrow();

            expect(() => mascot.start()).not.toThrow();
            expect(() => mascot.stop()).not.toThrow();

            expect(() => mascot.start()).not.toThrow();
            expect(() => mascot.stop()).not.toThrow();
        });

        it('should handle emotions while running', () => {
            mascot = new EmotiveMascot({ canvasId: 'integration-test-canvas' });
            mascot.start();

            // Quick emotion changes
            mascot.setEmotion('joy');
            mascot.setEmotion('sadness');
            mascot.setEmotion('anger');
            mascot.setEmotion('neutral');

            expect(() => mascot.stop()).not.toThrow();
        });
    });

    describe('Configuration Integration', () => {
        it('should accept and apply custom configuration', () => {
            mascot = new EmotiveMascot({
                canvasId: 'integration-test-canvas',
                emotion: 'joy',
                particleCount: 30,
                breathingRate: 0.5,
                eyeBlinkRate: 0.3
            });

            expect(() => mascot.start()).not.toThrow();
            expect(() => mascot.stop()).not.toThrow();
        });

        it('should handle minimal configuration', () => {
            mascot = new EmotiveMascot({
                canvasId: 'integration-test-canvas'
            });

            expect(() => mascot.start()).not.toThrow();
            expect(() => mascot.stop()).not.toThrow();
        });
    });

    describe('Gesture Integration', () => {
        beforeEach(() => {
            mascot = new EmotiveMascot({
                canvasId: 'integration-test-canvas'
            });
            mascot.start();
        });

        it('should trigger single gestures without errors', () => {
            const gestures = ['bounce', 'spin', 'pulse', 'shake', 'sway'];

            gestures.forEach(gesture => {
                expect(() => mascot.express(gesture)).not.toThrow();
            });
        });

        it('should handle rapid gesture succession', () => {
            expect(() => {
                mascot.express('bounce');
                mascot.express('spin');
                mascot.express('pulse');
            }).not.toThrow();
        });

        it('should handle gesture arrays', () => {
            expect(() => {
                mascot.express(['bounce', 'spin']);
                mascot.express(['pulse', 'shake', 'sway']);
            }).not.toThrow();
        });

        it('should handle gestures with emotion changes', () => {
            expect(() => {
                mascot.setEmotion('joy');
                mascot.express('bounce');

                mascot.setEmotion('sadness');
                mascot.express('sway');

                mascot.setEmotion('anger');
                mascot.express('shake');
            }).not.toThrow();
        });
    });

    describe('Emotion + Undertone Integration', () => {
        beforeEach(() => {
            mascot = new EmotiveMascot({
                canvasId: 'integration-test-canvas'
            });
            mascot.start();
        });

        it('should handle emotion with undertone', () => {
            expect(() => {
                mascot.setEmotion('joy', { undertone: 'intense' });
            }).not.toThrow();
        });

        it('should handle all undertone variations', () => {
            const undertones = ['intense', 'confident', 'nervous', 'clear', 'tired', 'subdued'];

            undertones.forEach(undertone => {
                expect(() => {
                    mascot.setEmotion('neutral', { undertone });
                }).not.toThrow();
            });
        });

        it('should handle emotion transitions with different undertones', () => {
            expect(() => {
                mascot.setEmotion('joy', { undertone: 'intense' });
                mascot.setEmotion('sadness', { undertone: 'subdued' });
                mascot.setEmotion('anger', { undertone: 'confident' });
                mascot.setEmotion('neutral', { undertone: 'clear' });
            }).not.toThrow();
        });
    });

    describe('Error Recovery', () => {
        it('should handle invalid emotion gracefully', () => {
            mascot = new EmotiveMascot({ canvasId: 'integration-test-canvas' });
            mascot.start();

            // Should not throw or crash
            expect(() => mascot.setEmotion('nonexistent-emotion')).not.toThrow();

            // Should still be functional
            expect(() => mascot.setEmotion('joy')).not.toThrow();
            expect(() => mascot.stop()).not.toThrow();
        });

        it('should handle invalid gesture gracefully', () => {
            mascot = new EmotiveMascot({ canvasId: 'integration-test-canvas' });
            mascot.start();

            // Should not throw or crash
            expect(() => mascot.express('nonexistent-gesture')).not.toThrow();

            // Should still be functional
            expect(() => mascot.express('bounce')).not.toThrow();
            expect(() => mascot.stop()).not.toThrow();
        });

        it('should handle stop before start', () => {
            mascot = new EmotiveMascot({ canvasId: 'integration-test-canvas' });

            // Stop without starting
            expect(() => mascot.stop()).not.toThrow();
        });

        it('should handle setEmotion before start', () => {
            mascot = new EmotiveMascot({ canvasId: 'integration-test-canvas' });

            // Set emotion before starting
            expect(() => mascot.setEmotion('joy')).not.toThrow();

            // Should work after starting
            expect(() => mascot.start()).not.toThrow();
            expect(() => mascot.stop()).not.toThrow();
        });
    });

    describe('Canvas Integration', () => {
        it('should work with different canvas sizes', () => {
            const sizes = [
                { width: 400, height: 300 },
                { width: 800, height: 600 },
                { width: 1920, height: 1080 },
                { width: 200, height: 200 }
            ];

            sizes.forEach(size => {
                const testCanvas = document.createElement('canvas');
                testCanvas.id = `canvas-${size.width}x${size.height}`;
                testCanvas.width = size.width;
                testCanvas.height = size.height;
                document.body.appendChild(testCanvas);

                const testMascot = new EmotiveMascot({
                    canvasId: testCanvas.id
                });

                expect(() => testMascot.start()).not.toThrow();
                expect(() => testMascot.setEmotion('joy')).not.toThrow();
                expect(() => testMascot.stop()).not.toThrow();

                document.body.removeChild(testCanvas);
            });
        });
    });

    describe('Performance Under Load', () => {
        it('should handle rapid emotion changes', () => {
            mascot = new EmotiveMascot({ canvasId: 'integration-test-canvas' });
            mascot.start();

            const emotions = ['joy', 'sadness', 'anger', 'fear'];

            // Rapid emotion changes
            for (let i = 0; i < 20; i++) {
                const emotion = emotions[i % emotions.length];
                expect(() => mascot.setEmotion(emotion)).not.toThrow();
            }

            mascot.stop();
        });

        it('should handle many gestures in succession', () => {
            mascot = new EmotiveMascot({ canvasId: 'integration-test-canvas' });
            mascot.start();

            const gestures = ['bounce', 'spin', 'pulse'];

            // Many gestures
            for (let i = 0; i < 30; i++) {
                const gesture = gestures[i % gestures.length];
                expect(() => mascot.express(gesture)).not.toThrow();
            }

            mascot.stop();
        });
    });
});
