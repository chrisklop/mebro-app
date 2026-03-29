import type { CogDissAnalyzeResponse, CogDissResultResponse } from './cogdiss-types';

const COGDISS_API = process.env.EXPO_PUBLIC_COGDISS_API || 'http://localhost:3001';

export async function startCogDissAnalysis(slug: string, query: string, tone: string): Promise<CogDissAnalyzeResponse> {
  const response = await fetch(`${COGDISS_API}/api/cog-diss/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug, query, tone }),
  });
  return response.json();
}

export async function getCogDissResult(slug: string): Promise<CogDissResultResponse> {
  const response = await fetch(`${COGDISS_API}/api/cog-diss/result/${slug}`);
  return response.json();
}
