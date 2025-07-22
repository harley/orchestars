'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { pageview } from '@/lib/gtag'

const GATracker = () => {
  const [isHydrated, setIsHydrated] = useState(false)

  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated || !pathname || typeof searchParams?.toString !== 'function') return

    const url = pathname + searchParams.toString()
    pageview(url)
  }, [isHydrated, pathname, searchParams])

  return null
}

export default GATracker
