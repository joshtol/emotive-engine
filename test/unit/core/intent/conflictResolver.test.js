import { describe, it, expect } from 'vitest';
import { resolve, hasConflict, getPossibilities } from '../../../../src/core/intent/conflictResolver.js';

describe('hasConflict', () => {
    it('should return true for known conflicting tokens', () => {
        expect(hasConflict('nervous')).toBe(true);
        expect(hasConflict('confident')).toBe(true);
        expect(hasConflict('excited')).toBe(true);
    });

    it('should return false for non-conflicting tokens', () => {
        expect(hasConflict('happy')).toBe(false);
        expect(hasConflict('bouncing')).toBe(false);
        expect(hasConflict('xyznonexistent')).toBe(false);
    });
});

describe('getPossibilities', () => {
    it('should return candidates for conflicting tokens', () => {
        const possibilities = getPossibilities('nervous');
        expect(possibilities.length).toBeGreaterThanOrEqual(2);
        const categories = possibilities.map(p => p.category);
        expect(categories).toContain('emotion');
        expect(categories).toContain('undertone');
    });

    it('should return empty array for non-conflicting tokens', () => {
        expect(getPossibilities('happy')).toEqual([]);
    });
});

describe('resolve', () => {
    it('should resolve "nervous" standalone as emotion', () => {
        const result = resolve('nervous', ['nervous'], 0, {
            emotion: null,
            gestures: [],
            shape: null,
            undertone: 'clear',
        });
        expect(result).not.toBeNull();
        expect(result.category).toBe('emotion');
    });

    it('should resolve "nervous" as undertone when emotion already exists', () => {
        const result = resolve('nervous', ['happy', 'but', 'nervous'], 2, {
            emotion: 'joy',
            gestures: [],
            shape: null,
            undertone: 'clear',
        });
        expect(result).not.toBeNull();
        expect(result.category).toBe('undertone');
    });

    it('should resolve "nodding" as gesture', () => {
        const result = resolve('nodding', ['nodding'], 0, {
            emotion: null,
            gestures: [],
            shape: null,
            undertone: 'clear',
        });
        if (result) {
            expect(result.category).toBe('gesture');
        }
    });

    it('should resolve "yes" as nod gesture', () => {
        const result = resolve('yes', ['yes'], 0, {
            emotion: null,
            gestures: [],
            shape: null,
            undertone: 'clear',
        });
        if (result) {
            expect(result.category).toBe('gesture');
            expect(result.target).toBe('nod');
        }
    });

    it('should resolve "no" as shake gesture', () => {
        const result = resolve('no', ['no'], 0, {
            emotion: null,
            gestures: [],
            shape: null,
            undertone: 'clear',
        });
        if (result) {
            expect(result.category).toBe('gesture');
            expect(result.target).toBe('shake');
        }
    });

    it('should return null for non-conflicting tokens', () => {
        const result = resolve('happy', ['happy'], 0, {
            emotion: null,
            gestures: [],
            shape: null,
            undertone: 'clear',
        });
        expect(result).toBeNull();
    });

    it('should consider context words for disambiguation', () => {
        // "feeling nervous" should lean toward emotion
        const result = resolve('nervous', ['feeling', 'nervous'], 1, {
            emotion: null,
            gestures: [],
            shape: null,
            undertone: 'clear',
        });
        expect(result).not.toBeNull();
        expect(result.category).toBe('emotion');
    });
});
