# Rollback Plan - Emotive Engine Site Integration

**Version:** 1.0.0
**Last Updated:** 2025-10-08
**Scope:** Phases 2, 3, 4 - Avatar Orchestration, Scene System, UX Enhancements

---

## Overview

This document provides a comprehensive rollback strategy for the Emotive Engine site integration. Use this plan if critical issues are discovered post-deployment that require reverting to the previous stable version.

---

## Risk Assessment

### Low Risk Components (Can Stay Deployed)
- ✅ Documentation files (ANALYTICS_EVENTS.md, QA_TESTING_MATRIX.md)
- ✅ Test files (*.test.ts)
- ✅ Type definitions and interfaces
- ✅ Utility functions (quicknav-analytics.ts)

### Medium Risk Components (Monitor Closely)
- ⚠️ HeroMascot refactor (73 lines, hook-based)
- ⚠️ ScrollHint component (auto-show/hide)
- ⚠️ QuickNav progress badges
- ⚠️ Scene template and documentation

### High Risk Components (Rollback Targets)
- 🔴 AvatarController lifecycle events (onPathStart, onPathComplete, etc.)
- 🔴 SceneManager and all 4 scenes (retail, healthcare, education, smart-home)
- 🔴 Scroll lock/unlock coordination with scenes
- 🔴 Intent-driven scene behavior (SKIMMING fast-forward)
- 🔴 HomePage integration (SceneManager, lifecycle wiring, watchdogs)

---

## Rollback Triggers

### Critical (Immediate Rollback Required)
- Site completely broken (white screen, 500 errors)
- JavaScript errors preventing page load
- Mascot crashes causing infinite loops or memory leaks
- Security vulnerabilities discovered
- Data loss or corruption

### High Priority (Rollback Within 1 Hour)
- Avatar navigation broken (not reaching sections)
- Scenes not rendering or crashing browser tabs
- Scroll lock preventing users from navigating site
- QuickNav unresponsive or stuck open
- Major performance regression (FPS < 30, load time > 10s)

### Medium Priority (Rollback Within 24 Hours)
- Minor visual glitches affecting UX
- Analytics not tracking correctly
- Mobile experience degraded
- Cross-browser compatibility issues
- Accessibility violations

### Low Priority (Fix Forward, No Rollback)
- Documentation errors
- Console warnings (non-breaking)
- Minor animation timing issues
- Cosmetic CSS issues

---

## Rollback Strategy Options

## Option 1: Git Revert (Recommended)

### Advantages
- ✅ Clean, auditable rollback
- ✅ Preserves commit history
- ✅ Can selectively revert specific commits
- ✅ Easy to re-deploy fixed version later

### Disadvantages
- ❌ Requires identifying exact commits to revert
- ❌ May have merge conflicts if other changes deployed

### Process

1. **Identify Rollback Point**
   ```bash
   git log --oneline --graph --all
   # Find the last stable commit before Phases 2-4
   # Example: commit hash 44b53818
   ```

2. **Create Rollback Branch**
   ```bash
   git checkout -b rollback/phase-2-3-4-$(date +%Y%m%d)
   ```

3. **Revert Commits**
   ```bash
   # Option A: Revert specific commits (preferred)
   git revert <commit-hash-phase-4>
   git revert <commit-hash-phase-3>
   git revert <commit-hash-phase-2>

   # Option B: Revert range of commits
   git revert <last-good-commit>..<current-bad-commit>

   # Option C: Hard reset (DANGER - loses history)
   # git reset --hard <last-good-commit>
   # git push --force origin main  # ⚠️ USE WITH EXTREME CAUTION
   ```

4. **Test Rollback Locally**
   ```bash
   cd site
   npm install  # In case dependencies changed
   npm run build
   npm run dev
   # Verify site works without new features
   ```

5. **Deploy Rollback**
   ```bash
   git push origin rollback/phase-2-3-4-$(date +%Y%m%d)
   # Merge to main or deploy branch
   # Trigger deployment pipeline
   ```

---

## Option 2: Feature Flag Toggle (Proactive)

### Advantages
- ✅ Instant rollback (no deployment needed)
- ✅ Can enable for specific users/environments
- ✅ Gradual rollout possible
- ✅ A/B testing capability

