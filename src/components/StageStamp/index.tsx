'use client'

import { motion } from 'framer-motion'
import { cn } from '@/utilities/ui'

type Environment = 'staging' | 'development'

const environmentStyles: Record<Environment, { text: string; colors: string[] }> = {
  staging: {
    text: 'STAGING',
    colors: ['bg-orange-500/10', 'border-orange-500/50', 'shadow-orange-500/20', 'text-orange-500'],
  },
  development: {
    text: 'LOCAL DEV',
    colors: ['bg-red-500/10', 'border-red-500/50', 'shadow-red-500/20', 'text-red-500'],
  },
}

const isValidEnvironment = (env: string | undefined): env is Environment => {
  return env === 'staging' || env === 'development'
}

export const StageStamp: React.FC = () => {
  const rawEnvironment = process.env.NEXT_PUBLIC_ENVIRONMENT
  const environment = isValidEnvironment(rawEnvironment) ? rawEnvironment : 'development'
  const { text, colors } = environmentStyles[environment]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'fixed top-4 left-4 z-50',
        'flex items-center justify-center',
        'transform rotate-[-8deg]',
      )}
    >
      <div
        className={cn(
          'px-4 py-2 rounded-lg',
          'backdrop-blur-sm',
          'border-2',
          'shadow-lg',
          'font-mono text-sm font-bold',
          'select-none cursor-default',
          'hover:scale-105 transition-transform',
          ...colors,
        )}
      >
        {text}
      </div>
    </motion.div>
  )
}
