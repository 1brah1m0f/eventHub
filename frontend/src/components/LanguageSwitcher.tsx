'use client';
import { useSettingsStore } from '@/store/settings.store';
import type { Language } from '@/lib/i18n';

const LANGS: { code: Language; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'az', label: 'AZ' },
  { code: 'ru', label: 'RU' },
];

interface Props {
  variant?: 'light' | 'dark';
}

export function LanguageSwitcher({ variant = 'light' }: Props) {
  const { language, setLanguage } = useSettingsStore();
  const activeCls =
    variant === 'dark'
      ? 'bg-violet-600 text-white'
      : 'bg-violet-800 text-white';
  const inactiveCls =
    variant === 'dark'
      ? 'text-violet-400 hover:bg-violet-800'
      : 'text-gray-500 hover:bg-gray-100';

  return (
    <div className="flex gap-1">
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => setLanguage(code)}
          className={`text-xs px-2 py-0.5 rounded font-medium transition-colors ${
            language === code ? activeCls : inactiveCls
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
