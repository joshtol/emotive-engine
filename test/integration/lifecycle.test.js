// @vitest-environment jsdom
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
        canvas = document.createElement('canvas');
        canvas.id = 'integration-test-canvas';
        canvas.width = 800;
        canvas.height = 600;
        document.body.appendChild(canvas);
    });

    afterEach(() => {
        if (mascot) {
            try { mascot.stop(); } catch { /* ignore */ }
            mascot = null;
        }
        if (canvas && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
        }
    });

    describe('Full Lifecycle', () => {
        it('should complete construct → start → setEmotion → stop', () => {
            mascot = new EmotiveMascot({
                canvasId: 'integration-test-canvas',
                particleCount: 20
            });

            mascot.start();
            expect(mascot.isRunning).toBe(true);

            mascot.setEmotion('joy');
            expect(mascot.stateMachine.state.emotion).toBe('joy');

            mascot.stop();
            expect(mascot.isRunning).toBe(false);
        });

        it('should handle start/stop cycles cleanly', () => {
            mascot = new EmotiveMascot({ canvasId: 'integration-test-canvas' });

            for (let i = 0; i < 3; i++) {
                mascot.start();
                expect(mascot.isRunning).toBe(true);
                mascot.stop();
                expect(mascot.isRunning).toBe(false);
            }
        });

        it('should cycle through all emotions', () => {
            mascot = new EmotiveMascot({ canvasId: 'integration-test-canvas' });
            mascot.start();

            const emotions = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'love', 'neutral'];
            emotions.forEach(emotion => {
                mascot.setEmotion(emotion);
                expect(mascot.stateMachine.state.emotion).toBe(emotion);
            });

            mascot.stop();
        });
    });

    describe('Error Recovery', () => {
        it('should recover from invalid emotion', () => {
            mascot = new EmotiveMascot({ canvasId: 'integration-test-canvas' });
            mascot.start();

            mascot.setEmotion('nonexistent-emotion');
            // Should still be functional after invalid input
            mascot.setEmotion('joy');
            expect(mascot.stateMachine.state.emotion).toBe('joy');
        });

        it('should recover from invalid gesture', () => {
            mascot = new EmotiveMascot({ canvasId: 'integration-test-canvas' });
            mascot.start();

            mascot.express('nonexistent-gesture');
            // Should still be functional
            expect(() => mascot.express('bounce')).not.toThrow();
        });

        it('should handle stop before start', () => {
            mascot = new EmotiveMascot({ canvasId: 'integration-test-canvas' });
            expect(() => mascot.stop()).not.toThrow();
        });

        it('should handle setEmotion before start', () => {
            mascot = new EmotiveMascot({ canvasId: 'integration-test-canvas' });
            mascot.setEmotion('joy');

            mascot.start();
            expect(mascot.isRunning).toBe(true);
        });
    });

    describe('Multi-Instance Independence', () => {
        let canvas2, mascot2;

        beforeEach(() => {
            canvas2 = document.createElement('canvas');
            canvas2.id = 'multi-test-canvas-2';
            canvas2.width = 400;
            canvas2.height = 300;
            document.body.appendChild(canvas2);
        });

        afterEach(() => {
            if (mascot2) {
                try { mascot2.stop(); } catch { /* ignore */ }
                mascot2 = null;
            }
            if (canvas2 && canvas2.parentNode) {
                canvas2.parentNode.removeChild(canvas2);
            }
        });

        it('should maintain independent emotional states', () => {
            mascot = new EmotiveMascot({ canvasId: 'integration-test-canvas' });
            mascot2 = new EmotiveMascot({ canvasId: 'multi-test-canvas-2' });

            mascot.start();
            mascot2.start();

            mascot.setEmotion('joy');
            mascot2.setEmotion('sadness');

            expect(mascot.stateMachine.state.emotion).toBe('joy');
            expect(mascot2.stateMachine.state.emotion).toBe('sadness');
        });

        it('should stop independently without affecting the other', () => {
            mascot = new EmotiveMascot({ canvasId: 'integration-test-canvas' });
            mascot2 = new EmotiveMascot({ canvasId: 'multi-test-canvas-2' });

            mascot.start();
            mascot2.start();

            mascot.stop();
            expect(mascot.isRunning).toBe(false);
            expect(mascot2.isRunning).toBe(true);

            mascot2.setEmotion('love');
            expect(mascot2.stateMachine.state.emotion).toBe('love');
        });
    });

    describe('Visibility Change Handling', () => {
        it('should handle visibility hidden then visible without breaking', () => {
            mascot = new EmotiveMascot({ canvasId: 'integration-test-canvas' });
            mascot.start();

            // Hide
            Object.defineProperty(document, 'hidden', { value: true, writable: true });
            document.dispatchEvent(new Event('visibilitychange'));

            // Show
            Object.defineProperty(document, 'hidden', { value: false, writable: true });
            document.dispatchEvent(new Event('visibilitychange'));

            // Should resume normally
            mascot.setEmotion('joy');
            expect(mascot.stateMachine.state.emotion).toBe('joy');
        });
    });
});
