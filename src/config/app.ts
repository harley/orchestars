export const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000'

export type SupportedLocale = 'vi' | 'en'
export const DEFAULT_FALLBACK_LOCALE =
  (process.env.NEXT_PUBLIC_DEFAULT_FALLBACK_LOCALE as SupportedLocale) || 'vi'

export const NODE_ENV = process.env.NODE_ENV

export const IS_LOCAL_DEVELOPMENT = !NODE_ENV || ['development', 'local'].includes(NODE_ENV)

export const X_API_KEY = process.env.X_API_KEY || 'X_API_KEY'

export const ADMIN_TOKEN_EXPIRATION_IN_SECONDS = process.env.ADMIN_TOKEN_EXPIRATION_IN_SECONDS
  ? parseInt(process.env.ADMIN_TOKEN_EXPIRATION_IN_SECONDS) || 2592000
  : 2592000 // 30 days
