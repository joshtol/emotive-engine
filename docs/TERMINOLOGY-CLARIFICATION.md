# Terminology Clarification: "Culture Packs"

**Date:** January 2026
**Status:** ACTIVE - Use this terminology going forward

---

## ❌ DEPRECATED: "Culture Packs"

The term **"Culture Packs"** is DEPRECATED because it's ambiguous and could be misinterpreted as commercializing Indigenous cultural content.

---

## ✅ NEW TERMINOLOGY:

### 1. **Cultural Heritage Packs** (Indigenous Content)
**What it is:**
- Cherokee Resilience Pack
- Navajo Harmony Pack
- Other tribal nation partnerships
- Ethnic/linguistic cultural preservation projects

**Pricing:** **FREE - ALWAYS, FOREVER**
**License:** MIT (same as core engine)
**Purpose:** Cultural preservation, education, museum installations
**Why Free:** Monetizing Indigenous cultural heritage would be exploitative

**Examples:**
- ✅ Cherokee syllabary learning animations
- ✅ Navajo color symbolism themes
- ✅ Ojibwe storytelling gestures
- ✅ Hawaiian language preservation

**Advisory Board:** Required (Cherokee Nation cultural experts, tribal representatives)

---

### 2. **Industry Theme Packs** (Corporate Branding)
**What it is:**
- Workplace culture theming (NOT ethnic/cultural)
- Industry-specific branding
- Corporate visual identity
- Professional use cases

**Pricing:** **CAN BE SOLD** ($49-$199 per pack)
**License:** Commercial
**Purpose:** Corporate branding, workplace identity, professional customization
**Revenue Share:** 80% creator, 20% Emotive Engine

**Examples:**
- 💰 Startup Culture Pack (fast-paced, energetic, modern)
- 💰 Healthcare Professional Pack (calming, trustworthy, clean)
- 💰 Gaming/Esports Pack (competitive, intense, dynamic)
- 💰 Financial Services Pack (stable, professional, secure)
- 💰 Educational Institution Pack (academic, scholarly, inspiring)
- 💰 Creative Agency Pack (bold, artistic, expressive)

**Advisory Board:** NOT required (community moderation only)

---

## Code Implementation

### Schema Definition
```javascript
{
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" },
    "packType": {
      "type": "string",
      "enum": ["cultural-heritage", "industry-theme"]
    },
    "price": { "type": "number" },
    // ... other fields
  },
  "required": ["id", "name", "packType"],

  // Validation rule: cultural-heritage MUST be free
  "if": {
    "properties": { "packType": { "const": "cultural-heritage" } }
  },
  "then": {
    "properties": { "price": { "const": 0 } }
  }
}
```

### Loader Enforcement
```javascript
class ThemePackLoader {
  validatePack(pack) {
    if (pack.packType === 'cultural-heritage' && pack.price > 0) {
      throw new Error(
        'Cultural Heritage packs must be free. ' +
        'Monetizing Indigenous cultural content is prohibited.'
      );
    }
  }
}
```

---

## Marketing & Messaging

### Website Tabs
```
emotive-engine.com/packs

[Cultural Heritage] [Industry Themes]
    (All FREE)        (Free + Paid)
```

### Product Hunt Launch
"Open-source emotional AI engine with **free cultural heritage packs** for Indigenous language preservation and **premium industry themes** for corporate branding."

### Cherokee Outreach
"All Cherokee cultural content is **free forever**. We monetize Industry Theme Packs (corporate branding), not cultural heritage."

---

## Why This Matters

### Ethical Clarity
- **Cultural Heritage = Community Resource** (free, open, collaborative)
- **Industry Themes = Commercial Product** (paid, professional, licensed)

### Prevents Exploitation
- Indigenous communities have been exploited for centuries
- Commercializing cultural content perpetuates harm
- Free cultural heritage packs = authentic partnership, not extraction

### Business Model Integrity
- Revenue comes from **corporate branding** (Industry Theme Packs)
- Revenue does NOT come from Indigenous cultural content
- This aligns with open source values AND ethical principles

---

## Examples in Practice

### ✅ CORRECT Usage:

**User:** "I want the Cherokee Resilience Pack for my educational app"
**Response:** "Cherokee Resilience Pack is FREE! Download here: [link]"

**User:** "I need a mascot for my healthcare startup"
**Response:** "Check out our Healthcare Professional Industry Theme Pack ($99). Or use the free core engine to create your own!"

### ❌ INCORRECT Usage:

**User:** "How much is the Cherokee Culture Pack?"
**Response:** ~~"$99 for commercial use"~~ → **WRONG**
**Correct:** "Cherokee cultural heritage content is always free. You might be looking for our Healthcare Industry Theme Pack ($99)?"

---

## File Naming Conventions

### Old (Deprecated):
- ❌ `src/packs/cherokee-culture-pack.json`
- ❌ `marketplace/culture-packs/`
- ❌ `CulturePackLoader.js`

### New (Correct):
- ✅ `src/heritage/cherokee-resilience.json`
- ✅ `marketplace/cultural-heritage/` (free)
- ✅ `marketplace/industry-themes/` (paid)
- ✅ `ThemePackLoader.js`

---

## FAQ

### Q: Can I donate to support Cultural Heritage Pack development?
**A:** Yes! We accept donations for cultural preservation work, but the packs themselves remain free for everyone.

### Q: Can tribal nations sell their own Cultural Heritage Packs?
**A:** Tribal nations can do whatever they want with their content. If Cherokee Nation wants to create a separate commercial product using Emotive Engine, that's their decision. Our commitment is that OUR Cherokee Heritage Pack remains free.

### Q: What if a company wants to use a Cultural Heritage Pack commercially?
**A:** It's free and MIT licensed. Companies can use it. We don't monetize cultural heritage.

### Q: Can I create a "German Culture Pack" as an Industry Theme?
**A:** If it's about **workplace culture** in German companies (punctuality, efficiency, etc.), that's an Industry Theme Pack. If it's about **ethnic German cultural heritage** (folklore, language, traditions), that should be a free Cultural Heritage Pack. When in doubt, make it free.

---

## Summary

| Aspect | Cultural Heritage Packs | Industry Theme Packs |
|--------|------------------------|---------------------|
| **Examples** | Cherokee, Navajo, Ojibwe | Startup, Healthcare, Gaming |
| **Purpose** | Cultural preservation | Corporate branding |
| **Pricing** | FREE (always) | $49-$199 |
| **License** | MIT | Commercial |
| **Review** | Advisory Board required | Community moderation |
| **Revenue** | None (donations accepted) | 80/20 creator split |
| **Ethics** | Never commercialize | Standard business |

---

**Maintained By:** Joshua Tollette
**Last Updated:** January 2026
**Status:** Active terminology
