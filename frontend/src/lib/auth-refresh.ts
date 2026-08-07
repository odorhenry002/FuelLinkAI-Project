import apiClient from './api-client';

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export async function refreshToken(refreshToken: string): Promise<RefreshResponse> {
  const response = await apiClient.post<RefreshResponse>('/api/auth/refresh', {
    refresh_token: refreshToken,
  });
  return response.data;
}
