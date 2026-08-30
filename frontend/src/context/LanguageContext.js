import React, { createContext, useContext, useState, useCallback } from 'react';
import translations from '../i18n/translations';

const LanguageContext = createContext();

export const LANGUAGES = {
  EN: 'en',
  HI: 'hi',
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(LANGUAGES.EN);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === LANGUAGES.EN ? LANGUAGES.HI : LANGUAGES.EN));
  }, []);

  // Translation function — returns the key itself as fallback
  const t = useCallback(
    (key) => {
      return translations[language]?.[key] || translations[LANGUAGES.EN]?.[key] || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
