'use client';

import { useTranslation } from 'react-i18next';
import { FiGlobe } from 'react-icons/fi';
import { useEffect, useState } from 'react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState('fr');

  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
      setCurrentLang(savedLang);
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    setCurrentLang(lang);
  };

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition">
        <FiGlobe className="w-4 h-4" />
        <span className="text-sm font-medium">{currentLang === 'fr' ? 'FR' : 'EN'}</span>
      </button>
      <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-neutral-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <button
          onClick={() => changeLanguage('fr')}
          className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 rounded-t-lg"
        >
          Français
        </button>
        <button
          onClick={() => changeLanguage('en')}
          className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 rounded-b-lg"
        >
          English
        </button>
      </div>
    </div>
  );
}