# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT: Dual App Sync

This mobile app has a sibling web app. **When making UI changes, update BOTH projects:**

| App | Path | Stack |
|-----|------|-------|
| **This (Mobile)** | `/Users/klop/mebro-app` | Expo, React Native |
| **Web** | `/Users/klop/lmdyrfy` | Next.js, Tailwind |

See `/Users/klop/lmdyrfy/DUAL_APP_SYNC.md` for component mapping and translation guide.

See `ROADMAP.md` for current tasks and project status.

---

## Overview
Mebro is a fact-checking app that lets users paste claims, get AI-powered verdicts with sources, and share results via unique links. Built with Expo/React Native for cross-platform (web, iOS, Android).

## Tech Stack
- **Framework**: Expo SDK 54 with expo-router (file-based routing)
- **Language**: TypeScript
- **UI**: React Native components with custom design system
- **Auth**: Supabase with expo-secure-store (native) / localStorage (web)
- **Icons**: lucide-react-native
- **SVG**: react-native-svg (for shield logo)
- **Payments**: react-native-purchases (RevenueCat)

## Design System (`lib/design.ts`)
Khaki/black aesthetic inspired by Alpha Board:
- **Background**: `#C4B99A` (warm khaki)
- **Surface**: `#e8e0cc` (light cream for cards)
- **Surface Dark**: `#1a1a1a` (dark panels)
- **Primary/Text**: `#171717` (near black)
- **Text on Dark**: `#ffffff`

## Architecture

### Core Patterns

**Auth Context** (`lib/auth.tsx`): Provides `useAuth()` hook with user state, session, usage limits, and subscription tier. Wraps the app in `_layout.tsx`.

**Platform-Specific Storage** (`lib/supabase.ts`): Uses `ExpoSecureStoreAdapter` that switches between SecureStore (native) and localStorage (web).

**API Layer** (`lib/api.ts`): All backend calls. Automatically attaches auth headers from Supabase session.

**Gamification** (`lib/tiers.ts`): Tier system based on view counts. Use `getTierForViews()`, `getNextTier()`, `getProgressToNextTier()`.

### Routing (expo-router)
- `app/index.tsx` - Home (hero, claim input, features)
- `app/r/[slug].tsx` - Result page (verdict, sources, summary)
- `app/login.tsx` - Auth screen
- `app/account.tsx` - User account
- `app/privacy.tsx` - Privacy policy

## Key Features
- **Hero**: "Trust me, Bro" strikethrough + animated black shield with TRUST/MEBRO
- **Tone selector**: Cordial, Academic, Brutal
- **Progress bar**: Shows stages during fact-checking (Analyzing → Searching → Verifying → Cross-referencing → Generating)
- **Shareable links**: Each verdict gets a unique `/r/[slug]` URL
- **Dark panel section**: "How It Works" with sample verdict

## Development
```bash
# Install dependencies
npm install

# Start dev server (web)
npx expo start --web --port 8082

# Start dev server (native)
npx expo start

# Build for production
npx expo export --platform web

# EAS builds
npx eas-cli build --profile preview --platform all
```

## API
Backend endpoint at `https://mebro.app/api` (configured in `lib/constants.ts`):
- `POST /claims` - Create new fact-check
- `GET /claims/:slug` - Get verdict by slug
- `GET /leaderboard` - Top sharers
- `GET /sharers/me` - Current user stats
- `POST /claims/:slug/view` - Track view

## Deployment

### Web (Vercel)
- Auto-deploys from GitHub on push
- Config in `vercel.json`
- Build: `npx expo export --platform web`
- Output: `dist/`

### Mobile (EAS)
- Project ID: `699bbcaa-d807-475b-b39c-542a5770962b`
- Expo account: `@chrisklop/mebro`
- Bundle ID: `com.mebro.app`
- Build profiles in `eas.json`:
  - `preview`: APK for Android, Simulator for iOS
  - `production`: App store builds

### PWA
- Configured in `app.json` web section
- Users can "Add to Home Screen" on mobile browsers

## GitHub
- Repo: https://github.com/chrisklop/mebro-app
