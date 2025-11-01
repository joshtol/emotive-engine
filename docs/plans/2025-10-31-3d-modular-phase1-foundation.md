# 3D Modular Architecture - Phase 1: Foundation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor existing WebGLRenderer into modular components (WebGLRenderer, RenderPipeline, FramebufferManager, GeometryPass) with clean interfaces and maintain feature parity with current 3D system.

**Architecture:** Extract rendering concerns into focused modules - WebGLRenderer handles WebGL state, RenderPipeline orchestrates passes, FramebufferManager pools FBOs, GeometryPass renders geometry. Each module under 200 LOC.

**Tech Stack:** WebGL 2.0, ES6 modules, Vitest for testing

---

## Prerequisites

**Current working directory:** `c:/zzz/emotive/emotive-engine`
**Branch:** `feature/3d-modular-architecture`
**Design doc:** `docs/plans/3d-rendering-modular-architecture.md`

**Existing files to understand:**
- `src/3d/renderer/WebGLRenderer.js` - Current monolithic renderer (~400 LOC)
- `src/3d/Core3DManager.js` - 3D manager that uses renderer
- `src/3d/shaders/core.vert` - Current vertex shader
- `src/3d/shaders/core.frag` - Current fragment shader

---

## Task 1: Create Directory Structure

**Files:**
- Create: `src/3d/renderer/RenderPipeline.js`
- Create: `src/3d/renderer/FramebufferManager.js`
- Create: `src/3d/passes/BasePass.js`
- Create: `src/3d/passes/GeometryPass.js`
- Create: `src/3d/passes/index.js`
- Create: `test/unit/3d/renderer/RenderPipeline.test.js`
- Create: `test/unit/3d/renderer/FramebufferManager.test.js`
- Create: `test/unit/3d/passes/GeometryPass.test.js`

**Step 1: Create directories**

```bash
mkdir -p src/3d/passes
mkdir -p test/unit/3d/renderer
mkdir -p test/unit/3d/passes
```

**Step 2: Verify directories exist**

Run: `ls -la src/3d/passes && ls -la test/unit/3d/passes`
Expected: Directories exist

**Step 3: Commit directory structure**

```bash
git add src/3d/passes test/unit/3d
git commit -m "chore: create directory structure for modular 3D architecture"
```

---

## Task 2: Implement BasePass Interface

**Files:**
- Create: `src/3d/passes/BasePass.js`
- Create: `test/unit/3d/passes/BasePass.test.js`

**Step 1: Write failing test**

Create `test/unit/3d/passes/BasePass.test.js`:

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BasePass } from '../../../src/3d/passes/BasePass.js';

