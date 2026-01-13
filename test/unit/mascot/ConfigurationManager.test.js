/**
 * ConfigurationManager Tests
 * Tests for the configuration management module
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigurationManager } from '../../../src/mascot/system/ConfigurationManager.js';

describe('ConfigurationManager', () => {
    let configManager;
    let mockMascot;

    beforeEach(() => {
        mockMascot = {
            // Mock mascot properties
        };
    });

    describe('Constructor', () => {
        it('should initialize in legacy mode when passed mascot', () => {
            configManager = new ConfigurationManager(mockMascot);

            expect(configManager._legacyMode).toBe(true);
        });

        it('should validate and store config', () => {
            const customConfig = {
                canvasId: 'my-canvas',
                startingEmotion: 'joy'
            };

            configManager = new ConfigurationManager(mockMascot, customConfig);

            expect(configManager.config.canvasId).toBe('my-canvas');
            expect(configManager.config.startingEmotion).toBe('joy');
        });

        it('should handle empty config', () => {
            configManager = new ConfigurationManager(mockMascot);

            expect(configManager.config).toBeDefined();
        });
    });

    describe('validateConfig()', () => {
        beforeEach(() => {
            configManager = new ConfigurationManager(mockMascot);
        });

        it('should set default canvasId', () => {
            const validated = configManager.validateConfig({});

            expect(validated.canvasId).toBe('emotive-canvas');
        });

        it('should set default startingEmotion', () => {
            const validated = configManager.validateConfig({});

            expect(validated.startingEmotion).toBe('neutral');
        });

        it('should set default emotionalResponsiveness', () => {
            const validated = configManager.validateConfig({});

            expect(validated.emotionalResponsiveness).toBe(0.5);
        });

        it('should set default particleIntensity', () => {
            const validated = configManager.validateConfig({});

            expect(validated.particleIntensity).toBe(1.0);
        });

        it('should set default glowIntensity', () => {
            const validated = configManager.validateConfig({});

            expect(validated.glowIntensity).toBe(1.0);
        });

        it('should set default audioEnabled', () => {
            const validated = configManager.validateConfig({});

            expect(validated.audioEnabled).toBe(false);
        });

        it('should set default showFPS', () => {
            const validated = configManager.validateConfig({});

            expect(validated.showFPS).toBe(false);
        });

        it('should set default debugMode', () => {
            const validated = configManager.validateConfig({});

            expect(validated.debugMode).toBe(false);
        });

        it('should set default renderMode', () => {
            const validated = configManager.validateConfig({});

            expect(validated.renderMode).toBe('default');
        });

        it('should set default maxParticles', () => {
            const validated = configManager.validateConfig({});

            expect(validated.maxParticles).toBe(100);
        });

        it('should override defaults with custom values', () => {
            const customConfig = {
                canvasId: 'custom-canvas',
                startingEmotion: 'anger',
                emotionalResponsiveness: 0.8,
                particleIntensity: 1.5,
                glowIntensity: 0.5,
                audioEnabled: true,
                showFPS: true,
                debugMode: true,
                renderMode: 'advanced',
                maxParticles: 200
            };

            const validated = configManager.validateConfig(customConfig);

            expect(validated.canvasId).toBe('custom-canvas');
            expect(validated.startingEmotion).toBe('anger');
            expect(validated.emotionalResponsiveness).toBe(0.8);
            expect(validated.particleIntensity).toBe(1.5);
            expect(validated.glowIntensity).toBe(0.5);
            expect(validated.audioEnabled).toBe(true);
            expect(validated.showFPS).toBe(true);
            expect(validated.debugMode).toBe(true);
            expect(validated.renderMode).toBe('advanced');
            expect(validated.maxParticles).toBe(200);
        });

        it('should preserve additional custom properties', () => {
            const customConfig = {
                customProp1: 'value1',
                customProp2: 42,
                customProp3: true
            };

            const validated = configManager.validateConfig(customConfig);

            expect(validated.customProp1).toBe('value1');
            expect(validated.customProp2).toBe(42);
            expect(validated.customProp3).toBe(true);
        });

        it('should handle zero values correctly (not override with defaults)', () => {
            const customConfig = {
                emotionalResponsiveness: 0,
                particleIntensity: 0,
                glowIntensity: 0
            };

            const validated = configManager.validateConfig(customConfig);

            expect(validated.emotionalResponsiveness).toBe(0);
            expect(validated.particleIntensity).toBe(0);
            expect(validated.glowIntensity).toBe(0);
        });

        it('should handle false values correctly (not override with defaults)', () => {
            const customConfig = {
                audioEnabled: false,
                showFPS: false,
                debugMode: false
            };

            const validated = configManager.validateConfig(customConfig);

            expect(validated.audioEnabled).toBe(false);
            expect(validated.showFPS).toBe(false);
            expect(validated.debugMode).toBe(false);
        });
    });

    describe('getConfig()', () => {
        it('should return a copy of the configuration', () => {
            const customConfig = { canvasId: 'test-canvas' };
            configManager = new ConfigurationManager(mockMascot, customConfig);

            const retrieved = configManager.getConfig();

            expect(retrieved.canvasId).toBe('test-canvas');
        });

        it('should return a copy, not the original object', () => {
            configManager = new ConfigurationManager(mockMascot);

            const retrieved = configManager.getConfig();
            retrieved.canvasId = 'modified';

            expect(configManager.config.canvasId).toBe('emotive-canvas');
        });

        it('should include all configuration properties', () => {
            configManager = new ConfigurationManager(mockMascot, {
                customProp: 'value'
            });

            const retrieved = configManager.getConfig();

            expect(retrieved.customProp).toBe('value');
            expect(retrieved.canvasId).toBeDefined();
            expect(retrieved.startingEmotion).toBeDefined();
        });
    });

    describe('updateConfig()', () => {
        beforeEach(() => {
            configManager = new ConfigurationManager(mockMascot);
        });

        it('should update single property', () => {
            configManager.updateConfig({ canvasId: 'new-canvas' });

            expect(configManager.config.canvasId).toBe('new-canvas');
        });

        it('should update multiple properties', () => {
            configManager.updateConfig({
                canvasId: 'new-canvas',
                startingEmotion: 'sadness',
                maxParticles: 150
            });

            expect(configManager.config.canvasId).toBe('new-canvas');
            expect(configManager.config.startingEmotion).toBe('sadness');
            expect(configManager.config.maxParticles).toBe(150);
        });

        it('should preserve non-updated properties', () => {
            const originalDebugMode = configManager.config.debugMode;

            configManager.updateConfig({ canvasId: 'new-canvas' });

            expect(configManager.config.debugMode).toBe(originalDebugMode);
        });

        it('should return updated configuration', () => {
            const result = configManager.updateConfig({ canvasId: 'new-canvas' });

            expect(result.canvasId).toBe('new-canvas');
        });

        it('should handle empty updates', () => {
            const originalConfig = { ...configManager.config };

            configManager.updateConfig({});

            expect(configManager.config).toEqual(originalConfig);
        });

        it('should add new properties', () => {
            configManager.updateConfig({ newProperty: 'new-value' });

            expect(configManager.config.newProperty).toBe('new-value');
        });
    });
});
