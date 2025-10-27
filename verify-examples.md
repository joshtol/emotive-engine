# Examples Verification Checklist

## Quick Test: Are Examples Working?

### Test 1: CDN Example (No Build Required)

**File:** `examples/hello-world-cdn.html`

**Expected:**

- ✅ Mascot appears on canvas
- ✅ Buttons change emotions
- ✅ Console shows: "✅ Mascot is alive!"

**If it fails:**

- Check browser console for actual errors
- Ignore: "Live reload enabled" (that's your dev server)
- Ignore: "Failed to fetch feature flags" (that's VS Code Live Server)

---

### Test 2: Local Build Example (Requires Build)

**File:** `examples/hello-world.html`

**Step 1: Build the project**

```bash
npm run build:dev
```

**Step 2: Verify dist/ folder exists**

```bash
ls dist/mascot.js
# Should show: dist/mascot.js
```

**Step 3: Open example** Open `examples/hello-world.html` in browser

**Expected:**

- ✅ Mascot appears on canvas
- ✅ Buttons change emotions
- ✅ Console shows: "✅ Mascot is alive!"

**If it fails:**

- Check if dist/mascot.js exists
- Run `npm run build:dev` again
- Check console for import errors

---

## Common Non-Errors (Safe to Ignore)

These are **NOT** Emotive Engine errors:

```
❌ Live reload enabled.
❌ Failed to load resource: .../api/feature-flags
❌ Failed to fetch feature flags: Error: HTTP 405
```

**These are from:** VS Code Live Server extension - they're harmless

---

## Actual Errors to Watch For

These **ARE** real problems:

```
🚨 Uncaught ReferenceError: EmotiveMascot is not defined
🚨 Failed to load module: ../dist/mascot.js
🚨 Cannot read properties of undefined (reading 'setEmotion')
```

**Solution:** Run `npm run build:dev`

---

## Current Status of Examples

| Example                           | Import Path          | Status                 |
| --------------------------------- | -------------------- | ---------------------- |
| hello-world-cdn.html              | CDN                  | ✅ Works without build |
| hello-world.html                  | ../dist/mascot.js    | ✅ Fixed - needs build |
| basic-usage.html                  | ../dist/mascot.js    | ✅ Fixed - needs build |
| bpm-comparison-real.html          | ../dist/mascot.js    | ✅ Fixed - needs build |
| custom-gesture.html               | ../dist/mascot.js    | ✅ Fixed - needs build |
| event-handling.html               | ../dist/mascot.js    | ✅ Fixed - needs build |
| rhythm-sync-demo.html             | ../dist/mascot.js    | ✅ Fixed - needs build |
| llm-integration/claude-haiku.html | ../../dist/mascot.js | ✅ Fixed - needs build |

---

## How to Verify All Examples Work

```bash
# 1. Build the project
npm run build:dev

# 2. Start local server
npm run serve

# 3. Test each example:
# Open: http://localhost:8000/examples/hello-world-cdn.html
# Open: http://localhost:8000/examples/hello-world.html
# Open: http://localhost:8000/examples/basic-usage.html
# etc.

# 4. For each, verify:
# - Mascot appears
# - No EmotiveMascot errors in console
# - Buttons work
```

---

## Debugging Tips

### "The mascot doesn't appear"

Check browser console:

```javascript
// If you see:
'✅ Mascot is alive!';
// → It's working! The mascot might be rendering off-screen

// If you see:
'EmotiveMascot is not defined';
// → Run: npm run build:dev

// If you see:
'Failed to load module';
// → Check dist/mascot.js exists
```

### "Buttons don't work"

Check browser console when clicking:

```javascript
// If you see:
"Cannot read properties of undefined (reading 'setEmotion')";
// → The mascot didn't initialize. Check earlier errors.

// If you see:
'mascot.setEmotion is not a function';
// → Wrong EmotiveMascot class loaded. Check import path.
```

### "Changes don't appear after editing source"

**Solution:** Rebuild!

```bash
npm run build:dev
# Then refresh browser
```

Or use watch mode:

```bash
npm run build:watch
# Auto-rebuilds on file changes
```

---

## Quick Command Reference

```bash
# Install dependencies
npm install

# Build once (development)
npm run build:dev

# Build once (production)
npm run build

# Auto-rebuild on changes
npm run build:watch

# Start local server
npm run serve

# Run tests
npm test
```

---

**Last Updated:** 2025-10-27
