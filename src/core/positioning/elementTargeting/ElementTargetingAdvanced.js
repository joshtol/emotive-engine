/**
 * Advanced Element Targeting utilities.
 * Provides path following, easing, collision detection, audio-reactive movement, and gaze features.
 */

import ElementTargeting from './ElementTargeting.js';

class ElementTargetingAdvanced extends ElementTargeting {
    constructor(positionController) {
        super(positionController);
        this.activePaths = new Map();
        this.obstacles = new Set();
        this.audioContext = null;
        this.audioAnalyser = null;
        this.gazeTracker = null;
        this.activeRAFIds = new Set(); // Track all active RAF IDs
        this.activeSmoothAnimations = new Set(); // Track smooth animation RAF IDs
    }

    /**
     * Move mascot to element following a custom path
     * @param {string} targetSelector - CSS selector for target element
     * @param {Array} pathPoints - Array of {x, y} points defining the path
     * @param {string} position - Position relative to element
     * @param {Object} offset - Pixel offset
     * @param {Object} options - Path options
     */
    moveToElementWithPath(targetSelector, pathPoints = [], position = 'right', offset = { x: 20, y: 0 }, options = {}) {
        const pathId = `path-${Date.now()}-${Math.random()}`;
        const element = document.querySelector(targetSelector);

        if (!element) {
            console.warn(`Element not found: ${targetSelector}`);
            return;
        }

        const viewportWidth = window.innerWidth || 1;
        const viewportHeight = window.innerHeight || 1;
        const halfViewportWidth = viewportWidth / 2;
        const halfViewportHeight = viewportHeight / 2;

        const coordinateSystem = options.coordinateSystem || 'auto';

        const normalizePoint = (point = {}) => {
            const rawX = typeof point.x === 'number' ? point.x : 0;
            const rawY = typeof point.y === 'number' ? point.y : 0;

            const useRelative = coordinateSystem === 'relative' || (coordinateSystem === 'auto' && rawX >= 0 && rawX <= 1 && rawY >= 0 && rawY <= 1);
            if (useRelative) {
                return {
                    x: rawX * viewportWidth - halfViewportWidth,
                    y: rawY * viewportHeight - halfViewportHeight
                };
            }

            if (coordinateSystem === 'offset' || (coordinateSystem === 'auto' && Math.abs(rawX) <= halfViewportWidth && Math.abs(rawY) <= halfViewportHeight)) {
                return { x: rawX, y: rawY };
            }

            return {
                x: rawX - halfViewportWidth,
                y: rawY - halfViewportHeight
            };
        };

        const processedPathPoints = Array.isArray(pathPoints) ? pathPoints.map(normalizePoint) : [];

        const rect = element.getBoundingClientRect();
        const targetPoint = {
            x: rect.left + rect.width / 2 + offset.x - halfViewportWidth,
            y: rect.top + rect.height / 2 + offset.y - halfViewportHeight
        };

        const startOffsetRaw = this.positionController.getOffset ? this.positionController.getOffset() : { x: 0, y: 0 };
        const startOffset = {
            x: typeof startOffsetRaw.x === 'number' ? startOffsetRaw.x : 0,
            y: typeof startOffsetRaw.y === 'number' ? startOffsetRaw.y : 0
        };

        const path = [startOffset, ...processedPathPoints, targetPoint];

        if (path.length < 2) {
            this.positionController.setOffset(targetPoint.x, targetPoint.y, 0);
            if (typeof options.onComplete === 'function') {
                options.onComplete();
            }
            return;
        }

        const segmentLengths = [];
        const cumulativeLengths = [0];
        let totalLength = 0;

        for (let i = 0; i < path.length - 1; i++) {
            const dx = path[i + 1].x - path[i].x;
            const dy = path[i + 1].y - path[i].y;
            const length = Math.hypot(dx, dy);
            segmentLengths.push(length);
            totalLength += length;
            cumulativeLengths.push(totalLength);
        }

        if (totalLength === 0) {
            this.positionController.setOffset(targetPoint.x, targetPoint.y, 0);
            if (typeof options.onComplete === 'function') {
                options.onComplete();
            }
            return;
        }

        const speed = typeof options.speed === 'number' && options.speed > 0 ? options.speed : 250;
        const loop = options.loop === true;
        const easing = options.easing || 'linear';

        const state = {
            covered: 0,
            lastTimestamp: null
        };

        const resolvePointOnPath = distance => {
            if (!loop) {
                if (distance <= 0) {
                    return path[0];
                }
                if (distance >= totalLength) {
                    return path[path.length - 1];
                }
            } else {
                distance = distance % totalLength;
            }

            for (let i = 0; i < segmentLengths.length; i++) {
                const segmentStart = cumulativeLengths[i];
                const segmentEnd = cumulativeLengths[i + 1];
                if (distance <= segmentEnd) {
                    const segmentLength = segmentLengths[i] || 1;
                    const progress = segmentLength === 0 ? 0 : (distance - segmentStart) / segmentLength;
                    const eased = this.positionController && typeof this.positionController.applyEasing === 'function'
                        ? this.positionController.applyEasing(progress, easing)
                        : progress;
                    const startPoint = path[i];
                    const endPoint = path[i + 1];
                    return {
                        x: startPoint.x + (endPoint.x - startPoint.x) * eased,
                        y: startPoint.y + (endPoint.y - startPoint.y) * eased
                    };
                }
            }

            return path[path.length - 1];
        };

        const pathEntry = {
            stop: () => {
                if (pathEntry.frameId) {
                    cancelAnimationFrame(pathEntry.frameId);
                }
                this.activePaths.delete(pathId);
            },
            frameId: null
        };

        this.activePaths.set(pathId, pathEntry);

        this.positionController.setOffset(path[0].x, path[0].y, 0);

        const step = timestamp => {
            if (!this.activePaths.has(pathId)) {
                return;
            }

            if (state.lastTimestamp === null) {
                state.lastTimestamp = timestamp;
            }

            const delta = timestamp - state.lastTimestamp;
            state.lastTimestamp = timestamp;

            state.covered += speed * (delta / 1000);

            if (!loop && state.covered >= totalLength) {
                this.positionController.setOffset(targetPoint.x, targetPoint.y, 0);
                pathEntry.stop();
                if (typeof options.onComplete === 'function') {
                    options.onComplete();
                }
                return;
            }

            const point = resolvePointOnPath(state.covered);
            this.positionController.setOffset(point.x, point.y, 0);

            pathEntry.frameId = requestAnimationFrame(step);
        };

        pathEntry.frameId = requestAnimationFrame(step);

        return () => {
            pathEntry.stop();
        };
    }

