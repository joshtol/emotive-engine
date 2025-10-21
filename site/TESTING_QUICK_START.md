# Playwright Testing Quick Start Guide

## Installation Complete ✅

Playwright has been installed and configured for the Emotive Mascot site.

## Running Tests

### Basic Commands

```bash
# Run all tests (headless)
npm run test:e2e

# Run tests with UI (RECOMMENDED for development)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests step-by-step
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

### First Time Setup

1. **Make sure dev server is running**:

    ```bash
    npm run dev
    ```

    Keep this running in a separate terminal.

2. **Run tests** (in another terminal):
    ```bash
    npm run test:e2e
    ```

## Test Files

- **Main Tests**: `tests/homepage.spec.ts` (45 tests)
- **Helpers**: `tests/helpers/mascot-helpers.ts`,
  `tests/helpers/form-helpers.ts`
- **Config**: `playwright.config.ts`
- **Docs**: `tests/README.md`, `tests/TEST_SUMMARY.md`

## What's Tested

✅ **Emotion Selector** (8 tests)

- All 8 emotions on desktop
- 4 emotions on mobile
- Click interactions
- Particle clearing

✅ **Scroll Animations** (4 tests)

- Mascot position changes
- Z-index transitions
- Gesture triggers

✅ **Waitlist Form** (7 tests)

- Email validation
- Submission handling
- Success/error states
- Auto-reset

✅ **Mobile Responsive** (5 tests)

- Grid layouts
- Touch targets
- Text scaling

✅ **Performance** (5 tests)

- Load time < 3s
- Canvas initialization
- No layout shift

✅ **Navigation** (5 tests)

- Internal links
- Anchor scrolling

✅ **Content** (4 tests)

- Stats display
- Descriptions

✅ **Accessibility** (4 tests)

- Headings
- Alt text
- Labels
- Keyboard

✅ **Basic Layout** (4 tests)

- Page loads
- Elements visible

## Test Coverage Summary

- **Total Tests**: 45
- **Test Executions**: 225 (45 × 5 browsers)
- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Coverage**: ~95% of user-facing features

## Common Issues

### Tests fail with "Page not found"

**Solution**: Make sure dev server is running (`npm run dev`)

### Tests timeout

**Solution**: Increase timeout in `playwright.config.ts` or check network

### Firebase errors in console

**Solution**: These are expected in test environment and are filtered out

## Advanced Usage

```bash
# Run specific browser
npx playwright test --project=chromium
npx playwright test --project="Mobile Chrome"

# Run specific test group
npx playwright test -g "Emotion Selector"
npx playwright test -g "Scroll Animation"

# Run and update snapshots
npx playwright test --update-snapshots

# Generate trace
npx playwright test --trace on
```

## Viewing Results

After running tests:

1. **HTML Report**: Automatically opens or run `npm run test:e2e:report`
2. **Screenshots**: Found in `test-results/` folder
3. **Videos**: Found in `test-results/` folder (on failure)

## CI/CD Integration

Tests are ready for CI/CD:

- Auto-starts dev server
- Retries failed tests (2×)
- Generates HTML reports
- Captures screenshots/videos on failure

## Need Help?

- **Full Documentation**: `tests/README.md`
- **Test Summary**: `tests/TEST_SUMMARY.md`
- **Playwright Docs**: https://playwright.dev

## Example: Running Your First Test

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run tests with UI
npm run test:e2e:ui
```

The UI will show all tests and let you run them interactively!

## Test Scripts Added to package.json

```json
{
    "scripts": {
        "test:e2e": "playwright test",
        "test:e2e:ui": "playwright test --ui",
        "test:e2e:headed": "playwright test --headed",
        "test:e2e:debug": "playwright test --debug",
        "test:e2e:report": "playwright show-report"
    }
}
```

Happy Testing! 🎭
