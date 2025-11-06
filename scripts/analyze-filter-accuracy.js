/**
 * Analyze universal filter accuracy against user's observed optimal values
 */

const EMOTION_DATA = [
    { name: 'joy', color: '#FFEB3B', predicted: 0.37, observed: null },
    { name: 'love', color: '#FF1493', predicted: 0.98, observed: 1.15 },
    { name: 'excited', color: '#FF6B35', predicted: 0.89, observed: null },
    { name: 'euphoria', color: '#FFB6C1', predicted: 0.61, observed: null },
    { name: 'calm', color: '#66D9CC', predicted: 0.63, observed: null },
    { name: 'focused', color: '#00CED1', predicted: 0.71, observed: null },
    { name: 'resting', color: '#9370DB', predicted: 0.99, observed: null },
    { name: 'sadness', color: '#4169E1', predicted: 1.06, observed: null },
    { name: 'anger', color: '#DC143C', predicted: 1.06, observed: 1.34 },
    { name: 'fear', color: '#8A2BE2', predicted: 1.10, observed: 1.16 },
    { name: 'surprise', color: '#FFD700', predicted: 0.49, observed: 0.52 },
    { name: 'suspicion', color: '#6B46C1', predicted: 1.11, observed: null },
    { name: 'disgust', color: '#9ACD32', predicted: 0.69, observed: null },
    { name: 'neutral', color: '#00BCD4', predicted: 0.80, observed: null }
];

// Original regression coefficients from 14 hand-tuned training values
const ORIGINAL_SLOPE = -1.0692;
const ORIGINAL_INTERCEPT = 1.2353;

/**
 * Calculate relative luminance
 */
function calculateLuminance(hexColor) {
    const r = parseInt(hexColor.slice(1, 3), 16) / 255;
    const g = parseInt(hexColor.slice(3, 5), 16) / 255;
    const b = parseInt(hexColor.slice(5, 7), 16) / 255;

    const linearize = c => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    const rL = linearize(r);
    const gL = linearize(g);
    const bL = linearize(b);

    return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
}

console.log('\n═══════════════════════════════════════════════════════════');
console.log('UNIVERSAL FILTER ACCURACY ANALYSIS');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('Comparing predicted values vs observed optimal values:\n');
console.log('Emotion       Color     Luminance  Predicted  Observed  Error     Error %');
console.log('─────────────────────────────────────────────────────────────────────────────────');

const dataWithLuminance = EMOTION_DATA.map(e => ({
    ...e,
    luminance: calculateLuminance(e.color)
}));

let totalError = 0;
let errorCount = 0;

dataWithLuminance.forEach(e => {
    if (e.observed !== null) {
        const error = Math.abs(e.predicted - e.observed);
        const errorPercent = (error / e.observed * 100).toFixed(1);
        totalError += error;
        errorCount++;

        console.log(
            `${e.name.padEnd(12)} ${e.color}  ${e.luminance.toFixed(4)}     ${e.predicted.toFixed(2)}       ${e.observed.toFixed(2)}      ${error.toFixed(3)}     ${errorPercent}%`
        );
    } else {
        console.log(
            `${e.name.padEnd(12)} ${e.color}  ${e.luminance.toFixed(4)}     ${e.predicted.toFixed(2)}       ---       ---       ---`
        );
    }
});

const avgError = totalError / errorCount;

console.log('\n═══════════════════════════════════════════════════════════');
console.log('ERROR ANALYSIS');
console.log('═══════════════════════════════════════════════════════════\n');

console.log(`Emotions with observed values: ${errorCount}`);
console.log(`Average absolute error: ${avgError.toFixed(3)}`);
console.log(`Average error percentage: ${(avgError / (totalError / errorCount) * 100).toFixed(1)}%`);

// Analyze if there's a pattern in the errors
console.log('\n═══════════════════════════════════════════════════════════');
console.log('ERROR PATTERN ANALYSIS');
console.log('═══════════════════════════════════════════════════════════\n');

