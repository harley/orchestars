'use client'

import { Suspense } from 'react'
import PageClient from '../result/page.client'
import QRDetailComponent from '@/components/EventDetail/QRDetailComponent'

const VietQRPaymentPageClient = () => {
  return (
    <div className="">
      <PageClient />
      <Suspense fallback={<div>Loading...</div>}>
        <QRDetailComponent />
      </Suspense>
    </div>
  )
}

export default VietQRPaymentPageClient
