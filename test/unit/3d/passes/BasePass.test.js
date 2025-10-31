import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BasePass } from '../../../../src/3d/passes/BasePass.js';

// Mock pass that implements abstract methods for testing
class TestPass extends BasePass {
    setup() {
        // Mock implementation - does nothing
    }
    execute(scene, camera) {
        // Mock implementation - does nothing
    }
}

describe('BasePass', () => {
    let pass;
    let mockRenderer;
    let mockFBManager;

    beforeEach(() => {
        mockRenderer = { gl: {} };
        mockFBManager = {};
        pass = new TestPass('test-pass');
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
        const basePass = new BasePass('base');
        basePass.renderer = mockRenderer;
        basePass.fbManager = mockFBManager;

        expect(() => basePass.execute({}, {})).toThrow('BasePass.execute() must be implemented');
    });

    it('should throw error if setup() not implemented', () => {
        const basePass = new BasePass('base');

        expect(() => basePass.setup()).toThrow('BasePass.setup() must be implemented');
    });
});
