export type Verdict = 'TRUE' | 'FALSE' | 'MISLEADING' | 'UNVERIFIED';
export type Tone = 'cordial' | 'academic' | 'brutal';
export type SourceType = 'fact-checker' | 'news' | 'academic' | 'primary' | 'ai-grounded';

export interface Source {
  id?: string;
  url: string;
  title: string;
  snippet?: string;
  type: SourceType;
  credibilityScore: number;
  publishedDate?: string;
}

export interface Claim {
  id: string;
  slug: string;
  query: string;
  tone: Tone;
  verdict?: Verdict;
  confidence?: number;
  tldr?: string;
  summary?: string;
  sources: Source[];
  createdAt: string;
  checkedAt?: string;
}

export interface FactCheckResult {
  status: Verdict;
  summary: string;
  color: 'red' | 'yellow' | 'green';
}

export interface ClaimResponse {
  success: boolean;
  claim?: Claim;
  error?: string;
  rateLimit?: {
    remaining: number;
    limit: number;
    resetAt: string;
  };
}

export interface ClaimResult {
  success: boolean;
  claim?: Claim;
  error?: string;
}
