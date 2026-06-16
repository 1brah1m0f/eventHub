import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

interface User {
  user_id: string;
  name: string;
  email: string;
  bio?: string;
  skills?: string[];
  linkedin_url?: string;
  x_url?: string;
  instagram_url?: string;
  avatar_url?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  sendCode: (email: string, purpose: 'login' | 'password_reset') => Promise<void>;
  verifyCode: (email: string, code: string, purpose: 'login' | 'password_reset', newPassword?: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  mockLogin: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  bio?: string;
  skills?: string[];
  linkedin_url?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          localStorage.setItem('token', data.token);
          set({ user: data.user, token: data.token, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      sendCode: async (email, purpose) => {
        set({ isLoading: true });
        try {
          await api.post('/auth/send-code', { email, purpose });
          set({ isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      verifyCode: async (email, code, purpose, newPassword) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/verify-code', {
            email,
            code,
            purpose,
            ...(newPassword ? { newPassword } : {}),
          });
          localStorage.setItem('token', data.token);
          set({ user: data.user, token: data.token, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (registerData) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', registerData);
          localStorage.setItem('token', data.token);
          set({ user: data.user, token: data.token, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },

      mockLogin: () => {
        const mockUser: User = {
          user_id: 'mock-user-1',
          name: 'Dev User',
          email: 'dev@nextevent.local',
          bio: 'Frontend developer',
          skills: ['React', 'TypeScript'],
        };
        const mockToken = 'mock-token-dev';
        localStorage.setItem('token', mockToken);
        set({ user: mockUser, token: mockToken });
      },

      fetchMe: async () => {
        const { data } = await api.get('/auth/me');
        set({ user: data });
      },
    }),
    {
      name: 'auth',
      partialize: (s) => ({ token: s.token, user: s.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
