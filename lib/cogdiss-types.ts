import type { Claim } from './types';

export interface CogDissBeneficiary {
  name: string;
  explanation: string;
}

export interface CogDissSourceLink {
  url: string;
  title: string;
  relevance: string;
}

export interface CogDissResult {
  narrative: string;
  summary: string;
  beneficiaries: CogDissBeneficiary[];
  tactics: string[];
  sourceLinks: CogDissSourceLink[];
  confidence: number;
}

export interface DualResult {
  factCheck: Claim;
  cogDiss: CogDissResult;
  slug: string;
}

export interface CogDissAnalyzeResponse {
  success: boolean;
  slug?: string;
  error?: string;
}

export interface CogDissResultResponse {
  success: boolean;
  result?: DualResult;
  error?: string;
}
