import { Config } from 'payload'
import { en } from '@payloadcms/translations/languages/en'
import { vi } from '@payloadcms/translations/languages/vi'
import extraEnLanguage from './locales/en.json'
import extraViLanguage from './locales/vi.json'
import { DEFAULT_FALLBACK_LOCALE } from '@/config/app'

export const i18n: Config['i18n'] = {
  translations: {
    en: extraEnLanguage,
    vi: extraViLanguage,
  },
  fallbackLanguage: DEFAULT_FALLBACK_LOCALE,
  supportedLanguages: {
    en: en as any,
    vi: vi as any,
  },
}
