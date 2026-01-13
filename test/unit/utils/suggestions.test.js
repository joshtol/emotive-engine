import { describe, it, expect } from 'vitest';
import {
    levenshteinDistance,
    suggestClosestMatch,
    suggestMultipleMatches,
    formatSuggestionMessage
} from '../../../src/utils/suggestions.js';

describe('suggestions', () => {
    describe('levenshteinDistance', () => {
        it('should return 0 for identical strings', () => {
            expect(levenshteinDistance('hello', 'hello')).toBe(0);
        });

        it('should return correct distance for single character difference', () => {
            expect(levenshteinDistance('hello', 'hallo')).toBe(1);
        });

        it('should return correct distance for multiple differences', () => {
            expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
        });

        it('should handle empty strings', () => {
            expect(levenshteinDistance('', 'hello')).toBe(5);
            expect(levenshteinDistance('hello', '')).toBe(5);
            expect(levenshteinDistance('', '')).toBe(0);
        });

        it('should be symmetric', () => {
            expect(levenshteinDistance('abc', 'xyz')).toBe(levenshteinDistance('xyz', 'abc'));
        });
    });

    describe('suggestClosestMatch', () => {
        const emotions = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'neutral'];

        it('should suggest correct emotion for typo', () => {
            expect(suggestClosestMatch('joye', emotions)).toBe('joy');
            expect(suggestClosestMatch('jy', emotions)).toBe('joy');
            expect(suggestClosestMatch('sadnes', emotions)).toBe('sadness');
            expect(suggestClosestMatch('angr', emotions)).toBe('anger');
        });

        it('should return null for completely wrong input', () => {
            expect(suggestClosestMatch('xyzabc123', emotions)).toBeNull();
        });

        it('should handle case insensitivity', () => {
            expect(suggestClosestMatch('JOY', emotions)).toBe('joy');
            expect(suggestClosestMatch('SADNESS', emotions)).toBe('sadness');
        });

        it('should handle null/undefined input', () => {
            expect(suggestClosestMatch(null, emotions)).toBeNull();
            expect(suggestClosestMatch(undefined, emotions)).toBeNull();
        });

        it('should handle empty options array', () => {
            expect(suggestClosestMatch('joy', [])).toBeNull();
        });

        it('should respect maxDistance parameter', () => {
            expect(suggestClosestMatch('joye', emotions, 1)).toBe('joy');
            expect(suggestClosestMatch('joyeee', emotions, 1)).toBeNull();
        });

        it('should handle whitespace in input', () => {
            expect(suggestClosestMatch('  joy  ', emotions)).toBe('joy');
        });
    });

    describe('suggestMultipleMatches', () => {
        const gestures = ['bounce', 'pulse', 'shake', 'nod', 'spin', 'bond'];

        it('should return multiple close matches', () => {
            const matches = suggestMultipleMatches('bonce', gestures);
            expect(matches).toContain('bounce');
        });

        it('should sort by distance', () => {
            const matches = suggestMultipleMatches('bounc', gestures);
            // 'bounce' should be first as it's closest (1 edit away)
            expect(matches[0]).toBe('bounce');
        });

        it('should respect maxResults parameter', () => {
            const matches = suggestMultipleMatches('s', gestures, 3, 2);
            expect(matches.length).toBeLessThanOrEqual(2);
        });

        it('should return empty array for invalid input', () => {
            expect(suggestMultipleMatches(null, gestures)).toEqual([]);
            expect(suggestMultipleMatches('test', [])).toEqual([]);
        });
    });

    describe('formatSuggestionMessage', () => {
        const emotions = ['joy', 'sadness', 'anger', 'fear'];

        it('should include "Did you mean" for close matches', () => {
            const message = formatSuggestionMessage('emotion', 'joye', emotions);
            expect(message).toContain('Did you mean');
            expect(message).toContain('joy');
        });

        it('should list valid options when no close match', () => {
            const message = formatSuggestionMessage('emotion', 'xyzabc', emotions);
            expect(message).toContain('Valid options');
            expect(message).toContain('joy');
        });

        it('should include the invalid value in the message', () => {
            const message = formatSuggestionMessage('emotion', 'happpy', emotions);
            expect(message).toContain('happpy');
        });

        it('should handle parameter name correctly', () => {
            const message = formatSuggestionMessage('gesture', 'bounse', ['bounce']);
            expect(message).toContain('gesture');
        });
    });
});
