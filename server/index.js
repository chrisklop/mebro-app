require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');
const { YoutubeTranscript } = require('youtube-transcript');

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:8081' }));
app.use(express.json());

// Supabase admin client (service role — only set in production)
const supabase =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

// Map RevenueCat event types to subscription tiers
const TIER_BY_EVENT = {
  INITIAL_PURCHASE: 'premium',
  RENEWAL: 'premium',
  PRODUCT_CHANGE: 'premium',
  CANCELLATION: 'free',
  EXPIRATION: 'free',
  BILLING_ISSUE: 'free',
  SUBSCRIBER_ALIAS: null, // no tier change
};

async function updateSubscriptionTier(appUserId, tier) {
  if (!supabase) {
    console.warn('[webhook] Supabase not configured — skipping tier update');
    return;
  }
  const { error } = await supabase
    .from('user_subscriptions')
    .upsert({ user_id: appUserId, tier, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  if (error) throw new Error(`Supabase upsert failed: ${error.message}`);
}

async function getSubscriptionTier(userId) {
  if (!supabase) return 'free';
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('tier')
    .eq('user_id', userId)
    .single();
  if (error || !data) return 'free';
  return data.tier;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyB61DuF2JNLlQnQ6gLmyxXAFLsW937hYxg';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// In-memory store: slug -> { status, factCheck?, cogDiss? }
const store = new Map();

// Poll mebro.app until the claim verdict is ready
async function pollClaim(slug, maxAttempts = 20, delayMs = 1500) {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(`https://mebro.app/api/claims/${slug}`);
    if (!res.ok) throw new Error(`Poll failed: ${res.status}`);
    const data = await res.json();
    if (data.verdict && data.verdict !== 'pending') {
      return data;
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error('Timed out waiting for fact-check verdict');
}

// Run Gemini analysis on the fact-checked claim
async function analyzeCogDiss(query, factCheck) {
  const prompt = `You are a disinformation analyst. Given a claim and its fact-check verdict, analyze: (1) the narrative being pushed, (2) who benefits from this disinfo, (3) what tactics are used (emotional appeal, false authority, etc), (4) provide source links for your analysis.

Claim: "${query}"

Fact-check verdict: ${factCheck.verdict}

Fact-check summary: ${factCheck.summary || factCheck.explanation || '(none provided)'}

Respond with a JSON object only — no markdown, no explanation outside the JSON. The JSON must have these keys: narrative (string), beneficiaries (array of objects with name and explanation), tactics (array of strings), sourceLinks (array of objects with url, title, relevance), confidence (number 0-1), summary (string).`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const cleaned = text.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim();
  return JSON.parse(cleaned);
}

// Background processing for a claim
async function processClaimAsync(slug, query, tone) {
  try {
    // Step 1: Poll until verdict is ready
    const factCheck = await pollClaim(slug);

    // Step 2: Gemini disinfo analysis
    const cogDiss = await analyzeCogDiss(query, factCheck);

    store.set(slug, { status: 'done', factCheck, cogDiss, query });
  } catch (err) {
    console.error(`[processClaimAsync] slug=${slug}`, err);
    store.set(slug, { status: 'error', error: err.message });
  }
}

// POST /api/cog-diss/analyze — accepts slug from client (client creates claim via mebro.app auth)
app.post('/api/cog-diss/analyze', async (req, res) => {
  const { query, tone, slug } = req.body;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ success: false, error: 'slug is required (create claim via mebro.app first)' });
  }
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ success: false, error: 'query is required' });
  }

  try {
    // Return slug immediately if already done
    if (store.has(slug) && store.get(slug).status === 'done') {
      return res.json({ success: true, slug });
    }

    // Mark as processing and kick off background work
    store.set(slug, { status: 'processing' });
    processClaimAsync(slug, query, tone).catch(() => {});

    return res.json({ success: true, slug });
  } catch (err) {
    console.error('[/api/cog-diss/analyze]', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/cog-diss/result/:slug — returns result in DualResult shape
app.get('/api/cog-diss/result/:slug', (req, res) => {
  const { slug } = req.params;
  const entry = store.get(slug);

  if (!entry) {
    return res.status(404).json({ success: false, error: 'No result for this slug' });
  }

  if (entry.status === 'processing') {
    return res.json({ success: true, result: null });
  }

  if (entry.status === 'error') {
    return res.json({ success: false, error: entry.error });
  }

  return res.json({
    success: true,
    result: {
      factCheck: entry.factCheck,
      cogDiss: entry.cogDiss,
      slug,
    },
  });
});

// POST /api/webhooks/revenuecat — receives subscription lifecycle events
app.post('/api/webhooks/revenuecat', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const expectedKey = process.env.REVENUECAT_WEBHOOK_AUTH_KEY;

  if (!expectedKey) {
    console.error('[webhook] REVENUECAT_WEBHOOK_AUTH_KEY not set — rejecting all requests');
    return res.status(500).json({ error: 'Webhook auth not configured' });
  }
  if (authHeader !== expectedKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const event = req.body?.event;
  if (!event || !event.type) {
    return res.status(400).json({ error: 'Missing event.type' });
  }

  const { type, app_user_id: appUserId } = event;
  console.log(`[webhook] Received event type=${type} user=${appUserId}`);

  const tier = TIER_BY_EVENT[type];
  if (tier !== null && tier !== undefined && appUserId) {
    try {
      await updateSubscriptionTier(appUserId, tier);
      console.log(`[webhook] Updated user=${appUserId} tier=${tier}`);
    } catch (err) {
      console.error('[webhook] Failed to update tier:', err.message);
      return res.status(500).json({ error: 'Failed to update subscription tier' });
    }
  }

  return res.json({ received: true });
});

// GET /api/subscription/:userId — check subscription tier server-side
app.get('/api/subscription/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const tier = await getSubscriptionTier(userId);
    return res.json({ userId, tier });
  } catch (err) {
    console.error('[/api/subscription]', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// --- YouTube transcript fact-checker ---

// In-memory store for YouTube analysis: slug -> { status, claims?, error? }
const ytStore = new Map();

function extractYouTubeVideoId(url) {
  try {
    const parsed = new URL(url);
    // youtube.com/watch?v=ID
    if (parsed.hostname.includes('youtube.com') && parsed.pathname === '/watch') {
      return parsed.searchParams.get('v');
    }
    // youtube.com/shorts/ID
    if (parsed.hostname.includes('youtube.com') && parsed.pathname.startsWith('/shorts/')) {
      return parsed.pathname.split('/shorts/')[1].split('/')[0] || null;
    }
    // youtu.be/ID
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1).split('/')[0] || null;
    }
  } catch {
    return null;
  }
  return null;
}

function ytSlug() {
  return Math.random().toString(36).slice(2, 10);
}

async function analyzeYouTubeTranscript(slug, videoId) {
  try {
    const segments = await YoutubeTranscript.fetchTranscript(videoId);
    const transcript = segments.map((s) => s.text).join(' ');

    const prompt = `You are a fact-checking analyst. Carefully read the following video transcript and identify every substantive factual claim made. For each claim, provide:
- claim: the exact or paraphrased claim
- verdict: one of TRUE, FALSE, MISLEADING, or UNVERIFIED
- confidence: integer 0-100
- explanation: brief explanation of the verdict
- sources: array of source objects with url and title (use real, credible sources when possible)

Transcript:
"""
${transcript.slice(0, 12000)}
"""

Respond with a JSON object only — no markdown, no text outside the JSON. The JSON must have a single key "claims" which is an array of claim objects.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(cleaned);

    ytStore.set(slug, { status: 'done', claims: parsed.claims, videoId });
  } catch (err) {
    console.error(`[analyzeYouTubeTranscript] slug=${slug}`, err);
    ytStore.set(slug, { status: 'error', error: err.message });
  }
}

// POST /api/youtube/analyze — accepts { url, userId? }, returns { slug }
app.post('/api/youtube/analyze', async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ success: false, error: 'url is required' });
  }

  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    return res.status(400).json({ success: false, error: 'Invalid YouTube URL' });
  }

  const slug = ytSlug();
  ytStore.set(slug, { status: 'processing' });
  analyzeYouTubeTranscript(slug, videoId).catch(() => {});

  return res.json({ success: true, slug });
});

// GET /api/youtube/result/:slug — poll for analysis results
app.get('/api/youtube/result/:slug', (req, res) => {
  const { slug } = req.params;
  const entry = ytStore.get(slug);

  if (!entry) {
    return res.status(404).json({ success: false, error: 'No result for this slug' });
  }

  if (entry.status === 'processing') {
    return res.json({ success: true, result: null });
  }

  if (entry.status === 'error') {
    return res.json({ success: false, error: entry.error });
  }

  return res.json({
    success: true,
    result: {
      claims: entry.claims,
      videoId: entry.videoId,
      slug,
    },
  });
});

// GET /api/health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', supabase: !!supabase });
});

app.listen(PORT, () => {
  console.log(`cog-diss server running on http://localhost:${PORT}`);
});