describe('BasePass', () => {
    let pass;
    let mockRenderer;
    let mockFBManager;

    beforeEach(() => {
        mockRenderer = { gl: {} };
        mockFBManager = {};
        pass = new BasePass('test-pass');
    });

    it('should initialize with name', () => {
        expect(pass.name).toBe('test-pass');
    });

    it('should be enabled by default', () => {
        expect(pass.enabled).toBe(true);
    });

    it('should store renderer and fbManager after init', () => {
        pass.init(mockRenderer, mockFBManager);

        expect(pass.renderer).toBe(mockRenderer);
        expect(pass.fbManager).toBe(mockFBManager);
    });

    it('should throw error if execute() not implemented', () => {
        pass.init(mockRenderer, mockFBManager);

        expect(() => pass.execute({}, {})).toThrow('BasePass.execute() must be implemented');
    });

    it('should throw error if setup() not implemented', () => {
        expect(() => pass.setup()).toThrow('BasePass.setup() must be implemented');
    });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- BasePass.test.js`
Expected: FAIL with "Cannot find module '../../../src/3d/passes/BasePass.js'"

**Step 3: Write minimal implementation**

Create `src/3d/passes/BasePass.js`:

```javascript
/**
 * BasePass - Abstract base class for render passes
 *
 * Provides interface contract for all render passes in the pipeline.
 * Each pass should extend this and implement setup() and execute().
 */
export class BasePass {
    /**
     * @param {string} name - Pass identifier
     */
    constructor(name) {
        this.name = name;
        this.enabled = true;
        this.renderer = null;
        this.fbManager = null;
    }

    /**
     * Initialize pass with renderer and framebuffer manager
     * @param {WebGLRenderer} renderer - WebGL renderer instance
     * @param {FramebufferManager} fbManager - Framebuffer manager instance
     */
    init(renderer, fbManager) {
        this.renderer = renderer;
        this.fbManager = fbManager;
        this.setup();
    }

    /**
     * Setup pass resources (shaders, uniforms, etc.)
     * Must be implemented by subclasses
     */
    setup() {
        throw new Error('BasePass.setup() must be implemented');
    }

    /**
     * Execute the render pass
     * @param {Object} scene - Scene data (geometry, materials, etc.)
     * @param {Object} camera - Camera data (view, projection matrices)
     */
    execute(scene, camera) {
        throw new Error('BasePass.execute() must be implemented');
    }

    /**
     * Handle viewport resize (optional)
     * @param {number} width - New width
     * @param {number} height - New height
     */
    resize(width, height) {
        // Optional - override if needed
    }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- BasePass.test.js`
Expected: PASS - All tests pass

**Step 5: Commit BasePass**

```bash
git add src/3d/passes/BasePass.js test/unit/3d/passes/BasePass.test.js
git commit -m "feat(3d): add BasePass interface for render passes

- Abstract base class defining pass contract
- init(), setup(), execute(), resize() interface
- Throws errors if abstract methods not implemented
- 100% test coverage"
```

---

## Task 3: Implement FramebufferManager

**Files:**
- Create: `src/3d/renderer/FramebufferManager.js`
- Modify: `test/unit/3d/renderer/FramebufferManager.test.js`

**Step 1: Write failing test**

Create `test/unit/3d/renderer/FramebufferManager.test.js`:

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FramebufferManager } from '../../../src/3d/renderer/FramebufferManager.js';

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
            FRAMEBUFFER: 0x8D40,
            TEXTURE_2D: 0x0DE1,
            RENDERBUFFER: 0x8D41,
            RGBA: 0x1908,
            UNSIGNED_BYTE: 0x1401,
            COLOR_ATTACHMENT0: 0x8CE0,
            DEPTH_ATTACHMENT: 0x8D00,
            DEPTH_COMPONENT16: 0x81A5,
            FRAMEBUFFER_COMPLETE: 0x8CD5
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
```

**Step 2: Run test to verify it fails**

Run: `npm test -- FramebufferManager.test.js`
Expected: FAIL with "Cannot find module"

**Step 3: Write minimal implementation**

Create `src/3d/renderer/FramebufferManager.js`:

```javascript
/**
 * FramebufferManager - Pool and manage framebuffer objects (FBOs)
 *
 * Handles creation, pooling, and lifecycle of WebGL framebuffers.
 * Reduces allocation overhead by recycling FBOs.
 */
export class FramebufferManager {
    /**
     * @param {WebGLRenderer} renderer - WebGL renderer instance
     */
    constructor(renderer) {
        this.renderer = renderer;
        this.fbos = new Map();  // name -> FBO
        this.pool = [];  // Recycled FBOs
    }

    /**
     * Create a new framebuffer with color and depth attachments
     * @param {number} width - Framebuffer width
     * @param {number} height - Framebuffer height
     * @param {string} format - Color format ('RGBA', 'RGB', 'R8', etc.)
     * @returns {Object} FBO object with framebuffer, texture, and depth buffer
     */
    create(width, height, format = 'RGBA') {
        const { gl } = this.renderer;

        // Create framebuffer
        const framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

        // Create color texture
        const colorTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, colorTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl[format],
            width,
            height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // Attach color texture
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            colorTexture,
            0
        );

        // Create depth renderbuffer
        const depthBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

        // Attach depth buffer
        gl.framebufferRenderbuffer(
            gl.FRAMEBUFFER,
            gl.DEPTH_ATTACHMENT,
            gl.RENDERBUFFER,
            depthBuffer
        );

        // Verify framebuffer is complete
        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            throw new Error(`Framebuffer incomplete: ${status}`);
        }

        // Unbind
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        return {
            framebuffer,
            colorTexture,
            depthBuffer,
            width,
            height,
            format
        };
    }

    /**
     * Acquire an FBO (from pool or create new)
     * @param {string} name - FBO identifier
     * @param {number} width - Framebuffer width
     * @param {number} height - Framebuffer height
     * @param {string} format - Color format
     * @returns {Object} FBO object
     */
    acquire(name, width, height, format = 'RGBA') {
        // Try to reuse from pool first
        const fbo = this.pool.pop() || this.create(width, height, format);

        this.fbos.set(name, fbo);
        return fbo;
    }

    /**
     * Release an FBO back to the pool
     * @param {string} name - FBO identifier
     */
    release(name) {
        const fbo = this.fbos.get(name);
        if (fbo) {
            this.pool.push(fbo);
            this.fbos.delete(name);
        }
    }

    /**
     * Get an FBO by name
     * @param {string} name - FBO identifier
     * @returns {Object|undefined} FBO object or undefined
     */
    get(name) {
        return this.fbos.get(name);
    }

    /**
     * Resize all active FBOs
     * @param {number} width - New width
     * @param {number} height - New height
     */
    resize(width, height) {
        const { gl } = this.renderer;

        for (const [name, fbo] of this.fbos.entries()) {
            // Resize color texture
            gl.bindTexture(gl.TEXTURE_2D, fbo.colorTexture);
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl[fbo.format],
                width,
                height,
                0,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                null
            );

            // Resize depth buffer
            gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.depthBuffer);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

            // Update FBO dimensions
            fbo.width = width;
            fbo.height = height;
        }

        // Unbind
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- FramebufferManager.test.js`
Expected: PASS - All tests pass

**Step 5: Commit FramebufferManager**

```bash
git add src/3d/renderer/FramebufferManager.js test/unit/3d/renderer/FramebufferManager.test.js
git commit -m "feat(3d): add FramebufferManager for FBO pooling

- Create, acquire, release, get FBO operations
- Pool recycling to reduce allocations
- Resize support for all active FBOs
- Color texture + depth renderbuffer attachments
- 100% test coverage with mocked WebGL context"
```

---

## Task 4: Implement RenderPipeline

**Files:**
- Create: `src/3d/renderer/RenderPipeline.js`
- Modify: `test/unit/3d/renderer/RenderPipeline.test.js`

**Step 1: Write failing test**

Create `test/unit/3d/renderer/RenderPipeline.test.js`:

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RenderPipeline } from '../../../src/3d/renderer/RenderPipeline.js';
import { BasePass } from '../../../src/3d/passes/BasePass.js';

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
```

**Step 2: Run test to verify it fails**

Run: `npm test -- RenderPipeline.test.js`
Expected: FAIL with "Cannot find module"

**Step 3: Write minimal implementation**

Create `src/3d/renderer/RenderPipeline.js`:

```javascript
import { FramebufferManager } from './FramebufferManager.js';

/**
 * RenderPipeline - Orchestrate ordered execution of render passes
 *
 * Manages the render pass sequence and coordinates rendering flow.
 * Passes are executed in order, with disabled passes skipped.
 */
export class RenderPipeline {
    /**
     * @param {WebGLRenderer} renderer - WebGL renderer instance
     * @param {FramebufferManager} fbManager - Optional framebuffer manager
     */
    constructor(renderer, fbManager = null) {
        this.renderer = renderer;
        this.fbManager = fbManager || new FramebufferManager(renderer);
        this.passes = [];
    }

    /**
     * Add a render pass to the pipeline
     * @param {BasePass} pass - Render pass instance
     */
    addPass(pass) {
        pass.init(this.renderer, this.fbManager);
        this.passes.push(pass);
    }

    /**
     * Remove a render pass from the pipeline
     * @param {BasePass} pass - Render pass instance
     */
    removePass(pass) {
        const index = this.passes.indexOf(pass);
        if (index !== -1) {
            this.passes.splice(index, 1);
        }
    }

    /**
     * Execute all enabled passes in order
     * @param {Object} scene - Scene data (geometry, materials, etc.)
     * @param {Object} camera - Camera data (view, projection matrices)
     */
    render(scene, camera) {
        for (const pass of this.passes) {
            if (pass.enabled) {
                pass.execute(scene, camera);
            }
        }
    }

    /**
     * Handle viewport resize
     * @param {number} width - New width
     * @param {number} height - New height
     */
    resize(width, height) {
        this.fbManager.resize(width, height);

        for (const pass of this.passes) {
            if (pass.resize) {
                pass.resize(width, height);
            }
        }
    }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- RenderPipeline.test.js`
Expected: PASS - All tests pass

**Step 5: Commit RenderPipeline**

```bash
git add src/3d/renderer/RenderPipeline.js test/unit/3d/renderer/RenderPipeline.test.js
git commit -m "feat(3d): add RenderPipeline for pass orchestration

- Add/remove passes dynamically
- Execute passes in order, skip disabled
- Resize coordination for fbManager and passes
- Auto-create FramebufferManager if not provided
- 100% test coverage"
```

---

## Task 5: Refactor WebGLRenderer to Focus on State Management

**Files:**
- Modify: `src/3d/renderer/WebGLRenderer.js`
- Create: `test/unit/3d/renderer/WebGLRenderer.test.js`

**Background:** Current WebGLRenderer (400 LOC) handles too much. We'll extract rendering logic to GeometryPass and focus WebGLRenderer on WebGL state management only.

**Step 1: Write tests for refactored WebGLRenderer**

Create `test/unit/3d/renderer/WebGLRenderer.test.js`:

```javascript
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { WebGLRenderer } from '../../../src/3d/renderer/WebGLRenderer.js';

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
```

**Step 2: Run test to verify failures**

Run: `npm test -- WebGLRenderer.test.js`
Expected: Multiple test failures due to missing methods

**Step 3: Refactor WebGLRenderer - Extract to separate file first**

```bash
cp src/3d/renderer/WebGLRenderer.js src/3d/renderer/WebGLRenderer.old.js
```

**Step 4: Write refactored WebGLRenderer (state management only)**

Modify `src/3d/renderer/WebGLRenderer.js`:

```javascript
/**
 * WebGLRenderer - Core WebGL state management and operations
 *
 * Handles:
 * - WebGL context initialization
 * - State tracking and optimization (avoid redundant calls)
 * - Primitive operations (program, framebuffer, viewport, clear)
 * - Shader compilation
 *
 * Does NOT handle:
 * - Scene rendering logic (moved to passes)
 * - Geometry management (moved to GeometryManager)
 * - Matrix calculations (moved to Camera)
 */
export class WebGLRenderer {
    /**
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {Object} config - Configuration options
     */
    constructor(canvas, config = {}) {
        this.canvas = canvas;

        // Initialize WebGL 2.0 context
        this.gl = canvas.getContext('webgl2', {
            alpha: config.alpha !== undefined ? config.alpha : true,
            antialias: config.antialias !== undefined ? config.antialias : true,
            depth: config.depth !== undefined ? config.depth : true,
            premultipliedAlpha: false
        });

        if (!this.gl) {
            throw new Error('WebGL 2.0 not supported');
        }

        // State tracking
        this.currentProgram = null;
        this.currentFramebuffer = null;

        // Setup WebGL state
        this.setupGL();
    }

    /**
     * Setup default WebGL state
     */
    setupGL() {
        const { gl } = this;

        // Enable depth testing
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        // Enable blending for transparency
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // Set clear color (transparent)
        gl.clearColor(0, 0, 0, 0);

        // Set viewport
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Set active shader program (with state tracking)
     * @param {WebGLProgram} program - Compiled shader program
     */
    setProgram(program) {
        if (this.currentProgram !== program) {
            this.gl.useProgram(program);
            this.currentProgram = program;
        }
    }

    /**
     * Set active framebuffer (with state tracking)
     * @param {Object|null} fbo - FBO object or null for screen
     */
    setFramebuffer(fbo) {
        if (this.currentFramebuffer !== fbo) {
            const framebuffer = fbo ? fbo.framebuffer : null;
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
            this.currentFramebuffer = fbo;
        }
    }

    /**
     * Set viewport dimensions
     * @param {number} x - X offset
     * @param {number} y - Y offset
     * @param {number} width - Viewport width
     * @param {number} height - Viewport height
     */
    setViewport(x, y, width, height) {
        this.gl.viewport(x, y, width, height);
    }

    /**
     * Clear buffers
     * @param {boolean} color - Clear color buffer
     * @param {boolean} depth - Clear depth buffer
     */
    clear(color = true, depth = true) {
        const { gl } = this;
        let mask = 0;

        if (color) mask |= gl.COLOR_BUFFER_BIT;
        if (depth) mask |= gl.DEPTH_BUFFER_BIT;

        if (mask) {
            gl.clear(mask);
        }
    }

    /**
     * Enable/disable depth testing
     * @param {boolean} enable - Enable depth test
     */
    enableDepthTest(enable) {
        const { gl } = this;

        if (enable) {
            gl.enable(gl.DEPTH_TEST);
        } else {
            gl.disable(gl.DEPTH_TEST);
        }
    }

    /**
     * Set blending mode
     * @param {string} mode - Blending mode ('alpha', 'additive', 'multiply', 'none')
     */
    setBlending(mode) {
        const { gl } = this;

        switch (mode) {
            case 'alpha':
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                break;
            case 'additive':
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                break;
            case 'multiply':
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.DST_COLOR, gl.ZERO);
                break;
            case 'none':
                gl.disable(gl.BLEND);
                break;
            default:
                console.warn(`Unknown blend mode: ${mode}`);
        }
    }

    /**
     * Set face culling
     * @param {string} mode - Culling mode ('back', 'front', 'none')
     */
    setCullFace(mode) {
        const { gl } = this;

        if (mode === 'none') {
            gl.disable(gl.CULL_FACE);
        } else {
            gl.enable(gl.CULL_FACE);
            const cullMode = mode === 'front' ? gl.FRONT : gl.BACK;
            gl.cullFace(cullMode);
        }
    }

    /**
     * Compile shader from source
     * @param {number} type - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
     * @param {string} source - Shader source code
     * @returns {WebGLShader} Compiled shader
     */
    compileShader(type, source) {
        const { gl } = this;

        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!success) {
            const log = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error(`Shader compilation failed: ${log}`);
        }

        return shader;
    }

    /**
     * Create shader program from vertex and fragment shaders
     * @param {string} vertSource - Vertex shader source
     * @param {string} fragSource - Fragment shader source
     * @returns {WebGLProgram} Linked shader program
     */
    createProgram(vertSource, fragSource) {
        const { gl } = this;

        const vertShader = this.compileShader(gl.VERTEX_SHADER, vertSource);
        const fragShader = this.compileShader(gl.FRAGMENT_SHADER, fragSource);

        const program = gl.createProgram();
        gl.attachShader(program, vertShader);
        gl.attachShader(program, fragShader);
        gl.linkProgram(program);

        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!success) {
            const log = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);
            throw new Error(`Program linking failed: ${log}`);
        }

        // Clean up shaders (no longer needed after linking)
        gl.deleteShader(vertShader);
        gl.deleteShader(fragShader);

        return program;
    }
}
```

**Step 5: Run tests to verify refactored renderer**

Run: `npm test -- WebGLRenderer.test.js`
Expected: PASS - All tests pass

**Step 6: Commit refactored WebGLRenderer**

```bash
git add src/3d/renderer/WebGLRenderer.js test/unit/3d/renderer/WebGLRenderer.test.js
git commit -m "refactor(3d): simplify WebGLRenderer to state management only

