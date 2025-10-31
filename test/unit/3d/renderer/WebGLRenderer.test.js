import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { WebGLRenderer } from '../../../../src/3d/renderer/WebGLRenderer.js';

// Mock HTMLCanvasElement and WebGL2RenderingContext
class MockWebGL2RenderingContext {
    constructor() {
        this.DEPTH_TEST = 0x0B71;
        this.LEQUAL = 0x0203;
        this.BLEND = 0x0BE2;
        this.SRC_ALPHA = 0x0302;
        this.ONE_MINUS_SRC_ALPHA = 0x0303;
        this.CULL_FACE = 0x0B44;
        this.BACK = 0x0405;
        this.TRIANGLES = 0x0004;
        this.UNSIGNED_SHORT = 0x1403;
        this.VERTEX_SHADER = 0x8B31;
        this.FRAGMENT_SHADER = 0x8B30;
        this.COMPILE_STATUS = 0x8B81;
        this.LINK_STATUS = 0x8B82;
        this.FRAMEBUFFER = 0x8D40;

        this.enable = vi.fn();
        this.depthFunc = vi.fn();
        this.blendFunc = vi.fn();
        this.clearColor = vi.fn();
        this.viewport = vi.fn();
        this.clear = vi.fn();
        this.useProgram = vi.fn();
        this.bindFramebuffer = vi.fn();
        this.cullFace = vi.fn();
        this.drawElements = vi.fn();
        this.createShader = vi.fn(() => ({}));
        this.shaderSource = vi.fn();
        this.compileShader = vi.fn();
        this.getShaderParameter = vi.fn(() => true);
        this.createProgram = vi.fn(() => ({}));
        this.attachShader = vi.fn();
        this.linkProgram = vi.fn();
        this.getProgramParameter = vi.fn(() => true);
    }
}

describe('WebGLRenderer', () => {
    let renderer;
    let mockCanvas;
    let mockGL;

    beforeEach(() => {
        mockGL = new MockWebGL2RenderingContext();
        mockCanvas = {
            width: 800,
            height: 600,
            getContext: vi.fn(() => mockGL)
        };

        renderer = new WebGLRenderer(mockCanvas);
    });

    describe('constructor', () => {
        it('should initialize WebGL2 context', () => {
            expect(mockCanvas.getContext).toHaveBeenCalledWith('webgl2', expect.any(Object));
            expect(renderer.gl).toBe(mockGL);
        });

        it('should throw error if WebGL2 not supported', () => {
            const badCanvas = {
                getContext: vi.fn(() => null)
            };

            expect(() => new WebGLRenderer(badCanvas)).toThrow('WebGL 2.0 not supported');
        });

        it('should enable depth test', () => {
            expect(mockGL.enable).toHaveBeenCalledWith(mockGL.DEPTH_TEST);
            expect(mockGL.depthFunc).toHaveBeenCalledWith(mockGL.LEQUAL);
        });

        it('should enable blending', () => {
            expect(mockGL.enable).toHaveBeenCalledWith(mockGL.BLEND);
            expect(mockGL.blendFunc).toHaveBeenCalledWith(mockGL.SRC_ALPHA, mockGL.ONE_MINUS_SRC_ALPHA);
        });

        it('should set clear color', () => {
            expect(mockGL.clearColor).toHaveBeenCalledWith(0, 0, 0, 0);
        });

        it('should set viewport', () => {
            expect(mockGL.viewport).toHaveBeenCalledWith(0, 0, 800, 600);
        });
    });

    describe('setProgram()', () => {
        it('should use program if different from current', () => {
            const program = {};

            renderer.setProgram(program);

            expect(mockGL.useProgram).toHaveBeenCalledWith(program);
            expect(renderer.currentProgram).toBe(program);
        });

        it('should not call useProgram if program is same as current', () => {
            const program = {};

            renderer.setProgram(program);
            mockGL.useProgram.mockClear();
            renderer.setProgram(program);

            expect(mockGL.useProgram).not.toHaveBeenCalled();
        });
    });

    describe('setFramebuffer()', () => {
        it('should bind framebuffer', () => {
            const fbo = { framebuffer: {} };

            renderer.setFramebuffer(fbo);

            expect(mockGL.bindFramebuffer).toHaveBeenCalledWith(mockGL.FRAMEBUFFER, fbo.framebuffer);
            expect(renderer.currentFramebuffer).toBe(fbo);
        });

        it('should bind null for screen framebuffer', () => {
            // First set a non-null framebuffer
            const fbo = { framebuffer: {} };
            renderer.setFramebuffer(fbo);
            mockGL.bindFramebuffer.mockClear();

            // Then bind null (screen)
            renderer.setFramebuffer(null);

            expect(mockGL.bindFramebuffer).toHaveBeenCalledWith(mockGL.FRAMEBUFFER, null);
            expect(renderer.currentFramebuffer).toBe(null);
        });

        it('should not bind if framebuffer is same as current', () => {
            const fbo = { framebuffer: {} };

            renderer.setFramebuffer(fbo);
            mockGL.bindFramebuffer.mockClear();
            renderer.setFramebuffer(fbo);

            expect(mockGL.bindFramebuffer).not.toHaveBeenCalled();
        });
    });

    describe('setViewport()', () => {
        it('should set viewport dimensions', () => {
            renderer.setViewport(100, 100, 512, 512);

            expect(mockGL.viewport).toHaveBeenCalledWith(100, 100, 512, 512);
        });
    });

    describe('clear()', () => {
        it('should clear color and depth by default', () => {
            mockGL.COLOR_BUFFER_BIT = 0x4000;
            mockGL.DEPTH_BUFFER_BIT = 0x0100;

            renderer.clear();

            expect(mockGL.clear).toHaveBeenCalledWith(0x4100);
        });

        it('should clear only depth if color=false', () => {
            mockGL.DEPTH_BUFFER_BIT = 0x0100;

            renderer.clear(false, true);

            expect(mockGL.clear).toHaveBeenCalledWith(0x0100);
        });
    });

    describe('enableDepthTest()', () => {
        it('should enable depth test', () => {
            renderer.enableDepthTest(true);

            expect(mockGL.enable).toHaveBeenCalledWith(mockGL.DEPTH_TEST);
        });

        it('should disable depth test', () => {
            mockGL.disable = vi.fn();

            renderer.enableDepthTest(false);

            expect(mockGL.disable).toHaveBeenCalledWith(mockGL.DEPTH_TEST);
        });
    });

    describe('setCullFace()', () => {
        it('should enable face culling with mode', () => {
            renderer.setCullFace('back');

            expect(mockGL.enable).toHaveBeenCalledWith(mockGL.CULL_FACE);
            expect(mockGL.cullFace).toHaveBeenCalledWith(mockGL.BACK);
        });

        it('should disable face culling if mode is none', () => {
            mockGL.disable = vi.fn();

            renderer.setCullFace('none');

            expect(mockGL.disable).toHaveBeenCalledWith(mockGL.CULL_FACE);
        });
    });
});
