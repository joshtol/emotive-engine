/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Physics-Based Positioning
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Physics-based positioning methods for natural mascot movement
 * @author Emotive Engine Team
 * @module positioning/Physics
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Provides physics-based positioning methods like gravity, magnetism, and avoidance.
 * ║ Creates natural, organic movement patterns for the mascot.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

class Physics {
    constructor(positionController) {
        this.positionController = positionController;
        this.isRunning = false;
        this.physicsCallbacks = new Map();
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.lastTime = 0;
    }

    /**
     * Move mascot to grid position
     * @param {number} x - Grid X coordinate
     * @param {number} y - Grid Y coordinate
     * @param {Object} offset - Pixel offset
     * @param {Object} options - Grid options
     */
    moveToGrid(x, y, offset = { x: 0, y: 0 }, options = {}) {
        const gridSize = options.gridSize || 100;
        const targetX = x * gridSize + offset.x;
        const targetY = y * gridSize + offset.y;

        // Convert to mascot coordinate system
        const mascotX = targetX - window.innerWidth / 2;
        const mascotY = targetY - window.innerHeight / 2;

        if (options.animate !== false) {
            this.positionController.animateOffset(
                mascotX,
                mascotY,
                0,
                options.duration || 1000,
                options.easing || 'easeOutCubic'
            );
        } else {
            this.positionController.setOffset(mascotX, mascotY, 0);
        }
    }

    /**
     * Apply gravity effect to mascot
     * @param {Object} center - {x, y} gravity center
     * @param {number} strength - Gravity strength
     * @param {Object} options - Gravity options
     */
    moveToGravity(center = { x: 0, y: 0 }, strength = 0.1, options = {}) {
        const callbackId = 'gravity';

        const applyGravity = currentTime => {
            if (!this.isRunning) return;

            const deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;

            if (deltaTime > 0) {
                // Get current position
                const currentOffset = this.positionController.getOffset();
                const currentX = currentOffset.x;
                const currentY = currentOffset.y;

                // Calculate distance to gravity center
                const dx = center.x - currentX;
                const dy = center.y - currentY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > 0) {
                    // Apply gravity force
                    const force = strength / (distance * distance);
                    this.acceleration.x = (dx / distance) * force;
                    this.acceleration.y = (dy / distance) * force;

                    // Update velocity
                    this.velocity.x += this.acceleration.x * deltaTime;
                    this.velocity.y += this.acceleration.y * deltaTime;

                    // Apply damping
                    const damping = options.damping || 0.98;
                    this.velocity.x *= damping;
                    this.velocity.y *= damping;

                    // Update position
                    const newX = currentX + this.velocity.x * deltaTime;
                    const newY = currentY + this.velocity.y * deltaTime;

                    this.positionController.setOffset(newX, newY, 0);
                }
            }

            if (this.isRunning) {
                requestAnimationFrame(applyGravity);
            }
        };

        this.physicsCallbacks.set(callbackId, applyGravity);
        this.isRunning = true;
        this.lastTime = performance.now();
        applyGravity(this.lastTime);

