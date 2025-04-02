import { getCookie } from '@/utilities/clientCookies'
import { i18n as i18nPayloadConfig } from '@/payload-config/i18n'
import { translate } from '../utils'
import { useCallback } from 'react'
import { DEFAULT_FALLBACK_LOCALE } from '@/config/app'

export const useTranslate = () => {
  const locale = getCookie('next-locale') || DEFAULT_FALLBACK_LOCALE

  const t = useCallback(
    (key: string) => {
      const messages = (i18nPayloadConfig?.translations as any)?.[locale]

      return translate(key, messages)
    },
    [locale],
  )

  return {
    t,
  }
}
