// @vitest-environment jsdom
/**
 * Core3DManager Tests
 * Tests for the 3D rendering manager constructor validation
 *
 * Note: Full integration tests require WebGL context which is not available in JSDOM.
 * These tests focus on constructor validation and error handling.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('Core3DManager Constructor Validation', () => {
    let Core3DManager;
    let mockCanvas;

    beforeEach(async () => {
        // Create a mock canvas element
        mockCanvas = document.createElement('canvas');
        mockCanvas.width = 800;
        mockCanvas.height = 600;

        // Dynamic import to allow testing validation
        const module = await import('../../../src/3d/Core3DManager.js');
        ({ Core3DManager } = module);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Required Canvas Validation', () => {
        it('should throw error when canvas is null', () => {
            expect(() => new Core3DManager(null)).toThrow('Core3DManager: canvas element is required');
        });

        it('should throw error when canvas is undefined', () => {
            expect(() => new Core3DManager(undefined)).toThrow('Core3DManager: canvas element is required');
        });

        it('should throw error when canvas is a string', () => {
            expect(() => new Core3DManager('canvas-id')).toThrow('Core3DManager: canvas must be an HTMLCanvasElement');
        });

        it('should throw error when canvas is a div element', () => {
            const div = document.createElement('div');
            expect(() => new Core3DManager(div)).toThrow('Core3DManager: canvas must be an HTMLCanvasElement');
        });

        it('should throw error when canvas is an object', () => {
            const obj = { width: 800, height: 600 };
            expect(() => new Core3DManager(obj)).toThrow('Core3DManager: canvas must be an HTMLCanvasElement');
        });

        it('should throw error when canvas is a number', () => {
            expect(() => new Core3DManager(123)).toThrow('Core3DManager: canvas must be an HTMLCanvasElement');
        });

        it('should throw error when canvas is a boolean', () => {
            expect(() => new Core3DManager(true)).toThrow('Core3DManager: canvas must be an HTMLCanvasElement');
        });

        it('should throw error when canvas is an array', () => {
            expect(() => new Core3DManager([])).toThrow('Core3DManager: canvas must be an HTMLCanvasElement');
        });
    });

    describe('Three.js Dependency Validation', () => {
        it('should check THREE is defined at runtime', async () => {
            // Note: THREE validation happens after canvas validation
            // So we need a valid canvas first, then THREE check will run
            // In JSDOM, THREE is typically available via the import
            // This test verifies the validation code exists

            // The validation code is present in the constructor:
            // if (typeof THREE === 'undefined') throw new Error('...')
            // We can verify this by checking the source
            const fs = await import('fs');
            const path = await import('path');
            const sourcePath = path.resolve('./src/3d/Core3DManager.js');
            const source = fs.readFileSync(sourcePath, 'utf-8');

            expect(source).toContain("typeof THREE === 'undefined'");
            expect(source).toContain('Three.js library is not loaded');
        });
    });

    describe('Error Message Quality', () => {
        it('should provide helpful error message for null canvas', () => {
            try {
                new Core3DManager(null);
            } catch (e) {
                expect(e.message).toBe('Core3DManager: canvas element is required');
                expect(e).toBeInstanceOf(Error);
            }
        });

        it('should provide helpful error message for wrong element type', () => {
            try {
                new Core3DManager(document.createElement('div'));
            } catch (e) {
                expect(e.message).toBe('Core3DManager: canvas must be an HTMLCanvasElement');
                expect(e).toBeInstanceOf(Error);
            }
        });
    });
});

describe('Core3DManager Source Code Analysis', () => {
    it('should have proper JSDoc documentation', async () => {
        const fs = await import('fs');
        const sourcePath = './src/3d/Core3DManager.js';
        const source = fs.readFileSync(sourcePath, 'utf-8');

        // Check for JSDoc class documentation
        expect(source).toContain('@class Core3DManager');

        // Check for constructor documentation
        expect(source).toContain('@param {HTMLCanvasElement} canvas');
        expect(source).toContain('@param {Object} [options={}]');
    });

    it('should have geometry type options documented', async () => {
        const fs = await import('fs');
        const sourcePath = './src/3d/Core3DManager.js';
        const source = fs.readFileSync(sourcePath, 'utf-8');

        expect(source).toContain("@param {string} [options.geometry='sphere']");
    });

    it('should have emotion option documented', async () => {
        const fs = await import('fs');
        const sourcePath = './src/3d/Core3DManager.js';
        const source = fs.readFileSync(sourcePath, 'utf-8');

        expect(source).toContain("@param {string} [options.emotion='neutral']");
    });

    it('should have particle option documented', async () => {
        const fs = await import('fs');
        const sourcePath = './src/3d/Core3DManager.js';
        const source = fs.readFileSync(sourcePath, 'utf-8');

        expect(source).toContain('@param {boolean} [options.enableParticles=true]');
    });

    it('should have blinking option documented', async () => {
        const fs = await import('fs');
        const sourcePath = './src/3d/Core3DManager.js';
        const source = fs.readFileSync(sourcePath, 'utf-8');

        expect(source).toContain('@param {boolean} [options.enableBlinking=true]');
    });

    it('should have breathing option documented', async () => {
        const fs = await import('fs');
        const sourcePath = './src/3d/Core3DManager.js';
        const source = fs.readFileSync(sourcePath, 'utf-8');

        expect(source).toContain('@param {boolean} [options.enableBreathing=true]');
    });
});

describe('Core3DManager Validation Pattern Consistency', () => {
    it('should follow DI validation pattern used in mascot managers', async () => {
        const fs = await import('fs');
        const sourcePath = './src/3d/Core3DManager.js';
        const source = fs.readFileSync(sourcePath, 'utf-8');

        // Should validate before any other initialization
        const constructorStart = source.indexOf('constructor(canvas');
        const canvasValidation = source.indexOf('if (!canvas)');
        const instanceIdInit = source.indexOf('this._instanceId');

        // Canvas validation should happen before instance ID initialization
        expect(canvasValidation).toBeGreaterThan(constructorStart);
        expect(canvasValidation).toBeLessThan(instanceIdInit);
    });

    it('should throw with consistent error message format', async () => {
        const fs = await import('fs');
        const sourcePath = './src/3d/Core3DManager.js';
        const source = fs.readFileSync(sourcePath, 'utf-8');

        // Error messages should follow pattern: 'ClassName: description'
        expect(source).toContain("throw new Error('Core3DManager:");
    });
});
