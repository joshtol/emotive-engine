/**
 * Tests for CanvasContextManager
 * Validates canvas context recovery, fallbacks, and performance optimization
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CanvasContextManager } from '../src/core/CanvasContextManager.js';
import { ErrorTypes } from '../src/core/ErrorResponse.js';

// Mock canvas and context
class MockCanvas {
  constructor() {
    this.width = 400;
    this.height = 400;
    this.style = { width: '400px', height: '400px' };
    this.parentNode = {
      insertBefore: vi.fn()
    };
    this.nextSibling = null;
    this.eventListeners = new Map();
    this.context = new MockContext();
  }

  getContext(type, options) {
    if (type === '2d') {
      return this.context;
    }
    return null;
  }

  getBoundingClientRect() {
    return {
      width: 400,
      height: 400,
      top: 0,
      left: 0
    };
  }

  addEventListener(event, handler) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(handler);
  }

  removeEventListener(event, handler) {
    if (this.eventListeners.has(event)) {
      const handlers = this.eventListeners.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  dispatchEvent(event) {
    const eventType = event.type || event;
    if (this.eventListeners.has(eventType)) {
      this.eventListeners.get(eventType).forEach(handler => {
        handler(event);
      });
    }
  }
}

class MockContext {
  constructor() {
    this.imageSmoothingEnabled = true;
    this.imageSmoothingQuality = 'high';
    this.textBaseline = 'alphabetic';
    this.textAlign = 'start';
    this.fillStyle = '#000000';
    this.strokeStyle = '#000000';
    this.saveCount = 0;
  }

  scale(x, y) {
    this.scaleX = x;
    this.scaleY = y;
  }

  save() {
    this.saveCount++;
  }

  restore() {
    this.saveCount = Math.max(0, this.saveCount - 1);
  }

  clearRect() {}
  fillRect() {}
  strokeRect() {}
  beginPath() {}
  moveTo() {}
  lineTo() {}
  arc() {}
  fill() {}
  stroke() {}
}

// Mock window and document
Object.defineProperty(global, 'window', {
  value: {
    devicePixelRatio: 2,
    location: {
      href: 'http://localhost:3000/test'
    }
  }
});

Object.defineProperty(global, 'document', {
  value: {
    createElement: vi.fn().mockImplementation(tag => ({
      style: {},
      textContent: '',
      appendChild: vi.fn(),
      parentNode: null,
      removeChild: vi.fn()
    }))
  }
});

describe('CanvasContextManager', () => {
  let canvas;
  let contextManager;
  let eventCallback;

  beforeEach(() => {
    canvas = new MockCanvas();
    eventCallback = vi.fn();
  });

  afterEach(() => {
    if (contextManager) {
      contextManager.destroy();
    }
  });

  describe('Initialization', () => {
    it('should initialize successfully with valid canvas', () => {
      contextManager = new CanvasContextManager(canvas);
      
      expect(contextManager.context).toBeTruthy();
      expect(contextManager.isContextLost).toBe(false);
      expect(contextManager.devicePixelRatio).toBe(2);
    });

    it('should set up high-DPI support', () => {
      contextManager = new CanvasContextManager(canvas, {
        enableHighDPISupport: true
      });
      
      expect(contextManager.scaleFactor).toBeGreaterThan(1);
      expect(canvas.width).toBeGreaterThan(400);
      expect(canvas.height).toBeGreaterThan(400);
    });

    it('should disable high-DPI support when configured', () => {
      contextManager = new CanvasContextManager(canvas, {
        enableHighDPISupport: false
      });
      
      expect(canvas.width).toBe(400);
      expect(canvas.height).toBe(400);
    });

    it('should apply context optimizations', () => {
      contextManager = new CanvasContextManager(canvas, {
        enablePerformanceOptimization: true
      });
      
      expect(contextManager.context.imageSmoothingEnabled).toBe(true);
      expect(contextManager.context.textBaseline).toBe('top');
      expect(contextManager.context.textAlign).toBe('left');
    });

    it('should set up context event listeners', () => {
      contextManager = new CanvasContextManager(canvas, {
        enableContextRecovery: true
      });
      
      expect(canvas.eventListeners.has('webglcontextlost')).toBe(true);
      expect(canvas.eventListeners.has('webglcontextrestored')).toBe(true);
      expect(canvas.eventListeners.has('contextlost')).toBe(true);
      expect(canvas.eventListeners.has('contextrestored')).toBe(true);
    });
  });

  describe('Context Recovery', () => {
    beforeEach(() => {
      contextManager = new CanvasContextManager(canvas, {
        enableContextRecovery: true,
        maxRecoveryAttempts: 3,
        recoveryDelay: 100
      });
      contextManager.setEventCallback(eventCallback);
    });

    it('should handle context lost event', () => {
      const mockEvent = {
        type: 'contextlost',
        preventDefault: vi.fn()
      };
      
      contextManager.handleContextLost(mockEvent);
      
      expect(contextManager.isContextLost).toBe(true);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(eventCallback).toHaveBeenCalledWith('contextLost', expect.any(Object));
    });

    it('should handle context restored event', () => {
      // First lose context
      contextManager.isContextLost = true;
      
      const mockEvent = {
        type: 'contextrestored'
      };
      
      contextManager.handleContextRestored(mockEvent);
      
      expect(contextManager.isContextLost).toBe(false);
      expect(eventCallback).toHaveBeenCalledWith('contextRestored', expect.any(Object));
    });

    it('should attempt manual recovery', () => {
      contextManager.isContextLost = true;
      
      const result = contextManager.attemptRecovery();
      
      expect(result.success).toBe(true);
      expect(contextManager.recoveryAttempts).toBe(1);
      expect(contextManager.isContextLost).toBe(false);
    });

    it('should limit recovery attempts', () => {
      contextManager.recoveryAttempts = 3; // At max attempts
      
      const result = contextManager.attemptRecovery();
      
      expect(result.success).toBe(false);
      expect(result.error.type).toBe(ErrorTypes.CANVAS_CONTEXT_LOST);
      expect(result.error.message).toContain('Maximum recovery attempts exceeded');
    });

    it('should enforce recovery delay', () => {
      contextManager.lastRecoveryTime = Date.now();
      
      const result = contextManager.attemptRecovery();
      
      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Recovery attempt too soon');
    });

    it('should disable recovery when configured', () => {
      const noRecoveryManager = new CanvasContextManager(canvas, {
        enableContextRecovery: false
      });
      
      const result = noRecoveryManager.attemptRecovery();
      
      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Context recovery is disabled');
      
      noRecoveryManager.destroy();
    });
  });

  describe('Fallback Rendering', () => {
    beforeEach(() => {
      contextManager = new CanvasContextManager(canvas);
      contextManager.setEventCallback(eventCallback);
    });

    it('should enable basic fallback rendering', () => {
      contextManager.enableFallbackRendering();
      
      expect(contextManager.renderingMode).toBe('basic');
      expect(contextManager.fallbackRenderer).toBeTruthy();
      expect(eventCallback).toHaveBeenCalledWith('fallbackEnabled', expect.any(Object));
    });

    it('should enable DOM fallback rendering', () => {
      contextManager.config.fallbackMode = 'dom';
      contextManager.enableFallbackRendering();
      
      expect(contextManager.renderingMode).toBe('dom');
      expect(contextManager.fallbackRenderer).toBeTruthy();
    });

    it('should disable fallback rendering', () => {
      contextManager.enableFallbackRendering();
      contextManager.disableFallbackRendering();
      
      expect(contextManager.renderingMode).toBe('normal');
      expect(contextManager.fallbackRenderer).toBe(null);
      expect(eventCallback).toHaveBeenCalledWith('fallbackDisabled', expect.any(Object));
    });

    it('should return fallback context when context is lost', () => {
      contextManager.isContextLost = true;
      contextManager.enableFallbackRendering();
      
      const contextInfo = contextManager.getContext();
      
      expect(contextInfo.type).toBe('fallback');
      expect(contextInfo.mode).toBe('basic');
      expect(contextInfo.isLost).toBe(true);
    });

    it('should return normal context when available', () => {
      const contextInfo = contextManager.getContext();
      
      expect(contextInfo.type).toBe('2d');
      expect(contextInfo.mode).toBe('normal');
      expect(contextInfo.isLost).toBe(false);
    });
  });

  describe('Context Availability', () => {
    beforeEach(() => {
      contextManager = new CanvasContextManager(canvas);
    });

    it('should detect available context', () => {
      expect(contextManager.isContextAvailable()).toBe(true);
    });

    it('should detect lost context', () => {
      contextManager.isContextLost = true;
      
      expect(contextManager.isContextAvailable()).toBe(false);
    });

    it('should detect context errors', () => {
      // Mock context that throws errors
      contextManager.context.save = () => {
        throw new Error('Context error');
      };
      
      expect(contextManager.isContextAvailable()).toBe(false);
      expect(contextManager.isContextLost).toBe(true);
    });
  });

  describe('Performance Optimization', () => {
    beforeEach(() => {
      contextManager = new CanvasContextManager(canvas, {
        enablePerformanceOptimization: true
      });
    });

    it('should record frame metrics', () => {
      contextManager.recordFrameMetrics(16.67); // 60 FPS
      contextManager.recordFrameMetrics(33.33); // 30 FPS
      
      const metrics = contextManager.getPerformanceMetrics();
      
      expect(metrics.drawCalls).toBe(2);
      expect(metrics.frameTimeHistory).toHaveLength(2);
      expect(metrics.averageFrameTime).toBeCloseTo(25, 0);
    });

    it('should calculate average FPS', () => {
      // Add some frame times (60 FPS = 16.67ms, 30 FPS = 33.33ms)
      contextManager.recordFrameMetrics(16.67);
      contextManager.recordFrameMetrics(16.67);
      contextManager.recordFrameMetrics(33.33);
      
      const avgFPS = contextManager.calculateAverageFPS();
      
      expect(avgFPS).toBeGreaterThan(40);
      expect(avgFPS).toBeLessThan(60);
    });

    it('should optimize canvas size for poor performance', () => {
      // Simulate poor performance
      for (let i = 0; i < 10; i++) {
        contextManager.recordFrameMetrics(50); // 20 FPS
      }
      
      const originalWidth = canvas.width;
      const result = contextManager.optimizeCanvasSize(60);
      
      expect(result.success).toBe(true);
      expect(result.data.optimized).toBe(true);
      expect(canvas.width).toBeLessThan(originalWidth);
    });

    it('should not optimize canvas size for good performance', () => {
      // Simulate good performance
      for (let i = 0; i < 10; i++) {
        contextManager.recordFrameMetrics(16.67); // 60 FPS
      }
      
      const originalWidth = canvas.width;
      const result = contextManager.optimizeCanvasSize(60);
      
      expect(result.success).toBe(true);
      expect(result.data.optimized).toBe(false);
      expect(canvas.width).toBe(originalWidth);
    });

    it('should maintain minimum canvas size', () => {
      canvas.width = 250;
      canvas.height = 250;
      
      // Simulate very poor performance
      for (let i = 0; i < 10; i++) {
        contextManager.recordFrameMetrics(100); // 10 FPS
      }
      
      contextManager.optimizeCanvasSize(60);
      
      expect(canvas.width).toBeGreaterThanOrEqual(200);
      expect(canvas.height).toBeGreaterThanOrEqual(200);
    });

    it('should reset performance metrics', () => {
      contextManager.recordFrameMetrics(16.67);
      contextManager.recordFrameMetrics(33.33);
      
      contextManager.resetPerformanceMetrics();
      
      const metrics = contextManager.getPerformanceMetrics();
      expect(metrics.drawCalls).toBe(0);
      expect(metrics.frameTimeHistory).toHaveLength(0);
    });

    it('should respect performance optimization configuration', () => {
      const noOptManager = new CanvasContextManager(canvas, {
        enablePerformanceOptimization: false
      });
      
      const result = noOptManager.optimizeCanvasSize(60);
      
      expect(result.success).toBe(true);
      expect(result.data.message).toContain('Performance optimization disabled');
      
      noOptManager.destroy();
    });
  });

  describe('Device Pixel Ratio Handling', () => {
    it('should handle missing devicePixelRatio', () => {
      // Mock missing devicePixelRatio
      const originalDPR = window.devicePixelRatio;
      delete window.devicePixelRatio;
      
      contextManager = new CanvasContextManager(canvas);
      
      expect(contextManager.devicePixelRatio).toBe(1);
      
      // Restore
      window.devicePixelRatio = originalDPR;
    });

    it('should cap scale factor for performance', () => {
      // Mock very high DPR
      window.devicePixelRatio = 4;
      
      contextManager = new CanvasContextManager(canvas, {
        enableHighDPISupport: true
      });
      
      expect(contextManager.scaleFactor).toBeLessThanOrEqual(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle context creation failure', () => {
      // Mock canvas that fails to create context
      canvas.getContext = () => null;
      
      contextManager = new CanvasContextManager(canvas);
      
      expect(contextManager.context).toBe(null);
      expect(contextManager.renderingMode).not.toBe('normal');
    });

    it('should handle initialization errors', () => {
      // Mock canvas that throws during setup
      canvas.getBoundingClientRect = () => {
        throw new Error('Setup failed');
      };
      
      contextManager = new CanvasContextManager(canvas);
      
      expect(contextManager.renderingMode).not.toBe('normal');
    });
  });

  describe('Cleanup', () => {
    beforeEach(() => {
      contextManager = new CanvasContextManager(canvas, {
        enableContextRecovery: true
      });
    });

    it('should remove event listeners on destroy', () => {
      const initialListeners = canvas.eventListeners.get('contextlost').length;
      
      contextManager.destroy();
      
      expect(canvas.eventListeners.get('contextlost')).toHaveLength(initialListeners - 1);
    });

    it('should cleanup fallback renderer on destroy', () => {
      contextManager.enableFallbackRendering();
      const fallbackRenderer = contextManager.fallbackRenderer;
      
      contextManager.destroy();
      
      expect(contextManager.fallbackRenderer).toBe(null);
    });

    it('should clear all references on destroy', () => {
      contextManager.destroy();
      
      expect(contextManager.context).toBe(null);
      expect(contextManager.canvas).toBe(null);
      expect(contextManager.onEvent).toBe(null);
    });
  });

  describe('Fallback Renderers', () => {
    it('should create basic fallback renderer', () => {
      contextManager = new CanvasContextManager(canvas, {
        fallbackMode: 'basic'
      });
      
      contextManager.enableFallbackRendering();
      
      expect(contextManager.fallbackRenderer).toBeTruthy();
      expect(document.createElement).toHaveBeenCalledWith('div');
    });

    it('should create DOM fallback renderer', () => {
      contextManager = new CanvasContextManager(canvas, {
        fallbackMode: 'dom'
      });
      
      contextManager.enableFallbackRendering();
      
      expect(contextManager.fallbackRenderer).toBeTruthy();
      expect(contextManager.renderingMode).toBe('dom');
    });

    it('should handle no fallback mode', () => {
      contextManager = new CanvasContextManager(canvas, {
        fallbackMode: 'none'
      });
      
      contextManager.enableFallbackRendering();
      
      expect(contextManager.fallbackRenderer).toBe(null);
      expect(contextManager.renderingMode).toBe('none');
    });
  });
});