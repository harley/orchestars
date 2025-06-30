'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Check,
  X,
  ArrowLeft,
  ArrowRight,
  RefreshCcw,
  AlertCircle,
  CreditCard,
  Calendar,
  Hash,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { formatMoney } from '@/utilities/formatMoney'
import { useTranslate } from '@/providers/I18n/client'

const PaymentResultPage = ({ paymentInfo }: { paymentInfo: Record<string, any> }) => {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslate()
  const status = paymentInfo.status
  const [isLoading, setIsLoading] = useState(status === 'processing')

  const isFailed = status === 'failed'
  const isCanceled = status === 'canceled'
  const isSuccess = status === 'paid'

  useEffect(() => {
    const timer = setTimeout(() => {
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
        // toast({
        //   title: 'Payment processing...',
        // })
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
      const interval = setInterval(() => {
        router.refresh()
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [isLoading, status, router])

  // If still loading, show a spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          <div className="text-center max-w-md mx-auto">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
              <div className="relative bg-white rounded-full p-6 shadow-2xl">
                <RefreshCcw className="h-16 w-16 animate-spin mx-auto text-gradient-to-r from-blue-500 to-purple-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {t('paymentResult.processingPayment')}
            </h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              {t('paymentResult.processingDescription')}
            </p>
            <div className="flex items-center justify-center space-x-2 mb-8">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: '0.1s' }}
              ></div>
              <div
                className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                style={{ animationDelay: '0.2s' }}
              ></div>
            </div>
            <Button
              variant="outline"
              className="flex-1 mt-4 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl"
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('paymentResult.backToHome')}
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <>
      <main className="flex-grow py-12 bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 transform transition-all duration-500 hover:shadow-3xl">
            {/* Result Header */}
            <div
              className={`p-12 ${
                isSuccess
                  ? 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600'
                  : 'bg-gradient-to-br from-red-400 via-rose-500 to-pink-600'
              } text-white text-center relative overflow-hidden`}
            >
              {/* Animated background elements */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
                <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full opacity-50"></div>
              </div>

              <div className="relative z-10">
                <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm mb-8 shadow-2xl border border-white/30">
                  {isSuccess ? (
                    <Check className="h-12 w-12 text-white drop-shadow-lg" />
                  ) : (
                    <X className="h-12 w-12 text-white drop-shadow-lg" />
                  )}
                </div>

                <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">
                  {isSuccess
                    ? t('paymentResult.paymentSuccessful')
                    : isCanceled
                      ? t('paymentResult.orderCanceled')
                      : t('paymentResult.paymentFailed')}
                </h1>

                <p className="text-white/95 text-xl leading-relaxed max-w-2xl mx-auto">
                  {isSuccess
                    ? t('paymentResult.successDescription')
                    : isCanceled
                      ? t('paymentResult.canceledDescription')
                      : t('paymentResult.failedDescription')}
                </p>
              </div>
            </div>

            {/* Order Details */}
            <div className="p-12">
              {isSuccess && (
                <div className="mb-10">
                  <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                    <CreditCard className="mr-3 h-6 w-6 text-primary" />
                    {t('paymentResult.orderDetails')}
                  </h2>

                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 space-y-6 border border-gray-100 shadow-lg">
                    <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                      <div className="flex items-center text-gray-600">
                        <Hash className="mr-3 h-5 w-5 text-gray-400" />
                        <span className="font-medium">{t('paymentResult.orderNumber')}</span>
                      </div>
                      <span className="font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-lg">
                        {paymentInfo.order?.orderCode}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="mr-3 h-5 w-5 text-gray-400" />
                        <span className="font-medium">{t('paymentResult.dateTime')}</span>
                      </div>
                      <span className="font-medium text-gray-800">
                        {format(paymentInfo.createdAt, 'dd/MM/yyyy HH:mm:ss')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                      <div className="flex items-center text-gray-600">
                        <CreditCard className="mr-3 h-5 w-5 text-gray-400" />
                        <span className="font-medium">{t('paymentResult.paymentMethod')}</span>
                      </div>
                      <span className="font-medium text-gray-800">
                        {t('paymentResult.onlinePayment')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-4 mt-4 border-t-2 border-primary/20">
                      <span className="text-xl font-bold text-gray-900">
                        {t('paymentResult.totalAmount')}
                      </span>
                      <span className="text-2xl font-bold text-primary bg-primary/10 px-4 py-2 rounded-xl">
                        {formatMoney(paymentInfo.total, paymentInfo.currency || 'VND')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {!isSuccess && (
                <div className="mb-10">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 p-6 mb-8 flex items-start rounded-r-xl shadow-lg">
                    <AlertCircle className="h-6 w-6 text-amber-500 mr-4 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-amber-800 text-lg mb-2">
                        {t('paymentResult.paymentNotCompleted')}
                      </h3>
                      <p className="text-amber-700 leading-relaxed">
                        {isFailed && t('paymentResult.failedReason')}
                        {isCanceled && t('paymentResult.canceledReason')}
                      </p>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg mb-4 text-gray-800">
                    {t('paymentResult.whatWouldYouLikeToDo')}
                  </h3>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{t('paymentResult.tryPaymentAgain')}</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{t('paymentResult.checkCardDetails')}</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{t('paymentResult.contactSupport')}</span>
                    </li>
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                {isSuccess ? (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1 h-12 text-lg font-semibold border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                      onClick={() => router.push('/')}
                    >
                      <ArrowLeft className="mr-2 h-5 w-5" />
                      {t('paymentResult.backToHome')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1 h-12 text-lg font-semibold border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                      onClick={() => router.push('/')}
                    >
                      <ArrowLeft className="mr-2 h-5 w-5" />
                      {t('paymentResult.backToHome')}
                    </Button>
                    {!isCanceled && (
                      <Button
                        className="flex-1 h-12 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={handleRetry}
                      >
                        <RefreshCcw className="mr-2 h-5 w-5" />
                        {t('paymentResult.tryAgain')}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {isSuccess && (
            <div className="mt-10 text-center">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200 shadow-lg">
                <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                  {t('paymentResult.ticketsSent')}
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center text-primary hover:text-primary/80 font-semibold text-lg transition-all duration-300 hover:scale-105"
                >
                  {t('paymentResult.goToUpcomingEvents')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

export default PaymentResultPage
