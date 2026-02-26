import { describe, it, expect } from 'vitest';
import {
    levenshteinDistance,
    suggestClosestMatch,
    suggestMultipleMatches,
    formatSuggestionMessage,
} from '../../../src/utils/suggestions.js';

describe('levenshteinDistance', () => {
    it('should return 0 for identical strings', () => {
        expect(levenshteinDistance('hello', 'hello')).toBe(0);
        expect(levenshteinDistance('', '')).toBe(0);
    });

    it('should return length of other string when one is empty', () => {
        expect(levenshteinDistance('', 'hello')).toBe(5);
        expect(levenshteinDistance('hello', '')).toBe(5);
    });

    it('should return 1 for single character substitution', () => {
        expect(levenshteinDistance('cat', 'bat')).toBe(1);
    });

    it('should return 1 for single character insertion', () => {
        expect(levenshteinDistance('cat', 'cats')).toBe(1);
    });

    it('should return 1 for single character deletion', () => {
        expect(levenshteinDistance('cats', 'cat')).toBe(1);
    });

    it('should be symmetric', () => {
        expect(levenshteinDistance('abc', 'xyz')).toBe(levenshteinDistance('xyz', 'abc'));
        expect(levenshteinDistance('joy', 'joye')).toBe(levenshteinDistance('joye', 'joy'));
    });

    it('should handle common typos', () => {
        expect(levenshteinDistance('hapy', 'happy')).toBe(1);
        expect(levenshteinDistance('joye', 'joy')).toBe(1);
        expect(levenshteinDistance('anegr', 'anger')).toBe(2);
    });
});

describe('suggestClosestMatch', () => {
    const emotions = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'contempt', 'neutral'];

    it('should find exact matches', () => {
        expect(suggestClosestMatch('joy', emotions)).toBe('joy');
    });

    it('should find close typos', () => {
        expect(suggestClosestMatch('joye', emotions)).toBe('joy');
        expect(suggestClosestMatch('hapy', ['happy', 'sad'])).toBe('happy');
    });

    it('should be case-insensitive', () => {
        expect(suggestClosestMatch('JOY', emotions)).toBe('joy');
        expect(suggestClosestMatch('Anger', emotions)).toBe('anger');
    });

    it('should return null when no match within threshold', () => {
        expect(suggestClosestMatch('xyzabc', emotions)).toBeNull();
    });

    it('should respect maxDistance parameter', () => {
        expect(suggestClosestMatch('joye', emotions, 1)).toBe('joy');
        expect(suggestClosestMatch('joye', emotions, 0)).toBeNull();
    });

    it('should return null for empty/invalid input', () => {
        expect(suggestClosestMatch('', emotions)).toBeNull();
        expect(suggestClosestMatch(null, emotions)).toBeNull();
        expect(suggestClosestMatch(undefined, emotions)).toBeNull();
        expect(suggestClosestMatch(123, emotions)).toBeNull();
    });

    it('should return null for empty validOptions', () => {
        expect(suggestClosestMatch('joy', [])).toBeNull();
        expect(suggestClosestMatch('joy', null)).toBeNull();
    });

    it('should skip non-string options', () => {
        expect(suggestClosestMatch('joy', ['joy', 123, null])).toBe('joy');
    });

    it('should trim whitespace from input', () => {
        expect(suggestClosestMatch('  joy  ', emotions)).toBe('joy');
    });
});

describe('suggestMultipleMatches', () => {
    const gestures = ['bounce', 'pulse', 'nod', 'bond', 'wave', 'spin'];

    it('should return multiple close matches sorted by distance', () => {
        const results = suggestMultipleMatches('bonce', gestures);
        expect(results.length).toBeGreaterThanOrEqual(1);
        // 'bounce' should be first (distance 1)
        expect(results[0]).toBe('bounce');
    });

    it('should respect maxResults limit', () => {
        const results = suggestMultipleMatches('bon', gestures, 3, 2);
        expect(results.length).toBeLessThanOrEqual(2);
    });

    it('should return empty array for invalid input', () => {
        expect(suggestMultipleMatches('', gestures)).toEqual([]);
        expect(suggestMultipleMatches(null, gestures)).toEqual([]);
        expect(suggestMultipleMatches('bon', [])).toEqual([]);
        expect(suggestMultipleMatches('bon', null)).toEqual([]);
    });

    it('should sort alphabetically when distances are equal', () => {
        const results = suggestMultipleMatches('x', ['a', 'b', 'c'], 3);
        // All have same distance, should be alphabetical
        for (let i = 1; i < results.length; i++) {
            expect(results[i].localeCompare(results[i - 1])).toBeGreaterThanOrEqual(0);
        }
    });
});

describe('formatSuggestionMessage', () => {
    const emotions = ['joy', 'sadness', 'anger', 'fear', 'surprise'];

    it('should format "Did you mean?" message for close match', () => {
        const msg = formatSuggestionMessage('emotion', 'joye', emotions);
        expect(msg).toContain('Did you mean');
        expect(msg).toContain('joy');
        expect(msg).toContain('joye');
    });

    it('should list valid options when no close match', () => {
        const msg = formatSuggestionMessage('emotion', 'xyzabc', emotions);
        expect(msg).toContain('Valid options');
        expect(msg).toContain('joy');
    });

    it('should include the parameter name', () => {
        const msg = formatSuggestionMessage('gesture', 'wavee', ['wave']);
        expect(msg).toContain('gesture');
    });

    it('should show count when many options exist', () => {
        const manyOptions = Array.from({ length: 10 }, (_, i) => `option${i}`);
        const msg = formatSuggestionMessage('param', 'zzzzz', manyOptions);
        expect(msg).toContain('10 total');
    });

    it('should not show count when 5 or fewer options', () => {
        const msg = formatSuggestionMessage('param', 'zzzzz', ['a', 'b', 'c']);
        expect(msg).not.toContain('total');
    });
});
