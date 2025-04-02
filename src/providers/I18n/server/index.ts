import { cookies, headers } from 'next/headers'
import { i18n as i18nPayloadConfig } from '@/payload-config/i18n'
import { translate } from '../utils'

const COOKIE_NAME = 'next-locale'
const DEFAULT_LOCALE = i18nPayloadConfig?.fallbackLanguage || 'vi'

export async function getLocale() {
  const headersList = await headers()
  const localeFromHeader = headersList.get('x-locale')

  if (localeFromHeader) {
    return localeFromHeader
  }

  // Fallback to cookie
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get(COOKIE_NAME)

  return localeCookie?.value || DEFAULT_LOCALE
}

// Function to load messages for the current locale
export async function getMessages() {
  const locale = await getLocale()

  const messages = i18nPayloadConfig?.translations
    ? (i18nPayloadConfig.translations as any)?.[locale]
    : undefined

  return messages || {}
}

// Helper function to translate a key
export function t(key: string, locale: string) {
  const messages = i18nPayloadConfig?.translations
    ? (i18nPayloadConfig.translations as any)?.[locale]
    : undefined

  return translate(key, messages)
}
