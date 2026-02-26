import { describe, it, expect } from 'vitest';
import { Validator, Sanitizer } from '../../../src/utils/validation.js';

describe('Validator', () => {
    describe('validateEmotion', () => {
        it('should accept all valid emotions', () => {
            const valid = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'contempt', 'neutral'];
            for (const emotion of valid) {
                const result = Validator.validateEmotion(emotion);
                expect(result.success).toBe(true);
                expect(result.data).toBe(emotion);
            }
        });

        it('should normalize case and whitespace', () => {
            const result = Validator.validateEmotion('  JOY  ');
            expect(result.success).toBe(true);
            expect(result.data).toBe('joy');
        });

        it('should reject invalid emotions', () => {
            const result = Validator.validateEmotion('happiness');
            expect(result.success).toBe(false);
            expect(result.error.type).toBe('INVALID_EMOTION');
        });

        it('should reject non-string types', () => {
            const result = Validator.validateEmotion(123);
            expect(result.success).toBe(false);
            expect(result.error.message).toContain('string');
        });

        it('should provide "Did you mean?" suggestions for typos', () => {
            const result = Validator.validateEmotion('joye');
            expect(result.success).toBe(false);
            expect(result.error.message).toContain('Did you mean');
        });
    });

    describe('validateGesture', () => {
        it('should accept all valid gestures', () => {
            const valid = ['wave', 'nod', 'shake', 'bounce', 'spin', 'pulse', 'float', 'dance', 'celebrate', 'think'];
            for (const gesture of valid) {
                const result = Validator.validateGesture(gesture);
                expect(result.success).toBe(true);
                expect(result.data).toBe(gesture);
            }
        });

        it('should reject invalid gestures', () => {
            const result = Validator.validateGesture('fly');
            expect(result.success).toBe(false);
            expect(result.error.type).toBe('INVALID_GESTURE');
        });

        it('should reject non-string types', () => {
            const result = Validator.validateGesture(null);
            expect(result.success).toBe(false);
        });
    });

    describe('validateNumber', () => {
        it('should accept valid numbers', () => {
            const result = Validator.validateNumber(5, { min: 0, max: 10 });
            expect(result.success).toBe(true);
            expect(result.data).toBe(5);
        });

        it('should parse string numbers', () => {
            const result = Validator.validateNumber('3.14', { min: 0, max: 10 });
            expect(result.success).toBe(true);
            expect(result.data).toBeCloseTo(3.14);
        });

        it('should warn and clamp for below minimum', () => {
            const result = Validator.validateNumber(-5, { min: 0, max: 10 });
            expect(result.success).toBe(false);
            expect(result.error.severity).toBe('warning');
        });

        it('should warn and clamp for above maximum', () => {
            const result = Validator.validateNumber(15, { min: 0, max: 10 });
            expect(result.success).toBe(false);
            expect(result.error.severity).toBe('warning');
        });

        it('should reject non-numeric values', () => {
            const result = Validator.validateNumber('abc');
            expect(result.success).toBe(false);
            expect(result.error.type).toBe('INVALID_PARAMETER');
        });

        it('should round to integer when integer option is set', () => {
            const result = Validator.validateNumber(3.7, { integer: true, min: 0, max: 10 });
            expect(result.success).toBe(true);
            expect(result.data).toBe(4);
        });
    });

    describe('validateBoolean', () => {
        it('should accept boolean values', () => {
            expect(Validator.validateBoolean(true).data).toBe(true);
            expect(Validator.validateBoolean(false).data).toBe(false);
        });

        it('should parse string booleans', () => {
            expect(Validator.validateBoolean('true').data).toBe(true);
            expect(Validator.validateBoolean('false').data).toBe(false);
            expect(Validator.validateBoolean('1').data).toBe(true);
            expect(Validator.validateBoolean('0').data).toBe(false);
        });

        it('should convert numbers to boolean', () => {
            expect(Validator.validateBoolean(1).data).toBe(true);
            expect(Validator.validateBoolean(0).data).toBe(false);
        });

        it('should warn for unconvertible values', () => {
            const result = Validator.validateBoolean('maybe');
            expect(result.success).toBe(false);
            expect(result.error.severity).toBe('warning');
        });
    });

    describe('validateString', () => {
        it('should accept valid strings', () => {
            const result = Validator.validateString('hello');
            expect(result.success).toBe(true);
            expect(result.data).toBe('hello');
        });

        it('should return default for null/undefined', () => {
            expect(Validator.validateString(null).data).toBe('');
            expect(Validator.validateString(undefined).data).toBe('');
        });

        it('should reject empty strings when not allowed', () => {
            const result = Validator.validateString('', { allowEmpty: false });
            expect(result.success).toBe(false);
        });

        it('should validate minimum length', () => {
            const result = Validator.validateString('hi', { minLength: 5 });
            expect(result.success).toBe(false);
        });

        it('should truncate strings exceeding maxLength', () => {
            const result = Validator.validateString('hello world', { maxLength: 5 });
            expect(result.success).toBe(false);
            expect(result.error.severity).toBe('warning');
        });

        it('should validate pattern', () => {
            const result = Validator.validateString('abc123', { pattern: /^[a-z]+$/ });
            expect(result.success).toBe(false);
        });

        it('should convert non-strings', () => {
            const result = Validator.validateString(42);
            expect(result.success).toBe(true);
            expect(result.data).toBe('42');
        });
    });

    describe('validateObject', () => {
        it('should accept valid objects', () => {
            const result = Validator.validateObject({ key: 'value' });
            expect(result.success).toBe(true);
        });

        it('should return empty object for null/undefined', () => {
            expect(Validator.validateObject(null).data).toEqual({});
            expect(Validator.validateObject(undefined).data).toEqual({});
        });

        it('should reject non-objects', () => {
            expect(Validator.validateObject('string').success).toBe(false);
            expect(Validator.validateObject([1, 2]).success).toBe(false);
        });

        it('should validate with schema functions', () => {
            const schema = {
                name: (v) => {
                    if (typeof v !== 'string') {
                        return { success: false, error: { message: 'must be string' } };
                    }
                    return { success: true, data: v };
                },
            };
            const result = Validator.validateObject({ name: 'test' }, schema);
            expect(result.success).toBe(true);
            expect(result.data.name).toBe('test');
        });

        it('should pass through non-schema properties', () => {
            const result = Validator.validateObject({ extra: 'data' }, {});
            expect(result.success).toBe(true);
            expect(result.data.extra).toBe('data');
        });
    });

    describe('validateArray', () => {
        it('should accept valid arrays', () => {
            const result = Validator.validateArray([1, 2, 3]);
            expect(result.success).toBe(true);
            expect(result.data).toEqual([1, 2, 3]);
        });

        it('should return default for null/undefined', () => {
            expect(Validator.validateArray(null).data).toEqual([]);
        });

        it('should reject non-arrays', () => {
            expect(Validator.validateArray('string').success).toBe(false);
        });

        it('should validate minimum length', () => {
            const result = Validator.validateArray([], { minLength: 1 });
            expect(result.success).toBe(false);
        });

        it('should warn for exceeding maxLength', () => {
            const result = Validator.validateArray([1, 2, 3], { maxLength: 2 });
            expect(result.success).toBe(false);
            expect(result.error.severity).toBe('warning');
        });

        it('should validate items with itemValidator', () => {
            const itemValidator = (v) => {
                if (typeof v !== 'number') {
                    return { success: false, error: { message: 'must be number' } };
                }
                return { success: true, data: v };
            };
            const result = Validator.validateArray([1, 'two', 3], { itemValidator });
            expect(result.success).toBe(false);
        });
    });

    describe('sanitizeHTML', () => {
        it('should remove script tags', () => {
            const result = Validator.sanitizeHTML('<script>alert("xss")</script>Hello');
            expect(result).not.toContain('script');
            expect(result).toContain('Hello');
        });

        it('should remove event handlers', () => {
            const result = Validator.sanitizeHTML('<div onmouseover="alert(1)">test</div>');
            expect(result).not.toContain('onmouseover');
        });

        it('should remove javascript: protocol', () => {
            const result = Validator.sanitizeHTML('<a href="javascript:alert(1)">link</a>');
            expect(result).not.toContain('javascript:');
        });

        it('should return empty string for non-strings', () => {
            expect(Validator.sanitizeHTML(null)).toBe('');
            expect(Validator.sanitizeHTML(123)).toBe('');
        });
    });
});

