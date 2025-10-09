# Deployment Checklist - Emotive Engine Site

**Version:** 1.0.0
**Date:** 2025-10-08
**Phase:** 2-4 Complete, Phase 7 In Progress

---

## Pre-Deployment Status

### ✅ Completed
- [x] Phases 2, 3, 4 implementation (avatar orchestration, scenes, UX)
- [x] Automated unit tests (14 tests passing via vitest)
- [x] Analytics documentation (`ANALYTICS_EVENTS.md`)
- [x] QA testing matrix (`QA_TESTING_MATRIX.md`)
- [x] Rollback plan (`ROLLBACK_PLAN.md`)
- [x] Dev server running successfully (http://localhost:3002)

### ⚠️ Known Issues
- **Production build errors:** TypeScript strict mode and ESLint warnings need resolution
- **Build status:** Dev server works, production build has type/lint errors
- **Action required:** Fix remaining build errors before production deployment

---

## Build Error Summary

### Current Build Status
**Dev Build:** ✅ Working
**Production Build:** ❌ Type errors present

### Errors to Fix

1. **TypeScript Strict Errors** (Multiple files)
   - Unused variables/parameters (`no-unused-vars`)
   - Object destructuring preferences (`prefer-destructuring`)
   - Async methods without await (`require-await`)
   - React Hook dependency arrays (`react-hooks/exhaustive-deps`)

2. **Files Requiring Fixes**
   - `src/app/page.tsx` - Unused variables, hook dependencies
   - `src/app/use-cases/page.tsx` - Unused variables
   - `src/lib/scenes/*.ts` - Unused parameters in update methods
   - `src/lib/avatar-controller.ts` - Unused event parameters
   - `src/components/**/*.tsx` - Various lint warnings

### Recommended Fix Approach

**Option 1: Fix All Errors (Recommended for Production)**
```bash
# Run ESLint with auto-fix
cd site
npx eslint --fix "src/**/*.{ts,tsx}"

# Then manually fix remaining issues
npm run build
```

**Option 2: Temporary Workaround (Dev/Staging Only)**
```javascript
// In next.config.js
eslint: {
  ignoreDuringBuilds: true,  // ⚠️ NOT recommended for production
}
```

---

## Deployment Checklist

### Phase 1: Pre-Deployment Prep
- [ ] **Fix all production build errors**
  - [ ] Resolve TypeScript errors
  - [ ] Fix ESLint warnings
  - [ ] Run `npm run build` successfully
- [ ] **Run all tests**
  - [ ] `npm test` - All tests passing
  - [ ] Manual smoke test on dev server
- [ ] **Update documentation**
  - [ ] NEWNEW.md reflects current status
  - [ ] PHASE_2_3_4_SUMMARY.md finalized
  - [ ] Changelog created (if applicable)

### Phase 2: Build & Test
- [ ] **Create production build**
  ```bash
  cd site
  npm run build
  npm run start  # Test production build locally
  ```
- [ ] **Verify production bundle**
  - [ ] Check bundle size (<500KB main bundle target)
  - [ ] Verify no console errors
  - [ ] Test all routes load
  - [ ] Verify HeroMascot renders
  - [ ] Test QuickNav (Ctrl+K)
  - [ ] Test scroll intent detection

### Phase 3: Pre-Deploy Validation
- [ ] **Run full QA matrix** (see `QA_TESTING_MATRIX.md`)
  - [ ] Desktop testing (Chrome, Firefox, Safari, Edge)
  - [ ] Mobile testing (iOS Safari, Android Chrome)
  - [ ] Tablet testing
  - [ ] Network throttling (Slow 3G)
- [ ] **Performance checks**
  - [ ] FPS ≥ 55fps during animations
  - [ ] Page load time < 3s (Fast 4G)
  - [ ] Memory usage < 100MB growth
- [ ] **Accessibility audit**
  - [ ] Run axe DevTools or Lighthouse
  - [ ] Keyboard navigation works
  - [ ] Screen reader compatible
  - [ ] Color contrast meets WCAG AA

### Phase 4: Deployment Prep
- [ ] **Git housekeeping**
  ```bash
  git status  # Verify no uncommitted changes
  git log --oneline -10  # Review recent commits
  git tag -a v1.0.0-phase-2-4 -m "Avatar orchestration & scenes MVP"
  ```
- [ ] **Environment variables set**
  - [ ] Firebase config (if using)
  - [ ] Analytics keys (GA4, Segment, etc.)
  - [ ] Feature flags (if implemented)
- [ ] **Rollback plan ready**
  - [ ] Last stable commit identified
  - [ ] Rollback branch created
  - [ ] Team notified of deployment window

### Phase 5: Deploy to Staging
- [ ] **Deploy to staging environment**
  ```bash
  # Example for Vercel
  npm run build
  vercel --prod=false

  # Example for Firebase
  firebase deploy --only hosting:staging

  # Example for Netlify
  netlify deploy --prod=false
  ```
- [ ] **Staging validation**
  - [ ] All pages load correctly
  - [ ] No 404 errors
  - [ ] No console errors
  - [ ] Analytics tracking verified
  - [ ] All scenes render and complete
- [ ] **Share staging link with team**
  - [ ] Collect feedback
  - [ ] Log any bugs found
  - [ ] Fix critical issues before production

### Phase 6: Deploy to Production
- [ ] **Final checks**
  - [ ] All staging bugs fixed
  - [ ] Stakeholder approval obtained
  - [ ] Rollback plan reviewed
  - [ ] Monitoring dashboards ready
- [ ] **Production deployment**
  ```bash
  # Example for Vercel
  vercel --prod

  # Example for Firebase
  firebase deploy --only hosting:production

  # Example for Netlify
  netlify deploy --prod
  ```
- [ ] **Immediate post-deploy checks**
  - [ ] Site loads at production URL
  - [ ] No 500 errors
  - [ ] HeroMascot renders
  - [ ] QuickNav works
  - [ ] All sections accessible

### Phase 7: Post-Deployment Monitoring
- [ ] **Monitor for first 1 hour**
  - [ ] Error rate < 0.1%
  - [ ] Page load time < 3s
  - [ ] No user-reported issues
  - [ ] Analytics events firing
- [ ] **Monitor for first 24 hours**
  - [ ] FPS stable (>55fps)
  - [ ] Memory usage stable
  - [ ] Scene completion rate tracking
  - [ ] User engagement metrics

### Phase 8: Post-Deployment Tasks
- [ ] **Update documentation**
  - [ ] Mark NEWNEW.md tasks complete
  - [ ] Update README with deployment date
  - [ ] Archive old versions (if applicable)
- [ ] **Team communication**
  - [ ] Send deployment success email
  - [ ] Share production URL
  - [ ] Highlight new features
- [ ] **Post-mortem (optional)**
  - [ ] What went well
  - [ ] What could be improved
  - [ ] Action items for next deployment

---

## Rollback Triggers

### Immediate Rollback (Critical)
- Site completely broken (white screen, 500 errors)
- JavaScript errors preventing page load
- Mascot crashes causing browser hangs
- Data loss or security vulnerability

### Rollback Within 1 Hour (High Priority)
- Error rate > 5%
- Page load time > 10s
- Major features broken (avatar nav, scenes, scroll lock)
- Mobile experience severely degraded

### Fix Forward (Medium Priority)
- Error rate 0.1-1%
- Minor visual glitches
- Analytics not tracking some events
- Performance slightly degraded

---

## Deployment Commands Reference

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to staging
vercel

# Deploy to production
vercel --prod

# Rollback
vercel rollback [deployment-url]
```

### Firebase Hosting
```bash
# Install Firebase CLI
npm i -g firebase-tools

# Login
firebase login

# Deploy to staging
firebase deploy --only hosting:staging

# Deploy to production
firebase deploy --only hosting:production

# Rollback
firebase hosting:clone SOURCE_SITE_ID:SOURCE_VERSION_ID SITE_ID
```

### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy to staging
netlify deploy

# Deploy to production
netlify deploy --prod

# Rollback
netlify rollback
```

### Custom Server (PM2 Example)
```bash
# Build
npm run build

# Start with PM2
pm2 start npm --name "emotive-site" -- start

# Reload
pm2 reload emotive-site

# Rollback (restore previous build)
pm2 stop emotive-site
cd /path/to/backup
pm2 start emotive-site
```

---

## Environment Variables

### Required for Production
```bash
# Firebase (if using)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com

# Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SEGMENT_WRITE_KEY=xxxxx

# Feature Flags (optional)
NEXT_PUBLIC_DISABLE_AVATAR_ORCHESTRATION=false
NEXT_PUBLIC_DISABLE_SCENE_SYSTEM=false
NEXT_PUBLIC_DISABLE_SCROLL_HINT=false
```

---

## Success Criteria

### Technical Metrics
- [x] Build completes successfully
- [x] All tests passing (14/14)
- [ ] Production bundle size < 500KB
- [ ] Lighthouse score > 90
- [ ] Zero console errors in production

### User Experience Metrics
- [ ] Page load time < 3s (p50)
- [ ] FPS ≥ 55fps during animations
- [ ] Scene completion rate > 60%
- [ ] Scroll intent detection accuracy > 85%
- [ ] QuickNav usage rate > 20% of sessions

### Business Metrics
- [ ] User engagement time +20% vs baseline
- [ ] Bounce rate <40%
- [ ] Section exploration rate >70%

---

## Contact & Support

**Deployment Lead:** [NAME]
**Email:** [EMAIL]
**Slack:** [CHANNEL]

**Escalation Path:**
1. Engineering Lead
2. CTO / Technical Director

**Support Hours:** 24/7 for first 48 hours post-deployment

---

## Notes

### 2025-10-08 - Build Status
- Dev server working correctly on port 3002
- Production build has TypeScript/ESLint errors to fix
- Core functionality (scenes, avatar, QuickNav) working in dev mode
- All automated tests passing
- Documentation complete

### Next Steps
1. Fix remaining build errors (est. 2-3 hours)
2. Run full production build successfully
3. Deploy to staging for team review
4. Collect feedback and iterate
5. Deploy to production

---

**Last Updated:** 2025-10-08
**Version:** 1.0.0
**Status:** ⚠️ Pre-Deployment (Build Errors to Fix)
