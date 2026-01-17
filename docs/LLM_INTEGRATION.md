# LLM Integration Guide

This guide explains how to integrate Large Language Models (Claude, GPT, Gemini, etc.) with the Emotive Engine to create expressive AI mascots that respond emotionally to conversations.

## Quick Start

The simplest way to control the mascot from an LLM is the `feel()` method:

```javascript
// In your frontend, after LLM responds
mascot.feel('happy, nodding')
mascot.feel('curious, leaning in')
mascot.feel('excited but nervous, bouncing')
```

The engine parses natural language and translates it to emotions, gestures, and shapes.

## The feel() API

### Basic Usage

```javascript
// Simple emotion
mascot.feel('happy')

// Emotion with gesture
mascot.feel('curious, leaning in')

// Multiple gestures
mascot.feel('excited, bouncing, sparkle')

// With undertone (modifier emotion)
mascot.feel('happy but nervous')

// With shape morph
mascot.feel('loving, heart shape')

// With intensity
mascot.feel('very angry, shaking')

// Agreement/disagreement (triggers nod/shake)
mascot.feel('yes')  // nods
mascot.feel('no')   // shakes head
```

### Return Value

```javascript
const result = mascot.feel('happy, bouncing')

// Success
{
  success: true,
  error: null,
  parsed: {
    emotion: 'joy',
    undertone: 'clear',
    gestures: ['bounce'],
    shape: null,
    intensity: 0.55,
    duration: 1500,
    raw: 'happy, bouncing'
  }
}

// Failure
{
  success: false,
  error: 'No actionable intent found',
  parsed: { ... }
}
```

### Rate Limiting

The `feel()` method is rate-limited to **10 calls per second** to prevent spam. If exceeded:

```javascript
{
  success: false,
  error: 'Rate limit exceeded',
  parsed: null
}
```

## LLM System Prompt

Add this to your LLM's system prompt to enable mascot control:

```
You have an animated mascot that responds to your emotional state.
After each response, output a feel() directive on a new line:

FEEL: <emotion>, <gesture>

Available emotions: joy, sadness, anger, fear, surprise, disgust,
love, trust, anticipation, neutral, focused, confused, suspicion,
euphoria, resting

Available gestures: nod, shake, bounce, pulse, lean, wave, breathe,
settle, sparkle, glow, spin, expand, contract, float, sway, wiggle

Available shapes: circle, heart, star, sun, moon, square, triangle

Examples:
- Greeting: FEEL: happy, wave
- Thinking: FEEL: focused, leaning in
- Confused: FEEL: confused, tilt
- Excited: FEEL: excited, bouncing, sparkle
- Empathetic: FEEL: sad but caring, nod
- Celebrating: FEEL: euphoric, star shape, sparkle
- Directional: FEEL: step left
- Dance move: FEEL: slide right, excited
- Upward: FEEL: hands up, stepUp, joy

Use natural language - the engine understands synonyms like
"nervous", "anxious", "worried" → fear.
```

## Parsing in Your Application

```javascript
// Extract feel directive from LLM response
function extractFeel(llmResponse) {
  const match = llmResponse.match(/FEEL:\s*(.+?)(?:\n|$)/i)
  return match ? match[1].trim() : null
}

// Usage
const response = await llm.chat(userMessage)
const feelDirective = extractFeel(response)

if (feelDirective) {
  mascot.feel(feelDirective)
}

// Display response without the directive
const cleanResponse = response.replace(/FEEL:\s*.+?(?:\n|$)/gi, '')
displayToUser(cleanResponse)
```

## Vocabulary Reference

### Emotions (15)

| Canonical | Common Synonyms |
|-----------|-----------------|
| `joy` | happy, excited, delighted, cheerful, elated, thrilled |
| `sadness` | sad, unhappy, down, depressed, melancholy, blue |
| `anger` | angry, mad, furious, irritated, annoyed, frustrated |
| `fear` | scared, afraid, nervous, anxious, worried, terrified |
| `surprise` | surprised, shocked, amazed, astonished, startled |
| `disgust` | disgusted, grossed out, revolted, repulsed |
| `love` | loving, affectionate, adoring, caring, tender |
| `trust` | trusting, confident, assured, believing |
| `anticipation` | eager, expecting, hopeful, looking forward |
| `neutral` | calm, normal, baseline, default |
| `focused` | curious, interested, attentive, concentrated |
| `confused` | puzzled, perplexed, bewildered, uncertain |
| `suspicion` | suspicious, skeptical, doubtful, wary |
| `euphoria` | ecstatic, overjoyed, blissful, elated |
| `resting` | relaxed, at ease, peaceful, serene |

### Undertones (6)

Undertones modify the primary emotion:

| Undertone | Effect | Example |
|-----------|--------|---------|
| `nervous` | Adds jittery energy | "happy but nervous" |
| `confident` | Adds assurance | "focused and confident" |
| `tired` | Adds weariness | "sad, tired" |
| `intense` | Heightens expression | "angry, intense" |
| `subdued` | Softens expression | "joy, subdued" |
| `clear` | No modification (default) | "happy" |

### Gestures (60+)

**Motion (Base/Ongoing):**
- `bounce`, `pulse`, `shake`, `nod`, `vibrate`, `sway`, `float`, `orbit`
- `lean` (leaning in), `reach`, `point`, `wave`, `wiggle`, `groove`

