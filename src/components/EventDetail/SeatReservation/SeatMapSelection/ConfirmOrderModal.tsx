'use client'

import React, { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Check, Info, X, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { SelectedSeat } from '../../types'
import { useToast } from '@/hooks/use-toast'
import axios from 'axios'
import { Event, Promotion, PromotionConfig } from '@/payload-types'
import { useTranslate } from '@/providers/I18n/client'

import { PAYMENT_METHODS } from '@/constants/paymentMethod'
import { formatMoney } from '@/utilities/formatMoney'
import ZalopayIcon from '@/components/Icons/Zalopay'
// import PromotionList from '../PromotionList'
import { calculateMultiPromotionsTotalOrder, isAppliedPromotion } from './utils/calculateTotal'
import PromotionListCheckbox from '../PromotionListCheckbox'
import { cn } from '@/lib/utils'

interface PaymentMethod {
  id: string
  name: string
  icon: React.ReactNode
}

type FormValues = {
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  transactionCode?: string
}

const ConfirmOrderModal = ({
  event,
  onCloseModal,
  selectedSeats,
  promotions,
  eventScheduleId,
  eventPromotionConfig,
}: {
  event: Event
  onCloseModal: (options?: { resetSeat?: boolean }) => void
  selectedSeats: SelectedSeat[]
  promotions: Promotion[]
  eventScheduleId?: string
  eventPromotionConfig?: PromotionConfig
}) => {
  const { t } = useTranslate()
  const { toast } = useToast()

  const ticketSelected = useMemo(() => {
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

  const paymentMethods: PaymentMethod[] = [
    { id: PAYMENT_METHODS.ZALOPAY, name: '', icon: <ZalopayIcon /> },
    // {
    //   id: PAYMENT_METHODS.BANK_TRANSFER,
    //   name: 'Chuyển khoản ngân hàng (quét mã QR)',
    //   icon: <CreditCard className="h-5 w-5" />,
    // },
  ]

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(
    PAYMENT_METHODS.ZALOPAY,
  )

  const isAllowApplyMultiplePromotions =
    eventPromotionConfig?.validationRules?.allowApplyingMultiplePromotions
  const maxAppliedPromotions = eventPromotionConfig?.validationRules?.maxAppliedPromotions || 1

  const [selectedPromotions, setSelectedPromotions] = useState<Promotion[]>([])

  const {
    register,
    handleSubmit,
    // watch,
    // setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>()

  const handleConfirm = async ({ transactionCode, ...data }: FormValues) => {
    try {
      const bodyData = {
        customer: data,
        transaction: {
          code: transactionCode,
        },
        bookingType: 'seat',
        order: {
          currency: 'VND',
          promotionCode,
          promotionCodes: selectedPromotions.map((promotion) => promotion.code),
          orderItems: selectedSeats.map((seat) => ({
            price: seat.ticketPrice?.price || 0,
            quantity: 1,
            seat: seat.label,
            eventId: seat.eventId,
            ticketPriceId: seat.ticketPrice.id,
            eventScheduleId: eventScheduleId,
          })),
        },
      }

      const result = await axios
        .post(`/api/${selectedPaymentMethod}/order`, bodyData)
        .then((res) => res.data)

      if (selectedPaymentMethod === PAYMENT_METHODS.ZALOPAY) {
        if (result.order_url) {
          window.location.href = result.order_url
        }
      } else if (selectedPaymentMethod === PAYMENT_METHODS.BANK_TRANSFER) {
        if (result.paymentLink) {
          window.location.href = result.paymentLink
        }
      }
    } catch (error: any) {
      console.log('error, ', error)

      const messageError = error?.response?.data?.message || t('message.errorOccurred')
      toast({
        title: t('message.operationFailed'),
        description: messageError,
        variant: 'destructive',
      })
    }
  }

  const [promotionCode, setPromotionCode] = useState<string>('')

  const [isSubmittingPromotionForm, setIsSubmittingPromotionForm] = useState<boolean>(false)
  const checkPromotionCode = async () => {
    if (selectedPromotions.length >= maxAppliedPromotions) {
      return toast({
        title: t('message.promotionFailed'),
        description: t('event.maxPromotions', { count: maxAppliedPromotions }),
        variant: 'destructive',
      })
    }

    try {
      if (!promotionCode) {
        return toast({
          title: t('message.promotionFailed'),
          description: t('message.enterPromoCode'),
          variant: 'destructive',
        })
      }
      setIsSubmittingPromotionForm(true)
      const promotionInfo = await axios
        .post('/api/promotion', {
          code: promotionCode,
          eventId: event.id,
        })
        .then((res) => res.data)

      if (!isAppliedPromotion(promotionInfo, ticketSelected, event)) {
        return toast({
          title: t('message.promotionFailed'),
          description: t('event.promotionNotMeetConditions'),
          variant: 'destructive',
        })
      }

      setSelectedPromotions([...selectedPromotions, promotionInfo])
      toast({
        title: t('message.promotionSuccess'),
        description: t('message.promotionApplied'),
      })
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

  // const calculateTotal = calculateTotalOrder(promotionInfo, ticketSelected, event)

  const calculateTotal = calculateMultiPromotionsTotalOrder(
    selectedPromotions,
    ticketSelected,
    event,
  )

  return (
    <form onSubmit={handleSubmit(handleConfirm)}>
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - User Info & Payment Methods */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">{t('event.recipientInfo')}</h2>

            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="lastName">{t('event.lastName')} *</Label>
                <Input
                  placeholder={t('event.enterLastName')}
                  {...register('lastName', { required: t('event.lastNameRequired') })}
                />
                {errors.lastName?.message && (
                  <p className="text-red-500">{errors.lastName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="firstName">{t('event.firstName')} *</Label>
                <Input
                  placeholder={t('event.enterFirstName')}
                  {...register('firstName', { required: t('event.firstNameRequired') })}
                />
                {errors.firstName?.message && (
                  <p className="text-red-500">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">{t('event.phoneNumber')} *</Label>
                <Input
                  placeholder={t('event.enterPhoneNumber')}
                  {...register('phoneNumber', {
                    required: t('event.phoneNumberRequired'),
                  })}
                />
                {errors.phoneNumber?.message && (
                  <p className="text-red-500">{errors.phoneNumber.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">{t('event.email')} *</Label>
                <Input
                  placeholder={t('event.enterEmail')}
                  {...register('email', {
                    required: t('event.emailRequired'),
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: t('event.emailInvalidFormat'),
                    },
                  })}
                />
                {errors.email?.message && <p className="text-red-500">{errors.email.message}</p>}
              </div>
            </div>

            <Separator className="my-6" />

            <h2 className="text-xl font-semibold mb-4">{t('event.selectPaymentMethod')}</h2>

            <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`flex items-center space-x-2 p-3 border rounded-md cursor-pointer transition-colors ${selectedPaymentMethod === method.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <RadioGroupItem value={method.id} id={method.id} />
                    <Label
                      htmlFor={method.id}
                      className="flex items-center gap-2 cursor-pointer w-full"
                    >
                      {method.icon}
                      {method.name}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Right Column - Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">{t('event.orderSummary')}</h2>

            <div className="mb-6">
              <h3 className="font-medium text-lg mb-2">{t('event.ticketInfo')}</h3>
              <Separator className="my-4" />
              <h4 className="font-medium mb-2">{t('event.selectedSeats')}:</h4>
              {selectedSeats.map((seat) => (
                <div key={seat.id} className="flex justify-between mb-2">
                  <span>
                    {t('event.seat')} {seat.label}
                  </span>
                  <span>{formatMoney(seat.ticketPrice?.price || 0)}</span>
                </div>
              ))}
            </div>

            <PromotionListCheckbox
              promotions={promotions}
              selectedPromotions={selectedPromotions}
              onSelectPromotions={setSelectedPromotions}
              isAllowApplyMultiplePromotions={!!isAllowApplyMultiplePromotions}
              maxAppliedPromotions={maxAppliedPromotions}
              event={event}
              ticketSelected={ticketSelected}
            />

            {/* <PromotionList
              promotions={promotions}
              selectedPromotion={promotionInfo}
              onSelectPromotion={(promotion) => {
                setPromotionInfo(promotion)

                setPromotionCode(promotion?.code || '')
              }}
            /> */}

            <div className="mb-6">
              <Label htmlFor="promoCode">{t('event.enterPromoCode')}</Label>
              <div className="grid md:grid-cols-[1fr,100px] gap-[2px]">
                <Input
                  value={promotionCode}
                  onChange={(e) => setPromotionCode(e.target.value)}
                  placeholder={t('event.promoCode')}
                />
                <Button
                  disabled={isSubmitting || isSubmittingPromotionForm}
                  onClick={checkPromotionCode}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap border border-[#1390d6]  px-3 h-[40px] bg-[#1390d6] hover:bg-[#169eeb] !text-white"
                >
                  {t('event.applyCode')}
                </Button>
              </div>
            </div>

            {selectedPromotions.length > 0 &&
              (calculateTotal.canApplyPromoCode ? (
                <div className="p-4 rounded-lg bg-green-50 border border-green-200 shadow-sm divide-y divide-green-100">
                  {selectedPromotions.map((promotionInfo, index) => (
                    <div
                      key={promotionInfo.id}
                      className={cn(
                        'flex flex-col md:flex-row md:justify-between md:items-center gap-1 md:gap-4 pt-3',
                        index === selectedPromotions.length - 1 ? '' : 'pb-3',
                      )}
                    >
                      <div className="flex items-center gap-2 text-green-700 md:max-w-[166px] w-full">
                        <Check className="h-5 w-5 text-green-600 shrink-0" />
                        <span className="font-semibold text-sm md:text-base md:block flex gap-1">
                          <span className='block'>{t('event.promoCode')}<span className='md:hidden'>:</span></span>
                          <span className="font-medium">{promotionInfo.code}</span>
                        </span>
                      </div>
                      <div className="text-green-700 font-medium text-sm md:text-base text-right md:text-left flex md:flex-col flex-row items-center md:items-end gap-1 md:pl-9 pl-7">
                        <div>
                          {promotionInfo.discountType === 'percentage'
                            ? `${promotionInfo.discountValue}%`
                            : formatMoney(promotionInfo.discountValue, 'VND')}
                        </div>
                        <div className="text-xs text-green-600 font-normal">
                          {promotionInfo.discountApplyScope === 'total_order_value' &&
                            `(${t('event.discountOnTotalOrderValue')})`}
                          {promotionInfo.discountApplyScope === 'per_order_item' &&
                            `(${t('event.discountOnPerOrderItem')})`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 border rounded-md bg-red-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <X className="h-10 w-10 text-red-600" />
                      <span className="font-medium text-sm">
                        {t('event.promotionNotMeetConditions')}: {promotionCode}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

            <Separator className="my-4" />

            {/* Total Amount */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-base font-bold">{t('event.totalBeforeDiscount')}:</span>
              <span className="text-lg font-bold text-primary">
                {formatMoney(calculateTotal.amountBeforeDiscount)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-base font-bold">{t('event.totalAfterDiscount')}:</span>
              <span className="text-lg font-bold text-primary">
                {formatMoney(calculateTotal.amount)}
              </span>
            </div>

            {selectedPaymentMethod === PAYMENT_METHODS.ZALOPAY && (
              <>
                <div className="grid xl:grid-cols-2 grid-cols-1 gap-2">
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 cursor-pointer text-white"
                    disabled={isSubmitting || isSubmittingPromotionForm}
                  >
                    {isSubmitting ? (
                      <Loader2 className={'my-28 h-16 w-16 text-primary/60 animate-spin'} />
                    ) : (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    {t('event.confirmAndPay')}
                  </Button>
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => onCloseModal()}
                    disabled={isSubmitting}
                  >
                    <X className="mr-2 h-4 w-4" /> {t('event.close')}
                  </Button>
                </div>
                <div className="mt-4 flex items-start gap-2 text-sm text-gray-500">
                  <Info className="h-5 w-5 flex-shrink-0 text-gray-400" />
                  <p>{t('event.paymentTerms')}</p>
                </div>
              </>
            )}

            {selectedPaymentMethod === PAYMENT_METHODS.BANK_TRANSFER && (
              <>
                <div className="grid 2xl:grid-cols-2 grid-cols-1 gap-2">
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 cursor-pointer text-white"
                    disabled={isSubmitting || isSubmittingPromotionForm}
                  >
                    {isSubmitting ? (
                      <Loader2 className={'my-28 h-16 w-16 text-primary/60 animate-spin'} />
                    ) : (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    {t('event.confirmAndGoToPayment')}
                  </Button>
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => onCloseModal()}
                    disabled={isSubmitting || isSubmittingPromotionForm}
                  >
                    <X className="mr-2 h-4 w-4" /> {t('event.close')}
                  </Button>
                </div>
                <div className="mt-4 flex items-start gap-2 text-sm text-gray-500">
                  <Info className="h-5 w-5 flex-shrink-0 text-gray-400" />
                  <p>{t('event.bankTransferTerms')}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}

export default ConfirmOrderModal
