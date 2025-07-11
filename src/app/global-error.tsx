'use client' // Error boundaries must be Client Components

import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { cn } from '@/utilities/ui'
import { Providers } from '@/providers'
import { AlertTriangle, Home, RefreshCwIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { useEffect } from 'react'
import { useTranslate } from '@/providers/I18n/client'
import * as Sentry from '@sentry/nextjs'

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
    console.error('Error while loading page:', error)
    // eslint-disable-next-line
  }, [])

  const { toast } = useToast()
  const { t } = useTranslate()

  const handleReset = () => {
    toast({
      title: t('error.tryingAgain'),
      description: t('error.tryingAgainDescription'),
    })

    setTimeout(() => {
      window.location.reload()
    }, 1500)
  }

  const handleGoHome = () => {
    toast({
      title: t('error.goingHome'),
      description: t('error.goingHomeDescription'),
    })
    setTimeout(() => {
      window.location.href = '/'
    }, 1500)
  }

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        <title>{t('error.title')} - Orchestars</title>
      </head>
      <body>
        <Providers locale="en">
          <main className="min-h-[calc(100vh-144px)] flex items-center justify-center pt-[72px]">
            <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-muted/30 rounded-lg">
              <div className="max-w-md w-full bg-background shadow-lg rounded-lg overflow-hidden p-6 border border-[#dddddd] animate-fade-in">
                <div className="flex justify-center mb-4">
                  <AlertTriangle className="h-16 w-16 text-orange-500" />
                </div>

                <h2 className="text-2xl font-bold text-center mb-2">{t('error.title')}</h2>

                {/* <div className="bg-muted/50 rounded-md p-4 my-4 overflow-auto max-h-32">
                  <p className="text-sm text-muted-foreground">
                    {error?.message || t('message.errorOccurred')}
                  </p>
                </div> */}

                <p className="text-center text-muted-foreground mb-6">{t('error.description')}</p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="flex items-center justify-center gap-2"
                  >
                    <RefreshCwIcon className="h-4 w-4" />
                    {t('common.tryAgain')}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleGoHome}
                    className="flex items-center justify-center gap-2"
                  >
                    <Home className="h-4 w-4" />
                    {t('common.goHome')}
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}
