/**
 * Test setup file for vitest
 */

// Mock canvas context for testing
HTMLCanvasElement.prototype.getContext = function(contextType) {
  if (contextType === '2d') {
    return {
      clearRect: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      arc: () => {},
      fill: () => {},
      stroke: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      rotate: () => {},
      scale: () => {},
      fillStyle: '#000000',
      strokeStyle: '#000000',
      lineWidth: 1,
      globalAlpha: 1,
      font: '10px sans-serif',
      fillText: () => {},
      strokeText: () => {},
      measureText: () => ({ width: 0 }),
      createRadialGradient: () => ({
        addColorStop: () => {}
      }),
      createLinearGradient: () => ({
        addColorStop: () => {}
      })
    };
  }
  return null;
};

// Mock getBoundingClientRect
HTMLCanvasElement.prototype.getBoundingClientRect = function() {
  return {
    left: 0,
    top: 0,
    right: this.width || 300,
    bottom: this.height || 300,
    width: this.width || 300,
    height: this.height || 300,
    x: 0,
    y: 0
  };
};

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 16);
};

global.cancelAnimationFrame = (id) => {
  clearTimeout(id);
};

// Mock performance.now
global.performance = {
  now: () => Date.now()
};