    /**
     * Move mascot to element with custom easing
     * @param {string} targetSelector - CSS selector for target element
     * @param {Function} easingFunction - Custom easing function
     * @param {number} duration - Animation duration in milliseconds
     * @param {string} position - Position relative to element
     * @param {Object} offset - Pixel offset
     */
    moveToElementWithEasing(targetSelector, easingFunction, duration = 1000, position = 'right', offset = { x: 20, y: 0 }) {
        const element = document.querySelector(targetSelector);
        if (!element) {
            console.warn(`Element not found: ${targetSelector}`);
            return;
        }

        const rect = element.getBoundingClientRect();
        const targetX = rect.left + rect.width / 2 + offset.x - window.innerWidth / 2;
        const targetY = rect.top + rect.height / 2 + offset.y - window.innerHeight / 2;

        const startOffset = this.positionController.getOffset();
        const startTime = performance.now();
        let rafId = null;

        const animate = currentTime => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easingFunction(progress);

            const currentX = startOffset.x + (targetX - startOffset.x) * easedProgress;
            const currentY = startOffset.y + (targetY - startOffset.y) * easedProgress;

            this.positionController.setOffset(currentX, currentY, 0);

            if (progress < 1) {
                rafId = requestAnimationFrame(animate);
                this.activeSmoothAnimations.add(rafId);
            } else {
                // Animation complete, remove from tracking
                if (rafId !== null) {
                    this.activeSmoothAnimations.delete(rafId);
                }
            }
        };

