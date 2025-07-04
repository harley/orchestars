import React, { useMemo } from 'react'
import { Globe } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { getCookie, setCookie } from '@/utilities/clientCookies'
import { DEFAULT_FALLBACK_LOCALE } from '@/config/app'

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
  locale?: string
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className }) => {
  const locale = getCookie('next-locale') || DEFAULT_FALLBACK_LOCALE

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
        <span className="text-sm hidden sm:inline mt-1">{currentLanguage.code.toUpperCase()}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white backdrop-blur-md border-white/10">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language)}
            className={cn(
              'flex items-center gap-2 text-sm cursor-pointer hover:bg-white/10',
              currentLanguage.code === language.code ? 'bg-black/20' : '',
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
