# Mebro Session Context

> **Last Updated:** 2026-01-31
> **Status:** Roadmap complete, ready for Phase 1
> **Goal:** Consistent cross-platform app → RevenueCat paywall → iOS/Android approval

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

## Roadmap to App Store (Prioritized)

### Phase 1: Foundation (Must Do First)
*Unblock everything else*

| Priority | Task | Value | Status |
|----------|------|-------|--------|
| P0 | Commit mobile app auth changes | Unblocks all mobile work | [ ] |
| P0 | Apple Developer Account ($99/yr) | Required for iOS | [ ] |
| P0 | Google Play Developer ($25 one-time) | Required for Android | [ ] |

### Phase 2: Feature Parity
*Consistent experience across platforms*

| Priority | Task | Value | Status |
|----------|------|-------|--------|
| P1 | Add /contact page to mobile | Feature parity | [ ] |
| P1 | Add /reset-password to mobile | Feature parity | [ ] |
| P1 | Add /account page to web | Feature parity | [ ] |
| P1 | Add /leaderboard to web | Feature parity | [ ] |
| P2 | UI consistency audit (fonts, colors, spacing) | Polish | [ ] |
| P2 | Test deep links (mebro://) on mobile | Required for auth | [ ] |

**Current Feature Gap:**
| Page | Web | Mobile |
|------|-----|--------|
| Home | ✓ | ✓ |
| Login | ✓ | ✓ |
| Privacy | ✓ | ✓ |
| Share /r/[slug] | ✓ | ✓ |
| Contact | ✓ | ✗ |
| Reset Password | ✓ | ✗ |
| Account | ✗ | ✓ |
| Leaderboard | ✗ | ✓ |

### Phase 3: RevenueCat Integration
*Monetization before submission*

| Priority | Task | Value | Status |
|----------|------|-------|--------|
| P1 | Create RevenueCat account | Free | [ ] |
| P1 | Set up iOS StoreKit in App Store Connect | Required for iOS IAP | [ ] |
| P1 | Set up Google Play Billing | Required for Android IAP | [ ] |
| P1 | Install `react-native-purchases` | SDK integration | [ ] |
| P1 | Create subscription products (monthly/yearly) | Revenue | [ ] |
| P1 | Build paywall UI component | User-facing | [ ] |
| P1 | Implement entitlement checks | Gate premium features | [ ] |
| P2 | Web billing via RevenueCat (optional) | Cross-platform subs | [ ] |
| P2 | Restore purchases flow | Required by stores | [ ] |

**Pricing Strategy (Decide):**
- [ ] Free tier: 5 checks/day (current)
- [ ] Pro tier: Unlimited checks, no ads, priority support
- [ ] Suggested: $4.99/mo or $29.99/yr

### Phase 4: App Store Assets
*Required for submission*

| Priority | Task | Value | Status |
|----------|------|-------|--------|
| P1 | Privacy Policy URL (have /privacy) | Required | [✓] |
| P1 | Terms of Service page | Required | [ ] |
| P1 | App icon (1024x1024) | Required | [ ] |
| P1 | iOS screenshots (6.5" + 5.5") | Required | [ ] |
| P1 | Android screenshots | Required | [ ] |
| P2 | App preview video (30s) | Optional, high impact | [ ] |
| P2 | Feature graphic (1024x500) for Android | Required | [ ] |

### Phase 5: Build & Test
*EAS builds and testing*

| Priority | Task | Value | Status |
|----------|------|-------|--------|
| P1 | Configure eas.json for production builds | Required | [ ] |
| P1 | Create iOS production build (EAS) | Required | [ ] |
| P1 | Create Android AAB build (EAS) | Required | [ ] |
| P1 | TestFlight internal testing | Catch bugs | [ ] |
| P1 | Google Play internal testing track | Catch bugs | [ ] |
| P2 | External beta testers | User feedback | [ ] |

### Phase 6: Submission
*Final steps*

| Priority | Task | Value | Status |
|----------|------|-------|--------|
| P1 | Complete App Store Connect listing | Required | [ ] |
| P1 | Complete Google Play Console listing | Required | [ ] |
| P1 | Age rating questionnaire | Required | [ ] |
| P1 | Submit to iOS App Review | Goal | [ ] |
| P1 | Submit to Google Play Review | Goal | [ ] |
| P2 | Respond to review feedback | If rejected | [ ] |

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
