/**
 * i18n configuration tests
 */

import { describe, it, expect } from 'vitest';
import { 
  supportedLanguages, 
  defaultLanguage,
  resources,
  initializeI18n,
  changeLanguage,
  getCurrentLanguage
} from '../lib/config';

describe('Supported Languages', () => {
  it('should have all required languages defined', () => {
    expect(supportedLanguages).toBeDefined();
    expect(supportedLanguages.en).toBeDefined();
    expect(supportedLanguages.fr).toBeDefined();
    expect(supportedLanguages.es).toBeDefined();
    expect(supportedLanguages.de).toBeDefined();
    expect(supportedLanguages.ja).toBeDefined();
    expect(supportedLanguages.zh).toBeDefined();
  });

  it('should have name and nativeName for each language', () => {
    Object.values(supportedLanguages).forEach((lang) => {
      expect(lang.name).toBeDefined();
      expect(lang.nativeName).toBeDefined();
    });
  });

  it('should use English as default language', () => {
    expect(defaultLanguage).toBe('en');
  });
});

describe('i18n Resources', () => {
  it('should have resources for all supported languages', () => {
    expect(resources).toBeDefined();
    expect(resources.en).toBeDefined();
    expect(resources.fr).toBeDefined();
    expect(resources.es).toBeDefined();
    expect(resources.de).toBeDefined();
    expect(resources.ja).toBeDefined();
    expect(resources.zh).toBeDefined();
  });

  it('should have common namespace for English', () => {
    expect(resources.en.common).toBeDefined();
  });

  it('should have games namespace for English', () => {
    expect(resources.en.games).toBeDefined();
  });

  it('should have settings namespace for English', () => {
    expect(resources.en.settings).toBeDefined();
  });

  it('should have platforms namespace for English', () => {
    expect(resources.en.platforms).toBeDefined();
  });
});

describe('i18n Initialization', () => {
  it('should have initializeI18n function', () => {
    expect(typeof initializeI18n).toBe('function');
  });

  it('should have changeLanguage function', () => {
    expect(typeof changeLanguage).toBe('function');
  });

  it('should have getCurrentLanguage function', () => {
    expect(typeof getCurrentLanguage).toBe('function');
  });
});
