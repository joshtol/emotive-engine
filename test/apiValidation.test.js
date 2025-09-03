/**
 * Tests for API validation utilities
 * Validates comprehensive parameter validation and sanitization for public API methods
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { APIValidator } from '../src/utils/apiValidation.js';
import { ErrorTypes } from '../src/core/ErrorResponse.js';

describe('APIValidator', () => {
  describe('validateSetEmotion', () => {
    it('should validate correct emotion and options', () => {
      const result = APIValidator.validateSetEmotion('joy', {
        duration: 2000,
        intensity: 1.5,
        easing: 'ease-in-out',
        undertone: 'moderate'
      });

      expect(result.success).toBe(true);
      expect(result.data.emotion).toBe('joy');
      expect(result.data.options.duration).toBe(2000);
      expect(result.data.options.intensity).toBe(1.5);
      expect(result.data.options.easing).toBe('ease-in-out');
      expect(result.data.options.undertone).toBe('moderate');
    });

    it('should use default values for missing options', () => {
      const result = APIValidator.validateSetEmotion('sadness');

      expect(result.success).toBe(true);
      expect(result.data.emotion).toBe('sadness');
      expect(result.data.options.duration).toBe(1000);
      expect(result.data.options.intensity).toBe(1.0);
      expect(result.data.options.easing).toBe('ease-in-out');
      expect(result.data.options.undertone).toBe(null);
    });

    it('should reject invalid emotion', () => {
      const result = APIValidator.validateSetEmotion('invalid-emotion');

      expect(result.success).toBe(false);
      expect(result.error.type).toBe(ErrorTypes.VALIDATION_ERROR);
      expect(result.error.message).toContain('setEmotion validation failed');
    });

    it('should reject invalid options', () => {
      const result = APIValidator.validateSetEmotion('joy', {
        duration: -100,
        intensity: 5.0,
        easing: 'invalid-easing'
      });

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('validation failed');
    });

    it('should normalize emotion case', () => {
      const result = APIValidator.validateSetEmotion('JOY');

      expect(result.success).toBe(true);
      expect(result.data.emotion).toBe('joy');
    });
  });

  describe('validateExpress', () => {
    it('should validate correct gesture and options', () => {
      const result = APIValidator.validateExpress('wave', {
        duration: 1000,
        intensity: 2.0,
        repeat: 3,
        delay: 500
      });

      expect(result.success).toBe(true);
      expect(result.data.gesture).toBe('wave');
      expect(result.data.options.duration).toBe(1000);
      expect(result.data.options.intensity).toBe(2.0);
      expect(result.data.options.repeat).toBe(3);
      expect(result.data.options.delay).toBe(500);
    });

    it('should use default values for missing options', () => {
      const result = APIValidator.validateExpress('nod');

      expect(result.success).toBe(true);
      expect(result.data.gesture).toBe('nod');
      expect(result.data.options.duration).toBe(500);
      expect(result.data.options.intensity).toBe(1.0);
      expect(result.data.options.repeat).toBe(1);
      expect(result.data.options.delay).toBe(0);
    });

    it('should reject invalid gesture', () => {
      const result = APIValidator.validateExpress('invalid-gesture');

      expect(result.success).toBe(false);
      expect(result.error.type).toBe(ErrorTypes.VALIDATION_ERROR);
    });

    it('should validate numeric ranges', () => {
      const result = APIValidator.validateExpress('bounce', {
        duration: 50, // Too low
        intensity: 5.0, // Too high
        repeat: 15 // Too high
      });

      expect(result.success).toBe(false);
    });
  });

  describe('validateChain', () => {
    it('should validate correct gesture chain', () => {
      const result = APIValidator.validateChain(['wave', 'nod', 'bounce'], {
        timing: 'sequential',
        interval: 300,
        loop: true
      });

      expect(result.success).toBe(true);
      expect(result.data.gestures).toEqual(['wave', 'nod', 'bounce']);
      expect(result.data.options.timing).toBe('sequential');
      expect(result.data.options.interval).toBe(300);
      expect(result.data.options.loop).toBe(true);
    });

    it('should reject empty gesture array', () => {
      const result = APIValidator.validateChain([]);

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('must have at least 1 items');
    });

    it('should reject too many gestures', () => {
      const gestures = new Array(15).fill('wave');
      const result = APIValidator.validateChain(gestures);

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('truncated to 10 items');
    });

    it('should reject invalid gestures in chain', () => {
      const result = APIValidator.validateChain(['wave', 'invalid', 'nod']);

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Invalid gesture at index 1');
    });

    it('should validate timing options', () => {
      const result = APIValidator.validateChain(['wave'], {
        timing: 'invalid-timing'
      });

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Invalid timing');
    });
  });

  describe('validateEventListener', () => {
    it('should validate correct event and callback', () => {
      const callback = () => {};
      const result = APIValidator.validateEventListener('emotionChanged', callback);

      expect(result.success).toBe(true);
      expect(result.data.event).toBe('emotionChanged');
      expect(result.data.callback).toBe(callback);
    });

    it('should reject invalid event name', () => {
      const result = APIValidator.validateEventListener('invalidEvent', () => {});

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Unknown event');
    });

    it('should reject non-function callback', () => {
      const result = APIValidator.validateEventListener('emotionChanged', 'not-a-function');

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('callback must be a function');
    });

    it('should validate all supported events', () => {
      const validEvents = [
        'emotionChanged', 'gestureStarted', 'gestureCompleted', 'chainCompleted',
        'performanceDegraded', 'contextLost', 'contextRestored', 'error'
      ];

      validEvents.forEach(event => {
        const result = APIValidator.validateEventListener(event, () => {});
        expect(result.success).toBe(true);
      });
    });
  });

  describe('validateConstructorConfig', () => {
    it('should validate correct configuration', () => {
      const config = {
        width: 800,
        height: 600,
        enableAudio: true,
        maxParticles: 30
      };

      const result = APIValidator.validateConstructorConfig(config);

      expect(result.success).toBe(true);
      expect(result.data.config.width).toBe(800);
      expect(result.data.config.enableAudio).toBe(true);
    });

    it('should provide warnings for performance concerns', () => {
      const config = {
        maxParticles: 150 // High particle count
      };

      const result = APIValidator.validateConstructorConfig(config);

      expect(result.success).toBe(true);
      expect(result.data.warnings).toContain('High particle count may impact performance');
    });

    it('should warn when both audio and particles are disabled', () => {
      const config = {
        enableAudio: false,
        enableParticles: false
      };

      const result = APIValidator.validateConstructorConfig(config);

      expect(result.success).toBe(true);
      expect(result.data.warnings).toContain('Both audio and particles disabled - limited visual feedback available');
    });

    it('should validate canvas element', () => {
      const mockCanvas = {
        getContext: () => ({})
      };

      const config = { canvas: mockCanvas };
      const result = APIValidator.validateConstructorConfig(config);

      expect(result.success).toBe(true);
    });

    it('should reject invalid canvas element', () => {
      const invalidCanvas = { notACanvas: true };
      const config = { canvas: invalidCanvas };

      const result = APIValidator.validateConstructorConfig(config);

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('does not support getContext method');
    });
  });

  describe('sanitizeUserInput', () => {
    it('should sanitize HTML characters', () => {
      const result = APIValidator.sanitizeUserInput('<script>alert("xss")</script>joy');

      expect(result.success).toBe(true);
      expect(result.data).not.toContain('<script>');
      expect(result.data).not.toContain('alert');
    });

    it('should remove dangerous protocols', () => {
      const result = APIValidator.sanitizeUserInput('javascript:alert("xss")');

      expect(result.success).toBe(true);
      expect(result.data).not.toContain('javascript:');
    });

    it('should validate emotion context', () => {
      const result = APIValidator.sanitizeUserInput('joy', 'emotion');

      expect(result.success).toBe(true);
      expect(result.data).toBe('joy');
    });

    it('should reject invalid emotion after sanitization', () => {
      const result = APIValidator.sanitizeUserInput('<script>invalid</script>', 'emotion');

      expect(result.success).toBe(false);
      expect(result.error.type).toBe(ErrorTypes.INVALID_EMOTION);
    });

    it('should limit general input length', () => {
      const longInput = 'a'.repeat(2000);
      const result = APIValidator.sanitizeUserInput(longInput);

      expect(result.success).toBe(true);
      expect(result.data.length).toBe(1000);
    });

    it('should handle null and undefined input', () => {
      expect(APIValidator.sanitizeUserInput(null).success).toBe(true);
      expect(APIValidator.sanitizeUserInput(undefined).success).toBe(true);
    });
  });

  describe('validateNumericRange', () => {
    it('should validate duration range', () => {
      const result = APIValidator.validateNumericRange(2000, 'duration');

      expect(result.success).toBe(true);
      expect(result.data).toBe(2000);
    });

    it('should reject out-of-range values', () => {
      const result = APIValidator.validateNumericRange(15000, 'duration');

      expect(result.success).toBe(false);
    });

    it('should handle integer contexts', () => {
      const result = APIValidator.validateNumericRange(2.5, 'repeat');

      expect(result.success).toBe(true);
      expect(result.data).toBe(3); // Rounded to integer
    });

    it('should reject unknown contexts', () => {
      const result = APIValidator.validateNumericRange(100, 'unknownContext');

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Unknown numeric context');
    });
  });

  describe('batchValidate', () => {
    it('should validate multiple parameters successfully', () => {
      const params = {
        emotion: 'joy',
        duration: 2000,
        intensity: 1.5
      };

      const rules = {
        emotion: (value) => APIValidator.sanitizeUserInput(value, 'emotion'),
        duration: (value) => APIValidator.validateNumericRange(value, 'duration'),
        intensity: (value) => APIValidator.validateNumericRange(value, 'intensity')
      };

      const result = APIValidator.batchValidate(params, rules);

      expect(result.success).toBe(true);
      expect(result.data.validatedParams.emotion).toBe('joy');
      expect(result.data.validatedParams.duration).toBe(2000);
      expect(result.data.validatedParams.intensity).toBe(1.5);
    });

    it('should collect multiple validation errors', () => {
      const params = {
        emotion: 'invalid',
        duration: -100,
        intensity: 10
      };

      const rules = {
        emotion: (value) => APIValidator.sanitizeUserInput(value, 'emotion'),
        duration: (value) => APIValidator.validateNumericRange(value, 'duration'),
        intensity: (value) => APIValidator.validateNumericRange(value, 'intensity')
      };

      const result = APIValidator.batchValidate(params, rules);

      expect(result.success).toBe(false);
      expect(result.error.context.errors.length).toBeGreaterThan(1);
    });

    it('should handle missing validation rules', () => {
      const params = {
        emotion: 'joy',
        unknownParam: 'value'
      };

      const rules = {
        emotion: (value) => APIValidator.sanitizeUserInput(value, 'emotion')
      };

      const result = APIValidator.batchValidate(params, rules);

      expect(result.success).toBe(true);
      expect(result.data.warnings).toContain('No validation rule for parameter: unknownParam');
      expect(result.data.validatedParams.unknownParam).toBe('value');
    });

    it('should handle validation exceptions', () => {
      const params = {
        emotion: 'joy'
      };

      const rules = {
        emotion: () => { throw new Error('Validation error'); }
      };

      const result = APIValidator.batchValidate(params, rules);

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Validation error');
    });
  });

  describe('validateMethodParams', () => {
    it('should validate method parameters with schema', () => {
      const params = ['joy', { duration: 1000 }];
      const schema = [
        (value) => APIValidator.sanitizeUserInput(value, 'emotion'),
        (value) => ({ success: true, data: value })
      ];

      const result = APIValidator.validateMethodParams('setEmotion', params, schema);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toBe('joy');
    });

    it('should collect parameter validation errors', () => {
      const params = ['invalid', 'also-invalid'];
      const schema = [
        (value) => APIValidator.sanitizeUserInput(value, 'emotion'),
        (value) => APIValidator.sanitizeUserInput(value, 'gesture')
      ];

      const result = APIValidator.validateMethodParams('testMethod', params, schema);

      expect(result.success).toBe(false);
      expect(result.error.context.method).toBe('testMethod');
      expect(result.error.context.errors.length).toBe(2);
    });

    it('should handle validation exceptions in method params', () => {
      const params = ['test'];
      const schema = [
        () => { throw new Error('Schema error'); }
      ];

      const result = APIValidator.validateMethodParams('testMethod', params, schema);

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Validation error');
    });
  });
});