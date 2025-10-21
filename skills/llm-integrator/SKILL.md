---
name: llm-integrator
description:
    Integrate LLM providers (Claude, GPT, etc.) with emotive-mascot for
    sentiment-driven emotional responses. Use when connecting to AI services,
    implementing chat interfaces, or creating emotion-aware conversational
    experiences.
trigger:
    llm, ai, claude, gpt, chatbot, sentiment analysis, conversation, api
    integration
---

# LLM Integrator

You are an expert in integrating Large Language Models with the emotive-mascot
engine for emotionally responsive conversational experiences.

## When to Use This Skill

- Setting up Claude or GPT API integration
- Implementing sentiment-driven emotion responses
- Creating conversational AI interfaces
- Building chat-aware mascot experiences
- Troubleshooting LLM API issues
- Optimizing emotion detection from text
- Creating custom emotion mappings

## Quick Start: Claude Integration

### Using Anthropic SDK (Recommended)

```typescript
// site/src/app/api/chat/route.ts
import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
    const { message, context } = await req.json();

    try {
        const response = await anthropic.messages.create({
            model: 'claude-haiku-4.5-20250929', // Fast and efficient
            max_tokens: 1024,
            messages: [
                {
                    role: 'user',
                    content: message,
                },
            ],
            system: getSystemPrompt(context),
        });

        const aiMessage = response.content[0].text;
        const sentiment = detectSentiment(aiMessage);
        const emotion = mapSentimentToEmotion(sentiment);

        return NextResponse.json({
            message: aiMessage,
            sentiment,
            emotion,
            usage: response.usage,
        });
    } catch (error) {
        console.error('Claude API error:', error);
        return NextResponse.json(
            { error: 'Failed to get response' },
            { status: 500 }
        );
    }
}

function getSystemPrompt(context: string) {
    const prompts = {
        retail: 'You are a helpful checkout assistant. Be concise, friendly, and solution-oriented.',
        healthcare:
            'You are a compassionate patient intake assistant. Be empathetic and professional.',
        smarthome: 'You are a smart home assistant. Be efficient and clear.',
        education:
            'You are an encouraging learning tutor. Be supportive and educational.',
    };
    return prompts[context] || prompts.retail;
}
```

### Client-Side Integration

```typescript
// site/src/components/PremiumAIAssistant.tsx
const sendMessage = async (userMessage: string) => {
    setIsLoading(true);

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: userMessage,
                context: props.context || 'retail',
            }),
        });

        const data = await response.json();

        // Update mascot emotion based on sentiment
        if (onLLMResponse) {
            onLLMResponse(data.emotion, data.message);
        }

        setMessages(prev => [
            ...prev,
            {
                role: 'assistant',
                content: data.message,
                emotion: data.emotion,
            },
        ]);
    } catch (error) {
        console.error('Chat error:', error);
        // Show error emotion
        if (onLLMResponse) {
            onLLMResponse('concern', 'Sorry, I encountered an error.');
        }
    } finally {
        setIsLoading(false);
    }
};
```

## Sentiment Detection

### Basic Keyword-Based Detection

```typescript
function detectSentiment(text: string): string {
    const lowercaseText = text.toLowerCase();

    // Positive indicators
    const positiveKeywords = [
        'great',
        'excellent',
        'wonderful',
        'perfect',
        'awesome',
        'love',
        'thank',
        'appreciate',
        'helpful',
        'amazing',
        'success',
        'correct',
        'right',
        'yes',
        'absolutely',
    ];

    // Negative indicators
    const negativeKeywords = [
        'error',
        'problem',
        'issue',
        'wrong',
        'incorrect',
        'failed',
        'sorry',
        'unfortunately',
        'cannot',
        'unable',
        'confused',
        'confusing',
        'unclear',
        'difficult',
    ];

    // Empathetic indicators
    const empatheticKeywords = [
        'understand',
        'help',
        'concern',
        'worry',
        'care',
        'support',
        'assist',
        'together',
    ];

    // Question indicators
    const questionIndicators = ['?', 'how', 'what', 'why', 'when', 'where'];

    const positiveCount = positiveKeywords.filter(kw =>
        lowercaseText.includes(kw)
    ).length;
    const negativeCount = negativeKeywords.filter(kw =>
        lowercaseText.includes(kw)
    ).length;
    const empatheticCount = empatheticKeywords.filter(kw =>
        lowercaseText.includes(kw)
    ).length;
    const isQuestion = questionIndicators.some(ind =>
        lowercaseText.includes(ind)
    );

    if (isQuestion) return 'curious';
    if (empatheticCount > 1) return 'empathetic';
    if (positiveCount > negativeCount && positiveCount > 0) return 'positive';
    if (negativeCount > positiveCount && negativeCount > 0) return 'negative';

    return 'neutral';
}
```

### Advanced: Using Claude for Sentiment Analysis

```typescript
async function detectSentimentWithClaude(text: string): Promise<string> {
    const response = await anthropic.messages.create({
        model: 'claude-haiku-4.5-20250929',
        max_tokens: 50,
        messages: [
            {
                role: 'user',
                content: `Analyze the sentiment of this message and respond with ONLY one word from this list: positive, negative, neutral, empathetic, curious, excited, concerned.

