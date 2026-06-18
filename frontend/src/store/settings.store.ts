import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'az' | 'ru';

interface SettingsState {
  darkMode: boolean;
  language: Language;
  toggleDarkMode: () => void;
  setLanguage: (lang: Language) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      darkMode: false,
      language: 'en',
      toggleDarkMode: () => set(s => ({ darkMode: !s.darkMode })),
      setLanguage: (language) => set({ language }),
    }),
    { name: 'settings' }
  )
);
