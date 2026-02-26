import { describe, it, expect } from 'vitest';
import { tokenize, isConnector, isNegation } from '../../../../src/core/intent/tokenizer.js';

describe('tokenize', () => {
    it('should return empty tokens for empty/invalid input', () => {
        expect(tokenize('').tokens).toEqual([]);
        expect(tokenize(null).tokens).toEqual([]);
        expect(tokenize(undefined).tokens).toEqual([]);
        expect(tokenize(123).tokens).toEqual([]);
    });

    it('should split on comma separators', () => {
        const { tokens } = tokenize('happy, bouncing');
        expect(tokens).toContain('happy');
        expect(tokens).toContain('bouncing');
    });

    it('should split on semicolons and pipes', () => {
        const { tokens: t1 } = tokenize('happy; sad');
        expect(t1.length).toBeGreaterThanOrEqual(2);

        const { tokens: t2 } = tokenize('happy | sad');
        expect(t2.length).toBeGreaterThanOrEqual(2);
    });

    it('should strip filler words (a, the, is, etc.)', () => {
        const { tokens } = tokenize('the happy mascot is bouncing');
        expect(tokens).not.toContain('the');
        expect(tokens).not.toContain('is');
        expect(tokens).toContain('happy');
    });

    it('should keep connector words (but, and, or)', () => {
        const { tokens } = tokenize('happy but nervous');
        expect(tokens).toContain('but');
    });

    it('should keep negation words (not, no, never)', () => {
        const { tokens } = tokenize('not happy');
        expect(tokens).toContain('not');
    });

    it('should keep modifier words (very, really, extremely)', () => {
        const { tokens } = tokenize('very happy');
        expect(tokens).toContain('very');
    });

    it('should normalize to lowercase', () => {
        const { tokens } = tokenize('HAPPY, BOUNCING');
        expect(tokens).toContain('happy');
        expect(tokens).toContain('bouncing');
    });

    it('should extract multi-word phrases as single tokens', () => {
        const { tokens } = tokenize('bouncing up and down');
        expect(tokens).toContain('bouncing up and down');
    });

    it('should extract "leaning in" as a phrase', () => {
        const { tokens } = tokenize('curious, leaning in');
        expect(tokens).toContain('leaning in');
    });

    it('should handle multi-word modifier phrases', () => {
        const { tokens } = tokenize('a little bit happy');
        // "a little bit" should be extracted as a phrase
        expect(tokens).toContain('a little bit');
    });

    it('should return segments split by separators', () => {
        const { segments } = tokenize('happy, sad, angry');
        expect(segments).toHaveLength(3);
    });

    it('should collapse whitespace', () => {
        const { tokens } = tokenize('happy    bouncing');
        expect(tokens.some(t => t.includes('  '))).toBe(false);
    });
});

describe('isConnector', () => {
    it('should return true for connector words', () => {
        expect(isConnector('but')).toBe(true);
        expect(isConnector('and')).toBe(true);
        expect(isConnector('or')).toBe(true);
        expect(isConnector('yet')).toBe(true);
        expect(isConnector('while')).toBe(true);
        expect(isConnector('although')).toBe(true);
        expect(isConnector('with')).toBe(true);
    });

    it('should return false for non-connectors', () => {
        expect(isConnector('happy')).toBe(false);
        expect(isConnector('very')).toBe(false);
        expect(isConnector('')).toBe(false);
    });
});

describe('isNegation', () => {
    it('should return true for negation words', () => {
        expect(isNegation('not')).toBe(true);
        expect(isNegation('no')).toBe(true);
        expect(isNegation('never')).toBe(true);
        expect(isNegation("don't")).toBe(true);
        expect(isNegation('dont')).toBe(true);
    });

    it('should return false for non-negations', () => {
        expect(isNegation('happy')).toBe(false);
        expect(isNegation('yes')).toBe(false);
    });
});
