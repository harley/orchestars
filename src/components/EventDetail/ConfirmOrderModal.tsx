'use client'

import React, { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Check, CreditCard, Info, X, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { SelectedSeat } from './types'
import { useToast } from '@/hooks/use-toast'
import axios from 'axios'

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
}

const ConfirmOrderModal = ({
  isOpen,
  onCloseModal,
  selectedSeats,
}: {
  isOpen: boolean
  onCloseModal: (open: boolean) => void
  selectedSeats: SelectedSeat[]
}) => {
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

  const calculateTotal = () => {
    return Object.values(ticketSelected).reduce((sum, tk) => sum + tk.total, 0)
  }

  const paymentMethods: PaymentMethod[] = [
    // { id: 'vnpay', name: 'Banking Application (VNPay)', icon: <CreditCard className="h-5 w-5" /> },
    { id: 'zalopay', name: 'ZaloPay', icon: <CreditCard className="h-5 w-5" /> },
    // { id: 'vietqr', name: 'VietQR', icon: <QrCode className="h-5 w-5" /> },
    // { id: 'momo', name: 'Momo Wallet', icon: <CreditCard className="h-5 w-5" /> },
    // { id: 'card', name: 'International Payment Card', icon: <CreditCard className="h-5 w-5" /> },
  ]

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('zalopay')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>()

  const handleConfirm = async (data: FormValues) => {
    try {
      const bodyData = {
        customer: data,
        order: {
          currency: 'VND',
          orderItems: selectedSeats.map((seat) => ({
            price: seat.ticketPrice?.price || 0,
            quantity: 1,
            seat: seat.label,
            eventId: seat.eventId,
            ticketPriceId: seat.ticketPrice.id,
          })),
        },
      }

      const result = await axios
        .post(`/api/${selectedPaymentMethod}/order`, bodyData)
        .then((res) => res.data)

      window.location.href = result.order_url
    } catch (error: any) {
      console.log('error, ', error)
      toast({
        title: 'Payment failed',
        description: error?.response?.return_message || 'Failed to process your payment.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onCloseModal}>
      <DialogContent className="max-w-[90vw] w-full mx-auto my-4 h-[90vh] overflow-y-auto top-0 left-0 bottom-0 right-0 translate-x-0 translate-y-0">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            <h1 className="text-3xl font-bold text-center mb-8">Xác Nhận Đặt Vé Và Thanh Toán</h1>
          </DialogTitle>
          {/* <DialogDescription className="text-center">
        <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 py-2 rounded-md mb-2">
          <Timer className="h-5 w-5" />
          <span>Payment expires in {formatTime(timeRemaining)}</span>
        </div>
      </DialogDescription> */}
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
                      {...register('email', { required: 'Email không được để trống' })}
                    />
                    {errors.email?.message && (
                      <p className="text-red-500">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <Separator className="my-6" />

                <h2 className="text-xl font-semibold mb-4">Chọn phương thức thanh toán</h2>

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
                      <span>
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: seat.ticketPrice?.currency || 'VND',
                        }).format(seat.ticketPrice?.price || 0)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Promo Code Section */}
                {/* <div className="mb-6">
                <Label htmlFor="promoCode">Promotional Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="promoCode"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code"
                  />
                  <Button variant="outline" size="sm" className="whitespace-nowrap">
                    Apply
                  </Button>
                </div>
              </div> */}

                <Separator className="my-4" />

                {/* Total Amount */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-bold">Tổng số tiền:</span>
                  <span className="text-2xl font-bold text-primary">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(calculateTotal() || 0)}{' '}
                  </span>
                </div>

                <div className="grid xl:grid-cols-2 grid-cols-1 gap-2">
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 cursor-pointer text-white"
                    disabled={isSubmitting}
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
                    onClick={() => onCloseModal(false)}
                    disabled={isSubmitting}
                  >
                    <X className="mr-2 h-4 w-4" /> Đóng
                  </Button>
                </div>

                <div className="mt-4 flex items-start gap-2 text-sm text-gray-500">
                  <Info className="h-5 w-5 flex-shrink-0 text-gray-400" />
                  <p>
                    Bằng việc nhấn vào {'"Xác nhận và Thanh toán"'}, bạn đồng ý với Điều khoản Dịch
                    vụ và Chính sách Bảo mật của chúng tôi. Vé của bạn sẽ được gửi qua email sau khi
                    thanh toán thành công.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmOrderModal
