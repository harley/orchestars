import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslate } from '@/providers/I18n/client'
import { useToast } from '@/hooks/use-toast'
import { Info } from 'lucide-react'
import Link from 'next/link'

import { Star, ArrowRight, Users } from 'lucide-react'
import { AuthFormMode } from './types'

interface LoginFormProps {
  onSuccess?: () => void
  setFormMode?: (mode: AuthFormMode) => void
}

export default function LoginForm({ onSuccess, setFormMode }: LoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
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
        else router.replace('/user/my-tickets')
      } else {
        const err = await res.json()
        console.error('err', err)
        toast({
          title: err.message || 'Authentication failed',
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
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        {t('userprofile.userLogin')}
      </h1>
      <p className="text-sm text-gray-600 mb-6 text-center">{t('auth.signInToContinue')}</p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
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
        <div className="w-full text-center text-sm flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setFormMode?.('forgotPassword')}
            className="font-medium text-gray-900 hover:underline focus:outline-none mr-4"
          >
            {t('auth.forgotPassword')}
          </button>
          <button
            type="button"
            onClick={() => setFormMode?.('firstTimeLogin')}
            className="font-medium text-gray-900 hover:underline focus:outline-none"
          >
            {t('auth.firstTimeLoginLink')}
          </button>
          <button
            type="button"
            onClick={() => setFormMode?.('register')}
            className="font-medium text-gray-900 hover:underline focus:outline-none"
          >
            {t('auth.noAccountRegisterNow')}
          </button>
          <div className="w-full mx-auto bg-white py-5 px-2 rounded-xl shadow-md hover:shadow-lg flex flex-col items-center">
            <div className="flex items-center mb-6 w-full justify-around">
              <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full items-center justify-center bg-black text-white">
                {/* Custom icon styling to match the image */}
                <Star className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-base font-bold text-gray-900">
                  {t('auth.joinAmbassadorProgram')}
                </h2>
                <p className="text-gray-600">{t('auth.joinAmbassadorProgramDescription')}</p>
              </div>
            </div>

            <button className="w-full">
              <Link
                href="/affiliate"
                aria-label={t('auth.affiliateLoginLink')}
                className={`flex flex-row justify-around w-full py-3 text-white rounded-lg font-semibold transition ${
                  isLoading ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-900 hover:bg-black'
                }`}
              >
                <Users className="h-5 w-5" />
                <span>{t('auth.affiliateLoginLink')}</span>
                <ArrowRight className="h-4 w-4 mt-0.5" />
              </Link>
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-start gap-3 p-4 mt-6 border-l-4 border-blue-500 bg-blue-50 rounded-md shadow-sm">
        <div className="flex-shrink-0 pt-1">
          <Info className="text-blue-500" />
        </div>
        <div className="text-sm text-blue-800 leading-relaxed">
          {t('auth.firstTimeLoginGuideline')}
        </div>
      </div>
    </div>
  )
}
