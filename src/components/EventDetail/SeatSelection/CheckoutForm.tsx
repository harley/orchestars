'use client'

import React, { useState, useEffect } from 'react'
import { Event } from '@/payload-types'
import { useTranslate } from '@/providers/I18n/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { useToast } from '@/hooks/use-toast'
import { formatMoney } from '@/utilities/formatMoney'
import { Check, Info, Loader2, X } from 'lucide-react'
import axios from 'axios'
import { useSearchParams } from 'next/navigation'

import { PAYMENT_METHODS } from '@/constants/paymentMethod'
import ZalopayIcon from '@/components/Icons/Zalopay'
import PromotionList from './PromotionList'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { SelectedSeat } from '../types'
import { calculateTotalOrder } from '../SeatReservation/SeatMapSelection/utils/calculateTotal'

type FormValues = {
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  transactionCode?: string
}

interface PaymentMethod {
  id: string
  name: string
  icon: React.ReactNode
}

interface CheckoutFormProps {
  selectedSeats: SelectedSeat[]
  event: Event
  onCancel: () => void
  onComplete: () => void
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  selectedSeats,
  event,
  onCancel,
  onComplete,
}) => {
  const { t } = useTranslate()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const eventScheduleId = searchParams?.get('eventScheduleId')

  // Payment method selection
  const paymentMethods: PaymentMethod[] = [
    { id: PAYMENT_METHODS.ZALOPAY, name: 'ZaloPay', icon: <ZalopayIcon /> },
    // Add more payment methods as needed
  ]
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(
    PAYMENT_METHODS.ZALOPAY,
  )

  // Load promotions
  const [promotions, setPromotions] = useState<any[]>([])

  useEffect(() => {
    if (event?.id) {
      fetch(`/api/promotion?eventId=${event.id}`)
        .then((res) => res.json())
        .then((data) => {
          setPromotions(data)
        })
        .catch((err) => {
          console.log('Error while fetching promotions', err)
        })
    }
  }, [event?.id])

  // Promotion code state
  const [promotionCode, setPromotionCode] = useState<string>('')
  const [isSubmittingPromotionForm, setIsSubmittingPromotionForm] = useState<boolean>(false)
  const [promotionInfo, setPromotionInfo] = useState<any | null>(null)

  // Form setup with validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>()

  // Calculate ticket groups for total calculation
  const ticketSelected = React.useMemo(() => {
    return selectedSeats.reduce(
      (obj, item) => {
        const ticketId = item?.ticketPrice?.id
        if (!obj[ticketId]) {
          obj[ticketId] = {
            id: ticketId,
            ticketName: item.ticketPrice?.name,
            seats: [],
            total: 0,
            quantity: 0,
            currency: item.ticketPrice?.currency,
          }
        }
        obj[ticketId].seats.push(item.label)
        obj[ticketId].total += item.ticketPrice?.price || 0
        obj[ticketId].quantity += 1

        return obj
      },
      {} as Record<
        string,
        {
          id: string
          ticketName: string
          seats: string[]
          total: number
          quantity: number
          currency?: string
        }
      >,
    )
  }, [selectedSeats])

  // Validate promotion code
  const checkPromotionCode = async () => {
    try {
      if (!promotionCode) {
        return toast({
          title: t('message.promotionFailed'),
          description: t('message.enterPromoCode'),
          variant: 'destructive',
        })
      }

      setIsSubmittingPromotionForm(true)

      const result = await axios
        .post('/api/promotion', {
          code: promotionCode,
          eventId: event.id,
        })
        .then((res) => res.data)

      toast({
        title: t('message.promotionSuccess'),
        description: t('message.promotionApplied'),
      })

      setPromotionInfo(result)
    } catch (error: any) {
      const messageError = error?.response?.data?.message || t('message.invalidPromoCode')
      toast({
        title: t('message.promotionFailed'),
        description: messageError,
        variant: 'destructive',
      })
    } finally {
      setIsSubmittingPromotionForm(false)
    }
  }

  // Submit form and process payment
  const handleConfirm = async (data: FormValues) => {
    try {
      // Check if eventScheduleId exists
      if (!eventScheduleId) {
        throw new Error('Event schedule ID is missing. Please select a date first.')
      }

      // Prepare order data
      const bodyData = {
        customer: data,
        transaction: {},
        bookingType: 'seat',
        order: {
          currency: 'VND',
          promotionCode: promotionInfo?.code || null,
          orderItems: selectedSeats.map((seat) => ({
            price: seat.ticketPrice?.price || 0,
            quantity: 1,
            seat: seat.label,
            eventId: event.id,
            ticketPriceId: seat.ticketPrice?.id,
            eventScheduleId: eventScheduleId,
          })),
        },
      }

      console.log('Order payload:', JSON.stringify(bodyData, null, 2))

      // Process payment
      const result = await axios
        .post(`/api/${selectedPaymentMethod}/order`, bodyData)
        .then((res) => res.data)

      // Handle response based on payment method
      if (selectedPaymentMethod === PAYMENT_METHODS.ZALOPAY) {
        if (result.order_url) {
          window.location.href = result.order_url
        }
      } else if (selectedPaymentMethod === PAYMENT_METHODS.BANK_TRANSFER) {
        if (result.paymentLink) {
          window.location.href = result.paymentLink
        }
      }

      onComplete()
    } catch (error: any) {
      console.error('Payment error:', error)
      const messageError = error?.response?.data?.message || t('message.errorOccurred')
      toast({
        title: t('message.operationFailed'),
        description: messageError,
        variant: 'destructive',
      })
    }
  }

  const calculatedTotal = calculateTotalOrder(promotionInfo, ticketSelected, event)

  return (
    <div className="flex flex-col md:flex-row bg-black text-white">
      {/* Form section */}
      <div className="p-6 flex-1">
        <h3 className="text-2xl font-bold mb-6">{t('event.recipientInfo')}</h3>

        <form onSubmit={handleSubmit(handleConfirm)}>
          <div className="space-y-4 max-w-xl mb-8">
            <div>
              <Label htmlFor="lastName" className="block mb-1 font-medium">
                {t('event.lastName')}*
              </Label>
              <Input
                id="lastName"
                className="w-full bg-transparent border border-white/30 rounded-md text-white"
                placeholder={t('event.enterLastName')}
                {...register('lastName', { required: t('event.lastNameRequired') })}
              />
              {errors.lastName?.message && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="firstName" className="block mb-1 font-medium">
                {t('event.firstName')}*
              </Label>
              <Input
                id="firstName"
                className="w-full bg-transparent border border-white/30 rounded-md text-white"
                placeholder={t('event.enterFirstName')}
                {...register('firstName', { required: t('event.firstNameRequired') })}
              />
              {errors.firstName?.message && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phoneNumber" className="block mb-1 font-medium">
                {t('event.phoneNumber')}*
              </Label>
              <Input
                id="phoneNumber"
                className="w-full bg-transparent border border-white/30 rounded-md text-white"
                placeholder={t('event.enterPhoneNumber')}
                {...register('phoneNumber', { required: t('event.phoneNumberRequired') })}
              />
              {errors.phoneNumber?.message && (
                <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="block mb-1 font-medium">
                {t('event.email')}*
              </Label>
              <Input
                id="email"
                type="email"
                className="w-full bg-transparent border border-white/30 rounded-md text-white"
                placeholder={t('event.enterEmail')}
                {...register('email', {
                  required: t('event.emailRequired'),
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: t('event.emailInvalidFormat'),
                  },
                })}
              />
              {errors.email?.message && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="mt-6">
              <Label className="block mb-3 font-medium">{t('event.selectPaymentMethod')}</Label>
              <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`flex items-center space-x-2 p-3 border rounded-md cursor-pointer transition-colors ${
                        selectedPaymentMethod === method.id
                          ? 'border-primary bg-white/10'
                          : 'border-white/30 hover:bg-white/5'
                      }`}
                    >
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label
                        htmlFor={method.id}
                        className="flex items-center gap-2 cursor-pointer w-full"
                      >
                        {method.icon}
                        <span>{method.name}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          </div>
        </form>
      </div>

      {/* Order summary */}
      <div className="md:w-96 bg-gray-900 p-6">
        <h3 className="text-2xl font-bold mb-4">{t('event.orderSummary')}</h3>

        <div className="mb-6">
          <h4 className="font-medium mb-2">{t('event.ticketInfo')}</h4>
          <div className="divider h-[1px] bg-white/20 my-4"></div>
          <h4 className="font-medium mb-2">{t('event.selectedSeats')}:</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
            {selectedSeats.map((seat) => (
              <div key={seat.id} className="flex justify-between text-sm">
                <span>
                  {t('event.seat')} {seat.label}
                </span>
                <span>{formatMoney(seat.ticketPrice?.price || 0)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Promotion List */}
        <PromotionList
          promotions={promotions}
          selectedPromotion={promotionInfo}
          onSelectPromotion={(promotion) => {
            setPromotionInfo(promotion)
            setPromotionCode(promotion?.code || '')
          }}
        />

        {/* Coupon code */}
        <div className="mb-6">
          <Label htmlFor="promoCode">{t('event.enterPromoCode')}</Label>
          <div className="grid grid-cols-[1fr,auto] gap-2">
            <Input
              value={promotionCode}
              onChange={(e) => setPromotionCode(e.target.value)}
              placeholder={t('event.enterPromoCode')}
              className="flex-1 bg-transparent border border-white/30 rounded-md text-white"
            />
            <Button
              onClick={checkPromotionCode}
              disabled={isSubmitting || isSubmittingPromotionForm}
              className="bg-gray-800 text-white hover:bg-gray-700 whitespace-nowrap"
            >
              {isSubmittingPromotionForm ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t('event.applyCode')
              )}
            </Button>
          </div>

          {promotionInfo?.appliedTicketClasses?.length > 0 && (
            <div className="italic text-sm mt-2">
              {t('event.promoCodeAppliedTo')}{' '}
              {promotionInfo.appliedTicketClasses.map((tk: any, idx: number) => (
                <React.Fragment key={idx}>
                  <b>{tk.ticketClass}</b>
                  {idx < promotionInfo.appliedTicketClasses.length - 1 && ', '}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Show promotion info if applied */}
        {promotionInfo && promotionInfo.code === promotionCode && (
          <div
            className={`p-4 border rounded-md mb-4 ${
              calculatedTotal.canApplyPromoCode ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {calculatedTotal.canApplyPromoCode ? (
                  <Check className="h-5 w-5 text-green-400" />
                ) : (
                  <X className="h-5 w-5 text-red-400" />
                )}
                <span className="font-medium">
                  {t('event.promoCode')}: {promotionCode}
                </span>
              </div>
              {calculatedTotal.canApplyPromoCode && (
                <span className="text-green-400 font-medium">
                  {promotionInfo.discountType === 'percentage'
                    ? `${promotionInfo.discountValue}%`
                    : formatMoney(promotionInfo.discountValue)}
                </span>
              )}
            </div>
            {!calculatedTotal.canApplyPromoCode && (
              <p className="text-sm text-red-400 mt-1">{t('event.promotionNotMeetConditions')}</p>
            )}
          </div>
        )}

        <div className="divider h-[1px] bg-white/20 my-4"></div>

        {/* Price summary */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between">
            <span>{t('event.totalBeforeDiscount')}</span>
            <span>{formatMoney(calculatedTotal.amountBeforeDiscount)}</span>
          </div>

          {calculatedTotal.amountBeforeDiscount !== calculatedTotal.amount && (
            <div className="flex justify-between text-green-400">
              <span>{t('event.discount')}</span>
              <span>
                -{formatMoney(calculatedTotal.amountBeforeDiscount - calculatedTotal.amount)}
              </span>
            </div>
          )}

          <div className="flex justify-between font-bold text-xl pt-2 border-t border-white/20">
            <span>{t('event.totalAfterDiscount')}</span>
            <span>{formatMoney(calculatedTotal.amount)}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          <Button
            onClick={handleSubmit(handleConfirm)}
            disabled={isSubmitting || isSubmittingPromotionForm}
            className="w-full bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            {t('event.confirmAndPay')}
          </Button>

          <Button
            onClick={onCancel}
            variant="outline"
            disabled={isSubmitting}
            className="w-full border-white/30 text-white hover:bg-gray-800"
          >
            <X className="h-4 w-4 mr-2" />
            {t('event.close')}
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 text-xs text-white/70 flex items-start gap-2">
          <Info size={16} className="min-w-4 mt-0.5" />
          <p>{t('event.paymentTerms')}</p>
        </div>
      </div>
    </div>
  )
}

export default CheckoutForm
