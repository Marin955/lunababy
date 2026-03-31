'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User } from '@/types';
import { setTokenRefresher } from '@/services/api/client';
import { refreshAccessToken } from '@/services/api/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  signIn: (token: string, refreshToken: string, user: User) => void;
  signOut: () => void;
  setUser: (user: User) => void;
  getToken: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isReady: false,

        signIn: (token, refreshToken, user) => {
          set({ user, token, refreshToken, isAuthenticated: true, isReady: true }, false, 'signIn');
        },

        signOut: () => {
          set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isReady: true }, false, 'signOut');
        },

        setUser: (user) => {
          set({ user }, false, 'setUser');
        },

        getToken: () => get().token,
      }),
      {
        name: 'lunababy-auth',
        partialize: (state) => ({
          user: state.user,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
        }),
        onRehydrateStorage: () => (state) => {
          if (state?.isAuthenticated && state.refreshToken && !state.token) {
            refreshAccessToken(state.refreshToken)
              .then((response) => {
                const { token, refresh_token, user } = response.data;
                useAuthStore.getState().signIn(token, refresh_token, user);
              })
              .catch(() => {
                useAuthStore.getState().signOut();
              });
          } else {
            useAuthStore.setState({ isReady: true }, false, 'hydrated');
          }
        },
      }
    ),
    { name: 'AuthStore' }
  )
);

// Set up token refresh for the API client (client-side only)
if (typeof window !== 'undefined') setTokenRefresher(async () => {
  const { refreshToken, signIn, signOut } = useAuthStore.getState();
  if (!refreshToken) {
    signOut();
    return null;
  }
  try {
    const response = await refreshAccessToken(refreshToken);
    const { token, refresh_token, user } = response.data;
    signIn(token, refresh_token, user);
    return token;
  } catch {
    signOut();
    return null;
  }
});

