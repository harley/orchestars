import { useRouter } from 'next/navigation'
import { useTranslate } from '@/providers/I18n/client'
import { useToast } from '@/hooks/use-toast'
import { useForm } from 'react-hook-form'

interface RegisterFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

interface RegisterFormFields {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
}

export default function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const { t } = useTranslate()
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormFields>()

  const onSubmit = async (data: RegisterFormFields) => {
    try {
      const res = await fetch('/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      if (res?.ok) {
        toast({
          title: t('auth.registerSuccess'),
          description: t('auth.checkEmailToVerify'),
          variant: 'success',
        })
        onSuccess?.()
        reset()
      } else {
        const err = await res.json()
        toast({
          title: err.message || t('auth.registerFailed'),
          description: err.details
            ? Array.isArray(err.details)
              ? err.details.map((d: any) => d.message).join(', ')
              : err.details
            : '',
          variant: 'destructive',
        })
      }
    } catch (error: any) {
      toast({
        title: error.error || t('auth.registerFailed'),
        description: error.details || '',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">{t('auth.register')}</h1>
      <p className="text-sm text-gray-600 mb-6 text-center">{t('auth.createAccountToContinue')}</p>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('common.firstName')}
          </label>
          <input
            type="text"
            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-700 ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
            placeholder={t('common.enterFirstName')}
            disabled={isSubmitting}
            {...register('firstName', { required: t('event.firstNameRequired') })}
          />
          {errors.firstName && (
            <p className="text-xs text-red-600 mt-1">{errors.firstName.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('common.lastName')}
          </label>
          <input
            type="text"
            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-700 ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
            placeholder={t('common.enterLastName')}
            disabled={isSubmitting}
            {...register('lastName', { required: t('event.lastNameRequired') })}
          />
          {errors.lastName && (
            <p className="text-xs text-red-600 mt-1">{errors.lastName.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
          <input
            type="email"
            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-700 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            placeholder={t('auth.enterYourEmail')}
            disabled={isSubmitting}
            {...register('email', {
              required: t('event.emailRequired'),
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: t('message.invalidEmail'),
              },
            })}
          />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('common.phoneNumber')}
          </label>
          <input
            type="tel"
            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-700 ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
            placeholder={t('common.enterPhoneNumber')}
            disabled={isSubmitting}
            {...register('phoneNumber', {
              required: t('event.phoneNumberRequired'),
              pattern: {
                value: /^[0-9+\-() ]{7,20}$/,
                message: t('message.invalidPhoneNumber'),
              },
            })}
          />
          {errors.phoneNumber && (
            <p className="text-xs text-red-600 mt-1">{errors.phoneNumber.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 text-white rounded-lg font-semibold transition ${
            isSubmitting ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-900 hover:bg-black'
          }`}
        >
          {isSubmitting ? t('auth.registering') : t('auth.register')}
        </button>
        <div className="w-full text-center text-sm flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-medium text-gray-900 hover:underline focus:outline-none"
          >
            {t('auth.alreadyHaveAccount')}
          </button>
        </div>
      </form>
    </div>
  )
}
