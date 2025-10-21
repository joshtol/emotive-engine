# Retail Use Case Setup Guide

## Quick Start

### 1. Install Anthropic SDK

```bash
cd site
npm install @anthropic-ai/sdk
```

### 2. Set Up API Key

#### Option A: Local Development

Create `site/.env.local`:

```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

#### Option B: Vercel (Production)

```
1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Add:
   - Name: ANTHROPIC_API_KEY
   - Value: sk-ant-your-key-here
   - Environments: Production, Preview, Development
```

### 3. Get Your API Key

1. Visit https://console.anthropic.com/
2. Sign in / Create account
3. Navigate to "API Keys"
4. Click "Create Key"
5. Copy the key (starts with `sk-ant-`)

### 4. Test Locally

```bash
npm run dev
```

Visit: http://localhost:3000/use-cases/retail

## What's Included

### 🤖 AI Chat Component (`AICheckoutAssistant.tsx`)

- Live conversational AI powered by Claude Haiku 4.5
- Real-time emotion detection
- Frustration level meter
- Mascot responds to detected emotions
- Rate limited (10 requests/hour per IP)

### 🛒 Checkout Simulation (`CheckoutSimulation.tsx`)

- Interactive product scanning
- Error recovery demo (15% error rate)
- 6-step checkout flow
- Mascot reacts to each step
- Complete emotional journey

### 📄 Main Page (`page.tsx`)

- Scroll-following hero mascot
- Ultra-modern glassmorphism
- Official brand colors (#DD4A9A)
- Responsive mobile design
- Full Cherokee visual DNA

### 🔒 API Route (`api/chat/route.ts`)

- Edge runtime for fast responses
- Rate limiting (10 req/hour)
- Input validation (500 char max)
- Timeout protection (10 seconds)
- Structured JSON responses

## Features

### AI Capabilities

✅ Emotion detection (joy, empathy, concern, etc.) ✅ Sentiment analysis
(positive/neutral/negative) ✅ Frustration level tracking (0-100) ✅ Action
recommendations (help, celebrate, guide) ✅ Natural language conversations

### Mascot Integration

✅ 15 emotions (joy, empathy, calm, etc.) ✅ 50+ gestures (wave, bounce, nod,
shake, etc.) ✅ Real-time response to AI emotions ✅ Scroll-driven animations ✅
Gaze tracking in chat ✅ Shape morphing (sun for celebration) ✅ Combo effects
(radiance for success)

### Visual Design

✅ 2025 ultra-modern glassmorphism ✅ Backdrop blur: 40px ✅ Gradient borders
and accents ✅ Responsive typography (clamp) ✅ Ambient light effects ✅ Smooth
cubic-bezier animations ✅ Mobile-optimized layouts

## Cost Estimation

### Haiku 4.5 Pricing

- Input: $0.80/MTok
- Output: $4.00/MTok

### Projected Costs

| Traffic         | Monthly Cost |
| --------------- | ------------ |
| 100 visitors    | ~$0.05       |
| 500 visitors    | ~$0.25       |
| 1,000 visitors  | ~$0.50       |
| 10,000 visitors | ~$5.00       |

**With rate limiting**: Max ~$20/month even with heavy traffic

## Testing the AI

### Example Prompts

1. "I can't scan this item" → Tests frustration detection
2. "This is taking forever!" → Tests high frustration response
3. "How do I use a coupon?" → Tests neutral assistance
4. "Thanks for your help!" → Tests positive celebration

### Expected Behavior

- **High frustration** → Mascot shows empathy + offers help
- **Confusion** → Mascot stays calm + provides guidance
- **Success** → Mascot celebrates with joy + glow effect

## Architecture

```
User Browser
    ↓
Retail Page (Next.js)
    ↓
AI Chat Component
    ↓
/api/chat (Edge Function)
    ↓
Anthropic API (Haiku 4.5)
    ↓
Structured Response
    ↓
Mascot Emotion Update
```

## Rate Limiting

### Protection Mechanisms

- 10 requests per hour per IP
- Input limited to 500 characters
- 10-second timeout per request
- In-memory tracking (edge runtime)
- Automatic cleanup of old entries

### Bypass for Testing

Temporarily increase in `api/chat/route.ts`:

```typescript
const RATE_LIMIT = 100; // More requests for testing
```

## Troubleshooting

### "AI service not configured"

→ Add ANTHROPIC_API_KEY to environment variables

### "Rate limit exceeded"

→ Wait 1 hour or increase RATE_LIMIT for testing

### Mascot not appearing

→ Check console for EmotiveMascot errors → Ensure /emotive-engine.js is
accessible

### API timeout errors

→ Anthropic API might be slow → Check internet connection → Try again in a
moment

## Production Checklist

Before deploying:

- [ ] Add ANTHROPIC_API_KEY to Vercel
- [ ] Test rate limiting
- [ ] Verify mobile responsiveness
- [ ] Check mascot performance on mobile
- [ ] Test all example prompts
- [ ] Ensure error handling works
- [ ] Monitor API costs in Anthropic dashboard

## Next Steps

### Enhancements

1. Add conversation history
2. Implement session management
3. Add voice input/output
4. Create analytics dashboard
5. A/B test different prompts
6. Add multilingual support

### Monitoring

- Track frustration patterns
- Monitor API costs daily
- Analyze conversation topics
- Measure satisfaction scores

## Support

Questions? Check:

- Anthropic Docs: https://docs.anthropic.com/
- Emotive API: /API.md
- Element Targeting: /src/core/positioning/elementTargeting/API.md

---

**Cost**: < $1/month for demo traffic **Value**: Infinite - Live AI that no
competitor can match!