const observedEmotions = dataWithLuminance.filter(e => e.observed !== null);

observedEmotions.forEach(e => {
    const error = e.observed - e.predicted;
    const direction = error > 0 ? 'UNDER-predicted' : 'OVER-predicted';
    console.log(`${e.name.padEnd(12)} ${direction.padEnd(15)} by ${Math.abs(error).toFixed(3)} (${e.luminance.toFixed(4)} luminance)`);
});

// Check if there's a systematic bias
const avgBias = observedEmotions.reduce((sum, e) => sum + (e.observed - e.predicted), 0) / errorCount;

console.log('\n═══════════════════════════════════════════════════════════');
console.log('SYSTEMATIC BIAS ANALYSIS');
console.log('═══════════════════════════════════════════════════════════\n');

console.log(`Average bias: ${avgBias > 0 ? '+' : ''}${avgBias.toFixed(3)}`);

if (Math.abs(avgBias) > 0.1) {
    console.log('\n⚠️  SIGNIFICANT BIAS DETECTED');
    console.log(`Filter is systematically ${avgBias > 0 ? 'UNDER' : 'OVER'}-predicting by ${Math.abs(avgBias).toFixed(3)}`);
    console.log(`\nRECOMMENDED FIX: Adjust intercept by ${avgBias > 0 ? '+' : ''}${avgBias.toFixed(4)}`);
    console.log(`New intercept: ${ORIGINAL_INTERCEPT} + ${avgBias.toFixed(4)} = ${(ORIGINAL_INTERCEPT + avgBias).toFixed(4)}`);
    console.log(`\nNew formula: intensity = ${ORIGINAL_SLOPE.toFixed(4)} * luminance + ${(ORIGINAL_INTERCEPT + avgBias).toFixed(4)}`);
} else {
    console.log('✅ No systematic bias - errors are random variations');
}

// Test if individual emotion adjustments are needed
console.log('\n═══════════════════════════════════════════════════════════');
console.log('INDIVIDUAL EMOTION ANALYSIS');
console.log('═══════════════════════════════════════════════════════════\n');

observedEmotions.forEach(e => {
    const error = e.observed - e.predicted;
    if (Math.abs(error) > 0.15) {
        console.log(`⚠️  ${e.name.toUpperCase()}: Large deviation (${error > 0 ? '+' : ''}${error.toFixed(3)})`);
        console.log('   Possible reasons:');
        console.log('   - Emotional emphasis (wants to feel more intense)');
        console.log('   - Perceptual factors beyond luminance');
        console.log('   - Specific glass material interaction with this color');
        console.log('');
    }
});

console.log('\n═══════════════════════════════════════════════════════════');
console.log('RECOMMENDATION');
console.log('═══════════════════════════════════════════════════════════\n');

if (Math.abs(avgBias) > 0.1) {
    console.log('Option 1: ADJUST INTERCEPT (Global fix)');
    console.log(`   - Shifts all intensities by ${avgBias.toFixed(3)}`);
    console.log('   - Simple, maintains color-luminance relationship');
    console.log(`   - New formula: intensity = -1.0692 * luminance + ${(ORIGINAL_INTERCEPT + avgBias).toFixed(4)}`);
    console.log('');
}

const largeDeviations = observedEmotions.filter(e => Math.abs(e.observed - e.predicted) > 0.15);
if (largeDeviations.length > 0) {
    console.log('Option 2: EMOTIONAL EMPHASIS OVERRIDES');
    console.log('   - Keep universal filter as baseline');
    console.log('   - Add emphasis multipliers for specific emotions:');
    largeDeviations.forEach(e => {
        const multiplier = e.observed / e.predicted;
        console.log(`     ${e.name}: ${multiplier.toFixed(3)}x multiplier`);
    });
    console.log('');
}

console.log('Option 3: HYBRID APPROACH');
console.log('   - Adjust intercept for global shift');
console.log('   - Add small emphasis overrides for emotional impact');
console.log('   - Best of both worlds: scientific + artistic control');
