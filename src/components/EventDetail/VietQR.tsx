'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Loader2 } from 'lucide-react'

interface VietQRProps {
  to_decrypt_params: string
  onPaymentDetails: (details: {
    amount: string
    accountName: string
    accountNo: string
    bankName: string
    contentBankTransfer: string
    qrDataURL: string
  }) => void
}

const VietQR: React.FC<VietQRProps> = ({ to_decrypt_params, onPaymentDetails }) => {
  const [qrCodeData, setQrCodeData] = useState<{ qrCode?: string; qrDataURL?: string }>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const generateQR = async () => {
      const encryptedString = decodeURIComponent(to_decrypt_params);
      try {
        const res = await axios.post('/api/vietqr', {
          to_decrypt_params: encryptedString,
        })
        const data = res.data
        setQrCodeData(data)
        onPaymentDetails(res.data)
      } catch (error) {
        console.error('Error generating QR:', error)
      } finally {
        setLoading(false)
      }
    }

    if (to_decrypt_params) {
      generateQR()
    }
  }, [to_decrypt_params, onPaymentDetails])

  return (
    <div className="text-center">
      <div className="relative w-[350px] h-[350px]">
        {loading && (
          <div className="absolute z-50 top-[30%] left-1/2 -translate-x-1/2 p-5 bg-gray-100/30 rounded-md flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-12 h-12 animate-spin" />
            <span className="text-xs">Đang tải...</span>
          </div>
        )}
        {qrCodeData?.qrDataURL && (
          <img
            src={qrCodeData.qrDataURL}
            className="max-w-[540px] max-h-[540px] object-contain w-full h-full box-border"
            alt="QR Code"
          />
        )}
      </div>
      <p className="mt-1 text-sm font-semibold italic">Quét mã này để chuyển tiền</p>
    </div>
  )
}

export default VietQR
