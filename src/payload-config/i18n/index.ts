import { Config } from 'payload'
import { en } from '@payloadcms/translations/languages/en'
import { vi } from '@payloadcms/translations/languages/vi'
import extraEnLanguage from './locales/en.json'
import extraViLanguage from './locales/vi.json'

export const i18n: Config['i18n'] = {
  translations: {
    en: extraEnLanguage,
    vi: extraViLanguage,
  },
  fallbackLanguage: 'vi',
  supportedLanguages: {
    en: en as any,
    vi: vi as any,
  },
}
