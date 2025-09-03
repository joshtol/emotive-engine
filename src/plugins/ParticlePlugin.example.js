/**
 * Example Particle Plugin - Demonstrates custom particle behaviors
 * Adds fireflies, snow, and matrix rain particle effects
 */

export const FirefliesParticlePlugin = {
    name: 'fireflies-particle',
    version: '1.0.0',
    type: 'particle',
    description: 'Adds firefly particle behavior with realistic movement',
    author: 'Example',
    
    particle: {
        name: 'fireflies',
        maxParticles: 20,
        behavior: function(particle, deltaTime, bounds) {
            // Initialize firefly properties if not set
            if (!particle.firefly) {
                particle.firefly = {
                    phase: Math.random() * Math.PI * 2,
                    frequency: 0.5 + Math.random() * 1.5,
                    amplitude: 20 + Math.random() * 30,
                    glowPhase: Math.random() * Math.PI * 2,
                    glowSpeed: 1 + Math.random() * 2,
                    targetX: particle.x,
                    targetY: particle.y,
                    changeTargetTime: Date.now() + Math.random() * 3000
                };
            }
            
            const ff = particle.firefly;
            const now = Date.now();
            
            // Update target position periodically
            if (now > ff.changeTargetTime) {
                ff.targetX = bounds.x + Math.random() * bounds.width;
                ff.targetY = bounds.y + Math.random() * bounds.height;
                ff.changeTargetTime = now + 2000 + Math.random() * 3000;
            }
            
            // Smooth movement towards target
            const dx = ff.targetX - particle.x;
            const dy = ff.targetY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 1) {
                // Apply acceleration towards target
                particle.velocity.x += (dx / distance) * 0.5 * deltaTime;
                particle.velocity.y += (dy / distance) * 0.5 * deltaTime;
                
                // Add wandering behavior
                ff.phase += deltaTime * ff.frequency;
                particle.velocity.x += Math.sin(ff.phase) * ff.amplitude * deltaTime * 0.01;
                particle.velocity.y += Math.cos(ff.phase * 0.7) * ff.amplitude * deltaTime * 0.01;
            }
            
            // Apply friction
            particle.velocity.x *= 0.98;
            particle.velocity.y *= 0.98;
            
            // Limit speed
            const speed = Math.sqrt(particle.velocity.x ** 2 + particle.velocity.y ** 2);
            const maxSpeed = 50;
            if (speed > maxSpeed) {
                particle.velocity.x = (particle.velocity.x / speed) * maxSpeed;
                particle.velocity.y = (particle.velocity.y / speed) * maxSpeed;
            }
            
            // Update position
            particle.x += particle.velocity.x * deltaTime;
            particle.y += particle.velocity.y * deltaTime;
            
            // Keep within bounds with soft boundaries
            const margin = 20;
            if (particle.x < bounds.x - margin) {
                particle.velocity.x += 2;
            } else if (particle.x > bounds.x + bounds.width + margin) {
                particle.velocity.x -= 2;
            }
            
            if (particle.y < bounds.y - margin) {
                particle.velocity.y += 2;
            } else if (particle.y > bounds.y + bounds.height + margin) {
                particle.velocity.y -= 2;
            }
            
            // Update glow
            ff.glowPhase += deltaTime * ff.glowSpeed;
            particle.opacity = 0.3 + Math.sin(ff.glowPhase) * 0.7;
            particle.size = 2 + Math.sin(ff.glowPhase) * 1.5;
            
            // Firefly lifespan (they don't die, just fade and respawn)
            particle.life -= deltaTime * 0.1;
            if (particle.life <= 0) {
                particle.life = 1;
                particle.x = bounds.x + Math.random() * bounds.width;
                particle.y = bounds.y + Math.random() * bounds.height;
            }
            
            return particle;
        },
        render: function(ctx, particle) {
            // Draw firefly with glow effect
            ctx.save();
            
            // Outer glow
            const gradient = ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size * 4
            );
            
            const color = particle.firefly?.glowPhase 
                ? `hsl(${60 + Math.sin(particle.firefly.glowPhase) * 10}, 100%, 70%)`
                : '#FFFF00';
            
            gradient.addColorStop(0, color + 'FF');
            gradient.addColorStop(0.3, color + '80');
            gradient.addColorStop(0.6, color + '40');
            gradient.addColorStop(1, color + '00');
            
            ctx.fillStyle = gradient;
            ctx.globalAlpha = particle.opacity * 0.5;
            ctx.fillRect(
                particle.x - particle.size * 4,
                particle.y - particle.size * 4,
                particle.size * 8,
                particle.size * 8
            );
            
            // Core
            ctx.globalAlpha = particle.opacity;
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    },
    
    init(api) {
        api.log('fireflies-particle', 'Initializing Fireflies particle plugin');
        api.setState('fireflies-particle', 'active', true);
        return true;
    },
    
    updateParticles(particles, deltaTime, bounds) {
        // Global firefly behavior updates
        particles.forEach(p => {
            if (p.type === 'fireflies') {
                this.particle.behavior(p, deltaTime, bounds);
            }
        });
        return particles;
    },
    
    spawnParticle(x, y, options = {}) {
        return {
            x,
            y,
            velocity: { x: 0, y: 0 },
            life: 1,
            opacity: 0,
            size: 2,
            type: 'fireflies',
            ...options
        };
    },
    
    destroy() {
        console.log('Fireflies particle plugin destroyed');
    }
};

