'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Clock, Lock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslate } from '@/providers/I18n/client'

interface CountdownToSetupPasswordProps {
  redirectTo: string
}

export default function CountdownToSetupPassword({ redirectTo }: CountdownToSetupPasswordProps) {
  const router = useRouter()
  const { t } = useTranslate()
  const [timeRemaining, setTimeRemaining] = useState(15) // 5 seconds

  useEffect(() => {
    if (timeRemaining <= 0) {
      router.push(redirectTo)

      return
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [timeRemaining, redirectTo, router])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleSetupPassword = () => {
    router.push(redirectTo)
  }

  return (
    <div className="w-full p-4 max-w-md mx-auto py-20">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('giftTicketVerification.title')}</h1>

        <p className="text-gray-600 mb-6 leading-relaxed">
          {t('giftTicketVerification.description')}
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">{t('giftTicketVerification.countdownTitle')}</span>
          </div>

          <div className="text-3xl font-mono font-bold text-blue-600 mb-2">
            {formatTime(timeRemaining)}
          </div>

          <p className="text-xs text-blue-700">{t('giftTicketVerification.countdownDescription')}</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            <Lock className="w-4 h-4 mr-2 text-gray-600" />
            {t('giftTicketVerification.instructionsTitle')}:
          </h3>
          <ol className="text-sm text-gray-700 space-y-2">
            <li className="flex items-start">
              <span className="bg-gray-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                1
              </span>
              <span>
                {t('giftTicketVerification.step1')}
              </span>
            </li>
            <li className="flex items-start">
              <span className="bg-gray-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                2
              </span>
              <span>{t('giftTicketVerification.step2')}</span>
            </li>
            <li className="flex items-start">
              <span className="bg-gray-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                3
              </span>
              <span>{t('giftTicketVerification.step3')}</span>
            </li>
          </ol>
        </div>

        <Button
          onClick={handleSetupPassword}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
          size="lg"
        >
          {t('giftTicketVerification.setupPasswordButton')}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}
