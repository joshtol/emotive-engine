/**
 * Core3DManager - Main orchestrator for 3D rendering
 *
 * Manages:
 * - WebGL context
 * - 3D geometry selection
 * - Animation playback
 * - Material/shader updates
 */

import { WebGLRenderer } from './renderer/WebGLRenderer.js';
import { RenderPipeline } from './renderer/RenderPipeline.js';
import { GeometryPass } from './passes/GeometryPass.js';
import { CORE_GEOMETRIES } from './geometries/index.js';
import { ProceduralAnimator } from './animation/ProceduralAnimator.js';
import { getEmotion } from '../core/emotions/index.js';
import { getGesture } from '../core/gestures/index.js';

export class Core3DManager {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.options = options;

        // Create WebGL renderer
        const renderer = new WebGLRenderer(canvas);

        // Create render pipeline with modular architecture
        this.pipeline = new RenderPipeline(renderer);
        this.pipeline.addPass(new GeometryPass());

        // Backward compatibility - expose renderer property
        this.renderer = renderer;

        // Camera setup (closer and looking straight at origin)
        this.cameraPosition = [0, 0, 3];
        this.cameraTarget = [0, 0, 0];

        // Matrices
        this.projectionMatrix = this.createPerspectiveMatrix();
        this.viewMatrix = this.createViewMatrix();

        // Load geometry
        this.geometryType = options.geometry || 'sphere';
        this.geometry = CORE_GEOMETRIES[this.geometryType];

        if (!this.geometry) {
            console.warn(`Unknown geometry: ${this.geometryType}, falling back to sphere`);
            this.geometry = CORE_GEOMETRIES.sphere;
        }

        // Animation controller
        this.animator = new ProceduralAnimator();

        // Current state
        this.emotion = options.emotion || 'neutral';
        this.glowColor = [1.0, 1.0, 1.0]; // RGB
        this.glowIntensity = 1.0;
        this.rotation = [0, 0, 0]; // Euler angles (x, y, z)
        // Match 2D sizing: core is 1/12th of canvas size (coreSizeDivisor: 12)
        // In WebGL NDC space (-1 to 1), this translates to a smaller scale value
        // Default 0.16 matches 2D proportions, but can be overridden via options.coreScale
        this.baseScale = options.coreScale || 0.16; // Properly sized core relative to particles
        this.scale = this.baseScale; // Current scale (base + animation)
        this.position = [0, 0, 0];
        this.renderMode = 0; // 0=standard, 1=normals, 2=toon, 3=edge
        this.wireframeEnabled = false;

