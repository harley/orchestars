import React, { useEffect, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import axios from 'axios'
import { Loader2 } from 'lucide-react'

interface VietQRProps {
  amount: string
  addInfo: string
}

const VietQR: React.FC<VietQRProps> = ({ amount, addInfo }) => {
  const [qrCode, setQrCode] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const generateQR = async () => {
      try {
        const res = await axios.post('/api/vietqr', {
          amount,
          addInfo,
        })
        const qrCode = res.data?.data?.qrCode
        setQrCode(qrCode)
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
      <h2 className="mb-1">VietQR Code</h2>
      <div className="relative w-[200px] h-[200px]">
        {loading && (
          <div className="absolute z-50 top-[30%] left-1/2 -translate-x-1/2 p-5 bg-gray-100/30 rounded-md flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-12 h-12 animate-spin" />
            <span className="text-xs">Đang tải...</span>
          </div>
        )}
        {qrCode && <QRCodeCanvas value={qrCode} size={200} />}
      </div>

      <p className="mt-1">Quét mã này để chuyển tiền</p>
    </div>
  )
}

export default VietQR
