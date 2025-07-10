"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

export default function GenerateQrCodePage() {
  const [form, setForm] = useState({
    ticketCode: "",
    seatName: "",
    eventId: "",
    firstName: "",
    lastName: "",
    email: "",
  })
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setQrUrl(null)
    try {
      const res = await fetch("/api/checkin-app/generate-qr-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to generate QR code")
      setQrUrl(data.qrDataUrl)
      toast({ title: "QR code generated!" })
    } catch (e: any) {
      setError(e.message)
      toast({ title: "Error", description: e.message, variant: "destructive" })
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
              <Input id="ticketCode" name="ticketCode" value={form.ticketCode} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="seatName">Seat Name</Label>
              <Input id="seatName" name="seatName" value={form.seatName} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="eventId">Event ID</Label>
              <Input id="eventId" name="eventId" value={form.eventId} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Generating..." : "Generate QR Code"}
            </Button>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          </form>
          {qrUrl && (
            <div className="flex flex-col items-center mt-6">
              <img src={qrUrl} alt="QR Code" className="w-48 h-48 border rounded-lg" />
              <Button
                className="mt-2"
                variant="outline"
                onClick={() => {
                  const a = document.createElement("a")
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
