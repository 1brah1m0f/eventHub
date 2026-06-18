import { useCallback } from 'react';
import { useSettingsStore } from '@/store/settings.store';
import { EVENT_TYPES } from '@/lib/utils';
import { translations, type TKey, type Language } from './translations';

export type { TKey, Language };

export function translate(
  language: Language,
  key: TKey,
  params?: Record<string, string | number>,
): string {
  let text: string = translations[language][key] ?? translations.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return text;
}

export function useT() {
  const language = useSettingsStore((s) => s.language);
  return useCallback(
    (key: TKey, params?: Record<string, string | number>) => translate(language, key, params),
    [language],
  );
}

export function useEventTypeLabel(type: string): string {
  const t = useT();
  const key = `eventType_${type}` as TKey;
  if (key in translations.en) return t(key);
  return type;
}

export function useEventTypes() {
  const t = useT();
  return EVENT_TYPES.map(({ value }) => ({
    value,
    label: t(`eventType_${value}` as TKey),
  }));
}

export const EVENT_TYPE_VALUES = [
  'hackathon', 'conference', 'bootcamp', 'meetup', 'workshop',
  'demo_day', 'competition', 'seminar', 'networking', 'summit',
] as const;
