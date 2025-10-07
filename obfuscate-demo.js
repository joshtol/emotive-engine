import JavaScriptObfuscator from 'javascript-obfuscator';
import fs from 'fs';

// Read the bundled file
const code = fs.readFileSync('dist/emotive-demo.min.js', 'utf8');

// Obfuscate with strong settings but reasonable performance
const obfuscatedCode = JavaScriptObfuscator.obfuscate(code, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.8,
    deadCodeInjection: false,
    debugProtection: false,
    disableConsoleOutput: true,
    identifierNamesGenerator: 'hexadecimal', 
    log: false,
    numbersToExpressions: false,
    renameGlobals: false, // Keep EmotiveDemo
    renameProperties: false,
    selfDefending: false,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 8,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayCallsTransformThreshold: 0.5,
    stringArrayEncoding: ['base64', 'rc4'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 2,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 3,
    stringArrayWrappersType: 'function',
    stringArrayThreshold: 0.8,
    transformObjectKeys: false,
    unicodeEscapeSequence: false,
    reservedNames: ['EmotiveDemo']
}).getObfuscatedCode();

// Write the obfuscated code
fs.writeFileSync('dist/emotive-demo.min.js', obfuscatedCode);
console.log('✓ Demo bundle obfuscated successfully');