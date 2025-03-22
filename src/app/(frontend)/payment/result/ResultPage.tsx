'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, X, ArrowLeft, ArrowRight, RefreshCcw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

const PaymentResultPage = ({ paymentInfo }: { paymentInfo: Record<string, any> }) => {
  const router = useRouter()
  const { toast } = useToast()
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const status = paymentInfo.status

  const isFailed = status === 'failed'
  const isCanceled = status === 'canceled'

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSuccess(status === 'paid')

      // Show toast notification
      if (status === 'paid') {
        setIsLoading(false)
        toast({
          title: 'Payment completed successfully!',
        })
      } else if (status === 'failed') {
        setIsLoading(false)
        toast({
          title: 'Payment failed. Please try again.',
          variant: 'destructive',
        })
      } else if (status === 'canceled') {
        setIsLoading(false)
        toast({
          title: 'Your order has been canceled because payment was not completed.',
          variant: 'destructive',
        })
      } else {
        setIsLoading(true)
        toast({
          title: 'Payment processing...',
        })
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [paymentInfo, toast, status])

  // Handle payment retry
  const handleRetry = () => {
    window.location.reload()
  }

  useEffect(() => {
    if (isLoading && status !== 'paid' && status !== 'failed' && status !== 'canceled') {
      setTimeout(() => {
        handleRetry()
      }, 3000)
    }
  }, [isLoading, status])

  // If still loading, show a spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          <div className="text-center">
            <RefreshCcw className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Processing Your Payment</h2>
            <p className="text-gray-500">Please wait while we confirm your payment...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <>
      <main className="flex-grow py-10 bg-gray-50">
        <div className="container max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Result Header */}
            <div
              className={`p-8 ${
                isSuccess
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                  : 'bg-gradient-to-r from-red-500 to-rose-600'
              } text-white text-center`}
            >
              <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-white mb-6">
                {isSuccess ? (
                  <Check className="h-10 w-10 text-green-500" />
                ) : (
                  <X className="h-10 w-10 text-red-500" />
                )}
              </div>

              <h1 className="text-3xl font-bold mb-2">
                {isSuccess
                  ? 'Payment Successful!'
                  : isCanceled
                    ? 'Order has been canceled'
                    : 'Payment Failed'}
              </h1>

              <p className="text-white/90 text-lg">
                {isSuccess
                  ? 'Your transaction has been completed'
                  : isCanceled
                    ? 'Your order has been canceled because payment was not completed'
                    : 'There was an issue processing your payment'}
              </p>
            </div>

            {/* Order Details */}
            <div className="p-8">
              {isSuccess && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Order Details</h2>

                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Number:</span>
                      <span className="font-medium">{paymentInfo.order?.orderCode}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">
                        {format(paymentInfo.createdAt, 'dd/MM/yyyy HH:mm:ss')}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium">-</span>
                    </div>

                    <div className="flex justify-between border-t pt-4 mt-4">
                      <span className="text-gray-900 font-bold">Total Amount:</span>
                      <span className="text-primary font-bold">
                        {' '}
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: paymentInfo.currency || 'VND',
                        }).format(paymentInfo.total)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {!isSuccess && (
                <div className="mb-8">
                  <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 flex items-start">
                    <AlertCircle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-amber-800">Payment Not Completed</h3>
                      <p className="text-amber-700 text-sm mt-1">
                        {isFailed &&
                          `Your payment could not be processed. This could be due to insufficient
                        funds, incorrect payment details, or a temporary issue with the payment
                        provider.`}

                        {isCanceled &&
                          `Your order was automatically canceled because the payment was not
                        completed within the required timeframe. If this was unintentional, please
                        place a new order and ensure payment is made to confirm your purchase`}
                      </p>
                    </div>
                  </div>

                  <h3 className="font-medium mb-2">What would you like to do?</h3>
                  <ul className="list-disc pl-5 text-gray-600 space-y-1 mb-6">
                    <li>Try the payment again with the same or different payment method</li>
                    <li>Check your card details and available balance</li>
                    <li>Contact customer support if the issue persists</li>
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                {isSuccess ? (
                  <>
                    <Button variant="outline" className="flex-1" onClick={() => router.push('/')}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Home
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="flex-1" onClick={() => router.push('/')}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Home
                    </Button>
                    {!isCanceled && (
                      <Button
                        className="flex-1 bg-primary hover:bg-primary/90"
                        onClick={handleRetry}
                      >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Try Again
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {isSuccess && (
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">
                Your tickets have been sent to your email address. You can also view them in your
                account.
              </p>
              <Link href="/" className="text-primary hover:underline inline-flex items-center">
                Go to upcoming events
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

export default PaymentResultPage
