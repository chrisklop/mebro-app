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

// Waiting messages shown during fact-check (tone-aware)
export const waitingMessages = {
  cordial: [
    "We're diving deep into the sources for you...",
    "Good news: when you share this link, they'll see it instantly!",
    "Checking multiple fact-checkers to be thorough...",
    "Cross-referencing with official sources...",
    "Almost there! Quality takes a moment.",
    "Your shareable link will be ready soon...",
    "Verifying against academic and government sources...",
    "We believe in getting it right, not just fast.",
    "Fun fact: Your friends won't have to wait—results are cached!",
    "Scanning news archives for context...",
    "Double-checking our work for accuracy...",
    "This is worth the wait—trust us (with sources).",
    "Pro tip: Bookmark mebro.app for quick fact-checks!",
    "Building your fact-check with citations...",
    "We're being extra careful with this one...",
    "Your link will work forever once it's ready!",
    "Gathering the receipts you need...",
    "Making sure every claim is backed by evidence...",
    "The truth is worth a few seconds of patience.",
    "Nearly done! Thanks for waiting.",
  ],
  academic: [
    "Conducting systematic source verification...",
    "Note: Cached results ensure instant access for link recipients.",
    "Cross-referencing peer-reviewed literature...",
    "Analyzing primary source documentation...",
    "Evaluating source credibility metrics...",
    "Synthesizing findings from multiple databases...",
    "Applying fact-checking methodology...",
    "Your generated URL will persist indefinitely post-verification.",
    "Consulting established fact-checking organizations...",
    "Triangulating across independent sources...",
    "Assessing evidentiary strength of claims...",
    "Methodology: Multi-source verification protocol in progress.",
    "Examining governmental and institutional records...",
    "Quality assurance protocols in progress...",
    "Comprehensive analysis requires thorough examination.",
    "Your citation-backed results are being compiled...",
    "Verification infrastructure processing request...",
    "Applying rigorous epistemic standards...",
    "Final synthesis and conclusion generation...",
    "Analysis nearing completion. Please stand by.",
  ],
  brutal: [
    "Hold your horses—we're doing the homework you skipped.",
    "Spoiler: When you send this link, they won't have any excuses.",
    "Digging through the BS to find the truth...",
    "Unlike that viral post, we actually check sources.",
    "Your friends will get the answer instantly. You? You wait.",
    "Finding receipts to either prove or roast this claim...",
    "This is taking longer because we're being thorough, unlike whoever made this claim.",
    "Imagine if the original poster spent this much time fact-checking...",
    "We're basically doing journalism. For free. You're welcome.",
    "The truth doesn't care about your timeline.",
    "Almost done exposing whatever nonsense this is...",
    "Your shareable link of shame (or vindication) is loading...",
    "Checking if this is as dumb as it sounds...",
    "Good things come to those who don't spread misinformation.",
    "We're thorough. Can't say the same for whoever made this claim.",
    "Building an airtight case. Patience.",
    "The internet never forgets, and neither will this link.",
    "Compiling evidence for maximum \"I told you so\" potential...",
    "Your one-click shutdown of bad takes is almost ready.",
    "Done soon. Try not to spread anything else while you wait.",
  ],
};

// Get a waiting message by index (cycles through)
export const getWaitingMessage = (tone: 'cordial' | 'academic' | 'brutal', index: number) => {
  const messages = waitingMessages[tone];
  return messages[index % messages.length];
};

// "Rub it in" banners for shared links (tone-aware)
export const sharedLinkBanners = {
  cordial: [
    "Someone thought you should see this. Now you can check claims too at mebro.app!",
    "Fact-checked and ready for you! Want to verify something yourself? Try mebro.app",
    "The facts are in. You're welcome to fact-check anything at mebro.app!",
  ],
  academic: [
    "This claim has been independently verified. Conduct your own analysis at mebro.app",
    "Pre-verified result. Access the fact-checking methodology at mebro.app",
    "Evidentiary analysis complete. Submit queries at mebro.app",
  ],
  brutal: [
    "Someone fact-checked this so you wouldn't embarrass yourself. You're welcome.",
    "The receipts have been pulled. Don't be the next person who needs this treatment—check first at mebro.app",
    "This took about 15 seconds to check. Imagine if everyone did this before hitting 'share'...",
  ],
};

export const getSharedLinkBanner = (tone: 'cordial' | 'academic' | 'brutal') => {
  const banners = sharedLinkBanners[tone];
  return banners[Math.floor(Math.random() * banners.length)];
};

// Wisdom quotes about primary sources and fact-checking (tone-neutral)
export const progressQuotes = [
  "Opinions are loud; facts are sourced.",
  "If you only drink commentary, don't be shocked you're thirsty for truth.",
  "A timeline without documents is just a story with dates.",
  "Facts don't come from vibes; they come from verifiable records.",
  "Primary sources: where reality keeps its receipts.",
  "Secondhand takes are easy—firsthand evidence is earned.",
  "An opinion repeated isn't a fact; it's an echo with confidence.",
  "Read the original, then decide what it means.",
  "Trust is good; citations are better.",
  "If you can't trace it back, you can't trust it forward.",
  "Hot takes cool off fast; primary documents stay on file.",
  "Evidence is what survives translation through bias.",
  "A claim without a source is a rumor with punctuation.",
  "Facts are built from data, not volume.",
  "Before you share the conclusion, check the underlying record.",
  "The shortest path to clarity is the original material.",
  "Commentary explains; primary sources prove.",
  "Headlines sell feelings—primary sources sell accuracy.",
  "Interpretations vary; the document is the anchor.",
  "Your opinion deserves a foundation, not a pedestal.",
  "Primary sources turn 'they said' into 'it says.'",
  "A screenshot of a quote isn't proof; the full context is.",
  "Evidence is patient; outrage is impulsive.",
  "Truth doesn't need a chorus—just a citation.",
  "If the source is missing, the certainty should be too.",
  "Don't outsource your reality to someone else's summary.",
  "Facts are what remain after you remove the narrator.",
  "Start with the dataset, not the debate.",
  "When opinions clash, the record settles it.",
  "Primary sources are the antidote to confident nonsense.",
  "A fact-check without originals is a check without cash.",
  "The best argument is a link to the underlying document.",
  "If it's true, you can show your work.",
  "Claims travel fast; corroboration takes the scenic route.",
  "Primary sources don't care what team you're on.",
  "Evidence beats eloquence.",
  "Don't mistake passion for proof.",
  "Reality is not a consensus—it's a set of traceable events.",
  "Anecdotes persuade; documents verify.",
  "Treat summaries like maps: useful, but not the territory.",
  "If all you consume is opinion, your 'facts' will be borrowed.",
  "Primary sources are where nuance lives.",
  "Read transcripts, filings, datasets—then judge the spin.",
  "Proof is what you can reproduce, not what you can repeat.",
  "The original record is the referee of competing narratives.",
  "Primary sources turn suspicion into confirmation or correction.",
  "Opinions are seasoning; evidence is the meal.",
  "When you can cite it, you can defend it.",
  "Do the boring work: find the document, check the numbers.",
  "If you want truth, follow the footnotes.",
];

export const getRandomProgressQuote = () => {
  return progressQuotes[Math.floor(Math.random() * progressQuotes.length)];
};