- Focus on WebGL state tracking and primitive operations
- Extract rendering logic (will move to GeometryPass)
- State tracking prevents redundant GL calls
- Add setProgram, setFramebuffer, setViewport, clear
- Add enableDepthTest, setBlending, setCullFace
- Keep shader compilation utilities
- 100% test coverage
- Save old version as WebGLRenderer.old.js for reference"
```

---

## Task 6: Implement GeometryPass

**Files:**
- Create: `src/3d/passes/GeometryPass.js`
- Modify: `test/unit/3d/passes/GeometryPass.test.js`
- Create: `src/3d/passes/index.js`

**Background:** GeometryPass handles actual geometry rendering, which was previously in WebGLRenderer. This is a complex pass that needs the old rendering logic.

**Step 1: Write tests for GeometryPass**

Create `test/unit/3d/passes/GeometryPass.test.js`:

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GeometryPass } from '../../../src/3d/passes/GeometryPass.js';

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
```

**Step 2: Run test to verify it fails**

Run: `npm test -- GeometryPass.test.js`
Expected: FAIL with "Cannot find module"

**Step 3: Write GeometryPass implementation**

Create `src/3d/passes/GeometryPass.js`:

```javascript
import { BasePass } from './BasePass.js';
import vertexShaderSource from '../shaders/core.vert';
import fragmentShaderSource from '../shaders/core.frag';

/**
 * GeometryPass - Render main scene geometry
 *
 * Handles:
 * - Geometry rendering with current shaders
 * - Uniform updates (matrices, glow, camera position)
 * - Vertex buffer setup
 *
 * This pass renders the 3D mascot core geometry.
 */
export class GeometryPass extends BasePass {
    constructor() {
        super('geometry');
        this.program = null;
        this.locations = null;
        this.buffers = {};
    }

    /**
     * Setup shader program and get attribute/uniform locations
     */
    setup() {
        const { gl } = this.renderer;

        // Compile shader program
        this.program = this.renderer.createProgram(vertexShaderSource, fragmentShaderSource);

        // Get attribute locations
        this.locations = {
            // Attributes
            position: gl.getAttribLocation(this.program, 'a_position'),
            normal: gl.getAttribLocation(this.program, 'a_normal'),

            // Uniforms
            modelMatrix: gl.getUniformLocation(this.program, 'u_modelMatrix'),
            viewMatrix: gl.getUniformLocation(this.program, 'u_viewMatrix'),
            projectionMatrix: gl.getUniformLocation(this.program, 'u_projectionMatrix'),
            glowColor: gl.getUniformLocation(this.program, 'u_glowColor'),
            glowIntensity: gl.getUniformLocation(this.program, 'u_glowIntensity'),
            cameraPosition: gl.getUniformLocation(this.program, 'u_cameraPosition'),
            renderMode: gl.getUniformLocation(this.program, 'u_renderMode')
        };
    }

    /**
     * Execute geometry rendering
     * @param {Object} scene - Scene data with geometry, transforms, materials
     * @param {Object} camera - Camera data with view/projection matrices
     */
    execute(scene, camera) {
        const { gl } = this.renderer;

        // Set shader program
        this.renderer.setProgram(this.program);

        // Clear framebuffer (render to screen)
        this.renderer.clear(true, true);

        // Skip if no geometry
        if (!scene.geometry) {
            return;
        }

        // Setup geometry buffers
        this.setupGeometry(scene.geometry);

        // Set uniforms
        gl.uniformMatrix4fv(this.locations.modelMatrix, false, scene.modelMatrix);
        gl.uniformMatrix4fv(this.locations.viewMatrix, false, camera.viewMatrix);
        gl.uniformMatrix4fv(this.locations.projectionMatrix, false, camera.projectionMatrix);
        gl.uniform3fv(this.locations.glowColor, scene.glowColor || [0, 0, 0]);
        gl.uniform1f(this.locations.glowIntensity, scene.glowIntensity || 0.0);
        gl.uniform3fv(this.locations.cameraPosition, camera.position);
        gl.uniform1i(this.locations.renderMode, scene.renderMode || 0);

        // Draw geometry
        gl.drawElements(
            gl.TRIANGLES,
            scene.geometry.indexCount,
            gl.UNSIGNED_SHORT,
            0
        );
    }

    /**
     * Setup vertex buffers for geometry
     * @param {Object} geometry - Geometry data (vertices, normals, indices)
     */
    setupGeometry(geometry) {
        const { gl } = this.renderer;

        // Create or update vertex buffer
        if (!this.buffers.vertices) {
            this.buffers.vertices = gl.createBuffer();
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.vertices);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.locations.position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.locations.position);

        // Create or update normal buffer
        if (!this.buffers.normals) {
            this.buffers.normals = gl.createBuffer();
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normals);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.normals, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.locations.normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.locations.normal);

        // Create or update index buffer
        if (!this.buffers.indices) {
            this.buffers.indices = gl.createBuffer();
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);
    }
}
```

