/**
 * Example Gesture Plugin - Demonstrates how to create custom gestures
 * This example adds "dance", "spin", and "teleport" gestures
 */

export const DanceGesturePlugin = {
    name: 'dance-gesture',
    version: '1.0.0',
    type: 'gesture',
    description: 'Adds a dance gesture with rhythmic movements',
    author: 'Example',
    
    gesture: {
        name: 'dance',
        duration: 2000,
        keyframes: [
            { time: 0, x: 0, y: 0, scale: 1, rotation: 0 },
            { time: 0.125, x: -10, y: -5, scale: 1.1, rotation: -15 },
            { time: 0.25, x: 10, y: 0, scale: 0.9, rotation: 15 },
            { time: 0.375, x: -10, y: -5, scale: 1.1, rotation: -15 },
            { time: 0.5, x: 0, y: -10, scale: 1.2, rotation: 0 },
            { time: 0.625, x: 10, y: -5, scale: 1.1, rotation: 15 },
            { time: 0.75, x: -10, y: 0, scale: 0.9, rotation: -15 },
            { time: 0.875, x: 10, y: -5, scale: 1.1, rotation: 15 },
            { time: 1, x: 0, y: 0, scale: 1, rotation: 0 }
        ],
        compatibility: {
            canInterrupt: ['idle', 'think'],
            cannotInterrupt: ['teleport', 'explode'],
            canChain: ['spin', 'wobble'],
            exclusive: false
        }
    },
    
    init(api) {
        api.log('dance-gesture', 'Initializing Dance gesture plugin');
        
        // Register gesture-specific state
        api.setState('dance-gesture', 'beatCount', 0);
        api.setState('dance-gesture', 'danceStyle', 'groove');
        
        // Register hooks
        api.registerHook('beforeUpdate', this.beforeUpdate.bind(this));
        
        return true;
    },
    
    executeGesture(startTime, currentTime, state) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / this.gesture.duration, 1);
        
        // Find current keyframe segment
        let fromKeyframe = this.gesture.keyframes[0];
        let toKeyframe = this.gesture.keyframes[1];
        let segmentProgress = 0;
        
        for (let i = 0; i < this.gesture.keyframes.length - 1; i++) {
            const current = this.gesture.keyframes[i];
            const next = this.gesture.keyframes[i + 1];
            
            if (progress >= current.time && progress <= next.time) {
                fromKeyframe = current;
                toKeyframe = next;
                const segmentDuration = next.time - current.time;
                segmentProgress = (progress - current.time) / segmentDuration;
                break;
            }
        }
        
        // Interpolate between keyframes with easing
        const easedProgress = this.easeInOutQuad(segmentProgress);
        
        // Calculate position with bounce effect
        const bounceAmount = Math.sin(progress * Math.PI * 8) * 5;
        
        state.transform = {
            x: this.lerp(fromKeyframe.x, toKeyframe.x, easedProgress),
            y: this.lerp(fromKeyframe.y, toKeyframe.y, easedProgress) + bounceAmount,
            scale: this.lerp(fromKeyframe.scale, toKeyframe.scale, easedProgress),
            rotation: this.lerp(fromKeyframe.rotation, toKeyframe.rotation, easedProgress)
        };
        
        // Add particle effects on beat
        const beatInterval = this.gesture.duration / 8;
        const currentBeat = Math.floor(elapsed / beatInterval);
        const lastBeat = state.lastBeat || -1;
        
        if (currentBeat > lastBeat) {
            state.lastBeat = currentBeat;
            state.emitParticles = {
                count: 5,
                color: this.getBeatColor(currentBeat),
                spread: Math.PI / 4,
                speed: 2
            };
        }
        
        // Add trail effect
        state.trailEffect = {
            enabled: true,
            opacity: 0.3,
            length: 5
        };
        
        return {
            ...state,
            isComplete: progress >= 1
        };
    },
    
    canExecute(currentState, queuedGestures) {
        // Check if dance can be executed
        if (this.gesture.compatibility.cannotInterrupt.includes(currentState)) {
            return false;
        }
        
        // Check for exclusive gestures in queue
        for (const gesture of queuedGestures) {
            if (gesture.exclusive) {
                return false;
            }
        }
        
        return true;
    },
    
    beforeUpdate(data) {
        // Update beat counter if dancing
        if (data.currentGesture === 'dance') {
            const beatCount = this.api.getState('dance-gesture', 'beatCount') || 0;
            this.api.setState('dance-gesture', 'beatCount', beatCount + 1);
        }
    },
    
    getBeatColor(beat) {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
        return colors[beat % colors.length];
    },
    
    lerp(start, end, t) {
        return start + (end - start) * t;
    },
    
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    },
    
    destroy() {
        console.log('Dance gesture plugin destroyed');
    }
};

