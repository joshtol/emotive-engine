// Test script to understand undertone transitions and the doppler effect

// Simulate what happens during undertone transitions
class ParticleSimulator {
    constructor() {
        this.particles = [];
        this.frameCount = 0;
    }
    
    createParticle() {
        return {
            x: 0,
            y: 0,
            vx: (Math.random() - 0.5) * 2,
            vy: -2 - Math.random() * 2,
            originalVx: 0,
            originalVy: 0
        };
    }
    
    applyUndertoneWithWeight(particle, modifier, weight) {
        // This is what's happening in the code
        let speedMult = 1.0;
        if (modifier.particleSpeedMult) {
            speedMult = 1.0 + (modifier.particleSpeedMult - 1.0) * weight;
            particle.vx *= speedMult;
            particle.vy *= speedMult;
        }
        
        // Log the velocity changes
        return {
            before: {vx: particle.vx / speedMult, vy: particle.vy / speedMult},
            after: {vx: particle.vx, vy: particle.vy},
            multiplier: speedMult
        };
    }
    
    simulateTransition() {
        console.log("\n=== SIMULATING UNDERTONE TRANSITION ===\n");
        
        const particle = this.createParticle();
        console.log("Initial particle velocity:", particle);
        
        // Simulate nervous undertone (speedMult: 1.1)
        const nervousModifier = { particleSpeedMult: 1.1 };
        
        // Simulate 10 frames of transition
        for (let frame = 0; frame < 10; frame++) {
            const weight = frame / 10; // Weight goes from 0 to 0.9
            
            // Store original velocity
            const originalVx = particle.vx;
            const originalVy = particle.vy;
            
            // Apply modifier (THIS IS THE BUG - it compounds!)
            const result = this.applyUndertoneWithWeight(particle, nervousModifier, weight);
            
            console.log(`Frame ${frame}: weight=${weight.toFixed(2)}, multiplier=${result.multiplier.toFixed(3)}`);
            console.log(`  Velocity: (${originalVx.toFixed(3)}, ${originalVy.toFixed(3)}) -> (${particle.vx.toFixed(3)}, ${particle.vy.toFixed(3)})`);
            
            // If this gets called every frame, velocities compound exponentially!
        }
        
        console.log("\nFinal velocity:", particle);
        console.log("Velocity increased by factor of:", particle.vy / -2);
    }
    
    simulateDopplerEffect() {
        console.log("\n=== DOPPLER EFFECT ANALYSIS ===\n");
        
        // When switching between undertones rapidly
        const particle = this.createParticle();
        const startVy = particle.vy;
        
        // Simulate rapid undertone switching
        const undertones = [
            { name: 'nervous', speedMult: 1.1 },
            { name: 'tired', speedMult: 0.9 },
            { name: 'confident', speedMult: 1.2 },
            { name: 'subdued', speedMult: 0.8 }
        ];
        
        console.log("Rapid undertone switching effect:");
        
        for (let i = 0; i < 20; i++) {
            const undertone = undertones[i % undertones.length];
            // Each frame applies the multiplier again!
            particle.vy *= undertone.speedMult;
            
            if (i % 4 === 3) {
                console.log(`After ${i+1} frames: vy = ${particle.vy.toFixed(3)} (${Math.abs(particle.vy / startVy).toFixed(1)}x original)`);
            }
        }
        
        console.log("\nThis creates the 'slingshot' effect you're seeing!");
        console.log("Particles accelerate and decelerate violently, creating rain-like streaks");
    }
}

const sim = new ParticleSimulator();
sim.simulateTransition();
sim.simulateDopplerEffect();

console.log("\n=== BUG EXPLANATION ===");
console.log("1. The particle update() is called every frame");
console.log("2. The undertone modifier multiplies velocity EVERY FRAME");
console.log("3. During transitions, this compounds exponentially");
console.log("4. Rapid switching creates violent velocity changes");
console.log("5. This makes particles streak up/down like rain!");