import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Core3DManager } from '../../../src/3d/Core3DManager.js';

describe('Core3DManager with modular architecture', () => {
    let manager;
    let mockCanvas;

    beforeEach(() => {
        // Mock canvas with WebGL2 context
        const mockGL = {
            DEPTH_TEST: 0x0B71,
            LEQUAL: 0x0203,
            BLEND: 0x0BE2,
            SRC_ALPHA: 0x0302,
            ONE_MINUS_SRC_ALPHA: 0x0303,
            CULL_FACE: 0x0B44,
            VERTEX_SHADER: 0x8B31,
            FRAGMENT_SHADER: 0x8B30,
            COMPILE_STATUS: 0x8B81,
            LINK_STATUS: 0x8B82,
            COLOR_BUFFER_BIT: 0x4000,
            DEPTH_BUFFER_BIT: 0x0100,
            ARRAY_BUFFER: 0x8892,
            ELEMENT_ARRAY_BUFFER: 0x8893,
            STATIC_DRAW: 0x88E4,
            FLOAT: 0x1406,
            TRIANGLES: 0x0004,
            UNSIGNED_SHORT: 0x1403,
            enable: vi.fn(),
            depthFunc: vi.fn(),
            blendFunc: vi.fn(),
            clearColor: vi.fn(),
            viewport: vi.fn(),
            clear: vi.fn(),
            createShader: vi.fn(() => ({})),
            shaderSource: vi.fn(),
            compileShader: vi.fn(),
            getShaderParameter: vi.fn(() => true),
            createProgram: vi.fn(() => ({})),
            attachShader: vi.fn(),
            linkProgram: vi.fn(),
            getProgramParameter: vi.fn(() => true),
            deleteShader: vi.fn(),
            getAttribLocation: vi.fn(() => 0),
            getUniformLocation: vi.fn(() => ({})),
            createBuffer: vi.fn(() => ({})),
            bindBuffer: vi.fn(),
            bufferData: vi.fn(),
            vertexAttribPointer: vi.fn(),
            enableVertexAttribArray: vi.fn(),
            useProgram: vi.fn(),
            uniformMatrix4fv: vi.fn(),
            uniform3fv: vi.fn(),
            uniform1f: vi.fn(),
            uniform1i: vi.fn(),
            drawElements: vi.fn()
        };

        mockCanvas = {
            width: 800,
            height: 600,
            getContext: vi.fn(() => mockGL)
        };

        manager = new Core3DManager(mockCanvas);
    });

    it('should create RenderPipeline instead of direct renderer', () => {
        expect(manager.pipeline).toBeDefined();
        expect(manager.pipeline.renderer).toBeDefined();
    });

    it('should add GeometryPass to pipeline', () => {
        expect(manager.pipeline.passes.length).toBeGreaterThan(0);
        expect(manager.pipeline.passes[0].name).toBe('geometry');
    });

    it('should maintain backward compatibility with renderer property', () => {
        expect(manager.renderer).toBe(manager.pipeline.renderer);
    });

    it('should render using pipeline', () => {
        const renderSpy = vi.spyOn(manager.pipeline, 'render');

        manager.render(16);

        expect(renderSpy).toHaveBeenCalled();
    });

    it('should pass correct scene data to pipeline', () => {
        const renderSpy = vi.spyOn(manager.pipeline, 'render');

        manager.render(16);

        expect(renderSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                geometry: expect.anything(),
                glowColor: expect.any(Array),
                glowIntensity: expect.any(Number)
            }),
            expect.objectContaining({
                viewMatrix: expect.any(Float32Array),
                projectionMatrix: expect.any(Float32Array),
                position: expect.any(Array)
            })
        );
    });
});
