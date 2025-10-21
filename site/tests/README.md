# Emotive Mascot Home Page Test Suite

Comprehensive Playwright test suite for the Emotive Mascot home page.

## Test Coverage

### 1. Basic Layout (7 tests)

- Page loads successfully
- Hero section displays
- Mascot canvas renders
- No critical console errors

### 2. Emotion Selector (8 tests)

- All 8 emotions render on desktop
- Only 4 emotions render on mobile (joy, sadness, anger, calm)
- Correct mobile emotions displayed
- Emotion icons load properly
- Clicking emotions triggers `mascot.setEmotion()`
- Particles clear before emotion changes
- Hover effects work correctly

### 3. Scroll Animation (4 tests)

- Mascot position changes on scroll
- Z-index transitions at hero breakpoint (from 100 to 1)
- Wave gesture triggers at 90% hero scroll
- Bounce gesture triggers at hero+800px

### 4. Waitlist Form (7 tests)

- Form renders correctly
- Invalid email rejection
- Valid email submission
- Duplicate email handling
- Success state display
- Form resets after 5 seconds
- Form disabled during submission

### 5. Mobile Responsiveness (5 tests)

- Bento grid collapses to single column
- Emotion grid shows 2 columns
- Stats grid wraps properly
- Hero text size adjusts
- Touch targets are adequate (≥40px)

### 6. Performance (5 tests)

- Page loads in under 3 seconds
- Mascot canvas initializes properly
- Engine script loads successfully
- No layout shift
- Handles rapid emotion changes

### 7. Navigation (5 tests)

- Demo link works
- Use cases anchor link works
- Scroll to use cases functions
- Cherokee use case link works
- Retail use case link works

### 8. Content (4 tests)

- Correct stats display (15 emotions, 50+ gestures, 0 GPU)
- Badge text correct
- Cherokee flagship badge shows
- Use case descriptions visible

### 9. Accessibility (4 tests)

- Proper heading hierarchy
- Alt text on emotion images
- Form labels present
- Keyboard navigation support

## Total Tests: 49

## Running the Tests

### Install Dependencies

```bash
npm install
```

### Run All Tests

```bash
npm run test:e2e
```

### Run Tests in UI Mode

```bash
npm run test:e2e:ui
```

### Run Tests in Headed Mode (See Browser)

```bash
npm run test:e2e:headed
```

### Debug Tests

```bash
npm run test:e2e:debug
```

### View Test Report

```bash
npm run test:e2e:report
```

### Run Specific Test File

```bash
npx playwright test homepage.spec.ts
```

### Run Tests for Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
npx playwright test --project="Mobile Chrome"
```

### Run Tests Matching Pattern

```bash
npx playwright test -g "Emotion Selector"
npx playwright test -g "mobile"
```

## Test Helpers

### Mascot Helpers (`helpers/mascot-helpers.ts`)

- `waitForMascotInitialization()` - Wait for mascot engine to load
- `isMascotInitialized()` - Check if mascot is initialized
- `getCurrentEmotion()` - Get current mascot emotion
- `setupEmotionTracking()` - Track emotion changes
- `getEmotionChanges()` - Get tracked emotion changes
- `setupGestureTracking()` - Track gestures
- `getGestures()` - Get tracked gestures
- `setupParticleClearTracking()` - Track particle clears
- `getParticleClears()` - Get tracked particle clear events
- `waitForCanvasDimensions()` - Wait for canvas to have dimensions
- `getCanvasDimensions()` - Get canvas width/height
- `getMascotZIndex()` - Get mascot container z-index
- `scrollTo()` - Scroll to specific position
- `getScrollPosition()` - Get current scroll position
- `getViewportDimensions()` - Get viewport dimensions
- `getHeroHeight()` - Calculate hero section height

### Form Helpers (`helpers/form-helpers.ts`)

- `getWaitlistFormElements()` - Get form element locators
- `submitWaitlistForm()` - Submit form with email
- `getFormStatus()` - Get current form status
- `waitForFormStatus()` - Wait for specific status
- `getFormMessage()` - Get validation message
- `isFormDisabled()` - Check if form is disabled
- `generateTestEmail()` - Generate unique test email
- `waitForFormReset()` - Wait for form to reset
- `hasEmailValue()` - Check if email input has value
- `clearForm()` - Clear form inputs
- `isValidEmailFormat()` - Validate email format

## CI/CD Integration

The tests are configured to run on CI with:

- Automatic retries (2 retries on failure)
- Single worker (no parallel execution)
- HTML report generation
- Screenshots on failure
- Videos on failure
- Traces on first retry

## Test Configuration

Configuration is in `playwright.config.ts`:

- Tests run on Chromium, Firefox, and WebKit
- Mobile tests on Pixel 5 and iPhone 12
- Dev server starts automatically before tests
- Base URL: `http://localhost:3000`
- Test timeout: 30 seconds
- Expect timeout: 5 seconds

## Troubleshooting

### Tests Fail with "Page not found"

Make sure the dev server is running:

```bash
npm run dev
```

### Tests Fail with "Canvas not initialized"

The mascot engine may not be loading properly. Check:

1. `public/emotive-engine.js` exists
2. No console errors in the browser
3. Network tab shows script loading

### Tests Are Slow

- Use headed mode to see what's happening: `npm run test:e2e:headed`
- Check network tab for slow requests
- Increase timeout in `playwright.config.ts`

### Firebase Errors

Firebase errors in tests are acceptable - the test environment doesn't have
Firebase configured. Tests filter out Firebase-related console errors.

## Writing New Tests

Example test structure:

```typescript
import { test, expect } from '@playwright/test';
import { waitForMascotInitialization } from './helpers/mascot-helpers';

test('my new test', async ({ page }) => {
    await page.goto('/');
    await waitForMascotInitialization(page);

    // Your test code here
    const element = page.locator('#my-element');
    await expect(element).toBeVisible();
});
```

## Coverage Areas

✅ Emotion selector interactions ✅ Scroll-driven animations ✅ Waitlist form
functionality ✅ Mobile responsiveness ✅ Performance metrics ✅ Navigation ✅
Content verification ✅ Accessibility

## Known Issues

- Firebase integration tests are limited (no test database)
- Some mascot method tracking tests are optimistic (mascot may not be fully
  initialized)
- Performance tests may vary based on system resources