describe('Sanitizer', () => {
    describe('sanitizeInput', () => {
        it('should pass through null/undefined', () => {
            expect(Sanitizer.sanitizeInput(null)).toBeNull();
            expect(Sanitizer.sanitizeInput(undefined)).toBeUndefined();
        });

        it('should sanitize string type by default', () => {
            const result = Sanitizer.sanitizeInput('  hello  ');
            expect(result).toBe('hello');
        });

        it('should sanitize numbers', () => {
            expect(Sanitizer.sanitizeInput('42', 'number')).toBe(42);
            expect(Sanitizer.sanitizeInput('abc', 'number')).toBe(0);
        });

        it('should sanitize booleans', () => {
            expect(Sanitizer.sanitizeInput('true', 'boolean')).toBe(true);
            expect(Sanitizer.sanitizeInput('false', 'boolean')).toBe(false);
        });

        it('should sanitize html type', () => {
            const result = Sanitizer.sanitizeInput('<script>xss</script>safe', 'html');
            expect(result).not.toContain('script');
        });
    });

    describe('sanitizeString', () => {
        it('should remove null bytes', () => {
            expect(Sanitizer.sanitizeString('hel\0lo')).toBe('hello');
        });

        it('should remove control characters', () => {
            expect(Sanitizer.sanitizeString('hello\x01world')).toBe('helloworld');
        });

        it('should trim whitespace', () => {
            expect(Sanitizer.sanitizeString('  hello  ')).toBe('hello');
        });

        it('should convert non-strings', () => {
            expect(Sanitizer.sanitizeString(42)).toBe('42');
            expect(Sanitizer.sanitizeString(null)).toBe('');
        });
    });

    describe('sanitizeNumber', () => {
        it('should parse valid numbers', () => {
            expect(Sanitizer.sanitizeNumber('42')).toBe(42);
            expect(Sanitizer.sanitizeNumber(3.14)).toBe(3.14);
        });

        it('should return 0 for invalid numbers', () => {
            expect(Sanitizer.sanitizeNumber('abc')).toBe(0);
            expect(Sanitizer.sanitizeNumber(NaN)).toBe(0);
        });
    });

    describe('sanitizeBoolean', () => {
        it('should pass through booleans', () => {
            expect(Sanitizer.sanitizeBoolean(true)).toBe(true);
            expect(Sanitizer.sanitizeBoolean(false)).toBe(false);
        });

        it('should parse string booleans', () => {
            expect(Sanitizer.sanitizeBoolean('true')).toBe(true);
            expect(Sanitizer.sanitizeBoolean('1')).toBe(true);
            expect(Sanitizer.sanitizeBoolean('yes')).toBe(true);
            expect(Sanitizer.sanitizeBoolean('false')).toBe(false);
            expect(Sanitizer.sanitizeBoolean('no')).toBe(false);
        });

        it('should coerce other types', () => {
            expect(Sanitizer.sanitizeBoolean(1)).toBe(true);
            expect(Sanitizer.sanitizeBoolean(0)).toBe(false);
        });
    });
});
