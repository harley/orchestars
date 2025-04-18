'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { categories } from '@/components/EventDetail/data/seat-maps/categories'

type CheckInResponse = {
  success: boolean
  message: string
  data?: {
    zoneId: string
    email: string
    ticketCode: string
    checkedInAt?: string
  }
}

export default function CustomerCheckInPage() {
  const [email, setEmail] = useState('')
  const [ticketCode, setTicketCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [checkedInData, setCheckedInData] = useState<CheckInResponse['data']>()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/checkin-app/customer-checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, ticketCode }),
      })

      const data: CheckInResponse = await response.json()

      if (!data.success) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.message || 'Something went wrong',
        })
        return
      }

      setCheckedInData(data.data)
      toast({
        title: 'Success',
        description: 'Ticket checked in successfully',
      })
    } catch (_error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to check in. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setCheckedInData(undefined)
    setEmail('')
    setTicketCode('')
  }

  if (checkedInData) {
    const zoneCategory = categories.find((cat) => cat.id === checkedInData.zoneId)

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="w-full max-w-md p-6 space-y-6 rounded-lg shadow-lg"
          style={{
            backgroundColor: zoneCategory?.color,
            background: `linear-gradient(to bottom, ${zoneCategory?.color}80 0%, ${zoneCategory?.color}30 100%)`,
          }}
        >
          <div className="text-center space-y-4 bg-white p-6 rounded-lg">
            <div
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
              style={{ backgroundColor: zoneCategory?.color }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="white"
                className="w-10 h-10"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Check-in Successful!</h2>
            <div className="space-y-2 text-gray-600">
              <div className="flex items-center justify-between p-2 rounded bg-gray-50">
                <span className="font-medium">Zone:</span>
                <span className="font-bold" style={{ color: zoneCategory?.color }}>
                  {zoneCategory?.name}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded">
                <span className="font-medium">Ticket Code:</span>
                <span>{checkedInData.ticketCode}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-gray-50">
                <span className="font-medium">Email:</span>
                <span>{checkedInData.email}</span>
              </div>
              {checkedInData.checkedInAt && (
                <div className="flex items-center justify-between p-2 rounded">
                  <span className="font-medium">Checked in at:</span>
                  <span>{new Date(checkedInData.checkedInAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
          <Button
            className="w-full bg-white hover:bg-gray-100"
            onClick={resetForm}
            style={{ color: zoneCategory?.color }}
          >
            Check in another ticket
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6 space-y-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center">Ticket Check-in</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="ticketCode" className="text-sm font-medium">
              Ticket Code
            </label>
            <Input
              id="ticketCode"
              type="text"
              value={ticketCode}
              onChange={(e) => setTicketCode(e.target.value)}
              placeholder="Enter your ticket code"
              required
            />
          </div>
          <Button type="submit" className="w-full" variant={'outline'} disabled={isLoading}>
            {isLoading ? 'Checking in...' : 'Check in'}
          </Button>
        </form>
      </div>
    </div>
  )
}
