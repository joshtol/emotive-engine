/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Emotion Cache System
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Pre-cached emotion system for instant emotion transitions
 * @author Emotive Engine Team
 * @module cache/EmotionCache
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Pre-caches all emotion states and their configurations for instant access.
 * ║ Eliminates the need to load emotion data on-demand, improving transition
 * ║ performance from ~20-50ms to <5ms.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

// Import emotion functions directly to avoid circular dependency
import { getEmotion, getEmotionVisualParams, getEmotionModifiers, getTransitionParams, listEmotions } from '../emotions/index.js';

/**
 * EmotionCache - Pre-caches all emotion configurations for instant access
 */
export class EmotionCache {
    constructor() {
        // Cache storage
        this.emotionCache = new Map();
        this.visualParamsCache = new Map();
        this.modifiersCache = new Map();
        this.transitionCache = new Map();
        
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
     * Initialize the emotion cache by pre-loading all emotions
     */
    initialize() {
        this.loadStartTime = performance.now();
        
        try {
            // Get all available emotions
            const emotions = listEmotions();
            
            // Pre-cache each emotion
            emotions.forEach(emotionName => {
                this.cacheEmotion(emotionName);
            });
            
            // Pre-cache common transitions
            this.cacheCommonTransitions(emotions);
            
            this.isInitialized = true;
            this.stats.loadTime = performance.now() - this.loadStartTime;
            this.stats.cacheSize = this.emotionCache.size;

            // Removed verbose initialization log

        } catch (error) {
            console.error('[EmotionCache] Initialization failed:', error);
            this.isInitialized = false;
        }
    }
    
    /**
     * Cache a single emotion and its related data
     * @param {string} emotionName - Name of the emotion to cache
     */
    cacheEmotion(emotionName) {
        try {
            // Cache main emotion configuration
            const emotion = getEmotion(emotionName);
            if (emotion) {
                this.emotionCache.set(emotionName, emotion);
            }
            
            // Cache visual parameters (pre-evaluated)
            const visualParams = getEmotionVisualParams(emotionName);
            this.visualParamsCache.set(emotionName, visualParams);
            
            // Cache modifiers
            const modifiers = getEmotionModifiers(emotionName);
            this.modifiersCache.set(emotionName, modifiers);
            
        } catch (error) {
            console.warn(`[EmotionCache] Failed to cache emotion '${emotionName}':`, error);
        }
    }
    
    /**
     * Cache common emotion transitions
     * @param {Array<string>} emotions - List of emotion names
     */
    cacheCommonTransitions(emotions) {
        // Cache transitions between common emotion pairs
        const commonPairs = [
            ['neutral', 'joy'],
            ['neutral', 'sadness'],
            ['neutral', 'anger'],
            ['joy', 'sadness'],
            ['sadness', 'joy'],
            ['anger', 'calm'],
            ['calm', 'anger']
        ];
        
        commonPairs.forEach(([from, to]) => {
            if (emotions.includes(from) && emotions.includes(to)) {
                try {
                    const transition = getTransitionParams(from, to);
                    const key = `${from}->${to}`;
                    this.transitionCache.set(key, transition);
                } catch (error) {
                    console.warn(`[EmotionCache] Failed to cache transition '${from}->${to}':`, error);
                }
            }
        });
    }
    
    /**
     * Get cached emotion configuration
     * @param {string} emotionName - Name of the emotion
     * @returns {Object|null} Cached emotion configuration
     */
    getEmotion(emotionName) {
        if (!this.isInitialized) {
            console.warn('[EmotionCache] Cache not initialized, falling back to direct access');
            return getEmotion(emotionName);
        }
        
        const cached = this.emotionCache.get(emotionName);
        if (cached) {
            this.stats.hits++;
            return cached;
        }
        
        this.stats.misses++;
        console.warn(`[EmotionCache] Cache miss for emotion '${emotionName}', consider adding to pre-cache`);
        return getEmotion(emotionName);
    }
    
    /**
     * Get cached visual parameters
     * @param {string} emotionName - Name of the emotion
     * @returns {Object} Cached visual parameters
     */
    getVisualParams(emotionName) {
        if (!this.isInitialized) {
            return getEmotionVisualParams(emotionName);
        }
        
        const cached = this.visualParamsCache.get(emotionName);
        if (cached) {
            this.stats.hits++;
            return cached;
        }
        
        this.stats.misses++;
        return getEmotionVisualParams(emotionName);
    }
    
    /**
     * Get cached modifiers
     * @param {string} emotionName - Name of the emotion
     * @returns {Object} Cached modifiers
     */
    getModifiers(emotionName) {
        if (!this.isInitialized) {
            return getEmotionModifiers(emotionName);
        }
        
        const cached = this.modifiersCache.get(emotionName);
        if (cached) {
            this.stats.hits++;
            return cached;
        }
        
        this.stats.misses++;
        return getEmotionModifiers(emotionName);
    }
    
    /**
     * Get cached transition parameters
     * @param {string} fromEmotion - Starting emotion
     * @param {string} toEmotion - Target emotion
     * @returns {Object} Cached transition parameters
     */
    getTransitionParams(fromEmotion, toEmotion) {
        if (!this.isInitialized) {
            return getTransitionParams(fromEmotion, toEmotion);
        }
        
        const key = `${fromEmotion}->${toEmotion}`;
        const cached = this.transitionCache.get(key);
        if (cached) {
            this.stats.hits++;
            return cached;
        }
        
        this.stats.misses++;
        return getTransitionParams(fromEmotion, toEmotion);
    }
    
    /**
     * Check if emotion is cached
     * @param {string} emotionName - Name of the emotion
     * @returns {boolean} True if emotion is cached
     */
    hasEmotion(emotionName) {
        return this.emotionCache.has(emotionName);
    }
    
    /**
     * Get cache statistics
     * @returns {Object} Cache performance statistics
     */
    getStats() {
        const totalRequests = this.stats.hits + this.stats.misses;
        const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests * 100).toFixed(2) : 0;
        
        return {
            isInitialized: this.isInitialized,
            loadTime: this.stats.loadTime,
            cacheSize: this.stats.cacheSize,
            hits: this.stats.hits,
            misses: this.stats.misses,
            hitRate: `${hitRate}%`,
            emotions: this.emotionCache.size,
            visualParams: this.visualParamsCache.size,
            modifiers: this.modifiersCache.size,
            transitions: this.transitionCache.size
        };
    }
    
    /**
     * Clear all caches
     */
    clear() {
        this.emotionCache.clear();
        this.visualParamsCache.clear();
        this.modifiersCache.clear();
        this.transitionCache.clear();
        this.isInitialized = false;
        this.stats = { hits: 0, misses: 0, loadTime: 0, cacheSize: 0 };
    }
    
    /**
     * Reinitialize cache (useful for dynamic emotion loading)
     */
    reinitialize() {
        this.clear();
        this.initialize();
    }
}

// Create singleton instance
export const emotionCache = new EmotionCache();

// Export for convenience
export default emotionCache;