export const SpinGesturePlugin = {
    name: 'spin-gesture',
    version: '1.0.0',
    type: 'gesture',
    description: 'Adds a spinning gesture with acceleration',
    author: 'Example',
    
    gesture: {
        name: 'spin',
        duration: 1500,
        keyframes: [], // Programmatically generated
        compatibility: {
            canInterrupt: ['idle', 'think', 'dance'],
            cannotInterrupt: ['teleport'],
            canChain: ['dance', 'wobble', 'dizzy'],
            exclusive: false
        }
    },
    
    init(api) {
        api.log('spin-gesture', 'Initializing Spin gesture plugin');
        
        // Generate spin keyframes
        this.generateSpinKeyframes();
        
        // Register state
        api.setState('spin-gesture', 'spinSpeed', 0);
        api.setState('spin-gesture', 'dizzyLevel', 0);
        
        return true;
    },
    
    generateSpinKeyframes() {
        const steps = 16;
        this.gesture.keyframes = [];
        
        for (let i = 0; i <= steps; i++) {
            const progress = i / steps;
            const rotation = progress * 360 * 3; // 3 full rotations
            
            // Acceleration curve
            const speed = this.easeInOutCubic(progress);
            const scale = 1 - Math.abs(progress - 0.5) * 0.2; // Shrink in middle
            
            this.gesture.keyframes.push({
                time: progress,
                x: 0,
                y: Math.sin(progress * Math.PI) * -10, // Slight hop
                scale: scale,
                rotation: rotation * speed
            });
        }
    },
    
    executeGesture(startTime, currentTime, state) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / this.gesture.duration, 1);
        
        // Calculate spin with acceleration
        const spinAcceleration = this.easeInOutCubic(progress);
        const currentRotation = progress * 360 * 3 * spinAcceleration;
        
        // Add wobble effect
        const wobbleX = Math.sin(currentRotation * 0.1) * 5;
        const wobbleY = Math.cos(currentRotation * 0.1) * 3;
        
        // Scale effect - shrink during fast spin
        const scale = 1 - Math.abs(progress - 0.5) * 0.3;
        
        state.transform = {
            x: wobbleX,
            y: wobbleY + Math.sin(progress * Math.PI) * -15,
            scale: scale,
            rotation: currentRotation
        };
        
        // Particle spiral effect
        if (progress > 0.2 && progress < 0.8) {
            state.emitParticles = {
                count: 2,
                pattern: 'spiral',
                color: this.getSpinColor(progress),
                speed: 3 * (1 - Math.abs(progress - 0.5)),
                angle: currentRotation * Math.PI / 180
            };
        }
        
        // Motion blur effect during fast spin
        state.motionBlur = {
            enabled: progress > 0.3 && progress < 0.7,
            intensity: Math.abs(progress - 0.5) * 2
        };
        
        // Update dizzy level
        const dizzyLevel = Math.min(1, (state.dizzyLevel || 0) + progress * 0.1);
        state.dizzyLevel = dizzyLevel;
        
        // After spin effects
        if (progress >= 1) {
            state.afterEffect = 'dizzy';
            state.dizzyDuration = 1000 * dizzyLevel;
        }
        
        return {
            ...state,
            isComplete: progress >= 1
        };
    },
    
    canExecute(currentState, queuedGestures) {
        // Don't spin if already dizzy
        const dizzyLevel = this.api?.getState('spin-gesture', 'dizzyLevel') || 0;
        if (dizzyLevel > 0.7) {
            return false;
        }
        
        return !this.gesture.compatibility.cannotInterrupt.includes(currentState);
    },
    
    getSpinColor(progress) {
        // Rainbow effect during spin
        const hue = progress * 360;
        return `hsl(${hue}, 70%, 60%)`;
    },
    
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    },
    
    destroy() {
        console.log('Spin gesture plugin destroyed');
    }
};

