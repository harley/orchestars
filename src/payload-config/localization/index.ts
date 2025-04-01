import { Config } from 'payload'

export const localization: Config['localization'] = {
  defaultLocale: 'en',
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