**Step 4: Create pass index file**

Create `src/3d/passes/index.js`:

```javascript
export { BasePass } from './BasePass.js';
export { GeometryPass } from './GeometryPass.js';
```

**Step 5: Run tests to verify they pass**

Run: `npm test -- GeometryPass.test.js`
Expected: PASS - All tests pass

**Step 6: Commit GeometryPass**

```bash
git add src/3d/passes/GeometryPass.js src/3d/passes/index.js test/unit/3d/passes/GeometryPass.test.js
git commit -m "feat(3d): add GeometryPass for main scene rendering

- Render 3D mascot core geometry
- Setup vertex/normal/index buffers
- Set matrices, glow, camera uniforms
- Uses existing core.vert/frag shaders
- 100% test coverage
- Export all passes from src/3d/passes/index.js"
```

---

## Task 7: Integration - Update Core3DManager to Use New Architecture

**Files:**
- Modify: `src/3d/Core3DManager.js`
- Create: `test/unit/3d/Core3DManager.test.js`

**Background:** Core3DManager currently creates WebGLRenderer directly. We need to update it to create RenderPipeline and add GeometryPass.

**Step 1: Read current Core3DManager to understand integration points**

Run: `head -100 src/3d/Core3DManager.js`

**Step 2: Write integration test**

