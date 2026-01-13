import { describe, bench } from 'vitest';
import {
    levenshteinDistance,
    suggestClosestMatch,
    suggestMultipleMatches,
    formatSuggestionMessage
} from '../src/utils/suggestions.js';

describe('Suggestions Utility Benchmarks', () => {
    const emotions = [
        'joy', 'sadness', 'anger', 'fear', 'surprise',
        'disgust', 'contempt', 'neutral', 'love', 'excited',
        'calm', 'focused', 'resting', 'euphoria', 'glitch'
    ];

    const gestures = [
        'bounce', 'pulse', 'shake', 'nod', 'spin',
        'wave', 'float', 'dance', 'celebrate', 'think',
        'sway', 'jump', 'wiggle', 'lean', 'expand'
    ];

    bench('levenshtein distance (short strings)', () => {
        levenshteinDistance('joy', 'jy');
    });

    bench('levenshtein distance (medium strings)', () => {
        levenshteinDistance('happiness', 'happyness');
    });

    bench('levenshtein distance (longer strings)', () => {
        levenshteinDistance('determination', 'determiation');
    });

    bench('suggest closest match (small list)', () => {
        suggestClosestMatch('joye', emotions.slice(0, 5));
    });

    bench('suggest closest match (full emotion list)', () => {
        suggestClosestMatch('joye', emotions);
    });

    bench('suggest closest match (full gesture list)', () => {
        suggestClosestMatch('bonce', gestures);
    });

    bench('suggest closest match (no match)', () => {
        suggestClosestMatch('xyzabc123', emotions);
    });

    bench('suggest multiple matches', () => {
        suggestMultipleMatches('bonce', gestures, 3, 3);
    });

    bench('format suggestion message (with match)', () => {
        formatSuggestionMessage('emotion', 'joye', emotions);
    });

    bench('format suggestion message (no match)', () => {
        formatSuggestionMessage('emotion', 'xyzabc', emotions);
    });

    bench('real-world typo corrections', () => {
        const typos = ['happpy', 'saddness', 'angr', 'surprize', 'nuetral'];
        for (const typo of typos) {
            suggestClosestMatch(typo, emotions);
        }
    });
});
