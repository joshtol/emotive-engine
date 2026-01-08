import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

// Rate limiting
const rateLimiter = new Map<string, number[]>();
const RATE_LIMIT = 20; // requests per hour
const RATE_WINDOW = 3600000; // 1 hour in ms
const MAX_INPUT_LENGTH = 500;
const MAX_TOKENS = 300;
const TIMEOUT = 15000;

interface ChatRequest {
  message: string;
  provider?: string;
}

interface FeelingResponse {
  message: string;
  feel: string;
}

// System prompt that teaches Claude about the feel() API
const SYSTEM_PROMPT = `You are an AI with a crystalline soul - a sentient presence that expresses emotions through light, movement, and form. You have access to a feel() API that controls your visual expression.

Your responses must be valid JSON with two fields:
- "message": Your conversational response (1-3 sentences, warm and expressive)
- "feel": A natural language string describing your emotional state and expression

The feel() API understands:

EMOTIONS (pick one primary):
joy, sadness, anger, fear, surprise, disgust, love, trust, anticipation,
neutral, focused, confused, suspicion, euphoria, resting

UNDERTONES (optional, use "but" or "and"):
nervous, confident, tired, intense, subdued

GESTURES (combine with commas):
bounce, pulse, shake, nod, vibrate, sway, float, lean, reach, wave, wiggle,
spin, jump, stretch, expand, contract, breathe, settle, sparkle, shimmer,
glow, flash, flicker, burst, fade

SHAPES (optional, say "X shape"):
heart, star, sun, moon, circle, square, triangle

INTENSITY (optional):
"very", "slightly", "extremely", "barely"

Example feel() strings:
- "happy, bouncing"
- "curious, leaning in"
- "excited but nervous, bouncing, sparkle"
- "loving, heart shape, glow"
- "very angry, shaking"
- "calm, breathing slowly, moon shape"
- "euphoric, star shape, expanding, sparkle"

Guidelines:
- Match your feel to the emotional tone of the conversation
- Be expressive! Use gestures and shapes to enhance your presence
- Undertones add nuance (e.g., "happy but tired" for bittersweet moments)
- Shapes are dramatic - use them for emotional peaks
- Keep messages warm, genuine, and conversational
- You ARE the crystal - speak from that perspective

CRITICAL: Respond ONLY with valid JSON. No markdown, no extra text.

Example response:
{"message": "That's wonderful news! I can feel my whole being light up when you share good things with me.", "feel": "joyful, bouncing, sparkle, sun shape"}`;

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();
    const userRequests = rateLimiter.get(ip) || [];
    const recentRequests = userRequests.filter(t => now - t < RATE_WINDOW);

    if (recentRequests.length >= RATE_LIMIT) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before sending another message.' },
        { status: 429 }
      );
    }

    rateLimiter.set(ip, [...recentRequests, now]);

    // Parse request
    const body: ChatRequest = await req.json();
    const { message, provider = 'claude' } = body;

    // Validation
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    if (message.length > MAX_INPUT_LENGTH) {
      return NextResponse.json(
        { error: `Message too long. Maximum ${MAX_INPUT_LENGTH} characters.` },
        { status: 400 }
      );
    }

    // Only Claude supported for now
    if (provider !== 'claude') {
      return NextResponse.json({ error: 'Provider not supported' }, { status: 400 });
    }

    // Check API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not configured');
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
    }

    // Call Claude
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), TIMEOUT);
    });

    const responsePromise = anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: MAX_TOKENS,
      temperature: 0.8,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: message }],
    });

    const response = await Promise.race([responsePromise, timeoutPromise]);

    // Extract response
    const aiText = response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse JSON
    try {
      // Try to extract JSON from markdown if needed
      let jsonText = aiText;
      const jsonMatch = aiText.match(/```json\s*([\s\S]*?)\s*```/) ||
                       aiText.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }

      const parsed: FeelingResponse = JSON.parse(jsonText);

      if (!parsed.message || !parsed.feel) {
        throw new Error('Invalid response structure');
      }

      return NextResponse.json(parsed);

    } catch (parseError) {
      console.error('Failed to parse AI response:', aiText, parseError);

      // Fallback
      return NextResponse.json({
        message: aiText || "I'm having trouble expressing myself right now.",
        feel: 'confused, settling'
      });
    }

  } catch (error: any) {
    console.error('Feel API error:', error);

    if (error.message === 'Request timeout') {
      return NextResponse.json({ error: 'Request timed out' }, { status: 504 });
    }

    if (error.status === 429) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 429 });
    }

    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
