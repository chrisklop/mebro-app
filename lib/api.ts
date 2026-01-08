import { API_BASE } from './constants';
import type { Tone, ClaimResponse } from './types';

export async function createClaim(query: string, tone: Tone): Promise<ClaimResponse> {
  try {
    const response = await fetch(`${API_BASE}/claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, tone }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create claim' }));
      return { success: false, error: error.error || 'Failed to create claim' };
    }

    return response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

export async function getClaim(slug: string): Promise<ClaimResponse> {
  try {
    const response = await fetch(`${API_BASE}/claims/${slug}`);

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
