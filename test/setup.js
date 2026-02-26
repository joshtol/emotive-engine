/**
 * Test setup file for Emotive Engine
 * Provides minimal stubs for browser APIs referenced by source modules
 */

// Suppress console noise during tests
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
    console.warn = (...args) => {
        // Allow test-specific warnings through, suppress engine noise
        if (args[0]?.includes?.('[EmotiveMascot]')) return;
        originalWarn(...args);
    };
    console.error = (...args) => {
        if (args[0]?.includes?.('[EmotiveMascot]')) return;
        originalError(...args);
    };
});

afterAll(() => {
    console.warn = originalWarn;
    console.error = originalError;
});
