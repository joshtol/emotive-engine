/**
 * DegradationManager Tests
 * Tests for the graceful performance optimization system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DegradationManager } from '../../../../src/core/system/DegradationManager.js';

describe('DegradationManager', () => {
    let manager;

    beforeEach(() => {
        manager = new DegradationManager({
            enableAutoOptimization: false,
            performanceThreshold: 30,
            memoryThreshold: 50
        });
    });

    describe('Constructor', () => {
        it('should initialize with default config', () => {
            expect(manager.config.performanceThreshold).toBe(30);
            expect(manager.config.memoryThreshold).toBe(50);
            expect(manager.config.enableAutoOptimization).toBe(false);
        });

        it('should start at optimal level', () => {
            expect(manager.currentLevel).toBe(0);
            expect(manager.getCurrentLevel().name).toBe('optimal');
        });

        it('should have 4 degradation levels', () => {
            expect(manager.degradationLevels.length).toBe(4);
        });

        it('should initialize empty performance history', () => {
            expect(manager.performanceHistory).toEqual([]);
        });
    });

    describe('Degradation Levels', () => {
        it('should have optimal level with full features', () => {
            const level = manager.degradationLevels[0];

            expect(level.name).toBe('optimal');
            expect(level.particleLimit).toBe(50);
            expect(level.audioEnabled).toBe(true);
            expect(level.fullEffects).toBe(true);
            expect(level.targetFPS).toBe(60);
        });

        it('should have reduced level with fewer features', () => {
            const level = manager.degradationLevels[1];

            expect(level.name).toBe('reduced');
            expect(level.particleLimit).toBe(25);
            expect(level.audioEnabled).toBe(true);
            expect(level.fullEffects).toBe(false);
        });

        it('should have minimal level without audio', () => {
            const level = manager.degradationLevels[2];

            expect(level.name).toBe('minimal');
            expect(level.audioEnabled).toBe(false);
            expect(level.targetFPS).toBe(30);
        });

        it('should have emergency level with basic functionality', () => {
            const level = manager.degradationLevels[3];

            expect(level.name).toBe('emergency');
            expect(level.particleLimit).toBe(5);
            expect(level.targetFPS).toBe(15);
        });
    });

    describe('getCurrentLevel()', () => {
        it('should return current level config', () => {
            const level = manager.getCurrentLevel();

            expect(level.name).toBe('optimal');
            expect(level.particleLimit).toBeDefined();
            expect(level.targetFPS).toBeDefined();
        });

        it('should return clone (immutable)', () => {
            const level = manager.getCurrentLevel();
            level.particleLimit = 9999;

            expect(manager.getCurrentLevel().particleLimit).toBe(50);
        });
    });

    describe('getAllLevels()', () => {
        it('should return all degradation levels', () => {
            const levels = manager.getAllLevels();

            expect(levels.length).toBe(4);
            expect(levels[0].name).toBe('optimal');
            expect(levels[3].name).toBe('emergency');
        });

        it('should return clones (immutable)', () => {
            const levels = manager.getAllLevels();
            levels[0].particleLimit = 9999;

            expect(manager.getAllLevels()[0].particleLimit).toBe(50);
        });
    });

    describe('setLevel()', () => {
        it('should set level by index', () => {
            manager.setLevel(2);

            expect(manager.currentLevel).toBe(2);
            expect(manager.getCurrentLevel().name).toBe('minimal');
        });

        it('should set level by name', () => {
            manager.setLevel('emergency');

            expect(manager.currentLevel).toBe(3);
            expect(manager.getCurrentLevel().name).toBe('emergency');
        });

        it('should clamp index to valid range', () => {
            manager.setLevel(100);

            expect(manager.currentLevel).toBe(3); // Max is 3
        });

        it('should return false for unknown level name', () => {
            const result = manager.setLevel('nonexistent');

            expect(result).toBe(false);
            expect(manager.currentLevel).toBe(0);
        });

        it('should return false for invalid type', () => {
            const result = manager.setLevel({});

            expect(result).toBe(false);
        });

        it('should return true on success', () => {
            expect(manager.setLevel('reduced')).toBe(true);
        });
    });

    describe('canDegrade()', () => {
        it('should return true when not at lowest level', () => {
            expect(manager.canDegrade()).toBe(true);
        });

        it('should return false when at lowest level', () => {
            manager.currentLevel = 3;

            expect(manager.canDegrade()).toBe(false);
        });

        it('should respect time throttle', () => {
            manager.lastDegradationTime = Date.now();

            expect(manager.canDegrade()).toBe(false);
        });
    });

    describe('canRecover()', () => {
        it('should return false when at optimal level', () => {
            expect(manager.canRecover()).toBe(false);
        });

        it('should return true when degraded', () => {
            manager.currentLevel = 2;

            expect(manager.canRecover()).toBe(true);
        });
    });

    describe('applyDegradation()', () => {
        it('should increment level', () => {
            manager.lastDegradationTime = 0;

            manager.applyDegradation();

            expect(manager.currentLevel).toBe(1);
        });

        it('should update lastDegradationTime', () => {
            manager.lastDegradationTime = 0;
            const before = Date.now();

            manager.applyDegradation();

            expect(manager.lastDegradationTime).toBeGreaterThanOrEqual(before);
        });

        it('should not degrade beyond emergency level', () => {
            manager.currentLevel = 3;

            manager.applyDegradation();

            expect(manager.currentLevel).toBe(3);
        });
    });

    describe('applyRecovery()', () => {
        it('should decrement level', () => {
            manager.currentLevel = 2;

            manager.applyRecovery();

            expect(manager.currentLevel).toBe(1);
        });

        it('should not recover above optimal', () => {
            manager.currentLevel = 0;

            manager.applyRecovery();

            expect(manager.currentLevel).toBe(0);
        });

        it('should reset consecutiveGoodFrames', () => {
            manager.currentLevel = 1;
            manager.consecutiveGoodFrames = 50;

            manager.applyRecovery();

            expect(manager.consecutiveGoodFrames).toBe(0);
        });
    });

    describe('isFeatureAvailable()', () => {
        it('should check audio availability', () => {
            const result = manager.isFeatureAvailable('audio');

            // Depends on browser capabilities and current level
            expect(typeof result).toBe('boolean');
        });

        it('should check particles availability', () => {
            expect(manager.isFeatureAvailable('particles')).toBe(true);
        });

        it('should respect manually disabled features', () => {
            manager.disabledFeatures.add('audio');

            expect(manager.isFeatureAvailable('audio')).toBe(false);
        });

        it('should check fullEffects based on level', () => {
            manager.setLevel('reduced');

            expect(manager.isFeatureAvailable('fullEffects')).toBe(false);
        });
    });

    describe('getPerformanceStats()', () => {
        it('should return empty stats when no history', () => {
            const stats = manager.getPerformanceStats();

            expect(stats.avgFPS).toBe(0);
            expect(stats.avgMemory).toBe(0);
            expect(stats.samples).toBe(0);
        });

        it('should return stats with history', () => {
            manager.performanceHistory = [
                { fps: 60, memoryUsage: 30 },
                { fps: 50, memoryUsage: 40 },
                { fps: 70, memoryUsage: 35 }
            ];

            const stats = manager.getPerformanceStats();

            expect(stats.avgFPS).toBe(60);
            expect(stats.avgMemory).toBe(35);
            expect(stats.samples).toBe(3);
            expect(stats.minFPS).toBe(50);
            expect(stats.maxFPS).toBe(70);
        });

        it('should include current level name', () => {
            const stats = manager.getPerformanceStats();

            expect(stats.currentLevel).toBe('optimal');
        });
    });

    describe('reset()', () => {
        it('should reset to optimal level', () => {
            manager.currentLevel = 3;
            manager.performanceHistory = [{ fps: 30 }];
            manager.consecutiveGoodFrames = 100;

            manager.reset();

            expect(manager.currentLevel).toBe(0);
            expect(manager.performanceHistory).toEqual([]);
            expect(manager.consecutiveGoodFrames).toBe(0);
        });
    });

    describe('getRecommendedSettings()', () => {
        it('should return settings for current level', () => {
            const settings = manager.getRecommendedSettings();

            expect(settings.maxParticles).toBeDefined();
            expect(settings.enableAudio).toBeDefined();
            expect(settings.enableFullEffects).toBeDefined();
            expect(settings.targetFPS).toBeDefined();
            expect(settings.qualityLevel).toBeDefined();
        });

        it('should reflect reduced settings at lower levels', () => {
            manager.setLevel('minimal');

            const settings = manager.getRecommendedSettings();

            expect(settings.maxParticles).toBeLessThanOrEqual(10);
            expect(settings.enableAudio).toBe(false);
            expect(settings.targetFPS).toBe(30);
        });
    });

    describe('checkPerformance()', () => {
        it('should not act when auto-optimization disabled', () => {
            manager.config.enableAutoOptimization = false;
            const initialLevel = manager.currentLevel;

            manager.checkPerformance({ fps: 10 });

            expect(manager.currentLevel).toBe(initialLevel);
        });

        it('should add to performance history when enabled', () => {
            manager.config.enableAutoOptimization = true;

            manager.checkPerformance({ fps: 60, memoryUsage: 30 });

            expect(manager.performanceHistory.length).toBe(1);
        });

        it('should limit history size', () => {
            manager.config.enableAutoOptimization = true;
            manager.maxHistorySize = 5;

            for (let i = 0; i < 10; i++) {
                manager.checkPerformance({ fps: 60 });
            }

            expect(manager.performanceHistory.length).toBe(5);
        });
    });

    describe('Accessibility Detection', () => {
        it('should detect reduced motion preference', () => {
            const result = manager.detectReducedMotion();

            expect(typeof result).toBe('boolean');
        });

        it('should detect high contrast preference', () => {
            const result = manager.detectHighContrast();

            expect(typeof result).toBe('boolean');
        });
    });
});
