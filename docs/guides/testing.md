# Testing Guide: Use Case Portfolio

## ✅ Ready to Test Now

All routes are live and functional. Here's what to test:

## 🏠 Portfolio Landing Page
**URL:** http://localhost:3003/

### What to Test:
1. **Hero Section**
   - Large "Emotional AI for Human Experiences" heading
   - "Explore Use Cases" button scrolls to grid
   - Mascot appears in top-right, waves, says "Explore our use case portfolio!"

2. **Use Case Grid**
   - 5 use case cards displayed
   - Cherokee card is larger (flagship) with "★ Flagship" badge
   - Hover effects: Cards lift, border changes to use case color
   - All cards link to their respective pages

3. **How It Works Section**
   - 4 technical feature cards
   - Icons and descriptions visible

4. **Navigation**
   - Click any use case card → Goes to that demo
   - Back button returns to portfolio

## ᏣᎳᎩ Cherokee Language Learning
**URL:** http://localhost:3003/use-cases/cherokee

### What to Test:
1. **Welcome Phase** (default)
   - Mascot greets: "ᎣᏏᏲ (Osiyo) - Hello!"
   - Cherokee title "ᏣᎳᎩ ᎧᏬᏂᎯᏍᏗ" visible
   - Three phase buttons: Welcome, Explore, Practice

2. **Explore Phase**
   - Click "Explore" button
   - Syllabary grid appears on right with 6 characters
   - Click any character → Mascot pulses, message shows pronunciation
   - Characters: Ꭰ (a), Ꭱ (e), Ꭲ (i), Ꭳ (o), Ꭴ (u), Ꭵ (v)

3. **Practice Phase**
   - Click "Practice" button
   - "Build a Word" panel appears at bottom
   - "Coming soon" message displays

4. **Cultural Context**
   - "About Cherokee" panel visible bottom-right
   - Information about Sequoyah and syllabary

## 🛒 Retail Checkout
**URL:** http://localhost:3003/use-cases/retail

### What to Test:
1. **Scanning Phase**
   - Click "Scan Item" → Cart count increases, mascot bounces
   - "Item scanned successfully!" message appears
   - After adding items, "Proceed to Payment" button appears

2. **Payment Phase**
   - Click "Proceed to Payment"
   - Step changes to "Payment"
   - "Complete Payment" button appears

3. **Complete Phase**
   - Click "Complete Payment"
   - Mascot celebrates
   - "Thank you! Checkout complete!" message
   - After 4 seconds, resets to scanning

4. **Feature Cards**
   - Three cards on right side
   - Cart Assistance, Emotion Detection, Payment Support

## ❤️ Healthcare Intake
**URL:** http://localhost:3003/use-cases/healthcare

### What to Test:
1. **Step 1: Name**
   - Enter name in text field
   - "Next" button disabled until name entered
   - Click "Next" → Progresses to symptoms

2. **Step 2: Symptoms**
   - Multi-line text area for symptoms
   - Type description
   - Click "Next" → Progresses to pain level

3. **Step 3: Pain Level**
   - Slider from 1-10
   - Mascot emotion changes based on level:
     - 1-3: Calm
     - 4-6: Concerned
     - 7-10: Empathetic with message
   - Click "Submit Form" → Celebrates, resets

4. **Progress Indicator**
   - "Step X of 3" shown at top of form

## 📚 Math Tutor
**URL:** http://localhost:3003/use-cases/education

### What to Test:
1. **Problem Display**
   - Random addition problem shown (e.g., "5 + 3 = ?")
   - Four answer options in grid

2. **Correct Answer**
   - Click correct answer
   - Mascot celebrates
   - "Excellent! You got it right!" message
   - Score increases
   - New problem appears after 2 seconds

3. **Wrong Answer**
   - Click wrong answer
   - Mascot shows empathy
   - "Not quite. Try again! You can do it!" message
   - Problem stays same, can try again

4. **Hint System**
   - Click "💡 Need a Hint?" button
   - Mascot nods, provides counting hint

5. **Score Tracking**
   - Shows "Score: X / Y"
   - Percentage correct displayed

## 🏠 Smart Home Hub
**URL:** http://localhost:3003/use-cases/smart-home

### What to Test:
1. **Device Controls**
   - Four devices listed on right:
     - 💡 Living Room Lights
     - 🌡️ Thermostat
     - 🔒 Security System
     - 🪟 Smart Blinds

2. **Toggle Devices**
   - Click ON/OFF button on any device
   - ON: Card background brightens, mascot bounces
   - OFF: Card dims, mascot calm

3. **Value Adjustments** (when device is ON)
   - Lights: Brightness slider 0-100%
   - Thermostat: Temperature slider 60-85°F
   - Blinds: Position slider 0-100%
   - Moving slider updates value display

4. **All Off Mode**
   - Click "🌙 All Off (Good Night)" button
   - All devices turn off
   - "Good night! All devices turned off." message

## 🎭 Mascot Behaviors to Watch For

### Across All Pages:
- **Welcome animation**: Mascot appears, waves on page load
- **Hover effects**: Mascot responds when hovering UI elements
- **Emotional states**: Changes based on user actions
- **Gestures**: Various animations (wave, bounce, celebrate, breathe, nod, pulse)

### Messages (Toast Notifications):
- Appear top-right in MessageHUD
- Auto-dismiss after duration
- Can be manually dismissed with X
- Different types: info (blue), success (green), warning (yellow), error (red)

## 🐛 Known Issues / Limitations

### Cherokee Page:
- Only 6 syllabary characters (MVP)
- No actual morphing yet (static shapes)
- No audio pronunciations yet
- Practice mode is placeholder

### All Pages:
- No analytics tracking yet
- No social sharing meta tags yet
- Desktop-optimized (mobile responsive needs testing)

## 📸 Screenshots to Take

For documentation/pitches:
1. Landing page hero + use case grid
2. Cherokee syllabary grid interaction
3. Retail checkout flow (all 3 steps)
4. Healthcare form with empathetic response
5. Education correct answer celebration
6. Smart home all devices on

## 🎯 Next Testing Phase

After Phase 2 (Cherokee Enhancement):
- SVG morphing animations
- Audio pronunciation playback
- 85 full syllabary characters
- Word building mechanics
- Cultural theming (7-clan colors)

---

**Current Status:** All Phase 1 features functional and ready for demo
**Server:** http://localhost:3003
**No errors in console:** Clean build ✅
