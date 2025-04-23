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
    attendeeName?: string
    eventName?: string
  }
}

export default function CustomerCheckInPage() {
  const [email, setEmail] = useState('')
  const [ticketCode, setTicketCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [checkedInData, setCheckedInData] = useState<CheckInResponse['data']>()

  const [ticketGivenConfirmed, setTicketGivenConfirmed] = useState(false)

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

      if (response.ok) {
        const data: CheckInResponse = await response.json()
        setCheckedInData(data.data)
        toast({ title: 'Success', description: 'Ticket checked in successfully' })
        return
      }

      const errorData: CheckInResponse = await response.json()
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorData?.message || 'Failed to check in. Please try again.',
      })
    } catch (error: any) {
      console.log('error', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to check in. Please try again.',
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
  const handleTicketGiven = async () => {
    const adminInput = window.prompt('Enter your admin ID:')
  
    if (!adminInput) return
  
    const confirm = window.confirm(`Confirm this ticket has been given by admin "${adminInput}"?`)
    if (!confirm) return
  
    try {
      const response = await fetch('/api/checkin-app/customer-checkin/given-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketCode: checkedInData?.ticketCode,
          adminId: adminInput,
        }),
      })
  
      if (response.ok) {
        const result = await response.json()
        setTicketGivenConfirmed(true) 
        toast({
          title: 'Confirmed',
          description: result.message || 'Ticket marked as given.',
        })
      } else {
        const error = await response.json()
        toast({
          variant: 'destructive',
          title: 'Failed',
          description: error?.message || 'Could not mark ticket as given.',
        })
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Unexpected error occurred.',
      })
    }
  }
  
  if (checkedInData) {
    const zoneCategory = categories.find((cat) => cat.id === checkedInData.zoneId)

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="w-full max-w-md p-6 space-y-6 rounded-lg shadow-lg"
          style={{
            backgroundColor: zoneCategory?.color,
            background: ticketGivenConfirmed ? zoneCategory?.color : `linear-gradient(to bottom, ${zoneCategory?.color}80 0%, ${zoneCategory?.color}30 100%)`,
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
                <span className="font-medium">Event Name:</span>
                <span>{checkedInData.eventName}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-gray-50">
                <span className="font-medium">Email:</span>
                <span>{checkedInData.email}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-gray-50">
                <span className="font-medium">Attendee Name:</span>
                <span>{checkedInData.attendeeName}</span>
              </div>
              {checkedInData.checkedInAt && (
                <div className="flex items-center justify-between p-2 rounded">
                  <span className="font-medium">Checked in at:</span>
                  <span>{new Date(checkedInData.checkedInAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">

            <Button
              className="w-full text-white hover:bg-gray-100"
              onClick={handleTicketGiven}
              style={{ backgroundColor: zoneCategory?.color }}
            >
                    Đã nhận vé vào cửa
            </Button>
            <Button
              className="w-full bg-white hover:bg-gray-100"
              onClick={resetForm}
              style={{ color: zoneCategory?.color }}
            >
              Check in another ticket
            </Button>
          </div>
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