        return () => {
            this.isRunning = false;
            this.physicsCallbacks.delete(callbackId);
        };
    }

    /**
     * Apply magnetic attraction to elements
     * @param {Array} targets - Array of target elements or positions
     * @param {number} strength - Magnetic strength
     * @param {Object} options - Magnetic options
     */
    moveToMagnetic(targets = [], strength = 0.05, options = {}) {
        const callbackId = 'magnetic';

        const applyMagnetism = currentTime => {
            if (!this.isRunning) return;

            const deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;

            if (deltaTime > 0) {
                // Get current position
                const currentOffset = this.positionController.getOffset();
                const currentX = currentOffset.x;
                const currentY = currentOffset.y;

                let totalForceX = 0;
                let totalForceY = 0;

                // Calculate forces from all targets
                targets.forEach(target => {
                    let targetX, targetY;

                    if (typeof target === 'string') {
                        // CSS selector
                        const element = document.querySelector(target);
                        if (element) {
                            const rect = element.getBoundingClientRect();
                            targetX = rect.left + rect.width / 2 - window.innerWidth / 2;
                            targetY = rect.top + rect.height / 2 - window.innerHeight / 2;
                        } else {
                            return;
                        }
                    } else if (target.x !== undefined && target.y !== undefined) {
                        // Position object
                        targetX = target.x - window.innerWidth / 2;
                        targetY = target.y - window.innerHeight / 2;
                    } else {
                        return;
                    }

                    // Calculate distance and force
                    const dx = targetX - currentX;
                    const dy = targetY - currentY;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance > 0) {
                        const force = strength / (distance * distance);
                        totalForceX += (dx / distance) * force;
                        totalForceY += (dy / distance) * force;
                    }
                });

                // Apply magnetic force
                this.acceleration.x = totalForceX;
                this.acceleration.y = totalForceY;

                // Update velocity
                this.velocity.x += this.acceleration.x * deltaTime;
                this.velocity.y += this.acceleration.y * deltaTime;

                // Apply damping
                const damping = options.damping || 0.95;
                this.velocity.x *= damping;
                this.velocity.y *= damping;

                // Update position
                const newX = currentX + this.velocity.x * deltaTime;
                const newY = currentY + this.velocity.y * deltaTime;

                this.positionController.setOffset(newX, newY, 0);
            }

            if (this.isRunning) {
                requestAnimationFrame(applyMagnetism);
            }
        };

        this.physicsCallbacks.set(callbackId, applyMagnetism);
        this.isRunning = true;
        this.lastTime = performance.now();
        applyMagnetism(this.lastTime);

        return () => {
            this.isRunning = false;
            this.physicsCallbacks.delete(callbackId);
        };
    }

    /**
     * Avoid obstacles and elements
     * @param {Array} obstacles - Array of obstacle elements or positions
     * @param {number} distance - Minimum distance to maintain
     * @param {Object} options - Avoidance options
     */
    moveToAvoid(obstacles = [], distance = 100, options = {}) {
        const callbackId = 'avoid';

        const applyAvoidance = currentTime => {
            if (!this.isRunning) return;

            const deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;

            if (deltaTime > 0) {
                // Get current position
                const currentOffset = this.positionController.getOffset();
                const currentX = currentOffset.x;
                const currentY = currentOffset.y;

                let totalForceX = 0;
                let totalForceY = 0;

                // Calculate avoidance forces from all obstacles
                obstacles.forEach(obstacle => {
                    let obstacleX, obstacleY;

                    if (typeof obstacle === 'string') {
                        // CSS selector
                        const element = document.querySelector(obstacle);
                        if (element) {
                            const rect = element.getBoundingClientRect();
                            obstacleX = rect.left + rect.width / 2 - window.innerWidth / 2;
                            obstacleY = rect.top + rect.height / 2 - window.innerHeight / 2;
                        } else {
                            return;
                        }
                    } else if (obstacle.x !== undefined && obstacle.y !== undefined) {
                        // Position object
                        obstacleX = obstacle.x - window.innerWidth / 2;
                        obstacleY = obstacle.y - window.innerHeight / 2;
                    } else {
                        return;
                    }

                    // Calculate distance to obstacle
                    const dx = currentX - obstacleX;
                    const dy = currentY - obstacleY;
                    const obstacleDistance = Math.sqrt(dx * dx + dy * dy);

                    if (obstacleDistance < distance && obstacleDistance > 0) {
                        // Apply repulsion force
                        const force = (distance - obstacleDistance) / distance;
                        totalForceX += (dx / obstacleDistance) * force;
                        totalForceY += (dy / obstacleDistance) * force;
                    }
                });

                // Apply avoidance force
                this.acceleration.x = totalForceX;
                this.acceleration.y = totalForceY;

                // Update velocity
                this.velocity.x += this.acceleration.x * deltaTime;
                this.velocity.y += this.acceleration.y * deltaTime;

                // Apply damping
                const damping = options.damping || 0.9;
                this.velocity.x *= damping;
                this.velocity.y *= damping;

                // Update position
                const newX = currentX + this.velocity.x * deltaTime;
                const newY = currentY + this.velocity.y * deltaTime;

                this.positionController.setOffset(newX, newY, 0);
            }

            if (this.isRunning) {
                requestAnimationFrame(applyAvoidance);
            }
        };

        this.physicsCallbacks.set(callbackId, applyAvoidance);
        this.isRunning = true;
        this.lastTime = performance.now();
        applyAvoidance(this.lastTime);

        return () => {
            this.isRunning = false;
            this.physicsCallbacks.delete(callbackId);
        };
    }

    /**
     * Move mascot to random positions within bounds
     * @param {Object} bounds - {x, y, width, height} bounds
     * @param {number} frequency - How often to change position (ms)
     * @param {Object} options - Random movement options
     */
    moveToRandom(bounds = { x: 0, y: 0, width: 400, height: 400 }, frequency = 3000, options = {}) {
        const callbackId = 'random';

        const randomizePosition = () => {
            if (!this.isRunning) return;

            const randomX = bounds.x + Math.random() * bounds.width;
            const randomY = bounds.y + Math.random() * bounds.height;

            // Convert to mascot coordinate system
            const mascotX = randomX - window.innerWidth / 2;
            const mascotY = randomY - window.innerHeight / 2;

            if (options.animate !== false) {
                this.positionController.animateOffset(
                    mascotX,
                    mascotY,
                    0,
                    options.duration || 1000,
                    options.easing || 'easeOutCubic'
                );
            } else {
                this.positionController.setOffset(mascotX, mascotY, 0);
            }

            if (this.isRunning) {
                setTimeout(randomizePosition, frequency);
            }
        };

        this.physicsCallbacks.set(callbackId, randomizePosition);
        this.isRunning = true;
        randomizePosition();

        return () => {
            this.isRunning = false;
            this.physicsCallbacks.delete(callbackId);
        };
    }

    /**
     * Stop all physics simulations
     */
    stopAllPhysics() {
        this.isRunning = false;
        this.physicsCallbacks.clear();
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
    }

    /**
     * Destroy the physics system
     */
    destroy() {
        this.stopAllPhysics();
        this.positionController = null;
    }
}

export default Physics;
