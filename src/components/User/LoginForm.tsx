import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslate } from '@/providers/I18n/client'
import { useToast } from '@/hooks/use-toast'
import ForgotPasswordForm from './ForgotPasswordForm'

interface LoginFormProps {
  onSuccess?: () => void
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const { t } = useTranslate()
  const { toast } = useToast()

  const handleLogin = async () => {
    if (!email || !password) {
      toast({ title: t('auth.pleaseEnterEmailAndPassword'), variant: 'destructive' })
      return
    }

    try {
      setIsLoading(true)

      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      if (res?.ok) {
        toast({
          title: t('auth.signInSuccessfully'),
        })

        if (onSuccess) onSuccess()
        else router.replace('/user/profile')
      } else {
        const err = await res.json()
        console.error('err', err)
        toast({
          title: err.error || 'Authentication failed',
          description: err.details || 'Invalid credentials',
          variant: 'destructive',
        })
      }
    } catch (error: any) {
      console.error('Login error:', error)
      toast({
        title: error.error || 'Authentication failed',
        description: error.details || 'Invalid credentials',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {showForgotPassword ? (
        <ForgotPasswordForm onBackToLogin={() => setShowForgotPassword(false)} />
      ) : (
        <div className="w-full p-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            {t('userprofile.userLogin')}
          </h1>
          <p className="text-sm text-gray-600 mb-6 text-center">{t('auth.signInToContinue')}</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.email')}
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.enterYourEmail')}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.password')}
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.enterYourPassword')}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className={`w-full py-3 text-white rounded-lg font-semibold transition ${
                isLoading ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-900 hover:bg-black'
              }`}
            >
              {isLoading ? t('auth.signingIn') : t('auth.signIn')}
            </button>
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="font-medium text-gray-900 hover:underline focus:outline-none"
              >
                {t('auth.forgotPassword')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