Create `test/unit/3d/Core3DManager.test.js`:

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Core3DManager } from '../../src/3d/Core3DManager.js';

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
            enable: vi.fn(),
            depthFunc: vi.fn(),
            blendFunc: vi.fn(),
            clearColor: vi.fn(),
            viewport: vi.fn(),
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
            getUniformLocation: vi.fn(() => ({}))
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
});
```

**Step 3: Run test to see current failures**

Run: `npm test -- Core3DManager.test.js`
Expected: FAIL - manager.pipeline not defined

**Step 4: Refactor Core3DManager to use modular architecture**

Modify `src/3d/Core3DManager.js`:

Find the constructor and renderer initialization section, and replace with:

```javascript
import { RenderPipeline } from './renderer/RenderPipeline.js';
import { GeometryPass } from './passes/GeometryPass.js';
import { WebGLRenderer } from './renderer/WebGLRenderer.js';

// ... in constructor or init method:

// Create renderer
const renderer = new WebGLRenderer(canvas);

// Create render pipeline
this.pipeline = new RenderPipeline(renderer);

// Add geometry pass
this.pipeline.addPass(new GeometryPass());

// Backward compatibility - expose renderer directly
this.renderer = renderer;
```

**Step 5: Update render() method to use pipeline**

Find the render() method in Core3DManager and replace rendering logic:

```javascript
render() {
    // Prepare scene data
    const scene = {
        geometry: this.currentGeometry,
        modelMatrix: this.modelMatrix,
        glowColor: this.glowColor,
        glowIntensity: this.glowIntensity,
        renderMode: this.renderMode || 0
    };

    // Prepare camera data
    const camera = {
        viewMatrix: this.viewMatrix,
        projectionMatrix: this.projectionMatrix,
        position: this.cameraPosition
    };

    // Execute render pipeline
    this.pipeline.render(scene, camera);
}
```

**Step 6: Run tests to verify integration**

Run: `npm test -- Core3DManager.test.js`
Expected: PASS - Integration tests pass

**Step 7: Run existing 3D tests to verify backward compatibility**

Run: `npm test -- test/unit/3d/`
Expected: All existing tests still pass

**Step 8: Commit Core3DManager integration**

```bash
git add src/3d/Core3DManager.js test/unit/3d/Core3DManager.test.js
git commit -m "refactor(3d): integrate modular architecture into Core3DManager

