import { describe, it, expect, beforeAll } from 'vitest';
import { IntentParser } from '../../../../src/core/intent/IntentParser.js';

describe('IntentParser', () => {
    let parser;

    beforeAll(() => {
        parser = new IntentParser();
    });

    describe('parse() - basic emotions', () => {
        it('should parse "happy" as joy', () => {
            const result = parser.parse('happy');
            expect(result.emotion).toBe('joy');
        });

        it('should parse "sad" as sadness', () => {
            const result = parser.parse('sad');
            expect(result.emotion).toBe('sadness');
        });

        it('should parse "angry" as anger', () => {
            const result = parser.parse('angry');
            expect(result.emotion).toBe('anger');
        });

        it('should parse "scared" as fear', () => {
            const result = parser.parse('scared');
            expect(result.emotion).toBe('fear');
        });

        it('should parse "surprised" as surprise', () => {
            const result = parser.parse('surprised');
            expect(result.emotion).toBe('surprise');
        });

        it('should parse "disgusted" as disgust', () => {
            const result = parser.parse('disgusted');
            expect(result.emotion).toBe('disgust');
        });

        it('should parse "neutral" as neutral', () => {
            const result = parser.parse('neutral');
            expect(result.emotion).toBe('neutral');
        });

        it('should parse "calm" as calm', () => {
            const result = parser.parse('calm');
            expect(result.emotion).toBe('calm');
        });

        it('should parse "excited" as excited or joy', () => {
            const result = parser.parse('excited');
            expect(['excited', 'joy']).toContain(result.emotion);
        });

        it('should parse "love" as love', () => {
            const result = parser.parse('love');
            expect(result.emotion).toBe('love');
        });
    });

    describe('parse() - gestures', () => {
        it('should parse "bouncing" as bounce gesture', () => {
            const result = parser.parse('bouncing');
            expect(result.gestures).toContain('bounce');
        });

        it('should parse "nodding" as nod gesture', () => {
            const result = parser.parse('nodding');
            expect(result.gestures).toContain('nod');
        });

        it('should parse "waving" as wave gesture', () => {
            const result = parser.parse('waving');
            expect(result.gestures).toContain('wave');
        });

        it('should parse "spinning" as spin gesture', () => {
            const result = parser.parse('spinning');
            expect(result.gestures).toContain('spin');
        });
    });

    describe('parse() - shapes', () => {
        it('should parse "heart shape" as heart', () => {
            const result = parser.parse('heart shape');
            expect(result.shape).toBe('heart');
        });

        it('should parse "star" as star shape', () => {
            const result = parser.parse('star');
            expect(result.shape).toBe('star');
        });
    });

    describe('parse() - undertones', () => {
        it('should default undertone to "clear"', () => {
            const result = parser.parse('happy');
            expect(result.undertone).toBe('clear');
        });

        it('should parse undertone from "happy but nervous"', () => {
            const result = parser.parse('happy but nervous');
            // nervous should resolve as undertone when emotion already set
            expect(result.emotion).toBe('joy');
            expect(result.undertone).toBe('nervous');
        });
    });

    describe('parse() - modifiers', () => {
        it('should parse intensity modifiers', () => {
            const gentle = parser.parse('slightly happy');
            const strong = parser.parse('very happy');
            expect(strong.intensity).toBeGreaterThan(gentle.intensity);
        });

        it('should parse duration modifiers', () => {
            const quick = parser.parse('quick happy');
            const slow = parser.parse('slow happy');
            expect(slow.duration).toBeGreaterThan(quick.duration);
        });
    });

    describe('parse() - combined intents', () => {
        it('should parse emotion + gesture', () => {
            const result = parser.parse('happy, bouncing');
            expect(result.emotion).toBe('joy');
            expect(result.gestures).toContain('bounce');
        });

        it('should parse emotion + gesture + shape', () => {
            const result = parser.parse('happy, bouncing, heart shape');
            expect(result.emotion).toBe('joy');
            expect(result.gestures).toContain('bounce');
            expect(result.shape).toBe('heart');
        });

        it('should handle multiple gestures', () => {
            const result = parser.parse('bouncing, waving, spinning');
            expect(result.gestures.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('parse() - edge cases', () => {
        it('should return defaults for empty input', () => {
            const result = parser.parse('');
            expect(result.emotion).toBeNull();
            expect(result.gestures).toEqual([]);
            expect(result.shape).toBeNull();
            expect(result.undertone).toBe('clear');
        });

        it('should return defaults for null/undefined', () => {
            const result = parser.parse(null);
            expect(result.emotion).toBeNull();
            expect(result.gestures).toEqual([]);
        });

        it('should store raw input', () => {
            const result = parser.parse('happy, bouncing');
            expect(result.raw).toBe('happy, bouncing');
        });

        it('should track unrecognized tokens', () => {
            const result = parser.parse('xyznonexistent');
            expect(result.unrecognized.length).toBeGreaterThan(0);
        });

        it('should be case-insensitive', () => {
            const upper = parser.parse('HAPPY');
            const lower = parser.parse('happy');
            expect(upper.emotion).toBe(lower.emotion);
        });

        it('should not duplicate gestures', () => {
            const result = parser.parse('bouncing, bounce, bouncy');
            const bounceCount = result.gestures.filter(g => g === 'bounce').length;
            expect(bounceCount).toBeLessThanOrEqual(1);
        });
    });

    describe('validate()', () => {
        it('should validate a result with emotion', () => {
            const parsed = parser.parse('happy');
            const validation = parser.validate(parsed);
            expect(validation.valid).toBe(true);
            expect(validation.errors).toHaveLength(0);
        });

        it('should validate a result with gesture only', () => {
            const parsed = parser.parse('bouncing');
            const validation = parser.validate(parsed);
            expect(validation.valid).toBe(true);
        });

        it('should reject result with no actionable content', () => {
            const parsed = parser.parse('');
            const validation = parser.validate(parsed);
            expect(validation.valid).toBe(false);
            expect(validation.errors.length).toBeGreaterThan(0);
        });
    });

    describe('static methods', () => {
        it('getAvailableEmotions should return all emotions', () => {
            const emotions = IntentParser.getAvailableEmotions();
            expect(emotions.length).toBeGreaterThanOrEqual(8);
            expect(emotions).toContain('joy');
            expect(emotions).toContain('sadness');
            expect(emotions).toContain('anger');
        });

        it('getAvailableGestures should return all gestures', () => {
            const gestures = IntentParser.getAvailableGestures();
            expect(gestures.length).toBeGreaterThanOrEqual(10);
        });

        it('getAvailableShapes should return all shapes', () => {
            const shapes = IntentParser.getAvailableShapes();
            expect(shapes.length).toBeGreaterThanOrEqual(4);
            expect(shapes).toContain('heart');
            expect(shapes).toContain('star');
        });

        it('getAvailableUndertones should return all undertones', () => {
            const undertones = IntentParser.getAvailableUndertones();
            expect(undertones).toContain('nervous');
            expect(undertones).toContain('confident');
            expect(undertones).toContain('clear');
        });
    });
});
