import { api } from './client';
import type { AuthResponse } from '@/types';

export async function signInWithGoogle(credential: string): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/google', { credential });
}

export async function signInWithFacebook(accessToken: string): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/facebook', { access_token: accessToken });
}

export async function signOut(token: string): Promise<void> {
  await api.delete<void>('/auth/session', { token });
}

export async function refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/refresh', { refresh_token: refreshToken });
}
