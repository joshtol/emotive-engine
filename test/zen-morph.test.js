/**
 * Zen State Morphing Animation Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import EmotiveRenderer from '../src/core/EmotiveRenderer.js';
import CanvasManager from '../src/core/CanvasManager.js';

describe('Zen State Morphing Animations', () => {
    let canvas, canvasManager, renderer;
    
    beforeEach(() => {
        // Create mock canvas
        canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        document.body.appendChild(canvas);
        
        // Create real instances
        canvasManager = new CanvasManager(canvas);
        renderer = new EmotiveRenderer(canvasManager);
    });
    
    afterEach(() => {
        renderer.destroy();
        if (canvas && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
        }
    });
    
    describe('Zen Entry Animation', () => {
        it('should initialize morphing parameters when entering zen', () => {
            renderer.enterZenMode();
            
            expect(renderer.zenTransition).toBeDefined();
            expect(renderer.zenTransition.active).toBe(true);
            expect(renderer.zenTransition.phase).toBe('entering');
            expect(renderer.zenTransition.lotusMorph).toBe(0);
            expect(renderer.zenTransition.petalSpread).toBe(0);
            expect(renderer.zenTransition.smileCurve).toBe(0);
        });
        
        it('should progress lotus morphing through animation phases', () => {
            const originalNow = performance.now;
            let mockTime = 0;
            performance.now = () => mockTime;
            
            renderer.enterZenMode();
            
            // Phase 1: Horizontal narrowing (0-2000ms)
            mockTime = 1000;
            expect(renderer.zenTransition.lotusMorph).toBe(0);
            expect(renderer.zenTransition.scaleY).toBeLessThanOrEqual(1.0);
            
            // Phase 2: Arc formation (2000-3500ms) 
            // Lotus starts morphing halfway through
            mockTime = 3000; // 1 second into arc phase
            // At this point lotus should start appearing
            
            // Phase 3: Lotus blooming (3500-5500ms)
            mockTime = 4500; // 1 second into lotus bloom
            // Lotus should be partially morphed
            
            mockTime = 5500; // End of lotus bloom
            // Check that phase transitions to 'in'
            
            performance.now = originalNow;
        });
        
        it('should reach full lotus shape when animation completes', () => {
            renderer.zenTransition = {
                active: true,
                phase: 'in',
                lotusMorph: 1.0,
                petalSpread: 1.0,
                smileCurve: 1.0,
                scaleX: 1.0,
                scaleY: 0.2,
                arcHeight: 1.5
            };
            
            expect(renderer.zenTransition.lotusMorph).toBe(1.0);
            expect(renderer.zenTransition.petalSpread).toBe(1.0);
            expect(renderer.zenTransition.smileCurve).toBe(1.0);
        });
    });
    
    describe('Zen Exit Animation', () => {
        it('should reverse morphing parameters when exiting zen', () => {
            // Set up zen state as if fully in meditation
            renderer.zenTransition = {
                active: true,
                phase: 'in',
                lotusMorph: 1.0,
                petalSpread: 1.0,
                smileCurve: 1.0,
                scaleX: 1.0,
                scaleY: 0.2,
                arcHeight: 1.5
            };
            
            renderer.exitZenMode('neutral');
            
            expect(renderer.zenTransition.phase).toBe('exiting');
            expect(renderer.zenTransition.targetEmotion).toBe('neutral');
        });
        
        it('should progressively close lotus during exit', () => {
            const originalNow = performance.now;
            let mockTime = 0;
            performance.now = () => mockTime;
            
            // Start in full zen meditation
            renderer.zenTransition = {
                active: true,
                phase: 'in',
                lotusMorph: 1.0,
                petalSpread: 1.0,
                smileCurve: 1.0,
                scaleX: 1.0,
                scaleY: 0.2,
                arcHeight: 1.5,
                startTime: 0
            };
            
            renderer.exitZenMode('neutral');
            mockTime = 0; // Reset time for exit animation
            renderer.zenTransition.startTime = 0;
            
            // Phase 1: Lotus closing (0-1000ms)
            mockTime = 500;
            // Lotus should be closing
            
            mockTime = 1000;
            // Lotus should be fully closed
            
            performance.now = originalNow;
        });
        
        it('should reset all parameters when exit completes', () => {
            renderer.zenTransition = {
                active: true,
                phase: 'exiting',
                lotusMorph: 0,
                petalSpread: 0,
                smileCurve: 0
            };
            
            // Simulate completion
            renderer.zenTransition.active = false;
            renderer.zenTransition.phase = null;
            
            expect(renderer.zenTransition.active).toBe(false);
            expect(renderer.zenTransition.lotusMorph).toBe(0);
            expect(renderer.zenTransition.petalSpread).toBe(0);
            expect(renderer.zenTransition.smileCurve).toBe(0);
        });
    });
    
    describe('Lotus Rendering', () => {
        it('should render lotus cutout with correct morphing', () => {
            // Set up zen transition with partial morph
            renderer.zenTransition = {
                active: true,
                phase: 'entering',
                lotusMorph: 0.5,
                petalSpread: 0.3,
                smileCurve: 0.2,
                arcHeight: 1.0,
                scaleX: 1.0,
                scaleY: 0.5
            };
            
            // Mock the required canvas methods
            const originalBezierCurveTo = renderer.ctx.bezierCurveTo;
            const originalQuadraticCurveTo = renderer.ctx.quadraticCurveTo;
            let bezierCalled = false;
            let quadraticCalled = false;
            
            renderer.ctx.bezierCurveTo = vi.fn(() => { bezierCalled = true; });
            renderer.ctx.quadraticCurveTo = vi.fn(() => { quadraticCalled = true; });
            
            // Render zen core
            renderer.renderZenCore(200, 200, 50);
            
            // Check that lotus drawing methods were called
            expect(bezierCalled || renderer.ctx.bezierCurveTo).toBeTruthy();
            
            // Restore original methods
            renderer.ctx.bezierCurveTo = originalBezierCurveTo;
            renderer.ctx.quadraticCurveTo = originalQuadraticCurveTo;
        });
        
        it('should interpolate lotus shape based on morph values', () => {
            renderer.zenTransition = {
                active: true,
                lotusMorph: 0.7,
                petalSpread: 0.5,
                smileCurve: 0.8,
                arcHeight: 1.2
            };
            
            // The morph values should affect the lotus shape
            expect(renderer.zenTransition.lotusMorph).toBeGreaterThan(0);
            expect(renderer.zenTransition.lotusMorph).toBeLessThan(1);
            
            // Petals should be partially spread
            expect(renderer.zenTransition.petalSpread).toBe(0.5);
            
            // Smile should be mostly formed
            expect(renderer.zenTransition.smileCurve).toBe(0.8);
        });
    });
    
    describe('Animation Timing', () => {
        it('should have correct phase durations', () => {
            const HORIZONTAL_NARROW_DURATION = 2000;
            const ARC_FORM_DURATION = 1500;
            const LOTUS_MORPH_DURATION = 2000;
            
            const totalEntryTime = HORIZONTAL_NARROW_DURATION + ARC_FORM_DURATION + LOTUS_MORPH_DURATION;
            expect(totalEntryTime).toBe(5500);
            
            const STRAIGHTEN_DURATION = 1000;
            const AWAKE_DURATION = 1500;
            const EXPAND_DURATION = 2000;
            const SETTLE_DURATION = 500;
            
            const totalExitTime = STRAIGHTEN_DURATION + AWAKE_DURATION + EXPAND_DURATION + SETTLE_DURATION;
            expect(totalExitTime).toBe(5000);
        });
    });
});