### Disadvantages
- ❌ Requires implementing flags before deployment
- ❌ Adds code complexity
- ❌ Flags must be maintained in codebase

### Implementation

**1. Create Feature Flags Config**

```typescript
// site/src/config/feature-flags.ts
export interface FeatureFlags {
  enableAvatarOrchestration: boolean
  enableSceneSystem: boolean
  enableScrollHint: boolean
  enableQuickNavBadges: boolean
}

export const DEFAULT_FLAGS: FeatureFlags = {
  enableAvatarOrchestration: true,
  enableSceneSystem: true,
  enableScrollHint: true,
  enableQuickNavBadges: true,
}

// Check environment variable for overrides
export function getFeatureFlags(): FeatureFlags {
  if (typeof window === 'undefined') return DEFAULT_FLAGS

  // Server-side or build-time flags
  const flags = { ...DEFAULT_FLAGS }

  if (process.env.NEXT_PUBLIC_DISABLE_AVATAR_ORCHESTRATION === 'true') {
    flags.enableAvatarOrchestration = false
  }
  if (process.env.NEXT_PUBLIC_DISABLE_SCENE_SYSTEM === 'true') {
    flags.enableSceneSystem = false
  }
  if (process.env.NEXT_PUBLIC_DISABLE_SCROLL_HINT === 'true') {
    flags.enableScrollHint = false
  }
  if (process.env.NEXT_PUBLIC_DISABLE_QUICKNAV_BADGES === 'true') {
    flags.enableQuickNavBadges = false
  }

  return flags
}
```

**2. Apply Flags in HomePage**

```typescript
// site/src/app/page.tsx
import { getFeatureFlags } from '@/config/feature-flags'

export default function HomePage() {
  const flags = getFeatureFlags()

  // Conditionally initialize AvatarController
  useEffect(() => {
    if (!flags.enableAvatarOrchestration || !mascot) return

    const controller = new AvatarController(mascot, {
      onPathStart: flags.enableAvatarOrchestration ? handlePathStart : undefined,
      onPathComplete: flags.enableAvatarOrchestration ? handlePathComplete : undefined,
      // ...
    })
  }, [mascot, flags.enableAvatarOrchestration])

  // Conditionally initialize SceneManager
  useEffect(() => {
    if (!flags.enableSceneSystem || !sceneContainer) return

    const manager = new SceneManager(sceneContainer, { /* ... */ })
    // ...
  }, [sceneContainer, flags.enableSceneSystem])

  return (
    <>
      {flags.enableScrollHint && <ScrollHint />}
      {/* ... */}
    </>
  )
}
```

**3. Rollback via Environment Variable**

```bash
# .env.production (or deployment config)
NEXT_PUBLIC_DISABLE_AVATAR_ORCHESTRATION=true
NEXT_PUBLIC_DISABLE_SCENE_SYSTEM=true
NEXT_PUBLIC_DISABLE_SCROLL_HINT=true
NEXT_PUBLIC_DISABLE_QUICKNAV_BADGES=true
```

**4. Redeploy with Flags**

```bash
# Set environment variables in hosting platform
# (Vercel, Netlify, Firebase, etc.)
# Redeploy → features disabled instantly
```

---

## Option 3: Conditional Imports (Lazy Loading)

### Advantages
- ✅ Reduces bundle size if features disabled
- ✅ No need to load scene code if not used
- ✅ Can fail gracefully if imports fail

### Disadvantages
- ❌ More complex code structure
- ❌ Dynamic imports may cause flicker/delay

### Implementation

```typescript
// site/src/app/page.tsx
const [SceneManager, setSceneManager] = useState<typeof import('@/lib/scene-manager').SceneManager | null>(null)

useEffect(() => {
  const flags = getFeatureFlags()

  if (flags.enableSceneSystem) {
    import('@/lib/scene-manager').then((mod) => {
      setSceneManager(() => mod.SceneManager)
    }).catch((err) => {
      console.error('Failed to load SceneManager', err)
    })
  }
}, [])

// Use SceneManager only if loaded
useEffect(() => {
  if (!SceneManager || !sceneContainer) return
  const manager = new SceneManager(sceneContainer, { /* ... */ })
  // ...
}, [SceneManager, sceneContainer])
```

