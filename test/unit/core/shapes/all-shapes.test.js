/**
 * Bulk tests for all shape definitions
 * Tests that all shapes follow the required structure and generate valid points
 */
import { describe, it, expect } from 'vitest';

// Import all shapes
import circle from '../../../../src/core/shapes/geometric/circle.js';
import star from '../../../../src/core/shapes/geometric/star.js';
import square from '../../../../src/core/shapes/geometric/square.js';
import triangle from '../../../../src/core/shapes/geometric/triangle.js';
import heart from '../../../../src/core/shapes/organic/heart.js';
import moon from '../../../../src/core/shapes/astronomical/moon.js';
import sun from '../../../../src/core/shapes/astronomical/sun.js';

describe('All Shapes - Bulk Validation', () => {
    const allShapes = [
        { shape: circle, name: 'circle' },
        { shape: star, name: 'star' },
        { shape: square, name: 'square' },
        { shape: triangle, name: 'triangle' },
        { shape: heart, name: 'heart' },
        { shape: moon, name: 'moon' },
        { shape: sun, name: 'sun' }
    ];

    describe('Shape Structure Validation', () => {
        allShapes.forEach(({ shape, name }) => {
            it(`${name} should have required properties`, () => {
                expect(shape).toHaveProperty('name');
                expect(shape).toHaveProperty('category');
                expect(shape).toHaveProperty('emoji');
                expect(shape).toHaveProperty('description');
                expect(shape).toHaveProperty('generate');
                expect(typeof shape.generate).toBe('function');
            });

            it(`${name} should have metadata`, () => {
                expect(typeof shape.name).toBe('string');
                expect(shape.name.length).toBeGreaterThan(0);
                expect(typeof shape.category).toBe('string');
                expect(typeof shape.emoji).toBe('string');
                expect(typeof shape.description).toBe('string');
            });

            it(`${name} should have shadow and rhythm config`, () => {
                expect(shape).toHaveProperty('shadow');
                expect(shape).toHaveProperty('rhythm');
                expect(typeof shape.shadow).toBe('object');
                expect(typeof shape.rhythm).toBe('object');
            });

            it(`${name} should have emotions array`, () => {
                expect(shape).toHaveProperty('emotions');
                expect(Array.isArray(shape.emotions)).toBe(true);
                expect(shape.emotions.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Point Generation', () => {
        const pointCounts = [8, 16, 32, 64];

        allShapes.forEach(({ shape, name }) => {
            pointCounts.forEach(count => {
                it(`${name} should generate ${count} points`, () => {
                    const points = shape.generate(count);

                    expect(Array.isArray(points)).toBe(true);
                    expect(points.length).toBe(count);
                });

                it(`${name} with ${count} points should be in 0-1 range`, () => {
                    const points = shape.generate(count);

                    points.forEach((point, idx) => {
                        expect(point).toHaveProperty('x');
                        expect(point).toHaveProperty('y');
                        expect(typeof point.x).toBe('number');
                        expect(typeof point.y).toBe('number');

                        // Allow small margin for floating point
                        expect(point.x).toBeGreaterThan(-0.1);
                        expect(point.x).toBeLessThan(1.1);
                        expect(point.y).toBeGreaterThan(-0.1);
                        expect(point.y).toBeLessThan(1.1);
                    });
                });
            });
        });
    });

    describe('Shape Consistency', () => {
        allShapes.forEach(({ shape, name }) => {
            it(`${name} should generate same points for same input`, () => {
                const points1 = shape.generate(32);
                const points2 = shape.generate(32);

                expect(points1.length).toBe(points2.length);

                points1.forEach((p1, idx) => {
                    const p2 = points2[idx];
                    expect(p1.x).toBeCloseTo(p2.x, 10);
                    expect(p1.y).toBeCloseTo(p2.y, 10);
                });
            });

            it(`${name} should not have NaN or Infinity`, () => {
                const points = shape.generate(64);

                points.forEach(point => {
                    expect(Number.isFinite(point.x)).toBe(true);
                    expect(Number.isFinite(point.y)).toBe(true);
                    expect(Number.isNaN(point.x)).toBe(false);
                    expect(Number.isNaN(point.y)).toBe(false);
                });
            });
        });
    });

    describe('Category Classification', () => {
        it('should have geometric shapes', () => {
            const geometric = [circle, star, square, triangle];

            geometric.forEach(shape => {
                expect(shape.category).toBe('geometric');
            });
        });

        it('should have organic shapes', () => {
            expect(heart.category).toBe('organic');
        });

        it('should have astronomical shapes', () => {
            const astronomical = [moon, sun];

            astronomical.forEach(shape => {
                expect(shape.category).toBe('astronomical');
            });
        });
    });
});
