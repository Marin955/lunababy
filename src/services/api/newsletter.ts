import { api } from './client';

export async function subscribe(
  email: string,
  language: string = 'hr'
): Promise<{ message: string }> {
  return api.post<{ message: string }>('/newsletter/subscribe', { email, language });
}
