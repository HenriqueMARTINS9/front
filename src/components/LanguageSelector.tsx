"use client";
import React from 'react';
import { useTranslation } from '@/lib/useTranslation';

export default function LanguageSelector() {
  const { changeLanguage, currentLanguage } = useTranslation();

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
  ];

  return (
    <div className="flex items-center gap-3">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`text-xl transition-all duration-200 hover:scale-110 ${
            currentLanguage === lang.code
              ? 'opacity-100 scale-110'
              : 'opacity-60 hover:opacity-80'
          }`}
          title={lang.name}
        >
          {lang.flag}
        </button>
      ))}
    </div>
  );
}
