/**
 * Analyze relationship between color luminance and tuned glow intensity
 * Used to create universal glow filter for glass materials
 */

// Your tuned glow intensity values for glass mode
const EMOTION_DATA = [
    { name: 'joy', color: '#FFEB3B', intensity: 0.55 },
    { name: 'love', color: '#FF1493', intensity: 1.15 },
    { name: 'excited', color: '#FF6B35', intensity: 0.75 },
    { name: 'euphoria', color: '#FFB6C1', intensity: 0.55 },
    { name: 'calm', color: '#66D9CC', intensity: 0.55 },
    { name: 'focused', color: '#00CED1', intensity: 0.70 },
    { name: 'resting', color: '#9370DB', intensity: 0.85 },
    { name: 'sadness', color: '#4169E1', intensity: 0.95 },
    { name: 'anger', color: '#DC143C', intensity: 1.3 },
    { name: 'fear', color: '#8A2BE2', intensity: 1.2 },
    { name: 'surprise', color: '#FFD700', intensity: 0.5 },
    { name: 'suspicion', color: '#6B46C1', intensity: 1.10 },
    { name: 'disgust', color: '#9ACD32', intensity: 0.65 },
    { name: 'neutral', color: '#00BCD4', intensity: 0.70 }
];

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    } : null;
}

/**
 * Calculate relative luminance (perceived brightness)
 * Uses sRGB luminance formula: 0.2126*R + 0.7152*G + 0.0722*B
 * Per W3C WCAG and official sRGB specification
 */
