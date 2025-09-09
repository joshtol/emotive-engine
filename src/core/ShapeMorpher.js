/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Shape Morphing System
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Musical shape morphing system for core transformations
 * @author Emotive Engine Team
 * @module core/ShapeMorpher
 */

import { MusicalDuration } from './MusicalDuration.js';
import { rhythmEngine } from './rhythm.js';

/**
 * Shape definitions as normalized point arrays
 * All shapes use 64 points for smooth morphing
 */
const SHAPE_DEFINITIONS = {
    circle: generateCircle(64),
    heart: generateHeart(64),
    star: generateStar(64, 5), // 5-pointed star
    sun: generateSun(64, 12), // 12 rays
    moon: generateMoon(64),
    eclipse: generateEclipse(64),
    square: generateSquare(64),
    triangle: generateTriangle(64)
};

/**
 * Generate circle points
 */
function generateCircle(numPoints) {
    const points = [];
    for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        points.push({
            x: 0.5 + Math.cos(angle) * 0.5,
            y: 0.5 + Math.sin(angle) * 0.5
        });
    }
    return points;
}

/**
 * Generate heart shape points
 */
function generateHeart(numPoints) {
    const points = [];
    for (let i = 0; i < numPoints; i++) {
        const t = (i / numPoints) * Math.PI * 2;
        // Parametric heart equation
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        // Normalize to 0-1 range
        points.push({
            x: 0.5 + x / 40,
            y: 0.5 + y / 40
        });
    }
    return points;
}

/**
 * Generate star shape points
 */
function generateStar(numPoints, numSpikes = 5) {
    const points = [];
    const innerRadius = 0.2;
    const outerRadius = 0.5;
    
    for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const spikeIndex = (i / numPoints) * numSpikes * 2;
        const isOuter = Math.floor(spikeIndex) % 2 === 0;
        const radius = isOuter ? outerRadius : innerRadius;
        
        points.push({
            x: 0.5 + Math.cos(angle - Math.PI/2) * radius,
            y: 0.5 + Math.sin(angle - Math.PI/2) * radius
        });
    }
    return points;
}

/**
 * Generate sun shape with rays
 */
function generateSun(numPoints, numRays = 12) {
    const points = [];
    const innerRadius = 0.3;
    const outerRadius = 0.5;
    
    for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const rayIndex = (i / numPoints) * numRays;
        const rayProgress = rayIndex % 1;
        const inRay = rayProgress < 0.3; // 30% of each segment is a ray
        const radius = inRay ? 
            innerRadius + (outerRadius - innerRadius) * (1 - Math.abs(rayProgress - 0.15) / 0.15) :
            innerRadius;
        
        points.push({
            x: 0.5 + Math.cos(angle) * radius,
            y: 0.5 + Math.sin(angle) * radius
        });
    }
    return points;
}

/**
 * Generate crescent moon shape
 */
function generateMoon(numPoints) {
    const points = [];
    for (let i = 0; i < numPoints; i++) {
        const t = (i / numPoints) * Math.PI * 2;
        
        // Create crescent moon using two offset circles
        // Outer circle for the main moon body
        const outerX = Math.cos(t) * 0.45;
        const outerY = Math.sin(t) * 0.45;
        
        // Inner circle offset to create crescent
        const innerAngle = t - 0.3; // Slight offset
        const innerX = Math.cos(innerAngle) * 0.35 + 0.15; // Offset to the right
        const innerY = Math.sin(innerAngle) * 0.35;
        
        // Blend between outer and inner based on angle
        let x, y;
        if (t > 0.5 && t < Math.PI * 1.5) {
            // Use inner circle for the crescent cutout
            const blend = (Math.sin((t - 0.5) * 2) + 1) / 2;
            x = outerX * (1 - blend) + innerX * blend;
            y = outerY * (1 - blend) + innerY * blend;
        } else {
            // Use outer circle
            x = outerX;
            y = outerY;
        }
        
        points.push({
            x: 0.5 + x,
            y: 0.5 + y
        });
    }
    return points;
}

/**
 * Generate eclipse (overlapping circles)
 */
