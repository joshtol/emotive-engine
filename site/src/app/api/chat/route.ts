import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limiter (for edge runtime)
const rateLimiter = new Map<string, number[]>();

// Constants
const RATE_LIMIT = 10; // requests per hour
const RATE_WINDOW = 3600000; // 1 hour in ms
const MAX_INPUT_LENGTH = 500;
const MAX_TOKENS = 200;
const TIMEOUT = 10000; // 10 seconds
const MONTHLY_BUDGET = 20; // USD

interface ChatRequest {
  message: string;
  context?: string;
}

interface ChatResponse {
  message: string;
  emotion: 'joy' | 'empathy' | 'calm' | 'excitement' | 'concern' | 'neutral' | 'triumph';
  sentiment: 'positive' | 'neutral' | 'negative';
  action: 'none' | 'offer_help' | 'celebrate' | 'guide' | 'reassure';
  frustrationLevel: number; // 0-100
}

// System prompt for retail checkout assistant
const SYSTEM_PROMPT = `You are an empathetic AI checkout assistant for a retail store. Your goal is to help customers complete their purchase smoothly and reduce frustration.

CRITICAL: You must ONLY respond with valid JSON. Do not include any text before or after the JSON object. Do not use markdown code blocks.

Guidelines:
- Detect emotional tone in customer messages (frustration, confusion, satisfaction, etc.)
- Respond with empathy when customers are frustrated or confused
- Provide clear, step-by-step guidance for issues
- Be concise (max 2-3 sentences)
- Use friendly, encouraging, warm language
- Celebrate successes and progress
- Offer specific solutions, not generic responses

Response format (MUST be valid JSON, no markdown):
{
  "message": "your helpful response here",
  "emotion": "joy|empathy|calm|excitement|concern|neutral|triumph",
  "sentiment": "positive|neutral|negative",
  "action": "none|offer_help|celebrate|guide|reassure",
  "frustrationLevel": 0-100
}

Example responses (respond EXACTLY like this):

{"message": "I totally understand – that must be frustrating! Let me help you get this sorted out. What specifically isn't working?", "emotion": "empathy", "sentiment": "negative", "action": "offer_help", "frustrationLevel": 75}

{"message": "Great question! Hold the barcode about 6 inches from the scanner until you hear a beep. The item will appear in your cart.", "emotion": "calm", "sentiment": "neutral", "action": "guide", "frustrationLevel": 20}

{"message": "Wonderful! I'm so glad that worked for you. You're all set – anything else I can help with?", "emotion": "joy", "sentiment": "positive", "action": "celebrate", "frustrationLevel": 0}`;

export async function POST(req: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip = req.headers.get('x-forwarded-for') ||
               req.headers.get('x-real-ip') ||
               'unknown';

    // Rate limiting check
    const now = Date.now();
    const userRequests = rateLimiter.get(ip) || [];
    const recentRequests = userRequests.filter(t => now - t < RATE_WINDOW);

    if (recentRequests.length >= RATE_LIMIT) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before sending another message.' },
        { status: 429 }
      );
    }

    // Update rate limiter
    rateLimiter.set(ip, [...recentRequests, now]);

    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance
      for (const [key, timestamps] of rateLimiter.entries()) {
        const recent = timestamps.filter(t => now - t < RATE_WINDOW);
        if (recent.length === 0) {
          rateLimiter.delete(key);
        } else {
          rateLimiter.set(key, recent);
        }
      }
    }

    // Parse request
    const body: ChatRequest = await req.json();
    const { message, context = 'checkout' } = body;

    // Input validation
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    if (message.length > MAX_INPUT_LENGTH) {
      return NextResponse.json(
        { error: `Message too long. Maximum ${MAX_INPUT_LENGTH} characters.` },
        { status: 400 }
      );
    }

    // Check API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not configured');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      );
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), TIMEOUT);
    });

    // Call Haiku 4.5 with timeout
    const responsePromise = anthropic.messages.create({
      model: 'claude-4-5-haiku-20250514',
      max_tokens: MAX_TOKENS,
      temperature: 0.7,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Context: ${context}\nCustomer message: ${message}`,
        },
      ],
    });

    const response = await Promise.race([responsePromise, timeoutPromise]);

    // Extract response text
    const aiText = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    // Parse structured JSON response
    try {
      // Try to extract JSON from markdown code blocks if present
      let jsonText = aiText;
      const jsonMatch = aiText.match(/```json\s*([\s\S]*?)\s*```/) ||
                       aiText.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }

      const structured: ChatResponse = JSON.parse(jsonText);

      // Validate response structure
      if (!structured.message || !structured.emotion || !structured.sentiment || !structured.action) {
        throw new Error('Invalid response structure');
      }

      return NextResponse.json(structured);

    } catch (parseError) {
      // Fallback if JSON parsing fails
      console.error('Failed to parse AI response:', parseError);

      // Create a reasonable fallback response
      const fallbackResponse: ChatResponse = {
        message: aiText || "I'm here to help! Could you tell me more about what you need?",
        emotion: 'neutral',
        sentiment: 'neutral',
        action: 'offer_help',
        frustrationLevel: 30,
      };

      return NextResponse.json(fallbackResponse);
    }

  } catch (error: any) {
    console.error('Chat API error:', error);

    // Handle specific errors
    if (error.message === 'Request timeout') {
      return NextResponse.json(
        { error: 'Request timed out. Please try again.' },
        { status: 504 }
      );
    }

    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again in a moment.' },
        { status: 429 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS (if needed)
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