**Directional (Beat-Synced Dance Moves):**
- `stepLeft`, `stepRight`, `stepUp`, `stepDown` - Quick 1-beat weight shifts
- `slideLeft`, `slideRight` - Smooth 2-beat glides
- `leanLeft`, `leanRight` - Body tilt (2 beats)
- `kickLeft`, `kickRight` - Quick side kicks (1 beat)
- `spinLeft`, `spinRight` - Rotation direction

**Directional (Storytelling):**
- `floatUp`, `floatDown`, `floatLeft`, `floatRight` - Ethereal drift (~2000ms)
- `pointUp`, `pointDown`, `pointLeft`, `pointRight` - Indication (~500ms)

**Accent (Dance-Friendly Punctuation):**
- `pop`, `bob`, `dip`, `flare`, `swell`, `swagger`

**Transform:**
- `spin`, `spinLeft`, `spinRight`, `jump`, `stretch`, `expand`, `contract`, `twist`, `tilt`, `hula`

**Effects:**
- `sparkle`, `shimmer`, `glow`, `flash`, `flicker`, `burst`, `fade`
- `breathe`, `settle`, `peek`, `hold`, `rain`

### Shapes (12)

**Geometric:** `circle`, `square`, `triangle`, `sphere`

**Organic:** `heart`, `suspicion` (sly grin)

**Astronomical:** `star`, `sun`, `moon`, `lunar` (blood moon), `solar` (eclipse), `eclipse`

### Intensity Modifiers

| Modifier | Intensity | Example |
|----------|-----------|---------|
| `barely`, `slightly` | 0.1-0.3 | "barely happy" |
| `somewhat`, `kind of` | 0.3-0.5 | "kinda nervous" |
| (default) | 0.5-0.6 | "happy" |
| `very`, `really` | 0.7-0.85 | "very excited" |
| `extremely`, `incredibly` | 0.85-0.95 | "extremely angry" |
| `absolutely`, `completely` | 0.95-1.0 | "absolutely furious" |

## Preview Without Execution

To see what an intent will parse to without executing it:

```javascript
const parsed = mascot.parseIntent('excited but nervous, bouncing')
console.log(parsed)
// {
//   emotion: 'joy',
//   undertone: 'nervous',
//   gestures: ['bounce'],
//   shape: null,
//   intensity: 0.55,
//   ...
// }
```

## Get Available Vocabulary

For dynamic UI or LLM context:

```javascript
const vocab = EmotiveMascotPublic.getFeelVocabulary()
// {
//   emotions: ['joy', 'sadness', 'anger', ...],
//   undertones: ['nervous', 'confident', 'tired', ...],
//   gestures: ['bounce', 'pulse', 'shake', ...],
//   shapes: ['circle', 'heart', 'star', ...]
// }
```

## Architecture

```
User Input → LLM → "FEEL: happy, wave" → feel() → IntentParser
                                                      ↓
                                               Tokenizer
                                                      ↓
                                          Synonym Lookup (~1400 words)
                                                      ↓
                                          Conflict Resolution
                                                      ↓
                                          { emotion, gesture, shape }
                                                      ↓
                                          mascot.setEmotion()
                                          mascot.express()
                                          mascot.morphTo()
```

## Streaming Responses

For streaming LLM responses, call `feel()` when you detect the directive:

```javascript
let buffer = ''

stream.on('data', chunk => {
  buffer += chunk

  // Check for complete FEEL directive
  const match = buffer.match(/FEEL:\s*(.+?)\n/)
  if (match) {
    mascot.feel(match[1])
    buffer = buffer.replace(match[0], '')
  }
})
```

## Error Handling

```javascript
const result = mascot.feel(intent)

if (!result.success) {
  if (result.error === 'Rate limit exceeded') {
    // Too many calls, wait and retry
    setTimeout(() => mascot.feel(intent), 100)
  } else {
    // Unrecognized intent - fall back to neutral
    console.warn('Unrecognized intent:', result.parsed.unrecognized)
    mascot.feel('neutral')
  }
}
```

## Best Practices

1. **Keep intents simple** - One emotion, 1-2 gestures max
2. **Use natural language** - "happy and bouncy" works as well as "joy, bounce"
3. **Match the conversation** - Don't force emotions that don't fit
4. **Use undertones for nuance** - "confident but nervous" is more expressive than just "nervous"
5. **Let gestures complement emotions** - A "curious, leaning in" feels natural
6. **Use shapes sparingly** - Shape morphs are dramatic; save for key moments

## Example: Full Integration

```javascript
// Initialize mascot
const mascot = new EmotiveMascotPublic()
await mascot.init(canvas)
mascot.start()
mascot.feel('neutral, breathing')

// Chat handler
async function handleChat(userMessage) {
  // Show thinking state
  mascot.feel('focused, leaning in')

  // Get LLM response
  const response = await claude.chat({
    system: LLM_SYSTEM_PROMPT,
    message: userMessage
  })

  // Extract and apply feel directive
  const feel = extractFeel(response)
  if (feel) {
    mascot.feel(feel)
  }

  // Display clean response
  return response.replace(/FEEL:.+?\n/g, '')
}
```

## Troubleshooting

**Intent not recognized:**
- Check `result.parsed.unrecognized` for unknown words
- Use simpler, more common synonyms
- Verify spelling

**Gesture not playing:**
- Some gestures conflict; only one plays at a time
- Check that the gesture name is valid
- Ensure the engine is started (`mascot.start()`)

**Rate limit errors:**
- Batch multiple intents: `feel('happy, bounce, sparkle')` instead of 3 calls
- Add delays between calls in rapid sequences

---

*Last updated: December 2025*