function generateEclipse(numPoints) {
    const points = [];
    for (let i = 0; i < numPoints; i++) {
        const t = (i / numPoints) * Math.PI * 2;
        
        // Two circles slightly offset to create eclipse effect
        const circle1X = Math.cos(t) * 0.45 - 0.05;
        const circle1Y = Math.sin(t) * 0.45;
        
        const circle2X = Math.cos(t) * 0.45 + 0.05;
        const circle2Y = Math.sin(t) * 0.45;
        
        // Create eclipse by combining the two circles
        let x, y;
        if (t > Math.PI * 0.25 && t < Math.PI * 0.75) {
            // Top portion - use circle2 (right circle)
            x = circle2X;
            y = circle2Y;
        } else if (t > Math.PI * 1.25 && t < Math.PI * 1.75) {
            // Bottom portion - use circle1 (left circle)
            x = circle1X;
            y = circle1Y;
        } else {
            // Blend for smooth transition
            const blend = Math.abs(Math.sin(t * 2));
            x = circle1X * (1 - blend) + circle2X * blend;
            y = circle1Y * (1 - blend) + circle2Y * blend;
        }
        
        points.push({
            x: 0.5 + x,
            y: 0.5 + y
        });
    }
    return points;
}

/**
 * Generate square shape
 */
function generateSquare(numPoints) {
    const points = [];
    const perSide = Math.floor(numPoints / 4);
    
    for (let i = 0; i < numPoints; i++) {
        const sideIndex = Math.floor(i / perSide);
        const sideProgress = (i % perSide) / perSide;
        
        let x, y;
        switch(sideIndex) {
            case 0: // Top
                x = sideProgress;
                y = 0;
                break;
            case 1: // Right
                x = 1;
                y = sideProgress;
                break;
            case 2: // Bottom
                x = 1 - sideProgress;
                y = 1;
                break;
            case 3: // Left
                x = 0;
                y = 1 - sideProgress;
                break;
        }
        
        points.push({ x, y });
    }
    return points;
}

/**
 * Generate triangle shape
 */
function generateTriangle(numPoints) {
    const points = [];
    const perSide = Math.floor(numPoints / 3);
    
    for (let i = 0; i < numPoints; i++) {
        const sideIndex = Math.floor(i / perSide);
        const sideProgress = (i % perSide) / perSide;
        
        let x, y;
        switch(sideIndex) {
            case 0: // Bottom
                x = sideProgress;
                y = 1;
                break;
            case 1: // Right side
                x = 1 - sideProgress * 0.5;
                y = 1 - sideProgress;
                break;
            case 2: // Left side
                x = 0.5 - sideProgress * 0.5;
                y = sideProgress;
                break;
        }
        
        points.push({ x, y });
    }
    return points;
}

/**
 * ShapeMorpher - Handles smooth shape transitions in musical time
 */
export class ShapeMorpher {
    constructor() {
        this.currentShape = 'circle';
        this.targetShape = null;
        this.morphProgress = 0;
        this.morphStartTime = null;
        this.morphDuration = null;
        this.morphMode = 'hybrid'; // 'core-only' or 'hybrid'
        this.currentPoints = [...SHAPE_DEFINITIONS.circle];
        this.vocalInstability = 0; // 0-1 for vocal deformation
        this.vocalFrequencies = new Array(32).fill(0); // Frequency bands for deformation
    }
    
    /**
     * Start morphing to a new shape
     * @param {string} targetShape - Name of target shape
     * @param {Object} config - Morph configuration
     */
    startMorph(targetShape, config = {}) {
        if (!SHAPE_DEFINITIONS[targetShape]) {
            console.warn(`Unknown shape: ${targetShape}`);
            return;
        }
        
        const {
            duration = 'bar', // Musical duration
            mode = 'hybrid',
            easing = 'ease-in-out',
            onBeat = true // Start on next beat boundary
        } = config;
        
        this.targetShape = targetShape;
        this.morphMode = mode;
        this.morphProgress = 0;
        
        // Convert musical duration to milliseconds
        const musicalDuration = new MusicalDuration();
        this.morphDuration = musicalDuration.toMilliseconds(duration);
        
        // Schedule on beat boundary if requested
        if (onBeat && rhythmEngine) {
            const msUntilNextBeat = rhythmEngine.getTimeToNextBeat();
            setTimeout(() => {
                this.morphStartTime = performance.now();
            }, msUntilNextBeat);
        } else {
            this.morphStartTime = performance.now();
        }
    }
    
