'use client'
// import { useHeaderTheme } from '@/providers/HeaderTheme'
// import { usePathname } from 'next/navigation'
import React from 'react'

import type { Header } from '@/payload-types'

// import { HeaderNav } from './Nav'
import Navbar from './Nav/Navbar'

interface HeaderClientProps {
  data: Header
  events: Record<string, any>[]
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, events }) => {
  /* Storing the value in a useState to avoid hydration errors */
  // const [theme, setTheme] = useState<string | null>(null)
  // const { headerTheme, setHeaderTheme } = useHeaderTheme()
  // const pathname = usePathname()

  // useEffect(() => {
  //   setHeaderTheme(null)
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [pathname])

  // useEffect(() => {
  //   if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [headerTheme])

  return <Navbar data={data} events={events} />
}
