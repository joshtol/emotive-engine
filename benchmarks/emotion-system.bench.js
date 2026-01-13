import { describe, bench, beforeEach } from 'vitest';

describe('Emotion System Benchmarks', () => {
    let Emotions;
    let emotionModule;

    beforeEach(async () => {
        emotionModule = await import('../src/core/emotions/index.js');
        Emotions = emotionModule.default || emotionModule;
    });

    bench('get emotion by name', () => {
        Emotions.getByName('joy');
    });

    bench('get all emotions', () => {
        Emotions.getAll();
    });

    bench('get emotion names', () => {
        Emotions.getNames();
    });

    bench('validate emotion name (valid)', () => {
        Emotions.isValid('joy');
    });

    bench('validate emotion name (invalid)', () => {
        Emotions.isValid('notAnEmotion');
    });

    bench('cycle through all emotions', () => {
        const names = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'neutral'];
        for (const name of names) {
            Emotions.getByName(name);
        }
    });
});

describe('Gesture System Benchmarks', () => {
    let Gestures;

    beforeEach(async () => {
        const module = await import('../src/core/gestures/index.js');
        Gestures = module.default || module;
    });

    bench('get gesture by name', () => {
        Gestures.getByName('bounce');
    });

    bench('get all gestures', () => {
        Gestures.getAll();
    });

    bench('get gesture names', () => {
        Gestures.getNames();
    });

    bench('validate gesture name (valid)', () => {
        Gestures.isValid('bounce');
    });

    bench('cycle through common gestures', () => {
        const names = ['bounce', 'pulse', 'shake', 'nod', 'spin', 'wave'];
        for (const name of names) {
            Gestures.getByName(name);
        }
    });
});

describe('Intent Parser Benchmarks', () => {
    let IntentParser;
    let parser;

    beforeEach(async () => {
        ({ IntentParser } = await import('../src/core/intent/IntentParser.js'));
        parser = new IntentParser();
    });

    bench('parse simple emotion', () => {
        parser.parse('happy');
    });

    bench('parse emotion with gesture', () => {
        parser.parse('happy, bouncing');
    });

    bench('parse complex intent', () => {
        parser.parse('very excited, bouncing and spinning, heart shape');
    });

    bench('parse intent with undertone', () => {
        parser.parse('happy but nervous');
    });

    bench('parse 10 different intents', () => {
        const intents = [
            'happy',
            'sad, sighing',
            'excited, bouncing',
            'calm, breathing',
            'angry, shaking',
            'surprised, jumping',
            'loving, heart shape',
            'focused, leaning in',
            'confused, tilting',
            'neutral'
        ];
        for (const intent of intents) {
            parser.parse(intent);
        }
    });
});
