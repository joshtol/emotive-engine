/**
 * Time control helpers for tests that depend on Date.now / timestamps
 */

/**
 * Replace Date.now with a controllable clock
 * @returns {{ now: () => number, advance: (ms: number) => void, restore: () => void }}
 */
export function createMockClock(startTime = 1000000) {
    const originalNow = Date.now;
    let currentTime = startTime;

    Date.now = () => currentTime;

    return {
        now: () => currentTime,
        advance(ms) {
            currentTime += ms;
        },
        set(time) {
            currentTime = time;
        },
        restore() {
            Date.now = originalNow;
        },
    };
}
