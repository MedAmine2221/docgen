'use client';
import { useTranslation } from 'react-i18next';
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
    <div>
      <label className="text-sm font-medium text-neutral-700">
        {"Langue de l'interface"}
      </label>
      <select
        value={currentLang}
        onChange={(e) => changeLanguage(e.target.value)}  // ← Correction ici
        className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c5262e]/30 focus:border-[#c5262e]"
      >
        <option value="fr">Français</option>
        <option value="en">English</option>
      </select>
    </div>
  );
}