// Scanner overlay component with visual feedback

import React from 'react'
import { cn } from '@/utilities/ui'
import { CheckCircle, XCircle, Loader2, QrCode, Zap } from 'lucide-react'
import type { ScannerState } from '@/types/TicketScanning'

interface ScannerOverlayProps {
  state: ScannerState
  message?: string
  className?: string
}

export const ScannerOverlay: React.FC<ScannerOverlayProps> = ({
  state,
  message,
  className
}) => {
  const getOverlayContent = () => {
    switch (state) {
      case 'idle':
      case 'scanning':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            {/* Scanning frame */}
            <div className="relative">
              <div className="w-48 h-48 border-2 border-white/50 rounded-lg relative">
                {/* Corner indicators */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-l-4 border-t-4 border-white rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-r-4 border-t-4 border-white rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-l-4 border-b-4 border-white rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-r-4 border-b-4 border-white rounded-br-lg" />
                
                {/* Scanning line animation */}
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                  <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse">
                    <div className="w-full h-full bg-white/80 animate-bounce" style={{
                      animation: 'scan-line 2s ease-in-out infinite'
                    }} />
                  </div>
                </div>
              </div>
              
              {/* QR code icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <QrCode className="w-16 h-16 text-white/70" />
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-white text-lg font-medium">
                Đưa mã QR vào khung để quét
              </p>
              <p className="text-white/70 text-sm mt-1">
                Giữ camera ổn định và đảm bảo ánh sáng đủ
              </p>
            </div>
          </div>
        )

      case 'validating':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-white animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-pulse" />
            </div>
            <div className="mt-6 text-center">
              <p className="text-white text-xl font-semibold">
                Đang kiểm tra vé...
              </p>
              <p className="text-white/70 text-sm mt-1">
                Vui lòng chờ trong giây lát
              </p>
            </div>
          </div>
        )

      case 'validated':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-green-400/50 animate-pulse" />
            </div>
            <div className="mt-6 text-center">
              <p className="text-white text-xl font-semibold">
                Vé hợp lệ!
              </p>
              <p className="text-white/70 text-sm mt-1">
                Sẵn sàng check-in
              </p>
            </div>
          </div>
        )

      case 'checking-in':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Zap className="w-12 h-12 text-yellow-400 animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-yellow-400/50 animate-spin" />
            </div>
            <div className="mt-6 text-center">
              <p className="text-white text-xl font-semibold">
                Đang check-in...
              </p>
              <p className="text-white/70 text-sm mt-1">
                Đang xử lý yêu cầu
              </p>
            </div>
          </div>
        )

      case 'checked-in':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-green-400/50">
                <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping" />
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-white text-xl font-semibold">
                Check-in thành công!
              </p>
              <p className="text-white/70 text-sm mt-1">
                Vé đã được xác nhận
              </p>
            </div>
          </div>
        )

      case 'error':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-400" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-red-400/50 animate-pulse" />
            </div>
            <div className="mt-6 text-center">
              <p className="text-white text-xl font-semibold">
                Có lỗi xảy ra
              </p>
              <p className="text-white/70 text-sm mt-1 max-w-xs">
                {message || 'Vui lòng thử lại'}
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const getBackgroundColor = () => {
    switch (state) {
      case 'validated':
      case 'checked-in':
        return 'bg-green-600/80'
      case 'error':
        return 'bg-red-600/80'
      case 'validating':
        return 'bg-blue-600/80'
      case 'checking-in':
        return 'bg-yellow-600/80'
      default:
        return 'bg-black/40'
    }
  }

  const shouldShow = state === 'scanning' || state !== 'idle'

  if (!shouldShow) return null

  return (
    <>
      <div 
        className={cn(
          'absolute inset-0 z-10 flex items-center justify-center transition-all duration-300',
          getBackgroundColor(),
          className
        )}
      >
        {getOverlayContent()}
      </div>
      
      {/* Custom CSS for scan line animation */}
      <style jsx>{`
        @keyframes scan-line {
          0% {
            transform: translateY(-100px);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(200px);
            opacity: 0;
          }
        }
      `}</style>
    </>
  )
}

export default ScannerOverlay
