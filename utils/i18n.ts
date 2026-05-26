'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import des traductions
import frCommon from '@/public/locales/fr/common.json';
import frSettings from '@/public/locales/fr/settings.json';
import enCommon from '@/public/locales/en/common.json';
import enSettings from '@/public/locales/en/settings.json';
import frDashboard from '@/public/locales/fr/dashboard.json';
import enDashboard from '@/public/locales/en/dashboard.json';
import frUsers from '@/public/locales/fr/users.json';
import enUsers from '@/public/locales/en/users.json';
import frDocs from '@/public/locales/fr/docs.json';
import enDocs from '@/public/locales/en/docs.json';
import frLogs from '@/public/locales/fr/logs.json';
import enLogs from '@/public/locales/en/logs.json';
import frProfile from '@/public/locales/fr/profile.json';
import enProfile from '@/public/locales/en/profile.json';
import frDocsDev from '@/public/locales/fr/docsDev.json';
import enDocsDev from '@/public/locales/en/docsDev.json';
import frClientDocs from '@/public/locales/fr/clientDocs.json';
import enClientDocs from '@/public/locales/en/clientDocs.json';
import frLayout from '@/public/locales/fr/layout.json';
import enLayout from '@/public/locales/en/layout.json';
import frSwagger from '@/public/locales/fr/swagger.json';
import enSwagger from '@/public/locales/en/swagger.json';

const resources = {
  fr: {
    common: frCommon,
    settings: frSettings,
    dashboard: frDashboard,
    users: frUsers,
    docs: frDocs,
    logs: frLogs,
    profile: frProfile,
    docsDev: frDocsDev,
    clientDocs: frClientDocs,
    layout: frLayout,
    swagger: frSwagger,

  },
  en: {
    common: enCommon,
    settings: enSettings,
    dashboard: enDashboard,
    users: enUsers,
    docs: enDocs,
    logs: enLogs,
    profile: enProfile,
    docsDev: enDocsDev,
    clientDocs: enClientDocs,
    layout: enLayout,
    swagger: enSwagger,

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
    ns: ['common', 'dashboard', 'settings', 'users', 'docs', 'logs', 'profile', 'docsDev', 'clientDocs', 'layout', 'swagger'],

  });
}

export default i18n;