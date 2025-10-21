import { Page, expect } from '@playwright/test';

/**
 * Helper utilities for testing Emotive Mascot functionality
 */

/**
 * Wait for the mascot engine to be fully initialized
 * @param page - Playwright page instance
 * @param timeout - Maximum time to wait in milliseconds (default: 10000)
 */
export async function waitForMascotInitialization(page: Page, timeout = 10000): Promise<void> {
  await page.waitForFunction(() => {
    const canvas = document.querySelector('#hero-mascot-canvas') as HTMLCanvasElement;
    if (!canvas) return false;

    // Check if EmotiveMascot is loaded on window
    const EmotiveMascot = (window as any).EmotiveMascot;
    if (!EmotiveMascot) return false;

    // Check if canvas has dimensions set
    const width = canvas.getAttribute('width');
    const height = canvas.getAttribute('height');

    return width && height && parseInt(width) > 0 && parseInt(height) > 0;
  }, { timeout });
}

/**
 * Check if mascot is currently initialized
 * @param page - Playwright page instance
 * @returns True if mascot is initialized, false otherwise
 */
export async function isMascotInitialized(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    const canvas = document.querySelector('#hero-mascot-canvas') as HTMLCanvasElement;
    if (!canvas) return false;

    const EmotiveMascot = (window as any).EmotiveMascot;
    return EmotiveMascot !== undefined;
  });
}

/**
 * Get the current mascot emotion
 * @param page - Playwright page instance
 * @returns Current emotion string or null if not available
 */
export async function getCurrentEmotion(page: Page): Promise<string | null> {
  return await page.evaluate(() => {
    const mascot = (window as any).mascotInstance;
    if (!mascot) return null;

    // Try to access current emotion from mascot instance
    return mascot.currentEmotion || mascot._currentEmotion || null;
  });
}

/**
 * Set up emotion change tracking
 * @param page - Playwright page instance
 */
export async function setupEmotionTracking(page: Page): Promise<void> {
  await page.evaluate(() => {
    (window as any).emotionChanges = [];

    const checkMascot = setInterval(() => {
      const mascot = (window as any).mascotInstance;
      if (mascot && typeof mascot.setEmotion === 'function') {
        const originalSetEmotion = mascot.setEmotion;

        mascot.setEmotion = function(emotion: string, duration: number) {
          (window as any).emotionChanges.push({
            emotion,
            duration,
            timestamp: Date.now()
          });
          return originalSetEmotion.call(this, emotion, duration);
        };

        clearInterval(checkMascot);
      }
    }, 100);

    // Clear interval after 5 seconds if mascot doesn't initialize
    setTimeout(() => clearInterval(checkMascot), 5000);
  });
}

/**
 * Get tracked emotion changes
 * @param page - Playwright page instance
 * @returns Array of emotion change events
 */
export async function getEmotionChanges(page: Page): Promise<Array<{
  emotion: string;
  duration: number;
  timestamp: number;
}>> {
  return await page.evaluate(() => (window as any).emotionChanges || []);
}

/**
 * Set up gesture tracking
 * @param page - Playwright page instance
 */
export async function setupGestureTracking(page: Page): Promise<void> {
  await page.evaluate(() => {
    (window as any).gestures = [];

    const checkMascot = setInterval(() => {
      const mascot = (window as any).mascotInstance;
      if (mascot && typeof mascot.express === 'function') {
        const originalExpress = mascot.express;

        mascot.express = function(gesture: string) {
          (window as any).gestures.push({
            gesture,
            timestamp: Date.now()
          });
          return originalExpress.call(this, gesture);
        };

        clearInterval(checkMascot);
      }
    }, 100);

    // Clear interval after 5 seconds if mascot doesn't initialize
    setTimeout(() => clearInterval(checkMascot), 5000);
  });
}

/**
 * Get tracked gestures
 * @param page - Playwright page instance
 * @returns Array of gesture events
 */
export async function getGestures(page: Page): Promise<Array<{
  gesture: string;
  timestamp: number;
}>> {
  return await page.evaluate(() => (window as any).gestures || []);
}

