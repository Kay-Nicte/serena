import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import es from './es.json';
import en from './en.json';
import eu from './eu.json';
import ca from './ca.json';

const SUPPORTED_LANGUAGES = ['es', 'en', 'eu', 'ca'];
const deviceLanguage = getLocales()[0]?.languageCode ?? 'es';

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
    eu: { translation: eu },
    ca: { translation: ca },
  },
  lng: SUPPORTED_LANGUAGES.includes(deviceLanguage) ? deviceLanguage : 'es',
  fallbackLng: 'es',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
