'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import des traductions
import frCommon from '@/public/locales/fr/common.json';
import frSettings from '@/public/locales/fr/settings.json';
import enCommon from '@/public/locales/en/common.json';
import enSettings from '@/public/locales/en/settings.json';

const resources = {
  fr: {
    common: frCommon,
    settings: frSettings,
  },
  en: {
    common: enCommon,
    settings: enSettings,
  },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: typeof window !== 'undefined' ? localStorage.getItem('language') || 'fr' : 'fr',
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
    defaultNS: 'common',
    ns: ['common', 'navigation', 'settings'],
  });
}

export default i18n;