'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Check, CreditCard, QrCode, Timer, Info, X, AlertCircle } from 'lucide-react'
import Header from '@/components/layout/Header'
import { useToast } from '@/hooks/use-toast'

interface PaymentMethod {
  id: string
  name: string
  icon: React.ReactNode
}

const Payment = () => {
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('vnpay')
  const [isQrModalOpen, setIsQrModalOpen] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(300) // 5 minutes in seconds

  const paymentMethods: PaymentMethod[] = [
    { id: 'vnpay', name: 'Banking Application (VNPay)', icon: <CreditCard className="h-5 w-5" /> },
    { id: 'zalopay', name: 'ZaloPay', icon: <CreditCard className="h-5 w-5" /> },
    { id: 'vietqr', name: 'VietQR', icon: <QrCode className="h-5 w-5" /> },
    { id: 'momo', name: 'Momo Wallet', icon: <CreditCard className="h-5 w-5" /> },
    { id: 'card', name: 'International Payment Card', icon: <CreditCard className="h-5 w-5" /> },
  ]

  // Mock order details - in a real app, this would come from global state or API
  const orderDetails = {
    tickets: [
      { type: 'General Admission', price: 89, quantity: 1 },
      { type: 'VIP Experience', price: 149, quantity: 0 },
    ],
    seats: [
      { id: 'A12', type: 'firstClass', price: 250 },
      { id: 'A13', type: 'firstClass', price: 250 },
    ],
    totalAmount: 589,
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const handlePaymentConfirm = () => {
    // Form validation
    if (!name || !phone || !email) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    // Open QR code modal
    setIsQrModalOpen(true)

    // Start countdown timer
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const closeQrModal = () => {
    setIsQrModalOpen(false)
    setTimeRemaining(300) // Reset timer
  }

  const simulatePaymentSuccess = () => {
    setIsQrModalOpen(false)
    toast({
      title: 'Success',
      description: 'Payment successful! Your tickets have been sent to your email.',
      variant: 'default',
    })
    // In a real app, we would redirect to a confirmation page or back to home
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">Complete Your Payment</h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - User Info & Payment Methods */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Ticket Recipient Information</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              <Separator className="my-6" />

              <h2 className="text-xl font-semibold mb-4">Select Payment Method</h2>

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
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <div className="mb-6">
                <h3 className="font-medium text-lg mb-2">Ticket Information</h3>

                {/* Regular tickets summary */}
                {orderDetails.tickets
                  .filter((ticket) => ticket.quantity > 0)
                  .map((ticket, index) => (
                    <div key={index} className="flex justify-between py-2">
                      <span>
                        {ticket.quantity}x {ticket.type}
                      </span>
                      <span>{formatCurrency(ticket.price * ticket.quantity)}</span>
                    </div>
                  ))}

                {/* Selected seats summary */}
                {orderDetails.seats.length > 0 && (
                  <div className="mt-2">
                    <h4 className="font-medium">Selected Seats:</h4>
                    {orderDetails.seats.map((seat) => (
                      <div key={seat.id} className="flex justify-between py-2">
                        <span>
                          Seat {seat.id} ({seat.type})
                        </span>
                        <span>{formatCurrency(seat.price)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Separator className="my-4" />
              </div>

              {/* Promo Code Section */}
              <div className="mb-6">
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
              </div>

              <Separator className="my-4" />

              {/* Total Amount */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold">Total Amount:</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(orderDetails.totalAmount)}
                </span>
              </div>

              <Button
                onClick={handlePaymentConfirm}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-lg py-6"
                size="lg"
              >
                Confirm Payment
              </Button>

              <div className="mt-4 flex items-start gap-2 text-sm text-gray-500">
                <Info className="h-5 w-5 flex-shrink-0 text-gray-400" />
                <p>
                  By clicking {'"Confirm Payment"'}, you agree to our Terms of Service and Privacy
                  Policy. Your tickets will be emailed to you after successful payment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* QR Code Payment Modal */}
      <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              Scan QR Code to Complete Payment
            </DialogTitle>
            <DialogDescription className="text-center">
              <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 py-2 rounded-md mb-2">
                <Timer className="h-5 w-5" />
                <span>Payment expires in {formatTime(timeRemaining)}</span>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6 py-4">
            {/* QR Code */}
            <div className="flex flex-col items-center justify-center">
              <div className="bg-white p-4 border-2 border-dashed border-gray-300 rounded-lg mb-2">
                <QrCode className="h-40 w-40 mx-auto text-gray-800" />
              </div>
              <p className="text-sm text-center text-gray-500">
                Amount: {formatCurrency(orderDetails.totalAmount)}
              </p>
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              <h3 className="font-semibold">How to Pay:</h3>

              <ol className="space-y-3">
                <li className="flex gap-2">
                  <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-sm">
                    1
                  </div>
                  <p>Open your banking application on your phone</p>
                </li>
                <li className="flex gap-2">
                  <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-sm">
                    2
                  </div>
                  <p>Select the QR Code scan icon in the app</p>
                </li>
                <li className="flex gap-2">
                  <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-sm">
                    3
                  </div>
                  <p>Scan the QR Code displayed on this page</p>
                </li>
                <li className="flex gap-2">
                  <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-sm">
                    4
                  </div>
                  <p>Complete the payment in your banking app</p>
                </li>
                <li className="flex gap-2">
                  <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-sm">
                    5
                  </div>
                  <p>Wait for confirmation on this page</p>
                </li>
              </ol>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-2 rounded">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <p>Do not close this window until the payment is confirmed</p>
            </div>

            {/* For demo purposes, adding success button */}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={closeQrModal}>
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button onClick={simulatePaymentSuccess} className="bg-green-600 hover:bg-green-700">
                <Check className="mr-2 h-4 w-4" /> Simulate Success
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


    </div>
  )
}

export default Payment
