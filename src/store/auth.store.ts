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
  avatar_url?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
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

      fetchMe: async () => {
        const { data } = await api.get('/auth/me');
        set({ user: data });
      },
    }),
    { name: 'auth', partialize: (s) => ({ token: s.token, user: s.user }) }
  )
);
