'use client'
import { I18nProvider as AriaI18nProvider } from 'react-aria-components'
import { i18n as i18nPayloadConfig } from '@/payload-config/i18n'
import { translate } from './utils'
import React, { useCallback, useContext } from 'react'
import { SupportedLocale } from '@/config/app'

type I18nContextType = {
  locale: SupportedLocale
  t: (key: string, params?: Record<string, any>) => string
}

const I18nContext = React.createContext<I18nContextType>({} as I18nContextType)

export const I18nProvider: React.FC<{
  children: React.ReactNode
  locale: SupportedLocale
}> = ({ children, locale }) => {
  const t = useCallback(
    (key: string, params?: Record<string, any>) => {
      const messages = (i18nPayloadConfig?.translations as any)?.[locale]

      return translate(key, messages, params)
    },
    [locale],
  )
  return (
    <I18nContext.Provider value={{ locale, t }}>
      <AriaI18nProvider locale={locale}>{children}</AriaI18nProvider>
    </I18nContext.Provider>
  )
}

export const useTranslate = () => useContext(I18nContext) 