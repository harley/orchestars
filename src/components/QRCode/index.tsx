'use client'

import React, { useEffect, useRef } from 'react'
import QRCode, { QRCodeRenderersOptions } from 'qrcode'

interface QRCodeProps {
  payload: string
  className?: string
  options?: QRCodeRenderersOptions
}

const defaultOptions: QRCodeRenderersOptions = {
  errorCorrectionLevel: 'H',
  margin: 2,
  width: 256,
  color: {
    dark: '#000000',
    light: '#FFFFFF',
  },
}

export const QRCodeComponent: React.FC<QRCodeProps> = ({
  payload,
  className,
  options = {},
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && payload) {
      QRCode.toCanvas(canvasRef.current, payload, { ...defaultOptions, ...options }, error => {
        if (error) {
          console.error('Failed to generate QR code:', error)
        }
      })
    }
  }, [payload, options])

  if (!payload) {
    return (
      <div className={className}>
        <p>No QR code payload provided.</p>
      </div>
    )
  }

  return <canvas ref={canvasRef} className={className} />
} 