/**
 * HealthCheckManager Tests
 * Tests for the health check and system status module
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HealthCheckManager } from '../../../src/mascot/system/HealthCheckManager.js';

describe('HealthCheckManager', () => {
    let healthCheckManager;
    let mockErrorBoundary;
    let mockSystemStatusReporter;
    let mockDiagnosticsManager;
    let mockMobileOptimization;
    let mockAccessibilityManager;
    let mockConfig;
    let mockChainTarget;

    beforeEach(() => {
        mockErrorBoundary = {
            wrap: vi.fn((fn, _context, returnVal) => {
                return () => {
                    try {
                        fn();
                    } catch (_e) {
                        // Error boundary catches errors
                    }
                    return returnVal;
                };
            })
        };

        mockSystemStatusReporter = {
            getSystemStatus: vi.fn().mockReturnValue({
                renderer: { status: 'ok' },
                state: { emotion: 'neutral' },
                performance: { fps: 60 }
            })
        };

        mockDiagnosticsManager = {
            getPerformanceMetrics: vi.fn().mockReturnValue({
                fps: 60,
                frameTime: 16.67,
                memoryUsage: 50
            })
        };

        mockMobileOptimization = {
            getStatus: vi.fn().mockReturnValue({
                isMobile: false,
                touchEnabled: true,
                devicePixelRatio: 2
            })
        };

        mockAccessibilityManager = {
            getStatus: vi.fn().mockReturnValue({
                reducedMotion: false,
                highContrast: false,
                prefersColorScheme: 'light'
            })
        };

        mockConfig = {
            showDebug: false,
            showFPS: false
        };

        mockChainTarget = { name: 'chainTarget' };
    });

    function createManager(overrides = {}) {
        return new HealthCheckManager({
            errorBoundary: mockErrorBoundary,
            systemStatusReporter: mockSystemStatusReporter,
            diagnosticsManager: mockDiagnosticsManager,
            mobileOptimization: mockMobileOptimization,
            accessibilityManager: mockAccessibilityManager,
            config: mockConfig,
            chainTarget: mockChainTarget,
            ...overrides
        });
    }

    describe('Constructor', () => {
        it('should initialize with all dependencies', () => {
            healthCheckManager = createManager();

            expect(healthCheckManager.errorBoundary).toBe(mockErrorBoundary);
            expect(healthCheckManager.systemStatusReporter).toBe(mockSystemStatusReporter);
            expect(healthCheckManager.diagnosticsManager).toBe(mockDiagnosticsManager);
            expect(healthCheckManager.mobileOptimization).toBe(mockMobileOptimization);
            expect(healthCheckManager.accessibilityManager).toBe(mockAccessibilityManager);
            expect(healthCheckManager.config).toBe(mockConfig);
        });

        it('should throw if errorBoundary is missing', () => {
            expect(() => {
                new HealthCheckManager({
                    diagnosticsManager: mockDiagnosticsManager,
                    mobileOptimization: mockMobileOptimization,
                    accessibilityManager: mockAccessibilityManager,
                    config: mockConfig
                });
            }).toThrow('HealthCheckManager: errorBoundary required');
        });

        it('should throw if diagnosticsManager is missing', () => {
            expect(() => {
                new HealthCheckManager({
                    errorBoundary: mockErrorBoundary,
                    mobileOptimization: mockMobileOptimization,
                    accessibilityManager: mockAccessibilityManager,
                    config: mockConfig
                });
            }).toThrow('HealthCheckManager: diagnosticsManager required');
        });

        it('should throw if mobileOptimization is missing', () => {
            expect(() => {
                new HealthCheckManager({
                    errorBoundary: mockErrorBoundary,
                    diagnosticsManager: mockDiagnosticsManager,
                    accessibilityManager: mockAccessibilityManager,
                    config: mockConfig
                });
            }).toThrow('HealthCheckManager: mobileOptimization required');
        });

        it('should throw if accessibilityManager is missing', () => {
            expect(() => {
                new HealthCheckManager({
                    errorBoundary: mockErrorBoundary,
                    diagnosticsManager: mockDiagnosticsManager,
                    mobileOptimization: mockMobileOptimization,
                    config: mockConfig
                });
            }).toThrow('HealthCheckManager: accessibilityManager required');
        });

        it('should throw if config is missing', () => {
            expect(() => {
                new HealthCheckManager({
                    errorBoundary: mockErrorBoundary,
                    diagnosticsManager: mockDiagnosticsManager,
                    mobileOptimization: mockMobileOptimization,
                    accessibilityManager: mockAccessibilityManager
                });
            }).toThrow('HealthCheckManager: config required');
        });

        it('should allow optional systemStatusReporter', () => {
            healthCheckManager = new HealthCheckManager({
                errorBoundary: mockErrorBoundary,
                diagnosticsManager: mockDiagnosticsManager,
                mobileOptimization: mockMobileOptimization,
                accessibilityManager: mockAccessibilityManager,
                config: mockConfig
            });

            expect(healthCheckManager.systemStatusReporter).toBe(null);
        });

        it('should use self as chainTarget if not provided', () => {
            healthCheckManager = new HealthCheckManager({
                errorBoundary: mockErrorBoundary,
                diagnosticsManager: mockDiagnosticsManager,
                mobileOptimization: mockMobileOptimization,
                accessibilityManager: mockAccessibilityManager,
                config: mockConfig
            });

            expect(healthCheckManager._chainTarget).toBe(healthCheckManager);
        });

        it('should use provided chainTarget', () => {
            healthCheckManager = createManager();

            expect(healthCheckManager._chainTarget).toBe(mockChainTarget);
        });
    });

    describe('getSystemStatus()', () => {
        it('should delegate to systemStatusReporter.getSystemStatus()', () => {
            healthCheckManager = createManager();

            const status = healthCheckManager.getSystemStatus();

            expect(mockSystemStatusReporter.getSystemStatus).toHaveBeenCalled();
            expect(status).toEqual({
                renderer: { status: 'ok' },
                state: { emotion: 'neutral' },
                performance: { fps: 60 }
            });
        });

        it('should return empty object if systemStatusReporter is null', () => {
            healthCheckManager = new HealthCheckManager({
                errorBoundary: mockErrorBoundary,
                diagnosticsManager: mockDiagnosticsManager,
                mobileOptimization: mockMobileOptimization,
                accessibilityManager: mockAccessibilityManager,
                config: mockConfig
            });

            const status = healthCheckManager.getSystemStatus();

            expect(status).toEqual({});
        });
    });

    describe('setDebugMode()', () => {
        it('should enable debug mode', () => {
            healthCheckManager = createManager();

            healthCheckManager.setDebugMode(true);

            expect(mockConfig.showDebug).toBe(true);
            expect(mockConfig.showFPS).toBe(true);
        });

        it('should disable debug mode', () => {
            mockConfig.showDebug = true;
            mockConfig.showFPS = true;
            healthCheckManager = createManager();

            healthCheckManager.setDebugMode(false);

            expect(mockConfig.showDebug).toBe(false);
            expect(mockConfig.showFPS).toBe(false);
        });

        it('should coerce truthy values to boolean', () => {
            healthCheckManager = createManager();

            healthCheckManager.setDebugMode('yes');

            expect(mockConfig.showDebug).toBe(true);
            expect(mockConfig.showFPS).toBe(true);
        });

        it('should coerce falsy values to boolean', () => {
            healthCheckManager = createManager();

            healthCheckManager.setDebugMode(0);

            expect(mockConfig.showDebug).toBe(false);
            expect(mockConfig.showFPS).toBe(false);
        });

        it('should return chainTarget for method chaining', () => {
            healthCheckManager = createManager();

            const result = healthCheckManager.setDebugMode(true);

            expect(result).toBe(mockChainTarget);
        });
    });

    describe('triggerTestError()', () => {
        it('should wrap error with errorBoundary', () => {
            healthCheckManager = createManager();

            healthCheckManager.triggerTestError('test-context');

            expect(mockErrorBoundary.wrap).toHaveBeenCalledWith(
                expect.any(Function),
                'test-context',
                mockChainTarget
            );
        });

        it('should use default context if not provided', () => {
            healthCheckManager = createManager();

            healthCheckManager.triggerTestError();

            expect(mockErrorBoundary.wrap).toHaveBeenCalledWith(
                expect.any(Function),
                'manual-test',
                mockChainTarget
            );
        });

        it('should return chainTarget for method chaining', () => {
            healthCheckManager = createManager();

            const result = healthCheckManager.triggerTestError('test');

            expect(result).toBe(mockChainTarget);
        });

        it('should throw error with context message', () => {
            // Create error boundary that doesn't catch
            const throwingErrorBoundary = {
                wrap: vi.fn(fn => {
                    return () => fn();
                })
            };
            healthCheckManager = createManager({ errorBoundary: throwingErrorBoundary });

            expect(() => {
                healthCheckManager.triggerTestError('custom-context');
            }).toThrow('Test error triggered in context: custom-context');
        });
    });

    describe('getPerformanceMetrics()', () => {
        it('should delegate to diagnosticsManager.getPerformanceMetrics()', () => {
            healthCheckManager = createManager();

            const metrics = healthCheckManager.getPerformanceMetrics();

            expect(mockDiagnosticsManager.getPerformanceMetrics).toHaveBeenCalled();
            expect(metrics).toEqual({
                fps: 60,
                frameTime: 16.67,
                memoryUsage: 50
            });
        });
    });

    describe('getMobileStatus()', () => {
        it('should delegate to mobileOptimization.getStatus()', () => {
            healthCheckManager = createManager();

            const status = healthCheckManager.getMobileStatus();

            expect(mockMobileOptimization.getStatus).toHaveBeenCalled();
            expect(status).toEqual({
                isMobile: false,
                touchEnabled: true,
                devicePixelRatio: 2
            });
        });

        it('should return mobile status for mobile devices', () => {
            mockMobileOptimization.getStatus.mockReturnValue({
                isMobile: true,
                touchEnabled: true,
                devicePixelRatio: 3
            });
            healthCheckManager = createManager();

            const status = healthCheckManager.getMobileStatus();

            expect(status.isMobile).toBe(true);
        });
    });

    describe('getAccessibilityStatus()', () => {
        it('should delegate to accessibilityManager.getStatus()', () => {
            healthCheckManager = createManager();

            const status = healthCheckManager.getAccessibilityStatus();

            expect(mockAccessibilityManager.getStatus).toHaveBeenCalled();
            expect(status).toEqual({
                reducedMotion: false,
                highContrast: false,
                prefersColorScheme: 'light'
            });
        });

        it('should return accessibility preferences', () => {
            mockAccessibilityManager.getStatus.mockReturnValue({
                reducedMotion: true,
                highContrast: true,
                prefersColorScheme: 'dark'
            });
            healthCheckManager = createManager();

            const status = healthCheckManager.getAccessibilityStatus();

            expect(status.reducedMotion).toBe(true);
            expect(status.highContrast).toBe(true);
            expect(status.prefersColorScheme).toBe('dark');
        });
    });
});
