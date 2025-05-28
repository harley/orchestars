import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslate } from '@/providers/I18n/client'
import { useToast } from '@/hooks/use-toast'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

interface ResetPasswordFormProps {
  initialToken?: string
}

// Define the validation schema
// We need the translate function to define the schema with translated messages
// Since schema is defined outside the component, we'll need a way to pass t to it
// A common pattern is to define a function that returns the schema, taking t as an argument
const buildFormSchema = (t: (key: string, options?: { [key: string]: any }) => string) =>
  z
    .object({
      password: z
        .string()
        .min(8, t('auth.passwordMinLength', { length: 8 }))
        .refine((password) => {
          // Medium strength password validation:
          // Requires at least 8 characters and a mix of at least two character types:
          // uppercase, lowercase, numbers, special characters.
          const hasLowercase = /[a-z]/.test(password)
          const hasUppercase = /[A-Z]/.test(password)
          const hasNumber = /[0-9]/.test(password)
          const hasSpecial = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(password)

          const conditionsMet = [hasLowercase, hasUppercase, hasNumber, hasSpecial].filter(
            Boolean,
          ).length

          return conditionsMet >= 2
        }, t('auth.passwordStrength')),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.passwordsDoNotMatch'),
      path: ['confirmPassword'], // Set the error on the confirm password field
    })

type FormValues = z.infer<ReturnType<typeof buildFormSchema>>

export default function ResetPasswordForm({ initialToken }: ResetPasswordFormProps) {
  const searchParams = useSearchParams()
  const token = initialToken || searchParams.get('token')

  const { t } = useTranslate()
  const { toast } = useToast()

  // Build the schema using the translate function from the hook
  const formSchema = buildFormSchema(t)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  useEffect(() => {
    if (!token) {
      toast({
        title: t('auth.missingToken'),
        description: t('auth.invalidResetLink'),
        variant: 'destructive',
      })
    }
  }, [token, toast, t])

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!token) {
      toast({
        title: t('auth.missingToken'),
        description: t('auth.invalidResetLink'),
        variant: 'destructive',
      })
      return
    }

    try {
      const res = await fetch('/api/user/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password: data.password }),
      })

      if (res.ok) {
        toast({
          title: t('auth.passwordResetSuccessful'),
        })
        window.location.href = '/user/profile' // Redirect to login after successful reset
      } else {
        const err = await res.json()
        // Set form-specific errors if needed, or a general error
        setError('password', {
          type: 'manual',
          message: err.message || t('auth.failedToResetPassword'),
        })
        setError('confirmPassword', { type: 'manual', message: '' }) // Clear confirm password error if password error is set
        toast({
          title: err.error || t('auth.failedToResetPassword'),
          description: err.message || t('auth.somethingWentWrong'),
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Reset password error:', error)
      setError('password', { type: 'manual', message: t('auth.somethingWentWrong') })
      setError('confirmPassword', { type: 'manual', message: '' })
      toast({
        title: t('auth.failedToResetPassword'),
        description: t('auth.somethingWentWrong'),
        variant: 'destructive',
      })
    } finally {
      // setIsLoading(false) // react-hook-form handles submitting state
    }
  }

  return (
    <div className="w-full p-4 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        {t('auth.resetPassword')}
      </h1>
      <p className="text-sm text-gray-600 mb-6 text-center">{t('auth.enterNewPassword')}</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            {t('auth.newPassword')}
          </label>
          <input
            type="password"
            id="password"
            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none ${
              errors.password
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-gray-700'
            }`}
            {...register('password')}
            placeholder={t('auth.enterNewPassword')}
            disabled={isSubmitting || !token}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            {t('auth.confirmNewPassword')}
          </label>
          <input
            type="password"
            id="confirmPassword"
            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none ${
              errors.confirmPassword
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-gray-700'
            }`}
            {...register('confirmPassword')}
            placeholder={t('auth.confirmNewPassword')}
            disabled={isSubmitting || !token}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !token}
          className={`w-full py-3 text-white rounded-lg font-semibold transition ${isSubmitting || !token ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-900 hover:bg-black'}`}
        >
          {isSubmitting ? t('auth.resettingPassword') : t('auth.resetPassword')}
        </button>
      </form>
    </div>
  )
}
