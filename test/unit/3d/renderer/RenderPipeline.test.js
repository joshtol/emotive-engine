import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RenderPipeline } from '../../../../src/3d/renderer/RenderPipeline.js';
import { BasePass } from '../../../../src/3d/passes/BasePass.js';

// Mock pass for testing
class MockPass extends BasePass {
    constructor(name) {
        super(name);
        this.setupCalled = false;
        this.executeCalled = false;
        this.resizeCalled = false;
    }

    setup() {
        this.setupCalled = true;
    }

    execute(scene, camera) {
        this.executeCalled = true;
        this.lastScene = scene;
        this.lastCamera = camera;
    }

    resize(width, height) {
        this.resizeCalled = true;
        this.lastWidth = width;
        this.lastHeight = height;
    }
}

describe('RenderPipeline', () => {
    let pipeline;
    let mockRenderer;
    let mockFBManager;

    beforeEach(() => {
        mockRenderer = { gl: {} };
        mockFBManager = { resize: vi.fn() };
        pipeline = new RenderPipeline(mockRenderer, mockFBManager);
    });

    describe('constructor', () => {
        it('should initialize with renderer and fbManager', () => {
            expect(pipeline.renderer).toBe(mockRenderer);
            expect(pipeline.fbManager).toBe(mockFBManager);
        });

        it('should initialize empty passes array', () => {
            expect(pipeline.passes).toEqual([]);
        });

        it('should create fbManager if not provided', () => {
            const pipelineWithoutFBM = new RenderPipeline(mockRenderer);

            expect(pipelineWithoutFBM.fbManager).toBeDefined();
        });
    });

    describe('addPass()', () => {
        it('should add pass to pipeline', () => {
            const pass = new MockPass('test');

            pipeline.addPass(pass);

            expect(pipeline.passes).toContain(pass);
        });

        it('should initialize pass with renderer and fbManager', () => {
            const pass = new MockPass('test');

            pipeline.addPass(pass);

            expect(pass.renderer).toBe(mockRenderer);
            expect(pass.fbManager).toBe(mockFBManager);
            expect(pass.setupCalled).toBe(true);
        });

        it('should maintain pass order', () => {
            const pass1 = new MockPass('first');
            const pass2 = new MockPass('second');

            pipeline.addPass(pass1);
            pipeline.addPass(pass2);

            expect(pipeline.passes[0]).toBe(pass1);
            expect(pipeline.passes[1]).toBe(pass2);
        });
    });

    describe('removePass()', () => {
        it('should remove pass from pipeline', () => {
            const pass = new MockPass('test');
            pipeline.addPass(pass);

            pipeline.removePass(pass);

            expect(pipeline.passes).not.toContain(pass);
        });

        it('should do nothing if pass not in pipeline', () => {
            const pass = new MockPass('test');

            expect(() => pipeline.removePass(pass)).not.toThrow();
        });
    });

    describe('render()', () => {
        it('should execute all enabled passes in order', () => {
            const pass1 = new MockPass('first');
            const pass2 = new MockPass('second');
            pipeline.addPass(pass1);
            pipeline.addPass(pass2);

            const scene = {};
            const camera = {};
            pipeline.render(scene, camera);

            expect(pass1.executeCalled).toBe(true);
            expect(pass2.executeCalled).toBe(true);
            expect(pass1.lastScene).toBe(scene);
            expect(pass2.lastCamera).toBe(camera);
        });

        it('should skip disabled passes', () => {
            const pass1 = new MockPass('enabled');
            const pass2 = new MockPass('disabled');
            pass2.enabled = false;

            pipeline.addPass(pass1);
            pipeline.addPass(pass2);

            pipeline.render({}, {});

            expect(pass1.executeCalled).toBe(true);
            expect(pass2.executeCalled).toBe(false);
        });
    });

    describe('resize()', () => {
        it('should resize fbManager', () => {
            pipeline.resize(1024, 768);

            expect(mockFBManager.resize).toHaveBeenCalledWith(1024, 768);
        });

        it('should resize all passes', () => {
            const pass1 = new MockPass('first');
            const pass2 = new MockPass('second');
            pipeline.addPass(pass1);
            pipeline.addPass(pass2);

            pipeline.resize(1024, 768);

            expect(pass1.resizeCalled).toBe(true);
            expect(pass1.lastWidth).toBe(1024);
            expect(pass1.lastHeight).toBe(768);
            expect(pass2.resizeCalled).toBe(true);
        });
    });
});