Message: "${text}"`,
            },
        ],
    });

    return response.content[0].text.trim().toLowerCase();
}
```

## Emotion Mapping

### Sentiment to Emotion Mapping

```typescript
function mapSentimentToEmotion(sentiment: string): string {
    const emotionMap: Record<string, string> = {
        // Positive sentiments
        positive: 'joy',
        excited: 'excitement',
        happy: 'joy',
        grateful: 'gratitude',
        proud: 'pride',

        // Negative sentiments
        negative: 'concern',
        sad: 'empathy',
        worried: 'concern',
        confused: 'confusion',
        frustrated: 'concern',

        // Neutral sentiments
        neutral: 'calm',
        calm: 'calm',
        focused: 'focus',
        thinking: 'contemplation',

        // Interactive sentiments
        curious: 'curiosity',
        questioning: 'curiosity',
        empathetic: 'empathy',
        supportive: 'encouragement',
    };

    return emotionMap[sentiment] || 'calm';
}
```

### Context-Aware Mapping

```typescript
function mapSentimentToEmotion(
    sentiment: string,
    context: string,
    messageType: 'greeting' | 'question' | 'response' | 'error'
): string {
    // Retail context
    if (context === 'retail') {
        if (messageType === 'greeting') return 'joy';
        if (messageType === 'error') return 'concern';
        if (sentiment === 'positive') return 'gratitude';
    }

    // Healthcare context
    if (context === 'healthcare') {
        if (messageType === 'greeting') return 'calm';
        if (sentiment === 'worried') return 'empathy';
        if (sentiment === 'positive') return 'reassurance';
    }

    // Education context
    if (context === 'education') {
        if (sentiment === 'positive') return 'pride';
        if (sentiment === 'confused') return 'encouragement';
        if (messageType === 'question') return 'contemplation';
    }

    // Default mapping
    return mapSentimentToEmotion(sentiment);
}
```

## Use Case Patterns

### 1. Retail Checkout Assistant

```typescript
// System prompt for retail
const RETAIL_SYSTEM_PROMPT = `You are a helpful retail checkout assistant. Your role is to:
- Help customers with scanning items
- Assist with payment issues
- Answer questions about coupons and discounts
- Troubleshoot scanner problems

Be concise (2-3 sentences max), friendly, and solution-oriented.
Always offer to escalate to a human if the issue is complex.`;

// Emotion mapping for retail
function getRetailEmotion(sentiment: string, message: string): string {
    if (message.includes('success') || message.includes('complete')) {
        return 'joy';
    }
    if (message.includes('scan') || message.includes('payment')) {
        return 'anticipation';
    }
    if (message.includes('help') || message.includes('issue')) {
        return 'concern';
    }
    if (message.includes('thank')) {
        return 'gratitude';
    }
    return mapSentimentToEmotion(sentiment);
}
```

### 2. Healthcare Patient Intake

```typescript
// System prompt for healthcare
const HEALTHCARE_SYSTEM_PROMPT = `You are a compassionate patient intake assistant. Your role is to:
- Guide patients through intake forms
- Answer questions about the process
- Provide reassurance about privacy and security
- Be empathetic to patient concerns

Be professional, warm, and respectful. Use simple language.
Never provide medical advice - only help with the intake process.`;

// Emotion mapping for healthcare
function getHealthcareEmotion(sentiment: string, message: string): string {
    // Always start with calm reassurance
    if (message.includes('welcome') || message.includes('help you')) {
        return 'calm';
    }
    // Empathy for concerns
    if (sentiment === 'worried' || sentiment === 'concerned') {
        return 'empathy';
    }
    // Reassurance when explaining
    if (message.includes('secure') || message.includes('private')) {
        return 'reassurance';
    }
    // Gratitude when completed
    if (message.includes('complete') || message.includes('submitted')) {
        return 'gratitude';
    }
    return 'calm';
}
```

### 3. Education Learning Tutor

```typescript
// System prompt for education
const EDUCATION_SYSTEM_PROMPT = `You are an encouraging AI tutor. Your role is to:
- Help students understand concepts
- Provide hints without giving away answers
- Celebrate correct answers
- Encourage after incorrect answers

Be supportive, patient, and educational. Use the Socratic method.
Never just give the answer - guide students to discover it themselves.`;

// Emotion mapping for education
function getEducationEmotion(
    sentiment: string,
    message: string,
    isCorrect?: boolean
): string {
    // Celebration for correct answers
    if (
        isCorrect === true ||
        message.includes('correct') ||
        message.includes('great job')
    ) {
        return 'pride';
    }
    // Encouragement for incorrect answers
    if (
        isCorrect === false ||
        message.includes("let's try") ||
        message.includes('not quite')
    ) {
        return 'encouragement';
    }
    // Thinking when asking questions
    if (message.includes('?') || message.includes('think about')) {
        return 'contemplation';
    }
    return mapSentimentToEmotion(sentiment);
}
```

## Streaming Responses

For real-time emotional responses during streaming:

