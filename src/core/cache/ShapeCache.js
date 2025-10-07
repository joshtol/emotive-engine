/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Shape Cache System
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Pre-cached shape system for instant shape morphing
 * @author Emotive Engine Team
 * @module cache/ShapeCache
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Pre-caches all shape definitions, morph transitions, and properties for instant
 * ║ access. Eliminates the need to calculate shape data on-demand, improving morphing
 * ║ performance from ~2-5ms to <0.5ms.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

// Import shape functions directly to avoid circular dependency
import { SHAPE_DEFINITIONS } from '../shapes/shapeDefinitions.js';

/**
 * ShapeCache - Pre-caches all shape configurations for instant access
 */
export class ShapeCache {
    constructor() {
        // Cache storage
        this.shapeCache = new Map();
        this.morphCache = new Map();
        this.propertyCache = new Map();
        
        // Performance tracking
        this.stats = {
            hits: 0,
            misses: 0,
            loadTime: 0,
            cacheSize: 0
        };
        
        // Cache configuration
        this.isInitialized = false;
        this.loadStartTime = 0;
        
        // Initialize cache
        this.initialize();
    }
    
    /**
     * Initialize the shape cache by pre-loading all shapes
     */
    initialize() {
        this.loadStartTime = performance.now();
        
        try {
            // Get all available shapes
            const shapes = Object.keys(SHAPE_DEFINITIONS);
            
            // Pre-cache each shape
            shapes.forEach(shapeName => {
                this.cacheShape(shapeName);
            });
            
            // Pre-cache common morph transitions
            this.cacheCommonMorphs(shapes);
            
            this.isInitialized = true;
            this.stats.loadTime = performance.now() - this.loadStartTime;
            this.stats.cacheSize = this.shapeCache.size;
            
            console.warn(`[ShapeCache] Initialized with ${this.shapeCache.size} shapes in ${this.stats.loadTime.toFixed(2)}ms`);
            
        } catch (error) {
            console.error('[ShapeCache] Initialization failed:', error);
            this.isInitialized = false;
        }
    }
    
    /**
     * Cache a single shape and its related data
     * @param {string} shapeName - Name of the shape to cache
     */
    cacheShape(shapeName) {
        try {
            // Cache main shape definition
            const shapeDef = SHAPE_DEFINITIONS[shapeName];
            if (shapeDef) {
                this.shapeCache.set(shapeName, shapeDef);
                
                // Cache shape properties
                const properties = {
                    pointCount: shapeDef.points?.length || 64,
                    hasShadow: shapeDef.shadow?.type !== 'none',
                    shadowType: shapeDef.shadow?.type || 'none',
                    isRadial: this.isRadialShape(shapeName),
                    bounds: this.calculateBounds(shapeDef.points)
                };
                this.propertyCache.set(shapeName, properties);
            }
            
        } catch (error) {
            console.warn(`[ShapeCache] Failed to cache shape '${shapeName}':`, error);
        }
    }
    
    /**
     * Cache common morph transitions
     * @param {Array<string>} shapes - List of available shapes
     */
    cacheCommonMorphs(shapes) {
        // Common morph pairs that are frequently used
        const commonPairs = [
            ['circle', 'heart'],
            ['circle', 'star'],
            ['circle', 'square'],
            ['heart', 'star'],
            ['star', 'circle'],
            ['square', 'circle'],
            ['triangle', 'circle'],
            ['moon', 'sun'],
            ['lunar', 'eclipse']
        ];
        
        commonPairs.forEach(([from, to]) => {
            if (shapes.includes(from) && shapes.includes(to)) {
                try {
                    const morphData = this.calculateMorphSteps(from, to);
                    const key = `${from}->${to}`;
                    this.morphCache.set(key, morphData);
                } catch (error) {
                    console.warn(`[ShapeCache] Failed to cache morph '${from}->${to}':`, error);
                }
            }
        });
    }
    
    /**
     * Calculate morph steps between two shapes
     * @param {string} fromShape - Source shape
     * @param {string} toShape - Target shape
     * @returns {Object} Morph data with intermediate steps
     */
    calculateMorphSteps(fromShape, toShape) {
        const fromDef = this.shapeCache.get(fromShape);
        const toDef = this.shapeCache.get(toShape);
        
        if (!fromDef || !toDef) {
            return null;
        }
        
        const steps = [];
        const stepCount = 5; // 0%, 25%, 50%, 75%, 100%
        
        for (let i = 0; i < stepCount; i++) {
            const progress = i / (stepCount - 1);
            const interpolatedPoints = this.interpolateShapePoints(
                fromDef.points,
                toDef.points,
                progress
            );
            
            steps.push({
                progress,
                points: interpolatedPoints
            });
        }
        
        return {
            from: fromShape,
            to: toShape,
            steps,
            isRadial: this.isRadialShape(fromShape) || this.isRadialShape(toShape)
        };
    }
    
