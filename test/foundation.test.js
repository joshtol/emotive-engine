/**
 * Foundation Tests - Verify core components are working
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import CanvasManager from '../src/core/CanvasManager.js';
import ErrorBoundary from '../src/core/ErrorBoundary.js';
import { easeOutQuad, easeInOutCubic, applyEasing } from '../src/utils/easing.js';
import { hexToRgb, interpolateHsl, EMOTIONAL_COLORS } from '../src/utils/colorUtils.js';
import EmotiveMascot from '../src/EmotiveMascot.js';

describe('Foundation Components', () => {
    let canvas;
    
    beforeEach(() => {
        // Create a mock canvas element
        canvas = document.createElement('canvas');
        canvas.id = 'test-canvas';
        canvas.width = 300;
        canvas.height = 300;
        document.body.appendChild(canvas);
    });
    
    afterEach(() => {
        if (canvas && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
        }
    });

    describe('CanvasManager', () => {
        it('should initialize with proper dimensions', () => {
            const manager = new CanvasManager(canvas);
            
            expect(manager.canvas).toBe(canvas);
            expect(manager.ctx).toBeDefined();
            expect(manager.width).toBeGreaterThan(0);
            expect(manager.height).toBeGreaterThan(0);
        });

        it('should calculate center coordinates correctly', () => {
            const manager = new CanvasManager(canvas);
            const center = manager.getCenter();
            
            expect(center.x).toBe(manager.width / 2);
            expect(center.y).toBe(manager.height / 2);
        });

        it('should handle transforms correctly', () => {
            const manager = new CanvasManager(canvas);
            
            // Should not throw when setting transforms
            expect(() => {
                manager.setTransform(10, 20, 1.5, Math.PI / 4);
                manager.restoreTransform();
            }).not.toThrow();
        });
    });

    describe('ErrorBoundary', () => {
        it('should wrap functions with error handling', () => {
            const errorBoundary = new ErrorBoundary();
            const throwingFunction = () => { throw new Error('Test error'); };
            
            const wrappedFunction = errorBoundary.wrap(throwingFunction, 'test-context', 'fallback');
            const result = wrappedFunction();
            
            expect(result).toBe('fallback');
            expect(errorBoundary.getErrorStats().totalErrors).toBe(1);
        });

        it('should validate inputs correctly', () => {
            const errorBoundary = new ErrorBoundary();
            
            expect(errorBoundary.validateInput('joy', 'emotion', 'neutral')).toBe('joy');
            expect(errorBoundary.validateInput('invalid', 'emotion', 'neutral')).toBe('neutral');
            expect(errorBoundary.validateInput('confident', 'undertone', null)).toBe('confident');
            expect(errorBoundary.validateInput('invalid', 'undertone', null)).toBe(null);
        });

        it('should provide safe defaults', () => {
            const errorBoundary = new ErrorBoundary();
            
            expect(errorBoundary.getDefault('emotion-transition')).toBe('neutral');
            expect(errorBoundary.getDefault('audio-processing')).toBe(0);
        });
    });

    describe('Easing Functions', () => {
        it('should calculate easeOutQuad correctly', () => {
            expect(easeOutQuad(0)).toBe(0);
            expect(easeOutQuad(1)).toBe(1);
            expect(easeOutQuad(0.5)).toBeCloseTo(0.75);
        });

        it('should calculate easeInOutCubic correctly', () => {
            expect(easeInOutCubic(0)).toBe(0);
            expect(easeInOutCubic(1)).toBe(1);
            expect(easeInOutCubic(0.5)).toBe(0.5);
        });

        it('should apply easing to value ranges', () => {
            const result = applyEasing(0.5, 0, 100, 'easeOutQuad');
            expect(result).toBeCloseTo(75);
        });
    });

    describe('Color Utilities', () => {
        it('should convert hex to RGB correctly', () => {
            const rgb = hexToRgb('#FF0000');
            expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
        });

        it('should interpolate colors in HSL space', () => {
            const result = interpolateHsl('#FF0000', '#0000FF', 0.5);
            expect(result).toMatch(/^#[0-9A-F]{6}$/i);
        });

        it('should have all emotional colors defined', () => {
            const requiredEmotions = ['neutral', 'joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'love'];
            
            requiredEmotions.forEach(emotion => {
                expect(EMOTIONAL_COLORS[emotion]).toBeDefined();
                expect(EMOTIONAL_COLORS[emotion]).toMatch(/^#[0-9A-F]{6}$/i);
            });
        });
    });

    describe('EmotiveMascot', () => {
        it('should initialize without errors', () => {
            expect(() => {
                const mascot = new EmotiveMascot({ canvasId: canvas });
                mascot.destroy();
            }).not.toThrow();
        });

        it('should support method chaining', () => {
            const mascot = new EmotiveMascot({ canvasId: canvas });
            
            const result = mascot
                .setEmotion('joy', 'confident')
                .express('bounce')
                .chain('pulse', 'spin');
            
            expect(result).toBe(mascot);
            mascot.destroy();
        });

        it('should handle invalid inputs gracefully', () => {
            const mascot = new EmotiveMascot({ canvasId: canvas });
            
            expect(() => {
                mascot
                    .setEmotion('invalid-emotion')
                    .express('invalid-gesture')
                    .chain('invalid1', 'invalid2');
            }).not.toThrow();
            
            mascot.destroy();
        });

        it('should start and stop correctly', () => {
            const mascot = new EmotiveMascot({ canvasId: canvas });
            
            expect(mascot.isRunning).toBe(false);
            
            mascot.start();
            expect(mascot.isRunning).toBe(true);
            
            mascot.stop();
            expect(mascot.isRunning).toBe(false);
            
            mascot.destroy();
        });

        it('should provide performance metrics', () => {
            const mascot = new EmotiveMascot({ canvasId: canvas });
            const metrics = mascot.getPerformanceMetrics();
            
            expect(metrics).toHaveProperty('fps');
            expect(metrics).toHaveProperty('isRunning');
            expect(metrics).toHaveProperty('currentEmotion');
            expect(metrics).toHaveProperty('errorStats');
            
            mascot.destroy();
        });
    });
});