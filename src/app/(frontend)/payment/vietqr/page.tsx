import React from 'react'
import PageClient from '../result/page.client'
import QRDetailComponent from '@/components/EventDetail/QRDetailComponent'
import { generateQrPayment } from './actions/vietqr'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const dynamicParams = true

const VietQRPaymentPage = async (props: { searchParams: Promise<{ transactionKey: string }> }) => {
  const searchParams = await props.searchParams
  const transactionKey = searchParams.transactionKey

  const paymentDetails = await generateQrPayment({ transactionKey })

  if (!paymentDetails) {
    return notFound()
  }

  return (
    <div className="">
      <PageClient />
      <QRDetailComponent paymentDetails={paymentDetails} />
      {/* <Suspense fallback={<div>Loading...</div>}>
        <QRDetailComponent />
      </Suspense> */}
    </div>
  )
}

export default VietQRPaymentPage
