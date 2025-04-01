import { getCookie } from '@/utilities/clientCookies'
import { i18n as i18nPayloadConfig } from '@/payload-config/i18n'
import { translate } from '../utils'
import { useCallback } from 'react'

export const useTranslate = () => {
  const locale = getCookie('next-locale') || 'en'

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
