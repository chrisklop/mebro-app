# Mebro - Fact-Checking App

## Overview
Mebro is a fact-checking app that lets users paste claims, get AI-powered verdicts with sources, and share results via unique links. Built with Expo/React Native for cross-platform (web, iOS, Android).

## Tech Stack
- **Framework**: Expo SDK 54 with expo-router (file-based routing)
- **Language**: TypeScript
- **UI**: React Native components with custom design system
- **Icons**: lucide-react-native
- **SVG**: react-native-svg (for shield logo)

## Design System (`lib/design.ts`)
Khaki/black aesthetic inspired by Alpha Board:
- **Background**: `#C4B99A` (warm khaki)
- **Surface**: `#e8e0cc` (light cream for cards)
- **Surface Dark**: `#1a1a1a` (dark panels)
- **Primary/Text**: `#171717` (near black)
- **Text on Dark**: `#ffffff`

## Project Structure
```
mebro-app/
├── app/
│   ├── _layout.tsx      # Root layout with NavBar
│   ├── index.tsx        # Home screen (hero, input, features)
│   └── r/[slug].tsx     # Result page (verdict, sources, summary)
├── components/
│   ├── NavBar.tsx       # Top navigation
│   ├── VerdictDisplay.tsx
│   ├── SourceList.tsx
│   ├── FormattedSummary.tsx
│   └── TypingAnimation.tsx
├── lib/
│   ├── design.ts        # Colors, spacing, shadows, typography
│   ├── api.ts           # API calls to fact-check backend
│   ├── types.ts         # TypeScript types
│   └── constants.ts     # API URL, etc.
├── branding/            # HTML branding kit files
├── app.json             # Expo config (PWA, splash, icons)
├── eas.json             # EAS build profiles
└── vercel.json          # Vercel deployment config
```

## Key Features
- **Hero**: "Trust me, Bro" strikethrough + animated black shield with TRUST/MEBRO
- **Tone selector**: Academic, Snarky, Brutal
- **Progress bar**: Shows stages during fact-checking (Analyzing → Searching → Verifying → Cross-referencing → Generating)
- **Shareable links**: Each verdict gets a unique `/r/[slug]` URL
- **Dark panel section**: "How It Works" with sample verdict

## Deployment

### Web (Vercel)
- Auto-deploys from GitHub on push
- Config in `vercel.json`
- Build: `npx expo export --platform web`
- Output: `dist/`

### Mobile (EAS)
- Project ID: `699bbcaa-d807-475b-b39c-542a5770962b`
- Expo account: `@chrisklop/mebro`
- Build profiles in `eas.json`:
  - `preview`: APK for Android, Simulator for iOS
  - `production`: App store builds

### PWA
- Configured in `app.json` web section
- Users can "Add to Home Screen" on mobile browsers

## Development
```bash
# Install dependencies
npm install

# Start dev server (web)
npx expo start --web --port 8082

# Build for production
npx expo export --platform web

# EAS builds
npx eas-cli build --profile preview --platform all
```

## API
Backend endpoint configured in `lib/constants.ts`. Expects:
- `POST /claims` - Create new fact-check
- `GET /claims/:slug` - Get verdict by slug

## GitHub
- Repo: https://github.com/chrisklop/mebro-app
