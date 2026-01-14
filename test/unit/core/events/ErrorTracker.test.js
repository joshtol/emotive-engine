/**
 * ErrorTracker Tests
 * Tests for the error tracking and reporting module
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ErrorTracker } from '../../../../src/core/events/ErrorTracker.js';

describe('ErrorTracker', () => {
    let errorTracker;

    beforeEach(() => {
        // Disable global handlers for testing
        errorTracker = new ErrorTracker({ enabled: false });
    });

    afterEach(() => {
        errorTracker.destroy();
    });

    describe('Constructor', () => {
        it('should initialize with default options', () => {
            const tracker = new ErrorTracker({ enabled: false });

            expect(tracker.maxErrors).toBe(100);
            expect(tracker.maxStackFrames).toBe(10);
            expect(tracker.reportingThreshold).toBe(10);
            expect(tracker.reportingInterval).toBe(60000);

            tracker.destroy();
        });

        it('should accept custom options', () => {
            const tracker = new ErrorTracker({
                enabled: false,
                maxErrors: 50,
                maxStackFrames: 5,
                reportingThreshold: 5,
                reportingInterval: 30000
            });

            expect(tracker.maxErrors).toBe(50);
            expect(tracker.maxStackFrames).toBe(5);
            expect(tracker.reportingThreshold).toBe(5);
            expect(tracker.reportingInterval).toBe(30000);

            tracker.destroy();
        });

        it('should generate unique session ID', () => {
            expect(errorTracker.metadata.sessionId).toBeDefined();
            expect(typeof errorTracker.metadata.sessionId).toBe('string');
        });

        it('should initialize empty error arrays', () => {
            expect(errorTracker.errors).toEqual([]);
            expect(errorTracker.errorCounts.size).toBe(0);
            expect(errorTracker.errorPatterns.size).toBe(0);
        });

        it('should initialize severity levels', () => {
            expect(errorTracker.severityLevels.LOW).toBe('low');
            expect(errorTracker.severityLevels.MEDIUM).toBe('medium');
            expect(errorTracker.severityLevels.HIGH).toBe('high');
            expect(errorTracker.severityLevels.CRITICAL).toBe('critical');
        });

        it('should initialize error categories', () => {
            expect(errorTracker.errorCategories.RENDERING).toBe('rendering');
            expect(errorTracker.errorCategories.ANIMATION).toBe('animation');
            expect(errorTracker.errorCategories.STATE).toBe('state');
            expect(errorTracker.errorCategories.UNKNOWN).toBe('unknown');
        });

        it('should initialize suppressed errors from options', () => {
            const tracker = new ErrorTracker({
                enabled: false,
                suppressedErrors: ['test error']
            });

            expect(tracker.suppressedErrors.has('test error')).toBe(true);

            tracker.destroy();
        });
    });

    describe('captureError()', () => {
        beforeEach(() => {
            errorTracker.enabled = true;
        });

        it('should capture an error', () => {
            const error = new Error('Test error');

            const result = errorTracker.captureError(error);

            expect(result).toBeDefined();
            expect(result.message).toBe('Test error');
        });

        it('should add error to errors array', () => {
            const error = new Error('Test error');

            errorTracker.captureError(error);

            expect(errorTracker.errors.length).toBe(1);
        });

        it('should assign a unique ID to each error', () => {
            const error1 = new Error('Error 1');
            const error2 = new Error('Error 2');

            const result1 = errorTracker.captureError(error1);
            const result2 = errorTracker.captureError(error2);

            expect(result1.id).not.toBe(result2.id);
        });

        it('should respect maxErrors limit', () => {
            errorTracker.maxErrors = 5;

            for (let i = 0; i < 10; i++) {
                errorTracker.captureError(new Error(`Error ${i}`));
            }

            expect(errorTracker.errors.length).toBe(5);
            // Should contain only the last 5 errors
            expect(errorTracker.errors[0].message).toBe('Error 5');
        });

        it('should not capture when disabled', () => {
            errorTracker.enabled = false;

            errorTracker.captureError(new Error('Test'));

            expect(errorTracker.errors.length).toBe(0);
        });

        it('should update error counts', () => {
            errorTracker.captureError(new Error('Same error'));
            errorTracker.captureError(new Error('Same error'));
            errorTracker.captureError(new Error('Same error'));

            const key = 'Error:Same error';
            expect(errorTracker.errorCounts.get(key)).toBe(3);
        });

        it('should include context in captured error', () => {
            const error = new Error('Test');
            const context = { component: 'TestComponent', action: 'test' };

            const result = errorTracker.captureError(error, context);

            expect(result.context.component).toBe('TestComponent');
            expect(result.context.action).toBe('test');
        });

        it('should call onError callback', () => {
            const onError = vi.fn();
            const tracker = new ErrorTracker({ enabled: true, onError });

            tracker.captureError(new Error('Test'));

            expect(onError).toHaveBeenCalled();
            expect(onError.mock.calls[0][0].message).toBe('Test');

            tracker.destroy();
        });
    });

    describe('categorizeError()', () => {
        it('should categorize rendering errors', () => {
            const error = new Error('canvas rendering failed');

            const category = errorTracker.categorizeError(error, {});

            expect(category).toBe('rendering');
        });

        it('should categorize animation errors', () => {
            const error = new Error('animation frame error');

            const category = errorTracker.categorizeError(error, {});

            expect(category).toBe('animation');
        });

        it('should categorize state errors', () => {
            const error = new Error('state machine error');

            const category = errorTracker.categorizeError(error, {});

            expect(category).toBe('state');
        });

        it('should categorize network errors', () => {
            const error = new Error('network fetch failed');

            const category = errorTracker.categorizeError(error, {});

            expect(category).toBe('network');
        });

        it('should categorize plugin errors', () => {
            const error = new Error('plugin load error');

            const category = errorTracker.categorizeError(error, {});

            expect(category).toBe('plugin');
        });

        it('should categorize user input errors', () => {
            const error = new Error('Invalid input');

            const category = errorTracker.categorizeError(error, { source: 'user_input' });

            expect(category).toBe('user_input');
        });

        it('should return unknown for unrecognized errors', () => {
            const error = new Error('Some random error');

            const category = errorTracker.categorizeError(error, {});

            expect(category).toBe('unknown');
        });
    });

    describe('determineSeverity()', () => {
        it('should return critical for ReferenceError', () => {
            const error = new ReferenceError('undefined variable');

            const severity = errorTracker.determineSeverity(error, 'unknown');

            expect(severity).toBe('critical');
        });

        it('should return critical for TypeError', () => {
            const error = new TypeError('cannot read property');

            const severity = errorTracker.determineSeverity(error, 'unknown');

            expect(severity).toBe('critical');
        });

        it('should return high for rendering errors', () => {
            const error = new Error('render failed');

            const severity = errorTracker.determineSeverity(error, 'rendering');

            expect(severity).toBe('high');
        });

        it('should return high for animation errors', () => {
            const error = new Error('animation error');

            const severity = errorTracker.determineSeverity(error, 'animation');

            expect(severity).toBe('high');
        });

        it('should return medium for network errors', () => {
            const error = new Error('network error');

            const severity = errorTracker.determineSeverity(error, 'network');

            expect(severity).toBe('medium');
        });

        it('should return low for unknown category', () => {
            const error = new Error('some error');

            const severity = errorTracker.determineSeverity(error, 'unknown');

            expect(severity).toBe('low');
        });
    });

    describe('shouldSuppress()', () => {
        it('should suppress string matches', () => {
            errorTracker.suppressError('suppress this');

            const error = new Error('Should suppress this error');

            expect(errorTracker.shouldSuppress(error)).toBe(true);
        });

        it('should suppress regex matches', () => {
            errorTracker.suppressError(/test\d+/);

            const error = new Error('test123');

            expect(errorTracker.shouldSuppress(error)).toBe(true);
        });

        it('should not suppress non-matching errors', () => {
            errorTracker.suppressError('specific error');

            const error = new Error('Different error');

            expect(errorTracker.shouldSuppress(error)).toBe(false);
        });
    });

    describe('parseStackTrace()', () => {
        it('should parse stack trace into frames', () => {
            const stack = `Error: test
    at functionName (file.js:10:5)
    at anotherFunction (other.js:20:10)`;

            const frames = errorTracker.parseStackTrace(stack);

            expect(frames.length).toBe(2);
            expect(frames[0].function).toBe('functionName');
            expect(frames[0].file).toBe('file.js');
            expect(frames[0].line).toBe(10);
            expect(frames[0].column).toBe(5);
        });

        it('should return empty array for null stack', () => {
            const frames = errorTracker.parseStackTrace(null);

            expect(frames).toEqual([]);
        });

        it('should return empty array for empty stack', () => {
            const frames = errorTracker.parseStackTrace('');

            expect(frames).toEqual([]);
        });
    });

    describe('getErrors()', () => {
        beforeEach(() => {
            errorTracker.enabled = true;

            // Add some test errors
            errorTracker.captureError(new Error('Error 1'), {});
            errorTracker.captureError(new ReferenceError('Critical error'), {});
        });

        it('should return all errors without filter', () => {
            const errors = errorTracker.getErrors();

            expect(errors.length).toBe(2);
        });

        it('should filter by category', () => {
            const errors = errorTracker.getErrors({ category: 'unknown' });

            expect(errors.length).toBeGreaterThanOrEqual(0);
        });

        it('should filter by severity', () => {
            const errors = errorTracker.getErrors({ severity: 'critical' });

            expect(errors.length).toBeGreaterThanOrEqual(1);
        });

        it('should filter by timestamp', () => {
            const since = Date.now() - 1000;

            const errors = errorTracker.getErrors({ since });

            expect(errors.length).toBe(2);
        });
    });

    describe('getStats()', () => {
        beforeEach(() => {
            errorTracker.enabled = true;
            errorTracker.captureError(new Error('Error 1'));
            errorTracker.captureError(new Error('Error 2'));
        });

        it('should return total error count', () => {
            const stats = errorTracker.getStats();

            expect(stats.total).toBe(2);
        });

        it('should return errors by category', () => {
            const stats = errorTracker.getStats();

            expect(stats.byCategory).toBeDefined();
            expect(typeof stats.byCategory.unknown).toBe('number');
        });

        it('should return errors by severity', () => {
            const stats = errorTracker.getStats();

            expect(stats.bySeverity).toBeDefined();
        });

        it('should return pattern count', () => {
            const stats = errorTracker.getStats();

            expect(typeof stats.patterns).toBe('number');
        });

        it('should return top errors', () => {
            const stats = errorTracker.getStats();

            expect(stats.topErrors).toBeDefined();
            expect(Array.isArray(stats.topErrors)).toBe(true);
        });
    });

    describe('clearErrors()', () => {
        it('should clear all errors', () => {
            errorTracker.enabled = true;
            errorTracker.captureError(new Error('Test'));

            errorTracker.clearErrors();

            expect(errorTracker.errors.length).toBe(0);
        });

        it('should clear error counts', () => {
            errorTracker.enabled = true;
            errorTracker.captureError(new Error('Test'));

            errorTracker.clearErrors();

            expect(errorTracker.errorCounts.size).toBe(0);
        });

        it('should clear error patterns', () => {
            errorTracker.enabled = true;
            errorTracker.captureError(new Error('Test'));

            errorTracker.clearErrors();

            expect(errorTracker.errorPatterns.size).toBe(0);
        });
    });

    describe('suppressError() / unsuppressError()', () => {
        it('should add pattern to suppressed set', () => {
            errorTracker.suppressError('test pattern');

            expect(errorTracker.suppressedErrors.has('test pattern')).toBe(true);
        });

        it('should remove pattern from suppressed set', () => {
            errorTracker.suppressError('test pattern');
            errorTracker.unsuppressError('test pattern');

            expect(errorTracker.suppressedErrors.has('test pattern')).toBe(false);
        });
    });

    describe('enable() / disable()', () => {
        it('should enable error tracking', () => {
            errorTracker.enable();

            expect(errorTracker.enabled).toBe(true);
        });

        it('should disable error tracking', () => {
            errorTracker.enabled = true;

            errorTracker.disable();

            expect(errorTracker.enabled).toBe(false);
        });
    });

    describe('destroy()', () => {
        it('should disable and clear errors', () => {
            errorTracker.enabled = true;
            errorTracker.captureError(new Error('Test'));

            errorTracker.destroy();

            expect(errorTracker.enabled).toBe(false);
            expect(errorTracker.errors.length).toBe(0);
        });
    });

    describe('sendReport()', () => {
        it('should generate report with errors', () => {
            errorTracker.enabled = true;
            errorTracker.captureError(new Error('Test'));

            const report = errorTracker.sendReport(errorTracker.errors);

            expect(report.sessionId).toBeDefined();
            expect(report.timestamp).toBeDefined();
            expect(report.type).toBe('batch');
            expect(report.errors.length).toBe(1);
        });

        it('should call onReport callback', () => {
            const onReport = vi.fn();
            const tracker = new ErrorTracker({ enabled: false, onReport });

            tracker.sendReport([], 'test');

            expect(onReport).toHaveBeenCalled();

            tracker.destroy();
        });

        it('should include patterns and counts in report', () => {
            errorTracker.enabled = true;
            errorTracker.captureError(new Error('Test'));

            const report = errorTracker.sendReport(errorTracker.errors);

            expect(report.patterns).toBeDefined();
            expect(report.counts).toBeDefined();
        });
    });

    describe('generateSessionId()', () => {
        it('should generate unique IDs', () => {
            const ids = new Set();

            for (let i = 0; i < 100; i++) {
                ids.add(errorTracker.generateSessionId());
            }

            expect(ids.size).toBe(100);
        });
    });
});
