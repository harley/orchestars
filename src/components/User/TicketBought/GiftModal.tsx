'use client'

import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslate } from '@/providers/I18n/client'
import { createPortal } from 'react-dom'
import { useToast } from '@/components/ui/use-toast'
import { Ticket } from '@/types/Ticket'
import { format, parse } from 'date-fns'
import { categories } from '@/components/EventDetail/data/seat-maps/categories'

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  phone: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface GiftModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  ticketId: string
  ticket: Ticket
}

function getZoneId(ticket: any): string {
  const ticketPriceId = ticket?.ticketPriceInfo?.ticketPriceId || ticket?.ticketPriceInfo?.id
  const matched = ticket?.event?.ticketPrices?.find((price: any) => price.id === ticketPriceId)
  return matched?.key || 'unknown'
}

export const GiftModal: React.FC<GiftModalProps> = ({ isOpen, onClose, onSuccess, ticketId, ticket }) => {
  const { t } = useTranslate()
  const { toast } = useToast()
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    }
  })

  const handleFormSubmit = async (data: FormValues) => {
    try {
      const response = await fetch('/api/user/tickets/gift-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketIds: [ticketId],
          recipientFirstName: data.firstName,
          recipientLastName: data.lastName,
          recipientEmail: data.email,
          recipientPhone: data.phone,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to gift ticket')
      }

      toast({
        title: t('userprofile.giftTicketSuccess'),
        variant: 'success',
      })
      
      reset()
      onClose()
      onSuccess?.()

    } catch (error) {
      console.error('Error submitting form:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        title: 'Error',
        description: `Failed to gift ticket: ${errorMessage}`,
        variant: 'destructive',
      })
      
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!isOpen) return null

  const zoneId = getZoneId(ticket)
  const zone = categories.find((c) => c.id === zoneId)
  
  // Safe date parsing with fallback
  let parsedDate: Date | null = null
  try {
    if (ticket?.eventDate) {
      parsedDate = parse(ticket.eventDate, 'dd/MM/yyyy', new Date())
      // Check if the parsed date is valid
      if (isNaN(parsedDate.getTime())) {
        parsedDate = null
      }
    }
  } catch (error) {
    console.warn('Failed to parse ticket date:', error)
    parsedDate = null
  }

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('userprofile.giftTicket')}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
            disabled={isSubmitting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Ticket Information Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
            {t('userprofile.ticketInformation') || 'Ticket Information'}
          </h3>
          
          <div 
            className="rounded-lg p-6 border border-gray-200"
            style={{ 
              backgroundColor: zone?.color || '#6B7280',
              color: 'white'
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Event Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">
                    {ticket?.event?.title || t('userprofile.eventTitle') || 'Event Title'}
                  </h4>
                  <div className="flex items-center text-sm text-white mb-2">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {ticket?.event?.eventLocation || t('userprofile.location') || 'Location not specified'}
                  </div>
                </div>

                {parsedDate ? (
                  <div className="flex items-center text-sm text-white">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v16a2 2 0 002 2z" />
                    </svg>
                    {format(parsedDate, 'EEEE, MMMM do, yyyy')}
                  </div>
                ) : ticket?.eventDate ? (
                  <div className="flex items-center text-sm text-white">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v16a2 2 0 002 2z" />
                    </svg>
                    {ticket.eventDate}
                  </div>
                ) : null}

                <div className="flex items-center text-sm text-white">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {t('userprofile.attendee') || 'Attendee'}: {ticket.attendeeName || '—'}
                </div>
              </div>

              {/* Right Column - Ticket Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{t('checkin.ticketCode') || 'Ticket Code'}</span>
                  <span className="text-lg font-mono font-bold text-white bg-white/20 px-3 py-1 rounded">
                    {ticket.ticketCode || '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{t('userprofile.seat') || 'Seat'}</span>
                  <span className="text-lg font-semibold text-white">
                    {ticket.seat || '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{t('userprofile.ticketPrice') || 'Ticket Type'}</span>
                  <span className="text-lg font-semibold text-white">
                    {ticket.ticketPriceInfo?.name || '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{t('userprofile.status') || 'Status'}</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    ticket.status === 'booked' ? 'bg-green-100 text-green-800' :
                    ticket.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-800' :
                    ticket.status === 'hold' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {ticket.status === 'booked' ? (t('userprofile.statusSuccess') || 'Booked') :
                     ticket.status === 'pending_payment' ? (t('userprofile.statusPendingPayment') || 'Pending Payment') :
                     ticket.status === 'hold' ? (t('userprofile.statusHold') || 'Hold') :
                     (t('userprofile.statusCancelled') || 'Cancelled')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gift Form Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
            {t('userprofile.recipientInformation') || 'Recipient Information'}
          </h3>
        </div>

        <form 
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('userprofile.giftTicketForm.firstName')} *
                  </label>
                  <input
                    type="text"
                    {...field}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder={t('userprofile.giftTicketForm.firstName') || 'First Name'}
                    disabled={isSubmitting}
                  />
                  {errors.firstName && (
                    <div className="text-red-500 text-xs mt-1">{errors.firstName.message}</div>
                  )}
                </div>
              )}
            />

            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('userprofile.giftTicketForm.lastName')} *
                  </label>
                  <input
                    type="text"
                    {...field}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder={t('userprofile.giftTicketForm.lastName') || 'Last Name'}
                    disabled={isSubmitting}
                  />
                  {errors.lastName && (
                    <div className="text-red-500 text-xs mt-1">{errors.lastName.message}</div>
                  )}
                </div>
              )}
            />
          </div>

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('userprofile.giftTicketForm.email')} *
                </label>
                <input
                  type="email"
                  {...field}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={t('userprofile.giftTicketForm.email') || 'Email Address'}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <div className="text-red-500 text-xs mt-1">{errors.email.message}</div>
                )}
              </div>
            )}
          />

          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('userprofile.giftTicketForm.phone')}
                </label>
                <input
                  type="tel"
                  {...field}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={t('userprofile.giftTicketForm.phone') || 'Phone Number (Optional)'}
                  disabled={isSubmitting}
                />
                {errors.phone && (
                  <div className="text-red-500 text-xs mt-1">{errors.phone.message}</div>
                )}
              </div>
            )}
          />

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={isSubmitting}
            >
              {t('userprofile.common.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('userprofile.common.processing') : t('userprofile.giftNow')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}