export const SnowParticlePlugin = {
    name: 'snow-particle',
    version: '1.0.0',
    type: 'particle',
    description: 'Adds realistic snow particle effects',
    author: 'Example',
    
    particle: {
        name: 'snow',
        maxParticles: 50,
        behavior: function(particle, deltaTime, bounds) {
            // Initialize snow properties
            if (!particle.snow) {
                particle.snow = {
                    swayPhase: Math.random() * Math.PI * 2,
                    swaySpeed: 0.5 + Math.random() * 1,
                    swayAmplitude: 10 + Math.random() * 20,
                    fallSpeed: 20 + Math.random() * 30,
                    rotationSpeed: (Math.random() - 0.5) * 2,
                    size: 1 + Math.random() * 3
                };
                particle.size = particle.snow.size;
            }
            
            const snow = particle.snow;
            
            // Update sway
            snow.swayPhase += deltaTime * snow.swaySpeed;
            const swayX = Math.sin(snow.swayPhase) * snow.swayAmplitude;
            
            // Apply wind (could be dynamic)
            const windStrength = Math.sin(Date.now() * 0.0001) * 10;
            
            // Update velocity
            particle.velocity.x = swayX * deltaTime * 0.01 + windStrength * deltaTime * 0.01;
            particle.velocity.y = snow.fallSpeed;
            
            // Update position
            particle.x += particle.velocity.x * deltaTime;
            particle.y += particle.velocity.y * deltaTime;
            
            // Rotation
            particle.rotation = (particle.rotation || 0) + snow.rotationSpeed * deltaTime;
            
            // Wrap around horizontally
            if (particle.x < bounds.x - 20) {
                particle.x = bounds.x + bounds.width + 20;
            } else if (particle.x > bounds.x + bounds.width + 20) {
                particle.x = bounds.x - 20;
            }
            
            // Reset when reaching bottom
            if (particle.y > bounds.y + bounds.height + 20) {
                particle.y = bounds.y - 20;
                particle.x = bounds.x + Math.random() * bounds.width;
                particle.life = 1;
            }
            
            // Fade in/out at edges
            const edgeFade = 20;
            if (particle.y < bounds.y + edgeFade) {
                particle.opacity = (particle.y - bounds.y) / edgeFade;
            } else if (particle.y > bounds.y + bounds.height - edgeFade) {
                particle.opacity = (bounds.y + bounds.height - particle.y) / edgeFade;
            } else {
                particle.opacity = 0.8;
            }
            
            return particle;
        },
        render: function(ctx, particle) {
            if (!particle.snow) return;
            
            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation || 0);
            ctx.globalAlpha = particle.opacity;
            
            // Draw snowflake
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = particle.size * 0.3;
            ctx.lineCap = 'round';
            
            // Six-pointed snowflake
            for (let i = 0; i < 6; i++) {
                ctx.save();
                ctx.rotate((Math.PI / 3) * i);
                
                // Main branch
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, -particle.size * 2);
                ctx.stroke();
                
                // Side branches
                ctx.beginPath();
                ctx.moveTo(0, -particle.size * 0.7);
                ctx.lineTo(-particle.size * 0.5, -particle.size);
                ctx.moveTo(0, -particle.size * 0.7);
                ctx.lineTo(particle.size * 0.5, -particle.size);
                ctx.stroke();
                
                ctx.restore();
            }
            
            ctx.restore();
        }
    },
    
    init(api) {
        api.log('snow-particle', 'Initializing Snow particle plugin');
        api.setState('snow-particle', 'density', 'medium');
        api.setState('snow-particle', 'windSpeed', 0);
        return true;
    },
    
    updateParticles(particles, deltaTime, bounds) {
        particles.forEach(p => {
            if (p.type === 'snow') {
                this.particle.behavior(p, deltaTime, bounds);
            }
        });
        return particles;
    },
    
    spawnParticle(x, y, options = {}) {
        return {
            x: x || Math.random() * 800,
            y: y || -20,
            velocity: { x: 0, y: 20 },
            life: 1,
            opacity: 0.8,
            size: 2,
            rotation: 0,
            type: 'snow',
            ...options
        };
    },
    
    destroy() {
        console.log('Snow particle plugin destroyed');
    }
};

