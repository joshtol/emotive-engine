/*!
 * Performance Utilities
 * Provides debouncing, throttling, and other performance optimization functions
 */

/**
 * Debounce function - delays execution until after wait time has passed
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute immediately on first call
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(this, args);
    };
}

/**
 * Throttle function - limits execution to once per wait time
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
export function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * RequestAnimationFrame throttle - limits execution to animation frames
 * @param {Function} func - Function to throttle
 * @returns {Function} - RAF throttled function
 */
export function rafThrottle(func) {
    let rafId;
    return function executedFunction(...args) {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
            func.apply(this, args);
            rafId = null;
        });
    };
}

/**
 * Batch DOM updates to reduce reflows
 * @param {Function} updateFunction - Function containing DOM updates
 * @returns {Promise} - Promise that resolves when updates are complete
 */
export function batchDOMUpdates(updateFunction) {
    return new Promise(resolve => {
        requestAnimationFrame(() => {
            updateFunction();
            requestAnimationFrame(resolve);
        });
    });
}

/**
 * Create a performance observer for monitoring
 * @param {string} type - Type of performance entry to observe
 * @param {Function} callback - Callback function for entries
 * @returns {PerformanceObserver|null} - Observer instance or null if not supported
 */
export function createPerformanceObserver(type, callback) {
    if (!window.PerformanceObserver) return null;
    
    try {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(callback);
        });
        observer.observe({ entryTypes: [type] });
        return observer;
    } catch (error) {
        console.warn('PerformanceObserver not supported:', error);
        return null;
    }
}

/**
 * Measure function execution time
 * @param {Function} func - Function to measure
 * @param {string} name - Name for the measurement
 * @returns {Function} - Wrapped function that measures execution time
 */
export function measureTime(func, name = 'function') {
    return function measuredFunction(...args) {
        const start = performance.now();
        const result = func.apply(this, args);
        const end = performance.now();
        // Execution time measured
        return result;
    };
}

/**
 * Memory usage monitor
 * @returns {Object|null} - Memory usage info or null if not available
 */
export function getMemoryUsage() {
    if (performance.memory) {
        return {
            used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
            total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        };
    }
    return null;
}

/**
 * Event delegation helper
 * @param {Element} container - Container element to delegate from
 * @param {string} selector - CSS selector for target elements
 * @param {string} event - Event type
 * @param {Function} handler - Event handler function
 * @returns {Function} - Cleanup function
 */
export function delegateEvent(container, selector, event, handler) {
    const delegatedHandler = (e) => {
        if (e.target.matches(selector)) {
            handler.call(e.target, e);
        }
    };
    
    container.addEventListener(event, delegatedHandler);
    
    // Return cleanup function
    return () => container.removeEventListener(event, delegatedHandler);
}

/**
 * Intersection Observer for lazy loading
 * @param {Element} element - Element to observe
 * @param {Function} callback - Callback when element comes into view
 * @param {Object} options - Intersection Observer options
 * @returns {IntersectionObserver|null} - Observer instance or null if not supported
 */
export function createLazyObserver(element, callback, options = {}) {
    if (!window.IntersectionObserver) return null;
    
    const defaultOptions = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1,
        ...options
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                callback(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, defaultOptions);
    
    observer.observe(element);
    return observer;
}

// Export all utilities as default object
export default {
    debounce,
    throttle,
    rafThrottle,
    batchDOMUpdates,
    createPerformanceObserver,
    measureTime,
    getMemoryUsage,
    delegateEvent,
    createLazyObserver
};
