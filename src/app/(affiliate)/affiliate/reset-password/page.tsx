// This is a server component
import { validateAffiliateResetPasswordToken } from '@/app/(affiliate)/utils/affiliateTokenValidation'
import AffiliateResetPasswordClientPage from './page.client'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowLeft } from 'lucide-react'

type SearchParams = Promise<{ token: string }>

export default async function AffiliateResetPasswordPage(props: { searchParams: SearchParams }) {
  const params = await props.searchParams
  const token = params.token as string | undefined

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-2xl">Missing Reset Token</CardTitle>
              <CardDescription>
                This password reset link is missing the required token.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Please use the complete reset link from your email, or request a new one.
              </p>
              <Link href="/affiliate/login" className="block">
                <Button className="w-full" variant="default">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const validationResult = await validateAffiliateResetPasswordToken(token)

  if (!validationResult.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
              <CardDescription>
                This password reset link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                {validationResult.message || 'Password reset links expire after 1 hour for security reasons.'}
              </p>
              <p className="text-sm text-gray-600 text-center">
                Please request a new reset link if needed.
              </p>
              <div className="space-y-2">
                <Link href="/affiliate/login" className="block">
                  <Button className="w-full" variant="default">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // If valid, render the client component with the token
  return <AffiliateResetPasswordClientPage token={token} user={validationResult.user} />
}
