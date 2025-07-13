'use client'
import React, { useMemo } from 'react'
import { Globe } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { setCookie } from '@/utilities/clientCookies'
import { useTranslate } from '@/providers/I18n/client'

type Language = {
  code: string
  name: string
  flag: string
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
]

interface LanguageSwitcherProps {
  className?: string
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className }) => {
  const { locale } = useTranslate()

  const currentLanguage = useMemo(() => {
    return languages.find((l) => l.code === (locale as string)) || (languages[0] as Language)
  }, [locale])

  const handleLanguageChange = (language: Language) => {
    const expiresInAYear = new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000)
    setCookie('next-locale', language.code, expiresInAYear)
    window.location.reload()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex items-center gap-[2px] text-black/90 hover:text-black transition-colors outline-none',
          className,
        )}
      >
        <Globe size={16} className="" />
        <span className="text-sm inline mt-1">{currentLanguage.code.toUpperCase()}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-gray-900 text-white p-1 rounded-lg shadow-lg">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language)}
            className={cn(
              'flex items-center gap-2 text-sm cursor-pointer rounded-md transition-colors',
              currentLanguage.code === language.code
                ? 'bg-gray-800'
                : 'hover:bg-gray-700',
              'px-3 py-2'
            )}
          >
            <span className="mr-1">{language.flag}</span>
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LanguageSwitcher
