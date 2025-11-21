/**
 * Generate seamless tileable Perlin noise texture
 * Output: 512x512 PNG at /assets/textures/perlin-noise-512.png
 */

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Simple Perlin noise implementation
class PerlinNoise {
    constructor(seed = Math.random()) {
        this.seed = seed;
        this.p = this.buildPermutationTable();
    }

    buildPermutationTable() {
        const p = [];
        for (let i = 0; i < 256; i++) {
            p[i] = i;
        }

        // Shuffle using seed
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(this.random() * (i + 1));
            [p[i], p[j]] = [p[j], p[i]];
        }

        // Duplicate for wrapping
        for (let i = 0; i < 256; i++) {
            p[256 + i] = p[i];
        }

        return p;
    }

    random() {
        const x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(t, a, b) {
        return a + t * (b - a);
    }

    grad(hash, x, y) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    noise(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);

        const u = this.fade(x);
        const v = this.fade(y);

        const a = this.p[X] + Y;
        const aa = this.p[a];
        const ab = this.p[a + 1];
        const b = this.p[X + 1] + Y;
        const ba = this.p[b];
        const bb = this.p[b + 1];

        return this.lerp(v,
            this.lerp(u, this.grad(this.p[aa], x, y), this.grad(this.p[ba], x - 1, y)),
            this.lerp(u, this.grad(this.p[ab], x, y - 1), this.grad(this.p[bb], x - 1, y - 1))
        );
    }

    // Multi-octave noise
    octaveNoise(x, y, octaves = 4, persistence = 0.5) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            total += this.noise(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= 2;
        }

        return total / maxValue;
    }
}

// Generate seamless tileable Perlin noise texture
function generateSeamlessPerlinNoise(width, height, scale = 0.05, octaves = 4) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);
    const perlin = new PerlinNoise(12345); // Fixed seed for reproducibility

    console.log(`🎨 Generating ${width}x${height} Perlin noise texture...`);
    console.log(`   Scale: ${scale}, Octaves: ${octaves}`);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Seamless tiling using periodic noise
            const nx = x / width;
            const ny = y / height;

            // Map to torus coordinates for seamless tiling
            const s = nx * 2 * Math.PI;
            const t = ny * 2 * Math.PI;

            const noiseX = Math.cos(s) / (2 * Math.PI) + 0.5;
            const noiseY = Math.sin(s) / (2 * Math.PI) + 0.5;
            const noiseZ = Math.cos(t) / (2 * Math.PI) + 0.5;
            const noiseW = Math.sin(t) / (2 * Math.PI) + 0.5;

            // Sample noise at 4D torus coordinates
            const noise1 = perlin.octaveNoise(noiseX * scale * width, noiseY * scale * width, octaves);
            const noise2 = perlin.octaveNoise(noiseZ * scale * height, noiseW * scale * height, octaves);

            // Combine for seamless result
            let noiseValue = (noise1 + noise2) / 2;

            // Normalize to 0-1 range
            noiseValue = (noiseValue + 1) / 2;

            // Apply contrast adjustment (medium contrast)
            noiseValue = Math.pow(noiseValue, 1.2); // Slight gamma adjustment
            noiseValue = noiseValue * 0.8 + 0.1; // Compress to 0.1-0.9 range

            // Convert to grayscale
            const value = Math.floor(noiseValue * 255);

            const index = (y * width + x) * 4;
            imageData.data[index] = value;     // R
            imageData.data[index + 1] = value; // G
            imageData.data[index + 2] = value; // B
            imageData.data[index + 3] = 255;   // A (fully opaque)
        }

        // Progress indicator
        if (y % 50 === 0) {
            const progress = ((y / height) * 100).toFixed(1);
            process.stdout.write(`\r   Progress: ${progress}%`);
        }
    }

    console.log(`\r   Progress: 100.0%`);

    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

// Main execution
async function main() {
    const width = 512;
    const height = 512;
    const scale = 0.05; // Noise frequency (lower = larger features)
    const octaves = 4;  // Detail levels

    // Generate texture
    const canvas = generateSeamlessPerlinNoise(width, height, scale, octaves);

    // Ensure output directory exists
    const outputDir = path.join(__dirname, '..', 'assets', 'textures');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`📁 Created directory: ${outputDir}`);
    }

    // Save PNG
    const outputPath = path.join(outputDir, 'perlin-noise-512.png');
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);

    console.log(`✅ Saved: ${outputPath}`);
    console.log(`   Size: ${(buffer.length / 1024).toFixed(2)} KB`);
    console.log(`\n🎉 Perlin noise texture generated successfully!`);
    console.log(`   The texture is seamlessly tileable and ready for use in shaders.`);
}

main().catch(err => {
    console.error('❌ Error generating texture:', err);
    process.exit(1);
});