function calculateLuminance(rgb) {
    // Apply gamma correction for sRGB (inverse transfer function)
    // Official sRGB threshold is 0.04045, not 0.03928
    const linearize = c => {
        return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };

    const r = linearize(rgb.r);
    const g = linearize(rgb.g);
    const b = linearize(rgb.b);

    // ITU-R BT.709 luminance coefficients (same as sRGB)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate simple perceived brightness (average of RGB)
 */
function calculateSimpleBrightness(rgb) {
    return (rgb.r + rgb.g + rgb.b) / 3;
}

/**
 * Calculate saturation
 */
function calculateSaturation(rgb) {
    const max = Math.max(rgb.r, rgb.g, rgb.b);
    const min = Math.min(rgb.r, rgb.g, rgb.b);
    return max === 0 ? 0 : (max - min) / max;
}

// Calculate luminance for all emotions
console.log('\n═══════════════════════════════════════════════════════════');
console.log('EMOTION GLOW ANALYSIS - Color Luminance vs Tuned Intensity');
console.log('═══════════════════════════════════════════════════════════\n');

const analyzed = EMOTION_DATA.map(emotion => {
    const rgb = hexToRgb(emotion.color);
    const luminance = calculateLuminance(rgb);
    const brightness = calculateSimpleBrightness(rgb);
    const saturation = calculateSaturation(rgb);

    return {
        ...emotion,
        rgb,
        luminance,
        brightness,
        saturation
    };
});

// Sort by luminance
analyzed.sort((a, b) => a.luminance - b.luminance);

console.log('Emotions sorted by luminance (darkest to brightest):\n');
console.log('Emotion       Color     Luminance  Brightness  Saturation  Tuned Intensity');
console.log('─────────────────────────────────────────────────────────────────────────────');
analyzed.forEach(e => {
    console.log(
        `${e.name.padEnd(12)} ${e.color}  ${e.luminance.toFixed(4)}     ${e.brightness.toFixed(4)}      ${e.saturation.toFixed(4)}      ${e.intensity.toFixed(2)}`
    );
});

// Calculate correlation between luminance and intensity
console.log('\n═══════════════════════════════════════════════════════════');
console.log('CORRELATION ANALYSIS');
console.log('═══════════════════════════════════════════════════════════\n');

// Calculate Pearson correlation coefficient
function calculateCorrelation(dataPoints, getX, getY) {
    const n = dataPoints.length;
    const sumX = dataPoints.reduce((sum, d) => sum + getX(d), 0);
    const sumY = dataPoints.reduce((sum, d) => sum + getY(d), 0);
    const sumXY = dataPoints.reduce((sum, d) => sum + getX(d) * getY(d), 0);
    const sumX2 = dataPoints.reduce((sum, d) => sum + getX(d) * getX(d), 0);
    const sumY2 = dataPoints.reduce((sum, d) => sum + getY(d) * getY(d), 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return numerator / denominator;
}

const luminanceCorrelation = calculateCorrelation(analyzed, d => d.luminance, d => d.intensity);
const brightnessCorrelation = calculateCorrelation(analyzed, d => d.brightness, d => d.intensity);
const saturationCorrelation = calculateCorrelation(analyzed, d => d.saturation, d => d.intensity);

console.log(`Luminance vs Intensity correlation:   ${luminanceCorrelation.toFixed(4)}`);
console.log(`Brightness vs Intensity correlation:  ${brightnessCorrelation.toFixed(4)}`);
console.log(`Saturation vs Intensity correlation:  ${saturationCorrelation.toFixed(4)}`);

// Negative correlation means: darker colors need higher intensity
console.log('\n(Negative correlation = darker colors need higher intensity)');

// Find best-fit linear regression
function linearRegression(dataPoints, getX, getY) {
    const n = dataPoints.length;
    const sumX = dataPoints.reduce((sum, d) => sum + getX(d), 0);
    const sumY = dataPoints.reduce((sum, d) => sum + getY(d), 0);
    const sumXY = dataPoints.reduce((sum, d) => sum + getX(d) * getY(d), 0);
    const sumX2 = dataPoints.reduce((sum, d) => sum + getX(d) * getX(d), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
}

const regression = linearRegression(analyzed, d => d.luminance, d => d.intensity);

console.log('\n═══════════════════════════════════════════════════════════');
console.log('LINEAR REGRESSION: Intensity = slope * luminance + intercept');
console.log('═══════════════════════════════════════════════════════════\n');

console.log(`Slope:     ${regression.slope.toFixed(4)}`);
console.log(`Intercept: ${regression.intercept.toFixed(4)}`);
console.log(`\nFormula: intensity = ${regression.slope.toFixed(4)} * luminance + ${regression.intercept.toFixed(4)}`);

// Test predictions
console.log('\n═══════════════════════════════════════════════════════════');
console.log('PREDICTION TEST (using linear formula)');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('Emotion       Actual  Predicted  Error');
console.log('─────────────────────────────────────────');
let totalError = 0;
analyzed.forEach(e => {
    const predicted = regression.slope * e.luminance + regression.intercept;
    const error = Math.abs(e.intensity - predicted);
    totalError += error;
    console.log(
        `${e.name.padEnd(12)} ${e.intensity.toFixed(2)}    ${predicted.toFixed(2)}       ${error.toFixed(3)}`
    );
});

const avgError = totalError / analyzed.length;
console.log(`\nAverage error: ${avgError.toFixed(3)}`);

console.log('\n═══════════════════════════════════════════════════════════');
console.log('RECOMMENDED UNIVERSAL FILTER FUNCTION');
console.log('═══════════════════════════════════════════════════════════\n');

console.log(`/**
 * Universal glow intensity filter for glass materials
 * Calculates optimal intensity based on color luminance
 * Uses official W3C/WCAG sRGB relative luminance formula
 */
function getGlowIntensityForColor(hexColor) {
    // Convert hex to RGB (0-1 range)
    const r = parseInt(hexColor.slice(1, 3), 16) / 255;
    const g = parseInt(hexColor.slice(3, 5), 16) / 255;
    const b = parseInt(hexColor.slice(5, 7), 16) / 255;

    // Apply sRGB gamma correction (inverse transfer function)
    // Official threshold is 0.04045 per sRGB/WCAG specification
    const linearize = (c) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    const rL = linearize(r);
    const gL = linearize(g);
    const bL = linearize(b);

    // Calculate relative luminance (ITU-R BT.709 coefficients)
    const luminance = 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;

    // Apply regression formula derived from 14 hand-tuned emotion values
    return ${regression.slope.toFixed(4)} * luminance + ${regression.intercept.toFixed(4)};
}
`);

console.log('This function will work for ANY color, not just the 14 emotions!\n');