export const MatrixRainParticlePlugin = {
    name: 'matrix-rain-particle',
    version: '1.0.0',
    type: 'particle',
    description: 'Adds Matrix-style digital rain particle effect',
    author: 'Example',
    
    particle: {
        name: 'matrix-rain',
        maxParticles: 30,
        behavior: function(particle, deltaTime, bounds) {
            // Initialize matrix properties
            if (!particle.matrix) {
                particle.matrix = {
                    column: Math.floor(particle.x / 20) * 20,
                    speed: 50 + Math.random() * 100,
                    chars: '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン',
                    currentChar: '',
                    changeTime: 0,
                    trail: []
                };
                
                // Set initial character
                const chars = particle.matrix.chars;
                particle.matrix.currentChar = chars[Math.floor(Math.random() * chars.length)];
            }
            
            const matrix = particle.matrix;
            const now = Date.now();
            
            // Change character periodically
            if (now > matrix.changeTime) {
                const chars = matrix.chars;
                matrix.currentChar = chars[Math.floor(Math.random() * chars.length)];
                matrix.changeTime = now + 50 + Math.random() * 100;
                
                // Add to trail
                matrix.trail.push({
                    char: matrix.currentChar,
                    y: particle.y,
                    opacity: 1
                });
                
                // Limit trail length
                if (matrix.trail.length > 20) {
                    matrix.trail.shift();
                }
            }
            
            // Update trail opacity
            matrix.trail.forEach(t => {
                t.opacity *= 0.95;
            });
            
            // Keep in column
            particle.x = matrix.column;
            
            // Fall down
            particle.y += matrix.speed * deltaTime;
            
            // Reset at bottom
            if (particle.y > bounds.y + bounds.height) {
                particle.y = bounds.y - 20;
                matrix.column = Math.floor(Math.random() * (bounds.width / 20)) * 20 + bounds.x;
                matrix.trail = [];
                matrix.speed = 50 + Math.random() * 100;
            }
            
            // Leading character is bright
            particle.opacity = 0.9 + Math.random() * 0.1;
            
            return particle;
        },
        render: function(ctx, particle) {
            if (!particle.matrix) return;
            
            ctx.save();
            ctx.font = '16px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw trail
            particle.matrix.trail.forEach(t => {
                const green = Math.floor(255 * t.opacity);
                ctx.fillStyle = `rgb(0, ${green}, 0)`;
                ctx.globalAlpha = t.opacity * 0.5;
                ctx.fillText(t.char, particle.x, t.y);
            });
            
            // Draw leading character (bright white-green)
            ctx.globalAlpha = particle.opacity;
            ctx.fillStyle = '#AAFFAA';
            ctx.shadowColor = '#00FF00';
            ctx.shadowBlur = 10;
            ctx.fillText(particle.matrix.currentChar, particle.x, particle.y);
            
            ctx.restore();
        }
    },
    
    init(api) {
        api.log('matrix-rain-particle', 'Initializing Matrix Rain particle plugin');
        api.setState('matrix-rain-particle', 'active', true);
        api.setState('matrix-rain-particle', 'density', 'high');
        return true;
    },
    
    updateParticles(particles, deltaTime, bounds) {
        particles.forEach(p => {
            if (p.type === 'matrix-rain') {
                this.particle.behavior(p, deltaTime, bounds);
            }
        });
        return particles;
    },
    
    spawnParticle(x, y, options = {}) {
        const column = Math.floor(x / 20) * 20;
        return {
            x: column,
            y: y || -20,
            velocity: { x: 0, y: 0 },
            life: 1,
            opacity: 1,
            size: 16,
            type: 'matrix-rain',
            ...options
        };
    },
    
    destroy() {
        console.log('Matrix Rain particle plugin destroyed');
    }
};