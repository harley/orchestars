"use client"
import React from 'react'
import HomePageComponent from '@/components/home'
import ZaloPayPaymentComponent from '@/components/payment/zalopay'

export default function HomePage() {
  return (
    <div>
      <HomePageComponent />
      <ZaloPayPaymentComponent />
    </div>
  )
}
