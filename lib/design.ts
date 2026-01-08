// Mebro Design System - Khaki/Black Theme
// Inspired by Alpha Board aesthetic

export const colors = {
  // Backgrounds - Warm khaki palette
  background: '#C4B99A',        // Main khaki background
  backgroundAlt: '#d4c8a8',     // Lighter khaki for contrast
  surface: '#e8e0cc',           // Light cream for elevated surfaces/cards
  surfaceDark: '#1a1a1a',       // Dark panel background

  // Primary accent - Black/dark theme
  primary: '#171717',           // Near black primary
  primaryDark: '#0a0a0a',       // Darker black
  primaryLight: '#2d2d2d',      // Lighter black for hover states

  // Text colors
  textPrimary: '#171717',       // Near black text
  textSecondary: '#3d3d3d',     // Dark gray
  textMuted: '#6b6b6b',         // Medium gray
  textOnDark: '#ffffff',        // White text on dark panels
  textOnDarkMuted: '#a3a3a3',   // Muted text on dark panels

  // Borders
  border: '#a89f7d',            // Darker khaki border
  borderLight: '#d4c8a8',       // Light border

  // Verdict colors - adjusted for khaki background
  verdictTrue: '#16a34a',       // Forest green
  verdictFalse: '#dc2626',      // Red
  verdictNuanced: '#ca8a04',    // Amber
  verdictContext: '#0891b2',    // Cyan
  verdictUnverified: '#7c3aed', // Purple

  // Shadows (warm-toned)
  shadowLight: 'rgba(0, 0, 0, 0.06)',
  shadowMedium: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.15)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  serif: {
    fontFamily: 'System',
    letterSpacing: -0.5,
  },
  sans: {
    fontFamily: 'System',
    letterSpacing: -0.2,
  },
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    xxxl: 48,
    display: 56,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 48,
    elevation: 12,
  },
};

// Verdict styling helper
export const getVerdictStyle = (verdict: string) => {
  const styles: Record<string, { color: string; bg: string; label: string }> = {
    TRUE: { color: colors.verdictTrue, bg: '#dcfce7', label: 'Verified True' },
    FALSE: { color: colors.verdictFalse, bg: '#fee2e2', label: 'False' },
    MOSTLY_TRUE: { color: colors.verdictTrue, bg: '#dcfce7', label: 'Mostly True' },
    MOSTLY_FALSE: { color: colors.verdictFalse, bg: '#fee2e2', label: 'Mostly False' },
    NUANCED: { color: colors.verdictNuanced, bg: '#fef3c7', label: 'Nuanced' },
    NEEDS_CONTEXT: { color: colors.verdictContext, bg: '#cffafe', label: 'Needs Context' },
    UNVERIFIED: { color: colors.verdictUnverified, bg: '#f3e8ff', label: 'Unverified' },
    MISLEADING: { color: colors.verdictNuanced, bg: '#fef3c7', label: 'Misleading' },
  };
  return styles[verdict] || styles.UNVERIFIED;
};

// Snarky messages for the typing animation
export const snarkyMessages = [
  "It's really not that hard to check primary sources...",
  "A 10-second search would have saved you this embarrassment...",
  "Let me do the research you couldn't be bothered to do...",
  "Here's what actually happened, with receipts...",
  "The internet has a memory. Let me remind you...",
  "Facts don't care about your viral tweet...",
];

export const getRandomSnarkyMessage = () => {
  return snarkyMessages[Math.floor(Math.random() * snarkyMessages.length)];
};
