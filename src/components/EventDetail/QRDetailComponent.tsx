'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Check, Loader2, Copy } from 'lucide-react'

import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import VietQR from './VietQR'
import { PaymentDetails } from './types'
import { useTranslate } from '@/providers/I18n/client'

type FormValues = {
  transactionCode?: string
  transactionImage?: File
}

const QRDetailComponent = ({ paymentDetails }: { paymentDetails: PaymentDetails }) => {
  const { t } = useTranslate()
  const { toast } = useToast()
  const router = useRouter()
  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>()
  const transactionImage = watch('transactionImage')

  // Format amount to VND currency once paymentDetails is available
  const formatTotalMoney =
    paymentDetails &&
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(Number(paymentDetails.amount))

  const handleDownloadQR = () => {
    if (!paymentDetails?.qrDataURL) return
    const link = document.createElement('a')
    link.href = paymentDetails.qrDataURL
    link.download = 'QR.png'
    link.click()
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: `${t('event.copied')} ${label}`,
      duration: 2000,
    })
  }

  const mockPending = () => new Promise((resolve) => setTimeout(resolve, 2000))

  const handleConfirmPayment = async () => {
    await mockPending()
    toast({
      title: t('event.confirmRequest'),
      description: t('event.confirmMessage'),
      duration: 5000,
    })
    setTimeout(() => {
      router.push('/')
    }, 1000)
  }

  const allowTransactionInput = false
  return (
    <div className="bg-white p-4 rounded-md shadow-md m-4">
      <h2 className="text-center text-xl font-semibold mb-6">{t('event.bankTransferPayment')}</h2>
      {/* 2-column layout on medium+ screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: QR code approach */}
        <div className="border p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-2">{t('event.qrCodeMethod')}</h3>
          <div className="flex justify-center mb-4">
            {/* The QR code component */}
            <VietQR paymentDetails={paymentDetails} />
          </div>
          {/* Example "Tải ảnh QR" button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleDownloadQR}
            disabled={!paymentDetails?.qrDataURL}
          >
            {t('event.downloadQR')}
          </Button>
        </div>

        {/* Right Column: Manual bank transfer approach */}
        <div className="border p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-2">{t('event.manualTransferMethod')}</h3>
          <div className="space-y-3">
            {/* Nội dung CK */}
            <div className="grid grid-cols-3 gap-2 bg-gray-50 p-2 rounded shadow items-center">
              <div className="col-span-1 text-sm text-gray-500">{t('event.transferContent')}:</div>
              <div className="col-span-2 flex items-center justify-between">
                <p className="font-medium text-sm">{paymentDetails?.contentBankTransfer}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleCopy(paymentDetails?.contentBankTransfer, t('event.transferContent'))
                  }
                  style={{ marginLeft: '4px' }}
                >
                  <Copy />
                </Button>
              </div>
            </div>

            {/* Ngân hàng */}
            <div className="grid grid-cols-3 gap-2 bg-gray-50 p-2 rounded shadow items-center">
              <div className="col-span-1 text-sm text-gray-500">{t('event.bank')}:</div>
              <div className="col-span-2 flex items-center justify-between">
                <p className="font-medium text-sm">{paymentDetails?.bankName}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(paymentDetails?.bankName, t('event.bank'))}
                  style={{ marginLeft: '4px' }}
                >
                  <Copy />
                </Button>
              </div>
            </div>

            {/* Thụ hưởng */}
            <div className="grid grid-cols-3 gap-2 bg-gray-50 p-2 rounded shadow items-center">
              <div className="col-span-1 text-sm text-gray-500">{t('event.beneficiary')}:</div>
              <div className="col-span-2 flex items-center justify-between">
                <p className="font-medium text-sm">{paymentDetails?.accountName}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(paymentDetails?.accountName, t('event.beneficiary'))}
                  style={{ marginLeft: '4px' }}
                >
                  <Copy />
                </Button>
              </div>
            </div>

            {/* Số tài khoản */}
            <div className="grid grid-cols-3 gap-2 bg-gray-50 p-2 rounded shadow items-center">
              <div className="col-span-1 text-sm text-gray-500">{t('event.accountNumber')}:</div>
              <div className="col-span-2 flex items-center justify-between">
                <p className="font-medium text-sm">{paymentDetails?.accountNo}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(paymentDetails?.accountNo, t('event.accountNumber'))}
                  style={{ marginLeft: '4px' }}
                >
                  <Copy />
                </Button>
              </div>
            </div>

            {/* Số tiền */}
            <div className="grid grid-cols-3 gap-2 bg-gray-50 p-2 rounded shadow items-center">
              <div className="col-span-1 text-sm text-gray-500">{t('event.amount')}:</div>
              <div className="col-span-2 flex items-center justify-between">
                <p className="font-medium text-sm">{formatTotalMoney}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(formatTotalMoney, t('event.amount'))}
                  style={{ marginLeft: '4px' }}
                >
                  <Copy />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Note at the bottom */}
      <p className="text-sm text-gray-600 mt-4 text-center italic">{t('event.transferNote')}</p>
      <form onSubmit={handleSubmit(handleConfirmPayment)} className="mt-6">
        {/* Transaction code field */}
        {allowTransactionInput && (
          <div className="mt-6">
            <Label htmlFor="transactionCode">{t('event.transactionCode')} *</Label>
            <Input
              id="transactionCode"
              placeholder={t('event.enterTransactionCode')}
              {...register('transactionCode', {
                required: t('event.transactionCodeRequired'),
              })}
            />
            {errors.transactionCode && (
              <p className="text-red-500 text-sm mt-1">{errors.transactionCode.message}</p>
            )}
          </div>
        )}
        {/* Transaction image upload */}
        {allowTransactionInput && (
          <div className="mt-4">
            <Label htmlFor="transactionImage">{t('event.transactionImage')} *</Label>
            <div className="mt-2 flex items-center justify-center w-full">
              <label
                htmlFor="transaction-image"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                {!transactionImage || !(transactionImage instanceof File) ? (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 mb-4 text-gray-500"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">{t('event.clickToUpload')}</span>{' '}
                      {t('event.dragAndDrop')}
                    </p>
                    <p className="text-xs text-gray-500">{t('event.imageFormat')}</p>
                  </div>
                ) : (
                  <img
                    src={URL.createObjectURL(transactionImage)}
                    alt="Preview"
                    className="h-full w-full object-contain"
                  />
                )}
                <input
                  id="transaction-image"
                  type="file"
                  className="hidden"
                  accept="image/png, image/jpeg, image/jpg"
                  {...register('transactionImage', {
                    onChange: (e) => {
                      setValue('transactionImage', e.target?.files?.[0])
                    },
                  })}
                />
              </label>
            </div>
            {errors.transactionImage && (
              <p className="text-red-500 text-sm mt-1">{errors.transactionImage.message}</p>
            )}
          </div>
        )}
        <div className="flex justify-center">
          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700 cursor-pointer text-white mx-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className={'my-28 h-16 w-16 text-primary/60 animate-spin'} />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            {t('event.confirmTransfer')}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default QRDetailComponent
