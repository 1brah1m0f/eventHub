import { useSettingsStore } from '@/store/settings.store';

const T = {
  en: {
    home: 'Home',
    organizations: 'Organizations',
    statistics: 'Statistics',
    newEvent: 'New Event',
    myEvents: 'My Events',
    staffEvents: 'Staff Events',
    registeredEvents: 'Registered Events',
    editProfile: 'Edit Profile',
    logout: 'Logout',
    settings: 'Settings',
    language: 'Language',
    darkMode: 'Dark mode',
    search: 'Search...',
    allTypes: 'All types',
    all: 'All',
    login: 'Login',
    signUp: 'Sign up',
    noEventsFound: 'No events found',
    tryDifferent: 'Try a different search or filter',
  },
  az: {
    home: 'Ana Səhifə',
    organizations: 'Təşkilatlar',
    statistics: 'Statistika',
    newEvent: 'Yeni Tədbir',
    myEvents: 'Tədbirlərim',
    staffEvents: 'İşçi Tədbirləri',
    registeredEvents: 'Qeydiyyatlarım',
    editProfile: 'Profili Düzəlt',
    logout: 'Çıxış',
    settings: 'Parametrlər',
    language: 'Dil',
    darkMode: 'Gecə rejimi',
    search: 'Axtar...',
    allTypes: 'Bütün növlər',
    all: 'Hamısı',
    login: 'Daxil ol',
    signUp: 'Qeydiyyat',
    noEventsFound: 'Tədbir tapılmadı',
    tryDifferent: 'Fərqli axtarış və ya filtr sınayın',
  },
} as const;

export type TKey = keyof typeof T.en;

export function useT() {
  const { language } = useSettingsStore();
  return (key: TKey) => T[language][key];
}
