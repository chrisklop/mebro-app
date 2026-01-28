// Gamification tier system for truth-sharers
// Tiers are earned based on total views across all shared fact-checks

export interface Tier {
  name: string;
  minViews: number;
  color: string;       // Hex color for the tier
  bgColor: string;     // Background color for badges
  emoji: string;       // Optional emoji for display
}

export const TIERS: Tier[] = [
  { name: 'Curious Bro', minViews: 0, color: '#6b7280', bgColor: '#f3f4f6', emoji: '' },
  { name: 'Fact Finder', minViews: 10, color: '#cd7f32', bgColor: '#fef3e2', emoji: '' },
  { name: 'Truth Seeker', minViews: 50, color: '#9ca3af', bgColor: '#f0f0f0', emoji: '' },
  { name: 'Enlightened Bro', minViews: 200, color: '#f59e0b', bgColor: '#fef3c7', emoji: '' },
  { name: 'Myth Buster', minViews: 500, color: '#a78bfa', bgColor: '#ede9fe', emoji: '' },
  { name: 'Truth Sage', minViews: 1000, color: '#60a5fa', bgColor: '#dbeafe', emoji: '' },
  { name: 'Reality Guardian', minViews: 5000, color: '#8b5cf6', bgColor: '#f3e8ff', emoji: '' },
];

// Get tier for a given view count
export function getTierForViews(views: number): Tier {
  // Find the highest tier that the user qualifies for
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (views >= TIERS[i].minViews) {
      return TIERS[i];
    }
  }
  return TIERS[0];
}

// Get next tier (or null if at max)
export function getNextTier(views: number): Tier | null {
  const currentTier = getTierForViews(views);
  const currentIndex = TIERS.findIndex(t => t.name === currentTier.name);
  if (currentIndex < TIERS.length - 1) {
    return TIERS[currentIndex + 1];
  }
  return null;
}

// Get progress to next tier (0-100)
export function getProgressToNextTier(views: number): number {
  const currentTier = getTierForViews(views);
  const nextTier = getNextTier(views);

  if (!nextTier) {
    return 100; // Already at max tier
  }

  const viewsInCurrentTier = views - currentTier.minViews;
  const viewsNeededForNext = nextTier.minViews - currentTier.minViews;

  return Math.min(100, Math.round((viewsInCurrentTier / viewsNeededForNext) * 100));
}

// Get views needed for next tier
export function getViewsToNextTier(views: number): number {
  const nextTier = getNextTier(views);
  if (!nextTier) {
    return 0;
  }
  return nextTier.minViews - views;
}

export interface SharerStats {
  id: string;
  displayName: string;
  totalViews: number;
  claimsShared: number;
  tier: Tier;
  rank?: number;
}
