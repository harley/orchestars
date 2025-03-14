'use client'
import React, { Suspense } from 'react'
import PageClient from '../result/page.client'
import QRDetailComponent from "@/components/EventDetail/QRDetailComponent";

const VietQRPaymentPage = () => {
  return (
    <div className="">
      <PageClient />
      <Suspense fallback={<div>Loading...</div>}>
        <QRDetailComponent />
      </Suspense>
    </div>
  )
}

export default VietQRPaymentPage