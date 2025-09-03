/**
 * Tests for ErrorResponse system
 * Validates error handling, logging, and validation utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ErrorResponse, ErrorTypes, ErrorSeverity } from '../src/core/ErrorResponse.js';
import { ErrorLogger, getErrorLogger, resetErrorLogger } from '../src/core/ErrorLogger.js';
import { Validator, Sanitizer } from '../src/utils/validation.js';

describe('ErrorResponse', () => {
  describe('Basic functionality', () => {
    it('should create success response', () => {
      const response = ErrorResponse.success({ test: 'data' });
      
      expect(response.success).toBe(true);
      expect(response.data).toEqual({ test: 'data' });
      expect(response.timestamp).toBeTypeOf('number');
    });

    it('should create failure response', () => {
      const response = ErrorResponse.failure(
        ErrorTypes.INVALID_EMOTION,
        'Test error message',
        { context: 'test' }
      );
      
      expect(response.success).toBe(false);
      expect(response.error.type).toBe(ErrorTypes.INVALID_EMOTION);
      expect(response.error.message).toBe('Test error message');
      expect(response.error.context).toEqual({ context: 'test' });
      expect(response.error.severity).toBe('error');
      expect(response.error.recoveryActions).toBeInstanceOf(Array);
    });

    it('should create warning response', () => {
      const response = ErrorResponse.warning(
        ErrorTypes.PERFORMANCE_DEGRADED,
        'Performance warning'
      );
      
      expect(response.success).toBe(false);
      expect(response.error.severity).toBe('warning');
    });
  });

  describe('Recovery actions', () => {
    it('should generate appropriate recovery actions for known error types', () => {
      const response = ErrorResponse.failure(ErrorTypes.INVALID_EMOTION, 'Test');
      
      expect(response.error.recoveryActions).toContain(
        'Check if emotion is one of: joy, sadness, anger, fear, surprise, disgust, contempt, neutral'
      );
    });

    it('should generate generic recovery actions for unknown error types', () => {
      const response = ErrorResponse.failure('UNKNOWN_ERROR', 'Test');
      
      expect(response.error.recoveryActions).toContain(
        'Check console for additional error details'
      );
    });
  });

  describe('Utility methods', () => {
    let response;

    beforeEach(() => {
      response = ErrorResponse.failure(ErrorTypes.CANVAS_CONTEXT_LOST, 'Context lost');
    });

    it('should log error appropriately', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      response.log();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[EmotiveMascot] CANVAS_CONTEXT_LOST: Context lost'),
        expect.any(Object)
      );
      
      consoleSpy.mockRestore();
    });

    it('should get display message', () => {
      const message = response.getDisplayMessage();
      expect(message).toBe('CANVAS_CONTEXT_LOST: Context lost');
    });

    it('should check if recoverable', () => {
      expect(response.isRecoverable()).toBe(true);
    });

    it('should get severity', () => {
      expect(response.getSeverity()).toBe('error');
    });

    it('should convert to JSON', () => {
      const json = response.toJSON();
      
      expect(json.success).toBe(false);
      expect(json.error.type).toBe(ErrorTypes.CANVAS_CONTEXT_LOST);
    });
  });
});

describe('ErrorLogger', () => {
  let logger;

  beforeEach(() => {
    resetErrorLogger();
    logger = new ErrorLogger({
      enableConsoleLogging: false // Disable for testing
    });
  });

  afterEach(() => {
    resetErrorLogger();
  });

  describe('Logging functionality', () => {
    it('should log error and store entry', () => {
      const errorResponse = ErrorResponse.failure(ErrorTypes.INVALID_EMOTION, 'Test error');
      
      const logEntry = logger.logError(errorResponse);
      
      expect(logEntry.type).toBe(ErrorTypes.INVALID_EMOTION);
      expect(logEntry.message).toBe('Test error');
      expect(logEntry.errorCount).toBe(1);
      expect(logger.getLogs()).toHaveLength(1);
    });

    it('should track error counts', () => {
      const errorResponse = ErrorResponse.failure(ErrorTypes.INVALID_EMOTION, 'Test error');
      
      logger.logError(errorResponse);
      logger.logError(errorResponse);
      
      expect(logger.getErrorCount(ErrorTypes.INVALID_EMOTION)).toBe(2);
    });

    it('should maintain maximum log size', () => {
      const smallLogger = new ErrorLogger({ maxLogEntries: 2 });
      const errorResponse = ErrorResponse.failure(ErrorTypes.INVALID_EMOTION, 'Test');
      
      smallLogger.logError(errorResponse);
      smallLogger.logError(errorResponse);
      smallLogger.logError(errorResponse);
      
      expect(smallLogger.getLogs()).toHaveLength(2);
    });
  });

  describe('Filtering and statistics', () => {
    beforeEach(() => {
      logger.logError(ErrorResponse.failure(ErrorTypes.INVALID_EMOTION, 'Error 1'));
      logger.logError(ErrorResponse.warning(ErrorTypes.PERFORMANCE_DEGRADED, 'Warning 1'));
      logger.logError(ErrorResponse.failure(ErrorTypes.INVALID_GESTURE, 'Error 2'));
    });

    it('should filter logs by type', () => {
      const filtered = logger.getLogs({ type: ErrorTypes.INVALID_EMOTION });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].type).toBe(ErrorTypes.INVALID_EMOTION);
    });

    it('should filter logs by severity', () => {
      const filtered = logger.getLogs({ severity: 'warning' });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].severity).toBe('warning');
    });

    it('should generate error statistics', () => {
      const stats = logger.getErrorStatistics();
      
      expect(stats.totalErrors).toBe(3);
      expect(stats.errorsByType[ErrorTypes.INVALID_EMOTION]).toBe(1);
      expect(stats.errorsBySeverity.error).toBe(2);
      expect(stats.errorsBySeverity.warning).toBe(1);
    });
  });

  describe('Export functionality', () => {
    beforeEach(() => {
      logger.logError(ErrorResponse.failure(ErrorTypes.INVALID_EMOTION, 'Test error'));
    });

    it('should export logs as JSON', () => {
      const exported = logger.exportLogs('json');
      const parsed = JSON.parse(exported);
      
      expect(parsed.logs).toHaveLength(1);
      expect(parsed.statistics.totalErrors).toBe(1);
    });

    it('should export logs as CSV', () => {
      const exported = logger.exportLogs('csv');
      
      expect(exported).toContain('"timestamp","type","severity","message","errorCount"');
      expect(exported).toContain(ErrorTypes.INVALID_EMOTION);
    });

    it('should throw error for unsupported format', () => {
      expect(() => logger.exportLogs('xml')).toThrow('Unsupported export format: xml');
    });
  });

  describe('Global logger', () => {
    it('should create and reuse global logger instance', () => {
      const logger1 = getErrorLogger();
      const logger2 = getErrorLogger();
      
      expect(logger1).toBe(logger2);
    });

    it('should reset global logger', () => {
      const logger1 = getErrorLogger();
      resetErrorLogger();
      const logger2 = getErrorLogger();
      
      expect(logger1).not.toBe(logger2);
    });
  });
});

describe('Validator', () => {
  describe('Emotion validation', () => {
    it('should validate correct emotions', () => {
      const result = Validator.validateEmotion('joy');
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('joy');
    });

    it('should normalize emotion case', () => {
      const result = Validator.validateEmotion('JOY');
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('joy');
    });

    it('should reject invalid emotions', () => {
      const result = Validator.validateEmotion('invalid');
      
      expect(result.success).toBe(false);
      expect(result.error.type).toBe(ErrorTypes.INVALID_EMOTION);
    });

    it('should reject non-string emotions', () => {
      const result = Validator.validateEmotion(123);
      
      expect(result.success).toBe(false);
      expect(result.error.message).toContain('must be a string');
    });
  });

  describe('Number validation', () => {
    it('should validate numbers within range', () => {
      const result = Validator.validateNumber(50, { min: 0, max: 100 });
      
      expect(result.success).toBe(true);
      expect(result.data).toBe(50);
    });

    it('should clamp numbers to range with warning', () => {
      const result = Validator.validateNumber(150, { min: 0, max: 100 });
      
      expect(result.success).toBe(false);
      expect(result.error.severity).toBe('warning');
    });

    it('should convert string numbers', () => {
      const result = Validator.validateNumber('42.5');
      
      expect(result.success).toBe(true);
      expect(result.data).toBe(42.5);
    });

    it('should round to integer when required', () => {
      const result = Validator.validateNumber(42.7, { integer: true });
      
      expect(result.success).toBe(true);
      expect(result.data).toBe(43);
    });
  });

  describe('String validation', () => {
    it('should validate strings within length limits', () => {
      const result = Validator.validateString('test', { minLength: 2, maxLength: 10 });
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('test');
    });

    it('should truncate long strings with warning', () => {
      const result = Validator.validateString('toolongstring', { maxLength: 5 });
      
      expect(result.success).toBe(false);
      expect(result.error.severity).toBe('warning');
    });

    it('should validate against pattern', () => {
      const result = Validator.validateString('test123', { pattern: /^[a-z]+\d+$/ });
      
      expect(result.success).toBe(true);
    });

    it('should reject strings not matching pattern', () => {
      const result = Validator.validateString('test', { pattern: /^\d+$/ });
      
      expect(result.success).toBe(false);
    });
  });

  describe('Configuration validation', () => {
    it('should validate complete configuration', () => {
      const config = {
        width: 800,
        height: 600,
        enableAudio: true,
        maxParticles: 30
      };
      
      const result = Validator.validateConfig(config);
      
      if (!result.success) {
        console.log('Validation failed:', result.error);
      }
      
      expect(result.success).toBe(true);
      expect(result.data.width).toBe(800);
      expect(result.data.enableAudio).toBe(true);
    });
  });
});

describe('Sanitizer', () => {
  describe('String sanitization', () => {
    it('should remove null bytes and control characters', () => {
      const input = 'test\x00string\x01with\x1Fcontrol';
      const result = Sanitizer.sanitizeString(input);
      
      expect(result).toBe('teststringwithcontrol');
    });

    it('should trim whitespace', () => {
      const result = Sanitizer.sanitizeString('  test  ');
      
      expect(result).toBe('test');
    });
  });

  describe('HTML sanitization', () => {
    it('should remove script tags', () => {
      const html = '<div>Safe</div><script>alert("xss")</script>';
      const result = Validator.sanitizeHTML(html);
      
      expect(result).toBe('<div>Safe</div>');
    });

    it('should remove event handlers', () => {
      const html = '<div onclick="alert()">Test</div>';
      const result = Validator.sanitizeHTML(html);
      
      expect(result).toBe('<div>Test</div>');
    });
  });

  describe('Input sanitization', () => {
    it('should sanitize by type', () => {
      expect(Sanitizer.sanitizeInput('123', 'number')).toBe(123);
      expect(Sanitizer.sanitizeInput('true', 'boolean')).toBe(true);
      expect(Sanitizer.sanitizeInput('  test  ', 'string')).toBe('test');
    });
  });
});