        // Initialize emotion
        this.setEmotion(this.emotion);
    }

    /**
     * Set emotional state
     * Updates glow color and triggers emotion animation
     */
    setEmotion(emotion) {
        this.emotion = emotion;

        // Get emotion color and intensity from existing emotion system
        const emotionData = getEmotion(emotion);
        if (emotionData && emotionData.visual) {
            // Convert hex to RGB
            if (emotionData.visual.glowColor) {
                this.glowColor = this.hexToRGB(emotionData.visual.glowColor);
            }
            // Set intensity from emotion data
            if (emotionData.visual.glowIntensity !== undefined) {
                this.glowIntensity = emotionData.visual.glowIntensity;
            }
        }

        // Trigger emotion animation
        this.animator.playEmotion(emotion, {
            onUpdate: props => {
                // Update properties from animation (multiplicative for scale)
                if (props.scale !== undefined) this.scale = this.baseScale * props.scale;
                if (props.glowIntensity !== undefined) this.glowIntensity = props.glowIntensity;
                if (props.position) this.position = props.position;
                if (props.rotation) this.rotation = props.rotation;
            }
        });
    }

    /**
     * Play gesture animation using 2D gesture data translated to 3D
     */
    playGesture(gestureName) {
        // Get the 2D gesture definition
        const gesture2D = getGesture(gestureName);

        if (!gesture2D) {
            console.warn(`Unknown gesture: ${gestureName}`);
            return;
        }

        // Create a virtual particle to extract gesture behavior
        const virtualParticle = {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            size: 1,
            baseSize: 1,
            opacity: 1,
            scaleFactor: 1,
            gestureData: {}  // Initialize as object for gestures to use
        };

        // Get gesture config for duration
        const config = gesture2D.config || {};
        const duration = config.musicalDuration?.musical
            ? (config.musicalDuration.beats || 2) * 500  // Assume 120 BPM (500ms per beat)
            : (config.duration || 800);

        // Start time-based animation
        const startTime = this.animator.time;
        const gestureState = {
            virtualParticle,
            gesture: gesture2D,
            duration,
            startTime,
            startPosition: [...this.position],
            startRotation: [...this.rotation],
            startScale: this.scale
        };

        // Add to animator's active animations
        this.animator.animations.push({
            duration,
            startTime,
            evaluate: t => {
                // Reset virtual particle to center each frame
                virtualParticle.x = 0;
                virtualParticle.y = 0;
                virtualParticle.vx = 0;
                virtualParticle.vy = 0;
                virtualParticle.size = 1;
                virtualParticle.opacity = 1;
                virtualParticle.z = 0;

                // If gesture has 3D section, check if we should use it exclusively
                const has3DSection = gesture2D['3d'] && gesture2D['3d'].evaluate;

                // Apply 2D gesture to get particle position (unless it's a placeholder)
                let hasParticleMotion = false;
                if (gesture2D.apply) {
                    const motion = { ...config };

                    // Special case: orbit gesture has non-standard signature
                    if (gestureName === 'orbit') {
                        // orbit expects: applyOrbit(particle, gestureData, config, progress, strength, centerX, centerY)
                        gesture2D.apply(virtualParticle, virtualParticle.gestureData, motion, t, motion.strength || 1.0, 0, 0);
                        hasParticleMotion = true;
                    } else {
                        // Standard signature: apply(particle, progress, motion, dt, centerX, centerY)
                        const result = gesture2D.apply(virtualParticle, t, motion, 1, 0, 0);
                        // Check if apply actually did something (not a placeholder no-op)
                        hasParticleMotion = result !== false;

                        // Accumulate velocity into position for blending gestures
                        if (hasParticleMotion) {
                            virtualParticle.x += virtualParticle.vx * 2.0;  // Increase accumulation
                            virtualParticle.y += virtualParticle.vy * 2.0;
                        }
                    }
                }

                // If gesture has meaningful 2D particle motion, use it for position
                if (hasParticleMotion || !has3DSection) {
                    // Translate particle position to 3D core position
                    const baseTransform = this.translate2DTo3D(virtualParticle, t, gesture2D, gestureState);

                    if (has3DSection) {
                        // Combine: particle position + 3D rotation/scale
                        const motion = {
                            ...config,
                            particle: virtualParticle,
                            config,
                            strength: config.strength || 1.0
                        };
                        const additionalTransform = gesture2D['3d'].evaluate(t, motion);

                        return {
                            position: baseTransform.position,  // XY from particle, Z from particle
                            rotation: additionalTransform.rotation || baseTransform.rotation,
                            scale: additionalTransform.scale || baseTransform.scale,
                            glowIntensity: additionalTransform.glowIntensity || baseTransform.glowIntensity
                        };
                    } else {
                        // No 3D section, use particle-based translation only
                        return baseTransform;
                    }
                } else {
                    // Placeholder gesture - use ONLY 3D section
                    if (!has3DSection) {
                        console.warn(`Gesture ${gestureName} has no particle motion and no 3D section`);
                        return {
                            position: [0, 0, 0],
                            rotation: [0, 0, 0],
                            scale: 1.0
                        };
                    }
                    const motion = {
                        ...config,
                        particle: virtualParticle,
                        config,
                        strength: config.strength || 1.0
                    };
                    return gesture2D['3d'].evaluate(t, motion);
                }
            },
            callbacks: {
                onUpdate: props => {
                    if (props.position) this.position = props.position;
                    if (props.rotation) this.rotation = props.rotation;
                    if (props.scale !== undefined) this.scale = this.baseScale * props.scale;
                    if (props.glowIntensity !== undefined) this.glowIntensity = props.glowIntensity;
                },
                onComplete: () => {
                    // Clean up gesture
                    if (gesture2D.cleanup) {
                        gesture2D.cleanup(virtualParticle);
                    }
                    // Reset to base state
                    this.position = [0, 0, 0];
                    this.rotation = [0, 0, 0];
                    this.scale = this.baseScale;
                }
            }
        });
    }

    /**
     * Translate 2D particle behavior to 3D transforms
     * Maps particle x/y/vx/vy/size changes to 3D position/rotation/scale
     *
     * COORDINATE SYSTEM:
     * position[0] = horizontal (left-right)
     * position[1] = vertical (up-down)
     * position[2] = depth (forward-back toward/away from camera)
     */
    translate2DTo3D(particle, progress, gesture, _gestureState) {
        const props = {
            position: [0, 0, 0],  // Always reset to center
            rotation: [0, 0, 0],  // Always reset rotation
            scale: 1.0
        };

        const gestureName = gesture.name;

        // ===== MOTION GESTURES (Blending) =====

        if (gestureName === 'bounce') {
            // Vertical bouncing motion
            props.position[0] = 0;
            props.position[1] = particle.vy * 0.02;  // Vertical bounce
            props.position[2] = 0;
            props.scale = 1.0 + Math.abs(particle.vy) * 0.005;  // Squash/stretch

        } else if (gestureName === 'pulse') {
            // Radial expansion/contraction
            const distanceFromCenter = Math.sqrt(particle.x * particle.x + particle.y * particle.y);
            props.position[0] = 0;
            props.position[1] = 0;
            props.position[2] = 0;
            props.scale = 1.0 + distanceFromCenter * 0.01;

        } else if (gestureName === 'shake') {
            // Chaotic shaking in all directions
            props.position[0] = particle.x * 0.05;  // Horizontal shake
            props.position[1] = particle.y * 0.05;  // Vertical shake
            props.position[2] = 0;
            props.rotation[2] = particle.vx * 0.01;  // Roll with horizontal movement

        } else if (gestureName === 'nod') {
            // Vertical nodding motion (up-down head bob)
            props.position[0] = 0;
            props.position[1] = particle.y * 0.05;  // Vertical nod position
            props.position[2] = 0;
            props.rotation[0] = particle.vy * 0.02;  // Pitch rotation

        } else if (gestureName === 'vibrate') {
            // High-frequency micro-movements
            props.position[0] = particle.x * 0.03;
            props.position[1] = particle.y * 0.03;
            props.position[2] = 0;
            props.rotation[2] = particle.vx * 0.005;  // Slight roll

        } else if (gestureName === 'orbit') {
            // Circular orbiting motion
            props.position[0] = particle.x * 0.003;  // Horizontal orbit
            props.position[1] = -particle.y * 0.003;  // Vertical orbit (negated)
            props.position[2] = particle.z || 0;

        } else if (gestureName === 'twitch') {
            // Sudden jerky movements
            props.position[0] = particle.x * 0.04;
            props.position[1] = particle.y * 0.04;
            props.position[2] = 0;
            props.rotation[0] = particle.vy * 0.01;
            props.rotation[1] = particle.vx * 0.01;

        } else if (gestureName === 'sway') {
            // Gentle side-to-side swaying
            props.position[0] = particle.x * 0.05;  // Horizontal sway
            props.position[1] = particle.y * 0.02;  // Slight vertical drift
            props.position[2] = 0;
            props.rotation[2] = particle.x * 0.008;  // Roll with sway

        } else if (gestureName === 'float') {
            // Upward floating motion
            props.position[0] = 0;
            props.position[1] = -particle.vy * 0.02;  // Upward float
            props.position[2] = (particle.size - 1) * 0.3;  // Depth based on size
            props.scale = 1.0 + (particle.size - 1) * 0.2;

        } else if (gestureName === 'jitter') {
            // Nervous jittery movement
            props.position[0] = particle.x * 0.04;
            props.position[1] = particle.y * 0.04;
            props.position[2] = 0;

        } else if (gestureName === 'wiggle') {
            // Horizontal side-to-side wiggle
            props.position[0] = particle.x * 0.05;  // Horizontal wiggle
            props.position[1] = 0;
            props.position[2] = 0;

            // ===== TRANSFORM GESTURES (Override) =====

        } else if (gestureName === 'spin') {
            // Spinning rotation around Y-axis
            const angle = Math.atan2(particle.y, particle.x);
            props.position[0] = 0;
            props.position[1] = 0;
            props.position[2] = 0;
            props.rotation[1] = angle;  // Yaw rotation for spin

        } else if (gestureName === 'jump') {
            // Vertical jumping with arc
            props.position[0] = particle.x * 0.01;  // Slight horizontal drift
            props.position[1] = particle.y * 0.01;  // Vertical jump height
            props.position[2] = 0;
            props.scale = 1.0 + (particle.size - 1) * 0.3;  // Squash/stretch

        } else if (gestureName === 'morph') {
            // Size/shape morphing
            props.position[0] = 0;
            props.position[1] = 0;
            props.position[2] = 0;
            props.scale = particle.size || 1.0;

        } else if (gestureName === 'stretch') {
            // Stretching in direction of movement
            props.position[0] = particle.x * 0.01;
            props.position[1] = particle.y * 0.01;
            props.position[2] = 0;
            props.scale = 1.0 + Math.abs(particle.vy) * 0.01;

        } else if (gestureName === 'tilt') {
            // Tilting/leaning to the side
            props.position[0] = particle.x * 0.03;
            props.position[1] = 0;
            props.position[2] = 0;
            props.rotation[2] = particle.x * 0.015;  // Roll for tilt

        } else if (gestureName === 'orbital') {
            // Large orbital motion
            const angle = Math.atan2(particle.y, particle.x);
            const radius = Math.sqrt(particle.x * particle.x + particle.y * particle.y);
            props.position[0] = Math.cos(angle) * radius * 0.005;
            props.position[1] = Math.sin(angle) * radius * 0.005;
            props.position[2] = 0;
            props.rotation[1] = angle;  // Face direction of movement

        } else if (gestureName === 'hula') {
            // Circular hip motion
            props.position[0] = particle.x * 0.004;
            props.position[1] = particle.y * 0.004;
            props.position[2] = 0;
            props.rotation[1] = Math.atan2(particle.y, particle.x) * 0.5;  // Partial rotation

        } else if (gestureName === 'scan') {
            // Scanning left-right motion
            props.position[0] = particle.x * 0.03;  // Horizontal scan
            props.position[1] = 0;
            props.position[2] = 0;
            props.rotation[1] = particle.x * 0.01;  // Turn head while scanning

        } else if (gestureName === 'twist') {
            // Twisting rotation
            props.position[0] = 0;
            props.position[1] = 0;
            props.position[2] = 0;
            props.rotation[1] = progress * Math.PI * 2;  // Full rotation

        } else {
            // ===== GENERIC FALLBACK =====
            // For unknown gestures, map accumulated position to 3D
            props.position[0] = particle.x * 0.01;  // Horizontal from accumulated x
            props.position[1] = particle.y * 0.01;  // Vertical from accumulated y
            props.position[2] = 0;

            // Size change affects scale
            if (particle.size !== 1) {
                props.scale = particle.size;
            }
        }

        return props;
    }

    /**
     * Morph to different shape
     */
    morphToShape(shapeName) {
        const targetGeometry = CORE_GEOMETRIES[shapeName];
        if (!targetGeometry) {
            console.warn(`Unknown shape: ${shapeName}`);
            return;
        }

        // Start morph animation
        this.animator.playMorph(this.geometry, targetGeometry, {
            duration: 1000,
            onUpdate: blendedGeometry => {
                this.geometry = blendedGeometry;
            },
            onComplete: () => {
                this.geometry = targetGeometry;
                this.geometryType = shapeName;
            }
        });
    }

    /**
     * Render frame
     */
    render(deltaTime) {
        // Update animations
        this.animator.update(deltaTime);

        // Auto-rotate based on emotion
        this.rotation[1] += deltaTime * 0.0003; // Slow Y rotation

        // Prepare scene data for pipeline
        const scene = {
            geometry: this.geometry,
            modelMatrix: this.createModelMatrix(this.position, this.rotation, this.scale),
            glowColor: this.glowColor,
            glowIntensity: this.glowIntensity,
            renderMode: this.renderMode,
            wireframeEnabled: this.wireframeEnabled
        };

        // Prepare camera data for pipeline
        const camera = {
            viewMatrix: this.viewMatrix,
            projectionMatrix: this.projectionMatrix,
            position: this.cameraPosition
        };

        // Execute render pipeline
        this.pipeline.render(scene, camera);
    }

    /**
     * Convert hex color to RGB array
     */
    hexToRGB(hex) {
        // Remove # if present
        hex = hex.replace('#', '');

        // Parse
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;

        return [r, g, b];
    }

    /**
     * Create model matrix (TRS: Translate, Rotate, Scale)
     */
    createModelMatrix(position, rotation, scale) {
        const mat = this.identity();

        // Translate
        this.translate(mat, position);

        // Rotate (X, Y, Z order)
        this.rotateX(mat, rotation[0]);
        this.rotateY(mat, rotation[1]);
        this.rotateZ(mat, rotation[2]);

        // Scale
        this.scaleMatrix(mat, [scale, scale, scale]);

        return mat;
    }

    /**
     * Create perspective projection matrix
     */
    createPerspectiveMatrix() {
        const fov = 45 * Math.PI / 180;
        const aspect = this.canvas.width / this.canvas.height;
        const near = 0.1;
        const far = 100.0;

        const f = 1.0 / Math.tan(fov / 2);
        const rangeInv = 1 / (near - far);

        return new Float32Array([
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ]);
    }

    /**
     * Create view matrix (lookAt)
     */
    createViewMatrix() {
        // Simple lookAt implementation
        const eye = this.cameraPosition;
        const center = this.cameraTarget;
        const up = [0, 1, 0];

        // Forward
        const fx = center[0] - eye[0];
        const fy = center[1] - eye[1];
        const fz = center[2] - eye[2];
        const fLen = Math.sqrt(fx*fx + fy*fy + fz*fz);
        const f = [fx/fLen, fy/fLen, fz/fLen];

        // Right = forward × up
        const rx = f[1]*up[2] - f[2]*up[1];
        const ry = f[2]*up[0] - f[0]*up[2];
        const rz = f[0]*up[1] - f[1]*up[0];
        const rLen = Math.sqrt(rx*rx + ry*ry + rz*rz);
        const r = [rx/rLen, ry/rLen, rz/rLen];

        // Up = right × forward
        const ux = r[1]*f[2] - r[2]*f[1];
        const uy = r[2]*f[0] - r[0]*f[2];
        const uz = r[0]*f[1] - r[1]*f[0];

        return new Float32Array([
            r[0], ux, -f[0], 0,
            r[1], uy, -f[1], 0,
            r[2], uz, -f[2], 0,
            -(r[0]*eye[0] + r[1]*eye[1] + r[2]*eye[2]),
            -(ux*eye[0] + uy*eye[1] + uz*eye[2]),
            f[0]*eye[0] + f[1]*eye[1] + f[2]*eye[2],
            1
        ]);
    }

    // Matrix utility functions
    identity() {
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    translate(mat, vec) {
        mat[12] += mat[0] * vec[0] + mat[4] * vec[1] + mat[8] * vec[2];
        mat[13] += mat[1] * vec[0] + mat[5] * vec[1] + mat[9] * vec[2];
        mat[14] += mat[2] * vec[0] + mat[6] * vec[1] + mat[10] * vec[2];
        mat[15] += mat[3] * vec[0] + mat[7] * vec[1] + mat[11] * vec[2];
    }

    rotateX(mat, angle) {
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        const a10 = mat[4];
        const a11 = mat[5];
        const a12 = mat[6];
        const a13 = mat[7];
        const a20 = mat[8];
        const a21 = mat[9];
        const a22 = mat[10];
        const a23 = mat[11];

        mat[4] = a10 * c + a20 * s;
        mat[5] = a11 * c + a21 * s;
        mat[6] = a12 * c + a22 * s;
        mat[7] = a13 * c + a23 * s;
        mat[8] = a20 * c - a10 * s;
        mat[9] = a21 * c - a11 * s;
        mat[10] = a22 * c - a12 * s;
        mat[11] = a23 * c - a13 * s;
    }

    rotateY(mat, angle) {
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        const a00 = mat[0];
        const a01 = mat[1];
        const a02 = mat[2];
        const a03 = mat[3];
        const a20 = mat[8];
        const a21 = mat[9];
        const a22 = mat[10];
        const a23 = mat[11];

        mat[0] = a00 * c - a20 * s;
        mat[1] = a01 * c - a21 * s;
        mat[2] = a02 * c - a22 * s;
        mat[3] = a03 * c - a23 * s;
        mat[8] = a00 * s + a20 * c;
        mat[9] = a01 * s + a21 * c;
        mat[10] = a02 * s + a22 * c;
        mat[11] = a03 * s + a23 * c;
    }

    rotateZ(mat, angle) {
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        const a00 = mat[0];
        const a01 = mat[1];
        const a02 = mat[2];
        const a03 = mat[3];
        const a10 = mat[4];
        const a11 = mat[5];
        const a12 = mat[6];
        const a13 = mat[7];

        mat[0] = a00 * c + a10 * s;
        mat[1] = a01 * c + a11 * s;
        mat[2] = a02 * c + a12 * s;
        mat[3] = a03 * c + a13 * s;
        mat[4] = a10 * c - a00 * s;
        mat[5] = a11 * c - a01 * s;
        mat[6] = a12 * c - a02 * s;
        mat[7] = a13 * c - a03 * s;
    }

    scaleMatrix(mat, vec) {
        mat[0] *= vec[0];
        mat[1] *= vec[0];
        mat[2] *= vec[0];
        mat[3] *= vec[0];
        mat[4] *= vec[1];
        mat[5] *= vec[1];
        mat[6] *= vec[1];
        mat[7] *= vec[1];
        mat[8] *= vec[2];
        mat[9] *= vec[2];
        mat[10] *= vec[2];
        mat[11] *= vec[2];
    }

    /**
     * Cleanup
     */
    destroy() {
        this.renderer.destroy();
        this.animator.stopAll();
    }
}
