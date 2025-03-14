'use client';

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Loader2 } from 'lucide-react'

interface VietQRProps {
  amount: string
  addInfo: string
  onGenerate: (url: string) => void 
}

const VietQR: React.FC<VietQRProps> = ({ amount, addInfo, onGenerate}) => {
  const [qrCodeData, setQrCodeData] = useState<{ qrCode?: string; qrDataURL?: string }>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const generateQR = async () => {
      try {
        const res = await axios.post('/api/vietqr', {
          amount,
          addInfo,
          
        })
        setQrCodeData(res.data?.data)
        onGenerate(res.data?.data?.qrDataURL)
      } catch (error) {
        console.error('Error generating QR:', error)
      } finally {
        setLoading(false)
      }
    }

    if (amount && addInfo) {
      generateQR()
    }
  }, [amount, addInfo]) // Empty dependency array means it runs only once when component mounts

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
            src={qrCodeData?.qrDataURL}
            className="max-w-[540px] max-h-[540px] object-contain w-full h-full box-border"
            alt=""
          />
        )}
      </div>

      <p className="mt-1 text-sm font-semibold italic">Quét mã này để chuyển tiền</p>
    </div>
  )
}

export default VietQR
