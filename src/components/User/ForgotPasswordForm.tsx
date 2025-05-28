import { useState } from 'react'
import { useTranslate } from '@/providers/I18n/client'
import { useToast } from '@/hooks/use-toast'

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
  mode?: 'forgotPassword' | 'firstTimeLogin';
}

export default function ForgotPasswordForm({ onBackToLogin, mode = 'forgotPassword' }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useTranslate()
  const { toast } = useToast()

  const handleForgotPassword = async () => {
    if (!email) {
      toast({ title: t('auth.pleaseEnterEmail'), variant: 'destructive' })
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/user/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        toast({
          title: t('auth.forgotPasswordRequestSent'),
          description: t('auth.checkYourEmail'),
        })
        setEmail('') // Clear email after sending
      } else {
        const err = await res.json()
        toast({
          title: err.error || t('auth.failedToSendRequest'),
          description: err.message || '', // Use message from API response
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      toast({
        title: t('auth.failedToSendRequest'),
        description: t('auth.somethingWentWrong'),
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Determine texts based on mode
  const headerText = mode === 'firstTimeLogin' ? t('auth.firstTimeLoginHeader') : t('auth.forgotPassword');
  const helperText = mode === 'firstTimeLogin' ? t('auth.enterEmailForReset') : t('auth.enterEmailForReset'); // Use the same helper text for now, can be changed if needed
  const emailPlaceholder = mode === 'firstTimeLogin' ? t('auth.firstTimeLoginEmailPlaceholder') : t('auth.enterYourEmail');
  const buttonText = mode === 'firstTimeLogin' ? t('auth.sendResetLink') : t('auth.sendResetLink'); // Same button text

  return (
    <div className="w-full p-4 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        {headerText}
      </h1>
      <p className="text-sm text-gray-600 mb-6 text-center">
        {helperText}
      </p>
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            {t('auth.email')}
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-700"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={emailPlaceholder}
            disabled={isLoading}
          />
        </div>
        <button
          onClick={handleForgotPassword}
          disabled={isLoading}
          className={`w-full py-3 text-white rounded-lg font-semibold transition ${isLoading ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-900 hover:bg-black'}`}
        >
          {buttonText}
        </button>
        <div className="text-center text-sm mt-4">
          <button
            type="button"
            onClick={onBackToLogin}
            className="font-medium text-gray-900 hover:underline focus:outline-none"
          >
            {t('auth.backToLogin')}
          </button>
        </div>
      </div>
    </div>
  )
} 