import { describe, it, expect } from 'vitest';
import { APIValidator } from '../../../src/utils/apiValidation.js';

describe('APIValidator', () => {
    describe('validateSetEmotion', () => {
        it('should accept valid emotion with defaults', () => {
            const result = APIValidator.validateSetEmotion('joy');
            expect(result.success).toBe(true);
            expect(result.data.emotion).toBe('joy');
        });

        it('should accept valid emotion with options', () => {
            const result = APIValidator.validateSetEmotion('anger', {
                duration: 2000,
                intensity: 1.5,
            });
            expect(result.success).toBe(true);
            expect(result.data.emotion).toBe('anger');
        });

        it('should reject invalid emotion', () => {
            const result = APIValidator.validateSetEmotion('happy');
            expect(result.success).toBe(false);
            expect(result.error.type).toBe('VALIDATION_ERROR');
        });

        it('should reject invalid duration', () => {
            const result = APIValidator.validateSetEmotion('joy', { duration: -100 });
            expect(result.success).toBe(false);
        });

        it('should reject invalid intensity', () => {
            const result = APIValidator.validateSetEmotion('joy', { intensity: 5.0 });
            expect(result.success).toBe(false);
        });
    });

    describe('validateExpress', () => {
        it('should accept valid gesture with defaults', () => {
            const result = APIValidator.validateExpress('wave');
            expect(result.success).toBe(true);
            expect(result.data.gesture).toBe('wave');
        });

        it('should accept valid gesture with options', () => {
            const result = APIValidator.validateExpress('nod', {
                duration: 1000,
                intensity: 2.0,
                repeat: 3,
                delay: 500,
            });
            expect(result.success).toBe(true);
        });

        it('should reject invalid gesture', () => {
            const result = APIValidator.validateExpress('fly');
            expect(result.success).toBe(false);
        });

        it('should reject out-of-range repeat', () => {
            const result = APIValidator.validateExpress('wave', { repeat: 100 });
            expect(result.success).toBe(false);
        });
    });

    describe('validateChain', () => {
        it('should accept valid gesture array', () => {
            const result = APIValidator.validateChain(['wave', 'nod', 'bounce']);
            expect(result.success).toBe(true);
            expect(result.data.gestures).toEqual(['wave', 'nod', 'bounce']);
        });

        it('should reject empty array', () => {
            const result = APIValidator.validateChain([]);
            expect(result.success).toBe(false);
        });

        it('should reject non-array', () => {
            const result = APIValidator.validateChain('wave');
            expect(result.success).toBe(false);
        });

        it('should reject invalid gestures in array', () => {
            const result = APIValidator.validateChain(['wave', 'invalid_gesture']);
            expect(result.success).toBe(false);
        });

        it('should accept valid timing options', () => {
            const result = APIValidator.validateChain(['wave', 'nod'], {
                timing: 'sequential',
                interval: 500,
                loop: true,
            });
            expect(result.success).toBe(true);
        });

        it('should reject invalid timing value', () => {
            const result = APIValidator.validateChain(['wave'], { timing: 'invalid' });
            expect(result.success).toBe(false);
        });
    });

    describe('validateEventListener', () => {
        it('should accept valid event and callback', () => {
            const result = APIValidator.validateEventListener('emotionChanged', () => {});
            expect(result.success).toBe(true);
            expect(result.data.event).toBe('emotionChanged');
        });

        it('should reject unknown event names', () => {
            const result = APIValidator.validateEventListener('unknownEvent', () => {});
            expect(result.success).toBe(false);
        });

        it('should reject non-function callbacks', () => {
            const result = APIValidator.validateEventListener('emotionChanged', 'not a function');
            expect(result.success).toBe(false);
        });

        it('should accept all valid event names', () => {
            const validEvents = [
                'emotionChanged', 'gestureStarted', 'gestureCompleted',
                'chainCompleted', 'performanceDegraded', 'contextLost',
                'contextRestored', 'error',
            ];
            for (const event of validEvents) {
                const result = APIValidator.validateEventListener(event, () => {});
                expect(result.success).toBe(true);
            }
        });
    });

    describe('validateConstructorConfig', () => {
        it('should accept empty config', () => {
            const result = APIValidator.validateConstructorConfig({});
            expect(result.success).toBe(true);
        });

        it('should validate width/height ranges', () => {
            const result = APIValidator.validateConstructorConfig({
                width: 800,
                height: 600,
            });
            expect(result.success).toBe(true);
            expect(result.data.config.width).toBe(800);
        });

        it('should reject invalid width', () => {
            const result = APIValidator.validateConstructorConfig({ width: 50 });
            expect(result.success).toBe(false);
        });

        it('should validate boolean options', () => {
            const result = APIValidator.validateConstructorConfig({
                enableAudio: true,
                enableParticles: false,
                debug: true,
            });
            expect(result.success).toBe(true);
        });

        it('should warn about high particle count', () => {
            const result = APIValidator.validateConstructorConfig({
                maxParticles: 150,
            });
            expect(result.success).toBe(true);
            expect(result.data.warnings).toContain('High particle count may impact performance');
        });

        it('should pass through unknown properties', () => {
            const result = APIValidator.validateConstructorConfig({
                customProp: 'value',
            });
            expect(result.success).toBe(true);
            expect(result.data.config.customProp).toBe('value');
        });
    });

    describe('sanitizeUserInput', () => {
        it('should pass through null/undefined', () => {
            const result = APIValidator.sanitizeUserInput(null);
            expect(result.success).toBe(true);
            expect(result.data).toBeNull();
        });

        it('should remove XSS characters', () => {
            const result = APIValidator.sanitizeUserInput('<script>alert(1)</script>');
            expect(result.success).toBe(true);
            expect(result.data).not.toContain('<');
            expect(result.data).not.toContain('>');
        });

        it('should remove javascript: protocol', () => {
            const result = APIValidator.sanitizeUserInput('javascript:alert(1)');
            expect(result.success).toBe(true);
            expect(result.data).not.toContain('javascript:');
        });

        it('should validate emotion context', () => {
            const result = APIValidator.sanitizeUserInput('joy', 'emotion');
            expect(result.success).toBe(true);
            expect(result.data).toBe('joy');
        });

        it('should reject invalid emotion in emotion context', () => {
            const result = APIValidator.sanitizeUserInput('invalid_emotion', 'emotion');
            expect(result.success).toBe(false);
        });

        it('should truncate very long general input', () => {
            const longInput = 'a'.repeat(2000);
            const result = APIValidator.sanitizeUserInput(longInput, 'general');
            expect(result.success).toBe(true);
            expect(result.data.length).toBeLessThanOrEqual(1000);
        });
    });

    describe('validateNumericRange', () => {
        it('should validate known contexts', () => {
            const result = APIValidator.validateNumericRange(500, 'duration');
            expect(result.success).toBe(true);
        });

        it('should reject unknown context', () => {
            const result = APIValidator.validateNumericRange(5, 'unknown');
            expect(result.success).toBe(false);
        });

        it('should validate all available contexts', () => {
            const contexts = ['duration', 'intensity', 'delay', 'repeat', 'particleCount', 'volume', 'fps'];
            for (const ctx of contexts) {
                const result = APIValidator.validateNumericRange(1, ctx);
                // Should at least not throw
                expect(typeof result.success).toBe('boolean');
            }
        });
    });

    describe('batchValidate', () => {
        it('should validate multiple parameters', () => {
            const result = APIValidator.batchValidate(
                { name: 'test' },
                {
                    name: (v) => {
                        if (typeof v === 'string') return { success: true, data: v };
                        return { success: false, error: { message: 'must be string', severity: 'error' } };
                    },
                }
            );
            expect(result.success).toBe(true);
            expect(result.data.validatedParams.name).toBe('test');
        });

        it('should warn about params without validation rules', () => {
            const result = APIValidator.batchValidate(
                { unknown: 'value' },
                {}
            );
            expect(result.success).toBe(true);
            expect(result.data.warnings.length).toBeGreaterThan(0);
        });
    });
});
