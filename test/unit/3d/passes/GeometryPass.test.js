import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GeometryPass } from '../../../../src/3d/passes/GeometryPass.js';

describe('GeometryPass', () => {
    let pass;
    let mockRenderer;
    let mockFBManager;
    let mockGL;

    beforeEach(() => {
        mockGL = {
            TRIANGLES: 0x0004,
            UNSIGNED_SHORT: 0x1403,
            ARRAY_BUFFER: 0x8892,
            ELEMENT_ARRAY_BUFFER: 0x8893,
            STATIC_DRAW: 0x88E4,
            FLOAT: 0x1406,
            createBuffer: vi.fn(() => ({})),
            bindBuffer: vi.fn(),
            bufferData: vi.fn(),
            vertexAttribPointer: vi.fn(),
            enableVertexAttribArray: vi.fn(),
            drawElements: vi.fn(),
            uniformMatrix4fv: vi.fn(),
            uniform3fv: vi.fn(),
            uniform1f: vi.fn(),
            uniform1i: vi.fn(),
            getAttribLocation: vi.fn((prog, name) => {
                if (name === 'a_position') return 0;
                if (name === 'a_normal') return 1;
                return -1;
            }),
            getUniformLocation: vi.fn((prog, name) => ({ name }))
        };

        mockRenderer = {
            gl: mockGL,
            canvas: { width: 800, height: 600 },
            setProgram: vi.fn(),
            setFramebuffer: vi.fn(),
            clear: vi.fn(),
            createProgram: vi.fn(() => ({}))
        };

        mockFBManager = {};

        pass = new GeometryPass();
    });

    describe('constructor', () => {
        it('should initialize with name "geometry"', () => {
            expect(pass.name).toBe('geometry');
        });

        it('should be enabled by default', () => {
            expect(pass.enabled).toBe(true);
        });
    });

    describe('setup()', () => {
        it('should compile shaders and get locations', () => {
            pass.init(mockRenderer, mockFBManager);

            expect(mockRenderer.createProgram).toHaveBeenCalled();
            expect(pass.program).toBeDefined();
            expect(pass.locations).toBeDefined();
        });

        it('should get attribute locations', () => {
            pass.init(mockRenderer, mockFBManager);

            expect(mockGL.getAttribLocation).toHaveBeenCalledWith(pass.program, 'a_position');
            expect(mockGL.getAttribLocation).toHaveBeenCalledWith(pass.program, 'a_normal');
        });

        it('should get uniform locations', () => {
            pass.init(mockRenderer, mockFBManager);

            expect(mockGL.getUniformLocation).toHaveBeenCalledWith(pass.program, 'u_modelMatrix');
            expect(mockGL.getUniformLocation).toHaveBeenCalledWith(pass.program, 'u_viewMatrix');
            expect(mockGL.getUniformLocation).toHaveBeenCalledWith(pass.program, 'u_projectionMatrix');
        });
    });

    describe('execute()', () => {
        beforeEach(() => {
            pass.init(mockRenderer, mockFBManager);
        });

        it('should set program', () => {
            const scene = { geometry: null };
            const camera = { viewMatrix: [], projectionMatrix: [] };

            pass.execute(scene, camera);

            expect(mockRenderer.setProgram).toHaveBeenCalledWith(pass.program);
        });

        it('should clear framebuffer', () => {
            const scene = { geometry: null };
            const camera = { viewMatrix: [], projectionMatrix: [] };

            pass.execute(scene, camera);

            expect(mockRenderer.clear).toHaveBeenCalled();
        });

        it('should skip rendering if no geometry', () => {
            const scene = { geometry: null };
            const camera = { viewMatrix: [], projectionMatrix: [] };

            pass.execute(scene, camera);

            expect(mockGL.drawElements).not.toHaveBeenCalled();
        });

        it('should render geometry if present', () => {
            const scene = {
                geometry: {
                    vertices: new Float32Array([0, 0, 0]),
                    normals: new Float32Array([0, 1, 0]),
                    indices: new Uint16Array([0, 1, 2]),
                    indexCount: 3
                },
                modelMatrix: new Float32Array(16),
                glowColor: [1, 0, 0],
                glowIntensity: 0.5
            };
            const camera = {
                viewMatrix: new Float32Array(16),
                projectionMatrix: new Float32Array(16),
                position: [0, 0, 5]
            };

            pass.execute(scene, camera);

            expect(mockGL.drawElements).toHaveBeenCalledWith(
                mockGL.TRIANGLES,
                3,
                mockGL.UNSIGNED_SHORT,
                0
            );
        });
    });
});
