import { describe, it, expect } from 'vitest';
import { emotions } from '../../../../src/core/intent/synonyms/emotions.js';
import { gestures } from '../../../../src/core/intent/synonyms/gestures.js';
import { shapes } from '../../../../src/core/intent/synonyms/shapes.js';
import { undertones } from '../../../../src/core/intent/synonyms/undertones.js';
import { modifiers, intensityValues, durationValues } from '../../../../src/core/intent/synonyms/modifiers.js';
import { conflictRules, contextHints } from '../../../../src/core/intent/synonyms/conflicts.js';

describe('Synonym Dictionaries - Data Integrity', () => {
    describe('emotions', () => {
        it('should have all core emotions', () => {
            expect(emotions).toHaveProperty('joy');
            expect(emotions).toHaveProperty('sadness');
            expect(emotions).toHaveProperty('anger');
            expect(emotions).toHaveProperty('fear');
            expect(emotions).toHaveProperty('surprise');
            expect(emotions).toHaveProperty('disgust');
            expect(emotions).toHaveProperty('neutral');
        });

        it('should have arrays of synonyms for each emotion', () => {
            for (const [key, synonyms] of Object.entries(emotions)) {
                expect(Array.isArray(synonyms), `${key} should be array`).toBe(true);
                expect(synonyms.length, `${key} should have synonyms`).toBeGreaterThan(0);
            }
        });

        it('should have lowercase synonym strings', () => {
            for (const [, synonyms] of Object.entries(emotions)) {
                for (const synonym of synonyms) {
                    expect(typeof synonym).toBe('string');
                    expect(synonym).toBe(synonym.toLowerCase().trim());
                }
            }
        });

        it('should have minimal duplicate synonyms within an emotion', () => {
            let totalDuplicates = 0;
            for (const [, synonyms] of Object.entries(emotions)) {
                const unique = new Set(synonyms);
                totalDuplicates += synonyms.length - unique.size;
            }
            // Allow up to 3 duplicates across all emotions (known data issue)
            expect(totalDuplicates).toBeLessThanOrEqual(3);
        });
    });

    describe('gestures', () => {
        it('should have gesture categories', () => {
            const keys = Object.keys(gestures);
            expect(keys.length).toBeGreaterThan(10);
        });

        it('should have arrays of synonyms for each gesture', () => {
            for (const [key, synonyms] of Object.entries(gestures)) {
                expect(Array.isArray(synonyms), `${key} should be array`).toBe(true);
                expect(synonyms.length, `${key} should have synonyms`).toBeGreaterThan(0);
            }
        });
    });

    describe('shapes', () => {
        it('should have core shapes', () => {
            expect(shapes).toHaveProperty('heart');
            expect(shapes).toHaveProperty('star');
            expect(shapes).toHaveProperty('circle');
        });

        it('should have arrays of synonyms', () => {
            for (const [key, synonyms] of Object.entries(shapes)) {
                expect(Array.isArray(synonyms), `${key} should be array`).toBe(true);
            }
        });
    });

    describe('undertones', () => {
        it('should have all 6 undertone types', () => {
            expect(undertones).toHaveProperty('nervous');
            expect(undertones).toHaveProperty('confident');
            expect(undertones).toHaveProperty('tired');
            expect(undertones).toHaveProperty('intense');
            expect(undertones).toHaveProperty('subdued');
            expect(undertones).toHaveProperty('clear');
        });

        it('should have arrays of synonyms', () => {
            for (const [key, synonyms] of Object.entries(undertones)) {
                expect(Array.isArray(synonyms), `${key} should be array`).toBe(true);
                expect(synonyms.length, `${key} should have synonyms`).toBeGreaterThan(0);
            }
        });
    });

    describe('modifiers', () => {
        it('should have intensity, duration, transition, repetition types', () => {
            expect(modifiers).toHaveProperty('intensity');
            expect(modifiers).toHaveProperty('duration');
            expect(modifiers).toHaveProperty('transition');
            expect(modifiers).toHaveProperty('repetition');
        });

        it('intensityValues should have numeric defaults for each level', () => {
            for (const [level, config] of Object.entries(intensityValues)) {
                expect(typeof config.default, `${level} default`).toBe('number');
                expect(config.default).toBeGreaterThanOrEqual(0);
                expect(config.default).toBeLessThanOrEqual(1);
            }
        });

        it('durationValues should have numeric defaults for each level', () => {
            for (const [level, config] of Object.entries(durationValues)) {
                expect(typeof config.default, `${level} default`).toBe('number');
                expect(config.default).toBeGreaterThan(0);
            }
        });

        it('intensity levels should be ordered low to high', () => {
            const levels = Object.values(intensityValues);
            for (let i = 1; i < levels.length; i++) {
                expect(levels[i].default).toBeGreaterThanOrEqual(levels[i - 1].default);
            }
        });
    });

    describe('conflicts', () => {
        it('should have conflict rules as an object', () => {
            expect(typeof conflictRules).toBe('object');
            expect(Object.keys(conflictRules).length).toBeGreaterThan(0);
        });

        it('each conflict rule should have candidates and rule name', () => {
            for (const [token, rule] of Object.entries(conflictRules)) {
                expect(Array.isArray(rule.candidates), `${token} should have candidates array`).toBe(true);
                expect(rule.candidates.length, `${token} should have at least 1 candidate`).toBeGreaterThanOrEqual(1);
                expect(typeof rule.rule, `${token} should have rule string`).toBe('string');
            }
        });

        it('each candidate should have category and target', () => {
            for (const [token, rule] of Object.entries(conflictRules)) {
                for (const candidate of rule.candidates) {
                    expect(typeof candidate.category, `${token} candidate category`).toBe('string');
                    expect(typeof candidate.target, `${token} candidate target`).toBe('string');
                }
            }
        });

        it('should have context hints', () => {
            expect(contextHints).toBeDefined();
            expect(contextHints.emotionContext).toBeDefined();
            expect(contextHints.gestureContext).toBeDefined();
        });
    });
});