- Replace direct WebGLRenderer with RenderPipeline
- Add GeometryPass for rendering
- Maintain backward compatibility (expose renderer property)
- Update render() to prepare scene/camera data for pipeline
- All existing tests still pass
- Feature parity maintained"
```

---

## Task 8: Verification and Documentation

**Files:**
- Run all tests
- Update README or docs as needed
- Build and test examples

**Step 1: Run full test suite**

Run: `npm test`
Expected: All tests pass

**Step 2: Build the project**

Run: `npm run build`
Expected: Successful build, no errors

**Step 3: Test directional-test-suite example**

Run: `npm run dev`
Then open: `http://localhost:3000/examples/directional-test-suite.html`
Expected: Mascot renders correctly, all directional tests work

**Step 4: Test 3d-demo example**

Open: `http://localhost:3000/examples/3d-demo.html`
Expected: 3D mascot renders with particles, all features work

**Step 5: Verify bundle size hasn't increased significantly**

Run: `npm run build:analyze`
Expected: Size similar to before (~47.5KB gzipped), maybe slightly larger due to modular structure

**Step 6: Document architecture changes**

Create or update `docs/3D-ARCHITECTURE.md` with:
- Overview of new modular structure
- Diagram showing WebGLRenderer -> RenderPipeline -> Passes flow
- How to add new passes
- Migration notes

**Step 7: Commit verification and docs**

```bash
git add docs/3D-ARCHITECTURE.md
git commit -m "docs: add 3D modular architecture documentation

- Document WebGLRenderer, RenderPipeline, Pass architecture
- Flow diagram showing render pipeline
- Guide for adding new passes
- Migration notes for developers

Phase 1 (Foundation) complete:
- WebGLRenderer: State management only (150 LOC)
- RenderPipeline: Pass orchestration (120 LOC)
- FramebufferManager: FBO pooling (100 LOC)
- BasePass: Interface contract (40 LOC)
- GeometryPass: Geometry rendering (80 LOC)
- All tests passing, feature parity maintained"
```

---

## Execution Handoff

Plan complete and saved to `docs/plans/2025-10-31-3d-modular-phase1-foundation.md`.

**Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration with quality gates

**2. Parallel Session (separate)** - Open new session with executing-plans skill, batch execution with review checkpoints

Which approach would you like?
