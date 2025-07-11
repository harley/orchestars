'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import Link from 'next/link'
import { UserPlus, LogIn } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Clock, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must not exceed 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must not exceed 50 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  phoneNumber: z
    .string()
    .min(7, 'Phone number is required')
    .max(20, 'Phone number must not exceed 20 characters')
    .regex(/^[0-9+\-() ]+$/, 'Phone number must be valid'),
  acceptTerms: z.literal(true as boolean, {
    errorMap: () => ({ message: 'You must accept the terms and conditions' }),
  }),
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function AffiliateRegisterPage() {
  const { toast } = useToast()
  const router = useRouter()

  // hidden registration form when env is production
  const env = process.env.NEXT_PUBLIC_ENVIRONMENT
  const hiddenRegistrationPage = !env || env === 'production'
 
  const form = useForm<RegisterFormData & { acceptTerms: boolean }>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      acceptTerms: false,
    },
  })

  const { formState } = form
  const { isSubmitting } = formState

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const res = await fetch('/api/affiliate/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          acceptTerms: data.acceptTerms,
        }),
      })
      const result = await res.json()
      if (res.ok) {
        toast({
          title: 'Registration successful! 🎉',
          description:
            'Your application has been submitted. We have sent you an email for confirmation. Please check your email for further instructions.',
          variant: 'success',
        })
        form.reset()
      } else {
        if (result.details) {
          // Joi validation errors from API
          result.details.forEach((d: any) => {
            form.setError(d.field as keyof RegisterFormData, { message: d.message })
          })
        }
        toast({
          title: 'Registration Failed',
          description: result.error || 'Registration failed',
          variant: 'destructive',
        })
      }
    } catch (err) {
      console.error('Registration Failed', err)
      toast({
        title: 'Registration Failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleGoBack = () => {
    router.back()
  }

  if (hiddenRegistrationPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white py-10 sm:py-16 lg:py-20">
        <div className="max-w-lg w-full space-y-8 px-4">
          <Card className="shadow-2xl bg-white border border-gray-200 animate-fade-in-up">
            <CardContent className="p-12 text-center space-y-6">
              {/* Icon */}
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              
              {/* Main Text */}
              <div className="space-y-4">
                <h1 className="text-4xl font-bold text-gray-900">
                  Coming Soon
                </h1>
                <h2 className="text-xl text-gray-700">
                  Affiliate Program
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  We&apos;re working hard to bring you an amazing affiliate program. 
                  Stay tuned for updates!
                </p>
              </div>

              {/* Back Button */}
              <div className="pt-4">
                  <Button onClick={handleGoBack} variant="outline" className="group">
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Go back
                  </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-10 sm:py-16 lg:py-20">
      <div className="max-w-md w-full space-y-8 animate-fade-in-up">
        <div className="text-center animate-fade-in">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight drop-shadow-lg">
            Affiliate Registration
          </h1>
          <p className="text-lg text-gray-700">Register to become an affiliate partner</p>
        </div>
        <Card className="shadow-2xl bg-white border border-gray-200 transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl animate-fade-in-up">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <UserPlus className="h-6 w-6 text-blue-600" />
              Register
            </CardTitle>
            <CardDescription>Fill in your details to apply as an affiliate</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 animate-fade-in-up">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="mb-1">
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your first name"
                          {...field}
                          disabled={isSubmitting}
                          className="transition-all duration-300 focus:ring-2 focus:ring-blue-400/80 bg-white text-gray-900"
                        />
                      </FormControl>
                      <FormMessage className="text-red-600" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="mb-1">
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your last name"
                          {...field}
                          disabled={isSubmitting}
                          className="transition-all duration-300 focus:ring-2 focus:ring-blue-400/80 bg-white text-gray-900"
                        />
                      </FormControl>
                      <FormMessage className="text-red-600" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="mb-1">
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          {...field}
                          disabled={isSubmitting}
                          className="transition-all duration-300 focus:ring-2 focus:ring-blue-400/80 bg-white text-gray-900"
                        />
                      </FormControl>
                      <FormMessage className="text-red-600" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem className="mb-1">
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your phone number"
                          {...field}
                          disabled={isSubmitting}
                          className="transition-all duration-300 focus:ring-2 focus:ring-blue-400/80 bg-white text-gray-900"
                        />
                      </FormControl>
                      <FormMessage className="text-red-600" />
                    </FormItem>
                  )}
                />

                {/* Terms and Conditions Checkbox */}
                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-col mb-2 mt-2">
                      <div className="flex items-center">
                        <FormControl>
                          <Checkbox
                            id="acceptTerms"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSubmitting}
                            aria-checked={field.value}
                            className="mr-2"
                          />
                        </FormControl>
                        <FormLabel htmlFor="acceptTerms" className="mb-0 text-gray-700 select-none">
                          I agree to the{' '}
                          <Link
                            href="/affiliate/terms-conditions"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline hover:text-blue-800 transition-colors duration-200 font-medium"
                          >
                            Terms and Conditions
                          </Link>
                        </FormLabel>
                      </div>

                      <FormMessage className=" text-red-600" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full transition-all duration-300 hover:scale-[1.01]"
                  disabled={isSubmitting}
                  size="lg"
                  variant="secondary"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Register
                    </>
                  )}
                </Button>
                <div className="text-center mt-2 animate-fade-in">
                  <span className="text-sm text-gray-600">Already have an affiliate account? </span>
                  <Link
                    href="/affiliate/login"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    <LogIn className="inline h-4 w-4 mr-1" />
                    Login
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
