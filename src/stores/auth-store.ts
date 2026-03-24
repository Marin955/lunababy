'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User } from '@/types';
import { setTokenRefresher } from '@/services/api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
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

        signIn: (token, refreshToken, user) => {
          set({ user, token, refreshToken, isAuthenticated: true }, false, 'signIn');
        },

        signOut: () => {
          set({ user: null, token: null, refreshToken: null, isAuthenticated: false }, false, 'signOut');
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
      }
    ),
    { name: 'AuthStore' }
  )
);

// Set up token refresh for the API client
setTokenRefresher(async () => {
  const { refreshToken, signOut } = useAuthStore.getState();
  if (!refreshToken) {
    signOut();
    return null;
  }
  // For now, if the access token expires, sign the user out.
  // A proper refresh endpoint could be added to the backend later.
  signOut();
  return null;
});
