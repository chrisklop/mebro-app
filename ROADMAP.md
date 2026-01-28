# Mebro Roadmap

## Authentication (In Progress)
- [x] Enable magic links in Supabase
- [ ] **Complete Google OAuth setup** - credentials created, need to add to Supabase
- [ ] Add Apple Sign-In (requires $99 Apple Developer account)
- [ ] Add auth UI to web app (copy pattern from mobile `lib/auth.tsx`)
- [ ] Link sharers to user accounts when they sign in (migrate IP-based stats)

## Gamification (In Progress)
- [x] Database schema: sharers, claim_views tables
- [x] API endpoints: /leaderboard, /sharers/me, /claims/[slug]/view
- [x] Web leaderboard page
- [x] View tracking on result pages
- [x] Tier badge in NavBar
- [ ] **Commit mobile app gamification changes** (local only, not pushed)
- [ ] **Merge feature/gamification-leaderboard to main** (after testing)
- [ ] Tier-up celebration toast
- [ ] Username/display name editing

## Deployment
- [ ] Merge gamification feature branch after verification
- [ ] Push mobile app changes
- [ ] Test full flow: create claim → share → view → leaderboard updates

## Future Ideas
- [ ] Animated mascot logo (the little eye guy)
- [ ] Push notifications for tier-ups
- [ ] Weekly leaderboard resets / seasons
- [ ] Referral bonuses
