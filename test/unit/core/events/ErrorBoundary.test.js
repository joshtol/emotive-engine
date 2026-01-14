/**
 * ErrorBoundary Tests
 * Tests for the error handling and recovery system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import ErrorBoundary from '../../../../src/core/events/ErrorBoundary.js';

describe('ErrorBoundary', () => {
    let errorBoundary;

    beforeEach(() => {
        errorBoundary = new ErrorBoundary();
    });

    describe('Constructor', () => {
        it('should initialize with empty errors array', () => {
            expect(errorBoundary.errors).toEqual([]);
        });

        it('should initialize with default values', () => {
            expect(errorBoundary.defaults.emotion).toBe('neutral');
            expect(errorBoundary.defaults.gesture).toBeNull();
            expect(errorBoundary.defaults.audioLevel).toBe(0);
            expect(errorBoundary.defaults.glowIntensity).toBe(0.7);
        });

        it('should initialize error counts map', () => {
            expect(errorBoundary.errorCounts).toBeInstanceOf(Map);
            expect(errorBoundary.errorCounts.size).toBe(0);
        });
    });

    describe('wrap()', () => {
        it('should return result when function succeeds', () => {
            const fn = () => 'success';
            const wrapped = errorBoundary.wrap(fn, 'test');

            expect(wrapped()).toBe('success');
        });

        it('should return fallback when function throws', () => {
            const fn = () => { throw new Error('fail'); };
            const wrapped = errorBoundary.wrap(fn, 'test', 'fallback');

            expect(wrapped()).toBe('fallback');
        });

        it('should use context default when no fallback provided', () => {
            const fn = () => { throw new Error('fail'); };
            const wrapped = errorBoundary.wrap(fn, 'emotion-transition');

            expect(wrapped()).toBe('neutral');
        });

        it('should log error when function throws', () => {
            const fn = () => { throw new Error('test error'); };
            const wrapped = errorBoundary.wrap(fn, 'test-context');

            wrapped();

            expect(errorBoundary.errors.length).toBe(1);
            expect(errorBoundary.errors[0].context).toBe('test-context');
            expect(errorBoundary.errors[0].message).toBe('test error');
        });

        it('should pass arguments to wrapped function', () => {
            const fn = (a, b) => a + b;
            const wrapped = errorBoundary.wrap(fn, 'test');

            expect(wrapped(2, 3)).toBe(5);
        });
    });

    describe('logError()', () => {
        it('should add error to errors array', () => {
            const error = new Error('test');

            errorBoundary.logError(error, 'test-context');

            expect(errorBoundary.errors.length).toBe(1);
        });

        it('should include timestamp in error entry', () => {
            const error = new Error('test');

            errorBoundary.logError(error, 'test');

            expect(errorBoundary.errors[0].timestamp).toBeDefined();
        });

        it('should increment error count for context', () => {
            const error = new Error('test');

            errorBoundary.logError(error, 'ctx');
            errorBoundary.logError(error, 'ctx');
            errorBoundary.logError(error, 'ctx');

            expect(errorBoundary.errorCounts.get('ctx')).toBe(3);
        });

        it('should rotate errors when max exceeded', () => {
            errorBoundary.maxErrors = 3;

            for (let i = 0; i < 5; i++) {
                errorBoundary.logError(new Error(`error ${i}`), 'test');
            }

            expect(errorBoundary.errors.length).toBe(3);
            expect(errorBoundary.errors[0].message).toBe('error 2');
        });
    });

    describe('getDefault()', () => {
        it('should return neutral for emotion-transition', () => {
            expect(errorBoundary.getDefault('emotion-transition')).toBe('neutral');
        });

        it('should return null for gesture-execution', () => {
            expect(errorBoundary.getDefault('gesture-execution')).toBeNull();
        });

        it('should return 0 for audio-processing', () => {
            expect(errorBoundary.getDefault('audio-processing')).toBe(0);
        });

        it('should return rendering defaults object', () => {
            const defaults = errorBoundary.getDefault('rendering');

            expect(defaults.glowIntensity).toBe(0.7);
            expect(defaults.coreSize).toBe(1.0);
            expect(defaults.color).toBe('#B0B0B0');
        });

        it('should return null for unknown context', () => {
            expect(errorBoundary.getDefault('unknown')).toBeNull();
        });
    });

    describe('validateInput()', () => {
        it('should validate valid emotions', () => {
            expect(errorBoundary.validateInput('joy', 'emotion', 'neutral')).toBe('joy');
            expect(errorBoundary.validateInput('anger', 'emotion', 'neutral')).toBe('anger');
        });

        it('should return default for invalid emotion', () => {
            expect(errorBoundary.validateInput('invalid', 'emotion', 'neutral')).toBe('neutral');
        });

        it('should validate undertones', () => {
            expect(errorBoundary.validateInput('nervous', 'undertone', null)).toBe('nervous');
            expect(errorBoundary.validateInput(null, 'undertone', null)).toBeNull();
        });

        it('should return null for invalid undertone', () => {
            expect(errorBoundary.validateInput('invalid', 'undertone', null)).toBeNull();
        });

        it('should validate gestures', () => {
            expect(errorBoundary.validateInput('bounce', 'gesture', null)).toBe('bounce');
            expect(errorBoundary.validateInput('invalid', 'gesture', null)).toBeNull();
        });

        it('should validate numbers', () => {
            expect(errorBoundary.validateInput(42, 'number', 0)).toBe(42);
            expect(errorBoundary.validateInput('not a number', 'number', 0)).toBe(0);
            expect(errorBoundary.validateInput(NaN, 'number', 0)).toBe(0);
        });

        it('should validate strings', () => {
            expect(errorBoundary.validateInput('test', 'string', '')).toBe('test');
            expect(errorBoundary.validateInput(123, 'string', 'default')).toBe('default');
        });

        it('should validate booleans', () => {
            expect(errorBoundary.validateInput(true, 'boolean', false)).toBe(true);
            expect(errorBoundary.validateInput('yes', 'boolean', false)).toBe(false);
        });
    });

    describe('hasExceededThreshold()', () => {
        it('should return false when under threshold', () => {
            errorBoundary.logError(new Error('test'), 'ctx');

            expect(errorBoundary.hasExceededThreshold('ctx', 5)).toBe(false);
        });

        it('should return true when at threshold', () => {
            for (let i = 0; i < 5; i++) {
                errorBoundary.logError(new Error('test'), 'ctx');
            }

            expect(errorBoundary.hasExceededThreshold('ctx', 5)).toBe(true);
        });

        it('should return false for unknown context', () => {
            expect(errorBoundary.hasExceededThreshold('unknown', 5)).toBe(false);
        });
    });

    describe('getErrorStats()', () => {
        it('should return error statistics', () => {
            errorBoundary.logError(new Error('test1'), 'ctx1');
            errorBoundary.logError(new Error('test2'), 'ctx1');
            errorBoundary.logError(new Error('test3'), 'ctx2');

            const stats = errorBoundary.getErrorStats();

            expect(stats.totalErrors).toBe(3);
            expect(stats.errorsByContext.ctx1).toBe(2);
            expect(stats.errorsByContext.ctx2).toBe(1);
            expect(stats.recentErrors.length).toBe(3);
        });
    });

    describe('clearErrors()', () => {
        it('should clear all errors', () => {
            errorBoundary.logError(new Error('test'), 'ctx');

            errorBoundary.clearErrors();

            expect(errorBoundary.errors.length).toBe(0);
            expect(errorBoundary.errorCounts.size).toBe(0);
        });
    });

    describe('attemptRecovery()', () => {
        it('should succeed on first try if function works', async () => {
            const retryFn = vi.fn().mockResolvedValue('success');

            const result = await errorBoundary.attemptRecovery('test', retryFn);

            expect(result).toBe('success');
            expect(retryFn).toHaveBeenCalledTimes(1);
        });

        it('should retry on failure', async () => {
            const retryFn = vi.fn()
                .mockRejectedValueOnce(new Error('fail1'))
                .mockResolvedValue('success');

            const result = await errorBoundary.attemptRecovery('test', retryFn, 3);

            expect(result).toBe('success');
            expect(retryFn).toHaveBeenCalledTimes(2);
        });

        it('should throw after max retries', async () => {
            const retryFn = vi.fn().mockRejectedValue(new Error('always fails'));

            await expect(
                errorBoundary.attemptRecovery('test', retryFn, 2)
            ).rejects.toThrow('Recovery failed for test after 2 attempts');

            expect(retryFn).toHaveBeenCalledTimes(2);
        });

        it('should log errors for each failed attempt', async () => {
            const retryFn = vi.fn().mockRejectedValue(new Error('fail'));

            try {
                await errorBoundary.attemptRecovery('op', retryFn, 2);
            } catch {
                // Expected
            }

            expect(errorBoundary.errors.length).toBe(2);
            expect(errorBoundary.errors[0].context).toBe('recovery-op-attempt-1');
            expect(errorBoundary.errors[1].context).toBe('recovery-op-attempt-2');
        });
    });
});
