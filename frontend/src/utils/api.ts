/**
 * API Utility Functions
 * Centralized API call helpers for the application.
 */

const API_BASE = '/api';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getVerificationCode(): Promise<{ code: string; expires_in_seconds: number }> {
  return fetchApi('/verification/code');
}

export async function getReturnRisk(productId: string) {
  return fetchApi(`/products/${productId}/return-risk`);
}

export async function getRecommendations(userId: string = 'user_001') {
  return fetchApi(`/marketplace/recommendations?user_id=${userId}`);
}

export async function getSustainabilityImpact(userId: string = 'user_001') {
  return fetchApi(`/green-credits/${userId}/impact`);
}

// ── AI Product Analysis endpoints ────────────────────────────────────────────

export interface ProductAnalysisRequest {
  product_id: string;
  captured_image_hash: string;
  captured_timestamp: string;
  verification_code?: string;
}

export async function runFullAnalysis(request: ProductAnalysisRequest) {
  return fetchApi('/analysis/full', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function verifyProduct(request: { product_id: string; captured_image_hash: string; captured_timestamp: string }) {
  return fetchApi('/analysis/verify', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function analyzeCondition(request: {
  product_id: string;
  product_name: string;
  product_category: string;
  product_value: number;
  captured_image_hash: string;
}) {
  return fetchApi('/analysis/condition', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function getAnalysisResults() {
  return fetchApi('/analysis/results');
}
