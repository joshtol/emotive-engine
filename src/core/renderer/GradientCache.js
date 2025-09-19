/**
 * Gradient Cache System
 * Caches canvas gradients to avoid recreating them every frame
 *
 * @module core/renderer/GradientCache
 * @version 1.0.0
 */

/**
 * Cache for canvas gradients to improve rendering performance
 */
export class GradientCache {
    constructor() {
        // Cache storage with Map for efficient lookups
        this.cache = new Map();

        // Stats for monitoring
        this.stats = {
            hits: 0,
            misses: 0,
            evictions: 0
        };

        // Cache configuration
        this.maxSize = 100; // Maximum number of cached gradients
        this.ttl = 60000; // Time to live in milliseconds (1 minute)

        // LRU tracking
        this.accessOrder = [];
    }

    /**
     * Generate a unique key for gradient parameters
     * @private
     */
    generateKey(type, params) {
        if (type === 'radial') {
            const { x0, y0, r0, x1, y1, r1, stops } = params;
            const stopKey = stops.map(s => `${s.offset}:${s.color}`).join('|');
            return `radial:${x0},${y0},${r0},${x1},${y1},${r1}:${stopKey}`;
        } else if (type === 'linear') {
            const { x0, y0, x1, y1, stops } = params;
            const stopKey = stops.map(s => `${s.offset}:${s.color}`).join('|');
            return `linear:${x0},${y0},${x1},${y1}:${stopKey}`;
        }
        return null;
    }

    /**
     * Get or create a radial gradient
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x0 - Start circle center x
     * @param {number} y0 - Start circle center y
     * @param {number} r0 - Start circle radius
     * @param {number} x1 - End circle center x
     * @param {number} y1 - End circle center y
     * @param {number} r1 - End circle radius
     * @param {Array} stops - Color stops [{offset, color}]
     * @returns {CanvasGradient} Cached or new gradient
     */
    getRadialGradient(ctx, x0, y0, r0, x1, y1, r1, stops) {
        const key = this.generateKey('radial', { x0, y0, r0, x1, y1, r1, stops });

        // Check cache
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.ttl) {
            this.stats.hits++;
            this.updateAccessOrder(key);
            return cached.gradient;
        }

        // Create new gradient
        this.stats.misses++;
        const gradient = ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);

        // Add color stops
        stops.forEach(stop => {
            gradient.addColorStop(stop.offset, stop.color);
        });

        // Cache it
        this.set(key, gradient);

        return gradient;
    }

    /**
     * Get or create a linear gradient
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x0 - Start point x
     * @param {number} y0 - Start point y
     * @param {number} x1 - End point x
     * @param {number} y1 - End point y
     * @param {Array} stops - Color stops [{offset, color}]
     * @returns {CanvasGradient} Cached or new gradient
     */
    getLinearGradient(ctx, x0, y0, x1, y1, stops) {
        const key = this.generateKey('linear', { x0, y0, x1, y1, stops });

        // Check cache
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.ttl) {
            this.stats.hits++;
            this.updateAccessOrder(key);
            return cached.gradient;
        }

        // Create new gradient
        this.stats.misses++;
        const gradient = ctx.createLinearGradient(x0, y0, x1, y1);

        // Add color stops
        stops.forEach(stop => {
            gradient.addColorStop(stop.offset, stop.color);
        });

        // Cache it
        this.set(key, gradient);

        return gradient;
    }

    /**
     * Store gradient in cache with LRU eviction
     * @private
     */
    set(key, gradient) {
        // Check if we need to evict
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            this.evictLRU();
        }

        // Store with timestamp
        this.cache.set(key, {
            gradient,
            timestamp: Date.now()
        });

        this.updateAccessOrder(key);
    }

    /**
     * Update access order for LRU tracking
     * @private
     */
    updateAccessOrder(key) {
        // Remove from current position
        const index = this.accessOrder.indexOf(key);
        if (index > -1) {
            this.accessOrder.splice(index, 1);
        }
        // Add to end (most recently used)
        this.accessOrder.push(key);
    }

    /**
     * Evict least recently used item
     * @private
     */
    evictLRU() {
        if (this.accessOrder.length > 0) {
            const keyToEvict = this.accessOrder.shift();
            this.cache.delete(keyToEvict);
            this.stats.evictions++;
        }
    }

    /**
     * Clear all cached gradients
     */
    clear() {
        this.cache.clear();
        this.accessOrder = [];
    }

    /**
     * Clear expired entries
     */
    clearExpired() {
        const now = Date.now();
        const keysToDelete = [];

        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp >= this.ttl) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => {
            this.cache.delete(key);
            const index = this.accessOrder.indexOf(key);
            if (index > -1) {
                this.accessOrder.splice(index, 1);
            }
        });
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache stats
     */
    getStats() {
        const hitRate = this.stats.hits + this.stats.misses > 0
            ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
            : 0;

        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hits: this.stats.hits,
            misses: this.stats.misses,
            evictions: this.stats.evictions,
            hitRate: `${hitRate}%`
        };
    }

    /**
     * Create a gradient helper that automatically caches
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @returns {Object} Helper object with gradient methods
     */
    createHelper(ctx) {
        return {
            radial: (x0, y0, r0, x1, y1, r1, stops) =>
                this.getRadialGradient(ctx, x0, y0, r0, x1, y1, r1, stops),
            linear: (x0, y0, x1, y1, stops) =>
                this.getLinearGradient(ctx, x0, y0, x1, y1, stops)
        };
    }
}

// Create singleton instance
export const gradientCache = new GradientCache();

// Export for convenience
export default gradientCache;