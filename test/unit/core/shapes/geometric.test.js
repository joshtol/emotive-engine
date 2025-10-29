/**
 * Tests for geometric shape definitions
 * These are simple, pure functions that generate shape coordinates
 */
import { describe, it, expect } from 'vitest';
import circle from '../../../../src/core/shapes/geometric/circle.js';
import star from '../../../../src/core/shapes/geometric/star.js';
import square from '../../../../src/core/shapes/geometric/square.js';
import triangle from '../../../../src/core/shapes/geometric/triangle.js';

describe('Geometric Shapes', () => {
    describe('Circle', () => {
        it('should have correct metadata', () => {
            expect(circle.name).toBe('circle');
            expect(circle.category).toBe('geometric');
            expect(circle.emoji).toBe('⭕');
            expect(circle.description).toContain('circle');
        });

        it('should generate correct number of points', () => {
            const points = circle.generate(8);
            expect(points).toHaveLength(8);
        });

        it('should generate points in normalized 0-1 range', () => {
            const points = circle.generate(16);

            points.forEach(point => {
                expect(point.x).toBeGreaterThanOrEqual(0);
                expect(point.x).toBeLessThanOrEqual(1);
                expect(point.y).toBeGreaterThanOrEqual(0);
                expect(point.y).toBeLessThanOrEqual(1);
            });
        });

        it('should generate evenly spaced points around circle', () => {
            const points = circle.generate(4);

            // First point should be at 0 degrees (right side)
            expect(points[0].x).toBeCloseTo(1, 1);
            expect(points[0].y).toBeCloseTo(0.5, 1);

            // Second point should be at 90 degrees (top)
            expect(points[1].x).toBeCloseTo(0.5, 1);
            expect(points[1].y).toBeCloseTo(1, 1);
        });

        it('should have proper shape configuration', () => {
            expect(circle.shadow.type).toBe('none');
            expect(circle.rhythm.syncMode).toBe('off');
            expect(circle.rhythm.returnToNeutral).toBe(true);
            expect(circle.emotions).toContain('neutral');
        });

        it('should handle different point counts', () => {
            const tests = [3, 8, 16, 32, 64];

            tests.forEach(count => {
                const points = circle.generate(count);
                expect(points).toHaveLength(count);
            });
        });

        it('should have null custom render', () => {
            expect(circle.render).toBeNull();
        });
    });

    describe('Star', () => {
        it('should have correct metadata', () => {
            expect(star.name).toBe('star');
            expect(star.category).toBe('geometric');
            expect(star.emoji).toBe('⭐');
        });

        it('should generate correct number of points', () => {
            const points = star.generate(20);
            expect(points).toHaveLength(20);
        });

        it('should generate points in normalized range', () => {
            const points = star.generate(20);

            points.forEach(point => {
                expect(point.x).toBeGreaterThanOrEqual(0);
                expect(point.x).toBeLessThanOrEqual(1);
                expect(point.y).toBeGreaterThanOrEqual(0);
                expect(point.y).toBeLessThanOrEqual(1);
            });
        });

        it('should alternate between outer and inner points', () => {
            const points = star.generate(10);

            // Calculate distances from center for first few points
            const center = 0.5;
            const distances = points.slice(0, 4).map(p =>
                Math.sqrt(Math.pow(p.x - center, 2) + Math.pow(p.y - center, 2))
            );

            // Should alternate: far, close, far, close
            expect(distances[0]).toBeGreaterThan(distances[1]);
            expect(distances[2]).toBeGreaterThan(distances[1]);
            expect(distances[2]).toBeGreaterThan(distances[3]);
        });

        it('should have proper rhythm configuration', () => {
            expect(star.rhythm.syncMode).toBeDefined();
            expect(star.emotions).toBeDefined();
            expect(Array.isArray(star.emotions)).toBe(true);
        });
    });

    describe('Square', () => {
        it('should have correct metadata', () => {
            expect(square.name).toBe('square');
            expect(square.category).toBe('geometric');
            expect(square.emoji).toBe('⬜');
        });

        it('should generate correct number of points', () => {
            const points = square.generate(20);
            expect(points).toHaveLength(20);
        });

        it('should generate points along square perimeter', () => {
            const points = square.generate(40);

            // All points should be roughly in valid range (allowing small rounding errors)
            points.forEach(point => {
                expect(point.x).toBeGreaterThan(-0.1);
                expect(point.x).toBeLessThan(1.1);
                expect(point.y).toBeGreaterThan(-0.1);
                expect(point.y).toBeLessThan(1.1);
            });
        });

        it('should have points forming a square shape', () => {
            const points = square.generate(40);

            // Check that we have a reasonable spread of points
            const xValues = points.map(p => p.x);
            const yValues = points.map(p => p.y);

            const xRange = Math.max(...xValues) - Math.min(...xValues);
            const yRange = Math.max(...yValues) - Math.min(...yValues);

            // Square should have similar width and height
            expect(Math.abs(xRange - yRange)).toBeLessThan(0.3);
        });

        it('should have proper configuration', () => {
            expect(square.shadow).toBeDefined();
            expect(square.rhythm).toBeDefined();
            expect(square.emotions).toBeDefined();
        });
    });

    describe('Triangle', () => {
        it('should have correct metadata', () => {
            expect(triangle.name).toBe('triangle');
            expect(triangle.category).toBe('geometric');
            expect(triangle.emoji).toBe('🔺');
        });

        it('should generate correct number of points', () => {
            const points = triangle.generate(15);
            expect(points).toHaveLength(15);
        });

        it('should generate points in normalized range', () => {
            const points = triangle.generate(24);

            points.forEach(point => {
                expect(point.x).toBeGreaterThanOrEqual(0);
                expect(point.x).toBeLessThanOrEqual(1);
                expect(point.y).toBeGreaterThanOrEqual(0);
                expect(point.y).toBeLessThanOrEqual(1);
            });
        });

        it('should distribute points along triangle edges', () => {
            const points = triangle.generate(24);

            // Should have 3 sides with roughly equal point distribution
            // Points should form a triangular pattern
            expect(points.length).toBeGreaterThan(0);

            // Check that points vary in both x and y
            const xValues = points.map(p => p.x);
            const yValues = points.map(p => p.y);

            const xMin = Math.min(...xValues);
            const xMax = Math.max(...xValues);
            const yMin = Math.min(...yValues);
            const yMax = Math.max(...yValues);

            // Triangle should have reasonable spread
            expect(xMax - xMin).toBeGreaterThan(0.3);
            expect(yMax - yMin).toBeGreaterThan(0.3);
        });

        it('should have proper configuration', () => {
            expect(triangle.shadow).toBeDefined();
            expect(triangle.rhythm).toBeDefined();
            expect(triangle.emotions).toBeDefined();
        });

        it('should handle various point counts', () => {
            const counts = [9, 15, 24, 30];

            counts.forEach(count => {
                const points = triangle.generate(count);
                expect(points).toHaveLength(count);

                // All points should be valid
                points.forEach(point => {
                    expect(point.x).toBeGreaterThanOrEqual(0);
                    expect(point.x).toBeLessThanOrEqual(1);
                    expect(point.y).toBeGreaterThanOrEqual(0);
                    expect(point.y).toBeLessThanOrEqual(1);
                });
            });
        });
    });

    describe('Shape Compatibility', () => {
        const shapes = [circle, star, square, triangle];

        it('all shapes should have required properties', () => {
            shapes.forEach(shape => {
                expect(shape).toHaveProperty('name');
                expect(shape).toHaveProperty('category');
                expect(shape).toHaveProperty('emoji');
                expect(shape).toHaveProperty('generate');
                expect(typeof shape.generate).toBe('function');
            });
        });

        it('all shapes should generate valid point arrays', () => {
            shapes.forEach(shape => {
                const points = shape.generate(16);

                expect(Array.isArray(points)).toBe(true);
                expect(points.length).toBeGreaterThan(0);

                points.forEach(point => {
                    expect(point).toHaveProperty('x');
                    expect(point).toHaveProperty('y');
                    expect(typeof point.x).toBe('number');
                    expect(typeof point.y).toBe('number');
                });
            });
        });

        it('all shapes should handle standard point count', () => {
            const standardCount = 20;

            shapes.forEach(shape => {
                const points = shape.generate(standardCount);
                expect(points).toHaveLength(standardCount);
            });
        });

        it('all shapes should have rhythm configuration', () => {
            shapes.forEach(shape => {
                expect(shape).toHaveProperty('rhythm');
                expect(shape.rhythm).toHaveProperty('syncMode');
            });
        });

        it('all shapes should have emotions array', () => {
            shapes.forEach(shape => {
                expect(shape).toHaveProperty('emotions');
                expect(Array.isArray(shape.emotions)).toBe(true);
                expect(shape.emotions.length).toBeGreaterThan(0);
            });
        });
    });
});
