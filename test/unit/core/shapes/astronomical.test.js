/**
 * Tests for astronomical shape definitions
 * These shapes represent celestial bodies with special rendering effects
 */
import { describe, it, expect } from 'vitest';
import moon from '../../../../src/core/shapes/astronomical/moon.js';

describe('Astronomical Shapes', () => {
    describe('Moon', () => {
        it('should have correct metadata', () => {
            expect(moon.name).toBe('moon');
            expect(moon.category).toBe('astronomical');
            expect(moon.emoji).toBe('🌙');
            expect(moon.description).toContain('moon');
        });

        it('should generate correct number of points', () => {
            const points = moon.generate(16);
            expect(points).toHaveLength(16);
        });

        it('should generate circular base shape', () => {
            const points = moon.generate(8);

            // Moon generates a circle (crescent is created by shadow)
            points.forEach(point => {
                expect(point.x).toBeGreaterThanOrEqual(0);
                expect(point.x).toBeLessThanOrEqual(1);
                expect(point.y).toBeGreaterThanOrEqual(0);
                expect(point.y).toBeLessThanOrEqual(1);
            });
        });

        it('should have crescent shadow configuration', () => {
            expect(moon.shadow.type).toBe('crescent');
            expect(moon.shadow.coverage).toBe(0.85);
            expect(moon.shadow.angle).toBe(-30);
            expect(moon.shadow.softness).toBe(0.05);
            expect(moon.shadow.offset).toBe(0.7);
        });

        it('should have proper rhythm configuration', () => {
            expect(moon.rhythm.syncMode).toBe('measure');
            expect(moon.rhythm.swayFactor).toBe(1.1);
            expect(moon.rhythm.gentlePulse).toBe(true);
        });

        it('should have calm emotions', () => {
            expect(moon.emotions).toContain('calm');
            expect(moon.emotions).toContain('mystery');
            expect(moon.emotions.length).toBeGreaterThan(0);
        });

        it('should have custom core color', () => {
            expect(moon.coreColor).toBe('#e8e8e8');
        });

        it('should generate evenly spaced points', () => {
            const points = moon.generate(4);

            // First point should be at 0 degrees
            expect(points[0].x).toBeCloseTo(1, 1);
            expect(points[0].y).toBeCloseTo(0.5, 1);
        });

        it('should handle various point counts', () => {
            const counts = [8, 16, 32, 64];

            counts.forEach(count => {
                const points = moon.generate(count);
                expect(points).toHaveLength(count);

                points.forEach(point => {
                    expect(point.x).toBeGreaterThanOrEqual(0);
                    expect(point.x).toBeLessThanOrEqual(1);
                    expect(point.y).toBeGreaterThanOrEqual(0);
                    expect(point.y).toBeLessThanOrEqual(1);
                });
            });
        });

        it('should have all points equidistant from center', () => {
            const points = moon.generate(16);
            const center = { x: 0.5, y: 0.5 };

            const distances = points.map(p =>
                Math.sqrt(Math.pow(p.x - center.x, 2) + Math.pow(p.y - center.y, 2))
            );

            // All points should be roughly same distance (it's a circle)
            const avgDistance = distances.reduce((a, b) => a + b) / distances.length;

            distances.forEach(d => {
                expect(Math.abs(d - avgDistance)).toBeLessThan(0.01);
            });
        });
    });
});
