/**
 * ResizeObserverManager - Observes container element for dimension changes
 *
 * Fires a callback when the container resizes (orientation change, layout shift,
 * viewport resize). Uses requestAnimationFrame debouncing to coalesce rapid
 * resize events into one call per frame.
 *
 * Extracted from EmotiveMascot3D to keep resize logic self-contained.
 */

export class ResizeObserverManager {
    /**
     * @param {HTMLElement} container - Element to observe
     * @param {(width: number, height: number) => void} onResize - Callback with new CSS dimensions
     */
    constructor(container, onResize) {
        this._container = container;
        this._onResize = onResize;
        this._lastWidth = 0;
        this._lastHeight = 0;
        this._observer = null;
        this._start();
    }

    /** @private */
    _start() {
        let pending = false;

        this._observer = new ResizeObserver(entries => {
            // Debounce via rAF — avoids mid-frame layout thrash
            if (pending) return;
            pending = true;

            requestAnimationFrame(() => {
                pending = false;
                if (!this._observer) return; // destroyed during debounce

                const entry = entries[entries.length - 1];
                const { width, height } = entry.contentRect;
                const w = Math.round(width);
                const h = Math.round(height);

                // Skip if unchanged or element is hidden
                if (w === this._lastWidth && h === this._lastHeight) return;
                if (w === 0 || h === 0) return;

                this._lastWidth = w;
                this._lastHeight = h;
                this._onResize(w, h);
            });
        });

        this._observer.observe(this._container);
    }

    destroy() {
        if (this._observer) {
            this._observer.disconnect();
            this._observer = null;
        }
        this._container = null;
        this._onResize = null;
    }
}
