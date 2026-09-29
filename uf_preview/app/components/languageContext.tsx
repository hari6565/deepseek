"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import i18n from './i18n';
import { getCookie } from './cookieMgment';
import { getLanguagesJson } from '../utils/getLanguagesJson.api';
import { useGlobal } from '@/context/GlobalContext';

type LanguageContextType = {
  language: string;
  handleLanguageChange: (lang: string) => void;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<string>(getCookie('cfg_lang') || 'en');
  const { token } = useGlobal()

  const setupLanguage = async (lang: string) => {
    try {
      const languageJson = await getLanguagesJson(lang, token);
      i18n.registerKeysets(lang, languageJson);
      i18n.setLang(lang);
    } catch (error) {
      console.error('Error fetching language JSON:', error);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setupLanguage(lang); 
  };

  useEffect(() => {
    setupLanguage(language);
  }, []); 

  return (
    <LanguageContext.Provider value={{ language, handleLanguageChange }}>
      {children}
    </LanguageContext.Provider>
  );
};
