import { api } from './client';
import type { User, Address } from '@/types';

export async function fetchProfile(token: string): Promise<User> {
  const res = await api.get<{ data: User }>('/profile', { token });
  return res.data;
}

export async function updateProfile(
  data: { name?: string; phone?: string; language?: string },
  token: string
): Promise<User> {
  const res = await api.patch<{ data: User }>('/profile', data, { token });
  return res.data;
}

export async function createAddress(
  data: Omit<Address, 'id'>,
  token: string
): Promise<Address> {
  const res = await api.post<{ data: Address }>('/profile/addresses', data, { token });
  return res.data;
}

export async function updateAddress(
  id: string,
  data: Partial<Omit<Address, 'id'>>,
  token: string
): Promise<Address> {
  const res = await api.patch<{ data: Address }>(`/profile/addresses/${id}`, data, { token });
  return res.data;
}

export async function deleteAddress(id: string, token: string): Promise<void> {
  await api.delete<void>(`/profile/addresses/${id}`, { token });
}
