/**
 * Context State Manager
 * Minimizes context save/restore operations and tracks state changes
 *
 * @module core/renderer/ContextStateManager
 * @version 1.0.0
 */

/**
 * Manages canvas context state to minimize redundant operations
 */
export class ContextStateManager {
    constructor(ctx) {
        this.ctx = ctx;

        // Current state tracking
        this.currentState = {
            fillStyle: null,
            strokeStyle: null,
            globalAlpha: 1,
            globalCompositeOperation: 'source-over',
            lineWidth: 1,
            lineCap: 'butt',
            lineJoin: 'miter',
            shadowBlur: 0,
            shadowColor: 'transparent',
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            font: '10px sans-serif'
        };

        // State stack for save/restore
        this.stateStack = [];

        // Performance stats
        this.stats = {
            saves: 0,
            restores: 0,
            stateChanges: 0,
            redundantChanges: 0
        };
    }

    /**
     * Set fill style only if different from current
     * @param {string|CanvasGradient|CanvasPattern} style - Fill style
     */
    setFillStyle(style) {
        if (this.currentState.fillStyle !== style) {
            this.ctx.fillStyle = style;
            this.currentState.fillStyle = style;
            this.stats.stateChanges++;
        } else {
            this.stats.redundantChanges++;
        }
    }

    /**
     * Set stroke style only if different from current
     * @param {string|CanvasGradient|CanvasPattern} style - Stroke style
     */
    setStrokeStyle(style) {
        if (this.currentState.strokeStyle !== style) {
            this.ctx.strokeStyle = style;
            this.currentState.strokeStyle = style;
            this.stats.stateChanges++;
        } else {
            this.stats.redundantChanges++;
        }
    }

    /**
     * Set global alpha only if different from current
     * @param {number} alpha - Alpha value (0-1)
     */
    setGlobalAlpha(alpha) {
        if (Math.abs(this.currentState.globalAlpha - alpha) > 0.001) {
            this.ctx.globalAlpha = alpha;
            this.currentState.globalAlpha = alpha;
            this.stats.stateChanges++;
        } else {
            this.stats.redundantChanges++;
        }
    }

    /**
     * Set composite operation only if different from current
     * @param {string} operation - Composite operation
     */
    setGlobalCompositeOperation(operation) {
        if (this.currentState.globalCompositeOperation !== operation) {
            this.ctx.globalCompositeOperation = operation;
            this.currentState.globalCompositeOperation = operation;
            this.stats.stateChanges++;
        } else {
            this.stats.redundantChanges++;
        }
    }

    /**
     * Set line width only if different from current
     * @param {number} width - Line width
     */
    setLineWidth(width) {
        if (Math.abs(this.currentState.lineWidth - width) > 0.001) {
            this.ctx.lineWidth = width;
            this.currentState.lineWidth = width;
            this.stats.stateChanges++;
        } else {
            this.stats.redundantChanges++;
        }
    }

    /**
     * Set shadow properties only if different from current
     * @param {Object} shadow - Shadow properties
     */
    setShadow(blur = 0, color = 'transparent', offsetX = 0, offsetY = 0) {
        let changed = false;

        if (Math.abs(this.currentState.shadowBlur - blur) > 0.001) {
            this.ctx.shadowBlur = blur;
            this.currentState.shadowBlur = blur;
            changed = true;
        }

        if (this.currentState.shadowColor !== color) {
            this.ctx.shadowColor = color;
            this.currentState.shadowColor = color;
            changed = true;
        }

        if (Math.abs(this.currentState.shadowOffsetX - offsetX) > 0.001) {
            this.ctx.shadowOffsetX = offsetX;
            this.currentState.shadowOffsetX = offsetX;
            changed = true;
        }

        if (Math.abs(this.currentState.shadowOffsetY - offsetY) > 0.001) {
            this.ctx.shadowOffsetY = offsetY;
            this.currentState.shadowOffsetY = offsetY;
            changed = true;
        }

        if (changed) {
            this.stats.stateChanges++;
        } else {
            this.stats.redundantChanges++;
        }
    }

    /**
     * Clear shadows efficiently
     */
    clearShadow() {
        if (this.currentState.shadowBlur !== 0 ||
            this.currentState.shadowColor !== 'transparent') {
            this.setShadow(0, 'transparent', 0, 0);
        }
    }

    /**
     * Save current state
     */
    save() {
        this.ctx.save();
        this.stateStack.push({ ...this.currentState });
        this.stats.saves++;
    }

    /**
     * Restore previous state
     */
    restore() {
        this.ctx.restore();
        if (this.stateStack.length > 0) {
            this.currentState = this.stateStack.pop();
        }
        this.stats.restores++;
    }


    /**
     * Get performance statistics
     * @returns {Object} Stats object
     */
    getStats() {
        const totalOperations = this.stats.stateChanges + this.stats.redundantChanges;
        const redundancyRate = totalOperations > 0
            ? (this.stats.redundantChanges / totalOperations * 100).toFixed(2)
            : 0;

        return {
            saves: this.stats.saves,
            restores: this.stats.restores,
            stateChanges: this.stats.stateChanges,
            redundantChanges: this.stats.redundantChanges,
            redundancyRate: `${redundancyRate}%`,
            stackDepth: this.stateStack.length
        };
    }

    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            saves: 0,
            restores: 0,
            stateChanges: 0,
            redundantChanges: 0
        };
    }

    /**
     * Reset context state to defaults
     */
    reset() {
        // Reset tracked state
        this.currentState = {
            fillStyle: null,
            strokeStyle: null,
            globalAlpha: 1,
            globalCompositeOperation: 'source-over',
            lineWidth: 1,
            lineCap: 'butt',
            lineJoin: 'miter',
            shadowBlur: 0,
            shadowColor: 'transparent',
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            font: '10px sans-serif'
        };

        // Clear state stack
        this.stateStack = [];

        // Reset stats
        this.resetStats();
    }

    /**
     * Create a scoped operation that automatically saves/restores
     * @param {Function} operation - Operation to perform
     */
    scoped(operation) {
        this.save();
        try {
            operation();
        } finally {
            this.restore();
        }
    }

    /**
     * Batch multiple state changes together
     * @param {Object} states - Object with state properties to set
     */
    batch(states) {
        if (states.fillStyle !== undefined) {
            this.setFillStyle(states.fillStyle);
        }
        if (states.strokeStyle !== undefined) {
            this.setStrokeStyle(states.strokeStyle);
        }
        if (states.globalAlpha !== undefined) {
            this.setGlobalAlpha(states.globalAlpha);
        }
        if (states.globalCompositeOperation !== undefined) {
            this.setGlobalCompositeOperation(states.globalCompositeOperation);
        }
        if (states.lineWidth !== undefined) {
            this.setLineWidth(states.lineWidth);
        }
        if (states.shadow) {
            this.setShadow(
                states.shadow.blur,
                states.shadow.color,
                states.shadow.offsetX,
                states.shadow.offsetY
            );
        }
    }
}

// Export for convenience
export default ContextStateManager;