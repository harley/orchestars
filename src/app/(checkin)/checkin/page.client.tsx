'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Head from 'next/head'
import { useAuth } from '@/providers/CheckIn/useAuth'
import { useTranslate } from '@/providers/I18n/client'
import { useToast } from '@/hooks/use-toast'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { setToken } = useAuth()
  const { t } = useTranslate()
  const { toast } = useToast()

  const handleLogin = async () => {
    if (!email || !password) {
      toast({ title: t('checkin.pleaseEnterEmailAndPassword'), variant: 'destructive' })
      return
    }

    try {
      setIsLoading(true)

      const res = await fetch('/api/checkin-app/auth', {
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
        const token = await res.json() // or decode from cookie if SSR-only
        setToken(token.token) // optional since cookie already stores it
        // Navigate to scan page then refresh to ensure server components (like AdminNav)
        // re-fetch the admin user based on the newly set cookie so that the navbar
        // immediately reflects the logged-in state without requiring a full page reload.
        router.replace('/checkin/scan')
        router.refresh()
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
      <Head>
        <title>{t('checkin.login')}</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            {t('checkin.adminCheckIn')}
          </h1>
          <p className="text-sm text-gray-600 mb-6 text-center">{t('checkin.signInToContinue')}</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('checkin.email')}
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-700 dark:focus:ring-gray-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('checkin.enterYourEmail')}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('checkin.password')}
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-700 dark:focus:ring-gray-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('checkin.enterYourPassword')}
                disabled={isLoading}
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className={`w-full py-3 text-white rounded-lg font-semibold transition ${
                isLoading ? 'bg-gray-700 dark:bg-gray-600 cursor-not-allowed' : 'bg-gray-900 dark:bg-gray-900 hover:bg-black dark:hover:bg-gray-700'
              }`}
            >
              {isLoading ? t('checkin.signingIn') : t('checkin.signIn')}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
