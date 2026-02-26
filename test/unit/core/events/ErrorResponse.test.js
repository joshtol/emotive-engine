import { describe, it, expect, vi } from 'vitest';
import {
    ErrorResponse,
    ErrorTypes,
    ErrorSeverity,
} from '../../../../src/core/events/ErrorResponse.js';

describe('ErrorResponse', () => {
    describe('static success()', () => {
        it('should create a success response with data', () => {
            const result = ErrorResponse.success({ value: 42 });
            expect(result.success).toBe(true);
            expect(result.data).toEqual({ value: 42 });
            expect(result.timestamp).toBeTypeOf('number');
        });

        it('should create a success response with null data by default', () => {
            const result = ErrorResponse.success();
            expect(result.success).toBe(true);
            expect(result.data).toBeNull();
        });

        it('should include a timestamp', () => {
            const before = Date.now();
            const result = ErrorResponse.success();
            const after = Date.now();
            expect(result.timestamp).toBeGreaterThanOrEqual(before);
            expect(result.timestamp).toBeLessThanOrEqual(after);
        });
    });

    describe('static failure()', () => {
        it('should create an error response', () => {
            const err = ErrorResponse.failure(
                ErrorTypes.INVALID_EMOTION,
                'Bad emotion',
                { received: 'xyz' }
            );
            expect(err.success).toBe(false);
            expect(err.error.type).toBe('INVALID_EMOTION');
            expect(err.error.message).toBe('Bad emotion');
            expect(err.error.context).toEqual({ received: 'xyz' });
            expect(err.error.severity).toBe('error');
        });

        it('should generate recovery actions', () => {
            const err = ErrorResponse.failure(ErrorTypes.INVALID_EMOTION, 'Bad emotion');
            expect(err.error.recoveryActions).toBeInstanceOf(Array);
            expect(err.error.recoveryActions.length).toBeGreaterThan(0);
        });
    });

    describe('static warning()', () => {
        it('should create a warning response', () => {
            const warn = ErrorResponse.warning(
                ErrorTypes.PERFORMANCE_DEGRADED,
                'Slow rendering'
            );
            expect(warn.success).toBe(false);
            expect(warn.error.severity).toBe('warning');
        });
    });

    describe('generateRecoveryActions()', () => {
        it('should return specific actions for INVALID_EMOTION', () => {
            const err = ErrorResponse.failure(ErrorTypes.INVALID_EMOTION, 'test');
            const actions = err.error.recoveryActions;
            expect(actions.some(a => a.includes('emotion'))).toBe(true);
        });

        it('should return specific actions for INVALID_GESTURE', () => {
            const err = ErrorResponse.failure(ErrorTypes.INVALID_GESTURE, 'test');
            const actions = err.error.recoveryActions;
            expect(actions.some(a => a.includes('gesture'))).toBe(true);
        });

        it('should return specific actions for CANVAS_CONTEXT_LOST', () => {
            const err = ErrorResponse.failure(ErrorTypes.CANVAS_CONTEXT_LOST, 'test');
            const actions = err.error.recoveryActions;
            expect(actions.some(a => a.includes('Canvas') || a.includes('canvas'))).toBe(true);
        });

        it('should return default actions for unknown error types', () => {
            const err = ErrorResponse.failure('UNKNOWN_TYPE', 'test');
            const actions = err.error.recoveryActions;
            expect(actions.some(a => a.includes('console'))).toBe(true);
        });

        it('should include docs links in recovery actions', () => {
            const err = ErrorResponse.failure(ErrorTypes.INVALID_EMOTION, 'test');
            const actions = err.error.recoveryActions;
            expect(actions.some(a => a.includes('Docs:'))).toBe(true);
        });
    });

    describe('instance methods', () => {
        it('getDisplayMessage() should format type and message', () => {
            const err = ErrorResponse.failure(ErrorTypes.INVALID_EMOTION, 'Bad input');
            expect(err.getDisplayMessage()).toBe('INVALID_EMOTION: Bad input');
        });

        it('isRecoverable() should return true when recovery actions exist', () => {
            const err = ErrorResponse.failure(ErrorTypes.INVALID_EMOTION, 'test');
            expect(err.isRecoverable()).toBe(true);
        });

        it('getSeverity() should return the severity level', () => {
            const err = ErrorResponse.failure(ErrorTypes.INVALID_EMOTION, 'test');
            expect(err.getSeverity()).toBe('error');

            const warn = ErrorResponse.warning(ErrorTypes.PERFORMANCE_DEGRADED, 'test');
            expect(warn.getSeverity()).toBe('warning');
        });

        it('toJSON() should serialize correctly', () => {
            const err = ErrorResponse.failure(ErrorTypes.INVALID_EMOTION, 'test');
            const json = err.toJSON();
            expect(json.success).toBe(false);
            expect(json.error.type).toBe('INVALID_EMOTION');
            expect(json.error.message).toBe('test');
            expect(json.error.timestamp).toBeTypeOf('number');
        });

        it('log() should call console.error for errors', () => {
            const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const err = ErrorResponse.failure(ErrorTypes.INVALID_EMOTION, 'test');
            err.log();
            expect(spy).toHaveBeenCalledOnce();
            spy.mockRestore();
        });

        it('log() should call console.warn for warnings', () => {
            const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const warn = ErrorResponse.warning(ErrorTypes.PERFORMANCE_DEGRADED, 'test');
            warn.log();
            expect(spy).toHaveBeenCalledOnce();
            spy.mockRestore();
        });
    });
});

describe('ErrorTypes', () => {
    it('should have all expected validation error types', () => {
        expect(ErrorTypes.INVALID_EMOTION).toBe('INVALID_EMOTION');
        expect(ErrorTypes.INVALID_GESTURE).toBe('INVALID_GESTURE');
        expect(ErrorTypes.INVALID_PARAMETER).toBe('INVALID_PARAMETER');
        expect(ErrorTypes.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
    });

    it('should have all expected system error types', () => {
        expect(ErrorTypes.CANVAS_CONTEXT_LOST).toBe('CANVAS_CONTEXT_LOST');
        expect(ErrorTypes.AUDIO_CONTEXT_FAILED).toBe('AUDIO_CONTEXT_FAILED');
        expect(ErrorTypes.INITIALIZATION_ERROR).toBe('INITIALIZATION_ERROR');
    });

    it('should have all expected performance error types', () => {
        expect(ErrorTypes.PERFORMANCE_DEGRADED).toBe('PERFORMANCE_DEGRADED');
        expect(ErrorTypes.MEMORY_LIMIT_EXCEEDED).toBe('MEMORY_LIMIT_EXCEEDED');
        expect(ErrorTypes.FRAME_RATE_LOW).toBe('FRAME_RATE_LOW');
    });

    it('should have all expected resource/network/compat error types', () => {
        expect(ErrorTypes.RESOURCE_LOAD_FAILED).toBe('RESOURCE_LOAD_FAILED');
        expect(ErrorTypes.NETWORK_ERROR).toBe('NETWORK_ERROR');
        expect(ErrorTypes.FEATURE_NOT_SUPPORTED).toBe('FEATURE_NOT_SUPPORTED');
    });
});

describe('ErrorSeverity', () => {
    it('should have all severity levels', () => {
        expect(ErrorSeverity.CRITICAL).toBe('critical');
        expect(ErrorSeverity.ERROR).toBe('error');
        expect(ErrorSeverity.WARNING).toBe('warning');
        expect(ErrorSeverity.INFO).toBe('info');
    });
});
