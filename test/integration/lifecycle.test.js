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

    describe('Multi-Instance Independence', () => {
        let canvas1, canvas2;
        let mascot1, mascot2;

        beforeEach(() => {
            // Create two separate canvases
            canvas1 = document.createElement('canvas');
            canvas1.id = 'multi-test-canvas-1';
            canvas1.width = 400;
            canvas1.height = 300;
            document.body.appendChild(canvas1);

            canvas2 = document.createElement('canvas');
            canvas2.id = 'multi-test-canvas-2';
            canvas2.width = 400;
            canvas2.height = 300;
            document.body.appendChild(canvas2);
        });

        afterEach(() => {
            // Cleanup both mascots
            [mascot1, mascot2].forEach(m => {
                if (m) {
                    try { m.stop(); } catch (e) { /* ignore */ }
                }
            });
            mascot1 = mascot2 = null;

            // Remove canvases
            [canvas1, canvas2].forEach(c => {
                if (c && c.parentNode) {
                    c.parentNode.removeChild(c);
                }
            });
        });

        it('should run two mascots simultaneously', () => {
            mascot1 = new EmotiveMascot({ canvasId: 'multi-test-canvas-1' });
            mascot2 = new EmotiveMascot({ canvasId: 'multi-test-canvas-2' });

            expect(() => mascot1.start()).not.toThrow();
            expect(() => mascot2.start()).not.toThrow();

            // Both should be running
            expect(() => mascot1.setEmotion('joy')).not.toThrow();
            expect(() => mascot2.setEmotion('sadness')).not.toThrow();

            mascot1.stop();
            mascot2.stop();
        });

        it('should maintain independent emotional states', () => {
            mascot1 = new EmotiveMascot({ canvasId: 'multi-test-canvas-1', emotion: 'joy' });
            mascot2 = new EmotiveMascot({ canvasId: 'multi-test-canvas-2', emotion: 'sadness' });

            mascot1.start();
            mascot2.start();

            // Change one without affecting the other
            mascot1.setEmotion('anger');

            // mascot2 should still work independently
            expect(() => mascot2.express('bounce')).not.toThrow();

            mascot1.stop();
            mascot2.stop();
        });

        it('should stop independently without affecting the other', () => {
            mascot1 = new EmotiveMascot({ canvasId: 'multi-test-canvas-1' });
            mascot2 = new EmotiveMascot({ canvasId: 'multi-test-canvas-2' });

            mascot1.start();
            mascot2.start();

            // Stop mascot1
            mascot1.stop();

            // mascot2 should still work
            expect(() => mascot2.setEmotion('excited')).not.toThrow();
            expect(() => mascot2.express('spin')).not.toThrow();

            mascot2.stop();
        });

        it('should handle destroy independently', () => {
            mascot1 = new EmotiveMascot({ canvasId: 'multi-test-canvas-1' });
            mascot2 = new EmotiveMascot({ canvasId: 'multi-test-canvas-2' });

            mascot1.start();
            mascot2.start();

            // Destroy mascot1 completely
            mascot1.stop();
            mascot1 = null;

            // mascot2 should still function
            expect(() => mascot2.setEmotion('love')).not.toThrow();
            expect(() => mascot2.stop()).not.toThrow();
        });

        it('should handle rapid switching between instances', () => {
            mascot1 = new EmotiveMascot({ canvasId: 'multi-test-canvas-1' });
            mascot2 = new EmotiveMascot({ canvasId: 'multi-test-canvas-2' });

            mascot1.start();
            mascot2.start();

            // Rapid alternating commands
            for (let i = 0; i < 10; i++) {
                mascot1.setEmotion(i % 2 === 0 ? 'joy' : 'sadness');
                mascot2.setEmotion(i % 2 === 0 ? 'anger' : 'fear');
                mascot1.express('bounce');
                mascot2.express('pulse');
            }

            mascot1.stop();
            mascot2.stop();
        });
    });

    describe('Visibility Change Handling', () => {
        it('should handle visibility hidden event', () => {
            mascot = new EmotiveMascot({ canvasId: 'integration-test-canvas' });
            mascot.start();

            // Simulate visibility change to hidden
            expect(() => {
                const event = new Event('visibilitychange');
                Object.defineProperty(document, 'hidden', { value: true, writable: true });
                document.dispatchEvent(event);
            }).not.toThrow();

            // Mascot should still be in a valid state
            expect(() => mascot.setEmotion('neutral')).not.toThrow();
        });

        it('should handle visibility visible event after hidden', () => {
            mascot = new EmotiveMascot({ canvasId: 'integration-test-canvas' });
            mascot.start();

            // Simulate visibility change to hidden then visible
            Object.defineProperty(document, 'hidden', { value: true, writable: true });
            document.dispatchEvent(new Event('visibilitychange'));

            Object.defineProperty(document, 'hidden', { value: false, writable: true });
            document.dispatchEvent(new Event('visibilitychange'));

            // Mascot should resume normally
            expect(() => mascot.setEmotion('joy')).not.toThrow();
            expect(() => mascot.express('bounce')).not.toThrow();

            mascot.stop();
        });

        it('should handle multiple visibility toggles', () => {
            mascot = new EmotiveMascot({ canvasId: 'integration-test-canvas' });
            mascot.start();

            // Toggle visibility multiple times
            for (let i = 0; i < 5; i++) {
                Object.defineProperty(document, 'hidden', { value: true, writable: true });
                document.dispatchEvent(new Event('visibilitychange'));

                Object.defineProperty(document, 'hidden', { value: false, writable: true });
                document.dispatchEvent(new Event('visibilitychange'));
            }

            // Should still function
            expect(() => mascot.setEmotion('calm')).not.toThrow();
            mascot.stop();
        });
    });

    describe('Audio Connection', () => {
        it('should handle connectAudio with mock element', () => {
            mascot = new EmotiveMascot({ canvasId: 'integration-test-canvas' });
            mascot.start();

            // Create mock audio element
            const mockAudio = document.createElement('audio');
            mockAudio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

            // connectAudio should not throw
            expect(() => mascot.connectAudio(mockAudio)).not.toThrow();

            mascot.stop();
        });

        it('should handle disconnectAudio', () => {
            mascot = new EmotiveMascot({ canvasId: 'integration-test-canvas' });
            mascot.start();

            const mockAudio = document.createElement('audio');

            // Connect then disconnect
            mascot.connectAudio(mockAudio);
            expect(() => mascot.disconnectAudio(mockAudio)).not.toThrow();

            mascot.stop();
        });

        it('should handle disconnectAudio without prior connection', () => {
            mascot = new EmotiveMascot({ canvasId: 'integration-test-canvas' });
            mascot.start();

            // Disconnect without connecting should not throw
            expect(() => mascot.disconnectAudio()).not.toThrow();

            mascot.stop();
        });

        it('should handle multiple connect/disconnect cycles', () => {
            mascot = new EmotiveMascot({ canvasId: 'integration-test-canvas' });
            mascot.start();

            const mockAudio = document.createElement('audio');

            for (let i = 0; i < 3; i++) {
                expect(() => mascot.connectAudio(mockAudio)).not.toThrow();
                expect(() => mascot.disconnectAudio(mockAudio)).not.toThrow();
            }

            mascot.stop();
        });
    });
});
