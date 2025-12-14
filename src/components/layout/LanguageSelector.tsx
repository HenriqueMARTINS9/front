"use client";
import React from 'react';
import { useTranslation } from '@/lib/useTranslation';
import Select from '../common/Select';

export default function LanguageSelector() {
  const { changeLanguage, currentLanguage } = useTranslation();

  const languages = [
    { code: 'fr', name: 'Français', flag: String.fromCodePoint(0x1F1EB, 0x1F1F7) }, // 🇫🇷
    { code: 'en', name: 'English', flag: String.fromCodePoint(0x1F1EC, 0x1F1E7) }, // 🇬🇧
  ];

  // Créer les options pour le Select avec drapeau + nom
  const languageOptions = languages.map((lang) => ({
    value: lang.code,
    label: `${lang.flag} ${lang.name}`
  }));

  // Normaliser le code de langue (en-US -> en, fr -> fr)
  const normalizedCurrentLanguage = currentLanguage?.split('-')[0] || 'fr';

  const handleLanguageChange = (value: string) => {
    changeLanguage(value);
  };

  return (
    <div className="w-full">
      <Select
        value={normalizedCurrentLanguage}
        onChange={handleLanguageChange}
        options={languageOptions}
        placeholder="Sélectionner une langue"
        size="md"
        width="full"
        position="top"
        colors={{
          background: 'bg-white',
          border: 'border-gray-300',
          text: 'text-gray-900',
          placeholder: 'text-gray-500',
          focus: 'focus:ring-2 focus:border-[#D6BBFB] focus:outline-none focus:ring-[#F4EBFF] focus:shadow-xs',
          hover: 'hover:border-gray-400',
          optionHover: 'hover:bg-gray-50',
          optionSelected: 'bg-purple-50 text-purple-700'
        }}
      />
    </div>
  );
}
