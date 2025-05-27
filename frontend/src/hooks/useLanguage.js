import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

export const useLanguage = () => {
  const { i18n, t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);

  const changeLanguage = async (language) => {
    try {
      await i18n.changeLanguage(language);
      localStorage.setItem('i18nextLng', language);
      setCurrentLanguage(language);
      return true;
    } catch (error) {
      console.error('Error changing language:', error);
      return false;
    }
  };

  const getAvailableLanguages = () => {
    return [
      { code: 'en', name: t('settings.english'), flag: '🇺🇸' },
      { code: 'pl', name: t('settings.polish'), flag: '🇵🇱' }
    ];
  };

  return {
    currentLanguage,
    changeLanguage,
    getAvailableLanguages,
    t
  };
}; 