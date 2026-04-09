const COGDISS_API = process.env.EXPO_PUBLIC_COGDISS_API || 'https://mebro.app';

export interface YouTubeClaim {
  claim: string;
  verdict: 'TRUE' | 'FALSE' | 'MISLEADING' | 'UNVERIFIED';
  confidence: number;
  explanation: string;
  sources?: { url: string; title: string }[];
}

export interface YouTubeAnalysisResult {
  slug: string;
  videoId: string;
  claims: YouTubeClaim[];
}

export interface YouTubeQuota {
  remaining: number;
  limit: number;
  tier: string;
}

export async function startYouTubeAnalysis(url: string, userId?: string): Promise<{ success: boolean; slug?: string; error?: string; quota?: YouTubeQuota }> {
  const response = await fetch(`${COGDISS_API}/api/youtube`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, userId }),
  });
  return response.json();
}

export async function getYouTubeResult(slug: string): Promise<{ success: boolean; result: YouTubeAnalysisResult | null; error?: string }> {
  const response = await fetch(`${COGDISS_API}/api/youtube/result/${slug}`);
  return response.json();
}
