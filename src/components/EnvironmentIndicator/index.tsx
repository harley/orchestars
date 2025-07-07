'use client'

import { cn } from '@/utilities/ui'
import React from 'react'

export const EnvironmentIndicator = () => {
  const env = process.env.NEXT_PUBLIC_ENVIRONMENT || 'local'

  // Don't show anything in production
  if (!env || env === 'production') return null

  return (
    <div className="fixed top-20 left-4 z-[1000] pointer-events-none">
      <div
        className={cn(
          'relative transform -rotate-12 select-none',
          "before:content-[''] before:absolute before:inset-0",
          'before:border-2 before:border-current before:rounded-md',
          'before:transform before:rotate-[2deg]',
          env === 'staging' ? 'text-amber-500/80' : 'text-emerald-500/80',
        )}
      >
        <div className="px-4 py-2 text-sm font-mono font-bold uppercase tracking-wider">{env}</div>
      </div>
    </div>
  )
}
