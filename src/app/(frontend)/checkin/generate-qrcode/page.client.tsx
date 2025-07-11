'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'

export default function GenerateQrCodePage() {
  const [form, setForm] = useState({
    ticketCode: '',
  })
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const onClearData = () => {
    setError(null)
    setQrUrl(null)
    setForm({ ticketCode: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setQrUrl(null)
    try {
      const res = await fetch('/api/v1/checkin/generate-qr-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate QR code')
      setQrUrl(data.qrDataUrl)
      toast({ title: 'QR code generated!' })
    } catch (e: any) {
      setError(e.message)
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Generate Ticket QR Code</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="ticketCode">Ticket Code</Label>
              <Input
                id="ticketCode"
                name="ticketCode"
                value={form.ticketCode}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button variant={'secondary'} type="submit" className="w-full" disabled={loading}>
                {loading ? 'Generating...' : 'Generate QR Code'}
              </Button>
              <Button
                variant={'outline'}
                type="button"
                className="w-full"
                disabled={loading}
                onClick={onClearData}
              >
                {'Clear'}
              </Button>
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          </form>
          {qrUrl && (
            <div className="flex flex-col items-center mt-6">
              <img src={qrUrl} alt="QR Code" className="w-48 h-48 border rounded-lg" />
              <Button
                className="mt-2"
                variant="outline"
                onClick={() => {
                  const a = document.createElement('a')
                  a.href = qrUrl
                  a.download = `ticket-qr.png`
                  a.click()
                }}
              >
                Download QR Code
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
