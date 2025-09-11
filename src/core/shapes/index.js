/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Shape System Registry
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Central registry for all shape modules
 * @author Emotive Engine Team
 * @module shapes
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Manages the modular shape system, providing dynamic loading and registration      
 * ║ of shape definitions, shadows, and special effects. Each shape is a self-contained
 * ║ module with its own generation, effects, and rendering logic.                     
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Shape registry - stores all loaded shape modules
 */
const shapeRegistry = new Map();

/**
 * Effect renderers registry - special rendering functions
 */
const effectRenderers = new Map();

/**
 * Shape categories for organization
 */
export const SHAPE_CATEGORIES = {
    ASTRONOMICAL: 'astronomical',
    GEOMETRIC: 'geometric',
    ORGANIC: 'organic'
};

/**
 * Register a shape module
 * @param {string} name - Shape name
 * @param {Object} shapeModule - Shape module with generate, shadow, and optional render
 */
export function registerShape(name, shapeModule) {
    if (!shapeModule.generate || typeof shapeModule.generate !== 'function') {
        throw new Error(`Shape module ${name} must have a generate function`);
    }
    
    shapeRegistry.set(name, shapeModule);
    
    // Register custom renderer if provided
    if (shapeModule.render && typeof shapeModule.render === 'function') {
        effectRenderers.set(name, shapeModule.render);
    }
    
    console.log(`Shape registered: ${name}`, shapeModule.category || 'uncategorized');
}

/**
 * Get a shape module
 * @param {string} name - Shape name
 * @returns {Object} Shape module
 */
export function getShape(name) {
    return shapeRegistry.get(name);
}

/**
 * Get shape points
 * @param {string} name - Shape name
 * @param {number} numPoints - Number of points to generate
 * @returns {Array} Array of normalized points
 */
export function generateShape(name, numPoints = 64) {
    const shape = shapeRegistry.get(name);
    if (!shape) {
        console.warn(`Shape ${name} not found, using circle`);
        return generateCirclePoints(numPoints);
    }
    
    return shape.generate(numPoints);
}

/**
 * Get shadow configuration for a shape
 * @param {string} name - Shape name
 * @returns {Object} Shadow configuration
 */
export function getShapeShadow(name) {
    const shape = shapeRegistry.get(name);
    if (!shape) {
        return { type: 'none' };
    }
    
    return shape.shadow || { type: 'none' };
}

/**
 * Get custom renderer for a shape
 * @param {string} name - Shape name
 * @returns {Function|null} Custom render function
 */
export function getShapeRenderer(name) {
    return effectRenderers.get(name) || null;
}

/**
 * Get all registered shapes
 * @returns {Array} Array of shape names
 */
export function getAllShapes() {
    return Array.from(shapeRegistry.keys());
}

/**
 * Get shapes by category
 * @param {string} category - Category name
 * @returns {Array} Array of shape names in category
 */
export function getShapesByCategory(category) {
    const shapes = [];
    for (const [name, module] of shapeRegistry.entries()) {
        if (module.category === category) {
            shapes.push(name);
        }
    }
    return shapes;
}

/**
 * Default circle generation (fallback)
 */
function generateCirclePoints(numPoints) {
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
 * Load all shape modules
 * This is called during initialization
 */
export async function loadShapes() {
    try {
        // Load astronomical shapes
        const sun = await import('./astronomical/sun.js');
        const moon = await import('./astronomical/moon.js');
        const lunar = await import('./astronomical/lunar.js');
        
        registerShape('sun', sun.default);
        registerShape('moon', moon.default);
        registerShape('lunar', lunar.default);
        
        // Load geometric shapes
        const circle = await import('./geometric/circle.js');
        const square = await import('./geometric/square.js');
        const triangle = await import('./geometric/triangle.js');
        const star = await import('./geometric/star.js');
        
        registerShape('circle', circle.default);
        registerShape('square', square.default);
        registerShape('triangle', triangle.default);
        registerShape('star', star.default);
        
        // Load organic shapes
        const heart = await import('./organic/heart.js');
        const suspicion = await import('./organic/suspicion.js');
        
        registerShape('heart', heart.default);
        registerShape('suspicion', suspicion.default);
        
        console.log('All shapes loaded successfully');
        return true;
    } catch (error) {
        console.error('Error loading shapes:', error);
        return false;
    }
}

/**
 * Shape transition utilities
 */
export const ShapeTransitions = {
    /**
     * Check if transition needs special handling
     * @param {string} from - Source shape
     * @param {string} to - Target shape
     * @returns {Object} Transition configuration
     */
    getTransitionConfig(from, to) {
        const fromShape = getShape(from);
        const toShape = getShape(to);
        
        // Special eclipse transitions
        if (fromShape?.shadow?.type === 'none' && 
            (toShape?.shadow?.type === 'lunar' || toShape?.shadow?.type === 'solar')) {
            return {
                type: 'eclipse_enter',
                direction: toShape.shadow.type === 'lunar' ? 'left' : 'right'
            };
        }
        
        if ((fromShape?.shadow?.type === 'lunar' || fromShape?.shadow?.type === 'solar') &&
            toShape?.shadow?.type === 'none') {
            return {
                type: 'eclipse_exit',
                direction: fromShape.shadow.type === 'lunar' ? 'right' : 'left'
            };
        }
        
        // Sun transitions need effect fading
        if (from === 'sun' && to !== 'sun') {
            return {
                type: 'sun_fade',
                fadeEffects: true
            };
        }
        
        return {
            type: 'standard'
        };
    }
};

export default {
    registerShape,
    getShape,
    generateShape,
    getShapeShadow,
    getShapeRenderer,
    getAllShapes,
    getShapesByCategory,
    loadShapes,
    ShapeTransitions,
    SHAPE_CATEGORIES
};