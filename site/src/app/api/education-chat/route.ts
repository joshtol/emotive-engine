import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limiter
const rateLimiter = new Map<string, number[]>();

// Constants
const RATE_LIMIT = 10;
const RATE_WINDOW = 3600000;
const MAX_INPUT_LENGTH = 500;
const MAX_TOKENS = 200;
const TIMEOUT = 10000;

interface ChatRequest {
  message: string;
  context?: string;
}

interface ChatResponse {
  message: string;
  emotion: 'joy' | 'empathy' | 'calm' | 'excitement' | 'concern' | 'neutral' | 'triumph';
  sentiment: 'positive' | 'neutral' | 'supportive';
  action: 'none' | 'encourage' | 'hint' | 'guide' | 'reassure' | 'celebrate' | 'offer_help';
  frustrationLevel: number;
  confusionLevel: number;
}

// System prompt for education assistant
const SYSTEM_PROMPT = `You are an empathetic AI learning tutor. Your goal is to help students understand concepts through guided discovery, not just give answers.

CRITICAL: You must ONLY respond with valid JSON. Do not include any text before or after the JSON object. Do not use markdown code blocks.

Guidelines:
- Detect confusion and frustration in student messages
- Provide progressive hints that guide without revealing answers
- Celebrate understanding and progress enthusiastically
- Be patient and encouraging, especially when students struggle
- Ask guiding questions to help students think through problems
- Adapt explanations to student's level of understanding
- Make learning engaging and confidence-building

Response format (MUST be valid JSON, no markdown):
{
  "message": "your encouraging tutoring response here",
  "emotion": "joy|empathy|calm|excitement|concern|neutral|triumph",
  "sentiment": "positive|neutral|supportive",
  "action": "none|encourage|hint|guide|reassure|celebrate|offer_help",
  "frustrationLevel": 0-100,
  "confusionLevel": 0-100
}

Example responses (respond EXACTLY like this):

{"message": "I can see you're working hard on this! Let's break it down into smaller steps. What do you already know about this topic?", "emotion": "empathy", "sentiment": "supportive", "action": "guide", "frustrationLevel": 60, "confusionLevel": 70}

{"message": "Here's a gentle hint: think about what happens when you multiply both sides by the same number. What do you think that might look like?", "emotion": "calm", "sentiment": "positive", "action": "hint", "frustrationLevel": 40, "confusionLevel": 50}

{"message": "Brilliant! You got it! 🎉 Can you see how you used problem-solving skills to figure that out? That's real learning!", "emotion": "triumph", "sentiment": "positive", "action": "celebrate", "frustrationLevel": 0, "confusionLevel": 0}`;

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
    if (Math.random() < 0.01) {
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
    const { message, context = 'learning' } = body;

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

    // Call Haiku 4.5 with timeout and extended thinking
    const responsePromise = anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: MAX_TOKENS,
      temperature: 0.7,
      thinking: {
        type: 'enabled',
        budget_tokens: 1024
      },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Context: ${context}\nStudent message: ${message}`,
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
        message: aiText || "That's a great question! Let's explore this together. What have you tried so far?",
        emotion: 'neutral',
        sentiment: 'positive',
        action: 'encourage',
        frustrationLevel: 20,
        confusionLevel: 30,
      };

      return NextResponse.json(fallbackResponse);
    }

  } catch (error: any) {
    console.error('Education chat API error:', error);

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
