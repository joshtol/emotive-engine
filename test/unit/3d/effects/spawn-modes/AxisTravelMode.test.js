/**
 * AxisTravelMode Tests
 * Tests the pure math functions for axis-travel positioning and formation expansion
 */

import { describe, it, expect } from 'vitest';
import {
    parseFormation,
    normalizeOrientation,
    parseAxisTravelConfig,
    expandFormation,
    calculateAxisTravelPosition
} from '../../../../../src/3d/effects/spawn-modes/AxisTravelMode.js';

describe('AxisTravelMode', () => {
    const mockResolveLandmark = name => {
        const landmarks = { top: 2.0, center: 1.0, bottom: 0, head: 2.0, feet: 0 };
        return landmarks[name] ?? (typeof name === 'number' ? name : 0);
    };

    describe('normalizeOrientation', () => {
        it('should map legacy names to canonical names', () => {
            expect(normalizeOrientation('horizontal')).toBe('flat');
            expect(normalizeOrientation('upright')).toBe('vertical');
            expect(normalizeOrientation('billboard')).toBe('camera');
        });

        it('should pass through canonical names unchanged', () => {
            expect(normalizeOrientation('flat')).toBe('flat');
            expect(normalizeOrientation('vertical')).toBe('vertical');
            expect(normalizeOrientation('camera')).toBe('camera');
        });

        it('should default to flat', () => {
            expect(normalizeOrientation(undefined)).toBe('flat');
            expect(normalizeOrientation(null)).toBe('flat');
        });
    });

    describe('parseFormation', () => {
        it('should return null for no formation', () => {
            expect(parseFormation(null)).toBeNull();
        });

        it('should convert arcOffset degrees to radians', () => {
            const formation = parseFormation({ type: 'spiral', arcOffset: 90 });
            expect(formation.arcOffset).toBeCloseTo(Math.PI / 2);
        });

        it('should parse all formation properties', () => {
            const formation = parseFormation({
                type: 'mandala',
                count: 5,
                spacing: 0.3,
                centered: true,
                radius: 0.6,
                meshRotationOffset: 120
            });

            expect(formation.type).toBe('mandala');
            expect(formation.count).toBe(5);
            expect(formation.spacing).toBe(0.3);
            expect(formation.centered).toBe(true);
            expect(formation.radius).toBe(0.6);
            expect(formation.meshRotationOffset).toBeCloseTo(120 * Math.PI / 180);
        });
    });

    describe('parseAxisTravelConfig', () => {
        it('should resolve landmark names to positions', () => {
            const config = parseAxisTravelConfig({
                axisTravel: { start: 'bottom', end: 'top' }
            }, mockResolveLandmark);

            expect(config.startPos).toBe(0);
            expect(config.endPos).toBe(2.0);
        });

        it('should apply start/end offsets', () => {
            const config = parseAxisTravelConfig({
                axisTravel: { start: 'bottom', end: 'top', startOffset: 0.5, endOffset: -0.5 }
            }, mockResolveLandmark);

            expect(config.startPos).toBe(0.5);
            expect(config.endPos).toBe(1.5);
        });

        it('should parse scale and diameter interpolation', () => {
            const config = parseAxisTravelConfig({
                axisTravel: {
                    startScale: 0.5, endScale: 2.0,
                    startDiameter: 0.3, endDiameter: 1.5
                }
            }, mockResolveLandmark);

            expect(config.startScale).toBe(0.5);
            expect(config.endScale).toBe(2.0);
            expect(config.startDiameter).toBe(0.3);
            expect(config.endDiameter).toBe(1.5);
        });

        it('should parse reverseAt and holdAt', () => {
            const config = parseAxisTravelConfig({
                axisTravel: { reverseAt: 0.6, holdAt: 0.8 }
            }, mockResolveLandmark);

            expect(config.reverseAt).toBe(0.6);
            expect(config.holdAt).toBe(0.8);
        });
    });

    describe('expandFormation', () => {
        it('should return single element when no formation', () => {
            const elements = expandFormation({ formation: null });

            expect(elements).toHaveLength(1);
            expect(elements[0].index).toBe(0);
            expect(elements[0].positionOffset).toEqual({ x: 0, y: 0, z: 0 });
        });

        it('should expand stack formation vertically', () => {
            const elements = expandFormation({
                formation: parseFormation({ type: 'stack', count: 3, spacing: 0.2 })
            });

            expect(elements).toHaveLength(3);
            expect(elements[0].positionOffset.y).toBeCloseTo(0);
            expect(elements[1].positionOffset.y).toBeCloseTo(0.2);
            expect(elements[2].positionOffset.y).toBeCloseTo(0.4);
        });

        it('should center stack when centered=true', () => {
            const elements = expandFormation({
                formation: parseFormation({ type: 'stack', count: 3, spacing: 0.2, centered: true })
            });

            // Total span = (3-1) * 0.2 = 0.4, centerOffset = -0.2
            expect(elements[0].positionOffset.y).toBeCloseTo(-0.2);
            expect(elements[1].positionOffset.y).toBeCloseTo(0);
            expect(elements[2].positionOffset.y).toBeCloseTo(0.2);
        });

        it('should expand spiral with rotation offsets', () => {
            const elements = expandFormation({
                formation: parseFormation({ type: 'spiral', count: 4, spacing: 0.15, arcOffset: 60 })
            });

            expect(elements).toHaveLength(4);
            // Each element should have increasing rotation offset
            expect(elements[0].rotationOffset).toBeCloseTo(0);
            expect(elements[1].rotationOffset).toBeCloseTo(60 * Math.PI / 180);
            expect(elements[2].rotationOffset).toBeCloseTo(120 * Math.PI / 180);
        });

        it('should expand mandala with center + outer ring', () => {
            const elements = expandFormation({
                formation: parseFormation({ type: 'mandala', count: 5, radius: 0.4 })
            });

            expect(elements).toHaveLength(5);
            // First element at center
            expect(elements[0].positionOffset.x).toBeCloseTo(0);
            expect(elements[0].positionOffset.y).toBeCloseTo(0);

            // Remaining elements around a circle at radius 0.4
            for (let i = 1; i < 5; i++) {
                const dist = Math.sqrt(
                    elements[i].positionOffset.x ** 2 +
                    elements[i].positionOffset.y ** 2
                );
                expect(dist).toBeCloseTo(0.4, 1);
            }
        });

        it('should apply meshRotationOffset per element', () => {
            const elements = expandFormation({
                formation: parseFormation({
                    type: 'stack', count: 3, meshRotationOffset: 120
                })
            });

            expect(elements[0].meshRotationOffset).toBeCloseTo(0);
            expect(elements[1].meshRotationOffset).toBeCloseTo(120 * Math.PI / 180);
            expect(elements[2].meshRotationOffset).toBeCloseTo(240 * Math.PI / 180);
        });

        it('should apply per-element scale multipliers', () => {
            const elements = expandFormation({
                formation: parseFormation({
                    type: 'stack', count: 3, scales: [0.5, 1.0, 0.5]
                })
            });

            expect(elements[0].scaleMultiplier).toBe(0.5);
            expect(elements[1].scaleMultiplier).toBe(1.0);
            expect(elements[2].scaleMultiplier).toBe(0.5);
        });
    });

    describe('calculateAxisTravelPosition', () => {
        const baseConfig = {
            axis: 'y',
            startPos: 0,
            endPos: 2.0,
            easing: t => t, // linear
            speedCurve: null,
            startScale: 1.0,
            endScale: 1.0,
            startDiameter: 1.0,
            endDiameter: 1.0,
            orientation: 'flat',
            reverseAt: null,
            holdAt: null
        };

        it('should interpolate position linearly', () => {
            const start = calculateAxisTravelPosition(baseConfig, null, 0, 1);
            const mid = calculateAxisTravelPosition(baseConfig, null, 0.5, 1);
            const end = calculateAxisTravelPosition(baseConfig, null, 1, 1);

            expect(start.axisPos).toBeCloseTo(0);
            expect(mid.axisPos).toBeCloseTo(1.0);
            expect(end.axisPos).toBeCloseTo(2.0);
        });

        it('should interpolate scale', () => {
            const config = { ...baseConfig, startScale: 0.5, endScale: 2.0 };

            const start = calculateAxisTravelPosition(config, null, 0, 1);
            const end = calculateAxisTravelPosition(config, null, 1, 1);

            expect(start.scale).toBeCloseTo(0.5);
            expect(end.scale).toBeCloseTo(2.0);
        });

        it('should interpolate diameter', () => {
            const config = { ...baseConfig, startDiameter: 0.3, endDiameter: 1.5 };

            const mid = calculateAxisTravelPosition(config, null, 0.5, 1);
            expect(mid.diameter).toBeCloseTo(0.9);
        });

        it('should reverse travel direction at reverseAt point', () => {
            const config = { ...baseConfig, reverseAt: 0.5 };

            const beforeReverse = calculateAxisTravelPosition(config, null, 0.4, 1);
            const atEnd = calculateAxisTravelPosition(config, null, 1.0, 1);

            // Before reverseAt, element is traveling forward
            expect(beforeReverse.axisPos).toBeCloseTo(0.8); // 0.4 * 2.0
            // At gesture end, should be back at startPos
            expect(atEnd.axisPos).toBeCloseTo(0, 0);
        });

        it('should hold at end position when holdAt is set', () => {
            const config = { ...baseConfig, holdAt: 0.5 };

            const atHold = calculateAxisTravelPosition(config, null, 0.5, 1);
            const afterHold = calculateAxisTravelPosition(config, null, 0.8, 1);
            const atEnd = calculateAxisTravelPosition(config, null, 1.0, 1);

            expect(atHold.axisPos).toBeCloseTo(2.0);
            // After holdAt, position should stay at end
            expect(afterHold.axisPos).toBeCloseTo(2.0);
            expect(atEnd.axisPos).toBeCloseTo(2.0);
        });

        it('should apply formation position offsets scaled by mascotRadius', () => {
            const formationData = {
                positionOffset: { x: 0.5, y: 0.3, z: 0 },
                rotationOffset: 0,
                progressOffset: 0,
                scaleMultiplier: 1.0
            };

            const result = calculateAxisTravelPosition(baseConfig, formationData, 0.5, 2.0);

            expect(result.positionOffset.x).toBeCloseTo(1.0); // 0.5 × 2.0
            expect(result.positionOffset.y).toBeCloseTo(0.6); // 0.3 × 2.0
        });

        it('should stagger elements via progressOffset', () => {
            const leader = { positionOffset: { x: 0, y: 0, z: 0 }, progressOffset: 0, scaleMultiplier: 1.0 };
            const follower = { positionOffset: { x: 0, y: 0, z: 0 }, progressOffset: 0.2, scaleMultiplier: 1.0 };

            const leaderPos = calculateAxisTravelPosition(baseConfig, leader, 0.5, 1);
            const followerPos = calculateAxisTravelPosition(baseConfig, follower, 0.5, 1);

            // Leader at progress 0.5 → position 1.0
            expect(leaderPos.axisPos).toBeCloseTo(1.0);
            // Follower at effective progress 0.3 → position 0.6
            expect(followerPos.axisPos).toBeCloseTo(0.6);
        });

        it('should pass through scaleMultiplier from formation', () => {
            const formationData = {
                positionOffset: { x: 0, y: 0, z: 0 },
                scaleMultiplier: 0.5
            };

            const result = calculateAxisTravelPosition(baseConfig, formationData, 0.5, 1);
            expect(result.scaleMultiplier).toBe(0.5);
        });
    });
});
