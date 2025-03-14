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
import { Event } from '@/payload-types'
import VietQR from './VietQR'
import { BankInformation } from '@/types/BankInformation'
import { PAYMENT_METHODS } from '@/constants/paymentMethod'

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
  // transactionImage?: File
}

const ConfirmOrderModal = ({
  isOpen,
  onCloseModal,
  selectedSeats,
  event,
  bankInformation,
}: {
  isOpen: boolean
  onCloseModal: (options?: { resetSeat?: boolean }) => void
  selectedSeats: SelectedSeat[]
  event: Event
  bankInformation?: BankInformation
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

  const calculateTotal = useMemo(() => {
    return Object.values(ticketSelected).reduce((sum, tk) => sum + tk.total, 0) || 0
  }, [ticketSelected])

  const paymentMethods: PaymentMethod[] = [
    // { id: 'vnpay', name: 'Banking Application (VNPay)', icon: <CreditCard className="h-5 w-5" /> },
    // { id: PAYMENT_METHODS.ZALOPAY, name: 'ZaloPay', icon: <CreditCard className="h-5 w-5" /> },
    // { id: 'vietqr', name: 'VietQR', icon: <QrCode className="h-5 w-5" /> },
    // { id: 'momo', name: 'Momo Wallet', icon: <CreditCard className="h-5 w-5" /> },
    // { id: 'card', name: 'International Payment Card', icon: <CreditCard className="h-5 w-5" /> },
    {
      id: PAYMENT_METHODS.BANK_TRANSFER,
      name: 'Chuyển khoản ngân hàng (quét mã QR)',
      icon: <CreditCard className="h-5 w-5" />,
    },
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

      if (selectedPaymentMethod === PAYMENT_METHODS.ZALOPAY) {
        if (result.order_url) {
          window.location.href = result.order_url
        }
      } else if (selectedPaymentMethod === PAYMENT_METHODS.BANK_TRANSFER) {
        toast({
          title: 'Gửi thành công',
          description: 'Giao dịch của bạn sẽ được kiểm tra và phản hồi lại bạn trong vòng 24 giờ',
          variant: 'default',
        })
        onCloseModal({ resetSeat: true })
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

  const formatTotalMoney = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(calculateTotal)

  const contentBankTransfer = useMemo(
    () =>
      `Thanh toán tiền vé cho ghế ${selectedSeats.map((s) => s.label).join(', ')} tại sự kiện ${event.title}`,
    [selectedSeats, event.title],
  )

  // const transactionImage = watch('transactionImage')

  return (
    <Dialog open={isOpen} onOpenChange={() => onCloseModal()}>
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

                <Separator className="my-4" />

                {/* Total Amount */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-bold">Tổng số tiền:</span>
                  <span className="text-2xl font-bold text-primary">{formatTotalMoney}</span>
                </div>

                {selectedPaymentMethod === PAYMENT_METHODS.BANK_TRANSFER && (
                  <div className="mb-6 p-4 rounded-lg shadow-md bg-gray-50">
                    <h3 className="font-medium text-lg mb-4">Hướng dẫn chuyển khoản</h3>
                    <ol className="list-decimal ml-4 space-y-2 mb-4">
                      <li>Mở ứng dụng ngân hàng của bạn</li>
                      <li>
                        Quét mã QR bên dưới hoặc chuyển khoản theo thông tin:
                        <ul className="list-disc ml-4 mt-2">
                          <li>
                            Ngân hàng: <b>{bankInformation?.bankName}</b>
                          </li>
                          <li>
                            Số tài khoản: <b>{bankInformation?.accountNo}</b>
                          </li>
                          <li>
                            Chủ tài khoản: <b>{bankInformation?.accountName}</b>
                          </li>
                        </ul>
                      </li>
                      <li>Nhập số tiền: {formatTotalMoney}</li>
                      <li>Điền nội dung chuyển khoản như bên dưới</li>

                      <div className="flex justify-center mb-4">
                        <VietQR amount={calculateTotal.toString()} addInfo={contentBankTransfer} />
                      </div>

                      <div className="flex items-center gap-2 bg-white p-2 rounded shadow">
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 mb-2">Nội dung chuyển khoản:</p>
                          <p className="font-medium text-sm">{contentBankTransfer}</p>
                        </div>
                        <Button
                          variant="outline"
                          type="button"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(contentBankTransfer)
                            toast({
                              title: 'Đã sao chép nội dung chuyển khoản',
                              duration: 2000,
                            })
                          }}
                        >
                          <Check className="h-4 w-4" />
                          Copy
                        </Button>
                      </div>

                      <li>Nhập mã giao dịch và chụp hình giao dịch gửi cho chúng tôi</li>
                      <div>
                        <Label htmlFor="lastName">Mã giao dịch *</Label>
                        <Input
                          placeholder="Nhập mã giao dịch"
                          {...register('transactionCode', {
                            required: 'Mã giao dịch không được để trống',
                          })}
                        />
                        {errors.transactionCode?.message && (
                          <p className="text-red-500">{errors.transactionCode.message}</p>
                        )}
                      </div>
                      {/* <div>
                        <Label htmlFor="transactionImage">Hình ảnh giao dịch *</Label>
                        <div className="mt-2 flex items-center justify-center w-full">
                          <label
                            htmlFor="transaction-image"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                          >
                            {!transactionImage || !(transactionImage instanceof File) ? (
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg
                                  className="w-8 h-8 mb-4 text-gray-500"
                                  aria-hidden="true"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 20 16"
                                >
                                  <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                                  />
                                </svg>
                                <p className="mb-2 text-sm text-gray-500">
                                  <span className="font-semibold">Bấm để tải ảnh</span> hoặc kéo thả
                                  vào đây
                                </p>
                                <p className="text-xs text-gray-500">
                                  PNG, JPG hoặc JPEG (Tối đa 5MB)
                                </p>
                              </div>
                            ) : (
                              <img
                                src={URL.createObjectURL(transactionImage)}
                                alt="Preview"
                                className="h-full w-full object-contain"
                              />
                            )}
                            <input
                              id="transaction-image"
                              type="file"
                              className="hidden"
                              accept="image/png, image/jpeg, image/jpg"
                              {...register('transactionImage', {
                                onChange: (e) => {
                                  console.log('e.target?.files', e.target?.files)
                                  setValue('transactionImage', e.target?.files?.[0])
                                },
                              })}
                            />
                          </label>
                        </div>
                        {errors.transactionImage?.message && (
                          <p className="text-red-500 mt-2">{errors.transactionImage.message}</p>
                        )}
                      </div> */}
                    </ol>
                  </div>
                )}

                {selectedPaymentMethod === PAYMENT_METHODS.ZALOPAY && (
                  <>
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
                        Tôi đã chuyển tiền
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
