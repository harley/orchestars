// This is a server component
import { validateResetPasswordToken } from '@/utilities/tokenValidation'
import ResetPasswordClientPage from './page.client' // Import the client component
import Link from 'next/link' // Import Link for navigation
// Assuming '@/providers/I18n/server' provides an async function 'getTranslate' or similar
// that returns an object with a 't' function.
import { getLocale, t } from '@/providers/I18n/server'
import PublicLayout from '@/components/User/PublicLayout'

type SearchParams = Promise<{ token: string; redirectTo?: string }>

export default async function ResetPasswordPage(props: { searchParams: SearchParams }) {
  // Obtain the translate function for the server component
  const params = await props.searchParams
  const locale = await getLocale()
  const token = params.token as string | undefined

  if (!token) {
    return (
      <PublicLayout>
        <div className="w-full p-4 max-w-sm mx-auto text-center py-20">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t('auth.missingToken', locale)}
          </h1>
          <p className="text-sm text-gray-600 mb-6">{t('auth.invalidResetLink', locale)}</p>
          <Link href="/">
            <button className="w-full py-3 text-white rounded-lg font-semibold bg-gray-900 hover:bg-black transition">
              {t('common.goHome', locale)}
            </button>
          </Link>
        </div>
      </PublicLayout>
    )
  }

  const validationResult = await validateResetPasswordToken(token)

  if (!validationResult.valid) {
    // Use the message from the validation utility for specific errors
    return (
      <PublicLayout>
        <div className="w-full p-4 max-w-sm mx-auto text-center py-20">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t('auth.invalidResetLink', locale)}
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            {validationResult.message || t('auth.somethingWentWrong', locale)}
          </p>
          <Link href="/">
            <button className="w-full py-3 text-white rounded-lg font-semibold bg-gray-900 hover:bg-black transition">
              {t('common.goHome', locale)}
            </button>
          </Link>
        </div>
      </PublicLayout>
    )
  }

  // If valid, render the client component with the token
  return (
    <PublicLayout>
      <ResetPasswordClientPage token={token} redirectTo={params.redirectTo} />
    </PublicLayout>
  )
}
