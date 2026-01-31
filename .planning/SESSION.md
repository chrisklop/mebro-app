# Mebro Session Context

> **Last Updated:** 2026-01-31
> **Status:** Reorganizing for fastest path to submission
> **Goal:** Submit to app stores ASAP → Add monetization post-launch

---

## What Is Mebro?

A fact-checking app with mobile (Expo) and web (Next.js) clients. Users paste claims, get AI-powered fact-checks, and can share results via links.

## Project Structure

| Folder | Purpose |
|--------|---------|
| `/Users/klop/mebro-app` | Expo mobile app (iOS/Android/Web) |
| `/Users/klop/lmdyrfy` | Next.js web app (www.mebro.app) |

Both share the same Supabase backend.

---

## Roadmap to App Store

### Strategy: Submit Free App First
You can submit a FREE app now, then add IAP via update. This is faster and common practice.

---

## PRE-LAUNCH (Required for Submission)

### 1. Blockers (Do First)
| Task | Why | Status |
|------|-----|--------|
| Commit mobile app auth changes | Unblocks all mobile work | [ ] |
| Apple Developer Account ($99/yr) | Required for iOS | [ ] |
| Google Play Developer ($25 one-time) | Required for Android | [ ] |
| Terms of Service page | Required by stores | [ ] |

### 2. App Store Assets
| Task | Platform | Status |
|------|----------|--------|
| Privacy Policy URL | Both | [✓] |
| App icon (1024x1024) | Both | [ ] |
| iOS screenshots (6.5" + 5.5") | iOS | [ ] |
| Android screenshots | Android | [ ] |
| Feature graphic (1024x500) | Android | [ ] |

### 3. Build & Test
| Task | Status |
|------|--------|
| Configure eas.json for production | [ ] |
| iOS production build (EAS) | [ ] |
| Android AAB build (EAS) | [ ] |
| TestFlight internal testing | [ ] |
| Google Play internal testing | [ ] |

### 4. Submit
| Task | Status |
|------|--------|
| Complete App Store Connect listing | [ ] |
| Complete Google Play Console listing | [ ] |
| Age rating questionnaire | [ ] |
| **Submit to iOS App Review** | [ ] |
| **Submit to Google Play Review** | [ ] |

---

## POST-LAUNCH (After Approval)

### RevenueCat & Monetization
*Add via app update after initial approval*

| Task | Status |
|------|--------|
| Create RevenueCat account | [ ] |
| Set up iOS StoreKit | [ ] |
| Set up Google Play Billing | [ ] |
| Install `react-native-purchases` | [ ] |
| Create subscription products | [ ] |
| Build paywall UI | [ ] |
| Implement entitlement checks | [ ] |
| Restore purchases flow | [ ] |
| Web billing (optional) | [ ] |

**Pricing Strategy:**
- Free tier: 5 checks/day (current)
- Pro tier: Unlimited checks, $4.99/mo or $29.99/yr

### Feature Parity (Nice to Have)
*Can add incrementally*

| Task | Platform | Status |
|------|----------|--------|
| Add /contact to mobile | Mobile | [ ] |
| Add /reset-password to mobile | Mobile | [ ] |
| Add /account to web | Web | [ ] |
| Add /leaderboard to web | Web | [ ] |
| UI consistency audit | Both | [ ] |
| Deep links testing | Mobile | [ ] |

### SEO & Growth
| Task | Status |
|------|--------|
| Dynamic sitemap for /r/[slug] | [x] |
| Dynamic meta tags per claim | [x] |
| Submit to Google Search Console | [ ] |
| App preview video (30s) | [ ] |

### Zoho Integration
| Task | Status |
|------|--------|
| Zoho Analytics MCP setup | [ ] |
| Usage dashboard (signups, fact-checks, verdicts) | [ ] |
| Zoho Campaigns newsletter | [ ] |
| Zoho Apptics for mobile analytics | [ ] |

---

## Cost Stack

