import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth } from '@/lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import api from '@/lib/axios';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => Promise<void>;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isInitializing: true,
      
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      
      logout: async () => {
        await signOut(auth);
        set({ token: null, user: null, isAuthenticated: false });
      },

      initAuth: () => {
        onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            const token = await firebaseUser.getIdToken();
            try {
              // Sync with backend (axios adds the bearer token)
              const res = await api.get('/auth/me');
              set({ token, user: res.data, isAuthenticated: true, isInitializing: false });
            } catch (err) {
              set({ token: null, user: null, isAuthenticated: false, isInitializing: false });
            }
          } else {
            set({ token: null, user: null, isAuthenticated: false, isInitializing: false });
          }
        });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }), // Only persist user info for fast initial render
    }
  )
);

// Initialize Firebase Auth listener immediately
useAuthStore.getState().initAuth();
