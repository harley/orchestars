'use client'

import React from 'react'
import { PaymentDetails } from './types'
import { useTranslate } from '@/providers/I18n/client'

const VietQR = ({ paymentDetails }: { paymentDetails: PaymentDetails }) => {
  const { t } = useTranslate()

  return (
    <div className="text-center">
      <div className="relative w-[350px] h-[350px]">
        {/* {loading && (
          <div className="absolute z-50 top-[30%] left-1/2 -translate-x-1/2 p-5 bg-gray-100/30 rounded-md flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-12 h-12 animate-spin" />
            <span className="text-xs">Đang tải...</span>
          </div>
        )} */}
        {paymentDetails?.qrDataURL ? (
          <img
            src={paymentDetails.qrDataURL}
            className="max-w-[540px] max-h-[540px] object-contain w-full h-full box-border"
            alt="QR Code"
          />
        ) : (
          <>
            <div className="absolute z-50 top-[30%] left-1/2 -translate-x-1/2 p-5 bg-gray-100/30 rounded-md flex flex-col items-center justify-center gap-2">
              <span className="text-xs">{t('event.qrError')}</span>
            </div>
          </>
        )}
      </div>
      <p className="mt-1 text-sm font-semibold italic">{t('event.scanQRToTransfer')}</p>
    </div>
  )
}

export default VietQR
