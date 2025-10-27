# 🚀 Emotive Engine Site Deployment Checklist

## Pre-Deployment Verification

### ✅ Code Quality

- [ ] All tests passing: `npm test`
- [ ] Linting clean: `npm run lint`
- [ ] Build successful: `npm run build`
- [ ] TypeScript checks pass: `npx tsc --noEmit`

### ✅ Environment Configuration

**Required Environment Variables:**

```bash
# .env.local (create from .env.example if available)
ANTHROPIC_API_KEY=sk-ant-...          # For AI chat features
NEXT_PUBLIC_SITE_URL=https://...     # Production URL
```

**Check Configuration:**

```bash
# Verify Next.js config
cat next.config.js

# Verify API routes exist
ls src/app/api/
```

### ✅ Dependencies

```bash
cd site
npm install
npm audit fix  # Fix any security issues
```

## Build & Deploy

### Option 1: Vercel (Recommended)

**Initial Setup:**

```bash
npm install -g vercel
vercel login
```

**Deploy to Production:**

```bash
vercel --prod
```

**Environment Variables in Vercel:**

1. Go to Project Settings → Environment Variables
2. Add `ANTHROPIC_API_KEY` (Production)
3. Add `NEXT_PUBLIC_SITE_URL` (Production)

### Option 2: Static Export

**Build Static Site:**

```bash
npm run build
npm run export  # If export script exists
```

**Deploy to Static Hosting:**

- Upload `/out` directory to:
    - Netlify
    - GitHub Pages
    - AWS S3 + CloudFront
    - Any static host

### Option 3: Node.js Server

**Build:**

```bash
npm run build
```

**Start Production Server:**

```bash
NODE_ENV=production npm start
```

**Server Requirements:**

- Node.js 18+
- 2GB RAM minimum
- PM2 for process management (recommended)

## Post-Deployment Verification

### ✅ Functionality Tests

**Homepage:**

- [ ] Hero section loads with mascot animation
- [ ] Mascot responds to interactions
- [ ] Emotion buttons work
- [ ] Shape morphing works
- [ ] Gesture animations work

**Music Section (if enabled):**

- [ ] Audio files load: `/assets/tracks/music/electric-glow-f.wav`
- [ ] Audio files load: `/assets/tracks/music/electric-glow-m.wav`
- [ ] BPM sync works correctly
- [ ] Track selection modal works

**AI Features (if enabled):**

- [ ] `/api/chat` endpoint responds
- [ ] AI responses trigger mascot emotions
- [ ] Sentiment analysis works
- [ ] Rate limiting active

**Use Cases Pages:**

- [ ] `/use-cases/education` loads
- [ ] `/use-cases/smart-home` loads
- [ ] `/use-cases/retail` loads
- [ ] Mascot demos work on each page

### ✅ Performance

**Core Web Vitals:**

```bash
# Test with Lighthouse
npm install -g lighthouse
lighthouse https://your-site.com --view
```

**Target Metrics:**

- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

**Asset Optimization:**

- [ ] Images optimized (WebP/AVIF)
- [ ] Bundle size acceptable (< 500KB JS)
- [ ] Audio files compressed
- [ ] Fonts optimized

### ✅ Browser Compatibility

**Test Browsers:**

- [ ] Chrome/Edge (Chromium 90+)
- [ ] Firefox (90+)
- [ ] Safari (14+)
- [ ] Mobile Safari (iOS 14+)
- [ ] Mobile Chrome (Android 10+)

**Canvas/WebGL:**

- [ ] Mascot renders correctly
- [ ] Particles render smoothly
- [ ] Glow effects work
- [ ] No WebGL errors in console

### ✅ Security

**Headers:**

```bash
# Check security headers
curl -I https://your-site.com
```

**Should include:**

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security: max-age=...`

**API Rate Limiting:**

- [ ] `/api/chat` has rate limiting
- [ ] API keys not exposed in client code
- [ ] CORS configured correctly

### ✅ Monitoring

**Setup Monitoring:**

```bash
# Add to your deployment
- Error tracking (Sentry/LogRocket)
- Analytics (Google Analytics/Plausible)
- Uptime monitoring (UptimeRobot/Pingdom)
```

## Rollback Plan

**If deployment fails:**

```bash
# Vercel - Instant rollback
vercel rollback

# Manual rollback
git revert HEAD
git push origin main
# Redeploy previous version
```

## Common Issues & Solutions

### Issue: Mascot not rendering

**Check:**

```bash
# Verify UMD bundle exists
ls site/public/emotive-engine.js

# Check browser console for errors
# Look for: "EmotiveMascot is not defined"
```

**Fix:** Rebuild the engine

```bash
cd ..  # Back to root
npm run build:dev
```

### Issue: Audio files 404

**Check:**

```bash
# Verify audio files exist
ls site/public/assets/tracks/music/

# Should see:
# electric-glow-f.wav (34.5 MB)
# electric-glow-m.wav (32.9 MB)
```

**Fix:** Audio files must be in `site/public/assets/`

### Issue: API endpoints failing

**Check:**

```bash
# Test API locally
curl http://localhost:3000/api/chat -X POST \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'
```

**Fix:** Verify environment variables set in production

### Issue: Build fails

**Common causes:**

- Missing dependencies: `npm install`
- TypeScript errors: `npx tsc --noEmit`
- Next.js config issues: Check `next.config.js`

## Performance Optimization

### Before Launch:

**1. Optimize Assets:**

```bash
# Compress images
npm install -g sharp-cli
sharp -i input.png -o output.webp

# Analyze bundle
npm run build -- --analyze  # If configured
```

**2. Enable Caching:**

```javascript
// next.config.js
module.exports = {
    headers: async () => [
        {
            source: '/assets/:path*',
            headers: [
                {
                    key: 'Cache-Control',
                    value: 'public, max-age=31536000, immutable',
                },
            ],
        },
    ],
};
```

**3. Lazy Loading:**

- [ ] Heavy components lazy loaded
- [ ] Audio files loaded on demand
- [ ] Use cases loaded with React.lazy()

## Documentation Updates

**After successful deployment:**

- [ ] Update main README with live site URL
- [ ] Update CONTRIBUTING.md with deployment info
- [ ] Tag release: `git tag v1.0.0 && git push --tags`
- [ ] Create GitHub release with changelog

## Success Criteria

### ✅ Site is Live

- URL accessible globally
- SSL certificate valid
- DNS propagated

### ✅ Core Features Work

- Mascot renders and animates
- Interactions respond correctly
- Audio sync works (if enabled)
- AI features work (if enabled)

### ✅ Performance Acceptable

- Page load < 3s
- Animation smooth (60 FPS)
- No console errors
- Works on mobile

### ✅ Monitoring Active

- Error tracking configured
- Analytics collecting data
- Uptime monitoring active

---

## Quick Deploy Commands

**Fresh deployment:**

```bash
# From project root
cd site
npm install
npm run build
vercel --prod
```

**Update deployment:**

```bash
git add -A
git commit -m "feat: update site"
git push origin main
# Auto-deploys if CI/CD configured
```

**Emergency rollback:**

```bash
vercel rollback
```

---

**Last Updated:** 2025-10-27 **Status:** ✅ Ready for production deployment
