'use client'

import clsx from 'clsx'
import React, { useEffect, useState } from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { loading: loadingFromProps, priority: priorityFromProps, className } = props
  const [isDarkMode, setIsDarkMode] = useState(false)

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  useEffect(() => {
    // Function to check if dark mode is active
    const checkDarkMode = () => {
      const hasDataThemeDark = document.documentElement.getAttribute('data-theme') === 'dark'
      const hasDarkClass = document.documentElement.classList.contains('dark')
      const prefersColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      
      return hasDataThemeDark || hasDarkClass || prefersColorScheme
    }

    // Initial check
    setIsDarkMode(checkDarkMode())

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      setIsDarkMode(checkDarkMode())
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class']
    })

    // Listen for system color scheme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleColorSchemeChange = () => setIsDarkMode(checkDarkMode())
    
    mediaQuery.addEventListener('change', handleColorSchemeChange)

    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener('change', handleColorSchemeChange)
    }
  }, [])

  const logoSrc = isDarkMode ? '/logos/logo-white-wide.png' : '/logos/logo-black-wide.png'
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200'

  return (
    <img
      width={640}
      height={153}
      alt="Admin Logo"
      loading={loading}
      fetchPriority={priority}
      decoding="async"
      className={clsx(
        'max-w-[9.375rem] w-full h-[34px] border rounded-md p-1',
        borderColor,
        className
      )}
      src={logoSrc}
      srcSet={logoSrc}
      style={{ display: 'block' }}
    />
  )
}