export const TeleportGesturePlugin = {
    name: 'teleport-gesture',
    version: '1.0.0',
    type: 'gesture',
    description: 'Adds a teleportation gesture with particle effects',
    author: 'Example',
    dependencies: ['particle-system'],
    
    gesture: {
        name: 'teleport',
        duration: 1000,
        keyframes: [
            { time: 0, x: 0, y: 0, scale: 1, opacity: 1 },
            { time: 0.3, x: 0, y: 0, scale: 1.2, opacity: 1 },
            { time: 0.4, x: 0, y: 0, scale: 0.1, opacity: 0 },
            { time: 0.6, x: 50, y: -30, scale: 0.1, opacity: 0 },
            { time: 0.7, x: 50, y: -30, scale: 1.5, opacity: 1 },
            { time: 1, x: 50, y: -30, scale: 1, opacity: 1 }
        ],
        compatibility: {
            canInterrupt: [],
            cannotInterrupt: ['teleport', 'explode'],
            canChain: [],
            exclusive: true // Cannot be interrupted
        }
    },
    
    init(api) {
        api.log('teleport-gesture', 'Initializing Teleport gesture plugin');
        
        // Register teleport state
        api.setState('teleport-gesture', 'teleportCount', 0);
        api.setState('teleport-gesture', 'lastTeleportTime', 0);
        api.setState('teleport-gesture', 'teleportCooldown', 3000);
        
        return true;
    },
    
    executeGesture(startTime, currentTime, state) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / this.gesture.duration, 1);
        
        // Find current phase
        let phase = 'charge';
        if (progress > 0.3 && progress <= 0.4) phase = 'collapse';
        else if (progress > 0.4 && progress <= 0.6) phase = 'travel';
        else if (progress > 0.6 && progress <= 0.7) phase = 'emerge';
        else if (progress > 0.7) phase = 'stabilize';
        
        // Interpolate keyframes
        const keyframe = this.interpolateKeyframes(progress);
        
        state.transform = {
            x: keyframe.x,
            y: keyframe.y,
            scale: keyframe.scale,
            rotation: 0
        };
        
        state.opacity = keyframe.opacity;
        
        // Phase-specific effects
        switch (phase) {
            case 'charge':
                // Energy gathering effect
                state.effects = {
                    glow: {
                        intensity: progress * 3,
                        color: '#00FFFF',
                        radius: 20 * (1 + progress)
                    },
                    particles: {
                        type: 'converging',
                        count: Math.floor(progress * 20),
                        speed: 5,
                        color: '#00FFFF'
                    }
                };
                break;
                
            case 'collapse':
                // Implosion effect
                state.effects = {
                    distortion: {
                        type: 'implosion',
                        intensity: (progress - 0.3) * 10
                    },
                    particles: {
                        type: 'burst',
                        count: 30,
                        speed: 10,
                        color: '#FFFFFF'
                    }
                };
                break;
                
            case 'travel':
                // Portal/wormhole effect
                state.effects = {
                    portal: {
                        visible: true,
                        startPos: { x: 0, y: 0 },
                        endPos: { x: 50, y: -30 }
                    },
                    trail: {
                        enabled: true,
                        color: '#00FFFF',
                        opacity: 0.5
                    }
                };
                break;
                
            case 'emerge':
                // Materialization effect
                state.effects = {
                    distortion: {
                        type: 'explosion',
                        intensity: (0.7 - progress) * 10
                    },
                    particles: {
                        type: 'explosion',
                        count: 40,
                        speed: 8,
                        color: '#00FFFF'
                    },
                    shockwave: {
                        enabled: true,
                        radius: (progress - 0.6) * 100,
                        color: '#00FFFF'
                    }
                };
                break;
                
            case 'stabilize':
                // Stabilization effect
                state.effects = {
                    glow: {
                        intensity: (1 - progress) * 2,
                        color: '#00FFFF',
                        radius: 15
                    },
                    particles: {
                        type: 'floating',
                        count: 5,
                        speed: 1,
                        color: '#00FFFF'
                    }
                };
                break;
        }
        
        // Update teleport count
        if (progress >= 1) {
            const count = this.api.getState('teleport-gesture', 'teleportCount') || 0;
            this.api.setState('teleport-gesture', 'teleportCount', count + 1);
            this.api.setState('teleport-gesture', 'lastTeleportTime', currentTime);
        }
        
        return {
            ...state,
            phase,
            isComplete: progress >= 1
        };
    },
    
    canExecute(currentState, queuedGestures) {
        // Check cooldown
        const lastTeleport = this.api?.getState('teleport-gesture', 'lastTeleportTime') || 0;
        const cooldown = this.api?.getState('teleport-gesture', 'teleportCooldown') || 3000;
        const now = Date.now();
        
        if (now - lastTeleport < cooldown) {
            return false; // Still on cooldown
        }
        
        // Teleport is exclusive and cannot be interrupted
        return !this.gesture.compatibility.cannotInterrupt.includes(currentState);
    },
    
    interpolateKeyframes(progress) {
        const keyframes = this.gesture.keyframes;
        
        // Find surrounding keyframes
        let fromIndex = 0;
        let toIndex = 1;
        
        for (let i = 0; i < keyframes.length - 1; i++) {
            if (progress >= keyframes[i].time && progress <= keyframes[i + 1].time) {
                fromIndex = i;
                toIndex = i + 1;
                break;
            }
        }
        
        const from = keyframes[fromIndex];
        const to = keyframes[toIndex];
        
        // Calculate local progress
        const localProgress = (progress - from.time) / (to.time - from.time);
        
        // Interpolate values
        return {
            x: this.lerp(from.x, to.x, localProgress),
            y: this.lerp(from.y, to.y, localProgress),
            scale: this.lerp(from.scale, to.scale, localProgress),
            opacity: this.lerp(from.opacity || 1, to.opacity || 1, localProgress)
        };
    },
    
    lerp(start, end, t) {
        return start + (end - start) * t;
    },
    
    destroy() {
        console.log('Teleport gesture plugin destroyed');
    }
};