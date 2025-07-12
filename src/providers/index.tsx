import React from 'react'
import { SupportedLocale } from '@/config/app'
import { HeaderThemeProvider } from './HeaderTheme'
import { I18nProvider } from './I18n'
import { ThemeProvider } from './Theme'

export const Providers: React.FC<{
  children: React.ReactNode
  locale: SupportedLocale
}> = ({ children, locale }) => {
  return (
    <I18nProvider locale={locale}>
      <ThemeProvider>
        <HeaderThemeProvider>{children}</HeaderThemeProvider>
      </ThemeProvider>
    </I18nProvider>
  )
}
