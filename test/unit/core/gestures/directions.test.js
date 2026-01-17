/**
 * Directions Module Tests
 * Tests for shared direction vectors used by directional gesture factories
 */

import { describe, it, expect } from 'vitest';
import {
    DIRECTIONS,
    DIAGONALS,
    ALL_DIRECTIONS,
    isValidDirection,
    isValidDiagonal,
    getDirection,
    capitalize
} from '../../../../src/core/gestures/motions/directions.js';

describe('Directions Module', () => {
    describe('DIRECTIONS constant', () => {
        it('should have four cardinal directions', () => {
            expect(Object.keys(DIRECTIONS)).toHaveLength(4);
            expect(DIRECTIONS).toHaveProperty('left');
            expect(DIRECTIONS).toHaveProperty('right');
            expect(DIRECTIONS).toHaveProperty('up');
            expect(DIRECTIONS).toHaveProperty('down');
        });

        it('should have correct left direction vector', () => {
            expect(DIRECTIONS.left).toEqual({ x: -1, y: 0 });
        });

        it('should have correct right direction vector', () => {
            expect(DIRECTIONS.right).toEqual({ x: 1, y: 0 });
        });

        it('should have correct up direction vector', () => {
            expect(DIRECTIONS.up).toEqual({ x: 0, y: 1 });
        });

        it('should have correct down direction vector', () => {
            expect(DIRECTIONS.down).toEqual({ x: 0, y: -1 });
        });

        it('should have normalized vectors (magnitude 1)', () => {
            Object.values(DIRECTIONS).forEach(dir => {
                const magnitude = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
                expect(magnitude).toBeCloseTo(1, 5);
            });
        });
    });

    describe('DIAGONALS constant', () => {
        it('should have four diagonal directions', () => {
            expect(Object.keys(DIAGONALS)).toHaveLength(4);
            expect(DIAGONALS).toHaveProperty('upLeft');
            expect(DIAGONALS).toHaveProperty('upRight');
            expect(DIAGONALS).toHaveProperty('downLeft');
            expect(DIAGONALS).toHaveProperty('downRight');
        });

        it('should have normalized diagonal vectors (magnitude ~1)', () => {
            Object.values(DIAGONALS).forEach(dir => {
                const magnitude = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
                expect(magnitude).toBeCloseTo(1, 3);
            });
        });

        it('should have correct upLeft direction', () => {
            expect(DIAGONALS.upLeft.x).toBeLessThan(0);
            expect(DIAGONALS.upLeft.y).toBeGreaterThan(0);
        });

        it('should have correct downRight direction', () => {
            expect(DIAGONALS.downRight.x).toBeGreaterThan(0);
            expect(DIAGONALS.downRight.y).toBeLessThan(0);
        });
    });

    describe('ALL_DIRECTIONS constant', () => {
        it('should combine cardinal and diagonal directions', () => {
            expect(Object.keys(ALL_DIRECTIONS)).toHaveLength(8);
        });

        it('should include all cardinal directions', () => {
            expect(ALL_DIRECTIONS.left).toEqual(DIRECTIONS.left);
            expect(ALL_DIRECTIONS.right).toEqual(DIRECTIONS.right);
            expect(ALL_DIRECTIONS.up).toEqual(DIRECTIONS.up);
            expect(ALL_DIRECTIONS.down).toEqual(DIRECTIONS.down);
        });

        it('should include all diagonal directions', () => {
            expect(ALL_DIRECTIONS.upLeft).toEqual(DIAGONALS.upLeft);
            expect(ALL_DIRECTIONS.upRight).toEqual(DIAGONALS.upRight);
            expect(ALL_DIRECTIONS.downLeft).toEqual(DIAGONALS.downLeft);
            expect(ALL_DIRECTIONS.downRight).toEqual(DIAGONALS.downRight);
        });
    });

    describe('isValidDirection()', () => {
        it('should return true for valid cardinal directions', () => {
            expect(isValidDirection('left')).toBe(true);
            expect(isValidDirection('right')).toBe(true);
            expect(isValidDirection('up')).toBe(true);
            expect(isValidDirection('down')).toBe(true);
        });

        it('should return false for diagonal directions', () => {
            expect(isValidDirection('upLeft')).toBe(false);
            expect(isValidDirection('downRight')).toBe(false);
        });

        it('should return false for invalid directions', () => {
            expect(isValidDirection('north')).toBe(false);
            expect(isValidDirection('forward')).toBe(false);
            expect(isValidDirection('')).toBe(false);
            expect(isValidDirection(null)).toBe(false);
            expect(isValidDirection(undefined)).toBe(false);
        });
    });

    describe('isValidDiagonal()', () => {
        it('should return true for valid diagonal directions', () => {
            expect(isValidDiagonal('upLeft')).toBe(true);
            expect(isValidDiagonal('upRight')).toBe(true);
            expect(isValidDiagonal('downLeft')).toBe(true);
            expect(isValidDiagonal('downRight')).toBe(true);
        });

        it('should return false for cardinal directions', () => {
            expect(isValidDiagonal('left')).toBe(false);
            expect(isValidDiagonal('up')).toBe(false);
        });

        it('should return false for invalid directions', () => {
            expect(isValidDiagonal('northeast')).toBe(false);
            expect(isValidDiagonal('')).toBe(false);
        });
    });

    describe('getDirection()', () => {
        it('should return direction vector for valid cardinal direction', () => {
            expect(getDirection('left')).toEqual({ x: -1, y: 0 });
            expect(getDirection('up')).toEqual({ x: 0, y: 1 });
        });

        it('should return direction vector for valid diagonal direction', () => {
            const upLeft = getDirection('upLeft');
            expect(upLeft.x).toBeLessThan(0);
            expect(upLeft.y).toBeGreaterThan(0);
        });

        it('should return null for invalid direction', () => {
            expect(getDirection('invalid')).toBeNull();
            expect(getDirection('')).toBeNull();
            expect(getDirection(null)).toBeNull();
        });
    });

    describe('capitalize()', () => {
        it('should capitalize first letter of lowercase string', () => {
            expect(capitalize('left')).toBe('Left');
            expect(capitalize('up')).toBe('Up');
            expect(capitalize('down')).toBe('Down');
        });

        it('should handle single character strings', () => {
            expect(capitalize('a')).toBe('A');
        });

        it('should preserve rest of string', () => {
            expect(capitalize('upLeft')).toBe('UpLeft');
            expect(capitalize('downRight')).toBe('DownRight');
        });

        it('should handle already capitalized strings', () => {
            expect(capitalize('Left')).toBe('Left');
        });

        it('should handle empty string', () => {
            expect(capitalize('')).toBe('');
        });
    });
});