    /**
     * Interpolate between two shape point arrays
     * @param {Array} fromPoints - Source points
     * @param {Array} toPoints - Target points
     * @param {number} progress - Interpolation progress (0-1)
     * @returns {Array} Interpolated points
     */
    interpolateShapePoints(fromPoints, toPoints, progress) {
        if (!fromPoints || !toPoints) {
            return fromPoints || toPoints || [];
        }
        
        const maxPoints = Math.max(fromPoints.length, toPoints.length);
        const interpolated = [];
        
        for (let i = 0; i < maxPoints; i++) {
            const fromPoint = fromPoints[i] || fromPoints[0] || { x: 0.5, y: 0.5 };
            const toPoint = toPoints[i] || toPoints[0] || { x: 0.5, y: 0.5 };
            
            interpolated.push({
                x: fromPoint.x + (toPoint.x - fromPoint.x) * progress,
                y: fromPoint.y + (toPoint.y - fromPoint.y) * progress
            });
        }
        
        return interpolated;
    }
    
    /**
     * Check if a shape is radial (expands from center)
     * @param {string} shapeName - Name of the shape
     * @returns {boolean} True if shape is radial
     */
    isRadialShape(shapeName) {
        const radialShapes = ['circle', 'star', 'square', 'triangle', 'sun', 'moon'];
        return radialShapes.includes(shapeName);
    }
    
    /**
     * Calculate shape bounds
     * @param {Array} points - Shape points
     * @returns {Object} Bounds object
     */
    calculateBounds(points) {
        if (!points || points.length === 0) {
            return { minX: 0, minY: 0, maxX: 1, maxY: 1, width: 1, height: 1 };
        }
        
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        
        points.forEach(point => {
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
        });
        
        return {
            minX,
            minY,
            maxX,
            maxY,
            width: maxX - minX,
            height: maxY - minY
        };
    }
    
    /**
     * Get cached shape definition
     * @param {string} shapeName - Name of the shape
     * @returns {Object|null} Cached shape definition
     */
    getShape(shapeName) {
        if (!this.isInitialized) {
            console.warn('[ShapeCache] Cache not initialized, falling back to direct access');
            return SHAPE_DEFINITIONS[shapeName] || null;
        }
        
        const cached = this.shapeCache.get(shapeName);
        if (cached) {
            this.stats.hits++;
            return cached;
        }
        
        this.stats.misses++;
        console.warn(`[ShapeCache] Cache miss for shape '${shapeName}', consider adding to pre-cache`);
        return SHAPE_DEFINITIONS[shapeName] || null;
    }
    
    /**
     * Get cached shape properties
     * @param {string} shapeName - Name of the shape
     * @returns {Object} Cached shape properties
     */
    getProperties(shapeName) {
        if (!this.isInitialized) {
            const shapeDef = SHAPE_DEFINITIONS[shapeName];
            return shapeDef ? {
                pointCount: shapeDef.points?.length || 64,
                hasShadow: shapeDef.shadow?.type !== 'none',
                shadowType: shapeDef.shadow?.type || 'none',
                isRadial: this.isRadialShape(shapeName),
                bounds: this.calculateBounds(shapeDef.points)
            } : {};
        }
        
        const cached = this.propertyCache.get(shapeName);
        if (cached) {
            this.stats.hits++;
            return cached;
        }
        
        this.stats.misses++;
        return {};
    }
    
    /**
     * Get cached morph data
     * @param {string} fromShape - Source shape
     * @param {string} toShape - Target shape
     * @returns {Object|null} Cached morph data
     */
    getMorph(fromShape, toShape) {
        if (!this.isInitialized) {
            return this.calculateMorphSteps(fromShape, toShape);
        }
        
        const key = `${fromShape}->${toShape}`;
        const cached = this.morphCache.get(key);
        if (cached) {
            this.stats.hits++;
            return cached;
        }
        
        this.stats.misses++;
        return this.calculateMorphSteps(fromShape, toShape);
    }
    
    /**
     * Check if shape is cached
     * @param {string} shapeName - Name of the shape
     * @returns {boolean} True if cached
     */
    hasShape(shapeName) {
        return this.shapeCache.has(shapeName);
    }
    
    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getStats() {
        const total = this.stats.hits + this.stats.misses;
        return {
            ...this.stats,
            hitRate: total > 0 ? `${(this.stats.hits / total * 100).toFixed(1)}%` : '0%',
            shapes: this.shapeCache.size,
            morphs: this.morphCache.size,
            properties: this.propertyCache.size
        };
    }
    
    /**
     * Clear all caches
     */
    clear() {
        this.shapeCache.clear();
        this.morphCache.clear();
        this.propertyCache.clear();
        this.stats = { hits: 0, misses: 0, loadTime: 0, cacheSize: 0 };
        this.isInitialized = false;
    }
}

// Create singleton instance
export const shapeCache = new ShapeCache();

// Export for convenience
export default shapeCache;
