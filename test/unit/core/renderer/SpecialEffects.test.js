/**
 * Tests for SpecialEffects - Special visual effects for EmotiveRenderer
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SpecialEffects } from '../../../../src/core/renderer/SpecialEffects.js';

describe('SpecialEffects', () => {
    let specialEffects;
    let mockRenderer;
    let mockCanvas;
    let mockCtx;
    let mockDocument;

    beforeEach(() => {
        // Create comprehensive mock canvas
        mockCanvas = {
            width: 800,
            height: 600,
            id: 'emotive-canvas',
            style: {
                animation: '',
                offsetHeight: 100
            },
            offsetHeight: 100
        };

        // Create comprehensive mock context
        mockCtx = {
            canvas: mockCanvas,
            save: vi.fn(),
            restore: vi.fn(),
            clearRect: vi.fn(),
            beginPath: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            stroke: vi.fn(),
            translate: vi.fn(),
            rotate: vi.fn(),
            scale: vi.fn(),
            fillRect: vi.fn(),
            strokeRect: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            closePath: vi.fn(),
            createRadialGradient: vi.fn(() => ({
                addColorStop: vi.fn()
            })),
            createLinearGradient: vi.fn(() => ({
                addColorStop: vi.fn()
            })),
            fillStyle: '',
            strokeStyle: '',
            globalAlpha: 1,
            lineWidth: 1,
            lineCap: 'butt',
            lineJoin: 'miter',
            shadowBlur: 0,
            shadowColor: '',
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            globalCompositeOperation: 'source-over',
            drawImage: vi.fn(),
            filter: 'none',
            fillText: vi.fn(),
            textAlign: '',
            textBaseline: '',
            font: ''
        };

        // Create mock renderer
        mockRenderer = {
            ctx: mockCtx,
            canvas: mockCanvas,
            canvasManager: {
                canvas: mockCanvas
            },
            state: {
                glowColor: '#4a90e2'
            },
            scaleValue: vi.fn(value => value),
            hexToRgba: vi.fn((hex, alpha) => `rgba(74, 144, 226, ${alpha})`)
        };

        // Mock document for chromatic aberration tests
        mockDocument = {
            getElementById: vi.fn(),
            querySelector: vi.fn(),
            head: {
                appendChild: vi.fn()
            },
            createElement: vi.fn(() => ({
                id: '',
                textContent: ''
            }))
        };
        global.document = mockDocument;

        specialEffects = new SpecialEffects(mockRenderer);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Constructor', () => {
        it('should create SpecialEffects instance', () => {
            expect(specialEffects).toBeDefined();
            expect(specialEffects).toBeInstanceOf(SpecialEffects);
        });

        it('should store renderer reference', () => {
            expect(specialEffects.renderer).toBe(mockRenderer);
        });

        it('should store context reference', () => {
            expect(specialEffects.ctx).toBe(mockCtx);
        });

        it('should store canvas reference from canvasManager', () => {
            expect(specialEffects.canvas).toBe(mockCanvas);
        });

        it('should fallback to renderer.canvas if canvasManager is undefined', () => {
            const rendererWithoutManager = {
                ctx: mockCtx,
                canvas: mockCanvas,
                scaleValue: vi.fn(v => v),
                hexToRgba: vi.fn()
            };
            const effects = new SpecialEffects(rendererWithoutManager);
            expect(effects.canvas).toBe(mockCanvas);
        });

        it('should initialize effect states to false', () => {
            expect(specialEffects.recordingActive).toBe(false);
            expect(specialEffects.sleepMode).toBe(false);
            expect(specialEffects.speakingActive).toBe(false);
            expect(specialEffects.zenModeActive).toBe(false);
        });

        it('should initialize empty effect arrays', () => {
            expect(specialEffects.speakingRings).toEqual([]);
            expect(specialEffects.sleepZ).toEqual([]);
            expect(specialEffects.sparkles).toEqual([]);
        });

        it('should initialize speaking ring parameters', () => {
            expect(specialEffects.ringSpawnTimer).toBe(0);
            expect(specialEffects.ringSpawnInterval).toBe(300);
            expect(specialEffects.maxRings).toBe(3);
        });

        it('should initialize chromatic aberration settings', () => {
            expect(specialEffects.chromaticAberration).toEqual({
                active: false,
                intensity: 0,
                targetIntensity: 0,
                fadeSpeed: 0.01,
                maxOffset: 30
            });
        });

        it('should bind helper method references', () => {
            expect(specialEffects.scaleValue).toBeDefined();
            expect(specialEffects.hexToRgba).toBeDefined();
        });
    });

    describe('Recording Effects', () => {
        describe('startRecording()', () => {
            it('should activate recording effect', () => {
                specialEffects.startRecording();
                expect(specialEffects.recordingActive).toBe(true);
            });
        });

        describe('stopRecording()', () => {
            it('should deactivate recording effect', () => {
                specialEffects.recordingActive = true;
                specialEffects.stopRecording();
                expect(specialEffects.recordingActive).toBe(false);
            });
        });

        describe('renderRecordingGlow()', () => {
            it('should render recording glow with gradient', () => {
                const mockGradient = {
                    addColorStop: vi.fn()
                };
                mockCtx.createRadialGradient.mockReturnValue(mockGradient);

                specialEffects.renderRecordingGlow(400, 300, 50, 0.8);

                expect(mockCtx.createRadialGradient).toHaveBeenCalledWith(400, 300, 0, 400, 300, 125);
                expect(mockGradient.addColorStop).toHaveBeenCalledTimes(3);
                expect(mockCtx.save).toHaveBeenCalled();
                expect(mockCtx.fillRect).toHaveBeenCalled();
                expect(mockCtx.restore).toHaveBeenCalled();
            });

            it('should set screen composite operation', () => {
                specialEffects.renderRecordingGlow(100, 100, 20, 1.0);
                expect(mockCtx.globalCompositeOperation).toBe('screen');
            });

            it('should scale intensity for gradient colors', () => {
                const mockGradient = {
                    addColorStop: vi.fn()
                };
                mockCtx.createRadialGradient.mockReturnValue(mockGradient);

                specialEffects.renderRecordingGlow(400, 300, 50, 0.5);

                // Check that intensity affects gradient stops
                const {calls} = mockGradient.addColorStop.mock;
                expect(calls[0][1]).toContain('0.15'); // 0.3 * 0.5
                expect(calls[1][1]).toContain('0.075'); // 0.15 * 0.5
            });
        });

        describe('renderRecordingIndicator()', () => {
            it('should render REC text', () => {
                specialEffects.renderRecordingIndicator(400, 300);

                expect(mockCtx.save).toHaveBeenCalled();
                expect(mockCtx.translate).toHaveBeenCalledWith(400, 300);
                expect(mockCtx.fillText).toHaveBeenCalledWith('REC', 0, 0);
                expect(mockCtx.restore).toHaveBeenCalled();
            });

            it('should apply shadow blur for glow effect', () => {
                specialEffects.renderRecordingIndicator(400, 300);

                expect(mockRenderer.scaleValue).toHaveBeenCalled();
                expect(mockCtx.shadowColor).toContain('rgba(255, 0, 0,');
            });

            it('should render text with inner highlight', () => {
                specialEffects.renderRecordingIndicator(400, 300);

                expect(mockCtx.fillText).toHaveBeenCalledTimes(2);
                const {calls} = mockCtx.fillText.mock;
                expect(calls[0][0]).toBe('REC');
                expect(calls[1][0]).toBe('REC');
            });
        });
    });

    describe('Sleep Effects', () => {
        describe('enterSleepMode()', () => {
            it('should activate sleep mode', () => {
                specialEffects.enterSleepMode();
                expect(specialEffects.sleepMode).toBe(true);
            });
        });

        describe('wakeUp()', () => {
            it('should deactivate sleep mode', () => {
                specialEffects.sleepMode = true;
                specialEffects.wakeUp();
                expect(specialEffects.sleepMode).toBe(false);
            });
        });

        describe('renderSleepIndicator()', () => {
            it('should spawn Z particles after timer threshold', () => {
                specialEffects.ringSpawnTimer = 1900;
                specialEffects.renderSleepIndicator(400, 300, 200);

                expect(specialEffects.sleepZ.length).toBe(1);
                expect(specialEffects.ringSpawnTimer).toBe(0);
            });

            it('should not spawn Z if max count reached', () => {
                // Create Z particles with all required properties
                specialEffects.sleepZ = [
                    { x: 0, y: 0, opacity: 1, speed: -0.025, drift: 10, lifetime: 0, rotation: 0, text: 'Z', weight: '900', size: 50 },
                    { x: 1, y: 0, opacity: 1, speed: -0.025, drift: 10, lifetime: 0, rotation: 0, text: 'Z', weight: '900', size: 50 },
                    { x: 2, y: 0, opacity: 1, speed: -0.025, drift: 10, lifetime: 0, rotation: 0, text: 'Z', weight: '900', size: 50 }
                ];
                specialEffects.ringSpawnTimer = 2100;
                const initialLength = specialEffects.sleepZ.length;
                specialEffects.renderSleepIndicator(400, 300, 200);

                // Should still have same or fewer (if any faded out) but not more
                expect(specialEffects.sleepZ.length).toBeLessThanOrEqual(initialLength);
            });

            it('should spawn Z with random properties', () => {
                specialEffects.ringSpawnTimer = 2100;
                specialEffects.renderSleepIndicator(400, 300, 200);

                const z = specialEffects.sleepZ[0];
                expect(z).toHaveProperty('x');
                expect(z).toHaveProperty('y');
                expect(z).toHaveProperty('size');
                expect(z).toHaveProperty('opacity');
                expect(z).toHaveProperty('speed');
                expect(z).toHaveProperty('drift');
                expect(z).toHaveProperty('rotation');
                expect(z).toHaveProperty('text');
                expect(z).toHaveProperty('weight');
            });

            it('should spawn uppercase or lowercase Z', () => {
                // Spawn multiple Z's to test randomness
                let hasUppercase = false;
                let hasLowercase = false;

                for (let i = 0; i < 20; i++) {
                    specialEffects.sleepZ = [];
                    specialEffects.ringSpawnTimer = 2100;
                    specialEffects.renderSleepIndicator(400, 300, 200);

                    if (specialEffects.sleepZ.length > 0) {
                        const {text} = specialEffects.sleepZ[0];
                        if (text === 'Z') hasUppercase = true;
                        if (text === 'z') hasLowercase = true;
                    }
                }

                // At least one of the two should be true with enough iterations
                expect(hasUppercase || hasLowercase).toBe(true);
            });

            it('should update Z position and rotation', () => {
                const initialZ = {
                    x: 400,
                    y: 300,
                    size: 50,
                    opacity: 1.0,
                    speed: -0.025,
                    drift: 10,
                    lifetime: 0,
                    rotation: 0,
                    text: 'Z',
                    weight: '900'
                };
                specialEffects.sleepZ = [initialZ];

                specialEffects.renderSleepIndicator(400, 300, 100);

                expect(initialZ.lifetime).toBe(100);
                expect(initialZ.y).toBeLessThan(300);
                expect(initialZ.rotation).toBeGreaterThan(0);
            });

            it('should fade out Z particles over time', () => {
                const z = {
                    x: 400,
                    y: 300,
                    size: 50,
                    opacity: 1.0,
                    speed: -0.025,
                    drift: 10,
                    lifetime: 3000,
                    rotation: 0,
                    text: 'Z',
                    weight: '900'
                };
                specialEffects.sleepZ = [z];

                specialEffects.renderSleepIndicator(400, 300, 100);

                expect(z.opacity).toBeLessThan(1.0);
            });

            it('should remove Z particles when opacity too low', () => {
                const z = {
                    x: 400,
                    y: 300,
                    size: 50,
                    opacity: 0,
                    speed: -0.025,
                    drift: 10,
                    lifetime: 5000,
                    rotation: 0,
                    text: 'Z',
                    weight: '900'
                };
                specialEffects.sleepZ = [z];

                specialEffects.renderSleepIndicator(400, 300, 100);

                expect(specialEffects.sleepZ.length).toBe(0);
            });
        });
    });

    describe('Speaking Effects', () => {
        describe('startSpeaking()', () => {
            it('should activate speaking effect', () => {
                specialEffects.startSpeaking();
                expect(specialEffects.speakingActive).toBe(true);
            });
        });

        describe('stopSpeaking()', () => {
            it('should deactivate speaking effect', () => {
                specialEffects.speakingActive = true;
                specialEffects.stopSpeaking();
                expect(specialEffects.speakingActive).toBe(false);
            });
        });

        describe('renderSpeakingRings()', () => {
            it('should spawn new ring after interval', () => {
                specialEffects.ringSpawnTimer = 350;
                specialEffects.renderSpeakingRings(400, 300, 50, 100);

                expect(specialEffects.speakingRings.length).toBe(1);
                expect(specialEffects.ringSpawnTimer).toBe(0);
            });

            it('should not spawn ring if max count reached', () => {
                specialEffects.speakingRings = [
                    { radius: 50, opacity: 0.8, speed: 0.15 },
                    { radius: 60, opacity: 0.7, speed: 0.15 },
                    { radius: 70, opacity: 0.6, speed: 0.15 }
                ];
                specialEffects.ringSpawnTimer = 400;
                const initialLength = specialEffects.speakingRings.length;
                specialEffects.renderSpeakingRings(400, 300, 50, 100);

                // Should still have same or fewer (if any faded out) but not more
                expect(specialEffects.speakingRings.length).toBeLessThanOrEqual(initialLength);
            });

            it('should initialize ring with correct properties', () => {
                specialEffects.ringSpawnTimer = 400;
                specialEffects.renderSpeakingRings(400, 300, 50, 100);

                const ring = specialEffects.speakingRings[0];
                // Ring has already been updated by deltaTime, so radius will be > 50
                expect(ring.radius).toBeGreaterThan(50);
                expect(ring.opacity).toBeLessThanOrEqual(0.8);
                expect(ring.speed).toBe(0.15);
            });

            it('should expand rings over time', () => {
                const initialRing = { radius: 50, opacity: 0.8, speed: 0.15 };
                specialEffects.speakingRings = [initialRing];

                specialEffects.renderSpeakingRings(400, 300, 50, 100);

                expect(initialRing.radius).toBeGreaterThan(50);
            });

            it('should fade ring opacity as radius increases', () => {
                const ring = { radius: 100, opacity: 0.8, speed: 0.15 };
                specialEffects.speakingRings = [ring];

                specialEffects.renderSpeakingRings(400, 300, 50, 1000);

                // Opacity should be recalculated based on distance from core
                expect(ring.opacity).toBeLessThan(0.8);
            });

            it('should remove rings when opacity too low', () => {
                const ring = { radius: 200, opacity: 0.001, speed: 0.15 };
                specialEffects.speakingRings = [ring];

                specialEffects.renderSpeakingRings(400, 300, 50, 100);

                expect(specialEffects.speakingRings.length).toBe(0);
            });

            it('should draw ring with arc', () => {
                const ring = { radius: 60, opacity: 0.5, speed: 0.15 };
                specialEffects.speakingRings = [ring];

                mockRenderer.hexToRgba.mockReturnValue('rgba(74, 144, 226, 0.5)');
                specialEffects.renderSpeakingRings(400, 300, 50, 100);

                expect(mockCtx.beginPath).toHaveBeenCalled();
                expect(mockCtx.arc).toHaveBeenCalled();
                expect(mockCtx.stroke).toHaveBeenCalled();
            });
        });
    });

    describe('Zen Mode Effects', () => {
        describe('renderZenCore()', () => {
            it('should render zen core with gradient', () => {
                const mockGradient = {
                    addColorStop: vi.fn()
                };
                mockCtx.createRadialGradient.mockReturnValue(mockGradient);

                specialEffects.renderZenCore(400, 300, 50, 1000);

                expect(mockCtx.createRadialGradient).toHaveBeenCalled();
                expect(mockGradient.addColorStop).toHaveBeenCalledTimes(3);
            });

            it('should apply breathing animation', () => {
                mockCtx.createRadialGradient.mockReturnValue({
                    addColorStop: vi.fn()
                });

                // Render with two different time values to verify breathing effect
                specialEffects.renderZenCore(400, 300, 50, 0);
                specialEffects.renderZenCore(400, 300, 50, 1571);

                // Verify that both renders were called
                expect(mockCtx.createRadialGradient).toHaveBeenCalledTimes(2);
                expect(mockCtx.arc).toHaveBeenCalledTimes(2);

                // The breathing effect modulates the radius over time
                // We just verify that the render happens correctly with different time values
                expect(mockCtx.fill).toHaveBeenCalledTimes(2);
            });

            it('should use screen composite operation', () => {
                mockCtx.createRadialGradient.mockReturnValue({
                    addColorStop: vi.fn()
                });

                specialEffects.renderZenCore(400, 300, 50, 1000);

                expect(mockCtx.globalCompositeOperation).toBe('screen');
            });

            it('should save and restore context', () => {
                mockCtx.createRadialGradient.mockReturnValue({
                    addColorStop: vi.fn()
                });

                specialEffects.renderZenCore(400, 300, 50, 1000);

                expect(mockCtx.save).toHaveBeenCalled();
                expect(mockCtx.restore).toHaveBeenCalled();
            });
        });
    });

    describe('Sparkle Effects', () => {
        describe('createSparkle()', () => {
            it('should create sparkle with default options', () => {
                specialEffects.createSparkle(100, 200);

                expect(specialEffects.sparkles.length).toBe(1);
                const sparkle = specialEffects.sparkles[0];
                expect(sparkle.x).toBe(100);
                expect(sparkle.y).toBe(200);
                expect(sparkle.vx).toBe(0);
                expect(sparkle.vy).toBe(0);
                expect(sparkle.size).toBe(3);
                expect(sparkle.color).toBe('hsl(50, 100%, 70%)');
                expect(sparkle.lifetime).toBe(1000);
            });

            it('should create sparkle with custom options', () => {
                specialEffects.createSparkle(100, 200, {
                    velocity: { x: 5, y: -3 },
                    size: 8,
                    color: 'hsl(200, 100%, 50%)',
                    lifetime: 2000
                });

                const sparkle = specialEffects.sparkles[0];
                expect(sparkle.vx).toBe(5);
                expect(sparkle.vy).toBe(-3);
                expect(sparkle.size).toBe(8);
                expect(sparkle.color).toBe('hsl(200, 100%, 50%)');
                expect(sparkle.lifetime).toBe(2000);
                expect(sparkle.maxLifetime).toBe(2000);
            });

            it('should initialize random rotation', () => {
                specialEffects.createSparkle(100, 200);
                const sparkle = specialEffects.sparkles[0];

                expect(sparkle.rotation).toBeGreaterThanOrEqual(0);
                expect(sparkle.rotation).toBeLessThan(Math.PI * 2);
            });

            it('should initialize rotation speed', () => {
                specialEffects.createSparkle(100, 200);
                const sparkle = specialEffects.sparkles[0];

                expect(sparkle.rotationSpeed).toBeDefined();
                expect(typeof sparkle.rotationSpeed).toBe('number');
            });

            it('should create multiple sparkles', () => {
                specialEffects.createSparkle(100, 200);
                specialEffects.createSparkle(150, 250);
                specialEffects.createSparkle(200, 300);

                expect(specialEffects.sparkles.length).toBe(3);
            });
        });

        describe('renderSparkles()', () => {
            it('should render all sparkles', () => {
                specialEffects.createSparkle(100, 200);
                specialEffects.createSparkle(150, 250);

                specialEffects.renderSparkles();

                expect(mockCtx.save).toHaveBeenCalledTimes(2);
                expect(mockCtx.restore).toHaveBeenCalledTimes(2);
            });

            it('should draw star shape for sparkle', () => {
                specialEffects.createSparkle(100, 200);
                specialEffects.renderSparkles();

                expect(mockCtx.beginPath).toHaveBeenCalled();
                expect(mockCtx.moveTo).toHaveBeenCalled();
                expect(mockCtx.lineTo).toHaveBeenCalled();
                expect(mockCtx.closePath).toHaveBeenCalled();
                expect(mockCtx.fill).toHaveBeenCalled();
            });

            it('should apply shadow blur for glow', () => {
                mockRenderer.scaleValue.mockReturnValue(10);
                specialEffects.createSparkle(100, 200);
                specialEffects.renderSparkles();

                expect(mockCtx.shadowBlur).toBe(10);
            });

            it('should rotate sparkle', () => {
                specialEffects.createSparkle(100, 200);
                specialEffects.renderSparkles();

                expect(mockCtx.translate).toHaveBeenCalledWith(100, 200);
                expect(mockCtx.rotate).toHaveBeenCalled();
            });
        });
    });

    describe('Chromatic Aberration Effects', () => {
        describe('triggerChromaticAberration()', () => {
            it('should activate chromatic aberration', () => {
                specialEffects.triggerChromaticAberration(0.5);

                expect(specialEffects.chromaticAberration.active).toBe(true);
            });

            it('should set intensity to target', () => {
                specialEffects.triggerChromaticAberration(0.7);

                expect(specialEffects.chromaticAberration.intensity).toBe(0.7);
                expect(specialEffects.chromaticAberration.targetIntensity).toBe(0.7);
            });

            it('should clamp intensity to max 1.0', () => {
                specialEffects.triggerChromaticAberration(1.5);

                expect(specialEffects.chromaticAberration.targetIntensity).toBe(1);
            });

            it('should use default intensity if not provided', () => {
                specialEffects.triggerChromaticAberration();

                expect(specialEffects.chromaticAberration.targetIntensity).toBe(0.8);
            });

            it('should find canvas element by ID', () => {
                const mockCanvasElement = {
                    style: { animation: '' },
                    offsetHeight: 100
                };
                mockDocument.getElementById.mockReturnValue(mockCanvasElement);

                specialEffects.triggerChromaticAberration(0.5);

                expect(mockDocument.getElementById).toHaveBeenCalledWith('emotive-canvas');
            });

            it('should fallback to querySelector if no ID found', () => {
                mockDocument.getElementById.mockReturnValue(null);
                const mockCanvasElement = {
                    style: { animation: '' },
                    offsetHeight: 100
                };
                mockDocument.querySelector.mockReturnValue(mockCanvasElement);

                specialEffects.triggerChromaticAberration(0.5);

                expect(mockDocument.querySelector).toHaveBeenCalledWith('canvas');
            });

            it('should reset animation before applying new one', () => {
                const mockCanvasElement = {
                    style: { animation: 'old-animation' },
                    offsetHeight: 100
                };
                mockDocument.getElementById.mockReturnValue(mockCanvasElement);

                specialEffects.triggerChromaticAberration(0.5);

                expect(mockCanvasElement.style.animation).not.toBe('old-animation');
            });

            it('should inject CSS styles if not present', () => {
                // First call for checking if styles exist, second for getting canvas
                mockDocument.getElementById
                    .mockReturnValueOnce(null) // No existing styles
                    .mockReturnValueOnce(null); // No canvas by ID

                // querySelector finds the canvas
                const mockCanvasElement = {
                    style: { animation: '' },
                    offsetHeight: 100
                };
                mockDocument.querySelector.mockReturnValue(mockCanvasElement);

                const mockStyleElement = {
                    id: '',
                    textContent: ''
                };
                mockDocument.createElement.mockReturnValue(mockStyleElement);

                specialEffects.triggerChromaticAberration(0.5);

                expect(mockDocument.createElement).toHaveBeenCalledWith('style');
                expect(mockDocument.head.appendChild).toHaveBeenCalled();
            });
        });

        describe('applyChromaticAberration()', () => {
            let sourceCanvas;

            beforeEach(() => {
                sourceCanvas = {
                    width: 800,
                    height: 600
                };
            });

            it('should not apply if not active', () => {
                specialEffects.chromaticAberration.active = false;
                specialEffects.applyChromaticAberration(mockCtx, sourceCanvas);

                expect(mockCtx.clearRect).not.toHaveBeenCalled();
            });

            it('should not apply if intensity is zero', () => {
                specialEffects.chromaticAberration.active = true;
                specialEffects.chromaticAberration.intensity = 0;
                specialEffects.applyChromaticAberration(mockCtx, sourceCanvas);

                expect(mockCtx.clearRect).not.toHaveBeenCalled();
            });

            it('should clear canvas before applying', () => {
                specialEffects.chromaticAberration.active = true;
                specialEffects.chromaticAberration.intensity = 0.5;
                specialEffects.applyChromaticAberration(mockCtx, sourceCanvas);

                expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
            });

            it('should draw three color channels', () => {
                specialEffects.chromaticAberration.active = true;
                specialEffects.chromaticAberration.intensity = 0.5;
                specialEffects.applyChromaticAberration(mockCtx, sourceCanvas);

                expect(mockCtx.drawImage).toHaveBeenCalledTimes(3);
            });

            it('should offset red and blue channels', () => {
                mockRenderer.scaleValue.mockReturnValue(15);
                specialEffects.chromaticAberration.active = true;
                specialEffects.chromaticAberration.intensity = 1.0;
                specialEffects.applyChromaticAberration(mockCtx, sourceCanvas);

                const {calls} = mockCtx.drawImage.mock;
                expect(calls[0][1]).toBe(-15); // Red shifted left
                expect(calls[1][1]).toBe(0);   // Green centered
                expect(calls[2][1]).toBe(15);  // Blue shifted right
            });

            it('should save and restore context', () => {
                specialEffects.chromaticAberration.active = true;
                specialEffects.chromaticAberration.intensity = 0.5;
                specialEffects.applyChromaticAberration(mockCtx, sourceCanvas);

                expect(mockCtx.save).toHaveBeenCalled();
                expect(mockCtx.restore).toHaveBeenCalled();
            });
        });

        describe('applyChromaticAberrationSimple()', () => {
            const drawFunction = vi.fn();

            beforeEach(() => {
                drawFunction.mockClear();
            });

            it('should call draw function normally if not active', () => {
                specialEffects.chromaticAberration.active = false;
                specialEffects.applyChromaticAberrationSimple(mockCtx, 400, 300, 50, drawFunction);

                expect(drawFunction).toHaveBeenCalledTimes(1);
                expect(mockCtx.save).not.toHaveBeenCalled();
            });

            it('should call draw function normally if intensity is zero', () => {
                specialEffects.chromaticAberration.active = true;
                specialEffects.chromaticAberration.intensity = 0;
                specialEffects.applyChromaticAberrationSimple(mockCtx, 400, 300, 50, drawFunction);

                expect(drawFunction).toHaveBeenCalledTimes(1);
            });

            it('should draw three channels when active', () => {
                specialEffects.chromaticAberration.active = true;
                specialEffects.chromaticAberration.intensity = 0.5;
                specialEffects.applyChromaticAberrationSimple(mockCtx, 400, 300, 50, drawFunction);

                expect(drawFunction).toHaveBeenCalledTimes(3);
            });

            it('should translate for each channel', () => {
                mockRenderer.scaleValue.mockReturnValue(15);
                specialEffects.chromaticAberration.active = true;
                specialEffects.chromaticAberration.intensity = 1.0;
                specialEffects.applyChromaticAberrationSimple(mockCtx, 400, 300, 50, drawFunction);

                expect(mockCtx.translate).toHaveBeenCalled();
            });

            it('should save and restore context', () => {
                specialEffects.chromaticAberration.active = true;
                specialEffects.chromaticAberration.intensity = 0.5;
                specialEffects.applyChromaticAberrationSimple(mockCtx, 400, 300, 50, drawFunction);

                expect(mockCtx.save).toHaveBeenCalled();
                expect(mockCtx.restore).toHaveBeenCalled();
            });
        });
    });

    describe('update()', () => {
        it('should update sparkle positions', () => {
            specialEffects.createSparkle(100, 200, {
                velocity: { x: 2, y: -3 }
            });

            const sparkle = specialEffects.sparkles[0];
            const initialX = sparkle.x;
            const initialY = sparkle.y;

            specialEffects.update(16);

            expect(sparkle.x).toBe(initialX + 2);
            expect(sparkle.y).toBe(initialY - 3);
        });

        it('should update sparkle rotation', () => {
            specialEffects.createSparkle(100, 200);
            const sparkle = specialEffects.sparkles[0];
            const initialRotation = sparkle.rotation;

            specialEffects.update(16);

            expect(sparkle.rotation).not.toBe(initialRotation);
        });

        it('should apply gravity to sparkles', () => {
            specialEffects.createSparkle(100, 200, {
                velocity: { x: 0, y: 0 }
            });

            const sparkle = specialEffects.sparkles[0];
            specialEffects.update(16);

            expect(sparkle.vy).toBeGreaterThan(0); // Gravity applied
        });

        it('should decrease sparkle lifetime', () => {
            specialEffects.createSparkle(100, 200, {
                lifetime: 1000
            });

            const sparkle = specialEffects.sparkles[0];
            specialEffects.update(100);

            expect(sparkle.lifetime).toBe(900);
        });

        it('should remove expired sparkles', () => {
            specialEffects.createSparkle(100, 200, {
                lifetime: 50
            });

            specialEffects.update(60);

            expect(specialEffects.sparkles.length).toBe(0);
        });

        it('should fade chromatic aberration intensity', () => {
            specialEffects.chromaticAberration.active = true;
            specialEffects.chromaticAberration.intensity = 0.5;

            specialEffects.update(16);

            expect(specialEffects.chromaticAberration.intensity).toBeLessThan(0.5);
        });

        it('should deactivate chromatic aberration when faded', () => {
            specialEffects.chromaticAberration.active = true;
            specialEffects.chromaticAberration.intensity = 0.005;

            specialEffects.update(16);

            expect(specialEffects.chromaticAberration.active).toBe(false);
            expect(specialEffects.chromaticAberration.intensity).toBe(0);
        });

        it('should handle multiple updates correctly', () => {
            specialEffects.createSparkle(100, 200, {
                velocity: { x: 1, y: 1 },
                lifetime: 1000
            });

            specialEffects.chromaticAberration.active = true;
            specialEffects.chromaticAberration.intensity = 0.5;

            specialEffects.update(16);
            specialEffects.update(16);
            specialEffects.update(16);

            expect(specialEffects.sparkles.length).toBe(1);
            expect(specialEffects.sparkles[0].lifetime).toBeLessThan(1000);
        });
    });

    describe('destroy()', () => {
        beforeEach(() => {
            // Set up non-empty state
            specialEffects.speakingRings = [{ radius: 50 }, { radius: 60 }];
            specialEffects.sleepZ = [{ x: 100 }, { x: 200 }];
            specialEffects.sparkles = [{ x: 150 }, { x: 250 }];
            specialEffects.recordingActive = true;
            specialEffects.sleepMode = true;
            specialEffects.speakingActive = true;
            specialEffects.zenModeActive = true;
            specialEffects.chromaticAberration.active = true;
            specialEffects.chromaticAberration.intensity = 0.8;
            specialEffects.chromaticAberration.targetIntensity = 0.8;
            specialEffects.ringSpawnTimer = 500;
        });

        it('should clear all effect arrays', () => {
            specialEffects.destroy();

            expect(specialEffects.speakingRings).toEqual([]);
            expect(specialEffects.sleepZ).toEqual([]);
            expect(specialEffects.sparkles).toEqual([]);
        });

        it('should reset all effect states', () => {
            specialEffects.destroy();

            expect(specialEffects.recordingActive).toBe(false);
            expect(specialEffects.sleepMode).toBe(false);
            expect(specialEffects.speakingActive).toBe(false);
            expect(specialEffects.zenModeActive).toBe(false);
        });

        it('should reset chromatic aberration', () => {
            specialEffects.destroy();

            expect(specialEffects.chromaticAberration.active).toBe(false);
            expect(specialEffects.chromaticAberration.intensity).toBe(0);
            expect(specialEffects.chromaticAberration.targetIntensity).toBe(0);
        });

        it('should clear timers', () => {
            specialEffects.destroy();

            expect(specialEffects.ringSpawnTimer).toBe(0);
        });

        it('should clear renderer references', () => {
            specialEffects.destroy();

            expect(specialEffects.renderer).toBeNull();
            expect(specialEffects.ctx).toBeNull();
            expect(specialEffects.canvas).toBeNull();
        });

        it('should be callable multiple times safely', () => {
            specialEffects.destroy();
            expect(() => specialEffects.destroy()).not.toThrow();
        });
    });

    describe('Edge Cases', () => {
        it('should handle zero deltaTime in renderSleepIndicator', () => {
            specialEffects.ringSpawnTimer = 2100;
            expect(() => {
                specialEffects.renderSleepIndicator(400, 300, 0);
            }).not.toThrow();
        });

        it('should handle zero deltaTime in renderSpeakingRings', () => {
            specialEffects.ringSpawnTimer = 400;
            expect(() => {
                specialEffects.renderSpeakingRings(400, 300, 50, 0);
            }).not.toThrow();
        });

        it('should handle negative radius in renderRecordingGlow', () => {
            expect(() => {
                specialEffects.renderRecordingGlow(400, 300, -10, 1.0);
            }).not.toThrow();
        });

        it('should handle very large intensity values', () => {
            expect(() => {
                specialEffects.renderRecordingGlow(400, 300, 50, 1000);
            }).not.toThrow();
        });

        it('should handle null color in renderer state', () => {
            mockRenderer.state.glowColor = null;
            mockRenderer.hexToRgba.mockReturnValue('rgba(0, 0, 0, 0.5)');

            expect(() => {
                specialEffects.ringSpawnTimer = 400;
                specialEffects.renderSpeakingRings(400, 300, 50, 100);
            }).not.toThrow();
        });

        it('should handle very large deltaTime in update', () => {
            specialEffects.createSparkle(100, 200, { lifetime: 1000 });

            specialEffects.update(999999);

            expect(specialEffects.sparkles.length).toBe(0);
        });

        it('should handle sparkle with very short lifetime', () => {
            specialEffects.createSparkle(100, 200, { lifetime: 10 });

            // Update will decrement lifetime, and filter removes sparkles with lifetime <= 0
            // After update(10), lifetime becomes 0, which is NOT > 0, so filtered out
            specialEffects.update(10);

            expect(specialEffects.sparkles.length).toBe(0);
        });

        it('should handle missing document in chromatic aberration', () => {
            global.document = undefined;

            expect(() => {
                specialEffects.triggerChromaticAberration(0.5);
            }).toThrow();

            global.document = mockDocument;
        });

        it('should handle scaleValue returning zero', () => {
            mockRenderer.scaleValue.mockReturnValue(0);

            expect(() => {
                specialEffects.renderRecordingGlow(400, 300, 50, 1.0);
            }).not.toThrow();
        });

        it('should handle hexToRgba returning invalid string', () => {
            mockRenderer.hexToRgba.mockReturnValue('invalid');

            expect(() => {
                specialEffects.ringSpawnTimer = 400;
                specialEffects.renderSpeakingRings(400, 300, 50, 100);
            }).not.toThrow();
        });
    });
});