| Service | Plan | Cost | Limits | Status |
|---------|------|------|--------|--------|
| Vercel | Pro | $20/mo | 1TB bandwidth | Active |
| Supabase | Free | $0 | 500MB DB, pauses 7d inactive | Active |
| Gemini API | Free tier | $0 | 1000 req/day | Active |
| Zoho SMTP | Free | $0 | 50 emails/day | Active |
| Apple Developer | Annual | $99/yr | Required for iOS | **Needed** |
| Google Play | One-time | $25 | Required for Android | **Needed** |
| RevenueCat | Free tier | $0 | <$2.5k MTR | **Needed** |
| **Current Total** | | **~$20/mo** | | |
| **After Accounts** | | **~$30/mo** (avg) | | |

---

## Key Dates & Deadlines

- **April 2026:** iOS requires Xcode 26 SDK for new submissions
- **Jan 1, 2026:** Google Play new developer policies in effect
- **Recommendation:** Submit before April to avoid SDK upgrade

---

## Quick Wins (Low-Hanging Fruit)

1. [ ] Add Terms of Service page (copy from template, 30 min)
2. [ ] Generate app icon variations (already have base icon)
3. [ ] Screenshot automation with Maestro or manual captures
4. [ ] RevenueCat account is free - can set up today

---

## Dashboard Enhancements (Ideas)

Additional metrics to track in future sessions:

| Metric | Source | Value |
|--------|--------|-------|
| Total fact checks | Supabase `fact_checks` table | Usage trends |
| API costs (Gemini) | Google Cloud Console | Cost monitoring |
| Error rate | Vercel logs or Sentry | Quality |
| Conversion rate | RevenueCat dashboard | Revenue |
| App store rating | App Store Connect / Play Console | User satisfaction |
| Crash rate | EAS/Sentry | Stability |
| DAU/MAU | Add analytics (Posthog/Amplitude) | Engagement |

---

## What's Completed

- [x] Full auth system with email/password
- [x] Email confirmation via Zoho SMTP
- [x] Password reset flow (web)
- [x] Contact form at /contact (web)
- [x] User-based rate limiting (5 guest → 15 auth)
- [x] Admin notification emails
- [x] Branded email templates
- [x] Supabase MCP configured
- [x] Privacy policy page
- [x] Session startup dashboard (CLAUDE.md)
- [x] App store submission roadmap (6 phases)
- [x] Global session commands (`/init`, `/r`, `/s`)

---

## Key Files

| File | Purpose |
|------|---------|
| `/Users/klop/lmdyrfy/.secrets.md` | All credentials |
| `/Users/klop/lmdyrfy/.env.local` | Environment variables |
| `~/.mcp.json` | MCP server configs |
| `/Users/klop/mebro-app/app.json` | Expo config (bundle IDs set) |

---

## Quick Commands

```bash
# Web app (Next.js)
cd /Users/klop/lmdyrfy && npm run dev

# Mobile app (Expo)
cd /Users/klop/mebro-app && npx expo start

# EAS build (when ready)
cd /Users/klop/mebro-app && eas build --platform all

# Query users
mcp__supabase__execute_sql: SELECT * FROM auth.users ORDER BY created_at DESC
```

---

## Notes

- Mobile app changes on `feature/expo-web` branch - NOT committed
- Web app on `main` branch (merged from feature/auth-and-contact)
- Bundle IDs already set: `com.mebro.app` (iOS & Android)
- EAS project ID configured: `699bbcaa-d807-475b-b39c-542a5770962b`
- Rate limits: 5/day guest, 15/day authenticated

---

## Sources

- [RevenueCat Expo Docs](https://www.revenuecat.com/docs/getting-started/installation/expo)
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [Expo Submit](https://docs.expo.dev/submit/introduction/)
- [App Store Submission](https://developer.apple.com/app-store/submitting/)
- [Google Play Requirements](https://support.google.com/googleplay/android-developer/answer/16810878)
