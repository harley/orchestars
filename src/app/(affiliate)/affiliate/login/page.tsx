'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/components/ui/use-toast'
import { LogIn, Mail, Lock, UserPlus } from 'lucide-react'
import { ForgotPasswordForm } from '@/components/Affiliate/ForgotPasswordForm'
import Link from 'next/link'

// Zod validation schema
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function AffiliateLoginPage() {
  const { toast } = useToast()
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const { formState } = form
  const { isSubmitting } = formState

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await fetch('/api/affiliate/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: 'Login Successful',
          description: 'Welcome to your affiliate dashboard!',
        })

        // Redirect to affiliate dashboard
        window.location.href = '/affiliate'
      } else {
        toast({
          title: 'Login Failed',
          description: result.message || 'Invalid credentials',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: 'Login Failed',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      })
    }
  }

  // Show forgot password form if requested
  if (showForgotPassword) {
    return <ForgotPasswordForm onBackToLogin={() => setShowForgotPassword(false)} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full space-y-8 animate-fade-in-up">
        <div className="text-center animate-fade-in">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight drop-shadow-lg">Affiliate Portal</h1>
          <p className="text-lg text-gray-700">Sign in to access your affiliate dashboard</p>
        </div>
        <Card className="shadow-2xl bg-white border border-gray-200 transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl animate-fade-in-up">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <LogIn className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Sign In
            </CardTitle>
            <CardDescription>
              Enter your credentials to access your affiliate account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 animate-fade-in-up">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          disabled={isSubmitting}
                          {...field}
                          className="transition-all duration-300 focus:ring-2 focus:ring-blue-400/80 bg-white text-gray-900"
                        />
                      </FormControl>
                      <FormMessage className="text-red-600" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          disabled={isSubmitting}
                          {...field}
                          className="transition-all duration-300 focus:ring-2 focus:ring-blue-400/80 bg-white text-gray-900"
                        />
                      </FormControl>
                      <FormMessage className="text-red-600" />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full transition-all duration-300 hover:scale-[1.01]" disabled={isSubmitting} size="lg" variant='secondary'>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-blue-600 hover:underline font-medium"
                    disabled={isSubmitting}
                  >
                    Forgot your password?
                  </button>
                </div>
                <div className="text-center mt-2 animate-fade-in">
                  <span className="text-sm text-gray-600">Don&apos;t have an affiliate account? </span>
                  <Link href="/affiliate/register" className="text-blue-600 hover:underline font-medium">
                    <UserPlus className="inline h-4 w-4 mr-1" />Register
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
