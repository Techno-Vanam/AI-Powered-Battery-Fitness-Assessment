import { useApp } from '../context/AppContext';
import en, { TranslationKey } from './translations/en';
import hi from './translations/hi';

const translations = {
  English: en,
  Hindi: hi,
};

/**
 * useTranslation — returns a `t(key)` function that resolves to the correct
 * language string based on the current app language setting.
 *
 * Usage:
 *   const t = useTranslation();
 *   <Text>{t('quick_actions')}</Text>
 *
 * Switching the language in Settings instantly re-renders all components
 * that call this hook — no restart required.
 */
export function useTranslation() {
  const { settings } = useApp();
  const lang = settings.language ?? 'English';
  const dict = translations[lang] ?? translations.English;

  return (key: TranslationKey): string => {
    return dict[key] ?? translations.English[key] ?? key;
  };
}
