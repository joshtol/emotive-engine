import { describe, it, expect } from 'vitest';
import { StanceRegistry } from '../../../../src/core/state/StanceRegistry.js';

describe('StanceRegistry', () => {
    describe('registerStance / hasStance / getStance', () => {
        it('should register and retrieve a stance', () => {
            const registry = new StanceRegistry();
            registry.registerStance('warrior', {
                shape: 'diamond',
                elements: ['fire'],
                description: 'Battle stance',
            });
            expect(registry.hasStance('warrior')).toBe(true);
            const stance = registry.getStance('warrior');
            expect(stance.shape).toBe('diamond');
            expect(stance.elements).toEqual(['fire']);
        });

        it('should return false for unregistered stance', () => {
            const registry = new StanceRegistry();
            expect(registry.hasStance('nonexistent')).toBe(false);
        });

        it('should return null for unregistered stance via getStance', () => {
            const registry = new StanceRegistry();
            expect(registry.getStance('nonexistent')).toBeNull();
        });

        it('should return a copy (not reference) from getStance', () => {
            const registry = new StanceRegistry();
            registry.registerStance('test', { shape: 'circle' });
            const stance = registry.getStance('test');
            stance.shape = 'modified';
            expect(registry.getStance('test').shape).toBe('circle');
        });
    });

    describe('activate / dismiss / getActiveStance', () => {
        it('should activate a registered stance', () => {
            const registry = new StanceRegistry();
            registry.registerStance('calm', { shape: 'circle' });
            const config = registry.activate('calm');
            expect(config).toBeDefined();
            expect(config.shape).toBe('circle');
        });

        it('should return null when activating unregistered stance', () => {
            const registry = new StanceRegistry();
            expect(registry.activate('nonexistent')).toBeNull();
        });

        it('should track active stance', () => {
            const registry = new StanceRegistry();
            registry.registerStance('calm', { shape: 'circle' });
            registry.activate('calm');
            const active = registry.getActiveStance();
            expect(active.name).toBe('calm');
            expect(active.config.shape).toBe('circle');
        });

        it('should dismiss active stance', () => {
            const registry = new StanceRegistry();
            registry.registerStance('calm', { shape: 'circle' });
            registry.activate('calm');
            expect(registry.dismiss()).toBe(true);
            expect(registry.getActiveStance()).toBeNull();
        });

        it('should return false when dismissing with no active stance', () => {
            const registry = new StanceRegistry();
            expect(registry.dismiss()).toBe(false);
        });
    });

    describe('getAvailableStances', () => {
        it('should return empty array when no stances registered', () => {
            const registry = new StanceRegistry();
            expect(registry.getAvailableStances()).toEqual([]);
        });

        it('should return all registered stance names', () => {
            const registry = new StanceRegistry();
            registry.registerStance('warrior', { shape: 'diamond' });
            registry.registerStance('calm', { shape: 'circle' });
            registry.registerStance('alert', { shape: 'triangle' });
            const names = registry.getAvailableStances();
            expect(names).toHaveLength(3);
            expect(names).toContain('warrior');
            expect(names).toContain('calm');
            expect(names).toContain('alert');
        });
    });
});
