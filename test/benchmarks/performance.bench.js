/**
 * Performance benchmarks for Emotive Engine
 * Run with: npm run bench
 */

import { describe, bench, expect } from 'vitest';
import { AnimationLoopManager } from '../../src/core/AnimationLoopManager.js';
import { GradientCache } from '../../src/core/renderer/GradientCache.js';
import { StateStore } from '../../src/core/StateStore.js';
import { EventManager } from '../../src/core/EventManager.js';
import { ParticleSystem } from '../../src/core/ParticleSystem.js';

describe('Animation Loop Performance', () => {
    bench('register and unregister 1000 callbacks', () => {
        const manager = new AnimationLoopManager();
        const ids = [];

        for (let i = 0; i < 1000; i++) {
            ids.push(manager.register(() => {}));
        }

        for (const id of ids) {
            manager.unregister(id);
        }
    });

    bench('execute 100 callbacks', () => {
        const manager = new AnimationLoopManager();
        let counter = 0;

        for (let i = 0; i < 100; i++) {
            manager.register(() => counter++);
        }

        manager.frame(performance.now());
    });

    bench('priority-based execution', () => {
        const manager = new AnimationLoopManager();
        const priorities = [0, 1, 2, 3, 4];

        for (let i = 0; i < 50; i++) {
            const priority = priorities[i % 5];
            manager.register(() => {}, priority);
        }

        manager.frame(performance.now());
    });
});

describe('Gradient Cache Performance', () => {
    let ctx;

    beforeEach(() => {
        const canvas = document.createElement('canvas');
        ctx = canvas.getContext('2d');
    });

    bench('cache hit performance', () => {
        const cache = new GradientCache(100);
        const stops = [
            { offset: 0, color: 'red' },
            { offset: 1, color: 'blue' }
        ];

        // Warm up cache
        cache.getLinearGradient(ctx, 0, 0, 100, 100, stops);

        // Measure cache hits
        for (let i = 0; i < 100; i++) {
            cache.getLinearGradient(ctx, 0, 0, 100, 100, stops);
        }
    });

    bench('cache miss performance', () => {
        const cache = new GradientCache(100);

        for (let i = 0; i < 100; i++) {
            const stops = [
                { offset: 0, color: `rgb(${i}, 0, 0)` },
                { offset: 1, color: `rgb(0, 0, ${i})` }
            ];
            cache.getLinearGradient(ctx, i, i, i + 100, i + 100, stops);
        }
    });

    bench('LRU eviction', () => {
        const cache = new GradientCache(10);

        for (let i = 0; i < 100; i++) {
            const stops = [
                { offset: 0, color: `rgb(${i}, 0, 0)` },
                { offset: 1, color: 'blue' }
            ];
            cache.getLinearGradient(ctx, 0, 0, 100, 100, stops);
        }
    });
});

describe('State Store Performance', () => {
    bench('set and get state', () => {
        const store = new StateStore();

        for (let i = 0; i < 1000; i++) {
            store.setState(`test.value.${i}`, i);
            store.getState(`test.value.${i}`);
        }
    });

    bench('nested state updates', () => {
        const store = new StateStore();

        for (let i = 0; i < 100; i++) {
            store.setState({
                'level1.level2.level3.value': i,
                'level1.level2.another': i * 2,
                'level1.different': i * 3
            });
        }
    });

    bench('subscription notifications', () => {
        const store = new StateStore();
        const unsubscribes = [];

        // Add 100 subscribers
        for (let i = 0; i < 100; i++) {
            unsubscribes.push(
                store.subscribe(`test.${i}`, () => {})
            );
        }

        // Trigger updates
        for (let i = 0; i < 100; i++) {
            store.setState(`test.${i}`, i);
        }

        // Cleanup
        unsubscribes.forEach(fn => fn());
    });
});

