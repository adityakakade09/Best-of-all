'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthTokens, User } from '@bestofall/shared';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  setSession: (user: User, tokens: AuthTokens) => void;
  updateUser: (user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      setSession: (user, tokens) => set({ user, tokens }),
      updateUser: (user) => set({ user }),
      logout: () => set({ user: null, tokens: null }),
      isAuthenticated: () => Boolean(get().tokens?.accessToken),
    }),
    { name: 'bestofall-auth' }
  )
);