---

## Rollback Procedures by Component

### 1. AvatarController Lifecycle Events

**Symptoms:**
- Avatar not navigating
- Lifecycle callbacks throwing errors
- Section locking broken

**Rollback:**
1. Remove lifecycle event wiring in `site/src/app/page.tsx`:
   ```typescript
   // Remove or comment out:
   // onPathStart: (sectionId) => { /* ... */ }
   // onPathComplete: (sectionId) => { /* ... */ }
   // onSectionEnter: (sectionId) => { /* ... */ }
   ```

2. Revert `site/src/lib/avatar-controller.ts` to version without events:
   ```bash
   git show <last-good-commit>:site/src/lib/avatar-controller.ts > site/src/lib/avatar-controller.ts
   ```

3. Rebuild and deploy:
   ```bash
   npm run build
   # Deploy
   ```

---

### 2. SceneManager & Canvas Scenes

**Symptoms:**
- Scenes not rendering
- Canvas errors
- Memory leaks during scene playback

**Rollback:**
1. Remove SceneManager initialization in `site/src/app/page.tsx`:
   ```typescript
   // Comment out entire SceneManager block
   // const manager = new SceneManager(container, { /* ... */ })
   ```

2. Remove scene imports:
   ```typescript
   // Remove:
   // import { retailSceneFactory } from '@/lib/scenes/retail-scene'
   // import { smartHomeSceneFactory } from '@/lib/scenes/smart-home-scene'
   // import { educationSceneFactory } from '@/lib/scenes/education-scene'
   // import { healthcareSceneFactory } from '@/lib/scenes/healthcare-scene'
   ```

3. Rebuild and deploy

**Alternative:** Delete scene files entirely:
```bash
rm -rf site/src/lib/scenes/
rm site/src/lib/scene-manager.ts
```

---

### 3. HeroMascot Hook Refactor

**Symptoms:**
- Mascot not appearing
- Hook initialization errors
- Canvas sizing issues

**Rollback:**
1. Revert `site/src/components/HeroMascot.tsx` to 300+ line version:
   ```bash
   git show <last-good-commit>:site/src/components/HeroMascot.tsx > site/src/components/HeroMascot.tsx
   ```

2. Remove `useHeroMascotController` hook:
   ```bash
   rm site/src/components/hooks/useHeroMascotController.ts
   ```

3. Rebuild and deploy

---

### 4. QuickNav Progress Badges

**Symptoms:**
- QuickNav rendering errors
- Badge state incorrect
- Template literal syntax errors

**Rollback:**
1. Revert `site/src/components/QuickNavOverlay.tsx`:
   ```bash
   git show <last-good-commit>:site/src/components/QuickNavOverlay.tsx > site/src/components/QuickNavOverlay.tsx
   ```

2. Remove `lockedSections` from context:
   - Edit `site/src/components/hooks/useScrollExperience.tsx`
   - Remove `lockedSections` from `ScrollExperienceValue` interface
   - Remove `lockedSections` state and provider value

3. Rebuild and deploy

---

### 5. ScrollHint Component

**Symptoms:**
- ScrollHint errors
- Hint not appearing/disappearing correctly
- Accessibility issues

**Rollback:**
1. Remove ScrollHint from HomePage:
   ```typescript
   // In site/src/app/page.tsx, remove:
   // <ScrollHint autoShow={true} />
   ```

2. Delete ScrollHint component:
   ```bash
   rm site/src/components/ScrollHint.tsx
   ```

3. Rebuild and deploy

---

## Testing Rollback

### Pre-Rollback Checklist
- [ ] Identify exact commit/tag of last stable version
- [ ] Create rollback branch from stable commit
- [ ] Document what features will be lost
- [ ] Notify stakeholders of rollback plan
- [ ] Prepare communication for users (if user-facing)

### Post-Rollback Verification
- [ ] Run automated tests: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] Dev server runs: `npm run dev`
- [ ] Manual smoke test: hero mascot appears
- [ ] Manual smoke test: scroll works
- [ ] Manual smoke test: QuickNav opens/closes
- [ ] No console errors
- [ ] Performance acceptable (load time < 5s)
- [ ] Mobile responsive

---

## Communication Plan