describe('Event Manager Performance', () => {
    bench('add and remove 1000 listeners', () => {
        const manager = new EventManager();
        const target = document.createElement('div');
        const ids = [];

        for (let i = 0; i < 1000; i++) {
            ids.push(
                manager.addEventListener(target, 'click', () => {})
            );
        }

        for (const id of ids) {
            manager.removeEventListener(id);
        }
    });

    bench('group management', () => {
        const manager = new EventManager();
        const target = document.createElement('div');

        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 100; j++) {
                manager.addEventListener(
                    target,
                    'click',
                    () => {},
                    {},
                    `group-${i}`
                );
            }
        }

        for (let i = 0; i < 10; i++) {
            manager.removeGroup(`group-${i}`);
        }
    });

    bench('leak detection analysis', () => {
        const manager = new EventManager();
        const targets = [];

        for (let i = 0; i < 100; i++) {
            const target = document.createElement('div');
            targets.push(target);

            for (let j = 0; j < 10; j++) {
                manager.addEventListener(target, 'click', () => {});
            }
        }

        manager.analyzeLeaks();
    });
});

describe('Particle System Performance', () => {
    bench('emit 1000 particles', () => {
        const system = new ParticleSystem({
            count: 1000,
            life: [1000, 2000]
        });

        system.emit(50, 50, 1000);
    });

    bench('update 10000 particles', () => {
        const system = new ParticleSystem({
            count: 10000,
            life: [5000, 10000]
        });

        system.emit(50, 50, 10000);

        for (let i = 0; i < 60; i++) {
            system.update(16.67);
        }
    });

    bench('render 5000 particles', () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const system = new ParticleSystem({
            count: 5000,
            life: [5000, 10000]
        });

        system.emit(50, 50, 5000);
        system.render(ctx);
    });
});

describe('Memory Allocation', () => {
    bench('create and destroy 100 animation loops', () => {
        const managers = [];

        for (let i = 0; i < 100; i++) {
            const manager = new AnimationLoopManager();
            manager.register(() => {});
            managers.push(manager);
        }

        managers.forEach(m => m.reset());
    });

    bench('create and destroy 100 state stores', () => {
        const stores = [];

        for (let i = 0; i < 100; i++) {
            const store = new StateStore({ initial: { value: i } });
            stores.push(store);
        }

        stores.forEach(s => s.reset());
    });

    bench('large state tree creation', () => {
        const store = new StateStore();
        const data = {};

        for (let i = 0; i < 100; i++) {
            data[`key${i}`] = {
                value: i,
                nested: {
                    deep: {
                        deeper: {
                            value: i * 2
                        }
                    }
                }
            };
        }

        store.setState(data);
    });
});

describe('Integration Performance', () => {
    bench('full engine initialization', async () => {
        const { EmotiveMascot } = await import('../../src/EmotiveMascot.js');

        const mascot = new EmotiveMascot({
            width: 800,
            height: 600,
            autoStart: false
        });

        const container = document.createElement('div');
        mascot.init(container);
        mascot.destroy();
    });

    bench('multiple system interaction', () => {
        const loopManager = new AnimationLoopManager();
        const stateStore = new StateStore();
        const eventManager = new EventManager();

        // Simulate real usage
        const target = document.createElement('div');

        eventManager.addEventListener(target, 'click', () => {
            stateStore.setState('clicked', true);
        });

        loopManager.register(() => {
            const clicked = stateStore.getState('clicked');
            if (clicked) {
                stateStore.setState('clicked', false);
            }
        });

        // Simulate clicks
        for (let i = 0; i < 100; i++) {
            target.dispatchEvent(new Event('click'));
            loopManager.frame(performance.now());
        }
    });
});

// Export benchmark results formatter
export function formatBenchmarkResults(results) {
    const formatted = {
        timestamp: Date.now(),
        environment: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            memory: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1048576),
                total: Math.round(performance.memory.totalJSHeapSize / 1048576)
            } : null
        },
        results: {}
    };

    for (const [name, data] of Object.entries(results)) {
        formatted.results[name] = {
            mean: data.mean,
            median: data.median,
            min: data.min,
            max: data.max,
            samples: data.samples,
            ops: Math.round(1000 / data.mean) // Operations per second
        };
    }

    return formatted;
}