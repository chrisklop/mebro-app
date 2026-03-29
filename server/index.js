require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:8081' }));
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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

// POST /api/cog-diss/analyze — returns slug immediately, processes in background
app.post('/api/cog-diss/analyze', async (req, res) => {
  const { query, tone } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ success: false, error: 'query is required' });
  }
  const validTones = ['cordial', 'academic', 'brutal'];
  if (tone && !validTones.includes(tone)) {
    return res.status(400).json({ success: false, error: `tone must be one of: ${validTones.join(', ')}` });
  }

  try {
    // Submit claim to mebro.app
    const submitRes = await fetch('https://mebro.app/api/claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, tone: tone || 'cordial' }),
    });
    if (!submitRes.ok) {
      const err = await submitRes.text();
      return res.status(502).json({ success: false, error: `mebro.app claim submission failed: ${err}` });
    }
    const submitted = await submitRes.json();
    const slug = submitted.slug || submitted.id;
    if (!slug) {
      return res.status(502).json({ success: false, error: 'mebro.app did not return a slug' });
    }

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

// GET /api/health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`cog-diss server running on http://localhost:${PORT}`);
});
