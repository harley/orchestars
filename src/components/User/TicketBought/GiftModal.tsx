'use client'
import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslate } from '@/providers/I18n/client'
import { createPortal } from 'react-dom'
import { useToast } from '@/components/ui/use-toast'

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
  ownerId: number
}

export const GiftModal: React.FC<GiftModalProps> = ({ isOpen, onClose, onSuccess, ticketId, ownerId }) => {
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
      const response = await fetch('/api/tickets/gift-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerId,
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

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t('userprofile.giftTicket')}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        <form 
          onSubmit={handleSubmit(handleFormSubmit)}
          // onSubmit={handleSubmit((data) => {
          //   console.log('Submitting:', data)
          //   return handleFormSubmit(data)
          // })}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('userprofile.giftTicketForm.firstName')} *
                  </label>
                  <input
                    type="text"
                    {...field}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('userprofile.giftTicketForm.lastName')} *
                  </label>
                  <input
                    type="text"
                    {...field}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('userprofile.giftTicketForm.email')} *
                </label>
                <input
                  type="email"
                  {...field}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('userprofile.giftTicketForm.phone')}
                </label>
                <input
                  type="tel"
                  {...field}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                {errors.phone && (
                  <div className="text-red-500 text-xs mt-1">{errors.phone.message}</div>
                )}
              </div>
            )}
          />

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              disabled={isSubmitting}
            >
              {t('userprofile.common.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-black disabled:opacity-50"
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