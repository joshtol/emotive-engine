import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FeatureFlags } from '../../../../src/core/system/FeatureFlags.js';

describe('FeatureFlags', () => {
    let fetchSpy;

    beforeEach(() => {
        fetchSpy = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));
        vi.stubGlobal('fetch', fetchSpy);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    describe('endpoint configuration', () => {
        it('does not fetch or poll when endpoint is explicitly null', () => {
            // The exported singleton passes endpoint: null precisely to keep the
            // library from polling a route the host app may not implement. A falsy
            // check here would fall through to the default and 404 on every consumer.
            const flags = new FeatureFlags({ endpoint: null });

            expect(flags.config.endpoint).toBeNull();
            expect(flags.refreshTimer).toBeNull();
            expect(fetchSpy).not.toHaveBeenCalled();

            flags.destroy();
        });

        it('does not fetch when endpoint is an empty string', () => {
            const flags = new FeatureFlags({ endpoint: '' });

            expect(flags.refreshTimer).toBeNull();
            expect(fetchSpy).not.toHaveBeenCalled();

            flags.destroy();
        });

        it('defaults to /api/feature-flags when endpoint is omitted', () => {
            const flags = new FeatureFlags();

            expect(flags.config.endpoint).toBe('/api/feature-flags');

            flags.destroy();
        });

        it('honours an explicit custom endpoint', () => {
            const flags = new FeatureFlags({ endpoint: '/custom/flags' });

            expect(flags.config.endpoint).toBe('/custom/flags');
            expect(fetchSpy).toHaveBeenCalledWith('/custom/flags', expect.any(Object));

            flags.destroy();
        });
    });

    describe('flag evaluation without a backend', () => {
        it('serves built-in defaults when no endpoint is configured', () => {
            const flags = new FeatureFlags({ endpoint: null });

            expect(flags.isEnabled('enableParticles')).toBe(true);
            expect(flags.isEnabled('enableWebGPU')).toBe(false);
            expect(flags.isEnabled('nonexistentFlag', false)).toBe(false);

            flags.destroy();
        });
    });
});