### Internal Team Notification

**Template:**
```
Subject: [URGENT] Emotive Engine Site Rollback Initiated

Team,

We have initiated a rollback of the Emotive Engine site to the previous stable version due to [ISSUE DESCRIPTION].

Rollback Reason: [Critical/High/Medium]
Affected Features: [List features being removed]
Expected Completion: [TIME]
Impact: [User-facing impact description]

Next Steps:
1. [Action items]
2. [Timeline for fix]
3. [Re-deployment plan]

Status updates will be provided every [FREQUENCY].

Contact [NAME] with questions.
```

### User-Facing Notification (If Needed)

**Template:**
```
We're temporarily reverting some recent enhancements to ensure the best experience.
You may notice:
- [Feature 1] temporarily unavailable
- [Feature 2] temporarily unavailable

We're working on a fix and expect to restore full functionality by [DATE/TIME].

Thank you for your patience.
```

---

## Prevention for Future Deployments

### Pre-Deployment Requirements
- [ ] All automated tests passing
- [ ] Manual QA completed on staging
- [ ] Performance benchmarks met
- [ ] Accessibility audit passed
- [ ] Cross-browser testing completed
- [ ] Rollback plan documented (this document)
- [ ] Feature flags implemented (optional but recommended)
- [ ] Monitoring and alerting configured
- [ ] Stakeholder approval obtained

### Deployment Process
1. **Deploy to Staging First**
   - Test all scenarios in QA_TESTING_MATRIX.md
   - Run performance profiling
   - Verify analytics tracking

2. **Gradual Rollout (If Supported)**
   - 10% traffic → monitor for 1 hour
   - 50% traffic → monitor for 4 hours
   - 100% traffic → monitor for 24 hours

3. **Monitor Key Metrics**
   - Error rate (target: < 0.1%)
   - Page load time (target: < 3s)
   - FPS (target: > 55fps)
   - User engagement (scroll depth, scene completions)

4. **Rollback Decision Window**
   - First 1 hour: Fast rollback if critical issues
   - First 24 hours: Monitor and fix forward if possible
   - After 24 hours: Rollback unlikely, fix forward preferred

---

## Rollback Decision Matrix

| Issue Severity | User Impact | Error Rate | Rollback Decision |
|----------------|-------------|------------|-------------------|
| Critical       | All users   | > 5%       | Immediate rollback |
| High           | > 50% users | > 1%       | Rollback within 1 hour |
| Medium         | 10-50% users| 0.1-1%     | Fix forward or rollback in 24h |
| Low            | < 10% users | < 0.1%     | Fix forward |

---

## Rollback Checklist

### Phase 1: Decision (0-15 min)
- [ ] Identify issue severity using matrix
- [ ] Confirm rollback decision with stakeholders
- [ ] Notify team via communication plan
- [ ] Assign rollback lead

### Phase 2: Preparation (15-30 min)
- [ ] Identify rollback target (commit/tag/branch)
- [ ] Create rollback branch
- [ ] Test rollback locally
- [ ] Prepare deployment scripts

### Phase 3: Execution (30-60 min)
- [ ] Deploy rollback to staging
- [ ] Verify rollback on staging
- [ ] Deploy rollback to production
- [ ] Monitor production for 15 minutes

### Phase 4: Verification (60-90 min)
- [ ] Run post-rollback verification checklist
- [ ] Confirm error rate decreased
- [ ] Verify user-facing functionality restored
- [ ] Update status page (if applicable)

### Phase 5: Post-Mortem (Within 24 hours)
- [ ] Document root cause of issue
- [ ] Identify prevention measures
- [ ] Create fix plan with timeline
- [ ] Schedule re-deployment review

---

## Contact Information

**Rollback Lead:** [NAME]
**Email:** [EMAIL]
**Phone:** [PHONE]

**Backup Contact:** [NAME]
**Email:** [EMAIL]
**Phone:** [PHONE]

**Escalation Path:**
1. Rollback Lead
2. Engineering Manager
3. CTO / Technical Director

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0   | 2025-10-08 | Claude | Initial rollback plan for Phases 2-4 |

---

**Last Reviewed:** 2025-10-08
**Next Review Due:** 2025-11-08 (or after next major deployment)
