'use client'

import React, { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Check, Info, X, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { SelectedSeat } from '../../types'
import { useToast } from '@/hooks/use-toast'
import axios from 'axios'
import { Event, Promotion } from '@/payload-types'
import { useSearchParams } from 'next/navigation'

import { PAYMENT_METHODS } from '@/constants/paymentMethod'
import { formatMoney } from '@/utilities/formatMoney'
import ZalopayIcon from '@/components/Icons/Zalopay'

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
  isOpen,
  onCloseModal,
  selectedSeats,
}: {
  event: Event
  isOpen: boolean
  onCloseModal: (options?: { resetSeat?: boolean }) => void
  selectedSeats: SelectedSeat[]
}) => {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const eventScheduleId = searchParams.get('eventScheduleId')

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

      const messageError = error?.response?.data?.message || 'Có lỗi xảy ra! Vui lòng thử lại'
      toast({
        title: 'Thao tác không thành công',
        description: messageError,
        variant: 'destructive',
      })
    }
  }

  const [promotionCode, setPromotionCode] = useState<string>('')

  const [isSubmittingPromotionForm, setIsSubmittingPromotionForm] = useState<boolean>(false)
  const [promotionInfo, setPromotionInfo] = useState<Promotion | null>(null)
  const checkPromotionCode = async () => {
    try {
      if (!promotionCode) {
        return toast({
          title: 'Thất bại',
          description: 'Vui lòng nhập mã giảm giá',
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

      console.log('result', promotionInfo)

      toast({
        title: 'Thành công',
        description: 'Đã áp dụng mã giảm giá',
      })

      setPromotionInfo(promotionInfo)
    } catch (error: any) {
      const messageError = error?.response?.data?.message || 'Mã giảm giá không hợp lệ'
      toast({
        title: 'Thất bại',
        description: messageError,
        variant: 'destructive',
      })
    } finally {
      setIsSubmittingPromotionForm(false)
    }
  }

  const calculateTotal = useMemo(() => {
    return Object.values(ticketSelected).reduce((sum, tk) => sum + tk.total, 0) || 0
  }, [ticketSelected])

  const calculateTotalWithPromotion = useMemo(() => {
    if (!promotionInfo) {
      return calculateTotal
    }

    if (promotionInfo.discountType === 'percentage') {
      return calculateTotal - (calculateTotal * promotionInfo.discountValue) / 100
    } else if (promotionInfo.discountType === 'fixed_amount') {
      return calculateTotal - promotionInfo.discountValue
    }

    return calculateTotal
  }, [calculateTotal, promotionInfo])

  return (
    <Dialog open={isOpen} onOpenChange={() => onCloseModal()}>
      <DialogContent className="max-w-[90vw] w-full mx-auto my-4 h-[90vh] overflow-y-auto top-0 left-0 bottom-0 right-0 translate-x-0 translate-y-0">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            <h1 className="text-3xl font-bold text-center mb-8">Xác Nhận Đặt Vé Và Thanh Toán</h1>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleConfirm)}>
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - User Info & Payment Methods */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Thông tin người nhận vé</h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <Label htmlFor="lastName">Họ *</Label>
                    <Input
                      placeholder="Nhập họ của bạn"
                      {...register('lastName', { required: 'Họ không được để trống' })}
                    />
                    {errors.lastName?.message && (
                      <p className="text-red-500">{errors.lastName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="firstName">Tên *</Label>
                    <Input
                      placeholder="Nhập tên của bạn"
                      {...register('firstName', { required: 'Tên không được để trống' })}
                    />
                    {errors.firstName?.message && (
                      <p className="text-red-500">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Số điện thoại *</Label>
                    <Input
                      placeholder="Nhập số điện thoại"
                      {...register('phoneNumber', {
                        required: 'Số điện thoại không được để trống',
                      })}
                    />
                    {errors.phoneNumber?.message && (
                      <p className="text-red-500">{errors.phoneNumber.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      placeholder="Nhập email"
                      {...register('email', {
                        required: 'Email không được để trống',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Email không đúng định dạng',
                        },
                      })}
                    />
                    {errors.email?.message && (
                      <p className="text-red-500">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <Separator className="my-6" />

                <h2 className="text-xl font-semibold mb-4">Thanh Toán Trang Tiếp Theo (QR/Thẻ)</h2>

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
                <h2 className="text-xl font-semibold mb-4">Tóm tắt đơn hàng</h2>

                <div className="mb-6">
                  <h3 className="font-medium text-lg mb-2">Thông tin vé</h3>
                  <Separator className="my-4" />
                  <h4 className="font-medium mb-2">Ghế đã chọn:</h4>
                  {selectedSeats.map((seat) => (
                    <div key={seat.id} className="flex justify-between mb-2">
                      <span>Ghế {seat.label}</span>
                      <span>{formatMoney(seat.ticketPrice?.price || 0)}</span>
                    </div>
                  ))}
                </div>

                <div className="mb-6">
                  <Label htmlFor="promoCode">Nhập mã giảm giá</Label>
                  <div className="grid md:grid-cols-[1fr,100px] gap-[2px]">
                    <Input
                      value={promotionCode}
                      onChange={(e) => setPromotionCode(e.target.value)}
                      placeholder="Mã giảm giá"
                    />
                    <Button
                      disabled={isSubmitting || isSubmittingPromotionForm}
                      onClick={checkPromotionCode}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap border border-[#1390d6]  px-3 h-[40px] bg-[#1390d6] hover:bg-[#169eeb] !text-white"
                    >
                      Dùng mã
                    </Button>
                  </div>
                </div>

                {promotionInfo && (
                  <div className="p-4 border rounded-md bg-green-50">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Mã giảm giá: {promotionCode}</span>
                      </div>
                      <span className="text-green-600 font-medium">
                        {promotionInfo.discountType === 'percentage'
                          ? `${promotionInfo.discountValue}%`
                          : formatMoney(promotionInfo.discountValue)}
                      </span>
                    </div>
                  </div>
                )}

                <Separator className="my-4" />

                {/* Total Amount */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-base font-bold">Tổng số chưa giảm:</span>
                  <span className="text-lg font-bold text-primary">
                    {formatMoney(calculateTotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-base font-bold">Tổng số tiền thanh toán:</span>
                  <span className="text-lg font-bold text-primary">
                    {formatMoney(calculateTotalWithPromotion)}
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
                        Xác nhận và Thanh toán
                      </Button>
                      <Button
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => onCloseModal()}
                        disabled={isSubmitting}
                      >
                        <X className="mr-2 h-4 w-4" /> Đóng
                      </Button>
                    </div>
                    <div className="mt-4 flex items-start gap-2 text-sm text-gray-500">
                      <Info className="h-5 w-5 flex-shrink-0 text-gray-400" />
                      <p>
                        Bằng việc nhấn vào {'"Xác nhận và Thanh toán"'}, bạn đồng ý với Điều khoản
                        Dịch vụ và Chính sách Bảo mật của chúng tôi. Vé của bạn sẽ được gửi qua
                        email sau khi thanh toán thành công.
                      </p>
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
                        Xác nhận và Qua trang thanh toán
                      </Button>
                      <Button
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => onCloseModal()}
                        disabled={isSubmitting || isSubmittingPromotionForm}
                      >
                        <X className="mr-2 h-4 w-4" /> Đóng
                      </Button>
                    </div>
                    <div className="mt-4 flex items-start gap-2 text-sm text-gray-500">
                      <Info className="h-5 w-5 flex-shrink-0 text-gray-400" />
                      <p>
                        Vé của bạn sẽ được gửi qua email sau khi chúng tôi xác nhận thanh toán thành
                        công.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmOrderModal
