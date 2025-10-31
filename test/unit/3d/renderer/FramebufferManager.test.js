import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FramebufferManager } from '../../../../src/3d/renderer/FramebufferManager.js';

describe('FramebufferManager', () => {
    let manager;
    let mockRenderer;
    let mockGL;

    beforeEach(() => {
        // Mock WebGL context
        mockGL = {
            createFramebuffer: vi.fn(() => ({})),
            createTexture: vi.fn(() => ({})),
            createRenderbuffer: vi.fn(() => ({})),
            bindFramebuffer: vi.fn(),
            bindTexture: vi.fn(),
            bindRenderbuffer: vi.fn(),
            texImage2D: vi.fn(),
            renderbufferStorage: vi.fn(),
            framebufferTexture2D: vi.fn(),
            framebufferRenderbuffer: vi.fn(),
            checkFramebufferStatus: vi.fn(() => mockGL.FRAMEBUFFER_COMPLETE),
            deleteFramebuffer: vi.fn(),
            deleteTexture: vi.fn(),
            deleteRenderbuffer: vi.fn(),
            texParameteri: vi.fn(),
            FRAMEBUFFER: 0x8D40,
            TEXTURE_2D: 0x0DE1,
            RENDERBUFFER: 0x8D41,
            RGBA: 0x1908,
            UNSIGNED_BYTE: 0x1401,
            COLOR_ATTACHMENT0: 0x8CE0,
            DEPTH_ATTACHMENT: 0x8D00,
            DEPTH_COMPONENT16: 0x81A5,
            FRAMEBUFFER_COMPLETE: 0x8CD5,
            LINEAR: 0x2601,
            CLAMP_TO_EDGE: 0x812F,
            TEXTURE_MIN_FILTER: 0x2801,
            TEXTURE_MAG_FILTER: 0x2800,
            TEXTURE_WRAP_S: 0x2802,
            TEXTURE_WRAP_T: 0x2803
        };

        mockRenderer = {
            gl: mockGL,
            canvas: { width: 800, height: 600 }
        };

        manager = new FramebufferManager(mockRenderer);
    });

    describe('constructor', () => {
        it('should initialize with renderer', () => {
            expect(manager.renderer).toBe(mockRenderer);
        });

        it('should initialize empty FBO map', () => {
            expect(manager.fbos).toBeInstanceOf(Map);
            expect(manager.fbos.size).toBe(0);
        });

        it('should initialize empty pool', () => {
            expect(manager.pool).toEqual([]);
        });
    });

    describe('create()', () => {
        it('should create FBO with color and depth attachments', () => {
            const fbo = manager.create(256, 256, 'RGBA');

            expect(mockGL.createFramebuffer).toHaveBeenCalled();
            expect(mockGL.createTexture).toHaveBeenCalled();
            expect(mockGL.createRenderbuffer).toHaveBeenCalled();
            expect(fbo.width).toBe(256);
            expect(fbo.height).toBe(256);
            expect(fbo.format).toBe('RGBA');
        });

        it('should bind and configure framebuffer', () => {
            manager.create(256, 256, 'RGBA');

            expect(mockGL.bindFramebuffer).toHaveBeenCalled();
            expect(mockGL.framebufferTexture2D).toHaveBeenCalled();
            expect(mockGL.framebufferRenderbuffer).toHaveBeenCalled();
        });

        it('should verify framebuffer is complete', () => {
            const fbo = manager.create(256, 256, 'RGBA');

            expect(mockGL.checkFramebufferStatus).toHaveBeenCalled();
            expect(fbo.framebuffer).toBeDefined();
        });
    });

    describe('acquire()', () => {
        it('should create new FBO if pool is empty', () => {
            const fbo = manager.acquire('test', 256, 256);

            expect(mockGL.createFramebuffer).toHaveBeenCalled();
            expect(manager.fbos.get('test')).toBe(fbo);
        });

        it('should reuse FBO from pool if available', () => {
            const pooledFBO = manager.create(256, 256, 'RGBA');
            manager.pool.push(pooledFBO);

            const fbo = manager.acquire('test', 256, 256);

            expect(fbo).toBe(pooledFBO);
            expect(manager.pool.length).toBe(0);
        });

        it('should store FBO in map with name', () => {
            manager.acquire('shadow-map', 512, 512);

            expect(manager.fbos.has('shadow-map')).toBe(true);
        });
    });

    describe('release()', () => {
        it('should move FBO from map to pool', () => {
            const fbo = manager.acquire('test', 256, 256);

            manager.release('test');

            expect(manager.fbos.has('test')).toBe(false);
            expect(manager.pool).toContain(fbo);
        });

        it('should do nothing if FBO name not found', () => {
            expect(() => manager.release('nonexistent')).not.toThrow();
        });
    });

    describe('get()', () => {
        it('should return FBO by name', () => {
            const fbo = manager.acquire('test', 256, 256);

            expect(manager.get('test')).toBe(fbo);
        });

        it('should return undefined if not found', () => {
            expect(manager.get('nonexistent')).toBeUndefined();
        });
    });

    describe('resize()', () => {
        it('should resize all active FBOs', () => {
            manager.acquire('fbo1', 256, 256);
            manager.acquire('fbo2', 256, 256);

            manager.resize(512, 512);

            expect(manager.get('fbo1').width).toBe(512);
            expect(manager.get('fbo1').height).toBe(512);
            expect(manager.get('fbo2').width).toBe(512);
            expect(manager.get('fbo2').height).toBe(512);
        });
    });
});
