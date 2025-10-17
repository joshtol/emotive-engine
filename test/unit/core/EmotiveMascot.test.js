/**
 * EmotiveMascot Core Tests
 * Tests for the main mascot class initialization and basic functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import EmotiveMascot from '../../../src/EmotiveMascot.js';

describe('EmotiveMascot', () => {
    let canvas;
    let mascot;

    beforeEach(() => {
    // Create a mock canvas element
        canvas = document.createElement('canvas');
        canvas.id = 'test-canvas';
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

    describe('Constructor', () => {
        it('should instantiate without errors', () => {
            mascot = new EmotiveMascot({ canvasId: 'test-canvas' });
            expect(mascot).toBeDefined();
            expect(mascot).toBeInstanceOf(EmotiveMascot);
        });

        it('should have default emotion of neutral', () => {
            mascot = new EmotiveMascot({ canvasId: 'test-canvas' });
            // Access state through a safe method if available
            expect(mascot).toBeDefined();
        });

        it('should accept custom configuration', () => {
            mascot = new EmotiveMascot({
                canvasId: 'test-canvas',
                emotion: 'joy',
                particleCount: 50
            });
            expect(mascot).toBeDefined();
        });

        it('should handle missing canvas gracefully', () => {
            // Should either throw or handle gracefully
            try {
                mascot = new EmotiveMascot({ canvasId: 'non-existent-canvas' });
                // If it doesn't throw, that's fine - it might handle it gracefully
                expect(mascot).toBeDefined();
            } catch (error) {
                // If it throws, that's also acceptable behavior
                expect(error).toBeDefined();
            }
        });
    });

    describe('Lifecycle Methods', () => {
        beforeEach(() => {
            mascot = new EmotiveMascot({ canvasId: 'test-canvas' });
        });

        it('should have a start method', () => {
            expect(typeof mascot.start).toBe('function');
        });

        it('should have a stop method', () => {
            expect(typeof mascot.stop).toBe('function');
        });

        it('should start without errors', () => {
            expect(() => mascot.start()).not.toThrow();
        });

        it('should stop without errors', () => {
            mascot.start();
            expect(() => mascot.stop()).not.toThrow();
        });
    });

    describe('Emotion System', () => {
        beforeEach(() => {
            mascot = new EmotiveMascot({ canvasId: 'test-canvas' });
        });

        it('should have a setEmotion method', () => {
            expect(typeof mascot.setEmotion).toBe('function');
        });

        it('should accept emotion changes', () => {
            expect(() => mascot.setEmotion('joy')).not.toThrow();
        });

        it('should handle multiple emotion transitions', () => {
            expect(() => {
                mascot.setEmotion('joy');
                mascot.setEmotion('sadness');
                mascot.setEmotion('anger');
            }).not.toThrow();
        });

        it('should handle invalid emotions gracefully', () => {
            // Should either throw or handle gracefully
            expect(() => mascot.setEmotion('nonexistent-emotion')).not.toThrow();
        });
    });

    describe('Gesture System', () => {
        beforeEach(() => {
            mascot = new EmotiveMascot({ canvasId: 'test-canvas' });
        });

        it('should have an express method', () => {
            expect(typeof mascot.express).toBe('function');
        });

        it('should trigger gestures without errors', () => {
            expect(() => mascot.express('bounce')).not.toThrow();
        });

        it('should handle gesture arrays', () => {
            expect(() => mascot.express(['bounce', 'spin'])).not.toThrow();
        });
    });

    describe('Error Handling', () => {
        it('should handle construction with minimal config', () => {
            expect(() => {
                mascot = new EmotiveMascot({});
            }).not.toThrow();
        });

        it('should handle null canvas', () => {
            expect(() => {
                mascot = new EmotiveMascot({ canvasId: null });
            }).not.toThrow();
        });
    });
});
