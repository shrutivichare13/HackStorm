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
