/**
 * ArrayPool - Reusable array pool to reduce garbage collection
 * @module ArrayPool
 */

class ArrayPool {
    constructor() {
        this.pools = new Map(); // Key: size, Value: array of available arrays
        this.inUse = new Set(); // Track arrays currently in use
    }

    /**
     * Get an array from the pool or create a new one
     * @param {number} size - Size of array needed
     * @param {string} type - Type of array ('float32', 'array', 'uint8')
     * @returns {Array|Float32Array|Uint8Array}
     */
    acquire(size, type = 'array') {
        const key = `${type}_${size}`;

        if (!this.pools.has(key)) {
            this.pools.set(key, []);
        }

        const pool = this.pools.get(key);

        // Try to get from pool
        if (pool.length > 0) {
            const array = pool.pop();
            this.inUse.add(array);
            return array;
        }

        // Create new array if pool is empty
        let newArray;
        switch (type) {
            case 'float32':
                newArray = new Float32Array(size);
                break;
            case 'uint8':
                newArray = new Uint8Array(size);
                break;
            default:
                newArray = new Array(size).fill(0);
        }

        this.inUse.add(newArray);
        return newArray;
    }

    /**
     * Return an array to the pool
     * @param {Array|Float32Array|Uint8Array} array - Array to return
     */
    release(array) {
        if (!this.inUse.has(array)) {
            return; // Not from this pool
        }

        this.inUse.delete(array);

        // Determine type and size
        let type = 'array';
        if (array instanceof Float32Array) type = 'float32';
        else if (array instanceof Uint8Array) type = 'uint8';

        const size = array.length;
        const key = `${type}_${size}`;

        // Clear the array
        if (type === 'array') {
            array.fill(0);
        } else {
            array.fill(0);
        }

        // Return to pool
        if (!this.pools.has(key)) {
            this.pools.set(key, []);
        }

        const pool = this.pools.get(key);
        if (pool.length < 10) {
            // Keep max 10 arrays of each size
            pool.push(array);
        }
    }

    /**
     * Clear all pools
     */
    clear() {
        this.pools.clear();
        this.inUse.clear();
    }
}

// Create singleton instance
const arrayPool = new ArrayPool();

export default arrayPool;
