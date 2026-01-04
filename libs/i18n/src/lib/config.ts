import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import locale files
import enCommon from '../locales/en/common.json';
import enGames from '../locales/en/games.json';
import enSettings from '../locales/en/settings.json';
import enPlatforms from '../locales/en/platforms.json';

import frCommon from '../locales/fr/common.json';
import esCommon from '../locales/es/common.json';
import deCommon from '../locales/de/common.json';
import jaCommon from '../locales/ja/common.json';
import zhCommon from '../locales/zh/common.json';

/**
 * Supported languages
 */
export const supportedLanguages = {
  en: { name: 'English', nativeName: 'English' },
  fr: { name: 'French', nativeName: 'Français' },
  es: { name: 'Spanish', nativeName: 'Español' },
  de: { name: 'German', nativeName: 'Deutsch' },
  ja: { name: 'Japanese', nativeName: '日本語' },
  zh: { name: 'Chinese', nativeName: '中文' },
} as const;

export type SupportedLanguage = keyof typeof supportedLanguages;

/**
 * Default language (English)
 */
export const defaultLanguage: SupportedLanguage = 'en';

/**
 * i18n resources configuration
 */
export const resources = {
  en: {
    common: enCommon,
    games: enGames,
    settings: enSettings,
    platforms: enPlatforms,
  },
  fr: {
    common: frCommon,
  },
  es: {
    common: esCommon,
  },
  de: {
    common: deCommon,
  },
  ja: {
    common: jaCommon,
  },
  zh: {
    common: zhCommon,
  },
} as const;

/**
 * Namespaces used in the application
 */
export const namespaces = ['common', 'games', 'settings', 'platforms'] as const;
export type Namespace = (typeof namespaces)[number];

/**
 * Initialize i18n instance
 */
export function initializeI18n(language: SupportedLanguage = defaultLanguage) {
  return i18n.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: defaultLanguage,
    defaultNS: 'common',
    ns: namespaces,
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    react: {
      useSuspense: true,
    },
  });
}

/**
 * Change the current language
 */
export function changeLanguage(language: SupportedLanguage) {
  return i18n.changeLanguage(language);
}

/**
 * Get the current language
 */
export function getCurrentLanguage(): SupportedLanguage {
  return (i18n.language as SupportedLanguage) || defaultLanguage;
}

export { i18n };
export default i18n;
