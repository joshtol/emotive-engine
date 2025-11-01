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
        this.ONE = 0x0001;
        this.ZERO = 0x0000;
        this.DST_COLOR = 0x0306;
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
        this.deleteShader = vi.fn();
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


    describe('setBlending()', () => {
        it('should enable alpha blending', () => {
            renderer.setBlending('alpha');

            expect(mockGL.enable).toHaveBeenCalledWith(mockGL.BLEND);
            expect(mockGL.blendFunc).toHaveBeenCalledWith(mockGL.SRC_ALPHA, mockGL.ONE_MINUS_SRC_ALPHA);
        });

        it('should enable additive blending', () => {
            renderer.setBlending('additive');

            expect(mockGL.enable).toHaveBeenCalledWith(mockGL.BLEND);
            expect(mockGL.blendFunc).toHaveBeenCalledWith(mockGL.SRC_ALPHA, mockGL.ONE);
        });

        it('should enable multiply blending', () => {
            renderer.setBlending('multiply');

            expect(mockGL.enable).toHaveBeenCalledWith(mockGL.BLEND);
            expect(mockGL.blendFunc).toHaveBeenCalledWith(mockGL.DST_COLOR, mockGL.ZERO);
        });

        it('should disable blending for none mode', () => {
            mockGL.disable = vi.fn();

            renderer.setBlending('none');

            expect(mockGL.disable).toHaveBeenCalledWith(mockGL.BLEND);
        });

        it('should warn on unknown blend mode', () => {
            const consoleWarn = vi.spyOn(console, 'warn').mockImplementation();

            renderer.setBlending('invalid');

            expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('Unknown blend mode'));
            consoleWarn.mockRestore();
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
    describe('compileShader()', () => {
        it('should compile shader successfully', () => {
            const shader = renderer.compileShader(mockGL.VERTEX_SHADER, 'void main() {}');

            expect(mockGL.createShader).toHaveBeenCalledWith(mockGL.VERTEX_SHADER);
            expect(mockGL.shaderSource).toHaveBeenCalled();
            expect(mockGL.compileShader).toHaveBeenCalled();
            expect(mockGL.getShaderParameter).toHaveBeenCalledWith(shader, mockGL.COMPILE_STATUS);
        });

        it('should throw error on compilation failure', () => {
            mockGL.getShaderParameter.mockReturnValueOnce(false);
            mockGL.getShaderInfoLog = vi.fn(() => 'Syntax error');
            mockGL.deleteShader = vi.fn();

            expect(() => {
                renderer.compileShader(mockGL.VERTEX_SHADER, 'invalid shader');
            }).toThrow('Shader compilation failed: Syntax error');
        });

        it('should cleanup shader on failure', () => {
            mockGL.getShaderParameter.mockReturnValueOnce(false);
            mockGL.getShaderInfoLog = vi.fn(() => 'Error');
            mockGL.deleteShader = vi.fn();
            const shader = {};
            mockGL.createShader.mockReturnValueOnce(shader);

            try {
                renderer.compileShader(mockGL.VERTEX_SHADER, 'bad');
            } catch (e) {
                // Expected
            }

            expect(mockGL.deleteShader).toHaveBeenCalledWith(shader);
        });
    });

    describe('createProgram()', () => {
        it('should create and link program successfully', () => {
            const program = renderer.createProgram('vert source', 'frag source');

            expect(mockGL.createProgram).toHaveBeenCalled();
            expect(mockGL.attachShader).toHaveBeenCalledTimes(2);
            expect(mockGL.linkProgram).toHaveBeenCalled();
            expect(mockGL.getProgramParameter).toHaveBeenCalled();
            expect(program).toBeDefined();
        });

        it('should throw error on link failure', () => {
            mockGL.getProgramParameter.mockReturnValueOnce(false);
            mockGL.getProgramInfoLog = vi.fn(() => 'Link error');
            mockGL.deleteProgram = vi.fn();

            expect(() => {
                renderer.createProgram('vert', 'frag');
            }).toThrow('Program linking failed: Link error');
        });

        it('should cleanup shaders after linking', () => {
            mockGL.deleteShader = vi.fn();

            renderer.createProgram('vert', 'frag');

            expect(mockGL.deleteShader).toHaveBeenCalledTimes(2);
        });
    });

});