    /**
     * Update morph progress
     * @returns {boolean} True if morphing is active
     */
    update() {
        if (!this.targetShape || !this.morphStartTime) {
            return false;
        }
        
        const elapsed = performance.now() - this.morphStartTime;
        this.morphProgress = Math.min(1, elapsed / this.morphDuration);
        
        // Apply easing
        const easedProgress = this.easeInOutCubic(this.morphProgress);
        
        // Interpolate between shapes
        const sourcePoints = SHAPE_DEFINITIONS[this.currentShape];
        const targetPoints = SHAPE_DEFINITIONS[this.targetShape];
        
        for (let i = 0; i < this.currentPoints.length; i++) {
            this.currentPoints[i].x = sourcePoints[i].x + (targetPoints[i].x - sourcePoints[i].x) * easedProgress;
            this.currentPoints[i].y = sourcePoints[i].y + (targetPoints[i].y - sourcePoints[i].y) * easedProgress;
        }
        
        // Apply vocal instability if present
        if (this.vocalInstability > 0) {
            this.applyVocalDeformation();
        }
        
        // Complete morph
        if (this.morphProgress >= 1) {
            this.currentShape = this.targetShape;
            this.targetShape = null;
            this.morphStartTime = null;
            return false;
        }
        
        return true;
    }
    
    /**
     * Apply vocal-based deformation to current shape
     */
    applyVocalDeformation() {
        const deformationStrength = this.vocalInstability * 0.1; // Max 10% deformation
        
        for (let i = 0; i < this.currentPoints.length; i++) {
            const point = this.currentPoints[i];
            const freqIndex = Math.floor((i / this.currentPoints.length) * this.vocalFrequencies.length);
            const frequencyStrength = this.vocalFrequencies[freqIndex];
            
            // Calculate deformation vector from center
            const dx = point.x - 0.5;
            const dy = point.y - 0.5;
            const angle = Math.atan2(dy, dx);
            const currentRadius = Math.sqrt(dx * dx + dy * dy);
            
            // Deform radius based on frequency strength
            const deformation = frequencyStrength * deformationStrength;
            const newRadius = currentRadius * (1 + deformation);
            
            // Apply deformation
            point.x = 0.5 + Math.cos(angle) * newRadius;
            point.y = 0.5 + Math.sin(angle) * newRadius;
        }
    }
    
    /**
     * Set vocal analysis data for deformation
     * @param {number} instability - Overall instability (0-1)
     * @param {Array} frequencies - Frequency band strengths
     */
    setVocalData(instability, frequencies) {
        this.vocalInstability = Math.max(0, Math.min(1, instability));
        if (frequencies && frequencies.length > 0) {
            // Resample to our 32 bands if needed
            const step = frequencies.length / 32;
            for (let i = 0; i < 32; i++) {
                const sourceIndex = Math.floor(i * step);
                this.vocalFrequencies[i] = frequencies[sourceIndex] || 0;
            }
        }
    }
    
    /**
     * Get current shape points in canvas coordinates
     * @param {number} centerX - Canvas center X
     * @param {number} centerY - Canvas center Y
     * @param {number} radius - Shape radius
     * @returns {Array} Points in canvas coordinates
     */
    getCanvasPoints(centerX, centerY, radius) {
        return this.currentPoints.map(point => ({
            x: centerX + (point.x - 0.5) * radius * 2,
            y: centerY + (point.y - 0.5) * radius * 2
        }));
    }
    
    /**
     * Check if point is inside current shape
     * @param {number} x - Normalized x (0-1)
     * @param {number} y - Normalized y (0-1)
     * @returns {boolean} True if inside shape
     */
    isPointInside(x, y) {
        // Use ray casting algorithm
        let inside = false;
        const points = this.currentPoints;
        
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
            const xi = points[i].x, yi = points[i].y;
            const xj = points[j].x, yj = points[j].y;
            
            const intersect = ((yi > y) !== (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            
            if (intersect) inside = !inside;
        }
        
        return inside;
    }
    
    /**
     * Cubic ease-in-out function
     */
    easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    /**
     * Get available shapes
     */
    static getAvailableShapes() {
        return Object.keys(SHAPE_DEFINITIONS);
    }
    
    /**
     * Reset to default circle shape
     */
    reset() {
        this.currentShape = 'circle';
        this.targetShape = null;
        this.morphProgress = 0;
        this.morphStartTime = null;
        this.currentPoints = [...SHAPE_DEFINITIONS.circle];
        this.vocalInstability = 0;
        this.vocalFrequencies.fill(0);
    }
}