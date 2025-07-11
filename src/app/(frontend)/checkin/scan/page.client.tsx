'use client'

import React, { useEffect, useState } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTicketScanner } from '@/hooks/useTicketScanner'
import { ScannerOverlay } from '@/components/CheckIn/TicketScanner/ScannerOverlay'
import { TicketDisplay } from '@/components/CheckIn/TicketScanner/TicketDisplay'
import { cn } from '@/utilities/ui'
import { QrCode, Keyboard, X, RotateCcw, Volume2, VolumeX, Vibrate, History } from 'lucide-react'
import type { ScanResult } from '@/types/TicketScanning'

export default function CheckinScanPage() {
  const {
    state,
    ticket,
    error,
    settings,
    scannerKey,
    handleScan,
    handleCheckin,
    handleRescan,
    updateSettings,
    isValidating,
    isCheckingIn,
    canCheckin,
    canRescan,
  } = useTicketScanner()

  // Modal states
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualTicketCode, setManualTicketCode] = useState('')

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return // Don't trigger when typing in inputs

      switch (event.key.toLowerCase()) {
        case 'r':
          if (canRescan) handleRescan()
          break
        case 'm':
          setShowManualInput(true)
          break
        case ' ':
          event.preventDefault()
          if (canCheckin) handleCheckin()
          break
        case 'escape':
          setShowManualInput(false)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [canRescan, canCheckin, handleRescan, handleCheckin])

  // Handle manual ticket input
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualTicketCode.trim()) return

    const mockScanResult: ScanResult[] = [
      {
        rawValue: JSON.stringify({ ticketCode: manualTicketCode.trim().toUpperCase() }),
      },
    ]

    await handleScan(mockScanResult)
    setManualTicketCode('')
    setShowManualInput(false)
  }

  // Scanner wrapper with error handling
  const handleScannerScan = (results: any[]) => {
    const scanResults: ScanResult[] = results.map((result) => ({
      rawValue: result.rawValue,
      format: result.format,
      timestamp: Date.now(),
    }))
    handleScan(scanResults)
  }

  const handleScannerError = (err: any) => {
    console.error('Scanner error:', err)
    // The error handling is now managed by the useTicketScanner hook
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white pt-10">
      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Quét vé check-in</h1>
          <p className="text-blue-600">Hệ thống quét vé tự động với phản hồi nhanh</p>
        </div>

        {/* Scanner Card */}
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-center text-blue-900 flex items-center justify-center gap-2">
              <QrCode className="w-6 h-6" />
              Camera Scanner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Scanner Container */}
              <div
                className={cn(
                  'w-full aspect-square rounded-xl overflow-hidden border-2 shadow-lg transition-all duration-300',
                  state === 'validated'
                    ? 'border-green-400'
                    : state === 'error'
                      ? 'border-red-400'
                      : state === 'validating'
                        ? 'border-blue-400'
                        : 'border-gray-300',
                )}
              >
                <Scanner
                  key={scannerKey}
                  onScan={handleScannerScan}
                  onError={handleScannerError}
                  constraints={{ facingMode: 'environment' }}
                  formats={['qr_code']}
                  styles={{
                    container: { width: '100%', height: '100%' },
                    video: { width: '100%', height: '100%', objectFit: 'cover' },
                  }}
                />

                {/* Scanner Overlay */}
                <ScannerOverlay state={state} message={error?.message} />
              </div>

              {/* Status Message */}
              {state === 'idle' && !ticket && (
                <div className="mt-4 text-center">
                  <p className="text-gray-600 text-sm">Đưa mã QR vào khung camera để quét vé</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Đảm bảo ánh sáng đủ và giữ camera ổn định
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Ticket Display */}
        {ticket && (
          <TicketDisplay
            ticket={ticket}
            onCheckin={handleCheckin}
            onRescan={handleRescan}
            isCheckingIn={isCheckingIn}
          />
        )}

        {/* Simple Controls */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button
            variant="outline"
            onClick={handleRescan}
            disabled={!canRescan}
            className="flex items-center justify-center gap-2 h-12 border-blue-400 text-blue-700 hover:bg-blue-50"
          >
            <RotateCcw className="w-5 h-5" />
            Quét lại
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowManualInput(true)}
            disabled={isValidating || isCheckingIn}
            className="flex items-center justify-center gap-2 h-12 border-purple-400 text-purple-700 hover:bg-purple-50"
          >
            <Keyboard className="w-5 h-5" />
            Nhập tay
          </Button>
        </div>

        {/* Sound and Vibration Toggle */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button
            variant={settings.soundEnabled ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            disabled={isValidating || isCheckingIn}
            className={cn(
              'flex items-center justify-center gap-2 h-10',
              settings.soundEnabled
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50',
            )}
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
            Âm thanh
          </Button>

          <Button
            variant={settings.vibrationEnabled ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateSettings({ vibrationEnabled: !settings.vibrationEnabled })}
            disabled={isValidating || isCheckingIn}
            className={cn(
              'flex items-center justify-center gap-2 h-10',
              settings.vibrationEnabled
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50',
            )}
          >
            <Vibrate className="w-4 h-4" />
            Rung
          </Button>
        </div>
        <div className="grid mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.open('/checkin/history', '_blank')
              }
            }}
            className="flex items-center gap-1 h-10 border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            <History className="w-5 h-5" />
            <span className="text-xs">Lịch sử</span>
          </Button>
        </div>

        {/* Manual Input Modal */}
        <Dialog open={showManualInput} onOpenChange={setShowManualInput}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Keyboard className="w-5 h-5" />
                Nhập mã vé thủ công
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <Label htmlFor="ticketCode">Mã vé</Label>
                <Input
                  id="ticketCode"
                  value={manualTicketCode}
                  onChange={(e) => setManualTicketCode(e.target.value)}
                  placeholder="Nhập mã vé (VD: TK123456)"
                  className="mt-1"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  variant={'secondary'}
                  disabled={!manualTicketCode.trim()}
                  className="flex-1"
                >
                  Kiểm tra vé
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowManualInput(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Keyboard Shortcuts Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Phím tắt: <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">R</kbd> Quét lại •
            <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">M</kbd> Nhập tay •
            <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Space</kbd> Check-in
          </p>
        </div>
      </div>
    </div>
  )
}
