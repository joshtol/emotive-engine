/**
 * Feature Flags API Endpoint
 * Provides feature flag configuration for the Emotive Engine
 */

import { NextRequest, NextResponse } from 'next/server';

// Default feature flags configuration
const DEFAULT_FLAGS = {
  // Core features
  enableParticles: { enabled: true, variant: 'default' },
  enableAudio: { enabled: true, variant: 'default' },
  enableEmotions: { enabled: true, variant: 'default' },
  enableGestures: { enabled: true, variant: 'default' },

  // Performance features
  enableGradientCache: { enabled: true, variant: 'default' },
  enableLazyLoading: { enabled: true, variant: 'default' },
  enableCodeSplitting: { enabled: false, variant: 'default' },

  // Experimental features
  enableWebGL: { enabled: false, variant: 'default' },
  enableWebGPU: { enabled: false, variant: 'default' },
  enableOffscreenCanvas: { enabled: false, variant: 'default' },

  // Debug features
  enableDebugMode: { enabled: false, variant: 'default' },
  enablePerformanceOverlay: { enabled: false, variant: 'default' },
  enableErrorReporting: { enabled: true, variant: 'default' },

  // A/B test examples
  buttonColor: { enabled: true, variant: 'blue' },
  animationSpeed: { enabled: true, variant: 'normal' },
  particleDensity: { enabled: true, variant: 'medium' },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, attributes, flags } = body;

    // Log request for debugging (optional)
    console.log('Feature flags requested by:', userId);

    // In a real application, you might:
    // 1. Fetch user-specific flags from a database
    // 2. Apply targeting rules based on attributes
    // 3. Run A/B test experiments
    // 4. Log flag evaluations for analytics

    // For now, return default flags
    const responseFlags: Record<string, any> = {};

    // If specific flags were requested, only return those
    if (Array.isArray(flags) && flags.length > 0) {
      flags.forEach((flagKey: string) => {
        if (DEFAULT_FLAGS[flagKey as keyof typeof DEFAULT_FLAGS]) {
          responseFlags[flagKey] = DEFAULT_FLAGS[flagKey as keyof typeof DEFAULT_FLAGS];
        }
      });
    } else {
      // Return all flags
      Object.assign(responseFlags, DEFAULT_FLAGS);
    }

    return NextResponse.json({
      flags: responseFlags,
      userId,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Feature flags API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch feature flags',
        flags: DEFAULT_FLAGS,
      },
      { status: 500 }
    );
  }
}

// Also support GET requests for simple flag retrieval
export async function GET() {
  return NextResponse.json({
    flags: DEFAULT_FLAGS,
    timestamp: Date.now(),
  });
}
