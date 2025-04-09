export const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000'

export type SupportedLocale = 'vi' | 'en'
export const DEFAULT_FALLBACK_LOCALE =
  (process.env.NEXT_PUBLIC_DEFAULT_FALLBACK_LOCALE as SupportedLocale) || 'vi'
