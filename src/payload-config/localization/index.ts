import { DEFAULT_FALLBACK_LOCALE } from '@/config/app'
import { Config } from 'payload'

export const localization: Config['localization'] = {
  defaultLocale: DEFAULT_FALLBACK_LOCALE,
  fallback: true,
  locales: [
    {
      code: 'en',
      label: {
        en: 'English',
        vi: 'Tiếng Anh',
      },
    },
    {
      code: 'vi',
      label: {
        en: 'Vietnamese',
        vi: 'Tiếng Việt',
      },
    },
  ],
}
