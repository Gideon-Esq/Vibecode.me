import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AccountDetails } from '@/types/tmdb';

interface AuthState {
  sessionId: string | null;
  account: AccountDetails | null;
  isAuthenticated: boolean;
  setSession: (sessionId: string) => void;
  setAccount: (account: AccountDetails) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      sessionId: null,
      account: null,
      isAuthenticated: false,
      setSession: (sessionId) => set({ sessionId, isAuthenticated: true }),
      setAccount: (account) => set({ account }),
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('tmdb_session_id');
        }
        set({ sessionId: null, account: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