        rafId = requestAnimationFrame(animate);
        this.activeSmoothAnimations.add(rafId);
    }

    /**
     * Move mascot to element while avoiding obstacles
     * @param {string} targetSelector - CSS selector for target element
     * @param {Array} obstacles - Array of obstacle selectors or positions
     * @param {number} avoidanceDistance - Distance to maintain from obstacles
     * @param {string} position - Position relative to element
     * @param {Object} offset - Pixel offset
     */
    moveToElementWithCollision(targetSelector, obstacles = [], avoidanceDistance = 100, position = 'right', offset = { x: 20, y: 0 }) {
        const element = document.querySelector(targetSelector);
        if (!element) {
            console.warn(`Element not found: ${targetSelector}`);
            return;
        }

        const rect = element.getBoundingClientRect();
        const targetX = rect.left + rect.width / 2 + offset.x - window.innerWidth / 2;
        const targetY = rect.top + rect.height / 2 + offset.y - window.innerHeight / 2;

        const startOffset = this.positionController.getOffset();
        const steps = 100;
        const stepSize = 1 / steps;

        const navigate = () => {
            let currentX = startOffset.x;
            let currentY = startOffset.y;

            for (let i = 0; i <= steps; i++) {
                const progress = i * stepSize;
                const nextX = startOffset.x + (targetX - startOffset.x) * progress;
                const nextY = startOffset.y + (targetY - startOffset.y) * progress;

                // Check for obstacles
                let hasCollision = false;
                obstacles.forEach(obstacle => {
                    let obstacleX, obstacleY;
                    
                    if (typeof obstacle === 'string') {
                        const obstacleElement = document.querySelector(obstacle);
                        if (obstacleElement) {
                            const obstacleRect = obstacleElement.getBoundingClientRect();
                            obstacleX = obstacleRect.left + obstacleRect.width / 2 - window.innerWidth / 2;
                            obstacleY = obstacleRect.top + obstacleRect.height / 2 - window.innerHeight / 2;
                        } else {
                            return;
                        }
                    } else {
                        obstacleX = obstacle.x - window.innerWidth / 2;
                        obstacleY = obstacle.y - window.innerHeight / 2;
                    }

                    const distance = Math.sqrt(
                        Math.pow(nextX - obstacleX, 2) + 
                        Math.pow(nextY - obstacleY, 2)
                    );

                    if (distance < avoidanceDistance) {
                        hasCollision = true;
                        // Calculate avoidance vector
                        const angle = Math.atan2(nextY - obstacleY, nextX - obstacleX);
                        const avoidanceX = obstacleX + Math.cos(angle) * avoidanceDistance;
                        const avoidanceY = obstacleY + Math.sin(angle) * avoidanceDistance;
                        
                        currentX = avoidanceX;
                        currentY = avoidanceY;
                    }
                });

                if (!hasCollision) {
                    currentX = nextX;
                    currentY = nextY;
                }
            }

            this.positionController.setOffset(currentX, currentY, 0);
        };

        navigate();
    }

    /**
     * Move mascot to element with audio-reactive movement
     * @param {string} targetSelector - CSS selector for target element
     * @param {MediaStream} audioStream - Audio stream for analysis
     * @param {number} sensitivity - Audio sensitivity multiplier
     * @param {string} position - Position relative to element
     * @param {Object} offset - Pixel offset
     */
    moveToElementWithAudio(targetSelector, audioStream, sensitivity = 50, position = 'right', offset = { x: 20, y: 0 }) {
        const element = document.querySelector(targetSelector);
        if (!element) {
            console.warn(`Element not found: ${targetSelector}`);
            return;
        }

        // Initialize audio context if not already done
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.audioAnalyser = this.audioContext.createAnalyser();
            this.audioAnalyser.fftSize = 256;
        }

        const source = this.audioContext.createMediaStreamSource(audioStream);
        source.connect(this.audioAnalyser);

        const audioData = new Uint8Array(this.audioAnalyser.frequencyBinCount);
        const rect = element.getBoundingClientRect();
        const baseX = rect.left + rect.width / 2 + offset.x - window.innerWidth / 2;
        const baseY = rect.top + rect.height / 2 + offset.y - window.innerHeight / 2;

        let rafId = null;
        const updatePosition = () => {
            this.audioAnalyser.getByteFrequencyData(audioData);

            let sum = 0;
            for (let i = 0; i < audioData.length; i++) {
                sum += audioData[i];
            }
            const averageLevel = (sum / audioData.length) / 255;

            const audioOffset = averageLevel * sensitivity;
            const currentX = baseX + audioOffset;
            const currentY = baseY + (audioOffset * 0.5);

            this.positionController.setOffset(currentX, currentY, 0);

            // Remove old RAF ID and add new one
            if (rafId !== null) {
                this.activeRAFIds.delete(rafId);
            }
            rafId = requestAnimationFrame(updatePosition);
            this.activeRAFIds.add(rafId);
        };

        updatePosition();
    }

    /**
     * Move mascot to element following user's gaze
     * @param {string} targetSelector - CSS selector for target element
     * @param {Object} gazeOptions - Gaze tracking options
     * @param {string} position - Position relative to element
     * @param {Object} offset - Pixel offset
     */
    moveToElementWithGaze(targetSelector, gazeOptions = {}, position = 'right', offset = { x: 20, y: 0 }) {
        const element = document.querySelector(targetSelector);
        if (!element) {
            console.warn(`Element not found: ${targetSelector}`);
            return;
        }

        // Initialize gaze tracker if not already done
        if (!this.gazeTracker) {
            this.gazeTracker = {
                x: window.innerWidth / 2,
                y: window.innerHeight / 2
            };
        }

        const rect = element.getBoundingClientRect();
        const targetX = rect.left + rect.width / 2 + offset.x - window.innerWidth / 2;
        const targetY = rect.top + rect.height / 2 + offset.y - window.innerHeight / 2;

        let rafId = null;
        const updatePosition = () => {
            // Simulate gaze tracking (replace with actual gaze tracking implementation)
            const gazeX = this.gazeTracker.x - window.innerWidth / 2;
            const gazeY = this.gazeTracker.y - window.innerHeight / 2;

            // Interpolate between gaze position and target
            const gazeWeight = gazeOptions.gazeWeight || 0.3;
            const currentX = targetX + (gazeX - targetX) * gazeWeight;
            const currentY = targetY + (gazeY - targetY) * gazeWeight;

            this.positionController.setOffset(currentX, currentY, 0);

            // Remove old RAF ID and add new one
            if (rafId !== null) {
                this.activeRAFIds.delete(rafId);
            }
            rafId = requestAnimationFrame(updatePosition);
            this.activeRAFIds.add(rafId);
        };

        updatePosition();
    }

    /**
     * Add obstacle for collision detection
     * @param {string|Object} obstacle - Obstacle selector or position object
     */
    addObstacle(obstacle) {
        this.obstacles.add(obstacle);
    }

    /**
     * Remove obstacle from collision detection
     * @param {string|Object} obstacle - Obstacle to remove
     */
    removeObstacle(obstacle) {
        this.obstacles.delete(obstacle);
    }

    /**
     * Clear all obstacles
     */
    clearObstacles() {
        this.obstacles.clear();
    }

    /**
     * Destroy the advanced targeting system
     */
    destroy() {
        // Cancel all path-based RAF loops
        const activePathEntries = Array.from(this.activePaths.values());
        activePathEntries.forEach(entry => {
            if (entry && typeof entry.stop === 'function') {
                entry.stop();
            } else if (entry && entry.frameId) {
                cancelAnimationFrame(entry.frameId);
            }
        });
        this.activePaths.clear();

        // Cancel all tracked RAF IDs (audio, gaze, etc.)
        this.activeRAFIds.forEach(rafId => {
            cancelAnimationFrame(rafId);
        });
        this.activeRAFIds.clear();

        // Cancel all smooth animation RAF IDs
        this.activeSmoothAnimations.forEach(rafId => {
            cancelAnimationFrame(rafId);
        });
        this.activeSmoothAnimations.clear();

        this.obstacles.clear();

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        this.audioAnalyser = null;
        this.gazeTracker = null;
        
        super.destroy();
    }
}

export default ElementTargetingAdvanced;








