import { describe, bench, beforeEach } from 'vitest';

describe('GradientCache Benchmarks', () => {
    let GradientCache;
    let cache;
    let mockCtx;

    beforeEach(async () => {
        ({ GradientCache } = await import('../src/core/renderer/GradientCache.js'));
        cache = new GradientCache(100);

        // Mock canvas context
        mockCtx = {
            createRadialGradient: () => ({
                addColorStop: () => {}
            }),
            createLinearGradient: () => ({
                addColorStop: () => {}
            })
        };
    });

    bench('create radial gradient (cache miss)', () => {
        cache.getRadialGradient(mockCtx, Math.random() * 1000, 300, 0, 400, 300, 100, [
            { offset: 0, color: '#ff0000' },
            { offset: 1, color: '#0000ff' }
        ]);
    });

    bench('get radial gradient (cache hit)', () => {
        // Pre-populate cache
        cache.getRadialGradient(mockCtx, 400, 300, 0, 400, 300, 100, [
            { offset: 0, color: '#ff0000' },
            { offset: 1, color: '#0000ff' }
        ]);

        // Benchmark cache hit
        cache.getRadialGradient(mockCtx, 400, 300, 0, 400, 300, 100, [
            { offset: 0, color: '#ff0000' },
            { offset: 1, color: '#0000ff' }
        ]);
    });

    bench('cache stats retrieval', () => {
        cache.getStats();
    });

    bench('cache clear', () => {
        // Pre-fill cache
        for (let i = 0; i < 50; i++) {
            cache.getRadialGradient(mockCtx, i, i, 0, i, i, 100, [
                { offset: 0, color: '#ff0000' },
                { offset: 1, color: '#0000ff' }
            ]);
        }
        cache.clear();
    });
});

describe('EmotionCache Benchmarks', () => {
    let EmotionCache;
    let cache;

    beforeEach(async () => {
        ({ EmotionCache } = await import('../src/core/cache/EmotionCache.js'));
        cache = new EmotionCache();
    });

    bench('get cached emotion (hit)', () => {
        // Pre-cache
        cache.get('joy');
        // Benchmark hit
        cache.get('joy');
    });

    bench('get cached emotion (miss)', () => {
        cache.get('somethingNotCached');
    });

    bench('cycle through cached emotions', () => {
        const emotions = ['joy', 'sadness', 'anger', 'fear', 'neutral'];
        for (const emotion of emotions) {
            cache.get(emotion);
        }
    });
});

describe('ShapeCache Benchmarks', () => {
    let ShapeCache;
    let cache;

    beforeEach(async () => {
        ({ ShapeCache } = await import('../src/core/cache/ShapeCache.js'));
        cache = new ShapeCache();
    });

    bench('get cached shape (hit)', () => {
        cache.get('circle');
        cache.get('circle');
    });

    bench('get cached shape (miss)', () => {
        cache.get('uncachedShape');
    });

    bench('cycle through cached shapes', () => {
        const shapes = ['circle', 'heart', 'star', 'diamond'];
        for (const shape of shapes) {
            cache.get(shape);
        }
    });
});
