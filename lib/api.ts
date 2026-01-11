import { API_BASE } from './constants';
import { supabase } from './supabase';
import type { Tone, ClaimResponse } from './types';
import type { UsageInfo } from './auth';

interface ApiResponse extends ClaimResponse {
  rateLimit?: UsageInfo;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  return headers;
}

export async function createClaim(
  query: string,
  tone: Tone,
  onUsageUpdate?: (usage: UsageInfo) => void
): Promise<ClaimResponse> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/claims`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, tone }),
    });

    // Handle rate limit exceeded
    if (response.status === 429) {
      const error = await response.json().catch(() => ({}));
      if (error.rateLimit && onUsageUpdate) {
        onUsageUpdate(error.rateLimit);
      }
      return {
        success: false,
        error: 'Daily limit reached. Upgrade for more checks!'
      };
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create claim' }));
      return { success: false, error: error.error || 'Failed to create claim' };
    }

    const data: ApiResponse = await response.json();

    // Update usage info if returned
    if (data.rateLimit && onUsageUpdate) {
      onUsageUpdate(data.rateLimit);
    }

    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

export async function getClaim(slug: string): Promise<ClaimResponse> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/claims/${slug}`, { headers });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Not found' }));
      return { success: false, error: error.error || 'Not found' };
    }

    return response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}
