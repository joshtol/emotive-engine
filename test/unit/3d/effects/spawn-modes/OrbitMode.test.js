/**
 * OrbitMode Tests
 * Tests the pure math functions for orbital positioning
 */

import { describe, it, expect } from 'vitest';
import {
    parseOrbitConfig,
    parseOrbitFormation,
    expandOrbitFormation,
    calculateOrbitPosition
} from '../../../../../src/3d/effects/spawn-modes/OrbitMode.js';

describe('OrbitMode', () => {
    const mockResolveLandmark = name => {
        const landmarks = { head: 2.0, center: 1.0, feet: 0, bottom: -0.5, top: 2.5 };
        return landmarks[name] ?? (typeof name === 'number' ? name : 0);
    };

    describe('parseOrbitConfig', () => {
        it('should parse minimal config with defaults', () => {
            const parsed = parseOrbitConfig({ orbit: {} }, mockResolveLandmark);

            expect(parsed.height).toBe(0);
            expect(parsed.radius).toBe(1.5);
            expect(parsed.endRadius).toBe(1.5);
            expect(parsed.speed).toBe(0);
            expect(parsed.startScale).toBe(1.0);
            expect(parsed.endScale).toBe(1.0);
            expect(parsed.count).toBe(4);
        });

        it('should resolve string landmarks to Y positions', () => {
            const parsed = parseOrbitConfig({
                orbit: { height: 'head', endHeight: 'feet' }
            }, mockResolveLandmark);

            expect(parsed.height).toBe(2.0);
            expect(parsed.endHeight).toBe(0);
        });

        it('should accept numeric height directly', () => {
            const parsed = parseOrbitConfig({
                orbit: { height: 1.5, radius: 2.0 }
            }, mockResolveLandmark);

            expect(parsed.height).toBe(1.5);
            expect(parsed.radius).toBe(2.0);
        });

        it('should parse dynamic orbital motion config', () => {
            const parsed = parseOrbitConfig({
                orbit: { speed: 3, easing: 'easeOut', startScale: 0.5, endScale: 2.0 }
            }, mockResolveLandmark);

            expect(parsed.speed).toBe(3);
            expect(parsed.easing).toBe('easeOut');
            expect(parsed.startScale).toBe(0.5);
            expect(parsed.endScale).toBe(2.0);
        });
    });

    describe('parseOrbitFormation', () => {
        it('should return null for no formation', () => {
            expect(parseOrbitFormation(null)).toBeNull();
        });

        it('should convert degrees to radians', () => {
            const formation = parseOrbitFormation({
                type: 'pairs',
                count: 4,
                pairSpacing: 90,
                startAngle: 45
            });

            expect(formation.type).toBe('pairs');
            expect(formation.count).toBe(4);
            expect(formation.pairSpacing).toBeCloseTo(Math.PI / 2);
            expect(formation.startAngle).toBeCloseTo(Math.PI / 4);
        });
    });

    describe('expandOrbitFormation', () => {
        it('should distribute ring elements evenly', () => {
            const config = parseOrbitConfig({ orbit: {}, count: 4 }, mockResolveLandmark);
            const elements = expandOrbitFormation(config);

            expect(elements).toHaveLength(4);

            // Angles should be evenly spaced (0, π/2, π, 3π/2)
            const expectedAngles = [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2];
            elements.forEach((elem, i) => {
                expect(elem.angle).toBeCloseTo(expectedAngles[i]);
                expect(elem.index).toBe(i);
            });
        });

        it('should handle pairs formation with opposite positioning', () => {
            const config = parseOrbitConfig({
                orbit: {},
                formation: { type: 'pairs', count: 4 }
            }, mockResolveLandmark);
            const elements = expandOrbitFormation(config);

            expect(elements).toHaveLength(4);
            // Pairs: 0 and 1 should be π apart, 2 and 3 should be π apart
            const angleDiff01 = Math.abs(elements[1].angle - elements[0].angle);
            expect(angleDiff01).toBeCloseTo(Math.PI);
        });

        it('should handle cluster formation within 90° arc', () => {
            const config = parseOrbitConfig({
                orbit: {},
                formation: { type: 'cluster', count: 3 }
            }, mockResolveLandmark);
            const elements = expandOrbitFormation(config);

            expect(elements).toHaveLength(3);
            // All angles within π/2 (90°) arc
            const maxAngle = Math.max(...elements.map(e => e.angle));
            const minAngle = Math.min(...elements.map(e => e.angle));
            expect(maxAngle - minAngle).toBeLessThan(Math.PI / 2 + 0.01);
        });
    });

    describe('calculateOrbitPosition', () => {
        const baseConfig = {
            height: 1.0,
            endHeight: 1.0,
            radius: 2.0,
            endRadius: 2.0,
            speed: 0,
            startScale: 1.0,
            endScale: 1.0
        };

        it('should position element on circular orbit', () => {
            const pos = calculateOrbitPosition(
                baseConfig,
                { angle: 0, heightOffset: 0 },
                0, // progress
                1  // mascotRadius
            );

            // At angle 0, x = radius, z = 0
            expect(pos.x).toBeCloseTo(2.0);
            expect(pos.z).toBeCloseTo(0);
            expect(pos.y).toBeCloseTo(1.0);
            expect(pos.scale).toBeCloseTo(1.0);
        });

        it('should position element at 90° around orbit', () => {
            const pos = calculateOrbitPosition(
                baseConfig,
                { angle: Math.PI / 2, heightOffset: 0 },
                0, 1
            );

            expect(pos.x).toBeCloseTo(0, 5);
            expect(pos.z).toBeCloseTo(2.0);
        });

        it('should scale positions by mascotRadius', () => {
            const pos = calculateOrbitPosition(
                baseConfig,
                { angle: 0, heightOffset: 0 },
                0,
                2.0 // Double mascot size
            );

            expect(pos.x).toBeCloseTo(4.0); // 2.0 radius × 2.0 mascotRadius
            expect(pos.y).toBeCloseTo(2.0); // 1.0 height × 2.0 mascotRadius
        });

        it('should interpolate radius over gesture progress', () => {
            const config = { ...baseConfig, radius: 1.0, endRadius: 3.0 };

            const posStart = calculateOrbitPosition(config, { angle: 0, heightOffset: 0 }, 0, 1);
            const posMid = calculateOrbitPosition(config, { angle: 0, heightOffset: 0 }, 0.5, 1);
            const posEnd = calculateOrbitPosition(config, { angle: 0, heightOffset: 0 }, 1, 1);

            expect(posStart.x).toBeCloseTo(1.0);
            expect(posMid.x).toBeCloseTo(2.0);
            expect(posEnd.x).toBeCloseTo(3.0);
        });

        it('should interpolate height over gesture progress', () => {
            const config = { ...baseConfig, height: 0, endHeight: 2.0 };

            const posStart = calculateOrbitPosition(config, { angle: Math.PI / 2, heightOffset: 0 }, 0, 1);
            const posEnd = calculateOrbitPosition(config, { angle: Math.PI / 2, heightOffset: 0 }, 1, 1);

            expect(posStart.y).toBeCloseTo(0);
            expect(posEnd.y).toBeCloseTo(2.0);
        });

        it('should rotate based on speed and progress', () => {
            const config = { ...baseConfig, speed: 1 }; // 1 full revolution

            const pos0 = calculateOrbitPosition(config, { angle: 0, heightOffset: 0 }, 0, 1);
            const pos25 = calculateOrbitPosition(config, { angle: 0, heightOffset: 0 }, 0.25, 1);
            const pos100 = calculateOrbitPosition(config, { angle: 0, heightOffset: 0 }, 1, 1);

            // At progress 0, angle = 0 → x = radius
            expect(pos0.x).toBeCloseTo(2.0);

            // At progress 0.25, angle = π/2 → x ≈ 0
            expect(pos25.x).toBeCloseTo(0, 5);

            // At progress 1.0, angle = 2π → x = radius (full revolution)
            expect(pos100.x).toBeCloseTo(2.0, 4);
        });

        it('should interpolate scale', () => {
            const config = { ...baseConfig, startScale: 0.5, endScale: 2.0 };

            const posStart = calculateOrbitPosition(config, { angle: 0, heightOffset: 0 }, 0, 1);
            const posMid = calculateOrbitPosition(config, { angle: 0, heightOffset: 0 }, 0.5, 1);
            const posEnd = calculateOrbitPosition(config, { angle: 0, heightOffset: 0 }, 1, 1);

            expect(posStart.scale).toBeCloseTo(0.5);
            expect(posMid.scale).toBeCloseTo(1.25);
            expect(posEnd.scale).toBeCloseTo(2.0);
        });

        it('should apply easing function to progress', () => {
            const config = { ...baseConfig, radius: 0, endRadius: 1.0 };
            // Quadratic easing - slower at start
            const quadEasing = t => t * t;

            const posMid = calculateOrbitPosition(
                config,
                { angle: 0, heightOffset: 0 },
                0.5, 1, quadEasing
            );

            // With quadratic easing at 0.5, eased progress = 0.25
            expect(posMid.x).toBeCloseTo(0.25);
        });
    });
});