/**
 * Set up particle clear tracking
 * @param page - Playwright page instance
 */
export async function setupParticleClearTracking(page: Page): Promise<void> {
  await page.evaluate(() => {
    (window as any).particleClears = [];

    const checkMascot = setInterval(() => {
      const mascot = (window as any).mascotInstance;
      if (mascot && typeof mascot.clearParticles === 'function') {
        const originalClearParticles = mascot.clearParticles;

        mascot.clearParticles = function() {
          (window as any).particleClears.push({
            timestamp: Date.now()
          });
          return originalClearParticles.call(this);
        };

        clearInterval(checkMascot);
      }
    }, 100);

    // Clear interval after 5 seconds if mascot doesn't initialize
    setTimeout(() => clearInterval(checkMascot), 5000);
  });
}

/**
 * Get particle clear events
 * @param page - Playwright page instance
 * @returns Array of particle clear events
 */
export async function getParticleClears(page: Page): Promise<Array<{
  timestamp: number;
}>> {
  return await page.evaluate(() => (window as any).particleClears || []);
}

/**
 * Wait for mascot canvas to have valid dimensions
 * @param page - Playwright page instance
 * @param timeout - Maximum time to wait in milliseconds (default: 5000)
 */
export async function waitForCanvasDimensions(page: Page, timeout = 5000): Promise<void> {
  await page.waitForFunction(() => {
    const canvas = document.querySelector('#hero-mascot-canvas') as HTMLCanvasElement;
    if (!canvas) return false;

    const width = canvas.getAttribute('width');
    const height = canvas.getAttribute('height');

    return width && height && parseInt(width) > 0 && parseInt(height) > 0;
  }, { timeout });
}

/**
 * Get mascot canvas dimensions
 * @param page - Playwright page instance
 * @returns Object with width and height
 */
export async function getCanvasDimensions(page: Page): Promise<{ width: number; height: number }> {
  return await page.evaluate(() => {
    const canvas = document.querySelector('#hero-mascot-canvas') as HTMLCanvasElement;
    if (!canvas) return { width: 0, height: 0 };

    return {
      width: parseInt(canvas.getAttribute('width') || '0'),
      height: parseInt(canvas.getAttribute('height') || '0')
    };
  });
}

/**
 * Get mascot container z-index
 * @param page - Playwright page instance
 * @returns Current z-index value
 */
export async function getMascotZIndex(page: Page): Promise<number> {
  return await page.evaluate(() => {
    const container = document.querySelector('#hero-mascot-canvas')?.parentElement;
    if (!container) return 0;

    const zIndex = window.getComputedStyle(container).zIndex;
    return parseInt(zIndex) || 0;
  });
}

/**
 * Scroll to a specific position smoothly
 * @param page - Playwright page instance
 * @param scrollY - Y position to scroll to
 * @param smooth - Whether to use smooth scrolling (default: false)
 */
export async function scrollTo(page: Page, scrollY: number, smooth = false): Promise<void> {
  await page.evaluate(({ y, isSmooth }) => {
    window.scrollTo({
      top: y,
      behavior: isSmooth ? 'smooth' : 'auto'
    });
  }, { y: scrollY, isSmooth: smooth });

  // Wait for scroll to complete
  await page.waitForTimeout(smooth ? 1000 : 300);
}

/**
 * Get current scroll position
 * @param page - Playwright page instance
 * @returns Current scroll Y position
 */
export async function getScrollPosition(page: Page): Promise<number> {
  return await page.evaluate(() => window.scrollY);
}

/**
 * Get viewport dimensions
 * @param page - Playwright page instance
 * @returns Object with width and height
 */
export async function getViewportDimensions(page: Page): Promise<{ width: number; height: number }> {
  return await page.evaluate(() => ({
    width: window.innerWidth,
    height: window.innerHeight
  }));
}

/**
 * Calculate hero section height
 * @param page - Playwright page instance
 * @returns Hero height in pixels
 */
export async function getHeroHeight(page: Page): Promise<number> {
  return await page.evaluate(() => window.innerHeight * 0.9);
}