```typescript
async function streamChatResponse(
    message: string,
    onChunk: (chunk: string) => void
) {
    const stream = await anthropic.messages.stream({
        model: 'claude-haiku-4.5-20250929',
        max_tokens: 1024,
        messages: [{ role: 'user', content: message }],
    });

    let fullResponse = '';
    let lastSentiment = 'neutral';

    for await (const chunk of stream) {
        if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
        ) {
            const text = chunk.delta.text;
            fullResponse += text;
            onChunk(text);

            // Analyze sentiment every 50 characters
            if (fullResponse.length % 50 === 0) {
                const currentSentiment = detectSentiment(fullResponse);
                if (currentSentiment !== lastSentiment) {
                    const emotion = mapSentimentToEmotion(currentSentiment);
                    // Transition mascot emotion
                    mascot?.transitionTo(emotion, { duration: 800 });
                    lastSentiment = currentSentiment;
                }
            }
        }
    }

    return fullResponse;
}
```

## Error Handling

```typescript
async function handleChatError(error: any, mascot: any) {
    console.error('Chat error:', error);

    // Transition to concern emotion
    await mascot?.transitionTo('concern', { duration: 800 });

    // Provide user-friendly error message
    let errorMessage = 'I encountered an error. Please try again.';

    if (error.status === 429) {
        errorMessage =
            "I'm receiving too many requests. Please wait a moment and try again.";
    } else if (error.status === 401) {
        errorMessage =
            'There was an authentication error. Please contact support.';
    } else if (error.status === 500) {
        errorMessage =
            'The AI service is temporarily unavailable. Please try again later.';
    }

    return errorMessage;
}
```

## Rate Limiting & Caching

### Server-Side Rate Limiting

```typescript
// site/src/app/api/chat/rate-limit.ts
import { NextRequest } from 'next/server';

const rateLimit = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
    req: NextRequest,
    maxRequests = 10,
    windowMs = 60000
): boolean {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();

    const userLimit = rateLimit.get(ip);

    if (!userLimit || now > userLimit.resetAt) {
        rateLimit.set(ip, { count: 1, resetAt: now + windowMs });
        return true;
    }

    if (userLimit.count >= maxRequests) {
        return false;
    }

    userLimit.count++;
    return true;
}

// Usage in route
export async function POST(req: NextRequest) {
    if (!checkRateLimit(req)) {
        return NextResponse.json(
            { error: 'Rate limit exceeded. Please try again later.' },
            { status: 429 }
        );
    }

    // ... rest of handler
}
```

### Response Caching

```typescript
// Cache common queries
const responseCache = new Map<
    string,
    { response: string; timestamp: number }
>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedResponse(message: string): string | null {
    const cached = responseCache.get(message.toLowerCase());
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.response;
    }
    return null;
}

function setCachedResponse(message: string, response: string) {
    responseCache.set(message.toLowerCase(), {
        response,
        timestamp: Date.now(),
    });
}
```

## Environment Setup

```bash
# .env.local
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Or for OpenAI
OPENAI_API_KEY=your_openai_api_key_here
```

```typescript
// Verify API key is set
if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
}
```

## Testing LLM Integration

```typescript
// Test suite for LLM integration
describe('LLM Integration', () => {
    it('should detect positive sentiment', () => {
        const text = 'This is great! Thank you so much!';
        const sentiment = detectSentiment(text);
        expect(sentiment).toBe('positive');
    });

    it('should map sentiment to correct emotion', () => {
        const emotion = mapSentimentToEmotion('positive');
        expect(emotion).toBe('joy');
    });

    it('should handle API errors gracefully', async () => {
        // Mock API error
        const error = { status: 429 };
        const message = await handleChatError(error, mockMascot);
        expect(message).toContain('too many requests');
    });

    it('should apply context-aware emotion mapping', () => {
        const emotion = mapSentimentToEmotion(
            'worried',
            'healthcare',
            'response'
        );
        expect(emotion).toBe('empathy');
    });
});
```

## Performance Optimization

```typescript
// Debounce chat requests
import { debounce } from 'lodash';

const debouncedSendMessage = debounce(async (message: string) => {
    await sendMessage(message);
}, 500);

// Optimize for mobile
const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

const chatConfig = {
    maxTokens: isMobile ? 512 : 1024, // Shorter responses on mobile
    enableStreaming: !isMobile, // Disable streaming on mobile for reliability
    cacheResponses: true,
};
```

## Key Files

- **API Route**: `site/src/app/api/chat/route.ts`
- **AI Assistant Component**: `site/src/components/PremiumAIAssistant.tsx`
- **Sentiment Detection**: `site/src/utils/sentiment.ts`
- **Emotion Mapping**: `site/src/utils/emotion-mapper.ts`
- **Use Case Handlers**: `site/src/app/use-cases/*/page.tsx`

## Resources

- [Anthropic API Docs](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [Claude Haiku 4.5 Guide](https://www.anthropic.com/news/claude-haiku-4-5)
- [Sentiment Analysis Guide](https://en.wikipedia.org/wiki/Sentiment_analysis)
- [Emotive Mascot LLM Plugin](../../src/plugins/LLMEmotionPlugin.js)
